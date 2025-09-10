// ============= TIER 2.5 NUCLEAR INDEPENDENCE - SHARED NUCLEAR NEGATIVE PROMPT SYSTEM =============
// This edge function uses the shared nuclear negative prompt system for consistency
import { generateNuclearNegativePrompt, detectCulturalProfileForNegatives } from "../_shared/NuclearNegativePrompts.js";
import { globalArcSessionManager } from "../_shared/sessionStateManager.js";
import { ExactWordExtractor } from "../_shared/ExactWordExtractor.js";
import { VisualDetailTracker } from "../_shared/VisualDetailTracker.js";
import { CharacterConsistencyService } from "../_shared/CharacterConsistencyService.js";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Nuclear Independent CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Nuclear Independent CORS Response Functions  
function createCorsResponse(data, status = 200) {
  const headers = { 
    ...corsHeaders, 
    'Content-Type': 'application/json' 
  };
  return new Response(JSON.stringify(data), { status, headers });
}

function createCorsErrorResponse(error, status = 500) {
  const errorMessage = error instanceof Error ? error.message : error;
  console.error('Edge function error:', errorMessage);
  return createCorsResponse({ 
    success: false, 
    error: errorMessage 
  }, status);
}

function createCorsOptionsResponse() {
  return new Response(null, { headers: corsHeaders });
}

// ============= TIER 2.5 NUCLEAR INDEPENDENCE - ALL CONSTANTS FIRST =============

// 🎨 NUCLEAR STYLE SETTINGS - GLOBAL SCOPE FOR FUNCTION ACCESS 🎨
const NUCLEAR_STYLE_SETTINGS = {
  'beginner': {
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality',
    steps: 20,
    CFGScale: 7
  },
  'easy': {
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality',
    steps: 22,
    CFGScale: 7.5
  },
  'medium': {
    frameworkPrompt: '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation, warm natural lighting',
    steps: 25,
    CFGScale: 8
  },
  'hard': {
    frameworkPrompt: '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation, warm natural lighting',
    steps: 28,
    CFGScale: 9
  },
  'expert': {
    frameworkPrompt: '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation, warm natural lighting',
    steps: 30,
    CFGScale: 10
  }
};

// 🚨 ULTIMATE FALLBACK FRAMEWORK PROMPT - EMERGENCY USE ONLY 🚨
const EMERGENCY_FALLBACK_FRAMEWORK = '2.5D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation, warm natural lighting';

// ============= RUNWARE-ALIGNED TEMPLATE STRUCTURE =============
const PREMIUM_PROMPT_TEMPLATES = {
  beginner: "Technical: {frameworkPrompt}, {cameraDirective}. Narrative: {pageText}. Subject: {character} {age}, {ethnicity}, {hair}, {features}, {emotion}. Action: {scene}, {action_intensity}, {spatial_positioning}, {object_interaction}, {body_language}. Composition: {spatial_composition}. Environment: {setting}, {atmosphere}. Elements: {props}, {action_objects}, {colored_objects}, {sensory_details}. Context: {community_context}, {secondary_characters}",
  easy: "Technical: {frameworkPrompt}, {cameraDirective}. Narrative: {pageText}. Subject: {character} {age}, {ethnicity}, {hair}, {features}, {emotion}. Action: {scene}, {action_intensity}, {spatial_positioning}, {object_interaction}, {body_language}. Composition: {spatial_composition}. Environment: {setting}, {atmosphere}. Elements: {props}, {action_objects}, {colored_objects}, {sensory_details}. Context: {community_context}, {secondary_characters}",
  medium: "Technical: {frameworkPrompt}, {cameraDirective}. Subject: {character} {age}, {ethnicity}, {hair}, {features}, {emotion}. Action: {scene}, {action_intensity}, {spatial_positioning}, {object_interaction}, {body_language}. Composition: {spatial_composition}. Environment: {setting}, {atmosphere}. Elements: {props}, {action_objects}, {colored_objects}, {sensory_details}. Context: {community_context}, {secondary_characters}. Narrative: {pageText}",
  hard: "Technical: {frameworkPrompt}, {cameraDirective}. Subject: {character} {age}, {ethnicity}, {hair}, {features}, {emotion}. Action: {scene}, {action_intensity}, {spatial_positioning}, {object_interaction}, {body_language}. Composition: {spatial_composition}. Environment: {setting}, {atmosphere}. Elements: {props}, {action_objects}, {colored_objects}, {sensory_details}. Context: {community_context}, {secondary_characters}. Narrative: {pageText}",
  expert: "Technical: {frameworkPrompt}, {cameraDirective}. Subject: {character} {age}, {ethnicity}, {hair}, {features}, {emotion}. Action: {scene}, {action_intensity}, {spatial_positioning}, {object_interaction}, {body_language}. Composition: {spatial_composition}. Environment: {setting}, {atmosphere}. Elements: {props}, {action_objects}, {colored_objects}, {sensory_details}. Context: {community_context}, {secondary_characters}. Narrative: {pageText}"
};

