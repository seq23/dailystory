// DEPLOY_MARKER: 2025-10-04T14:00:00Z - Fixed CCS runtime errors
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const SERVICE_NAME = "runware-template-ab";

// ========== INLINED: ProviderGate (Concurrency + Circuit Breaker) ==========
// Inlined to avoid bundling failures with _shared/ dynamic imports
// Feature flag: DISABLE_PROVIDER_GATE=true to skip gating

interface GateConfig {
  maxConcurrency: number;
  failThreshold: number;
  cooldownMs: number;
  maxWaitMs: number;
}

interface CircuitState {
  failures: number;
  lastFailureAt: number;
  isOpen: boolean;
}

interface GateState {
  active: number;
  waiting: Array<{ resolve: () => void; acquiredAt: number }>;
  circuit: CircuitState;
}

const gates = new Map<string, GateState>();

const DEFAULT_CONFIGS: Record<string, GateConfig> = {
  'T1:ai-visual-scene-creator': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_T1') || '6'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '30000'),
    maxWaitMs: 2000
  },
  'DM:runware-template-cd': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE') || '4'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '45000'),
    maxWaitMs: 2000
  },
  'T25A:runware-template-ab': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE') || '4'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '45000'),
    maxWaitMs: 2000
  },
  'T25B:runware-template-ab': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE') || '4'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '45000'),
    maxWaitMs: 2000
  },
  'T25C:runware-template-cd': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE') || '4'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '45000'),
    maxWaitMs: 2000
  },
  'IMG:runware-generate-image': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE') || '4'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '45000'),
    maxWaitMs: 2000
  }
};

function getOrCreateGateState(key: string): GateState {
  if (!gates.has(key)) {
    gates.set(key, {
      active: 0,
      waiting: [],
      circuit: {
        failures: 0,
        lastFailureAt: 0,
        isOpen: false
      }
    });
  }
  return gates.get(key)!;
}

function getConfig(key: string): GateConfig {
  return DEFAULT_CONFIGS[key] || DEFAULT_CONFIGS['T25A:runware-template-ab'];
}

function isCircuitOpen(key: string): boolean {
  const state = getOrCreateGateState(key);
  const config = getConfig(key);
  const now = Date.now();
  
  if (state.circuit.isOpen) {
    if (now - state.circuit.lastFailureAt >= config.cooldownMs) {
      console.log(`🔄 [GATE] Circuit ${key} half-open: cooldown passed, allowing next attempt`);
      state.circuit.isOpen = false;
      state.circuit.failures = 0;
    }
  }
  
  return state.circuit.isOpen;
}

async function acquire(key: string): Promise<{ acquired: boolean; reason?: string; retryAfterSeconds?: number }> {
  const state = getOrCreateGateState(key);
  const config = getConfig(key);
  
  if (isCircuitOpen(key)) {
    const timeUntilCooldown = Math.ceil((config.cooldownMs - (Date.now() - state.circuit.lastFailureAt)) / 1000);
    return { 
      acquired: false, 
      reason: 'CIRCUIT_OPEN', 
      retryAfterSeconds: Math.max(3, Math.min(8, timeUntilCooldown))
    };
  }
  
  if (state.active < config.maxConcurrency) {
    state.active++;
    return { acquired: true };
  }
  
  const jitter = Math.floor(Math.random() * 150);
  const timeout = config.maxWaitMs + jitter;
  
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      const index = state.waiting.findIndex(w => w.resolve === resolveAcquire);
      if (index !== -1) {
        state.waiting.splice(index, 1);
      }
      resolve({ 
        acquired: false, 
        reason: 'QUEUE_TIMEOUT', 
        retryAfterSeconds: Math.floor(3 + Math.random() * 5)
      });
    }, timeout);
    
    const resolveAcquire = () => {
      clearTimeout(timeoutId);
      state.active++;
      resolve({ acquired: true });
    };
    
    state.waiting.push({ 
      resolve: resolveAcquire, 
      acquiredAt: Date.now() 
    });
  });
}

function release(key: string, ok: boolean = true): void {
  const state = getOrCreateGateState(key);
  const config = getConfig(key);
  
  if (state.active > 0) {
    state.active--;
  }
  
  if (!ok) {
    state.circuit.failures++;
    state.circuit.lastFailureAt = Date.now();
    
    if (state.circuit.failures >= config.failThreshold) {
      state.circuit.isOpen = true;
      console.warn(`⚠️ [GATE] Circuit ${key} OPENED: ${state.circuit.failures} failures >= ${config.failThreshold} threshold`);
    }
  } else {
    if (state.circuit.failures > 0) {
      state.circuit.failures = Math.max(0, state.circuit.failures - 1);
    }
  }
  
  while (state.waiting.length > 0 && state.active < config.maxConcurrency) {
    const waiter = state.waiting.shift();
    if (waiter) {
      waiter.resolve();
    }
  }
}

