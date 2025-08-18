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

// Dynamic character detection for ALL character types
function detectCharactersInText(storyText: string, userInfo?: any): { name: string; type: string; description?: string }[] {
  const characters: { name: string; type: string; description?: string }[] = [];
  
  // Add main character if mentioned
  if (userInfo?.name && storyText.toLowerCase().includes(userInfo.name.toLowerCase())) {
    characters.push({ name: userInfo.name, type: 'primary' });
  }

  // Animal patterns - detect animals with descriptive words
  const animalPatterns = [
    // Common animals with descriptors
    /\b(?:a|the|this|that)?\s*(?:(blue|red|yellow|green|brown|black|white|gray|orange|purple|pink|big|small|little|tiny|fuzzy|fluffy)\s+)?(bird|cat|dog|rabbit|squirrel|mouse|horse|duck|fish|butterfly|bee|frog|turtle|bear|fox|owl|eagle|robin|sparrow|cardinal|jay|dove|crow|raven|parrot|puppy|kitten|bunny)\b/gi,
    // Family animals with descriptors  
    /\b(?:mama|papa|mother|father|baby|little|big)\s+(bird|cat|dog|rabbit|squirrel|mouse|horse|duck|fish|butterfly|bee|frog|turtle|bear|fox|owl|eagle|robin|sparrow|cardinal|jay|dove|crow|raven|parrot)\b/gi,
    // Named animals (pets)
    /\b([A-Z][a-z]+)\s+(?:the\s+)?(bird|cat|dog|rabbit|squirrel|mouse|horse|duck|fish|butterfly|bee|frog|turtle|bear|fox|owl|eagle|robin|sparrow|cardinal|jay|dove|crow|raven|parrot)\b/gi
  ];

  animalPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(storyText)) !== null) {
      const fullMatch = match[0].trim();
      const descriptor = match[1] || '';
      const animal = match[2] || match[match.length - 1];
      
      // Create character name and description
      const characterName = fullMatch.includes('the ') ? fullMatch : `the ${fullMatch}`;
      const description = descriptor ? `${descriptor} ${animal}` : animal;
      
      if (!characters.some(c => c.name.toLowerCase() === characterName.toLowerCase())) {
        characters.push({ 
          name: characterName, 
          type: 'animal',
          description: `${description} with consistent ${descriptor || 'natural'} coloring and appearance`
        });
      }
    }
  });

  // Family member patterns
  const familyPatterns = [
    /\b(mom|mother|mama|mommy|dad|father|papa|daddy|sister|brother|grandma|grandpa|grandmother|grandfather|aunt|uncle|cousin)\b/gi
  ];

  familyPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(storyText)) !== null) {
      const familyMember = match[1].toLowerCase();
      const characterName = familyMember;
      
      if (!characters.some(c => c.name.toLowerCase() === characterName)) {
        characters.push({ 
          name: characterName, 
          type: 'family',
          description: createFamilyMemberDescription(familyMember, userInfo)
        });
      }
    }
  });

  // Named people (proper nouns that aren't the main character)
  const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g;
  let match;
  while ((match = namePattern.exec(storyText)) !== null) {
    const name = match[1];
    if (name !== userInfo?.name && 
        !['The', 'And', 'But', 'Or', 'So', 'When', 'Where', 'What', 'How', 'Why'].includes(name) &&
        !characters.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      characters.push({ 
        name, 
        type: 'secondary',
        description: createSecondaryCharacterDescription(name, userInfo)
      });
    }
  }

  return characters;
}

function createFamilyMemberDescription(familyRole: string, userInfo?: any): string {
  const age = userInfo?.age || 6;
  const skinTone = userInfo?.avatar?.skinTone || 'medium';
  
  const ageMap: { [key: string]: string } = {
    'mom': 'adult woman',
    'mother': 'adult woman', 
    'mama': 'adult woman',
    'mommy': 'adult woman',
    'dad': 'adult man',
    'father': 'adult man',
    'papa': 'adult man', 
    'daddy': 'adult man',
    'sister': age > 8 ? 'older girl' : 'younger girl',
    'brother': age > 8 ? 'older boy' : 'younger boy',
    'grandma': 'elderly woman',
    'grandmother': 'elderly woman',
    'grandpa': 'elderly man',
    'grandfather': 'elderly man'
  };

  const baseDescription = ageMap[familyRole] || 'adult person';
  
  // Match family skin tone for consistency
  let skinDescription = `${skinTone} skin tone`;
  if (skinTone === 'dark') {
    skinDescription = 'rich cocoa skin tone, beautiful natural hair texture';
  }
  
  return `${baseDescription} with ${skinDescription}, warm caring expression, family resemblance`;
}

