import { serve } from "https://deno.land/std@0.168.0/http/server.js"
import "https://deno.land/x/xhr@0.1.0/mod.js"
import { COMPREHENSIVE_HEADER_BASELINE } from "../_shared/corsAdvanced.ts";

// Comprehensive CORS Headers  
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': COMPREHENSIVE_HEADER_BASELINE.join(', '),
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

function createCorsResponse(data: any, status = 200) {
  const headers = { 
    ...corsHeaders, 
    'Content-Type': 'application/json' 
  };
  return new Response(JSON.stringify(data), { status, headers });
}

function createCorsErrorResponse(error: any, status = 500) {
  const errorMessage = error instanceof Error ? error.message : error;
  console.error('Edge function error:', errorMessage);
  return createCorsResponse({ 
    success: false, 
    error: errorMessage,
    timestamp: new Date().toISOString()
  }, status);
}

function createCorsOptionsResponse() {
  return new Response(null, { headers: corsHeaders });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  // Parse body for health check detection
  let body: any = null;
  try {
    body = await req.json();
  } catch (_) {
    body = null;
  }

  // Handle health check requests
  if (req.method === 'GET' || body?.healthCheck) {
    return createCorsResponse({
      status: 'healthy',
      service: 'test-runware-api',
      timestamp: new Date().toISOString()
    });
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