# Force Tier 1 Test Implementation Guide

**Status:** ✅ OPERATIONAL  
**Last Updated:** October 2025  
**Purpose:** Complete implementation guide for Force Tier 1 testing

## Overview

The **Force Tier 1 Test** validates that the complete Tier 1 image generation pipeline works correctly without cascading to lower tiers. This test is critical for ensuring:

- AI scene generation (Step A) works properly
- Complete CCS (Character Consistency Service) integration functions correctly  
- Orchestrator receives and processes all required fields
- Template compatibility with Tier 1 output

**Key Success Metric:** Test returns 200 status with `imageURL`, complete prompts, and `COMPLETE_TIER_1` template, demonstrating Tier 1 can work standalone when all components function correctly.

## Two-Step Process Architecture

Force Tier 1 uses a **two-phase approach** to ensure complete CCS data is available:

### Step A: AI Scene Generation
**Component:** `ai-visual-scene-creator` edge function  
**Purpose:** Generate `primaryScene` via OpenAI  
**Input:** Story text, user info, character details  
**Output:** AI-generated scene description (1000-1200 characters)  
**Configuration:** Standard OpenAI call, no special flags

```typescript
// Tester calls ai-visual-scene-creator directly
const sceneResult = await supabase.functions.invoke('ai-visual-scene-creator', {
  body: {
    pageText: storyText,
    userInfo: fakeUserInfo,
    sessionId: fakeSessionId,
    pageNumber: 1
  }
});

const primaryScene = sceneResult.data?.primaryScene; // ~1034 chars
```

### Step B: Orchestrator with Precomputed CCS
**Component:** `runware-generate-image` orchestrator  
**Purpose:** Complete Tier 1 generation with precomputed CCS  
**Input:** `primaryScene` (from Step A) + `forceCompleteTier1: true` + fake `characterSeed`  
**Output:** Full image generation with prompts and tier metadata  
**Configuration:** `forceCompleteTier1: true`, `skipTier1AI: false`

```typescript
// Tester calls orchestrator with complete payload
const imageResult = await supabase.functions.invoke('runware-generate-image', {
  body: {
    storyText,
    userInfo: fakeUserInfo,
    sessionId: fakeSessionId,
    pageNumber: 1,
    forceCompleteTier1: true,      // STOP at Tier 1
    skipTier1AI: false,             // CRITICAL: Do not skip AI scene
    precomputedCCS: {
      primaryScene,                 // From Step A
      characterSeed: fakeCharacterSeed  // Complete fake seed
    }
  }
});
```

## Critical Configuration: skipTier1AI

**CRITICAL RULE:** `skipTier1AI` MUST be `false` for Force Tier 1 tests

### Why This Matters

The orchestrator has two paths for processing `precomputedCCS`:

```typescript
// orchestrator logic (simplified)
if (payload.skipTier1AI === true) {
  // Path 1: Skip AI scene generation entirely
  // PROBLEM: primaryScene stays undefined, causes null errors
  ctx.tier1 = { ...precomputedCCS, primaryScene: undefined };
}

if (payload.skipTier1AI === false || !payload.skipTier1AI) {
  // Path 2: Use precomputed primaryScene from payload
  // SUCCESS: primaryScene propagates correctly
  ctx.tier1 = { 
    ...precomputedCCS,
    primaryScene: precomputedCCS.primaryScene  // Preserved!
  };
}
```

### Bug History (October 2025)

**Before Fix:** `skipTier1AI: true` caused Force Tier 1 tests to fail
- Orchestrator received `primaryScene` in payload
- But `skipTier1AI: true` set `ctx.tier1.primaryScene = undefined`
- Template generation failed with null scene errors

**After Fix:** `skipTier1AI: false` preserves `primaryScene`
- Orchestrator copies `primaryScene` from `precomputedCCS`
- Template receives valid scene description
- Test completes successfully with image and prompts

## Fake CharacterSeed Structure

The tester generates a complete fake `characterSeed` with all fields required for template compatibility:

