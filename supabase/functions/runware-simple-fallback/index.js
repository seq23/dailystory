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
function generateSeededRandom(seed) {
  // Simple seeded random using string hash
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Convert to 0-1 range
  return Math.abs(hash) / 2147483647;
}

function getSeededArrayElement(array, seed) {
  if (!array || array.length === 0) return '';
  const seededRandom = generateSeededRandom(seed);
  const index = Math.floor(seededRandom * array.length);
  return array[index];
}

// ============= ENHANCED SEEDED ETHNICITY FUNCTION =============
function getSeededEthnicity(pageText, sessionId, pageNumber = 1) {
  console.log(`🌍 Tier 2.5: Advanced seeded ethnicity selection - Session: ${sessionId}, Page: ${pageNumber}`);
  
  // Create composite seed from session and stable page context
  const compositeSeed = `${sessionId}_ethnicity_${pageNumber}`;
  const seededRandom = generateSeededRandom(compositeSeed);
  
  // TIER 2.5 NUCLEAR INDEPENDENCE - Enhanced ethnicity distribution
  // Balanced representation with slight over-representation of underrepresented groups
  const ethnicityPool = [
    // African American (25% - enhanced representation)
    'African American', 'African American', 'African American', 'African American', 'African American',
    
    // Standard American/Caucasian (35% - balanced)
    'Standard American', 'Standard American', 'Standard American', 'Standard American', 
    'Standard American', 'Standard American', 'Standard American',
    
    // Hispanic/Latino (20% - enhanced representation)
    'Hispanic/Latino', 'Hispanic/Latino', 'Hispanic/Latino', 'Hispanic/Latino',
    
    // Asian (12% - proportional)
    'Chinese/Asian', 'Chinese/Asian', 'Chinese/Asian',
    
    // Middle Eastern (8% - enhanced representation)
    'Middle Eastern', 'Middle Eastern'
  ];
  
  const selectedIndex = Math.floor(seededRandom * ethnicityPool.length);
  const selectedEthnicity = ethnicityPool[selectedIndex];
  
  console.log(`✅ Tier 2.5: Seeded ethnicity selected: ${selectedEthnicity} (seed: ${compositeSeed}, random: ${seededRandom.toFixed(3)})`);
  return selectedEthnicity;
}

// ============= ENHANCED SEEDED CHARACTER SELECTION FUNCTIONS =============
function getSeededCharacterName(pageText, sessionId, pageNumber = 1) {
  console.log(`👤 Tier 2.5: Advanced seeded character name selection - Session: ${sessionId}, Page: ${pageNumber}`);
  
  // Extract any character names from page text first (story-driven names take priority)
  const extractedNames = extractCharacterNamesFromPageText(pageText, sessionId);
  if (extractedNames.length > 0) {
    console.log(`📖 Tier 2.5: Story-driven character name found: ${extractedNames[0]}`);
    return extractedNames[0];
  }
  
  // Create composite seed for consistent character naming
  const compositeSeed = `${sessionId}_character_${pageNumber}`;
  
  // TIER 2.5 NUCLEAR INDEPENDENCE - Diverse character name pool
  const characterNames = [
    // Gender-neutral and diverse names
    'Alex', 'Maya', 'Jordan', 'Sam', 'Casey', 'Riley', 'Avery', 'Taylor', 'Morgan', 'Jamie',
    'Zara', 'Kai', 'Sage', 'River', 'Phoenix', 'Rowan', 'Skylar', 'Emery', 'Finley', 'Indigo',
    'Aria', 'Luna', 'Nova', 'Stella', 'Iris', 'Sage', 'Wren', 'Fern', 'Clover', 'Hazel',
    'Zion', 'Atlas', 'Orion', 'Jasper', 'Felix', 'Milo', 'Leo', 'Ezra', 'Asher', 'Theo'
  ];
  
  const selectedName = getSeededArrayElement(characterNames, compositeSeed);
  console.log(`✅ Tier 2.5: Seeded character name selected: ${selectedName} (seed: ${compositeSeed})`);
  return selectedName;
}

function getSeededAge(pageText, sessionId, pageNumber = 1) {
  console.log(`🎂 Tier 2.5: Advanced seeded age selection - Session: ${sessionId}, Page: ${pageNumber}`);
  
  // Create composite seed for age consistency
  const compositeSeed = `${sessionId}_age_${pageNumber}`;
  
  // TIER 2.5 NUCLEAR INDEPENDENCE - Child-appropriate age distribution
  const agePool = [
    '5 years old', '6 years old', '7 years old', '8 years old', '9 years old', '10 years old',
    '5 years old', '6 years old', '7 years old', '8 years old', // Weighted toward younger ages
    '11 years old', '12 years old'
  ];
  
  const selectedAge = getSeededArrayElement(agePool, compositeSeed);
  console.log(`✅ Tier 2.5: Seeded age selected: ${selectedAge} (seed: ${compositeSeed})`);
  return selectedAge;
}

function getSeededGender(pageText, sessionId, pageNumber = 1) {
  console.log(`⚧ Tier 2.5: Advanced seeded gender selection - Session: ${sessionId}, Page: ${pageNumber}`);
  
  // Extract gender hints from page text first
  const lowerText = pageText.toLowerCase();
  if (lowerText.includes(' he ') || lowerText.includes(' his ') || lowerText.includes(' him ') || lowerText.includes('boy')) {
    console.log(`📖 Tier 2.5: Story-driven gender detected: male`);
    return 'male';
  }
  if (lowerText.includes(' she ') || lowerText.includes(' her ') || lowerText.includes('girl')) {
    console.log(`📖 Tier 2.5: Story-driven gender detected: female`);
    return 'female';
  }
  
  // Create composite seed for gender consistency
  const compositeSeed = `${sessionId}_gender_${pageNumber}`;
  const seededRandom = generateSeededRandom(compositeSeed);
  
  // TIER 2.5 NUCLEAR INDEPENDENCE - Balanced gender distribution
  const selectedGender = seededRandom < 0.5 ? 'male' : 'female';
  console.log(`✅ Tier 2.5: Seeded gender selected: ${selectedGender} (seed: ${compositeSeed}, random: ${seededRandom.toFixed(3)})`);
  return selectedGender;
}

// ============= ENHANCED SEEDED HAIR AND FEATURES SELECTION =============
function getSeededAfricanAmericanHair(gender, sessionId, pageNumber = 1) {
  console.log(`💇 Tier 2.5: Advanced seeded African American hair selection - Gender: ${gender}, Session: ${sessionId}, Page: ${pageNumber}`);
  
  // Create composite seed for hair consistency
  const compositeSeed = `${sessionId}_aa_hair_${gender}_${pageNumber}`;
  
  const hairArray = gender === 'male' ? HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.boys : HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.girls;
  const selectedHair = getSeededArrayElement(hairArray, compositeSeed);
  
  console.log(`✅ Tier 2.5: Seeded African American hair selected: ${selectedHair} (seed: ${compositeSeed})`);
  return selectedHair;
}

function getSeededAfricanAmericanFeatures(sessionId, pageNumber = 1) {
  console.log(`👁 Tier 2.5: Advanced seeded African American features selection - Session: ${sessionId}, Page: ${pageNumber}`);
  
  // Create composite seed for features consistency
  const compositeSeed = `${sessionId}_aa_features_${pageNumber}`;
  
  const selectedFeatures = getSeededArrayElement(HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES, compositeSeed);
  console.log(`✅ Tier 2.5: Seeded African American features selected: ${selectedFeatures} (seed: ${compositeSeed})`);
  return selectedFeatures;
}

// ============= ENHANCED SEEDED EMOTION SELECTION =============
function getSeededEmotion(pageText, sessionId, pageNumber = 1) {
  console.log(`😊 Tier 2.5: Advanced seeded emotion selection - Session: ${sessionId}, Page: ${pageNumber}`);
  
  // Extract emotion hints from page text first
  const lowerText = pageText.toLowerCase();
  
  // Story-driven emotion detection (priority)
  if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('smile') || lowerText.includes('laugh')) {
    console.log(`📖 Tier 2.5: Story-driven emotion detected: happy and joyful`);
    return 'happy and joyful';
  }
  if (lowerText.includes('excited') || lowerText.includes('enthusiastic') || lowerText.includes('eager')) {
    console.log(`📖 Tier 2.5: Story-driven emotion detected: excited and enthusiastic`);
    return 'excited and enthusiastic';
  }
  if (lowerText.includes('curious') || lowerText.includes('wonder') || lowerText.includes('explore')) {
    console.log(`📖 Tier 2.5: Story-driven emotion detected: curious and wondering`);
    return 'curious and wondering';
  }
  if (lowerText.includes('calm') || lowerText.includes('peaceful') || lowerText.includes('serene')) {
    console.log(`📖 Tier 2.5: Story-driven emotion detected: calm and peaceful`);
    return 'calm and peaceful';
  }
  if (lowerText.includes('determined') || lowerText.includes('focused') || lowerText.includes('confident')) {
    console.log(`📖 Tier 2.5: Story-driven emotion detected: determined and confident`);
    return 'determined and confident';
  }
  
  // Create composite seed for emotion consistency
  const compositeSeed = `${sessionId}_emotion_${pageNumber}`;
  
  // TIER 2.5 NUCLEAR INDEPENDENCE - Positive emotion pool for children's stories
  const emotionPool = [
    'happy and joyful', 'excited and enthusiastic', 'curious and wondering', 'calm and peaceful',
    'determined and confident', 'cheerful and bright', 'content and satisfied', 'amazed and delighted',
    'playful and energetic', 'thoughtful and engaged', 'hopeful and optimistic', 'gentle and kind',
    'happy and joyful', 'excited and enthusiastic', // Weighted toward common positive emotions
    'curious and wondering', 'cheerful and bright'
  ];
  
  const selectedEmotion = getSeededArrayElement(emotionPool, compositeSeed);
  console.log(`✅ Tier 2.5: Seeded emotion selected: ${selectedEmotion} (seed: ${compositeSeed})`);
  return selectedEmotion;
}

