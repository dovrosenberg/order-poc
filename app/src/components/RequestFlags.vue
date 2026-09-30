<script setup lang="ts">
import type { RunData } from '../phase1-types';
import { data } from '../data';
import FlagList from './FlagList.vue';

const props = defineProps<{ run: RunData }>();
const expected = (id: string) => data.answerKey.find((k) => k.requestId === id)?.expectedFlags ?? [];
const expectedClass = (id: string) => data.answerKey.find((k) => k.requestId === id)?.classification;
</script>

<template>
  <div class="scroll">
    <table class="plain">
      <thead>
        <tr><th>Req</th><th>Classified as</th><th>Expected flags</th><th>Flags raised</th></tr>
      </thead>
      <tbody>
        <tr v-for="r in props.run.requests" :key="r.requestId">
          <td>{{ r.requestId }}</td>
          <td>
            {{ r.classification }}
            <span v-if="r.classification !== expectedClass(r.requestId)" class="bad">(expected {{ expectedClass(r.requestId) }})</span>
          </td>
          <td><span v-if="expected(r.requestId).length">{{ expected(r.requestId).join(', ') }}</span><span v-else class="muted">none</span></td>
          <td><FlagList :flags="r.flags" :expected="expected(r.requestId)" /></td>
        </tr>
      </tbody>
    </table>
  </div>
  <p class="source">
    Green: expected by the answer key. Amber: raised but not expected (not scored). Red: expected but missed.
    Source: <code>runs/{{ props.run.name }}/raw/*.json</code> and <code>data/answer_key.json</code>.
  </p>
</template>

<style scoped>
.scroll { overflow-x: auto; }
.bad { color: var(--del-fg); }
</style>
