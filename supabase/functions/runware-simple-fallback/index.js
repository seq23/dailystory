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
}

// ============= CHUNK 1 CONVERSION (Lines 1318-2318) =============

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
    console.log(`🧠 Spatial Composition Generation - Action: "${action}", Objects: "${objects}"`);
    
    if (!objects || !action) return '';
    
    const objectsLower = objects.toLowerCase();
    const actionLower = action.toLowerCase();
    const seed = pageText + objects + action;
    
    // Spatial composition templates based on interaction type and object size
    const spatialTemplates = {
      observation: [
        'main character in foreground, {object} prominently featured in mid-frame',
        '{object} in center focus, character positioned to the side observing',
        'character and {object} sharing the frame with balanced composition',
        'close-up perspective with character and {object} in intimate framing'
      ],
      interaction: [
        'character in close proximity to {object}, showing direct interaction',
        'hands-on composition with character and {object} in detailed focus',
        'character positioned for natural interaction with {object}',
        'intimate scene composition highlighting character-{object} connection'
      ],
      discovery: [
        'character in moment of discovery, {object} as the focal point',
        'composition showing character\'s surprised expression with {object} revealed',
        'dynamic framing capturing the discovery of {object}',
        'character\'s gaze leading viewer\'s eye to {object}'
      ]
    };
    
    // Determine interaction type from action
    let interactionType = 'observation'; // default
    if (actionLower.includes('touch') || actionLower.includes('hold') || actionLower.includes('pick')) {
      interactionType = 'interaction';
    } else if (actionLower.includes('discover') || actionLower.includes('find') || actionLower.includes('see')) {
      interactionType = 'discovery';
    }
    
    // Extract main object for template filling
    const mainObject = objects.split(' ').find(obj => obj.length > 2) || 'object';
    const templates = spatialTemplates[interactionType];
    const selectedTemplate = getSeededRandomItem(templates, seed + interactionType);
    const filledComposition = selectedTemplate.replace('{object}', mainObject);
    
    console.log(`🎯 Spatial composition: ${interactionType} → "${filledComposition}"`);
    return filledComposition;
    
  } catch (error) {
    console.warn('⚠️ Spatial composition generation error:', error);
    return '';
  }
}

// 4. INFER ATMOSPHERE FROM CONTEXT - Time/weather inference from story context
function inferAtmosphereFromContext(pageText, setting, action) {
  try {
    console.log(`🧠 Atmosphere Context Mapping - Setting: "${setting}", Action: "${action}"`);
    
    const pageTextLower = pageText.toLowerCase();
    const settingLower = setting.toLowerCase();
    const seed = pageText + setting + action;
    
    // Context clues for time of day
    const timeContextMap = {
      morning: ['wake', 'breakfast', 'sunrise', 'early', 'dawn', 'morning'],
      afternoon: ['lunch', 'school', 'play', 'sunny', 'bright', 'noon'],
      evening: ['dinner', 'sunset', 'dusk', 'twilight', 'evening'],
      night: ['sleep', 'bed', 'stars', 'moon', 'dark', 'night']
    };
    
    // Context clues for weather/mood
    const weatherContextMap = {
      sunny: ['bright', 'happy', 'warm', 'cheerful', 'golden', 'sunny'],
      cloudy: ['grey', 'overcast', 'soft', 'gentle', 'cloudy'],
      rainy: ['rain', 'wet', 'puddle', 'umbrella', 'storm'],
      magical: ['sparkle', 'glow', 'magic', 'enchant', 'mystical', 'wonder']
    };
    
    // Detect time context
    let timeOfDay = '';
    for (const [time, keywords] of Object.entries(timeContextMap)) {
      if (keywords.some(keyword => pageTextLower.includes(keyword))) {
        timeOfDay = time;
        break;
      }
    }
    
    // Detect weather/mood context
    let weatherMood = '';
    for (const [weather, keywords] of Object.entries(weatherContextMap)) {
      if (keywords.some(keyword => pageTextLower.includes(keyword))) {
        weatherMood = weather;
        break;
      }
    }
    
    // Combine context clues with universal lighting arrays
    const atmosphereOptions = [];
    
    if (timeOfDay) {
      const lightingOptions = timeOfDay === 'morning' ? 
        ['soft dawn light', 'golden morning glow', 'gentle sunrise lighting'] :
        timeOfDay === 'evening' ? 
        ['warm sunset light', 'golden hour glow', 'soft twilight atmosphere'] :
        ['bright natural lighting', 'soft ambient light'];
      
      atmosphereOptions.push(...lightingOptions);
    }
    
    if (weatherMood) {
      const weatherOptions = weatherMood === 'sunny' ? 
        ['bright cheerful atmosphere', 'warm golden lighting'] :
        weatherMood === 'magical' ? 
        ['mystical glowing atmosphere', 'enchanted sparkling light'] :
        ['soft atmospheric lighting'];
      
      atmosphereOptions.push(...weatherOptions);
    }
    
    if (atmosphereOptions.length === 0) {
      // Use universal lighting as fallback
      atmosphereOptions.push(...getSeededRandomItem([UNIVERSAL_LIGHTING_ARRAYS], seed).split(','));
    }
    
    const selectedAtmosphere = getSeededRandomItem(atmosphereOptions, seed);
    console.log(`🎯 Context-inferred atmosphere: Time "${timeOfDay}", Weather "${weatherMood}" → "${selectedAtmosphere}"`);
    return selectedAtmosphere;
    
  } catch (error) {
    console.warn('⚠️ Atmosphere context inference error:', error);
    return getSeededRandomItem(UNIVERSAL_LIGHTING_ARRAYS, pageText + setting);
  }
}

