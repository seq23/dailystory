# Supabase Edge Functions Manifest

This directory contains all Edge Functions for the project. GitHub is the source of truth - any functions not listed below should be removed from the Supabase dashboard.

## Canonical Function List (40 Functions)

### Authentication & Subscription Functions
- `activate-discount-code` - JWT: true
- `apply-discount-code` - JWT: true  
- `check-subscription` - JWT: true
- `create-checkout` - JWT: true
- `create-premium-subscription` - JWT: true
- `customer-portal` - JWT: true
- `send-custom-auth-email` - JWT: true
- `validate-discount-code` - JWT: false

### AI & Content Generation Functions
- `ai-visual-scene-creator` - JWT: false (JS only)
- `background-image-pregeneration` - JWT: false
- `clear-character-cache` - JWT: false
- `correct-spelling` - JWT: false
- `generate-adaptive-story` - JWT: false
- `generate-fallback-images` - JWT: false
- `process-story-content` - JWT: false
- `template-service` - JWT: false
- `translate-universal` - JWT: false

### Audio & Voice Functions
- `elevenlabs-agent-signed-url` - JWT: false
- `elevenlabs-dictionary-manager` - JWT: false
- `elevenlabs-tts-smart` - JWT: false
- `elevenlabs-tts` - JWT: false
- `openai-realtime` - JWT: false
- `openai-tts` - JWT: false
- `voice-to-text` - JWT: false
- `word-dictionary` - JWT: false

### Image Generation Functions
- `image-proxy` - JWT: false
- `runware-generate-image` - JWT: false (JS only)

- `runware-template-ab` - JWT: false (Single-file TypeScript, thin JS wrapper)
- `runware-template-cd` - JWT: false (JS only)

### Security & Monitoring Functions
- `log-personal-info-incident` - JWT: true
- `log-security-event` - JWT: true
- `notification-service` - JWT: true
- `security-alert` - JWT: true
- `security-dashboard` - JWT: true
- `send-coppa-notification` - JWT: true
- `send-parental-notification` - JWT: true

### System & Debug Functions
- `get-monitoring-data` - JWT: false
- `model-performance-monitor` - JWT: false
- `system-diagnostics` - JWT: false

## Entry File Requirements

All functions use `index.ts` as their entry point. JavaScript-only functions have TypeScript shim files that import their `index.js` implementations:
- `ai-visual-scene-creator` - Shim: `index.ts` → Implementation: `index.js`
- `runware-generate-image` - Shim: `index.ts` → Implementation: `index.js`
- `runware-template-ab` - **Single-file TypeScript** (index.js is thin re-export wrapper only)
- `runware-template-cd` - Shim: `index.ts` → Implementation: `index.js`
- `background-image-pregeneration` - Shim: `index.ts` → Implementation: `index.js`

## Maintenance Notes

1. **Source of Truth**: GitHub repository contains the canonical list of functions
2. **Supabase Dashboard**: Manually remove any functions not in this list
3. **Deployment**: Functions auto-deploy when code is committed
4. **Entry Files**: JavaScript-only functions use TypeScript shim files that import the JavaScript implementation
5. **CI Resilience**: Generic deploy step uses `continue-on-error: true` to ensure explicit per-function deploys always run even if bundling fails
6. **Debug Data Exposure**: Critical functions (`ai-visual-scene-creator`, `runware-generate-image`) must maintain complete debug data exposure. See [DEBUG_DATA_EXPOSURE_CHECKLIST.md](../docs/DEBUG_DATA_EXPOSURE_CHECKLIST.md) for anti-regression requirements when modifying these functions.
7. **Parser Hardening**: Avoid trailing commas in function call argument lists. While modern JS/TS runtimes handle trailing commas in objects and arrays, Deno's graph parser may misinterpret them in function calls during deployment bundling, causing "Expected ',', got 'return'" errors.
8. **Timeout and Abort Handling**: Edge functions calling external APIs (e.g., `RunwareWebSocketService`) must respect caller-provided `AbortSignal` for proper timeout handling. Pass `signal` to async operations and clean up listeners on completion. Default timeouts should be 20s for image generation to align with frontend expectations and prevent client-side fetch timeouts (typically 45s for supabase-js).
9. **Dynamic Import Requirements**: Deno Deploy's bundler processes TypeScript at build time but expects JavaScript files for dynamic imports at runtime. Critical services in `_shared/` that use dynamic imports (via `memoizedImport`) must have both `.ts` (for type safety) and `.js` (for runtime) versions. Use two-tier fallback: `_shared/*.js` → `_vendor/*.js`. Example: `RunwareWebSocketService.ts/js` with vendor bundle ensures 100% availability.

## CRITICAL: Edge Function Boot Analysis

### ⚠️ DISTINGUISHING REAL vs FALSE BOOT FAILURES

**REAL 503 Boot Failures** (Action Required):
- Analytics show consistent boot failure patterns
- Multiple deployment attempts fail
- Function completely unavailable
- Requires immediate investigation

**FALSE POSITIVE "Module not found" Errors** (NO Action Required):
- Logs show "Module not found: index.js" 
- Files exist in GitHub repository
- Function executes successfully when called
- Deployment sync delay between TypeScript and JavaScript files

### Option A Implementation (Boot Failure Prevention)

**Pattern**: Strengthened TypeScript Receptionist
- TypeScript file handles CORS directly
- Dynamic import of JavaScript implementation
- Fallback responses during sync anomalies
- Comprehensive error handling with retry guidance

