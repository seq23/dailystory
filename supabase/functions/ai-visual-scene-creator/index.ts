// ⚠️  DEPRECATED - 2025-09-26
// This file has been converted to pure TypeScript (index.ts)
// Kept for reference and emergency rollback purposes only
// DO NOT USE - Use index.ts instead

// DEPLOY_MARKER: 2025-01-16T17:30:00Z - COMPREHENSIVE BUG FIXES WITH SUPABASE CLIENT
import { 
  getCulturalBundle, 
  shouldApplyCulturalEnhancements 
} from '../_shared/StaticDataCache.js';
import { UnifiedPlaceholderResolver } from '../_shared/UnifiedPlaceholderResolver.js';
import { getStyleFramework } from '../_shared/styleFrameworks.js';
import { characterConsistencyService } from '../_shared/CharacterConsistencyService.js';
import { SessionStateManager } from '../_shared/SessionStateManager.js';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

// ============= BULLETPROOF PHASES IMPLEMENTATION =============

// PHASE 3: FAST CIRCUIT BREAKER PROTECTION  
const TIER_TIMEOUTS = {
  DIRECT_MODE: 8000,      // 8s max for Direct Mode
  AI_GENERATION: 15000,   // 15s max for AI generation
  OPENAI_API: 12000       // 12s max for OpenAI calls
};

// PHASE 1B: Fast Direct Mode Validation
function validateDirectModePayload(payload) {
  if (!payload.pageText && !payload.storyText) throw new Error("MISSING_STORY_CONTENT");
  if (!payload.userInfo) throw new Error("MISSING_USER_INFO");
  return { isValid: true, contentType: payload.pageText ? 'pageText' : 'storyText' };
}

// PHASE 3B: Instant Failure Detection
function shouldFailFast(error) {
  const msg = error?.message?.toLowerCase() || '';
  return msg.includes('missing_story_content') || 
         msg.includes('missing_user_info') ||
         msg.includes('payload_null') ||
         msg.includes('no_story_content');
}

// PHASE 5A: Primary Scene Quality Check
function validatePrimarySceneQuality(scene) {
  if (!scene || typeof scene !== 'string') return false;
  if (scene.length < 50) return false;
  if (scene.includes('undefined') || scene.includes('null')) return false;
  return scene.split(' ').filter(word => word.length > 0).length >= 8; // Minimum word count
}

// PHASE 5B: Image URL Validation  
function validateImageURL(url) {
  if (!url || typeof url !== 'string') return false;
  if (!url.startsWith('http')) return false;
  if (url.includes('undefined') || url.includes('null')) return false;
  return url.length > 20; // Reasonable URL length
}

// PHASE 4B: Direct Mode Fallback Chain
const AI_MODELS_FALLBACK = ['gpt-4o', 'gpt-4o-mini'];

// Initialize Supabase client for internal function calls
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// AI visual scene creator service initialized