// ============= UNIVERSAL ACTION EXPANSION SYSTEM =============
function expandActionToPhrase(action, detectedObjects, pageText) {
  const actionWord = action.toLowerCase().trim();
  const objectContext = (detectedObjects || '').toLowerCase();
  const seed = pageText + action + objectContext;
  
  // ============= OBJECT-DRIVEN UNIVERSAL ACTION TEMPLATES =============
  if (objectContext) {
    // Extract the main object for template filling
    const objects = objectContext.split(' ');
    const mainObject = objects.find(obj => obj.length > 2) || 'thing';
    
    // Use universal action templates with object replacement
    const selectedTemplate = getSeededRandomItem(UNIVERSAL_ACTION_TEMPLATES, seed);
    const filledTemplate = selectedTemplate.replace('{object}', mainObject);
    
    console.log(`🎯 Universal action template: "${action}" + "${mainObject}" → "${filledTemplate}"`);
    return filledTemplate;
  }
  
  // ============= FALLBACK: LEGACY EXPANSION MAP =============
  const expansionMap = {
    'see': 'looks around and sees with curiosity',
    'look': 'looks around with bright curious eyes', 
    'watch': 'watches carefully with focused attention',
    'sit': 'sits comfortably in a relaxed position',
    'stand': 'stands tall with confident posture',
    'walk': 'walks forward with steady confident steps',
    'run': 'runs energetically with joyful enthusiasm',
    'play': 'plays happily with creative imaginative energy',
    'read': 'reads attentively with focused concentration',
    'eat': 'eats carefully with mindful attention',
    'sleep': 'sleeps peacefully in comfortable restful position',
    'jump': 'jumps up high with athletic energy',
    'dance': 'dances gracefully with rhythmic flowing movements',
    'sing': 'sings melodiously with clear beautiful voice',
    'laugh': 'laughs joyfully with genuine happy expression',
    'smile': 'smiles warmly with genuine cheerful expression',
    'cry': 'expresses emotions with natural heartfelt tears',
    'think': 'thinks deeply with thoughtful contemplative expression',
    'learn': 'learns eagerly with curious engaged attention',
    'explore': 'explores surroundings with adventurous curious spirit',
    'discover': 'discovers something new with excited wonder',
    'find': 'finds something interesting with delighted surprise',
    'create': 'creates something wonderful with artistic creativity',
    'build': 'builds carefully with focused determined effort',
    'draw': 'draws creatively with artistic skilled hands',
    'write': 'writes thoughtfully with careful precise movements',
    'listen': 'listens attentively with focused concentrated attention'
  };
  
  const expanded = expansionMap[actionWord];
  if (expanded) {
    console.log(`🔄 Legacy action expanded: "${action}" → "${expanded}"`);
    return expanded;
  }
  
  // If no match, create a generic 5+ word phrase
  const genericExpansion = `engages in ${action} with focused attention`;
  console.log(`🔄 Generic action expansion: "${action}" → "${genericExpansion}"`);
  return genericExpansion;
}

// ============= FANTASY-FRIENDLY VISUAL PRIORITY SCORING =============
function calculateVisualPriority(elements) {
  let score = 0;
  
  const visualPriorityWeights = {
    actions: { 
      visual: 4,      // "running", "flying", "sparkling"
      sensory: 3,     // "seeing", "hearing", "feeling"  
      fantasy: 4,     // "floating", "magical", "transforming"
      abstract: 1     // "thinking", "understanding"
    },
    settings: { 
      specific: 4,    // "enchanted forest", "crystal cave"
      fantasy: 4,     // "magical castle", "floating island"
      generic: 2      // "place", "area"
    }
  };
  
  // Score action visual priority
  const action = elements.action.toLowerCase();
  if (TIER_25_UNIFIED_VOCABULARY.actions.fantasy.includes(action)) {
    score += visualPriorityWeights.actions.fantasy;
  } else if (TIER_25_UNIFIED_VOCABULARY.actions.sensory.includes(action)) {
    score += visualPriorityWeights.actions.sensory;
  } else if (TIER_25_UNIFIED_VOCABULARY.actions.basic.includes(action)) {
    score += visualPriorityWeights.actions.visual;
  } else {
    score += visualPriorityWeights.actions.abstract;
  }
  
  // Score setting specificity
  const setting = elements.setting.toLowerCase();
  if (TIER_25_UNIFIED_VOCABULARY.settings.fantasy.includes(setting)) {
    score += visualPriorityWeights.settings.fantasy;
  } else if (TIER_25_UNIFIED_VOCABULARY.settings.specific.includes(setting)) {
    score += visualPriorityWeights.settings.specific;
  } else {
    score += visualPriorityWeights.settings.generic;
  }
  
  return score;
}

