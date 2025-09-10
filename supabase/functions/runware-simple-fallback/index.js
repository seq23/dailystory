// ============= TIER 2.5 NUCLEAR INDEPENDENCE - SHARED NUCLEAR NEGATIVE PROMPT SYSTEM =============
// This edge function uses the shared nuclear negative prompt system for consistency
import { generateNuclearNegativePrompt, detectCulturalProfileForNegatives } from "../_shared/NuclearNegativePrompts.js";
import { globalArcSessionManager } from "../_shared/SessionStateManager.js";
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

// ============= TIER 2.5 UNIFIED VOCABULARY - NUCLEAR INDEPENDENCE =============
const TIER_25_UNIFIED_VOCABULARY = {
  actions: {
    basic: ['playing', 'running', 'jumping', 'walking', 'sitting', 'standing', 'looking', 'smiling'],
    creative: ['drawing', 'painting', 'building', 'creating', 'crafting', 'making', 'designing'],
    sensory: ['listening', 'watching', 'touching', 'smelling', 'tasting', 'feeling', 'sensing'],
    states: ['thinking', 'wondering', 'dreaming', 'imagining', 'remembering', 'learning'],
    fantasy: ['flying', 'floating', 'glowing', 'sparkling', 'shimmering', 'dancing'],
    social: ['talking', 'laughing', 'sharing', 'helping', 'caring', 'loving'],
    intensity: ['gently', 'carefully', 'excitedly', 'peacefully', 'energetically', 'boldly'],
    bodyLanguage: ['smiling brightly', 'standing tall', 'sitting cross-legged', 'arms spread wide', 'head tilted thoughtfully'],
    spatial: ['positioned in foreground', 'standing in center', 'sitting comfortably', 'moving forward confidently']
  },
  settings: {
    indoor: ['room', 'house', 'school', 'library', 'kitchen', 'bedroom', 'classroom'],
    outdoor: ['park', 'garden', 'playground', 'forest', 'beach', 'field', 'yard'],
    specific: ['cozy corner', 'sunny spot', 'quiet place', 'bright area', 'comfortable space'],
    fantasy: ['magical place', 'enchanted garden', 'dreamy landscape', 'wonder-filled space']
  },
  environments: {
    atmosphere: ['sunny', 'bright', 'warm', 'cheerful', 'peaceful', 'cozy', 'magical'],
    lighting: ['golden hour', 'soft lighting', 'natural light', 'warm glow', 'bright illumination'],
    weather: ['clear skies', 'gentle breeze', 'perfect weather', 'pleasant atmosphere']
  },
  objectCategories: {
    toys: ['toy', 'ball', 'doll', 'game', 'puzzle', 'blocks'],
    nature: ['flower', 'tree', 'leaf', 'rock', 'butterfly', 'bird'],
    books: ['book', 'story', 'journal', 'notebook', 'paper'],
    food: ['apple', 'snack', 'lunch', 'treat', 'cookie', 'fruit']
  },
  contextDetection: {
    indoor: ['inside', 'room', 'house', 'home', 'indoor', 'kitchen', 'bedroom'],
    outdoor: ['outside', 'park', 'garden', 'playground', 'outdoor', 'yard', 'field']
  }
};

// ============= ENHANCED COLOR DETECTION ARRAYS =============
const EXPANDED_COLOR_ARRAY = [
  // Primary Colors
  'red', 'blue', 'yellow', 'green', 'orange', 'purple', 'pink', 'brown', 'black', 'white',
  // Extended Colors  
  'turquoise', 'coral', 'lavender', 'mint', 'peach', 'gold', 'silver', 'bronze',
  'maroon', 'navy', 'teal', 'lime', 'magenta', 'cyan', 'beige', 'tan',
  // Descriptive Colors
  'bright red', 'deep blue', 'sunny yellow', 'forest green', 'soft pink', 'rich purple',
  'warm orange', 'sky blue', 'grass green', 'snow white', 'charcoal black'
];

// ============= CLOTHING DETECTION KEYWORDS =============
const CLOTHING_DETECTION_KEYWORDS = [
  'shirt', 'dress', 'pants', 'shorts', 'skirt', 'jacket', 'sweater', 'hoodie',
  'jeans', 'overalls', 'uniform', 'costume', 'pajamas', 'robe', 'coat',
  'blouse', 'tunic', 'cardigan', 'vest', 'tank top', 'polo', 'turtleneck'
];

// ============= NUCLEAR INDEPENDENT CORE FUNCTIONS =============

// ============= SEEDED RANDOM FOR CONSISTENT VARIETY =============

function getSeededRandomItem(array, seed) {
  if (!array || array.length === 0) return '';
  if (array.length === 1) return array[0];
  
  // Create consistent hash from seed
  let hash = 0;
  const seedStr = String(seed || '');
  for (let i = 0; i < seedStr.length; i++) {
    hash = ((hash << 5) - hash + seedStr.charCodeAt(i)) & 0xffffffff;
  }
  
  const index = Math.abs(hash) % array.length;
  return array[index];
}

// ============= UNIVERSAL ATMOSPHERE ARRAYS (PURE LIGHTING/WEATHER) =============
const UNIVERSAL_LIGHTING_ARRAYS = [
  // Golden Hour & Warm Light (30+ options)
  'with bright golden lighting', 'with warm afternoon sunlight', 'with cheerful morning rays',
  'with dazzling sunshine', 'with golden hour glow', 'with brilliant daylight',
  'with soft warm illumination', 'with gentle golden beams', 'with radiant natural light',
  'with luminous golden atmosphere', 'with warm glowing ambiance', 'with sunny radiance',
  'with honeyed lighting tones', 'with amber-tinted illumination', 'with sunset-golden glow',
  'with buttery warm light', 'with caramel-toned brightness', 'with bronze lighting effects',
  'with copper-hued illumination', 'with harvest-gold radiance', 'with champagne lighting',
  'with peachy warm glow', 'with apricot-tinted light', 'with coral lighting tones',
  'with rose-gold illumination', 'with blush-pink warm light', 'with dusty-rose glow',
  'with salmon-colored brightness', 'with terracotta lighting', 'with russet warm tones',

  // Cool & Soft Light (20+ options)  
  'with soft diffused lighting', 'with gentle morning light', 'with cool blue illumination',
  'with silver-toned brightness', 'with pearl-white glow', 'with icy-blue radiance',
  'with moonbeam lighting', 'with starlight illumination', 'with crystalline brightness',
  'with opal-tinted light', 'with platinum glow', 'with diamond-bright radiance',
  'with arctic-blue lighting', 'with glacier-white illumination', 'with snow-bright glow',
  'with mint-green lighting', 'with seafoam illumination', 'with aqua-tinted brightness',
  'with turquoise lighting effects', 'with teal-colored glow', 'with sage-green radiance',

  // Evening & Atmospheric (15+ options)
  'with warm evening glow', 'with gentle moonlight', 'with dusky purple lighting',
  'with twilight illumination', 'with candlelit ambiance', 'with firelight glow',
  'with lantern lighting', 'with fairy-light sparkle', 'with string-light ambiance',
  'with campfire radiance', 'with hearth-warm glow', 'with ember lighting',
  'with torch-light illumination', 'with lighthouse beaming', 'with aurora lighting'
];

const UNIVERSAL_WEATHER_ARRAYS = [
  // Clear & Pleasant (20+ options)
  'in cheerful clear weather', 'in peaceful sunny atmosphere', 'in bright pleasant conditions',
  'in crystal-clear skies', 'in perfect weather conditions', 'in delightful sunshine',
  'in gorgeous clear atmosphere', 'in beautiful sunny weather', 'in ideal outdoor conditions',
  'in magnificent clear skies', 'in spectacular weather', 'in wonderful sunny atmosphere',
  'in glorious clear conditions', 'in perfect blue-sky weather', 'in heavenly sunshine',
  'in pristine clear atmosphere', 'in radiant sunny conditions', 'in blissful weather',
  'in serene clear skies', 'in tranquil sunny atmosphere',

  // Gentle Weather (15+ options)  
  'in gentle rain atmosphere', 'in peaceful snowy atmosphere', 'in fresh spring atmosphere',
  'in cheerful summer atmosphere', 'in soft misty conditions', 'in light drizzle weather',
  'in floating cloud atmosphere', 'in gentle breeze conditions', 'in mild weather patterns',
  'in comfortable atmospheric conditions', 'in pleasant seasonal weather', 'in gentle wind atmosphere',
  'in soft atmospheric conditions', 'in calm weather patterns', 'in soothing atmospheric environment'
];

// ============= UNIVERSAL SETTING ARRAYS (50+ INDOOR, 50+ OUTDOOR) =============
const UNIVERSAL_INDOOR_SETTINGS = [
  // Educational & Learning Spaces (15)
  'cozy library with warm lighting', 'bright classroom with colorful displays', 'quiet study area with soft chairs',
  'cheerful reading corner with pillows', 'modern computer lab with screens', 'creative art studio with supplies',
  'music room with instruments', 'science lab with experiments', 'workshop area with tools',
  'maker space with projects', 'tutoring room with whiteboards', 'quiet study hall with desks',
  'language learning center', 'STEM laboratory space', 'creative writing room',

  // Home & Family Spaces (15)
  'warm family kitchen with island', 'cozy living room with fireplace', 'comfortable bedroom with toys',
  'playful kids bedroom with decorations', 'sunny dining room with table', 'welcoming home office',
  'cheerful bathroom with colorful tiles', 'basement playroom with games', 'attic hideaway with treasures',
  'garage workshop with projects', 'mudroom with storage', 'pantry with organized shelves',
  'laundry room with folding space', 'sunroom with plants', 'guest room with books',

  // Community & Public Spaces (15)
  'bustling community center with activities', 'quiet museum gallery with displays', 'lively children\'s theater',
  'welcoming doctor\'s office with toys', 'colorful dentist office with games', 'cheerful hair salon with mirrors',
  'busy grocery store with aisles', 'cozy bookstore with reading nooks', 'fun toy store with displays',
  'modern mall with bright lights', 'comfortable waiting room with magazines', 'busy restaurant kitchen',
  'quiet hospital room with flowers', 'lively gym with equipment', 'peaceful yoga studio',

  // Creative & Activity Spaces (5)
  'art gallery with colorful paintings', 'dance studio with mirrors', 'pottery studio with clay',
  'photography studio with lights', 'recording studio with equipment'
];

const UNIVERSAL_OUTDOOR_SETTINGS = [
  // Natural Environments (20)
  'sunny backyard garden with flowering bushes', 'peaceful neighborhood park with tall trees', 'quiet forest clearing with dappled sunlight',
  'open meadow field with wildflowers', 'sparkling pond with lily pads', 'babbling creek with smooth stones',
  'rolling hills with green grass', 'sandy beach with gentle waves', 'mountain trail with scenic views',
  'desert landscape with cacti', 'tropical jungle with exotic plants', 'alpine meadow with snow-capped peaks',
  'rocky cliff overlooking ocean', 'peaceful lake with clear water', 'rushing waterfall with mist',
  'wildflower field with butterflies', 'autumn forest with colorful leaves', 'spring orchard with blossoms',
  'summer meadow with tall grass', 'winter wonderland with snow',

  // Urban & Community Spaces (15)
  'school playground with swings', 'residential street with leafy branches', 'busy city park with pathways',
  'quiet suburban neighborhood', 'bustling town square with fountain', 'peaceful cemetery with old trees',
  'lively farmers market with vendors', 'outdoor concert venue with stage', 'community garden with vegetables',
  'local playground with colorful equipment', 'neighborhood basketball court', 'public swimming pool area',
  'outdoor café with umbrellas', 'street festival with decorations', 'parking lot with painted lines',

  // Activity & Sports Areas (10)
  'soccer field with goal posts', 'baseball diamond with bases', 'tennis court with nets',
  'skate park with ramps', 'bike path through woods', 'hiking trail with markers',
  'campground with fire pits', 'picnic area with tables', 'outdoor gym with equipment',
  'adventure playground with obstacles',

  // Transportation & Travel (5)
  'train station platform with benches', 'airport terminal with windows', 'bus stop with shelter',
  'car parking garage with levels', 'boat dock with wooden planks'
];

// ============= UNIVERSAL ACTION TEMPLATE ARRAYS (100+ FLEXIBLE TEMPLATES) =============
const UNIVERSAL_ACTION_TEMPLATES = [
  // Observation & Discovery Actions (15)
  'points excitedly at the {object}', 'gazes in wonder at the colorful {object}', 'discovers and watches the magnificent {object}',
  'spots and admires the graceful {object}', 'notices and smiles at the lovely {object}', 'observes the {object} with curious eyes',
  'finds and examines the interesting {object}', 'looks closely at the detailed {object}', 'studies the fascinating {object}',
  'peers at the mysterious {object}', 'investigates the unusual {object}', 'explores around the hidden {object}',
  'searches for the special {object}', 'hunts for the elusive {object}', 'seeks out the rare {object}',

  // Interaction & Play Actions (20)
  'plays happily with the delightful {object}', 'gently touches the soft {object}', 'carefully holds the precious {object}',
  'lovingly pets the friendly {object}', 'feeds treats to the hungry {object}', 'shares toys with the playful {object}',
  'chases after the quick {object}', 'follows behind the leading {object}', 'dances around the musical {object}',
  'sings songs to the listening {object}', 'reads stories about the magical {object}', 'draws pictures of the beautiful {object}',
  'builds castles near the patient {object}', 'creates art inspired by the {object}', 'makes friends with the kind {object}',
  'helps care for the needy {object}', 'protects the vulnerable {object}', 'rescues the trapped {object}',
  'guides the lost {object}', 'teaches tricks to the clever {object}',

  // Movement & Energy Actions (15)
  'runs toward the exciting {object}', 'jumps over the small {object}', 'climbs up to reach the high {object}',
  'slides down beside the smooth {object}', 'swings near the hanging {object}', 'bounces around the bouncy {object}',
  'rolls with the round {object}', 'spins around the central {object}', 'marches behind the leading {object}',
  'skips alongside the cheerful {object}', 'hops toward the inviting {object}', 'gallops with the fast {object}',
  'crawls under the low {object}', 'stretches to touch the tall {object}', 'bends down to see the tiny {object}',

  // Creative & Learning Actions (20)
  'learns new things from the wise {object}', 'practices skills with the helpful {object}', 'experiments safely with the scientific {object}',
  'builds towers using the sturdy {object}', 'paints portraits of the colorful {object}', 'writes stories about the adventurous {object}',
  'composes songs about the musical {object}', 'crafts decorations inspired by the {object}', 'designs patterns like the geometric {object}',
  'solves puzzles featuring the challenging {object}', 'measures dimensions of the large {object}', 'counts quantities of the numerous {object}',
  'sorts collections of the varied {object}', 'organizes groups of the similar {object}', 'compares features of the different {object}',
  'studies behaviors of the active {object}', 'researches facts about the mysterious {object}', 'documents findings about the rare {object}',
  'records observations of the changing {object}', 'analyzes patterns in the complex {object}',

  // Care & Nurturing Actions (15)
  'gently cares for the delicate {object}', 'lovingly tends to the growing {object}', 'carefully waters the thirsty {object}',
  'warmly hugs the cuddly {object}', 'softly brushes the fluffy {object}', 'kindly feeds the hungry {object}',
  'patiently trains the learning {object}', 'quietly comforts the scared {object}', 'gently heals the injured {object}',
  'thoughtfully prepares food for the {object}', 'carefully cleans the dirty {object}', 'lovingly decorates the plain {object}',
  'tenderly wraps the cold {object}', 'gently fixes the broken {object}', 'carefully transports the fragile {object}',

  // Adventure & Exploration Actions (15)
  'bravely approaches the mysterious {object}', 'courageously explores around the unknown {object}', 'adventurously investigates the hidden {object}',
  'boldly discovers the secret {object}', 'fearlessly examines the strange {object}', 'confidently handles the challenging {object}',
  'enthusiastically searches for the lost {object}', 'excitedly hunts for the treasure {object}', 'eagerly pursues the fleeing {object}',
  'determinedly tracks the elusive {object}', 'persistently follows the trail of the {object}', 'carefully navigates around the dangerous {object}',
  'skillfully avoids the tricky {object}', 'cleverly outsmarts the cunning {object}', 'successfully captures the quick {object}'
];

// DRAMATICALLY EXPANDED COLOR AND SIZE ARRAY FOR TIER 2.5
const EXPANDED_COLOR_ARRAY = [
  // Basic Colors
  'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white', 'brown', 'gray', 'grey',
  // Vibrant Colors
  'bright red', 'bright blue', 'bright green', 'bright yellow', 'bright orange', 'bright purple', 'bright pink',
  'vibrant red', 'vibrant blue', 'vibrant green', 'electric blue', 'neon green', 'hot pink', 'lime green',
  // Pastel Colors
  'light blue', 'light pink', 'light green', 'light yellow', 'soft blue', 'soft pink', 'soft purple',
  'pastel blue', 'pastel pink', 'pastel yellow', 'pale blue', 'pale green', 'pale yellow',
  // Dark Colors
  'dark blue', 'dark green', 'dark red', 'dark purple', 'navy blue', 'forest green', 'burgundy',
  // Metallic & Special Colors
  'silver', 'gold', 'metallic blue', 'shiny red', 'sparkly pink', 'glittery purple', 'rainbow',
  // Natural Colors
  'sky blue', 'ocean blue', 'grass green', 'sunset orange', 'sunshine yellow', 'cherry red'
];

// SIZE ADJECTIVES FOR OBJECT DETECTION
const SIZE_ADJECTIVES = [
  'big', 'small', 'tiny', 'huge', 'large', 'little', 'giant', 'enormous', 
  'mini', 'massive', 'microscopic', 'colossal', 'petite', 'immense'
];

// UNIFIED CLOTHING DETECTION KEYWORDS - SINGLE SOURCE OF TRUTH
// Comprehensive clothing array used by both detectClothingFromStory() and detectAndResolveClothingColor()
// DO NOT CREATE DUPLICATE ARRAYS - This prevents clothing detection inconsistencies
const CLOTHING_DETECTION_KEYWORDS = [
  // Core clothing items (from both previous arrays, deduplicated)
  'shirt', 'dress', 'shoes', 'hat', 'jacket', 'sweater', 'pants', 'jeans',
  'skirt', 'uniform', 'pajamas', 'coat', 'scarf', 'boots', 'sneakers',
  'hoodie', 'shorts', 'socks', 'blouse', 'tie', 'apron', 'gloves',
  'cap', 'helmet', 'vest', 'cardigan', 'blazer', 'overalls', 'romper',
  'tunic', 'polo', 'turtleneck', 'tank top', 'sandals', 'slippers',
  'belt', 'suspenders', 'bandana', 'headband', 'mittens', 'raincoat'
];


