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

// 🌍 CULTURAL PROMPT AUGMENTATION - GLOBAL SCOPE FOR FUNCTION ACCESS 🌍
const CULTURAL_PROMPT_AUGMENTATION = {
  'African': 'vibrant African tribal patterns, rich earthy tones, traditional African textiles, diverse African hairstyles, authentic cultural attire, dynamic compositions, elements of African wildlife, warm color palettes, detailed textures, celebrating African heritage',
  'East Asian': 'serene East Asian landscapes, delicate cherry blossoms, traditional East Asian calligraphy, elegant silk garments, harmonious color schemes, elements of East Asian mythology, refined brushwork, tranquil atmosphere, detailed architecture, celebrating East Asian culture',
  'European': 'classic European architecture, elegant Renaissance attire, romantic landscapes, refined artistic techniques, elements of European folklore, sophisticated compositions, warm lighting, detailed textures, celebrating European history',
  'Indian': 'vibrant Indian textiles, intricate henna patterns, traditional Indian jewelry, colorful saris, elements of Indian mythology, dynamic compositions, warm color palettes, detailed textures, celebrating Indian culture',
  'Latin American': 'colorful Latin American festivals, vibrant street art, traditional Latin American clothing, dynamic compositions, elements of Latin American folklore, warm color palettes, detailed textures, celebrating Latin American heritage',
  'Middle Eastern': 'intricate Middle Eastern mosaics, elegant Arabic calligraphy, traditional Middle Eastern attire, warm desert landscapes, elements of Middle Eastern mythology, refined artistic techniques, warm color palettes, detailed textures, celebrating Middle Eastern culture',
  'North American': 'iconic North American landmarks, diverse urban landscapes, traditional North American clothing, dynamic compositions, elements of North American folklore, warm color palettes, detailed textures, celebrating North American diversity',
  'Oceanic': 'lush Oceanic island landscapes, vibrant coral reefs, traditional Oceanic tribal patterns, dynamic compositions, elements of Oceanic mythology, warm color palettes, detailed textures, celebrating Oceanic heritage',
  'South American': 'lush South American rainforests, vibrant indigenous art, traditional South American clothing, dynamic compositions, elements of South American folklore, warm color palettes, detailed textures, celebrating South American heritage'
};

// 🎭 CHARACTER PROMPT AUGMENTATION - GLOBAL SCOPE FOR FUNCTION ACCESS 🎭
const CHARACTER_PROMPT_AUGMENTATION = {
  'child': 'charming child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation, warm natural lighting',
  'teenager': 'stylish teenager characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, teen-friendly, diverse representation, trendy fashion',
  'adult': 'elegant adult characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, adult-friendly, diverse representation, professional attire',
  'elder': 'wise elder characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, elder-friendly, diverse representation, traditional attire'
};

// ✨ POSITIVE PROMPT BOOSTERS - GLOBAL SCOPE FOR FUNCTION ACCESS ✨
const POSITIVE_PROMPT_BOOSTERS = [
  'high-quality',
  'high-resolution',
  'detailed',
  'intricate',
  'beautiful',
  'artistic',
  'painterly',
  'vibrant',
  'colorful',
  'dynamic',
  'expressive',
  'charming',
  'graceful',
  'elegant',
  'stylish',
  'wise',
  'serene',
  'tranquil',
  'harmonious',
  'refined',
  'warm',
  'lush',
  'iconic',
  'diverse',
  'authentic',
  'traditional',
  'contemporary',
  'semi-realistic',
  'photorealism-artistic balance',
  'dimensional skin rendering',
  'matte finish',
  'realistic materials',
  'raytraced shadows',
  'shallow DOF',
  'high-end rendering',
  'consistent topology & proportions',
  'child-friendly',
  'teen-friendly',
  'adult-friendly',
  'elder-friendly',
  'trendy fashion',
  'professional attire',
  'traditional attire',
  'sharp facial definition',
  'refined features',
  'detailed eye rendering with clear highlights',
  'character-focused composition',
  'facial detail emphasis',
  'detailed hair strands',
  'artistic lighting',
  'vibrant color harmony',
  'consistent character design',
  'child-friendly aesthetic',
  'diverse representation',
  'painterly texture quality',
  'golden hour volumetric lighting',
  'SSS',
  'AO',
  'GI',
  'AA'
];

// 🚫 UNIVERSAL NEGATIVE PROMPT - GLOBAL SCOPE FOR FUNCTION ACCESS 🚫
const UNIVERSAL_NEGATIVE_PROMPT = 'ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, mutation, mutated, extra limbs, extra legs, extra arms, disfigured, deformed, body out of frame, blurry, bad anatomy, watermark, signature, cut off, low contrast, underexposed, overexposed, bad art, beginner art, distorted face, unnatural pose, cartoonish, anime, 3D render, plasticine texture';

