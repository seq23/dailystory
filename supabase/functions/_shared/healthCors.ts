/**
 * Enhanced CORS handling with origin reflection and header mirroring
 * Fixes Charlotte speech preflight failures
 */

type CorsOptions = {
  allowOrigins?: string[]; // if unset, reflect any Origin
  allowCredentials?: boolean; // default false
  allowMethods?: string[]; // default below
  allowHeaders?: string[];  // if unset, mirror Access-Control-Request-Headers
  maxAgeSeconds?: number;   // default 600
};

export function buildCorsHeaders(req: Request, opts: CorsOptions = {}) {
  const origin = req.headers.get("Origin") ?? "";
  const {
    allowOrigins,
    allowCredentials = false,
    allowMethods = ["GET","POST","OPTIONS","HEAD"],
    allowHeaders,
    maxAgeSeconds = 600,
  } = opts;

  const h = new Headers();

  // Origin handling
  if (allowOrigins && allowOrigins.length > 0) {
    const allowed = allowOrigins.includes(origin) ? origin : allowOrigins[0];
    h.set("Access-Control-Allow-Origin", allowed);
    h.set("Vary", "Origin");
  } else if (origin) {
    // reflect arbitrary origin
    h.set("Access-Control-Allow-Origin", origin);
    h.set("Vary", "Origin");
  } else {
    // no origin -> fallback to *
    h.set("Access-Control-Allow-Origin", "*");
  }

  if (allowCredentials) h.set("Access-Control-Allow-Credentials", "true");

  h.set("Access-Control-Allow-Methods", allowMethods.join(", "));
  h.set("Access-Control-Max-Age", String(maxAgeSeconds));

  // Allow-Headers: mirror requested or use provided list
  const reqHdrs = req.headers.get("Access-Control-Request-Headers");
  if (allowHeaders && allowHeaders.length) {
    h.set("Access-Control-Allow-Headers", allowHeaders.join(", "));
  } else if (reqHdrs) {
    h.set("Access-Control-Allow-Headers", reqHdrs);
    h.append("Vary", "Access-Control-Request-Headers");
  } else {
    // sensible default for typical TTS/fetch flows
    h.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Range, x-client-info, apikey");
  }

  // Always helpful
  h.set("Accept-Ranges", "bytes");

  return h;
}

export function withCors(
  handler: (req: Request) => Promise<Response> | Response,
  opts?: CorsOptions
) {
  return async (req: Request): Promise<Response> => {
    const method = req.method.toUpperCase();
    const url = new URL(req.url);

    // Health endpoints: respond quickly to HEAD
    if (method === "HEAD" && (url.pathname === "/health" || url.pathname === "/")) {
      return new Response(null, { status: 204, headers: buildCorsHeaders(req, opts) });
    }

    // Preflight: no body, always 204
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: buildCorsHeaders(req, opts) });
    }

    try {
      const res = await handler(req);
      // Merge CORS headers on success
      const cors = buildCorsHeaders(req, opts);
      const merged = new Headers(res.headers);
      cors.forEach((v, k) => merged.set(k, v));
      return new Response(res.body, { status: res.status, headers: merged });
    } catch (err: any) {
      // Ensure errors still have CORS headers
      const cors = buildCorsHeaders(req, opts);
      cors.set("Content-Type", "application/json");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "internal_error", 
        detail: String(err?.message ?? err) 
      }), {
        status: 500,
        headers: cors
      });
    }
  };
}

// Legacy compatibility exports
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
  "Access-Control-Max-Age": "600",
  "Vary": "Origin"
};

export function handleHealthAndCors(req: Request): Response | null {
  const url = new URL(req.url);
  
  // Handle OPTIONS preflight instantly
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: buildCorsHeaders(req) });
  }
  
  // Handle HEAD /health without auth
  if (req.method === "HEAD" && (url.pathname === "/health" || url.pathname === "/")) {
    return new Response(null, { status: 204, headers: buildCorsHeaders(req) });
  }
  
  // Handle GET /health for compatibility
  if (req.method === "GET" && (url.pathname === "/health" || url.pathname === "/")) {
    return new Response(JSON.stringify({ ok: true }), { 
      status: 200, 
      headers: { 
        ...Object.fromEntries(buildCorsHeaders(req)),
        "Content-Type": "application/json"
      }
    });
  }
  
  return null; // Let function continue with normal logic
}