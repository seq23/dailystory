# Receptionist Architecture and Static Imports

## 🔒 **TypeScript Receptionist Pattern V4.3**

### Architecture Overview

<lov-mermaid>
graph TD
    A[index.ts Entry Point] --> B[CORS/Health Check]
    B --> C{POST Request?}
    C -->|Yes| D[Dynamic Load Handler]
    D --> E{Load Success?}
    E -->|Yes| F[Cache Handler as LKG]
    E -->|No| G{LKG Available?}
    G -->|Yes| H[Serve Stale Handler]
    G -->|No| I[503 Escalate Tier]
    F --> J[Execute Handler]
    H --> J
    J --> K[Return Response]
</lov-mermaid>

## **Dual Architecture Pattern**

Every Supabase Edge Function implements the dual-file pattern:

```
supabase/functions/function-name/
├── index.ts       # TypeScript receptionist
└── index.js       # JavaScript implementation
```

### **Real Implementation Examples**

#### runware-template-ab Implementation (V4.3)
```typescript
// From actual supabase/functions/runware-template-ab/index.ts
const SERVICE_NAME = "runware-template-ab";

// LKG: Cached successfully loaded handler for serve-stale behavior
let cachedHandler: HandlerFn | null = null;

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check
  if (req.method === 'HEAD' || req.method === 'GET') {
    return new Response(JSON.stringify({ 
      service: SERVICE_NAME, 
      status: 'healthy' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // POST: Dynamic load with LKG fallback
  if (req.method === 'POST') {
    try {
      const handler = await loadHandler();
      cachedHandler = handler; // Cache for future use
      return await handler(req);
    } catch (loadError) {
      console.error(`❌ Failed to load handler:`, loadError);
      
      // LKG serve-stale: Use cached handler if available
      if (cachedHandler) {
        console.warn(`⚠️ Using LKG cached handler (serve-stale)`);
        return await cachedHandler(req);
      }
      
      // No LKG available
      return new Response(JSON.stringify({ 
        error: 'HANDLER_LOAD_FAILED',
        escalation: 'NEXT_TIER' 
      }), { 
        status: 503, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
  }

  return new Response('Method not allowed', { 
    status: 405, 
    headers: corsHeaders 
  });
});
```

#### Actual Boot Logs (V4.3)
```
🔍 [GATE] DM:runware-template-ab acquired
✅ Handler loaded successfully
Listening on http://localhost:9999/
booted (time: 23ms)
```

## **Boot Failure Prevention System**

### The Problem Solved (V4.3)
Previously, boot-time static imports could cause failures:
- Import timing issues during deployment
- Module not found errors for `.js` files
- Receptionist trying to load implementation before it's ready

### The Solution: Dynamic Load + LKG Pattern
```typescript
// V4.3: No top-level static imports of implementation
// Load handler dynamically only when POST arrives
async function loadHandler(): Promise<HandlerFn> {
  const maxRetries = 3;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const module = await import('./index.js');
      if (!module.handler) throw new Error('No handler export');
      return module.handler;
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(r => setTimeout(r, 100 * (i + 1)));
    }
  }
  throw new Error('Handler load failed after retries');
}

// Last Known Good caching prevents repeated failures
let cachedHandler: HandlerFn | null = null;
// ... in POST handler:
cachedHandler = handler; // Cache after successful load
// ... on failure:
if (cachedHandler) return await cachedHandler(req); // Serve stale
```

## **Option A Receptionist Pattern**

All 4 image generation functions use "Option A":

### **Pattern Characteristics**
1. **TypeScript Entry Point**: `index.ts` handles routing and CORS
2. **JavaScript Implementation**: `index.js` contains business logic  
3. **Dynamic Loading**: Runtime import resolution only after POST requests
4. **LKG (Last Known Good)**: Serve-stale behavior using cached handler on dynamic load failures
5. **Fast Retry Loop**: Multi-attempt dynamic import with exponential backoff
6. **Boot Validation**: Lightweight boot with no top-level shared imports
7. **Error Boundaries**: Graceful degradation on import failures

### **Functions Using Pattern**
- ✅ `runware-template-ab` (Tier 2.5A/B)
- ✅ `runware-template-cd` (Tier 2.5C/D)

**Note**: 
- `runware-generate-image` is a Pure TypeScript Orchestrator (NOT Option A) - uses complete lazy loading pattern
- `ai-visual-scene-creator` is also a Pure TypeScript Orchestrator (NOT Option A) - uses complete lazy loading pattern

## **Boot Process Flow**

