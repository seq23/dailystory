import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";

// ============= PHASE 1: NUCLEAR INDEPENDENCE - ZERO EXTERNAL DEPENDENCIES =============
// Tier 2.5 is the nuclear fallback and MUST be completely independent
// Inlined difficulty mapping to eliminate DifficultyLevelMapper dependency

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
    
    // Process avatar identity inline for consistent gender handling
    const avatarIdentity = userInfo?.avatar ? {
      type: userInfo.avatar.type === 'prefer-not-to-answer' ? 'child' : (userInfo.avatar.type || 'child'),
      skinTone: userInfo.avatar.skinTone || 'medium'
    } : null;
    console.log(`🎭 Tier 2.5: Avatar identity processed - type: ${avatarIdentity?.type}, skinTone: ${avatarIdentity?.skinTone}`);
    
    // ============= NUCLEAR INDEPENDENT DIFFICULTY MAPPING =============
    // Zero external dependencies - all logic inlined for bulletproof operation
    const mappedDifficulty = mapDifficultyInline(userInfo, difficultyLevel);
    console.log(`🛡️ Tier 2.5: Nuclear difficulty mapping: ${mappedDifficulty} (bulletproof fallback: ${difficultyLevel})`);

    console.log('🎨 Tier 2.5: Simple fallback generation with hardcoded extraction');

    // Enhanced hardcoded scene extraction with cultural bypass
    const extractedScene = extractSimpleSceneWithCulturalBypass(pageText, userInfo, avatarIdentity);
    
    // Enhanced hardcoded style with exact styleFrameworks.js verbiage
    const style = getHardcodedStyle(mappedDifficulty);
    
    // Build final prompt with enhanced negative prompts
    const negativePrompt = getEnhancedNegativePrompt(userInfo, avatarIdentity, avatarIdentity?.type || userInfo?.avatar?.type);
    const finalPrompt = `${extractedScene}. ${style.prompt}. ${style.quality}. ${style.suffix}`;
    
    // 🔍 TIER 2.5 DEBUG LOGGING - Full prompts for debugging
    console.log(`🔍 TIER 2.5 DEBUG - Page: ${pageText ? 'with text' : 'no text'}`);
    console.log(`📝 Extracted Scene: ${extractedScene}`);
    console.log(`🎨 Final Prompt (FULL): ${finalPrompt}`);
    console.log(`🚫 Negative Prompt: ${negativePrompt}`);

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
              
              console.log('✅ TIER 2.5 SUCCESS');
              console.log(`🖼️ Image URL: ${item.imageURL}`);
              console.log(`🎯 Final Prompt Used: ${finalPrompt}`);
              console.log(`💰 Cost: ${item.cost}, Seed: ${item.seed}`);
              
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

  console.log('🛡️ Nuclear Tier 2.5 generation completed - 100% bulletproof operation');
  
} catch (error) {
  console.error('🚨 Nuclear Tier 2.5 error (still operational):', error);
  return createCorsErrorResponse(`Tier 2.5 error: ${error.message}`, 500);
}
});

// ============= NUCLEAR TIER 2.5: ZERO DEPENDENCY DIFFICULTY MAPPING =============
/**
 * Nuclear Independent Difficulty Mapping - Zero External Dependencies
 * Extracts and maps difficulty levels with multiple fallback strategies
 * Conservative defaults ensure 100% operation even with corrupt/missing data
 */
