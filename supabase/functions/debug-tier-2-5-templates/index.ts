import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  try {
    const url = new URL(req.url);
    const showTemplate = url.searchParams.get('template') === 'true';
    const showArrays = url.searchParams.get('arrays') === 'true';  
    const showCultural = url.searchParams.get('cultural') === 'true';
    const showComparison = url.searchParams.get('comparison') === 'true';

    const { pageText = "A child plays in a beautiful garden", userInfo = {}, difficulty = 'medium' } = await req.json();

    console.log('🔍 DEBUG TIER 2.5 TEMPLATES - Request received');
    console.log(`📄 Page Text: ${pageText}`);
    console.log(`👤 User Info:`, userInfo);
    console.log(`📊 Difficulty: ${difficulty}`);
    console.log(`🎛️ Debug Flags: template=${showTemplate}, arrays=${showArrays}, cultural=${showCultural}, comparison=${showComparison}`);

    // Process avatar identity
    const avatarIdentity = userInfo?.avatar ? {
      type: userInfo.avatar.type === 'prefer-not-to-answer' ? 'child' : (userInfo.avatar.type || 'child'),
      skinTone: userInfo.avatar.skinTone || 'medium'
    } : null;

    let debugOutput: any = {
      input: {
        pageText,
        userInfo,
        avatarIdentity, 
        difficulty
      }
    };

    if (showTemplate || !showArrays && !showCultural && !showComparison) {
      // Default: Show template processing
      debugOutput.templateProcessing = debugTemplateProcessing(pageText, userInfo, avatarIdentity, difficulty);
    }

    if (showArrays) {
      debugOutput.arraySelections = debugArraySelections(userInfo, avatarIdentity);
    }

    if (showCultural) {
      debugOutput.culturalDetection = debugCulturalDetection(userInfo, avatarIdentity);
    }

    if (showComparison) {
      debugOutput.difficultyComparison = debugDifficultyComparison(pageText, userInfo, avatarIdentity);
    }

    return createCorsResponse({
      success: true,
      debug: debugOutput,
      endpoint: 'debug-tier-2-5-templates',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('🚨 Debug Tier 2.5 error:', error);
    return createCorsErrorResponse(`Debug error: ${error.message}`, 500);
  }
});

function debugTemplateProcessing(pageText: string, userInfo?: any, avatarIdentity?: any, difficulty?: string) {
  console.log('🔍 DEBUGGING TEMPLATE PROCESSING');
  
  // Extract scene with debugging
  const sceneResult = debugSceneExtraction(pageText, userInfo, avatarIdentity, difficulty);
  
  // Fill template with debugging  
  const templateResult = debugTemplateFilling(sceneResult.selectedScene, userInfo, avatarIdentity, difficulty);
  
  return {
    sceneExtraction: sceneResult,
    templateFilling: templateResult,
    finalPrompt: templateResult.filledTemplate
  };
}