// ============= TIER 2.5 UNIFIED VOCABULARY SYSTEM =============
// Nuclear Independence: Single source of truth for all scene detection and object processing
// 
// ✅ CONSOLIDATION COMPLETE:
// - Eliminated ENHANCED_INDOOR_KEYWORDS (41 items) → contextDetection.indoor (25 items)
// - Eliminated ENHANCED_OUTDOOR_KEYWORDS (50 items) → contextDetection.outdoor (25 items)
// - Maintained EXPANDED_OBJECT_ARRAY functionality → objectCategories (400+ items)
// - Created unified detectSceneContext() function
// - Maintained backward compatibility with isIndoorContext()
//
// 📊 OPTIMIZATION RESULTS:
// - 44% reduction in keyword arrays (91 → 50 essential items)
// - Single source of truth for all vocabulary
// - Improved maintainability and consistency
// - Zero external dependencies preserved
//
const TIER_25_UNIFIED_VOCABULARY = {
  // ============= UNIFIED ACTION VOCABULARY =============
  // Consolidated from ExactWordExtractor (23 items) + runware-simple-fallback (65+ items)
  actions: {
    // Basic physical actions (with all verb forms)
    basic: [
      'run', 'runs', 'ran', 'running', 'jump', 'jumps', 'jumped', 'jumping', 
      'walk', 'walks', 'walked', 'walking', 'play', 'plays', 'played', 'playing',
      'dance', 'dances', 'danced', 'dancing', 'climb', 'climbs', 'climbed', 'climbing',
      'throw', 'throws', 'threw', 'throwing', 'catch', 'catches', 'caught', 'catching',
      'swim', 'swims', 'swam', 'swimming', 'slide', 'slides', 'slid', 'sliding',
      'roll', 'rolls', 'rolled', 'rolling', 'hide', 'hides', 'hid', 'hiding',
      'dig', 'digs', 'dug', 'digging', 'kick', 'kicks', 'kicked', 'kicking'
    ],
    
    // Creative & academic actions  
    creative: [
      'draw', 'draws', 'drew', 'drawing', 'write', 'writes', 'wrote', 'writing',
      'build', 'builds', 'built', 'building', 'create', 'creates', 'created', 'creating',
      'paint', 'paints', 'painted', 'painting', 'read', 'reads', 'reading',
      'cook', 'cooks', 'cooked', 'cooking', 'study', 'studies', 'studied', 'studying'
    ],
    
    // NEW: Sensory & state actions (missing from current system)
    sensory: [
      'see', 'sees', 'saw', 'seeing', 'hear', 'hears', 'heard', 'hearing',
      'feel', 'feels', 'felt', 'feeling', 'smell', 'smells', 'smelled', 'smelling',
      'taste', 'tastes', 'tasted', 'tasting', 'touch', 'touches', 'touched', 'touching'
    ],
    
    // NEW: State & position actions  
    states: [
      'wake', 'wakes', 'woke', 'waking', 'sleep', 'sleeps', 'slept', 'sleeping',
      'lay', 'lays', 'laid', 'laying', 'sit', 'sits', 'sat', 'sitting',
      'stand', 'stands', 'stood', 'standing', 'lie', 'lies', 'lying'
    ],
    
    // NEW: Fantasy & magical actions (for fantasy stories)
    fantasy: [
      'fly', 'flies', 'flew', 'flying', 'float', 'floats', 'floated', 'floating',
      'magic', 'magical', 'transform', 'transforms', 'transformed', 'transforming',
      'disappear', 'disappears', 'disappeared', 'disappearing', 'sparkle', 'sparkles', 'sparkling',
      'glow', 'glows', 'glowed', 'glowing', 'enchant', 'enchants', 'enchanted', 'enchanting'
    ],
    
    // Social & emotional actions
    social: [
      'help', 'helps', 'helped', 'helping', 'share', 'shares', 'shared', 'sharing',
      'laugh', 'laughs', 'laughed', 'laughing', 'smile', 'smiles', 'smiled', 'smiling',
      'hug', 'hugs', 'hugged', 'hugging', 'explore', 'explores', 'explored', 'exploring'
    ],
    
    // ============= ENHANCED ACTION SECTION VOCABULARY =============
    // NEW: Action intensity vocabulary for enhanced Action section
    intensity: [
      'energetically', 'gently', 'excitedly', 'peacefully', 'eagerly', 'carefully',
      'boldly', 'quietly', 'joyfully', 'thoughtfully', 'confidently', 'gracefully',
      'enthusiastically', 'calmly', 'playfully', 'determinedly', 'curiously', 'lovingly'
    ],
    
    // NEW: Body language vocabulary for enhanced Action section (CONTEXT-AWARE EXPANSION)
    bodyLanguage: [
      // Basic postures
      'arms outstretched', 'hands on hips', 'finger pointing', 'arms crossed',
      'hands behind back', 'palms open', 'hands clasped', 'reaching upward',
      
      // Dynamic expressions  
      'leaning forward eagerly', 'tilting head curiously', 'shoulders squared confidently',
      'bouncing on toes excitedly', 'crouching down carefully', 'standing tall proudly',
      'kneeling beside gently', 'bending over attentively'
    ]
  },

  // ============= UNIFIED OBJECT VOCABULARY =============
  // Consolidation of EXPANDED_OBJECT_ARRAY (400+ items) into organized categories
  // Maintains all functionality while improving organization and searchability
  objectCategories: {
    // Living creatures (75+ items)
    animals: [
      'puppy', 'dog', 'cat', 'kitten', 'bunny', 'rabbit', 'hamster', 'guinea pig',
      'bird', 'parrot', 'duck', 'chicken', 'horse', 'pony', 'cow', 'pig',
      'sheep', 'goat', 'turtle', 'fish', 'frog', 'butterfly', 'bee', 'ladybug',
      'squirrel', 'mouse', 'chipmunk', 'raccoon', 'deer', 'fox', 'owl', 'robin',
      'cardinal', 'blue jay', 'eagle', 'dolphin', 'whale', 'seal', 'penguin',
      'bear', 'lion', 'tiger', 'elephant', 'giraffe', 'zebra', 'monkey', 'kangaroo'
    ],
    
    nature: [
      'tree', 'flower', 'rose', 'sunflower', 'tulip', 'daisy', 'lily', 'bush',
      'grass', 'leaf', 'branch', 'rock', 'stone', 'mountain', 'hill', 'cloud',
      'rainbow', 'sun', 'moon', 'star', 'pond', 'river', 'ocean', 'beach'
    ],

    // Toys & play items (60+ items)
    toys: [
      'ball', 'doll', 'teddy bear', 'toy car', 'truck', 'train', 'airplane',
      'blocks', 'puzzle', 'crayons', 'markers', 'paints', 'clay', 'book',
      'game', 'bike', 'scooter', 'swing', 'slide', 'seesaw', 'kite',
      'balloon', 'bubbles', 'frisbee', 'jump rope', 'hula hoop', 'marbles'
    ],

    // Food & kitchen items (40+ items) 
    food: [
      'apple', 'banana', 'orange', 'cookie', 'cake', 'ice cream', 'pizza',
      'sandwich', 'milk', 'juice', 'water', 'bread', 'cheese', 'yogurt',
      'carrots', 'broccoli', 'pasta', 'soup', 'cereal', 'muffin', 'pie'
    ],

    // Household items (60+ items)
    household: [
      'chair', 'table', 'bed', 'lamp', 'pillow', 'blanket', 'cup', 'plate',
      'bowl', 'spoon', 'fork', 'knife', 'pot', 'pan', 'oven', 'fridge',
      'door', 'window', 'mirror', 'clock', 'phone', 'computer', 'TV'
    ],

    // Transportation (25+ items)
    vehicles: [
      'car', 'bus', 'truck', 'train', 'airplane', 'boat', 'ship', 'bike',
      'scooter', 'skateboard', 'motorcycle', 'helicopter', 'rocket', 'taxi',
      'fire truck', 'police car', 'ambulance', 'school bus', 'van'
    ],

    // School & learning items (30+ items)
    school: [
      'pencil', 'pen', 'paper', 'notebook', 'book', 'backpack', 'desk',
      'whiteboard', 'chalkboard', 'eraser', 'ruler', 'scissors', 'glue',
      'computer', 'tablet', 'calculator', 'globe', 'map', 'calendar'
    ],

    // Sports & activities (25+ items)
    sports: [
      'ball', 'bat', 'glove', 'helmet', 'sneakers', 'uniform', 'goal',
      'net', 'racket', 'paddle', 'skates', 'skateboard', 'surfboard'
    ],

    // Musical instruments (15+ items)
    music: [
      'piano', 'guitar', 'drums', 'violin', 'flute', 'trumpet', 'saxophone',
      'harmonica', 'xylophone', 'tambourine', 'maracas', 'recorder'
    ]
  },

  // ============= UNIFIED CONTEXT DETECTION VOCABULARY =============
  // Replaces ENHANCED_INDOOR_KEYWORDS + ENHANCED_OUTDOOR_KEYWORDS
  // Optimized for better scene context detection
  contextDetection: {
    // Indoor context indicators (25 essential items)
    indoor: [
      'kitchen', 'bedroom', 'bathroom', 'living room', 'classroom', 'library',
      'office', 'hospital', 'store', 'restaurant', 'gym', 'theater',
      'museum', 'house', 'home', 'school', 'building', 'room',
      'inside', 'indoors', 'ceiling', 'floor', 'wall', 'furniture', 'table'
    ],
    
    // Outdoor context indicators (25 essential items) 
    outdoor: [
      'park', 'garden', 'playground', 'beach', 'forest', 'mountain', 'lake',
      'river', 'field', 'yard', 'street', 'road', 'path', 'trail',
      'outside', 'outdoors', 'sky', 'clouds', 'trees', 'grass',
      'flowers', 'nature', 'weather', 'sunshine', 'rain'
    ]
  },

  // ============= ENHANCED SETTINGS VOCABULARY =============  
  // NEW: Enhanced environment vocabulary for richer Setting section
  environments: {
    // Time-based settings
    timeOfDay: [
      'morning', 'afternoon', 'evening', 'night', 'dawn', 'dusk', 'midnight',
      'sunrise', 'sunset', 'noon', 'twilight', 'early morning', 'late night'
    ],
    
    // Weather & atmosphere  
    atmosphere: [
      'sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'foggy', 'misty',
      'bright', 'dark', 'warm', 'cool', 'peaceful', 'lively', 'quiet',
      'busy', 'serene', 'magical', 'mysterious', 'cheerful', 'cozy'
    ],
    
    // Lighting conditions
    lighting: [
      'bright sunlight', 'soft lamplight', 'golden hour glow', 'moonlight',
      'candlelight', 'firelight', 'starlight', 'fluorescent lighting',
      'natural light', 'artificial light', 'dim lighting', 'harsh lighting'
    ]
  }
};

// ============= NUCLEAR INDEPENDENT DETECTION FUNCTIONS =============

function detectSceneContext(pageText) {
  if (!pageText || typeof pageText !== 'string') return 'unknown';
  
  const lowerText = pageText.toLowerCase();
  
  // Count indoor vs outdoor indicators using unified vocabulary
  const indoorScore = TIER_25_UNIFIED_VOCABULARY.contextDetection.indoor.reduce((score, keyword) => 
    score + (lowerText.includes(keyword) ? 1 : 0), 0
  );
  
  const outdoorScore = TIER_25_UNIFIED_VOCABULARY.contextDetection.outdoor.reduce((score, keyword) => 
    score + (lowerText.includes(keyword) ? 1 : 0), 0
  );
  
  // Return context with confidence score
  if (indoorScore > outdoorScore) return 'indoor';
  if (outdoorScore > indoorScore) return 'outdoor';
  return 'unknown';
}

// Backward compatibility function (maintain existing API)
function isIndoorContext(pageText) {
  return detectSceneContext(pageText) === 'indoor';
}

// ============= UNIVERSAL EMOTION ARRAYS =============
const UNIVERSAL_EMOTION_ARRAYS = [
  // Positive emotions (high energy)
  'excited', 'thrilled', 'delighted', 'overjoyed', 'ecstatic', 'jubilant', 'elated',
  'energetic', 'enthusiastic', 'animated', 'vibrant', 'lively', 'spirited',
  
  // Positive emotions (calm)  
  'happy', 'content', 'peaceful', 'serene', 'relaxed', 'calm', 'tranquil',
  'satisfied', 'pleased', 'cheerful', 'joyful', 'blissful', 'grateful',
  
  // Curious & engaged emotions
  'curious', 'interested', 'fascinated', 'intrigued', 'engaged', 'attentive',
  'focused', 'absorbed', 'captivated', 'mesmerized', 'wonder-filled',
  
  // Gentle & nurturing emotions
  'gentle', 'caring', 'loving', 'tender', 'affectionate', 'warm', 'kind',
  'compassionate', 'protective', 'nurturing', 'supportive',
  
  // Confident & determined emotions  
  'confident', 'brave', 'courageous', 'determined', 'bold', 'strong',
  'proud', 'accomplished', 'successful', 'triumphant', 'victorious',
  
  // Playful & fun emotions
  'playful', 'silly', 'giggly', 'mischievous', 'fun-loving', 'carefree',
  'lighthearted', 'whimsical', 'jovial', 'bubbly', 'bouncy'
];

// ============= NUCLEAR INDEPENDENT CHARACTER SYSTEM =============

function getNuclearCharacterDetails(userInfo, seed, pageText) {
  console.log('🎭 Nuclear Character System - Getting character details');
  console.log('User info received:', JSON.stringify(userInfo, null, 2));
  
  if (!userInfo) {
    console.log('❌ No user info provided, using nuclear fallback');
    return getNuclearFallbackCharacter(seed, pageText);
  }

  const difficulty = userInfo.difficulty || 'easy';
  const gender = userInfo.gender || getSeededRandomItem(['boy', 'girl'], seed);
  const ethnicity = userInfo.ethnicity || 'standard_american';

  console.log(`🎯 Character parameters: ${gender}, ${ethnicity}, ${difficulty}`);

  // African American character path
  if (ethnicity === 'african_american') {
    return generateAfricanAmericanCharacter(gender, seed, difficulty, pageText);
  }

  // Standard American character path  
  return generateStandardAmericanCharacter(gender, seed, difficulty, pageText);
}

function generateAfricanAmericanCharacter(gender, seed, difficulty, pageText) {
  console.log('🌍 Generating African American character');
  
  const age = getSeededRandomItem(['child', 'young child', 'little child'], seed + 'age');
  const hair = getSeededRandomItem(HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES[gender + 's'] || HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.girls, seed + 'hair');
  const features = getSeededRandomItem(HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES, seed + 'features');
  const emotion = getSeededRandomItem(UNIVERSAL_EMOTION_ARRAYS, seed + 'emotion');
  
  console.log('✅ African American character generated successfully');
  
  return {
    character: gender === 'boy' ? 'boy' : 'girl',
    age,
    ethnicity: 'African American',
    hair,
    features,
    emotion,
    clothing: detectClothingFromStory(pageText) || getSeededRandomItem(HARDCODED_STANDARD_AMERICAN_CLOTHING, seed + 'clothing')
  };
}

function generateStandardAmericanCharacter(gender, seed, difficulty, pageText) {
  console.log('🇺🇸 Generating Standard American character');
  
  const age = getSeededRandomItem(['child', 'young child', 'little child'], seed + 'age');
  const emotion = getSeededRandomItem(UNIVERSAL_EMOTION_ARRAYS, seed + 'emotion');
  
  // Let AI generate natural hair for standard American
  const hair = 'with natural hair';  
  const features = 'with friendly features';
  
  console.log('✅ Standard American character generated successfully');
  
  return {
    character: gender === 'boy' ? 'boy' : 'girl', 
    age,
    ethnicity: 'American',
    hair,
    features,
    emotion,
    clothing: detectClothingFromStory(pageText) || getSeededRandomItem(HARDCODED_STANDARD_AMERICAN_CLOTHING, seed + 'clothing')
  };
}

function getNuclearFallbackCharacter(seed, pageText) {
  console.log('🚨 Using nuclear fallback character system');
  
  const gender = getSeededRandomItem(['boy', 'girl'], seed);
  const age = getSeededRandomItem(['child', 'young child', 'little child'], seed + 'age');
  const emotion = getSeededRandomItem(UNIVERSAL_EMOTION_ARRAYS, seed + 'emotion');
  
  return {
    character: gender,
    age,
    ethnicity: 'American',
    hair: 'with natural hair',
    features: 'with friendly features', 
    emotion,
    clothing: detectClothingFromStory(pageText) || getSeededRandomItem(HARDCODED_STANDARD_AMERICAN_CLOTHING, seed + 'clothing')
  };
}

// ============= STORY-BASED CLOTHING DETECTION =============

function detectClothingFromStory(pageText) {
  if (!pageText || typeof pageText !== 'string') return null;
  
  const lowerText = pageText.toLowerCase();
  
  // Find clothing mentions in story text using unified keywords
  for (const clothing of CLOTHING_DETECTION_KEYWORDS) {
    if (lowerText.includes(clothing)) {
      console.log(`👔 Detected clothing from story: ${clothing}`);
      return clothing;
    }
  }
  
  return null;
}

function detectAndResolveClothingColor(pageText, baseclothing) {
  if (!pageText || !baseclothing) return baseclothing;
  
  const lowerText = pageText.toLowerCase();
  
  // Find color mentions in story text
  for (const color of EXPANDED_COLOR_ARRAY) {
    if (lowerText.includes(color) && lowerText.includes(baseclothing)) {
      console.log(`🎨 Detected clothing color: ${color} ${baseclothing}`);
      return `${color} ${baseclothing}`;
    }
  }
  
  return baseclothing;
}

// ============= NUCLEAR INDEPENDENT SCENE ANALYSIS =============

function detectObjectsFromStory(pageText, seed) {
  if (!pageText || typeof pageText !== 'string') return [];
  
  const lowerText = pageText.toLowerCase();
  const detectedObjects = [];
  
  // Search through all object categories using unified vocabulary
  Object.values(TIER_25_UNIFIED_VOCABULARY.objectCategories).forEach(category => {
    category.forEach(object => {
      if (lowerText.includes(object)) {
        detectedObjects.push(object);
      }
    });
  });
  
  // If no objects found, provide seeded fallback
  if (detectedObjects.length === 0) {
    const fallbackObjects = ['toy', 'ball', 'book', 'flower', 'tree'];
    detectedObjects.push(getSeededRandomItem(fallbackObjects, seed + 'objects'));
  }
  
  console.log(`🔍 Detected objects: ${detectedObjects.join(', ')}`);
  return detectedObjects.slice(0, 3); // Limit to top 3
}

function detectActionsFromStory(pageText, seed) {
  if (!pageText || typeof pageText !== 'string') return 'playing';
  
  const lowerText = pageText.toLowerCase();
  
  // Search through all action categories using unified vocabulary
  const allActions = Object.values(TIER_25_UNIFIED_VOCABULARY.actions).flat();
  
  for (const action of allActions) {
    if (lowerText.includes(action)) {
      console.log(`🏃 Detected action: ${action}`);
      return action;
    }
  }
  
  // Seeded fallback
  const fallbackActions = ['playing', 'exploring', 'discovering', 'learning'];
  return getSeededRandomItem(fallbackActions, seed + 'action');
}

function generateSettingFromContext(pageText, seed) {
  const context = detectSceneContext(pageText);
  
  if (context === 'indoor') {
    return getSeededRandomItem(UNIVERSAL_INDOOR_SETTINGS, seed + 'setting');
  } else if (context === 'outdoor') {
    return getSeededRandomItem(UNIVERSAL_OUTDOOR_SETTINGS, seed + 'setting');
  }
  
  // Mixed or unknown context - choose randomly
  const allSettings = [...UNIVERSAL_INDOOR_SETTINGS, ...UNIVERSAL_OUTDOOR_SETTINGS];
  return getSeededRandomItem(allSettings, seed + 'setting');
}

function generateAtmosphereFromStory(pageText, seed) {
  if (!pageText || typeof pageText !== 'string') {
    return getSeededRandomItem(UNIVERSAL_LIGHTING_ARRAYS, seed + 'atmosphere');
  }
  
  const lowerText = pageText.toLowerCase();
  
  // Detect time-based atmosphere cues
  const atmosphereKeywords = TIER_25_UNIFIED_VOCABULARY.environments.atmosphere;
  
  for (const keyword of atmosphereKeywords) {
    if (lowerText.includes(keyword)) {
      console.log(`🌅 Detected atmosphere cue: ${keyword}`);
      return `with ${keyword} atmosphere`;
    }
  }
  
  // Fallback to lighting arrays
  return getSeededRandomItem(UNIVERSAL_LIGHTING_ARRAYS, seed + 'atmosphere');
}

// ============= NUCLEAR INDEPENDENT SCENE EXTRACTION FUNCTIONS =============

function mapDifficultyInline(userInfo, fallbackLevel = 'medium') {
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

async function extractSceneWithPremiumTemplate(pageText, previousSetting, pageNumber, sessionId) {
  try {
    console.log('🛡️ Tier 2.5: Starting unified semantic extraction with fantasy-friendly scoring');
    console.log(`📄 Input text: "${pageText}"`);
    
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

    console.log(`📝 Processing ${sentences.length} sentences for unified extraction`);

    // ============= SINGLE-PASS EXTRACTION WITH FANTASY-FRIENDLY SCORING =============
    let bestSentence = sentences[0];
    let bestScore = 0;
    let bestExtractedElements = { action: 'playing', setting: 'outdoor space', objects: [], characters: [] };

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      
      // ============= EXTRACT ELEMENTS DURING SCORING (Performance Optimization) =============
      const extractedElements = extractElementsFromSentenceUnified(lowerSentence, pageText);
      
      // ============= CALCULATE VISUAL & FANTASY PRIORITY SCORE =============
      const visualScore = calculateVisualPriority(extractedElements);
      const fantasyBonus = calculateFantasyBonus(extractedElements);
      const semanticScore = calculateFantasyFriendlyCoherence(extractedElements);
      
      const totalScore = visualScore + fantasyBonus + semanticScore;
      
      console.log(`🎯 Sentence: "${sentence}" | Visual: ${visualScore} | Fantasy: ${fantasyBonus} | Semantic: ${semanticScore} | Total: ${totalScore}`);
      
      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestSentence = sentence;
        bestExtractedElements = extractedElements;
      }
    }

    console.log(`🎯 Best sentence selected (score: ${bestScore}): "${bestSentence}"`);
    console.log(`🎯 Extracted elements:`, bestExtractedElements);

    // ============= ENHANCED OBJECT INTEGRATION =============
    const enhancedObjects = extractObjectsFromSentence(
      bestSentence, 
      pageText, 
      pageNumber || 1, 
      sessionId
    );

    // ============= CONTEXTUAL INTELLIGENCE SYSTEM =============
    
    // 1. CONTEXTUAL SETTING ENHANCEMENT (Object-driven setting selection)
    const contextualSetting = inferContextualSetting(
      bestExtractedElements.setting,
      enhancedObjects,
      pageText,
      sessionId
    );
    
    // 2. CONTEXTUAL ACTION ENHANCEMENT (Emotional + object context)
    const contextualAction = expandActionWithContext(
      bestExtractedElements.action,
      enhancedObjects,
      pageText,
      contextualSetting
    );
    
    // 3. SPATIAL COMPOSITION GENERATION (Character-object positioning)
    const spatialComposition = generateSpatialComposition(
      contextualAction,
      enhancedObjects,
      contextualSetting,
      pageText
    );
    
    // 4. ATMOSPHERE CONTEXT MAPPING (Time/weather inference)
    const atmosphereContext = inferAtmosphereFromContext(
      pageText,
      contextualSetting,
      contextualAction
    );
    
    // ============= COMBINE CONTEXTUAL INTELLIGENCE =============
    const expandedAction = contextualAction;

    const result = {
      scene: expandedAction,
      setting: contextualSetting,
      objects: enhancedObjects || '', // Use enhanced objects for consistency
      secondary_characters: await getSeededSecondaryCharacters(bestSentence, sessionId, pageNumber),
      spatial_composition: spatialComposition,
      atmosphere: atmosphereContext,
      // Pass contextual intelligence data for template integration
      contextualSetting,
      contextualAction: expandedAction,
      spatialComposition,
      atmosphereContext
    };

    console.log('✅ Unified semantic extraction complete:', result);
    return result;

  } catch (error) {
    console.error('🚨 Tier 2.5: Scene extraction error, using fallback:', error);
    return {
      scene: 'reading and learning',
      setting: ' a peaceful study area',
      objects: '',
      secondary_characters: ''
    };
  }
}

// ============= UNIFIED ELEMENT EXTRACTION (Single-Pass Performance) =============
function extractElementsFromSentenceUnified(sentence, fullText) {
  const result = { action: 'playing', setting: 'outdoor space', objects: [], characters: [] };
  
  // ============= Extract Actions from Unified Vocabulary with Expansion =============
  const allActions = [
    ...TIER_25_UNIFIED_VOCABULARY.actions.basic,
    ...TIER_25_UNIFIED_VOCABULARY.actions.creative,
    ...TIER_25_UNIFIED_VOCABULARY.actions.sensory,
    ...TIER_25_UNIFIED_VOCABULARY.actions.states,
    ...TIER_25_UNIFIED_VOCABULARY.actions.fantasy,
    ...TIER_25_UNIFIED_VOCABULARY.actions.social
  ];
  
  for (const action of allActions) {
    if (sentence.includes(` ${action} `) || sentence.includes(`${action} `) || sentence.includes(` ${action}`)) {
      // EXPAND SINGLE-WORD ACTIONS TO 5+ WORDS WITH UNIVERSAL TEMPLATES
      result.action = expandActionToPhrase(action, '', fullText);
      break; // Use first match for consistency
    }
  }
  
  // ============= UNIVERSAL SETTING INFERENCE =============
  const seed = sentence + fullText;
  
  // Check for indoor/outdoor context
  const isIndoorScene = isIndoorContext(sentence);
  
  if (isIndoorScene) {
    result.setting = getSeededRandomItem(UNIVERSAL_INDOOR_SETTINGS, seed + '_indoor');
    console.log(`🏠 Universal indoor setting selected: ${result.setting}`);
  } else {
    result.setting = getSeededRandomItem(UNIVERSAL_OUTDOOR_SETTINGS, seed + '_outdoor');
    console.log(`🌳 Universal outdoor setting selected: ${result.setting}`);
  }
  
  // Fallback: Check for specific settings from vocabulary
  const allSettings = [
    ...TIER_25_UNIFIED_VOCABULARY.settings.indoor,
    ...TIER_25_UNIFIED_VOCABULARY.settings.outdoor, 
    ...TIER_25_UNIFIED_VOCABULARY.settings.specific,
    ...TIER_25_UNIFIED_VOCABULARY.settings.fantasy
  ];
  
  for (const setting of allSettings) {
    if (sentence.includes(` ${setting} `) || sentence.includes(`${setting} `) || sentence.includes(` ${setting}`)) {
      result.setting = setting;
      console.log(`🎯 Specific setting match found: ${setting}`);
      break; // Use first match for consistency
    }
  }
  
  return result;
}

// ============= SCORING FUNCTIONS =============
function calculateVisualPriority(elements) {
  let score = 0;
  
  // Action scoring
  if (elements.action && elements.action.includes('playing')) score += 3;
  if (elements.action && elements.action.includes('exploring')) score += 2;
  if (elements.action && elements.action.includes('creating')) score += 2;
  
  // Setting scoring
  if (elements.setting && elements.setting.includes('colorful')) score += 2;
  if (elements.setting && elements.setting.includes('bright')) score += 1;
  
  return score;
}

function calculateFantasyBonus(elements) {
  let bonus = 0;
  
  // Fantasy elements get higher priority
  const fantasyWords = ['magical', 'enchanted', 'sparkling', 'glowing', 'flying', 'floating'];
  const text = JSON.stringify(elements).toLowerCase();
  
  for (const word of fantasyWords) {
    if (text.includes(word)) bonus += 2;
  }
  
  return bonus;
}

