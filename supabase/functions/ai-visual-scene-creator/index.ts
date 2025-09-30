import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// TypeScript type imports
import type { UserInfo } from "../_shared/types/index.ts";

// ============= PERFECT AI VISUAL SCENE CREATOR WITH CHARACTER CONSISTENCY =============
// Complete implementation with word-for-word OpenAI prompts and CharacterConsistencyService integration

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Character consistency service - Loaded conditionally for Direct Mode only

// Generate complete visual schema using OpenAI with word-for-word prompts
async function generateCompleteVisualSchema(storyText: string, userInfo: any, sessionId: string, pageNumber: number = 1) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  // PRIORITY 1: Initialize structuredAvatarData early to prevent ReferenceError (ERROR-049 fix)
  let structuredAvatarData = userInfo?.structuredAvatarData;
  
  // If missing, attempt CharacterService generation with fallback
  if (!structuredAvatarData) {
    try {
      const { characterConsistencyService } = await import('../_shared/CharacterConsistencyService.js');
      const characterName = userInfo?.name || 'Child';
      const culturalEnhancements = await characterConsistencyService.getCulturalEnhancements(
        userInfo, 
        sessionId, 
        characterName
      );
      structuredAvatarData = {
        resolvedSkinTone: userInfo?.skinTone || userInfo?.avatar?.skinTone || 'medium',
        assignedHairColor: culturalEnhancements?.hair || 'brown hair',
        source: 'character_service_generation'
      };
      console.log(`✅ [CDN_IMPORT_SUCCESS] Generated structuredAvatarData via CharacterConsistencyService`);
    } catch (error) {
      // Categorize import failure
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCategory = errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')
        ? 'CDN_IMPORT_FAILURE'
        : errorMessage.includes('Cannot find module') || errorMessage.includes('not found')
        ? 'SERVICE_UNAVAILABLE'
        : 'IMPORT_ERROR';
      
      console.warn(`⚠️ [${errorCategory}] CharacterConsistencyService unavailable, using fallback:`, errorMessage);
      structuredAvatarData = {
        resolvedSkinTone: userInfo?.skinTone || userInfo?.avatar?.skinTone || 'medium',
        assignedHairColor: 'brown hair',
        source: 'hardcoded_fallback'
      };
    }
  }

  // Helper: Simplify detailed hair colors to basic categories
  function simplifyHairColor(detailedHair: string | undefined): string {
    if (!detailedHair) return 'brown hair';
    const hair = String(detailedHair).toLowerCase();
    if (hair.includes('blonde') || hair.includes('yellow') || hair.includes('golden')) return 'blonde hair';
    if (hair.includes('red') || hair.includes('ginger') || hair.includes('auburn') || hair.includes('copper')) return 'red hair';
    if (hair.includes('black') || hair.includes('dark') || hair.includes('raven')) return 'black hair';
    return 'brown hair'; // Default fallback
  }

  // Helper: Standardize skin tones to basic categories
  function standardizeSkinTone(rawSkinTone: string | undefined): string {
    if (!rawSkinTone) return 'light skin';
    const skin = String(rawSkinTone).toLowerCase();
    if (skin.includes('pale') || skin.includes('light') || skin.includes('fair')) return 'light skin';
    if (skin.includes('olive') || skin.includes('mediterranean')) return 'olive skin';
    if (skin.includes('dark') || skin.includes('brown') || skin.includes('deep')) return 'dark skin';
    if (skin.includes('medium') || skin.includes('tan')) return 'medium skin';
    return 'light skin'; // Default fallback
  }

  // Helper: Detect basic ethnicity from language and skin tone
  function detectEthnicity(nativeLanguage: string | undefined, skinTone: string): string {
    const lang = (nativeLanguage || 'en').toLowerCase();
    const skin = skinTone.toLowerCase();
    
    // English speakers with basic ethnicity detection
    if (lang === 'en' || lang === 'english') {
      if (skin.includes('dark')) return 'African American';
      return 'American'; // Default for English + light/medium/olive skin
    }
    
    // Use native language as cultural context for non-English
    return ''; // Return empty for non-English (cultural context handled separately)
  }

  // Extract structured avatar data for OpenAI (Scene-Only mode)
  const characterName = userInfo?.name || userInfo?.userName || 'child';
  // Build initial character appearance from frontend userInfo data
  const characterAppearanceParts = [];

  // PRIORITY: Use structured hair color from orchestrator if available, then simplify
  const rawHairColor = structuredAvatarData?.assignedHairColor || userInfo?.hair;
  const basicHairColor = simplifyHairColor(rawHairColor);
  characterAppearanceParts.push(`Hair: ${basicHairColor}`);

  // Extract and standardize skin tone
  const rawSkinTone = structuredAvatarData?.resolvedSkinTone || userInfo?.skinTone || userInfo?.avatar?.skinTone;
  const standardSkinTone = standardizeSkinTone(rawSkinTone);
  characterAppearanceParts.push(`Skin: ${standardSkinTone}`);

  // Add avatar type if available
  const avatarType = userInfo?.avatar?.type || userInfo?.avatarType;
  if (avatarType && String(avatarType).trim()) {
    characterAppearanceParts.push(`Type: ${String(avatarType).trim()}`);
  }

  // Detect and add ethnicity for English speakers
  const nativeLanguage = userInfo?.native_language || userInfo?.nativeLanguage || 'en';
  const ethnicity = detectEthnicity(nativeLanguage, standardSkinTone);
  if (ethnicity) {
    characterAppearanceParts.push(`Ethnicity: ${ethnicity}`);
  }

  // Build character appearance line for OpenAI with basic categories
  const characterData = characterAppearanceParts.join(', ');
  
  console.log(`🎨 Character data for OpenAI (basic categories): ${characterData}`);
  const previousPrimaryScene = null; // Will be implemented with visual history tracking
  const isNonEnglish = nativeLanguage && nativeLanguage !== 'en';
  const culturalContext = isNonEnglish ? `${nativeLanguage} cultural context` : '';

  // WORD-FOR-WORD OpenAI PROMPTS - Phase 1 (lines 625-678 and 682-694 from deprecated JS version)
  const systemPrompt = `Generate a comprehensive visual scene description for children's story image generation.

OBJECTIVE: Create a vivid visual scene description (200-1500 characters recommended) that captures the story moment with complete visual elements, character consistency, and cultural authenticity.

JSON RESPONSE:
{
  "primaryScene": "Rich, detailed visual scene description for image generation with setting, character actions, atmosphere, and comprehensive visual details",
  "backgroundColor": "Background color description (e.g., 'warm golden forest light', 'cool blue sky', 'cozy indoor amber')",
  "lighting": "Lighting description (e.g., 'golden hour sunlight', 'soft morning light', 'magical twilight glow')",
  "composition": "Visual composition description (e.g., 'centered character with forest background', 'close-up with blurred garden')",
  "setting": "Location and environment (e.g., 'magical forest clearing', 'cozy bedroom', 'sunny playground')",
  "mood": "Emotional atmosphere (e.g., 'adventurous and curious', 'peaceful and content', 'excited and playful')",
  "style": "Artistic style (e.g., 'watercolor illustration', 'digital painting', 'children's book art')",
  "secondaryCharacters": {
    "humans": ["list of human characters mentioned in story (e.g., 'mom', 'friend', 'teacher')"],
    "pets": ["list of animals/pets mentioned in story (e.g., 'dog', 'cat', 'bird')"]
  },
  "objects": ["key props and objects in scene (e.g., 'ball', 'tree', 'flowers', 'toys')"]
}

CRITICAL CHARACTER RULES:
Use character appearance data from userInfo.structuredAvatarData EXACTLY as provided (character name, avatar type, hair color, skin tone) - NEVER substitute, modify, or invent these details, and if any data is missing, skip that detail entirely.

VISUAL ENHANCEMENT RULES:
5. Create detailed primary scenes with rich visual descriptions (200-1500 characters)
6. Extract ALL secondary characters from story text and categorize correctly:
   - HUMANS: mom, dad, friend, teacher, brother, sister, grandma, neighbor, people
   - PETS/ANIMALS: dog, cat, bird, rabbit, hamster, fish, horse, any animals
7. Include comprehensive atmospheric details (time of day, weather, indoor/outdoor)
8. Specify background colors, lighting conditions, and visual composition
9. List key objects, props, and visual elements in the scene
10. Preserve exact counts: "a bird" = 1 bird, "birds" = multiple
11. Use visual continuity with previous scene context

ATMOSPHERIC GUIDANCE:
- Time of day: "morning sunlight", "afternoon glow", "evening twilight"
- Indoor/outdoor: "inside the cozy kitchen", "outside in the garden"  
- Weather: "sunny day", "light drizzle", "snowy morning"
- Objects/props: include furniture, toys, nature elements, tools

CULTURAL CONTEXT:
${isNonEnglish ? `- Consider culturally authentic settings: ${culturalContext}` : '- Use universal child-friendly settings'}
${isNonEnglish ? `- Incorporate cultural elements appropriate for ${nativeLanguage} speaking families` : ''}`;

  const userPrompt = `Create a visual scene description for this story page.

CHARACTER APPEARANCE: ${characterData}

STORY TEXT:
"${storyText}"

PREVIOUS SCENE (for visual consistency):
"${previousPrimaryScene || 'None - this is the first scene'}"

Generate a comprehensive scene with complete visual elements including background, lighting, composition, setting, mood, style, secondary characters (categorized as humans vs pets), and key objects. Maintain character and setting continuity while showcasing the current page's action. Use the character appearance data exactly - include the specified hair color and skin tone prominently in the scene description.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    
    if (!content) {
      throw new Error('No content generated by OpenAI');
    }

    // Parse JSON response
    let visualSchema;
    try {
      visualSchema = JSON.parse(content);
    } catch (parseError) {
      // If JSON parse fails, try to extract just primaryScene
      const primarySceneMatch = content.match(/"primaryScene":\s*"([^"]+)"/);
      if (primarySceneMatch && primarySceneMatch[1] && primarySceneMatch[1].length >= 30) {
        // Create minimal schema with just primaryScene
        visualSchema = {
          primaryScene: primarySceneMatch[1],
          backgroundColor: 'warm natural lighting',
          lighting: 'soft daylight',
          composition: 'centered character',
          setting: 'story scene',
          mood: 'cheerful and engaging',
          style: 'children\'s book illustration',
          secondaryCharacters: [],
          objects: []
        };
        console.log('✅ Extracted primaryScene from malformed JSON');
      } else {
        // Only fail if we can't get primaryScene at all
        throw new Error(`No usable primaryScene found in OpenAI response`);
      }
    }

    // Build AI Debug Schema for comprehensive debugging
    const aiDebugSchema = {
      modelUsed: 'gpt-4o-mini',
      systemPrompt: systemPrompt,
      userPrompt: userPrompt,
      characterDataSent: characterData, // Exact string sent to OpenAI
      structuredAvatarData: userInfo?.structuredAvatarData || null, // Use from userInfo if available
      rawUserInfoReceived: {
        hasStructuredAvatar: !!userInfo?.structuredAvatarData,
        avatarSkinTone: userInfo?.avatar?.skinTone,
        skinTone: userInfo?.skinTone,
        avatarHairColor: userInfo?.avatar?.hairColor,
        nativeLanguage: userInfo?.native_language || userInfo?.nativeLanguage,
        fullUserInfo: userInfo
      },
      storyTextLength: storyText.length,
      isNonEnglish: isNonEnglish,
      culturalContext: culturalContext
    };

    // PHASE 4: Retrieve cached secondary characters and enhance visual schema
    let cachedSecondaryCharacters: any[] = [];
    
    try {
      const { characterConsistencyService } = await import('../_shared/CharacterConsistencyService.js');
      cachedSecondaryCharacters = await characterConsistencyService.getSecondaryCharactersForSession(sessionId);
      console.log(`✅ [CDN_IMPORT_SUCCESS] Retrieved ${cachedSecondaryCharacters.length} cached secondary characters for session ${sessionId}`);
    } catch (error) {
      // Categorize import failure
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCategory = errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')
        ? 'CDN_IMPORT_FAILURE'
        : errorMessage.includes('Cannot find module') || errorMessage.includes('not found')
        ? 'SERVICE_UNAVAILABLE'
        : 'IMPORT_ERROR';
      
      console.warn(`⚠️ [${errorCategory}] Failed to retrieve cached secondary characters:`, errorMessage);
    }
    
    // Merge OpenAI-detected and cached secondary characters
    const mergedSecondaryCharacters = {
      humans: [
        ...(visualSchema.secondaryCharacters?.humans || []),
        ...cachedSecondaryCharacters
          .filter(char => char.type !== 'animal' && char.type !== 'pet')
          .map(char => char.name)
      ],
      pets: [
        ...(visualSchema.secondaryCharacters?.pets || []),
        ...cachedSecondaryCharacters
          .filter(char => char.type === 'animal' || char.type === 'pet')
          .map(char => char.name)
      ]
    };

    // Enhance with structured avatar data and cached secondary characters
    const enhancedSchema = {
      ...visualSchema,
      // Add structured avatar data
      characterAppearance: structuredAvatarData,
      // Merge secondary characters from OpenAI and cache
      secondaryCharacters: mergedSecondaryCharacters,
      // Add detailed secondary character data for consistency
      secondaryCharacterDetails: cachedSecondaryCharacters,
      objects: visualSchema.objects || []
    };

    console.log('✅ Generated complete visual schema with character consistency');
    return { visualSchema: enhancedSchema, aiDebugSchema };

  } catch (error) {
    console.error('OpenAI generation failed:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`OpenAI visual scene generation failed: ${errorMessage}`);
  }
}

// Generate character seed - simplified for Scene-Only mode
function generateCharacterSeed(sessionId: string, userInfo: any) {
  const characterName = userInfo?.name || userInfo?.userName || 'child';
  
  return {
    seed: Math.floor(Math.random() * 999999),
    characterName,
    avatarType: userInfo?.avatar?.type || 'child',
    skinTone: userInfo?.avatar?.skinTone || userInfo?.skinTone || 'medium',
    culturalProfile: userInfo?.nativeLanguage !== 'en' ? userInfo?.nativeLanguage : undefined
  };
}

// Call runware-template-cd for Direct Mode image generation
async function callRunwareTemplateCD(payload: any): Promise<string> {
  try {
    const response = await fetch('https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/runware-template-cd', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`runware-template-cd failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.imageURL) {
      throw new Error(`runware-template-cd failed: ${result.error || 'No image URL returned'}`);
    }

    return result.imageURL;
  } catch (error) {
    console.error('Direct Mode image generation failed:', error);
    throw error;
  }
}

