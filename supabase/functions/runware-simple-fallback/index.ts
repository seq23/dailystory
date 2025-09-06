// ============= TIER 2.5 NUCLEAR INDEPENDENCE - ZERO EXTERNAL DEPENDENCIES =============
// This edge function is completely self-contained with no external imports

// Nuclear Independent CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Nuclear Independent CORS Response Functions  
function createCorsResponse(data: any, status = 200): Response {
  const headers = { 
    ...corsHeaders, 
    'Content-Type': 'application/json' 
  };
  return new Response(JSON.stringify(data), { status, headers });
}

function createCorsErrorResponse(error: string | Error, status = 500): Response {
  const errorMessage = error instanceof Error ? error.message : error;
  console.error('Edge function error:', errorMessage);
  return createCorsResponse({ 
    success: false, 
    error: errorMessage 
  }, status);
}

function createCorsOptionsResponse(): Response {
  return new Response(null, { headers: corsHeaders });
}

// ============= TIER 2.5 NUCLEAR INDEPENDENCE - ALL CONSTANTS FIRST =============

// PREMIUM PROMPT TEMPLATES BY DIFFICULTY (Enhanced with Page Text and Objects & Secondary Characters)
const PREMIUM_PROMPT_TEMPLATES = {
  beginner: "{pageText}. {character} {age}, {skin}, {hair}, {features}, wearing {clothing}, {scene} in {setting}{objects}{secondary_characters}. {emotion}. {quality}",
  easy: "{pageText}. {character} {age}, {skin}, {hair}, {features}, wearing {clothing}, {scene} in {setting}{objects}{secondary_characters}. {emotion}. {quality}",
  medium: "{pageText}. {character} {age}, {skin}, {hair}, {features}, wearing {clothing}, {scene} in {setting}{objects}{secondary_characters}. {emotion}. {quality}. {suffix}",
  hard: "{pageText}. {character} {age}, {skin}, {hair}, {features}, wearing {clothing}, {scene} in {setting}{objects}{secondary_characters}. {emotion}. {quality}. {suffix}",
  expert: "{pageText}. {character} {age}, {skin}, {hair}, {features}, wearing {clothing}, {scene} in {setting}{objects}{secondary_characters}. {emotion}. {quality}. {suffix}"
};

// AFRICAN AMERICAN ARRAYS (Nuclear Independence)
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
  'rich dark chocolate complexion', 'warm deep brown skin', 'rich mahogany complexion', 
  'beautiful dark ebony skin tone', 'warm caramel brown complexion', 'deep cocoa skin', 
  'rich chestnut brown complexion', 'warm coffee-colored skin', 'beautiful bronze complexion', 
  'deep amber brown skin tone', 'rich mocha complexion', 'warm honey brown skin', 
  'beautiful dark copper complexion', 'deep golden brown skin', 'rich terra cotta complexion', 
  'warm russet brown skin tone', 'beautiful sienna complexion', 'deep burnt umber skin', 
  'rich dark oak complexion', 'warm dark maple skin tone'
];

const HARDCODED_AFRICAN_AMERICAN_EYE_COLORS = [
  'warm dark chocolate eyes', 'deep rich brown eyes', 'beautiful dark amber eyes', 
  'warm coffee brown eyes', 'deep mahogany eyes', 'rich cocoa brown eyes', 'warm honey brown eyes', 
  'beautiful chestnut brown eyes', 'deep mocha eyes', 'warm bronze brown eyes', 
  'rich dark hazel eyes', 'beautiful golden brown eyes', 'deep caramel eyes', 
  'warm toffee brown eyes', 'rich dark copper eyes'
];

const HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES = [
  'beautiful expressive dark eyes and warm genuine smile', 'strong confident features with bright cheerful expression',
  'graceful facial structure with kind welcoming demeanor', 'striking natural beauty with joyful animated expression',
  'elegant bone structure with warm inviting smile', 'radiant complexion with bright engaging eyes',
  'natural confident bearing with gentle friendly expression', 'beautiful authentic features with lively cheerful demeanor',
  'strong dignified presence with warm genuine smile', 'graceful natural beauty with bright expressive eyes',
  'confident friendly features with welcoming joyful expression', 'striking elegant appearance with kind animated smile',
  'beautiful natural confidence with warm engaging demeanor', 'radiant authentic beauty with bright cheerful expression',
  'gentle strong features with kind welcoming smile'
];

const HARDCODED_AFRICAN_AMERICAN_CLOTHING = [
  'vibrant colorful casual wear', 'stylish modern youth clothing', 'trendy cultural fashion', 
  'bright patterned shirt and comfortable pants', 'colorful hoodie and jeans', 'modern streetwear style', 
  'fashionable casual outfit', 'contemporary youth fashion', 'stylish comfortable clothing', 
  'trendy modern casual wear', 'vibrant youth streetwear', 'fashionable everyday outfit'
];

// HISPANIC/LATINO ARRAYS
const HARDCODED_HISPANIC_LATINO_HAIRSTYLES = {
  boys: [
    'dark brown wavy hair', 'straight black hair with side part', 'textured curly brown hair',
    'medium length dark hair', 'classic short brown cut', 'layered dark hair', 'wavy textured cut',
    'straight black hair with fringe', 'curly dark brown locks', 'smooth dark hair style',
    'textured brown waves', 'neat dark hair cut', 'casual wavy style', 'classic Latino haircut'
  ],
  girls: [
    'long straight black hair', 'dark brown wavy hair', 'curly black hair in ponytail',
    'straight dark hair with bangs', 'wavy brown hair in braids', 'long black hair in loose curls',
    'shoulder-length dark waves', 'straight black hair with layers', 'curly dark brown hair',
    'braided dark hair style', 'long straight dark hair', 'wavy black hair', 'textured brown curls'
  ]
};

const HARDCODED_HISPANIC_LATINO_SKIN_TONES = [
  'warm olive complexion', 'medium brown skin', 'golden tan complexion', 'warm beige skin',
  'caramel brown complexion', 'light olive skin', 'bronze complexion', 'honey-toned skin',
  'warm medium skin', 'golden brown complexion', 'sun-kissed olive skin', 'rich tan complexion'
];