// ============= FANTASY BONUS SCORING (Boost Imaginative Combinations) =============
function calculateFantasyBonus(elements) {
  let bonus = 0;
  
  const action = elements.action.toLowerCase();
  const setting = elements.setting.toLowerCase();
  
  // Magical action bonus
  if (TIER_25_UNIFIED_VOCABULARY.actions.fantasy.includes(action)) {
    bonus += 5; // "floating", "magical", "sparkling"
  }
  
  // Fantasy setting bonus
  if (TIER_25_UNIFIED_VOCABULARY.settings.fantasy.includes(setting)) {
    bonus += 5; // "enchanted forest", "magical castle"
  }
  
  // Sensory engagement bonus
  if (TIER_25_UNIFIED_VOCABULARY.actions.sensory.includes(action)) {
    bonus += 3; // "seeing", "hearing", "feeling"
  }
  
  // Fantasy coherence combinations
  if (action.includes('float') && (setting.includes('cloud') || setting.includes('sky'))) {
    bonus += 5; // "floating" + "clouds" = imaginative & visual
  }
  
  if (action.includes('magic') && setting.includes('castle')) {
    bonus += 5; // "magical" + "castle" = fantasy coherent
  }
  
  if (TIER_25_UNIFIED_VOCABULARY.actions.states.includes(action) && setting.includes('forest')) {
    bonus += 3; // "wake" + "forest" = story moment
  }
  
  return bonus;
}

// ============= FANTASY-FRIENDLY SEMANTIC COHERENCE (Visual Richness > Realism) =============
function calculateFantasyFriendlyCoherence(elements) {
  let score = 0;
  
  const action = elements.action.toLowerCase();
  const setting = elements.setting.toLowerCase();
  
  // ✅ Boost Visual & Concrete Elements
  if (action.includes('run') || action.includes('fly') || action.includes('sparkle')) {
    score += 2; // Visual impact actions
  }
  
  if (setting.includes('forest') || setting.includes('cave') || setting.includes('castle')) {
    score += 2; // Concrete, imageable settings
  }
  
  // ✅ Fantasy Story Combinations (Visual Richness > Physics)
  if ((action.includes('float') && setting.includes('cloud')) || 
      (action.includes('magic') && setting.includes('sparkle')) ||
      (action.includes('glow') && setting.includes('crystal'))) {
    score += 5; // Imaginative & visual combinations
  }
  
  // ❌ Only Penalize Truly Bland/Non-Visual Descriptions
  if (action.includes('think') && setting.includes('area')) {
    score -= 2; // Abstract + vague = not visual
  }
  
  if (action.includes('understand') && setting.includes('general')) {
    score -= 2; // Conceptual + generic = boring
  }
  
  return score;
}

// ============= MASTER PLAN: SMART PLURAL/STEM DETECTION SYSTEM =============
// Automatically handles verb conjugations without manual arrays

// ============= RED X FIX 3: MISSING PLURAL/SINGULAR DETECTION =============
function detectPlural(word) {
  const cleanWord = word.toLowerCase().trim();
  
  // Irregular plurals
  const irregularPlurals = ['children', 'feet', 'teeth', 'mice', 'geese', 'deer', 'sheep', 'fish'];
  if (irregularPlurals.includes(cleanWord)) return true;
  
  // Regular plurals (but exclude words that naturally end in 's')
  const naturalSWords = ['was', 'is', 'has', 'this', 'yes', 'bus', 'class', 'glass', 'grass'];
  if (naturalSWords.includes(cleanWord)) return false;
  
  return cleanWord.endsWith('s') || cleanWord.endsWith('es');
}

function preserveExactWordForm(detectedWord, originalText) {
  const lowerOriginal = originalText.toLowerCase();
  const pluralForm = detectedWord + 's';
  const esPlural = detectedWord + 'es';
  
  // Check for exact word preservation
  if (lowerOriginal.includes(pluralForm)) return pluralForm;
  if (lowerOriginal.includes(esPlural)) return esPlural;
  if (lowerOriginal.includes(detectedWord)) return detectedWord;
  
  return detectedWord; // Fallback to base form
}

