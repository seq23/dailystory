// DEPLOY_MARKER: 2025-09-15T00:12:00Z - FORCE REDEPLOY PRIORITY
// ============= TIER 2.5A-B: RUNWARE TEMPLATE AB (A-B COMPLEXITY) =============
// Handles Level A (basic shapes/colors) and Level B (simple scenes)
// Lightweight, fast deployment - optimized for simple template generation with character consistency

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callRunwareAPIWithRetry } from './callRunwareAPIWithRetry.js';
import { 
  getHairBySkintone, 
  getAfricanAmericanHair, 
  getAfricanAmericanFeatures, 
  shouldApplyCulturalEnhancements 
} from '../_shared/StaticDataCache.js';

// ============= NUCLEAR INDEPENDENCE: COMPLETE STYLE FRAMEWORKS =============
const NUCLEAR_HARDCODED_STYLE_FRAMEWORKS = {
  'beginner': {
    name: 'Contemporary Children\'s Book Illustration',
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality'
  },
  'easy': {
    name: 'Contemporary Children\'s Book Illustration', 
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality'
  },
  'medium': {
    name: 'Contemporary Children\'s Book Illustration',
    frameworkPrompt: 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality'
  },
  'hard': {
    name: '2.9D Rendered Illustration',
    frameworkPrompt: '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation'
  },
  'expert': {
    name: '2.9D Rendered Illustration',
    frameworkPrompt: '2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI, beautiful child characters with graceful features, charming expressions, semi-realistic digital art, photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions, child-friendly, diverse representation'
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

// PHASE 4: Session management removed - orchestrator handles all session state
// Session data flows via function parameters only

async function getVisualTracker() {
  try {
    const { VisualDetailTracker } = await import("../_shared/VisualDetailTracker.js");
    return VisualDetailTracker;
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

// Scene extraction - critical for story visualization
function extractSimpleScene(storyText) {
  if (!storyText || typeof storyText !== 'string') return null;
  
  console.log('🔍 Extracting scene from story text');
  
  // Common action patterns for children's stories
  const actionPatterns = [
    /\b(playing?|plays?)\s+(?:with\s+)?([^.,!?]*)/i,
    /\b(running?|runs?)\s+([^.,!?]*)/i,
    /\b(reading?|reads?)\s+([^.,!?]*)/i,
    /\b(eating?|eats?)\s+([^.,!?]*)/i,
    /\b(jumping?|jumps?)\s+([^.,!?]*)/i,
    /\b(dancing?|dances?)\s+([^.,!?]*)/i,
    /\b(singing?|sings?)\s+([^.,!?]*)/i,
    /\b(walking?|walks?)\s+([^.,!?]*)/i,
    /\b(cooking?|cooks?)\s+([^.,!?]*)/i,
    /\b(sleeping?|sleeps?)\s+([^.,!?]*)/i,
    /\b(drawing?|draws?)\s+([^.,!?]*)/i,
    /\b(building?|builds?)\s+([^.,!?]*)/i
  ];
  
  for (const pattern of actionPatterns) {
    const match = storyText.match(pattern);
    if (match) {
      const action = match[1];
      const object = match[2] ? match[2].trim() : '';
      const scene = object ? `${action} with ${object}` : action;
      console.log(`✅ Scene extracted: "${scene}"`);
      return scene;
    }
  }
  
  // Look for simple object mentions that suggest activity
  const objectPatterns = [
    /\b(ball|toy|book|game|puzzle|blocks?)\b/i,
    /\b(swing|slide|seesaw)\b/i,
    /\b(bicycle|bike|scooter)\b/i,
    /\b(doll|teddy|stuffed animal)\b/i
  ];
  
  for (const pattern of objectPatterns) {
    const match = storyText.match(pattern);
    if (match) {
      const object = match[1];
      const scene = `playing with ${object}`;
      console.log(`✅ Scene inferred from object: "${scene}"`);
      return scene;
    }
  }
  
  console.warn('⚠️ No scene could be extracted from story text');
  return null; // Trigger 2.5C failure
}

// Setting extraction with scene-based inference
function extractSimpleSetting(storyText, scene) {
  if (!storyText || typeof storyText !== 'string') {
    return inferSettingFromScene(scene);
  }
  
  console.log('🏠 Extracting setting from story text');
  
  // Explicit setting patterns
  const settingPatterns = [
    /\b(park|playground|garden|yard|outside|outdoor)\b/i,
    /\b(kitchen|bedroom|living room|house|home|inside|indoor)\b/i,
    /\b(school|classroom|library|gym)\b/i,
    /\b(beach|forest|field|mountain|lake)\b/i,
    /\b(store|shop|restaurant|cafe)\b/i
  ];
  
  for (const pattern of settingPatterns) {
    const match = storyText.match(pattern);
    if (match) {
      const setting = match[1];
      console.log(`✅ Setting extracted: "${setting}"`);
      return setting;
    }
  }
  
  // No explicit setting found, infer from scene
  return inferSettingFromScene(scene);
}

// Infer setting from scene context
function inferSettingFromScene(scene) {
  if (!scene) return 'indoors'; // Basic fallback
  
  const sceneText = scene.toLowerCase();
  
  // Outdoor activities
  if (sceneText.includes('ball') || sceneText.includes('running') || 
      sceneText.includes('jumping') || sceneText.includes('bicycle') ||
      sceneText.includes('swing') || sceneText.includes('slide')) {
    console.log('🌳 Setting inferred as "outdoors" from scene');
    return 'outdoors';
  }
  
  // Indoor activities  
  if (sceneText.includes('reading') || sceneText.includes('sleeping') ||
      sceneText.includes('cooking') || sceneText.includes('drawing')) {
    console.log('🏠 Setting inferred as "indoors" from scene');
    return 'indoors';
  }
  
  // Kitchen activities
  if (sceneText.includes('eating') || sceneText.includes('cooking')) {
    console.log('🍳 Setting inferred as "kitchen" from scene');
    return 'kitchen';
  }
  
  // Default to outdoors for children's activities
  console.log('🌳 Setting defaulted to "outdoors"');
  return 'outdoors';
}

// ============= BULLETPROOF BASIC TEMPLATE GENERATION =============

// Error types for tier downgrade
class SceneExtractionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SCENE_EXTRACTION_FAILED';
  }
}

class BasicTemplateError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BASIC_TEMPLATE_FAILED';
  }
}

