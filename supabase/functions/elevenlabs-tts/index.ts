import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('ElevenLabs TTS function called');
    const { text, voice, model } = await req.json();
    
    console.log('TTS Request details:', {
      textLength: text?.length,
      voice: voice,
      model: model,
      textPreview: text?.substring(0, 50) + '...'
    });

    if (!text) {
      throw new Error('Text is required');
    }

    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    console.log('ElevenLabs API Key configured:', elevenLabsApiKey ? 'YES' : 'NO');
    if (!elevenLabsApiKey) {
      console.error('ELEVENLABS_API_KEY environment variable is not set');
      throw new Error('ElevenLabs API key not configured');
    }

    // Generate speech using ElevenLabs API with enhanced defaults (Charlotte, Turbo v2.5)
    const DEFAULT_VOICE = 'XB0fDUnXU5powFXDhCwa'; // Charlotte
    const DEFAULT_MODEL = 'eleven_turbo_v2_5';
    const effectiveVoice = (voice && String(voice).trim().length > 0) ? voice : DEFAULT_VOICE;
    const effectiveModel = (model && String(model).trim().length > 0) ? model : DEFAULT_MODEL;

    const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${effectiveVoice}`;
    console.log('Making request to ElevenLabs:', apiUrl);
    
    const requestBody = {
      text: String(text).slice(0, 1000), // Limit text length
      model_id: effectiveModel, // Low-latency, high quality
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.2,
        use_speaker_boost: true
      }
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error details:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
        requestBody: JSON.stringify(requestBody),
        url: apiUrl
      });
      
      // Return detailed error in JSON format
      return new Response(JSON.stringify({ 
        error: `ElevenLabs API error: ${response.status} - ${errorText}`,
        status: response.status,
        details: errorText
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return audio data as base64-encoded JSON for better compatibility
    const audioData = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioData)));
    
    console.log('Successfully generated audio:', {
      size: audioData.byteLength,
      contentType: response.headers.get('content-type'),
      base64Length: base64Audio.length
    });
    
    return new Response(JSON.stringify({ 
      audio: base64Audio,
      contentType: 'audio/mpeg',
      size: audioData.byteLength 
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error in elevenlabs-tts function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});