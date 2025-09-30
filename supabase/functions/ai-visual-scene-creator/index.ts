import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// TypeScript type imports
import type { UserInfo } from "../_shared/types/index.ts";
import { CharacterConsistencyService } from '../_shared/CharacterConsistencyService.js';

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

  // Extract structured avatar data for OpenAI (Scene-Only mode)
  const characterName = userInfo?.name || userInfo?.userName || 'child';
  let structuredAvatarData: any = {};
  
  // Use passed structured avatar data from runware-generate-image, or generate fallback
  // Only use structuredAvatarData if it exists - no fallback generation
  if (userInfo?.structuredAvatarData) {
    structuredAvatarData = userInfo.structuredAvatarData;
  } else {
    structuredAvatarData = undefined;
  }

  // Prepare variables for word-for-word prompts with structured avatar data
  const characterData = JSON.stringify(structuredAvatarData);
  const previousPrimaryScene = null; // Will be implemented with visual history tracking
  const nativeLanguage = userInfo?.native_language || userInfo?.nativeLanguage || 'en';
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
      structuredAvatarData: structuredAvatarData, // The actual object
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

    // Enhance with structured avatar data
    const enhancedSchema = {
      ...visualSchema,
      // Add structured avatar data
      characterAppearance: structuredAvatarData,
      // Keep original secondary characters and objects from OpenAI
      secondaryCharacters: visualSchema.secondaryCharacters || [],
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

    // Generate character seed for consistency
    const characterSeed = await generateCharacterSeed(sessionId, userInfo);

    // Create cultural bundle
    const culturalBundle = {
      hair: userInfo?.avatar?.hairColor || undefined,
      features: userInfo?.nativeLanguage !== 'en' ? `${userInfo.nativeLanguage} cultural features` : 'diverse features',
      profile: characterSeed.culturalProfile
    };

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
      
      // PRIORITY 1: Use orchestrator-generated structuredAvatarData if available
      let structuredAvatarData = userInfo?.structuredAvatarData;
      
      if (structuredAvatarData) {
        console.log(`✅ [${requestId}] Using orchestrator structuredAvatarData:`, {
          hairColor: structuredAvatarData.assignedHairColor,
          skinTone: structuredAvatarData.resolvedSkinTone,
          source: 'orchestrator'
        });
      } else {
        // PRIORITY 2: Generate structuredAvatarData using CharacterConsistencyService (73-variation session-seeded hair)
        console.log(`🔄 [${requestId}] No orchestrator data - generating structuredAvatarData via CharacterConsistencyService`);
        
        try {
          const characterService = new CharacterConsistencyService();
          const culturalEnhancements = await characterService.getCulturalEnhancements(
            sessionId,
            userInfo?.name || 'Child',
            {
              name: userInfo?.name || 'Child',
              age: userInfo?.age || 7,
              skinTone: userInfo?.skinTone || userInfo?.avatarIdentity?.skinTone || 'medium',
              avatarType: userInfo?.avatarIdentity?.type || 'girl'
            },
            userInfo,
            sessionId // Use sessionId as seed for consistency
          );
          
          structuredAvatarData = {
            resolvedSkinTone: culturalEnhancements.skinTone || userInfo?.skinTone || 'medium',
            assignedHairColor: culturalEnhancements.hair || 'brown hair',
            source: 'character_service_generation'
          };
          
          console.log(`✅ [${requestId}] Generated structuredAvatarData via CharacterConsistencyService:`, structuredAvatarData);
        } catch (error) {
          console.error(`❌ [${requestId}] CharacterConsistencyService generation failed:`, error);
          
          // PRIORITY 3: Emergency fallback - Use hardcoded map only if service fails
          console.warn(`⚠️ [${requestId}] Falling back to hardcoded hair map`);
          const FALLBACK_HAIR_MAP = {
            pale: 'platinum blonde hair',
            light: 'golden blonde hair',
            medium: 'chestnut brown hair',
            olive: 'dark brown hair',
            dark: 'black hair'
          };
          
          const normalizedSkinTone = (userInfo?.skinTone || 'medium').toLowerCase().trim();
          const mappedHair = FALLBACK_HAIR_MAP[normalizedSkinTone] || FALLBACK_HAIR_MAP.medium;
          
          structuredAvatarData = {
            resolvedSkinTone: normalizedSkinTone,
            assignedHairColor: mappedHair,
            source: 'fallback_map'
          };
          
          console.log(`🎨 [${requestId}] CREATED fallback structuredAvatarData:`, structuredAvatarData);
        }
      }
      
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
          characterConsistency: characterAppearance || `${characterSeed.characterName} (${characterSeed.avatarType})`,
          visualConsistency: `${visualSchema.backgroundColor}, ${visualSchema.lighting}`,
          culturalEnhancements: culturalBundle.hair,
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
      console.log(`📋 [${requestId}] Scene-Only Mode: No character service loading, lightweight OpenAI-only`);
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
      
      // Character consistency data
      characterSeed,
      culturalBundle,
      coloredObjects,
      
      // Metadata for orchestrator
      templateStructure: 'COMPLETE_TIER_1',
      detectedCharacters: visualSchema.detectedCharacters || [],
      
      // DEBUG: Full OpenAI request details for debugging
      aiDebugSchema,
      
      // DEBUG: Runware debug data (Direct Mode only)
      ...(imageURL && runwareDebugData && { runwareDebugData }),
      
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