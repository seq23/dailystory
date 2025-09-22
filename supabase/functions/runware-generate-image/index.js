// DEPLOY_MARKER: 2025-09-21T00:00:00Z - STATIC IMPORT + DEFENSIVE CORS V4.2
// ============================================================================
// CRASH-PROOF RUNWARE IMAGE ORCHESTRATOR v2.1 (handler)
// ============================================================================

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

// Direct imports for character consistency and visual tracking
import { phaseIntegrationOrchestrator } from '../_shared/PhaseIntegrationOrchestrator.js';
import { characterConsistencyService } from '../_shared/CharacterConsistencyService.js';
import { visualDetailTracker } from '../_shared/VisualDetailTracker.js';
import { CULTURAL_ARRAYS, createSeededRandom } from '../_shared/tier25Vocabulary.js';
import { getCulturalBundle } from '../_shared/StaticDataCache.js';
import * as tierLogging from './tierLogging.js';

// Initialize Supabase client for edge function calls
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// ============= NUCLEAR INDEPENDENCE: COMPLETE STYLE FRAMEWORKS =============
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

function getNuclearStyleFramework(difficulty) {
  const normalizedDifficulty = difficulty?.toLowerCase() || 'medium';
  const framework = NUCLEAR_HARDCODED_STYLE_FRAMEWORKS[normalizedDifficulty] || NUCLEAR_HARDCODED_STYLE_FRAMEWORKS['medium'];
  
  tierLogging.logTier1(`Nuclear Retrieved ${framework.name} style framework for difficulty: ${normalizedDifficulty}`);
  return framework;
}

// ============= NUCLEAR INDEPENDENCE: COMPREHENSIVE NEGATIVE PROMPTS =============
function generateInlineNuclearNegative(culturalProfile, avatarType, difficulty) {
  // NUCLEAR UNIFIED BASE - Word-for-Word as Specified
  const base = 'NO TEXT, no words, no letters, no writing, no captions, no watermarks, no signatures, no logos, bad anatomy, deformed, blurry, low quality, distorted face, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley';
  
  // GENDER-SPECIFIC NEGATIVES - Word-for-Word as Specified  
  const boysNegative = 'NO feminine features, makeup, female anatomy, girl clothing, long feminine hairstyles, feminine accessories, narrow shoulders, feminine body structure, female proportions, feminine expressions, girl toys, female-coded activities exclusively';
  const girlsNegative = 'NO masculine features, facial hair, male anatomy, boy clothing, short masculine haircuts, broad shoulders, angular jaw, masculine body structure, male proportions, masculine expressions, boy toys, male-coded activities exclusively';
  const genderNeutralNegative = 'NO overly gendered features, extreme masculine traits, extreme feminine traits, gender-specific clothing, highly gendered toys, overly masculine expressions, overly feminine expressions, binary gender stereotypes, gendered color schemes exclusively';
  
  // COMPREHENSIVE AFRICAN AMERICAN PROTECTION (Complete 25+ Item List)
  const africanAmericanNegativeBlock = 'skin lightening, whitewashing, pale skin, light skin, caucasian features, european features, fair complexion, light complexion, white skin tone, bleached skin, lightened skin, washed out skin, faded skin tone, stereotypes, caricature, exaggerated features, cultural appropriation, offensive stereotypes, racial caricature, minstrel imagery, tokenism, straight hair texture, caucasian hair, european hair texture, fine hair texture, silky straight hair, pin straight hair, unnaturally straight hair, narrow nose, thin lips, small features, delicate bone structure, european bone structure, caucasian facial structure, non-African features';
  
  // UNIVERSAL CULTURAL SENSITIVITY 
  const culturalSensitivityNegativeBlock = 'cultural stereotypes, racial stereotypes, ethnic stereotypes, cultural caricature, offensive imagery, discriminatory content, prejudicial representation, cultural mockery, insensitive portrayal, appropriative elements, tokenistic representation, oversimplified culture, cultural reduction';
  
  let negativeComponents = [base];
  
  // Apply gender-specific negatives
  if (avatarType && avatarType.includes('boy')) {
    negativeComponents.push(boysNegative);
  } else if (avatarType && avatarType.includes('girl')) {
    negativeComponents.push(girlsNegative);
  } else {
    negativeComponents.push(genderNeutralNegative);
  }
  
  // Apply African American protection
  if (culturalProfile === 'african-american') {
    negativeComponents.push(africanAmericanNegativeBlock);
  }
  
  // Always apply cultural sensitivity
  negativeComponents.push(culturalSensitivityNegativeBlock);
  
  return negativeComponents.join(', ');
}

