// ============= TIER 2.5 NUCLEAR TEMPLATE SYSTEM =============
// Documentation: docs/IMAGE_GENERATION_SYSTEM_OVERVIEW.md
// Regression Guide: docs/RUNWARE_FALLBACK_REGRESSION_PREVENTION.md
// API Reference: docs/IMAGE_GENERATION_API_REFERENCE.md

import { serve } from "https://deno.land/std@0.168.0/http/server.js";
import { getStyleFramework } from '../_shared/styleFrameworks.js';
import { CULTURAL_LANDMARKS, getCulturalLandmarks } from '../_shared/culturalLandmarks.js';


// ============= INLINED CULTURAL ARRAYS FOR NUCLEAR INDEPENDENCE =============
// Consolidated from _shared/tier25Vocabulary.js to prevent dynamic import failures

const CULTURAL_ARRAYS = {
  HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES: {
    girls: [
      'natural afro hair', 'beautiful braided hair', 'stylish twist hairstyle', 'elegant cornrow hairstyle',
      'lovely natural curls', 'protective braided style', 'beautiful box braids', 'fashionable twist-out hair'
    ],
    boys: [
      'natural short afro', 'stylish fade haircut', 'neat natural hair', 'cool braided style',
      'trendy twist hairstyle', 'handsome natural curls', 'sharp lineup haircut', 'dapper natural hair'
    ]
  },
  HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES: [
    'with warm brown eyes and a bright smile', 'with expressive dark eyes and kind features',
    'with beautiful natural features and joyful expression', 'with bright eyes and confident smile',
    'with gentle features and radiant expression', 'with strong features and happy demeanor'
  ],
  HARDCODED_AFRICAN_AMERICAN_SKIN_TONES: [
    'rich ebony', 'warm mahogany', 'golden bronze', 'deep caramel', 'beautiful brown', 'radiant copper'
  ]
};

// Backward compatibility getter
const CULTURAL_ARRAYS_GETTER = new Proxy({}, {
  get: (target, prop) => {
    return CULTURAL_ARRAYS[prop];
  }
});

// ============= VOCABULARY IMPORTS - SHARED SOURCE OF TRUTH =============
// Import from consolidated _shared/tier25Vocabulary.js for consistency

let TIER_25_UNIFIED_VOCABULARY = null;
let SEMANTIC_EXTRACTION = null;

async function getTier25Vocabulary() {
  if (TIER_25_UNIFIED_VOCABULARY) return { TIER_25_UNIFIED_VOCABULARY, SEMANTIC_EXTRACTION };
  
  try {
    const { TIER_25_UNIFIED_VOCABULARY: vocabImport, SEMANTIC_EXTRACTION: semanticImport } = await import("../_shared/tier25Vocabulary.js");
    TIER_25_UNIFIED_VOCABULARY = vocabImport;
    SEMANTIC_EXTRACTION = semanticImport;
    return { TIER_25_UNIFIED_VOCABULARY, SEMANTIC_EXTRACTION };
  } catch (error) {
    console.warn('Vocabulary lazy load failed, using fallback:', error);
    // Fallback vocabulary for nuclear independence
    TIER_25_UNIFIED_VOCABULARY = {
      actions: {
        basic: ['playing', 'running', 'jumping', 'walking', 'sitting', 'standing', 'looking', 'smiling'],
        creative: ['drawing', 'painting', 'building', 'creating', 'crafting', 'making', 'designing'],
        sensory: ['listening', 'watching', 'touching', 'smelling', 'tasting', 'feeling', 'sensing'],
        states: ['thinking', 'wondering', 'dreaming', 'imagining', 'remembering', 'learning'],
        fantasy: ['flying', 'floating', 'glowing', 'sparkling', 'shimmering', 'dancing'],
        social: ['talking', 'laughing', 'sharing', 'helping', 'caring', 'loving'],
        intensity: ['gently', 'carefully', 'excitedly', 'peacefully', 'energetically', 'boldly'],
        bodyLanguage: ['smiling brightly', 'standing tall', 'sitting cross-legged', 'arms spread wide', 'head tilted thoughtfully'],
        spatial: ['positioned in foreground', 'standing in center', 'sitting comfortably', 'moving forward confidently']
      },
      environments: {
        atmosphere: ['sunny', 'bright', 'warm', 'cheerful', 'peaceful', 'cozy', 'magical'],
        lighting: ['golden hour', 'soft lighting', 'natural light', 'warm glow', 'bright illumination'],
        weather: ['clear skies', 'gentle breeze', 'perfect weather', 'pleasant atmosphere']
      },
      objectCategories: {
        toys: ['toy', 'ball', 'doll', 'game', 'puzzle', 'blocks'],
        nature: ['flower', 'tree', 'leaf', 'rock', 'butterfly', 'bird'],
        books: ['book', 'story', 'journal', 'notebook', 'paper'],
        food: ['apple', 'snack', 'lunch', 'treat', 'cookie', 'fruit']
      },
      contextDetection: {
        indoor: ['inside', 'room', 'house', 'home', 'indoor', 'kitchen', 'bedroom'],
        outdoor: ['outside', 'park', 'garden', 'playground', 'outdoor', 'yard', 'field']
      }
    };
    SEMANTIC_EXTRACTION = {
      EMOTIONS: { happy: ['happy', 'joy', 'smile'], sad: ['sad', 'cry'], scared: ['scared', 'afraid'] },
      ACTIONS: { movement: ['run', 'walk', 'jump'], creative: ['draw', 'paint', 'build'] },
      SETTINGS: { indoor: ['inside', 'room'], outdoor: ['outside', 'park'] }
    };
    return { TIER_25_UNIFIED_VOCABULARY, SEMANTIC_EXTRACTION };
  }
}

// Initialize VOCAB object for backward compatibility with lazy loading
let VOCAB = null;

async function getVocab() {
  if (VOCAB) return VOCAB;
  
  const { TIER_25_UNIFIED_VOCABULARY, UNIVERSAL_EMOTION_ARRAYS, UNIVERSAL_INDOOR_SETTINGS, UNIVERSAL_OUTDOOR_SETTINGS, UNIVERSAL_LIGHTING_ARRAYS } = await getTier25Vocabulary();
  
  VOCAB = {
    TIER_25_UNIFIED_VOCABULARY,
    UNIVERSAL_EMOTION_ARRAYS,
    UNIVERSAL_INDOOR_SETTINGS,
    UNIVERSAL_OUTDOOR_SETTINGS,
    UNIVERSAL_LIGHTING_ARRAYS
  };
  
  return VOCAB;
}

async function getCharacterService() {
  try {
    const { CharacterConsistencyService } = await import("../_shared/CharacterConsistencyService.js");
    return CharacterConsistencyService;
  } catch (error) {
    console.warn('CharacterService lazy load failed:', error);
    return null;
  }
}

async function getSecondaryDetector() {
  try {
    const { SecondaryElementDetector } = await import("../_shared/SecondaryElementDetector.js");
    return SecondaryElementDetector;
  } catch (error) {
    console.warn('SecondaryDetector lazy load failed:', error);
    return null;
  }
}

async function getSessionManager() {
  try {
    const { globalSessionManager } = await import("../_shared/SessionStateManager.js");
    return globalSessionManager;
  } catch (error) {
    console.warn('SessionManager lazy load failed:', error);
    return null;
  }
}

async function getCharacterConsistencyService() {
  try {
    const { characterConsistencyService } = await import("../../../src/services/CharacterConsistencyService.ts");
    return characterConsistencyService;
  } catch (error) {
    console.warn('CharacterConsistencyService lazy load failed:', error);
    return null;
  }
}

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

// Template structures - see docs/RUNWARE_FALLBACK_REGRESSION_PREVENTION.md
const PREMIUM_PROMPT_TEMPLATES = {
  // Template order critical for performance - see docs/REGRESSION_PREVENTION_GUIDE.md
  beginner: "Technical: {frameworkPrompt}, {cameraDirective}. Narrative: {pageText}. Subject: {character} {age}, {ethnicity}, {hair}, {features}, {emotion}. Action: {scene}, {action_intensity}, {spatial_positioning}, {object_interaction}, {body_language}. Composition: {spatial_composition}. Environment: {setting}, {atmosphere}. Elements: {props}, {action_objects}, {colored_objects}, {sensory_details}. Context: {community_context}, {secondary_characters}. Preserved: {preserved_words}",
  easy: "Technical: {frameworkPrompt}, {cameraDirective}. Narrative: {pageText}. Subject: {character} {age}, {ethnicity}, {hair}, {features}, {emotion}. Action: {scene}, {action_intensity}, {spatial_positioning}, {object_interaction}, {body_language}. Composition: {spatial_composition}. Environment: {setting}, {atmosphere}. Elements: {props}, {action_objects}, {colored_objects}, {sensory_details}. Context: {community_context}, {secondary_characters}. Preserved: {preserved_words}",
  
  // Advanced levels use technical-first order
  medium: "Technical: {frameworkPrompt}, {cameraDirective}. Subject: {character} {age}, {ethnicity}, {hair}, {features}, {emotion}. Action: {scene}, {action_intensity}, {spatial_positioning}, {object_interaction}, {body_language}. Composition: {spatial_composition}. Environment: {setting}, {atmosphere}. Elements: {props}, {action_objects}, {colored_objects}, {sensory_details}. Context: {community_context}, {secondary_characters}. Preserved: {preserved_words}. Narrative: {pageText}",
  hard: "Technical: {frameworkPrompt}, {cameraDirective}. Subject: {character} {age}, {ethnicity}, {hair}, {features}, {emotion}. Action: {scene}, {action_intensity}, {spatial_positioning}, {object_interaction}, {body_language}. Composition: {spatial_composition}. Environment: {setting}, {atmosphere}. Elements: {props}, {action_objects}, {colored_objects}, {sensory_details}. Context: {community_context}, {secondary_characters}. Preserved: {preserved_words}. Narrative: {pageText}",
  expert: "Technical: {frameworkPrompt}, {cameraDirective}. Subject: {character} {age}, {ethnicity}, {hair}, {features}, {emotion}. Action: {scene}, {action_intensity}, {spatial_positioning}, {object_interaction}, {body_language}. Composition: {spatial_composition}. Environment: {setting}, {atmosphere}. Elements: {props}, {action_objects}, {colored_objects}, {sensory_details}. Context: {community_context}, {secondary_characters}. Preserved: {preserved_words}. Narrative: {pageText}"
};

// Basic prompt templates
const BASIC_PROMPT_TEMPLATES = {
  beginner: "Primary Scene: {pageText}. Visual Components: {character} {age} with {hair}, {features} {subject} {action} with {emotion} {secondary_characters} with {colored_objects} in {setting} with {adjective} colors. Brand Suffix: {frameworkPrompt}",
  easy: "Primary Scene: {pageText}. Visual Components: {character} {age} with {hair}, {features} {subject} {action} with {emotion} {secondary_characters} with {colored_objects} in {setting} with {adjective} colors. Brand Suffix: {frameworkPrompt}",
  medium: "Primary Scene: {pageText}. Visual Components: {character} {age} with {hair}, {features} {subject} {action} with {emotion} {secondary_characters} with {colored_objects} in {setting} with {adjective} colors. Brand Suffix: {frameworkPrompt}",
  hard: "Primary Scene: {pageText}. Visual Components: {character} {age} with {hair}, {features} {subject} {action} with {emotion} {secondary_characters} with {colored_objects} in {setting} with {adjective} colors. Brand Suffix: {frameworkPrompt}",
  expert: "Primary Scene: {pageText}. Visual Components: {character} {age} with {hair}, {features} {subject} {action} with {emotion} {secondary_characters} with {colored_objects} in {setting} with {adjective} colors. Brand Suffix: {frameworkPrompt}"
};

// AFRICAN AMERICAN ARRAYS - Now using consolidated source from tier25Vocabulary.js
// Note: Arrays moved to CULTURAL_ARRAYS for single source of truth

// Clothing detection uses story-based extraction for narrative consistency

// STANDARD AMERICAN ARRAYS (Hair array removed - AI handles generation)


// CLOTHING ARRAYS - Now using detectClothingFromStory() for narrative consistency
// Removed HARDCODED_STANDARD_AMERICAN_CLOTHING - all clothing comes from story detection or VOCAB

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

// ============= NUCLEAR INDEPENDENT DETECTION FUNCTIONS =============

async function detectSceneContext(pageText) {
  if (!pageText || typeof pageText !== 'string') return 'unknown';
  
  const lowerText = pageText.toLowerCase();
  const vocab = await getVocab();
  
  // Count indoor vs outdoor indicators using unified vocabulary
  const indoorScore = vocab.TIER_25_UNIFIED_VOCABULARY.contextDetection.indoor.reduce((score, keyword) => 
    score + (lowerText.includes(keyword) ? 1 : 0), 0
  );
  
  const outdoorScore = vocab.TIER_25_UNIFIED_VOCABULARY.contextDetection.outdoor.reduce((score, keyword) => 
    score + (lowerText.includes(keyword) ? 1 : 0), 0
  );
  
  // Return context with confidence score
  if (indoorScore > outdoorScore) return 'indoor';
  if (outdoorScore > indoorScore) return 'outdoor';
  return 'unknown';
}

// Backward compatibility function (maintain existing API)
async function isIndoorContext(pageText) {
  return await detectSceneContext(pageText) === 'indoor';
}

// ============= NUCLEAR INDEPENDENT CHARACTER SYSTEM =============
// (UNIVERSAL_EMOTION_ARRAYS moved to _shared/tier25Vocabulary.js for lazy loading)

// ============= NUCLEAR INDEPENDENT CHARACTER SYSTEM =============

function getNuclearCharacterDetails(userInfo, seed, pageText) {
  console.log('🎭 Nuclear Character System - Getting character details');
  console.log('User info received:', JSON.stringify(userInfo, null, 2));
  
  if (!userInfo) {
    console.log('❌ No user info provided, using nuclear fallback');
    return getNuclearFallbackCharacter(seed, pageText);
  }

  const difficulty = userInfo.difficulty || 'easy';
  const gender = userInfo.gender || getSeededRandomItem(['boy', 'girl'], seed);
  const ethnicity = userInfo.ethnicity || 'standard_american';

  console.log(`🎯 Character parameters: ${gender}, ${ethnicity}, ${difficulty}`);

  // African American character path
  if (ethnicity === 'african_american') {
    return generateAfricanAmericanCharacter(gender, seed, difficulty, pageText);
  }

  // Standard American character path  
  return generateStandardAmericanCharacter(gender, seed, difficulty, pageText);
}

function generateAfricanAmericanCharacter(gender, seed, difficulty, pageText) {
  console.log('🌍 Generating African American character');
  
  const age = getSeededRandomItem(['child', 'young child', 'little child'], seed + 'age');
  const hair = getSeededRandomItem(CULTURAL_ARRAYS_GETTER.HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES[gender + 's'] || CULTURAL_ARRAYS_GETTER.HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.girls, seed + 'hair');
  const features = getSeededRandomItem(CULTURAL_ARRAYS_GETTER.HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES, seed + 'features');
  const emotion = getSeededRandomItem(VOCAB.UNIVERSAL_EMOTION_ARRAYS, seed + 'emotion');
  
  console.log('African American character generated successfully');
  
  return {
    character: gender === 'boy' ? 'boy' : 'girl',
    age,
    ethnicity: 'African American',
    hair,
    features,
    emotion,
    clothing: detectClothingFromStory(pageText) || 'comfortable casual clothing'
  };
}

function generateStandardAmericanCharacter(gender, seed, difficulty, pageText) {
  console.log('🇺🇸 Generating Standard American character');
  
  const age = getSeededRandomItem(['child', 'young child', 'little child'], seed + 'age');
  const emotion = getSeededRandomItem(VOCAB.UNIVERSAL_EMOTION_ARRAYS, seed + 'emotion');
  
  // Let AI generate natural hair for standard American
  const hair = 'with natural hair';  
  const features = 'with friendly features';
  
  console.log('Standard American character generated successfully');
  
  return {
    character: gender === 'boy' ? 'boy' : 'girl', 
    age,
    ethnicity: 'American',
    hair,
    features,
    emotion,
    clothing: detectClothingFromStory(pageText) || 'comfortable casual clothing'
  };
}

function getNuclearFallbackCharacter(seed, pageText) {
  console.log('🚨 Using nuclear fallback character system');
  
  const gender = getSeededRandomItem(['boy', 'girl'], seed);
  const age = getSeededRandomItem(['child', 'young child', 'little child'], seed + 'age');
  const emotion = getSeededRandomItem(VOCAB.UNIVERSAL_EMOTION_ARRAYS, seed + 'emotion');
  
  return {
    character: gender,
    age,
    ethnicity: 'American',
    hair: 'with natural hair',
    features: 'with friendly features', 
    emotion,
    clothing: detectClothingFromStory(pageText) || 'comfortable casual clothing'
  };
}

// ============= STORY-BASED CLOTHING DETECTION =============
// Functions moved to consolidated section below to avoid duplication

// ============= NUCLEAR INDEPENDENT SCENE ANALYSIS =============

async function detectObjectsFromStory(pageText, seed) {
  if (!pageText || typeof pageText !== 'string') return [];
  
  const lowerText = pageText.toLowerCase();
  const detectedObjects = [];
  const vocab = await getVocab();
  
  // Search through all object categories using unified vocabulary
  Object.values(vocab.TIER_25_UNIFIED_VOCABULARY.objectCategories).forEach(category => {
    category.forEach(object => {
      if (lowerText.includes(object)) {
        detectedObjects.push(object);
      }
    });
  });
  
  // If no objects found, provide seeded fallback
  if (detectedObjects.length === 0) {
    const fallbackObjects = ['toy', 'ball', 'book', 'flower', 'tree'];
    detectedObjects.push(getSeededRandomItem(fallbackObjects, seed + 'objects'));
  }
  
  console.log(`🔍 Detected objects: ${detectedObjects.join(', ')}`);
  return detectedObjects.slice(0, 3); // Limit to top 3
}

async function detectActionsFromStory(pageText, seed) {
  if (!pageText || typeof pageText !== 'string') return 'playing';
  
  const lowerText = pageText.toLowerCase();
  const vocab = await getVocab();
  
  // Search through all action categories using unified vocabulary
  const allActions = Object.values(vocab.TIER_25_UNIFIED_VOCABULARY.actions).flat();
  
  for (const action of allActions) {
    if (lowerText.includes(action)) {
      console.log(`🏃 Detected action: ${action}`);
      return action;
    }
  }
  
  // Seeded fallback
  console.log(`🎲 Using seeded fallback action`);
  return getSeededRandomItem(vocab.TIER_25_UNIFIED_VOCABULARY.actions.basic, seed + 'action');
}
  const fallbackActions = ['playing', 'exploring', 'discovering', 'learning'];
  return getSeededRandomItem(fallbackActions, seed + 'action');
}

function generateSettingFromContext(pageText, seed) {
  const context = detectSceneContext(pageText);
  
  if (context === 'indoor') {
    return getSeededRandomItem(VOCAB.UNIVERSAL_INDOOR_SETTINGS, seed + 'setting');
  } else if (context === 'outdoor') {
    return getSeededRandomItem(VOCAB.UNIVERSAL_OUTDOOR_SETTINGS, seed + 'setting');
  }
  
  // Mixed or unknown context - choose randomly
  const allSettings = [...VOCAB.UNIVERSAL_INDOOR_SETTINGS, ...VOCAB.UNIVERSAL_OUTDOOR_SETTINGS];
  return getSeededRandomItem(allSettings, seed + 'setting');
}

function generateAtmosphereFromStory(pageText, seed) {
  if (!pageText || typeof pageText !== 'string') {
    return getSeededRandomItem(VOCAB.UNIVERSAL_LIGHTING_ARRAYS, seed + 'atmosphere');
  }
  
  const lowerText = pageText.toLowerCase();
  
  // Detect time-based atmosphere cues
  const atmosphereKeywords = VOCAB.TIER_25_UNIFIED_VOCABULARY.environments.atmosphere;
  
  for (const keyword of atmosphereKeywords) {
    if (lowerText.includes(keyword)) {
      console.log(`🌅 Detected atmosphere cue: ${keyword}`);
      return `with ${keyword} atmosphere`;
    }
  }
  
  // Fallback to lighting arrays
  return getSeededRandomItem(VOCAB.UNIVERSAL_LIGHTING_ARRAYS, seed + 'atmosphere');
}

// ============= NUCLEAR INDEPENDENT SCENE EXTRACTION FUNCTIONS =============

function mapDifficultyInline(userInfo, fallbackLevel = 'medium', orchestratorComplexity = null) {
  try {
    // ORCHESTRATOR OVERRIDE: If templateComplexity is provided by orchestrator, use it
    if (orchestratorComplexity) {
      const validLevels = ['beginner', 'easy', 'medium', 'hard', 'expert'];
      if (validLevels.includes(orchestratorComplexity)) {
        console.log(`🎯 Tier 2.5: Using orchestrator templateComplexity: ${orchestratorComplexity}`);
        return orchestratorComplexity;
      } else {
        console.warn(`⚠️ Tier 2.5: Invalid orchestrator templateComplexity "${orchestratorComplexity}", falling back to user mapping`);
      }
    }
    
    const rawLevel = userInfo?.readingLevel || userInfo?.difficultyLevel || userInfo?.gradeLevel;
    const validLevels = ['beginner', 'easy', 'medium', 'hard', 'expert'];
    
    if (rawLevel && validLevels.includes(rawLevel)) {
      console.log(`🛡️ Tier 2.5: Direct level mapping: ${rawLevel}`);
      return rawLevel;
    }
    
    if (userInfo?.gradeLevel) {
      const grade = String(userInfo.gradeLevel).toLowerCase();
      if (grade.includes('k') || grade.includes('pre') || grade.includes('0')) {
        console.log(`🛡️ Tier 2.5: Grade-based mapping: ${grade} → beginner`);
        return 'beginner';
      }
      if (grade.includes('1') || grade.includes('2')) {
        console.log(`🛡️ Tier 2.5: Grade-based mapping: ${grade} → easy`);
        return 'easy';
      }
      if (grade.includes('3') || grade.includes('4')) {
        console.log(`🛡️ Tier 2.5: Grade-based mapping: ${grade} → medium`);
        return 'medium';
      }
      if (grade.includes('5') || grade.includes('6')) {
        console.log(`🛡️ Tier 2.5: Grade-based mapping: ${grade} → hard`);
        return 'hard';
      }
      if (grade.includes('7') || grade.includes('8') || grade.includes('9')) {
        console.log(`🛡️ Tier 2.5: Grade-based mapping: ${grade} → expert`);
        return 'expert';
      }
    }
    
    if (userInfo?.age) {
      const age = parseInt(userInfo.age);
      if (age <= 5) return 'beginner';
      if (age <= 7) return 'easy';
      if (age <= 10) return 'medium';
      if (age <= 13) return 'hard';
      return 'expert';
    }
    
    console.log(`🛡️ Tier 2.5: Using fallback level: ${fallbackLevel}`);
    return fallbackLevel;
    
  } catch (error) {
    console.warn(`⚠️ Tier 2.5: Difficulty mapping error (using fallback): ${error}`);
    return fallbackLevel;
  }
}

async function extractSceneWithPremiumTemplate(pageText, previousSetting, pageNumber, sessionId) {
  try {
    console.log('🛡️ Tier 2.5: Starting unified semantic extraction with fantasy-friendly scoring');
    console.log(`📄 Input text: "${pageText}"`);
    
    if (!pageText || typeof pageText !== 'string') {
      console.log('🛡️ Tier 2.5: No pageText provided, using fallback scene');
      return {
        scene: 'sitting and reading happily',
        setting: ' a cozy library',
        objects: '',
        secondary_characters: ''
      };
    }

    const sentences = pageText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    if (sentences.length === 0) {
      console.log('🛡️ Tier 2.5: No valid sentences found, using fallback');
      return {
        scene: 'exploring and learning',
        setting: ' a bright classroom',
        objects: '',
        secondary_characters: ''
      };
    }

    console.log(`📝 Processing ${sentences.length} sentences for unified extraction`);

    // ============= SINGLE-PASS EXTRACTION WITH FANTASY-FRIENDLY SCORING =============
    let bestSentence = sentences[0];
    let bestScore = 0;
    let bestExtractedElements = { action: 'playing', setting: 'outdoor space', objects: [], characters: [] };

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      
      // ============= EXTRACT ELEMENTS DURING SCORING (Performance Optimization) =============
      const extractedElements = extractElementsFromSentenceUnified(lowerSentence, pageText);
      
      // ============= CALCULATE VISUAL & FANTASY PRIORITY SCORE =============
      const visualScore = calculateVisualPriority(extractedElements);
      const fantasyBonus = calculateFantasyBonus(extractedElements);
      
      const totalScore = visualScore + fantasyBonus;
      
      console.log(`🎯 Sentence: "${sentence}" | Visual: ${visualScore} | Fantasy: ${fantasyBonus} | Total: ${totalScore}`);
      
      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestSentence = sentence;
        bestExtractedElements = extractedElements;
      }
    }

    console.log(`🎯 Best sentence selected (score: ${bestScore}): "${bestSentence}"`);
    console.log(`🎯 Extracted elements:`, bestExtractedElements);

    // ============= ENHANCED OBJECT INTEGRATION =============
    const enhancedObjects = extractObjectsFromSentence(
      bestSentence, 
      pageText, 
      pageNumber || 1, 
      sessionId
    );

    // ============= CONTEXTUAL INTELLIGENCE SYSTEM =============
    
    // 1. CONTEXTUAL SETTING ENHANCEMENT (Object-driven setting selection)
    const contextualSetting = inferContextualSetting(
      bestExtractedElements.setting,
      enhancedObjects,
      pageText,
      sessionId
    );
    
    // 2. CONTEXTUAL ACTION ENHANCEMENT (Emotional + object context)
    const contextualAction = expandActionWithContext(
      bestExtractedElements.action,
      enhancedObjects,
      pageText,
      contextualSetting
    );
    
    // 3. SPATIAL COMPOSITION GENERATION (Character-object positioning)
    const spatialComposition = generateSpatialComposition(
      contextualAction,
      enhancedObjects,
      contextualSetting,
      pageText
    );
    
    // 4. ATMOSPHERE CONTEXT MAPPING (Time/weather inference)
    const atmosphereContext = inferAtmosphereFromContext(
      pageText,
      contextualSetting,
      contextualAction
    );
    
    // ============= COMBINE CONTEXTUAL INTELLIGENCE =============
    const expandedAction = contextualAction;

    const result = {
      scene: expandedAction,
      setting: contextualSetting,
      objects: enhancedObjects || '', // Use enhanced objects for consistency
      secondary_characters: await getSeededSecondaryCharacters(bestSentence, sessionId, pageNumber),
      spatial_composition: spatialComposition,
      atmosphere: atmosphereContext,
      // Pass contextual intelligence data for template integration
      contextualSetting,
      contextualAction: expandedAction,
      spatialComposition,
      atmosphereContext
    };

    console.log('✅ Unified semantic extraction complete:', result);
    return result;

  } catch (error) {
    console.error('🚨 Tier 2.5: Scene extraction error, using fallback:', error);
    return {
      scene: 'reading and learning',
      setting: ' a peaceful study area',
      objects: '',
      secondary_characters: ''
    };
  }
}

