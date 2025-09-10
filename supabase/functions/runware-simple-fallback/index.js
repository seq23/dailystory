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
  return Math.abs(hash) / 2147483647;
}

function getSeededElement(array, seed) {
  if (!array || array.length === 0) return '';
  const index = Math.floor(seededRandom(seed) * array.length);
  return array[index];
}

// ============= TIER 2.5 UNIFIED VOCABULARY - NUCLEAR INDEPENDENCE =============
const TIER_25_UNIFIED_VOCABULARY = {
  emotions: {
    positive: [
      'radiating joy', 'beaming with happiness', 'sparkling with delight', 'glowing with excitement', 
      'filled with wonder', 'bubbling with enthusiasm', 'bright with curiosity', 'warm with contentment',
      'shining with pride', 'dancing with glee', 'laughing with pure joy', 'smiling with genuine happiness',
      'giggling with amusement', 'cheerful and bright', 'excited and eager', 'happy and carefree',
      'joyful and playful', 'delighted and amazed', 'thrilled and energetic', 'content and peaceful',
      'optimistic and hopeful', 'confident and bold', 'adventurous and brave', 'curious and engaged'
    ],
    contemplative: [
      'deep in thought', 'lost in wonder', 'contemplating quietly', 'reflecting peacefully',
      'pondering curiously', 'dreaming softly', 'thinking carefully', 'considering thoughtfully',
      'absorbed in ideas', 'focused intently', 'concentrating deeply', 'studying attentively',
      'observing quietly', 'listening carefully', 'watching with interest', 'examining closely',
      'exploring mentally', 'discovering inwardly', 'understanding slowly', 'learning eagerly'
    ],
    gentle: [
      'calm and serene', 'peaceful and quiet', 'gentle and kind', 'soft and tender',
      'warm and caring', 'compassionate and loving', 'patient and understanding', 'nurturing and protective',
      'comforting and soothing', 'healing and restorative', 'safe and secure', 'trusted and reliable',
      'stable and grounded', 'balanced and centered', 'harmonious and unified', 'graceful and elegant'
    ]
  },
  
  actions: {
    intensity: [
      'energetically', 'enthusiastically', 'excitedly', 'vigorously', 'dynamically',
      'gently', 'softly', 'quietly', 'peacefully', 'calmly', 'serenely',
      'carefully', 'thoughtfully', 'deliberately', 'mindfully', 'attentively',
      'boldly', 'confidently', 'bravely', 'courageously', 'determinedly',
      'playfully', 'joyfully', 'cheerfully', 'lightheartedly', 'merrily',
      'gracefully', 'elegantly', 'smoothly', 'fluidly', 'naturally'
    ],
    
    bodyLanguage: [
      'arms spread wide with excitement', 'hands raised in celebration', 'body bouncing with joy',
      'head tilted thoughtfully', 'eyes sparkling with wonder', 'smile radiating warmth',
      'posture relaxed and comfortable', 'stance confident and proud', 'shoulders squared with determination',
      'hands clasped behind back thoughtfully', 'fingers interlaced peacefully', 'arms crossed contemplatively',
      'hands on hips confidently', 'arms swinging naturally', 'body leaning forward with interest',
      'sitting cross-legged comfortably', 'standing tall and proud', 'crouching down curiously',
      'reaching out eagerly', 'gesturing expressively', 'moving rhythmically',
      'stretching arms upward', 'rubbing eyes sleepily', 'yawning softly',
      'looking ahead confidently', 'hands in pockets', 'hands resting on lap',
      'smiling brightly', 'eyes twinkling with mischief', 'face glowing with happiness'
    ],
    
    spatial: [
      'positioned in the foreground', 'standing in the center', 'placed to the left', 'located on the right side',
      'sitting in the background', 'crouched in the corner', 'hovering above', 'resting beneath',
      'nestled between', 'balanced on top of', 'moving forward confidently', 'stepping carefully',
      'striding purposefully', 'sitting up in bed', 'stretching in bed', 'lying peacefully',
      'crouched down to play', 'kneeling on ground', 'seated for play', 'positioned playfully',
      'positioned at desk', 'seated comfortably', 'sitting attentively', 'standing at attention',
      'leaning against casually', 'perched on edge', 'sprawled out relaxed', 'tucked in safely'
    ]
  },
  
  settings: {
    indoor: [
      'cozy bedroom', 'comfortable living room', 'sunny kitchen', 'quiet study room', 'warm family room',
      'peaceful library', 'cheerful playroom', 'organized classroom', 'inviting dining room', 'spacious hallway',
      'bright bathroom', 'functional laundry room', 'creative art studio', 'musical practice room', 'cozy reading nook',
      'modern office space', 'traditional family den', 'rustic cabin interior', 'elegant formal room', 'casual game room'
    ],
    
    outdoor: [
      'beautiful garden', 'local neighborhood park', 'sandy beach', 'green forest path', 'rolling countryside',
      'city playground', 'suburban backyard', 'mountain meadow', 'peaceful lakeside', 'sunny farmyard',
      'school courtyard', 'community garden', 'tree-lined street', 'open field', 'flower garden',
      'sports field', 'walking trail', 'picnic area', 'nature preserve', 'outdoor market'
    ],
    
    community: [
      'neighborhood library', 'local school', 'community center', 'corner store', 'farmer\'s market',
      'ice cream shop', 'pizza restaurant', 'barber shop', 'grocery store', 'toy store',
      'bookstore', 'coffee shop', 'bakery', 'park pavilion', 'recreation center',
      'youth club', 'sports facility', 'art gallery', 'music studio', 'dance studio'
    ]
  },
  
  objects: {
    educational: [
      'colorful books', 'art supplies', 'building blocks', 'science kit', 'musical instruments',
      'learning games', 'educational puzzles', 'writing materials', 'craft supplies', 'math manipulatives',
      'maps and globes', 'nature specimens', 'experiment tools', 'measurement devices', 'research materials'
    ],
    
    recreational: [
      'sports equipment', 'outdoor toys', 'board games', 'electronic devices', 'hobby collections',
      'art projects', 'musical recordings', 'video games', 'outdoor gear', 'exercise equipment',
      'creative tools', 'entertainment items', 'party supplies', 'seasonal decorations', 'comfort items'
    ],
    
    everyday: [
      'household items', 'kitchen utensils', 'cleaning supplies', 'storage containers', 'organizational tools',
      'furniture pieces', 'lighting fixtures', 'decorative objects', 'practical tools', 'safety equipment',
      'communication devices', 'transportation items', 'clothing accessories', 'personal care products', 'food items'
    ]
  },
  
  colors: {
    warm: [
      'warm sunshine yellow', 'rich golden orange', 'deep crimson red', 'soft coral pink',
      'vibrant sunset orange', 'gentle peach tones', 'bold cherry red', 'warm amber glow',
      'copper penny shine', 'rustic terra cotta', 'cozy fireplace orange', 'autumn leaf red'
    ],
    
    cool: [
      'ocean wave blue', 'forest canopy green', 'twilight purple', 'arctic ice blue',
      'sage garden green', 'lavender field purple', 'stormy sky gray', 'mint leaf green',
      'deep navy blue', 'emerald forest green', 'royal violet purple', 'misty morning blue'
    ],
    
    neutral: [
      'warm cream white', 'soft pearl gray', 'rich chocolate brown', 'sandy beige',
      'charcoal pencil gray', 'ivory tower white', 'mushroom cap brown', 'dove feather gray',
      'coffee bean brown', 'cloud cotton white', 'stone pathway gray', 'vanilla cream'
    ],
    
    bright: [
      'electric sunshine yellow', 'neon grass green', 'hot magenta pink', 'brilliant sky blue',
      'vibrant lime green', 'bright cherry red', 'dazzling white', 'intense orange flame',
      'pure crystal blue', 'electric purple', 'blazing yellow', 'luminous green'
    ]
  },
  
  atmospheres: [
    'bathed in warm natural lighting', 'illuminated by soft golden hour light', 'glowing with cozy interior warmth',
    'brightened by cheerful morning sunshine', 'enhanced by gentle afternoon light', 'warmed by inviting indoor lighting',
    'lit by filtered window light', 'surrounded by comfortable ambient lighting', 'filled with bright daylight',
    'creating a welcoming atmosphere', 'establishing a peaceful mood', 'radiating positive energy',
    'fostering creativity and joy', 'encouraging exploration and wonder', 'promoting learning and growth',
    'inspiring confidence and curiosity', 'nurturing safety and comfort', 'celebrating childhood innocence'
  ],
  
  sensoryDetails: [
    'filled with gentle sounds', 'touched by soft textures', 'scented with fresh aromas',
    'warmed by comfortable temperatures', 'enhanced by natural sounds', 'enriched with tactile experiences',
    'accompanied by melodic tones', 'surrounded by pleasant fragrances', 'textured with interesting surfaces',
    'flavored with delicious tastes', 'vibrated with musical rhythms', 'felt through physical sensations'
  ],
  
  compositions: [
    'rule of thirds balance', 'centered composition focus', 'dynamic diagonal arrangement',
    'symmetrical layout design', 'asymmetrical creative balance', 'leading lines guidance',
    'frame within frame structure', 'golden ratio proportions', 'triangular arrangement',
    'circular composition flow', 'horizontal line emphasis', 'vertical element strength',
    'depth of field variation', 'foreground interest focus', 'background context support'
  ]
};

