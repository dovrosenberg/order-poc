# Phase 1 log

Clock start: 17:57 (2026-09-30).

- **17:57** Start. Plan: scaffold, then build domain/ and llm/ in parallel subagents, then run.ts + score.ts, then run 1.
- **17:59** Scaffold done: package.json, tsconfig (strict), deps (@anthropic-ai/sdk, zod, csv-parse, tsx, vitest). Appended pipeline contract types (Extraction, LineMatch, PricedLine, ...) to domain/types.ts so both subagents build against one file. Assumption: answer-key qty/unit = quantity as requested, not sell quantity.
- **18:00** domain/ + load.ts (subagent A) and llm/ + prompts/v1 (subagent B) built in parallel. 20 Vitest tests pass; tsc strict clean. Data quirk: roll contents use '|' separator ("225 SF|90 LF").
- **18:00** Wired run.ts (97 lines) and score.ts. Scoring pairs answer lines to extracted lines by SKU hit first (answer SKU or note "acceptable:" list), then by order. Flag recall only; extra flags listed, not scored. Unknown sender falls back to tier C / midwest. Retrieval is not used: full catalog, aliases, and crosswalk go in the match prompt; at real catalog size retrieval would replace this.
