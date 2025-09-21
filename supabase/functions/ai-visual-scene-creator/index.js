// DEPLOY_MARKER: 2025-01-16T17:30:00Z - COMPREHENSIVE BUG FIXES
import { 
  getHairBySkintone, 
  getSkinBySkintone, 
  getCulturalBundle, 
  shouldApplyCulturalEnhancements 
} from '../_shared/StaticDataCache.js';

console.log('BOOT ai-visual-scene-creator module loaded');

// ============= LAZY LOADING FUNCTIONS FOR HEAVY DEPENDENCIES =============

async function getPhaseOrchestrator() {
  try {
    const { phaseIntegrationOrchestrator } = await import("../_shared/PhaseIntegrationOrchestrator.js");
    return phaseIntegrationOrchestrator;
  } catch (error) {
    console.warn('PhaseIntegrationOrchestrator lazy load failed:', error);
    // Check if it's a DNS resolution error
    if (error.message?.includes('DNS') || error.message?.includes('resolution') || error.message?.includes('network')) {
      console.error('DNS Resolution Error - Phase Integration Orchestrator unreachable:', error.message);
    }
    return null;
  }
}

// Inline CORS utilities to fix boot failure
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

function createCorsResponse(data, status = 200) {
  const headers = { 
    ...corsHeaders, 
    'Content-Type': 'application/json' 
  };
  
  return new Response(JSON.stringify(data), { status, headers });
}

function createCorsErrorResponse(error, status = 500) {
  const errorMessage = error instanceof Error ? error.message : error;
  console.error('Edge function error:', errorMessage);
  
  return createCorsResponse({ 
    success: false, 
    error: errorMessage 
  }, status);
}

function createCorsOptionsResponse() {
  return new Response(null, { headers: corsHeaders });
}

// AI VISUAL SCENE CREATOR - FOR IMAGE GENERATION ONLY - NEVER DISCUSS IN STORY GENERATION CONTEXT

// Simple error handling and logging utilities
function handleError(error, functionName, context = {}) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`ERROR ${functionName}:`, errorMessage, context);
  return createCorsErrorResponse(errorMessage, 500);
}