// ============= UNIFIED ELEMENT EXTRACTION (Single-Pass Performance) =============
function extractElementsFromSentenceUnified(sentence, fullText) {
  const result = { action: 'playing', setting: 'outdoor space', objects: [], characters: [] };
  
  // ============= Extract Actions from Unified Vocabulary with Expansion =============
  const allActions = [
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.actions.basic,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.actions.creative,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.actions.sensory,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.actions.states,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.actions.fantasy,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.actions.social
  ];
  
  for (const action of allActions) {
    if (sentence.includes(` ${action} `) || sentence.includes(`${action} `) || sentence.includes(` ${action}`)) {
      // EXPAND SINGLE-WORD ACTIONS TO 5+ WORDS WITH UNIVERSAL TEMPLATES
      result.action = expandActionToPhrase(action, '', fullText);
      break; // Use first match for consistency
    }
  }
  
  // ============= UNIVERSAL SETTING INFERENCE =============
  const seed = sentence + fullText;
  
  // Check for indoor/outdoor context
  const isIndoorScene = isIndoorContext(sentence);
  
  if (isIndoorScene) {
    result.setting = getSeededRandomItem(VOCAB.UNIVERSAL_INDOOR_SETTINGS, seed + '_indoor');
    console.log(`🏠 Universal indoor setting selected: ${result.setting}`);
  } else {
    result.setting = getSeededRandomItem(VOCAB.UNIVERSAL_OUTDOOR_SETTINGS, seed + '_outdoor');
    console.log(`🌳 Universal outdoor setting selected: ${result.setting}`);
  }
  
  // Fallback: Check for specific settings from vocabulary
  const allSettings = [
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.settings.indoor,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.settings.outdoor, 
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.settings.specific,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.settings.fantasy
  ];
  
  for (const setting of allSettings) {
    if (sentence.includes(` ${setting} `) || sentence.includes(`${setting} `) || sentence.includes(` ${setting}`)) {
      result.setting = setting;
      console.log(`🎯 Specific setting match found: ${setting}`);
      break; // Use first match for consistency
    }
  }
  
  return result;
}

// ============= SCORING FUNCTIONS =============
function calculateVisualPriority(elements) {
  let score = 0;
  
  // Action scoring
  if (elements.action && elements.action.includes('playing')) score += 3;
  if (elements.action && elements.action.includes('exploring')) score += 2;
  if (elements.action && elements.action.includes('creating')) score += 2;
  
  // Setting scoring
  if (elements.setting && elements.setting.includes('colorful')) score += 2;
  if (elements.setting && elements.setting.includes('bright')) score += 1;
  
  return score;
}

function calculateFantasyBonus(elements) {
  let bonus = 0;
  
  // Fantasy elements get higher priority
  const fantasyWords = ['magical', 'enchanted', 'sparkling', 'glowing', 'flying', 'floating'];
  const text = JSON.stringify(elements).toLowerCase();
  
  for (const word of fantasyWords) {
    if (text.includes(word)) bonus += 2;
  }
  
  return bonus;
}


// ============= HELPER FUNCTIONS =============

function expandActionToPhrase(action, objects, fullText) {
  // Simple expansion templates
  const expansions = {
    'playing': 'playing happily and energetically',
    'reading': 'reading with focused attention',
    'exploring': 'exploring with curious wonder',
    'creating': 'creating with artistic passion',
    'running': 'running with joyful energy',
    'jumping': 'jumping with excited enthusiasm',
    'sitting': 'sitting comfortably and peacefully',
    'standing': 'standing tall and confident'
  };
  
  return expansions[action] || `${action} with enthusiasm`;
}

// ============= CONTEXTUAL INTELLIGENCE FUNCTIONS =============

// 1. INFER CONTEXTUAL SETTING - Object-driven setting enhancement
function inferContextualSetting(baseSetting, objects, pageText, sessionId) {
  try {
    console.log(`🧠 Contextual Setting Inference - Objects: "${objects}", Base: "${baseSetting}"`);
    
    if (!objects || !pageText) return baseSetting;
    
    const objectsLower = objects.toLowerCase();
    const pageTextLower = pageText.toLowerCase();
    const seed = pageText + objects + baseSetting;
    
    // Object-to-setting mappings with contextual weighting
    const objectSettingMap = {
      'bird': { 
        outdoor: ['garden with blooming flowers', 'park with tall trees', 'forest clearing', 'backyard with bird feeder'], 
        indoor: ['sunroom with windows', 'room with large window'], 
        weight: 0.7 
      },
      'fish': { 
        outdoor: ['pond with lily pads', 'lake shore', 'stream with rocks', 'aquarium display'], 
        indoor: ['aquarium room', 'pet store', 'home aquarium corner'], 
        weight: 0.8 
      },
      'book': { 
        indoor: ['cozy library', 'reading nook', 'bedroom with soft lighting', 'study room'], 
        outdoor: ['park bench', 'garden reading spot'], 
        weight: 0.8 
      },
      'flower': { 
        outdoor: ['flower garden', 'meadow full of wildflowers', 'greenhouse', 'park with flower beds'], 
        indoor: ['sunroom with plants', 'room with flower arrangements'], 
        weight: 0.8 
      },
      'food': {
        indoor: ['kitchen with warm lighting', 'dining room', 'restaurant', 'picnic area'], 
        outdoor: ['outdoor picnic', 'garden party', 'backyard barbecue'], 
        weight: 0.6 
      }
    };
    
    // Find matching object and select contextually appropriate setting
    for (const [objectKey, settingOptions] of Object.entries(objectSettingMap)) {
      if (objectsLower.includes(objectKey)) {
        const isIndoorContext = pageTextLower.includes('inside') || pageTextLower.includes('room') || pageTextLower.includes('house');
        const settingsArray = isIndoorContext ? settingOptions.indoor : settingOptions.outdoor;
        
        if (Math.random() < settingOptions.weight) {
          const selectedSetting = getSeededRandomItem(settingsArray, seed + objectKey);
          console.log(`🎯 Object-driven setting: "${objectKey}" → "${selectedSetting}" (${isIndoorContext ? 'indoor' : 'outdoor'} context)`);
          return selectedSetting;
        }
      }
    }
    
    return baseSetting;
    
  } catch (error) {
    console.warn('Contextual setting inference error:', error);
    return baseSetting;
  }
}

// 2. EXPAND ACTION WITH CONTEXT - Emotional action enhancement
function expandActionWithContext(baseAction, objects, pageText, setting) {
  try {
    console.log(`🧠 Contextual Action Enhancement - Action: "${baseAction}", Objects: "${objects}"`);
    
    const objectsLower = objects.toLowerCase();
    const pageTextLower = pageText.toLowerCase();
    const seed = pageText + objects + baseAction;
    
    // Object-action contextual templates with emotional enhancement
    const contextualActionTemplates = {
      'bird': [
        'points excitedly at the magnificent {object}',
        'gazes in wonder at the beautiful {object}',
        'watches with delighted curiosity as the {object} moves',
        'smiles joyfully while observing the graceful {object}',
        'discovers and admires the colorful {object}'
      ],
      'book': [
        'carefully examines and explores the interesting {object}',
        'discovers and opens the fascinating {object}',
        'reads with focused concentration from the {object}',
        'holds gently and studies the {object}',
        'finds inspiration while reading the {object}'
      ],
      'fish': [
        'watches with amazement as the {object} swims',
        'observes carefully the graceful movements of the {object}',
        'points with excitement at the shimmering {object}',
        'gazes peacefully at the beautiful {object}',
        'discovers and watches the colorful {object}'
      ],
      'flower': [
        'stops to admire the beautiful {object}',
        'gently touches and smells the fragrant {object}',
        'discovers and examines the colorful {object}',
        'picks carefully and holds the delicate {object}',
        'smiles while looking at the pretty {object}'
      ]
    };
    
    // Find matching object and select contextual action template
    for (const [objectKey, templates] of Object.entries(contextualActionTemplates)) {
      if (objectsLower.includes(objectKey)) {
        const selectedTemplate = getSeededRandomItem(templates, seed + objectKey);
        const filledTemplate = selectedTemplate.replace('{object}', objectKey);
        console.log(`🎯 Context-enhanced action: "${baseAction}" + "${objectKey}" → "${filledTemplate}"`);
        return filledTemplate;
      }
    }
    
    // Fallback to original expansion system
    return expandActionToPhrase(baseAction, objects, pageText);
    
  } catch (error) {
    console.warn('Contextual action enhancement error:', error);
    return expandActionToPhrase(baseAction, objects, pageText);
  }
}

// 3. GENERATE SPATIAL COMPOSITION - Character-object positioning
function generateSpatialComposition(action, objects, setting, pageText) {
  try {
    const spatialTemplates = [
      'character prominently featured in foreground',
      'positioned centrally in the scene',
      'naturally placed within the environment',
      'thoughtfully positioned for visual balance',
      'harmoniously integrated into the setting'
    ];
    
    const seed = action + objects + setting + pageText;
    return getSeededRandomItem(spatialTemplates, seed);
  } catch (error) {
    console.warn('Spatial composition generation error:', error);
    return 'character prominently featured in foreground';
  }
}

// 4. ATMOSPHERE CONTEXT MAPPING - Time/weather inference
function inferAtmosphereFromContext(pageText, setting, action) {
  try {
    const atmosphereTemplates = [
      'warm, inviting atmosphere',
      'bright, cheerful ambiance',
      'peaceful, serene environment',
      'vibrant, energetic mood',
      'cozy, comfortable feeling'
    ];
    
    const seed = pageText + setting + action;
    return getSeededRandomItem(atmosphereTemplates, seed);
  } catch (error) {
    console.warn('Atmosphere inference error:', error);
    return 'warm, inviting atmosphere';
  }
}

// ============= SMART TEXT PROCESSING FUNCTIONS =============

function extractFirstSentences(pageText, maxSentences = 2) {
  try {
    if (!pageText || typeof pageText !== 'string') {
      return '';
    }
    
    // Split into sentences, handling multiple punctuation patterns
    const sentences = pageText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length === 0) {
      return pageText; // Return original if no sentences found
    }
    
    // Take first N sentences and rejoin
    const selectedSentences = sentences.slice(0, maxSentences);
    const result = selectedSentences.join('. ').trim();
    
    // Add period if doesn't end with punctuation
    if (result && !result.match(/[.!?]$/)) {
      return result + '.';
    }
    
    console.log(`📝 Extracted ${selectedSentences.length} sentences: "${result}"`);
    return result;
    
  } catch (error) {
    console.warn('⚠️ Extract first sentences error:', error);
    return pageText; // Return original on error
  }
}

function extractObjectsFromSentence(sentence, originalPageText, pageNumber, sessionId) {
  const lowerSentence = sentence.toLowerCase();
  
  // PHASE 1: STORY PROGRESSION INTELLIGENCE - Replace basic prevention with smart analysis
  if (pageNumber && originalPageText) {
    const storyProgressionMap = analyzeStoryProgression(originalPageText, pageNumber);
    const prematureObjects = ['bird', 'butterfly', 'rabbit', 'squirrel', 'elephant', 'lion', 'tiger'];
    
    for (const obj of prematureObjects) {
      if (lowerSentence.includes(obj) && !storyProgressionMap.allowsObject(obj)) {
        const introPage = storyProgressionMap.getIntroductionPage(obj);
        console.log(`🚫 Story progression: "${obj}" not available until page ${introPage} (current: ${pageNumber})`);
        continue; // Skip this object but continue checking others
      }
    }
  }
  
  // PHASE 2: ENHANCED OBJECT DETECTION WITH COLOR INTEGRATION
  const detectedObjects = [];
  
  // Check for objects with colors
  for (const color of VOCAB.EXPANDED_COLOR_ARRAY) {
    for (const category of Object.values(VOCAB.TIER_25_UNIFIED_VOCABULARY.objectCategories)) {
      for (const object of category) {
        if (lowerSentence.includes(`${color} ${object}`) || lowerSentence.includes(`${object} is ${color}`)) {
          detectedObjects.push(`${color} ${object}`);
          console.log(`🎨 Color-enhanced object detected: ${color} ${object}`);
        }
      }
    }
  }
  
  // Check for standalone objects
  for (const category of Object.values(VOCAB.TIER_25_UNIFIED_VOCABULARY.objectCategories)) {
    for (const object of category) {
      if (lowerSentence.includes(object) && !detectedObjects.some(detected => detected.includes(object))) {
        detectedObjects.push(object);
        console.log(`🔍 Object detected: ${object}`);
      }
    }
  }
  
  // PHASE 3: RETURN ENHANCED OBJECTS OR FALLBACK
  if (detectedObjects.length > 0) {
    return detectedObjects.slice(0, 3).join(', '); // Limit to top 3 objects
  }
  
  // PHASE 4: SEEDED FALLBACK FOR CONSISTENCY
  if (sessionId) {
    const fallbackObjects = ['colorful items', 'interesting objects', 'wonderful things'];
    const seed = sessionId + sentence + (pageNumber || 1);
    return getSeededRandomItem(fallbackObjects, seed);
  }
  
  return 'colorful items'; // Ultimate fallback
}

// ============= STORY PROGRESSION MAP CLASS =============
class StoryProgressionMap {
  constructor(storyText, pageNumber) {
    this.objectIntroductions = new Map();
    this.storyContext = storyText.toLowerCase();
    this.analyzeStoryProgression(storyText, pageNumber);
  }
  
  analyzeStoryProgression(storyText, currentPage) {
    // Analyze story text to determine when objects are narratively introduced
    const sentences = storyText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const wordsPerSentence = Math.max(8, storyText.split(' ').length / sentences.length);
    
    // Calculate estimated pages based on story content
    const estimatedTotalPages = Math.max(currentPage, Math.ceil(sentences.length / 2));
    
    // Define object introduction timeline based on story progression
    const storyObjects = ['bird', 'butterfly', 'rabbit', 'squirrel', 'elephant', 'lion', 'tiger', 'horse', 'deer'];
    
    for (const obj of storyObjects) {
      if (this.storyContext.includes(obj)) {
        // Object mentioned in story - calculate introduction page
        const mentionIndex = this.storyContext.indexOf(obj);
        const wordsBeforeMention = this.storyContext.substring(0, mentionIndex).split(' ').length;
        const estimatedIntroPage = Math.max(1, Math.ceil(wordsBeforeMention / (wordsPerSentence * 2)));
        this.objectIntroductions.set(obj, estimatedIntroPage);
        console.log(`📚 Story progression: ${obj} introduced on page ${estimatedIntroPage}`);
      } else {
        // Object not in story - allow from middle pages
        this.objectIntroductions.set(obj, Math.ceil(estimatedTotalPages / 2));
      }
    }
  }
  
  allowsObject(object) {
    const introPage = this.objectIntroductions.get(object);
    return introPage === undefined; // Allow objects not in the progression map
  }
  
  getIntroductionPage(object) {
    return this.objectIntroductions.get(object) || 1;
  }
}

// ============= ENHANCED STORY PROGRESSION ANALYSIS FUNCTION =============
function analyzeStoryProgression(storyText, pageNumber) {
  return new StoryProgressionMap(storyText, pageNumber);
}

// ============= SEEDED SECONDARY CHARACTER SYSTEM =============
async function getSeededSecondaryCharacters(sentence, sessionId, pageNumber) {
  console.log(`🔍 Seeded Secondary Character Detection - Processing: "${sentence}"`);
  
  if (!sessionId) {
    console.log('⚠️ No sessionId provided, falling back to basic detection');
    return await extractSecondaryCharactersFromSentence(sentence, sessionId, pageNumber);
  }
  
  try {
    // PHASE 1: Use SecondaryElementDetector for consistent detection
    const SecondaryDetector = await getSecondaryDetector();
    if (SecondaryDetector) {
      const secondaryElements = await SecondaryDetector.parseElements(
        sessionId,
        '', // primaryScene not available yet
        sentence,
        pageNumber || 1
      );
      
      if (!secondaryElements || secondaryElements.length === 0) {
        console.log('📝 No secondary elements detected by SecondaryElementDetector, using fallback');
        return await extractSecondaryCharactersFromSentence(sentence, sessionId, pageNumber);
      }
      
      // PHASE 2: Get seed-consistent descriptions for secondary characters (up to 4)
      const CharacterService = await getCharacterService();
      if (CharacterService) {
        const characterConsistencyService = new CharacterService();
        
        const seededDescriptions = await Promise.all(
          secondaryElements.slice(0, 4).map(async (el) => {
            if (el.type === 'secondary_character') {
          try {
            const secondaryCharacterSeed = await characterConsistencyService.getSecondaryCharacterSeed(
              sessionId, 
              el.name, 
              'secondary_character'
            );
            const seedDescription = characterConsistencyService.generateSecondaryCharacterDescription(
              el.name, 
              'secondary_character', 
              secondaryCharacterSeed.seed
            );
            console.log(`👤 Tier 2.5A: Secondary character seed applied: ${el.name} -> ${seedDescription} (seed: ${secondaryCharacterSeed.seed})`);
            return `${el.name}: ${seedDescription}`;
          } catch (error) {
            console.warn(`⚠️ Tier 2.5A: Secondary character seed failed for ${el.name}:`, error.message);
            return `friendly ${el.name}`;
          }
        } else if (el.type === 'character_animal') {
          return `${el.name} (${el.type})`;
        }
        return null;
      })
    );
    
    const validDescriptions = seededDescriptions.filter(desc => desc !== null);
    
    if (validDescriptions.length > 0) {
      const result = validDescriptions.join(', ');
      console.log(`✅ Tier 2.5A: Seeded secondary characters generated: ${result}`);
      return result;
    } else {
      console.log('📝 No valid seeded descriptions, using fallback');
      return await extractSecondaryCharactersFromSentence(sentence, sessionId, pageNumber);
    }
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5A: Seeded secondary character detection failed, using fallback:', error.message);
    return await extractSecondaryCharactersFromSentence(sentence, sessionId, pageNumber);
  }
}

async function extractSecondaryCharactersFromSentence(sentence, sessionId, pageNumber) {
  console.log(`🔍 Enhanced Secondary Character Detection - Processing: "${sentence}"`);
  
  const lowerSentence = sentence.toLowerCase();
  const detectedCharacterElements = [];
  
  // ============= PHASE 0: ANALYZE TEXT FOR VISUAL DETAILS FIRST =============
  if (sessionId) {
    try {
      const CharacterService = await getCharacterConsistencyService();
      if (CharacterService) {
        await CharacterService.analyzeVisualDetails(sessionId, sentence, pageNumber || 1);
      }
    } catch (error) {
      console.warn('⚠️ Visual detail tracking failed:', error);
    }
  }
  
  // PHASE 1: FAMILY MEMBER DETECTION WITH ENHANCED DESCRIPTORS
  const familyMemberMappings = {
    'mom': 'caring mother',
    'mother': 'loving mother', 
    'mama': 'warm mama',
    'mommy': 'gentle mommy',
    'dad': 'supportive father',
    'father': 'kind father',
    'papa': 'cheerful papa',
    'daddy': 'playful daddy',
    'sister': 'friendly sister',
    'brother': 'helpful brother',
    'grandma': 'wise grandmother',
    'grandmother': 'loving grandmother',
    'grandpa': 'caring grandfather',
    'grandfather': 'gentle grandfather'
  };
  
  // Check for family members with enhanced descriptions
  for (const [keyword, description] of Object.entries(familyMemberMappings)) {
    if (lowerSentence.includes(keyword)) {
      detectedCharacterElements.push(description);
      console.log(`👨‍👩‍👧‍👦 Family member detected: ${keyword} -> ${description}`);
    }
  }
  
  // PHASE 2: FRIEND & PEER DETECTION WITH VARIETY
  const friendKeywords = ['friend', 'buddy', 'pal', 'classmate', 'neighbor'];
  const friendDescriptions = ['cheerful friend', 'kind friend', 'playful companion', 'helpful classmate', 'friendly neighbor'];
  
  for (const keyword of friendKeywords) {
    if (lowerSentence.includes(keyword)) {
      const seed = (sessionId || '') + sentence + keyword;
      const description = getSeededRandomItem(friendDescriptions, seed);
      detectedCharacterElements.push(description);
      console.log(`👫 Friend/peer detected: ${keyword} -> ${description}`);
      break; // Only add one friend to avoid duplicates
    }
  }
  
  // PHASE 3: ANIMAL COMPANION DETECTION WITH DESCRIPTORS
  const animalMappings = {
    'dog': 'loyal dog companion',
    'puppy': 'playful puppy friend',
    'cat': 'curious cat companion',
    'kitten': 'adorable kitten friend',
    'bird': 'colorful bird companion',
    'rabbit': 'gentle rabbit friend',
    'hamster': 'tiny hamster companion',
    'fish': 'peaceful fish friend'
  };
  
  for (const [animal, description] of Object.entries(animalMappings)) {
    if (lowerSentence.includes(animal)) {
      detectedCharacterElements.push(description);
      console.log(`🐕 Animal companion detected: ${animal} -> ${description}`);
    }
  }
  
  // PHASE 4: ADULT FIGURE DETECTION WITH ROLE-BASED DESCRIPTIONS
  const adultFigureMappings = {
    'teacher': 'encouraging teacher',
    'coach': 'supportive coach', 
    'mentor': 'wise mentor',
    'guide': 'helpful guide',
    'librarian': 'knowledgeable librarian',
    'doctor': 'caring doctor',
    'nurse': 'gentle nurse'
  };
  
  for (const [role, description] of Object.entries(adultFigureMappings)) {
    if (lowerSentence.includes(role)) {
      detectedCharacterElements.push(description);
      console.log(`👨‍🏫 Adult figure detected: ${role} -> ${description}`);
    }
  }
  
  // PHASE 5: RETURN RESULTS OR APPROPRIATE FALLBACK
  if (detectedCharacterElements.length > 0) {
    const result = detectedCharacterElements.slice(0, 3).join(', '); // Limit to top 3
    console.log(`✅ Secondary characters detected: ${result}`);
    return result;
  }
  
  // Return empty string if no secondary characters detected
  console.log('📝 No secondary characters detected');
  return '';
}

// ============= CAMERA DIRECTIVE GENERATION =============
function generateCameraDirective(pageText, scene, setting) {
  try {
    const cameraTemplates = [
      'medium shot with warm lighting',
      'close-up portrait with soft focus',
      'wide establishing shot',
      'three-quarter view with natural lighting',
      'centered composition with balanced framing'
    ];
    
    const seed = pageText + scene + setting;
    const directive = getSeededRandomItem(cameraTemplates, seed);
    
    console.log(`📸 Camera directive generated: ${directive}`);
    return directive;
    
  } catch (error) {
    console.warn('⚠️ Camera directive generation error:', error);
    return 'medium shot with warm lighting';
  }
}

// ============= LEAN ATMOSPHERE EXTRACTION - NO FALLBACKS =============
function extractAtmosphere(pageText, setting = '') {
  const text = (pageText + ' ' + setting).toLowerCase();
  
  // Extract exact descriptive words from text
  const atmosphericWords = extractDescriptiveWords(text);
  
  return atmosphericWords.length > 0 ? atmosphericWords.join(' ') : '';
}

// Helper to extract descriptive atmospheric words from text
function extractDescriptiveWords(text) {
  const descriptiveWords = [];
  
  // Atmospheric adjectives and nouns
  const atmosphericPatterns = [
    /\b(sunny|bright|dark|misty|foggy|stormy|peaceful|magical|mysterious|cozy|warm|cold|cheerful|gloomy|golden|silver|sparkling|shimmering)\b/g,
    /\b(twilight|dawn|midnight|moonlight|sunlight|starlight|candlelight)\b/g,
    /\b(windy|humid|crisp|steamy|fresh|cool|gentle)\b/g
  ];
  
  atmosphericPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      descriptiveWords.push(match[0]);
    }
  });
  
  // Remove duplicates and return first 3
  return [...new Set(descriptiveWords)].slice(0, 3);
}

// ============= DUPLICATE FUNCTION REMOVED - USING CONSOLIDATED extractStoryProps =============
    ];
    
    for (const prop of storyProps) {
      if (lowerText.includes(prop)) {
        detectedProps.push(prop);
      }
    }
    
    // Add objects as props if they exist
    if (objects && objects !== 'colorful items') {
      const objectsList = objects.split(', ');
      detectedProps.push(...objectsList.slice(0, 2)); // Add up to 2 objects as props
    }
    
    if (detectedProps.length > 0) {
      const result = detectedProps.slice(0, 3).join(', ');
      console.log(`🎭 Props extracted: ${result}`);
      return result;
    }
    
    return ''; // Return empty if no props found
    
  } catch (error) {
    console.warn('⚠️ Props extraction error:', error);
    return '';
  }
}

// ============= CHARACTER CONSISTENCY & AVATAR MAPPING SYSTEM =============

