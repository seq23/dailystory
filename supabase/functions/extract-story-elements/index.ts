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

// Story Visual State Manager - Character Seeding Integration
interface CharacterState {
  name: string;
  description: string;
  seed?: number;
  lastUsedPage: number;
  successfulPrompts: string[];
}

interface StoryVisualState {
  sessionId: string;
  characters: Map<string, CharacterState>;
  currentPage: number;
  totalPages: number;
}

// In-memory character seeding storage (integrates with main StoryVisualStateManager)
const storyStates = new Map<string, StoryVisualState>();

interface StoryElementsResponse {
  enhancedDescription: string;
}

// Character seeding helper functions
function getOrCreateStoryState(sessionId: string, totalPages: number = 10): StoryVisualState {
  if (!storyStates.has(sessionId)) {
    storyStates.set(sessionId, {
      sessionId,
      characters: new Map(),
      currentPage: 1,
      totalPages
    });
    console.log(`🎭 Created character seeding state for session: ${sessionId}`);
  }
  return storyStates.get(sessionId)!;
}

function updateCharacterWithSeed(
  sessionId: string,
  characterName: string,
  description: string,
  seed?: number,
  pageNumber: number = 1
): void {
  const state = getOrCreateStoryState(sessionId);
  
  const existingChar = state.characters.get(characterName);
  const characterState: CharacterState = {
    name: characterName,
    description,
    seed: seed || existingChar?.seed || Math.floor(Math.random() * 999999),
    lastUsedPage: pageNumber,
    successfulPrompts: existingChar?.successfulPrompts || []
  };
  
  state.characters.set(characterName, characterState);
  
  console.log(`🎭 Character "${characterName}" locked with seed: ${characterState.seed} for consistency`);
}

function getCharacterDescription(sessionId: string, characterName: string): string | undefined {
  const state = storyStates.get(sessionId);
  return state?.characters.get(characterName)?.description;
}

function buildCharacterConsistencyContext(sessionId: string, pageNumber: number, userInfo?: any): string {
  const state = storyStates.get(sessionId);
  if (!state) return '';

  const contextParts: string[] = [];
  
  // Add main character consistency if exists
  if (userInfo?.name) {
    const mainCharDescription = getCharacterDescription(sessionId, userInfo.name);
    if (mainCharDescription) {
      contextParts.push(`MAIN CHARACTER LOCKED APPEARANCE: ${userInfo.name} - ${mainCharDescription}`);
    } else {
      // Lock main character on first appearance
      const description = createMainCharacterDescription(userInfo);
      updateCharacterWithSeed(sessionId, userInfo.name, description, undefined, pageNumber);
      contextParts.push(`MAIN CHARACTER LOCKED APPEARANCE: ${userInfo.name} - ${description}`);
    }
  }

  // Add secondary character consistency
  const secondaryChars = Array.from(state.characters.values())
    .filter(char => char.name !== userInfo?.name && char.lastUsedPage < pageNumber);
  
  if (secondaryChars.length > 0) {
    const secondaryDescriptions = secondaryChars
      .map(char => `${char.name} - ${char.description}`)
      .join('\n');
    contextParts.push(`SECONDARY CHARACTERS LOCKED APPEARANCE:\n${secondaryDescriptions}`);
  }

  return contextParts.length > 0 ? contextParts.join('\n\n') + '\n\n' : '';
}