const HARDCODED_HISPANIC_LATINO_EYE_COLORS = [
  'warm brown eyes', 'dark chocolate eyes', 'rich brown eyes', 'amber brown eyes',
  'deep brown eyes', 'golden brown eyes', 'warm hazel eyes', 'coffee brown eyes'
];

const HARDCODED_HISPANIC_LATINO_FACIAL_FEATURES = [
  'expressive warm brown eyes', 'bright cheerful smile', 'strong defined features',
  'warm welcoming expression', 'lively animated eyes', 'gentle kind smile',
  'beautiful natural features', 'confident friendly demeanor', 'radiant warm smile'
];

const HARDCODED_HISPANIC_LATINO_CLOTHING = [
  'colorful casual wear', 'bright patterned shirt', 'festive colorful clothing',
  'traditional-inspired modern outfit', 'vibrant casual attire', 'warm-toned clothing'
];

// CHINESE/ASIAN ARRAYS
const HARDCODED_CHINESE_ASIAN_HAIRSTYLES = {
  boys: [
    'straight black hair with neat cut', 'classic short black hair', 'straight dark hair with fringe',
    'layered black hair', 'neat straight hair style', 'short black hair with side part',
    'straight textured black hair', 'classic Asian boy haircut', 'neat dark hair cut'
  ],
  girls: [
    'straight black hair in bob cut', 'long straight black hair', 'straight dark hair with bangs',
    'neat black hair in ponytail', 'straight black hair with layers', 'classic straight black hair',
    'long straight dark hair', 'neat black hair style', 'straight hair with side bangs'
  ]
};

const HARDCODED_CHINESE_ASIAN_SKIN_TONES = [
  'light golden complexion', 'warm pale skin', 'golden beige complexion', 'light Asian skin tone',
  'warm ivory complexion', 'golden light skin', 'soft golden complexion', 'warm light skin'
];

const HARDCODED_CHINESE_ASIAN_EYE_COLORS = [
  'dark brown eyes', 'deep black eyes', 'warm dark eyes', 'rich brown eyes'
];

const HARDCODED_CHINESE_ASIAN_FACIAL_FEATURES = [
  'almond-shaped dark eyes', 'delicate refined features', 'bright intelligent eyes',
  'gentle kind expression', 'graceful facial features', 'warm friendly smile',
  'beautiful natural Asian features', 'expressive dark eyes', 'serene gentle expression'
];

const HARDCODED_CHINESE_ASIAN_CLOTHING = [
  'modern casual wear', 'neat school attire', 'traditional-inspired modern clothing',
  'clean simple outfit', 'contemporary casual style', 'comfortable modern wear'
];

// MIDDLE EASTERN ARRAYS
const HARDCODED_MIDDLE_EASTERN_HAIRSTYLES = {
  boys: [
    'dark brown wavy hair', 'black curly hair', 'thick dark hair', 'wavy brown locks',
    'curly black hair style', 'textured dark brown hair', 'wavy medium-length hair',
    'thick wavy dark hair', 'curly brown hair cut', 'natural wavy black hair'
  ],
  girls: [
    'long dark brown hair', 'thick black wavy hair', 'curly dark hair', 'long straight black hair',
    'wavy brown hair in braids', 'thick dark hair in ponytail', 'curly black locks',
    'long wavy dark hair', 'straight thick black hair', 'natural curly dark hair'
  ]
};

const HARDCODED_MIDDLE_EASTERN_SKIN_TONES = [
  'warm olive complexion', 'golden brown skin', 'medium olive skin', 'bronze complexion',
  'warm tan complexion', 'rich olive skin', 'golden olive complexion', 'warm medium brown skin'
];

const HARDCODED_MIDDLE_EASTERN_EYE_COLORS = [
  'dark brown eyes', 'warm hazel eyes', 'deep brown eyes', 'rich amber eyes',
  'striking dark eyes', 'warm brown eyes', 'deep hazel eyes', 'beautiful dark eyes'
];

const HARDCODED_MIDDLE_EASTERN_FACIAL_FEATURES = [
  'striking expressive eyes', 'strong defined features', 'warm welcoming expression',
  'beautiful olive complexion', 'confident friendly demeanor', 'graceful facial structure',
  'expressive dark eyes', 'noble dignified features', 'warm genuine smile'
];

const HARDCODED_MIDDLE_EASTERN_CLOTHING = [
  'traditional-inspired modern wear', 'elegant casual clothing', 'cultural pattern accents',
  'modest fashionable attire', 'contemporary cultural style', 'warm-toned clothing'
];

// STANDARD AMERICAN ARRAYS (Hair array removed - AI handles generation)

const HARDCODED_STANDARD_AMERICAN_SKIN_TONES = [
  'fair light complexion', 'warm light skin', 'peachy fair skin', 'light rosy complexion',
  'pale golden skin', 'creamy light skin', 'fair pink-toned skin', 'light neutral complexion'
];

const HARDCODED_STANDARD_AMERICAN_EYE_COLORS = [
  'bright blue eyes', 'warm green eyes', 'hazel eyes', 'light brown eyes',
  'sparkling blue eyes', 'emerald green eyes', 'golden hazel eyes', 'deep blue eyes'
];

const HARDCODED_STANDARD_AMERICAN_FACIAL_FEATURES = [
  'bright sparkling eyes', 'cheerful friendly smile', 'freckled nose and rosy cheeks',
  'expressive animated eyes', 'warm genuine smile', 'lively enthusiastic expression',
  'kind gentle demeanor', 'confident bright smile', 'playful mischievous grin'
];