// ============= CHARACTER NAME EXTRACTION FROM PAGE TEXT =============
function extractCharacterNamesFromPageText(pageText, sessionId) {
  console.log(`🔍 Tier 2.5: Character name extraction from page text - Processing: "${pageText}"`);
  
  const extractedNames = [];
  
  // Simple name pattern detection (capitalized words that are likely names)
  const words = pageText.split(/\s+/);
  const namePatterns = /^[A-Z][a-z]+$/; // Simple capitalized word pattern
  
  for (const word of words) {
    if (namePatterns.test(word)) {
      // Filter out common non-name capitalized words
      const nonNames = ['The', 'A', 'An', 'And', 'But', 'Or', 'So', 'Then', 'When', 'Where', 'What', 'Why', 'How', 'This', 'That', 'These', 'Those', 'I', 'You', 'He', 'She', 'It', 'We', 'They', 'My', 'Your', 'His', 'Her', 'Its', 'Our', 'Their'];
      
      if (!nonNames.includes(word) && word.length >= 3 && word.length <= 12) {
        extractedNames.push(word);
        console.log(`👤 Tier 2.5: Character name extracted from text: ${word}`);
        
        // Only extract first name found to maintain consistency
        break;
      }
    }
  }
  
  return extractedNames;
}

// ============= ENHANCED SEEDED SETTING SELECTION =============
function getSeededSetting(pageText, sessionId, pageNumber = 1) {
  console.log(`🏞 Tier 2.5: Advanced seeded setting selection - Session: ${sessionId}, Page: ${pageNumber}`);
  
  // Extract setting hints from page text first (story-driven settings take priority)
  const lowerText = pageText.toLowerCase();
  
  // Story-driven setting detection
  if (lowerText.includes('school') || lowerText.includes('classroom') || lowerText.includes('teacher')) {
    console.log(`📖 Tier 2.5: Story-driven setting detected: school classroom`);
    return 'school classroom';
  }
  if (lowerText.includes('home') || lowerText.includes('house') || lowerText.includes('room') || lowerText.includes('bed')) {
    console.log(`📖 Tier 2.5: Story-driven setting detected: cozy home`);
    return 'cozy home';
  }
  if (lowerText.includes('park') || lowerText.includes('playground') || lowerText.includes('outside') || lowerText.includes('garden')) {
    console.log(`📖 Tier 2.5: Story-driven setting detected: sunny park`);
    return 'sunny park';
  }
  if (lowerText.includes('library') || lowerText.includes('book') || lowerText.includes('read')) {
    console.log(`📖 Tier 2.5: Story-driven setting detected: quiet library`);
    return 'quiet library';
  }
  if (lowerText.includes('kitchen') || lowerText.includes('cook') || lowerText.includes('eat') || lowerText.includes('food')) {
    console.log(`📖 Tier 2.5: Story-driven setting detected: warm kitchen`);
    return 'warm kitchen';
  }
  
  // Create composite seed for setting consistency
  const compositeSeed = `${sessionId}_setting_${pageNumber}`;
  
  // TIER 2.5 NUCLEAR INDEPENDENCE - Child-appropriate setting pool
  const settingPool = [
    'cozy home', 'sunny park', 'school classroom', 'quiet library', 'warm kitchen',
    'backyard garden', 'neighborhood street', 'community center', 'local playground',
    'family living room', 'bedroom', 'art studio', 'music room', 'outdoor picnic area',
    'cozy home', 'sunny park', // Weighted toward common child-friendly settings
    'school classroom', 'backyard garden'
  ];
  
  const selectedSetting = getSeededArrayElement(settingPool, compositeSeed);
  console.log(`✅ Tier 2.5: Seeded setting selected: ${selectedSetting} (seed: ${compositeSeed})`);
  return selectedSetting;
}

// ============= ENHANCED SEEDED CLOTHING DETECTION =============
function detectClothingFromStory(pageText, ethnicity, gender, sessionId, pageNumber = 1) {
  console.log(`👕 Tier 2.5: Advanced seeded clothing detection - Ethnicity: ${ethnicity}, Gender: ${gender}, Session: ${sessionId}, Page: ${pageNumber}`);
  
  // Extract clothing hints from page text first (story-driven clothing takes priority)
  const lowerText = pageText.toLowerCase();
  
  // Story-driven clothing detection
  if (lowerText.includes('pajama') || lowerText.includes('nightgown') || lowerText.includes('sleep') || lowerText.includes('bed')) {
    const sleepwear = ['soft cotton pajamas', 'cozy flannel pajamas', 'comfortable nightgown', 'warm sleepwear'];
    const compositeSeed = `${sessionId}_sleepwear_${pageNumber}`;
    const selected = getSeededArrayElement(sleepwear, compositeSeed);
    console.log(`📖 Tier 2.5: Story-driven sleepwear detected: ${selected}`);
    return selected;
  }
  if (lowerText.includes('uniform') || lowerText.includes('school')) {
    const schoolWear = ['school uniform', 'neat school clothes', 'clean school outfit', 'proper school attire'];
    const compositeSeed = `${sessionId}_school_${pageNumber}`;
    const selected = getSeededArrayElement(schoolWear, compositeSeed);
    console.log(`📖 Tier 2.5: Story-driven school clothing detected: ${selected}`);
    return selected;
  }
  if (lowerText.includes('play') || lowerText.includes('game') || lowerText.includes('run') || lowerText.includes('active')) {
    const playWear = ['comfortable play clothes', 'casual playtime outfit', 'active wear', 'playground clothes'];
    const compositeSeed = `${sessionId}_play_${pageNumber}`;
    const selected = getSeededArrayElement(playWear, compositeSeed);
    console.log(`📖 Tier 2.5: Story-driven play clothing detected: ${selected}`);
    return selected;
  }
  
  // Create composite seed for clothing consistency
  const compositeSeed = `${sessionId}_clothing_${ethnicity}_${gender}_${pageNumber}`;
  
  // ALL ETHNICITIES use the standard American clothing array for consistency
  // This ensures cultural neutrality while maintaining story context
  const selectedClothing = getSeededArrayElement(HARDCODED_STANDARD_AMERICAN_CLOTHING, compositeSeed);
  console.log(`✅ Tier 2.5: Seeded clothing selected: ${selectedClothing} (seed: ${compositeSeed})`);
  return selectedClothing;
}

