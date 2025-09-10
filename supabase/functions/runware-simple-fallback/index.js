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

// LATINO/HISPANIC ARRAYS (Nuclear Independence - Combined Features Only)
const HARDCODED_LATINO_HAIRSTYLES = {
  boys: [
    'textured wavy hair', 'detailed curly hair', 'textured straight hair', 'detailed wavy fade',
    'textured curly fade', 'detailed straight fade', 'textured pompadour', 'detailed quiff',
    'textured side part', 'detailed slicked back', 'textured messy hair', 'detailed tousled hair',
    'textured crew cut', 'detailed buzz cut', 'textured caesar cut', 'detailed faux hawk',
    'textured undercut', 'detailed side swept', 'textured spiky hair', 'detailed layered cut'
  ],
  girls: [
    'wearing long wavy hair with natural texture, flowing movement, dimensional waves, soft volume',
    'wearing long straight hair with sleek finish, smooth texture, natural shine, flowing length',
    'wearing long curly hair with defined curl pattern, bouncy texture, voluminous curls, natural movement',
    'wearing medium wavy hair with soft waves, natural texture, gentle movement, dimensional styling',
    'wearing medium straight hair with smooth finish, sleek texture, polished appearance, professional styling',
    'wearing medium curly hair with defined curls, bouncy texture, soft volume, natural curl pattern',
    'wearing a high ponytail with smooth edges, sleek finish, tight control, polished styling',
    'wearing a low ponytail with natural texture, soft finish, gentle styling, flowing movement',
    'wearing loose braids with natural texture, soft weaving, dimensional styling, flowing length',
    'wearing a sleek bun with smooth edges, polished finish, professional styling, neat appearance'
  ]
};

const HARDCODED_LATINO_SKIN_TONES = [
  'light olive complexion', 'warm beige skin', 'golden tan complexion', 'medium olive skin',
  'caramel complexion', 'bronze skin tone', 'warm brown complexion', 'honey-toned skin',
  'light brown complexion', 'medium brown skin', 'rich tan complexion', 'golden brown skin'
];

const HARDCODED_LATINO_FACIAL_FEATURES = [
  // Light Tones
  "light olive skin tone with warm brown eyes, full lips, defined cheekbones, elegant nose shape",
  "warm beige complexion with dark brown eyes, soft lips, high cheekbones, refined nose bridge",
  "golden tan skin with hazel eyes, naturally full lips, sculpted cheekbones, authentic nose shape",
  "light caramel complexion with amber eyes, expressive lips, defined facial structure, natural nose",
  "honey-toned skin with golden brown eyes, full lips, prominent cheekbones, elegant nose bridge",
  
  // Medium Tones
  "medium olive skin tone with deep brown eyes, full lips, strong cheekbones, natural nose shape",
  "caramel complexion with warm amber eyes, soft full lips, defined cheekbones, refined nose bridge",
  "bronze skin tone with hazel-brown eyes, naturally full lips, sculpted cheekbones, elegant nose",
  "warm brown complexion with golden eyes, expressive lips, prominent cheekbones, authentic nose shape",
  "medium tan skin with dark brown eyes, full lips, high cheekbones, natural nose bridge",
  
  // Medium-Dark Tones
  "rich brown skin tone with warm amber eyes, full lips, defined cheekbones, elegant nose shape",
  "deep caramel complexion with golden brown eyes, soft full lips, strong cheekbones, refined nose",
  "warm bronze skin with hazel eyes, naturally full lips, sculpted cheekbones, authentic nose bridge",
  "medium brown complexion with amber eyes, expressive lips, prominent cheekbones, natural nose shape",
  "golden brown skin tone with deep brown eyes, full lips, high cheekbones, elegant nose bridge"
];

// ASIAN ARRAYS (Nuclear Independence - Combined Features Only)
const HARDCODED_ASIAN_HAIRSTYLES = {
  boys: [
    'textured straight hair', 'detailed sleek hair', 'textured side part', 'detailed pompadour',
    'textured undercut', 'detailed fade cut', 'textured crew cut', 'detailed buzz cut',
    'textured quiff', 'detailed slicked back', 'textured messy hair', 'detailed tousled hair',
    'textured spiky hair', 'detailed layered cut', 'textured caesar cut', 'detailed faux hawk',
    'textured bowl cut', 'detailed mushroom cut', 'textured fringe', 'detailed bangs'
  ],
  girls: [
    'wearing long straight hair with sleek finish, smooth texture, natural shine, flowing length',
    'wearing long wavy hair with soft waves, natural movement, dimensional styling, gentle texture',
    'wearing medium straight hair with smooth finish, polished appearance, sleek texture, professional styling',
    'wearing medium wavy hair with natural waves, soft texture, flowing movement, dimensional styling',
    'wearing a high ponytail with sleek finish, smooth edges, tight control, polished styling',
    'wearing a low ponytail with natural texture, soft finish, gentle styling, flowing movement',
    'wearing loose braids with natural texture, soft weaving, dimensional styling, flowing length',
    'wearing a sleek bun with smooth edges, polished finish, professional styling, neat appearance',
    'wearing bangs with straight hair, precise cutting, smooth texture, framing face styling',
    'wearing side-swept bangs with natural texture, soft styling, flowing movement, dimensional finish'
  ]
};

const HARDCODED_ASIAN_SKIN_TONES = [
  'light porcelain complexion', 'warm ivory skin', 'golden beige complexion', 'light olive skin',
  'honey-toned complexion', 'warm tan skin', 'light brown complexion', 'golden tan skin',
  'medium olive complexion', 'warm beige skin', 'light caramel complexion', 'bronze skin tone'
];

const HARDCODED_ASIAN_FACIAL_FEATURES = [
  // Light Tones
  "light porcelain skin tone with dark brown eyes, soft lips, defined cheekbones, elegant nose bridge",
  "warm ivory complexion with deep brown eyes, naturally full lips, high cheekbones, refined nose shape",
  "golden beige skin with amber-brown eyes, soft expressive lips, sculpted cheekbones, authentic nose bridge",
  "light olive complexion with warm brown eyes, full lips, defined facial structure, natural nose shape",
  "honey-toned skin with golden brown eyes, soft lips, prominent cheekbones, elegant nose bridge",
  
  // Medium Tones
  "warm tan skin tone with deep brown eyes, naturally full lips, strong cheekbones, refined nose shape",
  "light brown complexion with amber eyes, soft expressive lips, defined cheekbones, authentic nose bridge",
  "golden tan skin with dark brown eyes, full lips, sculpted cheekbones, natural nose shape",
  "medium olive complexion with warm brown eyes, soft lips, prominent cheekbones, elegant nose bridge",
  "warm beige skin tone with golden brown eyes, naturally full lips, high cheekbones, refined nose shape",
  
  // Medium-Dark Tones
  "light caramel complexion with deep brown eyes, soft expressive lips, defined cheekbones, authentic nose bridge",
  "bronze skin tone with amber-brown eyes, naturally full lips, strong cheekbones, refined nose shape",
  "warm medium brown skin with golden eyes, soft lips, sculpted cheekbones, natural nose bridge",
  "medium tan complexion with dark brown eyes, full lips, prominent cheekbones, elegant nose shape",
  "golden brown skin tone with warm amber eyes, soft expressive lips, high cheekbones, refined nose bridge"
];

