// Shared CORS utility for all edge functions - Enhanced for comprehensive browser support
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, accept, origin, user-agent, cache-control, pragma, expires, if-modified-since, if-none-match',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Expose-Headers': 'content-length, date, server, x-ratelimit-limit, x-ratelimit-remaining, x-ratelimit-reset',
  'Vary': 'Origin'
};

export function createCorsResponse(data: any, status = 200): Response {
  const headers = { 
    ...corsHeaders, 
    'Content-Type': 'application/json' 
  };
  
  return new Response(JSON.stringify(data), { status, headers });
}

export function createCorsErrorResponse(error: string | Error, status = 500): Response {
  const errorMessage = error instanceof Error ? error.message : error;
  console.error('Edge function error:', errorMessage);
  
  return createCorsResponse({ 
    success: false, 
    error: errorMessage 
  }, status);
}

export function createCorsOptionsResponse(): Response {
  return new Response(null, { headers: corsHeaders });
}

export { corsHeaders };