class Tier25CompleteFailureError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TIER_2_5_COMPLETE_FAILURE';
  }
}

// Summarize page text to 2 sentences max
function summarizePageText(storyText) {
  if (!storyText || typeof storyText !== 'string') {
    return '';
  }
  
  // Split into sentences and take first 2
  const sentences = storyText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const firstTwoSentences = sentences.slice(0, 2);
  
  if (firstTwoSentences.length === 0) {
    return '';
  }
  
  return firstTwoSentences.join('. ').trim() + (firstTwoSentences.length > 0 ? '.' : '');
}

// Bulletproof basic template data preparation
function prepareBasicTemplateData(storyText, userInfo, avatarIdentity, frameworkPrompt, sessionId) {
  console.log('🔧 Preparing bulletproof basic template data');
  
  // Extract scene - critical, no fallback allowed
  const scene = extractSimpleScene(storyText);
  if (!scene) {
    throw new SceneExtractionError('Cannot extract scene from story text - triggering 2.5C');
  }
  
  // Extract/infer setting
  const setting = inferSettingFromScene(scene);
  
  // Summarize story text to 2 sentences max
  const pageText = summarizePageText(storyText);
  
  // Guaranteed non-null character data
  const character = userInfo?.name || userInfo?.childName || 'child';
  const age = userInfo?.age || 6;
  const ethnicity = avatarIdentity?.ethnicity || '';
  
  // Cultural enhancement logic using seeded session ID
  const seedValue = sessionId ? sessionId.split('-')[0] : Date.now().toString();
  const numericSeed = parseInt(seedValue.replace(/[^0-9]/g, ''), 10) || Date.now();
  
  let hairDescription = '';
  let facialFeatures = '';
  let cultural_context = '';
  
  if (shouldApplyCulturalEnhancements(userInfo)) {
    // Apply African American hair and facial features for dark skin tones
    const gender = userInfo?.avatar?.type || (userInfo?.name?.toLowerCase().includes('a') ? 'girl' : 'boy');
    hairDescription = getAfricanAmericanHair(gender, numericSeed);
    facialFeatures = getAfricanAmericanFeatures(numericSeed + 1);
    cultural_context = 'with authentic cultural representation';
    console.log('🌍 Applied African American cultural enhancements');
  } else {
    // Regular hair mapping for non-dark skin users
    const skinTone = userInfo?.skinTone || userInfo?.avatar?.skinTone || 'medium';
    hairDescription = getHairBySkintone(skinTone, numericSeed);
    facialFeatures = 'friendly facial features with warm expressive eyes';
    cultural_context = '';
    console.log('🎨 Applied standard hair mapping for skin tone:', skinTone);
  }
  
  // Construct full framework prompt with hardcoded style
  const hardcodedStyle = 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality';
  const fullFrameworkPrompt = frameworkPrompt ? `${frameworkPrompt}, ${hardcodedStyle}` : hardcodedStyle;
  
  return {
    character,
    age: `age ${age}`,
    ethnicity,
    scene,
    setting,
    pageText,
    hairDescription,
    facialFeatures,
    cultural_context,
    fullFrameworkPrompt
  };
}

// Bulletproof basic template generation with direct string replacement
function generateBasicTemplate(storyText, userInfo, avatarIdentity, frameworkPrompt, difficultyLevel = 'level_0-1', sessionId) {
  console.log('🛡️ Generating bulletproof basic template');
  
  try {
    // Get bulletproof template data
    const templateData = prepareBasicTemplateData(storyText, userInfo, avatarIdentity, frameworkPrompt, sessionId);
    
    // Get basic template
    const template = BASIC_PROMPT_TEMPLATES[difficultyLevel];
    if (!template) {
      throw new BasicTemplateError(`Invalid difficulty level: ${difficultyLevel}`);
    }
    
    // Direct string replacement with all new placeholders
    let result = template
      .replace(/{character}/g, templateData.character || '')
      .replace(/{age}/g, templateData.age || '')
      .replace(/{ethnicity}/g, templateData.ethnicity || '')
      .replace(/{scene}/g, templateData.scene || '')
      .replace(/{setting}/g, templateData.setting || '')
      .replace(/{pageText}/g, templateData.pageText || '')
      .replace(/{hairDescription}/g, templateData.hairDescription || '')
      .replace(/{facialFeatures}/g, templateData.facialFeatures || '')
      .replace(/{cultural_context}/g, templateData.cultural_context || '')
      .replace(/{fullFrameworkPrompt}/g, templateData.fullFrameworkPrompt || '')
      .replace(/{frameworkPrompt}/g, templateData.frameworkPrompt || '') // Fallback
      .replace(/{bundle\.culturalEnhancements}/g, ''); // Remove bundle placeholder
    
    // Clean up result - handle empty values and comma issues
    result = result
      .replace(/,\s*,/g, ',') // Double commas
      .replace(/,\s*\./g, '.') // Comma before period
      .replace(/\.\s*,/g, '.') // Period before comma
      .replace(/,\s*$/g, '') // Trailing comma
      .replace(/\s+/g, ' ') // Multiple spaces
      .replace(/,\s*([A-Z])/g, '. $1') // Fix sentence transitions
      .trim();
    
    if (!result || result.length === 0) {
      throw new BasicTemplateError('Generated template is empty');
    }
    
    console.log('✅ Bulletproof basic template generated successfully');
    return result;
    
  } catch (error) {
    if (error instanceof SceneExtractionError) {
      throw error; // Re-throw to trigger 2.5C
    }
    throw new BasicTemplateError(`Basic template generation failed: ${error.message}`);
  }
}