const BASIC_PROMPT_TEMPLATES = {
  beginner: "Primary Scene: {pageText}. Visual Components: {character} {age} with {hair}, {features} {subject} {action} with {emotion} {secondary_characters} with {colored_objects} in {setting} with {adjective} colors. Brand Suffix: {frameworkPrompt}",
  easy: "Primary Scene: {pageText}. Visual Components: {character} {age} with {hair}, {features} {subject} {action} with {emotion} {secondary_characters} with {colored_objects} in {setting} with {adjective} colors. Brand Suffix: {frameworkPrompt}",
  medium: "Primary Scene: {pageText}. Visual Components: {character} {age} with {hair}, {features} {subject} {action} with {emotion} {secondary_characters} with {colored_objects} in {setting} with {adjective} colors. Brand Suffix: {frameworkPrompt}",
  hard: "Primary Scene: {pageText}. Visual Components: {character} {age} with {hair}, {features} {subject} {action} with {emotion} {secondary_characters} with {colored_objects} in {setting} with {adjective} colors. Brand Suffix: {frameworkPrompt}",
  expert: "Primary Scene: {pageText}. Visual Components: {character} {age} with {hair}, {features} {subject} {action} with {emotion} {secondary_characters} with {colored_objects} in {setting} with {adjective} colors. Brand Suffix: {frameworkPrompt}"
};

// AFRICAN AMERICAN ARRAYS (Nuclear Independence - Combined Features Only)
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

const HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES = [
  "light brown skin tone with warm amber eyes, full lips, defined cheekbones, natural nose bridge",
  "caramel skin tone with deep brown eyes, soft full lips, high cheekbones, elegant nose shape",
  "honey complexion with hazel-green eyes, naturally full lips, sculpted cheekbones, refined nose",
  "warm beige skin with golden brown eyes, full expressive lips, defined facial structure, natural nose",
  "light caramel complexion with bright hazel eyes, full lips, prominent cheekbones, authentic nose shape",
  "medium brown skin tone with golden amber eyes, full lips, strong cheekbones, natural nose bridge",
  "cocoa skin tone with warm honey eyes, naturally full lips, defined cheekbones, elegant nose shape",
  "warm brown complexion with bright amber eyes, full expressive lips, sculpted cheekbones, refined nose",
  "chestnut skin tone with hazel-brown eyes, full lips, prominent cheekbones, authentic nose bridge",
  "amber skin tone with deep brown eyes, soft full lips, high cheekbones, natural nose shape",
  "deep brown skin tone with golden amber eyes, full lips, defined cheekbones, natural nose bridge",
  "rich chocolate complexion with warm honey eyes, naturally full lips, strong cheekbones, elegant nose",
  "mahogany skin tone with bright hazel eyes, full expressive lips, sculpted cheekbones, refined nose shape",
  "warm deep brown skin with golden brown eyes, full lips, prominent cheekbones, authentic nose bridge",
  "bronze skin tone with light amber eyes, soft full lips, high cheekbones, natural nose shape",
  "dark brown skin tone with golden amber eyes, full lips, defined cheekbones, natural nose bridge",
  "ebony skin tone with warm honey eyes, naturally full lips, strong cheekbones, elegant nose shape",
  "deep mahogany complexion with bright amber eyes, full expressive lips, sculpted cheekbones, refined nose",
  "rich dark chocolate skin with golden hazel eyes, full lips, prominent cheekbones, authentic nose bridge",
  "beautiful dark brown skin with light amber eyes, soft full lips, high cheekbones, natural nose shape"
];

