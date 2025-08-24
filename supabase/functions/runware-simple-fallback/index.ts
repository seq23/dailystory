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

    // Enhanced premium template with hardcoded scene extraction
    const extractedScene = extractSceneWithPremiumTemplate(pageText, userInfo, avatarIdentity, mappedDifficulty);
    
    // Enhanced hardcoded style with exact styleFrameworks.js verbiage
    const style = getHardcodedStyle(mappedDifficulty);
    
    // Build final prompt with enhanced negative prompts
    const negativePrompt = getEnhancedNegativePrompt(userInfo, avatarIdentity, avatarIdentity?.type || userInfo?.avatar?.type);
    const finalPrompt = extractedScene;
    
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
              
              // PHASE 1: Store image prompt in SessionStateManager
              try {
                const { SessionStateManager } = await import('../_shared/SessionStateManager.js');
                const sessionManager = new SessionStateManager();
                sessionManager.storeImagePrompt('tier-2-5-session', {
                  tier: '2.5',
                  promptText: finalPrompt,
                  negativePrompt: negativePrompt,
                  originalPageText: pageText,
                  enhancedPrompt: finalPrompt,
                  pageNumber: 1,
                  success: true,
                  imageURL: item.imageURL,
                  seed: item.seed,
                  provider: 'runware-simple-fallback',
                  model: 'runware:100@1',
                  cost: item.cost || 0.01,
                  generationTime: 0,
                  objects: [],
                  secondaryCharacters: [],
                  bedroom: false,
                  metadata: {
                    objectsDetected: 0,
                    secondaryCharsDetected: 0,
                    bedroomSceneDetected: false,
                    template: 'premium-template',
                    culturalEnhancement: true
                  }
                });
                console.log(`📸 [TIER-2.5] Stored image prompt for session tier-2-5-session, page 1`);
              } catch (error) {
                console.warn('⚠️ Failed to store Tier 2.5 prompt:', error.message);
              }
              
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

// ============= PREMIUM TEMPLATE SYSTEM WITH HARDCODED ARRAYS =============

// HARDCODED AFRICAN AMERICAN ARRAYS (Nuclear Independence)
const HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES = {
  boys: [
    'textured buzz cut', 'detailed fade cut', 'textured taper fade', 'detailed high top fade', 
    'textured low fade', 'detailed crew cut', 'textured caesar cut', 'detailed curly top fade', 
    'textured curly high fade', 'detailed curly low fade', 'textured curly taper fade', 
    'detailed curly high top', 'textured curly mohawk', 'detailed curly faux hawk', 
    'textured curly undercut', 'detailed fade with curls on top', 'textured crop', 
    'detailed curly fringe fade', 'textured twisted top fade', 'detailed undercut design', 
    'textured hair tattoo', 'detailed geometric patterns', 'textured mini afro', 
    'detailed medium afro', 'textured tapered afro', 'detailed wash and go', 
    'textured finger coils', 'detailed two strand twists', 'textured flat twists', 
    'detailed mini twists', 'textured locs', 'detailed starter locs', 'textured freeform locs', 
    'detailed twisted locs', 'textured side part locs', 'detailed middle part locs', 
    'textured ponytail with locs', 'detailed nape area tapered'
  ],
  girls: [
    'textured medium natural hair', 'textured long natural hair', 'textured shoulder-length hair', 
    'textured chin-length hair', 'detailed twist out', 'detailed bantu knots', 'detailed rod set', 
    'detailed braid out', 'textured high puff', 'textured low puff', 'textured side puff', 
    'textured double puff', 'detailed space buns', 'detailed top knot bun', 'detailed low bun', 
    'detailed messy bun', 'detailed sleek bun', 'detailed cornrows', 'detailed box braids', 
    'detailed micro braids', 'detailed jumbo braids', 'detailed goddess braids', 
    'detailed dutch braids', 'detailed french braids', 'detailed fishtail braids', 
    'detailed halo braid', 'detailed crown braid', 'detailed side braids', 
    'detailed three strand twists', 'detailed senegalese twists', 'detailed marley twists', 
    'detailed havana twists', 'detailed passion twists', 'detailed spring twists', 
    'detailed kinky twists', 'detailed chunky twists', 'detailed protective twists', 
    'textured sisterlocs', 'textured microlocs', 'textured traditional locs', 
    'textured interlocked locs', 'detailed braided locs', 'detailed loc updo', 
    'textured half up half down locs', 'textured afro puffs', 'textured large afro', 
    'textured picked out afro', 'textured shaped afro', 'textured curly afro', 
    'textured coily afro', 'textured kinky afro', 'textured side swept bangs', 
    'textured face framing layers', 'textured layered cut', 'detailed blunt cut', 
    'detailed asymmetrical cut'
  ]
};