// ============= PHASE 3: ENHANCED TEMPLATE STRUCTURES WITH ADVANCED PLACEHOLDERS =============

const PREMIUM_PROMPT_TEMPLATES = {
  'level_0-1': `Narrative: {pageText}.
Character Description: {character} {age}, {ethnicity}, {hair}, {features} {bundle.culturalEnhancements}.
Scene: {semantic_scene} {props}, {action_objects}, {activity}, {emotion} {sensory_details}.
Composition: {spatial_composition}.
Secondary elements: {secondary_characters}.
Environment: {setting}, {atmosphere}.
Consistency: {visual_consistency_elements}.
Context: {cultural_context}, {community_context}.
Technical: {frameworkPrompt}, {cameraDirective}.`,
  
  'level_2-4': `Character Description: {character} {age}, {ethnicity}, {hair}, {features} {bundle.culturalEnhancements}.
Scene: {semantic_scene} {props}, {action_objects}, {activity}, {emotion} {sensory_details}.
Composition: {spatial_composition}.
Secondary elements: {secondary_characters}.
Environment: {setting}, {atmosphere}.
Consistency: {visual_consistency_elements}.
Context: {cultural_context}, {community_context}.
Technical: {frameworkPrompt}, {cameraDirective}.
Narrative: {pageText}.`
};

const BASIC_PROMPT_TEMPLATES = {
  'level_0-1': 'Story: {pageText}. Subject: {character}, {age}, {ethnicity}, {hairDescription}, {facialFeatures}. Action: {scene}. Environment: {setting}. Context: {cultural_context}. Technical: {fullFrameworkPrompt}',
  
  'level_2-4': 'Subject: {character}, {age}, {ethnicity}, {hairDescription}, {facialFeatures}. Action: {scene}. Environment: {setting}. Context: {cultural_context}. Technical: {fullFrameworkPrompt}. Story: {pageText}'
};

// ============= PHASE 3: UNIVERSAL PLACEHOLDER RESOLUTION INTEGRATION =============
// Import the comprehensive Universal Placeholder Resolver
async function getUniversalResolver() {
  try {
    const { unifiedPlaceholderResolver } = await import("../_shared/UnifiedPlaceholderResolver.js");
    return unifiedPlaceholderResolver; // Use singleton instance
  } catch (error) {
    console.error('Unified Placeholder Resolver unavailable:', error);
    throw new Error('Critical: Unified Placeholder Resolver failed to load');
  }
}

// ============= ENHANCED PLACEHOLDER RESOLUTION SYSTEM =============
async function resolvePlaceholders(template, data, hasCulturalIntelligence) {
  // Fix TDZ issue - normalize input data first
  const body = data || {};
  const storyText = body.storyText || body.pageText || '';
  const pageText = body.pageText || null;
  const userInfo = body.userInfo || {};
  const avatarIdentity = body.avatarIdentity || null;
  const characterData = body.characterData || null;
  const visualDetails = body.visualDetails || null;
  const secondaryCharacters = body.secondaryCharacters || '';
  const frameworkPrompt = body.frameworkPrompt || 'children\'s book illustration style';

  // Safety: Clamp storyText length to prevent oversized inputs
  let normalizedStoryText = storyText;
  if (normalizedStoryText && normalizedStoryText.length > 2000) {
    console.log(`📏 Clamping storyText from ${normalizedStoryText.length} to 2000 characters for safety`);
    normalizedStoryText = normalizedStoryText.substring(0, 2000);
  }

  console.log('🎯 Phase 3: Using Universal Placeholder Resolver with cultural intelligence');
  
  try {
    // Use the Unified Placeholder Resolver singleton (Phase 3.2)
    const resolver = await getUniversalResolver();
    
    // Prepare additional data for advanced placeholders
    const additionalData = {
      frameworkPrompt,
      secondaryCharacters,
      visualDetails,
      characterData,
      characterSeed: characterData?.seed // Include character seed for consistency
    };
    
    const resolution = await resolver.resolveAllPlaceholders(template, {
      userInfo,
      seed: additionalData,
      sessionId: body.sessionId,
      pageNumber: userInfo?.pageNumber
    });
    
    // Fix data type mismatch - check resolution success
    if (!resolution.success) {
      console.warn('⚠️ Universal Resolver resolution failed, using fallback');
      throw new Error('Universal resolver returned failure status');
    }
    
    const resolvedTemplate = resolution.resolvedText;
    
    console.log('✅ Phase 3: Template resolved with Universal Placeholder Resolver');
    console.log('🌍 Cultural Enhancement Level:', resolver.getCulturalEnhancementLevel());
    console.log('🎨 Cultural Features Applied:', resolver.shouldApplyCulturalFeatures());
    
    // Validate resolved template - no generic fallbacks
    if (!resolvedTemplate || typeof resolvedTemplate !== 'string' || resolvedTemplate.trim().length === 0) {
      console.warn('⚠️ Universal Resolver returned empty/invalid result, triggering tier downgrade');
      throw new Error('Universal resolver returned empty result');
    }
    
    return resolvedTemplate;
    
  } catch (error) {
    console.warn('❌ Universal Placeholder Resolver failed, using fallback:', error);
    
    // Fallback to basic resolution if Universal Resolver fails
    return await resolvePlaceholdersFallback(template, data);
  }
}

