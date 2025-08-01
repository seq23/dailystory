import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('=== OpenAI TTS function START ===')
  
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request received')
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('Processing POST request...')

  try {
    console.log('Step 1: Reading request body')
    const body = await req.json()
    console.log('Step 2: Body parsed successfully:', JSON.stringify(body))
    
    const { text, voice = "nova", speed = 1.0 } = body
    console.log(`Step 3: Extracted params - voice: ${voice}, speed: ${speed}, text length: ${text?.length}`)
    
    if (!text) {
      console.log('Step 4: No text provided')
      throw new Error('Text is required')
    }
    
    console.log('Step 5: Checking OpenAI API key')
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    console.log(`Step 6: API key status - ${openaiApiKey ? 'PRESENT' : 'MISSING'}`)
    
    if (!openaiApiKey) {
      console.log('Step 7: API key missing, throwing error')
      throw new Error('OpenAI API key not configured')
    }

    console.log('Step 8: Making OpenAI API request')
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice,
        speed: speed,
        response_format: 'mp3'
      }),
    })

    console.log(`Step 9: OpenAI response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.log(`Step 10: OpenAI error - ${response.status}: ${errorText}`)
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    console.log('Step 11: Converting audio to base64')
    const audioBuffer = await response.arrayBuffer()
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)))
    
    console.log(`Step 12: Success! Audio size: ${audioBuffer.byteLength} bytes, base64 length: ${base64Audio.length}`)
    
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
    console.log('=== ERROR OCCURRED ===')
    console.log('Error details:', error)
    console.log('Error message:', error?.message)
    console.log('Error stack:', error?.stack)
    
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Unknown error',
        step: 'Function execution failed'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})