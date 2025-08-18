import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  try {
    const runwareApiKey = Deno.env.get('RUNWARE_API_KEY');
    if (!runwareApiKey) {
      return createCorsErrorResponse('RUNWARE_API_KEY not configured', 500);
    }

    const { pageText } = await req.json();

    // Import centralized style framework for consistency
    const { getStyleFramework } = await import('../_shared/styleFrameworks.js');
    
    // Use default difficulty for simple test
    const framework = getStyleFramework('medium');
    const enhancedPrompt = `${framework.prompt}: ${pageText || 'a friendly character'}. ${framework.quality}, ${framework.brandSuffix}.`;

    console.log('🎨 Testing Runware with prompt:', enhancedPrompt.substring(0, 100));

    const ws = new WebSocket("wss://ws-api.runware.ai/v1");
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        ws.close();
        resolve(createCorsErrorResponse("Timeout", 408));
      }, 10000);

      ws.onopen = () => {
        console.log("WebSocket connected, sending auth...");
        ws.send(JSON.stringify([{
          taskType: "authentication",
          apiKey: runwareApiKey
        }]));
      };

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        console.log("Response:", response);
        
        if (response.data) {
          response.data.forEach((item: any) => {
            if (item.taskType === "authentication") {
              console.log("Authenticated! Sending image request...");
              
              const taskUUID = crypto.randomUUID();
              ws.send(JSON.stringify([{
                taskType: "imageInference",
                taskUUID,
                positivePrompt: enhancedPrompt,
                model: "runware:100@1",
                width: 1024,
                height: 1024,
                numberResults: 1,
                outputFormat: "WEBP",
                steps: 3,
                CFGScale: 1.5,
                scheduler: "FlowMatchEulerDiscreteScheduler"
              }]));
              
            } else if (item.taskType === "imageInference") {
              clearTimeout(timeout);
              ws.close();
              
              resolve(createCorsResponse({
                success: true,
                imageURL: item.imageURL,
                seed: item.seed,
                cost: item.cost
              }));
            }
          });
        }
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        console.error("WebSocket error:", error);
        resolve(createCorsErrorResponse("WebSocket failed"));
      };
    });

  } catch (error) {
    console.error('Error:', error);
    return createCorsErrorResponse(`Error: ${error.message}`);
  }
});