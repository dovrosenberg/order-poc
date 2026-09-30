import type { Product, Unit } from './types';

export function toSellQty(p: Product, qty: number, unit: Unit): number {
  if (unit === p.sellUnit) return qty;
  const u = p.unitsPerSell.find((x) => x.unit === unit);
  if (u) return Math.ceil(qty / u.qty - 1e-9);
  if (unit === 'PALLET') return qty * p.sellUnitsPerPallet;
  throw new Error(`Cannot convert ${unit} to ${p.sellUnit} for ${p.sku}`);
}