// Remove lazy loading of CharacterConsistencyService - now static import at top
// This fixes boot sync anomalies by eliminating import chain delays

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
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Max-Age': '600',
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
            backgroundColor: null,
            lighting: null,
            composition: null,
            setting: null,
            mood: null,
            style: null,
            secondaryCharacters: { humans: [], pets: [] },
            objects: []
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
      
      // Direct fetch with timeout and error classification
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
  // OPTIONS fast path (preflight)
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

  // GET/HEAD safety — never fail health
  if (req.method === 'GET' || req.method === 'HEAD') {
    const isHeadHealth = req.method === 'HEAD' && new URL(req.url).pathname === '/health';
    if (isHeadHealth) {
      return new Response(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store', 'x-health': 'true', 'Content-Length': '0' } });
    }
    return new Response(JSON.stringify({
      status: 'healthy',
      service: 'ai-visual-scene-creator',
      timestamp: new Date().toISOString()
    }), { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } });
  }

  const requestId = Math.random().toString(36).substring(2, 10);
  const startTime = Date.now(); // PHASE 6: Performance tracking
  console.log(`🚀 [${requestId}] ai-visual-scene-creator: ${req.method} ${req.url}`);
  
  // Boot validation removed - function ready for orchestrator or direct calls
  console.log(`🚀 [${requestId}] ai-visual-scene-creator ready`);


  try {
    const payload = await req.json();
    
    // PHASE 1B: Fast Direct Mode Validation
    try {
      const validation = validateDirectModePayload(payload);
      console.log(`✅ [${requestId}] Payload validation passed:`, validation);
    } catch (validationError) {
      if (shouldFailFast(validationError)) {
        console.error(`❌ [${requestId}] Fast validation failed: ${validationError.message}`);
        return createCorsErrorResponse(`Validation failed: ${validationError.message}`, 400);
      }
    }
    
    console.log(`📦 [${requestId}] Payload keys:`, Object.keys(payload));
    
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
    
    // Check for direct mode flag (when orchestrator boot fails)
    if (payload.directMode === true) {
      return await handleVisualSceneDirectMode(requestId, storyText, userInfo, sessionId, pageNumber);
    } else if (payload.isDebugMode === true) {
      // Debug path: generate primaryScene + aiSchema only (no images)
      return await handleOrchestratorCall(requestId, storyText, enhancedStoryData, avatarIdentity, userInfo, true, previousPrimaryScene);
    } else {
      // No valid mode specified - return explicit error
      return handleError(
        new Error('INVALID_MODE: Must specify either directMode: true (for images) or isDebugMode: true (for scene descriptions)'),
        'handleRequest',
        { requestId, hasDirectMode: !!payload.directMode, hasDebugMode: !!payload.isDebugMode }
      );
    }

  } catch (error) {
    return handleError(error, 'handleRequest', { requestId });
  }
}