function debugSceneExtraction(pageText: string, userInfo?: any, avatarIdentity?: any, difficulty?: string) {
  console.log('🎬 DEBUGGING SCENE EXTRACTION');
  
  if (!pageText) {
    return {
      selectedScene: 'a friendly character in a beautiful scene',
      reason: 'No page text provided - using default scene',
      sentences: [],
      scores: []
    };
  }

  const sentences = pageText.split(/[.!?]+/).filter(s => s.trim());
  let bestScene = sentences[0] || pageText;
  let bestScore = 0;
  const sentenceScores: any[] = [];

  sentences.forEach((sentence, index) => {
    let score = 0;
    const lowerSentence = sentence.toLowerCase();
    const scoreBreakdown: any = { sentence, index, totalScore: 0, components: {} };
    
    // Visual richness indicators
    if (lowerSentence.includes('color') || lowerSentence.includes('bright') || lowerSentence.includes('beautiful')) {
      score += 20;
      scoreBreakdown.components.visualRichness = 20;
    }
    if (lowerSentence.includes('big') || lowerSentence.includes('small') || lowerSentence.includes('huge')) {
      score += 15;
      scoreBreakdown.components.sizeDescriptors = 15;
    }
    if (lowerSentence.includes('red') || lowerSentence.includes('blue') || lowerSentence.includes('green') || lowerSentence.includes('yellow')) {
      score += 18;
      scoreBreakdown.components.colors = 18;
    }
    
    // Action and emotional content
    if (lowerSentence.includes('dance') || lowerSentence.includes('twirl') || lowerSentence.includes('jump') || lowerSentence.includes('run') || lowerSentence.includes('play')) {
      score += 25;
      scoreBreakdown.components.action = 25;
    }
    if (lowerSentence.includes('loved') || lowerSentence.includes('enjoyed') || lowerSentence.includes('happy') || lowerSentence.includes('excited') || lowerSentence.includes('smiled')) {
      score += 20;
      scoreBreakdown.components.emotion = 20;
    }
    if (userInfo?.name && lowerSentence.includes(userInfo.name.toLowerCase())) {
      score += 15;
      scoreBreakdown.components.characterName = 15;
    }
    
    // Setting elements
    if (lowerSentence.includes('flower') || lowerSentence.includes('tree') || lowerSentence.includes('garden') || lowerSentence.includes('park')) {
      score += 18;
      scoreBreakdown.components.setting = 18;
    }
    
    // Dialogue and interaction
    if (lowerSentence.includes('"') || lowerSentence.includes('said') || lowerSentence.includes('called') || lowerSentence.includes('asked')) {
      score += 20;
      scoreBreakdown.components.dialogue = 20;
    }

    scoreBreakdown.totalScore = score;
    sentenceScores.push(scoreBreakdown);
    
    if (score > bestScore) {
      bestScore = score;
      bestScene = sentence;
    }
  });

  console.log(`🎬 Scene extraction complete - Selected: "${bestScene}" (score: ${bestScore})`);
  
  return {
    selectedScene: bestScene,
    bestScore,
    sentences: sentences.length,
    scores: sentenceScores,
    reason: `Selected sentence with highest visual/action score (${bestScore})`
  };
}