const HARDCODED_STANDARD_AMERICAN_CLOTHING = [
  'casual t-shirt and jeans', 'hoodie and sneakers', 'button-up shirt and khakis', 
  'sweater and comfortable pants', 'polo shirt and shorts', 'flannel shirt and jeans',
  'graphic tee and cargo shorts', 'pullover and joggers', 'camp shirt and chinos',
  'tank top and denim shorts', 'long sleeve tee and leggings', 'sundress and sandals',
  'blouse and skirt', 'cardigan and dress', 'tunic and leggings', 'romper and flats',
  'striped shirt and overalls', 'peasant top and jeans', 'wrap dress and boots',
  'knit top and wide leg pants', 'denim jacket and dress', 'crop top and high waisted jeans',
  'oversized sweater and skinny jeans', 'off shoulder top and midi skirt', 'blazer and trousers',
  'band tee and ripped jeans', 'vintage inspired outfit', 'bohemian style clothing',
  'preppy casual wear', 'athletic wear and running shoes', 'cozy knit sweater and boots',
  'plaid shirt and dark jeans', 'solid color tee and cargo pants', 'striped long sleeve and shorts',
  'fleece jacket and sweatpants', 'henley shirt and khaki shorts', 'crew neck sweatshirt and jeans',
  'v-neck tee and chino pants', 'quarter zip pullover and joggers', 'pocket tee and denim',
  'thermal shirt and canvas pants', 'rugby shirt and twill shorts', 'mock turtleneck and corduroys',
  'flannel pajama set', 'terry cloth robe and slippers', 'cotton nightgown', 'silk pajamas',
  'jersey knit pajamas', 'plaid flannel pajama pants', 'soft cotton sleepwear', 'cozy night clothes',
  'denim jacket and jeans', 'cardigan and slacks', 'henley shirt and chinos', 
  'baseball cap and casual wear', 'sneakers and athletic socks', 'backpack and school clothes', 
  'comfortable everyday outfit', 'playground-appropriate clothing', 'weekend casual wear', 
  'school uniform alternatives', 'athletic wear and running shoes', 'layered casual look', 
  'seasonal appropriate clothing', 'comfortable playtime outfit', 'trendy youth fashion', 
  'classic American casual style', 'modern comfortable clothing', 'age-appropriate fashion'
];

// ============= NUCLEAR INDEPENDENT CORE FUNCTIONS =============

// NUCLEAR HARDCODED AVATAR MAPPINGS (15 combinations: 3 types × 5 skin tones)
const NUCLEAR_AVATAR_MAPPINGS = {
  // BOY MAPPINGS
  'boy-pale': {
    character: 'boy',
    age: '6-year-old',
    skin: 'fair light complexion',
    hair: 'red hair',
    features: 'bright sparkling eyes and cheerful friendly smile',
    clothing: 'casual t-shirt and jeans'
  },
  'boy-light': {
    character: 'boy', 
    age: '6-year-old',
    skin: 'warm light skin',
    hair: 'blonde hair', 
    features: 'expressive animated eyes and warm genuine smile',
    clothing: 'hoodie and sneakers'
  },
  'boy-medium': {
    character: 'boy',
    age: '6-year-old', 
    skin: 'golden tan complexion',
    hair: 'brown hair',
    features: 'expressive warm brown eyes and bright cheerful smile',
    clothing: 'colorful casual wear'
  },
  'boy-olive': {
    character: 'boy',
    age: '6-year-old',
    skin: 'warm olive complexion', 
    hair: 'black hair',
    features: 'striking expressive eyes and warm welcoming expression',
    clothing: 'traditional-inspired modern wear'
  },
  'boy-dark': {
    character: 'African American boy',
    age: '6-year-old',
    skin: 'rich dark chocolate complexion',
    hair: 'textured hair',
    eyes: 'warm dark chocolate eyes', 
    features: 'beautiful expressive dark eyes and warm genuine smile',
    clothing: 'vibrant colorful casual wear'
  },

  // GIRL MAPPINGS  
  'girl-pale': {
    character: 'girl',
    age: '6-year-old',
    skin: 'fair light complexion',
    hair: 'red hair',
    features: 'bright sparkling eyes and cheerful friendly smile',
    clothing: 'sundress and sandals'
  },
  'girl-light': {
    character: 'girl',
    age: '6-year-old', 
    skin: 'warm light skin',
    hair: 'blonde hair',
    features: 'lively enthusiastic expression and kind gentle demeanor', 
    clothing: 'blouse and skirt'
  },
  'girl-medium': {
    character: 'girl',
    age: '6-year-old',
    skin: 'golden tan complexion', 
    hair: 'brown hair',
    features: 'warm welcoming expression and lively animated eyes',
    clothing: 'colorful casual wear'
  },
  'girl-olive': {
    character: 'girl', 
    age: '6-year-old',
    skin: 'warm olive complexion',
    hair: 'black hair',
    features: 'beautiful olive complexion and confident friendly demeanor',
    clothing: 'elegant casual clothing'
  },
  'girl-dark': {
    character: 'African American girl',
    age: '6-year-old',
    skin: 'rich dark chocolate complexion',
    hair: 'textured hair', 
    eyes: 'warm dark chocolate eyes',
    features: 'beautiful expressive dark eyes and warm genuine smile',
    clothing: 'vibrant colorful casual wear'
  },

  // GENDER-NEUTRAL MAPPINGS (for prefer-not-to-answer)
  'neutral-pale': {
    character: 'child with gender neutral characteristics',
    age: '6-year-old',
    skin: 'fair light complexion', 
    hair: 'red hair',
    features: 'friendly welcoming expression and gentle smile',
    clothing: 'comfortable casual wear'
  },
  'neutral-light': {
    character: 'child with gender neutral characteristics',
    age: '6-year-old',
    skin: 'warm light skin',
    hair: 'blonde hair',
    features: 'kind gentle expression and bright smile',
    clothing: 'simple comfortable outfit'
  },
  'neutral-medium': {
    character: 'child with gender neutral characteristics',
    age: '6-year-old',
    skin: 'golden tan complexion',
    hair: 'brown hair',
    features: 'cheerful friendly expression and welcoming smile', 
    clothing: 'casual everyday wear'
  },
  'neutral-olive': {
    character: 'child with gender neutral characteristics', 
    age: '6-year-old',
    skin: 'warm olive complexion',
    hair: 'black hair',
    features: 'warm welcoming expression and gentle demeanor',
    clothing: 'comfortable modern clothing'
  },
  'neutral-dark': {
    character: 'African American child with gender neutral characteristics',
    age: '6-year-old', 
    skin: 'rich dark complexion',
    hair: 'textured hair',
    eyes: 'warm dark eyes',
    features: 'beautiful expressive eyes and genuine smile',
    clothing: 'colorful comfortable wear'
  }
};

