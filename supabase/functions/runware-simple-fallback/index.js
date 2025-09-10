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

// ============= UNIVERSAL SETTINGS FOR CONTEXTUAL CONSISTENCY =============
const UNIVERSAL_INDOOR_SETTINGS = [
  // Core Living Spaces (20)
  'cozy reading corner with soft armchair', 'bright family kitchen with wooden table', 'comfortable bedroom with colorful pillows',
  'welcoming living room with plush sofa', 'organized study room with desk and books', 'creative art room with supplies everywhere',
  'peaceful nursery with gentle lighting', 'spacious dining room with family table', 'warm basement playroom with toys',
  'sunny breakfast nook with cushioned bench', 'quiet attic space with skylights', 'inviting guest room with clean linens',
  'functional laundry room with folding table', 'elegant parlor with vintage furniture', 'modern open-plan living area',
  'traditional farmhouse kitchen with island', 'cozy cabin interior with fireplace', 'bright sunroom with large windows',
  'well-appointed home office with computer', 'charming cottage living space',

  // Educational & Learning Spaces (15)
  'bright elementary school classroom', 'quiet library with tall bookshelves', 'colorful preschool playroom with mats',
  'well-equipped science laboratory', 'spacious gymnasium with equipment', 'cozy school library corner',
  'modern computer lab with monitors', 'creative art classroom with easels', 'music room with various instruments',
  'school cafeteria with long tables', 'principal\'s office with friendly décor', 'nurse\'s office with examination table',
  'speech therapy room with games', 'counselor\'s office with comfortable chairs', 'special education classroom with resources',

  // Community & Public Spaces (15)
  'busy shopping mall with bright lights', 'local community center with activities', 'neighborhood fire station with trucks',
  'friendly police station with lobby', 'modern hospital waiting room', 'cozy dental office with toys',
  'welcoming doctor\'s office with magazines', 'cheerful pediatric clinic with decorations', 'local post office with counters',
  'community bank with friendly tellers', 'neighborhood grocery store aisles', 'bustling restaurant dining room',
  'quiet café with comfortable seating', 'local bakery with display cases', 'friendly barbershop with mirrors'
];

const UNIVERSAL_OUTDOOR_SETTINGS = [
  'beautiful garden with blooming flowers', 'spacious park with tall green trees',
  'colorful playground with fun equipment', 'peaceful meadow with wildflowers',
  'sandy beach with gentle waves', 'forest clearing with dappled sunlight',
  'backyard with green grass and blue sky', 'flower field with butterflies dancing',
  'tree-lined path with natural beauty', 'open field with rolling hills'
];

// ============= TIER 2.5 UNIFIED VOCABULARY SYSTEM =============
const TIER_25_UNIFIED_VOCABULARY = {
  actions: {
    basic: [
      'run', 'runs', 'ran', 'running', 'jump', 'jumps', 'jumped', 'jumping', 
      'walk', 'walks', 'walked', 'walking', 'play', 'plays', 'played', 'playing',
      'dance', 'dances', 'danced', 'dancing', 'climb', 'climbs', 'climbed', 'climbing',
      'throw', 'throws', 'threw', 'throwing', 'catch', 'catches', 'caught', 'catching',
      'swim', 'swims', 'swam', 'swimming', 'slide', 'slides', 'slid', 'sliding',
      'roll', 'rolls', 'rolled', 'rolling', 'hide', 'hides', 'hid', 'hiding',
      'dig', 'digs', 'dug', 'digging', 'kick', 'kicks', 'kicked', 'kicking'
    ],
    creative: [
      'draw', 'draws', 'drew', 'drawing', 'write', 'writes', 'wrote', 'writing',
      'build', 'builds', 'built', 'building', 'create', 'creates', 'created', 'creating',
      'paint', 'paints', 'painted', 'painting', 'read', 'reads', 'reading',
      'cook', 'cooks', 'cooked', 'cooking', 'study', 'studies', 'studied', 'studying'
    ],
    sensory: [
      'see', 'sees', 'saw', 'seeing', 'hear', 'hears', 'heard', 'hearing',
      'feel', 'feels', 'felt', 'feeling', 'smell', 'smells', 'smelled', 'smelling',
      'taste', 'tastes', 'tasted', 'tasting', 'touch', 'touches', 'touched', 'touching'
    ],
    states: [
      'wake', 'wakes', 'woke', 'waking', 'sleep', 'sleeps', 'slept', 'sleeping',
      'lay', 'lays', 'laid', 'laying', 'sit', 'sits', 'sat', 'sitting',
      'stand', 'stands', 'stood', 'standing', 'lie', 'lies', 'lying'
    ],
    fantasy: [
      'fly', 'flies', 'flew', 'flying', 'float', 'floats', 'floated', 'floating',
      'magic', 'magical', 'transform', 'transforms', 'transformed', 'transforming',
      'disappear', 'disappears', 'disappeared', 'disappearing', 'sparkle', 'sparkles', 'sparkling',
      'glow', 'glows', 'glowed', 'glowing', 'enchant', 'enchants', 'enchanted', 'enchanting'
    ],
    social: [
      'help', 'helps', 'helped', 'helping', 'share', 'shares', 'shared', 'sharing',
      'laugh', 'laughs', 'laughed', 'laughing', 'smile', 'smiles', 'smiled', 'smiling',
      'hug', 'hugs', 'hugged', 'hugging', 'explore', 'explores', 'explored', 'exploring'
    ]
  },
  settings: {
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
      'river', 'lake', 'ocean', 'sea', 'pond', 'stream',
      'path', 'trail', 'road', 'street',
      'nature', 'tree', 'grass', 'flower', 'sky', 'sun', 'moon', 'star', 'cloud', 'rain', 'snow', 'wind',
      'outdoor', 'outside', 'running', 'walking', 'hiking', 'climbing', 'swimming', 'fishing', 'camping', 'picnic', 'sports', 'exploring', 'advocating'
    ],
    specific: [
      'hill', 'park', 'playground', 'garden', 'room', 'house', 'kitchen', 'bedroom', 
      'classroom', 'library', 'forest', 'beach', 'field', 'yard', 'backyard', 
      'school', 'store', 'hospital', 'restaurant'
    ],
    fantasy: [
      'enchanted forest', 'magical castle', 'crystal cave', 'floating island', 
      'wizard tower', 'fairy garden', 'rainbow bridge', 'starry sky', 'mystical grove'
    ]
  },
  objects: {
    everyday: ['book', 'toy', 'ball', 'cup', 'spoon', 'chair', 'table', 'bag', 'box', 'pencil', 'paper'],
    nature: ['flower', 'tree', 'rock', 'leaf', 'stick', 'shell', 'feather', 'berry', 'acorn', 'pine cone'],
    animals: ['dog', 'cat', 'bird', 'fish', 'butterfly', 'rabbit', 'squirrel', 'turtle', 'frog', 'bee'],
    fantasy: ['wand', 'crown', 'gem', 'crystal', 'potion', 'spell book', 'magic carpet', 'fairy wings']
  },
  emotions: {
    positive: ['happy', 'excited', 'joyful', 'cheerful', 'content', 'delighted', 'amazed', 'proud', 'grateful', 'peaceful'],
    curious: ['curious', 'interested', 'wondering', 'intrigued', 'fascinated', 'puzzled', 'thoughtful'],
    gentle: ['calm', 'gentle', 'patient', 'kind', 'caring', 'loving', 'tender', 'compassionate']
  }
};

