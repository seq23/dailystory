# Reliability Architecture

**Status**: Production-ready (October 2025)  
**Purpose**: Unified orchestration layer for circuit breakers, deduplication, and LKG caching

---

## Architecture Overview

The reliability infrastructure consists of **three consolidated facades** that replace nine overlapping imports:

```
┌─────────────────────────────────────────────────────────────┐
│                    Edge Functions                            │
│  (runware-template-cd, runware-template-ab,                 │
│   ai-visual-scene-creator, runware-generate-image)          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ 2 imports (down from 4)
                  │
        ┌─────────▼──────────┐
        │ ReliabilityManager │ ◄── Single orchestrator
        └─────────┬──────────┘
                  │
        ┌─────────┴──────────────────────────┐
        │                                     │
   ┌────▼────────┐  ┌────────────┐  ┌───────▼────────┐
   │ Circuit     │  │ Request    │  │ Universal LKG  │
   │ Breaker     │  │ Dedup      │  │ Cache          │
   └─────────────┘  └────────────┘  └────────────────┘
```

---

## Component Roles

### 1. ReliabilityManager (Orchestrator)

**File**: `supabase/functions/_shared/ReliabilityManager.ts`  
**Purpose**: Single entry point for all reliability operations

**Key Method**:
```typescript
await reliabilityManager.executeResilient(
  operationKey: string,
  operation: () => Promise<T>,
  options: {
    functionName: string;
    sessionId?: string;
    tier?: string;
    quality?: 'high' | 'medium' | 'low';
    timeout?: number;
  }
)
```

**Execution Flow**:
1. Check circuit breaker status
2. Create deduplication key
3. Check LKG cache (15-min window)
4. Execute operation with circuit breaker protection
5. Warm LKG cache on success
6. Record monitoring metrics

**Health Dashboard**:
```typescript
reliabilityManager.getHealthDashboard()
// Returns: { lkgCache, deduplication, circuitBreakers, monitoring }
```

---

### 2. UniversalLogger (Structured Logging)

**File**: `supabase/functions/_shared/UniversalLogger.ts`  
**Purpose**: Replaces `tierLogging.js` with TypeScript and enhanced features

**Backward Compatible Functions**:
```typescript
// Original tierLogging.js API (still works)
logTier(sessionId, tier, status, message, metadata?)
getTierLogs(sessionId)
clearTierLogs(sessionId)
getTierCascadeSummary(sessionId)
```

**Enhanced API**:
```typescript
UniversalLogger.success('context', 'Operation succeeded', { data });
UniversalLogger.failure('context', 'Operation failed', { error });
UniversalLogger.log('context', 'info', 'Custom message', { metadata });
```

---

### 3. SupabaseClientFactory (Client Creation)

**File**: `supabase/functions/_shared/SupabaseClientFactory.ts`  
**Purpose**: Centralized client creation patterns

**Client Types**:
```typescript
// Vendor-first (5ms, local import)
createVendorFirstClient() // For CCS, image gen, high-priority ops

// Database client (network timeout)
createDatabaseClient() // For analytics, logging

// Payment client (explicit failure)
createPaymentClient() // For Stripe, checkout (returns null on failure)

// Tiered client (template fallback signaling)
createTieredClient() // For story generation
```

---

## Migration Guide

### Before (Old Pattern)
```typescript
// 4 imports per function
import { UniversalLKGCache } from '../_shared/UniversalLKGCache.ts';
import { RequestDeduplicator } from '../_shared/RequestDeduplicator.ts';
import { EnhancedCircuitBreaker } from '../_shared/EnhancedCircuitBreaker.ts';
import { monitoringService } from '../_shared/MonitoringService.ts';

// 11-line reliability setup
const dedupKey = RequestDeduplicator.createKey({ functionName, sessionId, content });
const requestHash = UniversalLKGCache.createRequestHash(payload);
const cached = UniversalLKGCache.getLKG(requestHash, functionName);
if (cached) return cached;

const result = await EnhancedCircuitBreaker.execute(
  'circuit-key',
  async () => await RequestDeduplicator.deduplicate(dedupKey, () => callAPI())
);

UniversalLKGCache.warmFromSuccess(requestHash, result, tier, functionName);
monitoringService.recordSuccess(duration);
```

### After (New Pattern)
```typescript
// 2 imports per function
import { reliabilityManager } from '../_shared/ReliabilityManager.ts';
import { UniversalLogger } from '../_shared/UniversalLogger.ts';

// 9-line single call
const result = await reliabilityManager.executeResilient(
  operationKey,
  () => callAPI(...),
  {
    functionName: 'my-function',
    sessionId: 'sess_123',
    tier: 'tier-1',
    quality: 'high'
  }
);
```

