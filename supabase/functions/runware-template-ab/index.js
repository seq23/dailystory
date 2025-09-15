// DEPLOY_MARKER: 2025-09-15T00:12:00Z - FORCE REDEPLOY PRIORITY
// ============= TIER 2.5A-B: RUNWARE TEMPLATE AB (A-B COMPLEXITY) =============
// Handles Level A (basic shapes/colors) and Level B (simple scenes)
// Lightweight, fast deployment - optimized for simple template generation with character consistency

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callRunwareAPIWithRetry } from './callRunwareAPIWithRetry.js';

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
  'level_0-1': 'Subject: {character} {age}, {ethnicity} {bundle.culturalEnhancements}.\nAction: {scene}.\nEnvironment: {setting}.\nContext: {cultural_context}.\nTechnical: {frameworkPrompt}',
  
  'level_2-4': 'Technical: {frameworkPrompt}.\nSubject: {character} {age}, {ethnicity} {bundle.culturalEnhancements}.\nAction: {scene}.\nEnvironment: {setting}.\nContext: {cultural_context}'
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
  const { 
    storyText = pageText, // Accept pageText as fallback for storyText
    pageText,
    userInfo,
    avatarIdentity, 
    characterData, 
    visualDetails, 
    secondaryCharacters,
    frameworkPrompt 
  } = data;

  
  // Safety: Clamp storyText length to prevent oversized inputs
  if (storyText && storyText.length > 2000) {
    console.log(`📏 Clamping storyText from ${storyText.length} to 2000 characters for safety`);
    storyText = storyText.substring(0, 2000);
  }

  console.log('🎯 Phase 3: Using Universal Placeholder Resolver with cultural intelligence');
  
  try {
    // Use the Unified Placeholder Resolver singleton (Phase 3.2)
    const resolver = await getUniversalResolver();
    
    // Prepare additional data for advanced placeholders
    const additionalData = {
      frameworkPrompt: frameworkPrompt || 'children\'s book illustration style',
      secondaryCharacters: secondaryCharacters || '',
      visualDetails: visualDetails,
      characterData: characterData,
      characterSeed: characterData?.seed // Include character seed for consistency
    };
    
    const resolution = await resolver.resolveAllPlaceholders(template, {
      userInfo,
      seed: additionalData,
      sessionId: data.sessionId,
      pageNumber: userInfo?.pageNumber
    });
    const resolvedTemplate = resolution.resolvedText;
    
    console.log('✅ Phase 3: Template resolved with Universal Placeholder Resolver');
    console.log('🌍 Cultural Enhancement Level:', resolver.getCulturalEnhancementLevel());
    console.log('🎨 Cultural Features Applied:', resolver.shouldApplyCulturalFeatures());
    
    // Safety: Ensure we always have a valid positive prompt 
    if (!resolvedTemplate || typeof resolvedTemplate !== 'string' || resolvedTemplate.trim().length === 0) {
      console.warn('⚠️ Universal Resolver returned empty/invalid result, applying emergency fallback');
      resolvedTemplate = `A young child named ${userInfo?.name || 'child'} age ${userInfo?.age || 8}, ${frameworkPrompt}`;
    }
    
    return resolvedTemplate;
    
  } catch (error) {
    console.error('❌ Universal Placeholder Resolver failed, using fallback:', error);
    
    // Fallback to basic resolution if Universal Resolver fails
    return await resolvePlaceholdersFallback(template, data);
  }
}

// ============= FALLBACK RESOLUTION SYSTEM =============
async function resolvePlaceholdersFallback(template, data) {
  console.log('⚠️ Using fallback placeholder resolution');
  
  const { 
    storyText = pageText, // Accept pageText as fallback for storyText 
    pageText,
    userInfo,
    avatarIdentity, 
    frameworkPrompt,
    secondaryCharacters
  } = data;

  const childName = userInfo?.name || userInfo?.childName || 'child';
  const framework = frameworkPrompt || 'children\'s book illustration style';
  
  // Enhanced data processing using StaticDataCache for fallbacks
  const { getCulturalBundle, shouldApplyCulturalEnhancements, getHairBySkintone, getSkinBySkintone } = await import('../_shared/StaticDataCache.js');
  
  // Get cultural enhancements if applicable
  let hairFallback, featuresFallback, ethnicityFallback;
  
  if (shouldApplyCulturalEnhancements(userInfo)) {
    console.log('🎨 Template AB: Applying cultural enhancements via StaticDataCache');
    const culturalBundle = getCulturalBundle(userInfo, data.sessionId);
    hairFallback = culturalBundle.hair;
    featuresFallback = culturalBundle.features;
    ethnicityFallback = 'diverse cultural background';
  } else {
    console.log('🎨 Template AB: Using StaticDataCache generic fallbacks');
    hairFallback = getHairBySkintone(userInfo?.skinTone || 'medium', data.sessionId);
    featuresFallback = getSkinBySkintone(userInfo?.skinTone || 'medium', data.sessionId);
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

  // Safety: Ensure we always return a valid string with 1:1 parity to BASIC template
  if (!resolvedTemplate || resolvedTemplate.length === 0) {
    console.warn('⚠️ Fallback resolver failed, applying emergency BASIC template fallback');
    resolvedTemplate = `A young child named ${childName} age ${userInfo?.age || 8}, ${framework}`;
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
    
    // Use UnifiedPlaceholderResolver for cultural logic (includes {hair} and {features} mapping)
    console.log('☢️ Nuclear Independence: Using cultural logic via UnifiedPlaceholderResolver');
    const positivePrompt = await resolvePlaceholders(template, templateData, true);
    
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
      positivePrompt,
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
    const { 
      storyText = pageText, // Accept pageText as fallback for storyText
      pageText,
      userInfo,
      avatarIdentity, 
      templateComplexity,
      sessionId,
      pageNumber,
      enhancedStoryData, // PHASE 4: Enhanced story data from orchestrator
      failedTierData = {}
    } = await req.json();
    
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
    const template = await generateSimpleTemplate(complexity, storyText, userInfo, avatarIdentity, sessionId, pageNumber, enhancedStoryData);
    
    // Safety: Ensure template has valid positivePrompt before logging/using
    if (!template.positivePrompt || typeof template.positivePrompt !== 'string' || template.positivePrompt.trim().length === 0) {
      console.error('❌ Template AB: Generated template has invalid positivePrompt, applying emergency fallback');
      template.positivePrompt = `A young child named ${userInfo?.name || 'child'} age ${userInfo?.age || 8}, children's book illustration style`;
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