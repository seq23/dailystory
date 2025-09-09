/**
 * CORS Utilities for Edge Functions
 * Provides standardized CORS response helpers
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

/**
 * Creates a successful JSON response with CORS headers
 */
export function createCorsResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Creates an error response with CORS headers
 */
export function createCorsErrorResponse(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Creates a response for OPTIONS preflight requests
 */
export function createCorsOptionsResponse() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}