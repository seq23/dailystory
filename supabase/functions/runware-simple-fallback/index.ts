import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";

// ============= TIER 2.5 NUCLEAR INDEPENDENCE - ALL CONSTANTS FIRST =============
// Moving all hardcoded data arrays and constants to the top to prevent initialization order issues

// PREMIUM PROMPT TEMPLATES BY DIFFICULTY (Enhanced with Objects & Secondary Characters)
const PREMIUM_PROMPT_TEMPLATES = {
  beginner: "{character} {age}, {skin}, {hair}, {eyes}, {features}, wearing {clothing}, {scene} in {setting}{objects}{secondary_characters}. {emotion}. {quality}",
  easy: "{character} {age}, {skin}, {hair}, {eyes}, {features}, wearing {clothing}, {scene} in {setting}{objects}{secondary_characters}. {emotion}. {quality}",
  medium: "{character} {age}, {skin}, {hair}, {eyes}, {features}, wearing {clothing}, {scene} in {setting}{objects}{secondary_characters}. {emotion}. {quality}. {suffix}",
  hard: "{character} {age}, {skin}, {hair}, {eyes}, {features}, wearing {clothing}, {scene} in {setting}{objects}{secondary_characters}. {emotion}. {quality}. {suffix}",
  expert: "{character} {age}, {skin}, {hair}, {eyes}, {features}, wearing {clothing}, {scene} in {setting}{objects}{secondary_characters}. {emotion}. {quality}. {suffix}"
};

// AFRICAN AMERICAN ARRAYS (Nuclear Independence) - Already exists
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

// HISPANIC/LATINO ARRAYS (Spanish + olive/medium skin)
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

// CHINESE/ASIAN ARRAYS (Chinese language)
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

// MIDDLE EASTERN ARRAYS (Arabic language)
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

// STANDARD AMERICAN ARRAYS (English + light/medium/olive skin)
const HARDCODED_STANDARD_AMERICAN_HAIRSTYLES = {
  boys: [
    'blonde hair with neat cut', 'light brown hair style', 'sandy blonde hair', 'medium brown hair',
    'blonde hair with fringe', 'light brown wavy hair', 'classic blonde cut', 'brown hair with layers',
    'golden blonde hair', 'chestnut brown hair', 'ash blonde hair', 'caramel brown hair'
  ],
  girls: [
    'blonde hair in ponytail', 'light brown wavy hair', 'golden blonde locks', 'brown hair in braids',
    'blonde hair with bangs', 'long light brown hair', 'blonde curly hair', 'straight brown hair',
    'sandy blonde waves', 'chestnut brown hair', 'honey blonde hair', 'auburn brown hair'
  ]
};

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

// ============= NUCLEAR INDEPENDENT DIFFICULTY MAPPING =============
/**
 * Nuclear Independent Difficulty Mapping - Zero External Dependencies
 * Extracts and maps difficulty levels with multiple fallback strategies
 * Conservative defaults ensure 100% operation even with corrupt/missing data
 */
