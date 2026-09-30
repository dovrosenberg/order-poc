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

const run = facts.run1;
const m = run.metrics;
</script>

<template>
  <div class="narration">
    <p>
      Run 1 used plain first-draft prompts. It classified {{ frac(m.classification) }} emails correctly and matched
      {{ m.sku.hit }} of {{ m.sku.total }} lines to the right part.
    </p>
    <p>
      Quantities and units were right on only {{ m.qtyUnit.hit }} of {{ m.qtyUnit.total }}. When an email said
      “8 of the HEPAs” or gave a count in an equipment schedule, the model left the unit blank. Without a unit, the code
      could not price the line: R07 came out at {{ usd(facts.subtotalOf('run1', 'R07')) }} and R12 at
      {{ usd(facts.subtotalOf('run1', 'R12')) }}.
    </p>
  </div>

  <MetricTiles :metrics="m" :extra-flags="facts.run1ExtraFlags.length" />

  <Accordion>
    <AccordionPanel value="prompts">
      <AccordionHeader>Prompts used in run 1 ({{ run.promptVersion }}, read-only)</AccordionHeader>
      <AccordionContent><PromptTabs :prompts="data.prompts.v1" /></AccordionContent>
    </AccordionPanel>
  </Accordion>

  <h2>Line items</h2>
  <ResultsTable :rows="run.rows" />

  <h2>Classification and flags per request</h2>
  <RequestFlags :run="run" />

  <p class="source">Source: <code>poc/runs/run-01/</code> (<code>results.csv</code>, <code>scorecard.md</code>, <code>raw/</code>, <code>drafts.md</code>).</p>
</template>
