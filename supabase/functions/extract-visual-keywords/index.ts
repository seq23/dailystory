import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtractionRequest {
  pageText: string;
  existingContent: {
    subject: string;
    action: string;
    object?: string;
    location?: string;
    descriptor?: string;
  };
}

interface EnhancedKeywords {
  colors: string[];
  objects: string[];
  actions: string[];
  locations: string[];
  descriptors: string[];
  atmosphere: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pageText, existingContent }: ExtractionRequest = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`🎯 Extracting visual keywords from: "${pageText}"`);
    console.log(`📋 Existing content:`, existingContent);

    const systemPrompt = `You are a visual keyword extractor for children's book illustrations. Your job is to identify visual elements that would help an artist create a picture.

Given a sentence from a children's story and what has already been extracted, identify ADDITIONAL visual keywords that would enhance the illustration.

Focus on:
- Colors (red, blue, sparkly, bright, etc.)
- Objects/items not already identified
- Visual descriptors (big, small, fluffy, shiny, etc.)
- Atmospheric elements (sunny, magical, cozy, etc.)
- Setting details for better context

Return ONLY a JSON object with these arrays (empty arrays if nothing found):
{
  "colors": [],
  "objects": [],
  "actions": [],
  "locations": [],
  "descriptors": [],
  "atmosphere": []
}

Be conservative - only include elements that would genuinely improve the visual representation.`;

    const userPrompt = `Text: "${pageText}"

Already extracted:
- Subject: ${existingContent.subject}
- Action: ${existingContent.action}
- Object: ${existingContent.object || 'none'}
- Location: ${existingContent.location || 'none'}
- Descriptor: ${existingContent.descriptor || 'none'}

What additional visual keywords would help create a better illustration?`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 200,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log(`🤖 AI response:`, content);

    let enhancedKeywords: EnhancedKeywords;
    try {
      enhancedKeywords = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Return empty keywords on parse failure
      enhancedKeywords = {
        colors: [],
        objects: [],
        actions: [],
        locations: [],
        descriptors: [],
        atmosphere: []
      };
    }

    console.log(`✨ Enhanced keywords:`, enhancedKeywords);

    return new Response(JSON.stringify({ enhancedKeywords }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-visual-keywords function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      enhancedKeywords: {
        colors: [],
        objects: [],
        actions: [],
        locations: [],
        descriptors: [],
        atmosphere: []
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});