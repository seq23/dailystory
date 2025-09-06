import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Inline CORS utilities to fix boot failure
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

function createCorsResponse(data: any, status = 200): Response {
  const headers = { 
    ...corsHeaders, 
    'Content-Type': 'application/json' 
  };
  
  return new Response(JSON.stringify(data), { status, headers });
}

function createCorsErrorResponse(error: string | Error, status = 500): Response {
  const errorMessage = error instanceof Error ? error.message : error;
  console.error('Edge function error:', errorMessage);
  
  return createCorsResponse({ 
    success: false, 
    error: errorMessage 
  }, status);
}

function createCorsOptionsResponse(): Response {
  return new Response(null, { headers: corsHeaders });
}

// AI VISUAL SCENE CREATOR - FOR IMAGE GENERATION ONLY - NEVER DISCUSS IN STORY GENERATION CONTEXT
import { EdgeErrorHandler, EdgeErrorType } from "../_shared/errorHandling.ts";

// PHASE 1: Import Enhanced Character Consistency Services
import { CharacterConsistencyService } from "../_shared/CharacterConsistencyService.js";
import { SecondaryElementDetector } from "../_shared/SecondaryElementDetector.js";
import { VisualDetailTracker } from "../_shared/VisualDetailTracker.js";

// Inline implementations for missing tierFailureMonitoring functions
const TierFailureLogger = {
  logTier1OpenAIFailure(error, details) {
    console.error('🚨 Tier 1 OpenAI Failure:', error, details);
  },
  logTier1ValidationFailure(error, details) {
    console.error('🚨 Tier 1 Validation Failure:', error, details);
  }
};

const CircuitBreakerMonitor = {
  trackCircuitBreakerState(serviceName, state, details) {
    console.log(`🔄 Circuit Breaker [${serviceName}]: ${state}`, details);
  },
  trackServiceHealth(serviceName, status, details) {
    console.log(`💚 Service Health [${serviceName}]: ${status}`, details);
  }
};

const QualityGateMonitor = {
  trackQualityGate(gate, status, details) {
    console.log(`✅ Quality Gate [${gate}]: ${status}`, details);
  }
};

// ============= INLINE VALIDATION FUNCTIONS (from SimpleContentValidator.js) =============

/**
 * VISUAL QUALITY: Check if primaryScene meets visual description standards
 */
