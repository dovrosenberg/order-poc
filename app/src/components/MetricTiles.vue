<script setup lang="ts">
import type { Metrics } from '../phase1-types';
import { frac } from '../lib/format';

const props = defineProps<{ metrics: Metrics; extraFlags: number }>();
const tiles = [
  { key: 'classification', label: 'Classification' },
  { key: 'sku', label: 'SKU match' },
  { key: 'qtyUnit', label: 'Qty / unit' },
  { key: 'flagRecall', label: 'Flag recall' },
] as const;
</script>

<template>
  <div class="tiles">
    <div v-for="t in tiles" :key="t.key" class="tile">
      <div class="label">{{ t.label }}</div>
      <div class="value">{{ frac(props.metrics[t.key]) }}</div>
      <div class="pct">{{ props.metrics[t.key].pct }}</div>
    </div>
    <div class="tile unscored">
      <div class="label">Extra flags</div>
      <div class="value">{{ props.extraFlags }}</div>
      <div class="pct">not scored</div>
    </div>
  </div>
</template>

<style scoped>
.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr)); gap: 0.75rem; margin: 1rem 0; }
.tile { border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem 1rem; background: var(--panel); }
.tile.unscored { border-style: dashed; background: transparent; }
.label { font-size: 0.8rem; color: var(--muted); }
.value { font-size: 1.5rem; font-weight: 600; font-variant-numeric: tabular-nums; }
.pct { font-size: 0.8rem; color: var(--muted); }
</style>
