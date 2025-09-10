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
    frameworkPrompt: 'Contemporary children\\\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality',
    steps: 20,
    CFGScale: 7
  },
  'easy': {
    frameworkPrompt: 'Contemporary children\\\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality',
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
  beginner: "Technical: {frameworkPrompt}, {cameraDirective}. Narrative: {pageText}. Subject: {character} {age}, {ethnicity}, {hair}, {features}, {emotion}. Action: {scene}, {action_intensity}, {spatial_positioning}, {object_interaction}, {body_language}. Composition: {spatial_composition}. Environment: {setting}, {atmosphere}. Elements: {props}, {action_objects}, {colored_objects}, {sensory_details}. Context: {community_context}, {secondary_characters}",
  easy: "Technical: {frameworkPrompt}, {cameraDirective}. Narrative: {pageText}. Subject: {character} {age}, {ethnicity}, {hair}, {features}, {emotion}. Action: {scene}, {action_intensity}, {spatial_positioning}, {object_interaction}, {body_language}. Composition: {spatial_composition}. Environment: {setting}, {atmosphere}. Elements: {props}, {action_objects}, {colored_objects}, {sensory_details}. Context: {community_context}, {secondary_characters}",
  medium: "Technical: {frameworkPrompt}, {cameraDirective}. Subject: {character} {age}, {ethnicity}, {hair}, {features}, {emotion}. Action: {scene}, {action_intensity}, {spatial_positioning}, {object_interaction}, {body_language}. Composition: {spatial_composition}. Environment: {setting}, {atmosphere}. Elements: {props}, {action_objects}, {colored_objects}, {sensory_details}. Context: {community_context}, {secondary_characters}. Narrative: {pageText}",
  hard: "Technical: {frameworkPrompt}, {cameraDirective}. Subject: {character} {age}, {ethnicity}, {hair}, {features}, {emotion}. Action: {scene}, {action_intensity}, {spatial_positioning}, {object_interaction}, {body_language}. Composition: {spatial_composition}. Environment: {setting}, {atmosphere}. Elements: {props}, {action_objects}, {colored_objects}, {sensory_details}. Context: {community_context}, {secondary_characters}. Narrative: {pageText}",
  expert: "Technical: {frameworkPrompt}, {cameraDirective}. Subject: {character} {age}, {ethnicity}, {hair}, {features}, {emotion}. Action: {scene}, {action_intensity}, {spatial_positioning}, {object_interaction}, {body_language}. Composition: {spatial_composition}. Environment: {setting}, {atmosphere}. Elements: {props}, {action_objects}, {colored_objects}, {sensory_details}. Context: {community_context}, {secondary_characters}. Narrative: {pageText}"
};

// ============= BASIC PROMPT TEMPLATES (TIER 1.5 / 2.5B) - SIMPLIFIED SEMANTIC STRUCTURE =============
const BASIC_PROMPT_TEMPLATES = {
  beginner: "Primary Scene: {pageText}. Visual Components: {character} {age} with {hair}, {features} {subject} {action} with {emotion} {secondary_characters} with {colored_objects} in {setting} with {adjective} colors. Brand Suffix: {frameworkPrompt}",
  easy: "Primary Scene: {pageText}. Visual Components: {character} {age} with {hair}, {features} {subject} {action} with {emotion} {secondary_characters} with {colored_objects} in {setting} with {adjective} colors. Brand Suffix: {frameworkPrompt}",
  medium: "Primary Scene: {pageText}. Visual Components: {character} {age} with {hair}, {features} {subject} {action} with {emotion} {secondary_characters} with {colored_objects} in {setting} with {adjective} colors. Brand Suffix: {frameworkPrompt}",
  hard: "Primary Scene: {pageText}. Visual Components: {character} {age} with {hair}, {features} {subject} {action} with {emotion} {secondary_characters} with {colored_objects} in {setting} with {adjective} colors. Brand Suffix: {frameworkPrompt}",
  expert: "Primary Scene: {pageText}. Visual Components: {character} {age} with {hair}, {features} {subject} {action} with {emotion} {secondary_characters} with {colored_objects} in {setting} with {adjective} colors. Brand Suffix: {frameworkPrompt}"
};

