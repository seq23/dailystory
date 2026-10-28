# Zero paid LLM — dailystory (Time2Read)

Owner policy, 11 Oct 2026: "nothing should be paid … cut the probes and make them free."

That rule governs **this repo's own automation**: anything a workflow, a script or
an agent here runs unattended. It is not a rule against the product charging for
its own inference, which subscribers pay for. Both lanes are named below, so a
new paid call site cannot appear without someone moving it into one of them.

## The automation lane — $0, and empty today

No script and no workflow in this repository calls a model. The Search Console
collectors, the prerender check and the IndexNow submitter are all deterministic.

The router exists anyway, so that the first job here that *does* need a model has
a $0 door to go through instead of naming its own:

- **Every model call in this repo's automation goes through
  `scripts/llm/free_router.mjs`.** It reads `config/llm_routing.json`, where
  `policy.max_cost_usd: 0` is a hard policy. It refuses to load at all unless
  every listed model id ends in `:free` and is priced `"0"` for both prompt and
  completion. It tries the listed models in order, adds OpenRouter
  `provider.max_price` 0 so the provider itself refuses to route a call that
  would charge, and **never falls back to a paid model**.
- **If no free model answers, nothing is generated.** The router returns the
  named stop `NO_FREE_MODEL_ANSWERED`. A missing key is `CREDENTIAL_REFUSED`.
  Neither reaches for a model that costs money.
- **A reported cost fails the run.** A non-zero `usage.cost`, or an answer served
  by a model that is not on the free list, throws `PaidCostError`.
- **`npm run llm:check`** confirms live OpenRouter pricing is still $0 for every
  configured model; `npm run llm:check -- --ping` also sends one free call. Each
  run prints one `LLM_ROUTER_RECEIPT` line.

## The product lane — paid, funded by subscriptions

The Time2Read product itself calls models in `supabase/functions`: adaptive story
generation, narration, speech-to-text, spelling correction, translation,
dictionary lookups and illustration.

| Where | Endpoints | What it is |
|---|---|---|
| `supabase/functions/*` | `api.openai.com`, `api.runware.ai` | Story generation, TTS, Whisper, image generation |

This is cost of goods, not an unattended probe: it runs when a paying reader
opens a story, never on a schedule. It is recorded in `config/product_inference.json`
under `paid_lanes[].id = "product-inference"` with its endpoints and model ids,
and the guard below keeps that record honest. The automation config points to
this manifest but never reads its models as fallbacks.

## The guard

`src/test/guards/zero-paid-llm.test.ts` runs in the fast merge gate
(`npx vitest run src/test/guards` in `.github/workflows/checks.yml`). It reads
this document and the routing config and fails when:

- `config/llm_routing.json` is missing, unparseable, or not a $0-only policy
  (it calls the router's own `policyErrors`, so the test and the router cannot
  disagree);
- any model id in `models` does not end in `:free`;
- `CLAUDE.md` does not carry the "nothing paid" line;
- this document is missing, or stops naming both lanes;
- a provider endpoint appears in `scripts/` or `.github/workflows/` — the
  automation lane — without going through the router;
- a provider endpoint appears in `supabase/functions/` that the
  `product-inference` paid lane does not list.

## Refreshing the free list

Fetch `https://openrouter.ai/api/v1/models` (no key). Keep models where
`pricing.prompt == "0" && pricing.completion == "0"` and the context is at least
32k. Update `models` and `pricing_snapshot` in `config/llm_routing.json`. If a
configured model turns paid, `npm run llm:check` fails loudly.