// ============= NUCLEAR AVATAR MAPPING CONSTANTS =============
const NUCLEAR_AVATAR_MAPPINGS = {
  'boy-pale': { character: 'young boy', hair: 'red hair', features: 'attractive child character with pale complexion' },
  'boy-light': { character: 'young boy', hair: 'blonde hair', features: 'attractive child character with light skin' },
  'boy-medium': { character: 'young boy', hair: 'brown hair', features: 'attractive child character with medium skin' },
  'boy-olive': { character: 'young boy', hair: 'black hair', features: 'attractive child character with olive complexion' },
  'boy-dark': { character: 'young boy', hair: 'textured natural hair', features: 'attractive child character' },
  'girl-pale': { character: 'young girl', hair: 'red hair', features: 'attractive child character with pale complexion' },
  'girl-light': { character: 'young girl', hair: 'blonde hair', features: 'attractive child character with light skin' },
  'girl-medium': { character: 'young girl', hair: 'brown hair', features: 'attractive child character with medium skin' },
  'girl-olive': { character: 'young girl', hair: 'black hair', features: 'attractive child character with olive complexion' },
  'girl-dark': { character: 'young girl', hair: 'textured natural hair', features: 'attractive child character' },
  'neutral-pale': { character: 'child', hair: 'neat hair', features: 'attractive child character with pale complexion' },
  'neutral-light': { character: 'child', hair: 'neat hair', features: 'attractive child character with light skin' },
  'neutral-medium': { character: 'child', hair: 'neat hair', features: 'attractive child character with medium skin' },
  'neutral-olive': { character: 'child', hair: 'neat hair', features: 'attractive child character with olive complexion' },
  'neutral-dark': { character: 'child', hair: 'textured natural hair', features: 'attractive child character' }
};

const ENHANCED_SKIN_TONE_VARIATIONS = {
  'pale': [
    "attractive child character with fair porcelain skin with rosy undertones",
    "attractive child character with creamy white complexion with pink highlights",
    "attractive child character with pale ivory skin with subtle warm undertones",
    "attractive child character with light peachy skin with delicate blush",
    "attractive child character with soft alabaster complexion with natural warmth",
    "attractive child character with fair skin with gentle rose undertones"
  ],
  'light': [
    "attractive child character with light peach skin with golden undertones",
    "attractive child character with creamy beige complexion with warm highlights",
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
    "attractive child character with textured natural hair"
  ]
};

const ORCHESTRATOR_HAIR_COLOR_MAP = {
  'pale': 'red hair',
  'light': 'blonde hair',
  'medium': 'brown hair',
  'olive': 'black hair',
  'dark': 'textured natural hair'
};

// ============= UTILITY FUNCTIONS =============

