// ============= TIER 2.5 NUCLEAR INDEPENDENCE - SHARED NUCLEAR NEGATIVE PROMPT SYSTEM =============
// This edge function uses the shared nuclear negative prompt system for consistency
import { generateNuclearNegativePrompt, detectCulturalProfileForNegatives } from "../_shared/NuclearNegativePrompts.js";
import { globalArcSessionManager } from "../_shared/sessionStateManager.js";
import { ExactWordExtractor } from "../_shared/ExactWordExtractor.ts";
import { VisualDetailTracker } from "../_shared/VisualDetailTracker.js";
import { CharacterConsistencyService } from "../_shared/CharacterConsistencyService.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
function getSeededRandomItem(array: string[], seed: string): string {
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
      'waving hands', 'thumbs up', 'clapping hands', 'covering eyes', 'shrugging shoulders',
      'nodding head', 'tilting head', 'leaning forward', 'standing tall', 'crouching down',
      'jumping with joy', 'sitting cross-legged', 'lying on stomach', 'reaching up high',
      
      // Sleeping/Waking context
      'stretching arms upward', 'rubbing eyes sleepily', 'yawning softly', 'arms reaching skyward',
      'hands rubbing face gently', 'stretching and yawning', 'arms extended in morning stretch',
      
      // Walking/Moving context
      'arms swinging naturally', 'hands in pockets', 'looking ahead confidently', 'arms at sides',
      'hands clasped behind back', 'arms moving rhythmically', 'hands gesturing while walking',
      
      // Playing/Active context  
      'arms spread wide with excitement', 'hands raised in celebration', 'jumping and cheering',
      'arms pumping with energy', 'hands clapping enthusiastically', 'body bouncing with joy',
      
      // Emotional expressions
      'smiling brightly', 'eyes sparkling with wonder', 'head tilted thoughtfully',
      'hands clasped together', 'arms hugging self contentedly', 'chin resting on hands'
    ],
    
    // NEW: Spatial positioning vocabulary (CONTEXT-AWARE EXPANSION)
    spatial: [
      // Basic positioning
      'standing in the center', 'positioned in the foreground', 'placed to the left',
      'located on the right side', 'sitting in the background', 'crouched in the corner',
      'balanced on top of', 'nestled between', 'hovering above', 'resting beneath',
      'leaning against', 'walking towards', 'moving away from', 'circling around',
      'climbing up', 'sliding down', 'jumping over', 'crawling under',
      
      // Sleeping/Waking context
      'sitting up in bed', 'stretching in bed', 'lying peacefully', 'positioned on mattress',
      'seated on edge of bed', 'resting comfortably', 'nestled in bedding',
      
      // Walking/Moving context
      'moving forward confidently', 'stepping carefully', 'striding purposefully', 
      'walking along the path', 'positioned mid-stride', 'advancing steadily',
      
      // Playing context
      'positioned playfully', 'crouched down to play', 'kneeling on ground',
      'seated for play', 'positioned for interaction', 'arranged for activity',
      
      // Learning/Reading context
      'seated comfortably', 'positioned at desk', 'arranged for study', 
      'sitting attentively', 'positioned for learning', 'placed for reading'
    ]
  },
  
  // ============= UNIFIED SETTING VOCABULARY =============
  // Consolidated from contextDetection + ExactWordExtractor
  settings: {
    indoor: [
      // Essential indoor locations
      'kitchen', 'bedroom', 'classroom', 'library', 'home', 'house', 'room', 'bathroom', 'office',
      // Enhanced educational & professional spaces
      'laboratory', 'conference', 'summit', 'presentation', 'research', 'university', 'workshop', 'meeting hall',
      // Indoor activities & states
      'reading', 'cooking', 'studying', 'homework', 'indoor', 'inside', 'investigating', 'organizing', 'presenting',
      // Core indoor objects (non-furniture)
      'tv', 'computer', 'tablet', 'phone', 'television', 'radio', 'book', 'newspaper', 'magazine',
      // Essential indoor fixtures
      'shower', 'bath', 'toilet', 'sink', 'refrigerator', 'oven', 'microwave'
    ],
    outdoor: [
      // Natural locations  
      'park', 'playground', 'garden', 'forest', 'beach', 'mountain', 'backyard', 'field', 'hill',
      // Enhanced environmental settings
      'coral reefs', 'tide pools', 'kelp forests', 'village', 'neighborhood', 'community center',
      // Water features
      'river', 'lake', 'ocean', 'sea', 'pond', 'stream',
      // Paths & navigation
      'path', 'trail', 'road', 'street',
      // Nature elements
      'nature', 'tree', 'grass', 'flower', 'sky', 'sun', 'moon', 'star', 'cloud', 'rain', 'snow', 'wind',
      // Outdoor activities & states
      'outdoor', 'outside', 'running', 'walking', 'hiking', 'climbing', 'swimming', 'fishing', 'camping', 'picnic', 'sports', 'exploring', 'advocating'
    ],
    // ExactWordExtractor settings consolidated here
    specific: [
      'hill', 'park', 'playground', 'garden', 'room', 'house', 'kitchen', 'bedroom', 
      'classroom', 'library', 'forest', 'beach', 'field', 'yard', 'backyard', 
      'school', 'store', 'hospital', 'restaurant'
    ],
    // Fantasy & magical locations
    fantasy: [
      'enchanted forest', 'magical castle', 'crystal cave', 'floating island', 
      'wizard tower', 'fairy garden', 'rainbow bridge', 'starry sky', 'mystical grove'
    ]
  },
  
  contextDetection: {
    indoor: [
      'kitchen', 'bedroom', 'classroom', 'library', 'home', 'house', 'room', 'bathroom', 'office',
      'laboratory', 'conference', 'summit', 'presentation', 'research', 'university', 'workshop', 'meeting hall',
      'reading', 'cooking', 'studying', 'homework', 'indoor', 'inside', 'investigating', 'organizing', 'presenting',
      'tv', 'computer', 'tablet', 'phone', 'television', 'radio', 'book', 'newspaper', 'magazine',
      'shower', 'bath', 'toilet', 'sink', 'refrigerator', 'oven', 'microwave'
    ],
    outdoor: [
      'park', 'playground', 'garden', 'forest', 'beach', 'mountain', 'backyard', 'field', 'hill',
      'coral reefs', 'tide pools', 'kelp forests', 'village', 'neighborhood', 'community center',
      'river', 'lake', 'ocean', 'sea', 'pond', 'stream', 'path', 'trail', 'road', 'street',
      'nature', 'tree', 'grass', 'flower', 'sky', 'sun', 'moon', 'star', 'cloud', 'rain', 'snow', 'wind',
      'outdoor', 'outside', 'running', 'walking', 'hiking', 'climbing', 'swimming', 'fishing', 'camping', 'picnic', 'sports', 'exploring', 'advocating'
    ]
  },
  // Enhanced object categories with comprehensive story vocabulary
  objectCategories: {
    // Food Items
    food: ['apple', 'banana', 'sandwich', 'cookie', 'cake', 'pizza', 'ice cream', 'cupcake', 'donut', 'bread', 'cheese', 'crackers', 'fruit', 'vegetables', 'juice box', 'water bottle', 'milk', 'cereal', 'pancakes', 'toast'],
    
    // Animals & Pets (100+ animals across 6 categories - allows any color for user stories)
    animals: [
      // Pets & Domesticated
      'dog', 'cat', 'rabbit', 'hamster', 'guinea pig', 'parakeet', 'goldfish', 'turtle', 'ferret', 'chinchilla', 'hedgehog', 'rat', 'mouse', 'canary', 'cockatiel', 'budgie', 'parrot', 'macaw', 'iguana', 'snake',
      // Farm Animals  
      'cow', 'pig', 'sheep', 'chicken', 'duck', 'goose', 'horse', 'goat', 'llama', 'alpaca', 'donkey', 'mule', 'turkey', 'rooster', 'hen',
      // Wild Animals
      'lion', 'tiger', 'bear', 'elephant', 'wolf', 'fox', 'deer', 'squirrel', 'raccoon', 'skunk', 'porcupine', 'beaver', 'otter', 'mink', 'badger', 'leopard', 'cheetah', 'jaguar', 'panther', 'lynx', 'bobcat', 'coyote', 'hyena', 'rhino', 'hippo', 'giraffe', 'zebra', 'antelope', 'gazelle', 'buffalo', 'bison', 'moose', 'elk', 'caribou',
      // Sea Animals
      'dolphin', 'whale', 'shark', 'fish', 'octopus', 'crab', 'lobster', 'seahorse', 'starfish', 'jellyfish', 'seal', 'sea lion', 'walrus', 'orca', 'stingray',
      // Birds
      'eagle', 'owl', 'robin', 'cardinal', 'flamingo', 'penguin', 'pelican', 'heron', 'crane', 'stork', 'swan', 'hawk', 'falcon', 'vulture', 'peacock', 'ostrich', 'emu', 'kiwi', 'toucan', 'hummingbird',
      // Insects & Small Creatures
      'butterfly', 'ladybug', 'bee', 'ant', 'spider', 'caterpillar', 'grasshopper', 'cricket', 'dragonfly', 'firefly', 'beetle', 'moth', 'wasp', 'fly', 'mosquito', 'frog', 'toad', 'salamander', 'lizard', 'chameleon'
    ],
    
    // Vehicles & Transportation
    vehicles: ['car', 'truck', 'bus', 'train', 'airplane', 'helicopter', 'boat', 'ship', 'bicycle', 'scooter', 'skateboard', 'motorcycle', 'fire truck', 'police car', 'ambulance', 'school bus', 'taxi', 'rocket', 'submarine', 'hot air balloon'],
    
    // Toys & Games
    toys: ['ball', 'doll', 'teddy bear', 'blocks', 'puzzle', 'kite', 'yo-yo', 'top', 'marbles', 'action figure', 'stuffed animal', 'toy car', 'toy train', 'board game', 'cards', 'dice', 'jump rope', 'hula hoop', 'frisbee', 'bubbles'],
    
    // Tools & Instruments (Enhanced with story template objects)
    tools: ['hammer', 'screwdriver', 'wrench', 'paintbrush', 'scissors', 'ruler', 'magnifying glass', 'telescope', 'microscope', 'calculator', 'compass', 'flashlight', 'camera', 'telephone', 'computer', 'tablet', 'keyboard', 'mouse', 'headphones', 'microphone', 'projector', 'recording equipment', 'solar panels'],
    
    // Nature & Outdoor (Enhanced with environmental elements)
    nature: ['tree', 'flower', 'leaf', 'rock', 'shell', 'stick', 'acorn', 'pinecone', 'feather', 'pebble', 'sand', 'grass', 'moss', 'mushroom', 'berry', 'seed', 'branch', 'log', 'crystal', 'butterfly net', 'seashell', 'fountain', 'sparkles', 'rainbow'],
    
    // Clothing & Accessories
    clothing: ['hat', 'cap', 'shirt', 'dress', 'pants', 'shoes', 'socks', 'jacket', 'sweater', 'scarf', 'gloves', 'belt', 'tie', 'bow tie', 'necklace', 'bracelet', 'earrings', 'ring', 'watch', 'sunglasses'],
    
    // Sports & Recreation
    sports: ['soccer ball', 'basketball', 'football', 'baseball', 'tennis ball', 'golf ball', 'ping pong ball', 'volleyball', 'hockey stick', 'baseball bat', 'tennis racket', 'golf club', 'skateboard', 'roller skates', 'ice skates', 'helmet', 'bicycle', 'swimming goggles', 'life jacket', 'surfboard'],
    
    // Electronics & Technology (Enhanced with story elements)
    electronics: ['computer', 'laptop', 'tablet', 'phone', 'television', 'radio', 'speaker', 'headphones', 'camera', 'video game', 'remote control', 'calculator', 'digital clock', 'mp3 player', 'keyboard', 'mouse', 'printer', 'scanner', 'projector', 'smartwatch'],
    
    // Furniture & Household
    furniture: ['chair', 'table', 'bed', 'desk', 'bookshelf', 'dresser', 'mirror', 'lamp', 'clock', 'picture frame', 'vase', 'pillow', 'blanket', 'curtains', 'rug', 'couch', 'sofa', 'cabinet', 'drawer', 'closet'],
    
    // NEW CATEGORY: Character Descriptors & Actions (From story template analysis)
    characters: {
      descriptors: ['tiny', 'friendly', 'shy', 'confident', 'brilliant', 'determined', 'excited', 'worried', 'inspired', 'overwhelmed', 'grateful', 'nervous', 'radiant'],
      actions: ['discovers', 'exploring', 'swimming', 'climbing', 'investigating', 'organizing', 'presenting', 'advocating', 'researching', 'lobbying', 'strategizing'],
      emotions: ['happy', 'sad', 'excited', 'worried', 'inspired', 'overwhelmed', 'grateful', 'nervous', 'confident', 'shy', 'determined', 'brilliant', 'radiant']
    },
    
    // NEW CATEGORY: Documents & Props (From story templates)
    documents: ['notebook', 'charts', 'maps', 'slides', 'research papers', 'presentation slides', 'whiteboard', 'podium', 'screen'],
    
    // NEW CATEGORY: Scene Atmosphere & Lighting (For enhanced image generation)
    atmosphere: {
      lighting: ['sparkling', 'glowing', 'bright sunlight', 'moonlight', 'starlight', 'candlelight', 'golden light', 'soft light'],
      weather: ['mist', 'fog', 'gentle rain', 'sunny morning', 'clear sky', 'cloudy', 'misty', 'foggy'],
      mood: ['magical', 'mysterious', 'peaceful', 'bustling', 'quiet', 'triumphant', 'cozy', 'serene', 'enchanting']
    },
    
    // NEW CATEGORY: Community & Social Elements (From story templates)
    community: {
      events: ['celebration', 'ceremony', 'festival', 'gathering', 'meeting', 'collaboration', 'conference', 'summit'],
      spaces: ['community center', 'meeting hall', 'village square', 'neighborhood', 'town hall', 'plaza']
    },
    
    // NEW CATEGORY: Technology & Science (Enhanced for all story types)
    technology: ['laptop', 'projector', 'microphone', 'camera', 'recording equipment', 'microscope', 'telescope', 'solar panels', 'renewable energy', 'laboratory equipment', 'research tools']
  }
};

