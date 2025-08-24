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
      'pale': 'red hair',
      'light': 'blonde hair',
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
    
    avatarDesc = `${skinMap[skinTone] || 'medium skin'}, ${hairMap[skinTone] || 'brown hair'}${clothingDesc}${skinTone === 'dark' ? ', realistic natural black hair texture with individual strand detail, rich brown complexion, striking brown eyes, friendly face, authentic African American features, soft golden hour lighting' : ''}`;
  }
  
  // Context-aware setting detection with action priority and departure detection
  let baseSetting = 'outdoor scene';
  const settingScores = {
    'park': 0,
    'home': 0,
    'beach': 0,
    'forest': 0,
    'school': 0,
    'garden': 0,
    'field': 0,
    'restaurant': 0,
    'bedroom': 0
  };
  
  // Base keyword scoring
  if (text.includes('park') || text.includes('playground')) settingScores.park += 30;
  if (text.includes('beach') || text.includes('ocean') || text.includes('sea') || text.includes('sand')) settingScores.beach += 30;
  if (text.includes('forest') || text.includes('tree') || text.includes('woods')) settingScores.forest += 30;
  if (text.includes('school') || text.includes('classroom') || text.includes('library')) settingScores.school += 30;
  if (text.includes('garden') || text.includes('flower')) settingScores.garden += 30;
  if (text.includes('field') || text.includes('meadow')) settingScores.field += 30;
  if (text.includes('restaurant') || text.includes('cafe') || text.includes('store')) settingScores.restaurant += 30;
  if (text.includes('bed') || text.includes('sleep') || text.includes('pillow')) settingScores.bedroom += 30;
  
  // Word-boundary home detection (not within other words like "mom")
  const homePattern = /\b(house|home|bedroom|kitchen|living room)\b/i;
  if (homePattern.test(text)) settingScores.home += 30;
  
  // Action-context priority scoring (action + location = heavy weight to that location)
  if (text.includes('explore') && text.includes('park')) settingScores.park += 50;
  if (text.includes('going to') && text.includes('park')) settingScores.park += 40;
  if (text.includes('arrived at') && text.includes('park')) settingScores.park += 45;
  if (text.includes('playing at') && text.includes('park')) settingScores.park += 40;
  
  // Departure context scoring (leaving FROM a location, not AT that location)
  if ((text.includes('goodbye') || text.includes('leaving') || text.includes('left')) && homePattern.test(text)) {
    settingScores.home -= 20; // Reduce home score if departing from home
  }
  
  // Current location indicators (AT/IN/INSIDE + location = strong presence)
  if (text.includes('at the park') || text.includes('in the park')) settingScores.park += 35;
  if (text.includes('at home') || text.includes('in the house')) settingScores.home += 35;
  if (text.includes('at school') || text.includes('in school')) settingScores.school += 35;
  if (text.includes('at the beach') || text.includes('on the beach')) settingScores.beach += 35;
  
  // Find the setting with the highest score
  let highestScore = 0;
  let topSetting = 'outdoor scene';
  
  Object.entries(settingScores).forEach(([setting, score]) => {
    if (score > highestScore) {
      highestScore = score;
      topSetting = setting;
    }
  });
  
  baseSetting = topSetting;
  
  // Apply cultural enhancement bypass logic
  const culturallyEnhancedSetting = applyCulturalSettingEnhancement(baseSetting, userInfo);
  
  // ENHANCED COMPREHENSIVE VISUAL DETECTION SYSTEM
  const objects = [];
  const animals = [];
  const clothingItems = [];
  const colorObjectPairs = [];
  const visualModifiers = [];
  
  // Comprehensive animal detection array
  const animalKeywords = ['bunny', 'rabbit', 'cat', 'kitten', 'dog', 'puppy', 'bird', 'bear', 'fox', 'deer', 'squirrel', 'mouse', 'lion', 'elephant', 'giraffe', 'monkey', 'tiger', 'zebra', 'horse', 'cow', 'pig', 'sheep', 'goat', 'duck', 'goose', 'chicken', 'fish', 'butterfly', 'bee', 'frog', 'turtle', 'snake'];
  
  // PHASE 1: EXPANDED OBJECT DETECTION ARRAYS
  const allObjects = ['ball', 'book', 'toy', 'car', 'bike', 'flower', 'shell', 'kite', 'balloon', 'swing', 'slide', 'backpack', 'lunchbox', 'crayon', 'pencil', 'notebook', 'apple', 'sandwich', 'cookie', 'juice', 'water', 'umbrella', 'sunglasses', 'camera', 'phone', 'tablet', 'game', 'puzzle', 'doll', 'truck', 'train', 'airplane'];
  
  // Comprehensive clothing detection
  const clothingKeywords = ['dress', 'shirt', 'pants', 'skirt', 'shoes', 'sneakers', 'boots', 'sandals', 'hat', 'cap', 'jacket', 'coat', 'sweater', 'hoodie', 'socks', 'shorts', 'jeans', 'blouse', 'vest', 'scarf', 'gloves', 'mittens', 'pajamas', 'nightgown', 'uniform', 'costume', 'tutu', 'overalls', 'cardigan', 'blazer'];
  
  // Color keywords for association
  const colorKeywords = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white', 'brown', 'gray', 'grey', 'navy', 'maroon', 'turquoise', 'violet', 'magenta', 'cyan', 'lime', 'gold', 'silver', 'beige', 'tan', 'coral', 'lavender', 'mint', 'peach', 'ivory', 'crimson', 'emerald'];
  
  // Descriptive modifiers
  const modifierKeywords = ['favorite', 'new', 'pretty', 'beautiful', 'cute', 'warm', 'cozy', 'soft', 'bright', 'sparkly', 'shiny', 'fluffy', 'comfortable', 'special', 'magical', 'amazing', 'wonderful', 'lovely', 'perfect', 'best', 'cool', 'awesome', 'fantastic', 'incredible', 'magnificent', 'gorgeous', 'stunning', 'elegant', 'stylish', 'trendy'];
  
  // PHASE 2: ADVANCED DETAIL EXTRACTION SYSTEM
  function extractVisualDetails(fullText) {
    const detectedDetails = {
      clothing: [],
      colorObjects: [],
      modifiedItems: [],
      rawDetails: []
    };
    
    console.log(`👗 CLOTHING DETECTION - Starting comprehensive scan of text`);
    
    // Color-Clothing Association Detection
    clothingKeywords.forEach(clothing => {
      colorKeywords.forEach(color => {
        // Pattern: "blue dress", "her red shirt", "favorite yellow hat"
        const patterns = [
          new RegExp(`\\b${color}\\s+${clothing}\\b`, 'gi'),
          new RegExp(`\\b(her|his|their)\\s+${color}\\s+${clothing}\\b`, 'gi'),
          new RegExp(`\\b(\\w+)\\s+${color}\\s+${clothing}\\b`, 'gi'),
          new RegExp(`\\bwears?\\s+(?:a|an|her|his|their)?\\s*${color}\\s+${clothing}\\b`, 'gi'),
          new RegExp(`\\b${clothing}\\s+(?:is|was)\\s+${color}\\b`, 'gi')
        ];
        
        patterns.forEach(pattern => {
          const matches = [...fullText.matchAll(pattern)];
          matches.forEach(match => {
            const fullMatch = match[0].toLowerCase().trim();
            const colorClothingPair = `${color} ${clothing}`;
            if (!detectedDetails.colorObjects.find(item => item.includes(colorClothingPair))) {
              detectedDetails.colorObjects.push(colorClothingPair);
              detectedDetails.rawDetails.push(fullMatch);
              console.log(`👗 CLOTHING DETECTION - Found color-clothing pair: "${colorClothingPair}" from "${fullMatch}"`);
            }
          });
        });
      });
    });
    
    // Modified Clothing Detection (favorite dress, new shoes, etc.)
    modifierKeywords.forEach(modifier => {
      clothingKeywords.forEach(clothing => {
        const patterns = [
          new RegExp(`\\b${modifier}\\s+${clothing}\\b`, 'gi'),
          new RegExp(`\\b(her|his|their)\\s+${modifier}\\s+${clothing}\\b`, 'gi'),
          new RegExp(`\\bwears?\\s+(?:a|an|her|his|their)?\\s*${modifier}\\s+${clothing}\\b`, 'gi')
        ];
        
        patterns.forEach(pattern => {
          const matches = [...fullText.matchAll(pattern)];
          matches.forEach(match => {
            const fullMatch = match[0].toLowerCase().trim();
            const modifiedItem = `${modifier} ${clothing}`;
            if (!detectedDetails.modifiedItems.find(item => item.includes(modifiedItem))) {
              detectedDetails.modifiedItems.push(modifiedItem);
              detectedDetails.rawDetails.push(fullMatch);
              console.log(`👗 CLOTHING DETECTION - Found modified clothing: "${modifiedItem}" from "${fullMatch}"`);
            }
          });
        });
      });
    });
    
    // Standalone Clothing Detection
    clothingKeywords.forEach(clothing => {
      const patterns = [
        new RegExp(`\\bwears?\\s+(?:a|an|her|his|their)?\\s*${clothing}\\b`, 'gi'),
        new RegExp(`\\b(her|his|their)\\s+${clothing}\\b`, 'gi'),
        new RegExp(`\\bin\\s+(?:a|an|her|his|their)?\\s*${clothing}\\b`, 'gi')
      ];
      
      patterns.forEach(pattern => {
        if (pattern.test(fullText) && !detectedDetails.clothing.includes(clothing)) {
          detectedDetails.clothing.push(clothing);
          console.log(`👗 CLOTHING DETECTION - Found standalone clothing: "${clothing}"`);
        }
      });
    });
    
    return detectedDetails;
  }
  
  // Extract visual details from all page text
  const visualDetails = extractVisualDetails(text);
  console.log(`👗 CLOTHING DETECTION - Total details found:`, {
    colorObjects: visualDetails.colorObjects.length,
    modifiedItems: visualDetails.modifiedItems.length,
    clothing: visualDetails.clothing.length,
    rawDetails: visualDetails.rawDetails
  });
  
  // ENHANCED ANIMAL DETECTION with name-based deduplication
  const namedAnimals = new Set();
  const genericAnimals = new Set();
  
  // First pass: detect named animals (e.g., "Fluffy the cat", "Whiskers")
  const namedAnimalPatterns = [
    /(\w+)\s+the\s+(cat|dog|bunny|rabbit|bird|bear|fox|deer|squirrel)/gi,
    /(\w+)\s*,?\s*(?:her|his|their)\s+(cat|dog|bunny|rabbit|bird|bear|fox|deer|squirrel)/gi
  ];
  
  namedAnimalPatterns.forEach(pattern => {
    const matches = [...pageText.matchAll(pattern)];
    matches.forEach(match => {
      const animalName = match[1].toLowerCase();
      const animalType = match[2].toLowerCase();
      if (animalName && animalType && namedAnimals.size < 1) {
        namedAnimals.add(`${animalName} the ${animalType}`);
        console.log(`🐾 TIER 2.5 NAMED ANIMAL DEBUG - Detected: ${animalName} the ${animalType}`);
      }
    });
  });
  
  // Second pass: only add generic animals if no named animals found
  if (namedAnimals.size === 0) {
    animalKeywords.forEach(animal => {
      if (text.includes(animal) && genericAnimals.size < 1) {
        genericAnimals.add(animal);
        console.log(`🐾 TIER 2.5 GENERIC ANIMAL DEBUG - Detected: ${animal}`);
      }
    });
  }
  
  // Combine results with priority to named animals
  const finalAnimals = [...namedAnimals, ...genericAnimals].slice(0, 1);
  animals.push(...finalAnimals);
  
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
  
  // PHASE 3: ENHANCED VISUAL ELEMENT INTEGRATION
  // Combine all detected visual details for rich prompt construction
  const allVisualElements = [];
  
  // Priority 1: Color-object pairs (most specific, e.g., "blue dress")
  if (visualDetails.colorObjects.length > 0) {
    allVisualElements.push(...visualDetails.colorObjects.slice(0, 2));
    console.log(`👗 VISUAL INTEGRATION - Added color-object pairs: ${visualDetails.colorObjects.slice(0, 2).join(', ')}`);
  }
  
  // Priority 2: Modified items (e.g., "favorite shoes", "new jacket")
  if (visualDetails.modifiedItems.length > 0 && allVisualElements.length < 2) {
    const remainingSlots = 2 - allVisualElements.length;
    allVisualElements.push(...visualDetails.modifiedItems.slice(0, remainingSlots));
    console.log(`👗 VISUAL INTEGRATION - Added modified items: ${visualDetails.modifiedItems.slice(0, remainingSlots).join(', ')}`);
  }
  
  // Priority 3: Standalone clothing (lowest priority)
  if (visualDetails.clothing.length > 0 && allVisualElements.length < 2) {
    const remainingSlots = 2 - allVisualElements.length;
    allVisualElements.push(...visualDetails.clothing.slice(0, remainingSlots));
    console.log(`👗 VISUAL INTEGRATION - Added standalone clothing: ${visualDetails.clothing.slice(0, remainingSlots).join(', ')}`);
  }

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
  
  // PHASE 4: ENHANCED CLOTHING INTEGRATION
  // Add detected clothing/visual details with priority system
  if (allVisualElements.length > 0) {
    scene += ` wearing ${allVisualElements.join(' and ')}`;
    console.log(`👗 VISUAL INTEGRATION - Added clothing to scene: ${allVisualElements.join(', ')}`);
  }
  
  // Add detected animals to scene (character-animal interaction)
  if (animals.length > 0) {
    scene += ` scene with ${animals.join(' and ')}`;
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
  console.log(`👗 CLOTHING DETECTION - Final visual elements included: ${allVisualElements.length > 0 ? allVisualElements.join(', ') : 'none detected'}`);
  
  return scene;
}