// NUCLEAR AVATAR MAPPING FUNCTION
function getNuclearAvatarMapping(userInfo: any, difficulty: string): any {
  try {
    console.log('🛡️ Tier 2.5: Nuclear avatar mapping started');
    
    // Get avatar type - fix the critical bug here
    let avatarType = userInfo?.avatar?.type || 'prefer-not-to-answer';
    const avatarSkinTone = userInfo?.avatar?.skinTone || 'light';
    
    console.log(`🛡️ Tier 2.5: Avatar data - Type: ${avatarType}, SkinTone: ${avatarSkinTone}`);
    
    // Handle missing avatar data - default to gender-neutral
    if (!userInfo?.avatar?.type) {
      console.log('🛡️ Tier 2.5: No avatar type found, defaulting to gender-neutral');
      avatarType = 'prefer-not-to-answer';
    }
    
    // Map avatar type to character prefix
    let characterPrefix;
    if (avatarType === 'prefer-not-to-answer') {
      characterPrefix = 'neutral';
    } else {
      characterPrefix = avatarType; // 'boy' or 'girl'  
    }
    
    // Create mapping key
    const mappingKey = `${characterPrefix}-${avatarSkinTone}`;
    console.log(`🛡️ Tier 2.5: Nuclear mapping key: ${mappingKey}`);
    
    // Get the nuclear mapping
    const avatarMapping = NUCLEAR_AVATAR_MAPPINGS[mappingKey];
    
    if (!avatarMapping) {
      console.warn(`⚠️ Tier 2.5: No mapping found for ${mappingKey}, using fallback`);
      // Ultimate fallback - boy-light
      return NUCLEAR_AVATAR_MAPPINGS['boy-light'];
    }
    
    // Adjust age based on difficulty
    const ageMapping = {
      'beginner': '3-year-old',
      'easy': '5-year-old', 
      'medium': '7-year-old',
      'hard': '9-year-old',
      'expert': '11-year-old'
    };
    
    const finalMapping = {
      ...avatarMapping,
      age: ageMapping[difficulty] || avatarMapping.age
    };
    
    console.log(`✅ Tier 2.5: Nuclear mapping successful for ${mappingKey}`);
    return finalMapping;
    
  } catch (error) {
    console.error('❌ Tier 2.5: Nuclear avatar mapping error:', error);
    // Ultimate failsafe
    return NUCLEAR_AVATAR_MAPPINGS['boy-light'];
  }
}

function mapDifficultyInline(userInfo?: any, fallbackLevel: string = 'medium'): string {
  try {
    const rawLevel = userInfo?.readingLevel || userInfo?.difficultyLevel || userInfo?.gradeLevel;
    const validLevels = ['beginner', 'easy', 'medium', 'hard', 'expert'];
    
    if (rawLevel && validLevels.includes(rawLevel)) {
      console.log(`🛡️ Tier 2.5: Direct level mapping: ${rawLevel}`);
      return rawLevel;
    }
    
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
    
    if (userInfo?.age) {
      const age = parseInt(userInfo.age);
      if (age <= 5) return 'beginner';
      if (age <= 7) return 'easy';
      if (age <= 10) return 'medium';
      if (age <= 13) return 'hard';
      return 'expert';
    }
    
    console.log(`🛡️ Tier 2.5: Using fallback level: ${fallbackLevel}`);
    return fallbackLevel;
    
  } catch (error) {
    console.warn(`⚠️ Tier 2.5: Difficulty mapping error (using fallback): ${error}`);
    return fallbackLevel;
  }
}

function extractSceneWithPremiumTemplate(pageText: string): { scene: string, setting: string, objects: string, secondary_characters: string } {
  try {
    if (!pageText || typeof pageText !== 'string') {
      console.log('🛡️ Tier 2.5: No pageText provided, using fallback scene');
      return {
        scene: 'sitting and reading happily',
        setting: ' a cozy library',
        objects: '',
        secondary_characters: ''
      };
    }

    const sentences = pageText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    if (sentences.length === 0) {
      console.log('🛡️ Tier 2.5: No valid sentences found, using fallback');
      return {
        scene: 'exploring and learning',
        setting: ' a bright classroom',
        objects: '',
        secondary_characters: ''
      };
    }

    // Score sentences for visual richness
    let bestSentence = sentences[0];
    let bestScore = 0;

    for (const sentence of sentences) {
      let score = 0;
      const lowerSentence = sentence.toLowerCase();
      
      // Action words
      const actionWords = ['running', 'jumping', 'playing', 'reading', 'writing', 'drawing', 'building', 'exploring', 'discovering', 'learning', 'creating', 'making', 'walking', 'sitting', 'standing', 'dancing', 'singing', 'laughing', 'smiling'];
      actionWords.forEach(word => {
        if (lowerSentence.includes(word)) score += 2;
      });
      
      // Setting words
      const settingWords = ['park', 'school', 'home', 'garden', 'playground', 'library', 'classroom', 'kitchen', 'bedroom', 'backyard', 'forest', 'beach', 'mountain', 'city', 'street', 'house', 'room', 'outside', 'inside'];
      settingWords.forEach(word => {
        if (lowerSentence.includes(word)) score += 3;
      });
      
      // Object words
      const objectWords = ['book', 'toy', 'ball', 'bike', 'swing', 'slide', 'tree', 'flower', 'car', 'truck', 'doll', 'game', 'puzzle', 'blocks', 'crayon', 'paper', 'pencil', 'computer', 'tablet', 'phone'];
      objectWords.forEach(word => {
        if (lowerSentence.includes(word)) score += 1;
      });
      
      if (score > bestScore) {
        bestScore = score;
        bestSentence = sentence;
      }
    }

    // Extract components from best sentence
    const result = {
      scene: extractActionFromSentence(bestSentence),
      setting: extractSettingFromSentence(bestSentence),
      objects: extractObjectsFromSentence(bestSentence),
      secondary_characters: extractSecondaryCharactersFromSentence(bestSentence)
    };

    console.log('🛡️ Tier 2.5: Scene extraction complete:', result);
    return result;

  } catch (error) {
    console.warn('⚠️ Tier 2.5: Scene extraction error, using fallback:', error);
    return {
      scene: 'reading and learning',
      setting: ' a peaceful study area',
      objects: '',
      secondary_characters: ''
    };
  }
}

