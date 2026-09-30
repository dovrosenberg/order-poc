import './env';
import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Classification, Customer, Extraction, Flag, LineMatch, PricedLine, InboundRequest } from './domain/types';
import { toSellQty, allocate, homePlantFor, priceLines, floorPrice, lineFlags, quoteFlags } from './domain';
import { classify, extract, match, draft, MODEL } from './llm';
import { loadMasterData, loadRequests } from './load';
import { scoreRun, type RequestRecord } from './score';

const here = dirname(fileURLToPath(import.meta.url));
const arg = (name: string) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : undefined; };
const only = arg('request'), replayDir = arg('replay'), version = arg('prompts') ?? 'v1';
if (arg('model')) process.env.MODEL = arg('model');

const data = loadMasterData(join(here, 'data'));
const requests = loadRequests(join(here, 'data')).filter(r => !only || r.id === only);
const runsDir = join(here, 'runs');
mkdirSync(runsDir, { recursive: true });
const n = readdirSync(runsDir).filter(d => /^run-\d+$/.test(d)).length + 1;
const runDir = join(runsDir, replayDir ? `replay-${replayDir.split(/[\\/]/).filter(Boolean).pop()}` : only ? `scratch-${only}` : `run-${String(n).padStart(2, '0')}`);
mkdirSync(join(runDir, 'raw'), { recursive: true });
mkdirSync(join(runDir, 'prompts'), { recursive: true });

// Unknown sender: price at list-ish tier C, midwest freight. Logged as an assumption.
const fallbackCustomer: Customer = { id: 'UNKNOWN', name: 'Unknown sender', type: 'contractor', tier: 'C', region: 'midwest', emailDomain: '', defaultShipTo: '' };
const findCustomer = (from: string) => data.customers.find(c => from.toLowerCase().includes(`@${c.emailDomain.toLowerCase()}`)) ?? fallbackCustomer;

type Step<T> = { result: T; prompt?: string; raw?: unknown };
interface Steps { classify: Step<Classification>; extract?: Step<Extraction>; match?: Step<LineMatch[]>; draft?: Step<string> }

async function llmSteps(req: InboundRequest): Promise<Steps> {
  if (replayDir) return (JSON.parse(readFileSync(join(replayDir, 'raw', `${req.id}.json`), 'utf8')) as { steps: Steps }).steps;
  const c = await classify(req, version);
  const steps: Steps = { classify: c };
  if (c.result !== 'quote_request' && c.result !== 'reorder') return steps;
  steps.extract = await extract(req, version);
  steps.match = await match(steps.extract.result.lines, data, version);
  return steps;
}

const csvRows: string[][] = [['request_id', 'line', 'text', 'qty', 'unit', 'sku', 'confidence', 'sell_qty', 'sell_unit', 'plants', 'unit_price', 'ext_price', 'flags', 'reason']];
const drafts: string[] = [`# Drafts (${replayDir ? `replay of ${replayDir}` : `model ${MODEL}, prompts ${version}`})`, ''];