// ============= TIER 2.5 UNIFIED VOCABULARY SYSTEM =============
// Comprehensive vocabulary system for advanced scene processing
const TIER_25_UNIFIED_VOCABULARY = {
  // Core scene vocabulary for intelligent extraction
  scenes: {
    // Sleep/wake scenes
    sleep_wake: [
      'waking up in bed', 'stretching after sleep', 'yawning sleepily', 'rubbing eyes',
      'sitting up in bed', 'getting out of bed', 'morning routine', 'bedtime preparation'
    ],
    
    // Movement scenes  
    movement: [
      'walking confidently', 'strolling leisurely', 'running playfully', 'skipping happily',
      'stepping carefully', 'marching purposefully', 'dancing joyfully', 'moving gracefully'
    ],
    
    // Play scenes
    play: [
      'playing with toys', 'building blocks', 'drawing pictures', 'reading books',
      'playing games', 'having fun', 'exploring creatively', 'engaging in activities'
    ],
    
    // Learning scenes
    learning: [
      'studying diligently', 'reading attentively', 'writing carefully', 'thinking deeply',
      'discovering something new', 'asking questions', 'solving problems', 'practicing skills'
    ],
    
    // Social scenes
    social: [
      'talking with friends', 'sharing stories', 'laughing together', 'helping others',
      'working as a team', 'playing together', 'making new friends', 'showing kindness'
    ]
  },
  
  // Action vocabulary for enhanced scene description
  actions: {
    // Action intensity modifiers
    intensity: [
      'energetically', 'gently', 'carefully', 'boldly', 'quietly', 'confidently',
      'excitedly', 'peacefully', 'enthusiastically', 'thoughtfully', 'joyfully', 'calmly'
    ],
    
    // Body language vocabulary
    bodyLanguage: [
      'smiling brightly', 'standing tall', 'sitting cross-legged', 'hands on hips',
      'arms spread wide', 'head tilted thoughtfully', 'eyes sparkling with wonder',
      'hands raised in celebration', 'arms swinging naturally', 'body bouncing with joy',
      'stretching arms upward', 'rubbing eyes sleepily', 'yawning softly',
      'looking ahead confidently', 'hands in pockets', 'hands resting on lap'
    ],
    
    // Spatial positioning vocabulary  
    spatial: [
      'standing in the center', 'positioned in the foreground', 'sitting comfortably',
      'crouched down to play', 'kneeling on ground', 'lying peacefully',
      'moving forward confidently', 'stepping carefully', 'striding purposefully',
      'sitting up in bed', 'stretching in bed', 'positioned at desk',
      'seated for play', 'positioned playfully', 'sitting attentively'
    ]
  },
  
  // Environmental vocabulary for setting enhancement
  environment: {
    // Atmosphere descriptors
    atmosphere: [
      'warm and inviting', 'bright and cheerful', 'cozy and comfortable', 'peaceful and calm',
      'vibrant and energetic', 'soft and gentle', 'magical and wonder-filled', 'safe and nurturing'
    ],
    
    // Sensory details
    sensory: [
      'soft natural lighting', 'gentle warm breeze', 'comfortable temperature', 'pleasant sounds',
      'fresh clean air', 'cozy textures', 'welcoming atmosphere', 'soothing environment'
    ],
    
    // Props and objects
    props: [
      'colorful books', 'soft cushions', 'warm blankets', 'favorite toys', 'art supplies',
      'comfortable furniture', 'plants and flowers', 'natural elements', 'personal belongings'
    ]
  },
  
  // Composition vocabulary for visual enhancement
  composition: {
    // Spatial composition
    spatial: [
      'centered composition', 'balanced framing', 'natural positioning', 'harmonious layout',
      'dynamic arrangement', 'comfortable spacing', 'engaging perspective', 'pleasing proportions'
    ],
    
    // Camera directives
    camera: [
      'medium shot focusing on character', 'close-up of expressive face', 'full body view',
      'environmental portrait', 'intimate perspective', 'natural viewpoint', 'child-friendly angle'
    ]
  }
};

// ============= ENHANCED SCENE ANALYSIS CLASS =============
class SceneAnalyzer {
  constructor(pageText) {
    this.pageText = pageText;
    this.lowerText = pageText.toLowerCase();
  }
  
  /**
   * Analyze if the scene has strong spatial indicators
   */
  hasSpatialIndicators() {
    const strongSpatialIndicators = [
      // Action positioning
      'sit', 'stand', 'walk', 'run', 'jump', 'lie', 'kneel', 'crouch', 'lean',
      
      // Movement directions
      'up', 'down', 'forward', 'back', 'toward', 'away', 'around', 'through',
      
      // Explicit positional words
      'center', 'middle', 'front', 'foreground', 'left', 'right', 'background',
      'corner', 'above', 'over', 'under', 'beneath', 'between', 'on top'
    ];
    
    return strongSpatialIndicators.some(indicator => this.lowerText.includes(indicator));
  }
  
  /**
   * Determine the scene type for context-aware processing
   */
  getSceneType() {
    if (this.lowerText.includes('wake') || this.lowerText.includes('bed') || this.lowerText.includes('sleep')) {
      return 'sleep_wake';
    }
    if (this.lowerText.includes('walk') || this.lowerText.includes('move') || this.lowerText.includes('step')) {
      return 'movement';
    }
    if (this.lowerText.includes('play') || this.lowerText.includes('toy') || this.lowerText.includes('game')) {
      return 'play';
    }
    if (this.lowerText.includes('sit') || this.lowerText.includes('seat')) {
      return 'sitting';
    }
    if (this.lowerText.includes('stand') || this.lowerText.includes('standing')) {
      return 'standing';
    }
    if (this.lowerText.includes('read') || this.lowerText.includes('book') || this.lowerText.includes('study')) {
      return 'learning';
    }
    return 'general';
  }
  
  /**
   * Get contextually appropriate vocabulary for body language
   */
  getContextualBodyLanguage() {
    const sceneType = this.getSceneType();
    
    const contextualMappings = {
      sleep_wake: ['stretching arms upward', 'rubbing eyes sleepily', 'yawning softly'],
      movement: ['looking ahead confidently', 'hands in pockets', 'arms swinging naturally'],
      play: ['arms spread wide with excitement', 'hands raised in celebration', 'body bouncing with joy'],
      sitting: ['sitting cross-legged', 'hands resting on lap'],
      standing: ['standing tall', 'hands on hips'],
      learning: ['head tilted thoughtfully', 'eyes sparkling with wonder'],
      general: ['smiling brightly', 'standing tall']
    };
    
    return contextualMappings[sceneType] || contextualMappings.general;
  }
  
  /**
   * Get contextually appropriate vocabulary for spatial positioning
   */
  getContextualSpatialPositioning() {
    const sceneType = this.getSceneType();
    
    const contextualMappings = {
      sleep_wake: ['sitting up in bed', 'stretching in bed', 'lying peacefully'],
      movement: ['moving forward confidently', 'stepping carefully', 'striding purposefully'],
      play: ['crouched down to play', 'kneeling on ground', 'positioned playfully'],
      sitting: ['seated comfortably', 'sitting cross-legged'],
      standing: ['standing in the center', 'positioned in the foreground'],
      learning: ['positioned at desk', 'seated comfortably', 'sitting attentively'],
      general: ['positioned in the foreground', 'standing in the center']
    };
    
    return contextualMappings[sceneType] || contextualMappings.general;
  }
}

// ============= ENHANCED ACTION SECTION EXTRACTION FUNCTIONS =============

function extractActionIntensity(pageText) {
  const lowerText = pageText.toLowerCase();
  
  // Check for intensity vocabulary (exact matches only)
  for (const intensity of TIER_25_UNIFIED_VOCABULARY.actions.intensity) {
    if (lowerText.includes(intensity)) {
      return intensity;
    }
  }
  
  // Check for intensity indicators in text (only clear indicators)
  if (lowerText.includes('quick') || lowerText.includes('fast') || lowerText.includes('rush')) return 'energetically';
  if (lowerText.includes('slow') || lowerText.includes('soft') || lowerText.includes('quiet')) return 'gently';
  if (lowerText.includes('excited') || lowerText.includes('eager') || lowerText.includes('enthusiastic')) return 'excitedly';
  if (lowerText.includes('calm') || lowerText.includes('peace') || lowerText.includes('relax')) return 'peacefully';
  if (lowerText.includes('careful') || lowerText.includes('cautious')) return 'carefully';
  if (lowerText.includes('bold') || lowerText.includes('brave') || lowerText.includes('confident')) return 'boldly';
  
  // NO FALLBACK - Return empty string when no intensity detected
  return '';
}

function extractBodyLanguage(pageText) {
  const lowerText = pageText.toLowerCase();
  
  // Check for body language vocabulary (exact matches)
  for (const bodyLang of TIER_25_UNIFIED_VOCABULARY.actions.bodyLanguage) {
    if (lowerText.includes(bodyLang.toLowerCase())) {
      return bodyLang;
    }
  }
  
  // CONTEXT-AWARE BODY LANGUAGE EXTRACTION - INTELLIGENT DETECTION
  // Only provide body language when context is clear and meaningful
  
  // Sleeping/Waking context
  if (lowerText.includes('wake') || lowerText.includes('waking') || lowerText.includes('woke')) {
    if (lowerText.includes('stretch')) return 'stretching arms upward';
    if (lowerText.includes('rub') || lowerText.includes('eyes')) return 'rubbing eyes sleepily';
    if (lowerText.includes('yawn')) return 'yawning softly';
    if (lowerText.includes('bed') || lowerText.includes('sleep')) return 'stretching arms upward';
  }
  
  // Walking/Moving context with confidence indicators
  if (lowerText.includes('walk') || lowerText.includes('walking') || lowerText.includes('move')) {
    if (lowerText.includes('confident') || lowerText.includes('proud')) return 'looking ahead confidently';
    if (lowerText.includes('pocket')) return 'hands in pockets';
    if (lowerText.includes('school') || lowerText.includes('purpose')) return 'arms swinging naturally';
  }
  
  // Playing/Active context with clear activity
  if (lowerText.includes('play') || lowerText.includes('playing') || lowerText.includes('jump') || lowerText.includes('run')) {
    if (lowerText.includes('excited') || lowerText.includes('happy')) return 'arms spread wide with excitement';
    if (lowerText.includes('celebrate') || lowerText.includes('win')) return 'hands raised in celebration';
    if (lowerText.includes('ball') || lowerText.includes('toy')) return 'body bouncing with joy';
  }
  
  // Sitting context with specific details
  if (lowerText.includes('sit') || lowerText.includes('sitting') || lowerText.includes('seat')) {
    if (lowerText.includes('cross') || lowerText.includes('legs')) return 'sitting cross-legged';
    if (lowerText.includes('comfortable') || lowerText.includes('relax')) return 'hands resting on lap';
    if (lowerText.includes('quietly') || lowerText.includes('still')) return 'sitting cross-legged';
  }
  
  // Standing context with purpose
  if (lowerText.includes('stand') || lowerText.includes('standing')) {
    if (lowerText.includes('tall') || lowerText.includes('proud')) return 'standing tall';
    if (lowerText.includes('confident')) return 'hands on hips';
  }
  
  // Strong emotional indicators only
  if (lowerText.includes('smile') && (lowerText.includes('bright') || lowerText.includes('wide'))) return 'smiling brightly';
  if (lowerText.includes('think') || lowerText.includes('wonder') || lowerText.includes('curious')) return 'head tilted thoughtfully';
  if (lowerText.includes('excited') && lowerText.includes('eyes')) return 'eyes sparkling with wonder';
  
  // NO UNIVERSAL FALLBACK - Return empty string when context is insufficient
  return '';
}