function extractActionFromSentence(sentence: string): string {
  const lowerSentence = sentence.toLowerCase();
  const actionMappings = {
    'running': 'running joyfully', 'jumping': 'jumping energetically', 'playing': 'playing happily',
    'reading': 'reading attentively', 'writing': 'writing carefully', 'drawing': 'drawing creatively',
    'building': 'building imaginatively', 'exploring': 'exploring curiously', 'discovering': 'discovering excitedly',
    'learning': 'learning eagerly', 'creating': 'creating artistically', 'making': 'making thoughtfully',
    'walking': 'walking confidently', 'sitting': 'sitting comfortably', 'standing': 'standing proudly',
    'dancing': 'dancing gracefully', 'singing': 'singing joyfully', 'laughing': 'laughing cheerfully',
    'smiling': 'smiling warmly'
  };
  
  for (const [action, description] of Object.entries(actionMappings)) {
    if (lowerSentence.includes(action)) {
      return description;
    }
  }
  
  return 'engaging in activities';
}

function extractSettingFromSentence(sentence: string): string {
  const lowerSentence = sentence.toLowerCase();
  const settingMappings = {
    'park': ' a vibrant community park', 'school': ' a bright modern school', 'home': ' a cozy comfortable home',
    'garden': ' a beautiful blooming garden', 'playground': ' a fun colorful playground', 'library': ' a quiet peaceful library',
    'classroom': ' a bright engaging classroom', 'kitchen': ' a warm inviting kitchen', 'bedroom': ' a comfortable personal bedroom',
    'backyard': ' a spacious family backyard', 'forest': ' a magical green forest', 'beach': ' a sunny sandy beach',
    'mountain': ' a majestic mountain landscape', 'city': ' a bustling vibrant city', 'street': ' a friendly neighborhood street',
    'house': ' a welcoming family house', 'room': ' a cozy indoor room', 'outside': ' a beautiful outdoor setting',
    'inside': ' a comfortable indoor space'
  };
  
  for (const [setting, description] of Object.entries(settingMappings)) {
    if (lowerSentence.includes(setting)) {
      return description;
    }
  }
  
  return ' a wonderful learning environment';
}

function extractObjectsFromSentence(sentence: string): string {
  const lowerSentence = sentence.toLowerCase();
  const objectMappings = {
    'book': ', with colorful educational books nearby', 'toy': ', with fun educational toys around',
    'ball': ', with a bright colorful ball', 'bike': ', with a shiny bicycle nearby',
    'swing': ', near playground swings', 'slide': ', by a colorful playground slide',
    'tree': ', under beautiful shade trees', 'flower': ', surrounded by blooming flowers',
    'car': ', near toy cars and vehicles', 'truck': ', with toy trucks and construction vehicles',
    'doll': ', with favorite dolls and stuffed animals', 'game': ', with educational games and activities',
    'puzzle': ', with colorful learning puzzles', 'blocks': ', with building blocks and construction toys',
    'crayon': ', with bright crayons and art supplies', 'paper': ', with drawing paper and notebooks',
    'pencil': ', with colorful pencils and writing tools', 'computer': ', with educational technology',
    'tablet': ', with learning apps and digital tools', 'phone': ', with communication devices'
  };
  
  for (const [object, description] of Object.entries(objectMappings)) {
    if (lowerSentence.includes(object)) {
      return description;
    }
  }
  
  return '';
}

function extractSecondaryCharactersFromSentence(sentence: string): string {
  const lowerSentence = sentence.toLowerCase();
  const characterMappings = {
    'friend': ', with friendly classmates nearby', 'friends': ', with cheerful friends playing together',
    'teacher': ', with a kind helpful teacher', 'parent': ', with a loving supportive parent',
    'mom': ', with a caring mother', 'dad': ', with a supportive father',
    'sister': ', with a playful sister', 'brother': ', with an energetic brother',
    'family': ', with loving family members', 'classmate': ', with happy classmates',
    'student': ', with fellow students learning together', 'children': ', with other joyful children',
    'kids': ', with other excited kids playing', 'people': ', with friendly community members'
  };
  
  for (const [character, description] of Object.entries(characterMappings)) {
    if (lowerSentence.includes(character)) {
      return description;
    }
  }
  
  return '';
}

