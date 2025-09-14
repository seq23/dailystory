// ============= UNIVERSAL PLACEHOLDER RESOLVER - PHASE 3 IMPLEMENTATION =============
// Comprehensive placeholder resolution system with cultural intelligence and semantic enhancement
// Supports both template systems (runware-template-ab and runware-template-cd)

import { CULTURAL_ARRAYS, SEMANTIC_EXTRACTION } from './tier25Vocabulary.js';

/**
 * PHASE 3.1: Cultural Trigger Detection System
 * Analyzes user info and content to determine cultural enhancements needed
 */
export class CulturalTriggerDetector {
  static detectCulturalProfile(userInfo, avatarIdentity) {
    const profile = {
      culturalEnhancementNeeded: false,
      culturalType: 'default',
      nativeLanguage: 'en',
      skinTone: 'medium',
      hasCulturalFeatures: false,
      enhancementStrength: 'none' // none, light, medium, strong
    };

    // Extract language and skin tone from multiple sources
    const nativeLanguage = avatarIdentity?.nativeLanguage || userInfo?.nativeLanguage || userInfo?.native_language || 'en';
    const skinTone = avatarIdentity?.skinTone || userInfo?.avatar?.skinTone || userInfo?.skinTone || 'medium';
    
    profile.nativeLanguage = nativeLanguage;
    profile.skinTone = skinTone;

    // Trigger 1: Non-English speakers get cultural enhancement
    if (nativeLanguage !== 'en') {
      profile.culturalEnhancementNeeded = true;
      profile.culturalType = nativeLanguage;
      profile.enhancementStrength = 'strong';
      profile.hasCulturalFeatures = true;
      
      console.log(`🌍 Cultural Trigger: Non-English speaker detected (${nativeLanguage})`);
      return profile;
    }

    // Trigger 2: English speakers with dark skin tone get African American features
    if (nativeLanguage === 'en' && (skinTone === 'dark' || skinTone === 'darker')) {
      profile.culturalEnhancementNeeded = true;
      profile.culturalType = 'en-african-american';
      profile.enhancementStrength = 'strong';
      profile.hasCulturalFeatures = true;
      
      console.log(`🌍 Cultural Trigger: African American features detected (English + dark skin)`);
      return profile;
    }

    // Trigger 3: Medium skin tone with English gets light enhancement
    if (nativeLanguage === 'en' && skinTone === 'medium') {
      profile.culturalEnhancementNeeded = true;
      profile.culturalType = 'en-diverse';
      profile.enhancementStrength = 'light';
      profile.hasCulturalFeatures = true;
      
      console.log(`🌍 Cultural Trigger: Diverse features detected (English + medium skin)`);
      return profile;
    }

    console.log(`🌍 Cultural Trigger: No cultural enhancement (English + light skin)`);
    return profile;
  }

  static getCulturalArrays(culturalType) {
    // Map cultural types to appropriate arrays
    const culturalMappings = {
      'en-african-american': {
        hairstyles: CULTURAL_ARRAYS.HARDCODED_AFRICAN_AMERICAN_HAIRSTYLES,
        facialFeatures: CULTURAL_ARRAYS.HARDCODED_AFRICAN_AMERICAN_FACIAL_FEATURES,
        skinTones: CULTURAL_ARRAYS.HARDCODED_AFRICAN_AMERICAN_SKIN_TONES,
        authenticity: null
      },
      'zh': {
        hairstyles: { boys: ['neat black hair'], girls: ['long black hair'] },
        facialFeatures: ['East Asian facial features'],
        skinTones: ['fair complexion', 'light skin tone'],
        authenticity: CULTURAL_ARRAYS.REGIONAL_AUTHENTICITY_STRINGS.zh
      },
      'hi': {
        hairstyles: { boys: ['dark hair'], girls: ['long dark hair'] },
        facialFeatures: ['South Asian facial features'],
        skinTones: ['warm brown complexion', 'medium skin tone'],
        authenticity: CULTURAL_ARRAYS.REGIONAL_AUTHENTICITY_STRINGS.hi
      },
      'ar': {
        hairstyles: { boys: ['dark hair'], girls: ['dark hair'] },
        facialFeatures: ['Middle Eastern facial features'],
        skinTones: ['olive complexion', 'warm skin tone'],
        authenticity: CULTURAL_ARRAYS.REGIONAL_AUTHENTICITY_STRINGS.ar
      },
      'fr': {
        hairstyles: { boys: ['styled hair'], girls: ['styled hair'] },
        facialFeatures: ['European facial features'],
        skinTones: ['fair complexion', 'light skin tone'],
        authenticity: CULTURAL_ARRAYS.REGIONAL_AUTHENTICITY_STRINGS.fr
      },
      'pt': {
        hairstyles: { boys: ['wavy hair'], girls: ['curly hair'] },
        facialFeatures: ['Latin American facial features'],
        skinTones: ['warm complexion', 'medium skin tone'],
        authenticity: CULTURAL_ARRAYS.REGIONAL_AUTHENTICITY_STRINGS.pt
      },
      'en-diverse': {
        hairstyles: { boys: ['styled hair'], girls: ['styled hair'] },
        facialFeatures: ['diverse multicultural features'],
        skinTones: ['medium complexion', 'warm skin tone'],
        authenticity: 'diverse multicultural features'
      }
    };

    return culturalMappings[culturalType] || culturalMappings['en-diverse'];
  }
}

