# Current Template System and Fallback Chain

## Document Status
**Created**: October 7, 2025  
**Last Updated**: October 9, 2025  
**Purpose**: Document the complete fallback architecture for story generation

---

## System Overview

Time2Read employs a **6-tier fallback system** that ensures images are always delivered to users, even during complete system failures.

## Fallback Architecture (October 2025)

```
User Request → SimpleImageService
    ↓
Tier 1: AI Generation (Orchestrator)
    - Component: runware-generate-image
    - Invokes: ai-visual-scene-creator + CharacterConsistencyService
    - Returns: primaryScene + aiSchema + CCS bundle
    - Timeout: 40s total budget (shared with Direct Mode)
    ↓ (on failure)
Tier 1.5: Direct Mode
    - Component: runware-generate-image (Direct Mode path)
    - Fallback: Simplified template call without AI scene creator
    - Uses: primaryScene from Tier 1 (if available)
    - Timeout: Shared 40s budget with Tier 1
    ↓ (on failure)
CCS_RETRY (if Direct Mode fails)
    - Lightweight batch CCS fetch to populate ctx.tier1
    - Goal: Enable Tier 2.5A to run with character consistency
    - Non-blocking: Failure allows cascade to continue to Tier 2.5B
    - Populates: characterSeed, culturalBundle, latestClothing
    ↓
Tier 2.5A: Template AB with CCS
    - Component: runware-template-ab
    - Precondition: ctx.tier1.characterSeed must exist
    - If precondition fails: Skip to Tier 2.5B (logged explicitly)
    - Full character consistency with precomputed CCS bundle
    - Timeout: 20s
    ↓ (on 503 NO_PRECOMPUTED_CCS or failure)
Tier 2.5B: Template AB without CCS
    - Component: runware-template-ab
    - Simple scene-only generation
    - Timeout: 20s
    ↓ (on failure)
Tier 2.5C: Template CD (Nuclear)
    - Component: runware-template-cd
    - Hardcoded prompts with minimal dependencies
    - Timeout: 15s
    ↓ (on failure)
Tier 4: SVG Fallback (Client-side)
    - Component: ImageFallbackService
    - Guaranteed success with procedural SVG
```

### Key Decision Points

**Direct Mode Trigger**: Automatically attempts after Tier 1 failure (no gate check, zero throttling)

**CCS_RETRY Trigger**: Runs when Direct Mode fails, attempts to populate `ctx.tier1` for Tier 2.5A

**Tier 2.5A Precondition**: Requires `ctx.tier1?.characterSeed` to exist (from Tier 1 success OR CCS_RETRY success)

**Timeout Budget**: Orchestrator has 40s total budget (Tier 1 + Direct Mode share this), each subsequent tier has independent timeout

## Tier 1: AI Visual Scene Creator (`ai-visual-scene-creator`)

**Purpose**: Generate comprehensive visual schemas using GPT-4o-mini with character consistency and cultural context.

**Key Features**:
- Pure TypeScript implementation with zero NPM dependencies
- Generates detailed primaryScene descriptions (200-2000 characters)
- Maintains session-wide character consistency via Supabase cache
- Cultural context integration for non-English languages
- Structured avatar data with session-seeded features
- **Three-tier parsing strategy** (October 2025):
  1. **JSON Success (parseMethod: 'json')**: OpenAI returns valid JSON schema → Full visual schema available
  2. **Regex Extraction (parseMethod: 'regex')**: OpenAI returns free text with primaryScene → Only primaryScene available, no schema
  3. **Complete Failure (parseMethod: 'none')**: No primaryScene detected → Escalates to Tier 2

**Return Values**:
- `success: true` + `aiSchema` object → Valid JSON schema (parseMethod: 'json')
- `success: true` + `primaryScene` only → Regex extraction (parseMethod: 'regex'), schema unavailable
- `success: false` → Complete failure (parseMethod: 'none'), escalate to Tier 2

**Debug Data** (October 2025):
- Always includes: `systemPrompt`, `userPrompt`, `culturalContext`, `httpStatus`, `parseMethod`, `attemptsUsed`, `encounteredBackoff`
- On failure: Adds `rawResponse` (first 500 chars), `parseError`, `parseErrorDetails`
- Test button truthfulness: `aiSchema` only appears when OpenAI returned valid JSON

**Fallback Behavior**: 
- Escalates to Tier 2 (Runware Orchestrator) on failure
- Does NOT provide emergency content (that's Tier 4's job)

## October 2025 Updates: Never-Show-Diagnostics Protection

### Key Changes
1. **Emergency content treated as valid story** - Not an error state
2. **Diagnostic UI gated** - Requires `window.__ENABLE_DIAGNOSTICS__ = true`
3. **Toast notifications** - Replace error pages
4. **Outer safety nets** - Services never throw exceptions
5. **Source tracking** - Analytics for tier usage
6. **CCS data flow fixed** - Template-AB nested payload now preserves precomputedCCS
7. **Template-CD dynamic loader** - LKG serve-stale approach avoids boot sync
8. **CCS Cultural Bundle Pre-computation (NEW - Jan 2025)** - Orchestrator computes `culturalBundle` early with emergency fallbacks
9. **Tier 2.5A Pre-check Guard (NEW - Jan 2025)** - Validates bundle completeness before attempting 2.5A, skips if incomplete
10. **AI Scene Creator Parsing Truthfulness (NEW - Oct 2025)** - Strict schema detection prevents misreporting; test button shows only real JSON schemas

### Implementation Files
- `src/components/CleanStoryDisplay.tsx` (lines 1974-1998, 2162-2199, 4035-4043)
- `src/services/NetflixStyleStoryService.ts` (lines 61-236)
- `src/services/LiveGenerationService.ts` (lines 555-595)
- `src/services/errorHandlingManager.ts` (lines 112-183)
- `supabase/functions/runware-template-ab/index.ts` (lines 964-974) - Nested payload CCS preservation
- `supabase/functions/runware-template-cd/index.ts` (lines 277-295) - Dynamic handler loading with LKG
- `supabase/functions/runware-generate-image/index.ts` (lines 700-755, 2004-2200) - CCS bundle validation & 2.5A pre-check
- `supabase/functions/ai-visual-scene-creator/index.ts` (lines 749-920) - Three-tier parsing with truthful schema detection

### User Experience Guarantee
✅ Users ALWAYS see story content  
✅ Users NEVER see diagnostic pages  
✅ Session continues uninterrupted  
✅ Timer, images, navigation work normally  

## Related Documentation
- [EMERGENCY_FALLBACK_PROTECTION.md](./EMERGENCY_FALLBACK_PROTECTION.md) - Complete implementation
- [REGRESSION_PREVENTION_CHECKLIST.md](./REGRESSION_PREVENTION_CHECKLIST.md) - Testing
- [DIAGNOSTIC_GATING_IMPLEMENTATION.md](./DIAGNOSTIC_GATING_IMPLEMENTATION.md) - Diagnostic access
- [AI_VISUAL_SCENE_CREATOR_SYSTEM_PROMPT.md](./AI_VISUAL_SCENE_CREATOR_SYSTEM_PROMPT.md) - Tier 1 comprehensive docs
