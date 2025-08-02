import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { word, targetLanguage, context } = await req.json()

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Translation service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create translation prompt
    const prompt = `Translate the English word "${word}" to ${getLanguageName(targetLanguage)}. 
    ${context ? `Context: "${context}"` : ''}
    
    Provide ONLY the translation of the word, nothing else. If the word has multiple meanings, choose the most appropriate one based on the context (if provided). For children's reading level.
    
    Format your response as just the translated word(s).`

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful translation assistant for children learning English. Provide only the translated word, nothing else.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 50
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const result = await response.json()
    const translation = result.choices?.[0]?.message?.content?.trim() || 'Translation unavailable'

    return new Response(
      JSON.stringify({
        word,
        targetLanguage,
        translation,
        translated_word: translation
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Translation error:', error)
    return new Response(
      JSON.stringify({ error: 'Translation failed', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    'ar': 'Arabic',
    'es': 'Spanish', 
    'zh': 'Chinese',
    'hi': 'Hindi',
    'pt': 'Portuguese',
    'fr': 'French'
  }
  return languages[code] || code
}