function simpleHash(str) {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function getSeededRandomItem(array, seed) {
  if (!Array.isArray(array) || array.length === 0) {
    console.warn('⚠️ Invalid array provided to getSeededRandomItem:', array);
    return '';
  }
  
  const seedHash = typeof seed === 'string' ? simpleHash(seed) : seed || 0;
  const index = seedHash % array.length;
  return array[index];
}

function generateSeededRandom(seed) {
  const seedHash = typeof seed === 'string' ? simpleHash(seed) : seed || 0;
  return (seedHash % 1000) / 1000; // Normalize to 0-1
}

function getSeededSkinToneVariation(skinTone, seed) {
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

// ============= NUCLEAR AVATAR MAPPING FUNCTIONS =============

function getNuclearAvatarMapping(userInfo, difficulty, avatarIdentity) {
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
function enhanceNuclearMappingWithConsistency(userInfo, difficulty, characterData, sessionId, avatarIdentity) {
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
    
    // 1. CONTEXTUAL SETTING ENHANCEMENT
    const contextualSetting = inferContextualSetting(
      bestExtractedElements.setting,
      enhancedObjects,
      pageText,
      sessionId
    );
    
    // 2. CONTEXTUAL ACTION ENHANCEMENT
    const contextualAction = expandActionWithContext(
      bestExtractedElements.action,
      enhancedObjects,
      pageText,
      contextualSetting
    );
    
    // 3. SPATIAL COMPOSITION GENERATION
    const spatialComposition = generateSpatialComposition(
      contextualAction,
      enhancedObjects,
      contextualSetting,
      pageText
    );
    
    // 4. ATMOSPHERE CONTEXT MAPPING
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
      objects: enhancedObjects || '', 
      secondary_characters: await getSeededSecondaryCharacters(bestSentence, sessionId, pageNumber),
      spatial_composition: spatialComposition,
      atmosphere: atmosphereContext,
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

// ============= SUPPORTING FUNCTIONS =============

function extractElementsFromSentenceUnified(sentence, fullText) {
  const result = { action: 'playing', setting: 'outdoor space', objects: [], characters: [] };
  
  // Extract Actions from Unified Vocabulary with Expansion
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
      result.action = expandActionToPhrase(action, '', fullText);
      break;
    }
  }
  
  // Universal Setting Inference
  const seed = sentence + fullText;
  
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
      break;
    }
  }
  
  return result;
}

function calculateVisualPriority(elements) {
  let score = 0;
  
  if (elements.action && elements.action !== 'playing') score += 2;
  if (elements.setting && elements.setting.length > 10) score += 2;
  if (elements.objects && elements.objects.length > 0) score += 3;
  
  return score;
}

function calculateFantasyBonus(elements) {
  let bonus = 0;
  const fantasyKeywords = ['magical', 'enchanted', 'mystical', 'fairy', 'dragon', 'castle', 'wizard'];
  
  const allText = `${elements.action} ${elements.setting} ${elements.objects.join(' ')}`.toLowerCase();
  
  for (const keyword of fantasyKeywords) {
    if (allText.includes(keyword)) {
      bonus += 3;
    }
  }
  
  return bonus;
}

function calculateFantasyFriendlyCoherence(elements) {
  let score = 0;
  
  const coherentPairs = {
    'reading': ['library', 'classroom', 'bedroom', 'study'],
    'playing': ['playground', 'park', 'yard', 'playroom'],
    'cooking': ['kitchen', 'dining room'],
    'gardening': ['garden', 'yard', 'greenhouse']
  };
  
  for (const [action, settings] of Object.entries(coherentPairs)) {
    if (elements.action.includes(action)) {
      for (const setting of settings) {
        if (elements.setting.includes(setting)) {
          score += 2;
          break;
        }
      }
    }
  }
  
  return score;
}

function isIndoorContext(sentence) {
  const indoorKeywords = [
    'inside', 'room', 'house', 'home', 'classroom', 'library', 'kitchen', 
    'bedroom', 'living room', 'dining room', 'study', 'office', 'store', 'restaurant'
  ];
  
  return indoorKeywords.some(keyword => sentence.includes(keyword));
}

function expandActionToPhrase(action, objects, fullText) {
  try {
    const seed = action + objects + fullText;
    
    const actionExpansions = {
      'walking': [
        'walks carefully and curiously through the area',
        'strolls peacefully with a gentle smile',
        'moves gracefully while exploring the surroundings',
        'walks with confident steps and bright expression',
        'moves forward with excitement and wonder'
      ],
      'running': [
        'runs joyfully with boundless energy',
        'races excitedly across the open space',
        'moves quickly with a cheerful expression',
        'runs playfully with arms outstretched',
        'dashes forward with delighted laughter'
      ],
      'reading': [
        'reads intently with focused concentration',
        'discovers stories with wide-eyed wonder',
        'explores books with curious fascination',
        'reads peacefully with a content smile',
        'studies carefully with thoughtful expression'
      ],
      'playing': [
        'plays enthusiastically with joyful energy',
        'engages in fun activities with bright eyes',
        'enjoys playtime with infectious laughter',
        'plays creatively with imaginative focus',
        'participates actively in enjoyable games'
      ]
    };
    
    if (actionExpansions[action]) {
      return getSeededRandomItem(actionExpansions[action], seed);
    }
    
    const genericExpansions = [
      `${action}s with focused attention and cheerful expression`,
      `${action}s carefully while exploring the interesting environment`,
      `${action}s peacefully with a content and happy demeanor`,
      `${action}s actively with enthusiasm and bright energy`,
      `${action}s thoughtfully while enjoying the pleasant surroundings`
    ];
    
    return getSeededRandomItem(genericExpansions, seed);
    
  } catch (error) {
    console.warn('⚠️ Action expansion error:', error);
    return `${action}s happily in the scene`;
  }
}

