## Hostile review — what is actually broken today

I read the page and every panel it mounts. Findings:

1. **`ApiKeyDiagnostic`** — calls `runware-generate-image` with `method: 'GET'`, `{diagnostic:'health_check'}`, `{diagnostic:'reset_circuit_breaker'}`, and `forceTier: 2.5`. The rewritten image function has **no GET handler, no diagnostic verbs, no tiers, and no circuit breaker**. Every one of those buttons now reports fake/garbled status. It also hardcodes the project URL + anon key inline.
2. **`RunwareConnectionTest`** — same problem: expects `{status:'healthy', tier, environment:{hasRunwareApiKey,...}, deployment_version}` and compares against a hardcoded `2025-09-27` deployment string. Dead code against the new contract.
3. **`PromptTestingEnhancement`** — sends `dryRun: true` + `enhancedStoryData` to `runware-generate-image` and parses `metadata.templateStructure / characterConsistency / PhaseIntegrationOrchestrator` fields that no longer exist. (Currently not even mounted on the page.)
4. **`DebugDataViewer`** — has a "Tier Cascade" tab built on `image_generation_debug.tier`; the new function writes a single value there, so the tab is a one-row-per-page list mislabelled as a cascade.
5. **Cost surface** — `AnalyticsDashboard` + `ScenarioSimulator` are real (they read `cost_tracking` through `get-cost-analytics`, which is admin-gated), but they are buried below the debug viewer, the forecast is not tied to the *observed* per-unit costs of the new single-path image system, and there's no "spend so far" number visible at the top of the page.
6. **No auth guard** — the page renders for anyone; the cost function 403s for non-admins, so a non-admin sees a broken dashboard instead of a clear "admin only" message.
7. **No doc** exists for this console.

## What I'd build

**A. Real system tests (replacing the fake ones)**
- One `SystemHealthPanel`: pings each live service with its *actual* contract — `runware-generate-image` (real `{pageText, sessionId, pageNumber, userInfo}` POST, renders the returned image + `scene`, `sceneSource`, `seed`, `prompt`, latency), `template-service`, `elevenlabs-tts` (language-resolved voice), `get-cost-analytics`. Pass/fail is derived from the real response shape, not from invented fields.
- Add a small `GET` health branch to `runware-generate-image` returning `{status, model, hasRunwareApiKey, hasOpenAiApiKey, hasServiceRole}` so key presence can be checked honestly.
- `StoryPromptTester` stays (it already drives the real `NetflixStyleStoryService` / `LiveGenerationService` / `template-service`), but each test result gains **measured cost** for that run, read back from `cost_tracking` by its `session_id`.

**B. Money**
- New `SpendSummary` strip pinned at the top: today / this month / all-time spend, split by provider (OpenAI, Runware, ElevenLabs, Resend) and by operation, straight from `get-cost-analytics`. Plus month-budget progress and the internal-vs-user-traffic split that function already computes.
- Forecast: keep `ScenarioSimulator` but feed it **observed** per-unit costs (all-time cost ÷ all-time units per operation) instead of the hardcoded defaults, and show which numbers are measured vs. assumed. Add per-story and per-page projections for guest (6 pages) and premium (unlimited) shapes.
- "Cost of this test run" readout: every test on the page records its session id, then queries `cost_tracking` for exactly what that run spent.

**C. Structure + access**
- Tabbed layout: **Spend** · **Story generation** · **Images** · **Audio/Voice** · **Logs**. Sections gated on `?debug=1` keep that behaviour.
- Admin gate: if the signed-in user isn't in `ADMIN_USER_IDS`, show a clear "admin only" card rather than silent 403s.

**D. Docs**
- New `docs/PROMPT_TESTING_CONSOLE.md`: how to reach it (`https://time-2-read.com/prompt-testing?debug=1` — type the path onto the home URL; it is intentionally unlinked from the UI), what each tab does, what each test really calls, how costs are measured and forecast, and admin requirements.
- Update `docs/IMAGE_GENERATION.md` (health endpoint), `docs/DOCS_MASTER_INDEX.md`, and `docs/SYSTEM_COST_MONITORING_2025_09_28.md` to point at the new console doc.

## Technical notes
- No DB migrations. All reads use the existing `cost_tracking` / `image_generation_debug` tables and the existing `get-cost-analytics` edge function.
- The only edge-function change is an additive `GET` health branch on `runware-generate-image` — the POST contract used by `StoryImageService` is untouched.

---

### NEW things I plan to create — need your OK
1. `src/components/testing/SpendSummary.tsx` — real spend so far (today/month/all-time, by provider + operation).
2. `src/components/testing/SystemHealthPanel.tsx` — real contract pings for image / template / TTS / cost services.
3. `src/components/testing/ImageGenerationTester.tsx` — real single-path image test (image, scene, seed, prompt, latency, cost).
4. `src/components/testing/TestRunCostReadout.tsx` — per-test-run measured cost from `cost_tracking`.
5. `src/hooks/useCostAnalytics.ts` — one shared fetch/cache for `get-cost-analytics` (today, page currently fetches it twice).
6. `GET` health branch inside existing `supabase/functions/runware-generate-image/index.ts`.
7. `docs/PROMPT_TESTING_CONSOLE.md`.

### Things I plan to DELETE — need your OK
1. `src/components/ApiKeyDiagnostic.tsx` (tier/circuit-breaker era; replaced by SystemHealthPanel).
2. `src/components/RunwareConnectionTest.tsx` (same; replaced).
3. `src/components/PromptTestingEnhancement.tsx` (dryRun/PhaseIntegrationOrchestrator — those code paths no longer exist; not mounted anywhere).
4. The "Tier Cascade" tab inside `DebugDataViewer.tsx` + `DebugDataViewer_TierTab.tsx` (tiers are gone) — folded into a single "Image log" view.

Say "approved" and I'll build it, or tell me which items to drop.