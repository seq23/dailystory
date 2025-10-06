// DIAGNOSTIC REDEPLOY: 2025-01-23T03:00:00Z - Force packaging inclusion
console.log("[translate-universal] DIAGNOSTIC LOADED: 2025-01-23T03:00:00Z");
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { handleHealthAndCors } from "../_shared/healthCors.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '600',
  'Vary': 'Origin, Access-Control-Request-Headers',
}

interface TranslationRequest {
  // For single text translation (word or sentence)
  text?: string;
  word?: string;
  
  // For batch translation
  texts?: string[];
  
  // Language settings
  targetLanguage: string;
  sourceLanguage?: string;
  
  // Context for better translations
  context?: string;
  gradeLevel?: string;
  
  // Operation mode
  mode?: 'to-english' | 'from-english' | 'batch' | 'word';
}

interface TranslationResponse {
  // Single translation response
  originalText?: string;
  translatedText?: string;
  translation?: string; // For word translations
  translated_word?: string; // Legacy compatibility
  word?: string; // Legacy compatibility
  
  // Batch translation response  
  translations?: Array<{
    translatedText: string;
    detectedLanguage: string;
    confidence: number;
  }>;
  
  // Common fields
  detectedLanguage: string;
  confidence: number;
  isTranslated?: boolean;
  success: boolean;
  targetLanguage?: string;
}

function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    'en': 'English',
    'ar': 'Arabic',
    'es': 'Spanish', 
    'zh': 'Chinese',
    'hi': 'Hindi',
    'pt': 'Portuguese',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'th': 'Thai',
    'vi': 'Vietnamese',
  }
  return languages[code] || code;
}

// Simple language detection based on character patterns
function detectLanguage(text: string): { language: string, confidence: number } {
  const patterns = {
    'ar': /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/,
    'zh': /[\u4E00-\u9FFF\u3400-\u4DBF]/,
    'hi': /[\u0900-\u097F]/,
    'ru': /[\u0400-\u04FF]/,
    'es': /ñ|á|é|í|ó|ú|ü/i,
    'fr': /ç|é|è|ê|ë|à|â|ä|ù|û|ü|ï|î|ô|ö/i,
    'de': /ä|ö|ü|ß/i,
  };

  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      return { language: lang, confidence: 0.8 };
    }
  }

  // Default to English if no patterns match
  return { language: 'en', confidence: 0.6 };
}

async function detectIfEnglish(text: string, apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a language detector. Reply only with "yes" if the text is in English, or "no" if it is in another language.'
          },
          {
            role: 'user',
            content: `Is this text in English? "${text}"`
          }
        ],
        max_tokens: 5,
        temperature: 0,
      }),
    });

    if (!response.ok) return false;
    
    const data = await response.json();
    const result = data.choices[0]?.message?.content?.trim().toLowerCase();
    return result === 'yes';
  } catch (error) {
    console.error('Language detection error:', error);
    return false; // Default to assuming it needs translation
  }
}

