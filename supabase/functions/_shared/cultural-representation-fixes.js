
// Phase 4: Cultural Representation Fixes
// Addresses African American representation and cultural variation issues

export class CulturalRepresentationEngine {
  // Enhanced African American character profiles with authentic representation
  static AFRICAN_AMERICAN_PROFILES = {
    skinTones: {
      light: 'warm light brown skin with golden undertones',
      medium: 'rich caramel skin with warm undertones', 
      deep: 'beautiful deep brown skin with rich undertones',
      dark: 'gorgeous dark chocolate skin with warm highlights'
    },
    
    hairTextures: {
      natural_short: 'natural short afro hair texture',
      natural_medium: 'natural medium-length curly hair',
      natural_long: 'natural long curly hair',
      braids: 'beautiful braided hairstyle',
      locs: 'neat dreadlocks',
      twists: 'protective twist hairstyle'
    },
    
    facialFeatures: {
      general: 'expressive dark eyes, warm smile, strong jawline',
      child: 'bright curious eyes, joyful expression, youthful features'
    },
    
    culturalElements: {
      clothing: ['colorful dashiki patterns', 'kente cloth accents', 'natural fiber clothing'],
      accessories: ['cultural jewelry', 'head wraps', 'ethnic patterns'],
      settings: ['community center', 'family gathering', 'cultural celebration', 'urban neighborhood']
    }
  };

  // Comprehensive cultural variations by language/region
  static CULTURAL_VARIATIONS = {
    'en-aa': { // African American
      skinTones: ['warm light brown', 'rich caramel', 'deep brown', 'dark chocolate'],
      hairStyles: ['natural afro', 'braids', 'twists', 'locs'],
      settings: ['urban community', 'family home', 'cultural center'],
      clothingStyles: ['casual modern', 'cultural traditional', 'school appropriate'],
      familyStructure: ['extended family', 'close-knit community', 'multigenerational']
    },
    
    'es': { // Spanish/Latino
      skinTones: ['olive', 'warm tan', 'medium brown', 'light bronze'],
      hairStyles: ['dark wavy hair', 'straight black hair', 'curly brown hair'],
      settings: ['colorful neighborhood', 'family courtyard', 'community plaza'],
      clothingStyles: ['vibrant colors', 'traditional patterns', 'festive clothing'],
      familyStructure: ['large family', 'multigenerational home', 'community celebration']
    },
    
    'zh': { // Chinese
      skinTones: ['light skin', 'pale complexion', 'warm beige'],
      hairStyles: ['straight black hair', 'neat bob cut', 'traditional styles'],
      settings: ['traditional garden', 'modern city', 'family home'],
      clothingStyles: ['modern casual', 'traditional elements', 'school uniform'],
      familyStructure: ['close family', 'respect for elders', 'educational focus']
    },
    
    'hi': { // Hindi/Indian
      skinTones: ['warm tan', 'golden brown', 'olive complexion'],
      hairStyles: ['long dark hair', 'braided styles', 'traditional cuts'],
      settings: ['colorful market', 'family home', 'garden courtyard'],
      clothingStyles: ['bright colors', 'traditional patterns', 'modern fusion'],
      familyStructure: ['extended family', 'multigenerational', 'community bonds']
    },
    
    'ar': { // Arabic
      skinTones: ['olive skin', 'warm tan', 'medium brown'],
      hairStyles: ['dark wavy hair', 'covered styles', 'traditional cuts'],
      settings: ['desert oasis', 'traditional courtyard', 'modern city'],
      clothingStyles: ['modest clothing', 'traditional patterns', 'cultural elements'],
      familyStructure: ['strong family bonds', 'community respect', 'traditional values']
    }
  };

  /**
   * Generate authentic cultural character description
   */
  static generateCulturalCharacterDescription(userInfo) {
    const language = userInfo.nativeLanguage || 'en';
    const avatarType = userInfo.avatar?.type || 'child';
    const skinTone = userInfo.avatar?.skinTone || 'medium';
    
    // Handle African American representation specifically
    if (this.isAfricanAmericanContext(userInfo)) {
      return this.generateAfricanAmericanCharacter(userInfo);
    }
    
    // Handle other cultural backgrounds
    const culturalProfile = this.CULTURAL_VARIATIONS[language];
    if (culturalProfile) {
      return this.generateCulturallyAuthenticCharacter(userInfo, culturalProfile);
    }
    
    // Default to inclusive representation
    return this.generateInclusiveCharacter(userInfo);
  }

