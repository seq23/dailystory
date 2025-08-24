import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { CharacterConsistencyService } from '../_shared/CharacterConsistencyService.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`🗑️ Clear Character Cache: ${req.method} ${req.url}`)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Use existing CharacterConsistencyService instead of non-existent UnifiedCharacterConsistency
    const characterService = new CharacterConsistencyService();
    const result = characterService.clearServerState();
    
    console.log('🎭 Character cache cleared:', result)

    return new Response(JSON.stringify({
      success: true,
      cleared: true,
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