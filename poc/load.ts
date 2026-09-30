import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'csv-parse/sync';
import type {
  Alias, AnswerKeyEntry, Customer, Family, InboundRequest, InventoryRow, MasterData, Plant, Pricing,
  Product, Region, SpecItem, Tier, Unit,
} from './domain/types';

type Row = Record<string, string>;

function csv(dir: string, file: string): Row[] {
  return parse(readFileSync(join(dir, file), 'utf8'), { columns: true, skip_empty_lines: true, trim: true }) as Row[];
}

function col(r: Row, k: string): string {
  const v = r[k];
  if (v === undefined) throw new Error(`Missing column "${k}"`);
  return v;
}

function oneOf<T extends string>(v: string, allowed: readonly T[], what: string): T {
  if ((allowed as readonly string[]).includes(v)) return v as T;
  throw new Error(`Unknown ${what}: "${v}"`);
}

function num(v: string, what: string): number {
  const n = Number(v);
  if (v === '' || Number.isNaN(n)) throw new Error(`Bad number for ${what}: "${v}"`);
  return n;
}

const UNITS = ['EA', 'CASE', 'ROLL', 'SF', 'LF', 'PALLET'] as const;
const FAMILY_MAP: Record<string, Family> = {
  'Pleated Panel': 'pleated', Bag: 'bag', 'Rigid Box': 'box', HEPA: 'hepa',
  Carbon: 'carbon', 'Holding Frame': 'frame', 'Roll Media': 'media',
};
const PLANTS = ['P1', 'P2', 'P3'] as const;
const REGIONS = ['midwest', 'southeast', 'west'] as const;
const TIERS = ['A', 'B', 'C'] as const;

function parseContents(v: string): { unit: Unit; qty: number }[] {
  return v.split('|').map((part) => {
    const m = /^\s*([\d.]+)\s+([A-Z]+)\s*$/.exec(part);
    if (!m) throw new Error(`Bad Contents/Sale Unit: "${v}"`);
    return { qty: num(m[1]!, 'contents qty'), unit: oneOf(m[2]!, UNITS, 'unit') };
  });
}

function loadProducts(dir: string): Product[] {
  return csv(dir, 'products.csv').map((r) => {
    const fam = FAMILY_MAP[col(r, 'Item Class')];
    if (!fam) throw new Error(`Unknown Item Class: "${r['Item Class']}"`);
    const merv = col(r, 'MERV');
    const p: Product = {
      sku: col(r, 'Item Number'),
      name: col(r, 'Display Name'),
      family: fam,
      sellUnit: oneOf(col(r, 'Sale Unit'), UNITS, 'Sale Unit'),
      unitsPerSell: parseContents(col(r, 'Contents/Sale Unit')),
      listPrice: num(col(r, 'List Price'), 'List Price'),
      unitCost: num(col(r, 'Std. Cost'), 'Std. Cost'),
      sellUnitsPerPallet: num(col(r, 'Sale Units/Pallet'), 'Sale Units/Pallet'),
      specNotes: col(r, 'Spec Notes'),
    };
    if (merv !== '') p.merv = num(merv, 'MERV');
    const nom = col(r, 'Nominal Size');
    if (nom !== '') p.nominalSize = nom;
    const act = col(r, 'Actual Size (in)');
    if (act !== '') p.actualSize = act;
    return p;
  });
}

export function loadMasterData(dataDir: string): MasterData {
  const aliases: Alias[] = csv(dataDir, 'aliases.csv').map((r) => ({
    alias: col(r, 'Legacy / Alt Part #'),
    sku: col(r, 'NAF Item Number'),
    source: oneOf(col(r, 'Source'), ['plant2', 'plant3', 'customer'] as const, 'alias Source'),
  }));
  const specs: SpecItem[] = csv(dataDir, 'spec_crosswalk.csv').map((r) => ({
    code: col(r, 'Spec Section'),
    issuer: oneOf(col(r, 'Issuer'), ['school_district', 'hospital', 'municipal'] as const, 'Issuer'),
    description: col(r, 'Requirement'),
    minMerv: num(col(r, 'Min MERV'), 'Min MERV'),
    filterType: oneOf(col(r, 'Filter Type'), ['pleated', 'bag', 'box', 'hepa', 'carbon', 'frame', 'media'] as const, 'Filter Type'),
    acceptableSkus: col(r, 'Acceptable NAF Items').split(';').map((s) => s.trim()).filter((s) => s !== ''),
  }));
  const customers: Customer[] = csv(dataDir, 'customers.csv').map((r) => {
    const c: Customer = {
      id: col(r, 'Customer ID'),
      name: col(r, 'Company Name'),
      type: oneOf(col(r, 'Customer Type'), ['distributor', 'contractor', 'facility_mgmt', 'public_bid'] as const, 'Customer Type'),
      tier: oneOf<Tier>(col(r, 'Price Level'), TIERS, 'Price Level'),
      region: oneOf<Region>(col(r, 'Sales Region'), REGIONS, 'Sales Region'),
      emailDomain: col(r, 'Email Domain'),
      defaultShipTo: col(r, 'Default Ship To'),
    };
    const n = col(r, 'Notes');
    if (n !== '') c.notes = n;
    return c;
  });
  const inventory: InventoryRow[] = csv(dataDir, 'inventory.csv').map((r) => ({
    sku: col(r, 'Item'),
    plant: oneOf<Plant>(col(r, 'Location'), PLANTS, 'Location'),
    onHand: num(col(r, 'On Hand'), 'On Hand'),
    leadTimeDays: num(col(r, 'Lead Time (days)'), 'Lead Time'),
  }));
  const pricing = JSON.parse(readFileSync(join(dataDir, 'pricing.json'), 'utf8')) as Pricing;
  return { products: loadProducts(dataDir), aliases, specs, customers, pricing, inventory };
}

export function loadRequests(dataDir: string): InboundRequest[] {
  return JSON.parse(readFileSync(join(dataDir, 'requests.json'), 'utf8')) as InboundRequest[];
}

export function loadAnswerKey(dataDir: string): AnswerKeyEntry[] {
  return JSON.parse(readFileSync(join(dataDir, 'answer_key.json'), 'utf8')) as AnswerKeyEntry[];
}
