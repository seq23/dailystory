import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const SERVICE_NAME = "ai-visual-scene-creator";

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

// Dynamic handler loader (cached + backoff)
type HandlerFn = (req: Request) => Promise<Response> | Response;
let cachedHandler: HandlerFn | null = null;
let lastLoadError: { at: number; message: string } | null = null;
const BACKOFF_MS = 15_000;
async function loadHandler(allowRetry = false): Promise<HandlerFn | null> {
  if (cachedHandler) return cachedHandler;
  const now = Date.now();
  if (lastLoadError && now - lastLoadError.at < BACKOFF_MS && !allowRetry) return null;
  try {
    const mod = await import("./index.js");
    const fn = (mod as any)?.default as HandlerFn | undefined;
    if (typeof fn !== "function") throw new Error("Handler default export not a function");
    cachedHandler = fn;
    lastLoadError = null;
    return cachedHandler;
  } catch (err: any) {
    lastLoadError = { at: Date.now(), message: err?.message ?? String(err) };
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

    // POST → load handler (with backoff), delegate or clean 503
    if (req.method === "POST") {
      let handler = await loadHandler(false);
      if (!handler) handler = await loadHandler(true);
      if (!handler) {
        return withCors(new Response(JSON.stringify({
          error: "HANDLER_UNAVAILABLE",
          message: lastLoadError?.message ?? "index.js failed to load",
          service: SERVICE_NAME,
          timestamp: new Date().toISOString(),
        }), { status: 503, headers: { "Content-Type": "application/json" } }));
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