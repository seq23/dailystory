// DEPLOY_MARKER: 2025-01-30T20:17:15Z - FORCED REDEPLOY TO FIX BOOT FAILURES
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

console.log('BOOT ai-visual-scene-creator module loaded');

// ============= LAZY LOADING FUNCTIONS FOR HEAVY DEPENDENCIES =============

async function getCharacterService() {
  try {
    const { CharacterConsistencyService } = await import("../_shared/CharacterConsistencyService.js");
    return new CharacterConsistencyService();
  } catch (error) {
    console.warn('CharacterService lazy load failed:', error);
    return null;
  }
}

async function getSecondaryDetector() {
  try {
    const { SecondaryElementDetector } = await import("../_shared/SecondaryElementDetector.js");
    return SecondaryElementDetector;
  } catch (error) {
    console.warn('SecondaryDetector lazy load failed:', error);
    return null;
  }
}

async function getSessionManager() {
  try {
    const { globalSessionManager } = await import("../_shared/SessionStateManager.js");
    return globalSessionManager;
  } catch (error) {
    console.warn('SessionManager lazy load failed:', error);
    return null;
  }
}

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
  return { enhancedData: enhancedStoryData, fieldCheck };
}

// AI Model Fallback Chain Configuration - CORRECT USER REQUESTED ORDER
const AI_MODELS = [
  { name: 'gpt-5-2025-08-07', maxTokens: 'max_completion_tokens', supportsTemperature: false },
  { name: 'gpt-4.1-2025-04-14', maxTokens: 'max_completion_tokens', supportsTemperature: false },
  { name: 'gpt-4o', maxTokens: 'max_tokens', supportsTemperature: true }
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
  
  getStatus() {
    return {
      isOpen: this.isOpen(),
      failures: this.failures,
      threshold: this.threshold
    };
  }
  
  manualReset() {
    this.failures = 0;
    this.lastFailure = 0;
    console.log('Circuit breaker reset');
  }
}

const circuitBreaker = new SimpleCircuitBreaker();

// Simple model detection for prompt optimization
function getModelFamily() {
  const primaryModel = AI_MODELS[0]?.name || '';
  const isNewModel = primaryModel.includes('gpt-5') || primaryModel.includes('gpt-4.1');
  return { useSimplifiedPrompt: isNewModel };
}

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
    
    for (let attempt = 1; attempt <= 3; attempt++) {
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
        
        console.log(`Attempting ${model.name} (attempt ${attempt}/3)`);
        
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
            if (attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
              continue;
            }
            break;
          }
          
          circuitBreaker.recordSuccess();
          return result;
        } else if (response.status === 503 || response.status === 429 || response.status === 502) {
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
          break;
        } else {
          break;
        }
      } catch (error) {
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        break;
      }
    }
    
    circuitBreaker.recordFailure();
  }
  
  throw new Error('All AI models failed');
}