const EXPANDED_COLOR_ARRAY = [
  'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white', 'brown', 'gray',
  'bright red', 'bright blue', 'bright green', 'bright yellow', 'bright orange', 'bright purple', 'bright pink',
  'vibrant red', 'vibrant blue', 'vibrant green', 'electric blue', 'neon green', 'hot pink', 'lime green',
  'light blue', 'light pink', 'light green', 'light yellow', 'soft blue', 'soft pink', 'soft purple',
  'pastel blue', 'pastel pink', 'pastel yellow', 'pale blue', 'pale green', 'pale yellow',
  'dark blue', 'dark green', 'dark red', 'dark purple', 'navy blue', 'forest green', 'burgundy',
  'silver', 'gold', 'metallic blue', 'shiny red', 'sparkly pink', 'glittery purple', 'rainbow',
  'sky blue', 'ocean blue', 'grass green', 'sunset orange', 'sunshine yellow', 'cherry red'
];

const CLOTHING_DETECTION_KEYWORDS = [
  'shirt', 'dress', 'shoes', 'hat', 'jacket', 'sweater', 'pants', 'jeans',
  'skirt', 'uniform', 'pajamas', 'coat', 'scarf', 'boots', 'sneakers',
  'hoodie', 'shorts', 'socks', 'blouse', 'tie', 'apron', 'gloves',
  'cap', 'helmet', 'vest', 'cardigan', 'blazer', 'overalls', 'romper',
  'tunic', 'polo', 'turtleneck', 'tank top', 'sandals', 'slippers',
  'belt', 'suspenders', 'bandana', 'headband', 'mittens', 'raincoat'
];

// ============= SEEDED RANDOM FOR CONSISTENT VARIETY =============
function getSeededRandomItem(array, seed) {
  if (!array || array.length === 0) return '';
  if (array.length === 1) return array[0];
  
  let hash = 0;
  const seedStr = String(seed || '');
  for (let i = 0; i < seedStr.length; i++) {
    hash = ((hash << 5) - hash + seedStr.charCodeAt(i)) & 0xffffffff;
  }
  
  const index = Math.abs(hash) % array.length;
  return array[index];
}

// Helper: Validate difficulty level and fallback
function validateDifficultyLevel(level) {
  if (!level || !NUCLEAR_STYLE_SETTINGS[level]) {
    return 'beginner';
  }
  return level;
}

// Helper: Extract exact words from text for consistency
function extractExactWords(text) {
  const extractor = new ExactWordExtractor();
  return extractor.extract(text);
}

// Helper: Track visual details for consistency
function trackVisualDetails(text, sessionId) {
  const tracker = VisualDetailTracker.getInstance(sessionId);
  tracker.updateFromText(text);
  return tracker.getCurrentDetails();
}

// Helper: Manage character consistency
function manageCharacterConsistency(text, sessionId) {
  const service = CharacterConsistencyService.getInstance(sessionId);
  service.updateFromText(text);
  return service.getCurrentCharacterState();
}

// ============= NUCLEAR AVATAR MAPPING FUNCTION =============
function getNuclearAvatarMapping(userInfo, sessionId, pageNumber) {
  try {
    const avatarType = userInfo?.avatar?.type || 'child';
    const skinTone = userInfo?.avatar?.skinTone || 'medium';
    const difficulty = userInfo?.difficulty || 'beginner';
    
    let character = avatarType;
    let features = '';
    let hair = '';
    
    if (skinTone.includes('dark') || skinTone.includes('brown')) {
      const gender = avatarType === 'girl' ? 'girls' : 'boys';
      
      if (HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES[gender]) {
        const seed = sessionId + pageNumber + gender;
        hair = getSeededRandomItem(HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES[gender], seed);
      }
      
      const featureSeed = sessionId + pageNumber + 'features';
      features = getSeededRandomItem(HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES, featureSeed);
    }
    
    return {
      character,
      features,
      hair,
      age: getAgeFromDifficulty(difficulty),
      ethnicity: getCharacterEthnicity(userInfo)
    };
    
  } catch (error) {
    console.warn('⚠️ Avatar mapping error:', error);
    return {
      character: 'child',
      features: 'friendly features',
      hair: 'natural hair',
      age: 'age 8-10',
      ethnicity: ''
    };
  }
}