// CAUCASIAN ARRAYS (Nuclear Independence - Combined Features Only)
const HARDCODED_CAUCASIAN_HAIRSTYLES = {
  boys: [
    'textured blonde hair', 'detailed brown hair', 'textured red hair', 'detailed black hair',
    'textured wavy hair', 'detailed curly hair', 'textured straight hair', 'detailed crew cut',
    'textured buzz cut', 'detailed fade cut', 'textured pompadour', 'detailed quiff',
    'textured undercut', 'detailed side part', 'textured messy hair', 'detailed tousled hair',
    'textured spiky hair', 'detailed layered cut', 'textured caesar cut', 'detailed faux hawk'
  ],
  girls: [
    'wearing long blonde hair with natural texture, flowing movement, dimensional highlights, soft volume',
    'wearing long brown hair with smooth finish, natural shine, flowing length, dimensional color',
    'wearing long red hair with natural texture, vibrant color, flowing movement, soft waves',
    'wearing long black hair with sleek finish, natural shine, smooth texture, flowing length',
    'wearing medium blonde hair with soft waves, natural texture, dimensional styling, gentle movement',
    'wearing medium brown hair with smooth finish, polished appearance, natural shine, professional styling',
    'wearing medium red hair with natural waves, vibrant color, soft texture, flowing movement',
    'wearing medium black hair with sleek finish, smooth texture, polished styling, natural shine',
    'wearing a high ponytail with smooth edges, sleek finish, tight control, polished styling',
    'wearing a low ponytail with natural texture, soft finish, gentle styling, flowing movement'
  ]
};

const HARDCODED_CAUCASIAN_SKIN_TONES = [
  'fair porcelain complexion', 'light ivory skin', 'warm peach complexion', 'light olive skin',
  'rosy complexion', 'golden beige skin', 'light tan complexion', 'warm honey skin',
  'peachy complexion', 'light bronze skin', 'warm ivory complexion', 'golden tan skin'
];

const HARDCODED_CAUCASIAN_FACIAL_FEATURES = [
  // Light Tones
  "fair porcelain skin tone with blue eyes, soft pink lips, defined cheekbones, refined nose bridge",
  "light ivory complexion with green eyes, naturally full lips, high cheekbones, elegant nose shape",
  "warm peach skin with hazel eyes, soft expressive lips, sculpted cheekbones, authentic nose bridge",
  "light olive complexion with brown eyes, full lips, defined facial structure, natural nose shape",
  "rosy skin tone with gray eyes, soft lips, prominent cheekbones, refined nose bridge",
  
  // Medium Tones
  "golden beige skin tone with amber eyes, naturally full lips, strong cheekbones, elegant nose shape",
  "light tan complexion with blue-green eyes, soft expressive lips, defined cheekbones, refined nose bridge",
  "warm honey skin with brown eyes, full lips, sculpted cheekbones, authentic nose shape",
  "peachy complexion with hazel eyes, soft lips, prominent cheekbones, natural nose bridge",
  "light bronze skin tone with green eyes, naturally full lips, high cheekbones, elegant nose shape",
  
  // Medium-Dark Tones
  "warm ivory complexion with deep brown eyes, soft expressive lips, defined cheekbones, refined nose bridge",
  "golden tan skin tone with amber eyes, naturally full lips, strong cheekbones, authentic nose shape",
  "medium olive complexion with hazel-brown eyes, full lips, sculpted cheekbones, natural nose bridge",
  "warm beige skin with blue eyes, soft lips, prominent cheekbones, elegant nose shape",
  "light caramel complexion with green eyes, naturally full lips, high cheekbones, refined nose bridge"
];

// MIDDLE EASTERN ARRAYS (Nuclear Independence - Combined Features Only)
const HARDCODED_MIDDLE_EASTERN_HAIRSTYLES = {
  boys: [
    'textured dark hair', 'detailed black hair', 'textured brown hair', 'detailed wavy hair',
    'textured curly hair', 'detailed straight hair', 'textured fade cut', 'detailed undercut',
    'textured pompadour', 'detailed quiff', 'textured side part', 'detailed slicked back',
    'textured crew cut', 'detailed buzz cut', 'textured caesar cut', 'detailed faux hawk',
    'textured messy hair', 'detailed tousled hair', 'textured spiky hair', 'detailed layered cut'
  ],
  girls: [
    'wearing long dark hair with natural texture, flowing movement, dimensional styling, soft volume',
    'wearing long black hair with sleek finish, natural shine, smooth texture, flowing length',
    'wearing long brown hair with natural waves, soft texture, flowing movement, dimensional color',
    'wearing medium dark hair with smooth finish, polished appearance, natural shine, professional styling',
    'wearing medium black hair with natural texture, soft waves, flowing movement, dimensional styling',
    'wearing medium brown hair with sleek finish, smooth texture, polished styling, natural shine',
    'wearing a high ponytail with smooth edges, sleek finish, tight control, polished styling',
    'wearing a low ponytail with natural texture, soft finish, gentle styling, flowing movement',
    'wearing loose braids with natural texture, soft weaving, dimensional styling, flowing length',
    'wearing a sleek bun with smooth edges, polished finish, professional styling, neat appearance'
  ]
};

const HARDCODED_MIDDLE_EASTERN_SKIN_TONES = [
  'light olive complexion', 'warm beige skin', 'golden tan complexion', 'medium olive skin',
  'honey-toned complexion', 'warm bronze skin', 'light brown complexion', 'caramel skin tone',
  'medium tan complexion', 'golden brown skin', 'warm ivory complexion', 'light caramel skin'
];

const HARDCODED_MIDDLE_EASTERN_FACIAL_FEATURES = [
  // Light Tones
  "light olive skin tone with dark brown eyes, full lips, defined cheekbones, elegant nose bridge",
  "warm beige complexion with amber eyes, soft expressive lips, high cheekbones, refined nose shape",
  "golden tan skin with hazel-brown eyes, naturally full lips, sculpted cheekbones, authentic nose bridge",
  "medium olive complexion with deep brown eyes, full lips, defined facial structure, natural nose shape",
  "honey-toned skin with golden brown eyes, soft lips, prominent cheekbones, elegant nose bridge",
  
  // Medium Tones
  "warm bronze skin tone with amber eyes, naturally full lips, strong cheekbones, refined nose shape",
  "light brown complexion with dark brown eyes, soft expressive lips, defined cheekbones, authentic nose bridge",
  "caramel skin tone with hazel eyes, full lips, sculpted cheekbones, natural nose shape",
  "medium tan complexion with golden brown eyes, soft lips, prominent cheekbones, elegant nose bridge",
  "golden brown skin with deep brown eyes, naturally full lips, high cheekbones, refined nose shape",
  
  // Medium-Dark Tones
  "warm ivory complexion with amber-brown eyes, soft expressive lips, defined cheekbones, authentic nose bridge",
  "light caramel skin tone with dark brown eyes, naturally full lips, strong cheekbones, refined nose shape",
  "medium olive complexion with golden eyes, full lips, sculpted cheekbones, natural nose bridge",
  "warm beige skin with hazel-brown eyes, soft lips, prominent cheekbones, elegant nose shape",
  "bronze complexion with deep brown eyes, naturally full lips, high cheekbones, refined nose bridge"
];