// Handle calls from PhaseIntegrationOrchestrator OR frontend test button
async function handleOrchestratorCall(requestId, storyText, enhancedStoryData, avatarIdentity, userInfo, includeFullSchema = false, previousPrimaryScene = null) {
  const localStartTime = Date.now(); // Fix startTime scope collision
  const callType = includeFullSchema ? 'frontend/test' : 'orchestrator';
  console.log(`🔄 [${requestId}] Processing ${callType} call - generating primaryScene + aiSchema for ${callType}`);
  
  // Validate userInfo parameter
  if (!userInfo) {
    console.warn(`⚠️ [${requestId}] Missing userInfo, using defaults`);
    userInfo = { name: 'Child', age: 6 };
  }

  // Add Character Consistency Service integration for enhanced AI prompting
  let characterAppearance = '';
  let characterSeed = null;
  const sessionId = userInfo?.sessionId || enhancedStoryData?.sessionId;
  try {
    if (sessionId && includeFullSchema) { // Only for test results, not orchestrator calls
      const characterService = characterConsistencyService;
      
      await characterService.analyzeVisualDetails(sessionId, storyText, userInfo?.pageNumber || 1, userInfo?.name);
      characterAppearance = await characterService.getCharacterAppearanceFromStory(sessionId, userInfo?.name) || '';
      characterSeed = await characterService.getCharacterSeed(sessionId, userInfo?.name) || null;
      console.log(`✅ [${requestId}] Character consistency applied for ${callType}`);
    }
  } catch (characterError) {
    console.warn(`⚠️ [${requestId}] Character consistency failed:`, characterError);
  }

  // Handle avatar types - map "prefer-not-to-answer" to "gender neutral child"
  const avatarType = userInfo?.avatar?.type || userInfo?.avatarType || 'child';
  const characterReference = avatarType === 'prefer-not-to-answer' ? 'gender neutral child' : avatarType;
  
  // Detect non-English users for cultural context
  const nativeLanguage = userInfo?.nativeLanguage || userInfo?.language || 'en';
  const isNonEnglish = nativeLanguage !== 'en';
  
  // Cultural setting examples for non-English users
  let culturalContext = '';
  if (isNonEnglish) {
    const culturalSettings = {
      'fr': 'near iconic French landmarks like Eiffel Tower, Arc de Triomphe, or charming French countryside',
      'es': 'in vibrant Spanish plazas, near colorful Mediterranean buildings, or beautiful Spanish gardens',
      'pt': 'in lively Brazilian neighborhoods, near tropical beaches, or colorful South American architecture',
      'zh': 'in peaceful Chinese gardens, near traditional pagodas, or modern Asian city settings',
      'de': 'in charming German villages, near castles, or beautiful European countryside',
      'it': 'in picturesque Italian piazzas, near ancient Roman architecture, or Tuscan landscapes'
    };
    culturalContext = culturalSettings[nativeLanguage] || 'in culturally authentic settings relevant to their heritage';
  }

  // Comprehensive character data for AI prompt
  const characterName = userInfo?.name || userInfo?.childName || 'Child';
  const characterAge = userInfo?.age || '6-8';
  const skinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || 'medium';
  const hairColor = userInfo?.avatar?.hairColor || 'brown';
  
  // Build comprehensive character description
  const characterData = [
    `${characterReference} named ${characterName}`,
    `age ${characterAge}`,
    hairColor !== 'brown' ? `${hairColor} hair` : null,
    characterAppearance ? `with ${characterAppearance}` : null
  ].filter(Boolean).join(', ');

  return withPerformanceTracking('ai-visual-scene-creator-orchestrator', 'gpt-4o', async () => {
    const messages = [
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
1. NEVER describe main character's skin tone - focus on hair, clothing, facial expressions, and pose only
2. Use provided character data exactly - do not make up features for main character
3. For secondary characters, you may describe their appearance as needed
4. Use story-driven visual descriptions based on the text content

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
${isNonEnglish ? `- Incorporate cultural elements appropriate for ${nativeLanguage} speaking families` : ''}

RESPONSE FORMAT:
- Return valid JSON with all 9 keys exactly as specified
- Use null (no quotes) for unclear visual components
- Use empty arrays [] for missing secondary characters or objects
- Focus on observable visual elements, not thoughts or dialogue
- Ensure primary scene is 200+ characters with comprehensive visual detail`
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
    
    // Return standardized response format with enhanced compatibility
    const response = {
      success: true,
      primaryScene: primaryScene, // RAW OpenAI output - no processing
      extractedScene: primaryScene, // Alternate field for compatibility
      primarySceneLength: primaryScene.length,
      aiSchema: includeFullSchema ? (processedContent?.aiSchema || processedContent) : undefined,
      hasAiSchema: !!processedContent?.aiSchema,
      extractionMethod: 'openai_generated',
      requestId,
      processingTimeMs: Date.now() - localStartTime,
      // Include character consistency data for test results
      characterConsistency: includeFullSchema ? {
        characterAppearance,
        characterSeed,
        culturalContext: isNonEnglish ? culturalContext : null,
        avatarType: characterReference
      } : undefined
    };
    
    console.log(`✅ [${requestId}] Returning response:`, {
      success: response.success,
      primarySceneLength: response.primaryScene?.length,
      hasAiSchema: !!response.aiSchema,
      hasCharacterConsistency: !!response.characterConsistency,
      extractionMethod: response.extractionMethod
    });
    
    return createCorsResponse(response);
  }).finally(() => {
    // PHASE 6: Performance monitoring
    const responseTime = Date.now() - localStartTime;
    console.log(`⏱️ [${requestId}] Request completed in ${responseTime}ms`);
  });
}

// Export handleRequest for TypeScript receptionist to import
// DIRECT MODE: Handle Visual Scene Direct Mode (when orchestrator fails)
async function handleVisualSceneDirectMode(requestId, storyText, userInfo, sessionId, pageNumber) {
  console.log(`🎯 [${requestId}] DIRECT MODE: ai-visual-scene-creator bypass mode activated`);
  
  try {
    // Step 1: Generate primary scene via OpenAI
    const messages = [
      {
        role: 'system',
        content: `Generate a detailed visual scene description for children's story illustration.

OBJECTIVE: Create a vivid, child-friendly visual scene that captures the story moment.

JSON RESPONSE:
{
  "primaryScene": "Detailed visual description with setting, character, and action (50+ characters)",
  "backgroundColor": "Background color and atmosphere",
  "lighting": "Lighting conditions and mood",
  "composition": "Visual arrangement and framing",
  "setting": "Location and environment",
  "mood": "Emotional atmosphere",
  "style": "Artistic style and technique",
  "secondaryCharacters": {
    "humans": ["array of secondary human characters"],
    "pets": ["array of animal companions"]
  },
  "objects": ["array of significant objects in scene"]
}

RULES:
1. Child-appropriate content only
2. Vivid, colorful descriptions
3. Include spatial details (positions, colors, lighting)
4. Focus on visual elements only`
        
      },
      {
        role: 'user',
        content: `Create a visual scene for this story text: "${storyText}"`
      }
    ];

    let openAIResult;
    try {
      openAIResult = await callOpenAIWithFallback(messages, 8000, requestId, userInfo?.avatar);
    } catch (openAIError) {
      console.error(`❌ [${requestId}] OpenAI failed in direct mode, escalating to Tier 2.5C`);
      return createCorsErrorResponse(`OpenAI generation failed: ${openAIError.message}`, 503);
    }

    const content = openAIResult?.choices?.[0]?.message?.content;
    if (!content?.trim()) {
      console.error(`❌ [${requestId}] Empty OpenAI response in direct mode`);
      return createCorsErrorResponse('OpenAI returned empty content', 503);
    }

    let parsedResponse;
    try {
      parsedResponse = parseAIResponse(content);
    } catch (parseError) {
      console.error(`❌ [${requestId}] Failed to parse OpenAI response in direct mode`);
      return createCorsErrorResponse(`Failed to parse AI response: ${parseError.message}`, 503);
    }

    if (!parsedResponse.primaryScene || parsedResponse.primaryScene.length < 20) {
      console.error(`❌ [${requestId}] Insufficient primary scene in direct mode`);
      return createCorsErrorResponse('Generated scene too short or missing', 503);
    }
    
    // PHASE 5A: Primary Scene Quality Gate
    if (!validatePrimarySceneQuality(parsedResponse.primaryScene)) {
      console.error(`❌ [${requestId}] Primary scene quality validation failed in direct mode`);
      return createCorsErrorResponse('Generated scene failed quality validation', 503);
    }

    console.log(`✅ [${requestId}] OpenAI generation successful in direct mode`);

    // Step 2: Complete character consistency with secondary characters and objects
    let characterAppearance = '';
    let detectedSecondaryCharacters = [];
    let secondaryDescriptions = [];
    let coloredObjects = '';
    
    try {
      const characterService = characterConsistencyService;
      
      if (sessionId) {
        try {
          // Main character analysis
          await characterService.analyzeVisualDetails(sessionId, storyText, pageNumber || 1, userInfo?.name);
          characterAppearance = await characterService.getCharacterAppearanceFromStory(sessionId, userInfo?.name) || '';

          // Connect VisualDetailTracker for sophisticated analysis
          const { VisualDetailTracker } = await import("../_shared/VisualDetailTracker.js");
          await VisualDetailTracker.analyzeTextForDetails(sessionId, storyText, pageNumber || 1, userInfo?.name);
          
          // Secondary character detection
          const pageTextForAnalysis = storyText || payload.pageText || parsedResponse.primaryScene || '';
          detectedSecondaryCharacters = await characterService.detectSecondaryCharacters(pageTextForAnalysis);
          
          // Build secondary character descriptions with seeds
          for (const character of detectedSecondaryCharacters) {
            const seed = await characterService.getSecondaryCharacterSeed(
              sessionId, character.name, character.type || 'secondary_character'
            );
            secondaryDescriptions.push(`${character.name}: ${character.description} (${character.type})`);
          }
        } catch (characterError) {
          console.warn(`⚠️ Character consistency service error:`, characterError.message);
          // Continue without character consistency - don't crash the image generation
          characterAppearance = '';
          detectedSecondaryCharacters = [];
          secondaryDescriptions = [];
        }
        
        // Get environmental consistency
        coloredObjects = await characterService.getColoredObjects(sessionId) || '';
        
        console.log(`✅ [${requestId}] Complete character consistency applied:`, {
          characterAppearance: !!characterAppearance,
          secondaryCharacters: detectedSecondaryCharacters.length,
          coloredObjects: !!coloredObjects
        });
      }
    } catch (characterError) {
      console.warn(`⚠️ [${requestId}] Character consistency failed, continuing without it:`, characterError);
    }

    // Step 3: Get proper style framework using difficulty
    const difficulty = userInfo?.difficulty || 'medium';
    const styleFrameworkData = getStyleFramework(difficulty);
    const styleFramework = styleFrameworkData.frameworkPrompt;
    const negativePrompt = styleFrameworkData.negativePrompt;

    // Step 4: Get cultural enhancements using proper system
    const placeholderResolver = new UnifiedPlaceholderResolver();
    const culturalEnhancements = await placeholderResolver.resolveCulturalEnhancements(userInfo, sessionId);

    // Step 5: Build comprehensive prompt with all character consistency elements
    const enhancementArray = [
      parsedResponse.primaryScene,
      characterAppearance,
      secondaryDescriptions.join(', '),
      coloredObjects,
      culturalEnhancements,
      styleFramework
    ].filter(item => item && item.trim().length > 0);

    const comprehensivePrompt = enhancementArray.join(', ');

    // Log AI visual scene creation data
    try {
      const { logTierAttempt } = await import("../_shared/tierLogging.js");
      await logTierAttempt(
        supabase,
        sessionId,
        requestId,
        'ai-visual-scene-creator',
        'success',
        {
          aiSchema: parsedResponse,
          primaryScene: parsedResponse.primaryScene,
          characterAppearance,
          coloredObjects,
          culturalEnhancements,
          comprehensivePrompt,
          edgeFunction: 'ai-visual-scene-creator',
          pageNumber: pageNumber || 1
        }
      );
    } catch (loggingError) {
      console.warn('Failed to log AI scene data:', loggingError.message);
    }

    console.log(`🎨 [${requestId}] Direct mode prompt built: ${comprehensivePrompt.substring(0, 100)}...`);

    // Step 6: Generate image via runware-template-cd internally
    try {
      const { data: imageResult, error: imageError } = await supabase.functions.invoke('runware-template-cd', {
        body: {
          pageText: storyText,
          userInfo: userInfo,
          sessionId: sessionId,
          pageNumber: pageNumber,
          templateComplexity: 'C',
          directModeCall: true,
          enhancedPrompt: comprehensivePrompt,
          negativePrompt: negativePrompt,
          storyText: storyText,
          enhancedStoryData: { userInfo: userInfo },
          avatarIdentity: userInfo?.avatar
        }
      });

      if (imageError || !imageResult?.success) {
        console.error(`❌ [${requestId}] Image generation failed in direct mode`);
        return createCorsErrorResponse(`Image generation failed: ${imageError?.message || 'Unknown error'}`, 503);
      }

      // PHASE 5B: Image URL Quality Gate
      if (!validateImageURL(imageResult.imageURL)) {
        console.error(`❌ [${requestId}] Invalid image URL generated in direct mode`);
        return createCorsErrorResponse('Invalid image URL generated', 503);
      }

      console.log(`✅ [${requestId}] Direct mode successful - complete image generated`);

      return createCorsResponse({
        success: true,
        imageURL: imageResult.imageURL,
        primaryScene: parsedResponse.primaryScene,
        aiSchema: parsedResponse,
        characterAppearance,
        detectedSecondaryCharacters,
        secondaryDescriptions,
        coloredObjects,
        culturalEnhancements,
        styleFramework: styleFrameworkData.name,
        tier: 'AI_VISUAL_SCENE_DIRECT',
        provider: 'ai-visual-scene-creator-direct',
        templateType: 'direct-enhanced',
        positivePrompt: comprehensivePrompt,
        characterConsistencyLevel: 'FULL_UNIFIED_LOGIC',
        metadata: {
          requestId,
          directMode: true,
          bypassedOrchestrator: true,
          enhancementCount: enhancementArray.length,
          secondaryCharacterCount: detectedSecondaryCharacters.length,
          hasColoredObjects: !!coloredObjects
        }
      });

    } catch (imageError) {
      console.error(`❌ [${requestId}] Image generation exception in direct mode:`, imageError);
      return createCorsErrorResponse(`Image generation exception: ${imageError.message}`, 503);
    }

  } catch (error) {
    console.error(`❌ [${requestId}] Direct mode failed completely:`, error);
    return createCorsErrorResponse(`Direct mode failed: ${error.message}`, 503);
  }
}

export default handleRequest;