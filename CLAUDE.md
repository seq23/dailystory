# dailystory — Time2Read

The subscription reading product at **https://time-2-read.com/**. Identity, host
limits and the Search Console property are in `REPO_IDENTITY.md`; the agent
bootstrap and the Repo Operator laws are in `AGENTS.md`, which this file does not
repeat.

## Nothing paid

**Nothing paid** in this repo's own automation. No script and no workflow here
may name its own model: `config/llm_routing.json` is the policy
(`max_cost_usd: 0`, every model id `:free`) and `scripts/llm/free_router.mjs` is
the only door. If no free model answers, nothing is generated — the router
returns a named stop rather than reaching for a model that costs money.

The product's own inference in `supabase/functions` (story generation, narration,
speech-to-text, translation, illustration) is paid and funded by subscriptions.
It is a separate, named lane, recorded in `config/product_inference.json` under
`paid_lanes`. Adding a paid call site means recording it there.

The rule, both lanes and how to refresh the free list: `docs/cost/zero-paid-llm.md`.
The guard that reads them: `src/test/guards/zero-paid-llm.test.ts`.

## Search Console is the truth

The daily `search-console-daily.yml` workflow commits what Google actually
reports into `data/search_intelligence/`:

| File | What it holds |
|---|---|
| `gsc_truth.json` | Rolling 28-day query × page rows, with property totals |
| `gsc_query_history.json` | One entry per daily window, so a query that leaves the 28-day window is not lost |
| `index_coverage.json` | URL Inspection state per sitemap URL (indexed / crawled-not-indexed / discovered) |
| `gsc_sitemaps.json` | What Search Console holds for the sitemap, and its errors |

Read those files instead of guessing at traffic or index state, and instead of
pulling the API again by hand. They are committed evidence.

A collector with no credential prints a **NAMED STOP** and leaves the existing
file untouched — a secretless run never blanks evidence. A 401/403 or a quota
refusal is recorded in the file with the owner step and exits 0. Search Console
answering with zero rows for a property that has impressions exits 1: that is a
defect, not a quiet week.

## The merge gate

`.github/workflows/checks.yml` is the fast check and must stay fast:

```bash
npm run test:unit                # every unit test, including guards; Playwright runs separately
npm run build                    # prerenders real HTML for every public page
node scripts/check-prerender.mjs # crawlers must see text, not an empty shell
```

Guards live in `src/test/guards/`. A guard reads a real file — a workflow, a
migration, a document, the routing config — and fails on the defect it pins.
When a change makes a guard false, rewrite the guard to the new truth at least as
strictly; never skip, loosen or delete it.

The separate preview job installs with Bun's frozen lockfile, typechecks, and runs
`build:dev`. Keep test-library peers explicit: npm supplies implicit peers that
Bun's preview install does not.
