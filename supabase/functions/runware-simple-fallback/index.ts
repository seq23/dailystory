import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";
import { DifficultyLevelMapper } from "../_shared/DifficultyLevelMapper.js";

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
    
    // Use DifficultyLevelMapper for consistent difficulty handling
    const mappedDifficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo) || difficultyLevel;
    console.log(`🔧 Mapped difficulty: ${mappedDifficulty} from user info or fallback: ${difficultyLevel}`);

    console.log('🎨 Tier 2.5: Simple fallback generation with hardcoded extraction');

    // Enhanced hardcoded scene extraction with cultural bypass
    const extractedScene = extractSimpleSceneWithCulturalBypass(pageText, userInfo);
    
    // Enhanced hardcoded style with exact styleFrameworks.js verbiage
    const style = getHardcodedStyle(mappedDifficulty);
    
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
                steps: 12,
                CFGScale: 4.0,
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

// Enhanced scene extraction with cultural bypass and improved analysis  
function extractSimpleSceneWithCulturalBypass(pageText: string, userInfo?: any): string {
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
    
    // Character and action focus (removed animal bias)
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
  
  // Comprehensive setting detection with 15+ categories
  let baseSetting = 'outdoor scene';
  if (text.includes('house') || text.includes('home') || text.includes('bedroom') || text.includes('kitchen') || text.includes('living room')) baseSetting = 'home';
  else if (text.includes('beach') || text.includes('ocean') || text.includes('sea') || text.includes('sand')) baseSetting = 'beach';
  else if (text.includes('forest') || text.includes('tree') || text.includes('woods')) baseSetting = 'forest';
  else if (text.includes('school') || text.includes('classroom') || text.includes('library')) baseSetting = 'school';
  else if (text.includes('park') || text.includes('playground')) baseSetting = 'park';
  else if (text.includes('garden') || text.includes('flower')) baseSetting = 'garden';
  else if (text.includes('field') || text.includes('meadow')) baseSetting = 'field';
  else if (text.includes('restaurant') || text.includes('cafe') || text.includes('store')) baseSetting = 'restaurant';
  else if (text.includes('bed') || text.includes('sleep') || text.includes('pillow')) baseSetting = 'bedroom';
  
  // Apply cultural enhancement bypass logic
  const culturallyEnhancedSetting = applyCulturalSettingEnhancement(baseSetting, userInfo);
  
  // Enhanced object detection (removed forced animal injection)
  const objects = [];
  const allObjects = ['ball', 'book', 'toy', 'car', 'bike', 'flower', 'shell', 'kite', 'balloon', 'swing', 'slide'];
  
  allObjects.forEach(obj => {
    if (text.includes(obj) && objects.length < 2) objects.push(obj);
  });
  
  // Build enhanced scene description with cultural bypass and emotion detection
  let scene = `${character}`;
  if (avatarDesc) scene += ` with ${avatarDesc}`;
  scene += ` in ${culturallyEnhancedSetting}`;
  if (objects.length > 0) scene += ` with ${objects.join(' and ')}`;
  
  // Add emotion detection without AI
  const emotionalContext = detectEmotionFromText(text);
  if (emotionalContext) scene += `, ${emotionalContext}`;
  
  // Use best scene as primary context
  scene += `. Scene: ${bestScene}`;
  
  return scene;
}

// Enhanced hardcoded styles with exact styleFrameworks.js verbiage
function getHardcodedStyle(difficulty: string) {
  const styles = {
    'beginner': {
      prompt: 'High-quality 3D-rendered digital illustration with cartoon aesthetics, single main character focus',
      quality: 'Ultra premium children\'s book illustration with depth and dimension', 
      suffix: 'professional children\'s book illustration, Pixar-style quality, diverse inclusive characters',
      steps: 12,
      cfgScale: 4.0,
      strength: 0.9
    },
    'easy': {
      prompt: 'High-quality 3D-rendered digital illustration with cartoon aesthetics',
      quality: 'Premium children\'s book illustration with depth and dimension',
      suffix: 'children\'s book illustration, warm earth tones, diverse inclusive characters, professional artwork',
      steps: 12,
      cfgScale: 4.0,
      strength: 0.9
    },
    'medium': {
      prompt: 'Digital illustration with painterly qualities, soft brush strokes, focused character presentation',
      quality: 'Ultra professional children\'s book illustration standard',
      suffix: 'professional children\'s book illustration, warm colors, safe wholesome content, Caldecott Medal style',
      steps: 12,
      cfgScale: 4.0,
      strength: 0.9
    },
    'hard': {
      prompt: '2D digital illustration (sophisticated artistic style), nuanced color gradients, artistic palette, highly detailed, advanced digital painting techniques',
      quality: 'Sophisticated artistic children\'s book illustration',
      suffix: 'artistic children\'s book illustration, refined quality, diverse representation',
      steps: 12,
      cfgScale: 4.0,
      strength: 0.9
    },
    'expert': {
      prompt: '2D digital illustration (masterful artistic technique), complex color theory, intricate details',
      quality: 'Masterful children\'s book art with diverse representation',
      suffix: 'masterful children\'s book art, sophisticated quality, diverse representation',
      steps: 12,
      cfgScale: 4.0,
      strength: 0.9
    }
  };
  
  return styles[difficulty] || styles['medium'];
}

