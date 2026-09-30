# Walkthrough content plan (Phase 2)

Source of every number below: `poc/LOG.md`, `poc/runs/run-01/`, `poc/runs/run-02/`, `poc/data/`, and `git log`. Nothing here is regenerated.

## Flags summary

Chapters where the real results differ from what SPEC.md assumed:

| # | Chapter | What differs | Effect on the story |
| --- | --- | --- | --- |
| F1 | 6 Run 2 | Run 2 scores 100% on all four metrics. The prompt fixes were tuned on the same 12 emails. | No scored misses remain to "state plainly". The 100% is not an independent accuracy number. The chapter must say so up front. |
| F2 | 6 Run 2 | `domain/pricing.ts:19-21` rounds pallets up per line and sums them. R12 (16 small lines) becomes 15 pallets. Freight is $2,475.00 on a $1,912.39 subtotal. 15 pallets also triggers the 10-pallet volume break (8% extra discount). | A real pricing bug is in the committed quote. The scorecard does not score price, so it passed. The chapter has to show it as a known defect. |
| F3 | 7 Timeline | Clock ran 17:57 to 18:13: 16 minutes, not 30. 2 of those minutes (18:02-18:04) were blocked on API credits. Domain and LLM code were built by two parallel subagents in about 3 minutes. | The time box is half-used. The timeline is sparse (9 entries). Saying "subagents wrote the code" is required for honesty. |
| F4 | 4, 5 | Run 1 had one cause behind 17 of 21 misses: implicit units extracted as null. 15 of the 17 are in one email (R12). | The "misses grouped by cause" chapter has one large group and three single items. Less variety than the spec implies. The 62.2% qty/unit score comes mostly from one email. |
| F5 | 4, 6 | Flag scoring is recall only. Extra flags are listed but not scored. Run 1 had 2 extra flags, run 2 has 1 (R07 short_stock). | "Flag recall 100%" says nothing about false alarms. Show the extra-flag count next to recall. |
| F6 | 7, 5 | `LOG.md` 18:08 says "16 of 17 qty/unit misses are an implicit unit". The run-01 scorecard shows all 17 are. The 18:09 entry says 17. | Minor log inconsistency. Show the log as written; do not edit it. |
| F7 | 8 Try it | R07 spec says "alternatives offered". The run-02 draft gives one SKU per line with no alternative, and says "we have not yet confirmed which line is affected" for the short stock. | The sample case for "vague request" reads weaker than the spec intended. |
| F8 | 4, 8 | Request-level flags (bid_deadline, missing_info, below_floor) are not in `results.csv`. They exist only in `raw/RNN.json` at `record.flags`. | Not a story problem. The app must read `raw/*.json` for these. |
| F9 | 3 | The draft step (LLM) writes dollar figures. The prompt says "use only the numbers in the facts". No code checks the draft numbers against `results.csv`. I did not verify them. | The "no numbers from the model" rule is enforced by prompt only for drafts. Chapter 3 should say that. |

---

## Chapter 1. The problem

**Narration**

> Northfield Air Filtration takes 2 to 3 business days to answer a quote request. Slow quotes lose bids. Three reps share one inbox of about 60 requests a week. Each quote takes a rep about 35 minutes of re-keying. The goal: a quote out in under 4 business hours, with under 10 rep minutes spent reviewing it.

**Artifact:** SPEC.md "Problem scenario" and "Metrics". No run data. Numbers: 2-3 days, 35 minutes, 60 requests/week, targets 4 hours and 10 minutes.

```
+----------+------------------------------------------------------+
| CHAPTERS |  1. The problem                                      |
| >1 Prob. |                                                      |
|  2 Data  |  [narration paragraph]                               |
|  3 Appr. |                                                      |
|  4 Run 1 |  +--------------+ +--------------+ +--------------+  |
|  5 Fix   |  | 2-3 days     | | ~35 min      | | ~60 / week   |  |
|  6 Run 2 |  | request to   | | rep time per | | requests in  |  |
|  7 Time  |  | quote today  | | quote today  | | shared inbox |  |
|  8 Try   |  | target < 4 h | | target < 10  | |              |  |
|          |  +--------------+ +--------------+ +--------------+  |
|          |                                   [Back]  [Next >]   |
+----------+------------------------------------------------------+
```

---

## Chapter 2. What I asked for

**Narration**

