import type { Classification, InboundRequest } from '../domain/types.js';
import { callTool } from './client.js';
import { loadPrompt } from './prompts.js';
import { ClassificationSchema } from './schemas.js';

/** Email text sent to the model. Never includes scenarioNote. */
export function emailText(e: InboundRequest): string {
  const parts = [`From: ${e.from}`, `Subject: ${e.subject}`, `Received: ${e.receivedAt}`, '', e.body];
  if (e.attachmentText) parts.push('', '--- Attachment (text) ---', e.attachmentText);
  return parts.join('\n');
}

export async function classify(email: InboundRequest, version: string) {
  const prompt = loadPrompt('classify', version, { email: emailText(email) });
  const { parsed, raw } = await callTool({
    prompt, toolName: 'record_classification',
    toolDescription: 'Record the classification of the inbound email.',
    schema: ClassificationSchema,
  });
  const result: Classification = parsed.classification;
  return { result, reason: parsed.reason, prompt, raw };
}
