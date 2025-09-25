// Clean Deploy: 2025-01-30T12:00:00Z - Force GitHub refresh
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { withCors } from "../_shared/healthCors.ts";
// Lazy import to avoid bundling/circular deps
async function getDifficultyMapper() {
  try {
    const mod = await import("../_shared/DifficultyLevelMapper.ts");
    return mod.DifficultyLevelMapper;
  } catch (error) {
    console.warn("DifficultyLevelMapper lazy load failed:", error);
    return null;
  }
}


// Enhanced word alignment interface for ElevenLabs TTS
interface WordTimestamp {
  word: string;
  start_time: number;
  end_time: number;
}

interface ElevenLabsResponse {
  audio: string;
  alignment?: {
    characters?: Array<{
      character: string;
      start_time: number;
      end_time: number;
    }>;
    words?: WordTimestamp[];
  };
}

const corsWrapped = withCors(handle, {
  allowCredentials: false,
  allowMethods: ["GET","POST","OPTIONS","HEAD"]
});

serve(corsWrapped);

async function handle(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  // Health endpoint
  if (url.pathname === "/" || url.pathname === "/health") {
    return new Response(JSON.stringify({ ok: true, service: "elevenlabs-tts" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    console.log('ElevenLabs TTS function called');
    const { text, voice, model, userInfo } = await req.json();
    
    // Log difficulty mapping for consistency with other functions
    if (userInfo) {
      const Mapper = await getDifficultyMapper();
      if (Mapper) {
        const difficulty = Mapper.mapToImageDifficulty(userInfo);
        console.log(`🎯 Mapped user info to difficulty: ${difficulty} for TTS generation`);
      } else {
        console.warn('DifficultyLevelMapper unavailable for TTS');
      }
    }
    
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
      text: String(text).slice(0, 2000), // Increased text limit
      model_id: effectiveModel,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.2,
        use_speaker_boost: true
      },
      // Enhanced parameters for better alignment and quality
      apply_text_normalization: "auto",
      optimize_streaming_latency: 0,
      output_format: "mp3_44100_128"
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
      
      // Throw error and let withCors wrapper handle CORS headers
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    // Convert audio data to base64 safely (avoiding stack overflow)
    const audioData = await response.arrayBuffer();
    const uint8Array = new Uint8Array(audioData);
    
    // Convert to base64 in chunks to avoid stack overflow
    let binary = '';
    const chunkSize = 8192; // Process in 8KB chunks
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    const base64Audio = btoa(binary);
    
    // Generate enhanced word timing data for better synchronization
    const wordTimestamps = generateEnhancedWordTimings(String(text), effectiveVoice);
    
    console.log('Successfully generated audio:', {
      size: audioData.byteLength,
      contentType: response.headers.get('content-type'),
      base64Length: base64Audio.length,
      wordCount: wordTimestamps.length,
      estimatedDuration: wordTimestamps.length > 0 ? wordTimestamps[wordTimestamps.length - 1].end_time : 'unknown'
    });
    
    return new Response(JSON.stringify({ 
      audio: base64Audio,
      contentType: 'audio/mpeg',
      size: audioData.byteLength,
      alignment: {
        words: wordTimestamps
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error in elevenlabs-tts function:', error);
    throw error; // Let withCors handle error response with proper CORS headers
  }
}

// Enhanced word timing generation optimized for Charlotte's voice characteristics
function generateEnhancedWordTimings(text: string, voiceId: string): WordTimestamp[] {
  const words = text.split(/\s+/).filter(word => word.length > 0);
  
  // Voice-specific characteristics - Charlotte (XB0fDUnXU5powFXDhCwa) speaks at ~2.3 words/second
  const voiceCharacteristics = {
    'XB0fDUnXU5powFXDhCwa': { // Charlotte
      wordsPerSecond: 2.3,
      baseDelay: 0.15,
      punctuationPause: 0.25,
      wordLengthFactor: 0.07,
      sentenceEndPause: 0.4
    },
    default: {
      wordsPerSecond: 2.0,
      baseDelay: 0.2,
      punctuationPause: 0.3,
      wordLengthFactor: 0.08,
      sentenceEndPause: 0.5
    }
  };
  
  const characteristics = (voiceCharacteristics as any)[voiceId] || voiceCharacteristics.default;
  let currentTime = characteristics.baseDelay;
  
  return words.map((word, index) => {
    const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
    const punctuation = word.match(/[.,!?;:'"()]/g);
    
    // Dynamic word duration based on length and complexity
    const wordDuration = Math.max(0.1, cleanWord.length * characteristics.wordLengthFactor + 0.12);
    
    const startTime = currentTime;
    const endTime = startTime + wordDuration;
    
    // Add pauses for punctuation and sentence endings
    let pauseAfter = 0;
    if (punctuation) {
      if (punctuation.some(p => ['.', '!', '?'].includes(p))) {
        pauseAfter = characteristics.sentenceEndPause;
      } else if (punctuation.some(p => [',', ';', ':'].includes(p))) {
        pauseAfter = characteristics.punctuationPause;
      }
    }
    
    // Update current time for next word
    currentTime = endTime + pauseAfter + (1 / characteristics.wordsPerSecond);
    
    console.log(`📍 Word timing: "${cleanWord}" -> ${startTime.toFixed(2)}s - ${endTime.toFixed(2)}s`);
    
    return {
      word: cleanWord,
      start_time: startTime,
      end_time: endTime
    };
  });
}