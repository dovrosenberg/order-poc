import type { Extraction, Flag, LineMatch, PricedLine } from './types.js';

const ORDER: Flag[] = [
  'missing_info', 'low_confidence', 'no_match', 'substitution', 'short_stock', 'bid_deadline', 'below_floor',
];
const DAY_MS = 86_400_000;

function ts(s: string | null | undefined): number | null {
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : t;
}

function dedupe(flags: Flag[]): Flag[] {
  return ORDER.filter((f) => flags.includes(f));
}

export function lineFlags(
  match: LineMatch,
  pl: Omit<PricedLine, 'flags'>,
  needBy: string | null,
  receivedAt: string,
): Flag[] {
  const flags: Flag[] = [];
  if (match.confidence < 0.7) flags.push('low_confidence');
  if (match.sku === null) flags.push('no_match');
  if (match.substitution) flags.push('substitution');
  // A date-only need-by (YYYY-MM-DD) means delivery any time that day, so measure to end of day.
  const need = needBy && /^\d{4}-\d{2}-\d{2}$/.test(needBy) ? ts(`${needBy}T23:59:59Z`) : ts(needBy);
  const recv = ts(receivedAt);
  const days = need !== null && recv !== null ? Math.floor((need - recv) / DAY_MS) : null;
  if (pl.shortQty > 0 || (days !== null && pl.allocations.some((a) => a.leadTimeDays > days))) {
    flags.push('short_stock');
  }
  if (pl.unitPrice > 0 && pl.unitPrice < pl.floorPrice) flags.push('below_floor');
  return dedupe(flags);
}

export function quoteFlags(args: {
  extraction: Extraction;
  matches: LineMatch[];
  priced: PricedLine[];
  receivedAt: string;
  floorPriceBySku: Record<string, number>;
}): Flag[] {
  const { extraction, matches, priced, receivedAt, floorPriceBySku } = args;
  const flags: Flag[] = [];
  if (extraction.shipTo === null || extraction.needBy === null) flags.push('missing_info');
  if (extraction.lines.some((l) => l.confidence < 0.7)) flags.push('low_confidence');

  for (const m of matches) {
    const pl = priced.find((p) => p.lineIndex === m.lineIndex);
    if (pl) {
      const { flags: _ignored, ...rest } = pl;
      flags.push(...lineFlags(m, rest, extraction.needBy, receivedAt));
    } else {
      if (m.confidence < 0.7) flags.push('low_confidence');
      if (m.sku === null) flags.push('no_match');
      if (m.substitution) flags.push('substitution');
    }
  }

  const due = ts(extraction.bidDueAt);
  const recv = ts(receivedAt);
  if (due !== null && recv !== null && due >= recv && due - recv <= 2 * DAY_MS) flags.push('bid_deadline');

  const target = extraction.targetUnitPrice;
  if (target !== null) {
    const skus = new Set<string>();
    for (const m of matches) if (m.sku) skus.add(m.sku);
    for (const p of priced) if (p.sku) skus.add(p.sku);
    for (const s of skus) {
      const fp = floorPriceBySku[s];
      if (fp !== undefined && target < fp) flags.push('below_floor');
    }
  }
  return dedupe(flags);
}
