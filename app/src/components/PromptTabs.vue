<script setup lang="ts">
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';

const props = defineProps<{ prompts: Record<'classify' | 'extract' | 'match' | 'draft', string> }>();
const steps = ['classify', 'extract', 'match', 'draft'] as const;
</script>

<template>
  <Tabs value="classify">
    <TabList>
      <Tab v-for="s in steps" :key="s" :value="s">{{ s }}</Tab>
    </TabList>
    <TabPanels>
      <TabPanel v-for="s in steps" :key="s" :value="s">
        <pre class="prompt">{{ props.prompts[s] }}</pre>
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<style scoped>
.prompt { max-height: 22rem; overflow: auto; background: var(--panel); border: 1px solid var(--border); border-radius: 6px; padding: 0.75rem; }
</style>
