import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildPhase1 } from '../../phase1';
import { plantsText, quote, recordedInputs } from './quote';

const appDir = fileURLToPath(new URL('../..', import.meta.url)).replace(/[\\/]$/, '');
const pocDir = fileURLToPath(new URL('../../../poc', import.meta.url)).replace(/[\\/]$/, '');
const data = buildPhase1(pocDir, appDir);

describe('phase1 data', () => {
  it('recomputed scorecards match the committed scorecard.md files', () => {
    expect(data.runs.run1.scorecardMatchesCommitted).toBe(true);
    expect(data.runs.run2.scorecardMatchesCommitted).toBe(true);
  });

  it('per-line miss marks agree with the scorecard counts', () => {
    for (const run of [data.runs.run1, data.runs.run2]) {
      const skuMisses = run.misses.filter((m) => m.cause === 'wrong_sku').length;
      const qtyMisses = run.misses.filter((m) => m.cause === 'qty_unit').length;
      expect(run.rows.filter((r) => !r.skuOk).length).toBe(skuMisses);
      expect(run.rows.filter((r) => !r.qtyOk).length).toBe(qtyMisses);
    }
  });
});

// run-01 was produced before the 18:09 need-by fix in poc/domain/flags.ts. LOG.md 18:09: replaying run-01
// with the fix clears the R04 short_stock flag and changes no other flag.
const KNOWN_DIFFS: Record<string, string[]> = { 'run-01 R04': ['short_stock'] };

describe('quote() reproduces recorded runs', () => {
  for (const run of [data.runs.run1, data.runs.run2]) {
    for (const rr of run.requests) {
      const ex = rr.steps.extract?.result, m = rr.steps.match?.result;
      if (!ex || !m) continue;
      it(`${run.name} ${rr.requestId}`, () => {
        const req = data.requests.find((r) => r.id === rr.requestId)!;
        const q = quote(data.master, req, ex, recordedInputs(ex, m));
        const rows = run.rows.filter((r) => r.requestId === rr.requestId);
        expect(q.lines.length).toBe(rows.length);
        const removed = KNOWN_DIFFS[`${run.name} ${rr.requestId}`] ?? [];
        q.lines.forEach((l, i) => {
          const row = { ...rows[i]!, flags: rows[i]!.flags.filter((f) => !removed.includes(f)) };
          expect(l.sku ?? '').toBe(row.sku);
          expect(String(l.sellQty)).toBe(row.sellQty);
          expect(l.unitPrice).toBe(row.unitPrice);
          expect(l.extPrice).toBe(row.extPrice);
          expect(plantsText(l)).toBe(row.plants);
          expect(l.flags).toEqual(row.flags);
        });
        expect(q.flags).toEqual(rr.flags.filter((f) => !removed.includes(f)));
        expect(rr.totals).not.toBeNull();
        expect(q.totals.subtotal).toBe(rr.totals!.subtotal);
        expect(q.totals.freight).toBe(rr.totals!.freight);
        expect(q.totals.total).toBe(rr.totals!.total);
      });
    }
  }
});

describe('prompt log', () => {
  it('parses poc/prompt-log.txt into timed prompts', () => {
    const d = data.devLog!;
    expect(d.prompts.map((p) => p.time)).toEqual(['17:48', '17:53', '17:55', '17:57', '18:02', '18:04', '18:09']);
    expect(d.prompts[3]!.notes).toHaveLength(1);
    expect(d.prompts[0]!.notes).toHaveLength(1);
    expect(d.notes).toEqual([{ time: '18:13', text: 'POC FINISHED AT 6:13pm' }]);
    expect(d.prompts[0]!.prompt).toContain('Commit.');
  });
});