> I asked for what a portco would hand over on day one: ERP exports, the pricing sheet, and a week of real quote emails. Here I used fictional stand-ins. The exports keep NetSuite-style column names like "Item Number" and "Std. Cost". I also wrote an answer key for the 12 emails before running anything, so the scoring is fixed in advance. Click the tabs below to see all the sample data. The inbox shows each email. The other tabs show each export as a sortable, filterable table.

**Artifact:** `poc/data/`.

| File | Rows |
| --- | --- |
| products.csv | 41 |
| aliases.csv | 53 |
| spec_crosswalk.csv | 18 |
| customers.csv | 12 |
| inventory.csv | 123 |
| pricing.json | 1 object (tiers A 18% / B 12% / C 5%, floor margin 22%) |
| requests.json | 12 emails (R01-R12), 45 expected lines in answer_key.json |
| sample_emails.json | 3 (S01-S03), no answer key |

Inbox list shows each email's `scenarioNote` as the "why this case" label (for example R02: "40 EA must round up to 4 CASE of 12; 900 SF must round up to 3 ROLL").

```
+----------+------------------------------------------------------+
| CHAPTERS |  2. What I asked for          [narration]            |
|          |  [Products][Aliases][Spec][Customers][Inventory]     |
|          |  [Pricing][Inbox]                                    |
|          |  +------------------------------------------------+  |
|          |  | filter: [________]                              |  |
|          |  | Item Number ^ | Display Name | MERV | List ...  |  |
|          |  | PL-M8-20251   | ...          |  8   | ...       |  |
|          |  +------------------------------------------------+  |
|          |                                                      |
|          |  Inbox tab:                                          |
|          |  +-----------------+------------------------------+  |
|          |  | R01 Dombrowski  | From / Subject / Received    |  |
|          |  | R02 Reyes     < | [why this case: ...]         |  |
|          |  | R03 Halvorsen   | body text                    |  |
|          |  | ...             | --- attachment text ---      |  |
|          |  +-----------------+------------------------------+  |
+----------+------------------------------------------------------+
```

---

## Chapter 3. The approach

**Narration**

> The pipeline has six steps. The model does the four language steps: classify, extract, match, and draft. Plain TypeScript does conversion, stock, pricing, and flags. The model never computes a price, a case count, or a date. That keeps every dollar traceable to the catalog and the pricing sheet. The draft email repeats numbers the code produced. The prompt forbids new numbers, but no code checks the draft yet.

**Artifact:** static diagram. Step list from SPEC.md "The script". Last two sentences come from F9.

```
+----------+------------------------------------------------------+
| CHAPTERS |  3. The approach                                     |
|          |                                                      |
|          |  [LLM]      [LLM]     [LLM]    [CODE]    [CODE] [LLM] |
|          |  Classify > Extract > Match > Convert > Flag > Draft |
|          |                               Stock                  |
|          |                               Price                  |
|          |                                                      |
|          |  [narration]                                         |
+----------+------------------------------------------------------+
```

---

## Chapter 4. Run 1

**Narration**

> Run 1 used plain first-draft prompts. It classified all 12 emails correctly and matched 44 of 45 lines to the right part. Quantities and units were right on only 28 of 45. When an email said "8 of the HEPAs" or gave a count in an equipment schedule, the model left the unit blank. Without a unit, the code could not price the line.

**Artifact:** `runs/run-01/prompts/*` (collapsible, read-only), `runs/run-01/results.csv` with hit/miss per line, `runs/run-01/scorecard.md`, request flags from `runs/run-01/raw/*.json`.

| Metric | Run 1 |
| --- | --- |
| Classification | 12/12 (100.0%) |
| SKU match | 44/45 (97.8%) |
| Qty/unit | 28/45 (62.2%) |
| Flag recall | 8/9 (88.9%) |
| Extra flags (unscored) | 2 (R04 short_stock, R09 low_confidence) |

Side effect of null units: R07 subtotal $0.00, R12 subtotal $255.20 (run 2: $3,824.08 and $1,912.39).