// NATIVE AMERICAN ARRAYS (Nuclear Independence - Combined Features Only)
const HARDCODED_NATIVE_AMERICAN_HAIRSTYLES = {
  boys: [
    'textured long dark hair', 'detailed braided hair', 'textured traditional style', 'detailed modern cut',
    'textured straight hair', 'detailed wavy hair', 'textured ponytail', 'detailed loose hair',
    'textured crew cut', 'detailed fade cut', 'textured undercut', 'detailed side part',
    'textured messy hair', 'detailed tousled hair', 'textured layered cut', 'detailed buzz cut',
    'textured caesar cut', 'detailed faux hawk', 'textured spiky hair', 'detailed pompadour'
  ],
  girls: [
    'wearing long dark hair with natural texture, flowing movement, traditional styling, cultural authenticity',
    'wearing long black hair with sleek finish, natural shine, smooth texture, flowing length',
    'wearing traditional braids with cultural styling, authentic weaving, dimensional texture, respectful representation',
    'wearing long straight hair with natural texture, flowing movement, dimensional styling, soft volume',
    'wearing medium dark hair with natural waves, soft texture, flowing movement, cultural authenticity',
    'wearing medium black hair with smooth finish, polished appearance, natural shine, professional styling',
    'wearing a high ponytail with natural texture, cultural styling, authentic appearance, respectful representation',
    'wearing a low ponytail with traditional elements, soft finish, gentle styling, flowing movement',
    'wearing loose hair with natural texture, cultural authenticity, flowing movement, dimensional styling',
    'wearing traditional styling with cultural elements, authentic appearance, respectful representation, natural beauty'
  ]
};

const HARDCODED_NATIVE_AMERICAN_SKIN_TONES = [
  'warm bronze complexion', 'light copper skin', 'golden tan complexion', 'medium bronze skin',
  'honey-toned complexion', 'warm brown skin', 'light brown complexion', 'caramel skin tone',
  'medium tan complexion', 'golden brown skin', 'warm olive complexion', 'rich bronze skin'
];

const HARDCODED_NATIVE_AMERICAN_FACIAL_FEATURES = [
  // Light Tones
  "warm bronze skin tone with dark brown eyes, full lips, defined cheekbones, strong nose bridge",
  "light copper complexion with deep brown eyes, naturally full lips, high cheekbones, authentic nose shape",
  "golden tan skin with amber-brown eyes, soft expressive lips, sculpted cheekbones, traditional features",
  "medium bronze complexion with dark eyes, full lips, defined facial structure, cultural authenticity",
  "honey-toned skin with golden brown eyes, soft lips, prominent cheekbones, respectful representation",
  
  // Medium Tones
  "warm brown skin tone with deep brown eyes, naturally full lips, strong cheekbones, authentic features",
  "light brown complexion with amber eyes, soft expressive lips, defined cheekbones, cultural representation",
  "caramel skin tone with dark brown eyes, full lips, sculpted cheekbones, traditional beauty",
  "medium tan complexion with golden brown eyes, soft lips, prominent cheekbones, respectful styling",
  "golden brown skin with deep brown eyes, naturally full lips, high cheekbones, authentic appearance",
  
  // Medium-Dark Tones
  "warm olive complexion with amber-brown eyes, soft expressive lips, defined cheekbones, cultural authenticity",
  "rich bronze skin tone with dark brown eyes, naturally full lips, strong cheekbones, traditional features",
  "medium brown complexion with golden eyes, full lips, sculpted cheekbones, respectful representation",
  "warm copper skin with hazel-brown eyes, soft lips, prominent cheekbones, authentic beauty",
  "deep bronze complexion with dark brown eyes, naturally full lips, high cheekbones, cultural respect"
];

// MIXED RACE ARRAYS (Nuclear Independence - Combined Features Only)
const HARDCODED_MIXED_RACE_HAIRSTYLES = {
  boys: [
    'textured curly hair', 'detailed wavy hair', 'textured straight hair', 'detailed coily hair',
    'textured fade cut', 'detailed undercut', 'textured crew cut', 'detailed buzz cut',
    'textured pompadour', 'detailed quiff', 'textured side part', 'detailed slicked back',
    'textured messy hair', 'detailed tousled hair', 'textured spiky hair', 'detailed layered cut',
    'textured caesar cut', 'detailed faux hawk', 'textured twist out', 'detailed natural texture'
  ],
  girls: [
    'wearing long curly hair with natural texture, defined curl pattern, bouncy volume, mixed heritage beauty',
    'wearing long wavy hair with soft waves, natural movement, dimensional styling, multicultural features',
    'wearing long straight hair with sleek finish, natural shine, flowing length, diverse representation',
    'wearing medium curly hair with defined curls, natural texture, soft volume, authentic mixed features',
    'wearing medium wavy hair with natural waves, soft texture, flowing movement, multicultural beauty',
    'wearing medium straight hair with smooth finish, polished appearance, diverse representation, natural shine',
    'wearing a high ponytail with natural texture, mixed heritage styling, authentic appearance, cultural blend',
    'wearing a low ponytail with soft finish, gentle styling, flowing movement, diverse beauty',
    'wearing loose curls with natural texture, defined pattern, bouncy movement, mixed race authenticity',
    'wearing natural styling with multicultural elements, authentic appearance, diverse representation, respectful beauty'
  ]
};

const HARDCODED_MIXED_RACE_SKIN_TONES = [
  'light caramel complexion', 'warm olive skin', 'golden beige complexion', 'medium tan skin',
  'honey-bronze complexion', 'warm brown skin', 'light bronze complexion', 'caramel-olive skin',
  'medium olive complexion', 'golden brown skin', 'warm caramel complexion', 'mixed heritage tone'
];

const HARDCODED_MIXED_RACE_FACIAL_FEATURES = [
  // Light Mixed Tones
  "light caramel skin tone with hazel eyes, full lips, defined cheekbones, mixed heritage features",
  "warm olive complexion with amber-green eyes, naturally full lips, high cheekbones, multicultural beauty",
  "golden beige skin with brown-green eyes, soft expressive lips, sculpted cheekbones, diverse features",
  "medium tan complexion with golden brown eyes, full lips, defined facial structure, mixed race authenticity",
  "honey-bronze skin with hazel-brown eyes, soft lips, prominent cheekbones, multicultural representation",
  
  // Medium Mixed Tones
  "warm brown skin tone with amber eyes, naturally full lips, strong cheekbones, mixed heritage beauty",
  "light bronze complexion with hazel eyes, soft expressive lips, defined cheekbones, diverse representation",
  "caramel-olive skin with golden brown eyes, full lips, sculpted cheekbones, multicultural features",
  "medium olive complexion with amber-brown eyes, soft lips, prominent cheekbones, mixed race authenticity",
  "golden brown skin with hazel-green eyes, naturally full lips, high cheekbones, diverse beauty",
  
  // Medium-Dark Mixed Tones
  "warm caramel complexion with deep brown eyes, soft expressive lips, defined cheekbones, mixed heritage features",
  "mixed heritage tone with amber eyes, naturally full lips, strong cheekbones, multicultural beauty",
  "medium bronze complexion with golden brown eyes, full lips, sculpted cheekbones, diverse representation",
  "warm olive-brown skin with hazel eyes, soft lips, prominent cheekbones, mixed race authenticity",
  "rich caramel skin tone with amber-brown eyes, naturally full lips, high cheekbones, multicultural respect"
];

