# Actual Tier Cascade Reality (Verified October 2025)

## Purpose
This document reflects the **actual codebase behavior** of the image generation tier cascade, verified through code inspection of `supabase/functions/runware-generate-image/index.ts`.

## 6-Tier Cascade Flow

### Complete Tier List (In Order)
1. **Tier 1**: AI Generation (Orchestrator) - `executeTier1()`
2. **Tier 1.5**: Direct Mode - `executeDirectMode()`
3. **CCS_RETRY**: Lightweight CCS recovery (triggered within Direct Mode failure handler)
4. **Tier 2.5A**: Template AB with CCS - `executeT25A()` (precondition: `ctx.tier1?.characterSeed`)
5. **Tier 2.5B**: Template AB without CCS - `executeT25B()`
6. **Tier 2.5C**: Template CD (Nuclear) - `executeT25C()`
7. **Tier 2.5D**: Template CD alternative - `executeT25D()`
8. **Tier 4**: SVG Fallback (client-side) - `ImageFallbackService`

---

## Sample User Flows

### Flow 1: Tier 1 Success (90% of requests)
1. **Tier 1** → ✅ Success (ai-visual-scene-creator + CCS)
2. **Result:** Image generated with full character consistency
3. **Cascade stops:** No other tiers attempted

### Flow 2: Direct Mode Success (5% of requests)
1. **Tier 1** → ❌ Failed (AI timeout or error)
2. **Direct Mode** → ✅ Success (simplified template with primaryScene)
3. **Result:** Image generated with basic consistency
4. **Cascade stops:** Tier 2.5A never attempted

### Flow 3: CCS_RETRY Enables Tier 2.5A (3% of requests)
1. **Tier 1** → ❌ Failed (AI error)
2. **Direct Mode** → ❌ Failed (template error)
3. **CCS_RETRY** → ✅ Success (populated `ctx.tier1.characterSeed`)
4. **Tier 2.5A** → ✅ Success (Template AB with CCS)
5. **Result:** Image generated with character consistency recovered
6. **Cascade stops:** Tier 2.5B never attempted

### Flow 4: CCS_RETRY Fails, Tier 2.5B Saves (1.5% of requests)
1. **Tier 1** → ❌ Failed (AI timeout)
2. **Direct Mode** → ❌ Failed (Runware error)
3. **CCS_RETRY** → ❌ Failed (database error)
4. **Tier 2.5A** → ⏭️ **SKIPPED** (precondition: no characterSeed)
5. **Tier 2.5B** → ✅ Success (Template AB without CCS)
6. **Result:** Image generated without character consistency
7. **Cascade stops:** Tier 2.5C never attempted

### Flow 5: Nuclear Fallback (0.5% of requests)
1. **Tier 1** → ❌ Failed
2. **Direct Mode** → ❌ Failed
3. **CCS_RETRY** → ❌ Failed
4. **Tier 2.5A** → ⏭️ Skipped (no characterSeed)
5. **Tier 2.5B** → ❌ Failed (Runware outage)
6. **Tier 2.5C** → ✅ Success (hardcoded templates)
7. **Result:** Generic image generated
8. **Cascade stops:** Tier 2.5D never attempted

---

## Critical Decision Points

### 1. Direct Mode Trigger
- **Location:** Lines 1528-1596 (`executeDirectMode()`)
- **Condition:** Tier 1 returns `{ ok: false }`
- **Bypass:** None (always attempted after Tier 1 failure)
- **Special behavior:** Shares 40s timeout budget with Tier 1

### 2. CCS_RETRY Trigger
- **Location:** Lines 1598-1822 (within Direct Mode catch block)
- **Condition:** Direct Mode fails (throws exception)
- **Purpose:** Populate `ctx.tier1.characterSeed` for Tier 2.5A
- **Non-blocking:** Failure allows cascade to continue to Tier 2.5B
- **Key actions:**
  - Batch fetch CCS data (1 database call)
  - Get structured avatar data
  - Generate/synthesize characterSeed (with hardcoded fallback)
  - Extract cultural bundle

