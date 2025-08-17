import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Circuit breaker state
let circuitBreakerState = {
  failures: 0,
  lastFailure: 0,
  isOpen: false,
  dictionaries: null as any,
  lastDictionaryCheck: 0
};

const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_TIMEOUT = 300000; // 5 minutes
const DICTIONARY_CACHE_TIMEOUT = 3600000; // 1 hour

async function getDictionaryId(): Promise<string | null> {
  try {
    const now = Date.now();
    
    // Use cached dictionary info if available and fresh
    if (circuitBreakerState.dictionaries && 
        (now - circuitBreakerState.lastDictionaryCheck) < DICTIONARY_CACHE_TIMEOUT) {
      return circuitBreakerState.dictionaries.charlotteDictionaryId;
    }

    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenLabsApiKey) {
      console.log('ElevenLabs API key not configured for dictionary lookup');
      return null;
    }

    console.log('Fetching dictionary list from ElevenLabs...');
    const response = await fetch('https://api.elevenlabs.io/v1/pronunciation-dictionaries', {
      method: 'GET',
      headers: {
        'xi-api-key': elevenLabsApiKey,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const charlotteDictionary = data.pronunciation_dictionaries?.find(
        (dict: any) => dict.name === 'charlotte-learning-lexicon'
      );
      
      circuitBreakerState.dictionaries = {
        charlotteDictionaryId: charlotteDictionary?.id || null
      };
      circuitBreakerState.lastDictionaryCheck = now;
      
      console.log('Dictionary lookup result:', charlotteDictionary?.id ? 'Found' : 'Not found');
      return charlotteDictionary?.id || null;
    } else {
      console.log('Dictionary lookup failed:', response.status);
      return null;
    }
  } catch (error) {
    console.log('Dictionary lookup error:', error.message);
    return null;
  }
}

async function makeElevenLabsRequest(text: string, voiceId: string, context: string, retryCount = 0): Promise<Response> {
  const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
  if (!elevenLabsApiKey) {
    throw new Error('ElevenLabs API key not configured');
  }

  // Check circuit breaker
  const now = Date.now();
  if (circuitBreakerState.isOpen) {
    if ((now - circuitBreakerState.lastFailure) > CIRCUIT_BREAKER_TIMEOUT) {
      console.log('Circuit breaker reset - attempting request');
      circuitBreakerState.isOpen = false;
      circuitBreakerState.failures = 0;
    } else {
      throw new Error('Circuit breaker is open - ElevenLabs API temporarily unavailable');
    }
  }

  const model = context === 'learning' ? 'eleven_multilingual_v2' : 'eleven_turbo_v2_5';
  
  // Exponential backoff: 2s, 4s, 8s
  if (retryCount > 0) {
    const delay = Math.pow(2, retryCount) * 1000;
    console.log(`Retrying after ${delay}ms (attempt ${retryCount + 1})`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Get dictionary ID for learning context
  let dictionaryId: string | null = null;
  if (context === 'learning') {
    dictionaryId = await getDictionaryId();
  }

  const requestBody: any = {
    text,
    model_id: model,
    voice_settings: {
      stability: context === 'learning' ? 0.85 : 0.75,
      similarity_boost: context === 'learning' ? 0.85 : 0.75,
      style: context === 'learning' ? 0.2 : 0.0,
      use_speaker_boost: true
    }
  };

  // Add pronunciation dictionary for learning context
  if (context === 'learning' && dictionaryId) {
    requestBody.pronunciation_dictionary_locators = [{
      pronunciation_dictionary_id: dictionaryId,
      version_id: "latest"
    }];
    console.log('Using Charlotte learning lexicon:', dictionaryId);
  }

  console.log(`ElevenLabs TTS request (attempt ${retryCount + 1}):`, {
    voice: voiceId,
    model,
    context,
    textLength: text.length,
    stability: requestBody.voice_settings.stability,
    usingDictionary: !!dictionaryId
  });

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify(requestBody),
    });

    // Reset circuit breaker on success
    if (response.ok) {
      circuitBreakerState.failures = 0;
      circuitBreakerState.isOpen = false;
    }

    return response;
  } catch (error) {
    // Update circuit breaker on failure
    circuitBreakerState.failures++;
    circuitBreakerState.lastFailure = now;
    
    if (circuitBreakerState.failures >= CIRCUIT_BREAKER_THRESHOLD) {
      circuitBreakerState.isOpen = true;
      console.log('Circuit breaker opened due to repeated failures');
    }
    
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voiceId = 'XB0fDUnXU5powFXDhCwa', context = 'conversation' } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Text is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let lastError;
    const maxRetries = 3;

    // Try with retry logic
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await makeElevenLabsRequest(text, voiceId, context, attempt);

        if (response.ok) {
          const audioBuffer = await response.arrayBuffer();
          const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
          
          console.log(`ElevenLabs TTS success on attempt ${attempt + 1}`);
          
          return new Response(JSON.stringify({ 
            success: true,
            audioContent: base64Audio,
            context,
            voiceId,
            usedDictionary: context === 'learning' && circuitBreakerState.dictionaries?.charlotteDictionaryId
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          const errorText = await response.text();
          lastError = new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
          console.error(`Attempt ${attempt + 1} failed:`, lastError.message);
          
          // If dictionary-related error in learning context, clear cache for next attempt
          if (context === 'learning' && 
              (errorText.includes('dictionary') || errorText.includes('pronunciation')) &&
              circuitBreakerState.dictionaries?.charlotteDictionaryId) {
            console.log('Dictionary error detected, clearing dictionary cache for next attempt');
            circuitBreakerState.dictionaries = null;
            circuitBreakerState.lastDictionaryCheck = 0;
          }
          
          // Don't retry on client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            break;
          }
        }
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt + 1} failed:`, error.message);
        
        // Don't retry on authentication or circuit breaker errors
        if (error.message.includes('API key') || error.message.includes('Circuit breaker')) {
          break;
        }
      }
    }

    console.error('All ElevenLabs attempts failed, last error:', lastError?.message);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: lastError?.message || 'Failed to generate speech after multiple attempts',
      shouldFallback: true,
      circuitBreakerOpen: circuitBreakerState.isOpen
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('ElevenLabs TTS Smart error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      shouldFallback: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});