// ============= NUCLEAR INDEPENDENCE - ETHNICITY DETECTION SYSTEM =============
function detectEthnicityFromCharacterName(characterName) {
  if (!characterName || typeof characterName !== 'string') {
    console.log('🔍 No character name provided, defaulting to mixed');
    return 'mixed';
  }

  const name = characterName.toLowerCase().trim();
  console.log('🔍 Detecting ethnicity for character:', name);

  // African American names
  const africanAmericanNames = [
    'aisha', 'malik', 'keisha', 'jamal', 'latoya', 'deshawn', 'tanisha', 'marcus',
    'aaliyah', 'tyrone', 'shanice', 'devon', 'imani', 'terrell', 'jasmine', 'antoine',
    'zara', 'khalil', 'nia', 'darius', 'amara', 'jalen', 'kendra', 'isaiah',
    'maya', 'cameron', 'destiny', 'jordan', 'kiara', 'xavier', 'diamond', 'elijah'
  ];

  // Latino/Hispanic names
  const latinoNames = [
    'sofia', 'diego', 'maria', 'carlos', 'isabella', 'miguel', 'camila', 'alejandro',
    'lucia', 'fernando', 'valentina', 'ricardo', 'gabriela', 'antonio', 'natalia', 'jose',
    'ana', 'luis', 'elena', 'pablo', 'carmen', 'rafael', 'rosa', 'manuel',
    'esperanza', 'francisco', 'dolores', 'juan', 'mercedes', 'pedro', 'gloria', 'ramon'
  ];

  // Asian names
  const asianNames = [
    'mei', 'hiroshi', 'yuki', 'kenji', 'sakura', 'takeshi', 'akiko', 'ryu',
    'li', 'chen', 'wang', 'zhang', 'liu', 'yang', 'huang', 'zhao',
    'priya', 'raj', 'anita', 'vikram', 'kavya', 'arjun', 'deepika', 'rohit',
    'kim', 'park', 'lee', 'choi', 'jung', 'kang', 'yoon', 'shin'
  ];

  // Middle Eastern names
  const middleEasternNames = [
    'omar', 'fatima', 'hassan', 'amal', 'ahmed', 'layla', 'mohammed', 'zara',
    'ali', 'nadia', 'yusuf', 'sara', 'ibrahim', 'maryam', 'khalid', 'amina',
    'tariq', 'yasmin', 'rashid', 'leila', 'samir', 'dina', 'karim', 'rania'
  ];

  // Native American names
  const nativeAmericanNames = [
    'aiyana', 'koda', 'nova', 'kai', 'luna', 'river', 'sage', 'phoenix',
    'dakota', 'sierra', 'autumn', 'hunter', 'raven', 'storm', 'sky', 'bear',
    'eagle', 'wolf', 'star', 'moon', 'sun', 'wind', 'rain', 'snow'
  ];

  // Caucasian names
  const caucasianNames = [
    'emma', 'liam', 'olivia', 'noah', 'ava', 'william', 'sophia', 'james',
    'charlotte', 'benjamin', 'amelia', 'lucas', 'harper', 'henry', 'evelyn', 'alexander',
    'abigail', 'michael', 'emily', 'ethan', 'elizabeth', 'daniel', 'mia', 'matthew',
    'ella', 'jackson', 'madison', 'david', 'scarlett', 'joseph', 'victoria', 'samuel'
  ];

  // Check each ethnicity
  if (africanAmericanNames.includes(name)) {
    console.log('✅ Detected African American ethnicity');
    return 'african_american';
  }
  if (latinoNames.includes(name)) {
    console.log('✅ Detected Latino ethnicity');
    return 'latino';
  }
  if (asianNames.includes(name)) {
    console.log('✅ Detected Asian ethnicity');
    return 'asian';
  }
  if (middleEasternNames.includes(name)) {
    console.log('✅ Detected Middle Eastern ethnicity');
    return 'middle_eastern';
  }
  if (nativeAmericanNames.includes(name)) {
    console.log('✅ Detected Native American ethnicity');
    return 'native_american';
  }
  if (caucasianNames.includes(name)) {
    console.log('✅ Detected Caucasian ethnicity');
    return 'caucasian';
  }

  console.log('🔍 No specific ethnicity detected, defaulting to mixed');
  return 'mixed';
}

// ============= NUCLEAR INDEPENDENCE - ETHNICITY-SPECIFIC FEATURE SELECTION =============
function getEthnicitySpecificFeatures(ethnicity, gender) {
  console.log(`🎨 Getting ${ethnicity} features for ${gender}`);
  
  let hairstyles, skinTones, facialFeatures;
  
  switch (ethnicity) {
    case 'african_american':
      hairstyles = HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES[gender] || HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.girls;
      skinTones = HARDCODED_AFRICAN_AMERICAN_SKIN_TONES;
      facialFeatures = HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES;
      break;
    case 'latino':
      hairstyles = HARDCODED_LATINO_HAIRSTYLES[gender] || HARDCODED_LATINO_HAIRSTYLES.girls;
      skinTones = HARDCODED_LATINO_SKIN_TONES;
      facialFeatures = HARDCODED_LATINO_FACIAL_FEATURES;
      break;
    case 'asian':
      hairstyles = HARDCODED_ASIAN_HAIRSTYLES[gender] || HARDCODED_ASIAN_HAIRSTYLES.girls;
      skinTones = HARDCODED_ASIAN_SKIN_TONES;
      facialFeatures = HARDCODED_ASIAN_FACIAL_FEATURES;
      break;
    case 'middle_eastern':
      hairstyles = HARDCODED_MIDDLE_EASTERN_HAIRSTYLES[gender] || HARDCODED_MIDDLE_EASTERN_HAIRSTYLES.girls;
      skinTones = HARDCODED_MIDDLE_EASTERN_SKIN_TONES;
      facialFeatures = HARDCODED_MIDDLE_EASTERN_FACIAL_FEATURES;
      break;
    case 'native_american':
      hairstyles = HARDCODED_NATIVE_AMERICAN_HAIRSTYLES[gender] || HARDCODED_NATIVE_AMERICAN_HAIRSTYLES.girls;
      skinTones = HARDCODED_NATIVE_AMERICAN_SKIN_TONES;
      facialFeatures = HARDCODED_NATIVE_AMERICAN_FACIAL_FEATURES;
      break;
    case 'caucasian':
      hairstyles = HARDCODED_CAUCASIAN_HAIRSTYLES[gender] || HARDCODED_CAUCASIAN_HAIRSTYLES.girls;
      skinTones = HARDCODED_CAUCASIAN_SKIN_TONES;
      facialFeatures = HARDCODED_CAUCASIAN_FACIAL_FEATURES;
      break;
    case 'mixed':
    default:
      hairstyles = HARDCODED_MIXED_RACE_HAIRSTYLES[gender] || HARDCODED_MIXED_RACE_HAIRSTYLES.girls;
      skinTones = HARDCODED_MIXED_RACE_SKIN_TONES;
      facialFeatures = HARDCODED_MIXED_RACE_FACIAL_FEATURES;
      break;
  }

  const selectedHair = hairstyles[Math.floor(Math.random() * hairstyles.length)];
  const selectedSkinTone = skinTones[Math.floor(Math.random() * skinTones.length)];
  const selectedFeatures = facialFeatures[Math.floor(Math.random() * facialFeatures.length)];

  console.log(`✅ Selected features for ${ethnicity} ${gender}:`, {
    hair: selectedHair.substring(0, 50) + '...',
    skinTone: selectedSkinTone,
    features: selectedFeatures.substring(0, 50) + '...'
  });

  return {
    hair: selectedHair,
    skinTone: selectedSkinTone,
    features: selectedFeatures
  };
}