function extractSpatialPositioning(pageText) {
  const lowerText = pageText.toLowerCase();
  
  // Check for spatial positioning vocabulary (exact matches)
  for (const spatial of TIER_25_UNIFIED_VOCABULARY.actions.spatial) {
    const spatialWords = spatial.toLowerCase().split(' ');
    if (spatialWords.every(word => lowerText.includes(word))) {
      return spatial;
    }
  }
  
  // CONTEXT-AWARE SPATIAL POSITIONING EXTRACTION - INTELLIGENT DETECTION
  // Only provide positioning when context is clear and meaningful
  
  // Sleeping/Waking context - bed context provides clear positioning
  if (lowerText.includes('wake') || lowerText.includes('waking') || lowerText.includes('woke') || 
      lowerText.includes('sleep') || lowerText.includes('bed')) {
    if (lowerText.includes('sit') || lowerText.includes('up')) return 'sitting up in bed';
    if (lowerText.includes('stretch')) return 'stretching in bed';
    if (lowerText.includes('lying') || lowerText.includes('lay')) return 'lying peacefully';
    return 'sitting up in bed'; // Clear bed context justifies positioning
  }
  
  // Walking/Moving context with directional indicators
  if (lowerText.includes('walk') || lowerText.includes('walking') || lowerText.includes('move') || 
      lowerText.includes('step') || lowerText.includes('stride')) {
    if (lowerText.includes('to') || lowerText.includes('toward') || lowerText.includes('school')) return 'moving forward confidently';
    if (lowerText.includes('careful') || lowerText.includes('slow')) return 'stepping carefully';
    if (lowerText.includes('purpose') || lowerText.includes('determined')) return 'striding purposefully';
  }
  
  // Playing context with specific activities  
  if (lowerText.includes('play') || lowerText.includes('playing') || lowerText.includes('game') ||
      lowerText.includes('toy') || lowerText.includes('fun')) {
    if (lowerText.includes('crouch') || lowerText.includes('down')) return 'crouched down to play';
    if (lowerText.includes('kneel') || lowerText.includes('ground')) return 'kneeling on ground';
    if (lowerText.includes('sit') || lowerText.includes('seated')) return 'seated for play';
    if (lowerText.includes('ball') || lowerText.includes('toy')) return 'positioned playfully';
  }
  
  // Learning/Reading context with furniture/location indicators
  if (lowerText.includes('read') || lowerText.includes('book') || lowerText.includes('study') ||
      lowerText.includes('learn') || lowerText.includes('desk') || lowerText.includes('school')) {
    if (lowerText.includes('desk') || lowerText.includes('table')) return 'positioned at desk';
    if (lowerText.includes('comfortable') || lowerText.includes('cozy')) return 'seated comfortably';
    if (lowerText.includes('attentive') || lowerText.includes('focus')) return 'sitting attentively';
  }
  
  // Strong spatial indicators only
  if (lowerText.includes('center') || lowerText.includes('middle')) return 'standing in the center';
  if (lowerText.includes('front') || lowerText.includes('foreground')) return 'positioned in the foreground';
  if (lowerText.includes('left')) return 'placed to the left';
  if (lowerText.includes('right')) return 'located on the right side';
  if (lowerText.includes('back') || lowerText.includes('background')) return 'sitting in the background';
  if (lowerText.includes('corner')) return 'crouched in the corner';
  if (lowerText.includes('above') || lowerText.includes('over')) return 'hovering above';
  if (lowerText.includes('under') || lowerText.includes('beneath') || lowerText.includes('below')) return 'resting beneath';
  if (lowerText.includes('between')) return 'nestled between';
  if (lowerText.includes('on top') || lowerText.includes('upon')) return 'balanced on top of';
  
  // NO UNIVERSAL FALLBACK - Return empty string when context is insufficient
  return '';
}

function extractObjectInteraction(pageText, actionObjects) {
  const lowerText = pageText.toLowerCase();
  
  // If we have meaningful action objects, enhance them with interaction details
  if (actionObjects && actionObjects !== 'colorful items' && actionObjects.trim() !== '') {
    // Check for specific interaction verbs
    if (lowerText.includes('hold') || lowerText.includes('holding')) return `holding ${actionObjects}`;
    if (lowerText.includes('carry') || lowerText.includes('carrying')) return `carrying ${actionObjects}`;
    if (lowerText.includes('use') || lowerText.includes('using')) return `using ${actionObjects}`;
    if (lowerText.includes('play') || lowerText.includes('playing')) return `playing with ${actionObjects}`;
    if (lowerText.includes('touch') || lowerText.includes('touching')) return `touching ${actionObjects}`;
    if (lowerText.includes('reach') || lowerText.includes('reaching')) return `reaching for ${actionObjects}`;
    if (lowerText.includes('grab') || lowerText.includes('grabbing')) return `grabbing ${actionObjects}`;
    if (lowerText.includes('pick') || lowerText.includes('picking')) return `picking up ${actionObjects}`;
    
    // If objects exist but no specific interaction verb, describe general interaction
    return `interacting with ${actionObjects}`;
  }
  
  // Check for specific objects mentioned in text (without actionObjects parameter)
  if (lowerText.includes('book') && (lowerText.includes('hold') || lowerText.includes('read'))) return 'holding a book';
  if (lowerText.includes('ball') && (lowerText.includes('play') || lowerText.includes('throw'))) return 'playing with a ball';
  if (lowerText.includes('toy') && lowerText.includes('play')) return 'playing with toys';
  if (lowerText.includes('food') && (lowerText.includes('eat') || lowerText.includes('hold'))) return 'holding food';
  
  // NO FALLBACK - Return empty string when no objects or interactions detected
  return '';
}

// ============= SEEDED SECONDARY CHARACTER SYSTEM (REPLACES OLD extractSecondaryCharactersFromSentence) =============
async function getSeededSecondaryCharacters(sentence, sessionId, pageNumber) {
  console.log(`🔍 Seeded Secondary Character Detection - Processing: "${sentence}"`);
  
  if (!sessionId) {
    console.log('⚠️ No sessionId provided, falling back to basic detection');
    return await extractSecondaryCharactersFromSentence(sentence, sessionId, pageNumber);
  }
  
  try {
    // PHASE 1: Use SecondaryElementDetector for consistent detection
    const { SecondaryElementDetector } = await import('../_shared/SecondaryElementDetector.js');
    const secondaryElements = await SecondaryElementDetector.parseElements(
      sessionId,
      '', // primaryScene not available yet
      sentence,
      pageNumber || 1
    );
    
    if (!secondaryElements || secondaryElements.length === 0) {
      console.log('📝 No secondary elements detected by SecondaryElementDetector, using fallback');
      return await extractSecondaryCharactersFromSentence(sentence, sessionId, pageNumber);
    }
    
    // PHASE 2: Get seed-consistent descriptions for secondary characters (up to 4)
    const { CharacterConsistencyService } = await import('../_shared/CharacterConsistencyService.js');
    const characterConsistencyService = new CharacterConsistencyService();
    
    const seededDescriptions = await Promise.all(
      secondaryElements.slice(0, 4).map(async (el) => {
        if (el.type === 'secondary_character') {
          try {
            const secondaryCharacterSeed = await characterConsistencyService.getSecondaryCharacterSeed(
              sessionId, 
              el.name, 
              'secondary_character'
            );
            const seedDescription = characterConsistencyService.generateSecondaryCharacterDescription(
              el.name, 
              'secondary_character', 
              secondaryCharacterSeed.seed
            );
            console.log(`👤 Tier 2.5A: Secondary character seed applied: ${el.name} -> ${seedDescription} (seed: ${secondaryCharacterSeed.seed})`);
            return `${el.name}: ${seedDescription}`;
          } catch (error) {
            console.warn(`⚠️ Tier 2.5A: Secondary character seed failed for ${el.name}:`, error.message);
            return `friendly ${el.name}`;
          }
        } else if (el.type === 'character_animal') {
          return `${el.name} (${el.type})`;
        }
        return null;
      })
    );
    
    const validDescriptions = seededDescriptions.filter(desc => desc !== null);
    
    if (validDescriptions.length > 0) {
      const result = validDescriptions.join(', ');
      console.log(`✅ Tier 2.5A: Seeded secondary characters generated: ${result}`);
      return result;
    } else {
      console.log('📝 No valid seeded descriptions, using fallback');
      return await extractSecondaryCharactersFromSentence(sentence, sessionId, pageNumber);
    }
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5A: Seeded secondary character detection failed, using fallback:', error.message);
    return await extractSecondaryCharactersFromSentence(sentence, sessionId, pageNumber);
  }
}

