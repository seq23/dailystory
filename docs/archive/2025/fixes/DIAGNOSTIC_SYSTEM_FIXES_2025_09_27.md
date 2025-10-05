# Diagnostic System Fixes - September 27, 2025

## Problem Statement
Infrastructure testing results in `/prompt-testing?debug=1` were not reflecting reality due to inconsistent diagnostic data between UI components and edge functions.

## Issues Identified

### 1. Environment Information Mismatch
- **Problem**: `ApiKeyDiagnostic` expected `runware-generate-image` GET endpoint to return environment info
- **Reality**: GET endpoint only returned basic health status (`{ status: 'healthy', service: '...', timestamp: '...' }`)
- **Result**: UI showed "Missing" for all API keys even when they were present

### 2. Two Diagnostic Systems
- `InfrastructureDiagnostic` (calls `runware-generate-image` GET)
- `ApiKeyDiagnostic` (expected environment data from `runware-generate-image` GET)
- `system-diagnostics` function (has proper API key checking but wasn't connected to UI)

### 3. Error Handling Gaps
- No graceful fallback when environment data was missing
- UI showed hard errors instead of warnings for missing optional data

## Fixes Implemented

### 1. Enhanced `runware-generate-image` GET Endpoint
**File**: `supabase/functions/runware-generate-image/index.ts`

Added environment information to GET health check response:
```typescript
environment: {
  runwareApiKeyPresent: !!runwareApiKey,
  runwareKeyLength: runwareApiKey ? runwareApiKey.length : 0,
  openaiApiKeyPresent: !!openaiApiKey,
  openaiKeyLength: openaiApiKey ? openaiApiKey.length : 0,
  supabaseServiceRolePresent: !!supabaseServiceKey
}
```

### 2. Improved `ApiKeyDiagnostic` Error Handling
**File**: `src/components/ApiKeyDiagnostic.tsx`

- Added graceful handling when environment data is missing
- Implemented fallback to `system-diagnostics` function
- Changed hard errors to warnings for better UX
- Added proper error boundary for diagnostic failures

### 3. Diagnostic Response Standardization
- Both `runware-generate-image` and `system-diagnostics` now return consistent environment data structure
- Added fallback mechanisms when primary diagnostic source fails
- Improved error messages for better debugging

## Expected Results

After these fixes, infrastructure testing should show:
- ✅ RUNWARE_API_KEY: Present (64 chars) - if configured
- ✅ OPENAI_API_KEY: Present (48 chars) - if configured  
- ✅ SUPABASE_SERVICE_ROLE_KEY: Present - if configured
- ✅ Orchestrator is healthy
- ✅ AB Templates - healthy
- ✅ CD Templates - healthy
- ✅ AI Visual Scene Creator - healthy

## Technical Notes

### Environment Detection Logic
The system now checks environment variables in this priority:
1. Primary: `runware-generate-image` GET endpoint with enhanced response
2. Fallback: `system-diagnostics` function with detailed environment analysis
3. Graceful degradation: Warning messages when both fail

### API Key Length Reporting
For security, only reports:
- Presence (boolean)
- Length (number) - for validation without exposure
- No actual key values are ever transmitted

### Error Classification
- **Error** (🔴): Critical issues that prevent functionality
- **Warning** (🟡): Non-critical issues or missing optional components  
- **Success** (🟢): All systems operational

## Future Improvements

1. **Unified Diagnostic Service**: Consolidate `InfrastructureDiagnostic` and `ApiKeyDiagnostic` into single component
2. **Real-time Status**: Add WebSocket connection for live diagnostic updates
3. **Performance Monitoring**: Include latency and error rate metrics
4. **Health Check Automation**: Scheduled background health checks with alerting

## 2025-09-27 Updates: Architecture Cascade Test Fixes and Real Routing Implementation

### Additional Fixes (2025-09-27 16:20:00)

#### Problem: Fake Success in Architecture Cascade Tests
The "Debug Real Routing" and cascade tests were reporting misleading results:
- **Issue**: `runware-generate-image` was hardcoded to return `https://example.com/generated-image.jpg` (fake URL)
- **Impact**: Tests showed "tier 1 succeeded and no picture" when actually all tiers were failing
- **Root Cause**: Lines 300-307 in `runware-generate-image/index.ts` contained simulation code instead of real processing

#### Solution: Real Cascade Implementation
**Modified**: `supabase/functions/runware-generate-image/index.ts`
- Removed fake success simulation
- Implemented real Tier 1 → Direct Mode → Tier 2.5C cascade flow
- Added proper error handling with TypeScript types
- Returns SVG Tier 4 fallback when all tiers fail
- Added clear cascade failure reporting

#### Problem: AI Scene Creator Test Enhancement Text
The AI Scene Creator test was returning enhanced text instead of raw primaryScene:
- **Issue**: Used `applyUniversalProtections()` which appended "dignified representation, respectful cultural portrayal..."
- **Impact**: Could not see "word-for-word" AI generation output

#### Solution: Raw Story Text Input  
**Modified**: `src/components/ImageTierTester.tsx` `testAISceneCreator()`
- Changed from `pageText: enhancedPrompt` to `storyText: testStoryText` 
- Removed `protectionNegatives` dependency for this test
- Now shows pure AI-generated primaryScene output

#### Problem: Null Reference Error in categorizeError
Architecture cascade tests were failing with "Cannot read properties of null (reading 'name')":
- **Issue**: `categorizeError(error, ...)` called on success where `error` is null
- **Impact**: All cascade tests showed runtime errors instead of success/failure

#### Solution: Null-Safe Error Handling
**Modified**: `src/components/ImageTierTester.tsx`
- Added optional chaining: `(error as any)?.name === 'AbortError'`
- Only call `categorizeError()` when there's an actual error
- Success path now bypasses error categorization

#### Problem: Missing aiSchema in AI Scene Creator Response
The UI expected `aiSchema` object but the edge function only returned `primaryScene`:
- **Issue**: Missing structured schema data for UI display

#### Solution: Enhanced Response Structure
**Modified**: `supabase/functions/ai-visual-scene-creator/index.ts`
- Added `aiSchema` object to response containing primaryScene and basic fields
- Maintains backward compatibility with existing UI expectations

### Expected Results After Fixes:
- Architecture cascade tests show true success/failure states (not fake successes)
- Force Tier 1 test clearly reports: "Force Tier 1 failed, Direct Mode failed, escalated to Tier 2.5C"
- AI Scene Creator test shows raw AI output without protection enhancements  
- SVG Tier 4 fallback appears when all image generation tiers fail
- No more "Cannot read properties of null" errors in cascade tests

### Files Modified:
- `supabase/functions/runware-generate-image/index.ts` - Real cascade implementation
- `src/components/ImageTierTester.tsx` - Null-safe error handling and raw story text
- `supabase/functions/ai-visual-scene-creator/index.ts` - Enhanced response with aiSchema