// ============= NUCLEAR INDEPENDENCE - COMPREHENSIVE ARRAYS =============

const AGES = ['5-year-old', '6-year-old', '7-year-old', '8-year-old', '9-year-old', '10-year-old'];

const EMOTIONS = [
  'happy', 'excited', 'curious', 'surprised', 'thoughtful', 'determined',
  'joyful', 'amazed', 'confident', 'peaceful', 'playful', 'focused',
  'cheerful', 'enthusiastic', 'wonder-filled', 'content', 'brave', 'gentle'
];

const SETTINGS = [
  'magical forest', 'cozy bedroom', 'sunny playground', 'colorful classroom',
  'beautiful garden', 'warm kitchen', 'peaceful park', 'enchanted meadow',
  'friendly neighborhood', 'bright library', 'cheerful backyard', 'lovely beach',
  'snowy winter scene', 'autumn forest', 'spring garden', 'summer field'
];

const ATMOSPHERES = [
  'warm golden lighting', 'soft natural light', 'magical glow', 'bright cheerful ambiance',
  'cozy atmosphere', 'dreamy lighting', 'gentle sunbeams', 'enchanting mood',
  'peaceful ambiance', 'joyful atmosphere', 'serene lighting', 'whimsical glow'
];

const PROPS = [
  'colorful toys', 'magical books', 'art supplies', 'musical instruments',
  'building blocks', 'stuffed animals', 'board games', 'craft materials',
  'sports equipment', 'gardening tools', 'cooking utensils', 'science kit'
];

const ACTION_OBJECTS = [
  'playing with blocks', 'reading a book', 'drawing pictures', 'building something',
  'exploring nature', 'helping others', 'learning new things', 'creating art',
  'solving puzzles', 'making music', 'gardening', 'cooking together'
];

const COLORED_OBJECTS = [
  'bright red apples', 'sunny yellow flowers', 'deep blue ocean', 'vibrant green trees',
  'purple butterflies', 'orange pumpkins', 'pink cherry blossoms', 'rainbow colors',
  'golden sunlight', 'silver stars', 'emerald grass', 'ruby red berries'
];

const SENSORY_DETAILS = [
  'soft textures', 'gentle sounds', 'sweet aromas', 'warm feelings',
  'smooth surfaces', 'melodic music', 'fresh air', 'cozy warmth',
  'natural scents', 'peaceful sounds', 'comfortable spaces', 'pleasant sensations'
];

const COMMUNITY_CONTEXT = [
  'with loving family', 'among good friends', 'in supportive community',
  'with caring teachers', 'alongside helpful neighbors', 'with kind mentors',
  'in welcoming group', 'with encouraging peers', 'among diverse friends',
  'in inclusive environment', 'with understanding adults', 'in safe space'
];

const SECONDARY_CHARACTERS = [
  'with a friendly pet', 'alongside a sibling', 'with a best friend',
  'near a caring adult', 'with classmates', 'alongside family members',
  'with a mentor figure', 'near helpful friends', 'with community members',
  'alongside diverse peers', 'with supportive adults', 'near loving relatives'
];

const SPATIAL_POSITIONING = [
  'centered in frame', 'slightly off-center', 'in foreground focus',
  'naturally positioned', 'dynamically placed', 'harmoniously arranged',
  'thoughtfully composed', 'balanced positioning', 'engaging placement',
  'story-focused arrangement', 'character-centered', 'scene-appropriate positioning'
];

const OBJECT_INTERACTION = [
  'actively engaging with', 'carefully handling', 'creatively using',
  'thoughtfully exploring', 'gently touching', 'skillfully manipulating',
  'curiously examining', 'playfully interacting with', 'learning from',
  'discovering through', 'experimenting with', 'enjoying interaction with'
];

const BODY_LANGUAGE = [
  'open and welcoming posture', 'confident stance', 'relaxed positioning',
  'engaged body language', 'natural movement', 'expressive gestures',
  'comfortable posture', 'active positioning', 'friendly demeanor',
  'approachable stance', 'positive body language', 'authentic expression'
];

const SPATIAL_COMPOSITION = [
  'rule of thirds composition', 'centered focal point', 'balanced arrangement',
  'dynamic composition', 'harmonious layout', 'engaging framing',
  'story-driven composition', 'character-focused framing', 'natural arrangement',
  'visually pleasing layout', 'thoughtful positioning', 'compelling composition'
];

const ACTION_INTENSITY = [
  'gentle movement', 'calm activity', 'peaceful action',
  'moderate energy', 'focused activity', 'engaged participation',
  'thoughtful action', 'careful movement', 'deliberate activity',
  'natural motion', 'comfortable pace', 'appropriate energy level'
];

const CAMERA_DIRECTIVES = [
  'medium shot with shallow depth of field',
  'close-up with soft background blur',
  'wide shot showing full scene context',
  'three-quarter view with natural framing',
  'eye-level perspective with warm lighting',
  'slightly elevated angle with inclusive framing',
  'natural perspective with story focus',
  'character-centered framing with environmental context'
];

const ADJECTIVES = [
  'vibrant', 'warm', 'soft', 'bright', 'gentle', 'cheerful',
  'magical', 'peaceful', 'joyful', 'cozy', 'dreamy', 'enchanting',
  'natural', 'harmonious', 'welcoming', 'comfortable', 'inspiring', 'uplifting'
];

