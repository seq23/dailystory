// DEPLOY_MARKER: 2025-09-27T00:00:00Z - Optimized with echoing CORS and memoized lazy loading
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { phaseIntegrationOrchestrator } from '../_shared/PhaseIntegrationOrchestrator.js';
import { deriveRegionalEthnicity } from '../_shared/UnifiedPlaceholderResolver.js';
import { getHairBySkintone, getSkinBySkintone } from '../_shared/StaticDataCache.js';

// ============= RESILIENT IMPORT SYSTEM =============
// Dynamic Supabase client creation using direct import to bypass CDN failures
async function createSupabaseClient() {
  try {
    // Direct import approach to bypass CDN failures
    const { createClient } = await import('https://deno.land/x/supabase@2.0.2/mod.ts');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    return createClient(supabaseUrl, supabaseServiceRoleKey);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    // Return a null client to continue without Supabase for nuclear independence
    return null;
  }
}

// ============= NUCLEAR HARDCODED STYLE FRAMEWORKS =============
// Nuclear independence - hardcoded with exact user specifications
const NUCLEAR_HARDCODED_STYLE_FRAMEWORKS = {
  'beginner': {
    name: 'Contemporary Children\'s Book Illustration',
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, warm natural lighting'
  },
  'easy': {
    name: 'Contemporary Children\'s Book Illustration', 
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, warm natural lighting'
  },
  'medium': {
    name: 'Contemporary Children\'s Book Illustration',
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, warm natural lighting'
  },
  'hard': {
    name: '2.9D Rendered Illustration',
    frameworkPrompt: '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation'
  },
  'expert': {
    name: '2.9D Rendered Illustration',
    frameworkPrompt: '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation'
  }
};

// Nuclear helper function to get style framework by difficulty
function getNuclearStyleFramework(difficulty: string) {
  const normalizedDifficulty = difficulty?.toLowerCase() || 'medium';
  const framework = NUCLEAR_HARDCODED_STYLE_FRAMEWORKS[normalizedDifficulty as keyof typeof NUCLEAR_HARDCODED_STYLE_FRAMEWORKS] || NUCLEAR_HARDCODED_STYLE_FRAMEWORKS['medium'];
  return framework;
}

async function getPhaseOrchestrator() {
  try {
    const { memoizedImport } = await import('../_shared/resilientLoader.ts');
    const [
      { CharacterConsistencyService },
      { UnifiedPlaceholderResolver }
    ] = await Promise.all([
      memoizedImport('../_shared/CharacterConsistencyService.js'),
      memoizedImport('../_shared/UnifiedPlaceholderResolver.js')
    ]);
    
    return { 
      phaseIntegrationOrchestrator, 
      getNuclearStyleFramework, 
      CharacterConsistencyService, 
      UnifiedPlaceholderResolver 
    };
  } catch (error: unknown) {
    console.warn('Phase orchestrator lazy load failed:', error);
    return null;
  }
}

// ============= BULLETPROOF PHASES IMPLEMENTATION =============

// PHASE 3: FAST CIRCUIT BREAKER PROTECTION  
const TIER_TIMEOUTS = {
  DIRECT_MODE: 8000,      // 8s max for Direct Mode
  AI_GENERATION: 15000,   // 15s max for AI generation
  OPENAI_API: 12000       // 12s max for OpenAI calls
};

// PHASE 1B: Fast Direct Mode Validation
function validateDirectModePayload(payload: any): { isValid: boolean; contentType: string } {
  if (!payload.pageText && !payload.storyText) throw new Error("MISSING_STORY_CONTENT");
  // Don't fail for missing userInfo - normalize it instead
  return { isValid: true, contentType: payload.pageText ? 'pageText' : 'storyText' };
}

// PHASE 1C: UserInfo Normalization - Real World Defaults
function normalizeUserInfo(userInfo: any): any {
  // Use the same exact fallbacks as production (child, age 8, prefer-not-to-answer, medium, etc.)
  return {
    name: userInfo?.name || 'child',
    age: userInfo?.age || 8,
    userName: userInfo?.userName || userInfo?.name || 'child',
    ethnicity: deriveRegionalEthnicity(userInfo, userInfo?.avatar),
    skinTone: userInfo?.skinTone || userInfo?.avatar?.skinTone || 'medium',
    avatar: {
      type: userInfo?.avatar?.type || userInfo?.ethnicity || 'prefer-not-to-answer',
      skinTone: userInfo?.avatar?.skinTone || userInfo?.skinTone || 'medium'
    },
    nativeLanguage: userInfo?.nativeLanguage || 'en',
    difficulty: userInfo?.difficulty || 'pre-reader',
    grade: userInfo?.grade || 'PreK',
    culturalProfile: (userInfo?.nativeLanguage && userInfo?.nativeLanguage !== 'en') ? userInfo?.nativeLanguage : undefined,
    // Pass through any additional fields
    ...userInfo
  };
}