function mapDifficultyInline(userInfo?: any, fallbackLevel: string = 'medium'): string {
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

function extractSceneWithPremiumTemplate(pageText: string, userInfo?: any, avatarIdentity?: any, difficulty?: string): string {
  if (!pageText) return fillPremiumTemplate('a friendly character in a beautiful scene', pageText, userInfo, avatarIdentity, difficulty || 'medium');

  const sentences = pageText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let bestScene = sentences[0] || 'a friendly character in a beautiful scene';
  let bestScore = 0;
  let detectedSetting = 'outdoor';

  sentences.forEach(sentence => {
    const cleaned = sentence.trim();
    if (cleaned.length < 10) return;

    let score = 0;
    const lowerText = cleaned.toLowerCase();

    // Visual richness scoring
    const visualWords = ['see', 'look', 'watch', 'bright', 'colorful', 'beautiful', 'shiny', 'sparkly', 'glowing'];
    visualWords.forEach(word => {
      if (lowerText.includes(word)) score += 10;
    });

    // Action scoring
    const actionWords = ['run', 'jump', 'play', 'dance', 'sing', 'laugh', 'smile', 'walk', 'climb'];
    actionWords.forEach(word => {
      if (lowerText.includes(word)) score += 8;
    });

    // Emotion scoring
    const emotionWords = ['happy', 'excited', 'joyful', 'cheerful', 'delighted', 'amazed', 'surprised'];
    emotionWords.forEach(word => {
      if (lowerText.includes(word)) score += 6;
    });

    // Setting detection and scoring
    if (lowerText.includes('bedroom') || lowerText.includes('bed')) {
      score += 15;
      if (score > bestScore) detectedSetting = 'bedroom';
    } else if (lowerText.includes('house') || lowerText.includes('home') || lowerText.includes('kitchen') || lowerText.includes('living room')) {
      score += 12;
      if (score > bestScore) detectedSetting = 'indoor';
    } else if (lowerText.includes('park') || lowerText.includes('playground') || lowerText.includes('garden') || lowerText.includes('outside')) {
      score += 10;
      if (score > bestScore) detectedSetting = 'outdoor';
    }

    // Character interaction scoring
    if (lowerText.includes('friend') || lowerText.includes('together') || lowerText.includes('with')) {
      score += 5;
    }

    if (score > bestScore) {
      bestScore = score;
      bestScene = cleaned;
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
  
  // Cultural profile detection
  const culturalProfile = detectCulturalProfile(userInfo, avatarIdentity);
  console.log(`🌍 Cultural Profile: ${culturalProfile.profile} (${culturalProfile.language}, ${culturalProfile.skinTone})`);
  
  // Character type determination
  const avatarType = avatarIdentity?.type || userInfo?.avatar?.type || 'child';
  const isGirl = avatarType === 'girl';
  const isBoy = avatarType === 'boy';
  const character = isGirl ? 'young girl' : isBoy ? 'young boy' : 'young child';
  
  // Age mapping
  const age = getAgeFromDifficulty(difficulty || 'medium');
  
  // Cultural array selection
  let hairArray, skinArray, eyeArray, featuresArray, clothingArray;
  
  switch (culturalProfile.profile) {
    case 'african-american':
      hairArray = HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES[isGirl ? 'girls' : 'boys'];
      skinArray = HARDCODED_AFRICAN_AMERICAN_SKIN_TONES;
      eyeArray = HARDCODED_AFRICAN_AMERICAN_EYE_COLORS;
      featuresArray = HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES;
      clothingArray = HARDCODED_AFRICAN_AMERICAN_CLOTHING;
      break;
    case 'hispanic-latino':
      hairArray = HARDCODED_HISPANIC_LATINO_HAIRSTYLES[isGirl ? 'girls' : 'boys'];
      skinArray = HARDCODED_HISPANIC_LATINO_SKIN_TONES;
      eyeArray = HARDCODED_HISPANIC_LATINO_EYE_COLORS;
      featuresArray = HARDCODED_HISPANIC_LATINO_FACIAL_FEATURES;
      clothingArray = HARDCODED_HISPANIC_LATINO_CLOTHING;
      break;
    case 'chinese-asian':
      hairArray = HARDCODED_CHINESE_ASIAN_HAIRSTYLES[isGirl ? 'girls' : 'boys'];
      skinArray = HARDCODED_CHINESE_ASIAN_SKIN_TONES;
      eyeArray = HARDCODED_CHINESE_ASIAN_EYE_COLORS;
      featuresArray = HARDCODED_CHINESE_ASIAN_FACIAL_FEATURES;
      clothingArray = HARDCODED_CHINESE_ASIAN_CLOTHING;
      break;
    case 'middle-eastern':
      hairArray = HARDCODED_MIDDLE_EASTERN_HAIRSTYLES[isGirl ? 'girls' : 'boys'];
      skinArray = HARDCODED_MIDDLE_EASTERN_SKIN_TONES;
      eyeArray = HARDCODED_MIDDLE_EASTERN_EYE_COLORS;
      featuresArray = HARDCODED_MIDDLE_EASTERN_FACIAL_FEATURES;
      clothingArray = HARDCODED_MIDDLE_EASTERN_CLOTHING;
      break;
    default: // standard-american
      hairArray = HARDCODED_STANDARD_AMERICAN_HAIRSTYLES[isGirl ? 'girls' : 'boys'];
      skinArray = HARDCODED_STANDARD_AMERICAN_SKIN_TONES;
      eyeArray = HARDCODED_STANDARD_AMERICAN_EYE_COLORS;
      featuresArray = HARDCODED_STANDARD_AMERICAN_FACIAL_FEATURES;
      clothingArray = HARDCODED_STANDARD_AMERICAN_CLOTHING;
  }
  
  // Random selections from arrays
  const skin = getRandomItem(skinArray);
  const hair = getRandomItem(hairArray);
  const eyes = getRandomItem(eyeArray);
  const features = getRandomItem(featuresArray);
  const clothing = getRandomItem(clothingArray);
  
  // Setting enhancement
  const setting = applyCulturalSettingEnhancement(detectedSetting || 'outdoor', userInfo, detectedSetting);
  
  // Objects and secondary characters detection
  const objects = detectObjects(originalPageText || scene);
  const secondaryCharacters = detectSecondaryCharacters(originalPageText || scene);
  
  const objectsText = objects.length > 0 ? `, with ${objects.join(', ')}` : '';
  const secondaryCharsText = secondaryCharacters.length > 0 ? `, accompanied by ${secondaryCharacters.join(', ')}` : '';
  
  // Emotion detection
  const emotion = detectEmotionFromText(originalPageText || scene);
  
  // Style application
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

// ============= STEP 2: COMPREHENSIVE CULTURAL DETECTION FUNCTION =============
// Nuclear independence - comprehensive cultural profile detection matching orchestrator

function detectCulturalProfile(userInfo?: any, avatarIdentity?: any): { profile: string, language: string, skinTone: string } {
  const language = userInfo?.nativeLanguage || 'en';
  const skinTone = avatarIdentity?.skinTone || userInfo?.avatar?.skinTone || 'medium';
  
  // Language + skin tone matrix (matching orchestrator's umbrella system)
  if (language === 'en' || !language) {
    if (skinTone === 'dark') {
      return { profile: 'african-american', language: 'en', skinTone: 'dark' };
    } else {
      return { profile: 'standard-american', language: 'en', skinTone: skinTone };
    }
  } else if (language === 'es') {
    if (skinTone === 'dark') {
      return { profile: 'afro-hispanic', language: 'es', skinTone: 'dark' };
    } else {
      return { profile: 'hispanic-latino', language: 'es', skinTone: skinTone };
    }
  } else if (language === 'zh') {
    return { profile: 'chinese-asian', language: 'zh', skinTone: skinTone };
  } else if (language === 'hi') {
    return { profile: 'indian-south-asian', language: 'hi', skinTone: skinTone };
  } else if (language === 'ar') {
    return { profile: 'middle-eastern', language: 'ar', skinTone: skinTone };
  } else if (language === 'fr') {
    if (skinTone === 'dark') {
      return { profile: 'african-french', language: 'fr', skinTone: 'dark' };
    } else {
      return { profile: 'french-multicultural', language: 'fr', skinTone: skinTone };
    }
  }
  
  // Default fallback
  return { profile: 'standard-american', language: language, skinTone: skinTone };
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
  
  return objects.slice(0, 3); // Limit to 3 objects
}

function detectSecondaryCharacters(text: string): string[] {
  if (!text) return [];
  
  const characters: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Family members
  const familyMembers = ['mom', 'dad', 'mother', 'father', 'sister', 'brother', 'grandma', 'grandpa', 'cousin'];
  familyMembers.forEach(member => {
    if (lowerText.includes(member)) {
      characters.push(member);
    }
  });
  
  // Friends
  if (lowerText.includes('friend')) {
    characters.push('best friend');
  }
  
  // Pets
  const pets = ['dog', 'cat', 'pet', 'puppy', 'kitten'];
  pets.forEach(pet => {
    if (lowerText.includes(pet)) {
      characters.push(`friendly ${pet}`);
    }
  });
  
  return characters.slice(0, 2); // Limit to 2 secondary characters
}

// ============= HELPER FUNCTIONS =============
function getRandomItem(array: string[]): string {
  return array[Math.floor(Math.random() * array.length)];
}

function getAgeFromDifficulty(difficulty: string): string {
  const ageMap = {
    'beginner': '4-5 years old',
    'easy': '6-7 years old', 
    'medium': '8-9 years old',
    'hard': '10-11 years old',
    'expert': '12-13 years old'
  };
  return ageMap[difficulty] || ageMap['medium'];
}

function getHardcodedStyle(difficulty: string) {
  const styles = {
    'beginner': {
      prompt: 'High-quality children\'s book illustration with vibrant colors and simple composition, warm friendly lighting, clear visual storytelling',
      quality: 'High-quality digital children\'s book illustration with vibrant colors and engaging visual appeal',
      suffix: 'children\'s book style, vibrant colors, simple composition, warm lighting, clear storytelling',
      steps: 12,
      cfgScale: 6.0,
      strength: 0.75
    },
    'easy': {
      prompt: 'Detailed children\'s illustration with rich colors and engaging composition, warm natural lighting, clear visual narrative',
      quality: 'Detailed high-quality children\'s illustration with rich vibrant colors and engaging composition',
      suffix: 'detailed children\'s illustration, rich colors, engaging composition, warm natural lighting',
      steps: 15,
      cfgScale: 6.5,
      strength: 0.8
    },
    'medium': {
      prompt: 'Professional children\'s book illustration with sophisticated color palette and detailed composition, natural lighting with artistic flair',
      quality: 'Professional quality children\'s book illustration with sophisticated artistic detail and vibrant storytelling',
      suffix: 'professional children\'s book illustration, sophisticated colors, detailed composition, natural lighting',
      steps: 18,
      cfgScale: 7.0,
      strength: 0.82
    },
    'hard': {
      prompt: 'Advanced digital illustration with complex color harmonies and sophisticated composition techniques, professional lighting and artistic maturity',
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

// ============= MAIN SERVE FUNCTION AT THE END =============
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
                cfgScale: 4.0,
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
              
              // TIER 2.5 NUCLEAR INDEPENDENCE: Log prompt data instead of external storage
              console.log(`📸 [TIER-2.5] NUCLEAR FALLBACK - Image Generation Complete`);
              console.log(`📸 [TIER-2.5] Tier: 2.5`);
              console.log(`📸 [TIER-2.5] Prompt: ${finalPrompt}`);
              console.log(`📸 [TIER-2.5] Negative: ${negativePrompt}`);
              console.log(`📸 [TIER-2.5] Page Text: ${pageText}`);
              console.log(`📸 [TIER-2.5] Seed: ${item.seed}`);
              console.log(`📸 [TIER-2.5] Cost: ${item.cost || 0.01}`);
              console.log(`📸 [TIER-2.5] Provider: runware-simple-fallback`);
              console.log(`📸 [TIER-2.5] Model: runware:100@1`);
              console.log(`📸 [TIER-2.5] SUCCESS - Zero Dependencies Maintained`);
              
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

// ============= NUCLEAR TIER 2.5: ZERO DEPENDENCY DIFFICULTY MAPPING =============
/**
 * Nuclear Independent Difficulty Mapping - Zero External Dependencies
 * Extracts and maps difficulty levels with multiple fallback strategies
 * Conservative defaults ensure 100% operation even with corrupt/missing data
 */
function mapDifficultyInline(userInfo?: any, fallbackLevel: string = 'medium'): string {
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

// ============= STEP 2: PARALLEL HARDCODED ARRAYS FOR ALL CULTURAL PROFILES =============
// Nuclear Independence - Comprehensive cultural coverage matching orchestrator's umbrella system

// AFRICAN AMERICAN ARRAYS (Nuclear Independence) - Already exists
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

// HISPANIC/LATINO ARRAYS (Spanish + olive/medium skin)
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

// CHINESE/ASIAN ARRAYS (Chinese language)
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

// MIDDLE EASTERN ARRAYS (Arabic language)
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

// STANDARD AMERICAN ARRAYS (English + light/medium/olive skin)
const HARDCODED_STANDARD_AMERICAN_HAIRSTYLES = {
  boys: [
    'blonde hair with neat cut', 'light brown hair style', 'sandy blonde hair', 'medium brown hair',
    'blonde hair with fringe', 'light brown wavy hair', 'classic blonde cut', 'brown hair with layers',
    'golden blonde hair', 'chestnut brown hair', 'ash blonde hair', 'caramel brown hair'
  ],
  girls: [
    'blonde hair in ponytail', 'light brown wavy hair', 'golden blonde locks', 'brown hair in braids',
    'blonde hair with bangs', 'long light brown hair', 'blonde curly hair', 'straight brown hair',
    'sandy blonde waves', 'chestnut brown hair', 'honey blonde hair', 'auburn brown hair'
  ]
};

const HARDCODED_STANDARD_AMERICAN_SKIN_TONES = [
  'fair light complexion', 'warm light skin', 'peachy fair skin', 'light rosy complexion',
  'pale golden skin', 'creamy light skin', 'fair pink-toned skin', 'light neutral complexion'
];

const HARDCODED_STANDARD_AMERICAN_EYE_COLORS = [
  'bright blue eyes', 'warm green eyes', 'hazel eyes', 'light brown eyes',
  'sparkling blue eyes', 'emerald green eyes', 'golden hazel eyes', 'deep blue eyes'
];

const HARDCODED_STANDARD_AMERICAN_FACIAL_FEATURES = [
  'bright cheerful expression', 'friendly open smile', 'sparkling energetic eyes',
  'warm welcoming demeanor', 'confident happy expression', 'gentle kind features',
  'radiant bright smile', 'lively animated expression', 'classic American features'
];

const HARDCODED_STANDARD_AMERICAN_CLOTHING = [
  'classic American casual wear', 'comfortable everyday clothes', 'modern casual style',
  'trendy youth fashion', 'all-American outfit', 'contemporary casual attire'
];

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
  
  // AVATAR DATA ALWAYS WINS - No text-based overrides
  character = genderType;

  // Age determination
  const age = getAgeFromDifficulty(difficulty || 'medium');
  
  // Avatar description components
  // ============= STEP 2: COMPREHENSIVE CULTURAL PROFILE DETECTION =============
  // Enhanced cultural detection using language + skin tone matrix (matching orchestrator)
  
  const culturalProfile = detectCulturalProfile(userInfo, avatarIdentity);
  console.log(`🎭 CULTURAL PROFILE DETECTED: ${culturalProfile.profile} (${culturalProfile.language} + ${culturalProfile.skinTone})`);
  
  // ============= STEP 2: COMPREHENSIVE CULTURAL ARRAY SELECTION =============
  // Use appropriate hardcoded arrays based on detected cultural profile
  
  character = avatarIdentity?.type === 'boy' ? 'boy' : 
              avatarIdentity?.type === 'girl' ? 'girl' : 'child';
  age = getAgeFromDifficulty(difficulty);
  
  if (culturalProfile.profile === 'african-american') {
    console.log('🎭 USING COMPREHENSIVE AFRICAN AMERICAN ARRAYS');
    
    // Use comprehensive African American arrays
    const skinIndex = Math.floor(Math.random() * HARDCODED_AFRICAN_AMERICAN_SKIN_TONES.length);
    const eyeIndex = Math.floor(Math.random() * HARDCODED_AFRICAN_AMERICAN_EYE_COLORS.length);
    const featureIndex = Math.floor(Math.random() * HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES.length);
    const clothingIndex = Math.floor(Math.random() * HARDCODED_AFRICAN_AMERICAN_CLOTHING.length);
    
    skin = HARDCODED_AFRICAN_AMERICAN_SKIN_TONES[skinIndex];
    eyes = HARDCODED_AFRICAN_AMERICAN_EYE_COLORS[eyeIndex];
    features = HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES[featureIndex];
    clothing = HARDCODED_AFRICAN_AMERICAN_CLOTHING[clothingIndex];
    
    // Hair selection based on gender
    const hairArray = character === 'girl' ? 
      HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.girls : 
      HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.boys;
    const hairIndex = Math.floor(Math.random() * hairArray.length);
    hair = hairArray[hairIndex];
    
    console.log(`🎭 AFRICAN AMERICAN ARRAYS: skin(${skinIndex}), hair(${hairIndex}), eyes(${eyeIndex}), features(${featureIndex}), clothing(${clothingIndex})`);
    
  } else if (culturalProfile.profile === 'hispanic-latino') {
    console.log('🎭 USING COMPREHENSIVE HISPANIC/LATINO ARRAYS');
    
    const skinIndex = Math.floor(Math.random() * HARDCODED_HISPANIC_LATINO_SKIN_TONES.length);
    const eyeIndex = Math.floor(Math.random() * HARDCODED_HISPANIC_LATINO_EYE_COLORS.length);
    const featureIndex = Math.floor(Math.random() * HARDCODED_HISPANIC_LATINO_FACIAL_FEATURES.length);
    const clothingIndex = Math.floor(Math.random() * HARDCODED_HISPANIC_LATINO_CLOTHING.length);
    
    skin = HARDCODED_HISPANIC_LATINO_SKIN_TONES[skinIndex];
    eyes = HARDCODED_HISPANIC_LATINO_EYE_COLORS[eyeIndex];
    features = HARDCODED_HISPANIC_LATINO_FACIAL_FEATURES[featureIndex];
    clothing = HARDCODED_HISPANIC_LATINO_CLOTHING[clothingIndex];
    
    const hairArray = character === 'girl' ? 
      HARDCODED_HISPANIC_LATINO_HAIRSTYLES.girls : 
      HARDCODED_HISPANIC_LATINO_HAIRSTYLES.boys;
    const hairIndex = Math.floor(Math.random() * hairArray.length);
    hair = hairArray[hairIndex];
    
    console.log(`🎭 HISPANIC/LATINO ARRAYS: skin(${skinIndex}), hair(${hairIndex}), eyes(${eyeIndex}), features(${featureIndex}), clothing(${clothingIndex})`);
    
  } else if (culturalProfile.profile === 'chinese-asian') {
    console.log('🎭 USING COMPREHENSIVE CHINESE/ASIAN ARRAYS');
    
    const skinIndex = Math.floor(Math.random() * HARDCODED_CHINESE_ASIAN_SKIN_TONES.length);
    const eyeIndex = Math.floor(Math.random() * HARDCODED_CHINESE_ASIAN_EYE_COLORS.length);
    const featureIndex = Math.floor(Math.random() * HARDCODED_CHINESE_ASIAN_FACIAL_FEATURES.length);
    const clothingIndex = Math.floor(Math.random() * HARDCODED_CHINESE_ASIAN_CLOTHING.length);
    
    skin = HARDCODED_CHINESE_ASIAN_SKIN_TONES[skinIndex];
    eyes = HARDCODED_CHINESE_ASIAN_EYE_COLORS[eyeIndex];
    features = HARDCODED_CHINESE_ASIAN_FACIAL_FEATURES[featureIndex];
    clothing = HARDCODED_CHINESE_ASIAN_CLOTHING[clothingIndex];
    
    const hairArray = character === 'girl' ? 
      HARDCODED_CHINESE_ASIAN_HAIRSTYLES.girls : 
      HARDCODED_CHINESE_ASIAN_HAIRSTYLES.boys;
    const hairIndex = Math.floor(Math.random() * hairArray.length);
    hair = hairArray[hairIndex];
    
    console.log(`🎭 CHINESE/ASIAN ARRAYS: skin(${skinIndex}), hair(${hairIndex}), eyes(${eyeIndex}), features(${featureIndex}), clothing(${clothingIndex})`);
    
  } else if (culturalProfile.profile === 'middle-eastern') {
    console.log('🎭 USING COMPREHENSIVE MIDDLE EASTERN ARRAYS');
    
    const skinIndex = Math.floor(Math.random() * HARDCODED_MIDDLE_EASTERN_SKIN_TONES.length);
    const eyeIndex = Math.floor(Math.random() * HARDCODED_MIDDLE_EASTERN_EYE_COLORS.length);
    const featureIndex = Math.floor(Math.random() * HARDCODED_MIDDLE_EASTERN_FACIAL_FEATURES.length);
    const clothingIndex = Math.floor(Math.random() * HARDCODED_MIDDLE_EASTERN_CLOTHING.length);
    
    skin = HARDCODED_MIDDLE_EASTERN_SKIN_TONES[skinIndex];
    eyes = HARDCODED_MIDDLE_EASTERN_EYE_COLORS[eyeIndex];
    features = HARDCODED_MIDDLE_EASTERN_FACIAL_FEATURES[featureIndex];
    clothing = HARDCODED_MIDDLE_EASTERN_CLOTHING[clothingIndex];
    
    const hairArray = character === 'girl' ? 
      HARDCODED_MIDDLE_EASTERN_HAIRSTYLES.girls : 
      HARDCODED_MIDDLE_EASTERN_HAIRSTYLES.boys;
    const hairIndex = Math.floor(Math.random() * hairArray.length);
    hair = hairArray[hairIndex];
    
    console.log(`🎭 MIDDLE EASTERN ARRAYS: skin(${skinIndex}), hair(${hairIndex}), eyes(${eyeIndex}), features(${featureIndex}), clothing(${clothingIndex})`);
    
  } else {
    // Standard American arrays for English + light/medium/olive skin
    console.log('🎭 USING COMPREHENSIVE STANDARD AMERICAN ARRAYS');
    
    const skinIndex = Math.floor(Math.random() * HARDCODED_STANDARD_AMERICAN_SKIN_TONES.length);
    const eyeIndex = Math.floor(Math.random() * HARDCODED_STANDARD_AMERICAN_EYE_COLORS.length);
    const featureIndex = Math.floor(Math.random() * HARDCODED_STANDARD_AMERICAN_FACIAL_FEATURES.length);
    const clothingIndex = Math.floor(Math.random() * HARDCODED_STANDARD_AMERICAN_CLOTHING.length);
    
    skin = HARDCODED_STANDARD_AMERICAN_SKIN_TONES[skinIndex];
    eyes = HARDCODED_STANDARD_AMERICAN_EYE_COLORS[eyeIndex];
    features = HARDCODED_STANDARD_AMERICAN_FACIAL_FEATURES[featureIndex];
    clothing = HARDCODED_STANDARD_AMERICAN_CLOTHING[clothingIndex];
    
    const hairArray = character === 'girl' ? 
      HARDCODED_STANDARD_AMERICAN_HAIRSTYLES.girls : 
      HARDCODED_STANDARD_AMERICAN_HAIRSTYLES.boys;
    const hairIndex = Math.floor(Math.random() * hairArray.length);
    hair = hairArray[hairIndex];
    
    console.log(`🎭 STANDARD AMERICAN ARRAYS: skin(${skinIndex}), hair(${hairIndex}), eyes(${eyeIndex}), features(${featureIndex}), clothing(${clothingIndex})`);
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

// ============= STEP 2: COMPREHENSIVE CULTURAL DETECTION FUNCTION =============
// Nuclear independence - comprehensive cultural profile detection matching orchestrator

function detectCulturalProfile(userInfo?: any, avatarIdentity?: any): { profile: string, language: string, skinTone: string } {
  const language = userInfo?.nativeLanguage || 'en';
  const skinTone = avatarIdentity?.skinTone || userInfo?.avatar?.skinTone || 'medium';
  
  // Language + skin tone matrix (matching orchestrator's umbrella system)
  if (language === 'en' || !language) {
    if (skinTone === 'dark') {
      return { profile: 'african-american', language: 'en', skinTone: 'dark' };
    } else {
      return { profile: 'standard-american', language: 'en', skinTone: skinTone };
    }
  } else if (language === 'es') {
    if (skinTone === 'dark') {
      return { profile: 'afro-hispanic', language: 'es', skinTone: 'dark' };
    } else {
      return { profile: 'hispanic-latino', language: 'es', skinTone: skinTone };
    }
  } else if (language === 'zh') {
    return { profile: 'chinese-asian', language: 'zh', skinTone: skinTone };
  } else if (language === 'hi') {
    return { profile: 'indian-south-asian', language: 'hi', skinTone: skinTone };
  } else if (language === 'ar') {
    return { profile: 'middle-eastern', language: 'ar', skinTone: skinTone };
  } else if (language === 'fr') {
    if (skinTone === 'dark') {
      return { profile: 'african-french', language: 'fr', skinTone: 'dark' };
    } else {
      return { profile: 'french-multicultural', language: 'fr', skinTone: skinTone };
    }
  }
  
  // Default fallback
  return { profile: 'standard-american', language: language, skinTone: skinTone };
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

  } catch (error) {
    console.error('Tier 2.5 Edge Function Error:', error);
    return createCorsErrorResponse(`Tier 2.5 internal error: ${error.message}`, 500);
  }
});