// ============= FALLBACK RESOLUTION SYSTEM =============
async function resolvePlaceholdersFallback(template, data) {
  console.log('⚠️ Using fallback placeholder resolution');
  
  // Fix TDZ issue - normalize input data first
  const body = data || {};
  const storyText = body.storyText || body.pageText || '';
  const pageText = body.pageText || null;
  const userInfo = body.userInfo || {};
  const avatarIdentity = body.avatarIdentity || null;
  const frameworkPrompt = body.frameworkPrompt || 'children\'s book illustration style';
  const secondaryCharacters = body.secondaryCharacters || '';

  const childName = userInfo?.name || userInfo?.childName || 'child';
  const framework = frameworkPrompt;
  
  // Enhanced data processing using StaticDataCache for fallbacks
  const { getCulturalBundle, shouldApplyCulturalEnhancements, getHairBySkintone, getSkinBySkintone } = await import('../_shared/StaticDataCache.js');
  
  // Get cultural enhancements if applicable
  let hairFallback, featuresFallback, ethnicityFallback;
  
  if (shouldApplyCulturalEnhancements(userInfo)) {
    console.log('🎨 Template AB: Applying cultural enhancements via StaticDataCache');
    const culturalBundle = getCulturalBundle(userInfo, body.sessionId);
    hairFallback = culturalBundle.hair;
    featuresFallback = culturalBundle.features;
    ethnicityFallback = 'diverse cultural background';
  } else {
    console.log('🎨 Template AB: Using StaticDataCache generic fallbacks');
    hairFallback = getHairBySkintone(userInfo?.skinTone || 'medium', body.sessionId);
    featuresFallback = getSkinBySkintone(userInfo?.skinTone || 'medium', body.sessionId);
    ethnicityFallback = 'diverse background';
  }
  
  // Enhanced placeholder mapping using StaticDataCache fallbacks
  const placeholders = {
    pageText: storyText || '',
    character: childName,
    age: userInfo?.age ? `age ${userInfo.age}` : '',
    ethnicity: ethnicityFallback,
    hair: hairFallback,
    features: featuresFallback,
    emotion: 'happy and engaged',
    scene: storyText?.substring(0, 50) || 'playing',
    spatial_composition: 'centered composition',
    setting: 'bright, colorful environment',
    atmosphere: 'cheerful and warm',
    props: 'colorful props',
    action_objects: 'engaging objects',
    sensory_details: 'vibrant details',
    cultural_context: 'inclusive community',
    community_context: 'welcoming environment',
    secondary_characters: secondaryCharacters || 'friendly companions',
    frameworkPrompt: framework,
    cameraDirective: 'medium shot, eye level'
  };

  // Replace placeholders in template
  let resolvedTemplate = template;
  Object.entries(placeholders).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    resolvedTemplate = resolvedTemplate.replace(new RegExp(placeholder, 'g'), value || '');
  });
  
  // Explicitly handle bundle.culturalEnhancements placeholder
  resolvedTemplate = resolvedTemplate.replace(/\{bundle\.culturalEnhancements\}/g, '');

  // Clean up template
  resolvedTemplate = resolvedTemplate
    .replace(/,\s*,/g, ',')
    .replace(/,\s*\./g, '.')
    .replace(/\s+/g, ' ')
    .replace(/,\s*$/g, '')
    .trim();

  // Remove generic fallback - if fallback fails, use bulletproof basic template or trigger tier downgrade
  if (!resolvedTemplate || resolvedTemplate.length === 0) {
    console.warn('⚠️ Fallback resolver failed, attempting bulletproof basic template');
    try {
      return generateBasicTemplate(storyText, userInfo, avatarIdentity, framework, difficultyLevel, sessionId);
    } catch (error) {
      console.error('❌ Bulletproof basic template also failed, triggering tier downgrade');
      throw new Tier25CompleteFailureError('Both fallback and basic template generation failed');
    }
  }

  return resolvedTemplate;
}

// ============= PHASE 2: SECONDARY CHARACTER ENHANCEMENT =============

// Enhanced secondary character processing for tier-specific support
async function processSecondaryCharacters(complexity, storyText, sessionId, pageNumber, serviceHealth) {
  console.log(`🎭 Processing secondary characters for complexity ${complexity}`);
  
  // Tier-specific secondary character support
  if (complexity === 'A') {
    console.log('🎭 Tier 2.5A: Full secondary character support with individual descriptions');
    
    if (serviceHealth.characterService) {
      try {
        // Use CharacterConsistencyService for secondary character detection and processing
        const CharacterService = await getCharacterService();
        const characterService = CharacterService.getInstance();
        
        // Detect secondary characters from story text
        const detectedCharacters = await characterService.detectSecondaryCharacters(sessionId, storyText, pageNumber);
        
        if (detectedCharacters.length > 0) {
          console.log(`🎭 Detected ${detectedCharacters.length} secondary characters:`, detectedCharacters);
          
          // Generate consistent descriptions for each secondary character
          const secondaryDescriptions = [];
          for (const characterName of detectedCharacters.slice(0, 3)) { // Limit to 3 for performance
            try {
              const secondaryData = await characterService.getSecondaryCharacterSeed(
                sessionId, 
                characterName, 
                'secondary_character'
              );
              if (secondaryData && secondaryData.characterDescription) {
                secondaryDescriptions.push(secondaryData.characterDescription);
              }
            } catch (error) {
              console.warn(`Failed to get secondary character data for ${characterName}:`, error);
            }
          }
          
          return secondaryDescriptions.join(', ');
        }
      } catch (error) {
        console.warn('Secondary character processing failed in Tier 2.5A:', error);
      }
    }
    
    return ''; // No secondary characters or service unavailable
  }
  
  if (complexity === 'B') {
    console.log('🎭 Tier 2.5B: Limited secondary character support (names only)');
    
    // Simple name-only detection without service dependencies (nuclear independence)
    const nameMatches = (storyText || '').match(/\b[A-Z][a-z]{2,12}\b/g) || [];
    const uniqueNames = [...new Set(nameMatches)]
      .filter(name => name.length > 2 && name !== 'The' && name !== 'And')
      .slice(0, 2); // Limit to 2 for simplicity
    
    if (uniqueNames.length > 0) {
      return uniqueNames.map(name => `${name} (friend)`).join(', ');
    }
    
    return '';
  }
  
  // Tier 2.5C and 2.5D: No secondary characters (nuclear independence)
  console.log(`🎭 Tier ${complexity}: No secondary character support (nuclear independence)`);
  return '';
}