// ============= NUCLEAR INDEPENDENCE - RANDOM SELECTION FUNCTIONS =============
function getRandomElement(array) {
  if (!array || array.length === 0) return '';
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomAge() {
  return getRandomElement(AGES);
}

function getRandomEmotion() {
  return getRandomElement(EMOTIONS);
}

function getRandomSetting() {
  return getRandomElement(SETTINGS);
}

function getRandomAtmosphere() {
  return getRandomElement(ATMOSPHERES);
}

function getRandomProps() {
  return getRandomElement(PROPS);
}

function getRandomActionObjects() {
  return getRandomElement(ACTION_OBJECTS);
}

function getRandomColoredObjects() {
  return getRandomElement(COLORED_OBJECTS);
}

function getRandomSensoryDetails() {
  return getRandomElement(SENSORY_DETAILS);
}

function getRandomCommunityContext() {
  return getRandomElement(COMMUNITY_CONTEXT);
}

function getRandomSecondaryCharacters() {
  return getRandomElement(SECONDARY_CHARACTERS);
}

function getRandomSpatialPositioning() {
  return getRandomElement(SPATIAL_POSITIONING);
}

function getRandomObjectInteraction() {
  return getRandomElement(OBJECT_INTERACTION);
}

function getRandomBodyLanguage() {
  return getRandomElement(BODY_LANGUAGE);
}

function getRandomSpatialComposition() {
  return getRandomElement(SPATIAL_COMPOSITION);
}

function getRandomActionIntensity() {
  return getRandomElement(ACTION_INTENSITY);
}

function getRandomCameraDirective() {
  return getRandomElement(CAMERA_DIRECTIVES);
}

function getRandomAdjective() {
  return getRandomElement(ADJECTIVES);
}

// ============= NUCLEAR INDEPENDENCE - GENDER DETECTION =============
function detectGenderFromCharacterName(characterName) {
  if (!characterName || typeof characterName !== 'string') {
    console.log('🔍 No character name provided for gender detection, defaulting to girls');
    return 'girls';
  }

  const name = characterName.toLowerCase().trim();
  console.log('🔍 Detecting gender for character:', name);

  // Common boy names
  const boyNames = [
    'liam', 'noah', 'william', 'james', 'benjamin', 'lucas', 'henry', 'alexander',
    'mason', 'michael', 'ethan', 'daniel', 'jacob', 'logan', 'jackson', 'levi',
    'sebastian', 'mateo', 'jack', 'owen', 'theodore', 'aiden', 'samuel', 'joseph',
    'john', 'david', 'wyatt', 'matthew', 'luke', 'asher', 'carter', 'julian',
    'grayson', 'leo', 'jayden', 'gabriel', 'isaac', 'lincoln', 'anthony', 'hudson',
    'dylan', 'ezra', 'thomas', 'charles', 'christopher', 'jaxon', 'maverick', 'josiah',
    'isaiah', 'andrew', 'elijah', 'joshua', 'nathan', 'caleb', 'ryan', 'adrian',
    'miles', 'eli', 'nolan', 'christian', 'aaron', 'cameron', 'ezekiel', 'colton',
    'malik', 'jamal', 'deshawn', 'marcus', 'tyrone', 'devon', 'terrell', 'antoine',
    'khalil', 'darius', 'jalen', 'isaiah', 'cameron', 'jordan', 'xavier', 'elijah',
    'diego', 'carlos', 'miguel', 'alejandro', 'fernando', 'ricardo', 'antonio', 'jose',
    'luis', 'pablo', 'rafael', 'manuel', 'francisco', 'juan', 'pedro', 'ramon',
    'hiroshi', 'kenji', 'takeshi', 'ryu', 'chen', 'wang', 'zhang', 'liu',
    'yang', 'huang', 'zhao', 'raj', 'vikram', 'arjun', 'rohit', 'kim',
    'park', 'lee', 'choi', 'jung', 'kang', 'yoon', 'shin', 'omar',
    'hassan', 'ahmed', 'mohammed', 'ali', 'yusuf', 'ibrahim', 'khalid', 'tariq',
    'rashid', 'samir', 'karim', 'koda', 'kai', 'river', 'phoenix', 'dakota',
    'hunter', 'bear', 'eagle', 'wolf', 'storm', 'sun', 'wind'
  ];

  // Common girl names
  const girlNames = [
    'olivia', 'emma', 'ava', 'charlotte', 'sophia', 'amelia', 'isabella', 'mia',
    'evelyn', 'harper', 'camila', 'gianna', 'abigail', 'luna', 'ella', 'elizabeth',
    'sofia', 'emily', 'avery', 'mila', 'scarlett', 'eleanor', 'madison', 'layla',
    'penelope', 'aria', 'chloe', 'grace', 'ellie', 'nora', 'hazel', 'zoey',
    'riley', 'victoria', 'lily', 'aurora', 'violet', 'nova', 'hannah', 'emilia',
    'zoe', 'stella', 'everly', 'isla', 'leah', 'lillian', 'addison', 'willow',
    'lucy', 'paisley', 'natalie', 'naomi', 'maya', 'elena', 'caroline', 'anna',
    'genesis', 'aaliyah', 'kennedy', 'kinsley', 'allison', 'claire', 'audrey', 'sadie',
    'aisha', 'keisha', 'latoya', 'tanisha', 'aaliyah', 'shanice', 'imani', 'jasmine',
    'zara', 'nia', 'amara', 'kendra', 'maya', 'destiny', 'kiara', 'diamond',
    'sofia', 'maria', 'isabella', 'camila', 'lucia', 'valentina', 'gabriela', 'natalia',
    'ana', 'elena', 'carmen', 'rosa', 'esperanza', 'dolores', 'mercedes', 'gloria',
    'mei', 'yuki', 'sakura', 'akiko', 'li', 'priya', 'anita', 'kavya',
    'deepika', 'fatima', 'amal', 'layla', 'zara', 'nadia', 'sara', 'maryam',
    'yasmin', 'amina', 'leila', 'dina', 'rania', 'aiyana', 'nova', 'luna',
    'sage', 'sierra', 'autumn', 'raven', 'sky', 'star', 'moon', 'rain', 'snow'
  ];

  if (boyNames.includes(name)) {
    console.log('✅ Detected male gender');
    return 'boys';
  }
  if (girlNames.includes(name)) {
    console.log('✅ Detected female gender');
    return 'girls';
  }

  console.log('🔍 No specific gender detected, defaulting to girls');
  return 'girls';
}

// ============= NUCLEAR INDEPENDENCE - PROMPT BUILDING FUNCTIONS =============

function buildPromptVariables(pageText, characterName, difficulty) {
  console.log('🔧 Building prompt variables for:', { pageText: pageText?.substring(0, 50), characterName, difficulty });
  
  // Detect ethnicity and gender
  const detectedEthnicity = detectEthnicityFromCharacterName(characterName);
  const detectedGender = detectGenderFromCharacterName(characterName);
  
  // Get ethnicity-specific features
  const ethnicFeatures = getEthnicitySpecificFeatures(detectedEthnicity, detectedGender);
  
  // Get style settings
  const styleSettings = NUCLEAR_STYLE_SETTINGS[difficulty] || NUCLEAR_STYLE_SETTINGS.medium;
  
  const variables = {
    // Core content
    pageText: pageText || 'A child having a wonderful adventure',
    character: characterName || 'child',
    
    // Ethnicity-specific features
    ethnicity: detectedEthnicity,
    hair: ethnicFeatures.hair,
    features: ethnicFeatures.features,
    
    // Random selections
    age: getRandomAge(),
    emotion: getRandomEmotion(),
    setting: getRandomSetting(),
    atmosphere: getRandomAtmosphere(),
    props: getRandomProps(),
    action_objects: getRandomActionObjects(),
    colored_objects: getRandomColoredObjects(),
    sensory_details: getRandomSensoryDetails(),
    community_context: getRandomCommunityContext(),
    secondary_characters: getRandomSecondaryCharacters(),
    spatial_positioning: getRandomSpatialPositioning(),
    object_interaction: getRandomObjectInteraction(),
    body_language: getRandomBodyLanguage(),
    spatial_composition: getRandomSpatialComposition(),
    action_intensity: getRandomActionIntensity(),
    cameraDirective: getRandomCameraDirective(),
    adjective: getRandomAdjective(),
    
    // Style framework
    frameworkPrompt: styleSettings.frameworkPrompt,
    
    // Derived values
    subject: `${detectedGender === 'boys' ? 'boy' : 'girl'}`,
    scene: `${getRandomActionObjects()} in ${getRandomSetting()}`,
    action: getRandomActionObjects()
  };
  
  console.log('✅ Built prompt variables:', {
    ethnicity: variables.ethnicity,
    gender: detectedGender,
    character: variables.character,
    age: variables.age,
    emotion: variables.emotion
  });
  
  return variables;
}

function replaceTemplateVariables(template, variables) {
  let result = template;
  
  // Replace all template variables
  Object.keys(variables).forEach(key => {
    const placeholder = `{${key}}`;
    const value = variables[key] || '';
    result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
  });
  
  // Clean up any remaining unreplaced variables
  result = result.replace(/\{[^}]+\}/g, '');
  
  // Clean up extra spaces and punctuation
  result = result.replace(/\s+/g, ' ').trim();
  result = result.replace(/,\s*,/g, ',');
  result = result.replace(/\.\s*\./g, '.');
  
  return result;
}

