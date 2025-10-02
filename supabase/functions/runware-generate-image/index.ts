// DEPLOY_MARKER: 2025-10-02T15:30:00Z - Force redeployment: Updated vendor bundle with complete Supabase client (.upsert() and .single() methods)  

// Inlined orchestrator logic - no more lazy loading

// ============================================================================
// 🎯 ORCHESTRATOR: RESILIENT IMAGE GENERATION ORCHESTRATOR
// **CRITICAL SYSTEM NOTICE**: This function serves as the MAIN ORCHESTRATOR for image generation
// Handles all image generation tiers, fallbacks, and service coordination
// ENHANCED: Complete tier cascade logic: 1 → Direct Mode → 2.5A → 2.5B → 2.5C → 2.5D
// ============================================================================

// TypeScript type imports
import type { UserInfo, SessionId } from "../_shared/types/index.ts";

// CRITICAL FIX: Failsafe import for NuclearNegativePrompts - prevents boot failures
// If module fails, use hardcoded base negative prompt fallback
let generateNuclearNegativePrompt: any;
let detectCulturalProfileForNegatives: any;

try {
  const nuclearModule = await import('../_shared/NuclearNegativePrompts.js');
  generateNuclearNegativePrompt = nuclearModule.generateNuclearNegativePrompt;
  detectCulturalProfileForNegatives = nuclearModule.detectCulturalProfileForNegatives;
  console.log('✅ NuclearNegativePrompts module loaded successfully');
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.warn('⚠️ NuclearNegativePrompts unavailable, using hardcoded base fallback:', errorMessage);
  
  // HARDCODED BASE FALLBACK (as specified by user - prevents deployment failures)
  const BASE_NEGATIVE_FALLBACK = "NO TEXT, no words, no letters, no writing, no captions, no watermarks, no signatures, no logos, bad anatomy, deformed, blurry, low quality, distorted face, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley";
  
  generateNuclearNegativePrompt = () => BASE_NEGATIVE_FALLBACK;
  detectCulturalProfileForNegatives = () => ({});
}

import * as ProviderGate from "../_shared/ProviderGate.ts";
import * as IdempotencyMemory from "../_shared/IdempotencyMemory.ts";

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

// Unused interfaces removed - see Phase 3 of comprehensive fix plan

// ---- Async Tier logger binder with memoized dependencies ----
// Phase 6: PII Protection - redact sensitive data in production
function redactPII(value: any): any {
  if (typeof value === 'string') {
    // Mask potential emails, phone numbers, addresses
    return value
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL-REDACTED]')
      .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE-REDACTED]')
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN-REDACTED]');
  }
  if (typeof value === 'object' && value !== null) {
    const redacted: any = Array.isArray(value) ? [] : {};
    for (const key in value) {
      // Redact known sensitive fields
      if (['characterName', 'sessionId', 'email', 'phone', 'address'].includes(key)) {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = redactPII(value[key]);
      }
    }
    return redacted;
  }
  return value;
}

