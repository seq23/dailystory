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
    
    // Build final prompt with enhanced negative prompts
    const negativePrompt = getEnhancedNegativePrompt(userInfo);
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
                negativePrompt: negativePrompt,
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

// Enhanced scene extraction with better story analysis
function extractSimpleScene(pageText: string, userInfo?: any): string {
  if (!pageText) return 'a friendly character in a beautiful scene';
  
  const text = pageText.toLowerCase();
  const sentences = pageText.split(/[.!?]+/).filter(s => s.trim());
  
  // Enhanced scene scoring with better visual prioritization
  let bestScene = sentences[0] || pageText;
  let bestScore = 0;
  
  sentences.forEach(sentence => {
    let score = 0;
    const lowerSentence = sentence.toLowerCase();
    
    // Visual richness indicators
    if (lowerSentence.includes('color') || lowerSentence.includes('bright') || lowerSentence.includes('beautiful')) score += 20;
    if (lowerSentence.includes('big') || lowerSentence.includes('small') || lowerSentence.includes('huge')) score += 15;
    if (lowerSentence.includes('red') || lowerSentence.includes('blue') || lowerSentence.includes('green') || lowerSentence.includes('yellow')) score += 18;
    
    // Action and emotional content
    if (lowerSentence.includes('dance') || lowerSentence.includes('twirl') || lowerSentence.includes('jump') || lowerSentence.includes('run') || lowerSentence.includes('play')) score += 25;
    if (lowerSentence.includes('loved') || lowerSentence.includes('enjoyed') || lowerSentence.includes('happy') || lowerSentence.includes('excited') || lowerSentence.includes('smiled')) score += 20;
    if (userInfo?.name && lowerSentence.includes(userInfo.name.toLowerCase())) score += 15;
    
    // Animals and objects boost
    if (lowerSentence.includes('luna') || lowerSentence.includes('rabbit') || lowerSentence.includes('bunny') || lowerSentence.includes('cat') || lowerSentence.includes('dog')) score += 22;
    if (lowerSentence.includes('flower') || lowerSentence.includes('tree') || lowerSentence.includes('garden') || lowerSentence.includes('park')) score += 18;
    
    // Dialogue and interaction
    if (lowerSentence.includes('"') || lowerSentence.includes('said') || lowerSentence.includes('called') || lowerSentence.includes('asked')) score += 20;
    
    if (score > bestScore) {
      bestScore = score;
      bestScene = sentence;
    }
  });
  
  // Character detection with gender enforcement
  let character = 'child';
  let genderType = 'child';
  
  if (userInfo?.name) {
    character = userInfo.name;
    genderType = userInfo.avatar?.type || 'child';
  } else if (text.includes('girl') || text.includes('she')) {
    character = 'girl';
    genderType = 'girl';
  } else if (text.includes('boy') || text.includes('he')) {
    character = 'boy';
    genderType = 'boy';
  }
  
  // Enhanced avatar description with stronger gender enforcement
  let avatarDesc = '';
  if (userInfo?.avatar) {
    const skinTone = userInfo.avatar.skinTone || 'medium';
    const type = userInfo.avatar.type || 'child';
    genderType = type; // Ensure we use the avatar type
    
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
    
    // Apply cultural clothing logic
    let clothingDesc = '';
    if (userInfo.nativeLanguage === 'en' && skinTone === 'dark') {
      clothingDesc = ' in modern American fashion';
    } else if (userInfo.nativeLanguage === 'fr' && skinTone === 'dark') {
      clothingDesc = ' in African-French fusion style';
    } else if (userInfo.nativeLanguage === 'es' && skinTone === 'dark') {
      clothingDesc = ' in contemporary Hispanic fashion';
    }
    
    avatarDesc = `${skinMap[skinTone] || 'medium skin'}, ${hairMap[skinTone] || 'brown hair'}${clothingDesc}`;
  }
  
  // Enhanced setting detection with more options
  let setting = 'outdoor scene';
  if (text.includes('house') || text.includes('home') || text.includes('bedroom') || text.includes('kitchen')) setting = 'indoor house scene';
  else if (text.includes('beach') || text.includes('ocean') || text.includes('sea') || text.includes('sand')) setting = 'beach scene';
  else if (text.includes('forest') || text.includes('tree') || text.includes('woods')) setting = 'forest scene';
  else if (text.includes('school') || text.includes('classroom')) setting = 'school scene';
  else if (text.includes('park') || text.includes('playground')) setting = 'park scene';
  else if (text.includes('garden') || text.includes('flower')) setting = 'garden scene';
  else if (text.includes('field') || text.includes('meadow')) setting = 'outdoor field scene';
  
  // Enhanced object and animal detection
  const objects = [];
  const animals = [];
  const allObjects = ['ball', 'book', 'toy', 'car', 'bike', 'flower', 'shell', 'kite', 'balloon', 'swing', 'slide'];
  const allAnimals = ['luna', 'rabbit', 'bunny', 'cat', 'dog', 'bird', 'butterfly', 'dolphin', 'whale', 'fish'];
  
  allObjects.forEach(obj => {
    if (text.includes(obj) && objects.length < 2) objects.push(obj);
  });
  
  allAnimals.forEach(animal => {
    if (text.includes(animal) && animals.length < 2) animals.push(animal);
  });
  
  // Build enhanced scene description with gender enforcement
  let scene = `${character}`;
  if (avatarDesc) scene += ` with ${avatarDesc}`;
  scene += ` in ${setting}`;
  if (animals.length > 0) scene += ` with ${animals.join(' and ')}`;
  if (objects.length > 0) scene += ` with ${objects.join(' and ')}`;
  
  // Use best scene as primary context
  scene += `. Scene: ${bestScene}`;
  
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

// Enhanced negative prompt for safety and quality
function getEnhancedNegativePrompt(userInfo?: any): string {
  let baseNegative = 'inappropriate content, adult content, violence, scary, frightening, disturbing, dark themes, weapons, blood, gore, nudity, sexual content, profanity, drugs, alcohol, smoking, unsafe activities, dangerous situations, horror, nightmare, evil, demon, monster, ghost, zombie, skull, death, sad, crying, angry, fighting, bullying, discrimination, hate, racism, sexism';
  
  // Add gender-specific negatives to enforce correct character representation
  if (userInfo?.avatar?.type === 'girl') {
    baseNegative += ', boy character, male character, masculine features, he, him, his, male clothing, boy hairstyle';
  } else if (userInfo?.avatar?.type === 'boy') {
    baseNegative += ', girl character, female character, feminine features, she, her, hers, female clothing, girl hairstyle, dress, skirt';
  }
  
  // Add quality negatives
  baseNegative += ', blurry, low quality, pixelated, distorted, deformed, ugly, bad anatomy, extra limbs, missing limbs, floating limbs, disconnected limbs, malformed hands, poorly drawn hands, mutated hands, extra fingers, fused fingers, missing fingers, long neck, duplicate, morbid, mutilated, out of frame, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, out of frame, ugly, extra limbs, bad anatomy, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, mutated hands, fused fingers, too many fingers, long neck';
  
  return baseNegative;
}