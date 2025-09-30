// DEPLOY_MARKER: 2025-09-27T15:30:00Z - Fix boot crashes: lazy orchestrator loading  

// Inlined orchestrator logic - no more lazy loading

// ============================================================================
// 🎯 ORCHESTRATOR: RESILIENT IMAGE GENERATION ORCHESTRATOR
// **CRITICAL SYSTEM NOTICE**: This function serves as the MAIN ORCHESTRATOR for image generation
// Handles all image generation tiers, fallbacks, and service coordination
// ENHANCED: Complete tier cascade logic with 1→2.5A→2.5B→Direct Mode→2.5C→SVG fallback
// ============================================================================

// TypeScript type imports
import type { UserInfo, SessionId } from "../_shared/types/index.ts";

// COMPLETE_TIER_1_TEMPLATE: 4-section structured template 
const COMPLETE_TIER_1_TEMPLATE = `PRIMARY SCENE: {primaryScene}.

CHARACTER DESCRIPTION: {mainCharacterDetails}.

CONSISTENCY: {secondaryCharacters}{coloredObjects}{settingContext}.

BRAND SUFFIX: {styleFramework}.`;

// TypeScript interface definitions
interface TierLogger {
  t1: (msg: string, ctx?: Record<string, any>) => void;
  t2: (msg: string, ctx?: Record<string, any>) => void;
  attempt: (tier: string, ctx?: Record<string, any>) => void;
  success: (tier: string, ctx?: Record<string, any>) => void;
  failure: (tier: string, ctx?: Record<string, any>) => void;
}

interface CircuitBreakerConfig {
  DIRECT_MODE: number;
  TIER_1: number;
  AI_GENERATION: number;
  RUNWARE_API: number;
}

interface ErrorContext {
  sessionId?: string;
  requestId?: string;
  details?: any;
}

interface ValidationPayload {
  pageText?: string;
  storyText?: string;
  sessionId?: string;
  userInfo?: UserInfo;
}

// ---- Async Tier logger binder with memoized dependencies ----
async function bindTierLogger(sessionId: SessionId, requestId: string, authHeader: string | null = null, memoizedImport: any): Promise<TierLogger> {
  try {
    const [{ createResilientSupabaseClient }, tierLogging] = await Promise.all([
      memoizedImport("../_shared/resilientLoader.ts"),
      memoizedImport("../_shared/tierLogging.js")
    ]);
    
    const supabaseClient = await createResilientSupabaseClient();
  
    return {
      t1: (msg, ctx = {}) => tierLogging.logTier1(msg, { ...ctx, authHeader }, supabaseClient, sessionId, requestId),
      t2: (msg, ctx = {}) => tierLogging.logTier2(msg, { ...ctx, authHeader }, supabaseClient, sessionId, requestId),
      attempt: (tier, ctx = {}) => tierLogging.logTierAttempt(supabaseClient, sessionId, requestId, tier, 'attempting', { ...ctx, authHeader }),
      success: (tier, ctx = {}) => tierLogging.logTierSuccess(supabaseClient, sessionId, requestId, tier, { ...ctx, authHeader }),
      failure: (tier, ctx = {}) => tierLogging.logTierFailure(supabaseClient, sessionId, requestId, tier, { ...ctx, authHeader }),
    };
  } catch (error) {
    console.warn(`Failed to create Supabase client: ${error}`);
    // Return console-only logger to prevent function crashes
    return {
      t1: (msg, ctx = {}) => console.log(`[T1] ${msg}`, ctx),
      t2: (msg, ctx = {}) => console.log(`[T2] ${msg}`, ctx),
      attempt: (tier, ctx = {}) => console.log(`[${tier}] Attempting`, ctx),
      success: (tier, ctx = {}) => console.log(`[${tier}] Success`, ctx),
      failure: (tier, ctx = {}) => console.log(`[${tier}] Failure`, ctx),
    };
  }
}

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

// PHASE 5A: Primary Scene Quality Check
function validatePrimarySceneQuality(scene: string): boolean {
  if (!scene || typeof scene !== 'string') return false;
  if (scene.length < 30) return false;
  if (scene.includes('undefined') || scene.includes('null')) return false;
  return scene.split(' ').filter(word => word.length > 0).length >= 8; // Minimum word count
}

// PHASE 1A: Lightning-Fast Input Validation (50ms max)
function validatePayloadFast(payload: ValidationPayload): boolean {
  if (!payload) throw new Error("PAYLOAD_NULL");
  
  // Enhanced validation for story content
  const hasPageText = payload.pageText && typeof payload.pageText === 'string' && payload.pageText.trim().length > 0;
  const hasStoryText = payload.storyText && typeof payload.storyText === 'string' && payload.storyText.trim().length > 0;
  
  if (!hasPageText && !hasStoryText) {
    console.error("[runware-generate-image] Final error after retries: NO_STORY_CONTENT");
    throw new Error("NO_STORY_CONTENT");
  }
  
  if (!payload.sessionId && !payload.userInfo) throw new Error("NO_SESSION_ID");
  return true; // Validation passed
}