```
+----------+------------------------------------------------------+
| CHAPTERS |  4. Run 1                     [narration]            |
|          |  > Prompts used (v1)  [classify|extract|match|draft] |
|          |  +------------+------------+-----------+-----------+ |
|          |  | Class 12/12| SKU 44/45  | Qty 28/45 | Flags 8/9 | |
|          |  +------------+------------+-----------+-----------+ |
|          |  filter: [All | Misses only]  request: [All v]       |
|          |  +------------------------------------------------+  |
|          |  | Req | Text as written | SKU | Qty | $ | Flags|OK|  |
|          |  | R07 | 8 of the ...    | HP- | 8 ? | 0 |      |X |  |
|          |  | ...                                            |  |
|          |  +------------------------------------------------+  |
+----------+------------------------------------------------------+
```

---

## Chapter 5. What went wrong and what I changed

**Narration**

> Most of run 1's misses had one cause. The model left the unit blank on 17 lines when the email gave a count with no unit. Fifteen of those were in one equipment schedule (R12). I added one sentence to the extract prompt. One line asked for a MERV 16 pleated filter, which Northfield does not make. The model returned "no match" instead of offering the MERV 13 at the same size. I added a rule to the match prompt. I also found a date bug in my code: a need-by date was treated as midnight UTC, which cost a day and raised a false stock warning on R04.

**Artifact:** run-01 misses grouped by cause, beside `LOG.md` 18:08 and 18:09. Diffs: `poc/prompts/v1/extract.md` vs `v2/extract.md` (line 5), `v1/match.md` vs `v2/match.md` (lines 6-9), and the `domain/flags.ts` end-of-day change from commit `eeaa1eb`.

| Cause | Lines | Requests | Fix |
| --- | --- | --- | --- |
| Implicit unit extracted as null | 17 | R07 (2), R12 (15) | Prompt: extract v2 |
| MERV not made returned no_match, not substitution | 1 line + 1 missed flag | R09 | Prompt: match v2 |
| Date-only need-by parsed as UTC midnight | 1 extra flag | R04 | Code: domain/flags.ts + Vitest case |
| Extra low_confidence | 1 extra flag | R09 | No change |

Note F4: one group dominates. Note F6: the 18:08 log entry says "16 of 17"; show as written.

```
+----------+------------------------------------------------------+
| CHAPTERS |  5. What went wrong           [narration]            |
|          |  +-------------------------+------------------------+ |
|          |  | Cause: implicit unit    | LOG 18:08 ...          | |
|          |  | 17 lines (R07, R12)  [v]| LOG 18:09 ...          | |
|          |  +-------------------------+------------------------+ |
|          |  | extract.md  v1 -> v2                              | |
|          |  | - ...Use null if a quantity or unit is not stated.| |
|          |  | + ...A count of filters with no unit stated ...   | |
|          |  +---------------------------------------------------+ |
|          |  [next cause card: MERV substitution]                |
|          |  [next cause card: need-by date (code diff)]         |
+----------+------------------------------------------------------+
```

---

## Chapter 6. Run 2  (flags F1, F2, F5)

**Narration**

> Run 2 used the changed prompts and the same model. Every scored metric reached 100%. That number is not a real accuracy estimate. I tuned the prompts on these same 12 emails, so run 2 mostly shows the fixes did what I aimed them at. Two problems remain that the scorecard does not catch. First, R07 now gets a stock warning the answer key does not expect: the HEPA line has a unit now, and the only plant with stock has a 17-day lead time against a 16-day window. Second, R12 is overcharged on freight. My code rounds pallets up per line, so 16 small lines became 15 pallets and $2,475 of freight on a $1,912 order.

**Artifact:** `runs/run-02/results.csv`, `runs/run-02/scorecard.md`, `runs/run-02/raw/*.json`, `runs/run-02/drafts.md` (R12 header line), LOG 18:13.

| Metric | Run 1 | Run 2 |
| --- | --- | --- |
| Classification | 12/12 | 12/12 |
| SKU match | 44/45 | 45/45 |
| Qty/unit | 28/45 | 45/45 |
| Flag recall | 8/9 | 9/9 |
| Extra flags (unscored) | 2 | 1 (R07 short_stock) |

Known defect not in the scorecard (F2): R12 subtotal $1,912.39, freight $2,475.00 (15 pallets x $165 west), total $4,387.39. The 15-pallet count also applies the 10-pallet volume break (8%). Cause: `poc/domain/pricing.ts:19-21`.

