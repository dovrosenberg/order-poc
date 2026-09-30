# RFQ-to-quote POC: Northfield Air Filtration

All data here is fictional. Northfield Air Filtration (NAF) is a made-up $75M maker of commercial HVAC air filters.

**Problem and metric.** NAF takes 2 to 3 business days to answer a quote request, and slow quotes lose bids. Three reps re-key about 60 emails a week, at about 35 minutes each. The target is request-to-quote in under 4 business hours, with under 10 rep minutes per quote.

**What I did in 30 minutes.** A command-line script takes each email through six steps:

| Step | Done by |
| --- | --- |
| 1. Classify the email (quote, reorder, status question, other) | LLM |
| 2. Extract customer, ship-to, dates, and lines, with a confidence per field | LLM |
| 3. Match each line to a part number, with a confidence and a reason | LLM |
| 4. Convert units, pick plants by stock and lead time, apply tier, volume, and freight pricing | Code |
| 5. Flag missing info, low confidence, short stock, substitutions, bid deadlines, and prices below floor margin | Code |
| 6. Draft the reply email | LLM |

It ran twice on 12 test emails, scored against an answer key written before the first run:

| Metric | Run 1 | Run 2 |
| --- | --- | --- |
| Classification | 12/12 | 12/12 |
| Part number match | 44/45 | 45/45 |
| Quantity and unit | 28/45 | 45/45 |
| Expected flags raised | 8/9 | 9/9 |

Between runs I made two prompt changes and one code fix. 17 of run 1's 21 misses had one cause: a count with no unit ("8 of the HEPAs") was read as "unit unknown" instead of "each".

**Design choices.**
- The LLM reads and writes language. Code does every calculation, so each price traces to the catalog, price sheet, and inventory files.
- Every line carries a confidence and flags. The system does not guess silently.
- Results are scored against an answer key, not eyeballed.

**What it proved and what it didn't.**
- It handles messy synthetic input: forwarded chains, legacy part numbers, spec references, and mixed units.
- Run 2's 100% is not an independent accuracy number. The fixes were tuned on the same 12 emails they were scored on.
- Real accuracy is unknown until it runs against 100+ historical requests.
- Run 2 still has a pricing defect. Pallets are rounded up per line and then summed. On the 16-line email (R12) that gives $2,475 freight on a $1,912.39 subtotal. The scorecard does not score prices, so this passed.
- The draft email restates dollar figures. The prompt tells the model to use only the computed numbers. No code checks that it did.

**Build note.** Phase 1 ran from 17:57 to 18:13: 16 minutes, 2 of them blocked on API credits (see `poc/LOG.md` and the commit times). Claude Code wrote the code, with two parallel subagents for the domain and LLM modules. The walkthrough app was built afterward to explain Phase 1. It replays the committed run files and does not regenerate them.

---

## Run it

- Run the POC alone from the command line: see [poc/README.md](poc/README.md). No key is needed for `--replay`.
- The walkthrough app: see [app/README.md](app/README.md).

From the repo root (Node 20.12+):

```bash
npm install          # installs poc/ and app/ (npm workspaces)
npm test             # domain tests, app replay tests, proxy tests
npm run poc          # live run of all 12 emails with the final prompts; needs poc/.env; writes poc/runs/run-NN/
npm run dev          # walkthrough at http://localhost:5173
```

`npm run dev` also serves `/api/llm` locally. For live mode, put `ANTHROPIC_API_KEY` in `poc/.env`, start with `DEMO_PASSCODE=<code> npm run dev`, and open `http://localhost:5173/?code=<code>#/8`.

## Security design

The reviewer's questions are data egress and approved tooling. The answers:

- **The browser never calls Anthropic.** Live mode calls one server function, `api/llm.ts`. The API key is a server environment variable. It is not in the client bundle, any response, or browser storage.
- **The function is not a general proxy.** It accepts only `{ step, input }` for `classify`, `extract`, `match`, or `draft`. It uses the fixed Phase 1 prompts (`poc/prompts/v2`), model, and `max_tokens`. Unknown steps and bodies over 20 KB return 400.
- **Passcode gate.** Calls need an `x-demo-code` header equal to `DEMO_PASSCODE`, compared in constant time. Otherwise the function returns 401. The reviewer's link carries the code as `?code=`. The app keeps it in memory only and removes it from the address bar. Changing `DEMO_PASSCODE` in Vercel revokes access.
- **Spend cap.** The key belongs to a dedicated Anthropic Console workspace with a low monthly limit (e.g. $20).
- **What leaves the browser in live mode:** the pasted email text, sent to the function and from there to Anthropic. Nothing is stored. Without a passcode, the app makes no calls at all.

## Deploy (Vercel)

1. Push to GitHub. In Vercel, import the repo with the root directory left as the repo root. `vercel.json` sets the install and build commands, the output directory `app/dist`, and the `api/llm.ts` function.
2. In Anthropic Console, create a workspace with a monthly spend limit and create a key in it.
3. In Vercel project settings, set `ANTHROPIC_API_KEY` and `DEMO_PASSCODE`. Optionally set `MODEL` (default `claude-sonnet-5-5`). Deploy.
4. Check the deployment:
   - `curl -s -o /dev/null -w '%{http_code}' -X POST https://<app>/api/llm -d '{}'` returns `401`.
   - The same call with `-H 'x-demo-code: <code>'` returns `400`.
   - In the browser's network tab, no response contains the key. `grep -r sk-ant app/dist` finds nothing.
5. Send the reviewer `https://<app>/?code=<code>#/8`.

Keep `.env` files out of git. `.gitignore` excludes them.