// 😠 ENHANCED NEGATIVE PROMPT - GLOBAL SCOPE FOR FUNCTION ACCESS 😠
const ENHANCED_NEGATIVE_PROMPT = 'unrealistic, unnatural, fake, synthetic, artifact, digital noise, compression artifacts, jpeg artifacts, aliasing, moiré, chromatic aberration, lens distortion, vignetting, grain, film grain, scan lines, interlacing, banding, posterization, color bleeding, color fringing, color cast, color quantization, color saturation, color desaturation, color inversion, color distortion, color aberration, color noise, color banding, color blocking, color bleeding, color fringing, color cast, color quantization, color saturation, color desaturation, color inversion, color distortion, color aberration, color noise, color banding, color blocking, color bleeding, color fringing, color cast, color quantization, color saturation, color desaturation, color inversion, color distortion, color aberration, color noise, color banding, color blocking, color bleeding, color fringing, color cast, color quantization, color saturation, color desaturation, color inversion, color distortion, color aberration, color noise, color banding, color blocking, color bleeding, color fringing, color cast, color quantization, color saturation, color desaturation, color inversion, color distortion, color aberration, color noise, color banding, color blocking';

// 💀 NUCLEAR NEGATIVE PROMPT - GLOBAL SCOPE FOR FUNCTION ACCESS 💀
const NUCLEAR_NEGATIVE_PROMPT = 'NSFW, nudity, sexual content, explicit content, inappropriate content, offensive content, hate speech, violence, gore, blood, dismemberment, mutilation, torture, abuse, exploitation, harassment, discrimination, prejudice, racism, sexism, homophobia, transphobia, xenophobia, ableism, ageism, classism, fatphobia, lookism, sizeism, speciesism, anthropocentrism, environmental destruction, pollution, deforestation, overfishing, poaching, animal cruelty, animal abuse, animal exploitation, animal testing, factory farming, slaughterhouses, fur farming, ivory trade, trophy hunting, illegal logging, illegal mining, illegal fishing, illegal wildlife trade, illegal dumping, illegal waste disposal, illegal construction, illegal deforestation, illegal mining, illegal fishing, illegal wildlife trade, illegal dumping, illegal waste disposal, illegal construction';

// 🖼️ IMAGE DIMENSIONS - GLOBAL SCOPE FOR FUNCTION ACCESS 🖼️
const IMAGE_DIMENSIONS = {
  width: 512,
  height: 512
};

// ⚙️ SAMPLER SETTINGS - GLOBAL SCOPE FOR FUNCTION ACCESS ⚙️
const SAMPLER_SETTINGS = {
  samplerName: 'Euler a',
  scheduler: 'normal'
};

// ============= TIER 2.5 NUCLEAR INDEPENDENCE - ALL UTILITY FUNCTIONS NEXT =============

// 🧪 PROMPT ENHANCEMENT UTILITY 🧪
function enhancePrompt(basePrompt, positiveBoosters = [], culturalAugmentation = '', characterAugmentation = '') {
  let enhancedPrompt = basePrompt;

  // Add positive boosters
  if (positiveBoosters && positiveBoosters.length > 0) {
    enhancedPrompt += ', ' + positiveBoosters.join(', ');
  }

  // Add cultural augmentation
  if (culturalAugmentation) {
    enhancedPrompt += ', ' + culturalAugmentation;
  }

  // Add character augmentation
  if (characterAugmentation) {
    enhancedPrompt += ', ' + characterAugmentation;
  }

  return enhancedPrompt;
}

// ☢️ PROMPT SANITIZATION UTILITY ☢️
function sanitizePrompt(prompt) {
  // Remove any characters that are not alphanumeric or whitespace
  let sanitizedPrompt = prompt.replace(/[^a-zA-Z0-9\s]/g, '');

  // Trim leading and trailing whitespace
  sanitizedPrompt = sanitizedPrompt.trim();

  // Replace multiple spaces with a single space
  sanitizedPrompt = sanitizedPrompt.replace(/\s+/g, ' ');

  return sanitizedPrompt;
}

// 🎭 CHARACTER AGE UTILITY 🎭
function getCharacterAge(userInfo) {
  // Check if userInfo and age property exist
  if (userInfo && userInfo.age) {
    const age = userInfo.age;

    // Determine character age based on age ranges
    if (age >= 0 && age <= 12) {
      return 'child';
    } else if (age >= 13 && age <= 19) {
      return 'teenager';
    } else if (age >= 20 && age <= 59) {
      return 'adult';
    } else {
      return 'elder';
    }
  } else {
    // Default to child if age is not provided
    return 'child';
  }
}

// 🌍 CULTURAL PROMPT UTILITY 🌍
function getCulturalPrompt(userInfo) {
  // Check if userInfo and culturalProfile property exist
  if (userInfo && userInfo.culturalProfile) {
    const culturalProfile = userInfo.culturalProfile;

    // Check if culturalProfile exists in CULTURAL_PROMPT_AUGMENTATION
    if (CULTURAL_PROMPT_AUGMENTATION[culturalProfile]) {
      return CULTURAL_PROMPT_AUGMENTATION[culturalProfile];
    } else {
      // Default to North American if culturalProfile is not found
      return CULTURAL_PROMPT_AUGMENTATION['North American'];
    }
  } else {
    // Default to North American if culturalProfile is not provided
    return CULTURAL_PROMPT_AUGMENTATION['North American'];
  }
}