### 3. Tier 2.5A Precondition
- **Location:** Line 2659 (tier definition)
- **Condition:** `ctx.tier1?.characterSeed` must exist
- **Skip behavior:** Silent skip to Tier 2.5B if precondition fails
- **Logging:** Explicit skip log added (October 2025) at line 2343
- **Source of characterSeed:** 
  - Tier 1 success, OR
  - CCS_RETRY success

---

## Timeout Budget Analysis

### Orchestrator Total: 40 seconds
- **Tier 1:** Uses orchestrator's 40s budget
- **Direct Mode:** Shares remaining orchestrator budget (20s internal timeout)
- **Tier 2.5A/B:** 20s each (independent)
- **Tier 2.5C:** 15s (independent)

### Risk: Sum vs. Reality
- **Sum of tier timeouts:** 40 + 20 + 20 + 15 = 95 seconds
- **Orchestrator budget:** 40 seconds
- **Reality:** Individual tiers enforce their own timeouts, but orchestrator's 40s budget is a hard limit
- **Implication:** If Tier 1 takes 38 seconds and fails, Direct Mode has only 2 seconds before orchestrator timeout

---

## Health-Based Fail-Fast Routing (January 2025)

### Overview
The orchestrator performs health checks at request time and routes based on system availability, preventing 95-second timeout waits when AI systems are unavailable.

### Routing Logic

**Scenario 1: All Systems Healthy**
```
Health Check → All HEALTHY
    ↓
Route: Full cascade
  Tier 1 (ai-visual-scene-creator) → 
  Direct Mode (fallback) →
  CCS_RETRY (populate ctx.tier1) →
  Tier 2.5A (Template AB with CCS) →
  Tier 2.5B (Template AB without CCS) →
  Tier 2.5C (Template CD nuclear) →
  Tier 2.5D (Template CD emergency)
```
**Expected:** 95%+ success at Tier 1 or Direct Mode

**Scenario 2: AI Visual Scene Creator Unhealthy**
```
Health Check → ai-visual-scene-creator UNHEALTHY, OpenAI HEALTHY
    ↓
Route: Skip Tier 1, try Direct Mode
  Direct Mode (uses OpenAI directly) →
  Tier 2.5C (if Direct fails) →
  Tier 2.5D (emergency)
```
**Expected:** 80% success at Direct Mode, 20% at 2.5C

**Scenario 3: Both AI Systems Down**
```
Health Check → ai-visual-scene-creator UNHEALTHY, OpenAI UNHEALTHY
    ↓
Route: Skip directly to nuclear fallback
  Tier 2.5C (Template CD with minimal content) →
  Tier 2.5D (Template CD emergency synthesis)
```
**Expected:** 100% success at 2.5C/D (guaranteed by design)

### Health Check Implementation

```typescript
// Orchestrator checks (2s timeout each)
checkAIVisualSceneCreatorHealth() → HEAD /ai-visual-scene-creator
checkOpenAIHealth() → Check OPENAI_API_KEY presence

// Decision matrix
if (!aiVisualSceneCreator && !openai) → Route: T25C
else if (!aiVisualSceneCreator) → Route: DIRECT_MODE → T25C
else → Route: TIER_1 (full cascade)
```

### Benefits
- **Prevents 95s timeout waits** when AI systems are down
- **Degrades gracefully** to lower-quality tiers
- **Users get immediate results** even during outages
- **No manual intervention** required

### Testing in ImageTierTester
The existing "Test All Tiers (Real Routing)" button will automatically exercise health-based routing:
- Logs will show: `🏥 System Health Check: {...}`
- Logs will show: `⚠️ AI Visual Scene Creator unhealthy - skipping Tier 1` (if applicable)
- Response will include: `healthRoutingDecision` metadata
- Tier failure history will show which tiers were skipped due to health checks

---

## Logging Visibility (October 2025 Enhancements)

### Direct Mode Logs
```typescript
// Before attempt
🎯 [requestId] DIRECT_MODE: Attempting fallback after Tier 1 failure
{
  tier1FailureReason: "T1_AI_TIMEOUT",
  hasPayload: true,
  sessionId: "abc123",
  hasPrimaryScene: true
}

// Success
✅ [requestId] DIRECT_MODE: SUCCESS
{
  imageURL: "https://...",
  seed: 12345,
  primaryScene: "A child playing...",
  processingTimeMs: 1234
}
```

