 # Air Filtration RFQ-to-Quote Copilot: POC Build Spec

Sep 30, 2026

## Purpose

Show that a real portco problem can go from identified need to a working, measured proof of concept in about 30 minutes. The work has two phases:

1. **Phase 1: the 30-minute POC.** A scrappy script that turns inbound quote-request emails for commercial air filters into matched, priced line items with flags, scored against an answer key. It is time-boxed to 30 minutes and logged with timestamps. This is the real deliverable.
2. **Phase 2: the walkthrough app.** An interactive site that replays what happened in Phase 1: the problem, the data, the first run, the misses, the fix, the second run, and a live "try it" step. It exists to explain Phase 1, not to look like a product.

How to use this doc with Claude Code:

- Build Phase 1 first, inside the time box, and commit everything it produces, including the failures. Phase 2 reads those artifacts; it does not regenerate them.
- Where the spec is silent, make a reasonable choice and note it in the log.
- Keep Phase 1 honest and plain. Phase 2 can be tidy, but it should never overstate what Phase 1 did.

The company, industry details, plants, people, customers, products, prices, and emails are all fictional, and the scenario is deliberately not modeled on any real company. Do not use any real company name anywhere in the repo or the app. The fictional company is **Northfield Air Filtration (NAF)**.

## Problem scenario

NAF's bottleneck is quote turnaround: requests take 2-3 business days to answer, and slow quotes lose bids and replacement contracts. Plant capacity is not the constraint. Orders are.

**The company.** NAF makes and distributes commercial HVAC air filters: pleated panel filters, bag filters, rigid box filters, HEPA filters, carbon odor filters, holding frames, and roll media. Revenue is about $75M, and the company is PE-owned. It runs NetSuite as its ERP.

**Plants.** NAF has three plants after two acquisitions. Each acquired plant still uses its legacy product names, so the same filter can arrive under three different names.

| Plant | Location | Notes |
| --- | --- | --- |
| Plant 1 (HQ) | Grand Rapids, MI | Original business; pleated and bag filters |
| Plant 2 | Chattanooga, TN | Acquired 2023; rigid box, HEPA, and carbon filters; legacy part numbers |
| Plant 3 | Reno, NV | Acquired 2025; pleated filters and roll media for western customers |

**Customers.** About 60% of volume goes through HVAC and MRO distributors. The rest goes to mechanical contractors, facility management companies, and public bids from school districts and hospitals. Bids reference a building spec section and a MERV rating rather than a NAF part number, and filters are often requested by nominal size (such as 20x25x2), which differs from actual dimensions.

**The current process.** Three inside sales reps share a quotes inbox and receive about 60 requests a week. For each one, a rep:

1. Reads the email and any attached bid tab or equipment schedule.
2. Translates each line into NAF part numbers, often converting units (single filters to cases, square feet of media to rolls).
3. Checks stock and lead time by plant in NetSuite.
4. Applies the customer's price tier and volume breaks from a spreadsheet.
5. Writes the quote and a reply email.

**Why it's slow.** Requests are inconsistent: forwarded chains, pasted equipment schedules, spec references, nominal versus actual sizes, mixed units, missing ship-to or dates, and requests that aren't really quotes at all. Reps re-key everything, and the senior rep is the only one who knows the legacy part-number crosswalk well.

**Metrics the POC targets:**

- Time from request received to quote sent: 2-3 days today; target under 4 business hours.
- Rep minutes per quote: about 35 today; target under 10 (review and approve).
- Quote error rate from wrong part, unit, or price: unmeasured today; the POC surfaces flags so errors get caught before sending.

## Phase 1: the 30-minute POC

Phase 1 answers one question: can an LLM plus simple code turn NAF's messy quote requests into correct line items, measured against an answer key? It is a single TypeScript script run from the command line against CSV exports and a folder of emails, producing a results table and a scorecard. It has no UI.

**Time box and log.** Stop at 30 minutes, whatever state things are in. Keep `poc/LOG.md` as you go, with a clock time on each entry: what you tried, what broke, and what you changed. Commit at each milestone so the git history backs up the log.

**Inputs** (see Simulated data):

- The CSV exports as they'd come out of NetSuite and the pricing spreadsheet.
- `requests.json`: the 12 inbound emails.
- `answer_key.json`: the correct SKU, quantity, and unit per line, plus the expected flags per email.

**The script, `poc/run.ts`.** The design rule is that **the LLM reads and writes language, and code does the math**:

1. **Classify (LLM):** decide whether the email is a quote request, an order status question, a reorder, or other.
2. **Extract (LLM):** pull customer, ship-to, dates, and line items as JSON validated with Zod, with a confidence score per field.
3. **Match (LLM):** map each line to a SKU using the catalog, aliases, and spec crosswalk, with confidence and a one-line reason.
4. **Convert, check, and price (code):** convert units and round up to rolls or pallets, pick a plant by stock and lead time, and apply tier, volume, and freight pricing.
5. **Flag (code):** missing info, low confidence, short stock, substitution, bid due within 48 hours, and price below floor margin.
6. **Draft (LLM):** a short reply email per quote request.

**Outputs**, written to `poc/runs/run-NN/`:

- `results.csv`: one row per line item, with request id, text as written, quantity and unit, matched SKU, confidence, selling quantity, plant, unit price, extended price, and flags.
- `drafts.md`: the reply emails.
- `scorecard.md`: classification accuracy, SKU match accuracy, quantity/unit accuracy, flag recall, and a list of every miss with the reason.
- `prompts/`: the exact prompts used for that run.
- `raw/`: the raw model responses per email.

**Iterate once.** Run 1 uses straightforward prompts. Read the misses, make targeted changes (prompt wording, alias handling, a code fix), then run again. Log each change and why. The before-and-after scorecards are the story Phase 2 tells.

**Out of scope:** UI, email ingestion, NetSuite integration, PDFs (attachments are pre-extracted text), and sending anything.

## Architecture

One repo, two folders. `poc/` is the Phase 1 script and its committed outputs. `app/` is the Phase 2 walkthrough, which imports `poc/data/` and `poc/runs/` at build time. There is no database; all data is loaded into memory.

- **Phase 1 stack:** Node with TypeScript (run with `tsx`), the Anthropic SDK, Zod, and a CSV parser. The key comes from a local `.env`. Keep the domain math (conversion, stock, pricing, flags) in `poc/domain/` as pure functions, so the app can reuse them.
- **Phase 2 stack:** Vue 3 with the Composition API, TypeScript in strict mode, Vite, and PrimeVue. Deploy to Vercel. The app imports `poc/domain/` for the try-it step so the math matches Phase 1 exactly.
- **LLM calls:** in Phase 1, the script calls Anthropic directly. In Phase 2, the browser never calls Anthropic; the try-it step calls one Vercel serverless function, `api/llm.ts`. Use a configurable model defaulting to `claude-sonnet-5-5`, with tool use or strict JSON for steps 1-3, validated with Zod.

**API key handling (decision).** The key lives only in a Vercel environment variable, `ANTHROPIC_API_KEY`, and never reaches the browser. Access to live calls is gated by a passcode.

- **Proxy function (`api/llm.ts`).** It accepts only `{ step, input }`, where `step` is one of `classify`, `extract`, `match`, or `draft`, and `input` is the email text or extracted lines (cap input at about 20 KB). The server uses the final Phase 1 prompts, a fixed model, and a fixed `max_tokens`. Unknown steps and oversized input return 400. This keeps the endpoint from working as a general-purpose Claude proxy.
- **Passcode gate.** A second environment variable, `DEMO_PASSCODE`. The link sent to a reviewer carries it as `?code=...`. The app reads it on load, keeps it in memory only (never in storage), removes it from the address bar, and sends it as an `x-demo-code` header. The function returns 401 on a missing or wrong code, compared in constant time. Rotating the code in Vercel revokes access immediately.
- **Spend cap.** Create the key in a dedicated Anthropic Console workspace with a low monthly spend limit (e.g., $20). This is the real backstop.
- **Without a passcode.** The walkthrough works fully from the committed Phase 1 runs. In the try-it step, the 12 sample emails show their recorded results from the final run.
- **With a passcode.** The try-it step can also run a pasted email live through the proxy. A header control, "Unlock live mode," accepts the code manually.

**No separate cache.** The recorded outputs are simply the Phase 1 run folders. Do not regenerate or edit them for Phase 2; if a result looks bad, that's part of the story.

**Prompts.** Keep one prompt file per LLM step in `poc/prompts/`, versioned by run. Include the catalog, aliases, and spec crosswalk as context for the match step. The data is small enough that no retrieval is needed; note in the log that retrieval would replace this at real catalog size.

## Repo layout and running Phase 1 locally

A reviewer should be able to clone the repo and run the POC from the command line in under five minutes, without touching the app. So `poc/` is a self-contained package with its own `package.json`, and it depends on nothing in `app/`. The app depends on `poc/`, never the reverse.

