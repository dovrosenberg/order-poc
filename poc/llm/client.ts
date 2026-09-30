import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

export const MODEL = process.env.MODEL ?? 'claude-sonnet-5-5';

let client: Anthropic | undefined;
function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set (put it in poc/.env or the environment).');
    client = new Anthropic({ apiKey });
  }
  return client;
}

export interface CallToolOpts<T> {
  prompt: string;
  system?: string;
  toolName: string;
  toolDescription: string;
  schema: z.ZodType<T>;
  maxTokens?: number;
}

// temperature is not sent: models after Opus 4.6 reject values other than 1.0.
export async function callTool<T>(opts: CallToolOpts<T>): Promise<{ parsed: T; raw: unknown[] }> {
  const { schema, toolName } = opts;
  const { $schema: _omit, ...jsonSchema } = z.toJSONSchema(schema) as Record<string, unknown>;
  const raws: unknown[] = [];
  let prompt = opts.prompt;
  let lastError = '';
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await getClient().messages.create({
      model: MODEL,
      max_tokens: opts.maxTokens ?? 4096,
      ...(opts.system ? { system: opts.system } : {}),
      messages: [{ role: 'user', content: prompt }],
      tools: [{
        name: toolName,
        description: opts.toolDescription,
        input_schema: jsonSchema as Anthropic.Tool.InputSchema,
      }],
      tool_choice: { type: 'tool', name: toolName },
    });
    raws.push(res);
    const block = res.content.find((b) => b.type === 'tool_use' && b.name === toolName);
    if (!block || block.type !== 'tool_use') {
      lastError = `No ${toolName} tool_use block in response (stop_reason=${res.stop_reason}).`;
    } else {
      const r = schema.safeParse(block.input);
      if (r.success) return { parsed: r.data, raw: raws };
      lastError = z.prettifyError(r.error);
    }
    prompt = `${opts.prompt}\n\nYour previous answer failed validation:\n${lastError}\nCall the tool again with corrected input.`;
  }
  throw new Error(`callTool(${toolName}) failed validation after retry: ${lastError}`);
}

export async function callText(
  prompt: string, system?: string, maxTokens = 1500,
): Promise<{ text: string; raw: unknown }> {
  const res = await getClient().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    ...(system ? { system } : {}),
    messages: [{ role: 'user', content: prompt }],
  });
  const text = res.content.map((b) => (b.type === 'text' ? b.text : '')).join('').trim();
  return { text, raw: res };
}
