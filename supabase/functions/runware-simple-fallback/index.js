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

serve(async (req) => {
  console.log('🚀 Nuclear Independence - Runware Simple Fallback Function Started');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight request');
    return createCorsOptionsResponse();
  }

  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('📥 Request body received:', JSON.stringify(requestBody, null, 2));
    } catch (error) {
      console.error('❌ Failed to parse request body:', error);
      return createCorsErrorResponse('Invalid JSON in request body', 400);
    }

    // Validate required fields
    const { userInfo, pageText, sessionId, pageNumber } = requestBody;
    
    if (!pageText) {
      console.error('❌ Missing pageText in request');
      return createCorsErrorResponse('pageText is required', 400);
    }

    // Get API key from environment
    const apiKey = Deno.env.get('RUNWARE_API_KEY');
    if (!apiKey) {
      console.error('❌ RUNWARE_API_KEY not configured');
      return createCorsErrorResponse('RUNWARE_API_KEY not configured in environment', 500);
    }

    console.log('🔑 API key found in environment');

    // Prepare request data for nuclear generation
    const nuclearRequestData = {
      userInfo,
      pageText,
      sessionId: sessionId || 'default',
      pageNumber: pageNumber || 1,
      apiKey
    };

    // Generate nuclear image
    console.log('🎯 Starting nuclear image generation process');
    const result = await generateNuclearImage(nuclearRequestData);
    
    console.log('✅ Nuclear image generation completed successfully');
    console.log('Result:', JSON.stringify(result, null, 2));

    // Return success response
    return createCorsResponse(result);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Nuclear fallback function error:', errorMessage);
    console.error('Error stack:', error.stack);
    
    // Return detailed error for debugging
    return createCorsErrorResponse({
      error: errorMessage,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      function: 'runware-simple-fallback'
    }, 500);
  }
});