async function translateSingleText(
  text: string,
  targetLanguage: string,
  sourceLanguage: string | undefined,
  context: string | undefined,
  gradeLevel: string | undefined,
  apiKey: string,
  isToEnglish: boolean = false
): Promise<any> {
  
  // For to-English translations, check if already English
  if (isToEnglish) {
    const isAlreadyEnglish = await detectIfEnglish(text, apiKey);
    if (isAlreadyEnglish) {
      console.log('Text already in English, returning as-is');
      return {
        originalText: text,
        translatedText: text,
        detectedLanguage: 'en',
        confidence: 0.9,
        isTranslated: false,
        success: true
      };
    }
  }

  // Create context-aware prompt
  let prompt = '';
  
  if (isToEnglish) {
    prompt = `Translate the following ${sourceLanguage || 'foreign language'} text to simple English. `;
    
    if (context === 'user_form_input') {
      prompt += `This is user input from a children's story app form field for grade ${gradeLevel || 'K'}. `;
      prompt += `The translation should be simple and appropriate for children's stories. `;
    }
    
    prompt += `Return ONLY the English translation, nothing else. If the text is already in English, return it unchanged.`;
  } else {
    // From English to other language
    prompt = `Translate the following English text to ${getLanguageName(targetLanguage)}.`;
    
    if (context === 'word_explanation') {
      prompt += ' This is a word explanation for children learning English. Keep it simple and child-friendly.';
    } else if (context) {
      prompt += ` Context: "${context}"`;
    }
    
    prompt += ` Provide ONLY the translation, nothing else. For children's reading level.`;
  }
  
  prompt += `\n\nText to translate: "${text}"\n\nTranslation:`;

  const systemContent = isToEnglish 
    ? `You are a helpful translation assistant. Translate foreign language text to simple English suitable for children's stories. Provide only the translation, no explanations. 

CRITICAL: For these specific common words that users have reported issues with:
- French "glace" = "ice cream" (NOT "glass")
- French "pomme" = "apple" (NOT "palm") 
- French "chien" = "dog"
- French "chat" = "cat"
- Spanish "perro" = "dog"
- Spanish "gato" = "cat"

Always use these exact translations for these words.`
    : 'You are a helpful translation assistant for children learning English. Provide only the translated text, nothing else.';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemContent
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: isToEnglish ? 100 : 200,
      temperature: isToEnglish ? 0.1 : 0.2,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const translatedText = data.choices[0]?.message?.content?.trim() || text;
  
  // Remove quotes if OpenAI added them
  const cleanTranslatedText = translatedText.replace(/^["']|["']$/g, '');
  
  if (isToEnglish) {
    // Check if translation was made
    const isTranslated = cleanTranslatedText.toLowerCase() !== text.toLowerCase();
    const confidence = isTranslated ? 0.8 : 0.9;

    return {
      originalText: text,
      translatedText: cleanTranslatedText,
      detectedLanguage: sourceLanguage || 'auto',
      confidence,
      isTranslated,
      success: true
    };
  } else {
    return {
      translatedText: cleanTranslatedText,
      detectedLanguage: sourceLanguage || 'en',
      confidence: 0.8
    };
  }
}

serve(async (req) => {
  console.log('translate-universal function called');

  // Handle CORS and health checks
  const healthResponse = handleHealthAndCors(req);
  if (healthResponse) return healthResponse;

  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Translation service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const requestData: TranslationRequest = await req.json();
    console.log('Translation request:', requestData);

    const { 
      text, 
      word, 
      texts, 
      targetLanguage, 
      sourceLanguage, 
      context, 
      gradeLevel,
      mode 
    } = requestData;

    // Auto-detect mode if not specified
    let detectedMode = mode;
    if (!detectedMode) {
      if (texts && texts.length > 0) {
        detectedMode = 'batch';
      } else if (word) {
        detectedMode = 'word';
      } else if (targetLanguage === 'en') {
        detectedMode = 'to-english';
      } else {
        detectedMode = 'from-english';
      }
    }

    console.log('Detected mode:', detectedMode);

    // Handle different modes
    switch (detectedMode) {
      case 'batch': {
        if (!texts || texts.length === 0) {
          return new Response(
            JSON.stringify({ error: 'No texts provided for translation' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const translations = [];
        for (const textItem of texts) {
          // Detect language if not provided
          const detection = detectLanguage(textItem);
          const detectedLang = sourceLanguage || detection.language;
          
          // Skip translation if already in target language
          if (detectedLang === targetLanguage) {
            translations.push({
              translatedText: textItem,
              detectedLanguage: detectedLang,
              confidence: 0.9
            });
            continue;
          }

          try {
            const result = await translateSingleText(
              textItem, 
              targetLanguage, 
              detectedLang, 
              context, 
              gradeLevel, 
              openaiApiKey,
              targetLanguage === 'en'
            );
            
            translations.push({
              translatedText: result.translatedText || result.originalText || textItem,
              detectedLanguage: result.detectedLanguage || detectedLang,
              confidence: result.confidence || 0.8
            });
          } catch (error) {
            console.error('Translation error for text:', textItem, error);
            // Fallback to original text
            translations.push({
              translatedText: textItem,
              detectedLanguage: detectedLang,
              confidence: 0.1
            });
          }
        }

        return new Response(
          JSON.stringify({ 
            translations,
            success: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'word': {
        const wordText = word || text;
        if (!wordText) {
          return new Response(
            JSON.stringify({ error: 'No word provided for translation' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const result = await translateSingleText(
          wordText, 
          targetLanguage, 
          sourceLanguage || 'en', 
          context, 
          gradeLevel, 
          openaiApiKey,
          false
        );

        return new Response(
          JSON.stringify({
            word: wordText,
            targetLanguage,
            translation: result.translatedText,
            translated_word: result.translatedText, // Legacy compatibility
            detectedLanguage: result.detectedLanguage,
            confidence: result.confidence,
            success: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'to-english': 
      case 'from-english': 
      default: {
        const inputText = text || word;
        if (!inputText || inputText.trim().length === 0) {
          return new Response(
            JSON.stringify({ error: 'No text provided for translation' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const isToEnglish = detectedMode === 'to-english' || targetLanguage === 'en';
        const finalTargetLanguage = isToEnglish ? 'en' : targetLanguage;
        
        const result = await translateSingleText(
          inputText, 
          finalTargetLanguage, 
          sourceLanguage, 
          context, 
          gradeLevel, 
          openaiApiKey,
          isToEnglish
        );

        if (isToEnglish) {
          return new Response(
            JSON.stringify(result),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          return new Response(
            JSON.stringify({
              originalText: inputText,
              translatedText: result.translatedText,
              detectedLanguage: result.detectedLanguage,
              confidence: result.confidence,
              isTranslated: true,
              success: true
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

  } catch (error) {
    console.error('Translation error:', error)
    return new Response(
      JSON.stringify({ error: 'Translation failed', details: error instanceof Error ? error.message : String(error) }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})