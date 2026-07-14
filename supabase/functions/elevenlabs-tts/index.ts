// Clean Deploy: 2026-04-10 - Flash v2.5 + persistent cache + latency optimization
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  LANGUAGE_VOICE_MAP,
  CHARLOTTE_FALLBACK_ID,
  DEFAULT_ELEVENLABS_MODEL,
  TTS_MAX_CHARACTERS,
} from "../_shared/languageVoiceMap.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
  'Access-Control-Max-Age': '600',
  'Vary': 'Origin, Access-Control-Request-Headers',
};

async function getDifficultyMapper() {
  try {
    const mod = await import("../_shared/DifficultyLevelMapper.ts");
    return mod.DifficultyLevelMapper;
  } catch (error) {
    console.warn("DifficultyLevelMapper lazy load failed:", error);
    return null;
  }
}

interface WordTimestamp {
  word: string;
  start_time: number;
  end_time: number;
}

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
    const chunkSize = 8192;
    for (let i = 0; i < uint8.length; i += chunkSize) {
      const chunk = uint8.slice(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
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

async function resolveVoiceForLanguage(language?: string | null): Promise<{ voiceId: string; modelId: string; source: string }> {
  const code = (language || 'en').toLowerCase();
  // 1. DB override
  try {
    const sb = await getSupabaseClient();
    const { data } = await sb
      .from('voice_overrides')
      .select('voice_id, model_id')
      .eq('language_code', code)
      .maybeSingle();
    if (data?.voice_id) {
      return { voiceId: data.voice_id, modelId: data.model_id || DEFAULT_ELEVENLABS_MODEL, source: 'db_override' };
    }
  } catch (e) {
    console.warn('voice_overrides lookup failed (non-blocking):', e);
  }
  // 2. Hardcoded default
  const def = LANGUAGE_VOICE_MAP[code];
  if (def) return { voiceId: def.voiceId, modelId: def.modelId, source: 'default_map' };
  // 3. Final fallback
  return { voiceId: CHARLOTTE_FALLBACK_ID, modelId: DEFAULT_ELEVENLABS_MODEL, source: 'charlotte_fallback' };
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
    console.error("Error in elevenlabs-tts:", error);
    return new Response(
      JSON.stringify({ error: 'An internal error occurred' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handle(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  if (url.pathname === "/" || url.pathname === "/health") {
    return new Response(JSON.stringify({ ok: true, service: "elevenlabs-tts" }), {
      status: 200, headers: { "Content-Type": "application/json" }
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { "Content-Type": "application/json" }
    });
  }

  try {
    console.log('ElevenLabs TTS function called');
    const { text, voice, model, language, userInfo } = await req.json();
    
    if (userInfo) {
      const Mapper = await getDifficultyMapper();
      if (Mapper) {
        const difficulty = Mapper.mapToImageDifficulty(userInfo);
        console.log(`🎯 Mapped user info to difficulty: ${difficulty} for TTS generation`);
      }
    }

    if (!text) throw new Error('Text is required');

    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenLabsApiKey) throw new Error('ElevenLabs API key not configured');

    // Voice/model resolution:
    //   - Explicit `voice` from caller wins (backward compatible)
    //   - Otherwise resolve from `language` via voice_overrides table → default map → Charlotte
    let effectiveVoice: string;
    let effectiveModel: string;
    let voiceSource = 'explicit';
    if (voice && String(voice).trim().length > 0) {
      effectiveVoice = String(voice);
      effectiveModel = (model && String(model).trim().length > 0) ? String(model) : DEFAULT_ELEVENLABS_MODEL;
    } else {
      const resolved = await resolveVoiceForLanguage(language);
      effectiveVoice = resolved.voiceId;
      effectiveModel = (model && String(model).trim().length > 0) ? String(model) : resolved.modelId;
      voiceSource = resolved.source;
    }
    console.log(`🎙️ Voice=${effectiveVoice} model=${effectiveModel} lang=${language || 'en'} source=${voiceSource}`);

    // Cost guardrail: hard cap characters per request
    const sanitizedText = String(text).slice(0, TTS_MAX_CHARACTERS);

    // --- PERSISTENT CACHE CHECK ---
    const cacheHash = await hashText(sanitizedText, effectiveVoice, effectiveModel);
    const cachedBase64 = await getCachedAudio(cacheHash);
    
    if (cachedBase64) {
      console.log(`♻️ Cache HIT for hash ${cacheHash.substring(0, 12)}... (${sanitizedText.length} chars)`);
      const wordTimestamps = generateEnhancedWordTimings(sanitizedText, effectiveVoice);
      return new Response(JSON.stringify({ 
        audio: cachedBase64,
        contentType: 'audio/mpeg',
        size: cachedBase64.length,
        fromCache: true,
        alignment: { words: wordTimestamps }
      }), { headers: { 'Content-Type': 'application/json' } });
    }
    
    console.log(`🔄 Cache MISS — generating via ElevenLabs Flash v2.5`);

    const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${effectiveVoice}`;
    
    const requestBody = {
      text: sanitizedText,
      model_id: effectiveModel,
      voice_settings: {
        stability: 0.7,        // Steadier, clearer delivery for ESL learners
        similarity_boost: 0.8,
        style: 0.1,            // Less stylization = easier to understand
        use_speaker_boost: true
      },
      apply_text_normalization: "auto",
      optimize_streaming_latency: 3,   // Latency optimization (reduce compute ~10-20%)
      output_format: "mp3_44100_128"
    };
    
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
      console.error('ElevenLabs API error:', { status: response.status, errorText });
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const audioData = await response.arrayBuffer();
    const uint8Array = new Uint8Array(audioData);
    
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    const base64Audio = btoa(binary);
    
    // --- PERSIST TO CACHE (fire-and-forget) ---
    setCachedAudio(cacheHash, audioData);

    const wordTimestamps = generateEnhancedWordTimings(sanitizedText, effectiveVoice);
    
    console.log('✅ Generated audio:', { size: audioData.byteLength, words: wordTimestamps.length });

    // Track cost — Flash v2.5 is ~$0.11/1K chars (half of Turbo)
    try {
      const characterCount = sanitizedText.length;
      const cost = (characterCount / 1000) * 0.11;
      const sessionId = userInfo?.sessionId || 'unknown';
      const sb = await getSupabaseClient();

      await sb.from('cost_tracking').insert({
        session_id: sessionId,
        user_id: null,
        input_tokens: 0,
        output_tokens: 0,
        cost: cost,
        model_used: effectiveModel,
        operation_type: 'audio_generation',
        provider: 'elevenlabs',
        api_endpoint: `text-to-speech/${effectiveVoice}?lang=${language || 'en'}`,
        pricing_model: 'characters',
        quantity_used: characterCount,
        unit_cost: 0.11 / 1000
      });
      console.log(`💰 Cost tracked: $${cost.toFixed(6)} for ${characterCount} chars (Flash v2.5)`);
    } catch (error) {
      console.warn('Failed to track cost:', error);
    }
    
    return new Response(JSON.stringify({ 
      audio: base64Audio,
      contentType: 'audio/mpeg',
      size: audioData.byteLength,
      alignment: { words: wordTimestamps }
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error in elevenlabs-tts:', error);
    throw error;
  }
}

function generateEnhancedWordTimings(text: string, voiceId: string): WordTimestamp[] {
  const words = text.split(/\s+/).filter(word => word.length > 0);
  
  const voiceCharacteristics: Record<string, any> = {
    'XB0fDUnXU5powFXDhCwa': { wordsPerSecond: 2.3, baseDelay: 0.15, punctuationPause: 0.25, wordLengthFactor: 0.07, sentenceEndPause: 0.4 },
    default: { wordsPerSecond: 2.0, baseDelay: 0.2, punctuationPause: 0.3, wordLengthFactor: 0.08, sentenceEndPause: 0.5 }
  };
  
  const characteristics = voiceCharacteristics[voiceId] || voiceCharacteristics.default;
  let currentTime = characteristics.baseDelay;
  
  return words.map((word) => {
    const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
    const punctuation = word.match(/[.,!?;:'"()]/g);
    const wordDuration = Math.max(0.1, cleanWord.length * characteristics.wordLengthFactor + 0.12);
    const startTime = currentTime;
    const endTime = startTime + wordDuration;
    
    let pauseAfter = 0;
    if (punctuation) {
      if (punctuation.some((p: string) => ['.', '!', '?'].includes(p))) pauseAfter = characteristics.sentenceEndPause;
      else if (punctuation.some((p: string) => [',', ';', ':'].includes(p))) pauseAfter = characteristics.punctuationPause;
    }
    
    currentTime = endTime + pauseAfter + (1 / characteristics.wordsPerSecond);
    return { word: cleanWord, start_time: startTime, end_time: endTime };
  });
}