// ============= NUCLEAR INDEPENDENCE - MAIN PROMPT GENERATION =============
function generatePrompt(pageText, characterName, difficulty, useBasicTemplate = false) {
  console.log('🎨 Generating prompt:', { 
    pageText: pageText?.substring(0, 50), 
    characterName, 
    difficulty, 
    useBasicTemplate 
  });
  
  try {
    // Build variables
    const variables = buildPromptVariables(pageText, characterName, difficulty);
    
    // Select template
    const templates = useBasicTemplate ? BASIC_PROMPT_TEMPLATES : PREMIUM_PROMPT_TEMPLATES;
    const template = templates[difficulty] || templates.medium;
    
    // Generate prompt
    const prompt = replaceTemplateVariables(template, variables);
    
    console.log('✅ Generated prompt length:', prompt.length);
    console.log('📝 Generated prompt preview:', prompt.substring(0, 200) + '...');
    
    return {
      prompt,
      variables,
      template: useBasicTemplate ? 'basic' : 'premium'
    };
    
  } catch (error) {
    console.error('❌ Error generating prompt:', error);
    
    // Emergency fallback
    const fallbackPrompt = `${EMERGENCY_FALLBACK_FRAMEWORK}. ${pageText || 'A child having a wonderful adventure'}. ${characterName || 'Child'} with happy expression in a magical setting.`;
    
    return {
      prompt: fallbackPrompt,
      variables: {},
      template: 'emergency_fallback',
      error: error.message
    };
  }
}

// ============= NUCLEAR INDEPENDENCE - RUNWARE API FUNCTIONS =============

async function makeRunwareRequest(requestData, maxRetries = 3) {
  const RUNWARE_API_KEY = Deno.env.get('RUNWARE_API_KEY');
  
  if (!RUNWARE_API_KEY) {
    throw new Error('RUNWARE_API_KEY environment variable is not set');
  }

  console.log('🚀 Making Runware API request with data:', JSON.stringify(requestData, null, 2));

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📡 Runware API attempt ${attempt}/${maxRetries}`);
      
      const response = await fetch('https://api.runware.ai/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RUNWARE_API_KEY}`
        },
        body: JSON.stringify(requestData)
      });

      console.log('📡 Runware API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Runware API error response:', errorText);
        throw new Error(`Runware API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Runware API success:', JSON.stringify(data, null, 2));
      
      return data;
      
    } catch (error) {
      console.error(`❌ Runware API attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error(`Runware API failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Wait before retry
      const delay = attempt * 1000;
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function generateImageWithRunware(prompt, difficulty) {
  console.log('🎨 Generating image with Runware:', { 
    promptLength: prompt.length, 
    difficulty 
  });
  
  try {
    // Get style settings
    const styleSettings = NUCLEAR_STYLE_SETTINGS[difficulty] || NUCLEAR_STYLE_SETTINGS.medium;
    
    // Generate nuclear negative prompt
    const negativePrompt = await generateNuclearNegativePrompt(prompt);
    
    console.log('🚫 Generated negative prompt:', negativePrompt.substring(0, 100) + '...');
    
    // Prepare request data
    const requestData = {
      taskType: "imageInference",
      taskUUID: `runware-simple-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      positivePrompt: prompt,
      negativePrompt: negativePrompt,
      width: 1024,
      height: 1024,
      modelId: "runware:100@1",
      numberResults: 1,
      steps: styleSettings.steps,
      CFGScale: styleSettings.CFGScale,
      seed: Math.floor(Math.random() * 1000000),
      scheduler: "DPM++ 2M Karras",
      outputFormat: "WEBP",
      outputType: "base64Data"
    };
    
    console.log('📋 Runware request configuration:', {
      modelId: requestData.modelId,
      steps: requestData.steps,
      CFGScale: requestData.CFGScale,
      scheduler: requestData.scheduler,
      dimensions: `${requestData.width}x${requestData.height}`,
      seed: requestData.seed
    });
    
    // Make API request
    const response = await makeRunwareRequest(requestData);
    
    // Validate response
    if (!response || !response.data || !Array.isArray(response.data) || response.data.length === 0) {
      throw new Error('Invalid response structure from Runware API');
    }
    
    const imageData = response.data[0];
    
    if (!imageData.imageBase64Data) {
      throw new Error('No image data received from Runware API');
    }
    
    console.log('✅ Image generated successfully');
    console.log('📊 Image data size:', imageData.imageBase64Data.length, 'characters');
    
    return {
      success: true,
      imageBase64: imageData.imageBase64Data,
      imageUrl: imageData.imageURL || null,
      taskUUID: requestData.taskUUID,
      seed: requestData.seed,
      prompt: prompt,
      negativePrompt: negativePrompt,
      settings: {
        steps: styleSettings.steps,
        CFGScale: styleSettings.CFGScale,
        model: requestData.modelId,
        scheduler: requestData.scheduler
      }
    };
    
  } catch (error) {
    console.error('❌ Runware image generation failed:', error.message);
    
    return {
      success: false,
      error: error.message,
      prompt: prompt,
      settings: NUCLEAR_STYLE_SETTINGS[difficulty] || NUCLEAR_STYLE_SETTINGS.medium
    };
  }
}

// ============= NUCLEAR INDEPENDENCE - SESSION MANAGEMENT =============