// ============= RED X FIX 4: ENHANCED STEM DETECTION WITH IRREGULAR VERBS =============
function detectActionStem(word) {
  // Convert to lowercase and trim
  const cleanWord = word.toLowerCase().trim();
  
  // Irregular verb mappings for exact preservation - COMPREHENSIVE RED X FIX
  const irregularVerbs = {
    // Current ones (keep)
    'ran': 'run', 'threw': 'throw', 'caught': 'catch', 'swam': 'swim',
    'flew': 'fly', 'drove': 'drive', 'rode': 'ride', 'wrote': 'write',
    'sang': 'sing', 'rang': 'ring', 'drank': 'drink', 'sank': 'sink',
    
    // MISSING STORY VERBS (RED X FIX 1)
    'went': 'go', 'came': 'come', 'saw': 'see', 'ate': 'eat',
    'gave': 'give', 'took': 'take', 'said': 'say', 'made': 'make',
    'got': 'get', 'did': 'do', 'had': 'have', 'was': 'be', 'were': 'be',
    'fell': 'fall', 'slept': 'sleep', 'woke': 'wake', 'found': 'find'
  };
  
  if (irregularVerbs[cleanWord]) {
    return irregularVerbs[cleanWord];
  }
  
  // Handle doubled consonants first (running → run, rolling → roll, sitting → sit)
  const doubledConsonants = /(.+)([bcdfghjklmnpqrstvwxyz])\2(ing|ed)$/;
  const doubledMatch = cleanWord.match(doubledConsonants);
  if (doubledMatch) {
    return doubledMatch[1] + doubledMatch[2]; // Extract base with single consonant
  }
  
  // Handle common suffixes
  if (cleanWord.endsWith('ies')) return cleanWord.slice(0, -3) + 'y'; // flies → fly
  if (cleanWord.endsWith('ied')) return cleanWord.slice(0, -3) + 'y'; // tried → try
  if (cleanWord.endsWith('ing')) return cleanWord.slice(0, -3); // running → run (after doubled check)
  if (cleanWord.endsWith('ed')) return cleanWord.slice(0, -2); // played → play
  if (cleanWord.endsWith('es')) return cleanWord.slice(0, -2); // goes → go
  if (cleanWord.endsWith('s')) return cleanWord.slice(0, -1); // runs → run
  
  return cleanWord; // Return as-is if no suffix matches
}

function extractActionFromSentence(sentence, pageText) {
  const lowerSentence = sentence.toLowerCase();
  
  // ============= ENHANCED STORY FLOW CONTEXT AWARENESS =============
  // Consider both sentence and full pageText for better story flow understanding
  const contextText = (pageText || sentence).toLowerCase();
  
  // ============= EMERGENCY RECOVERY: EXACT WORD PRESERVATION SYSTEM =============
  // FIXED: Preserve exact words from story text, no enhancement additions
  const actionMappings = [
    // Level 0 Actions (Basic movements and activities) - EXACT WORD PRESERVATION
    { stem: 'run', description: 'running' },
    { stem: 'jump', description: 'jumping' },
    { stem: 'play', description: 'playing' },
    { stem: 'read', description: 'reading' },
    { stem: 'write', description: 'writing' },
    { stem: 'draw', description: 'drawing' },
    { stem: 'build', description: 'building' },
    { stem: 'walk', description: 'walking' },
    { stem: 'sit', description: 'sitting' },
    { stem: 'stand', description: 'standing' },
    { stem: 'dance', description: 'dancing' },
    { stem: 'sing', description: 'singing' },
    { stem: 'laugh', description: 'laughing' },
    { stem: 'smile', description: 'smiling' },
    { stem: 'eat', description: 'eating' },
    { stem: 'sleep', description: 'resting' },
    { stem: 'help', description: 'helping' },
    { stem: 'love', description: 'loving' },
    { stem: 'call', description: 'calling' },
    { stem: 'talk', description: 'talking' },
    { stem: 'get', description: 'getting' },
    { stem: 'put', description: 'putting' },
    { stem: 'go', description: 'going' },
    { stem: 'see', description: 'seeing' },
    { stem: 'make', description: 'making' },
    { stem: 'try', description: 'trying' },
    { stem: 'throw', description: 'throwing' },
    { stem: 'catch', description: 'catching' },
    { stem: 'swing', description: 'swinging' },
    
    // Level 1 Actions (Exploration and learning) - EXACT WORD PRESERVATION
    { stem: 'explore', description: 'exploring' },
    { stem: 'discover', description: 'discovering' },
    { stem: 'learn', description: 'learning' },
    { stem: 'create', description: 'creating' },
    { stem: 'plant', description: 'planting' },
    { stem: 'water', description: 'watering' },
    { stem: 'grow', description: 'growing' },
    { stem: 'investigate', description: 'investigating' },
    
    // Level 2 Actions (Advanced activities) - EXACT WORD PRESERVATION
    { stem: 'interview', description: 'interviewing' },
    { stem: 'explain', description: 'explaining' },
    { stem: 'share', description: 'sharing' },
    { stem: 'return', description: 'returning' },
    { stem: 'work', description: 'working' },
    
    // RED X FIX 2: MISSING ACTION PATTERNS - EXACT WORD PRESERVATION
    { stem: 'roll', description: 'rolling' },
    { stem: 'bounce', description: 'bouncing' },
    { stem: 'fall', description: 'falling' },
    { stem: 'kick', description: 'kicking' },
    { stem: 'climb', description: 'climbing' },
    { stem: 'swim', description: 'swimming' },
    { stem: 'hide', description: 'hiding' },
    { stem: 'slide', description: 'sliding' },
    { stem: 'dig', description: 'digging' },
    { stem: 'fly', description: 'flying' },
    { stem: 'hop', description: 'hopping' },
    { stem: 'skip', description: 'skipping' },
    { stem: 'sleep', description: 'sleeping' },
    { stem: 'drink', description: 'drinking' },
    { stem: 'wake', description: 'waking' },
    { stem: 'find', description: 'finding' },
    { stem: 'give', description: 'giving' },
    { stem: 'take', description: 'taking' },
    { stem: 'say', description: 'saying' },
    { stem: 'come', description: 'coming' },
    { stem: 'see', description: 'seeing' }
  ];
  
  // Split both sentence and context for comprehensive analysis
  const words = lowerSentence.split(/\s+/);
  const contextWords = contextText.split(/\s+/);
  const allWords = [...new Set([...words, ...contextWords])]; // Deduplicate
  
  // Check each word against action stems using smart detection with story context
  for (const word of allWords) {
    const baseStem = detectActionStem(word);
    
    // Find matching action mapping
    const actionMatch = actionMappings.find(action => action.stem === baseStem);
    if (actionMatch) {
      // Prefer words from the main sentence, fall back to context
      const sourceText = words.includes(word) ? 'sentence' : 'story context';
      console.log(`🎯 Enhanced Story Flow Detection: "${word}" → stem:"${baseStem}" → "${actionMatch.description}" (from ${sourceText})`);
      return actionMatch.description;
    }
  }
  
  console.log('⚠️ No specific action detected, using context-aware fallback');
  return getContextAwareFallbackScene(sentence);
}

