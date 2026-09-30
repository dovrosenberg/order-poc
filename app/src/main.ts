import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import App from './App.vue';
import { takeCodeFromUrl } from './lib/live';
import 'primeicons/primeicons.css';
import './styles.css';

const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const Quiet = definePreset(Aura, {
  semantic: { primary: Object.fromEntries(shades.map((s) => [s, `{slate.${s}}`])) },
});

takeCodeFromUrl();

createApp(App)
  .use(PrimeVue, { theme: { preset: Quiet, options: { darkModeSelector: 'system' } } })
  .mount('#app');