function debugTemplateFilling(scene: string, userInfo?: any, avatarIdentity?: any, difficulty?: string) {
  console.log('🎨 DEBUGGING TEMPLATE FILLING');
  
  const template = PREMIUM_PROMPT_TEMPLATES[difficulty || 'medium'] || PREMIUM_PROMPT_TEMPLATES.medium;
  console.log(`📋 Selected Template: ${template}`);

  // CHARACTER DETECTION
  let character = userInfo?.name || 'child';
  const originalAvatarType = avatarIdentity?.type || userInfo?.avatar?.type;
  
  const mapAvatarTypeForPrompt = (type: string | undefined): string => {
    if (type === 'prefer-not-to-answer') return 'child';
    return type || 'child';
  };
  
  let genderType = mapAvatarTypeForPrompt(originalAvatarType);
  
  // AVATAR DATA ALWAYS WINS - No text-based overrides
  character = genderType;

  // AGE DETERMINATION
  const age = getAgeFromDifficulty(difficulty || 'medium');

  // CULTURAL DETECTION
  const skinTone = avatarIdentity?.skinTone || userInfo?.avatar?.skinTone || 'medium';
  const isAfricanAmerican = userInfo?.nativeLanguage === 'en' && skinTone === 'dark';
  
  let hair: string, features: string, clothing: string;
  let arraySelections: any = {};

  if (isAfricanAmerican) {
    // African American arrays for dark skin users
    features = getRandomItem(HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES);
    
    // Extract gender from descriptive character strings like 'African American girl'
    const extractedGender = extractGenderFromCharacter(genderType);
    const hairstyles = extractedGender === 'girl' ? 
      HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.girls : 
      HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.boys;
    hair = getRandomItem(hairstyles);

    arraySelections = {
      culturalPath: 'African American Arrays (Dark Skin Only)',
      hair: { selected: hair, fromArray: `HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.${extractedGender === 'girl' ? 'girls' : 'boys'}`, arraySize: hairstyles.length },
      features: { selected: features, fromArray: 'HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES', arraySize: HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES.length }
    };
  } else {
    // Use NUCLEAR_AVATAR_MAPPINGS for non-dark skin users
    const characterPrefix = genderType === 'child' ? 'neutral' : genderType;
    const mappingKey = `${characterPrefix}-${skinTone}`;
    
    // Simulate nuclear mapping (simplified for debug)
    const complexionMap: { [key: string]: string } = {
      'pale': 'attractive child character with fair pale complexion',
      'light': 'attractive child character with light complexion',
      'medium': 'attractive child character with medium complexion',
      'olive': 'attractive child character with olive complexion'
    };
    
    const hairMap: { [key: string]: string } = {
      'pale': 'red hair',
      'light': 'blonde hair',
      'medium': 'brown hair',
      'olive': 'black hair'
    };
    
    features = genderType === 'child' ? 
      `attractive gender neutral child character with ${skinTone} complexion and no recognizable gender` :
      complexionMap[skinTone] || 'attractive child character with medium complexion';
    
    hair = hairMap[skinTone] || 'brown hair';

    arraySelections = {
      culturalPath: 'NUCLEAR_AVATAR_MAPPINGS (Non-dark users)',
      mappingKey,
      hair: { selected: hair, fromMapping: 'avatarIdentity/orchestrator', inputSkinTone: skinTone },
      features: { selected: features, fromMapping: 'NUCLEAR_AVATAR_MAPPINGS', inputSkinTone: skinTone }
    };
  }

  // Conditional clothing detection
  clothing = detectClothingFromStory(scene);

  // OTHER COMPONENTS
  const setting = applyCulturalSettingEnhancement('outdoor scene', userInfo);
  const emotion = detectEmotionFromText(scene);
  const styleSettings = getStyleFrameworkSettings(difficulty || 'medium');

  // Process pageText based on difficulty
  const processedPageText = truncatePageText(scene, difficulty || 'medium');

  // FILL TEMPLATE
  let filledTemplate = template
    .replace('{character}', character)
    .replace('{age}', age)
    .replace('{hair}', hair)
    .replace('{features}', features)
    .replace('{scene}', scene)
    .replace('{setting}', setting)
    .replace('{emotion}', emotion)
      .replace('{frameworkPrompt}', styleSettings.frameworkPrompt)
    .replace('{pageText}', processedPageText)
    .replace('{objects}', '')
    .replace('{secondary_characters}', '');

  // Add clothing if detected
  if (clothing) {
    filledTemplate = filledTemplate.replace(features, `${features}, wearing ${clothing}`);
  }

  console.log(`🎨 Template filling complete`);

  return {
    template,
    placeholders: {
      character,
      age,
      hair,  
      features,
      clothing: clothing || 'none detected',
      scene,
      setting,
      emotion,
      quality: styleSettings.quality,
      suffix: styleSettings.suffix || '',
      pageText: processedPageText
    },
    arraySelections,
    culturalDetection: {
      isAfricanAmerican,
      skinTone,
      nativeLanguage: userInfo?.nativeLanguage,
      detectionLogic: `userInfo.nativeLanguage === 'en' (${userInfo?.nativeLanguage === 'en'}) && skinTone === 'dark' (${skinTone === 'dark'})`
    },
    avatarMapping: {
      originalAvatarType,
      mappedGenderType: genderType,
      mappingReason: originalAvatarType === 'prefer-not-to-answer' ? 'Mapped prefer-not-to-answer to child' : 'Direct mapping'
    },
    filledTemplate
  };
}

function detectClothingFromStory(text: string): string {
  if (!text) return '';
  
  const clothingKeywords = [
    'shirt', 'dress', 'shoes', 'hat', 'jacket', 'sweater', 'pants', 'jeans',
    'skirt', 'uniform', 'pajamas', 'coat', 'scarf', 'boots', 'sneakers',
    'hoodie', 'shorts', 'socks', 'blouse', 'tie', 'apron', 'gloves'
  ];
  
  const lowerText = text.toLowerCase();
  
  for (const keyword of clothingKeywords) {
    if (lowerText.includes(keyword)) {
      return keyword;
    }
  }
  
  return '';
}

function truncatePageText(text: string, difficulty: string): string {
  if (!text) return '';
  
  // Beginner/Easy: Use full pageText at beginning
  if (difficulty === 'beginner' || difficulty === 'easy') {
    return text;
  }
  
  // Medium/Hard/Expert: Truncate pageText for end positioning
  const maxLength = difficulty === 'medium' ? 100 : difficulty === 'hard' ? 80 : 60;
  
  if (text.length <= maxLength) {
    return text;
  }
  
  // Truncate at word boundary
  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxLength * 0.7) { // Only truncate at word if it's not too short
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
}