// ============= CONTEXT-AWARE FALLBACK SYSTEM =============
function getContextAwareFallbackScene(sentence) {
  try {
    if (!sentence || typeof sentence !== 'string') {
      return getEmergencyFallbackScene();
    }
    
    const lowerSentence = sentence.toLowerCase();
    
    // Contextual fallbacks based on detected content
    if (lowerSentence.includes('kitchen') || lowerSentence.includes('cook') || lowerSentence.includes('food')) {
      return 'preparing something in the kitchen';
    }
    
    if (lowerSentence.includes('book') || lowerSentence.includes('read') || lowerSentence.includes('library')) {
      return 'reading quietly';
    }
    
    if (lowerSentence.includes('outside') || lowerSentence.includes('park') || lowerSentence.includes('playground')) {
      return 'playing outside in the fresh air';
    }
    
    if (lowerSentence.includes('friend') || lowerSentence.includes('together') || lowerSentence.includes('family')) {
      return 'spending time with others';
    }
    
    if (lowerSentence.includes('room') || lowerSentence.includes('home') || lowerSentence.includes('house')) {
      return 'enjoying time at home';
    }
    
    if (lowerSentence.includes('school') || lowerSentence.includes('learn') || lowerSentence.includes('study')) {
      return 'learning something new';
    }
    
    // Age-appropriate activity fallbacks
    if (lowerSentence.includes('baby') || lowerSentence.includes('toddler')) {
      return 'playing with colorful toys';
    }
    
    if (lowerSentence.includes('child') || lowerSentence.includes('kid')) {
      return 'exploring with curiosity';
    }
    
    // Default contextual activity
    return 'enjoying a peaceful moment';
    
  } catch (error) {
    console.warn('⚠️ Context-aware fallback error:', error);
    return getEmergencyFallbackScene();
  }
}

// ============= EMERGENCY FALLBACK SYSTEM =============
function getEmergencyFallbackScene() {
  const emergencyScenes = [
    'enjoying a bright cheerful moment',
    'playing in a colorful environment',
    'exploring with wonder and curiosity',
    'spending time in a welcoming space',
    'discovering something interesting'
  ];
  
  try {
    // Use current timestamp to pseudo-randomly select
    const index = Date.now() % emergencyScenes.length;
    return emergencyScenes[index];
  } catch (error) {
    console.warn('⚠️ Emergency fallback error:', error);
    return 'enjoying a bright cheerful moment'; // Ultimate fallback
  }
}

