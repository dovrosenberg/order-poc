<script setup lang="ts">
import { computed, ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import SelectButton from 'primevue/selectbutton';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import type { ResultRow } from '../phase1-types';
import { usd } from '../lib/format';

const props = defineProps<{ rows: ResultRow[] }>();
const show = ref<'All lines' | 'Misses only'>('All lines');
const req = ref<string>('All');
const ids = computed(() => ['All', ...new Set(props.rows.map((r) => r.requestId))]);
const filtered = computed(() => props.rows.filter((r) =>
  (req.value === 'All' || r.requestId === req.value) && (show.value === 'All lines' || !r.skuOk || !r.qtyOk)));
</script>

<template>
  <div class="row controls">
    <SelectButton v-model="show" :options="['All lines', 'Misses only']" :allow-empty="false" />
    <Select v-model="req" :options="ids" aria-label="Request" />
    <span class="muted small">{{ filtered.length }} of {{ props.rows.length }} lines</span>
  </div>
  <DataTable :value="filtered" size="small" scrollable scroll-height="32rem" striped-rows>
    <Column field="requestId" header="Req" />
    <Column header="Text as written">
      <template #body="{ data }"><span class="text">{{ (data as ResultRow).text }}</span></template>
    </Column>
    <Column header="Qty / unit">
      <template #body="{ data }">
        <span :class="['nowrap', { miss: !(data as ResultRow).qtyOk }]">{{ (data as ResultRow).qty || '?' }} {{ (data as ResultRow).unit || '?' }}</span>
      </template>
    </Column>
    <Column header="SKU">
      <template #body="{ data }">
        <code :class="['nowrap', { miss: !(data as ResultRow).skuOk }]">{{ (data as ResultRow).sku || 'no match' }}</code>
      </template>
    </Column>
    <Column header="Conf" class="num">
      <template #body="{ data }">{{ (data as ResultRow).confidence.toFixed(2) }}</template>
    </Column>
    <Column header="Sell" class="num">
      <template #body="{ data }">{{ (data as ResultRow).sellQty }} {{ (data as ResultRow).sellUnit }}</template>
    </Column>
    <Column field="plants" header="Plants" />
    <Column header="Unit $" class="num">
      <template #body="{ data }">{{ usd((data as ResultRow).unitPrice) }}</template>
    </Column>
    <Column header="Ext $" class="num">
      <template #body="{ data }">{{ usd((data as ResultRow).extPrice) }}</template>
    </Column>
    <Column header="Line flags">
      <template #body="{ data }">
        <span class="row tight"><Tag v-for="f in (data as ResultRow).flags" :key="f" :value="f" severity="secondary" /></span>
      </template>
    </Column>
    <Column header="vs key">
      <template #body="{ data }">
        <Tag v-if="(data as ResultRow).skuOk && (data as ResultRow).qtyOk" value="hit" severity="success" />
        <span v-else class="row tight">
          <Tag v-if="!(data as ResultRow).skuOk" value="SKU miss" severity="danger" />
          <Tag v-if="!(data as ResultRow).qtyOk" value="qty miss" severity="danger" />
        </span>
      </template>
    </Column>
  </DataTable>
  <p class="source">
    Line flags come from <code>results.csv</code>. Request-level flags (bid deadline, missing info, below floor) are
    only in <code>raw/RNN.json</code> and are listed per request below.
  </p>
</template>

<style scoped>
.controls { margin-bottom: 0.5rem; }
.text { display: inline-block; min-width: 14rem; max-width: 24rem; }
.miss { color: var(--del-fg); background: var(--del-bg); padding: 0 0.25rem; border-radius: 3px; }
.tight { gap: 0.25rem; }
</style>