// ============= VOCABULARY ARRAYS - EXTENSIVE AND COMPREHENSIVE =============

const ageAdjectives = [
  "baby", "toddler", "young", "preteen", "teen", "elderly", "ancient", "newborn", "infant", "child",
  "youthful", "middle-aged", "senior", "old", "mature", "adolescent", "growing", "developing", "ripe", "prime"
];

const ethnicityAdjectives = [
  "African", "Asian", "European", "Hispanic", "Indigenous", "Caucasian", "Indian", "Middle Eastern", "Pacific Islander", "Mixed",
  "Black", "White", "Brown", "Yellow", "Tan", "Olive", "Pale", "Dark", "Light", "Ruddy"
];

const hairAdjectives = [
  "long", "short", "curly", "straight", "wavy", "bald", "blonde", "brunette", "red", "gray",
  "black", "white", "brown", "auburn", "golden", "silver", "thick", "thin", "frizzy", "spiky"
];

const featureAdjectives = [
  "smiling", "frowning", "laughing", "crying", "serious", "playful", "mischievous", "kind", "stern", "gentle",
  "happy", "sad", "angry", "calm", "excited", "tired", "energetic", "shy", "brave", "curious"
];

const subjectAdjectives = [
  "boy", "girl", "man", "woman", "person", "child", "teenager", "adult", "elder", "infant",
  "student", "teacher", "doctor", "nurse", "artist", "writer", "musician", "athlete", "chef", "engineer"
];

const actionAdjectives = [
  "running", "jumping", "dancing", "singing", "reading", "writing", "painting", "cooking", "playing", "working",
  "studying", "teaching", "healing", "creating", "performing", "competing", "preparing", "building", "repairing", "exploring"
];

const emotionAdjectives = [
  "happy", "sad", "angry", "calm", "excited", "tired", "energetic", "shy", "brave", "curious",
  "joyful", "depressed", "furious", "peaceful", "thrilled", "exhausted", "lively", "timid", "courageous", "inquisitive"
];

const secondaryCharacterAdjectives = [
  "friends", "family", "pets", "animals", "strangers", "crowd", "team", "group", "community", "audience",
  "companions", "relatives", "dogs", "cats", "passersby", "spectators", "crew", "gang", "society", "congregation"
];

const coloredObjectAdjectives = [
  "red", "blue", "green", "yellow", "purple", "orange", "pink", "brown", "gray", "black",
  "white", "gold", "silver", "bronze", "copper", "crimson", "teal", "violet", "magenta", "lime"
];

const settingAdjectives = [
  "forest", "beach", "city", "mountain", "desert", "ocean", "river", "lake", "garden", "park",
  "school", "home", "office", "hospital", "restaurant", "store", "library", "museum", "theater", "stadium"
];

const adjectiveColors = [
  "bright", "dark", "vibrant", "dull", "pastel", "neon", "muted", "clear", "cloudy", "smoky",
  "warm", "cool", "soft", "hard", "light", "heavy", "deep", "shallow", "rich", "poor"
];

const cameraDirectives = [
  "wide-angle shot", "close-up shot", "medium shot", "establishing shot", "point-of-view shot",
  "over-the-shoulder shot", "dutch angle", "aerial shot", "tracking shot", "zoom shot",
  "panoramic view", "macro photography", "time-lapse", "slow motion", "fish-eye lens",
  "tilt-shift", "bokeh effect", "long exposure", "split diopter", "cinemagraph"
];

const sceneSettings = [
  "sunny day", "rainy day", "snowy day", "nighttime", "dawn", "dusk", "foggy morning", "stormy weather",
  "clear sky", "cloudy sky", "windy day", "calm sea", "raging river", "peaceful forest", "bustling city",
  "quiet village", "desert landscape", "mountain range", "tropical island", "arctic tundra"
];

