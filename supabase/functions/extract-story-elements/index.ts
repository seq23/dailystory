import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StoryElementsRequest {
  storyText: string;
  pageNumber: number;
  totalPages: number;
  difficultyLevel: string;
  sessionId: string;
  userInfo?: {
    name: string;
    age: number;
    avatar?: {
      type: string;
      skinTone: string;
    };
  };
}

interface StoryElementsResponse {
  enhancedDescription: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { storyText, pageNumber, totalPages, difficultyLevel, sessionId, userInfo }: StoryElementsRequest = await req.json();

    if (!storyText) {
      throw new Error('Story text is required');
    }

    console.log(`📖 Extracting story elements for ${difficultyLevel} level, page ${pageNumber}/${totalPages}`);

    const systemPrompt = `You are an expert at analyzing children's stories to extract rich visual elements for illustration. Focus on: characters, settings, colors, objects, emotions, atmosphere, lighting, and composition. Create detailed, vivid descriptions that capture the essence of the scene. Output direct descriptive text suitable for children's book illustration prompts, not JSON. Keep age-appropriate and engaging.`;

    const userPrompt = `Analyze this ${difficultyLevel} level story text for page ${pageNumber} of ${totalPages} and extract the most visually compelling scene:

"${storyText}"

${userInfo ? `The main character is ${userInfo.name}, a ${userInfo.age} year old with ${userInfo.avatar?.type || 'friendly'} appearance and ${userInfo.avatar?.skinTone || 'warm'} skin tone.` : ''}

Create a rich, detailed scene description that goes beyond simple keyword matching. Include:
- The most visually interesting moment from the text
- Character emotions and expressions
- Environmental details and atmosphere
- Color palette suggestions based on mood
- Lighting and composition ideas
- Any magical or imaginative elements

IMPORTANT: If there are secondary characters (like animals or companions), describe them as SINGULAR entities (one blue bird, not multiple birds). Focus on ONE main character and at most ONE secondary character per scene.

Focus on creating a scene that would make a beautiful, engaging children's book illustration regardless of the setting (woods, city, home, fantasy, etc.). The AI should detect and enhance the natural visual appeal of ANY story context.`;

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
        max_completion_tokens: 500
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('No content received from OpenAI:', data);
      throw new Error('No content received from OpenAI');
    }

    const enhancedDescription = data.choices[0].message.content.trim();

    console.log(`📖 Successfully extracted story elements: ${enhancedDescription.substring(0, 100)}...`);

    return new Response(JSON.stringify({
      success: true,
      enhancedDescription,
      sessionId,
      pageNumber
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-story-elements function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      fallbackSuggestion: 'Use static analysis as fallback'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});