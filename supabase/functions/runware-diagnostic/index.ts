import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";
import { getStyleFramework } from '../_shared/styleFrameworks.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  try {
    console.log('🔧 Starting Runware diagnostic...');
    
    // Step 1: Check API key
    const runwareApiKey = Deno.env.get('RUNWARE_API_KEY');
    if (!runwareApiKey) {
      console.error('❌ RUNWARE_API_KEY not found in environment');
      return createCorsErrorResponse('RUNWARE_API_KEY not configured', 500);
    }
    
    console.log('✅ RUNWARE_API_KEY found:', runwareApiKey.substring(0, 10) + '...');
    
    // Step 2: Test style frameworks (now statically imported)
    try {
      const framework = getStyleFramework('medium');
      console.log('✅ Style framework imported successfully:', framework.name);
    } catch (error) {
      console.error('❌ Style framework import failed:', error);
      return createCorsErrorResponse(`Style framework error: ${error.message}`, 500);
    }
    
    // Step 3: Test WebSocket creation and connection
    console.log('🔌 Testing WebSocket connection to Runware...');
    
    const ws = new WebSocket("wss://ws-api.runware.ai/v1");
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.error('❌ WebSocket connection timeout');
        ws.close();
        resolve(createCorsErrorResponse("WebSocket connection timeout", 408));
      }, 15000); // 15 second timeout
      
      let authSent = false;
      let authReceived = false;
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        console.log('📤 Sending authentication...');
        
        try {
          ws.send(JSON.stringify([{
            taskType: "authentication",
            apiKey: runwareApiKey
          }]));
          authSent = true;
          console.log('✅ Authentication message sent');
        } catch (error) {
          console.error('❌ Failed to send auth message:', error);
          clearTimeout(timeout);
          ws.close();
          resolve(createCorsErrorResponse(`Auth send failed: ${error.message}`, 500));
        }
      };

      ws.onmessage = (event) => {
        console.log('📥 WebSocket message received:', event.data);
        
        try {
          const response = JSON.parse(event.data);
          
          if (response.error || response.errors) {
            console.error('❌ API error response:', response);
            clearTimeout(timeout);
            ws.close();
            const errorMsg = response.errorMessage || response.errors?.[0]?.message || 'Unknown API error';
            resolve(createCorsErrorResponse(`API error: ${errorMsg}`, 400));
            return;
          }
          
          if (response.data) {
            response.data.forEach((item: any) => {
              if (item.taskType === "authentication") {
                console.log('✅ Authentication successful!');
                console.log('🔑 Session UUID:', item.connectionSessionUUID);
                authReceived = true;
                
                // Test a simple image generation
                console.log('🎨 Testing simple image generation...');
                const taskUUID = crypto.randomUUID();
                
                ws.send(JSON.stringify([{
                  taskType: "imageInference",
                  taskUUID,
                  positivePrompt: "a simple test image of a red apple on a white background",
                  model: "runware:100@1",
                  width: 512,
                  height: 512,
                  numberResults: 1,
            outputFormat: "WEBP",
            steps: 30, // FIXED: Enhanced from 25 for better quality
            CFGScale: 10, // FIXED: Enhanced from 8 for better adherence
            scheduler: "FlowMatchEulerDiscreteScheduler"
                }]));
                
              } else if (item.taskType === "imageInference") {
                console.log('✅ Image generation successful!');
                console.log('🖼️ Image URL:', item.imageURL);
                console.log('💰 Cost:', item.cost);
                console.log('🎲 Seed:', item.seed);
                
                clearTimeout(timeout);
                ws.close();
                
                resolve(createCorsResponse({
                  success: true,
                  message: 'All Runware systems operational',
                  diagnostics: {
                    apiKeyFound: true,
                    styleFrameworkLoaded: true,
                    websocketConnected: true,
                    authenticationSuccessful: true,
                    imageGenerationWorking: true,
                    testImageUrl: item.imageURL,
                    testCost: item.cost,
                    testSeed: item.seed
                  }
                }));
              }
            });
          }
        } catch (parseError) {
          console.error('❌ Failed to parse WebSocket message:', parseError);
          clearTimeout(timeout);
          ws.close();
          resolve(createCorsErrorResponse(`Message parse error: ${parseError.message}`, 500));
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        clearTimeout(timeout);
        resolve(createCorsErrorResponse(`WebSocket error: ${error}`, 500));
      };
      
      ws.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        if (!authReceived && authSent) {
          clearTimeout(timeout);
          resolve(createCorsErrorResponse('WebSocket closed before authentication completed', 500));
        }
      };
    });

  } catch (error) {
    console.error('❌ Diagnostic function error:', error);
    return createCorsErrorResponse(`Diagnostic error: ${error.message}`, 500);
  }
});