  /**
   * Detect if African American representation is appropriate
   */
  static isAfricanAmericanContext(userInfo) {
    // Look for indicators in user preferences or explicit selection
    return userInfo.culturalBackground === 'african-american' ||
           userInfo.avatar?.ethnicity === 'african-american' ||
           (userInfo.nativeLanguage === 'en' && 
            userInfo.avatar?.skinTone === 'dark' && 
            userInfo.preferences?.culturalRepresentation === 'african-american');
  }

  /**
   * Generate authentic African American character representation
   */
  static generateAfricanAmericanCharacter(userInfo) {
    const profile = this.AFRICAN_AMERICAN_PROFILES;
    const skinTone = userInfo.avatar?.skinTone || 'medium';
    const avatarType = userInfo.avatar?.type || 'child';
    
    const skinDescription = profile.skinTones[skinTone] || profile.skinTones.medium;
    const hairStyle = this.selectRandomElement(Object.values(profile.hairTextures));
    const facialFeatures = profile.facialFeatures[avatarType] || profile.facialFeatures.general;
    
    return `${avatarType} with ${skinDescription}, ${hairStyle}, ${facialFeatures}`;
  }

  /**
   * Generate culturally authentic character for specific backgrounds
   */
  static generateCulturallyAuthenticCharacter(userInfo, culturalProfile) {
    const avatarType = userInfo.avatar?.type || 'child';
    const skinTone = this.selectRandomElement(culturalProfile.skinTones);
    const hairStyle = this.selectRandomElement(culturalProfile.hairStyles);
    const clothing = this.selectRandomElement(culturalProfile.clothingStyles);
    
    return `${avatarType} with ${skinTone} skin, ${hairStyle}, wearing ${clothing}`;
  }

  /**
   * Generate inclusive character representation
   */
  static generateInclusiveCharacter(userInfo) {
    const avatarType = userInfo.avatar?.type || 'child';
    const skinTone = userInfo.avatar?.skinTone || 'medium';
    
    const skinMap = {
      'pale': 'fair skin',
      'light': 'light skin tone',
      'medium': 'medium skin tone', 
      'olive': 'warm olive skin',
      'dark': 'beautiful dark skin'
    };
    
    const skinDescription = skinMap[skinTone] || skinMap.medium;
    
    return `friendly ${avatarType} with ${skinDescription}, expressive eyes, warm smile`;
  }

  /**
   * Generate culturally appropriate setting
   */
  static generateCulturalSetting(userInfo) {
    const language = userInfo.nativeLanguage || 'en';
    
    if (this.isAfricanAmericanContext(userInfo)) {
      const settings = this.AFRICAN_AMERICAN_PROFILES.culturalElements.settings;
      return this.selectRandomElement(settings);
    }
    
    const culturalProfile = this.CULTURAL_VARIATIONS[language];
    if (culturalProfile?.settings) {
      return this.selectRandomElement(culturalProfile.settings);
    }
    
    return 'welcoming community space';
  }

  /**
   * Get culturally appropriate negative prompt additions
   */
  static getCulturalNegativePrompt(userInfo) {
    let negativeAdditions = [];
    
    // Prevent stereotypical representations
    if (this.isAfricanAmericanContext(userInfo)) {
      negativeAdditions.push(
        'stereotypical features',
        'exaggerated characteristics', 
        'caricature style',
        'offensive depictions'
      );
    }
    
    // General cultural sensitivity
    negativeAdditions.push(
      'cultural appropriation',
      'stereotypes',
      'insensitive representation',
      'mocking depictions'
    );
    
    return negativeAdditions.join(', ');
  }

  /**
   * Validate cultural representation appropriateness
   */
  static validateCulturalRepresentation(prompt, userInfo) {
    const warnings = [];
    
    // Check for potential stereotypes
    const problematicTerms = [
      'exotic', 'tribal', 'primitive', 'savage', 'mystical'
    ];
    
    for (const term of problematicTerms) {
      if (prompt.toLowerCase().includes(term)) {
        warnings.push(`Consider removing potentially problematic term: "${term}"`);
      }
    }
    
    // Check for authentic representation
    if (this.isAfricanAmericanContext(userInfo)) {
      if (!prompt.includes('natural') && !prompt.includes('authentic')) {
        warnings.push('Consider adding authentic representation elements');
      }
    }
    
    return warnings;
  }

  /**
   * Helper method to select random element from array
   */
  static selectRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
}
