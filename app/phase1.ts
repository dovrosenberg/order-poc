// Vite plugin: reads Phase 1 artifacts at build time (Node) and serves them as `virtual:phase1`.
// Reads only. Nothing under poc/runs/ is written.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'csv-parse/sync';
import type { Plugin } from 'vite';
import { loadAnswerKey, loadMasterData, loadRequests } from '../poc/load';
import { renderScorecard, scoreRecords, type RequestRecord } from '../poc/score';
import type { InboundRequest } from '../poc/domain/types';
import type { CsvTable, DevLog, DevPrompt, LogEntry, Phase1Data, RecordedSteps, RequestResult, ResultRow, RunData } from './src/phase1-types';

const VIRTUAL_ID = 'virtual:phase1';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

const read = (p: string) => readFileSync(p, 'utf8');

function csvTable(file: string): CsvTable {
  const text = read(file);
  const rows = parse(text, { columns: true, skip_empty_lines: true, trim: true }) as Record<string, string>[];
  const columns = (parse(text, { to_line: 1 }) as string[][])[0] ?? [];
  return { columns, rows };
}

function parseDrafts(md: string): Map<string, { header: string; body: string }> {
  const out = new Map<string, { header: string; body: string }>();
  for (const sec of md.split(/^## /m).slice(1)) {
    const id = /^(R\d+):/.exec(sec)?.[1];
    if (!id) continue;
    const rest = sec.slice(sec.indexOf('\n') + 1).trim();
    const nl = rest.indexOf('\n');
    const header = nl < 0 ? rest : rest.slice(0, nl).trim();
    const body = nl < 0 ? '' : rest.slice(nl + 1).trim();
    out.set(id, { header, body });
  }
  return out;
}

function parseTotals(header: string): RequestResult['totals'] {
  const m = /Subtotal \$([\d.]+) \| Freight \$([\d.]+) \| Total \$([\d.]+)/.exec(header);
  return m ? { subtotal: Number(m[1]), freight: Number(m[2]), total: Number(m[3]) } : null;
}

function loadRun(pocDir: string, name: string, dataDir: string): RunData {
  const dir = join(pocDir, 'runs', name);
  const key = loadAnswerKey(dataDir);
  const drafts = parseDrafts(read(join(dir, 'drafts.md')));
  const ids = key.map((k) => k.requestId);

  const raws = ids.map((id) => JSON.parse(read(join(dir, 'raw', `${id}.json`))) as { record: RequestRecord; steps: Record<string, { result: unknown; reason?: string }> });
  const records = raws.map((r) => r.record);
  const scored = scoreRecords(records, key);
  const committed = read(join(dir, 'scorecard.md'));

  // Prompt version as recorded in the drafts header line, e.g. "# Drafts (model ..., prompts v1)".
  const promptVersion = /prompts (v\d+)/.exec(read(join(dir, 'drafts.md')))?.[1] ?? '?';

  const requests: RequestResult[] = raws.map(({ record, steps }) => {
    const d = drafts.get(record.requestId) ?? null;
    // Keep results only; drop full prompts and raw API responses to keep the bundle small.
    const slim = Object.fromEntries(
      Object.entries(steps).map(([k, v]) => [k, v.reason === undefined ? { result: v.result } : { result: v.result, reason: v.reason }]),
    ) as unknown as RecordedSteps;
    return {
      requestId: record.requestId, classification: record.classification, flags: record.flags,
      steps: slim, draft: d, totals: d ? parseTotals(d.header) : null,
    };
  });

  // A line is a miss if the scorer reported a wrong_sku or qty_unit miss whose detail quotes this line's text.
  const missFor = (id: string, cause: string, text: string) =>
    scored.misses.some((m) => m.requestId === id && m.cause === cause && m.detail.startsWith(`"${text}"`));
  const rows: ResultRow[] = (parse(read(join(dir, 'results.csv')), { columns: true, skip_empty_lines: true }) as Record<string, string>[]).map((r) => {
    const id = r.request_id ?? '', text = r.text ?? '';
    return {
      requestId: id, line: Number(r.line), text, qty: r.qty ?? '', unit: r.unit ?? '', sku: r.sku ?? '',
      confidence: Number(r.confidence), sellQty: r.sell_qty ?? '', sellUnit: r.sell_unit ?? '', plants: r.plants ?? '',
      unitPrice: Number(r.unit_price), extPrice: Number(r.ext_price),
      flags: (r.flags ?? '').split(';').filter((f) => f !== ''), reason: r.reason ?? '',
      skuOk: !missFor(id, 'wrong_sku', text), qtyOk: !missFor(id, 'qty_unit', text),
    };
  });

  return {
    name, promptVersion, rows, requests,
    metrics: scored.metrics, misses: scored.misses,
    scorecardMatchesCommitted: renderScorecard(name, scored).trim() === committed.trim(),
  };
}

function parseLog(md: string): Phase1Data['log'] {
  const clockStart = /Clock start: (\d\d:\d\d)/.exec(md)?.[1] ?? '';
  const entries: LogEntry[] = [];
  for (const line of md.split('\n')) {
    const m = /^- \*\*(\d\d:\d\d)\*\* (.*)$/.exec(line);
    if (m) entries.push({ time: m[1]!, text: m[2]! });
    else if (/^\s+- /.test(line) && entries.length > 0) entries[entries.length - 1]!.text += '\n' + line.trim();
  }
  return { clockStart, entries };
}

/** "5:48pm" -> "17:48" */
function to24h(h: string, m: string, ampm: string): string {
  const hour = (Number(h) % 12) + (ampm.toLowerCase() === 'pm' ? 12 : 0);
  return `${String(hour).padStart(2, '0')}:${m}`;
}

/**
 * Parses poc/prompt-log.txt. Format, as the developer wrote it:
 *   line 1: a description of the file
 *   "5:57pm (context): ❯ prompt text" starts a prompt; the context and colon are optional
 *   indented lines continue the prompt
 *   other lines are notes: a note with a clock time stands alone; an untimed note attaches to the
 *   previous prompt, or to the first prompt if none has been seen yet
 */
export function parseDevLog(text: string): DevLog {
  const lines = text.split(/\r?\n/);
  const title = (lines[0] ?? '').trim();
  const prompts: DevPrompt[] = [];
  const notes: LogEntry[] = [];
  let pending: string[] = [];
  let last: DevPrompt | null = null;
  for (const raw of lines.slice(1)) {
    if (raw.trim() === '') continue;
    const start = /^(\d{1,2}):(\d\d)(am|pm)\s*(?:\(([^)]*)\))?\s*:?\s*❯\s*(.*)$/i.exec(raw);
    if (start) {
      last = { time: to24h(start[1]!, start[2]!, start[3]!), context: start[4]?.trim() || null, prompt: start[5]!.trim(), notes: pending };
      pending = [];
      prompts.push(last);
    } else if (/^\s/.test(raw) && last) {
      last.prompt += '\n' + raw.trim();
    } else {
      const t = /(\d{1,2}):(\d\d)\s*(am|pm)/i.exec(raw);
      const note = raw.trim().replace(/^<(.*)>$/, '$1');
      if (t) notes.push({ time: to24h(t[1]!, t[2]!, t[3]!), text: note });
      else if (last) last.notes.push(note);
      else pending.push(note);
    }
  }
  return { title, prompts, notes };
}

