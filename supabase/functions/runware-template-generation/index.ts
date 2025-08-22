import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";
import { MultiStageEnhancementPipeline } from "../_shared/MultiStageEnhancementPipeline.js";
import { DifficultyLevelMapper } from "../_shared/DifficultyLevelMapper.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmotionalContext {
  mood: string;
  intensity: number;
  colorPalette: string;
  lighting: string;
}

interface CharacterDescriptor {
  name: string;
  type: 'primary' | 'family' | 'friend' | 'secondary';
  relationship?: string;
  physicalTraits: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  try {
    console.log('🏭 Tier 2: Template-based image generation starting...');
    
    const { pageText, storyId, sessionId = storyId, userInfo, avatarIdentity, pageNumber = 1, totalPages = 10 } = await req.json();

    if (!pageText) {
      return createCorsErrorResponse('Missing pageText parameter', 400);
    }

    // Validate user info for consistency
    const validationResult = validateUserInfo(userInfo);
    if (!validationResult.valid) {
      console.warn(`⚠️ User info validation warning: ${validationResult.error}`);
    }

    console.log(`🏭 Using lean enhancement pipeline for page ${pageNumber}/${totalPages}`);

    // Use lean multi-stage enhancement pipeline for all processing
    const mappedDifficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo);
    console.log(`🔧 Mapped difficulty: ${mappedDifficulty} from user reading level: ${userInfo?.readingLevel}`, {
      userReadingLevel: userInfo?.readingLevel,
      userDifficultyLevel: userInfo?.difficultyLevel,  
      finalMappedLevel: mappedDifficulty
    });

    const enhancementResult = await MultiStageEnhancementPipeline.processTier2HighQuality(
      pageText,
      userInfo,
      storyId,
      sessionId,
      pageNumber,
      totalPages,
      avatarIdentity
    );

    const finalPrompt = enhancementResult.enhancedPrompt;
    const negativePrompt = enhancementResult.negativePrompt;
    const optimizedParameters = enhancementResult.generationParams;

    // Phase 10: Attempt Runware generation with sophisticated prompt
    const result = await generateWithRunware(
      finalPrompt,
      negativePrompt,
      optimizedParameters,
      sessionId,
      pageNumber
    );

    if (result.success) {
      console.log(`✅ Tier 2 generation successful using template-based enhancement`);
      return createCorsResponse({
        success: true,
        imageURL: result.url,
        provider: 'runware-template',
        prompt: finalPrompt,
        qualityScore: enhancementResult.qualityScore || 0.8,
        enhancementLevel: 'template-based',
        optimizations: enhancementResult.appliedOptimizations || [],
        processingTime: result.processingTime
      });
    } else {
      console.log(`❌ Tier 2 generation failed: ${result.error}`);
      return createCorsErrorResponse(result.error || 'Template-based generation failed', 500);
    }

  } catch (error) {
    console.error('❌ Tier 2 template generation error:', error);
    return createCorsErrorResponse(`Template generation failed: ${error.message}`, 500);
  }
});

// Legacy functions removed - functionality now handled by MultiStageEnhancementPipeline

// Validate user info for template consistency
function validateUserInfo(userInfo: any): { valid: boolean; error?: string } {
  if (!userInfo) {
    return { valid: false, error: "No user info provided" };
  }
  
  if (!userInfo.name) {
    return { valid: false, error: "Missing user name" };
  }
  
  return { valid: true };
}

// Runware generation using template-built prompts
async function generateWithRunware(
  prompt: string,
  negativePrompt: string,
  parameters: any,
  sessionId: string,
  pageNumber: number
): Promise<{ success: boolean; url?: string; error?: string; processingTime?: number }> {
  const startTime = Date.now();
  
  try {
    const apiKey = Deno.env.get('RUNWARE_API_KEY');
    if (!apiKey) {
      throw new Error('Runware API key not configured');
    }

    console.log(`🚀 Generating with Runware using template-built prompt: "${prompt.substring(0, 80)}..."`);
    
    // WebSocket connection to Runware
    const ws = new WebSocket('wss://ws-api.runware.ai/v1');
    
    return new Promise((resolve) => {
      let authCompleted = false;
      const timeout = setTimeout(() => {
        ws.close();
        resolve({ success: false, error: 'Generation timeout' });
      }, 45000);

      ws.onopen = () => {
        // Authenticate first
        const authMessage = JSON.stringify([{
          taskType: "authentication",
          apiKey: apiKey
        }]);
        ws.send(authMessage);
      };

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        
        if (response.data) {
          for (const item of response.data) {
            if (item.taskType === 'authentication' && !authCompleted) {
              authCompleted = true;
              console.log('🔐 Runware authenticated, sending generation request');
              
              // PHASE 1 FIX: Emergency Truncation with proper parameters  
              console.log(`📏 Original prompt length: ${prompt.length} characters`);
              if (prompt.length > 2990) {
                console.warn(`🚨 EMERGENCY TRUNCATION: Prompt length ${prompt.length} > 2990, truncating for session ${sessionId} page ${pageNumber}...`);
                prompt = prompt.substring(0, 2990);
                console.log(`✂️ Truncated to ${prompt.length} characters for session ${sessionId}, page ${pageNumber}`);
              }

              // Send image generation request
              const generationMessage = JSON.stringify([{
                taskType: "imageInference",
                taskUUID: crypto.randomUUID(),
                positivePrompt: prompt,
                negativePrompt: negativePrompt,
                width: parameters.width || 1024,
                height: parameters.height || 1024,
                model: parameters.model || "runware:100@1",
                steps: parameters.steps || 8,
                CFGScale: parameters.CFGScale || 3.0,
                scheduler: parameters.scheduler || "FlowMatchEulerDiscreteScheduler",
                seed: parameters.seed || null,
                numberResults: 1,
                outputFormat: "WEBP"
              }]);
              
              ws.send(generationMessage);
            } else if (item.taskType === 'imageInference') {
              clearTimeout(timeout);
              ws.close();
              
              if (item.imageURL) {
                const processingTime = Date.now() - startTime;
                console.log(`✅ Runware template generation completed in ${processingTime}ms`);
                resolve({ 
                  success: true, 
                  url: item.imageURL,
                  processingTime
                });
              } else {
                resolve({ success: false, error: 'No image URL in response' });
              }
            }
          }
        }
        
        if (response.error || response.errors) {
          clearTimeout(timeout);
          ws.close();
          const errorMessage = response.errorMessage || response.errors?.[0]?.message || 'Unknown error';
          resolve({ success: false, error: errorMessage });
        }
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        console.error('❌ Runware WebSocket error:', error);
        resolve({ success: false, error: 'WebSocket connection failed' });
      };

      ws.onclose = () => {
        clearTimeout(timeout);
        if (!authCompleted) {
          resolve({ success: false, error: 'Connection closed before authentication' });
        }
      };
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Runware generation error:', error);
    return { success: false, error: error.message, processingTime };
  }
}