export type Unit = 'EA' | 'CASE' | 'ROLL' | 'SF' | 'LF' | 'PALLET';

export type Family = 'pleated' | 'bag' | 'box' | 'hepa' | 'carbon' | 'frame' | 'media';

export interface Product {
  sku: string;            // e.g. "PL-M13-20252"
  name: string;
  family: Family;
  merv?: number;
  nominalSize?: string;   // "20x25x2"
  actualSize?: string;    // "19.5x24.5x1.75"
  sellUnit: Unit;         // unit priced and shipped
  unitsPerSell: { unit: Unit; qty: number }[]; // e.g. [{ unit: 'EA', qty: 12 }] or [{ unit: 'SF', qty: 337.5 }]
  listPrice: number;      // USD per sellUnit
  unitCost: number;       // USD per sellUnit
  sellUnitsPerPallet: number;
  specNotes: string;      // efficiency, initial resistance, frame type
}

export interface Alias { alias: string; sku: string; source: 'plant2' | 'plant3' | 'customer'; }

export interface SpecItem {
  code: string;           // e.g. "23 41 00 / 2.2.B"
  issuer: 'school_district' | 'hospital' | 'municipal';
  description: string; minMerv: number; filterType: Family;
  acceptableSkus: string[];
}

export type Region = 'midwest' | 'southeast' | 'west';
export type Tier = 'A' | 'B' | 'C';

export interface Customer {
  id: string; name: string;
  type: 'distributor' | 'contractor' | 'facility_mgmt' | 'public_bid';
  tier: Tier; region: Region;
  emailDomain: string; defaultShipTo: string; notes?: string;
}

export interface Pricing {
  tierDiscount: Record<Tier, number>;                         // e.g. { A: 0.18, B: 0.12, C: 0.05 }
  volumeBreaks: { minPallets: number; extraDiscount: number }[];
  freight: { freeOverUsd: number; perPalletUsd: Record<Region, number> };
  floorMarginPct: number;                                     // e.g. 0.22
}

export type Plant = 'P1' | 'P2' | 'P3';

export interface InventoryRow { sku: string; plant: Plant; onHand: number; leadTimeDays: number; }

export interface InboundRequest {
  id: string; receivedAt: string; from: string; subject: string;
  body: string; attachmentText?: string;  // bid tab or equipment schedule already converted to text
  scenarioNote: string;                   // what this email is designed to test (viewer only, never sent to the LLM)
}

export type Classification = 'quote_request' | 'order_status' | 'reorder' | 'other';

export type Flag =
  | 'missing_info' | 'low_confidence' | 'short_stock' | 'substitution'
  | 'bid_deadline' | 'below_floor' | 'no_match';

export interface AnswerKeyEntry {
  requestId: string;
  classification: Classification;
  lines: { sku: string | null; qty: number; unit: Unit; note?: string }[]; // sku null = no valid match
  expectedFlags: Flag[];
}
