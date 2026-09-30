# Phase 1 log

Clock start: 17:57 (2026-09-30).

- **17:57** Start. Plan: scaffold, then build domain/ and llm/ in parallel subagents, then run.ts + score.ts, then run 1.
- **17:59** Scaffold done: package.json, tsconfig (strict), deps (@anthropic-ai/sdk, zod, csv-parse, tsx, vitest). Appended pipeline contract types (Extraction, LineMatch, PricedLine, ...) to domain/types.ts so both subagents build against one file. Assumption: answer-key qty/unit = quantity as requested, not sell quantity.
- **18:00** domain/ + load.ts (subagent A) and llm/ + prompts/v1 (subagent B) built in parallel. 20 Vitest tests pass; tsc strict clean. Data quirk: roll contents use '|' separator ("225 SF|90 LF").
- **18:00** Wired run.ts (97 lines) and score.ts. Scoring pairs answer lines to extracted lines by SKU hit first (answer SKU or note "acceptable:" list), then by order. Flag recall only; extra flags listed, not scored. Unknown sender falls back to tier C / midwest. Retrieval is not used: full catalog, aliases, and crosswalk go in the match prompt; at real catalog size retrieval would replace this.
- **18:02** First live call (R02 smoke test) failed: Anthropic API returned 400 "Your credit balance is too low" (req_011CfaNx4jxocb448Kji6fFK). Blocked on account credits; no run folder written.
- **18:04** Credits added. Next failure: 400 'tool_choice: type "tool" and "any" are not supported for this model' (claude-sonnet-5-5). Fix in llm/client.ts: tool_choice auto + system line 'Respond only by calling the <tool> tool exactly once'; existing retry covers a missing tool block. R02 smoke test then ran end to end. It extracted '40 single filters' with unit null. Left as-is for run 1.
- **18:08** Run 1 (runs/run-01, prompts v1, claude-sonnet-5-5). Classification 12/12, SKU 44/45, qty/unit 28/45, flag recall 8/9. Largest miss group: 16 of 17 qty/unit misses are an implicit unit ("8 of the HEPAs", equipment-schedule counts) extracted as null instead of EA (R07, R12). Other misses: R09 MERV 16 line returned no_match instead of substitution to PL-M13-20254, so the substitution flag was missed. Unscored extra flag: short_stock on R04. Stopped here as instructed; no run 2 yet.
