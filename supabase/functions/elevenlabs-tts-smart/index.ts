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
  dictionaries: new Map<string, string>(), // context -> dictionaryId
  lastDictionaryCheck: 0
};

const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_TIMEOUT = 300000; // 5 minutes
const DICTIONARY_CACHE_TIMEOUT = 3600000; // 1 hour

// Comprehensive vocabulary for generating dictionaries
const COMPREHENSIVE_VOCABULARY = {
  level0: ['a', 'I', 'am', 'an', 'and', 'at', 'be', 'big', 'can', 'cat', 'come', 'do', 'dog', 'for', 'get', 'go', 'has', 'have', 'he', 'help', 'here', 'him', 'his', 'how', 'in', 'is', 'it', 'like', 'look', 'me', 'my', 'no', 'not', 'on', 'or', 'play', 'said', 'see', 'she', 'the', 'to', 'up', 'we', 'will', 'you'],
  level1: ['all', 'ball', 'book', 'boy', 'came', 'car', 'day', 'did', 'eat', 'find', 'girl', 'good', 'had', 'her', 'his', 'home', 'house', 'jump', 'know', 'little', 'long', 'make', 'man', 'may', 'new', 'now', 'old', 'one', 'out', 'put', 'ran', 'red', 'run', 'say', 'sit', 'so', 'some', 'take', 'that', 'them', 'then', 'they', 'this', 'three', 'time', 'two', 'want', 'was', 'water', 'way', 'went', 'were', 'what', 'when', 'where', 'who', 'why', 'with', 'yes'],
  level2: ['about', 'after', 'again', 'another', 'any', 'ask', 'back', 'began', 'better', 'black', 'blue', 'brown', 'call', 'could', 'does', 'down', 'first', 'found', 'from', 'gave', 'green', 'grow', 'head', 'just', 'keep', 'kind', 'last', 'leave', 'left', 'let', 'live', 'made', 'much', 'must', 'name', 'never', 'next', 'night', 'only', 'open', 'other', 'own', 'people', 'place', 'right', 'round', 'saw', 'school', 'should', 'stop', 'tell', 'think', 'too', 'turn', 'us', 'use', 'very', 'walk', 'well', 'white', 'why', 'work', 'would', 'write', 'year', 'your'],
  level3: ['almost', 'always', 'before', 'best', 'both', 'buy', 'clean', 'cut', 'done', 'draw', 'drink', 'eight', 'every', 'fall', 'far', 'fast', 'five', 'fly', 'four', 'full', 'funny', 'got', 'hold', 'hot', 'hurt', 'if', 'its', 'laugh', 'light', 'many', 'myself', 'off', 'once', 'pick', 'please', 'pretty', 'pull', 'read', 'sing', 'six', 'sleep', 'small', 'start', 'ten', 'thank', 'their', 'these', 'today', 'together', 'try', 'upon', 'warm', 'wash', 'which', 'wish', 'yellow'],
  level4: ['along', 'around', 'because', 'been', 'carry', 'cold', 'coming', 'don\'t', 'enough', 'first', 'gave', 'going', 'heavy', 'hour', 'isn\'t', 'morning', 'myself', 'near', 'piece', 'really', 'second', 'sister', 'tried', 'under', 'until', 'while', 'without']
};

// Common phonetic mappings for consistent pronunciation
const PHONETIC_MAPPINGS = {
  'the': 'ðə',
  'a': 'ə',
  'and': 'ænd',
  'to': 'tu',
  'of': 'ʌv',
  'in': 'ɪn',
  'is': 'ɪz',
  'it': 'ɪt',
  'you': 'ju',
  'that': 'ðæt',
  'he': 'hi',
  'was': 'wʌz',
  'for': 'fɔr',
  'on': 'ɑn',
  'are': 'ɑr',
  'as': 'æz',
  'with': 'wɪθ',
  'his': 'hɪz',
  'they': 'ðeɪ',
  'i': 'aɪ',
  'at': 'æt',
  'be': 'bi',
  'this': 'ðɪs',
  'have': 'hæv',
  'from': 'frʌm',
  'or': 'ɔr',
  'one': 'wʌn',
  'had': 'hæd',
  'by': 'baɪ',
  'word': 'wɜrd',
  'but': 'bʌt',
  'not': 'nɑt',
  'what': 'wʌt',
  'all': 'ɔl',
  'were': 'wɜr',
  'we': 'wi',
  'when': 'wɛn',
  'your': 'jʊr',
  'can': 'kæn',
  'said': 'sɛd',
  'there': 'ðɛr',
  'each': 'itʃ',
  'which': 'wɪtʃ',
  'she': 'ʃi',
  'do': 'du',
  'how': 'haʊ',
  'their': 'ðɛr',
  'if': 'ɪf'
};