const actionIntensities = [
  "gentle", "moderate", "intense", "subtle", "vigorous", "delicate", "forceful", "restrained", "dynamic", "static",
  "brisk", "lethargic", "energetic", "placid", "frenetic", "serene", "powerful", "feeble", "robust", "fragile"
];

const spatialPositionings = [
  "center", "left", "right", "top", "bottom", "foreground", "background", "middle ground", "corner", "edge",
  "above", "below", "beside", "behind", "in front", "nearby", "distant", "adjacent", "opposite", "surrounding"
];

const objectInteractions = [
  "holding", "touching", "using", "wearing", "carrying", "eating", "drinking", "reading", "writing", "drawing",
  "pushing", "pulling", "lifting", "dropping", "catching", "throwing", "kicking", "hitting", "breaking", "fixing"
];

const bodyLanguages = [
  "smiling", "frowning", "nodding", "shaking head", "waving", "pointing", "hugging", "kissing", "bowing", "curtsying",
  "jumping", "running", "walking", "sitting", "standing", "lying down", "kneeling", "crouching", "leaning", "stretching"
];

const spatialCompositions = [
  "symmetrical", "asymmetrical", "balanced", "unbalanced", "geometric", "organic", "circular", "linear", "radial", "clustered",
  "open", "closed", "dense", "sparse", "layered", "flat", "deep", "shallow", "wide", "narrow"
];

const atmospheres = [
  "peaceful", "chaotic", "romantic", "mysterious", "cheerful", "somber", "tense", "relaxed", "exciting", "calm",
  "eerie", "vibrant", "dreary", "lively", "gloomy", "serene", "agitated", "dynamic", "stagnant", "tranquil"
];

const props = [
  "book", "toy", "ball", "doll", "car", "bike", "hat", "glasses", "umbrella", "backpack",
  "phone", "camera", "laptop", "tablet", "watch", "jewelry", "wallet", "keys", "pen", "pencil"
];

const actionObjects = [
  "sword", "shield", "bow", "arrow", "gun", "knife", "rope", "ladder", "hammer", "wrench",
  "brush", "paint", "needle", "thread", "shovel", "rake", "broom", "mop", "sponge", "bucket"
];

const sensoryDetails = [
  "smell of rain", "sound of waves", "taste of chocolate", "feel of silk", "sight of stars",
  "scent of flowers", "noise of traffic", "flavor of coffee", "texture of wood", "glow of sunset",
  "aroma of spices", "roar of thunder", "sweetness of honey", "smoothness of glass", "twinkle of lights",
  "fragrance of perfume", "hum of machinery", "bitterness of lemon", "roughness of stone", "sparkle of diamonds"
];

const communityContexts = [
  "school event", "family gathering", "sports game", "concert", "festival", "parade", "market", "fair", "picnic", "party",
  "church service", "community meeting", "volunteer work", "charity event", "town hall", "public park", "local library", "art exhibition", "theater performance", "dance recital"
];

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

// ============= DIFFICULTY LEVEL VALIDATION =============
function validateDifficultyLevel(level) {
  const validLevels = ['beginner', 'easy', 'medium', 'hard', 'expert'];
  return validLevels.includes(level) ? level : 'beginner';
}

// ============= EXACT WORD EXTRACTION HELPERS =============
function extractExactWords(text) {
  const extractor = new ExactWordExtractor();
  return extractor.extractWords(text);
}

// ============= VISUAL DETAIL TRACKING =============
function trackVisualDetails(text, sessionId) {
  const tracker = new VisualDetailTracker();
  return tracker.trackDetails(text, sessionId);
}

// ============= CHARACTER CONSISTENCY MANAGEMENT =============
function manageCharacterConsistency(text, sessionId) {
  const service = new CharacterConsistencyService();
  return service.manageConsistency(text, sessionId);
}

