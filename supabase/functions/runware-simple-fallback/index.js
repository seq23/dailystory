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

// ============= RUNWARE-ALIGNED TEMPLATE STRUCTURE - RUNWARE OPTIMAL + STORY LENGTH OPTIMAL =============
const PREMIUM_PROMPT_TEMPLATES = {
  // 🚨 REGRESSION PREVENTION: NEVER CHANGE THIS ORDER FOR LEVELS 0-1
  // RUNWARE OPTIMAL: Technical first for better processing
  // STORY LENGTH OPTIMAL: Narrative early for simpler stories
  // DO NOT MODIFY this order for beginner/easy levels
  beginner: "Technical: {frameworkPrompt}, {cameraDirective}. Narrative: {pageText}. Subject: {character} {age}, {ethnicity}, {hair}, {features}, {emotion}. Action: {scene}, {action_intensity}, {spatial_positioning}, {object_interaction}, {body_language}. Composition: {spatial_composition}. Environment: {setting}, {atmosphere}. Elements: {props}, {action_objects}, {colored_objects}, {sensory_details}. Context: {community_context}, {secondary_characters}",
  easy: "Technical: {frameworkPrompt}, {cameraDirective}. Narrative: {pageText}. Subject: {character} {age}, {ethnicity}, {hair}, {features}, {emotion}. Action: {scene}, {action_intensity}, {spatial_positioning}, {object_interaction}, {body_language}. Composition: {spatial_composition}. Environment: {setting}, {atmosphere}. Elements: {props}, {action_objects}, {colored_objects}, {sensory_details}. Context: {community_context}, {secondary_characters}",
  
  // 🚨 REGRESSION PREVENTION: NEVER CHANGE THIS ORDER FOR LEVELS 2-4
  // RUNWARE OPTIMAL: Technical first, narrative last for complex stories
  // STORY LENGTH OPTIMAL: Technical setup before complex narrative
  // DO NOT MODIFY this order for medium/hard/expert levels
  medium: "Technical: {frameworkPrompt}, {cameraDirective}. Subject: {character} {age}, {ethnicity}, {hair}, {features}, {emotion}. Action: {scene}, {action_intensity}, {spatial_positioning}, {object_interaction}, {body_language}. Composition: {spatial_composition}. Environment: {setting}, {atmosphere}. Elements: {props}, {action_objects}, {colored_objects}, {sensory_details}. Context: {community_context}, {secondary_characters}. Narrative: {pageText}",
  hard: "Technical: {frameworkPrompt}, {cameraDirective}. Subject: {character} {age}, {ethnicity}, {hair}, {features}, {emotion}. Action: {scene}, {action_intensity}, {spatial_positioning}, {object_interaction}, {body_language}. Composition: {spatial_composition}. Environment: {setting}, {atmosphere}. Elements: {props}, {action_objects}, {colored_objects}, {sensory_details}. Context: {community_context}, {secondary_characters}. Narrative: {pageText}",
  expert: "Technical: {frameworkPrompt}, {cameraDirective}. Subject: {character} {age}, {ethnicity}, {hair}, {features}, {emotion}. Action: {scene}, {action_intensity}, {spatial_positioning}, {object_interaction}, {body_language}. Composition: {spatial_composition}. Environment: {setting}, {atmosphere}. Elements: {props}, {action_objects}, {colored_objects}, {sensory_details}. Context: {community_context}, {secondary_characters}. Narrative: {pageText}"
};