// ============= TIER 2.5 ENHANCED VOCABULARY EXTRACTOR - INTELLIGENT CONTEXT DETECTION =============

class EnhancedVocabularyExtractor {
  constructor(pageText) {
    this.originalText = pageText;
    this.lowerText = pageText.toLowerCase();
    this.words = this.lowerText.split(/\s+/);
  }
  
  /**
   * Check if the text has strong spatial positioning indicators
   */
  hasStrongSpatialIndicators() {
    const strongSpatialIndicators = [
      // Movement and positioning
      'sit', 'sitting', 'stand', 'standing', 'walk', 'walking', 'run', 'running',
      'lie', 'lying', 'sleep', 'sleeping', 'wake', 'waking', 'move', 'moving',
      'jump', 'jumping', 'dance', 'dancing', 'stretch', 'stretching',
      // Activity-based positioning
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

// ============= PHASE 4: SEEDED SELECTION FOR CONSISTENCY =============
// Generate consistent seeded random for character selection across story pages
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
      const enhancement = await getCharacterEnhancement(name, sessionId);
      return `${name}: ${enhancement}`;
    }));
    detectedCharacterElements.push(...enhancedNames);
  }
  
  // PHASE 2: RELATIONSHIP-BASED DETECTION WITH PROPER ENHANCEMENTS (only if we don't have enough named characters)
  if (detectedCharacterElements.length < 2) {
    const relationshipPairs = [
      // Family relationships (most reliable for visual generation)
      ['mother', 'loving mother with caring expression'], ['mom', 'friendly mom with warm smile'],
      ['father', 'supportive father with gentle demeanor'], ['dad', 'kind dad with encouraging presence'],
      ['sister', 'playful sister with bright energy'], ['brother', 'helpful brother with friendly attitude'],
      ['grandmother', 'wise grandmother with kind eyes'], ['grandma', 'sweet grandma with gentle nature'],
      ['grandfather', 'thoughtful grandfather with patient smile'], ['grandpa', 'caring grandpa with warm expression'],
      
      // Close friend relationships (reliable for group scenes)
      ['friend', 'loyal friend with cheerful disposition'], ['best friend', 'best friend with excited expression'],
      ['buddy', 'fun buddy with energetic presence'], ['pal', 'good pal with friendly manner'],
      
      // Authority figures (when context is appropriate)
      ['teacher', 'helpful teacher with encouraging smile'], ['coach', 'supportive coach with motivating presence'],
      ['librarian', 'knowledgeable librarian with patient demeanor']
    ];
    
    const foundRelationships = [];
    for (const [keyword, enhancement] of relationshipPairs) {
      if (lowerSentence.includes(keyword) && !foundRelationships.some(found => found.includes(keyword))) {
        foundRelationships.push(enhancement);
        if (foundRelationships.length >= 2) break; // Limit to 2 relationships to avoid crowding
      }
    }
    
    detectedCharacterElements.push(...foundRelationships);
  }
  
  // PHASE 3: ANIMAL CHARACTER DETECTION WITH SPECIES SPECIFICATION (only if scene supports it)
  if (detectedCharacterElements.length < 3) {
    const animalPairs = [
      ['dog', 'friendly dog with wagging tail'], ['puppy', 'playful puppy with excited energy'],
      ['cat', 'curious cat with alert expression'], ['kitten', 'adorable kitten with playful demeanor'],
      ['bird', 'colorful bird with beautiful feathers'], ['rabbit', 'gentle rabbit with soft fur'],
      ['hamster', 'cute hamster with tiny paws'], ['fish', 'swimming fish with shimmering scales']
    ];
    
    for (const [keyword, enhancement] of animalPairs) {
      if (lowerSentence.includes(keyword)) {
        detectedCharacterElements.push(enhancement);
        break; // Only add one animal to avoid complexity
      }
    }
  }
  
  // PHASE 4: FORMAT AND RETURN RESULTS
  if (detectedCharacterElements.length > 0) {
    // Limit to 3 total characters for visual clarity
    const limitedCharacters = detectedCharacterElements.slice(0, 3);
    const result = limitedCharacters.join(', ');
    console.log(`✅ Enhanced secondary characters detected: ${result}`);
    return result;
  }
  
  console.log('📝 No secondary characters detected in text');
  return '';
}