// 🖼️ IMAGE GENERATION UTILITY 🖼️
async function generateImage(enhancedPrompt, negativePrompt, steps, CFGScale) {
  // Construct the payload for the image generation API
  const payload = {
    prompt: enhancedPrompt,
    negative_prompt: negativePrompt,
    steps: steps,
    width: IMAGE_DIMENSIONS.width,
    height: IMAGE_DIMENSIONS.height,
    sampler_name: SAMPLER_SETTINGS.samplerName,
    cfg_scale: CFGScale,
    seed: -1,
    // Add any other necessary parameters here
  };

  // Log the payload for debugging purposes
  console.log('Image generation payload:', payload);

  // Make the API request to the image generation service
  const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + Deno.env.get('STABILITY_AI_KEY'),
    },
    body: JSON.stringify(payload),
  });

  // Check if the request was successful
  if (!response.ok) {
    throw new Error(`Image generation failed with status ${response.status}`);
  }

  // Parse the response as JSON
  const data = await response.json();

  // Check if the data contains an image
  if (!data.artifacts || data.artifacts.length === 0) {
    throw new Error('No image found in the response');
  }

  // Extract the image data from the response
  const imageData = data.artifacts[0].base64;

  // Return the image data
  return imageData;
}

// 🔍 EXACT WORD EXTRACTION UTILITY 🔍
function extractExactWords(pageText, wordsToExtract) {
  const extractor = new ExactWordExtractor(wordsToExtract);
  return extractor.extractWords(pageText);
}

// 👁️ VISUAL DETAIL TRACKING UTILITY 👁️
function trackVisualDetails(pageText, previousDetails) {
  const tracker = new VisualDetailTracker();
  return tracker.updateDetails(pageText, previousDetails);
}

// 🎭 CHARACTER CONSISTENCY UTILITY 🎭
function ensureCharacterConsistency(pageText, previousCharacters) {
  const service = new CharacterConsistencyService();
  return service.ensureConsistency(pageText, previousCharacters);
}

// 💾 SESSION STATE MANAGEMENT UTILITY 💾
async function manageSessionState(sessionId, data) {
  const sessionManager = globalArcSessionManager;
  await sessionManager.updateSessionData(sessionId, data);
}

// 🌍 CULTURAL PROFILE DETECTION UTILITY 🌍
async function detectCulturalProfile(pageText) {
  return await detectCulturalProfileForNegatives(pageText);
}

// 🚫 NUCLEAR NEGATIVE PROMPT GENERATION UTILITY 🚫
async function generateNuclearNegative(culturalProfile) {
  return await generateNuclearNegativePrompt(culturalProfile);
}

// ============= TIER 2.5 NUCLEAR INDEPENDENCE - ALL MAIN FUNCTIONS NEXT =============

// 📜 RAW PAGE TEXT FUNCTION 📜
async function rawPageText(userInfo, pageText, sessionId, pageNumber, mode) {
  try {
    // Log the incoming parameters
    console.log('Incoming parameters:', { userInfo, pageText, sessionId, pageNumber, mode });

    // Validate required parameters
    if (!userInfo || !pageText || !sessionId || pageNumber === undefined) {
      throw new Error('Missing required parameters: userInfo, pageText, sessionId, pageNumber');
    }

    // Extract character age
    const characterAge = getCharacterAge(userInfo);

    // Get cultural prompt
    const culturalPrompt = getCulturalPrompt(userInfo);

    // Determine style settings based on mode
    const styleSettings = NUCLEAR_STYLE_SETTINGS[mode] || NUCLEAR_STYLE_SETTINGS['medium'];

    // Enhance the base prompt
    const enhancedPrompt = enhancePrompt(
      styleSettings.frameworkPrompt,
      POSITIVE_PROMPT_BOOSTERS,
      culturalPrompt,
      CHARACTER_PROMPT_AUGMENTATION[characterAge]
    );

    // Sanitize the enhanced prompt
    const sanitizedPrompt = sanitizePrompt(enhancedPrompt);

    // Generate the negative prompt
    const negativePrompt = UNIVERSAL_NEGATIVE_PROMPT + ', ' + ENHANCED_NEGATIVE_PROMPT + ', ' + NUCLEAR_NEGATIVE_PROMPT;

    // Generate the image
    const imageData = await generateImage(sanitizedPrompt, negativePrompt, styleSettings.steps, styleSettings.CFGScale);

    // Return the image data
    return createCorsResponse({
      success: true,
      imageData: imageData
    });
  } catch (error) {
    console.error('Error in rawPageText:', error);
    return createCorsErrorResponse(error.message || 'Internal server error');
  }
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
