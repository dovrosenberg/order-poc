/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { phase1Plugin } from './phase1';

const appDir = fileURLToPath(new URL('.', import.meta.url));
const pocDir = fileURLToPath(new URL('../poc', import.meta.url));

export default defineConfig({
  plugins: [vue(), phase1Plugin(pocDir.replace(/[\\/]$/, ''), appDir.replace(/[\\/]$/, ''))],
  server: { fs: { allow: [appDir, pocDir] } },
  test: { environment: 'node', include: ['src/**/*.test.ts', '*.test.ts'] },
});
