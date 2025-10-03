# Tier 1 Import Resolution Verification (2025-10-03)

## Deployment Timestamp
**DEPLOY_MARKER**: 2025-10-03T18:50:00Z

## Changes Implemented

### 1. Orchestrator Function (`runware-generate-image`)
**File**: `supabase/functions/runware-generate-image/index.ts`

#### CCS Import Hardening (Lines 265-283)
```typescript
// Tier 1: Try _shared import (bundled)
let service;
try {
  const sharedModule = await import("../_shared/CharacterConsistencyService.js");
  service = sharedModule.characterConsistencyService;
  console.log(`✅ [CCS_IMPORT] _shared loaded successfully`);
} catch (sharedError) {
  // Tier 2: Vendor fallback for production reliability
  console.warn(`⚠️ [CCS_IMPORT] _shared import failed, trying _vendor:`, sharedError);
  try {
    const vendorModule = await import("../_vendor/CharacterConsistencyService.mjs");
    service = vendorModule.characterConsistencyService;
    console.log(`✅ [CCS_IMPORT] _vendor loaded successfully`);
  } catch (vendorError) {
    console.error(`❌ [CCS_IMPORT] both _shared and _vendor paths failed`, { sharedError, vendorError });
    throw new Error(`CCS_IMPORT_FAILURE: both paths failed`);
  }
}
```

**Expected Logs**:
- Success (shared): `✅ [CCS_IMPORT] _shared loaded successfully`
- Success (vendor): `✅ [CCS_IMPORT] _vendor loaded successfully`
- Failure: `❌ [CCS_IMPORT] both _shared and _vendor paths failed`

#### Direct Mode Timeout Increase (Lines 1469-1525)
- **Before**: 15000ms (15s)
- **After**: 20000ms (20s)
- **Reason**: Temporary increase to distinguish CCS import failures from legitimate Direct Mode timeouts
- **Error Message**: Updated from `"Direct Mode timeout (15s)"` to `"Direct Mode timeout (20s)"`

### 2. Direct Mode Function (`ai-visual-scene-creator`)
**File**: `supabase/functions/ai-visual-scene-creator/index.ts`

#### CCS Import #1: getStructuredAvatarData (Lines 51-70)
```typescript
try {
  // Try _shared import first
  let ccsModule;
  try {
    ccsModule = await import('../_shared/CharacterConsistencyService.js');
    console.log(`✅ [CCS_IMPORT_DM] _shared loaded`);
  } catch (sharedError) {
    console.warn(`⚠️ [CCS_IMPORT_DM] _shared failed, trying _vendor:`, sharedError);
    ccsModule = await import('../_vendor/CharacterConsistencyService.mjs');
    console.log(`✅ [CCS_IMPORT_DM] _vendor loaded`);
  }
  
  const { characterConsistencyService } = ccsModule;
  structuredAvatarData = await characterConsistencyService.getStructuredAvatarData(sessionId, userInfo);
```

**Expected Logs**:
- Success (shared): `✅ [CCS_IMPORT_DM] _shared loaded`
- Success (vendor): `✅ [CCS_IMPORT_DM] _vendor loaded`

#### CCS Import #2: getSecondaryCharactersForSession (Lines 313-341)
```typescript
try {
  // Try _shared import first, fallback to _vendor
  let ccsModule;
  try {
    ccsModule = await import('../_shared/CharacterConsistencyService.js');
    console.log(`✅ [CCS_IMPORT_DM] _shared loaded for secondary characters`);
  } catch (sharedError) {
    console.warn(`⚠️ [CCS_IMPORT_DM] _shared failed, trying _vendor:`, sharedError);
    ccsModule = await import('../_vendor/CharacterConsistencyService.mjs');
    console.log(`✅ [CCS_IMPORT_DM] _vendor loaded for secondary characters`);
  }
```

**Expected Logs**:
- Success (shared): `✅ [CCS_IMPORT_DM] _shared loaded for secondary characters`
- Success (vendor): `✅ [CCS_IMPORT_DM] _vendor loaded for secondary characters`

### 3. Bundler Configuration
**File**: `supabase/config.toml`

Added `import_map` for `ai-visual-scene-creator`:
```toml
[functions.ai-visual-scene-creator]
verify_jwt = false
import_map = "./deno.jsonc"
```

**Existing Configuration**:
```toml
[functions.runware-generate-image]
verify_jwt = false
import_map = "./deno.jsonc"
```

**Bundler Config** (`supabase/functions/deno.jsonc`):
```jsonc
{
  "compilerOptions": {
    "lib": ["deno.worker"],
    "strict": true
  },
  "include": [
    "**/*.ts",
    "**/*.js",
    "_shared/**/*.ts",
    "_shared/**/*.js",
    "_vendor/**/*.ts",
    "_vendor/**/*.js",
    "_vendor/**/*.mjs"
  ]
}
```

## Verification Test Plan

