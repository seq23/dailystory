import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  try {
    console.log('🔧 Debug function started');
    
    // Check API key
    const runwareApiKey = Deno.env.get('RUNWARE_API_KEY');
    if (!runwareApiKey) {
      console.error('❌ RUNWARE_API_KEY not found');
      return createCorsErrorResponse('RUNWARE_API_KEY not configured', 500);
    }
    
    console.log('✅ RUNWARE_API_KEY found:', runwareApiKey.substring(0, 10) + '...');
    
    // Test basic WebSocket creation
    console.log('🔌 Testing WebSocket creation...');
    
    try {
      const ws = new WebSocket("wss://ws-api.runware.ai/v1");
      console.log('✅ WebSocket created successfully');
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          ws.close();
          console.log('🕐 Timeout reached');
          resolve(createCorsResponse({
            success: true,
            message: 'WebSocket creation successful, timeout reached',
            apiKeyPresent: true,
            apiKeyPreview: runwareApiKey.substring(0, 10) + '...'
          }));
        }, 5000);

        ws.onopen = () => {
          console.log('✅ WebSocket connected');
          clearTimeout(timeout);
          ws.close();
          resolve(createCorsResponse({
            success: true,
            message: 'WebSocket connection successful',
            apiKeyPresent: true,
            apiKeyPreview: runwareApiKey.substring(0, 10) + '...'
          }));
        };

        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          clearTimeout(timeout);
          resolve(createCorsErrorResponse(`WebSocket error: ${error}`));
        };

        ws.onclose = (event) => {
          console.log('🔌 WebSocket closed:', event.code, event.reason);
        };
      });
      
    } catch (wsError) {
      console.error('❌ WebSocket creation failed:', wsError);
      return createCorsErrorResponse(`WebSocket creation failed: ${wsError.message}`);
    }
    
  } catch (error) {
    console.error('❌ Debug function error:', error);
    return createCorsErrorResponse(`Debug error: ${error.message}`);
  }
});