// ============= MASTER PLAN: ENHANCED SETTING EXTRACTION (Level 0-2 Template Analysis) =============
function extractSettingFromSentence(sentence, previousSetting) {
  try {
    console.log('🔍 Setting extraction with silent failure protection');
    
    if (!sentence || typeof sentence !== 'string') {
      console.log('⚠️ Invalid sentence input, using previousSetting or fallback');
      return previousSetting || ' a welcoming colorful environment';
    }
    
    const lowerSentence = sentence.toLowerCase();
  
  // ============= EXPANDED SETTING MAPPINGS FROM TEMPLATE ANALYSIS =============
  const settingMappings = {
    // Level 0 Settings (Basic locations)
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
    
    // Level 1 Settings (Outdoor exploration)
    'soil': ' rich garden soil with growing potential',
    'flowers': ' a colorful flower garden with blooming beauty',
    'outdoor': ' a beautiful outdoor setting with natural environment',
    
    // Level 2 Settings (Learning environments)  
    'classroom': ' a bright engaging classroom with educational materials',
    'stairs': ' a safe stairway with good lighting',
    'reading': ' a cozy reading nook with comfortable seating',
    
    // MASTER PLAN FIX: Missing Settings from "Ball Rolls Down Hill" + Expanded
    'hill': ' a scenic hill landscape with natural slopes', // 🎯 THE MISSING SETTING!
    'valley': ' a peaceful valley with rolling meadows',
    'pond': ' a tranquil pond with clear water',
    'stream': ' a babbling stream with flowing water',
    'farm': ' a working farm with animals and fields',
    'barn': ' a rustic barn with farm atmosphere',
    'hospital': ' a clean modern hospital with caring staff',
    'restaurant': ' a friendly restaurant with delicious aromas',
    'mall': ' a busy shopping mall with many stores',
    'zoo': ' an exciting zoo with amazing animals',
    'museum': ' an educational museum with fascinating exhibits',
    'airport': ' a bustling airport with travel excitement',
    'train station': ' a busy train station with transportation energy',
    'beach': ' a sunny sandy beach with ocean waves',
    'forest': ' a magical green forest with tall trees',
    'mountain': ' a majestic mountain landscape with scenic views',
    'city': ' a bustling vibrant city with urban energy',
    'street': ' a friendly neighborhood street with community feel',
    'backyard': ' a spacious family backyard with outdoor fun',
    'living room': ' a comfortable living room with family seating',
    'dining room': ' a welcoming dining room with eating space',
    'bathroom': ' a clean bright bathroom with modern fixtures',
    'garage': ' an organized garage with storage space',
    'basement': ' a finished basement with recreation area',
    'attic': ' a cozy attic with interesting discoveries',
    'hallway': ' a bright hallway connecting different rooms',
    'porch': ' a charming front porch with welcoming atmosphere',
    'patio': ' a lovely outdoor patio with relaxation space',
    
    // RED X FIX 3: MISSING SETTING KEYWORDS
    'slope': ' a gentle slope with natural terrain',
    'cliff': ' a dramatic cliff with steep edges',  
    'creek': ' a babbling creek with flowing water',
    'river': ' a flowing river with clear water',
    'stable': ' a rustic stable with farm atmosphere',
    'field': ' an open field with natural grass',
    'meadow': ' a peaceful meadow with wildflowers',
    'store': ' a friendly store with helpful staff',
    'shop': ' a welcoming shop with interesting items',
    'market': ' a bustling market with fresh goods',
    'cafe': ' a cozy cafe with warm atmosphere',
    'diner': ' a classic diner with comfort food',
    'clinic': ' a clean clinic with caring staff',
    'aquarium': ' an amazing aquarium with sea life',
    'museum': ' an educational museum with exhibits',
    'deck': ' an elevated deck with outdoor entertainment area'
  };
  
  // Check for specific settings first
  for (const [setting, description] of Object.entries(settingMappings)) {
    if (lowerSentence.includes(setting)) {
      return description;
    }
  }
  
  // If no specific setting found, use indoor/outdoor classification
  let isIndoor = false;
  let isOutdoor = false;
  
  // Check for indoor keywords using unified vocabulary
  for (const keyword of TIER_25_UNIFIED_VOCABULARY.contextDetection.indoor) {
    if (lowerSentence.includes(keyword)) {
      isIndoor = true;
      break;
    }
  }
  
  // Check for outdoor keywords using unified vocabulary
  if (!isIndoor) {
    for (const keyword of TIER_25_UNIFIED_VOCABULARY.contextDetection.outdoor) {
      if (lowerSentence.includes(keyword)) {
        isOutdoor = true;
        break;
      }
    }
  }
  
  // Apply indoor/outdoor classification
  if (isIndoor) {
    return ' a comfortable indoor space with cozy atmosphere';
  } else if (isOutdoor) {
    return ' a beautiful outdoor setting with natural environment';
  }
  
  // Nuclear-safe setting memory: Use previousSetting if available
  if (previousSetting && previousSetting.trim().length > 0) {
    console.log('🛡️ Tier 2.5: Using previous setting memory:', previousSetting);
    return previousSetting;
  }
  
  // Ultimate fallback
  return ' indoor portrait style photo with main character focus';
  } catch (error) {
    console.warn('⚠️ Setting extraction error:', error);
    return previousSetting || ' a welcoming colorful environment';
  }
}