export function buildPhase1(pocDir: string, appDir: string): Phase1Data {
  const dataDir = join(pocDir, 'data');
  const steps = ['classify', 'extract', 'match', 'draft'] as const;
  const prompts = (v: string) =>
    Object.fromEntries(steps.map((s) => [s, read(join(pocDir, 'prompts', v, `${s}.md`))])) as Phase1Data['prompts']['v1'];
  return {
    master: loadMasterData(dataDir),
    tables: {
      products: csvTable(join(dataDir, 'products.csv')),
      aliases: csvTable(join(dataDir, 'aliases.csv')),
      spec_crosswalk: csvTable(join(dataDir, 'spec_crosswalk.csv')),
      customers: csvTable(join(dataDir, 'customers.csv')),
      inventory: csvTable(join(dataDir, 'inventory.csv')),
    },
    requests: loadRequests(dataDir),
    samples: JSON.parse(read(join(dataDir, 'sample_emails.json'))) as InboundRequest[],
    answerKey: loadAnswerKey(dataDir),
    prompts: { v1: prompts('v1'), v2: prompts('v2') },
    runs: { run1: loadRun(pocDir, 'run-01', dataDir), run2: loadRun(pocDir, 'run-02', dataDir) },
    log: parseLog(read(join(pocDir, 'LOG.md'))),
    devLog: existsSync(join(pocDir, 'prompt-log.txt')) ? parseDevLog(read(join(pocDir, 'prompt-log.txt'))) : null,
    flagsFixDiff: read(join(appDir, 'src', 'content', 'flags-fix.diff')),
  };
}

export function phase1Plugin(pocDir: string, appDir: string): Plugin {
  return {
    name: 'phase1-data',
    resolveId: (id) => (id === VIRTUAL_ID ? RESOLVED_ID : undefined),
    load(id) {
      if (id !== RESOLVED_ID) return undefined;
      return `export default ${JSON.stringify(buildPhase1(pocDir, appDir))};`;
    },
    configureServer(server) {
      // Reload the data module if a Phase 1 input changes during dev.
      server.watcher.add([join(pocDir, 'data'), join(pocDir, 'runs'), join(pocDir, 'LOG.md'), join(pocDir, 'prompts'), join(pocDir, 'prompt-log.txt')]);
      server.watcher.on('change', (file) => {
        if (!file.startsWith(pocDir)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) { server.moduleGraph.invalidateModule(mod); server.ws.send({ type: 'full-reload' }); }
      });
    },
  };
}
