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

  /**
   * Generate secondary character description using direct visual approach
   * NEW: Extension for secondary characters from detection
   */
  static generateSecondaryCharacterFromDetection(detectedElement, userInfo, sessionId) {
    console.log(`🎭 Generating secondary character: ${detectedElement.name} (${detectedElement.type})`);
    
    const { name, type } = detectedElement;
    const mainCharacter = this.getCharacterDescriptionSafe(userInfo);
    
    // Build secondary character based on relationship type
    let description = '';
    let age = 'adult';
    let gender = 'adult';
    
    if (type.includes('family_')) {
      // Family relationships - match cultural style of main character
      const familyRole = type.replace('family_', '');
      description = this.generateFamilyCharacter(familyRole, mainCharacter, userInfo);
      
      // Set appropriate age/gender for family members
      if (familyRole === 'mother' || familyRole === 'father') {
        age = 'adult';
        gender = familyRole === 'mother' ? 'woman' : 'man';
      } else if (familyRole === 'sister' || familyRole === 'brother') {
        age = 'child'; // Assume sibling is also child-aged
        gender = familyRole === 'sister' ? 'girl' : 'boy';
      } else if (familyRole === 'grandmother' || familyRole === 'grandfather') {
        age = 'elderly';
        gender = familyRole === 'grandmother' ? 'woman' : 'man';
      }
    } else if (type.includes('community_')) {
      // Community relationships
      const communityRole = type.replace('community_', '');
      description = this.generateCommunityCharacter(communityRole, mainCharacter, userInfo);
      age = 'adult';
      gender = 'adult';
    } else if (type === 'named_character') {
      // Named characters - assume friend/peer
      description = this.generatePeerCharacter(name, mainCharacter, userInfo);
      age = 'child';
      gender = 'child';
    }
    
    return {
      description,
      age,
      gender,
      culturalStyle: mainCharacter.culturalStyle || 'universal'
    };
  }

  /**
   * Generate family character matching main character's cultural background
   */
  static generateFamilyCharacter(familyRole, mainCharacter, userInfo) {
    const culturalBase = this.extractCulturalBase(userInfo);
    const skinTone = userInfo.avatar?.skinTone || 'medium';
    
    const familyDescriptors = {
      mother: `loving ${familyRole} with ${skinTone} skin`,
      father: `caring ${familyRole} with ${skinTone} skin`,
      sister: `young ${familyRole} with ${skinTone} skin`,
      brother: `young ${familyRole} with ${skinTone} skin`,
      grandmother: `wise ${familyRole} with ${skinTone} skin`,
      grandfather: `kind ${familyRole} with ${skinTone} skin`,
      aunt: `friendly ${familyRole} with ${skinTone} skin`,
      uncle: `helpful ${familyRole} with ${skinTone} skin`
    };
    
    return familyDescriptors[familyRole] || `${familyRole} with ${skinTone} skin`;
  }

  /**
   * Generate community character
   */
  static generateCommunityCharacter(communityRole, mainCharacter, userInfo) {
    const skinTone = 'medium'; // Community members can have varied appearance
    
    const communityDescriptors = {
      teacher: `friendly ${communityRole}`,
      friend: `cheerful ${communityRole}`,
      neighbor: `kind ${communityRole}`,
      doctor: `caring ${communityRole}`,
      coach: `encouraging ${communityRole}`
    };
    
    return communityDescriptors[communityRole] || `helpful ${communityRole}`;
  }

  /**
   * Generate peer character (child friend)
   */
  static generatePeerCharacter(name, mainCharacter, userInfo) {
    return `${name}, a friendly child`;
  }

  /**
   * Extract cultural base from userInfo for family consistency
   */
  static extractCulturalBase(userInfo) {
    const language = userInfo.native_language || userInfo.language || 'en';
    
    // Simple cultural mapping based on language
    const culturalMap = {
      'es': 'hispanic',
      'zh': 'asian',
      'hi': 'indian',
      'ar': 'middle_eastern',
      'fr': 'european',
      'de': 'european',
      'ja': 'asian',
      'ko': 'asian'
    };
    
    return culturalMap[language] || 'universal';
  }

  /**
   * Generate character animal seed and description
   */
  static generateCharacterAnimalSeed(animalName, species, culturalProfile) {
    console.log(`🐾 Generating character animal: ${animalName} the ${species}`);
    
    const animalDescriptors = {
      dog: 'friendly dog',
      cat: 'curious cat',
      puppy: 'playful puppy',
      kitten: 'adorable kitten',
      bunny: 'soft bunny',
      rabbit: 'gentle rabbit',
      horse: 'majestic horse',
      pony: 'small pony',
      bird: 'colorful bird',
      parrot: 'talking parrot',
      hamster: 'tiny hamster'
    };
    
    const description = animalDescriptors[species.toLowerCase()] || `${species}`;
    
    return {
      name: animalName,
      species,
      description,
      seed: this.generateSeededRandom(`${animalName}_${species}`)
    };
  }

  static generateSeededRandom(key) {
    // Simple hash function to generate consistent seed from string
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Return positive seed between 1 and 999999
    return Math.abs(hash % 999999) + 1;
  }
}
