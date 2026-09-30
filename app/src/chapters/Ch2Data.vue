<script setup lang="ts">
import { computed, ref } from 'vue';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import { data } from '../data';

const tables = [
  { key: 'products', label: 'Products', file: 'products.csv' },
  { key: 'aliases', label: 'Aliases', file: 'aliases.csv' },
  { key: 'spec_crosswalk', label: 'Spec crosswalk', file: 'spec_crosswalk.csv' },
  { key: 'customers', label: 'Customers', file: 'customers.csv' },
  { key: 'inventory', label: 'Inventory', file: 'inventory.csv' },
] as const;

const filters = ref<Record<string, string>>({});
const rowsFor = (key: (typeof tables)[number]['key']) => {
  const q = (filters.value[key] ?? '').toLowerCase().trim();
  const t = data.tables[key];
  return q === '' ? t.rows : t.rows.filter((r) => Object.values(r).some((v) => v.toLowerCase().includes(q)));
};

const pricing = data.master.pricing;
const pct = (n: number) => `${Math.round(n * 100)}%`;
const expectedLines = data.answerKey.reduce((s, k) => s + k.lines.length, 0);

const selectedId = ref(data.requests[0]?.id ?? '');
const selected = computed(() => data.requests.find((r) => r.id === selectedId.value));
const sender = (from: string) => from.replace(/<.*>/, '').trim();
</script>

