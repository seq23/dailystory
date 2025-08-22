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
      
      const hairMap = {
        'pale': 'blonde hair',
        'light': 'brown hair',
        'medium': 'brown hair', 
        'olive': 'dark brown hair',
        'dark': 'black hair'
      };
      
      description += ` with ${skinMap[skinTone] || 'medium skin'} and ${hairMap[skinTone] || 'brown hair'}`;
      
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