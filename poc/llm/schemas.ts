import { z } from 'zod';
import type { Classification, Extraction, LineMatch, Unit } from '../domain/types';

export const UnitSchema = z.enum(['EA', 'CASE', 'ROLL', 'SF', 'LF', 'PALLET']);

export const ClassificationSchema = z.object({
  classification: z.enum(['quote_request', 'order_status', 'reorder', 'other']),
  reason: z.string(),
});

const conf = z.number().min(0).max(1);

export const ExtractionSchema = z.object({
  customerName: z.string().nullable(),
  shipTo: z.string().nullable(),
  needBy: z.string().nullable(),
  bidDueAt: z.string().nullable(),
  targetUnitPrice: z.number().nullable(),
  lines: z.array(z.object({
    text: z.string(),
    qty: z.number().nullable(),
    unit: UnitSchema.nullable(),
    confidence: conf,
  })),
  fieldConfidence: z.object({ customer: conf, shipTo: conf, needBy: conf }),
});

export const LineMatchSchema = z.object({
  lineIndex: z.number().int().min(0),
  sku: z.string().nullable(),
  alternatives: z.array(z.string()),
  confidence: conf,
  reason: z.string(),
  substitution: z.boolean(),
});

export const MatchesSchema = z.object({ matches: z.array(LineMatchSchema) });

// Compile-time checks: fail to typecheck if schema and types.ts drift.
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;
export type _Checks = [
  Assert<Equal<z.infer<typeof ClassificationSchema>['classification'], Classification>>,
  Assert<Equal<z.infer<typeof UnitSchema>, Unit>>,
  Assert<Equal<z.infer<typeof ExtractionSchema>, Extraction>>,
  Assert<Equal<z.infer<typeof LineMatchSchema>, LineMatch>>,
];
