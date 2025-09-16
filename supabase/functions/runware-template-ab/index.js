// DEPLOY_MARKER: 2025-09-15T00:12:00Z - FORCE REDEPLOY PRIORITY
// ============= TIER 2.5A-B: RUNWARE TEMPLATE AB (A-B COMPLEXITY) =============
// Handles Level A (basic shapes/colors) and Level B (simple scenes)
// Lightweight, fast deployment - optimized for simple template generation with character consistency

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callRunwareAPIWithRetry } from './callRunwareAPIWithRetry.js';
import { 
  getHairBySkintone, 
  getSkinBySkintone,
  getAfricanAmericanHair, 
  getAfricanAmericanFeatures, 
  shouldApplyCulturalEnhancements,
  getCulturalBundle 
} from '../_shared/StaticDataCache.js';

// ============= NUCLEAR INDEPENDENCE: COMPLETE STYLE FRAMEWORKS =============
const NUCLEAR_HARDCODED_STYLE_FRAMEWORKS = {
  'beginner': {
    name: 'Contemporary Children\'s Book Illustration',
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, warm natural lighting'
  },
  'easy': {
    name: 'Contemporary Children\'s Book Illustration', 
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, warm natural lighting'
  },
  'medium': {
    name: 'Contemporary Children\'s Book Illustration',
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, warm natural lighting'
  },
  'hard': {
    name: '2.9D Rendered Illustration',
    frameworkPrompt: '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly'
  },
  'expert': {
    name: '2.9D Rendered Illustration',
    frameworkPrompt: '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly'
  }
};

function getNuclearStyleFramework(difficulty) {
  const normalizedDifficulty = difficulty?.toLowerCase() || 'medium';
  const framework = NUCLEAR_HARDCODED_STYLE_FRAMEWORKS[normalizedDifficulty] || NUCLEAR_HARDCODED_STYLE_FRAMEWORKS['medium'];
  
  console.log(`🎨 Nuclear Retrieved ${framework.name} style framework for difficulty: ${normalizedDifficulty}`);
  return framework;
}

// ============= NUCLEAR INDEPENDENCE: COMPREHENSIVE NEGATIVE PROMPTS =============
function generateInlineNuclearNegative(culturalProfile, avatarType, difficulty) {
  // NUCLEAR UNIFIED BASE - Word-for-Word as Specified
  const base = 'NO TEXT, no words, no letters, no writing, no captions, no watermarks, no signatures, no logos, bad anatomy, deformed, blurry, low quality, distorted face, extra limbs, malformed hands, poorly drawn, artifacts, noise, oversaturated, underexposed, overexposed, duplicate, cropped, watermark, signature, text, logo, bad lighting, flat lighting, plastic skin, waxy skin, artificial look, uncanny valley';
  
  // GENDER-SPECIFIC NEGATIVES - Word-for-Word as Specified  
  const boysNegative = 'NO feminine features, makeup, female anatomy, girl clothing, long feminine hairstyles, feminine accessories, narrow shoulders, feminine body structure, female proportions, feminine expressions, girl toys, female-coded activities exclusively';
  const girlsNegative = 'NO masculine features, facial hair, male anatomy, boy clothing, short masculine haircuts, broad shoulders, angular jaw, masculine body structure, male proportions, masculine expressions, boy toys, male-coded activities exclusively';
  const genderNeutralNegative = 'NO overly gendered features, extreme masculine traits, extreme feminine traits, gender-specific clothing, highly gendered toys, overly masculine expressions, overly feminine expressions, binary gender stereotypes, gendered color schemes exclusively';
  
  // COMPREHENSIVE AFRICAN AMERICAN PROTECTION (Complete 25+ Item List)
  const africanAmericanNegativeBlock = 'skin lightening, whitewashing, pale skin, light skin, caucasian features, european features, fair complexion, light complexion, white skin tone, bleached skin, lightened skin, washed out skin, faded skin tone, stereotypes, caricature, exaggerated features, cultural appropriation, offensive stereotypes, racial caricature, minstrel imagery, tokenism, straight hair texture, caucasian hair, european hair texture, fine hair texture, silky straight hair, pin straight hair, unnaturally straight hair, narrow nose, thin lips, small features, delicate bone structure, european bone structure, caucasian facial structure, non-African features';
  
  // UNIVERSAL CULTURAL SENSITIVITY 
  const culturalSensitivityNegativeBlock = 'cultural stereotypes, racial stereotypes, ethnic stereotypes, cultural caricature, offensive imagery, discriminatory content, prejudicial representation, cultural mockery, insensitive portrayal, appropriative elements, tokenistic representation, oversimplified culture, cultural reduction';
  
  let negativeComponents = [base];
  
  // Apply gender-specific negatives
  if (avatarType && avatarType.includes('boy')) {
    negativeComponents.push(boysNegative);
  } else if (avatarType && avatarType.includes('girl')) {
    negativeComponents.push(girlsNegative);
  } else {
    negativeComponents.push(genderNeutralNegative);
  }
  
  // Apply African American protection
  if (culturalProfile === 'african-american') {
    negativeComponents.push(africanAmericanNegativeBlock);
  }
  
  // Always apply cultural sensitivity
  negativeComponents.push(culturalSensitivityNegativeBlock);
  
  return negativeComponents.join(', ');
}

