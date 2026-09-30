<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Select from 'primevue/select';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import { data } from '../data';
import { quote, plantsText, type QuoteLineInput } from '../lib/quote';
import { usd } from '../lib/format';
import FlagList from '../components/FlagList.vue';
import type { Unit } from '../../../poc/domain/types';

const run = data.runs.run2;
const options = data.requests.map((r) => ({ label: `${r.id} · ${r.subject}`, value: r.id }));
const id = ref('R02');

const req = computed(() => data.requests.find((r) => r.id === id.value)!);
const rec = computed(() => run.requests.find((r) => r.requestId === id.value)!);
const ex = computed(() => rec.value.steps.extract?.result ?? null);
const matches = computed(() => rec.value.steps.match?.result ?? []);

// Editable copy of the recorded line inputs. Edits change SKU, qty or unit only; the model's confidence,
// alternatives and substitution fields are kept as recorded.
const inputs = ref<QuoteLineInput[]>([]);
function reset() {
  const e = ex.value;
  inputs.value = e ? e.lines.map((l, i) => ({ text: l.text, qty: l.qty, unit: l.unit, match: { ...matches.value[i]! } })) : [];
}
watch(id, reset, { immediate: true });

const edited = computed(() => {
  const e = ex.value;
  if (!e) return false;
  return inputs.value.some((l, i) => l.qty !== e.lines[i]!.qty || l.unit !== e.lines[i]!.unit || l.match.sku !== matches.value[i]!.sku);
});
const result = computed(() => (ex.value ? quote(data.master, req.value, ex.value, inputs.value) : null));

const skuOptions = [{ label: 'no match', value: null as string | null }, ...data.master.products.map((p) => ({ label: `${p.sku} · ${p.name}`, value: p.sku as string | null }))];
const units: Unit[] = ['EA', 'CASE', 'ROLL', 'SF', 'LF', 'PALLET'];
const conf = (n: number) => n.toFixed(2);
const lowConf = (n: number) => n < 0.7;
const pct = (n: number) => `${Math.round(n * 100)}%`;
</script>

