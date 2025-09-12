// Redeploy touch: 2025-09-12T18:45:32Z - Force complete rebuild
console.log("[correct-spelling] Loaded: 2025-09-12T18:45:32Z");
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SpellingRequest {
  text: string;
  gradeLevel: string;
  context?: string;
}

Deno.serve(async (req) => {
  console.log('correct-spelling function called');

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

    const requestData: SpellingRequest = await req.json();
    console.log('Spelling correction request:', requestData);

    const { text, gradeLevel, context } = requestData;
    
    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'No text provided for spelling correction' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create context-aware prompt for spelling correction
    let prompt = `Please correct any spelling errors in the following text. `;
    
    if (context === 'user_form_input') {
      prompt += `This is user input from a children's story app form field for grade ${gradeLevel}. `;
      prompt += `Keep corrections simple and appropriate for children. `;
    }
    
    prompt += `Only fix obvious spelling mistakes - do not change the meaning or add words. `;
    prompt += `If the text is already correctly spelled, return it unchanged.`;
    prompt += `\n\nText to correct: "${text}"\n\nCorrected text:`;

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
            content: 'You are a helpful spelling correction assistant. Fix only obvious spelling errors without changing meaning. Provide only the corrected text, without explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.1, // Low temperature for consistent corrections
      }),
    });

    if (!openAiResponse.ok) {
      console.error('OpenAI API error:', await openAiResponse.text());
      // Fallback to original text
      return new Response(
        JSON.stringify({ 
          correctedText: text,
          hadErrors: false,
          confidence: 0.1
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    const openAiData = await openAiResponse.json();
    const correctedText = openAiData.choices[0]?.message?.content?.trim() || text;
    
    // Check if any corrections were made
    const hadErrors = correctedText !== text;
    const confidence = hadErrors ? 0.8 : 0.9;

    console.log('Spelling correction completed:', { 
      original: text, 
      corrected: correctedText, 
      hadErrors,
      confidence 
    });

    return new Response(
      JSON.stringify({ 
        correctedText,
        hadErrors,
        confidence,
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
    console.error('Spelling correction error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Spelling correction failed',
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