console.log(`INIT runware-template-ab boot at ${new Date().toISOString()} | std@0.168.0`);

// ============= LAZY LOADING FUNCTIONS FOR HEAVY DEPENDENCIES =============

async function getCharacterService() {
  try {
    const { CharacterConsistencyService } = await import("../_shared/CharacterConsistencyService.js");
    return CharacterConsistencyService;
  } catch (error) {
    console.warn('CharacterService lazy load failed:', error);
    return null;
  }
}

async function getUnifiedPlaceholderResolver() {
  try {
    const { unifiedPlaceholderResolver } = await import("../_shared/UnifiedPlaceholderResolver.js");
    return unifiedPlaceholderResolver;
  } catch (error) {
    console.warn('UnifiedPlaceholderResolver lazy load failed:', error);
    return null;
  }
}

// ============= FIXED REGIONAL ETHNICITY DERIVATION =============
function deriveRegionalEthnicity(userInfo, avatarIdentity) {
  // Primary: Use avatar ethnicity if available
  if (avatarIdentity?.ethnicity) {
    return avatarIdentity.ethnicity;
  }
  
  // Secondary: Derive from language and skin tone
  const nativeLanguage = userInfo?.nativeLanguage || userInfo?.language || 'en';
  const skinTone = userInfo?.skinTone || userInfo?.avatar?.skinTone || 'medium';
  
  // Language-based ethnicity mapping
  const languageEthnicityMap = {
    'es': 'Hispanic',
    'pt': 'Portuguese',
    'fr': 'French',
    'it': 'Italian',
    'de': 'German',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ar': 'Arabic',
    'hi': 'Indian',
    'ru': 'Russian'
  };
  
  // For dark skin tones, enforce ethnicity
  if (skinTone === 'dark' || skinTone === 'darker') {
    if (['en', 'fr'].includes(nativeLanguage)) {
      return 'African American';
    } else if (nativeLanguage === 'pt') {
      return 'Afro-Brazilian';
    } else if (nativeLanguage === 'es') {
      return 'Afro-Latino';
    }
  }
  
  // For light/pale/medium/olive skin with English - NO ethnicity (empty string)
  if (nativeLanguage === 'en' && ['light', 'pale', 'medium', 'olive'].includes(skinTone)) {
    return '';
  }
  
  // Use language mapping for other cases
  return languageEthnicityMap[nativeLanguage] || '';
}

// PHASE 4: Session management removed - orchestrator handles all session state
// Session data flows via function parameters only

async function getVisualTracker() {
  try {
    const { visualDetailTracker } = await import("../_shared/VisualDetailTracker.js");
    return visualDetailTracker; // Use singleton instance
  } catch (error) {
    console.warn('VisualTracker lazy load failed:', error);
    return null;
  }
}

// ============= PHASE 4: SERVICE HEALTH MONITORING =============
async function getServiceHealthMonitor() {
  try {
    const { serviceHealthMonitor } = await import("../_shared/ServiceHealthMonitor.js");
    return serviceHealthMonitor;
  } catch (error) {
    console.warn('ServiceHealthMonitor not available:', error);
    return null;
  }
}

// ============= CORS HEADERS =============
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

function createResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function createErrorResponse(error, status = 500) {
  console.error('Template AB Error:', error);
  return createResponse({ 
    success: false, 
    error: error instanceof Error ? error.message : error 
  }, status);
}

// ============= COMPLEXITY LEVEL DETECTION =============
function getComplexityLevel(userInfo, templateComplexity) {
  // Handle A-B complexity levels only
  const validLevels = ['A', 'B'];
  
  if (templateComplexity && validLevels.includes(templateComplexity)) {
    console.log(`🎯 Template AB: Using provided complexity: ${templateComplexity}`);
    return templateComplexity;
  }
  
  // Map user info to A-B complexity
  const gradeLevel = userInfo?.gradeLevel || 'K';
  const age = userInfo?.age || 5;
  
  if (gradeLevel === 'K' || gradeLevel === '1' || age <= 6) {
    return 'A'; // Basic shapes and colors
  }
  
  return 'B'; // Simple scenes
}

// ============= SCENE/SETTING EXTRACTION FUNCTIONS =============

// TIER 2.5B: SIMPLIFIED SCENE EXTRACTION (Enhanced for Level 0)
// Extracts: Action + Object + Location with comprehensive Level 0 coverage
function extractSimpleScene(storyText) {
  if (!storyText || typeof storyText !== 'string') return '';
  
  console.log('🔍 Simple regex scene extraction from story text');
  
  const text = storyText.toLowerCase();
  
  // ENHANCED LEVEL 0 ACTION DETECTION PATTERNS
  const level0ActionPatterns = [
    // Wake up patterns
    { regex: /\b(wake|wakes|woke|waking)\s+up\b/i, result: 'sitting up in bed with arms stretched' },
    { regex: /\b(get|gets|getting)\s+up\b/i, result: 'getting up from bed cheerfully' },
    
    // Sleep patterns  
    { regex: /\b(sleep|sleeps|sleeping|slept)\b/i, result: 'lying peacefully in bed' },
    { regex: /\bbed\s+time\b/i, result: 'getting ready for bed' },
    
    // Eating patterns
    { regex: /\b(eat|eats|eating|ate)\b/i, result: 'sitting at table eating happily' },
    { regex: /\btime\s+to\s+eat\b/i, result: 'sitting down for mealtime' },
    
    // Playing patterns
    { regex: /\b(play|plays|playing|played)\b/i, result: 'playing joyfully' },
    { regex: /\bwith\s+(ball|toy|doll|blocks)\b/i, result: 'playing with favorite toy' },
    
    // Movement patterns
    { regex: /\b(run|runs|running|ran)\b/i, result: 'running energetically' },
    { regex: /\b(jump|jumps|jumping|jumped)\b/i, result: 'jumping excitedly' },
    { regex: /\b(walk|walks|walking|walked)\b/i, result: 'walking happily' },
    { regex: /\b(climb|climbs|climbing|climbed)\b/i, result: 'climbing carefully' },
    { regex: /\b(swing|swings|swinging)\b/i, result: 'swinging back and forth' },
    { regex: /\b(slide|slides|sliding)\b/i, result: 'going down the slide' },
    
    // Helping patterns
    { regex: /\b(help|helps|helping|helped)\b/i, result: 'standing ready to help' },
    { regex: /\b(clean|cleans|cleaning|cleaned)\b/i, result: 'helping to clean up' },
    { regex: /\b(make|makes|making|made)\b/i, result: 'helping to make something' },
    
    // Creative patterns
    { regex: /\b(read|reads|reading)\b/i, result: 'sitting comfortably reading' },
    { regex: /\b(draw|draws|drawing|drew)\b/i, result: 'sitting at table drawing' },
    { regex: /\b(sing|sings|singing|sang)\b/i, result: 'singing happily' },
    { regex: /\b(dance|dances|dancing|danced)\b/i, result: 'dancing joyfully' },
    { regex: /\b(build|builds|building|built)\b/i, result: 'building with blocks' },
    
    // Care activities
    { regex: /\b(put|puts|putting)\s+(on|away)\b/i, result: 'putting things in place' },
    { regex: /\b(take|takes|taking|took)\b/i, result: 'taking something carefully' },
    { regex: /\b(give|gives|giving|gave)\b/i, result: 'giving something kindly' },
    { regex: /\bget\s+(in|out|on|off)\b/i, result: 'moving carefully' },
    
    // Looking/seeing patterns
    { regex: /\b(look|looks|looking|looked)\b/i, result: 'looking curiously' },
    { regex: /\b(see|sees|seeing|saw)\b/i, result: 'seeing something interesting' },
    { regex: /\b(watch|watches|watching|watched)\b/i, result: 'watching attentively' }
  ];

  // Try Level 0 specific patterns first
  for (const pattern of level0ActionPatterns) {
    if (pattern.regex.test(storyText)) {
      const location = extractLocationFromText(text);
      const locationPhrase = location ? ` in the ${location}` : '';
      console.log(`✅ Level 0 action pattern matched: "${pattern.result}${locationPhrase}"`);
      return `${pattern.result}${locationPhrase}`;
    }
  }

  // Enhanced ACTION VERB NORMALIZATION MAPPING
  const actionNormalizationMap = {
    'walked': 'walking happily',
    'woke up': 'sitting up in bed with arms stretched',
    'cooking': 'standing at stove cooking',
    'walked through': 'walking through',
    'running around': 'running energetically',
    'jumped on': 'jumping excitedly on',
    'sat down': 'sitting comfortably',
    'lying down': 'lying peacefully'
  };

  // Try enhanced mappings
  for (const [pattern, normalized] of Object.entries(actionNormalizationMap)) {
    if (text.includes(pattern)) {
      // Build complete scene with normalized action
      const location = extractLocationFromText(text);
      return location ? `${normalized} in the ${location}` : normalized;
    }
  }

  // Basic action + object + location patterns
  const actionPatterns = [
    // Present continuous: "playing with ball"
    /(\w+ing)\s+(?:with\s+)?([^.,!?]*?)(?:\s+(?:in|at|on)\s+(?:the\s+)?([^.,!?]*))?/i,
    // Past tense: "played with ball"
    /(\w+ed)\s+(?:with\s+)?([^.,!?]*?)(?:\s+(?:in|at|on)\s+(?:the\s+)?([^.,!?]*))?/i,
    // Simple verbs: "runs in park"
    /(runs?|jumps?|sits?|stands?)\s+(?:in|at|on|with)?\s*([^.,!?]*)/i
  ];
  
  for (const pattern of actionPatterns) {
    const match = storyText.match(pattern);
    if (match) {
      let action = match[1].trim();
      const object = match[2] ? match[2].trim() : '';
      const location = match[3] ? match[3].trim() : extractLocationFromText(text);
      
      // Normalize action verb
      if (action.endsWith('ed')) {
        action = action.slice(0, -2) + 'ing';
      }
      if (action.endsWith('s') && !action.endsWith('ing')) {
        action = action.slice(0, -1) + 'ing';
      }
      
      // Build scene components with action verb leading
      const sceneComponents = [
        action,
        object,
        location ? `in the ${location}` : ''
      ].filter(Boolean);
      
      const scene = sceneComponents.join(' ');
      console.log(`✅ Simple scene extracted: "${scene}"`);
      return scene;
    }
  }

  // INTELLIGENT INFERENCE for Level 0 patterns (maintains text integrity)
  if (text.includes('ball is red') || text.includes('red ball')) {
    const location = extractLocationFromText(text);
    return location ? `holding red ball cheerfully in the ${location}` : 'holding red ball cheerfully outside';
  }
  
  if (text.includes('ball is') || text.includes('the ball')) {
    const location = extractLocationFromText(text);
    return location ? `playing with ball happily in the ${location}` : 'playing with ball happily outside';
  }
  
  // Level 0 location-based intelligent inference
  if (text.includes('beach')) return 'playing joyfully at the sunny beach';
  if (text.includes('park')) return 'playing happily in the park';
  if (text.includes('kitchen')) return 'helping cheerfully in the bright kitchen';
  if (text.includes('bedroom')) return 'playing quietly in the cozy bedroom';
  if (text.includes('school')) return 'learning happily at school';
  if (text.includes('home')) return 'playing contentedly at home';
  
  // Enhanced object-based inference
  if (text.includes('toy') || text.includes('toys')) return 'playing happily with toys';
  if (text.includes('food') || text.includes('cookie') || text.includes('apple')) return 'enjoying delicious food';
  
  return 'playing happily outdoors';
}

