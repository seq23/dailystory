// DEPLOY_MARKER: 2025-09-26T17:15:00Z - Force fresh Supabase snapshot to fix Module not found
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const SERVICE_NAME = "runware-generate-image";

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

// LKG serve-stale pattern to eliminate BOOT_SYNC_ANOMALY
type HandlerFn = (req: Request) => Promise<Response> | Response;
let cachedHandler: HandlerFn | null = null;
let LKG: HandlerFn | null = null;
let lastLoadError: { at: number; message: string; attempt: number } | null = null;
let isLoading = false;
const BACKOFF_MS = 2_000;
const MAX_RETRIES = 3;


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
    // Robust URL import (single path)
    console.log(`🔍 Attempting URL import: new URL("./index.js", import.meta.url).href`);
    const mod = await import(new URL("./index.js", import.meta.url).href);
    const fn = (mod as any)?.default as HandlerFn | undefined;
    
    if (typeof fn !== "function") {
      throw new Error("Handler default export not a function - boot sync error");
    }
    
    cachedHandler = fn;
    LKG = fn; // Store last-known-good handler
    lastLoadError = null;
    isLoading = false;
    
    console.log(`✅ Handler loaded successfully via URL_IMPORT`);
    return cachedHandler;
    
  } catch (err: any) {
    const attempt = (lastLoadError?.attempt || 0) + 1;
    lastLoadError = { 
      at: Date.now(), 
      message: `${err?.message ?? String(err)}${err?.stack ? ` | Stack: ${String(err.stack).slice(0, 500)}` : ''}`,
      attempt 
    };
    isLoading = false;
    
    console.error(`❌ Handler load failed (attempt ${attempt}/${MAX_RETRIES}):`, err?.message);
    
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
      const payload = {
        status: "healthy",
        service: SERVICE_NAME,
        timestamp: new Date().toISOString(),
        handler_cached: !!cachedHandler,
        last_error: lastLoadError?.message ?? null,
      };
      return withCors(new Response(JSON.stringify(payload), { status: 200, headers: { "Content-Type": "application/json" } }));
    }

    // Any other HEAD → 200, empty body
    if (req.method === "HEAD") {
      return withCors(new Response(null, { status: 200, headers: { "Cache-Control": "no-store", "Content-Length": "0" } }));
    }

    // POST → load handler (with LKG fallback)
    if (req.method === "POST") {
      let handler = await loadHandler(false);
      if (!handler) handler = await loadHandler(true);
      if (!handler && LKG) {
        console.warn(`⚠️ Import failed; serving LKG handler`);
        const out = await LKG(req);
        return withCors(asResponse(out));
      }
      if (!handler) {
        const errorBody = {
          success: false,
          error: "HANDLER_UNAVAILABLE",
          message: lastLoadError?.message ?? "index.js failed to load",
          service: SERVICE_NAME,
          timestamp: new Date().toISOString(),
          escalation: "TIER_2_5C",
          escalationTarget: "TIER_2_5C"
        };
        return withCors(new Response(JSON.stringify(errorBody), { 
          status: 503, 
          headers: { "Content-Type": "application/json", "X-Escalate": "TIER_2_5C" } 
        }));
      }
      const out = await handler(req);
      return withCors(asResponse(out));
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