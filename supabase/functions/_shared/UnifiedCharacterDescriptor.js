/**
 * UNIFIED CHARACTER DESCRIPTOR - MASTER CONSOLIDATION
 * Combines sophisticated detection from EnhancedAnimalDetector + SecondaryElementDetector
 * with visual approach and cultural consistency for Tier 1 & Tier 2.5 compatibility
 */

import { VOCABULARY, pick, PLACEHOLDER_POOLS } from './tier25Vocabulary.js';

export class UnifiedCharacterDescriptor {
  static sessionCharacters = new Map();
  static detectedAnimals = new Map();
  static secondaryCharacters = new Map();
  static relationshipMap = new Map();
  static maxDetections = 50; // Prevent memory bloat

  // ============= COMPREHENSIVE RELATIONSHIP PATTERNS (from SecondaryElementDetector) =============
  static RELATIONSHIP_PATTERNS = {
    // Core Family (8 types)
    family_mother: ['mom', 'mother', 'mommy', 'mama', 'ma'],
    family_father: ['dad', 'father', 'daddy', 'papa', 'pa'],
    family_sister: ['sister', 'sis'],
    family_brother: ['brother', 'bro'],
    family_grandmother: ['grandma', 'grandmother', 'nana', 'granny'],
    family_grandfather: ['grandpa', 'grandfather', 'papa', 'gramps'],
    family_aunt: ['aunt', 'auntie'],
    family_uncle: ['uncle'],
    
    // Extended Family (7 types)
    family_cousin: ['cousin'],
    family_nephew: ['nephew'],
    family_niece: ['niece'],
    family_stepmother: ['stepmother', 'stepmom'],
    family_stepfather: ['stepfather', 'stepdad'],
    family_stepsister: ['stepsister'],
    family_stepbrother: ['stepbrother'],
    
    // Friends & Peers (6 types)
    community_friend: ['friend', 'buddy', 'pal', 'companion'],
    community_best_friend: ['best friend', 'bestie'],
    community_classmate: ['classmate'],
    community_teammate: ['teammate'],
    community_neighbor: ['neighbor', 'neighbour'],
    community_playmate: ['playmate'],
    
    // Authority Figures (8 types)
    authority_teacher: ['teacher', 'instructor', 'tutor'],
    authority_coach: ['coach', 'trainer'],
    authority_doctor: ['doctor', 'dr'],
    authority_nurse: ['nurse'],
    authority_principal: ['principal', 'headmaster'],
    authority_librarian: ['librarian'],
    authority_babysitter: ['babysitter', 'sitter'],
    authority_guide: ['guide']
  };

  // Common words that can be names (for disambiguation)
  static COMMON_WORD_NAMES = [
    'apple', 'sage', 'river', 'hope', 'grace', 'faith', 'rose', 'lily', 
    'amber', 'crystal', 'summer', 'autumn', 'winter', 'spring', 'joy',
    'charity', 'harmony', 'melody', 'angel', 'star', 'moon', 'sun',
    'forest', 'ocean', 'sky', 'storm', 'phoenix', 'hunter', 'archer'
  ];

  // ============= MASTER DETECTION - Detect all animals and secondary characters =============
  static detectAllCharacters(text, context = {}) {
    const { sessionId, pageNumber = 1, userInfo = {} } = context;
    
    if (!text || typeof text !== 'string') {
      return { animals: [], secondaryCharacters: [], relationships: [] };
    }

    try {
      const results = {
        animals: this.detectAnimals(text, context),
        secondaryCharacters: this.detectSecondaryCharacters(text, context),
        relationships: this.detectRelationships(text, context),
        success: true
      };

      // Store detections for consistency
      if (sessionId) {
        this.storeDetections(sessionId, pageNumber, results);
      }

      console.log(`🔍 [UnifiedCharacterDescriptor] Detected ${results.animals.length} animals, ${results.secondaryCharacters.length} secondary characters`);
      
      return results;

    } catch (error) {
      console.warn('⚠️ [UnifiedCharacterDescriptor] Detection error (non-blocking):', error.message);
      return { animals: [], secondaryCharacters: [], relationships: [], success: false, error: error.message };
    }
  }

