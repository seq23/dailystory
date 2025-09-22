// DEPLOY_MARKER: 2025-09-21T00:00:00Z - STATIC IMPORT + DEFENSIVE CORS V4.2
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import handleRequest from "./index.js";

const SERVICE_NAME = "runware-template-cd";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
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

  // Health checks
  if (req.method === "GET" || req.method === "HEAD") {
    const url = new URL(req.url);
    const readyCheck = url.pathname.endsWith("/ready") || url.searchParams.has("ready");

    if (readyCheck) {
      const loaded = typeof handleRequest === "function";
      const res = new Response(null, { status: loaded ? 204 : 503 });
      return withCors(req.method === "HEAD" ? new Response(null, { status: res.status, headers: res.headers }) : res);
    }

    const payload = {
      status: "healthy",
      service: SERVICE_NAME,
      timestamp: new Date().toISOString(),
      handler_loaded: typeof handleRequest === "function",
      environment: {
        hasRunwareKey: !!Deno.env.get('RUNWARE_API_KEY'),
        hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL')
      }
    };

    const res = new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    // HEAD gets headers/status only
    return withCors(req.method === "HEAD" ? new Response(null, { status: res.status, headers: res.headers }) : res);
  }

  // POST handling
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
});

console.log(`🎯 [${SERVICE_NAME}] Static Import Architecture V4.2 initialized`);
console.log(`🔒 [${SERVICE_NAME}] No more sync anomalies - bulletproof pattern active`);