// ============= CHARACTER ETHNICITY DETERMINATION =============
function getCharacterEthnicity(userInfo) {
  try {
    const language = userInfo?.language || 'en';
    const skinTone = userInfo?.avatar?.skinTone || '';
    
    const hasDarkSkin = skinTone.toLowerCase().includes('dark') || 
                       skinTone.toLowerCase().includes('brown') ||
                       skinTone.toLowerCase().includes('black') ||
                       skinTone.toLowerCase().includes('ebony') ||
                       skinTone.toLowerCase().includes('chocolate');
    
    if (hasDarkSkin) {
      if (language === 'es' || language === 'spanish') {
        return "depict character from Afro-Latino background";
      }
      if (language === 'fr' || language === 'french') {
        return "depict character from African Francophone background";
      }
      return "depict character from African American background";
    }
    
    if (language === 'es' || language === 'spanish') {
      return "depict character from Spanish/Latino background";
    }
    
    if (language === 'fr' || language === 'french') {
      return "depict character from European background";
    }
    
    if (language === 'zh' || language === 'chinese') {
      return "depict character from Asian background";
    }
    
    if (language === 'hi' || language === 'hindi') {
      return "child of Indian origin";
    }
    
    if (language === 'ar' || language === 'arabic') {
      return "depict character from Middle Eastern background";
    }
    
    if (language === 'pt' || language === 'portuguese') {
      return "depict character from Latin American background";
    }
    
    return "";
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Character ethnicity detection error:', error);
    return "";
  }
}

function getAgeFromDifficulty(difficulty) {
  const ageMap = {
    'beginner': 'age 5-6',
    'easy': 'age 7-8', 
    'medium': 'age 9-10',
    'hard': 'age 11-12',
    'expert': 'age 13-14'
  };
  return ageMap[difficulty] || 'age 9-10';
}

function extractSceneFromSentence(sentence, originalPageText, pageNumber, sessionId) {
  try {
    const lowerSentence = sentence.toLowerCase();
    
    const actionMappings = {
      'walk': 'taking a peaceful walk',
      'run': 'running energetically', 
      'play': 'playing joyfully',
      'jump': 'jumping with excitement',
      'laugh': 'laughing with pure delight',
      'smile': 'smiling warmly',
      'look': 'looking with curiosity',
      'sit': 'sitting comfortably',
      'stand': 'standing confidently',
      'dance': 'dancing with rhythm',
      'sing': 'singing melodiously',
      'read': 'reading with focus',
      'write': 'writing carefully',
      'draw': 'drawing creatively',
      'paint': 'painting artistically'
    };
    
    for (const [action, description] of Object.entries(actionMappings)) {
      if (lowerSentence.includes(action)) {
        return description;
      }
    }
    
    if (sentence.length > 20) {
      return 'enjoying a delightful moment';
    }
    
    return 'in a cheerful scene';
    
  } catch (error) {
    console.warn('⚠️ Scene extraction error:', error);
    return 'enjoying a wonderful moment';
  }
}

function extractSettingFromSentence(sentence, originalPageText, previousSetting) {
  try {
    const lowerSentence = (sentence + ' ' + (originalPageText || '')).toLowerCase();
    
    const settingMappings = {
      'room': ' a cozy indoor room with comfortable space',
      'house': ' a welcoming family house with homey atmosphere', 
      'playground': ' a fun colorful playground with exciting equipment',
      'school': ' a bright modern school with learning areas',
      'library': ' a quiet peaceful library with rows of books',
      'kitchen': ' a warm inviting kitchen with cooking areas',
      'bedroom': ' a comfortable personal bedroom with cozy furnishings',
      'garden': ' a beautiful blooming garden with colorful flowers',
      'park': ' a vibrant community park with green spaces',
      'store': ' a friendly neighborhood store with interesting items',
      'hill': ' a scenic hill landscape with natural slopes',
      'valley': ' a peaceful valley with rolling meadows',
      'pond': ' a tranquil pond with clear water',
      'beach': ' a sunny sandy beach with ocean waves',
      'forest': ' a magical green forest with tall trees'
    };
    
    for (const [setting, description] of Object.entries(settingMappings)) {
      if (lowerSentence.includes(setting)) {
        return description;
      }
    }
    
    const indoorKeywords = ['inside', 'indoors', 'room', 'house', 'home', 'building', 'kitchen', 'bedroom', 'school', 'classroom'];
    const outdoorKeywords = ['outside', 'outdoors', 'park', 'playground', 'garden', 'yard', 'forest', 'beach', 'field'];
    
    let isIndoor = false;
    let isOutdoor = false;
    
    for (const keyword of indoorKeywords) {
      if (lowerSentence.includes(keyword)) {
        isIndoor = true;
        break;
      }
    }
    
    if (!isIndoor) {
      for (const keyword of outdoorKeywords) {
        if (lowerSentence.includes(keyword)) {
          isOutdoor = true;
          break;
        }
      }
    }
    
    if (isIndoor) {
      return ' a comfortable indoor space with cozy atmosphere';
    } else if (isOutdoor) {
      return ' a beautiful outdoor setting with natural environment';
    }
    
    if (previousSetting && previousSetting.trim().length > 0) {
      console.log('🛡️ Tier 2.5: Using previous setting memory:', previousSetting);
      return previousSetting;
    }
    
    return ' indoor portrait style photo with main character focus';
  } catch (error) {
    console.warn('⚠️ Setting extraction error:', error);
    return previousSetting || ' a welcoming colorful environment';
  }
}