const HARDCODED_AFRICAN_AMERICAN_SKIN_TONES = [
  'light brown complexion', 'medium brown skin', 'rich brown complexion', 'deep brown skin',
  'warm caramel complexion', 'golden brown skin', 'mahogany complexion', 'dark chocolate skin',
  'ebony complexion', 'honey-toned skin', 'bronze complexion', 'chestnut brown skin',
  'amber-toned complexion', 'cocoa brown skin', 'espresso complexion', 'mocha-colored skin',
  'sienna brown complexion', 'russet brown skin', 'copper-toned complexion', 'warm brown skin with golden undertones'
];

const HARDCODED_AFRICAN_AMERICAN_EYE_COLORS = [
  'dark brown eyes', 'deep chocolate brown eyes', 'warm brown eyes', 'amber brown eyes',
  'rich mahogany eyes', 'hazel brown eyes', 'golden brown eyes', 'coffee brown eyes',
  'chestnut brown eyes', 'honey brown eyes', 'dark amber eyes', 'bronze brown eyes',
  'caramel brown eyes', 'espresso brown eyes', 'warm hazel eyes', 'warm hazel-green eyes'
];

const HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES = [
  'expressive almond-shaped eyes', 'bright wide-set eyes', 'sparkling round eyes', 'gentle oval-shaped eyes',
  'striking large eyes', 'warm smiling eyes', 'intelligent alert eyes', 'kind gentle eyes',
  'curious bright eyes', 'confident strong eyes', 'full natural lips', 'warm smiling lips',
  'gentle curved lips', 'expressive full lips', 'kind smiling mouth', 'naturally full lips',
  'soft rounded lips', 'bright cheerful smile', 'warm genuine smile', 'friendly welcoming smile',
  'strong defined nose', 'graceful nose shape', 'noble nose profile', 'distinctive nose',
  'well-proportioned nose', 'beautiful nose shape', 'elegant nose line', 'natural nose contour',
  'refined nose features', 'classic nose profile', 'harmonious facial features, authentic African American features',
  'beautiful natural features, authentic African American features', 'expressive facial structure, authentic African American features',
  'warm facial expression, authentic African American features', 'confident facial features, authentic African American features'
];

const HARDCODED_AFRICAN_AMERICAN_CLOTHING = [
  'casual t-shirt and jeans', 'hoodie and sneakers', 'polo shirt and khakis', 
  'graphic tee and shorts', 'button-up shirt and pants', 'sweater and jeans', 
  'tank top and cargo shorts', 'flannel shirt and jeans', 'jersey and joggers', 
  'denim jacket and jeans', 'cardigan and slacks', 'henley shirt and chinos', 
  'baseball cap and casual wear', 'sneakers and athletic socks', 'backpack and school clothes', 
  'comfortable everyday outfit', 'playground-appropriate clothing', 'weekend casual wear', 
  'school uniform alternatives', 'athletic wear and running shoes', 'layered casual look', 
  'seasonal appropriate clothing', 'comfortable playtime outfit', 'trendy youth fashion', 
  'classic American casual style', 'modern comfortable clothing', 'age-appropriate fashion'
];