// Contextual Intelligence Functions
function inferContextualSetting(baseSetting, objects, pageText, sessionId) {
  try {
    console.log(`🧠 Contextual Setting Inference - Objects: "${objects}", Base: "${baseSetting}"`);
    
    if (!objects || !pageText) return baseSetting;
    
    const objectsLower = objects.toLowerCase();
    const pageTextLower = pageText.toLowerCase();
    const seed = pageText + objects + baseSetting;
    
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
      }
    };
    
    for (const [objectKey, settingOptions] of Object.entries(objectSettingMap)) {
      if (objectsLower.includes(objectKey)) {
        const isIndoorContext = pageTextLower.includes('inside') || pageTextLower.includes('room') || pageTextLower.includes('house');
        const settingsArray = isIndoorContext ? settingOptions.indoor : settingOptions.outdoor;
        
        if (Math.random() < settingOptions.weight) {
          const selectedSetting = getSeededRandomItem(settingsArray, seed + objectKey);
          console.log(`🎯 Object-driven setting: "${objectKey}" → "${selectedSetting}"`);
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

function expandActionWithContext(baseAction, objects, pageText, setting) {
  try {
    console.log(`🧠 Contextual Action Enhancement - Action: "${baseAction}", Objects: "${objects}"`);
    
    const objectsLower = objects.toLowerCase();
    const seed = pageText + objects + baseAction;
    
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
      ]
    };
    
    for (const [objectKey, templates] of Object.entries(contextualActionTemplates)) {
      if (objectsLower.includes(objectKey)) {
        const selectedTemplate = getSeededRandomItem(templates, seed + objectKey);
        const filledTemplate = selectedTemplate.replace('{object}', objectKey);
        console.log(`🎯 Context-enhanced action: "${baseAction}" + "${objectKey}" → "${filledTemplate}"`);
        return filledTemplate;
      }
    }
    
    return expandActionToPhrase(baseAction, objects, pageText);
    
  } catch (error) {
    console.warn('⚠️ Contextual action enhancement error:', error);
    return expandActionToPhrase(baseAction, objects, pageText);
  }
}

function generateSpatialComposition(action, objects, setting, pageText) {
  try {
    console.log(`🧠 Spatial Composition Generation - Action: "${action}", Objects: "${objects}"`);
    
    const seed = pageText + action + objects + setting;
    
    const spatialTemplates = {
      'reading': ['sitting comfortably while reading', 'positioned near a window while reading', 'curled up in a cozy spot'],
      'playing': ['actively engaged in play', 'surrounded by toys while playing', 'in the center of the play area'],
      'watching': ['positioned to observe clearly', 'sitting at the perfect viewing angle', 'focused attention toward the subject']
    };
    
    for (const [actionKey, templates] of Object.entries(spatialTemplates)) {
      if (action.toLowerCase().includes(actionKey)) {
        const spatialDesc = getSeededRandomItem(templates, seed + actionKey);
        console.log(`🎯 Spatial composition: "${actionKey}" → "${spatialDesc}"`);
        return spatialDesc;
      }
    }
    
    const fallbackSpatials = [
      'positioned naturally in the scene',
      'comfortably situated in the environment',
      'placed with good composition balance',
      'arranged for optimal visual appeal'
    ];
    
    return getSeededRandomItem(fallbackSpatials, seed + '_fallback');
    
  } catch (error) {
    console.warn('⚠️ Spatial composition generation error:', error);
    return 'positioned naturally in the scene';
  }
}

function inferAtmosphereFromContext(pageText, setting, action) {
  try {
    console.log(`🧠 Atmosphere Inference - Setting: "${setting}", Action: "${action}"`);
    
    const pageTextLower = pageText.toLowerCase();
    const seed = pageText + setting + action;
    
    const atmosphereContexts = {
      'morning': ['soft morning light', 'gentle sunrise glow', 'fresh morning atmosphere', 'bright morning sunshine'],
      'evening': ['warm evening light', 'golden sunset glow', 'peaceful evening atmosphere', 'soft twilight lighting'],
      'sunny': ['bright natural lighting', 'cheerful sunny atmosphere', 'warm sunlight streaming in', 'brilliant daylight'],
      'cozy': ['warm ambient lighting', 'comfortable indoor atmosphere', 'soft gentle illumination', 'inviting warm glow']
    };
    
    for (const [contextKey, atmospheres] of Object.entries(atmosphereContexts)) {
      if (pageTextLower.includes(contextKey) || setting.toLowerCase().includes(contextKey)) {
        const selectedAtmosphere = getSeededRandomItem(atmospheres, seed + contextKey);
        console.log(`🎯 Context-based atmosphere: "${contextKey}" → "${selectedAtmosphere}"`);
        return selectedAtmosphere;
      }
    }
    
    if (setting.includes('outdoor') || setting.includes('park') || setting.includes('garden')) {
      const outdoorAtmospheres = ['natural outdoor lighting', 'fresh air atmosphere', 'bright daylight', 'pleasant outdoor ambiance'];
      return getSeededRandomItem(outdoorAtmospheres, seed + '_outdoor');
    } else {
      const indoorAtmospheres = ['warm interior lighting', 'comfortable indoor atmosphere', 'soft ambient lighting', 'cozy indoor glow'];
      return getSeededRandomItem(indoorAtmospheres, seed + '_indoor');
    }
    
  } catch (error) {
    console.warn('⚠️ Atmosphere inference error:', error);
    return 'pleasant natural lighting';
  }
}

function extractObjectsFromSentence(sentence, fullText, pageNumber, sessionId) {
  try {
    console.log(`🔍 Enhanced object extraction - Sentence: "${sentence}"`);
    
    if (!sentence || sentence.length < 5) {
      console.log('⚠️ No sentence provided for object extraction');
      return '';
    }
    
    const sentenceLower = sentence.toLowerCase();
    const seed = sentence + fullText + String(pageNumber);
    
    const allObjects = [
      ...TIER_25_UNIFIED_VOCABULARY.objects.everyday,
      ...TIER_25_UNIFIED_VOCABULARY.objects.nature,
      ...TIER_25_UNIFIED_VOCABULARY.objects.animals,
      ...TIER_25_UNIFIED_VOCABULARY.objects.fantasy
    ];
    
    const foundObjects = [];
    
    for (const obj of allObjects) {
      if (sentenceLower.includes(` ${obj} `) || 
          sentenceLower.includes(`${obj} `) || 
          sentenceLower.includes(` ${obj}`) ||
          sentenceLower.endsWith(obj)) {
        foundObjects.push(obj);
        console.log(`✅ Object found: "${obj}"`);
      }
    }
    
    if (foundObjects.length > 0) {
      const selectedObjects = foundObjects.slice(0, 2).join(' and ');
      console.log(`🎯 Objects selected: "${selectedObjects}"`);
      return selectedObjects;
    }
    
    console.log('📝 No specific objects detected - returning empty');
    return '';
    
  } catch (error) {
    console.warn('⚠️ Object extraction error:', error);
    return '';
  }
}

async function getSeededSecondaryCharacters(sentence, sessionId, pageNumber) {
  try {
    console.log('👥 Secondary character detection starting');
    
    if (!sentence || sentence.length < 10) {
      console.log('⚠️ Sentence too short for character detection');
      return '';
    }
    
    try {
      const extractedElements = await ExactWordExtractor.parseElements(
        sessionId || 'fallback', 
        'scene', 
        sentence, 
        pageNumber || 1
      );
      
      if (extractedElements && extractedElements.length > 0) {
        const characters = extractedElements
          .filter(element => 
            element.type === 'secondary_character' || 
            element.relationship_type
          )
          .map(element => {
            if (element.relationship_type) {
              return `with ${element.relationship_type} ${element.name}`;
            }
            return `with ${element.name}`;
          })
          .slice(0, 2)
          .join(' and ');
        
        if (characters) {
          console.log(`✅ Secondary characters found: "${characters}"`);
          return characters;
        }
      }
    } catch (error) {
      console.warn('⚠️ ExactWordExtractor unavailable, using simple detection:', error);
    }
    
    // Fallback: Simple keyword detection
    const simpleCharacters = detectSimpleCharacters(sentence);
    if (simpleCharacters) {
      console.log(`✅ Simple character detection: "${simpleCharacters}"`);
      return simpleCharacters;
    }
    
    console.log('📝 No secondary characters detected');
    return '';
    
  } catch (error) {
    console.warn('⚠️ Secondary character detection error:', error);
    return '';
  }
}

function detectSimpleCharacters(sentence) {
  const sentenceLower = sentence.toLowerCase();
  
  const characterKeywords = {
    'mom': 'with loving mother',
    'mother': 'with caring mother',
    'dad': 'with supportive father', 
    'father': 'with kind father',
    'friend': 'with good friend',
    'teacher': 'with helpful teacher',
    'grandma': 'with wise grandmother',
    'grandmother': 'with loving grandmother',
    'brother': 'with playful brother',
    'sister': 'with cheerful sister'
  };
  
  for (const [keyword, description] of Object.entries(characterKeywords)) {
    if (sentenceLower.includes(keyword)) {
      return description;
    }
  }
  
  return null;
}

// ============= TEMPLATE PROCESSING FUNCTIONS =============

async function generateFinalPrompt(avatarMapping, sceneData, difficulty, templateType = 'premium') {
  try {
    console.log('🎯 Final prompt generation starting');
    
    const templates = templateType === 'premium' ? PREMIUM_PROMPT_TEMPLATES : BASIC_PROMPT_TEMPLATES;
    const template = templates[difficulty] || templates['medium'];
    
    const styleSettings = NUCLEAR_STYLE_SETTINGS[difficulty] || NUCLEAR_STYLE_SETTINGS['medium'];
    const frameworkPrompt = styleSettings.frameworkPrompt || EMERGENCY_FALLBACK_FRAMEWORK;
    
    const cameraDirective = extractCameraDirective(sceneData, difficulty);
    
    const placeholders = {
      frameworkPrompt: frameworkPrompt,
      cameraDirective: cameraDirective,
      pageText: truncatePageText(sceneData.pageText || '', difficulty),
      character: avatarMapping.character || 'child',
      age: avatarMapping.age || '8 years old',
      ethnicity: avatarMapping.ethnicity || 'friendly appearance',
      hair: avatarMapping.hair || 'neat hair',
      features: avatarMapping.features || 'bright eyes',
      scene: sceneData.scene || 'playing happily',
      setting: sceneData.setting || 'comfortable space',
      emotion: extractEmotion(sceneData.pageText || ''),
      action_intensity: generateActionIntensity(sceneData.scene || ''),
      spatial_positioning: sceneData.spatialComposition || 'positioned naturally',
      object_interaction: generateObjectInteraction(sceneData.objects || '', sceneData.scene || ''),
      body_language: generateBodyLanguage(sceneData.scene || '', avatarMapping.character || ''),
      spatial_composition: sceneData.spatialComposition || 'well-composed scene',
      atmosphere: sceneData.atmosphereContext || 'pleasant natural lighting',
      props: sceneData.objects || '',
      action_objects: sceneData.objects || '',
      colored_objects: enhanceObjectsWithColors(sceneData.objects || ''),
      sensory_details: generateSensoryDetails(sceneData.setting || '', sceneData.scene || ''),
      community_context: generateCommunityContext(sceneData.setting || ''),
      secondary_characters: sceneData.secondary_characters || '',
      subject: avatarMapping.character || 'child',
      action: sceneData.scene || 'playing',
      adjective: extractColorAdjective(sceneData.pageText || '')
    };
    
    let finalPrompt = template;
    for (const [key, value] of Object.entries(placeholders)) {
      const placeholder = `{${key}}`;
      finalPrompt = finalPrompt.replace(new RegExp(placeholder, 'g'), value || '');
    }
    
    finalPrompt = finalPrompt.replace(/\{[^}]+\}/g, '').replace(/,\s*,/g, ',').replace(/\.\s*\./g, '.');
    
    console.log('✅ Final prompt generated successfully');
    return finalPrompt;
    
  } catch (error) {
    console.error('🚨 Final prompt generation error:', error);
    
    const emergencyPrompt = `${EMERGENCY_FALLBACK_FRAMEWORK}. A cheerful child ${avatarMapping?.age || '8 years old'} with ${avatarMapping?.hair || 'neat hair'} and ${avatarMapping?.features || 'bright eyes'}, ${sceneData?.scene || 'playing happily'} in ${sceneData?.setting || 'a comfortable space'}.`;
    
    return emergencyPrompt;
  }
}

