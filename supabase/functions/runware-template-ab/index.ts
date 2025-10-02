// DEPLOY_MARKER: 2025-10-02T21:00:00Z - Boot hardening: cache-busted fallbacks, HTTP status codes (503/502/400), cold-start stampede fix, maxTotalTime enforcement
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const SERVICE_NAME = "runware-template-ab";

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

// Dynamic handler loader (cached + fast retry)
type HandlerFn = (req: Request) => Promise<Response> | Response;
let cachedHandler: HandlerFn | null = null;
let lastLoadError: { at: number; message: string; attempt: number } | null = null;
let isLoading = false;
const MAX_RETRIES = 3;
const BACKOFF_MS = 2_000; // Reduced from 5s to 2s for faster retry
async function loadHandler(allowRetry = false): Promise<HandlerFn | null> {
  if (cachedHandler) return cachedHandler;
  
  // Prevent concurrent loading attempts with cold-start stampede protection
  if (isLoading && !allowRetry) {
    const maxWait = 5000;
    const start = Date.now();
    while (isLoading && Date.now() - start < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
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
    // Bundle-first dynamic import strategy with multiple fallback attempts
    console.log(`🔍 Bundle-first dynamic import: ./index.js`);
    let mod: any;
    
    try {
      // First attempt: Direct import (bundle-first)
      mod = await import("./index.js");
    } catch (bundleError) {
      console.warn(`Bundle import failed: ${bundleError instanceof Error ? bundleError.message : String(bundleError)}, trying cache-busted fallback`);
      // Second attempt: Cache-busted fallback
      mod = await import(`./index.js?v=${Date.now()}`);
    }
    
    const fn = (mod as any)?.default as HandlerFn | undefined;
    
    if (typeof fn !== "function") {
      throw new Error("Handler default export not a function - boot sync error");
    }
    
    cachedHandler = fn;
    lastLoadError = null;
    isLoading = false;
    
    console.log(`✅ Handler loaded successfully from ${mod.url || './index.js'}`);
    return cachedHandler;
    
  } catch (err: any) {
    const attempt = (lastLoadError?.attempt || 0) + 1;
    lastLoadError = { 
      at: Date.now(), 
      message: `${err?.message ?? String(err)}${err?.stack ? ` | Stack: ${String(err.stack).slice(0, 500)}` : ''}`,
      attempt 
    };
    isLoading = false;
    
    // Handler load failed - categorize error for better debugging
    const errorMessage = err?.message ?? String(err);
    const errorCategory = errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') 
      ? 'CDN_IMPORT_FAILURE' 
      : errorMessage.includes('Cannot find module') || errorMessage.includes('not found')
      ? 'FILE_MISSING'
      : 'HANDLER_CRASH';
    
    console.error(`❌ Handler load failed [${errorCategory}] (attempt ${attempt}/${MAX_RETRIES}):`, errorMessage);
    
    // If we've exceeded max retries, clear cache to force fresh attempts
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
      const DEPLOY_MARKER = "2025-10-01T21:20:00Z";
      const payload = {
        status: "healthy",
        service: SERVICE_NAME,
        tier: "2.5A/2.5B",
        timestamp: new Date().toISOString(),
        deployment_version: DEPLOY_MARKER,
        handler_cached: !!cachedHandler,
        last_error: lastLoadError?.message ?? null,
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
      // Fast retry wrapper with timeout enforcement
      const startTime = Date.now();
      for (let attempt = 0; attempt <= FAST_BOOT_SYNC.maxRetries; attempt++) {
        // Enforce maxTotalTime
        if (Date.now() - startTime > FAST_BOOT_SYNC.maxTotalTime) {
          console.warn(`⚠️ [TEMPLATE_AB] Max total time exceeded (${FAST_BOOT_SYNC.maxTotalTime}ms)`);
          break;
        }
        
        try {
          let handler = await loadHandler(false);
          if (!handler) handler = await loadHandler(true);
          if (handler) {
            const out = await handler(req);
            return withCors(asResponse(out));
          }
          
          // Handler unavailable - categorize error type
          const errorMessage = lastLoadError?.message ?? "index.js failed to load";
          
          // CRITICAL: Distinguish boot errors from runtime validation errors
          const isBootError = FAST_BOOT_SYNC.bootErrors.some(msg => errorMessage.includes(msg));
          const isValidationError = errorMessage.includes('Missing required field') || 
                                   errorMessage.includes('MISSING_STORY_CONTENT') ||
                                   errorMessage.includes('NO_STORY_CONTENT');
          
          // Only retry boot errors, not validation or runtime errors
          if (isBootError && attempt < FAST_BOOT_SYNC.maxRetries) {
            const delay = FAST_BOOT_SYNC.delays[attempt];
            console.warn(`🔄 [TEMPLATE_AB] Boot error retry ${attempt + 1}/${FAST_BOOT_SYNC.maxRetries} in ${delay}ms: ${errorMessage}`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          // Return appropriate error based on category with correct HTTP status
          const errorType = isBootError ? "BOOT_ERROR" : 
                          isValidationError ? "VALIDATION_ERROR" : 
                          "HANDLER_UNAVAILABLE";
          const httpStatus = isBootError ? 503 : isValidationError ? 400 : 502;
          
          return withCors(new Response(JSON.stringify({
            success: false,
            error: errorType,
            message: errorMessage,
            service: SERVICE_NAME,
            timestamp: new Date().toISOString(),
          }), { status: httpStatus, headers: { "Content-Type": "application/json" } }));
          
        } catch (handlerError: any) {
          const errorMessage = handlerError?.message ?? String(handlerError);
          
          // CRITICAL: Distinguish boot errors from runtime validation errors
          const isBootError = FAST_BOOT_SYNC.bootErrors.some(msg => errorMessage.includes(msg));
          const isValidationError = errorMessage.includes('Missing required field') || 
                                   errorMessage.includes('MISSING_STORY_CONTENT') ||
                                   errorMessage.includes('NO_STORY_CONTENT');
          
          // Only retry boot errors
          if (isBootError && attempt < FAST_BOOT_SYNC.maxRetries) {
            const delay = FAST_BOOT_SYNC.delays[attempt];
            console.warn(`🔄 [TEMPLATE_AB] Boot error retry ${attempt + 1}/${FAST_BOOT_SYNC.maxRetries} in ${delay}ms: ${errorMessage}`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          // Return appropriate error based on category with correct HTTP status
          const errorType = isBootError ? "BOOT_ERROR" : 
                          isValidationError ? "VALIDATION_ERROR" : 
                          "HANDLER_ERROR";
          const httpStatus = isBootError ? 503 : isValidationError ? 400 : 502;
          
          return withCors(new Response(JSON.stringify({
            success: false,
            error: errorType,
            message: errorMessage,
            service: SERVICE_NAME,
            timestamp: new Date().toISOString(),
          }), { status: httpStatus, headers: { "Content-Type": "application/json" } }));
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