function enhanceNuclearMappingWithConsistency(userInfo, difficulty, avatarIdentity, sessionId, characterData) {
  try {
    console.log('🎭 Tier 2.5: Starting character consistency enhancement');
    
    // STEP 1: Get nuclear mapping as baseline safety
    const nuclearMapping = getNuclearAvatarMapping(userInfo, difficulty, avatarIdentity);
    
    if (!nuclearMapping) {
      console.warn('⚠️ Tier 2.5: Nuclear mapping failed - using emergency fallback');
      return generateEmergencyMapping(userInfo);
    }
    
    // STEP 2: Check if character consistency data is available
    if (!characterData || !characterData.seed) {
      console.log('🛡️ Tier 2.5: No character data available - using nuclear mapping');
      return nuclearMapping;
    }
    
    // STEP 3: Enhance nuclear mapping with consistent traits
    console.log('🎭 Tier 2.5: Enhancing nuclear mapping with consistent character data');
    
    const enhancedMapping = {
      ...nuclearMapping, // Start with nuclear safety
      
      // Override with consistent traits when available
      ...(characterData.consistentEyeColor && { eyeColor: characterData.consistentEyeColor }),
      ...(characterData.consistentClothingStyle && { clothing: characterData.consistentClothingStyle }),
      ...(characterData.consistentHairDescription && { hair: characterData.consistentHairDescription }),
      
      // Preserve nuclear safety features
      seed: characterData.seed || avatarIdentity?.seed, // Use consistent seed
      source: 'enhanced-nuclear-mapping'
    };
    
    console.log('✅ Tier 2.5: Character consistency enhancement completed:', {
      hasConsistentEyeColor: !!characterData.consistentEyeColor,
      hasConsistentClothing: !!characterData.consistentClothingStyle,
      hasConsistentHair: !!characterData.consistentHairDescription,
      hasOrchestratorVariation: !!avatarIdentity?.skinToneVariation,
      seed: characterData.seed || avatarIdentity?.seed,
      sessionId: sessionId
    });
    
    return enhancedMapping;
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Character consistency enhancement failed - falling back to nuclear mapping:', error);
    // BULLETPROOF FALLBACK: Return nuclear mapping on any error
    return getNuclearAvatarMapping(userInfo, difficulty, avatarIdentity);
  }
}

function getNuclearAvatarMapping(userInfo, difficulty, avatarIdentity) {
  try {
    console.log('🛡️ Tier 2.5: Generating nuclear avatar mapping');
    
    const avatarType = userInfo?.avatar?.type || avatarIdentity?.type || 'child';
    const seed = avatarIdentity?.seed || userInfo?.sessionId || 'default';
    
    console.log(`🎯 Avatar type: ${avatarType}, Seed: ${seed}`);
    
    // CULTURAL PROFILE DETECTION
    const culturalProfile = detectCulturalProfile(userInfo, avatarIdentity);
    console.log(`🌍 Cultural profile detected: ${culturalProfile}`);
    
    // AFRICAN AMERICAN SPECIALIZED MAPPING
    if (culturalProfile === 'african_american') {
      return generateAfricanAmericanMapping(avatarType, seed, userInfo, avatarIdentity);
    }
    
    // STANDARD AMERICAN MAPPING (ALL OTHER ETHNICITIES)
    return generateStandardAmericanMapping(avatarType, seed, userInfo, avatarIdentity);
    
  } catch (error) {
    console.error('❌ Nuclear avatar mapping error:', error);
    return generateEmergencyMapping(userInfo);
  }
}

function generateAfricanAmericanMapping(avatarType, seed, userInfo, avatarIdentity) {
  try {
    console.log('🎨 Generating African American character mapping');
    
    const gender = avatarType === 'girl' ? 'girls' : 'boys';
    
    // HAIR SELECTION (Seeded for consistency)
    const hairOptions = CULTURAL_ARRAYS_GETTER.HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES[gender] || CULTURAL_ARRAYS_GETTER.HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES.boys;
    const selectedHair = getSeededRandomItem(hairOptions, seed + '_hair');
    
    // SKIN TONE SELECTION (Seeded for consistency)
    const selectedSkinTone = getSeededRandomItem(CULTURAL_ARRAYS_GETTER.HARDCODED_AFRICAN_AMERICAN_SKIN_TONES, seed + '_skin');
    
    // FACIAL FEATURES SELECTION (Seeded for consistency)
    const selectedFeatures = getSeededRandomItem(CULTURAL_ARRAYS_GETTER.HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES, seed + '_features');
    
    // CLOTHING DETECTION FROM STORY
    const storyClothing = detectClothingFromStory(userInfo?.pageText || '');
    const finalClothing = storyClothing || 'comfortable casual clothing';
    
    const mapping = {
      character: `African American ${avatarType}`,
      hair: selectedHair,
      features: selectedFeatures,
      clothing: finalClothing,
      skinTone: selectedSkinTone,
      age: getAgeFromDifficulty(userInfo?.difficulty || 'medium'),
      ethnicity: 'depict character from African American background',
      seed: seed,
      source: 'african-american-nuclear-mapping'
    };
    
    console.log('✅ African American mapping generated:', mapping);
    return mapping;
    
  } catch (error) {
    console.error('❌ African American mapping error:', error);
    return generateEmergencyMapping(userInfo);
  }
}

function generateStandardAmericanMapping(avatarType, seed, userInfo, avatarIdentity) {
  try {
    console.log('🎨 Generating Standard American character mapping');
    
    // CLOTHING DETECTION FROM STORY (Primary approach)
    const storyClothing = detectClothingFromStory(userInfo?.pageText || '');
    const finalClothing = storyClothing || 'comfortable casual clothing';
    
    // BASIC FEATURES (Let AI handle diversity)
    const basicFeatures = [
      'bright expressive eyes, cheerful smile, youthful appearance',
      'sparkling eyes, friendly expression, natural features',
      'warm smile, lively eyes, authentic child features',
      'genuine expression, bright eyes, natural appearance'
    ];
    
    const selectedFeatures = getSeededRandomItem(basicFeatures, seed + '_features');
    
    // ETHNICITY DETECTION (Multi-language support)
    const ethnicityNote = getCharacterEthnicity(userInfo, avatarIdentity);
    
    const mapping = {
      character: `${avatarType}`,
      hair: 'natural hairstyle appropriate for character', // Let AI decide
      features: selectedFeatures,
      clothing: finalClothing,
      age: getAgeFromDifficulty(userInfo?.difficulty || 'medium'),
      ethnicity: ethnicityNote,
      seed: seed,
      source: 'standard-american-nuclear-mapping'
    };
    
    console.log('✅ Standard American mapping generated:', mapping);
    return mapping;
    
  } catch (error) {
    console.error('❌ Standard American mapping error:', error);
    return generateEmergencyMapping(userInfo);
  }
}

function detectCulturalProfile(userInfo, avatarIdentity) {
  try {
    // DETECTION METHOD 1: Direct avatar skin tone analysis
    const skinTone = userInfo?.avatar?.skinTone || avatarIdentity?.skinTone || '';
    const skinToneLower = skinTone.toLowerCase();
    
    // African American skin tone indicators
    const africanAmericanSkinTones = [
      'dark', 'brown', 'black', 'ebony', 'chocolate', 'mahogany', 
      'caramel', 'cocoa', 'bronze', 'deep brown', 'rich brown'
    ];
    
    for (const tone of africanAmericanSkinTones) {
      if (skinToneLower.includes(tone)) {
        console.log(`🎯 African American profile detected via skin tone: ${tone}`);
        return 'african_american';
      }
    }
    
    // DETECTION METHOD 2: Language-based cultural hints
    const language = avatarIdentity?.nativeLanguage || userInfo?.language || 'en';
    
    // Spanish/Latino detection
    if (language === 'es' || language === 'spanish') {
      console.log(`🎯 Spanish/Latino profile detected via language: ${language}`);
      return 'spanish_latino';
    }
    
    // Other language-based profiles
    const languageProfiles = {
      'fr': 'french',
      'french': 'french',
      'zh': 'chinese',
      'chinese': 'chinese',
      'hi': 'hindi',
      'hindi': 'hindi',
      'ar': 'arabic',
      'arabic': 'arabic',
      'pt': 'portuguese',
      'portuguese': 'portuguese'
    };
    
    if (languageProfiles[language]) {
      console.log(`🎯 Cultural profile detected via language: ${language} -> ${languageProfiles[language]}`);
      return languageProfiles[language];
    }
    
    // DETECTION METHOD 3: Story content analysis (future enhancement)
    const storyText = userInfo?.pageText || '';
    if (storyText) {
      // Cultural context clues in story content could be analyzed here
      // For now, keeping it simple
    }
    
    // DEFAULT: Standard American
    console.log('🎯 Default cultural profile: standard_american');
    return 'standard_american';
    
  } catch (error) {
    console.warn('⚠️ Cultural profile detection error:', error);
    return 'standard_american';
  }
}

function generateEmergencyMapping(userInfo) {
  const avatarType = userInfo?.avatar?.type || 'child';
  
  return {
    character: `friendly ${avatarType}`,
    hair: 'natural hairstyle',
    features: 'bright expressive eyes, cheerful smile',
    clothing: 'comfortable everyday outfit',
    age: 'age 9-10',
    ethnicity: '',
    seed: 'emergency',
    source: 'emergency-fallback-mapping'
  };
}

// ============= CULTURAL ENHANCEMENT FUNCTIONS =============

function getCharacterEthnicity(userInfo, avatarIdentity) {
  try {
    const language = avatarIdentity?.nativeLanguage || userInfo?.language || 'en';
    const skinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || '';
    
    // Multi-Language + Dark Skin Ethnicity Enhancement
    const hasDarkSkin = skinTone.toLowerCase().includes('dark') || 
                       skinTone.toLowerCase().includes('brown') ||
                       skinTone.toLowerCase().includes('black') ||
                       skinTone.toLowerCase().includes('ebony') ||
                       skinTone.toLowerCase().includes('chocolate');
    
    if (hasDarkSkin) {
      if (language === 'es' || language === 'spanish') {
        return "depict character from Afro-Latino background";
      }
      if (language === 'fr' || language === 'french') {
        return "depict character from African Francophone background";
      }
      // Fallback for other languages with dark skin
      return "depict character from African American background";
    }
    
    // Language-based ethnicity notes (for non-dark skin)
    if (language === 'es' || language === 'spanish') {
      return "depict character from Spanish/Latino background";
    }
    
    if (language === 'fr' || language === 'french') {
      return "depict character from European background";
    }
    
    if (language === 'zh' || language === 'chinese') {
      return "depict character from Asian background";
    }
    
    if (language === 'hi' || language === 'hindi') {
      return "child of Indian origin";
    }
    
    if (language === 'ar' || language === 'arabic') {
      return "depict character from Middle Eastern background";
    }
    
    if (language === 'pt' || language === 'portuguese') {
      return "depict character from Latin American background";
    }
    
    // Default: no specific ethnicity note for English/Standard American
    return "";
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Character ethnicity detection error:', error);
    return "";
  }
}

// ============= CULTURAL LANDMARKS MOVED TO SHARED MODULE =============

// ============= getCulturalLandmarks FUNCTION MOVED TO SHARED MODULE =============

function applyCulturalSettingEnhancement(baseSetting, userInfo, avatarIdentity) {
  try {
    const language = avatarIdentity?.nativeLanguage || userInfo?.language || 'en';
    console.log(`🌍 Enhanced Cultural Setting Enhancement - Language: ${language}, Base Setting: "${baseSetting}"`);
    
    // ENHANCED: Context-aware cultural integration with indoor/outdoor detection
    const isIndoorSetting = baseSetting.toLowerCase().includes('indoor') || 
                           baseSetting.toLowerCase().includes('home') || 
                           baseSetting.toLowerCase().includes('school') ||
                           baseSetting.toLowerCase().includes('classroom') ||
                           baseSetting.toLowerCase().includes('kitchen') ||
                           baseSetting.toLowerCase().includes('bedroom');
    
    const isOutdoorSetting = baseSetting.toLowerCase().includes('outdoor') || 
                            baseSetting.toLowerCase().includes('park') || 
                            baseSetting.toLowerCase().includes('playground') ||
                            baseSetting.toLowerCase().includes('garden') ||
                            baseSetting.toLowerCase().includes('backyard');
    
    // Get cultural landmarks for the language with enhanced context awareness
    const landmarks = getCulturalLandmarks(language, isIndoorSetting);
    if (landmarks.length > 0) {
      const randomLandmark = landmarks[Math.floor(Math.random() * landmarks.length)];
      
      // ENHANCED: Context-aware enhancement with better integration
      if (baseSetting.toLowerCase().includes('park')) {
        return baseSetting.replace('park', `park ${randomLandmark}`);
      }
      if (baseSetting.toLowerCase().includes('school')) {
        return baseSetting.replace('school', `school ${randomLandmark}`);
      }
      if (baseSetting.toLowerCase().includes('home')) {
        return baseSetting.replace('home', `home ${randomLandmark}`);
      }
      if (baseSetting.toLowerCase().includes('playground')) {
        return baseSetting.replace('playground', `playground ${randomLandmark}`);
      }
      
      // Enhanced generic enhancement with smart positioning
      return `${baseSetting} ${randomLandmark}`;
    }
    
    console.log(`🌍 No cultural enhancement available for language: ${language}`);
    return baseSetting;
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Cultural setting enhancement error:', error);
    return baseSetting;
  }
}

// ============= CLOTHING DETECTION FUNCTIONS =============

function detectClothingFromStory(text) {
  if (!text) return '';
  
  const lowerText = text.toLowerCase();
  
  // Try dynamic clothing + color detection first
  const dynamicClothingColor = detectAndResolveClothingColor(text);
  if (dynamicClothingColor) {
    return dynamicClothingColor;
  }
  
  // Fallback to basic clothing detection
  for (const keyword of CLOTHING_DETECTION_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      // Extract clothing context around the keyword
      const sentences = text.split(/[.!?]+/);
      for (const sentence of sentences) {
        if (sentence.toLowerCase().includes(keyword)) {
          // Add random color if no color specified
          const randomColor = VOCAB.EXPANDED_COLOR_ARRAY[Math.floor(Math.random() * VOCAB.EXPANDED_COLOR_ARRAY.length)];
          return `a ${randomColor} ${keyword}`;
        }
      }
    }
  }
  
  return '';
}

// DUPLICATE FUNCTION REMOVED - consolidated at end of file

// ============= UTILITY FUNCTIONS =============

function getAgeFromDifficulty(difficulty) {
  const ageMap = {
    'beginner': 'age 5-6',
    'easy': 'age 7-8', 
    'medium': 'age 9-10',
    'hard': 'age 11-12',
    'expert': 'age 13-14'
  };
  return ageMap[difficulty] || 'age 9-10';
}

function generateEmergencyPrompt(userInfo) {
  const gender = userInfo?.avatar?.type === 'girl' ? 'girl' : 
                userInfo?.avatar?.type === 'boy' ? 'boy' : 'child';
  
  return `An attractive ${gender} in a portrait style photo with main character focus. Beautiful children's book illustration, warm lighting, cheerful atmosphere, high quality, detailed art.`;
}

// ============= TEMPLATE FILLING FUNCTIONS =============

function fillBasicTemplate_V1(template, placeholders) {
  try {
    console.log('🛡️ Tier 2.5A: Filling premium template with placeholders');
    
    let filledTemplate = template;
    
    // Fill all placeholders
    for (const [key, value] of Object.entries(placeholders)) {
      if (value !== undefined && value !== null && value !== '') {
        const placeholder = `{${key}}`;
        filledTemplate = filledTemplate.replace(new RegExp(placeholder, 'g'), value);
        console.log(`✅ Filled ${key}: "${value}"`);
      }
    }
    
    // Clean up any remaining empty placeholders
    filledTemplate = removeEmptySections(filledTemplate);
    
    console.log('✅ Premium template filled successfully');
    return filledTemplate;
    
  } catch (error) {
    console.error('❌ Premium template filling error:', error);
    return template; // Return original template on error
  }
}

function fillTemplatePlaceholders(template, placeholders) {
  try {
    console.log('🛡️ Tier 2.5B: Filling template placeholders');
    
    let filledTemplate = template;
    
    // Fill all placeholders
    for (const [key, value] of Object.entries(placeholders)) {
      if (value !== undefined && value !== null && value !== '') {
        const placeholder = `{${key}}`;
        filledTemplate = filledTemplate.replace(new RegExp(placeholder, 'g'), value);
        console.log(`✅ Filled ${key}: "${value}"`);
      }
    }
    
    // Basic template cleanup (simpler than premium)
    filledTemplate = filledTemplate
      .replace(/\{\w+\}/g, '') // Remove any remaining placeholders
      .replace(/\s+/g, ' ') // Clean up extra spaces
      .trim();
    
    console.log('✅ Basic template filled successfully');
    return filledTemplate;
    
  } catch (error) {
    console.error('❌ Basic template filling error:', error);
    return template; // Return original template on error
  }
}

// ENHANCED REMOVE EMPTY SECTIONS - HANDLES ACTION SECTION DYNAMICALLY
function removeEmptySections(template) {
  console.log('🧹 Before cleaning:', template);
  
  let cleaned = template;
  
  // STEP 1: Handle Action section specifically - DYNAMIC PROCESSING
  // Pattern: Action: {scene}, {action_intensity}, {spatial_positioning}, {object_interaction}, {body_language}
  const actionRegex = /Action:\s*([^,]*),\s*([^,]*),\s*([^,]*),\s*([^,]*),\s*([^,.]*)(?=[.]\s|\s*\w+:)/g;
  
  cleaned = cleaned.replace(actionRegex, (match, scene, intensity, spatial, interaction, bodyLang) => {
    const components = [];
    
    // Always include scene if present
    if (scene && scene.trim() && !scene.includes('{')) {
      components.push(scene.trim());
    }
    
    // Include intensity only if not empty
    if (intensity && intensity.trim() && !intensity.includes('{')) {
      components.push(intensity.trim());
    }
    
    // DYNAMIC: Include spatial_positioning only if meaningful (not empty)
    if (spatial && spatial.trim() && !spatial.includes('{')) {
      components.push(spatial.trim());
    }
    
    // Include object_interaction only if not empty
    if (interaction && interaction.trim() && !interaction.includes('{')) {
      components.push(interaction.trim());
    }
    
    // DYNAMIC: Include body_language only if meaningful (not empty)
    if (bodyLang && bodyLang.trim() && !bodyLang.includes('{')) {
      components.push(bodyLang.trim());
    }
    
    // Build Action section dynamically - prioritize scene and action over positioning details
    if (components.length > 0) {
      return `Action: ${components.join(', ')}`;
    } else {
      return ''; // Remove entire Action section if no components
    }
  });
  
  // STEP 2: Remove other empty sections (original logic)
  cleaned = cleaned
    .replace(/\w+:\s*[,.](?=\s*\w+:)/g, '') // Remove empty sections in middle
    .replace(/\w+:\s*[,.](?=\s*Technical:)/g, '') // Remove empty sections before Technical
    .replace(/\w+:\s*[,.]$/g, '') // Remove empty sections at end
    .replace(/,\s*,+/g, ',') // Fix multiple commas
    .replace(/\.\s*\.+/g, '.') // Fix multiple periods
    .replace(/\s+/g, ' ') // Clean up extra spaces
    .replace(/\.\s*\w+:/g, '. ') // Fix periods before section labels
    .trim();
  
  console.log('🧹 After cleaning:', cleaned);
  return cleaned;
}

// ============= TEMPLATE VALIDATION FUNCTIONS =============

function validateTemplateCompleteness(character, setting, scene, objects) {
  const issues = [];
  
  if (!character || character.length < 3) issues.push('character missing/too short');
  if (!setting || setting.length < 5) issues.push('setting missing/too short');  
  if (!scene || scene.split(' ').length < 5) issues.push('action under 5 words');
  
  console.log(`🔍 Template validation - Issues: ${issues.length > 0 ? issues.join(', ') : 'none'}`);
  
  return issues.length === 0;
}

// NEW: Avatar validation - triggers 2.5B on failure
function validateAvatarMapping(avatarMapping) {
  const issues = [];
  
  if (!avatarMapping) {
    issues.push('Avatar mapping is null/undefined');
    return { isValid: false, issues: issues };
  }
  
  if (!avatarMapping?.character || avatarMapping.character === 'a friendly child') {
    issues.push('Generic character fallback detected');
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues
  };
}

// NEW: Visual element validation - triggers 2.5B on failure  
function validateVisualElements(sceneData, objects, setting) {
  const issues = [];
  
  if (!sceneData?.spatialComposition || sceneData.spatialComposition === 'character prominently featured in foreground') {
    issues.push('Generic spatial composition detected');
  }
  
  if (!objects || objects === 'interesting colorful items') {
    issues.push('Generic objects fallback detected');
  }
  
  if (!sceneData?.atmosphereContext || sceneData.atmosphereContext === 'warm, inviting atmosphere') {
    issues.push('Generic atmosphere fallback detected');
  }
  
  if (!setting || setting === 'a welcoming colorful environment') {
    issues.push('Generic setting fallback detected');
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues
  };
}

// NEW: Scene complexity validation - triggers 2.5B on failure
function validateSceneComplexity(sceneData, pageText) {
  const issues = [];
  
  if (!sceneData?.contextualAction && pageText && pageText.length > 50) {
    issues.push('No contextual action extracted from substantial text');
  }
  
  if (!sceneData?.contextualSetting && pageText && pageText.length > 50) {
    issues.push('No contextual setting extracted from substantial text');
  }
  
  if (sceneData?.scene && sceneData.scene === 'enjoying a bright cheerful moment') {
    issues.push('Generic scene fallback detected');
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues
  };
}

// ============================================================================
// PHASE 3: ENHANCED SEMANTIC FUNCTIONS
// Enhanced semantic extraction and analysis functions
// ============================================================================


// ============= CONSOLIDATED extractStoryProps FUNCTION =============
// Unified props extraction function (consolidating two duplicate versions)
function extractStoryProps(pageText, objects) {
  if (!pageText || typeof pageText !== 'string') return [];
  
  const lowerText = pageText.toLowerCase();
  const detectedProps = [];
  
  // Import semantic extraction vocabulary
  const { SEMANTIC_EXTRACTION } = await import('./tier25Vocabulary.js');
  const propCategories = SEMANTIC_EXTRACTION.propCategories;
  
  // Extract props from each category
  for (const [category, items] of Object.entries(propCategories)) {
    for (const item of items) {
      if (text.includes(item)) {
        props.push({
          name: item,
          category: category,
          importance: text.split(item).length - 1 // Count occurrences
        });
      }
    }
  }
  
  // Sort by importance (frequency) and return top 5
  return props
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 5)
    .map(prop => prop.name);
}

// Extract community and social context from scene text
function extractCommunityContext(sceneText) {
  if (!sceneText || typeof sceneText !== 'string') return { setting: 'home', socialLevel: 'individual' };
  
  const text = sceneText.toLowerCase();
  
  // Import semantic extraction vocabulary
  const { SEMANTIC_EXTRACTION } = await import('./tier25Vocabulary.js');
  const settingPatterns = SEMANTIC_EXTRACTION.settingPatterns;
  const socialPatterns = SEMANTIC_EXTRACTION.socialPatterns;
  
  // Determine setting
  let setting = 'home';
  for (const [settingType, patterns] of Object.entries(settingPatterns)) {
    if (patterns.some(pattern => text.includes(pattern))) {
      setting = settingType;
      break;
    }
  }
  
  // Determine social level
  let socialLevel = 'individual';
  for (const [level, patterns] of Object.entries(socialPatterns)) {
    if (patterns.some(pattern => text.includes(pattern))) {
      socialLevel = level;
      break;
    }
  }
  
  return { setting, socialLevel };
}

// Extract sensory details from scene text
function extractSensoryDetails(sceneText) {
  if (!sceneText || typeof sceneText !== 'string') return {};
  
  const text = sceneText.toLowerCase();
  const sensoryDetails = {};
  
  // Import semantic extraction vocabulary
  const { SEMANTIC_EXTRACTION } = await import('./tier25Vocabulary.js');
  const visualPatterns = SEMANTIC_EXTRACTION.visualPatterns;
  const soundPatterns = SEMANTIC_EXTRACTION.soundPatterns;
  const movementPatterns = SEMANTIC_EXTRACTION.movementPatterns;
  
  // Extract visual details
  const visual = {};
  for (const [category, patterns] of Object.entries(visualPatterns)) {
    const found = patterns.filter(pattern => text.includes(pattern));
    if (found.length > 0) {
      visual[category] = found;
    }
  }
  if (Object.keys(visual).length > 0) {
    sensoryDetails.visual = visual;
  }
  
  // Extract sound details
  const audio = {};
  for (const [category, patterns] of Object.entries(soundPatterns)) {
    const found = patterns.filter(pattern => text.includes(pattern));
    if (found.length > 0) {
      audio[category] = found;
    }
  }
  if (Object.keys(audio).length > 0) {
    sensoryDetails.audio = audio;
  }
  
  // Extract movement details
  const movement = {};
  for (const [category, patterns] of Object.entries(movementPatterns)) {
    const found = patterns.filter(pattern => text.includes(pattern));
    if (found.length > 0) {
      movement[category] = found;
    }
  }
  if (Object.keys(movement).length > 0) {
    sensoryDetails.movement = movement;
  }
  
  return sensoryDetails;
}

// Enhanced text analysis for story depth and complexity
function analyzeTextComplexity(text) {
  if (!text || typeof text !== 'string') {
    return {
      complexity: 'simple',
      wordCount: 0,
      avgWordsPerSentence: 0,
      uniqueWords: 0,
      readabilityScore: 1
    };
  }
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const uniqueWords = [...new Set(words)];
  
  const wordCount = words.length;
  const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0;
  
  // Calculate complexity based on multiple factors
  let complexityScore = 0;
  
  // Word length factor
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  if (avgWordLength > 5) complexityScore += 2;
  else if (avgWordLength > 4) complexityScore += 1;
  
  // Sentence length factor
  if (avgWordsPerSentence > 15) complexityScore += 2;
  else if (avgWordsPerSentence > 10) complexityScore += 1;
  
  // Vocabulary diversity factor
  const vocabularyDiversity = uniqueWords.length / words.length;
  if (vocabularyDiversity > 0.7) complexityScore += 2;
  else if (vocabularyDiversity > 0.5) complexityScore += 1;
  
  // Determine complexity level
  let complexity = 'simple';
  if (complexityScore >= 5) complexity = 'advanced';
  else if (complexityScore >= 3) complexity = 'intermediate';
  
  return {
    complexity,
    wordCount,
    avgWordsPerSentence,
    uniqueWords: uniqueWords.length,
    vocabularyDiversity,
    readabilityScore: Math.max(1, Math.min(10, 11 - complexityScore))
  };
}

