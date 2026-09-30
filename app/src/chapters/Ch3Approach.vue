<script setup lang="ts">
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
</style>
