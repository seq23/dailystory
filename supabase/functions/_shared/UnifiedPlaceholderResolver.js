/**
 * UNIFIED PLACEHOLDER RESOLVER - PHASE 2 IMPLEMENTATION
 * Single resolver for all placeholder resolution across all tiers
 * Replaces scattered placeholder logic with centralized system
 * BOOT_SYNC_ANOMALY FIX: Lazy loading with inline fallback memoizers
 */

// Inline fallback memoizer for shared dependencies
const importCache = new Map();
async function memoizedImport(path) {
  if (importCache.has(path)) {
    return importCache.get(path);
  }
  
  try {
    const module = await import(path);
    importCache.set(path, module);
    return module;
  } catch (error) {
    console.warn(`Failed to import ${path}:`, error);
    // Return fallback mock to prevent crashes
    return {
      VOCABULARY: {},
      VOCABULARY: {
        objectCategories: {
          animals: ['dog', 'cat', 'rabbit', 'hamster', 'bird'],
          colors: ['red', 'blue', 'green', 'yellow', 'orange', 'purple']
        },
        actions: {
          basic: ['playing', 'running', 'jumping', 'dancing', 'swimming']
        }
      },
      pick: (array, seed) => array?.[0] || '',
      createSeededRandom: () => Math.random,
      REGIONAL_CULTURAL_CONTEXTS: {},
      getHairBySkintone: () => '',
      getSkinBySkintone: () => '',
      shouldApplyCulturalEnhancements: () => false,
      getCulturalBundle: () => ({ hair: '', features: '' })
    };
  }
}

// ============= FIXED REGIONAL ETHNICITY DERIVATION =============
export function deriveRegionalEthnicity(userInfo, avatarIdentity) {
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
    if (nativeLanguage === 'en') {
      return 'African American';
    } else if (nativeLanguage === 'fr') {
      return 'Francophone African';
    } else if (nativeLanguage === 'pt') {
      return 'Afro-Brazilian';
    } else if (nativeLanguage === 'es') {
      return 'Afro-Latino';
    }
  }
  
  // For light/pale/medium/olive skin with English - return "American"
  if (nativeLanguage === 'en' && ['light', 'pale', 'medium', 'olive'].includes(skinTone)) {
    return 'American';
  }
  
  // Use language mapping for other cases
  return languageEthnicityMap[nativeLanguage] || '';
}

export class UnifiedPlaceholderResolver {
  constructor() {
    this.resolvedCache = new Map();
    this.maxCacheSize = 1000;
  }

  /**
   * Helper method to get cultural enhancements with character consistency
   */
  async getCulturalBundleWithConsistency(userInfo, sessionId, characterName = 'child') {
    try {
      const { CharacterConsistencyService } = await import('./CharacterConsistencyService.js');
      const characterConsistencyService = CharacterConsistencyService.getInstance();
      return await characterConsistencyService.getCulturalEnhancements(userInfo, sessionId, characterName);
    } catch (error) {
      console.error('❌ Failed to get cultural bundle with consistency:', error);
      // Fallback to StaticDataCache (old behavior)
      const { getCulturalBundle } = await import('./StaticDataCache.js');
      const characterSeed = sessionId || 'default';
      return getCulturalBundle(userInfo, characterSeed);
    }
  }

  /**
   * MASTER PLACEHOLDER RESOLUTION - 4-TIER PRIORITY SYSTEM
   * Tier 1: Character Consistency (from backend service)  
   * Tier 2: Smart Semantic Processing (contextual intelligence)
   * Tier 3: Cultural Processing (skin-tone based)
   * Tier 4: Basic Processing (vocabulary + user data) + Honest Fallbacks
   */
  async resolveAllPlaceholders(text, context = {}) {
    const { userInfo = {}, seed = {}, sessionId, pageNumber } = context;
    
    if (!text || typeof text !== 'string') return text;

    let processedText = text;
    const resolutions = [];
    const initialCount = (text.match(/\{[^}]+\}/g) || []).length;

    try {
      console.log(`🔄 Unified Placeholder Resolution starting with ${initialCount} placeholders`);
      
      // CONTEXT RESOLUTION: Direct context value mappings (must happen first)
      const settingContext = context.setting_context || context.settingContext || '';
      const persistentSetting = context.persistent_setting || context.persistentSetting || '';
      const visualConsistencyElements = context.visual_consistency_elements || context.visualConsistencyElements || '';
      
      processedText = processedText.replace(/\{setting_context\}/g, settingContext);
      processedText = processedText.replace(/\{persistent_setting\}/g, persistentSetting);
      processedText = processedText.replace(/\{visual_consistency_elements\}/g, visualConsistencyElements);
      
      const contextResolved = initialCount - (processedText.match(/\{[^}]+\}/g) || []).length;
      if (contextResolved > 0) {
        console.log(`🏠 Context Resolution: Resolved ${contextResolved} setting placeholders`);
        console.log(`   └─ setting_context="${settingContext}", persistent_setting="${persistentSetting}", visual_consistency_elements="${visualConsistencyElements}"`);
      }
      
