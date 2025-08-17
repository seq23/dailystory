import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voiceId = 'XB0fDUnXU5powFXDhCwa', context = 'conversation' } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'ElevenLabs API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔊 Smart TTS Request: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}" [Context: ${context}] [Length: ${text.length}]`);

    // Prepare request body - removed lexicon entirely to improve reliability
    const requestBody: any = {
      text,
      model_id: "eleven_turbo_v2_5",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.2,
        use_speaker_boost: true
      }
    };

    // Skip lexicon entirely to improve reliability
    console.log(`💬 ${context === 'learning' ? 'Learning' : 'Conversation'} context: Using natural pronunciation`);
    // Note: Removed pronunciation_dictionary_locators to fix recurring failures

    let response;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey
          },
          body: JSON.stringify(requestBody)
        });

        if (response.ok) {
          break; // Success, exit retry loop
        }
        
        const errorText = await response.text();
        console.error(`❌ ElevenLabs API Error (attempt ${retryCount + 1}):`, errorText);
        
        retryCount++;
        if (retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 2s, 4s, 8s
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (networkError) {
        console.error(`❌ Network error (attempt ${retryCount + 1}):`, networkError);
        retryCount++;
        if (retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    if (!response || !response.ok) {
      return new Response(
        JSON.stringify({ error: 'ElevenLabs API failed after retries', retries: retryCount }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    
    console.log(`✅ Smart TTS Success: ${audioBuffer.byteLength} bytes [Context: ${context}]`);
    
    return new Response(JSON.stringify({ 
      audioContent: base64Audio,
      context,
      voiceId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Smart TTS Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});