function extractEmotionFromSentence(sentence, originalPageText) {
  try {
    const text = (sentence + ' ' + (originalPageText || '')).toLowerCase();
    
    const emotionMappings = {
      'happy': ['happy', 'joy', 'delight', 'cheer', 'glad', 'pleased'],
      'excited': ['excited', 'thrilled', 'enthusiastic', 'eager', 'energetic'],
      'curious': ['curious', 'wonder', 'interest', 'explore', 'discover'],
      'peaceful': ['calm', 'peaceful', 'serene', 'relaxed', 'comfortable'],
      'surprised': ['surprised', 'amazed', 'astonished', 'shocked'],
      'focused': ['focused', 'concentrated', 'attentive', 'careful'],
      'loving': ['love', 'affection', 'tender', 'caring', 'gentle']
    };
    
    for (const [emotion, keywords] of Object.entries(emotionMappings)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          return `with ${emotion} expression`;
        }
      }
    }
    
    return 'with cheerful expression';
    
  } catch (error) {
    console.warn('⚠️ Emotion extraction error:', error);
    return 'with happy expression';
  }
}

function extractObjectsFromSentence(sentence, originalPageText, pageNumber, sessionId) {
  const lowerSentence = sentence.toLowerCase();
  
  const objects = [
    'ball', 'toy', 'book', 'flower', 'tree', 'car', 'bike', 'swing', 'slide',
    'kite', 'doll', 'puzzle', 'game', 'crayon', 'marker', 'rock', 'stick', 
    'leaf', 'shell', 'butterfly', 'bird', 'dog', 'cat', 'rabbit'
  ];
  
  const detectedObjects = [];
  
  for (const obj of objects) {
    if (lowerSentence.includes(obj)) {
      detectedObjects.push(obj);
    }
  }
  
  if (detectedObjects.length > 0) {
    return detectedObjects.join(', ');
  }
  
  return 'interesting colorful items';
}

function detectClothingFromStory(text) {
  if (!text) return '';
  
  const lowerText = text.toLowerCase();
  
  const dynamicClothingColor = detectAndResolveClothingColor(text);
  if (dynamicClothingColor) {
    return dynamicClothingColor;
  }
  
  for (const keyword of CLOTHING_DETECTION_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      const sentences = text.split(/[.!?]+/);
      for (const sentence of sentences) {
        if (sentence.toLowerCase().includes(keyword)) {
          const randomColor = EXPANDED_COLOR_ARRAY[Math.floor(Math.random() * EXPANDED_COLOR_ARRAY.length)];
          return `a ${randomColor} ${keyword}`;
        }
      }
    }
  }
  
  return '';
}

function detectAndResolveClothingColor(text) {
  const lowerText = text.toLowerCase();
  let detectedClothing = '';
  let detectedColor = '';
  
  for (const clothing of CLOTHING_DETECTION_KEYWORDS) {
    if (lowerText.includes(clothing)) {
      detectedClothing = clothing;
      break;
    }
  }
  
  for (const color of EXPANDED_COLOR_ARRAY) {
    if (lowerText.includes(color)) {
      detectedColor = color;
      break;
    }
  }
  
  if (detectedClothing && detectedColor) {
    return `a ${detectedColor} ${detectedClothing}`;
  }
  
  if (detectedClothing) {
    return `a ${detectedClothing}`;
  }
  
  return '';
}

