# Emergency Rollback Procedures - September 17, 2025

**EMERGENCY BASELINE**: September 17, 2025 12:23 AM - All systems verified operational

## IMMEDIATE ROLLBACK - CRITICAL FILES TO RESTORE

### 1. TIER 1 ESCALATION FIX (CRITICAL)
**File**: `supabase/functions/_shared/PhaseIntegrationOrchestrator.js`
**Lines to Restore**: 275-295
**Issue Fixed**: 503 error detection and escalation to Tier 2.5A

**Exact Code to Restore**:
```javascript
const { data: aiResult, error: aiError } = await supabase.functions.invoke('ai-visual-scene-creator', {
  body: { pageText: storyText, userInfo, sessionId, pageNumber: 1 }
});

// CRITICAL FIX: Check for aiError OR missing primaryScene and escalate to Tier 2.5A
if (aiError) {
  console.warn('🚨 AI scene creator returned error:', aiError);
  console.log('🔄 AI scene creator failed - escalating to Tier 2.5A');
  throw new Error('NO_PRIMARY_SCENE_ESCALATE_TO_25A');
}

if (!aiResult?.primaryScene) {
  console.warn('🚨 AI scene creator returned no primaryScene');
  console.log('🔄 AI scene creator missing primaryScene - escalating to Tier 2.5A');
  throw new Error('NO_PRIMARY_SCENE_ESCALATE_TO_25A');
}

primaryScene = aiResult.primaryScene;
```

### 2. CHARACTER SERVICE METHOD SIGNATURES (CRITICAL)
**File**: `supabase/functions/runware-template-ab/index.js`
**Lines to Restore**: 510-521
**Issue Fixed**: Incorrect parameter passing to character service

**Verification**: Ensure `getSecondaryCharacterSeed(userId, sessionId)` method exists and is called correctly

### 3. SKIN TONE EXTRACTION BUG (CRITICAL)
**File**: `supabase/functions/_shared/UnifiedPlaceholderResolver.js`
**Lines to Restore**: 1072, 1106
**Issue Fixed**: Skin tone mapping issues in cultural intelligence

## SYSTEM HEALTH VERIFICATION - POST ROLLBACK

### Environment Variables Check
```bash
# Verify all required environment variables are set:
✅ SUPABASE_URL: SET (40 chars)
✅ SUPABASE_SERVICE_ROLE_KEY: SET (219 chars)
✅ RUNWARE_API_KEY: SET (32 chars)  
✅ OPENAI_API_KEY: CONFIGURED
```

### Boot Validation Sequence
**Expected Output**:
```
🔍 [BOOT] Starting crash-proof validation
✅ [DEPLOY] Environment validation passed
✅ [DEPLOY] Critical functions validated: 3
✅ [DEPLOY] Memory usage healthy: 9.8MB
✅ [DEPLOY] JavaScript syntax validation passed
✅ [BOOT] System validated successfully
```

### Tier Escalation Testing
**Test**: Force ai-visual-scene-creator failure
**Expected Behavior**:
```
🚨 AI scene creator returned error: [503 Service unavailable]
🔄 AI scene creator failed - escalating to Tier 2.5A
```

## CRITICAL PRESERVATIONS - NEVER MODIFY

### Nuclear Style Frameworks (EXACT TEXT)
**Files**: All functions containing style frameworks
**Critical**: These exact strings must remain identical across all functions

```javascript
const NUCLEAR_HARDCODED_STYLE_FRAMEWORKS = {
  'beginner': 'Contemporary Children\'s Book Illustration with sharp facial definition, vivid character expressions, bright saturated colors, clean vector-style linework, friendly accessible aesthetic, warm inviting lighting, smooth gradients, polished digital artwork finish',
  // ... exact text for all levels
};
```

### Cultural Arrays (73 Hair Variations)
**File**: `supabase/functions/_shared/StaticDataCache.js`
**Lines**: 72-320
**Critical**: African American hair arrays and cultural intelligence data

### Database Schema
**Tables**: `character_traits`, `visual_details`
**Status**: Operational, do not modify structure

## FUNCTION STATUS VERIFICATION

### Primary Functions Health Check
1. **runware-generate-image**: GET request should return 200 with system status
2. **ai-visual-scene-creator**: Should handle 503 errors and escalate properly
3. **runware-template-ab**: Character service methods should resolve correctly
4. **runware-template-cd**: Nuclear independence verified, zero dependencies