// Generate PLS lexicon content
function generatePLSLexicon(vocabulary: string[], contextType: 'learning' | 'conversation'): string {
  try {
    const timestamp = new Date().toISOString();
    const lexiconName = `comprehensive-${contextType}-lexicon-${Date.now()}`;
    
    // Start with basic XML structure - use simpler encoding to avoid issues
    let plsContent = `<?xml version="1.0" encoding="UTF-8"?>
<lexicon version="1.0" 
         xmlns="http://www.w3.org/2005/01/pronunciation-lexicon"
         alphabet="ipa" xml:lang="en-US">
  <!-- Generated: ${timestamp} -->
  <!-- Context: ${contextType} -->
`;

    // Limit vocabulary to prevent stack overflow - only process first 50 words
    const limitedVocabulary = vocabulary.slice(0, 50);
    console.log(`Generating PLS for ${limitedVocabulary.length} words (limited from ${vocabulary.length})`);

    // Add phonetic entries for vocabulary with error handling
    for (const word of limitedVocabulary) {
      try {
        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
        if (cleanWord && PHONETIC_MAPPINGS[cleanWord]) {
          const pronunciation = PHONETIC_MAPPINGS[cleanWord];
          
          // Escape any problematic characters
          const safeWord = cleanWord.replace(/[<>&"']/g, '');
          const safePronunciation = pronunciation.replace(/[<>&"']/g, '');
          
          if (contextType === 'learning') {
            // For learning context, add phonetic variant
            plsContent += `  <lexeme>
    <grapheme>${safeWord}</grapheme>
    <phoneme>${safePronunciation}</phoneme>
  </lexeme>
`;
          } else {
            // For conversation context, use natural pronunciation
            plsContent += `  <lexeme>
    <grapheme>${safeWord}</grapheme>
    <phoneme>${safePronunciation}</phoneme>
  </lexeme>
`;
          }
        }
      } catch (wordError) {
        console.warn(`Skipping problematic word "${cleanWord}":`, wordError);
        // Continue to next word instead of failing completely
      }
    }

    plsContent += '</lexicon>';
    return plsContent;
  } catch (error) {
    console.error('Error generating PLS lexicon:', error);
    // Return minimal valid lexicon to prevent failures
    return `<?xml version="1.0" encoding="UTF-8"?>
<lexicon version="1.0" 
         xmlns="http://www.w3.org/2005/01/pronunciation-lexicon"
         alphabet="ipa" xml:lang="en-US">
  <!-- Emergency fallback lexicon -->
</lexicon>`;
  }
}

// Get or create comprehensive dictionary for context
async function getComprehensiveDictionary(context: 'learning' | 'conversation'): Promise<string | null> {
  try {
    const now = Date.now();
    
    // Check cache first
    if (circuitBreakerState.dictionaries.has(context) && 
        (now - circuitBreakerState.lastDictionaryCheck) < DICTIONARY_CACHE_TIMEOUT) {
      console.log(`Using cached ${context} dictionary:`, circuitBreakerState.dictionaries.get(context));
      return circuitBreakerState.dictionaries.get(context) || null;
    }

    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenLabsApiKey) {
      console.log('ElevenLabs API key not configured for comprehensive dictionary');
      return null;
    }

    // Check if dictionary already exists
    console.log(`Checking for existing ${context} dictionary...`);
    const listResponse = await fetch('https://api.elevenlabs.io/v1/pronunciation-dictionaries', {
      method: 'GET',
      headers: { 'xi-api-key': elevenLabsApiKey },
    });

    if (listResponse.ok) {
      const data = await listResponse.json();
      const dictionaryName = `comprehensive-${context}-lexicon`;
      const existingDict = data.pronunciation_dictionaries?.find(
        (dict: any) => dict.name.startsWith(dictionaryName)
      );
      
      if (existingDict) {
        console.log(`Found existing ${context} dictionary:`, existingDict.id);
        circuitBreakerState.dictionaries.set(context, existingDict.id);
        circuitBreakerState.lastDictionaryCheck = now;
        return existingDict.id;
      }
    }

    // Generate comprehensive vocabulary for all levels
    console.log(`Generating comprehensive ${context} dictionary...`);
    const allVocabulary = [
      ...COMPREHENSIVE_VOCABULARY.level0,
      ...COMPREHENSIVE_VOCABULARY.level1,
      ...COMPREHENSIVE_VOCABULARY.level2,
      ...COMPREHENSIVE_VOCABULARY.level3,
      ...COMPREHENSIVE_VOCABULARY.level4
    ];

    // Remove duplicates
    const uniqueVocabulary = [...new Set(allVocabulary)];
    console.log(`Vocabulary size: ${uniqueVocabulary.length} words`);

    // Generate PLS lexicon
    const plsContent = generatePLSLexicon(uniqueVocabulary, context);
    const dictionaryName = `comprehensive-${context}-lexicon-${Date.now()}`;

    // Upload to ElevenLabs
    console.log(`Uploading ${context} dictionary to ElevenLabs...`);
    const uploadResponse = await fetch('https://api.elevenlabs.io/v1/pronunciation-dictionaries/add-from-file', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: dictionaryName,
        file: btoa(plsContent),
        description: `Comprehensive ${context} pronunciation lexicon with ${uniqueVocabulary.length} words. Generated automatically for consistent pronunciation.`
      }),
    });

    if (uploadResponse.ok) {
      const uploadData = await uploadResponse.json();
      console.log(`Successfully uploaded ${context} dictionary:`, uploadData.id);
      
      // Cache the new dictionary
      circuitBreakerState.dictionaries.set(context, uploadData.id);
      circuitBreakerState.lastDictionaryCheck = now;
      
      return uploadData.id;
    } else {
      const errorText = await uploadResponse.text();
      console.error(`Failed to upload ${context} dictionary:`, uploadResponse.status, errorText);
      return null;
    }

  } catch (error) {
    console.error(`Error with ${context} dictionary:`, error.message);
    return null;
  }
}

