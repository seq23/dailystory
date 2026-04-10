// Enhanced ElevenLabs TTS Smart — Flash v2.5 + persistent cache + latency optimization
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { UniversalLKGCache } from '../_shared/UniversalLKGCache.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
  'Access-Control-Max-Age': '600',
  'Vary': 'Origin, Access-Control-Request-Headers',
};

// --- Persistent TTS Cache helpers ---
async function getSupabaseClient() {
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.57.4');
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

async function hashText(text: string, voice: string, model: string): Promise<string> {
  const data = new TextEncoder().encode(`${text}|${voice}|${model}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getCachedAudio(hash: string): Promise<string | null> {
  try {
    const sb = await getSupabaseClient();
    const path = `audio/${hash}.mp3`;
    const { data, error } = await sb.storage.from('tts-cache').download(path);
    if (error || !data) return null;
    
    const buffer = await data.arrayBuffer();
    const uint8 = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 32768;
    for (let i = 0; i < uint8.length; i += chunkSize) {
      const chunk = uint8.slice(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    return btoa(binary);
  } catch {
    return null;
  }
}

async function setCachedAudio(hash: string, audioBuffer: ArrayBuffer): Promise<void> {
  try {
    const sb = await getSupabaseClient();
    const path = `audio/${hash}.mp3`;
    await sb.storage.from('tts-cache').upload(path, audioBuffer, {
      contentType: 'audio/mpeg',
      upsert: true,
    });
    console.log(`💾 Cached audio: ${path}`);
  } catch (e) {
    console.warn('Cache write failed (non-blocking):', e);
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  
  try {
    const response = await handle(req);
    const headers = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      if (!headers.has(key)) headers.set(key, value);
    });
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  } catch (error) {
    console.error("Error in elevenlabs-tts-smart:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        useFallback: true,
        error: error instanceof Error ? error.message : 'TTS unavailable' 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handle(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  if (url.pathname === "/" || url.pathname === "/health") {
    return new Response(JSON.stringify({ ok: true, service: "elevenlabs-tts-smart" }), {
      status: 200, headers: { "Content-Type": "application/json" }
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405, headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { text, voice_id, model_id, voice_settings, session_id: clientSessionId } = await req.json();
    
    if (!text) throw new Error("Text is required");

    const elevenLabsApiKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!elevenLabsApiKey) throw new Error("ElevenLabs API key not configured");

    const voiceId = voice_id || "21m00Tcm4TlvDq8ikWAM";
    // Default to Flash v2.5 — 50% cheaper than previous default
    const modelId = model_id || "eleven_flash_v2_5";

    // --- TIER 1: Persistent Supabase Storage cache ---
    const cacheHash = await hashText(text, voiceId, modelId);
    const persistentCached = await getCachedAudio(cacheHash);
    
    if (persistentCached) {
      console.log(`♻️ [PERSISTENT] Cache HIT for ${cacheHash.substring(0, 12)}... (${text.length} chars)`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          audio_base64: persistentCached,
          voice_id: voiceId,
          model_id: modelId,
          fromCache: true
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // --- TIER 2: In-memory LKG cache ---
    const requestHash = UniversalLKGCache.createRequestHash({
      pageText: text.substring(0, 100),
      storyText: text.substring(0, 200),
      userInfo: { voiceId, modelId },
      sessionId: clientSessionId || 'tts-unknown',
      pageNumber: 1
    });
    
    const cachedAudio = UniversalLKGCache.getLKG(requestHash, 'elevenlabs-tts-smart');
    if (cachedAudio && cachedAudio.audio_base64) {
      console.log('♻️ [LKG] Cache HIT — returning in-memory cached audio');
      return new Response(
        JSON.stringify({ 
          success: true, 
          audio_base64: cachedAudio.audio_base64,
          voice_id: cachedAudio.voice_id || voiceId,
          model_id: cachedAudio.model_id || modelId,
          fromLKG: true
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    
    console.log('🔄 Cache MISS — generating via ElevenLabs Flash v2.5');

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
        optimize_streaming_latency: 3,  // Reduce compute overhead ~10-20%
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(audioBuffer);
    let binaryString = '';
    const chunkSize = 32768;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64Audio = btoa(binaryString);

    // Warm both caches (fire-and-forget for persistent)
    setCachedAudio(cacheHash, audioBuffer);
    
    UniversalLKGCache.warmFromSuccess(
      requestHash,
      { audio_base64: base64Audio, voice_id: voiceId, model_id: modelId },
      'ELEVENLABS_TTS',
      'elevenlabs-tts-smart'
    );
    console.log('💾 Both caches warmed');

    // Track cost — Flash v2.5 is ~$0.11/1K chars
    try {
      const characterCount = text.length;
      const cost = (characterCount / 1000) * 0.11;
      const sb = await getSupabaseClient();

      await sb.from('cost_tracking').insert({
        session_id: clientSessionId || 'elevenlabs-unknown',
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
        unit_cost: 0.11 / 1000
      });
      console.log(`💰 Cost tracked: $${cost.toFixed(6)} for ${characterCount} chars (Flash v2.5)`);
    } catch (error) {
      console.warn('Failed to track cost:', error);
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
    throw error;
  }
}