<script setup lang="ts">
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import { data } from '../data';
import { facts } from '../lib/facts';
import { frac, usd } from '../lib/format';
import MetricTiles from '../components/MetricTiles.vue';
import ResultsTable from '../components/ResultsTable.vue';
import RequestFlags from '../components/RequestFlags.vue';
import PromptTabs from '../components/PromptTabs.vue';

const { run1, run2, r07, r12 } = facts;
const rows = [
  { label: 'Classification', a: run1.metrics.classification, b: run2.metrics.classification },
  { label: 'SKU match', a: run1.metrics.sku, b: run2.metrics.sku },
  { label: 'Qty / unit', a: run1.metrics.qtyUnit, b: run2.metrics.qtyUnit },
  { label: 'Flag recall', a: run1.metrics.flagRecall, b: run2.metrics.flagRecall },
];
const delta = (a: { hit: number }, b: { hit: number }) => (b.hit - a.hit === 0 ? '—' : `${b.hit - a.hit > 0 ? '+' : ''}${b.hit - a.hit}`);
const allPerfect = rows.every((r) => r.b.hit === r.b.total);
const pct = (n: number) => `${Math.round(n * 100)}%`;
</script>

<template>
  <div class="narration">
    <p>
      Run 2 used the changed prompts and the same model.
      <template v-if="allPerfect">Every scored metric reached 100%.</template>
      That number is not a real accuracy estimate. I tuned the prompts on these same {{ data.requests.length }} emails,
      so run 2 mostly shows the fixes did what I aimed them at.
    </p>
    <p>Two problems remain that the scorecard does not catch.</p>
    <p>
      First, R07 now gets a stock warning the answer key does not expect. The HEPA line has a unit now, so the code
      allocates it. The only plant with stock ({{ r07.plant }}) has a {{ r07.lead }}-day lead time against a
      {{ r07.window }}-day window.
    </p>
    <p>
      Second, R12 is overcharged on freight. My code rounds pallets up per line, so {{ r12.lines }} small lines became
      {{ r12.pallets }} pallets and {{ usd(r12.freight) }} of freight on a {{ usd(r12.subtotal) }} order.
    </p>
  </div>

  <div class="warn">
    Run 2 is scored on the same {{ data.requests.length }} emails the fixes were written against. It is not an
    independent accuracy measure. Flag scoring counts missed flags only; extra flags are listed but not scored.
  </div>

  <h2>Run 1 vs run 2</h2>
  <div class="scroll">
    <table class="plain compare">
      <thead><tr><th>Metric</th><th class="num">Run 1</th><th class="num">Run 2</th><th class="num">Change</th></tr></thead>
      <tbody>
        <tr v-for="r in rows" :key="r.label">
          <td>{{ r.label }}</td>
          <td class="num">{{ frac(r.a) }} <span class="muted">({{ r.a.pct }})</span></td>
          <td class="num">{{ frac(r.b) }} <span class="muted">({{ r.b.pct }})</span></td>
          <td class="num">{{ delta(r.a, r.b) }}</td>
        </tr>
        <tr>
          <td>Extra flags (not scored)</td>
          <td class="num">{{ facts.run1ExtraFlags.length }}</td>
          <td class="num">{{ facts.run2ExtraFlags.length }}</td>
          <td class="num">{{ facts.run2ExtraFlags.length - facts.run1ExtraFlags.length }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2>Still wrong in run 2 (not in the scorecard)</h2>
  <div class="grid-2">
    <div class="panel">
      <h3>R07: extra short-stock flag</h3>
      <p>
        {{ r07.plant }} is the only plant with the HEPA in stock. Lead time {{ r07.lead }} days; need-by is
        {{ r07.window }} days after receipt. The answer key expects only <code>low_confidence</code>.
        Not changed (LOG.md 18:13).
      </p>
    </div>
    <div class="panel">
      <h3>R12: freight larger than the order</h3>
      <table class="plain">
        <tbody>
          <tr><td>Subtotal</td><td class="num">{{ usd(r12.subtotal) }}</td></tr>
          <tr><td>Freight ({{ r12.pallets }} pallets × {{ usd(r12.perPallet) }}, {{ r12.region }})</td><td class="num">{{ usd(r12.freight) }}</td></tr>
          <tr><td>Total</td><td class="num">{{ usd(r12.total) }}</td></tr>
        </tbody>
      </table>
      <p class="small">
        Cause: <code>poc/domain/pricing.ts</code> rounds pallets up per line, then sums them. The same
        {{ r12.pallets }}-pallet count also applies a {{ pct(r12.volumeDiscount) }} volume discount.
        The answer key does not score prices, so the scorecard passed it.
      </p>
    </div>
  </div>

  <MetricTiles :metrics="run2.metrics" :extra-flags="facts.run2ExtraFlags.length" />

  <Accordion>
    <AccordionPanel value="prompts">
      <AccordionHeader>Prompts used in run 2 ({{ run2.promptVersion }}, read-only)</AccordionHeader>
      <AccordionContent><PromptTabs :prompts="data.prompts.v2" /></AccordionContent>
    </AccordionPanel>
  </Accordion>

  <h2>Line items</h2>
  <ResultsTable :rows="run2.rows" />

  <h2>Classification and flags per request</h2>
  <RequestFlags :run="run2" />

  <p class="source">Source: <code>poc/runs/run-02/</code>. R12 totals: <code>drafts.md</code> header line, recomputed with <code>poc/domain</code>.</p>
</template>

<style scoped>
.scroll { overflow-x: auto; }
.compare { max-width: 40rem; }
.warn { margin: 1rem 0; }
h3 { margin-top: 0; }
</style>
