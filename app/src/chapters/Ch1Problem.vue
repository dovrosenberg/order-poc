<script setup lang="ts">
// Baseline and target numbers come from docs/SPEC.md "Problem scenario" and "Metrics", not from a run.
const tiles = [
  { value: '2–3 days', label: 'Request to quote today', target: 'Target: under 4 business hours' },
  { value: '~35 min', label: 'Rep time per quote today', target: 'Target: under 10 minutes (review and approve)' },
  { value: '~60 / week', label: 'Requests into one shared inbox', target: 'Handled by 3 inside sales reps' },
];
</script>

<template>
  <div class="narration">
    <p>
      Northfield Air Filtration takes 2 to 3 business days to answer a quote request. Slow quotes lose bids.
      Three reps share one inbox of about 60 requests a week. Each quote takes a rep about 35 minutes of re-keying.
    </p>
    <p>The goal: a quote out in under 4 business hours, with under 10 rep minutes spent reviewing it.</p>
  </div>
  <div class="tiles">
    <div v-for="t in tiles" :key="t.label" class="panel tile">
      <div class="value">{{ t.value }}</div>
      <div>{{ t.label }}</div>
      <div class="muted small">{{ t.target }}</div>
    </div>
  </div>
  <p class="source">Source: <code>docs/SPEC.md</code>, “Problem scenario”. Northfield and all data in this walkthrough are fictional.</p>
</template>

<style scoped>
.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: 1rem; margin-top: 1.5rem; }
.value { font-size: 1.8rem; font-weight: 600; }
</style>
