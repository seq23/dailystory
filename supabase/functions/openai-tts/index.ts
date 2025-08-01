import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('OpenAI TTS function started')
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Parsing request body...')
    const requestBody = await req.text()
    console.log('Raw request body:', requestBody)
    
    let parsedBody
    try {
      parsedBody = JSON.parse(requestBody)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      throw new Error('Invalid JSON in request body')
    }
    
    const { text, voice = "nova", speed = 1.0 } = parsedBody
    
    console.log(`TTS Function called: voice=${voice}, speed=${speed}, textLength=${text?.length}`)
    console.log(`Request text preview: "${text?.substring(0, 100)}..."`)
    
    if (!text) {
      throw new Error('Text is required')
    }
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    console.log(`OpenAI API key configured: ${openaiApiKey ? 'YES' : 'NO'}`)
    console.log(`API key length: ${openaiApiKey?.length || 0}`)
    
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
        model: 'tts-1-hd',
        input: text,
        voice: voice,
        speed: speed,
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
    
    // Convert audio buffer to base64
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(audioBuffer))
    )
    
    console.log(`Base64 audio length: ${base64Audio.length}`)
    
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
    console.error('Error name:', error?.name)
    
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Unknown error',
        details: 'Check function logs for more information'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})