// NUCLEAR HARDCODED AVATAR MAPPINGS (15 combinations: 3 types × 5 skin tones)
const NUCLEAR_AVATAR_MAPPINGS = {
  // BOY MAPPINGS
  'boy-pale': {
    character: 'boy',
    age: '6-year-old',
    hair: 'red hair',
    features: 'attractive child character with fair pale complexion'
  },
  'boy-light': {
    character: 'boy', 
    age: '6-year-old',
    hair: 'blonde hair', 
    features: 'attractive child character with light complexion'
  },
  'boy-medium': {
    character: 'boy',
    age: '6-year-old', 
    hair: 'brown hair',
    features: 'attractive child character with medium complexion'
  },
  'boy-olive': {
    character: 'boy',
    age: '6-year-old',
    hair: 'black hair',
    features: 'attractive child character with olive complexion'
  },
  'boy-dark': {
    character: 'African American boy',
    age: '6-year-old',
    hair: 'textured hair',
    features: 'attractive child character with authentic African American features'
  },

  // GIRL MAPPINGS  
  'girl-pale': {
    character: 'girl',
    age: '6-year-old',
    hair: 'red hair',
    features: 'attractive child character with fair pale complexion'
  },
  'girl-light': {
    character: 'girl',
    age: '6-year-old', 
    hair: 'blonde hair',
    features: 'attractive child character with light complexion'
  },
  'girl-medium': {
    character: 'girl',
    age: '6-year-old',
    hair: 'brown hair',
    features: 'attractive child character with medium complexion'
  },
  'girl-olive': {
    character: 'girl', 
    age: '6-year-old',
    hair: 'black hair',
    features: 'attractive child character with olive complexion'
  },
  'girl-dark': {
    character: 'African American girl',
    age: '6-year-old',
    hair: 'textured hair', 
    features: 'attractive child character with authentic African American features'
  },

  // GENDER-NEUTRAL MAPPINGS (for prefer-not-to-answer)
  'neutral-pale': {
    character: 'child with gender neutral characteristics',
    age: '6-year-old',
    hair: 'red hair',
    features: 'attractive gender neutral child character with fair pale complexion and no recognizable gender'
  },
  'neutral-light': {
    character: 'child with gender neutral characteristics',
    age: '6-year-old',
    hair: 'blonde hair',
    features: 'attractive gender neutral child character with light complexion and no recognizable gender'
  },
  'neutral-medium': {
    character: 'child with gender neutral characteristics',
    age: '6-year-old',
    hair: 'brown hair',
    features: 'attractive gender neutral child character with medium complexion and no recognizable gender'
  },
  'neutral-olive': {
    character: 'child with gender neutral characteristics', 
    age: '6-year-old',
    hair: 'black hair',
    features: 'attractive gender neutral child character with olive complexion and no recognizable gender'
  },
  'neutral-dark': {
    character: 'African American child with gender neutral characteristics',
    age: '6-year-old', 
    hair: 'textured hair',
    features: 'attractive gender neutral child character with authentic African American features and no recognizable gender'
  }
};

// ============= ENHANCED SKIN TONE VARIATION ARRAYS - COPIED FROM ORCHESTRATOR =============
// REGRESSION PREVENTION: This provides detailed skin tone variations for character generation
// Rich variations for pale, light, medium, olive - preserving African American arrays for dark skin
const ENHANCED_SKIN_TONE_VARIATIONS = {
  'pale': [
    "attractive child character with porcelain white skin with cool undertones",
    "attractive child character with alabaster complexion with subtle pink flush",
    "attractive child character with fair ivory skin with delicate translucency",
    "attractive child character with cream-colored skin with soft warmth",
    "attractive child character with light peachy-pink complexion",
    "attractive child character with fair skin with gentle rosy undertones",
    "attractive child character with soft beige-pink skin with natural glow",
    "attractive child character with warm ivory complexion with subtle golden hints"
  ],
  'light': [
    "attractive child character with light ivory skin with golden undertones",
    "attractive child character with soft vanilla complexion with warm highlights",
    "attractive child character with honey-beige skin with natural radiance",
    "attractive child character with light golden skin with peachy undertones",
    "attractive child character with warm sand-colored complexion",
    "attractive child character with light tan skin with golden glow",
    "attractive child character with sun-kissed beige with bronze hints",
    "attractive child character with golden-light skin with warm depth"
  ],
  'medium': [
    "attractive child character with light caramel skin with golden undertones",
    "attractive child character with warm wheat-colored complexion",
    "attractive child character with honey-gold skin with amber highlights",
    "attractive child character with medium tan with bronze undertones",
    "attractive child character with rich caramel complexion with golden depth",
    "attractive child character with warm amber-toned skin with natural shine",
    "attractive child character with golden brown skin with copper highlights",
    "attractive child character with rich tan with deep bronze undertones"
  ],
  'olive': [
    "attractive child character with light olive skin with golden undertones",
    "attractive child character with soft olive-beige complexion",
    "attractive child character with warm olive-gold skin with neutral depth",
    "attractive child character with medium olive complexion with bronze hints",
    "attractive child character with rich olive skin with golden-green undertones",
    "attractive child character with deep olive complexion with warm bronze",
    "attractive child character with Mediterranean olive skin with copper highlights",
    "attractive child character with rich olive-tan with natural golden depth"
  ],
  'dark': [
    // Keep existing African American approach for cultural sensitivity
    "attractive child character with textured natural hair"
  ]
};

// ORCHESTRATOR HAIR COLOR MAPPING - COPIED FROM ORCHESTRATOR  
const ORCHESTRATOR_HAIR_COLOR_MAP = {
  'pale': 'red hair',              // Celtic/Northern European heritage
  'light': 'blonde hair',          // Northern European heritage  
  'medium': 'brown hair',          // Global medium tones
  'olive': 'black hair',           // Mediterranean/Middle Eastern heritage
  'dark': 'textured natural hair'  // African diaspora heritage - includes natural textures
};

// SEEDED RANDOM SELECTION - COPIED FROM ORCHESTRATOR
function getSeededSkinToneVariation(skinTone: string, seed: string): string {
  const variations = ENHANCED_SKIN_TONE_VARIATIONS[skinTone];
  if (!variations || variations.length === 0) return '';
  if (variations.length === 1) return variations[0];
  
  // Create consistent hash from seed
  let hash = 0;
  const seedStr = String(seed || '');
  for (let i = 0; i < seedStr.length; i++) {
    hash = ((hash << 5) - hash + seedStr.charCodeAt(i)) & 0xffffffff;
  }
  
  const index = Math.abs(hash) % variations.length;
  return variations[index];
}

// ENHANCED NUCLEAR AVATAR MAPPING FUNCTION
function getNuclearAvatarMapping(userInfo: any, difficulty: string): any {
  try {
    console.log('🛡️ Tier 2.5: Enhanced nuclear avatar mapping started');
    
    // Get avatar type and skin tone safely
    let avatarType = userInfo?.avatar?.type || 'prefer-not-to-answer';
    const avatarSkinTone = userInfo?.avatar?.skinTone || 'medium';
    
    console.log(`🛡️ Tier 2.5: Avatar data - Type: ${avatarType}, SkinTone: ${avatarSkinTone}`);
    
    // Handle missing avatar data - default to gender-neutral
    if (!userInfo?.avatar?.type) {
      console.log('🛡️ Tier 2.5: No avatar type found, defaulting to gender-neutral');
      avatarType = 'prefer-not-to-answer';
    }
    
    // Generate consistent seed for variations
    const characterSeed = `${userInfo?.name || 'user'}_${avatarSkinTone}_${Date.now()}`;
    
    // ENHANCED AVATAR MAPPING: Combine orchestrator + African American arrays for dark skin
    if (avatarSkinTone === 'dark') {
      // PHASE 2: Enhanced Dark Skin Processing - Combine orchestrator + African American arrays
      console.log('🛡️ Tier 2.5: Combining orchestrator data with African American arrays for dark skin');
      
      // Map avatar type to character prefix
      let characterPrefix;
      if (avatarType === 'prefer-not-to-answer') {
        characterPrefix = 'neutral';
      } else {
        characterPrefix = avatarType; // 'boy' or 'girl'  
      }
      
      // Get base orchestrator mapping
      const mappingKey = `${characterPrefix}-dark`;
      const avatarMapping = NUCLEAR_AVATAR_MAPPINGS[mappingKey];
      
      if (!avatarMapping) {
        console.warn(`⚠️ Tier 2.5: No mapping found for ${mappingKey}, using emergency fallback`);
        return {
          character: 'happy child with authentic features',
          age: '7-year-old',
          hair: 'textured natural hair',
          features: 'attractive child character',
          source: 'emergency-fallback'
        };
      }
      
      // Adjust age based on difficulty
      const ageMapping = {
        'beginner': '3-year-old',
        'easy': '5-year-old', 
        'medium': '7-year-old',
        'hard': '9-year-old',
        'expert': '11-year-old'
      };

      // PHASE 4: Seeded Selection for Consistency
      // Generate consistent seed for character selection
      const characterSeedValue = generateSeededRandom(characterSeed);
      
      // Select African American hair from arrays using seeded random
      let enhancedHair = avatarMapping.hair; // Start with orchestrator base: 'textured hair'
      if (avatarType === 'girl') {
        const selectedHairIndex = Math.floor(characterSeedValue * HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.girls.length);
        const selectedAfricanAmericanHair = HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.girls[selectedHairIndex];
        enhancedHair = `${avatarMapping.hair}, ${selectedAfricanAmericanHair}`;
      } else if (avatarType === 'boy' || avatarType === 'prefer-not-to-answer') {
        const selectedHairIndex = Math.floor(characterSeedValue * HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.boys.length);
        const selectedAfricanAmericanHair = HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.boys[selectedHairIndex];
        enhancedHair = `${avatarMapping.hair}, ${selectedAfricanAmericanHair}`;
      }
      
      // Select African American features from arrays using seeded random  
      const selectedFeatureIndex = Math.floor(characterSeedValue * HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES.length);
      const selectedAfricanAmericanFeatures = HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES[selectedFeatureIndex];
      const enhancedFeatures = `${avatarMapping.features}, ${selectedAfricanAmericanFeatures}`;
      
      console.log(`✅ Tier 2.5: Enhanced dark skin mapping - Hair: ${enhancedHair.substring(0, 50)}...`);
      console.log(`✅ Tier 2.5: Enhanced dark skin mapping - Features: ${enhancedFeatures.substring(0, 50)}...`);
      
      return {
        character: avatarMapping.character,
        age: ageMapping[difficulty] || '7-year-old',
        hair: enhancedHair,
        features: enhancedFeatures,
        source: 'nuclear-mapping-dark-enhanced'
      };
      
    } else {
      // ENHANCED: Use rich orchestrator variations for pale, light, medium, olive
      console.log('🛡️ Tier 2.5: Using enhanced orchestrator variations for non-dark skin');
      
      const skinToneVariation = getSeededSkinToneVariation(avatarSkinTone, characterSeed);
      const hairColor = ORCHESTRATOR_HAIR_COLOR_MAP[avatarSkinTone] || 'brown hair';
      
      // Age mapping based on difficulty
      const ageMapping = {
        'beginner': '3-year-old',
        'easy': '5-year-old', 
        'medium': '7-year-old',
        'hard': '9-year-old',
        'expert': '11-year-old'
      };
      
      return {
        character: skinToneVariation || `attractive child character with ${avatarSkinTone} skin tone`,
        age: ageMapping[difficulty] || '7-year-old',
        hair: hairColor,
        features: skinToneVariation || `attractive child character features`,
        source: 'orchestrator-enhanced',
        seed: characterSeed,
        type: avatarType,
        skinTone: avatarSkinTone
      };
    }
    
  } catch (error) {
    console.error('❌ Tier 2.5: Enhanced nuclear avatar mapping error:', error);
    // Enhanced ultimate failsafe with user's specifications
    return {
      character: 'happy child',
      age: '7-year-old',
      hair: 'neat hair',
      features: 'cheerful expression',
      source: 'ultimate-fallback'
    };
  }
}

