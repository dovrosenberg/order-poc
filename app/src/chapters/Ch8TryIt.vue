<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import { data } from '../data';
import { quote, plantsText, recordedInputs, type QuoteLineInput, type QuoteResult } from '../lib/quote';
import { live, liveCode, LiveError, type EmailInput } from '../lib/live';
import { usd } from '../lib/format';
import FlagList from '../components/FlagList.vue';
import type { Classification, Extraction, Flag, InboundRequest, LineMatch, Unit } from '../../../poc/domain/types';

/** What the six steps render: one recorded request from run 2, or one live run. */
interface View {
  key: string;
  req: InboundRequest;
  classify: { result: Classification; reason?: string };
  ex: Extraction | null;
  matches: LineMatch[];
  draft: { header?: string; body: string } | null;
  expectedFlags?: Flag[];
}

const mode = ref<'recorded' | 'live'>('recorded');
const modes = [{ label: 'Recorded (run 2)', value: 'recorded' }, { label: 'Paste a new email (live)', value: 'live' }];

// ---- Recorded
const run = data.runs.run2;
const options = data.requests.map((r) => ({ label: `${r.id} · ${r.subject}`, value: r.id }));
const id = ref('R02');
const recordedView = computed<View>(() => {
  const req = data.requests.find((r) => r.id === id.value)!;
  const rec = run.requests.find((r) => r.requestId === id.value)!;
  return {
    key: `rec-${id.value}`, req, classify: rec.steps.classify,
    ex: rec.steps.extract?.result ?? null, matches: rec.steps.match?.result ?? [],
    draft: rec.draft, expectedFlags: data.answerKey.find((k) => k.requestId === id.value)?.expectedFlags ?? [],
  };
});

// ---- Live
const form = ref<EmailInput>({ from: '', subject: '', receivedAt: '', body: '' });
const liveView = ref<View | null>(null);
const running = ref<string | null>(null);
const liveError = ref<string | null>(null);

function useSample(s: InboundRequest) {
  form.value = { from: s.from, subject: s.subject, receivedAt: s.receivedAt, body: s.body, ...(s.attachmentText ? { attachmentText: s.attachmentText } : {}) };
}
const canRun = computed(() => !!liveCode.value && !running.value && form.value.body.trim() !== '');

async function runLive() {
  liveError.value = null;
  liveView.value = null;
  // A pasted email with no received time is treated as received now; a sample keeps its own time.
  const email: EmailInput = { ...form.value, receivedAt: form.value.receivedAt || new Date().toISOString() };
  const req: InboundRequest = { id: 'LIVE', scenarioNote: '', ...email };
  const step = async <T>(name: string, f: () => Promise<T>) => { running.value = name; return f(); };
  try {
    const c = await step('classify', () => live.classify(email));
    const v: View = { key: `live-${Date.now()}`, req, classify: c, ex: null, matches: [], draft: null };
    if (c.result === 'quote_request' || c.result === 'reorder') {
      v.ex = await step('extract', () => live.extract(email));
      const lines = v.ex.lines;
      v.matches = lines.length ? await step('match', () => live.match(lines)) : [];
    }
    liveView.value = v;
    if (v.ex) await redraft();
  } catch (e) {
    liveError.value = e instanceof LiveError && e.status === 401
      ? 'Passcode rejected. Live mode is locked again.'
      : `The ${running.value} step failed: ${e instanceof Error ? e.message : String(e)}`;
  } finally {
    running.value = null;
  }
}

// ---- Shared: the six steps and the editable price table
const view = computed<View | null>(() => (mode.value === 'recorded' ? recordedView.value : liveView.value));

// Editable copy of the line inputs. Edits change SKU, qty or unit only; the model's confidence,
// alternatives and substitution fields are kept as returned.
const inputs = ref<QuoteLineInput[]>([]);
function reset() {
  const v = view.value;
  inputs.value = v?.ex ? recordedInputs(v.ex, v.matches).map((l) => ({ ...l, match: { ...l.match } })) : [];
}
watch(() => view.value?.key, reset, { immediate: true });

