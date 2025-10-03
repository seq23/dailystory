// DEPLOY_MARKER: 2025-10-03T02:00:00Z - Option A static import pattern (bulletproof receptionist)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import handleRequest from "./index.js";
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

// Option A: Static import eliminates all boot sync issues

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
      const DEPLOY_MARKER = "2025-10-03T02:00:00Z";
      const payload = {
        status: "healthy",
        service: SERVICE_NAME,
        tier: "2.5A/2.5B",
        timestamp: new Date().toISOString(),
        deployment_version: DEPLOY_MARKER,
        handlerCached: true, // Static import = always available
        lastError: null,
        capabilities: ["character_consistency", "visual_tracking", "cultural_enhancement"]
      };
      return withCors(new Response(JSON.stringify(payload), { status: 200, headers: { "Content-Type": "application/json" } }));
    }

    // Any other HEAD → 200, empty body
    if (req.method === "HEAD") {
      return withCors(new Response(null, { status: 200, headers: { "Cache-Control": "no-store", "Content-Length": "0" } }));
    }

    // POST → direct handler invocation (static import = no boot sync needed)
    if (req.method === "POST") {
      try {
        const out = await handleRequest(req);
        return withCors(asResponse(out));
      } catch (handlerError: any) {
        const errorMessage = handlerError?.message ?? String(handlerError);
        console.error(`❌ Handler execution error: ${errorMessage}`);
        
        return withCors(new Response(JSON.stringify({
          success: false,
          error: "HANDLER_ERROR",
          message: errorMessage,
          service: SERVICE_NAME,
          timestamp: new Date().toISOString(),
        }), { status: 500, headers: { "Content-Type": "application/json" } }));
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