// CHARACTER CONSISTENCY ENHANCEMENT FUNCTION
// Enhances nuclear mapping with consistent character data while preserving nuclear independence
function enhanceNuclearMappingWithConsistency(userInfo: any, difficulty: string, characterData: any, sessionId: string, avatarIdentity?: any): any {
  try {
    console.log('🎭 Tier 2.5: Starting character consistency enhancement');
    
    // STEP 1: Get the nuclear mapping (always safe) - pass avatarIdentity
    const nuclearMapping = getNuclearAvatarMapping(userInfo, difficulty, avatarIdentity);
    console.log('🛡️ Tier 2.5: Nuclear mapping obtained successfully');
    
    // STEP 2: If no character data, return nuclear mapping (existing behavior)
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

async function extractSceneWithPremiumTemplate(pageText: string, previousSetting?: string, pageNumber?: number, sessionId?: string): Promise<{ scene: string, setting: string, objects: string, secondary_characters: string }> {
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

    // ============= ENHANCED OBJECT INTEGRATION (Use existing system for consistency) =============
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

    // ============= TEMPLATE VALIDATION + INTELLIGENCE =============
    const isTemplateComplete = validateTemplateCompleteness(
      'character', // placeholder - will be filled later
      bestExtractedElements.setting,
      expandedAction,
      enhancedObjects
    );

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
function extractElementsFromSentenceUnified(sentence: string, fullText: string): { action: string, setting: string, objects: string[], characters: string[] } {
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

// ============= TEMPLATE VALIDATION + TIER 2.5B FALLBACK =============
function validateTemplateCompleteness(character: string, setting: string, scene: string, objects: string): boolean {
  const issues = [];
  
  if (!character || character.length < 3) issues.push('character missing/too short');
  if (!setting || setting.length < 5) issues.push('setting missing/too short');  
  if (!scene || scene.split(' ').length < 5) issues.push('action under 5 words');
  
  console.log(`🔍 Template validation - Issues: ${issues.length > 0 ? issues.join(', ') : 'none'}`);
  
  return issues.length === 0;
}

// ============= CONTEXTUAL INTELLIGENCE FUNCTIONS =============

// 1. INFER CONTEXTUAL SETTING - Object-driven setting enhancement
function inferContextualSetting(baseSetting: string, objects: string, pageText: string, sessionId?: string): string {
  try {
    console.log(`🧠 Contextual Setting Inference - Objects: "${objects}", Base: "${baseSetting}"`);
    
    if (!objects || !pageText) return baseSetting;
    
    const objectsLower = objects.toLowerCase();
    const pageTextLower = pageText.toLowerCase();
    const seed = pageText + objects + baseSetting;
    
    // Object-to-setting mappings with contextual weighting
    const objectSettingMap: { [key: string]: { indoor: string[], outdoor: string[], weight: number } } = {
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
function expandActionWithContext(baseAction: string, objects: string, pageText: string, setting: string): string {
  try {
    console.log(`🧠 Contextual Action Enhancement - Action: "${baseAction}", Objects: "${objects}"`);
    
    const objectsLower = objects.toLowerCase();
    const pageTextLower = pageText.toLowerCase();
    const seed = pageText + objects + baseAction;
    
    // Object-action contextual templates with emotional enhancement
    const contextualActionTemplates: { [key: string]: string[] } = {
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
function generateSpatialComposition(action: string, objects: string, setting: string, pageText: string): string {
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
    const templates = spatialTemplates[interactionType as keyof typeof spatialTemplates];
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
function inferAtmosphereFromContext(pageText: string, setting: string, action: string): string {
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
function expandActionToPhrase(action: string, detectedObjects?: string, pageText?: string): string {
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
  const expansionMap: { [key: string]: string } = {
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
function calculateVisualPriority(elements: { action: string, setting: string, objects: string[], characters: string[] }): number {
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
function calculateFantasyBonus(elements: { action: string, setting: string, objects: string[], characters: string[] }): number {
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
function calculateFantasyFriendlyCoherence(elements: { action: string, setting: string, objects: string[], characters: string[] }): number {
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
function detectPlural(word: string): boolean {
  const cleanWord = word.toLowerCase().trim();
  
  // Irregular plurals
  const irregularPlurals = ['children', 'feet', 'teeth', 'mice', 'geese', 'deer', 'sheep', 'fish'];
  if (irregularPlurals.includes(cleanWord)) return true;
  
  // Regular plurals (but exclude words that naturally end in 's')
  const naturalSWords = ['was', 'is', 'has', 'this', 'yes', 'bus', 'class', 'glass', 'grass'];
  if (naturalSWords.includes(cleanWord)) return false;
  
  return cleanWord.endsWith('s') || cleanWord.endsWith('es');
}

function preserveExactWordForm(detectedWord: string, originalText: string): string {
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
function detectActionStem(word: string): string {
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

function extractActionFromSentence(sentence: string, pageText?: string): string {
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
function getContextAwareFallbackScene(sentence?: string): string {
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
function getEmergencyFallbackScene(): string {
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
function extractSettingFromSentence(sentence: string, previousSetting?: string): string {
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
function getPreviousResolvedContext(sessionId: string, pageNumber: number) {
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
    
    if (!previousPage?.metadata) {
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
function countPotentialAntecedents(sentence: string, originalPageText: string, previousContext: any): number {
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
function resolvePronounsInSentence(sentence: string, originalPageText?: string, detectedCharacters: string[] = [], sessionId?: string, pageNumber?: number): string | null {
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
    console.warn('⚠️ Pronoun resolution error:', error);
    return null;
  }
}
// ============= STORY PROGRESSION MAP CLASS =============
class StoryProgressionMap {
  private objectIntroductions: Map<string, number> = new Map();
  private storyContext: string;
  
  constructor(storyText: string, pageNumber: number) {
    this.storyContext = storyText.toLowerCase();
    this.analyzeStoryProgression(storyText, pageNumber);
  }
  
  private analyzeStoryProgression(storyText: string, currentPage: number): void {
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
  
  allowsObject(object: string): boolean {
    const introPage = this.objectIntroductions.get(object);
    return introPage === undefined; // Allow objects not in the progression map
  }
  
  getIntroductionPage(object: string): number {
    return this.objectIntroductions.get(object) || 1;
  }
}

// ============= ENHANCED STORY PROGRESSION ANALYSIS FUNCTION =============
function analyzeStoryProgression(storyText: string, pageNumber: number): StoryProgressionMap {
  return new StoryProgressionMap(storyText, pageNumber);
}

function extractObjectsFromSentence(sentence: string, originalPageText?: string, pageNumber?: number, sessionId?: string): string {
  const lowerSentence = sentence.toLowerCase();
  
  // PHASE 1: STORY PROGRESSION INTELLIGENCE - Replace basic prevention with smart analysis
  if (pageNumber && originalPageText) {
    const storyProgressionMap = analyzeStoryProgression(originalPageText, pageNumber);
    const prematureObjects = ['bird', 'butterfly', 'rabbit', 'squirrel', 'elephant', 'lion', 'tiger'];
    
    for (const obj of prematureObjects) {
      if (lowerSentence.includes(obj) && !storyProgressionMap.allowsObject(obj)) {
        console.log(`📚 Story progression: ${obj} not introduced until page ${storyProgressionMap.getIntroductionPage(obj)}, current page: ${pageNumber}`);
        continue;
      }
    }
  }
  
  // PHASE 3: VISUAL FOCUS ENHANCEMENT - Detect "sees/looks at" for object prioritization
  const visualFocusKeywords = ['sees', 'looks at', 'watches', 'observes', 'notices', 'spots', 'finds', 'discovers'];
  let visuallyFocusedObject = '';
  
  for (const keyword of visualFocusKeywords) {
    if (lowerSentence.includes(keyword)) {
      // Extract object after visual focus keyword
      const keywordIndex = lowerSentence.indexOf(keyword);
      const afterKeyword = lowerSentence.substring(keywordIndex + keyword.length);
      const words = afterKeyword.split(' ').filter(w => w.length > 2);
      
      if (words.length > 0) {
        visuallyFocusedObject = words[0];
        console.log(`👁️ Visual focus detected: "${keyword}" → focusing on "${visuallyFocusedObject}"`);
        break;
      }
    }
  }
  
  // COMPREHENSIVE PRONOUN RESOLUTION: Enhanced with character context and safety
  const secondaryCharacters = await extractSecondaryCharactersFromSentence(sentence, sessionId, pageNumber);
  const detectedCharacters = extractCharacterNamesFromDescription(secondaryCharacters);
  const pronounResolved = resolvePronounsInSentence(sentence, originalPageText, detectedCharacters, sessionId, pageNumber);
  const processedSentence = pronounResolved || sentence;
  
  // First try to detect and resolve object + color combinations with context awareness
  const dynamicObjectColor = detectAndResolveObjectColor(processedSentence, originalPageText);
  if (dynamicObjectColor) {
    return dynamicObjectColor;
  }
  
  // Detect setting context for filtering
  const isIndoorScene = isIndoorContext(sentence);
  
  // ============= EMERGENCY RECOVERY: EXACT WORD PRESERVATION FOR OBJECTS =============
  const indoorObjects = {
    // FIXED: Preserve exact words from story - NO ENHANCEMENTS THAT CHANGE MEANING
    'book': ' book', 
    'toy': ' toy',
    'ball': ' ball', 
    'doll': ' doll', 
    'game': ' game',
    'puzzle': ' puzzle', 
    'blocks': ' blocks',
    'crayon': ' crayon', 
    'paper': ' paper',
    'pencil': ' pencil', 
    'computer': ' computer',
    'tablet': ' tablet', 
    'phone': ' phone',
    'water': ' water',
    'food': ' food',
    'clothes': ' clothes',
    'bed': ' bed',
    
    // Food items - EXACT WORD PRESERVATION
    'apple': ' apple',
    'banana': ' banana',
    'sandwich': ' sandwich',
    'cookie': ' cookie',
    'cake': ' cake',
    'pizza': ' pizza',
    'ice cream': ' ice cream',
    
    // Domestic birds only (indoor appropriate) - EXACT WORD PRESERVATION
    'parakeet': ' parakeet',
    'budgie': ' budgie', 
    'parrot': ' parrot',
    'canary': ' canary',
    'cockatiel': ' cockatiel',
    
    // Indoor pets - EXACT WORD PRESERVATION
    'dog': ' dog',
    'cat': ' cat',
    'rabbit': ' rabbit',
    'hamster': ' hamster',
    'fish': ' fish',
    'turtle': ' turtle',
    'guinea pig': ' guinea pig',
    
    // Indoor accessories - EXACT WORD PRESERVATION
    'hat': ' hat',
    'shoes': ' shoes',
    'glasses': ' glasses',
    'watch': ' watch',
    'backpack': ' backpack'
  };

  const outdoorObjects = {
    // EMERGENCY RECOVERY: EXACT WORD PRESERVATION FOR OUTDOOR OBJECTS
    'bike': ' bike',
    'swing': ' swing', 
    'slide': ' slide',
    'tree': ' tree', 
    'flower': ' flower',
    'grass': ' grass',
    'stick': ' stick',
    'rock': ' rock',
    
    // Level 1 Outdoor Objects (Garden/Nature) - EXACT WORD PRESERVATION
    'seeds': ' seeds',
    'plants': ' plants',
    'soil': ' soil',
    'watering can': ' watering can',
    
    // Recreation items - EXACT WORD PRESERVATION
    'kite': ' kite',
    'frisbee': ' frisbee',
    'soccer ball': ' soccer ball',
    'baseball': ' baseball',
    'basketball': ' basketball',
    
    // Wild birds - EXACT WORD PRESERVATION (outdoor context maintained)
    'bird': ' bird', 
    'robin': ' robin',
    'cardinal': ' cardinal',
    'crow': ' crow',
    'sparrow': ' sparrow',
    'blue jay': ' blue jay',
    'hawk': ' hawk',
    'eagle': ' eagle',
    'owl': ' owl',
    'duck': ' duck',
    'goose': ' goose',
    'swan': ' swan',
    
    // ============= BIRDS CONTEXT CLASSIFICATION SYSTEM =============
    // Wild birds (outdoor-only): robin, cardinal, sparrow, blue jay, hawk, eagle
    // Domestic birds (indoor appropriate): parakeet, budgie, parrot, canary, cockatiel
    
    // Wild animals - EXACT WORD PRESERVATION
    'butterfly': ' butterfly',
    'elephant': ' elephant',
    'lion': ' lion',
    'tiger': ' tiger',
    'monkey': ' monkey',
    'horse': ' horse',
    'deer': ' deer',
    'squirrel': ' squirrel',
    
    // Vehicles - EXACT WORD PRESERVATION
    'airplane': ' airplane',
    'helicopter': ' helicopter',
    'train': ' train',
    'boat': ' boat',
    'rocket': ' rocket',
    'fire truck': ' fire truck',
    'police car': ' police car'
  };

  // ============= BIRDS CONTEXT CLASSIFICATION FUNCTION =============
  function filterBirdsByContext(sentence: string, originalPageText?: string): boolean {
    const contextText = (originalPageText || sentence).toLowerCase();
    
    // Check for indoor keywords that would exclude wild birds
    const indoorKeywords = ['room', 'house', 'kitchen', 'bedroom', 'classroom', 'library', 'inside', 'indoor'];
    const isIndoorContext = indoorKeywords.some(keyword => contextText.includes(keyword));
    
    // Wild birds (outdoor-only)
    const wildBirds = ['robin', 'cardinal', 'sparrow', 'blue jay', 'hawk', 'eagle', 'owl'];
    const hasBird = wildBirds.some(bird => contextText.includes(bird));
    
    if (isIndoorContext && hasBird) {
      console.log('🚫 Birds Context Filter: Wild bird detected in indoor scene - filtered out');
      return false; // Exclude wild birds from indoor scenes
    }
    
    console.log('✅ Birds Context Filter: Context appropriate for detected birds');
    return true; // Allow birds in appropriate contexts
  }

  // Universal objects - EXACT WORD PRESERVATION
  const universalObjects = {
    'car': ' car', 
    'truck': ' truck'
  };

  // Choose appropriate object set based on context
  const objectMappings = isIndoorScene 
    ? { ...indoorObjects, ...universalObjects }
    : { ...outdoorObjects, ...universalObjects };
  
  console.log(`🏠 Context detection: ${isIndoorScene ? 'Indoor' : 'Outdoor'} scene detected`);
  
  // PHASE 3: Visual Focus Priority - Check visually focused object first
  if (visuallyFocusedObject) {
    for (const [object, description] of Object.entries(objectMappings)) {
      if (object.includes(visuallyFocusedObject) || visuallyFocusedObject.includes(object)) {
        console.log(`👁️ Visual focus match found: "${visuallyFocusedObject}" → "${object}"`);
        return description;
      }
    }
  }
  
  for (const [object, description] of Object.entries(objectMappings)) {
    if (lowerSentence.includes(object)) {
      // Apply birds context filtering
      const wildBirds = ['robin', 'cardinal', 'sparrow', 'blue jay', 'hawk', 'eagle', 'owl'];
      if (wildBirds.includes(object) && !filterBirdsByContext(sentence, originalPageText)) {
        console.log(`🚫 Bird filtered out: "${object}" not appropriate for current context`);
        continue; // Skip this bird
      }
      
      console.log(`🎯 Context-appropriate object detected: "${object}" → "${description}"`);
      return description;
    }
  }
  
  return '';
}

// Unified scene context detection using TIER_25_UNIFIED_VOCABULARY
function detectSceneContext(sentence: string): 'indoor' | 'outdoor' | 'neutral' {
  const lowerSentence = sentence.toLowerCase();
  
  // Check for explicit indoor indicators first
  for (const keyword of TIER_25_UNIFIED_VOCABULARY.contextDetection.indoor) {
    if (lowerSentence.includes(keyword)) {
      return 'indoor';
    }
  }
  
  // Check for explicit outdoor indicators
  for (const keyword of TIER_25_UNIFIED_VOCABULARY.contextDetection.outdoor) {
    if (lowerSentence.includes(keyword)) {
      return 'outdoor';
    }
  }
  
  // Return neutral if no specific context detected
  return 'neutral';
}

// FIXED: Proper context detection for "big blue bird" scenario
function isIndoorContext(sentence: string): boolean {
  const context = detectSceneContext(sentence);
  const lowerSentence = sentence.toLowerCase();
  
  // EXPLICIT OUTDOOR INDICATORS: Force outdoor context
  const outdoorKeywords = ['outdoor', 'outside', 'park', 'garden', 'tree', 'sky', 'grass', 'nature'];
  if (outdoorKeywords.some(keyword => lowerSentence.includes(keyword))) {
    console.log(`🏠 Context override: Detected explicit outdoor keyword - treating as outdoor`);
    return false; // Force outdoor
  }
  
  // BIRD CONTEXT LOGIC: Wild birds suggest outdoor setting
  const wildBirds = ['bird', 'robin', 'cardinal', 'sparrow', 'blue jay', 'hawk', 'eagle', 'owl'];
  if (wildBirds.some(bird => lowerSentence.includes(bird))) {
    console.log(`🏠 Context override: Wild bird detected - treating as outdoor`);
    return false; // Force outdoor for wild birds
  }
  
  // Original logic for explicit indoor contexts
  return context === 'indoor';
}

// ============= ENHANCED OBJECT DETECTION USING VISUALDETAILTRACKER INTEGRATION =============
// REPLACES: detectAndResolveObjectColor() with VisualDetailTracker integration for session consistency
async function detectAndResolveObjectColorWithTracking(sentence: string, sessionId: string, pageNumber: number = 1, originalPageText?: string): Promise<string> {
  // First analyze the sentence for new visual details
  try {
    const { VisualDetailTracker } = await import('../_shared/VisualDetailTracker.js');
    await VisualDetailTracker.analyzeTextForDetails(sessionId, sentence, pageNumber);
    
    // Get all stored colored objects for this session
    const storedObjects = await VisualDetailTracker.buildObjectDescription(sessionId);
    
    if (storedObjects) {
      console.log(`🎨 Retrieved stored objects for session ${sessionId}: ${storedObjects}`);
      return `, with ${storedObjects}`;
    }
  } catch (error) {
    console.warn(`⚠️ VisualDetailTracker integration failed, falling back to basic detection:`, error.message);
  }
  
  // Fallback to basic detection if VisualDetailTracker fails
  return detectAndResolveObjectColor(sentence, originalPageText);
}

// LEGACY FUNCTION: Keep for fallback compatibility
function detectAndResolveObjectColor(sentence: string, originalPageText?: string): string {
  const lowerSentence = sentence.toLowerCase();
  let detectedObject = '';
  let detectedColor = '';
  let detectedSize = '';
  
  // Detect setting context first (FIXED: Uses improved isIndoorContext)
  const isIndoorScene = isIndoorContext(sentence);
  
  // PHASE 1: Detect size adjectives first
  for (const size of SIZE_ADJECTIVES) {
    if (lowerSentence.includes(size)) {
      detectedSize = size;
      console.log(`📏 Size adjective detected: "${size}"`);
      break;
    }
  }
  
  // PHASE 2: Enhanced object detection with "bird" priority
  const priorityObjects = ['bird', 'blue bird']; // Priority for "big blue bird" scenarios
  
  for (const object of priorityObjects) {
    if (lowerSentence.includes(object)) {
      detectedObject = object;
      console.log(`🎯 Priority object detected: "${object}"`);
      break;
    }
  }
  
  // If no priority object, use context-filtered detection
  if (!detectedObject) {
    const contextAppropriateAnimals = isIndoorScene 
      ? TIER_25_UNIFIED_VOCABULARY.objectCategories.animals.filter(animal => 
          ['dog', 'cat', 'rabbit', 'hamster', 'guinea pig', 'parakeet', 'goldfish', 'turtle', 'ferret', 'chinchilla', 'hedgehog', 'rat', 'mouse', 'canary', 'cockatiel', 'budgie', 'parrot', 'fish', 'bear'].includes(animal)
        )
      : TIER_25_UNIFIED_VOCABULARY.objectCategories.animals; // All animals allowed outdoors
    
    // Build context-appropriate object list
    const contextAwareObjects = [
      ...TIER_25_UNIFIED_VOCABULARY.objectCategories.food,
      ...contextAppropriateAnimals,
      ...TIER_25_UNIFIED_VOCABULARY.objectCategories.vehicles,
      ...TIER_25_UNIFIED_VOCABULARY.objectCategories.toys,
      ...TIER_25_UNIFIED_VOCABULARY.objectCategories.tools,
      ...TIER_25_UNIFIED_VOCABULARY.objectCategories.nature,
      ...TIER_25_UNIFIED_VOCABULARY.objectCategories.clothing,
      ...TIER_25_UNIFIED_VOCABULARY.objectCategories.sports,
      ...TIER_25_UNIFIED_VOCABULARY.objectCategories.electronics,
      ...TIER_25_UNIFIED_VOCABULARY.objectCategories.furniture
    ];
    
    console.log(`🏠 Dynamic object detection: ${isIndoorScene ? 'Indoor' : 'Outdoor'} context, ${contextAwareObjects.length} objects available`);
    
    for (const object of contextAwareObjects) {
      if (lowerSentence.includes(object)) {
        detectedObject = object;
        console.log(`🎯 Context-filtered object detected: "${object}"`);
        break;
      }
    }
  }
  
  // PHASE 3: Detect color from expanded array
  for (const color of EXPANDED_COLOR_ARRAY) {
    if (lowerSentence.includes(color)) {
      detectedColor = color;
      console.log(`🎨 Color detected: "${color}"`);
      break;
    }
  }
  
  // ============= MASTER PLAN: EXACT KEYWORD PRESERVATION =============
  // Preserve exact word forms from pageText - critical for "bird" vs "birds" differentiation
  function getExactWordForm(object: string, originalText?: string): string {
    if (!originalText) return object;
    const lowerOriginal = originalText.toLowerCase();
    const lowerObject = object.toLowerCase();
    
    // Check for exact matches first (preserve exact form from pageText)
    const words = lowerOriginal.split(/\s+/);
    for (const word of words) {
      // Direct match
      if (word === lowerObject) return object;
      // Plural form exists in text
      if (word === lowerObject + 's') return object + 's';
      // Handle irregular plurals
      if (lowerObject === 'child' && word === 'children') return 'children';
      if (lowerObject === 'mouse' && word === 'mice') return 'mice';
      if (lowerObject === 'goose' && word === 'geese') return 'geese';
    }
    
    return object; // Return base form if no exact match found
  }
  
  // PHASE 4: Combine detected elements (size + color + object)
  if (detectedObject && detectedColor && detectedSize) {
    const exactForm = getExactWordForm(detectedObject, originalPageText);
    console.log(`🎯 ENHANCED: Full detection "${detectedSize} ${detectedColor} ${detectedObject}" → "${exactForm}"`);
    return `, with ${detectedSize} ${detectedColor} ${exactForm}`;
  }
  
  // If object and color detected (no size)
  if (detectedObject && detectedColor) {
    const exactForm = getExactWordForm(detectedObject, originalPageText);
    console.log(`🎯 MASTER PLAN: Preserved exact word form "${detectedObject}" → "${exactForm}" from pageText`);
    return `, with ${detectedColor} ${exactForm}`;
  }
  
  // If object and size detected (no color)  
  if (detectedObject && detectedSize) {
    const exactForm = getExactWordForm(detectedObject, originalPageText);
    console.log(`🎯 SIZE ENHANCED: "${detectedSize} ${detectedObject}" → "${exactForm}"`);
    return `, with ${detectedSize} ${exactForm}`;
  }
  
  // If only object detected, let Runware decide the color (exact word form preservation)
  if (detectedObject) {
    const exactForm = getExactWordForm(detectedObject, originalPageText);
    console.log(`🎯 MASTER PLAN: Preserved exact word form "${detectedObject}" → "${exactForm}" from pageText`);
    return `, with ${exactForm}`;
  }
  
  // If only color detected, let Runware decide what object to color
  if (detectedColor) {
    return '';
  }
  
  return '';
}

// Helper function to extract character names from descriptive string
function extractCharacterNamesFromDescription(description: string): string[] {
  if (!description) return [];
  
  const nameMap: { [key: string]: string } = {
    'caring mother': 'mom',
    'supportive father': 'dad', 
    'playful sister': 'sister',
    'energetic brother': 'brother',
    'cheerful friend': 'friend',
    'loyal dog companion': 'dog',
    'curious cat companion': 'cat',
    'singing bird companion': 'bird',
    'gentle rabbit companion': 'rabbit',
    'beloved pet companion': 'pet'
  };
  
  // Extract the base character type from description
  for (const [desc, name] of Object.entries(nameMap)) {
    if (description.includes(desc)) {
      return [name];
    }
  }
  
  return [];
}

// ============= TIER 2.5B SEMANTIC EXTRACTION FUNCTIONS =============
// Simple word matching functions for basic template semantic components

function extractSubject(pageText: string): string {
  const lowerText = pageText.toLowerCase();
  
  // Check for character names and descriptors
  const characters = TIER_25_UNIFIED_VOCABULARY.objectCategories.characters.descriptors;
  for (const character of characters) {
    if (lowerText.includes(character)) {
      return character;
    }
  }
  
  // Check for animals as subjects
  const animals = TIER_25_UNIFIED_VOCABULARY.objectCategories.animals;
  for (const animal of animals) {
    if (lowerText.includes(animal)) {
      return animal;
    }
  }
  
  // Check for common subject pronouns/nouns
  if (lowerText.includes('sally')) return 'Sally';
  if (lowerText.includes('child')) return 'child';
  if (lowerText.includes('kid')) return 'kid';
  if (lowerText.includes('boy')) return 'boy';
  if (lowerText.includes('girl')) return 'girl';
  
  return 'character'; // Safe fallback
}

function extractAction(pageText: string): string {
  const lowerText = pageText.toLowerCase();
  
  // Check all action categories in priority order
  const actionCategories = [
    TIER_25_UNIFIED_VOCABULARY.actions.basic,
    TIER_25_UNIFIED_VOCABULARY.actions.creative,
    TIER_25_UNIFIED_VOCABULARY.actions.sensory,
    TIER_25_UNIFIED_VOCABULARY.actions.states,
    TIER_25_UNIFIED_VOCABULARY.actions.fantasy,
    TIER_25_UNIFIED_VOCABULARY.actions.social
  ];
  
  for (const category of actionCategories) {
    for (const action of category) {
      if (lowerText.includes(action)) {
        return action;
      }
    }
  }
  
  return 'playing'; // Safe fallback
}

function extractSetting(pageText: string): string {
  const lowerText = pageText.toLowerCase();
  
  // Check setting categories in priority order
  const settingCategories = [
    TIER_25_UNIFIED_VOCABULARY.settings.specific,
    TIER_25_UNIFIED_VOCABULARY.settings.indoor,
    TIER_25_UNIFIED_VOCABULARY.settings.outdoor,
    TIER_25_UNIFIED_VOCABULARY.settings.fantasy
  ];
  
  for (const category of settingCategories) {
    for (const setting of category) {
      if (lowerText.includes(setting)) {
        return setting;
      }
    }
  }
  
  return 'outdoor space'; // Safe fallback
}

function extractAdjective(pageText: string): string {
  const lowerText = pageText.toLowerCase();
  
  // Check for color words (common adjectives)
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'black', 'white', 'brown', 'gray', 'silver', 'gold'];
  for (const color of colors) {
    if (lowerText.includes(color)) {
      return color;
    }
  }
  
  // Check character descriptors for adjectives
  const descriptors = TIER_25_UNIFIED_VOCABULARY.objectCategories.characters.descriptors;
  for (const descriptor of descriptors) {
    if (lowerText.includes(descriptor)) {
      return descriptor;
    }
  }
  
  // Check for size/descriptive adjectives
  const adjectives = ['big', 'small', 'tiny', 'huge', 'little', 'large', 'beautiful', 'pretty', 'nice', 'good', 'happy', 'bright', 'colorful'];
  for (const adjective of adjectives) {
    if (lowerText.includes(adjective)) {
      return adjective;
    }
  }
  
  return 'beautiful'; // Safe fallback
}

function extractEmotion(pageText: string): string {
  const lowerText = pageText.toLowerCase();
  
  // Check character emotions from vocabulary
  const emotions = TIER_25_UNIFIED_VOCABULARY.objectCategories.characters.emotions;
  for (const emotion of emotions) {
    if (lowerText.includes(emotion)) {
      return emotion;
    }
  }
  
  // Check for additional common emotions
  const additionalEmotions = ['joy', 'excited', 'cheerful', 'delighted', 'content', 'peaceful', 'calm', 'surprised'];
  for (const emotion of additionalEmotions) {
    if (lowerText.includes(emotion)) {
      return emotion;
    }
  }
  
  return 'happy'; // Safe fallback
}

// ============= SCENE CONTEXT ANALYZER - ENHANCED CONTEXT INTELLIGENCE =============

/**
 * Centralized Scene Context Analyzer for determining when to provide vs omit positioning details
 * Maps detected contexts to appropriate vocabulary selections and intelligence decisions
 */
class SceneContextAnalyzer {
  private pageText: string;
  private lowerText: string;
  
  constructor(pageText: string) {
    this.pageText = pageText;
    this.lowerText = pageText.toLowerCase();
  }
  
  /**
   * Analyze if the scene provides sufficient context for meaningful body language
   */
  hasBodyLanguageContext(): boolean {
    // Strong context indicators - actions that clearly suggest body language
    const strongActionIndicators = [
      'wake', 'waking', 'stretch', 'yawn', 'rub eyes',
      'walk', 'walking', 'confident', 'proud',
      'play', 'playing', 'excited', 'celebrate', 'jump', 'run',
      'sit', 'sitting', 'cross', 'legs', 'comfortable', 'relax',
      'stand', 'standing', 'tall', 'hands on hips',
      'smile', 'bright', 'wide', 'think', 'wonder', 'curious'
    ];
    
    return strongActionIndicators.some(indicator => this.lowerText.includes(indicator));
  }
  
  /**
   * Analyze if the scene provides sufficient context for meaningful spatial positioning
   */
  hasSpatialContext(): boolean {
    // Strong spatial context indicators - scenes with clear spatial relationships
    const strongSpatialIndicators = [
      // Bed/sleep context provides clear positioning
      'bed', 'sleep', 'wake', 'waking', 'lying', 'sit up',
      // Movement with direction provides positioning
      'walk to', 'move to', 'go to', 'toward', 'school', 'forward',
      // Activities with specific positioning
      'play with', 'crouch', 'kneel', 'ground', 'desk', 'table',
      // Explicit positional words
      'center', 'middle', 'front', 'foreground', 'left', 'right', 'background',
      'corner', 'above', 'over', 'under', 'beneath', 'between', 'on top'
    ];
    
    return strongSpatialIndicators.some(indicator => this.lowerText.includes(indicator));
  }
  
  /**
   * Determine the scene type for context-aware processing
   */
  getSceneType(): string {
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
  getContextualBodyLanguage(): string[] {
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
  getContextualSpatialPositioning(): string[] {
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

function extractActionIntensity(pageText: string): string {
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

function extractBodyLanguage(pageText: string): string {
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

function extractSpatialPositioning(pageText: string): string {
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

function extractObjectInteraction(pageText: string, actionObjects: string): string {
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

// ============= PHASE 4: SEEDED SELECTION FOR CONSISTENCY =============
// Generate consistent seeded random for character selection across story pages
function generateSeededRandom(seed: string): number {
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

// ============= SEEDED SECONDARY CHARACTER SYSTEM (REPLACES OLD extractSecondaryCharactersFromSentence) =============
async function getSeededSecondaryCharacters(sentence: string, sessionId?: string, pageNumber?: number): Promise<string> {
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
    const { CharacterConsistencyService } = await import('../_shared/CharacterConsistencyService.ts');
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

async function extractSecondaryCharactersFromSentence(sentence: string, sessionId?: string, pageNumber?: number): Promise<string> {
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
      let baseDescription = '';
      
      if (lowerName.includes('mom') || lowerName.includes('mother')) {
        baseDescription = 'caring mother';
      } else if (lowerName.includes('dad') || lowerName.includes('father')) {
        baseDescription = 'supportive father';
      } else if (lowerName.includes('friend')) {
        baseDescription = 'cheerful friend';
      } else if (lowerName.includes('grandma') || lowerName.includes('grandmother')) {
        baseDescription = 'wise grandmother';
      } else if (lowerName.includes('grandpa') || lowerName.includes('grandfather')) {
        baseDescription = 'kind grandfather';
      } else {
        baseDescription = `friendly ${name}`;
      }
      
      // ============= NEW: ENRICH WITH VISUAL DETAILS =============
      if (sessionId) {
        return await VisualDetailTracker.buildEnrichedSecondaryCharacter(sessionId, baseDescription, baseDescription);
      }
      return baseDescription;
    }));
    
    detectedCharacterElements.push(...enhancedNames);
    console.log(`✅ Extracted ${extractedNames.length} character names with enhanced visuals:`, enhancedNames);
  }
  
  // PHASE 2: SESSION-BASED CHARACTER CONTINUITY (if we don't have enough characters)
  if (detectedCharacterElements.length < 3 && sessionId) {
    const sessionCharacters = getSessionCharacterContext(sessionId, pageNumber);
    const additionalCharacters = sessionCharacters.filter(char => 
      !detectedCharacterElements.some(detected => detected.toLowerCase().includes(char.name.toLowerCase()))
    ).slice(0, 3 - detectedCharacterElements.length);
    
    if (additionalCharacters.length > 0) {
      const enhancedSessionChars = additionalCharacters.map(char => 
        char.description.includes('family') ? `loving ${char.description}` : `friendly ${char.description}`
      );
      detectedCharacterElements.push(...enhancedSessionChars);
      console.log(`✅ Added ${additionalCharacters.length} session characters with attributes:`, enhancedSessionChars);
    }
  }
  
  // PHASE 3: EXPANDED CHARACTER KEYWORD ARRAYS WITH VISUAL DESCRIPTORS (if still need more)
  if (detectedCharacterElements.length < 3) {
    const relationshipPatterns = [
      // FAMILY EXTENDED WITH DESCRIPTIVE ATTRIBUTES
      { pattern: /(?:my|your|his|her|their)\s+(mom|mother|mommy|mama)/gi, description: 'caring mother', type: 'human' },
      { pattern: /(?:my|your|his|her|their)\s+(dad|father|daddy|papa)/gi, description: 'supportive father', type: 'human' },
      { pattern: /(?:my|your|his|her|their)\s+(sister|sis)/gi, description: 'playful sister', type: 'human' },
      { pattern: /(?:my|your|his|her|their)\s+(brother|bro)/gi, description: 'adventurous brother', type: 'human' },
      { pattern: /(?:my|your|his|her|their)\s+(grandma|grandmother)/gi, description: 'wise grandmother', type: 'human' },
      { pattern: /(?:my|your|his|her|their)\s+(grandpa|grandfather)/gi, description: 'kind grandfather', type: 'human' },
      { pattern: /(?:my|your|his|her|their)\s+(aunt)/gi, description: 'friendly aunt', type: 'human' },
      { pattern: /(?:my|your|his|her|their)\s+(uncle)/gi, description: 'jovial uncle', type: 'human' },
      { pattern: /(?:my|your|his|her|their)\s+(cousin)/gi, description: 'enthusiastic cousin', type: 'human' },
      
      // COMMUNITY EXTENDED WITH DESCRIPTIVE ATTRIBUTES
      { pattern: /(?:my|your|his|her|their)\s+(friend|buddy|pal)/gi, description: 'cheerful friend', type: 'human' },
      { pattern: /(?:my|your|his|her|their)\s+(girlfriend)/gi, description: 'smiling girlfriend', type: 'human' },
      { pattern: /(?:my|your|his|her|their)\s+(boyfriend)/gi, description: 'happy boyfriend', type: 'human' },
      { pattern: /(?:my|your|his|her|their)\s+(neighbor)/gi, description: 'helpful neighbor', type: 'human' },
      { pattern: /(?:my|your|his|her|their)\s+(classmate)/gi, description: 'studious classmate', type: 'human' },
      { pattern: /(?:my|your|his|her|their)\s+(teammate)/gi, description: 'energetic teammate', type: 'human' },
      { pattern: /(?:my|your|his|her|their)\s+(coach)/gi, description: 'encouraging coach', type: 'human' },
      { pattern: /(?:my|your|his|her|their)\s+(teacher)/gi, description: 'patient teacher', type: 'human' },
      
      // ANIMALS EXTENDED WITH DESCRIPTIVE ATTRIBUTES
      { pattern: /(?:my|your|his|her|their)\s+(dog|puppy|pup)/gi, description: 'loyal family dog', type: 'animal' },
      { pattern: /(?:my|your|his|her|their)\s+(cat|kitten|kitty)/gi, description: 'curious pet cat', type: 'animal' },
      { pattern: /(?:my|your|his|her|their)\s+(bird|parrot)/gi, description: 'colorful pet bird', type: 'animal' },
      { pattern: /(?:my|your|his|her|their)\s+(rabbit|bunny)/gi, description: 'fluffy pet rabbit', type: 'animal' },
      { pattern: /(?:my|your|his|her|their)\s+(horse)/gi, description: 'gentle horse companion', type: 'animal' },
      { pattern: /(?:my|your|his|her|their)\s+(fish)/gi, description: 'swimming pet fish', type: 'animal' },
      { pattern: /(?:my|your|his|her|their)\s+(hamster)/gi, description: 'tiny pet hamster', type: 'animal' },
      { pattern: /(?:my|your|his|her|their)\s+(guinea pig)/gi, description: 'cute guinea pig', type: 'animal' },
      { pattern: /(?:my|your|his|her|their)\s+(turtle)/gi, description: 'slow pet turtle', type: 'animal' }
    ];
    
    // Process relationship patterns with enhanced descriptions
    for (const { pattern, description, type } of relationshipPatterns) {
      if (detectedCharacterElements.length >= 3) break; // Stop if we have 3 characters
      
      const matches = [...lowerSentence.matchAll(pattern)];
      for (const match of matches) {
        if (detectedCharacterElements.length >= 3) break;
        
        // ============= NEW: ENRICH WITH VISUAL DETAILS =============
        let enhancedDescription = description;
        if (sessionId) {
          enhancedDescription = await VisualDetailTracker.buildEnrichedSecondaryCharacter(sessionId, description, description);
        }
        
        if (!detectedCharacterElements.some(char => char.toLowerCase().includes(description.toLowerCase()))) {
          detectedCharacterElements.push(enhancedDescription);
          console.log(`✅ Added enhanced relationship character: ${enhancedDescription} (${type})`);
        }
      }
    }
  }
  
    // PHASE 4: ENHANCED FORMATTING WITH VISUAL DESCRIPTIONS AND CONSISTENCY TRACKING
    if (detectedCharacterElements.length === 0) {
      console.log(`🔍 No secondary characters found in: "${sentence}"`);
      return '';
    }
    
    // ============= PHASE 2 ENHANCEMENT: STORE DETECTED CHARACTERS FOR SESSION CONTINUITY =============
    if (sessionId && detectedCharacterElements.length > 0) {
      const charactersToStore = detectedCharacterElements.map((char, index) => {
        const isAnimal = char.toLowerCase().includes('dog') || char.toLowerCase().includes('cat') || 
                        char.toLowerCase().includes('bird') || char.toLowerCase().includes('rabbit') ||
                        char.toLowerCase().includes('fish') || char.toLowerCase().includes('hamster');
        return {
          name: char.replace(/^(caring|supportive|cheerful|wise|kind|friendly|playful|adventurous|loyal|curious|fluffy|gentle)\s+/, ''),
          description: char,
          type: isAnimal ? 'animal' : 'human',
          page: pageNumber || 1
        };
      });
      storeSessionCharacters(sessionId, charactersToStore);
      
      // Integrate with visual consistency system
      try {
        if (typeof getVisualDetailTracker === 'function') {
          const tracker = getVisualDetailTracker(sessionId);
          charactersToStore.forEach(char => {
            tracker.trackSecondaryCharacter(char.name, char.description, char.type);
          });
        }
      } catch (error) {
        console.log('⚠️ Visual consistency tracking not available:', error.message);
      }
    }
    
    // ============= ENHANCED GENERIC FALLBACK ELIMINATION =============
    const filteredCharacters = detectedCharacterElements.filter(char => {
      const lowerChar = char.toLowerCase();
      // Remove generic fallbacks but keep specific detected relationships
      return !lowerChar.includes('generic') && 
             !lowerChar.includes('placeholder') &&
             !(lowerChar === 'teacher' && !sentence.toLowerCase().includes('my teacher'));
    });
    
    if (filteredCharacters.length === 0) {
      console.log(`🔍 All characters filtered out as generic fallbacks`);
      return '';
    }
    
    // ============= NEW ENHANCED OUTPUT FORMAT =============
    // Instead of "with X and Y", use more descriptive format for better prompt integration
    let formattedElements = '';
    if (filteredCharacters.length === 1) {
      formattedElements = filteredCharacters[0];
    } else if (filteredCharacters.length === 2) {
      formattedElements = `${filteredCharacters[0]}, ${filteredCharacters[1]}`;
    } else if (filteredCharacters.length === 3) {
      formattedElements = `${filteredCharacters[0]}, ${filteredCharacters[1]}, ${filteredCharacters[2]}`;
    }
    
    console.log(`✅ Final enhanced secondary elements: "${formattedElements}"`);
    return formattedElements;
}

// PHASE 1: Enhanced Name Extraction Function
function extractCharacterNamesFromPageText(pageText: string, sessionId?: string): string[] {
  console.log(`🔍 Extracting character names from: "${pageText}"`);
  
  const extractedNames = [];
  
  // 1. Extract proper nouns (capitalized names) - Common names only
  const commonNames = [
    'Sarah', 'Jake', 'Tommy', 'Maya', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Lucas',
    'Sophia', 'Mason', 'Isabella', 'Ethan', 'Mia', 'Alexander', 'Charlotte', 'Jacob', 'Amelia',
    'Michael', 'Harper', 'Benjamin', 'Evelyn', 'Elijah', 'Abigail', 'James', 'Emily', 'William',
    'Elizabeth', 'Henry', 'Sofia', 'Owen', 'Avery', 'Sebastian', 'Ella', 'Jackson', 'Madison',
    'Aiden', 'Scarlett', 'Matthew', 'Victoria', 'Samuel', 'Aria', 'David', 'Grace', 'Joseph',
    'Chloe', 'Carter', 'Camila', 'Wyatt', 'Penelope', 'John', 'Riley', 'Jack', 'Layla', 'Luke'
  ];
  
  const namePattern = new RegExp(`\\b(${commonNames.join('|')})\\b`, 'gi');
  const nameMatches = [...pageText.matchAll(namePattern)];
  
  nameMatches.forEach(match => {
    const name = match[1];
    if (!extractedNames.includes(name.toLowerCase()) && extractedNames.length < 3) {
      extractedNames.push(name.toLowerCase());
    }
  });
  
  // 2. Check for relationship patterns with names
  const relationshipNamePatterns = [
    /(\w+)'s (mom|dad|sister|brother|friend)/gi,
    /(\w+) and (\w+)/gi,
    /(mom|dad|sister|brother|friend) (\w+)/gi
  ];
  
  relationshipNamePatterns.forEach(pattern => {
    const matches = [...pageText.matchAll(pattern)];
    matches.forEach(match => {
      if (extractedNames.length >= 3) return;
      
      // Extract potential names from relationship patterns
      if (match[1] && commonNames.some(name => name.toLowerCase() === match[1].toLowerCase())) {
        if (!extractedNames.includes(match[1].toLowerCase())) {
          extractedNames.push(match[1].toLowerCase());
        }
      }
      if (match[2] && commonNames.some(name => name.toLowerCase() === match[2].toLowerCase())) {
        if (!extractedNames.includes(match[2].toLowerCase()) && extractedNames.length < 3) {
          extractedNames.push(match[2].toLowerCase());
        }
      }
    });
  });
  
  console.log(`✅ Extracted names: ${extractedNames.length > 0 ? extractedNames.join(', ') : 'none'}`);
  return extractedNames;
}

// PHASE 2: Enhanced Session Character Context Function with Better Integration
function getSessionCharacterContext(sessionId: string, pageNumber?: number): Array<{name: string, description: string, type: string}> {
  try {
    console.log(`🔍 Enhanced session ${sessionId} character context check - Page: ${pageNumber}`);
    
    // Enhanced session storage for character continuity
    if (typeof globalArcSessionManager !== 'undefined') {
      const sessionData = globalArcSessionManager.getSession(sessionId);
      if (sessionData?.characters) {
        console.log(`✅ Found ${sessionData.characters.length} session characters`);
        return sessionData.characters.slice(0, 3); // Up to 3 characters
      }
    }
    
    // Memory-based character tracking for this session
    const sessionKey = `characters_${sessionId}`;
    const storedCharacters = sessionCharacterMemory.get(sessionKey);
    if (storedCharacters && storedCharacters.length > 0) {
      console.log(`✅ Found ${storedCharacters.length} memory-cached characters`);
      return storedCharacters.slice(0, 3);
    }
    
    console.log(`🔍 No session characters found for ${sessionId}`);
    return [];
  } catch (error) {
    console.warn('Session character context error:', error);
    return [];
  }
}

// Enhanced session memory for character continuity
const sessionCharacterMemory = new Map();

// Function to store characters in session memory
function storeSessionCharacters(sessionId: string, characters: Array<{name: string, description: string, type: string}>) {
  const sessionKey = `characters_${sessionId}`;
  sessionCharacterMemory.set(sessionKey, characters);
  console.log(`✅ Stored ${characters.length} characters for session ${sessionId}`);
}

// ============= MASTER PLAN PHASE 5: ENHANCED CAMERA DIRECTIVE WITH CONTEXT AWARENESS =============
function generateCameraDirective(difficulty: string, scene?: string, setting?: string): string {
  console.log(`🎯 Enhanced Camera Directive Generation - Difficulty: ${difficulty}, Scene: "${scene}", Setting: "${setting}"`);
  
  // PHASE 5: CONTEXT-AWARE CAMERA SELECTION based on scene type and setting
  const contextualCameraMap = {
    // INDOOR SCENES - Medium shots for intimate spaces
    indoor: "medium shot, eye level angle, comfortable indoor framing, warm interior lighting",
    classroom: "medium shot, eye level angle, educational environment framing, bright classroom lighting", 
    bedroom: "medium shot, eye level angle, cozy personal space framing, soft room lighting",
    kitchen: "medium shot, eye level angle, homey kitchen environment, natural indoor lighting",
    library: "medium shot, eye level angle, quiet study atmosphere, soft library lighting",
    
    // OUTDOOR SCENES - Wide shots for expansive environments  
    outdoor: "wide establishing shot, natural perspective, full environment visible, spacious outdoor perspective",
    park: "wide establishing shot, full park environment visible, natural outdoor lighting, expansive perspective",
    playground: "wide establishing shot, complete playground visible, dynamic outdoor perspective, full activity context",
    garden: "wide outdoor scene, full garden environment, natural outdoor lighting, botanical perspective",
    backyard: "wide outdoor shot, complete yard visible, natural perspective, residential outdoor setting",
    
    // ACTION SCENES - Dynamic angles with movement
    playing: "dynamic wide shot, full body movement visible, action perspective, complete activity context",
    running: "dynamic movement shot, full body visible, action tracking, wide angle for motion capture",
    sports: "dynamic action shot, full athletic movement, sports perspective, wide angle activity framing",
    dancing: "dynamic full body shot, complete dance movement, performance framing, wide angle dance perspective",
    
    // LEARNING SCENES - Focused but inclusive framing
    reading: "medium wide shot, focus on character and book, learning environment visible, educational framing",
    studying: "medium shot, study materials visible, focused learning environment, academic perspective",
    drawing: "medium wide shot, art activity visible, creative workspace framing, artistic perspective",
    writing: "medium shot, writing activity focus, educational environment, academic framing"
  };
  
  // Check for specific scene/setting contexts first
  if (scene && setting) {
    const combinedContext = `${scene.toLowerCase()} ${setting.toLowerCase()}`;
    
    for (const [context, directive] of Object.entries(contextualCameraMap)) {
      if (combinedContext.includes(context)) {
        console.log(`🎯 Context-matched camera directive: "${context}" → "${directive}"`);
        return directive;
      }
    }
  }
  
  // Check scene alone
  if (scene) {
    for (const [context, directive] of Object.entries(contextualCameraMap)) {
      if (scene.toLowerCase().includes(context)) {
        console.log(`🎯 Scene-matched camera directive: "${context}" → "${directive}"`);
        return directive;
      }
    }
  }
  
  // Check setting alone
  if (setting) {
    for (const [context, directive] of Object.entries(contextualCameraMap)) {
      if (setting.toLowerCase().includes(context)) {
        console.log(`🎯 Setting-matched camera directive: "${context}" → "${directive}"`);
        return directive;
      }
    }
  }
  
  // ENHANCED: Difficulty-based fallback with wide-angle priority
  const baseFallback = "full body shot, wide angle view, complete scene visible, spacious perspective";
  
  const difficultyEnhancements = {
    'beginner': baseFallback + ", simple composition, clear focus, child-friendly framing",
    'easy': baseFallback + ", welcoming framing, easy to understand perspective", 
    'medium': baseFallback + ", dynamic composition, engaging perspective, balanced framing",
    'hard': baseFallback + ", professional composition, detailed scene capture, artistic framing",
    'expert': baseFallback + ", cinematic composition, sophisticated framing, artistic excellence"
  };
  
  const finalDirective = difficultyEnhancements[difficulty] || baseFallback;
  console.log(`🎯 Enhanced context-aware camera directive: ${finalDirective}`);
  return finalDirective;
}

// UPDATED: Always Extract First 3 Sentences for All Levels 0-4
function extractFirstSentences(pageText: string, difficulty?: string): string {
  console.log(`🔍 Extracting first 3 sentences for all difficulty levels`);
  
  if (!pageText || pageText.trim() === '') {
    console.log('📝 Empty pageText, returning empty string');
    return '';
  }
  
  try {
    // Split by sentence boundaries (., !, ?) and take first 3 sentences for ALL levels
    const sentences = pageText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    
    if (sentences.length === 0) {
      console.log('📝 No sentences found, using full pageText');
      return pageText.trim();
    }
    
    // ALWAYS use first 3 sentences for all levels 0-4
    const extractedSentences = sentences.slice(0, 3);
    const result = extractedSentences.join('. ') + (extractedSentences.length > 0 ? '.' : '');
    
    console.log(`📝 Extracted ${extractedSentences.length} sentences for ${difficulty || 'all levels'}: "${result}"`);
    return result;
    
  } catch (error) {
    console.warn('⚠️ Sentence extraction failed, using full pageText:', error);
    return pageText.trim();
  }
}

// ============= ENHANCED TIER 2.5 SEMANTIC PLACEHOLDER EXTRACTION FUNCTIONS =============

// ============= ENHANCED ATMOSPHERIC ARRAYS FOR ROBUST FALLBACKS =============
const ENHANCED_WEATHER_PATTERNS = [
  // Stormy weather patterns
  'dramatic stormy atmosphere', 'moody overcast skies', 'gentle rain ambiance', 'misty fog atmosphere',
  'heavy storm clouds', 'light drizzle mood', 'thunderous dramatic skies', 'refreshing rain scene',
  
  // Time-specific patterns
  'early morning mist', 'noon blazing sun', 'twilight purple hues', 'midnight starry atmosphere',
  'dawn breaking light', 'midday bright warmth', 'evening golden hour', 'late night peaceful mood',
  
  // Seasonal contexts
  'spring bloom atmosphere', 'summer heat waves', 'autumn leaf patterns', 'winter snow peace',
  'spring fresh air', 'summer vibrant energy', 'autumn cozy warmth', 'winter crisp clarity',
  
  // Mood-based lighting
  'dramatic cinematic lighting', 'cozy intimate glow', 'mysterious shadow play', 'cheerful bright ambiance',
  'romantic soft lighting', 'energetic dynamic illumination', 'peaceful serene atmosphere', 'exciting vibrant glow'
];

const ENHANCED_TIME_DETECTION = [
  // Morning patterns
  'bright morning sunshine', 'early dawn light', 'fresh morning air', 'sunrise golden glow',
  
  // Midday patterns  
  'brilliant noon light', 'blazing midday sun', 'peak daylight brightness', 'high sun illumination',
  
  // Evening patterns
  'warm evening glow', 'sunset amber light', 'dusk purple atmosphere', 'twilight soft lighting',
  
  // Night patterns
  'gentle moonlight', 'starry night sky', 'peaceful night atmosphere', 'midnight serene glow'
];

/**
 * ENHANCED Extract atmosphere details with robust fallbacks for weather, time, seasons, and mood
 */
function extractAtmosphere(pageText: string, scene: string, setting: string): string {
  try {
    const text = (pageText + ' ' + scene + ' ' + setting).toLowerCase();
    const seed = pageText + scene + setting; // Use combined text as seed for consistency
    
    // ============= ENHANCED WEATHER PATTERN DETECTION =============
    // Stormy weather with sub-patterns
    if (text.match(/storm|thunder|lightning|heavy rain|downpour/)) {
      return getSeededRandomItem(['dramatic stormy atmosphere', 'moody overcast skies', 'thunderous dramatic skies'], seed + '_storm');
    }
    if (text.match(/fog|mist|haze|humid/)) {
      return getSeededRandomItem(['misty fog atmosphere', 'early morning mist', 'gentle misty air'], seed + '_fog');
    }
    if (text.match(/rain|drizzle|wet|precipitation/)) {
      return getSeededRandomItem(['gentle rain ambiance', 'light drizzle mood', 'refreshing rain scene'], seed + '_rain');
    }
    
    // ============= ENHANCED TIME-OF-DAY DETECTION =============
    if (text.match(/dawn|sunrise|early morning|morning light/)) {
      return getSeededRandomItem(ENHANCED_TIME_DETECTION.slice(0, 4), seed + '_morning');
    }
    if (text.match(/noon|midday|blazing sun|peak sun|high sun/)) {
      return getSeededRandomItem(ENHANCED_TIME_DETECTION.slice(4, 8), seed + '_noon');
    }
    if (text.match(/evening|sunset|dusk|twilight|amber hour/)) {
      return getSeededRandomItem(ENHANCED_TIME_DETECTION.slice(8, 12), seed + '_evening');
    }
    if (text.match(/night|midnight|stars|moon|nocturnal/)) {
      return getSeededRandomItem(ENHANCED_TIME_DETECTION.slice(12, 16), seed + '_night');
    }
    
    // ============= ENHANCED SEASONAL CONTEXT DETECTION =============
    if (text.match(/spring|bloom|fresh|new growth|budding|awakening/)) {
      return getSeededRandomItem(['spring bloom atmosphere', 'spring fresh air', 'renewed spring energy'], seed + '_spring');
    }
    if (text.match(/summer|hot|heat|blazing|sweltering|vibrant/)) {
      return getSeededRandomItem(['summer heat waves', 'summer vibrant energy', 'intense summer warmth'], seed + '_summer');
    }
    if (text.match(/autumn|fall|leaves|harvest|cozy|orange|brown/)) {
      return getSeededRandomItem(['autumn leaf patterns', 'autumn cozy warmth', 'harvest season glow'], seed + '_autumn');
    }
    if (text.match(/winter|snow|cold|frost|crisp|peaceful/)) {
      return getSeededRandomItem(['winter snow peace', 'winter crisp clarity', 'serene winter atmosphere'], seed + '_winter');
    }
    
    // ============= ENHANCED MOOD-BASED LIGHTING DETECTION =============
    if (text.match(/dramatic|intense|powerful|bold/)) {
      return getSeededRandomItem(['dramatic cinematic lighting', 'dramatic stormy atmosphere', 'intense atmospheric mood'], seed + '_dramatic');
    }
    if (text.match(/cozy|comfortable|warm|intimate|snug/)) {
      return getSeededRandomItem(['cozy intimate glow', 'warm comfortable lighting', 'snug atmospheric warmth'], seed + '_cozy');
    }
    if (text.match(/mysterious|secret|hidden|shadow|dark/)) {
      return getSeededRandomItem(['mysterious shadow play', 'enigmatic lighting mood', 'shadowy atmospheric mystery'], seed + '_mysterious');
    }
    if (text.match(/exciting|energetic|vibrant|dynamic|lively/)) {
      return getSeededRandomItem(['exciting vibrant glow', 'energetic dynamic illumination', 'lively atmospheric energy'], seed + '_exciting');
    }
    
    // ============= ENHANCED PURE LIGHTING DETECTION =============
    if (text.match(/sunny|bright|sunshine|golden|warm light|brilliant/)) {
      return getSeededRandomItem(UNIVERSAL_LIGHTING_ARRAYS.slice(0, 30), seed + '_lighting');
    }
    if (text.match(/cloudy|overcast|grey|dim|cool|soft|gentle/)) {
      return getSeededRandomItem(UNIVERSAL_LIGHTING_ARRAYS.slice(30, 51), seed + '_lighting');
    }
    
    // ============= ROBUST FALLBACK SYSTEM =============
    // Multiple fallback layers for maximum reliability
    if (text.match(/outdoor|outside|nature|environment/)) {
      return getSeededRandomItem(['bright natural lighting', 'cheerful outdoor atmosphere', 'pleasant environmental glow'], seed + '_outdoor');
    }
    if (text.match(/indoor|inside|room|home/)) {
      return getSeededRandomItem(['warm indoor lighting', 'cozy interior glow', 'comfortable room atmosphere'], seed + '_indoor');
    }
    
    // ============= ULTIMATE FALLBACK: ENHANCED DEFAULT =============
    const defaultOptions = ['bright golden lighting', 'cheerful warm atmosphere', 'pleasant natural glow', 'inviting soft lighting'];
    return getSeededRandomItem(defaultOptions, seed + '_ultimate_default');
    
  } catch (error) {
    console.warn('⚠️ Enhanced atmosphere extraction failed:', error);
    return ' with bright golden lighting'; // Emergency fallback
  }
}

// ============= ENHANCED COLOR DETECTION ARRAYS FOR VIVID OBJECT INTEGRATION =============
const VIVID_COLOR_PATTERNS = [
  // Primary colors with vibrancy
  'vibrant red', 'brilliant blue', 'sunny yellow', 'forest green', 'royal purple', 'bright orange',
  
  // Material-based colors
  'wooden brown', 'metallic silver', 'golden brass', 'copper shine', 'fabric patterns', 'ceramic white',
  'leather tan', 'glass crystal', 'stone gray', 'marble veins', 'silk shimmer', 'velvet deep tones',
  
  // Seasonal colors
  'autumn leaves orange', 'spring blossom pink', 'summer sky blue', 'winter snow white',
  'harvest gold', 'spring grass green', 'ocean wave blue', 'sunset coral',
  
  // Cultural color significance
  'festive celebration colors', 'traditional pattern colors', 'ceremonial bright hues', 'cultural textile colors',
  'holiday decoration colors', 'community banner colors', 'artistic expression colors', 'heritage pattern colors'
];

const ENHANCED_OBJECT_COLORS = {
  // Educational items with colors
  books: ['colorful storybooks', 'rainbow-bound books', 'bright educational materials', 'vibrant reading collections'],
  school: ['bright school supplies', 'colorful learning tools', 'rainbow educational kit', 'vivid study materials'],
  technology: ['sleek modern devices', 'bright-screen technology', 'colorful digital tools', 'illuminated tech gadgets'],
  
  // Creative items with colors
  art: ['rainbow art materials', 'vibrant painting supplies', 'colorful creative tools', 'bright artistic mediums'],
  music: ['gleaming musical instruments', 'colorful sound makers', 'bright melodic tools', 'vibrant music gear'],
  craft: ['rainbow craft supplies', 'colorful making materials', 'bright creative tools', 'vivid crafting kit'],
  
  // Play items with colors
  toys: ['bright colorful toys', 'rainbow play items', 'vivid game pieces', 'cheerful toy collection'],
  outdoor: ['colorful outdoor gear', 'bright sports equipment', 'vivid activity tools', 'rainbow recreation items'],
  comfort: ['soft colorful companions', 'rainbow cuddly friends', 'bright comfort items', 'vivid beloved toys']
};

/**
 * ENHANCED Extract props with vivid color integration and material detection
 */
function extractProps(pageText: string, scene: string): string {
  try {
    const text = (pageText + ' ' + scene).toLowerCase();
    const seed = pageText + scene; // For consistent color selection
    
    // ============= ENHANCED COLOR DETECTION FROM STORY TEXT =============
    let detectedColors = [];
    
    // Specific color detection with context
    if (text.match(/red|crimson|scarlet|ruby|cherry/)) detectedColors.push('vibrant red');
    if (text.match(/blue|azure|sapphire|navy|cobalt/)) detectedColors.push('brilliant blue');
    if (text.match(/green|emerald|jade|forest|lime/)) detectedColors.push('forest green');
    if (text.match(/yellow|golden|amber|sunshine|lemon/)) detectedColors.push('sunny yellow');
    if (text.match(/purple|violet|lavender|amethyst|plum/)) detectedColors.push('royal purple');
    if (text.match(/orange|coral|peach|tangerine|amber/)) detectedColors.push('bright orange');
    if (text.match(/pink|rose|blush|magenta|fuchsia/)) detectedColors.push('spring blossom pink');
    if (text.match(/brown|chocolate|coffee|wooden|mahogany/)) detectedColors.push('wooden brown');
    if (text.match(/silver|metallic|chrome|steel|aluminum/)) detectedColors.push('metallic silver');
    if (text.match(/gold|golden|brass|bronze|copper/)) detectedColors.push('golden brass');
    
    // ============= ENHANCED EDUCATIONAL PROPS WITH COLOR INTEGRATION =============
    if (text.match(/book|reading|story|page|library|novel/)) {
      const colorContext = detectedColors.length > 0 ? detectedColors[0] : getSeededRandomItem(['colorful', 'rainbow', 'bright'], seed);
      return ` with ${colorContext} storybooks and reading materials`;
    }
    if (text.match(/pencil|pen|writing|homework|notebook|journal/)) {
      const colorContext = detectedColors.length > 0 ? detectedColors[0] : getSeededRandomItem(ENHANCED_OBJECT_COLORS.school, seed);
      return ` with ${colorContext}`;
    }
    if (text.match(/computer|tablet|laptop|screen|digital|tech/)) {
      const colorContext = detectedColors.length > 0 ? `${detectedColors[0]} accented` : getSeededRandomItem(['sleek modern', 'bright-screen', 'colorful digital'], seed);
      return ` with ${colorContext} technology`;
    }
    
    // ============= ENHANCED CREATIVE PROPS WITH MATERIAL COLORS =============
    if (text.match(/paint|brush|art|drawing|canvas|palette/)) {
      const materialColor = getSeededRandomItem(['rainbow', 'vibrant', 'colorful', 'bright'], seed);
      const baseColor = detectedColors.length > 0 ? detectedColors[0] : materialColor;
      return ` with ${baseColor} art materials and creative supplies`;
    }
    if (text.match(/music|instrument|piano|guitar|violin|drums/)) {
      const materialFinish = getSeededRandomItem(['gleaming wooden', 'polished metallic', 'bright colorful', 'traditional crafted'], seed);
      return ` with ${materialFinish} musical instruments`;
    }
    if (text.match(/craft|glue|scissors|fabric|thread|pattern/)) {
      const craftColors = getSeededRandomItem(['rainbow', 'vibrant', 'traditional pattern', 'festive'], seed);
      return ` with ${craftColors} craft supplies and materials`;
    }
    
    // ============= ENHANCED PLAY PROPS WITH SEASONAL COLORS =============
    if (text.match(/ball|toy|game|puzzle|blocks|lego/)) {
      const playColors = detectedColors.length > 0 ? detectedColors[0] : getSeededRandomItem(['bright colorful', 'rainbow', 'cheerful', 'vivid'], seed);
      return ` with ${playColors} toys and games`;
    }
    if (text.match(/bike|scooter|skateboard|roller|outdoor/)) {
      const outdoorColors = getSeededRandomItem(['bright', 'colorful', 'vibrant', 'eye-catching'], seed);
      return ` with ${outdoorColors} outdoor equipment`;
    }
    if (text.match(/doll|stuffed|teddy|plush|comfort|soft/)) {
      const comfortColors = getSeededRandomItem(['soft colorful', 'cuddly', 'warm-toned', 'gentle'], seed);
      return ` with ${comfortColors} comfort items`;
    }
    
    // ============= SEASONAL AND CULTURAL COLOR INTEGRATION =============
    if (text.match(/spring|bloom|flower|fresh/)) {
      const springColors = getSeededRandomItem(['spring blossom', 'fresh green', 'blooming', 'renewal'], seed);
      return ` with ${springColors} seasonal items`;
    }
    if (text.match(/summer|sun|beach|vacation|hot/)) {
      const summerColors = getSeededRandomItem(['summer bright', 'sun-kissed', 'beach colorful', 'vacation vibrant'], seed);
      return ` with ${summerColors} summer items`;
    }
    if (text.match(/autumn|fall|harvest|orange|brown/)) {
      const autumnColors = getSeededRandomItem(['autumn leaves', 'harvest golden', 'warm earth tones', 'cozy'], seed);
      return ` with ${autumnColors} seasonal items`;
    }
    if (text.match(/winter|snow|frost|cold|white/)) {
      const winterColors = getSeededRandomItem(['winter white', 'frosted', 'crystal clear', 'snow bright'], seed);
      return ` with ${winterColors} winter items`;
    }
    
    // ============= CULTURAL COLOR SIGNIFICANCE =============
    if (text.match(/festival|celebration|party|ceremony|cultural/)) {
      const culturalColors = getSeededRandomItem(VIVID_COLOR_PATTERNS.slice(-8), seed); // Last 8 are cultural colors
      return ` with ${culturalColors}`;
    }
    
    return ''; // Optional placeholder - can be empty
  } catch (error) {
    console.warn('⚠️ Enhanced props extraction failed:', error);
    return ''; // Optional placeholder returns empty string
  }
}

// ============= ENHANCED SPATIAL POSITIONING ARRAYS FOR SECONDARY CHARACTERS =============
const SPATIAL_RELATIONSHIPS = [
  // Close proximity positioning
  'beside', 'next to', 'alongside', 'near', 'close to', 'adjacent to',
  
  // Directional positioning  
  'behind', 'in front of', 'to the left of', 'to the right of', 'above', 'below',
  
  // Group formation positioning
  'surrounding', 'gathered around', 'in a circle with', 'forming a line with', 'clustered with',
  
  // Interactive positioning
  'facing', 'looking toward', 'reaching toward', 'walking with', 'sitting with', 'standing with',
  
  // Distance contexts
  'close together with', 'spread out with', 'at a distance from', 'approaching', 'near but separate from'
];

const GROUP_FORMATION_PATTERNS = [
  // Circle formations
  'in a friendly circle', 'gathered in a circle', 'sitting in a circle', 'standing in a ring',
  
  // Line formations
  'standing in a line', 'walking in a line', 'sitting in a row', 'arranged in sequence',
  
  // Cluster formations
  'clustered together', 'grouped closely', 'huddled together', 'bunched up',
  
  // Interactive formations
  'facing each other', 'looking together', 'working together', 'playing together',
  
  // Natural formations
  'scattered naturally', 'positioned comfortably', 'arranged organically', 'flowing together'
];

/**
 * ENHANCED Extract community context with secondary character spatial positioning
 */
function extractCommunityContext(pageText: string, setting: string): string {
  try {
    const text = (pageText + ' ' + setting).toLowerCase();
    const seed = pageText + setting; // For consistent spatial selection
    
    // ============= ENHANCED SPATIAL RELATIONSHIP DETECTION =============
    let spatialContext = '';
    
    // Detect specific spatial keywords and enhance them
    if (text.match(/beside|next to|alongside|near|close/)) {
      spatialContext = getSeededRandomItem(['positioned beside', 'standing close to', 'situated near'], seed + '_beside');
    }
    if (text.match(/behind|in front|ahead|forward|back/)) {
      spatialContext = getSeededRandomItem(['positioned behind', 'standing in front of', 'arranged in front'], seed + '_directional');
    }
    if (text.match(/circle|around|surrounding|gathered/)) {
      spatialContext = getSeededRandomItem(GROUP_FORMATION_PATTERNS.slice(0, 4), seed + '_circle');
    }
    if (text.match(/line|row|sequence|ordered/)) {
      spatialContext = getSeededRandomItem(GROUP_FORMATION_PATTERNS.slice(4, 8), seed + '_line');
    }
    if (text.match(/together|group|cluster|bunch/)) {
      spatialContext = getSeededRandomItem(GROUP_FORMATION_PATTERNS.slice(8, 12), seed + '_cluster');
    }
    if (text.match(/facing|looking|watching|observing/)) {
      spatialContext = getSeededRandomItem(['facing each other', 'looking together', 'watching together'], seed + '_facing');
    }
    
    // ============= ENHANCED COMMUNITY EVENTS WITH SPATIAL CONTEXT =============
    if (text.match(/festival|celebration|party|gathering/)) {
      const spatialEnhancement = spatialContext || getSeededRandomItem(['gathered together for', 'celebrating together at', 'enjoying together during'], seed + '_celebration');
      return ` ${spatialEnhancement} a vibrant community celebration`;
    }
    if (text.match(/market|fair|bazaar|vendor/)) {
      const spatialEnhancement = spatialContext || getSeededRandomItem(['exploring together at', 'wandering through', 'discovering together at'], seed + '_market');
      return ` ${spatialEnhancement} a colorful community market`;
    }
    if (text.match(/parade|march|ceremony|procession/)) {
      const spatialEnhancement = spatialContext || getSeededRandomItem(['participating together in', 'watching together during', 'joining together for'], seed + '_parade');
      return ` ${spatialEnhancement} a community event`;
    }
    
    // ============= ENHANCED COMMUNITY SPACES WITH GROUP DYNAMICS =============
    if (text.match(/library|community center|hall|building/)) {
      const groupDynamic = spatialContext || getSeededRandomItem(['gathered together in', 'meeting together at', 'learning together in'], seed + '_space');
      return ` ${groupDynamic} a welcoming community space`;
    }
    if (text.match(/park|playground|garden|outdoor/)) {
      const outdoorDynamic = spatialContext || getSeededRandomItem(['playing together in', 'exploring together at', 'enjoying together in'], seed + '_outdoor');
      return ` ${outdoorDynamic} a shared community area`;
    }
    if (text.match(/school|classroom|cafeteria|educational/)) {
      const learningDynamic = spatialContext || getSeededRandomItem(['learning together in', 'studying together at', 'working together in'], seed + '_educational');
      return ` ${learningDynamic} an educational community setting`;
    }
    
    // ============= ENHANCED SOCIAL CONTEXTS WITH INTERACTION PATTERNS =============
    if (text.match(/friend|classmate|neighbor|peer/)) {
      const socialInteraction = spatialContext || getSeededRandomItem(['connecting with', 'interacting with', 'bonding with'], seed + '_social');
      return ` ${socialInteraction} community friends`;
    }
    if (text.match(/family|parent|sibling|relative/)) {
      const familyInteraction = spatialContext || getSeededRandomItem(['gathered with', 'spending time with', 'enjoying time with'], seed + '_family');
      return ` ${familyInteraction} family in a community setting`;
    }
    if (text.match(/teacher|coach|mentor|guide/)) {
      const mentorInteraction = spatialContext || getSeededRandomItem(['learning from', 'guided by', 'supported by'], seed + '_mentor');
      return ` ${mentorInteraction} community mentors`;
    }
    
    // ============= ENHANCED ACTIVITY-BASED SPATIAL CONTEXTS =============
    if (text.match(/sport|game|play|activity|exercise/)) {
      const activitySpatial = getSeededRandomItem(['playing together in', 'competing together during', 'exercising together at'], seed + '_activity');
      return ` ${activitySpatial} community activities`;
    }
    if (text.match(/music|art|performance|creative/)) {
      const creativeSpatial = getSeededRandomItem(['creating together in', 'performing together at', 'expressing together during'], seed + '_creative');
      return ` ${creativeSpatial} community arts`;
    }
    
    return ''; // Optional placeholder - can be empty
  } catch (error) {
    console.warn('⚠️ Enhanced community context extraction failed:', error);
    return ''; // Optional placeholder returns empty string
  }
}

// ============= ENHANCED SENSORY INTEGRATION ARRAYS =============
const ENHANCED_SENSORY_LAYERS = {
  sounds: {
    joyful: ['melodious laughter', 'cheerful giggles', 'delighted squeals', 'happy chatter'],
    musical: ['harmonious melodies', 'rhythmic beats', 'gentle singing', 'instrumental harmony'],
    nature: ['chirping birds', 'rustling leaves', 'flowing water', 'gentle breeze sounds'],
    ambient: ['peaceful atmosphere', 'serene background sounds', 'calming environmental audio', 'tranquil soundscape']
  },
  textures: {
    comfort: ['silky smooth surfaces', 'plush soft materials', 'cozy warm textures', 'gentle tactile comfort'],
    natural: ['organic surface textures', 'natural material feel', 'earth-connected textures', 'authentic surface quality'],
    crafted: ['carefully finished surfaces', 'artisan texture work', 'handmade material quality', 'skilled craft textures']
  },
  scents: {
    floral: ['garden bloom fragrances', 'sweet flower scents', 'natural botanical aromas', 'fresh petal essences'],
    culinary: ['appetizing food aromas', 'homemade cooking scents', 'delicious kitchen fragrances', 'comforting meal smells'],
    environmental: ['fresh outdoor air', 'clean natural scents', 'pure environmental fragrances', 'wholesome nature aromas']
  }
};

/**
 * ENHANCED Extract sensory details with layered immersion and cultural sensitivity
 */
function extractSensoryDetails(pageText: string, scene: string): string {
  try {
    const text = (pageText + ' ' + scene).toLowerCase();
    const seed = pageText + scene; // For consistent sensory selection
    
    let sensoryLayers = [];
    
    // ============= ENHANCED SOUND LAYER DETECTION =============
    if (text.match(/laugh|giggle|cheer|happy|joy|delight/)) {
      const joyfulSound = getSeededRandomItem(ENHANCED_SENSORY_LAYERS.sounds.joyful, seed + '_joy');
      sensoryLayers.push(`with ${joyfulSound}`);
    }
    if (text.match(/music|song|singing|melody|rhythm|harmony/)) {
      const musicalSound = getSeededRandomItem(ENHANCED_SENSORY_LAYERS.sounds.musical, seed + '_music');
      sensoryLayers.push(`with ${musicalSound}`);
    }
    if (text.match(/birds|chirp|nature|outdoor|forest|garden/)) {
      const natureSound = getSeededRandomItem(ENHANCED_SENSORY_LAYERS.sounds.nature, seed + '_nature');
      sensoryLayers.push(`with ${natureSound}`);
    }
    if (text.match(/water|stream|splash|ocean|rain|fountain/)) {
      const waterSounds = ['gentle water sounds', 'peaceful flowing water', 'soothing water motion', 'calming aquatic ambiance'];
      sensoryLayers.push(`with ${getSeededRandomItem(waterSounds, seed + '_water')}`);
    }
    
    // ============= ENHANCED TEXTURE LAYER DETECTION =============
    if (text.match(/soft|smooth|fluffy|silky|gentle|comfortable/)) {
      const comfortTexture = getSeededRandomItem(ENHANCED_SENSORY_LAYERS.textures.comfort, seed + '_comfort');
      sensoryLayers.push(`featuring ${comfortTexture}`);
    }
    if (text.match(/rough|bumpy|rocky|textured|natural|organic/)) {
      const naturalTexture = getSeededRandomItem(ENHANCED_SENSORY_LAYERS.textures.natural, seed + '_natural');
      sensoryLayers.push(`featuring ${naturalTexture}`);
    }
    if (text.match(/warm|cozy|welcoming|inviting|embracing/)) {
      const warmthTextures = ['warming tactile comfort', 'cozy material embrace', 'welcoming surface warmth', 'inviting textural comfort'];
      sensoryLayers.push(`featuring ${getSeededRandomItem(warmthTextures, seed + '_warmth')}`);
    }
    if (text.match(/craft|handmade|artisan|created|built/)) {
      const craftedTexture = getSeededRandomItem(ENHANCED_SENSORY_LAYERS.textures.crafted, seed + '_crafted');
      sensoryLayers.push(`featuring ${craftedTexture}`);
    }
    
    // ============= ENHANCED SCENT LAYER DETECTION =============
    if (text.match(/flower|garden|bloom|botanical|floral|petal/)) {
      const floralScent = getSeededRandomItem(ENHANCED_SENSORY_LAYERS.scents.floral, seed + '_floral');
      sensoryLayers.push(`enhanced by ${floralScent}`);
    }
    if (text.match(/food|cooking|baking|kitchen|meal|delicious/)) {
      const culinaryScent = getSeededRandomItem(ENHANCED_SENSORY_LAYERS.scents.culinary, seed + '_culinary');
      sensoryLayers.push(`enhanced by ${culinaryScent}`);
    }
    if (text.match(/ocean|sea|beach|coastal|marine/)) {
      const oceanScents = ['fresh ocean air', 'salt-kissed sea breeze', 'coastal atmospheric freshness', 'marine environment clarity'];
      sensoryLayers.push(`enhanced by ${getSeededRandomItem(oceanScents, seed + '_ocean')}`);
    }
    if (text.match(/forest|tree|pine|woodland|natural/)) {
      const forestScents = ['natural woodland aromas', 'fresh forest air', 'pine-scented atmosphere', 'woodland environmental freshness'];
      sensoryLayers.push(`enhanced by ${getSeededRandomItem(forestScents, seed + '_forest')}`);
    }
    
    // ============= SEASONAL SENSORY ENHANCEMENT =============
    if (text.match(/spring|fresh|new|growth|renewal/)) {
      const springScents = ['fresh spring air', 'renewal atmospheric quality', 'new growth fragrances', 'spring awakening scents'];
      sensoryLayers.push(`enhanced by ${getSeededRandomItem(springScents, seed + '_spring')}`);
    }
    if (text.match(/summer|warm|hot|sunny|vibrant/)) {
      const summerScents = ['warm summer air', 'sun-warmed atmospheric quality', 'summer heat fragrances', 'vibrant season scents'];
      sensoryLayers.push(`enhanced by ${getSeededRandomItem(summerScents, seed + '_summer')}`);
    }
    if (text.match(/autumn|fall|harvest|cozy|comfortable/)) {
      const autumnScents = ['autumn harvest aromas', 'cozy seasonal air', 'fall comfort fragrances', 'harvest-time scents'];
      sensoryLayers.push(`enhanced by ${getSeededRandomItem(autumnScents, seed + '_autumn')}`);
    }
    if (text.match(/winter|crisp|clean|clear|fresh/)) {
      const winterScents = ['crisp winter air', 'clean seasonal atmosphere', 'winter clarity fragrances', 'fresh cold-weather scents'];
      sensoryLayers.push(`enhanced by ${getSeededRandomItem(winterScents, seed + '_winter')}`);
    }
    
    // ============= LAYERED SENSORY COMBINATION =============
    if (sensoryLayers.length > 1) {
      // Combine multiple sensory layers for rich experience
      return ` ${sensoryLayers.slice(0, 2).join(' and ')}`; // Limit to 2 layers for clarity
    } else if (sensoryLayers.length === 1) {
      return ` ${sensoryLayers[0]}`;
    }
    
    return ''; // Optional placeholder - can be empty
  } catch (error) {
    console.warn('⚠️ Enhanced sensory details extraction failed:', error);
    return ''; // Optional placeholder returns empty string
  }
}

// ============= ENHANCED SECONDARY CHARACTER SPATIAL POSITIONING FUNCTION =============

/**
 * ENHANCED Process secondary elements with spatial positioning and visual consistency
 * Now integrates with the new descriptive secondary elements format
 */
function enhanceSecondaryCharacterPositioning(secondaryCharacters: string, pageText: string, scene: string): string {
  if (!secondaryCharacters || !secondaryCharacters.trim()) {
    return '';
  }
  
  try {
    const text = (pageText + ' ' + scene).toLowerCase();
    const seed = secondaryCharacters + pageText + scene;
    
    // Handle the new descriptive format (no "with" prefix needed)
    const cleanCharacters = secondaryCharacters.trim();
    if (!cleanCharacters) return '';
    
    // ============= ENHANCED SPATIAL RELATIONSHIP DETECTION =============
    let spatialPositioning = '';
    
    if (text.match(/beside|next to|alongside|near|close/)) {
      spatialPositioning = getSeededRandomItem(['positioned beside the main character', 'standing close nearby', 'situated near'], seed + '_beside');
    } else if (text.match(/behind|in front|ahead|forward|back/)) {
      spatialPositioning = getSeededRandomItem(['positioned behind', 'standing in the foreground', 'arranged thoughtfully'], seed + '_directional');
    } else if (text.match(/circle|around|surrounding|gathered/)) {
      spatialPositioning = getSeededRandomItem(['gathered around', 'surrounding naturally', 'arranged in a welcoming circle'], seed + '_circle');
    } else if (text.match(/line|row|sequence|ordered/)) {
      spatialPositioning = getSeededRandomItem(['standing in a line', 'arranged in sequence', 'positioned in an organized row'], seed + '_line');
    } else if (text.match(/together|group|cluster|bunch/)) {
      spatialPositioning = getSeededRandomItem(['clustered together naturally', 'grouped harmoniously', 'bunched together warmly'], seed + '_cluster');
    } else if (text.match(/facing|looking|watching|observing/)) {
      spatialPositioning = getSeededRandomItem(['facing toward the action', 'looking on with interest', 'watching together'], seed + '_facing');
    } else if (text.match(/play|game|activity|sport/)) {
      spatialPositioning = getSeededRandomItem(['actively engaged', 'participating together', 'involved in the activity'], seed + '_activity');
    } else {
      // Default spatial relationships optimized for descriptive elements
      const defaultSpatials = ['positioned naturally with', 'harmoniously arranged with', 'thoughtfully placed with', 'warmly accompanied by'];
      spatialPositioning = getSeededRandomItem(defaultSpatials, seed + '_default');
    }
    
    // ============= ENHANCED GROUP FORMATION WITH VISUAL COHESION =============
    let groupFormation = '';
    
    if (text.match(/conversation|talk|discuss|chat/)) {
      groupFormation = ', all engaged in animated conversation';
    } else if (text.match(/learn|study|read|discover/)) {
      groupFormation = ', sharing a learning moment together';
    } else if (text.match(/create|build|make|craft/)) {
      groupFormation = ', working creatively as a team';
    } else if (text.match(/explore|adventure|discover|journey/)) {
      groupFormation = ', exploring with shared curiosity';
    } else if (text.match(/celebrate|party|festival|joy/)) {
      groupFormation = ', celebrating joyfully together';
    } else {
      const defaultFormations = [', interacting with natural warmth', ', connected in the moment', ', sharing the experience', ', engaged harmoniously'];
      groupFormation = getSeededRandomItem(defaultFormations, seed + '_formation');
    }
    
    // ============= FINAL ENHANCED INTEGRATION =============
    // New format: "positioned naturally with caring mother, cheerful friend, all engaged harmoniously"
    return `${spatialPositioning} ${cleanCharacters}${groupFormation}`;
    
  } catch (error) {
    console.warn('⚠️ Secondary element spatial positioning failed:', error);
    return `with ${secondaryCharacters}`;
  }
}

// ============= SEEDED SECONDARY CHARACTER POSITIONING (REPLACES enhanceSecondaryCharacterPositioning) =============
function enhanceSeededSecondaryCharacterPositioning(secondaryChars: string, pageText: string, scene: string, sessionId?: string): string {
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

// ============= END ENHANCED TIER 2.5 SEMANTIC PLACEHOLDER EXTRACTION FUNCTIONS =============

// ============= BASIC TEMPLATE EXTRACTION FUNCTIONS (TIER 1.5 / 2.5B) =============
/**
 * Limit pageText to maximum 3 sentences for basic templates
 */
function limitPageTextToThreeSentences(pageText: string): string {
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
function extractBasicSetting(pageText: string): string {
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
function extractBasicAction(pageText: string): string {
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
function extractBasicObjects(pageText: string): string {
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
function extractSimpleSecondaryCharacters(pageText: string): string {
  try {
    if (!pageText || typeof pageText !== 'string') return '';
    
    const text = pageText.toLowerCase();
    const found: string[] = [];
    
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
  difficulty: string,
  userInfo: any,
  pageText: string,
  localAvatarIdentity?: any,
  scene?: string,
  setting?: string,
  objects?: string,
  secondary_characters?: string
): string {
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
  difficulty: string,
  userInfo: any,
  scene: string,
  setting: string,
  objects: string,
  secondary_characters: string,
  emotion: string,
  pageText: string,
  avatarIdentity?: any,
  spatialComposition?: string,
  atmosphereContext?: string
): string {
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
      const { VisualDetailTracker } = await import('../_shared/VisualDetailTracker.js');
      await VisualDetailTracker.analyzeTextForDetails(
        sessionId || 'tier25-session', 
        pageText || processedPageText, 
        userInfo?.pageNumber || 1, 
        finalMapping?.character || 'child'
      );
      console.log(`🔍 Tier 2.5A: Page text analyzed for visual details`);
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
function enhanceSeededSecondaryCharacterPositioning(secondaryChars: string, pageText: string, scene: string, sessionId?: string): string {
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
      const { VisualDetailTracker } = await import('../_shared/VisualDetailTracker.js');
      await VisualDetailTracker.analyzeTextForDetails(
        sessionId || 'fallback-session', 
        pageText, 
        1, // Default to page 1 for tier 2.5A
        userInfo?.avatar?.type || 'child'
      );
      console.log(`🔍 Tier 2.5A: Page text analyzed for visual details`);
    } catch (error) {
      console.warn(`⚠️ Tier 2.5A: Visual detail analysis failed:`, error.message);
    }
    
    // ============= NEW: COLORED OBJECTS INTEGRATION =============
    // Add persistent colored objects from VisualDetailTracker BEFORE template processing
    let coloredObjects = '';
    try {
      const { VisualDetailTracker } = await import('../_shared/VisualDetailTracker.js');
      const storedObjects = await VisualDetailTracker.buildObjectDescription(sessionId || 'fallback-session');
      coloredObjects = storedObjects || '';
      
      if (coloredObjects) {
        console.log(`🎨 Tier 2.5A: Integrated colored objects: ${coloredObjects}`);
      }
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
function validateTemplateCompletion(template: string): { isValid: boolean, issues: string[] } {
  const issues: string[] = [];
  
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
function validateCharacterConsistency(characterData: any, avatarMapping: any): { isValid: boolean, issues: string[] } {
  const issues: string[] = [];
  
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
function validateVisualElements(sceneData: any, objects: string, setting: string): { isValid: boolean, issues: string[] } {
  const issues: string[] = [];
  
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
function validateSceneComplexity(sceneData: any, pageText: string): { isValid: boolean, issues: string[] } {
  const issues: string[] = [];
  
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
function removeEmptySections(template: string): string {
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

// CRITICAL FIX: Removed duplicate fillBasicTemplate function declaration
// The function is already declared above with different parameters at line 3654
// This duplicate declaration was causing "Identifier 'fillBasicTemplate' has already been declared" error

function getCharacterEthnicity(userInfo: any, avatarIdentity?: any): string {
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
function generateEmergencyPrompt(userInfo: any): string {
  const gender = userInfo?.avatar?.type === 'girl' ? 'girl' : 
                userInfo?.avatar?.type === 'boy' ? 'boy' : 'child';
  
  return `An attractive ${gender} in a portrait style photo with main character focus. Beautiful children's book illustration, warm lighting, cheerful atmosphere, high quality, detailed art.`;
}

// ============= HELPER FUNCTIONS =============

// ENHANCED CLOTHING DETECTION WITH COLOR SYSTEM
function detectClothingFromStory(text: string): string {
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
function detectAndResolveClothingColor(text: string): string {
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

// ============= SIMPLIFIED PROMPT PROCESSING (No Complex Truncation) =============
function processPromptForRunware(prompt: string, difficulty: string): string {
  if (!prompt) return prompt;
  
  console.log(`🛡️ Tier 2.5: Simplified processing - letting Runware handle final length (${prompt.length} chars for ${difficulty})`);
  
  // No truncation needed - smart sentence extraction already handled in template filling
  // Total prompts should be ~800-1200 chars well under Runware's limits  
  return prompt;
}

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
function applyCulturalSettingEnhancement(baseSetting: string, userInfo: any, avatarIdentity?: any): string {
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
function applyContextAwareEnhancement(currentValue: string, exactWord: string, type: 'action' | 'objects' | 'setting'): string {
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
function getCulturalLandmarks(language: string, isIndoor: boolean = false, isOutdoor: boolean = false): string[] {
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

function detectCulturalProfile(userInfo: any, avatarIdentity?: any): string {
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

function detectEmotionFromText(text: string): string {
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

serve(async (req: Request) => {
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
        const { CharacterConsistencyService } = await import('../_shared/CharacterConsistencyService.ts');
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
      
      const resolveOnce = (response: Response) => {
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