function fillPremiumTemplate(
  difficulty: string,
  userInfo: any,
  scene: string,
  setting: string,
  objects: string,
  secondary_characters: string,
  emotion: string,
  pageText: string
): string {
  try {
    console.log(`🛡️ Tier 2.5: Filling template for difficulty: ${difficulty}`);
    
    const template = PREMIUM_PROMPT_TEMPLATES[difficulty] || PREMIUM_PROMPT_TEMPLATES.medium;
    
    // NUCLEAR AVATAR MAPPING - Replace complex cultural profile system
    const avatarMapping = getNuclearAvatarMapping(userInfo, difficulty);
    console.log(`🛡️ Tier 2.5: Nuclear avatar mapping applied: ${avatarMapping.character}`);
    
    // Special case: Keep African American arrays for English + dark skin (cultural preservation)
    const language = userInfo?.language || 'en';
    const isEnglishDarkSkin = language === 'en' && userInfo?.avatar?.skinTone === 'dark';
    
    let finalMapping = avatarMapping;
    
    if (isEnglishDarkSkin) {
      console.log('🛡️ Tier 2.5: Using African American cultural arrays for English + dark skin');
      
      // Use African American arrays for cultural authenticity
      const character = avatarMapping.character === 'child' ? 'boy' : avatarMapping.character; // Default neutral to boy for array access
      const extractedGender = extractGenderFromCharacter(character);
      const genderKey = extractedGender === 'girl' ? 'girls' : 'boys';
      
      // Deterministic selection based on user name (no randomization)
      const nameHash = (userInfo?.name || 'default').length % 10;
      
      finalMapping = {
        ...avatarMapping,
        skin: HARDCODED_AFRICAN_AMERICAN_SKIN_TONES[nameHash % HARDCODED_AFRICAN_AMERICAN_SKIN_TONES.length],
        hair: HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES[genderKey][nameHash % HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES[genderKey].length],
        eyes: HARDCODED_AFRICAN_AMERICAN_EYE_COLORS[nameHash % HARDCODED_AFRICAN_AMERICAN_EYE_COLORS.length],
        features: HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES[nameHash % HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES.length],
        clothing: HARDCODED_AFRICAN_AMERICAN_CLOTHING[nameHash % HARDCODED_AFRICAN_AMERICAN_CLOTHING.length]
      };
    }
    
    // Apply cultural setting enhancement
    const enhancedSetting = applyCulturalSettingEnhancement(setting, userInfo);
    
    // Get style parameters
    const style = getHardcodedStyle(difficulty);
    
    // Fill template with nuclear mappings (eyes only for African Americans) + page text
    let filledTemplate = template
      .replace('{pageText}', pageText || 'A story about learning and discovery')
      .replace('{character}', finalMapping.character)
      .replace('{age}', finalMapping.age)
      .replace('{skin}', finalMapping.skin)
      .replace('{hair}', finalMapping.hair)
      .replace('{features}', finalMapping.features)
      .replace('{clothing}', finalMapping.clothing)
      .replace('{scene}', scene)
      .replace('{setting}', enhancedSetting)
      .replace('{objects}', objects)
      .replace('{secondary_characters}', secondary_characters)
      .replace('{emotion}', emotion)
      .replace('{quality}', style.quality)
      .replace('{suffix}', style.suffix || '');
    
    console.log(`🛡️ Tier 2.5: Template filled successfully with nuclear mapping`);
    return filledTemplate;
    
  } catch (error) {
    console.error('❌ Tier 2.5: Template filling error:', error);
    // Fix the avatar type bug in the fallback too
    const fallbackCharacter = userInfo?.avatar?.type === 'girl' ? 'girl' : userInfo?.avatar?.type === 'prefer-not-to-answer' ? 'child' : 'boy';
    return `A happy ${fallbackCharacter} reading and learning in a bright classroom. High quality, detailed illustration.`;
  }
}

// ============= HELPER FUNCTIONS =============

function getRandomItem(array: string[]): string {
  if (!array || array.length === 0) return 'default';
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
  const ageMap = {
    'beginner': 'age 5-6',
    'easy': 'age 7-8', 
    'medium': 'age 9-10',
    'hard': 'age 11-12',
    'expert': 'age 13-14'
  };
  return ageMap[difficulty] || 'age 9-10';
}

function getHardcodedStyle(difficulty: string): { quality: string, suffix?: string, steps: number, CFGScale: number } {
  const styleMap = {
    'beginner': {
      // Concatenated prompt + quality from styleFrameworks.js
      quality: '3D digital art style, Pixar-inspired character design, soft rounded features, friendly appealing aesthetics, bright cheerful colors, clean polished rendering. High-quality 3D animated character illustration for early readers. Professional animation studio quality with depth and dimension',
      // Added missing suffix from brandSuffix
      suffix: '3D animated style, Pixar-quality rendering, child-friendly design, diverse representation, warm natural lighting optimized for all skin tones',
      steps: 4,
      CFGScale: 1
    },
    'easy': {
      // Concatenated prompt + quality from styleFrameworks.js (identical to beginner)
      quality: '3D digital art style, Pixar-inspired character design, soft rounded features, friendly appealing aesthetics, bright cheerful colors, clean polished rendering. High-quality 3D animated character illustration for early readers. Professional animation studio quality with depth and dimension',
      // Added missing suffix from brandSuffix
      suffix: '3D animated style, Pixar-quality rendering, child-friendly design, diverse representation, warm natural lighting optimized for all skin tones',
      steps: 4,
      CFGScale: 1
    },
    'medium': {
      // Concatenated prompt + quality from styleFrameworks.js
      quality: 'Digital painting style with painterly brush strokes, artistic color harmony, cinematic lighting, professional artwork quality. Professional painterly digital art with artistic sophistication. Ultra professional children\'s book illustration standard',
      // Updated suffix from brandSuffix
      suffix: 'painterly digital art, cinematic lighting, artistic quality, diverse representation, warm natural lighting optimized for all skin tones',
      steps: 4,
      CFGScale: 1
    },
    'hard': {
      // Concatenated prompt + quality from styleFrameworks.js
      quality: 'Professional digital illustration with sophisticated artistic maturity, nuanced color gradients, refined visual storytelling, advanced digital painting techniques. Gallery-worthy professional digital illustration. Sophisticated artistic children\'s book illustration',
      // Updated suffix from brandSuffix
      suffix: 'professional digital illustration, sophisticated artistic maturity, gallery-worthy quality, diverse representation, warm natural lighting optimized for all skin tones',
      steps: 4,
      CFGScale: 1
    },
    'expert': {
      // Concatenated prompt + quality from styleFrameworks.js
      quality: 'Fine art digital illustration with masterful artistic sophistication, complex color harmonies, cinematic visual narrative, museum-quality artistic techniques. Museum-quality fine art digital illustration. Masterful children\'s book art with diverse representation',
      // Updated suffix from brandSuffix
      suffix: 'fine art digital illustration, masterful artistic sophistication, museum-quality artwork, diverse representation, warm natural lighting optimized for all skin tones',
      steps: 4,
      CFGScale: 1
    }
  };
  return styleMap[difficulty] || styleMap.medium;
}

