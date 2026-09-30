<script setup lang="ts">
import { computed, ref } from 'vue';
import Tag from 'primevue/tag';
import { data } from '../data';
import { facts } from '../lib/facts';
import { COMMITS } from '../content/commits';

const BOX = 30;
const t = facts.timeline;
const min = t.minutes;
const clock0 = min(t.start);
const dev = data.devLog;

// Axis runs from the first thing that happened (prompt or commit), rounded down to 5 minutes, to the end of the box.
const firstEvent = Math.min(clock0, ...(dev?.prompts.map((p) => min(p.time)) ?? []), ...COMMITS.map((c) => min(c.time)));
const axisStart = Math.floor(firstEvent / 5) * 5;
const axisEnd = clock0 + BOX;
const span = axisEnd - axisStart;
const x = (time: string) => `${((min(time) - axisStart) / span) * 100}%`;
const w = (from: string, to: string) => `${((min(to) - min(from)) / span) * 100}%`;
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const ticks = Array.from({ length: Math.floor(span / 5) + 1 }, (_, i) => axisStart + i * 5);
const offset = (time: string) => min(time) - clock0;

type Source = 'prompt' | 'log' | 'note' | 'commit';
interface Item { time: string; source: Source; title: string; body: string; context?: string | null; notes?: string[] }

const logEntries = data.log.entries;
const commitTimes = new Set(logEntries.map((e) => e.time));
const firstLine = (text: string) => text.split('\n')[0]!.replace(/\*\*/g, '');

const items: Item[] = [
  ...(dev?.prompts.map((p) => ({ time: p.time, source: 'prompt' as const, title: p.prompt.replace(/\s*\n\s*/g, ' '), body: p.prompt, context: p.context, notes: p.notes })) ?? []),
  ...logEntries.map((e) => ({ time: e.time, source: 'log' as const, title: firstLine(e.text), body: e.text.replace(/\*\*/g, '') })),
  ...(dev?.notes.map((n) => ({ time: n.time, source: 'note' as const, title: n.text, body: n.text })) ?? []),
  // Commits with no LOG.md entry at the same minute get their own row.
  ...COMMITS.filter((c) => !commitTimes.has(c.time)).map((c) => ({ time: c.time, source: 'commit' as const, title: c.subject, body: `${c.hash} ${c.subject}` })),
];
const order: Record<Source, number> = { prompt: 0, log: 1, commit: 2, note: 3 };
items.sort((a, b) => min(a.time) - min(b.time) || order[a.source] - order[b.source]);

const selected = ref(Math.max(0, items.findIndex((i) => i.source === 'prompt')));
const current = computed(() => items[selected.value]);
const select = (it: Item) => { selected.value = items.indexOf(it); };
const commitsAt = (it: Item) => (it.source === 'log' ? COMMITS.filter((c) => c.time === it.time) : []);

const promptItems = items.filter((i) => i.source === 'prompt');
const logItems = items.filter((i) => i.source === 'log');
const preClock = promptItems.filter((i) => offset(i.time) < 0);
const inClock = promptItems.filter((i) => offset(i.time) >= 0);
const withCommit = logEntries.filter((e) => COMMITS.some((c) => c.time === e.time)).length;

const tagFor: Record<Source, { label: string; severity: 'contrast' | 'secondary' | 'info' | 'warn' }> = {
  prompt: { label: 'My prompt', severity: 'info' },
  log: { label: 'LOG.md', severity: 'secondary' },
  note: { label: 'My note', severity: 'warn' },
  commit: { label: 'Commit', severity: 'secondary' },
};
</script>