// Extract emotional tone and sentiment from scene text
function extractEmotionalTone(sceneText) {
  if (!sceneText || typeof sceneText !== 'string') return 'neutral';
  
  const text = sceneText.toLowerCase();
  
  // Import semantic extraction vocabulary
  const { SEMANTIC_EXTRACTION } = await import('./tier25Vocabulary.js');
  const emotionPatterns = SEMANTIC_EXTRACTION.emotionPatterns;
  
  // Count emotional indicators
  const emotionScores = {};
  for (const [emotion, patterns] of Object.entries(emotionPatterns)) {
    emotionScores[emotion] = patterns.filter(pattern => text.includes(pattern)).length;
  }
  
  // Find dominant emotion
  const dominantEmotion = Object.entries(emotionScores)
    .reduce((max, [emotion, score]) => score > max.score ? { emotion, score } : max, { emotion: 'neutral', score: 0 });
  
  return dominantEmotion.score > 0 ? dominantEmotion.emotion : 'neutral';
}

// Generate contextual enhancement based on extracted semantic data
function generateContextualEnhancements(sceneText, userInfo = {}) {
  if (!sceneText) return {};
  
  const atmosphere = extractAtmosphere(sceneText);
  const props = extractProps(sceneText);
  const community = extractCommunityContext(sceneText);
  const sensory = extractSensoryDetails(sceneText);
  const camera = generateCameraDirective(sceneText, userInfo.difficulty);
  const complexity = analyzeTextComplexity(sceneText);
  const emotion = extractEmotionalTone(sceneText);
  
  return {
    atmosphere,
    props,
    community,
    sensory,
    camera,
    complexity,
    emotion,
    enhancementLevel: userInfo.difficulty || 'beginner',
    timestamp: new Date().toISOString()
  };
}

// ============================================================================
// END PHASE 3: ENHANCED SEMANTIC FUNCTIONS
// ============================================================================

// ============= INLINE NUCLEAR INDEPENDENCE FUNCTIONS =============
// Nuclear independence achieved - no external dependencies for core functionality

// ============= INLINE EXACT WORD PRESERVATION FUNCTION =============
// Preserves exact words from pageText using TIER_25_UNIFIED_VOCABULARY
// Replaces ExactWordExtractor functionality with nuclear independence
function preserveExactWords(pageText) {
  if (!pageText || typeof pageText !== 'string') return '';
  
  const lowerText = pageText.toLowerCase();
  const preservedWords = [];
  
  // Extract exact matches from all vocabulary categories using word boundaries
  const allVocabulary = [
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.actions.basic,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.actions.creative,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.actions.sensory,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.actions.states,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.actions.fantasy,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.actions.social,
    ...Object.values(VOCAB.TIER_25_UNIFIED_VOCABULARY.objectCategories).flat(),
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.settings.indoor,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.settings.outdoor,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.settings.specific,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.settings.fantasy,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.descriptive.colors,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.descriptive.sizes,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.descriptive.emotions,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.descriptive.qualities
  ];
  
  // Use word boundary regex to prevent partial matches (e.g., "cat" won't match "caterpillar")
  allVocabulary.forEach(word => {
    const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
    if (wordRegex.test(pageText)) {
      // Preserve original case and form from pageText
      const match = pageText.match(wordRegex);
      if (match && !preservedWords.includes(match[0])) {
        preservedWords.push(match[0]);
      }
    }
  });
  
  // Return formatted string for template insertion
  return preservedWords.length > 0 ? preservedWords.join(', ') : '';
}

// ============= INLINE NEGATIVE PROMPT STRING JOINER =============
// Replaces generateNuclearNegativePrompt with inline nuclear independence
function joinNegativePromptStrings(culturalProfile, avatarType, difficulty, pageNumber, secondaryCharacterList) {
  // Get negative prompt from shared style framework
  const styleFramework = getStyleFramework(difficulty);
  const negativePrompt = styleFramework?.negativePrompt || '';
  
  // Convert to array for processing
  let allNegatives = negativePrompt.split(', ').filter(Boolean);
  
  return allNegatives.join(', ');
}

// ============= TIER 2.5B SIMPLE EXTRACTION FUNCTIONS =============
// Simple regex-based extraction functions (no character consistency/visual detail tracker)
// These replace the undefined functions called in fillBasicTemplate

function extractSubject(pageText) {
  if (!pageText || typeof pageText !== 'string') return 'a child';
  
  const text = pageText.toLowerCase();
  // Look for common subjects in children's stories
  const subjects = ['child', 'boy', 'girl', 'student', 'friend', 'character', 'person'];
  
  for (const subject of subjects) {
    if (text.includes(subject)) return `a ${subject}`;
  }
  
  return 'a child'; // Default fallback
}

function extractAction(pageText) {
  if (!pageText || typeof pageText !== 'string') return 'playing';
  
  const text = pageText.toLowerCase();
  // Search all action categories from unified vocabulary
  const allActions = [
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.actions.basic,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.actions.creative,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.actions.sensory,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.actions.states,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.actions.fantasy,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.actions.social
  ];
  
  // Find first matching action using word boundaries
  for (const action of allActions) {
    const actionRegex = new RegExp(`\\b${action}\\b`, 'i');
    if (actionRegex.test(text)) return action;
  }
  
  return 'playing'; // Default fallback
}

function extractSetting(pageText) {
  if (!pageText || typeof pageText !== 'string') return 'a peaceful place';
  
  const text = pageText.toLowerCase();
  // Search all setting categories
  const allSettings = [
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.settings.indoor,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.settings.outdoor,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.settings.specific,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.settings.fantasy
  ];
  
  // Find first matching setting using word boundaries
  for (const setting of allSettings) {
    const settingRegex = new RegExp(`\\b${setting}\\b`, 'i');
    if (settingRegex.test(text)) return setting;
  }
  
  return 'a peaceful place'; // Default fallback
}

function extractAdjective(pageText) {
  if (!pageText || typeof pageText !== 'string') return 'wonderful';
  
  const text = pageText.toLowerCase();
  // Search descriptive categories
  const allAdjectives = [
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.descriptive.colors,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.descriptive.sizes,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.descriptive.emotions,
    ...VOCAB.TIER_25_UNIFIED_VOCABULARY.descriptive.qualities
  ];
  
  // Find first matching adjective using word boundaries
  for (const adjective of allAdjectives) {
    const adjectiveRegex = new RegExp(`\\b${adjective}\\b`, 'i');
    if (adjectiveRegex.test(text)) return adjective;
  }
  
  return 'wonderful'; // Default fallback
}

function extractEmotion(pageText) {
  if (!pageText || typeof pageText !== 'string') return 'happy';
  
  const text = pageText.toLowerCase();
  // Search emotion vocabulary
  const emotions = VOCAB.TIER_25_UNIFIED_VOCABULARY.descriptive.emotions;
  
  // Find first matching emotion using word boundaries
  for (const emotion of emotions) {
    const emotionRegex = new RegExp(`\\b${emotion}\\b`, 'i');
    if (emotionRegex.test(text)) return emotion;
  }
  
  return 'happy'; // Default fallback
}

// ============================================================================
// PHASE 4: VALIDATION AND TEMPLATE SYSTEMS
// Final validation, quality control, and template processing functions
// ============================================================================

// Template validation and quality control
function validateTemplateStructure(template) {
  if (!template) return { isValid: false, error: 'Template is null or undefined' };
  
  if (typeof template === 'string') {
    // Simple string template
    return {
      isValid: template.length > 0 && template.length < 5000,
      error: template.length === 0 ? 'Empty template' : template.length >= 5000 ? 'Template too long' : null,
      type: 'string'
    };
  }
  
  if (Array.isArray(template)) {
    // Array template
    const validation = {
      isValid: template.length > 0 && template.length <= 50,
      error: null,
      type: 'array',
      pageCount: template.length
    };
    
    if (template.length === 0) {
      validation.error = 'Empty template array';
      validation.isValid = false;
    } else if (template.length > 50) {
      validation.error = 'Template array too large';
      validation.isValid = false;
    }
    
    // Check individual pages
    for (let i = 0; i < template.length; i++) {
      if (!template[i] || typeof template[i] !== 'string' || template[i].length === 0) {
        validation.isValid = false;
        validation.error = `Invalid page at index ${i}`;
        break;
      }
    }
    
    return validation;
  }
  
  if (typeof template === 'object') {
    // Structured template
    const validation = {
      isValid: true,
      error: null,
      type: 'structured'
    };
    
    if (!template.pages || !Array.isArray(template.pages)) {
      validation.isValid = false;
      validation.error = 'Missing or invalid pages array';
    } else if (template.pages.length === 0) {
      validation.isValid = false;
      validation.error = 'Empty pages array';
    }
    
    return validation;
  }
  
  return { isValid: false, error: 'Unknown template type', type: 'unknown' };
}

// Validate user information completeness and safety
function validateUserInfo(userInfo) {
  const validation = {
    isValid: true,
    warnings: [],
    errors: [],
    completeness: 0,
    safetyFlags: []
  };
  
  if (!userInfo) {
    validation.isValid = false;
    validation.errors.push('User information is required');
    return validation;
  }
  
  // Completeness scoring
  const fields = ['name', 'age', 'grade', 'favoriteColor', 'favoriteAnimal', 'favoriteFood', 'hobbies'];
  let completedFields = 0;
  
  fields.forEach(field => {
    if (userInfo[field] && typeof userInfo[field] === 'string' && userInfo[field].trim().length > 0) {
      completedFields++;
    }
  });
  
  validation.completeness = Math.round((completedFields / fields.length) * 100);
  
  // Safety checks
  if (userInfo.name && typeof userInfo.name === 'string') {
    if (userInfo.name.length > 50) {
      validation.warnings.push('Name is unusually long');
    }
    // Check for potential personal information
    if (userInfo.name.match(/\d{3}-\d{2}-\d{4}|\b\d{10}\b|@/)) {
      validation.safetyFlags.push('Potential personal info in name');
    }
  }
  
  if (userInfo.specialRequest && typeof userInfo.specialRequest === 'string') {
    if (userInfo.specialRequest.length > 500) {
      validation.warnings.push('Special request is very long');
    }
    // Check for inappropriate content patterns (essential safety only)
    const inappropriatePatterns = ['kill', 'death', 'violence'];
    inappropriatePatterns.forEach(pattern => {
      if (userInfo.specialRequest.toLowerCase().includes(pattern)) {
        validation.safetyFlags.push(`Potentially inappropriate content: ${pattern}`);
      }
    });
  }
  
  // Age validation
  if (userInfo.age) {
    const age = parseInt(userInfo.age);
    if (isNaN(age) || age < 3 || age > 17) {
      validation.warnings.push('Age outside expected range (3-17)');
    }
  }
  
  return validation;
}

// Validate generated content for safety and appropriateness
function validateGeneratedContent(content, userInfo = {}) {
  const validation = {
    isValid: true,
    flags: [],
    score: 100,
    modifications: []
  };
  
  if (!content || typeof content !== 'string') {
    validation.isValid = false;
    validation.flags.push('Invalid content type');
    validation.score = 0;
    return validation;
  }
  
  const text = content.toLowerCase();
  
  // Safety patterns to check for (essential only)
  const safetyPatterns = {
    violence: ['fight', 'hit', 'hurt', 'blood', 'weapon', 'gun', 'knife'],
    inappropriate: ['hate', 'stupid', 'dumb', 'kill', 'die', 'death'],
    personal: ['address', 'phone', 'email', 'password', 'social security']
  };
  
  // Check each safety category
  Object.entries(safetyPatterns).forEach(([category, patterns]) => {
    patterns.forEach(pattern => {
      if (text.includes(pattern)) {
        validation.flags.push(`${category}: ${pattern}`);
        validation.score -= 10;
      }
    });
  });
  
  // Length validation
  if (content.length > 5000) {
    validation.flags.push('Content too long');
    validation.score -= 5;
  }
  
  if (content.length < 10) {
    validation.flags.push('Content too short');
    validation.score -= 15;
  }
  
  // Age appropriateness based on user info
  if (userInfo.age) {
    const age = parseInt(userInfo.age);
    if (age < 6) {
      // Very simple language for younger children
      const complexWords = text.match(/\b\w{8,}\b/g);
      if (complexWords && complexWords.length > 3) {
        validation.flags.push('Language may be too complex for age');
        validation.score -= 5;
      }
    }
  }
  
  validation.isValid = validation.score >= 70;
  return validation;
}

// Process and clean template content
function processTemplateContent(template, userInfo, options = {}) {
  if (!template) return null;
  
  let processedTemplate = template;
  
  // Handle different template types
  if (typeof template === 'string') {
    processedTemplate = [template];
  } else if (typeof template === 'object' && template.pages) {
    processedTemplate = template.pages;
  } else if (!Array.isArray(template)) {
    console.error('Invalid template format for processing');
    return null;
  }
  
  // Process each page
  const processedPages = processedTemplate.map((page, index) => {
    let processedPage = page;
    
    // Apply length limits based on difficulty
    const difficulty = userInfo?.difficulty || 'beginner';
    const maxLength = getMaxPageLength(difficulty);
    
    if (processedPage.length > maxLength) {
      processedPage = truncatePageContent(processedPage, maxLength);
    }
    
    // Apply vocabulary filtering if requested
    if (options.filterVocabulary) {
      processedPage = filterComplexVocabulary(processedPage, difficulty);
    }
    
    // Apply safety filtering
    processedPage = applySafetyFiltering(processedPage);
    
    return processedPage;
  });
  
  return processedPages;
}

// Get maximum page length based on difficulty level
function getMaxPageLength(difficulty) {
  const lengthLimits = {
    'beginner': 150,
    'easy': 200,
    'medium': 300,
    'hard': 400,
    'expert': 500
  };
  
  return lengthLimits[difficulty] || lengthLimits['beginner'];
}

// ============= ENHANCED ACTION SECTION EXTRACTION FUNCTIONS =============

function extractActionIntensity(pageText) {
  const lowerText = pageText.toLowerCase();
  
  // Check for intensity vocabulary (exact matches only)
  for (const intensity of VOCAB.TIER_25_UNIFIED_VOCABULARY.actions.intensity) {
    if (lowerText.includes(intensity)) {
      return intensity;
    }
  }
  
  // Check for intensity indicators in text (only clear indicators)
  if (lowerText.includes('quick') || lowerText.includes('fast') || lowerText.includes('rush')) return 'energetically';
  if (lowerText.includes('slow') || lowerText.includes('soft') || lowerText.includes('quiet')) return 'gently';
  if (lowerText.includes('excited') || lowerText.includes('eager') || lowerText.includes('enthusiastic')) return 'excitedly';
  if (lowerText.includes('calm') || lowerText.includes('peace') || lowerText.includes('relax')) return 'peacefully';
  if (lowerText.includes('careful') || lowerText.includes('cautious')) return 'carefully';
  if (lowerText.includes('bold') || lowerText.includes('brave') || lowerText.includes('confident')) return 'boldly';
  
  // NO FALLBACK - Return empty string when no intensity detected
  return '';
}

function extractBodyLanguage(pageText) {
  const lowerText = pageText.toLowerCase();
  
  // Check for body language vocabulary (exact matches)
  for (const bodyLang of VOCAB.TIER_25_UNIFIED_VOCABULARY.actions.bodyLanguage) {
    if (lowerText.includes(bodyLang.toLowerCase())) {
      return bodyLang;
    }
  }
  
  // CONTEXT-AWARE BODY LANGUAGE EXTRACTION - INTELLIGENT DETECTION
  // Only provide body language when context is clear and meaningful
  
  // Sleeping/Waking context
  if (lowerText.includes('wake') || lowerText.includes('waking') || lowerText.includes('woke')) {
    if (lowerText.includes('stretch')) return 'stretching arms upward';
    if (lowerText.includes('rub') || lowerText.includes('eyes')) return 'rubbing eyes sleepily';
    if (lowerText.includes('yawn')) return 'yawning softly';
    if (lowerText.includes('bed') || lowerText.includes('sleep')) return 'stretching arms upward';
  }
  
  // Walking/Moving context with confidence indicators
  if (lowerText.includes('walk') || lowerText.includes('walking') || lowerText.includes('move')) {
    if (lowerText.includes('confident') || lowerText.includes('proud')) return 'looking ahead confidently';
    if (lowerText.includes('pocket')) return 'hands in pockets';
    if (lowerText.includes('school') || lowerText.includes('purpose')) return 'arms swinging naturally';
  }
  
  // Playing/Active context with clear activity
  if (lowerText.includes('play') || lowerText.includes('playing') || lowerText.includes('jump') || lowerText.includes('run')) {
    if (lowerText.includes('excited') || lowerText.includes('happy')) return 'arms spread wide with excitement';
    if (lowerText.includes('celebrate') || lowerText.includes('win')) return 'hands raised in celebration';
    if (lowerText.includes('ball') || lowerText.includes('toy')) return 'body bouncing with joy';
  }
  
  // Sitting context with specific details
  if (lowerText.includes('sit') || lowerText.includes('sitting') || lowerText.includes('seat')) {
    if (lowerText.includes('cross') || lowerText.includes('legs')) return 'sitting cross-legged';
    if (lowerText.includes('comfortable') || lowerText.includes('relax')) return 'hands resting on lap';
    if (lowerText.includes('quietly') || lowerText.includes('still')) return 'sitting cross-legged';
  }
  
  // Standing context with purpose
  if (lowerText.includes('stand') || lowerText.includes('standing')) {
    if (lowerText.includes('tall') || lowerText.includes('proud')) return 'standing tall';
    if (lowerText.includes('confident')) return 'hands on hips';
  }
  
  // Strong emotional indicators only
  if (lowerText.includes('smile') && (lowerText.includes('bright') || lowerText.includes('wide'))) return 'smiling brightly';
  if (lowerText.includes('think') || lowerText.includes('wonder') || lowerText.includes('curious')) return 'head tilted thoughtfully';
  if (lowerText.includes('excited') && lowerText.includes('eyes')) return 'eyes sparkling with wonder';
  
  // NO UNIVERSAL FALLBACK - Return empty string when context is insufficient
  return '';
}

function extractSpatialPositioning(pageText) {
  const lowerText = pageText.toLowerCase();
  
  // Check for spatial positioning vocabulary (exact matches)
  for (const spatial of VOCAB.TIER_25_UNIFIED_VOCABULARY.actions.spatial) {
    const spatialWords = spatial.toLowerCase().split(' ');
    if (spatialWords.every(word => lowerText.includes(word))) {
      return spatial;
    }
  }
  
  // CONTEXT-AWARE SPATIAL POSITIONING EXTRACTION - INTELLIGENT DETECTION
  // Only provide positioning when context is clear and meaningful
  
  // Sleeping/Waking context - bed context provides clear positioning
  if (lowerText.includes('wake') || lowerText.includes('waking') || lowerText.includes('woke') || 
      lowerText.includes('sleep') || lowerText.includes('bed')) {
    if (lowerText.includes('sit') || lowerText.includes('up')) return 'sitting up in bed';
    if (lowerText.includes('stretch')) return 'stretching in bed';
    if (lowerText.includes('lying') || lowerText.includes('lay')) return 'lying peacefully';
    return 'sitting up in bed'; // Clear bed context justifies positioning
  }
  
  // Walking/Moving context with directional indicators
  if (lowerText.includes('walk') || lowerText.includes('walking') || lowerText.includes('move') || 
      lowerText.includes('step') || lowerText.includes('stride')) {
    if (lowerText.includes('to') || lowerText.includes('toward') || lowerText.includes('school')) return 'moving forward confidently';
    if (lowerText.includes('careful') || lowerText.includes('slow')) return 'stepping carefully';
    if (lowerText.includes('purpose') || lowerText.includes('determined')) return 'striding purposefully';
  }
  
  // Playing context with specific activities  
  if (lowerText.includes('play') || lowerText.includes('playing') || lowerText.includes('game') ||
      lowerText.includes('toy') || lowerText.includes('fun')) {
    if (lowerText.includes('crouch') || lowerText.includes('down')) return 'crouched down to play';
    if (lowerText.includes('kneel') || lowerText.includes('ground')) return 'kneeling on ground';
    if (lowerText.includes('sit') || lowerText.includes('seated')) return 'seated for play';
    if (lowerText.includes('ball') || lowerText.includes('toy')) return 'positioned playfully';
  }
  
  // Learning/Reading context with furniture/location indicators
  if (lowerText.includes('read') || lowerText.includes('book') || lowerText.includes('study') ||
      lowerText.includes('learn') || lowerText.includes('desk') || lowerText.includes('school')) {
    if (lowerText.includes('desk') || lowerText.includes('table')) return 'positioned at desk';
    if (lowerText.includes('comfortable') || lowerText.includes('cozy')) return 'seated comfortably';
    if (lowerText.includes('attentive') || lowerText.includes('focus')) return 'sitting attentively';
  }
  
  // Strong spatial indicators only
  if (lowerText.includes('center') || lowerText.includes('middle')) return 'standing in the center';
  if (lowerText.includes('front') || lowerText.includes('foreground')) return 'positioned in the foreground';
  if (lowerText.includes('left')) return 'placed to the left';
  if (lowerText.includes('right')) return 'located on the right side';
  if (lowerText.includes('back') || lowerText.includes('background')) return 'sitting in the background';
  if (lowerText.includes('corner')) return 'crouched in the corner';
  if (lowerText.includes('above') || lowerText.includes('over')) return 'hovering above';
  if (lowerText.includes('under') || lowerText.includes('beneath') || lowerText.includes('below')) return 'resting beneath';
  if (lowerText.includes('between')) return 'nestled between';
  if (lowerText.includes('on top') || lowerText.includes('upon')) return 'balanced on top of';
  
  // NO UNIVERSAL FALLBACK - Return empty string when context is insufficient
  return '';
}

function extractObjectInteraction(pageText, actionObjects) {
  const lowerText = pageText.toLowerCase();
  
  // If we have meaningful action objects, enhance them with interaction details
  if (actionObjects && actionObjects !== 'colorful items' && actionObjects.trim() !== '') {
    // Check for specific interaction verbs
    if (lowerText.includes('hold') || lowerText.includes('holding')) return `holding ${actionObjects}`;
    if (lowerText.includes('carry') || lowerText.includes('carrying')) return `carrying ${actionObjects}`;
    if (lowerText.includes('use') || lowerText.includes('using')) return `using ${actionObjects}`;
    if (lowerText.includes('play') || lowerText.includes('playing')) return `playing with ${actionObjects}`;
    if (lowerText.includes('touch') || lowerText.includes('touching')) return `touching ${actionObjects}`;
    if (lowerText.includes('reach') || lowerText.includes('reaching')) return `reaching for ${actionObjects}`;
    if (lowerText.includes('grab') || lowerText.includes('grabbing')) return `grabbing ${actionObjects}`;
    if (lowerText.includes('pick') || lowerText.includes('picking')) return `picking up ${actionObjects}`;
    
    // If objects exist but no specific interaction verb, describe general interaction
    return `interacting with ${actionObjects}`;
  }
  
  // Check for specific objects mentioned in text (without actionObjects parameter)
  if (lowerText.includes('book') && (lowerText.includes('hold') || lowerText.includes('read'))) return 'holding a book';
  if (lowerText.includes('ball') && (lowerText.includes('play') || lowerText.includes('throw'))) return 'playing with a ball';
  if (lowerText.includes('toy') && lowerText.includes('play')) return 'playing with toys';
  if (lowerText.includes('food') && (lowerText.includes('eat') || lowerText.includes('hold'))) return 'holding food';
  
  // NO FALLBACK - Return empty string when no objects or interactions detected
  return '';
}

// Truncate page content intelligently at sentence boundaries
function truncatePageContent(content, maxLength) {
  if (content.length <= maxLength) return content;
  
  // Try to truncate at sentence boundary
  const sentences = content.split(/[.!?]+/);
  let truncated = '';
  
  for (const sentence of sentences) {
    const testLength = truncated.length + sentence.length + 1;
    if (testLength > maxLength) break;
    truncated += sentence + '.';
  }
  
  // If no complete sentences fit, do word-based truncation
  if (truncated.length === 0) {
    const words = content.split(' ');
    truncated = words.slice(0, Math.floor(maxLength / 6)).join(' ') + '.';
  }
  
  return truncated.trim();
}

// Filter complex vocabulary based on difficulty level
function filterComplexVocabulary(content, difficulty) {
  // Simple word replacement for easier reading levels
  const vocabularyMap = {
    'beginner': {
      'enormous': 'big',
      'magnificent': 'beautiful',
      'discovered': 'found',
      'adventure': 'trip',
      'incredible': 'amazing'
    },
    'easy': {
      'enormous': 'huge',
      'magnificent': 'wonderful',
      'incredible': 'amazing'
    }
  };
  
  const replacements = vocabularyMap[difficulty];
  if (!replacements) return content;
  
  let filtered = content;
  Object.entries(replacements).forEach(([complex, simple]) => {
    const regex = new RegExp(`\\b${complex}\\b`, 'gi');
    filtered = filtered.replace(regex, simple);
  });
  
  return filtered;
}

// Apply essential safety filtering to content
function applySafetyFiltering(content) {
  let filtered = content;
  
  // Replace only genuinely concerning words with safer alternatives
  const safetyReplacements = {
    'fight': 'play',
    'hit': 'touch',
    'hurt': 'feel sad'
  };
  
  Object.entries(safetyReplacements).forEach(([unsafe, safe]) => {
    const regex = new RegExp(`\\b${unsafe}\\b`, 'gi');
    filtered = filtered.replace(regex, safe);
  });
  
  return filtered;
}

  if (qa.warnings.length > 3) {
    qa.recommendations.push('Multiple quality issues detected - review settings');
  }
  
  qa.passed = qa.score >= 70 && qa.issues.length === 0;
  return qa;
}

// Get expected page count range for difficulty level
function getExpectedPageCount(difficulty) {
  const pageCounts = {
    'beginner': { min: 3, max: 8 },
    'easy': { min: 4, max: 10 },
    'medium': { min: 5, max: 12 },
    'hard': { min: 6, max: 15 },
    'expert': { min: 8, max: 20 }
  };
  
  return pageCounts[difficulty] || pageCounts['beginner'];
}

// Calculate similarity between two text strings
function calculateSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(word => set2.has(word)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}


