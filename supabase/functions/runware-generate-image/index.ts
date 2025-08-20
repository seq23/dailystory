import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";

// Phase 1: Premium AI-Enhanced Tier 1 using EnhancedPromptBuilder
serve(async (req) => {
  console.log(`🔥 Tier 1: Premium AI-Enhanced Image Generation: ${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  // Validate API key
  const apiKey = Deno.env.get('RUNWARE_API_KEY');
  if (!apiKey) {
    console.error('❌ RUNWARE_API_KEY not found in environment');
    return createCorsErrorResponse('Server configuration error', 500);
  }

  try {
    // Parse request - now accepts structured data for AI enhancement
    const { 
      pageText, 
      userInfo, 
      sessionId,
      pageNumber = 1,
      totalPages = 10,
      seed,
      enhancedStoryData // New parameter for AI-enhanced data
    } = await req.json();

    if (!pageText) {
      return createCorsErrorResponse('Missing pageText parameter', 400);
    }

    console.log(`🎨 Tier 1 premium processing: page ${pageNumber}/${totalPages}`);
    console.log(`🧠 AI Enhancement Data: ${enhancedStoryData ? 'Available' : 'Not provided'}`);

    // Use MultiStageEnhancementPipeline for premium AI processing
    const { MultiStageEnhancementPipeline } = await import("../_shared/MultiStageEnhancementPipeline.js");
    const enhancementResult = await MultiStageEnhancementPipeline.processTier1Premium(
      pageText, 
      userInfo, 
      sessionId, 
      pageNumber, 
      totalPages,
      enhancedStoryData // Pass AI-enhanced data if available
    );
    
    const positivePrompt = enhancementResult.enhancedPrompt;
    const negativePrompt = enhancementResult.negativePrompt;

    console.log(`🎨 Premium AI-enhanced prompt: "${positivePrompt.substring(0, 100)}..."`);

    // Create WebSocket connection to Runware
    const ws = new WebSocket('wss://ws-api.runware.ai/v1');
    
    const result = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('WebSocket timeout'));
      }, 30000);

      ws.onopen = () => {
        console.log('📡 WebSocket connected to Runware');
        
        // Send authentication
        ws.send(JSON.stringify([{
          taskType: "authentication",
          apiKey: apiKey
        }]));
      };

      ws.onmessage = (event) => {
        console.log('📩 WebSocket message:', event.data);
        const response = JSON.parse(event.data);
        
        if (response.error || response.errors) {
          console.error('❌ Runware error:', response);
          clearTimeout(timeout);
          ws.close();
          reject(new Error(response.errorMessage || response.errors?.[0]?.message || 'Generation failed'));
          return;
        }

        if (response.data) {
          for (const item of response.data) {
            if (item.taskType === "authentication") {
              console.log('✅ Runware authenticated');
              
              // Send premium image generation request with higher quality settings
              const imageRequest = [{
                taskType: "imageInference",
                taskUUID: crypto.randomUUID(),
                positivePrompt: positivePrompt,
                negativePrompt: negativePrompt,
                width: 1024,
                height: 1024,
                model: "runware:100@1",
                numberResults: 1,
                outputFormat: "WEBP",
                CFGScale: 4.0, // Higher for premium quality
                scheduler: "FlowMatchEulerDiscreteScheduler",
                steps: 12, // More steps for premium quality
                ...(seed && { seed })
              }];
              
              console.log('🚀 Sending premium image generation request');
              ws.send(JSON.stringify(imageRequest));
              
            } else if (item.taskType === "imageInference") {
              console.log('🎯 Premium image generated successfully:', item.imageURL);
              
              // Store successful generation in visual state for consistency
              if (sessionId && enhancementResult?.metadata?.characterSeed) {
                try {
                  const { StoryVisualStateManager } = await import('../_shared/storyVisualState.js');
                  
                  // Store successful prompt and seed for character consistency
                  StoryVisualStateManager.addSuccessfulPrompt(
                    sessionId, 
                    enhancementResult.enhancedPrompt, 
                    enhancementResult.generationParams, 
                    item.seed || enhancementResult.metadata.characterSeed
                  );
                  
                  // Update character appearance if we have character description
                  if (userInfo?.name) {
                    const characterDescription = `Generated with seed ${item.seed}, ${enhancementResult.metadata.difficulty} style`;
                    StoryVisualStateManager.updateCharacterWithSeed(
                      sessionId, 
                      userInfo.name, 
                      item.seed || enhancementResult.metadata.characterSeed,
                      characterDescription
                    );
                  }
                  
                  console.log('📝 Stored visual state for session:', sessionId);
                } catch (visualStateError) {
                  console.warn('⚠️ Failed to store visual state (non-critical):', visualStateError);
                }
              }
              
              clearTimeout(timeout);
              ws.close();
              resolve({
                imageURL: item.imageURL,
                seed: item.seed,
                taskUUID: item.taskUUID
              });
            }
          }
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        clearTimeout(timeout);
        reject(new Error('WebSocket connection failed'));
      };

      ws.onclose = () => {
        console.log('📡 WebSocket closed');
        clearTimeout(timeout);
      };
    });

    console.log(`✅ Tier 1 premium generation completed: ${result.imageURL}`);

    return createCorsResponse({
      success: true,
      imageURL: result.imageURL,
      seed: result.seed,
      provider: 'runware-premium',
      tier: 1,
      enhancementLevel: 'premium-ai',
      qualityScore: enhancementResult.qualityScore || 95,
      metadata: {
        model: "runware:100@1",
        promptLength: positivePrompt.length,
        sessionId: sessionId || 'unknown',
        pageNumber,
        totalPages,
        visualStateEnabled: true,
        enhancementMetadata: enhancementResult.metadata
      }
    });

  } catch (error) {
    console.error('❌ Tier 1 generation failed:', error);
    
    return createCorsErrorResponse(
      `Tier 1 premium generation failed: ${error.message}`,
      500
    );
  }
});

// All AI enhancement logic moved to MultiStageEnhancementPipeline
// This ensures single source of truth and no code duplication