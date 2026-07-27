# Testing Console — `/prompt-testing?debug=1`

Last updated: 2026-07-27

## How to get there

There is no link to this page in the app UI — it is deliberately URL-only.

1. Open the site (`https://time-2-read.com` or the preview URL).
2. Append the path to the address bar: `/prompt-testing`
3. To unlock spend, forecast and log tabs, append the debug flag:
   `https://time-2-read.com/prompt-testing?debug=1`

Without `?debug=1` you get the safe subset (story, image, audio, health tabs).
Cost data additionally requires an admin account — `get-cost-analytics` checks
the caller against `ADMIN_USER_IDS`; a non-admin sees an explicit
"admin only" message rather than empty numbers.

## Tabs

| Tab | What it does | Costs money? |
| --- | --- | --- |
| **Spend** | Real money already spent, from the `cost_tracking` table: today vs all-time, split by provider (OpenAI / Runware / ElevenLabs / Resend) and by operation. Also the per-test-session readout. | No |
| **Forecast** | Per-unit costs and the scale simulator (users, guest/premium mix, sessions, TTS on/off) projecting monthly cost, cache savings, capacity headroom and break-even price. | No |
| **Story generation** | `StoryPromptTester` — runs the real story pipeline across reading levels and reports which tier answered (AI / template / emergency). | Yes (OpenAI) |
| **Images** | `ImageGenerationTester` — posts the exact production payload to `runware-generate-image` and shows the distilled scene, seed, latency and image. | Yes (~$0.0013/image) |
| **Audio & voice** | Voice catalog tester (accented-English voice per language) and the audio E2E panel. | Yes (ElevenLabs) |
| **Health** | Live contract checks against each service. Free checks run by default; billable checks are opt-in via a checkbox. | Opt-in |
| **Logs** | `DebugDataViewer` over `ai_prompt_debug_log` / `image_generation_debug`, plus a logging health check. | No |

## Where the money numbers come from

Nothing on this page is hardcoded marketing math.

- **Spent so far** — `cost_tracking` rows written fire-and-forget by the edge
  functions via `supabase/functions/_shared/costLogger.ts`. Every OpenAI,
  Runware and ElevenLabs call inserts one row with provider, operation, model,
  tokens/units and USD cost.
- **Per-unit cost** — all-time cost for an operation ÷ all-time units for that
  operation. Shown with a `measured · N rows` badge.
- **No data yet** — a documented default is used and labelled
  `assumed default`, so an unproven number can never be mistaken for a measured
  one.
- **Forecast** — units × per-unit cost, with a scale-dependent audio cache hit
  rate applied (cached narration replays cost $0 in API fees).

## Measuring the cost of one test run

Each tester stamps its calls with a prefixed session ID. Paste that session ID
into the "Test run cost" box on the Spend tab to get the exact USD total that
run wrote to `cost_tracking`, itemised by provider.

## Architecture

```text
PromptTesting.tsx (tabs)
  ├── useCostAnalytics()  ──► get-cost-analytics ──► cost_tracking   (one fetch, shared)
  │      ├── SpendSummary        (spent so far)
  │      └── ForecastPanel       (per-unit + ScenarioSimulator)
  ├── StoryPromptTester          (real story pipeline)
  ├── ImageGenerationTester      (real runware-generate-image POST)
  ├── VoiceCatalogTester / AudioE2ETestingPanel
  ├── SystemHealthPanel          (live contract checks)
  └── DebugDataViewer            (debug log tables)
```

`runware-generate-image` answers `GET` with its real contract — model, cost per
image, and presence of `RUNWARE_API_KEY` / `LOVABLE_API_KEY` /
`SUPABASE_SERVICE_ROLE_KEY`. Secret *values* are never returned, only booleans.

## Removed in the 2026-07 overhaul

These panels tested endpoints and tiers that no longer exist after the image
pipeline was collapsed to the single Runware path, so they reported false
failures:

- `ApiKeyDiagnostic.tsx` → replaced by `SystemHealthPanel`
- `RunwareConnectionTest.tsx` → replaced by `ImageGenerationTester` + health tab
- `PromptTestingEnhancement.tsx` → tested the deleted PhaseIntegrationOrchestrator `dryRun` path

The developer-diagnostics block inside `CleanStoryDisplay` (gated behind
`window.__ENABLE_DIAGNOSTICS__`) now renders `SystemHealthPanel`.

## Related docs

- `docs/IMAGE_GENERATION.md` — the single-path image pipeline
- `docs/SYSTEM_COST_MONITORING_2025_09_28.md` — cost tracking schema
- `docs/ACCENTED_VOICE_NARRATION.md` — per-language voice selection