import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";

// Stripped to pure API wrapper - all logic moved to frontend StructuredPromptEngine
serve(async (req) => {
  console.log(`🔥 Runware Generate Image: ${req.method} ${req.url}`);

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
    // Parse request
    const { 
      positivePrompt, 
      negativePrompt = '', 
      width = 1024, 
      height = 1024,
      sessionId,
      userInfo,
      seed
    } = await req.json();

    if (!positivePrompt) {
      return createCorsErrorResponse('Missing positivePrompt', 400);
    }

    console.log(`🎨 Processing image generation: "${positivePrompt.substring(0, 100)}..."`);

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
              
              // Send image generation request
              const imageRequest = [{
                taskType: "imageInference",
                taskUUID: crypto.randomUUID(),
                positivePrompt: positivePrompt,
                negativePrompt: negativePrompt,
                width: width,
                height: height,
                model: "runware:100@1",
                numberResults: 1,
                outputFormat: "WEBP",
                CFGScale: 3,
                scheduler: "FlowMatchEulerDiscreteScheduler",
                steps: 8,
                ...(seed && { seed })
              }];
              
              console.log('🚀 Sending image generation request');
              ws.send(JSON.stringify(imageRequest));
              
            } else if (item.taskType === "imageInference") {
              console.log('🎯 Image generated successfully:', item.imageURL);
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

    console.log(`✅ Image generation completed: ${result.imageURL}`);

    return createCorsResponse({
      success: true,
      imageURL: result.imageURL,
      seed: result.seed,
      metadata: {
        model: "runware:100@1",
        promptLength: positivePrompt.length,
        sessionId: sessionId || 'unknown'
      }
    });

  } catch (error) {
    console.error('❌ Generation failed:', error);
    
    return createCorsErrorResponse(
      `Image generation failed: ${error.message}`,
      500
    );
  }
});