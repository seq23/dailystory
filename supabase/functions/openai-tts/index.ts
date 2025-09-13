import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('OpenAI TTS function called');
    const { text, voice = "nova", speed = 1.0 } = await req.json()
    
    console.log(`TTS Function called: voice=${voice}, speed=${speed}, textLength=${text?.length}`)
    console.log(`Request text preview: "${text?.substring(0, 100)}..."`)
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    console.log(`OpenAI API key configured: ${openaiApiKey ? 'YES' : 'NO'}`)
    
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured')
      throw new Error('OpenAI API key not configured')
    }

    console.log('Making request to OpenAI API...')
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd', // Use high-definition model for better quality
        input: text,
        voice: voice, // alloy, echo, fable, onyx, nova, shimmer
        speed: speed, // This is the key parameter for speed control
        response_format: 'mp3'
      }),
    })

    console.log(`OpenAI API response status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`OpenAI API error: ${response.status} ${response.statusText}`, errorText)
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const audioBuffer = await response.arrayBuffer()
    console.log(`TTS Success: Generated ${audioBuffer.byteLength} bytes of audio`)
    
    // Convert audio buffer to base64 safely to avoid stack overflow
    const uint8Array = new Uint8Array(audioBuffer)
    const chunks = []
    const chunkSize = 32768 // Process in 32KB chunks to avoid stack overflow
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize)
      chunks.push(String.fromCharCode(...Array.from(chunk)))
    }
    
    const base64Audio = btoa(chunks.join(''))
    
    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )

  } catch (error) {
    console.error('TTS Error Details:', error)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})