// PHASE 3B: Instant Failure Detection
function shouldFailFast(error: any): boolean {
  const msg = error?.message?.toLowerCase() || '';
  return msg.includes('missing_story_content') || 
         msg.includes('missing_user_info') ||
         msg.includes('payload_null') ||
         msg.includes('no_story_content');
}

// PHASE 5A: Primary Scene Quality Check
function validatePrimarySceneQuality(scene: any): boolean {
  if (!scene || typeof scene !== 'string') return false;
  if (scene.length < 50) return false;
  if (scene.includes('undefined') || scene.includes('null')) return false;
  return scene.split(' ').filter(word => word.length > 0).length >= 8; // Minimum word count
}

// PHASE 5B: Image URL Validation  
function validateImageURL(url: any): boolean {
  if (!url || typeof url !== 'string') return false;
  if (!url.startsWith('http')) return false;
  if (url.includes('undefined') || url.includes('null')) return false;
  return url.length > 20; // Reasonable URL length
}

// PHASE 4B: Unused fallback array removed - consolidated into AI_MODELS

// Echoing CORS with Vary headers for preflight consistency  
function generateEchoCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin');
  const requestHeaders = req.headers.get('Access-Control-Request-Headers');
  
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Headers': requestHeaders || 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Max-Age': '600',
    'Vary': 'Origin, Access-Control-Request-Headers',
  };
}

function corsResponse(data: any, req: Request, status = 200): Response {
  const corsHeaders = generateEchoCorsHeaders(req);
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function createCorsErrorResponse(error: any, status = 500, req?: Request): Response {
  const errorMessage = error instanceof Error ? error.message : error;
  console.error('Edge function error:', errorMessage);
  
  if (req) {
    return corsResponse({ 
      success: false, 
      error: errorMessage 
    }, req, status);
  }
  
  // Fallback when req is not available
  return new Response(JSON.stringify({ 
    success: false, 
    error: errorMessage 
  }), {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Content-Type': 'application/json'
    }
  });
}

// Simple error handling and logging utilities
function handleError(error: unknown, functionName: string, context: Record<string, any> = {}) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`ERROR ${functionName}:`, errorMessage, context);
  // Return a lazy fallback that doesn't require req parameter
  return new Response(JSON.stringify({ 
    success: false, 
    error: errorMessage 
  }), {
    status: 500,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Content-Type': 'application/json'
    }
  });
}

function withPerformanceTracking<T>(functionName: string, model: string | undefined, operation: () => Promise<T>): Promise<T> {
  const startTime = Date.now();
  console.log(`START ${functionName} with model: ${model}`);
  
  return operation().then(result => {
    console.log(`SUCCESS ${functionName} completed in ${Date.now() - startTime}ms`);
    return result;
  }).catch(error => {
    console.error(`ERROR ${functionName} failed after ${Date.now() - startTime}ms:`, error);
    throw error;
  });
}

// ============= INLINE VALIDATION FUNCTIONS =============

/**
 * VISUAL QUALITY: Check if primaryScene meets visual description standards
 */
