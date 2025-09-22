// Clean Deploy: 2025-01-30T12:00:00Z - Force GitHub refresh
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { handleHealthAndCors } from "../_shared/healthCors.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "600",
};

serve(async (req) => {
  // Handle CORS and health checks
  const healthResponse = handleHealthAndCors(req);
  if (healthResponse) return healthResponse;

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
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    return new Response(
      JSON.stringify({ 
        success: true, 
        audio_base64: base64Audio,
        voice_id: voiceId,
        model_id: modelId
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in elevenlabs-tts-smart:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});