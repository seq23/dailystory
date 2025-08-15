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
  storyContext?: {
    previousPages?: string[];
    characterInfo?: {
      name: string;
      traits?: any;
    };
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

// Basic keyword extraction as fallback
function extractBasicKeywords(pageText: string, existingContent: any): EnhancedKeywords {
  const text = pageText.toLowerCase();
  
  const colorWords = ['red', 'blue', 'green', 'yellow', 'pink', 'purple', 'orange', 'black', 'white', 'brown', 'gray', 'golden', 'silver', 'bright', 'dark', 'colorful', 'vibrant', 'sparkly', 'shiny'];
  const atmosphereWords = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'magical', 'mysterious', 'cozy', 'warm', 'cold', 'peaceful', 'busy', 'quiet', 'lively', 'cheerful', 'exciting'];
  const descriptorWords = ['big', 'small', 'tiny', 'huge', 'tall', 'short', 'long', 'wide', 'narrow', 'thick', 'thin', 'fluffy', 'soft', 'hard', 'smooth', 'rough', 'beautiful', 'pretty', 'cute', 'adorable'];
  
  return {
    colors: colorWords.filter(word => text.includes(word) && !existingContent.descriptor?.toLowerCase().includes(word)),
    objects: [], // Keep simple for basic fallback
    actions: [],
    locations: [],
    descriptors: descriptorWords.filter(word => text.includes(word) && !existingContent.descriptor?.toLowerCase().includes(word)),
    atmosphere: atmosphereWords.filter(word => text.includes(word))
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pageText, existingContent, storyContext }: ExtractionRequest = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`🎯 Extracting visual keywords from: "${pageText}"`);
    console.log(`📋 Existing content:`, existingContent);
    if (storyContext) {
      console.log(`📖 Story context:`, storyContext);
    }

    const systemPrompt = `You are a visual keyword extractor for children's book illustrations. Your job is to identify visual elements that would help an artist create a picture.

Given a sentence from a children's story and what has already been extracted, identify ADDITIONAL visual keywords that would enhance the illustration.

IMPORTANT: You have access to story context from previous pages. Use this to understand character continuity and pronoun references:
- "They" often refers to characters mentioned in previous pages
- Character traits (like colors, clothing, appearance) should be consistent with what was established earlier
- Relationships between characters should be maintained

Focus on:
- Colors (red, blue, sparkly, bright, etc.)
- Objects/items not already identified  
- Visual descriptors (big, small, fluffy, shiny, etc.)
- Atmospheric elements (sunny, magical, cozy, etc.)
- Setting details for better context
- Character consistency and relationships

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

    let contextInfo = '';
    if (storyContext?.previousPages && storyContext.previousPages.length > 0) {
      contextInfo = `\n\nStory Context from Previous Pages:
${storyContext.previousPages.map((page, i) => `Page ${i + 1}: "${page}"`).join('\n')}`;
    }
    if (storyContext?.characterInfo) {
      contextInfo += `\n\nMain Character: ${storyContext.characterInfo.name}`;
      if (storyContext.characterInfo.traits) {
        contextInfo += `\nCharacter Traits: ${JSON.stringify(storyContext.characterInfo.traits)}`;
      }
    }

    const userPrompt = `Text: "${pageText}"

Already extracted:
- Subject: ${existingContent.subject}
- Action: ${existingContent.action}
- Object: ${existingContent.object || 'none'}
- Location: ${existingContent.location || 'none'}
- Descriptor: ${existingContent.descriptor || 'none'}${contextInfo}

What additional visual keywords would help create a better illustration? Consider character continuity and relationships from the story context.`;

    // Add timeout wrapper around OpenAI call
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI API timeout after 6000ms')), 6000);
    });

    let enhancedKeywords: EnhancedKeywords;
    
    try {
      const response = await Promise.race([
        fetch('https://api.openai.com/v1/chat/completions', {
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
            max_completion_tokens: 200
          }),
        }),
        timeoutPromise
      ]);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      console.log(`🤖 AI response:`, content);

      try {
        enhancedKeywords = JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse AI response:', content);
        throw new Error('AI response parsing failed');
      }
    } catch (aiError) {
      console.log(`⚠️ AI enhancement failed (${aiError.message}), using basic fallback extraction`);
      
      // Basic fallback keyword extraction from pageText
      enhancedKeywords = extractBasicKeywords(pageText, existingContent);
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