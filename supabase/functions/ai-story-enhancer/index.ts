import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";
import { EdgeErrorHandler, EdgeErrorType } from "../_shared/errorHandling.ts";
import { validateAndEnhanceContent } from "../_shared/SimpleContentValidator.js";

// AI Model Fallback Chain Configuration - UPDATED TO FLAGSHIP MODELS
const AI_MODELS = [
  { name: 'gpt-5-2025-08-07', maxTokens: 'max_completion_tokens', supportsTemperature: false },
  { name: 'gpt-4.1-2025-04-14', maxTokens: 'max_completion_tokens', supportsTemperature: false },
  { name: 'gpt-4o-mini', maxTokens: 'max_tokens', supportsTemperature: true }
] as const;

// Circuit breaker to prevent cascading failures
class CircuitBreaker {
  private failures = 0;
  private lastFailure = 0;
  private readonly threshold = 3;
  private readonly timeout = 30000; // 30 seconds
  
  isOpen(): boolean {
    if (this.failures >= this.threshold) {
      if (Date.now() - this.lastFailure < this.timeout) {
        return true;
      }
      // Reset circuit breaker after timeout
      this.failures = 0;
    }
    return false;
  }
  
  recordSuccess(): void {
    this.failures = 0;
  }
  
  recordFailure(): void {
    this.failures++;
    this.lastFailure = Date.now();
  }
}

const circuitBreaker = new CircuitBreaker();