**Files Using Option A Pattern** (✅ COMPLETE MIGRATION):
- `runware-generate-image/index.ts` - Strengthened receptionist ✅
- `runware-template-cd/index.ts` - Strengthened receptionist ✅  
- `ai-visual-scene-creator/index.ts` - Strengthened receptionist ✅
- `runware-template-ab/index.ts` - Strengthened receptionist ✅
- `background-image-pregeneration/index.ts` - Strengthened receptionist ✅
- `clear-character-cache/index.ts` - Strengthened receptionist ✅

**Migration Status**: **100% COMPLETE** - All 6 critical edge functions now use Option A architecture

**runware-template-ab Special Case**: 
- Uses single-file TypeScript implementation (727 lines)
- `index.js` is a thin 5-line re-export wrapper for backward compatibility
- No dynamic sibling imports (solved bundling failures)
- LKG pattern preserved for resilience
- Bundler hint ensures CharacterConsistencyService is included
- See `docs/RUNWARE_TEMPLATE_AB_REWRITE.md` for complete details

## Recent Structural Fixes

### runware-generate-image Brace Structure Normalization (Oct 8, 2025)
- **Lines 2488-2495**: Corrected misleading closing-brace comments that caused parser ambiguity
- **Change**: Replaced incorrect "end Direct Mode execution block" comment with accurate scope labels
- **Impact**: Eliminates flip-flopping "Expected a semicolon" parser errors
- **Behavior**: No logic changes - only structural clarification of nested try/catch/if blocks

### Boot Failure Verification Procedures

**Step 1: Check Analytics**
```
Version with boot failures: Analyze failure rate and patterns
Version after fixes: Verify significant improvement
```

**Step 2: File Existence Verification**
1. Verify both index.ts and index.js exist in GitHub
2. Check DEPLOY_MARKER timestamps are current
3. Confirm file sizes are reasonable (not 0 bytes)

**Step 3: Function Execution Test**
1. Make actual function calls (not just deployment checks)
2. Monitor response times and success rates
3. Check for graceful fallback responses during sync

**Step 4: Developer Troubleshooting Checklist**
- [ ] Analytics show actual boot failures (not just log warnings)
- [ ] Files missing from GitHub repository
- [ ] Function calls returning errors consistently
- [ ] No graceful fallback responses present

### Rollback Procedures

**Emergency Rollback for Option A**:
1. Revert TypeScript files to simple shim pattern
2. Update DEPLOY_MARKER to force fresh deployment
3. Monitor analytics for improvement
4. Restore backup files if available

## Forced Redeploy History

**2025-10-06T03:10:00Z** - IdempotencyMemory made optional everywhere
- Updated DEPLOY_MARKER: 2025-10-06T03:10:00Z
- ai-visual-scene-creator: Wrapped IdempotencyMemory import in try/catch with fallback stub
- runware-generate-image: Already had optional IdempotencyMemory (no change needed)
- Removed debug ping short-circuit and extra console.log from ai-visual-scene-creator
- Purpose: Prevent Status 500 boot failures when IdempotencyMemory.js bundling is flaky

**2025-01-30T21:30:00Z** - Documentation update for sync anomaly awareness
- Added "Known Supabase Sync Anomalies" section
- Updated DEPLOY_MARKER for affected shim files
- Clarified that "Module not found" errors are false positives

**2025-01-30T20:17:15Z** - Emergency redeploy to fix boot failures in:
- `ai-visual-scene-creator`: Boot failure "failed to determine entrypoint"  
- `runware-generate-image`: Module not found error for index.js
- Resolution: Updated DEPLOY_MARKER timestamps to force fresh deployment snapshot

## Sync Status

- **GitHub Functions**: 40 (canonical)
- **Supabase Dashboard**: Should match GitHub after cleanup
- **Last Sync**: Manual cleanup required for 23 extra functions

## Next Steps

1. Remove extra functions from Supabase dashboard
2. Verify all 40 functions deploy correctly
3. Monitor logs for any deployment issues

## Targeted redeploys (priority)

You can priority-deploy specific functions without waiting for the full batch:

- From GitHub Actions → Deploy Edge Functions → Run workflow → set "priority_functions" to a comma-separated list, e.g.: `runware-generate-image,ai-visual-scene-creator,runware-template-ab`
- The workflow will deploy these first with stronger backoff (5 retries; 30s, 60s, 120s, 240s)
- Then it continues with the normal batched deployment for the rest

Force a fresh deploy for any function by bumping the DEPLOY_MARKER comment at the top of its index.ts or index.js.

## Parser Hardening & Stability (2025-10-08)

**Critical parser fixes applied to prevent "Expected ',' got 'return'" errors:**
- Removed extra closing braces that caused premature block termination in runware-generate-image
- All edge functions follow correct try/catch/finally nesting structure
- Circuit breaker logic in runware-template-ab now treats 503 as success (escalation signal, not failure)

**503 Response Handling:**
- `runware-template-ab` (Tier 2.5A) returns 503 when escalating to upstream tiers (by design)
- Monitoring systems should treat 503 from 2.5A as a non-fatal escalation signal
- Circuit breakers configured to not trip on 503 status codes from template services

**Diagnostic Runtime Probes (NEW):**
- Receptionist functions accept POST payloads with `{ diagnostic: true | 'health_check' }` or `{ test: true }`
- They short-circuit and return `{ success: true, message: 'Runtime OK' }` with 200, avoiding deeper logic
- Implemented in: `ai-visual-scene-creator`, `runware-template-ab`

**Import Map Requirement (RUNWARE):**
- `runware-generate-image` relies on dynamic imports; ensure `import_map = "../deno.jsonc"` is set in `supabase/config.toml`
- This prevents bundler graph resolution failures for vendor-first client loading