// ============= COMPREHENSIVE ENHANCED PRONOUN RESOLUTION SYSTEM =============

// ============= TESTING & VALIDATION SUITE =============
function testPronounResolutionSystem() {
  console.log('🧪 Starting comprehensive pronoun resolution system test...');
  
  // Test 1: Object pronoun resolution
  const test1 = resolvePronounsInSentence(
    "She picks it up gently", 
    "Emma sees a beautiful flower in the garden", 
    [], 
    "test-session", 
    2
  );
  console.log(`Test 1 - Object resolution: "${test1}" (Expected: flower resolution)`);
  
  // Test 2: Character pronoun resolution  
  const test2 = resolvePronounsInSentence(
    "He helps with the cooking", 
    "Dad is in the kitchen preparing dinner", 
    ['dad'], 
    "test-session", 
    3
  );
  console.log(`Test 2 - Character resolution: "${test2}" (Expected: Dad resolution)`);
  
  // Test 3: Ambiguous case (should remain unchanged)
  const test3 = resolvePronounsInSentence(
    "She sees it near them", 
    "Mom and dad watch the cat and dog playing with a ball", 
    ['mom', 'dad'], 
    "test-session", 
    4
  );
  console.log(`Test 3 - Ambiguous case: "${test3}" (Expected: null - too ambiguous)`);
  
  // Test 4: Character name extraction
  const test4 = extractCharacterNamesFromDescription("caring mother nearby");
  console.log(`Test 4 - Character extraction: [${test4.join(', ')}] (Expected: ['mom'])`);
  
  // Test 5: Animal detection
  const test5 = await extractSecondaryCharactersFromSentence("She plays with her dog Max", "test-session", 1);
  console.log(`Test 5 - Animal detection: "${test5}" (Expected: dog companion)`);
  
  console.log('🧪 Pronoun resolution system testing complete!');
}

// Enhanced SessionStateManager integration with error handling
function getPreviousResolvedContext(sessionId, pageNumber) {
  try {
    if (!sessionId || pageNumber <= 1) {
      return { objects: [], characters: [] };
    }
    
    const session = globalArcSessionManager.getSession(sessionId);
    if (!session) {
      console.log(`⚠️ No session found for ${sessionId}`);
      return { objects: [], characters: [] };
    }
    
    const imagePrompts = session.imagePrompts || [];
    const previousPage = imagePrompts.find(p => p.pageNumber === pageNumber - 1);
    
    if (!previousPage || !previousPage.metadata) {
      console.log(`⚠️ No metadata found for previous page ${pageNumber - 1}`);
      return { objects: [], characters: [] };
    }
    
    // Extract resolved objects and characters from metadata
    const objects = previousPage.metadata.objects ? 
      previousPage.metadata.objects.split(',').map(o => o.trim().toLowerCase()) : [];
    const characters = previousPage.metadata.secondaryCharacters ? 
      previousPage.metadata.secondaryCharacters.split(',').map(c => c.trim().toLowerCase()) : [];
    
    console.log(`🎯 Retrieved previous context: ${objects.length} objects, ${characters.length} characters`);
    return { objects, characters };
  } catch (error) {
    console.warn('⚠️ Could not retrieve previous context:', error);
    return { objects: [], characters: [] };
  }
}

// Enhanced safe ambiguity detection with comprehensive context checking
function countPotentialAntecedents(sentence, originalPageText, previousContext) {
  const lowerSentence = sentence.toLowerCase();
  const lowerPageText = originalPageText.toLowerCase();
  
  // Comprehensive candidate list including common story objects and characters
  const allCandidates = [
    // Story objects - common in children's stories
    'tree', 'bird', 'dog', 'cat', 'butterfly', 'rabbit', 'squirrel', 'elephant', 'lion', 'tiger',
    'book', 'toy', 'ball', 'flower', 'car', 'truck', 'bike', 'swing', 'slide', 'kite',
    'rock', 'stone', 'stick', 'leaf', 'branch', 'shell', 'seed', 'apple', 'banana',
    // Family members
    'mom', 'dad', 'mother', 'father', 'sister', 'brother', 'friend',
    // Previous page resolved context
    ...previousContext.objects,
    ...previousContext.characters
  ];
  
  let count = 0;
  for (const candidate of allCandidates) {
    if (lowerPageText.includes(candidate) || lowerSentence.includes(candidate)) {
      count++;
    }
  }
  
  console.log(`🔍 Ambiguity check: Found ${count} potential antecedents for pronouns`);
  return count;
}