```text
repo/
  package.json            # npm workspaces: ["poc", "app"]
  README.md               # the story, plus a link to each folder's README
  poc/
    README.md             # how to run the POC, in five commands
    package.json
    .env.example          # ANTHROPIC_API_KEY=
    run.ts                # CLI entry point
    score.ts              # scores any run folder against the answer key
    domain/               # pure TS: types, conversion, inventory, pricing, flags (+ Vitest tests)
    llm/                  # client, prompt loader, Zod schemas, one file per LLM step
    prompts/              # prompt text files, one per step, versioned by run
    data/                 # CSV exports, requests.json, answer_key.json
    runs/                 # committed run folders (run-01, run-02, ...)
    LOG.md
  app/                    # Phase 2 walkthrough (Vue); imports poc/domain and reads poc/data, poc/runs
  api/
    llm.ts                # Vercel function; imports poc/llm so prompts match Phase 1
```

**Rules that keep it clean:**

- `poc/domain/` has no I/O and no LLM calls, just functions from data to data. That lets the app, the CLI, and the tests all share it.
- `poc/llm/` is the only code that talks to Anthropic. Each step is a function like `extract(email, context): Promise<Extraction>`, with the prompt, schema, and parsing together.
- `run.ts` only wires things together: load the data, loop over the emails, call the steps, and write the outputs. Keep it under about 150 lines.
- Use Node 20+ and `tsx`, with no build step for the POC. Keep dependencies to the Anthropic SDK, Zod, a CSV parser, and `tsx`.

**CLI commands** (from `poc/`):

| Command | What it does |
| --- | --- |
| `npm install` then `cp .env.example .env` | Setup; add your Anthropic key |
| `npm start` | Runs all 12 emails and writes a new `runs/run-NN/` folder, printing a summary table and the scorecard |
| `npm start -- --request R03` | Runs one email and prints each step's output to the console |
| `npm start -- --replay runs/run-02` | Re-runs the code steps using recorded LLM outputs; no key needed |
| `npm start -- --model <id>` | Overrides the model for comparison |
| `npm run score -- runs/run-01` | Re-scores an existing run against the answer key |
| `npm test` | Runs the domain tests |

The `--replay` mode matters: a reviewer without a key can still run the whole pipeline locally and see the math and flags reproduce exactly.

## Simulated data

Generate the data before starting the Phase 1 clock, and put it in `poc/data/`. Make the master data look like CSV exports from the ERP and the pricing spreadsheet, with slightly messy real-world column names, because that's what a portco would hand over. All names and numbers are fictional.

| File | Rows | Contents |
| --- | --- | --- |
| `products.csv` | 40-50 | Part catalog with nominal and actual size, MERV rating, case quantity, list price, and cost |
| `aliases.csv` | 40-60 | Legacy part numbers from Plants 2 and 3 and common customer shorthand, each mapped to a part |
| `spec_crosswalk.csv` | 15-20 | Fictional building-spec and bid requirements (spec section, minimum MERV, filter type) mapped to acceptable parts |
| `customers.csv` | 12 | Distributors, mechanical contractors, facility managers, and two public bid desks, with tier and region |
| `pricing.json` | 1 object | Tier discounts, volume breaks, freight rules, and floor margin |
| `inventory.csv` | about 130 | On-hand quantity and lead time per part per plant |
| `requests.json` | 12 | Inbound emails with pre-extracted attachment text |
| `answer_key.json` | 12 | Expected classification, lines, and flags per email, for scoring |

**Product families.** Cover all of these, in two to eight variants each:

- Pleated panel filters: MERV 8, 11, and 13; 1", 2", and 4" depths; common nominal sizes (16x20, 16x25, 20x20, 20x25, 24x24); 12 per case for 1" and 2", 6 per case for 4".
- Bag filters: MERV 13 and 14, 6- and 8-pocket, in 24x24 and 12x24 face sizes; sold each.
- Rigid box filters: MERV 14, 12" deep, 24x24 and 12x24; sold each.
- HEPA filters: 99.97% at 0.3 micron, 24x24x11.5; sold each, with longer lead times.
- Carbon odor filters: 2" pleated carbon, in two sizes; 12 per case.
- Holding frames: 24x24 and 12x24, galvanized; sold each.
- Roll media: MERV 8 synthetic, 30" and 45" wide by 90' long; sold by the roll and requested in square feet.