function extractAtmosphereContext(pageText, setting) {
  try {
    const text = (pageText + ' ' + setting).toLowerCase();
    
    if (text.includes('warm') || text.includes('cozy') || text.includes('comfort')) {
      return 'with warm, cozy atmosphere';
    }
    
    if (text.includes('bright') || text.includes('sunny') || text.includes('cheerful')) {
      return 'with bright, cheerful atmosphere';
    }
    
    if (text.includes('peaceful') || text.includes('calm') || text.includes('quiet')) {
      return 'with peaceful, serene atmosphere';
    }
    
    if (text.includes('exciting') || text.includes('fun') || text.includes('energetic')) {
      return 'with exciting, energetic atmosphere';
    }
    
    if (text.includes('magical') || text.includes('wonder') || text.includes('amazing')) {
      return 'with magical, wonderful atmosphere';
    }
    
    return 'with welcoming, inviting atmosphere';
    
  } catch (error) {
    console.warn('⚠️ Atmosphere extraction error:', error);
    return 'with pleasant atmosphere';
  }
}

function generateSpatialComposition(pageText, scene, setting) {
  try {
    const text = (pageText + ' ' + scene + ' ' + setting).toLowerCase();
    
    if (text.includes('close') || text.includes('near') || text.includes('together')) {
      return 'character prominently featured in intimate foreground with close perspective';
    }
    
    if (text.includes('far') || text.includes('distance') || text.includes('wide')) {
      return 'character positioned in expansive environmental context with wide perspective';
    }
    
    if (text.includes('center') || text.includes('middle') || text.includes('focus')) {
      return 'character centrally positioned with balanced compositional focus';
    }
    
    if (text.includes('left') || text.includes('right') || text.includes('side')) {
      return 'character positioned with dynamic asymmetrical composition';
    }
    
    return 'character prominently featured in foreground with engaging composition';
    
  } catch (error) {
    console.warn('⚠️ Spatial composition error:', error);
    return 'character prominently featured in foreground';
  }
}

async function extractSecondaryCharactersFromSentence(sentence, sessionId, pageNumber) {
  try {
    const lowerSentence = sentence.toLowerCase();
    
    const familyMembers = {
      'mom': 'caring mother nearby',
      'dad': 'supportive father nearby', 
      'mother': 'loving mother nearby',
      'father': 'kind father nearby',
      'sister': 'playful sister nearby',
      'brother': 'fun brother nearby',
      'friend': 'cheerful friend nearby',
      'friends': 'happy friends nearby'
    };
    
    const detectedCharacters = [];
    
    for (const [keyword, description] of Object.entries(familyMembers)) {
      if (lowerSentence.includes(keyword)) {
        detectedCharacters.push(description);
      }
    }
    
    const animals = ['dog', 'cat', 'pet', 'puppy', 'kitten'];
    for (const animal of animals) {
      if (lowerSentence.includes(animal)) {
        detectedCharacters.push(`friendly ${animal} companion`);
      }
    }
    
    if (detectedCharacters.length > 0) {
      return detectedCharacters.slice(0, 2).join(', ');
    }
    
    return '';
    
  } catch (error) {
    console.warn('⚠️ Secondary character extraction error:', error);
    return '';
  }
}

function extractCommunityContext(pageText, setting) {
  try {
    const text = (pageText + ' ' + setting).toLowerCase();
    
    if (text.match(/festival|celebration|party|gathering/)) {
      return ' gathered together for a vibrant community celebration';
    }
    
    if (text.match(/market|fair|bazaar|vendor/)) {
      return ' exploring together at a colorful community market';
    }
    
    if (text.match(/library|community center|hall|building/)) {
      return ' gathered together in a welcoming community space';
    }
    
    if (text.match(/park|playground|garden|outdoor/)) {
      return ' playing together in a shared community area';
    }
    
    if (text.match(/school|classroom|cafeteria|educational/)) {
      return ' learning together in an educational community setting';
    }
    
    if (text.match(/friend|classmate|neighbor|peer/)) {
      return ' connecting with community friends';
    }
    
    if (text.match(/sport|game|play|activity|exercise/)) {
      return ' playing together in community activities';
    }
    
    return '';
    
  } catch (error) {
    console.warn('⚠️ Community context extraction failed:', error);
    return '';
  }
}

