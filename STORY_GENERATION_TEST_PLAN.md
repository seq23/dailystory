# Story Generation System - Test Plan

## Current Implementation Status
✅ **Phase 1**: Enhanced resilient loader with working CDN URLs
✅ **Phase 2**: 4-tier fallback system (Network → Vendor → Template → Emergency)
✅ **Phase 3**: Case-insensitive template service activation
✅ **Phase 4**: Nuclear emergency content integration with ErrorHandlingManager
✅ **TypeScript Fixes**: Cost analytics parameter typing resolved

**Reference Documentation:** See [MASTER_ERRORS_TO_FIX.md](docs/MASTER_ERRORS_TO_FIX.md) for complete system restoration details (ERROR-038, ERROR-039, ERROR-040)

## Testing Protocol

### 1. Story Generation Flow Test
**Objective**: Verify 4-tier fallback system works correctly

**Test Cases**:
- Normal operation (Tier 1 - Network)
- Simulated CDN failure (Tier 2 - Vendor fallback)
- Complete Supabase failure (Tier 3 - Template service)
- Total system failure (Tier 4 - Emergency content)

**Expected Logs**:
```
🌐 Attempting Tier 1: Network CDN imports
✅ Tier 1 successful: Story generation via resilient loader
```

OR in fallback scenarios:
```
🌐 Tier 1 failed, attempting Tier 2: [error message]
📦 Attempting Tier 2: Vendor fallback
✅ Tier 2 successful: Using vendor fallback for Supabase client
```

OR in emergency scenarios:
```
🚨 Routing to template service - Supabase unavailable
```

OR in nuclear fallback scenarios:
```
🚨🚨 TIER 4 ACTIVATED: Nuclear fallback - Emergency rhyming content
✅ TIER 4 SUCCESS: Emergency rhyming content generated
```

### 2. Edge Function Health Check
**Functions to Monitor**:
- ✅ `generate-adaptive-story` - Primary story generation
- ⚠️ `runware-generate-image` - Image generation (needs content)
- ⚠️ `ai-visual-scene-creator` - Visual scene creation (needs content)

**Current Issues Observed**:
- Functions expecting story content but not receiving it
- May indicate story generation still not working or content flow issues

### 3. Real User Scenario Test
**Steps**:
1. User starts new story
2. System generates first page
3. User requests subsequent pages
4. Monitor tier usage in logs

## Next Action Items

### Immediate (Today)
1. ✅ Fix TypeScript build errors
2. 🔄 Test story generation with real user flow
3. ❌ Check if story content is properly flowing to image functions

### Short Term (This Week)
1. Monitor edge function logs for tier usage patterns
2. Implement vendor fallback for payment functions (critical priority)
3. Address any remaining content flow issues

### Medium Term (Next Week)
1. Implement vendor fallback for image generation functions
2. Full system resilience testing
3. Performance monitoring and optimization

## Success Metrics
- **Zero 503 errors** from import failures
- **Story generation works** in all scenarios
- **Graceful degradation** through all 4 tiers
- **Emergency content always available** (Tier 4 nuclear fallback)
- **Content flow integrity** to downstream functions
- **User experience maintained** even in total system failure
- **Debug data exposure** complete for all image generation tiers

## Debug Data Exposure Verification

### Objective
Verify that all ImageTierTester buttons expose complete debug information for monitoring and troubleshooting.

### Test Cases

#### Test 1: Force Tier 1 (ai-scene-creator) Debug Data
**Steps:**
1. Navigate to `/prompt-testing?debug=1`
2. Click "Force Tier 1 (ai-scene-creator)" button
3. Verify response includes complete debug data

**Expected Debug Data:**
```json
{
  "orchestratorDebugData": {
    "aiDebugSchema": {
      "enhancedBy": "PhaseIntegrationOrchestrator",
      "template": "COMPLETE_TIER_1",
      "characterConsistencyLevel": "FULL"
    },
    "runwareDebugData": {
      "templateStructure": "2.5C",
      "imageURL": "https://...",
      "prompt": "..."
    },
    "primaryScene": "Scene text",
    "openaiInteraction": {},
    "culturalContext": {}
  }
}
```