**Reduction**:
- **50% fewer imports** (4 → 2)
- **18% fewer lines per usage** (11 → 9)
- **75% less duplication** (update 1 file instead of 4)

---

## Performance Metrics

### Import Reduction
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Imports per function | 4 | 2 | 50% |
| Total imports (4 functions) | 16 | 8 | 50% |
| Lines per usage | 11 | 9 | 18% |

### Maintainability
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Files to update when changing reliability | 4 edge functions | 1 ReliabilityManager | 75% |
| Reliability logic duplication | 4x | 0x | 100% |

### Reliability Stats (Unchanged)
- **LKG Cache Window**: 15 minutes
- **Circuit Breaker Thresholds**: 5 network failures, 10 API failures
- **Deduplication Timeout**: 30 seconds (default)
- **Quality-Based Eviction**: High > Medium > Low

---

## Testing Impact

### ImageTierTester Compatibility

**Status**: ✅ Zero changes required

**Reason**: The tester uses `supabase.functions.invoke()` which calls edge functions via HTTP. The consolidation is internal to edge functions and doesn't affect the HTTP contract.

**Verified Test Scenarios**:
1. **Connectivity Tests** (lines 2112-2150) - ✅ HTTP contract preserved
2. **Force Tier 2.5A/B** (lines 1861-1866) - ✅ Internal implementation transparent
3. **E2E Scenarios** (lines 2899-2932) - ✅ Function behavior unchanged

### Test Validation Commands

**Pre-deployment**:
```bash
# TypeScript compilation
deno check supabase/functions/_shared/ReliabilityManager.ts
deno check supabase/functions/_shared/UniversalLogger.ts
deno check supabase/functions/_shared/SupabaseClientFactory.ts

# Edge functions syntax
deno check supabase/functions/runware-template-cd/index.ts
deno check supabase/functions/runware-template-ab/index.ts
deno check supabase/functions/ai-visual-scene-creator/index.ts
deno check supabase/functions/runware-generate-image/index.ts

# Import analysis (no circular deps)
grep -r "import.*ReliabilityManager" supabase/functions/
```

**Post-deployment**:
```bash
# Health checks
curl https://[project].supabase.co/functions/v1/runware-template-cd
curl https://[project].supabase.co/functions/v1/runware-template-ab
curl https://[project].supabase.co/functions/v1/ai-visual-scene-creator
curl https://[project].supabase.co/functions/v1/runware-generate-image

# Test mode verification
curl -X POST https://[project].supabase.co/functions/v1/runware-template-cd \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

## Critical Preservation

### Vendor Bundle Hints (runware-generate-image)

**Lines 13-25 in orchestrator MUST be preserved**:
```typescript
// ✅ BUNDLER HINTS: Force shared modules into deployment bundle
import { characterConsistencyService as _ccsHint } from "./CharacterConsistencyServiceInline.js";
import * as __bundle_resilientLoader from "../_shared/resilientLoader.js";
import * as __bundle_tierLogging from "../_shared/tierLogging.js";
import * as __bundle_nuclearNegatives from "../_shared/NuclearNegativePrompts.js";
import * as __bundle_idempotency from "../_shared/IdempotencyMemory.js";

