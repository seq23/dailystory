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

async function callOpenAIWithFallback(messages: any[], timeout = 8000) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  for (let modelIndex = 0; modelIndex < AI_MODELS.length; modelIndex++) {
    const model = AI_MODELS[modelIndex];
    console.log(`🤖 Trying model ${modelIndex + 1}/${AI_MODELS.length}: ${model.name}`);
    
    for (let attempt = 1; attempt <= 2; attempt++) {
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
          return result;
        } else if (response.status === 503 || response.status === 429) {
          console.warn(`⚠️ Model ${model.name} returned ${response.status} on attempt ${attempt}, retrying...`);
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
            continue;
          }
        } else {
          console.error(`❌ Model ${model.name} failed with status ${response.status}`);
          break; // Don't retry on non-transient errors
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn(`⏰ Model ${model.name} timed out after ${timeout}ms on attempt ${attempt}`);
        } else {
          console.error(`❌ Model ${model.name} error on attempt ${attempt}:`, error.message);
        }
        
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    console.warn(`❌ Model ${model.name} failed after 2 attempts, trying next model...`);
  }
  
  throw new Error('All AI models failed after multiple attempts');
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
      try {
        const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
        EdgeErrorHandler.validateRequest({
          pageText: undefined,
          positivePrompt: undefined,
          apiKey: openAIApiKey,
          functionName: 'ai-story-enhancer'
        });

        const { storyText, userInfo, sessionId, pageNumber, totalPages } = await req.json();

        if (!storyText) {
          throw {
            type: EdgeErrorType.VALIDATION,
            message: 'Missing required parameter: storyText'
          };
        }

    const pageText = totalPages ? `page ${pageNumber} of ${totalPages}` : `page ${pageNumber} of ongoing story`;
    console.log(`🧠 AI Story Enhancer: Processing ${pageText} for session ${sessionId}`);

    // Get previous pages context for consistency
    const { StoryVisualStateManager } = await import('../_shared/storyVisualState.js');
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
        content: `You are analyzing ${pageText} in an ${totalPages ? 'ongoing story' : 'never-ending story adventure'}.${previousContext}

Extract story elements while maintaining consistency with established elements. You may reasonably infer details that maintain story continuity.

ENHANCED RULES:
- Use established character names (e.g., 'Sequoia' if previously mentioned) 
- Maintain setting consistency unless story explicitly changes location
- Include objects from previous pages if they logically remain present
- Enhance emotional context based on story progression
- For never-ending stories, focus on continuity and character development
- Build upon established relationships and story elements

Return ONLY valid JSON:
{
  "characters": [{"name": "character_name", "description": "enhanced_description", "emotions": "contextual_emotion"}],
  "setting": {"location": "consistent_location", "timeOfDay": "progressive_time", "weather": "contextual_weather", "season": "established_season"},
  "objects": ["contextual_objects"],
  "mood": "progressive_mood",
  "narrativeElements": {"action": "specific_action", "focus": "story_focus", "perspective": "appropriate_perspective"}
}

Maintain story consistency while extracting meaningful details.`
      },
      {
        role: 'user',
        content: `Text content for ${pageText}:

"${storyText}"

Analyze this text considering the established story context. Focus on:
- Characters and their development (use established names when available)
- Actions and emotions in context of story progression  
- Objects and their continued presence or new introductions
- Setting evolution and transitions
- Mood progression throughout the story

Maintain consistency with previous pages while extracting rich story elements.`
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
        return await useTier2Pipeline(storyText, userInfo, sessionId, pageNumber, totalPages, validationResult.qualityScore);
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
            return await useTier2Pipeline(storyText, userInfo, sessionId, pageNumber, totalPages, validationResult.qualityScore || 0);
          }
        }
      }
      
      enhancedStoryData = validationResult.enhancedData;
      
    } catch (parseError) {
      console.error('Failed to parse AI response - using Tier 2 pipeline:', parseError.message);
      return await useTier2Pipeline(storyText, userInfo, sessionId, pageNumber, totalPages, 0, `Parse error: ${parseError.message}`);
    }

    // Add context and metadata with validation info
    const result = {
      enhancedStoryData,
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
        console.log(`❌ OpenAI failed - falling back to Tier 2 pipeline: ${error.message}`);
        return await useTier2Pipeline(storyText, userInfo, sessionId, pageNumber, totalPages, 0, error.message);
      }
    }
  );
});

/**
 * Tier 2 Pipeline Fallback - Uses MultiStageEnhancementPipeline when OpenAI fails or quality is too low
 */
async function useTier2Pipeline(storyText, userInfo, sessionId, pageNumber, totalPages, qualityScore = 0, errorMessage = null) {
  try {
    console.log(`🚀 Tier 2 Pipeline: Processing fallback for session ${sessionId}, page ${pageNumber}`);
    
    // Import and use the Tier 2 pipeline
    const { MultiStageEnhancementPipeline } = await import('../_shared/MultiStageEnhancementPipeline.js');
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
        originalTextLength: storyText.length,
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
      originalError: errorMessage
    };
    
    console.log(`✅ Tier 2 Pipeline complete: Using template-based enhancement`);
    return createCorsResponse(formattedResult);
    
  } catch (tier2Error) {
    console.error(`❌ Tier 2 Pipeline failed: ${tier2Error.message}`);
    
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
      contextualInfo: { pageNumber, totalPages: 'unlimited', sessionId, processingTimestamp: new Date().toISOString(), isNeverEnding: true },
      narrativeEnhancements: { sceneType: 'general', emotionalTone: 'neutral', visualFocus: 'balanced' },
      validation: { contentValid: false, processingMethod: 'emergency-fallback', qualityScore: 0, modelUsed: 'none' },
      emergencyFallback: true,
      errors: [errorMessage, tier2Error.message].filter(Boolean)
    };
    
    return createCorsResponse(emergencyFallback);
  }
}