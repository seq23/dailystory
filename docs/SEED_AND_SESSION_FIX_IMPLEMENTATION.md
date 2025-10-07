# Comprehensive Seed Propagation & Session ID Stability Fix

**Date:** 2025-10-07  
**Issue:** Character visual consistency broken due to missing seed propagation and inconsistent session IDs

## Root Causes Identified

### 1. Seed Propagation Failures (Backend)
- **template-cd**: Seed nested under `imageGeneration.seed` instead of top-level
- **template-ab**: `callRunwareAPI` returned only string URL, discarding seed
- **runware-generate-image**: Orchestrator never extracted seed from tier responses
- **ai-visual-scene-creator**: Direct Mode didn't extract seed from template-cd

### 2. Session ID Inconsistency (Frontend)
- Three different session ID mechanisms:
  - `stableSessionId`: Generated once per mount (CORRECT)
  - `characterSessionIdValue`: Ref-based, used for cache lookups (INCONSISTENT)
  - Fresh `generateSessionId()`: New UUID per batch image (BREAKS CONTINUITY)

## Fixes Applied

### Phase 1: Backend Seed Response Structure

#### 1.1 template-cd (supabase/functions/runware-template-cd/index.js)
**Lines 586-599**: Moved seed to top-level for frontend capture
```javascript
const result = {
  success: true,
  imageURL: typeof imageGenResult === 'string' ? imageGenResult : imageGenResult?.imageURL,
  seed: typeof imageGenResult === 'object' ? imageGenResult?.seed : null, // ✅ TOP LEVEL
  // ... rest of response
};
```

#### 1.2 template-ab (supabase/functions/runware-template-ab/index.ts)
**Line 973-975**: Changed `callRunwareAPI` to return object with seed
```typescript
return { imageURL: imageTask.imageURL, seed: imageTask.seed }; // ✅ Return object
```

**Lines 1219-1246, 1287-1317, 1371-1403**: Updated all callers (Tier 2.5A legacy, inline, and 2.5B)
```typescript
const runwareResult = await callRunwareAPI(positivePrompt, negativePrompt, options);
imageURL = typeof runwareResult === 'string' ? runwareResult : runwareResult?.imageURL;
const returnedSeed = typeof runwareResult === 'object' ? runwareResult?.seed : null;

// In return statement:
...(imageURL && { imageURL, seed: returnedSeed || null })
```

#### 1.3 runware-generate-image (supabase/functions/runware-generate-image/index.ts)
**Lines 2056-2066, 1935-1940, 2178-2183, 2317-2322, 1800-1810**: Added seed extraction for ALL tiers

**Tier 2.5A:**
```typescript
seed: tier25aResponse.data?.seed || tier25aResponse.data?.imageGeneration?.seed || null
```

**Tier 2.5B:**
```typescript
seed: tier25bResponse.data?.seed || tier25bResponse.data?.imageGeneration?.seed || null
```

**Tier 2.5C:**
```typescript
seed: tier25cResponse.data?.seed || tier25cResponse.data?.imageGeneration?.seed || null
```

**Direct Mode:**
```typescript
seed: directModeResponse.data?.seed || directModeResponse.data?.runwareDebugData?.seed || null
```

#### 1.4 ai-visual-scene-creator (supabase/functions/ai-visual-scene-creator/index.ts)
**Line 1332-1340**: Extract seed from template-cd response
```typescript
returnedSeed = result.seed || result.imageGeneration?.seed || null; // ✅ Extract seed
```

**Line 1387-1392**: Include seed in response when Direct Mode generates image
```typescript
...(directMode && returnedSeed && { seed: returnedSeed })
```

### Phase 2: Frontend Seed Logging & Validation

#### 2.1 SimpleImageService (src/services/SimpleImageService.ts)
**Lines 449-461, 646-657**: Enhanced seed logging with prominent warnings

**Template path:**
```typescript
if (!existingSeed && templateResult.data?.seed) {
  OptimizedImageCache.setStorySeed(normalizedSessionId, templateResult.data.seed);
  DebugLogger.log('image', '🌱 SEED STORED from template', { 
    sessionId: normalizedSessionId, 
    seed: templateResult.data.seed 
  });
} else if (!templateResult.data?.seed) {
  DebugLogger.warn('image', '⚠️ NO SEED RETURNED from template', { 
    sessionId: normalizedSessionId,
    response: templateResult.data 
  });
}
```