### Test A: Tier 1 Success (CCS Import Verification)
**Payload**: Standard test from `/prompt-testing?debug=1`
```json
{
  "storyText": "Emma walked through the magical forest where the golden sunlight danced between the emerald leaves. She wore her favorite blue dress and carried a small brown backpack filled with adventure supplies.",
  "userInfo": {
    "name": "Emma",
    "avatar": { "skinTone": "medium" }
  },
  "sessionId": "test-session",
  "pageNumber": 1,
  "isGuestUser": false
}
```

**Expected Logs**:
1. `[TIER_1] Attempting CharacterConsistencyService import with resilient pattern`
2. **CRITICAL**: One of these:
   - `✅ [CCS_IMPORT] _shared loaded successfully` (if bundling works)
   - `✅ [CCS_IMPORT] _vendor loaded successfully` (if vendor fallback used)
3. `🔍 [TIER_1] CCS Import: SUCCESS`
4. Image generation success via Tier 1

**Success Criteria**:
- ✅ Tier 1 completes successfully
- ✅ CCS import logs appear with explicit path indication
- ✅ Image URL returned

### Test B: Direct Mode Success (Force Tier 1 Failure)
**Payload**: Use `forceCompleteTier1=false` or simulate CCS method failure
```json
{
  "forceCompleteTier1": false,
  "storyText": "...",
  "userInfo": { ... }
}
```

**Expected Cascade**:
1. Tier 1 fails (CCS method failure or forced)
2. Escalates to Direct Mode
3. **CRITICAL**: Direct Mode logs show:
   - `✅ [CCS_IMPORT_DM] _shared loaded` OR
   - `✅ [CCS_IMPORT_DM] _vendor loaded`
4. Direct Mode returns primaryScene → Tier 2.5B generates image

**Success Criteria**:
- ✅ Direct Mode completes within 20s
- ✅ CCS import logs appear in Direct Mode
- ✅ Cascade proceeds to Tier 2.5B

### Test C: Complete Cascade (Simulate Failures)
**Test Mode Only**: Force Direct Mode timeout to test 2.5B → 2.5C → 2.5D cascade
```json
{
  "test_force_direct_timeout": true
}
```

**Expected Cascade History**:
```json
{
  "cascadeHistory": [
    "Tier 1: RUNTIME_ERROR - CHARACTERSERVICE_UNAVAILABLE_TRY_DIRECT_MODE",
    "Direct Mode: timeout (20s)",
    "Tier 2.5B: HANDLER_UNAVAILABLE",
    "Tier 2.5C: SUCCESS"
  ]
}
```

**Success Criteria**:
- ✅ No unhandled errors
- ✅ Cascade completes with image URL
- ✅ All tier attempts logged correctly

## Expected Edge Function Logs

### Orchestrator (runware-generate-image)
```
🎨 INLINED TIER 1: Processing for Emma in session test-session
[TIER_1] Attempting CharacterConsistencyService import with resilient pattern
✅ [CCS_IMPORT] _shared loaded successfully
🔍 [test-session] [TIER_1] CCS Method Availability Check: { getStructuredAvatarData: "function", ... }
🔍 [test-session] [TIER_1] CCS Import: SUCCESS
```

### Direct Mode (ai-visual-scene-creator)
```
✅ [CCS_IMPORT_DM] _shared loaded
✅ Generated complete structuredAvatarData via CharacterConsistencyService: {...}
✅ [CCS_IMPORT_DM] _shared loaded for secondary characters
✅ [CDN_IMPORT_SUCCESS] Retrieved 0 cached secondary characters for session test-session
```

## Rollback Plan
If vendor fallback does not work:

1. **Immediate**: Revert `supabase/config.toml` to remove `import_map` from `ai-visual-scene-creator`
2. **Short-term**: Revert CCS import changes in both functions
3. **Alternative**: Keep Direct Mode as pure static fallback (no CCS dependency)

## Success Metrics

### Primary Goal
- ✅ Tier 1 achieves >95% success rate with CCS vendor fallback
- ✅ No `Module not found` errors for `CharacterConsistencyService.js`

### Secondary Goals
- ✅ Direct Mode logs show which import path was used (shared vs vendor)
- ✅ Cascade history shows accurate tier progression
- ✅ No false escalations to Tier 2.5C due to import failures

## Related Documentation
- [TIER_1_IMPORT_FAILURE_POSTMORTEM.md](./TIER_1_IMPORT_FAILURE_POSTMORTEM.md) - Original issue analysis
- [WHY_SHARED_IMPORTS_DONT_WORK.md](./WHY_SHARED_IMPORTS_DONT_WORK.md) - Import anti-patterns
- [CCS_RUNTIME_VERIFICATION_2025-10-02.md](./CCS_RUNTIME_VERIFICATION_2025-10-02.md) - CCS integration verification

## Next Steps
1. Deploy and monitor edge function logs for 3 test runs
2. Verify explicit CCS import logs appear
3. Confirm vendor fallback triggers when shared import fails
4. Document final success metrics
5. Update related docs with verification results