// Unified negative prompt system for Tier 2.5 (hardcoded but comprehensive)
function getEnhancedNegativePrompt(userInfo?: any): string {
  const negatives = [];
  
  // 1. Page-specific negatives (first page only in practice)
  if (userInfo?.name) {
    negatives.push(`${userInfo.name} text, name in large letters`);
  }
  
  // 2. Text prevention (exact specification)
  negatives.push('NO text, letters, words, writing, typography, captions, labels');
  
  // 3. Body completeness
  negatives.push('floating head, portrait only, incomplete body, missing torso');
  
  // 4. Quality control
  negatives.push('ugly, deformed, bad anatomy, extra limb, mutation, poorly drawn, cropped, lowres, worst quality, low quality, blurry, pixelated, noise, artifacts');
  
  // 5. Content safety
  negatives.push('adult, mature, violence, scary, dark, inappropriate, nsfw, suggestive, weapons, blood, gore, frightening');
  
  // 6. Style prevention
  negatives.push('photorealistic, realistic, photograph, anime, manga, comic book style, sketch, rough drawing');
  
  // 7. Gender consistency enforcement
  if (userInfo?.avatar?.type === 'girl') {
    negatives.push('boy character, male character, masculine features');
  } else if (userInfo?.avatar?.type === 'boy') {
    negatives.push('girl character, female character, feminine features, dress, skirt');
  }
  
  // 8. Style framework compatibility (hardcoded defaults)
  negatives.push('copyrighted characters, brand logos, watermarks');
  
  // 9. Cultural sensitivity - NEW trigger condition
  if (userInfo?.avatar?.skinTone === 'dark' && (userInfo?.avatar?.type === 'boy' || userInfo?.avatar?.type === 'girl')) {
    negatives.push('lightened skin, whitewashed, caucasian features, stereotypical, blurry, low quality, distorted, altered ethnicity, artificial skin lightening, noise, oversaturated');
  }
  
  console.log(`📝 Using unified Tier 2.5 negative prompt with all 9 categories`);
  return negatives.join(', ');
}

// Cultural bypass implementation for Tier 2.5
function applyCulturalSettingEnhancement(baseSetting: string, userInfo?: any): string {
  if (userInfo?.nativeLanguage === 'en' && userInfo?.avatar?.skinTone === 'dark') {
    // African American Route: Full cultural enhancement
    const culturalEnhancements = {
      'home': 'cozy home with African American family photos and cultural artwork',
      'bedroom': 'cozy bedroom with African American family photos and cultural displays',
      'kitchen': 'warm kitchen with soul food ingredients and family recipes',
      'school': 'diverse classroom with multicultural learning materials',
      'park': 'community park with diverse families and cultural celebration elements',
      'restaurant': 'family-friendly restaurant with diverse community atmosphere'
    };
    return culturalEnhancements[baseSetting] || `${baseSetting} with African American cultural elements and community atmosphere`;
  } else if (userInfo?.nativeLanguage === 'en') {
    // Standard American Route: BYPASS - minimal processing
    return `${baseSetting} scene`;
  } else {
    // International Route: Basic cultural adaptation
    const language = userInfo?.nativeLanguage || 'international';
    return `${baseSetting} with ${language} cultural elements`;
  }
}

// Emotion detection without AI for enhanced scene analysis
function detectEmotionFromText(text: string): string {
  const emotions = {
    happy: ['happy', 'smiled', 'laughed', 'giggled', 'cheerful', 'joy', 'excited', 'delighted'],
    sad: ['sad', 'cried', 'tears', 'sobbed', 'upset', 'disappointed'],
    excited: ['excited', 'thrilled', 'amazed', 'wonderful', 'incredible', 'fantastic'],
    peaceful: ['calm', 'peaceful', 'quiet', 'gentle', 'serene', 'relaxed'],
    surprised: ['surprised', 'amazed', 'shocked', 'wow', 'incredible', 'unbelievable']
  };
  
  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      const contextMap = {
        happy: 'cheerful and joyful atmosphere',
        sad: 'gentle and comforting mood',
        excited: 'energetic and thrilling atmosphere',
        peaceful: 'calm and serene environment',
        surprised: 'magical and wonder-filled scene'
      };
      return contextMap[emotion] || 'positive atmosphere';
    }
  }
  
  return 'warm and engaging atmosphere';
}