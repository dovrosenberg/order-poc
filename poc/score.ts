import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AnswerKeyEntry, Classification, Flag, Unit } from './domain/types.js';
import { loadAnswerKey } from './load.js';

// Shape of the parsed part of runs/run-NN/raw/<id>.json that scoring needs.
export interface ScoredLine { text: string; qty: number | null; unit: Unit | null; sku: string | null; reason: string; }
export interface RequestRecord { requestId: string; classification: Classification; lines: ScoredLine[]; flags: Flag[]; }

type Cause = 'misclassified' | 'wrong_sku' | 'qty_unit' | 'no_line_extracted' | 'extra_line' | 'missing_flag' | 'extra_flag';
interface Miss { requestId: string; cause: Cause; expected: string; got: string; detail: string; }

const here = dirname(fileURLToPath(import.meta.url));

function acceptable(line: AnswerKeyEntry['lines'][number]): Set<string | null> {
  const set = new Set<string | null>([line.sku]);
  const m = line.note?.match(/acceptable:\s*([^;]+(?:,[^;]+)*)/i);
  if (m?.[1]) for (const s of m[1].split(',')) set.add(s.trim());
  return set;
}

export function scoreRecords(records: RequestRecord[], key: AnswerKeyEntry[]) {
  const misses: Miss[] = [];
  let clsHit = 0, skuHit = 0, qtyHit = 0, lineTotal = 0, flagHit = 0, flagTotal = 0;
  for (const ak of key) {
    const rec = records.find(r => r.requestId === ak.requestId);
    const got = rec ?? { requestId: ak.requestId, classification: 'other' as Classification, lines: [], flags: [] };
    if (got.classification === ak.classification) clsHit++;
    else misses.push({ requestId: ak.requestId, cause: 'misclassified', expected: ak.classification, got: got.classification, detail: rec ? '' : 'no record' });

    // Pair answer lines to extracted lines: first by SKU hit, then leftovers in order.
    const pairs: [number, number | null][] = [];
    const used = new Set<number>();
    const pending: number[] = [];
    ak.lines.forEach((l, i) => {
      const acc = acceptable(l);
      const j = l.sku === null ? -1 : got.lines.findIndex((g, gi) => !used.has(gi) && acc.has(g.sku) && g.qty === l.qty && g.unit === l.unit);
      const j2 = j >= 0 ? j : l.sku === null ? -1 : got.lines.findIndex((g, gi) => !used.has(gi) && acc.has(g.sku));
      if (j2 >= 0) { used.add(j2); pairs.push([i, j2]); } else pending.push(i);
    });
    for (const i of pending) {
      const j = got.lines.findIndex((_, gi) => !used.has(gi));
      if (j >= 0) { used.add(j); pairs.push([i, j]); } else pairs.push([i, null]);
    }
    for (const [i, j] of pairs.sort((a, b) => a[0] - b[0])) {
      const l = ak.lines[i]!;
      lineTotal++;
      const exp = `${l.sku ?? 'no match'} ${l.qty} ${l.unit}`;
      if (j === null) { misses.push({ requestId: ak.requestId, cause: 'no_line_extracted', expected: exp, got: '-', detail: '' }); continue; }
      const g = got.lines[j]!;
      const gotStr = `${g.sku ?? 'no match'} ${g.qty ?? '?'} ${g.unit ?? '?'}`;
      if (acceptable(l).has(g.sku)) skuHit++;
      else misses.push({ requestId: ak.requestId, cause: 'wrong_sku', expected: exp, got: gotStr, detail: `"${g.text}" — ${g.reason}` });
      if (g.qty === l.qty && g.unit === l.unit) qtyHit++;
      else misses.push({ requestId: ak.requestId, cause: 'qty_unit', expected: exp, got: gotStr, detail: `"${g.text}"` });
    }
    got.lines.forEach((g, gi) => {
      if (!used.has(gi)) misses.push({ requestId: ak.requestId, cause: 'extra_line', expected: '-', got: `${g.sku ?? 'no match'} ${g.qty ?? '?'} ${g.unit ?? '?'}`, detail: `"${g.text}"` });
    });

    for (const f of ak.expectedFlags) {
      flagTotal++;
      if (got.flags.includes(f)) flagHit++;
      else misses.push({ requestId: ak.requestId, cause: 'missing_flag', expected: f, got: got.flags.join(', ') || '-', detail: '' });
    }
    for (const f of got.flags) {
      if (!ak.expectedFlags.includes(f)) misses.push({ requestId: ak.requestId, cause: 'extra_flag', expected: ak.expectedFlags.join(', ') || '-', got: f, detail: 'not scored' });
    }
  }
  const pct = (a: number, b: number) => (b === 0 ? 'n/a' : `${((100 * a) / b).toFixed(1)}%`);
  const metrics = {
    classification: { hit: clsHit, total: key.length, pct: pct(clsHit, key.length) },
    sku: { hit: skuHit, total: lineTotal, pct: pct(skuHit, lineTotal) },
    qtyUnit: { hit: qtyHit, total: lineTotal, pct: pct(qtyHit, lineTotal) },
    flagRecall: { hit: flagHit, total: flagTotal, pct: pct(flagHit, flagTotal) },
  };
  return { metrics, misses };
}

export function renderScorecard(runName: string, s: ReturnType<typeof scoreRecords>): string {
  const cell = (v: string) => v.replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const m = s.metrics;
  const out = [
    `# Scorecard: ${runName}`, '',
    '| Metric | Hits | Total | Score |', '| --- | --- | --- | --- |',
    `| Classification accuracy | ${m.classification.hit} | ${m.classification.total} | ${m.classification.pct} |`,
    `| SKU match accuracy | ${m.sku.hit} | ${m.sku.total} | ${m.sku.pct} |`,
    `| Quantity/unit accuracy | ${m.qtyUnit.hit} | ${m.qtyUnit.total} | ${m.qtyUnit.pct} |`,
    `| Flag recall | ${m.flagRecall.hit} | ${m.flagRecall.total} | ${m.flagRecall.pct} |`,
    '', `## Misses (${s.misses.length})`, '',
    '| Request | Cause | Expected | Got | Detail |', '| --- | --- | --- | --- | --- |',
    ...s.misses.map(x => `| ${x.requestId} | ${x.cause} | ${cell(x.expected)} | ${cell(x.got)} | ${cell(x.detail)} |`),
    '',
  ];
  return out.join('\n');
}

export function readRecords(runDir: string): RequestRecord[] {
  const rawDir = join(runDir, 'raw');
  return readdirSync(rawDir).filter(f => f.endsWith('.json')).sort()
    .map(f => (JSON.parse(readFileSync(join(rawDir, f), 'utf8')) as { record: RequestRecord }).record);
}

export function scoreRun(runDir: string): string {
  const s = scoreRecords(readRecords(runDir), loadAnswerKey(join(here, 'data')));
  const md = renderScorecard(runDir.split(/[\\/]/).filter(Boolean).pop() ?? runDir, s);
  writeFileSync(join(runDir, 'scorecard.md'), md);
  return md;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dir = process.argv[2];
  if (!dir || !existsSync(join(dir, 'raw'))) { console.error('usage: npm run score -- runs/run-NN'); process.exit(1); }
  console.log(scoreRun(dir));
}
