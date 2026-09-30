<script setup lang="ts">
import { data } from '../data';

const lineTotal = data.answerKey.reduce((n, k) => n + k.lines.length, 0);
const flagTotal = data.answerKey.reduce((n, k) => n + k.expectedFlags.length, 0);
const metrics = [
  { name: 'Classification', unit: `${data.answerKey.length} emails`, hit: 'Predicted class equals the answer key class' },
  { name: 'SKU match', unit: `${lineTotal} expected lines`, hit: 'Matched SKU is the key SKU, or one listed as acceptable for a vague line' },
  { name: 'Quantity / unit', unit: `${lineTotal} expected lines`, hit: 'Extracted quantity and unit both equal the key, as the customer wrote them' },
  { name: 'Flag recall', unit: `${flagTotal} expected flags`, hit: 'Each flag the key expects is raised on that email' },
];
const steps = [
  { name: 'Classify', kind: 'LLM', does: 'Quote request, order status, reorder, or other' },
  { name: 'Extract', kind: 'LLM', does: 'Customer, ship-to, dates, lines, with confidence' },
  { name: 'Match', kind: 'LLM', does: 'Each line to a SKU via catalog, aliases, spec crosswalk' },
  { name: 'Convert, stock, price', kind: 'Code', does: 'Round to cases/rolls, pick plants, tier + volume + freight' },
  { name: 'Flag', kind: 'Code', does: 'Missing info, low confidence, short stock, substitution, bid deadline, below floor' },
  { name: 'Draft', kind: 'LLM', does: 'Short reply email from the computed facts' },
];
</script>

<template>
  <div class="narration">
    <p>
      The pipeline has six steps. The model does the four language steps: classify, extract, match, and draft.
      Plain TypeScript does conversion, stock, pricing, and flags.
    </p>
    <p>
      The model never computes a price, a case count, or a date. That keeps every dollar traceable to the catalog and
      the pricing sheet.
    </p>
    <p>
      The draft email repeats numbers the code produced. The prompt forbids new numbers, but no code checks the draft yet.
    </p>
  </div>
  <ol class="flow">
    <li v-for="(s, i) in steps" :key="s.name" :class="s.kind === 'LLM' ? 'llm' : 'code'">
      <div class="kind">{{ s.kind }}</div>
      <div class="name">{{ i + 1 }}. {{ s.name }}</div>
      <div class="does">{{ s.does }}</div>
    </li>
  </ol>
  <p class="source">
    LLM steps: <code>poc/llm/</code> (Zod-validated tool output). Code steps: <code>poc/domain/</code> (pure functions, Vitest tests).
  </p>

  <h2>How each run is scored</h2>
  <div class="narration">
    <p>
      It's scored against an answer key - in real life, I've done some things where Claude produces the output in a CLI
      environment for a SME to say pass/fail to each response, but since this is all faked data, I had Claude produce a 
      scorecard method to simulate that process.
    </p>
    <p>
      Every run is scored by <code>poc/score.ts</code> against <code>answer_key.json</code>. The key was written with
      the emails, before any run. Four numbers come out:
    </p>
  </div>
  <table class="metrics">
    <thead><tr><th>Metric</th><th>Out of</th><th>Counts as a hit when</th></tr></thead>
    <tbody>
      <tr v-for="m in metrics" :key="m.name"><td>{{ m.name }}</td><td>{{ m.unit }}</td><td>{{ m.hit }}</td></tr>
    </tbody>
  </table>
  <div class="narration">
    <p>
      Output lines are paired to key lines by SKU first, then in order. A key line with no output line to pair with
      counts as a miss on both SKU and quantity. An output line with no key line is listed as an extra line.
    </p>
    <p>
      Every miss is listed with a cause: misclassified, wrong SKU, wrong quantity or unit, line not extracted, missing
      flag. Chapter 4 shows these for run 1.
    </p>
    <p>
      Not scored: prices, plant choice, and the draft email. Prices and plants come from code, so they are right
      whenever the SKU and quantity are right. Extra flags are listed but do not lower the score, so flag precision is
      not measured.
    </p>
  </div>
</template>

<style scoped>
.flow { list-style: none; padding: 0; margin: 1.5rem 0 0; display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.5rem; counter-reset: none; }
.flow li { border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem; position: relative; }
.flow li.code { background: var(--panel); border-style: solid; }
.flow li.llm { border-style: dashed; }
.flow li:not(:last-child)::after { content: '→'; position: absolute; right: -0.55rem; top: 50%; transform: translateY(-50%); color: var(--muted); }
.kind { font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
.name { font-weight: 600; margin: 0.15rem 0 0.35rem; }
.does { font-size: 0.82rem; color: var(--muted); }
@media (max-width: 900px) {
  .flow { grid-template-columns: 1fr; }
  .flow li:not(:last-child)::after { content: '↓'; right: auto; left: 50%; top: auto; bottom: -1.1rem; transform: none; }
  .flow li { margin-bottom: 0.5rem; }
}
.metrics { width: 100%; border-collapse: collapse; margin: 0.5rem 0 1rem; font-size: 0.9rem; }
.metrics th, .metrics td { text-align: left; padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--border); vertical-align: top; }
.metrics th { color: var(--muted); font-weight: 600; }
</style>
