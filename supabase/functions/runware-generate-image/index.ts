import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";

// Phase 2: Enhanced Backend Orchestrator for All Image Generation Tiers
// Now handles: AI Enhancement → Tier 1 → Tier 2 → Tier 2.5 → Tier 3 → Tier 4
serve(async (req) => {
  console.log(`🎯 Image Generation Orchestrator: ${req.method} ${req.url}`);

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
    // Import orchestrator services
    const { StoryVisualStateManager } = await import('../_shared/storyVisualState.js');
    const { MultiStageEnhancementPipeline } = await import("../_shared/MultiStageEnhancementPipeline.js");
    
    // Parse request
    const { 
      pageText, 
      userInfo, 
      storyId,
      sessionId = storyId,
      pageNumber = 1,
      totalPages = 10,
      seed,
      enhancedStoryData,
      forceTier // Optional: force specific tier for testing
    } = await req.json();

    if (!pageText) {
      return createCorsErrorResponse('Missing pageText parameter', 400);
    }

    console.log(`🎯 Starting image orchestration for page ${pageNumber}/${totalPages}`);
    console.log(`🧠 Enhanced data available: ${enhancedStoryData ? 'Yes' : 'No'}`);

    // TIER 1: AI-Enhanced High-Quality (Premium Tier)
    if (!forceTier || forceTier === 1) {
      try {
        console.log('🧠 Starting Tier 1: AI-Enhanced High-Quality Generation');
        
        // Use MultiStageEnhancementPipeline for premium AI processing
        const enhancementResult = await MultiStageEnhancementPipeline.processTier1HighQuality(
          pageText, 
          userInfo, 
          storyId,
          sessionId, 
          pageNumber, 
          totalPages,
          enhancedStoryData
        );
        
        const positivePrompt = enhancementResult.enhancedPrompt;
        const negativePrompt = enhancementResult.negativePrompt;

        console.log(`🎨 Premium AI-enhanced prompt (${positivePrompt.length} chars):`, positivePrompt.substring(0, 100) + '...');

        // Generate with Runware Tier 1 (Premium)
        const tier1Result = await generateWithRunwarePremium(apiKey, positivePrompt, negativePrompt, seed);
        
        if (tier1Result.success) {
          console.log('✅ Tier 1 AI-Enhanced succeeded');
          
          // Store visual state for consistency
          if (sessionId && enhancementResult?.metadata?.characterSeed) {
            try {
              StoryVisualStateManager.addSuccessfulPrompt(
                sessionId, 
                positivePrompt,
                enhancementResult.generationParams, 
                tier1Result.seed || enhancementResult.metadata.characterSeed,
                tier1Result.imageURL,
                pageNumber
              );
            } catch (error) {
              console.warn('⚠️ Failed to store visual state (non-critical):', error);
            }
          }

          return createCorsResponse({
            success: true,
            imageURL: tier1Result.imageURL,
            seed: tier1Result.seed,
            provider: 'runware-orchestrator',
            tier: 1,
            enhancementLevel: 'ai-enhanced-premium',
            qualityScore: enhancementResult.qualityScore || 95,
            metadata: {
              model: "runware:100@1",
              promptLength: positivePrompt.length,
              sessionId: sessionId || 'unknown',
              pageNumber,
              totalPages,
              orchestrated: true
            }
          });
        }
        
        console.log('⚠️ Tier 1 failed, falling back to Tier 2');
      } catch (error) {
        console.log('⚠️ Tier 1 error, falling back to Tier 2:', error.message);
      }
    }

    // TIER 2: Template-based Generation  
    if (!forceTier || forceTier === 2) {
      try {
        console.log('🎨 Starting Tier 2: Template-based Generation');
        
        const tier2Result = await callTierFunction('runware-template-generation', {
          pageText,
          userInfo,
          storyId,
          sessionId,
          pageNumber,
          totalPages,
          difficultyLevel: 'medium'
        });

        if (tier2Result.success) {
          console.log('✅ Tier 2 Template-based succeeded');
          return createCorsResponse({
            success: true,
            imageURL: tier2Result.imageURL,
            seed: tier2Result.seed,
            provider: 'runware-orchestrator',
            tier: 2,
            enhancementLevel: 'template-based',
            metadata: { ...tier2Result.metadata, orchestrated: true }
          });
        }
        
        console.log('⚠️ Tier 2 failed, falling back to Tier 2.5');
      } catch (error) {
        console.log('⚠️ Tier 2 error, falling back to Tier 2.5:', error.message);
      }
    }

    // TIER 2.5: Nuclear Hardcoded Fallback
    if (!forceTier || forceTier === 2.5) {
      try {
        console.log('🔧 Starting Tier 2.5: Nuclear Hardcoded Fallback');
        
        const tier25Result = await callTierFunction('runware-simple-fallback', {
          pageText,
          userInfo,
          difficultyLevel: 'medium'
        });

        if (tier25Result.success) {
          console.log('✅ Tier 2.5 Nuclear Hardcoded succeeded');
          return createCorsResponse({
            success: true,
            imageURL: tier25Result.imageURL,
            seed: tier25Result.seed,
            provider: 'runware-orchestrator',
            tier: 2.5,
            enhancementLevel: 'nuclear-hardcoded',
            metadata: { orchestrated: true }
          });
        }
        
        console.log('⚠️ Tier 2.5 failed, falling back to Tier 3');
      } catch (error) {
        console.log('⚠️ Tier 2.5 error, falling back to Tier 3:', error.message);
      }
    }

    // TIER 3: OpenAI DALL-E Fallback
    if (!forceTier || forceTier === 3) {
      try {
        console.log('🎯 Starting Tier 3: OpenAI DALL-E Generation');
        
        const tier3Result = await callTierFunction('openai-image', {
          positivePrompt: `Children's book illustration: ${pageText}. Bright, colorful, safe for children.`,
          negativePrompt: "text, letters, words, writing, signs, watermarks, ugly, deformed, bad anatomy, photorealistic, anime",
          size: '1024x1024',
          model: 'gpt-image-1',
          quality: 'standard'
        });

        if (tier3Result.success) {
          console.log('✅ Tier 3 OpenAI succeeded');
          return createCorsResponse({
            success: true,
            imageURL: tier3Result.imageURL,
            provider: 'runware-orchestrator',
            tier: 3,
            enhancementLevel: 'openai-fallback',
            metadata: { orchestrated: true }
          });
        }
        
        console.log('⚠️ Tier 3 failed, falling back to Tier 4');
      } catch (error) {
        console.log('⚠️ Tier 3 error, falling back to Tier 4:', error.message);
      }
    }

    // TIER 4: SVG Placeholder (Guaranteed Success)
    console.log('📝 Generating Tier 4: SVG Placeholder');
    const svgResult = generateSVGPlaceholder(pageText, userInfo);
    
    return createCorsResponse({
      success: true,
      imageURL: svgResult.url,
      provider: 'runware-orchestrator',
      tier: 4,
      enhancementLevel: 'svg-placeholder',
      metadata: { orchestrated: true }
    });

  } catch (error) {
    console.error('❌ Image orchestration failed:', error);
    
    return createCorsErrorResponse(
      `Image generation orchestration failed: ${error.message}`,
      500
    );
  }
});

