// Clean Deploy: 2025-01-30T12:00:00Z - Force GitHub refresh
console.log("[clear-character-cache] Loaded: 2025-09-12T18:45:32Z");
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ============= LAZY LOADING FUNCTIONS FOR HEAVY DEPENDENCIES =============

async function getCharacterService() {
  try {
    const { characterConsistencyService } = await import("#shared/CharacterConsistencyService.js");
    return characterConsistencyService;
  } catch (error) {
    console.warn('CharacterService lazy load failed:', error);
    return null;
  }
}

// Inline CORS utilities to fix boot failure
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Max-Age': '600',
};

async function handleRequest(req) {
  console.log(`🗑️ Clear Character Cache: ${req.method} ${req.url}`)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Force deployment sync - 2025-01-30

  try {
    const characterService = await getCharacterService();
    
    if (!characterService) {
      return new Response(JSON.stringify({ 
        error: 'Character service not available' 
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Clear character cache using correct method
    const result = await characterService.clearServerState();
    
    return new Response(JSON.stringify({ 
      status: 'success',
      message: 'Character cache cleared successfully',
      result: result
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('🗑️ Clear character cache error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Export for TypeScript receptionist
export default handleRequest;

// Maintain backward compatibility
serve(handleRequest);