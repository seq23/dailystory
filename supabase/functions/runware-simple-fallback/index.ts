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

    console.log('🎨 Tier 2.5: Simple fallback generation with hardcoded extraction');

    // Hardcoded scene extraction (no dependencies)
    const extractedScene = extractSimpleScene(pageText, userInfo);
    
    // Hardcoded style based on difficulty
    const style = getHardcodedStyle(difficultyLevel);
    
    // Build final prompt
    const finalPrompt = `${extractedScene}. ${style.prompt}. ${style.quality}. ${style.suffix}`;
    
    console.log('🎨 Tier 2.5 prompt:', finalPrompt.substring(0, 150) + '...');

    const ws = new WebSocket("wss://ws-api.runware.ai/v1");
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        ws.close();
        resolve(createCorsErrorResponse("Timeout", 408));
      }, 12000);

      ws.onopen = () => {
        console.log("Tier 2.5: WebSocket connected, authenticating...");
        ws.send(JSON.stringify([{
          taskType: "authentication",
          apiKey: runwareApiKey
        }]));
      };

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        
        if (response.error || response.errors) {
          clearTimeout(timeout);
          ws.close();
          const errorMsg = response.errorMessage || response.errors?.[0]?.message || 'API error';
          resolve(createCorsErrorResponse(`Tier 2.5 error: ${errorMsg}`, 400));
          return;
        }
        
        if (response.data) {
          response.data.forEach((item: any) => {
            if (item.taskType === "authentication") {
              console.log("Tier 2.5: Authenticated! Generating image...");
              
              const taskUUID = crypto.randomUUID();
              ws.send(JSON.stringify([{
                taskType: "imageInference",
                taskUUID,
                positivePrompt: finalPrompt,
                model: "runware:100@1",
                width: 1024,
                height: 1024,
                numberResults: 1,
                outputFormat: "WEBP",
                steps: style.steps,
                CFGScale: style.cfgScale,
                scheduler: "FlowMatchEulerDiscreteScheduler",
                strength: style.strength
              }]));
              
            } else if (item.taskType === "imageInference") {
              clearTimeout(timeout);
              ws.close();
              
              console.log('✅ Tier 2.5 generation successful');
              
              resolve(createCorsResponse({
                success: true,
                imageURL: item.imageURL,
                seed: item.seed,
                cost: item.cost,
                provider: 'runware-simple-fallback',
                model: 'runware:100@1',
                tier: '2.5'
              }));
            }
          });
        }
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        console.error("Tier 2.5 WebSocket error:", error);
        resolve(createCorsErrorResponse("Tier 2.5 WebSocket failed", 500));
      };
    });

  } catch (error) {
    console.error('Tier 2.5 error:', error);
    return createCorsErrorResponse(`Tier 2.5 error: ${error.message}`, 500);
  }
});

// Hardcoded scene extraction - no external dependencies
function extractSimpleScene(pageText: string, userInfo?: any): string {
  const text = pageText.toLowerCase();
  
  // Simple character detection
  let character = 'child';
  if (userInfo?.name) {
    character = userInfo.name;
  } else if (text.includes('girl') || text.includes('she')) {
    character = 'girl';
  } else if (text.includes('boy') || text.includes('he')) {
    character = 'boy';
  }
  
  // Simple avatar description
  let avatarDesc = '';
  if (userInfo?.avatar) {
    const skinTone = userInfo.avatar.skinTone || 'medium';
    const type = userInfo.avatar.type || 'child';
    
    const skinMap = {
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
    
    avatarDesc = `${skinMap[skinTone] || 'medium skin'}, ${hairMap[skinTone] || 'brown hair'}`;
  }
  
  // Simple setting detection
  let setting = 'outdoor scene';
  if (text.includes('house') || text.includes('home')) setting = 'indoor house scene';
  else if (text.includes('forest') || text.includes('tree')) setting = 'forest scene';
  else if (text.includes('beach') || text.includes('ocean')) setting = 'beach scene';
  else if (text.includes('school')) setting = 'school scene';
  else if (text.includes('park')) setting = 'park scene';
  
  // Simple object detection
  const objects = [];
  const simpleObjects = ['ball', 'book', 'toy', 'dog', 'cat', 'car', 'bike', 'flower'];
  simpleObjects.forEach(obj => {
    if (text.includes(obj)) objects.push(obj);
  });
  
  // Build scene description
  let scene = `${character}`;
  if (avatarDesc) scene += ` with ${avatarDesc}`;
  scene += ` in ${setting}`;
  if (objects.length > 0) scene += ` with ${objects.slice(0, 2).join(' and ')}`;
  
  // Add original text context
  scene += `. Scene: ${pageText}`;
  
  return scene;
}

// Hardcoded styles - no external dependencies
function getHardcodedStyle(difficulty: string) {
  const styles = {
    'beginner': {
      prompt: '3D children\'s book art, bright colors, smooth rendering, cheerful',
      quality: 'Premium children\'s book illustration with depth and dimension',
      suffix: 'children\'s book illustration, warm earth tones, diverse inclusive characters, professional artwork',
      steps: 6,
      cfgScale: 2.5,
      strength: 0.8
    },
    'easy': {
      prompt: '3D children\'s book art, bright colors, smooth rendering, cheerful', 
      quality: 'Premium children\'s book illustration with depth and dimension',
      suffix: 'children\'s book illustration, warm earth tones, diverse inclusive characters, professional artwork',
      steps: 6,
      cfgScale: 2.5,
      strength: 0.8
    },
    'medium': {
      prompt: 'children\'s book illustration, soft pastels, warm lighting, digital art',
      quality: 'Professional children\'s book illustration standard',
      suffix: 'children\'s book illustration, warm colors, safe wholesome content',
      steps: 8,
      cfgScale: 3.0,
      strength: 0.75
    },
    'hard': {
      prompt: '2D digital illustration (sophisticated artistic style), nuanced color gradients, artistic palette, highly detailed',
      quality: 'Sophisticated artistic children\'s book illustration',
      suffix: 'artistic children\'s book illustration, refined quality, diverse representation',
      steps: 10,
      cfgScale: 3.5,
      strength: 0.8
    },
    'expert': {
      prompt: '2D digital illustration (masterful artistic technique), complex color theory, intricate details',
      quality: 'Masterful children\'s book art with diverse representation',
      suffix: 'masterful children\'s book art, sophisticated quality, diverse representation',
      steps: 12,
      cfgScale: 3.8,
      strength: 0.85
    }
  };
  
  return styles[difficulty] || styles['medium'];
}