/**
 * PHASE 3.1: Semantic Enhancement Functions
 * Extract meaningful context from story text to enhance placeholders
 */
export class SemanticEnhancer {
  static extractCommunityContext(storyText) {
    if (!storyText) return 'friendly community setting';

    const text = storyText.toLowerCase();
    const contexts = [];

    // Check for setting patterns
    for (const [setting, patterns] of Object.entries(SEMANTIC_EXTRACTION.settingPatterns)) {
      for (const pattern of patterns) {
        if (text.includes(pattern)) {
          contexts.push(this.getSettingContext(setting));
          break;
        }
      }
    }

    // Check for social patterns
    for (const [social, patterns] of Object.entries(SEMANTIC_EXTRACTION.socialPatterns)) {
      for (const pattern of patterns) {
        if (text.includes(pattern)) {
          contexts.push(this.getSocialContext(social));
          break;
        }
      }
    }

    // Return first valid context or default
    return contexts.length > 0 ? contexts[0] : 'warm, welcoming community atmosphere';
  }

  static getSettingContext(setting) {
    const settingContexts = {
      'home': 'cozy family home environment',
      'school': 'supportive educational community',
      'park': 'joyful outdoor play community',
      'neighborhood': 'friendly neighborhood community',
      'store': 'bustling market community',
      'library': 'quiet learning community',
      'outdoors': 'natural outdoor community',
      'city': 'vibrant urban community'
    };
    return settingContexts[setting] || 'welcoming community setting';
  }

  static getSocialContext(social) {
    const socialContexts = {
      'individual': 'peaceful individual space',
      'family': 'loving family environment',
      'friends': 'playful friendship circle',
      'class': 'collaborative classroom community',
      'community': 'inclusive community gathering'
    };
    return socialContexts[social] || 'supportive social environment';
  }

  static extractPropsAndObjects(storyText) {
    if (!storyText) return 'colorful props and engaging objects';

    const text = storyText.toLowerCase();
    const foundProps = [];

    // Extract props by category
    for (const [category, items] of Object.entries(SEMANTIC_EXTRACTION.propCategories)) {
      for (const item of items) {
        if (text.includes(item)) {
          foundProps.push(`${this.getColorDescriptor()} ${item}`);
        }
      }
    }

    // Return props or default
    if (foundProps.length > 0) {
      return foundProps.slice(0, 3).join(', ');
    }

    return 'vibrant toys and colorful objects';
  }