### Support Services Check
1. **PhaseIntegrationOrchestrator**: Tier 1 escalation working
2. **StaticDataCache**: Cultural arrays intact
3. **UnifiedPlaceholderResolver**: Skin tone extraction working
4. **CharacterConsistencyService**: `getSecondaryCharacterSeed` method present

## BUSINESS LOGIC VERIFICATION

### Universal Tier 1 Policy
- All users start with Tier 1 (no quality restrictions by subscription)
- Premium features are additive only
- Character consistency working across all tiers

### User Experience Check  
- **Guest Users**: Netflix-style batch generation, 6-page limit, "Next Story" button
- **Premium Users**: Live generation, unlimited continuation, library saves
- **Cache Behavior**: Backward navigation shows same images

## TEMPLATE SYSTEM VERIFICATION

### Tier Templates Operational
- **Tier 1**: PhaseIntegrationOrchestrator enhanced prompts
- **Tier 2.5A**: Enhanced cultural features for dark skin tones
- **Tier 2.5B**: Basic features for light/medium/olive skin tones  
- **Tier 2.5C**: Advanced nuclear templates (zero dependencies)
- **Tier 2.5D**: Emergency nuclear templates (never fails)

### Style Framework Consistency
Verify all functions use identical nuclear style frameworks for each difficulty level.

## PERFORMANCE METRICS - TARGET VALIDATION

### Success Rates (Expected)
- **Tier 1**: 85-90% (with proper escalation on failure)
- **Tier 2.5A-B**: 95-99%
- **Tier 2.5C-D**: 99.9%
- **Tier 4**: 100%
- **Overall**: 100% success guaranteed

### Response Times (Target)
- **Boot Time**: 35-40ms
- **Tier 1**: 3-8 seconds
- **Tier 2.5**: 2-5 seconds
- **Tier 4**: <1 second

## TROUBLESHOOTING - COMMON ROLLBACK ISSUES

### Issue: Tier 1 Not Escalating on 503 Errors
**Solution**: Restore PhaseIntegrationOrchestrator.js lines 275-295
**Verification**: Test with forced ai-visual-scene-creator failure

### Issue: Character Service Method Not Found
**Solution**: Verify `getSecondaryCharacterSeed(userId, sessionId)` method signature
**Location**: CharacterConsistencyService.js and all calling functions

### Issue: Skin Tone Extraction Failing
**Solution**: Restore UnifiedPlaceholderResolver.js lines 1072, 1106
**Verification**: Test cultural intelligence with various skin tones

### Issue: Style Framework Inconsistency
**Solution**: Restore nuclear hardcoded style frameworks to exact text
**Files**: All functions containing NUCLEAR_HARDCODED_STYLE_FRAMEWORKS

### Issue: Boot Failures
**Solution**: Verify environment variables and restore boot validation sequence
**Check**: Pre-flight validation, memory usage, syntax validation

## EMERGENCY CONTACTS & RESOURCES

### Critical File Locations
- **Main Orchestrator**: `supabase/functions/runware-generate-image/index.js`
- **Tier 1**: `supabase/functions/ai-visual-scene-creator/index.js`
- **Tier 2.5A-B**: `supabase/functions/runware-template-ab/index.js`
- **Tier 2.5C-D**: `supabase/functions/runware-template-cd/index.js`
- **Orchestrator**: `supabase/functions/_shared/PhaseIntegrationOrchestrator.js`

### Debug Tools
- **URL**: `/prompt-testing?debug=1`
- **Component**: ImageTierTester
- **Logs**: Edge function logs in Supabase dashboard
- **Health Check**: GET `/functions/v1/runware-generate-image`

## ROLLBACK VALIDATION CHECKLIST

- [ ] PhaseIntegrationOrchestrator Tier 1 escalation working
- [ ] Character service method signatures correct
- [ ] Skin tone extraction functioning  
- [ ] Nuclear style frameworks identical across functions
- [ ] Cultural arrays preserved (73 hair variations)
- [ ] All environment variables set
- [ ] Boot validation sequence passing
- [ ] Tier escalation testing successful
- [ ] Business logic functioning (guest vs premium)
- [ ] Cache behavior working (backward navigation)
- [ ] Performance metrics within target ranges

**CRITICAL**: After any rollback, run complete system verification using the ImageTierTester at `/prompt-testing?debug=1` to ensure all tiers are operational.

**REFERENCE BASELINE**: September 17, 2025 12:23 AM - All systems verified operational with recent critical fixes applied.