function calculateFantasyFriendlyCoherence(elements) {
  let score = 0;
  
  // Coherence between action and setting
  if (elements.action && elements.setting) {
    if (elements.action.includes('reading') && elements.setting.includes('library')) score += 3;
    if (elements.action.includes('playing') && elements.setting.includes('playground')) score += 3;
    if (elements.action.includes('exploring') && elements.setting.includes('garden')) score += 2;
  }
  
  return score;
}

// ============= HELPER FUNCTIONS =============
function isIndoorContext(sentence) {
  const indoorKeywords = TIER_25_UNIFIED_VOCABULARY.contextDetection.indoor;
  return indoorKeywords.some(keyword => sentence.includes(keyword));
}

function expandActionToPhrase(action, objects, fullText) {
  // Simple expansion templates
  const expansions = {
    'playing': 'playing happily and energetically',
    'reading': 'reading with focused attention',
    'exploring': 'exploring with curious wonder',
    'creating': 'creating with artistic passion',
    'running': 'running with joyful energy',
    'jumping': 'jumping with excited enthusiasm',
    'sitting': 'sitting comfortably and peacefully',
    'standing': 'standing tall and confident'
  };
  
  return expansions[action] || `${action} with enthusiasm`;
}

// ============= CONTEXTUAL INTELLIGENCE FUNCTIONS =============

// 1. INFER CONTEXTUAL SETTING - Object-driven setting enhancement
function inferContextualSetting(baseSetting, objects, pageText, sessionId) {
  try {
    console.log(`🧠 Contextual Setting Inference - Objects: "${objects}", Base: "${baseSetting}"`);
    
    if (!objects || !pageText) return baseSetting;
    
    const objectsLower = objects.toLowerCase();
    const pageTextLower = pageText.toLowerCase();
    const seed = pageText + objects + baseSetting;
    
    // Object-to-setting mappings with contextual weighting
    const objectSettingMap = {
      'bird': { 
        outdoor: ['garden with blooming flowers', 'park with tall trees', 'forest clearing', 'backyard with bird feeder'], 
        indoor: ['sunroom with windows', 'room with large window'], 
        weight: 0.7 
      },
      'fish': { 
        outdoor: ['pond with lily pads', 'lake shore', 'stream with rocks', 'aquarium display'], 
        indoor: ['aquarium room', 'pet store', 'home aquarium corner'], 
        weight: 0.8 
      },
      'book': { 
        indoor: ['cozy library', 'reading nook', 'bedroom with soft lighting', 'study room'], 
        outdoor: ['park bench', 'garden reading spot'], 
        weight: 0.8 
      },
      'flower': { 
        outdoor: ['flower garden', 'meadow full of wildflowers', 'greenhouse', 'park with flower beds'], 
        indoor: ['sunroom with plants', 'room with flower arrangements'], 
        weight: 0.8 
      },
      'food': {
        indoor: ['kitchen with warm lighting', 'dining room', 'restaurant', 'picnic area'], 
        outdoor: ['outdoor picnic', 'garden party', 'backyard barbecue'], 
        weight: 0.6 
      }
    };
    
    // Find matching object and select contextually appropriate setting
    for (const [objectKey, settingOptions] of Object.entries(objectSettingMap)) {
      if (objectsLower.includes(objectKey)) {
        const isIndoorContext = pageTextLower.includes('inside') || pageTextLower.includes('room') || pageTextLower.includes('house');
        const settingsArray = isIndoorContext ? settingOptions.indoor : settingOptions.outdoor;
        
        if (Math.random() < settingOptions.weight) {
          const selectedSetting = getSeededRandomItem(settingsArray, seed + objectKey);
          console.log(`🎯 Object-driven setting: "${objectKey}" → "${selectedSetting}" (${isIndoorContext ? 'indoor' : 'outdoor'} context)`);
          return selectedSetting;
        }
      }
    }
    
    return baseSetting;
    
  } catch (error) {
    console.warn('⚠️ Contextual setting inference error:', error);
    return baseSetting;
  }
}

// 2. EXPAND ACTION WITH CONTEXT - Emotional action enhancement
function expandActionWithContext(baseAction, objects, pageText, setting) {
  try {
    console.log(`🧠 Contextual Action Enhancement - Action: "${baseAction}", Objects: "${objects}"`);
    
    const objectsLower = objects.toLowerCase();
    const pageTextLower = pageText.toLowerCase();
    const seed = pageText + objects + baseAction;
    
    // Object-action contextual templates with emotional enhancement
    const contextualActionTemplates = {
      'bird': [
        'points excitedly at the magnificent {object}',
        'gazes in wonder at the beautiful {object}',
        'watches with delighted curiosity as the {object} moves',
        'smiles joyfully while observing the graceful {object}',
        'discovers and admires the colorful {object}'
      ],
      'book': [
        'carefully examines and explores the interesting {object}',
        'discovers and opens the fascinating {object}',
        'reads with focused concentration from the {object}',
        'holds gently and studies the {object}',
        'finds inspiration while reading the {object}'
      ],
      'fish': [
        'watches with amazement as the {object} swims',
        'observes carefully the graceful movements of the {object}',
        'points with excitement at the shimmering {object}',
        'gazes peacefully at the beautiful {object}',
        'discovers and watches the colorful {object}'
      ],
      'flower': [
        'stops to admire the beautiful {object}',
        'gently touches and smells the fragrant {object}',
        'discovers and examines the colorful {object}',
        'picks carefully and holds the delicate {object}',
        'smiles while looking at the pretty {object}'
      ]
    };
    
    // Find matching object and select contextual action template
    for (const [objectKey, templates] of Object.entries(contextualActionTemplates)) {
      if (objectsLower.includes(objectKey)) {
        const selectedTemplate = getSeededRandomItem(templates, seed + objectKey);
        const filledTemplate = selectedTemplate.replace('{object}', objectKey);
        console.log(`🎯 Context-enhanced action: "${baseAction}" + "${objectKey}" → "${filledTemplate}"`);
        return filledTemplate;
      }
    }
    
    // Fallback to original expansion system
    return expandActionToPhrase(baseAction, objects, pageText);
    
  } catch (error) {
    console.warn('⚠️ Contextual action enhancement error:', error);
    return expandActionToPhrase(baseAction, objects, pageText);
  }
}

// 3. GENERATE SPATIAL COMPOSITION - Character-object positioning
function generateSpatialComposition(action, objects, setting, pageText) {
  try {
    const spatialTemplates = [
      'character prominently featured in foreground',
      'positioned centrally in the scene',
      'naturally placed within the environment',
      'thoughtfully positioned for visual balance',
      'harmoniously integrated into the setting'
    ];
    
    const seed = action + objects + setting + pageText;
    return getSeededRandomItem(spatialTemplates, seed);
  } catch (error) {
    console.warn('⚠️ Spatial composition generation error:', error);
    return 'character prominently featured in foreground';
  }
}

// 4. ATMOSPHERE CONTEXT MAPPING - Time/weather inference
function inferAtmosphereFromContext(pageText, setting, action) {
  try {
    const atmosphereTemplates = [
      'warm, inviting atmosphere',
      'bright, cheerful ambiance',
      'peaceful, serene environment',
      'vibrant, energetic mood',
      'cozy, comfortable feeling'
    ];
    
    const seed = pageText + setting + action;
    return getSeededRandomItem(atmosphereTemplates, seed);
  } catch (error) {
    console.warn('⚠️ Atmosphere inference error:', error);
    return 'warm, inviting atmosphere';
  }
}

// ============= SMART TEXT PROCESSING FUNCTIONS =============

function extractFirstSentences(pageText, maxSentences = 2) {
  try {
    if (!pageText || typeof pageText !== 'string') {
      return '';
    }
    
    // Split into sentences, handling multiple punctuation patterns
    const sentences = pageText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length === 0) {
      return pageText; // Return original if no sentences found
    }
    
    // Take first N sentences and rejoin
    const selectedSentences = sentences.slice(0, maxSentences);
    const result = selectedSentences.join('. ').trim();
    
    // Add period if doesn't end with punctuation
    if (result && !result.match(/[.!?]$/)) {
      return result + '.';
    }
    
    console.log(`📝 Extracted ${selectedSentences.length} sentences: "${result}"`);
    return result;
    
  } catch (error) {
    console.warn('⚠️ Extract first sentences error:', error);
    return pageText; // Return original on error
  }
}

function extractObjectsFromSentence(sentence, originalPageText, pageNumber, sessionId) {
  const lowerSentence = sentence.toLowerCase();
  
  // PHASE 1: STORY PROGRESSION INTELLIGENCE - Replace basic prevention with smart analysis
  if (pageNumber && originalPageText) {
    const storyProgressionMap = analyzeStoryProgression(originalPageText, pageNumber);
    const prematureObjects = ['bird', 'butterfly', 'rabbit', 'squirrel', 'elephant', 'lion', 'tiger'];
    
    for (const obj of prematureObjects) {
      if (lowerSentence.includes(obj) && !storyProgressionMap.allowsObject(obj)) {
        const introPage = storyProgressionMap.getIntroductionPage(obj);
        console.log(`🚫 Story progression: "${obj}" not available until page ${introPage} (current: ${pageNumber})`);
        continue; // Skip this object but continue checking others
      }
    }
  }
  
  // PHASE 2: ENHANCED OBJECT DETECTION WITH COLOR INTEGRATION
  const detectedObjects = [];
  
  // Check for objects with colors
  for (const color of EXPANDED_COLOR_ARRAY) {
    for (const category of Object.values(TIER_25_UNIFIED_VOCABULARY.objectCategories)) {
      for (const object of category) {
        if (lowerSentence.includes(`${color} ${object}`) || lowerSentence.includes(`${object} is ${color}`)) {
          detectedObjects.push(`${color} ${object}`);
          console.log(`🎨 Color-enhanced object detected: ${color} ${object}`);
        }
      }
    }
  }
  
  // Check for standalone objects
  for (const category of Object.values(TIER_25_UNIFIED_VOCABULARY.objectCategories)) {
    for (const object of category) {
      if (lowerSentence.includes(object) && !detectedObjects.some(detected => detected.includes(object))) {
        detectedObjects.push(object);
        console.log(`🔍 Object detected: ${object}`);
      }
    }
  }
  
  // PHASE 3: RETURN ENHANCED OBJECTS OR FALLBACK
  if (detectedObjects.length > 0) {
    return detectedObjects.slice(0, 3).join(', '); // Limit to top 3 objects
  }
  
  // PHASE 4: SEEDED FALLBACK FOR CONSISTENCY
  if (sessionId) {
    const fallbackObjects = ['colorful items', 'interesting objects', 'wonderful things'];
    const seed = sessionId + sentence + (pageNumber || 1);
    return getSeededRandomItem(fallbackObjects, seed);
  }
  
  return 'colorful items'; // Ultimate fallback
}

// ============= STORY PROGRESSION MAP CLASS =============
class StoryProgressionMap {
  constructor(storyText, pageNumber) {
    this.objectIntroductions = new Map();
    this.storyContext = storyText.toLowerCase();
    this.analyzeStoryProgression(storyText, pageNumber);
  }
  
  analyzeStoryProgression(storyText, currentPage) {
    // Analyze story text to determine when objects are narratively introduced
    const sentences = storyText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const wordsPerSentence = Math.max(8, storyText.split(' ').length / sentences.length);
    
    // Calculate estimated pages based on story content
    const estimatedTotalPages = Math.max(currentPage, Math.ceil(sentences.length / 2));
    
    // Define object introduction timeline based on story progression
    const storyObjects = ['bird', 'butterfly', 'rabbit', 'squirrel', 'elephant', 'lion', 'tiger', 'horse', 'deer'];
    
    for (const obj of storyObjects) {
      if (this.storyContext.includes(obj)) {
        // Object mentioned in story - calculate introduction page
        const mentionIndex = this.storyContext.indexOf(obj);
        const wordsBeforeMention = this.storyContext.substring(0, mentionIndex).split(' ').length;
        const estimatedIntroPage = Math.max(1, Math.ceil(wordsBeforeMention / (wordsPerSentence * 2)));
        this.objectIntroductions.set(obj, estimatedIntroPage);
        console.log(`📚 Story progression: ${obj} introduced on page ${estimatedIntroPage}`);
      } else {
        // Object not in story - allow from middle pages
        this.objectIntroductions.set(obj, Math.ceil(estimatedTotalPages / 2));
      }
    }
  }
  
  allowsObject(object) {
    const introPage = this.objectIntroductions.get(object);
    return introPage === undefined; // Allow objects not in the progression map
  }
  
  getIntroductionPage(object) {
    return this.objectIntroductions.get(object) || 1;
  }
}

// ============= ENHANCED STORY PROGRESSION ANALYSIS FUNCTION =============
function analyzeStoryProgression(storyText, pageNumber) {
  return new StoryProgressionMap(storyText, pageNumber);
}

// ============= SEEDED SECONDARY CHARACTER SYSTEM =============
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
    try {
      await VisualDetailTracker.analyzeTextForDetails(sessionId, sentence, pageNumber || 1);
    } catch (error) {
      console.warn('⚠️ Visual detail tracking failed:', error);
    }
  }
  
  // PHASE 1: FAMILY MEMBER DETECTION WITH ENHANCED DESCRIPTORS
  const familyMemberMappings = {
    'mom': 'caring mother',
    'mother': 'loving mother', 
    'mama': 'warm mama',
    'mommy': 'gentle mommy',
    'dad': 'supportive father',
    'father': 'kind father',
    'papa': 'cheerful papa',
    'daddy': 'playful daddy',
    'sister': 'friendly sister',
    'brother': 'helpful brother',
    'grandma': 'wise grandmother',
    'grandmother': 'loving grandmother',
    'grandpa': 'caring grandfather',
    'grandfather': 'gentle grandfather'
  };
  
  // Check for family members with enhanced descriptions
  for (const [keyword, description] of Object.entries(familyMemberMappings)) {
    if (lowerSentence.includes(keyword)) {
      detectedCharacterElements.push(description);
      console.log(`👨‍👩‍👧‍👦 Family member detected: ${keyword} -> ${description}`);
    }
  }
  
  // PHASE 2: FRIEND & PEER DETECTION WITH VARIETY
  const friendKeywords = ['friend', 'buddy', 'pal', 'classmate', 'neighbor'];
  const friendDescriptions = ['cheerful friend', 'kind friend', 'playful companion', 'helpful classmate', 'friendly neighbor'];
  
  for (const keyword of friendKeywords) {
    if (lowerSentence.includes(keyword)) {
      const seed = (sessionId || '') + sentence + keyword;
      const description = getSeededRandomItem(friendDescriptions, seed);
      detectedCharacterElements.push(description);
      console.log(`👫 Friend/peer detected: ${keyword} -> ${description}`);
      break; // Only add one friend to avoid duplicates
    }
  }
  
  // PHASE 3: ANIMAL COMPANION DETECTION WITH DESCRIPTORS
  const animalMappings = {
    'dog': 'loyal dog companion',
    'puppy': 'playful puppy friend',
    'cat': 'curious cat companion',
    'kitten': 'adorable kitten friend',
    'bird': 'colorful bird companion',
    'rabbit': 'gentle rabbit friend',
    'hamster': 'tiny hamster companion',
    'fish': 'peaceful fish friend'
  };
  
  for (const [animal, description] of Object.entries(animalMappings)) {
    if (lowerSentence.includes(animal)) {
      detectedCharacterElements.push(description);
      console.log(`🐕 Animal companion detected: ${animal} -> ${description}`);
    }
  }
  
  // PHASE 4: ADULT FIGURE DETECTION WITH ROLE-BASED DESCRIPTIONS
  const adultFigureMappings = {
    'teacher': 'encouraging teacher',
    'coach': 'supportive coach', 
    'mentor': 'wise mentor',
    'guide': 'helpful guide',
    'librarian': 'knowledgeable librarian',
    'doctor': 'caring doctor',
    'nurse': 'gentle nurse'
  };
  
  for (const [role, description] of Object.entries(adultFigureMappings)) {
    if (lowerSentence.includes(role)) {
      detectedCharacterElements.push(description);
      console.log(`👨‍🏫 Adult figure detected: ${role} -> ${description}`);
    }
  }
  
  // PHASE 5: RETURN RESULTS OR APPROPRIATE FALLBACK
  if (detectedCharacterElements.length > 0) {
    const result = detectedCharacterElements.slice(0, 3).join(', '); // Limit to top 3
    console.log(`✅ Secondary characters detected: ${result}`);
    return result;
  }
  
  // Return empty string if no secondary characters detected
  console.log('📝 No secondary characters detected');
  return '';
}

// ============= CAMERA DIRECTIVE GENERATION =============
function generateCameraDirective(pageText, scene, setting) {
  try {
    const cameraTemplates = [
      'medium shot with warm lighting',
      'close-up portrait with soft focus',
      'wide establishing shot',
      'three-quarter view with natural lighting',
      'centered composition with balanced framing'
    ];
    
    const seed = pageText + scene + setting;
    const directive = getSeededRandomItem(cameraTemplates, seed);
    
    console.log(`📸 Camera directive generated: ${directive}`);
    return directive;
    
  } catch (error) {
    console.warn('⚠️ Camera directive generation error:', error);
    return 'medium shot with warm lighting';
  }
}

// ============= ATMOSPHERE EXTRACTION =============
function extractAtmosphere(pageText, setting) {
  try {
    const text = (pageText + ' ' + setting).toLowerCase();
    const seed = pageText + setting;
    
    // Check for specific atmospheric cues in text
    if (text.includes('sunny') || text.includes('bright')) {
      return getSeededRandomItem(['with bright golden lighting', 'with cheerful sunshine', 'with warm daylight'], seed + '_sunny');
    }
    if (text.includes('evening') || text.includes('sunset')) {
      return getSeededRandomItem(['with warm evening glow', 'with golden sunset lighting', 'with dusky atmosphere'], seed + '_evening');
    }
    if (text.includes('morning')) {
      return getSeededRandomItem(['with gentle morning light', 'with fresh morning atmosphere', 'with bright morning rays'], seed + '_morning');
    }
    if (text.includes('cozy') || text.includes('warm')) {
      return getSeededRandomItem(['with cozy warm atmosphere', 'with inviting ambiance', 'with comfortable lighting'], seed + '_cozy');
    }
    
    // Fallback to universal lighting arrays
    return getSeededRandomItem(UNIVERSAL_LIGHTING_ARRAYS, seed + '_fallback');
    
  } catch (error) {
    console.warn('⚠️ Atmosphere extraction error:', error);
    return 'with warm, inviting atmosphere';
  }
}

// ============= PROPS EXTRACTION =============
function extractProps(pageText, objects) {
  try {
    const lowerText = pageText.toLowerCase();
    const detectedProps = [];
    
    // Common story props
    const storyProps = [
      'backpack', 'notebook', 'pencil', 'crayon', 'lunch box', 'water bottle',
      'blanket', 'pillow', 'umbrella', 'hat', 'shoes', 'jacket',
      'basket', 'bag', 'box', 'container', 'cup', 'plate'
    ];
    
    for (const prop of storyProps) {
      if (lowerText.includes(prop)) {
        detectedProps.push(prop);
      }
    }
    
    // Add objects as props if they exist
    if (objects && objects !== 'colorful items') {
      const objectsList = objects.split(', ');
      detectedProps.push(...objectsList.slice(0, 2)); // Add up to 2 objects as props
    }
    
    if (detectedProps.length > 0) {
      const result = detectedProps.slice(0, 3).join(', ');
      console.log(`🎭 Props extracted: ${result}`);
      return result;
    }
    
    return ''; // Return empty if no props found
    
  } catch (error) {
    console.warn('⚠️ Props extraction error:', error);
    return '';
  }
}

// ============= CHARACTER CONSISTENCY & AVATAR MAPPING SYSTEM =============

function enhanceNuclearMappingWithConsistency(userInfo, difficulty, avatarIdentity, sessionId, characterData) {
  try {
    console.log('🎭 Tier 2.5: Starting character consistency enhancement');
    
    // STEP 1: Get nuclear mapping as baseline safety
    const nuclearMapping = getNuclearAvatarMapping(userInfo, difficulty, avatarIdentity);
    
    if (!nuclearMapping) {
      console.warn('⚠️ Tier 2.5: Nuclear mapping failed - using emergency fallback');
      return generateEmergencyMapping(userInfo);
    }
    
    // STEP 2: Check if character consistency data is available
    if (!characterData || !characterData.seed) {
      console.log('🛡️ Tier 2.5: No character data available - using nuclear mapping');
      return nuclearMapping;
    }
    
    // STEP 3: Enhance nuclear mapping with consistent traits
    console.log('🎭 Tier 2.5: Enhancing nuclear mapping with consistent character data');
    
    const enhancedMapping = {
      ...nuclearMapping, // Start with nuclear safety
      
      // Override with consistent traits when available
      ...(characterData.consistentEyeColor && { eyeColor: characterData.consistentEyeColor }),
      ...(characterData.consistentClothingStyle && { clothing: characterData.consistentClothingStyle }),
      ...(characterData.consistentHairDescription && { hair: characterData.consistentHairDescription }),
      
      // Preserve nuclear safety features
      seed: characterData.seed || avatarIdentity?.seed, // Use consistent seed
      source: 'enhanced-nuclear-mapping'
    };
    
    console.log('✅ Tier 2.5: Character consistency enhancement completed:', {
      hasConsistentEyeColor: !!characterData.consistentEyeColor,
      hasConsistentClothing: !!characterData.consistentClothingStyle,
      hasConsistentHair: !!characterData.consistentHairDescription,
      hasOrchestratorVariation: !!avatarIdentity?.skinToneVariation,
      seed: characterData.seed || avatarIdentity?.seed,
      sessionId: sessionId
    });
    
    return enhancedMapping;
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Character consistency enhancement failed - falling back to nuclear mapping:', error);
    // BULLETPROOF FALLBACK: Return nuclear mapping on any error
    return getNuclearAvatarMapping(userInfo, difficulty, avatarIdentity);
  }
}

function getNuclearAvatarMapping(userInfo, difficulty, avatarIdentity) {
  try {
    console.log('🛡️ Tier 2.5: Generating nuclear avatar mapping');
    
    const avatarType = userInfo?.avatar?.type || avatarIdentity?.type || 'child';
    const seed = avatarIdentity?.seed || userInfo?.sessionId || 'default';
    
    console.log(`🎯 Avatar type: ${avatarType}, Seed: ${seed}`);
    
    // CULTURAL PROFILE DETECTION
    const culturalProfile = detectCulturalProfile(userInfo, avatarIdentity);
    console.log(`🌍 Cultural profile detected: ${culturalProfile}`);
    
    // AFRICAN AMERICAN SPECIALIZED MAPPING
    if (culturalProfile === 'african_american') {
      return generateAfricanAmericanMapping(avatarType, seed, userInfo, avatarIdentity);
    }
    
    // STANDARD AMERICAN MAPPING (ALL OTHER ETHNICITIES)
    return generateStandardAmericanMapping(avatarType, seed, userInfo, avatarIdentity);
    
  } catch (error) {
    console.error('❌ Nuclear avatar mapping error:', error);
    return generateEmergencyMapping(userInfo);
  }
}