// Supporting functions for prompt generation
function extractCameraDirective(sceneData, difficulty) {
  const cameraOptions = {
    beginner: ['close-up portrait focus', 'medium shot composition', 'friendly eye-level angle'],
    easy: ['close-up portrait focus', 'medium shot with context', 'slightly elevated angle'],
    medium: ['medium shot with environmental context', 'dynamic angle with depth', 'cinematic composition'],
    hard: ['wide establishing shot with detailed environment', 'cinematic angle with visual depth', 'professional composition'],
    expert: ['cinematic wide shot with full environmental context', 'dynamic camera angle with artistic depth', 'professional photography composition']
  };
  
  const options = cameraOptions[difficulty] || cameraOptions['medium'];
  const seed = (sceneData.scene || '') + (sceneData.setting || '') + difficulty;
  
  return getSeededRandomItem(options, seed);
}

function truncatePageText(pageText, difficulty) {
  if (!pageText) return '';
  
  const maxLengths = {
    beginner: 150,
    easy: 200,
    medium: 300,
    hard: 400,
    expert: 500
  };
  
  const maxLength = maxLengths[difficulty] || 300;
  
  if (pageText.length <= maxLength) return pageText;
  
  return pageText.substring(0, maxLength).trim() + '...';
}

function extractEmotion(pageText) {
  const emotionKeywords = {
    'happy': ['happy', 'joy', 'smile', 'laugh', 'cheerful', 'delighted', 'glad'],
    'excited': ['excited', 'thrilled', 'eager', 'enthusiastic', 'energetic'],
    'curious': ['curious', 'wonder', 'interested', 'fascinated', 'intrigued'],
    'peaceful': ['calm', 'peaceful', 'serene', 'relaxed', 'content']
  };
  
  const pageTextLower = pageText.toLowerCase();
  
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    for (const keyword of keywords) {
      if (pageTextLower.includes(keyword)) {
        return emotion;
      }
    }
  }
  
  return 'happy';
}

