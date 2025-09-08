import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  try {
    console.log('🧪 Testing Runware API integration...');
    
    // Check API key
    const runwareApiKey = Deno.env.get('RUNWARE_API_KEY');
    if (!runwareApiKey) {
      console.error('❌ RUNWARE_API_KEY not found');
      return createCorsErrorResponse('RUNWARE_API_KEY not configured', 500);
    }
    
    console.log('✅ RUNWARE_API_KEY found:', runwareApiKey.substring(0, 10) + '...');
    
    // Test WebSocket connection
    console.log('🔌 Testing WebSocket connection...');
    
    const wsTest = await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ success: false, error: 'Connection timeout' });
      }, 10000);

      try {
        const ws = new WebSocket("wss://ws-api.runware.ai/v1");
        
        ws.onopen = () => {
          console.log('✅ WebSocket connected, testing authentication...');
          
          // Send authentication
          ws.send(JSON.stringify([{
            taskType: "authentication",
            apiKey: runwareApiKey
          }]));
        };

        ws.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data);
            console.log('📨 WebSocket response:', response);
            
            if (response.data?.[0]?.taskType === 'authentication') {
              const authStatus = response.data[0].authenticationStatus;
              clearTimeout(timeout);
              ws.close();
              
              if (authStatus === 'success') {
                resolve({
                  success: true,
                  message: 'Authentication successful',
                  sessionUUID: response.data[0].connectionSessionUUID
                });
              } else {
                resolve({
                  success: false,
                  error: `Authentication failed: ${authStatus}`
                });
              }
            }
          } catch (parseError) {
            clearTimeout(timeout);
            ws.close();
            resolve({
              success: false,
              error: `Parse error: ${parseError.message}`
            });
          }
        };

        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          clearTimeout(timeout);
          resolve({
            success: false,
            error: `WebSocket error: ${error}`
          });
        };

        ws.onclose = (event) => {
          console.log('🔌 WebSocket closed:', event.code, event.reason);
          if (timeout) {
            clearTimeout(timeout);
            resolve({
              success: false,
              error: `WebSocket closed: ${event.code} - ${event.reason}`
            });
          }
        };
        
      } catch (wsError) {
        clearTimeout(timeout);
        resolve({
          success: false,
          error: `WebSocket creation failed: ${wsError.message}`
        });
      }
    });

    return createCorsResponse({
      success: wsTest.success,
      message: wsTest.message || wsTest.error,
      apiKeyPresent: true,
      apiKeyPreview: runwareApiKey.substring(0, 10) + '...',
      wsTest
    });
    
  } catch (error) {
    console.error('❌ Test function error:', error);
    return createCorsErrorResponse(`Test error: ${error.message}`);
  }
});