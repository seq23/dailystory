# Runware Template CD Runtime Fix - 2025-10-10

## Issue
`runware-template-cd` was experiencing POST `RUNTIME_ERROR` (500 status) due to undefined variable references during request handling.

## Root Causes

### 1. Undefined `primaryScene` Variable (Lines 701-705)
**Problem:** The validation code checked `if (!storyText && !primaryScene)` but `primaryScene` was never defined in scope, causing `ReferenceError: primaryScene is not defined`.

**Fix:** Added proper extraction from payload:
```typescript
const hasPrimaryScene = typeof payload.primaryScene === 'string' && payload.primaryScene.trim().length > 0;
if (!storyText && !hasPrimaryScene) {
  console.warn(`⚠️ Missing storyText AND primaryScene - forcing Emergency Mode D`);
  templateComplexity = 'D';
}
```

### 2. Undefined `corsHeaders` Variable (Lines 882-887)
**Problem:** Gate-failure response used `...corsHeaders` spread operator, but `corsHeaders` was not defined in scope, causing `ReferenceError: corsHeaders is not defined`.

**Fix:** Replaced with proper CORS header generation:
```typescript
status: 503,
headers: { 
  ...generateEchoCorsHeaders(req), 
  'Content-Type': 'application/json',
  'Retry-After': String(gateResult.retryAfterSeconds ?? 5)
}
```

## Impact
- **Before:** POST requests caused 500 RUNTIME_ERROR, breaking Direct Mode Simple (2.5C) flows
- **After:** Proper validation of `primaryScene`-only payloads and correct 503 HEALTHY_ESCALATION responses with proper CORS headers

## Testing
Enhanced Connectivity tests should now show:
- GET /health → 200 HEALTHY ✅
- POST with primaryScene-only → 200 JSON success ✅
- POST with gate denial → 503 HEALTHY_ESCALATION with Retry-After ✅

### 3. Missing Direct Mode Simple Payload Handler (Lines 689-699)
**Problem:** When Direct Mode Simple (2.5C) sent `primaryScene`-only payloads (with `directMode: true`), none of the 4 extraction paths handled this format. The code fell through to the legacy `else` block, which didn't extract `primaryScene`, leaving `enhancedStoryData` undefined and causing crashes at line 710.

**Fix:** Added dedicated 5th extraction path for Direct Mode Simple:
```typescript
} else if (payload.primaryScene && payload.directMode) {
  console.log('🎯 Template CD: Direct Mode Simple format (primaryScene-only)');
  storyText = payload.primaryScene; // Use primaryScene as the story content
  enhancedStoryData = { userInfo: payload.userInfo || {} };
  pageNumber = payload.pageNumber || 1;
  avatarIdentity = payload.userInfo?.avatar;
  templateComplexity = 'C'; // Direct Mode always uses 2.5C
  sessionId = payload.sessionId;
  failedTierData = payload.failedTierData;
  seed = payload.seed;
}
```

## Related
- `runware-generate-image` already has correct `hasPrimaryScene` validation (lines 576-580)
- This fix brings `runware-template-cd` into alignment with orchestrator validation patterns
- Direct Mode Simple now fully supported with proper payload extraction