function generateActionIntensity(scene) {
  const actionIntensityMap = {
    'running': 'high energy movement',
    'jumping': 'dynamic energetic motion',
    'playing': 'moderate playful energy',
    'reading': 'calm focused attention',
    'sitting': 'relaxed peaceful energy'
  };
  
  for (const [action, intensity] of Object.entries(actionIntensityMap)) {
    if (scene.toLowerCase().includes(action)) {
      return intensity;
    }
  }
  
  return 'moderate natural energy';
}

function generateObjectInteraction(objects, scene) {
  if (!objects) return '';
  
  const sceneLower = scene.toLowerCase();
  
  if (sceneLower.includes('holding')) return `carefully holding ${objects}`;
  if (sceneLower.includes('reading')) return `actively reading from ${objects}`;
  if (sceneLower.includes('playing')) return `playfully interacting with ${objects}`;
  
  return objects ? `naturally positioned near ${objects}` : '';
}

function generateBodyLanguage(scene, character) {
  const bodyLanguageMap = {
    'reading': 'relaxed posture with focused concentration',
    'playing': 'animated and energetic body movement',
    'running': 'dynamic athletic form with forward momentum',
    'sitting': 'comfortable relaxed positioning'
  };
  
  for (const [action, bodyLang] of Object.entries(bodyLanguageMap)) {
    if (scene.toLowerCase().includes(action)) {
      return bodyLang;
    }
  }
  
  return 'natural and expressive body language';
}