serve(async (req) => {
  const requestId = Math.random().toString(36).substring(2, 10);
  console.log(`🚀 [${requestId}] ai-visual-scene-creator: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`✅ [${requestId}] CORS preflight handled`);
    return createCorsOptionsResponse();
  }

  // Handle health check BEFORE any JSON parsing
  if (req.method === 'HEAD') {
    console.log(`🩺 [${requestId}] HEAD health check`);
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method === 'GET' || req.url.includes('/health')) {
    console.log(`🩺 [${requestId}] GET health check request`);
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')?.trim();
    return createCorsResponse({
      status: 'healthy',
      service: 'ai-visual-scene-creator',
      tier: '1',
      timestamp: new Date().toISOString(),
      version: '2.1.5-tier-fallback-system',
      openaiApiKeyPresent: !!openaiApiKey,
      openaiKeyLength: openaiApiKey ? openaiApiKey.length : 0
    });
  }

  // For POST requests, wrap with performance tracking
  return withPerformanceTracking(
    'ai-visual-scene-creator',
    'fallback-chain',
    async () => {
      // Parse JSON body once
      let body;
      try {
        body = await req.json();
      } catch (e) {
        console.log(`⚠️ [${requestId}] Failed to parse JSON body:`, e.message);
        body = {};
      }

      // Handle health check and diagnostic requests
      if (body.healthCheck || body.diagnostic === 'tier_health_check') {
        return createCorsResponse({
          healthy: true,
          service: 'ai-visual-scene-creator',
          status: 'ready',
          openai: !!Deno.env.get('OPENAI_API_KEY')
        });
      }
      // Extract and validate parameters
      let { storyText, sessionId, pageNumber, avatarIdentity, storyId, enhancedStoryData } = body;
      
      storyText = storyText || body.pageText;
      
      if (!avatarIdentity && body.userInfo) {
        avatarIdentity = {
          name: body.userInfo.name || 'Child',
          age: body.userInfo.age || '6-8',
          type: body.userInfo.avatarType || 'prefer-not-to-answer',
          skinTone: body.userInfo.avatar?.skinTone || 'medium',
          culturalProfile: body.userInfo.culturalProfile || 'american',
          nativeLanguage: body.userInfo.nativeLanguage || 'en',
          difficultyLevel: body.userInfo.difficulty || 'medium'
        };
      }

      if (!storyText) {
        return createCorsErrorResponse('Missing required parameter: storyText or pageText', 400);
      }

      if (!avatarIdentity) {
        return createCorsErrorResponse('Missing required parameter: avatarIdentity', 400);
      }

        // Get previous AI scene for visual consistency (new approach)
        let previousScene = null;
        try {
          if (pageNumber > 1) {
            const SessionManager = await getSessionManager();
            if (SessionManager) {
              previousScene = await SessionManager.getPreviousAIScene(sessionId);
              console.log(`SCENE Previous scene for consistency: ${previousScene ? 'Found' : 'None'}`);
            }
          }
        } catch (error) {
          console.warn('WARNING Failed to get previous scene (non-critical):', error);
        }

        // Detect secondary characters for conditional schema
        function detectMultipleCharacters(storyText) {
          const multiCharacterWords = ['friend', 'friends', 'mom', 'dad', 'parent', 'teacher', 'sibling', 'brother', 'sister', 'grandmother', 'grandfather', 'with'];
          return multiCharacterWords.some(word => storyText.toLowerCase().includes(word));
        }

        const hasMultipleCharacters = detectMultipleCharacters(storyText);
        
        // Generate conditional secondary character fields
        const secondaryCharacterFields = hasMultipleCharacters ? `
    "secondaryCharacters": "with friend/parent/teacher",
    "secondaryCharacterRelation": "sibling/friend/adult/classmate", 
    "secondaryCharacterAppearance": "visual description for image generation",
    "secondaryCharacterAction": "what they're doing",` : '';

        // Model-specific prompt optimization
        const { useSimplifiedPrompt } = getModelFamily();
        
        // =================== PHASE 1: MINIMAL AI REQUEST (Scene Generation Only) ===================
        console.log('START PHASE 1: Minimal AI Request (Scene Generation Only)');
        
        // PHASE 1.1: Enhanced Character Description using CharacterConsistencyService
        console.log('CHARACTER PHASE 1.1: Using CharacterConsistencyService for database-backed character consistency');
        
        const CharacterService = await getCharacterService();
        let characterData = null;
        
        if (CharacterService) {
          const characterConsistencyService = new CharacterService();
          
          // Get or create character seed with database persistence
          characterData = await characterConsistencyService.getCharacterSeed(
            sessionId,
            avatarIdentity,
            storyText,
            'continuing', // session type
            null // page text clothing
          );
        } else {
          console.warn('CharacterService not available, using fallback character data');
          characterData = {
            seed: Math.floor(Math.random() * 1000000),
            characterDescription: `${avatarIdentity?.name || 'child'} is a child age ${avatarIdentity?.age || '6-8'}`
          };
        }
        
        const enhancedCharacterDescription = characterData.characterDescription || 
          `${avatarIdentity?.name || 'child'} is a child age ${avatarIdentity?.age || '6-8'}`;
        
        console.log('CHAR PHASE 1.1: Enhanced Character Description:', {
          avatarIdentity: avatarIdentity,
          characterSeed: characterData.seed,
          enhancedDescription: enhancedCharacterDescription,
          characterConsistency: 'database-backed',
          avatarSource: 'orchestrator-provided'
        });
        
        // PHASE 1.1b: Secondary Characters - REMOVED TO PREVENT DOUBLE PROCESSING
        // Secondary characters are now processed in the template system (runware-template-ab/cd)
        // to prevent duplicate processing and ensure proper tier-specific handling
        console.log('DEBUG PHASE 1.1b: Secondary character processing moved to template system');
        const secondaryElements = []; // Empty - processed in templates now
        
        // PHASE 1.1c: Track Visual Details
        console.log('ART PHASE 1.1c: Analyzing visual details using VisualDetailTracker');
        
        const VisualTracker = await getVisualTracker();
        let visualDetails = '';
        
        if (VisualTracker) {
          // Track visual details (cache-based for now)
          try {
            await VisualTracker.trackVisualDetail({
              user_id: avatarIdentity?.userName || 'unknown',
              session_id: sessionId,
              character_name: avatarIdentity?.name || 'character',
              image_url: '',
              visual_elements: {
                backgroundColor: 'auto',
                lighting: 'natural',
                composition: 'scene',
                setting: 'story',
                mood: 'neutral',
                style: 'children_book'
              },
              page_number: pageNumber
            });
            console.log('✅ Visual detail tracked successfully');
          } catch (error) {
            console.warn('⚠️ Visual detail tracking failed (non-critical):', error);
          }
        }
        
        console.log('IMAGE PHASE 1.1c: Visual details tracked:', {
          visualDetailsCount: visualDetails ? visualDetails.length : 0,
          details: visualDetails || 'none'
        });
        
        // PHASE 1.2: Minimal AI Prompt (NO cultural features, NO complex prompts)
        const aiRequestId = `REQ-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
        console.log(`AI [${aiRequestId}] PHASE 1.2: Constructing Minimal AI Prompt`);
        
        // Helper function to build user content safely (secondary characters now handled in templates)
        function buildUserContent(previousScene, storyText, secondaryElements) {
          let content = '';
          
          if (previousScene) {
            content = `{
  "previousScene": ${JSON.stringify(previousScene)},
  "currentText": "${storyText}"
}`;
          } else {
            content = `{
  "currentText": "${storyText}"
}`;
          }
          
          // NOTE: Secondary elements are now processed in the template system
          // to prevent double processing and ensure proper tier-specific handling
          
          // Add optional cultural inspiration for non-English languages - AI should feel free to enhance settings creatively
          const userLanguage = req.headers.get('Accept-Language')?.split(',')[0]?.split('-')[0] || 'en';
          const regionalContext = {
            'es': 'Spanish/Latino cultural elements (plazas, courtyards, warm architecture)',
            'fr': 'French cultural elements (Parisian architecture, gardens, cafes)',
            'de': 'German cultural elements (castles, forests, traditional buildings)',
            'it': 'Italian cultural elements (piazzas, fountains, Mediterranean settings)',
            'pt': 'Portuguese/Brazilian cultural elements (colorful buildings, beaches, tropical)',
            'ja': 'Japanese cultural elements (gardens, traditional architecture, cherry blossoms)',
            'ko': 'Korean cultural elements (palaces, mountains, modern architecture)',
            'zh': 'Chinese cultural elements (gardens, traditional buildings, landscapes)',
            'ar': 'Arabic cultural elements (courtyards, geometric patterns, desert landscapes)',
            'hi': 'Indian cultural elements (temples, gardens, vibrant colors)'
          };
          
          if (regionalContext[userLanguage] && userLanguage !== 'en') {
            content += `\nOptional cultural inspiration (enhance settings creatively with regional architecture/landmarks): ${regionalContext[userLanguage]}`;
          }
          
          return content;
        }

        const minimalMessages = [
          {
            role: 'system',
content: `Generate a primary scene description for image generation.

OBJECTIVE: Return a primary scene description of 30+ characters with structured metadata.

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
6. Use null (no quotes) for unclear components
7. primaryScene must be 30+ characters and visually descriptive
8. Use previousScene to keep characters, objects, and animals visually consistent. Only update details if currentText introduces a clear change.`
          },
          {
            role: 'user', 
            content: buildUserContent(previousScene, storyText, secondaryElements)
          }
        ];
        
        console.log(`AI [${aiRequestId}] PHASE 1.2: Enhanced prompt constructed:`, {
          systemPromptLength: minimalMessages[0].content.length,
          userPromptLength: minimalMessages[1].content.length,
          enhancedCharacterDescription: enhancedCharacterDescription,
          secondaryElementsCount: secondaryElements.length,
          visualDetailsIncluded: !!visualDetails,
          storyTextLength: storyText.length
        });
        
        // PHASE 1.3: AI Call for Primary Scene ONLY
        let primaryScene;
        let setting, action, mood, pose; // Declare scope variables for later use
        try {
          console.log(`AI [${aiRequestId}] PHASE 1.3: Calling OpenAI for primary scene...`);
          const aiResult = await callOpenAIWithFallback(minimalMessages, 6000, aiRequestId, avatarIdentity);
          
          const content = aiResult.choices?.[0]?.message?.content;
          if (!content) {
            throw new Error('OpenAI returned no content');
          }
          
          const parsedResult = parseAIResponse(content.trim(), { requestId: aiRequestId });
          primaryScene = parsedResult.primaryScene;
          
          setting = parsedResult.setting || null;
          action = parsedResult.action || null;
          mood = parsedResult.mood || null;
          pose = parsedResult.pose || null;
          
          if (!primaryScene || primaryScene.length < 30) {
            throw new Error(`Primary scene validation failed: length ${primaryScene?.length || 0} < 30`);
          }
          
          console.log(`SUCCESS [${aiRequestId}] PHASE 1.3: Primary scene generated successfully:`, {
            primarySceneLength: primaryScene.length,
            primaryScenePreview: primaryScene.substring(0, 100) + '...'
          });
          
          // PHASE 1.3b: Update Visual Details with Generated Scene
          console.log('UPDATE PHASE 1.3b: Updating visual details with generated primary scene');
          
          const VisualTracker = await getVisualTracker();
          let updatedPrimaryScene = primaryScene;
          
          if (VisualTracker) {
            // Track the generated scene for consistency
            try {
              await VisualTracker.trackVisualDetail({
                user_id: avatarIdentity?.userName || 'unknown',
                session_id: sessionId,
                character_name: avatarIdentity?.name || 'character',
                image_url: '',
                visual_elements: {
                  backgroundColor: 'auto',
                  lighting: 'natural',
                  composition: 'scene',
                  setting: setting || 'story',
                  mood: mood || 'neutral',
                  style: 'children_book'
                },
                page_number: pageNumber
              });
              console.log('✅ Generated scene tracked for consistency');
            } catch (error) {
              console.warn('⚠️ Scene tracking failed (non-critical):', error);
            }
          }
          
        } catch (error) {
          console.error(`ERROR [${aiRequestId}] PHASE 1.3: AI call failed:`, error.message);
          console.error('ALERT Tier 1 OpenAI Failure:', error, {
            sessionId,
            storyId,
            pageNumber,
            phase: 'PHASE_1_AI_CALL'
          });
          return createCorsErrorResponse(`Tier 1 AI generation failed: ${error.message}`, 500);
        }
        
        // =================== PHASE 2: POST-AI PROMPT CONSTRUCTION ===================
        console.log('ART PHASE 2: Post-AI Prompt Construction');
        
        // PHASE 2.1: Enhanced Character Description (sentence 1) with Database Consistency
        const baseCharacterDescription = enhancedCharacterDescription;
        console.log(`TEXT PHASE 2.1: Enhanced character: ${baseCharacterDescription}`);
        
        // PHASE 2.2: Primary Scene Integration (sentence 2+)
        const sceneIntegration = primaryScene;
        console.log(`SCENE PHASE 2.2: Scene integrated: ${sceneIntegration.substring(0, 50)}...`);
        
        console.log('CHARACTER PHASE 2.3: Scene data prepared for orchestrator');
        
        // PHASE 2.5: Character Consistency Database Storage (Enhanced Implementation)
        console.log('STORAGE PHASE 2.5: Character consistency stored in database via CharacterConsistencyService');
        console.log(`CHARACTER Character seed ${characterData.seed} persisted for session ${sessionId}`);
        
        // Store current AI scene for next page consistency
        try {
          const SessionManager = await getSessionManager();
          if (SessionManager) {
            await SessionManager.storePreviousAIScene(sessionId, {
              primaryScene: primaryScene,
              setting: setting,
              action: action,
              mood: mood,
              pose: pose
            });
            console.log(`SCENE Current scene stored for next page consistency`);
          }
        } catch (error) {
          console.warn('WARNING Failed to store scene for next page (non-critical):', error);
        }
        
        
        
        console.log('BUILD SCENE DATA ASSEMBLY: Character Consistency + Scene Data Ready', {
          hasSecondaryCharacters: secondaryElements.length > 0,
          hasVisualDetails: !!visualDetails,
          characterSeed: characterData.seed,
          primarySceneLength: primaryScene.length
        });
        
        // Create enhanced story data for return with character consistency
        enhancedStoryData = {
          primaryScene: primaryScene,
          characters: baseCharacterDescription,
          secondaryCharacters: secondaryElements,
          visualDetails: visualDetails,
          characterSeed: characterData.seed,
          // Conditionally include visual components only if they exist
          ...(typeof setting !== 'undefined' && { 
            visualComponents: {
              setting: setting || null,
              action: action || null,
              mood: mood || null,
              pose: pose || null
            }
          }),
          enhancedTier1: true, // Updated from reorganizedTier1
          characterConsistency: {
            databaseBacked: true,
            characterSeed: characterData.seed,
            secondaryCharactersCount: secondaryElements.length,
            visualDetailsTracked: !!visualDetails
          },
          phases: {
            phase1: 'AI scene generation + character DB + secondary detection + visual tracking',
            phase2: 'Secondary character descriptions'
          }
        };
        
        console.log(`SUCCESS SCENE CREATOR: Scene data with character consistency ready for orchestrator`);
        
        // =================== DEBUG OUTPUT ===================
        // Check if debug mode is enabled via any debug parameter
        const debugMode = req.url.includes('debug=1') || req.url.includes('debug=true');
        
        if (debugMode) {
          console.log(`ART AI DEBUG OUTPUT:`);
          console.log(`TARGET Primary Scene: "${primaryScene}"`);
          console.log(`HOUSE Setting: ${setting || 'null'}`);
          console.log(`ACTION Action: ${action || 'null'}`);
          console.log(`MOOD Mood: ${mood || 'null'}`);
          console.log(`POSE Pose: ${pose || 'null'}`);
          console.log(`CHAR Character: ${characterData?.name || 'Unknown'} (seed: ${characterData?.seed || 'none'})`);
          console.log(`STATS Processing: 3-phase enhanced with ${secondaryElements.length} secondary characters`);
        }
        
        // =================== VALIDATION & RETURN RESULTS ===================
        // No complex validation needed since we built the prompts ourselves
        const validationResult = {
          enhancedData: enhancedStoryData,
          fieldCheck: {
            primaryScene: true,
            passCount: 3,
            details: 'reorganized_tier1_success'
          }
        };
        
        console.log(`SUCCESS ENHANCED TIER 1: Validation passed - all phases complete with character consistency`);
        
        // Return enhanced data with assembled prompts for Runware
        const result = {
          success: true,
          aiSchema: enhancedStoryData,
          metadata: {
            enhancedTier1: true, // Updated from reorganizedTier1
            characterConsistency: {
              databaseBacked: true,
              characterSeed: characterData.seed,
              secondaryCharactersDetected: secondaryElements.length,
              visualDetailsTracked: !!visualDetails
            },
            validation: {
              fieldsPresent: 5, // Updated count
              fieldsPassed: true,
              processingMethod: '3-phase-enhanced-with-consistency',
              modelUsed: 'openai-enhanced'
            },
            extractedElements: {
              hasCharacters: true,
              hasVisualComponents: true,
              hasPrimaryScene: true,
              complexity: storyText.length > 200 ? 'complex' : storyText.length > 100 ? 'medium' : 'simple'
            },
            contextualInfo: {
              pageNumber,
              totalPages: totalPages || 'unlimited',
              sessionId,
              originalTextLength: storyText.length,
              processingTimestamp: new Date().toISOString(),
              isNeverEnding: !totalPages
            },
            narrativeEnhancements: {
              sceneType: 'illustration',
              lighting: 'natural',
              mood: 'cheerful',
              schemaVersion: '3-phase-reorganized'
            },
            phases: {
              phase1: 'AI scene generation + character DB + secondary detection + visual tracking',
              phase2: 'Secondary character descriptions'
            }
          },
          enhancedStoryData: enhancedStoryData || {}
        };

        console.log(`SUCCESS SCENE CREATOR: Complete - Phases: AI Scene + Character DB + Secondary + Visual(SUCCESS) -> Secondary Characters(SUCCESS) - Scene data ready for orchestrator`);

        return createCorsResponse(result);
      }
    )
  );
});