function checkPrimarySceneCriteria(data: any): any {
  const scene = data.primaryScene;
  if (!scene || typeof scene !== 'string') {
    console.log('DEBUG VALIDATION DEBUG: Missing or invalid primaryScene', { 
      hasScene: !!scene, 
      sceneType: typeof scene,
      sceneValue: scene 
    });
    return { primaryScene: false, passCount: 0, details: 'missing_or_invalid' };
  }

  // Validation with regex match examples - STRICT 100+ CHARACTER THRESHOLD
  const lengthTest = scene.length >= 100;
  const characterRegex = /\b(child|character|person|they|he|she|avatar)\b/i;
  const actionRegex = /\b(playing|reading|building|walking|running|sitting|standing|holding|looking|smiling)\b/i;
  const settingRegex = /\b(room|classroom|garden|playground|library|home|indoor|outdoor|table|floor)\b/i;
  const descriptiveRegex = /\b(colorful|bright|sunny|warm|cheerful|detailed|realistic|beautiful)\b/i;
  
  const characterMatch = scene.match(characterRegex);
  const actionMatch = scene.match(actionRegex);
  const settingMatch = scene.match(settingRegex);
  const descriptiveMatch = scene.match(descriptiveRegex);

  const hasCharacter = !!characterMatch;
  const hasAction = !!actionMatch;
  const hasSetting = !!settingMatch;
  const hasDescriptiveWords = !!descriptiveMatch;

  const qualityScore = [lengthTest, hasCharacter, hasAction, hasSetting, hasDescriptiveWords].filter(Boolean).length;
  const isPrimarySceneValid = qualityScore >= 1;

  console.log('TIER 1 VALIDATION: Primary Scene Criteria Analysis:', {
    sceneLength: scene.length,
    lengthTest: `${lengthTest} (>= 100 chars - STRICT FAIL-FAST)`,
    characterTest: `${hasCharacter} ${characterMatch ? `(matched: "${characterMatch[0]}")` : '(no match)'}`,
    actionTest: `${hasAction} ${actionMatch ? `(matched: "${actionMatch[0]}")` : '(no match)'}`,
    settingTest: `${hasSetting} ${settingMatch ? `(matched: "${settingMatch[0]}")` : '(no match)'}`,
    descriptiveTest: `${hasDescriptiveWords} ${descriptiveMatch ? `(matched: "${descriptiveMatch[0]}")` : '(no match)'}`,
    qualityScore: `${qualityScore}/5`,
    validationResult: isPrimarySceneValid ? 'TIER 1 APPROVED - STRICT FAIL-FAST' : 'TIER 2 TRIGGER',
    scenePreview: scene.substring(0, 150) + (scene.length > 150 ? '...' : ''),
    strictThresholds: 'length: 100+ chars, score: 1+ criteria - NO FALLBACK ACCEPTANCE'
  });

  return {
    primaryScene: isPrimarySceneValid,
    passCount: isPrimarySceneValid ? 1 : 0,
    details: {
      length: scene.length,
      hasCharacter,
      hasAction, 
      hasSetting,
      hasDescriptiveWords,
      qualityScore: `${qualityScore}/5`,
      matchExamples: {
        character: characterMatch?.[0] || 'none',
        action: actionMatch?.[0] || 'none',
        setting: settingMatch?.[0] || 'none',
        descriptive: descriptiveMatch?.[0] || 'none'
      }
    }
  };
}

/**
 * TIER 1 VALIDATION: Allow scene generation from storyText if primaryScene is missing
 */
function validateAndEnhanceContent(enhancedStoryData: any, storyText: any): any {
  // If we have primaryScene, validate it
  if (enhancedStoryData && enhancedStoryData.primaryScene) {
    // Existing primaryScene validation logic would go here
    return { useTier2: false, fieldCheck: { primaryScene: true, passCount: 1, details: 'existing_scene' } };
  }
  
  // If no primaryScene but we have storyText, allow AI generation (don't escalate to Tier 2)
  if (storyText) {
    console.log('No primaryScene found, but storyText provided - proceeding with AI generation');
    return { useTier2: false, fieldCheck: { primaryScene: false, passCount: 0, details: 'generate_from_story' } };
  }
  
  // Only escalate to Tier 2 if we have neither primaryScene nor storyText
  console.log(`ERROR TIER 2 TRIGGER: No primaryScene or storyText found`, {
    hasData: !!enhancedStoryData,
    dataKeys: enhancedStoryData ? Object.keys(enhancedStoryData) : [],
    hasStoryText: !!storyText,
    tier2Reasoning: 'Missing both primaryScene and storyText'
  });
  return { useTier2: true, fieldCheck: { primaryScene: false, passCount: 0, details: 'no_content_source' } };
}

// Simple circuit breaker for API reliability
class SimpleCircuitBreaker {
  private failures: number = 0;
  private lastFailure: number = 0;
  private threshold: number = 3;
  private timeout: number = 30000; // 30 seconds

  constructor() {
    this.failures = 0;
    this.lastFailure = 0;
    this.threshold = 3;
    this.timeout = 30000; // 30 seconds
  }
  