// ============= CHARACTER NAME EXTRACTION WITH VISUAL ENHANCEMENT =============
function extractCharacterNamesFromPageText(text, sessionId) {
  // Simple name detection - look for capitalized words that could be names
  const words = text.split(/\s+/);
  const potentialNames = [];
  
  // Look for capitalized words that could be names (exclude common words)
  const excludeWords = ['I', 'The', 'A', 'An', 'This', 'That', 'Then', 'When', 'Where', 'What', 'Who', 'How', 'Why'];
  
  for (const word of words) {
    const cleanWord = word.replace(/[^\w]/g, ''); // Remove punctuation
    if (cleanWord.length >= 2 && 
        cleanWord[0] === cleanWord[0].toUpperCase() && 
        cleanWord.slice(1) === cleanWord.slice(1).toLowerCase() &&
        !excludeWords.includes(cleanWord)) {
      potentialNames.push(cleanWord);
    }
  }
  
  // Remove duplicates and limit to reasonable number
  const uniqueNames = [...new Set(potentialNames)].slice(0, 3);
  
  if (uniqueNames.length > 0) {
    console.log(`📛 Extracted potential character names: ${uniqueNames.join(', ')}`);
  }
  
  return uniqueNames;
}

// ============= CHARACTER ENHANCEMENT BASED ON CONTEXT =============
async function getCharacterEnhancement(characterName, sessionId) {
  // Simple enhancement based on name characteristics
  const nameLength = characterName.length;
  const firstLetter = characterName[0].toLowerCase();
  
  // Basic visual enhancements based on name patterns
  const enhancements = [
    'friendly companion with warm smile',
    'kind person with gentle expression',
    'cheerful individual with bright energy',
    'helpful character with caring demeanor',
    'supportive friend with encouraging presence'
  ];
  
  // Use first letter to create consistent enhancement for same name
  const index = firstLetter.charCodeAt(0) % enhancements.length;
  return enhancements[index];
}

// ============= NUCLEAR INDEPENDENT EXTRACTION FUNCTIONS =============