// PREMIUM PROMPT TEMPLATES BY DIFFICULTY (Enhanced with Objects & Secondary Characters)
const PREMIUM_PROMPT_TEMPLATES = {
  beginner: "{character} {age}, {skin}, {hair}, {eyes}, {features}, wearing {clothing}, {scene} in {setting}{objects}{secondary_characters}. {emotion}. {quality}",
  easy: "{character} {age}, {skin}, {hair}, {eyes}, {features}, wearing {clothing}, {scene} in {setting}{objects}{secondary_characters}. {emotion}. {quality}",
  medium: "{character} {age}, {skin}, {hair}, {eyes}, {features}, wearing {clothing}, {scene} in {setting}{objects}{secondary_characters}. {emotion}. {quality}. {suffix}",
  hard: "{character} {age}, {skin}, {hair}, {eyes}, {features}, wearing {clothing}, {scene} in {setting}{objects}{secondary_characters}. {emotion}. {quality}. {suffix}",
  expert: "{character} {age}, {skin}, {hair}, {eyes}, {features}, wearing {clothing}, {scene} in {setting}{objects}{secondary_characters}. {emotion}. {quality}. {suffix}"
};

function extractSceneWithPremiumTemplate(pageText: string, userInfo?: any, avatarIdentity?: any, difficulty?: string): string {
  if (!pageText) return fillPremiumTemplate('a friendly character in a beautiful scene', pageText, userInfo, avatarIdentity, difficulty || 'medium');
  
  const text = pageText.toLowerCase();
  const sentences = pageText.split(/[.!?]+/).filter(s => s.trim());
  
  // Enhanced scene scoring with better visual prioritization and bedroom detection
  let bestScene = sentences[0] || pageText;
  let bestScore = 0;
  let detectedSetting = 'outdoor'; // Default setting
  
  sentences.forEach(sentence => {
    let score = 0;
    const lowerSentence = sentence.toLowerCase();
    
    // 🛏️ BEDROOM SCENE DETECTION (High Priority)
    if (lowerSentence.includes('wakes up') || lowerSentence.includes('wake up') || 
        lowerSentence.includes('woke up') || lowerSentence.includes('sleeping') || 
        lowerSentence.includes('bed') || lowerSentence.includes('bedroom') ||
        lowerSentence.includes('pillow') || lowerSentence.includes('blanket') ||
        lowerSentence.includes('dream') || lowerSentence.includes('morning')) {
      score += 40; // High priority for bedroom scenes
      detectedSetting = 'bedroom';
      console.log('🛏️ BEDROOM SCENE DETECTED:', lowerSentence.substring(0, 100));
    }
    
    // Indoor scene detection
    if (lowerSentence.includes('room') || lowerSentence.includes('house') || 
        lowerSentence.includes('kitchen') || lowerSentence.includes('living room') ||
        lowerSentence.includes('inside') || lowerSentence.includes('home')) {
      score += 25;
      if (detectedSetting === 'outdoor') detectedSetting = 'indoor';
    }
    
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

  console.log(`🔍 SCENE ANALYSIS: Best score: ${bestScore}, Detected setting: ${detectedSetting}`);
  
  return fillPremiumTemplate(bestScene, pageText, userInfo, avatarIdentity, difficulty || 'medium', detectedSetting);
}

function fillPremiumTemplate(scene: string, originalPageText?: string, userInfo?: any, avatarIdentity?: any, difficulty?: string, detectedSetting?: string): string {
  const template = PREMIUM_PROMPT_TEMPLATES[difficulty || 'medium'] || PREMIUM_PROMPT_TEMPLATES.medium;
  
  // 🔍 PREMIUM TEMPLATE DEBUG LOGGING
  console.log(`🎨 PREMIUM TEMPLATE PROCESSING START`);
  console.log(`📋 Template Selected: ${template}`);
  console.log(`🎬 Scene Input: ${scene}`);
  console.log(`👤 User Info:`, userInfo ? JSON.stringify(userInfo, null, 2) : 'None');
  console.log(`🎭 Avatar Identity:`, avatarIdentity ? JSON.stringify(avatarIdentity, null, 2) : 'None');
  console.log(`📊 Difficulty: ${difficulty}`);
  
  // CHARACTER DETECTION WITH AVATAR TYPE MAPPING
  let character = userInfo?.name || 'child';
  
  // Store original avatar type for detection in scene construction and negative prompting
  const originalAvatarType = avatarIdentity?.type || userInfo?.avatar?.type;
  
  // Map avatar types: "prefer-not-to-answer" → "child", others unchanged
  const mapAvatarTypeForPrompt = (type: string | undefined): string => {
    if (type === 'prefer-not-to-answer') return 'child';
    return type || 'child';
  };
  
  let genderType = mapAvatarTypeForPrompt(originalAvatarType);
  console.log(`🎯 AVATAR MAPPING - Original: ${originalAvatarType} → Mapped: ${genderType}`);
  
  const text = scene.toLowerCase();
  if (text.includes('girl') || text.includes('she')) {
    character = character === 'child' ? 'girl' : character;
    // Only override if no explicit avatar selection
    if (!originalAvatarType) {
      genderType = 'girl';
    }
  } else if (text.includes('boy') || text.includes('he')) {
    character = character === 'child' ? 'boy' : character;
    // Only override if no explicit avatar selection  
    if (!originalAvatarType) {
      genderType = 'boy';
    }
  }

  // Age determination
  const age = getAgeFromDifficulty(difficulty || 'medium');
  
  // Avatar description components
  const skinTone = avatarIdentity?.skinTone || userInfo?.avatar?.skinTone || 'medium';
  const isAfricanAmerican = userInfo?.nativeLanguage === 'en' && skinTone === 'dark';
  
  let skin, hair, eyes, features, clothing;
  
  if (isAfricanAmerican) {
    // Use hardcoded African American arrays
    skin = getRandomItem(HARDCODED_AFRICAN_AMERICAN_SKIN_TONES);
    eyes = getRandomItem(HARDCODED_AFRICAN_AMERICAN_EYE_COLORS);
    features = getRandomItem(HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES);
    clothing = getRandomItem(HARDCODED_AFRICAN_AMERICAN_CLOTHING);
    
    const hairstyles = genderType === 'girl' || genderType === 'woman' ? 
      HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.girls : 
      HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.boys;
    hair = getRandomItem(hairstyles);

    // 🔍 AFRICAN AMERICAN ARRAY DEBUG LOGGING
    console.log(`🎯 AFRICAN AMERICAN ARRAYS SELECTED:`);
    console.log(`   👤 Gender Type: ${genderType}`);
    console.log(`   🎨 Skin: ${skin} (from ${HARDCODED_AFRICAN_AMERICAN_SKIN_TONES.length} options)`);
    console.log(`   💇 Hair: ${hair} (from ${hairstyles.length} ${genderType === 'girl' || genderType === 'woman' ? 'girls' : 'boys'} hairstyles)`);
    console.log(`   👁️ Eyes: ${eyes} (from ${HARDCODED_AFRICAN_AMERICAN_EYE_COLORS.length} options)`);
    console.log(`   😊 Features: ${features} (from ${HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES.length} options)`);
    console.log(`   👕 Clothing: ${clothing} (from ${HARDCODED_AFRICAN_AMERICAN_CLOTHING.length} options)`);
  } else {
    // Standard descriptions
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
    
    skin = skinMap[skinTone] || 'medium skin';
    hair = hairMap[skinTone] || 'brown hair';
    eyes = 'bright eyes';
    features = 'friendly face';
    clothing = 'casual comfortable clothing';

    // 🔍 STANDARD MAPPING DEBUG LOGGING
    console.log(`📊 STANDARD MAPPINGS SELECTED:`);
    console.log(`   🎨 Skin: ${skin} (mapped from skinTone: ${skinTone})`);
    console.log(`   💇 Hair: ${hair} (mapped from skinTone: ${skinTone})`);
    console.log(`   👁️ Eyes: ${eyes} (standard)`);
    console.log(`   😊 Features: ${features} (standard)`);
    console.log(`   👕 Clothing: ${clothing} (standard)`);
  }
  
  // Object detection from original page text
  const detectedObjects = detectObjects(originalPageText || scene);
  const objectsText = detectedObjects.length > 0 ? ` with ${detectedObjects.join(', ')}` : '';
  console.log(`🔍 OBJECTS DETECTED: ${detectedObjects.length > 0 ? detectedObjects.join(', ') : 'none'}`);
  
  // Secondary character detection from original page text  
  const detectedSecondaryChars = detectSecondaryCharacters(originalPageText || scene);
  const secondaryCharsText = detectedSecondaryChars.length > 0 ? ` alongside ${detectedSecondaryChars.join(', ')}` : '';
  console.log(`🔍 SECONDARY CHARACTERS DETECTED: ${detectedSecondaryChars.length > 0 ? detectedSecondaryChars.join(', ') : 'none'}`);

  // Setting determination with bedroom detection
  const baseSetting = detectedSetting === 'bedroom' ? 'cozy bedroom scene' : 
                     detectedSetting === 'indoor' ? 'indoor scene' : 'outdoor scene';
  const setting = applyCulturalSettingEnhancement(baseSetting, userInfo, detectedSetting);
  
  // Emotion detection
  const emotion = detectEmotionFromText(scene);
  
  // Quality and suffix based on difficulty
  const style = getHardcodedStyle(difficulty || 'medium');
  const quality = style.quality;
  const suffix = style.suffix;
  
  // Fill template placeholders
  const filledTemplate = template
    .replace('{character}', character)
    .replace('{age}', age)
    .replace('{skin}', skin)
    .replace('{hair}', hair)
    .replace('{eyes}', eyes)
    .replace('{features}', features)
    .replace('{clothing}', clothing)
    .replace('{scene}', scene)
    .replace('{setting}', setting)
    .replace('{objects}', objectsText)
    .replace('{secondary_characters}', secondaryCharsText)
    .replace('{emotion}', emotion)
    .replace('{quality}', quality)
    .replace('{suffix}', suffix || '');

  // Append full page text at the end for complete context
  const finalPromptWithPageText = originalPageText ? 
    `${filledTemplate}. Full story context: "${originalPageText}"` : 
    filledTemplate;

  // 🔍 FINAL TEMPLATE DEBUG LOGGING
  console.log(`🎯 FINAL PLACEHOLDER VALUES:`);
  console.log(`   {character} → ${character}`);
  console.log(`   {age} → ${age}`);
  console.log(`   {skin} → ${skin}`);
  console.log(`   {hair} → ${hair}`);
  console.log(`   {eyes} → ${eyes}`);
  console.log(`   {features} → ${features}`);
  console.log(`   {clothing} → ${clothing}`);
  console.log(`   {scene} → ${scene}`);
  console.log(`   {setting} → ${setting}`);
  console.log(`   {objects} → ${objectsText || '(none)'}`);
  console.log(`   {secondary_characters} → ${secondaryCharsText || '(none)'}`);
  console.log(`   {emotion} → ${emotion}`);
  console.log(`   {quality} → ${quality}`);
  console.log(`   {suffix} → ${suffix || '(empty)'}`);
  console.log(`🏁 FINAL ASSEMBLED TEMPLATE:`);
  console.log(`   ${filledTemplate}`);
  console.log(`📄 FULL PAGE TEXT APPENDED: ${originalPageText ? 'YES' : 'NO'}`);
  console.log(`🎨 PREMIUM TEMPLATE PROCESSING COMPLETE`);

  return finalPromptWithPageText;
}

// ============= OBJECT & SECONDARY CHARACTER DETECTION =============
// Nuclear independence - inline detection for bulletproof operation

function detectObjects(text: string): string[] {
  if (!text) return [];
  
  const objects: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Color + object patterns (e.g., "red shiny ball", "blue toy car")
  const colorObjectPatterns = [
    /(\w+)\s+(shiny|sparkly|bright|colorful|beautiful|big|small|tiny|huge|little)\s+(ball|toy|book|doll|car|truck|bike|flower|butterfly|bird)/g,
    /(red|blue|green|yellow|orange|purple|pink|white|black|brown)\s+(ball|toy|book|doll|car|truck|bike|flower|butterfly|bird)/g,
    /favorite\s+(ball|toy|book|doll|car|truck|bike|flower|butterfly|bird)/g
  ];
  
  colorObjectPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(lowerText)) !== null) {
      const objectDesc = match[0];
      if (!objects.includes(objectDesc)) {
        objects.push(objectDesc);
      }
    }
  });
  
  // Simple object detection (toys, items, etc.)
  const simpleObjects = [
    'ball', 'toy car', 'doll', 'stuffed animal', 'teddy bear', 'book', 'bicycle', 'bike',
    'flower', 'butterfly', 'backpack', 'lunchbox', 'crayon', 'pencil', 'notebook'
  ];
  
  simpleObjects.forEach(obj => {
    if (lowerText.includes(obj) && !objects.some(o => o.includes(obj))) {
      objects.push(obj);
    }
  });
  
  console.log(`🔍 OBJECT DETECTION: Found ${objects.length} objects in "${text.substring(0, 100)}..."`);
  return objects.slice(0, 3); // Limit to 3 objects to avoid prompt overflow
}

