// DEPLOY_MARKER: 2025-01-16T14:30:00Z - SEED FIX & OPENAI RESTORATION
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  getHairBySkintone, 
  getSkinBySkintone, 
  getCulturalBundle, 
  shouldApplyCulturalEnhancements 
} from '../_shared/StaticDataCache.js';

console.log('BOOT ai-visual-scene-creator module loaded');

// ============= LAZY LOADING FUNCTIONS FOR HEAVY DEPENDENCIES =============

async function getCharacterService() {
  try {
    const { characterConsistencyService } = await import("../_shared/CharacterConsistencyService.js");
    return characterConsistencyService; // Return singleton instance directly
  } catch (error) {
    console.warn('CharacterService lazy load failed:', error);
    // Check if it's a DNS resolution error
    if (error.message?.includes('DNS') || error.message?.includes('resolution') || error.message?.includes('network')) {
      console.error('DNS Resolution Error - Character Consistency Service unreachable:', error.message);
    }
    return null;
  }
}

async function getEnhancedAnimalDetector() {
  try {
    const { enhancedAnimalDetector } = await import("../_shared/EnhancedAnimalDetector.js");
    return enhancedAnimalDetector;
  } catch (error) {
    console.warn('EnhancedAnimalDetector lazy load failed:', error);
    return null;
  }
}

// PHASE 4: Session management removed - orchestrator handles all session state
// Session data flows via function parameters only

async function getVisualTracker() {
  try {
    const { visualDetailTracker } = await import("../_shared/VisualDetailTracker.js");
    return visualDetailTracker; // Use singleton instance
  } catch (error) {
    console.warn('VisualTracker lazy load failed:', error);
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
    
    // FLEXIBLE PAYLOAD HANDLING: Accept either pageText OR storyText
    let enhancedStoryData, storyText, avatarIdentity;
    
    if (payload.pageText) {
      // Current format: {pageText, userInfo, sessionId, pageNumber}
      console.log(`📄 [${requestId}] Using pageText format`);
      storyText = payload.pageText;
      enhancedStoryData = payload.enhancedStoryData || { userInfo: payload.userInfo };
      avatarIdentity = payload.userInfo?.avatar || payload.avatarIdentity;
    } else if (payload.storyText || payload.enhancedStoryData) {
      // Legacy format: {enhancedStoryData, storyText, avatarIdentity}
      console.log(`📖 [${requestId}] Using storyText/enhancedStoryData format`);
      enhancedStoryData = payload.enhancedStoryData;
      storyText = payload.storyText;
      avatarIdentity = payload.avatarIdentity;
    } else {
      return createCorsErrorResponse('Missing required fields: pageText OR (enhancedStoryData and storyText)', 400);
    }
    
    if (!storyText) {
      return createCorsErrorResponse('No story text content provided in any format', 400);
    }

    const result = await withPerformanceTracking('ai-visual-scene-creator', 'gpt-4o-mini', async () => {
      const validatedContent = await validateAndEnhanceContent(enhancedStoryData, storyText);
      
      if (validatedContent.primaryScene) {
        console.log(`✅ [${requestId}] Successfully created visual scene`);
        return validatedContent;
      } else {
        throw new Error('Failed to generate valid visual scene content');
      }
    });

    return createCorsResponse(result);
  } catch (error) {
    return handleError(error, 'handleRequest', { requestId });
  }
}

// Export for TypeScript receptionist
export default handleRequest;

// Maintain backward compatibility
serve(handleRequest);
