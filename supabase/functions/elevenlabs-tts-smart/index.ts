// Enhanced CORS-compliant ElevenLabs TTS with preflight fix
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { withCors } from "../_shared/healthCors.ts";

const corsWrapped = withCors(handle, {
  allowCredentials: false,
  allowMethods: ["GET","POST","OPTIONS","HEAD"]
});

serve(corsWrapped);

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