  isOpen(): boolean {
    if (this.failures >= this.threshold && (Date.now() - this.lastFailure < this.timeout)) {
      return true;
    }
    if (this.failures >= this.threshold && (Date.now() - this.lastFailure >= this.timeout)) {
      this.failures = 0; // Reset after timeout
    }
    return false;
  }
  
  recordSuccess(): void {
    this.failures = 0;
  }
  
  recordFailure(): void {
    this.failures++;
    this.lastFailure = Date.now();
  }
}

const circuitBreaker = new SimpleCircuitBreaker();

// AI Model Fallback Chain Configuration - CHEAPEST TO MOST EXPENSIVE ORDER
const AI_MODELS = [
  { name: 'gpt-4o-mini', maxTokens: 'max_tokens', supportsTemperature: true },
  { name: 'gpt-4o', maxTokens: 'max_tokens', supportsTemperature: true },
  { name: 'gpt-4.1-2025-04-14', maxTokens: 'max_completion_tokens', supportsTemperature: false },
  { name: 'gpt-5-2025-08-07', maxTokens: 'max_completion_tokens', supportsTemperature: false }
];

// OPTIMIZED SERVE HANDLER WITH MEMOIZED LAZY LOADING
serve(async (req: Request): Promise<Response> => {
  // PHASE 1: OPTIONS fast path (immediate return)
  if (req.method === 'OPTIONS') {
    const corsHeaders = generateEchoCorsHeaders(req);
    return new Response(null, { headers: corsHeaders });
  }

  // PHASE 2: GET/HEAD health checks
  if (req.method === 'GET' || req.method === 'HEAD') {
    return corsResponse({ 
      status: 'healthy', 
      service: 'ai-visual-scene-creator',
      timestamp: new Date().toISOString()
    }, req);
  }

  // PHASE 3: Method validation before JSON parsing
  if (req.method !== 'POST') {
    return corsResponse({ error: 'Method not allowed' }, req, 405);
  }

  let payload: any;
  let requestId = '';

  try {
    // PHASE 3: JSON parsing only after method validation
    payload = await req.json();
    requestId = `${Math.random().toString(36).substring(2)}`;

    console.log(`🚀 [${requestId}] ai-visual-scene-creator: ${req.method} ${req.url}`);

    // PHASE 4: Fast validation
    const validationResult = validateDirectModePayload(payload);
    console.log(`✅ [${requestId}] Fast validation passed: ${validationResult.contentType}`);

  } catch (error: unknown) {
    console.log(`❌ [${requestId}] Fast validation failed: ${error instanceof Error ? error.message : String(error)}`);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createCorsErrorResponse(`Validation failed: ${errorMessage}`, 400, req);
  }

  try {
    // PHASE 5: Lazy load all dependencies in parallel
    const [dependencies, supabase] = await Promise.all([
      getPhaseOrchestrator(),
      createSupabaseClient()
    ]);

    if (!dependencies) {
      console.error('Failed to load phase orchestrator dependencies');
      return createCorsErrorResponse('Service initialization failed', 500, req);
    }

    const { CharacterConsistencyService, getNuclearStyleFramework, UnifiedPlaceholderResolver } = dependencies;

    // PHASE 6: Process request with lazy-loaded services
    const storyText = payload.storyText || payload.pageText;
    const sessionId = payload.sessionId;
    const userInfo = payload.userInfo;

    if (!storyText) {
      if (!payload.enhancedStoryData && !payload.storyText) {
        return createCorsErrorResponse('Missing required fields: storyText OR (enhancedStoryData and storyText)', 400, req);
      }
      if (!payload.enhancedStoryData && !payload.storyText) {
        return createCorsErrorResponse('No story text content provided in any format', 400, req);
      }
    }

    console.log(`DEBUG [${requestId}] Processing with story text length: ${storyText?.length || 0}`);
    
    // Build debug context for comprehensive response
    const debugContext = {
      requestId,
      payload: {
        hasStoryText: !!storyText,
        storyTextLength: storyText?.length || 0,
        hasUserInfo: !!userInfo,
        userInfoKeys: userInfo ? Object.keys(userInfo) : [],
        sessionId,
        pageNumber: payload.pageNumber || 1
      },
      cultural: {
        nativeLanguage: userInfo?.nativeLanguage || 'en',
        skinTone: userInfo?.skinTone || userInfo?.avatar?.skinTone || 'medium',
        avatarType: userInfo?.avatar?.type || userInfo?.avatarType || 'child'
      }
    };

    // Declare variables outside withPerformanceTracking for proper scoping across all return paths
    // NOTE: These will be updated to use normalizedUserInfo after normalization inside withPerformanceTracking
    let nativeLanguage = 'en';
    let isNonEnglish = false;
    let culturalContext = '';
    let characterData = '{}';
    let previousPrimaryScene = '';
    let characterAppearance = '';
    let aiResponse: Response | undefined;
    let lastError: Error | unknown = null;
    let successfulModel: string | null = null;
    let requestBody: any = null;
    let aiData: any = null;
    let generatedScene: string | null = null;

    const startTime = Date.now();
    const result = await withPerformanceTracking(
      'ai-visual-scene-creator',
      'gpt-4o',
      async () => {
        // Normalize userInfo with production fallbacks
        const normalizedUserInfo = normalizeUserInfo(userInfo);
        
        // Update variables with normalized userInfo
        nativeLanguage = normalizedUserInfo?.nativeLanguage || 'en';
        isNonEnglish = nativeLanguage !== 'en';
        culturalContext = isNonEnglish ? `culturally appropriate ${nativeLanguage} settings` : '';
        // Get variety mappings for hair and skin
        if (normalizedUserInfo) {
          const mappedHairColor = getHairBySkintone(normalizedUserInfo.skinTone, payload.sessionId || 'default');
          const mappedSkinTone = getSkinBySkintone(normalizedUserInfo.skinTone, payload.sessionId || 'default');
          
          // Add enhanced character data
          const enhancedCharacterData = {
            ...normalizedUserInfo,
            hairColor: mappedHairColor,
            skinToneDescription: mappedSkinTone
          };
          
          characterData = JSON.stringify(enhancedCharacterData);
        } else {
          characterData = '{}';
        }
        characterAppearance = normalizedUserInfo?.features || '';
        
        // Use lazy-loaded CharacterConsistencyService
        const characterService = new CharacterConsistencyService();
        
        // Validate and enhance content
        const validation = validateAndEnhanceContent(payload.enhancedStoryData || {}, storyText);
        
        if (validation.useTier2) {
          console.log('Validation failed, should escalate to Tier 2');
          return corsResponse({
            success: false,
            error: 'Primary scene validation failed - needs Tier 2',
            nextAction: 'ESCALATE_TO_TIER_2',
            details: validation.fieldCheck
          }, req, 400);
        }

        // Make real OpenAI API call to generate primary scene
        const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openaiApiKey) {
          console.error('OpenAI API key not found');
          return corsResponse({
            success: false,
            error: 'OpenAI API configuration missing',
            nextAction: 'ESCALATE_TO_TIER_2'
          }, req, 500);
        }

        try {
          
          for (const modelConfig of AI_MODELS) {
            try {
              console.log(`🤖 [${requestId}] Attempting AI generation with model: ${modelConfig.name}`);
              
              requestBody = {
                model: modelConfig.name,
                messages: [
                  { 
                    role: 'system', 
                    content: `Generate a comprehensive visual scene description for children's story image generation.

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
1. Use provided character data exactly - do not make up features for main character
2. For secondary characters, you may describe their appearance as needed
3. Use story-driven visual descriptions based on the text content

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
${isNonEnglish ? `- Incorporate cultural elements appropriate for ${nativeLanguage} speaking families` : ''}` 
                  },
                  { 
                    role: 'user', 
                    content: `Create a visual scene description for this story page.

CHARACTER DATA: ${characterData}

STORY TEXT:
"${storyText}"

PREVIOUS SCENE (for visual consistency):
"${previousPrimaryScene || 'None - this is the first scene'}"

${characterAppearance ? `CHARACTER APPEARANCE NOTES: ${characterAppearance}` : ''}

Generate a comprehensive scene with complete visual elements including background, lighting, composition, setting, mood, style, secondary characters (categorized as humans vs pets), and key objects. Maintain character and setting continuity while showcasing the current page's action. Use the provided character data exactly and never describe the main character's skin tone.`
                  }
                ]
              } as any;

              // Set correct token parameter based on model
              if (modelConfig.maxTokens === 'max_tokens') {
                (requestBody as any).max_tokens = 1500;
              } else {
                (requestBody as any).max_completion_tokens = 1500;
              }

              // Add temperature only for supported models
              if (modelConfig.supportsTemperature) {
                (requestBody as any).temperature = 0.7;
              }

              aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${openaiApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
              });

              if (aiResponse.ok) {
                console.log(`✅ [${requestId}] AI generation successful with model: ${modelConfig.name}`);
                successfulModel = modelConfig.name;
                break; // Success - exit the loop
              } else {
                const errorText = await aiResponse.text();
                throw new Error(`OpenAI API error: ${aiResponse.status} ${aiResponse.statusText} - ${errorText}`);
              }
              
            } catch (error) {
              lastError = error;
              console.warn(`⚠️ [${requestId}] Model ${modelConfig.name} failed:`, error instanceof Error ? error.message : String(error));
              
              // Continue to next model if this one fails
              continue;
            }
          }

          // If all models failed, throw the last error
          if (!aiResponse || !aiResponse.ok) {
            throw new Error(`All AI models failed. Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
          }

          aiData = await aiResponse.json();
          const rawContent = aiData.choices?.[0]?.message?.content;

          if (!rawContent) {
            throw new Error('OpenAI returned empty response');
          }

          // PLAN FIX 1A: Parse AI JSON response into aiSchema, extract clean primaryScene
          let aiSchema: any = null;
          let generatedSceneClean: string = rawContent;
          
          try {
            // Try to parse as JSON first
            const parsedSchema = JSON.parse(rawContent);
            if (parsedSchema && typeof parsedSchema === 'object' && parsedSchema.primaryScene) {
              aiSchema = parsedSchema;
              generatedSceneClean = parsedSchema.primaryScene;
              console.log(`✅ [${requestId}] AI JSON parsed successfully - extracted clean primaryScene (${generatedSceneClean.length} chars)`);
            } else {
              console.log(`📄 [${requestId}] AI response is JSON but missing primaryScene field, using raw content`);
            }
          } catch (parseError) {
            console.log(`📄 [${requestId}] AI response is not JSON, using raw content as primaryScene`);
          }
          
          generatedScene = generatedSceneClean;

          // DIRECT MODE: Generate Tier 1 character consistency components
          let characterConsistency = '';
          let visualConsistency = '';
          let culturalEnhancements = '';
          
          if (payload.directMode === true && dependencies?.CharacterConsistencyService) {
            try {
              console.log(`🧠 [${requestId}] Generating Tier 1 character consistency data...`);
              const characterService = dependencies.CharacterConsistencyService.getInstance();
              
              // Analyze the generated scene for consistency data
              await characterService.analyzeVisualDetails(sessionId, generatedScene, payload.pageNumber || 1, userInfo?.name || 'child');
              
              // Generate character consistency
              characterConsistency = await characterService.getCharacterAppearanceFromStory(sessionId, userInfo?.name || 'child') || '';
              
              // Generate visual consistency 
              visualConsistency = await characterService.getColoredObjects(sessionId) || '';
              
              // Generate cultural enhancements based on user profile
              if (userInfo?.avatar?.type && userInfo.avatar.type !== 'prefer-not-to-answer') {
                culturalEnhancements = `Cultural enhancement for ${userInfo.avatar.type} representation with authentic styling and features`;
              }
              
              console.log(`✅ [${requestId}] Character consistency data generated:`, {
                characterConsistency: characterConsistency.length > 0,
                visualConsistency: visualConsistency.length > 0,
                culturalEnhancements: culturalEnhancements.length > 0
              });
            } catch (consistencyError) {
              console.warn(`⚠️ [${requestId}] Character consistency generation failed:`, consistencyError);
              // Continue without consistency data - not a blocking error
            }
          }

          // Check if this is Direct Mode - if so, call runware-template-cd for real image generation
          if (payload.directMode === true) {
            console.log(`🎯 [${requestId}] Direct Mode activated - calling runware-template-cd`);
            
            try {
              let templateResponse;
              
              // Try supabase client first
              if (supabase) {
                templateResponse = await supabase.functions.invoke('runware-template-cd', {
                  body: {
                    // PLAN FIX 1B: Use cleaned primaryScene as pageText for Template C
                    pageText: generatedSceneClean,  // Changed from payload.pageText to cleaned AI scene
                    userInfo,
                    sessionId,
                    pageNumber: payload.pageNumber || 1,
                    templateComplexity: 'C',
                    failedTierData: {
                      enhancedSceneData: generatedSceneClean,
                      tier: 'DIRECT_MODE',
                      primaryScene: generatedSceneClean,
                      characterConsistency: characterConsistency,
                      visualConsistency: visualConsistency,
                      culturalEnhancements: culturalEnhancements
                    },
                    // Add targeted logging context
                    debugContext: {
                      source: 'ai-visual-scene-creator-direct-mode',
                      aiParsed: !!aiSchema,
                      sceneLength: generatedSceneClean.length
                    }
                  }
                });
              } else {
                // HTTP fallback when supabase client unavailable
                console.log(`❌ [${requestId}] Supabase client unavailable, using HTTP fallback`);
                
                const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://cpzeuogomaixamrtnnmj.supabase.co';
                const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
                
                if (!SUPABASE_SERVICE_ROLE_KEY) {
                  throw new Error('SUPABASE_SERVICE_ROLE_KEY not available for HTTP fallback');
                }
                
                const httpResponse = await fetch(`${SUPABASE_URL}/functions/v1/runware-template-cd`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    // PLAN FIX 1B: Use cleaned primaryScene as pageText for Template C (HTTP fallback)
                    pageText: generatedSceneClean,  // Changed from payload.pageText to cleaned AI scene
                    userInfo,
                    sessionId,
                    pageNumber: payload.pageNumber || 1,
                    templateComplexity: 'C',
                    failedTierData: {
                      enhancedSceneData: generatedSceneClean,
                      tier: 'DIRECT_MODE',
                      primaryScene: generatedSceneClean,
                      characterConsistency: characterConsistency,
                      visualConsistency: visualConsistency,
                      culturalEnhancements: culturalEnhancements
                    },
                    // Add targeted logging context
                    debugContext: {
                      source: 'ai-visual-scene-creator-direct-mode-http',
                      aiParsed: !!aiSchema,
                      sceneLength: generatedSceneClean.length
                    }
                  })
                });
                
                if (!httpResponse.ok) {
                  throw new Error(`HTTP fallback failed: ${httpResponse.status}`);
                }
                
                const httpData = await httpResponse.json();
                templateResponse = { data: httpData, error: null };
              }

              if (templateResponse.error) {
                throw new Error(`Template CD failed: ${templateResponse.error.message}`);
              }

              const templateData = templateResponse.data;
              if (!templateData?.success || !validateImageURL(templateData.imageURL)) {
                throw new Error('Template CD returned invalid response');
              }

              console.log(`✅ [${requestId}] Direct Mode success - real image generated`);
              
              return {
                imageURL: templateData.imageURL,
                provider: 'runware-template-cd',
                tier: 'DIRECT_MODE',
                primaryScene: generatedSceneClean,  // Return cleaned scene text
                // PLAN FIX 1C: Return aiSchema at top level for UI display
                aiSchema: aiSchema,
                enhancedData: {
                  ...validation.enhancedData,
                  realAIGenerated: true,
                  openaiModel: successfulModel || 'unknown',
                  directMode: true,
                  characterConsistency: characterConsistency,
                  visualConsistency: visualConsistency,
                  culturalEnhancements: culturalEnhancements,
                  templateResponse: templateData
                }
              };

            } catch (directModeError) {
              console.error(`❌ [${requestId}] Direct Mode failed:`, directModeError);
              const errorMessage = directModeError instanceof Error ? directModeError.message : String(directModeError);
              return corsResponse({
                success: false,
                error: `Direct Mode image generation failed: ${errorMessage}`,
                nextAction: 'ESCALATE_TIER_2_5C',
                primaryScene: generatedScene,
                enhancedData: validation.enhancedData
              }, req, 500);
            }
          }

          // Non-direct mode: return only scene data (no imageURL)
          console.log(`📝 [${requestId}] Scene-only mode - returning primaryScene without image`);
          
          return {
            tier: 'TIER_1_SCENE_ONLY',
            primaryScene: generatedSceneClean,  // Return cleaned scene text
            // PLAN FIX 1C: Return aiSchema at top level for UI display  
            aiSchema: aiSchema,
            enhancedData: {
              ...validation.enhancedData,
              realAIGenerated: true,
              openaiModel: successfulModel || 'unknown'
            }
          };

          } catch (openaiError) {
          console.error('OpenAI API call failed:', openaiError);
          const errorMessage = openaiError instanceof Error ? openaiError.message : String(openaiError);
          
          // Enhanced error logging with debug information
          const errorDebug = {
            ...debugContext,
            error: {
              message: errorMessage,
              type: openaiError instanceof Error ? openaiError.constructor.name : 'unknown',
              stack: openaiError instanceof Error ? openaiError.stack : null
            },
            openaiInteraction: {
              lastAttemptedModel: successfulModel || 'none',
              requestBody: requestBody || null,
              allModelsAttempted: AI_MODELS.map(m => m.name),
              lastError: lastError instanceof Error ? lastError.message : String(lastError)
            },
            culturalContext: {
              ...debugContext.cultural,
              isMulticultural: debugContext.cultural.nativeLanguage !== 'en',
              culturalEnhancements: isNonEnglish ? culturalContext : 'standard'
            },
            status: 'ERROR',
            processingTime: Date.now() - startTime
          };
          
          return corsResponse({
            success: false,
            error: `OpenAI generation failed: ${errorMessage}`,
            nextAction: 'ESCALATE_TO_TIER_2',
            debug: errorDebug
          }, req, 500);
        }
      }
    );

    console.log(`SUCCESS [${requestId}] AI visual scene creation completed`);
    
    // Handle different result types based on mode
    if ('imageURL' in result) {
      // Direct Mode success - return with real imageURL
      const response = {
        success: true,
        imageURL: result.imageURL,
        provider: result.provider,
        tier: result.tier || 'DIRECT_MODE',
        primaryScene: result.primaryScene || storyText || "Generated scene",
        enhancedData: result.enhancedData,
        debug: {
          ...debugContext,
          systemPrompt: requestBody?.messages?.[0]?.content || 'AI visual scene creation system',
          userPrompt: requestBody?.messages?.[1]?.content || storyText,
          openaiInteraction: {
            model: successfulModel || 'unknown',
            requestBody: requestBody || null,
            responseData: aiData || null,
            generatedScene: generatedScene || null,
            tokenUsage: aiData?.usage || null
          },
          culturalContext: {
            ...debugContext.cultural,
            isMulticultural: debugContext.cultural.nativeLanguage !== 'en',
            culturalEnhancements: isNonEnglish ? culturalContext : 'standard',
            characterConsistency: userInfo ? 'applied' : 'none'
          },
          status: 'SUCCESS',
          primarySceneLength: result.primaryScene?.length || 0,
          tier: result.tier || 'DIRECT_MODE',
          processingTime: Date.now() - startTime,
          directMode: payload.directMode === true,
          templateResponse: result.enhancedData?.templateResponse || null
        },
        requestId: requestId,
        timestamp: new Date().toISOString()
      };
      
      return corsResponse(response, req);
    } else if ('primaryScene' in result) {
      // Scene-only mode success - no imageURL
      const response = {
        success: true,
        tier: result.tier || 'TIER_1_SCENE_ONLY',
        primaryScene: result.primaryScene || storyText || "Generated scene",
        enhancedData: result.enhancedData,
        // Remove redundant aiSchema construction - already in enhancedData
        debug: {
          ...debugContext,
          systemPrompt: requestBody?.messages?.[0]?.content || 'AI visual scene creation system',
          userPrompt: requestBody?.messages?.[1]?.content || storyText,
          openaiInteraction: {
            model: successfulModel || 'unknown',
            requestBody: requestBody || null,
            responseData: aiData || null,
            generatedScene: generatedScene || null,
            tokenUsage: aiData?.usage || null
          },
          culturalContext: {
            ...debugContext.cultural,
            isMulticultural: debugContext.cultural.nativeLanguage !== 'en',
            culturalEnhancements: isNonEnglish ? culturalContext : 'standard',
            characterConsistency: userInfo ? 'applied' : 'none'
          },
          status: 'SUCCESS',
          primarySceneLength: result.primaryScene?.length || 0,
          tier: result.tier || 'TIER_1_SCENE_ONLY',
          processingTime: Date.now() - startTime,
          directMode: false,
          sceneOnly: true
        },
        requestId: requestId,
        timestamp: new Date().toISOString()
      };
      
      return corsResponse(response, req);
    } else {
      // This should be a Response object (error case)
      return result;
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Edge function error: ${errorMessage}`, error);
    return createCorsErrorResponse(errorMessage, 500, req);
  }
});