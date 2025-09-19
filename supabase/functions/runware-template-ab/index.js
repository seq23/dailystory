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
function selectTemplate(templateComplexity) {
  if (templateComplexity === 'A') {
    // Premium Template: Full avatar consistency + enhanced features
    return {
      name: 'Premium Template A',
      enhancedFeatures: true,
      avatarConsistency: true,
      culturalEnhancements: true,
      visualTracking: true
    };
  } else if (templateComplexity === 'B') {
    // Basic Template: Reduced features, faster processing
    return {
      name: 'Basic Template B', 
      enhancedFeatures: false,
      avatarConsistency: true,
      culturalEnhancements: false,
      visualTracking: false
    };
  } else {
    // Default to A if not specified
    return selectTemplate('A');
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
  if (!storyText || typeof storyText !== 'string') return 'playing happily';
  
  console.log('🔍 TIER 2.5B: Enhanced hybrid extraction with intelligent pattern detection');
  
  // ============= LOCAL HELPER FUNCTION FOR LOCATION EXTRACTION =============
  function getLocationFromText(text) {
    const locationPatterns = [
      // Direct location mentions
      /\b(?:in|at|on|near)\s+(?:the\s+)?([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/gi,
      // Context-based location inference
      /\b(bedroom|kitchen|park|beach|school|home|garden|playground|library|store)\b/gi
    ];
    
    for (const pattern of locationPatterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        return matches[0][1] || matches[0][0];
      }
    }
    return null;
  }
  
  const text = storyText.toLowerCase();
  
  // ============= PHASE 1: COMPOUND PHRASE DETECTION =============
  const compoundPhrases = [
    { pattern: /rolls?\s+down\s+(?:the\s+)?hill/i, result: 'rolling down the grassy hill' },
    { pattern: /climbs?\s+up\s+(?:the\s+)?tree/i, result: 'climbing up the tall tree' },
    { pattern: /swings?\s+on\s+(?:the\s+)?swing/i, result: 'swinging joyfully on the playground swing' },
    { pattern: /slides?\s+down\s+(?:the\s+)?slide/i, result: 'sliding down the playground slide' },
    { pattern: /runs?\s+around\s+(?:the\s+)?(?:yard|garden|park)/i, result: 'running energetically around the yard' },
    { pattern: /jumps?\s+on\s+(?:the\s+)?(?:bed|trampoline)/i, result: 'jumping excitedly on the bed' }
  ];
  
  for (const phrase of compoundPhrases) {
    if (phrase.pattern.test(storyText)) {
      console.log(`✅ Compound phrase detected: "${phrase.result}"`);
      return phrase.result;
    }
  }
  
  // ============= PHASE 2: EXACT WORD EXTRACTION WITH COMPREHENSIVE VOCABULARIES =============
  
  // Enhanced Action Vocabulary
  const actionWords = {
    // Movement actions
    moving: ['walk', 'walking', 'run', 'running', 'jump', 'jumping', 'climb', 'climbing', 'dance', 'dancing'],
    // Physical actions
    physical: ['play', 'playing', 'build', 'building', 'draw', 'drawing', 'eat', 'eating', 'sleep', 'sleeping'],
    // Emotional actions
    emotional: ['laugh', 'laughing', 'smile', 'smiling', 'sing', 'singing', 'help', 'helping']
  };
  
  // Enhanced Object Vocabulary with Color Combinations
  const objectWords = {
    toys: ['ball', 'doll', 'blocks', 'truck', 'car', 'puzzle', 'game'],
    nature: ['flower', 'tree', 'rock', 'leaf', 'grass', 'water'],
    household: ['book', 'chair', 'table', 'cup', 'spoon', 'blanket'],
    animals: ['dog', 'cat', 'bird', 'butterfly', 'fish'],
    colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink']
  };
  
  // Enhanced Setting Vocabulary
  const settingWords = {
    outdoor: ['park', 'garden', 'beach', 'playground', 'yard', 'forest'],
    indoor: ['bedroom', 'kitchen', 'living room', 'bathroom', 'classroom'],
    activity_based: {
      sleep: 'bedroom',
      eat: 'kitchen',
      read: 'library',
      play: 'playground'
    }
  };
  
  // Extract primary action
  let extractedAction = 'moving';
  for (const [category, words] of Object.entries(actionWords)) {
    for (const word of words) {
      if (text.includes(word)) {
        extractedAction = word;
        break;
      }
    }
    if (extractedAction !== 'moving') break;
  }
  
  // Extract objects with color priority
  let extractedObjects = [];
  
  // Check for color-object combinations first
  for (const color of objectWords.colors) {
    if (text.includes(color)) {
      for (const [category, objects] of Object.entries(objectWords)) {
        if (category === 'colors') continue;
        for (const obj of objects) {
          if (text.includes(obj)) {
            extractedObjects.push(`${color} ${obj}`);
          }
        }
      }
    }
  }
  
  // If no color combinations, extract regular objects
  if (extractedObjects.length === 0) {
    for (const [category, objects] of Object.entries(objectWords)) {
      if (category === 'colors') continue;
      for (const obj of objects) {
        if (text.includes(obj)) {
          extractedObjects.push(obj);
        }
      }
    }
  }
  
  // If no objects found, default
  if (extractedObjects.length === 0) {
    extractedObjects = ['something special'];
  }
  
  // Extract setting
  let extractedSetting = '';
  
  // Check predefined outdoor/indoor words first
  for (const [category, places] of Object.entries(settingWords)) {
    if (category === 'activity_based') continue;
    for (const place of places) {
      if (text.includes(place)) {
        extractedSetting = place;
        break;
      }
    }
    if (extractedSetting) break;
  }
  
  // If no direct setting, infer from activity
  if (!extractedSetting) {
    for (const [activity, location] of Object.entries(settingWords.activity_based)) {
      if (text.includes(activity)) {
        extractedSetting = location;
        break;
      }
    }
  }
  
  // ============= PHASE 3: TEMPLATE CONSTRUCTION =============
  const settingText = getLocationFromText(text) || extractedSetting;
  
  // Build formulaic template
  let template = extractedAction;
  if (extractedObjects.length > 0) {
    template += ` with ${extractedObjects.join(' and ')}`;
  }
  if (settingText) {
    template += ` in the ${settingText}`;
  }
  
  console.log(`✅ TIER 2.5B Enhanced extraction: "${template}"`);
  return template || 'playing happily';
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
Consistency: {visual_consistency_elements} {setting_context}.
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
    // Parse orchestrator parameters (new structure)
    const body = await req.json();
    const { 
      pageText, 
      userInfo = {}, 
      avatarIdentity, 
      templateComplexity = 'A', 
      sessionId, 
      pageNumber, 
      enhancedStoryData, 
      failedTierData = {},
      // Legacy support for old structure
      bundle, 
      config 
    } = body;
    
    console.log('🎯 Template AB Core Engine:', { 
      templateComplexity, 
      hasPageText: !!pageText, 
      hasUserInfo: !!userInfo,
      legacy: { bundle: !!bundle, config: !!config }
    });

    // Handle legacy structure if present
    if (bundle && config && !pageText) {
      console.warn('⚠️ Using legacy bundle/config structure - consider updating to new parameter format');
      // Legacy processing would go here if needed
      throw new Error('Legacy bundle/config format not supported - use templateComplexity parameter');
    }

    // Validate new structure
    if (!pageText) {
      throw new Error('Missing pageText parameter');
    }

    // Select template configuration based on complexity
    const templateConfig = selectTemplate(templateComplexity);
    const effectiveTierType = templateComplexity === 'A' ? '2.5A' : '2.5B';
    
    console.log(`🔧 Selected template config: ${templateConfig.name} (${effectiveTierType})`);
    console.log(`📝 Processing: ${pageText.substring(0, 100)}...`);

    // Apply complexity-specific processing
    let characterService = null;
    let secondaryCharacters = '';
    let visualConsistencyElements = '';
    
    // Enhanced processing for Template A (premium)
    if (templateComplexity === 'A' && templateConfig.enhancedFeatures) {
      console.log('🎨 Template A: Using enhanced features with character consistency');
      
      try {
        characterService = await getCharacterService();
        if (characterService) {
          secondaryCharacters = await characterService.detectSecondaryCharacters(pageText);
          visualConsistencyElements = await characterService.getCharacterAppearanceFromStory(
            sessionId || 'default', 
            userInfo?.name || userInfo?.childName || 'child'
          );
        }
      } catch (error) {
        console.warn('⚠️ Template A character service failed, continuing with basic processing:', error.message);
      }
    } else if (templateComplexity === 'B') {
      console.log('🎨 Template B: Using basic processing for faster performance');
      // Template B skips enhanced features for speed
    }

    // Load resolver service
    const resolver = await getUnifiedPlaceholderResolver();
    if (!resolver) {
      throw new Error('[Template AB] UnifiedPlaceholderResolver service failed to load');
    }

    // Generate simple template based on complexity
    let templateString;
    if (templateComplexity === 'A') {
      // Premium Template A: More detailed prompt structure
      templateString = `${extractSemanticScene(pageText)}. Character: {character} age {age} with {hair} and {facialFeatures}. Setting: {setting_context}. Additional characters: {secondary_characters}. Visual consistency: {visual_consistency_elements}. Cultural context: {cultural_context}. Style: {frameworkPrompt}`;
    } else {
      // Basic Template B: Simplified prompt structure
      templateString = `${extractSimpleScene(pageText)}. Character: {character} age {age} with {hair}. Setting: basic scene. Style: {frameworkPrompt}`;
    }
    
    console.log(`📄 Generated template (${templateComplexity}): ${templateString.substring(0, 100)}...`);

    // Build context for template resolution
    const skinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || 'medium';
    const fullContext = {
      pageText,
      character: userInfo?.name || userInfo?.childName || 'child',
      age: userInfo?.age || '6',
      hair: getHair(skinTone),
      facialFeatures: getFeatures(skinTone),
      secondary_characters: secondaryCharacters,
      visual_consistency_elements: visualConsistencyElements,
      cultural_context: deriveNonEnglishCulturalContext(userInfo),
      setting_context: templateComplexity === 'A' ? 'detailed setting' : 'simple setting',
      frameworkPrompt: getNuclearStyleFramework(userInfo?.difficulty || 'medium').frameworkPrompt
    };

    // Resolve template placeholders
    let result = await resolver.resolveAllPlaceholders(templateString, fullContext);

    // Fallback handling if template resolution fails
    if (!result.success || result.remainingPlaceholders > 0) {
      console.warn(`⚠️ Template resolution failed for ${templateComplexity}, using fallback`);
      
      // Create fallback prompt
      const fallbackPrompt = `${pageText}. Character: ${fullContext.character} age ${fullContext.age}. Style: ${fullContext.frameworkPrompt}`;
      result = { success: true, resolvedText: fallbackPrompt };
    }

    console.log(`🔧 [Template AB] Resolution completed for ${templateComplexity}`);

    // Generate negative prompt
    const culturalProfileType = inlineDetectCultural(userInfo, avatarIdentity);
    const negativePrompt = generateInlineNuclearNegative(culturalProfileType, userInfo?.avatar?.type || 'child', userInfo?.difficulty || 'medium');
    
    console.log(`🖼️ [Template AB] Generating image with Runware API...`);
    console.log(`📝 [Template AB] Final prompt (${templateComplexity}): ${result.resolvedText}`);
    console.log(`🚫 [Template AB] Negative prompt: ${negativePrompt}`);
    
    try {
      // Call Runware API to generate the actual image
      const imageResult = await callRunwareAPIWithRetry(result.resolvedText, negativePrompt);
      
      if (imageResult && imageResult.imageURL) {
        console.log(`✅ [Template AB] Image generation successful (${templateComplexity}): ${imageResult.imageURL}`);
        
        return createResponse({
          success: true,
          imageURL: imageResult.imageURL,
          positivePrompt: result.resolvedText,
          negativePrompt: negativePrompt,
          templateUsed: `Template ${templateComplexity}: ${templateString.substring(0, 50)}...`,
          templateComplexity: templateComplexity,
          tierType: effectiveTierType,
          provider: imageResult.provider || 'runware',
          tier: effectiveTierType,
          enhancedFeatures: templateConfig.enhancedFeatures,
          processingMode: templateComplexity === 'A' ? 'premium' : 'basic'
        });
      } else {
        console.error(`❌ [Template AB] Image generation failed (${templateComplexity}) - no imageURL returned`);
        throw new Error('Image generation failed - no imageURL returned');
      }
    } catch (imageError) {
      console.error(`❌ [Template AB] Image generation error (${templateComplexity}):`, imageError);
      
      // Return prompt-only response as fallback
      return createResponse({
        success: false,
        imageURL: null,
        positivePrompt: result.resolvedText,
        negativePrompt: negativePrompt,
        templateUsed: `Template ${templateComplexity}: ${templateString.substring(0, 50)}...`,
        templateComplexity: templateComplexity,
        tierType: effectiveTierType,
        provider: 'runware',
        tier: effectiveTierType,
        imageGenerationError: imageError.message || 'Image generation failed',
        fallbackReason: 'Image generation API failure'
      });
    }

  } catch (error) {
    console.error('❌ [Template AB] Error:', error);
    return createErrorResponse(error);
  }
});