function createMainCharacterDescription(userInfo: any): string {
  const { name, age, avatar } = userInfo;
  const avatarType = avatar?.type || 'child';
  const skinTone = avatar?.skinTone || 'medium';
  
  // Enhanced African American hair texture descriptions for authenticity
  const africanAmericanHairStyles = [
    'beautiful natural afro hair texture',
    'gorgeous kinky-curly hair texture', 
    'lovely coily hair in a neat afro',
    'stunning natural curls and coils',
    'beautiful tightly coiled hair texture',
    'gorgeous 4c natural hair texture',
    'lovely natural hair in tight curls'
  ];
  
  let hairDescription = 'neat hair';
  let skinDescription = `${skinTone} skin tone`;
  
  // Authentic representation for African American characters
  if (skinTone === 'dark') {
    const randomHair = africanAmericanHairStyles[Math.floor(Math.random() * africanAmericanHairStyles.length)];
    hairDescription = randomHair;
    skinDescription = 'rich cocoa skin tone';
  }
  
  return `${age} year old ${avatarType} with ${skinDescription}, ${hairDescription}, bright expressive eyes, and a joyful smile`;
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

    console.log(`📖 Extracting story elements with character seeding for ${difficultyLevel} level, page ${pageNumber}/${totalPages}, session: ${sessionId}`);

    // Initialize character seeding state
    getOrCreateStoryState(sessionId, totalPages);
    
    // Build character consistency context
    const characterContext = buildCharacterConsistencyContext(sessionId, pageNumber, userInfo);

    const systemPrompt = `You are an expert at analyzing children's stories to extract rich visual elements for illustration with PERFECT CHARACTER CONSISTENCY. Your primary goal is to create detailed visual descriptions that accurately reflect what is EXPLICITLY mentioned in the story text while maintaining locked character appearance across all pages.

CRITICAL CHARACTER CONSISTENCY RULES:
1. ALWAYS use the EXACT locked character descriptions provided in the character context
2. NEVER change or modify locked character appearances - they are SET IN STONE
3. If a character has a locked appearance, use those EXACT details (skin tone, hair texture, facial features)
4. ONLY describe characters that are EXPLICITLY mentioned in this specific page's text
5. Do NOT add or imagine secondary characters that aren't mentioned in the current page
6. Character appearance consistency is MORE IMPORTANT than creative description

For African American characters with dark skin tone: ALWAYS maintain authentic features including specific hair textures (afro, kinky, coily, natural curls), rich skin tones, and consistent facial features.

Focus on: settings, colors, objects, emotions, atmosphere, lighting, and composition while keeping character appearance LOCKED.`;

    const userPrompt = `${characterContext}STORY TEXT ANALYSIS for page ${pageNumber} of ${totalPages}:

"${storyText}"

CRITICAL CHARACTER CONSISTENCY REQUIREMENTS:
- Use ONLY the locked character descriptions provided above
- For ${userInfo?.name || 'the main character'}: NEVER change their locked appearance
- Maintain African American authenticity if character has dark skin tone (afro/natural hair, rich skin tone)
- Character appearance is LOCKED and cannot be modified

Create a rich, detailed scene description that includes:
- The most visually interesting moment from the text
- Character emotions and expressions (using LOCKED appearance descriptions)
- Environmental details and atmosphere  
- Color palette suggestions based on mood
- Lighting and composition ideas
- Any magical or imaginative elements mentioned in the text

CHARACTER CONSISTENCY RULES:
- ONLY describe characters that are EXPLICITLY mentioned in THIS PAGE'S text
- For characters with locked appearances, use their EXACT established descriptions
- Do NOT add secondary characters unless they are specifically mentioned in the current page text
- Do NOT modify locked character features (hair texture, skin tone, facial features)
- Character consistency takes precedence over creative interpretation

Focus on creating a scene for a beautiful children's book illustration while maintaining PERFECT character consistency.`;

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

    // Track successful character descriptions for future consistency
    if (userInfo?.name) {
      const state = getOrCreateStoryState(sessionId, totalPages);
      const character = state.characters.get(userInfo.name);
      if (character) {
        character.successfulPrompts.push(enhancedDescription.substring(0, 200));
        if (character.successfulPrompts.length > 3) {
          character.successfulPrompts.shift();
        }
      }
    }

    console.log(`📖 Successfully extracted story elements with character seeding: ${enhancedDescription.substring(0, 100)}...`);

    return new Response(JSON.stringify({
      success: true,
      enhancedDescription,
      sessionId,
      pageNumber,
      charactersSeed: storyStates.get(sessionId)?.characters.size || 0
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