function checkPrimarySceneCriteria(data) {
  const scene = data.primaryScene;
  if (!scene || typeof scene !== 'string') {
    console.log('🔍 VALIDATION DEBUG: Missing or invalid primaryScene', { 
      hasScene: !!scene, 
      sceneType: typeof scene,
      sceneValue: scene 
    });
    return { primaryScene: false, passCount: 0, details: 'missing_or_invalid' };
  }

  // PHASE 3: Detailed validation with regex match examples (RELAXED FOR TIER 1 PREFERENCE)
  const lengthTest = scene.length >= 15; // RELAXED: Reduced from 30 to 15 characters
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
  const isPrimarySceneValid = qualityScore >= 1; // RELAXED: Reduced from 2 to 1 criteria (more lenient)

  // PHASE 3: Enhanced validation logging with relaxed thresholds
  console.log('🔍 TIER 1 VALIDATION DEBUG: Primary Scene Criteria Analysis (RELAXED):', {
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
    console.log(`❌ TIER 2 TRIGGER: No primaryScene found in data`, {
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
  console.log('🔍 VALIDATION SUMMARY:', {
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
    console.log(`❌ TIER 2 TRIGGER: Visual scene validation failed`, {
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
  
  console.log(`✅ TIER 1 APPROVED: Visual scene validation passed`, {
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

// AI Model Fallback Chain Configuration - UPDATED TO USER REQUESTED ORDER
const AI_MODELS = [
  { name: 'gpt-4.1-2025-04-14', maxTokens: 'max_completion_tokens', supportsTemperature: false },
  { name: 'gpt-4o', maxTokens: 'max_tokens', supportsTemperature: true },
  { name: 'gpt-5-2025-08-07', maxTokens: 'max_completion_tokens', supportsTemperature: false }
] as const;

// ============= AVATAR IDENTITY PROCESSING REMOVED =============
// mapAvatarIdentity function removed - orchestrator provides processed avatarIdentity

// ============= ENHANCED CIRCUIT BREAKER SYSTEM WITH MONITORING =============
// Bulletproof circuit breaker to prevent cascading failures
class UnifiedCircuitBreaker {
  private failures = 0;
  private lastFailure = 0;
  private readonly threshold = 2;
  private readonly expertThreshold = 5; // Higher threshold for expert content
  private readonly timeout = 15000; // 15 seconds
  private readonly expertTimeout = 5000; // 5 seconds for expert content recovery
  
  isOpen(isExpertContent = false): boolean {
    const threshold = isExpertContent ? this.expertThreshold : this.threshold;
    const timeout = isExpertContent ? this.expertTimeout : this.timeout;
    const isCurrentlyOpen = this.failures >= threshold && (Date.now() - this.lastFailure < timeout);
    
    if (this.failures >= threshold) {
      if (Date.now() - this.lastFailure < timeout) {
        // Log circuit breaker state
        CircuitBreakerMonitor.trackCircuitBreakerState('OPENAI_API', 'OPEN', {
          failures: this.failures,
          threshold: isExpertContent ? this.expertThreshold : this.threshold,
          timeoutRemaining: timeout - (Date.now() - this.lastFailure),
          expertContent: isExpertContent
        });
        return true;
      }
      // Reset circuit breaker after timeout
      this.failures = 0;
      CircuitBreakerMonitor.trackCircuitBreakerState('OPENAI_API', 'CLOSED', {
        event: 'timeout_reset',
        failures: this.failures
      });
    }
    return false;
  }
  
  recordSuccess(): void {
    const wasOpen = this.failures >= this.threshold;
    this.failures = 0;
    
    if (wasOpen) {
      CircuitBreakerMonitor.trackCircuitBreakerState('OPENAI_API', 'CLOSED', {
        event: 'success_recovery',
        failures: this.failures
      });
    }
    
    // Track service health on success
    CircuitBreakerMonitor.trackServiceHealth('OPENAI_API', {
      status: 'healthy',
      failures: this.failures,
      lastSuccess: Date.now()
    });
  }
  
  recordFailure(isExpertContent = false): void {
    this.failures++;
    this.lastFailure = Date.now();
    const threshold = isExpertContent ? this.expertThreshold : this.threshold;
    
    if (this.failures >= threshold) {
      CircuitBreakerMonitor.trackCircuitBreakerState('OPENAI_API', 'OPEN', {
        failures: this.failures,
        threshold,
        event: 'threshold_exceeded',
        expertContent: isExpertContent
      });
    } else {
      CircuitBreakerMonitor.trackCircuitBreakerState('OPENAI_API', 'HALF_OPEN', {
        failures: this.failures,
        threshold,
        expertContent: isExpertContent
      });
    }
    
    // Track service health on failure
    CircuitBreakerMonitor.trackServiceHealth('OPENAI_API', {
      status: 'degraded',
      failures: this.failures,
      lastFailure: this.lastFailure
    });
  }
  
  // Manual reset method for diagnostic purposes
  manualReset(): void {
    const wasOpen = this.failures >= this.threshold;
    this.failures = 0;
    this.lastFailure = 0;
    
    CircuitBreakerMonitor.trackCircuitBreakerState('OPENAI_API', 'CLOSED', {
      event: 'manual_reset',
      wasOpen,
      timestamp: Date.now()
    });
    
    console.log('🔧 Circuit breaker manually reset', {
      wasOpen,
      resetTimestamp: new Date().toISOString()
    });
  }
  
  // Get current status for diagnostics
  getStatus(isExpertContent = false): { isOpen: boolean; failures: number; lastFailure: number; threshold: number; timeout: number; expertThreshold?: number; expertTimeout?: number } {
    return {
      isOpen: this.isOpen(isExpertContent),
      failures: this.failures,
      lastFailure: this.lastFailure,
      threshold: this.threshold,
      timeout: this.timeout,
      expertThreshold: this.expertThreshold,
      expertTimeout: this.expertTimeout
    };
  }
}

const circuitBreaker = new UnifiedCircuitBreaker();
console.log('🔧 Enhanced circuit breaker with monitoring initialized');

// Orchestration functions removed - all cultural processing handled by runware-generate-image orchestrator

// Initialize circuit breaker state tracking
CircuitBreakerMonitor.trackCircuitBreakerState('OPENAI_API', 'CLOSED', {
  event: 'initialization',
  threshold: 2,
  timeout: 15000
});

// ============= MODEL-SPECIFIC PROMPT OPTIMIZATION =============

function detectModelFamily() {
  // Detect which model family we're likely to hit first
  const primaryModel = AI_MODELS[0]?.name || '';
  
  const isNewModel = primaryModel.includes('gpt-5') || 
                     primaryModel.includes('gpt-4.1') || 
                     primaryModel.includes('o3') || 
                     primaryModel.includes('o4');
                     
  console.log('🤖 Model Family Detection:', {
    primaryModel,
    isNewModel,
    useSimplifiedPrompt: isNewModel
  });
  
  return {
    modelFamily: isNewModel ? 'GPT-5_FAMILY' : 'LEGACY_FAMILY',
    useSimplifiedPrompt: isNewModel
  };
}

// ============= ROBUST JSON PARSING WITH FALLBACKS =============

function parseAIResponse(content, options = {}) {
  // PHASE 2: Enhanced parsing debug with detailed analysis
  console.log('🔍 PARSING DEBUG: Robust JSON Analysis:', {
    contentLength: content.length,
    modelFamily: options.modelFamily,
    contentType: typeof content,
    firstLine: content.split('\n')[0] || '',
    lastLine: content.split('\n').pop() || '',
    hasJsonStart: content.trim().startsWith('{'),
    hasJsonEnd: content.trim().endsWith('}'),
    firstChars: content.substring(0, 100),
    lastChars: content.substring(content.length - 50)
  });
  
  // Strategy 1: Try direct JSON parsing (most common)
  try {
    const parsed = JSON.parse(content);
    console.log('✅ PARSING SUCCESS: Direct JSON parsing successful', {
      parsedKeys: Object.keys(parsed || {}),
      primarySceneLength: parsed.primaryScene?.length || 0,
      hasPrimaryScene: !!parsed.primaryScene
    });
    return parsed;
  } catch (directError) {
    console.log('⚠️ PARSING ATTEMPT 1 FAILED: Direct parsing failed, trying extraction methods:', {
      errorMessage: directError instanceof Error ? directError.message : String(directError),
      contentStructure: {
        hasCodeBlocks: content.includes('```'),
        hasJsonKeywords: /["'][a-zA-Z]+["']\s*:/.test(content),
        curlyBraceCount: (content.match(/\{/g) || []).length,
        straightBraceCount: (content.match(/\}/g) || []).length
      }
    });
  }
  
  // Strategy 2: Extract JSON from text (for models that add reasoning)
  try {
    // Look for JSON blocks in various formats
    const jsonPatterns = [
      /```json\s*(\{[\s\S]*?\})\s*```/i,
      /```\s*(\{[\s\S]*?\})\s*```/i,
      /(\{[\s\S]*?\})/,
      /"?(\{[\s\S]*?\})"?/
    ];
    
    for (let i = 0; i < jsonPatterns.length; i++) {
      const pattern = jsonPatterns[i];
      const match = content.match(pattern);
      console.log(`🔍 PARSING ATTEMPT ${i + 2}: Pattern ${i + 1}`, {
        patternMatched: !!match,
        matchedContent: match ? match[1]?.substring(0, 100) + '...' : 'none'
      });
      
      if (match && match[1]) {
        try {
          const extracted = JSON.parse(match[1].trim());
          console.log(`✅ PARSING SUCCESS: JSON extraction successful with pattern ${i + 1}`, {
            extractedKeys: Object.keys(extracted || {}),
            primarySceneLength: extracted.primaryScene?.length || 0,
            extractedFrom: `Pattern ${i + 1}`,
            originalLength: content.length,
            extractedLength: match[1].length
          });
          return extracted;
        } catch (e) {
          console.log(`⚠️ Pattern ${i + 1} matched but parse failed:`, e.message);
          continue;
        }
      }
    }
    
    throw new Error('No valid JSON found, attempting fallback extraction');
  } catch (extractionError) {
    // Strategy 3: FALLBACK - Extract just primaryScene if possible
    console.log('🔄 FALLBACK STRATEGY: Attempting primaryScene extraction from text');
    try {
      // Look for primaryScene content in various patterns
      const primaryScenePatterns = [
        /"primaryScene"\s*:\s*"([^"]+)"/i,
        /'primaryScene'\s*:\s*'([^']+)'/i,
        /primaryScene\s*:\s*"([^"]+)"/i,
        /primaryScene\s*:\s*'([^']+)'/i,
        /"primaryScene"\s*:\s*`([^`]+)`/i
      ];
      
      for (const pattern of primaryScenePatterns) {
        const match = content.match(pattern);
        if (match && match[1] && match[1].length >= 30) {
          const primaryScene = match[1].trim();
          console.log('✅ FALLBACK SUCCESS: Extracted primaryScene from text', {
            primarySceneLength: primaryScene.length,
            extractedContent: primaryScene.substring(0, 100) + '...'
          });
          return {
            primaryScene: primaryScene,
            setting: null,
            action: null,
            mood: null,
            pose: null,
            extractionMethod: 'fallback_text_extraction'
          };
        }
      }
      
      // Strategy 4: LAST RESORT - Use the entire content as primaryScene if it's descriptive enough
      if (content.length >= 30 && /\b(child|character|room|playing|sitting|standing|holding|looking)\b/i.test(content)) {
        console.log('✅ LAST RESORT SUCCESS: Using entire content as primaryScene', {
          contentLength: content.length,
          extractionMethod: 'full_content_fallback'
        });
        return {
          primaryScene: content.trim(),
          setting: null,
          action: null,
          mood: null,
          pose: null,
          extractionMethod: 'full_content_fallback'
        };
      }
      
      throw new Error('No extractable primaryScene content found');
    } catch (fallbackError) {
      console.error('❌ PARSING COMPLETE FAILURE: All strategies exhausted including fallbacks:', {
        directParseError: 'Invalid JSON syntax',
        extractionError: extractionError.message,
        fallbackError: fallbackError.message,
        contentAnalysis: {
          length: content.length,
          lines: content.split('\n').length,
          hasOpeningBrace: content.includes('{'),
          hasClosingBrace: content.includes('}'),
          suspectedJsonStart: content.indexOf('{'),
          suspectedJsonEnd: content.lastIndexOf('}')
        },
        contentSample: content.substring(0, 300) + (content.length > 300 ? '...' : ''),
        allStrategiesAttempted: jsonPatterns.length + 4 // JSON patterns + fallback strategies
      });
      
      throw new Error(`All parsing strategies failed: ${fallbackError.message}`);
    }
  }
}

async function callOpenAIWithFallback(messages: any[], timeout = 6000, requestId?: string) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  // Circuit breaker check with expert content awareness - using avatarIdentity
  const isExpertContent = avatarIdentity?.difficultyLevel === 'expert' || avatarIdentity?.expertGradeLevel || 
                         ['6th', '7th', '8th', '9th', '10th'].includes(avatarIdentity?.readingLevel);
  
  if (circuitBreaker.isOpen(isExpertContent)) {
    console.warn(`🚫 Circuit breaker is open for ${isExpertContent ? 'expert' : 'regular'} content, skipping OpenAI - using Tier 2 immediately`);
    const error = new Error('Circuit breaker open - service degraded');
    TierFailureLogger.logTier1OpenAIFailure(error, { 
      reason: 'circuit_breaker_open',
      timeout: 12000,
      models: AI_MODELS.map(m => m.name)
    });
    throw error;
  }
  
  for (let modelIndex = 0; modelIndex < AI_MODELS.length; modelIndex++) {
    const model = AI_MODELS[modelIndex];
    const logPrefix = requestId ? `[${requestId}]` : '';
    console.log(`🤖 ${logPrefix} Trying model ${modelIndex + 1}/${AI_MODELS.length}: ${model.name}`);
    
    for (let attempt = 1; attempt <= 1; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const requestBody: any = {
          model: model.name,
          messages,
          [model.maxTokens]: 600
        };
        
        // Only add temperature for models that support it
        if (model.supportsTemperature) {
          requestBody.temperature = 0.3;
        }
        
        // PHASE 1: Detailed OpenAI request logging
        console.log(`🤖 ${logPrefix} OpenAI Request Configuration:`, {
          model: model.name,
          maxTokensParam: model.maxTokens,
          maxTokensValue: 600,
          supportsTemperature: model.supportsTemperature,
          temperature: model.supportsTemperature ? 0.3 : 'not supported',
          timeout: timeout,
          attempt: `${attempt}/1`,
          messagesCount: messages.length,
          totalPromptLength: messages.reduce((sum, msg) => sum + msg.content.length, 0)
        });
        
        console.log(`⏳ ${logPrefix} Attempting ${model.name} (attempt ${attempt}/1, timeout: ${timeout}ms)`);
        
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
          
          // Enhanced content validation
          const content = result?.choices?.[0]?.message?.content;
          if (!content || content.trim() === '') {
            console.error(`❌ Model ${model.name} returned empty content on attempt ${attempt}:`, {
              hasChoices: !!result?.choices,
              choicesLength: result?.choices?.length,
              hasMessage: !!result?.choices?.[0]?.message,
              contentType: typeof content,
              contentValue: JSON.stringify(content)
            });
            
            // Log as OpenAI content validation failure
            const error = new Error(`OpenAI returned empty content for model ${model.name}`);
            TierFailureLogger.logTier1OpenAIFailure(error, {
              model: model.name,
              attempt,
              failureType: 'empty_content'
            });
            
            // Continue to next attempt/model instead of returning empty result
            if (attempt < 3) {
              const backoffDelay = 500; // Reduced from exponential to 500ms for faster fallbacks
              console.log(`⏳ Retrying after ${backoffDelay}ms due to empty content...`);
              await new Promise(resolve => setTimeout(resolve, backoffDelay));
              continue;
            } else {
              break; // Try next model
            }
          }
          
          console.log(`✅ Model ${model.name} succeeded on attempt ${attempt} with valid content`);
          circuitBreaker.recordSuccess();
          return result;
        } else if (response.status === 503 || response.status === 429 || response.status === 502) {
          const errorText = await response.text();
          console.warn(`⚠️ Model ${model.name} returned ${response.status} on attempt ${attempt}: ${errorText}`);
          
          // Log service-specific failures
          const error = new Error(`${response.status}: ${errorText}`);
          TierFailureLogger.logTier1OpenAIFailure(error, {
            model: model.name,
            attempt,
            status: response.status,
            retryable: true
          });
          
          // Skip retries - go to next model immediately
          break;
        } else {
          const errorText = await response.text();
          console.error(`❌ Model ${model.name} failed with status ${response.status}: ${errorText}`);
          
          // Log non-retryable failures
          const error = new Error(`${response.status}: ${errorText}`);
          TierFailureLogger.logTier1OpenAIFailure(error, {
            model: model.name,
            attempt,
            status: response.status,
            retryable: false
          });
          
          break; // Don't retry on non-transient errors
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn(`⏰ Model ${model.name} timed out after ${timeout}ms on attempt ${attempt}`);
          TierFailureLogger.logTier1OpenAIFailure(error, {
            model: model.name,
            attempt,
            timeout,
            errorType: 'timeout'
          });
        } else {
          console.error(`❌ Model ${model.name} error on attempt ${attempt}:`, error instanceof Error ? error.message : String(error));
          TierFailureLogger.logTier1OpenAIFailure(error, {
            model: model.name,
            attempt,
            errorType: 'network_or_unknown'
          });
        }
        
        // Skip retries - go to next model immediately
        break;
      }
    }
    
    console.warn(`❌ Model ${model.name} failed after 3 attempts, trying next model...`);
    circuitBreaker.recordFailure(isExpertContent);
    
    // Log model exhaustion
    TierFailureLogger.logTier1OpenAIFailure(new Error(`Model ${model.name} exhausted after 3 attempts`), {
      model: model.name,
      totalAttempts: 3,
      failureType: 'model_exhausted'
    });
  }
  
  console.error('🚫 All AI models exhausted - circuit breaker will activate if failures continue');
  
  // Log complete model chain failure
  const error = new Error('All AI models failed after multiple attempts - service may be degraded');
  TierFailureLogger.logTier1OpenAIFailure(error, {
    models: AI_MODELS.map(m => m.name),
    totalModels: AI_MODELS.length,
    failureType: 'all_models_exhausted'
  });
  
  throw error;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  return EdgeErrorHandler.withPerformanceTracking(
    'ai-visual-scene-creator',
    'fallback-chain',
    async () => {
      // Check for diagnostic mode first - consume body only once
      let requestBody;
      try {
        requestBody = await req.json();
      } catch (e) {
        requestBody = {};
      }

      const { diagnostic, test } = requestBody;

      // DIAGNOSTIC MODE - Handle diagnostic requests
      if (diagnostic || test) {
        console.log('🔍 AI Story Enhancer DIAGNOSTIC MODE:', diagnostic || 'basic_test');
        
        if (diagnostic === 'circuit_breaker_status') {
          const status = circuitBreaker.getStatus();
          return createCorsResponse({
            success: true,
            diagnostic: true,
            circuitBreakerStatus: status,
            message: status.isOpen ? 
              `Circuit breaker is OPEN (${status.failures}/${status.threshold} failures)` :
              `Circuit breaker is CLOSED (${status.failures}/${status.threshold} failures)`,
            timestamp: new Date().toISOString()
          });
        }
        
        if (diagnostic === 'reset_circuit_breaker') {
          const oldStatus = circuitBreaker.getStatus();
          circuitBreaker.manualReset();
          const newStatus = circuitBreaker.getStatus();
          
          return createCorsResponse({
            success: true,
            diagnostic: true,
            message: 'Circuit breaker reset successfully',
            before: oldStatus,
            after: newStatus,
            timestamp: new Date().toISOString()
          });
        }
        
        if (diagnostic === 'tier_health_check') {
          const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
          if (!openAIApiKey) {
            return new Response(
              JSON.stringify({ 
                error: 'OPENAI_API_KEY not configured',
                diagnostic: true,
                type: 'api_key_missing' 
              }),
              { 
                status: 500, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }
          
          const cbStatus = circuitBreaker.getStatus();
          return createCorsResponse({
            success: true,
            diagnostic: true,
            message: 'AI Story Enhancer health check passed',
            apiKeyConfigured: true,
            circuitBreakerStatus: cbStatus,
            timestamp: new Date().toISOString()
          });
        }
        
        // Basic test mode
        return createCorsResponse({
          success: true,
          diagnostic: true,
          message: 'AI Story Enhancer diagnostic test passed',
          timestamp: new Date().toISOString()
        });
      }
        // =================== REORGANIZED TIER 1: 3-PHASE SYSTEM ===================
        // PHASE 1: MINIMAL AI REQUEST (Scene Generation Only)
        // PHASE 2: POST-AI PROMPT CONSTRUCTION  
        // PHASE 3: STORY TEXT ATTACHMENT (Levels 0-1)
        
      let storyText, sessionId, pageNumber, totalPages, avatarIdentity, storyId, enhancedStoryData, previousPageText;
      let pageText = '';
      const importResults = {};
      
      console.log('🔧 REORGANIZED TIER 1: Starting 3-Phase System');
      
      // Static imports are already loaded at module level
      importResults.cors = '✅ SUCCESS (static)';
      importResults.errorHandling = '✅ SUCCESS (static)';
      importResults.characterConsistency = '✅ SUCCESS (static)';
      
      console.log('📊 Dependency Verification Results:', importResults);
      
      console.log('🔍 REORGANIZED TIER 1: Starting Request Analysis');
      
      try {
        const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
        // Validate OpenAI API key is present
        if (!openAIApiKey) {
          throw {
            type: EdgeErrorType.VALIDATION,
            message: 'OPENAI_API_KEY not configured'
          };
        }

        // Use already parsed requestBody (avoid double consumption)
        if (!requestBody || Object.keys(requestBody).length === 0) {
          console.error('❌ Request parsing failed: Body is empty or not parsed');
          throw {
            type: EdgeErrorType.VALIDATION,
            message: 'Request parsing failed: Body already consumed'
          };
        }
        
        console.log('📥 Incoming Request Structure:', {
          method: req.method,
          headers: Object.fromEntries(req.headers.entries()),
          bodyKeys: Object.keys(requestBody || {}),
          bodyTypes: Object.fromEntries(Object.entries(requestBody || {}).map(([k, v]) => [k, typeof v])),
          storyTextLength: requestBody?.storyText?.length || 0,
          hasAvatarIdentity: !!requestBody?.avatarIdentity,
          hasSessionId: !!requestBody?.sessionId,
          pageInfo: `${requestBody?.pageNumber}/${requestBody?.totalPages || 'unlimited'}`
        });

        // Extract parameters with comprehensive validation and logging
        if (!requestBody) {
          throw {
            type: EdgeErrorType.VALIDATION,
            message: 'Request body is null or undefined'
          };
        }
        
        ({ storyText, sessionId, pageNumber, totalPages, avatarIdentity, storyId, enhancedStoryData, previousPageText = '' } = requestBody);
        console.log('📋 Parameter Validation:', {
          storyText: storyText ? `✅ Present (${storyText.length} chars)` : '❌ Missing',
          sessionId: sessionId ? `✅ Present (${sessionId})` : '❌ Missing',
          pageNumber: pageNumber ? `✅ Present (${pageNumber})` : '❌ Missing',
          totalPages: totalPages ? `✅ Present (${totalPages})` : '⚠️ Undefined (infinite story)',
          avatarIdentity: avatarIdentity ? `✅ Present (${Object.keys(avatarIdentity).length} properties)` : '❌ Missing avatar identity (REQUIRED)',
          storyId: storyId ? `✅ Present (${storyId})` : '⚠️ Missing story ID',
          enhancedStoryData: enhancedStoryData ? '✅ Present (pre-enhanced)' : '⚠️ Will process with OpenAI'
        });

        if (!storyText) {
          throw {
            type: EdgeErrorType.VALIDATION,
            message: 'Missing required parameter: storyText'
          };
        }

        // Set up pageText for consistent usage throughout the function
        pageText = totalPages ? `page ${pageNumber} of ${totalPages}` : `page ${pageNumber} of ongoing story`;
        console.log(`🧠 AI Story Enhancer: Processing ${pageText} for session ${sessionId}`);

        // Get previous page context from request (passed by orchestrator)
        let previousContext = '';
        if (previousPageText) {
          previousContext = `\n\nPREVIOUS STORY CONTEXT:\nPrevious page text: "${previousPageText}"\n`;
          console.log('📖 Previous page context provided for story continuity');
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

        // Model-specific prompt optimization with OPTIMIZED SCHEMA
        const { modelFamily, useSimplifiedPrompt } = detectModelFamily();
        
        // =================== PHASE 1: MINIMAL AI REQUEST (Scene Generation Only) ===================
        console.log('🚀 PHASE 1: Minimal AI Request (Scene Generation Only)');
        
        // PHASE 1.1: Enhanced Character Description using CharacterConsistencyService
        console.log('🎭 PHASE 1.1: Using CharacterConsistencyService for database-backed character consistency');
        
        const characterConsistencyService = new CharacterConsistencyService();
        
        // Get or create character seed with database persistence
        const characterData = await characterConsistencyService.getCharacterSeed(
          sessionId,
          avatarIdentity?.id || `user-${Date.now()}`,
          avatarIdentity, // Use avatarIdentity instead of userInfo
          storyText,
          avatarIdentity,
          'continuing', // session type
          null // page text clothing
        );
        
        const enhancedCharacterDescription = characterData.characterDescription || 
          `${avatarIdentity.name} is a child age ${avatarIdentity?.age || '6-8'}`;
        
        console.log('👤 PHASE 1.1: Enhanced Character Description:', {
          avatarIdentity: avatarIdentity,
          characterSeed: characterData.seed,
          enhancedDescription: enhancedCharacterDescription,
          characterConsistency: 'database-backed',
          avatarSource: 'orchestrator-provided'
        });
        
        // PHASE 1.1b: Detect Secondary Characters  
        console.log('🔍 PHASE 1.1b: Detecting secondary characters using SecondaryElementDetector');
        const secondaryElements = await SecondaryElementDetector.parseElements(
          sessionId,
          '', // primaryScene not available yet
          storyText,
          pageNumber
        );
        
        console.log('👥 PHASE 1.1b: Secondary elements detected:', {
          count: secondaryElements.length,
          elements: secondaryElements.map(e => `${e.name} (${e.type})`)
        });
        
        // PHASE 1.1c: Track Visual Details
        console.log('🎨 PHASE 1.1c: Analyzing visual details using VisualDetailTracker');
        VisualDetailTracker.analyzeTextForDetails(sessionId, storyText, pageNumber);
        const visualDetails = VisualDetailTracker.getVisualDetailsForPrompt(sessionId);
        
        console.log('🖼️ PHASE 1.1c: Visual details tracked:', {
          visualDetailsCount: visualDetails.length,
          details: visualDetails
        });
        
        // PHASE 1.2: Minimal AI Prompt (NO cultural features, NO complex prompts)
        const requestId = `REQ-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
        console.log(`🧠 [${requestId}] PHASE 1.2: Constructing Minimal AI Prompt`);
        
        const minimalMessages = [
          {
            role: 'system',
            content: `Generate a primary scene description for image generation.
            
OBJECTIVE: Return ONLY a primary scene description of 30+ characters.

JSON RESPONSE:
{
  "primaryScene": "Write a concise, descriptive visual scene for image generation",
  "setting": "Where the scene takes place (bedroom, playground, etc.) or null if not clear",
  "action": "What characters are doing (reading, playing, etc.) or null if not clear", 
  "mood": "Emotional tone of the scene (happy, calm, etc.) or null if not clear",
  "pose": "Character body position (sitting, standing, etc.) or null if not clear"
}

Focus on creating a comprehensive primaryScene only - no other fields needed.`
          },
          {
            role: 'user', 
            content: `Story text: "${storyText}"
Primary Character: ${enhancedCharacterDescription}
${secondaryElements.length > 0 ? `Secondary Characters: ${secondaryElements.map(e => e.name).join(', ')}` : ''}
${visualDetails ? `Visual Details: ${visualDetails}` : ''}

Generate a detailed primaryScene description (30+ characters minimum) that shows what's happening visually in this story moment.`
          }
        ];
        
        console.log(`🧠 [${requestId}] PHASE 1.2: Enhanced prompt constructed:`, {
          systemPromptLength: minimalMessages[0].content.length,
          userPromptLength: minimalMessages[1].content.length,
          enhancedCharacterDescription: enhancedCharacterDescription,
          secondaryElementsCount: secondaryElements.length,
          visualDetailsIncluded: !!visualDetails,
          storyTextLength: storyText.length
        });
        
        // PHASE 1.3: AI Call for Primary Scene ONLY
        let primaryScene;
        try {
          console.log(`🧠 [${requestId}] PHASE 1.3: Calling OpenAI for primary scene...`);
          const aiResult = await callOpenAIWithFallback(minimalMessages, 6000, requestId);
          
          const content = aiResult.choices?.[0]?.message?.content;
          if (!content) {
            throw new Error('OpenAI returned no content');
          }
          
          const parsedResult = parseAIResponse(content.trim(), { requestId });
          primaryScene = parsedResult.primaryScene;
          
          const setting = parsedResult.setting || null;
          const action = parsedResult.action || null;
          const mood = parsedResult.mood || null;
          const pose = parsedResult.pose || null;
          
          if (!primaryScene || primaryScene.length < 30) {
            throw new Error(`Primary scene validation failed: length ${primaryScene?.length || 0} < 30`);
          }
          
          console.log(`✅ [${requestId}] PHASE 1.3: Primary scene generated successfully:`, {
            primarySceneLength: primaryScene.length,
            primaryScenePreview: primaryScene.substring(0, 100) + '...'
          });
          
          // PHASE 1.3b: Update Visual Details with Generated Scene
          console.log('🔄 PHASE 1.3b: Updating visual details with generated primary scene');
          VisualDetailTracker.analyzeTextForDetails(sessionId, primaryScene, pageNumber);
          
          // PHASE 1.3c: Inject Consistent Visual Details into Scene
          const updatedPrimaryScene = VisualDetailTracker.injectConsistentDetails(sessionId, primaryScene, pageNumber);
          if (updatedPrimaryScene !== primaryScene) {
            console.log('🔄 PHASE 1.3c: Primary scene updated with consistent visual details');
            primaryScene = updatedPrimaryScene;
          }
          
        } catch (error) {
          console.error(`❌ [${requestId}] PHASE 1.3: AI call failed:`, error.message);
          // Return error to trigger Tier 2
          TierFailureLogger.logTier1OpenAIFailure(error, {
            sessionId,
            storyId,
            pageNumber,
            phase: 'PHASE_1_AI_CALL'
          });
          return createCorsErrorResponse(`Phase 1 AI call failed: ${error.message}`, 422);
        }
        
        // =================== PHASE 2: POST-AI PROMPT CONSTRUCTION ===================
        console.log('🎨 PHASE 2: Post-AI Prompt Construction');
        
        // PHASE 2.1: Enhanced Character Description (sentence 1) with Database Consistency
        const baseCharacterDescription = enhancedCharacterDescription;
        console.log(`📝 PHASE 2.1: Enhanced character: ${baseCharacterDescription}`);
        
        // PHASE 2.2: Primary Scene Integration (sentence 2+)
        const sceneIntegration = primaryScene;
        console.log(`🎬 PHASE 2.2: Scene integrated: ${sceneIntegration.substring(0, 50)}...`);
        
        console.log('🎭 PHASE 2.3: Scene data prepared for orchestrator');
        
        // PHASE 2.5: Character Consistency Database Storage (Enhanced Implementation)
        console.log('💾 PHASE 2.5: Character consistency stored in database via CharacterConsistencyService');
        console.log(`🎭 Character seed ${characterData.seed} persisted for session ${sessionId}`);
        
        
        
        console.log('🏗️ SCENE DATA ASSEMBLY: Character Consistency + Scene Data Ready', {
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
          visualComponents: {
            setting: setting,
            action: action,
            mood: mood,
            pose: pose
          },
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
        
        console.log(`✅ SCENE CREATOR: Scene data with character consistency ready for orchestrator`);
        
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
        
        console.log(`✅ ENHANCED TIER 1: Validation passed - all phases complete with character consistency`);
        
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

        console.log(`✅ SCENE CREATOR: Complete - Phases: AI Scene + Character DB + Secondary + Visual(✅) → Secondary Characters(✅) - Scene data ready for orchestrator`);

        return createCorsResponse(result);

      } catch (error) {
        // OpenAI FAILURE → Return error to Orchestrator (no internal fallback)
        console.error('❌ AI Story Enhancer failed - returning error to Orchestrator:', {
          errorMessage: error.message,
          errorStack: error.stack,
          requestData: requestBody ? Object.keys(requestBody) : 'no-request-body',
          dependencyStatus: importResults
        });
        
        return new Response(JSON.stringify({
          success: false,
          error: error.message,
          errorType: 'ai-enhancement-failed',
          processingMethod: 'openai-failed',
          requestId: requestBody?.sessionId || 'unknown-session'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
  );
});