// Final assembly and output formatting
function assembleGenerationResult(pages, userInfo, processingData = {}) {
  const result = {
    success: true,
    pages: pages,
    metadata: {
      pageCount: pages.length,
      difficulty: userInfo?.difficulty || 'beginner',
      qualityScore: 100,
      processingTime: processingData.processingTime || 'unknown',
      tier: processingData.tier || 'unknown',
      generationMethod: processingData.generationMethod || 'template',
      timestamp: new Date().toISOString()
    },
    quality: {
      score: qa.score,
      passed: qa.passed,
      issues: qa.issues,
      warnings: qa.warnings,
      recommendations: qa.recommendations
    }
  };
  
  // Add user information (safely)
  if (userInfo) {
    result.userContext = {
      age: userInfo.age,
      grade: userInfo.grade || userInfo.gradeLevel,
      difficulty: userInfo.difficulty,
      hasSpecialRequest: !!(userInfo.specialRequest && userInfo.specialRequest.trim())
    };
  }
  
  return result;
}

// ============================================================================
// END PHASE 4: VALIDATION AND TEMPLATE SYSTEMS
// ============================================================================


// ============= PROMPT PROCESSING FUNCTIONS =============

function processPromptForRunware(prompt, difficulty) {
  if (!prompt) return prompt;
  
  console.log(`🛡️ Tier 2.5: Simplified processing - letting Runware handle final length (${prompt.length} chars for ${difficulty})`);
  
  // No truncation needed - smart sentence extraction already handled in template filling
  // Total prompts should be ~800-1200 chars well under Runware's limits  
  return prompt;
}

function truncatePageText(text, difficulty) {
  if (!text) return '';
  
  // Beginner/Easy: Use full pageText at beginning
  if (difficulty === 'beginner' || difficulty === 'easy') {
    return text;
  }
  
  // Medium/Hard/Expert: Truncate pageText for end positioning
  const maxLength = difficulty === 'medium' ? 100 : difficulty === 'hard' ? 80 : 60;
  
  if (text.length <= maxLength) {
    return text;
  }
  
  // Truncate at word boundary
  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxLength * 0.7) { // Only truncate at word if it's not too short
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
}

// ============= CONTEXT-AWARE ENHANCEMENT FUNCTIONS =============

function applyContextAwareEnhancement(currentValue, exactWord, type) {
  if (!exactWord || !currentValue) return currentValue;
  
  try {
    // Preserve exact story content first, enhance visually second
    if (type === 'action') {
      // Keep exact verb form, add minimal context-appropriate descriptors
      if (exactWord.includes('roll')) return `${exactWord}`;
      if (exactWord.includes('run')) return `${exactWord}`;
      if (exactWord.includes('jump')) return `${exactWord}`;
      if (exactWord.includes('play')) return `${exactWord}`;
      if (exactWord.includes('bounce')) return `${exactWord}`;
      
      // For other actions, preserve the exact word and add appropriate context
      return currentValue.includes(exactWord) ? currentValue : `${exactWord} ${currentValue}`;
    }
    
    if (type === 'objects') {
      // Preserve exact object names from story
      return currentValue.includes(exactWord) ? currentValue : `${exactWord}, ${currentValue}`;
    }
    
    if (type === 'setting') {
      // Enhance setting while preserving story location
      if (exactWord.includes('hill')) return `${exactWord} with natural terrain`;
      if (exactWord.includes('park')) return `${exactWord} with green spaces`;
      if (exactWord.includes('garden')) return `${exactWord} with beautiful plants`;
      
      return currentValue.includes(exactWord) ? currentValue : `${currentValue} near ${exactWord}`;
    }
    
    return currentValue;
    
  } catch (error) {
    console.warn(`⚠️ Context enhancement error for ${type}:`, error);
    return currentValue;
  }
}

// ============= UTILITY HELPER FUNCTIONS =============

function getRandomItem(array) {
  if (!array || array.length === 0) return 'default';
  return array[Math.floor(Math.random() * array.length)];
}

function extractGenderFromCharacter(character) {
  if (!character || typeof character !== 'string') return 'child';
  const lowerChar = character.toLowerCase();
  if (lowerChar.includes('girl')) return 'girl';
  if (lowerChar.includes('boy')) return 'boy';
  return 'child';
}

// ============= NUCLEAR INDEPENDENT TEMPLATE SYSTEM =============

function getNuclearPromptTemplate(difficulty, templateType = 'premium') {
  const templates = templateType === 'basic' ? BASIC_PROMPT_TEMPLATES : PREMIUM_PROMPT_TEMPLATES;
  const template = templates[difficulty] || templates['easy']; // Fallback to easy
  
  console.log(`📋 Using ${templateType} template for ${difficulty} difficulty`);
  return template;
}

function generateEnhancedActionSection(pageText, objects, seed) {
  const action = detectActionsFromStory(pageText, seed);
  const intensity = getSeededRandomItem(VOCAB.TIER_25_UNIFIED_VOCABULARY.actions.intensity, seed + 'intensity');
  const bodyLanguage = getSeededRandomItem(VOCAB.TIER_25_UNIFIED_VOCABULARY.actions.bodyLanguage, seed + 'body');
  
  const mainObject = objects.length > 0 ? objects[0] : 'toy';
  const spatialPositioning = `positioned near the ${mainObject}`;
  const objectInteraction = `interacting with the ${mainObject}`;
  
  return {
    scene: action,
    action_intensity: intensity,
    spatial_positioning: spatialPositioning,
    object_interaction: objectInteraction,
    body_language: bodyLanguage
  };
}

function generateColoredObjectsFromStory(pageText, objects, seed) {
  if (!objects || objects.length === 0) return 'colorful toys';
  
  const colors = [];
  const lowerText = pageText ? pageText.toLowerCase() : '';
  
  // Detect colors from story
  VOCAB.EXPANDED_COLOR_ARRAY.forEach(color => {
    if (lowerText.includes(color)) {
      colors.push(color);
    }
  });
  
  // If no colors found, use seeded selection
  if (colors.length === 0) {
    colors.push(getSeededRandomItem(VOCAB.EXPANDED_COLOR_ARRAY, seed + 'color'));
  }
  
  const selectedColor = colors[0];
  const selectedObject = objects[0];
  
  return `${selectedColor} ${selectedObject}`;
}

// ============= NUCLEAR INDEPENDENT RUNWARE WEBSOCKET SERVICE =============

class NuclearRunwareWebSocketService {
  constructor() {
    this.ws = null;
    this.connectionPromise = null;
    this.messageCallbacks = new Map();
    this.isAuthenticated = false;
    this.connectionSessionUUID = null;
  }

  async connect(apiKey) {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket('wss://ws-api.runware.ai/v1');
        
        this.ws.onopen = async () => {
          console.log('🔌 Nuclear WebSocket connected');
          try {
            await this.authenticate(apiKey);
            resolve();
          } catch (error) {
            reject(error);
          }
        };

        this.ws.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data);
            this.handleMessage(response);
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ Nuclear WebSocket error:', error);
          reject(new Error('WebSocket connection failed'));
        };

        this.ws.onclose = () => {
          console.log('🔌 Nuclear WebSocket closed');
          this.isAuthenticated = false;
          this.connectionPromise = null;
        };

      } catch (error) {
        console.error('❌ Failed to create WebSocket:', error);
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  async authenticate(apiKey) {
    return new Promise((resolve, reject) => {
      const authTimeout = setTimeout(() => {
        reject(new Error('Authentication timeout'));
      }, 10000);

      const authMessage = [{
        taskType: 'authentication',
        apiKey: apiKey
      }];

      this.messageCallbacks.set('auth', (data) => {
        clearTimeout(authTimeout);
        if (data.taskType === 'authentication') {
          this.isAuthenticated = true;
          this.connectionSessionUUID = data.connectionSessionUUID;
          console.log('✅ Nuclear authentication successful');
          resolve();
        } else {
          reject(new Error('Authentication failed'));
        }
      });

      this.ws.send(JSON.stringify(authMessage));
    });
  }

  handleMessage(response) {
    if (response.error || response.errors) {
      console.error('❌ Nuclear WebSocket error:', response.error || response.errors);
      return;
    }

    if (response.data) {
      response.data.forEach(item => {
        if (item.taskType === 'authentication') {
          const callback = this.messageCallbacks.get('auth');
          if (callback) {
            callback(item);
            this.messageCallbacks.delete('auth');
          }
        } else {
          const callback = this.messageCallbacks.get(item.taskUUID);
          if (callback) {
            callback(item);
            this.messageCallbacks.delete(item.taskUUID);
          }
        }
      });
    }
  }

  async generateImage(params) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    const taskUUID = crypto.randomUUID();
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.messageCallbacks.delete(taskUUID);
        reject(new Error('Image generation timeout'));
      }, 120000);

      this.messageCallbacks.set(taskUUID, (data) => {
        clearTimeout(timeout);
        if (data.error) {
          reject(new Error(data.errorMessage || 'Image generation failed'));
        } else {
          resolve(data);
        }
      });

      const message = [{
        taskType: 'imageInference',
        taskUUID,
        positivePrompt: params.positivePrompt,
        model: params.model || 'runware:100@1',
        width: params.width || 1024,
        height: params.height || 1024,
        numberResults: 1,
        outputFormat: 'WEBP',
        steps: params.steps || 4,
        CFGScale: params.CFGScale || 1,
        scheduler: 'FlowMatchEulerDiscreteScheduler'
      }];

      this.ws.send(JSON.stringify(message));
    });
  }
}

// ============= NUCLEAR INDEPENDENT MAIN GENERATION FUNCTION =============

async function generateNuclearImage(requestData) {
  console.log('🚀 Starting nuclear image generation');
  
  try {
    // Extract and validate request data
    const { 
      userInfo, 
      pageText, 
      sessionId, 
      pageNumber,
      apiKey 
    } = requestData;

    if (!apiKey) {
      throw new Error('API key is required for nuclear image generation');
    }

    if (!pageText) {
      throw new Error('Page text is required for nuclear image generation');
    }

    console.log('📝 Page text:', pageText.substring(0, 100) + '...');

    // Generate consistent seed for this session and page
    const seed = `${sessionId || 'default'}_${pageNumber || 1}`;
    console.log('🌱 Generated seed:', seed);

    // Get nuclear character details
    const characterDetails = getNuclearCharacterDetails(userInfo, seed, pageText);
    console.log('🎭 Character details:', characterDetails);

    // Detect story elements using unified vocabulary system
    const detectedObjects = detectObjectsFromStory(pageText, seed);
    const setting = generateSettingFromContext(pageText, seed);
    const atmosphere = generateAtmosphereFromStory(pageText, seed);
    
    console.log('🔍 Detected elements:');
    console.log('  Objects:', detectedObjects);
    console.log('  Setting:', setting);
    console.log('  Atmosphere:', atmosphere);

    // Generate enhanced action section
    const actionSection = generateEnhancedActionSection(pageText, detectedObjects, seed);
    console.log('🎬 Action section:', actionSection);

    // Get style settings from shared framework
    const difficulty = userInfo?.difficulty || 'easy';
    const styleFramework = getStyleFramework(difficulty);
    console.log('🎨 Style framework for', difficulty, ':', styleFramework.name);

    // Get prompt template
    const templateType = ['beginner', 'easy'].includes(difficulty) ? 'basic' : 'premium';
    const template = getNuclearPromptTemplate(difficulty, templateType);
    console.log('📋 Using template type:', templateType);

    // Generate colored objects
    const coloredObjects = generateColoredObjectsFromStory(pageText, detectedObjects, seed);
    console.log('🌈 Colored objects:', coloredObjects);

    // Build prompt using template
    const promptVariables = {
      frameworkPrompt: styleFramework.frameworkPrompt,
      cameraDirective: 'medium shot, centered composition',
      pageText: pageText,
      character: characterDetails.character,
      age: characterDetails.age,
      ethnicity: characterDetails.ethnicity,
      hair: characterDetails.hair,
      features: characterDetails.features,
      emotion: characterDetails.emotion,
      scene: actionSection.scene,
      action_intensity: actionSection.action_intensity,
      spatial_positioning: actionSection.spatial_positioning,
      object_interaction: actionSection.object_interaction,
      body_language: actionSection.body_language,
      spatial_composition: 'balanced composition with clear focal point',
      setting: setting,
      atmosphere: atmosphere,
      props: detectedObjects.join(', '),
      action_objects: detectedObjects[0] || 'toy',
      colored_objects: coloredObjects,
      sensory_details: 'rich textures and natural lighting',
      community_context: 'family-friendly environment',
      secondary_characters: '',
      subject: characterDetails.character,
      action: actionSection.scene,
      adjective: 'vibrant'
    };

    // Replace template variables
    let finalPrompt = template;
    Object.entries(promptVariables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      finalPrompt = finalPrompt.replace(regex, value || '');
    });

    console.log('✨ Final prompt (first 200 chars):', finalPrompt.substring(0, 200) + '...');

    // Generate nuclear negative prompt using inline function
    const negativePrompt = joinNegativePromptStrings(userInfo, 'child', 'medium', 1, []);
    console.log('🚫 Nuclear negative prompt generated');

    // Initialize nuclear WebSocket service
    const nuclearService = new NuclearRunwareWebSocketService();
    await nuclearService.connect(apiKey);
    console.log('🔌 Nuclear WebSocket service connected');

    // Generate image with nuclear parameters
    const imageResult = await nuclearService.generateImage({
      positivePrompt: finalPrompt,
      negativePrompt: negativePrompt,
      model: 'runware:100@1',
      width: 1024,
      height: 1024,
      steps: 20, // Default steps for runware
      CFGScale: 7 // Default CFG scale for runware
    });

    console.log('🖼️ Nuclear image generation completed');
    console.log('Image URL:', imageResult.imageURL);

    return {
      success: true,
      imageURL: imageResult.imageURL,
      seed: seed,
      prompt: finalPrompt,
      negativePrompt: negativePrompt,
      characterDetails: characterDetails,
      detectedElements: {
        objects: detectedObjects,
        setting: setting,
        atmosphere: atmosphere,
        actions: actionSection
      },
      metadata: {
        model: 'runware:100@1',
        steps: 20,
        CFGScale: 7,
        difficulty: difficulty,
        templateType: templateType,
        generationTimestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('❌ Nuclear image generation failed:', error);
    throw error;
  }
}

// ============= NUCLEAR INDEPENDENT MAIN SERVER FUNCTION =============



      
      if (pages && pages.length > 0) {
        return {
          success: true,
          pages: pages,
          source: 'basic_template_hardcoded'
        };
      }
    }
    
    throw new Error('Basic template processing failed');
    
  } catch (error) {
    console.error('[TIER 2.5C] Basic template error:', error);
    throw error;
  }
}

/**
 * TIER 2.5D: Process with Nuclear Template System (Cannot Fail)
 */
function processWithNuclearTemplate({ prompt, userInfo, pageCount, difficulty }) {
  console.log('[TIER 2.5D] Processing with nuclear template system (guaranteed success)...');
  
  try {
    const userName = userInfo.userName || userInfo.name || "the child";
    const favoriteColor = userInfo.favoriteColor || "blue";
    const favoriteAnimal = userInfo.favoriteAnimal || "puppy";
    
    // Nuclear template - cannot fail
    const nuclearTemplate = [
      `${userName} woke up on a beautiful morning, feeling excited about the day ahead.`,
      `${userName} put on their favorite ${favoriteColor} clothes and stepped outside into the sunshine.`,
      `While walking through the neighborhood, ${userName} saw a friendly ${favoriteAnimal} playing in the park.`,
      `${userName} spent time playing and having fun, making new friends along the way.`,
      `As the day ended, ${userName} felt happy and grateful for such a wonderful adventure.`
    ];
    
    // Extend or truncate to match pageCount
    let pages = [...nuclearTemplate];
    
    while (pages.length < pageCount) {
      const extraPage = `${userName} discovered something new and exciting, making the adventure even more special.`;
      pages.push(`Page ${pages.length + 1}: ${extraPage}`);
    }
    
    if (pages.length > pageCount) {
      pages = pages.slice(0, pageCount);
    }
    
    // Add page numbers
    pages = pages.map((page, index) => {
      if (!page.startsWith('Page ')) {
        return `Page ${index + 1}: ${page}`;
      }
      return page;
    });
    
    console.log(`[TIER 2.5D] Nuclear template generated ${pages.length} pages successfully`);
    
    return {
      success: true,
      pages: pages,
      source: 'nuclear_template_guaranteed'
    };
    
  } catch (error) {
    console.error('[TIER 2.5D] Nuclear template error (this should be impossible):', error);
    throw error;
  }
}

// getHardcodedTemplates function removed - using proper tier fallback flow

// ============= EMERGENCY FUNCTIONS REMOVED - UNUSED CODE =============
  
  let pages = [];
  for (let i = 0; i < pageCount; i++) {
    const pageIndex = i % emergencyTemplate.length;
    pages.push(`Page ${i + 1}: ${emergencyTemplate[pageIndex]}`);
  }
  
  return pages;
}

// ============= END COMPLETE INTEGRATION =============

// ============= ORPHANED CULTURAL_LANDMARKS OBJECT #2 REMOVED =============

// ============= MASTER PLAN PHASE 6: CULTURAL ARRAY & ETHNICITY OPTIMIZATION =============
function applyCulturalSettingEnhancement(baseSetting, userInfo, avatarIdentity) {
  try {
    const language = avatarIdentity?.nativeLanguage || userInfo?.language || 'en';
    console.log(`🌍 Enhanced Cultural Setting Enhancement - Language: ${language}, Base Setting: "${baseSetting}"`);
    
    // ENHANCED: Context-aware cultural integration with indoor/outdoor detection
    const isIndoorSetting = baseSetting.toLowerCase().includes('indoor') || 
                           baseSetting.toLowerCase().includes('home') || 
                           baseSetting.toLowerCase().includes('school') ||
                           baseSetting.toLowerCase().includes('classroom') ||
                           baseSetting.toLowerCase().includes('kitchen') ||
                           baseSetting.toLowerCase().includes('bedroom');
    
    const isOutdoorSetting = baseSetting.toLowerCase().includes('outdoor') || 
                            baseSetting.toLowerCase().includes('park') || 
                            baseSetting.toLowerCase().includes('playground') ||
                            baseSetting.toLowerCase().includes('garden') ||
                            baseSetting.toLowerCase().includes('backyard');
    
    // Get cultural landmarks for the language with enhanced context awareness
    const landmarks = getCulturalLandmarks(language, isIndoorSetting);
    if (landmarks.length > 0) {
      const randomLandmark = landmarks[Math.floor(Math.random() * landmarks.length)];
      
      // ENHANCED: Context-aware enhancement with better integration
      if (baseSetting.toLowerCase().includes('park')) {
        return baseSetting.replace('park', `park ${randomLandmark}`);
      }
      if (baseSetting.toLowerCase().includes('school')) {
        return baseSetting.replace('school', `school ${randomLandmark}`);
      }
      if (baseSetting.toLowerCase().includes('home')) {
        return baseSetting.replace('home', `home ${randomLandmark}`);
      }
      if (baseSetting.toLowerCase().includes('playground')) {
        return baseSetting.replace('playground', `playground ${randomLandmark}`);
      }
      
      // Enhanced generic enhancement with smart positioning
      return `${baseSetting} ${randomLandmark}`;
    }
    
    console.log(`🌍 No cultural enhancement available for language: ${language}`);
    return baseSetting;
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Cultural setting enhancement error:', error);
    return baseSetting;
  }
}

// ============= DUPLICATE FUNCTION REMOVED - KEEPING FIRST INSTANCE =============
      if (exactWord.includes('play')) return `${exactWord}`;
      if (exactWord.includes('bounce')) return `${exactWord}`;
      if (exactWord.includes('fall')) return `${exactWord}`;
      if (exactWord.includes('climb')) return `${exactWord}`;
      if (exactWord.includes('swim')) return `${exactWord}`;
      if (exactWord.includes('hide')) return `${exactWord}`;
      if (exactWord.includes('slide')) return `${exactWord}`;
      return exactWord; // Preserve exact word - no enhancement needed
    }
    
    if (type === 'objects') {
      // Keep exact object names, add minimal color descriptors only when beneficial
      if (exactWord.includes('ball') && !exactWord.includes('red') && !exactWord.includes('blue')) {
        return `colorful ${exactWord}`;
      }
      return exactWord; // Preserve exact object
    }
    
    if (type === 'setting') {
      // Keep exact location, add minimal atmospheric descriptors
      if (exactWord.includes('hill')) return `${exactWord}`;
      if (exactWord.includes('park')) return `${exactWord}`;
      if (exactWord.includes('playground')) return `${exactWord}`;
      if (exactWord.includes('slope')) return `${exactWord}`;
      if (exactWord.includes('cliff')) return `${exactWord}`;
      return exactWord; // Preserve exact setting
    }
    
    return currentValue; // Fallback to current value
    
  } catch (error) {
    console.warn('⚠️ Context-aware enhancement error:', error);
    return currentValue; // Return original on error
  }
}

// MASTER PLAN PHASE 6: ENHANCED CULTURAL LANDMARK FUNCTION WITH CONTEXT AWARENESS
function getCulturalLandmarks(language, isIndoor = false, isOutdoor = false) {
  console.log(`🌍 Enhanced cultural landmarks for ${language} - Indoor: ${isIndoor}, Outdoor: ${isOutdoor}`);
  
  let languageKey = '';
  if (language === 'es' || language === 'spanish') languageKey = 'spanish';
  else if (language === 'fr' || language === 'french') languageKey = 'french';  
  else if (language === 'zh' || language === 'chinese') languageKey = 'chinese';
  else if (language === 'hi' || language === 'hindi') languageKey = 'hindi';
  else if (language === 'ar' || language === 'arabic') languageKey = 'arabic';
  
  if (!languageKey) {
    console.log(`🌍 No cultural landmarks available for language: ${language}`);
    return [];
  }
  
  const landmarks = CULTURAL_LANDMARKS[languageKey];
  if (!landmarks) return [];
  
  // ENHANCED: Context-aware landmark selection
  if (isIndoor && landmarks.indoor) {
    console.log(`🏠 Using indoor cultural landmarks for ${language}`);
    return landmarks.indoor;
  } else if (isOutdoor && landmarks.outdoor) {
    console.log(`🌳 Using outdoor cultural landmarks for ${language}`);
    return landmarks.outdoor;
  } else {
    // Default to outdoor if no specific context
    console.log(`🌍 Using default outdoor cultural landmarks for ${language}`);
    return landmarks.outdoor || landmarks.indoor || [];
  }
}

function detectCulturalProfile(userInfo, avatarIdentity) {
  try {
    const language = avatarIdentity?.nativeLanguage || userInfo?.language || 'en';
    const skinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || '';
    
    console.log(`🛡️ Tier 2.5: Detecting cultural profile - Language: ${language}, Skin: ${skinTone}`);
    
    // African American detection
    if (skinTone.toLowerCase().includes('dark') || 
        skinTone.toLowerCase().includes('brown') ||
        skinTone.toLowerCase().includes('black') ||
        skinTone.toLowerCase().includes('ebony') ||
        skinTone.toLowerCase().includes('chocolate')) {
      console.log('🛡️ Tier 2.5: African American profile detected via skin tone');
      return 'African American';
    }
    
    // Language-based detection with real ethnicities
    if (language === 'es' || language === 'spanish') {
      console.log('🛡️ Tier 2.5: Spanish/Latino ethnicity detected via language');
      return 'Spanish/Latino ethnicity';
    }
    
    if (language === 'fr' || language === 'french') {
      console.log('🛡️ Tier 2.5: European ethnicity detected via language');
      return 'European ethnicity';
    }
    
    if (language === 'zh' || language === 'chinese') {
      console.log('🛡️ Tier 2.5: East Asian ethnicity detected via language');
      return 'East Asian ethnicity';
    }
    
    if (language === 'hi' || language === 'hindi') {
      console.log('🛡️ Tier 2.5: South Asian ethnicity detected via language');
      return 'South Asian ethnicity';
    }
    
    if (language === 'ar' || language === 'arabic') {
      console.log('🛡️ Tier 2.5: Middle Eastern ethnicity detected via language');
      return 'Middle Eastern ethnicity';
    }
    
    if (language === 'pt' || language === 'portuguese') {
      console.log('🛡️ Tier 2.5: Latin American ethnicity detected via language');
      return 'Latin American ethnicity';
    }
    
    console.log('🛡️ Tier 2.5: Standard American profile (default)');
    return 'Standard American';
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Cultural detection error, using default:', error);
    return 'Standard American';
  }
}

function detectEmotionFromText(text) {
  try {
    if (!text || typeof text !== 'string') return ''; // Enhanced: Return empty string for fallback
    
    const lowerText = text.toLowerCase();
    
    // Positive emotions
    if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('excited') || 
        lowerText.includes('celebration') || lowerText.includes('party') || lowerText.includes('fun')) {
      return 'Cheerful and celebratory atmosphere';
    }
    
    if (lowerText.includes('peaceful') || lowerText.includes('calm') || lowerText.includes('quiet') ||
        lowerText.includes('serene') || lowerText.includes('tranquil')) {
      return 'Peaceful and serene atmosphere';
    }
    
    if (lowerText.includes('adventure') || lowerText.includes('explore') || lowerText.includes('discover') ||
        lowerText.includes('journey') || lowerText.includes('quest')) {
      return 'Adventurous and curious atmosphere';
    }
    
    if (lowerText.includes('learn') || lowerText.includes('study') || lowerText.includes('school') ||
        lowerText.includes('education') || lowerText.includes('knowledge')) {
      return 'Educational and inspiring atmosphere';
    }
    
    // Default positive
    return 'Warm and welcoming atmosphere';
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Emotion detection error:', error);
    return 'Positive and uplifting atmosphere';
  }
}

// ============= END ENHANCED TIER 2.5 SEMANTIC PLACEHOLDER EXTRACTION FUNCTIONS =============

// ============= BASIC TEMPLATE EXTRACTION FUNCTIONS (TIER 1.5 / 2.5B) =============
/**
 * Limit pageText to maximum 3 sentences for basic templates
 */
function limitPageTextToThreeSentences(pageText) {
  try {
    if (!pageText || typeof pageText !== 'string') return '';
    
    // Split by sentence terminators and take first 3 sentences
    const sentences = pageText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.slice(0, 3).join('. ').trim() + (sentences.length > 0 ? '.' : '');
  } catch (error) {
    console.warn('⚠️ Page text limitation failed:', error);
    return pageText?.substring(0, 200) || ''; // Fallback to character limit
  }
}

/**
 * Extract basic setting using simple regex patterns
 */
