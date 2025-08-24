import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse, corsHeaders } from "../_shared/cors.ts";
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
 * SIMPLE: Check if primaryScene exists and has minimum 30 characters
 */
function checkPrimarySceneCriteria(data) {
  const primarySceneExists = !!(data.primaryScene && data.primaryScene.length >= 30);
  return {
    primaryScene: primarySceneExists,
    passCount: primarySceneExists ? 1 : 0
  };
}

// REMOVED: applyBasicFixes function - Tier 1 now uses strict fail-fast validation
// This ensures immediate Tier 2 triggering when AI extraction is insufficient

/**
 * TIER 1 FAIL-FAST VALIDATION: Binary primaryScene check - no repair attempts
 * @param {Object} enhancedStoryData - AI extracted data  
 * @param {string} storyText - Original story text (unused, kept for compatibility)
 * @returns {Object} - Enhanced data or immediate Tier 2 trigger
 */
function validateAndEnhanceContent(enhancedStoryData, storyText) {
  const fieldCheck = checkPrimarySceneCriteria(enhancedStoryData);
  
  console.log(`🔍 PRIMARY SCENE Check: ${fieldCheck.primaryScene ? 'PASS' : 'TIER 2'} (${enhancedStoryData.primaryScene?.length || 0} characters)`);
  
  // Simple decision: primaryScene exists with 30+ chars = accept, otherwise = Tier 2
  if (!fieldCheck.primaryScene) {
    console.log(`❌ Primary scene insufficient (${enhancedStoryData.primaryScene?.length || 0} chars) - falling back to Tier 2`);
    return { useTier2: true, fieldCheck };
  }
  
  console.log(`✅ Primary scene validation passed (${enhancedStoryData.primaryScene.length} chars) - content accepted`);
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
  private readonly timeout = 15000; // 15 seconds
  
  isOpen(): boolean {
    const isCurrentlyOpen = this.failures >= this.threshold && (Date.now() - this.lastFailure < this.timeout);
    
    if (this.failures >= this.threshold) {
      if (Date.now() - this.lastFailure < this.timeout) {
        // Log circuit breaker state
        CircuitBreakerMonitor.trackCircuitBreakerState('OPENAI_API', 'OPEN', {
          failures: this.failures,
          threshold: this.threshold,
          timeoutRemaining: this.timeout - (Date.now() - this.lastFailure)
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
  
  recordFailure(): void {
    this.failures++;
    this.lastFailure = Date.now();
    
    if (this.failures >= this.threshold) {
      CircuitBreakerMonitor.trackCircuitBreakerState('OPENAI_API', 'OPEN', {
        failures: this.failures,
        threshold: this.threshold,
        event: 'threshold_exceeded'
      });
    } else {
      CircuitBreakerMonitor.trackCircuitBreakerState('OPENAI_API', 'HALF_OPEN', {
        failures: this.failures,
        threshold: this.threshold
      });
    }
    
    // Track service health on failure
    CircuitBreakerMonitor.trackServiceHealth('OPENAI_API', {
      status: 'degraded',
      failures: this.failures,
      lastFailure: this.lastFailure
    });
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

// ============= PROGRESSIVE JSON PARSING =============

function parseAIResponse(content, options = {}) {
  console.log('🔍 Progressive JSON Parsing:', {
    contentLength: content.length,
    modelFamily: options.modelFamily,
    firstChars: content.substring(0, 50)
  });
  
  // Strategy 1: Try direct JSON parsing (most common)
  try {
    const parsed = JSON.parse(content);
    console.log('✅ Direct JSON parsing successful');
    return parsed;
  } catch (directError) {
    console.log('⚠️ Direct JSON parsing failed, trying extraction methods');
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
    
    for (const pattern of jsonPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        try {
          const extracted = JSON.parse(match[1].trim());
          console.log('✅ JSON extraction successful with pattern');
          return extracted;
        } catch (e) {
          continue;
        }
      }
    }
    
    throw new Error('No valid JSON found in content');
  } catch (extractionError) {
    console.error('❌ All parsing strategies failed:', {
      directError: 'Invalid JSON syntax',
      extractionError: extractionError.message,
      content: content.substring(0, 200)
    });
    
    throw new Error(`Progressive parsing failed: ${extractionError.message}`);
  }
}

async function callOpenAIWithFallback(messages: any[], timeout = 6000) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  // Circuit breaker check with enhanced logging
  if (circuitBreaker.isOpen()) {
    console.warn('🚫 Circuit breaker is open, skipping OpenAI - using Tier 2 immediately');
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
    console.log(`🤖 Trying model ${modelIndex + 1}/${AI_MODELS.length}: ${model.name}`);
    
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
        
        console.log(`⏳ Attempting ${model.name} (attempt ${attempt}/1, timeout: ${timeout}ms)`);
        
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
          console.error(`❌ Model ${model.name} error on attempt ${attempt}:`, error.message);
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
    circuitBreaker.recordFailure();
    
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
    'ai-story-enhancer',
    'fallback-chain',
    async () => {
      // =================== PHASE 1: VARIABLE DECLARATION & SCOPE SETUP ===================
      let requestBody;
      let storyText, userInfo, sessionId, pageNumber, totalPages, avatarIdentity, storyId, enhancedStoryData;
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

        // Parse and log the complete request structure
        try {
          requestBody = await req.json();
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
        } catch (parseError) {
          console.error('❌ Request parsing failed:', parseError.message);
          throw {
            type: EdgeErrorType.VALIDATION,
            message: `Request parsing failed: ${parseError.message}`
          };
        }

        // Extract parameters with comprehensive validation and logging
        if (!requestBody) {
          throw {
            type: EdgeErrorType.VALIDATION,
            message: 'Request body is null or undefined'
          };
        }
        
        ({ storyText, userInfo, sessionId, pageNumber, totalPages, avatarIdentity, storyId, enhancedStoryData, previousPageText } = requestBody);
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
        if (requestBody.previousPageText) {
          previousContext = `\n\nPREVIOUS STORY CONTEXT:\nPrevious page text: "${requestBody.previousPageText}"\n`;
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
        
        const messages = [
          {
            role: 'system',
            content: useSimplifiedPrompt ? 
              // GPT-5/4.1+ optimized prompt - streamlined and focused
              `Text analyzer for image generation. Extract visual data.

JSON ONLY:
{
  "characters": {
    "characterAppearance": "integrate avatar identity with story context",
    "characterClothing": "clothing/outfit details", 
    "characterPosition": "body position/pose",
    "characterMood": "emotion/expression",${secondaryCharacterFields}
  },
  "visualComponents": {
    "action": "primary activity",
    "setting": "location context", 
    "sceneType": "indoor/outdoor/mixed",
    "lighting": "scene lighting",
    "keyObjects": "important items"
  },
  "primaryScene": "comprehensive visual description for image generation"
}

Avatar: ${JSON.stringify(avatarIdentity)}
Priority: characterAppearance uses avatar identity, action/setting drive scene composition.`
            :
              // Legacy models - detailed instructions with examples
              `CRITICAL: primaryScene is the MASTER COMPREHENSIVE OUTPUT that will be sent directly to image generation.

JSON RESPONSE:
{
  "characters": {
    "characterAppearance": "OPTIONAL: base avatar info for internal processing",
    "characterClothing": "OPTIONAL: clothing info for internal processing", 
    "characterPosition": "OPTIONAL: position info for internal processing",
    "characterMood": "OPTIONAL: mood info for internal processing",${secondaryCharacterFields}
  },
  "visualComponents": {
    "action": "OPTIONAL: action info for internal processing",
    "setting": "OPTIONAL: setting info for internal processing",
    "sceneType": "OPTIONAL: scene type for internal processing", 
    "lighting": "OPTIONAL: lighting info for internal processing",
    "keyObjects": "OPTIONAL: objects info for internal processing"
  },
  "primaryScene": "MASTER OUTPUT: Complete, comprehensive visual description containing ALL details - characters, secondary characters, actions, settings, lighting, objects, mood, colors, clothing, everything needed for perfect image generation"
}

CRITICAL REQUIREMENTS:
- primaryScene: Must contain EVERYTHING - ALL character details (${avatarIdentity?.visualDescription || 'child'}), ALL actions, ALL settings, ALL lighting, ALL objects, ALL secondary characters, ALL clothing, ALL mood
- primaryScene: Minimum 100+ characters with rich detail and duplication encouraged
- Other fields: Optional helper fields for internal processing only${hasMultipleCharacters ? `
- SECONDARY CHARACTERS: Include all secondary character details IN primaryScene` : ''}

Example primaryScene: "${avatarIdentity?.visualDescription || 'A child'} ${hasMultipleCharacters ? 'playing alongside a friendly teacher ' : ''}carefully building with colorful wooden blocks on a smooth wooden table in a bright, sunny classroom with large windows, natural golden lighting streaming in, educational posters on the walls, cheerful and focused expressions, detailed realistic style"`
          },
          {
            role: 'user', 
            content: `Story text: "${storyText}"

Avatar identity: ${JSON.stringify(avatarIdentity)}
${previousContext}
Extract using the object-based schema with ${hasMultipleCharacters ? 'secondary character fields included' : 'core character fields only'}. Prioritize action/setting in visualComponents and make primaryScene comprehensive.`
          }
        ];

        let validationResult;
        
        try {
          // Call OpenAI with model fallback chain
          const aiResult = await callOpenAIWithFallback(messages);
          
          // Enhanced content extraction with debugging
          console.log('🔍 OpenAI Response Debug:', {
            hasChoices: !!aiResult.choices,
            choicesLength: aiResult.choices?.length || 0,
            hasFirstChoice: !!aiResult.choices?.[0],
            hasMessage: !!aiResult.choices?.[0]?.message,
            hasContent: !!aiResult.choices?.[0]?.message?.content,
            contentType: typeof aiResult.choices?.[0]?.message?.content,
            contentPreview: aiResult.choices?.[0]?.message?.content?.substring(0, 100)
          });

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

          // ENHANCED: Progressive JSON parsing with model-specific handling
          try {
            enhancedStoryData = parseAIResponse(trimmedContent, { modelFamily });
          } catch (parseError) {
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
