import { describe, expect, it } from 'vitest';
import type { Customer, Extraction, InventoryRow, LineMatch, Pricing, PricedLine, Product } from './types';
import { toSellQty } from './convert';
import { allocate, homePlantFor } from './inventory';
import { floorPrice, priceLines } from './pricing';
import { lineFlags, quoteFlags } from './flags';

const prod = (o: Partial<Product>): Product => ({
  sku: 'X', name: 'x', family: 'pleated', sellUnit: 'CASE', unitsPerSell: [{ unit: 'EA', qty: 12 }],
  listPrice: 100, unitCost: 62.93, sellUnitsPerPallet: 40, specNotes: '', ...o,
});
const pricing: Pricing = {
  tierDiscount: { A: 0.18, B: 0.12, C: 0.05 },
  volumeBreaks: [{ minPallets: 2, extraDiscount: 0.03 }, { minPallets: 5, extraDiscount: 0.05 }],
  freight: { freeOverUsd: 5000, perPalletUsd: { midwest: 95, southeast: 120, west: 165 } },
  floorMarginPct: 0.22,
};
const cust: Customer = {
  id: 'C', name: 'c', type: 'distributor', tier: 'A', region: 'midwest', emailDomain: 'x', defaultShipTo: '',
};

describe('toSellQty', () => {
  const pcase = prod({});
  const roll = prod({ sellUnit: 'ROLL', unitsPerSell: [{ unit: 'SF', qty: 337.5 }, { unit: 'LF', qty: 90 }] });
  const bag = prod({ sellUnit: 'EA', unitsPerSell: [{ unit: 'EA', qty: 1 }] });
  it('converts', () => {
    expect(toSellQty(pcase, 40, 'EA')).toBe(4);
    expect(toSellQty(roll, 900, 'SF')).toBe(3);
    expect(toSellQty(roll, 400, 'LF')).toBe(5);
    expect(toSellQty(bag, 24, 'EA')).toBe(24);
    expect(toSellQty(pcase, 36, 'EA')).toBe(3);
    expect(toSellQty(pcase, 2, 'PALLET')).toBe(80);
    expect(() => toSellQty(pcase, 1, 'LF')).toThrow();
  });
});

describe('allocate', () => {
  const inv: InventoryRow[] = [
    { sku: 'A', plant: 'P1', onHand: 220, leadTimeDays: 3 },
    { sku: 'A', plant: 'P2', onHand: 0, leadTimeDays: 17 },
    { sku: 'A', plant: 'P3', onHand: 180, leadTimeDays: 4 },
  ];
  it('home plant region', () => {
    expect(homePlantFor('midwest')).toBe('P1');
    expect(homePlantFor('southeast')).toBe('P2');
    expect(homePlantFor('west')).toBe('P3');
  });
  it('single plant prefers home, else shortest lead', () => {
    expect(allocate('A', 100, inv, 'P3').allocations).toEqual([{ plant: 'P3', qty: 100, leadTimeDays: 4 }]);
    expect(allocate('A', 100, inv, 'P2').allocations[0]?.plant).toBe('P1');
  });
  it('splits (R06: 300 CASE -> P1 220 + P3 80)', () => {
    const r = allocate('A', 300, inv, 'P1');
    expect(r.allocations.map((a) => [a.plant, a.qty])).toEqual([['P1', 220], ['P3', 80]]);
    expect(r.shortQty).toBe(0);
  });
  it('shortfall', () => {
    const r = allocate('A', 500, inv, 'P1');
    expect(r.shortQty).toBe(100);
    expect(r.allocations).toHaveLength(2);
  });
});

describe('pricing', () => {
  it('floorPrice', () => expect(floorPrice(prod({ unitCost: 62.93 }), pricing)).toBe(80.68));
  it('tier A with 2-pallet break', () => {
    const p = prod({ listPrice: 100, sellUnitsPerPallet: 40 });
    const r = priceLines([{ lineIndex: 0, product: p, sellQty: 41 }, { lineIndex: 1, product: null, sellQty: 5 }], cust, pricing);
    expect(r.totals.pallets).toBe(2);
    expect(r.totals.volumeDiscount).toBe(0.03);
    expect(r.lines[0]?.unitPrice).toBe(79.54);
    expect(r.lines[0]?.extPrice).toBe(3261.14);
    expect(r.lines[1]).toEqual({ lineIndex: 1, unitPrice: 0, extPrice: 0, floorPrice: 0, pallets: 0 });
    expect(r.totals.freight).toBe(190);
    expect(r.totals.total).toBe(3451.14);
  });
  it('free freight over threshold', () => {
    const r = priceLines([{ lineIndex: 0, product: prod({}), sellQty: 100 }], cust, pricing);
    expect(r.totals.subtotal).toBeGreaterThan(5000);
    expect(r.totals.freight).toBe(0);
  });
  it('freight under threshold', () => {
    const r = priceLines([{ lineIndex: 0, product: prod({}), sellQty: 10 }], cust, pricing);
    expect(r.totals.freight).toBe(95);
    expect(r.totals.total).toBe(r.totals.subtotal + 95);
  });
});