**Schemas.** Put these in `poc/domain/types.ts`:

```typescript
type Unit = 'EA' | 'CASE' | 'ROLL' | 'SF' | 'LF' | 'PALLET';

interface Product {
  sku: string;            // e.g. "PL-M13-20252"
  name: string;
  family: 'pleated' | 'bag' | 'box' | 'hepa' | 'carbon' | 'frame' | 'media';
  merv?: number;
  nominalSize?: string;   // "20x25x2"
  actualSize?: string;    // "19.5x24.5x1.75"
  sellUnit: Unit;         // unit priced and shipped
  unitsPerSell: { unit: Unit; qty: number }[]; // e.g. [{ unit: 'EA', qty: 12 }] or [{ unit: 'SF', qty: 337.5 }]
  listPrice: number;      // USD per sellUnit
  unitCost: number;       // USD per sellUnit
  sellUnitsPerPallet: number;
  specNotes: string;      // efficiency, initial resistance, frame type
}

interface Alias { alias: string; sku: string; source: 'plant2' | 'plant3' | 'customer'; }

interface SpecItem {
  code: string;           // e.g. "23 41 00 / 2.2.B"
  issuer: 'school_district' | 'hospital' | 'municipal';
  description: string; minMerv: number; filterType: Product['family'];
  acceptableSkus: string[];
}

interface Customer {
  id: string; name: string;
  type: 'distributor' | 'contractor' | 'facility_mgmt' | 'public_bid';
  tier: 'A' | 'B' | 'C'; region: 'midwest' | 'southeast' | 'west';
  emailDomain: string; defaultShipTo: string; notes?: string;
}

interface Pricing {
  tierDiscount: Record<'A' | 'B' | 'C', number>;          // e.g. { A: 0.18, B: 0.12, C: 0.05 }
  volumeBreaks: { minPallets: number; extraDiscount: number }[];
  freight: { freeOverUsd: number; perPalletUsd: Record<Customer['region'], number> };
  floorMarginPct: number;                                   // e.g. 0.22
}

interface InventoryRow { sku: string; plant: 'P1' | 'P2' | 'P3'; onHand: number; leadTimeDays: number; }

interface InboundRequest {
  id: string; receivedAt: string; from: string; subject: string;
  body: string; attachmentText?: string;  // bid tab or equipment schedule already converted to text
  scenarioNote: string;                   // what this email is designed to test (viewer only, never sent to the LLM)
}
```

**Answer key.** Write it at the same time as the emails, from the designer's intent, so scoring is objective:

```typescript
interface AnswerKeyEntry {
  requestId: string;
  classification: 'quote_request' | 'order_status' | 'reorder' | 'other';
  lines: { sku: string | null; qty: number; unit: Unit; note?: string }[]; // sku null = no valid match
  expectedFlags: ('missing_info' | 'low_confidence' | 'short_stock' | 'substitution' | 'bid_deadline' | 'below_floor' | 'no_match')[];
}
```

For vague lines where more than one SKU is defensible, list the acceptable SKUs in `note` and count any of them as a hit.

**Request test mix.** The 12 emails should exercise every path:

| # | Scenario | What it tests |
| --- | --- | --- |
| 1 | Clean distributor request, part numbers named | Happy path |
| 2 | Contractor asks for 40 single filters and 900 SF of media | Case and roll rounding |
| 3 | School district bid tab pasted as a table, spec section and MERV only | Spec crosswalk and bid-deadline flag |
| 4 | Plant 2 legacy part numbers | Alias matching |
| 5 | Forwarded chain; the real request is three messages down | Extraction from noise |
| 6 | Large order exceeding one plant's stock | Split fulfillment across plants and lead-time flag |
| 7 | Vague line ("best filters for a hospital operating room air handler") | Low confidence, alternatives offered |
| 8 | Missing ship-to and delivery date | Missing-info flag; reply asks only for those |
| 9 | Asks for a size or rating NAF doesn't make | No-match flag and substitution |
| 10 | Order status question, not a quote | Classifier routes it away |
| 11 | Tier C customer demanding a price below floor | Floor-margin flag |
| 12 | Mixed request: equipment schedule with 8 air handlers, several of the above issues | Realistic hard case |

Also generate 2-3 extra emails that are not in the inbox, as copy-paste samples for live mode. They live in `poc/data/sample_emails.json` (ids S01-S03, same `InboundRequest` shape) and have no answer key entries.

## Phase 2: the walkthrough app