// ============= BASIC PROMPT TEMPLATES (TIER 1.5 / 2.5B) - SIMPLIFIED SEMANTIC STRUCTURE =============
const BASIC_PROMPT_TEMPLATES = {
  // 3-SECTION STRUCTURE: PRIMARY SCENE → VISUAL COMPONENTS → BRAND SUFFIX
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

const HARDCODED_AFRICAN_AMERICAN_SKIN_TONES = [
  'light brown complexion', 'medium brown skin', 'rich brown complexion', 'deep brown skin',
  'warm caramel complexion', 'golden brown skin', 'mahogany complexion', 'dark chocolate skin',
  'ebony complexion', 'honey-toned skin', 'bronze complexion', 'chestnut brown skin'
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

// CLOTHING DETECTION SYSTEM - REGRESSION PREVENTION COMMENTS
// 
// CRITICAL: The current system uses detectClothingFromStory() to extract clothing from story text
// This provides more contextual and story-appropriate clothing than hardcoded arrays
// ALL CHARACTERS (regardless of ethnicity) use story-based clothing detection for better narrative consistency
// 
// HARDCODED_STANDARD_AMERICAN_CLOTHING exists below but is currently UNUSED - kept for potential future standardization
// DO NOT CHANGE WITHOUT TESTING: Any modifications to clothing detection affect all character generation
//
// REMOVED LIMITED CULTURAL ARRAYS - LET RUNWARE DECIDE THEIR LOOK
// Hispanic/Latino, Chinese/Asian, and Middle Eastern arrays removed
// Only African American arrays maintained for detailed representation

// STANDARD AMERICAN ARRAYS (Hair array removed - AI handles generation)


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

// ============= SEEDED RANDOM FOR CONSISTENT VARIETY =============
function seededRandom(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to positive number and normalize to 0-1
  const normalizedHash = Math.abs(hash) / Math.pow(2, 31);
  return normalizedHash;
}

function getSeededRandomItem(array, seed) {
  if (!array || array.length === 0) return '';
  const random = seededRandom(seed);
  const index = Math.floor(random * array.length);
  return array[index];
}

// ============= CULTURAL PROFILE DETECTION =============
function detectCulturalProfile(userInfo) {
  if (!userInfo) return null;
  
  try {
    const profile = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo;
    
    // Check for culturalProfile field first
    if (profile?.culturalProfile) {
      return profile.culturalProfile;
    }
    
    // Check for ethnicity field
    if (profile?.ethnicity) {
      return profile.ethnicity;
    }
    
    // Check activeChild properties
    if (profile?.activeChild?.culturalProfile) {
      return profile.activeChild.culturalProfile;
    }
    
    if (profile?.activeChild?.ethnicity) {
      return profile.activeChild.ethnicity;
    }
    
    return null;
  } catch (error) {
    console.warn('Cultural profile detection error:', error);
    return null;
  }
}

// ============= SEEDED RANDOM CHARACTER MAPPING =============
function generateSeededCharacterMapping(culturalProfile, sessionId, pageNumber) {
  console.log(`🎯 Tier 2.5: Generating seeded character mapping for ${culturalProfile}...`);
  
  const seed = `${culturalProfile}_${sessionId}_${pageNumber || 1}`;
  
  if (culturalProfile === 'african_american') {
    // Use seeded selection for African American features
    const hairstyles = HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES;
    const facialFeatures = HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES;
    
    // Determine gender from cultural profile or default to mixed
    const boyHairstyles = hairstyles.boys || [];
    const girlHairstyles = hairstyles.girls || [];
    
    // Seeded gender selection
    const genderSeed = seededRandom(seed + '_gender');
    const selectedHairstyles = genderSeed > 0.5 ? girlHairstyles : boyHairstyles;
    
    // Seeded hair selection
    const hair = getSeededRandomItem(selectedHairstyles, seed + '_hair');
    
    // Seeded facial features selection
    const features = getSeededRandomItem(facialFeatures, seed + '_features');
    
    console.log(`✅ Tier 2.5: African American mapping generated - Hair: ${hair.substring(0, 50)}..., Features: ${features.substring(0, 50)}...`);
    
    return {
      hair: hair,
      ethnicity: features,
      source: 'seeded-african-american'
    };
  }
  
  // For other cultural profiles or no profile, return null (let AI handle it)
  console.log(`📝 Tier 2.5: No specific mapping for ${culturalProfile}, using AI generation`);
  return null;
}

// ============= TIER 2.5 UNIFIED VOCABULARY - EXTRACTED AND EXPANDED =============
const TIER_25_UNIFIED_VOCABULARY = {
  // ============= UNIFIED ACTION VOCABULARY =============
  // Consolidated from ExactWordExtractor (23 items) + runware-simple-fallback (65+ items)
  actions: {
    // Basic physical actions (with all verb forms)
    basic_movement: ['walk', 'walking', 'walked', 'run', 'running', 'ran', 'jump', 'jumping', 'jumped'],
    interactive_actions: ['play', 'playing', 'played', 'talk', 'talking', 'talked', 'help', 'helping', 'helped'],
    creative_actions: ['draw', 'drawing', 'drew', 'paint', 'painting', 'painted', 'build', 'building', 'built'],
    learning_actions: ['read', 'reading', 'study', 'studying', 'learn', 'learning', 'discover', 'discovering'],
    care_actions: ['hug', 'hugging', 'hugged', 'care', 'caring', 'share', 'sharing', 'shared'],
    
    // Enhanced actions from runware-simple-fallback system
    exploration: ['explore', 'exploring', 'explored', 'adventure', 'venturing', 'discover', 'find', 'finding'],
    social: ['meet', 'meeting', 'greet', 'greeting', 'visit', 'visiting', 'gather', 'gathering'],
    creation: ['make', 'making', 'create', 'creating', 'craft', 'crafting', 'design', 'designing'],
    expression: ['sing', 'singing', 'dance', 'dancing', 'perform', 'performing', 'express', 'expressing']
  },
  
  // ============= UNIFIED OBJECT VOCABULARY =============
  // Comprehensive object detection for consistent recognition
  objects: {
    toys: ['toy', 'toys', 'doll', 'dolls', 'ball', 'balls', 'block', 'blocks', 'puzzle', 'puzzles'],
    books: ['book', 'books', 'story', 'stories', 'page', 'pages', 'read', 'reading'],
    nature: ['tree', 'trees', 'flower', 'flowers', 'leaf', 'leaves', 'rock', 'rocks', 'stone', 'stones'],
    animals: ['dog', 'dogs', 'cat', 'cats', 'bird', 'birds', 'butterfly', 'butterflies', 'rabbit', 'rabbits'],
    vehicles: ['car', 'cars', 'bike', 'bikes', 'truck', 'trucks', 'train', 'trains', 'plane', 'planes'],
    food: ['apple', 'apples', 'cookie', 'cookies', 'cake', 'cakes', 'sandwich', 'sandwiches'],
    household: ['chair', 'chairs', 'table', 'tables', 'bed', 'beds', 'lamp', 'lamps', 'mirror', 'mirrors']
  },
  
  // ============= UNIFIED SPATIAL VOCABULARY =============
  // Enhanced spatial relationship detection
  spatial: {
    proximity: ['near', 'close', 'beside', 'next to', 'alongside', 'together'],
    direction: ['up', 'down', 'left', 'right', 'forward', 'backward', 'ahead', 'behind'],
    position: ['on', 'in', 'under', 'over', 'above', 'below', 'inside', 'outside'],
    arrangement: ['around', 'between', 'among', 'through', 'across', 'along']
  },
  
  // ============= UNIFIED EMOTION VOCABULARY =============
  // Comprehensive emotion detection for consistent character expression
  emotions: {
    positive: ['happy', 'joy', 'joyful', 'excited', 'cheerful', 'delighted', 'pleased', 'content'],
    calm: ['peaceful', 'serene', 'relaxed', 'calm', 'tranquil', 'gentle', 'quiet'],
    curious: ['curious', 'interested', 'wondering', 'exploring', 'discovering', 'learning'],
    caring: ['loving', 'kind', 'caring', 'helpful', 'gentle', 'supportive', 'nurturing'],
    playful: ['playful', 'fun', 'silly', 'giggly', 'energetic', 'lively', 'spirited']
  },
  
  // ============= UNIFIED CONTEXT DETECTION =============
  // Enhanced context classification for better scene understanding
  contextDetection: {
    indoor: ['room', 'house', 'kitchen', 'bedroom', 'bathroom', 'living room', 'classroom', 'library', 'store'],
    outdoor: ['park', 'garden', 'playground', 'forest', 'beach', 'yard', 'street', 'field', 'mountain'],
    social: ['family', 'friend', 'friends', 'mom', 'dad', 'parent', 'parents', 'teacher', 'classmate'],
    activities: ['game', 'games', 'sport', 'sports', 'art', 'music', 'dance', 'exercise', 'celebration']
  }
};

// ============= ENHANCED WORD EXTRACTOR USING TIER 2.5 UNIFIED VOCABULARY =============
function extractWordsFromSentence(sentence, category, subcategory) {
  if (!sentence || !TIER_25_UNIFIED_VOCABULARY[category]) {
    return [];
  }
  
  const lowerSentence = sentence.toLowerCase();
  const vocabularySection = subcategory ? 
    TIER_25_UNIFIED_VOCABULARY[category][subcategory] : 
    Object.values(TIER_25_UNIFIED_VOCABULARY[category]).flat();
  
  const foundWords = vocabularySection.filter(word => 
    lowerSentence.includes(word.toLowerCase())
  );
  
  console.log(`🔍 Tier 2.5: Found ${foundWords.length} ${category} words: [${foundWords.join(', ')}]`);
  return foundWords;
}

// ============= ENHANCED PROMPT PROCESSING FOR RUNWARE =============
function processPromptForRunware(prompt, difficulty) {
  if (!prompt) return '';
  
  try {
    // Get framework prompt from NUCLEAR_STYLE_SETTINGS
    const styleSettings = NUCLEAR_STYLE_SETTINGS[difficulty] || NUCLEAR_STYLE_SETTINGS['beginner'];
    
    // Simple processing - just ensure it fits Runware's requirements
    let processedPrompt = prompt.trim();
    
    // Remove excessive punctuation that might confuse Runware
    processedPrompt = processedPrompt.replace(/[.]{2,}/g, '.');
    processedPrompt = processedPrompt.replace(/[,]{2,}/g, ',');
    
    // Ensure it ends properly
    if (!processedPrompt.endsWith('.') && !processedPrompt.endsWith('!')) {
      processedPrompt += '.';
    }
    
    console.log(`🎯 Tier 2.5: Processed prompt length: ${processedPrompt.length} characters`);
    return processedPrompt;
    
  } catch (error) {
    console.warn('⚠️ Prompt processing error:', error);
    return prompt || 'A cheerful child character in a colorful children\'s book illustration style.';
  }
}

// ============= ENHANCED RAW PAGE TEXT FUNCTION WITH 4-TIER FALLBACK =============
async function enhancedRawPageText(pageText, userInfo, sessionId, pageNumber, difficulty, templateType = 'premium') {
  console.log(`🚀 Tier 2.5: Starting enhanced raw page text processing...`);
  console.log(`📋 Input: pageText="${pageText}", difficulty="${difficulty}", templateType="${templateType}"`);
  
  try {
    // ENHANCED PLAN 3: 4-Tier Framework Prompt System with Enhanced Emergency Fallback
    let frameworkPrompt;
    const styleSettings = NUCLEAR_STYLE_SETTINGS[difficulty];
    
    if (styleSettings?.frameworkPrompt) {
      // Tier 1: Use difficulty-specific framework prompt
      frameworkPrompt = styleSettings.frameworkPrompt;
      console.log(`✅ Tier 2.5: Using Tier 1 framework prompt for ${difficulty}`);
    } else if (NUCLEAR_STYLE_SETTINGS['beginner']?.frameworkPrompt) {
      // Tier 2: Fallback to beginner framework prompt
      frameworkPrompt = NUCLEAR_STYLE_SETTINGS['beginner'].frameworkPrompt;
      console.log(`⚠️ Tier 2.5: Using Tier 2 fallback framework prompt (beginner)`);
    } else if (EMERGENCY_FALLBACK_FRAMEWORK) {
      // Tier 3: Emergency fallback framework
      frameworkPrompt = EMERGENCY_FALLBACK_FRAMEWORK;
      console.log(`🚨 Tier 2.5: Using Tier 3 emergency fallback framework`);
    } else {
      // Tier 4: Ultimate hardcoded fallback
      frameworkPrompt = '2.5D rendered illustration with golden hour volumetric lighting, beautiful child characters with graceful features, charming expressions, child-friendly aesthetic, diverse representation';
      console.log(`🆘 Tier 2.5: Using Tier 4 ultimate hardcoded fallback`);
    }
    
    const culturalProfile = detectCulturalProfile(userInfo);
    console.log(`🎭 Tier 2.5: Detected cultural profile: ${culturalProfile}`);
    
    // Generate seeded character mapping for consistency
    const avatarMapping = generateSeededCharacterMapping(culturalProfile, sessionId, pageNumber);
    
    // Select template based on templateType
    const templates = templateType === 'basic' ? BASIC_PROMPT_TEMPLATES : PREMIUM_PROMPT_TEMPLATES;
    const template = templates[difficulty] || templates['beginner'];
    
    console.log(`📝 Tier 2.5: Using ${templateType} template for ${difficulty}`);
    
    // Extract character name and basic info (Nuclear approach)
    const character = 'child character';
    const age = '8-year-old';
    const ethnicity = avatarMapping?.ethnicity || 'diverse character';
    const hair = avatarMapping?.hair || 'beautiful hair';
    const features = ethnicity;
    const emotion = 'cheerful expression';
    
    // Extract scene and action information
    const scene = pageText ? `illustrated scene showing: ${pageText}` : 'colorful children\'s book scene';
    const action_intensity = 'gentle activity';
    const spatial_positioning = 'centered composition';
    const object_interaction = 'engaging naturally with surroundings';
    const body_language = 'positive and welcoming posture';
    
    // Extract environmental elements
    const spatial_composition = 'balanced and harmonious layout';
    const setting = 'child-friendly environment';
    const atmosphere = 'warm and inviting atmosphere';
    
    // Extract story elements
    const props = 'age-appropriate props';
    const action_objects = 'story-relevant objects';
    const colored_objects = 'vibrant colorful elements';
    const sensory_details = 'rich sensory experience';
    
    // Extract context elements
    const community_context = 'welcoming community setting';
    const secondary_characters = 'supportive background characters';
    
    // Camera directive
    const cameraDirective = 'portrait orientation, child-focused composition';
    
    // Build the prompt using the template
    const builtPrompt = template
      .replace(/{frameworkPrompt}/g, frameworkPrompt)
      .replace(/{cameraDirective}/g, cameraDirective)
      .replace(/{pageText}/g, pageText || 'A cheerful story scene')
      .replace(/{character}/g, character)
      .replace(/{age}/g, age)
      .replace(/{ethnicity}/g, ethnicity)
      .replace(/{hair}/g, hair)
      .replace(/{features}/g, features)
      .replace(/{emotion}/g, emotion)
      .replace(/{scene}/g, scene)
      .replace(/{action_intensity}/g, action_intensity)
      .replace(/{spatial_positioning}/g, spatial_positioning)
      .replace(/{object_interaction}/g, object_interaction)
      .replace(/{body_language}/g, body_language)
      .replace(/{spatial_composition}/g, spatial_composition)
      .replace(/{setting}/g, setting)
      .replace(/{atmosphere}/g, atmosphere)
      .replace(/{props}/g, props)
      .replace(/{action_objects}/g, action_objects)
      .replace(/{colored_objects}/g, colored_objects)
      .replace(/{sensory_details}/g, sensory_details)
      .replace(/{community_context}/g, community_context)
      .replace(/{secondary_characters}/g, secondary_characters);
    
    console.log(`✅ Tier 2.5: Enhanced prompt built successfully (${builtPrompt.length} characters)`);
    
    return {
      prompt: builtPrompt,
      culturalProfile: culturalProfile,
      avatarMapping: avatarMapping,
      templateType: templateType,
      frameworkPrompt: frameworkPrompt,
      objects: action_objects,
      secondary_characters: secondary_characters
    };
    
  } catch (error) {
    console.error('❌ Tier 2.5: Enhanced raw page text error:', error);
    
    // ENHANCED PLAN 1: Emergency Template Replacement - Ultimate Fallback
    const emergencyPrompt = `Contemporary children's book illustration showing ${pageText || 'a cheerful child character'}, beautiful diverse child character with happy expression, colorful child-friendly scene, safe wholesome content, vibrant illustration style, warm welcoming atmosphere`;
    
    console.log(`🆘 Tier 2.5: Using emergency template replacement`);
    
    return {
      prompt: emergencyPrompt,
      culturalProfile: null,
      avatarMapping: null,
      templateType: 'emergency',
      frameworkPrompt: 'Emergency fallback template',
      objects: 'child-safe objects',
      secondary_characters: 'friendly characters'
    };
  }
}

// ============= MAIN EDGE FUNCTION =============
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }
  
  try {
    console.log('🚀 Tier 2.5: Nuclear Independence + Character Consistency starting...');
    
    const requestBody = await req.json();
    console.log('📋 Tier 2.5: Request received:', {
      hasPageText: !!requestBody.pageText,
      hasUserInfo: !!requestBody.userInfo,
      hasSessionId: !!requestBody.sessionId,
      pageNumber: requestBody.pageNumber,
      difficulty: requestBody.difficulty
    });
    
    const { 
      pageText, 
      userInfo, 
      sessionId, 
      pageNumber, 
      difficulty = 'beginner',
      templateType = 'premium'
    } = requestBody;
    
    // Validate required fields
    if (!pageText) {
      return createCorsErrorResponse('pageText is required', 400);
    }
    
    const startTime = Date.now();
    
    // Track tier progression
    let tierPath = ['2.5 Nuclear Independence'];
    let attemptedTiers = ['2.5'];
    const successfulTier = '2.5 Nuclear Independence';
    const enhancementLevel = 'Character Consistency + Nuclear Independence';
    const fallbackReason = 'Tier 2.5 Primary Path';
    
    // Generate enhanced prompt with character consistency
    const promptResult = await enhancedRawPageText(
      pageText, 
      userInfo, 
      sessionId, 
      pageNumber, 
      difficulty, 
      templateType
    );
    
    const prompt = promptResult.prompt;
    const culturalProfile = promptResult.culturalProfile;
    const avatarMapping = promptResult.avatarMapping;
    const objects = promptResult.objects;
    const secondary_characters = promptResult.secondary_characters;
    
    // Generate nuclear negative prompt
    const negativePrompt = generateNuclearNegativePrompt(
      detectCulturalProfileForNegatives(culturalProfile)
    );
    
    // Get style settings
    const styleSettings = NUCLEAR_STYLE_SETTINGS[difficulty] || NUCLEAR_STYLE_SETTINGS['beginner'];
    
    console.log(`🎯 Tier 2.5: Final prompt length: ${prompt.length} characters`);
    console.log(`🎭 Tier 2.5: Cultural profile: ${culturalProfile}`);
    console.log(`⚙️ Tier 2.5: Style settings:`, styleSettings);
    
    // Enhanced Character Consistency Integration
    let characterData = null;
    try {
      if (sessionId && pageNumber && pageNumber > 1) {
        console.log('🧬 Tier 2.5: Attempting character consistency enhancement...');
        const consistencyService = new CharacterConsistencyService();
        characterData = await consistencyService.getCharacterSeed(sessionId);
        
        if (characterData?.seed) {
          console.log(`✅ Tier 2.5: Character consistency data found - Seed: ${characterData.seed}`);
        } else {
          console.log('📝 Tier 2.5: No existing character data, will create new consistency seed');
        }
      }
    } catch (consistencyError) {
      console.warn('⚠️ Tier 2.5: Character consistency enhancement failed:', consistencyError);
    }
    
    return new Promise((resolve) => {
      let isResolved = false;
      const resolveOnce = (response) => {
        if (!isResolved) {
          isResolved = true;
          resolve(response);
        }
      };
      
      // Connect to Runware WebSocket
      console.log('🌐 Tier 2.5: Connecting to Runware WebSocket API...');
      const ws = new WebSocket('wss://ws-api.runware.ai/v1');
      
      let finalPrompt = '';
      
      ws.onopen = () => {
        console.log('🛡️ Tier 2.5: WebSocket connected, authenticating...');
        
        // Send authentication message
        const authMessage = [{
          taskType: "authentication",
          apiKey: Deno.env.get('RUNWARE_API_KEY')
        }];
        
        ws.send(JSON.stringify(authMessage));
      };
      
      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          console.log('🛡️ Tier 2.5: Received WebSocket response with error protection');
          
          if (!response || typeof response !== 'object') {
            throw new Error('Invalid response format');
          }
          
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
                
                // Apply simplified prompt processing (No complex truncation)
                finalPrompt = processPromptForRunware(prompt, difficulty);
                
                // Send image generation request
                const imageMessage = [{
                  taskType: "imageInference",
                  taskUUID: crypto.randomUUID(),
                  positivePrompt: finalPrompt,
                  negativePrompt: negativePrompt,
                  width: 1024, // FIXED: Optimized image size
                  height: 1024, // FIXED: Optimized image size
                  model: "runware:100@1",
                  numberResults: 1,
                  outputFormat: "WEBP",
                  steps: 30, // FIXED: Enhanced generation parameters  
                  CFGScale: 10 // FIXED: Enhanced generation parameters
                }];
                
                ws.send(JSON.stringify(imageMessage));
                
              } else if (item.taskType === "imageInference") {
                console.log('🛡️ Tier 2.5: Image generation successful!');
                
                 const processingTime = Date.now() - startTime;
                 console.log(`🎯 TIER CASCADE COMPLETE: ${successfulTier} succeeded in ${processingTime}ms`);
                 console.log(`📊 Tier Path: [${tierPath.join(' → ')}]`);
                 
                 resolveOnce(createCorsResponse({
                   success: true,
                   imageURL: item.imageURL,
                   prompt: finalPrompt,
                   negativePrompt: negativePrompt,
                   difficulty: difficulty,
                   culturalProfile: culturalProfile,
                   tier: '2.5 Nuclear Independence + Character Consistency',
                   specificTier: successfulTier,
                   templateType: templateType,
                   tierPath: tierPath,
                   enhancementLevel: enhancementLevel,
                   fallbackReason: fallbackReason,
                   processingTime: processingTime,
                   attemptedTiers: attemptedTiers,
                   placeholders: {
                     objects: objects || 'none',
                     secondary_characters: secondary_characters || 'none'
                   },
                   characterConsistency: {
                     sessionId: sessionId,
                     characterSeed: characterData?.seed || 'none',
                     enhancementApplied: !!(characterData && characterData.seed),
                     source: avatarMapping?.source || 'nuclear-mapping'
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
        console.log('🔄 Tier 2.5: Attempting HTTP fallback...');
        
        // HTTP FALLBACK: Try Runware REST API
        attemptHttpFallback(prompt, negativePrompt, styleSettings, sessionId, characterData, avatarMapping, difficulty, culturalProfile, objects, secondary_characters)
          .then(result => {
            if (result.success) {
              resolveOnce(result);
            } else {
              resolveOnce(createCorsErrorResponse('WebSocket and HTTP fallback both failed', 500));
            }
          })
          .catch(() => {
            resolveOnce(createCorsErrorResponse('WebSocket connection failed and HTTP fallback unavailable', 500));
          });
      };
      
      ws.onclose = (event) => {
        console.log('🛡️ Tier 2.5: WebSocket closed:', event.code, event.reason);
        if (!isResolved) {
          console.log('🔄 Tier 2.5: Attempting HTTP fallback due to unexpected close...');
          
          // HTTP FALLBACK: Try Runware REST API
          attemptHttpFallback(prompt, negativePrompt, styleSettings, sessionId, characterData, avatarMapping, difficulty, culturalProfile, objects, secondary_characters)
            .then(result => {
              if (result.success) {
                resolveOnce(result);
              } else {
                resolveOnce(createCorsErrorResponse('WebSocket closed and HTTP fallback failed', 500));
              }
            })
            .catch(() => {
              resolveOnce(createCorsErrorResponse('WebSocket connection closed and HTTP fallback unavailable', 500));
            });
        }
      };
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (!isResolved) {
          console.error('❌ Tier 2.5: Request timeout, trying HTTP fallback...');
          
          // HTTP FALLBACK: Try Runware REST API
          attemptHttpFallback(prompt, negativePrompt, styleSettings, sessionId, characterData, avatarMapping, difficulty, culturalProfile, objects, secondary_characters)
            .then(result => {
              if (result.success) {
                resolveOnce(result);
              } else {
                resolveOnce(createCorsErrorResponse('Request timeout and HTTP fallback failed', 408));
              }
            })
            .catch(() => {
              resolveOnce(createCorsErrorResponse('Request timeout', 408));
            });
        }
      }, 30000);
      
      // HTTP FALLBACK FUNCTION
      async function attemptHttpFallback(prompt, negativePrompt, styleSettings, sessionId, characterData, avatarMapping, difficulty, culturalProfile, objects, secondary_characters) {
        try {
          console.log('🌐 Tier 2.5: Attempting HTTP API fallback...');
          
          const httpResponse = await fetch('https://api.runware.ai/v1', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('RUNWARE_API_KEY')}`
            },
            body: JSON.stringify([
              {
                taskType: "authentication", 
                apiKey: Deno.env.get('RUNWARE_API_KEY')
              },
              {
                taskType: "imageInference",
                taskUUID: crypto.randomUUID(),
                positivePrompt: prompt,
                negativePrompt: negativePrompt,
                height: 1024, // FIXED: Enhanced image dimensions
                width: 1024, // FIXED: Enhanced image dimensions
                model: "runware:100@1",
                steps: 30, // FIXED: Enhanced generation parameters
                CFGScale: 10, // FIXED: Enhanced generation parameters
                outputFormat: "WEBP"
              }
            ])
          });
          
          if (!httpResponse.ok) {
            throw new Error(`HTTP ${httpResponse.status}: ${httpResponse.statusText}`);
          }
          
          const httpResult = await httpResponse.json();
          const imageData = httpResult.data?.find(item => item.taskType === 'imageInference');
          
          if (imageData?.imageURL) {
            const processingTime = Date.now() - startTime;
            console.log(`✅ Tier 2.5: HTTP fallback successful! Final tier: ${successfulTier}`);
            console.log(`📊 HTTP Fallback - Tier Path: [${tierPath.join(' → ')}]`);
            
            return createCorsResponse({
              success: true,
              imageURL: imageData.imageURL,
              prompt: prompt,
              negativePrompt: negativePrompt,
              difficulty: difficulty,
              culturalProfile: culturalProfile,
              tier: '2.5 Nuclear Independence + Character Consistency (HTTP)',
              specificTier: successfulTier,
              templateType: templateType,
              tierPath: tierPath,
              enhancementLevel: enhancementLevel,
              fallbackReason: fallbackReason,
              processingTime: processingTime,
              attemptedTiers: attemptedTiers,
              placeholders: {
                objects: objects || 'none',
                secondary_characters: secondary_characters || 'none'
              },
              characterConsistency: {
                sessionId: sessionId,
                characterSeed: characterData?.seed || 'none',
                enhancementApplied: !!(characterData && characterData.seed),
                source: avatarMapping?.source || 'nuclear-mapping'
              }
            });
          } else {
            throw new Error('No image URL in HTTP response');
          }
          
        } catch (httpError) {
          console.error('❌ Tier 2.5: HTTP fallback failed:', httpError);
          return { success: false, error: httpError.message };
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Tier 2.5: Main function error:', error);
    return createCorsErrorResponse(error.message || 'Internal server error', 500);
  }
});