function getEnhancedNegativePrompt(culturalProfile: string, avatarType: string, difficulty: string, pageNumber: number = 1): string {
  // HARDCODED COMPLETE NEGATIVE PROMPT SYSTEM - Comprehensive content filtering
  
  // Base Negative Components (comprehensive quality and safety filters)
  const baseNegative = [
    'no text, no words, no letters, no writing, no signatures, watermarks, low quality, blurry, distorted, deformed, extra limbs, missing limbs, bad anatomy, weird proportions, bad hands, malformed hands, extra fingers, missing fingers, crossed eyes, bad facial features, unrealistic skin, plastic appearance, oversaturated, cartoon style, anime style, adult content, inappropriate content'
  ];
  
  // Framework-Specific Negative Prompts (from styleFrameworks.js)
  if (difficulty === 'beginner' || difficulty === 'easy') {
    // Level 0-1 (Pixar anti-toy) - MUST be first for Level 0-1
    baseNegative.push('toy, figurine, doll, plastic, simple background, flat lighting, multiple characters, crowd, busy background, dark colors, scary, photorealistic, adult themes, text, words');
  }
  
  // Additional Level 1 negatives
  baseNegative.push('multiple people, crowd, cluttered background, dark atmosphere, scary elements, photorealistic, text, adult content');
  
  // Cultural Sensitivity Filters
  baseNegative.push('cultural insensitivity, stereotypes, offensive representations, caricatures');
  
  // African American Protection (enhanced from MultiStageEnhancementPipeline.js)
  if (culturalProfile === 'African American') {
    baseNegative.push('lightened skin, whitewashed, caucasian features, stereotypical, altered ethnicity, artificial skin lightening, european features imposed, generic appearance');
  }
  
  // Technical Quality Filters
  baseNegative.push('pixelated, artifacts, noise, oversaturated, undersaturated, malformed features');
  
  // Content Safety Filters
  baseNegative.push('weapons, conflict, sadness, fear, negative emotions');
  
  // Character Consistency Filters (Page > 1)
  if (pageNumber > 1) {
    baseNegative.push('inconsistent character design, style variations, character appearance changes');
  }
  
  // Gender-Specific Negative Prompts (Enhanced)
  if (avatarType === 'boy' || (avatarType.includes && avatarType.includes('boy'))) {
    // For boy characters - exclude feminine features
    baseNegative.push('feminine features, long eyelashes, makeup, lipstick, feminine clothing, dresses, feminine hairstyles, feminine jewelry, girl character, female character');
  } else if (avatarType === 'girl' || (avatarType.includes && avatarType.includes('girl'))) {
    // For girl characters - exclude masculine features  
    baseNegative.push('masculine features, facial hair, beard, mustache, masculine clothing, masculine build, broad shoulders, masculine jawline, boy character, male character');
  } else if (avatarType === 'prefer-not-to-answer' || avatarType.includes('child') || avatarType.includes('neutral')) {
    // For neutral characters - exclude BOTH masculine AND feminine features
    if (culturalProfile === 'African American') {
      // Enhanced neutral negatives for African American characters
      baseNegative.push('masculine features, facial hair, beard, mustache, masculine clothing, masculine build, broad shoulders, masculine jawline, boy character, male character, feminine features, long eyelashes, makeup, lipstick, feminine clothing, dresses, feminine hairstyles, feminine jewelry, girl character, female character, gendered characteristics, gender-specific features');
    } else {
      baseNegative.push('masculine features, feminine features, gendered characteristics, gender-specific features');
    }
  }
  
  return baseNegative.join(', ');
}

function applyCulturalSettingEnhancement(baseSetting: string, userInfo: any): string {
  try {
    const language = userInfo?.language || 'en';
    
    if (language === 'es' || language === 'spanish') {
      return baseSetting.replace('a ', 'a culturally rich ').replace('an ', 'a vibrant ');
    }
    
    if (language === 'zh' || language === 'chinese') {
      return baseSetting.replace('a ', 'a harmonious ').replace('an ', 'a balanced ');
    }
    
    if (language === 'ar' || language === 'arabic') {
      return baseSetting.replace('a ', 'a welcoming ').replace('an ', 'a warm ');
    }
    
    return baseSetting;
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Cultural setting enhancement error:', error);
    return baseSetting;
  }
}

function detectCulturalProfile(userInfo: any): string {
  try {
    const language = userInfo?.language || 'en';
    const skinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || '';
    
    console.log(`🛡️ Tier 2.5: Detecting cultural profile - Language: ${language}, Skin: ${skinTone}`);
    
    // African American detection
    if (skinTone.toLowerCase().includes('dark') || 
        skinTone.toLowerCase().includes('brown') ||
        skinTone.toLowerCase().includes('black') ||
        skinTone.toLowerCase().includes('ebony') ||
        skinTone.toLowerCase().includes('chocolate')) {
      console.log('🛡️ Tier 2.5: African American profile detected via skin tone');
      return 'African American';
    }
    
    // Language-based detection
    if (language === 'es' || language === 'spanish') {
      console.log('🛡️ Tier 2.5: Hispanic/Latino profile detected via language');
      return 'Hispanic/Latino';
    }
    
    if (language === 'zh' || language === 'chinese') {
      console.log('🛡️ Tier 2.5: Chinese/Asian profile detected via language');
      return 'Chinese/Asian';
    }
    
    if (language === 'ar' || language === 'arabic') {
      console.log('🛡️ Tier 2.5: Middle Eastern profile detected via language');
      return 'Middle Eastern';
    }
    
    console.log('🛡️ Tier 2.5: Standard American profile (default)');
    return 'Standard American';
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Cultural detection error, using default:', error);
    return 'Standard American';
  }
}