// HTTP fallback for Supabase client failures
async function httpFallbackCall(endpoint: string, payload: any): Promise<any> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration for HTTP fallback');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceRoleKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`HTTP fallback failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoints
  if (req.method === 'HEAD' && req.url.includes('/health')) {
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  if (req.method === 'GET') {
    return new Response(JSON.stringify({ 
      status: 'healthy', 
      service: 'ai-visual-scene-creator',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Only allow POST for main functionality
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const requestId = `${Math.random().toString(36).substring(2)}`;
    console.log(`🚀 [${requestId}] ai-visual-scene-creator: POST ${req.url}`);

    // Parse request payload
    let payload: any;
    try {
      payload = await req.json();
    } catch (error) {
      console.error(`❌ [${requestId}] Failed to parse JSON:`, error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON payload'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate required fields - enhanced content checking
    const content = payload.pageText || payload.storyText || payload.content || '';
    if (!content.trim()) {
      console.error(`❌ [${requestId}] Validation failure (no retry): MISSING_STORY_CONTENT`);
      return new Response(JSON.stringify({
        success: false,
        error: 'MISSING_STORY_CONTENT',
        tier: 'VALIDATION_FAILED'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userInfo = payload.userInfo || {};
    const sessionId = payload.sessionId || `session-${requestId}`;
    const pageNumber = payload.pageNumber || 1;
    const directMode = payload.directMode === true;

    console.log(`✅ [${requestId}] Payload validated - Direct Mode: ${directMode}`);

    // PHASE 1 & 2: Generate complete visual schema with character consistency
    console.log(`🎨 [${requestId}] Generating complete visual schema...`);
    const { visualSchema, aiDebugSchema } = await generateCompleteVisualSchema(content, userInfo, sessionId, pageNumber);

    // ARCHITECTURE FIX: Character generation only for Direct Mode
    // Scene-Only mode returns ONLY primaryScene to orchestrator
    // Orchestrator is responsible for character consistency via CharacterConsistencyService
    
    let characterSeed: any = null;
    let culturalBundle: any = null;

    if (directMode) {
      // DIRECT MODE ONLY: Generate character seed and cultural bundle
      console.log(`🎨 [${requestId}] Direct Mode: Generating character data with 3-tier fallback`);
      
      // Generate character seed for consistency
      characterSeed = await generateCharacterSeed(sessionId, userInfo);

      // Generate culturalBundle with 3-tier fallback for Direct Mode
      try {
        // TIER 1: CharacterConsistencyService (session-seeded 73-variation hair)
        const { characterConsistencyService } = await import('../_shared/CharacterConsistencyService.js');
        const culturalEnhancements = await characterConsistencyService.getCulturalEnhancements(
          userInfo,
          sessionId,
          userInfo?.name || 'Child'
        );
        
        culturalBundle = {
          hair: culturalEnhancements.hair || 'natural hair',
          features: culturalEnhancements.features || 'diverse features',
          profile: characterSeed?.culturalProfile || null,
          source: 'CharacterConsistencyService'
        };
        console.log(`✅ [${requestId}] Tier 1: CharacterConsistencyService culturalBundle generated`);
      } catch (tier1Error) {
        console.warn(`⚠️ [${requestId}] Tier 1 failed, falling back to Tier 2 (StaticDataCache)`, tier1Error);
        
        try {
          // TIER 2: StaticDataCache fallback
          const { StaticDataCache } = await import('../_shared/StaticDataCache.js');
          const skinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || 'medium';
          const isDarkSkin = skinTone === 'dark' || skinTone === 'darker';
          
          const hairBundle = isDarkSkin 
            ? StaticDataCache.getCulturalBundle('african', sessionId)
            : StaticDataCache.getHairBySkinTone(skinTone, sessionId);
          
          culturalBundle = {
            hair: hairBundle?.hair || 'natural hair',
            features: isDarkSkin ? 'authentic African American features' : 'diverse features',
            profile: characterSeed?.culturalProfile || null,
            source: 'StaticDataCache'
          };
          console.log(`✅ [${requestId}] Tier 2: StaticDataCache culturalBundle generated`);
        } catch (tier2Error) {
          console.warn(`⚠️ [${requestId}] Tier 2 failed, using Tier 3 (emergency hardcoded)`, tier2Error);
          
          // TIER 3: Emergency hardcoded strings
          const skinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || 'medium';
          const isDarkSkin = skinTone === 'dark' || skinTone === 'darker';
          
          culturalBundle = {
            hair: isDarkSkin ? 'photorealistic detailed textured 4C African American hairstyle' : userInfo?.avatar?.hairColor || 'brown hair',
            features: isDarkSkin ? 'authentic African American features' : 'diverse features',
            profile: characterSeed?.culturalProfile || null,
            source: 'emergency_hardcoded'
          };
          console.log(`✅ [${requestId}] Tier 3: Emergency hardcoded culturalBundle applied`);
        }
      }
    } else {
      // Fallback for Scene-Only mode without orchestrator bundle
      culturalBundle = {
        hair: userInfo?.avatar?.hairColor || 'natural hair',
        features: userInfo?.nativeLanguage !== 'en' ? `${userInfo.nativeLanguage} cultural features` : 'diverse features',
        profile: characterSeed?.culturalProfile || null,
        source: 'minimal_fallback'
      };
    }

    // Get colored objects string
    const coloredObjects = visualSchema.coloredObjects || '';

    // PHASE 3: Handle Direct Mode vs Scene-Only Mode
    let imageURL: string | undefined;
    let tier: string;
    let runwareDebugData: any = {};

    if (directMode) {
      console.log(`🖼️ [${requestId}] Direct Mode: Loading character service for full processing`);
      
      // CONDITIONAL CHARACTER SERVICE LOADING - Only for Direct Mode (NON-FATAL)
      let characterService: any = null;
      let characterAppearance: string | null = null;
      let coloredObjects: string = '';
      let characterServiceAvailable = false;
      
      try {
        const { characterConsistencyService } = await import('#shared/CharacterConsistencyService.js');
        characterService = characterConsistencyService;
        
        // Validate service instance has required methods
        if (!characterService || typeof characterService.getCharacterAppearanceFromStory !== 'function') {
          throw new Error(`CharacterConsistencyService instance not functional - missing required methods`);
        }
        
        characterAppearance = await characterService.getCharacterAppearanceFromStory(sessionId, characterSeed.characterName);
        coloredObjects = await characterService.getColoredObjects(sessionId);
        characterServiceAvailable = true;
        console.log(`✅ [${requestId}] CharacterConsistencyService loaded and data retrieved`);
      } catch (error) {
        console.warn(`⚠️ [${requestId}] CharacterConsistencyService unavailable, continuing with minimal avatar data:`, error);
        characterServiceAvailable = false;
        // Service unavailable is non-fatal - continue with fallback
      }
      
      // Validate structuredAvatarData exists (already initialized at function start)
      if (!structuredAvatarData) {
        console.error(`❌ [${requestId}] Critical error: structuredAvatarData still undefined after initialization`);
        structuredAvatarData = {
          resolvedSkinTone: 'medium',
          assignedHairColor: 'brown hair',
          source: 'emergency_fallback'
        };
      }
      
      console.log(`✅ [${requestId}] Using structuredAvatarData:`, {
        hairColor: structuredAvatarData.assignedHairColor,
        skinTone: structuredAvatarData.resolvedSkinTone,
        source: structuredAvatarData.source
      });
      
      // Prepare payload for runware-template-cd with character consistency data
      const templatePayload = {
        pageText: content,
        userInfo,
        sessionId,
        pageNumber,
        avatarIdentity: {
          type: characterSeed.avatarType,
          skinTone: characterSeed.skinTone,
          name: characterSeed.characterName
        },
        templateComplexity: 'C', // Use Tier 2.5C for nuclear hardcoded template
        failedTierData: {
          enhancedSceneData: visualSchema.primaryScene,
          characterConsistency: characterAppearance || `${characterSeed.characterName} is a ${characterSeed.avatarType} with ${characterSeed.skinTone} skin tone, ${culturalBundle.hair || structuredAvatarData?.assignedHairColor || 'photorealistic detailed textured 4C African American hairstyle'}, and ${culturalBundle.features || 'authentic african american features'}`,
          visualConsistency: `${visualSchema.backgroundColor}, ${visualSchema.lighting}`,
          culturalEnhancements: `${culturalBundle.hair}, ${culturalBundle.features}`,
          structuredAvatarData // Always provide structured avatar data
        }
      };
      
      // runwareDebugData already declared at line 360 (outer scope)
      
      try {
        const response = await fetch('https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/runware-template-cd', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify(templatePayload)
        });

        if (!response.ok) {
          throw new Error(`runware-template-cd failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        if (!result.success || !result.imageURL) {
          throw new Error(`runware-template-cd failed: ${result.error || 'No image URL returned'}`);
        }

        imageURL = result.imageURL;
        
        // Capture Runware debug data for Direct Mode
        runwareDebugData = {
          positivePrompt: result.positivePrompt || result.debug?.positivePrompt,
          negativePrompt: result.negativePrompt || result.debug?.negativePrompt,
          templateUsed: result.templateUsed || 'runware-template-cd',
          templateComplexity: templatePayload.templateComplexity,
          templatePayloadSent: templatePayload
        };
        
        tier = 'DIRECT_MODE';
        console.log(`✅ [${requestId}] Direct Mode image generated successfully`);
      } catch (directError) {
        console.error(`❌ [${requestId}] Direct Mode failed, falling back to Scene-Only:`, directError);
        // Fall back to Scene-Only mode if Direct Mode fails
        tier = 'TIER_1_SCENE_ONLY';
      }
    } else {
      // ARCHITECTURE FIX: Scene-Only mode returns ONLY visual elements
      // NO CHARACTER DATA - orchestrator will handle character consistency
      console.log(`✅ [${requestId}] Scene-Only mode: Returning primaryScene and visual schema to orchestrator`);
      console.log(`🎯 [${requestId}] Orchestrator is responsible for CharacterConsistencyService calls`);
      tier = 'TIER_1_SCENE_ONLY';
    }

    // PHASE 4: Return complete orchestrator-expected schema
    const response = {
      success: true,
      tier,
      // Core visual schema from OpenAI
      primaryScene: visualSchema.primaryScene,
      enhancedPrompt: visualSchema.primaryScene, // enhancedPrompt = primaryScene for orchestrator
      negativePrompt: 'blurry, low quality, dark, scary, violent, inappropriate, adult content, text, watermarks',
      backgroundColor: visualSchema.backgroundColor,
      lighting: visualSchema.lighting,
      composition: visualSchema.composition,
      setting: visualSchema.setting,
      mood: visualSchema.mood,
      style: visualSchema.style,
      secondaryCharacters: visualSchema.secondaryCharacters || [],
      objects: visualSchema.objects || [],
      
      // ARCHITECTURE FIX: Character data only in Direct Mode
      ...(directMode && characterSeed && { characterSeed }),
      ...(directMode && culturalBundle && { culturalBundle }),
      ...(directMode && coloredObjects && { coloredObjects }),
      
      // Metadata for orchestrator
      templateStructure: directMode ? undefined : 'COMPLETE_TIER_1',
      detectedCharacters: visualSchema.detectedCharacters || [],
      
      // DEBUG: Full OpenAI request details for debugging
      aiDebugSchema,
      
      // DEBUG: Runware debug data (Direct Mode only) - Scene-Only mode doesn't have this
      ...(directMode && imageURL && runwareDebugData && { runwareDebugData }),
      
      // Image URL only in Direct Mode
      ...(imageURL && { imageURL }),
      
      // Processing metadata
      requestId,
      timestamp: new Date().toISOString(),
      processingTime: Date.now()
    };

    console.log(`✅ [${requestId}] Response prepared:`, {
      tier: response.tier,
      hasPrimaryScene: !!response.primaryScene,
      hasImageURL: !!response.imageURL,
      secondaryCharacterCount: response.secondaryCharacters.length,
      objectCount: response.objects.length
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('ai-visual-scene-creator error:', errorMessage);
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      tier: 'ERROR'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});