async function extractSecondaryCharactersFromSentence(sentence, sessionId, pageNumber) {
  console.log(`🔍 Enhanced Secondary Character Detection - Processing: "${sentence}"`);
  
  const lowerSentence = sentence.toLowerCase();
  const detectedCharacterElements = [];
  
  // ============= PHASE 0: ANALYZE TEXT FOR VISUAL DETAILS FIRST =============
  if (sessionId) {
    await VisualDetailTracker.analyzeTextForDetails(sessionId, sentence, pageNumber || 1);
  }
  
  // PHASE 1: PRIORITIZE PAGE TEXT NAME EXTRACTION WITH VISUAL ATTRIBUTES
  const extractedNames = extractCharacterNamesFromPageText(sentence, sessionId);
  if (extractedNames.length > 0) {
    const enhancedNames = await Promise.all(extractedNames.slice(0, 3).map(async name => {
      // Add descriptive attributes to character names
      const lowerName = name.toLowerCase();
      
      // Determine character type and add appropriate descriptors
      if (lowerSentence.includes(lowerName + ' the dog') || lowerSentence.includes('dog named ' + lowerName)) {
        return `${name} (friendly dog)`;
      } else if (lowerSentence.includes(lowerName + ' the cat') || lowerSentence.includes('cat named ' + lowerName)) {
        return `${name} (playful cat)`;
      } else if (lowerSentence.includes('friend') || lowerSentence.includes('classmate')) {
        return `${name} (kind friend)`;
      } else if (lowerSentence.includes('teacher') || lowerSentence.includes('adult')) {
        return `${name} (caring adult)`;
      } else {
        return `${name} (friendly character)`;
      }
    }));
    
    console.log(`👥 Enhanced Secondary Characters (from names): ${enhancedNames.join(', ')}`);
    return enhancedNames.join(', ');
  }
  
  // PHASE 2: RELATIONSHIP-BASED CHARACTER DETECTION WITH CONTEXT
  const characterRelationships = [
    // Family relationships
    { patterns: ['mom', 'mother', 'mama'], descriptor: 'loving mother' },
    { patterns: ['dad', 'father', 'papa'], descriptor: 'caring father' },
    { patterns: ['sister'], descriptor: 'playful sister' },
    { patterns: ['brother'], descriptor: 'helpful brother' },
    { patterns: ['grandma', 'grandmother'], descriptor: 'wise grandmother' },
    { patterns: ['grandpa', 'grandfather'], descriptor: 'gentle grandfather' },
    
    // Friend relationships
    { patterns: ['friend', 'buddy', 'pal'], descriptor: 'kind friend' },
    { patterns: ['classmate'], descriptor: 'friendly classmate' },
    { patterns: ['neighbor'], descriptor: 'helpful neighbor' },
    
    // Adult relationships
    { patterns: ['teacher'], descriptor: 'encouraging teacher' },
    { patterns: ['coach'], descriptor: 'supportive coach' },
    
    // Animal relationships
    { patterns: ['dog', 'puppy'], descriptor: 'loyal dog' },
    { patterns: ['cat', 'kitten'], descriptor: 'playful cat' },
    { patterns: ['pet'], descriptor: 'beloved pet' }
  ];
  
  for (const relationship of characterRelationships) {
    for (const pattern of relationship.patterns) {
      if (lowerSentence.includes(pattern)) {
        detectedCharacterElements.push(relationship.descriptor);
        console.log(`👥 Relationship-based character detected: ${relationship.descriptor}`);
        
        // Only detect first relationship to avoid over-population
        break;
      }
    }
    
    // Break after first detection
    if (detectedCharacterElements.length > 0) break;
  }
  
  // PHASE 3: CONTEXTUAL ENHANCEMENT WITH STORY ELEMENTS
  if (detectedCharacterElements.length > 0) {
    // Enhance with contextual details based on story content
    const enhancedCharacters = detectedCharacterElements.map(character => {
      // Add contextual descriptors based on story setting
      if (lowerSentence.includes('school')) {
        return character.replace('friend', 'school friend').replace('teacher', 'helpful teacher');
      } else if (lowerSentence.includes('home') || lowerSentence.includes('house')) {
        return character.replace('friend', 'neighbor friend').replace('mother', 'loving mother');
      } else if (lowerSentence.includes('park') || lowerSentence.includes('outside')) {
        return character.replace('friend', 'playground friend').replace('dog', 'park dog');
      }
      
      return character;
    });
    
    const result = enhancedCharacters.join(', ');
    console.log(`✅ Enhanced Secondary Characters (contextual): ${result}`);
    return result;
  }
  
  // PHASE 4: FALLBACK - RETURN EMPTY STRING WHEN NO CHARACTERS DETECTED
  console.log(`📝 No secondary characters detected in: "${sentence}"`);
  return '';
}

// ============= ENHANCED SEEDED ATMOSPHERE AND SENSORY FUNCTIONS =============
function getSeededAtmosphere(pageText, sessionId, pageNumber = 1) {
  console.log(`🌅 Tier 2.5: Advanced seeded atmosphere selection - Session: ${sessionId}, Page: ${pageNumber}`);
  
  // Extract atmosphere hints from page text first
  const lowerText = pageText.toLowerCase();
  
  // Story-driven atmosphere detection
  if (lowerText.includes('warm') || lowerText.includes('cozy') || lowerText.includes('comfortable')) {
    console.log(`📖 Tier 2.5: Story-driven atmosphere detected: warm and inviting`);
    return 'warm and inviting';
  }
  if (lowerText.includes('bright') || lowerText.includes('sunny') || lowerText.includes('cheerful')) {
    console.log(`📖 Tier 2.5: Story-driven atmosphere detected: bright and cheerful`);
    return 'bright and cheerful';
  }
  if (lowerText.includes('peaceful') || lowerText.includes('calm') || lowerText.includes('quiet')) {
    console.log(`📖 Tier 2.5: Story-driven atmosphere detected: peaceful and calm`);
    return 'peaceful and calm';
  }
  if (lowerText.includes('magical') || lowerText.includes('wonder') || lowerText.includes('amazing')) {
    console.log(`📖 Tier 2.5: Story-driven atmosphere detected: magical and wonder-filled`);
    return 'magical and wonder-filled';
  }
  
  // Create composite seed for atmosphere consistency
  const compositeSeed = `${sessionId}_atmosphere_${pageNumber}`;
  
  // TIER 2.5 NUCLEAR INDEPENDENCE - Child-appropriate atmosphere pool
  const atmospherePool = TIER_25_UNIFIED_VOCABULARY.environment.atmosphere;
  
  const selectedAtmosphere = getSeededArrayElement(atmospherePool, compositeSeed);
  console.log(`✅ Tier 2.5: Seeded atmosphere selected: ${selectedAtmosphere} (seed: ${compositeSeed})`);
  return selectedAtmosphere;
}

function getSeededSensoryDetails(pageText, sessionId, pageNumber = 1) {
  console.log(`👁 Tier 2.5: Advanced seeded sensory details selection - Session: ${sessionId}, Page: ${pageNumber}`);
  
  // Extract sensory hints from page text first
  const lowerText = pageText.toLowerCase();
  
  // Story-driven sensory detection
  if (lowerText.includes('light') || lowerText.includes('bright') || lowerText.includes('glow')) {
    console.log(`📖 Tier 2.5: Story-driven sensory detected: soft natural lighting`);
    return 'soft natural lighting';
  }
  if (lowerText.includes('breeze') || lowerText.includes('air') || lowerText.includes('wind')) {
    console.log(`📖 Tier 2.5: Story-driven sensory detected: gentle warm breeze`);
    return 'gentle warm breeze';
  }
  if (lowerText.includes('sound') || lowerText.includes('music') || lowerText.includes('voice')) {
    console.log(`📖 Tier 2.5: Story-driven sensory detected: pleasant sounds`);
    return 'pleasant sounds';
  }
  
  // Create composite seed for sensory consistency
  const compositeSeed = `${sessionId}_sensory_${pageNumber}`;
  
  // TIER 2.5 NUCLEAR INDEPENDENCE - Sensory detail pool
  const sensoryPool = TIER_25_UNIFIED_VOCABULARY.environment.sensory;
  
  const selectedSensory = getSeededArrayElement(sensoryPool, compositeSeed);
  console.log(`✅ Tier 2.5: Seeded sensory details selected: ${selectedSensory} (seed: ${compositeSeed})`);
  return selectedSensory;
}

