import type { Allocation, InventoryRow, Plant, Region } from './types';

export function homePlantFor(region: Region): Plant {
  switch (region) {
    case 'midwest': return 'P1';
    case 'southeast': return 'P2';
    case 'west': return 'P3';
  }
}

export function allocate(
  sku: string,
  qty: number,
  inventory: InventoryRow[],
  homePlant: Plant,
): { allocations: Allocation[]; shortQty: number } {
  const rows = inventory.filter((r) => r.sku === sku && r.onHand > 0);
  if (qty <= 0) return { allocations: [], shortQty: 0 };
  const ok = rows.filter((r) => r.onHand >= qty);
  if (ok.length > 0) {
    const pick =
      ok.find((r) => r.plant === homePlant) ??
      [...ok].sort((a, b) => a.leadTimeDays - b.leadTimeDays)[0]!;
    return { allocations: [{ plant: pick.plant, qty, leadTimeDays: pick.leadTimeDays }], shortQty: 0 };
  }
  const allocations: Allocation[] = [];
  let remaining = qty;
  for (const r of [...rows].sort((a, b) => b.onHand - a.onHand)) {
    if (remaining <= 0) break;
    const take = Math.min(r.onHand, remaining);
    allocations.push({ plant: r.plant, qty: take, leadTimeDays: r.leadTimeDays });
    remaining -= take;
  }
  return { allocations, shortQty: remaining };
}