function mapDifficultyInline(userInfo, fallbackLevel = 'medium') {
  try {
    // STRATEGY 1: Direct extraction - no external dependencies
    const rawLevel = userInfo?.readingLevel || userInfo?.difficultyLevel || userInfo?.gradeLevel;
    
    // Hardcoded valid levels - inline in Tier 2.5 for nuclear independence
    const validLevels = ['beginner', 'easy', 'medium', 'hard', 'expert'];
    
    if (rawLevel && validLevels.includes(rawLevel)) {
      console.log(`🛡️ Tier 2.5: Direct level mapping: ${rawLevel}`);
      return rawLevel;
    }
    
    // STRATEGY 2: Smart inference from grade level
    if (userInfo?.gradeLevel) {
      const grade = String(userInfo.gradeLevel).toLowerCase();
      if (grade.includes('k') || grade.includes('pre') || grade.includes('0')) {
        console.log(`🛡️ Tier 2.5: Grade-based mapping: ${grade} → beginner`);
        return 'beginner';
      }
      if (grade.includes('1') || grade.includes('2')) {
        console.log(`🛡️ Tier 2.5: Grade-based mapping: ${grade} → easy`);
        return 'easy';
      }
      if (grade.includes('3') || grade.includes('4')) {
        console.log(`🛡️ Tier 2.5: Grade-based mapping: ${grade} → medium`);
        return 'medium';
      }
      if (grade.includes('5') || grade.includes('6')) {
        console.log(`🛡️ Tier 2.5: Grade-based mapping: ${grade} → hard`);
        return 'hard';
      }
      if (grade.includes('7') || grade.includes('8') || grade.includes('9')) {
        console.log(`🛡️ Tier 2.5: Grade-based mapping: ${grade} → expert`);
        return 'expert';
      }
    }
    
    // STRATEGY 3: Age-based inference (if available)
    if (userInfo?.age) {
      const age = parseInt(userInfo.age);
      if (age <= 5) return 'beginner';
      if (age <= 7) return 'easy';
      if (age <= 10) return 'medium';
      if (age <= 12) return 'hard';
      return 'expert';
    }
    
    // STRATEGY 4: Conservative fallback - always works
    console.log(`🛡️ Tier 2.5: Conservative fallback: ${fallbackLevel}`);
    return fallbackLevel;
    
  } catch (error) {
    console.log(`🛡️ Tier 2.5: Error-safe fallback (${error.message}): ${fallbackLevel}`);
    return fallbackLevel;
  }
}

