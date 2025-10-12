// 🚀 DEPLOYMENT MARKER: v2025-01-10-SINGLE-FILE-TS
// Last deployed: 2025-01-10
// Changes: Converted to single-file TypeScript architecture (no dynamic import)
// PHASE 1: Universal LKG System for bulletproof reliability
// PHASE 2: Request Deduplication to eliminate duplicate API calls
// PHASE 3: Enhanced Circuit Breaker with smart failure classification
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { UniversalLKGCache } from '../_shared/UniversalLKGCache.ts';
import { RequestDeduplicator } from '../_shared/RequestDeduplicator.ts';
import { EnhancedCircuitBreaker } from '../_shared/EnhancedCircuitBreaker.ts';
import { monitoringService } from '../_shared/MonitoringService.ts';

const TIER_LOGGING_VERSION = '2.0-rls-detection';

// ========== INLINE CORS (Zero Dependencies) ==========
function generateEchoCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin");
  const allowOrigin = origin || "*";

  const requestHeaders = req.headers.get("Access-Control-Request-Headers");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": requestHeaders || "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
    "Access-Control-Max-Age": "600",
    Vary: "Origin, Access-Control-Request-Headers",
  };
  
  if (origin) {
    headers["Access-Control-Allow-Credentials"] = "true";
  }
  
  return headers;
}

function corsResponse(data: any, req: Request, status = 200): Response {
  const corsHeaders = generateEchoCorsHeaders(req);
  const headers: Record<string, string> = {
    ...corsHeaders,
    "Content-Type": "application/json",
  };

  if (status === 503 && data?.retryAfterSeconds) {
    headers["Retry-After"] = String(data.retryAfterSeconds);
    headers["Access-Control-Expose-Headers"] = "Retry-After";
  }

  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
}

const SERVICE_NAME = "runware-template-cd";

// ========== INLINED: ProviderGate (Concurrency + Circuit Breaker) ==========
interface GateConfig {
  maxConcurrency: number;
  failThreshold: number;
  cooldownMs: number;
  maxWaitMs: number;
}

interface CircuitState {
  failures: number;
  lastFailureAt: number;
  isOpen: boolean;
}

interface GateState {
  active: number;
  waiting: Array<{ resolve: () => void; acquiredAt: number }>;
  circuit: CircuitState;
}

const gates = new Map<string, GateState>();

const DEFAULT_CONFIGS: Record<string, GateConfig> = {
  'DM:runware-template-cd': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE') || '4'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '45000'),
    maxWaitMs: 2000
  },
  'T25C:runware-template-cd': {
    maxConcurrency: parseInt(Deno.env.get('PROVIDER_CONCURRENCY_RUNWARE') || '4'),
    failThreshold: parseInt(Deno.env.get('CIRCUIT_FAIL_THRESHOLD') || '5'),
    cooldownMs: parseInt(Deno.env.get('CIRCUIT_COOLDOWN_MS') || '45000'),
    maxWaitMs: 2000
  }
};

function getOrCreateGateState(key: string): GateState {
  if (!gates.has(key)) {
    gates.set(key, {
      active: 0,
      waiting: [],
      circuit: {
        failures: 0,
        lastFailureAt: 0,
        isOpen: false
      }
    });
  }
  return gates.get(key)!;
}

function getConfig(key: string): GateConfig {
  return DEFAULT_CONFIGS[key] || DEFAULT_CONFIGS['DM:runware-template-cd'];
}

function isCircuitOpen(key: string): boolean {
  const state = getOrCreateGateState(key);
  const config = getConfig(key);
  const now = Date.now();
  
  if (state.circuit.isOpen) {
    if (now - state.circuit.lastFailureAt >= config.cooldownMs) {
      console.log(`🔄 [GATE] Circuit ${key} half-open: cooldown passed, allowing next attempt`);
      state.circuit.isOpen = false;
      state.circuit.failures = 0;
    }
  }
  
  return state.circuit.isOpen;
}

async function acquire(key: string): Promise<{ acquired: boolean; reason?: string; retryAfterSeconds?: number }> {
  const state = getOrCreateGateState(key);
  const config = getConfig(key);
  
  if (isCircuitOpen(key)) {
    const timeUntilCooldown = Math.ceil((config.cooldownMs - (Date.now() - state.circuit.lastFailureAt)) / 1000);
    return { 
      acquired: false, 
      reason: 'CIRCUIT_OPEN', 
      retryAfterSeconds: Math.max(3, Math.min(8, timeUntilCooldown))
    };
  }
  
  if (state.active < config.maxConcurrency) {
    state.active++;
    return { acquired: true };
  }
  
  const jitter = Math.floor(Math.random() * 150);
  const timeout = config.maxWaitMs + jitter;
  
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      const index = state.waiting.findIndex(w => w.resolve === resolveAcquire);
      if (index !== -1) {
        state.waiting.splice(index, 1);
      }
      resolve({ 
        acquired: false, 
        reason: 'QUEUE_TIMEOUT', 
        retryAfterSeconds: Math.floor(3 + Math.random() * 5)
      });
    }, timeout);
    
    const resolveAcquire = () => {
      clearTimeout(timeoutId);
      state.active++;
      resolve({ acquired: true });
    };
    
    state.waiting.push({ 
      resolve: resolveAcquire, 
      acquiredAt: Date.now() 
    });
  });
}