function debugArraySelections(userInfo?: any, avatarIdentity?: any) {
  const skinTone = avatarIdentity?.skinTone || userInfo?.avatar?.skinTone || 'medium';
  const isAfricanAmerican = userInfo?.nativeLanguage === 'en' && skinTone === 'dark';
  const genderType = avatarIdentity?.type || userInfo?.avatar?.type || 'child';

  if (isAfricanAmerican) {
    const hairstyles = genderType === 'girl' || genderType === 'woman' ? 
      HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.girls : 
      HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.boys;
    
    return {
      culturalPath: 'African American Arrays',
      arrays: {
        skinTones: {
          name: 'HARDCODED_AFRICAN_AMERICAN_SKIN_TONES',
          size: HARDCODED_AFRICAN_AMERICAN_SKIN_TONES.length,
          sample: HARDCODED_AFRICAN_AMERICAN_SKIN_TONES.slice(0, 5),
          randomSelection: getRandomItem(HARDCODED_AFRICAN_AMERICAN_SKIN_TONES)
        },
        hairstyles: {
          name: `HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.${genderType === 'girl' || genderType === 'woman' ? 'girls' : 'boys'}`,
          size: hairstyles.length,
          sample: hairstyles.slice(0, 5),
          randomSelection: getRandomItem(hairstyles)
        },
        eyeColors: {
          name: 'HARDCODED_AFRICAN_AMERICAN_EYE_COLORS',
          size: HARDCODED_AFRICAN_AMERICAN_EYE_COLORS.length,
          sample: HARDCODED_AFRICAN_AMERICAN_EYE_COLORS.slice(0, 5),
          randomSelection: getRandomItem(HARDCODED_AFRICAN_AMERICAN_EYE_COLORS)
        },
        facialFeatures: {
          name: 'HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES',
          size: HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES.length,
          sample: HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES.slice(0, 3),
          randomSelection: getRandomItem(HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES)
        },
        clothing: {
          name: 'HARDCODED_AFRICAN_AMERICAN_CLOTHING', 
          size: HARDCODED_AFRICAN_AMERICAN_CLOTHING.length,
          sample: HARDCODED_AFRICAN_AMERICAN_CLOTHING.slice(0, 5),
          randomSelection: getRandomItem(HARDCODED_AFRICAN_AMERICAN_CLOTHING)
        }
      }
    };
  } else {
    return {
      culturalPath: 'Standard Mappings',
      mappings: {
        skinMap: {
          'pale': 'fair skin',
          'light': 'light skin', 
          'medium': 'medium skin',
          'olive': 'olive skin',
          'dark': 'dark skin'
        },
        hairMap: {
          'pale': 'red hair',
          'light': 'blonde hair',
          'medium': 'brown hair', 
          'olive': 'dark brown hair',
          'dark': 'black hair'
        },
        standardValues: {
          eyes: 'bright eyes',
          features: 'friendly face',
          clothing: 'casual comfortable clothing'
        }
      },
      selectedForSkinTone: {
        skinTone,
        skin: skinTone === 'pale' ? 'fair skin' : skinTone === 'light' ? 'light skin' : skinTone === 'medium' ? 'medium skin' : skinTone === 'olive' ? 'olive skin' : 'dark skin',
        hair: skinTone === 'pale' ? 'red hair' : skinTone === 'light' ? 'blonde hair' : skinTone === 'medium' ? 'brown hair' : skinTone === 'olive' ? 'dark brown hair' : 'black hair'
      }
    };
  }
}

function debugCulturalDetection(userInfo?: any, avatarIdentity?: any) {
  const skinTone = avatarIdentity?.skinTone || userInfo?.avatar?.skinTone || 'medium';
  const nativeLanguage = userInfo?.nativeLanguage;
  const isAfricanAmerican = nativeLanguage === 'en' && skinTone === 'dark';

  return {
    inputs: {
      nativeLanguage,
      skinTone,
      avatarType: avatarIdentity?.type || userInfo?.avatar?.type
    },
    detectionLogic: {
      condition: "userInfo?.nativeLanguage === 'en' && skinTone === 'dark'",
      nativeLanguageCheck: `"${nativeLanguage}" === "en" → ${nativeLanguage === 'en'}`,
      skinToneCheck: `"${skinTone}" === "dark" → ${skinTone === 'dark'}`,
      finalResult: isAfricanAmerican
    },
    culturalPath: isAfricanAmerican ? 'African American Arrays' : 'Standard Mappings',
    settingEnhancement: applyCulturalSettingEnhancement('outdoor scene', userInfo),
    explanation: isAfricanAmerican 
      ? 'User detected as English-speaking with dark skin tone → Using comprehensive African American cultural arrays'
      : `Using standard mappings → Language: ${nativeLanguage || 'not specified'}, Skin: ${skinTone}`
  };
}