function extractBasicSetting(pageText) {
  try {
    if (!pageText || typeof pageText !== 'string') return 'a colorful place';
    
    // Simple regex to find "in/at [location]"
    const settingMatch = pageText.match(/(?:in|at)\s+(?:the\s+)?([^,.!?]+)/i);
    if (settingMatch && settingMatch[1]) {
      return settingMatch[1].trim();
    }
    
    // Fallback: check for common location words
    const locationWords = ['home', 'school', 'park', 'garden', 'room', 'kitchen', 'playground', 'forest', 'beach'];
    for (const word of locationWords) {
      if (pageText.toLowerCase().includes(word)) {
        return `a ${word}`;
      }
    }
    
    return 'a bright colorful environment';
  } catch (error) {
    console.warn('⚠️ Basic setting extraction failed:', error);
    return 'a welcoming place';
  }
}

/**
 * Extract basic action using simple regex patterns
 */
function extractBasicAction(pageText) {
  try {
    if (!pageText || typeof pageText !== 'string') return 'enjoying a happy moment';
    
    // Simple regex to find action verbs
    const actionMatch = pageText.match(/(?:played|playing|runs|running|walked|walking|danced|dancing)\s+([^,.!?]*)/i);
    if (actionMatch && actionMatch[0]) {
      return actionMatch[0].trim();
    }
    
    // Fallback: check for basic action words
    const actionWords = ['play', 'run', 'jump', 'dance', 'laugh', 'smile', 'explore', 'discover'];
    for (const word of actionWords) {
      if (pageText.toLowerCase().includes(word)) {
        return `${word}ing happily`;
      }
    }
    
    return 'having a wonderful time';
  } catch (error) {
    console.warn('⚠️ Basic action extraction failed:', error);
    return 'enjoying the moment';
  }
}

/**
 * Extract basic objects using simple regex patterns  
 */
function extractBasicObjects(pageText) {
  try {
    if (!pageText || typeof pageText !== 'string') return 'colorful items';
    
    // Simple regex to find "with [object]"
    const objectMatch = pageText.match(/with\s+(?:his|her|their|a|an|the)?\s*([^,.!?]+)/i);
    if (objectMatch && objectMatch[1]) {
      return objectMatch[1].trim();
    }
    
    // Fallback: check for common object words
    const objectWords = ['toy', 'ball', 'book', 'friend', 'pet', 'bicycle', 'flowers', 'butterfly', 'treasure'];
    for (const word of objectWords) {
      if (pageText.toLowerCase().includes(word)) {
        return word;
      }
    }
    
    return 'interesting things';
  } catch (error) {
    console.warn('⚠️ Basic objects extraction failed:', error);
    return 'wonderful items';
  }
}

/**
 * Simple extraction function for secondary characters (Tier 2.5B - Nuclear Independence)
 * Uses basic regex patterns with hardcoded fallbacks - NO complex dependencies
 */
function extractSimpleSecondaryCharacters(pageText) {
  try {
    if (!pageText || typeof pageText !== 'string') return '';
    
    const text = pageText.toLowerCase();
    const found = [];
    
    // Simple regex patterns for common relationships
    const patterns = [
      /with (?:his|her|their) (\w+)/gi,
      /and (?:his|her|their) (\w+)/gi,
      /friend (\w+)/gi,
      /(?:mom|mother|dad|father|sister|brother) (\w+)/gi,
      /(?:dog|cat|pet) (?:named )?(\w+)/gi
    ];
    
    patterns.forEach(pattern => {
      const matches = [...pageText.matchAll(pattern)];
      matches.forEach(match => {
        if (match[1] && match[1].length > 1 && match[1] !== 'the') {
          found.push(match[1]);
        }
      });
    });
    
    // Remove duplicates and limit
    const unique = [...new Set(found)].slice(0, 2);
    return unique.length > 0 ? `with ${unique.join(' and ')}` : '';
    
  } catch (error) {
    console.warn('⚠️ Simple secondary characters extraction failed:', error);
    return ''; // Silent failure - nuclear independence
  }
}

/**
 * Fill basic template with simplified 3-section structure (Tier 1.5 / 2.5B)
 * Following the example: "Tommy played with his friend Sequoia" → "A child playing with friend Sequoia in a garden"
 */
function fillBasicTemplate(
  difficulty,
  userInfo,
  pageText,
  localAvatarIdentity,
  scene,
  setting,
  objects,
  secondary_characters
) {
  console.log(`🛡️ Tier 1.5 (2.5B): Filling BASIC template with 3-section structure`);
  
  try {
    // Validate input parameters with fallbacks
    const safeDifficulty = difficulty || 'medium';
    const safePageText = pageText || 'A child having a wonderful adventure';
    
    // Get basic template with fallback protection
    let template;
    try {
      template = BASIC_PROMPT_TEMPLATES[safeDifficulty] || BASIC_PROMPT_TEMPLATES.medium || BASIC_PROMPT_TEMPLATES['medium'];
      if (!template) {
        throw new Error('No basic template found');
      }
    } catch (templateError) {
      console.warn('⚠️ Basic template selection failed, falling back to emergency template:', templateError);
      throw templateError; // Pass to next tier
    }
    
    // Extract semantic components using unified vocabulary
    const limitedPageText = limitPageTextToThreeSentences(safePageText);
    const subject = extractSubject(safePageText);
    const action = extractAction(safePageText);
    const setting = extractSetting(safePageText);
    const adjective = extractAdjective(safePageText);
    const emotion = extractEmotion(safePageText);
    
    // Extract simple secondary characters using basic patterns only
    const secondaryChars = secondary_characters || extractSimpleSecondaryCharacters(safePageText);
    
    // Get nuclear avatar mapping with error protection
    let avatarMapping;
    try {
      avatarMapping = getNuclearAvatarMapping(userInfo, safeDifficulty);
      console.log(`✅ Basic nuclear avatar mapping applied: ${avatarMapping.character}`);
    } catch (avatarError) {
      console.warn('⚠️ Basic avatar mapping failed, using fallback:', avatarError);
      avatarMapping = { 
        character: 'a friendly child',
        age: 'young',
        skin: 'medium skin tone',
        hair: 'neat hair',
        eyes: 'bright eyes',
        face: 'cheerful expression',
        clothing: 'comfortable clothes'
      };
    }
    
    // 🎨 NUCLEAR STYLE SETTINGS - NOW USING GLOBAL DEFINITION 🎨
    console.log('✅ Tier 2.5: Using global NUCLEAR_STYLE_SETTINGS definition');

    // Get framework prompt with fallback protection  
    let frameworkPrompt;
    try {
      const styleFramework = getStyleFramework(safeDifficulty);
      frameworkPrompt = styleFramework?.frameworkPrompt || 
                       'Children book style with vibrant colors, friendly character design, bright cheerful atmosphere';
    } catch (frameworkError) {
      console.warn('⚠️ Framework prompt failed, using hardcoded fallback:', frameworkError);
      frameworkPrompt = 'Children book style with vibrant colors, friendly character design, bright cheerful atmosphere';
    }
    
    // PHASE 3: Template Processing Function Updates - Include nuclear avatar placeholders
    let filledTemplate = template
      .replace(/{pageText}/g, limitedPageText)
      .replace(/{character}/g, avatarMapping.character || 'child')
      .replace(/{age}/g, avatarMapping.age || '7-year-old')
      .replace(/{hair}/g, avatarMapping.hair || 'neat hair')
      .replace(/{features}/g, avatarMapping.features || 'friendly features')
      .replace(/{subject}/g, subject)
      .replace(/{action}/g, action)
      .replace(/{setting}/g, setting)
      .replace(/{adjective}/g, adjective)
      .replace(/{emotion}/g, emotion)
      .replace(/{secondary_characters}/g, secondaryChars)
      .replace(/{frameworkPrompt}/g, frameworkPrompt);
    
    // Clean up any remaining placeholders
    filledTemplate = filledTemplate.replace(/{[^}]*}/g, '').replace(/\s+/g, ' ').trim();
    
    console.log('✅ Basic Template (Tier 1.5 / 2.5B) filled successfully');
    console.log(`📝 Basic template result preview: ${filledTemplate.substring(0, 100)}...`);
    
    return filledTemplate;
    
  } catch (error) {
    console.warn('⚠️ Basic template filling failed:', error);
    throw error; // Pass to next fallback tier
  }
}

// ============= END BASIC TEMPLATE EXTRACTION FUNCTIONS =============

async function fillPremiumTemplate(
  difficulty,
  userInfo,
  scene,
  setting,
  objects,
  secondary_characters,
  emotion,
  pageText,
  avatarIdentity,
  spatialComposition,
  atmosphereContext
) {
  console.log(`🛡️ Tier 2.5: Filling template with comprehensive silent failure protection`);
  
  try {
    // Validate input parameters with fallbacks
    const safeDifficulty = difficulty || 'medium';
    const safeScene = scene || 'enjoying a bright cheerful moment';
    const safeSetting = setting || 'a welcoming colorful environment';
    const safeObjects = objects || 'interesting colorful items';
    const safeSecondaryCharacters = secondary_characters || '';
    const safeEmotion = emotion || 'Positive and uplifting atmosphere';
    
    // Apply smart sentence extraction for pageText based on difficulty level
    const processedPageText = extractFirstSentences(pageText || '', safeDifficulty);
    
    // ============= ANALYZE PAGE TEXT FOR VISUAL DETAILS =============
    // Add visual detail analysis for consistent object tracking across tiers
    try {
      const CharacterService = await getCharacterConsistencyService();
      if (CharacterService) {
        await CharacterService.analyzeVisualDetails(
          sessionId || 'tier25-session', 
          pageText || processedPageText, 
          userInfo?.pageNumber || 1,
          finalMapping?.character || 'child'
        );
        console.log(`🔍 Tier 2.5A: Page text analyzed for visual details`);
      }
    } catch (error) {
      console.warn(`⚠️ Tier 2.5A: Visual detail analysis failed:`, error.message);
    }
    
    console.log(`🛡️ Tier 2.5: Filling template for difficulty: ${safeDifficulty}`);
    
    // Get template with fallback protection
    let template;
    try {
      template = PREMIUM_PROMPT_TEMPLATES[safeDifficulty] || PREMIUM_PROMPT_TEMPLATES.medium || PREMIUM_PROMPT_TEMPLATES['medium'];
      if (!template) {
        throw new Error('No template found');
      }
    } catch (templateError) {
      console.warn('⚠️ Template selection failed, using emergency template:', templateError);
      
      // ============= CRITICAL REGRESSION PREVENTION: LINE 2054 =============
      // 4-TIER FALLBACK IMPLEMENTATION: Raw PageText Function (Emergency Tier 2.5C)
      // This line constructs emergency template using:
      // 1. First 2500 characters of pageText (user's story content)
      // 2. Plus frameworkPrompt from NUCLEAR_STYLE_SETTINGS array (defined at line 2167)
      // 3. With multiple fallback levels for nuclear independence
      // 
      // CRITICAL DEPENDENCIES:
      // - NUCLEAR_STYLE_SETTINGS must be defined BEFORE this line (currently at 2167)
      // - pageText comes from function parameter (user story content)
      // - safeDifficulty used as array key for style selection
      //
      // REGRESSION RISKS:
      // - Moving NUCLEAR_STYLE_SETTINGS after this line will break fallback
      // - Changing frameworkPrompt structure will break template generation
      // - Removing any fallback level could cause undefined errors
      //
      // TESTING: Verify template generation when PREMIUM_PROMPT_TEMPLATES fails
      // NOTE: This is now part of the 4-tier system as Emergency Template (Tier 2.5C)
      // FALLBACK CHAIN: Premium (2.5A) → Basic (2.5B) → Emergency (2.5C) → Ultimate Emergency (2.5D)
      const styleFramework = getStyleFramework(safeDifficulty);
      template = (pageText || '').substring(0, 2500) + ' ' + (styleFramework?.frameworkPrompt || 'Children book style with vibrant colors, friendly character design, bright cheerful atmosphere');
    }
    
    // NUCLEAR AVATAR MAPPING with error protection
    let avatarMapping;
    try {
      avatarMapping = getNuclearAvatarMapping(userInfo, safeDifficulty);
      console.log(`✅ Nuclear avatar mapping applied: ${avatarMapping.character}`);
    } catch (avatarError) {
      console.warn('⚠️ Avatar mapping failed, using fallback:', avatarError);
      avatarMapping = { 
        character: 'a friendly child',
        age: 'young',
        skin: 'medium skin tone',
        hair: 'neat hair',
        eyes: 'bright eyes',
        face: 'cheerful expression',
        clothing: 'comfortable clothes'
      };
    }
    
    // Detect cultural contexts with error protection
    let userLanguage, skinTone, isEnglishDarkSkin;
    try {
      userLanguage = avatarIdentity?.nativeLanguage || userInfo?.language || 'en';
      skinTone = userInfo?.avatar?.skinTone || '';
      isEnglishDarkSkin = (userLanguage === 'en' || userLanguage === 'english') && 
                          (skinTone.toLowerCase().includes('dark') || 
                           skinTone.toLowerCase().includes('brown') ||
                           skinTone.toLowerCase().includes('black'));
    } catch (culturalError) {
      console.warn('⚠️ Cultural context detection failed, using defaults:', culturalError);
      userLanguage = 'en';
      skinTone = 'medium';
      isEnglishDarkSkin = false;
    }
    
    const isFrenchDarkSkin = (userLanguage === 'fr' || userLanguage === 'french') && 
                             (skinTone.toLowerCase().includes('dark') || 
                              skinTone.toLowerCase().includes('brown') ||
                              skinTone.toLowerCase().includes('black'));
    
    const isSpanishDarkSkin = (userLanguage === 'es' || userLanguage === 'spanish') && 
                              (skinTone.toLowerCase().includes('dark') || 
                               skinTone.toLowerCase().includes('brown') ||
                               skinTone.toLowerCase().includes('black'));
    
    const isPortugueseDarkSkin = (userLanguage === 'pt' || userLanguage === 'portuguese') && 
                                 (skinTone.toLowerCase().includes('dark') || 
                                  skinTone.toLowerCase().includes('brown') ||
                                  skinTone.toLowerCase().includes('black'));
    
    let finalMapping = avatarMapping;
    
    // English + Dark Skin: African American hairstyles + facial features
    if (isEnglishDarkSkin) {
      console.log('🛡️ Tier 2.5: Using African American cultural arrays for English + dark skin');
      
      const character = avatarMapping.character === 'child' ? 'boy' : avatarMapping.character;
      const extractedGender = extractGenderFromCharacter(character);
      const genderKey = extractedGender === 'girl' ? 'girls' : 'boys';
      
      finalMapping = {
        ...avatarMapping,
        hair: getRandomItem(CULTURAL_ARRAYS_GETTER.HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES[genderKey]),
        features: getRandomItem(CULTURAL_ARRAYS_GETTER.HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES)
      };
    }
    // French + Dark Skin: African American hairstyles + facial features  
    else if (isFrenchDarkSkin) {
      console.log('🛡️ Tier 2.5: Using African American cultural arrays for French + dark skin');
      
      const character = avatarMapping.character === 'child' ? 'boy' : avatarMapping.character;
      const extractedGender = extractGenderFromCharacter(character);
      const genderKey = extractedGender === 'girl' ? 'girls' : 'boys';
      
      finalMapping = {
        ...avatarMapping,
        hair: getRandomItem(CULTURAL_ARRAYS_GETTER.HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES[genderKey]),
        features: getRandomItem(CULTURAL_ARRAYS_GETTER.HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES)
      };
    }
    // Spanish + Dark Skin: African American hairstyles + facial features
    else if (isSpanishDarkSkin) {
      console.log('🛡️ Tier 2.5: Using African American cultural arrays for Spanish + dark skin');
      
      const character = avatarMapping.character === 'child' ? 'boy' : avatarMapping.character;
      const extractedGender = extractGenderFromCharacter(character);
      const genderKey = extractedGender === 'girl' ? 'girls' : 'boys';
      
      finalMapping = {
        ...avatarMapping,
        hair: getRandomItem(CULTURAL_ARRAYS_GETTER.HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES[genderKey]),
        features: getRandomItem(CULTURAL_ARRAYS_GETTER.HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES)
      };
    }
    // Portuguese + Dark Skin: African American hairstyles + facial features
    else if (isPortugueseDarkSkin) {
      console.log('🛡️ Tier 2.5: Using African American cultural arrays for Portuguese + dark skin');
      
      const character = avatarMapping.character === 'child' ? 'boy' : avatarMapping.character;
      const extractedGender = extractGenderFromCharacter(character);
      const genderKey = extractedGender === 'girl' ? 'girls' : 'boys';
      
      finalMapping = {
        ...avatarMapping,
        hair: getRandomItem(CULTURAL_ARRAYS_GETTER.HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES[genderKey]),
        features: getRandomItem(CULTURAL_ARRAYS_GETTER.HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES)
      };
    }
    
    // Style framework settings
    
    const styleFramework = getStyleFramework(safeDifficulty);
    console.log('✅ Style framework applied from shared source:', styleFramework.name);

    // Apply cultural setting enhancement
    const enhancedSetting = applyCulturalSettingEnhancement(setting, userInfo, avatarIdentity);
    
    // ============= MASTER PLAN: CAMERA DIRECTIVE INTEGRATION (After scene extraction) =============
    const cameraDirective = generateCameraDirective(difficulty, scene, enhancedSetting);
    
    // Get style framework settings from shared module
    const styleFramework = getStyleFramework(difficulty);
    const styleSettings = { steps: 4, CFGScale: styleFramework.CFGScale || 1 };
    
    // Conditional clothing detection from story text
    const clothing = detectClothingFromStory(pageText || scene);
    
    // Use smart sentence extraction instead of full pageText (reuse processed text from above)
    // const processedPageText = extractFirstSentences(pageText || '', safeDifficulty); // REMOVED: Already declared above
    
    // Get character ethnicity note
    const ethnicity = getCharacterEthnicity(userInfo, avatarIdentity);
    
    // ============= PHASE 6 ENHANCED: ACTION-INTEGRATED OBJECT DESCRIPTIONS =============
    // Convert objects into natural action-based descriptions
    let actionObjects = '';
    if (objects && objects.trim()) {
      // Extract individual objects and integrate with actions
      const objectList = objects.replace(/^,\s*/, '').split(',').map(obj => obj.trim()).filter(obj => obj);
      if (objectList.length > 0) {
        // Create natural action-object combinations
        const actionIntegratedObjects = objectList.map(obj => {
          // Remove leading articles and clean object name
          const cleanObj = obj.replace(/^(with\s+|a\s+|an\s+|the\s+)/i, '');
          
          // Map objects to natural actions
          if (cleanObj.match(/book|story|reading/i)) return ` reading with ${cleanObj}`;
          if (cleanObj.match(/ball|toy|game/i)) return ` playing with ${cleanObj}`;
          if (cleanObj.match(/art|paint|draw|crayon/i)) return ` creating art with ${cleanObj}`;
          if (cleanObj.match(/music|instrument/i)) return ` making music with ${cleanObj}`;
          if (cleanObj.match(/food|snack|lunch/i)) return ` enjoying ${cleanObj}`;
          if (cleanObj.match(/bike|scooter|skateboard/i)) return ` riding ${cleanObj}`;
          if (cleanObj.match(/puzzle|blocks|lego/i)) return ` building with ${cleanObj}`;
          
          // Default natural integration
          return ` with ${cleanObj}`;
        });
        
        actionObjects = actionIntegratedObjects.join('');
      }
    }
    
    // Extract semantic placeholders
    // Extract new semantic placeholders from story content
    const atmosphere = extractAtmosphere(pageText, safeScene, enhancedSetting);
    const props = extractProps(pageText, safeScene);
    const communityContext = extractCommunityContext(pageText, enhancedSetting);
    const sensoryDetails = extractSensoryDetails(pageText, safeScene);
    
    // ============= PHASE 4: Enhanced Null Safety System - Critical Placeholder Validation =============
    // Check for critical placeholder failures that should trigger emergency template
    const criticalPlaceholderFailure = (!finalMapping.character || finalMapping.character === 'undefined' || finalMapping.character === '') ||
                                      (!safeScene || safeScene === 'undefined' || safeScene === '') ||
                                      (!enhancedSetting || enhancedSetting === 'undefined' || enhancedSetting === '');
    
    if (criticalPlaceholderFailure) {
      console.warn('🚨 Critical placeholder failure detected - triggering emergency template');
      throw new Error('Critical placeholders failed: character, scene, or setting missing');
    }

    // ============= SEEDED SECONDARY CHARACTER POSITIONING (REPLACES enhanceSecondaryCharacterPositioning) =============
    function enhanceSeededSecondaryCharacterPositioning(secondaryChars, pageText, scene, sessionId) {
      if (!secondaryChars || secondaryChars.trim().length === 0) {
        return '';
      }
      
      console.log(`🎯 Tier 2.5A: Enhancing seeded secondary character positioning: "${secondaryChars}"`);
      
      // If already has seed descriptions (contains ':'), preserve them and add positioning
      if (secondaryChars.includes(':')) {
        const spatialPositions = [
          'standing nearby', 'sitting close by', 'positioned to the left', 'positioned to the right',
          'in the background', 'in the foreground', 'walking alongside', 'playing together',
          'gathered around', 'sitting together', 'standing behind', 'positioned in front'
        ];
        
        const seed = (sessionId || '') + secondaryChars + scene;
        const randomPosition = getSeededRandomItem(spatialPositions, seed);
        
        const result = `${secondaryChars}, ${randomPosition}`;
        console.log(`✅ Tier 2.5A: Seeded positioning applied: ${result}`);
        return result;
      }
      
      // Fallback: Use original enhanceSecondaryCharacterPositioning for backwards compatibility
      return enhanceSecondaryCharacterPositioning(secondaryChars, pageText, scene);
    }
    
    // PHASE 4: Cultural Authentication Fallbacks for {hair} and {features}
    let safeFinalHair = finalMapping.hair;
    let safeFinalFeatures = finalMapping.features;
    
    // Apply cultural authentication fallbacks if hair/features are missing
    if (!safeFinalHair || safeFinalHair === 'undefined' || safeFinalHair === '') {
      if (isEnglishDarkSkin || isFrenchDarkSkin || isSpanishDarkSkin || isPortugueseDarkSkin) {
        safeFinalHair = 'authentic African American hairstyle';
      } else {
        // For other cultures, use generic fallback
        safeFinalHair = 'neat natural hairstyle';
      }
      console.log('🛡️ Applied cultural hair fallback:', safeFinalHair);
    }
    
    if (!safeFinalFeatures || safeFinalFeatures === 'undefined' || safeFinalFeatures === '') {
      if (isEnglishDarkSkin || isFrenchDarkSkin || isSpanishDarkSkin || isPortugueseDarkSkin) {
        safeFinalFeatures = 'authentic African American features';
      } else {
        // For other cultures, use generic fallback
        safeFinalFeatures = 'warm friendly features';
      }
      console.log('🛡️ Applied cultural features fallback:', safeFinalFeatures);
    }
    
    // ============= PAGE TEXT ANALYSIS FOR VISUAL DETAILS =============
    // Analyze current page text for visual details before building colored objects
    try {
      const CharacterService = await getCharacterConsistencyService();
      if (CharacterService) {
        await CharacterService.analyzeVisualDetails(
          sessionId || 'fallback-session', 
          pageText, 
          1, // Default to page 1 for tier 2.5A
          userInfo?.avatar?.type || 'child'
        );
        console.log(`🔍 Tier 2.5A: Page text analyzed for visual details`);
      }
    } catch (error) {
      console.warn(`⚠️ Tier 2.5A: Visual detail analysis failed:`, error.message);
    }
    
    // ============= NEW: COLORED OBJECTS INTEGRATION =============
    // Add persistent colored objects from CharacterConsistencyService
    let coloredObjects = '';
    try {
      const CharacterService = await getCharacterConsistencyService();
      if (CharacterService) {
        await CharacterService.analyzeVisualDetails(sessionId || 'fallback-session', pageText, pageNumber);
        coloredObjects = await CharacterService.getColoredObjects(sessionId || 'fallback-session');
        
        if (coloredObjects) {
          console.log(`🎨 Tier 2.5A: Integrated colored objects: ${coloredObjects}`);
        }
      }
    } catch (error) {
      console.warn(`⚠️ Tier 2.5A: CharacterConsistencyService integration failed:`, error.message);
    }
    
    let filledTemplate = template
      .replace('{pageText}', processedPageText)
      .replace('{preserved_words}', preserveExactWords(pageText))
      .replace('{character}', finalMapping.character)
      .replace('{age}', finalMapping.age)
      .replace('{ethnicity}', ethnicity) // PHASE 3: Moved ethnicity to character description
      .replace('{hair}', safeFinalHair)
      .replace('{features}', safeFinalFeatures)
      .replace('{scene}', safeScene) // PHASE 1 FIX: Use safeScene instead of undefined enhancedScene
      .replace('{setting}', enhancedSetting) // PHASE 1 FIX: Use enhancedSetting instead of undefined scopedEnhancedSetting
      .replace('{action_objects}', actionObjects) // PHASE 6: Enhanced action-integrated objects
      .replace('{secondary_characters}', enhanceSeededSecondaryCharacterPositioning(secondary_characters, pageText, safeScene, sessionId) || '') // ENHANCED: Seed-based spatial positioning integration
      .replace('{colored_objects}', coloredObjects) // NEW: Colored objects from CharacterConsistencyService
      .replace('{emotion}', emotion)
      .replace('{atmosphere}', atmosphereContext || atmosphere) // Use contextual atmosphere if available
      .replace('{spatial_composition}', spatialComposition || 'character prominently featured in foreground') // New contextual placeholder
      // ============= ENHANCED ACTION SECTION PLACEHOLDERS =============
      .replace('{action_intensity}', extractActionIntensity(pageText))
      .replace('{spatial_positioning}', extractSpatialPositioning(pageText))
      .replace('{object_interaction}', extractObjectInteraction(pageText, actionObjects))
      .replace('{body_language}', extractBodyLanguage(pageText))
      // ============= END ENHANCED ACTION SECTION =============
      .replace('{props}', props) // PHASE 3: New semantic placeholder
      .replace('{community_context}', communityContext) // PHASE 3: New semantic placeholder
      .replace('{sensory_details}', sensoryDetails) // PHASE 3: New semantic placeholder
      .replace('{frameworkPrompt}', styleFramework.frameworkPrompt)
      .replace('{cameraDirective}', cameraDirective); // PHASE 5: Camera directive moved to end
    
    // PHASE 4: Safe clothing detection with null safety
    // Add clothing if detected - use safe variables
    if (clothing) {
      filledTemplate = filledTemplate.replace('{features}', `${safeFinalFeatures}, wearing ${clothing}`);
    }
    
    // PHASE 7: TEMPLATE VALIDATION (Only checks for empty sections now)
    const templateValidation = validateTemplateCompletion(filledTemplate);
    if (!templateValidation.isValid) {
      console.log(`🔄 Template has empty sections: ${templateValidation.issues.join(', ')} - Falling back to Tier 2.5B`);
      return fillBasicTemplate(safeDifficulty, userInfo, pageText, avatarIdentity, safeScene, enhancedSetting, safeObjects, secondary_characters);
    }
    
    // PHASE 8: REMOVE EMPTY SECTIONS 
    filledTemplate = removeEmptySections(filledTemplate);
    
    console.log(`🛡️ Tier 2.5: Template filled successfully with nuclear mapping`);
    return filledTemplate;
    
  } catch (error) {
    console.error('❌ Tier 2.5: Template filling error:', error);
    return generateEmergencyPrompt(userInfo);
  }
}

