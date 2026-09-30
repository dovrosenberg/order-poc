// Vercel function: the only route from the browser to Anthropic.
// Accepts { step, input } for one of the four LLM steps and runs it with the final (v2) Phase 1 prompts
// through poc/llm, so the prompts, model, max_tokens and Zod validation are the ones Phase 1 used.
// Requires the x-demo-code header to equal DEMO_PASSCODE. The API key is read from ANTHROPIC_API_KEY
// by poc/llm/client.ts and never leaves this process.
import { createHash, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { classify, draft, extract, match, UnitSchema } from '../poc/llm/index.js';
import { loadMasterData } from '../poc/load.js';
import type { MasterData } from '../poc/domain/types.js';

const PROMPT_VERSION = 'v2';
export const MAX_BODY_BYTES = 20_480;

const Email = z.object({
  from: z.string().max(500),
  subject: z.string().max(500),
  receivedAt: z.string().max(40),
  body: z.string().min(1),
  attachmentText: z.string().optional(),
});

const ExtractedLine = z.object({
  text: z.string(), qty: z.number().nullable(), unit: UnitSchema.nullable(), confidence: z.number().min(0).max(1),
});

const Flag = z.enum(['missing_info', 'low_confidence', 'short_stock', 'substitution', 'bid_deadline', 'below_floor', 'no_match']);

const DraftInput = z.object({
  email: Email,
  customerName: z.string().nullable(),
  lines: z.array(z.object({
    text: z.string(), sku: z.string().nullable(), sellQty: z.number(), sellUnit: UnitSchema.nullable(),
    unitPrice: z.number(), extPrice: z.number(),
  })).max(100),
  // poc/run.ts passes all five QuoteTotals fields to the draft prompt, so pallets and volumeDiscount are kept.
  totals: z.object({
    subtotal: z.number(), pallets: z.number().optional(), volumeDiscount: z.number().optional(),
    freight: z.number(), total: z.number(),
  }),
  flags: z.array(Flag),
  missing: z.array(z.string().max(100)).max(10),
});

export const Body = z.discriminatedUnion('step', [
  z.object({ step: z.literal('classify'), input: Email }),
  z.object({ step: z.literal('extract'), input: Email }),
  z.object({ step: z.literal('match'), input: z.array(ExtractedLine).min(1).max(100) }),
  z.object({ step: z.literal('draft'), input: DraftInput }),
]);

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

const digest = (s: string) => createHash('sha256').update(s).digest();

/** Constant-time comparison. Hashing first gives equal-length buffers, so length does not leak either. */
function codeOk(given: string | null): boolean {
  const expected = process.env.DEMO_PASSCODE;
  if (!expected || !given) return false;
  return timingSafeEqual(digest(given), digest(expected));
}

let master: MasterData | undefined;
const masterData = () => (master ??= loadMasterData(fileURLToPath(new URL('../poc/data', import.meta.url))));

const asRequest = (e: z.infer<typeof Email>) => ({ id: 'LIVE', scenarioNote: '', ...e });

export async function POST(req: Request): Promise<Response> {
  // Checked before the body is read, so a caller without the code learns nothing about the input rules.
  if (!codeOk(req.headers.get('x-demo-code'))) return json(401, { error: 'missing or wrong passcode' });

  const text = await req.text();
  if (Buffer.byteLength(text) > MAX_BODY_BYTES) return json(400, { error: `input over ${MAX_BODY_BYTES} bytes` });
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { return json(400, { error: 'body is not JSON' }); }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return json(400, { error: 'expected { step: classify | extract | match | draft, input }' });

  const b = parsed.data;
  try {
    switch (b.step) {
      case 'classify': {
        const r = await classify(asRequest(b.input), PROMPT_VERSION);
        return json(200, { result: r.result, reason: r.reason });
      }
      case 'extract':
        return json(200, { result: (await extract(asRequest(b.input), PROMPT_VERSION)).result });
      case 'match':
        return json(200, { result: (await match(b.input, masterData(), PROMPT_VERSION)).result });
      case 'draft':
        return json(200, { result: (await draft({ ...b.input, email: asRequest(b.input.email) }, PROMPT_VERSION)).result });
    }
  } catch (e) {
    console.error(`api/llm ${b.step} failed:`, e);
    return json(502, { error: `${b.step} step failed` });
  }
}