function release(key: string, ok: boolean = true): void {
  const state = getOrCreateGateState(key);
  const config = getConfig(key);
  
  if (state.active > 0) {
    state.active--;
  }
  
  if (!ok) {
    state.circuit.failures++;
    state.circuit.lastFailureAt = Date.now();
    
    if (state.circuit.failures >= config.failThreshold) {
      state.circuit.isOpen = true;
      console.warn(`⚠️ [GATE] Circuit ${key} OPENED: ${state.circuit.failures} failures >= ${config.failThreshold} threshold`);
    }
  } else {
    if (state.circuit.failures > 0) {
      state.circuit.failures = Math.max(0, state.circuit.failures - 1);
    }
  }
  
  while (state.waiting.length > 0 && state.active < config.maxConcurrency) {
    const waiter = state.waiting.shift();
    if (waiter) {
      waiter.resolve();
    }
  }
}

// ========== END INLINED: ProviderGate ==========

// ========== BUSINESS LOGIC: Template Generation ==========

// Lazy load RunwareErrorHandler
let RunwareErrorHandler: any = null;
let runwareErrorHandlerLoadAttempted = false;

async function getRunwareErrorHandler() {
  if (!runwareErrorHandlerLoadAttempted) {
    runwareErrorHandlerLoadAttempted = true;
    try {
      const module = await import("../_shared/runwareErrorHandler.ts");
      RunwareErrorHandler = module.RunwareErrorHandler;
      console.log("✅ RunwareErrorHandler loaded successfully");
    } catch (err: any) {
      console.warn("⚠️ RunwareErrorHandler unavailable (non-critical):", err.message);
      RunwareErrorHandler = null;
    }
  }
  return RunwareErrorHandler;
}

// Inline cultural detection
function inlineDetectCultural(userInfo: any, avatarIdentity: any) {
  const culturalProfile = {
    nativeLanguage: userInfo?.nativeLanguage || 'en',
    skinTone: userInfo?.avatar?.skinTone || avatarIdentity?.skinTone || 'light',
    includes: function(term: string) {
      return this.nativeLanguage === term || this.skinTone === term;
    }
  };
  
  if (culturalProfile.nativeLanguage !== 'en' || 
      ['dark', 'medium-dark', 'brown'].includes(culturalProfile.skinTone)) {
    return 'african-american';
  }
  return 'general';
}

function generateInlineNuclearNegative(culturalProfile: string, avatarType: string, difficulty: string) {
  const base = 'NO TEXT, no words, no letters, no writing, no captions, no watermarks, no signatures, no logos, bad anatomy, deformed, blurry, low quality, distorted face, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley';
  
  const boysNegative = 'NO feminine features, makeup, female anatomy, girl clothing, long feminine hairstyles, feminine accessories, narrow shoulders, feminine body structure, female proportions, feminine expressions, girl toys, female-coded activities exclusively';
  const girlsNegative = 'NO masculine features, facial hair, male anatomy, boy clothing, short masculine haircuts, broad shoulders, angular jaw, masculine body structure, male proportions, masculine expressions, boy toys, male-coded activities exclusively';
  const genderNeutralNegative = 'NO overly gendered features, extreme masculine traits, extreme feminine traits, gender-specific clothing, highly gendered toys, overly masculine expressions, overly feminine expressions, binary gender stereotypes, gendered color schemes exclusively';
  
  const africanAmericanNegativeBlock = 'skin lightening, whitewashing, pale skin, light skin, caucasian features, european features, fair complexion, light complexion, white skin tone, bleached skin, lightened skin, washed out skin, faded skin tone, stereotypes, caricature, exaggerated features, cultural appropriation, offensive stereotypes, racial caricature, minstrel imagery, tokenism, straight hair texture, caucasian hair, european hair texture, fine hair texture, silky straight hair, pin straight hair, unnaturally straight hair, narrow nose, thin lips, small features, delicate bone structure, european bone structure, caucasian facial structure, non-African features';
  
  const culturalSensitivityNegativeBlock = 'cultural stereotypes, racial stereotypes, ethnic stereotypes, cultural caricature, offensive imagery, discriminatory content, prejudicial representation, cultural mockery, insensitive portrayal, appropriative elements, tokenistic representation, oversimplified culture, cultural reduction';
  
  const blendingNegative = 'character merged with background, character blending into environment, character same color as background, character hidden by environment, character embedded in scenery, character camouflaged, character invisible, character and environment same texture, character not distinct from surroundings';

  let negativeComponents = [base];
  
  if (avatarType && avatarType.includes('boy')) {
    negativeComponents.push(boysNegative);
  } else if (avatarType && avatarType.includes('girl')) {
    negativeComponents.push(girlsNegative);
  } else {
    negativeComponents.push(genderNeutralNegative);
  }
  
  if (culturalProfile === 'african-american') {
    negativeComponents.push(africanAmericanNegativeBlock);
  }
  
  if (difficulty === 'beginner' || difficulty === 'easy') {
    negativeComponents.push(blendingNegative);
  }
  
  negativeComponents.push(culturalSensitivityNegativeBlock);
  
  return negativeComponents.join(', ');
}

