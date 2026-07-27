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
    frames, deformities, extreme close-ups, disembodied hands, and anything
    unsafe for children. Negatives also explicitly reject adults, teenagers,
    makeup and jewellery: without that, the model reliably paints the hero as
    a young adult. The character sheet reinforces it ("unmistakably a small
    child", child body proportions), and the prompt requires the child to be
    visible head-to-waist so pages don't become close-ups of a stray hand.

If the AI distiller fails or times out, `extractScene()` falls back to the
page's first two sentences with dialogue stripped (`sceneSource: 'extracted'`).
An image is always attempted.

### Language = culture, never translation

Story text is **always English**. `native_language` only signals the reader's
cultural background and drives two things: the character's features and an
ambient backdrop (e.g. `ur` → South Asian street with Mughal arches, `fr` →
Parisian street).

A stated setting always wins. If `sceneHasSetting()` finds a location word in
the distilled scene (hallway, spaceship, kitchen…), the full backdrop is
dropped and only a non-conflicting **cultural flavor** phrase is appended
(e.g. "South Asian Pakistani cultural details, embroidered fabrics and
truck-art patterns"). The full backdrop is used only for a scene that names no
setting at all. This avoids the old failure mode of "a hallway, set in a
street".

### Deep skin tone (`skinTone = 'dark'`, every language)

`deep brown skin` on its own renders medium-tan — diffusion models wash deep
tones out. So **every** reader who picks `dark`, in any language, gets:

- skin: `deep rich brown skin with warm golden undertones, luminous and even,
  full tonal range with soft readable shadows` (replaces `SKIN_TONES.dark`)
- the warm fill-light recipe appended to `STYLE`
- the anti-washout negative group (`DEEP_NEGATIVE`)

Ancestry wording still comes from `CULTURES`, so an Urdu reader stays South
Asian Pakistani, just at the tone they actually chose. No ethnicity terms are
in `DEEP_NEGATIVE` — those belong to the Afro path below.

### Ancestry locks: Arabic (`ar`), Hindi (`hi`), Chinese (`zh`)

`Middle Eastern features` / `South Asian Indian features` were too vague and
the model drifted to a generic tanned face. `ANCESTRY_LOCKS` in
`imagePrompt.ts` replaces the culture appearance line for these two languages
with an explicit nationality, facial cues and a named hairstyle per avatar
type, plus a wrong-ethnicity negative group:

- `ar` — "Emirati Gulf Arab child, Khaleeji features…", glossy black hair
  (short for boys, long softly wavy for girls)
- `hi` — "Indian child from India, South Asian Indian features…", glossy black
  hair (side part for boys, two braids with ribbons for girls)
- `zh` — "Chinese child from China, East Asian features…", straight glossy
  black hair (neat fringe for boys, bob/twin ponytails for girls)

Locks apply at every skin tone and stack with the deep-tone treatment above.
The Afro path takes precedence and disables the lock (it can never trigger for
`ar`/`hi`/`zh` anyway).

### Afro-descent rendering (skin tone `dark` + en/es/pt/fr)

On top of the deep-tone treatment above, these languages also get:

A deep tone alone gives the model no ancestry anchor, so it falls back to its
strongest dark-skin prior — usually South Asian or Middle Eastern features with
straight hair. When `avatar.skinTone === 'dark'` **and** the language base is
`en`, `es`, `pt` or `fr` (plus the explicit `en-african-american` /
`fr-francophone-african` codes), `afroProfile()` substitutes three fields in
the character sheet:

| Field | Value |
| --- | --- |
| Ancestry | `en` → African American / West African descent · `es` → Afro-Latina/Afro-Latino · `pt` → Afro-Brazilian · `fr` → West African / Afro-Caribbean |
| Skin | rich deep mahogany-brown African skin, **warm golden-red undertones**, luminous and even, full tonal range with soft readable shadows |
| Hair | named style (see below) — replaces the generic "neat age-appropriate hair" |

Other languages keep their own ancestry: an Urdu reader with `dark` gets South
Asian Pakistani features at the deep tone described in the section above.

**Hair.** "Curly" reliably yields loose Caucasian curls; type-4 coils only
appear when the style is *named*.

| Avatar | Style |
| --- | --- |
| boy | short natural 4C coily afro, neatly shaped hairline (fixed) |
| prefer-not-to-answer | soft rounded natural 4C afro (fixed) |
| girl | one of four, picked deterministically: afro puff buns · box braids with beads · cornrows into a ponytail · rounded 4C afro |

The girl style is chosen with the same `FNV-1a(sessionId + name)` hash used for
the image seed, so it is **fixed for the whole session** while differing
between children. No randomness anywhere.

**Lighting.** Shared with every deep tone (see the section above): soft warm
wrap-around key light with generous fill, gentle rim light, warm colour
temperature.

**Negatives.** On top of the shared anti-washout group, this path only adds an
anti-wrong-ethnicity group (straight hair, silky hair, loose wavy hair, blonde
hair, South Asian / Indian / Middle Eastern / Arab features, tanned white
person).

Image cache keys are `session + page`, so live sessions keep their already
generated images — only new generations use the new wording.

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