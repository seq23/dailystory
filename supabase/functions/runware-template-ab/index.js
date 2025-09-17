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
  
  // CHILDREN'S BOOK ILLUSTRATION PROTECTION - Prevent adult photos and realistic photography
  const childrenBookNegativeBlock = 'NO adult faces, adult features, mature faces, adult photos, realistic photography, photorealistic adults, adult portraits, grown-up faces, realistic human photos, photo of adults, adult photography, mature portraits, realistic adult imagery, photo-realistic people, adult subjects, mature individuals, realistic human photography, adult models, stock photos of adults, professional adult photography';
  
  // GENDER-SPECIFIC NEGATIVES - Word-for-Word as Specified
  const boysNegative = 'NO feminine features, makeup, female anatomy, girl clothing, long feminine hairstyles, feminine accessories, narrow shoulders, feminine body structure, female proportions, feminine expressions, girl toys, female-coded activities exclusively';
  const girlsNegative = 'NO masculine features, facial hair, male anatomy, boy clothing, short masculine haircuts, broad shoulders, angular jaw, masculine body structure, male proportions, masculine expressions, boy toys, male-coded activities exclusively';
  const genderNeutralNegative = 'NO overly gendered features, extreme masculine traits, extreme feminine traits, gender-specific clothing, highly gendered toys, overly masculine expressions, overly feminine expressions, binary gender stereotypes, gendered color schemes exclusively';
  
  // COMPREHENSIVE AFRICAN AMERICAN PROTECTION (Complete 25+ Item List)
  const africanAmericanNegativeBlock = 'skin lightening, whitewashing, pale skin, light skin, caucasian features, european features, fair complexion, light complexion, white skin tone, bleached skin, lightened skin, washed out skin, faded skin tone, stereotypes, caricature, exaggerated features, cultural appropriation, offensive stereotypes, racial caricature, minstrel imagery, tokenism, straight hair texture, caucasian hair, european hair texture, fine hair texture, silky straight hair, pin straight hair, unnaturally straight hair, narrow nose, thin lips, small features, delicate bone structure, european bone structure, caucasian facial structure, non-African features';
  
  // UNIVERSAL CULTURAL SENSITIVITY 
  const culturalSensitivityNegativeBlock = 'cultural stereotypes, racial stereotypes, ethnic stereotypes, cultural caricature, offensive imagery, discriminatory content, prejudicial representation, cultural mockery, insensitive portrayal, appropriative elements, tokenistic representation, oversimplified culture, cultural reduction';
  
  let negativeComponents = [base, childrenBookNegativeBlock];
  
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
    const { characterConsistencyService } = await import("../_shared/CharacterConsistencyService.js");
    return characterConsistencyService; // Return singleton instance directly
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

// ============= MISSING HELPER FUNCTIONS =============
// These map to existing StaticDataCache functions
function getHair(skinTone) {
  const sessionId = 'default-session';
  return getHairBySkintone(skinTone, sessionId);
}

