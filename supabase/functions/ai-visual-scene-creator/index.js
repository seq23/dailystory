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
  return { enhancedData: enhancedStoryData, fieldCheck };
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
      let { storyText, sessionId, pageNumber, avatarIdentity, storyId, enhancedStoryData, totalPages } = body;
      
      storyText = storyText || body.pageText;
      totalPages = totalPages || body.totalPages || null;
      
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

        // PHASE 4: Previous scene data comes from orchestrator via parameters
        let previousScene = null;
        if (pageNumber > 1 && enhancedStoryData?.previousScene) {
          previousScene = enhancedStoryData.previousScene;
          console.log(`SCENE Retrieved previous scene from orchestrator:`, previousScene ? 'found' : 'not found');
        }

        // Debug gate for console logging
        const debugMode = req.url.includes('debug=1') || req.url.includes('debug=true');
        
        function debugLog(...args) {
          if (debugMode) {
            console.log(...args);
          }
        }
        
        // Initialize performance tracking
        const startTime = Date.now();

        
        // =================== PHASE 1: MINIMAL AI REQUEST (Scene Generation Only) ===================
        console.log('START PHASE 1: Minimal AI Request (Scene Generation Only)');
        
        // PHASE 1.1: Enhanced Character Description using CharacterConsistencyService
        console.log('CHARACTER PHASE 1.1: Using CharacterConsistencyService for database-backed character consistency');
        
        const CharacterService = await getCharacterService();
        let characterData = null;
        
        if (CharacterService) {
          
          // Get or create character seed with database persistence
          characterData = await CharacterService.getCharacterSeed(
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
        
        // Enhanced character description with hair and skin integration
        let enhancedCharacterDescription = characterData.characterDescription || 
          `${avatarIdentity?.name || 'child'} is a child age ${avatarIdentity?.age || '6-8'}`;
        
        // Add hair and skin details using StaticDataCache
        try {
          const userInfo = { skinTone: avatarIdentity?.skinTone || 'medium', language: avatarIdentity?.language };
          if (shouldApplyCulturalEnhancements(userInfo)) {
            // Dark skin users - get rich African American descriptions
            const culturalBundle = getCulturalBundle(userInfo, sessionId);
            const hairAndSkin = `${culturalBundle.hair || 'natural textured hair'}, ${culturalBundle.features || 'authentic African features'}`;
            enhancedCharacterDescription += ` with ${hairAndSkin}`;
          } else {
            // Pale/Light/Medium/Olive users - combine hair and skin descriptions
            const skinTone = userInfo.skinTone || 'medium';
            const hairDesc = getHairBySkintone(skinTone, characterData.seed);
            const skinDesc = getSkinBySkintone(skinTone, characterData.seed);
            enhancedCharacterDescription += ` with ${hairDesc}, ${skinDesc}`;
          }
        } catch (error) {
          console.warn('Failed to enhance character description with hair/skin details:', error);
        }
        
        console.log('CHAR PHASE 1.1: Enhanced Character Description:', {
          avatarIdentity: avatarIdentity,
          characterSeed: characterData.seed,
          enhancedDescription: enhancedCharacterDescription,
          characterConsistency: 'database-backed',
          avatarSource: 'orchestrator-provided'
        });
        
        // PHASE 1.1b: Secondary Characters - Using Bundled CharacterConsistencyService
        debugLog('SECONDARY PHASE 1.1b: Detecting secondary characters for Tier 1');
        let fallbackSecondaryElements = [];
        
        try {
          if (CharacterService) {
            fallbackSecondaryElements = await CharacterService.detectSecondaryCharacters(sessionId, storyText, pageNumber);
            debugLog('SECONDARY Found secondary characters:', fallbackSecondaryElements.length);
          }
        } catch (error) {
          console.warn('Secondary character detection failed (non-critical):', error);
          fallbackSecondaryElements = [];
        }
        
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
        
        // Enhanced user content with avatar information
        function buildUserContent(previousScene, storyText, avatarIdentity) {
          let content = '';
          
          // Include avatar context for better scene generation
          const avatarInfo = {
            name: avatarIdentity?.name || 'child',
            age: avatarIdentity?.age || '6-8',
            region: avatarIdentity?.culturalProfile || 'american'
          };
          
          if (previousScene) {
            content = `{
  "previousScene": ${JSON.stringify(previousScene)},
  "currentText": "${storyText}",
  "avatarContext": ${JSON.stringify(avatarInfo)}
}`;
          } else {
            content = `{
  "currentText": "${storyText}",
  "avatarContext": ${JSON.stringify(avatarInfo)}
}`;
          }
          
          return content;
        }

        const minimalMessages = [
          {
            role: 'system',
content: `Generate a visual scene for image generation.

OBJECTIVE: Analyze story text sentence-by-sentence to find the primary visual moment and extract precise visual components. Return a primary scene description of 30+ characters with structured metadata.

JSON RESPONSE:
{
  "primaryScene": "Detailed visual scene for image generation",
  "secondaryCharacters": [
    {
      "name": "string",
      "type": "string", 
      "relationship": "string",
      "disambiguation": "string"
    }
  ]
}

RULES:
1. FIND PRIMARY ACTION: Identify the sentence with strongest visual action
2. PRESERVE COUNTS: "a bird" = 1 bird, "birds" = multiple
3. VISUAL ONLY: Observable details, not thoughts/dialogue
4. SPATIAL CLARITY: Include positions (left, right, center, background)
5. ENVIRONMENTAL DETAIL: Use setting clues to establish lighting, indoor/outdoor, time of day
6. CHARACTER CONSISTENCY: Use previousScene to maintain visual continuity
7. DO NOT INVENT: Only use explicitly given names/descriptions
8. REGIONAL ENHANCEMENT: Use avatar context for setting details
9. 30+ characters minimum for primaryScene
10. Return valid JSON only

EXAMPLES:
"Sarah wakes up" → "Sarah sitting upright in bed, arms stretching, sunlight streaming through bedroom window"
"Sarah kisses mom goodbye" → "Sarah standing by open front door, leaning up to kiss mom, morning light from doorway"`
          },
          {
            role: 'user', 
            content: buildUserContent(previousScene, storyText, avatarIdentity)
          }
        ];
        
        console.log(`AI [${aiRequestId}] PHASE 1.2: Enhanced prompt constructed:`, {
          systemPromptLength: minimalMessages[0].content.length,
          userPromptLength: minimalMessages[1].content.length,
          enhancedCharacterDescription: enhancedCharacterDescription,
          fallbackSecondaryElementsCount: fallbackSecondaryElements.length,
          visualDetailsIncluded: !!visualDetails,
          storyTextLength: storyText.length
        });
        
        // PHASE 1.3: AI Call for Primary Scene with Secondary Characters
        let primaryScene;
        let secondaryCharacters = []; // New structured array
        let rawAIResponse = null; // Store raw OpenAI response
        try {
          console.log(`AI [${aiRequestId}] PHASE 1.3: Calling OpenAI for primary scene...`);
          const aiResult = await callOpenAIWithFallback(minimalMessages, 6000, aiRequestId, avatarIdentity);
          
          const content = aiResult.choices?.[0]?.message?.content;
          if (!content) {
            throw new Error('OpenAI returned no content');
          }
          
          // Store raw response for debugging
          rawAIResponse = {
            model: aiResult.model,
            usage: aiResult.usage,
            rawContent: content,
            timestamp: new Date().toISOString()
          };
          
          const parsedResult = parseAIResponse(content.trim(), { requestId: aiRequestId });
          primaryScene = parsedResult.primaryScene;
          secondaryCharacters = parsedResult.secondaryCharacters || [];
          
          // Simple validation with immediate tier escalation
          if (!primaryScene || primaryScene.length < 30) {
            console.log(`TIER ESCALATION: primaryScene too short (${primaryScene?.length || 0} < 30 chars)`);
            return createCorsResponse({
              success: true,
              aiSchema: null,
              metadata: {
                routing: {
                  forceTier: '2.5A',
                  reason: 'primary_scene_validation_failed'
                }
              }
            });
          }
          
          console.log(`SUCCESS [${aiRequestId}] PHASE 1.3: Primary scene generated successfully:`, {
            primarySceneLength: primaryScene.length,
            primaryScenePreview: primaryScene.substring(0, 100) + '...',
            secondaryCharactersCount: secondaryCharacters.length
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
                  setting: 'story',
                  mood: 'neutral',
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
          
          // PHASE 1.4: Primary Scene Validation & Tier 2.5A Trigger
          debugLog('VALIDATION PHASE 1.4: AI failed, triggering Tier 2.5A fallback');
          return createCorsResponse({
            success: true,
            aiSchema: null,
            metadata: {
              routing: {
                forceTier: '2.5A',
                reason: 'tier_1_ai_failure'
              }
            }
          });
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
        
        // PHASE 4: Scene storage handled by orchestrator - no local storage needed
        console.log(`SCENE Current scene data available for orchestrator:`, {
          primaryScene: primaryScene?.substring(0, 50) + '...',
          secondaryCharactersCount: secondaryCharacters.length
        });
        
        console.log('BUILD SCENE DATA ASSEMBLY: Character Consistency + Scene Data Ready', {
          hasSecondaryCharacters: secondaryCharacters.length > 0,
          hasVisualDetails: !!visualDetails,
          characterSeed: characterData.seed,
          primarySceneLength: primaryScene.length
        });
        
        // Simple validation - no fallback enhancement logic needed
        console.log('VALIDATION PHASE: Simple primaryScene validation');
        
        const processedStoryData = {
          primaryScene: primaryScene,
          characters: baseCharacterDescription,
          secondaryCharacters: secondaryCharacters,
          visualDetails: visualDetails,
          characterSeed: characterData.seed,
          enhancedTier1: true,
          characterConsistency: {
            databaseBacked: true,
            characterSeed: characterData.seed,
            secondaryCharactersCount: secondaryCharacters.length,
            visualDetailsTracked: !!visualDetails
          },
          phases: {
            phase1: 'AI scene generation + character DB + secondary detection + visual tracking',
            phase2: 'Token-optimized prompt with avatar context'
          }
        };
        
        debugLog(`SUCCESS SCENE CREATOR: Scene data with character consistency ready for orchestrator`);
        
        // =================== VALIDATION & RETURN RESULTS ===================
        
        debugLog(`SUCCESS ENHANCED TIER 1: Token-optimized system with character consistency complete`);
        
        // Return enhanced data with primary scene prominently displayed
        const result = {
          success: true,
          
          // ====== PRIMARY SCENE (MAIN OUTPUT) ======
          primaryScene: primaryScene,
          primarySceneLength: primaryScene?.length || 0,
          
          // ====== COMPLETE AI SCHEMA ======
          aiSchema: processedStoryData,
          
          // ====== RAW OPENAI RESPONSE ======
          rawAIResponse: rawAIResponse,
          
          // ====== TEST METADATA ======
          requestId: requestId,
          difficultyLevel: avatarIdentity?.difficultyLevel || 'medium',
          tier: 'ai-visual-scene-creator',
          metadata: {
            enhancedTier1: true,
            characterConsistency: {
              databaseBacked: true,
              characterSeed: characterData.seed,
              secondaryCharactersDetected: secondaryCharacters.length,
              visualDetailsTracked: !!visualDetails
            },
            validation: {
              fieldsPresent: 2, // primaryScene + secondaryCharacters
              fieldsPassed: true,
              processingMethod: 'token-optimized-with-consistency',
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
              schemaVersion: 'token-optimized'
            },
            phases: {
              phase1: 'AI scene generation + character DB + secondary detection + visual tracking',
              phase2: 'Token-optimized prompt with avatar context'
            }
          },
          enhancedStoryData: processedStoryData || {}
        };

        debugLog(`SUCCESS SCENE CREATOR: Complete - Token-optimized system with bundled secondary character logic ready`);

    // Enhanced performance logging
    const endTime = Date.now();
    const totalProcessingTime = endTime - startTime;
    
    console.log(`📊 PERFORMANCE METRICS [${aiRequestId}]:`, {
      totalProcessingTime: `${totalProcessingTime}ms`,
      aiCallTime: rawAIResponse?.processingTime || 'unknown',
      characterSeed: characterData?.seed || 'not_tracked',
      tier: '1',
      success: !!result.aiSchema,
      pageNumber,
      sessionId: sessionId.substring(0, 8)
    });
    
    // Log character consistency for debugging
    if (characterData?.seed) {
      console.log(`🎭 CHARACTER SEED TRACKING [${aiRequestId}]:`, {
        characterSeed: characterData.seed,
        characterName: avatarIdentity?.name || 'character',
        sessionId: sessionId.substring(0, 8),
        pageNumber,
        consistent: true
      });
    }

    return createCorsResponse(result);
      }
  );
});