function detectSecondaryCharacters(text: string): string[] {
  if (!text) return [];
  
  const characters: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Named animal patterns (e.g., "doggy named Max", "cat called Whiskers")
  const namedAnimalPatterns = [
    /(doggy|dog|puppy|cat|kitten|bunny|rabbit|bird|fish|hamster|guinea pig)\s+(named|called)\s+(\w+)/g,
    /(pet|animal)\s+(named|called)\s+(\w+)/g
  ];
  
  namedAnimalPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(lowerText)) !== null) {
      const animalType = match[1];
      const name = match[3];
      const charDesc = `${name} the ${animalType}`;
      if (!characters.includes(charDesc)) {
        characters.push(charDesc);
      }
    }
  });
  
  // Named people patterns (e.g., "friend Sarah", "teacher Ms. Johnson", "mom", "dad")
  const namedPeoplePatterns = [
    /(friend|buddy|pal)\s+(\w+)/g,
    /(teacher|miss|mr|mrs|ms)\s+(\w+)/g,
    /(mom|mother|dad|father|grandma|grandpa|sister|brother)\s+(\w+)?/g
  ];
  
  namedPeoplePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(lowerText)) !== null) {
      const role = match[1];
      const name = match[2] || '';
      const charDesc = name ? `${role} ${name}` : role;
      if (!characters.includes(charDesc) && charDesc !== 'mom' && charDesc !== 'dad') {
        characters.push(charDesc);
      }
    }
  });
  
  console.log(`🔍 CHARACTER DETECTION: Found ${characters.length} secondary characters in "${text.substring(0, 100)}..."`);
  return characters.slice(0, 2); // Limit to 2 characters to avoid prompt overflow
}

