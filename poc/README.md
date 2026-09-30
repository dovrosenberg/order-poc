# RFQ-to-quote POC (Phase 1)

Turns 12 fictional quote-request emails into matched, priced line items with flags, and scores them against `data/answer_key.json`. The LLM reads and writes language. TypeScript does all the math.

Requires Node 20.12+. All commands run from `poc/`.

## Run it in five commands

```bash
npm install                                  # 1. install
npm test                                     # 2. domain tests (conversion, split fulfillment, pricing, floor margin)
npm start -- --replay runs/run-02            # 3. no key needed: rerun the code steps on run 2's recorded LLM outputs
cp .env.example .env                         # 4. then set ANTHROPIC_API_KEY in .env
npm start -- --prompts v2                    # 5. live run of all 12 emails with the final prompts; writes runs/run-NN/
```

- Step 3 writes `runs/replay-run-02/`. Its `results.csv` and `scorecard.md` should match `runs/run-02/`.
- Step 5 prints one line per email and the scorecard. The default prompt set is `v1` (run 1).

## Other commands

| Command | What it does |
| --- | --- |
| `npm start -- --request R03` | Run one email and print each step's output. Writes `runs/scratch-R03/`. |
| `npm start -- --model <id>` | Override the model. Default `claude-sonnet-5-5`, or `MODEL` in `.env`. |
| `npm run score -- runs/run-01` | Re-score a run folder against the answer key. Rewrites its `scorecard.md`. |

## Layout

| Path | Contents |
| --- | --- |
| `run.ts` | CLI entry. Loads data, calls the steps per email, writes the run folder. |
| `score.ts` | Scoring: classification, SKU, qty/unit, flag recall, and a list of misses. |
| `domain/` | Pure functions: unit conversion, plant allocation, pricing, flags. Vitest tests. |
| `llm/` | Only code that calls Anthropic: classify, extract, match, draft. Output validated with Zod. |
| `prompts/v1`, `prompts/v2` | Prompt text per step. v1 is run 1. v2 is run 2. |
| `data/` | Fictional CSV exports, pricing, 12 emails, answer key. |
| `runs/run-01`, `runs/run-02` | Committed outputs: `results.csv`, `drafts.md`, `scorecard.md`, `prompts/`, `raw/`. |
| `LOG.md` | Timestamped log of the build. |