  static getColorDescriptor() {
    const colors = ['bright', 'colorful', 'vibrant', 'cheerful', 'sunny', 'playful'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  static extractEmotionalTone(storyText) {
    if (!storyText) return 'joyful and engaging';

    const text = storyText.toLowerCase();
    
    // Check emotion patterns
    for (const [emotion, patterns] of Object.entries(SEMANTIC_EXTRACTION.emotionPatterns)) {
      for (const pattern of patterns) {
        if (text.includes(pattern)) {
          return this.getEmotionalDescriptor(emotion);
        }
      }
    }

    return 'happy and enthusiastic';
  }

  static getEmotionalDescriptor(emotion) {
    const emotionDescriptors = {
      'joyful': 'joyful and radiant',
      'peaceful': 'calm and serene',
      'adventurous': 'excited and adventurous',
      'mysterious': 'curious and intrigued',
      'caring': 'loving and compassionate',
      'determined': 'focused and determined',
      'sad': 'thoughtful and gentle',
      'worried': 'concerned but hopeful'
    };
    return emotionDescriptors[emotion] || 'happy and engaged';
  }
}

/**
 * PHASE 3.2: Universal Placeholder Resolver
 * Main class that resolves all placeholders with cultural intelligence and semantic enhancement
 */
export class UniversalPlaceholderResolver {
  constructor(userInfo, avatarIdentity, storyText, sessionId = null) {
    this.userInfo = userInfo || {};
    this.avatarIdentity = avatarIdentity || {};
    this.storyText = storyText || '';
    this.sessionId = sessionId;
    
    // Detect cultural profile
    this.culturalProfile = CulturalTriggerDetector.detectCulturalProfile(userInfo, avatarIdentity);
    this.culturalArrays = CulturalTriggerDetector.getCulturalArrays(this.culturalProfile.culturalType);
    
    console.log('🎯 Universal Placeholder Resolver initialized:', {
      culturalType: this.culturalProfile.culturalType,
      enhancementStrength: this.culturalProfile.enhancementStrength,
      hasCulturalFeatures: this.culturalProfile.hasCulturalFeatures
    });
  }

  /**
   * Main resolution method - resolves all placeholders in a template
   */
  resolve(template, additionalData = {}) {
    console.log('🔧 Resolving placeholders in template:', template.substring(0, 100) + '...');
    
    let resolvedTemplate = template;
    
    // Core placeholders
    const coreResolvers = {
      '{character}': () => this.resolveCharacter(),
      '{age}': () => this.resolveAge(),
      '{ethnicity}': () => this.resolveEthnicity(),
      '{hair}': () => this.resolveHair(),
      '{features}': () => this.resolveFeatures(),
      '{emotion}': () => this.resolveEmotion(),
      '{scene}': () => this.resolveScene(),
      '{pageText}': () => this.storyText || 'engaging story scene',
      '{setting}': () => this.resolveSetting(),
      '{atmosphere}': () => this.resolveAtmosphere(),
      '{frameworkPrompt}': () => additionalData.frameworkPrompt || 'children\'s book illustration style'
    };

    // PHASE 3.2: Advanced placeholders with semantic enhancement
    const advancedResolvers = {
      '{cultural_context}': () => this.resolveCulturalContext(),
      '{community_context}': () => this.resolveCommunityContext(),
      '{secondary_characters}': () => this.resolveSecondaryCharacters(additionalData.secondaryCharacters),
      '{props}': () => this.resolveProps(),
      '{action_objects}': () => this.resolveActionObjects(),
      '{sensory_details}': () => this.resolveSensoryDetails(),
      '{spatial_composition}': () => this.resolveSpatialComposition(),
      '{cameraDirective}': () => this.resolveCameraDirective()
    };

    // Apply all resolvers
    const allResolvers = { ...coreResolvers, ...advancedResolvers };
    
    for (const [placeholder, resolver] of Object.entries(allResolvers)) {
      const value = resolver();
      resolvedTemplate = resolvedTemplate.replace(new RegExp(this.escapeRegex(placeholder), 'g'), value || '');
    }

    // Clean up template
    resolvedTemplate = this.cleanTemplate(resolvedTemplate);
    
    console.log('✅ Template resolved successfully with cultural enhancement level:', this.culturalProfile.enhancementStrength);
    
    return resolvedTemplate;
  }

  // ============= CORE PLACEHOLDER RESOLVERS =============
  
  resolveCharacter() {
    const childName = this.userInfo?.name || this.userInfo?.childName || this.avatarIdentity?.name || 'child';
    return childName;
  }

  resolveAge() {
    const age = this.userInfo?.age;
    return age ? `age ${age}` : '';
  }

  resolveEthnicity() {
    if (!this.culturalProfile.hasCulturalFeatures) {
      return 'diverse multicultural background';
    }

    if (this.culturalArrays?.authenticity) {
      return this.culturalArrays.authenticity;
    }

    // Fallback based on cultural type
    const ethnicityMap = {
      'en-african-american': 'African American',
      'en-diverse': 'diverse multicultural background',
      'zh': 'Chinese heritage',
      'hi': 'Indian heritage',
      'ar': 'Arabic heritage',
      'fr': 'French heritage',
      'pt': 'Portuguese heritage'
    };

    return ethnicityMap[this.culturalProfile.culturalType] || 'diverse background';
  }

  resolveHair() {
    if (!this.culturalProfile.hasCulturalFeatures) {
      return 'well-styled hair';
    }

    const avatarType = this.avatarIdentity?.type || this.userInfo?.avatar?.type || 'prefer-not-to-answer';
    const genderKey = (avatarType === 'girl') ? 'girls' : 'boys';
    
    if (this.culturalArrays?.hairstyles?.[genderKey]) {
      const hairStyles = this.culturalArrays.hairstyles[genderKey];
      if (hairStyles.length > 0) {
        const randomHair = hairStyles[Math.floor(Math.random() * hairStyles.length)];
        return randomHair;
      }
    }

    return 'styled hair';
  }

  resolveFeatures() {
    if (!this.culturalProfile.hasCulturalFeatures) {
      return 'friendly facial features';
    }

    if (this.culturalArrays?.facialFeatures?.length > 0) {
      const randomFeature = this.culturalArrays.facialFeatures[
        Math.floor(Math.random() * this.culturalArrays.facialFeatures.length)
      ];
      return randomFeature;
    }

    return 'expressive facial features';
  }

  resolveEmotion() {
    return SemanticEnhancer.extractEmotionalTone(this.storyText);
  }

  resolveScene() {
    if (this.storyText && this.storyText.length > 10) {
      return this.storyText.substring(0, 100).replace(/[.!?]+$/, '');
    }
    return 'engaging in a fun activity';
  }

  resolveSetting() {
    return SemanticEnhancer.extractCommunityContext(this.storyText);
  }

  resolveAtmosphere() {
    const atmospheres = [
      'bright and cheerful', 'warm and inviting', 'colorful and vibrant',
      'peaceful and serene', 'joyful and energetic', 'cozy and comfortable'
    ];
    return atmospheres[Math.floor(Math.random() * atmospheres.length)];
  }

  // ============= PHASE 3.2: ADVANCED PLACEHOLDER RESOLVERS =============

  resolveCulturalContext() {
    if (!this.culturalProfile.hasCulturalFeatures) {
      return 'inclusive diverse community';
    }

    const culturalContexts = {
      'en-african-american': 'celebrating African American heritage and community',
      'zh': 'honoring Chinese cultural traditions and values',
      'hi': 'embracing Indian cultural richness and diversity',
      'ar': 'reflecting Arabic cultural heritage and wisdom',
      'fr': 'appreciating French cultural elegance and artistry',
      'pt': 'celebrating Portuguese cultural warmth and community',
      'en-diverse': 'embracing multicultural diversity and inclusion'
    };

    return culturalContexts[this.culturalProfile.culturalType] || 'celebrating cultural diversity';
  }

  resolveCommunityContext() {
    return SemanticEnhancer.extractCommunityContext(this.storyText);
  }

  resolveSecondaryCharacters(providedCharacters) {
    if (providedCharacters && providedCharacters.trim() && providedCharacters !== 'none') {
      return providedCharacters;
    }

    // Generate contextual secondary characters if none provided
    const contextualCharacters = [
      'friendly classmates', 'supportive family members', 'kind neighbors',
      'helpful friends', 'caring teachers', 'playful companions'
    ];
    
    return contextualCharacters[Math.floor(Math.random() * contextualCharacters.length)];
  }

  resolveProps() {
    return SemanticEnhancer.extractPropsAndObjects(this.storyText);
  }

  resolveActionObjects() {
    const actionObjects = [
      'interactive learning materials', 'engaging play items', 'creative art supplies',
      'educational tools', 'fun game pieces', 'colorful building blocks'
    ];
    return actionObjects[Math.floor(Math.random() * actionObjects.length)];
  }

  resolveSensoryDetails() {
    const sensoryDetails = [
      'warm natural lighting', 'soft textured surfaces', 'gentle ambient sounds',
      'vibrant colors and patterns', 'comfortable seating areas', 'fresh clean air'
    ];
    return sensoryDetails[Math.floor(Math.random() * sensoryDetails.length)];
  }

  resolveSpatialComposition() {
    const compositions = [
      'centered balanced composition', 'dynamic asymmetrical layout', 'rule of thirds positioning',
      'foreground-background depth', 'circular focal arrangement', 'leading lines composition'
    ];
    return compositions[Math.floor(Math.random() * compositions.length)];
  }

  resolveCameraDirective() {
    const directives = [
      'medium shot at eye level', 'slightly low angle for empowerment', 'warm close-up perspective',
      'wide establishing shot', 'intimate medium-close shot', 'dynamic three-quarter angle'
    ];
    return directives[Math.floor(Math.random() * directives.length)];
  }

  // ============= UTILITY METHODS =============

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  cleanTemplate(template) {
    return template
      .replace(/,\s*,/g, ',')           // Remove double commas
      .replace(/,\s*\./g, '.')         // Remove comma before period
      .replace(/\.\s*,/g, '.')         // Remove comma after period
      .replace(/\s+/g, ' ')            // Normalize whitespace
      .replace(/,\s*$/g, '')           // Remove trailing comma
      .replace(/^\s*,/g, '')           // Remove leading comma
      .trim();
  }

  // ============= CONVENIENCE METHODS FOR TEMPLATE SYSTEMS =============

  /**
   * Quick resolve method for simple templates
   */
  static quickResolve(template, userInfo, avatarIdentity, storyText, additionalData = {}) {
    const resolver = new UniversalPlaceholderResolver(userInfo, avatarIdentity, storyText);
    return resolver.resolve(template, additionalData);
  }

  /**
   * Get cultural enhancement level for template complexity decisions
   */
  getCulturalEnhancementLevel() {
    return this.culturalProfile.enhancementStrength;
  }

  /**
   * Check if cultural features should be applied
   */
  shouldApplyCulturalFeatures() {
    return this.culturalProfile.hasCulturalFeatures;
  }
}

// Export for backward compatibility and convenience
export default UniversalPlaceholderResolver;