const NUCLEAR_HARDCODED_STYLE_FRAMEWORKS: Record<string, any> = {
  'beginner': {
    name: 'Contemporary Children\'s Book Illustration',
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, warm natural lighting, character clearly separated from environment, character remains distinct and visible, no character-background blending, character as focal subject'
  },
  'easy': {
    name: 'Contemporary Children\'s Book Illustration', 
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, warm natural lighting, character clearly separated from environment, character remains distinct and visible, no character-background blending, character as focal subject'
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

function getNuclearStyleFramework(difficulty: string) {
  const normalizedDifficulty = difficulty?.toLowerCase() || 'medium';
  return NUCLEAR_HARDCODED_STYLE_FRAMEWORKS[normalizedDifficulty] || NUCLEAR_HARDCODED_STYLE_FRAMEWORKS['medium'];
}

function getComplexityLevel(userInfo: any, templateComplexity: string) {
  if (templateComplexity === 'C' || templateComplexity === 'D') {
    console.log(`🎯 Using orchestrator templateComplexity: ${templateComplexity}`);
    return templateComplexity;
  }
  
  if (!userInfo || (!userInfo.difficulty && !userInfo.difficultyLevel)) {
    return 'D';
  }
  
  return 'C';
}

function getSimpleHairColor(skinTone: string, nativeLanguage = 'en') {
  if (skinTone === 'dark' && ['en', 'fr', 'es', 'pt'].includes(nativeLanguage)) {
    return '';
  }
  
  switch (skinTone) {
    case 'pale': return 'red hair';
    case 'light': return 'blonde hair';
    case 'medium': return 'brown hair';
    case 'olive': return 'dark black hair';
    case 'dark': return 'thick textured 4C hair';
    default: return 'brown hair';
  }
}

function generateTier25C(storyText: string, userInfo: any, avatarIdentity: any, failedTierData: any = {}, primaryScene: string | null = null) {
  console.log(`🚀 Nuclear Tier 2.5C: Pure hardcoded template [logging: ${TIER_LOGGING_VERSION}]`);
  
  // PRIMARY PATH: Direct Mode Simple
  if (primaryScene && typeof primaryScene === 'string' && primaryScene.length >= 30) {
    console.log('✅ [DIRECT_MODE_SIMPLE] Using top-level primaryScene with brand suffix only');
    
    const difficulty = userInfo?.difficulty || userInfo?.difficultyLevel || 'medium';
    const hardcodedFramework = getNuclearStyleFramework(difficulty);
    const culturalProfileType = inlineDetectCultural(userInfo, avatarIdentity);
    const avatarType = userInfo?.avatar?.type || 'child';
    
    const positivePrompt = `scene: ${primaryScene}.\n\nbrand suffix: ${hardcodedFramework.frameworkPrompt}`;
    const negativePrompt = generateInlineNuclearNegative(culturalProfileType, avatarType, difficulty);
    
    return {
      positivePrompt,
      negativePrompt,
      templateType: 'Direct Mode Simple',
      tier: 'DIRECT_MODE_SIMPLE',
      styleFrameworkUsed: hardcodedFramework.name,
      directModeUsed: true
    };
  }
  
  // FALLBACK PATH: Direct Mode CCS
  if (failedTierData?.enhancedSceneData && failedTierData?.characterConsistency) {
    console.log('✅ [DIRECT_MODE_CCS] No primaryScene - falling back to CCS data');
    
    const sceneLength = failedTierData.enhancedSceneData.length;
    const charLength = failedTierData.characterConsistency.length;
    
    if (sceneLength >= 50 && charLength >= 30) {
      const difficulty = userInfo?.difficulty || 'medium';
      const hardcodedFramework = getNuclearStyleFramework(difficulty);
      
      const positivePrompt = `scene: ${failedTierData.enhancedSceneData}.${failedTierData.coloredObjects ? `\n\ncolored objects: ${failedTierData.coloredObjects}.` : ''}${failedTierData.sceneContext ? `\n\nlocation context: ${failedTierData.sceneContext}.` : ''}\n\ncharacter: ${failedTierData.characterConsistency}.\n\nbrand suffix: ${hardcodedFramework.frameworkPrompt}`;
      
      const culturalProfileType = inlineDetectCultural(userInfo, avatarIdentity);
      const avatarType = userInfo?.avatar?.type || 'child';
      const negativePrompt = generateInlineNuclearNegative(culturalProfileType, avatarType, difficulty);
      
      console.log('✅ [DIRECT_MODE_CCS] Clean separation complete');
      
      return {
        positivePrompt,
        negativePrompt,
        templateType: 'Direct Mode CCS Fallback',
        tier: 'NUCLEAR_2.5C_DIRECT_CCS',
        styleFrameworkUsed: hardcodedFramework.name,
        directModeUsed: true,
        sceneSource: 'ai_visual_scene_creator',
        characterSource: 'character_consistency_service'
      };
    }
  }
  
  // SAFETY NET: Original logic
  console.log('📋 [SAFETY_NET] Using original Tier 2.5C logic');
  
  if (!storyText) {
    console.log('🚨 Nuclear 2.5C: No storyText - triggering Tier 2.5D');
    return generateTier25D(storyText, userInfo, avatarIdentity, failedTierData);
  }
  
  const sceneText = (failedTierData.enhancedSceneData || storyText).substring(0, 1000);
  const characterName = userInfo?.name || userInfo?.childName || 'child';
  const age = userInfo?.age || 8;
  const skinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || 'medium';
  const avatarType = userInfo?.avatar?.type || 'child';
  const nativeLanguage = userInfo?.nativeLanguage || userInfo?.language || 'en';
  
  let mappedAvatarType = avatarType;
  let genderNeutralDescription = '';
  
  if (avatarType === 'prefer-not-to-answer') {
    mappedAvatarType = 'child';
    genderNeutralDescription = ' gender neutral child with no visible male nor female characteristics';
  }
  
  const hasStructuredData = failedTierData?.structuredAvatarData?.skinTone && failedTierData?.structuredAvatarData?.hairColor;
  const effectiveSkinTone = hasStructuredData ? failedTierData.structuredAvatarData.skinTone : skinTone;
  const effectiveHairColor = hasStructuredData ? failedTierData.structuredAvatarData.hairColor : getSimpleHairColor(skinTone, nativeLanguage);
  
  const difficulty = userInfo?.difficulty || 'medium';
  const antiMergePrefix = (difficulty === 'beginner' || difficulty === 'easy') 
    ? 'Main character clearly visible as distinct character separate from environment. ' 
    : '';
  const cheerfulDirective = (difficulty === 'beginner' || difficulty === 'easy')
    ? ' with cheerful expression, positioned in clear foreground, fully visible, engaging with viewer'
    : '';
  
  const activeSkinTone = failedTierData?.structuredAvatarData?.skinTone || skinTone;
  const isDarkSkinSupportedLang = (activeSkinTone.includes('dark') || activeSkinTone.includes('brown')) && ['en', 'fr', 'es', 'pt'].includes(nativeLanguage);
  
  let characterDesc: string;
  if (isDarkSkinSupportedLang) {
    if (genderNeutralDescription) {
      characterDesc = `${antiMergePrefix}A ${genderNeutralDescription} named ${characterName} age ${age}${cheerfulDirective} with authentic African American features and naturally occurring melanin-rich skin tones ranging from warm beige to warm caramel to deep ebony with appropriate warm undertones, realistic hazel-green, brown and dark brown eyes with natural depth and authentic iris patterns, genuine African American facial bone structure with appropriate nose width and lip fullness, authentic textured hair ranging from 3B to 4C curl patterns including DETAILED AND PHOTOREALISTIC natural afros, box braids, cornrows, twist-outs, or protective styles with proper hair density and realistic coil definition, accurate representation of Black features without European beauty standard alterations, natural skin luminosity with warm golden or red undertones, detailed individual hair strand texture showing authentic curl patterns and natural shine`;
    } else {
      characterDesc = `${antiMergePrefix}A young ${mappedAvatarType} named ${characterName} age ${age}${cheerfulDirective} with authentic African American features and naturally occurring melanin-rich skin tones ranging from warm beige to warm caramel to deep ebony with appropriate warm undertones, realistic hazel-green, brown and dark brown eyes with natural depth and authentic iris patterns, genuine African American facial bone structure with appropriate nose width and lip fullness, authentic textured hair ranging from 3B to 4C curl patterns including DETAILED AND PHOTOREALISTIC natural afros, box braids, cornrows, twist-outs, or protective styles with proper hair density and realistic coil definition, accurate representation of Black features without European beauty standard alterations, natural skin luminosity with warm golden or red undertones, detailed individual hair strand texture showing authentic curl patterns and natural shine`;
    }
  } else {
    if (genderNeutralDescription) {
      characterDesc = `${antiMergePrefix}A ${genderNeutralDescription} named ${characterName} age ${age} ${effectiveSkinTone} skin complexion with ${effectiveHairColor}${cheerfulDirective}`;
    } else {
      characterDesc = `${antiMergePrefix}A young ${mappedAvatarType} named ${characterName} age ${age} ${effectiveSkinTone} skin complexion with ${effectiveHairColor}${cheerfulDirective}`;
    }
  }
  
  const hardcodedFramework = getNuclearStyleFramework(difficulty);
  const positivePrompt = `scene: ${sceneText}.\n\ncharacter description: ${characterDesc}.\n\nbrand suffix: ${hardcodedFramework.frameworkPrompt}`;
  
  const culturalProfileType = inlineDetectCultural(userInfo, avatarIdentity);
  const negativePrompt = generateInlineNuclearNegative(culturalProfileType, avatarType, difficulty);
  
  console.log('✅ Nuclear 2.5C: Template generated');
  
  return {
    positivePrompt,
    negativePrompt,
    templateType: 'Nuclear Hardcoded Template - Zero Dependencies',
    tier: 'NUCLEAR_2.5C',
    styleFrameworkUsed: hardcodedFramework.name,
    failedTierDataUsed: !!(failedTierData.enhancedSceneData || failedTierData.characterConsistency)
  };
}

function generateTier25D(storyText: any, userInfo: any, avatarIdentity: any, failedTierData: any) {
  console.log('🎯 Tier 2.5D: Generating Ultimate Emergency Fallback');
  
  const styleFramework = getNuclearStyleFramework('medium');
  
  const positivePrompt = `Diverse group of delighted children from different backgrounds having an absolute blast together: one child with beautiful Mediterranean olive-toned skin and flowing dark wavy hair with bright hazel eyes, one African American child with gorgeous natural 4C coily hair texture and rich deep brown complexion with expressive warm brown eyes, one child with fair peachy skin tone and sandy brown curls with bright blue eyes, one Indian child with warm golden-brown skin and sleek black hair with deep amber eyes, all engaged in spontaneous joyful activities - playing in the park, eating pizza and laughing, maybe building the most elaborate blanket fort ever, having an epic dance party in pajamas, creating colorful chalk masterpieces on sidewalks, racing paper airplanes, blowing enormous soap bubbles that shimmer like rainbows, or staging a hilarious puppet show with mismatched socks, pure childhood magic and unbridled fun, authentic expressions of wonder and delight, one child prominently holding up a handmade colorful sign that clearly reads "SORRY, IMAGES BEING WEIRD RIGHT NOW!" with cheerful decorative text, bright natural lighting, warm joyful atmosphere, authentic diverse representation, Contemporary children's book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality`;
  
  let negativePrompt: string;
  try {
    const culturalProfileType = inlineDetectCultural({nativeLanguage: 'en'}, {skinTone: 'diverse'});
    negativePrompt = generateInlineNuclearNegative(culturalProfileType, 'child', 'medium');
  } catch (error: any) {
    console.warn('⚠️ Tier 2.5D: Failed to generate nuclear negative prompt:', error.message);
    negativePrompt = 'blurry, low quality, dark, scary, violent, inappropriate, adult content';
  }
  
  return {
    positivePrompt,
    negativePrompt,
    templateType: 'Ultimate Emergency Fallback Template',
    tier: '2.5D',
    styleFrameworkUsed: styleFramework.name,
    emergencyMode: true
  };
}

async function callRunwareAPI(positivePrompt: string, negativePrompt: string, seed: number | null = null, retries = 2) {
  const apiKey = Deno.env.get('RUNWARE_API_KEY');
  if (!apiKey) {
    throw new Error('RUNWARE_API_KEY not configured');
  }

  console.log('🌐 Calling Runware API...');
  
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    
    try {
      const response = await fetch('https://api.runware.ai/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify([
          {
            taskType: "authentication",
            apiKey: apiKey.trim()
          },
          {
            taskType: "imageInference",
            taskUUID: crypto.randomUUID(),
            positivePrompt: positivePrompt,
            negativePrompt: negativePrompt,
            width: 1024,
            height: 1024,
            model: "runware:100@1",
            numberResults: 1,
            outputFormat: "WEBP",
            steps: 25,
            CFGScale: 8,
            ...(seed !== null && seed !== undefined ? { seed } : {})
          }
        ])
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const imageData = result.data?.find((item: any) => item.taskType === 'imageInference');

      if (!imageData?.imageURL) {
        throw new Error('No image URL in API response');
      }

      console.log('✅ Runware API call successful');
      
      // Track cost
      try {
        const cost = 0.0013;
        let supabaseClient: any = null;
        
        try {
          console.log('🔍 [VENDOR_FIRST] Using createVendorFirstSupabaseClient');
          const { createVendorFirstSupabaseClient } = await import('../_shared/resilientLoader.ts');
          supabaseClient = await createVendorFirstSupabaseClient();
        } catch (cdnError) {
          console.warn('⚠️ CDN import failed, using local vendor fallback');
          const { createClient } = await import('../_vendor/supabase-js@2.57.4.bundle.mjs'); // CRITICAL: Correct filename for template vendor bundle
          supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
          );
        }

        await supabaseClient.from('cost_tracking').insert({
          session_id: 'runware-session',
          user_id: null,
          input_tokens: 0,
          output_tokens: 0,
          cost: cost,
          model_used: 'runware:100@1',
          operation_type: 'image_generation',
          provider: 'runware',
          api_endpoint: 'v1/imageInference',
          pricing_model: 'images',
          quantity_used: 1,
          unit_cost: cost
        });

        console.log(`💰 Cost tracked: $${cost}`);
      } catch (error) {
        console.warn('Failed to track cost:', error);
      }
      
      return {
        imageURL: imageData.imageURL,
        seed: imageData.seed,
        cost: 0.0013
      };

    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error(`❌ Timeout (attempt ${attempt}/${retries + 1})`);
        if (attempt <= retries) {
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          continue;
        }
        throw new Error('Runware API timeout after all retries');
      }
      
      console.error(`❌ Attempt ${attempt}/${retries + 1} failed:`, error);
      
      if (attempt <= retries) {
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        continue;
      }
      
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

async function handleRequest(req: Request) {
  // OPTIONS fast path
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
        'Access-Control-Max-Age': '600',
        'Content-Length': '0'
      }
    });
  }

  // GET/HEAD safety
  if (req.method === 'GET' || req.method === 'HEAD') {
    const isHeadHealth = req.method === 'HEAD' && new URL(req.url).pathname === '/health';
    if (isHeadHealth) {
      return new Response(null, { 
        status: 200, 
        headers: { 
          'Access-Control-Allow-Origin': '*', 
          'Cache-Control': 'no-store', 
          'x-health': 'true', 
          'Content-Length': '0' 
        } 
      });
    }
    return new Response(JSON.stringify({
      status: 'healthy',
      service: 'runware-template-cd',
      timestamp: new Date().toISOString(),
      architecture: 'single-file-typescript'
    }), { 
      status: 200, 
      headers: { 
        'Access-Control-Allow-Origin': '*', 
        'Content-Type': 'application/json' 
      } 
    });
  }

  // Request parsing (no outer try - flat architecture)
  let payload = await req.json();
  console.log('🔍 Template CD: Request payload keys:', Object.keys(payload));
    
    // Convert test probe payloads to production format
    if (payload.test === true) {
      console.log('🔍 Runtime probe detected - converting to production payload format');
      payload = {
        pageText: 'Health check story text',
        storyText: 'Health check story text',
        primaryScene: 'A friendly scene for testing',
        userInfo: {
          name: 'Test User',
          age: 8,
          grade: '2nd',
          avatar: {
            type: 'child',
            skinTone: 'light'
          }
        },
        sessionId: 'health-check-session',
        pageNumber: 1,
        templateComplexity: 'C',
        seed: null,
        isGuestUser: false,
        difficultyLevel: 'medium'
      };
      console.log('✅ Converted test payload to production format');
    }
    
    // Detect emergency mode
    const isEmergencyMode = payload.emergencyMode === true || payload.templateComplexity === 'D';
    
    if (isEmergencyMode) {
      console.log(`🚨 [Template CD] Emergency mode detected (complexity: ${payload.templateComplexity}) - using minimal validation`);
      
      // Synthesize fallback content if missing
      if (!payload.pageText && !payload.storyText && !payload.primaryScene) {
        console.warn('⚠️ [Template CD] No story content provided - synthesizing emergency fallback');
        payload.primaryScene = 'A magical storybook scene with vibrant colors and friendly characters';
        payload.pageText = 'Once upon a time in a magical land...';
        payload.storyText = payload.pageText;
      }
      
      if (!payload.userInfo || !payload.userInfo.name) {
        console.warn('⚠️ [Template CD] No userInfo provided - using emergency defaults');
        payload.userInfo = {
          ...payload.userInfo,
          name: payload.userInfo?.name || 'Friend',
          age: payload.userInfo?.age || 7,
          interests: payload.userInfo?.interests || ['adventure', 'magic']
        };
      }
      
      console.log(`✅ [Template CD] Emergency mode payload prepared`, {
        hasContent: !!(payload.pageText || payload.storyText || payload.primaryScene),
        hasUserInfo: !!payload.userInfo?.name,
        synthesizedContent: !payload.pageText && !payload.storyText && !payload.primaryScene
      });
    }
    
    let enhancedStoryData: any, storyText: string, pageNumber: number, avatarIdentity: any, templateComplexity: string, failedTierData: any, sessionId: string, seed: number | null;
    
    // Handle bundle-structured payloads
    if (payload.bundle && payload.config) {
      console.log('📦 Template CD: Detected bundle format');
      const bundle = payload.bundle;
      storyText = bundle.pageText || bundle.storyText || payload.pageText || payload.storyText;
      enhancedStoryData = { userInfo: bundle.userInfo || payload.userInfo };
      pageNumber = bundle.pageNumber || payload.pageNumber || 1;
      avatarIdentity = bundle.userInfo?.avatar || payload.userInfo?.avatar;
      templateComplexity = payload.config?.templateComplexity || payload.templateComplexity || 'C';
      sessionId = bundle.sessionId || payload.sessionId;
      failedTierData = bundle.failedTierData || payload.failedTierData;
      seed = bundle.seed || payload.seed;
    } else if (payload.pageText || payload.storyText) {
      console.log('📄 Template CD: Direct pageText/storyText format');
      storyText = payload.pageText || payload.storyText;
      enhancedStoryData = { userInfo: payload.userInfo };
      pageNumber = payload.pageNumber || 1;
      avatarIdentity = payload.userInfo?.avatar;
      templateComplexity = payload.templateComplexity || 'C';
      sessionId = payload.sessionId;
      failedTierData = payload.failedTierData;
      seed = payload.seed;
    } else if (payload.enhancedStoryData?.storyText) {
      console.log('📦 Template CD: Nested enhancedStoryData format');
      enhancedStoryData = payload.enhancedStoryData;
      storyText = payload.enhancedStoryData.storyText || payload.enhancedStoryData.pageText;
      pageNumber = payload.pageNumber || payload.enhancedStoryData.pageNumber || 1;
      avatarIdentity = payload.enhancedStoryData.userInfo?.avatar || payload.avatarIdentity;
      templateComplexity = payload.templateComplexity || 'C';
      sessionId = payload.sessionId || payload.enhancedStoryData.sessionId;
      failedTierData = payload.failedTierData;
      seed = payload.seed;
    } else if (payload.primaryScene && payload.directMode) {
      console.log('🎯 Template CD: Direct Mode Simple format (primaryScene-only)');
      storyText = payload.primaryScene; // Use primaryScene as the story content
      enhancedStoryData = { userInfo: payload.userInfo || {} };
      pageNumber = payload.pageNumber || 1;
      avatarIdentity = payload.userInfo?.avatar;
      templateComplexity = 'C'; // Direct Mode always uses 2.5C
      sessionId = payload.sessionId;
      failedTierData = payload.failedTierData;
      seed = payload.seed;
    } else {
      console.log('📚 Template CD: Enhanced legacy format');
      enhancedStoryData = payload.enhancedStoryData;
      storyText = payload.storyText || payload.pageText;
      pageNumber = payload.pageNumber || 1;
      avatarIdentity = payload.avatarIdentity;
      templateComplexity = payload.templateComplexity || 'C';
      sessionId = payload.sessionId;
      failedTierData = payload.failedTierData;
      seed = payload.seed;
    }
  
    // Allow primaryScene-only payloads (Direct Mode Simple 2.5C)
    const hasPrimaryScene = typeof payload.primaryScene === 'string' && payload.primaryScene.trim().length > 0;
    if (!storyText && !hasPrimaryScene) {
      console.warn(`⚠️ Missing storyText AND primaryScene - forcing Emergency Mode D`);
      templateComplexity = 'D';
    }

    console.log(`🎯 Template CD processing complexity: ${templateComplexity || 'auto'}`);

    const userInfo = enhancedStoryData.userInfo || {};
    const complexityLevel = getComplexityLevel(userInfo, templateComplexity);
    console.log(`✅ Using complexity level: ${complexityLevel}`);
    
    // Universal LKG Protection - Phase 1: Bulletproof Reliability
    const requestHash = UniversalLKGCache.createRequestHash(payload);
    console.log(`🔐 [UNIVERSAL_LKG] Template CD request hash: ${requestHash}`);
    let templateResult: any;
    
    // Template generation (flat architecture - errors propagate to server try/catch)
    if (complexityLevel === 'C') {
        console.log('🚀 Processing Tier 2.5C: Nuclear hardcoded template');
        templateResult = generateTier25C(storyText, userInfo, avatarIdentity, failedTierData || {}, payload.primaryScene || null);
      } else {
        console.log('🚀 Processing Tier 2.5D: Ultimate emergency fallback');
        templateResult = generateTier25D(storyText, userInfo, avatarIdentity, failedTierData || {});
      }

      console.log('🎨 Template CD: Generating image with Runware API + Request Deduplication + Circuit Breaker');
      
      // Create deduplication key for Runware API call
      const dedupeKey = RequestDeduplicator.createKey({
        functionName: 'runware-template-cd',
        sessionId,
        pageNumber,
        prompt: templateResult.positivePrompt.substring(0, 100)
      });
      
      // Execute with circuit breaker protection + deduplication
      const imageGenResult = await EnhancedCircuitBreaker.execute(
        'runware-template-cd',
        () => RequestDeduplicator.deduplicate(
          dedupeKey,
          () => callRunwareAPI(templateResult.positivePrompt, templateResult.negativePrompt, seed),
          20000 // 20s timeout for Runware
        ),
        {
          onCircuitOpen: () => {
            console.warn('⚠️ [CIRCUIT] Runware circuit open, checking LKG');
            const lkg = UniversalLKGCache.getLKG(requestHash, 'runware-template-cd');
            if (lkg) {
              return lkg;
            }
            throw new Error('Circuit breaker open and no LKG available');
          }
        }
      );
      
      const result = {
        success: true,
        imageURL: typeof imageGenResult === 'string' ? imageGenResult : imageGenResult?.imageURL,
        seed: typeof imageGenResult === 'object' ? (imageGenResult?.seed || null) : null,
        templateData: templateResult,
        complexity: complexityLevel,
        sessionArchitecture: 'parameter-based',
        processedAt: new Date().toISOString(),
        positivePrompt: templateResult.positivePrompt,
        negativePrompt: templateResult.negativePrompt,
        imageGeneration: {
          cost: typeof imageGenResult === 'object' ? (imageGenResult?.cost || 0.0013) : 0.0013
        }
      };
      
      console.log('✅ Template CD: Result prepared', { 
        hasImageURL: !!result.imageURL
      });
      
      // Warm LKG cache on success
      if (result.imageURL) {
        UniversalLKGCache.warmFromSuccess(requestHash, result, 'TIER_2.5CD', 'runware-template-cd');
      }

    // Log to database
    try {
      let supabase: any = null;
      
      try {
        console.log('🔍 [VENDOR_FIRST] Using createVendorFirstSupabaseClient for logging');
        const { createVendorFirstSupabaseClient } = await import('../_shared/resilientLoader.ts');
        supabase = await createVendorFirstSupabaseClient();
      } catch (loaderError) {
        console.warn('⚠️ Loader failed, using fallback');
        const { createClient } = await import('../_vendor/supabase-js@2.57.4.bundle.mjs'); // CRITICAL: Correct filename for logging vendor bundle
        supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
      }
      
      // ✅ NUCLEAR FIX: Defensive tierLogging wrapper (never crashes template generation)
      try {
        const tierLoggingModule = await import("../_shared/tierLogging.js");
        if (tierLoggingModule?.logTierAttempt && typeof tierLoggingModule.logTierAttempt === 'function') {
          await tierLoggingModule.logTierAttempt(
            supabase,
            sessionId,
            'template-cd-req',
            templateResult.tier || 'template-cd',
            'success',
            {
              positivePrompt: templateResult.positivePrompt,
              negativePrompt: templateResult.negativePrompt,
              edgeFunction: 'runware-template-cd',
              pageNumber: pageNumber || 1,
              imageUrl: result.imageURL
            }
          );
        } else {
          console.warn('⚠️ [TEMPLATE-CD] tierLogging unavailable - skipping DB log (non-fatal)');
        }
      } catch (loggingError: any) {
        console.warn('⚠️ [TEMPLATE-CD] tierLogging failed (non-fatal):', loggingError.message);
        // Continue execution - logging failure never crashes template generation
      }
    } catch (loggingError: any) {
      console.warn('Failed to log success:', loggingError.message);
    }

    return result;
} // end: handleRequest

