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
async function generateCompleteVisualSchema(
  storyText: string, 
  userInfo: any, 
  sessionId: string, 
  pageNumber: number = 1,
  inputStructuredAvatarData: any = null
): Promise<{ visualSchema: any; aiDebugSchema: any; structuredAvatarData: any }> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  // PRIORITY 1: Get complete structured avatar data from CharacterConsistencyService
  let structuredAvatarData = inputStructuredAvatarData || userInfo?.structuredAvatarData;
  let characterName = userInfo?.name || userInfo?.userName || 'child';
  let ethnicity = '';
  
  // If missing, generate complete structured avatar data using CharacterConsistencyService
  if (!structuredAvatarData) {
    try {
      const { characterConsistencyService } = await import('../_shared/CharacterConsistencyService.js');
      structuredAvatarData = await characterConsistencyService.getStructuredAvatarData(sessionId, userInfo);
      console.log(`✅ Generated complete structuredAvatarData via CharacterConsistencyService:`, structuredAvatarData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️ CharacterConsistencyService unavailable, using fallback:`, errorMessage);
      structuredAvatarData = {
        resolvedSkinTone: userInfo?.skinTone || userInfo?.avatar?.skinTone || 'medium',
        assignedHairColor: 'brown hair',
        skinFeatures: 'medium skin tone with brown eyes',
        ethnicity: 'Euro-American',
        source: 'hardcoded_fallback'
      };
    }
  }

  // Extract ethnicity from structured data
  ethnicity = structuredAvatarData?.ethnicity || 'Euro-American';
  const nativeLanguage = userInfo?.native_language || userInfo?.nativeLanguage || 'en';
  
  // Build complete character data string for OpenAI with detailed features
  const characterData = structuredAvatarData 
    ? `${characterName}, ${structuredAvatarData.hairColor || 'natural hair'}, ${structuredAvatarData.skinFeatures || 'medium skin tone with brown eyes'}, ${ethnicity} ethnicity`
    : `${characterName}, character appearance data from orchestrator`;
  
  console.log(`🎨 Complete character data for OpenAI:`, {
    characterName,
    hair: structuredAvatarData?.hairColor,
    skinFeatures: structuredAvatarData?.skinFeatures,
    ethnicity,
    fullString: characterData
  });
  const previousPrimaryScene = null; // Will be implemented with visual history tracking
  const isNonEnglish = nativeLanguage && nativeLanguage !== 'en';
  
  // Build specific cultural enhancement instructions based on native language
  let culturalContext = '';
  if (isNonEnglish) {
    switch (nativeLanguage) {
      case 'fr':
        culturalContext = 'French cultural elements like Parisian parks near Eiffel Tower, Seine River waterfront scenes, charming café districts with outdoor seating, French gardens with lavender, elegant French architecture, boulangeries';
        break;
      case 'es':
        culturalContext = 'Spanish cultural settings like Mediterranean courtyards, colorful plazas with fountains, vibrant Hispanic neighborhoods, traditional Spanish architecture, sunny patios with potted plants, Spanish gardens';
        break;
      case 'zh':
        culturalContext = 'Chinese cultural elements like traditional gardens with bamboo, pagoda backgrounds, Chinese parks with stone bridges, cultural landmarks, lantern-lit scenes, traditional Chinese architecture';
        break;
      case 'ar':
        culturalContext = 'Middle Eastern cultural settings like desert oasis scenes, traditional Arabic architecture with geometric patterns, cultural landmarks, palm tree gardens, ornate archways';
        break;
      default:
        culturalContext = `${nativeLanguage} cultural context with authentic local settings and architecture`;
    }
  }

  // WORD-FOR-WORD OpenAI PROMPTS - Phase 1 (lines 625-678 and 682-694 from deprecated JS version)
  const systemPrompt = `Generate a comprehensive visual scene description for children's story image generation. Create rich primary scenes (200-1500 characters preferred) with key actions, setting, character descriptions, and other visual details derived from story text with intelligent enhancements and inferences.

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

RULES:
1. Story text priority: absolute driver - never contradict visual details
2. Main action extraction: focus on most visually significant action from story text
3. Character appearance: use provided appearance data exactly as given, enhance unspecified details reasonably (e.g., if hair color provided use it, if not provided skip it or just describe hair styling)
4. Character poses and positioning: infer body positions from story actions ('wakes up' = sitting up in bed with arms stretched, 'runs' = dynamic running pose, 'reads' = sitting/lying with book, 'looks up' = head tilted upward, 'plays' = active engaging pose)
5. Singular/plural intelligence: "a bird" = 1 bird, "the bird" = 1 bird, "birds" = 2-4 birds, "many/lots of birds" = 5+ birds
6. Extract secondary characters: HUMANS (mom, dad, friend, teacher, people), PETS (household animals like dog, cat), ANIMAL CHARACTERS (talking animals, fantasy creatures with speaking roles in the story)
7. Atmospheric details: infer time of day, weather, indoor/outdoor context from story
8. Visual continuity on pages 2+: track object colors/details ('red ball' stays 'red ball'), resolve pronouns to same objects/characters, use previous scene context for consistency

CULTURAL CONTEXT:
${isNonEnglish ? `
CRITICAL: Enhance story settings with specific cultural elements for ${nativeLanguage} speakers:
${culturalContext}

EXAMPLE: For a French speaker named Sarah playing in a park, generate:
"Sarah with ${structuredAvatarData?.hairColor || 'natural hair'} and ${structuredAvatarData?.resolvedSkinTone || 'medium'} skin tone plays joyfully in a charming Parisian park near the Eiffel Tower, with the Seine River visible in the background, surrounded by elegant French gardens with lavender and a quaint café district with outdoor seating. Warm, sophisticated European aesthetic with golden afternoon light."

Use cultural detail naturally without contradicting explicit story settings.` : '- Use universal child-friendly settings with warm, inviting atmospheres'}`;

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
    return { visualSchema: enhancedSchema, aiDebugSchema, structuredAvatarData };

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

    // CRITICAL FIX: Declare structuredAvatarData in main function scope
    let structuredAvatarData: any = null;

    // PHASE 1 & 2: Generate complete visual schema with character consistency
    console.log(`🎨 [${requestId}] Generating complete visual schema...`);
    let visualSchema: any;
    let aiDebugSchema: any;
    
    try {
      const result = await generateCompleteVisualSchema(content, userInfo, sessionId, pageNumber, structuredAvatarData);
      visualSchema = result.visualSchema;
      aiDebugSchema = result.aiDebugSchema;
      structuredAvatarData = result.structuredAvatarData;
      console.log(`✅ [${requestId}] Visual schema generated successfully`);
    } catch (schemaError) {
      const errorMessage = schemaError instanceof Error ? schemaError.message : String(schemaError);
      console.error(`❌ [${requestId}] Visual schema generation failed:`, errorMessage);
      return new Response(JSON.stringify({
        success: false,
        error: `Visual schema generation failed: ${errorMessage}`,
        tier: 'SCHEMA_GENERATION_FAILED'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // CRITICAL FIX: Import characterConsistencyService at main scope (non-fatal)
    let characterConsistencyService: any = null;
    let characterServiceAvailable = false;
    
    try {
      const importResult = await import('../_shared/CharacterConsistencyService.js');
      characterConsistencyService = importResult.characterConsistencyService;
      characterServiceAvailable = true;
      console.log(`✅ [${requestId}] CharacterConsistencyService loaded successfully`);
    } catch (importError) {
      const errorMessage = importError instanceof Error ? importError.message : String(importError);
      console.warn(`⚠️ [${requestId}] CharacterConsistencyService unavailable (non-fatal):`, errorMessage);
      characterServiceAvailable = false;
    }

    // DIRECT MODE ONLY: After primary scene generation, analyze visual details
    if (directMode && characterServiceAvailable && characterConsistencyService) {
      try {
        const characterName = userInfo?.name || userInfo?.userName || 'Child';
        await characterConsistencyService.analyzeVisualDetails(
          sessionId,
          visualSchema.primaryScene,
          pageNumber,
          characterName
        );
        console.log(`✅ [${requestId}] ANALYSIS_APPLIED: Visual details analyzed and cached for page ${pageNumber}`);
      } catch (error) {
        console.warn(`⚠️ [${requestId}] Failed to analyze visual details (non-fatal):`, error);
      }
    }

    // ARCHITECTURE FIX: Character generation only for Direct Mode
    // Scene-Only mode returns ONLY primaryScene to orchestrator
    // Orchestrator is responsible for character consistency via CharacterConsistencyService
    
    let characterSeed: any = null;
    let culturalBundle: any = null;

    if (directMode) {
      // DIRECT MODE ONLY: Generate character seed and cultural bundle
      console.log(`🎨 [${requestId}] Direct Mode: Generating initial character descriptor with 2-tier fallback`);
      
      // Generate character seed for consistency
      characterSeed = await generateCharacterSeed(sessionId, userInfo);

      // Generate culturalBundle using CharacterConsistencyService (inlined functionality)
      if (characterServiceAvailable && characterConsistencyService) {
        try {
          culturalBundle = await characterConsistencyService.getCulturalEnhancements(
            userInfo, 
            sessionId, 
            userInfo?.avatar?.characterName || 'child'
          );
          console.log(`✅ [${requestId}] INITIAL_DESCRIPTOR_SOURCE: CharacterConsistencyService (inlined)`);
        } catch (tier1Error) {
          console.warn(`⚠️ [${requestId}] CharacterConsistencyService.getCulturalEnhancements failed, using emergency hardcoded`, tier1Error);
          characterServiceAvailable = false;
        }
      }
      
      // Fallback if service unavailable or failed
      if (!culturalBundle) {
        console.log(`🔄 [${requestId}] Using emergency hardcoded cultural bundle (Tier 2)`);
        const skinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || 'medium';
        const isDarkSkin = skinTone === 'dark' || skinTone === 'darker';
        
        culturalBundle = {
          hair: isDarkSkin ? 'photorealistic detailed textured 4C African American hairstyle' : userInfo?.avatar?.hairColor || 'brown hair',
          features: isDarkSkin ? 'authentic African American features' : 'diverse features',
          profile: characterSeed?.culturalProfile || null,
          source: 'emergency_hardcoded'
        };
        console.log(`✅ [${requestId}] INITIAL_DESCRIPTOR_SOURCE: Emergency hardcoded (Tier 2)`);
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

    // Get colored objects string from visual schema
    let coloredObjects = visualSchema.coloredObjects || '';

    // PHASE 3: Handle Direct Mode vs Scene-Only Mode
    let imageURL: string | undefined;
    let tier: string;
    let runwareDebugData: any = {};

    if (directMode) {
      console.log(`🖼️ [${requestId}] Direct Mode: Full character processing with service`);
      
      // DIRECT MODE: Get character appearance and colored objects from service
      let characterAppearance: string | null = null;
      
      if (characterServiceAvailable && characterConsistencyService) {
        try {
          characterAppearance = await characterConsistencyService.getCharacterAppearanceFromStory(sessionId, characterSeed?.characterName || 'child');
          const serviceColoredObjects = await characterConsistencyService.getColoredObjects(sessionId);
          if (serviceColoredObjects) {
            coloredObjects = serviceColoredObjects;
          }
          console.log(`✅ [${requestId}] Character data retrieved from service`);
        } catch (error) {
          console.warn(`⚠️ [${requestId}] Failed to retrieve character data from service (non-fatal):`, error);
        }
      } else {
        console.warn(`⚠️ [${requestId}] CharacterConsistencyService unavailable, using minimal fallback data`);
      }
      
      // Validate structuredAvatarData exists
      if (!structuredAvatarData) {
        console.error(`❌ [${requestId}] structuredAvatarData missing, using emergency fallback`);
        structuredAvatarData = {
          resolvedSkinTone: 'medium',
          assignedHairColor: 'brown hair',
          skinFeatures: 'medium skin tone with brown eyes',
          ethnicity: 'Euro-American',
          source: 'emergency_fallback'
        };
      }
      
      console.log(`✅ [${requestId}] Using structuredAvatarData:`, {
        hairColor: structuredAvatarData?.assignedHairColor,
        skinTone: structuredAvatarData?.resolvedSkinTone,
        ethnicity: structuredAvatarData?.ethnicity,
        source: structuredAvatarData?.source
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
      
      // CRITICAL FIX: Include structuredAvatarData in ALL modes for orchestrator
      ...(structuredAvatarData && { structuredAvatarData }),
      
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