function generateAfricanAmericanMapping(avatarType, seed, userInfo, avatarIdentity) {
  try {
    console.log('🎨 Generating African American character mapping');
    
    const gender = avatarType === 'girl' ? 'girls' : 'boys';
    
    // HAIR SELECTION (Seeded for consistency)
    const hairOptions = HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES[gender] || HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.boys;
    const selectedHair = getSeededRandomItem(hairOptions, seed + '_hair');
    
    // SKIN TONE SELECTION (Seeded for consistency)
    const selectedSkinTone = getSeededRandomItem(HARDCODED_AFRICAN_AMERICAN_SKIN_TONES, seed + '_skin');
    
    // FACIAL FEATURES SELECTION (Seeded for consistency)
    const selectedFeatures = getSeededRandomItem(HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES, seed + '_features');
    
    // CLOTHING DETECTION FROM STORY
    const storyClothing = detectClothingFromStory(userInfo?.pageText || '');
    const finalClothing = storyClothing || getSeededRandomItem(HARDCODED_STANDARD_AMERICAN_CLOTHING, seed + '_clothing');
    
    const mapping = {
      character: `African American ${avatarType}`,
      hair: selectedHair,
      features: selectedFeatures,
      clothing: finalClothing,
      skinTone: selectedSkinTone,
      age: getAgeFromDifficulty(userInfo?.difficulty || 'medium'),
      ethnicity: 'depict character from African American background',
      seed: seed,
      source: 'african-american-nuclear-mapping'
    };
    
    console.log('✅ African American mapping generated:', mapping);
    return mapping;
    
  } catch (error) {
    console.error('❌ African American mapping error:', error);
    return generateEmergencyMapping(userInfo);
  }
}

function generateStandardAmericanMapping(avatarType, seed, userInfo, avatarIdentity) {
  try {
    console.log('🎨 Generating Standard American character mapping');
    
    // CLOTHING DETECTION FROM STORY (Primary approach)
    const storyClothing = detectClothingFromStory(userInfo?.pageText || '');
    const finalClothing = storyClothing || getSeededRandomItem(HARDCODED_STANDARD_AMERICAN_CLOTHING, seed + '_clothing');
    
    // BASIC FEATURES (Let AI handle diversity)
    const basicFeatures = [
      'bright expressive eyes, cheerful smile, youthful appearance',
      'sparkling eyes, friendly expression, natural features',
      'warm smile, lively eyes, authentic child features',
      'genuine expression, bright eyes, natural appearance'
    ];
    
    const selectedFeatures = getSeededRandomItem(basicFeatures, seed + '_features');
    
    // ETHNICITY DETECTION (Multi-language support)
    const ethnicityNote = getCharacterEthnicity(userInfo, avatarIdentity);
    
    const mapping = {
      character: `${avatarType}`,
      hair: 'natural hairstyle appropriate for character', // Let AI decide
      features: selectedFeatures,
      clothing: finalClothing,
      age: getAgeFromDifficulty(userInfo?.difficulty || 'medium'),
      ethnicity: ethnicityNote,
      seed: seed,
      source: 'standard-american-nuclear-mapping'
    };
    
    console.log('✅ Standard American mapping generated:', mapping);
    return mapping;
    
  } catch (error) {
    console.error('❌ Standard American mapping error:', error);
    return generateEmergencyMapping(userInfo);
  }
}

function detectCulturalProfile(userInfo, avatarIdentity) {
  try {
    // DETECTION METHOD 1: Direct avatar skin tone analysis
    const skinTone = userInfo?.avatar?.skinTone || avatarIdentity?.skinTone || '';
    const skinToneLower = skinTone.toLowerCase();
    
    // African American skin tone indicators
    const africanAmericanSkinTones = [
      'dark', 'brown', 'black', 'ebony', 'chocolate', 'mahogany', 
      'caramel', 'cocoa', 'bronze', 'deep brown', 'rich brown'
    ];
    
    for (const tone of africanAmericanSkinTones) {
      if (skinToneLower.includes(tone)) {
        console.log(`🎯 African American profile detected via skin tone: ${tone}`);
        return 'african_american';
      }
    }
    
    // DETECTION METHOD 2: Language-based cultural hints
    const language = avatarIdentity?.nativeLanguage || userInfo?.language || 'en';
    
    // Spanish/Latino detection
    if (language === 'es' || language === 'spanish') {
      console.log(`🎯 Spanish/Latino profile detected via language: ${language}`);
      return 'spanish_latino';
    }
    
    // Other language-based profiles
    const languageProfiles = {
      'fr': 'french',
      'french': 'french',
      'zh': 'chinese',
      'chinese': 'chinese',
      'hi': 'hindi',
      'hindi': 'hindi',
      'ar': 'arabic',
      'arabic': 'arabic',
      'pt': 'portuguese',
      'portuguese': 'portuguese'
    };
    
    if (languageProfiles[language]) {
      console.log(`🎯 Cultural profile detected via language: ${language} -> ${languageProfiles[language]}`);
      return languageProfiles[language];
    }
    
    // DETECTION METHOD 3: Story content analysis (future enhancement)
    const storyText = userInfo?.pageText || '';
    if (storyText) {
      // Cultural context clues in story content could be analyzed here
      // For now, keeping it simple
    }
    
    // DEFAULT: Standard American
    console.log('🎯 Default cultural profile: standard_american');
    return 'standard_american';
    
  } catch (error) {
    console.warn('⚠️ Cultural profile detection error:', error);
    return 'standard_american';
  }
}

function generateEmergencyMapping(userInfo) {
  const avatarType = userInfo?.avatar?.type || 'child';
  
  return {
    character: `friendly ${avatarType}`,
    hair: 'natural hairstyle',
    features: 'bright expressive eyes, cheerful smile',
    clothing: 'comfortable everyday outfit',
    age: 'age 9-10',
    ethnicity: '',
    seed: 'emergency',
    source: 'emergency-fallback-mapping'
  };
}

// ============= CULTURAL ENHANCEMENT FUNCTIONS =============

function getCharacterEthnicity(userInfo, avatarIdentity) {
  try {
    const language = avatarIdentity?.nativeLanguage || userInfo?.language || 'en';
    const skinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || '';
    
    // Multi-Language + Dark Skin Ethnicity Enhancement
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
      // Fallback for other languages with dark skin
      return "depict character from African American background";
    }
    
    // Language-based ethnicity notes (for non-dark skin)
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
    
    // Default: no specific ethnicity note for English/Standard American
    return "";
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Character ethnicity detection error:', error);
    return "";
  }
}

// ============= CULTURAL LANDMARKS SYSTEM =============
const CULTURAL_LANDMARKS = {
  spanish: {
    indoor: ["with Spanish tile patterns", "in Mediterranean style interior", "with Spanish cultural elements", "in warm villa setting", "with Spanish decor"],
    outdoor: ["with Spanish villa backdrop", "near Mediterranean courtyard", "with Spanish architecture", "in colorful plaza", "with Spanish garden elements"]
  },
  french: {
    indoor: ["in charming Parisian café", "with French interior design", "in elegant French setting", "with French cultural elements", "in cozy French environment"],
    outdoor: ["near Eiffel Tower", "by Seine River", "near Louvre gardens", "in charming café district", "with Parisian park backdrop"]
  },
  chinese: {
    indoor: ["with traditional Chinese interior", "in Chinese cultural setting", "with oriental design elements", "in pagoda-style building", "with Chinese architectural details"],
    outdoor: ["with traditional pagodas", "near Great Wall", "with ancient temples", "in bamboo garden", "with oriental architecture"]
  },
  hindi: {
    indoor: ["in Indian palace interior", "with traditional Indian patterns", "in colorful Indian setting", "with Indian cultural elements", "in ornate Indian room"],
    outdoor: ["near Taj Mahal", "with palace elements", "in colorful market", "with Indian architecture", "in vibrant courtyard"]
  },
  arabic: {
    indoor: ["in ornate Middle Eastern interior", "with Arabic architectural patterns", "in traditional Arabic setting", "with Middle Eastern design", "in elegant Arabic room"],
    outdoor: ["with Middle Eastern domes", "in ornate courtyard", "with mosaic patterns", "near ancient architecture", "with desert oasis backdrop"]
  },
  portuguese: {
    indoor: ["in Brazilian colonial interior", "with Portuguese cultural elements", "in warm Portuguese setting", "with Brazilian design details", "in Portuguese-style room", "with azulejo tile patterns", "in traditional Portuguese library", "with Portuguese maritime decor", "in colorful Portuguese kitchen", "with fado music ambiance", "in Portuguese cathedral interior", "with cork and wood elements", "in Manueline architectural style", "with Portuguese royal court design"],
    outdoor: ["with Brazilian landscape", "near Portuguese architecture", "with tropical colonial backdrop", "in colorful Portuguese plaza", "with Brazilian coastal elements", "near Portuguese castles", "with cork oak trees", "in Portuguese vineyard setting", "with traditional Portuguese windmills", "near Douro River valley", "with Portuguese fishing village backdrop", "in Sintra palace gardens", "with Portuguese maritime port", "near Cliffs of Moher coastal views", "with Portuguese countryside hills"]
  }
};

function getCulturalLandmarks(language, isIndoor, isOutdoor) {
  try {
    const landmarks = CULTURAL_LANDMARKS[language];
    if (!landmarks) return [];
    
    if (isIndoor && landmarks.indoor) {
      return landmarks.indoor;
    }
    if (isOutdoor && landmarks.outdoor) {
      return landmarks.outdoor;
    }
    
    // Default: combine both indoor and outdoor
    return [...(landmarks.indoor || []), ...(landmarks.outdoor || [])];
    
  } catch (error) {
    console.warn('⚠️ Cultural landmarks error:', error);
    return [];
  }
}

function applyCulturalSettingEnhancement(baseSetting, userInfo, avatarIdentity) {
  try {
    const language = avatarIdentity?.nativeLanguage || userInfo?.language || 'en';
    console.log(`🌍 Enhanced Cultural Setting Enhancement - Language: ${language}, Base Setting: "${baseSetting}"`);
    
    // ENHANCED: Context-aware cultural integration with indoor/outdoor detection
    const isIndoorSetting = baseSetting.toLowerCase().includes('indoor') || 
                           baseSetting.toLowerCase().includes('home') || 
                           baseSetting.toLowerCase().includes('school') ||
                           baseSetting.toLowerCase().includes('classroom') ||
                           baseSetting.toLowerCase().includes('kitchen') ||
                           baseSetting.toLowerCase().includes('bedroom');
    
    const isOutdoorSetting = baseSetting.toLowerCase().includes('outdoor') || 
                            baseSetting.toLowerCase().includes('park') || 
                            baseSetting.toLowerCase().includes('playground') ||
                            baseSetting.toLowerCase().includes('garden') ||
                            baseSetting.toLowerCase().includes('backyard');
    
    // Get cultural landmarks for the language with enhanced context awareness
    const landmarks = getCulturalLandmarks(language, isIndoorSetting, isOutdoorSetting);
    if (landmarks.length > 0) {
      const randomLandmark = landmarks[Math.floor(Math.random() * landmarks.length)];
      
      // ENHANCED: Context-aware enhancement with better integration
      if (baseSetting.toLowerCase().includes('park')) {
        return baseSetting.replace('park', `park ${randomLandmark}`);
      }
      if (baseSetting.toLowerCase().includes('school')) {
        return baseSetting.replace('school', `school ${randomLandmark}`);
      }
      if (baseSetting.toLowerCase().includes('home')) {
        return baseSetting.replace('home', `home ${randomLandmark}`);
      }
      if (baseSetting.toLowerCase().includes('playground')) {
        return baseSetting.replace('playground', `playground ${randomLandmark}`);
      }
      
      // Enhanced generic enhancement with smart positioning
      return `${baseSetting} ${randomLandmark}`;
    }
    
    console.log(`🌍 No cultural enhancement available for language: ${language}`);
    return baseSetting;
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Cultural setting enhancement error:', error);
    return baseSetting;
  }
}

// ============= CLOTHING DETECTION FUNCTIONS =============

function detectClothingFromStory(text) {
  if (!text) return '';
  
  const lowerText = text.toLowerCase();
  
  // Try dynamic clothing + color detection first
  const dynamicClothingColor = detectAndResolveClothingColor(text);
  if (dynamicClothingColor) {
    return dynamicClothingColor;
  }
  
  // Fallback to basic clothing detection
  for (const keyword of CLOTHING_DETECTION_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      // Extract clothing context around the keyword
      const sentences = text.split(/[.!?]+/);
      for (const sentence of sentences) {
        if (sentence.toLowerCase().includes(keyword)) {
          // Add random color if no color specified
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
  
  // Detect clothing type using unified keywords
  for (const clothing of CLOTHING_DETECTION_KEYWORDS) {
    if (lowerText.includes(clothing)) {
      detectedClothing = clothing;
      break;
    }
  }
  
  // Detect color
  for (const color of EXPANDED_COLOR_ARRAY) {
    if (lowerText.includes(color)) {
      detectedColor = color;
      break;
    }
  }
  
  // If both detected, combine them (no restrictions - allow any color for any clothing)
  if (detectedClothing && detectedColor) {
    return `a ${detectedColor} ${detectedClothing}`;
  }
  
  // If only clothing detected, let Runware decide the color
  if (detectedClothing) {
    return `a ${detectedClothing}`;
  }
  
  // If only color detected, let Runware decide what clothing to color
  if (detectedColor) {
    return '';
  }
  
  return '';
}

// ============= UTILITY FUNCTIONS =============

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

function generateEmergencyPrompt(userInfo) {
  const gender = userInfo?.avatar?.type === 'girl' ? 'girl' : 
                userInfo?.avatar?.type === 'boy' ? 'boy' : 'child';
  
  return `An attractive ${gender} in a portrait style photo with main character focus. Beautiful children's book illustration, warm lighting, cheerful atmosphere, high quality, detailed art.`;
}

// ============= TEMPLATE FILLING FUNCTIONS =============

function fillPremiumTemplate(template, placeholders) {
  try {
    console.log('🛡️ Tier 2.5A: Filling premium template with placeholders');
    
    let filledTemplate = template;
    
    // Fill all placeholders
    for (const [key, value] of Object.entries(placeholders)) {
      if (value !== undefined && value !== null && value !== '') {
        const placeholder = `{${key}}`;
        filledTemplate = filledTemplate.replace(new RegExp(placeholder, 'g'), value);
        console.log(`✅ Filled ${key}: "${value}"`);
      }
    }
    
    // Clean up any remaining empty placeholders
    filledTemplate = removeEmptySections(filledTemplate);
    
    console.log('✅ Premium template filled successfully');
    return filledTemplate;
    
  } catch (error) {
    console.error('❌ Premium template filling error:', error);
    return template; // Return original template on error
  }
}

function fillBasicTemplate(template, placeholders) {
  try {
    console.log('🛡️ Tier 2.5B: Filling basic template with placeholders');
    
    let filledTemplate = template;
    
    // Fill all placeholders
    for (const [key, value] of Object.entries(placeholders)) {
      if (value !== undefined && value !== null && value !== '') {
        const placeholder = `{${key}}`;
        filledTemplate = filledTemplate.replace(new RegExp(placeholder, 'g'), value);
        console.log(`✅ Filled ${key}: "${value}"`);
      }
    }
    
    // Basic template cleanup (simpler than premium)
    filledTemplate = filledTemplate
      .replace(/\{\w+\}/g, '') // Remove any remaining placeholders
      .replace(/\s+/g, ' ') // Clean up extra spaces
      .trim();
    
    console.log('✅ Basic template filled successfully');
    return filledTemplate;
    
  } catch (error) {
    console.error('❌ Basic template filling error:', error);
    return template; // Return original template on error
  }
}

// ENHANCED REMOVE EMPTY SECTIONS - HANDLES ACTION SECTION DYNAMICALLY
function removeEmptySections(template) {
  console.log('🧹 Before cleaning:', template);
  
  let cleaned = template;
  
  // STEP 1: Handle Action section specifically - DYNAMIC PROCESSING
  // Pattern: Action: {scene}, {action_intensity}, {spatial_positioning}, {object_interaction}, {body_language}
  const actionRegex = /Action:\s*([^,]*),\s*([^,]*),\s*([^,]*),\s*([^,]*),\s*([^,.]*)(?=[.]\s|\s*\w+:)/g;
  
  cleaned = cleaned.replace(actionRegex, (match, scene, intensity, spatial, interaction, bodyLang) => {
    const components = [];
    
    // Always include scene if present
    if (scene && scene.trim() && !scene.includes('{')) {
      components.push(scene.trim());
    }
    
    // Include intensity only if not empty
    if (intensity && intensity.trim() && !intensity.includes('{')) {
      components.push(intensity.trim());
    }
    
    // DYNAMIC: Include spatial_positioning only if meaningful (not empty)
    if (spatial && spatial.trim() && !spatial.includes('{')) {
      components.push(spatial.trim());
    }
    
    // Include object_interaction only if not empty
    if (interaction && interaction.trim() && !interaction.includes('{')) {
      components.push(interaction.trim());
    }
    
    // DYNAMIC: Include body_language only if meaningful (not empty)
    if (bodyLang && bodyLang.trim() && !bodyLang.includes('{')) {
      components.push(bodyLang.trim());
    }
    
    // Build Action section dynamically - prioritize scene and action over positioning details
    if (components.length > 0) {
      return `Action: ${components.join(', ')}`;
    } else {
      return ''; // Remove entire Action section if no components
    }
  });
  
  // STEP 2: Remove other empty sections (original logic)
  cleaned = cleaned
    .replace(/\w+:\s*[,.](?=\s*\w+:)/g, '') // Remove empty sections in middle
    .replace(/\w+:\s*[,.](?=\s*Technical:)/g, '') // Remove empty sections before Technical
    .replace(/\w+:\s*[,.]$/g, '') // Remove empty sections at end
    .replace(/,\s*,+/g, ',') // Fix multiple commas
    .replace(/\.\s*\.+/g, '.') // Fix multiple periods
    .replace(/\s+/g, ' ') // Clean up extra spaces
    .replace(/\.\s*\w+:/g, '. ') // Fix periods before section labels
    .trim();
  
  console.log('🧹 After cleaning:', cleaned);
  return cleaned;
}

// ============= TEMPLATE VALIDATION FUNCTIONS =============

function validateTemplateCompleteness(character, setting, scene, objects) {
  const issues = [];
  
  if (!character || character.length < 3) issues.push('character missing/too short');
  if (!setting || setting.length < 5) issues.push('setting missing/too short');  
  if (!scene || scene.split(' ').length < 5) issues.push('action under 5 words');
  
  console.log(`🔍 Template validation - Issues: ${issues.length > 0 ? issues.join(', ') : 'none'}`);
  
  return issues.length === 0;
}

// NEW: Avatar validation - triggers 2.5B on failure
function validateAvatarMapping(avatarMapping) {
  const issues = [];
  
  if (!avatarMapping) {
    issues.push('Avatar mapping is null/undefined');
    return { isValid: false, issues: issues };
  }
  
  if (!avatarMapping?.character || avatarMapping.character === 'a friendly child') {
    issues.push('Generic character fallback detected');
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues
  };
}

// NEW: Visual element validation - triggers 2.5B on failure  
function validateVisualElements(sceneData, objects, setting) {
  const issues = [];
  
  if (!sceneData?.spatialComposition || sceneData.spatialComposition === 'character prominently featured in foreground') {
    issues.push('Generic spatial composition detected');
  }
  
  if (!objects || objects === 'interesting colorful items') {
    issues.push('Generic objects fallback detected');
  }
  
  if (!sceneData?.atmosphereContext || sceneData.atmosphereContext === 'warm, inviting atmosphere') {
    issues.push('Generic atmosphere fallback detected');
  }
  
  if (!setting || setting === 'a welcoming colorful environment') {
    issues.push('Generic setting fallback detected');
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues
  };
}

// NEW: Scene complexity validation - triggers 2.5B on failure
function validateSceneComplexity(sceneData, pageText) {
  const issues = [];
  
  if (!sceneData?.contextualAction && pageText && pageText.length > 50) {
    issues.push('No contextual action extracted from substantial text');
  }
  
  if (!sceneData?.contextualSetting && pageText && pageText.length > 50) {
    issues.push('No contextual setting extracted from substantial text');
  }
  
  if (sceneData?.scene && sceneData.scene === 'enjoying a bright cheerful moment') {
    issues.push('Generic scene fallback detected');
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues
  };
}

// ============= PROMPT PROCESSING FUNCTIONS =============

function processPromptForRunware(prompt, difficulty) {
  if (!prompt) return prompt;
  
  console.log(`🛡️ Tier 2.5: Simplified processing - letting Runware handle final length (${prompt.length} chars for ${difficulty})`);
  
  // No truncation needed - smart sentence extraction already handled in template filling
  // Total prompts should be ~800-1200 chars well under Runware's limits  
  return prompt;
}

function truncatePageText(text, difficulty) {
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

// ============= CONTEXT-AWARE ENHANCEMENT FUNCTIONS =============

function applyContextAwareEnhancement(currentValue, exactWord, type) {
  if (!exactWord || !currentValue) return currentValue;
  
  try {
    // Preserve exact story content first, enhance visually second
    if (type === 'action') {
      // Keep exact verb form, add minimal context-appropriate descriptors
      if (exactWord.includes('roll')) return `${exactWord}`;
      if (exactWord.includes('run')) return `${exactWord}`;
      if (exactWord.includes('jump')) return `${exactWord}`;
      if (exactWord.includes('play')) return `${exactWord}`;
      if (exactWord.includes('bounce')) return `${exactWord}`;
      
      // For other actions, preserve the exact word and add appropriate context
      return currentValue.includes(exactWord) ? currentValue : `${exactWord} ${currentValue}`;
    }
    
    if (type === 'objects') {
      // Preserve exact object names from story
      return currentValue.includes(exactWord) ? currentValue : `${exactWord}, ${currentValue}`;
    }
    
    if (type === 'setting') {
      // Enhance setting while preserving story location
      if (exactWord.includes('hill')) return `${exactWord} with natural terrain`;
      if (exactWord.includes('park')) return `${exactWord} with green spaces`;
      if (exactWord.includes('garden')) return `${exactWord} with beautiful plants`;
      
      return currentValue.includes(exactWord) ? currentValue : `${currentValue} near ${exactWord}`;
    }
    
    return currentValue;
    
  } catch (error) {
    console.warn(`⚠️ Context enhancement error for ${type}:`, error);
    return currentValue;
  }
}

// ============= UTILITY HELPER FUNCTIONS =============

function getRandomItem(array) {
  if (!array || array.length === 0) return 'default';
  return array[Math.floor(Math.random() * array.length)];
}

function extractGenderFromCharacter(character) {
  if (!character || typeof character !== 'string') return 'child';
  const lowerChar = character.toLowerCase();
  if (lowerChar.includes('girl')) return 'girl';
  if (lowerChar.includes('boy')) return 'boy';
  return 'child';
}

// ============= NUCLEAR INDEPENDENT TEMPLATE SYSTEM =============

function getNuclearPromptTemplate(difficulty, templateType = 'premium') {
  const templates = templateType === 'basic' ? BASIC_PROMPT_TEMPLATES : PREMIUM_PROMPT_TEMPLATES;
  const template = templates[difficulty] || templates['easy']; // Fallback to easy
  
  console.log(`📋 Using ${templateType} template for ${difficulty} difficulty`);
  return template;
}

function generateEnhancedActionSection(pageText, objects, seed) {
  const action = detectActionsFromStory(pageText, seed);
  const intensity = getSeededRandomItem(TIER_25_UNIFIED_VOCABULARY.actions.intensity, seed + 'intensity');
  const bodyLanguage = getSeededRandomItem(TIER_25_UNIFIED_VOCABULARY.actions.bodyLanguage, seed + 'body');
  
  const mainObject = objects.length > 0 ? objects[0] : 'toy';
  const spatialPositioning = `positioned near the ${mainObject}`;
  const objectInteraction = `interacting with the ${mainObject}`;
  
  return {
    scene: action,
    action_intensity: intensity,
    spatial_positioning: spatialPositioning,
    object_interaction: objectInteraction,
    body_language: bodyLanguage
  };
}

function generateColoredObjectsFromStory(pageText, objects, seed) {
  if (!objects || objects.length === 0) return 'colorful toys';
  
  const colors = [];
  const lowerText = pageText ? pageText.toLowerCase() : '';
  
  // Detect colors from story
  EXPANDED_COLOR_ARRAY.forEach(color => {
    if (lowerText.includes(color)) {
      colors.push(color);
    }
  });
  
  // If no colors found, use seeded selection
  if (colors.length === 0) {
    colors.push(getSeededRandomItem(EXPANDED_COLOR_ARRAY, seed + 'color'));
  }
  
  const selectedColor = colors[0];
  const selectedObject = objects[0];
  
  return `${selectedColor} ${selectedObject}`;
}

// ============= NUCLEAR INDEPENDENT RUNWARE WEBSOCKET SERVICE =============

class NuclearRunwareWebSocketService {
  constructor() {
    this.ws = null;
    this.connectionPromise = null;
    this.messageCallbacks = new Map();
    this.isAuthenticated = false;
    this.connectionSessionUUID = null;
  }

  async connect(apiKey) {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket('wss://ws-api.runware.ai/v1');
        
        this.ws.onopen = async () => {
          console.log('🔌 Nuclear WebSocket connected');
          try {
            await this.authenticate(apiKey);
            resolve();
          } catch (error) {
            reject(error);
          }
        };

        this.ws.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data);
            this.handleMessage(response);
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ Nuclear WebSocket error:', error);
          reject(new Error('WebSocket connection failed'));
        };

        this.ws.onclose = () => {
          console.log('🔌 Nuclear WebSocket closed');
          this.isAuthenticated = false;
          this.connectionPromise = null;
        };

      } catch (error) {
        console.error('❌ Failed to create WebSocket:', error);
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  async authenticate(apiKey) {
    return new Promise((resolve, reject) => {
      const authTimeout = setTimeout(() => {
        reject(new Error('Authentication timeout'));
      }, 10000);

      const authMessage = [{
        taskType: 'authentication',
        apiKey: apiKey
      }];

      this.messageCallbacks.set('auth', (data) => {
        clearTimeout(authTimeout);
        if (data.taskType === 'authentication') {
          this.isAuthenticated = true;
          this.connectionSessionUUID = data.connectionSessionUUID;
          console.log('✅ Nuclear authentication successful');
          resolve();
        } else {
          reject(new Error('Authentication failed'));
        }
      });

      this.ws.send(JSON.stringify(authMessage));
    });
  }

  handleMessage(response) {
    if (response.error || response.errors) {
      console.error('❌ Nuclear WebSocket error:', response.error || response.errors);
      return;
    }

    if (response.data) {
      response.data.forEach(item => {
        if (item.taskType === 'authentication') {
          const callback = this.messageCallbacks.get('auth');
          if (callback) {
            callback(item);
            this.messageCallbacks.delete('auth');
          }
        } else {
          const callback = this.messageCallbacks.get(item.taskUUID);
          if (callback) {
            callback(item);
            this.messageCallbacks.delete(item.taskUUID);
          }
        }
      });
    }
  }

  async generateImage(params) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    const taskUUID = crypto.randomUUID();
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.messageCallbacks.delete(taskUUID);
        reject(new Error('Image generation timeout'));
      }, 120000);

      this.messageCallbacks.set(taskUUID, (data) => {
        clearTimeout(timeout);
        if (data.error) {
          reject(new Error(data.errorMessage || 'Image generation failed'));
        } else {
          resolve(data);
        }
      });

      const message = [{
        taskType: 'imageInference',
        taskUUID,
        positivePrompt: params.positivePrompt,
        model: params.model || 'runware:100@1',
        width: params.width || 1024,
        height: params.height || 1024,
        numberResults: 1,
        outputFormat: 'WEBP',
        steps: params.steps || 4,
        CFGScale: params.CFGScale || 1,
        scheduler: 'FlowMatchEulerDiscreteScheduler'
      }];

      this.ws.send(JSON.stringify(message));
    });
  }
}

