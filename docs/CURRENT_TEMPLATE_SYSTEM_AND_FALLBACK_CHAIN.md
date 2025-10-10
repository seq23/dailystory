# Current Template System and Fallback Chain

## Document Status
**Created**: October 7, 2025  
**Last Updated**: October 9, 2025  
**Purpose**: Document the complete fallback architecture for story generation

---

## System Overview

### 6-Tier Cascade with Health-Based Routing (January 2025)

```
┌─────────────────────────────────────────────────────────┐
│          HEALTH CHECK PHASE (2s max)                    │
│  • Check ai-visual-scene-creator availability           │
│  • Check OpenAI API key presence                        │
│  • Route decision based on system health                │
└─────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────┴─────────────────┐
        │   ROUTING DECISION                │
        │   (based on health check)         │
        └─────────────────┬─────────────────┘
                          ↓
    ┌───────────────────────────────────────────┐
    │ Scenario 1: All Systems Healthy           │
    │ Route: Full Cascade                       │
    │   Tier 1 → Direct Mode → CCS_RETRY →      │
    │   2.5A → 2.5B → 2.5C → 2.5D               │
    └───────────────────────────────────────────┘
    ┌───────────────────────────────────────────┐
    │ Scenario 2: AISC Unhealthy                │
    │ Route: 2.5A → 2.5B → 2.5C → 2.5D          │
    │   (Skip Tier 1 and Direct Mode)           │
    └───────────────────────────────────────────┘
    ┌───────────────────────────────────────────┐
    │ Scenario 3: Both AI Systems Down          │
    │ Route: 2.5C → 2.5D                        │
    │   (Skip all AI tiers)                     │
    └───────────────────────────────────────────┘
```

Time2Read employs a **6-tier fallback system** that ensures images are always delivered to users, even during complete system failures.

## Fallback Architecture (January 2025)

```
User Request
    ↓
[Health Check: All HEALTHY]
    ↓
Tier 1: AI Generation via ai-visual-scene-creator
    ├─ Success (95%) → Return image
    └─ Failure (5%) ↓
        ↓
Tier 1.5: Direct Mode (orchestrator → ai-visual-scene-creator → template-cd)
    ├─ AISC generates primaryScene via OpenAI
    ├─ AISC calls template-cd with complexity C (primaryScene + brand suffix)
    ├─ Success (80%) → Return image
    └─ Failure (20%) ↓
        ↓
CCS_RETRY (Populate ctx.tier1 for Tier 2.5A)
    ├─ Success (with latestClothing) → ctx.tier1 filled
    ├─ Partial Success (no latestClothing) → ctx.tier1.characterSeed only
    └─ Failure → ctx.tier1 empty (2.5A will skip)
        ↓
Tier 2.5A: Template AB with CCS
    ├─ Precondition: ctx.tier1?.characterSeed AND ctx.tier1?.latestClothing
    ├─ Success (if both present) → Return image with full CCS
    └─ Skipped (if either missing) ↓
        Reasons:
        - No characterSeed → Skip to 2.5B
        - No latestClothing → Skip to 2.5B (face consistency only)
        ↓
Tier 2.5B: Template AB without CCS
    ├─ Success (90%) → Return image
    └─ Failure (10%) ↓
        ↓
Tier 2.5C: Template CD (Nuclear fallback)
    ├─ Success (99.9%) → Return image
    └─ Failure (0.1%) ↓
        ↓
Tier 2.5D: Template CD Emergency (Synthesized content)
    └─ Success (100%) → Always succeeds
```

### CCS_RETRY and Tier 2.5A Preconditions

**Critical Detail:** Tier 2.5A requires BOTH `characterSeed` AND `latestClothing` from CCS_RETRY.

**Escalation Scenarios:**
1. **CCS_RETRY completely fails** → No `ctx.tier1` data → 2.5A skipped → 2.5B attempted
2. **CCS_RETRY partial success** → Has `characterSeed` but no `latestClothing` → 2.5A skipped → 2.5B with face consistency only
3. **CCS_RETRY full success** → Has both `characterSeed` and `latestClothing` → 2.5A attempted with full CCS

**Why this matters:**
- **Face consistency** is more critical than clothing consistency for user experience
- **Tier 2.5B** can maintain face consistency even without `latestClothing`
- **Logging** explicitly tracks which component is missing for debugging

### Key Decision Points

**Direct Mode Trigger**: Automatically attempts after Tier 1 failure (no gate check, zero throttling). Orchestrator calls `ai-visual-scene-creator` with `directMode: true`, which generates `primaryScene` via OpenAI and delegates to `runware-template-cd` with `templateComplexity: 'C'` for simplified image generation (primaryScene + brand suffix).

**CCS_RETRY Trigger**: Runs when Direct Mode fails, attempts to populate `ctx.tier1` for Tier 2.5A

**Tier 2.5A Precondition**: Requires `ctx.tier1?.characterSeed` AND `ctx.tier1?.latestClothing` to exist (from Tier 1 success OR CCS_RETRY success)
  - If missing `characterSeed`: Skip to 2.5B (no CCS data available)
  - If missing `latestClothing`: Skip to 2.5B (face consistency only, clothing may vary)

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

**📘 For detailed reliability improvements (timeout, retry, tracking), see [IMAGE_GENERATION_RELIABILITY_IMPROVEMENTS_OCT_2025.md](./IMAGE_GENERATION_RELIABILITY_IMPROVEMENTS_OCT_2025.md)**

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
