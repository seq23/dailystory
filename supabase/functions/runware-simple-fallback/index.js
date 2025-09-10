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
    frameworkPrompt: "Contemporary children's book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality",
    steps: 20,
    CFGScale: 7
  },
  'easy': {
    frameworkPrompt: "Contemporary children's book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality",
    steps: 22,
    CFGScale: 7.5
  },
  'medium': {
    frameworkPrompt: "2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation, warm natural lighting",
    steps: 25,
    CFGScale: 8
  },
  'hard': {
    frameworkPrompt: "2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation, warm natural lighting",
    steps: 28,
    CFGScale: 9
  },
  'expert': {
    frameworkPrompt: "2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation, warm natural lighting",
    steps: 30,
    CFGScale: 10
  }
};

// Helper: Validate difficulty level and fallback
function validateDifficultyLevel(level) {
  if (!level || !NUCLEAR_STYLE_SETTINGS[level]) {
    return 'beginner';
  }
  return level;
}

// Helper: Extract exact words from text for consistency
function extractExactWords(text) {
  const extractor = new ExactWordExtractor();
  return extractor.extract(text);
}

// Helper: Track visual details for consistency
function trackVisualDetails(text, sessionId) {
  const tracker = VisualDetailTracker.getInstance(sessionId);
  tracker.updateFromText(text);
  return tracker.getCurrentDetails();
}

// Helper: Manage character consistency
function manageCharacterConsistency(text, sessionId) {
  const service = CharacterConsistencyService.getInstance(sessionId);
  service.updateFromText(text);
  return service.getCurrentCharacterState();
}

// Core function to generate page text with nuclear negative prompt system
async function rawPageText(userInfo, pageText, sessionId, pageNumber, mode) {
  // Validate difficulty level from userInfo or mode
  const difficulty = validateDifficultyLevel(userInfo?.difficulty || mode);

  // Generate nuclear negative prompt based on cultural profile
  const culturalProfile = detectCulturalProfileForNegatives(userInfo);
  const negativePrompt = generateNuclearNegativePrompt(culturalProfile);

  // Extract exact words for consistency
  const exactWords = extractExactWords(pageText);

  // Track visual details for consistency
  const visualDetails = trackVisualDetails(pageText, sessionId);

  // Manage character consistency
  const characterState = manageCharacterConsistency(pageText, sessionId);

  // Compose final prompt for generation
  const styleSettings = NUCLEAR_STYLE_SETTINGS[difficulty];
  const finalPrompt = `${styleSettings.frameworkPrompt}, ${pageText}, avoid: ${negativePrompt}`;

  // Here you would call your image generation or story generation API
  // For demonstration, we simulate a generation result
  const generatedResult = {
    prompt: finalPrompt,
    negativePrompt,
    exactWords,
    visualDetails,
    characterState,
    steps: styleSettings.steps,
    CFGScale: styleSettings.CFGScale,
    pageNumber,
    sessionId,
    userInfo
  };

  // Save session state for continuity
  globalArcSessionManager.saveSession(sessionId, {
    lastPageText: pageText,
    difficulty,
    visualDetails,
    characterState,
    exactWords
  });

  return createCorsResponse({
    success: true,
    data: generatedResult
  });
}

// Main serve function
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  try {
    const { userInfo, pageText, sessionId, pageNumber, mode } = await req.json();
    
    console.log('🛡️ Tier 2.5 Nuclear Independence: Processing request');
    console.log('📊 Request data - UserInfo:', !!userInfo, 'PageText:', !!pageText, 'SessionId:', !!sessionId);
    
    const result = await rawPageText(userInfo, pageText, sessionId, pageNumber, mode);
    return result;
    
  } catch (error) {
    console.error('❌ Serve function error:', error);
    return createCorsErrorResponse(error.message || 'Request processing failed', 400);
  }
});
