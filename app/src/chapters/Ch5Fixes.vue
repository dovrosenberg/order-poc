<script setup lang="ts">
import { data } from '../data';
import { facts } from '../lib/facts';
import { lineDiff, parseUnified, type DiffLine } from '../lib/diff';
import type { Miss } from '../phase1-types';
import DiffView from '../components/DiffView.vue';

const misses = facts.run1.misses;
const log = data.log.entries;
const entry = (time: string) => log.find((e) => e.time === time);
// Sub-bullet of the 18:09 log entry that starts with the given text.
const fixNote = (startsWith: string) =>
  entry('18:09')?.text.split('\n').find((l) => l.replace(/^- /, '').startsWith(startsWith))?.replace(/^- /, '') ?? '';

interface Group { title: string; misses: Miss[]; fixKind: 'Prompt' | 'Code' | 'No change'; note: string; diff?: { title: string; lines: DiffLine[] } }

const groups: Group[] = [
  {
    title: 'Implicit unit extracted as null',
    misses: misses.filter((m) => m.cause === 'qty_unit'),
    fixKind: 'Prompt',
    note: fixNote('Implicit unit'),
    diff: { title: 'poc/prompts/v1/extract.md → v2/extract.md', lines: lineDiff(data.prompts.v1.extract, data.prompts.v2.extract) },
  },
  {
    title: 'MERV rating not made returned “no match” instead of a substitution',
    misses: misses.filter((m) => m.requestId === 'R09' && (m.cause === 'wrong_sku' || m.cause === 'missing_flag')),
    fixKind: 'Prompt',
    note: fixNote('Rating not made'),
    diff: { title: 'poc/prompts/v1/match.md → v2/match.md', lines: lineDiff(data.prompts.v1.match, data.prompts.v2.match) },
  },
  {
    title: 'Date-only need-by read as midnight UTC',
    misses: misses.filter((m) => m.requestId === 'R04' && m.cause === 'extra_flag'),
    fixKind: 'Code',
    note: fixNote('Extra short_stock on R04'),
    diff: { title: 'poc/domain/flags.ts (commit eeaa1eb)', lines: parseUnified(data.flagsFixDiff) },
  },
  {
    title: 'Extra low-confidence flag on R09',
    misses: misses.filter((m) => m.requestId === 'R09' && m.cause === 'extra_flag'),
    fixKind: 'No change',
    note: fixNote('Extra low_confidence'),
  },
];

const byRequest = Object.entries(facts.qtyMissByRequest).map(([id, n]) => `${id} (${n})`).join(', ');
const r12Count = facts.qtyMissByRequest.R12 ?? 0;
</script>

<template>
  <div class="narration">
    <p>
      Most of run 1's misses had one cause. The model left the unit blank on {{ facts.qtyMissTotal }} lines when the
      email gave a count with no unit. {{ r12Count }} of those were in one equipment schedule (R12). I added one
      sentence to the extract prompt.
    </p>
    <p>
      One line asked for a MERV 16 pleated filter, which Northfield does not make. The model returned “no match”
      instead of offering the MERV 13 at the same size. I added a rule to the match prompt.
    </p>
    <p>
      I also found a date bug in my code. A need-by date was treated as midnight UTC, which cost a day and raised a
      false stock warning on R04.
    </p>
  </div>

  <section v-for="g in groups" :key="g.title" class="group">
    <h2>{{ g.title }} <span class="muted small">· {{ g.misses.length }} scorecard {{ g.misses.length === 1 ? 'entry' : 'entries' }} · {{ g.fixKind }}</span></h2>
    <div class="grid-2">
      <div>
        <div class="scroll">
          <table class="plain">
            <thead><tr><th>Req</th><th>Cause</th><th>Expected</th><th>Got</th></tr></thead>
            <tbody>
              <tr v-for="(m, i) in g.misses" :key="i">
                <td>{{ m.requestId }}</td><td>{{ m.cause }}</td><td><code>{{ m.expected }}</code></td><td><code>{{ m.got }}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="g.title.startsWith('Implicit')" class="source">By request: {{ byRequest }}.</p>
      </div>
      <div class="panel log">
        <div class="muted small">LOG.md, 18:09</div>
        <p>{{ g.note }}</p>
      </div>
    </div>
    <DiffView v-if="g.diff" :title="g.diff.title" :lines="g.diff.lines" class="diff" />
  </section>

  <div class="panel log">
    <div class="muted small">LOG.md, 18:08 (as written)</div>
    <p>{{ entry('18:08')?.text }}</p>
    <p class="muted small">
      This entry says “16 of 17” qty/unit misses were implicit units. The run-01 scorecard shows all {{ facts.qtyMissTotal }} are.
      The log is shown unedited.
    </p>
  </div>
</template>

<style scoped>
.group { margin-bottom: 2rem; }
.scroll { overflow-x: auto; max-height: 20rem; overflow-y: auto; }
.log p { margin: 0.25rem 0 0; font-size: 0.9rem; white-space: pre-line; }
.diff { margin-top: 1rem; }
</style>
