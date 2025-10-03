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
3. **Static Import**: Compile-time import resolution
4. **Boot Validation**: Verify imports before serving requests
5. **Error Boundaries**: Graceful degradation on import failures

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
    Receptionist->>Implementation: Static import
    Implementation-->>Receptionist: Module loaded
    Receptionist->>Logger: Log V4.2 initialized
    Receptionist->>Logger: Log bulletproof active
    
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
- **V4.2**: Bulletproof pattern with sync anomaly prevention
- **Current**: All image functions migrated to V4.2

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