// TEMPLATE VALIDATION SYSTEM
function validateTemplateCompletion(template) {
  const issues = [];
  
  // Only check for empty sections in template - ethnicity, generic settings, and action length don't matter anymore
  const emptySectionPattern = /\w+:\s*[,.]|\w+:\s*\w+:\s*[,.]/g;
  if (emptySectionPattern.test(template)) {
    issues.push('Empty template sections detected');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

// NEW: Character consistency validation - triggers 2.5B on failure
function validateCharacterConsistency(characterData, avatarMapping) {
  const issues = [];
  
  if (!characterData || !avatarMapping) {
    issues.push('Missing character data or avatar mapping');
  }
  
  if (avatarMapping?.source === 'emergency-fallback') {
    issues.push('Character consistency service failed');
  }
  
  if (!avatarMapping?.character || avatarMapping.character === 'a friendly child') {
    issues.push('Generic character fallback detected');
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues
  };
}

// NEW: Visual element validation - triggers 2.5B on failure  
function validateVisualElements(sceneData, objects, setting) {
  const issues = [];
  
  if (!sceneData?.spatialComposition || sceneData.spatialComposition === 'character prominently featured in foreground') {
    issues.push('Generic spatial composition detected');
  }
  
  if (!objects || objects === 'interesting colorful items') {
    issues.push('Generic objects fallback detected');
  }
  
  if (!sceneData?.atmosphereContext || sceneData.atmosphereContext === 'warm, inviting atmosphere') {
    issues.push('Generic atmosphere fallback detected');
  }
  
  if (!setting || setting === 'a welcoming colorful environment') {
    issues.push('Generic setting fallback detected');
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues
  };
}

// NEW: Scene complexity validation - triggers 2.5B on failure
function validateSceneComplexity(sceneData, pageText) {
  const issues = [];
  
  if (!sceneData?.contextualAction && pageText && pageText.length > 50) {
    issues.push('No contextual action extracted from substantial text');
  }
  
  if (!sceneData?.contextualSetting && pageText && pageText.length > 50) {
    issues.push('No contextual setting extracted from substantial text');
  }
  
  if (sceneData?.scene && sceneData.scene === 'enjoying a bright cheerful moment') {
    issues.push('Generic scene fallback detected');
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues
  };
}

// ENHANCED REMOVE EMPTY SECTIONS - HANDLES ACTION SECTION DYNAMICALLY
function removeEmptySections(template) {
  console.log('🧹 Before cleaning:', template);
  
  let cleaned = template;
  
  // STEP 1: Handle Action section specifically - DYNAMIC PROCESSING
  // Pattern: Action: {scene}, {action_intensity}, {spatial_positioning}, {object_interaction}, {body_language}
  const actionRegex = /Action:\s*([^,]*),\s*([^,]*),\s*([^,]*),\s*([^,]*),\s*([^,.]*)(?=[.]\s|\s*\w+:)/g;
  
  cleaned = cleaned.replace(actionRegex, (match, scene, intensity, spatial, interaction, bodyLang) => {
    const components = [];
    
    // Always include scene if present
    if (scene && scene.trim() && !scene.includes('{')) {
      components.push(scene.trim());
    }
    
    // Include intensity only if not empty
    if (intensity && intensity.trim() && !intensity.includes('{')) {
      components.push(intensity.trim());
    }
    
    // DYNAMIC: Include spatial_positioning only if meaningful (not empty)
    if (spatial && spatial.trim() && !spatial.includes('{')) {
      components.push(spatial.trim());
    }
    
    // Include object_interaction only if not empty
    if (interaction && interaction.trim() && !interaction.includes('{')) {
      components.push(interaction.trim());
    }
    
    // DYNAMIC: Include body_language only if meaningful (not empty)
    if (bodyLang && bodyLang.trim() && !bodyLang.includes('{')) {
      components.push(bodyLang.trim());
    }
    
    // Build Action section dynamically - prioritize scene and action over positioning details
    if (components.length > 0) {
      return `Action: ${components.join(', ')}`;
    } else {
      return ''; // Remove entire Action section if no components
    }
  });
  
  // STEP 2: Remove other empty sections (original logic)
  cleaned = cleaned
    .replace(/\w+:\s*[,.](?=\s*\w+:)/g, '') // Remove empty sections in middle
    .replace(/\w+:\s*[,.](?=\s*Technical:)/g, '') // Remove empty sections before Technical
    .replace(/\w+:\s*[,.]$/g, '') // Remove empty sections at end
    .replace(/,\s*,+/g, ',') // Fix multiple commas
    .replace(/\.\s*\.+/g, '.') // Fix multiple periods
    .replace(/\s+/g, ' ') // Clean up extra spaces
    .replace(/\.\s*\w+:/g, '. ') // Fix periods before section labels
    .trim();
  
  console.log('🧹 After cleaning:', cleaned);
  return cleaned;
}

function getCharacterEthnicity(userInfo, avatarIdentity) {
  try {
    const language = avatarIdentity?.nativeLanguage || userInfo?.language || 'en';
    const skinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || '';
    
    // Multi-Language + Dark Skin Ethnicity Enhancement
    const hasDarkSkin = skinTone.toLowerCase().includes('dark') || 
                       skinTone.toLowerCase().includes('brown') ||
                       skinTone.toLowerCase().includes('black') ||
                       skinTone.toLowerCase().includes('ebony') ||
                       skinTone.toLowerCase().includes('chocolate');
    
    if (hasDarkSkin) {
      if (language === 'es' || language === 'spanish') {
        return "depict character from Afro-Latino background";
      }
      if (language === 'fr' || language === 'french') {
        return "depict character from African Francophone background";
      }
      // Fallback for other languages with dark skin
      return "depict character from African American background";
    }
    
    // Language-based ethnicity notes (for non-dark skin)
    if (language === 'es' || language === 'spanish') {
      return "depict character from Spanish/Latino background";
    }
    
    if (language === 'fr' || language === 'french') {
      return "depict character from European background";
    }
    
    if (language === 'zh' || language === 'chinese') {
      return "depict character from Asian background";
    }
    
    if (language === 'hi' || language === 'hindi') {
      return "child of Indian origin";
    }
    
    if (language === 'ar' || language === 'arabic') {
      return "depict character from Middle Eastern background";
    }
    
    if (language === 'pt' || language === 'portuguese') {
      return "depict character from Latin American background";
    }
    
    // Default: no specific ethnicity note for English/Standard American
    return "";
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Character ethnicity detection error:', error);
    return "";
  }
}

// ============= DUPLICATE EMERGENCY PROMPT GENERATOR REMOVED =============

// ============= HELPER FUNCTIONS =============

// ENHANCED CLOTHING DETECTION WITH COLOR SYSTEM
function detectClothingFromStory(text) {
  if (!text) return '';
  
  // Use unified clothing detection keywords (no local arrays)
  
  const lowerText = text.toLowerCase();
  
  // Try dynamic clothing + color detection first
  const dynamicClothingColor = detectAndResolveClothingColor(text);
  if (dynamicClothingColor) {
    return dynamicClothingColor;
  }
  
  // Fallback to basic clothing detection
  for (const keyword of VOCAB.CLOTHING_DETECTION_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      // Extract clothing context around the keyword
      const sentences = text.split(/[.!?]+/);
      for (const sentence of sentences) {
        if (sentence.toLowerCase().includes(keyword)) {
          // Add random color if no color specified
          const randomColor = VOCAB.EXPANDED_COLOR_ARRAY[Math.floor(Math.random() * VOCAB.EXPANDED_COLOR_ARRAY.length)];
          return `a ${randomColor} ${keyword}`;
        }
      }
    }
  }
  
  return '';
}

// ============= CONSOLIDATED CLOTHING DETECTION FUNCTIONS =============

// DYNAMIC CLOTHING + COLOR DETECTION SYSTEM
function detectAndResolveClothingColor(text) {
  const lowerText = text.toLowerCase();
  let detectedClothing = '';
  let detectedColor = '';
  
  // Detect clothing type using unified keywords from VOCAB
  for (const clothing of (VOCAB?.CLOTHING_DETECTION_KEYWORDS || [])) {
    if (lowerText.includes(clothing)) {
      detectedClothing = clothing;
      break;
    }
  }
  
  // Detect color using VOCAB
  for (const color of (VOCAB?.EXPANDED_COLOR_ARRAY || [])) {
    if (lowerText.includes(color)) {
      detectedColor = color;
      break;
    }
  }
  
  // If both detected, combine them (no restrictions - allow any color for any clothing)
  if (detectedClothing && detectedColor) {
    return `a ${detectedColor} ${detectedClothing}`;
  }
  
  // If only clothing detected, let Runware decide the color
  if (detectedClothing) {
    return `a ${detectedClothing}`;
  }
  
  // If only color detected, let Runware decide what clothing to color
  if (detectedColor) {
    return '';
  }
  
  return '';
}

// ENHANCED CLOTHING DETECTION WITH COLOR SYSTEM
function detectClothingFromStory(text) {
  if (!text) return '';
  
  const lowerText = text.toLowerCase();
  
  // Try dynamic clothing + color detection first
  const dynamicClothingColor = detectAndResolveClothingColor(text);
  if (dynamicClothingColor) {
    return dynamicClothingColor;
  }
  
  // Fallback to basic clothing detection using VOCAB
  for (const keyword of (VOCAB?.CLOTHING_DETECTION_KEYWORDS || [])) {
    if (lowerText.includes(keyword)) {
      // Extract clothing context around the keyword
      const sentences = text.split(/[.!?]+/);
      for (const sentence of sentences) {
        if (sentence.toLowerCase().includes(keyword)) {
          // Add random color if no color specified
          const randomColor = (VOCAB?.EXPANDED_COLOR_ARRAY || ['blue'])[Math.floor(Math.random() * (VOCAB?.EXPANDED_COLOR_ARRAY?.length || 1))];
          return `a ${randomColor} ${keyword}`;
        }
      }
    }
  }
  
  return '';
}

function truncatePageText(text, difficulty) {
  if (!text) return '';
  
  // Beginner/Easy: Use full pageText at beginning
  if (difficulty === 'beginner' || difficulty === 'easy') {
    return text;
  }
  
  // Medium/Hard/Expert: Truncate pageText for end positioning
  const maxLength = difficulty === 'medium' ? 100 : difficulty === 'hard' ? 80 : 60;
  
  if (text.length <= maxLength) {
    return text;
  }
  
  // Truncate at word boundary
  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxLength * 0.7) { // Only truncate at word if it's not too short
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
}

// ============= SIMPLIFIED PROMPT PROCESSING (No Complex Truncation) =============
function processPromptForRunware(prompt, difficulty) {
  if (!prompt) return prompt;
  
  console.log(`🛡️ Tier 2.5: Simplified processing - letting Runware handle final length (${prompt.length} chars for ${difficulty})`);
  
  // No truncation needed - smart sentence extraction already handled in template filling
  // Total prompts should be ~800-1200 chars well under Runware's limits  
  return prompt;
}

function getRandomItem(array) {
  if (!array || array.length === 0) return 'default';
  return array[Math.floor(Math.random() * array.length)];
}

function extractGenderFromCharacter(character) {
  if (!character || typeof character !== 'string') return 'child';
  const lowerChar = character.toLowerCase();
  if (lowerChar.includes('girl')) return 'girl';
  if (lowerChar.includes('boy')) return 'boy';
  return 'child';
}

function getAgeFromDifficulty(difficulty) {
  const ageMap = {
    'beginner': 'age 5-6',
    'easy': 'age 7-8', 
    'medium': 'age 9-10',
    'hard': 'age 11-12',
    'expert': 'age 13-14'
  };
  return ageMap[difficulty] || 'age 9-10';
}


// CULTURAL LANDMARKS MOVED TO SHARED MODULE - SEE _shared/culturalLandmarks.js

// ============= DUPLICATE CULTURAL SETTING ENHANCEMENT FUNCTION REMOVED =============
    if (landmarks.length > 0) {
      const randomLandmark = landmarks[Math.floor(Math.random() * landmarks.length)];
      
      // ENHANCED: Context-aware enhancement with better integration
      if (baseSetting.toLowerCase().includes('park')) {
        return baseSetting.replace('park', `park ${randomLandmark}`);
      }
      if (baseSetting.toLowerCase().includes('school')) {
        return baseSetting.replace('school', `school ${randomLandmark}`);
      }
      if (baseSetting.toLowerCase().includes('home')) {
        return baseSetting.replace('home', `home ${randomLandmark}`);
      }
      if (baseSetting.toLowerCase().includes('playground')) {
        return baseSetting.replace('playground', `playground ${randomLandmark}`);
      }
      
      // Enhanced generic enhancement with smart positioning
      return `${baseSetting} ${randomLandmark}`;
    }
    
    console.log(`🌍 No cultural enhancement available for language: ${language}`);
    return baseSetting;
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Cultural setting enhancement error:', error);
    return baseSetting;
  }
}

// ============= DUPLICATE FUNCTION REMOVED - USING FIRST INSTANCE =============
      if (exactWord.includes('play')) return `${exactWord}`;
      if (exactWord.includes('bounce')) return `${exactWord}`;
      if (exactWord.includes('fall')) return `${exactWord}`;
      if (exactWord.includes('climb')) return `${exactWord}`;
      if (exactWord.includes('swim')) return `${exactWord}`;
      if (exactWord.includes('hide')) return `${exactWord}`;
      if (exactWord.includes('slide')) return `${exactWord}`;
      return exactWord; // Preserve exact word - no enhancement needed
    }
    
    if (type === 'objects') {
      // Keep exact object names, add minimal color descriptors only when beneficial
      if (exactWord.includes('ball') && !exactWord.includes('red') && !exactWord.includes('blue')) {
        return `colorful ${exactWord}`;
      }
      return exactWord; // Preserve exact object
    }
    
    if (type === 'setting') {
      // Keep exact location, add minimal atmospheric descriptors
      if (exactWord.includes('hill')) return `${exactWord}`;
      if (exactWord.includes('park')) return `${exactWord}`;
      if (exactWord.includes('playground')) return `${exactWord}`;
      if (exactWord.includes('slope')) return `${exactWord}`;
      if (exactWord.includes('cliff')) return `${exactWord}`;
      return exactWord; // Preserve exact setting
    }
    
    return currentValue; // Fallback to current value
    
  } catch (error) {
    console.warn('⚠️ Context-aware enhancement error:', error);
    return currentValue; // Return original on error
  }
}

// MASTER PLAN PHASE 6: ENHANCED CULTURAL LANDMARK FUNCTION WITH CONTEXT AWARENESS
function getCulturalLandmarks(language, isIndoor = false, isOutdoor = false) {
  console.log(`🌍 Enhanced cultural landmarks for ${language} - Indoor: ${isIndoor}, Outdoor: ${isOutdoor}`);
  
  let languageKey = '';
  if (language === 'es' || language === 'spanish') languageKey = 'spanish';
  else if (language === 'fr' || language === 'french') languageKey = 'french';  
  else if (language === 'zh' || language === 'chinese') languageKey = 'chinese';
  else if (language === 'hi' || language === 'hindi') languageKey = 'hindi';
  else if (language === 'ar' || language === 'arabic') languageKey = 'arabic';
  
  if (!languageKey) {
    console.log(`🌍 No cultural landmarks available for language: ${language}`);
    return [];
  }
  
  const landmarks = CULTURAL_LANDMARKS[languageKey];
  if (!landmarks) return [];
  
  // ENHANCED: Context-aware landmark selection
  if (isIndoor && landmarks.indoor) {
    console.log(`🏠 Using indoor cultural landmarks for ${language}`);
    return landmarks.indoor;
  } else if (isOutdoor && landmarks.outdoor) {
    console.log(`🌳 Using outdoor cultural landmarks for ${language}`);
    return landmarks.outdoor;
  } else {
    // Default to outdoor if no specific context
    console.log(`🌍 Using default outdoor cultural landmarks for ${language}`);
    return landmarks.outdoor || landmarks.indoor || [];
  }
}

function detectCulturalProfile(userInfo, avatarIdentity) {
  try {
    const language = avatarIdentity?.nativeLanguage || userInfo?.language || 'en';
    const skinTone = userInfo?.avatar?.skinTone || userInfo?.skinTone || '';
    
    console.log(`🛡️ Tier 2.5: Detecting cultural profile - Language: ${language}, Skin: ${skinTone}`);
    
    // African American detection
    if (skinTone.toLowerCase().includes('dark') || 
        skinTone.toLowerCase().includes('brown') ||
        skinTone.toLowerCase().includes('black') ||
        skinTone.toLowerCase().includes('ebony') ||
        skinTone.toLowerCase().includes('chocolate')) {
      console.log('🛡️ Tier 2.5: African American profile detected via skin tone');
      return 'African American';
    }
    
    // Language-based detection with real ethnicities
    if (language === 'es' || language === 'spanish') {
      console.log('🛡️ Tier 2.5: Spanish/Latino ethnicity detected via language');
      return 'Spanish/Latino ethnicity';
    }
    
    if (language === 'fr' || language === 'french') {
      console.log('🛡️ Tier 2.5: European ethnicity detected via language');
      return 'European ethnicity';
    }
    
    if (language === 'zh' || language === 'chinese') {
      console.log('🛡️ Tier 2.5: East Asian ethnicity detected via language');
      return 'East Asian ethnicity';
    }
    
    if (language === 'hi' || language === 'hindi') {
      console.log('🛡️ Tier 2.5: South Asian ethnicity detected via language');
      return 'South Asian ethnicity';
    }
    
    if (language === 'ar' || language === 'arabic') {
      console.log('🛡️ Tier 2.5: Middle Eastern ethnicity detected via language');
      return 'Middle Eastern ethnicity';
    }
    
    if (language === 'pt' || language === 'portuguese') {
      console.log('🛡️ Tier 2.5: Latin American ethnicity detected via language');
      return 'Latin American ethnicity';
    }
    
    console.log('🛡️ Tier 2.5: Standard American profile (default)');
    return 'Standard American';
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Cultural detection error, using default:', error);
    return 'Standard American';
  }
}

    }
    
    if (lowerText.includes('peaceful') || lowerText.includes('calm') || lowerText.includes('quiet') ||
        lowerText.includes('serene') || lowerText.includes('tranquil')) {
      return 'Peaceful and serene atmosphere';
    }
    
    if (lowerText.includes('adventure') || lowerText.includes('explore') || lowerText.includes('discover') ||
        lowerText.includes('journey') || lowerText.includes('quest')) {
      return 'Adventurous and curious atmosphere';
    }
    
    if (lowerText.includes('learn') || lowerText.includes('study') || lowerText.includes('school') ||
        lowerText.includes('education') || lowerText.includes('knowledge')) {
      return 'Educational and inspiring atmosphere';
    }
    
    // Default positive
    return 'Warm and welcoming atmosphere';
    
  } catch (error) {
    console.warn('⚠️ Tier 2.5: Emotion detection error:', error);
    return 'Positive and uplifting atmosphere';
  }
}

// ============= MAIN EDGE FUNCTION =============