async function bindTierLogger(sessionId: SessionId, requestId: string, authHeader: string | null = null, memoizedImport: any): Promise<TierLogger> {
  const isProd = Deno.env.get('ENVIRONMENT') === 'production';
  const logSampleRate = parseFloat(Deno.env.get('DEBUG_TIER_LOG_SAMPLE') || '0.1'); // Default 10% sampling
  
  try {
    const [{ createVendorFirstSupabaseClient }, tierLogging] = await Promise.all([
      memoizedImport("../_shared/resilientLoader.ts"),
      memoizedImport("../_shared/tierLogging.js")
    ]);
    
    const supabaseClient = await createVendorFirstSupabaseClient();
    
    // Sampling helper: only log to DB if sampled or failure
    const shouldLogToDB = (status: string = 'info') => {
      if (status === 'failed' || status === 'failure') return true; // Always log failures
      return Math.random() < logSampleRate; // Sample for success/info logs
    };
    
    // Wrap logging functions with PII redaction and sampling
    const wrapWithRedactionAndSampling = (fn: Function) => (msg: string, ctx: any = {}) => {
      const safeCtx = isProd ? redactPII(ctx) : ctx;
      
      // Always console log
      console.log(`[TIER_LOG] ${msg}`, safeCtx);
      
      // Conditionally log to DB (sample or failure)
      const status = String(safeCtx.status || 'info');
      if (shouldLogToDB(status)) {
        return fn(msg, safeCtx, supabaseClient, sessionId, requestId);
      }
    };
  
    return {
      t1: wrapWithRedactionAndSampling(tierLogging.logTier1),
      t2: wrapWithRedactionAndSampling(tierLogging.logTier2),
      attempt: (tier, ctx = {}) => {
        const safeCtx = isProd ? redactPII(ctx) : ctx;
        console.log(`[${tier}] Attempting`, safeCtx);
        if (shouldLogToDB('attempting')) {
          return tierLogging.logTierAttempt(supabaseClient, sessionId, requestId, tier, 'attempting', safeCtx);
        }
      },
      success: (tier, ctx = {}) => {
        const safeCtx = isProd ? redactPII(ctx) : ctx;
        console.log(`[${tier}] Success`, safeCtx);
        if (shouldLogToDB('success')) {
          return tierLogging.logTierSuccess(supabaseClient, sessionId, requestId, tier, safeCtx);
        }
      },
      failure: (tier, ctx = {}) => {
        const safeCtx = isProd ? redactPII(ctx) : ctx;
        console.error(`[${tier}] Failure`, safeCtx);
        // Always log failures to DB
        return tierLogging.logTierFailure(supabaseClient, sessionId, requestId, tier, safeCtx);
      },
    };
  } catch (error) {
    console.warn(`Failed to create Supabase client: ${error}`);
    // Return console-only logger to prevent function crashes
    const wrapConsoleWithRedaction = (prefix: string) => (msg: string, ctx: any = {}) => {
      const safeCtx = isProd ? redactPII(ctx) : ctx;
      console.log(`[${prefix}] ${msg}`, safeCtx);
    };
    
    return {
      t1: wrapConsoleWithRedaction('T1'),
      t2: wrapConsoleWithRedaction('T2'),
      attempt: (tier, ctx = {}) => wrapConsoleWithRedaction(tier)('Attempting', ctx),
      success: (tier, ctx = {}) => wrapConsoleWithRedaction(tier)('Success', ctx),
      failure: (tier, ctx = {}) => wrapConsoleWithRedaction(tier)('Failure', ctx),
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
  const headers: Record<string, string> = { 
    ...corsHeaders, 
    'Content-Type': 'application/json' 
  };
  
  // Add Retry-After header for 503 responses
  if (status === 503 && data?.retryAfterSeconds) {
    headers['Retry-After'] = String(data.retryAfterSeconds);
  }
  
  return new Response(JSON.stringify(data), {
    status,
    headers
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
// Accepts pageText OR storyText from root, bundle, or enhancedStoryData
function validatePayloadFast(payload: any): boolean {
  if (!payload) throw new Error("PAYLOAD_NULL");
  
  // Check for story content at multiple locations
  const hasPageText = payload.pageText && typeof payload.pageText === 'string' && payload.pageText.trim().length > 0;
  const hasStoryText = payload.storyText && typeof payload.storyText === 'string' && payload.storyText.trim().length > 0;
  const hasBundleStoryText = payload.bundle?.storyText && typeof payload.bundle.storyText === 'string' && payload.bundle.storyText.trim().length > 0;
  const hasEnhancedStoryText = payload.enhancedStoryData?.storyText && typeof payload.enhancedStoryData.storyText === 'string' && payload.enhancedStoryData.storyText.trim().length > 0;
  
  if (!hasPageText && !hasStoryText && !hasBundleStoryText && !hasEnhancedStoryText) {
    console.error("[runware-generate-image] Final error after retries: NO_STORY_CONTENT");
    throw new Error("NO_STORY_CONTENT");
  }
  
  // Check for session/user info at multiple locations - BOTH required
  const hasSessionId = payload.sessionId || payload.bundle?.sessionId || payload.enhancedStoryData?.sessionId;
  const hasUserInfo = payload.userInfo || payload.bundle?.userInfo || payload.enhancedStoryData?.userInfo;
  
  if (!hasSessionId || !hasUserInfo) throw new Error("NO_SESSION_OR_USER_INFO");
  return true; // Validation passed
}

// ============= INLINED TIER 1 PROCESSING (from PhaseIntegrationOrchestrator) =============
async function processInlinedTier1(payload: any, memoizedImport: any, logTier1Step: Function, tier1ErrorLog: any[]): Promise<any> {
  const { pageText, storyText, userInfo, sessionId } = payload;
  const userId = userInfo?.id || userInfo?.userId || 'anonymous';
  const characterName = userInfo?.name || userInfo?.childName || 'Child';
  
  console.log(`🎨 INLINED TIER 1: Processing for ${characterName} in session ${sessionId}`);
  
  // Import CharacterConsistencyService with resilient multi-path fallback (ERROR-046 fix)
  let characterConsistencyService;
  let characterServiceUnavailable = false;
  
  try {
    logTier1Step('CharacterConsistencyService Import', 'attempt', 'Loading CharacterConsistencyService');
    console.log(`[TIER_1] Attempting CharacterConsistencyService import with resilient pattern`);
    
    // Simple, proven import pattern (same as ai-visual-scene-creator)
    const { characterConsistencyService: service } = await import('../_shared/CharacterConsistencyService.js');
    characterConsistencyService = service;
    
    // Validate service instance has ALL required methods
    const requiredMethods = [
      'getStructuredAvatarData',
      'getEnhancedCharacterSeed', 
      'getCulturalEnhancements',
      'analyzeVisualDetails',
      'getColoredObjects',
      'detectAllCharacters',
      'getSessionSetting',
      'getSecondaryCharacterSeed'
    ];
    
    const missingMethods = requiredMethods.filter(method => 
      typeof characterConsistencyService?.[method] !== 'function'
    );
    
    if (missingMethods.length > 0) {
      throw new Error(`CharacterConsistencyService missing required methods: ${missingMethods.join(', ')}`);
    }
    
    logTier1Step('CharacterConsistencyService Import', 'success', 'Service loaded successfully');
    console.log(`[TIER_1] ✅ CharacterConsistencyService loaded successfully`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logTier1Step('CharacterConsistencyService Import', 'failed', errorMessage);
    console.warn(`[TIER_1] ⚠️ CharacterConsistencyService unavailable:`, errorMessage);
    console.log(`[TIER_1] Will escalate to Direct Mode (CCS is copilot there, not required)`);
    // Set flag but don't throw - let escalation logic handle it gracefully
    characterServiceUnavailable = true;
  }
  
  // If service is unavailable, escalate to Direct Mode (CCS is copilot, not required)
  if (characterServiceUnavailable) {
    throw new Error('CHARACTERSERVICE_UNAVAILABLE_TRY_DIRECT_MODE');
  }
  
  // Check for force flag (now passed from handler scope)
  const forceCompleteTier1 = payload.forceCompleteTier1 === true;
  if (forceCompleteTier1) {
    console.log(`🎯 FORCE TIER 1 MODE: Bypassing health checks, proceeding directly to Enhanced Character-First Flow`);
    console.log(`📋 Force mode payload validation:`, {
      hasStoryText: !!payload.storyText,
      hasPageText: !!payload.pageText,
      hasCharacterName: !!payload.characterName,
      hasUserInfo: !!payload.userInfo
    });
  }
  
  // Generate structured avatar data using centralized method (single source of truth)
  logTier1Step('Avatar Data Extraction', 'attempt', 'Building structured avatar data');
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
  
  // Runtime guard for getStructuredAvatarData method (ERROR-055 fix)
  let structuredAvatarData;
  if (typeof characterConsistencyService?.getStructuredAvatarData === 'function') {
    structuredAvatarData = await characterConsistencyService.getStructuredAvatarData(sessionId, userInfo);
  } else {
    console.warn(`⚠️ getStructuredAvatarData not available, escalating to Tier 2.5B`);
    throw new Error('GETSTRUCTUREDAVATARDATA_UNAVAILABLE_ESCALATE_TO_25B');
  }

  logTier1Step('Avatar Data Extraction', 'success', `Avatar data: ${structuredAvatarData?.skinTone}, ${structuredAvatarData?.hairColor}`);
  
  // Get enhanced character consistency data (CRITICAL - will throw on failure to trigger tier escalation)
  const characterSeed = await characterConsistencyService.getEnhancedCharacterSeed(
    sessionId,
    avatarIdentity,
    storyText || pageText || '',
    'continuing'
  );
  
  // Get cultural enhancements using the service
  const culturalBundle = await characterConsistencyService.getCulturalEnhancements(userInfo, sessionId, characterName);
  
  // Analyze visual details from story text
  const tier1Start = Date.now();
  await characterConsistencyService.analyzeVisualDetails(sessionId, storyText || pageText, payload.pageNumber || 1);
  const coloredObjects = await characterConsistencyService.getColoredObjects(sessionId);

  // Reuse session-cached secondary characters to avoid duplicate heavy detection
  const secondaryCharacters = await characterConsistencyService.getSecondaryCharactersForSession(sessionId);
  
  // PHASE 1: Get main character appearance data
  const detectionResults = await characterConsistencyService.detectAllCharacters(storyText || pageText, { 
    sessionId, 
    pageNumber: payload.pageNumber || 1 
  });
  const mainCharacterAppearance = detectionResults.mainCharacterAppearance || {};
  
  // Keep animals lean to avoid extra passes; not required for templates currently
  const detectedAnimals: any[] = [];

  // Get session setting (indoor/outdoor context) - CCS should auto-detect, no hardcoded fallback
  const sessionSetting = await characterConsistencyService.getSessionSetting(sessionId, 'context', '');

  // Lean CPU budget guard for Tier 1 analysis
  const TIER1_CPU_BUDGET_MS = 2200;
  const elapsedTier1 = Date.now() - tier1Start;
  if (elapsedTier1 > TIER1_CPU_BUDGET_MS) {
    console.warn(`[TIER_1] CPU budget exceeded (${elapsedTier1}ms > ${TIER1_CPU_BUDGET_MS}ms). Escalating to Direct Mode early.`);
    throw new Error('CHARACTERSERVICE_BUDGET_EXCEEDED_TRY_DIRECT_MODE');
  }
  
  console.log(`✅ CHARACTER FOUNDATION: Established complete character consistency data`, {
    hasCharacterSeed: !!characterSeed,
    hasCulturalBundle: !!culturalBundle,
    coloredObjectsCount: coloredObjects?.split(',').length || 0,
    secondaryCharactersCount: secondaryCharacters.length,
    detectedAnimalsCount: detectedAnimals.length,
    sessionSetting
  });
  
  // Get AI-generated primary scene and complete schema
  let primaryScene;
  let aiSchema: Record<string, any> = {};
  let aiDebugSchema: any = null;
  try {
    logTier1Step('AI Scene Creator Call', 'attempt', 'Invoking ai-visual-scene-creator');
    const { createVendorFirstSupabaseClient } = await memoizedImport('../_shared/resilientLoader.ts');
    const supabase = await createVendorFirstSupabaseClient();
    
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
        secondaryCharacters, // Now includes visualDetails from Phase 1
        mainCharacterAppearance, // PHASE 1: Pass main character appearance
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
      hasDetectedAnimals: detectedAnimals.length > 0,
      hasSessionSetting: !!sessionSetting
    });
    
    if (aiError || !aiResult?.primaryScene) {
      logTier1Step('AI Scene Creator Call', 'failed', `AI error: ${aiError?.message || 'No primary scene'}`);
      throw new Error('NO_PRIMARY_SCENE_ESCALATE_TO_25A');
    }
    
    primaryScene = aiResult.primaryScene;
    aiDebugSchema = aiResult.aiDebugSchema || null;
    logTier1Step('AI Scene Creator Call', 'success', `Primary scene generated: ${primaryScene?.substring(0, 50)}...`);
    
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    logTier1Step('AI Scene Creator Call', 'failed', errorMessage);
    console.warn('AI scene creator failed:', error);
    throw new Error('NO_PRIMARY_SCENE_ESCALATE_TO_25A');
  }
  
  // ============================================================================
  // PHASE 3: POST-AI CONSISTENCY VALIDATION
  // After receiving primaryScene from AI, validate that AI scene doesn't
  // conflict with established character data
  // ============================================================================
  
  logTier1Step('Scene Validation', 'attempt', 'Validating primary scene quality');
  console.log(`🔍 CONSISTENCY VALIDATION: Checking AI scene against character data`);
  
  // Validate primary scene quality
  if (!validatePrimarySceneQuality(primaryScene)) {
    logTier1Step('Scene Validation', 'failed', 'Primary scene quality check failed');
    console.warn(`⚠️ CONSISTENCY WARNING: Primary scene quality validation failed`);
  } else {
    logTier1Step('Scene Validation', 'success', 'Primary scene validated');
  }
  
  // Log consistency check for debugging
  const consistencyCheck = {
    primarySceneLength: primaryScene?.length || 0,
    hasCharacterSeed: !!characterSeed,
    hasCulturalBundle: !!culturalBundle,
    hasColoredObjects: !!coloredObjects,
    secondaryCharactersMatched: secondaryCharacters?.length || 0,
    animalsDetected: detectedAnimals.length,
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
  
  
  // Get style framework with safe type coercion
  const difficulty = String(userInfo?.difficulty || userInfo?.gradeLevel || 'medium').toLowerCase();
  const styleFramework = getInlinedStyleFramework(difficulty);
  
  // ============================================================================
  // PHASE 4: TEMPLATE BUILDING WITH FULL CONTEXT
  // Use both character consistency data AND AI-generated primaryScene
  // Build template that leverages cross-page consistency
  // ============================================================================
  
  logTier1Step('Template Building', 'attempt', 'Constructing COMPLETE_TIER_1 template');
  
  // Build COMPLETE_TIER_1 template with deduplication logic
  // Hair and skin are already in culturalBundle, no need for physicalDescription
  const characterAge = userInfo?.age || 6;
  const hasAgeInDescription = characterSeed?.characterDescription?.includes('age');
  const ageText = `, age ${characterAge}`;
  
  const mainCharacterDetails = `Beautiful ${characterReference} character ${characterName}${ageText}${characterSeed?.characterDescription && !hasAgeInDescription ? `, ${characterSeed.characterDescription}` : ''}${culturalBundle?.hair ? `, ${culturalBundle.hair}` : ''}${culturalBundle?.features ? `, ${culturalBundle.features}` : ''}`;
  
  const secondaryCharsText = secondaryCharacterSeeds.length > 0 ? `With ${secondaryCharacterSeeds.map(s => s.visualDescription).join(', ')}` : '';
  const animalsText = detectedAnimals?.length > 0 ? `Including ${detectedAnimals.map(a => a.name || a.type).join(', ')}` : '';
  // Phase 2: Remove sessionSetting duplication - it's already in aiSchema.sceneSettings
  const consistencyElements = [
    secondaryCharsText,
    animalsText
  ].filter(Boolean).join(', ');
  
  const enhancedPrompt = COMPLETE_TIER_1_TEMPLATE
    .replace('{primaryScene}', primaryScene)
    .replace('{mainCharacterDetails}', mainCharacterDetails)
    .replace('{secondaryCharacters}', consistencyElements ? `${consistencyElements}. ` : '')
    .replace('{coloredObjects}', coloredObjects ? `Featuring ${coloredObjects}. ` : '')
    .replace('{settingContext}', aiSchema?.sceneSettings ? `In ${aiSchema.sceneSettings}. ` : '')
    .replace('{styleFramework}', styleFramework);
  
  logTier1Step('Template Building', 'success', `Template built, length: ${enhancedPrompt.length}`);
  
  console.log(`✅ TEMPLATE BUILDING: Enhanced prompt with full context`, {
    primarySceneLength: primaryScene?.length || 0,
    mainCharacterLength: mainCharacterDetails?.length || 0,
    consistencyElementsLength: consistencyElements?.length || 0,
    totalPromptLength: enhancedPrompt?.length || 0
  });
  
  // Generate nuclear negative prompt with cultural and gender awareness
  const culturalProfile = detectCulturalProfileForNegatives(
    userInfo?.nativeLanguage || userInfo?.language,
    structuredAvatarData?.skinTone
  );
  const avatarType = userInfo?.avatarType || 
    (userInfo?.gender === 'girl' ? 'girl' : 
     userInfo?.gender === 'boy' ? 'boy' : 'child');
  
  const negativePrompt = generateNuclearNegativePrompt(
    culturalProfile,
    avatarType,
    userInfo?.difficulty || 'medium',
    payload.pageNumber || 1,
    secondaryCharacters
  );
  
  console.log(`✅ NUCLEAR NEGATIVE: Generated with profile=${culturalProfile}, type=${avatarType}`);
  
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
      deployment_version: '2025-10-01T21:45:00Z',
      timestamp: new Date().toISOString(),
      environment: {
        runwareApiKeyPresent: !!runwareKey,
        runwareApiKeyLength: runwareKey ? runwareKey.length : 0,
        openaiApiKeyPresent: !!openaiKey,
        openaiApiKeyLength: openaiKey ? openaiKey.length : 0,
        supabaseServiceRoleKeyPresent: !!supabaseKey,
        supabaseServiceRoleKeyLength: supabaseKey ? supabaseKey.length : 0
      },
      capabilities: ["tier_orchestration", "image_generation", "complete_cascade_1_DirectMode_2.5A_2.5B_2.5C_2.5D"]
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
      
      // PHASE 4.1: DRY RUN MODE DETECTION
      const isDryRun = payload.dryRun === true;
      if (isDryRun) {
        console.log(`🧪 [${requestId}] DRY RUN MODE: Debug-only request detected`);
      }
      
      // PHASE 4.5: PAYLOAD NORMALIZATION - Unify pageText/storyText and nested structures
      // Extract story text from all possible locations
      const storyTextValue = payload.pageText || payload.storyText || payload.bundle?.storyText || payload.enhancedStoryData?.storyText;
      
      // Extract userInfo from all possible locations
      const userInfoValue = payload.userInfo || payload.bundle?.userInfo || payload.enhancedStoryData?.userInfo;
      
      // Extract sessionId from all possible locations
      const sessionIdValue = payload.sessionId || payload.bundle?.sessionId || payload.enhancedStoryData?.sessionId;
      
      // Extract pageNumber from all possible locations
      const pageNumberValue = payload.pageNumber || payload.bundle?.pageNumber || payload.enhancedStoryData?.pageNumber || 1;
      
      // Normalize payload: ensure both pageText and storyText are set at root level
      payload.pageText = storyTextValue;
      payload.storyText = storyTextValue;
      payload.userInfo = userInfoValue;
      payload.sessionId = sessionIdValue;
      payload.pageNumber = pageNumberValue;
      
      // Preserve nested structures for backward compatibility
      if (!payload.enhancedStoryData && userInfoValue) {
        payload.enhancedStoryData = { userInfo: userInfoValue, storyText: storyTextValue };
      }
      if (!payload.bundle && userInfoValue) {
        payload.bundle = { 
          userInfo: userInfoValue, 
          storyText: storyTextValue, 
          sessionId: sessionIdValue,
          pageNumber: pageNumberValue 
        };
      }
      
      console.log(`✅ [${requestId}] Payload normalized: pageText=${!!payload.pageText}, storyText=${!!payload.storyText}, userInfo=${!!payload.userInfo}, sessionId=${!!payload.sessionId}`);
      
      // Extract force flag at handler scope so it's accessible in catch blocks
      const forceCompleteTier1 = payload.forceCompleteTier1 === true;

      // Initialize Tier 1 Timeline tracking at handler scope (CRITICAL FIX: was inside processInlinedTier1)
      // Phase 4: Keep last 20 entries (sliding window) to preserve most recent failures
      const tier1ErrorLog: Array<{step: string, status: 'attempt' | 'success' | 'failed' | 'skipped', message: string, at: string}> = [];
      const logTier1Step = (step: string, status: 'attempt' | 'success' | 'failed' | 'skipped', message: string) => {
        tier1ErrorLog.push({ step, status, message: message.substring(0, 200), at: new Date().toISOString() });
        // Keep only last 20 entries (sliding window)
        if (tier1ErrorLog.length > 20) {
          tier1ErrorLog.splice(0, tier1ErrorLog.length - 20);
        }
      };

      // Preferred: resilient loader from _shared
      let memoizedImport: <T=any>(href: string) => Promise<T>;
      let usingResilientLoader = false;
      try {
        ({ memoizedImport } = await import(
          new URL("../_shared/resilientLoader.ts", import.meta.url).href
        ));
        usingResilientLoader = true;
        console.log(`✅ [CDN_HEALTH] Using resilient loader with multi-CDN fallback support`);
      } catch (loaderError) {
        console.warn(`⚠️ [CDN_HEALTH] Resilient loader unavailable, using local fallback:`, loaderError instanceof Error ? loaderError.message : String(loaderError));
        // Fallback: vendor-aware local memoizer to stay up during cold boot anomalies
        const cache = new Map<string, Promise<any>>();
        memoizedImport = <T=any>(href: string) => {
          if (!cache.has(href)) {
            console.log(`📦 [CDN_HEALTH] Local memoizer importing: ${href}`);
            // Try vendor path first for known packages
            let importPath = href;
            if (href.includes('@supabase/supabase-js')) {
              importPath = '../_vendor/supabase-js@2.57.4.mjs';
            } else if (href.includes('openai')) {
              importPath = '../_vendor/openai@4.28.0.mjs';
            }
            cache.set(href, import(importPath).catch(() => import(href)));
          }
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
        enhancedPrompt = await processInlinedTier1(payload, memoizedImport, logTier1Step, tier1ErrorLog);
        
        if (!enhancedPrompt || !validatePrimarySceneQuality(enhancedPrompt.primaryScene || enhancedPrompt.enhancedPrompt || '')) {
          throw new Error('NO_PRIMARY_SCENE_ESCALATE_TO_25A');
        }
        
        // DRY RUN MODE: Return debug data without generating image
        if (isDryRun) {
          console.log(`🧪 [${requestId}] DRY RUN: Returning Tier 1 debug data without image generation`);
          
          tierLogger.success('TIER_1_DRY_RUN', {
            templateStructure: 'COMPLETE_TIER_1',
            dryRun: true
          });
          
          return corsResponse({
            success: true,
            dryRun: true,
            tier: 'TIER_1',
            pathUsed: 'orchestrator',
            resultType: 'TIER_1_DRY_RUN',
            templateStructure: 'COMPLETE_TIER_1',
            requestId: requestId,
            timestamp: new Date().toISOString(),
            
            // Enhanced Debug Data
            tier1Debug: {
              timeline: tier1ErrorLog,
              enhancedPrompt: enhancedPrompt.enhancedPrompt,
              negativePrompt: enhancedPrompt.negativePrompt,
              primaryScene: enhancedPrompt.primaryScene,
              templateStructure: enhancedPrompt.templateStructure
            },
            
            // CCS Debug Data
            ccsDebug: {
              characterSeed: enhancedPrompt.characterSeed,
              culturalBundle: enhancedPrompt.culturalBundle,
              coloredObjects: enhancedPrompt.coloredObjects,
              secondaryCharacterSeeds: enhancedPrompt.secondaryCharacterSeeds,
              secondaryCharacters: enhancedPrompt.secondaryCharacters,
              detectedAnimals: enhancedPrompt.detectedAnimals,
              sessionSetting: enhancedPrompt.sessionSetting,
              structuredAvatarData: enhancedPrompt.structuredAvatarData,
              aiSchema: enhancedPrompt.aiSchema,
              aiDebugSchema: enhancedPrompt.aiDebugSchema,
              tier1Steps: tier1ErrorLog.length,
              cascadeHistory: ['✅ Tier 1 Dry Run Complete (No Image Generation)']
            }
          }, req, 200);
        }

        // Real Runware image generation using WebSocket service
        const { RunwareWebSocketService } = await memoizedImport("../_shared/RunwareWebSocketService.ts");
        
        // Validate service is functional
        if (!RunwareWebSocketService || typeof RunwareWebSocketService.generateImage !== 'function') {
          throw new Error('TIER_1_PROCESSING_FAILED: RunwareWebSocketService not functional - missing generateImage method');
        }
        
        const runwareApiKey = Deno.env.get('RUNWARE_API_KEY');
        
        if (!runwareApiKey) {
          throw new Error('TIER_1_PROCESSING_FAILED: Runware API key not configured');
        }

        logTier1Step('Image Generation', 'attempt', 'Calling RunwareWebSocketService.generateImage');

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
          logTier1Step('Image Generation', 'failed', 'RunwareWebSocketService image generation failed');
          throw new Error('TIER_1_PROCESSING_FAILED: Image generation failed');
        }

        logTier1Step('Image Generation', 'success', `Image generated successfully: ${imageResult.imageURL?.substring(0, 50)}...`);

        // Return successful COMPLETE_TIER_1 response
        tierLogger.success('TIER_1', {
          templateStructure: 'COMPLETE_TIER_1',
          imageURL: imageResult.imageURL,
          enhancedPrompt: enhancedPrompt.enhancedPrompt,
          negativePrompt: enhancedPrompt.negativePrompt
        });

        return corsResponse({
          success: true,
          imageURL: imageResult.imageURL,
          provider: 'runware-websocket',
          tier: 'TIER_1',
          pathUsed: 'orchestrator',
          resultType: 'TIER_1_SUCCESS',
          templateStructure: 'COMPLETE_TIER_1',
          requestId: requestId,
          timestamp: new Date().toISOString(),
          positivePrompt: enhancedPrompt.enhancedPrompt,
          negativePrompt: enhancedPrompt.negativePrompt,
          
          // Enhanced Debug Data for E2E Simulation
          tier1Debug: {
            timeline: tier1ErrorLog,
            enhancedPrompt: enhancedPrompt.enhancedPrompt,
            negativePrompt: enhancedPrompt.negativePrompt,
            primaryScene: enhancedPrompt.primaryScene,
            templateStructure: enhancedPrompt.templateStructure
          },
          
          orchestratorDebugData: {
            aiDebugSchema: enhancedPrompt.aiDebugSchema,
            primaryScene: enhancedPrompt.primaryScene,
            aiSchema: enhancedPrompt.aiSchema
          },
          metadata: {
            enhancedPrompt: enhancedPrompt.enhancedPrompt,
            negativePrompt: enhancedPrompt.negativePrompt,
            primaryScene: enhancedPrompt.primaryScene,
            templateStructure: 'COMPLETE_TIER_1',
            cascadeHistory: ['✅ Tier 1 Complete Success']
          }
        }, req, 200);

      } catch (tier1Error: unknown) {
        const errorMessage = tier1Error instanceof Error ? tier1Error.message : String(tier1Error);
        const errorStack = tier1Error instanceof Error ? tier1Error.stack : undefined;
        console.log(`[TIER_1] Failed: ${errorMessage}`);
        console.log(`[TIER_1] Error stack:`, errorStack);
        tierLogger.failure('TIER_1', { error: errorMessage });
        
        // FORCE MODE: If forceCompleteTier1 is true, return failure immediately without cascading
        if (forceCompleteTier1) {
          console.log(`[TIER_1_FORCE_MODE] forceCompleteTier1=true - returning failure immediately, NO CASCADE`);
          
          // Detect component-specific failures
          const isCharacterServiceFailure = errorMessage.includes('CharacterConsistencyService') || 
                                           errorMessage.includes('CHARACTERSERVICE_UNAVAILABLE') ||
                                           errorMessage.includes('Module not found') ||
                                           errorMessage.includes('GETSTRUCTUREDAVATARDATA');
          const isAISceneCreatorFailure = errorMessage.includes('ai-visual-scene-creator') || 
                                         errorMessage.includes('MISSING_STORY_CONTENT') ||
                                         errorMessage.includes('NO_PRIMARY_SCENE') ||
                                         errorMessage.includes('primaryScene');
          const isOrchestratorFailure = errorMessage.includes('PhaseIntegrationOrchestrator') || 
                                       errorMessage.includes('import') ||
                                       errorMessage.includes('IMPORT_SYNC_ANOMALY');
          const isRunwareFailure = errorMessage.includes('RunwareWebSocketService') ||
                                  errorMessage.includes('RUNWARE_API_KEY') ||
                                  errorMessage.includes('Image generation failed');
          
          // Component Health Status
          const componentHealth = {
            characterConsistencyService: !isCharacterServiceFailure,
            aiSceneCreator: !isAISceneCreatorFailure,
            orchestrator: !isOrchestratorFailure,
            runwareService: !isRunwareFailure
          };
          
          // Determine failure category
          let failureCategory = 'UNKNOWN_FAILURE';
          let failureDetails = errorMessage;
          
          if (isCharacterServiceFailure) {
            failureCategory = 'CHARACTER_SERVICE_FAILURE';
            failureDetails = 'CharacterConsistencyService unavailable or malfunctioning. Required methods may be missing.';
          } else if (isAISceneCreatorFailure) {
            failureCategory = 'AI_SCENE_CREATOR_FAILURE';
            failureDetails = 'ai-visual-scene-creator failed to generate primary scene. May be missing story content or API keys.';
          } else if (isOrchestratorFailure) {
            failureCategory = 'ORCHESTRATOR_FAILURE';
            failureDetails = 'Orchestrator failed to load or process. Import sync anomaly detected.';
          } else if (isRunwareFailure) {
            failureCategory = 'RUNWARE_SERVICE_FAILURE';
            failureDetails = 'Runware image generation service failed. Check API key and service availability.';
          }
          
          console.log(`[TIER_1_FORCE_MODE] Failure Category: ${failureCategory}`);
          console.log(`[TIER_1_FORCE_MODE] Component Health:`, componentHealth);
          console.log(`[TIER_1_FORCE_MODE] Tier 1 Timeline Steps:`, tier1ErrorLog.length);
          
          return corsResponse({
            success: false,
            error: failureDetails,
            errorMessage: errorMessage,
            tier: 'TIER_1_FORCE_MODE',
            pathUsed: 'orchestrator',
            resultType: 'TIER_1_FORCE_MODE_FAILURE',
            failureCategory: failureCategory,
            templateStructure: 'TIER_1_FORCED_FAILURE',
            forceMode: true,
            cascadePrevented: true,
            cascadeBlocked: true,
            requestId: requestId,
            timestamp: new Date().toISOString(),
            
            // Enhanced Component Diagnostics
            componentHealth: componentHealth,
            componentFailures: {
              characterConsistencyService: isCharacterServiceFailure,
              aiSceneCreator: isAISceneCreatorFailure,
              orchestrator: isOrchestratorFailure,
              runwareService: isRunwareFailure
            },
            
            // Tier 1 Timeline for Debugging
            tier1Debug: {
              timeline: tier1ErrorLog,
              lastStep: tier1ErrorLog[tier1ErrorLog.length - 1] || 'Unknown',
              context: {
                note: 'Tier 1 escalated to Direct Mode - AI scene insufficient, system operating normally',
                partialData: payload ? {
                  storyText: payload.storyText?.substring(0, 100) + '...',
                  hasUserInfo: !!payload.userInfo,
                  sessionId: payload.sessionId
                } : null
              }
            },
            
            metadata: {
              errorMessage,
              errorStack: errorStack?.substring(0, 500) || 'No stack trace available',
              forceCompleteTier1: true,
              failureCategory: failureCategory,
              cascadeHistory: [
                `❌ Tier 1 Force Mode Failed: ${failureCategory}`,
                `📋 ${failureDetails}`,
                '⛔ Cascade Blocked: forceCompleteTier1=true'
              ]
            }
          }, req, 200);
        }
        
        // Detect if CharacterConsistencyService is unavailable
        const isCharacterServiceUnavailable = errorMessage.includes('CHARACTERSERVICE_UNAVAILABLE_TRY_DIRECT_MODE') || 
                                              errorMessage.includes('CharacterConsistencyService') || 
                                              errorMessage.includes('Module not found') ||
                                              errorMessage.includes('_shared');
        
        if (isCharacterServiceUnavailable) {
          console.log(`[CASCADE] CharacterConsistencyService unavailable - will attempt Direct Mode (CCS is copilot there)`);
        }
        
        // Create Supabase client once for all fallback attempts
        const { createVendorFirstSupabaseClient } = await memoizedImport('../_shared/resilientLoader.ts');
        const internalSupabase = await createVendorFirstSupabaseClient();
        
        let directErrorMessage = 'Direct Mode not attempted';
        
        // CORRECTED CASCADE: Always try Direct Mode after Tier 1 failure (Direct Mode works without Tier 1 scene)
        console.log(`[DIRECT_MODE] Attempting Direct Mode fallback after Tier 1 failure`);
          
        try {
          // Gate check for Direct Mode (shares T1 gate key)
          const dmGateResult = await ProviderGate.acquire('DM:runware-template-cd');
          if (!dmGateResult.acquired) {
            console.warn(`⚠️ [GATE] Direct Mode denied: ${dmGateResult.reason}`);
            directErrorMessage = `GATE_DENIED: ${dmGateResult.reason}`;
            throw new Error(directErrorMessage);
          }
          
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
                pathUsed: 'direct-mode',
                resultType: 'DIRECT_MODE_SUCCESS',
                requestId: requestId,
                timestamp: new Date().toISOString(),
                tier1FailureReason: errorMessage,
                // Expose prompts at top level for easy frontend access
                positivePrompt: directModeResponse.data?.runwareDebugData?.positivePrompt,
                negativePrompt: directModeResponse.data?.runwareDebugData?.negativePrompt,
                metadata: {
                  cascadeHistory: [
                    `❌ Tier 1 Failed: ${errorMessage}`,
                    '✅ Direct Mode Success'
                  ]
                },
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
          } finally {
            // Ensure gate is released
            if (directErrorMessage.includes('GATE_DENIED')) {
              // Already handled
            } else {
              ProviderGate.release('DM:runware-template-cd', !directErrorMessage || directErrorMessage === 'Direct Mode not attempted');
            }
          }
            
          } catch (directModeError: unknown) {
            directErrorMessage = directModeError instanceof Error ? directModeError.message : String(directModeError);
            console.log(`[DIRECT_MODE] Failed: ${directErrorMessage}`);
            tierLogger.failure('DIRECT_MODE', { error: directErrorMessage });
            // Continue to 2.5A cascade below
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
                pathUsed: 'template-cascade',
                resultType: 'TIER_2.5B_SUCCESS',
                requestId: requestId,
                timestamp: new Date().toISOString(),
                tier1FailureReason: errorMessage,
                metadata: {
                  cascadeHistory: [
                    `❌ Tier 1 Failed: CharacterConsistencyService unavailable`,
                    `❌ Direct Mode Failed: ${directErrorMessage}`,
                    `⏭️ Tier 2.5A Skipped: CharacterConsistencyService unavailable`,
                    '✅ Tier 2.5B Success (Nuclear Independence)'
                  ]
                }
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
            // Gate check for Tier 2.5A
            const t25aGateResult = await ProviderGate.acquire('T25A:runware-template-ab');
            if (!t25aGateResult.acquired) {
              console.warn(`⚠️ [GATE] Tier 2.5A denied: ${t25aGateResult.reason}`);
              tier25aErrorMessage = `GATE_DENIED: ${t25aGateResult.reason}`;
              throw new Error(tier25aErrorMessage);
            }
            
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
                pathUsed: 'template-cascade',
                resultType: 'TIER_2.5A_SUCCESS',
                requestId: requestId,
                timestamp: new Date().toISOString(),
                tier1FailureReason: errorMessage,
                metadata: {
                  cascadeHistory: [
                    `❌ Tier 1 Failed: ${errorMessage.includes('NO_PRIMARY_SCENE') ? 'NO_PRIMARY_SCENE (missing service key)' : errorMessage}`,
                    `❌ Direct Mode Failed: ${directErrorMessage}`,
                    '✅ Tier 2.5A Success'
                  ]
                }
              };
            
              tierLogger.success('TIER_2.5A', { result });
              console.log(`SUCCESS [${requestId}] Tier 2.5A fallback completed`);
              
              return corsResponse({
                ...result
              }, req);
            } else {
              throw new Error('TIER_2.5A_FAILED: Template A processing failed');
            }
            } finally {
              // Ensure gate is released
              ProviderGate.release('T25A:runware-template-ab', !tier25aErrorMessage);
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
                success: true,
                imageURL: tier25bResponse.data.imageURL,
                provider: 'tier-2.5b-fallback',
                tier: 'TIER_2.5B',
                pathUsed: 'template-cascade',
                resultType: 'TIER_2.5B_SUCCESS',
                requestId: requestId,
                timestamp: new Date().toISOString(),
                cascadeFailures: [errorMessage, tier25aErrorMessage],
                metadata: {
                  cascadeHistory: [
                    `❌ Tier 1 Failed: ${errorMessage}`,
                    `❌ Direct Mode Failed: ${directErrorMessage}`,
                    `❌ Tier 2.5A Failed: ${tier25aErrorMessage}`,
                    '✅ Tier 2.5B Success'
                  ]
                }
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
            // Gate check for Tier 2.5C
            const t25cGateResult = await ProviderGate.acquire('T25C:runware-template-cd');
            if (!t25cGateResult.acquired) {
              console.warn(`⚠️ [GATE] Tier 2.5C denied: ${t25cGateResult.reason}`);
              const tier25cErrorMessage = `GATE_DENIED: ${t25cGateResult.reason}`;
              tierLogger.failure('TIER_2.5C', { error: tier25cErrorMessage });
              throw new Error(tier25cErrorMessage);
            }
            
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
                success: true,
                imageURL: tier25cResponse.data.imageURL,
                provider: 'tier-2.5c-fallback',
                tier: 'TIER_2.5C',
                pathUsed: 'template-cascade',
                resultType: 'TIER_2.5C_SUCCESS',
                requestId: requestId,
                timestamp: new Date().toISOString(),
                cascadeFailures: [errorMessage, tier25aErrorMessage, tier25bErrorMessage, directErrorMessage],
                metadata: {
                  cascadeHistory: [
                    `❌ Tier 1 Failed: ${errorMessage}`,
                    `❌ Direct Mode Failed: ${directErrorMessage}`,
                    `❌ Tier 2.5A Failed: ${tier25aErrorMessage}`,
                    `❌ Tier 2.5B Failed: ${tier25bErrorMessage}`,
                    '✅ Tier 2.5C Success (Nuclear Fallback)'
                  ]
                }
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
            } finally {
              // Ensure gate is released
              ProviderGate.release('T25C:runware-template-cd', !tier25cErrorMessage);
            }
            
          } catch (tier25cError: unknown) {
            const tier25cErrorMessage = tier25cError instanceof Error ? tier25cError.message : String(tier25cError);
            console.log(`[TIER_2.5C] Failed: ${tier25cErrorMessage}`);
            tierLogger.failure('TIER_2.5C', { error: tier25cErrorMessage });
            
            // Try Tier 2.5D before escalating to TIER_4
            console.log(`[TIER_2.5D] Attempting emergency fallback after 2.5C failure`);
            
            try {
              // Gate check for Tier 2.5D
              const t25dGateResult = await ProviderGate.acquire('T25C:runware-template-cd'); // Same gate as 2.5C (same service)
              if (!t25dGateResult.acquired) {
                console.warn(`⚠️ [GATE] Tier 2.5D denied: ${t25dGateResult.reason}`);
                const tier25dErrorMessage = `GATE_DENIED: ${t25dGateResult.reason}`;
                tierLogger.failure('TIER_2.5D', { error: tier25dErrorMessage });
                throw new Error(tier25dErrorMessage);
              }
              
              try {
                const tier25dResponse = await internalSupabase.functions.invoke('runware-template-cd', {
                  body: {
                    ...payload,
                    templateComplexity: 'D',
                    tier1FailureReason: errorMessage,
                    tier25aFailureReason: tier25aErrorMessage,
                    tier25bFailureReason: tier25bErrorMessage,
                    tier25cFailureReason: tier25cErrorMessage
                  }
                });
              
              if (tier25dResponse.data?.success && tier25dResponse.data?.imageURL) {
                const result = {
                  success: true,
                  imageURL: tier25dResponse.data.imageURL,
                  provider: 'tier-2.5d-fallback',
                  tier: 'TIER_2.5D',
                  pathUsed: 'template-cascade',
                  resultType: 'TIER_2.5D_SUCCESS',
                  requestId: requestId,
                  timestamp: new Date().toISOString(),
                  cascadeFailures: [errorMessage, tier25aErrorMessage, tier25bErrorMessage, tier25cErrorMessage, directErrorMessage],
                  metadata: {
                    cascadeHistory: [
                      `❌ Tier 1 Failed: ${errorMessage}`,
                      `❌ Direct Mode Failed: ${directErrorMessage}`,
                      `❌ Tier 2.5A Failed: ${tier25aErrorMessage}`,
                      `❌ Tier 2.5B Failed: ${tier25bErrorMessage}`,
                      `❌ Tier 2.5C Failed: ${tier25cErrorMessage}`,
                      '✅ Tier 2.5D Success (Emergency Template)'
                    ]
                  }
                };
                
                tierLogger.success('TIER_2.5D', { result });
                console.log(`SUCCESS [${requestId}] Tier 2.5D emergency fallback completed`);
                
                return corsResponse({
                  success: true,
                  ...result
                }, req);
              } else {
                throw new Error('TIER_2.5D_FAILED: Template D processing failed');
              }
              } finally {
                // Ensure gate is released
                ProviderGate.release('T25C:runware-template-cd', !tier25dErrorMessage);
              }
              
            } catch (tier25dError: unknown) {
              const tier25dErrorMessage = tier25dError instanceof Error ? tier25dError.message : String(tier25dError);
              console.log(`[TIER_2.5D] Failed: ${tier25dErrorMessage}`);
              tierLogger.failure('TIER_2.5D', { error: tier25dErrorMessage });
              
              // All tiers exhausted - final error - return 503 to signal client backoff
              const finalError = `All tiers exhausted. Final errors: Tier1: ${errorMessage}, 2.5A: ${tier25aErrorMessage}, 2.5B: ${tier25bErrorMessage}, 2.5C: ${tier25cErrorMessage}, 2.5D: ${tier25dErrorMessage}`;
              tierLogger.failure('ALL_TIERS', { finalError });
              console.error(`❌ [${requestId}] All tiers failed`);
              
              return corsResponse({ 
                success: false,
                error: finalError,
                escalationTarget: "TIER_4",
                message: "All image generation tiers failed. Please try again.",
                retryAfterSeconds: 8
              }, req, 503);
            }
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