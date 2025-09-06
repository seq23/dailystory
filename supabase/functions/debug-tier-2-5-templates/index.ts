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
  
  let skin: string, hair: string, eyes: string, features: string, clothing: string;
  let arraySelections: any = {};

  if (isAfricanAmerican) {
    // African American arrays
    skin = getRandomItem(HARDCODED_AFRICAN_AMERICAN_SKIN_TONES);
    eyes = getRandomItem(HARDCODED_AFRICAN_AMERICAN_EYE_COLORS);
    features = getRandomItem(HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES);
    clothing = getRandomItem(HARDCODED_AFRICAN_AMERICAN_CLOTHING);
    
    // Extract gender from descriptive character strings like 'African American girl'
    const extractedGender = extractGenderFromCharacter(genderType);
    const hairstyles = extractedGender === 'girl' ? 
      HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.girls : 
      HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.boys;
    hair = getRandomItem(hairstyles);

    arraySelections = {
      culturalPath: 'African American Arrays',
      skin: { selected: skin, fromArray: 'HARDCODED_AFRICAN_AMERICAN_SKIN_TONES', arraySize: HARDCODED_AFRICAN_AMERICAN_SKIN_TONES.length },
      hair: { selected: hair, fromArray: `HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.${extractedGender === 'girl' ? 'girls' : 'boys'}`, arraySize: hairstyles.length },
      eyes: { selected: eyes, fromArray: 'HARDCODED_AFRICAN_AMERICAN_EYE_COLORS', arraySize: HARDCODED_AFRICAN_AMERICAN_EYE_COLORS.length },
      features: { selected: features, fromArray: 'HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES', arraySize: HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES.length },
      clothing: { selected: clothing, fromArray: 'HARDCODED_AFRICAN_AMERICAN_CLOTHING', arraySize: HARDCODED_AFRICAN_AMERICAN_CLOTHING.length }
    };
  } else {
    // Standard mappings
    const skinMap: { [key: string]: string } = {
      'pale': 'fair skin',
      'light': 'light skin', 
      'medium': 'medium skin',
      'olive': 'olive skin',
      'dark': 'dark skin'
    };
    
    const hairMap: { [key: string]: string } = {
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

    arraySelections = {
      culturalPath: 'Standard Mappings',
      skin: { selected: skin, fromMapping: 'skinMap', inputSkinTone: skinTone },
      hair: { selected: hair, fromMapping: 'hairMap', inputSkinTone: skinTone },
      eyes: { selected: eyes, fromMapping: 'standard' },
      features: { selected: features, fromMapping: 'standard' },
      clothing: { selected: clothing, fromMapping: 'standard' }
    };
  }

  // OTHER COMPONENTS
  const setting = applyCulturalSettingEnhancement('outdoor scene', userInfo);
  const emotion = detectEmotionFromText(scene);
  const style = getHardcodedStyle(difficulty || 'medium');

  // FILL TEMPLATE
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
    .replace('{emotion}', emotion)
    .replace('{quality}', style.quality)
    .replace('{suffix}', style.suffix || '');

  console.log(`🎨 Template filling complete`);

  return {
    template,
    placeholders: {
      character,
      age,
      skin,
      hair,
      eyes,  
      features,
      clothing,
      scene,
      setting,
      emotion,
      quality: style.quality,
      suffix: style.suffix || ''
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
    const style = getHardcodedStyle(difficulty);
    
    comparison[difficulty] = {
      template: PREMIUM_PROMPT_TEMPLATES[difficulty],
      age: getAgeFromDifficulty(difficulty),
      style: {
        quality: style.quality,
        suffix: style.suffix,
        steps: style.steps,
        cfgScale: style.cfgScale,
        strength: style.strength
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
const PREMIUM_PROMPT_TEMPLATES = {
  beginner: "{character} {age}, {skin}, {hair}, {eyes}, {features}, wearing {clothing}, {scene} in {setting}. {emotion}. {quality}",
  easy: "{character} {age}, {skin}, {hair}, {eyes}, {features}, wearing {clothing}, {scene} in {setting}. {emotion}. {quality}",
  medium: "{character} {age}, {skin}, {hair}, {eyes}, {features}, wearing {clothing}, {scene} in {setting}. {emotion}. {quality}. {suffix}",
  hard: "{character} {age}, {skin}, {hair}, {eyes}, {features}, wearing {clothing}, {scene} in {setting}. {emotion}. {quality}. {suffix}",
  expert: "{character} {age}, {skin}, {hair}, {eyes}, {features}, wearing {clothing}, {scene} in {setting}. {emotion}. {quality}. {suffix}"
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
  'expressive almond-shaped eyes', 'bright wide-set eyes', 'sparkling round eyes', 'gentle oval-shaped eyes',
  'striking large eyes', 'warm smiling eyes', 'intelligent alert eyes', 'kind gentle eyes',
  'full natural lips', 'warm smiling lips', 'gentle curved lips', 'expressive full lips'
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

function getHardcodedStyle(difficulty: string) {
  const styles: { [key: string]: any } = {
    'beginner': {
      quality: 'High-quality 3D animated character illustration for early readers',
      suffix: '3D animated style, Pixar-quality rendering, child-friendly design',
      steps: 15,
      cfgScale: 7.0,
      strength: 0.75
    },
    'easy': {
      quality: 'High-quality 3D animated character illustration for early readers',
      suffix: '3D animated style, Pixar-quality rendering, child-friendly design',
      steps: 15,
      cfgScale: 7.0,
      strength: 0.75
    },
    'medium': {
      quality: 'ultra professional digital illustration standard, high quality professional artwork',
      suffix: 'Digital illustration with painterly qualities, soft brush strokes, rich textures and depth',
      steps: 19,
      cfgScale: 7.5,
      strength: 0.8
    },
    'hard': {
      quality: 'Gallery-quality digital illustration with sophisticated artistic maturity',
      suffix: 'professional digital illustration, sophisticated artistic maturity, refined visual storytelling',
      steps: 20,
      cfgScale: 8.0,
      strength: 0.85
    },
    'expert': {
      quality: 'Museum-quality fine art digital illustration with masterful artistic sophistication',
      suffix: 'fine art digital illustration, masterful artistic sophistication, cinematic visual narrative',
      steps: 25,
      cfgScale: 8.5,
      strength: 0.9
    }
  };
  
  return styles[difficulty] || styles['medium'];
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