```typescript
const fakeCharacterSeed = {
  // Core Identity
  characterDescription: `${name} is a brave and curious ${age}-year-old ${avatarType}...`,
  
  // Physical Traits
  physicalTraits: {
    age: age,
    gender: avatarType === 'boy' ? 'male' : avatarType === 'girl' ? 'female' : 'child',
    skinTone: skinTone,
    hairColor: hairColor,
    hairStyle: hairStyle,
    eyeColor: 'brown',
    height: `average for ${age}`,
    build: 'athletic',
    distinctiveFeatures: ['bright smile', 'expressive eyes']
  },
  
  // Avatar Identity (CRITICAL for template compatibility)
  avatarIdentity: {
    type: avatarType,
    skinTone: skinTone,
    hairColor: hairColor,
    culturalProfile: 'multicultural-american',
    nativeLanguage: 'en',
    name: name
  },
  
  // CCS Metadata
  ccsVersion: '4.0',
  generatedAt: new Date().toISOString(),
  source: 'test-suite',
  
  // Optional Secondary Characters
  secondaryCharacterSeeds: [],
  detectedAnimals: []
};
```

### Required Fields Breakdown

| Field Category | Required Fields | Purpose |
|---------------|-----------------|---------|
| **Character Description** | `characterDescription` | Narrative context for templates |
| **Physical Traits** | `age`, `gender`, `skinTone`, `hairColor`, `hairStyle` | Visual appearance details |
| **Avatar Identity** | `type`, `skinTone`, `hairColor`, `culturalProfile`, `nativeLanguage`, `name` | Core identity mapping (fallback pattern support) |
| **CCS Metadata** | `ccsVersion`, `generatedAt`, `source` | Version tracking and debugging |

**Fallback Pattern Support:** All templates use `avatarIdentity?.type || userInfo?.avatar?.type || 'child'` pattern, so `avatarIdentity` must be present in fake seed.

## Success Criteria

A Force Tier 1 test **PASSES** when:

1. ✅ **Status:** 200 (not 500 or 503)
2. ✅ **Image URL:** `result.imageURL` is present and valid
3. ✅ **Tier Classification:** `result.tier === 'tier-1-forced'`
4. ✅ **Template Type:** `result.details?.templateType === 'COMPLETE_TIER_1'`
5. ✅ **Prompts Present:** Both `positivePrompt` and `negativePrompt` exist
6. ✅ **No Cascade:** Stops at Tier 1 without calling 2.5A/B/C/D
7. ✅ **Routing Steps:** Shows "TIER 1 STEP A" (AI scene) and "TIER 1 STEP B" (orchestrator)

### Expected Test Output

```typescript
{
  success: true,
  tier: 'tier-1-forced',
  imageURL: 'https://im.runware.ai/image/ws/0.5/ii/...webp',
  details: {
    positivePrompt: '8-year-old African American girl with dark skin...',  // 800-1200 chars
    negativePrompt: 'text, words, letters, watermark...',                 // 200-400 chars
    templateType: 'COMPLETE_TIER_1',
    sceneGenerationOnly: false,
    primaryScene: 'Emma explores a magical forest...',                    // 1000-1200 chars
    tier1Complete: true,
    ccsMethodsRun: ['characterSeed', 'culturalEnhancement', ...],        // 7 methods
  },
  routingSteps: [
    '🎯 TIER 1 STEP A: Calling ai-visual-scene-creator for primaryScene...',
    '✅ TIER 1 STEP A: AI generated primaryScene (1034 chars)',
    '🎯 TIER 1 STEP B: Building orchestrator payload with primaryScene',
    '⚙️ Config: forceCompleteTier1=true, skipTier1AI=false',
    '🎯 TEST MODE: Force Tier 1 (STOP at 1, no cascade)',
    '✅ Tier 1 Complete Success',
    '🛑 STOPPED at Tier 1 as expected (force mode)'
  ]
}
```

## Common Pitfalls & Solutions

### Pitfall #1: skipTier1AI = true
**Symptom:** Test fails with "Cannot read properties of undefined (reading 'primaryScene')"  
**Cause:** `skipTier1AI: true` nullifies `primaryScene` in orchestrator  
**Solution:** Always use `skipTier1AI: false` in Force Tier 1 tests