async function makeElevenLabsRequest(text: string, voiceId: string, context: string, useTimestamps: boolean, retryCount = 0): Promise<Response> {
  try {
    console.log(`🔧 ElevenLabs request started - attempt ${retryCount + 1}`);
    
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenLabsApiKey) {
      console.error('❌ ElevenLabs API key not configured');
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

  console.log(`ElevenLabs TTS request (attempt ${retryCount + 1}):`, {
    voice: voiceId,
    model,
    context,
    textLength: text.length,
    stability: requestBody.voice_settings.stability,
    useTimestamps
  });

    try {
      // Choose endpoint based on whether timestamps are needed
      const endpoint = useTimestamps 
        ? `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`
        : `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
      
      console.log(`📡 Making ElevenLabs API request to: ${endpoint}`);
      console.log(`📋 Request body:`, { 
        textLength: text.length, 
        model: requestBody.model_id,
        stability: requestBody.voice_settings.stability,
        useTimestamps
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Accept': useTimestamps ? 'application/json' : 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey,
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`📡 ElevenLabs API response: ${response.status} ${response.statusText}`);

      // Reset circuit breaker on success
      if (response.ok) {
        console.log('✅ ElevenLabs request successful, resetting circuit breaker');
        circuitBreakerState.failures = 0;
        circuitBreakerState.isOpen = false;
      } else {
        console.error(`❌ ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      return response;
    } catch (error) {
      console.error(`🚨 ElevenLabs request failed with error:`, error);
      console.error(`Error details:`, {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 500)
      });
      
      // Update circuit breaker on failure
      circuitBreakerState.failures++;
      circuitBreakerState.lastFailure = now;
      
      if (circuitBreakerState.failures >= CIRCUIT_BREAKER_THRESHOLD) {
        circuitBreakerState.isOpen = true;
        console.log('🔴 Circuit breaker opened due to repeated failures');
      }
      
      throw error;
    }
  } catch (outerError) {
    console.error(`💥 Outer catch - function error:`, outerError);
    throw outerError;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 ElevenLabs TTS Smart function started');
    
    // Step 1: Verify API Key Configuration
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    console.log('🔑 API Key Check:', {
      hasApiKey: !!elevenLabsApiKey,
      keyLength: elevenLabsApiKey ? elevenLabsApiKey.length : 0,
      keyPrefix: elevenLabsApiKey ? elevenLabsApiKey.substring(0, 8) + '...' : 'none'
    });

    if (!elevenLabsApiKey) {
      console.error('❌ ELEVENLABS_API_KEY environment variable is not set');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'ElevenLabs API key not configured',
        debug: 'ELEVENLABS_API_KEY environment variable missing'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body with error handling
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error('❌ Failed to parse request JSON:', parseError);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Invalid JSON in request body',
        debug: parseError.message
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { text, voiceId = 'XB0fDUnXU5powFXDhCwa', context = 'conversation', useTimestamps = false } = requestData;
    
    // Step 2: Add Comprehensive Error Logging
    console.log('📋 Request Details:', {
      textLength: text ? text.length : 0,
      voiceId: voiceId,
      context: context,
      textPreview: text ? text.substring(0, 100) + '...' : 'none'
    });

    if (!text) {
      console.error('❌ Text parameter is missing or empty');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Text is required',
        debug: 'Text parameter missing from request'
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
        console.log(`🚀 Starting attempt ${attempt + 1} of ${maxRetries}`);
        const response = await makeElevenLabsRequest(text, voiceId, context, useTimestamps, attempt);

        console.log(`📡 Response status: ${response.status} ${response.statusText}`);

        if (response.ok) {
          if (useTimestamps) {
            console.log('🎵 Processing timestamps response...');
            const data = await response.json();
            console.log('✅ Timestamps data received:', { 
              hasAudio: !!data.audio_base64, 
              hasAlignment: !!data.alignment,
              audioSize: data.audio_base64?.length || 0,
              alignmentLength: data.alignment?.characters?.length || 0
            });
            
            return new Response(JSON.stringify({
              success: true,
              audioContent: data.audio_base64,
              alignment: data.alignment,
              appliedLexicon: false
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          } else {
            console.log('🎵 Processing audio response...');
            
            // Safe audio processing to prevent stack overflow
            let audioBuffer;
            try {
              audioBuffer = await response.arrayBuffer();
              console.log('✅ Audio buffer received:', { size: audioBuffer.byteLength });
            } catch (audioError) {
            console.error('❌ Failed to read audio buffer:', audioError);
            throw new Error(`Audio processing failed: ${audioError.message}`);
          }

          // FIXED: Safe base64 conversion to prevent stack overflow
          console.log('🔄 Converting to base64...');
          let base64Audio;
          try {
            const uint8Array = new Uint8Array(audioBuffer);
            
            // Use smaller chunks and safer conversion to prevent "Maximum call stack size exceeded"
            let binary = '';
            const chunkSize = 4096; // Small chunks to prevent stack overflow
            
            for (let i = 0; i < uint8Array.length; i += chunkSize) {
              const chunk = uint8Array.slice(i, i + chunkSize);
              // Use Array.from to avoid spread operator with large arrays
              const chunkString = Array.from(chunk, byte => String.fromCharCode(byte)).join('');
              binary += chunkString;
            }
            
            base64Audio = btoa(binary);
            console.log('✅ Base64 conversion completed:', { length: base64Audio.length });
          } catch (conversionError) {
            console.error('❌ Base64 conversion failed:', conversionError);
            throw new Error(`Base64 conversion failed: ${conversionError.message}`);
          }
          
          console.log(`🎉 ElevenLabs TTS success on attempt ${attempt + 1}`);
          
          return new Response(JSON.stringify({ 
            success: true,
            audioContent: base64Audio,
            context,
            voiceId,
            size: audioBuffer.byteLength,
            debug: {
              attempt: attempt + 1,
              audioSize: audioBuffer.byteLength,
              base64Length: base64Audio.length
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          const errorText = await response.text();
          lastError = new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
          console.error(`❌ Attempt ${attempt + 1} failed:`, {
            status: response.status,
            statusText: response.statusText,
            errorText: errorText
          });
          
          // If dictionary-related error, clear cache for next attempt
          if ((errorText.includes('dictionary') || errorText.includes('pronunciation')) &&
              circuitBreakerState.dictionaries.has(context)) {
            console.log('📚 Dictionary error detected, clearing dictionary cache for next attempt');
            circuitBreakerState.dictionaries.delete(context);
            circuitBreakerState.lastDictionaryCheck = 0;
          }
          
          // Don't retry on client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            console.log(`🚫 Client error ${response.status}, not retrying`);
            break;
          }
        }
      } catch (error) {
        lastError = error;
        console.error(`❌ Attempt ${attempt + 1} failed with exception:`, {
          name: error.name,
          message: error.message,
          stack: error.stack ? error.stack.substring(0, 500) : 'No stack trace'
        });
        
        // Don't retry on authentication or circuit breaker errors
        if (error.message.includes('API key') || error.message.includes('Circuit breaker')) {
          console.log('🚫 Critical error, not retrying:', error.message);
          break;
        }
      }
    }

    console.error('💥 All ElevenLabs attempts failed, last error:', lastError?.message);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: lastError?.message || 'Failed to generate speech after multiple attempts',
      shouldFallback: true,
      circuitBreakerOpen: circuitBreakerState.isOpen,
      debug: {
        attempts: maxRetries,
        lastErrorName: lastError?.name,
        lastErrorMessage: lastError?.message,
        circuitBreakerState: {
          isOpen: circuitBreakerState.isOpen,
          failures: circuitBreakerState.failures
        }
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 ElevenLabs TTS Smart critical error:', {
      name: error.name,
      message: error.message,
      stack: error.stack ? error.stack.substring(0, 500) : 'No stack trace'
    });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      shouldFallback: true,
      debug: {
        errorName: error.name,
        errorMessage: error.message,
        stackTrace: error.stack ? error.stack.substring(0, 200) + '...' : 'No stack trace'
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});