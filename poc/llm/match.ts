import type { Alias, ExtractedLine, LineMatch, Product, SpecItem } from '../domain/types';
import { callTool } from './client';
import { loadPrompt } from './prompts';
import { MatchesSchema } from './schemas';

const q = (s: string | number | undefined) => {
  const v = String(s ?? '');
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
};
const csv = (header: string[], rows: (string | number | undefined)[][]) =>
  [header.join(','), ...rows.map((r) => r.map(q).join(','))].join('\n');

export async function match(
  lines: ExtractedLine[],
  ctx: { products: Product[]; aliases: Alias[]; specs: SpecItem[] },
  version: string,
) {
  const products = csv(
    ['sku', 'name', 'family', 'merv', 'nominalSize', 'actualSize', 'sellUnit', 'unitsPerSell', 'specNotes'],
    ctx.products.map((p) => [p.sku, p.name, p.family, p.merv, p.nominalSize, p.actualSize, p.sellUnit,
      p.unitsPerSell.map((u) => `${u.qty} ${u.unit}`).join('; '), p.specNotes]),
  );
  const aliases = csv(['alias', 'sku', 'source'], ctx.aliases.map((a) => [a.alias, a.sku, a.source]));
  const specs = csv(['code', 'issuer', 'description', 'minMerv', 'filterType', 'acceptableSkus'],
    ctx.specs.map((s) => [s.code, s.issuer, s.description, s.minMerv, s.filterType, s.acceptableSkus.join('; ')]));
  const lineText = lines
    .map((l, i) => `${i}: ${l.text} (qty=${l.qty ?? 'unstated'}, unit=${l.unit ?? 'unstated'})`).join('\n');

  const prompt = loadPrompt('match', version, { products, aliases, specs, lines: lineText });
  const { parsed, raw } = await callTool({
    prompt, toolName: 'record_matches',
    toolDescription: 'Record one SKU match per requested line.',
    schema: MatchesSchema, maxTokens: 8192,
  });

  const known = new Set(ctx.products.map((p) => p.sku));
  const result: LineMatch[] = lines.map((_, i) => {
    const m = parsed.matches.find((x) => x.lineIndex === i);
    if (!m) {
      return { lineIndex: i, sku: null, alternatives: [], confidence: 0, reason: '(model returned no match for this line)', substitution: false };
    }
    if (m.sku !== null && !known.has(m.sku)) {
      return { ...m, sku: null, substitution: false, reason: `${m.reason} (model returned unknown SKU ${m.sku})` };
    }
    return m;
  });
  return { result, prompt, raw };
}
