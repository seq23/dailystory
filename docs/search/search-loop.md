# Search loop on Time-2-Read (shared engine)

Owner ruling 1 Nov 2026 (`~/Brains/spry.md`, "Search growth loop on every selling
site"): find easy searches weekly, publish one gated page per search daily,
check every page at 2/4/8 weeks and 90 days, strengthen / undo / merge. The
engine is [seq23/search-loop](https://github.com/seq23/search-loop), pinned `@v1`.
New pages publish straight away once they pass the gates.

## Where the pages live

- **guides.time-2-read.com/questions/** — a separate static section on Cloudflare
  Pages (project `time-2-read-guides`, free plan), deployed by
  `.github/workflows/guides-deploy.yml`. It never waits for a Lovable Publish;
  the app shell at time-2-read.com stays on Lovable.
- Why a subdomain, not time-2-read.com/questions: DNS for time-2-read.com is at
  Squarespace Domains (Google Domains name servers) and the apex points at
  Lovable, so no path on the apex can be routed elsewhere. A subdomain needs one
  CNAME record.

## Pieces

| File | Job |
|---|---|
| `search-loop.config.json` | audience, voice, topics, the one action ("Start a free week" → /pricing), pace 10/day (+5/week, cap 30), `banned_claims`, IndexNow key, sibling `heygetonmylevel.com` |
| `.github/workflows/search-loop.yml` | daily 11:41 UTC caller of the engine |
| `scripts/search-loop/engine-routing.mjs` | gives the engine this repo's $0 model list (from `config/llm_routing.json`, never a second list) |
| `scripts/search-loop/claims-gate.mjs` | removes any page making a banned claim (no screens / anti-AI, medical, dyslexia, grade jumps, non-English stories, wrong brand spelling, ages outside 3–15); `--self-test` |
| `scripts/search-loop/build-guides-site.mjs` | assembles `dist-guides/`: pages, listing, sitemap.xml, robots.txt, IndexNow key, `_redirects` |
| `.github/scripts/search_loop_commit.sh` | LIVE vs PROOF (below) |
| `data/search-loop/` | the engine's ledger (targets, receipt, pages, pace, merges, weekly report) |
| `src/test/guards/search-loop.test.ts` | pins all of the above |

## Proof mode until the host is live

The commit step probes `https://guides.time-2-read.com/<IndexNow key>.txt`.
Until it answers, the run prints `NAMED STOP [GUIDES_HOST_NOT_LIVE]`, force-pushes
the full run (pages + ledger) to branch `search-loop/proof`, and commits only the
finder's targets to main. The day the host answers, the same step commits pages
to main and dispatches the guides deploy. Nothing to switch by hand.

To go live (both are account steps):
1. Repo secret `CLOUDFLARE_API_TOKEN` (Pages: Edit) on seq23/dailystory
   (`CLOUDFLARE_ACCOUNT_ID` is already set), then run Guides Deploy once.
2. DNS at Squarespace Domains: `CNAME guides → time-2-read-guides.pages.dev`.
3. Optional, for page-level Search Console checks: a Domain property
   `sc-domain:time-2-read.com` with the existing service account as a user.
   Until then CHECK writes `not read` for guide URLs; FIND still reads the
   `https://time-2-read.com/` property.

## Throttle

`gh variable set SEARCH_LOOP_MODE --body slow -R seq23/search-loop` (normal | slow | off), or
`"mode"` in the config (can only lower it).

## AI-referral visits and AI-bot reads (search readiness f11, 7 Nov 2026)

time-2-read.com is not a Cloudflare zone (its DNS is Google Cloud DNS), so the engine's zone
analytics reader cannot see it and `analytics` stays `none` in `search-loop.config.json`. Instead:

- `guides-site/functions/_middleware.js` (a Pages Function on guides.time-2-read.com) counts each
  page request into the free Workers Analytics Engine dataset `time2read_guides_ai` (binding in
  `guides-site/wrangler.toml`; assets are excluded by `_routes.json`). It keeps a referrer's
  hostname only and a user agent only when it is a crawler's; no IP, cookie or query string.
- `scripts/search-loop/ai-measure.mjs` runs as the engine's setup command, reads the last 24 hours
  with `SEARCH_LOOP_CF_ANALYTICS_TOKEN` (Account Analytics: Read), classifies with the engine's own
  bot and referrer lists and writes today's row of `data/search-loop/ai-daily.json`. The weekly
  report sums it. A day with no page logged is "not read", never 0.
- Guard: `src/test/guards/search-loop.test.ts`.
