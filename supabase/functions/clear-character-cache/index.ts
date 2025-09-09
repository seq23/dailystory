import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { CharacterConsistencyService } from '../_shared/CharacterConsistencyService.ts';

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
    // Use database-backed CharacterConsistencyService
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