<template>
  <div class="narration">
    <p>Pick an email and step through what the pipeline produced for it in run 2.</p>
    <p>
      Change a part number, quantity, or unit, and the price, stock, and flags recompute in your browser. It runs the same
      <code>poc/domain</code> code the script used.
    </p>
    <p>The draft email does not update when you edit. It is the one recorded in run 2.</p>
  </div>

  <div class="row picker">
    <Select v-model="id" :options="options" option-label="label" option-value="value" class="pick" aria-label="Email" />
    <Tag value="Live mode: not built in this version" severity="secondary" />
  </div>
  <p class="muted small why">Why this case: {{ req.scenarioNote }}</p>

  <ol class="steps">
    <li>
      <h2>1. Classify <Tag value="LLM" severity="secondary" /></h2>
      <p><strong>{{ rec.steps.classify.result }}</strong></p>
      <p v-if="rec.steps.classify.reason" class="muted">{{ rec.steps.classify.reason }}</p>
      <p v-if="!ex" class="muted">Not a quote request, so the pipeline stops here. No lines, no draft.</p>
    </li>

    <template v-if="ex && result">
      <li>
        <h2>2. Extract <Tag value="LLM" severity="secondary" /></h2>
        <table class="plain fields">
          <thead><tr><th>Field</th><th>Value</th><th class="num">Confidence</th></tr></thead>
          <tbody>
            <tr><td>Customer</td><td>{{ ex.customerName ?? '—' }}</td><td class="num">{{ conf(ex.fieldConfidence.customer) }}</td></tr>
            <tr>
              <td>Ship-to</td>
              <td>
                {{ ex.shipTo ?? '—' }}
                <span v-if="!ex.shipTo && result.shipTo" class="muted small">(customer default used: {{ result.shipTo }})</span>
              </td>
              <td class="num">{{ conf(ex.fieldConfidence.shipTo) }}</td>
            </tr>
            <tr><td>Need-by</td><td>{{ ex.needBy ?? '—' }}</td><td class="num">{{ conf(ex.fieldConfidence.needBy) }}</td></tr>
            <tr><td>Bid due</td><td>{{ ex.bidDueAt ?? '—' }}</td><td /></tr>
            <tr><td>Customer's target price</td><td>{{ ex.targetUnitPrice === null ? '—' : usd(ex.targetUnitPrice) }}</td><td /></tr>
          </tbody>
        </table>
        <p class="muted small">
          Priced as {{ result.customer.name }} · tier {{ result.customer.tier }} · {{ result.customer.region }}
          (from the sender's email domain, by code).
        </p>
      </li>

      <li>
        <h2>3. Match <Tag value="LLM" severity="secondary" /></h2>
        <div class="scroll">
          <table class="plain">
            <thead><tr><th>#</th><th>Text as written</th><th>SKU</th><th class="num">Conf</th><th>Alternatives</th><th>Reason</th></tr></thead>
            <tbody>
              <tr v-for="(m, i) in matches" :key="i">
                <td>{{ i + 1 }}</td>
                <td>{{ ex.lines[i]?.text }}</td>
                <td class="nowrap"><code>{{ m.sku ?? 'no match' }}</code> <Tag v-if="m.substitution" value="substitution" severity="warn" /></td>
                <td :class="['num', { low: lowConf(m.confidence) }]">{{ conf(m.confidence) }}</td>
                <td><code v-for="a in m.alternatives" :key="a" class="alt">{{ a }}</code><span v-if="!m.alternatives.length" class="muted">—</span></td>
                <td class="muted small">{{ m.reason }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </li>

      <li>
        <h2>4. Convert, stock, price <Tag value="Code" /></h2>
        <div class="row">
          <span class="muted small">Edit SKU, qty or unit. Everything to the right recomputes.</span>
          <Button v-if="edited" label="Reset to recorded" size="small" severity="secondary" text icon="pi pi-undo" @click="reset" />
        </div>
        <div class="scroll">
          <table class="plain edit">
            <thead>
              <tr><th>#</th><th>SKU</th><th>Qty</th><th>Unit</th><th class="num">Sell</th><th>Plants</th><th class="num">Unit $</th><th class="num">Ext $</th><th>Line flags</th></tr>
            </thead>
            <tbody>
              <tr v-for="(l, i) in inputs" :key="i">
                <td>{{ i + 1 }}</td>
                <td>
                  <Select v-model="l.match.sku" :options="skuOptions" option-label="label" option-value="value" filter size="small" class="sku" :aria-label="`SKU for line ${i + 1}`">
                    <template #value="{ value }"><code>{{ value ?? 'no match' }}</code></template>
                  </Select>
                </td>
                <td><InputNumber v-model="l.qty" :min="0" size="small" input-class="qty" :aria-label="`Quantity for line ${i + 1}`" /></td>
                <td><Select v-model="l.unit" :options="units" size="small" placeholder="?" :aria-label="`Unit for line ${i + 1}`" /></td>
                <td class="num">{{ result.lines[i]!.sellQty }} {{ result.lines[i]!.sellUnit ?? '' }}</td>
                <td class="nowrap">{{ plantsText(result.lines[i]!) || '—' }}</td>
                <td class="num">{{ usd(result.lines[i]!.unitPrice) }}</td>
                <td class="num">{{ usd(result.lines[i]!.extPrice) }}</td>
                <td><FlagList :flags="result.lines[i]!.flags" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <table class="plain totals">
          <tbody>
            <tr><td>Subtotal</td><td class="num">{{ usd(result.totals.subtotal) }}</td></tr>
            <tr><td>Pallets (rounded up per line)</td><td class="num">{{ result.totals.pallets }}</td></tr>
            <tr><td>Volume discount (in unit prices)</td><td class="num">{{ pct(result.totals.volumeDiscount) }}</td></tr>
            <tr><td>Freight</td><td class="num">{{ usd(result.totals.freight) }}</td></tr>
            <tr class="total"><td>Total</td><td class="num">{{ usd(result.totals.total) }}</td></tr>
          </tbody>
        </table>
        <p v-if="id === 'R12'" class="warn small">
          Known defect: pallets are rounded up per line and then summed, so freight here is overstated. See chapter 6.
        </p>
      </li>

      <li>
        <h2>5. Flags <Tag value="Code" /></h2>
        <FlagList :flags="result.flags" :expected="data.answerKey.find((k) => k.requestId === id)?.expectedFlags ?? []" />
        <p class="muted small">Colours compare against the answer key: green expected, amber not expected, red missed.</p>
      </li>

      <li>
        <h2>6. Draft <Tag value="LLM" severity="secondary" /></h2>
        <p v-if="edited" class="warn small">You have edited lines. This draft is the recorded one and does not reflect your edits.</p>
        <p class="muted small">{{ rec.draft?.header }}</p>
        <pre class="draft">{{ rec.draft?.body }}</pre>
      </li>
    </template>
  </ol>
  <p class="source">Source: <code>poc/runs/run-02/raw/{{ id }}.json</code> and <code>drafts.md</code>. Math: <code>poc/domain</code>.</p>
</template>

<style scoped>
.picker { margin: 1rem 0 0.25rem; }
.pick { min-width: 20rem; max-width: 100%; }
.why { margin-bottom: 1rem; }
.steps { list-style: none; padding: 0; margin: 0; }
.steps > li { border-left: 2px solid var(--border); padding: 0 0 0.5rem 1.25rem; margin-bottom: 0.5rem; }
.steps h2 { margin-top: 1rem; display: flex; gap: 0.5rem; align-items: center; }
.fields { max-width: 44rem; }
.scroll { overflow-x: auto; }
.low { color: var(--del-fg); font-weight: 600; }
.alt { display: block; }
.sku { width: 13rem; }
.edit :deep(.qty) { width: 5.5rem; }
.totals { max-width: 24rem; margin-top: 1rem; }
.totals .total td { font-weight: 600; }
.draft { background: var(--panel); border: 1px solid var(--border); border-radius: 6px; padding: 0.75rem; max-height: 28rem; overflow: auto; }
@media (max-width: 800px) { .pick { min-width: 0; width: 100%; } }
</style>