<template>
  <div class="narration">
    <p>
      The clock started at {{ t.start }} and stopped at {{ t.stop }}: {{ t.elapsed }} minutes of the {{ BOX }}-minute box.
    </p>
    <p v-if="dev">
      The top lane shows the {{ promptItems.length }} prompts I typed into Claude Code, from my own notes.
      {{ preClock.length }} came before the clock ({{ preClock[0]?.time }}–{{ t.start }}): generating the test data,
      planning Phase 1, and a spec update. {{ inClock.length }} came during it. The bottom lane is the log Claude Code kept
      as it worked.
    </p>
    <p v-if="t.blocked">
      {{ t.blockedMinutes }} of the {{ t.elapsed }} minutes ({{ t.blocked.from }}–{{ t.blocked.to }}) went to getting the
      API key and credits working. Two parallel subagents wrote the domain code and the model-calling code in about three
      minutes. {{ withCommit }} of the {{ logEntries.length }} log entries have a commit at the same minute.
    </p>
  </div>

  <div class="timeline">
    <div class="lanes">
      <div class="lane-label">My prompts</div>
      <div class="track">
        <div class="pre" :style="{ left: '0%', width: w(hhmm(axisStart), t.start) }" />
        <div class="box" :style="{ left: x(t.start), width: w(t.start, hhmm(axisEnd)) }" />
        <button
          v-for="it in promptItems" :key="'p' + it.time" :class="['dot', 'dot-prompt', { active: current === it }]"
          :style="{ left: x(it.time) }" :aria-label="`Prompt at ${it.time}: ${it.title}`" @click="select(it)"
        />
      </div>

      <div class="lane-label">Claude Code log</div>
      <div class="track">
        <div class="pre" :style="{ left: '0%', width: w(hhmm(axisStart), t.start) }" />
        <div class="box" :style="{ left: x(t.start), width: w(t.start, hhmm(axisEnd)) }" />
        <div class="used" :style="{ left: x(t.start), width: w(t.start, t.stop) }" />
        <div v-if="t.blocked" class="blocked" :style="{ left: x(t.blocked.from), width: w(t.blocked.from, t.blocked.to) }" title="Blocked on API key and credits" />
        <button
          v-for="(it, i) in logItems" :key="'l' + i" :class="['dot', { active: current === it }]"
          :style="{ left: x(it.time) }" :aria-label="`Log at ${it.time}: ${it.title}`" @click="select(it)"
        />
      </div>

      <div />
      <div class="scale">
        <span v-for="m in ticks" :key="m" :style="{ left: `${((m - axisStart) / span) * 100}%` }">
          {{ hhmm(m) }}<br /><span class="muted">{{ m - clock0 >= 0 ? `+${m - clock0}` : m - clock0 }}</span>
        </span>
      </div>
    </div>
    <div class="legend small muted">
      <span><i class="sw sw-pre" /> before the clock</span>
      <span><i class="sw sw-used" /> clock running ({{ t.elapsed }} min)</span>
      <span v-if="t.blocked"><i class="sw sw-blocked" /> blocked</span>
      <span><i class="sw sw-box" /> unused part of the {{ BOX }}-minute box</span>
    </div>
  </div>

  <div v-if="current" class="panel selected">
    <div class="row">
      <Tag :value="tagFor[current.source].label" :severity="tagFor[current.source].severity" />
      <strong>{{ current.time }}</strong>
      <span class="muted small">{{ offset(current.time) < 0 ? `${-offset(current.time)} min before the clock` : `minute ${offset(current.time)}` }}</span>
      <code v-for="c in commitsAt(current)" :key="c.hash" class="small">{{ c.hash }} {{ c.subject }}</code>
    </div>
    <p v-if="current.context" class="context">{{ current.context }}</p>
    <pre v-if="current.source === 'prompt'" class="prompt">❯ {{ current.body }}</pre>
    <p v-else class="text">{{ current.body }}</p>
    <p v-for="(n, i) in current.notes ?? []" :key="i" class="context">Note: {{ n }}</p>
  </div>


  <h2>Everything in order</h2>
  <div class="scroll">
    <table class="plain">
      <thead><tr><th>Time</th><th class="num">Min</th><th>Source</th><th>Entry</th><th>Commit</th></tr></thead>
      <tbody>
        <tr
          v-for="(it, i) in items" :key="i" :class="{ current: current === it, 'before-clock': offset(it.time) < 0 }"
          tabindex="0" @click="select(it)" @keydown.enter="select(it)"
        >
          <td>{{ it.time }}</td>
          <td class="num">{{ offset(it.time) }}</td>
          <td class="nowrap"><Tag :value="tagFor[it.source].label" :severity="tagFor[it.source].severity" /></td>
          <td :class="{ mono: it.source === 'prompt' }">{{ it.title }}</td>
          <td>
            <code v-for="c in commitsAt(it)" :key="c.hash">{{ c.hash }}</code>
            <code v-if="it.source === 'commit'">{{ it.body.split(' ')[0] }}</code>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <p class="source">
    Sources: <code>poc/prompt-log.txt</code> (my notes, unedited), <code>poc/LOG.md</code> (unedited), and <code>git log</code>.
    Min is minutes from the clock start at {{ t.start }}; negative is before it.
  </p>
