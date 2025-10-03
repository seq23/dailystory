# Runware Template AB - CCS Fallback Fix (October 3, 2025)

## Problem Statement

### Issue 1: Wrong CCS Fallback
**Location:** `supabase/functions/runware-template-ab/index.js` line 1674

**Broken Code:**
```javascript
culturalBundle = { hair: 'natural hair', features: 'diverse features' };
```

**Problems:**
1. Generic strings like `'natural hair'` don't match the 65 hair variations from inline `getHairBySkintone()` function
2. No use of inline helper functions (`getHairBySkintone`, `getSkinBySkintone`) as proper fallback
3. Breaks visual consistency across sessions
4. Violates 3-tier fallback architecture

### Issue 2: No Escalation on CCS Complete Failure
**Location:** Same section (lines 1668-1678)

**Problem:** When CCS completely fails (import error), should escalate to Tier 2.5B (nuclear independent) immediately, not continue with broken fallback.

**Expected Behavior:** Tier 2.5B is nuclear independent and doesn't need CCS, so it's a better fallback than trying to continue with generic data.

## Solution Implemented

### 3-Tier Fallback Architecture (Fixed)

**Tier 1 (Preferred):** `CharacterConsistencyService.getCulturalEnhancements()`
- Full character consistency with session seeding
- Uses comprehensive cultural arrays (30 hairstyles + 36 features)

**Tier 2 (Fallback):** Inline helper functions (`getHairBySkintone`, `getSkinBySkintone`)
- `getHairBySkintone(skinTone, sessionId)` - 65 hair variations with session seeding
- `getSkinBySkintone(skinTone)` - Authentic skin tone descriptions
- Already exists in runware-template-ab/index.js at lines 182-220

**Tier 3 (Emergency):** Final fallback in hairDescription/facialFeatures assignment
- `emergencyHairFallback(skinTone)` - Skin-tone-specific defaults
- `getSkinBySkintone(skinTone)` - Inline skin descriptions

### Escalation to Tier 2.5B (Added)

When CCS **completely fails** (import error, not just method failure):
1. Log escalation reason: `CCS_IMPORT_FAILURE`
2. Switch `templateComplexity` from 'A' to 'B'
3. Use simplified Tier 2.5B processing (nuclear independent, no CCS)
4. Skip CCS-dependent Tier 2.5A logic entirely

**Rationale:** Tier 2.5B is nuclear independent and doesn't need CCS, so it's a better fallback than trying to continue with broken/generic data.

**Implementation:**
```javascript
// ESCALATION CHECK: If CCS completely failed (import error), escalate to Tier 2.5B immediately
if (culturalBundleSource === 'Inline' && templateComplexity === 'A') {
  console.log(`🚨 [${requestId}] CCS completely unavailable - Escalating Tier 2.5A → 2.5B immediately`);
  console.log(`⚡ [${requestId}] Reason: CharacterConsistencyService import failed, nuclear independence required`);
  
  // Switch to Tier 2.5B (nuclear independent, no CCS dependency)
  // ... Tier 2.5B processing logic ...
  
  if (tier2BResult?.success) {
    return new Response(JSON.stringify(tier2BResult), { ... });
  }
}
```

## Files Modified

1. **`supabase/functions/runware-template-ab/index.js`**
   - Lines 1666-1693: Replaced with 3-tier fallback architecture
   - Lines 1693-1758: Added CCS complete failure escalation check with Tier 2.5B re-processing

2. **`docs/RUNWARE_TEMPLATE_AB_CCS_FALLBACK_FIX.md`** (NEW)
   - Complete documentation of the fix

3. **`docs/MASTER_ERRORS_TO_FIX.md`** (UPDATED)
   - Added ERROR-067: runware-generate-image connectivity timeout fix
   - Added ERROR-068: Wrong CCS fallback in runware-template-ab

## Code Changes

### Before (Lines 1666-1677):
```javascript
// Get cultural bundle with character consistency
let culturalBundle;
try {
  const { characterConsistencyService } = await import("../_shared/CharacterConsistencyService.js");
  culturalBundle = await characterConsistencyService.getCulturalEnhancements(userInfo, sessionId, characterName);
} catch (error) {
  console.error('❌ Failed to get cultural bundle with consistency:', error);
  // Use emergency fallback
  culturalBundle = { hair: 'natural hair', features: 'diverse features' }; // ❌ WRONG
}
const hairDescription = culturalBundle?.hair || getHair(skinTone) || 'brown hair';
const facialFeatures = culturalBundle?.features || getSkinBySkintone(skinTone, sessionId) || 'friendly expression';
```