```
+----------+------------------------------------------------------+
| CHAPTERS |  6. Run 2                     [narration]            |
|          |  +---------------------------------------------+     |
|          |  | Metric     | Run 1     | Run 2     | Change |     |
|          |  | SKU        | 44/45     | 45/45     |  +1    |     |
|          |  | Qty/unit   | 28/45     | 45/45     | +17    |     |
|          |  | ...                                         |     |
|          |  +---------------------------------------------+     |
|          |  ! Tuned on the same 12 emails. Not independent.     |
|          |                                                      |
|          |  Still wrong (not scored):                           |
|          |  - R07 extra short_stock (17-day lead, 16-day need)  |
|          |  - R12 freight $2,475.00 on $1,912.39 subtotal       |
|          |                                                      |
|          |  [results table, same as ch. 4, run toggle 1 | 2]    |
+----------+------------------------------------------------------+
```

---

## Chapter 7. The timeline  (flags F3, F6)

**Narration**

> The clock started at 17:57 and stopped at 18:13: 16 minutes of the 30-minute box. The test data was written before the clock started. Two of the 16 minutes were lost to an empty API credit balance. Two parallel subagents wrote the domain code and the model-calling code in about three minutes. Every entry below is backed by a commit.

**Artifact:** `poc/LOG.md` entries, with commit hashes from `git log`.

Also `poc/prompt-log.txt`: the 7 prompts the developer typed (3 before the clock, 17:48-17:55; 4 during it) and their notes. The app shows them as a second timeline lane and in one merged table with the LOG.md entries.

| Time | Log entry (short) | Commit |
| --- | --- | --- |
| 17:54 | Data generated (before clock) | 2159a46 |
| 17:57 | Start | 61acd33 |
| 17:59 | Scaffold done | 61acd33 |
| 18:00 | domain/ + llm/ built by parallel subagents; run.ts, score.ts wired | 60daab5 |
| 18:02 | Blocked: API credit balance too low | ac15aca |
| 18:04 | Credits added; tool_choice error fixed; smoke test passes | d8ecfa4 (committed with run 1) |
| 18:08 | Run 1 | d8ecfa4 |
| 18:09 | Misses grouped; v2 prompts and date fix | eeaa1eb |
| 18:13 | Run 2; stop | b308814 |

```
+----------+------------------------------------------------------+
| CHAPTERS |  7. The timeline              [narration]            |
|          |                                                      |
|          |  0    2    5        11 12        16             30   |
|          |  |----|----|--------|--|---------|--------------|    |
|          |  St Scaf Code Blk  Run1 Fix     Run2         (unused)|
|          |       [shaded 18:02-18:04 = blocked on credits]      |
|          |                                                      |
|          |  selected entry:                                     |
|          |  18:08  Run 1 ... [full log text]   commit d8ecfa4   |
+----------+------------------------------------------------------+
```

---

## Chapter 8. Try it  (flags F7, F8)

**Narration**

> Pick an email and step through what the pipeline produced for it. Change a part number or a quantity, and the price, stock, and flags recompute in your browser with the same code the script used. The draft email does not update when you edit; it is the recorded one. With a passcode, you can paste a new email and run it live.

**Artifact:** without passcode, the 12 emails from `runs/run-02/raw/RNN.json` (steps + record) and `runs/run-02/drafts.md`. Math recomputes via `poc/domain/`. With passcode: `api/llm.ts`, samples S01-S03 from `poc/data/sample_emails.json`.

Suggested default email: R02 (40 EA -> 4 CASE at $94.24; 900 SF -> 3 ROLL at $70.00; subtotal $586.96). It shows the rounding in one screen. Avoid R07 as the default (F7). Avoid R12 until F2 is fixed or labelled.

```
+----------+------------------------------------------------------+
| CHAPTERS |  8. Try it            [Live: locked] [Unlock live]   |
|          |  Email: [R02 v]   or  [Paste new email] (live only)  |
|          |  Samples: [S01] [S02] [S03]  (live only)             |
|          |  +------------------------------------------------+  |
|          |  | 1 Classify   quote_request                      |  |
|          |  | 2 Extract    customer, ship-to, need-by (conf)  |  |
|          |  | 3 Match      line -> SKU, conf, reason          |  |
|          |  | 4 Price      | SKU [edit] | Qty [edit] | Sell | |  |
|          |  |              | Plant | Unit $ | Ext $ |          |  |
|          |  | 5 Flags      (request + line flags)             |  |
|          |  | 6 Draft      recorded (does not update on edit) |  |
|          |  +------------------------------------------------+  |
+----------+------------------------------------------------------+
```