### Pitfall #2: Missing characterDescription
**Symptom:** Template generation fails or produces poor quality prompts  
**Cause:** `characterSeed.characterDescription` is undefined or empty  
**Solution:** Generate complete narrative description (200-300 words)

### Pitfall #3: Missing avatarIdentity
**Symptom:** Fallback pattern fails, templates use default 'child' avatar  
**Cause:** `characterSeed.avatarIdentity` is undefined  
**Solution:** Include complete `avatarIdentity` object with all 6 fields

### Pitfall #4: Incomplete physicalTraits
**Symptom:** Templates generate generic appearance descriptions  
**Cause:** Missing fields in `physicalTraits` object  
**Solution:** Include all 8 required physical trait fields

### Pitfall #5: Display Filter Blocking Prompts
**Symptom:** Test succeeds but UI doesn't show prompts  
**Cause:** `result.tier !== 'tier-1-forced'` condition in tester UI (FIXED October 2025)  
**Solution:** Removed display filter, prompts now always shown

## Integration Points

### Frontend Tester (ImageTierTester.tsx)

**Location:** `src/components/ImageTierTester.tsx`  
**Test Button:** "Force Tier 1" (formerly expected to fail, now expected to succeed)  
**Display Logic:** Lines 4541+ (prompt display section)

```typescript
// Force Tier 1 test logic
const runForceTier1Test = async () => {
  // Step A: Get AI scene
  const sceneResult = await callAiVisualSceneCreator();
  
  // Step B: Call orchestrator with complete payload
  const imageResult = await callOrchestratorWithPrecomputedCCS({
    primaryScene: sceneResult.primaryScene,
    characterSeed: generateFakeCharacterSeed(),
    forceCompleteTier1: true,
    skipTier1AI: false  // CRITICAL
  });
  
  // Classify result
  if (imageResult.success && imageResult.imageURL) {
    return { classification: 'tier-1-forced', success: true };
  }
};
```

### Backend Orchestrator (runware-generate-image)

**Location:** `supabase/functions/runware-generate-image/index.ts`  
**Force Mode Logic:** Lines 1000-1100 (approximate)  
**CCS Integration:** Lines 1600-1700 (ctx.tier1 assignment)

```typescript
// Orchestrator force mode handling
if (payload.forceCompleteTier1 === true) {
  console.log('🎯 TEST MODE: Force Tier 1 (STOP at 1, no cascade)');
  
  // Process Tier 1 with precomputed CCS
  const tier1Result = await processInlinedTier1({
    ...payload,
    skipTier1AI: payload.skipTier1AI,  // Must be false!
    precomputedCCS: payload.precomputedCCS
  });
  
  // STOP here, do not cascade
  if (tier1Result.success) {
    return new Response(JSON.stringify({
      ...tier1Result,
      tier: 'tier-1-forced',
      stopped: true
    }), { headers: corsHeaders });
  }
}
```

### Template Compatibility (UnifiedCharacterConsistency)

**Location:** `supabase/functions/_shared/UnifiedCharacterConsistency.js`  
**Character Seed Processing:** Lines 200-300 (approximate)  
**Fallback Pattern:** `avatarIdentity?.type || userInfo?.avatar?.type || 'child'`

```javascript
// Template expects characterSeed with these fields
buildTier1CompleteTemplate(characterSeed, primaryScene, userInfo) {
  // Requires: characterDescription (narrative)
  const description = characterSeed.characterDescription;
  
  // Requires: avatarIdentity (fallback support)
  const avatarType = characterSeed.avatarIdentity?.type || 
                     userInfo?.avatar?.type || 
                     'child';
  
  // Requires: physicalTraits (appearance)
  const { skinTone, hairColor, hairStyle } = characterSeed.physicalTraits;
  
  // Build 6-section template prompt
  return buildMultiSectionPrompt({ description, avatarType, skinTone, ... });
}
```

## Testing Workflow

### Manual Test Procedure

1. Open `src/components/ImageTierTester.tsx` in debug mode
2. Click "Force Tier 1" button
3. Observe routing steps:
   - Should show "TIER 1 STEP A: Calling ai-visual-scene-creator..."
   - Should show "✅ TIER 1 STEP A: AI generated primaryScene (1034 chars)"
   - Should show "TIER 1 STEP B: Building orchestrator payload..."
   - Should show "✅ Tier 1 Complete Success"
   - Should show "🛑 STOPPED at Tier 1 as expected"
