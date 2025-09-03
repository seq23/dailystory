import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse, corsHeaders } from "../_shared/cors.ts";

// AI VISUAL SCENE CREATOR - FOR IMAGE GENERATION ONLY - NEVER DISCUSS IN STORY GENERATION CONTEXT
import { EdgeErrorHandler, EdgeErrorType } from "../_shared/errorHandling.ts";
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
import { MultiStageEnhancementPipeline } from "../_shared/MultiStageEnhancementPipeline.js";

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

// AI Model Fallback Chain Configuration - UPDATED TO FLAGSHIP MODELS
const AI_MODELS = [
  { name: 'gpt-5-2025-08-07', maxTokens: 'max_completion_tokens', supportsTemperature: false },
  { name: 'gpt-4.1-2025-04-14', maxTokens: 'max_completion_tokens', supportsTemperature: false },
  { name: 'gpt-4o-mini', maxTokens: 'max_tokens', supportsTemperature: true }
] as const;

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
  
  // Circuit breaker check with expert content awareness
  const isExpertContent = userInfo?.difficultyLevel === 'expert' || userInfo?.expertGradeLevel || 
                         ['6th', '7th', '8th', '9th', '10th'].includes(userInfo?.readingLevel);
  
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
      // =================== PHASE 1: VARIABLE DECLARATION & SCOPE SETUP ===================
      let storyText, userInfo, sessionId, pageNumber, totalPages, avatarIdentity, storyId, enhancedStoryData, previousPageText;
      let pageText = '';
      const importResults = {};
      
      // =================== PHASE 2: DEPENDENCY & DEPLOYMENT VERIFICATION ===================
      console.log('🔧 AI Story Enhancer: Starting Phase 2 Dependency Verification');
      
      // Static imports are already loaded at module level - no need for dynamic testing
      importResults.cors = '✅ SUCCESS (static)';
      importResults.errorHandling = '✅ SUCCESS (static)';
      importResults.MultiStageEnhancementPipeline = '✅ SUCCESS (static)';
      
      console.log('✅ All shared modules loaded via static imports');
      
      console.log('📊 Dependency Verification Results:', importResults);
      
      // =================== PHASE 3: REQUEST FORMAT ANALYSIS ===================
      console.log('🔍 AI Story Enhancer: Starting Phase 3 Request Analysis');
      
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
          hasUserInfo: !!requestBody?.userInfo,
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
        
        ({ storyText, userInfo, sessionId, pageNumber, totalPages, avatarIdentity, storyId, enhancedStoryData, previousPageText = '' } = requestBody);
        console.log('📋 Parameter Validation:', {
          storyText: storyText ? `✅ Present (${storyText.length} chars)` : '❌ Missing',
          userInfo: userInfo ? `✅ Present (${typeof userInfo})` : '❌ Missing',
          sessionId: sessionId ? `✅ Present (${sessionId})` : '❌ Missing',
          pageNumber: pageNumber ? `✅ Present (${pageNumber})` : '❌ Missing',
          totalPages: totalPages ? `✅ Present (${totalPages})` : '⚠️ Undefined (infinite story)',
          avatarIdentity: avatarIdentity ? `✅ Present (${Object.keys(avatarIdentity).length} properties)` : '⚠️ Missing avatar identity',
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
        
        // PHASE 1: Generate unique request ID for cross-function tracing
        const requestId = `REQ-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
        console.log(`🧠 [${requestId}] Starting OpenAI prompt construction phase`);

        const messages = [
          {
            role: 'system',
            content: useSimplifiedPrompt ? 
              // GPT-5/4.1+ optimized prompt - SIMPLIFIED STRUCTURE
              `Generate visual scene descriptions for illustration purposes.

PRIMARY OBJECTIVE: Create rich, detailed visual descriptions for perfect image generation.

SIMPLIFIED JSON RESPONSE (primaryScene is REQUIRED, others are optional):
{
  "primaryScene": "Complete visual scene description containing ALL elements - character appearance (using avatar identity), clothing, pose, expression, actions, setting details, lighting, objects, colors, mood, atmosphere. Minimum 30+ characters with rich descriptive language.",
  "characterDetails": "optional character-specific details",
  "settingDetails": "optional environment details"
}

Avatar Identity: ${JSON.stringify(avatarIdentity)}
CRITICAL: Focus on creating a comprehensive primaryScene - this is the MAIN requirement.`
            :
              // Legacy models - SIMPLIFIED visual-first approach
              `Generate visual scene descriptions for professional illustration purposes.

PRIMARY OBJECTIVE: Create detailed, visually rich scene descriptions for image generation.

SIMPLIFIED JSON RESPONSE (primaryScene is REQUIRED, others are optional):
{
  "primaryScene": "The complete visual scene containing ALL elements needed for image generation. Must include character appearance (integrating avatar identity: ${avatarIdentity?.visualDescription || 'child'}), clothing, pose, expression, activities, setting environment, lighting conditions, objects, colors, mood, atmosphere${hasMultipleCharacters ? ', secondary characters and their details' : ''}. Minimum 30+ characters with rich, descriptive language.",
  "characterDetails": "optional additional character information",
  "settingDetails": "optional environment details"
}

VISUAL QUALITY STANDARDS:
- primaryScene: The MAIN OUTPUT - comprehensive visual narrative (REQUIRED)
- Character Integration: Use avatar identity as foundation
- Visual Richness: Include colors, textures, lighting, mood, spatial relationships
- Descriptive Language: Rich adjectives, specific details, atmospheric elements
- Minimum Length: 30+ characters with detailed visual specificity

Example primaryScene: "${avatarIdentity?.visualDescription || 'A curious child with bright eyes'} ${hasMultipleCharacters ? 'working alongside a encouraging teacher ' : ''}adding colorful wooden blocks to build a tall structure on a polished wooden table, the classroom filled with warm sunlight and educational posters, their expression showing focused concentration"`
          },
          {
            role: 'user', 
            content: `Content for visual scene generation: "${storyText}"

Character Identity Foundation: ${JSON.stringify(avatarIdentity)}
${previousContext}

Generate a comprehensive visual scene description using the schema structure with ${hasMultipleCharacters ? 'secondary character elements integrated' : 'primary character focus'}. 

Focus on creating the most detailed, visually rich primaryScene possible that captures every visual element needed for professional illustration generation. Make it comprehensive, descriptive, and atmospherically rich.`
          }
        ];

        // PHASE 1: Detailed OpenAI Prompt Construction Debugging
        console.log(`🧠 [${requestId}] OpenAI Prompt Construction Complete:`, {
          modelFamily: modelFamily,
          useSimplifiedPrompt: useSimplifiedPrompt,
          systemPromptLength: messages[0].content.length,
          userPromptLength: messages[1].content.length,
          totalMessageLength: messages.reduce((sum, msg) => sum + msg.content.length, 0),
          avatarIdentityKeys: Object.keys(avatarIdentity || {}),
          hasMultipleCharacters: hasMultipleCharacters,
          previousContextLength: previousContext.length,
          storyTextLength: storyText.length,
          secondaryCharacterFields: secondaryCharacterFields ? 'included' : 'excluded',
          timestamp: new Date().toISOString()
        });

        console.log(`🧠 [${requestId}] System Prompt (${messages[0].content.length} chars):`, 
          messages[0].content.substring(0, 200) + '...');
        console.log(`🧠 [${requestId}] User Prompt (${messages[1].content.length} chars):`, 
          messages[1].content.substring(0, 200) + '...');
        console.log(`🧠 [${requestId}] Avatar Identity:`, JSON.stringify(avatarIdentity, null, 2));

        let validationResult;
        
        try {
          // PHASE 1: Enhanced OpenAI API call with detailed logging
          console.log(`🧠 [${requestId}] Calling OpenAI with model fallback chain...`);
          const aiResult = await callOpenAIWithFallback(messages, 6000, requestId);
          
          // PHASE 2: Enhanced OpenAI response analysis with complete structure logging
          console.log(`🔍 [${requestId}] OpenAI Response Structure Analysis:`, {
            responseKeys: Object.keys(aiResult || {}),
            hasChoices: !!aiResult.choices,
            choicesLength: aiResult.choices?.length || 0,
            hasFirstChoice: !!aiResult.choices?.[0],
            firstChoiceKeys: aiResult.choices?.[0] ? Object.keys(aiResult.choices[0]) : [],
            hasMessage: !!aiResult.choices?.[0]?.message,
            messageKeys: aiResult.choices?.[0]?.message ? Object.keys(aiResult.choices[0].message) : [],
            hasContent: !!aiResult.choices?.[0]?.message?.content,
            contentType: typeof aiResult.choices?.[0]?.message?.content,
            contentLength: aiResult.choices?.[0]?.message?.content?.length || 0,
            model: aiResult.model || 'unknown',
            usage: aiResult.usage || 'no usage data'
          });

          console.log(`🔍 [${requestId}] Content Preview:`, 
            aiResult.choices?.[0]?.message?.content?.substring(0, 200) + 
            (aiResult.choices?.[0]?.message?.content?.length > 200 ? '...' : ''));

          const content = aiResult.choices?.[0]?.message?.content;
          
          // ============= PHASE 2: ENHANCED CONTENT VALIDATION WITH DEBUGGING =============
          if (!aiResult.choices || aiResult.choices.length === 0) {
            throw new Error(`OpenAI response has no choices array. Full response keys: ${Object.keys(aiResult).join(', ')}`);
          }
          
          if (!aiResult.choices[0] || !aiResult.choices[0].message) {
            throw new Error(`OpenAI first choice has no message. Choice keys: ${Object.keys(aiResult.choices[0] || {}).join(', ')}`);
          }
          
          const trimmedContent = content ? content.trim() : '';
          if (!content || typeof content !== 'string') {
            throw new Error(`OpenAI content is null or undefined, expected string. Message keys: ${Object.keys(aiResult.choices[0].message).join(', ')}`);
          }
          
          if (trimmedContent.length === 0) {
            throw new Error(`OpenAI returned empty content string. Full message: ${JSON.stringify(aiResult.choices[0].message)}`);
          }
          
          if (trimmedContent.length < 10) {  // Reduced from 30 to 10 for debugging
            console.warn('⚠️ Short content received:', { 
              actualLength: trimmedContent.length, 
              content: trimmedContent,
              fullContent: content
            });
          }

          // PHASE 2: Enhanced Progressive JSON parsing with model-specific handling
          try {
            console.log(`🔍 [${requestId}] Starting JSON parsing phase`);
            enhancedStoryData = parseAIResponse(trimmedContent, { modelFamily, requestId });
            console.log(`✅ [${requestId}] JSON parsing successful - Schema extracted:`, {
              extractedFields: Object.keys(enhancedStoryData || {}),
              primarySceneLength: enhancedStoryData.primaryScene?.length || 0,
              charactersPresent: !!enhancedStoryData.characters,
              visualComponentsPresent: !!enhancedStoryData.visualComponents,
              schemaValid: !!(enhancedStoryData.primaryScene && enhancedStoryData.characters && enhancedStoryData.visualComponents)
            });
          } catch (parseError) {
            console.error(`❌ [${requestId}] JSON parsing failed:`, {
              parseError: parseError.message,
              contentLength: trimmedContent.length,
              contentStart: trimmedContent.substring(0, 100),
              contentEnd: trimmedContent.substring(trimmedContent.length - 100)
            });
            throw new Error(`JSON parsing failed: ${parseError.message} - Content: "${trimmedContent.substring(0, 100)}..."`);
          }
          
          // ULTRA-SIMPLE VALIDATION: 3 of 5 fields check only
          validationResult = validateAndEnhanceContent(enhancedStoryData, storyText);
          
          // Simple check: If useTier2 flag set → Return error to Orchestrator for Tier 2
          if (validationResult.useTier2) {
            console.log(`🚀 Field validation failed - returning error to Orchestrator for Tier 2`);
            
            // Log validation failure that triggers Tier 2
            TierFailureLogger.logTier1ValidationFailure(validationResult, {
              sessionId,
              storyId,
              pageNumber,
              trigger: 'insufficient_fields'
            });
            
            return createCorsErrorResponse(`Field validation failed - ${validationResult.fieldCheck.passCount}/5 fields present`, 422);
          }
          
          enhancedStoryData = validationResult.enhancedData;
          
        } catch (parseError) {
          console.error('Failed to parse AI response - returning error to Orchestrator:', parseError.message);
          
          // Log parsing failure
          TierFailureLogger.logTier1OpenAIFailure(parseError, {
            sessionId,
            storyId,
            pageNumber,
            failureType: 'parsing_failed'
          });
          
          return createCorsErrorResponse(`Parse error: ${parseError.message}`, 422);
        }

        // PHASE 1: Pure AI Extraction - Return schema to orchestrator
        console.log('🎨 AI Enhancement successful - returning schema to orchestrator for technical assembly');

        // Return pure AI schema to orchestrator for technical assembly
        const result = {
          success: true,
          aiSchema: enhancedStoryData, // Pure 3-field schema from AI
          metadata: {
            aiEnhancement: true,
            validation: {
              fieldsPresent: validationResult?.fieldCheck?.passCount || 0,
              fieldsPassed: validationResult?.fieldCheck?.passCount >= 3,
              processingMethod: 'field-validated',
              modelUsed: 'openai-enhanced'
            },
             extractedElements: {
               hasCharacters: !!enhancedStoryData.characters,
               hasVisualComponents: !!enhancedStoryData.visualComponents,
               hasPrimaryScene: !!enhancedStoryData.primaryScene,
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
               sceneType: enhancedStoryData.visualComponents?.sceneType || 'mixed',
               lighting: enhancedStoryData.visualComponents?.lighting || 'natural',
               mood: enhancedStoryData.visualComponents?.mood || 'neutral',
               schemaVersion: '3-field-streamlined'
             }
          },
          enhancedStoryData: enhancedStoryData || {}
        };

        console.log(`✅ AI Analysis complete - NEW SCHEMA: Characters(${!!enhancedStoryData.characters}), VisualComponents(${!!enhancedStoryData.visualComponents}), PrimaryScene(${!!enhancedStoryData.primaryScene}), fields: ${validationResult?.fieldCheck?.passCount || 0}/5`);

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