const edited = computed(() => {
  const v = view.value;
  if (!v?.ex) return false;
  const ex = v.ex;
  return inputs.value.some((l, i) => l.qty !== ex.lines[i]!.qty || l.unit !== ex.lines[i]!.unit || l.match.sku !== v.matches[i]!.sku);
});
const result = computed<QuoteResult | null>(() => (view.value?.ex ? quote(data.master, view.value.req, view.value.ex, inputs.value) : null));
// The live draft is stale when the lines differ from the ones it was written from.
const sig = (ls: QuoteLineInput[]) => JSON.stringify(ls.map((l) => [l.match.sku, l.qty, l.unit]));
const draftedSig = ref<string | null>(null);
const draftStale = computed(() => draftedSig.value !== null && draftedSig.value !== sig(inputs.value));

/** Drafts the reply from the current line table. Same facts as poc/run.ts sends to the draft step. */
async function redraft() {
  const v = liveView.value, r = result.value;
  if (!v?.ex || !r) return;
  const ex = v.ex;
  running.value = 'draft';
  const drafted = sig(inputs.value);
  try {
    const body = await live.draft({
      email: v.req,
      customerName: r.customer.id === 'UNKNOWN' ? ex.customerName : r.customer.name,
      lines: ex.lines.map((l, i) => {
        const p = r.lines[i]!;
        return { text: l.text, sku: p.sku, sellQty: p.sellQty, sellUnit: p.sellUnit, unitPrice: p.unitPrice, extPrice: p.extPrice };
      }),
      totals: r.totals,
      flags: r.flags,
      missing: [...(r.shipTo ? [] : ['ship-to address']), ...(ex.needBy ? [] : ['delivery date'])],
    });
    v.draft = { header: `Flags: ${r.flags.join(', ') || 'none'} | Subtotal ${usd(r.totals.subtotal)} | Freight ${usd(r.totals.freight)} | Total ${usd(r.totals.total)}`, body };
    draftedSig.value = drafted;
  } catch (e) {
    liveError.value = `The draft step failed: ${e instanceof Error ? e.message : String(e)}`;
  } finally {
    running.value = null;
  }
}
watch(() => view.value?.key, () => { draftedSig.value = null; });

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
    <p>
      With a passcode, you can also paste a new email and run it live. The three language steps and the draft go to the model
      through one server function with the run 2 prompts. The math still runs here.
    </p>
  </div>

  <SelectButton v-model="mode" :options="modes" option-label="label" option-value="value" :allow-empty="false" class="modes" aria-label="Source" />

  <template v-if="mode === 'recorded'">
    <div class="row picker">
      <Select v-model="id" :options="options" option-label="label" option-value="value" class="pick" aria-label="Email" />
    </div>
    <p class="muted small why">Why this case: {{ recordedView.req.scenarioNote }}</p>
  </template>

  <div v-else class="live panel">
    <p v-if="!liveCode" class="warn small">Live mode is locked. Use "Unlock live mode" at the top of the page, or open the link with <code>?code=</code> you were sent.</p>
    <div class="row samples">
      <span class="muted small">Samples not in the scored inbox:</span>
      <Button v-for="s in data.samples" :key="s.id" :label="`${s.id} · ${s.subject}`" size="small" severity="secondary" outlined @click="useSample(s)" />
    </div>
    <div class="fields-form">
      <label for="lf">From</label><InputText id="lf" v-model="form.from" placeholder="Name <name@company.example>" />
      <label for="ls">Subject</label><InputText id="ls" v-model="form.subject" />
      <label for="lb">Body</label><Textarea id="lb" v-model="form.body" rows="10" auto-resize />
    </div>
    <p class="muted small">
      The sender's email domain sets the customer, tier, and freight region. An unknown domain is priced as tier C, midwest.
      <template v-if="form.receivedAt">Received: {{ form.receivedAt }}.</template><template v-else>Received time: now.</template>
    </p>
    <div class="row">
      <Button label="Run live" icon="pi pi-play" :disabled="!canRun" :loading="!!running" @click="runLive" />
      <span v-if="running" class="muted small">Running {{ running }}…</span>
    </div>
    <p v-if="liveError" class="warn small err">{{ liveError }}</p>
  </div>

  <ol v-if="view" class="steps">
    <li>
      <h2>1. Classify <Tag value="LLM" severity="secondary" /></h2>
      <p><strong>{{ view.classify.result }}</strong></p>
      <p v-if="view.classify.reason" class="muted">{{ view.classify.reason }}</p>
      <p v-if="!view.ex" class="muted">Not a quote request, so the pipeline stops here. No lines, no draft.</p>
    </li>

    <template v-if="view.ex && result">
      <li>
        <h2>2. Extract <Tag value="LLM" severity="secondary" /></h2>
        <table class="plain fields">
          <thead><tr><th>Field</th><th>Value</th><th class="num">Confidence</th></tr></thead>
          <tbody>
            <tr><td>Customer</td><td>{{ view.ex.customerName ?? '—' }}</td><td class="num">{{ conf(view.ex.fieldConfidence.customer) }}</td></tr>
            <tr>
              <td>Ship-to</td>
              <td>
                {{ view.ex.shipTo ?? '—' }}
                <span v-if="!view.ex.shipTo && result.shipTo" class="muted small">(customer default used: {{ result.shipTo }})</span>
              </td>
              <td class="num">{{ conf(view.ex.fieldConfidence.shipTo) }}</td>
            </tr>
            <tr><td>Need-by</td><td>{{ view.ex.needBy ?? '—' }}</td><td class="num">{{ conf(view.ex.fieldConfidence.needBy) }}</td></tr>
            <tr><td>Bid due</td><td>{{ view.ex.bidDueAt ?? '—' }}</td><td /></tr>
            <tr><td>Customer's target price</td><td>{{ view.ex.targetUnitPrice === null ? '—' : usd(view.ex.targetUnitPrice) }}</td><td /></tr>
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
              <tr v-for="(m, i) in view.matches" :key="i">
                <td>{{ i + 1 }}</td>
                <td>{{ view.ex.lines[i]?.text }}</td>
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
          <Button v-if="edited" label="Reset to model output" size="small" severity="secondary" text icon="pi pi-undo" @click="reset" />
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
        <p v-if="mode === 'recorded' && id === 'R12'" class="warn small">
          Known defect: pallets are rounded up per line and then summed, so freight here is overstated. See chapter 6.
        </p>
      </li>

      <li>
        <h2>5. Flags <Tag value="Code" /></h2>
        <FlagList :flags="result.flags" :expected="view.expectedFlags" />
        <p v-if="view.expectedFlags" class="muted small">Colours compare against the answer key: green expected, amber not expected, red missed.</p>
        <p v-else class="muted small">No answer key for a pasted email, so these flags are not scored.</p>
      </li>

      <li>
        <h2>6. Draft <Tag value="LLM" severity="secondary" /></h2>
        <template v-if="mode === 'recorded'">
          <p v-if="edited" class="warn small">You have edited lines. This draft is the recorded one and does not reflect your edits.</p>
        </template>
        <div v-else-if="draftStale" class="row warn small">
          <span>You have edited lines since this draft was written.</span>
          <Button label="Redraft with these lines" size="small" :disabled="!liveCode || !!running" :loading="running === 'draft'" @click="redraft" />
        </div>
        <p v-if="view.draft?.header" class="muted small">{{ view.draft.header }}</p>
        <pre v-if="view.draft" class="draft">{{ view.draft.body }}</pre>
        <p v-else-if="running === 'draft'" class="muted">Drafting…</p>
      </li>
    </template>
  </ol>
  <p v-if="mode === 'recorded'" class="source">Source: <code>poc/runs/run-02/raw/{{ id }}.json</code> and <code>drafts.md</code>. Math: <code>poc/domain</code>.</p>
  <p v-else-if="view" class="source">Source: live calls to <code>/api/llm</code> (prompts <code>poc/prompts/v2</code>). Math: <code>poc/domain</code>, in this browser. Nothing is saved.</p>
</template>

<style scoped>
.modes { margin: 1rem 0 0.75rem; }
.picker { margin: 0 0 0.25rem; }
.pick { min-width: 20rem; max-width: 100%; }
.why { margin-bottom: 1rem; }
.live { margin-bottom: 1rem; }
.samples { margin-bottom: 0.75rem; }
.fields-form { display: grid; grid-template-columns: 5rem 1fr; gap: 0.5rem 0.75rem; align-items: start; margin-bottom: 0.5rem; }
.fields-form label { padding-top: 0.5rem; font-size: 0.85rem; color: var(--muted); }
.fields-form :deep(textarea) { font-family: var(--mono); font-size: 0.85rem; }
.err { margin-top: 0.75rem; }
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
@media (max-width: 800px) {
  .pick { min-width: 0; width: 100%; }
  .fields-form { grid-template-columns: 1fr; }
  .fields-form label { padding-top: 0; }
}
</style>
