import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { loadAnswerKey, loadMasterData, loadRequests } from './load.js';

const dir = join(import.meta.dirname, 'data');

describe('load', () => {
  const md = loadMasterData(dir);
  const skus = new Set(md.products.map((p) => p.sku));
  it('counts', () => {
    expect(md.products).toHaveLength(41);
    expect(md.aliases).toHaveLength(53);
    expect(md.specs).toHaveLength(18);
    expect(md.customers).toHaveLength(12);
    expect(md.inventory).toHaveLength(123);
    expect(loadRequests(dir).length).toBeGreaterThan(0);
    expect(loadAnswerKey(dir).length).toBeGreaterThan(0);
  });
  it('referential integrity', () => {
    for (const a of md.aliases) expect(skus.has(a.sku), a.sku).toBe(true);
    for (const s of md.specs) for (const k of s.acceptableSkus) expect(skus.has(k), k).toBe(true);
    for (const i of md.inventory) expect(skus.has(i.sku), i.sku).toBe(true);
    for (const r of loadAnswerKey(dir)) for (const l of r.lines) if (l.sku) expect(skus.has(l.sku), l.sku).toBe(true);
  });
  it('rolls have SF and LF', () => {
    const rolls = md.products.filter((p) => p.sellUnit === 'ROLL');
    expect(rolls.length).toBeGreaterThan(0);
    for (const p of rolls) {
      const u = p.unitsPerSell.map((x) => x.unit);
      expect(u).toContain('SF');
      expect(u).toContain('LF');
    }
  });
});
