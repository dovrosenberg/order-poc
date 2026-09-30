// The code steps of poc/run.ts (convert, allocate, price, flag) for one request, as a pure function.
// Uses poc/domain directly so the math is the same code Phase 1 ran.
// quote.test.ts checks this reproduces every row of runs/run-02/results.csv.
import {
  allocate, floorPrice, homePlantFor, lineFlags, priceLines, quoteFlags, toSellQty,
} from '../../../poc/domain';
import type {
  Customer, Extraction, Flag, InboundRequest, LineMatch, MasterData, PricedLine, QuoteTotals, Unit,
} from '../../../poc/domain/types';

// Same fallback as poc/run.ts for a sender not in customers.csv.
const fallbackCustomer: Customer = {
  id: 'UNKNOWN', name: 'Unknown sender', type: 'contractor', tier: 'C', region: 'midwest', emailDomain: '', defaultShipTo: '',
};

export function findCustomer(data: MasterData, from: string): Customer {
  return data.customers.find((c) => from.toLowerCase().includes(`@${c.emailDomain.toLowerCase()}`)) ?? fallbackCustomer;
}

export interface QuoteLineInput { text: string; qty: number | null; unit: Unit | null; match: LineMatch }

export interface QuoteResult {
  customer: Customer;
  shipTo: string | null;
  lines: (PricedLine & { pallets: number })[];
  totals: QuoteTotals;
  flags: Flag[];
}

export function quote(data: MasterData, req: InboundRequest, extraction: Extraction, inputs: QuoteLineInput[]): QuoteResult {
  const customer = findCustomer(data, req.from);
  const ex: Extraction = { ...extraction, shipTo: extraction.shipTo ?? (customer.defaultShipTo || null) };
  const base = inputs.map((l, i) => {
    const product = data.products.find((p) => p.sku === l.match.sku) ?? null;
    let sellQty = 0;
    if (product && l.qty !== null && l.unit !== null) {
      try { sellQty = toSellQty(product, l.qty, l.unit); } catch { sellQty = 0; }
    }
    const alloc = product && sellQty > 0
      ? allocate(product.sku, sellQty, data.inventory, homePlantFor(customer.region))
      : { allocations: [], shortQty: 0 };
    return { lineIndex: i, product, sellQty, ...alloc };
  });
  const priced = priceLines(base, customer, data.pricing);
  const lines = base.map((b, i) => {
    const p = priced.lines[i]!;
    const pl = {
      lineIndex: i, sku: b.product?.sku ?? null, sellQty: b.sellQty, sellUnit: b.product?.sellUnit ?? null,
      allocations: b.allocations, shortQty: b.shortQty, unitPrice: p.unitPrice, extPrice: p.extPrice, floorPrice: p.floorPrice,
    };
    return { ...pl, pallets: p.pallets, flags: lineFlags(inputs[i]!.match, pl, ex.needBy, req.receivedAt) };
  });
  const floorPriceBySku = Object.fromEntries(data.products.map((p) => [p.sku, floorPrice(p, data.pricing)]));
  const matches = inputs.map((l) => l.match);
  const flags = quoteFlags({ extraction: ex, matches, priced: lines, receivedAt: req.receivedAt, floorPriceBySku });
  return { customer, shipTo: ex.shipTo, lines, totals: priced.totals, flags };
}

/** Recorded LLM outputs for a request, as quote() inputs. */
export function recordedInputs(extraction: Extraction, matches: LineMatch[]): QuoteLineInput[] {
  return extraction.lines.map((l, i) => ({ text: l.text, qty: l.qty, unit: l.unit, match: matches[i]! }));
}

/** Same format as the plants column in results.csv. */
export function plantsText(l: PricedLine): string {
  return l.allocations.map((a) => `${a.plant}:${a.qty}`).join(';') + (l.shortQty ? `;SHORT:${l.shortQty}` : '');
}