4. Verify results card shows:
   - Green checkmark (success)
   - Image thumbnail
   - "Runware Debug Info" section with prompts
   - Classification: "tier-1-forced Success"
5. Expected completion time: 15-25 seconds

### Automated Test Integration

```typescript
// Example test case
describe('Force Tier 1 Test', () => {
  it('should complete Tier 1 without cascading', async () => {
    const result = await runForceTier1Test({
      storyText: 'Emma explores a magical forest...',
      userInfo: generateFakeUserInfo(),
      sessionId: 'test-force-tier-1'
    });
    
    expect(result.success).toBe(true);
    expect(result.tier).toBe('tier-1-forced');
    expect(result.imageURL).toBeDefined();
    expect(result.details.positivePrompt).toBeDefined();
    expect(result.details.primaryScene).toBeDefined();
    expect(result.details.tier1Complete).toBe(true);
  });
});
```

## Monitoring & Debugging

### Key Logs to Monitor

**Step A (AI Scene Generation):**
```
🎯 TIER 1 STEP A: Calling ai-visual-scene-creator for primaryScene...
✅ TIER 1 STEP A: AI generated primaryScene (1034 chars)
```

**Step B (Orchestrator):**
```
🎯 TIER 1 STEP B: Building orchestrator payload with primaryScene (1034 chars)
⚙️ Config: forceCompleteTier1=true, skipTier1AI=false
🎯 TEST MODE: Force Tier 1 (STOP at 1, no cascade)
📋 Expected: Tier 1 CCS prep → Tier 1 → STOP
```

**Success:**
```
✅ Tier 1 Complete Success
🛑 STOPPED at Tier 1 as expected (force mode)
Final Classification: tier-1-forced Success
```

### Debug Data Exposure

All Force Tier 1 tests expose complete debug information:
- `aiDebugSchema` - AI model metadata
- `runwareDebugData` - Image generation details
- `orchestratorDebugData` - Routing and timing
- `primaryScene` - AI-generated scene (1000-1200 chars)
- `positivePrompt` - Enhanced template prompt (800-1200 chars)
- `negativePrompt` - Nuclear negative prompt (200-400 chars)

## Production Comparison

| Aspect | Force Tier 1 Test | Production Tier 1 |
|--------|-------------------|-------------------|
| **AI Scene Generation** | ✅ Real OpenAI call | ✅ Real OpenAI call |
| **Character Seed** | ⚠️ Fake (complete) | ✅ Real (from CCS) |
| **Cascade Behavior** | ❌ STOP at Tier 1 | ✅ Cascade to 2.5A on failure |
| **Configuration** | `forceCompleteTier1: true` | `forceCompleteTier1: undefined` |
| **skipTier1AI** | `false` (preserve scene) | `false` (normal flow) |
| **Purpose** | Validate Tier 1 works standalone | Maximize quality, fallback on failure |

**Key Difference:** Force Tier 1 **proves Tier 1 can succeed alone** when all components work, while production Tier 1 **optimizes for reliability** by cascading on any failure.

## Related Documentation

- **Architecture:** `docs/SYSTEM_ARCHITECTURE_SNAPSHOT_2025_09_21.md` (6-tier system)
- **Testing Guide:** `docs/IMAGE_TIER_TESTING.md` (test modes and expected behaviors)
- **Phase Integration:** `docs/PHASE_INTEGRATION_ORCHESTRATOR.md` (CCS integration)
- **Avatar Mapping:** `docs/AVATAR_MAPPING_OPTIMIZATION.md` (avatarIdentity structure)
- **Bulletproofing:** `docs/TIER_1_DIRECT_MODE_BULLETPROOFING.md` (reliability fixes)

---

**Implementation Status:** ✅ OPERATIONAL  
**Last Verified:** October 2025  
**Test Success Rate:** 100% (when skipTier1AI=false)  
**Next Review:** Quarterly validation of characterSeed structure
