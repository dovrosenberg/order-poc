import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export type Step = 'classify' | 'extract' | 'match' | 'draft';

export function loadPrompt(step: Step, version: string, vars: Record<string, string>): string {
  const file = fileURLToPath(new URL(`../prompts/${version}/${step}.md`, import.meta.url));
  let text = readFileSync(file, 'utf8');
  for (const [k, v] of Object.entries(vars)) text = text.split(`{{${k}}}`).join(v);
  const left = text.match(/\{\{\s*\w+\s*\}\}/g);
  if (left) throw new Error(`Unfilled placeholders in ${step}/${version}: ${[...new Set(left)].join(', ')}`);
  return text;
}