async function callOpenAIWithFallback(messages: any[], timeout = 12000) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  // Circuit breaker check
  if (circuitBreaker.isOpen()) {
    console.warn('🚫 Circuit breaker is open, skipping OpenAI - using Tier 2 immediately');
    throw new Error('Circuit breaker open - service degraded');
  }
  
  for (let modelIndex = 0; modelIndex < AI_MODELS.length; modelIndex++) {
    const model = AI_MODELS[modelIndex];
    console.log(`🤖 Trying model ${modelIndex + 1}/${AI_MODELS.length}: ${model.name}`);
    
    for (let attempt = 1; attempt <= 3; attempt++) {
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
        
        console.log(`⏳ Attempting ${model.name} (attempt ${attempt}/3, timeout: ${timeout}ms)`);
        
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
          console.log(`✅ Model ${model.name} succeeded on attempt ${attempt}`);
          circuitBreaker.recordSuccess();
          return result;
        } else if (response.status === 503 || response.status === 429 || response.status === 502) {
          const errorText = await response.text();
          console.warn(`⚠️ Model ${model.name} returned ${response.status} on attempt ${attempt}: ${errorText}`);
          
          if (attempt < 3) {
            const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 8000); // Exponential backoff, max 8s
            console.log(`⏳ Retrying after ${backoffDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
            continue;
          }
        } else {
          const errorText = await response.text();
          console.error(`❌ Model ${model.name} failed with status ${response.status}: ${errorText}`);
          break; // Don't retry on non-transient errors
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn(`⏰ Model ${model.name} timed out after ${timeout}ms on attempt ${attempt}`);
        } else {
          console.error(`❌ Model ${model.name} error on attempt ${attempt}:`, error.message);
        }
        
        if (attempt < 3) {
          const backoffDelay = Math.min(2000 * attempt, 10000);
          console.log(`⏳ Retrying after ${backoffDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
      }
    }
    
    console.warn(`❌ Model ${model.name} failed after 3 attempts, trying next model...`);
    circuitBreaker.recordFailure();
  }
  
  console.error('🚫 All AI models exhausted - circuit breaker will activate if failures continue');
  throw new Error('All AI models failed after multiple attempts - service may be degraded');
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
      let storyText, userInfo, sessionId, pageNumber, totalPages, avatarIdentity;
      let pageText = '';
      const importResults = {};
      
      // =================== PHASE 2: DEPENDENCY & DEPLOYMENT VERIFICATION ===================
      console.log('🔧 AI Story Enhancer: Starting Phase 2 Dependency Verification');
      
      // Test all shared module imports proactively
      try {
        await import('../_shared/cors.ts');
        importResults.cors = '✅ SUCCESS';
        console.log('✅ cors.ts import - OK');
      } catch (error) {
        importResults.cors = `❌ FAILED: ${error.message}`;
        console.error('❌ cors.ts import - FAILED:', error.message);
      }
      
      try {
        await import('../_shared/errorHandling.ts');
        importResults.errorHandling = '✅ SUCCESS';
        console.log('✅ errorHandling.ts import - OK');
      } catch (error) {
        importResults.errorHandling = `❌ FAILED: ${error.message}`;
        console.error('❌ errorHandling.ts import - FAILED:', error.message);
      }
      
      try {
        await import('../_shared/SimpleContentValidator.js');
        importResults.SimpleContentValidator = '✅ SUCCESS';
        console.log('✅ SimpleContentValidator.js import - OK');
      } catch (error) {
        importResults.SimpleContentValidator = `❌ FAILED: ${error.message}`;
        console.error('❌ SimpleContentValidator.js import - FAILED:', error.message);
      }
      
      try {
        await import('../_shared/MultiStageEnhancementPipeline.js');
        importResults.MultiStageEnhancementPipeline = '✅ SUCCESS';
        console.log('✅ MultiStageEnhancementPipeline.js import - OK');
      } catch (error) {
        importResults.MultiStageEnhancementPipeline = `❌ FAILED: ${error.message}`;
        console.error('❌ MultiStageEnhancementPipeline.js import - FAILED:', error.message);
      }
      
      try {
        await import('../_shared/storyVisualState.js');
        importResults.storyVisualState = '✅ SUCCESS';
        console.log('✅ storyVisualState.js import - OK');
      } catch (error) {
        importResults.storyVisualState = `❌ FAILED: ${error.message}`;
        console.error('❌ storyVisualState.js import - FAILED:', error.message);
      }
      
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
        
        ({ storyText, userInfo, sessionId, pageNumber, totalPages, avatarIdentity } = requestBody);
        console.log('📋 Parameter Validation:', {
          storyText: storyText ? `✅ Present (${storyText.length} chars)` : '❌ Missing',
          userInfo: userInfo ? `✅ Present (${typeof userInfo})` : '❌ Missing',
          sessionId: sessionId ? `✅ Present (${sessionId})` : '❌ Missing',
          pageNumber: pageNumber ? `✅ Present (${pageNumber})` : '❌ Missing',
          totalPages: totalPages ? `✅ Present (${totalPages})` : '⚠️ Undefined (infinite story)',
          avatarIdentity: avatarIdentity ? `✅ Present (${Object.keys(avatarIdentity).length} properties)` : '⚠️ Missing avatar identity'
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

        // Get previous pages context for consistency - move import outside try block
        let StoryVisualStateManager;
        try {
          const storyStateModule = await import('../_shared/storyVisualState.js');
          StoryVisualStateManager = storyStateModule.StoryVisualStateManager;
        } catch (importError) {
          console.warn('⚠️ Could not import StoryVisualStateManager:', importError.message);
          StoryVisualStateManager = null;
        }
        
        const previousPages = StoryVisualStateManager?.getPromptHistory?.(sessionId, 3) || [];
        
        let previousContext = '';
        if (previousPages.length > 0) {
          previousContext = `\n\nPREVIOUS STORY CONTEXT:\n`;
          previousPages.reverse().forEach((page, index) => {
            previousContext += `Page ${page.pageNumber}: Previous story elements established\n`;
          });
          
          const knownCharacters = StoryVisualStateManager?.getStoryState?.(sessionId)?.characters || new Map();
          const knownSetting = StoryVisualStateManager?.getSettingForPrompt?.(sessionId);
          const knownObjects = StoryVisualStateManager?.getVisualDetailsForPrompt?.(sessionId);
          
          if (knownCharacters.size > 0) {
            const charNames = Array.from(knownCharacters.keys()).join(', ');
            previousContext += `ESTABLISHED CHARACTERS: ${charNames}\n`;
          }
          if (knownSetting) {
            previousContext += `ESTABLISHED SETTING: ${knownSetting}\n`;
          }
          if (knownObjects) {
            previousContext += `ESTABLISHED OBJECTS: ${knownObjects}\n`;
          }
        }

        const messages = [
          {
            role: 'system',
            content: `Extract story elements with enhanced emotion analysis from ${pageText}.${previousContext}

ENHANCED EMOTION FOCUS: Pay special attention to emotional states, transitions, and character feelings.

EMOTIONAL VOCABULARY: Use rich emotional descriptors like:
- Primary emotions: joyful, excited, curious, proud, confident, surprised, worried, frustrated, sad, angry, scared, confused
- Complex emotions: determined, hopeful, anxious, content, overwhelmed, peaceful, nervous, grateful, disappointed, amazed
- Emotional transitions: growing confident, becoming curious, feeling reassured, getting excited, calming down

RULES:
- Use established character names if available
- Focus on emotional depth and character feelings
- Include scene transitions and emotional changes
- Maintain story continuity and character emotional arcs
- Capture the overall emotional atmosphere

Return ONLY valid JSON:
{
  "characters": [{"name": "name", "description": "brief_description", "emotions": "rich_emotional_state_with_transitions"}],
  "mainCharacter": {"emotions": "primary_character_detailed_emotions", "emotionalArc": "how_emotions_change"},
  "secondaryCharacters": [{"name": "name", "emotions": "supporting_character_emotions"}],
  "setting": {"location": "location", "timeOfDay": "time", "weather": "weather", "atmosphere": "emotional_atmosphere"},
  "objects": ["essential_objects_with_emotional_context"],
  "mood": "overall_emotional_tone",
  "overallMood": "scene_emotional_atmosphere",
  "narrativeElements": {"action": "action_with_emotional_impact", "focus": "emotional_focus", "sceneTransition": "emotional_transition"}
}

Prioritize emotional depth and character development.`
          },
          {
            role: 'user',
            content: `Text: "${storyText}"

Extract elements with ENHANCED EMOTION ANALYSIS:
- Characters with detailed emotional states and transitions
- Emotional atmosphere of the scene
- How characters feel and emotional changes
- Objects and settings that support the emotional story
- Overall mood and emotional progression

Focus on emotional storytelling and character feelings.`
          }
        ];

        let validationResult;
        let enhancedStoryData;
        
        try {
          // Call OpenAI with model fallback chain
          const aiResult = await callOpenAIWithFallback(messages);
          
          if (!aiResult.choices?.[0]?.message?.content) {
            throw new Error('No content received from OpenAI fallback chain');
          }

          enhancedStoryData = JSON.parse(aiResult.choices[0].message.content);
          
          // ULTRA-LEAN VALIDATION WITH QUALITY GATE
          validationResult = validateAndEnhanceContent(enhancedStoryData, storyText);
          
          // QUALITY GATE: If score too low (0-30) → Fall back to Tier 2 immediately
          if (validationResult.useTier2) {
            console.log(`🚀 Quality gate triggered - using Tier 2 pipeline (score: ${validationResult.qualityScore}/100)`);
            return await useTier2Pipeline(storyText, userInfo, sessionId, pageNumber, totalPages, validationResult.qualityScore, null, 0);
          }
          
          // If major mismatches detected, trigger re-analysis once
          if (validationResult.requiresReanalysis) {
            console.log(`🔄 Re-analyzing due to content mismatches (score: ${validationResult.qualityScore}/100)...`);
            const retryResult = await callOpenAIWithFallback(messages);
            if (retryResult.choices?.[0]?.message?.content) {
              enhancedStoryData = JSON.parse(retryResult.choices[0].message.content);
              validationResult = validateAndEnhanceContent(enhancedStoryData, storyText);
              
              // If still bad after retry → Tier 2
              if (validationResult.useTier2 || validationResult.requiresReanalysis) {
                console.log(`🚀 Re-analysis failed - using Tier 2 pipeline`);
                return await useTier2Pipeline(storyText, userInfo, sessionId, pageNumber, totalPages, validationResult.qualityScore || 0, 'Re-analysis failed', 0);
              }
            }
          }
          
          enhancedStoryData = validationResult.enhancedData;
          
        } catch (parseError) {
          console.error('Failed to parse AI response - using Tier 2 pipeline:', parseError.message);
          return await useTier2Pipeline(storyText, userInfo, sessionId, pageNumber, totalPages, 0, `Parse error: ${parseError.message}`, 0);
        }

        // Add context and metadata with validation info
        const result = {
          enhancedStoryData: enhancedStoryData || {},
          extractedElements: {
            characterCount: enhancedStoryData.characters?.length || 0,
            objectCount: enhancedStoryData.objects?.length || 0,
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
            sceneType: enhancedStoryData.narrativeElements?.action || 'general activity',
            emotionalTone: enhancedStoryData.mood || 'neutral',
            visualFocus: enhancedStoryData.narrativeElements?.focus || 'character'
          },
          validation: {
            contentValid: !validationResult?.requiresReanalysis,
            mismatches: validationResult?.mismatches || [],
            processingMethod: validationResult?.requiresReanalysis ? 're-analyzed' : 'accepted',
            qualityScore: validationResult?.qualityScore || 100,
            modelUsed: 'openai-enhanced'
          }
        };

        console.log(`✅ AI Analysis complete: ${enhancedStoryData.characters?.length || 0} characters, ${enhancedStoryData.objects?.length || 0} objects, quality: ${validationResult?.qualityScore || 100}/100`);

        return createCorsResponse(result);

      } catch (error) {
        // OpenAI FAILURE → Skip to Tier 2 immediately (no more generic fallback)
        console.error('❌ Critical error in AI Story Enhancer:', {
          errorMessage: error.message,
          errorStack: error.stack,
          requestData: requestBody ? Object.keys(requestBody) : 'no-request-body',
          dependencyStatus: importResults
        });
        
        // Safely extract parameters for fallback, with defaults if parsing failed
        const fallbackParams = {
          storyText: requestBody?.storyText || 'Unable to extract story text',
          userInfo: requestBody?.userInfo || {},
          sessionId: requestBody?.sessionId || 'unknown-session',
          pageNumber: requestBody?.pageNumber || 1,
          totalPages: requestBody?.totalPages || null
        };
        
        return await useTier2Pipeline(
          fallbackParams.storyText, 
          fallbackParams.userInfo, 
          fallbackParams.sessionId, 
          fallbackParams.pageNumber, 
          fallbackParams.totalPages, 
          0, 
          error.message,
          0
        );
      }
    }
  );
});

