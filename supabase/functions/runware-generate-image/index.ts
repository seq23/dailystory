import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { COMPREHENSIVE_HEADER_BASELINE } from "../_shared/corsAdvanced.js";

// Comprehensive CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': COMPREHENSIVE_HEADER_BASELINE.join(', '),
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// CORS Response Functions
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

// Generate request ID for tracing
function generateRequestId(): string {
  return `REQ-${Math.random().toString(36).substr(2, 8)}-${Math.random().toString(36).substr(2, 5)}`;
}

serve(async (req) => {
  const requestId = generateRequestId();
  console.log(`[${requestId}] Image orchestrator request received`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  // Handle health check requests
  if (req.method === 'GET' || (req.method === 'POST' && req.url.includes('/health'))) {
    return createCorsResponse({
      status: 'healthy',
      service: 'runware-generate-image',
      timestamp: new Date().toISOString(),
      requestId
    });
  }

  try {
    const { pageText, userInfo, sessionId, pageNumber = 1, healthCheck } = await req.json();
    
    // Handle health check
    if (healthCheck) {
      return createCorsResponse({
        status: 'healthy',
        service: 'runware-generate-image',
        timestamp: new Date().toISOString(),
        apiKeyPresent: !!runwareApiKey,
        requestId
      });
    }
    
    if (!pageText) {
      return createCorsErrorResponse('pageText is required', 400);
    }

    console.log(`[${requestId}] Generating image for page ${pageNumber}, session: ${sessionId}`);

    // Check API key
    const runwareApiKey = Deno.env.get('RUNWARE_API_KEY');
    if (!runwareApiKey) {
      console.error(`[${requestId}] RUNWARE_API_KEY not found`);
      return createCorsErrorResponse('RUNWARE_API_KEY not configured', 500);
    }

    // HTTP-First Approach: Try HTTP API first, then WebSocket as fallback
    let imageResult = null;
    let generationMethod = 'unknown';

    console.log(`[${requestId}] Attempting HTTP API first...`);
    
    try {
      // Try HTTP API first (faster, more reliable on edge)
      const httpResponse = await fetch('https://api.runware.ai/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            taskType: "authentication",
            apiKey: runwareApiKey
          },
          {
            taskType: "imageInference",
            taskUUID: crypto.randomUUID(),
            positivePrompt: `Children's book illustration: ${pageText}`,
            width: 1024,
            height: 1024,
            model: "runware:100@1",
            numberResults: 1,
            outputFormat: "WEBP",
            CFGScale: 7,
            scheduler: "FlowMatchEulerDiscreteScheduler"
          }
        ])
      });

      if (httpResponse.ok) {
        const httpData = await httpResponse.json();
        const imageData = httpData.data?.find((item: any) => item.taskType === 'imageInference');
        
        if (imageData?.imageURL) {
          imageResult = imageData;
          generationMethod = 'HTTP';
          console.log(`[${requestId}] HTTP API success: ${imageData.imageURL}`);
        } else {
          throw new Error('No image data in HTTP response');
        }
      } else {
        throw new Error(`HTTP API failed: ${httpResponse.status}`);
      }
    } catch (httpError) {
      console.log(`[${requestId}] HTTP API failed, trying WebSocket fallback: ${httpError.message}`);
      
      // Fallback to WebSocket
      imageResult = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket timeout after 15 seconds'));
        }, 15000);

        try {
          const ws = new WebSocket("wss://ws-api.runware.ai/v1");
          let authenticated = false;
          
          ws.onopen = () => {
            console.log(`[${requestId}] WebSocket connected, authenticating...`);
            ws.send(JSON.stringify([{
              taskType: "authentication",
              apiKey: runwareApiKey
            }]));
          };

          ws.onmessage = (event) => {
            try {
              const response = JSON.parse(event.data);
              
              if (response.data) {
                response.data.forEach((item: any) => {
                  if (item.taskType === 'authentication' && item.authenticationStatus === 'success') {
                    authenticated = true;
                    console.log(`[${requestId}] WebSocket authenticated, generating image...`);
                    
                    ws.send(JSON.stringify([{
                      taskType: "imageInference",
                      taskUUID: crypto.randomUUID(),
                      positivePrompt: `Children's book illustration: ${pageText}`,
                      width: 1024,
                      height: 1024,
                      model: "runware:100@1",
                      numberResults: 1,
                      outputFormat: "WEBP",
                      CFGScale: 7,
                      scheduler: "FlowMatchEulerDiscreteScheduler"
                    }]));
                  } else if (item.taskType === 'imageInference' && item.imageURL) {
                    clearTimeout(timeout);
                    ws.close();
                    generationMethod = 'WebSocket';
                    console.log(`[${requestId}] WebSocket success: ${item.imageURL}`);
                    resolve(item);
                  }
                });
              }
            } catch (parseError) {
              clearTimeout(timeout);
              ws.close();
              reject(new Error(`WebSocket parse error: ${parseError.message}`));
            }
          };

          ws.onerror = (error) => {
            clearTimeout(timeout);
            reject(new Error(`WebSocket error: ${error}`));
          };

          ws.onclose = (event) => {
            if (timeout) {
              clearTimeout(timeout);
              if (!authenticated) {
                reject(new Error(`WebSocket closed before authentication: ${event.code} - ${event.reason}`));
              }
            }
          };
          
        } catch (wsError) {
          clearTimeout(timeout);
          reject(new Error(`WebSocket creation failed: ${wsError.message}`));
        }
      });
    }

    if (!imageResult || !imageResult.imageURL) {
      throw new Error('Failed to generate image via both HTTP and WebSocket');
    }

    console.log(`[${requestId}] Image generation successful via ${generationMethod}`);

    return createCorsResponse({
      success: true,
      imageURL: imageResult.imageURL,
      method: generationMethod,
      seed: imageResult.seed,
      pageNumber,
      sessionId,
      timestamp: new Date().toISOString(),
      requestId
    });
    
  } catch (error) {
    console.error(`[${requestId}] Image orchestrator error:`, error);
    return createCorsErrorResponse(`Image generation failed: ${error.message}`);
  }
});