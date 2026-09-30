# Air Filtration RFQ-to-Quote POC

A 30-minute POC (poc/) plus a walkthrough app (app/) that replays it.
Full spec: docs/SPEC.md. Read the relevant section before starting any phase.

## Rules
- The LLM reads and writes language; TypeScript does all math. No numbers from the model.
- All data is fictional (Northfield Air Filtration). Never use real company names.
- poc/ must not depend on app/. poc/domain/ is pure: no I/O, no LLM calls.
- Only poc/llm/ calls Anthropic. The browser never does; app uses api/llm.ts.
- The API key never appears in client code, bundles, or browser storage.
- Never regenerate or edit committed poc/runs/ folders. Bad results are part of the story.
- During Phase 1, log each step to poc/LOG.md with a clock time and commit at milestones.
- TypeScript strict mode everywhere. Validate all LLM output with Zod.

## Commands (from poc/)
- npm start: run all emails, write runs/run-NN/
- npm start -- --request R03: run one email, verbose
- npm start -- --replay runs/run-02: rerun code steps without a key
- npm run score -- runs/run-01: rescore a run
- npm test: domain tests