# Image Generation Rebuild — one path, one fallback

## What exists today (verified)

| Layer | File | LOC |
|---|---|---|
| Frontend orchestrator | `src/services/SimpleImageService.ts` | 2,185 |
| Backend orchestrator | `supabase/functions/runware-generate-image/index.ts` | 3,765 |
| Scene creator | `supabase/functions/ai-visual-scene-creator/index.ts` | 1,449 |
| Template A/B | `supabase/functions/runware-template-ab/index.ts` (+backup) | 1,644 |
| Template C/D | `supabase/functions/runware-template-cd/index.ts` | 1,146 |
| Character consistency | `_shared/CharacterConsistencyService.ts` (+ inline JS copy) | 2,532 |
| Test/debug harness | `ImageTierTester.tsx` alone | 5,302 |

The real cascade is **six** hops (`TIER_1 → DIRECT_MODE → T25A → T25B → T25C → T25D`), plus a second, independent cascade on the client. Underneath, every tier does the identical thing: `POST https://api.runware.ai/v1`, model `runware:100@1`, 1024x1024, 25 steps, CFG 8. The tiers differ only in prompt wording — so when Runware is down, all six fail together. The cascade buys ~40s of latency and zero availability.

## Target architecture

```text
Page renders
   │
   ▼
StoryImageService.getImage(sessionId, page, pageText, profile)
   ├─ cache hit (memory → sessionStorage) ──────► same image on back-nav
   ├─ in-flight dedupe ─────────────────────────► await existing promise
   ▼
edge fn: runware-generate-image   (rewritten, ~300 LOC)
   │
   ├─ 1. SCENE DISTILLER  (small fast model, ~0.4s)
   │      page text + previous page's scene
   │      → one English sentence: what is visually happening
   │      → on failure/timeout: first 2 sentences, quotes stripped
   │
   ├─ 2. CHARACTER SHEET  (deterministic, from saved settings)
   │      name, age/grade, avatar type, skin tone, hair,
   │      favorite color/animal + cultural presentation
   │
   ├─ 3. CULTURAL BACKDROP  (from native_language)
   ├─ 4. STYLE + NEGATIVE constants
   ├─ 5. SEED = hash(sessionId + characterName)   ← page-to-page consistency
   ▼
   POST api.runware.ai/v1   (1 retry, 25s timeout)
   │
   success → url          failure → ImageFallbackService (the kept "Tier 4" picture)
```

One code path. Identical for guest and premium.

### How each picture matches the page

The scene distiller reads the actual page and returns one concrete visual sentence — no dialogue, no feelings, no character names. The previous page's scene is passed as a single line of context so "she climbed higher" resolves. The character is **never** described by the distiller; the character sheet is always injected from the user's saved settings, so appearance can't drift.

### Language = culture, not translation (corrected)

Story text is **always English**. `native_language` is a cultural-background signal only:
- **Character presentation** — a French reader's hero reads as French; an Urdu reader's hero as South Asian.
- **Scenery** — culturally familiar backdrops may appear (French → Parisian street, Eiffel Tower).
- **The page always wins.** If the text names a setting (kitchen, forest, spaceship), that is the setting; cultural flavor only fills unspecified or generic backdrops.

No prompt translation anywhere.

### Behaviour preserved (checked forward and backward)

- Back-navigation shows the identical image (memory + `sessionStorage: current_page_images`).
- `image:generation:start` / `:end` events still fire — the guest 20-min timer pauses on these.
- Saved premium stories still restore `cachedImages` / `stories.image_urls` untouched.
- `image_generation_debug` logging kept (`get-cost-analytics` reads it).
- `image-proxy` kept (CORS/hotlink). `ImageGenerationStatusIndicator`, `useImageWithFallback` kept.
- Fresh image per page for guest and premium alike.

Estimated result: **~14,000 LOC → ~600 LOC.**

---

## ⚠️ Permission needed — things I plan to CREATE

1. `src/services/StoryImageService.ts` — new ~200-line frontend service (cache + dedupe + one invoke + fallback).
2. `supabase/functions/_shared/imagePrompt.ts` — scene distiller + character sheet + cultural backdrop, the single prompt source of truth (~180 lines).
3. `docs/IMAGE_GENERATION.md` — replaces the scattered tier docs.

No new tables, no new secrets, no new dependencies. `RUNWARE_API_KEY` and `LOVABLE_API_KEY` (for the distiller) already exist.

## ⚠️ Permission needed — things I plan to DELETE

**Edge functions (whole folders):** `ai-visual-scene-creator`, `runware-template-ab` (+`index-backup.ts`), `runware-template-cd`, `background-image-pregeneration`, `generate-fallback-images`, `clear-character-cache`, `vendor-first-selftest`

**Shared backend modules:** `_shared/CharacterConsistencyService.ts` + `CharacterConsistencyServiceInline.js`; `_shared/ResilientRunwareWebSocket.ts`, `_shared/RunwareWebSocketService.{ts,js}`, `_vendor/RunwareWebSocketService.js`; `_shared/runwareErrorHandler.ts`, `tierFailureMonitoring.js`, `tierLogging.js`; `_vendor/reliability-manager@1.0.0.bundle.mjs`

**Frontend:** `SimpleImageService.ts`, `BatchImageService.ts`, `imageDeduplicationService.ts`, `OptimizedImageCache.ts`, `utils/SmartOrchestrationBypass.ts`, `utils/imageGenerationTrigger.ts`, `hooks/useImageGenerationWithDeduplication.ts`

**Dev/test harnesses (+ their routes in `App.tsx`):** `ImageTierTester.tsx` (5,302), `RunwareConnectionTest.tsx`, `RunwareQualityControls.tsx`, `PromptStudio.tsx`, `Tier1TemplateTest.tsx` (orphan), `PromptTestingEnhancement.tsx` (orphan), `template-testing/BatchTemplateTest.tsx`, `pages/PromptTesting.tsx`, `ImageDebugPanel.tsx`, `BackendTierChecker.tsx`, `dev/ImageGenerationDebugPanel.tsx`

**Rewritten in place (not deleted):**
- `supabase/functions/runware-generate-image/index.ts` — 3,765 → ~300 LOC, same function name so nothing else needs rewiring.
- `src/components/CleanStoryDisplay.tsx` — image call sites swapped to `StoryImageService`; story/timer/nav logic untouched.
- `HealthCheckService.ts`, `SessionCacheManager.ts`, `ErrorRecoveryManager.ts`, `enhancedImageCache.ts` — image-tier branches stripped; the story-generation parts stay.

## ⚠️ Permission needed — database
I plan to **keep all tables** (no drops), just stop writing to `character_consistency_cache` and `visual_details_cache`. Say the word if you'd rather drop them later.

## Not touched
Story generation, the story fallback chain, emergency content, timers, TTS/voices, subscriptions, auth.

## Last step
Update `docs/COMPLETE_SYSTEM_ARCHITECTURE_AND_IMPLEMENTATION.md`, `supabase/functions/README.md` (function count 60 → 53), `docs/CURRENT_TEMPLATE_SYSTEM_AND_FALLBACK_CHAIN.md`, and add `docs/IMAGE_GENERATION.md`.