for (const req of requests) {
  const steps = await llmSteps(req);
  const record: RequestRecord = { requestId: req.id, classification: steps.classify.result, lines: [], flags: [] };
  if (steps.extract && steps.match) {
    const ex = steps.extract.result, matches = steps.match.result;
    const customer = findCustomer(req.from);
    const extraction: Extraction = { ...ex, shipTo: ex.shipTo ?? (customer.defaultShipTo || null) };
    const base = ex.lines.map((l, i) => {
      const m = matches[i]!;
      const product = data.products.find(p => p.sku === m.sku) ?? null;
      let sellQty = 0;
      if (product && l.qty !== null && l.unit !== null) { try { sellQty = toSellQty(product, l.qty, l.unit); } catch { sellQty = 0; } }
      const alloc = product && sellQty > 0 ? allocate(product.sku, sellQty, data.inventory, homePlantFor(customer.region)) : { allocations: [], shortQty: 0 };
      return { lineIndex: i, product, sellQty, ...alloc };
    });
    const priced = priceLines(base, customer, data.pricing);
    const pricedLines: PricedLine[] = base.map((b, i) => {
      const p = priced.lines[i]!;
      const pl = { lineIndex: i, sku: b.product?.sku ?? null, sellQty: b.sellQty, sellUnit: b.product?.sellUnit ?? null, allocations: b.allocations, shortQty: b.shortQty, unitPrice: p.unitPrice, extPrice: p.extPrice, floorPrice: p.floorPrice };
      return { ...pl, flags: lineFlags(matches[i]!, pl, extraction.needBy, req.receivedAt) };
    });
    const floorPriceBySku = Object.fromEntries(data.products.map(p => [p.sku, floorPrice(p, data.pricing)]));
    const flags: Flag[] = quoteFlags({ extraction, matches, priced: pricedLines, receivedAt: req.receivedAt, floorPriceBySku });
    record.flags = flags;
    ex.lines.forEach((l, i) => {
      const m = matches[i]!, pl = pricedLines[i]!;
      record.lines.push({ text: l.text, qty: l.qty, unit: l.unit, sku: m.sku, reason: m.reason });
      csvRows.push([req.id, String(i + 1), l.text, String(l.qty ?? ''), l.unit ?? '', m.sku ?? '', m.confidence.toFixed(2), String(pl.sellQty), pl.sellUnit ?? '',
        pl.allocations.map(a => `${a.plant}:${a.qty}`).join(';') + (pl.shortQty ? `;SHORT:${pl.shortQty}` : ''), pl.unitPrice.toFixed(2), pl.extPrice.toFixed(2), pl.flags.join(';'), m.reason]);
    });
    if (!steps.draft && !replayDir) {
      const missing = [...(extraction.shipTo ? [] : ['ship-to address']), ...(extraction.needBy ? [] : ['delivery date'])];
      steps.draft = await draft({ email: req, customerName: customer.id === 'UNKNOWN' ? ex.customerName : customer.name,
        lines: ex.lines.map((l, i) => ({ text: l.text, sku: pricedLines[i]!.sku, sellQty: pricedLines[i]!.sellQty, sellUnit: pricedLines[i]!.sellUnit, unitPrice: pricedLines[i]!.unitPrice, extPrice: pricedLines[i]!.extPrice })),
        totals: priced.totals, flags, missing }, version);
    }
    drafts.push(`## ${req.id}: ${req.subject}`, '', `Flags: ${flags.join(', ') || 'none'} | Subtotal $${priced.totals.subtotal.toFixed(2)} | Freight $${priced.totals.freight.toFixed(2)} | Total $${priced.totals.total.toFixed(2)}`, '', steps.draft?.result ?? '(no draft)', '');
  } else {
    drafts.push(`## ${req.id}: ${req.subject}`, '', `Classified as ${steps.classify.result}; no quote drafted.`, '');
  }
  for (const [name, s] of Object.entries(steps) as [string, Step<unknown> | undefined][]) {
    if (s?.prompt) writeFileSync(join(runDir, 'prompts', `${req.id}-${name}.md`), s.prompt);
  }
  writeFileSync(join(runDir, 'raw', `${req.id}.json`), JSON.stringify({ record, steps }, null, 2));
  console.log(`${req.id} ${record.classification.padEnd(13)} lines=${record.lines.length} flags=${record.flags.join(',') || '-'}`);
  if (only) console.dir({ steps: Object.fromEntries(Object.entries(steps).map(([k, v]) => [k, (v as Step<unknown>).result])), record }, { depth: 6 });
}

const q = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
writeFileSync(join(runDir, 'results.csv'), csvRows.map(r => r.map(q).join(',')).join('\n') + '\n');
writeFileSync(join(runDir, 'drafts.md'), drafts.join('\n'));
if (!only) console.log('\n' + scoreRun(runDir));
console.log(`\nWrote ${runDir}`);
