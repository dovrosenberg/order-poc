// Numbers used in narration, derived from the Phase 1 data so the text cannot drift from the run files.
import { data } from '../data';
import { quote, recordedInputs } from './quote';

const { run1, run2 } = data.runs;

const minutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

function requestQuote(runKey: 'run1' | 'run2', id: string) {
  const rr = data.runs[runKey].requests.find((r) => r.requestId === id);
  const req = data.requests.find((r) => r.id === id);
  const ex = rr?.steps.extract?.result, m = rr?.steps.match?.result;
  if (!rr || !req || !ex || !m) throw new Error(`No recorded quote for ${runKey} ${id}`);
  return { rr, req, ex, q: quote(data.master, req, ex, recordedInputs(ex, m)) };
}

// Chapter 4/5: qty/unit misses, grouped.
const qtyMisses = run1.misses.filter((m) => m.cause === 'qty_unit');
const qtyMissByRequest = qtyMisses.reduce<Record<string, number>>((acc, m) => {
  acc[m.requestId] = (acc[m.requestId] ?? 0) + 1;
  return acc;
}, {});

// Chapter 6: R12 freight defect.
const r12 = requestQuote('run2', 'R12');
const r12Region = r12.q.customer.region;

// Chapter 6: R07 extra short_stock. Lead time of the plant it was allocated to vs days until need-by.
const r07 = requestQuote('run2', 'R07');
const r07Hepa = r07.q.lines[0]!;
const r07Lead = Math.max(...r07Hepa.allocations.map((a) => a.leadTimeDays));
const r07Window = r07.ex.needBy
  ? Math.floor((Date.parse(`${r07.ex.needBy}T23:59:59Z`) - Date.parse(r07.req.receivedAt)) / 86_400_000)
  : null;

// Chapter 7: time box.
const entries = data.log.entries;
const start = data.log.clockStart;
const stop = entries[entries.length - 1]?.time ?? start;
const blockedIdx = entries.findIndex((e) => /blocked/i.test(e.text));
const blocked = blockedIdx >= 0
  ? { from: entries[blockedIdx]!.time, to: entries[blockedIdx + 1]?.time ?? entries[blockedIdx]!.time }
  : null;

const extraFlags = (misses: typeof run1.misses) => misses.filter((m) => m.cause === 'extra_flag');

export const facts = {
  run1, run2,
  expectedLines: data.answerKey.reduce((s, k) => s + k.lines.length, 0),
  qtyMissTotal: qtyMisses.length,
  qtyMissByRequest,
  run1ExtraFlags: extraFlags(run1.misses),
  run2ExtraFlags: extraFlags(run2.misses),
  r12: {
    subtotal: r12.q.totals.subtotal, freight: r12.q.totals.freight, total: r12.q.totals.total,
    pallets: r12.q.totals.pallets, lines: r12.q.lines.length,
    perPallet: data.master.pricing.freight.perPalletUsd[r12Region], region: r12Region,
    volumeDiscount: r12.q.totals.volumeDiscount,
  },
  r07: { lead: r07Lead, window: r07Window, plant: r07Hepa.allocations.map((a) => a.plant).join('+') },
  timeline: {
    start, stop,
    elapsed: minutes(stop) - minutes(start),
    blocked,
    blockedMinutes: blocked ? minutes(blocked.to) - minutes(blocked.from) : 0,
    minutes,
  },
  subtotalOf: (runKey: 'run1' | 'run2', id: string) =>
    data.runs[runKey].requests.find((r) => r.requestId === id)?.totals?.subtotal ?? 0,
};
