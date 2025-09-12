import "https://deno.land/x/xhr@0.1.0/mod.js";
import { serve } from "https://deno.land/std@0.168.0/http/server.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  context?: string;
  gradeLevel?: string;
}

interface TranslationResponse {
  originalText: string;
  translatedText: string;
  detectedLanguage: string;
  confidence: number;
  isTranslated: boolean;
  success: boolean;
}

Deno.serve(async (req) => {
  console.log('translate-to-english function called');

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

    const { text, sourceLanguage, context, gradeLevel } = requestData;
    
    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'No text provided for translation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the text is already in English using simple detection
    const isAlreadyEnglish = await detectIfEnglish(text, openAiApiKey);
    if (isAlreadyEnglish) {
      console.log('Text already in English, returning as-is');
      return new Response(
        JSON.stringify({
          originalText: text,
          translatedText: text,
          detectedLanguage: 'en',
          confidence: 0.9,
          isTranslated: false,
          success: true
        } as TranslationResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create context-aware prompt for translation
    let prompt = `Translate the following ${sourceLanguage} text to simple English. `;
    
    if (context === 'user_form_input') {
      prompt += `This is user input from a children's story app form field for grade ${gradeLevel || 'K'}. `;
      prompt += `The translation should be simple and appropriate for children's stories. `;
    }
    
    prompt += `Return ONLY the English translation, nothing else. If the text is already in English, return it unchanged.`;
    prompt += `\n\nText to translate: "${text}"\n\nEnglish translation:`;

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
            content: `You are a helpful translation assistant. Translate foreign language text to simple English suitable for children's stories. Provide only the translation, no explanations. 

CRITICAL: For these specific common words that users have reported issues with:
- French "glace" = "ice cream" (NOT "glass")
- French "pomme" = "apple" (NOT "palm") 
- French "chien" = "dog"
- French "chat" = "cat"
- Spanish "perro" = "dog"
- Spanish "gato" = "cat"

Always use these exact translations for these words.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.1, // Low temperature for consistent translations
      }),
    });

    if (!openAiResponse.ok) {
      console.error('OpenAI API error:', await openAiResponse.text());
      return new Response(
        JSON.stringify({ 
          originalText: text,
          translatedText: text,
          detectedLanguage: sourceLanguage,
          confidence: 0.1,
          isTranslated: false,
          success: false,
          error: 'Translation service unavailable'
        } as TranslationResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAiData = await openAiResponse.json();
    const translatedText = openAiData.choices[0]?.message?.content?.trim() || text;
    
    // Remove quotes if OpenAI added them
    const cleanTranslatedText = translatedText.replace(/^["']|["']$/g, '');
    
    // Check if translation was made
    const isTranslated = cleanTranslatedText.toLowerCase() !== text.toLowerCase();
    const confidence = isTranslated ? 0.8 : 0.9;

    console.log('Translation completed:', { 
      original: text, 
      translated: cleanTranslatedText, 
      isTranslated,
      confidence 
    });

    return new Response(
      JSON.stringify({
        originalText: text,
        translatedText: cleanTranslatedText,
        detectedLanguage: sourceLanguage,
        confidence,
        isTranslated,
        success: true
      } as TranslationResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Helper function to detect if text is already in English
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