function detectEmotionFromText(text: string): string {
  try {
    if (!text || typeof text !== 'string') return 'Joyful and engaged atmosphere';
    
    const lowerText = text.toLowerCase();
    
    // Positive emotions
    if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('excited') || 
        lowerText.includes('celebration') || lowerText.includes('party') || lowerText.includes('fun')) {
      return 'Cheerful and celebratory atmosphere';
    }
    
    if (lowerText.includes('peaceful') || lowerText.includes('calm') || lowerText.includes('quiet') ||
        lowerText.includes('serene') || lowerText.includes('tranquil')) {
      return 'Peaceful and serene atmosphere';
    }
    
    if (lowerText.includes('adventure') || lowerText.includes('explore') || lowerText.includes('discover') ||
        lowerText.includes('journey') || lowerText.includes('quest')) {
      return 'Adventurous and curious atmosphere';
    }
    
    if (lowerText.includes('learn') || lowerText.includes('study') || lowerText.includes('school') ||
        lowerText.includes('education') || lowerText.includes('knowledge')) {
      return 'Educational and inspiring atmosphere';
    }
    
    // Default positive
    return 'Warm and welcoming atmosphere';
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Emotion detection error:', error);
    return 'Positive and uplifting atmosphere';
  }
}

// ============= MAIN EDGE FUNCTION =============

Deno.serve(async (req: Request) => {
  console.log(`🛡️ Tier 2.5: ${req.method} ${req.url}`);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }
  
  try {
    const { pageText, userInfo } = await req.json();
    
    console.log('🛡️ Tier 2.5: Processing request with nuclear independence');
    
    // Extract scene components with complete placeholder support
    const { scene, setting, objects, secondary_characters } = extractSceneWithPremiumTemplate(pageText);
    
    // Map difficulty level
    const difficulty = mapDifficultyInline(userInfo);
    
    // Detect emotion
    const emotion = detectEmotionFromText(pageText);
    
    // Fill premium template with all placeholders including page text
    const prompt = fillPremiumTemplate(difficulty, userInfo, scene, setting, objects, secondary_characters, emotion, pageText);
    
    // Generate negative prompt with fixed avatar mapping and cultural detection
    const avatarMapping = getNuclearAvatarMapping(userInfo, difficulty);
    const avatarType = userInfo?.avatar?.type || 'prefer-not-to-answer';
    const pageNumber = userInfo?.pageNumber || 1; // Default to page 1 for Tier 2.5
    const culturalProfile = detectCulturalProfile(userInfo);
    const negativePrompt = getEnhancedNegativePrompt(culturalProfile, avatarType, difficulty, pageNumber);
    
    // Get style parameters
    const style = getHardcodedStyle(difficulty);
    
    console.log('🛡️ Tier 2.5: Connecting to Runware API via WebSocket...');
    
    // Connect to Runware WebSocket API
    const ws = new WebSocket('wss://ws-api.runware.ai/v1');
    
    return new Promise((resolve) => {
      let isResolved = false;
      
      const resolveOnce = (response: Response) => {
        if (!isResolved) {
          isResolved = true;
          ws.close();
          resolve(response);
        }
      };
      
      ws.onopen = () => {
        console.log('🛡️ Tier 2.5: WebSocket connected, authenticating...');
        
        // Send authentication
        const authMessage = [{
          taskType: "authentication",
          apiKey: Deno.env.get('RUNWARE_API_KEY')
        }];
        
        ws.send(JSON.stringify(authMessage));
      };
      
      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          console.log('🛡️ Tier 2.5: Received WebSocket response:', response);
          
          if (response.error || response.errors) {
            console.error('❌ Tier 2.5: API error:', response);
            const errorMessage = response.errorMessage || response.errors?.[0]?.message || 'Unknown API error';
            resolveOnce(createCorsErrorResponse(errorMessage, 500));
            return;
          }
          
          if (response.data) {
            for (const item of response.data) {
              if (item.taskType === "authentication") {
                console.log('🛡️ Tier 2.5: Authentication successful, generating image...');
                
                // Send image generation request
                const imageMessage = [{
                  taskType: "imageInference",
                  taskUUID: crypto.randomUUID(),
                  positivePrompt: prompt,
                  negativePrompt: negativePrompt,
                  width: 1024,
                  height: 1024,
                  model: "runware:100@1",
                  numberResults: 1,
                  outputFormat: "WEBP",
                  steps: style.steps,
                  CFGScale: style.CFGScale
                }];
                
                ws.send(JSON.stringify(imageMessage));
                
              } else if (item.taskType === "imageInference") {
                console.log('🛡️ Tier 2.5: Image generation successful!');
                
                resolveOnce(createCorsResponse({
                  success: true,
                  imageURL: item.imageURL,
                  prompt: prompt,
                  negativePrompt: negativePrompt,
                  difficulty: difficulty,
                  culturalProfile: culturalProfile,
                  tier: '2.5 Nuclear Independence',
                  placeholders: {
                    objects: objects || 'none',
                    secondary_characters: secondary_characters || 'none'
                  }
                }));
              }
            }
          }
        } catch (parseError) {
          console.error('❌ Tier 2.5: Response parsing error:', parseError);
          resolveOnce(createCorsErrorResponse('Failed to parse API response', 500));
        }
      };
      
      ws.onerror = (error) => {
        console.error('❌ Tier 2.5: WebSocket error:', error);
        resolveOnce(createCorsErrorResponse('WebSocket connection failed', 500));
      };
      
      ws.onclose = (event) => {
        console.log('🛡️ Tier 2.5: WebSocket closed:', event.code, event.reason);
        if (!isResolved) {
          resolveOnce(createCorsErrorResponse('WebSocket connection closed unexpectedly', 500));
        }
      };
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (!isResolved) {
          console.error('❌ Tier 2.5: Request timeout');
          resolveOnce(createCorsErrorResponse('Request timeout', 408));
        }
      }, 30000);
    });
    
  } catch (error) {
    console.error('❌ Tier 2.5: Main function error:', error);
    return createCorsErrorResponse(error.message || 'Internal server error', 500);
  }
});