function extractEmotion(pageText) {
  const lowerText = pageText.toLowerCase();
  
  // Check for positive emotions first (most common in children's stories)
  for (const emotion of TIER_25_UNIFIED_VOCABULARY.emotions.positive) {
    if (lowerText.includes(emotion.split(' ')[0]) || lowerText.includes(emotion.split(' ')[1])) {
      return emotion;
    }
  }
  
  // Check for contemplative emotions
  for (const emotion of TIER_25_UNIFIED_VOCABULARY.emotions.contemplative) {
    if (lowerText.includes(emotion.split(' ')[0]) || lowerText.includes(emotion.split(' ')[1])) {
      return emotion;
    }
  }
  
  // Check for gentle emotions
  for (const emotion of TIER_25_UNIFIED_VOCABULARY.emotions.gentle) {
    if (lowerText.includes(emotion.split(' ')[0]) || lowerText.includes(emotion.split(' ')[1])) {
      return emotion;
    }
  }
  
  // Simple keyword-based emotion mapping with full emotional descriptions
  if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('excited')) return 'radiating joy and happiness';
  if (lowerText.includes('smile') || lowerText.includes('laugh') || lowerText.includes('giggle')) return 'beaming with delight';
  if (lowerText.includes('wonder') || lowerText.includes('curious') || lowerText.includes('amaze')) return 'filled with wonder and curiosity';
  if (lowerText.includes('think') || lowerText.includes('consider') || lowerText.includes('ponder')) return 'deep in thoughtful contemplation';
  if (lowerText.includes('calm') || lowerText.includes('peace') || lowerText.includes('quiet')) return 'calm and serene';
  if (lowerText.includes('confident') || lowerText.includes('proud') || lowerText.includes('brave')) return 'confident and proud';
  if (lowerText.includes('surprise') || lowerText.includes('shock') || lowerText.includes('gasp')) return 'filled with delightful surprise';
  
  // Default to positive emotion for children's content
  return 'bright and cheerful';
}

function extractSetting(pageText) {
  const lowerText = pageText.toLowerCase();
  
  // Check indoor settings first
  for (const setting of TIER_25_UNIFIED_VOCABULARY.settings.indoor) {
    const settingWords = setting.toLowerCase().split(' ');
    if (settingWords.some(word => lowerText.includes(word))) {
      return setting;
    }
  }
  
  // Check outdoor settings
  for (const setting of TIER_25_UNIFIED_VOCABULARY.settings.outdoor) {
    const settingWords = setting.toLowerCase().split(' ');
    if (settingWords.some(word => lowerText.includes(word))) {
      return setting;
    }
  }
  
  // Check community settings
  for (const setting of TIER_25_UNIFIED_VOCABULARY.settings.community) {
    const settingWords = setting.toLowerCase().split(' ');
    if (settingWords.some(word => lowerText.includes(word))) {
      return setting;
    }
  }
  
  // Keyword-based setting detection with enhanced descriptions
  if (lowerText.includes('bedroom') || lowerText.includes('bed')) return 'cozy bedroom with soft lighting';
  if (lowerText.includes('kitchen')) return 'warm family kitchen';
  if (lowerText.includes('living room') || lowerText.includes('family room')) return 'comfortable living room';
  if (lowerText.includes('school') || lowerText.includes('classroom')) return 'bright school classroom';
  if (lowerText.includes('park') || lowerText.includes('playground')) return 'sunny neighborhood park';
  if (lowerText.includes('garden') || lowerText.includes('yard')) return 'beautiful garden setting';
  if (lowerText.includes('library')) return 'quiet library with many books';
  if (lowerText.includes('beach') || lowerText.includes('sand')) return 'sandy beach with gentle waves';
  if (lowerText.includes('forest') || lowerText.includes('woods')) return 'peaceful forest path';
  if (lowerText.includes('home') || lowerText.includes('house')) return 'comfortable family home';
  
  // Default settings based on context
  if (lowerText.includes('outside') || lowerText.includes('outdoor')) return 'peaceful outdoor environment';
  if (lowerText.includes('inside') || lowerText.includes('indoor')) return 'cozy indoor space';
  
  return 'comfortable everyday setting';
}

function extractAtmosphere(pageText) {
  const lowerText = pageText.toLowerCase();
  
  // Check for atmosphere vocabulary
  for (const atmosphere of TIER_25_UNIFIED_VOCABULARY.atmospheres) {
    const atmosphereWords = atmosphere.toLowerCase().split(' ');
    if (atmosphereWords.some(word => lowerText.includes(word))) {
      return atmosphere;
    }
  }
  
  // Time-based atmosphere detection
  if (lowerText.includes('morning') || lowerText.includes('dawn')) return 'brightened by cheerful morning sunshine';
  if (lowerText.includes('afternoon') || lowerText.includes('day')) return 'enhanced by gentle afternoon light';
  if (lowerText.includes('evening') || lowerText.includes('sunset')) return 'illuminated by soft golden hour light';
  if (lowerText.includes('night') || lowerText.includes('dark')) return 'warmed by inviting indoor lighting';
  
  // Mood-based atmosphere
  if (lowerText.includes('bright') || lowerText.includes('sunny')) return 'filled with bright natural light';
  if (lowerText.includes('cozy') || lowerText.includes('warm')) return 'glowing with cozy interior warmth';
  if (lowerText.includes('peaceful') || lowerText.includes('quiet')) return 'establishing a peaceful mood';
  if (lowerText.includes('exciting') || lowerText.includes('fun')) return 'radiating positive energy';
  
  return 'bathed in warm natural lighting';
}

