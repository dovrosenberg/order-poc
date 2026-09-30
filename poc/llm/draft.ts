import type { Flag, InboundRequest } from '../domain/types.js';
import { callText } from './client.js';
import { emailText } from './classify.js';
import { loadPrompt } from './prompts.js';

export interface DraftInput {
  email: InboundRequest;
  customerName: string | null;
  lines: { text: string; sku: string | null; sellQty: number; sellUnit: string | null; unitPrice: number; extPrice: number }[];
  totals: { subtotal: number; freight: number; total: number };
  flags: Flag[];
  missing: string[];
}

export async function draft(input: DraftInput, version: string) {
  const facts = {
    customerName: input.customerName,
    lines: input.lines,
    totals: input.totals,
    flags: input.flags,
    missing: input.missing,
  };
  const prompt = loadPrompt('draft', version, {
    email: emailText(input.email),
    facts: JSON.stringify(facts, null, 2),
  });
  const { text, raw } = await callText(prompt);
  return { result: text, prompt, raw };
}
