# Image Generation — single source of truth (rebuilt July 2026)

This document supersedes every previous image-generation doc (tiers, cascade,
orchestration, character-consistency services). Those files are kept for
history only; if they disagree with this page, this page is right.

## The whole system

```text
CleanStoryDisplay / imageGenerationTrigger / BatchImageService
        │
        ▼
StoryImageService            (src/services/StoryImageService.ts)
  memory + sessionStorage cache  →  in-flight dedupe  →  invoke
        │
        ▼
runware-generate-image        (supabase/functions/runware-generate-image)
  scene distiller → prompt assembly → Runware → { imageURL, scene, seed }
        │  (on any failure)
        ▼
ImageFallbackService          static "images not working" illustrations
```

There is no tier cascade. Guest and premium users use the identical path.

## Why the tiers are gone

TIER_1 / DIRECT / T25A / T25B / T25C / T25D all called the same Runware API
with the same model. When Runware or the key failed, every tier failed — the
cascade only added latency (up to 6 sequential attempts) and ~15,700 lines of
code. One call plus one retry gives the same success rate, ~5x faster on the
failure path, and a single place to fix bugs.

## The prompt (supabase/functions/_shared/imagePrompt.ts)

Every prompt is exactly three parts:

1. **Character sheet** — deterministic, from the reader's saved settings:
   age, avatar type, skin tone, cultural features, favourite colour. It is
   byte-identical on every page, so the hero cannot drift.
2. **Scene** — one English sentence describing only what is visually happening
   on this page. Produced by a fast AI call (`google/gemini-3.6-flash`,
   3s timeout) that is explicitly forbidden from describing the main
   character's face, age, skin, hair, or clothing — that is the character
   sheet's job. The previous page's scene is passed in for continuity, so
   pronouns ("she climbed higher") resolve correctly.
3. **Style + negatives** — fixed picture-book style; negatives block text,
   frames, deformities, and anything unsafe for children.

If the AI distiller fails or times out, `extractScene()` falls back to the
page's first two sentences with dialogue stripped (`sceneSource: 'extracted'`).
An image is always attempted.

### Language = culture, never translation

Story text is **always English**. `native_language` only signals the reader's
cultural background and drives two things: the character's features and an
ambient backdrop (e.g. `ur` → South Asian street with Mughal arches, `fr` →
Parisian street). The backdrop is only added when the page itself does not
state a setting — if the page says "spaceship", the page wins
(`sceneHasSetting()`).

### Consistency seed

`seed = FNV-1a(sessionId + characterName)`. Same session ⇒ same seed ⇒ the same
hero look across every page, with no database tables involved.

## Caching and the product rules

`StoryImageService` caches `sessionId::pageNumber → { url, scene }` in memory
and `sessionStorage` (`t2r:img:` prefix).

| Event | Behaviour |
| --- | --- |
| Navigate back | Cache hit — the identical image is shown (guest and premium) |
| Two components request one page | In-flight dedupe — one API call |
| "Next Story" (guest) | `clearSession()` — new story, new artwork |
| Magic-wand rewrite (premium) | `clearSession()` — new artwork |
| Guest 20-minute timer hits 0 | `clearSession()` |
| Save to library (premium) | `getSessionImages()` returns the URLs to persist |

## Failure behaviour

The edge function always returns HTTP 200. On failure the body is
`{ success: false, error }` and `StoryImageService` substitutes a static
illustration (`isFallback: true`) — cached, so back-navigation stays stable.
A child never sees an error page or a broken image.

## Contract

```jsonc
// POST /functions/v1/runware-generate-image   (verify_jwt = false)
{
  "pageText": "Amara tiptoed into the old library...",
  "sessionId": "session-abc",
  "pageNumber": 1,
  "previousScene": "A child opens a wooden gate",   // optional
  "userInfo": {
    "name": "Amara", "age": 7, "nativeLanguage": "ur",
    "avatar": { "type": "girl", "skinTone": "medium" },
    "favoriteColor": "purple"
  }
}

// 200
{
  "success": true,
  "imageURL": "https://im.runware.ai/...webp",
  "scene": "A child tiptoes into a sunlit library where a small orange cat sleeps",
  "sceneSource": "ai",        // or "extracted"
  "seed": 1831790622,
  "prompt": "...", "provider": "runware", "model": "runware:100@1"
}
```

## Telemetry

Best-effort, never blocking: every attempt writes to
`image_generation_debug` (`tier: 'single'`) and every success writes
`cost_tracking` at $0.0013/image.

## Removed in this rebuild

Edge functions: `ai-visual-scene-creator`, `runware-template-ab`,
`runware-template-cd`, `_shared/CharacterConsistencyService.ts`.
Frontend: `SimpleImageService`, `HealthCheckService`, `healthLegacy`,
`SmartOrchestrationBypass`, `ImageTierTester`, `debug/SystemValidation`,
`useImageGenerationWithDeduplication`.

Secrets required: `RUNWARE_API_KEY` (image), `LOVABLE_API_KEY` (distiller).