import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StoryVisualState {
  sessionId: string;
  characters: Map<string, CharacterData>;
  objects: Map<string, ObjectData>;
  setting?: SettingData;
  locationHistory: string[];
  pronounContext: Map<string, string>;
}

interface CharacterData {
  name: string;
  description: string;
  firstAppearance: number;
  lastSeen: number;
  appearances: number[];
  type: 'primary' | 'secondary' | 'family' | 'community';
}

interface ObjectData {
  name: string;
  type: string;
  attributes: string[];
  firstSeen: number;
  lastSeen: number;
}

interface SettingData {
  location: string;
  time: string;
  weather: string;
  atmosphere: string;
  locked: boolean;
}

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

// In-memory storage for character tracking (in production, this would use a database)
const storyStates = new Map<string, StoryVisualState>();

function getOrCreateStoryState(sessionId: string): StoryVisualState {
  if (!storyStates.has(sessionId)) {
    storyStates.set(sessionId, {
      sessionId,
      characters: new Map(),
      objects: new Map(),
      locationHistory: [],
      pronounContext: new Map()
    });
  }
  return storyStates.get(sessionId)!;
}

function updateCharacterTracking(sessionId: string, characters: CharacterData[], pageNumber: number) {
  const state = getOrCreateStoryState(sessionId);
  
  characters.forEach(char => {
    const existing = state.characters.get(char.name);
    if (existing) {
      existing.lastSeen = pageNumber;
      existing.appearances.push(pageNumber);
    } else {
      state.characters.set(char.name, {
        ...char,
        firstAppearance: pageNumber,
        lastSeen: pageNumber,
        appearances: [pageNumber]
      });
    }
  });
}

function buildCharacterContext(sessionId: string, pageNumber: number): string {
  const state = storyStates.get(sessionId);
  if (!state || state.characters.size === 0) {
    return "";
  }

  const relevantCharacters = Array.from(state.characters.values())
    .filter(char => char.firstAppearance <= pageNumber)
    .sort((a, b) => a.firstAppearance - b.firstAppearance);

  if (relevantCharacters.length === 0) {
    return "";
  }

  const characterDescriptions = relevantCharacters
    .map(char => `${char.name}: ${char.description} (first appeared on page ${char.firstAppearance})`)
    .join('\n');

  return `
PREVIOUSLY INTRODUCED CHARACTERS (maintain consistency):
${characterDescriptions}

IMPORTANT: If any of these characters are referenced in the current page text, use their EXACT descriptions from above. Do not create new descriptions for characters that already exist.`;
}

function detectCharactersInText(text: string, userInfo?: any): CharacterData[] {
  const characters: CharacterData[] = [];
  
  // Detect main character (always primary)
  if (userInfo?.name) {
    characters.push({
      name: userInfo.name,
      description: `${userInfo.avatar?.type || 'child'} with ${userInfo.avatar?.skinTone || 'warm'} skin tone`,
      firstAppearance: 1,
      lastSeen: 1,
      appearances: [],
      type: 'primary'
    });
  }

  // Detect secondary characters mentioned in text
  const animalMatches = text.match(/\b(bird|cat|dog|rabbit|squirrel|butterfly|fox|deer|mouse|turtle)\b/gi);
  if (animalMatches) {
    const uniqueAnimals = [...new Set(animalMatches.map(a => a.toLowerCase()))];
    uniqueAnimals.forEach(animal => {
      characters.push({
        name: animal,
        description: `friendly ${animal}`,
        firstAppearance: 1,
        lastSeen: 1,
        appearances: [],
        type: 'secondary'
      });
    });
  }

  return characters;
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

    if (!storyText || !sessionId) {
      throw new Error('Story text and session ID are required');
    }

    console.log(`📖 Enhanced extraction for session ${sessionId}, page ${pageNumber}/${totalPages}`);

    // Get existing character context
    const characterContext = buildCharacterContext(sessionId, pageNumber);

    // Detect and track new characters on this page
    const detectedCharacters = detectCharactersInText(storyText, userInfo);
    if (detectedCharacters.length > 0) {
      updateCharacterTracking(sessionId, detectedCharacters, pageNumber);
    }

    const systemPrompt = `You are an expert at analyzing children's stories to extract rich visual elements for illustration with perfect character consistency. Your primary goal is to create detailed visual descriptions that accurately reflect what is EXPLICITLY mentioned in the story text while maintaining character consistency across pages.

CRITICAL RULES:
1. ONLY describe characters that are EXPLICITLY mentioned in this specific page's text
2. For characters that have been previously introduced, use their EXACT established descriptions
3. Do NOT add or imagine secondary characters that aren't mentioned in the current page
4. If no secondary character is mentioned on this page, focus ONLY on the main character and setting
5. Maintain visual consistency for all established story elements

Focus on: characters, settings, colors, objects, emotions, atmosphere, lighting, and composition.`;

    const userPrompt = `${characterContext}

Analyze this ${difficultyLevel} level story text for page ${pageNumber} of ${totalPages} and extract the most visually compelling scene:

"${storyText}"

${userInfo ? `The main character is ${userInfo.name}, a ${userInfo.age} year old with ${userInfo.avatar?.type || 'friendly'} appearance and ${userInfo.avatar?.skinTone || 'warm'} skin tone.` : ''}

Create a rich, detailed scene description. Include:
- The most visually interesting moment from the text
- Character emotions and expressions (using established descriptions for known characters)
- Environmental details and atmosphere
- Color palette suggestions based on mood
- Lighting and composition ideas
- Any magical or imaginative elements mentioned in the text

CRITICAL CONSISTENCY RULES:
- For previously introduced characters, use their EXACT established descriptions
- ONLY describe characters that are EXPLICITLY mentioned in THIS PAGE'S text
- Do NOT add secondary characters unless they are specifically mentioned in the current page text
- Maintain visual consistency with established story elements

Focus on creating a scene that would make a beautiful, engaging children's book illustration based ONLY on what is described in the current page's text while maintaining perfect character consistency.`;

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

    console.log(`📖 Enhanced extraction successful for session ${sessionId}, page ${pageNumber}`);

    return new Response(JSON.stringify({
      success: true,
      enhancedDescription,
      sessionId,
      pageNumber,
      characterCount: storyStates.get(sessionId)?.characters.size || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-story-elements-enhanced function:', error);
    
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