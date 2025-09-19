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

async function handleRequest(req) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle health check requests (GET/HEAD)
  if (req.method === 'GET' || req.method === 'HEAD') {
    return createResponse({
      status: 'healthy',
      functionName: 'runware-template-ab',
      timestamp: new Date().toISOString(),
      version: '2.1'
    });
  }

  try {
    // FLEXIBLE PAYLOAD HANDLING: Handle nested {bundle: {...}, config: {...}} OR flat payloads
    const rawPayload = await req.json();
    console.log('🔍 Template AB: Request payload keys:', Object.keys(rawPayload));
    
    // Detect nested payload structure from ImageTierTester
    let payload;
    if (rawPayload.bundle && rawPayload.config) {
      console.log('📦 Template AB: Detected nested payload structure');
      payload = {
        ...rawPayload.bundle,
        templateComplexity: rawPayload.config.templateComplexity
      };
    } else {
      console.log('📄 Template AB: Using flat payload structure');
      payload = rawPayload;
    }
    
    let enhancedStoryData, storyText, pageNumber, avatarIdentity, templateComplexity, sessionId;
    
    if (payload.pageText) {
      // Current format: {pageText, userInfo, sessionId, pageNumber}
      console.log('📄 Template AB: Using pageText format');
      storyText = payload.pageText;
      enhancedStoryData = payload.enhancedStoryData || { userInfo: payload.userInfo };
      pageNumber = payload.pageNumber;
      avatarIdentity = payload.userInfo?.avatar;
      templateComplexity = payload.templateComplexity;
      sessionId = payload.sessionId;
    } else {
      // Legacy format: {enhancedStoryData, storyText, pageNumber, avatarIdentity, templateComplexity, sessionId}
      console.log('📖 Template AB: Using legacy format');
      enhancedStoryData = payload.enhancedStoryData;
      storyText = payload.storyText;
      pageNumber = payload.pageNumber;
      avatarIdentity = payload.avatarIdentity;
      templateComplexity = payload.templateComplexity;
      sessionId = payload.sessionId;
    }
    
    if (!storyText) {
      return createErrorResponse(new Error('Missing required field: pageText OR storyText'));
    }

    console.log(`🎯 Template AB processing complexity: ${templateComplexity || 'A'}`);

    // Extract user info from enhancedStoryData
    const userInfo = enhancedStoryData.userInfo || {};
    
    // Select template based on complexity (A or B)
    const selectedTemplate = selectTemplate(templateComplexity || 'A');
    console.log(`✅ Selected template: ${selectedTemplate.name}`);

    let templateResult;
    
    if (selectedTemplate.name === 'Premium Template A') {
      // Tier 2.5A: Full feature processing with character consistency
      console.log('🚀 Processing Tier 2.5A: Premium Template with full features');
      
      // Use semantic scene extraction for Tier A
      const extractedScene = extractSemanticScene(storyText);
      
      // Get character service for consistency
      const characterService = await getCharacterService();
      let characterConsistency = '';
      
      if (characterService && selectedTemplate.avatarConsistency) {
        try {
          characterConsistency = await characterService.generateConsistentDescription(
            userInfo, avatarIdentity, sessionId, pageNumber
          );
        } catch (error) {
          console.warn('Character consistency failed:', error);
        }
      }
      
      // Build comprehensive template
      const styleFramework = getNuclearStyleFramework(userInfo?.difficulty || 'medium');
      const culturalProfile = inlineDetectCultural(userInfo, avatarIdentity);
      
      templateResult = {
        positivePrompt: `${extractedScene}. ${characterConsistency}. ${styleFramework.frameworkPrompt}`,
        negativePrompt: generateInlineNuclearNegative(culturalProfile, userInfo?.avatar?.type, userInfo?.difficulty),
        templateType: 'Premium Template A - Full Features',
        tier: '2.5A',
        styleFrameworkUsed: styleFramework.name
      };
      
    } else if (selectedTemplate.name === 'Basic Template B') {
      // Tier 2.5B: Basic processing with reduced features
      console.log('🚀 Processing Tier 2.5B: Basic Template with reduced features');
      
      // Use simple scene extraction for Tier B
      const extractedScene = extractSimpleScene(storyText);
      
      // Build basic template
      const styleFramework = getNuclearStyleFramework(userInfo?.difficulty || 'medium');
      const culturalProfile = inlineDetectCultural(userInfo, avatarIdentity);
      
      const characterName = userInfo?.name || userInfo?.childName || 'child';
      const skinTone = userInfo?.avatar?.skinTone || 'medium';
      const hairColor = getHair(skinTone);
      const basicCharacter = `A young child named ${characterName} with ${skinTone} skin and ${hairColor}`;
      
      templateResult = {
        positivePrompt: `${extractedScene}. ${basicCharacter}. ${styleFramework.frameworkPrompt}`,
        negativePrompt: generateInlineNuclearNegative(culturalProfile, userInfo?.avatar?.type, userInfo?.difficulty),
        templateType: 'Basic Template B - Reduced Features',
        tier: '2.5B',
        styleFrameworkUsed: styleFramework.name
      };
    }

    // Call Runware API
    const apiResponse = await callRunwareAPIWithRetry(templateResult.positivePrompt, templateResult.negativePrompt);
    const imageURL = apiResponse.imageURL || apiResponse;

    const result = {
      success: true,
      imageURL,
      templateData: templateResult,
      complexity: templateComplexity || 'A',
      sessionArchitecture: 'parameter-based',
      processedAt: new Date().toISOString(),
      positivePrompt: templateResult.positivePrompt,
      negativePrompt: templateResult.negativePrompt
    };

    return createResponse(result);
    
  } catch (error) {
    console.error('❌ [Template AB] Error:', error);
    return createErrorResponse(error);
  }
}

// Export for TypeScript receptionist
export default handleRequest;

// Maintain backward compatibility
serve(handleRequest);