describe('flags', () => {
  const recv = '2026-09-28T07:42:00-04:00';
  const ex = (o: Partial<Extraction> = {}): Extraction => ({
    customerName: 'c', shipTo: 's', needBy: '2026-10-30', bidDueAt: null, targetUnitPrice: null,
    lines: [{ text: 't', qty: 1, unit: 'CASE', confidence: 0.9 }],
    fieldConfidence: { customer: 1, shipTo: 1, needBy: 1 }, ...o,
  });
  const m = (o: Partial<LineMatch> = {}): LineMatch => ({
    lineIndex: 0, sku: 'S', alternatives: [], confidence: 0.95, reason: '', substitution: false, ...o,
  });
  const pl = (o: Partial<PricedLine> = {}): PricedLine => ({
    lineIndex: 0, sku: 'S', sellQty: 1, sellUnit: 'CASE', allocations: [{ plant: 'P1', qty: 1, leadTimeDays: 2 }],
    shortQty: 0, unitPrice: 100, extPrice: 100, floorPrice: 80, flags: [], ...o,
  });
  const q = (e: Extraction, ms: LineMatch[], ps: PricedLine[], f: Record<string, number> = {}) =>
    quoteFlags({ extraction: e, matches: ms, priced: ps, receivedAt: recv, floorPriceBySku: f });

  it('clean', () => expect(q(ex(), [m()], [pl()])).toEqual([]));
  it('missing_info', () => {
    expect(q(ex({ shipTo: null }), [m()], [pl()])).toEqual(['missing_info']);
    expect(q(ex({ needBy: null }), [m()], [pl()])).toEqual(['missing_info']);
  });
  it('low_confidence', () => {
    expect(q(ex(), [m({ confidence: 0.5 })], [pl()])).toEqual(['low_confidence']);
    expect(q(ex({ lines: [{ text: 't', qty: 1, unit: 'EA', confidence: 0.6 }] }), [m()], [pl()])).toEqual(['low_confidence']);
  });
  it('no_match', () => expect(q(ex(), [m({ sku: null })], [pl({ sku: null, unitPrice: 0 })])).toEqual(['no_match']));
  it('substitution', () => expect(q(ex(), [m({ substitution: true })], [pl()])).toEqual(['substitution']));
  it('short_stock', () => {
    expect(q(ex(), [m()], [pl({ shortQty: 3 })])).toEqual(['short_stock']);
    expect(q(ex({ needBy: '2026-09-30' }), [m()], [pl({ allocations: [{ plant: 'P2', qty: 1, leadTimeDays: 10 }] })])).toEqual(['short_stock']);
    expect(q(ex({ needBy: 'garbage' }), [m()], [pl({ allocations: [{ plant: 'P2', qty: 1, leadTimeDays: 10 }] })])).toEqual(['missing_info'].slice(1));
  });
  it('bid_deadline', () => {
    expect(q(ex({ bidDueAt: '2026-09-29T12:00:00-04:00' }), [m()], [pl()])).toEqual(['bid_deadline']);
    expect(q(ex({ bidDueAt: '2026-10-05' }), [m()], [pl()])).toEqual([]);
    expect(q(ex({ bidDueAt: '2026-09-27T00:00:00-04:00' }), [m()], [pl()])).toEqual([]);
  });
  it('below_floor (R11: target 72 vs floor 80.68)', () => {
    expect(q(ex({ targetUnitPrice: 72 }), [m({ sku: 'PL-M13-20252' })], [pl({ sku: 'PL-M13-20252' })], { 'PL-M13-20252': 80.68 })).toEqual(['below_floor']);
    expect(q(ex({ targetUnitPrice: 90 }), [m({ sku: 'PL-M13-20252' })], [pl({ sku: 'PL-M13-20252' })], { 'PL-M13-20252': 80.68 })).toEqual([]);
    expect(lineFlags(m(), { ...pl(), unitPrice: 70 }, null, recv)).toEqual(['below_floor']);
  });
});
