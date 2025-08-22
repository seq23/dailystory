import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse, corsHeaders } from "../_shared/cors.ts";
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
        
        ({ storyText, userInfo, sessionId, pageNumber, totalPages, avatarIdentity, storyId, enhancedStoryData } = requestBody);
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
            content: `You are an expert children's story analyzer. Extract ONLY these 3 fields from the story text:

RESPONSE FORMAT (JSON only, no other text):
{
  "characters": "Direct visual description from avatar or story characters",
  "visualComponents": {
    "sceneType": "indoor/outdoor/mixed",
    "lighting": "bright/dim/natural/dramatic", 
    "keyObjects": "important objects in the scene",
    "setting": "specific location context",
    "mood": "single mood descriptor"
  },
  "primaryScene": "single comprehensive sentence combining ALL visual elements including secondary characters when present"
}

CRITICAL RULES:
1. Use avatarIdentity.visualDescription for main character if provided
2. Include secondary characters DIRECTLY in primaryScene (never separate field)
3. Keep visualComponents concise and visual-focused
4. primaryScene must be one complete sentence with all characters and scene elements
5. Focus on what Runware image generation needs, not complex emotions

Example: If story has main character + grandmother, primaryScene should be:
"fair skin white boy with red hair with his grandmother in cozy indoor scene with warm lighting"`
          },
          {
            role: 'user',
            content: `Story text: "${storyText}"

Avatar identity: ${avatarIdentity?.visualDescription || 'child'}

Extract the 3-field schema focusing on visual clarity for image generation.`
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
          
          // QUALITY GATE: If score too low (0-30) → Return error to Orchestrator for Tier 2
          if (validationResult.useTier2) {
            console.log(`🚀 Quality gate triggered - returning error to Orchestrator (score: ${validationResult.qualityScore}/100)`);
            return createCorsErrorResponse(`Quality gate failure - score: ${validationResult.qualityScore}/100`, 422);
          }
          
          // If major mismatches detected, trigger re-analysis once
          if (validationResult.requiresReanalysis) {
            console.log(`🔄 Re-analyzing due to content mismatches (score: ${validationResult.qualityScore}/100)...`);
            const retryResult = await callOpenAIWithFallback(messages);
            if (retryResult.choices?.[0]?.message?.content) {
              enhancedStoryData = JSON.parse(retryResult.choices[0].message.content);
              validationResult = validateAndEnhanceContent(enhancedStoryData, storyText);
              
              // If still bad after retry → Return error to Orchestrator
              if (validationResult.useTier2 || validationResult.requiresReanalysis) {
                console.log(`🚀 Re-analysis failed - returning error to Orchestrator`);
                return createCorsErrorResponse('Re-analysis failed - quality insufficient', 422);
              }
            }
          }
          
          enhancedStoryData = validationResult.enhancedData;
          
        } catch (parseError) {
          console.error('Failed to parse AI response - returning error to Orchestrator:', parseError.message);
          return createCorsErrorResponse(`Parse error: ${parseError.message}`, 422);
        }

        // Call MultiStage to build the final enhanced prompt
        console.log('🎨 AI Enhancement successful - calling MultiStage for prompt building');
        let MultiStageEnhancementPipeline;
        try {
          const pipelineModule = await import('../_shared/MultiStageEnhancementPipeline.js');
          MultiStageEnhancementPipeline = pipelineModule.MultiStageEnhancementPipeline;
        } catch (importError) {
          console.error('❌ Failed to import MultiStageEnhancementPipeline:', importError.message);
          throw new Error(`MultiStage import failed: ${importError.message}`);
        }


        const promptResult = await MultiStageEnhancementPipeline.processTier1HighQuality(
          storyText,
          userInfo,
          storyId,
          sessionId,
          pageNumber,
          totalPages,
          enhancedStoryData, // Pass the AI-enhanced data
          avatarIdentity // Pass the avatar identity from orchestrator
        );

        // Return structured response for orchestrator
        const result = {
          success: true,
          enhancedPrompt: promptResult.enhancedPrompt,
          negativePrompt: promptResult.negativePrompt,
          metadata: {
            ...promptResult.metadata,
            aiEnhancement: true,
            validation: {
              contentValid: !validationResult?.requiresReanalysis,
              mismatches: validationResult?.mismatches || [],
              processingMethod: validationResult?.requiresReanalysis ? 're-analyzed' : 'accepted',
              qualityScore: validationResult?.qualityScore || 100,
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

        console.log(`✅ AI Analysis complete - NEW SCHEMA: Characters(${!!enhancedStoryData.characters}), VisualComponents(${!!enhancedStoryData.visualComponents}), PrimaryScene(${!!enhancedStoryData.primaryScene}), quality: ${validationResult?.qualityScore || 100}/100`);

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
