/**
 * UnifiedCharacterDescriptor - Provides consistent character descriptions for image generation
 */

export class UnifiedCharacterDescriptor {
  static sessionCharacters = new Map();
  
  /**
   * Generate character description based on user info
   */
  static generateCharacterDescription(userInfo, difficulty = 'medium', outputMode = 'rich', culturalEnhancement = true) {
    if (!userInfo) {
      return {
        description: 'friendly child character',
        age: 'child',
        gender: 'child'
      };
    }

    const { avatar, name } = userInfo;
    let character = name || 'child';
    let genderType = avatar?.type || 'child';
    
    // Build character description
    let description = character;
    
    if (avatar) {
      const skinTone = avatar.skinTone || 'medium';
      
      const skinMap = {
        'pale': 'fair skin',
        'light': 'light skin', 
        'medium': 'medium skin',
        'olive': 'olive skin',
        'dark': 'dark skin'
      };
      
      // Enhanced African American Hair Style Arrays
      const AFRICAN_AMERICAN_BOYS_HAIRSTYLES = [
        'textured buzz cut', 'detailed fade cut', 'textured taper fade', 'detailed high top fade', 'textured low fade', 'detailed crew cut', 'textured caesar cut', 
        'detailed curly top fade', 'textured curly high fade', 'detailed curly low fade', 'textured curly taper fade', 'detailed curly high top', 
        'textured curly mohawk', 'detailed curly faux hawk', 'textured curly undercut', 'detailed fade with curls on top', 'textured crop', 
        'detailed curly fringe fade', 'textured twisted top fade', 'detailed undercut design', 'textured hair tattoo', 'detailed geometric patterns', 
        'textured mini afro', 'detailed medium afro', 'textured tapered afro', 'detailed wash and go', 'textured finger coils', 'detailed two strand twists', 
        'textured flat twists', 'detailed mini twists', 'textured locs', 'detailed starter locs', 'textured freeform locs', 'detailed twisted locs', 
        'textured side part locs', 'detailed middle part locs', 'textured ponytail with locs', 'detailed nape area tapered'
      ];

      const AFRICAN_AMERICAN_GIRLS_HAIRSTYLES = [
        'textured medium natural hair', 'textured long natural hair', 'textured shoulder-length hair', 
        'detailed twist out', 'detailed bantu knots', 'detailed rod set', 'detailed braid out', 'textured high puff', 'textured low puff', 'textured side puff', 
        'textured double puff', 'detailed space buns', 'detailed top knot bun', 'detailed low bun', 
        'detailed messy bun', 'detailed sleek bun',
        'detailed cornrows', 'detailed box braids', 'detailed micro braids', 'detailed jumbo braids', 
        'detailed goddess braids', 'detailed dutch braids', 'detailed french braids', 'detailed fishtail braids', 
        'detailed halo braid', 'detailed crown braid', 'detailed side braids', 'detailed three strand twists',
        'detailed senegalese twists', 'detailed marley twists', 'detailed havana twists', 'detailed passion twists', 
        'detailed spring twists', 'detailed kinky twists', 'detailed chunky twists', 'detailed protective twists', 
        'textured sisterlocs', 'textured microlocs', 'textured traditional locs', 'textured interlocked locs', 
        'detailed braided locs', 'detailed loc updo', 'textured half up half down locs', 'textured afro puffs', 
        'textured large afro', 'textured picked out afro', 'textured shaped afro', 'textured curly afro', 
        'textured coily afro', 'textured kinky afro', 'textured side swept bangs', 
        'textured face framing layers', 'textured layered cut', 'detailed blunt cut', 'detailed asymmetrical cut'
      ];

      // Hair selection logic with cultural enhancement
      let hairDescription = 'brown hair';
      if (culturalEnhancement && userInfo.nativeLanguage === 'en' && skinTone === 'dark') {
        // African American hair styles
        if (genderType === 'boy') {
          const randomIndex = Math.floor(Math.random() * AFRICAN_AMERICAN_BOYS_HAIRSTYLES.length);
          hairDescription = AFRICAN_AMERICAN_BOYS_HAIRSTYLES[randomIndex];
        } else if (genderType === 'girl') {
          const randomIndex = Math.floor(Math.random() * AFRICAN_AMERICAN_GIRLS_HAIRSTYLES.length);
          hairDescription = AFRICAN_AMERICAN_GIRLS_HAIRSTYLES[randomIndex];
        } else {
          // Default for unspecified gender
          const allStyles = [...AFRICAN_AMERICAN_BOYS_HAIRSTYLES, ...AFRICAN_AMERICAN_GIRLS_HAIRSTYLES];
          const randomIndex = Math.floor(Math.random() * allStyles.length);
          hairDescription = allStyles[randomIndex];
        }
      } else {
        // Standard hair mapping for other users
        const hairMap = {
          'pale': 'blonde hair',
          'light': 'brown hair',
          'medium': 'brown hair', 
          'olive': 'dark brown hair',
          'dark': 'black hair'
        };
        hairDescription = hairMap[skinTone] || 'brown hair';
      }
      
      description += ` with ${skinMap[skinTone] || 'medium skin'} and ${hairDescription}`;
      
      // Add cultural clothing if enabled
      if (culturalEnhancement && userInfo.nativeLanguage) {
        if (userInfo.nativeLanguage === 'en' && skinTone === 'dark') {
          description += ' in modern American fashion';
        } else if (userInfo.nativeLanguage === 'fr') {
          description += ' in French-style clothing';
        } else if (userInfo.nativeLanguage === 'es') {
          description += ' in contemporary Hispanic fashion';
        }
      }
    }
    
    return {
      description,
      age: this.getAgeFromDifficulty(difficulty),
      gender: genderType
    };
  }
  
