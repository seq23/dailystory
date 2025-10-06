// Enhanced CORS-compliant ElevenLabs TTS with preflight fix
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
  'Access-Control-Max-Age': '600',
  'Vary': 'Origin, Access-Control-Request-Headers',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }
  
  try {
    const response = await handle(req);
    
    // Add CORS headers to response
    const headers = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      if (!headers.has(key)) {
        headers.set(key, value);
      }
    });
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  } catch (error) {
    console.error("Error in elevenlabs-tts-smart:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

async function handle(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  // Health endpoint
  if (url.pathname === "/" || url.pathname === "/health") {
    return new Response(JSON.stringify({ ok: true, service: "elevenlabs-tts-smart" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { text, voice_id, model_id, voice_settings } = await req.json();
    
    if (!text) {
      throw new Error("Text is required");
    }

    const elevenLabsApiKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!elevenLabsApiKey) {
      throw new Error("ElevenLabs API key not configured");
    }

    const voiceId = voice_id || "21m00Tcm4TlvDq8ikWAM";
    const modelId = model_id || "eleven_monolingual_v1";

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": elevenLabsApiKey,
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: voice_settings || {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(audioBuffer);
    let binaryString = '';
    const chunkSize = 32768; // Process in 32KB chunks
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64Audio = btoa(binaryString);

    // Track ElevenLabs cost for analytics
    try {
      const characterCount = text.length;
      // ElevenLabs pricing: approximately $0.22 per 1K characters for Turbo v2.5
      const cost = (characterCount / 1000) * 0.22;

      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.57.4');
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabaseClient.from('cost_tracking').insert({
        session_id: 'elevenlabs-session',
        user_id: null,
        input_tokens: 0,
        output_tokens: 0,
        cost: cost,
        model_used: modelId,
        operation_type: 'audio_generation',
        provider: 'elevenlabs',
        api_endpoint: `text-to-speech/${voiceId}`,
        pricing_model: 'characters', 
        quantity_used: characterCount,
        unit_cost: 0.22 / 1000
      });

      console.log(`💰 ElevenLabs cost tracked: $${cost.toFixed(6)} for ${characterCount} characters`);
    } catch (error) {
      console.warn('Failed to track ElevenLabs cost:', error);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        audio_base64: base64Audio,
        voice_id: voiceId,
        model_id: modelId
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in elevenlabs-tts-smart:", error);
    throw error; // Let withCors handle error response with proper CORS headers
  }
}