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
      seed
    } = await req.json();

    if (!pageText) {
      return createCorsErrorResponse('Missing pageText parameter', 400);
    }

    console.log(`🎨 Tier 1 premium processing: page ${pageNumber}/${totalPages}`);

    // Use EnhancedPromptBuilder for premium AI processing
    const enhancementResult = await buildEnhancedPrompt(pageText, userInfo, sessionId, pageNumber);
    
    const positivePrompt = enhancementResult.prompt;
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
        totalPages
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

// Premium AI Enhancement using simplified EnhancedPromptBuilder logic
async function buildEnhancedPrompt(pageText, userInfo, sessionId, pageNumber) {
  try {
    // Simplified character consistency and prompt building
    const characterSeed = getCharacterSeed(userInfo, sessionId);
    
    // Extract primary scene from page text
    const primaryScene = extractPrimaryScene(pageText);
    
    // Build character description
    const characterDesc = buildCharacterDescription(userInfo);
    
    // Get cultural context
    const culturalContext = getCulturalContext(userInfo);
    
    // Build enhancement styles
    const styleElements = getStyleElements(userInfo);
    
    // Compose premium prompt
    const prompt = `${primaryScene} featuring ${characterDesc}, ${culturalContext}, ${styleElements}, premium children's book illustration, masterful digital art, perfect composition, professional quality`;
    
    // Build comprehensive negative prompt
    const negativePrompt = buildNegativePrompt(userInfo);
    
    return {
      prompt,
      negativePrompt,
      qualityScore: 95,
      characterSeed
    };
    
  } catch (error) {
    console.error('❌ Enhancement error:', error);
    return {
      prompt: `${pageText}, beautiful children's book illustration`,
      negativePrompt: "text, words, scary, dark",
      qualityScore: 70
    };
  }
}

function getCharacterSeed(userInfo, sessionId) {
  if (!userInfo?.name) return null;
  // Simple character consistency - hash name + session for seed
  let hash = 0;
  const str = (userInfo.name + sessionId).toLowerCase();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 1000000;
}

function extractPrimaryScene(pageText) {
  if (!pageText) return 'a beautiful children\'s book scene';
  
  const sentences = pageText.split(/[.!?]+/).filter(s => s.trim().length > 5);
  const longestSentence = sentences.reduce((a, b) => a.length > b.length ? a : b, '');
  
  return longestSentence.trim() || pageText.substring(0, 100);
}

function buildCharacterDescription(userInfo) {
  if (!userInfo) return 'friendly child character';
  
  let desc = userInfo.name || 'child';
  
  if (userInfo.avatar) {
    const skinToneMap = {
      'pale': 'fair skin',
      'light': 'light skin',
      'medium': 'medium skin',
      'olive': 'olive skin', 
      'dark': 'dark skin'
    };
    
    const hairMap = {
      'pale': 'blonde hair',
      'light': 'brown hair',
      'medium': 'brown hair',
      'olive': 'dark brown hair',
      'dark': 'black hair'
    };
    
    const skinTone = skinToneMap[userInfo.avatar.skinTone] || 'medium skin';
    const hairColor = hairMap[userInfo.avatar.skinTone] || 'brown hair';
    const gender = userInfo.avatar.type || 'child';
    
    desc += ` (${gender} with ${skinTone} and ${hairColor})`;
  }
  
  return desc;
}

function getCulturalContext(userInfo) {
  if (!userInfo?.nativeLanguage || userInfo.nativeLanguage === 'en') {
    return 'diverse American setting';
  }
  
  const culturalMap = {
    'es': 'Latino cultural setting',
    'fr': 'French cultural elements',
    'zh': 'Chinese cultural background',
    'ar': 'Arabic cultural context',
    'hi': 'Indian cultural heritage',
    'pt': 'Brazilian cultural warmth'
  };
  
  return culturalMap[userInfo.nativeLanguage] || 'multicultural setting';
}

function getStyleElements(userInfo) {
  const difficulty = userInfo?.difficultyLevel || userInfo?.readingLevel || 'medium';
  
  const styleMap = {
    'beginner': '3D children\'s book art, bright cheerful colors, smooth rendering',
    'easy': '3D children\'s book art, bright cheerful colors, smooth rendering',
    'medium': 'digital children\'s book illustration, warm colors, soft lighting',
    'hard': 'sophisticated digital art, nuanced colors, artistic composition',
    'expert': 'masterful illustration, complex color theory, intricate details'
  };
  
  return styleMap[difficulty] || styleMap['medium'];
}

function buildNegativePrompt(userInfo) {
  let negative = 'NO TEXT, no letters, no words, no writing, no signs, no symbols, ugly, deformed, bad anatomy, extra limb, mutation, poorly drawn, cropped, lowres, worst quality, low quality, blurry, text, error, adult, mature, violence, scary, dark, inappropriate, nsfw, suggestive, weapons, photorealistic, anime, copyrighted characters, brand logos';
  
  // Add gender consistency
  if (userInfo?.avatar?.type === 'girl') {
    negative += ', boy character, male character, masculine features';
  } else if (userInfo?.avatar?.type === 'boy') {
    negative += ', girl character, female character, feminine features, dress, skirt';
  }
  
  return negative;
}