function enhanceObjectsWithColors(objects) {
  if (!objects) return '';
  
  const colorEnhancements = {
    'book': 'colorful storybook',
    'flower': 'vibrant blooming flowers',
    'ball': 'brightly colored ball',
    'toy': 'colorful fun toys',
    'bird': 'beautiful colorful bird'
  };
  
  for (const [obj, coloredVersion] of Object.entries(colorEnhancements)) {
    if (objects.toLowerCase().includes(obj)) {
      return coloredVersion;
    }
  }
  
  return objects;
}

function generateSensoryDetails(setting, scene) {
  const sensoryMap = {
    'garden': 'fragrant flowers and gentle breeze',
    'library': 'quiet atmosphere and soft lighting',
    'kitchen': 'warm aromas and comfortable environment',
    'park': 'fresh air and natural sounds'
  };
  
  for (const [location, sensory] of Object.entries(sensoryMap)) {
    if (setting.toLowerCase().includes(location)) {
      return sensory;
    }
  }
  
  return 'pleasant environmental atmosphere';
}

function generateCommunityContext(setting) {
  const communityContexts = {
    'school': 'educational community environment',
    'park': 'family-friendly community space',
    'library': 'learning community atmosphere',
    'playground': 'children\'s community play area'
  };
  
  for (const [location, context] of Object.entries(communityContexts)) {
    if (setting.toLowerCase().includes(location)) {
      return context;
    }
  }
  
  return 'positive community setting';
}

function extractColorAdjective(pageText) {
  const colorKeywords = [
    'bright', 'colorful', 'vibrant', 'brilliant', 'radiant', 'glowing', 
    'shimmering', 'sparkling', 'rainbow', 'golden'
  ];
  
  const pageTextLower = pageText.toLowerCase();
  
  for (const color of colorKeywords) {
    if (pageTextLower.includes(color)) {
      return color;
    }
  }
  
  return 'bright';
}

function processPromptForRunware(prompt, difficulty) {
  try {
    console.log('🔧 Processing prompt for Runware optimization');
    
    if (!prompt || prompt.length < 10) {
      console.warn('⚠️ Invalid prompt provided for processing');
      return EMERGENCY_FALLBACK_FRAMEWORK + '. A cheerful child playing happily.';
    }
    
    let processedPrompt = prompt
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[""'']/g, '"')
      .replace(/…/g, '...');
    
    const maxLength = 1200;
    if (processedPrompt.length > maxLength) {
      console.log(`📏 Truncating prompt from ${processedPrompt.length} to ${maxLength} characters`);
      processedPrompt = processedPrompt.substring(0, maxLength).trim();
      
      const lastPeriod = processedPrompt.lastIndexOf('.');
      const lastComma = processedPrompt.lastIndexOf(',');
      const cutPoint = Math.max(lastPeriod, lastComma);
      
      if (cutPoint > maxLength * 0.8) {
        processedPrompt = processedPrompt.substring(0, cutPoint + 1);
      }
    }
    
    console.log(`✅ Prompt processed successfully (${processedPrompt.length} chars)`);
    return processedPrompt;
    
  } catch (error) {
    console.error('🚨 Prompt processing error:', error);
    return EMERGENCY_FALLBACK_FRAMEWORK + '. A cheerful child in a pleasant scene.';
  }
}