  /**
   * Generate primary character for a session
   */
  static generatePrimaryCharacter(userInfo, difficulty = 'medium', sessionId) {
    const key = sessionId || 'default';
    
    if (this.sessionCharacters.has(key)) {
      return this.sessionCharacters.get(key);
    }
    
    const character = this.generateCharacterDescription(userInfo, difficulty, 'rich', true);
    this.sessionCharacters.set(key, character);
    
    return character;
  }
  
  /**
   * Generate secondary character (family, community, etc.)
   */
  static generateSecondaryCharacter(type, details, userInfo, sessionId) {
    const primary = this.generatePrimaryCharacter(userInfo, 'medium', sessionId);
    
    // Create related character based on type
    let secondaryDesc = '';
    
    if (type === 'family') {
      secondaryDesc = details.relationship || 'family member';
      if (primary.gender === 'boy') {
        secondaryDesc += ' of the boy';
      } else if (primary.gender === 'girl') {
        secondaryDesc += ' of the girl';
      }
    } else if (type === 'community') {
      secondaryDesc = details.role || 'community member';
    } else if (type === 'animal') {
      secondaryDesc = details.species || 'friendly animal';
    }
    
    return {
      description: secondaryDesc,
      type,
      relationship: details.relationship || 'secondary'
    };
  }
  
  /**
   * Get character consistency data for session
   */
  static getCharacterConsistencyData(sessionId) {
    return this.sessionCharacters.get(sessionId) || null;
  }
  
  /**
   * Clear session data
   */
  static clearSession(sessionId) {
    this.sessionCharacters.delete(sessionId);
  }
  
  /**
   * Safe character description with fallback
   */
  static getCharacterDescriptionSafe(userInfo, difficulty = 'medium') {
    try {
      return this.generateCharacterDescription(userInfo, difficulty);
    } catch (error) {
      console.warn('Character description failed, using fallback:', error);
      return {
        description: 'friendly child character',
        age: 'child',
        gender: 'child'
      };
    }
  }
  
  /**
   * Map difficulty to age category
   */
  static getAgeFromDifficulty(difficulty) {
    const ageMap = {
      'beginner': 'young child',
      'easy': 'child',
      'medium': 'child',
      'hard': 'older child',
      'expert': 'teen'
    };
    
    return ageMap[difficulty] || 'child';
  }
  
  /**
   * Get cultural features for language
   */
  static getCulturalFeaturesForLanguage(language) {
    const features = {
      'en': {
        clothing: ['casual wear', 'modern fashion'],
        setting: ['suburban home', 'community park']
      },
      'es': {
        clothing: ['colorful clothing', 'Hispanic fashion'],
        setting: ['family home', 'community plaza']
      },
      'fr': {
        clothing: ['French fashion', 'elegant style'],
        setting: ['French home', 'European garden']
      }
    };
    
    return features[language] || features['en'];
  }
}