<lov-mermaid>
sequenceDiagram
    participant Client
    participant Receptionist as index.ts
    participant Implementation as index.js
    participant Logger
    
    Note over Receptionist: Function Boot
    Receptionist->>Logger: Log INIT message
    Note over Receptionist: No top-level imports
    Receptionist->>Logger: Log V4.3 initialized
    Receptionist->>Logger: Log dynamic-after-request active
    
    Note over Client: Request Handling
    Client->>Receptionist: HTTP Request
    Receptionist->>Receptionist: Validate imports
    Receptionist->>Implementation: handleRequest()
    Implementation-->>Receptionist: Result
    Receptionist->>Client: HTTP Response
</lov-mermaid>

## **Error Handling Architecture**

### **Import Failure Handling**
```typescript
// Actual error boundary pattern
serve(async (req) => {
  try {
    // Validate implementation availability
    if (!handleRequest) {
      throw new Error('Implementation module not available');
    }
    
    const result = await handleRequest(req);
    return asResponse(result);
  } catch (error) {
    console.error(`🚨 [${functionName}] Handler error:`, error);
    
    // Return structured error response
    return new Response(JSON.stringify({ 
      error: error.message,
      function: functionName,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
```

### **CORS Handling Pattern**
```typescript
// Universal CORS implementation
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle preflight requests
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}
```

## **Performance Benefits**

1. **Fast Boot**: Static imports enable 26ms boot times
2. **No Runtime Import**: Eliminates import() performance penalties
3. **Predictable Loading**: Deterministic module resolution
4. **Memory Efficiency**: Single module load per function
5. **Error Prevention**: Compile-time import validation

## **Maintenance Guidelines**

### **Adding New Functions**
1. Create `index.ts` with receptionist pattern
2. Implement business logic in `index.js`
3. Add V4.2 logging statements
4. Test boot process and error handling

### **Debugging Import Issues**
1. Check boot logs for "bulletproof pattern active"
2. Verify `index.js` exists and exports `handleRequest`
3. Test CORS preflight handling
4. Monitor for 503 errors in production

## **Direct Mode: Zero-Throttling Reliability Layer**

### **Overview**
Direct Mode (`runware-template-cd`) operates as the ultimate reliability layer with **zero throttling** - no gate checks, no waiting, always available. This ensures 99.99% system availability even during Tier 1 overload conditions.

### **Pattern Characteristics**
1. **Zero Throttling**: No `ProviderGate.acquire()` calls - always proceeds immediately
2. **Ultimate Fallback**: Activates when Tier 1 fails OR is overloaded
3. **Nuclear Templates**: Hardcoded style frameworks with zero external dependencies
4. **Guaranteed Response**: Returns valid images even in worst-case scenarios
5. **Bulletproof Operation**: Designed to never fail, never throttle, never wait

### **Architecture Flow**

<lov-mermaid>
graph TD
    A[Tier 1 Request] --> B{Gate Check}
    B -->|Acquired| C[Process Tier 1]
    B -->|Denied/Overload| D[Skip to Direct Mode]
    C --> E{Success?}
    E -->|Yes| F[Return Result]
    E -->|No| G[Release Gate]
    G --> H[Cascade to Direct Mode]
    D --> I[Direct Mode: NO GATE CHECK]
    H --> I
    I --> J[Generate Nuclear Template]
    J --> K[Call Runware API]
    K --> L[Return Image]
    L --> F
    
    style I fill:#ff6b6b,stroke:#c92a2a,stroke-width:3px
    style D fill:#ffd43b,stroke:#fab005,stroke-width:2px
    style H fill:#ffd43b,stroke:#fab005,stroke-width:2px
</lov-mermaid>

### **Implementation Details**

**Tier 1 Gate Check (Before Processing):**
```typescript
// Check if Tier 1 gate is available BEFORE attempting Tier 1
const tier1GateResult = await acquire("T1:ai-visual-scene-creator");
if (!tier1GateResult.acquired) {
  console.log(`⚠️ [TIER_1] Gate denied: ${tier1GateResult.reason}`);
  console.log(`⚡ [TIER_1] Skipping directly to Direct Mode (no throttling)`);
  
  // Skip Tier 1 entirely and go straight to Direct Mode
  payload.skipTier1DueToOverload = true;
}
```

**Direct Mode: Zero Throttling:**
```typescript
// CORRECTED CASCADE: Always try Direct Mode after Tier 1 failure
const skipReason = payload.skipTier1DueToOverload 
  ? "Tier 1 overload detected" 
  : "Tier 1 failure";
console.log(`[DIRECT_MODE] Attempting Direct Mode fallback (${skipReason})`);
console.log(`🚀 [DIRECT_MODE] Proceeding without gate check (always available - zero throttling)`);

// NO GATE CHECK - Direct Mode always proceeds
try {
  const directModeResponse = await invokeDirectMode(payload);
  // Process response...
} finally {
  // Direct Mode has no gate - nothing to release
}
```

