import type { Customer, Pricing, Product, QuoteTotals } from './types.js';

const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

export function floorPrice(p: Product, pricing: Pricing): number {
  return round2(p.unitCost / (1 - pricing.floorMarginPct));
}

export interface PriceLineInput { lineIndex: number; product: Product | null; sellQty: number; }
export interface PriceLineOutput {
  lineIndex: number; unitPrice: number; extPrice: number; floorPrice: number; pallets: number;
}

export function priceLines(
  lines: PriceLineInput[],
  customer: Customer,
  pricing: Pricing,
): { lines: PriceLineOutput[]; totals: QuoteTotals } {
  const palletsOf = (l: PriceLineInput): number =>
    l.product ? Math.ceil(l.sellQty / l.product.sellUnitsPerPallet - 1e-9) : 0;
  const pallets = lines.reduce((s, l) => s + palletsOf(l), 0);
  const volume = pricing.volumeBreaks
    .filter((b) => b.minPallets <= pallets)
    .reduce((m, b) => Math.max(m, b.extraDiscount), 0);
  const tier = pricing.tierDiscount[customer.tier];

  const out: PriceLineOutput[] = lines.map((l) => {
    if (!l.product) return { lineIndex: l.lineIndex, unitPrice: 0, extPrice: 0, floorPrice: 0, pallets: 0 };
    const unitPrice = round2(l.product.listPrice * (1 - tier) * (1 - volume));
    return {
      lineIndex: l.lineIndex,
      unitPrice,
      extPrice: round2(unitPrice * l.sellQty),
      floorPrice: floorPrice(l.product, pricing),
      pallets: palletsOf(l),
    };
  });
  const subtotal = round2(out.reduce((s, l) => s + l.extPrice, 0));
  const freight =
    subtotal > pricing.freight.freeOverUsd ? 0 : round2(pallets * pricing.freight.perPalletUsd[customer.region]);
  return {
    lines: out,
    totals: { subtotal, pallets, volumeDiscount: volume, freight, total: round2(subtotal + freight) },
  };
}