function extractActionObjects(pageText) {
  const lowerText = pageText.toLowerCase();
  
  // Check for educational objects
  for (const obj of TIER_25_UNIFIED_VOCABULARY.objects.educational) {
    const objWords = obj.toLowerCase().split(' ');
    if (objWords.some(word => lowerText.includes(word))) {
      return obj;
    }
  }
  
  // Check for recreational objects
  for (const obj of TIER_25_UNIFIED_VOCABULARY.objects.recreational) {
    const objWords = obj.toLowerCase().split(' ');
    if (objWords.some(word => lowerText.includes(word))) {
      return obj;
    }
  }
  
  // Check for everyday objects
  for (const obj of TIER_25_UNIFIED_VOCABULARY.objects.everyday) {
    const objWords = obj.toLowerCase().split(' ');
    if (objWords.some(word => lowerText.includes(word))) {
      return obj;
    }
  }
  
  // Specific object detection
  if (lowerText.includes('book') || lowerText.includes('read')) return 'colorful storybooks';
  if (lowerText.includes('toy') || lowerText.includes('play')) return 'favorite toys';
  if (lowerText.includes('ball') || lowerText.includes('sport')) return 'sports equipment';
  if (lowerText.includes('art') || lowerText.includes('draw') || lowerText.includes('paint')) return 'art supplies';
  if (lowerText.includes('music') || lowerText.includes('sing') || lowerText.includes('instrument')) return 'musical instruments';
  if (lowerText.includes('game') || lowerText.includes('puzzle')) return 'educational games';
  if (lowerText.includes('food') || lowerText.includes('eat') || lowerText.includes('lunch')) return 'delicious food items';
  if (lowerText.includes('clothes') || lowerText.includes('dress') || lowerText.includes('wear')) return 'comfortable clothing';
  
  // Return generic colorful items if no specific objects detected
  return 'colorful items';
}

function extractColoredObjects(pageText) {
  const lowerText = pageText.toLowerCase();
  
  // Look for color + object combinations
  const colorPatterns = [
    'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'white', 'black', 'brown',
    'bright', 'dark', 'light', 'colorful', 'vibrant', 'soft', 'warm', 'cool'
  ];
  
  const objectPatterns = [
    'book', 'toy', 'ball', 'shirt', 'dress', 'hat', 'shoes', 'bag', 'box', 'flower',
    'chair', 'table', 'door', 'window', 'car', 'bike', 'blanket', 'pillow', 'cup', 'plate'
  ];
  
  for (const color of colorPatterns) {
    for (const object of objectPatterns) {
      if (lowerText.includes(color) && lowerText.includes(object)) {
        return `${color} ${object}`;
      }
    }
  }
  
  // Check vocabulary colors
  for (const colorType of Object.keys(TIER_25_UNIFIED_VOCABULARY.colors)) {
    for (const color of TIER_25_UNIFIED_VOCABULARY.colors[colorType]) {
      const colorWords = color.toLowerCase().split(' ');
      if (colorWords.some(word => lowerText.includes(word))) {
        return `items with ${color}`;
      }
    }
  }
  
  // Default to generic colorful objects
  return 'vibrant colorful objects';
}

function extractSensoryDetails(pageText) {
  const lowerText = pageText.toLowerCase();
  
  // Check for sensory vocabulary
  for (const sensory of TIER_25_UNIFIED_VOCABULARY.sensoryDetails) {
    const sensoryWords = sensory.toLowerCase().split(' ');
    if (sensoryWords.some(word => lowerText.includes(word))) {
      return sensory;
    }
  }
  
  // Specific sensory detection
  if (lowerText.includes('sound') || lowerText.includes('hear') || lowerText.includes('listen')) return 'filled with gentle sounds';
  if (lowerText.includes('touch') || lowerText.includes('feel') || lowerText.includes('soft')) return 'touched by soft textures';
  if (lowerText.includes('smell') || lowerText.includes('scent') || lowerText.includes('fragrant')) return 'scented with fresh aromas';
  if (lowerText.includes('warm') || lowerText.includes('cool') || lowerText.includes('temperature')) return 'warmed by comfortable temperatures';
  if (lowerText.includes('music') || lowerText.includes('song') || lowerText.includes('melody')) return 'accompanied by melodic tones';
  if (lowerText.includes('taste') || lowerText.includes('flavor') || lowerText.includes('delicious')) return 'flavored with delicious tastes';
  
  return 'enhanced by natural sounds';
}

function extractSpatialComposition(pageText) {
  const lowerText = pageText.toLowerCase();
  
  // Check for composition vocabulary
  for (const composition of TIER_25_UNIFIED_VOCABULARY.compositions) {
    const compositionWords = composition.toLowerCase().split(' ');
    if (compositionWords.some(word => lowerText.includes(word))) {
      return composition;
    }
  }
  
  // Positional composition detection
  if (lowerText.includes('center') || lowerText.includes('middle')) return 'centered composition focus';
  if (lowerText.includes('left') || lowerText.includes('right')) return 'asymmetrical creative balance';
  if (lowerText.includes('front') || lowerText.includes('foreground')) return 'foreground interest focus';
  if (lowerText.includes('back') || lowerText.includes('background')) return 'background context support';
  if (lowerText.includes('above') || lowerText.includes('below')) return 'vertical element strength';
  if (lowerText.includes('beside') || lowerText.includes('next')) return 'horizontal line emphasis';
  
  // Movement-based composition
  if (lowerText.includes('walk') || lowerText.includes('move') || lowerText.includes('step')) return 'dynamic diagonal arrangement';
  if (lowerText.includes('circle') || lowerText.includes('round') || lowerText.includes('around')) return 'circular composition flow';
  if (lowerText.includes('line') || lowerText.includes('row') || lowerText.includes('straight')) return 'leading lines guidance';
  
  return 'rule of thirds balance';
}

// ============= NUCLEAR INDEPENDENT CHARACTER GENERATION =============

function getCharacterConsistencyData(sessionId, avatarIdentity) {
  // Placeholder for character consistency - will be enhanced with actual implementation
  if (!sessionId || !avatarIdentity) {
    return null;
  }
  
  // This would integrate with CharacterConsistencyService for real implementation
  // For now, return basic structure
  return {
    seed: `${sessionId}_${avatarIdentity.gender}_${avatarIdentity.skinTone}`,
    characterDescription: null // Will be generated by character service
  };
}

