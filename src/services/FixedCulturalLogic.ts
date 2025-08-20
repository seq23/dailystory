// Fixed Cultural Logic - Addresses Phase 2: Fix African American Representation Critical Bugs
// Fixes the cultural variation logic bug and expands facial features

import type { UserInfo, SkinTone } from '@/types';

export interface ExpandedFacialFeatures {
  eyes: string[];
  eyebrows: string[];
  eyelashes: string[];
  nose: string[];
  lips: string[];
  facialStructure: string[];
  cheekbones: string[];
  jawline: string[];
  forehead: string[];
}

export interface WeightedCulturalElement {
  element: string;
  weight: number; // 1-10, higher = more likely to be selected
}

export class FixedCulturalLogic {
  // CRITICAL FIX: Expanded African American facial features from 9 to 20+ variations
  static readonly EXPANDED_AFRICAN_AMERICAN_FACIAL_FEATURES: ExpandedFacialFeatures = {
    eyes: [
      'almond-shaped dark brown eyes', 'round rich brown eyes', 'deep-set hazel eyes', 
      'prominent amber eyes', 'almond-shaped hazel-green eyes', 'round dark brown eyes',
      'deep-set rich brown eyes', 'prominent hazel eyes', 'almond-shaped amber eyes',
      'round hazel-green eyes', 'expressive dark brown eyes', 'bright amber eyes',
      'warm hazel eyes', 'intelligent dark brown eyes', 'sparkling hazel-green eyes',
      'wide-set brown eyes', 'close-set amber eyes', 'upturned dark eyes',
      'downturned warm eyes', 'monolid brown eyes'
    ],
    eyebrows: [
      'full well-defined eyebrows', 'naturally arched eyebrows', 'thick expressive eyebrows',
      'elegantly shaped eyebrows', 'bold natural eyebrows', 'gracefully arched eyebrows',
      'straight thick eyebrows', 'curved natural eyebrows', 'angular defined eyebrows',
      'soft rounded eyebrows'
    ],
    eyelashes: [
      'long curved eyelashes', 'naturally thick eyelashes', 'beautifully curled eyelashes',
      'full dark eyelashes', 'elegantly long eyelashes', 'dense natural eyelashes',
      'softly curled lashes', 'dramatically long lashes'
    ],
    nose: [
      'wider nasal bridge', 'fuller rounded nostrils', 'broad noble nose', 'narrow refined nose',
      'button nose shape', 'straight elegant nose', 'distinctive nose bridge', 'well-proportioned nose',
      'aquiline nose profile', 'slightly upturned nose', 'prominent nose bridge', 'delicate nose shape',
      'strong nose structure', 'refined nose tip', 'broad nose base'
    ],
    lips: [
      'fuller well-defined lips', 'naturally full lips', 'heart-shaped lips', 'bow-shaped lips',
      'beautifully full lips', 'expressive full lips', 'naturally defined lips',
      'curved upper lip', 'prominent lower lip', 'balanced lip proportion',
      'soft full lips', 'defined lip corners', 'naturally plump lips'
    ],
    facialStructure: [
      'high cheekbones', 'strong jawline', 'rounded face shape', 'oval face shape',
      'smooth facial contours', 'natural facial symmetry', 'elegant bone structure',
      'defined cheekbones', 'graceful jawline', 'harmonious facial features',
      'angular face shape', 'soft facial curves', 'prominent chin', 'delicate chin',
      'wide face structure', 'narrow face profile'
    ],
    cheekbones: [
      'high prominent cheekbones', 'subtly defined cheekbones', 'naturally sculpted cheekbones',
      'graceful cheek contours', 'strong cheekbone structure', 'soft cheek definition'
    ],
    jawline: [
      'strong defined jawline', 'soft rounded jawline', 'angular jaw structure',
      'graceful jaw curve', 'prominent jaw definition', 'delicate jaw shape'
    ],
    forehead: [
      'smooth broad forehead', 'gently curved forehead', 'prominent forehead',
      'balanced forehead proportion', 'high intelligent forehead', 'rounded forehead shape'
    ]
  };

  // CRITICAL FIX: Corrected cultural assignment logic
  static shouldApplyAfricanAmericanCulturalVariations(userInfo: UserInfo): boolean {
    // BUG FIX: Only apply African American variations for English + dark skin
    // Previously incorrectly applied to English + non-dark skin
    return userInfo.nativeLanguage === 'en' && userInfo.avatar?.skinTone === 'dark';
  }

  static shouldApplyMainstreamAmericanCulture(userInfo: UserInfo): boolean {
    // Apply mainstream American culture for English speakers with non-dark skin
    return userInfo.nativeLanguage === 'en' && userInfo.avatar?.skinTone !== 'dark';
  }

  /**
   * PHASE 5: Weighted randomization for more natural cultural feature variation
   */
  static selectWeightedRandomElement<T>(
    elements: T[] | WeightedCulturalElement[],
    bias: 'natural' | 'diverse' | 'consistent' = 'natural'
  ): T {
    if (!Array.isArray(elements) || elements.length === 0) {
      throw new Error('Elements array cannot be empty');
    }

    // Simple random selection for basic arrays
    if (typeof elements[0] === 'string') {
      return this.applyBiasedSelection(elements as T[], bias);
    }

    // Weighted selection for weighted elements
    const weightedElements = elements as WeightedCulturalElement[];
    const totalWeight = weightedElements.reduce((sum, item) => sum + item.weight, 0);
    let randomWeight = Math.random() * totalWeight;

    for (const item of weightedElements) {
      randomWeight -= item.weight;
      if (randomWeight <= 0) {
        return item.element as T;
      }
    }

    // Fallback to last element
    return weightedElements[weightedElements.length - 1].element as T;
  }

