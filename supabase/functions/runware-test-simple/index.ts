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

    const { pageText, userInfo, difficultyLevel = 'medium' } = await req.json();

    // Import centralized style framework for consistency
    const { getStyleFramework } = await import('../_shared/styleFrameworks.js');
    
    // Extract scene with cultural context
    const extractedScene = await extractSceneWithCulture(pageText, userInfo);
    
    // Use framework for consistent styling
    const framework = getStyleFramework(difficultyLevel);
    const enhancedPrompt = `${extractedScene}. ${framework.prompt}. ${framework.quality}, ${framework.brandSuffix}.`;

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
                steps: 8,
                CFGScale: 3.0,
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

// Scene extraction using unified cultural service
async function extractSceneWithCulture(pageText: string, userInfo?: any): Promise<string> {
  if (!pageText) return 'a friendly character in a beautiful scene';
  
  const sentences = pageText.split(/[.!?]+/).filter(s => s.trim());
  
  // Intelligent scene scoring based on visual richness
  let bestScene = sentences[0] || pageText;
  let bestScore = 0;
  
  sentences.forEach(sentence => {
    let score = 0;
    const lowerSentence = sentence.toLowerCase();
    
    // Content-neutral scoring based on visual richness
    if (lowerSentence.includes('color') || lowerSentence.includes('bright') || lowerSentence.includes('beautiful')) score += 20;
    if (lowerSentence.includes('big') || lowerSentence.includes('small') || lowerSentence.includes('huge')) score += 15;
    
    // Action and character-focused content
    if (lowerSentence.includes('dance') || lowerSentence.includes('twirl') || lowerSentence.includes('jump')) score += 25;
    if (lowerSentence.includes('loved') || lowerSentence.includes('enjoyed') || lowerSentence.includes('happy')) score += 20;
    if (userInfo?.name && lowerSentence.includes(userInfo.name.toLowerCase())) score += 15;
    
    if (score > bestScore) {
      bestScore = score;
      bestScene = sentence;
    }
  });
  
  // Generate character description using unified cultural service
  let characterDesc = 'friendly child';
  if (userInfo && userInfo.avatar) {
    try {
      const { MulticulturalVisualService } = await import('../_shared/cultural-visual-service.js');
      characterDesc = MulticulturalVisualService.generateCulturalCharacterDescription(userInfo);
      
      // Use character name if mentioned in the scene
      if (userInfo.name && bestScene.toLowerCase().includes(userInfo.name.toLowerCase())) {
        characterDesc = `${userInfo.name} (${characterDesc})`;
      }
      
      console.log(`🎭 Unified character for Tier 2.5: ${characterDesc}`);
    } catch (error) {
      console.warn('⚠️ Failed to load cultural service, using fallback:', error);
      characterDesc = `${userInfo.name || 'child'} with ${userInfo.avatar?.type || 'child'} appearance`;
    }
  }
  
  return `${characterDesc}. Scene: ${bestScene}`;
}