// ============= ENHANCED SCENE EXTRACTION WITH CULTURAL BYPASS =============
function extractSimpleSceneWithCulturalBypass(pageText: string, userInfo?: any, avatarIdentity?: any): string {
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
  
  // CHARACTER DETECTION WITH AVATAR TYPE MAPPING
  let character = 'child';
  
  // Store original avatar type for detection in scene construction and negative prompting
  const originalAvatarType = avatarIdentity?.type || userInfo?.avatar?.type;
  
  // Map avatar types: "prefer-not-to-answer" → "child", others unchanged
  const mapAvatarTypeForPrompt = (type: string | undefined): string => {
    if (type === 'prefer-not-to-answer') return 'child';
    return type || 'child';
  };
  
  let genderType = mapAvatarTypeForPrompt(originalAvatarType);
  console.log(`🎯 AVATAR MAPPING - Original: ${originalAvatarType} → Mapped: ${genderType}`);
  
  if (userInfo?.name) {
    character = userInfo.name;
  } else if (text.includes('girl') || text.includes('she')) {
    character = 'girl';
    // Only override if no explicit avatar selection
    if (!originalAvatarType) {
      genderType = 'girl';
    }
  } else if (text.includes('boy') || text.includes('he')) {
    character = 'boy';
    // Only override if no explicit avatar selection  
    if (!originalAvatarType) {
      genderType = 'boy';
    }
  }
  
  // Enhanced avatar description with stronger gender enforcement
  let avatarDesc = '';
  if (userInfo?.avatar || avatarIdentity) {
    const skinTone = avatarIdentity?.skinTone || userInfo?.avatar?.skinTone || 'medium';
    const type = avatarIdentity?.type || userInfo?.avatar?.type || 'child';
    // Gender type already set above - do NOT override here (genderType = type was the bug!)
    
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
    
    avatarDesc = `${skinMap[skinTone] || 'medium skin'}, ${hairMap[skinTone] || 'brown hair'}${clothingDesc}${skinTone === 'dark' ? ', realistic natural black hair texture, rich brown complexion, striking brown eyes, friendly face, authentic African American features, soft golden hour lighting' : ''}`;
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
  
  // RESTORED COMPREHENSIVE ANIMAL DETECTION + OBJECT DETECTION
  const objects = [];
  const animals = [];
  
  // Comprehensive animal detection array
  const animalKeywords = ['bunny', 'rabbit', 'cat', 'kitten', 'dog', 'puppy', 'bird', 'bear', 'fox', 'deer', 'squirrel', 'mouse', 'lion', 'elephant', 'giraffe', 'monkey', 'tiger', 'zebra', 'horse', 'cow', 'pig', 'sheep', 'goat', 'duck', 'goose', 'chicken', 'fish', 'butterfly', 'bee', 'frog', 'turtle', 'snake'];
  
  const allObjects = ['ball', 'book', 'toy', 'car', 'bike', 'flower', 'shell', 'kite', 'balloon', 'swing', 'slide'];
  
  // Detect animals mentioned in story
  animalKeywords.forEach(animal => {
    if (text.includes(animal) && animals.length < 2) {
      animals.push(animal);
      console.log(`🐾 TIER 2.5 ANIMAL DEBUG - Detected: ${animal}`);
    }
  });
  
  // Detect secondary characters mentioned in story
  const secondaryCharacters = [];
  const familyKeywords = ['mom', 'mother', 'dad', 'father', 'sister', 'brother', 'grandma', 'grandpa', 'aunt', 'uncle'];
  const friendKeywords = ['friend', 'buddy', 'pal'];
  const communityKeywords = ['teacher', 'neighbor', 'doctor', 'librarian', 'coach', 'nurse', 'principal', 'cashier', 'mailman', 'firefighter'];
  
  // Detect family members (highest priority)
  familyKeywords.forEach(family => {
    if (text.toLowerCase().includes(family) && secondaryCharacters.length < 2) {
      secondaryCharacters.push(`friendly ${family}`);
      console.log(`👨‍👩‍👧‍👦 TIER 2.5 FAMILY DEBUG - Detected: ${family}`);
    }
  });
  
  // Detect friends (if space available)
  if (secondaryCharacters.length < 2) {
    friendKeywords.forEach(friendType => {
      if (text.toLowerCase().includes(friendType) && secondaryCharacters.length < 2) {
        secondaryCharacters.push(`friendly friend`);
        console.log(`👫 TIER 2.5 FRIEND DEBUG - Detected: ${friendType}`);
      }
    });
  }
  
  // Detect community roles (if space available)
  if (secondaryCharacters.length < 2) {
    communityKeywords.forEach(role => {
      if (text.toLowerCase().includes(role) && secondaryCharacters.length < 2) {
        secondaryCharacters.push(`friendly ${role}`);
        console.log(`🏘️ TIER 2.5 COMMUNITY DEBUG - Detected: ${role}`);
      }
    });
  }
  
  // Detect objects mentioned in story  
  allObjects.forEach(obj => {
    if (text.includes(obj) && objects.length < 2) objects.push(obj);
  });
  
  // Add age category mapping based on difficulty to ensure consistent child characters
  const ageMapping = {
    'beginner': '5-year-old',
    'easy': '7-year-old', 
    'medium': '9-year-old',
    'hard': '11-year-old',
    'expert': '13-year-old'
  };
  
  // Get mapped difficulty from userInfo (inlined for nuclear independence)
  const mappedDifficulty = mapDifficultyInline(userInfo, 'medium');
  const agePrefix = ageMapping[mappedDifficulty] || '7-year-old';
  
  // Build enhanced scene description with age-specified character
  let scene = `${agePrefix} ${genderType}`;
  
  // Add gender-neutral appendage for "prefer-not-to-answer" selection
  if (originalAvatarType === 'prefer-not-to-answer') {
    scene = `${agePrefix} child with no gender specific characteristics`;
    console.log(`🎯 GENDER NEUTRAL - Applied neutral characteristics for prefer-not-to-answer`);
  }
  
  if (avatarDesc) scene += ` with ${avatarDesc}`;
  scene += ` in ${culturallyEnhancedSetting}`;
  
  // Add detected animals to scene (character-animal interaction)
  if (animals.length > 0) {
    scene += ` with ${animals.join(' and ')}`;
    console.log(`🐾 TIER 2.5 SCENE DEBUG - Added animals to scene: ${animals.join(', ')}`);
  }
  
  // Add secondary characters to scene (family, friends, community)
  if (secondaryCharacters.length > 0) {
    scene += ` with ${secondaryCharacters.join(' and ')}`;
    console.log(`👨‍👩‍👧‍👦 TIER 2.5 SCENE DEBUG - Added secondary characters to scene: ${secondaryCharacters.join(', ')}`);
  }
  
  // Add objects to scene
  if (objects.length > 0) scene += ` with ${objects.join(' and ')}`;
  
  // Add emotion detection without AI
  const emotionalContext = detectEmotionFromText(text);
  if (emotionalContext) scene += `, ${emotionalContext}`;
  
  // Use best scene as primary context  
  scene += `. Scene: ${bestScene}`;
  
  console.log(`🎯 TIER 2.5 FINAL DEBUG - Final scene: ${scene}`);
  
  return scene;
}

// Enhanced hardcoded styles with exact styleFrameworks.js verbiage
function getHardcodedStyle(difficulty: string) {
  const styles = {
    'beginner': {
      prompt: '3D digital art style, Pixar-inspired character design, soft rounded features, friendly appealing aesthetics, bright cheerful colors, clean polished rendering',
      quality: 'High-quality 3D animated character illustration for early readers',
      suffix: '3D animated style, Pixar-quality rendering, child-friendly design, diverse representation',
      steps: 15,
      cfgScale: 7.0,
      strength: 0.75
    },
    'easy': {
      prompt: '3D digital art style, Pixar-inspired character design, soft rounded features, friendly appealing aesthetics, bright cheerful colors, clean polished rendering',
      quality: 'High-quality 3D animated character illustration for early readers',
      suffix: '3D animated style, Pixar-quality rendering, child-friendly design, diverse representation',
      steps: 15,
      cfgScale: 7.0,
      strength: 0.75
    },
    'medium': {
      prompt: 'Digital painting style, painterly brush strokes, cinematic composition, soft artistic lighting, professional digital artwork quality',
      quality: 'ultra professional digital illustration standard, high quality professional artwork, focused character presentation, culturally accurate, natural lighting for dark skin, authentic features',
      suffix: 'Digital illustration with painterly qualities, soft brush strokes, professional children\'s book digital illustration, rich textures and depth, artistic rendering, warm natural lighting optimized for dark skin tones, culturally accurate, safe wholesome content',
      steps: 19,
      cfgScale: 7.5,
      strength: 0.8
    },
    'hard': {
      prompt: 'Professional digital illustration with sophisticated artistic technique, refined color theory and palette mastery, intricate compositional details, advanced lighting techniques, mature visual storytelling',
      quality: 'Gallery-quality digital illustration with sophisticated artistic maturity, professional composition and advanced visual narrative techniques',
      suffix: 'professional digital illustration, sophisticated artistic maturity, refined visual storytelling, advanced composition techniques, gallery-worthy quality',
      steps: 20,
      cfgScale: 8.0,
      strength: 0.85
    },
    'expert': {
      prompt: 'Fine art digital illustration with masterful artistic technique, complex color harmonies and advanced tonal relationships, museum-quality detail work, professional lighting mastery, cinematic visual narrative sophistication',
      quality: 'Museum-quality fine art digital illustration with masterful artistic sophistication, cinematic composition and professional visual narrative excellence',
      suffix: 'fine art digital illustration, masterful artistic sophistication, cinematic visual narrative, museum-quality professional artwork, advanced compositional mastery',
      steps: 25,
      cfgScale: 8.5,
      strength: 0.9
    }
  };
  
  return styles[difficulty] || styles['medium'];
}

// Unified negative prompt system for Tier 2.5 (hardcoded but comprehensive)
function getEnhancedNegativePrompt(userInfo?: any, avatarIdentity?: any, originalAvatarType?: string): string {
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
  
  // 7. Gender consistency enforcement (with enhanced prefer-not-to-answer handling)
  const avatarType = originalAvatarType || avatarIdentity?.type || userInfo?.avatar?.type || 'child';
  if (avatarType === 'girl') {
    negatives.push('boy character, male character, masculine features');
  } else if (avatarType === 'boy') {
    negatives.push('girl character, female character, feminine features, dress, skirt');
  } else if (avatarType === 'prefer-not-to-answer') {
    negatives.push('masculine features, feminine features, boy characteristics, girl characteristics, gender-specific clothing, dress, skirt, masculine clothing, gendered accessories, gendered hairstyles');
    console.log(`🎯 GENDER NEUTRAL NEGATIVES - Applied comprehensive gender-neutral negative prompts`);
  }
  
  // 8. Style framework compatibility (hardcoded defaults)
  negatives.push('copyrighted characters, brand logos, watermarks');
  
  // 9. Cultural sensitivity - NEW trigger condition (with fallback pattern)
  const skinTone = avatarIdentity?.skinTone || userInfo?.avatar?.skinTone;
  const genderType = avatarIdentity?.type || userInfo?.avatar?.type;
  if (skinTone === 'dark' && (genderType === 'boy' || genderType === 'girl')) {
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