function getSeededProps(pageText, sessionId, pageNumber = 1) {
  console.log(`🎭 Tier 2.5: Advanced seeded props selection - Session: ${sessionId}, Page: ${pageNumber}`);
  
  // Extract prop hints from page text first
  const lowerText = pageText.toLowerCase();
  
  // Story-driven prop detection
  if (lowerText.includes('book') || lowerText.includes('read') || lowerText.includes('story')) {
    console.log(`📖 Tier 2.5: Story-driven props detected: colorful books`);
    return 'colorful books';
  }
  if (lowerText.includes('toy') || lowerText.includes('play') || lowerText.includes('game')) {
    console.log(`📖 Tier 2.5: Story-driven props detected: favorite toys`);
    return 'favorite toys';
  }
  if (lowerText.includes('art') || lowerText.includes('draw') || lowerText.includes('paint')) {
    console.log(`📖 Tier 2.5: Story-driven props detected: art supplies`);
    return 'art supplies';
  }
  if (lowerText.includes('bed') || lowerText.includes('sleep') || lowerText.includes('rest')) {
    console.log(`📖 Tier 2.5: Story-driven props detected: soft cushions`);
    return 'soft cushions';
  }
  
  // Create composite seed for props consistency
  const compositeSeed = `${sessionId}_props_${pageNumber}`;
  
  // TIER 2.5 NUCLEAR INDEPENDENCE - Props pool
  const propsPool = TIER_25_UNIFIED_VOCABULARY.environment.props;
  
  const selectedProps = getSeededArrayElement(propsPool, compositeSeed);
  console.log(`✅ Tier 2.5: Seeded props selected: ${selectedProps} (seed: ${compositeSeed})`);
  return selectedProps;
}

function getSeededSpatialComposition(pageText, sessionId, pageNumber = 1) {
  console.log(`📐 Tier 2.5: Advanced seeded spatial composition selection - Session: ${sessionId}, Page: ${pageNumber}`);
  
  // Analyze scene for spatial requirements
  const sceneAnalyzer = new SceneAnalyzer(pageText);
  
  // If scene has strong spatial indicators, provide contextual composition
  if (sceneAnalyzer.hasSpatialIndicators()) {
    const contextualCompositions = sceneAnalyzer.getContextualSpatialPositioning();
    if (contextualCompositions.length > 0) {
      const compositeSeed = `${sessionId}_spatial_context_${pageNumber}`;
      const selected = getSeededArrayElement(contextualCompositions, compositeSeed);
      console.log(`📖 Tier 2.5: Context-aware spatial composition: ${selected}`);
      return selected;
    }
  }
  
  // Create composite seed for spatial composition consistency
  const compositeSeed = `${sessionId}_composition_${pageNumber}`;
  
  // TIER 2.5 NUCLEAR INDEPENDENCE - Spatial composition pool
  const compositionPool = TIER_25_UNIFIED_VOCABULARY.composition.spatial;
  
  const selectedComposition = getSeededArrayElement(compositionPool, compositeSeed);
  console.log(`✅ Tier 2.5: Seeded spatial composition selected: ${selectedComposition} (seed: ${compositeSeed})`);
  return selectedComposition;
}

function getSeededCameraDirective(pageText, sessionId, pageNumber = 1) {
  console.log(`📷 Tier 2.5: Advanced seeded camera directive selection - Session: ${sessionId}, Page: ${pageNumber}`);
  
  // Extract camera hints from page text first
  const lowerText = pageText.toLowerCase();
  
  // Story-driven camera detection
  if (lowerText.includes('face') || lowerText.includes('eyes') || lowerText.includes('smile')) {
    console.log(`📖 Tier 2.5: Story-driven camera detected: close-up of expressive face`);
    return 'close-up of expressive face';
  }
  if (lowerText.includes('whole') || lowerText.includes('entire') || lowerText.includes('full')) {
    console.log(`📖 Tier 2.5: Story-driven camera detected: full body view`);
    return 'full body view';
  }
  
  // Create composite seed for camera consistency
  const compositeSeed = `${sessionId}_camera_${pageNumber}`;
  
  // TIER 2.5 NUCLEAR INDEPENDENCE - Camera directive pool
  const cameraPool = TIER_25_UNIFIED_VOCABULARY.composition.camera;
  
  const selectedCamera = getSeededArrayElement(cameraPool, compositeSeed);
  console.log(`✅ Tier 2.5: Seeded camera directive selected: ${selectedCamera} (seed: ${compositeSeed})`);
  return selectedCamera;
}

// ============= ENHANCED SEEDED ACTION OBJECTS AND COLORED OBJECTS =============
function getSeededActionObjects(pageText, sessionId, pageNumber = 1) {
  console.log(`🎯 Tier 2.5: Advanced seeded action objects selection - Session: ${sessionId}, Page: ${pageNumber}`);
  
  // Extract action object hints from page text first
  const lowerText = pageText.toLowerCase();
  
  // Story-driven action object detection
  if (lowerText.includes('book') || lowerText.includes('read')) {
    console.log(`📖 Tier 2.5: Story-driven action objects detected: books`);
    return 'books';
  }
  if (lowerText.includes('ball') || lowerText.includes('throw') || lowerText.includes('catch')) {
    console.log(`📖 Tier 2.5: Story-driven action objects detected: colorful ball`);
    return 'colorful ball';
  }
  if (lowerText.includes('toy') || lowerText.includes('play')) {
    console.log(`📖 Tier 2.5: Story-driven action objects detected: toys`);
    return 'toys';
  }
  if (lowerText.includes('pencil') || lowerText.includes('pen') || lowerText.includes('write')) {
    console.log(`📖 Tier 2.5: Story-driven action objects detected: writing materials`);
    return 'writing materials';
  }
  if (lowerText.includes('food') || lowerText.includes('eat') || lowerText.includes('snack')) {
    console.log(`📖 Tier 2.5: Story-driven action objects detected: healthy snacks`);
    return 'healthy snacks';
  }
  
  // Create composite seed for action objects consistency
  const compositeSeed = `${sessionId}_action_objects_${pageNumber}`;
  
  // TIER 2.5 NUCLEAR INDEPENDENCE - Action objects pool
  const actionObjectsPool = [
    'colorful books', 'favorite toys', 'art supplies', 'building blocks', 'musical instruments',
    'sports equipment', 'educational games', 'craft materials', 'puzzle pieces', 'writing materials',
    'colorful ball', 'stuffed animals', 'board games', 'healthy snacks', 'creative tools'
  ];
  
  const selectedActionObjects = getSeededArrayElement(actionObjectsPool, compositeSeed);
  console.log(`✅ Tier 2.5: Seeded action objects selected: ${selectedActionObjects} (seed: ${compositeSeed})`);
  return selectedActionObjects;
}

function getSeededColoredObjects(pageText, sessionId, pageNumber = 1) {
  console.log(`🌈 Tier 2.5: Advanced seeded colored objects selection - Session: ${sessionId}, Page: ${pageNumber}`);
  
  // Extract color hints from page text first
  const lowerText = pageText.toLowerCase();
  
  // Story-driven color detection
  if (lowerText.includes('red') || lowerText.includes('blue') || lowerText.includes('green') || 
      lowerText.includes('yellow') || lowerText.includes('purple') || lowerText.includes('orange')) {
    console.log(`📖 Tier 2.5: Story-driven colored objects detected: colorful items`);
    return 'colorful items';
  }
  if (lowerText.includes('bright') || lowerText.includes('vibrant') || lowerText.includes('colorful')) {
    console.log(`📖 Tier 2.5: Story-driven colored objects detected: bright colorful objects`);
    return 'bright colorful objects';
  }
  
  // Create composite seed for colored objects consistency
  const compositeSeed = `${sessionId}_colored_objects_${pageNumber}`;
  
  // TIER 2.5 NUCLEAR INDEPENDENCE - Colored objects pool
  const coloredObjectsPool = [
    'rainbow-colored items', 'bright colorful objects', 'vibrant decorations', 'multicolored accessories',
    'cheerful colored elements', 'pastel-colored items', 'warm-toned objects', 'cool-toned elements',
    'earth-tone items', 'jewel-tone objects', 'soft-colored accessories', 'boldly-colored elements'
  ];
  
  const selectedColoredObjects = getSeededArrayElement(coloredObjectsPool, compositeSeed);
  console.log(`✅ Tier 2.5: Seeded colored objects selected: ${selectedColoredObjects} (seed: ${compositeSeed})`);
  return selectedColoredObjects;
}

function getSeededCommunityContext(pageText, sessionId, pageNumber = 1) {
  console.log(`🏘 Tier 2.5: Advanced seeded community context selection - Session: ${sessionId}, Page: ${pageNumber}`);
  
  // Extract community hints from page text first
  const lowerText = pageText.toLowerCase();
  
  // Story-driven community context detection
  if (lowerText.includes('school') || lowerText.includes('classroom') || lowerText.includes('student')) {
    console.log(`📖 Tier 2.5: Story-driven community context detected: school community`);
    return 'school community';
  }
  if (lowerText.includes('neighborhood') || lowerText.includes('neighbor') || lowerText.includes('street')) {
    console.log(`📖 Tier 2.5: Story-driven community context detected: neighborhood community`);
    return 'neighborhood community';
  }
  if (lowerText.includes('family') || lowerText.includes('home') || lowerText.includes('house')) {
    console.log(`📖 Tier 2.5: Story-driven community context detected: family community`);
    return 'family community';
  }
  if (lowerText.includes('friend') || lowerText.includes('play') || lowerText.includes('together')) {
    console.log(`📖 Tier 2.5: Story-driven community context detected: friendship community`);
    return 'friendship community';
  }
  
  // Create composite seed for community context consistency
  const compositeSeed = `${sessionId}_community_${pageNumber}`;
  
  // TIER 2.5 NUCLEAR INDEPENDENCE - Community context pool
  const communityPool = [
    'school community', 'neighborhood community', 'family community', 'friendship community',
    'learning community', 'play community', 'supportive community', 'diverse community',
    'caring community', 'inclusive community', 'creative community', 'active community'
  ];
  
  const selectedCommunity = getSeededArrayElement(communityPool, compositeSeed);
  console.log(`✅ Tier 2.5: Seeded community context selected: ${selectedCommunity} (seed: ${compositeSeed})`);
  return selectedCommunity;
}