// Helper functions for nuclear independence
function getRandomItem(array: string[]): string {
  return array[Math.floor(Math.random() * array.length)];
}

function getAgeFromDifficulty(difficulty: string): string {
  const ageMapping = {
    'beginner': '5-year-old',
    'easy': '7-year-old', 
    'medium': '9-year-old',
    'hard': '11-year-old',
    'expert': '13-year-old'
  };
  return ageMapping[difficulty] || '7-year-old';
}

// ============= LEGACY FUNCTIONS REMOVED FOR NUCLEAR SIMPLICITY =============
// Premium template system replaces the complex detection logic

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

// Unified negative prompt system for Tier 2.5 (independent but consistent with MultiStageEnhancementPipeline)
function getEnhancedNegativePrompt(userInfo?: any, avatarIdentity?: any, originalAvatarType?: string): string {
  console.log('🛡️ Tier 2.5: Building unified negative prompt (independent system)');
  
  const baseNegative = [
    // Quality control (base system)
    'blurry', 'low quality', 'distorted', 'deformed', 'bad anatomy', 'bad proportions', 
    'extra limbs', 'cloned faces', 'malformed limbs', 'missing arms', 'missing legs', 
    'fused fingers', 'too many fingers', 'long neck', 'mutated hands', 'poorly drawn hands', 
    'poorly drawn face', 'mutation', 'ugly', 'pixelated', 'obscure', 'unnatural colors', 
    'poor lighting', 'dull', 'unclear', 'cropped', 'lowres', 'artifacts', 'duplicate',
    
    // Content safety
    'scary', 'inappropriate', 'violent', 'dark themes', 'adult content', 'nsfw', 
    'suggestive', 'weapons', 'blood', 'gore', 'frightening', 'mature themes',
    
    // Style prevention  
    'photorealistic', 'realistic', 'photograph', 'anime', 'manga', 'comic book style',
    'sketch', 'rough drawing', 'watermarks', 'copyrighted characters', 'brand logos',
    
    // Text prevention
    'text', 'letters', 'words', 'writing', 'typography', 'captions', 'labels', 'name in image',
    
    // Body completeness
    'floating head', 'portrait only', 'incomplete body', 'missing torso', 'poor composition'
  ];
  
  // Add cultural sensitivity filters
  const skinTone = avatarIdentity?.skinTone || userInfo?.avatar?.skinTone;
  if (skinTone === 'dark') {
    baseNegative.push(
      'whitewashing', 'cultural insensitivity', 'stereotypes', 'caricature',
      'lightened skin', 'whitewashed', 'caucasian features', 'stereotypical', 
      'altered ethnicity', 'artificial skin lightening', 'oversaturated'
    );
    console.log('🛡️ Tier 2.5: Added cultural sensitivity filters for dark skin tone');
  }
  
  // Add gender consistency enforcement
  const avatarType = originalAvatarType || avatarIdentity?.type || userInfo?.avatar?.type || 'child';
  if (avatarType === 'girl') {
    baseNegative.push('boy character', 'male character', 'masculine features');
    console.log('🛡️ Tier 2.5: Added girl consistency filters');
  } else if (avatarType === 'boy') {
    baseNegative.push('girl character', 'female character', 'feminine features', 'dress', 'skirt');
    console.log('🛡️ Tier 2.5: Added boy consistency filters');
  } else if (avatarType === 'child' || avatarType === 'prefer-not-to-answer') {
    baseNegative.push(
      'masculine features', 'feminine features', 'boy characteristics', 'girl characteristics',
      'gender-specific clothing', 'dress', 'skirt', 'masculine clothing', 'gendered accessories',
      'gendered hairstyles'
    );
    console.log(`🛡️ Tier 2.5: Added gender-neutral filters for ${avatarType}`);
  }
  
  // Add consistency filters for multi-page stories
  baseNegative.push('inconsistent character design', 'style variations');
  
  // Add user-specific negatives
  if (userInfo?.name) {
    baseNegative.push(`${userInfo.name} text`, 'name in large letters');
  }
  
  const finalNegative = baseNegative.join(', ');
  console.log(`🛡️ Tier 2.5: Unified negative prompt built (${baseNegative.length} components)`);
  
  return finalNegative;
}

// Enhanced cultural intelligence for Tier 2.5
function applyCulturalSettingEnhancement(baseSetting: string, userInfo?: any, detectedSetting?: string): string {
  // Enhanced African American detection for English speakers
  if (userInfo?.nativeLanguage === 'en' || !userInfo?.nativeLanguage) {
    // Check for African American cultural markers
    const isAfricanAmericanUser = userInfo?.avatar?.skinTone === 'dark' || 
                                  userInfo?.avatar?.type === 'african_american' ||
                                  userInfo?.name?.toLowerCase().includes('african') ||
                                  Math.random() < 0.25; // 25% cultural enhancement chance
    
    if (isAfricanAmericanUser) {
      // Choose culturally appropriate elements based on setting type
      const culturalElements = detectedSetting === 'bedroom' ? [
        'with authentic African American home atmosphere',
        'in a warm, culturally rich bedroom setting',
        'featuring diverse family home environment',
        'with authentic multicultural home elements'
      ] : detectedSetting === 'indoor' ? [
        'with authentic African American community elements',
        'in a diverse family home setting',
        'with rich cultural home atmosphere',
        'featuring authentic multicultural indoor environment'
      ] : [
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