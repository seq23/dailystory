import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { operation, word, words, text, fromLanguage, toLanguage } = await req.json();

    console.log(`Translation Service - Operation: ${operation}`);

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    switch (operation) {
      case 'translate-word': {
        if (!word) {
          return new Response(
            JSON.stringify({ error: 'Word is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check cache first
        const { data: cached } = await supabase
          .from('word_dictionary')
          .select('*')
          .eq('word', word.toLowerCase())
          .eq('target_language', toLanguage || 'en')
          .single();

        if (cached) {
          return new Response(
            JSON.stringify({ 
              translation: cached.translation,
              pronunciation: cached.pronunciation,
              cached: true 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Translate using OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{
              role: 'system',
              content: `You are a translation assistant. Translate the given word to ${toLanguage || 'English'} and provide pronunciation guide. Format: {"translation": "word", "pronunciation": "phonetic"}`
            }, {
              role: 'user',
              content: word
            }],
            max_tokens: 100,
            temperature: 0.1
          })
        });

        const result = await response.json();
        const translationData = JSON.parse(result.choices[0].message.content);

        // Cache the result
        await supabase
          .from('word_dictionary')
          .insert({
            word: word.toLowerCase(),
            translation: translationData.translation,
            pronunciation: translationData.pronunciation,
            target_language: toLanguage || 'en',
            source_language: fromLanguage || 'auto'
          });

        return new Response(
          JSON.stringify({ 
            translation: translationData.translation,
            pronunciation: translationData.pronunciation,
            cached: false 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'translate-batch': {
        if (!words || !Array.isArray(words)) {
          return new Response(
            JSON.stringify({ error: 'Words array is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const translations = [];
        
        for (const word of words.slice(0, 10)) { // Limit to 10 words per batch
          try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{
                  role: 'system',
                  content: `Translate to ${toLanguage || 'English'}. Format: {"translation": "word"}`
                }, {
                  role: 'user',
                  content: word
                }],
                max_tokens: 50,
                temperature: 0.1
              })
            });

            const result = await response.json();
            const translationData = JSON.parse(result.choices[0].message.content);
            
            translations.push({
              original: word,
              translation: translationData.translation
            });
          } catch (error) {
            console.error(`Error translating word "${word}":`, error);
            translations.push({
              original: word,
              translation: word,
              error: 'Translation failed'
            });
          }
        }

        return new Response(
          JSON.stringify({ translations }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'translate-to-english': {
        if (!text) {
          return new Response(
            JSON.stringify({ error: 'Text is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{
              role: 'system',
              content: 'Translate the following text to English. If it\'s already in English, return it as is.'
            }, {
              role: 'user',
              content: text
            }],
            max_tokens: 1000,
            temperature: 0.1
          })
        });

        const result = await response.json();
        const translatedText = result.choices[0].message.content;

        return new Response(
          JSON.stringify({ 
            originalText: text,
            translatedText,
            isTranslated: translatedText !== text
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown operation: ${operation}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Translation Service error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});