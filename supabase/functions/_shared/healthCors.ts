/**
 * HEALTH CORS - Standardized CORS headers and health endpoint handler
 * Part of ERROR-001 fix: Eliminates CORS preflight issues in health probes
 */

/**
 * Standardized CORS headers - consistent across all edge functions
 * Max-Age=600 (10 minutes) for preflight caching
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
  "Access-Control-Max-Age": "600", // 10 minute preflight cache
  "Vary": "Origin"
};

/**
 * Wraps any Response with standardized CORS headers
 * 
 * @param res - Response to wrap (optional, defaults to 204)
 * @returns Response with CORS headers applied
 */
export function withCors(res?: Response): Response {
  const response = res ?? new Response(null, { status: 204 });
  const headers = new Headers(response.headers || {});
  
  // Apply all CORS headers
  for (const [key, value] of Object.entries(corsHeaders)) {
    headers.set(key, value);
  }
  
  return new Response(response.body, { 
    status: response.status, 
    headers 
  });
}

/**
 * Handles OPTIONS preflight requests instantly with proper caching
 * 
 * @returns Response - 204 with CORS headers and 10-minute cache
 */
export function handleOptionsPreflght(): Response {
  return withCors(new Response(null, { status: 204 }));
}

/**
 * Handles HEAD /health requests without triggering preflights
 * 
 * @param requestId - Optional request ID for tracking
 * @returns Response - 200 with minimal headers, no auth required
 */
export function handleHealthEndpoint(requestId?: string): Response {
  const id = requestId || crypto.randomUUID();
  
  const response = new Response(null, { 
    status: 200,
    headers: { 
      "x-req-id": id,
      "x-health": "true", // For easy log filtering
      "Cache-Control": "no-store" // Never cache health checks
    }
  });
  
  return withCors(response);
}

/**
 * Unified request router for health and CORS handling
 * Use this at the top of every edge function
 * 
 * @param req - Incoming request
 * @returns Response | null - Returns Response if handled, null to continue
 */
export function handleHealthAndCors(req: Request): Response | null {
  const url = new URL(req.url);
  
  // Handle OPTIONS preflight instantly
  if (req.method === "OPTIONS") {
    return handleOptionsPreflght();
  }
  
  // Handle HEAD /health without auth
  if (req.method === "HEAD" && url.pathname === "/health") {
    return handleHealthEndpoint();
  }
  
  // Handle GET /health for compatibility
  if (req.method === "GET" && url.pathname === "/health") {
    return handleHealthEndpoint();
  }
  
  return null; // Let function continue with normal logic
}

/**
 * Standard error response with CORS headers
 * 
 * @param error - Error message or object
 * @param status - HTTP status code
 * @param requestId - Optional request ID
 * @returns Response - JSON error with CORS headers
 */
export function createErrorResponse(
  error: string | object, 
  status: number = 500,
  requestId?: string
): Response {
  const id = requestId || crypto.randomUUID();
  
  const errorResponse = new Response(
    JSON.stringify({
      error: typeof error === 'string' ? error : error,
      requestId: id,
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "x-req-id": id
      }
    }
  );
  
  return withCors(errorResponse);
}