// TIER 1: Premium Runware Generation
async function generateWithRunwarePremium(apiKey: string, positivePrompt: string, negativePrompt: string, seed?: number) {
  const ws = new WebSocket('wss://ws-api.runware.ai/v1');
  
  return new Promise((resolve, reject) => {
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
            
            // Send premium image generation request
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
              CFGScale: 4.0,
              scheduler: "FlowMatchEulerDiscreteScheduler",
              steps: 12,
              ...(seed && { seed })
            }];
            
            console.log('🚀 Sending premium image generation request');
            ws.send(JSON.stringify(imageRequest));
            
          } else if (item.taskType === "imageInference") {
            console.log('🎯 Premium image generated successfully:', item.imageURL);
            
            clearTimeout(timeout);
            ws.close();
            resolve({
              success: true,
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
}

// Helper: Call other tier functions
async function callTierFunction(functionName: string, params: any) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error(`${functionName} failed: ${response.status}`);
  }

  return await response.json();
}

// Helper: Generate SVG Placeholder
function generateSVGPlaceholder(pageText: string, userInfo: any) {
  const characterName = userInfo?.name || 'Character';
  const shortScene = pageText.substring(0, 50);
  
  const svgContent = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="#f0f9ff"/>
      <circle cx="200" cy="150" r="60" fill="#ddd6fe"/>
      <text x="200" y="250" text-anchor="middle" font-family="Arial" font-size="16" fill="#1f2937">
        ${characterName}
      </text>
      <text x="200" y="280" text-anchor="middle" font-family="Arial" font-size="12" fill="#6b7280">
        ${shortScene}...
      </text>
      <text x="200" y="320" text-anchor="middle" font-family="Arial" font-size="10" fill="#9ca3af">
        Story illustration loading...
      </text>
    </svg>
  `;
  
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  return { url, success: true };
}