// Helper function for location extraction
function extractLocationFromText(text) {
  const locationPattern = /\b(?:in|at|on|near)\s+(?:the\s+)?([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/;
  const match = text.match(locationPattern);
  return match ? match[1] : null;
}

// Continue with rest of existing implementation...
const NUCLEAR_HARDCODED_PREMIUM_TEMPLATES = {
  A: `{character}, {ethnicity}, {hair}, {features}, {semantic_scene}, {frameworkPrompt}`,
  B: `{character}, {ethnicity}, {hair}, {features}, {scene}, {frameworkPrompt}`
};

const NUCLEAR_HARDCODED_BASIC_TEMPLATES = {
  A: `{character}, {hairDescription}, {semantic_scene}, {frameworkPrompt}`,
  B: `{character}, {hairDescription}, {scene}, {frameworkPrompt}`
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle health check requests (GET/HEAD)
  if (req.method === 'GET' || req.method === 'HEAD') {
    return createResponse({
      status: 'healthy',
      functionName: 'runware-template-ab',
      tier: '2.5A-B',
      complexity: 'A-B',
      timestamp: new Date().toISOString(),
      sessionArchitecture: 'parameter-based'
    });
  }

  try {
    const { pageText, userInfo, sessionId, pageNumber, totalPages, avatarIdentity } = await req.json();

    if (!pageText || !userInfo) {
      return createErrorResponse('Missing required parameters: pageText and userInfo', 400);
    }

    // Derive ethnicity properly
    const ethnicity = deriveRegionalEthnicity(userInfo, avatarIdentity);
    
    // Get complexity level
    const complexityLevel = getComplexityLevel(userInfo);
    
    // Get style framework
    const framework = getNuclearStyleFramework(userInfo.difficulty || 'medium');
    
    // Determine if user needs cultural enhancements (dark skin)
    const needsCulturalEnhancements = shouldApplyCulturalEnhancements(userInfo);
    
    // Select template type based on cultural needs
    const templateSet = needsCulturalEnhancements ? NUCLEAR_HARDCODED_PREMIUM_TEMPLATES : NUCLEAR_HARDCODED_BASIC_TEMPLATES;
    const promptTemplate = templateSet[complexityLevel];
    
    // Get placeholder resolver
    const resolver = await getUnifiedPlaceholderResolver();
    if (!resolver) {
      return createErrorResponse('Placeholder resolver not available', 500);
    }
    
    // Prepare context for placeholder resolution
    const context = {
      userInfo: {
        ...userInfo,
        ethnicity // Include fixed ethnicity
      },
      pageText,
      sessionId,
      pageNumber,
      frameworkPrompt: framework.frameworkPrompt
    };
    
    // Resolve all placeholders
    const resolution = await resolver.resolveAllPlaceholders(promptTemplate, context);
    
    if (!resolution.success) {
      return createErrorResponse('Placeholder resolution failed', 500);
    }
    
    // Generate negative prompt
    const avatarType = userInfo.avatarType || resolver.deriveAvatarType(userInfo);
    const culturalProfile = needsCulturalEnhancements ? 'african-american' : 'standard';
    const negativePrompt = generateInlineNuclearNegative(culturalProfile, avatarType, userInfo.difficulty);
    
    // Call Runware API - FIX: Use correct function signature
    console.log(`🔧 [TEMPLATE-AB] Calling Runware API with CFGScale=8, steps=25`);
    const imageResult = await callRunwareAPIWithRetry(
      resolution.resolvedText,
      negativePrompt
    );
    
    return createResponse({
      success: true,
      // Schema alignment with tester and CD function
      imageURL: imageResult.imageURL,
      imageUrl: imageResult.imageURL, // backward-compat
      positivePrompt: resolution.resolvedText,
      prompt: resolution.resolvedText, // backward-compat
      negativePrompt,
      tier: complexityLevel === 'A' ? '2.5A' : '2.5B',
      complexity: complexityLevel,
      styleFrameworkUsed: framework.name,
      culturalProfile,
      ethnicity,
      resolution
    });

  } catch (error) {
    console.error('Template AB Error:', error);
    return createErrorResponse(error.message, 500);
  }
});