// ============= ENHANCED ERROR HANDLING =============
class EdgeErrorHandler {
  static handleError(error, functionName, context = {}) {
    const edgeError = {
      type: error.type || 'unknown',
      message: error instanceof Error ? error.message : (error.message || 'Unexpected error'),
      functionName,
      timestamp: Date.now(),
      details: context.details || error.details,
      sessionId: context.sessionId,
      category: this.categorizeError(error, functionName)
    };
    
    tierLogging.logTier1(`${functionName} Error`, edgeError);
    
    return new Response(JSON.stringify({
      error: edgeError.message,
      type: edgeError.type,
      category: edgeError.category,
      requestId: context.requestId,
      timestamp: edgeError.timestamp
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  static categorizeError(error, functionName) {
    const message = error.message || error.toString();
    
    if (message.includes('Runware') || message.includes('WebSocket') || message.includes('api.runware')) {
      return 'RUNWARE_API_FAILURE';
    }
    if (message.includes('PhaseIntegrationOrchestrator') || message.includes('CharacterConsistencyService')) {
      return 'SERVICE_DEPENDENCY_FAILURE';
    }
    if (message.includes('template') || message.includes('generation')) {
      return 'TEMPLATE_GENERATION';
    }
    return 'INTERNAL_ERROR';
  }
}

// ============= BOOT SYSTEM =============
class CrashProofBootSystem {
  static async validateBoot() {
    if (this.bootStatus !== null) return this.bootStatus;
    
    tierLogging.logTier1('Boot validation started');
    
    // Critical services - system cannot start without these
    const critical = {
      supabaseUrl: Deno.env.get('SUPABASE_URL'),
      supabaseKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY'),
      runwareApiKey: Deno.env.get('RUNWARE_API_KEY')?.trim()
    };
    
    // Fail fast if critical services missing
    if (!critical.supabaseUrl || !critical.supabaseKey) {
      this.bootStatus = { status: 'critical_failure', reason: 'missing_supabase_config' };
      return this.bootStatus;
    }
    
    this.bootStatus = { 
      status: 'healthy', 
      timestamp: new Date().toISOString()
    };
    
    tierLogging.logTier1('System validated successfully');
    return this.bootStatus;
  }
  
  static isHealthy() {
    return this.bootStatus?.status === 'healthy';
  }
}

// Initialize static fields
CrashProofBootSystem.bootStatus = null;

// ============= CORE UTILITIES =============
class CoreUtils {
  static generateRequestId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `${timestamp}-${random}`;
  }
  
  static getTrimmedApiKey(keyName) {
    return Deno.env.get(keyName)?.trim();
  }
  
  static async withTimeout(promise, timeoutMs, context = '') {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout ${context} (${timeoutMs}ms)`)), timeoutMs)
      )
    ]);
  }
}

// ============= RUNWARE INTEGRATION =============
async function generateWithRunware(payload, requestId) {
  const runwareApiKey = CoreUtils.getTrimmedApiKey('RUNWARE_API_KEY');
  
  if (!runwareApiKey) {
    tierLogging.logTier1(`❌ [${requestId}] Runware API key missing`);
    return { success: false, error: 'Runware API key not configured' };
  }

  try {
    tierLogging.logTier1(`🎯 [${requestId}] Attempting Runware generation`);
    
    // Extract story text and user info
    const storyText = payload.pageText || payload.storyText || '';
    const userInfo = payload.userInfo || {};
    const pageNumber = payload.pageNumber || 1;
    
    if (!storyText) {
      return { success: false, error: 'No story text provided' };
    }

    // Get cultural profile and style framework
    const culturalProfile = userInfo.culturalBackground || 'american';
    const difficulty = userInfo.readingLevel || 'medium';
    const styleFramework = getNuclearStyleFramework(difficulty);
    
    // Build prompt with character consistency
    let enhancedPrompt = `${styleFramework.frameworkPrompt}. ${storyText}`;
    
    // Add character consistency if available
    try {
      const consistencyResult = await characterConsistencyService.getConsistentCharacterPrompt(
        payload.sessionId, 
        pageNumber,
        storyText,
        userInfo
      );
      
      if (consistencyResult?.success && consistencyResult?.characterPrompt) {
        enhancedPrompt = `${consistencyResult.characterPrompt}. ${enhancedPrompt}`;
        tierLogging.logTier2(`✅ [${requestId}] Character consistency applied`);
      }
    } catch (consistencyError) {
      tierLogging.logTier2(`⚠️ [${requestId}] Character consistency failed: ${consistencyError.message}`);
    }

    // Generate negative prompt
    const avatarType = userInfo.avatarType || 'neutral';
    const negativePrompt = generateInlineNuclearNegative(culturalProfile, avatarType, difficulty);

    // Runware API call
    const runwarePayload = {
      taskType: "imageInference",
      taskUUID: requestId,
      positivePrompt: enhancedPrompt,
      negativePrompt: negativePrompt,
      width: 1024,
      height: 1024,
      model: "runware:100@1",
      numberResults: 1,
      outputFormat: "WEBP",
      CFGScale: 7,
      scheduler: "FlowMatchEulerDiscreteScheduler",
      steps: 20
    };

    const response = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${runwareApiKey}`
      },
      body: JSON.stringify([
        {
          taskType: "authentication",
          apiKey: runwareApiKey
        },
        runwarePayload
      ])
    });

    if (!response.ok) {
      throw new Error(`Runware API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.data && result.data.length > 0) {
      const imageData = result.data.find(item => item.taskType === 'imageInference');
      if (imageData && imageData.imageURL) {
        tierLogging.logTier1(`✅ [${requestId}] Runware generation successful`);
        return {
          success: true,
          imageUrl: imageData.imageURL,
          source: 'runware_tier1',
          metadata: {
            seed: imageData.seed,
            prompt: enhancedPrompt,
            negativePrompt: negativePrompt
          }
        };
      }
    }

    throw new Error('No valid image data in Runware response');

  } catch (error) {
    tierLogging.logTier1(`❌ [${requestId}] Runware generation failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// ============= MAIN HANDLER =============
export default async function handleRequest(req) {
  const requestId = CoreUtils.generateRequestId();
  tierLogging.logTier1(`🎯 [${requestId}] Request started`);
  
  try {
    // Boot validation
    const bootStatus = await CrashProofBootSystem.validateBoot();
    if (bootStatus.status !== 'healthy') {
      return EdgeErrorHandler.handleError(
        new Error(`Boot validation failed: ${bootStatus.reason}`),
        'handleRequest',
        { requestId }
      );
    }

    // Parse request payload
    let payload;
    try {
      payload = await req.json();
    } catch (parseError) {
      return EdgeErrorHandler.handleError(
        new Error('Invalid JSON payload'),
        'handleRequest',
        { requestId }
      );
    }

    tierLogging.logTier1(`📄 [${requestId}] Processing request with payload keys: ${Object.keys(payload)}`);

    // Extract story data
    const storyText = payload.pageText || payload.storyText || payload.text || '';
    const pageNumber = payload.pageNumber || 1;
    
    if (!storyText || storyText.trim().length === 0) {
      return EdgeErrorHandler.handleError(
        new Error('Missing required field: pageText OR storyText'),
        'handleRequest',
        { requestId }
      );
    }

    // Enhanced story data for consistency
    const enhancedStoryData = await phaseIntegrationOrchestrator.enhanceStoryData({
      storyText,
      userInfo: payload.userInfo || {},
      sessionId: payload.sessionId || requestId,
      pageNumber
    });

    // Attempt Tier 1: Runware generation
    tierLogging.logTier1(`🚀 [${requestId}] Starting Tier 1: Runware generation`);
    let result = await generateWithRunware({
      ...payload,
      storyText,
      pageText: storyText,
      userInfo: enhancedStoryData?.userInfo || payload.userInfo || {},
      sessionId: payload.sessionId || requestId,
      pageNumber
    }, requestId);

    // Escalate to Tier 2.5D if Tier 1 fails
    if (!result || !result.success) {
      tierLogging.logTier2(`🚀 [${requestId}] Escalating to Tier 2.5D (runware-template-cd)`);
      
      try {
        const resp = await supabase.functions.invoke("runware-template-cd", {
          body: {
            pageText: storyText,
            userInfo: enhancedStoryData?.userInfo || payload.userInfo || {},
            sessionId: payload.sessionId || requestId,
            pageNumber: pageNumber,
            templateComplexity: "D",
          },
        });
        result = resp.data || { success: false, error: "All tiers failed", escalateToClient: true };
      } catch (escalationError) {
        tierLogging.logTier1(`❌ [${requestId}] Tier 2.5D escalation failed: ${escalationError.message}`);
        result = { success: false, error: "All tiers failed", escalateToClient: true };
      }
    }

    // Track visual details if successful
    if (result?.success && result?.imageUrl) {
      try {
        await visualDetailTracker.trackImageGeneration({
          sessionId: payload.sessionId || requestId,
          pageNumber,
          imageUrl: result.imageUrl,
          source: result.source || 'tier1',
          prompt: result.metadata?.prompt || storyText,
          userInfo: enhancedStoryData?.userInfo || payload.userInfo || {}
        });
      } catch (trackingError) {
        tierLogging.logTier2(`⚠️ [${requestId}] Visual tracking failed: ${trackingError.message}`);
      }
    }

    tierLogging.logTier1(`✅ [${requestId}] Request completed: ${result?.success ? 'SUCCESS' : 'FAILED'}`);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    tierLogging.logTier1(`❌ [${requestId}] Unhandled error: ${error.message}`);
    return EdgeErrorHandler.handleError(error, 'handleRequest', { requestId });
  }
}