// ========== MAIN SERVER ==========
serve(async (req) => {
  try {
    const url = new URL(req.url);

    // OPTIONS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: generateEchoCorsHeaders(req) });
    }

    // HEAD /health
    if (req.method === "HEAD" && url.pathname === "/health") {
      return new Response(null, { 
        status: 200, 
        headers: { 
          ...generateEchoCorsHeaders(req),
          "Cache-Control": "no-store", 
          "x-health": "true", 
          "Content-Length": "0" 
        } 
      });
    }

    // Any GET
    if (req.method === "GET") {
      const payload = {
        status: "healthy",
        service: SERVICE_NAME,
        tier: "2.5C/2.5D",
        timestamp: new Date().toISOString(),
        deployment_version: "2025-01-10-single-file-ts",
        architecture: "single-file-typescript",
        capabilities: ["advanced_consistency", "detailed_tracking", "premium_enhancement"]
      };
      return new Response(JSON.stringify(payload), { 
        status: 200, 
        headers: { 
          ...generateEchoCorsHeaders(req),
          "Content-Type": "application/json" 
        } 
      });
    }

    // Any other HEAD
    if (req.method === "HEAD") {
      return new Response(null, { 
        status: 200, 
        headers: { 
          ...generateEchoCorsHeaders(req),
          "Cache-Control": "no-store", 
          "Content-Length": "0" 
        } 
      });
    }

    // POST - main handler
    if (req.method === "POST") {
      const gatingEnabled = Deno.env.get('DISABLE_PROVIDER_GATE') !== 'true';
      let gateAcquired = false;
      
      if (gatingEnabled) {
        const gateResult = await acquire('DM:runware-template-cd');
        if (gateResult.acquired) {
          console.log(`✅ [GATE] DM:runware-template-cd acquired`);
          gateAcquired = true;
        } else {
          console.warn(`⚠️ [GATE] Failed: ${gateResult.reason} - returning 503 HEALTHY_ESCALATION`);
          return new Response(JSON.stringify({
            success: false,
            error: 'PROVIDER_GATE_UNAVAILABLE',
            escalation: 'TIER_2.5D',
            message: 'Template CD provider gate unavailable - escalate to Emergency Mode',
            retryable: true
          }), {
          status: 503,
          headers: { 
            ...generateEchoCorsHeaders(req), 
            'Content-Type': 'application/json',
            'Retry-After': String(gateResult.retryAfterSeconds ?? 5)
          }
          });
        }
      }
      
      try {
        const result = await handleRequest(req);
        
        if (gatingEnabled && gateAcquired) {
          const success = result && (result as any).success !== false;
          release('DM:runware-template-cd', success);
        }
        
        return corsResponse(result, req);
      } catch (handlerError: any) {
        if (gatingEnabled && gateAcquired) {
          release('DM:runware-template-cd', false);
        }
        throw handlerError;
      }
    }

    // Method not allowed
    return new Response(JSON.stringify({ 
      error: "Method not allowed", 
      allowed: ["GET", "HEAD", "POST", "OPTIONS"] 
    }), { 
      status: 405, 
      headers: { 
        ...generateEchoCorsHeaders(req),
        "Content-Type": "application/json" 
      } 
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      error: "Internal error",
      message: err?.message ?? String(err),
      service: SERVICE_NAME,
      timestamp: new Date().toISOString(),
    }), { 
      status: 500, 
      headers: { 
        ...generateEchoCorsHeaders(req),
        "Content-Type": "application/json" 
      } 
    });
  }
});