function getFeatures(skinTone) {
  const sessionId = 'default-session';
  return getSkinBySkintone(skinTone, sessionId);
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

// Inline cultural detection for proper profile resolution
function inlineDetectCultural(userInfo, avatarIdentity) {
  const culturalProfile = {
    nativeLanguage: userInfo?.nativeLanguage || 'en',
    skinTone: userInfo?.avatar?.skinTone || avatarIdentity?.skinTone || 'light',
    includes: function(term) {
      return this.nativeLanguage === term || this.skinTone === term;
    }
  };
  
  if (culturalProfile.nativeLanguage !== 'en' || 
      ['dark', 'medium-dark', 'brown'].includes(culturalProfile.skinTone)) {
    return 'african-american';
  }
  return 'general';
}

// ============= TEMPLATE SELECTION LOGIC =============
function selectTemplate(effectiveTierType) {
  if (effectiveTierType === '2.5A') {
    return TIER_25A_TEMPLATE;
  } else {
    return TIER_25B_TEMPLATE;
  }
}

// ============= ENHANCED SCENE EXTRACTION FOR TIER 2.5A =============
function extractSemanticScene(storyText) {
  if (!storyText || typeof storyText !== 'string') return 'playing happily';
  
  // Advanced scene extraction with semantic understanding
  const text = storyText.toLowerCase();
  
  const semanticPatterns = [
    { regex: /character.*?(\w+ing).*?(with|in|at)\s+([^.,!?]+)/i, transform: (m) => `${m[1]} ${m[2]} ${m[3]}` },
    { regex: /(\w+ing)\s+.*?(happily|sadly|excitedly|carefully|quietly)/i, transform: (m) => `${m[1]} ${m[2]}` },
    { regex: /character.*?(discovers|finds|sees)\s+([^.,!?]+)/i, transform: (m) => `discovering ${m[2]}` }
  ];
  
  for (const pattern of semanticPatterns) {
    const match = storyText.match(pattern.regex);
    if (match) {
      return pattern.transform(match);
    }
  }
  
  // Fallback to simple scene extraction
  return extractSimpleScene(storyText) || 'engaging in story activity';
}

// ============= CULTURAL CONTEXT DERIVATION =============
function deriveNonEnglishCulturalContext(userInfo) {
  const language = userInfo?.nativeLanguage || userInfo?.language || 'en';
  
  // Only return cultural context for non-English languages
  if (language === 'en') return '';
  
  const culturalContextMap = {
    'es': 'Hispanic cultural setting',
    'pt': 'Portuguese cultural environment',
    'fr': 'French cultural atmosphere',
    'zh': 'Chinese cultural background',
    'ja': 'Japanese cultural setting',
    'ar': 'Arabic cultural environment'
  };
  
  return culturalContextMap[language] || '';
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
// ============= TIER 2.5A/B TEMPLATES - CATEGORY-BASED WITH LINE BREAKS =============
const TIER_25A_TEMPLATE = `Narrative: {pageText}.
Character Description: {character} {age}, {ethnicity}, {hair}, {features} {bundle.culturalEnhancements}.
Action: {semantic_scene}.
Secondary elements: {secondary_characters}.
Consistency: {visual_consistency_elements}.
Context: {cultural_context}, {community_context}.
Brand Suffix: {frameworkPrompt}, {cameraDirective}.`;

const TIER_25B_TEMPLATE = `Narrative: {pageText}.
Subject: {character}, {age}, {ethnicity}, {hairDescription}, {facialFeatures}.
Action: {scene}
Context: {cultural_context} {leftover_data}.
Brand Suffix: {fullFrameworkPrompt},`;

// ============= EXPORT TEMPLATES FOR VALIDATION =============
export { TIER_25A_TEMPLATE, TIER_25B_TEMPLATE };

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
      timestamp: new Date().toISOString()
    });
  }

  try {
    const { bundle, config } = await req.json();
    console.log('🎯 Template AB Core Engine:', { bundle, config });

    // Basic validation
    if (!bundle || !config) {
      throw new Error('Missing bundle or config parameters');
    }

    // PHASE 2: Determine tier type (2.5A vs 2.5B)
    const userInfo = bundle.userInfo || {};
    const skinTone = userInfo.skinTone || userInfo?.avatar?.skinTone || 'medium';
    const effectiveTierType = (skinTone === 'dark' || skinTone === 'darker') ? '2.5A' : '2.5B';
    console.log(`🎯 Effective tier type: ${effectiveTierType} (skin: ${skinTone})`);

    // PHASE 3: Select appropriate template
    const templateString = selectTemplate(effectiveTierType);
    console.log(`📄 Selected template: ${templateString.substring(0, 100)}...`);

    // Phase 4: Load services
    const characterService = effectiveTierType === '2.5A' ? await getCharacterService() : null;
    const resolver = await getUnifiedPlaceholderResolver();
    
    if (!resolver) {
      throw new Error('[Template AB] UnifiedPlaceholderResolver service failed to load');
    }

    // PHASE 5: Prepare context for resolution with storyText fallback
    const pageText = bundle.pageText || bundle.storyText || '';
    const resolutionContext = {
      userInfo,
      seed: bundle.seed || {},
      sessionId: bundle.sessionId || 'default',
      pageNumber: bundle.pageNumber || 1,
      templateLevel: bundle.templateLevel || '0',
      effectiveTierType,
      characterService
    };

    // PHASE 6: Handle character service calls for 2.5A tier
    let secondaryCharacters = '';
    let visualConsistencyElements = '';
    
    if (effectiveTierType === '2.5A' && characterService) {
      try {
        secondaryCharacters = await characterService.detectSecondaryCharacters(pageText);
      } catch (error) {
        console.warn('[Template AB] Character service detectSecondaryCharacters failed:', error);
        secondaryCharacters = '';
      }
      
      try {
        visualConsistencyElements = await characterService.getCharacterAppearanceFromStory(bundle.sessionId, userInfo?.name || userInfo?.childName);
      } catch (error) {
        console.warn('[Template AB] Character service getCharacterAppearanceFromStory failed:', error);
        visualConsistencyElements = '';
      }
    }

    // PHASE 7: Build enhanced context object
    const fullContext = {
      ...bundle,
      ...resolutionContext,
      pageText,
      ethnicity: deriveRegionalEthnicity(userInfo, userInfo?.avatarIdentity),
      hair: getHair(skinTone),
      features: getFeatures(skinTone),
      hairDescription: getHair(skinTone),
      facialFeatures: getFeatures(skinTone),
      scene: extractSimpleScene(pageText),
      semantic_scene: effectiveTierType === '2.5A' ? extractSemanticScene(pageText) : extractSimpleScene(pageText),
      secondary_characters: secondaryCharacters,
      visual_consistency_elements: visualConsistencyElements,
      cultural_context: deriveNonEnglishCulturalContext(userInfo),
      community_context: '',
      character: bundle.characterData?.name || userInfo?.name || userInfo?.childName || 'child',
      age: userInfo?.age || '6',
      leftover_data: bundle.leftoverData || '',
      cameraDirective: 'medium shot',
      frameworkPrompt: getNuclearStyleFramework(bundle.templateLevel || 'medium').frameworkPrompt,
      fullFrameworkPrompt: getNuclearStyleFramework(bundle.templateLevel || 'medium').frameworkPrompt
    };

    // PHASE 7: Resolve placeholders
    let result = await resolver.resolveAllPlaceholders(templateString, fullContext);

    // PHASE 8: Handle template resolution failure - escalation logic
    if (!result.success || result.remainingPlaceholders > 0) {
      console.warn(`⚠️ Template resolution failed for ${effectiveTierType}, attempting escalation`);
      
      if (effectiveTierType === '2.5A') {
        // Escalate to 2.5B as fallback
        console.log('🔄 Escalating from 2.5A to 2.5B template');
        const fallbackTemplate = selectTemplate('2.5B');
        result = await resolver.resolveAllPlaceholders(fallbackTemplate, fullContext);
      }
    }

    console.log(`🔧 [Template AB] Resolution completed successfully`);

    // Get proper cultural profile for negative prompt generation
    const culturalProfileType = inlineDetectCultural(userInfo, bundle.userInfo?.avatar);
    console.log(`🎭 [Template AB] CULTURAL PROFILE DETECTION FIX: Detected ${culturalProfileType} profile for user with skinTone: ${userInfo?.avatar?.skinTone || 'not specified'}, language: ${userInfo?.nativeLanguage || 'en'}`);
    
    return createResponse({
      success: true,
      prompt: result.resolvedText,
      negative: generateInlineNuclearNegative(culturalProfileType, userInfo?.avatar?.type || 'child', bundle.templateLevel),
      templateUsed: `${effectiveTierType}: ${templateString.substring(0, 50)}...`,
      resolutionDetails: result,
      tierType: effectiveTierType
    });

  } catch (error) {
    console.error('❌ [Template AB] Error:', error);
    return createErrorResponse(error);
  }
});