// Enhanced template data preparation with secondary characters
async function prepareTemplateData(storyText, userInfo, avatarIdentity, characterData, visualDetails, frameworkPrompt, secondaryCharacters, sessionId) {
  // Resolve cultural enhancements using UniversalPlaceholderResolver
  let culturalEnhancements = '';
  try {
    const resolver = await getUniversalResolver();
    culturalEnhancements = resolver.resolveCulturalEnhancements(userInfo, sessionId);
  } catch (error) {
    console.warn('Cultural enhancements resolution failed:', error);
    culturalEnhancements = '';
  }

  return {
    storyText,
    userInfo,
    avatarIdentity,
    characterData,
    visualDetails,
    secondaryCharacters: secondaryCharacters || '',
    frameworkPrompt: frameworkPrompt || 'children\'s book illustration style',
    culturalEnhancements,
    characterSeed: characterData?.seed, // Include character seed for consistency
    sessionId
  };
}
// ============= PHASE 4: ENHANCED SERVICE HEALTH CHECK WITH MONITORING =============
async function checkServiceHealth() {
  console.log('🏥 Phase 4: Checking service health with ServiceHealthMonitor');
  
  // Try to use ServiceHealthMonitor for comprehensive health checking
  try {
    const healthMonitor = await getServiceHealthMonitor();
    if (healthMonitor) {
      console.log('🏥 Using ServiceHealthMonitor for comprehensive health check');
      const healthResults = await healthMonitor.checkAllServicesHealth();
      
      return {
        characterService: healthResults.services.CharacterConsistencyService?.status === 'HEALTHY',
        visualTracker: healthResults.services.VisualDetailTracker?.status === 'HEALTHY',
        sessionManager: healthResults.services.SessionStateManager?.status === 'HEALTHY',
        universalResolver: healthResults.services.UniversalPlaceholderResolver?.status === 'HEALTHY',
        overallHealth: healthResults.overall,
        availableTiers: healthResults.availableTiers,
        healthResults: healthResults
      };
    }
  } catch (error) {
    console.warn('ServiceHealthMonitor unavailable, using fallback health check:', error);
  }
  
  // Fallback to basic health check if ServiceHealthMonitor is unavailable
  console.log('🏥 Using fallback health check method');
  const services = {
    characterService: false,
    visualTracker: false,
    sessionManager: false,
    universalResolver: false,
    overallHealth: 'UNKNOWN',
    availableTiers: ['2.5B', '2.5D'] // Nuclear independence tiers always available
  };

  try {
    const CharacterService = await getCharacterService();
    services.characterService = !!CharacterService;
  } catch (error) {
    console.warn('CharacterService health check failed:', error.message);
  }

  try {
    const VisualTracker = await getVisualTracker();
    services.visualTracker = !!VisualTracker;
  } catch (error) {
    console.warn('VisualTracker health check failed:', error.message);
  }

  // SessionManager removed - orchestrator handles all session state
  services.sessionManager = false;

  try {
    const UniversalResolver = await getUniversalResolver();
    services.universalResolver = !!UniversalResolver;
  } catch (error) {
    console.warn('UniversalResolver health check failed:', error.message);
  }

  // Determine available tiers based on service health
  const availableTiers = ['2.5B', '2.5D']; // Nuclear independence always available
  
  if (services.characterService && services.universalResolver) {
    availableTiers.unshift('2.5A');
  }
  
  services.availableTiers = availableTiers;
  services.overallHealth = services.characterService && services.universalResolver ? 'HEALTHY' : 'DEGRADED';

  return services;
}