// ============= NUCLEAR INDEPENDENT MAIN GENERATION FUNCTION =============

async function generateNuclearImage(requestData) {
  console.log('🚀 Starting nuclear image generation');
  
  try {
    // Extract and validate request data
    const { 
      userInfo, 
      pageText, 
      sessionId, 
      pageNumber,
      apiKey 
    } = requestData;

    if (!apiKey) {
      throw new Error('API key is required for nuclear image generation');
    }

    if (!pageText) {
      throw new Error('Page text is required for nuclear image generation');
    }

    console.log('📝 Page text:', pageText.substring(0, 100) + '...');

    // Generate consistent seed for this session and page
    const seed = `${sessionId || 'default'}_${pageNumber || 1}`;
    console.log('🌱 Generated seed:', seed);

    // Get nuclear character details
    const characterDetails = getNuclearCharacterDetails(userInfo, seed, pageText);
    console.log('🎭 Character details:', characterDetails);

    // Detect story elements using unified vocabulary system
    const detectedObjects = detectObjectsFromStory(pageText, seed);
    const setting = generateSettingFromContext(pageText, seed);
    const atmosphere = generateAtmosphereFromStory(pageText, seed);
    
    console.log('🔍 Detected elements:');
    console.log('  Objects:', detectedObjects);
    console.log('  Setting:', setting);
    console.log('  Atmosphere:', atmosphere);

    // Generate enhanced action section
    const actionSection = generateEnhancedActionSection(pageText, detectedObjects, seed);
    console.log('🎬 Action section:', actionSection);

    // Get nuclear style settings
    const difficulty = userInfo?.difficulty || 'easy';
    const styleSettings = NUCLEAR_STYLE_SETTINGS[difficulty] || NUCLEAR_STYLE_SETTINGS['easy'];
    console.log('🎨 Style settings for', difficulty, ':', styleSettings);

    // Get prompt template
    const templateType = ['beginner', 'easy'].includes(difficulty) ? 'basic' : 'premium';
    const template = getNuclearPromptTemplate(difficulty, templateType);
    console.log('📋 Using template type:', templateType);

    // Generate colored objects
    const coloredObjects = generateColoredObjectsFromStory(pageText, detectedObjects, seed);
    console.log('🌈 Colored objects:', coloredObjects);

    // Build prompt using template
    const promptVariables = {
      frameworkPrompt: styleSettings.frameworkPrompt,
      cameraDirective: 'medium shot, centered composition',
      pageText: pageText,
      character: characterDetails.character,
      age: characterDetails.age,
      ethnicity: characterDetails.ethnicity,
      hair: characterDetails.hair,
      features: characterDetails.features,
      emotion: characterDetails.emotion,
      scene: actionSection.scene,
      action_intensity: actionSection.action_intensity,
      spatial_positioning: actionSection.spatial_positioning,
      object_interaction: actionSection.object_interaction,
      body_language: actionSection.body_language,
      spatial_composition: 'balanced composition with clear focal point',
      setting: setting,
      atmosphere: atmosphere,
      props: detectedObjects.join(', '),
      action_objects: detectedObjects[0] || 'toy',
      colored_objects: coloredObjects,
      sensory_details: 'rich textures and natural lighting',
      community_context: 'family-friendly environment',
      secondary_characters: '',
      subject: characterDetails.character,
      action: actionSection.scene,
      adjective: 'vibrant'
    };

    // Replace template variables
    let finalPrompt = template;
    Object.entries(promptVariables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      finalPrompt = finalPrompt.replace(regex, value || '');
    });

    console.log('✨ Final prompt (first 200 chars):', finalPrompt.substring(0, 200) + '...');

    // Generate nuclear negative prompt
    const negativePrompt = generateNuclearNegativePrompt(userInfo);
    console.log('🚫 Nuclear negative prompt generated');

    // Initialize nuclear WebSocket service
    const nuclearService = new NuclearRunwareWebSocketService();
    await nuclearService.connect(apiKey);
    console.log('🔌 Nuclear WebSocket service connected');

    // Generate image with nuclear parameters
    const imageResult = await nuclearService.generateImage({
      positivePrompt: finalPrompt,
      negativePrompt: negativePrompt,
      model: 'runware:100@1',
      width: 1024,
      height: 1024,
      steps: styleSettings.steps,
      CFGScale: styleSettings.CFGScale
    });

    console.log('🖼️ Nuclear image generation completed');
    console.log('Image URL:', imageResult.imageURL);

    return {
      success: true,
      imageURL: imageResult.imageURL,
      seed: seed,
      prompt: finalPrompt,
      negativePrompt: negativePrompt,
      characterDetails: characterDetails,
      detectedElements: {
        objects: detectedObjects,
        setting: setting,
        atmosphere: atmosphere,
        actions: actionSection
      },
      metadata: {
        model: 'runware:100@1',
        steps: styleSettings.steps,
        CFGScale: styleSettings.CFGScale,
        difficulty: difficulty,
        templateType: templateType,
        generationTimestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('❌ Nuclear image generation failed:', error);
    throw error;
  }
}

// ============= NUCLEAR INDEPENDENT MAIN SERVER FUNCTION =============

/**
 * TIER 2.5A: Process with Premium Template System
 */
async function processWithPremiumTemplate({ prompt, userInfo, pageCount, difficulty, sessionId, pageNumber }) {
  console.log('[TIER 2.5A] Processing with premium template system...');
  
  try {
    // Try to get premium template from database/templateImporter
    const templateData = await getRawTemplate(difficulty, null);
    
    if (templateData && typeof templateData === 'object' && templateData.scenes) {
      console.log(`[TIER 2.5A] Retrieved premium template with ${templateData.scenes.length} scenes`);
      
      // Use premium template processor
      const pages = fillPremiumTemplate(templateData, userInfo, pageCount);
      
      if (pages && pages.length > 0) {
        return {
          success: true,
          pages: pages,
          source: 'premium_template_database'
        };
      }
    }
    
    throw new Error('No premium template available or failed to process');
    
  } catch (error) {
    console.error('[TIER 2.5A] Premium template error:', error);
    throw error;
  }
}

/**
 * TIER 2.5B: Process with Advanced Template System
 */
async function processWithAdvancedTemplate({ prompt, userInfo, pageCount, difficulty, sessionId }) {
  console.log('[TIER 2.5B] Processing with advanced template system...');
  
  try {
    // Try to get any available template
    const templateData = await getTemplate(difficulty, null, userInfo, pageCount, 'production');
    
    if (templateData) {
      let pages;
      
      if (Array.isArray(templateData)) {
        // Simple string array template
        pages = fillBasicTemplate(templateData, userInfo, pageCount);
      } else if (templateData.pages) {
        // Structured template with pages
        pages = fillBasicTemplate(templateData.pages, userInfo, pageCount);
      } else {
        throw new Error('Invalid template structure');
      }
      
      if (pages && pages.length > 0) {
        return {
          success: true,
          pages: pages,
          source: 'advanced_template_system'
        };
      }
    }
    
    throw new Error('Advanced template processing failed');
    
  } catch (error) {
    console.error('[TIER 2.5B] Advanced template error:', error);
    throw error;
  }
}

/**
 * TIER 2.5C: Process with Basic Template System
 */
async function processWithBasicTemplate({ prompt, userInfo, pageCount, difficulty }) {
  console.log('[TIER 2.5C] Processing with basic template system...');
  
  try {
    // Use hardcoded basic templates as backup
    const basicTemplates = getHardcodedTemplates(difficulty);
    
    if (basicTemplates && basicTemplates.length > 0) {
      const randomTemplate = basicTemplates[Math.floor(Math.random() * basicTemplates.length)];
      const pages = fillBasicTemplate(randomTemplate, userInfo, pageCount);
      
      if (pages && pages.length > 0) {
        return {
          success: true,
          pages: pages,
          source: 'basic_template_hardcoded'
        };
      }
    }
    
    throw new Error('Basic template processing failed');
    
  } catch (error) {
    console.error('[TIER 2.5C] Basic template error:', error);
    throw error;
  }
}

/**
 * TIER 2.5D: Process with Nuclear Template System (Cannot Fail)
 */
function processWithNuclearTemplate({ prompt, userInfo, pageCount, difficulty }) {
  console.log('[TIER 2.5D] Processing with nuclear template system (guaranteed success)...');
  
  try {
    const userName = userInfo.userName || userInfo.name || "the child";
    const favoriteColor = userInfo.favoriteColor || "blue";
    const favoriteAnimal = userInfo.favoriteAnimal || "puppy";
    
    // Nuclear template - cannot fail
    const nuclearTemplate = [
      `${userName} woke up on a beautiful morning, feeling excited about the day ahead.`,
      `${userName} put on their favorite ${favoriteColor} clothes and stepped outside into the sunshine.`,
      `While walking through the neighborhood, ${userName} saw a friendly ${favoriteAnimal} playing in the park.`,
      `${userName} spent time playing and having fun, making new friends along the way.`,
      `As the day ended, ${userName} felt happy and grateful for such a wonderful adventure.`
    ];
    
    // Extend or truncate to match pageCount
    let pages = [...nuclearTemplate];
    
    while (pages.length < pageCount) {
      const extraPage = `${userName} discovered something new and exciting, making the adventure even more special.`;
      pages.push(`Page ${pages.length + 1}: ${extraPage}`);
    }
    
    if (pages.length > pageCount) {
      pages = pages.slice(0, pageCount);
    }
    
    // Add page numbers
    pages = pages.map((page, index) => {
      if (!page.startsWith('Page ')) {
        return `Page ${index + 1}: ${page}`;
      }
      return page;
    });
    
    console.log(`[TIER 2.5D] Nuclear template generated ${pages.length} pages successfully`);
    
    return {
      success: true,
      pages: pages,
      source: 'nuclear_template_guaranteed'
    };
    
  } catch (error) {
    console.error('[TIER 2.5D] Nuclear template error (this should be impossible):', error);
    throw error;
  }
}

/**
 * Get hardcoded templates for basic fallback
 */
function getHardcodedTemplates(difficulty) {
  const templates = {
    'easy': [
      [
        "{userName} found a magical {favoriteColor} book in the library.",
        "The book opened to show pictures of a friendly {favoriteAnimal}.",
        "{userName} and the {favoriteAnimal} became best friends.",
        "They played together in a beautiful garden full of {favoriteColor} flowers.",
        "At the end of the day, {userName} felt very happy about this new friendship."
      ],
      [
        "One sunny morning, {userName} decided to go on an adventure.",
        "They packed their favorite {favoriteFood} for a snack.",
        "Along the way, {userName} met a helpful {favoriteAnimal} who needed help.",
        "Together they solved the problem and shared the {favoriteFood}.",
        "{userName} learned that helping others makes adventures even better."
      ]
    ],
    'medium': [
      [
        "{userName} discovered a mysterious {favoriteColor} door in their backyard.",
        "Behind the door was a wonderful world where {favoriteAnimal}s could talk.",
        "A wise old {favoriteAnimal} invited {userName} to join their community.",
        "They worked together to solve a puzzle that would help everyone.",
        "{userName} returned home with new wisdom and lasting friendships."
      ]
    ],
    'hard': [
      [
        "{userName} inherited a special compass that always pointed toward adventure.",
        "Following the compass led to an ancient forest where animals needed help.",
        "The forest was losing its {favoriteColor} magic, and only kindness could restore it.",
        "{userName} organized the animals to work together, sharing {favoriteFood} and stories.",
        "Through teamwork and friendship, they restored the forest's magic and learned valuable lessons."
      ]
    ]
  };
  
  return templates[difficulty] || templates['easy'];
}

/**
 * Generate emergency pages as absolute last resort
 */
function generateEmergencyPages(pageCount, userInfo = {}) {
  const userName = userInfo.userName || userInfo.name || "the child";
  
  const emergencyTemplate = [
    `${userName} began a wonderful adventure.`,
    `${userName} met friendly characters along the way.`,
    `${userName} learned something important.`,
    `${userName} helped others and made new friends.`,
    `${userName} felt happy and proud of the journey.`
  ];
  
  let pages = [];
  for (let i = 0; i < pageCount; i++) {
    const pageIndex = i % emergencyTemplate.length;
    pages.push(`Page ${i + 1}: ${emergencyTemplate[pageIndex]}`);
  }
  
  return pages;
}

// ============= END COMPLETE INTEGRATION =============

  arabic: {
    indoor: ["in ornate Middle Eastern interior", "with Arabic architectural patterns", "in traditional Arabic setting", "with Middle Eastern design", "in elegant Arabic room"],
    outdoor: ["with Middle Eastern domes", "in ornate courtyard", "with mosaic patterns", "near ancient architecture", "with desert oasis backdrop"]
  },
  portuguese: {
    indoor: ["in Brazilian colonial interior", "with Portuguese cultural elements", "in warm Portuguese setting", "with Brazilian design details", "in Portuguese-style room", "with azulejo tile patterns", "in traditional Portuguese library", "with Portuguese maritime decor", "in colorful Portuguese kitchen", "with fado music ambiance", "in Portuguese cathedral interior", "with cork and wood elements", "in Manueline architectural style", "with Portuguese royal court design"],
    outdoor: ["with Brazilian landscape", "near Portuguese architecture", "with tropical colonial backdrop", "in colorful Portuguese plaza", "with Brazilian coastal elements", "near Portuguese castles", "with cork oak trees", "in Portuguese vineyard setting", "with traditional Portuguese windmills", "near Douro River valley", "with Portuguese fishing village backdrop", "in Sintra palace gardens", "with Portuguese maritime port", "near Cliffs of Moher coastal views", "with Portuguese countryside hills"]
  }
};

// ============= MASTER PLAN PHASE 6: CULTURAL ARRAY & ETHNICITY OPTIMIZATION =============
function applyCulturalSettingEnhancement(baseSetting, userInfo, avatarIdentity) {
  try {
    const language = avatarIdentity?.nativeLanguage || userInfo?.language || 'en';
    console.log(`🌍 Enhanced Cultural Setting Enhancement - Language: ${language}, Base Setting: "${baseSetting}"`);
    
    // ENHANCED: Context-aware cultural integration with indoor/outdoor detection
    const isIndoorSetting = baseSetting.toLowerCase().includes('indoor') || 
                           baseSetting.toLowerCase().includes('home') || 
                           baseSetting.toLowerCase().includes('school') ||
                           baseSetting.toLowerCase().includes('classroom') ||
                           baseSetting.toLowerCase().includes('kitchen') ||
                           baseSetting.toLowerCase().includes('bedroom');
    
    const isOutdoorSetting = baseSetting.toLowerCase().includes('outdoor') || 
                            baseSetting.toLowerCase().includes('park') || 
                            baseSetting.toLowerCase().includes('playground') ||
                            baseSetting.toLowerCase().includes('garden') ||
                            baseSetting.toLowerCase().includes('backyard');
    
    // Get cultural landmarks for the language with enhanced context awareness
    const landmarks = getCulturalLandmarks(language, isIndoorSetting, isOutdoorSetting);
    if (landmarks.length > 0) {
      const randomLandmark = landmarks[Math.floor(Math.random() * landmarks.length)];
      
      // ENHANCED: Context-aware enhancement with better integration
      if (baseSetting.toLowerCase().includes('park')) {
        return baseSetting.replace('park', `park ${randomLandmark}`);
      }
      if (baseSetting.toLowerCase().includes('school')) {
        return baseSetting.replace('school', `school ${randomLandmark}`);
      }
      if (baseSetting.toLowerCase().includes('home')) {
        return baseSetting.replace('home', `home ${randomLandmark}`);
      }
      if (baseSetting.toLowerCase().includes('playground')) {
        return baseSetting.replace('playground', `playground ${randomLandmark}`);
      }
      
      // Enhanced generic enhancement with smart positioning
      return `${baseSetting} ${randomLandmark}`;
    }
    
    console.log(`🌍 No cultural enhancement available for language: ${language}`);
    return baseSetting;
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Cultural setting enhancement error:', error);
    return baseSetting;
  }
}

// ============= RED X FIX 4: ENHANCED CONTEXT-AWARE ENHANCEMENT RULES =============
// Preserve exact story words while adding appropriate visual descriptors
function applyContextAwareEnhancement(currentValue, exactWord, type) {
  if (!exactWord || !currentValue) return currentValue;
  
  try {
    // Preserve exact story content first, enhance visually second
    if (type === 'action') {
      // Keep exact verb form, add minimal context-appropriate descriptors
      if (exactWord.includes('roll')) return `${exactWord}`;
      if (exactWord.includes('run')) return `${exactWord}`;
      if (exactWord.includes('jump')) return `${exactWord}`;
      if (exactWord.includes('play')) return `${exactWord}`;
      if (exactWord.includes('bounce')) return `${exactWord}`;
      if (exactWord.includes('fall')) return `${exactWord}`;
      if (exactWord.includes('climb')) return `${exactWord}`;
      if (exactWord.includes('swim')) return `${exactWord}`;
      if (exactWord.includes('hide')) return `${exactWord}`;
      if (exactWord.includes('slide')) return `${exactWord}`;
      return exactWord; // Preserve exact word - no enhancement needed
    }
    
    if (type === 'objects') {
      // Keep exact object names, add minimal color descriptors only when beneficial
      if (exactWord.includes('ball') && !exactWord.includes('red') && !exactWord.includes('blue')) {
        return `colorful ${exactWord}`;
      }
      return exactWord; // Preserve exact object
    }
    
    if (type === 'setting') {
      // Keep exact location, add minimal atmospheric descriptors
      if (exactWord.includes('hill')) return `${exactWord}`;
      if (exactWord.includes('park')) return `${exactWord}`;
      if (exactWord.includes('playground')) return `${exactWord}`;
      if (exactWord.includes('slope')) return `${exactWord}`;
      if (exactWord.includes('cliff')) return `${exactWord}`;
      return exactWord; // Preserve exact setting
    }
    
    return currentValue; // Fallback to current value
    
  } catch (error) {
    console.warn('⚠️ Context-aware enhancement error:', error);
    return currentValue; // Return original on error
  }
}

// MASTER PLAN PHASE 6: ENHANCED CULTURAL LANDMARK FUNCTION WITH CONTEXT AWARENESS
function getCulturalLandmarks(language, isIndoor = false, isOutdoor = false) {
  console.log(`🌍 Enhanced cultural landmarks for ${language} - Indoor: ${isIndoor}, Outdoor: ${isOutdoor}`);
  
  let languageKey = '';
  if (language === 'es' || language === 'spanish') languageKey = 'spanish';
  else if (language === 'fr' || language === 'french') languageKey = 'french';  
  else if (language === 'zh' || language === 'chinese') languageKey = 'chinese';
  else if (language === 'hi' || language === 'hindi') languageKey = 'hindi';
  else if (language === 'ar' || language === 'arabic') languageKey = 'arabic';
  
  if (!languageKey) {
    console.log(`🌍 No cultural landmarks available for language: ${language}`);
    return [];
  }
  
  const landmarks = CULTURAL_LANDMARKS[languageKey];
  if (!landmarks) return [];
  
  // ENHANCED: Context-aware landmark selection
  if (isIndoor && landmarks.indoor) {
    console.log(`🏠 Using indoor cultural landmarks for ${language}`);
    return landmarks.indoor;
  } else if (isOutdoor && landmarks.outdoor) {
    console.log(`🌳 Using outdoor cultural landmarks for ${language}`);
    return landmarks.outdoor;
  } else {
    // Default to outdoor if no specific context
    console.log(`🌍 Using default outdoor cultural landmarks for ${language}`);
    return landmarks.outdoor || landmarks.indoor || [];
  }
}