The app is a guided, step-by-step replay of the Phase 1 half hour, the way you'd walk an operating partner through it on a screen share. It has a left rail of chapters with Next and Back buttons, each chapter a short paragraph of narration plus the actual artifact from Phase 1. Every number shown comes from the committed run files.

**Chapters**

1. **The problem.** The bottleneck (quote turnaround), the baseline (2-3 days, about 35 rep minutes per quote), and the target. One short paragraph and three numbers.
2. **What I asked for.** The data a portco would hand over. Show each export as a sortable, filterable table, with the emails as an inbox list; clicking an email opens it. Show each email's `scenarioNote` as a small "why this case" label.
3. **The approach.** The six steps as a simple horizontal diagram, marking which are LLM and which are code, with one sentence on why the math stays in code.
4. **Run 1.** The first prompts (read-only, collapsible), then the results table with each line marked hit or miss against the answer key, and the scorecard.
5. **What went wrong and what I changed.** Each miss grouped by cause, next to the matching `LOG.md` entries. Show the prompt or code change as a before-and-after diff.
6. **Run 2.** The same table and scorecard, with a side-by-side comparison against run 1 and the remaining misses stated plainly.
7. **The timeline.** The `LOG.md` entries on a timeline from minute 0 to minute 30, so the time box is visible.
8. **Try it.** Pick any sample email and step through its six outputs: classification, extracted fields with confidence, matches with reasons, the priced line table, flags, and the draft reply. Changing a SKU or quantity re-runs the math instantly using `poc/domain/`. With a passcode, a pasted new email runs live; offer the emails in `poc/data/sample_emails.json` as one-click copy-paste samples.

A header shows the passcode status and an "Unlock live mode" button. The design is clean and quiet; the content carries it.

## README, deployment, and acceptance

**README.** Write it for a PE operating partner, not a developer. Keep it to one screen before any setup instructions:

1. **Problem and metric:** slow quote turnaround is the bottleneck; the target is request-to-quote under 4 hours.
2. **What I did in 30 minutes:** the six steps, the two runs, and the scorecard change, stated in real numbers.
3. **Design choices:** LLM for language, code for math; confidence and flags instead of silent guesses; scored against an answer key, not eyeballed.
4. **What it proved and what it didn't:** it works on messy synthetic input; real accuracy is unknown until it's run against 100+ historical requests.
5. **Path to production:** email ingestion, NetSuite integration, a larger evaluation set from historical quotes, retrieval at real catalog size, audit logging, hosting in the portco's tenant, and a rough effort estimate.
6. **Build note, stated honestly:** Phase 1 took N minutes (from `LOG.md`); the walkthrough app was built afterward to explain it. All data is fictional.

Then link to poc/README.md for running the POC locally, and add setup steps: `npm install`, `npm run poc` (runs Phase 1 and writes a new run folder), `npm run dev`, and deployment.

**Deployment.** Push to GitHub and import the repo into Vercel as a Vite project with the `api/` function. Set `ANTHROPIC_API_KEY` and `DEMO_PASSCODE` in Vercel's environment variables. Keep `.env` out of the repo. After deploying, confirm the key appears nowhere in the built bundle or any network response. The README should note the proxy, passcode, and spend cap as the security design, since the reviewer cares about data egress and approved tooling.

**Acceptance criteria**

- [ ] Phase 1 finishes inside 30 minutes, and `LOG.md` has timestamped entries backed by commits.
- [ ] At least two run folders exist, each with results, scorecard, prompts, and raw outputs.
- [ ] Scorecards compute every metric against `answer_key.json`, and every miss is listed with its cause.
- [ ] Every dollar figure traces to catalog, pricing, and inventory data; the LLM produces no numbers.
- [ ] The walkthrough shows all eight chapters without a passcode, and every number comes from committed run files.
- [ ] In the try-it step, editing a SKU or quantity instantly updates price, stock, and flags, using the same domain code as Phase 1.
- [ ] A `?code=` link unlocks live mode, and a pasted new email runs end to end through the proxy.
- [ ] The API key never appears in the client bundle, network responses, or browser storage; `api/llm` returns 401 without a valid passcode and 400 for unknown steps or oversized input.
- [ ] The domain functions have Vitest tests covering conversion rounding, split fulfillment, tier plus volume pricing, and the floor-margin flag.
- [ ] No real company names appear anywhere in the repo or the app.
- [ ] A fresh clone runs `poc/` with only the commands in its README, both with a key and with `--replay` and no key.