// Enhanced hardcoded styles with exact styleFrameworks.js verbiage
function getHardcodedStyle(difficulty: string) {
  const styles = {
    'beginner': {
      prompt: '3D digital art style, Pixar-inspired character design, soft rounded features, friendly appealing aesthetics, bright cheerful colors, clean polished rendering',
      quality: 'High-quality 3D animated character illustration for early readers',
      suffix: '3D animated style, Pixar-quality rendering, child-friendly design, diverse representation, warm natural lighting optimized for dark skin tones',
      steps: 15,
      cfgScale: 7.0,
      strength: 0.75
    },
    'easy': {
      prompt: '3D digital art style, Pixar-inspired character design, soft rounded features, friendly appealing aesthetics, bright cheerful colors, clean polished rendering',
      quality: 'High-quality 3D animated character illustration for early readers',
      suffix: '3D animated style, Pixar-quality rendering, child-friendly design, diverse representation, warm natural lighting optimized for dark skin tones',
      steps: 15,
      cfgScale: 7.0,
      strength: 0.75
    },
    'medium': {
      prompt: 'Digital painting style, painterly brush strokes, cinematic composition, soft artistic lighting, professional digital artwork quality',
      quality: 'ultra professional digital illustration standard, high quality professional artwork, focused character presentation, culturally accurate, natural lighting for dark skin, authentic features',
      suffix: 'Digital illustration with painterly qualities, soft brush strokes, rich textures and depth, artistic rendering, warm natural lighting optimized for dark skin tones, culturally accurate, safe wholesome content',
      steps: 19,
      cfgScale: 7.5,
      strength: 0.8
    },
    'hard': {
      prompt: 'Professional digital illustration with sophisticated artistic technique, refined color theory and palette mastery, intricate compositional details, advanced lighting techniques, mature visual storytelling',
      quality: 'Gallery-quality digital illustration with sophisticated artistic maturity, professional composition and advanced visual narrative techniques',
      suffix: 'professional digital illustration, sophisticated artistic maturity, refined visual storytelling, advanced composition techniques, gallery-worthy quality, warm natural lighting optimized for dark skin tones',
      steps: 20,
      cfgScale: 8.0,
      strength: 0.85
    },
    'expert': {
      prompt: 'Fine art digital illustration with masterful artistic technique, complex color harmonies and advanced tonal relationships, museum-quality detail work, professional lighting mastery, cinematic visual narrative sophistication',
      quality: 'Museum-quality fine art digital illustration with masterful artistic sophistication, cinematic composition and professional visual narrative excellence',
      suffix: 'fine art digital illustration, masterful artistic sophistication, cinematic visual narrative, museum-quality professional artwork, advanced compositional mastery, warm natural lighting optimized for dark skin tones',
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
  } else if (avatarType === 'child' || avatarType === 'prefer-not-to-answer') {
    negatives.push('masculine features, feminine features, boy characteristics, girl characteristics, gender-specific clothing, dress, skirt, masculine clothing, gendered accessories, gendered hairstyles');
    console.log(`🎯 GENDER NEUTRAL NEGATIVES - Applied comprehensive gender-neutral negative prompts for ${avatarType} (PHASE 3 FIX: child OR prefer-not-to-answer)`);
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

// Enhanced cultural intelligence for Tier 2.5
function applyCulturalSettingEnhancement(baseSetting: string, userInfo?: any): string {
  // Enhanced African American detection for English speakers
  if (userInfo?.nativeLanguage === 'en' || !userInfo?.nativeLanguage) {
    // Check for African American cultural markers
    const isAfricanAmericanUser = userInfo?.avatar?.skinTone === 'dark' || 
                                  userInfo?.avatar?.type === 'african_american' ||
                                  userInfo?.name?.toLowerCase().includes('african') ||
                                  Math.random() < 0.25; // 25% cultural enhancement chance
    
    if (isAfricanAmericanUser) {
      const culturalElements = [
        'with authentic African American community elements',
        'in a diverse urban neighborhood setting', 
        'with rich cultural community atmosphere',
        'featuring authentic multicultural American environment',
        'with vibrant community cultural elements'
      ];
      const element = culturalElements[Math.floor(Math.random() * culturalElements.length)];
      return `${baseSetting} ${element}`;
    }
    
    return `${baseSetting} scene`;
  } else {
    // International Route: Enhanced cultural adaptation
    const language = userInfo?.nativeLanguage || 'international';
    const culturalEnhancements = {
      'es': 'with Hispanic American cultural elements and familia atmosphere',
      'fr': 'with French American cultural elements',
      'de': 'with German American cultural elements', 
      'it': 'with Italian American cultural elements',
      'pt': 'with Portuguese American cultural elements'
    };
    
    return `${baseSetting} ${culturalEnhancements[language] || `with ${language} cultural elements`}`;
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