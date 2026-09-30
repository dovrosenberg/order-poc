import type { Extraction, InboundRequest } from '../domain/types';
import { callTool } from './client';
import { emailText } from './classify';
import { loadPrompt } from './prompts';
import { ExtractionSchema } from './schemas';

export async function extract(email: InboundRequest, version: string) {
  const prompt = loadPrompt('extract', version, { email: emailText(email) });
  const { parsed, raw } = await callTool({
    prompt, toolName: 'record_extraction',
    toolDescription: 'Record the customer details and requested line items extracted from the email.',
    schema: ExtractionSchema, maxTokens: 8192,
  });
  const result: Extraction = parsed;
  return { result, prompt, raw };
}