  private static applyBiasedSelection<T>(elements: T[], bias: 'natural' | 'diverse' | 'consistent'): T {
    switch (bias) {
      case 'natural':
        // Slight bias toward middle elements for more natural variation
        const naturalIndex = Math.floor(
          Math.random() * elements.length * 0.8 + elements.length * 0.1
        );
        return elements[Math.min(naturalIndex, elements.length - 1)];
        
      case 'diverse':
        // Completely random for maximum diversity
        return elements[Math.floor(Math.random() * elements.length)];
        
      case 'consistent':
        // Bias toward first quarter for consistency
        const consistentIndex = Math.floor(Math.random() * elements.length * 0.4);
        return elements[consistentIndex];
        
      default:
        return elements[Math.floor(Math.random() * elements.length)];
    }
  }

  /**
   * Generate comprehensive African American facial features description
   */
  static generateExpandedAfricanAmericanFeatures(): string {
    const features = this.EXPANDED_AFRICAN_AMERICAN_FACIAL_FEATURES;
    
    const eyes = this.selectWeightedRandomElement(features.eyes, 'natural');
    const nose = this.selectWeightedRandomElement(features.nose, 'natural');
    const lips = this.selectWeightedRandomElement(features.lips, 'natural');
    const structure = this.selectWeightedRandomElement(features.facialStructure, 'natural');
    const cheekbones = this.selectWeightedRandomElement(features.cheekbones, 'natural');
    
    return `${eyes}, ${nose}, ${lips}, ${structure}, ${cheekbones}`;
  }

  /**
   * Fix the cultural setting selection logic
   */
  static selectCulturalSetting(userInfo: UserInfo, culturalProfile: any): string {
    // FIXED: Use mainstream settings for English + non-dark skin
    if (this.shouldApplyMainstreamAmericanCulture(userInfo)) {
      const mainstreamSettings = [
        'suburban neighborhood', 'modern American suburb', 'middle-class community',
        'well-maintained school', 'public library', 'shopping mall', 'local park',
        'family restaurant', 'community center', 'beautiful church', 'family home',
        'historical landmark', 'cultural center'
      ];
      return this.selectWeightedRandomElement(mainstreamSettings, 'natural');
    }

    // Use African American cultural settings for English + dark skin
    if (this.shouldApplyAfricanAmericanCulturalVariations(userInfo)) {
      const africanAmericanSettings = [
        'vibrant urban neighborhood', 'community cultural center', 'historic Black church',
        'family barbershop', 'community garden', 'local soul food restaurant',
        'neighborhood block party', 'community celebration', 'family reunion',
        'cultural heritage center', 'community library', 'local community center'
      ];
      return this.selectWeightedRandomElement(africanAmericanSettings, 'natural');
    }

    // Use default cultural settings for other languages
    return this.selectWeightedRandomElement(culturalProfile.settings, 'natural');
  }

  /**
   * Generate culturally appropriate clothing
   */
  static selectCulturalClothing(userInfo: UserInfo, culturalProfile: any): string {
    if (this.shouldApplyAfricanAmericanCulturalVariations(userInfo)) {
      const clothing = [
        'stylish casual clothing', 'trendy urban fashion', 'colorful ethnic patterns',
        'modern streetwear', 'cultural pride clothing', 'contemporary African-inspired fashion',
        'vibrant patterned shirt', 'modern dashiki style', 'fashionable casual wear'
      ];
      return this.selectWeightedRandomElement(clothing, 'natural');
    }

    if (this.shouldApplyMainstreamAmericanCulture(userInfo)) {
      const clothing = [
        'casual American clothing', 'modern kids fashion', 'comfortable everyday wear',
        'stylish casual outfit', 'contemporary children\'s clothing', 'trendy casual wear'
      ];
      return this.selectWeightedRandomElement(clothing, 'natural');
    }

    return this.selectWeightedRandomElement(culturalProfile.clothing, 'natural');
  }

  /**
   * Validate cultural assignment logic
   */
  static validateCulturalAssignment(userInfo: UserInfo): {
    isValid: boolean;
    appliedCulture: string;
    warnings: string[];
  } {
    const warnings: string[] = [];
    
    if (this.shouldApplyAfricanAmericanCulturalVariations(userInfo)) {
      return {
        isValid: true,
        appliedCulture: 'African American',
        warnings
      };
    }
    
    if (this.shouldApplyMainstreamAmericanCulture(userInfo)) {
      return {
        isValid: true,
        appliedCulture: 'Mainstream American',
        warnings
      };
    }
    
    if (userInfo.nativeLanguage && userInfo.nativeLanguage !== 'en') {
      return {
        isValid: true,
        appliedCulture: userInfo.nativeLanguage,
        warnings
      };
    }
    
    warnings.push('Could not determine appropriate cultural assignment');
    return {
      isValid: false,
      appliedCulture: 'default',
      warnings
    };
  }
}