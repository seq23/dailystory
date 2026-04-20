# Mobile Touch + Batch 2 Fixes (April 2026)

## Summary

This document captures the April 2026 stability batch (Gates A–E) addressing
guest session persistence, image flicker, mobile touch UX, profile preference
randomization, and deterministic rare-word underlining.

---

## Gate A — Stability

| Fix | File | Notes |
|-----|------|-------|
| Verified `SEQUOIA90` discount code is active (90 days, unlimited uses) | DB | Read-only check |
| Hid `<ModernProgressTowers>` on guest sessions | `src/components/CleanStoryDisplay.tsx` | Wrapped in `isPremium &&` |
| Removed `longPressDuration` from dialog/dismiss/timer buttons | `CleanStoryDisplay.tsx`, `CollapsibleFloatingTimer.tsx` | Word-tap long-press preserved |

## Gate B — Session ID unification + refresh persistence

**Root cause**: `CleanStoryDisplay` was using two different session IDs
(`stableSessionId` and `characterSessionIdValue`) as cache keys, causing the
image generator to write to one and the renderer to read from the other.
Result: image flicker as a stale cached image was replaced 2–4 s later by
the freshly-generated one.

**Fix**: Unified all consumers to `stableSessionId` (lines 1030, 1092, 2222,
2310, 2607). The internal `useStoryLogic` ref system was left intact.

**Refresh persistence**: Set `resumeOnRefresh.guest = true` and
`resumeOnRefresh.premium = true` in `src/config/appConfig.ts`. Story + current
page rehydrates from `sessionStorage`; timer continues; images regenerate
from cache (no flicker).

## Gate C — Mobile touch UX

| Fix | File |
|-----|------|
| Second set of nav buttons below story text | `CleanStoryDisplay.tsx`, `StoryNavigationControls.tsx` |
| Larger nav buttons (`h-11`, `font-semibold`) | `StoryNavigationControls.tsx` |
| Scroll threshold (10px) on word taps | `MobileOptimizedInteractiveWord.tsx` |
| Removed redundant `setTimeout` re-opening TTS modal after dismiss | `MobileOptimizedInteractiveWord.tsx` |
| Removed `showLongPressInstruction()` toast invocations | `CleanStoryDisplay.tsx` |

## Gate D — Profile preference randomization

**Root cause**: `storyGenerationService.ts` was injecting **all** stored
preferences (color + animal + food + hobbies) into every story prompt,
making stories feel formulaic.

**Fix**: At `storyGenerationService.ts:302`, shuffle the available
preferences and pick **1–2 at random** per story. Profile data still persists
in DB; only per-story prompt injection is randomized. Prompt text now reads
"weave naturally, do not force all" to guide the AI.

## Gate E — Deterministic rare-word underlining

**Root cause**: For advanced/independent readers, words were only marked
interactive if `length >= 7`. Short-but-rare words like *piqued*, *wry*,
*deft*, *apt* were never underlined.

**Fix**:
- New file `src/utils/rareWordsList.ts` with ~500 curated rare English
  words (literary verbs, advanced adjectives, sophisticated nouns).
- `O(1)` Set lookup via `isRareWord(word)`.
- Updated underlining logic in both
  `MobileOptimizedInteractiveWord.tsx` and `UnifiedInteractiveWord.tsx`:
  ```ts
  return cleanWord.length >= 7 || isRareWord(cleanWord);
  ```

**Maintenance**: To add more rare words, edit
`src/utils/rareWordsList.ts → RARE_WORDS_RAW`. The list is hand-curated;
no programmatic dependency.

---

## What was NOT touched

- 4-tier fallback system (NetflixStyleStoryService, LiveGenerationService)
- Edge functions
- RLS policies
- `useStoryLogic` hook internals
- Emergency content generator
- Diagnostic gating

## Testing checklist

- [ ] Guest: refresh story page → resumes at same page (not redirected to home)
- [ ] Guest: navigate page 2→3→back to 2 → same image (no flicker)
- [ ] Guest: progress towers hidden
- [ ] Mobile: tap X on TTS modal → dismisses cleanly
- [ ] Mobile: scroll over highlighted word → modal does NOT open
- [ ] Advanced reader: word "piqued" appears underlined
- [ ] Premium: generate 3 stories with full profile → preferences vary per story
- [ ] `SEQUOIA90` accepted at checkout, grants 90-day premium
