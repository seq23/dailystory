# Current Template System and Fallback Chain

## Document Status
**Created**: October 7, 2025  
**Last Updated**: October 7, 2025  
**Purpose**: Document the complete fallback architecture for story generation

---

## System Overview

Time2Read employs a **4-tier fallback system** that ensures story content is always delivered to users, even during complete system failures.

## Fallback Architecture

```
Tier 1: AI Generation (ai-visual-scene-creator)
    - Returns primaryScene + schema OR ok: false
    - 2 retry attempts maximum
    - 200-char minimum for primaryScene (warning only)
    - No emergency fallback: returns ok: false if primaryScene missing
    ↓ (on ok: false → escalate to Tier 2.5A)
Tier 2.5A: Template Service with Character Consistency (runware-template-ab)
    - Attempts Direct Mode if Tier 1 succeeded with primaryScene
    - Full character consistency with precomputed CCS bundle
    ↓ (on failure → escalate to Tier 2.5B)
Tier 2.5B: Template Service Scene-Only (runware-template-cd)
    - Uses primaryScene only (no schema required)
    ↓ (on failure → escalate to Tier 3)
Tier 3: Emergency Content (ErrorHandlingManager)
    - Generates rhyming fallback content (NEVER FAILS)
    ↓
User sees story content (NEVER sees diagnostic page)
```

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

### Implementation Files
- `src/components/CleanStoryDisplay.tsx` (lines 1974-1998, 2162-2199, 4035-4043)
- `src/services/NetflixStyleStoryService.ts` (lines 61-236)
- `src/services/LiveGenerationService.ts` (lines 555-595)
- `src/services/errorHandlingManager.ts` (lines 112-183)
- `supabase/functions/runware-template-ab/index.ts` (lines 964-974) - Nested payload CCS preservation
- `supabase/functions/runware-template-cd/index.ts` (lines 277-295) - Dynamic handler loading with LKG
- `supabase/functions/runware-generate-image/index.ts` (lines 700-755, 2004-2200) - CCS bundle validation & 2.5A pre-check

### User Experience Guarantee
✅ Users ALWAYS see story content  
✅ Users NEVER see diagnostic pages  
✅ Session continues uninterrupted  
✅ Timer, images, navigation work normally  

## Related Documentation
- [EMERGENCY_FALLBACK_PROTECTION.md](./EMERGENCY_FALLBACK_PROTECTION.md) - Complete implementation
- [REGRESSION_PREVENTION_CHECKLIST.md](./REGRESSION_PREVENTION_CHECKLIST.md) - Testing
- [DIAGNOSTIC_GATING_IMPLEMENTATION.md](./DIAGNOSTIC_GATING_IMPLEMENTATION.md) - Diagnostic access