// ============= MAIN PAGE TEXT GENERATION FUNCTION =============
async function rawPageText(userInfo, pageText, sessionId, pageNumber, mode) {
  try {
    const difficulty = validateDifficultyLevel(userInfo?.difficulty || 'beginner');
    
    console.log('🚀 Tier 2.5 Nuclear Independence: Processing request', {
      difficulty,
      pageNumber,
      mode,
      sessionId: sessionId?.substring(0, 8) + '...'
    });

    // Generate nuclear negative prompt
    const culturalProfile = detectCulturalProfileForNegatives(userInfo);
    const negativePrompt = generateNuclearNegativePrompt(difficulty, culturalProfile);
    
    // Extract exact words
    const exactWords = extractExactWords(pageText);
    
    // Track visual details
    const visualDetails = trackVisualDetails(pageText, sessionId);
    
    // Manage character consistency
    const characterConsistency = manageCharacterConsistency(pageText, sessionId);
    
    // Get style settings
    const styleSettings = NUCLEAR_STYLE_SETTINGS[difficulty];
    
    // Compose final prompt using the appropriate template system
    const template = mode === 'premium' ? PREMIUM_PROMPT_TEMPLATES[difficulty] : BASIC_PROMPT_TEMPLATES[difficulty];
    
    const finalPrompt = composeFinalPrompt(template, {
      frameworkPrompt: styleSettings.frameworkPrompt,
      pageText: pageText,
      character: userInfo?.avatar?.type || 'child',
      exactWords,
      visualDetails,
      characterConsistency
    });
    
    // Save session state
    globalArcSessionManager.saveImagePrompt(sessionId, pageNumber, {
      prompt: finalPrompt,
      negativePrompt: negativePrompt,
      difficulty: difficulty,
      metadata: {
        exactWords,
        visualDetails,
        characterConsistency
      }
    });
    
    return createCorsResponse({
      success: true,
      prompt: finalPrompt,
      negativePrompt: negativePrompt,
      CFGScale: styleSettings.CFGScale,
      steps: styleSettings.steps,
      model: 'runware:100@1',
      outputFormat: 'WEBP',
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      strength: 0.8
    });
    
  } catch (error) {
    console.error('🚨 Tier 2.5 Nuclear Independence: Error in rawPageText:', error);
    return createCorsErrorResponse(error.message || 'Unknown error occurred', 500);
  }
}