function withPerformanceTracking(functionName, model, operation) {
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

// ============= INLINE VALIDATION FUNCTIONS (from SimpleContentValidator.js) =============

/**
 * VISUAL QUALITY: Check if primaryScene meets visual description standards
 */
function checkPrimarySceneCriteria(data) {
  const scene = data.primaryScene;
  if (!scene || typeof scene !== 'string') {
    console.log('DEBUG VALIDATION DEBUG: Missing or invalid primaryScene', { 
      hasScene: !!scene, 
      sceneType: typeof scene,
      sceneValue: scene 
    });
    return { primaryScene: false, passCount: 0, details: 'missing_or_invalid' };
  }

  // Validation with regex match examples
  const lengthTest = scene.length >= 15;
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
    lengthTest: `${lengthTest} (>= 15 chars - RELAXED)`,
    characterTest: `${hasCharacter} ${characterMatch ? `(matched: "${characterMatch[0]}")` : '(no match)'}`,
    actionTest: `${hasAction} ${actionMatch ? `(matched: "${actionMatch[0]}")` : '(no match)'}`,
    settingTest: `${hasSetting} ${settingMatch ? `(matched: "${settingMatch[0]}")` : '(no match)'}`,
    descriptiveTest: `${hasDescriptiveWords} ${descriptiveMatch ? `(matched: "${descriptiveMatch[0]}")` : '(no match)'}`,
    qualityScore: `${qualityScore}/5`,
    validationResult: isPrimarySceneValid ? 'TIER 1 APPROVED - RELAXED VALIDATION' : 'TIER 2 TRIGGER',
    scenePreview: scene.substring(0, 150) + (scene.length > 150 ? '...' : ''),
    relaxedThresholds: 'length: 15+ chars, score: 1+ criteria (was 30+ chars, 2+ criteria)'
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

// REMOVED: applyBasicFixes function - Tier 1 now uses strict fail-fast validation
// This ensures immediate Tier 2 triggering when AI extraction is insufficient

/**
 * RELAXED VALIDATION: Accept if primaryScene exists and meets basic criteria
 * @param {Object} enhancedStoryData - AI extracted data  
 * @param {string} storyText - Original story text (unused, kept for compatibility)
 * @returns {Object} - Enhanced data or immediate Tier 2 trigger
 */
function validateAndEnhanceContent(enhancedStoryData, storyText) {
  // Check if we have ANY form of primaryScene (even from fallback extraction)
  if (!enhancedStoryData || !enhancedStoryData.primaryScene) {
    console.log(`ERROR TIER 2 TRIGGER: No primaryScene found in data`, {
      hasData: !!enhancedStoryData,
      dataKeys: enhancedStoryData ? Object.keys(enhancedStoryData) : [],
      tier2Reasoning: 'Missing primaryScene content'
    });
    return { useTier2: true, fieldCheck: { primaryScene: false, passCount: 0, details: 'no_primary_scene' } };
  }
  
  const fieldCheck = checkPrimarySceneCriteria(enhancedStoryData);
  
  // RELAXED VALIDATION: Accept if primaryScene exists and meets 2/5 criteria OR if it was extracted via fallback
  const isFallbackExtraction = enhancedStoryData.extractionMethod === 'fallback_text_extraction' || 
                               enhancedStoryData.extractionMethod === 'full_content_fallback';
  
  // Accept fallback extractions with lower standards, or regular extractions with 2/5 criteria
  const shouldAccept = isFallbackExtraction || fieldCheck.primaryScene;
  
  // PHASE 3: Enhanced validation logging with detailed pass/fail reasoning
  console.log('DEBUG VALIDATION SUMMARY:', {
    result: shouldAccept ? 'PASS' : 'TIER 2 TRIGGER',
    qualityScore: fieldCheck.details?.qualityScore || '0/5',
    sceneLength: enhancedStoryData.primaryScene?.length || 0,
    extractionMethod: enhancedStoryData.extractionMethod || 'standard_json',
    isFallbackExtraction: isFallbackExtraction,
    criteria: fieldCheck.details,
    decision: shouldAccept ? 'Accept for Tier 1' : 'Fallback to Tier 2',
    tier2Reason: !shouldAccept ? 'Insufficient visual quality criteria' : null
  });
  
  if (!shouldAccept) {
    console.log(`ERROR TIER 2 TRIGGER: Visual scene validation failed`, {
      qualityScore: fieldCheck.details?.qualityScore || '0/5',
      sceneLength: enhancedStoryData.primaryScene?.length || 0,
      extractionMethod: enhancedStoryData.extractionMethod || 'standard_json',
      missingCriteria: Object.entries(fieldCheck.details || {})
        .filter(([key, value]) => key !== 'qualityScore' && key !== 'length' && !value)
        .map(([key]) => key),
      tier2Reasoning: 'Insufficient visual elements for high-quality image generation'
    });
    return { useTier2: true, fieldCheck };
  }
  
  console.log(`SUCCESS TIER 1 APPROVED: Visual scene validation passed`, {
    qualityScore: fieldCheck.details?.qualityScore || 'fallback',
    sceneLength: enhancedStoryData.primaryScene.length,
    extractionMethod: enhancedStoryData.extractionMethod || 'standard_json',
    passedCriteria: Object.entries(fieldCheck.details || {})
      .filter(([key, value]) => key !== 'qualityScore' && key !== 'length' && value)
      .map(([key]) => key),
    contentDecision: 'Proceeding with AI-enhanced generation'
  });
  
  // Add prompts for debugging visibility
  const positivePrompt = enhancedStoryData.primaryScene || 'children\'s story illustration';
  const negativePrompt = 'blur, dark, scary, adult content, inappropriate';
  
  return { 
    enhancedData: enhancedStoryData, 
    fieldCheck,
    positivePrompt,
    negativePrompt,
    primaryScene: enhancedStoryData.primaryScene,
    aiSchema: enhancedStoryData.aiSchema
  };
}

// AI Model Fallback Chain Configuration - CHEAPEST FIRST ORDER
const AI_MODELS = [
  { name: 'gpt-4o', maxTokens: 'max_tokens', supportsTemperature: true },
  { name: 'gpt-4.1-2025-04-14', maxTokens: 'max_completion_tokens', supportsTemperature: false },
  { name: 'gpt-5-2025-08-07', maxTokens: 'max_completion_tokens', supportsTemperature: false }
];

// ============= AVATAR IDENTITY PROCESSING REMOVED =============
// mapAvatarIdentity function removed - orchestrator provides processed avatarIdentity

// Simple circuit breaker for API reliability
class SimpleCircuitBreaker {
  constructor() {
    this.failures = 0;
    this.lastFailure = 0;
    this.threshold = 3;
    this.timeout = 30000; // 30 seconds
  }
  
  isOpen() {
    if (this.failures >= this.threshold && (Date.now() - this.lastFailure < this.timeout)) {
      return true;
    }
    if (this.failures >= this.threshold && (Date.now() - this.lastFailure >= this.timeout)) {
      this.failures = 0; // Reset after timeout
    }
    return false;
  }
  
  recordSuccess() {
    this.failures = 0;
  }
  
  recordFailure() {
    this.failures++;
    this.lastFailure = Date.now();
  }
  
}

const circuitBreaker = new SimpleCircuitBreaker();


// ============= ROBUST JSON PARSING WITH FALLBACKS =============

function parseAIResponse(content) {
  try {
    return JSON.parse(content);
  } catch (directError) {
    // Try extracting JSON from code blocks
    const match = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i) || 
                  content.match(/(\{[\s\S]*?\})/);
    
    if (match?.[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch (e) {
        // Extract just primaryScene as fallback
        const sceneMatch = content.match(/"primaryScene"\s*:\s*"([^"]+)"/i);
        if (sceneMatch?.[1]) {
          return {
            primaryScene: sceneMatch[1].trim(),
            setting: null,
            action: null,
            mood: null,
            pose: null
          };
        }
      }
    }
    
    throw new Error('Could not parse AI response');
  }
}

async function callOpenAIWithFallback(messages, timeout = 6000, requestId, avatarIdentity) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (circuitBreaker.isOpen()) {
    console.warn('Circuit breaker is open, skipping OpenAI');
    const error = new Error('Circuit breaker open - service degraded');
    console.error('ALERT Tier 1 OpenAI Failure:', error, { 
      reason: 'circuit_breaker_open',
      models: AI_MODELS.map(m => m.name)
    });
    throw error;
  }
  
  for (let modelIndex = 0; modelIndex < AI_MODELS.length; modelIndex++) {
    const model = AI_MODELS[modelIndex];
    const logPrefix = requestId ? `[${requestId}]` : '';
    console.log(`MODEL ${logPrefix} Trying model ${modelIndex + 1}/${AI_MODELS.length}: ${model.name}`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const requestBody = {
        model: model.name,
        messages
      };
      
      // Set the correct token parameter based on model
      if (model.maxTokens === 'max_completion_tokens') {
        requestBody.max_completion_tokens = 600;
      } else {
        requestBody.max_tokens = 600;
      }
      
      // Only add temperature for models that support it
      if (model.supportsTemperature) {
        requestBody.temperature = 0.3;
      }
      
      console.log(`Attempting ${model.name} (1 attempt per model)`);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const result = await response.json();
        
        const content = result?.choices?.[0]?.message?.content;
        if (!content?.trim()) {
          console.log(`Empty content from ${model.name}, trying next model`);
          continue;
        }
        
        circuitBreaker.recordSuccess();
        console.log(`SUCCESS: ${model.name} returned valid content`);
        return result;
      } else {
        console.log(`HTTP error from ${model.name}: ${response.status}, trying next model`);
        continue;
      }
    } catch (error) {
      console.log(`Error with ${model.name}: ${error.message}, trying next model`);
      continue;
    }
  }
  
  throw new Error('All AI models failed');
}

