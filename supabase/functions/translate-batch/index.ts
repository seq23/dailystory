// Redeploy touch: 2025-09-12T18:45:32Z - Force complete rebuild
console.log("[translate-batch] Loaded: 2025-09-12T18:45:32Z");
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslationRequest {
  texts: string[];
  targetLanguage: string;
  sourceLanguage?: string;
  context?: string;
}

interface TranslationResult {
  translatedText: string;
  detectedLanguage: string;
  confidence: number;
}

function getLanguageName(code: string): string {
  const languages: { [key: string]: string } = {
    'en': 'English',
    'es': 'Spanish', 
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'th': 'Thai',
    'vi': 'Vietnamese',
  };
  return languages[code] || 'English';
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

Deno.serve(async (req) => {
  console.log('translate-batch function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiApiKey) {
      console.error('OpenAI API key not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData: TranslationRequest = await req.json();
    console.log('Translation request:', requestData);

    const { texts, targetLanguage, sourceLanguage, context } = requestData;
    
    if (!texts || texts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No texts provided for translation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const translations: TranslationResult[] = [];

    for (const text of texts) {
      // Detect language if not provided
      const detection = detectLanguage(text);
      const detectedLang = sourceLanguage || detection.language;
      
      // Skip translation if already in target language
      if (detectedLang === targetLanguage) {
        translations.push({
          translatedText: text,
          detectedLanguage: detectedLang,
          confidence: 0.9
        });
        continue;
      }

      // Create context-aware prompt
      let prompt = `Translate the following text from ${getLanguageName(detectedLang)} to ${getLanguageName(targetLanguage)}.`;
      
      if (context === 'user_form_input') {
        prompt += ' This is user input from a children\'s story app form field. Keep the translation simple and child-friendly.';
      }

      prompt += `\n\nText to translate: "${text}"\n\nTranslated text:`;

      const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful translation assistant. Provide only the translated text, without any explanations or additional comments.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.3,
        }),
      });

      if (!openAiResponse.ok) {
        console.error('OpenAI API error:', await openAiResponse.text());
        // Fallback to original text
        translations.push({
          translatedText: text,
          detectedLanguage: detectedLang,
          confidence: 0.1
        });
        continue;
      }

      const openAiData = await openAiResponse.json();
      const translatedText = openAiData.choices[0]?.message?.content?.trim() || text;

      translations.push({
        translatedText,
        detectedLanguage: detectedLang,
        confidence: 0.8
      });
    }

    console.log('Translation completed:', translations);

    return new Response(
      JSON.stringify({ 
        translations,
        success: true
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Translation failed',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});