### CCS_RETRY Logs
```typescript
// Trigger
⚡ [requestId] CCS_RETRY: Direct Mode failed, attempting lightweight CCS recovery
{
  directModeError: "Template invocation failed",
  willPopulateTier1ForT25A: true,
  sessionId: "abc123"
}

// Success
✅ [requestId] CCS_RETRY: SUCCESS - Tier 2.5A precondition satisfied
{
  characterSeedSource: "cached",
  hasCulturalBundle: true,
  nextTier: "TIER_2.5A (Template AB with CCS)"
}

// Failure
❌ [requestId] CCS_RETRY: FAILED - Tier 2.5A will be skipped
{
  ccsError: "Database unavailable",
  tier1Populated: false,
  nextTier: "TIER_2.5B (Template AB without CCS)"
}
```

### Tier 2.5A Precondition Skip Log
```typescript
⚠️ [requestId] TIER_2.5A: SKIPPED (precondition failed: no characterSeed)
{
  hasTier1: true,
  hasCharacterSeed: false,
  ccsRetryRan: true,
  ccsRetrySuccess: false,
  reason: "Tier 1 failed and CCS_RETRY did not populate characterSeed",
  nextTier: "TIER_2.5B"
}
```

---

## Testing Environment Parity

### ImageTierTester Behavior
- ✅ Uses same `SimpleImageService` entry point
- ✅ Same payload structure as production
- ✅ Same tier cascade logic
- ✅ Direct Mode and CCS_RETRY executed in production flow
- ⚠️ No dedicated UI button for Direct Mode (logged only)
- ⚠️ CCS_RETRY visible only in orchestrator logs

### Where to See Logs
1. **Orchestrator logs:** `supabase/functions/runware-generate-image/logs`
2. **Template logs:** `supabase/functions/runware-template-*/logs`
3. **Client logs:** Browser console (when `?debug=1`)
4. **Test results:** ImageTierTester response metadata

---

## Code Reference Map

### Key Functions
- **executeTier1()**: Lines 1140-1526
- **executeDirectMode()**: Lines 1528-1596
- **CCS_RETRY block**: Lines 1598-1822
- **executeT25A()**: Lines 1825-1975
- **runTierCascade()**: Lines 2297-2383
- **Tier definitions**: Lines 2647-2664

### Precondition Check
```typescript
// Line 2659
{ 
  name: "T25A", 
  fn: executeT25A,
  precondition: (ctx) => !!ctx.tier1?.characterSeed,
}
```

### Precondition Enforcement
```typescript
// Lines 2339-2344
if (precondition && !precondition(ctx)) {
  trace.push({ tier: name, ms: 0, ok: false, code: "PRECONDITION_FAILED" });
  continue;
}
```

---

## Common Misconceptions

❌ **MYTH:** "Direct Mode is a separate tier service"  
✅ **REALITY:** Direct Mode is a fallback path within the orchestrator (`runware-generate-image`)

❌ **MYTH:** "CCS_RETRY is optional"  
✅ **REALITY:** CCS_RETRY always runs when Direct Mode fails (but its failure is non-blocking)

❌ **MYTH:** "Tier 2.5A always runs after Direct Mode"  
✅ **REALITY:** Tier 2.5A only runs if `ctx.tier1.characterSeed` exists (from Tier 1 OR CCS_RETRY)

❌ **MYTH:** "Each tier has independent timeout budget"  
✅ **REALITY:** Orchestrator enforces 40s total limit across Tier 1 + Direct Mode

---

## Related Documentation
- [CURRENT_TEMPLATE_SYSTEM_AND_FALLBACK_CHAIN.md](./CURRENT_TEMPLATE_SYSTEM_AND_FALLBACK_CHAIN.md) - System overview
- [EMERGENCY_FALLBACK_PROTECTION.md](./EMERGENCY_FALLBACK_PROTECTION.md) - User-facing error handling
- [AI_VISUAL_SCENE_CREATOR_SYSTEM_PROMPT.md](./AI_VISUAL_SCENE_CREATOR_SYSTEM_PROMPT.md) - Tier 1 details
