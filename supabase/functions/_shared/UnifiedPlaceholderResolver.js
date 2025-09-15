/**
 * UNIFIED PLACEHOLDER RESOLVER - PHASE 2 IMPLEMENTATION
 * Single resolver for all placeholder resolution across all tiers
 * Replaces scattered placeholder logic with centralized system
 */

import { VOCABULARY, PLACEHOLDER_POOLS, CULTURAL_ARRAYS, pick, getCulturalSelection, createSeededRandom } from './tier25Vocabulary.js';

export class UnifiedPlaceholderResolver {
  constructor() {
    this.resolvedCache = new Map();
    this.maxCacheSize = 1000;
  }

  /**
   * MASTER PLACEHOLDER RESOLUTION
   * Resolves all types of placeholders in a unified way
   */
  resolveAllPlaceholders(text, context = {}) {
    const { userInfo = {}, seed = {}, sessionId, pageNumber } = context;
    
    if (!text || typeof text !== 'string') return text;

    let processedText = text;
    const resolutions = [];

    try {
      // 1. CANONICAL PLACEHOLDERS (user-specific)
      processedText = this.resolveCanonicalPlaceholders(processedText, userInfo);
      
      // 2. MICRO PLACEHOLDERS (story-specific with seed)
      processedText = this.resolveMicroPlaceholders(processedText, { userInfo, seed });
      
      // 3. VOCABULARY PLACEHOLDERS (from tier25Vocabulary)
      processedText = this.resolveVocabularyPlaceholders(processedText, context);
      
      // 4. CULTURAL PLACEHOLDERS (cultural-aware)
      processedText = this.resolveCulturalPlaceholders(processedText, userInfo);
      
      // 5. CULTURAL ENHANCEMENTS (bundle.culturalEnhancements)
      const culturalEnhancements = this.resolveCulturalEnhancements(userInfo, sessionId);
      processedText = processedText.replace(/\{bundle\.culturalEnhancements\}/g, culturalEnhancements);
      
      // 6. CLEANUP AND GRAMMAR FIXES
      processedText = this.cleanup(processedText);

      console.log(`🔧 [UnifiedPlaceholderResolver] Resolved placeholders for session ${sessionId}`);
      
      return {
        resolvedText: processedText,
        resolutions,
        success: true
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
    resolved = resolved.replace(/\{user\.favoriteColor\}/g, userInfo?.favoriteColor || pick(VOCABULARY.colors));
    resolved = resolved.replace(/\{user\.favoriteAnimal\}/g, userInfo?.favoriteAnimal || pick(VOCABULARY.animals.domestic));
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
        const characterSeed = userInfo?.sessionId ? this.generateCulturalSeed(userInfo.name, userInfo.sessionId) : undefined;
        return getCulturalSelection('african', 'hair', characterSeed) || '';
      }
      return ''; // No hair description for non-African users
    });

    // Map {features} to cultural features logic for Template 2.5B nuclear independence  
    resolved = resolved.replace(/\{features\}/g, () => {
      if (culturalType === 'african') {
        const characterSeed = userInfo?.sessionId ? this.generateCulturalSeed(userInfo.name, userInfo.sessionId) + 1 : undefined;
        return getCulturalSelection('african', 'features', characterSeed) || '';
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

    // Replace vocabulary-specific placeholders
    Object.entries(PLACEHOLDER_POOLS).forEach(([category, pool]) => {
      const regex = new RegExp(`\\{${category}\\}`, 'g');
      resolved = resolved.replace(regex, () => {
        const characterSeed = context.seed?.characterSeed || context.seed?.seed;
        return pick(pool, characterSeed);
      });
    });

    // Special combined placeholders
    resolved = resolved.replace(/\{colorful\.object\}/g, () => {
      const characterSeed = context.seed?.characterSeed || context.seed?.seed;
      const color = pick(PLACEHOLDER_POOLS.colors, characterSeed);
      const object = pick(PLACEHOLDER_POOLS.activities, characterSeed + 1); // Use activities as objects
      return `${color} ${object}`;
    });

    resolved = resolved.replace(/\{sized\.animal\}/g, () => {
      const characterSeed = context.seed?.characterSeed || context.seed?.seed;
      const size = pick(PLACEHOLDER_POOLS.sizes, characterSeed);
      const animal = pick(PLACEHOLDER_POOLS.animals, characterSeed + 1);
      return `${size} ${animal}`;
    });

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
      const characterSeed = userInfo?.sessionId ? this.generateCulturalSeed(userInfo.name, userInfo.sessionId) : undefined;
      return getCulturalSelection(culturalType, 'hair', characterSeed) || '';
    });

    resolved = resolved.replace(/\{cultural\.features\}/g, () => {
      if (culturalType === 'none') return '';
      const characterSeed = userInfo?.sessionId ? this.generateCulturalSeed(userInfo.name, userInfo.sessionId) + 1 : undefined;
      return getCulturalSelection(culturalType, 'features', characterSeed) || '';
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
    const skinTone = userInfo?.skinTone || userInfo?.avatarIdentity?.skinTone;
    const language = userInfo?.language || 'en';
    
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
    
    // Use seeded random to select from CULTURAL_ARRAYS.african
    const selectedHair = getCulturalSelection('african', 'hair', culturalSeed);
    const selectedFeatures = getCulturalSelection('african', 'features', culturalSeed + 1);
    
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

    // Remove extra spaces
    cleaned = cleaned.replace(/\s+/g, ' ');
    
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