// Enhanced pronoun resolution with comprehensive safety checks and error handling
function resolvePronounsInSentence(sentence, originalPageText, detectedCharacters = [], sessionId, pageNumber) {
  try {
    if (!originalPageText || !sentence) {
      console.log('⚠️ Missing required parameters for pronoun resolution');
      return null;
    }
    
    const lowerSentence = sentence.toLowerCase();
    const lowerPageText = originalPageText.toLowerCase();
    
    // COMPREHENSIVE: All pronouns with safety-first resolution
    const pronouns = ['it', 'this', 'that', 'them', 'they', 'he', 'she', 'him', 'her', 'his', 'hers'];
    
    // EFFICIENCY OPTIMIZATION: Get resolved previous context with error handling
    const previousContext = sessionId && pageNumber ? 
      getPreviousResolvedContext(sessionId, pageNumber) : { objects: [], characters: [] };
    
    for (const pronoun of pronouns) {
      if (lowerSentence.includes(pronoun)) {
        // SAFETY CHECK: Count potential antecedents
        const antecedentCount = countPotentialAntecedents(sentence, originalPageText, previousContext);
        
        // SMART FALLBACK: If ambiguous (multiple antecedents), leave as-is for safety
        // MASTER PLAN PHASE 6: TUNED PRONOUN RESOLUTION - Confidence threshold lowered from 0.8 to 0.6
        if (antecedentCount > 1.6) { // Adjusted threshold for broader resolution coverage
          console.log(`🛡️ Tuned fallback: "${pronoun}" has ${antecedentCount} potential antecedents - leaving unchanged for safety`);
          continue;
        }
        
        // Human pronoun resolution with enhanced character mapping
        if (['he', 'him', 'his'].includes(pronoun)) {
          const maleCharacters = ['dad', 'father', 'papa', 'daddy', 'brother', 'bro'];
          // Also check detected characters for male family members
          const detectedMales = detectedCharacters.filter(c => maleCharacters.includes(c));
          
          for (const character of [...maleCharacters, ...detectedMales]) {
            if (lowerPageText.includes(character) && antecedentCount <= 1.6) { // Tuned threshold
              console.log(`🎯 Enhanced character pronoun resolution: "${pronoun}" → "${character}" from context (tuned confidence)`);
              return sentence.replace(new RegExp(`\\b${pronoun}\\b`, 'gi'), character);
            }
          }
        }
        
        if (['she', 'her', 'hers'].includes(pronoun)) {
          const femaleCharacters = ['mom', 'mother', 'mama', 'mommy', 'sister', 'sis'];
          // Also check detected characters for female family members
          const detectedFemales = detectedCharacters.filter(c => femaleCharacters.includes(c));
          
          for (const character of [...femaleCharacters, ...detectedFemales]) {
            if (lowerPageText.includes(character) && antecedentCount <= 1.6) { // Tuned threshold
              console.log(`🎯 Enhanced character pronoun resolution: "${pronoun}" → "${character}" from context (tuned confidence)`);
              return sentence.replace(new RegExp(`\\b${pronoun}\\b`, 'gi'), character);
            }
          }
        }
        
        // Object/animal pronoun resolution with enhanced safety and animal support
        const objects = [
          // Animals - treat with 'it' pronouns
          'tree', 'bird', 'dog', 'cat', 'butterfly', 'rabbit', 'squirrel', 'elephant', 'lion', 'tiger',
          // Objects
          'book', 'toy', 'ball', 'flower', 'car', 'truck', 'bike', 'swing', 'slide', 'kite',
          // Nature objects
          'rock', 'stone', 'stick', 'leaf', 'branch', 'shell', 'seed', 'apple', 'banana'
        ];
        
        // Check current page objects first with enhanced word boundary matching
        for (const obj of objects) {
          if (lowerPageText.includes(obj) && !lowerSentence.includes(obj) && antecedentCount === 1) {
            console.log(`🎯 Safe object pronoun resolution: "${pronoun}" → "${obj}" from current context`);
            return sentence.replace(new RegExp(`\\b${pronoun}\\b`, 'gi'), obj);
          }
        }
        
        // EFFICIENCY OPTIMIZATION: Check previous page resolved context with safety
        if (previousContext.objects.length === 1 && antecedentCount === 1) {
          const prevObject = previousContext.objects[0];
          console.log(`🎯 Efficient previous context resolution: "${pronoun}" → "${prevObject}" from resolved data (safe)`);
          return sentence.replace(new RegExp(`\\b${pronoun}\\b`, 'gi'), prevObject);
        }
      }
    }
    
    return null;
  } catch (error) {
    console.warn('⚠️ Enhanced pronoun resolution error:', error);
    return null;
  }
}

// ============= END CHUNK 1 CONVERSION =============

});