// ========== END INLINED: ProviderGate ==========

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
  "Access-Control-Max-Age": "600",
  "Vary": "Origin",
};
function withCors(res: Response): Response {
  const h = new Headers(res.headers);
  for (const [k, v] of Object.entries(corsHeaders)) h.set(k, v);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}
function asResponse(maybe: unknown, fallbackStatus = 204): Response {
  if (maybe instanceof Response) return maybe;
  if (maybe == null) return new Response(null, { status: fallbackStatus });
  if (typeof maybe === "string") return new Response(maybe, { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  return new Response(JSON.stringify(maybe), { status: 200, headers: { "Content-Type": "application/json" } });
}

// Fast Boot Sync Recovery Configuration
const FAST_BOOT_SYNC = {
  maxRetries: 3,
  delays: [500, 2000, 3500], // Total: 6 seconds max
  bootErrors: ['Module not found', 'index.js failed to load', 'Handler default export not a function', 'boot sync error'],
  maxTotalTime: 6000
};

// Dynamic handler loader with LKG (Last Known Good) serve-stale pattern
type HandlerFn = (req: Request) => Promise<Response> | Response;
let cachedHandler: HandlerFn | null = null; // LKG: Cached successfully loaded handler
let lastLoadError: { at: number; message: string; attempt: number } | null = null;
let isLoading = false;
const MAX_RETRIES = 3;
const BACKOFF_MS = 2_000;
async function loadHandler(allowRetry = false): Promise<HandlerFn | null> {
  if (cachedHandler) return cachedHandler;
  
  // Prevent concurrent loading attempts
  if (isLoading && !allowRetry) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return cachedHandler;
  }
  
  const now = Date.now();
  const shouldBackoff = lastLoadError && 
    now - lastLoadError.at < BACKOFF_MS && 
    !allowRetry && 
    lastLoadError.attempt < MAX_RETRIES;
    
  if (shouldBackoff) return null;
  
  isLoading = true;
  
  try {
    console.log(`🔍 Bundle-first dynamic import: ./index.js`);
    let mod: any;
    
    try {
      mod = await import("./index.js");
    } catch (bundleError) {
      console.warn(`Bundle import failed: ${bundleError instanceof Error ? bundleError.message : String(bundleError)}, trying source fallback`);
      mod = await import("./index.js");
    }
    
    const fn = (mod as any)?.default as HandlerFn | undefined;
    
    if (typeof fn !== "function") {
      throw new Error("Handler default export not a function - boot sync error");
    }
    
    cachedHandler = fn;
    lastLoadError = null;
    isLoading = false;
    
    console.log(`✅ Handler loaded successfully`);
    return cachedHandler;
    
  } catch (err: any) {
    const attempt = (lastLoadError?.attempt || 0) + 1;
    lastLoadError = { 
      at: Date.now(), 
      message: `${err?.message ?? String(err)}${err?.stack ? ` | Stack: ${String(err.stack).slice(0, 500)}` : ''}`,
      attempt 
    };
    isLoading = false;
    
    const errorMessage = err?.message ?? String(err);
    const errorCategory = errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') 
      ? 'CDN_IMPORT_FAILURE' 
      : errorMessage.includes('Cannot find module') || errorMessage.includes('not found')
      ? 'FILE_MISSING'
      : 'HANDLER_CRASH';
    
    console.error(`❌ Handler load failed [${errorCategory}] (attempt ${attempt}/${MAX_RETRIES}):`, errorMessage);
    
    if (attempt >= MAX_RETRIES) {
      cachedHandler = null;
      console.log("🔄 Clearing handler cache after max retries");
    }
    
    return null;
  }
}

serve(async (req) => {
  try {
    const url = new URL(req.url);

    // OPTIONS → 204, empty body
    if (req.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204, headers: { "Content-Length": "0" } }));
    }

    // HEAD /health → 200, empty body
    if (req.method === "HEAD" && url.pathname === "/health") {
      return withCors(new Response(null, { status: 200, headers: { "Cache-Control": "no-store", "x-health": "true", "Content-Length": "0" } }));
    }

    // Any GET → boring 200 JSON (never fails)
    if (req.method === "GET") {
      const payload = {
        status: "healthy",
        service: SERVICE_NAME,
        tier: "2.5A/2.5B",
        timestamp: new Date().toISOString(),
        deployment_version: "2025-10-03T18:15:00Z",
        handlerCached: !!cachedHandler,
        lastError: lastLoadError?.message ?? null,
        capabilities: ["character_consistency", "visual_tracking", "cultural_enhancement"]
      };
      return withCors(new Response(JSON.stringify(payload), { status: 200, headers: { "Content-Type": "application/json" } }));
    }

    // Any other HEAD → 200, empty body
    if (req.method === "HEAD") {
      return withCors(new Response(null, { status: 200, headers: { "Cache-Control": "no-store", "Content-Length": "0" } }));
    }

    // POST → fast boot sync recovery with handler loading
    if (req.method === "POST") {
      // Feature flag check
      const gatingEnabled = Deno.env.get('DISABLE_PROVIDER_GATE') !== 'true';
      let gateAcquired = false;
      
      if (gatingEnabled) {
        const gateResult = await acquire('T25A:runware-template-ab');
        if (gateResult.acquired) {
          console.log(`✅ [GATE] T25A:runware-template-ab acquired`);
          gateAcquired = true;
        } else {
          console.warn(`⚠️ [GATE] Failed to acquire: ${gateResult.reason}, proceeding without gate`);
        }
      } else {
        console.log(`⏭️ [GATE] Provider gating DISABLED via env flag`);
      }
      
      // Fast retry wrapper for handler loading
      for (let attempt = 0; attempt <= FAST_BOOT_SYNC.maxRetries; attempt++) {
        try {
          let handler = await loadHandler(false);
          if (!handler) handler = await loadHandler(true);
          if (handler) {
            const out = await handler(req);
            if (gatingEnabled && gateAcquired) {
              const handlerSuccess = out instanceof Response && out.status < 500;
              release('T25A:runware-template-ab', handlerSuccess);
            }
            return withCors(asResponse(out));
          }
          
          // LKG serve-stale: If cachedHandler exists but loadHandler returned null, serve stale
          if (cachedHandler && !handler) {
            console.warn(`⚠️ [LKG_SERVE_STALE] Handler load failed but cached handler available - serving stale`);
            const out = await cachedHandler(req);
            if (gatingEnabled && gateAcquired) {
              const handlerSuccess = out instanceof Response && out.status < 500;
              release('T25A:runware-template-ab', handlerSuccess);
            }
            return withCors(asResponse(out));
          }
          
          // Handler unavailable - check if boot sync error
          const errorMessage = lastLoadError?.message ?? "index.js failed to load";
          const isSyncFailure = FAST_BOOT_SYNC.bootErrors.some(msg => 
            errorMessage.includes(msg)
          );
          
          if (!isSyncFailure || attempt === FAST_BOOT_SYNC.maxRetries) {
            // Final failure or non-sync error
            return withCors(new Response(JSON.stringify({
              success: false,
              error: "HANDLER_UNAVAILABLE",
              nextAction: 'ESCALATE_TIER_2.5B',
              escalationReason: 'handler_unavailable',
              message: errorMessage,
              service: SERVICE_NAME,
              timestamp: new Date().toISOString(),
            }), { status: 200, headers: { "Content-Type": "application/json" } }));
          }
          
          const delay = FAST_BOOT_SYNC.delays[attempt];
          console.warn(`🔄 [TEMPLATE_AB] Fast boot retry ${attempt + 1}/${FAST_BOOT_SYNC.maxRetries} in ${delay}ms: ${errorMessage}`);
          await new Promise(resolve => setTimeout(resolve, delay));
          
        } catch (handlerError: any) {
          const errorMessage = handlerError?.message ?? String(handlerError);
          const isSyncFailure = FAST_BOOT_SYNC.bootErrors.some(msg => 
            errorMessage.includes(msg)
          );
          
          if (!isSyncFailure || attempt === FAST_BOOT_SYNC.maxRetries) {
            // Final failure or non-sync error
            return withCors(new Response(JSON.stringify({
              success: false,
              error: "HANDLER_ERROR",
              message: errorMessage,
              service: SERVICE_NAME,
              timestamp: new Date().toISOString(),
            }), { status: 500, headers: { "Content-Type": "application/json" } }));
          }
          
          const delay = FAST_BOOT_SYNC.delays[attempt];
          console.warn(`🔄 [TEMPLATE_AB] Fast boot retry ${attempt + 1}/${FAST_BOOT_SYNC.maxRetries} in ${delay}ms: ${errorMessage}`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // Method not allowed (still CORS-safe)
    return withCors(new Response(JSON.stringify({ error: "Method not allowed", allowed: ["GET", "HEAD", "POST", "OPTIONS"] }),
      { status: 405, headers: { "Content-Type": "application/json" } }));
  } catch (err: any) {
    return withCors(new Response(JSON.stringify({
      error: "Internal receptionist error",
      message: err?.message ?? String(err),
      service: SERVICE_NAME,
      timestamp: new Date().toISOString(),
    }), { status: 500, headers: { "Content-Type": "application/json" } }));
  }
});