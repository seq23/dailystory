/**
 * UNIFIED PLACEHOLDER RESOLVER - PHASE 2 IMPLEMENTATION
 * Single resolver for all placeholder resolution across all tiers
 * Replaces scattered placeholder logic with centralized system
 */

import { VOCABULARY, PLACEHOLDER_POOLS, CULTURAL_ARRAYS, pick, createSeededRandom } from './tier25Vocabulary.js';
import { getCulturalBundle, getHairBySkintone, shouldApplyCulturalEnhancements, getSkinBySkintone } from './StaticDataCache.js';

export class UnifiedPlaceholderResolver {
  constructor() {
    this.resolvedCache = new Map();
    this.maxCacheSize = 1000;
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
        processedText = this.resolveSmartSemanticPlaceholders(processedText, context);
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
        processedText = this.resolveCanonicalPlaceholders(processedText, userInfo);
        processedText = this.resolveMicroPlaceholders(processedText, { userInfo, seed });
        processedText = this.resolveVocabularyPlaceholders(processedText, context);
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
  resolveCanonicalPlaceholders(text, userInfo) {
    let resolved = text;

    // User name placeholders
    const name = this.firstName(userInfo?.name) || userInfo?.childName || 'the child';
    resolved = resolved.replace(/\{user\.name\}/g, name);
    resolved = resolved.replace(/\{child\.name\}/g, name);
    resolved = resolved.replace(/\{character\.name\}/g, name);

    // User preferences
    resolved = resolved.replace(/\{user\.favoriteColor\}/g, userInfo?.favoriteColor || pick(PLACEHOLDER_POOLS.colors));
    resolved = resolved.replace(/\{user\.favoriteAnimal\}/g, userInfo?.favoriteAnimal || pick(PLACEHOLDER_POOLS.animals));
    resolved = resolved.replace(/\{user\.age\}/g, userInfo?.age || '6');

    // User interests
    const interests = Array.isArray(userInfo?.interests) ? userInfo.interests : [];
    const primaryInterest = interests[0] || pick(PLACEHOLDER_POOLS.activities);
    resolved = resolved.replace(/\{user\.interest\}/g, primaryInterest);
    resolved = resolved.replace(/\{user\.hobby\}/g, primaryInterest);

    return resolved;
  }

  /**
   * 2. MICRO PLACEHOLDERS - Story-specific with deterministic seeding
   */
  resolveMicroPlaceholders(text, context) {
    const { userInfo = {}, seed = {} } = context;
    let resolved = text;

    // Use seeded values if available, otherwise pick from vocabulary
    const getSeededValue = (key, fallbackArray) => {
      if (seed[key]) return seed[key];
      // Use character seed for consistency if available
      const characterSeed = seed.characterSeed || seed.seed;
      return pick(fallbackArray, characterSeed);
    };

    // Story elements
    resolved = resolved.replace(/\{animal\}/g, getSeededValue('animal', PLACEHOLDER_POOLS.animals));
    resolved = resolved.replace(/\{pet\}/g, getSeededValue('pet', PLACEHOLDER_POOLS.animals));
    resolved = resolved.replace(/\{color\}/g, getSeededValue('color', PLACEHOLDER_POOLS.colors));
    resolved = resolved.replace(/\{size\}/g, getSeededValue('size', PLACEHOLDER_POOLS.sizes));
    resolved = resolved.replace(/\{food\}/g, getSeededValue('food', PLACEHOLDER_POOLS.foods));
    resolved = resolved.replace(/\{setting\}/g, getSeededValue('setting', PLACEHOLDER_POOLS.settings));
    resolved = resolved.replace(/\{activity\}/g, getSeededValue('activity', PLACEHOLDER_POOLS.activities));
    resolved = resolved.replace(/\{emotion\}/g, getSeededValue('emotion', PLACEHOLDER_POOLS.emotions));
    resolved = resolved.replace(/\{object\}/g, getSeededValue('object', PLACEHOLDER_POOLS.activities)); // Fallback to activities

    // Map {hair} to cultural hair logic for Template 2.5B nuclear independence
    const culturalType = this.detectCulturalContext(userInfo);
    resolved = resolved.replace(/\{hair\}/g, () => {
      if (culturalType === 'african') {
        const culturalBundle = getCulturalBundle(userInfo, userInfo?.sessionId || 'default');
        return culturalBundle.hair || '';
      }
      return ''; // No hair description for non-African users
    });

    // Map {features} to cultural features logic for Template 2.5B nuclear independence  
    resolved = resolved.replace(/\{features\}/g, () => {
      if (culturalType === 'african') {
        const culturalBundle = getCulturalBundle(userInfo, userInfo?.sessionId || 'default');
        return culturalBundle.features || '';
      }
      return ''; // No features description for non-African users
    });

    // Apply pronoun-based grammar fixes
    const pronoun = this.derivePronoun(userInfo);
    resolved = this.applyPronounGrammarFixes(resolved, pronoun);

    return resolved;
  }

  /**
   * 3. VOCABULARY PLACEHOLDERS - From tier25Vocabulary pools
   */
  resolveVocabularyPlaceholders(text, context) {
    let resolved = text;

    // Replace vocabulary-specific placeholders - with safety checks
    if (PLACEHOLDER_POOLS && typeof PLACEHOLDER_POOLS === 'object') {
      Object.entries(PLACEHOLDER_POOLS).forEach(([category, pool]) => {
        if (Array.isArray(pool) && pool.length > 0) {
          const regex = new RegExp(`\\{${category}\\}`, 'g');
          resolved = resolved.replace(regex, () => {
            const characterSeed = context.seed?.characterSeed || context.seed?.seed;
            return pick(pool, characterSeed);
          });
        }
      });
    }

    // Special combined placeholders - with safety checks
    if (PLACEHOLDER_POOLS?.colors && PLACEHOLDER_POOLS?.activities) {
      resolved = resolved.replace(/\{colorful\.object\}/g, () => {
        const characterSeed = context.seed?.characterSeed || context.seed?.seed;
        const color = pick(PLACEHOLDER_POOLS.colors, characterSeed);
        const object = pick(PLACEHOLDER_POOLS.activities, characterSeed + 1); // Use activities as objects
        return `${color} ${object}`;
      });
    }

    if (PLACEHOLDER_POOLS?.sizes && PLACEHOLDER_POOLS?.animals) {
      resolved = resolved.replace(/\{sized\.animal\}/g, () => {
        const characterSeed = context.seed?.characterSeed || context.seed?.seed;
        const size = pick(PLACEHOLDER_POOLS.sizes, characterSeed);
        const animal = pick(PLACEHOLDER_POOLS.animals, characterSeed + 1);
        return `${size} ${animal}`;
      });
    }

    return resolved;
  }

  /**
   * 4. CULTURAL PLACEHOLDERS - Cultural-aware resolution
   */
  resolveCulturalPlaceholders(text, userInfo) {
    let resolved = text;

    // Detect cultural context from user info
    const culturalType = this.detectCulturalContext(userInfo);

    // Cultural hair and features
    resolved = resolved.replace(/\{cultural\.hair\}/g, () => {
      if (culturalType === 'none') return '';
      const culturalBundle = getCulturalBundle(userInfo, userInfo?.sessionId || 'default');
      return culturalBundle.hair || '';
    });

    resolved = resolved.replace(/\{cultural\.features\}/g, () => {
      if (culturalType === 'none') return '';
      const culturalBundle = getCulturalBundle(userInfo, userInfo?.sessionId || 'default');
      return culturalBundle.features || '';
    });

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
    // Simple pronoun derivation - can be enhanced
    return 'they'; // Default to inclusive pronoun
  }

  detectCulturalContext(userInfo) {
    // Enhanced cultural detection for dark skin tones with language validation
    const skinTone = userInfo?.skinTone || userInfo?.avatarIdentity?.skinTone || userInfo?.avatar?.skinTone;
    const language = userInfo?.nativeLanguage || userInfo?.language || 'en';
    
    // Only dark skin users with supported languages get cultural enhancements
    if (skinTone === 'dark' || skinTone === 'darker') {
      // Only EN/FR/ES/PT languages supported for African cultural features
      const supportedLanguages = ['en', 'fr', 'es', 'pt'];
      if (supportedLanguages.includes(language.toLowerCase())) {
        return 'african';
      }
    }
    
    // All other users (light skin + any language, or dark skin + unsupported language)
    return 'none';
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
  resolveCulturalEnhancements(userInfo, sessionId) {
    const culturalType = this.detectCulturalContext(userInfo);
    
    // Only apply enhancements for detected cultural contexts (dark skin users)
    if (culturalType !== 'african') {
      return ''; // Light skin users get empty string
    }
    
    // Generate user-specific seed for consistency
    const userName = userInfo?.name || userInfo?.childName || 'child';
    const culturalSeed = this.generateCulturalSeed(userName, sessionId);
    
    // Use seeded random to select from StaticDataCache cultural bundle
    const culturalBundle = getCulturalBundle(userInfo, sessionId);
    const selectedHair = culturalBundle.hair;
    const selectedFeatures = culturalBundle.features;
    
    // Combine into enhancement string
    const enhancements = [selectedHair, selectedFeatures].filter(Boolean).join(', ');
    
    console.log(`🌍 Cultural enhancements for ${userName} (${culturalType}): ${enhancements}`);
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

  /**
   * Check if cultural features should be applied
   */
  shouldApplyCulturalFeatures(userInfo) {
    const culturalType = this.detectCulturalContext(userInfo);
    return culturalType === 'african';
  }

  cleanup(text) {
    let cleaned = text;

    // Preserve intentional line breaks, collapse other spaces
    cleaned = cleaned.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n');
    
    // Fix punctuation
    cleaned = cleaned.replace(/\s+([,.!?])/g, '$1');
    
    // Remove duplicate words
    cleaned = cleaned.replace(/\b(\w+)\s+\1\b/g, '$1');
    
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
   * Generate semantic scene description from page text with fallback
   */
  generateSemanticScene(pageText, context) {
    if (!pageText || typeof pageText !== 'string' || pageText.trim().length === 0) {
      // FALLBACK: Use action_objects from PLACEHOLDER_POOLS when pageText is empty
      console.log('📝 {semantic_scene} fallback: Using action_objects from PLACEHOLDER_POOLS');
      const { sessionId } = context;
      
      if (PLACEHOLDER_POOLS?.actions?.basic && PLACEHOLDER_POOLS?.objectCategories?.toys) {
        const action = pick(PLACEHOLDER_POOLS.actions.basic, sessionId);
        const object = pick(PLACEHOLDER_POOLS.objectCategories.toys, sessionId + 1);
        return `${action} with ${object}`;
      }
      
      return 'playing with colorful toys'; // Ultimate fallback
    }
    
    const text = pageText.toLowerCase();
    
    // Extract action verbs and key elements
    const actionWords = text.match(/\b(running|jumping|playing|exploring|discovering|building|cooking|reading|singing|dancing|helping)\b/g) || [];
    const locationWords = text.match(/\b(park|forest|school|home|garden|beach|kitchen|playground|library|zoo)\b/g) || [];
    const objectWords = text.match(/\b(ball|book|tree|flower|toy|game|puzzle|instrument|food|animal)\b/g) || [];
    
    // Build semantic scene from pageText (primary source)
    const components = [];
    if (actionWords.length > 0) components.push(actionWords[0]);
    if (locationWords.length > 0) components.push(`in the ${locationWords[0]}`);
    if (objectWords.length > 0) components.push(`with ${objectWords[0]}`);
    
    if (components.length > 0) {
      return components.join(' ');
    }
    
    // Fallback if pageText doesn't yield meaningful components
    console.log('📝 {semantic_scene} fallback: pageText extraction yielded no components');
    const { sessionId } = context;
    
    if (PLACEHOLDER_POOLS?.actions?.basic && PLACEHOLDER_POOLS?.objectCategories?.toys) {
      const action = pick(PLACEHOLDER_POOLS.actions.basic, sessionId);
      const object = pick(PLACEHOLDER_POOLS.objectCategories.toys, sessionId + 1);
      return `${action} with ${object}`;
    }
    
    return 'engaging in fun activities'; // Ultimate fallback
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
    
    // Semantic scene generation
    resolved = resolved.replace(/\{semantic_scene\}/g, () => {
      return this.generateSemanticScene(pageText, context);
    });
    
    // Smart atmosphere detection
    resolved = resolved.replace(/\{atmosphere\}/g, () => {
      return this.detectAtmosphere(pageText);
    });
    
    // Cultural enhancements for bundle.culturalEnhancements
    resolved = resolved.replace(/\{bundle\.culturalEnhancements\}/g, () => {
      return this.resolveCulturalEnhancements(userInfo, sessionId);
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
    
    // Existing safe fallbacks
    const safeMap = {
      character: context.userInfo?.name || 'the child',
      age: context.userInfo?.age || '6',
      ethnicity: '', // Leave empty - no lies
      spatial_composition: 'centered in frame',
      setting: '', // Leave empty - better than lies
      atmosphere: this.detectAtmosphere(context.pageText), // Smart detection
      props: '', // Leave empty - no lies about props
      action_objects: '', // Leave empty - no lies about objects
      sensory_details: '', // Leave empty - no lies about senses
      cultural_context: '', // Leave empty - handled by cultural system
      community_context: '', // Leave empty - no lies about community
      secondary_characters: '', // Leave empty - handled by character service
      frameworkPrompt: context.frameworkPrompt || 'Contemporary children\'s book illustration with sharp facial definition, refined features, detailed eye rendering with clear highlights, charming expressions, character-focused composition, shallow DOF, high rendering quality, facial detail emphasis, detailed hair strands, artistic lighting, vibrant color harmony, consistent character design, child-friendly aesthetic, diverse representation, painterly texture quality', // Use context first, then nuclear fallback
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
        // Dark skin users - get cultural arrays from StaticDataCache
        if (tierType === '2.5A') {
          // Premium: StaticDataCache + character consistency (when available)
          const culturalBundle = getCulturalBundle(userInfo, sessionId);
          return culturalBundle.hair || 'with authentic African American features';
        } else {
          // Basic: Just StaticDataCache
          const culturalBundle = getCulturalBundle(userInfo, sessionId);
          return culturalBundle.hair || 'with authentic African American features';
        }
      } else {
        // Non-dark skin users - get hair mappings from StaticDataCache
        return getHairBySkintone(userInfo?.skinTone || 'medium', sessionId);
      }
    } catch (error) {
      console.warn('getCulturalHairDescription failed, using hardcoded fallbacks:', error);
      // Hardcoded fallbacks - never escalate tier on this failure
      if (this.shouldApplyCulturalFeatures(userInfo)) {
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
        // Dark skin users - get cultural arrays from StaticDataCache
        if (tierType === '2.5A') {
          // Premium: StaticDataCache + character consistency (when available)
          const culturalBundle = getCulturalBundle(userInfo, sessionId);
          return culturalBundle.features || 'with photorealistic African features natural hair texture';
        } else {
          // Basic: Just StaticDataCache
          const culturalBundle = getCulturalBundle(userInfo, sessionId);
          return culturalBundle.features || 'with photorealistic African features natural hair texture';
        }
      } else {
        // Non-dark skin users - get skin mappings from StaticDataCache
        return getSkinBySkintone(userInfo?.skinTone || 'medium', sessionId);
      }
    } catch (error) {
      console.warn('getCulturalFacialFeatures failed, using hardcoded fallbacks:', error);
      // Hardcoded fallbacks - never escalate tier on this failure
      if (this.shouldApplyCulturalFeatures(userInfo)) {
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