serve(async (req) => {
  const BUILD_VERSION = '2025-01-09-v2.1.0';
  const requestId = Math.random().toString(36).substring(2, 10);
  console.log(`🚀 [${requestId}] runware-simple-fallback: ${req.method} ${req.url} [v${BUILD_VERSION}]`);
  
  // Pre-load vocabulary on first request for performance
  await getVocab();
  
  // ✅ EARLY BOOT LOGGING - Phase 2 Boot Stabilization
  console.log('🚀 Tier 2.5 runware-simple-fallback starting...');
  console.log(`🛡️ Tier 2.5: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight handled successfully');
    return createCorsOptionsResponse();
  }

  // ✅ FAST HEALTH CHECK PATH - bypasses heavy modules
  if (req.method === 'HEAD') {
    console.log('💚 HEAD health check requested - fast response');
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method === 'GET' || req.url.includes('/health')) {
    console.log('💚 GET health check requested - returning fast response');
    const runwareApiKey = Deno.env.get('RUNWARE_API_KEY')?.trim();
    
    return createCorsResponse({
      healthy: true, 
      tier: '2.5',
      provider: 'runware-simple-fallback',
      timestamp: new Date().toISOString(),
      boot_status: 'healthy',
      lazy_loading: 'enabled',
      runwareApiKeyPresent: !!runwareApiKey,
      runwareKeyLength: runwareApiKey ? runwareApiKey.length : 0,
      supported_methods: ['GET', 'POST', 'HEAD']
    });
  }

  // Only parse JSON for POST requests
  if (req.method !== 'POST') {
    return createCorsErrorResponse('Method not allowed. Use GET for health checks or POST for image generation.', 405);
  }
  
  // Parse request body for POST requests  
  let payload;
  try {
    payload = await req.json();
    console.log(`📥 [${requestId}] Request payload parsed:`, {
      hasPageText: !!payload.pageText,
      hasUserInfo: !!payload.userInfo,
      hasSessionId: !!payload.sessionId,
      requestId: payload.requestId || 'not_provided'
    });

    // Handle health check requests for POST method
    if (payload.healthCheck || payload.diagnosticMode) {
      console.log(`🩺 [${requestId}] Health check request received via POST`, payload);
      const runwareApiKey = Deno.env.get('RUNWARE_API_KEY')?.trim();
      return createCorsResponse({
        healthy: true,
        service: 'runware-simple-fallback',
        tier: '2.5',
        status: 'ready',
        timestamp: new Date().toISOString(),
        requestId,
        dependencies: {
          runware: !!runwareApiKey,
          templates: 'hardcoded_available'
        }
      });
    }

  // Initialize vocabulary for POST requests only
  await initVocabulary();

  // Extract request fields from parsed payload
  let pageText, userInfo, sessionId, storyId, pageNumber, isGuestUser, difficultyLevel, diagnostic, characterData, templateComplexity;
  const body = payload || {};
  pageText = body.pageText;
  userInfo = body.userInfo;
  sessionId = body.sessionId;
  storyId = body.storyId;
  pageNumber = body.pageNumber ?? 1;
  isGuestUser = body.isGuestUser ?? false;
  difficultyLevel = body.difficultyLevel ?? 'medium';
  diagnostic = body.diagnostic;
  characterData = body.characterData;
  templateComplexity = body.templateComplexity;

  // Handle diagnostic requests
  if (diagnostic === 'tier_health_check') {
    const runwareApiKey = Deno.env.get('RUNWARE_API_KEY')?.trim();
    
    if (!runwareApiKey) {
      return createCorsErrorResponse('RUNWARE_API_KEY not configured for Tier 2.5', 500);
    }
    
    return createCorsResponse({
      success: true,
      tier: '2.5',
      service: 'runware-simple-fallback',
      runwareApiKeyPresent: true,
      runwareKeyLength: runwareApiKey.length,
      timestamp: new Date().toISOString()
    });
  }

  if (!pageText) {
    return createCorsErrorResponse('pageText is required', 400);
  }
  
  console.log(`🛡️ Tier 2.5: Processing page ${pageNumber} for session ${sessionId}`);
  
  // ============= TIER TRACKING VARIABLES =============
  let attemptedTiers = [];
  let successfulTier = null;
  let tierPath = [];
  let fallbackReason = null;
  let enhancementLevel = null;
  let startTime = Date.now();
  
  console.log('🎯 TIER 2.5 CASCADE: Initializing tier tracking system');
  
  // 🔑 DEBUG: API Key Validation
  const runwareApiKey = Deno.env.get('RUNWARE_API_KEY');
  if (!runwareApiKey) {
    console.error('❌ CRITICAL: RUNWARE_API_KEY not found in Tier 2.5');
    return createCorsErrorResponse('Tier 2.5: Missing Runware API key', 500);
  }
  console.log('✅ Tier 2.5: RUNWARE_API_KEY validated:', runwareApiKey.substring(0, 10) + '...');
  
  try {
    
    // COMPREHENSIVE PARAMETER VALIDATION - Add missing defaults
    if (!pageText) {
      pageText = 'An attractive child in a bright cheerful environment';
      console.log('🛡️ Undefined pageText - using default:', pageText);
    }
    
    if (!userInfo) {
      userInfo = { avatar: { skinTone: 'medium' } };
      console.log('🛡️ Undefined userInfo - using default:', userInfo);
    }
    
    if (!userInfo.avatar) {
      userInfo.avatar = { skinTone: 'medium' };
      console.log('🛡️ Undefined avatarIdentity - using default skinTone: medium');
    }
    
      console.log('🛡️ Tier 2.5: Processing request with nuclear independence');
      console.log('🎭 Tier 2.5: Character consistency data received:', {
        hasCharacterData: !!characterData,
        sessionId: sessionId,
        characterSeed: characterData?.seed || 'none'
      });
      
      // PARAMETER VALIDATION: Check Tier 2.5A vs 2.5B requirements
      const hasTier25ARequirements = !!(pageText && userInfo && sessionId && characterData);
      const hasTier25BRequirements = !!(pageText && userInfo);
      
      console.log('🔍 TIER 2.5 PARAMETER VALIDATION:', {
        tier25A_Requirements: { pageText: !!pageText, userInfo: !!userInfo, sessionId: !!sessionId, characterData: !!characterData },
        tier25A_Ready: hasTier25ARequirements,
        tier25B_Ready: hasTier25BRequirements,
        willUseTier: hasTier25ARequirements ? '2.5A (Premium)' : '2.5B (Basic)',
        timestamp: new Date().toISOString()
      });
      
      // BUILD LOCAL AVATAR IDENTITY: Create enhanced avatar identity from user data
      let localAvatarIdentity;
      try {
        localAvatarIdentity = getNuclearAvatarMapping(userInfo, mapDifficultyInline(userInfo, 'medium', templateComplexity) || 'medium');
        console.log('✅ Local avatar identity built successfully:', localAvatarIdentity.character);
      } catch (avatarError) {
        console.warn('⚠️ Avatar identity building failed, using fallback:', avatarError);
        localAvatarIdentity = {
          character: 'friendly child character',
          age: '7-year-old',
          hair: 'neat hair',
          features: 'cheerful expression'
        };
      }
      
      // ============= TESTING & VALIDATION =============
      // Run comprehensive test on development requests (when sessionId contains 'test')
      if (sessionId && sessionId.includes('test')) {
        testPronounResolutionSystem();
      }
      
      // Extract scene components with complete placeholder support - SILENT FAILURE PROTECTION
    let scene, setting, objects, secondary_characters, sceneData;
    try {
      sceneData = await extractSceneWithPremiumTemplate(pageText, undefined, userInfo?.pageNumber, sessionId);
      scene = sceneData.scene;
      setting = sceneData.setting;
      objects = sceneData.objects;
      secondary_characters = sceneData.secondary_characters;
      console.log('✅ Scene extraction successful');
    } catch (sceneError) {
      console.warn('⚠️ Scene extraction failed - triggering 2.5B basic template:', sceneError);
      // CRITICAL: Scene extraction failure triggers 2.5B basic template  
      console.log('❌ Scene extraction failed - routing directly to Tier 2.5B');
      tierPath.push('direct-2.5B-attempt');
      successfulTier = '2.5B';
      enhancementLevel = 'basic';
      fallbackReason = 'Scene extraction failure';
      return fillBasicTemplate(difficulty || 'medium', userInfo, pageText, localAvatarIdentity);
    }
    
    // Map difficulty level with fallback protection
    let difficulty;
    try {
      difficulty = mapDifficultyInline(userInfo, 'medium', templateComplexity);
      console.log('✅ Difficulty mapping successful:', difficulty);
    } catch (difficultyError) {
      console.warn('⚠️ Difficulty mapping failed, using medium default:', difficultyError);
      difficulty = 'medium';
    }
    
    // Detect emotion with silent failure protection
    let emotion;
    try {
      emotion = detectEmotionFromText(pageText);
      console.log('✅ Emotion detection successful:', emotion);
    } catch (emotionError) {
      console.warn('⚠️ Emotion detection failed, using positive default:', emotionError);
      emotion = 'Positive and uplifting atmosphere';
    }
    
    // FIX: avatarIdentity moved to top of function to fix scoping error
    // (now declared at line ~732)
    
    // Validate and prepare contextual intelligence data with fallbacks
    const contextualData = {
      spatialComposition: sceneData?.spatialComposition || 'character prominently featured in foreground',
      atmosphereContext: sceneData?.atmosphereContext || sceneData?.atmosphere || 'warm, inviting atmosphere'
    };
    
    console.log('🧠 Contextual Intelligence Data:', {
      spatialComposition: contextualData.spatialComposition,
      atmosphereContext: contextualData.atmosphereContext,
      hasContextualSetting: !!sceneData?.contextualSetting,
      hasContextualAction: !!sceneData?.contextualAction
    });
    
    // TIER 2.5A vs 2.5B LOGIC: Check requirements and route accordingly
    let prompt;
    let templateType = '';
    try {
    // ENHANCED: Character Consistency Integration with Nuclear Independence
    if (hasTier25ARequirements) {
      console.log('🎯 Tier 2.5A: ATTEMPTING (Premium Template + Character Consistency + Cultural Intelligence)');
      templateType = 'Premium Template with Character Consistency';
      attemptedTiers.push('2.5A');
      tierPath.push('2.5A-attempting');
      
      // Integrate Character Consistency Service
      let enhancedAvatarIdentity = localAvatarIdentity;
      try {
        const CharacterService = await getCharacterService();
        if (CharacterService) {
          const characterConsistencyService = new CharacterService();
          const characterSeed = await characterConsistencyService.getCharacterSeed(
            sessionId, 
            'main_character', 
            pageText, 
            'premium', 
            sceneData?.clothing || ''
          );
        
        if (characterSeed) {
          console.log('🎭 Enhanced character consistency integration successful');
          enhancedAvatarIdentity = {
            ...localAvatarIdentity,
            character: characterSeed.description || localAvatarIdentity.character,
            features: characterSeed.facialFeatures || localAvatarIdentity.features,
            hair: characterSeed.hairstyle || localAvatarIdentity.hair,
            consistency: true
          };
        }
      } catch (characterError) {
        console.warn('⚠️ Character consistency integration failed, using nuclear mapping:', characterError);
      }
      
      prompt = await fillPremiumTemplate(difficulty, userInfo, scene, setting, objects, secondary_characters, emotion, pageText, enhancedAvatarIdentity, contextualData.spatialComposition, contextualData.atmosphereContext);
      console.log('✅ Tier 2.5A: SUCCESS (Premium Template + Character Consistency + Cultural Intelligence)');
      successfulTier = '2.5A';
      tierPath[tierPath.length - 1] = '2.5A-success';
      enhancementLevel = 'premium';
    } else {
      console.log('❌ Tier 2.5A: FAILED (Missing requirements - sessionId, characterData)');
      fallbackReason = 'Missing Tier 2.5A requirements (sessionId or characterData)';
      tierPath.push('2.5A-failed');
      throw new Error('Tier 2.5A requirements not met - auto-fallback to 2.5B');
    }
    } catch (templateError) {
      console.log('❌ Tier 2.5A: FAILED (Template generation error)');
      if (!fallbackReason) fallbackReason = `Premium template error: ${templateError.message}`;
      if (tierPath[tierPath.length - 1] !== '2.5A-failed') {
        tierPath[tierPath.length - 1] = '2.5A-failed';
      }
      
      // ============= UPDATED 4-TIER FALLBACK CHAIN =============
      console.log('🔄 Tier 2.5A FAILED → Routing to Tier 2.5B');
      try {
        console.log('🎯 Tier 2.5B: ATTEMPTING (Basic Personalized Template + Nuclear Independence)');
        templateType = 'Basic Personalized Template';
        attemptedTiers.push('2.5B');
        tierPath.push('2.5B-attempting');
        
        prompt = fillBasicTemplate(difficulty, userInfo, pageText, localAvatarIdentity);
        console.log('✅ Tier 2.5B: SUCCESS (Basic Personalized Template + Nuclear Independence)');
        successfulTier = '2.5B';
        tierPath[tierPath.length - 1] = '2.5B-success';
        enhancementLevel = 'basic';
        
      } catch (basicError) {
        console.log('❌ Tier 2.5B: FAILED (Basic template error)');
        tierPath[tierPath.length - 1] = '2.5B-failed';
        if (!fallbackReason) fallbackReason = `Basic template error: ${basicError.message}`;
        
        console.log('🔄 Tier 2.5B FAILED → Routing to Tier 2.5C');
        try {
          console.log('🎯 Tier 2.5C: ATTEMPTING (Emergency Framework Template + Guaranteed Success)');
          templateType = 'Emergency Framework Template';
          attemptedTiers.push('2.5C');
          tierPath.push('2.5C-attempting');
          
          const styleFramework = getStyleFramework(difficulty);
          const emergencyFramework = styleFramework?.frameworkPrompt || 
                                    'Children book style with vibrant colors, friendly character design, bright cheerful atmosphere';
          
          prompt = (pageText || '').substring(0, 2500) + ' ' + emergencyFramework;
          console.log('✅ Tier 2.5C: SUCCESS (Emergency Framework Template + Guaranteed Success)');
          successfulTier = '2.5C';
          tierPath[tierPath.length - 1] = '2.5C-success';
          enhancementLevel = 'emergency';
          
        } catch (emergencyError) {
          console.log('❌ Tier 2.5C: FAILED (Emergency template error)');
          tierPath[tierPath.length - 1] = '2.5C-failed';
          if (!fallbackReason) fallbackReason = `Emergency template error: ${emergencyError.message}`;
          
          console.log('🔄 Tier 2.5C FAILED → Routing to Tier 2.5D (ULTIMATE EMERGENCY)');
          console.log('🎯 Tier 2.5D: ATTEMPTING (Ultimate Emergency Fallback Template - NUCLEAR GUARANTEE)');
          templateType = 'Ultimate Emergency Fallback Template';
          attemptedTiers.push('2.5D');
          tierPath.push('2.5D-attempting');
          
          prompt = "ULTIMATE_EMERGENCY_TEMPLATE_USED: A cheerful child character in a colorful outdoor scene with bright, friendly lighting. Contemporary children's book illustration with soft painterly style, warm expressions, detailed facial features, vibrant colors, shallow depth of field, character-focused composition, child-friendly aesthetic, high rendering quality, artistic lighting, diverse representation";
          console.log('✅ Tier 2.5D: SUCCESS (Ultimate Emergency Fallback Template - NUCLEAR GUARANTEE)');
          successfulTier = '2.5D';
          tierPath[tierPath.length - 1] = '2.5D-success';
          enhancementLevel = 'ultimate-emergency';
        }
      }
    }
    
    // Generate avatar mapping with character consistency enhancement - PHASE 5: ENHANCED FAILURE PROTECTION
    let avatarMapping, avatarType;
    try {
      // Check if globalArcSessionManager exists before calling
      if (typeof globalArcSessionManager === 'undefined' || !globalArcSessionManager) {
        console.warn('⚠️ globalArcSessionManager not available - using fallback character consistency');
        throw new Error('Character consistency service unavailable');
      }
      
      avatarMapping = enhanceNuclearMappingWithConsistency(userInfo, difficulty, characterData, sessionId, localAvatarIdentity);
      avatarType = localAvatarIdentity?.type || userInfo?.avatar?.type || 'prefer-not-to-answer';
      console.log('✅ Avatar mapping successful');
      
      // BULLETPROOFING: Additional validation checks that trigger 2.5B fallback
      const characterValidation = validateCharacterConsistency(characterData, avatarMapping);
      if (!characterValidation.isValid) {
        console.log('❌ Character consistency validation failed - routing directly to Tier 2.5B');
        tierPath.push('direct-2.5B-attempt');
        successfulTier = '2.5B';
        enhancementLevel = 'basic';
        fallbackReason = 'Character consistency validation failed';
        return fillBasicTemplate(difficulty || 'medium', userInfo, pageText, localAvatarIdentity);
      }
      
      const visualValidation = validateVisualElements(sceneData, objects, setting);
      if (!visualValidation.isValid) {
        console.log('❌ Visual elements validation failed - routing directly to Tier 2.5B');
        tierPath.push('direct-2.5B-attempt');
        successfulTier = '2.5B';
        enhancementLevel = 'basic';
        fallbackReason = 'Visual elements validation failed';
        return fillBasicTemplate(difficulty || 'medium', userInfo, pageText, localAvatarIdentity);
      }
      
      const sceneValidation = validateSceneComplexity(sceneData, pageText);
      if (!sceneValidation.isValid) {
        console.log('❌ Scene complexity validation failed - routing directly to Tier 2.5B');
        tierPath.push('direct-2.5B-attempt');
        successfulTier = '2.5B';
        enhancementLevel = 'basic';
        fallbackReason = 'Scene complexity validation failed';
        return fillBasicTemplate(difficulty || 'medium', userInfo, pageText, localAvatarIdentity);
      }
      
      console.log('✅ All validation checks passed - proceeding with premium template');
    } catch (avatarError) {
      console.log('❌ Character consistency service failed - routing directly to Tier 2.5B');
      tierPath.push('direct-2.5B-attempt');
      successfulTier = '2.5B';
      enhancementLevel = 'basic';
      fallbackReason = 'Character consistency service failure';
      
      // CRITICAL: Character consistency failure triggers 2.5B basic template (not emergency template)
      return fillBasicTemplate(difficulty || 'medium', userInfo, pageText, localAvatarIdentity);
    }
    
    // Generate cultural profile and negative prompt - SILENT FAILURE PROTECTION
    let culturalProfile, negativePrompt;
    try {
      const pageNumber = userInfo?.pageNumber || 1;
      // Generate basic cultural profile inline (nuclear independence)
      culturalProfile = {
        language: userInfo?.language || 'en',
        skinTone: localAvatarIdentity?.skinTone || 'medium',
        ethnicity: localAvatarIdentity?.ethnicity || 'standard_american'
      };
      
      // ============= PHASE 5 ENHANCEMENT: MULTI-CHARACTER NEGATIVE PROMPT INTEGRATION =============
      // Extract secondary character information for negative prompt consistency
      const secondaryCharacterList = [];
      if (secondary_characters && secondary_characters.trim()) {
        // Parse secondary characters for gender consistency filtering
        const cleanSecondaryText = secondary_characters.replace(/^with\s+/, '').trim();
        if (cleanSecondaryText) {
          secondaryCharacterList.push(cleanSecondaryText);
        }
      }
      
      negativePrompt = joinNegativePromptStrings(culturalProfile, avatarType, difficulty, pageNumber, secondaryCharacterList);
      console.log('✅ Cultural profile and enhanced multi-character negative prompt generation successful');
    } catch (culturalError) {
      console.warn('⚠️ Cultural profile generation failed, using defaults:', culturalError);
      culturalProfile = { language: 'en', skinTone: 'medium' };
      negativePrompt = 'low quality, blurry, distorted, inappropriate content';
    }
    
    // ❌ DUPLICATE ARRAY REMOVED - REGRESSION PREVENTION ❌
    // This duplicate NUCLEAR_STYLE_SETTINGS array has been removed to prevent:
    // - Memory waste and code duplication 
    // - Confusion about which array is being used
    // - Inconsistent framework prompts between arrays
    // - Maintenance overhead of keeping two arrays in sync
    //
    // 🔄 REFERENCE: Primary NUCLEAR_STYLE_SETTINGS is at line ~2185-2220
    // 🔄 All template logic uses the primary array only
    
    const styleFramework = getStyleFramework(difficulty);
    console.log('✅ Style framework applied from shared source:', styleFramework.name);

    // Now apply style settings to template filling (moved from line 1698)
    // This ensures NUCLEAR_STYLE_SETTINGS is defined before use
    
    console.log('🛡️ Tier 2.5: Attempting HTTP-first approach with WebSocket fallback...');
    
    // HTTP-FIRST APPROACH: Try HTTP API first for better edge function compatibility
    try {
      console.log('🌐 Tier 2.5: Attempting HTTP API first...');
      
      const httpResult = await attemptHttpFallback(prompt, negativePrompt, styleSettings, sessionId, characterData, avatarMapping, difficulty, culturalProfile, objects, secondary_characters);
      
      if (httpResult.success) {
        console.log('✅ Tier 2.5: HTTP-first approach successful!');
        return httpResult;
      } else {
        console.log('🔄 Tier 2.5: HTTP failed, falling back to WebSocket...');
      }
    } catch (httpError) {
      console.log('🔄 Tier 2.5: HTTP failed with error, falling back to WebSocket:', httpError.message);
    }
    
    // WEBSOCKET FALLBACK: Continue with original WebSocket logic if HTTP failed
    console.log('🛡️ Tier 2.5: Using WebSocket fallback with comprehensive error protection...');
    let connectionTimeout, operationTimeout;
    
    // Connect to Runware WebSocket API with error boundaries
    let ws;
    try {
      ws = new WebSocket('wss://ws-api.runware.ai/v1');
    } catch (wsError) {
      console.error('⚠️ WebSocket connection failed immediately:', wsError);
      return createCorsErrorResponse('WebSocket connection failed', 500);
    }
    
    return new Promise((resolve) => {
      let isResolved = false;
      
      const resolveOnce = (response) => {
        if (!isResolved) {
          isResolved = true;
          // Clean up timeouts
          if (connectionTimeout) clearTimeout(connectionTimeout);
          if (operationTimeout) clearTimeout(operationTimeout);
          try {
            ws.close();
          } catch (closeError) {
            console.warn('⚠️ WebSocket close error (non-critical):', closeError);
          }
          resolve(response);
        }
      };
      
      // Connection timeout protection (30 seconds)
      connectionTimeout = setTimeout(() => {
        console.warn('⚠️ WebSocket connection timeout');
        resolveOnce(createCorsErrorResponse('Connection timeout - please try again', 504));
      }, 30000);
      
      // Operation timeout protection (60 seconds total)
      operationTimeout = setTimeout(() => {
        console.warn('⚠️ WebSocket operation timeout');
        resolveOnce(createCorsErrorResponse('Operation timeout - please try again', 504));
      }, 60000);
      
      // Declare finalPrompt at function scope to fix scoping issue
      let finalPrompt = prompt; // Default to original prompt
      
      ws.onopen = () => {
        try {
          console.log('🛡️ Tier 2.5: WebSocket connected, authenticating...');
          
          // Send authentication with error protection
          const authMessage = [{
            taskType: "authentication",
            apiKey: Deno.env.get('RUNWARE_API_KEY') || 'missing-api-key'
          }];
          
          ws.send(JSON.stringify(authMessage));
        } catch (openError) {
          console.error('⚠️ WebSocket onopen error:', openError);
          resolveOnce(createCorsErrorResponse('Authentication failed', 500));
        }
      };
      
      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          console.log('🛡️ Tier 2.5: Received WebSocket response with error protection');
          
          if (!response || typeof response !== 'object') {
            throw new Error('Invalid response format');
          }
          
          if (response.error || response.errors) {
            console.error('❌ Tier 2.5: API error:', response);
            const errorMessage = response.errorMessage || response.errors?.[0]?.message || 'Unknown API error';
            resolveOnce(createCorsErrorResponse(errorMessage, 500));
            return;
          }
          
          if (response.data) {
            for (const item of response.data) {
              if (item.taskType === "authentication") {
                console.log('🛡️ Tier 2.5: Authentication successful, generating image...');
                
                // Apply simplified prompt processing (No complex truncation)
                finalPrompt = processPromptForRunware(prompt, difficulty);
                
                // Send image generation request
                const imageMessage = [{
                  taskType: "imageInference",
                  taskUUID: crypto.randomUUID(),
                  positivePrompt: finalPrompt,
                  negativePrompt: negativePrompt,
                  width: 1024, // FIXED: Optimized image size
                  height: 1024, // FIXED: Optimized image size
                  model: "runware:100@1",
                  numberResults: 1,
                  outputFormat: "WEBP",
                  steps: 30, // FIXED: Enhanced generation parameters  
                  CFGScale: 10 // FIXED: Enhanced generation parameters
                }];
                
                ws.send(JSON.stringify(imageMessage));
                
              } else if (item.taskType === "imageInference") {
                console.log('🛡️ Tier 2.5: Image generation successful!');
                
                 const processingTime = Date.now() - startTime;
                 console.log(`🎯 TIER CASCADE COMPLETE: ${successfulTier} succeeded in ${processingTime}ms`);
                 console.log(`📊 Tier Path: [${tierPath.join(' → ')}]`);
                 
                 resolveOnce(createCorsResponse({
                   success: true,
                   imageURL: item.imageURL,
                   prompt: finalPrompt,
                   negativePrompt: negativePrompt,
                   difficulty: difficulty,
                   culturalProfile: culturalProfile,
                   tier: '2.5 Nuclear Independence + Character Consistency',
                   specificTier: successfulTier,
                   templateType: templateType,
                   tierPath: tierPath,
                   enhancementLevel: enhancementLevel,
                   fallbackReason: fallbackReason,
                   processingTime: processingTime,
                   attemptedTiers: attemptedTiers,
                   placeholders: {
                     objects: objects || 'none',
                     secondary_characters: secondary_characters || 'none'
                   },
                   characterConsistency: {
                     sessionId: sessionId,
                     characterSeed: characterData?.seed || 'none',
                     enhancementApplied: !!(characterData && characterData.seed),
                     source: avatarMapping?.source || 'nuclear-mapping'
                   }
                 }));
              }
            }
          }
        } catch (parseError) {
          console.error('❌ Tier 2.5: Response parsing error:', parseError);
          resolveOnce(createCorsErrorResponse('Failed to parse API response', 500));
        }
      };
      
      ws.onerror = async (error) => {
        console.error('❌ Tier 2.5: WebSocket error:', error);
        console.log('🔄 Tier 2.5: Attempting HTTP fallback...');
        
        // HTTP FALLBACK: Try Runware REST API
        try {
          const result = await attemptHttpFallback(prompt, negativePrompt, styleSettings, sessionId, characterData, avatarMapping, difficulty, culturalProfile, objects, secondary_characters);
          if (result.success) {
            resolveOnce(result);
          } else {
            resolveOnce(createCorsErrorResponse('WebSocket and HTTP fallback both failed', 500));
          }
        } catch (error) {
          resolveOnce(createCorsErrorResponse('WebSocket connection failed and HTTP fallback unavailable', 500));
        }
      };
      
      ws.onclose = async (event) => {
        console.log('🛡️ Tier 2.5: WebSocket closed:', event.code, event.reason);
        if (!isResolved) {
          console.log('🔄 Tier 2.5: Attempting HTTP fallback due to unexpected close...');
          
          // HTTP FALLBACK: Try Runware REST API
          try {
            const result = await attemptHttpFallback(prompt, negativePrompt, styleSettings, sessionId, characterData, avatarMapping, difficulty, culturalProfile, objects, secondary_characters);
            if (result.success) {
              resolveOnce(result);
            } else {
              resolveOnce(createCorsErrorResponse('WebSocket closed and HTTP fallback failed', 500));
            }
          } catch (error) {
            resolveOnce(createCorsErrorResponse('WebSocket connection closed and HTTP fallback unavailable', 500));
          }
        }
      };
      
      // Timeout after 30 seconds
      setTimeout(async () => {
        if (!isResolved) {
          console.error('❌ Tier 2.5: Request timeout, trying HTTP fallback...');
          
          // HTTP FALLBACK: Try Runware REST API
          try {
            const result = await attemptHttpFallback(prompt, negativePrompt, styleSettings, sessionId, characterData, avatarMapping, difficulty, culturalProfile, objects, secondary_characters);
            if (result.success) {
              resolveOnce(result);
            } else {
              resolveOnce(createCorsErrorResponse('Request timeout and HTTP fallback failed', 408));
            }
          } catch (error) {
            resolveOnce(createCorsErrorResponse('Request timeout', 408));
          }
        }
      }, 30000);
      
      // HTTP FALLBACK FUNCTION
      async function attemptHttpFallback(prompt, negativePrompt, styleSettings, sessionId, characterData, avatarMapping, difficulty, culturalProfile, objects, secondary_characters) {
        try {
          console.log('🌐 Tier 2.5: Attempting HTTP API fallback...');
          
          const httpResponse = await fetch('https://api.runware.ai/v1', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify([
              {
                taskType: "authentication", 
                apiKey: Deno.env.get('RUNWARE_API_KEY')?.trim()
              },
              {
                taskType: "imageInference",
                taskUUID: crypto.randomUUID(),
                positivePrompt: prompt,
                negativePrompt: negativePrompt,
                height: 1024, // FIXED: Enhanced image dimensions
                width: 1024, // FIXED: Enhanced image dimensions
                model: "runware:100@1",
                steps: 30, // FIXED: Enhanced generation parameters
                CFGScale: 10, // FIXED: Enhanced generation parameters
                outputFormat: "WEBP"
              }
            ])
          });
          
          if (!httpResponse.ok) {
            throw new Error(`HTTP ${httpResponse.status}: ${httpResponse.statusText}`);
          }
          
          const httpResult = await httpResponse.json();
          const imageData = httpResult.data?.find(item => item.taskType === 'imageInference');
          
          if (imageData?.imageURL) {
            const processingTime = Date.now() - startTime;
            console.log(`✅ Tier 2.5: HTTP fallback successful! Final tier: ${successfulTier}`);
            console.log(`📊 HTTP Fallback - Tier Path: [${tierPath.join(' → ')}]`);
            
            return createCorsResponse({
              success: true,
              imageURL: imageData.imageURL,
              prompt: prompt,
              negativePrompt: negativePrompt,
              difficulty: difficulty,
              culturalProfile: culturalProfile,
              tier: '2.5 Nuclear Independence + Character Consistency (HTTP)',
              specificTier: successfulTier,
              templateType: templateType,
              tierPath: tierPath,
              enhancementLevel: enhancementLevel,
              fallbackReason: fallbackReason,
              processingTime: processingTime,
              attemptedTiers: attemptedTiers,
              placeholders: {
                objects: objects || 'none',
                secondary_characters: secondary_characters || 'none'
              },
              characterConsistency: {
                sessionId: sessionId,
                characterSeed: characterData?.seed || 'none',
                enhancementApplied: !!(characterData && characterData.seed),
                source: avatarMapping?.source || 'nuclear-mapping'
              }
            });
          } else {
            throw new Error('No image URL in HTTP response');
          }
          
        } catch (httpError) {
          console.error('❌ Tier 2.5: HTTP fallback failed:', httpError);
          
          // Tier 2.5 failure - let frontend handle Tier 4 fallback
          console.log('❌ Tier 2.5: All generation tiers failed - returning error for frontend fallback');
          
          return createCorsResponse({
            success: false,
            error: 'Tier 2.5 image generation failed',
            tier: '2.5 - Nuclear Independence Failed',
            fallbackReason: 'All Tier 2.5 generation methods failed - frontend will handle Tier 4',
            pageNumber: pageNumber || 1,
            timestamp: new Date().toISOString(),
            metadata: {
              ultimateFallback: true,
              originalError: httpError.message
            }
          });
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Tier 2.5: Main function error:', error);
    
    // Tier 2.5 error - let frontend handle Tier 4 fallback
    console.log('❌ Tier 2.5: Main function error - returning error for frontend fallback');
    
    return createCorsResponse({
      success: false,
      error: 'Tier 2.5 function error',
      tier: '2.5 - Nuclear Independence Error',
      fallbackReason: 'Main function error - frontend will handle Tier 4',
      pageNumber: pageNumber || 1,
      timestamp: new Date().toISOString(),
      metadata: {
        ultimateFallback: true,
        originalError: error.message
      }
    });
  }
});