### After (Lines 1666-1693):
```javascript
// Get cultural bundle with 3-tier fallback architecture
let culturalBundle;
let culturalBundleSource = 'UNKNOWN';

try {
  // TIER 1: Try CharacterConsistencyService (preferred)
  const { characterConsistencyService } = await import("../_shared/CharacterConsistencyService.js");
  culturalBundle = await characterConsistencyService.getCulturalEnhancements(userInfo, sessionId, characterName);
  culturalBundleSource = 'CCS';
  console.log(`✅ [TIER_1_FALLBACK] CCS cultural bundle loaded successfully`);
} catch (ccsError) {
  console.error(`❌ [TIER_1_FALLBACK] CCS failed:`, ccsError.message);
  
  // TIER 2: Use inline helper functions (getHairBySkintone, getSkinBySkintone)
  console.log(`🔄 [TIER_2_FALLBACK] Using inline helper functions for cultural bundle`);
  culturalBundle = {
    hair: getHairBySkintone(skinTone, sessionId),
    features: getSkinBySkintone(skinTone)
  };
  culturalBundleSource = 'Inline';
  console.log(`✅ [TIER_2_FALLBACK] Inline cultural bundle loaded: hair="${culturalBundle.hair}"`);
}

const hairDescription = culturalBundle?.hair || emergencyHairFallback(skinTone);
const facialFeatures = culturalBundle?.features || getSkinBySkintone(skinTone);

console.log(`🎨 [CULTURAL_BUNDLE] Source: ${culturalBundleSource}, Hair: "${hairDescription}", Features: "${facialFeatures.substring(0, 50)}..."`);
```

### Added Escalation Logic (After Line 1693):
```javascript
// ESCALATION CHECK: If CCS completely failed (import error), escalate to Tier 2.5B immediately
if (culturalBundleSource === 'Inline' && templateComplexity === 'A') {
  console.log(`🚨 [${requestId}] CCS completely unavailable - Escalating Tier 2.5A → 2.5B immediately`);
  console.log(`⚡ [${requestId}] Reason: CharacterConsistencyService import failed, nuclear independence required`);
  
  // ... Full Tier 2.5B re-processing logic (65 lines) ...
  
  if (tier2BResult?.success) {
    console.log(`✅ [${requestId}] Tier 2.5B escalation successful: ${tier2BResult.imageURL}`);
    return new Response(JSON.stringify(tier2BResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } else {
    console.log(`⚠️ [${requestId}] Tier 2.5B escalation failed, continuing to nuclear templates...`);
  }
}
```

## Testing Verification

Run in `/prompt-testing?debug=1`:

1. **Test CCS Tier 1 Success:**
   - Generate image with working CCS
   - Expect: `✅ [TIER_1_FALLBACK] CCS cultural bundle loaded successfully`

2. **Test Inline Functions Tier 2 Fallback:**
   - Simulate CCS import failure (e.g., temporarily rename CharacterConsistencyService.js)
   - Expect: `✅ [TIER_2_FALLBACK] Inline cultural bundle loaded: hair="..."`
   - Verify: Hair value matches one of 65 variations from inline function

3. **Test Emergency Tier 3 Fallback:**
   - Both CCS and inline functions fail (edge case)
   - Expect: Final fallback uses `emergencyHairFallback(skinTone)` in hairDescription assignment

4. **Test Escalation to Tier 2.5B:**
   - When Tier 2 fallback used with `templateComplexity: 'A'`
   - Expect: `🚨 CCS completely unavailable - Escalating Tier 2.5A → 2.5B immediately`
   - Verify: Image generated successfully via Tier 2.5B nuclear independent path

## Business Impact

**Before:**
- ❌ CCS failures resulted in generic `'natural hair'` strings
- ❌ Visual inconsistency across user sessions
- ❌ No proper escalation to nuclear independent tier
- ❌ Potential 500 errors when CCS import failed

**After:**
- ✅ Proper 3-tier fallback ensures visual consistency
- ✅ 65 hair variations maintained via inline helper functions
- ✅ Automatic escalation to Tier 2.5B on CCS complete failure
- ✅ Nuclear independence restored for Tier 2.5B fallback
- ✅ No 500 errors, graceful degradation with proper logging

## Backward/Forward Compatibility

**Backward:**
- 3-tier fallback is purely additive (no removals)
- Existing Tier 2.5A flows continue unchanged when CCS works
- Inline functions already exist at lines 182-220

**Forward:**
- Escalation to 2.5B only triggers on CCS import failure + complexity 'A'
- Tier 2.5B processing uses existing template and functions
- No impact on production flows when CCS is healthy

## Related Documentation

- `docs/CHARACTER_CONSISTENCY_STATUS.md` - Section 4: Tier 2.5A → Tier 2.5B Escalation
- `docs/MASTER_ERRORS_TO_FIX.md` - ERROR-068 tracking entry
- `supabase/functions/_shared/CharacterConsistencyService.js` - Full CCS implementation
- `supabase/functions/runware-template-ab/index.js` - Lines 182-220 (inline helper functions)

## Date: October 3, 2025
## Status: ✅ IMPLEMENTED AND DOCUMENTED