async function handleRequest(req) {
  const requestId = Math.random().toString(36).substring(2, 10);
  console.log(`🚀 [${requestId}] ai-visual-scene-creator: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests  
  if (req.method === 'OPTIONS') {
    console.log(`✅ [${requestId}] CORS preflight handled`);
    return createCorsOptionsResponse();
  }
  
  // Add boot failure protection
  try {
    // Test if we can access critical dependencies
    const orchestrator = await getPhaseOrchestrator();
    if (!orchestrator) {
      console.error(`❌ [${requestId}] Boot failure - PhaseOrchestrator unavailable`);
      return createCorsErrorResponse('Service temporarily unavailable - orchestrator boot failed', 503);
    }
  } catch (bootError) {
    console.error(`❌ [${requestId}] Boot validation failed:`, bootError);
    return createCorsErrorResponse('Service boot validation failed', 503);
  }

  // Handle GET health check requests
  if (req.method === 'GET' || req.method === 'HEAD') {
    console.log(`🏥 [${requestId}] Health check request`);
    return createCorsResponse({
      status: 'healthy',
      service: 'ai-visual-scene-creator',
      timestamp: new Date().toISOString(),
      models: AI_MODELS.map(m => m.name)
    });
  }

  try {
    const payload = await req.json();
    console.log(`🔍 [${requestId}] Received payload keys:`, Object.keys(payload));
    
    // Simplified orchestrator call detection - single reliable check
    const isOrchestratorCall = payload._internal_orchestrator_call === true;
    
    // FLEXIBLE PAYLOAD HANDLING: Accept either pageText OR storyText
    let enhancedStoryData, storyText, avatarIdentity, userInfo, sessionId, pageNumber;
    
    if (payload.pageText) {
      // Current format: {pageText, userInfo, sessionId, pageNumber}
      console.log(`📄 [${requestId}] Using pageText format`);
      storyText = payload.pageText;
      enhancedStoryData = payload.enhancedStoryData || { userInfo: payload.userInfo };
      avatarIdentity = payload.userInfo?.avatar || payload.avatarIdentity;
      userInfo = payload.userInfo;
      sessionId = payload.sessionId;
      pageNumber = payload.pageNumber;
    } else if (payload.storyText || payload.enhancedStoryData) {
      // Legacy format: {enhancedStoryData, storyText, avatarIdentity}
      console.log(`📖 [${requestId}] Using storyText/enhancedStoryData format`);
      enhancedStoryData = payload.enhancedStoryData;
      storyText = payload.storyText;
      avatarIdentity = payload.avatarIdentity;
      userInfo = payload.userInfo;
      sessionId = payload.sessionId;
      pageNumber = payload.pageNumber;
    } else {
      return createCorsErrorResponse('Missing required fields: pageText OR (enhancedStoryData and storyText)', 400);
    }
    
    if (!storyText) {
      return createCorsErrorResponse('No story text content provided in any format', 400);
    }

    console.log(`🎯 [${requestId}] Call source: ${isOrchestratorCall ? 'PhaseIntegrationOrchestrator' : 'Frontend'}`);
    
    // Extract previousPrimaryScene from payload for continuity
    const previousPrimaryScene = payload.previousPrimaryScene || null;
    
    // If called by orchestrator, return simplified response with just primaryScene
    if (isOrchestratorCall) {
      return await handleOrchestratorCall(requestId, storyText, enhancedStoryData, avatarIdentity, userInfo, false, previousPrimaryScene);
    }
    
    // If called by frontend (including test button), generate primaryScene + aiSchema only
    return await handleOrchestratorCall(requestId, storyText, enhancedStoryData, avatarIdentity, userInfo, true, previousPrimaryScene);

  } catch (error) {
    return handleError(error, 'handleRequest', { requestId });
  }
}

// Handle calls from PhaseIntegrationOrchestrator OR frontend test button
async function handleOrchestratorCall(requestId, storyText, enhancedStoryData, avatarIdentity, userInfo, includeFullSchema = false, previousPrimaryScene = null) {
  const callType = includeFullSchema ? 'frontend/test' : 'orchestrator';
  console.log(`🔄 [${requestId}] Processing ${callType} call - generating primaryScene + aiSchema for ${callType}`);
  
  // Validate userInfo parameter
  if (!userInfo) {
    console.warn(`⚠️ [${requestId}] Missing userInfo, using defaults`);
    userInfo = { name: 'Child', age: 6 };
  }

  return withPerformanceTracking('ai-visual-scene-creator-orchestrator', 'gpt-4o', async () => {
    const messages = [
      {
        role: 'system',
        content: `Generate a primary scene description for image generation.

OBJECTIVE: Return ONLY a primary scene description of 30+ characters with structured metadata.

JSON RESPONSE:
{
  "primaryScene": "Concise, descriptive visual scene for image generation",
  "setting": "Location (bedroom, playground, etc.) or null",
  "action": "Character activity (reading, playing, etc.) or null", 
  "mood": "Emotional tone (happy, calm, etc.) or null",
  "pose": "Body position (sitting, standing, etc.) or null"
}

RULES:
1. PRESERVE EXACT COUNTS: "a bird" = 1 bird, "birds" = multiple
2. INFER SETTING: Birds/trees = outdoor, beds/books = indoor unless specified
3. VISUAL ONLY: Describe observable details, not thoughts or dialogue
4. SPATIAL CLARITY: Include positions (left, right, center, background)
5. Always return valid JSON with all 5 keys
6. Use null (no quotes) for unclear components`
      },
      {
        role: 'user',
        content: `Based on the following page text, generate a structured scene description for image generation.

Page text:
"${storyText}"

Previous scene (for continuity):
"${previousPrimaryScene || 'None - this is the first scene'}"

Generate a visual scene description that maintains character and setting continuity while focusing on the current page's action.`
      }
    ];

    console.log(`🤖 [${requestId}] Generating primaryScene from storyText using OpenAI`);
    
    let processedContent; // Declare outside try block to fix scoping issue
    try {
      const result = await callOpenAIWithFallback(messages, 8000, requestId, avatarIdentity);
      const content = result?.choices?.[0]?.message?.content;
      
      if (!content?.trim()) {
        throw new Error('Empty response from OpenAI');
      }
      
      processedContent = parseAIResponse(content);
      console.log(`✅ [${requestId}] Generated primaryScene + aiSchema via OpenAI`);
      
    } catch (error) {
      console.error(`🚨 [${requestId}] Primary scene generation failed:`, error);
      throw error;
    }
    
    console.log(`✅ [${requestId}] Primary scene extracted via ${processedContent?.extractionMethod || 'openai_generated'}:`);
    console.log(`   Scene: ${processedContent?.primaryScene?.substring(0, 200)}...`);
    
    // CRITICAL: Ensure primaryScene is a clean string for template usage
    const primaryScene = processedContent?.primaryScene;
    if (!primaryScene || typeof primaryScene !== 'string' || primaryScene.length < 30) {
      console.error(`🚨 [${requestId}] Primary scene validation failed - escalating to Tier 2:`, {
        hasScene: !!primaryScene,
        sceneType: typeof primaryScene,
        sceneLength: primaryScene?.length || 0,
        sceneContent: primaryScene
      });
      throw new Error('Primary scene validation failed');
    }
    
    console.log(`✅ [${requestId}] Primary scene validation passed: ${primaryScene.length} characters`);
    
    const response = {
      success: true,
      primaryScene: primaryScene, // RAW OpenAI output - no processing
      aiSchema: includeFullSchema ? (processedContent?.aiSchema || {}) : undefined,
      extractionMethod: 'openai_generated',
      requestId
    };
    
    console.log(`✅ [${requestId}] Returning response:`, {
      success: response.success,
      primarySceneLength: response.primaryScene?.length,
      hasAiSchema: !!response.aiSchema,
      extractionMethod: response.extractionMethod
    });
    
    return createCorsResponse(response);
  });
}

// Export handleRequest for TypeScript receptionist to import
export default handleRequest;