      // TIER 1: Character Consistency (highest priority - from backend service)
      try {
        processedText = await this.resolveCharacterConsistencyPlaceholders(processedText, context);
        const afterTier1 = (processedText.match(/\{[^}]+\}/g) || []).length;
        console.log(`✅ Tier 1 (Character Consistency): Resolved ${initialCount - afterTier1} placeholders`);
      } catch (error) {
        console.warn('Tier 1 Character Consistency failed:', error);
      }
      
    // TIER 2: Smart Semantic Processing (contextual intelligence)  
      try {
        const beforeTier2 = (processedText.match(/\{[^}]+\}/g) || []).length;
        processedText = await this.resolveSmartSemanticPlaceholders(processedText, context);
        const afterTier2 = (processedText.match(/\{[^}]+\}/g) || []).length;
        console.log(`✅ Tier 2 (Smart Semantic): Resolved ${beforeTier2 - afterTier2} placeholders`);
      } catch (error) {
        console.warn('Tier 2 Smart Semantic failed:', error);
      }
      
      // TIER 3: Cultural Processing (skin-tone based cultural intelligence)
      try {
        const beforeTier3 = (processedText.match(/\{[^}]+\}/g) || []).length;
        processedText = this.resolveCulturalPlaceholders(processedText, userInfo);
        const afterTier3 = (processedText.match(/\{[^}]+\}/g) || []).length;
        console.log(`✅ Tier 3 (Cultural Processing): Resolved ${beforeTier3 - afterTier3} placeholders`);
      } catch (error) {
        console.warn('Tier 3 Cultural Processing failed:', error);
      }
      
      // TIER 4: Basic Processing (vocabulary + user data)
      try {
        const beforeTier4 = (processedText.match(/\{[^}]+\}/g) || []).length;
        processedText = await this.resolveCanonicalPlaceholders(processedText, userInfo);
        processedText = await this.resolveMicroPlaceholders(processedText, { userInfo, seed });
        processedText = await this.resolveVocabularyPlaceholders(processedText, context);
        const afterTier4 = (processedText.match(/\{[^}]+\}/g) || []).length;
        console.log(`✅ Tier 4 (Basic Processing): Resolved ${beforeTier4 - afterTier4} placeholders`);
      } catch (error) {
        console.warn('Tier 4 Basic Processing failed:', error);
      }
      
      // FINAL: Fill missing placeholders with honest fallbacks
      const beforeFinal = (processedText.match(/\{[^}]+\}/g) || []).length;
      processedText = this.fillMissingPlaceholders(processedText, context);
      const afterFinal = (processedText.match(/\{[^}]+\}/g) || []).length;
      console.log(`✅ Final (Honest Fallbacks): Processed ${beforeFinal - afterFinal} remaining placeholders`);

      // CATCH-ALL PLACEHOLDER CLEANUP: Remove any remaining unresolved placeholders
      const beforeCatchAll = (processedText.match(/\{[^}]+\}/g) || []).length;
      if (beforeCatchAll > 0) {
        const unresolvedPlaceholders = processedText.match(/\{[^}]+\}/g);
        console.warn(`⚠️ Catch-all cleanup removing ${beforeCatchAll} unresolved placeholders:`, unresolvedPlaceholders);
        processedText = processedText.replace(/\{[^}]+\}/g, '');
      }

      // CLEANUP AND GRAMMAR FIXES
      processedText = this.cleanup(processedText);

      // CRITICAL VALIDATION - Check for escalation conditions
      this.validateCriticalResolution(processedText, context);

      const finalCount = (processedText.match(/\{[^}]+\}/g) || []).length;
      const totalResolved = initialCount - finalCount;
      console.log(`🎯 Placeholder Resolution Complete: ${totalResolved}/${initialCount} resolved`);

      return {
        resolvedText: processedText,
        resolutions,
        success: true,
        resolvedCount: totalResolved,
        remainingPlaceholders: finalCount
      };

    } catch (error) {
      console.warn('⚠️ [UnifiedPlaceholderResolver] Error resolving placeholders (non-blocking):', error.message);
      return {
        resolvedText: text, // Return original text on error
        resolutions: [],
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 1. CANONICAL PLACEHOLDERS - User-specific information
   */
  async resolveCanonicalPlaceholders(text, userInfo) {
    let resolved = text;

    // User name placeholders
    const name = this.firstName(userInfo?.name) || userInfo?.childName || 'the child';
    resolved = resolved.replace(/\{user\.name\}/g, name);
    resolved = resolved.replace(/\{child\.name\}/g, name);
    resolved = resolved.replace(/\{character\.name\}/g, name);

    // Get lazy loaded modules
    const { VOCABULARY, pick } = await memoizedImport('./tier25Vocabulary.js');

    // User preferences
    resolved = resolved.replace(/\{user\.favoriteColor\}/g, userInfo?.favoriteColor || pick(VOCABULARY.objectCategories?.colors || ['red', 'blue', 'green']));
    resolved = resolved.replace(/\{user\.favoriteAnimal\}/g, userInfo?.favoriteAnimal || pick(VOCABULARY.objectCategories?.animals || ['dog', 'cat', 'rabbit']));
    resolved = resolved.replace(/\{user\.age\}/g, userInfo?.age || '6');

    // User interests
    const interests = Array.isArray(userInfo?.interests) ? userInfo.interests : [];
    const primaryInterest = interests[0] || pick(VOCABULARY.actions?.social || ['playing', 'helping', 'sharing']);
    resolved = resolved.replace(/\{user\.interest\}/g, primaryInterest);
    resolved = resolved.replace(/\{user\.hobby\}/g, primaryInterest);

    // FIXED: Ethnicity resolution using existing deriveRegionalEthnicity function
    const ethnicity = deriveRegionalEthnicity(userInfo, userInfo?.avatarIdentity);
    resolved = resolved.replace(/\{ethnicity\}/g, ethnicity);

    // NEW FIX #6: Add {clothing} placeholder support using tier25Vocabulary
    // Use CLOTHING_DETECTION_KEYWORDS for comprehensive clothing options (Tier 1 & 2.5A only)
    try {
      const vocabularyModule = await memoizedImport('./tier25Vocabulary.js');
      const randomClothing = pick(vocabularyModule.CLOTHING_DETECTION_KEYWORDS || ['shirt', 'dress', 'pants', 'jacket']);
      resolved = resolved.replace(/\{clothing\}/g, randomClothing);
    } catch (error) {
      // Fallback to basic clothing if tier25Vocabulary fails
      resolved = resolved.replace(/\{clothing\}/g, pick(['shirt', 'dress', 'pants', 'jacket']));
    }

    return resolved;
  }

  /**
   * 2. MICRO PLACEHOLDERS - Story-specific with deterministic seeding
   */
  async resolveMicroPlaceholders(text, context) {
    const { userInfo = {}, seed = {} } = context;
    let resolved = text;

    // Get lazy loaded modules
    const { VOCABULARY, pick } = await memoizedImport('./tier25Vocabulary.js');
    const { getHairBySkintone, getSkinBySkintone, getCulturalBundle } = await memoizedImport('./StaticDataCache.js');

    // Use seeded values if available, otherwise pick from vocabulary
    const getSeededValue = (key, fallbackArray) => {
      if (seed[key]) return seed[key];
      // Use character seed for consistency if available
      const characterSeed = seed.characterSeed || seed.seed;
      return pick(fallbackArray, characterSeed);
    };

    // Story elements - Use proper VOCABULARY system
    resolved = resolved.replace(/\{animal\}/g, getSeededValue('animal', VOCABULARY.objectCategories?.animals || ['dog', 'cat', 'rabbit']));
    resolved = resolved.replace(/\{pet\}/g, getSeededValue('pet', VOCABULARY.objectCategories?.animals || ['dog', 'cat', 'rabbit']));
    resolved = resolved.replace(/\{color\}/g, getSeededValue('color', VOCABULARY.objectCategories?.colors || ['red', 'blue', 'green']));
    resolved = resolved.replace(/\{size\}/g, getSeededValue('size', ['big', 'small', 'tiny', 'huge', 'large', 'little']));
    resolved = resolved.replace(/\{food\}/g, getSeededValue('food', VOCABULARY.objectCategories?.food || ['apple', 'banana', 'cookie']));
    resolved = resolved.replace(/\{setting\}/g, getSeededValue('setting', ['park', 'forest', 'beach', 'playground', 'garden']));
    resolved = resolved.replace(/\{activity\}/g, getSeededValue('activity', VOCABULARY.actions?.basic || ['playing', 'running', 'jumping']));
    resolved = resolved.replace(/\{emotion\}/g, getSeededValue('emotion', ['happy', 'excited', 'curious', 'brave', 'kind']));
    resolved = resolved.replace(/\{object\}/g, getSeededValue('object', VOCABULARY.objectCategories?.toys || ['ball', 'doll', 'book'])); // Use toys instead of activities

    // Map {hair} to cultural hair logic with synchronous fallback
    const culturalLanguage = this.detectCulturalContext(userInfo);
    resolved = resolved.replace(/\{hair\}/g, () => {
      const skinTone = userInfo?.skinTone || userInfo?.avatarIdentity?.skinTone || userInfo?.avatar?.skinTone || 'medium';
      if (skinTone === 'dark' || skinTone === 'darker') {
        // Use synchronous fallback to avoid async issues in .replace() callbacks
        return 'with authentic African American features';
      }
      // Use StaticDataCache for non-dark skin users
      return getHairBySkintone(skinTone, userInfo?.sessionId || 'default') || '';
    });

    // Map {features} to cultural features logic for ALL skin tones (Complexity A support)  
    resolved = resolved.replace(/\{features\}/g, () => {
      const skinTone = userInfo?.skinTone || userInfo?.avatarIdentity?.skinTone || userInfo?.avatar?.skinTone || 'medium';
      if (skinTone === 'dark' || skinTone === 'darker') {
        const culturalBundle = getCulturalBundle(userInfo, userInfo?.sessionId || 'default');
        return culturalBundle.features || '';
      }
      // FIX: Use StaticDataCache for non-dark skin users  
      return getSkinBySkintone(skinTone, userInfo?.sessionId || 'default') || '';
    });

    // Apply pronoun-based grammar fixes
    const pronoun = this.derivePronoun(userInfo);
    resolved = this.applyPronounGrammarFixes(resolved, pronoun);

    return resolved;
  }

  /**
   * 3. VOCABULARY PLACEHOLDERS - From tier25Vocabulary pools
   */
  async resolveVocabularyPlaceholders(text, context) {
    let resolved = text;

    // Get lazy loaded modules
    const { VOCABULARY, pick } = await memoizedImport('./tier25Vocabulary.js');

    // Replace vocabulary-specific placeholders - with proper VOCABULARY system
    if (VOCABULARY && typeof VOCABULARY === 'object') {
      Object.entries(VOCABULARY).forEach(([category, categoryData]) => {
        if (categoryData && typeof categoryData === 'object') {
          Object.entries(categoryData).forEach(([subcategory, pool]) => {
            if (Array.isArray(pool) && pool.length > 0) {
              const regex = new RegExp(`\\{${subcategory}\\}`, 'g');
              resolved = resolved.replace(regex, () => {
                const characterSeed = context.seed?.characterSeed || context.seed?.seed;
                return pick(pool, characterSeed);
              });
            }
          });
        }
      });
    }

    // Special combined placeholders - with proper VOCABULARY system
    if (VOCABULARY?.objectCategories?.colors && VOCABULARY?.objectCategories?.toys) {
      resolved = resolved.replace(/\{colorful\.object\}/g, () => {
        const characterSeed = context.seed?.characterSeed || context.seed?.seed;
        const color = pick(VOCABULARY.objectCategories.colors, characterSeed);
        const object = pick(VOCABULARY.objectCategories.toys, characterSeed + 1);
        return `${color} ${object}`;
      });
    }

    if (VOCABULARY?.objectCategories?.animals) {
      resolved = resolved.replace(/\{sized\.animal\}/g, () => {
        const characterSeed = context.seed?.characterSeed || context.seed?.seed;
        const size = pick(['big', 'small', 'tiny', 'huge', 'large', 'little'], characterSeed);
        const animal = pick(VOCABULARY.objectCategories.animals, characterSeed + 1);
        return `${size} ${animal}`;
      });
    }

    return resolved;
  }

  /**
   * 4. CULTURAL PLACEHOLDERS - Cultural-aware resolution
   */
  /**
   * Resolve cultural placeholders with precomputed values
   */
  async resolveCulturalPlaceholders(text, userInfo) {
    let resolved = text;
    
    // Get cultural bundle using existing method
    const culturalBundle = await this.getCulturalBundleWithConsistency(userInfo, userInfo?.sessionId || 'default');

    // Detect cultural context from user info (language-based)
    const culturalLanguage = this.detectCulturalContext(userInfo);

    // Get lazy loaded modules
    const { REGIONAL_CULTURAL_CONTEXTS } = await memoizedImport('./tier25Vocabulary.js');

    // Use cultural bundle values (no async callbacks)
    resolved = resolved.replace(/\{cultural\.hair\}/g, culturalBundle.hair || '');
    resolved = resolved.replace(/\{cultural\.features\}/g, culturalBundle.features || '');

    // Cultural context is now language-based
    resolved = resolved.replace(/\{cultural_context\}/g, REGIONAL_CULTURAL_CONTEXTS[culturalLanguage] || '');

    return resolved;
  }

  /**
   * UTILITY FUNCTIONS
   */
  firstName(name) {
    if (!name) return undefined;
    return name.split(' ')[0];
  }

  derivePronoun(userInfo) {
    // Priority 1: Check avatarIdentity.type (processed data)
    const avatarType = userInfo?.avatarIdentity?.type || userInfo?.avatar?.type;
    
    if (avatarType === 'prefer-not-to-answer') {
      return 'they';
    }
    
    if (avatarType === 'boy') {
      return 'he';
    }
    
    if (avatarType === 'girl') {
      return 'she';
    }
    
    // Default fallback for missing data
    return 'they';
  }

  detectCulturalContext(userInfo) {
    // Language-based cultural detection (not skin-tone based)
    const language = userInfo?.nativeLanguage || userInfo?.language || 'en';
    
    // Return language for cultural context mapping
    // English gets no cultural context (American default)
    // Other languages get their specific cultural contexts
    return language.toLowerCase();
  }

  applyPronounGrammarFixes(text, pronoun) {
    let fixed = text;

    if (pronoun === 'they') {
      fixed = fixed.replace(/\bthey is\b/g, 'they are');
      fixed = fixed.replace(/\bthey has\b/g, 'they have');
      fixed = fixed.replace(/\bthey was\b/g, 'they were');
    }

    return fixed;
  }

  /**
   * CULTURAL ENHANCEMENT RESOLVER - For ${bundle.culturalEnhancements}
   */
  async resolveCulturalEnhancements(userInfo, sessionId) {
    // Check skin tone directly instead of flawed cultural type comparison
    const skinTone = userInfo?.skinTone || userInfo?.avatarIdentity?.skinTone || 'medium';
    
    // Only apply enhancements for dark skin users
    if (skinTone !== 'dark' && skinTone !== 'darker') {
      return ''; // Light skin users get empty string
    }
    
    // Generate user-specific seed for consistency
    const userName = userInfo?.name || userInfo?.childName || 'child';
    const culturalSeed = this.generateCulturalSeed(userName, sessionId);
    
    // Use seeded random to select from StaticDataCache cultural bundle with character consistency
    const culturalBundle = await this.getCulturalBundleWithConsistency(userInfo, sessionId);
    const selectedHair = culturalBundle.hair;
    const selectedFeatures = culturalBundle.features;
    
    // Combine into enhancement string
    const enhancements = [selectedHair, selectedFeatures].filter(Boolean).join(', ');
    
    console.log(`🌍 Cultural enhancements for ${userName} (${skinTone}): ${enhancements}`);
    return enhancements ? `with ${enhancements}` : '';
  }

  /**
   * Generate consistent seed for cultural features
   */
  generateCulturalSeed(userName, sessionId) {
    const combined = `${userName}-${sessionId}-cultural`;
    let hash = 0;
    
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash % 999999) + 1;
  }

  /**
   * Get cultural enhancement level for monitoring
   */
  getCulturalEnhancementLevel() {
    // This can be called by Template AB for logging
    return 'UNIVERSAL_CULTURAL_INTELLIGENCE';
  }


  cleanup(text) {
    let cleaned = text;

    // Preserve intentional line breaks, collapse other spaces
    cleaned = cleaned.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n');
    
    // ENHANCED: Fix punctuation and normalize commas more aggressively
    cleaned = cleaned.replace(/\s+([,.!?])/g, '$1');
    cleaned = cleaned.replace(/,+/g, ','); // Remove duplicate commas
    cleaned = cleaned.replace(/,\s*,+/g, ','); // Remove multiple comma sequences
    cleaned = cleaned.replace(/,\s*\./g, '.'); // Fix comma before period
    cleaned = cleaned.replace(/,\s*$/gm, ''); // Remove trailing commas
    cleaned = cleaned.replace(/,\s*!/g, '!'); // Fix comma before exclamation
    cleaned = cleaned.replace(/,\s*\?/g, '?'); // Fix comma before question mark
    
    // Remove duplicate words
    cleaned = cleaned.replace(/\b(\w+)\s+\1\b/g, '$1');
    
    // Remove empty sections between commas
    cleaned = cleaned.replace(/,\s*,/g, ',');
    cleaned = cleaned.replace(/^,|,$/, ''); // Remove leading/trailing commas
    
    // Trim
    cleaned = cleaned.trim();

    return cleaned;
  }

  /**
   * CACHE MANAGEMENT
   */
  cacheResolution(key, resolution) {
    if (this.resolvedCache.size >= this.maxCacheSize) {
      // Remove oldest entries
      const firstKey = this.resolvedCache.keys().next().value;
      this.resolvedCache.delete(firstKey);
    }
    this.resolvedCache.set(key, resolution);
  }

  getCachedResolution(key) {
    return this.resolvedCache.get(key);
  }

  clearCache() {
    this.resolvedCache.clear();
  }

  /**
   * NEW ARCHITECTURE METHODS FOR PHASE 8+
   */

  /**
   * TIER 2.5A: SOPHISTICATED SEMANTIC SCENE EXTRACTION (6-COMPONENT ANALYSIS)
   * Extracts: Action + Object + Location + Atmosphere + Character Mood + Inferred Pose
   * Uses summarized pageText first, fallback to entire pageText
   */
  extractSemanticScene(pageText, context) {
    if (!pageText || typeof pageText !== 'string' || pageText.trim().length === 0) {
      // Return empty string to maintain page text integrity
      console.log('📝 No semantic scene extractable - maintaining text integrity');
      return '';
    }

    // Use summarized pageText first (2 sentences max), fallback to full text
    let textToAnalyze = this.summarizePageText(pageText, context);
    if (!textToAnalyze || textToAnalyze.length < 10) {
      textToAnalyze = pageText;
    }

    const text = textToAnalyze.toLowerCase();
    
    // ADVANCED ACTION VERB RESOLUTION with normalization
    let extractedAction = this.extractAndNormalizeAction(text);
    
    // FIXED: Extract Object (what they're interacting with) - fixed regex to prevent character dropping
    const objectMatch = text.match(/\b(?:with|holding|carrying|using|playing with|reading|eating|building|drawing)\s+(?:a|an|the|some)?\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)*?)(?:\s+(?:in|at|on|through|where|and|,|\.|!|\?)|$)/);
    const extractedObject = objectMatch ? objectMatch[1].trim() : this.inferObjectFromAction(extractedAction);
    
    // Extract Location 
    const locationMatch = text.match(/\b(?:in|at|on|near|by|inside|outside|through)\s+(?:the|a|an)?\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/);
    const extractedLocation = locationMatch ? locationMatch[1] : this.inferLocationFromContext(text);
    
    // Extract Atmosphere (indoor/outdoor, time of day, weather)
    const atmosphere = this.extractAtmosphere(text);
    
    // Infer Character Mood from context
    const characterMood = this.inferCharacterMood(text);
    
    // Infer Character Pose from action
    const characterPose = this.inferCharacterPose(extractedAction, extractedObject);
    
    // Build comprehensive semantic scene with action verb leading
    const sceneComponents = [
      extractedAction,
      extractedObject ? `with ${extractedObject}` : '',
      extractedLocation ? `in the ${extractedLocation}` : '',
      atmosphere,
      characterMood,
      characterPose
    ].filter(Boolean);
    
    const semanticScene = sceneComponents.join(', ');
    console.log(`✅ Sophisticated semantic scene extracted: "${semanticScene}"`);
    return semanticScene;
  }

  /**
   * ADVANCED ACTION VERB RESOLUTION AND NORMALIZATION
   */
   extractAndNormalizeAction(text) {
    // Enhanced Level 0 action detection using proper vocabulary system
    const level0Actions = [
      'wakes up', 'waking up', 'wake up', 'gets up', 'getting up', 'sleeps', 'sleeping', 'sleep',
      'eats', 'eating', 'eat', 'drinks', 'drinking', 'drink', 'plays', 'playing', 'play',
      'goes', 'going', 'go', 'comes', 'coming', 'come', 'sits', 'sitting', 'sit',
      'stands', 'standing', 'stand', 'runs', 'running', 'run', 'walks', 'walking', 'walk',
      'jumps', 'jumping', 'jump', 'climbs', 'climbing', 'climb', 'swings', 'swinging', 'swing',
      'draws', 'drawing', 'draw', 'reads', 'reading', 'read', 'sings', 'singing', 'sing',
      'dances', 'dancing', 'dance', 'builds', 'building', 'build', 'creates', 'creating', 'create'
    ];
    
    // First check for Level 0 specific action patterns with word boundaries
    for (const action of level0Actions) {
      const actionRegex = new RegExp(`\\b${action.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (actionRegex.test(text)) {
        // Normalize Level 0 actions with intelligent inference
        if (action.includes('wakes up') || action.includes('waking up')) {
          return 'sitting up in bed with arms stretched';
        }
        if (action.includes('sleeps') || action.includes('sleeping')) {
          return 'lying peacefully in bed';
        }
        if (action.includes('eats') || action.includes('eating')) {
          return 'sitting at table eating';
        }
        if (action.includes('plays') || action.includes('playing')) {
          return 'playing happily';
        }
        if (action.includes('runs') || action.includes('running')) {
          return 'running energetically';
        }
        if (action.includes('jumps') || action.includes('jumping')) {
          return 'jumping excitedly';
        }
        if (action.includes('cleans') || action.includes('cleaning')) {
          return 'helping to clean up';
        }
        if (action.includes('reads') || action.includes('reading')) {
          return 'sitting comfortably reading';
        }
        if (action.includes('draws') || action.includes('drawing')) {
          return 'sitting at table drawing';
        }
        if (action.includes('helps') || action.includes('helping')) {
          return 'standing ready to help';
        }
        // Default Level 0 action with pose
        return `${action} cheerfully`;
      }
    }

    // Action verb patterns with enhanced normalization mapping
    const actionNormalizationMap = {
      'walked': 'walking through',
      'woke up': 'sitting up in bed with arms stretched',
      'cooking': 'standing at stove cooking',
      'walked through': 'walking through',
      'running around': 'running happily in',
      'jumped on': 'jumping excitedly on',
      'sat down': 'sitting comfortably in',
      'lying down': 'lying peacefully in'
    };

    // Try enhanced mappings
    for (const [pattern, normalized] of Object.entries(actionNormalizationMap)) {
      if (text.includes(pattern)) {
        return normalized;
      }
    }

    // FIXED: Enhanced action verb extraction with proper word boundaries to prevent false positives
    const actionMatch = text.match(/\b(wake|wakes|woke|waking|sleep|sleeps|slept|sleeping|eat|eats|ate|eating|play|plays|played|playing|walk|walks|walked|walking|run|runs|ran|running|jump|jumps|jumped|jumping|help|helps|helped|helping|clean|cleans|cleaned|cleaning|read|reads|reading|draw|draws|drew|drawing|sing|sings|sang|singing|dance|dances|danced|dancing|build|builds|built|building|climb|climbs|climbed|climbing|sit|sits|sat|sitting|stand|stands|stood|standing|come|comes|came|coming|look|looks|looked|looking|see|sees|saw|seeing)\b/);
    
    if (actionMatch) {
      let action = actionMatch[1];
      
      // Enhanced Level 0 specific normalizations with poses
      if (action === 'wake' || action === 'wakes' || action === 'woke') {
        return 'sitting up in bed with arms stretched';
      }
      if (action === 'sleep' || action === 'sleeps' || action === 'slept') {
        return 'lying peacefully in bed';
      }
      if (action === 'eat' || action === 'eats' || action === 'ate') {
        return 'sitting at table eating';
      }
      
      // Normalize to present continuous with intelligent inference
      if (action.endsWith('ed')) {
        action = action.slice(0, -2) + 'ing';
      }
      if (action.endsWith('s') && !action.endsWith('ing')) {
        action = action.slice(0, -1) + 'ing';
      }
      
      // Add Level 0 appropriate descriptors
      if (action === 'playing') return 'playing happily';
      if (action === 'running') return 'running energetically';
      if (action === 'jumping') return 'jumping excitedly';
      if (action === 'helping') return 'standing ready to help';
      if (action === 'reading') return 'sitting comfortably reading';
      if (action === 'drawing') return 'sitting at table drawing';
      
      return action;
    }

    // Intelligent inference for Level 0 common patterns
    if (text.includes('ball is red') || text.includes('red ball')) {
      return 'holding red ball cheerfully';
    }
    if (text.includes('ball is') || text.includes('the ball')) {
      return 'playing with ball happily';
    }

    return 'playing cheerfully';
  }

  /**
   * INFER OBJECT FROM ACTION CONTEXT
   */
  inferObjectFromAction(action) {
    const actionObjectMap = {
      'cooking': 'food',
      'standing over stove': 'cooking utensils',
      'reading': 'book',
      'drawing': 'crayons',
      'writing': 'pencil',
      'playing': 'toys',
      'building': 'blocks',
      'swimming': 'pool toys'
    };
    return actionObjectMap[action] || '';
  }

  /**
   * INFER LOCATION FROM CONTEXT
   */
  inferLocationFromContext(text) {
    // Enhanced Level 0 location detection using tier25Vocabulary
    const level0Locations = [
      'bed', 'bedroom', 'kitchen', 'home', 'house', 'room', 'bathroom', 'living room',
      'dining room', 'playroom', 'inside', 'indoors', 'park', 'playground', 'garden', 
      'yard', 'outside', 'outdoors', 'beach', 'forest', 'field', 'street', 'road', 
      'path', 'tree', 'grass', 'school', 'store', 'shop', 'library', 'hospital', 'farm', 'zoo'
    ];
    
    // Check for Level 0 specific locations first
    for (const location of level0Locations) {
      if (text.includes(location)) {
        // Return intelligent inference based on Level 0 context
        if (location === 'bed' || location === 'bedroom') return 'cozy bedroom';
        if (location === 'kitchen') return 'bright kitchen';
        if (location === 'park' || location === 'playground') return 'sunny park';
        if (location === 'home' || location === 'house') return 'comfortable home';
        if (location === 'school') return 'cheerful school';
        return location;
      }
    }
    
    // Enhanced context-based inference
    if (text.includes('kitchen') || text.includes('cooking') || text.includes('stove') || text.includes('eating')) return 'bright kitchen';
    if (text.includes('bedroom') || text.includes('bed') || text.includes('woke up') || text.includes('sleep')) return 'cozy bedroom';
    if (text.includes('park') || text.includes('playground') || text.includes('swing')) return 'sunny park';
    if (text.includes('beach') || text.includes('sand') || text.includes('ocean')) return 'beautiful beach';
    if (text.includes('forest') || text.includes('trees') || text.includes('woods')) return 'magical forest';
    if (text.includes('school') || text.includes('classroom') || text.includes('teacher')) return 'cheerful school';
    if (text.includes('outside') || text.includes('outdoors') || text.includes('garden')) return 'sunny outdoors';
    if (text.includes('inside') || text.includes('indoors') || text.includes('home') || text.includes('room')) return 'comfortable indoors';
    
    // Return empty string if no clear location - maintain text integrity
    return '';
  }

  /**
   * EXTRACT ATMOSPHERE (enhanced from previous version)
   */
  extractAtmosphere(text) {
    if (text.includes('sunny') || text.includes('bright')) return 'bright sunny day';
    if (text.includes('rainy') || text.includes('cloudy')) return 'cloudy day';
    if (text.includes('morning')) return 'morning light';
    if (text.includes('evening') || text.includes('sunset')) return 'evening atmosphere';
    if (text.includes('night')) return 'nighttime setting';
    return 'warm natural lighting';
  }

  /**
   * INFER CHARACTER MOOD FROM TEXT CONTEXT
   */
  inferCharacterMood(text) {
    if (text.includes('happy') || text.includes('excited') || text.includes('joyful')) return 'happy expression';
    if (text.includes('sad') || text.includes('crying')) return 'sad expression';
    if (text.includes('angry') || text.includes('mad')) return 'frustrated expression';
    if (text.includes('surprised') || text.includes('amazed')) return 'surprised expression';
    if (text.includes('scared') || text.includes('afraid')) return 'worried expression';
    return 'cheerful expression';
  }

  /**
   * INFER CHARACTER POSE FROM ACTION AND OBJECT
   */
  inferCharacterPose(action, object) {
    if (action.includes('sitting')) return 'sitting pose';
    if (action.includes('standing')) return 'standing pose';
    if (action.includes('running')) return 'running pose';
    if (action.includes('jumping')) return 'mid-jump pose';
    if (action.includes('lying') || action.includes('sleeping')) return 'lying down';
    if (action.includes('cooking') || action.includes('stove')) return 'standing at counter';
    if (action.includes('reading')) return 'sitting comfortably';
    if (action.includes('drawing') || action.includes('writing')) return 'seated at table';
    return 'natural active pose';
  }

  /**
   * TIER 2.5B: SIMPLIFIED SCENE EXTRACTION (Basic Regex) - FIXED
   * Extracts: Action + Object + Location with proper preposition handling
   */
  extractSimpleScene(storyText) {
    if (!storyText || typeof storyText !== 'string') return 'playing outdoors';
    
    console.log('🔍 Simple scene extraction from story text');
    
    const text = storyText.toLowerCase();
    
    // ENHANCED ACTION EXTRACTION with preposition preservation
    let extractedAction = '';
    
    // First check for action + preposition patterns (like "walked through")
    const actionWithPrepMatch = text.match(/\b(walked|running|going|moving)\s+(through|in|across|around|over|under)\b/);
    if (actionWithPrepMatch) {
      const baseAction = actionWithPrepMatch[1];
      const preposition = actionWithPrepMatch[2];
      // Normalize to present continuous
      if (baseAction === 'walked') {
        extractedAction = `walking ${preposition}`;
      } else if (baseAction === 'running') {
        extractedAction = `running ${preposition}`;
      } else if (baseAction === 'going') {
        extractedAction = `going ${preposition}`;
      } else if (baseAction === 'moving') {
        extractedAction = `moving ${preposition}`;
      }
    }
    
    // Fallback to basic action normalization if no preposition pattern found
    if (!extractedAction) {
      extractedAction = this.extractAndNormalizeAction(text);
    }
    
    // Enhanced object extraction (suppress for walking scenes to avoid noise)
    let extractedObject = '';
    if (!extractedAction.includes('walking') && !extractedAction.includes('running')) {
      const objectMatch = text.match(/\b(?:carrying|holding|with|playing with|using)\s+(?:a|an|the|some)?\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)*)/);
      extractedObject = objectMatch ? objectMatch[1] : '';
    }
    
    // Enhanced location extraction with multiple prepositions
    const locationMatch = text.match(/\b(?:through|in|at|on|outside|inside|near|by)\s+(?:the|a)?\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/);
    let extractedLocation = locationMatch ? locationMatch[1] : this.inferLocationFromContext(text);
    
    // Build scene avoiding preposition duplication
    const sceneComponents = [];
    
    // Add action (may already include preposition)
    sceneComponents.push(extractedAction);
    
    // Add object if present and not redundant
    if (extractedObject && !extractedAction.includes(extractedObject)) {
      sceneComponents.push(`with ${extractedObject}`);
    }
    
    // Add location with smart preposition handling
    if (extractedLocation) {
      // If action already has preposition, don't add another one
      if (extractedAction.includes('through') || extractedAction.includes('in') || extractedAction.includes('across')) {
        sceneComponents.push(`the ${extractedLocation}`);
      } else {
        sceneComponents.push(`in the ${extractedLocation}`);
      }
    }
    
    const simpleScene = sceneComponents.join(', ').replace(/,\s*,/g, ',').trim();
    console.log(`✅ Simple scene extracted: "${simpleScene}"`);
    return simpleScene;
  }

  /**
   * Generate semantic scene description from page text with fallback (legacy method)
   */
  generateSemanticScene(pageText, context) {
    // Delegate to the new sophisticated extraction for 2.5A
    return this.extractSemanticScene(pageText, context);
  }

  /**
   * Resolve character consistency placeholders using backend service
   */
  async resolveCharacterConsistencyPlaceholders(text, context) {
    let resolved = text;
    const { sessionId, userInfo } = context;
    
    if (!sessionId) return resolved;
    
    try {
      // This would be called by Template AB with character service data
      const characterData = context.characterData;
      
      if (characterData) {
        resolved = resolved.replace(/\{character\.appearance\}/g, characterData.appearance || '');
        resolved = resolved.replace(/\{character\.consistency\}/g, characterData.visualDescription || '');
        resolved = resolved.replace(/\{secondary\.characters\}/g, characterData.secondaryCharacters || '');
        
        // Phase 2: Fix 2.5A Hair/Features Mapping from character consistency
        if (characterData.appearance) {
          resolved = resolved.replace(/\{hair\}/g, characterData.appearance.hair || '');
          resolved = resolved.replace(/\{features\}/g, characterData.appearance.facialFeatures || '');
        }
      }
    } catch (error) {
      console.warn('Character consistency placeholder resolution failed:', error);
    }
    
    return resolved;
  }

  /**
   * Resolve smart semantic placeholders with contextual intelligence
   */
  resolveSmartSemanticPlaceholders(text, context) {
    let resolved = text;
    const { pageText, userInfo, sessionId } = context;
    
    // Semantic scene generation (sophisticated for 2.5A)
    resolved = resolved.replace(/\{semantic_scene\}/g, () => {
      return this.extractSemanticScene(pageText, context);
    });

    // Simple scene generation (basic for 2.5B)  
    resolved = resolved.replace(/\{scene\}/g, () => {
      return this.extractSimpleScene(pageText);
    });
    
    // Smart atmosphere detection
    resolved = resolved.replace(/\{atmosphere\}/g, () => {
      return this.detectAtmosphere(pageText);
    });
    
    // Cultural enhancements for bundle.culturalEnhancements
    resolved = resolved.replace(/\{bundle\.culturalEnhancements\}/g, () => {
      // Use synchronous fallback to avoid async issues in .replace() callbacks
      return 'with authentic cultural elements';
    });
    
    return resolved;
  }

  /**
   * Detect atmosphere from page text (indoor/outdoor)
   */
  detectAtmosphere(pageText) {
    if (!pageText || typeof pageText !== 'string') return '';
    
    const text = pageText.toLowerCase();
    
    // Indoor keywords
    const indoorWords = ['house', 'home', 'room', 'kitchen', 'bedroom', 'bathroom', 'living room', 'school', 'classroom', 'library', 'store', 'restaurant', 'inside'];
    // Outdoor keywords  
    const outdoorWords = ['park', 'garden', 'forest', 'beach', 'playground', 'yard', 'street', 'outside', 'sky', 'sun', 'grass', 'tree', 'flowers'];
    
    const indoorMatches = indoorWords.filter(word => text.includes(word)).length;
    const outdoorMatches = outdoorWords.filter(word => text.includes(word)).length;
    
    if (outdoorMatches > indoorMatches) return 'outdoor';
    if (indoorMatches > outdoorMatches) return 'indoor';
    return ''; // Ambiguous, leave empty
  }

  /**
   * Fill missing placeholders with honest fallbacks
   */
  fillMissingPlaceholders(text, context) {
    let resolved = text;
    
    // FIXED: Fill hair and features with synchronous fallbacks
    resolved = resolved.replace(/\{hair\}/g, () => {
      const skinTone = context.userInfo?.skinTone || context.userInfo?.avatarIdentity?.skinTone || context.userInfo?.avatar?.skinTone || 'medium';
      if (skinTone === 'dark' || skinTone === 'darker') {
        // Use synchronous fallback to avoid async issues in .replace() callbacks
        return 'with authentic African American features';
      }
      return getHairBySkintone(skinTone, context.userInfo?.sessionId || 'default') || '';
    });

    resolved = resolved.replace(/\{features\}/g, () => {
      const skinTone = context.userInfo?.skinTone || context.userInfo?.avatarIdentity?.skinTone || context.userInfo?.avatar?.skinTone || 'medium';
      if (skinTone === 'dark' || skinTone === 'darker') {
        // Use synchronous fallback to avoid async issues in .replace() callbacks
        return 'with photorealistic African features natural hair texture';
      }
      return getSkinBySkintone(skinTone, context.userInfo?.sessionId || 'default') || '';
    });
    
    // Handle new 2.5A/2.5B placeholders
    resolved = resolved.replace(/\{pageText\}/g, () => {
      return this.summarizePageText(context.pageText, context);
    });
    
    resolved = resolved.replace(/\{hairDescription\}/g, () => {
      return this.getCulturalHairDescription(context.userInfo, context.sessionId, context.tierType);
    });
    
    resolved = resolved.replace(/\{facialFeatures\}/g, () => {
      return this.getCulturalFacialFeatures(context.userInfo, context.sessionId, context.tierType);
    });
    
    resolved = resolved.replace(/\{fullFrameworkPrompt\}/g, () => {
      return this.getFullFrameworkPrompt(context);
    });
    
    resolved = resolved.replace(/\{scene\}/g, () => {
      return this.generateSemanticScene(context.pageText, context);
    });
    
    // FIXED: Add avatar type to character and enforce ethnicity derivation
    const name = context.userInfo?.name || context.userInfo?.childName || 'the child';
    const age = context.userInfo?.age || '6';
    const avatarType = this.deriveAvatarType(context.userInfo);
    const characterWithAvatar = avatarType ? `${name} ${age}-year-old ${avatarType}` : `${name} ${age}`;
    const ethnicity = deriveRegionalEthnicity(context.userInfo, context.userInfo?.avatarIdentity);
    
    // Existing safe fallbacks
    const safeMap = {
      character: characterWithAvatar,
      age: age,
      ethnicity: ethnicity, // FIXED: Use derived ethnicity instead of empty string
      spatial_composition: 'centered in frame',
      setting: '', // Leave empty - better than lies
      atmosphere: this.detectAtmosphere(context.pageText), // Smart detection
      props: '', // Leave empty - no lies about props
      action_objects: '', // Leave empty - no lies about objects
      sensory_details: '', // Leave empty - no lies about senses
      cultural_context: REGIONAL_CULTURAL_CONTEXTS[context.userInfo?.nativeLanguage || context.userInfo?.language || 'en'] || '', // Language-based cultural context
      community_context: '', // Leave empty - no lies about community
      secondary_characters: '', // Leave empty - handled by character service
      frameworkPrompt: context.frameworkPrompt || 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality, warm natural lighting', // Use context first, then nuclear fallback with warm natural lighting
      cameraDirective: 'warm perspective'
    };
    
    // Apply safe fallbacks for remaining placeholders
    Object.entries(safeMap).forEach(([key, value]) => {
      const pattern = new RegExp(`\\{${key}\\}`, 'g');
      if (pattern.test(resolved) && value !== '') {
        resolved = resolved.replace(pattern, value);
      } else if (pattern.test(resolved)) {
        // Remove empty placeholders completely
        resolved = resolved.replace(pattern, '');
      }
    });
    
    return resolved;
  }

  /**
   * Derive avatar type from user info
   */
  deriveAvatarType(userInfo) {
    // Try to get from avatar identity first
    if (userInfo?.avatarIdentity?.type) {
      return userInfo.avatarIdentity.type;
    }
    
    // Try to get from avatar object
    if (userInfo?.avatar?.type) {
      return userInfo.avatar.type;
    }
    
    // ENHANCED: Fallback based on name patterns with better inference
    const name = userInfo?.name || userInfo?.childName || '';
    if (name) {
      // Enhanced gender inference with more names
      const maleNames = ['alex', 'sam', 'jordan', 'taylor', 'casey', 'riley', 'jamie', 'avery', 'morgan', 'quinn', 'charlie', 'drew'];
      const femaleNames = ['emma', 'sophia', 'olivia', 'ava', 'isabella', 'mia', 'charlotte', 'amelia', 'harper', 'evelyn', 'grace', 'lily'];
      
      const lowerName = name.toLowerCase();
      if (femaleNames.includes(lowerName)) {
        return 'girl';
      } else if (maleNames.includes(lowerName)) {
        return 'boy';
      } else if (maleNames.some(n => lowerName.includes(n))) {
        return 'child'; // gender-neutral for ambiguous names
      }
    }
    
    return 'child'; // Default to gender-neutral
  }

  /**
   * NEW METHODS FOR 2.5A/2.5B TIER IMPLEMENTATION
   */

  /**
   * Summarize page text with smart extraction and fallback
   */
  summarizePageText(pageText, context) {
    if (!pageText || typeof pageText !== 'string' || pageText.trim().length === 0) {
      return '';
    }
    
    try {
      const text = pageText.trim();
      // Smart extraction logic here
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
      if (sentences.length >= 2) {
        return sentences.slice(0, 2).join(' ').trim();
      }
      
      // Fallback: first 100 characters
      return text.substring(0, 100).trim();
    } catch (error) {
      console.warn('Smart pageText extraction failed, using first 2 sentences fallback:', error);
      // FALLBACK: Extract first 2 sentences
      const sentences = pageText.match(/[^.!?]+[.!?]+/g) || [];
      if (sentences.length >= 2) {
        return sentences.slice(0, 2).join(' ').trim();
      }
      return pageText.substring(0, 100).trim();
    }
  }

  /**
   * Get cultural hair description with StaticDataCache integration
   */
  getCulturalHairDescription(userInfo, sessionId, tierType) {
    try {
      
      if (shouldApplyCulturalEnhancements(userInfo)) {
        // Dark skin users - use synchronous fallbacks to avoid async issues in .replace() callbacks
        return 'with authentic African American features';
      } else {
        // Non-dark skin users - get combined hair and skin descriptions
        const skinTone = userInfo?.skinTone || userInfo?.avatar?.skinTone || 'medium';
        const hairDesc = getHairBySkintone(skinTone, sessionId);
        const skinDesc = getSkinBySkintone(skinTone, sessionId);
        return `${hairDesc}, ${skinDesc}`;
      }
    } catch (error) {
      console.warn('getCulturalHairDescription failed, using hardcoded fallbacks:', error);
      // Hardcoded fallbacks - never escalate tier on this failure
      const skinTone = userInfo?.skinTone || userInfo?.avatarIdentity?.skinTone || 'medium';
      if (skinTone === 'dark' || skinTone === 'darker') {
        return 'with authentic African American features';
      }
      return ''; // Non-dark skin gets empty if StaticDataCache fails
    }
  }

  /**
   * Get cultural facial features with StaticDataCache integration
   */
  getCulturalFacialFeatures(userInfo, sessionId, tierType) {
    try {
      
      if (shouldApplyCulturalEnhancements(userInfo)) {
        // Dark skin users - use synchronous fallbacks to avoid async issues in .replace() callbacks
        return 'with photorealistic African features natural hair texture';
      } else {
        // Non-dark skin users - get combined skin and hair descriptions
        const skinTone = userInfo?.skinTone || userInfo?.avatar?.skinTone || 'medium';
        const skinDesc = getSkinBySkintone(skinTone, sessionId);
        const hairDesc = getHairBySkintone(skinTone, sessionId);
        return `${skinDesc} with ${hairDesc}`;
      }
    } catch (error) {
      console.warn('getCulturalFacialFeatures failed, using hardcoded fallbacks:', error);
      // Hardcoded fallbacks - never escalate tier on this failure
      const skinTone = userInfo?.skinTone || userInfo?.avatarIdentity?.skinTone || 'medium';
      if (skinTone === 'dark' || skinTone === 'darker') {
        return 'with photorealistic African features natural hair texture';
      }
      return ''; // Non-dark skin gets empty if StaticDataCache fails
    }
  }

  /**
   * Get full framework prompt with fallback
   */
  getFullFrameworkPrompt(context) {
    const { frameworkPrompt } = context;
    return frameworkPrompt || 'Contemporary children\'s book illustration with warm natural lighting and known for diverse representation';
  }

  /**
   * Critical validation with updated escalation rules
   */
  validateCriticalResolution(resolvedText, context) {
    // Rule 1: Missing or empty pageText -> Escalate to 2.5D  
    if (!context.pageText || context.pageText.trim().length === 0) {
      console.error('❌ ESCALATION TO 2.5D: pageText is missing or empty');
      throw new Error('ESCALATE_TO_25D: Missing pageText');
    }
    
    // Rule 2: Unresolved pageText placeholder -> Escalate to 2.5D
    if (resolvedText.includes('{pageText}')) {
      console.error('❌ ESCALATION TO 2.5D: {pageText} placeholder unresolved');
      throw new Error('ESCALATE_TO_25D: Unresolved pageText placeholder');
    }
    
    // Rule 3: Both scene AND semantic_scene unresolved -> Escalate to 2.5C
    if (resolvedText.includes('{scene}') && resolvedText.includes('{semantic_scene}')) {
      console.error('❌ ESCALATION TO 2.5C: Both {scene} and {semantic_scene} unresolved');
      throw new Error('ESCALATE_TO_25C: Critical scene placeholders unresolved');
    }
    
    // Rule 4: Resolved template essentially empty -> Escalate to 2.5C
    const meaningfulContent = resolvedText.replace(/\{[^}]*\}/g, '').trim();
    if (meaningfulContent.length < 10) {
      console.error('❌ ESCALATION TO 2.5C: Resolved template essentially empty');
      throw new Error('ESCALATE_TO_25C: Empty resolved template');
    }
    
    console.log('✅ Critical validation passed - no escalation needed');
  }

  /**
   * BATCH RESOLUTION - For multiple texts
   */
  resolveBatch(texts, context) {
    return texts.map(text => this.resolveAllPlaceholders(text, context));
  }

  /**
   * VALIDATION - Check for unresolved placeholders
   */
  validateResolution(text) {
    const unresolvedPlaceholders = text.match(/\{[^}]+\}/g) || [];
    return {
      isFullyResolved: unresolvedPlaceholders.length === 0,
      unresolvedPlaceholders,
      resolvedCount: (text.match(/\{[^}]+\}/g) || []).length - unresolvedPlaceholders.length
    };
  }
}

// Export singleton instance
export const unifiedPlaceholderResolver = new UnifiedPlaceholderResolver();