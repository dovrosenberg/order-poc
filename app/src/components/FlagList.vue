<script setup lang="ts">
import Tag from 'primevue/tag';

const props = defineProps<{ flags: string[]; expected?: string[] }>();
const sev = (f: string) => (!props.expected ? 'secondary' : props.expected.includes(f) ? 'success' : 'warn');
</script>

<template>
  <span class="flags">
    <Tag v-for="f in props.flags" :key="f" :value="f" :severity="sev(f)" />
    <Tag
      v-for="f in (props.expected ?? []).filter((x) => !props.flags.includes(x))" :key="'m-' + f"
      :value="`missed: ${f}`" severity="danger"
    />
    <span v-if="props.flags.length === 0 && !(props.expected ?? []).length" class="muted">—</span>
  </span>
</template>

<style scoped>
.flags { display: inline-flex; flex-wrap: wrap; gap: 0.25rem; }
</style>
