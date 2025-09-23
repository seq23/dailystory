// DEPLOY_MARKER: 2025-09-21T00:00:00Z - STATIC IMPORT + DEFENSIVE CORS V4.2
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SERVICE_NAME = "ai-visual-scene-creator";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Max-Age": "600",
  "Vary": "Origin",
};

function withCors(res: Response): Response {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(corsHeaders)) headers.set(k, v);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

// Accept Response | object | string | null/undefined
function asResponse(maybe: unknown, fallbackStatus = 204): Response {
  if (maybe instanceof Response) return maybe;
  if (maybe === null || maybe === undefined) return new Response(null, { status: fallbackStatus });
  if (typeof maybe === "string") {
    return new Response(maybe, { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  // object / number / boolean → JSON
  return new Response(JSON.stringify(maybe), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") return withCors(new Response(null, { status: 204 }));

  // Ultra-fast health endpoint (load balancer probe)
  if (req.method === "HEAD" && new URL(req.url).pathname === "/health") {
    return withCors(new Response(null, { 
      status: 200, 
      headers: { 
        'Cache-Control': 'no-store',
        'x-health': 'true' 
      }
    }));
  }

  // Health checks
  if (req.method === "GET" || req.method === "HEAD") {
    const url = new URL(req.url);
    const readyCheck = url.pathname.endsWith("/ready") || url.searchParams.has("ready");

    if (readyCheck) {
      try {
        const { default: handleRequest } = await import("./index.js");
        const loaded = typeof handleRequest === "function";
        const res = new Response(null, { status: loaded ? 204 : 503 });
        return withCors(req.method === "HEAD" ? new Response(null, { status: res.status, headers: res.headers }) : res);
      } catch {
        const res = new Response(null, { status: 503 });
        return withCors(req.method === "HEAD" ? new Response(null, { status: res.status, headers: res.headers }) : res);
      }
    }

    let handlerLoaded = false;
    try {
      const { default: handleRequest } = await import("./index.js");
      handlerLoaded = typeof handleRequest === "function";
    } catch {
      handlerLoaded = false;
    }

    const payload = {
      status: "healthy",
      service: SERVICE_NAME,
      timestamp: new Date().toISOString(),
      handler_loaded: handlerLoaded,
      environment: {
        SUPABASE_URL: Deno.env.get('SUPABASE_URL') ? 'configured' : 'missing',
        SUPABASE_ANON_KEY: Deno.env.get('SUPABASE_ANON_KEY') ? 'configured' : 'missing'
      }
    };

    const res = new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    // HEAD gets headers/status only
    return withCors(req.method === "HEAD" ? new Response(null, { status: res.status, headers: res.headers }) : res);
  }

  // POST handling with dynamic import
  try {
    const { default: handleRequest } = await import("./index.js");
    
    try {
      const out = await handleRequest(req);
      return withCors(asResponse(out));
    } catch (error) {
      console.error(`❌ [${SERVICE_NAME}] Unhandled error:`, error);
      const errRes = new Response(
        JSON.stringify({
          error: "Internal server error",
          message: error?.message ?? String(error),
          service: SERVICE_NAME,
          timestamp: new Date().toISOString(),
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
      return withCors(errRes);
    }
  } catch (importError) {
    console.error(`❌ [${SERVICE_NAME}] Import error:`, importError);
    const errRes = new Response(
      JSON.stringify({
        error: "Service temporarily unavailable",
        message: "Handler module not available",
        service: SERVICE_NAME,
        timestamp: new Date().toISOString(),
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
    return withCors(errRes);
  }
});

console.log(`🎯 [${SERVICE_NAME}] Static Import Architecture V4.2 initialized`);
console.log(`🔒 [${SERVICE_NAME}] No more sync anomalies - bulletproof pattern active`);