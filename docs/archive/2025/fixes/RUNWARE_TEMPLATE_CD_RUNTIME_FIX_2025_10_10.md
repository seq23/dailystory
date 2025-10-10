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

## Related
- `runware-generate-image` already has correct `hasPrimaryScene` validation (lines 576-580)
- This fix brings `runware-template-cd` into alignment with orchestrator validation patterns