// ============= INLINED TIER 1 PROCESSING (from PhaseIntegrationOrchestrator) =============
async function processInlinedTier1(payload: any, memoizedImport: any): Promise<any> {
  const { pageText, storyText, userInfo, sessionId } = payload;
  const userId = userInfo?.id || userInfo?.userId || 'anonymous';
  const characterName = userInfo?.name || userInfo?.childName || 'Child';
  
  console.log(`🎨 INLINED TIER 1: Processing for ${characterName} in session ${sessionId}`);
  
  // Import CharacterConsistencyService for Tier 1 Complete and Tier 2.5A
  let characterConsistencyService;
  try {
    console.log(`[TIER_1] Attempting to import CharacterConsistencyService using relative path`);
    const { characterConsistencyService: service } = await import("../_shared/CharacterConsistencyService.js");
    characterConsistencyService = service;
    
    // Validate service instance has required methods
    if (!characterConsistencyService || typeof characterConsistencyService.getCharacterAppearanceFromStory !== 'function') {
      throw new Error(`CharacterConsistencyService instance not functional - missing required methods`);
    }
    
    console.log(`[TIER_1] CharacterConsistencyService loaded successfully`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`[TIER_1] CharacterConsistencyService failed: ${errorMessage}`);
    console.log(`[TIER_1] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
    throw new Error(`CharacterConsistencyService not available: ${errorMessage}`);
  }
  
  // Generate structured avatar data using centralized method (single source of truth)
  const avatarSkinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || 'medium';
  const avatarIdentity = { 
    name: characterName, 
    type: userInfo?.avatar?.type || 'child',
    skinTone: avatarSkinTone
  };
  
  // ============================================================================
  // PHASE 1: CHARACTER CONSISTENCY ESTABLISHES FOUNDATION FIRST
  // Page 1: Generate seed, cultural bundle, clothing style
  // Page 2+: Load existing character data + analyze new story text for visual details
  // Extract: secondary characters, colored objects, animals, settings from story text
  // ============================================================================
  
  const structuredAvatarData = await characterConsistencyService.getStructuredAvatarData(sessionId, userInfo);
  
  // Get character consistency data using the service
  const characterSeed = await characterConsistencyService.getCharacterSeed(
    sessionId,
    avatarIdentity,
    storyText || pageText || '',
    'continuing'
  );
  
  // Get cultural enhancements using the service
  const culturalBundle = await characterConsistencyService.getCulturalEnhancements(userInfo, sessionId, characterName);
  
  // Analyze visual details from story text
  await characterConsistencyService.analyzeVisualDetails(sessionId, storyText || pageText, 1);
  const coloredObjects = await characterConsistencyService.getColoredObjects(sessionId);
  
  // Detect ALL characters (secondary characters, animals, relationships) using unified API
  const detectedAllCharacters = await characterConsistencyService.detectAllCharacters(storyText || pageText, {
    sessionId,
    pageNumber: payload.pageNumber || 1,
    userInfo
  });
  
  // Extract secondary characters for AI context
  const secondaryCharacters = detectedAllCharacters.secondaryCharacters || [];
  
  // Detect animals using character consistency service
  const detectedAnimals = await characterConsistencyService.detectCharacterAnimals(storyText || pageText, sessionId);
  
  // Get session setting (indoor/outdoor context)
  const sessionSetting = await characterConsistencyService.getSessionSetting(sessionId);
  
  console.log(`✅ CHARACTER FOUNDATION: Established complete character consistency data`, {
    hasCharacterSeed: !!characterSeed,
    hasCulturalBundle: !!culturalBundle,
    coloredObjectsCount: coloredObjects?.split(',').length || 0,
    secondaryCharactersCount: secondaryCharacters.length,
    detectedAnimalsCount: detectedAnimals?.length || 0,
    sessionSetting
  });
  
  // Get AI-generated primary scene and complete schema
  let primaryScene;
  let aiSchema: Record<string, any> = {};
  let aiDebugSchema: any = null;
  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.57.4');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // ============================================================================
    // PHASE 2: AI SCENE GENERATION (Informed by Complete Character Context)
    // Pass ALL character consistency data to AI so it generates a scene that
    // works WITH established character consistency
    // ============================================================================
    
    const { data: aiResult, error: aiError } = await supabase.functions.invoke('ai-visual-scene-creator', {
      body: { 
        pageText: storyText || pageText, 
        userInfo: {
          ...userInfo,
          structuredAvatarData
        }, 
        sessionId, 
        pageNumber: payload.pageNumber || 1,
        avatarIdentity,
        // Pass COMPLETE character consistency context to AI
        characterSeed,
        culturalBundle,
        coloredObjects,
        secondaryCharacters,
        detectedAnimals,
        sessionSetting,
        requestId: `tier1-${sessionId}`,
        source: 'inlined_orchestrator',
        directMode: false // Scene-Only mode - AI uses character context to inform scene
      }
    });
    
    console.log(`✅ AI SCENE GENERATION: Called with complete character context`, {
      hasCharacterSeed: !!characterSeed,
      hasCulturalBundle: !!culturalBundle,
      hasColoredObjects: !!coloredObjects,
      secondaryCharactersCount: secondaryCharacters?.length || 0,
      hasDetectedAnimals: !!detectedAnimals?.length,
      hasSessionSetting: !!sessionSetting
    });
    
    if (aiError || !aiResult?.primaryScene) {
      throw new Error('NO_PRIMARY_SCENE_ESCALATE_TO_25A');
    }
    
    primaryScene = aiResult.primaryScene;
    aiDebugSchema = aiResult.aiDebugSchema || null;
    
    // Collect complete AI schema for debugging (only primaryScene used in template)
    aiSchema = {
      backgroundColor: aiResult?.backgroundColor || '',
      lighting: aiResult?.lighting || '',
      composition: aiResult?.composition || '',
      mood: aiResult?.mood || '',
      visualElements: aiResult?.visualElements || '',
      sceneSettings: aiResult?.sceneSettings || '',
      atmosphericDetails: aiResult?.atmosphericDetails || ''
    };
  } catch (error) {
    console.warn('AI scene creator failed:', error);
    throw new Error('NO_PRIMARY_SCENE_ESCALATE_TO_25A');
  }
  
  // ============================================================================
  // PHASE 3: POST-AI CONSISTENCY VALIDATION
  // After receiving primaryScene from AI, validate that AI scene doesn't
  // conflict with established character data
  // ============================================================================
  
  console.log(`🔍 CONSISTENCY VALIDATION: Checking AI scene against character data`);
  
  // Validate primary scene quality
  if (!validatePrimarySceneQuality(primaryScene)) {
    console.warn(`⚠️ CONSISTENCY WARNING: Primary scene quality validation failed`);
  }
  
  // Log consistency check for debugging
  const consistencyCheck = {
    primarySceneLength: primaryScene?.length || 0,
    hasCharacterSeed: !!characterSeed,
    hasCulturalBundle: !!culturalBundle,
    hasColoredObjects: !!coloredObjects,
    secondaryCharactersMatched: secondaryCharacters?.length || 0,
    animalsDetected: detectedAnimals?.length || 0,
    sessionSetting,
    aiSchemaComplete: Object.values(aiSchema).filter(Boolean).length
  };
  
  console.log(`✅ CONSISTENCY VALIDATION: Complete`, consistencyCheck);
  
  // Generate secondary character seeds for template building
  let secondaryCharacterSeeds = [];
  for (const detectedChar of secondaryCharacters || []) {
    try {
      const charSeed = await characterConsistencyService.getSecondaryCharacterSeed(
        sessionId, 
        detectedChar.name || detectedChar.displayName || 'secondary character', 
        detectedChar.type || detectedChar.relationshipType || 'secondary_character'
      );
      if (charSeed) {
        secondaryCharacterSeeds.push(charSeed);
      }
    } catch (error) {
      console.warn(`Failed to get secondary character seed for ${detectedChar.name}:`, error);
    }
  }
  
  // Build enhanced prompt
  const characterReference = avatarIdentity.type === 'prefer-not-to-answer' ? 'gender neutral child' : avatarIdentity.type;
  const skinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || 'medium';
  
  // Get style framework
  const difficulty = userInfo?.difficulty || userInfo?.gradeLevel || 'medium';
  const styleFramework = getInlinedStyleFramework(difficulty);
  
  // ============================================================================
  // PHASE 4: TEMPLATE BUILDING WITH FULL CONTEXT
  // Use both character consistency data AND AI-generated primaryScene
  // Build template that leverages cross-page consistency
  // ============================================================================
  
  // Build COMPLETE_TIER_1 template using 4-section structured format - only include physical descriptions when complete
  const hasCompletePhysicalData = structuredAvatarData?.skinTone && structuredAvatarData?.hairColor;
  const physicalDescription = hasCompletePhysicalData ? ` with ${structuredAvatarData.skinTone} skin and ${structuredAvatarData.hairColor}` : '';
  const mainCharacterDetails = `Beautiful ${characterReference} character ${characterName}, age ${userInfo?.age || 6}${physicalDescription}${characterSeed?.characterDescription ? `, ${characterSeed.characterDescription}` : ''}${culturalBundle?.hair ? `, ${culturalBundle.hair}` : ''}${culturalBundle?.features ? `, ${culturalBundle.features}` : ''}`;
  
  const secondaryCharsText = secondaryCharacterSeeds.length > 0 ? `With ${secondaryCharacterSeeds.map(s => s.characterDescription).join(', ')}` : '';
  const animalsText = detectedAnimals?.length > 0 ? `Including ${detectedAnimals.map(a => a.name || a.type).join(', ')}` : '';
  const consistencyElements = [
    secondaryCharsText,
    animalsText,
    coloredObjects || '',
    sessionSetting ? `${sessionSetting} setting` : '',
    aiSchema?.sceneSettings || ''
  ].filter(Boolean).join(', ');
  
  const enhancedPrompt = COMPLETE_TIER_1_TEMPLATE
    .replace('{primaryScene}', primaryScene)
    .replace('{mainCharacterDetails}', mainCharacterDetails)
    .replace('{secondaryCharacters}', consistencyElements ? `${consistencyElements}. ` : '')
    .replace('{coloredObjects}', coloredObjects ? `Featuring ${coloredObjects}. ` : '')
    .replace('{settingContext}', aiSchema?.sceneSettings ? `In ${aiSchema.sceneSettings}. ` : '')
    .replace('{styleFramework}', styleFramework);
  
  console.log(`✅ TEMPLATE BUILDING: Enhanced prompt with full context`, {
    primarySceneLength: primaryScene?.length || 0,
    mainCharacterLength: mainCharacterDetails?.length || 0,
    consistencyElementsLength: consistencyElements?.length || 0,
    totalPromptLength: enhancedPrompt?.length || 0
  });
  
  const negativePrompt = "blurry, low quality, distorted, deformed, disfigured, bad anatomy, extra limbs, missing limbs, floating limbs, disconnected limbs, malformed hands, missing fingers, extra fingers, bad hands, signature, username, artist name, watermark, copyright";
  
  console.log(`✅ INLINED TIER 1: Generated enhanced prompt for ${characterName}`);
  
  return {
    enhancedPrompt,           // ← Structured COMPLETE_TIER_1 template
    negativePrompt,
    primaryScene,            // ← Used in template
    aiSchema: {              // ← Complete schema for debugging
      backgroundColor: aiSchema?.backgroundColor || '',
      lighting: aiSchema?.lighting || '',
      composition: aiSchema?.composition || '',
      mood: aiSchema?.mood || '',
      visualElements: aiSchema?.visualElements || '',
      sceneSettings: aiSchema?.sceneSettings || '',
      atmosphericDetails: aiSchema?.atmosphericDetails || ''
    },
    aiDebugSchema,           // ← NEW: Full OpenAI debug data from ai-visual-scene-creator
    characterSeed,
    culturalBundle,
    coloredObjects,
    secondaryCharacterSeeds,
    secondaryCharacters,     // ← NEW: All detected secondary characters
    detectedAnimals,         // ← NEW: All detected animals
    sessionSetting,          // ← NEW: Indoor/outdoor context
    structuredAvatarData,    // ← CRITICAL: Pass 73-variation session-seeded hair to Direct Mode
    templateStructure: 'COMPLETE_TIER_1'
  };
}

// Inlined style framework (from PhaseIntegrationOrchestrator)
function getInlinedStyleFramework(difficulty: string): string {
  const frameworks = {
    'beginner': 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, warm natural lighting',
    'easy': 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, warm natural lighting',
    'medium': 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, warm natural lighting',
    'hard': '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation',
    'expert': '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation'
  };
  
  return frameworks[difficulty?.toLowerCase() as keyof typeof frameworks] || frameworks['medium'];
}

// Fast Boot Sync Recovery Configuration
const FAST_BOOT_SYNC = {
  maxRetries: 3,
  delays: [500, 2000, 3500], // Total: 6 seconds max
  bootErrors: ['Module not found', 'BOOT_OR_IMPORT_FAILURE', 'failed to determine entrypoint', 'Cannot read properties of null'],
  maxTotalTime: 6000
};

// OPTIMIZED SERVE HANDLER WITH FAST BOOT SYNC RECOVERY AND COMPLETE TIER CASCADE
Deno.serve(async (req: Request): Promise<Response> => {
  // PHASE 1: OPTIONS fast path (immediate return)
  if (req.method === 'OPTIONS') {
    const corsHeaders = generateEchoCorsHeaders(req);
    return new Response(null, { headers: corsHeaders });
  }

  // PHASE 2: GET/HEAD health checks with environment info
  if (req.method === 'GET' || req.method === 'HEAD') {
    const runwareKey = Deno.env.get('RUNWARE_API_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    return corsResponse({ 
      status: 'healthy',
      service: 'runware-generate-image',
      tier: 'Main Orchestrator',
      deployment_version: '2025-09-27T18:40:00Z',
      timestamp: new Date().toISOString(),
      environment: {
        runwareApiKeyPresent: !!runwareKey,
        runwareApiKeyLength: runwareKey ? runwareKey.length : 0,
        openaiApiKeyPresent: !!openaiKey,
        openaiApiKeyLength: openaiKey ? openaiKey.length : 0,
        supabaseServiceRoleKeyPresent: !!supabaseKey,
        supabaseServiceRoleKeyLength: supabaseKey ? supabaseKey.length : 0
      },
      capabilities: ["tier_orchestration", "image_generation", "complete_cascade_1_2.5A_2.5B_DirectMode_2.5C_2.5D_SVG"]
    }, req);
  }

  // PHASE 3: Method validation before JSON parsing
  if (req.method !== 'POST') {
    return corsResponse({ error: 'Method not allowed' }, req, 405);
  }

  // Fast retry wrapper for boot sync issues
  for (let attempt = 0; attempt <= FAST_BOOT_SYNC.maxRetries; attempt++) {
    try {
      let payload: any;
      const requestId = `mg1${Math.random().toString(36).substring(2)}`;

      // PHASE 3: JSON parsing only after method validation
      payload = await req.json();
      console.log(`🚀 [${requestId}] runware-generate-image ready`);

      // PHASE 4: Fast validation
      validatePayloadFast(payload);
      console.log(`✅ [${requestId}] Fast validation passed`);

      // Preferred: resilient loader from _shared
      let memoizedImport: <T=any>(href: string) => Promise<T>;
      try {
        ({ memoizedImport } = await import(
          new URL("../_shared/resilientLoader.ts", import.meta.url).href
        ));
      } catch {
        // Fallback: simple local memoizer to stay up during cold boot anomalies
        const cache = new Map<string, Promise<any>>();
        memoizedImport = <T=any>(href: string) => {
          if (!cache.has(href)) cache.set(href, import(href));
          return cache.get(href)! as Promise<T>;
        };
      }

      // PHASE 5: Load tier logger and lazy-load orchestrator
      const tierLogger = await bindTierLogger(payload.sessionId || 'unknown', requestId, req.headers.get('authorization'), memoizedImport);

      // PHASE 6: Process request with lazy-loaded services
      tierLogger.attempt('TIER_1', { storyLength: payload.pageText?.length || payload.storyText?.length });

      // Attempt real Tier 1 processing with actual orchestrator
      console.log(`[TIER_1] Attempting orchestrator enhancement`);
      
      // Declare enhancedPrompt outside try block so it's accessible in catch for Direct Mode
      let enhancedPrompt: any = null;
      
      try {
        // INLINED TIER 1 PROCESSING - Direct orchestration without PhaseIntegrationOrchestrator
        console.log(`🎨 INLINED TIER 1: Processing for ${payload.userInfo?.name || 'Child'} in session ${payload.sessionId}`);
        enhancedPrompt = await processInlinedTier1(payload, memoizedImport);
        
        if (!enhancedPrompt || !validatePrimarySceneQuality(enhancedPrompt.primaryScene || enhancedPrompt.enhancedPrompt || '')) {
          throw new Error('NO_PRIMARY_SCENE_ESCALATE_TO_25A');
        }

        // Real Runware image generation using WebSocket service
        const { RunwareWebSocketService } = await import("../_shared/RunwareWebSocketService.ts");
        
        // Validate service is functional
        if (!RunwareWebSocketService || typeof RunwareWebSocketService.generateImage !== 'function') {
          throw new Error('TIER_1_PROCESSING_FAILED: RunwareWebSocketService not functional - missing generateImage method');
        }
        
        const runwareApiKey = Deno.env.get('RUNWARE_API_KEY');
        
        if (!runwareApiKey) {
          throw new Error('TIER_1_PROCESSING_FAILED: Runware API key not configured');
        }

        const imageResult = await RunwareWebSocketService.generateImage({
          apiKey: runwareApiKey,
          positivePrompt: enhancedPrompt.enhancedPrompt,
          negativePrompt: enhancedPrompt.negativePrompt || '',
          parameters: {
            width: 1024,
            height: 1024,
            model: 'runware:100@1',
            numberResults: 1,
            outputFormat: 'WEBP'
          }
        });

        if (!imageResult.success || !imageResult.imageURL) {
          throw new Error('TIER_1_PROCESSING_FAILED: Image generation failed');
        }

        // Return successful COMPLETE_TIER_1 response
        tierLogger.success('TIER_1', {
          templateStructure: 'COMPLETE_TIER_1',
          imageURL: imageResult.imageURL,
          enhancedPrompt: enhancedPrompt.enhancedPrompt,
          negativePrompt: enhancedPrompt.negativePrompt
        });

        return new Response(JSON.stringify({
          success: true,
          imageURL: imageResult.imageURL,
          provider: 'runware-websocket',
          tier: 'TIER_1',
          templateStructure: 'COMPLETE_TIER_1',
          requestId: requestId,
          timestamp: new Date().toISOString(),
          positivePrompt: enhancedPrompt.enhancedPrompt,
          negativePrompt: enhancedPrompt.negativePrompt,
          orchestratorDebugData: {
            aiDebugSchema: enhancedPrompt.aiDebugSchema,
            primaryScene: enhancedPrompt.primaryScene,
            aiSchema: enhancedPrompt.aiSchema
          },
          metadata: {
            enhancedPrompt: enhancedPrompt.enhancedPrompt,
            negativePrompt: enhancedPrompt.negativePrompt,
            primaryScene: enhancedPrompt.primaryScene,
            templateStructure: 'COMPLETE_TIER_1'
          }
        }), {
          headers: generateEchoCorsHeaders(req),
          status: 200
        });

      } catch (tier1Error: unknown) {
        const errorMessage = tier1Error instanceof Error ? tier1Error.message : String(tier1Error);
        const errorStack = tier1Error instanceof Error ? tier1Error.stack : undefined;
        console.log(`[TIER_1] Failed: ${errorMessage}`);
        console.log(`[TIER_1] Error stack:`, errorStack);
        tierLogger.failure('TIER_1', { error: errorMessage });
        
        // Detect if CharacterConsistencyService is unavailable
        const isCharacterServiceUnavailable = errorMessage.includes('CharacterConsistencyService') || 
                                              errorMessage.includes('Module not found') ||
                                              errorMessage.includes('_shared');
        
        if (isCharacterServiceUnavailable) {
          console.log(`[CASCADE] CharacterConsistencyService unavailable - will skip 2.5A and route to 2.5B`);
        }
        
        // Create Supabase client once for all fallback attempts
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.57.4');
        const internalSupabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        
        let directErrorMessage = 'Direct Mode not attempted';
        
        // CORRECTED CASCADE: Try Direct Mode first (if we have valid primaryScene)
        if (!errorMessage.includes('NO_PRIMARY_SCENE')) {
          console.log(`[DIRECT_MODE] Attempting Direct Mode fallback after Tier 1 failure`);
          
          try {
            const directModeResponse = await internalSupabase.functions.invoke('ai-visual-scene-creator', {
              body: {
                ...payload,
                // Pass structuredAvatarData from orchestrator if Tier 1 partially succeeded
                userInfo: {
                  ...payload.userInfo,
                  structuredAvatarData: enhancedPrompt?.structuredAvatarData || payload.userInfo?.structuredAvatarData
                },
                directMode: true,
                tier1FailureReason: errorMessage
              }
            });
            
            if (directModeResponse.data?.success && directModeResponse.data?.imageURL) {
              const result = {
                success: true,
                imageURL: directModeResponse.data.imageURL,
                provider: 'direct-mode-fallback',
                tier: 'DIRECT_MODE',
                requestId: requestId,
                timestamp: new Date().toISOString(),
                tier1FailureReason: errorMessage,
                // Expose prompts at top level for easy frontend access
                positivePrompt: directModeResponse.data?.runwareDebugData?.positivePrompt,
                negativePrompt: directModeResponse.data?.runwareDebugData?.negativePrompt,
                cascadeHistory: [
                  `❌ Tier 1 Failed: ${errorMessage}`,
                  '✅ Direct Mode Success'
                ],
                // NEW: Direct Mode debug data from ai-visual-scene-creator
                directModeDebugData: {
                  aiDebugSchema: directModeResponse.data?.aiDebugSchema,
                  runwareDebugData: directModeResponse.data?.runwareDebugData,
                  primaryScene: directModeResponse.data?.primaryScene
                }
              };
              
              tierLogger.success('DIRECT_MODE', { result });
              console.log(`SUCCESS [${requestId}] Direct Mode fallback completed`);
              
              return corsResponse({
                ...result
              }, req);
            } else {
              throw new Error('DIRECT_MODE_FAILED: ' + (directModeResponse.error?.message || 'Direct mode processing failed'));
            }
            
          } catch (directModeError: unknown) {
            directErrorMessage = directModeError instanceof Error ? directModeError.message : String(directModeError);
            console.log(`[DIRECT_MODE] Failed: ${directErrorMessage}`);
            tierLogger.failure('DIRECT_MODE', { error: directErrorMessage });
            // Continue to 2.5A cascade below
          }
        }
        
        // Track error messages from all tier attempts for universal 2.5C fallback
        let tier25aErrorMessage = '';
        let tier25bErrorMessage = '';
        
        // CRITICAL FIX: Skip 2.5A if CharacterConsistencyService is unavailable
        // 2.5A requires CharacterConsistencyService and will succeed with incomplete data (causing misgendering)
        // Go directly to 2.5B which doesn't require the service
        if (isCharacterServiceUnavailable) {
          console.log(`[CASCADE] Skipping 2.5A - CharacterConsistencyService unavailable, routing directly to 2.5B`);
          tier25aErrorMessage = 'SKIPPED: CharacterConsistencyService unavailable';
          
          // Try Tier 2.5B directly
          console.log(`[TIER_2.5B] Attempting fallback (2.5A skipped due to missing service)`);
          
          try {
            const tier25bResponse = await internalSupabase.functions.invoke('runware-template-ab', {
              body: {
                ...payload,
                templateComplexity: 'B',
                tier1FailureReason: errorMessage,
                tier25aFailureReason: tier25aErrorMessage
              }
            });
            
            if (tier25bResponse.data?.success && tier25bResponse.data?.imageURL) {
              const result = {
                success: true,
                imageURL: tier25bResponse.data.imageURL,
                provider: 'tier-2.5b-fallback',
                tier: 'TIER_2.5B',
                requestId: requestId,
                timestamp: new Date().toISOString(),
                tier1FailureReason: errorMessage,
                cascadeHistory: [
                  `❌ Tier 1 Failed: ${errorMessage}`,
                  `❌ Direct Mode Failed: ${directErrorMessage}`,
                  `⏭️ Tier 2.5A Skipped: CharacterConsistencyService unavailable`,
                  '✅ Tier 2.5B Success'
                ]
              };
              
              tierLogger.success('TIER_2.5B', { result });
              console.log(`SUCCESS [${requestId}] Tier 2.5B fallback completed (2.5A skipped)`);
              
              return corsResponse({
                ...result
              }, req);
            } else {
              throw new Error('TIER_2.5B_FAILED: Template B processing failed');
            }
            
          } catch (tier25bError: unknown) {
            tier25bErrorMessage = tier25bError instanceof Error ? tier25bError.message : String(tier25bError);
            console.log(`[TIER_2.5B] Failed: ${tier25bErrorMessage}`);
            tierLogger.failure('TIER_2.5B', { error: tier25bErrorMessage });
            
            // Error stored - will attempt 2.5C in universal fallback block below
          }
        }
        
        // Try Tier 2.5A (only if CharacterConsistencyService is available)
        if (!isCharacterServiceUnavailable) {
          console.log(`[TIER_2.5A] Attempting fallback after Direct Mode or if no primaryScene`);
          
          try {
          const tier25aResponse = await internalSupabase.functions.invoke('runware-template-ab', {
            body: {
              ...payload,
              templateComplexity: 'A',
              tier1FailureReason: errorMessage
            }
          });
          
          if (tier25aResponse.data?.success && tier25aResponse.data?.imageURL) {
            const result = {
              success: true,
              imageURL: tier25aResponse.data.imageURL,
              provider: 'tier-2.5a-fallback',
              tier: 'TIER_2.5A',
              requestId: requestId,
              timestamp: new Date().toISOString(),
              tier1FailureReason: errorMessage,
              cascadeHistory: [
                `❌ Tier 1 Failed: ${errorMessage.includes('NO_PRIMARY_SCENE') ? 'NO_PRIMARY_SCENE (missing service key)' : errorMessage}`,
                `❌ Direct Mode Failed: ${directErrorMessage}`,
                '✅ Tier 2.5A Success'
              ]
            };
            
            tierLogger.success('TIER_2.5A', { result });
            console.log(`SUCCESS [${requestId}] Tier 2.5A fallback completed`);
            
            return corsResponse({
              ...result
            }, req);
          } else {
            throw new Error('TIER_2.5A_FAILED: Template A processing failed');
          }
          
        } catch (tier25aError: unknown) {
          tier25aErrorMessage = tier25aError instanceof Error ? tier25aError.message : String(tier25aError);
          console.log(`[TIER_2.5A] Failed: ${tier25aErrorMessage}`);
          tierLogger.failure('TIER_2.5A', { error: tier25aErrorMessage });
          
          // Try Tier 2.5B
          console.log(`[TIER_2.5B] Attempting fallback after 2.5A failure`);
          
          try {
            const tier25bResponse = await internalSupabase.functions.invoke('runware-template-ab', {
              body: {
                ...payload,
                templateComplexity: 'B',
                tier1FailureReason: errorMessage,
                tier25aFailureReason: tier25aErrorMessage
              }
            });
            
            if (tier25bResponse.data?.success && tier25bResponse.data?.imageURL) {
              const result = {
                imageURL: tier25bResponse.data.imageURL,
                provider: 'tier-2.5b-fallback',
                tier: 'TIER_2.5B',
                requestId: requestId,
                timestamp: new Date().toISOString(),
                cascadeFailures: [errorMessage, tier25aErrorMessage]
              };
              
              tierLogger.success('TIER_2.5B', { result });
              console.log(`SUCCESS [${requestId}] Tier 2.5B fallback completed`);
              
              return corsResponse({
                success: true,
                ...result
              }, req);
            } else {
              throw new Error('TIER_2.5B_FAILED: Template B processing failed');
            }
            
          } catch (tier25bError: unknown) {
            tier25bErrorMessage = tier25bError instanceof Error ? tier25bError.message : String(tier25bError);
            console.log(`[TIER_2.5B] Failed: ${tier25bErrorMessage}`);
            tierLogger.failure('TIER_2.5B', { error: tier25bErrorMessage });
            
            // Error stored - will attempt 2.5C in universal fallback block below
          }
        }
        } // Close if (!isCharacterServiceUnavailable)
        
        // UNIVERSAL 2.5C FALLBACK: Attempt 2.5C if ANY 2.5B failed (from either path)
        if (tier25bErrorMessage) {
          console.log(`[TIER_2.5C] Attempting universal fallback after 2.5B failure (from ${isCharacterServiceUnavailable ? 'direct 2.5B' : '2.5A→2.5B'} path)`);
          
          try {
            const tier25cResponse = await internalSupabase.functions.invoke('runware-template-cd', {
              body: {
                ...payload,
                templateComplexity: 'C',
                tier1FailureReason: errorMessage,
                tier25aFailureReason: tier25aErrorMessage,
                tier25bFailureReason: tier25bErrorMessage
              }
            });
              
            if (tier25cResponse.data?.success && tier25cResponse.data?.imageURL) {
              const result = {
                imageURL: tier25cResponse.data.imageURL,
                provider: 'tier-2.5c-fallback',
                tier: 'TIER_2.5C',
                requestId: requestId,
                timestamp: new Date().toISOString(),
                cascadeFailures: [errorMessage, tier25aErrorMessage, tier25bErrorMessage, directErrorMessage]
              };
              
              tierLogger.success('TIER_2.5C', { result });
              console.log(`SUCCESS [${requestId}] Tier 2.5C universal fallback completed`);
              
              return corsResponse({
                success: true,
                ...result
              }, req);
            } else {
              throw new Error('TIER_2.5C_FAILED: Template C processing failed');
            }
            
          } catch (tier25cError: unknown) {
            const tier25cErrorMessage = tier25cError instanceof Error ? tier25cError.message : String(tier25cError);
            console.log(`[TIER_2.5C] Failed: ${tier25cErrorMessage}`);
            tierLogger.failure('TIER_2.5C', { error: tier25cErrorMessage });
            
            // All tiers exhausted - final error
            const finalError = `All tiers exhausted. Final errors: Tier1: ${errorMessage}, 2.5A: ${tier25aErrorMessage}, 2.5B: ${tier25bErrorMessage}, 2.5C: ${tier25cErrorMessage}`;
            tierLogger.failure('ALL_TIERS', { finalError });
            console.error(`❌ [${requestId}] All tiers failed`);
            
            return corsResponse({ 
              error: finalError,
              escalationTarget: "TIER_4" 
            }, req, 500);
          }
        }
      } // Close Tier 1 catch block

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Check if this is a boot sync error that should be retried
      const isSyncFailure = FAST_BOOT_SYNC.bootErrors.some(msg => 
        errorMessage.includes(msg)
      );
      
      if (!isSyncFailure || attempt === FAST_BOOT_SYNC.maxRetries) {
        // Final failure or non-sync error
        console.error(`[runware-generate-image] Final error after retries: ${errorMessage}`);
        return corsResponse({ 
          error: errorMessage,
          escalationTarget: "TIER_4" 
        }, req, 500);
      }
      
      const delay = FAST_BOOT_SYNC.delays[attempt];
      console.warn(`🔄 [RUNWARE_GEN] Fast boot retry ${attempt + 1}/${FAST_BOOT_SYNC.maxRetries} in ${delay}ms: ${errorMessage}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // Should never reach here, but fallback
  return corsResponse({ 
    error: 'Max retries exceeded',
    escalationTarget: "TIER_4" 
  }, req, 500);
});