// ============= PROMPT COMPOSITION FUNCTION =============
function composeFinalPrompt(template, data) {
  let prompt = template;
  
  // Replace all placeholders
  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{${key}}`;
    prompt = prompt.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value || '');
  }
  
  return prompt;
}

// ============= CULTURAL PROFILE DETECTION FOR NEGATIVES =============
function detectCulturalProfileForNegatives(userInfo) {
    // Implement logic to detect cultural profile from userInfo
    // This is a placeholder; replace with actual implementation
    return "western"; // Default to western
}

// ============= CAMERA DIRECTIVE SELECTION =============
function selectCameraDirective(seed) {
    return getSeededRandomItem(cameraDirectives, seed);
}

// ============= SCENE SETTING SELECTION =============
function selectSceneSetting(seed) {
    return getSeededRandomItem(sceneSettings, seed);
}

// ============= ACTION INTENSITY SELECTION =============
function selectActionIntensity(seed) {
    return getSeededRandomItem(actionIntensities, seed);
}

// ============= SPATIAL POSITIONING SELECTION =============
function selectSpatialPositioning(seed) {
    return getSeededRandomItem(spatialPositionings, seed);
}

// ============= OBJECT INTERACTION SELECTION =============
function selectObjectInteraction(seed) {
    return getSeededRandomItem(objectInteractions, seed);
}

// ============= BODY LANGUAGE SELECTION =============
function selectBodyLanguage(seed) {
    return getSeededRandomItem(bodyLanguages, seed);
}

// ============= SPATIAL COMPOSITION SELECTION =============
function selectSpatialComposition(seed) {
    return getSeededRandomItem(spatialCompositions, seed);
}

// ============= ATMOSPHERE SELECTION =============
function selectAtmosphere(seed) {
    return getSeededRandomItem(atmospheres, seed);
}

// ============= PROP SELECTION =============
function selectProps(seed) {
    return getSeededRandomItem(props, seed);
}

// ============= ACTION OBJECT SELECTION =============
function selectActionObjects(seed) {
    return getSeededRandomItem(actionObjects, seed);
}

// ============= COLORED OBJECT SELECTION =============
function selectColoredObjects(seed) {
    return getSeededRandomItem(coloredObjectAdjectives, seed);
}

// ============= SENSORY DETAIL SELECTION =============
function selectSensoryDetails(seed) {
    return getSeededRandomItem(sensoryDetails, seed);
}

// ============= COMMUNITY CONTEXT SELECTION =============
function selectCommunityContext(seed) {
    return getSeededRandomItem(communityContexts, seed);
}

// ============= AGE ADJECTIVE SELECTION =============
function selectAgeAdjective(seed) {
    return getSeededRandomItem(ageAdjectives, seed);
}

// ============= ETHNICITY ADJECTIVE SELECTION =============
function selectEthnicityAdjective(seed) {
    return getSeededRandomItem(ethnicityAdjectives, seed);
}

// ============= HAIR ADJECTIVE SELECTION =============
function selectHairAdjective(seed) {
    return getSeededRandomItem(hairAdjectives, seed);
}

// ============= FEATURE ADJECTIVE SELECTION =============
function selectFeatureAdjective(seed) {
    return getSeededRandomItem(featureAdjectives, seed);
}

// ============= SUBJECT ADJECTIVE SELECTION =============
function selectSubjectAdjective(seed) {
    return getSeededRandomItem(subjectAdjectives, seed);
}

// ============= ACTION ADJECTIVE SELECTION =============
function selectActionAdjective(seed) {
    return getSeededRandomItem(actionAdjectives, seed);
}

// ============= EMOTION ADJECTIVE SELECTION =============
function selectEmotionAdjective(seed) {
    return getSeededRandomItem(emotionAdjectives, seed);
}

// ============= SECONDARY CHARACTER ADJECTIVE SELECTION =============
function selectSecondaryCharacterAdjective(seed) {
    return getSeededRandomItem(secondaryCharacterAdjectives, seed);
}

// ============= SETTING ADJECTIVE SELECTION =============
function selectSettingAdjective(seed) {
    return getSeededRandomItem(settingAdjectives, seed);
}

// ============= ADJECTIVE COLOR SELECTION =============
function selectAdjectiveColor(seed) {
    return getSeededRandomItem(adjectiveColors, seed);
}

// ============= SECONDARY CHARACTER PROCESSING =============
function processSecondaryCharacters(text, seed) {
    // Implement logic to process secondary characters
    // This is a placeholder; replace with actual implementation
    return getSeededRandomItem(secondaryCharacterAdjectives, seed);
}

// ============= OBJECT AND SCENE EXTRACTION =============
function extractObjectsAndScenes(text) {
    // Implement logic to extract objects and scenes from text
    // This is a placeholder; replace with actual implementation
    return "extracted objects and scenes";
}

// ============= MAIN SERVE FUNCTION =============
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  try {
    const requestBody = await req.json();
    console.log('📨 Tier 2.5 Nuclear Independence: Request received');
    
    // Extract parameters
    const { userInfo, pageText, sessionId, pageNumber, mode } = requestBody;
    
    // Validate required parameters
    if (!userInfo || !pageText || !sessionId || pageNumber === undefined) {
      return createCorsErrorResponse('Missing required parameters: userInfo, pageText, sessionId, pageNumber', 400);
    }
    
    // Generate prompt using rawPageText function
    const result = await rawPageText(userInfo, pageText, sessionId, pageNumber, mode);
    
    return result;
    
  } catch (error) {
    console.error('🚨 Tier 2.5 Nuclear Independence: Server error:', error);
    return createCorsErrorResponse(error.message || 'Internal server error', 500);
  }
});