async function generateCharacterDescription(avatarIdentity, culturalProfile, difficulty, sessionId) {
  console.log('🎭 Tier 2.5: Generating nuclear independent character description');
  
  if (!avatarIdentity) {
    console.error('❌ Tier 2.5: No avatar identity provided');
    return 'young child';
  }
  
  try {
    // PHASE 1: CHARACTER CONSISTENCY SERVICE INTEGRATION
    if (sessionId) {
      const characterConsistencyService = new CharacterConsistencyService();
      const characterSeed = await characterConsistencyService.getCharacterSeed(
        sessionId,
        avatarIdentity,
        'story_context', // storyContext
        'premium', // sessionType
        '' // pageTextClothing
      );
      
      if (characterSeed && characterSeed.description) {
        console.log(`✅ Tier 2.5: Character consistency service provided: ${characterSeed.description}`);
        return characterSeed.description;
      }
    }
    
    // PHASE 2: NUCLEAR INDEPENDENT FALLBACK GENERATION
    console.log('🔧 Tier 2.5: Using nuclear independent character generation');
    
    const gender = avatarIdentity.gender || 'child';
    const skinTone = avatarIdentity.skinTone || 'medium';
    
    // Use seeded selection for consistency
    const seed = sessionId ? `${sessionId}_${gender}_${skinTone}` : `${gender}_${skinTone}`;
    
    let characterParts = [];
    
    // Age determination based on difficulty
    const ageMapping = {
      'beginner': '5-year-old',
      'easy': '6-year-old', 
      'medium': '7-year-old',
      'hard': '8-year-old',
      'expert': '9-year-old'
    };
    const age = ageMapping[difficulty] || '7-year-old';
    characterParts.push(age);
    
    // Cultural profile and ethnicity handling
    if (culturalProfile === 'african_american' || 
        (avatarIdentity.skinTone && ['dark brown', 'brown', 'deep brown'].some(tone => avatarIdentity.skinTone.includes(tone)))) {
      
      // African American character generation
      characterParts.push('African American child');
      
      // Hair selection
      const hairArray = gender === 'girl' ? 
        HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.girls : 
        HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.boys;
      const selectedHair = getSeededElement(hairArray, seed + '_hair');
      if (selectedHair) characterParts.push(selectedHair);
      
      // Facial features
      const selectedFeatures = getSeededElement(HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES, seed + '_features');
      if (selectedFeatures) characterParts.push(selectedFeatures);
      
    } else {
      // Standard American character generation
      characterParts.push(`${skinTone} complexion`);
      
      // Let AI handle hair generation for non-African American characters
      const hairStyles = gender === 'girl' ? 
        ['beautiful long hair', 'stylish medium-length hair', 'cute short hair', 'wavy hair', 'straight hair'] :
        ['neat short hair', 'casual hair style', 'trendy haircut', 'natural hair', 'well-groomed hair'];
      const selectedHair = getSeededElement(hairStyles, seed + '_hair');
      characterParts.push(selectedHair);
      
      // Basic facial features
      const basicFeatures = [
        'bright sparkling eyes and gentle smile',
        'kind eyes and cheerful expression', 
        'expressive eyes and warm smile',
        'friendly demeanor and happy face',
        'gentle features and bright smile'
      ];
      const selectedFeatures = getSeededElement(basicFeatures, seed + '_features');
      characterParts.push(selectedFeatures);
    }
    
    const result = characterParts.join(', ');
    console.log(`✅ Tier 2.5: Nuclear independent character generated: ${result}`);
    return result;
    
  } catch (error) {
    console.error('❌ Tier 2.5: Character generation error:', error.message);
    return `${difficulty === 'beginner' ? '5-year-old' : '7-year-old'} child with friendly appearance`;
  }
}

// ============= NUCLEAR INDEPENDENT TEMPLATE FILLING =============

