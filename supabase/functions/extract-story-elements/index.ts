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

interface ExtractedStoryElements {
  characters: {
    primary: string[];
    relationships: string[];
  };
  scene: {
    setting: string;
    atmosphere: string;
    lighting: string;
    weather: string;
  };
  action: {
    mainActivity: string;
    emotion: string;
    intensity: string;
  };
  visual: {
    colors: string[];
    objects: string[];
    perspective: string;
    composition: string;
  };
  context: {
    storyProgression: string;
    thematicElements: string[];
  };
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

    const systemPrompt = `You are an expert children's story analyst who extracts visual and narrative elements for high-quality image generation. Your task is to analyze story text and identify rich, detailed elements that will create engaging, consistent, and age-appropriate illustrations.

Focus on:
- Character descriptions, emotions, and relationships
- Setting details including atmosphere, lighting, and mood
- Visual elements like colors, objects, and composition
- Story context and thematic elements

Return a JSON object with the following structure:
{
  "characters": {
    "primary": ["main character names/descriptions"],
    "relationships": ["character interaction descriptions"]
  },
  "scene": {
    "setting": "detailed location description",
    "atmosphere": "mood and feeling of the scene",
    "lighting": "lighting conditions and quality",
    "weather": "weather or environmental conditions"
  },
  "action": {
    "mainActivity": "primary action or activity happening",
    "emotion": "dominant emotional tone",
    "intensity": "energy level of the scene"
  },
  "visual": {
    "colors": ["specific colors mentioned or implied"],
    "objects": ["important objects, items, or props"],
    "perspective": "suggested viewing angle or perspective",
    "composition": "how elements should be arranged"
  },
  "context": {
    "storyProgression": "where this fits in the story arc",
    "thematicElements": ["key themes or messages"]
  }
}

Be specific and detailed, but keep content age-appropriate for children. Extract subtle visual cues that might be missed by simple keyword matching.`;

    const userPrompt = `Analyze this ${difficultyLevel} level story text for page ${pageNumber} of ${totalPages}:

"${storyText}"

${userInfo ? `The main character is ${userInfo.name}, a ${userInfo.age} year old with ${userInfo.avatar?.type || 'friendly'} appearance and ${userInfo.avatar?.skinTone || 'warm'} skin tone.` : ''}

Extract rich visual and narrative elements that will help create a compelling, detailed illustration. Focus on elements that might be missed by simple keyword matching - subtle emotions, implied colors, atmospheric details, character relationships, and visual composition suggestions.`;

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
        max_tokens: 800,
        response_format: { type: "json_object" }
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

    let extractedElements: ExtractedStoryElements;
    try {
      const content = data.choices[0].message.content.trim();
      extractedElements = JSON.parse(content);
      
      // Validate the structure
      if (!extractedElements.characters || !extractedElements.scene || !extractedElements.visual) {
        throw new Error('Invalid AI response structure');
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', data.choices[0].message.content);
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }

    console.log(`📖 Successfully extracted story elements: ${extractedElements.characters.primary.join(', ')} in ${extractedElements.scene.setting}`);

    return new Response(JSON.stringify({
      success: true,
      elements: extractedElements,
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