function extractSensoryDetails(pageText, scene) {
  try {
    const text = (pageText + ' ' + scene).toLowerCase();
    
    let sensoryLayers = [];
    
    if (text.match(/laugh|giggle|cheer|happy|joy|delight/)) {
      sensoryLayers.push('with melodious laughter');
    }
    
    if (text.match(/music|song|singing|melody|rhythm|harmony/)) {
      sensoryLayers.push('with harmonious melodies');
    }
    
    if (text.match(/birds|chirp|nature|outdoor|forest|garden/)) {
      sensoryLayers.push('with chirping birds');
    }
    
    if (text.match(/water|stream|splash|ocean|rain|fountain/)) {
      sensoryLayers.push('with gentle water sounds');
    }
    
    if (text.match(/soft|smooth|fluffy|silky|gentle|comfortable/)) {
      sensoryLayers.push('featuring silky smooth surfaces');
    }
    
    if (text.match(/warm|cozy|welcoming|inviting|embracing/)) {
      sensoryLayers.push('featuring warming tactile comfort');
    }
    
    if (text.match(/flower|garden|bloom|botanical|floral|petal/)) {
      sensoryLayers.push('enhanced by garden bloom fragrances');
    }
    
    if (text.match(/food|cooking|baking|kitchen|meal|delicious/)) {
      sensoryLayers.push('enhanced by appetizing food aromas');
    }
    
    if (sensoryLayers.length > 1) {
      return ` ${sensoryLayers.slice(0, 2).join(' and ')}`;
    } else if (sensoryLayers.length === 1) {
      return ` ${sensoryLayers[0]}`;
    }
    
    return '';
    
  } catch (error) {
    console.warn('⚠️ Sensory details extraction failed:', error);
    return '';
  }
}

function enhanceNuclearMappingWithConsistency(avatarMapping, pageText, sessionId, pageNumber) {
  try {
    const consistentCharacter = manageCharacterConsistency(avatarMapping.character, sessionId);
    const visualDetails = trackVisualDetails(pageText, sessionId);
    
    return {
      ...avatarMapping,
      character: consistentCharacter,
      visualDetails: visualDetails
    };
    
  } catch (error) {
    console.warn('⚠️ Nuclear mapping enhancement error:', error);
    return avatarMapping;
  }
}

function fillTemplate(template, placeholders) {
  let filledTemplate = template;
  
  for (const [key, value] of Object.entries(placeholders)) {
    const placeholder = `{${key}}`;
    const replacement = value || '';
    filledTemplate = filledTemplate.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
  }
  
  return filledTemplate;
}

function getCameraDirective(pageText, difficulty) {
  const text = pageText.toLowerCase();
  
  const cameraDirectives = {
    portrait: [
      'close-up portrait composition', 'character-focused portrait style', 'portrait perspective with character emphasis',
      'intimate portrait framing', 'detailed portrait composition', 'main character portrait focus'
    ],
    environmental: [
      'environmental storytelling composition', 'wide scene composition', 'contextual environment framing',
      'narrative environment perspective', 'scenic composition with character integration', 'story setting composition'
    ],
    action: [
      'dynamic action composition', 'movement-focused framing', 'energetic scene composition', 
      'active scene perspective', 'motion-capturing composition', 'lively action framing'
    ],
    intimate: [
      'warm intimate composition', 'cozy scene framing', 'close personal perspective',
      'comfortable intimate framing', 'nurturing scene composition', 'gentle close-up perspective'
    ]
  };
  
  if (text.includes('close') || text.includes('face') || text.includes('look')) {
    return getSeededRandomItem(cameraDirectives.portrait, pageText);
  }
  
  if (text.includes('run') || text.includes('jump') || text.includes('play')) {
    return getSeededRandomItem(cameraDirectives.action, pageText);
  }
  
  if (text.includes('hug') || text.includes('love') || text.includes('comfort')) {
    return getSeededRandomItem(cameraDirectives.intimate, pageText);
  }
  
  return getSeededRandomItem(cameraDirectives.environmental, pageText);
}