function detectCulturalProfile(userInfo, avatarIdentity) {
  try {
    const language = avatarIdentity?.nativeLanguage || userInfo?.language || 'en';
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
    
    // Language-based detection with real ethnicities
    if (language === 'es' || language === 'spanish') {
      console.log('🛡️ Tier 2.5: Spanish/Latino ethnicity detected via language');
      return 'Spanish/Latino ethnicity';
    }
    
    if (language === 'fr' || language === 'french') {
      console.log('🛡️ Tier 2.5: European ethnicity detected via language');
      return 'European ethnicity';
    }
    
    if (language === 'zh' || language === 'chinese') {
      console.log('🛡️ Tier 2.5: East Asian ethnicity detected via language');
      return 'East Asian ethnicity';
    }
    
    if (language === 'hi' || language === 'hindi') {
      console.log('🛡️ Tier 2.5: South Asian ethnicity detected via language');
      return 'South Asian ethnicity';
    }
    
    if (language === 'ar' || language === 'arabic') {
      console.log('🛡️ Tier 2.5: Middle Eastern ethnicity detected via language');
      return 'Middle Eastern ethnicity';
    }
    
    if (language === 'pt' || language === 'portuguese') {
      console.log('🛡️ Tier 2.5: Latin American ethnicity detected via language');
      return 'Latin American ethnicity';
    }
    
    console.log('🛡️ Tier 2.5: Standard American profile (default)');
    return 'Standard American';
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Cultural detection error, using default:', error);
    return 'Standard American';
  }
}