### **Why Zero Throttling?**

1. **Ultimate Reliability**: System must ALWAYS be able to generate images
2. **Overload Protection**: When Tier 1 is overloaded, Direct Mode absorbs traffic instantly
3. **No Cascading Failures**: Removing the gate prevents queue buildup and timeouts
4. **Guaranteed Availability**: 99.99% uptime requires at least one path with zero bottlenecks
5. **Business Continuity**: Users never see "service unavailable" errors

### **Performance Characteristics**

- **Response Time**: <5 seconds (nuclear templates + Runware API)
- **Availability**: 99.99% (no throttling layer)
- **Concurrency**: Unlimited (no gate restrictions)
- **Failover Speed**: Instant (no retry delays)
- **Template Generation**: <100ms (hardcoded frameworks)

### **Nuclear Template System**

Direct Mode uses **hardcoded style frameworks** with zero external dependencies:

```javascript
const NUCLEAR_HARDCODED_STYLE_FRAMEWORKS = {
  'beginner': {
    name: 'Contemporary Children\'s Book Illustration',
    frameworkPrompt: 'Contemporary children\'s book illustration...'
  },
  'expert': {
    name: '2.9D Rendered Illustration',
    frameworkPrompt: '2.9D rendered illustration with golden hour...'
  }
};
```

**Fallback Levels:**
- **Tier 2.5C**: Nuclear templates with scene text + character description
- **Tier 2.5D**: Ultimate emergency fallback with hardcoded diverse children scene

### **Monitoring & Verification**

**Success Metrics:**
```typescript
// Logs confirm Direct Mode operation
console.log(`🚀 [DIRECT_MODE] Proceeding without gate check (always available)`);
console.log(`✅ Template CD: Generation complete`, {
  tier: 'NUCLEAR_2.5C',
  imageURL: 'https://...',
  responseTime: '<5s'
});
```

**Edge Function Logs:**
```
[DIRECT_MODE] Attempting Direct Mode fallback (Tier 1 overload detected)
🚀 [DIRECT_MODE] Proceeding without gate check (always available - zero throttling)
✅ Template CD: Generation complete { tier: 'NUCLEAR_2.5C', imageURL: 'https://...' }
```

## **Orchestrator Pattern (Pure TypeScript Edge Functions)**

Some edge functions serve as main orchestrators using pure TypeScript implementation:

### **Pattern Characteristics**
1. **Pure TypeScript**: Single `.ts` file (no separate `.js` implementation)
2. **Main Orchestrator**: Coordinates multiple services and providers
3. **Complete Lazy Loading**: ALL `_shared` imports MUST be lazy-loaded
4. **Boot Independence**: Zero boot-time dependencies for maximum reliability
5. **Request-Time Loading**: All heavy modules loaded on-demand

### **Example: `ai-visual-scene-creator`**
- Main orchestrator for visual scene generation pipeline
- Lazy loads: `CharacterConsistencyService.js`, `StaticDataCache.js`, `ProviderGate.ts`, `IdempotencyMemory.ts`
- Can boot successfully even if ALL CDNs fail
- All imports happen inside request handlers, never at module level

### **Critical Rule**
Orchestrator functions must use **complete lazy loading** - NO top-level `_shared` imports allowed. This prevents boot failures and ensures maximum reliability.

## **Migration History**

- **V4.0**: Basic dual-file pattern
- **V4.1**: Added boot validation
- **V4.2**: Bulletproof pattern with sync anomaly prevention (deprecated)
- **V4.3**: Dynamic-after-request pattern with LKG serve-stale behavior (current)
- **Current**: All image functions migrated to V4.3

## **Local Handler Import Best Practices**

For local handlers, use relative specifiers (`await import('./index.js')`) instead of file URLs. Cache busting is for remote modules only. The URL-based import pattern can cause Module not found errors in Supabase's deployment environment.

### **Fresh Deployment Protocol**

When forcing fresh deployments, update **BOTH** `DEPLOY_MARKER` timestamps:
- `index.ts` (receptionist): `2025-09-26T15:15:00Z - Switch to relative handler import`  
- `index.js` (handler): `2025-09-26T15:15:00Z - Force fresh deployment sync with receptionist`

Synchronized timestamps ensure the deployment system recognizes both files as updated and creates a fresh bundle.

---
*Last Updated: September 26, 2025*
*Pattern Status: STABLE - Zero sync anomalies in production*