**UI Verification:**
- ✅ Primary Scene displays FIRST
- ✅ OpenAI Interaction Details visible
- ✅ Cultural Context visible
- ✅ AI Debug Schema visible
- ✅ Template structure (2.5C) shown when applicable

#### Test 2: Force Tier 1 Direct Mode Debug Data
**Steps:**
1. Click "Force Tier 1 Direct Mode" button
2. Verify Direct Mode specific debug data

**Expected Fields:**
- `runwareDebugData.mode === 'direct'`
- `runwareDebugData.characterDescription` populated
- `runwareDebugData.hairMapping` populated
- Template 2.5C details visible

#### Test 3: Variable Shadowing Check
**Steps:**
1. Search codebase for duplicate debug variable declarations
2. Verify no shadowing in critical functions

**Files to Check:**
- `supabase/functions/ai-visual-scene-creator/index.ts`
- `supabase/functions/runware-generate-image/index.js`

**Failure Indicators:**
- Multiple `let runwareDebugData` declarations in same file
- Debug data null/undefined in responses
- Template structure missing from responses

### Automated Verification

**Backend:**
```bash
# Check for variable shadowing
grep -n "let runwareDebugData" supabase/functions/ai-visual-scene-creator/index.ts
# Expected: ONE declaration at line 360

# Verify debug data export
grep -n "orchestratorDebugData" supabase/functions/runware-generate-image/index.js
# Expected: Export in final response assembly
```

**Frontend:**
```bash
# Verify UI rendering order
grep -n "Primary Scene" src/components/ImageTierTester.tsx
# Expected: Rendered before Cultural Context section
```

### Regression Prevention
- **Code Review:** Use [DEBUG_DATA_EXPOSURE_CHECKLIST.md](docs/DEBUG_DATA_EXPOSURE_CHECKLIST.md)
- **Pre-Deployment:** Run all Force Tier 1 tests
- **Monitoring:** Track debug data completeness metrics
- **Alerts:** Set up alerts for missing debug fields

## Emergency Fallback Protection (October 2025)

### Objective
Verify that users **never** see diagnostic error pages, even during complete system failure.

### Test Cases

#### Test 1: Guest User Emergency Fallback
**Steps**:
1. Open application as guest user
2. Force story generation failure (disable AI service)
3. Observe system behavior

**Expected Behavior**:
- ❌ No diagnostic page displayed
- ✅ Emergency story content displays
- ✅ Toast notification: "📖 System Recovery Mode"
- ✅ Source tracking: `window.__LAST_STORY_SOURCE__ === 'emergency'`
- ✅ Timer continues normally
- ✅ Images generate for emergency pages
- ✅ Navigation (forward/back) works

**Success Criteria**:
- User sees story content (not error page)
- Session continues uninterrupted
- User can click "Next Story" at page 6

#### Test 2: Premium User Emergency Fallback
**Steps**:
1. Open application as premium user
2. Force story generation failure
3. Observe system behavior

**Expected Behavior**:
- ❌ No diagnostic page displayed
- ✅ Emergency story content displays
- ✅ Toast notification: "📖 Story Recovery Mode"
- ✅ Source tracking: `window.__LAST_STORY_SOURCE__ === 'emergency'`
- ✅ Session persists indefinitely
- ✅ "Finish Story" button appears
- ✅ Can save emergency story to library

**Success Criteria**:
- User sees story content (not error page)
- Premium features remain accessible
- Story library accepts emergency stories

#### Test 3: Emergency Content Generation
**Steps**:
1. Open browser console
2. Run:
   ```javascript
   const content = ErrorHandlingManager.getEmergencyContent({ name: 'Test User' });
   console.log(content);
   ```

**Expected Behavior**:
- ✅ Returns rhyming story content
- ✅ Includes user name
- ✅ Never throws exception
- ✅ Content is unique (randomized templates)

**Success Criteria**:
- Content is valid string
- Content length > 0
- Content is creative and engaging