function debugDifficultyComparison(pageText: string, userInfo?: any, avatarIdentity?: any) {
  const difficulties = ['beginner', 'easy', 'medium', 'hard', 'expert'];
  const comparison: any = {};

  difficulties.forEach(difficulty => {
    const templateResult = debugTemplateFilling(pageText, userInfo, avatarIdentity, difficulty);
    const styleSettings = getStyleFrameworkSettings(difficulty);
    
    comparison[difficulty] = {
      template: PREMIUM_PROMPT_TEMPLATES[difficulty],
      age: getAgeFromDifficulty(difficulty),
      style: {
        frameworkPrompt: styleSettings.frameworkPrompt,
        styleFramework: difficulty === 'beginner' || difficulty === 'easy' || difficulty === 'medium' ? 'Contemporary Children\'s Book Illustration' : '2.9D Rendered Illustration',
        steps: styleSettings.steps,
        cfgScale: styleSettings.CFGScale,
        strength: styleSettings.strength || 0.8
      },
      finalPrompt: templateResult.filledTemplate
    };
  });

  return {
    comparisonAcrossDifficulties: comparison,
    ageProgression: {
      beginner: '5-year-old',
      easy: '7-year-old', 
      medium: '9-year-old',
      hard: '11-year-old',
      expert: '13-year-old'
    },
    styleProgression: difficulties.map(d => ({
      difficulty: d,
      styleType: d === 'beginner' || d === 'easy' ? '3D Pixar-inspired' : 
                 d === 'medium' ? 'Digital painting' :
                 d === 'hard' ? 'Professional illustration' : 'Fine art illustration'
    }))
  };
}

// Copy required functions and arrays from runware-simple-fallback
// PREMIUM PROMPT TEMPLATES BY DIFFICULTY (Enhanced with Page Text and Style Framework Integration)
const PREMIUM_PROMPT_TEMPLATES = {
  beginner: "{pageText}. {character} {age}, {hair}, {features}, {scene} in {setting}{objects}{secondary_characters}. {emotion}. {frameworkPrompt}",
  easy: "{pageText}. {character} {age}, {hair}, {features}, {scene} in {setting}{objects}{secondary_characters}. {emotion}. {frameworkPrompt}",
  medium: "{character} {age}, {hair}, {features}, {scene} in {setting}{objects}{secondary_characters}. {emotion}. {frameworkPrompt}. {pageText}",
  hard: "{character} {age}, {hair}, {features}, {scene} in {setting}{objects}{secondary_characters}. {emotion}. {frameworkPrompt}. {pageText}",
  expert: "{character} {age}, {hair}, {features}, {scene} in {setting}{objects}{secondary_characters}. {emotion}. {frameworkPrompt}. {pageText}"
};

const HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES = {
  boys: [
    'textured buzz cut', 'detailed fade cut', 'textured taper fade', 'detailed high top fade', 
    'textured low fade', 'detailed crew cut', 'textured caesar cut', 'detailed curly top fade', 
    'textured curly high fade', 'detailed curly low fade', 'textured curly taper fade', 
    'detailed curly high top', 'textured curly mohawk', 'detailed curly faux hawk', 
    'textured curly undercut', 'detailed fade with curls on top', 'textured crop', 
    'detailed curly fringe fade', 'textured twisted top fade', 'detailed undercut design'
  ],
  girls: [
    'wearing a detailed traditional afro hairstyle with natural coily hair texture, spherical volume shape, tight curl pattern definition, authentic Black hair structure, individual strand coils, dimensional texture depth, natural shine and movement',
    'wearing detailed, photorealistic separated box braids with rectangular parting, each individual braid clearly distinct, multiple separate braided sections, geometric hair sectioning, individual strand definition per braid, occasionally with colorful strands, professional box braid styling',
    'wearing detailed, photorealistic cornrows braided straight back in parallel rows, tight to scalp weaving, visible scalp parts between each row, traditional row braiding style, occasionally with colorful strands',
    'wearing detailed, defined twist-out curls with natural curl pattern, bouncy texture, individual curl definition, soft volume, natural hair movement',
    'wearing detailed afro puffs hairstyle with two symmetrical hair puffs positioned high on head, natural curly texture, rounded voluminous shape, authentic afro hair structure, defined curl clusters, bouncy texture depth',
    'well-maintained dreadlocs with natural texture, individual strand definition, mature lock formation, photorealistic hair texture',
    'wearing a natural wash-and-go curls with defined curl pattern, bouncy texture, individual curl strands, soft volume, natural movement, salon-quality finish',
    'wearing detailed, photorealistic, traditional flat twists hairstyle, neat twisting pattern, detailed texture, individual strand definition',
    'wearing detailed sleek bun with smooth edges sitting high on the head, neat hair, no loose hair, polished finish, professional styling',
    'wearing sleek relaxed ponytail with smooth edges, straight hair texture, polished finish, tight hair control, professional styling, light reflection on hair',
    'wearing detailed relaxed curved bob hairstyle with smooth inward styling, visible side part, salon shaping technique, sleek finish, dimensional movement, professional curved cutting, professional salon results'
  ]
};

const HARDCODED_AFRICAN_AMERICAN_SKIN_TONES = [
  'light brown complexion', 'medium brown skin', 'rich brown complexion', 'deep brown skin',
  'warm caramel complexion', 'golden brown skin', 'mahogany complexion', 'dark chocolate skin',
  'ebony complexion', 'honey-toned skin', 'bronze complexion', 'chestnut brown skin'
];

const HARDCODED_AFRICAN_AMERICAN_EYE_COLORS = [
  'dark brown eyes', 'deep chocolate brown eyes', 'warm brown eyes', 'amber brown eyes',
  'rich mahogany eyes', 'hazel brown eyes', 'golden brown eyes', 'coffee brown eyes'
];

const HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES = [
  // Light Tones
  "light brown skin tone with warm amber eyes, full lips, defined cheekbones, natural nose bridge",
  "caramel skin tone with deep brown eyes, soft full lips, high cheekbones, elegant nose shape",
  "honey complexion with hazel-green eyes, naturally full lips, sculpted cheekbones, refined nose",
  "warm beige skin with golden brown eyes, full expressive lips, defined facial structure, natural nose",
  "light caramel complexion with bright hazel eyes, full lips, prominent cheekbones, authentic nose shape",
  
  // Medium Tones
  "medium brown skin tone with golden amber eyes, full lips, strong cheekbones, natural nose bridge",
  "cocoa skin tone with warm honey eyes, naturally full lips, defined cheekbones, elegant nose shape",
  "warm brown complexion with bright amber eyes, full expressive lips, sculpted cheekbones, refined nose",
  "chestnut skin tone with hazel-brown eyes, full lips, prominent cheekbones, authentic nose bridge",
  "amber skin tone with deep brown eyes, soft full lips, high cheekbones, natural nose shape",
  
  // Medium-Dark Tones
  "deep brown skin tone with golden amber eyes, full lips, defined cheekbones, natural nose bridge",
  "rich chocolate complexion with warm honey eyes, naturally full lips, strong cheekbones, elegant nose",
  "mahogany skin tone with bright hazel eyes, full expressive lips, sculpted cheekbones, refined nose shape",
  "warm deep brown skin with golden brown eyes, full lips, prominent cheekbones, authentic nose bridge",
  "bronze skin tone with light amber eyes, soft full lips, high cheekbones, natural nose shape",
  
  // Dark Tones
  "dark brown skin tone with golden amber eyes, full lips, defined cheekbones, natural nose bridge",
  "ebony skin tone with warm honey eyes, naturally full lips, strong cheekbones, elegant nose shape",
  "deep mahogany complexion with bright amber eyes, full expressive lips, sculpted cheekbones, refined nose",
  "rich dark chocolate skin with golden hazel eyes, full lips, prominent cheekbones, authentic nose bridge",
  "beautiful dark brown skin with light amber eyes, soft full lips, high cheekbones, natural nose shape",
  "deep ebony skin tone with warm golden eyes, naturally full lips, defined cheekbones, elegant nose bridge",
  "dark mahogany complexion with honey-colored eyes, full expressive lips, strong cheekbones, refined nose shape",
  "rich chocolate brown skin with bright hazel eyes, full lips, sculpted cheekbones, authentic nose bridge",
  "beautiful deep brown skin with golden amber eyes, soft full lips, prominent cheekbones, natural nose shape",
  "stunning ebony complexion with warm amber eyes, naturally full lips, high cheekbones, elegant nose bridge"
];