**Orchestrator path:**
```typescript
if (!existingSeed && orchResult?.seed) {
  OptimizedImageCache.setStorySeed(normalizedSessionId, orchResult.seed);
  DebugLogger.log('image', '🌱 SEED STORED from orchestrator', { 
    sessionId: normalizedSessionId, 
    seed: orchResult.seed 
  });
} else if (!orchResult?.seed) {
  DebugLogger.warn('image', '⚠️ NO SEED RETURNED from orchestrator', { 
    sessionId: normalizedSessionId,
    tier: orchResult?.tier,
    response: orchResult 
  });
}
```

#### 2.2 OptimizedImageCache (src/services/OptimizedImageCache.ts)
**Lines 109-141**: Added `validateSeedConsistency` method
```typescript
/**
 * Validate seed consistency - warn about mismatches
 */
static validateSeedConsistency(sessionId: string, newSeed: number): boolean {
  const existingSeed = this.storySeedCache.get(sessionId);
  if (existingSeed && existingSeed !== newSeed) {
    DebugLogger.warn('image', '⚠️ SEED MISMATCH DETECTED', {
      sessionId,
      existingSeed,
      newSeed,
      impact: 'Character appearance may change'
    });
    return false;
  }
  return true;
}
```

### Phase 3: Session ID Stability (Both Guest & Premium)

#### 3.1 CleanStoryDisplay (src/components/CleanStoryDisplay.tsx)

**Line 2730**: Fixed batch generation to use `stableSessionId`
```typescript
const sessionId = stableSessionId; // ✅ CRITICAL FIX: Use stableSessionId for batch generation
```

**Line 2506-2515**: Fixed current page cache lookup
```typescript
cachedImageUrl = EnhancedImageCache.getCachedImage(
  pageText.slice(0, 120),
  stableSessionId, // ✅ CRITICAL FIX: Use stableSessionId for cache consistency
  currentPage,
  storyId,
  storyMarkers
);
```

**Line 2712-2718**: Fixed batch cache lookup
```typescript
const cachedImageUrl = EnhancedImageCache.getCachedImage(
  storyText.slice(0, 120),
  stableSessionId, // ✅ CRITICAL FIX: Use stableSessionId for cache consistency
  index,
  storyId,
  storyMarkers
);
```

## Impact & Benefits

### Character Continuity
- ✅ Seeds now propagated from all tiers (2.5A, 2.5B, 2.5C, Direct Mode)
- ✅ Frontend can store and reuse seeds for visual consistency
- ✅ Same seed = same character appearance across pages

### Session ID Consistency
- ✅ Single `stableSessionId` used for all operations (generation + caching)
- ✅ Works for both guest and premium users
- ✅ Batch-generated images share same session context

### Debugging & Monitoring
- ✅ Prominent logging: `🌱 SEED STORED` vs `⚠️ NO SEED RETURNED`
- ✅ Seed mismatch warnings when character changes detected
- ✅ Enhanced visibility into seed flow across entire stack

## Testing Checklist

- [ ] Guest users: Verify character consistency across 6-page story
- [ ] Premium users: Verify character consistency in live generation
- [ ] Batch generation: Check all images use same session ID
- [ ] Cache hits: Verify cached images load with correct session context
- [ ] Seed logging: Confirm warnings appear when seeds missing
- [ ] Navigation: Test backward/forward navigation preserves character

## Files Modified

### Backend (7 changes)
1. `supabase/functions/runware-template-cd/index.js` (1 change)
2. `supabase/functions/runware-template-ab/index.ts` (4 changes)
3. `supabase/functions/runware-generate-image/index.ts` (5 changes)
4. `supabase/functions/ai-visual-scene-creator/index.ts` (2 changes)

### Frontend (4 changes)
5. `src/services/SimpleImageService.ts` (2 changes)
6. `src/services/OptimizedImageCache.ts` (1 change)
7. `src/components/CleanStoryDisplay.tsx` (3 changes)

**Total Changes:** 18 targeted fixes across 7 files
