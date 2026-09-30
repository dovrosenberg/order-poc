import { existsSync } from 'node:fs';
if (existsSync(new URL('./.env', import.meta.url))) process.loadEnvFile(new URL('./.env', import.meta.url));