async function fillPromptTemplate(template, pageText, avatarIdentity, culturalProfile, difficulty, sessionId, pageNumber) {
  console.log('🔧 Tier 2.5: Nuclear independent template filling');
  
  try {
    // Generate character description with consistency
    const character = await generateCharacterDescription(avatarIdentity, culturalProfile, difficulty, sessionId);
    
    // Extract all placeholder values using intelligent extraction
    const age = difficulty === 'beginner' ? '5-year-old' : difficulty === 'easy' ? '6-year-old' : '7-year-old';
    const emotion = extractEmotion(pageText);
    const setting = extractSetting(pageText);
    const atmosphere = extractAtmosphere(pageText);
    
    // Enhanced action extraction
    const actionIntensity = extractActionIntensity(pageText);
    const bodyLanguage = extractBodyLanguage(pageText);
    const spatialPositioning = extractSpatialPositioning(pageText);
    
    // Object and sensory extraction
    const actionObjects = extractActionObjects(pageText);
    const coloredObjects = extractColoredObjects(pageText);
    const sensoryDetails = extractSensoryDetails(pageText);
    const spatialComposition = extractSpatialComposition(pageText);
    const objectInteraction = extractObjectInteraction(pageText, actionObjects);
    
    // Secondary characters with seeded consistency
    const secondaryCharacters = await getSeededSecondaryCharacters(pageText, sessionId, pageNumber);
    
    // Cultural and community context
    const communityContext = culturalProfile === 'african_american' ? 
      'celebrating African American culture and heritage' : 
      'celebrating diverse community values';
    
    // Get style settings for framework prompt
    const styleSettings = NUCLEAR_STYLE_SETTINGS[difficulty] || NUCLEAR_STYLE_SETTINGS.medium;
    const frameworkPrompt = styleSettings.frameworkPrompt;
    
    // Camera directive based on difficulty
    const cameraDirectives = {
      'beginner': 'medium shot with clear character focus',
      'easy': 'medium shot with character and environment balance', 
      'medium': 'dynamic composition with character prominence',
      'hard': 'cinematic framing with detailed environment',
      'expert': 'professional composition with artistic depth'
    };
    const cameraDirective = cameraDirectives[difficulty] || cameraDirectives.medium;
    
    // Fill template with extracted values
    let filledTemplate = template
      .replace(/{frameworkPrompt}/g, frameworkPrompt)
      .replace(/{cameraDirective}/g, cameraDirective)
      .replace(/{pageText}/g, pageText)
      .replace(/{character}/g, character)
      .replace(/{age}/g, age)
      .replace(/{ethnicity}/g, culturalProfile === 'african_american' ? 'African American' : 'diverse background')
      .replace(/{hair}/g, '') // Hair included in character description
      .replace(/{features}/g, '') // Features included in character description  
      .replace(/{emotion}/g, emotion)
      .replace(/{scene}/g, `engaging in ${pageText.split(' ').slice(0, 8).join(' ')}...`)
      .replace(/{action_intensity}/g, actionIntensity)
      .replace(/{spatial_positioning}/g, spatialPositioning)
      .replace(/{object_interaction}/g, objectInteraction)
      .replace(/{body_language}/g, bodyLanguage)
      .replace(/{spatial_composition}/g, spatialComposition)
      .replace(/{setting}/g, setting)
      .replace(/{atmosphere}/g, atmosphere)
      .replace(/{props}/g, actionObjects)
      .replace(/{action_objects}/g, actionObjects)
      .replace(/{colored_objects}/g, coloredObjects)
      .replace(/{sensory_details}/g, sensoryDetails)
      .replace(/{community_context}/g, communityContext)
      .replace(/{secondary_characters}/g, secondaryCharacters)
      .replace(/{subject}/g, '') // Redundant with character
      .replace(/{action}/g, '') // Covered by scene and body language
      .replace(/{adjective}/g, 'vibrant'); // Generic adjective for basic templates
    
    // Clean up any remaining empty placeholders or double spaces
    filledTemplate = filledTemplate
      .replace(/\{\w+\}/g, '') // Remove any unfilled placeholders
      .replace(/\s+/g, ' ') // Normalize spaces
      .replace(/,\s*,/g, ',') // Remove double commas
      .replace(/\.\s*\./g, '.') // Remove double periods
      .trim();
    
    console.log(`✅ Tier 2.5: Template filled successfully (${filledTemplate.length} chars)`);
    return filledTemplate;
    
  } catch (error) {
    console.error('❌ Tier 2.5: Template filling error:', error.message);
    // Return basic template with minimal placeholders
    const basicTemplate = `${pageText}. Character: young child with ${difficulty} difficulty level.`;
    return basicTemplate;
  }
}

// ============= NUCLEAR INDEPENDENT PROMPT PROCESSOR =============

async function processCompletePrompt(pageText, avatarIdentity, culturalProfile, difficulty, sessionId, pageNumber, templateType = 'premium') {
  console.log(`🎯 Tier 2.5: Processing complete prompt (${templateType} template)`);
  
  try {
    // Select template based on type and difficulty
    const templateSource = templateType === 'premium' ? PREMIUM_PROMPT_TEMPLATES : BASIC_PROMPT_TEMPLATES;
    const template = templateSource[difficulty] || templateSource.medium;
    
    console.log(`📋 Using ${templateType} template for ${difficulty} difficulty`);
    
    // Fill template with intelligent extraction
    const filledPrompt = await fillPromptTemplate(
      template, 
      pageText, 
      avatarIdentity, 
      culturalProfile, 
      difficulty, 
      sessionId, 
      pageNumber
    );
    
    console.log(`✅ Tier 2.5: Complete prompt generated (${filledPrompt.length} characters)`);
    return filledPrompt;
    
  } catch (error) {
    console.error('❌ Tier 2.5: Complete prompt processing error:', error.message);
    
    // Emergency fallback
    const emergencyPrompt = `${EMERGENCY_FALLBACK_FRAMEWORK}. Scene: ${pageText}. Character: child with friendly appearance.`;
    console.log('🚨 Using emergency fallback prompt');
    return emergencyPrompt;
  }
}

// ============= SIMPLIFIED PROMPT PROCESSING FOR RUNWARE =============

function processPromptForRunware(prompt, difficulty) {
  // Simple prompt processing without complex truncation
  // Just ensure reasonable length for Runware API
  const maxLength = 1800; // Safe limit for Runware
  
  if (prompt.length <= maxLength) {
    return prompt;
  }
  
  // Simple truncation at sentence boundary
  const truncated = prompt.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');
  
  if (lastSentence > maxLength * 0.8) {
    return truncated.substring(0, lastSentence + 1);
  }
  
  return truncated + '...';
}

// ============= NUCLEAR INDEPENDENT CULTURAL DETECTION =============

function detectCulturalProfileFromAvatar(avatarIdentity) {
  if (!avatarIdentity) return 'standard_american';
  
  // Check skin tone indicators
  const skinTone = avatarIdentity.skinTone || '';
  const language = avatarIdentity.language || 'en';
  
  // African American detection
  if (skinTone.includes('dark brown') || 
      skinTone.includes('deep brown') || 
      skinTone.includes('ebony') || 
      skinTone.includes('mahogany') ||
      skinTone.includes('chocolate')) {
    return 'african_american';
  }
  
  if (skinTone.includes('brown') || skinTone.includes('caramel')) {
    // Could be African American or other ethnicities
    // Use additional context if available
    if (language === 'en' || language === 'en-US') {
      return 'african_american'; // Default assumption for brown skin + English
    }
  }
  
  // Language-based cultural detection
  if (language.startsWith('es')) return 'hispanic_latino';
  if (language === 'zh' || language === 'zh-CN') return 'chinese';
  if (language === 'ar') return 'middle_eastern';
  
  return 'standard_american';
}

