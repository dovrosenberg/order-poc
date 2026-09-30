# Walkthrough app (Phase 2)

Replays the Phase 1 POC in eight chapters. Every number is read from `poc/data/`, `poc/runs/`, and `poc/LOG.md` at build time. Nothing under `poc/runs/` is written.

Without a passcode it shows recorded results only. With one, the Try-it chapter can run a pasted email live through `api/llm.ts` (see the root README, "Security design").

## Run

```
npm install               # from the repo root (npm workspaces: poc and app)
npm run dev               # http://localhost:5173
```

Live mode locally: put `ANTHROPIC_API_KEY` in `poc/.env`, run `DEMO_PASSCODE=<code> npm run dev`, and open `/?code=<code>#/8`. `dev-api.ts` serves `api/llm.ts` at `/api/llm` in the dev server only.

## Other commands

| Command | What it does |
| --- | --- |
| `npm test` | Checks the recomputed scorecards equal the committed `scorecard.md` files, and that the Try-it math reproduces every row of `results.csv` in both runs |
| `npm run typecheck` | `vue-tsc` for the app, `tsc` for the build-time loader |
| `npm run build` | Typecheck, then a static build in `dist/` |

## How the data gets in

`phase1.ts` is a Vite plugin. It runs in Node, calls `poc/load.ts` and `poc/score.ts`, and serves the result as the module `virtual:phase1`. The browser bundle contains data only, no file reads.

`src/lib/live.ts` holds the passcode in memory and calls `/api/llm`. It validates each response again with the Zod schemas in `poc/llm/schemas.ts`.

`src/lib/quote.ts` repeats the wiring of the code steps in `poc/run.ts` (convert, allocate, price, flag) using `poc/domain`. `quote.test.ts` checks it against the recorded runs. Run 1 R04 is a known difference: run 1 was produced before the 18:09 need-by fix.