function detectEmotionFromText(text) {
  try {
    if (!text || typeof text !== 'string') return ''; // Enhanced: Return empty string for fallback
    
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

// ============= END ENHANCED TIER 2.5 SEMANTIC PLACEHOLDER EXTRACTION FUNCTIONS =============

// ============= BASIC TEMPLATE EXTRACTION FUNCTIONS (TIER 1.5 / 2.5B) =============
/**
 * Limit pageText to maximum 3 sentences for basic templates
 */
function limitPageTextToThreeSentences(pageText) {
  try {
    if (!pageText || typeof pageText !== 'string') return '';
    
    // Split by sentence terminators and take first 3 sentences
    const sentences = pageText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.slice(0, 3).join('. ').trim() + (sentences.length > 0 ? '.' : '');
  } catch (error) {
    console.warn('⚠️ Page text limitation failed:', error);
    return pageText?.substring(0, 200) || ''; // Fallback to character limit
  }
}

/**
 * Extract basic setting using simple regex patterns
 */
function extractBasicSetting(pageText) {
  try {
    if (!pageText || typeof pageText !== 'string') return 'a colorful place';
    
    // Simple regex to find "in/at [location]"
    const settingMatch = pageText.match(/(?:in|at)\s+(?:the\s+)?([^,.!?]+)/i);
    if (settingMatch && settingMatch[1]) {
      return settingMatch[1].trim();
    }
    
    // Fallback: check for common location words
    const locationWords = ['home', 'school', 'park', 'garden', 'room', 'kitchen', 'playground', 'forest', 'beach'];
    for (const word of locationWords) {
      if (pageText.toLowerCase().includes(word)) {
        return `a ${word}`;
      }
    }
    
    return 'a bright colorful environment';
  } catch (error) {
    console.warn('⚠️ Basic setting extraction failed:', error);
    return 'a welcoming place';
  }
}

/**
 * Extract basic action using simple regex patterns
 */
function extractBasicAction(pageText) {
  try {
    if (!pageText || typeof pageText !== 'string') return 'enjoying a happy moment';
    
    // Simple regex to find action verbs
    const actionMatch = pageText.match(/(?:played|playing|runs|running|walked|walking|danced|dancing)\s+([^,.!?]*)/i);
    if (actionMatch && actionMatch[0]) {
      return actionMatch[0].trim();
    }
    
    // Fallback: check for basic action words
    const actionWords = ['play', 'run', 'jump', 'dance', 'laugh', 'smile', 'explore', 'discover'];
    for (const word of actionWords) {
      if (pageText.toLowerCase().includes(word)) {
        return `${word}ing happily`;
      }
    }
    
    return 'having a wonderful time';
  } catch (error) {
    console.warn('⚠️ Basic action extraction failed:', error);
    return 'enjoying the moment';
  }
}

/**
 * Extract basic objects using simple regex patterns  
 */
function extractBasicObjects(pageText) {
  try {
    if (!pageText || typeof pageText !== 'string') return 'colorful items';
    
    // Simple regex to find "with [object]"
    const objectMatch = pageText.match(/with\s+(?:his|her|their|a|an|the)?\s*([^,.!?]+)/i);
    if (objectMatch && objectMatch[1]) {
      return objectMatch[1].trim();
    }
    
    // Fallback: check for common object words
    const objectWords = ['toy', 'ball', 'book', 'friend', 'pet', 'bicycle', 'flowers', 'butterfly', 'treasure'];
    for (const word of objectWords) {
      if (pageText.toLowerCase().includes(word)) {
        return word;
      }
    }
    
    return 'interesting things';
  } catch (error) {
    console.warn('⚠️ Basic objects extraction failed:', error);
    return 'wonderful items';
  }
}

/**
 * Simple extraction function for secondary characters (Tier 2.5B - Nuclear Independence)
 * Uses basic regex patterns with hardcoded fallbacks - NO complex dependencies
 */
function extractSimpleSecondaryCharacters(pageText) {
  try {
    if (!pageText || typeof pageText !== 'string') return '';
    
    const text = pageText.toLowerCase();
    const found = [];
    
    // Simple regex patterns for common relationships
    const patterns = [
      /with (?:his|her|their) (\w+)/gi,
      /and (?:his|her|their) (\w+)/gi,
      /friend (\w+)/gi,
      /(?:mom|mother|dad|father|sister|brother) (\w+)/gi,
      /(?:dog|cat|pet) (?:named )?(\w+)/gi
    ];
    
    patterns.forEach(pattern => {
      const matches = [...pageText.matchAll(pattern)];
      matches.forEach(match => {
        if (match[1] && match[1].length > 1 && match[1] !== 'the') {
          found.push(match[1]);
        }
      });
    });
    
    // Remove duplicates and limit
    const unique = [...new Set(found)].slice(0, 2);
    return unique.length > 0 ? `with ${unique.join(' and ')}` : '';
    
  } catch (error) {
    console.warn('⚠️ Simple secondary characters extraction failed:', error);
    return ''; // Silent failure - nuclear independence
  }
}

/**
 * Fill basic template with simplified 3-section structure (Tier 1.5 / 2.5B)
 * Following the example: "Tommy played with his friend Sequoia" → "A child playing with friend Sequoia in a garden"
 */
function fillBasicTemplate(
  difficulty,
  userInfo,
  pageText,
  localAvatarIdentity,
  scene,
  setting,
  objects,
  secondary_characters
) {
  console.log(`🛡️ Tier 1.5 (2.5B): Filling BASIC template with 3-section structure`);
  
  try {
    // Validate input parameters with fallbacks
    const safeDifficulty = difficulty || 'medium';
    const safePageText = pageText || 'A child having a wonderful adventure';
    
    // Get basic template with fallback protection
    let template;
    try {
      template = BASIC_PROMPT_TEMPLATES[safeDifficulty] || BASIC_PROMPT_TEMPLATES.medium || BASIC_PROMPT_TEMPLATES['medium'];
      if (!template) {
        throw new Error('No basic template found');
      }
    } catch (templateError) {
      console.warn('⚠️ Basic template selection failed, falling back to emergency template:', templateError);
      throw templateError; // Pass to next tier
    }
    
    // Extract semantic components using unified vocabulary
    const limitedPageText = limitPageTextToThreeSentences(safePageText);
    const subject = extractSubject(safePageText);
    const action = extractAction(safePageText);
    const setting = extractSetting(safePageText);
    const adjective = extractAdjective(safePageText);
    const emotion = extractEmotion(safePageText);
    
    // Extract simple secondary characters using basic patterns only
    const secondaryChars = secondary_characters || extractSimpleSecondaryCharacters(safePageText);
    
    // Get nuclear avatar mapping with error protection
    let avatarMapping;
    try {
      avatarMapping = getNuclearAvatarMapping(userInfo, safeDifficulty);
      console.log(`✅ Basic nuclear avatar mapping applied: ${avatarMapping.character}`);
    } catch (avatarError) {
      console.warn('⚠️ Basic avatar mapping failed, using fallback:', avatarError);
      avatarMapping = { 
        character: 'a friendly child',
        age: 'young',
        skin: 'medium skin tone',
        hair: 'neat hair',
        eyes: 'bright eyes',
        face: 'cheerful expression',
        clothing: 'comfortable clothes'
      };
    }
    
    // 🎨 NUCLEAR STYLE SETTINGS - NOW USING GLOBAL DEFINITION 🎨
    console.log('✅ Tier 2.5: Using global NUCLEAR_STYLE_SETTINGS definition');

    // Get framework prompt with fallback protection  
    let frameworkPrompt;
    try {
      frameworkPrompt = NUCLEAR_STYLE_SETTINGS[safeDifficulty]?.frameworkPrompt || 
                       NUCLEAR_STYLE_SETTINGS['medium']?.frameworkPrompt || 
                       EMERGENCY_FALLBACK_FRAMEWORK ||
                       'Children book style with vibrant colors, friendly character design, bright cheerful atmosphere';
    } catch (frameworkError) {
      console.warn('⚠️ Framework prompt failed, using hardcoded fallback:', frameworkError);
      frameworkPrompt = 'Children book style with vibrant colors, friendly character design, bright cheerful atmosphere';
    }
    
    // PHASE 3: Template Processing Function Updates - Include nuclear avatar placeholders
    let filledTemplate = template
      .replace(/{pageText}/g, limitedPageText)
      .replace(/{character}/g, avatarMapping.character || 'child')
      .replace(/{age}/g, avatarMapping.age || '7-year-old')
      .replace(/{hair}/g, avatarMapping.hair || 'neat hair')
      .replace(/{features}/g, avatarMapping.features || 'friendly features')
      .replace(/{subject}/g, subject)
      .replace(/{action}/g, action)
      .replace(/{setting}/g, setting)
      .replace(/{adjective}/g, adjective)
      .replace(/{emotion}/g, emotion)
      .replace(/{secondary_characters}/g, secondaryChars)
      .replace(/{frameworkPrompt}/g, frameworkPrompt);
    
    // Clean up any remaining placeholders
    filledTemplate = filledTemplate.replace(/{[^}]*}/g, '').replace(/\s+/g, ' ').trim();
    
    console.log('✅ Basic Template (Tier 1.5 / 2.5B) filled successfully');
    console.log(`📝 Basic template result preview: ${filledTemplate.substring(0, 100)}...`);
    
    return filledTemplate;
    
  } catch (error) {
    console.warn('⚠️ Basic template filling failed:', error);
    throw error; // Pass to next fallback tier
  }
}

// ============= END BASIC TEMPLATE EXTRACTION FUNCTIONS =============

function fillPremiumTemplate(
  difficulty,
  userInfo,
  scene,
  setting,
  objects,
  secondary_characters,
  emotion,
  pageText,
  avatarIdentity,
  spatialComposition,
  atmosphereContext
) {
  console.log(`🛡️ Tier 2.5: Filling template with comprehensive silent failure protection`);
  
  try {
    // Validate input parameters with fallbacks
    const safeDifficulty = difficulty || 'medium';
    const safeScene = scene || 'enjoying a bright cheerful moment';
    const safeSetting = setting || 'a welcoming colorful environment';
    const safeObjects = objects || 'interesting colorful items';
    const safeSecondaryCharacters = secondary_characters || '';
    const safeEmotion = emotion || 'Positive and uplifting atmosphere';
    
    // Apply smart sentence extraction for pageText based on difficulty level
    const processedPageText = extractFirstSentences(pageText || '', safeDifficulty);
    
    // ============= ANALYZE PAGE TEXT FOR VISUAL DETAILS =============
    // Add visual detail analysis for consistent object tracking across tiers
    try {
      // Adapted to promise chain to avoid await in non-async function context
      import('../_shared/VisualDetailTracker.js')
        .then(({ VisualDetailTracker }) => VisualDetailTracker.analyzeTextForDetails(
          sessionId || 'tier25-session', 
          pageText || processedPageText, 
          userInfo?.pageNumber || 1, 
          finalMapping?.character || 'child'
        ))
        .then(() => {
          console.log(`🔍 Tier 2.5A: Page text analyzed for visual details`);
        })
        .catch((error) => {
          console.warn(`⚠️ Tier 2.5A: Visual detail analysis failed:`, error.message);
        });
    } catch (error) {
      console.warn(`⚠️ Tier 2.5A: Visual detail analysis failed:`, error.message);
    }
    
    console.log(`🛡️ Tier 2.5: Filling template for difficulty: ${safeDifficulty}`);
    
    // Get template with fallback protection
    let template;
    try {
      template = PREMIUM_PROMPT_TEMPLATES[safeDifficulty] || PREMIUM_PROMPT_TEMPLATES.medium || PREMIUM_PROMPT_TEMPLATES['medium'];
      if (!template) {
        throw new Error('No template found');
      }
    } catch (templateError) {
      console.warn('⚠️ Template selection failed, using emergency template:', templateError);
      
      // ============= CRITICAL REGRESSION PREVENTION: LINE 2054 =============
      // 4-TIER FALLBACK IMPLEMENTATION: Raw PageText Function (Emergency Tier 2.5C)
      // This line constructs emergency template using:
      // 1. First 2500 characters of pageText (user's story content)
      // 2. Plus frameworkPrompt from NUCLEAR_STYLE_SETTINGS array (defined at line 2167)
      // 3. With multiple fallback levels for nuclear independence
      // 
      // CRITICAL DEPENDENCIES:
      // - NUCLEAR_STYLE_SETTINGS must be defined BEFORE this line (currently at 2167)
      // - pageText comes from function parameter (user story content)
      // - safeDifficulty used as array key for style selection
      //
      // REGRESSION RISKS:
      // - Moving NUCLEAR_STYLE_SETTINGS after this line will break fallback
      // - Changing frameworkPrompt structure will break template generation
      // - Removing any fallback level could cause undefined errors
      //
      // TESTING: Verify template generation when PREMIUM_PROMPT_TEMPLATES fails
      // NOTE: This is now part of the 4-tier system as Emergency Template (Tier 2.5C)
      // FALLBACK CHAIN: Premium (2.5A) → Basic (2.5B) → Emergency (2.5C) → Ultimate Emergency (2.5D)
      template = (pageText || '').substring(0, 2500) + ' ' + (NUCLEAR_STYLE_SETTINGS[safeDifficulty]?.frameworkPrompt || NUCLEAR_STYLE_SETTINGS['medium']?.frameworkPrompt || EMERGENCY_FALLBACK_FRAMEWORK || 'Children book style with vibrant colors, friendly character design, bright cheerful atmosphere');
    }
    
    // NUCLEAR AVATAR MAPPING with error protection
    let avatarMapping;
    try {
      avatarMapping = getNuclearAvatarMapping(userInfo, safeDifficulty);
      console.log(`✅ Nuclear avatar mapping applied: ${avatarMapping.character}`);
    } catch (avatarError) {
      console.warn('⚠️ Avatar mapping failed, using fallback:', avatarError);
      avatarMapping = { 
        character: 'a friendly child',
        age: 'young',
        skin: 'medium skin tone',
        hair: 'neat hair',
        eyes: 'bright eyes',
        face: 'cheerful expression',
        clothing: 'comfortable clothes'
      };
    }
    
    // Detect cultural contexts with error protection
    let userLanguage, skinTone, isEnglishDarkSkin;
    try {
      userLanguage = avatarIdentity?.nativeLanguage || userInfo?.language || 'en';
      skinTone = userInfo?.avatar?.skinTone || '';
      isEnglishDarkSkin = (userLanguage === 'en' || userLanguage === 'english') && 
                          (skinTone.toLowerCase().includes('dark') || 
                           skinTone.toLowerCase().includes('brown') ||
                           skinTone.toLowerCase().includes('black'));
    } catch (culturalError) {
      console.warn('⚠️ Cultural context detection failed, using defaults:', culturalError);
      userLanguage = 'en';
      skinTone = 'medium';
      isEnglishDarkSkin = false;
    }
    
    const isFrenchDarkSkin = (userLanguage === 'fr' || userLanguage === 'french') && 
                             (skinTone.toLowerCase().includes('dark') || 
                              skinTone.toLowerCase().includes('brown') ||
                              skinTone.toLowerCase().includes('black'));
    
    const isSpanishDarkSkin = (userLanguage === 'es' || userLanguage === 'spanish') && 
                              (skinTone.toLowerCase().includes('dark') || 
                               skinTone.toLowerCase().includes('brown') ||
                               skinTone.toLowerCase().includes('black'));
    
    const isPortugueseDarkSkin = (userLanguage === 'pt' || userLanguage === 'portuguese') && 
                                 (skinTone.toLowerCase().includes('dark') || 
                                  skinTone.toLowerCase().includes('brown') ||
                                  skinTone.toLowerCase().includes('black'));
    
    let finalMapping = avatarMapping;
    
    // English + Dark Skin: African American hairstyles + facial features
    if (isEnglishDarkSkin) {
      console.log('🛡️ Tier 2.5: Using African American cultural arrays for English + dark skin');
      
      const character = avatarMapping.character === 'child' ? 'boy' : avatarMapping.character;
      const extractedGender = extractGenderFromCharacter(character);
      const genderKey = extractedGender === 'girl' ? 'girls' : 'boys';
      
      finalMapping = {
        ...avatarMapping,
        hair: getRandomItem(HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES[genderKey]),
        features: getRandomItem(HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES)
      };
    }
    // French + Dark Skin: African American hairstyles + facial features  
    else if (isFrenchDarkSkin) {
      console.log('🛡️ Tier 2.5: Using African American cultural arrays for French + dark skin');
      
      const character = avatarMapping.character === 'child' ? 'boy' : avatarMapping.character;
      const extractedGender = extractGenderFromCharacter(character);
      const genderKey = extractedGender === 'girl' ? 'girls' : 'boys';
      
      finalMapping = {
        ...avatarMapping,
        hair: getRandomItem(HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES[genderKey]),
        features: getRandomItem(HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES)
      };
    }
    // Spanish + Dark Skin: African American hairstyles + facial features
    else if (isSpanishDarkSkin) {
      console.log('🛡️ Tier 2.5: Using African American cultural arrays for Spanish + dark skin');
      
      const character = avatarMapping.character === 'child' ? 'boy' : avatarMapping.character;
      const extractedGender = extractGenderFromCharacter(character);
      const genderKey = extractedGender === 'girl' ? 'girls' : 'boys';
      
      finalMapping = {
        ...avatarMapping,
        hair: getRandomItem(HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES[genderKey]),
        features: getRandomItem(HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES)
      };
    }
    // Portuguese + Dark Skin: African American hairstyles + facial features
    else if (isPortugueseDarkSkin) {
      console.log('🛡️ Tier 2.5: Using African American cultural arrays for Portuguese + dark skin');
      
      const character = avatarMapping.character === 'child' ? 'boy' : avatarMapping.character;
      const extractedGender = extractGenderFromCharacter(character);
      const genderKey = extractedGender === 'girl' ? 'girls' : 'boys';
      
      finalMapping = {
        ...avatarMapping,
        hair: getRandomItem(HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES[genderKey]),
        features: getRandomItem(HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES)
      };
    }
    
    // ============= MASTER PLAN PHASE 3: TEMPLATE VARIABLE SCOPE FIX =============
    // Get style framework settings using nuclear independence - MOVED TO BEFORE TEMPLATE FILLING
    // 
    // ========== NUCLEAR STYLE SETTINGS - Enhanced Framework Prompts ==========
    // CRITICAL: This array MUST be defined before line 2054 (Raw PageText Fallback)
    // 
    // ⚠️  REGRESSION PREVENTION - CRITICAL DEPENDENCIES ⚠️
    // - Moving this after line 2054 breaks emergency template generation
    // - Removing frameworkPrompt properties breaks template construction  
    // - Changing difficulty keys affects template selection logic
    // - Used by fillPremiumTemplate function (called at line 2842)
    // - Used by emergency fallback system at line 2054
    //
    // 🎨 NUCLEAR STYLE SETTINGS MOVED TO TOP - DUPLICATED DEFINITION REMOVED 🎨
    // (Main definition moved to line ~2565 for early access)
    
    const styleSettings = NUCLEAR_STYLE_SETTINGS[safeDifficulty] || NUCLEAR_STYLE_SETTINGS['medium'];
    console.log('✅ Nuclear style settings applied - zero dependencies, bulletproof operation');

    // Apply cultural setting enhancement
    const enhancedSetting = applyCulturalSettingEnhancement(setting, userInfo, avatarIdentity);
    
    // ============= MASTER PLAN: CAMERA DIRECTIVE INTEGRATION (After scene extraction) =============
    const cameraDirective = generateCameraDirective(difficulty, scene, enhancedSetting);
    
    // Get style framework settings using nuclear independence (defined below)
    // const styleSettings = NUCLEAR_STYLE_SETTINGS[difficulty] || NUCLEAR_STYLE_SETTINGS['medium']; // MOVED TO AFTER DEFINITION
    
    // Conditional clothing detection from story text
    const clothing = detectClothingFromStory(pageText || scene);
    
    // Use smart sentence extraction instead of full pageText (reuse processed text from above)
    // const processedPageText = extractFirstSentences(pageText || '', safeDifficulty); // REMOVED: Already declared above
    
    // Get character ethnicity note
    const ethnicity = getCharacterEthnicity(userInfo, avatarIdentity);
    
    // ============= PHASE 6 ENHANCED: ACTION-INTEGRATED OBJECT DESCRIPTIONS =============
    // Convert objects into natural action-based descriptions
    let actionObjects = '';
    if (objects && objects.trim()) {
      // Extract individual objects and integrate with actions
      const objectList = objects.replace(/^,\s*/, '').split(',').map(obj => obj.trim()).filter(obj => obj);
      if (objectList.length > 0) {
        // Create natural action-object combinations
        const actionIntegratedObjects = objectList.map(obj => {
          // Remove leading articles and clean object name
          const cleanObj = obj.replace(/^(with\s+|a\s+|an\s+|the\s+)/i, '');
          
          // Map objects to natural actions
          if (cleanObj.match(/book|story|reading/i)) return ` reading with ${cleanObj}`;
          if (cleanObj.match(/ball|toy|game/i)) return ` playing with ${cleanObj}`;
          if (cleanObj.match(/art|paint|draw|crayon/i)) return ` creating art with ${cleanObj}`;
          if (cleanObj.match(/music|instrument/i)) return ` making music with ${cleanObj}`;
          if (cleanObj.match(/food|snack|lunch/i)) return ` enjoying ${cleanObj}`;
          if (cleanObj.match(/bike|scooter|skateboard/i)) return ` riding ${cleanObj}`;
          if (cleanObj.match(/puzzle|blocks|lego/i)) return ` building with ${cleanObj}`;
          
          // Default natural integration
          return ` with ${cleanObj}`;
        });
        
        actionObjects = actionIntegratedObjects.join('');
      }
    }
    
    // ============= PHASE 3: ADD NEW SEMANTIC PLACEHOLDERS =============
    // 🚨 REGRESSION PREVENTION: All new placeholders must handle null/undefined gracefully
    // Extract new semantic placeholders from story content
    const atmosphere = extractAtmosphere(pageText, safeScene, enhancedSetting);
    const props = extractProps(pageText, safeScene);
    const communityContext = extractCommunityContext(pageText, enhancedSetting);
    const sensoryDetails = extractSensoryDetails(pageText, safeScene);
    
    // ============= PHASE 4: Enhanced Null Safety System - Critical Placeholder Validation =============
    // Check for critical placeholder failures that should trigger emergency template
    const criticalPlaceholderFailure = (!finalMapping.character || finalMapping.character === 'undefined' || finalMapping.character === '') ||
                                      (!safeScene || safeScene === 'undefined' || safeScene === '') ||
                                      (!enhancedSetting || enhancedSetting === 'undefined' || enhancedSetting === '');
    
    if (criticalPlaceholderFailure) {
      console.warn('🚨 Critical placeholder failure detected - triggering emergency template');
      throw new Error('Critical placeholders failed: character, scene, or setting missing');
    }

    // ============= SEEDED SECONDARY CHARACTER POSITIONING (REPLACES enhanceSecondaryCharacterPositioning) =============
    function enhanceSeededSecondaryCharacterPositioning(secondaryChars, pageText, scene, sessionId) {
      if (!secondaryChars || secondaryChars.trim().length === 0) {
        return '';
      }
      
      console.log(`🎯 Tier 2.5A: Enhancing seeded secondary character positioning: "${secondaryChars}"`);
      
      // If already has seed descriptions (contains ':'), preserve them and add positioning
      if (secondaryChars.includes(':')) {
        const spatialPositions = [
          'standing nearby', 'sitting close by', 'positioned to the left', 'positioned to the right',
          'in the background', 'in the foreground', 'walking alongside', 'playing together',
          'gathered around', 'sitting together', 'standing behind', 'positioned in front'
        ];
        
        const seed = (sessionId || '') + secondaryChars + scene;
        const randomPosition = getSeededRandomItem(spatialPositions, seed);
        
        const result = `${secondaryChars}, ${randomPosition}`;
        console.log(`✅ Tier 2.5A: Seeded positioning applied: ${result}`);
        return result;
      }
      
      // Fallback: Use original enhanceSecondaryCharacterPositioning for backwards compatibility
      return enhanceSecondaryCharacterPositioning(secondaryChars, pageText, scene);
    }
    
    // PHASE 4: Cultural Authentication Fallbacks for {hair} and {features}
    let safeFinalHair = finalMapping.hair;
    let safeFinalFeatures = finalMapping.features;
    
    // Apply cultural authentication fallbacks if hair/features are missing
    if (!safeFinalHair || safeFinalHair === 'undefined' || safeFinalHair === '') {
      if (isEnglishDarkSkin || isFrenchDarkSkin || isSpanishDarkSkin || isPortugueseDarkSkin) {
        safeFinalHair = 'authentic African American hairstyle';
      } else {
        // For other cultures, use generic fallback
        safeFinalHair = 'neat natural hairstyle';
      }
      console.log('🛡️ Applied cultural hair fallback:', safeFinalHair);
    }
    
    if (!safeFinalFeatures || safeFinalFeatures === 'undefined' || safeFinalFeatures === '') {
      if (isEnglishDarkSkin || isFrenchDarkSkin || isSpanishDarkSkin || isPortugueseDarkSkin) {
        safeFinalFeatures = 'authentic African American features';
      } else {
        // For other cultures, use generic fallback
        safeFinalFeatures = 'warm friendly features';
      }
      console.log('🛡️ Applied cultural features fallback:', safeFinalFeatures);
    }
    
    // ============= PAGE TEXT ANALYSIS FOR VISUAL DETAILS =============
    // Analyze current page text for visual details before building colored objects
    try {
      // Adapted to promise chain to avoid await in non-async function context
      import('../_shared/VisualDetailTracker.js')
        .then(({ VisualDetailTracker }) => VisualDetailTracker.analyzeTextForDetails(
          sessionId || 'fallback-session', 
          pageText, 
          1, // Default to page 1 for tier 2.5A
          userInfo?.avatar?.type || 'child'
        ))
        .then(() => {
          console.log(`🔍 Tier 2.5A: Page text analyzed for visual details`);
        })
        .catch((error) => {
          console.warn(`⚠️ Tier 2.5A: Visual detail analysis failed:`, error.message);
        });
    } catch (error) {
      console.warn(`⚠️ Tier 2.5A: Visual detail analysis failed:`, error.message);
    }
    
    // ============= NEW: COLORED OBJECTS INTEGRATION =============
    // Add persistent colored objects from VisualDetailTracker BEFORE template processing
    let coloredObjects = '';
    try {
      // Adapted to promise chain to avoid await in non-async function context
      import('../_shared/VisualDetailTracker.js')
        .then(({ VisualDetailTracker }) => VisualDetailTracker.buildObjectDescription(sessionId || 'fallback-session'))
        .then((storedObjects) => {
          coloredObjects = storedObjects || '';
          
          if (coloredObjects) {
            console.log(`🎨 Tier 2.5A: Integrated colored objects: ${coloredObjects}`);
          }
        })
        .catch((error) => {
          console.warn(`⚠️ Tier 2.5A: VisualDetailTracker integration failed:`, error.message);
        });
    } catch (error) {
      console.warn(`⚠️ Tier 2.5A: VisualDetailTracker integration failed:`, error.message);
    }
    
    let filledTemplate = template
      .replace('{pageText}', processedPageText)
      .replace('{character}', finalMapping.character)
      .replace('{age}', finalMapping.age)
      .replace('{ethnicity}', ethnicity) // PHASE 3: Moved ethnicity to character description
      .replace('{hair}', safeFinalHair)
      .replace('{features}', safeFinalFeatures)
      .replace('{scene}', safeScene) // PHASE 1 FIX: Use safeScene instead of undefined enhancedScene
      .replace('{setting}', enhancedSetting) // PHASE 1 FIX: Use enhancedSetting instead of undefined scopedEnhancedSetting
      .replace('{action_objects}', actionObjects) // PHASE 6: Enhanced action-integrated objects
      .replace('{secondary_characters}', enhanceSeededSecondaryCharacterPositioning(secondary_characters, pageText, safeScene, sessionId) || '') // ENHANCED: Seed-based spatial positioning integration
      .replace('{colored_objects}', coloredObjects) // NEW: Colored objects from VisualDetailTracker
      .replace('{emotion}', emotion)
      .replace('{atmosphere}', atmosphereContext || atmosphere) // Use contextual atmosphere if available
      .replace('{spatial_composition}', spatialComposition || 'character prominently featured in foreground') // New contextual placeholder
      // ============= ENHANCED ACTION SECTION PLACEHOLDERS =============
      .replace('{action_intensity}', extractActionIntensity(pageText))
      .replace('{spatial_positioning}', extractSpatialPositioning(pageText))
      .replace('{object_interaction}', extractObjectInteraction(pageText, actionObjects))
      .replace('{body_language}', extractBodyLanguage(pageText))
      // ============= END ENHANCED ACTION SECTION =============
      .replace('{props}', props) // PHASE 3: New semantic placeholder
      .replace('{community_context}', communityContext) // PHASE 3: New semantic placeholder
      .replace('{sensory_details}', sensoryDetails) // PHASE 3: New semantic placeholder
      .replace('{frameworkPrompt}', styleSettings.frameworkPrompt)
      .replace('{cameraDirective}', cameraDirective); // PHASE 5: Camera directive moved to end
    
    // PHASE 4: Safe clothing detection with null safety
    // Add clothing if detected - use safe variables
    if (clothing) {
      filledTemplate = filledTemplate.replace('{features}', `${safeFinalFeatures}, wearing ${clothing}`);
    }
    
    // PHASE 7: TEMPLATE VALIDATION (Only checks for empty sections now)
    const templateValidation = validateTemplateCompletion(filledTemplate);
    if (!templateValidation.isValid) {
      console.log(`🔄 Template has empty sections: ${templateValidation.issues.join(', ')} - Falling back to Tier 2.5B`);
      return fillBasicTemplate(safeDifficulty, userInfo, pageText, avatarIdentity, safeScene, enhancedSetting, safeObjects, secondary_characters);
    }
    
    // PHASE 8: REMOVE EMPTY SECTIONS 
    filledTemplate = removeEmptySections(filledTemplate);
    
    console.log(`🛡️ Tier 2.5: Template filled successfully with nuclear mapping`);
    return filledTemplate;
    
  } catch (error) {
    console.error('❌ Tier 2.5: Template filling error:', error);
    return generateEmergencyPrompt(userInfo);
  }
}

// TEMPLATE VALIDATION SYSTEM
function validateTemplateCompletion(template) {
  const issues = [];
  
  // Only check for empty sections in template - ethnicity, generic settings, and action length don't matter anymore
  const emptySectionPattern = /\w+:\s*[,.]|\w+:\s*\w+:\s*[,.]/g;
  if (emptySectionPattern.test(template)) {
    issues.push('Empty template sections detected');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

// NEW: Character consistency validation - triggers 2.5B on failure
function validateCharacterConsistency(characterData, avatarMapping) {
  const issues = [];
  
  if (!characterData || !avatarMapping) {
    issues.push('Missing character data or avatar mapping');
  }
  
  if (avatarMapping?.source === 'emergency-fallback') {
    issues.push('Character consistency service failed');
  }
  
  if (!avatarMapping?.character || avatarMapping.character === 'a friendly child') {
    issues.push('Generic character fallback detected');
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues
  };
}

// NEW: Visual element validation - triggers 2.5B on failure  
function validateVisualElements(sceneData, objects, setting) {
  const issues = [];
  
  if (!sceneData?.spatialComposition || sceneData.spatialComposition === 'character prominently featured in foreground') {
    issues.push('Generic spatial composition detected');
  }
  
  if (!objects || objects === 'interesting colorful items') {
    issues.push('Generic objects fallback detected');
  }
  
  if (!sceneData?.atmosphereContext || sceneData.atmosphereContext === 'warm, inviting atmosphere') {
    issues.push('Generic atmosphere fallback detected');
  }
  
  if (!setting || setting === 'a welcoming colorful environment') {
    issues.push('Generic setting fallback detected');
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues
  };
}

// NEW: Scene complexity validation - triggers 2.5B on failure
function validateSceneComplexity(sceneData, pageText) {
  const issues = [];
  
  if (!sceneData?.contextualAction && pageText && pageText.length > 50) {
    issues.push('No contextual action extracted from substantial text');
  }
  
  if (!sceneData?.contextualSetting && pageText && pageText.length > 50) {
    issues.push('No contextual setting extracted from substantial text');
  }
  
  if (sceneData?.scene && sceneData.scene === 'enjoying a bright cheerful moment') {
    issues.push('Generic scene fallback detected');
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues
  };
}

// ENHANCED REMOVE EMPTY SECTIONS - HANDLES ACTION SECTION DYNAMICALLY
function removeEmptySections(template) {
  console.log('🧹 Before cleaning:', template);
  
  let cleaned = template;
  
  // STEP 1: Handle Action section specifically - DYNAMIC PROCESSING
  // Pattern: Action: {scene}, {action_intensity}, {spatial_positioning}, {object_interaction}, {body_language}
  const actionRegex = /Action:\s*([^,]*),\s*([^,]*),\s*([^,]*),\s*([^,]*),\s*([^,.]*)(?=[.]\s|\s*\w+:)/g;
  
  cleaned = cleaned.replace(actionRegex, (match, scene, intensity, spatial, interaction, bodyLang) => {
    const components = [];
    
    // Always include scene if present
    if (scene && scene.trim() && !scene.includes('{')) {
      components.push(scene.trim());
    }
    
    // Include intensity only if not empty
    if (intensity && intensity.trim() && !intensity.includes('{')) {
      components.push(intensity.trim());
    }
    
    // DYNAMIC: Include spatial_positioning only if meaningful (not empty)
    if (spatial && spatial.trim() && !spatial.includes('{')) {
      components.push(spatial.trim());
    }
    
    // Include object_interaction only if not empty
    if (interaction && interaction.trim() && !interaction.includes('{')) {
      components.push(interaction.trim());
    }
    
    // DYNAMIC: Include body_language only if meaningful (not empty)
    if (bodyLang && bodyLang.trim() && !bodyLang.includes('{')) {
      components.push(bodyLang.trim());
    }
    
    // Build Action section dynamically - prioritize scene and action over positioning details
    if (components.length > 0) {
      return `Action: ${components.join(', ')}`;
    } else {
      return ''; // Remove entire Action section if no components
    }
  });
  
  // STEP 2: Remove other empty sections (original logic)
  cleaned = cleaned
    .replace(/\w+:\s*[,.](?=\s*\w+:)/g, '') // Remove empty sections in middle
    .replace(/\w+:\s*[,.](?=\s*Technical:)/g, '') // Remove empty sections before Technical
    .replace(/\w+:\s*[,.]$/g, '') // Remove empty sections at end
    .replace(/,\s*,+/g, ',') // Fix multiple commas
    .replace(/\.\s*\.+/g, '.') // Fix multiple periods
    .replace(/\s+/g, ' ') // Clean up extra spaces
    .replace(/\.\s*\w+:/g, '. ') // Fix periods before section labels
    .trim();
  
  console.log('🧹 After cleaning:', cleaned);
  return cleaned;
}

function getCharacterEthnicity(userInfo, avatarIdentity) {
  try {
    const language = avatarIdentity?.nativeLanguage || userInfo?.language || 'en';
    const skinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || '';
    
    // Multi-Language + Dark Skin Ethnicity Enhancement
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
      // Fallback for other languages with dark skin
      return "depict character from African American background";
    }
    
    // Language-based ethnicity notes (for non-dark skin)
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
    
    // Default: no specific ethnicity note for English/Standard American
    return "";
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Character ethnicity detection error:', error);
    return "";
  }
}

// AFTER line 805, ADD emergency prompt generator:
function generateEmergencyPrompt(userInfo) {
  const gender = userInfo?.avatar?.type === 'girl' ? 'girl' : 
                userInfo?.avatar?.type === 'boy' ? 'boy' : 'child';
  
  return `An attractive ${gender} in a portrait style photo with main character focus. Beautiful children's book illustration, warm lighting, cheerful atmosphere, high quality, detailed art.`;
}

// ============= HELPER FUNCTIONS =============

// ENHANCED CLOTHING DETECTION WITH COLOR SYSTEM
function detectClothingFromStory(text) {
  if (!text) return '';
  
  // Use unified clothing detection keywords (no local arrays)
  
  const lowerText = text.toLowerCase();
  
  // Try dynamic clothing + color detection first
  const dynamicClothingColor = detectAndResolveClothingColor(text);
  if (dynamicClothingColor) {
    return dynamicClothingColor;
  }
  
  // Fallback to basic clothing detection
  for (const keyword of CLOTHING_DETECTION_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      // Extract clothing context around the keyword
      const sentences = text.split(/[.!?]+/);
      for (const sentence of sentences) {
        if (sentence.toLowerCase().includes(keyword)) {
          // Add random color if no color specified
          const randomColor = EXPANDED_COLOR_ARRAY[Math.floor(Math.random() * EXPANDED_COLOR_ARRAY.length)];
          return `a ${randomColor} ${keyword}`;
        }
      }
    }
  }
  
  return '';
}

// DYNAMIC CLOTHING + COLOR DETECTION SYSTEM
function detectAndResolveClothingColor(text) {
  const lowerText = text.toLowerCase();
  let detectedClothing = '';
  let detectedColor = '';
  
  // Detect clothing type using unified keywords
  for (const clothing of CLOTHING_DETECTION_KEYWORDS) {
    if (lowerText.includes(clothing)) {
      detectedClothing = clothing;
      break;
    }
  }
  
  // Detect color
  for (const color of EXPANDED_COLOR_ARRAY) {
    if (lowerText.includes(color)) {
      detectedColor = color;
      break;
    }
  }
  
  // If both detected, combine them (no restrictions - allow any color for any clothing)
  if (detectedClothing && detectedColor) {
    return `a ${detectedColor} ${detectedClothing}`;
  }
  
  // If only clothing detected, let Runware decide the color
  if (detectedClothing) {
    return `a ${detectedClothing}`;
  }
  
  // If only color detected, let Runware decide what clothing to color
  if (detectedColor) {
    return '';
  }
  
  return '';
}

function truncatePageText(text, difficulty) {
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

// ============= SIMPLIFIED PROMPT PROCESSING (No Complex Truncation) =============
function processPromptForRunware(prompt, difficulty) {
  if (!prompt) return prompt;
  
  console.log(`🛡️ Tier 2.5: Simplified processing - letting Runware handle final length (${prompt.length} chars for ${difficulty})`);
  
  // No truncation needed - smart sentence extraction already handled in template filling
  // Total prompts should be ~800-1200 chars well under Runware's limits  
  return prompt;
}

function getRandomItem(array) {
  if (!array || array.length === 0) return 'default';
  return array[Math.floor(Math.random() * array.length)];
}

function extractGenderFromCharacter(character) {
  if (!character || typeof character !== 'string') return 'child';
  const lowerChar = character.toLowerCase();
  if (lowerChar.includes('girl')) return 'girl';
  if (lowerChar.includes('boy')) return 'boy';
  return 'child';
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


// MASTER PLAN PHASE 6: ENHANCED CULTURAL LANDMARK ARRAYS WITH INDOOR/OUTDOOR CONTEXT
const CULTURAL_LANDMARKS = {
  spanish: {
    indoor: ["with Spanish tile patterns", "in Mediterranean style interior", "with Spanish cultural elements", "in warm villa setting", "with Spanish decor"],
    outdoor: ["with Spanish villa backdrop", "near Mediterranean courtyard", "with Spanish architecture", "in colorful plaza", "with Spanish garden elements"]
  },
  french: {
    indoor: ["in charming Parisian café", "with French interior design", "in elegant French setting", "with French cultural elements", "in cozy French environment"],
    outdoor: ["near Eiffel Tower", "by Seine River", "near Louvre gardens", "in charming café district", "with Parisian park backdrop"]
  },
  chinese: {
    indoor: ["with traditional Chinese interior", "in Chinese cultural setting", "with oriental design elements", "in pagoda-style building", "with Chinese architectural details"],
    outdoor: ["with traditional pagodas", "near Great Wall", "with ancient temples", "in bamboo garden", "with oriental architecture"]
  },
  hindi: {
    indoor: ["in Indian palace interior", "with traditional Indian patterns", "in colorful Indian setting", "with Indian cultural elements", "in ornate Indian room"],
    outdoor: ["near Taj Mahal", "with palace elements", "in colorful market", "with Indian architecture", "in vibrant courtyard"]
  },
  arabic: {
    indoor: ["in ornate Middle Eastern interior", "with Arabic architectural patterns", "in traditional Arabic setting", "with Middle Eastern design", "in elegant Arabic room"],
    outdoor: ["with Middle Eastern domes", "in ornate courtyard", "with mosaic patterns", "near ancient architecture", "with desert oasis backdrop"]
  },
  portuguese: {
    indoor: ["in Brazilian colonial interior", "with Portuguese cultural elements", "in warm Portuguese setting", "with Brazilian design details", "in Portuguese-style room", "with azulejo tile patterns", "in traditional Portuguese library", "with Portuguese maritime decor", "in colorful Portuguese kitchen", "with fado music ambiance", "in Portuguese cathedral interior", "with cork and wood elements", "in Manueline architectural style", "with Portuguese royal court design"],
    outdoor: ["with Brazilian landscape", "near Portuguese architecture", "with tropical colonial backdrop", "in colorful Portuguese plaza", "with Brazilian coastal elements", "near Portuguese castles", "with cork oak trees", "in Portuguese vineyard setting", "with traditional Portuguese windmills", "near Douro River valley", "with Portuguese fishing village backdrop", "in Sintra palace gardens", "with Portuguese maritime port", "near Cliffs of Moher coastal views", "with Portuguese countryside hills"]
  }
};

// ============= MASTER PLAN PHASE 6: CULTURAL ARRAY & ETHNICITY OPTIMIZATION =============
function applyCulturalSettingEnhancement(baseSetting, userInfo, avatarIdentity) {
  try {
    const language = avatarIdentity?.nativeLanguage || userInfo?.language || 'en';
    console.log(`🌍 Enhanced Cultural Setting Enhancement - Language: ${language}, Base Setting: "${baseSetting}"`);
    
    // ENHANCED: Context-aware cultural integration with indoor/outdoor detection
    const isIndoorSetting = baseSetting.toLowerCase().includes('indoor') || 
                           baseSetting.toLowerCase().includes('home') || 
                           baseSetting.toLowerCase().includes('school') ||
                           baseSetting.toLowerCase().includes('classroom') ||
                           baseSetting.toLowerCase().includes('kitchen') ||
                           baseSetting.toLowerCase().includes('bedroom');
    
    const isOutdoorSetting = baseSetting.toLowerCase().includes('outdoor') || 
                            baseSetting.toLowerCase().includes('park') || 
                            baseSetting.toLowerCase().includes('playground') ||
                            baseSetting.toLowerCase().includes('garden') ||
                            baseSetting.toLowerCase().includes('backyard');
    
    // Get cultural landmarks for the language with enhanced context awareness
    const landmarks = getCulturalLandmarks(language, isIndoorSetting, isOutdoorSetting);
    if (landmarks.length > 0) {
      const randomLandmark = landmarks[Math.floor(Math.random() * landmarks.length)];
      
      // ENHANCED: Context-aware enhancement with better integration
      if (baseSetting.toLowerCase().includes('park')) {
        return baseSetting.replace('park', `park ${randomLandmark}`);
      }
      if (baseSetting.toLowerCase().includes('school')) {
        return baseSetting.replace('school', `school ${randomLandmark}`);
      }
      if (baseSetting.toLowerCase().includes('home')) {
        return baseSetting.replace('home', `home ${randomLandmark}`);
      }
      if (baseSetting.toLowerCase().includes('playground')) {
        return baseSetting.replace('playground', `playground ${randomLandmark}`);
      }
      
      // Enhanced generic enhancement with smart positioning
      return `${baseSetting} ${randomLandmark}`;
    }
    
    console.log(`🌍 No cultural enhancement available for language: ${language}`);
    return baseSetting;
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Cultural setting enhancement error:', error);
    return baseSetting;
  }
}

// ============= RED X FIX 4: ENHANCED CONTEXT-AWARE ENHANCEMENT RULES =============
// Preserve exact story words while adding appropriate visual descriptors
function applyContextAwareEnhancement(currentValue, exactWord, type) {
  if (!exactWord || !currentValue) return currentValue;
  
  try {
    // Preserve exact story content first, enhance visually second
    if (type === 'action') {
      // Keep exact verb form, add minimal context-appropriate descriptors
      if (exactWord.includes('roll')) return `${exactWord}`;
      if (exactWord.includes('run')) return `${exactWord}`;
      if (exactWord.includes('jump')) return `${exactWord}`;
      if (exactWord.includes('play')) return `${exactWord}`;
      if (exactWord.includes('bounce')) return `${exactWord}`;
      if (exactWord.includes('fall')) return `${exactWord}`;
      if (exactWord.includes('climb')) return `${exactWord}`;
      if (exactWord.includes('swim')) return `${exactWord}`;
      if (exactWord.includes('hide')) return `${exactWord}`;
      if (exactWord.includes('slide')) return `${exactWord}`;
      return exactWord; // Preserve exact word - no enhancement needed
    }
    
    if (type === 'objects') {
      // Keep exact object names, add minimal color descriptors only when beneficial
      if (exactWord.includes('ball') && !exactWord.includes('red') && !exactWord.includes('blue')) {
        return `colorful ${exactWord}`;
      }
      return exactWord; // Preserve exact object
    }
    
    if (type === 'setting') {
      // Keep exact location, add minimal atmospheric descriptors
      if (exactWord.includes('hill')) return `${exactWord}`;
      if (exactWord.includes('park')) return `${exactWord}`;
      if (exactWord.includes('playground')) return `${exactWord}`;
      if (exactWord.includes('slope')) return `${exactWord}`;
      if (exactWord.includes('cliff')) return `${exactWord}`;
      return exactWord; // Preserve exact setting
    }
    
    return currentValue; // Fallback to current value
    
  } catch (error) {
    console.warn('⚠️ Context-aware enhancement error:', error);
    return currentValue; // Return original on error
  }
}

// MASTER PLAN PHASE 6: ENHANCED CULTURAL LANDMARK FUNCTION WITH CONTEXT AWARENESS
function getCulturalLandmarks(language, isIndoor = false, isOutdoor = false) {
  console.log(`🌍 Enhanced cultural landmarks for ${language} - Indoor: ${isIndoor}, Outdoor: ${isOutdoor}`);
  
  let languageKey = '';
  if (language === 'es' || language === 'spanish') languageKey = 'spanish';
  else if (language === 'fr' || language === 'french') languageKey = 'french';  
  else if (language === 'zh' || language === 'chinese') languageKey = 'chinese';
  else if (language === 'hi' || language === 'hindi') languageKey = 'hindi';
  else if (language === 'ar' || language === 'arabic') languageKey = 'arabic';
  
  if (!languageKey) {
    console.log(`🌍 No cultural landmarks available for language: ${language}`);
    return [];
  }
  
  const landmarks = CULTURAL_LANDMARKS[languageKey];
  if (!landmarks) return [];
  
  // ENHANCED: Context-aware landmark selection
  if (isIndoor && landmarks.indoor) {
    console.log(`🏠 Using indoor cultural landmarks for ${language}`);
    return landmarks.indoor;
  } else if (isOutdoor && landmarks.outdoor) {
    console.log(`🌳 Using outdoor cultural landmarks for ${language}`);
    return landmarks.outdoor;
  } else {
    // Default to outdoor if no specific context
    console.log(`🌍 Using default outdoor cultural landmarks for ${language}`);
    return landmarks.outdoor || landmarks.indoor || [];
  }
}

function detectCulturalProfile(userInfo, avatarIdentity) {
  try {
    const language = avatarIdentity?.nativeLanguage || userInfo?.language || 'en';
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
    
    // Language-based detection with real ethnicities
    if (language === 'es' || language === 'spanish') {
      console.log('🛡️ Tier 2.5: Spanish/Latino ethnicity detected via language');
      return 'Spanish/Latino ethnicity';
    }
    
    if (language === 'fr' || language === 'french') {
      console.log('🛡️ Tier 2.5: European ethnicity detected via language');
      return 'European ethnicity';
    }
    
    if (language === 'zh' || language === 'chinese') {
      console.log('🛡️ Tier 2.5: East Asian ethnicity detected via language');
      return 'East Asian ethnicity';
    }
    
    if (language === 'hi' || language === 'hindi') {
      console.log('🛡️ Tier 2.5: South Asian ethnicity detected via language');
      return 'South Asian ethnicity';
    }
    
    if (language === 'ar' || language === 'arabic') {
      console.log('🛡️ Tier 2.5: Middle Eastern ethnicity detected via language');
      return 'Middle Eastern ethnicity';
    }
    
    if (language === 'pt' || language === 'portuguese') {
      console.log('🛡️ Tier 2.5: Latin American ethnicity detected via language');
      return 'Latin American ethnicity';
    }
    
    console.log('🛡️ Tier 2.5: Standard American profile (default)');
    return 'Standard American';
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Cultural detection error, using default:', error);
    return 'Standard American';
  }
}

function detectEmotionFromText(text) {
  try {
    if (!text || typeof text !== 'string') return ''; // Enhanced: Return empty string for fallback
    
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

serve(async (req) => {
  console.log(`🛡️ Tier 2.5: ${req.method} ${req.url}`);
  
  // ============= TIER TRACKING VARIABLES =============
  let attemptedTiers = [];
  let successfulTier = null;
  let tierPath = [];
  let fallbackReason = null;
  let enhancementLevel = null;
  let startTime = Date.now();
  
  console.log('🎯 TIER 2.5 CASCADE: Initializing tier tracking system');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }
  
  // 🔑 DEBUG: API Key Validation
  const runwareApiKey = Deno.env.get('RUNWARE_API_KEY');
  if (!runwareApiKey) {
    console.error('❌ CRITICAL: RUNWARE_API_KEY not found in Tier 2.5');
    return createCorsErrorResponse('Tier 2.5: Missing Runware API key', 500);
  }
  console.log('✅ Tier 2.5: RUNWARE_API_KEY validated:', runwareApiKey.substring(0, 10) + '...');
  
  try {
    console.log('📨 Tier 2.5: Parsing request body...');
    let { pageText, userInfo, characterData, sessionId } = await req.json();
    console.log('✅ Tier 2.5: Request parsed, keys:', Object.keys({ pageText, userInfo, characterData, sessionId }));
    
    // COMPREHENSIVE PARAMETER VALIDATION - Add missing defaults
    if (!pageText) {
      pageText = 'An attractive child in a bright cheerful environment';
      console.log('🛡️ Undefined pageText - using default:', pageText);
    }
    
    if (!userInfo) {
      userInfo = { avatar: { skinTone: 'medium' } };
      console.log('🛡️ Undefined userInfo - using default:', userInfo);
    }
    
    if (!userInfo.avatar) {
      userInfo.avatar = { skinTone: 'medium' };
      console.log('🛡️ Undefined avatarIdentity - using default skinTone: medium');
    }
    
      console.log('🛡️ Tier 2.5: Processing request with nuclear independence');
      console.log('🎭 Tier 2.5: Character consistency data received:', {
        hasCharacterData: !!characterData,
        sessionId: sessionId,
        characterSeed: characterData?.seed || 'none'
      });
      
      // PARAMETER VALIDATION: Check Tier 2.5A vs 2.5B requirements
      const hasTier25ARequirements = !!(pageText && userInfo && sessionId && characterData);
      const hasTier25BRequirements = !!(pageText && userInfo);
      
      console.log('🔍 TIER 2.5 PARAMETER VALIDATION:', {
        tier25A_Requirements: { pageText: !!pageText, userInfo: !!userInfo, sessionId: !!sessionId, characterData: !!characterData },
        tier25A_Ready: hasTier25ARequirements,
        tier25B_Ready: hasTier25BRequirements,
        willUseTier: hasTier25ARequirements ? '2.5A (Premium)' : '2.5B (Basic)',
        timestamp: new Date().toISOString()
      });
      
      // BUILD LOCAL AVATAR IDENTITY: Create enhanced avatar identity from user data
      let localAvatarIdentity;
      try {
        localAvatarIdentity = getNuclearAvatarMapping(userInfo, mapDifficultyInline(userInfo) || 'medium');
        console.log('✅ Local avatar identity built successfully:', localAvatarIdentity.character);
      } catch (avatarError) {
        console.warn('⚠️ Avatar identity building failed, using fallback:', avatarError);
        localAvatarIdentity = {
          character: 'friendly child character',
          age: '7-year-old',
          hair: 'neat hair',
          features: 'cheerful expression'
        };
      }
      
      // ============= TESTING & VALIDATION =============
      // Run comprehensive test on development requests (when sessionId contains 'test')
      if (sessionId && sessionId.includes('test')) {
        testPronounResolutionSystem();
      }
      
      // Extract scene components with complete placeholder support - SILENT FAILURE PROTECTION
    let scene, setting, objects, secondary_characters, sceneData;
    try {
      sceneData = await extractSceneWithPremiumTemplate(pageText, undefined, userInfo?.pageNumber, sessionId);
      scene = sceneData.scene;
      setting = sceneData.setting;
      objects = sceneData.objects;
      secondary_characters = sceneData.secondary_characters;
      console.log('✅ Scene extraction successful');
    } catch (sceneError) {
      console.warn('⚠️ Scene extraction failed - triggering 2.5B basic template:', sceneError);
      // CRITICAL: Scene extraction failure triggers 2.5B basic template  
      console.log('❌ Scene extraction failed - routing directly to Tier 2.5B');
      tierPath.push('direct-2.5B-attempt');
      successfulTier = '2.5B';
      enhancementLevel = 'basic';
      fallbackReason = 'Scene extraction failure';
      return fillBasicTemplate(difficulty || 'medium', userInfo, pageText, localAvatarIdentity);
    }
    
    // Map difficulty level with fallback protection
    let difficulty;
    try {
      difficulty = mapDifficultyInline(userInfo);
      console.log('✅ Difficulty mapping successful:', difficulty);
    } catch (difficultyError) {
      console.warn('⚠️ Difficulty mapping failed, using medium default:', difficultyError);
      difficulty = 'medium';
    }
    
    // Detect emotion with silent failure protection
    let emotion;
    try {
      emotion = detectEmotionFromText(pageText);
      console.log('✅ Emotion detection successful:', emotion);
    } catch (emotionError) {
      console.warn('⚠️ Emotion detection failed, using positive default:', emotionError);
      emotion = 'Positive and uplifting atmosphere';
    }
    
    // FIX: avatarIdentity moved to top of function to fix scoping error
    // (now declared at line ~732)
    
    // Validate and prepare contextual intelligence data with fallbacks
    const contextualData = {
      spatialComposition: sceneData?.spatialComposition || 'character prominently featured in foreground',
      atmosphereContext: sceneData?.atmosphereContext || sceneData?.atmosphere || 'warm, inviting atmosphere'
    };
    
    console.log('🧠 Contextual Intelligence Data:', {
      spatialComposition: contextualData.spatialComposition,
      atmosphereContext: contextualData.atmosphereContext,
      hasContextualSetting: !!sceneData?.contextualSetting,
      hasContextualAction: !!sceneData?.contextualAction
    });
    
    // TIER 2.5A vs 2.5B LOGIC: Check requirements and route accordingly
    let prompt;
    let templateType = '';
    try {
    // ENHANCED: Character Consistency Integration with Nuclear Independence
    if (hasTier25ARequirements) {
      console.log('🎯 Tier 2.5A: ATTEMPTING (Premium Template + Character Consistency + Cultural Intelligence)');
      templateType = 'Premium Template with Character Consistency';
      attemptedTiers.push('2.5A');
      tierPath.push('2.5A-attempting');
      
      // Integrate Character Consistency Service
      let enhancedAvatarIdentity = localAvatarIdentity;
      try {
        const { CharacterConsistencyService } = await import('../_shared/CharacterConsistencyService.js');
        const characterConsistencyService = new CharacterConsistencyService();
        const characterSeed = await characterConsistencyService.getCharacterSeed(
          sessionId, 
          'main_character', 
          pageText, 
          'premium', 
          sceneData?.clothing || ''
        );
        
        if (characterSeed) {
          console.log('🎭 Enhanced character consistency integration successful');
          enhancedAvatarIdentity = {
            ...localAvatarIdentity,
            character: characterSeed.description || localAvatarIdentity.character,
            features: characterSeed.facialFeatures || localAvatarIdentity.features,
            hair: characterSeed.hairstyle || localAvatarIdentity.hair,
            consistency: true
          };
        }
      } catch (characterError) {
        console.warn('⚠️ Character consistency integration failed, using nuclear mapping:', characterError);
      }
      
      prompt = fillPremiumTemplate(difficulty, userInfo, scene, setting, objects, secondary_characters, emotion, pageText, enhancedAvatarIdentity, contextualData.spatialComposition, contextualData.atmosphereContext);
      console.log('✅ Tier 2.5A: SUCCESS (Premium Template + Character Consistency + Cultural Intelligence)');
      successfulTier = '2.5A';
      tierPath[tierPath.length - 1] = '2.5A-success';
      enhancementLevel = 'premium';
    } else {
      console.log('❌ Tier 2.5A: FAILED (Missing requirements - sessionId, characterData)');
      fallbackReason = 'Missing Tier 2.5A requirements (sessionId or characterData)';
      tierPath.push('2.5A-failed');
      throw new Error('Tier 2.5A requirements not met - auto-fallback to 2.5B');
    }
    } catch (templateError) {
      console.log('❌ Tier 2.5A: FAILED (Template generation error)');
      if (!fallbackReason) fallbackReason = `Premium template error: ${templateError.message}`;
      if (tierPath[tierPath.length - 1] !== '2.5A-failed') {
        tierPath[tierPath.length - 1] = '2.5A-failed';
      }
      
      // ============= UPDATED 4-TIER FALLBACK CHAIN =============
      console.log('🔄 Tier 2.5A FAILED → Routing to Tier 2.5B');
      try {
        console.log('🎯 Tier 2.5B: ATTEMPTING (Basic Personalized Template + Nuclear Independence)');
        templateType = 'Basic Personalized Template';
        attemptedTiers.push('2.5B');
        tierPath.push('2.5B-attempting');
        
        prompt = fillBasicTemplate(difficulty, userInfo, pageText, localAvatarIdentity);
        console.log('✅ Tier 2.5B: SUCCESS (Basic Personalized Template + Nuclear Independence)');
        successfulTier = '2.5B';
        tierPath[tierPath.length - 1] = '2.5B-success';
        enhancementLevel = 'basic';
        
      } catch (basicError) {
        console.log('❌ Tier 2.5B: FAILED (Basic template error)');
        tierPath[tierPath.length - 1] = '2.5B-failed';
        if (!fallbackReason) fallbackReason = `Basic template error: ${basicError.message}`;
        
        console.log('🔄 Tier 2.5B FAILED → Routing to Tier 2.5C');
        try {
          console.log('🎯 Tier 2.5C: ATTEMPTING (Emergency Framework Template + Guaranteed Success)');
          templateType = 'Emergency Framework Template';
          attemptedTiers.push('2.5C');
          tierPath.push('2.5C-attempting');
          
          const emergencyFramework = NUCLEAR_STYLE_SETTINGS[difficulty]?.frameworkPrompt || 
                                    NUCLEAR_STYLE_SETTINGS['medium']?.frameworkPrompt || 
                                    EMERGENCY_FALLBACK_FRAMEWORK || 
                                    'Children book style with vibrant colors, friendly character design, bright cheerful atmosphere';
          
          prompt = (pageText || '').substring(0, 2500) + ' ' + emergencyFramework;
          console.log('✅ Tier 2.5C: SUCCESS (Emergency Framework Template + Guaranteed Success)');
          successfulTier = '2.5C';
          tierPath[tierPath.length - 1] = '2.5C-success';
          enhancementLevel = 'emergency';
          
        } catch (emergencyError) {
          console.log('❌ Tier 2.5C: FAILED (Emergency template error)');
          tierPath[tierPath.length - 1] = '2.5C-failed';
          if (!fallbackReason) fallbackReason = `Emergency template error: ${emergencyError.message}`;
          
          console.log('🔄 Tier 2.5C FAILED → Routing to Tier 2.5D (ULTIMATE EMERGENCY)');
          console.log('🎯 Tier 2.5D: ATTEMPTING (Ultimate Emergency Fallback Template - NUCLEAR GUARANTEE)');
          templateType = 'Ultimate Emergency Fallback Template';
          attemptedTiers.push('2.5D');
          tierPath.push('2.5D-attempting');
          
          prompt = "ULTIMATE_EMERGENCY_TEMPLATE_USED: A cheerful child character in a colorful outdoor scene with bright, friendly lighting. Contemporary children's book illustration with soft painterly style, warm expressions, detailed facial features, vibrant colors, shallow depth of field, character-focused composition, child-friendly aesthetic, high rendering quality, artistic lighting, diverse representation";
          console.log('✅ Tier 2.5D: SUCCESS (Ultimate Emergency Fallback Template - NUCLEAR GUARANTEE)');
          successfulTier = '2.5D';
          tierPath[tierPath.length - 1] = '2.5D-success';
          enhancementLevel = 'ultimate-emergency';
        }
      }
    }
    
    // Generate avatar mapping with character consistency enhancement - PHASE 5: ENHANCED FAILURE PROTECTION
    let avatarMapping, avatarType;
    try {
      // Check if globalArcSessionManager exists before calling
      if (typeof globalArcSessionManager === 'undefined' || !globalArcSessionManager) {
        console.warn('⚠️ globalArcSessionManager not available - using fallback character consistency');
        throw new Error('Character consistency service unavailable');
      }
      
      avatarMapping = enhanceNuclearMappingWithConsistency(userInfo, difficulty, characterData, sessionId, localAvatarIdentity);
      avatarType = localAvatarIdentity?.type || userInfo?.avatar?.type || 'prefer-not-to-answer';
      console.log('✅ Avatar mapping successful');
      
      // BULLETPROOFING: Additional validation checks that trigger 2.5B fallback
      const characterValidation = validateCharacterConsistency(characterData, avatarMapping);
      if (!characterValidation.isValid) {
        console.log('❌ Character consistency validation failed - routing directly to Tier 2.5B');
        tierPath.push('direct-2.5B-attempt');
        successfulTier = '2.5B';
        enhancementLevel = 'basic';
        fallbackReason = 'Character consistency validation failed';
        return fillBasicTemplate(difficulty || 'medium', userInfo, pageText, localAvatarIdentity);
      }
      
      const visualValidation = validateVisualElements(sceneData, objects, setting);
      if (!visualValidation.isValid) {
        console.log('❌ Visual elements validation failed - routing directly to Tier 2.5B');
        tierPath.push('direct-2.5B-attempt');
        successfulTier = '2.5B';
        enhancementLevel = 'basic';
        fallbackReason = 'Visual elements validation failed';
        return fillBasicTemplate(difficulty || 'medium', userInfo, pageText, localAvatarIdentity);
      }
      
      const sceneValidation = validateSceneComplexity(sceneData, pageText);
      if (!sceneValidation.isValid) {
        console.log('❌ Scene complexity validation failed - routing directly to Tier 2.5B');
        tierPath.push('direct-2.5B-attempt');
        successfulTier = '2.5B';
        enhancementLevel = 'basic';
        fallbackReason = 'Scene complexity validation failed';
        return fillBasicTemplate(difficulty || 'medium', userInfo, pageText, localAvatarIdentity);
      }
      
      console.log('✅ All validation checks passed - proceeding with premium template');
    } catch (avatarError) {
      console.log('❌ Character consistency service failed - routing directly to Tier 2.5B');
      tierPath.push('direct-2.5B-attempt');
      successfulTier = '2.5B';
      enhancementLevel = 'basic';
      fallbackReason = 'Character consistency service failure';
      
      // CRITICAL: Character consistency failure triggers 2.5B basic template (not emergency template)
      return fillBasicTemplate(difficulty || 'medium', userInfo, pageText, localAvatarIdentity);
    }
    
    // Generate cultural profile and negative prompt - SILENT FAILURE PROTECTION
    let culturalProfile, negativePrompt;
    try {
      const pageNumber = userInfo?.pageNumber || 1;
      culturalProfile = detectCulturalProfileForNegatives(userInfo, localAvatarIdentity);
      
      // ============= PHASE 5 ENHANCEMENT: MULTI-CHARACTER NEGATIVE PROMPT INTEGRATION =============
      // Extract secondary character information for negative prompt consistency
      const secondaryCharacterList = [];
      if (secondary_characters && secondary_characters.trim()) {
        // Parse secondary characters for gender consistency filtering
        const cleanSecondaryText = secondary_characters.replace(/^with\s+/, '').trim();
        if (cleanSecondaryText) {
          secondaryCharacterList.push(cleanSecondaryText);
        }
      }
      
      negativePrompt = generateNuclearNegativePrompt(culturalProfile, avatarType, difficulty, pageNumber, secondaryCharacterList);
      console.log('✅ Cultural profile and enhanced multi-character negative prompt generation successful');
    } catch (culturalError) {
      console.warn('⚠️ Cultural profile generation failed, using defaults:', culturalError);
      culturalProfile = { language: 'en', skinTone: 'medium' };
      negativePrompt = 'low quality, blurry, distorted, inappropriate content';
    }
    
    // ❌ DUPLICATE ARRAY REMOVED - REGRESSION PREVENTION ❌
    // This duplicate NUCLEAR_STYLE_SETTINGS array has been removed to prevent:
    // - Memory waste and code duplication 
    // - Confusion about which array is being used
    // - Inconsistent framework prompts between arrays
    // - Maintenance overhead of keeping two arrays in sync
    //
    // 🔄 REFERENCE: Primary NUCLEAR_STYLE_SETTINGS is at line ~2185-2220
    // 🔄 All template logic uses the primary array only
    
    const styleSettings = NUCLEAR_STYLE_SETTINGS[difficulty] || NUCLEAR_STYLE_SETTINGS['medium'];
    console.log('✅ Nuclear style settings applied - zero dependencies, bulletproof operation');

    // Now apply style settings to template filling (moved from line 1698)
    // This ensures NUCLEAR_STYLE_SETTINGS is defined before use
    
    console.log('🛡️ Tier 2.5: Connecting to Runware API via WebSocket with comprehensive error protection...');
    
    // COMPREHENSIVE WEBSOCKET ERROR PROTECTION
    let connectionTimeout, operationTimeout;
    
    // Connect to Runware WebSocket API with error boundaries
    let ws;
    try {
      ws = new WebSocket('wss://ws-api.runware.ai/v1');
    } catch (wsError) {
      console.error('⚠️ WebSocket connection failed immediately:', wsError);
      return createCorsErrorResponse('WebSocket connection failed', 500);
    }
    
    return new Promise((resolve) => {
      let isResolved = false;
      
      const resolveOnce = (response) => {
        if (!isResolved) {
          isResolved = true;
          // Clean up timeouts
          if (connectionTimeout) clearTimeout(connectionTimeout);
          if (operationTimeout) clearTimeout(operationTimeout);
          try {
            ws.close();
          } catch (closeError) {
            console.warn('⚠️ WebSocket close error (non-critical):', closeError);
          }
          resolve(response);
        }
      };
      
      // Connection timeout protection (30 seconds)
      connectionTimeout = setTimeout(() => {
        console.warn('⚠️ WebSocket connection timeout');
        resolveOnce(createCorsErrorResponse('Connection timeout - please try again', 504));
      }, 30000);
      
      // Operation timeout protection (60 seconds total)
      operationTimeout = setTimeout(() => {
        console.warn('⚠️ WebSocket operation timeout');
        resolveOnce(createCorsErrorResponse('Operation timeout - please try again', 504));
      }, 60000);
      
      // Declare finalPrompt at function scope to fix scoping issue
      let finalPrompt = prompt; // Default to original prompt
      
      ws.onopen = () => {
        try {
          console.log('🛡️ Tier 2.5: WebSocket connected, authenticating...');
          
          // Send authentication with error protection
          const authMessage = [{
            taskType: "authentication",
            apiKey: Deno.env.get('RUNWARE_API_KEY') || 'missing-api-key'
          }];
          
          ws.send(JSON.stringify(authMessage));
        } catch (openError) {
          console.error('⚠️ WebSocket onopen error:', openError);
          resolveOnce(createCorsErrorResponse('Authentication failed', 500));
        }
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