// ============= ENHANCED SEEDED SCENE PROCESSING =============
function getSeededScene(pageText, sessionId, pageNumber = 1) {
  console.log(`🎬 Tier 2.5: Advanced seeded scene selection - Session: ${sessionId}, Page: ${pageNumber}`);
  
  // Use SceneAnalyzer to determine scene type and get appropriate vocabulary
  const sceneAnalyzer = new SceneAnalyzer(pageText);
  const sceneType = sceneAnalyzer.getSceneType();
  
  console.log(`🎭 Tier 2.5: Scene type analyzed: ${sceneType}`);
  
  // Get contextually appropriate scene vocabulary
  const sceneVocabulary = TIER_25_UNIFIED_VOCABULARY.scenes[sceneType] || TIER_25_UNIFIED_VOCABULARY.scenes.play;
  
  // Create composite seed for scene consistency
  const compositeSeed = `${sessionId}_scene_${sceneType}_${pageNumber}`;
  
  const selectedScene = getSeededArrayElement(sceneVocabulary, compositeSeed);
  console.log(`✅ Tier 2.5: Seeded scene selected: ${selectedScene} (type: ${sceneType}, seed: ${compositeSeed})`);
  return selectedScene;
}

// ============= ENHANCED TEMPLATE FILLING SYSTEM =============
async function fillPromptTemplate(template, placeholders, templateType, difficulty) {
  console.log(`🔧 Tier 2.5: Advanced template filling - Type: ${templateType}, Difficulty: ${difficulty}`);
  console.log(`📝 Template: ${template.substring(0, 100)}...`);
  console.log(`🎯 Placeholders:`, Object.keys(placeholders));
  
  let filledTemplate = template;
  
  // Fill all placeholders
  for (const [key, value] of Object.entries(placeholders)) {
    const placeholder = `{${key}}`;
    if (filledTemplate.includes(placeholder)) {
      const safeValue = value || '';
      filledTemplate = filledTemplate.replace(new RegExp(`\\{${key}\\}`, 'g'), safeValue);
      console.log(`🔀 Filled {${key}} -> "${safeValue}"`);
    }
  }
  
  // Clean up any remaining empty placeholders
  filledTemplate = filledTemplate.replace(/\{[^}]+\}/g, '');
  
  // Clean up extra spaces and punctuation
  filledTemplate = filledTemplate.replace(/\s{2,}/g, ' ');
  filledTemplate = filledTemplate.replace(/,\s*,/g, ',');
  filledTemplate = filledTemplate.replace(/\.\s*\./g, '.');
  filledTemplate = filledTemplate.trim();
  
  console.log(`✅ Tier 2.5: Template filled successfully - Length: ${filledTemplate.length} chars`);
  console.log(`📤 Final template preview: ${filledTemplate.substring(0, 200)}...`);
  
  return filledTemplate;
}

// ============= MAIN ENHANCED PROCESSING FUNCTION =============
async function processEnhancedStoryPage(userInfo, pageText, sessionId, pageNumber) {
  console.log(`🚀 Tier 2.5: Starting enhanced story page processing`);
  console.log(`📖 Page Text: "${pageText}"`);
  console.log(`👤 User Info:`, userInfo);
  console.log(`🆔 Session ID: ${sessionId}`);
  console.log(`📄 Page Number: ${pageNumber}`);
  
  try {
    // ============= PHASE 1: CHARACTER CONSISTENCY INTEGRATION =============
    console.log(`🎭 Phase 1: Character consistency integration`);
    
    let characterData = null;
    let avatarMapping = null;
    
    try {
      const characterConsistencyService = new CharacterConsistencyService();
      
      // Get character data for consistency
      characterData = await characterConsistencyService.getCharacterSeed(sessionId, 'main_character');
      console.log(`👤 Character data retrieved:`, characterData);
      
      // Get avatar mapping for enhanced character description
      if (userInfo?.avatar) {
        avatarMapping = await characterConsistencyService.getAvatarMapping(userInfo.avatar);
        console.log(`🎨 Avatar mapping retrieved:`, avatarMapping);
      }
    } catch (error) {
      console.warn(`⚠️ Character consistency service error:`, error.message);
    }
    
    // ============= PHASE 2: ENHANCED SEEDED CHARACTER GENERATION =============
    console.log(`👥 Phase 2: Enhanced seeded character generation`);
    
    // Use enhanced seeded functions for consistent character generation
    const ethnicity = getSeededEthnicity(pageText, sessionId, pageNumber);
    const character = getSeededCharacterName(pageText, sessionId, pageNumber);
    const age = getSeededAge(pageText, sessionId, pageNumber);
    const gender = getSeededGender(pageText, sessionId, pageNumber);
    const emotion = getSeededEmotion(pageText, sessionId, pageNumber);
    
    console.log(`🎨 Enhanced character profile:`);
    console.log(`  - Ethnicity: ${ethnicity}`);
    console.log(`  - Character: ${character}`);
    console.log(`  - Age: ${age}`);
    console.log(`  - Gender: ${gender}`);
    console.log(`  - Emotion: ${emotion}`);
    
    // ============= PHASE 3: ENHANCED ETHNICITY-SPECIFIC FEATURES =============
    console.log(`🌍 Phase 3: Enhanced ethnicity-specific features`);
    
    let hair, features;
    
    if (ethnicity === 'African American') {
      hair = getSeededAfricanAmericanHair(gender, sessionId, pageNumber);
      features = getSeededAfricanAmericanFeatures(sessionId, pageNumber);
      console.log(`🔸 African American features applied:`);
      console.log(`  - Hair: ${hair}`);
      console.log(`  - Features: ${features}`);
    } else {
      // For non-African American ethnicities, let AI handle generation naturally
      hair = '';
      features = '';
      console.log(`🔸 AI-generated features for ${ethnicity}`);
    }
    
    // ============= PHASE 4: ENHANCED CONTEXTUAL CLOTHING =============
    console.log(`👕 Phase 4: Enhanced contextual clothing`);
    
    const clothing = detectClothingFromStory(pageText, ethnicity, gender, sessionId, pageNumber);
    console.log(`👗 Contextual clothing: ${clothing}`);
    
    // ============= PHASE 5: ENHANCED ENVIRONMENTAL ELEMENTS =============
    console.log(`🌍 Phase 5: Enhanced environmental elements`);
    
    const setting = getSeededSetting(pageText, sessionId, pageNumber);
    const atmosphere = getSeededAtmosphere(pageText, sessionId, pageNumber);
    const sensoryDetails = getSeededSensoryDetails(pageText, sessionId, pageNumber);
    const props = getSeededProps(pageText, sessionId, pageNumber);
    
    console.log(`🎯 Environmental elements:`);
    console.log(`  - Setting: ${setting}`);
    console.log(`  - Atmosphere: ${atmosphere}`);
    console.log(`  - Sensory: ${sensoryDetails}`);
    console.log(`  - Props: ${props}`);
    
    // ============= PHASE 6: ENHANCED ACTION PROCESSING =============
    console.log(`🎬 Phase 6: Enhanced action processing`);
    
    const scene = getSeededScene(pageText, sessionId, pageNumber);
    const actionIntensity = extractActionIntensity(pageText);
    const bodyLanguage = extractBodyLanguage(pageText);
    const spatialPositioning = extractSpatialPositioning(pageText);
    const actionObjects = getSeededActionObjects(pageText, sessionId, pageNumber);
    const objectInteraction = extractObjectInteraction(pageText, actionObjects);
    
    console.log(`🎭 Action elements:`);
    console.log(`  - Scene: ${scene}`);
    console.log(`  - Intensity: ${actionIntensity}`);
    console.log(`  - Body Language: ${bodyLanguage}`);
    console.log(`  - Spatial: ${spatialPositioning}`);
    console.log(`  - Objects: ${actionObjects}`);
    console.log(`  - Interaction: ${objectInteraction}`);
    
    // ============= PHASE 7: ENHANCED VISUAL COMPOSITION =============
    console.log(`📐 Phase 7: Enhanced visual composition`);
    
    const spatialComposition = getSeededSpatialComposition(pageText, sessionId, pageNumber);
    const cameraDirective = getSeededCameraDirective(pageText, sessionId, pageNumber);
    const coloredObjects = getSeededColoredObjects(pageText, sessionId, pageNumber);
    
    console.log(`📷 Visual composition:`);
    console.log(`  - Composition: ${spatialComposition}`);
    console.log(`  - Camera: ${cameraDirective}`);
    console.log(`  - Colors: ${coloredObjects}`);
    
    // ============= PHASE 8: ENHANCED COMMUNITY CONTEXT =============
    console.log(`🏘 Phase 8: Enhanced community context`);
    
    const communityContext = getSeededCommunityContext(pageText, sessionId, pageNumber);
    const secondaryCharacters = await getSeededSecondaryCharacters(pageText, sessionId, pageNumber);
    
    console.log(`👥 Community elements:`);
    console.log(`  - Community: ${communityContext}`);
    console.log(`  - Secondary: ${secondaryCharacters}`);
    
    // ============= PHASE 9: FRAMEWORK AND TEMPLATE SELECTION =============
    console.log(`🏗 Phase 9: Framework and template selection`);
    
    const difficulty = userInfo?.difficulty || 'medium';
    console.log(`📊 Difficulty level: ${difficulty}`);
    
    // Get style framework from nuclear settings
    const styleSettings = NUCLEAR_STYLE_SETTINGS[difficulty] || NUCLEAR_STYLE_SETTINGS.medium;
    const frameworkPrompt = styleSettings.frameworkPrompt;
    
    console.log(`🎨 Framework selected: ${frameworkPrompt.substring(0, 100)}...`);
    
    // Select appropriate template (PREMIUM for enhanced processing)
    const templateType = 'premium';
    const template = PREMIUM_PROMPT_TEMPLATES[difficulty] || PREMIUM_PROMPT_TEMPLATES.medium;
    
    console.log(`📋 Template type: ${templateType}`);
    console.log(`📝 Template preview: ${template.substring(0, 100)}...`);
    
    // ============= PHASE 10: COMPREHENSIVE PLACEHOLDER ASSEMBLY =============
    console.log(`🔧 Phase 10: Comprehensive placeholder assembly`);
    
    const placeholders = {
      // Technical elements
      frameworkPrompt: frameworkPrompt,
      cameraDirective: cameraDirective,
      
      // Narrative element
      pageText: pageText,
      
      // Character elements
      character: character,
      age: age,
      ethnicity: ethnicity,
      hair: hair,
      features: features,
      emotion: emotion,
      
      // Action elements
      scene: scene,
      action_intensity: actionIntensity,
      spatial_positioning: spatialPositioning,
      object_interaction: objectInteraction,
      body_language: bodyLanguage,
      
      // Composition element
      spatial_composition: spatialComposition,
      
      // Environmental elements
      setting: setting,
      atmosphere: atmosphere,
      
      // Visual elements
      props: props,
      action_objects: actionObjects,
      colored_objects: coloredObjects,
      sensory_details: sensoryDetails,
      
      // Community elements
      community_context: communityContext,
      secondary_characters: secondaryCharacters,
      
      // Additional elements for compatibility
      subject: character,
      action: scene,
      adjective: 'vibrant'
    };
    
    console.log(`📦 Placeholders assembled:`, Object.keys(placeholders).length, 'elements');
    
    // ============= PHASE 11: TEMPLATE FILLING AND FINALIZATION =============
    console.log(`🎯 Phase 11: Template filling and finalization`);
    
    const filledPrompt = await fillPromptTemplate(template, placeholders, templateType, difficulty);
    
    console.log(`✅ Enhanced prompt generation complete!`);
    console.log(`📏 Final prompt length: ${filledPrompt.length} characters`);
    
    return {
      prompt: filledPrompt,
      placeholders: placeholders,
      templateType: templateType,
      difficulty: difficulty,
      characterData: characterData,
      avatarMapping: avatarMapping,
      processingPhases: [
        'Character Consistency Integration',
        'Enhanced Seeded Character Generation',
        'Enhanced Ethnicity-Specific Features',
        'Enhanced Contextual Clothing',
        'Enhanced Environmental Elements',
        'Enhanced Action Processing',
        'Enhanced Visual Composition',
        'Enhanced Community Context',
        'Framework and Template Selection',
        'Comprehensive Placeholder Assembly',
        'Template Filling and Finalization'
      ]
    };
    
  } catch (error) {
    console.error(`❌ Enhanced story processing error:`, error.message);
    throw error;
  }
}