// ============= ENHANCED TEMPLATE GENERATION WITH EXACT STRUCTURES =============
async function generateSimpleTemplate(complexity, storyText, userInfo, avatarIdentity, sessionId, pageNumber, enhancedStoryData) {
  console.log(`🎯 Template AB: Processing complexity ${complexity} with enhanced story data`);
  console.log(`🎨 Enhanced data available:`, {
    hasEnhancedPrompt: !!enhancedStoryData?.enhancedPrompt,
    hasCharacterConsistency: !!enhancedStoryData?.characterConsistency,
    hasVisualConsistency: !!enhancedStoryData?.visualConsistency,
    hasPreviousScene: !!enhancedStoryData?.previousScene
  });
  
  // Determine difficulty level for template selection
  const age = userInfo?.age || 5;
  const gradeLevel = userInfo?.gradeLevel || 'K';
  const difficultyLevel = (gradeLevel === 'K' || gradeLevel === '1' || age <= 6) ? 'level_0-1' : 'level_2-4';
  
  // Check service health for tier routing
  const serviceHealth = await checkServiceHealth();
  
  if (complexity === 'A') {
    console.log('🎯 Template AB: Processing Tier 2.5A - AI Failure Fallback with shared services');
    
    // Tier 2.5A: PREMIUM templates + Full cultural intelligence + Shared services
    let characterData = null;
    let visualDetails = null;
    let secondaryCharactersA = '';
    
    if (serviceHealth.characterService && avatarIdentity) {
      try {
        console.log('🎭 Template AB Tier 2.5A: Attempting CharacterConsistencyService integration');
        const CharacterService = await getCharacterService();
        const characterConsistencyService = CharacterService.getInstance();
        
        // Integrate with cultural logic - analyze visual details with cultural context
        await characterConsistencyService.analyzeVisualDetails(sessionId, storyText, pageNumber, userInfo?.name);
        
        // Get character appearance from story (includes cultural features if applicable)
        const characterAppearance = await characterConsistencyService.getCharacterAppearanceFromStory(sessionId, userInfo?.name);
        
        characterData = {
          appearance: characterAppearance || '',
          culturalIntegration: true,
          source: 'CharacterConsistencyService'
        };
        
        console.log('✅ Template AB Tier 2.5A: CharacterConsistencyService integration successful');
      } catch (error) {
        console.warn('⚠️ Template AB Tier 2.5A: CharacterConsistencyService failed, will fallback to 2.5B:', error);
        characterData = null; // This will trigger fallback to 2.5B
      }
    }
    
    if (serviceHealth.visualTracker && sessionId) {
      try {
        console.log('👁️ Template AB: Tracking visual details');
        const visualTracker = await getVisualTracker();
        await visualTracker.analyzeVisualDetails(sessionId, storyText, pageNumber, userInfo?.name);
        const objDescription = await visualTracker.getVisualDetailsForPrompt(sessionId);
        const coloredObjects = await visualTracker.getColoredObjects(sessionId);
        
        visualDetails = {
          objects: objDescription?.substring(0, 100) || '',
          actionObjects: coloredObjects?.slice(0, 2).join(', ') || '',
          sensoryDetails: 'bright, vivid colors'
        };
      } catch (error) {
        console.warn('Visual tracker failed:', error);
      }
    }

    // Get framework prompt using unified style framework system
    const difficulty = userInfo?.difficulty || 'medium';
    const styleFramework = getNuclearStyleFramework(difficulty);
    const frameworkPrompt = styleFramework.frameworkPrompt;
    
    console.log('🎨 Tier 2.5A: Using unified style framework:', styleFramework.name, 'for difficulty:', difficulty);
    
    // Get secondary characters with tier-specific processing
    const secondaryCharacters = await processSecondaryCharacters('A', storyText, sessionId, pageNumber, serviceHealth);
    
    // Use PREMIUM template with full cultural intelligence
    const template = PREMIUM_PROMPT_TEMPLATES[difficultyLevel];
    const templateData = await prepareTemplateData(
      storyText, 
      userInfo, 
      avatarIdentity, 
      characterData, 
      visualDetails, 
      frameworkPrompt,
      secondaryCharacters,
      sessionId
    );
    
    const positivePrompt = await resolvePlaceholders(template, templateData, true);
    
    console.log('✅ Template AB Tier 2.5A: PREMIUM template with cultural intelligence applied');
    console.log('🔍 Cultural elements detected:', {
      hasAvatarIdentity: !!avatarIdentity,
      nativeLanguage: avatarIdentity?.nativeLanguage || userInfo?.nativeLanguage,
      skinTone: avatarIdentity?.skinTone || userInfo?.avatar?.skinTone,
      usingChildsRealName: userInfo?.name || userInfo?.childName,
      secondaryCharacterCount: secondaryCharacters.split(',').filter(c => c.trim()).length
    });
    
    console.log('✅ Template AB Tier 2.5A: Successfully using PREMIUM templates with cultural intelligence');
    
    // Add missing calls that Template AB expects
    const styleFrameworkUsed = styleFramework.name;
    const shouldApplyCulturalFeatures = await (async () => {
      try {
        const placeholderResolver = await getUnifiedPlaceholderResolver();
        return placeholderResolver ? placeholderResolver.shouldApplyCulturalFeatures(userInfo) : false;
      } catch (error) {
        console.warn('shouldApplyCulturalFeatures check failed:', error);
        return false;
      }
    })();
    
    // Generate nuclear negative prompt with mixed-gender consistency filters
    const culturalProfile = avatarIdentity?.nativeLanguage || avatarIdentity?.skinTone || userInfo?.nativeLanguage || 'general';
    const avatarType = userInfo?.avatar?.type || userInfo?.avatarType || 'child';
    const secondaryCharactersArray = secondaryCharacters ? secondaryCharacters.split(',').map(c => c.trim()).filter(c => c) : [];
    const negativePrompt = generateInlineNuclearNegative(culturalProfile, avatarType, 'A');
    
    return {
      positivePrompt,
      negativePrompt,
      templateType: 'premium-with-cultural-intelligence',
      difficulty: 'A',
      enhancementLevel: 'premium',
      difficultyLevel,
      secondaryCharacters: secondaryCharactersA || 'none',
      styleFrameworkUsed,
      shouldApplyCulturalFeatures
    };
  }
  
  // Check if 2.5A failed (no character data despite service being available)
  if (complexity === 'A' && serviceHealth.characterService && !characterData) {
    console.log('⚠️ Template AB: 2.5A CharacterConsistencyService failed, falling back to 2.5B nuclear independence');
    complexity = 'B'; // Fall back to nuclear independence
  }
  
  if (complexity === 'B') {
    console.log('🎯 Template AB: Processing Tier 2.5B - Nuclear Independence with Cultural Logic (fallback or primary)');
    
    // PHASE 4: Nuclear Independence - NO external service dependencies
    console.log('☢️ PHASE 4: Nuclear Independence Mode - Zero external dependencies');
    
    // Get secondary characters with limited processing for nuclear independence
    const secondaryCharactersB = await processSecondaryCharacters('B', storyText, sessionId, pageNumber, serviceHealth);
    
    // Get framework prompt using unified style framework system
    const difficulty = userInfo?.difficulty || 'medium';
    const styleFramework = getNuclearStyleFramework(difficulty);
    const frameworkPrompt = styleFramework.frameworkPrompt;
    
    console.log('🎨 Tier 2.5B: Using unified style framework:', styleFramework.name, 'for difficulty:', difficulty);
    
    // Use BASIC template with GUARANTEED nuclear independence
    const template = BASIC_PROMPT_TEMPLATES[difficultyLevel];
    
    try {
      // Use UnifiedPlaceholderResolver for cultural logic (includes {hair} and {features} mapping)
      console.log('☢️ Nuclear Independence: Using cultural logic via UnifiedPlaceholderResolver');
      
      const templateData = await prepareTemplateData(
        storyText, 
        userInfo, 
        avatarIdentity, 
        null, // No characterData for nuclear independence
        null, // No visualDetails for nuclear independence  
        frameworkPrompt,
        secondaryCharactersB,
        sessionId
      );
      
      const positivePrompt = await resolvePlaceholders(template, templateData, true);
      
      // Validate result
      if (!positivePrompt || typeof positivePrompt !== 'string' || positivePrompt.trim().length === 0) {
        throw new Error('UnifiedPlaceholderResolver returned empty result');
      }
      
      var resolvedPositivePrompt = positivePrompt;
      
    } catch (error) {
      console.warn('⚠️ Nuclear Independence: UnifiedPlaceholderResolver failed, using bulletproof basic template:', error);
      
      // Fallback to bulletproof basic template generation
      try {
        var resolvedPositivePrompt = generateBasicTemplate(storyText, userInfo, avatarIdentity, frameworkPrompt, difficultyLevel, sessionId);
      } catch (basicError) {
        console.error('❌ Bulletproof basic template also failed:', basicError);
        
        if (basicError instanceof SceneExtractionError) {
          throw new Tier25CompleteFailureError('Scene extraction failed - triggering 2.5C');
        }
        
        throw new Tier25CompleteFailureError('All Tier 2.5B template generation methods failed - triggering 2.5C');
      }
    }
    
    console.log('✅ Template AB Tier 2.5B: Nuclear Independence with Cultural Logic template generated');
    console.log('🔍 Nuclear independence elements:', {
      hasAvatarIdentity: !!avatarIdentity,
      secondaryCharacterCount: secondaryCharactersB.split(',').filter(c => c.trim()).length,
      nuclearIndependence: true,
      zeroExternalDependencies: true,
      guaranteedOperation: true
    });
    
    // Add missing calls that Template AB expects
    const styleFrameworkUsed = styleFramework.name;
    const shouldApplyCulturalFeatures = await (async () => {
      try {
        const placeholderResolver = await getUnifiedPlaceholderResolver();
        return placeholderResolver ? placeholderResolver.shouldApplyCulturalFeatures(userInfo) : false;
      } catch (error) {
        console.warn('shouldApplyCulturalFeatures check failed:', error);
        return false;
      }
    })();
    
    // Generate nuclear negative prompt with mixed-gender consistency filters
    const culturalProfile = avatarIdentity?.nativeLanguage || avatarIdentity?.skinTone || userInfo?.nativeLanguage || 'general';
    const avatarType = userInfo?.avatar?.type || userInfo?.avatarType || 'child';
    const secondaryCharactersArray = secondaryCharactersB ? secondaryCharactersB.split(',').map(c => c.trim()).filter(c => c) : [];
    const negativePrompt = generateInlineNuclearNegative(culturalProfile, avatarType, 'B');
    
    return {
      positivePrompt: resolvedPositivePrompt,
      negativePrompt,
      templateType: 'nuclear-independence-basic',
      difficulty: 'B', 
      enhancementLevel: 'nuclear-independent',
      difficultyLevel,
      secondaryCharacters: secondaryCharactersB || 'none',
      nuclearIndependent: true,
      serviceHealthRequired: false,
      styleFrameworkUsed,
      shouldApplyCulturalFeatures
    };
  }
  
  // Should never reach here - escalate to next tier
  throw new Error(`Unsupported complexity level: ${complexity}. Template AB only handles A and B.`);
}