/**
 * Tier 2 Pipeline Fallback - Uses MultiStageEnhancementPipeline when OpenAI fails or quality is too low
 */
async function useTier2Pipeline(storyText, userInfo, sessionId, pageNumber, totalPages, qualityScore = 0, errorMessage = null, depth = 0) {
  // Prevent infinite recursion
  if (depth > 2) {
    console.warn(`🚫 Max recursion depth reached (${depth}) - using emergency fallback`);
    const emergencyFallback = {
      enhancedStoryData: {
        characters: [{ name: "character", description: "child", emotions: "neutral" }],
        setting: { location: "scene", timeOfDay: "daytime", weather: "clear", season: "unspecified" },
        objects: [],
        mood: "neutral",
        narrativeElements: { action: "general activity", focus: "character", perspective: "eye level" }
      },
      extractedElements: { characterCount: 1, objectCount: 0, complexity: 'simple' },
      contextualInfo: { pageNumber, totalPages: 'unlimited', sessionId, processingTimestamp: new Date().toISOString(), isNeverEnding: true },
      narrativeEnhancements: { sceneType: 'general', emotionalTone: 'neutral', visualFocus: 'balanced' },
      validation: { contentValid: false, processingMethod: 'max-depth-emergency', qualityScore: 0, modelUsed: 'none' },
      emergencyFallback: true,
      errors: [`Max recursion depth ${depth}`, errorMessage].filter(Boolean)
    };
    
    return createCorsResponse(emergencyFallback);
  }

  try {
    console.log(`🚀 Tier 2 Pipeline: Processing fallback for session ${sessionId}, page ${pageNumber} (depth: ${depth})`);
    
    // Import and use the Tier 2 pipeline with proper error handling
    let MultiStageEnhancementPipeline;
    try {
      const pipelineModule = await import('../_shared/MultiStageEnhancementPipeline.js');
      MultiStageEnhancementPipeline = pipelineModule.MultiStageEnhancementPipeline;
    } catch (importError) {
      console.error('❌ Failed to import MultiStageEnhancementPipeline:', importError.message);
      throw new Error(`Pipeline import failed: ${importError.message}`);
    }
    
    if (!MultiStageEnhancementPipeline?.processThroughPipeline) {
      throw new Error('MultiStageEnhancementPipeline.processThroughPipeline is not available');
    }
    
    const tier2Result = await MultiStageEnhancementPipeline.processThroughPipeline(
      storyText, 
      userInfo, 
      sessionId, 
      pageNumber, 
      totalPages
    );
    
    // Format Tier 2 result to match expected AI enhancer structure
    const formattedResult = {
      enhancedStoryData: {
        characters: [{ 
          name: tier2Result.characterDescription?.name || "character", 
          description: tier2Result.characterDescription?.appearance || "child", 
          emotions: "neutral" 
        }],
        setting: { 
          location: tier2Result.settingContext?.location || "scene", 
          timeOfDay: tier2Result.settingContext?.timeOfDay || "daytime", 
          weather: tier2Result.settingContext?.weather || "clear", 
          season: "unspecified" 
        },
        objects: tier2Result.objectContext || [],
        mood: "neutral",
        narrativeElements: { 
          action: "general activity", 
          focus: "character", 
          perspective: "eye level" 
        }
      },
      extractedElements: { 
        characterCount: 1, 
        objectCount: tier2Result.objectContext?.length || 0, 
        complexity: 'simple' 
      },
      contextualInfo: { 
        pageNumber, 
        totalPages: totalPages || 'unlimited', 
        sessionId, 
        originalTextLength: storyText?.length || 0,
        processingTimestamp: new Date().toISOString(), 
        isNeverEnding: !totalPages 
      },
      narrativeEnhancements: { 
        sceneType: 'general', 
        emotionalTone: 'neutral', 
        visualFocus: 'balanced' 
      },
      validation: {
        contentValid: true,
        mismatches: [],
        processingMethod: 'tier-2-fallback',
        qualityScore: qualityScore,
        modelUsed: 'tier-2-pipeline'
      },
      tier2Used: true,
      originalError: errorMessage,
      depth
    };
    
    console.log(`✅ Tier 2 Pipeline complete: Using template-based enhancement (depth: ${depth})`);
    return createCorsResponse(formattedResult);
    
  } catch (tier2Error) {
    console.error(`❌ Tier 2 Pipeline failed (depth: ${depth}): ${tier2Error.message}`);
    
    // Final fallback - absolute minimum structure
    const emergencyFallback = {
      enhancedStoryData: {
        characters: [{ name: "character", description: "child", emotions: "neutral" }],
        setting: { location: "scene", timeOfDay: "daytime", weather: "clear", season: "unspecified" },
        objects: [],
        mood: "neutral",
        narrativeElements: { action: "general activity", focus: "character", perspective: "eye level" }
      },
      extractedElements: { characterCount: 1, objectCount: 0, complexity: 'simple' },
      contextualInfo: { 
        pageNumber: pageNumber || 1, 
        totalPages: totalPages || 'unlimited', 
        sessionId: sessionId || 'unknown-session', 
        originalTextLength: storyText?.length || 0,
        processingTimestamp: new Date().toISOString(), 
        isNeverEnding: !totalPages 
      },
      narrativeEnhancements: { sceneType: 'general', emotionalTone: 'neutral', visualFocus: 'balanced' },
      validation: { contentValid: false, processingMethod: 'emergency-fallback', qualityScore: 0, modelUsed: 'none' },
      emergencyFallback: true,
      errors: [errorMessage, tier2Error.message].filter(Boolean),
      depth
    };
    
    return createCorsResponse(emergencyFallback);
  }
}