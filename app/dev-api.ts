// Dev only: serves api/llm.ts at /api/llm under `vite dev`, so live mode works locally without the Vercel CLI.
// Loads ANTHROPIC_API_KEY (and optional DEMO_PASSCODE) from poc/.env into this Node process. Nothing reaches the client.
import { existsSync } from 'node:fs';
import type { Plugin } from 'vite';

export function devApiPlugin(apiFile: string, envFile: string): Plugin {
  return {
    name: 'naf-dev-api',
    apply: 'serve',
    configureServer(server) {
      if (existsSync(envFile)) process.loadEnvFile(envFile);
      server.middlewares.use('/api/llm', (req, res) => {
        const chunks: Buffer[] = [];
        req.on('data', (c: Buffer) => chunks.push(c));
        req.on('end', async () => {
          try {
            const mod = (await server.ssrLoadModule(apiFile)) as { POST: (r: Request) => Promise<Response> };
            if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
            const headers = new Headers();
            for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v);
            const out = await mod.POST(new Request('http://localhost/api/llm', { method: 'POST', headers, body: Buffer.concat(chunks) }));
            res.statusCode = out.status;
            out.headers.forEach((v, k) => res.setHeader(k, v));
            res.end(await out.text());
          } catch (e) {
            server.config.logger.error(String(e));
            res.statusCode = 500;
            res.end();
          }
        });
      });
    },
  };
}
