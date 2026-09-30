<script setup lang="ts">
import type { DiffLine } from '../lib/diff';

const props = defineProps<{ lines: DiffLine[]; title: string; context?: number }>();

// Show changed lines plus a few lines of context; collapse the rest.
function visible(lines: DiffLine[], ctx: number): (DiffLine | null)[] {
  const keep = lines.map(() => false);
  lines.forEach((l, i) => {
    if (l.kind === 'same') return;
    for (let k = Math.max(0, i - ctx); k <= Math.min(lines.length - 1, i + ctx); k++) keep[k] = true;
  });
  const out: (DiffLine | null)[] = [];
  lines.forEach((l, i) => {
    if (keep[i]) out.push(l);
    else if (out[out.length - 1] !== null) out.push(null);
  });
  return out;
}
</script>

<template>
  <div class="diff">
    <div class="title"><code>{{ props.title }}</code></div>
    <div v-for="(l, i) in visible(props.lines, props.context ?? 1)" :key="i" :class="['line', l?.kind ?? 'gap']">
      <template v-if="l"><span class="sign">{{ l.kind === 'add' ? '+' : l.kind === 'del' ? '-' : ' ' }}</span><pre>{{ l.text }}</pre></template>
      <template v-else><span class="sign"> </span><pre>…</pre></template>
    </div>
  </div>
</template>

<style scoped>
.diff { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; font-family: var(--mono); font-size: 0.82rem; }
.title { padding: 0.4rem 0.75rem; background: var(--panel); border-bottom: 1px solid var(--border); }
.line { display: flex; padding: 0.1rem 0.75rem; }
.sign { width: 1.2rem; flex: none; user-select: none; }
.add { background: var(--add-bg); color: var(--add-fg); }
.del { background: var(--del-bg); color: var(--del-fg); }
.gap { color: var(--muted); }
</style>
