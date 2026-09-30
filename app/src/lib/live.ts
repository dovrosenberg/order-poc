// Live mode: the passcode and the calls to /api/llm.
// The passcode is held in this module's memory only. It is never written to storage, and it is
// removed from the address bar as soon as it is read.
import { readonly, ref } from 'vue';
import { z } from 'zod';
import { ClassificationSchema, ExtractionSchema, LineMatchSchema } from '../../../poc/llm/schemas';
import type { ExtractedLine, Extraction, Flag, InboundRequest, LineMatch, QuoteTotals } from '../../../poc/domain/types';

const code = ref<string | null>(null);
export const liveCode = readonly(code);

/** Reads ?code= on load, keeps it in memory, and strips it from the URL (the hash route is kept). */
export function takeCodeFromUrl(): void {
  const url = new URL(window.location.href);
  const c = url.searchParams.get('code');
  if (c === null) return;
  url.searchParams.delete('code');
  window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
  if (c) code.value = c;
}

export class LiveError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function post(step: string, input: unknown, c: string | null = code.value): Promise<unknown> {
  const res = await fetch('/api/llm', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-demo-code': c ?? '' },
    body: JSON.stringify({ step, input }),
  });
  if (res.status === 401 && c === code.value) code.value = null;
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new LiveError(body.error ?? `HTTP ${res.status}`, res.status);
  return body;
}

/**
 * Checks a code without a model call. The function checks the passcode before it reads the body,
 * so an empty request gets 401 for a wrong code and 400 for a right one.
 */
export async function unlock(c: string): Promise<boolean> {
  try {
    await post('check', null, c);
  } catch (e) {
    if (!(e instanceof LiveError) || e.status !== 400) return false;
  }
  code.value = c;
  return true;
}

export function lock(): void { code.value = null; }

export type EmailInput = Pick<InboundRequest, 'from' | 'subject' | 'receivedAt' | 'body' | 'attachmentText'>;

/** Same shape as DraftInput in poc/llm/draft.ts (not imported: that module pulls in the Anthropic client). */
export interface DraftFacts {
  email: EmailInput;
  customerName: string | null;
  lines: { text: string; sku: string | null; sellQty: number; sellUnit: string | null; unitPrice: number; extPrice: number }[];
  totals: QuoteTotals;
  flags: Flag[];
  missing: string[];
}

// Responses are validated again here with the Phase 1 schemas.
export const live = {
  classify: async (email: EmailInput) =>
    z.object({ result: ClassificationSchema.shape.classification, reason: z.string() }).parse(await post('classify', email)),
  extract: async (email: EmailInput): Promise<Extraction> =>
    z.object({ result: ExtractionSchema }).parse(await post('extract', email)).result,
  match: async (lines: ExtractedLine[]): Promise<LineMatch[]> =>
    z.object({ result: z.array(LineMatchSchema) }).parse(await post('match', lines)).result,
  draft: async (input: DraftFacts): Promise<string> =>
    z.object({ result: z.string() }).parse(await post('draft', input)).result,
};