// ============= MAIN EDGE FUNCTION =============
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }
  
  const startTime = Date.now();
  console.log(`🚀 Tier 2.5: Nuclear Independence edge function started at ${new Date().toISOString()}`);
  
  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('📥 Request received:', requestBody);
    } catch (error) {
      console.error('❌ Request parsing error:', error.message);
      return createCorsErrorResponse('Invalid JSON in request body', 400);
    }
    
    // Validate required parameters
    const { userInfo, pageText, sessionId, pageNumber } = requestBody;
    
    if (!userInfo || !pageText || !sessionId) {
      console.error('❌ Missing required parameters');
      return createCorsErrorResponse('Missing required parameters: userInfo, pageText, sessionId', 400);
    }
    
    console.log(`🔍 Processing request - Session: ${sessionId}, Page: ${pageNumber || 1}`);
    
    // ============= MAIN PROCESSING PIPELINE =============
    console.log(`⚙️ Starting main processing pipeline`);
    
    const processingResult = await processEnhancedStoryPage(
      userInfo, 
      pageText, 
      sessionId, 
      pageNumber || 1
    );
    
    const { 
      prompt, 
      placeholders, 
      templateType, 
      difficulty, 
      characterData, 
      avatarMapping 
    } = processingResult;
    
    console.log(`✅ Processing complete - Generated prompt length: ${prompt.length} chars`);
    
    // ============= CULTURAL PROFILE AND NEGATIVE PROMPT GENERATION =============
    console.log(`🌍 Generating cultural profile and negative prompt`);
    
    let culturalProfile, negativePrompt;
    
    try {
      culturalProfile = await detectCulturalProfileForNegatives(userInfo, pageText, sessionId);
      negativePrompt = await generateNuclearNegativePrompt(culturalProfile, userInfo?.difficulty || 'medium');
      console.log(`🎭 Cultural profile: ${culturalProfile}`);
      console.log(`🚫 Negative prompt generated: ${negativePrompt.substring(0, 100)}...`);
    } catch (error) {
      console.warn(`⚠️ Cultural/negative prompt generation error: ${error.message}`);
      culturalProfile = 'universal';
      negativePrompt = 'low quality, blurred, distorted, inappropriate content';
    }
    
    // ============= IMAGE GENERATION PIPELINE =============
    console.log(`🎨 Starting image generation pipeline`);
    
    const tierPath = [];
    const attemptedTiers = [];
    let successfulTier = null;
    let enhancementLevel = 'premium';
    let fallbackReason = null;
    
    // Tier 2.5 settings
    const tier25Settings = NUCLEAR_STYLE_SETTINGS[difficulty] || NUCLEAR_STYLE_SETTINGS.medium;
    
    console.log(`🎯 Tier 2.5 settings:`, tier25Settings);
    
    try {
      tierPath.push('2.5 Nuclear Independence');
      attemptedTiers.push('2.5');
      
      console.log(`🚀 Attempting Tier 2.5: Nuclear Independence generation`);
      
      // Construct the Runware API request
      const runwareRequestPayload = [
        {
          taskType: "authentication", 
          apiKey: Deno.env.get('RUNWARE_API_KEY')
        },
        {
          taskType: "imageInference",
          taskUUID: crypto.randomUUID(),
          positivePrompt: prompt,
          negativePrompt: negativePrompt,
          height: 1024,
          width: 1024,
          model: "runware:100@1",
          steps: tier25Settings.steps,
          CFGScale: tier25Settings.CFGScale,
          outputFormat: "WEBP"
        }
      ];
      
      console.log(`📡 Runware API request constructed - Steps: ${tier25Settings.steps}, CFG: ${tier25Settings.CFGScale}`);
      
      // Make the HTTP request to Runware API
      const httpResponse = await fetch('https://api.runware.ai/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('RUNWARE_API_KEY')}`
        },
        body: JSON.stringify(runwareRequestPayload)
      });
      
      if (!httpResponse.ok) {
        throw new Error(`HTTP ${httpResponse.status}: ${httpResponse.statusText}`);
      }
      
      const httpResult = await httpResponse.json();
      const imageData = httpResult.data?.find(item => item.taskType === 'imageInference');
      
      if (imageData?.imageURL) {
        const processingTime = Date.now() - startTime;
        successfulTier = '2.5 Nuclear Independence';
        
        console.log(`✅ Tier 2.5: Nuclear Independence successful!`);
        console.log(`📊 Processing time: ${processingTime}ms`);
        console.log(`🎯 Image URL: ${imageData.imageURL}`);
        
        return createCorsResponse({
          success: true,
          imageURL: imageData.imageURL,
          prompt: prompt,
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
            objects: placeholders.action_objects || 'none',
            secondary_characters: placeholders.secondary_characters || 'none'
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
  });
  
} catch (error) {
  console.error('❌ Tier 2.5: Main function error:', error);
  return createCorsErrorResponse(error.message || 'Internal server error', 500);
}
});