function initializeSessionState(sessionId) {
  console.log('🔄 Initializing session state for:', sessionId);
  
  try {
    const sessionState = globalArcSessionManager.getSession(sessionId);
    
    if (!sessionState.visualDetailTracker) {
      sessionState.visualDetailTracker = new VisualDetailTracker();
      console.log('✅ Initialized VisualDetailTracker for session');
    }
    
    if (!sessionState.characterConsistencyService) {
      sessionState.characterConsistencyService = new CharacterConsistencyService();
      console.log('✅ Initialized CharacterConsistencyService for session');
    }
    
    if (!sessionState.exactWordExtractor) {
      sessionState.exactWordExtractor = new ExactWordExtractor();
      console.log('✅ Initialized ExactWordExtractor for session');
    }
    
    globalArcSessionManager.updateSession(sessionId, sessionState);
    
    return sessionState;
    
  } catch (error) {
    console.error('❌ Error initializing session state:', error.message);
    
    // Return minimal session state
    return {
      visualDetailTracker: new VisualDetailTracker(),
      characterConsistencyService: new CharacterConsistencyService(),
      exactWordExtractor: new ExactWordExtractor()
    };
  }
}

function updateSessionWithGeneration(sessionId, generationData) {
  console.log('📝 Updating session with generation data for:', sessionId);
  
  try {
    const sessionState = globalArcSessionManager.getSession(sessionId);
    
    // Track visual details
    if (sessionState.visualDetailTracker && generationData.prompt) {
      sessionState.visualDetailTracker.trackDetails(generationData.prompt);
    }
    
    // Update character consistency
    if (sessionState.characterConsistencyService && generationData.characterName) {
      sessionState.characterConsistencyService.updateCharacterProfile(
        generationData.characterName,
        {
          ethnicity: generationData.variables?.ethnicity,
          hair: generationData.variables?.hair,
          features: generationData.variables?.features,
          lastUsed: new Date().toISOString()
        }
      );
    }
    
    // Track generation history
    if (!sessionState.generationHistory) {
      sessionState.generationHistory = [];
    }
    
    sessionState.generationHistory.push({
      timestamp: new Date().toISOString(),
      prompt: generationData.prompt?.substring(0, 200),
      characterName: generationData.characterName,
      difficulty: generationData.difficulty,
      success: generationData.success
    });
    
    // Keep only last 10 generations
    if (sessionState.generationHistory.length > 10) {
      sessionState.generationHistory = sessionState.generationHistory.slice(-10);
    }
    
    globalArcSessionManager.updateSession(sessionId, sessionState);
    
    console.log('✅ Session updated successfully');
    
  } catch (error) {
    console.error('❌ Error updating session:', error.message);
  }
}

// ============= NUCLEAR INDEPENDENCE - MAIN HANDLER FUNCTION =============

async function handleImageGeneration(requestData) {
  console.log('🎯 Starting image generation process');
  console.log('📋 Request data:', JSON.stringify(requestData, null, 2));
  
  try {
    // Extract and validate request parameters
    const {
      pageText,
      characterName,
      difficulty = 'medium',
      sessionId = `session-${Date.now()}`,
      useBasicTemplate = false,
      maxRetries = 3
    } = requestData;
    
    // Validate required parameters
    if (!pageText || typeof pageText !== 'string' || pageText.trim().length === 0) {
      throw new Error('pageText is required and must be a non-empty string');
    }
    
    if (!characterName || typeof characterName !== 'string' || characterName.trim().length === 0) {
      throw new Error('characterName is required and must be a non-empty string');
    }
    
    // Validate difficulty level
    const validDifficulties = ['beginner', 'easy', 'medium', 'hard', 'expert'];
    if (!validDifficulties.includes(difficulty)) {
      throw new Error(`difficulty must be one of: ${validDifficulties.join(', ')}`);
    }
    
    console.log('✅ Request validation passed');
    
    // Initialize session state
    const sessionState = initializeSessionState(sessionId);
    
    // Generate prompt
    console.log('🎨 Generating prompt...');
    const promptResult = generatePrompt(pageText, characterName, difficulty, useBasicTemplate);
    
    if (!promptResult.prompt) {
      throw new Error('Failed to generate prompt');
    }
    
    console.log('✅ Prompt generated successfully');
    console.log('📝 Prompt preview:', promptResult.prompt.substring(0, 200) + '...');
    
    // Generate image with Runware
    console.log('🖼️ Generating image with Runware...');
    const imageResult = await generateImageWithRunware(promptResult.prompt, difficulty);
    
    // Prepare response data
    const responseData = {
      success: imageResult.success,
      sessionId: sessionId,
      prompt: promptResult.prompt,
      promptVariables: promptResult.variables,
      templateType: promptResult.template,
      difficulty: difficulty,
      characterName: characterName,
      pageText: pageText,
      timestamp: new Date().toISOString()
    };
    
    if (imageResult.success) {
      // Success response
      responseData.imageBase64 = imageResult.imageBase64;
      responseData.imageUrl = imageResult.imageUrl;
      responseData.taskUUID = imageResult.taskUUID;
      responseData.seed = imageResult.seed;
      responseData.negativePrompt = imageResult.negativePrompt;
      responseData.settings = imageResult.settings;
      
      console.log('✅ Image generation successful');
      
    } else {
      // Error response
      responseData.error = imageResult.error;
      responseData.settings = imageResult.settings;
      
      console.error('❌ Image generation failed:', imageResult.error);
    }
    
    // Update session with generation data
    updateSessionWithGeneration(sessionId, {
      ...responseData,
      variables: promptResult.variables
    });
    
    return responseData;
    
  } catch (error) {
    console.error('❌ Image generation process failed:', error.message);
    
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      sessionId: requestData.sessionId || `error-session-${Date.now()}`
    };
  }
}

// ============= NUCLEAR INDEPENDENCE - EDGE FUNCTION HANDLER =============

async function handler(req) {
  console.log('🚀 Runware Simple Fallback Edge Function - Request received');
  console.log('📡 Request method:', req.method);
  console.log('📡 Request URL:', req.url);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight request');
    return createCorsOptionsResponse();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.error('❌ Method not allowed:', req.method);
    return createCorsErrorResponse('Method not allowed. Use POST.', 405);
  }
  
  try {
    // Parse request body
    console.log('📖 Parsing request body...');
    const requestData = await req.json();
    
    console.log('📋 Parsed request data keys:', Object.keys(requestData));
    
    // Handle image generation
    const result = await handleImageGeneration(requestData);
    
    // Return response
    if (result.success) {
      console.log('✅ Request completed successfully');
      return createCorsResponse(result, 200);
    } else {
      console.error('❌ Request failed:', result.error);
      return createCorsResponse(result, 400);
    }
    
  } catch (error) {
    console.error('❌ Edge function error:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    return createCorsErrorResponse(error, 500);
  }
}

// ============= NUCLEAR INDEPENDENCE - EXPORT HANDLER =============
console.log('🚀 Runware Simple Fallback Edge Function - Module loaded');
console.log('📊 Available difficulty levels:', Object.keys(NUCLEAR_STYLE_SETTINGS));
console.log('📊 Available ethnicities: african_american, latino, asian, middle_eastern, native_american, caucasian, mixed');
console.log('✅ Edge function ready to serve requests');

serve(handler);
