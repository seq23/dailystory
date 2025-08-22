/**
 * NEW MASTER PLAN: UnifiedCharacterDescriptor - Simplified Direct Visual Approach
 * Uses direct avatar descriptions from orchestrator instead of complex cultural arrays
 */

export class UnifiedCharacterDescriptor {
  static sessionCharacters = new Map();
  
  /**
   * NEW MASTER PLAN: Generate character description using direct visual approach
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
      
      // NEW MASTER PLAN: Direct visual mapping (matches orchestrator output)
      const visualMap = {
        'pale': 'fair skin white child with red hair',
        'light': 'white child with blonde hair', 
        'medium': 'medium skin white child with brown hair',
        'olive': 'olive skin white child with black hair',
        'dark': 'black child'
      };
      
      // Use direct visual description
      const directVisual = visualMap[skinTone] || 'child';
      
      // Adjust for gender
      if (genderType === 'boy') {
        description = directVisual.replace('child', 'boy');
      } else if (genderType === 'girl') {
        description = directVisual.replace('child', 'girl');
      } else {
        description = directVisual;
      }
      
      // NEW MASTER PLAN: No complex cultural enhancement - keep it simple
      if (culturalEnhancement && userInfo.nativeLanguage === 'en') {
        description += ' in modern clothing';
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
   * NEW MASTER PLAN: Simplified cultural features
   */
  static getCulturalFeaturesForLanguage(language) {
    const features = {
      'en': {
        clothing: ['modern clothing', 'casual wear'],
        setting: ['community setting', 'inclusive environment']
      },
      'es': {
        clothing: ['colorful clothing', 'casual wear'],
        setting: ['family setting', 'community environment']
      },
      'fr': {
        clothing: ['stylish clothing', 'casual wear'],
        setting: ['family setting', 'community environment']
      }
    };
    
    return features[language] || features['en'];
  }
}