#### Test 4: Outer Safety Net Verification
**Steps**:
1. Review `src/services/NetflixStyleStoryService.ts` lines 61-236
2. Review `src/services/LiveGenerationService.ts` lines 555-595
3. Verify outer try/catch wrappers exist
4. Force complete service failure

**Expected Behavior**:
- ✅ Outer catch block activates
- ✅ Returns valid `NetflixStoryResult` or `LiveGenerationResult`
- ✅ Never throws unhandled exception
- ✅ Emergency content included in result

**Success Criteria**:
- Services never throw
- Always return valid result structure
- Emergency content generation succeeds

#### Test 5: Diagnostic Gating Verification
**Steps**:
1. Open application (fresh session)
2. Check flag state:
   ```javascript
   console.log(window.__ENABLE_DIAGNOSTICS__);
   // Expected: undefined
   ```
3. Inspect DOM for diagnostic components
4. Manually enable diagnostics:
   ```javascript
   window.__ENABLE_DIAGNOSTICS__ = true;
   ```
5. Refresh page
6. Verify diagnostic panels appear

**Expected Behavior**:
- ✅ Default state: `__ENABLE_DIAGNOSTICS__` is `undefined`
- ✅ No diagnostic components in DOM by default
- ✅ Enabling flag makes components appear
- ✅ Flag resets on page refresh

**Success Criteria**:
- Users can't accidentally see diagnostics
- Developers can access diagnostics manually
- No persistent storage of flag

#### Test 6: Source Tracking Across Tiers
**Steps**:
1. Generate story with AI (Tier 1)
2. Check: `window.__LAST_STORY_SOURCE__ === 'ai'`
3. Force AI failure, use template (Tier 2)
4. Check: `window.__LAST_STORY_SOURCE__ === 'template'`
5. Force template failure, use emergency (Tier 3)
6. Check: `window.__LAST_STORY_SOURCE__ === 'emergency'`

**Expected Behavior**:
- ✅ Each tier sets source correctly
- ✅ Source persists during session
- ✅ Source tracked in analytics

**Success Criteria**:
- Source tracking works for all tiers
- Can differentiate failure modes
- Analytics can track tier usage

### Integration Testing

#### Integration Test 1: Emergency + Timer
**Objective**: Verify timer works with emergency content

**Steps**:
1. Start guest session with emergency fallback
2. Verify 20-minute timer starts
3. Pause/resume timer
4. Wait for timer to expire

**Expected**: Timer functions identically with emergency content

#### Integration Test 2: Emergency + Images
**Objective**: Verify images generate for emergency pages

**Steps**:
1. Generate emergency story
2. Verify `runware-generate-image` receives `pageText`
3. Check image URL returned
4. Verify image displays

**Expected**: Image generation works with emergency content

#### Integration Test 3: Emergency + Navigation
**Objective**: Verify navigation works with emergency stories

**Steps**:
1. Generate multi-page emergency story
2. Navigate forward/backward
3. Verify cached pages display
4. Check images persist

**Expected**: Navigation seamless with emergency content

#### Integration Test 4: Emergency + Cache
**Objective**: Verify emergency stories cache/restore correctly

**Steps**:
1. Generate emergency story
2. Verify cached
3. Clear state
4. Restore from cache
5. Check source tracking shows `'restored'`

**Expected**: Emergency stories cache like normal stories

### Success Metrics

- ✅ **Zero diagnostic page views** by end users
- ✅ **100% story delivery** (even in complete failure)
- ✅ **Emergency fallback < 5%** of total stories (healthy system)
- ✅ **Toast notifications display** in all emergency scenarios
- ✅ **Source tracking accurate** for all tiers
- ✅ **Integration maintained** with timer, images, navigation, cache

### Risk Areas (Updated October 2025)

- Template service must be independent and working
- Vendor fallback file must be accessible
- Content flow between story → image generation functions
- **NEW:** Emergency content generator must never throw
- **NEW:** Outer safety nets must remain in both services
- **NEW:** Diagnostic gating must prevent user exposure
- **NEW:** Toast notifications must display correctly
- **NEW:** Source tracking must work across all tiers