async function generatePageTextPrompt(userInfo, pageText, sessionId, pageNumber, mode = 'premium') {
  try {
    console.log('🚀 Generating page text prompt:', { pageNumber, mode });
    
    const difficulty = validateDifficultyLevel(userInfo?.difficulty || 'beginner');
    
    const avatarMapping = getNuclearAvatarMapping(userInfo, sessionId, pageNumber);
    const enhancedMapping = enhanceNuclearMappingWithConsistency(avatarMapping, pageText, sessionId, pageNumber);
    
    const scene = extractSceneFromSentence(pageText, pageText, pageNumber, sessionId);
    const setting = extractSettingFromSentence(pageText, pageText, '');
    const emotion = extractEmotionFromSentence(pageText, pageText);
    const objects = extractObjectsFromSentence(pageText, pageText, pageNumber, sessionId);
    const clothing = detectClothingFromStory(pageText);
    
    const atmosphere = extractAtmosphereContext(pageText, setting);
    const spatialComposition = generateSpatialComposition(pageText, scene, setting);
    const secondaryCharacters = await extractSecondaryCharactersFromSentence(pageText, sessionId, pageNumber);
    const communityContext = extractCommunityContext(pageText, setting);
    const sensoryDetails = extractSensoryDetails(pageText, scene);
    
    const cameraDirective = getCameraDirective(pageText, difficulty);
    
    const styleSettings = NUCLEAR_STYLE_SETTINGS[difficulty];
    
    const template = mode === 'premium' ? PREMIUM_PROMPT_TEMPLATES[difficulty] : BASIC_PROMPT_TEMPLATES[difficulty];
    
    const placeholders = {
      frameworkPrompt: styleSettings.frameworkPrompt,
      cameraDirective: cameraDirective,
      pageText: pageText,
      character: enhancedMapping.character,
      age: enhancedMapping.age,
      ethnicity: enhancedMapping.ethnicity,
      hair: enhancedMapping.hair,
      features: enhancedMapping.features,
      emotion: emotion,
      scene: scene,
      action_intensity: 'moderate energy level',
      spatial_positioning: 'naturally positioned',
      object_interaction: objects ? `interacting with ${objects}` : '',
      body_language: 'natural body language',
      spatial_composition: spatialComposition,
      setting: setting,
      atmosphere: atmosphere,
      props: clothing || 'appropriate clothing',
      action_objects: objects,
      colored_objects: objects,
      sensory_details: sensoryDetails,
      community_context: communityContext,
      secondary_characters: secondaryCharacters,
      subject: enhancedMapping.character,
      action: scene,
      adjective: 'vibrant'
    };
    
    const finalPrompt = fillTemplate(template, placeholders);
    
    const culturalProfile = detectCulturalProfileForNegatives(userInfo);
    const negativePrompt = generateNuclearNegativePrompt(difficulty, culturalProfile);
    
    console.log('✅ Generated prompt successfully');
    
    return {
      success: true,
      prompt: finalPrompt,
      negativePrompt: negativePrompt,
      CFGScale: styleSettings.CFGScale,
      steps: styleSettings.steps,
      model: 'runware:100@1',
      outputFormat: 'WEBP',
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      strength: 0.8
    };
    
  } catch (error) {
    console.error('🚨 Error in generatePageTextPrompt:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}

// Core function to generate page text with nuclear negative prompt system
async function rawPageText(userInfo, pageText, sessionId, pageNumber, mode) {
  try {
    const difficulty = validateDifficultyLevel(userInfo?.difficulty || mode);

    // Generate nuclear negative prompt based on cultural profile
    const culturalProfile = detectCulturalProfileForNegatives(userInfo);
    const negativePrompt = generateNuclearNegativePrompt(culturalProfile);

    // Extract exact words for consistency
    const exactWords = extractExactWords(pageText);

    // Track visual details for consistency
    const visualDetails = trackVisualDetails(pageText, sessionId);

    // Manage character consistency
    const characterState = manageCharacterConsistency(pageText, sessionId);

    // Generate the complete prompt
    const result = await generatePageTextPrompt(userInfo, pageText, sessionId, pageNumber, mode);

    if (!result.success) {
      return createCorsErrorResponse(result.error, 500);
    }

    // Save session state for continuity
    globalArcSessionManager.saveSession(sessionId, {
      lastPageText: pageText,
      difficulty,
      visualDetails,
      characterState,
      exactWords
    });

    return createCorsResponse(result);
    
  } catch (error) {
    console.error('🚨 Tier 2.5 Nuclear Independence: Error in rawPageText:', error);
    return createCorsErrorResponse(error.message || 'Unknown error occurred', 500);
  }
}

// Main serve function
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  try {
    const { userInfo, pageText, sessionId, pageNumber, mode } = await req.json();
    
    console.log('🛡️ Tier 2.5 Nuclear Independence: Processing request');
    console.log('📊 Request data - UserInfo:', !!userInfo, 'PageText:', !!pageText, 'SessionId:', !!sessionId);
    
    const result = await rawPageText(userInfo, pageText, sessionId, pageNumber, mode);
    return result;
    
  } catch (error) {
    console.error('❌ Serve function error:', error);
    return createCorsErrorResponse(error.message || 'Request processing failed', 400);
  }
});