// ============= MAIN TIER 2.5 NUCLEAR INDEPENDENCE FUNCTION =============

serve(async (req) => {
  console.log('🛡️ Tier 2.5: Nuclear Independence Edge Function Started');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }
  
  if (req.method !== 'POST') {
    return createCorsErrorResponse('Method not allowed', 405);
  }
  
  try {
    const requestData = await req.json();
    console.log('🛡️ Tier 2.5: Processing request with nuclear independence');
    
    // Extract request parameters with defaults
    const {
      pageText = '',
      avatarIdentity = null,
      difficulty = 'medium',
      sessionId = crypto.randomUUID(),
      pageNumber = 1,
      templateType = 'premium'
    } = requestData;
    
    // Validate required parameters
    if (!pageText) {
      return createCorsErrorResponse('Page text is required', 400);
    }
    
    const startTime = Date.now();
    let successfulTier = 'Tier 2.5 Nuclear Independence';
    let tierPath = [successfulTier];
    let attemptedTiers = [successfulTier];
    let enhancementLevel = 'Nuclear Independent Processing';
    let fallbackReason = 'Primary tier execution';
    
    // PHASE 1: CULTURAL PROFILE DETECTION
    const culturalProfile = detectCulturalProfileFromAvatar(avatarIdentity);
    console.log(`🌍 Tier 2.5: Cultural profile detected: ${culturalProfile}`);
    
    // PHASE 2: CHARACTER CONSISTENCY SETUP
    let characterData = null;
    let avatarMapping = null;
    
    try {
      if (sessionId && avatarIdentity) {
        console.log('🎭 Tier 2.5: Setting up character consistency');
        characterData = getCharacterConsistencyData(sessionId, avatarIdentity);
        
        // Character mapping for consistency
        avatarMapping = {
          source: 'nuclear-independence',
          culturalProfile: culturalProfile,
          sessionId: sessionId,
          enhanced: !!(characterData && characterData.seed)
        };
        
        console.log(`✅ Tier 2.5: Character consistency established (${avatarMapping.enhanced ? 'enhanced' : 'basic'})`);
      }
    } catch (characterError) {
      console.warn('⚠️ Tier 2.5: Character consistency setup failed:', characterError.message);
      characterData = null;
      avatarMapping = { source: 'fallback', enhanced: false };
    }
    
    // PHASE 3: PROMPT GENERATION WITH NUCLEAR INDEPENDENCE
    let prompt = '';
    try {
      prompt = await processCompletePrompt(
        pageText,
        avatarIdentity,
        culturalProfile,
        difficulty,
        sessionId,
        pageNumber,
        templateType
      );
      console.log(`🎯 Tier 2.5: Prompt generated successfully (${prompt.length} chars)`);
    } catch (promptError) {
      console.error('❌ Tier 2.5: Prompt generation failed:', promptError.message);
      prompt = `${EMERGENCY_FALLBACK_FRAMEWORK}. Scene: ${pageText}. Character: child with friendly appearance.`;
      fallbackReason = 'Emergency prompt fallback due to processing error';
    }
    
    // PHASE 4: NEGATIVE PROMPT GENERATION
    let negativePrompt = '';
    try {
      if (typeof generateNuclearNegativePrompt === 'function') {
        negativePrompt = generateNuclearNegativePrompt(
          culturalProfile,
          avatarIdentity?.gender || 'child',
          difficulty,
          pageNumber || 1,
          [] // secondaryCharacters array
        );
        console.log(`🚫 Tier 2.5: Nuclear negative prompt generated (${negativePrompt.length} chars)`);
      } else {
        throw new Error('Nuclear negative prompt function not available');
      }
    } catch (negativeError) {
      console.warn('⚠️ Tier 2.5: Nuclear negative prompt failed:', negativeError.message);
      negativePrompt = 'low quality, blurry, distorted, inappropriate content, adult themes, violence, scary content, dark themes, sad expressions, crying, unsafe situations, inappropriate clothing, adult characters, realistic photography, photorealistic, mature content, complex backgrounds that distract from character, cluttered scenes, poor lighting, harsh shadows, overexposed, underexposed';
      fallbackReason = 'Negative prompt fallback applied';
    }
    
    // PHASE 5: STYLE SETTINGS
    const styleSettings = NUCLEAR_STYLE_SETTINGS[difficulty] || NUCLEAR_STYLE_SETTINGS.medium;
    
    // PHASE 6: RUNWARE API INTEGRATION
    console.log('🚀 Tier 2.5: Connecting to Runware API...');
    
    // Track objects and secondary characters for response
    const objects = extractActionObjects(pageText);
    const secondary_characters = await getSeededSecondaryCharacters(pageText, sessionId, pageNumber);
    
    return new Promise((resolve) => {
      let isResolved = false;
      const resolveOnce = (result) => {
        if (!isResolved) {
          isResolved = true;
          resolve(result);
        }
      };
      
      let finalPrompt = prompt;
      
      const ws = new WebSocket('wss://ws-api.runware.ai/v1');
      
      ws.onopen = () => {
        console.log('🛡️ Tier 2.5: WebSocket connected, authenticating...');
        
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