function createSecondaryCharacterDescription(name: string, userInfo?: any): string {
  const age = userInfo?.age || 6;
  const isChild = age < 12;
  
  if (isChild) {
    return `child around ${age} years old, friendly appearance, bright expressive eyes`;
  } else {
    return `person with kind appearance, warm friendly expression`;
  }
}

function buildCharacterConsistencyContext(sessionId: string, pageNumber: number, storyText: string, userInfo?: any): string {
  const state = storyStates.get(sessionId);
  if (!state) return '';

  // Detect ALL characters in current page text
  const detectedCharacters = detectCharactersInText(storyText, userInfo);
  
  // Lock appearance for any new characters detected
  detectedCharacters.forEach(char => {
    if (!state.characters.has(char.name)) {
      let description = char.description;
      
      // Create main character description if it's the primary character
      if (char.type === 'primary' && userInfo?.name === char.name) {
        description = createMainCharacterDescription(userInfo);
      }
      
      updateCharacterWithSeed(sessionId, char.name, description || char.name, undefined, pageNumber);
      console.log(`🎭 NEW CHARACTER DETECTED: ${char.name} (${char.type}) - locked for consistency`);
    }
  });

  const contextParts: string[] = [];
  
  // Add main character consistency if exists
  if (userInfo?.name) {
    const mainCharDescription = getCharacterDescription(sessionId, userInfo.name);
    if (mainCharDescription) {
      contextParts.push(`MAIN CHARACTER LOCKED APPEARANCE: ${userInfo.name} - ${mainCharDescription}`);
    }
  }

  // Add ALL other character consistency (secondary, animals, family)
  const allOtherChars = Array.from(state.characters.values())
    .filter(char => char.name !== userInfo?.name);
  
  if (allOtherChars.length > 0) {
    const characterDescriptions = allOtherChars
      .map(char => `${char.name} - ${char.description}`)
      .join('\n');
    contextParts.push(`ALL SECONDARY CHARACTERS LOCKED APPEARANCE:\n${characterDescriptions}`);
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
    
    // Build character consistency context with dynamic detection
    const characterContext = buildCharacterConsistencyContext(sessionId, pageNumber, storyText, userInfo);

    const systemPrompt = `You are an expert at analyzing children's stories to extract rich visual elements for illustration with PERFECT CHARACTER CONSISTENCY. Your primary goal is to create detailed visual descriptions that accurately reflect what is EXPLICITLY mentioned in the story text while maintaining locked character appearance across all pages.

CRITICAL CHARACTER CONSISTENCY RULES:
1. ALWAYS use the EXACT locked character descriptions provided in the character context
2. NEVER change or modify locked character appearances - they are SET IN STONE
3. If a character has a locked appearance, use those EXACT details (skin tone, hair texture, facial features)
4. ALL characters (primary, secondary, animals, family) mentioned in text get consistent appearance
5. Secondary characters like animals (blue bird, etc.) maintain EXACT same appearance across all pages
6. Character appearance consistency is MORE IMPORTANT than creative description
7. Animal characters keep consistent colors and features (e.g., blue bird stays blue with same features)

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
- ALL characters mentioned in THIS PAGE'S text get consistent locked appearances
- For characters with locked appearances, use their EXACT established descriptions
- Secondary characters (animals, family, friends) maintain EXACT same appearance across pages
- Animal characters keep consistent colors/features (blue bird = always blue, same size/features)
- Do NOT modify any locked character features (hair texture, skin tone, facial features, animal colors)
- Character consistency takes precedence over creative interpretation
- New characters detected get locked appearance immediately for future consistency

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

    // Track successful character descriptions for ALL characters for future consistency
    const state = getOrCreateStoryState(sessionId, totalPages);
    state.characters.forEach((character) => {
      character.successfulPrompts.push(enhancedDescription.substring(0, 200));
      if (character.successfulPrompts.length > 3) {
        character.successfulPrompts.shift();
      }
    });

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