void _ccsHint;
void __bundle_resilientLoader;
void __bundle_tierLogging;
void __bundle_nuclearNegatives;
void __bundle_idempotency;
```

**Rationale**: These prevent tree-shaking during Deno deployment, ensuring all shared modules are bundled.

---

## Dependencies

### Forward Dependencies (What Uses This Code)
1. ✅ `runware-template-cd/index.ts` - Updated imports
2. ✅ `runware-template-ab/index.ts` - Updated imports
3. ✅ `ai-visual-scene-creator/index.ts` - Updated imports
4. ✅ `runware-generate-image/index.ts` - Updated imports (vendor hints preserved)
5. ✅ `ImageTierTester.tsx` - **NO CHANGES** (HTTP contract preserved)

### Backward Dependencies (What This Code Uses)
1. ✅ `UniversalLKGCache.ts` - Used by ReliabilityManager, no changes
2. ✅ `RequestDeduplicator.ts` - Used by ReliabilityManager, no changes
3. ✅ `EnhancedCircuitBreaker.ts` - Used by ReliabilityManager, no changes
4. ✅ `MonitoringService.ts` - Used by ReliabilityManager, no changes
5. ✅ `tierLogging.js` - **Copied into** UniversalLogger.ts, original preserved

---

## Error Prevention

### What Could Break
1. ❌ **Syntax errors** in new TypeScript files
   - **Prevention**: TypeScript compiler validation before deployment
   
2. ❌ **Circular dependencies** between new files
   - **Prevention**: One-way dependency flow: Edge Functions → ReliabilityManager → Individual Services
   
3. ❌ **Missing vendor bundle** in orchestrator
   - **Prevention**: Explicit check to preserve lines 13-25 unchanged
   
4. ❌ **Test failures** due to HTTP contract changes
   - **Prevention**: Zero changes to HTTP endpoints, only internal implementation

5. ❌ **Runtime errors** from incorrect reliability call syntax
   - **Prevention**: Type-safe `executeResilient()` API with required options

---

## Monitoring & Alerts

### Alert Thresholds

**LKG Cache Hit Rate**:
- Target: > 20%
- Warning: < 10%
- Critical: < 5%

**Circuit Breaker Trip Rate**:
- Target: < 1%
- Warning: 1-5%
- Critical: > 5%

**Deduplication Efficiency**:
- Target: > 10% duplicate prevention
- Warning: < 5%
- Critical: 0% (indicates dedup not working)

### Health Check Endpoint

```bash
curl https://[project].supabase.co/functions/v1/runware-template-cd/health

# Returns:
{
  "timestamp": "2025-10-12T...",
  "lkgCache": { "size": 42, "hitRate": 0.23, "evictions": 5 },
  "deduplication": { "activeRequests": 3, "duplicatesPrevented": 127 },
  "circuitBreakers": { "open": 0, "halfOpen": 1, "closed": 8 },
  "monitoring": { "successRate": 0.98, "avgLatency": 234 }
}
```

---

## Rollback Plan

### If Issues Arise

1. **Revert edge function imports**:
   ```typescript
   // Restore 4 individual imports
   import { UniversalLKGCache } from '../_shared/UniversalLKGCache.ts';
   import { RequestDeduplicator } from '../_shared/RequestDeduplicator.ts';
   import { EnhancedCircuitBreaker } from '../_shared/EnhancedCircuitBreaker.ts';
   import { monitoringService } from '../_shared/MonitoringService.ts';
   ```

2. **Delete new facade files**:
   - `ReliabilityManager.ts`
   - `UniversalLogger.ts`
   - `SupabaseClientFactory.ts`

3. **Restore `tierLogging.js` references**

4. **Redeploy functions**

### Rollback Commits
- Edge functions: Restore lines 6-11 in each file
- Shared folder: Delete 3 new files
- README: Remove documentation section

---

## Success Metrics

### Deployment Success Criteria
- [ ] All 4 edge functions compile successfully
- [ ] Health checks pass for all functions
- [ ] ImageTierTester connectivity tests pass
- [ ] Force Tier 2.5A/B tests produce real images
- [ ] Logs show `reliabilityManager.executeResilient()` calls
- [ ] No runtime errors in production logs
- [ ] Documentation updated (README + architecture guide)

### Production Metrics (Week 1)
- [ ] Zero diagnostic page views by end users
- [ ] 100% story delivery (every request gets content)
- [ ] Emergency fallback < 5% of total stories
- [ ] User confidence maintained during outages

---

## Timeline & Effort

### Implementation Time
- **Phase 1** (Create 3 new files): 45 minutes
- **Phase 2** (Update 4 edge functions): 30 minutes
- **Phase 3** (Verify testing): 15 minutes (zero changes, just validation)
- **Phase 4** (Documentation): 30 minutes
- **Phase 5** (Safety validation): 20 minutes
- **Total**: ~2.5 hours of focused work

### Testing Time
- **Pre-deployment**: 15 minutes (TypeScript checks, import analysis)
- **Post-deployment**: 30 minutes (health checks, ImageTierTester, force tier tests)
- **Total**: 45 minutes of validation

### Grand Total
~3.25 hours from start to production-ready

---

## Related Documentation

- [Emergency Fallback Protection](./EMERGENCY_FALLBACK_PROTECTION.md)
- [Regression Prevention Checklist](./REGRESSION_PREVENTION_CHECKLIST.md)
- [Current Template System](./CURRENT_TEMPLATE_SYSTEM_AND_FALLBACK_CHAIN.md)
- [Image Tier Testing](./IMAGE_TIER_TESTING.md)
- [Story Generation Test Plan](../STORY_GENERATION_TEST_PLAN.md)
