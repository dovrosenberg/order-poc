/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { phase1Plugin } from './phase1';
import { devApiPlugin } from './dev-api';

const appDir = fileURLToPath(new URL('.', import.meta.url));
const pocDir = fileURLToPath(new URL('../poc', import.meta.url));
// Workspace dependencies (primeicons fonts) are hoisted to the repo root.
const rootModules = fileURLToPath(new URL('../node_modules', import.meta.url));

export default defineConfig({
  plugins: [
    vue(),
    phase1Plugin(pocDir.replace(/[\\/]$/, ''), appDir.replace(/[\\/]$/, '')),
    devApiPlugin(fileURLToPath(new URL('../api/llm.ts', import.meta.url)), fileURLToPath(new URL('../poc/.env', import.meta.url))),
  ],
  server: { fs: { allow: [appDir, pocDir, rootModules] } },
  test: { environment: 'node', include: ['src/**/*.test.ts', '*.test.ts'] },
});