// ============= MAIN SERVE FUNCTION =============

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  const startTime = Date.now();
  let requestData = {};
  let successfulTier = '';
  let tierPath = [];
  let attemptedTiers = [];
  let enhancementLevel = '';
  let fallbackReason = '';
  let templateType = 'premium';

  try {
    console.log('🛡️ ============= TIER 2.5 NUCLEAR INDEPENDENCE ACTIVATED =============');
    console.log('🎯 Request received - Starting comprehensive image generation');
    
    try {
      requestData = await req.json();
      console.log('📊 Request data parsed successfully');
    } catch (parseError) {
      console.error('❌ Request parsing error:', parseError);
      return createCorsErrorResponse('Invalid JSON in request body', 400);
    }

    if (!requestData.pageText) {
      console.error('❌ Missing required pageText field');
      return createCorsErrorResponse('pageText is required', 400);
    }

    const { 
      pageText, 
      userInfo = {}, 
      sessionId, 
      pageNumber = 1, 
      previousSetting,
      avatarIdentity = {},
      requestedTier
    } = requestData;

    console.log('📋 Processing request:', {
      pageTextLength: pageText.length,
      hasUserInfo: !!userInfo,
      hasSessionId: !!sessionId,
      pageNumber,
      hasAvatarIdentity: !!avatarIdentity,
      requestedTier
    });

    const difficulty = mapDifficultyInline(userInfo, 'medium');
    console.log(`🎯 Difficulty level mapped: ${difficulty}`);

    const culturalProfile = detectCulturalProfileForNegatives(userInfo, avatarIdentity);
    console.log(`🌍 Cultural profile detected: ${culturalProfile}`);

    // ============= TIER 2.5 NUCLEAR INDEPENDENCE PROCESSING =============
    
    tierPath.push('2.5-Nuclear-Independence');
    attemptedTiers.push('2.5-Nuclear-Independence');
    successfulTier = '2.5-Nuclear-Independence';
    enhancementLevel = 'Maximum-Character-Consistency';

    console.log('🛡️ Step 1: Generating nuclear avatar mapping');
    const nuclearMapping = getNuclearAvatarMapping(userInfo, difficulty, avatarIdentity);
    
    console.log('🎭 Step 2: Applying character consistency enhancement');
    const avatarMapping = await enhanceNuclearMappingWithConsistency(
      nuclearMapping, 
      userInfo, 
      null, // characterData
      sessionId, 
      difficulty, 
      avatarIdentity
    );

    console.log('🎯 Step 3: Premium scene extraction with contextual intelligence');
    const sceneData = await extractSceneWithPremiumTemplate(
      pageText, 
      previousSetting, 
      pageNumber, 
      sessionId
    );
    sceneData.pageText = pageText;

    console.log('📝 Step 4: Generating final optimized prompt');
    const prompt = await generateFinalPrompt(avatarMapping, sceneData, difficulty, templateType);

    console.log('🛡️ Step 5: Generating nuclear negative prompt');
    const negativePrompt = generateNuclearNegativePrompt(
      culturalProfile,
      avatarMapping.character || 'child',
      difficulty,
      pageNumber
    );

    const styleSettings = NUCLEAR_STYLE_SETTINGS[difficulty] || NUCLEAR_STYLE_SETTINGS['medium'];

    console.log('✅ All processing steps completed successfully');
    console.log('🚀 Initiating Runware API connection...');

    // ============= RUNWARE API INTEGRATION =============
    
    return new Promise((resolve) => {
      let isResolved = false;
      const resolveOnce = (response) => {
        if (!isResolved) {
          isResolved = true;
          resolve(response);
        }
      };

      const apiKey = Deno.env.get('RUNWARE_API_KEY');
      if (!apiKey) {
        console.error('❌ RUNWARE_API_KEY not found in environment');
        resolveOnce(createCorsErrorResponse('Runware API key not configured', 500));
        return;
      }

      console.log('🌐 Establishing WebSocket connection to Runware...');
      const ws = new WebSocket('wss://ws-api.runware.ai/v1');
      
      let finalPrompt = '';
      
      ws.onopen = () => {
        console.log('✅ WebSocket connection established');
        
        const authMessage = [{
          taskType: "authentication",
          apiKey: apiKey
        }];
        
        console.log('🔐 Sending authentication...');
        ws.send(JSON.stringify(authMessage));
      };
      
      ws.onmessage = async (event) => {
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
                
                finalPrompt = processPromptForRunware(prompt, difficulty);
                
                const imageMessage = [{
                  taskType: "imageInference",
                  taskUUID: crypto.randomUUID(),
                  positivePrompt: finalPrompt,
                  negativePrompt: negativePrompt,
                  width: 1024,
                  height: 1024,
                  model: "runware:100@1",
                  numberResults: 1,
                  outputFormat: "WEBP",
                  steps: 30,
                  CFGScale: 10
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
                    objects: sceneData.objects || 'none',
                    secondary_characters: sceneData.secondary_characters || 'none'
                  },
                  characterConsistency: {
                    sessionId: sessionId,
                    characterSeed: avatarMapping?.seed || 'none',
                    enhancementApplied: !!(avatarMapping && avatarMapping.seed),
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
        resolveOnce(createCorsErrorResponse('WebSocket connection failed', 500));
      };
      
      ws.onclose = (event) => {
        console.log('🛡️ Tier 2.5: WebSocket closed:', event.code, event.reason);
        if (!isResolved) {
          resolveOnce(createCorsErrorResponse('WebSocket connection closed', 500));
        }
      };
      
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