// ============= RUNWARE API CALL WITH ENHANCED ERROR HANDLING =============
async function callRunwareAPI(prompt, negativePrompt) {
  const RUNWARE_API_KEY = Deno.env.get('RUNWARE_API_KEY');
  if (!RUNWARE_API_KEY) {
    throw new Error('RUNWARE_API_KEY not configured');
  }
  
  try {
    console.log('🎨 Template AB: Calling Runware API');
    
    const payload = [
      {
        taskType: "authentication",
        apiKey: RUNWARE_API_KEY
      },
      {
        taskType: "imageInference",
        taskUUID: crypto.randomUUID(),
        positivePrompt: prompt,
        negativePrompt: negativePrompt,
        width: 1024,
        height: 1024,
        model: "runware:100@1",
        numberResults: 1,
        outputFormat: "WEBP",
        CFGScale: 1,
        scheduler: "FlowMatchEulerDiscreteScheduler"
      }
    ];
    
    const response = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Runware API error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    const imageData = result.data?.find(item => item.taskType === 'imageInference');
    
    if (!imageData?.imageURL) {
      throw new Error('No image URL in Runware response');
    }
    
    return imageData;
  } catch (error) {
    console.error('❌ Template AB: Runware API call failed:', error);
    throw error;
  }
}

// ============= MAIN HANDLER =============
serve(async (req) => {
  console.log(`🎯 Template AB: ${req.method} ${req.url}`);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
    // Handle health checks (GET/HEAD requests)
  if (req.method === 'GET' || req.method === 'HEAD') {
    console.log('🏥 Template AB: Health check request (Phase 4)');
    
    // PHASE 4: Enhanced health check with service monitoring
    const serviceHealth = await checkServiceHealth();
    
    return createResponse({
      healthy: true,
      status: 'healthy',
      functionName: 'runware-template-ab',
      service: 'runware-template-ab',
      projectId: 'cpzeuogomaixamrtnnmj',
      tier: '2.5A-B',
      complexity: 'A-B',
      timestamp: new Date().toISOString(),
      runwareApiKeyPresent: !!Deno.env.get('RUNWARE_API_KEY'),
      // PHASE 4: Service health monitoring data
      serviceHealth: {
        characterService: serviceHealth.characterService,
        visualTracker: serviceHealth.visualTracker,
        sessionManager: serviceHealth.sessionManager,
        universalResolver: serviceHealth.universalResolver,
        overallHealth: serviceHealth.overallHealth,
        availableTiers: serviceHealth.availableTiers
      },
      capabilities: {
        nuclearIndependence: true,
        tierASupport: serviceHealth.characterService && serviceHealth.universalResolver,
        tierBSupport: true, // Always available due to nuclear independence
        smartRouting: !!serviceHealth.healthResults
      }
    });
  }
  
  try {
    // Fix TDZ issue - parse body first, then destructure
    const body = await req.json();
    const storyText = body.storyText || body.pageText || '';
    const pageText = body.pageText || null;
    const userInfo = body.userInfo || {};
    const avatarIdentity = body.avatarIdentity || null;
    const templateComplexity = body.templateComplexity || null;
    const sessionId = body.sessionId || null;
    const pageNumber = body.pageNumber || 1;
    const enhancedStoryData = body.enhancedStoryData || null; // PHASE 4: Enhanced story data from orchestrator
    const failedTierData = body.failedTierData || {};
    
    console.log('📝 Template AB: Processing request', {
      templateComplexity,
      sessionId,
      pageNumber,
      hasStoryText: !!storyText,
      hasUserInfo: !!userInfo,
      hasEnhancedStoryData: !!enhancedStoryData
    });
    
    console.log('📊 Template AB: Received failed tier data', {
      hasCharacterConsistency: !!failedTierData.characterConsistency,
      hasVisualConsistency: !!failedTierData.visualConsistency,
      hasCulturalEnhancements: !!failedTierData.culturalEnhancements
    });
    
    // PHASE 4: Session management centralized in orchestrator
    // All session data received via parameters, no direct session imports
    console.log('📋 Template AB: Session data received via parameters', {
      sessionId,
      pageNumber,
      sessionDataReceived: !!(sessionId && pageNumber)
    });
    
    // Determine complexity level
    const complexity = getComplexityLevel(userInfo, templateComplexity);
    
    if (!['A', 'B'].includes(complexity)) {
      console.log(`⚠️ Template AB: Complexity ${complexity} not handled by this function - use CD template`);
      return createErrorResponse(`Complexity ${complexity} not supported by AB template. Use CD template.`, 400);
    }
    
    // Generate template with character consistency and enhanced data
    let template;
    try {
      template = await generateSimpleTemplate(complexity, storyText, userInfo, avatarIdentity, sessionId, pageNumber, enhancedStoryData);
    } catch (error) {
      // Handle tier downgrade errors
      if (error instanceof SceneExtractionError || error instanceof BasicTemplateError || error instanceof Tier25CompleteFailureError) {
        console.error(`❌ Template AB: ${error.name} - ${error.message}`);
        return createErrorResponse(`Tier 2.5A/B failed: ${error.message}. Please try 2.5C template.`, 400);
      }
      throw error; // Re-throw other errors
    }
    
    // Final validation - should not happen with bulletproof generation
    if (!template.positivePrompt || typeof template.positivePrompt !== 'string' || template.positivePrompt.trim().length === 0) {
      console.error('❌ Template AB: Generated template has invalid positivePrompt - this should not happen with bulletproof generation');
      return createErrorResponse('Template generation produced invalid result. Please try 2.5C template.', 500);
    }
    
    console.log('🎨 Template AB: Generated template', {
      complexity,
      templateType: template.templateType,
      promptLength: template.positivePrompt?.length || 0,
      hasPrompt: !!template.positivePrompt
    });
    
    // Call Runware API with retry logic
    const imageData = await callRunwareAPIWithRetry(template.positivePrompt, template.negativePrompt);
    
    console.log('✅ Template AB: Image generated successfully');
    
    return createResponse({
      success: true,
      imageURL: imageData.imageURL,
      positivePrompt: template.positivePrompt,
      negativePrompt: template.negativePrompt, // PHASE 4: Add negative prompt to response
      styleFramework: template.styleFrameworkUsed, // PHASE 4: Add style framework info
      templateType: template.templateType,
      tier: '2.5A-B - Template AB',
      complexity: complexity,
      enhancementLevel: template.enhancementLevel,
      promptLengths: { // PHASE 4: Add prompt length statistics
        positive: template.positivePrompt.length,
        negative: template.negativePrompt?.length || 0
      },
      difficultyLevel: userInfo?.difficulty || 'medium',
      sessionId: sessionId,
      pageNumber: pageNumber,
      secondaryCharacters: template.secondaryCharacters || 'none',
    });
    
  } catch (error) {
    console.error('❌ Template AB: Error', error);
    return createErrorResponse(error.message, 500);
  }
});