const HARDCODED_AFRICAN_AMERICAN_CLOTHING = [
  'casual t-shirt and jeans', 'hoodie and sneakers', 'polo shirt and khakis', 
  'graphic tee and shorts', 'button-up shirt and pants', 'sweater and jeans', 
  'tank top and cargo shorts', 'flannel shirt and jeans', 'jersey and joggers'
];

function getRandomItem(array: string[]): string {
  return array[Math.floor(Math.random() * array.length)];
}

function extractGenderFromCharacter(character: string): string {
  if (!character || typeof character !== 'string') return 'child';
  const lowerChar = character.toLowerCase();
  if (lowerChar.includes('girl')) return 'girl';
  if (lowerChar.includes('boy')) return 'boy';
  return 'child';
}

function getAgeFromDifficulty(difficulty: string): string {
  const ageMapping: { [key: string]: string } = {
    'beginner': '5-year-old',
    'easy': '7-year-old', 
    'medium': '9-year-old',
    'hard': '11-year-old',
    'expert': '13-year-old'
  };
  return ageMapping[difficulty] || '7-year-old';
}

// Style framework settings matching main function
function getStyleFrameworkSettings(difficulty: string): { frameworkPrompt: string, steps: number, CFGScale: number } {
  // Map difficulties to style frameworks - levels 0-2 use Contemporary, levels 3-4 use 2.9D
  const frameworkMap = {
    'beginner': 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality, warm natural lighting',
    'easy': 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality, warm natural lighting',
    'medium': 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality, warm natural lighting',
    'hard': '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation, warm natural lighting',
    'expert': '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation, warm natural lighting'
  };
  
  return {
    frameworkPrompt: frameworkMap[difficulty] || frameworkMap.medium,
    steps: 30, // FIXED: Enhanced from 25 for better quality
    CFGScale: 10 // FIXED: Enhanced from 8 for better adherence
  };
}

function applyCulturalSettingEnhancement(baseSetting: string, userInfo?: any): string {
  if (userInfo?.nativeLanguage === 'en' || !userInfo?.nativeLanguage) {
    const isAfricanAmericanUser = userInfo?.avatar?.skinTone === 'dark' || Math.random() < 0.25;
    
    if (isAfricanAmericanUser) {
      const culturalElements = [
        'with authentic African American community elements',
        'in a diverse urban neighborhood setting', 
        'with rich cultural community atmosphere'
      ];
      const element = culturalElements[Math.floor(Math.random() * culturalElements.length)];
      return `${baseSetting} ${element}`;
    }
    
    return `${baseSetting} scene`;
  } else {
    const language = userInfo?.nativeLanguage || 'international';
    return `${baseSetting} with ${language} cultural elements`;
  }
}

function detectEmotionFromText(text: string): string {
  const emotions: { [key: string]: string[] } = {
    happy: ['happy', 'smiled', 'laughed', 'giggled', 'cheerful', 'joy', 'excited', 'delighted'],
    excited: ['excited', 'thrilled', 'amazed', 'wonderful', 'incredible', 'fantastic'],
    peaceful: ['calm', 'peaceful', 'quiet', 'gentle', 'serene', 'relaxed']
  };
  
  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      const contextMap: { [key: string]: string } = {
        happy: 'cheerful and joyful atmosphere',
        excited: 'energetic and thrilling atmosphere',
        peaceful: 'calm and serene environment'
      };
      return contextMap[emotion] || 'positive atmosphere';
    }
  }
  
  return 'warm and engaging atmosphere';
}
