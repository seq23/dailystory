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

// Basic sentence generation as fallback
function generateBasicSentence(pageText: string, existingContent: any): string {
  const text = pageText.toLowerCase();
  const colorWords = ['bright', 'colorful', 'vibrant', 'sparkly', 'shiny'];
  const atmosphereWords = ['sunny', 'magical', 'cozy', 'warm', 'peaceful', 'cheerful'];
  const descriptorWords = ['beautiful', 'pretty', 'cute', 'adorable'];
  
  const foundColors = colorWords.filter(word => text.includes(word));
  const foundAtmosphere = atmosphereWords.filter(word => text.includes(word));
  const foundDescriptors = descriptorWords.filter(word => text.includes(word));
  
  const elements = [...foundColors, ...foundAtmosphere, ...foundDescriptors].slice(0, 3);
  return elements.length > 0 ? elements.join(', ') : 'warm, inviting children\'s scene';
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

    const systemPrompt = `Extract visual elements from children's story text into a prompt-ready format.

Focus on:
- Visual descriptors (colors, sizes, textures)
- Key objects and characters
- Setting and atmosphere
- Actions and emotions

Output format: Single descriptive sentence ready for image generation.

Example input: "Lucy found a sparkly blue shell on the sandy beach"
Example output: "young girl discovering shiny blue seashell on sunny beach, warm golden sand, ocean waves in background"

Keep prompts:
- Under 200 characters when possible
- Focused on visual elements only
- Child-appropriate and wholesome
- Ready to append to style suffixes`;

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

Transform this into a visual prompt sentence. Consider character continuity from story context.`;

    // Add timeout wrapper around OpenAI call
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI API timeout after 6000ms')), 6000);
    });

    let enhancedPrompt: string;
    
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
            max_completion_tokens: 150
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
      enhancedPrompt = data.choices[0].message.content.trim();
      
      console.log(`🤖 AI enhanced prompt:`, enhancedPrompt);
    } catch (aiError) {
      console.log(`⚠️ AI enhancement failed (${aiError.message}), using basic fallback`);
      
      // Basic fallback sentence generation
      enhancedPrompt = generateBasicSentence(pageText, existingContent);
    }

    console.log(`✨ Final enhanced prompt:`, enhancedPrompt);

    return new Response(JSON.stringify({ enhancedPrompt }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-visual-keywords function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      enhancedPrompt: "warm, inviting children's scene"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});