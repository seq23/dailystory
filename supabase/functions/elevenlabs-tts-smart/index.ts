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

    console.log(`🔊 Smart TTS Request: "${text}" [Context: ${context}]`);

    // Validate text length - Updated to 9,500 chars (safe under 10k ElevenLabs limit)
    // This allows 1,400-word stories (8,400 chars) to process without chunking
    if (text.length > 9500) {
      return new Response(
        JSON.stringify({ error: 'Text too long. Maximum 9,500 characters allowed.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare request body - only include lexicon for learning contexts
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

    // CRITICAL: Only apply lexicon for learning content, NOT for Charlotte's conversation
    if (context === 'learning') {
      console.log('📚 Learning context: Applying phonetic lexicon');
      requestBody.pronunciation_dictionary_locators = [{
        pronunciation_dictionary_id: "charlotte-learning-lexicon.txt",
        version_id: "latest"
      }];
    } else {
      console.log('💬 Conversation context: Using natural pronunciation');
      // No lexicon applied - Charlotte speaks naturally
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ElevenLabs API Error:', errorText);
      
      // Check for dictionary-specific errors
      const isDictionaryError = errorText.includes('pronunciation_dictionary') || 
                                errorText.includes('dictionary not found') ||
                                errorText.includes('charlotte-learning-lexicon');
      
      if (isDictionaryError && context === 'learning') {
        console.log('📚 Dictionary error detected, retrying without lexicon...');
        
        // Retry without dictionary
        const fallbackRequestBody = {
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.2,
            use_speaker_boost: true
          }
          // No pronunciation_dictionary_locators
        };
        
        const fallbackResponse = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            method: 'POST',
            headers: {
              'Accept': 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': apiKey,
            },
            body: JSON.stringify(fallbackRequestBody),
          }
        );
        
        if (fallbackResponse.ok) {
          console.log('✅ Fallback without dictionary succeeded');
          const audioArrayBuffer = await fallbackResponse.arrayBuffer();
          const base64Audio = btoa(
            String.fromCharCode(...new Uint8Array(audioArrayBuffer))
          );
          
          return new Response(
            JSON.stringify({ 
              audioContent: base64Audio,
              context,
              appliedLexicon: false,
              fallbackReason: 'Dictionary not available'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // If fallback also fails, throw error instead of returning error response in catch block
          throw new Error(`Fallback also failed: ${fallbackResponse.status}`);
        }
      }
      
      return new Response(
        JSON.stringify({ 
          error: `ElevenLabs API error: ${response.status}`,
          errorType: isDictionaryError ? 'dictionary' : 'api',
          details: errorText 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const audioArrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(audioArrayBuffer))
    );

    console.log(`✅ Smart TTS Success: ${audioArrayBuffer.byteLength} bytes [Context: ${context}]`);

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        context,
        appliedLexicon: context === 'learning'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Smart TTS Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});