</template>

<style scoped>
.timeline { margin: 1.5rem 0 1rem; padding: 0 1rem; overflow-x: clip; }
.lanes { display: grid; grid-template-columns: 8.5rem 1fr; row-gap: 0.9rem; align-items: center; }
.lane-label { font-size: 0.8rem; color: var(--muted); }
.track { position: relative; height: 14px; }
.pre { position: absolute; top: 0; bottom: 0; background: repeating-linear-gradient(90deg, var(--border), var(--border) 2px, transparent 2px, transparent 5px); border-radius: 7px 0 0 7px; }
.box { position: absolute; top: 0; bottom: 0; background: var(--border); border-radius: 0 7px 7px 0; }
.used { position: absolute; top: 0; bottom: 0; background: var(--p-surface-400); }
.blocked { position: absolute; top: 0; bottom: 0; background: repeating-linear-gradient(45deg, var(--del-fg), var(--del-fg) 3px, transparent 3px, transparent 6px); opacity: 0.6; }
.dot { position: absolute; top: 50%; width: 16px; height: 16px; margin-left: -8px; transform: translateY(-50%); border-radius: 50%; border: 2px solid var(--bg); background: var(--text); cursor: pointer; padding: 0; }
.dot-prompt { border-radius: 3px; background: var(--note-border); }
.dot.active { outline: 3px solid var(--p-primary-color); outline-offset: 1px; }
.dot:focus-visible { outline: 2px solid var(--p-primary-color); outline-offset: 2px; }
.scale { position: relative; height: 2.4rem; font-size: 0.72rem; color: var(--muted); }
.scale > span { position: absolute; transform: translateX(-50%); top: 0.1rem; text-align: center; line-height: 1.2; }
.legend { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.25rem; padding-left: 8.5rem; }
.sw { display: inline-block; width: 12px; height: 12px; border-radius: 3px; vertical-align: -2px; margin-right: 0.3rem; }
.sw-pre { background: repeating-linear-gradient(90deg, var(--border), var(--border) 2px, transparent 2px, transparent 4px); border: 1px solid var(--border); }
.sw-used { background: var(--p-surface-400); }
.sw-blocked { background: var(--del-fg); opacity: 0.6; }
.sw-box { background: var(--border); }
.selected { margin-bottom: 1rem; }
.context { margin: 0.5rem 0 0; font-size: 0.88rem; font-style: italic; color: var(--muted); }
.prompt { margin-top: 0.5rem; padding: 0.6rem 0.8rem; background: var(--bg); border: 1px solid var(--border); border-left: 4px solid var(--note-border); border-radius: 0 6px 6px 0; }
.text { white-space: pre-line; margin: 0.5rem 0 0; font-size: 0.92rem; }
.scroll { overflow-x: auto; }
.mono { font-family: var(--mono); font-size: 0.82rem; }
tr.current td { background: var(--panel); }
tr.before-clock td:first-child, tr.before-clock td:nth-child(2) { color: var(--muted); }
tbody tr { cursor: pointer; }
@media (max-width: 800px) {
  .lanes { grid-template-columns: 1fr; row-gap: 0.4rem; }
  .legend { padding-left: 0; }
  .scale > span:nth-child(even) { display: none; }
}
</style>