<template>
  <div class="narration">
    <p><i>
      *NOTE: all references to "I" should be assumed to me and/or Claude (mostly Claude)
    </i></p>
    <p>
      I asked for what a portco would hand over on day one: ERP exports, the pricing sheet, and a week of quote emails.
      Here I used fictional stand-ins. The exports keep NetSuite-style column names like “Item Number” and “Std. Cost”.
    </p>
    <p>
      I also wrote an answer key for the {{ data.requests.length }} emails ({{ expectedLines }} expected lines) before
      running anything, so the scoring was fixed in advance.
    </p>
    <p>
      Click the tabs below to see all the sample data. The inbox shows each email. The other tabs show each export as a
      sortable, filterable table.
    </p>
  </div>

  <Tabs value="inbox" scrollable>
    <TabList>
      <Tab value="inbox">Inbox ({{ data.requests.length }})</Tab>
      <Tab v-for="t in tables" :key="t.key" :value="t.key">{{ t.label }} ({{ data.tables[t.key].rows.length }})</Tab>
      <Tab value="pricing">Pricing</Tab>
    </TabList>
    <TabPanels>
      <TabPanel value="inbox">
        <div class="inbox">
          <ul class="list">
            <li v-for="r in data.requests" :key="r.id">
              <button :class="{ active: r.id === selectedId }" @click="selectedId = r.id">
                <span class="id">{{ r.id }}</span>
                <span class="who">{{ sender(r.from) }}</span>
                <span class="subj">{{ r.subject }}</span>
              </button>
            </li>
          </ul>
          <div v-if="selected" class="email">
            <aside class="why" aria-label="Why this case">
              <div class="why-label">Why this case · test note, not part of the email</div>
              <p>{{ selected.scenarioNote }}</p>
            </aside>
            <div class="email-label">Email as received</div>
            <table class="meta">
              <tbody>
                <tr><th>From</th><td>{{ selected.from }}</td></tr>
                <tr><th>Subject</th><td>{{ selected.subject }}</td></tr>
                <tr><th>Received</th><td>{{ selected.receivedAt }}</td></tr>
              </tbody>
            </table>
            <pre class="body">{{ selected.body }}</pre>
            <template v-if="selected.attachmentText">
              <div class="muted small att">Attachment (pre-extracted text)</div>
              <pre class="body">{{ selected.attachmentText }}</pre>
            </template>
          </div>
        </div>
        <p class="source">Source: <code>poc/data/requests.json</code>. The “why this case” note is never sent to the model.</p>
      </TabPanel>

      <TabPanel v-for="t in tables" :key="t.key" :value="t.key">
        <div class="row filter">
          <InputText v-model="filters[t.key]" placeholder="Filter rows" size="small" />
          <span class="muted small">{{ rowsFor(t.key).length }} of {{ data.tables[t.key].rows.length }} rows</span>
        </div>
        <DataTable :value="rowsFor(t.key)" size="small" scrollable scroll-height="28rem" removable-sort striped-rows>
          <Column v-for="c in data.tables[t.key].columns" :key="c" :field="c" :header="c" sortable />
        </DataTable>
        <p class="source">Source: <code>poc/data/{{ t.file }}</code>, column names as exported.</p>
      </TabPanel>

      <TabPanel value="pricing">
        <div class="grid-2">
          <table class="plain">
            <thead><tr><th>Price level</th><th class="num">Discount off list</th></tr></thead>
            <tbody>
              <tr v-for="(v, k) in pricing.tierDiscount" :key="k"><td>Tier {{ k }}</td><td class="num">{{ pct(v) }}</td></tr>
            </tbody>
          </table>
          <table class="plain">
            <thead><tr><th>Volume break</th><th class="num">Extra discount</th></tr></thead>
            <tbody>
              <tr v-for="b in pricing.volumeBreaks" :key="b.minPallets"><td>{{ b.minPallets }}+ pallets</td><td class="num">{{ pct(b.extraDiscount) }}</td></tr>
            </tbody>
          </table>
          <table class="plain">
            <thead><tr><th>Freight region</th><th class="num">Per pallet</th></tr></thead>
            <tbody>
              <tr v-for="(v, k) in pricing.freight.perPalletUsd" :key="k"><td>{{ k }}</td><td class="num">${{ v }}</td></tr>
              <tr><td>Free freight over</td><td class="num">${{ pricing.freight.freeOverUsd.toLocaleString('en-US') }}</td></tr>
            </tbody>
          </table>
          <table class="plain">
            <thead><tr><th>Rule</th><th class="num">Value</th></tr></thead>
            <tbody><tr><td>Floor margin</td><td class="num">{{ pct(pricing.floorMarginPct) }}</td></tr></tbody>
          </table>
        </div>
        <p class="source">Source: <code>poc/data/pricing.json</code>.</p>
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<style scoped>
.inbox { display: grid; grid-template-columns: minmax(14rem, 18rem) 1fr; gap: 1rem; margin-top: 0.5rem; }
.list { list-style: none; margin: 0; padding: 0; border: 1px solid var(--border); border-radius: 8px; max-height: 36rem; overflow-y: auto; }
.list li + li { border-top: 1px solid var(--border); }
.list button { all: unset; box-sizing: border-box; display: grid; grid-template-columns: 2.5rem 1fr; width: 100%; padding: 0.5rem 0.75rem; cursor: pointer; font-size: 0.88rem; }
.list button:hover { background: var(--panel); }
.list button.active { background: var(--panel); box-shadow: inset 3px 0 0 var(--p-primary-color); }
.list button:focus-visible { outline: 2px solid var(--p-primary-color); outline-offset: -2px; }
.id { font-weight: 600; grid-row: span 2; }
.subj { color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.email { min-width: 0; }
.why { margin-bottom: 1.25rem; padding: 0.6rem 0.9rem; background: var(--note-bg); border-left: 4px solid var(--note-border); border-radius: 0 6px 6px 0; color: var(--note-fg); }
.why-label { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.2rem; }
.why p { margin: 0; font-size: 0.92rem; font-style: italic; }
.email-label { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.4rem; }
.meta { font-size: 0.88rem; margin-bottom: 0.75rem; word-break: break-word; }
.meta th { text-align: left; color: var(--muted); font-weight: 500; padding-right: 1rem; }
.body { background: var(--panel); border: 1px solid var(--border); border-radius: 6px; padding: 0.75rem; max-height: 26rem; overflow: auto; }
.att { margin: 0.75rem 0 0.25rem; }
.filter { margin: 0.5rem 0; }
@media (max-width: 800px) { .inbox { grid-template-columns: 1fr; } .list { max-height: 14rem; } }
</style>