  // ============= ENHANCED ANIMAL DETECTION (from EnhancedAnimalDetector) =============
  static detectAnimals(text, context) {
    const detectedAnimals = [];
    const { userInfo = {} } = context;

    // Get all animal categories from tier25Vocabulary
    const allAnimals = [
      ...(VOCABULARY?.animals?.domestic || PLACEHOLDER_POOLS.level0Animals),
      ...(VOCABULARY?.animals?.farm || ['cow', 'pig', 'sheep', 'chicken', 'duck']),
      ...(VOCABULARY?.animals?.wild || ['bear', 'lion', 'tiger', 'elephant', 'monkey'])
    ];

    // Enhanced animal detection patterns
    const animalPatterns = [
      // Basic animal mentions
      new RegExp(`\\b(${allAnimals.join('|')})s?\\b`, 'gi'),
      
      // Pet relationships
      /\b(my|his|her|their)\s+(pet|dog|cat|rabbit|hamster|bird|fish)\b/gi,
      
      // Animal with descriptors
      new RegExp(`\\b(big|small|little|tiny|fluffy|friendly|cute)\\s+(${allAnimals.join('|')})s?\\b`, 'gi'),
      
      // Colored animals using tier25Vocabulary colors
      new RegExp(`\\b(${(PLACEHOLDER_POOLS.colors || ['red', 'blue', 'green']).join('|')})\\s+(${allAnimals.join('|')})s?\\b`, 'gi'),
      
      // Animal actions
      new RegExp(`\\b(${allAnimals.join('|')})s?\\s+(runs?|jumps?|plays?|sleeps?|eats?|walks?)\\b`, 'gi')
    ];

    // Process each pattern
    animalPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const animalMention = this.normalizeAnimalMention(match[0]);
        const animalType = this.identifyAnimalType(animalMention, allAnimals);
        
        if (animalType && !detectedAnimals.find(a => a.name === animalType)) {
          detectedAnimals.push({
            name: animalType,
            mention: animalMention,
            category: this.categorizeAnimal(animalType),
            attributes: this.extractAnimalAttributes(match[0]),
            position: match.index,
            confidence: this.calculateConfidence(match[0], text)
          });
        }
      }
    });

    // Add user's favorite animal if not detected
    if (userInfo.favoriteAnimal && !detectedAnimals.find(a => a.name === userInfo.favoriteAnimal)) {
      detectedAnimals.push({
        name: userInfo.favoriteAnimal,
        mention: userInfo.favoriteAnimal,
        category: this.categorizeAnimal(userInfo.favoriteAnimal),
        attributes: { favorite: true },
        position: -1,
        confidence: 0.9
      });
    }

    return detectedAnimals.slice(0, 10); // Limit to prevent bloat
  }

  // ============= ENHANCED SECONDARY CHARACTER DETECTION (from SecondaryElementDetector) =============
  static detectSecondaryCharacters(text, context) {
    const secondaryCharacters = [];
    const originalText = text;
    const lowercaseText = text.toLowerCase();
    
    // Generate all pattern combinations for comprehensive relationship detection
    const allPatterns = [];
    
    Object.entries(this.RELATIONSHIP_PATTERNS).forEach(([relationshipType, relationshipWords]) => {
      relationshipWords.forEach(relationship => {
        // Pattern 1: Direct Relationship + Name (e.g., "friend Apple", "teacher Ms. Johnson")
        allPatterns.push({
          pattern: new RegExp(`\\b(${relationship})\\s+([A-Z][a-z]{1,14})`, 'gi'),
          type: relationshipType,
          patternType: 'direct',
          relationship: relationship
        });
        
        // Pattern 2: Possessive Pronouns + Relationship + Name (e.g., "my friend Apple", "her cat Whiskers")
        allPatterns.push({
          pattern: new RegExp(`\\b(?:my|your|his|her|their|our)\\s+(${relationship})\\s+([A-Z][a-z]{1,14})`, 'gi'),
          type: relationshipType,
          patternType: 'possessive_pronoun',
          relationship: relationship
        });
        
        // Pattern 3: Possessive Forms (e.g., "Apple's mom", "Sequoia's sister")
        allPatterns.push({
          pattern: new RegExp(`\\b([A-Z][a-z]{1,14})'?s\\s+(${relationship})`, 'gi'),
          type: relationshipType,
          patternType: 'possessive_form',
          relationship: relationship
        });
      });
    });
    
    // Pattern 4: Dialogue Attribution (e.g., '"Hello," said Apple', '"Come here," called teacher')
    allPatterns.push({
      pattern: /["']([^"']+)["'][,.]?\s+(?:said|asked|called|whispered|shouted|replied|answered)\s+([A-Z][a-z]{1,14})/gi,
      type: 'dialogue_attribution',
      patternType: 'dialogue',
      relationship: 'speaker'
    });
    
    // Pattern 5: Coordinated Names (e.g., "Apple and Sequoia", "Mom and Dad")
    allPatterns.push({
      pattern: /\b([A-Z][a-z]{1,14})\s+and\s+([A-Z][a-z]{1,14})/gi,
      type: 'coordinated_names',
      patternType: 'coordination',
      relationship: 'companion'
    });
    
    // Process all patterns
    allPatterns.forEach(({ pattern, type, patternType, relationship }) => {
      const matches = [...originalText.matchAll(pattern)];
      matches.forEach(match => {
        let names = [];
        let fullContext = '';
        
        // Extract names based on pattern type
        if (patternType === 'direct' || patternType === 'possessive_pronoun') {
          names = [match[2]];
          fullContext = `${relationship} ${match[2]}`;
        } else if (patternType === 'possessive_form') {
          names = [match[1]];
          fullContext = `${match[1]}'s ${relationship}`;
        } else if (patternType === 'dialogue') {
          names = [match[2]];
          fullContext = `speaker ${match[2]}`;
        } else if (patternType === 'coordination') {
          names = [match[1], match[2]];
          fullContext = `${match[1]} and ${match[2]}`;
        }
        
        // Process each detected name
        names.forEach(name => {
          const nameLower = name.toLowerCase();
          
          // Skip if already detected
          if (secondaryCharacters.find(c => c.name === nameLower)) return;
          
          // Apply smart name validation
          if (!this.isValidName(name, fullContext)) return;
          
          // Create character entry with disambiguation
          const character = {
            name: nameLower,
            displayName: name, // Preserve original capitalization
            type: type,
            category: 'secondary_character',
            needsConsistency: true,
            relationshipType: this.getRelationshipCategory(type),
            fullContext: fullContext,
            patternType: patternType,
            relationship: relationship,
            disambiguation: this.generateDisambiguation(name, relationship, type)
          };
          
          secondaryCharacters.push(character);
        });
      });
    });
    
    return secondaryCharacters;
  }

  // ============= ENHANCED ANIMAL DETECTION WITH SPECIES DISAMBIGUATION =============
  static detectCharacterAnimals(originalText, lowercaseText) {
    const characterAnimals = [];
    
    // Define comprehensive animal patterns with species recognition
    const animalPatterns = [
      // Pattern 1: Name + Species (e.g., "Buddy the dog", "Whiskers cat")
      { pattern: /\b([A-Z][a-z]{1,14})\s+(?:the\s+)?(\w+)/gi, nameFirst: true },
      
      // Pattern 2: Possessive + Species + Name (e.g., "my dog Buddy", "her cat Whiskers")
      { pattern: /\b(?:my|your|his|her|their|our)\s+(\w+)\s+([A-Z][a-z]{1,14})/gi, nameFirst: false },
      
      // Pattern 3: Species + Name possessive (e.g., "dog Buddy's", "cat Whiskers's")
      { pattern: /\b(\w+)\s+([A-Z][a-z]{1,14})'?s/gi, nameFirst: false },
      
      // Pattern 4: Dialogue attribution for animals (e.g., '"Woof!" barked Buddy')
      { pattern: /["']([^"']+)["'][,.]?\s+(?:barked|meowed|chirped|squeaked|roared|growled|purred|neighed)\s+([A-Z][a-z]{1,14})/gi, nameFirst: false, isDialogue: true }
    ];
    
    // Process animal patterns
    animalPatterns.forEach(({ pattern, nameFirst, isDialogue }) => {
      const matches = [...originalText.matchAll(pattern)];
      matches.forEach(match => {
        let animalName, potentialSpecies;
        
        if (nameFirst) {
          animalName = match[1];
          potentialSpecies = match[2];
        } else {
          potentialSpecies = match[1];
          animalName = match[2];
        }
        
        // Validate if the potential species is actually an animal
        const animalSpecies = this.validateAnimalSpecies(potentialSpecies.toLowerCase());
        if (!animalSpecies) return;
        
        // Apply name validation
        if (!this.isValidName(animalName, `pet ${animalSpecies}`)) return;
        
        const key = `${animalName.toLowerCase()}_${animalSpecies}`;
        
        // Skip if already detected
        if (characterAnimals.find(a => a.key === key)) return;
        
        const animal = {
          name: animalName.toLowerCase(),
          displayName: animalName,
          species: animalSpecies,
          key: key,
          type: 'character_animal',
          category: 'character_animal',
          needsConsistency: true,
          hasDialogue: isDialogue || false,
          fullContext: `pet ${animalSpecies} ${animalName}`,
          disambiguation: `${animalName} (a pet ${animalSpecies}, not an object named ${animalName.toLowerCase()})`
        };
        
        characterAnimals.push(animal);
      });
    });
    
    return characterAnimals;
  }

  // ============= RELATIONSHIP DETECTION (from EnhancedAnimalDetector) =============
  static detectRelationships(text, context) {
    const relationships = [];

    // Relationship patterns
    const relationshipPatterns = [
      // Pet ownership
      /\b(my|his|her|their)\s+(pet|dog|cat|rabbit|hamster|bird|fish)\b/gi,
      
      // Family relationships
      /\b(my|his|her)\s+(mom|dad|sister|brother|family)\b/gi,
      
      // Friend relationships
      /\b(my|his|her)\s+(friend|buddy|pal)\b/gi,
      
      // With relationships
      /\bwith\s+(my|his|her|their)\s+(mom|dad|friend|pet|dog|cat)\b/gi
    ];

    relationshipPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const possessive = match[1];
        const target = match[2];
        
        relationships.push({
          type: this.classifyRelationship(target),
          possessive,
          target,
          mention: match[0],
          position: match.index,
          confidence: 0.8
        });
      }
    });

    return relationships.slice(0, 10); // Limit to prevent bloat
  }

  // ============= ORIGINAL VISUAL CHARACTER GENERATION (enhanced) =============
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
      const skinTone = avatar.skinTone;
      console.log('🎭 [CHARACTER DEBUG] Avatar data received:', { type: avatar.type, skinTone: avatar.skinTone, fullAvatar: avatar });
      
      // Direct visual mapping (matches orchestrator output)
      const visualMap = {
        'pale': 'fair skin white child with red hair',
        'light': 'white child with blonde hair', 
        'medium': 'medium skin white child with brown hair',
        'olive': 'olive skin white child with black hair',
        'dark': 'black child'
      };
      
      // Use direct visual description
      if (!skinTone) {
        console.log('🚨 [CHARACTER DEBUG] Missing skinTone in avatar data, this will cause incorrect character generation');
        return {
          description: 'friendly child character',
          age: this.getAgeFromDifficulty(difficulty),
          gender: genderType
        };
      }
      const directVisual = visualMap[skinTone] || `child with ${skinTone} skin`;
      
      // Adjust for gender
      if (genderType === 'boy') {
        description = directVisual.replace('child', 'boy');
      } else if (genderType === 'girl') {
        description = directVisual.replace('child', 'girl');
      } else {
        description = directVisual;
      }
      
      // Cultural enhancement using tier25Vocabulary
      if (culturalEnhancement && userInfo.nativeLanguage === 'en') {
        const clothingStyle = pick(PLACEHOLDER_POOLS.clothingStyles || ['modern clothing'], userInfo.name);
        description += ` in ${clothingStyle}`;
      }
    }
    
    return {
      description,
      age: this.getAgeFromDifficulty(difficulty),
      gender: genderType
    };
  }

  // ============= ENHANCED SECONDARY CHARACTER GENERATION =============
  static generateSecondaryCharacter(type, details, userInfo, sessionId) {
    const primary = this.generatePrimaryCharacter(userInfo, 'medium', sessionId);
    
    // Enhanced secondary character generation with cultural consistency
    let secondaryDesc = '';
    
    if (type === 'family') {
      const familyRole = details.relationship || details.role || 'family member';
      secondaryDesc = this.generateFamilyCharacter(familyRole, primary, userInfo);
    } else if (type === 'community') {
      const communityRole = details.role || 'community member';
      secondaryDesc = this.generateCommunityCharacter(communityRole, primary, userInfo);
    } else if (type === 'animal') {
      const species = details.species || 'friendly animal';
      const animalName = details.name || pick(PLACEHOLDER_POOLS.level0Animals || ['pet'], sessionId);
      secondaryDesc = this.generateCharacterAnimalSeed(animalName, species, userInfo).description;
    }
    
    return {
      description: secondaryDesc,
      type,
      relationship: details.relationship || 'secondary',
      needsConsistency: true
    };
  }

  // ============= FAMILY CHARACTER GENERATION WITH CULTURAL CONSISTENCY =============
  static generateFamilyCharacter(familyRole, mainCharacter, userInfo) {
    const skinTone = userInfo.avatar?.skinTone;
    console.log('👨‍👩‍👧‍👦 [FAMILY DEBUG] Generating family character with skinTone:', skinTone);
    
    if (!skinTone) {
      console.log('🚨 [FAMILY DEBUG] Missing skinTone for family character generation');
      return `${familyRole}`;
    }
    
    const familyDescriptors = {
      mother: `loving ${familyRole} with ${skinTone} skin`,
      mom: `loving mother with ${skinTone} skin`,
      mommy: `loving mother with ${skinTone} skin`,
      mama: `loving mother with ${skinTone} skin`,
      father: `caring ${familyRole} with ${skinTone} skin`,
      dad: `caring father with ${skinTone} skin`,
      daddy: `caring father with ${skinTone} skin`,
      papa: `caring father with ${skinTone} skin`,
      sister: `young ${familyRole} with ${skinTone} skin`,
      sis: `young sister with ${skinTone} skin`,
      brother: `young ${familyRole} with ${skinTone} skin`,
      bro: `young brother with ${skinTone} skin`,
      grandmother: `wise ${familyRole} with ${skinTone} skin`,
      grandma: `wise grandmother with ${skinTone} skin`,
      nana: `wise grandmother with ${skinTone} skin`,
      grandfather: `kind ${familyRole} with ${skinTone} skin`,
      grandpa: `kind grandfather with ${skinTone} skin`,
      aunt: `friendly ${familyRole} with ${skinTone} skin`,
      auntie: `friendly aunt with ${skinTone} skin`,
      uncle: `helpful ${familyRole} with ${skinTone} skin`
    };
    
    return familyDescriptors[familyRole] || `${familyRole} with ${skinTone} skin`;
  }

  // ============= COMMUNITY CHARACTER GENERATION =============
  static generateCommunityCharacter(communityRole, mainCharacter, userInfo) {
    const communityDescriptors = {
      teacher: `friendly ${communityRole}`,
      instructor: `helpful teacher`,
      tutor: `patient tutor`,
      friend: `cheerful ${communityRole}`,
      buddy: `loyal friend`,
      pal: `fun friend`,
      neighbor: `kind ${communityRole}`,
      neighbour: `kind neighbor`,
      doctor: `caring ${communityRole}`,
      nurse: `gentle nurse`,
      coach: `encouraging ${communityRole}`,
      trainer: `supportive coach`
    };
    
    return communityDescriptors[communityRole] || `helpful ${communityRole}`;
  }

  // ============= CHARACTER ANIMAL GENERATION WITH TIER25 VOCABULARY =============
  static generateCharacterAnimalSeed(animalName, species, userInfo) {
    console.log(`🐾 Generating character animal: ${animalName} the ${species}`);
    
    const animalDescriptors = {
      dog: 'friendly dog',
      puppy: 'playful puppy',
      cat: 'curious cat',
      kitten: 'adorable kitten',
      bunny: 'soft bunny',
      rabbit: 'gentle rabbit',
      horse: 'majestic horse',
      pony: 'small pony',
      bird: 'colorful bird',
      parrot: 'talking parrot',
      hamster: 'tiny hamster',
      fish: 'swimming fish',
      turtle: 'slow turtle'
    };
    
    const description = animalDescriptors[species.toLowerCase()] || `${species}`;
    
    return {
      name: animalName,
      species,
      description,
      seed: this.generateSeededRandom(`${animalName}_${species}`)
    };
  }

  // ============= UTILITY FUNCTIONS =============
  static normalizeAnimalMention(mention) {
    return mention.toLowerCase().replace(/s$/, '').trim();
  }

  static identifyAnimalType(mention, allAnimals) {
    const normalized = this.normalizeAnimalMention(mention);
    
    return allAnimals.find(animal => 
      normalized.includes(animal) || animal.includes(normalized)
    );
  }

  static categorizeAnimal(animalName) {
    const domesticAnimals = PLACEHOLDER_POOLS.level0Animals?.slice(0, 8) || ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'fish', 'turtle'];
    const farmAnimals = ['horse', 'cow', 'pig', 'sheep', 'chicken', 'duck'];
    const wildAnimals = ['bear', 'lion', 'tiger', 'elephant', 'monkey'];
    
    if (domesticAnimals.includes(animalName)) return 'domestic';
    if (farmAnimals.includes(animalName)) return 'farm';
    if (wildAnimals.includes(animalName)) return 'wild';
    return 'unknown';
  }

  static extractAnimalAttributes(text) {
    const attributes = {};
    
    // Color attributes using tier25Vocabulary
    const colors = PLACEHOLDER_POOLS.colors || ['red', 'blue', 'green', 'yellow', 'orange', 'purple'];
    const colorMatch = text.match(new RegExp(`\\b(${colors.join('|')})\\b`, 'i'));
    if (colorMatch) attributes.color = colorMatch[1];
    
    // Size attributes using tier25Vocabulary
    const sizes = PLACEHOLDER_POOLS.sizes || ['big', 'small', 'little', 'tiny', 'huge', 'large'];
    const sizeMatch = text.match(new RegExp(`\\b(${sizes.join('|')})\\b`, 'i'));
    if (sizeMatch) attributes.size = sizeMatch[1];
    
    // Personality attributes
    const personalities = ['friendly', 'cute', 'fluffy', 'playful', 'gentle'];
    const personalityMatch = text.match(new RegExp(`\\b(${personalities.join('|')})\\b`, 'i'));
    if (personalityMatch) attributes.personality = personalityMatch[1];
    
    return attributes;
  }

  static extractCharacterAttributes(text, characterType) {
    const attributes = {};
    
    // Look for descriptive words near the character mention
    const descriptors = ['kind', 'funny', 'smart', 'helpful', 'tall', 'short', 'young', 'old'];
    const descriptorMatch = text.match(new RegExp(`\\b(${descriptors.join('|')})\\s+${characterType}|${characterType}\\s+is\\s+(${descriptors.join('|')})\\b`, 'i'));
    if (descriptorMatch) {
      attributes.descriptor = descriptorMatch[1] || descriptorMatch[2];
    }
    
    return attributes;
  }

  static classifyRelationship(target) {
    const familyTerms = ['mom', 'dad', 'sister', 'brother', 'family', 'grandma', 'grandpa'];
    const petTerms = ['pet', 'dog', 'cat', 'rabbit', 'hamster', 'bird', 'fish'];
    const friendTerms = ['friend', 'buddy', 'pal'];
    
    if (familyTerms.includes(target)) return 'family';
    if (petTerms.includes(target)) return 'pet';
    if (friendTerms.includes(target)) return 'friend';
    return 'unknown';
  }

  static calculateConfidence(match, fullText) {
    let confidence = 0.5;
    
    // Higher confidence for longer matches
    if (match.length > 10) confidence += 0.2;
    
    // Higher confidence for matches with descriptors
    if (/\b(big|small|friendly|cute)\b/i.test(match)) confidence += 0.2;
    
    // Higher confidence for possessive relationships
    if (/\b(my|his|her|their)\b/i.test(match)) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  // ============= NAME VALIDATION AND DISAMBIGUATION =============
  static isValidName(name, context) {
    // Basic validation
    if (!name || name.length < 2 || name.length > 15) return false;
    if (!/^[A-Z][a-z]+$/.test(name)) return false;
    
    // Filter out obvious non-names
    const nonNames = ['The', 'And', 'But', 'For', 'With', 'Very', 'So', 'Then', 'Now', 'Here', 'There'];
    if (nonNames.includes(name)) return false;
    
    // Filter out days and months
    const timeWords = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
                      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                      'September', 'October', 'November', 'December'];
    if (timeWords.includes(name)) return false;
    
    return true;
  }

  static generateDisambiguation(name, relationship, type) {
    const nameLower = name.toLowerCase();
    
    // Check if this name could be confused with a common object
    if (this.COMMON_WORD_NAMES.includes(nameLower)) {
      const relationshipCategory = this.getRelationshipCategory(type);
      return `${name} (a ${relationshipCategory} named ${name}, not the ${nameLower})`;
    }
    
    return null;
  }

  static getRelationshipCategory(type) {
    if (type.startsWith('family_')) return 'family member';
    if (type.startsWith('community_')) return 'friend';
    if (type.startsWith('authority_')) return 'authority figure';
    return 'person';
  }

  static validateAnimalSpecies(species) {
    // Use tier25Vocabulary for animal validation
    const commonAnimals = PLACEHOLDER_POOLS.level0Animals || [
      'dog', 'cat', 'puppy', 'kitten', 'rabbit', 'bunny', 'hamster', 'guinea pig',
      'bird', 'parrot', 'canary', 'fish', 'goldfish', 'turtle', 'lizard', 'snake',
      'horse', 'pony', 'cow', 'pig', 'sheep', 'goat', 'chicken', 'duck', 'goose',
      'elephant', 'lion', 'tiger', 'bear', 'wolf', 'fox', 'deer', 'rabbit',
      'squirrel', 'mouse', 'rat', 'frog', 'butterfly', 'bee', 'spider',
      'dolphin', 'whale', 'shark', 'octopus', 'penguin', 'eagle', 'owl'
    ];
    
    return commonAnimals.includes(species) ? species : null;
  }

  // ============= STORAGE AND RETRIEVAL =============
  static storeDetections(sessionId, pageNumber, detections) {
    const key = `${sessionId}_page_${pageNumber}`;
    
    // Store with size limit
    if (this.detectedAnimals.size >= this.maxDetections) {
      const firstKey = this.detectedAnimals.keys().next().value;
      this.detectedAnimals.delete(firstKey);
    }
    
    this.detectedAnimals.set(key, {
      sessionId,
      pageNumber,
      detections,
      timestamp: Date.now()
    });
  }

  static getStoredDetections(sessionId, pageNumber = null) {
    if (pageNumber) {
      const key = `${sessionId}_page_${pageNumber}`;
      return this.detectedAnimals.get(key);
    }
    
    // Return all detections for session
    const sessionDetections = [];
    for (const [key, value] of this.detectedAnimals.entries()) {
      if (value.sessionId === sessionId) {
        sessionDetections.push(value);
      }
    }
    return sessionDetections;
  }

  static clearDetections(sessionId = null) {
    if (sessionId) {
      // Clear specific session
      for (const key of this.detectedAnimals.keys()) {
        if (key.startsWith(sessionId)) {
          this.detectedAnimals.delete(key);
        }
      }
    } else {
      // Clear all
      this.detectedAnimals.clear();
      this.secondaryCharacters.clear();
      this.relationshipMap.clear();
    }
  }

  // ============= CONSISTENCY HELPERS =============
  static getConsistentAnimalDescription(animalName, sessionId) {
    const stored = this.getStoredDetections(sessionId);
    
    for (const detection of stored) {
      const animal = detection.detections.animals.find(a => a.name === animalName);
      if (animal && animal.attributes) {
        const attrs = animal.attributes;
        const description = [];
        
        if (attrs.size) description.push(attrs.size);
        if (attrs.color) description.push(attrs.color);
        if (attrs.personality) description.push(attrs.personality);
        
        description.push(animalName);
        return description.join(' ');
      }
    }
    
    return animalName; // Fallback to basic name
  }

  static generateAnimalPromptAddition(detections) {
    const { animals, secondaryCharacters } = detections;
    const promptParts = [];
    
    // Add animal descriptions
    animals.forEach(animal => {
      const description = [];
      if (animal.attributes.size) description.push(animal.attributes.size);
      if (animal.attributes.color) description.push(animal.attributes.color);
      if (animal.attributes.personality) description.push(animal.attributes.personality);
      description.push(animal.name);
      
      promptParts.push(description.join(' '));
    });
    
    // Add secondary character hints
    secondaryCharacters.forEach(character => {
      if (character.category === 'family') {
        promptParts.push(`${character.type} figure in background`);
      }
    });
    
    return promptParts.length > 0 ? `Include: ${promptParts.join(', ')}` : '';
  }

  // ============= ORIGINAL SESSION MANAGEMENT =============
  static generatePrimaryCharacter(userInfo, difficulty = 'medium', sessionId) {
    const key = sessionId || 'default';
    
    if (this.sessionCharacters.has(key)) {
      return this.sessionCharacters.get(key);
    }
    
    const character = this.generateCharacterDescription(userInfo, difficulty, 'rich', true);
    this.sessionCharacters.set(key, character);
    
    return character;
  }

  static getCharacterConsistencyData(sessionId) {
    return this.sessionCharacters.get(sessionId) || null;
  }

  static clearSession(sessionId) {
    this.sessionCharacters.delete(sessionId);
    this.clearDetections(sessionId);
  }

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

  // ============= ENHANCED API FOR CHARACTERCONSISTENCYSERVICE =============
  
  /**
   * Parse elements with enhanced detection patterns and disambiguation
   * API compatible with SecondaryElementDetector.parseElements
   */
  static async parseElements(sessionId, primaryScene, storyText, pageNumber) {
    console.log(`🔍 UnifiedCharacterDescriptor - Parsing for session ${sessionId}, page ${pageNumber}`);
    
    const detectedElements = [];
    
    // Input validation
    if (!sessionId) throw new Error('UnifiedCharacterDescriptor.parseElements: sessionId is required');
    if (typeof pageNumber !== 'number') {
      throw new Error('UnifiedCharacterDescriptor.parseElements: pageNumber must be a number');
    }
    
    // Preserve original case for name detection, lowercase for pattern matching
    const originalText = `${primaryScene || ''} ${storyText}`;
    const combinedText = originalText.toLowerCase();
    
    // Enhanced detection with consolidated patterns
    const secondaryCharacters = this.detectSecondaryCharacters(originalText, { sessionId, pageNumber });
    detectedElements.push(...secondaryCharacters);
    
    // Enhanced animal detection with species disambiguation
    const characterAnimals = this.detectCharacterAnimals(originalText, combinedText);
    detectedElements.push(...characterAnimals);
    
    console.log(`✅ Enhanced detection complete: ${detectedElements.length} secondary elements:`, 
      detectedElements.map(e => `${e.displayName || e.name} (${e.type}) ${e.disambiguation ? `[${e.disambiguation}]` : ''}`));
    
    return detectedElements;
  }

  /**
   * Generate secondary character description using consolidated logic
   * API compatible with original UnifiedCharacterDescriptor
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
    } else if (type === 'named_character' || type === 'dialogue_attribution' || type === 'coordinated_names') {
      // Named characters - assume friend/peer
      description = `${name}, a friendly child`;
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
}