// Redeploy touch: 2025-09-12T18:45:32Z - Force complete rebuild
console.log("[clear-character-cache] Loaded: 2025-09-12T18:45:32Z");
import { serve } from "https://deno.land/std@0.168.0/http/server.js";

// ============= LAZY LOADING FUNCTIONS FOR HEAVY DEPENDENCIES =============

async function getCharacterService() {
  try {
    const { CharacterConsistencyService } = await import("../_shared/CharacterConsistencyService.js");
    return CharacterConsistencyService;
  } catch (error) {
    console.warn('CharacterService lazy load failed:', error);
    return null;
  }
}

// Inline CORS utilities to fix boot failure
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  console.log(`🗑️ Clear Character Cache: ${req.method} ${req.url}`)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Force deployment sync - 2025-01-30

  try {
    // Use database-backed CharacterConsistencyService with lazy loading
    const CharacterConsistencyService = await getCharacterService();
    if (!CharacterConsistencyService) {
      throw new Error('CharacterConsistencyService not available');
    }

    const characterService = new CharacterConsistencyService();
    const result = await characterService.clearServerState();
    
    console.log('🎭 Character cache cleared:', result)

    return new Response(JSON.stringify({
      success: true,
      cleared: result.cleared,
      message: result.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Error clearing character cache:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Failed to clear character cache'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})