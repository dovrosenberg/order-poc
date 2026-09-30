<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import Button from 'primevue/button';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { CHAPTERS } from './chapters';
import { liveCode, lock, unlock } from './lib/live';

const unlockOpen = ref(false);
const codeInput = ref('');
const unlockError = ref('');
const checking = ref(false);
async function submitCode() {
  checking.value = true;
  unlockError.value = '';
  const ok = await unlock(codeInput.value.trim());
  checking.value = false;
  if (!ok) { unlockError.value = 'That passcode was not accepted.'; return; }
  codeInput.value = '';
  unlockOpen.value = false;
}

const current = ref(0); // chapter number = index in CHAPTERS, starting at 0

function fromHash(): number {
  const n = Number(/^#\/(\d+)$/.exec(window.location.hash)?.[1]);
  return Number.isInteger(n) && n >= 0 && n < CHAPTERS.length ? n : 0;
}
const onHash = () => { current.value = fromHash(); };
onMounted(() => { current.value = fromHash(); window.addEventListener('hashchange', onHash); });
onBeforeUnmount(() => window.removeEventListener('hashchange', onHash));

watch(current, (n) => {
  if (fromHash() !== n) window.location.hash = `#/${n}`;
  document.getElementById('main')?.scrollTo({ top: 0 });
  window.scrollTo({ top: 0 });
});

const chapter = computed(() => CHAPTERS[current.value]!);
const go = (n: number) => { current.value = Math.min(CHAPTERS.length - 1, Math.max(0, n)); };
const options = CHAPTERS.map((c, i) => ({ label: `${i}. ${c.title}`, value: i }));
</script>

<template>
  <div class="layout">
    <aside class="rail">
      <div class="brand">
        <div class="brand-name">Northfield Air Filtration</div>
        <div class="muted small">RFQ-to-quote POC walkthrough</div>
      </div>
      <nav class="chapters">
        <a
          v-for="(c, i) in CHAPTERS" :key="c.title" :href="`#/${i}`"
          :class="{ active: current === i }" :aria-current="current === i ? 'page' : undefined"
        >
          <span class="n">{{ i }}</span>{{ c.title }}
        </a>
      </nav>
      <div class="mobile-nav">
        <Select v-model="current" :options="options" option-label="label" option-value="value" class="w-full" />
      </div>
    </aside>

    <main id="main" class="main">
      <header class="topbar">
        <span class="muted small">Chapter {{ current }} of {{ CHAPTERS.length - 1 }}</span>
        <span class="row">
          <template v-if="liveCode">
            <Tag value="Live mode on" severity="success" icon="pi pi-lock-open" />
            <Button label="Lock" size="small" severity="secondary" text @click="lock" />
          </template>
          <template v-else>
            <Tag value="Recorded results only" severity="secondary" />
            <Button label="Unlock live mode" size="small" severity="secondary" outlined icon="pi pi-lock" @click="unlockOpen = true" />
          </template>
        </span>
      </header>
      <article class="content">
        <h1>{{ current }}. {{ chapter.title }}</h1>
        <component :is="chapter.component" />
        <footer class="pager">
          <Button label="Back" icon="pi pi-arrow-left" severity="secondary" text :disabled="current === 0" @click="go(current - 1)" />
          <Button
            v-if="current < CHAPTERS.length - 1" :label="`Next: ${CHAPTERS[current + 1]!.title}`"
            icon="pi pi-arrow-right" icon-pos="right" @click="go(current + 1)"
          />
        </footer>
      </article>
    </main>
  </div>
  <Dialog v-model:visible="unlockOpen" modal header="Unlock live mode" :style="{ width: '24rem', maxWidth: 'calc(100vw - 32px)' }">
    <form class="unlock" @submit.prevent="submitCode">
      <p class="muted small">Live mode sends a pasted email to the model through the server. The passcode stays in this tab's memory until you reload.</p>
      <InputText v-model="codeInput" type="password" placeholder="Passcode" autofocus aria-label="Passcode" autocomplete="off" />
      <p v-if="unlockError" class="err small">{{ unlockError }}</p>
      <Button type="submit" label="Unlock" :loading="checking" :disabled="!codeInput.trim()" />
    </form>
  </Dialog>
</template>

<style scoped>
.layout { display: grid; grid-template-columns: 250px 1fr; min-height: 100vh; }
.rail { background: var(--rail); border-right: 1px solid var(--border); padding: 1.25rem 0.75rem; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
.brand { padding: 0 0.5rem 1.25rem; }
.brand-name { font-weight: 600; }
.chapters { display: flex; flex-direction: column; gap: 2px; }
.chapters a { display: flex; gap: 0.6rem; align-items: baseline; padding: 0.45rem 0.6rem; border-radius: 6px; color: var(--text); text-decoration: none; font-size: 0.92rem; }
.chapters a:hover { background: var(--border); }
.chapters a.active { background: var(--p-primary-color); color: var(--p-primary-contrast-color); }
.chapters .n { width: 1.1rem; color: inherit; opacity: 0.6; font-variant-numeric: tabular-nums; }
.mobile-nav { display: none; }
.main { min-width: 0; }
.topbar { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 2rem; border-bottom: 1px solid var(--border); }
.content { max-width: 68rem; padding: 2rem 2rem 3rem; }
.pager { display: flex; justify-content: space-between; margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--border); gap: 0.5rem; }
.w-full { width: 100%; }
.topbar .row { gap: 0.5rem; }
.unlock { display: flex; flex-direction: column; gap: 0.75rem; }
.unlock .err { color: var(--del-fg); margin: 0; }
@media (max-width: 800px) {
  .layout { grid-template-columns: 1fr; }
  .rail { position: static; height: auto; border-right: 0; border-bottom: 1px solid var(--border); padding: 0.75rem 16px; }
  .brand { padding: 0 0 0.5rem; }
  .chapters { display: none; }
  .mobile-nav { display: block; }
  .topbar { padding: 0.5rem 16px; }
  .content { padding: 1.25rem 16px 2rem; }
}
</style>
