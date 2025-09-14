/**
 * ENHANCED ANIMAL & SECONDARY CHARACTER DETECTION - PHASE 3
 * Advanced detection of animals and secondary characters with relationship mapping
 * Integrates with tier25Vocabulary for consistent animal detection
 */

import { VOCABULARY, pick, PLACEHOLDER_POOLS } from './tier25Vocabulary.js';

export class EnhancedAnimalDetector {
  constructor() {
    this.detectedAnimals = new Map();
    this.secondaryCharacters = new Map();
    this.relationshipMap = new Map();
    this.maxDetections = 50; // Prevent memory bloat
  }

  /**
   * MASTER DETECTION - Detect all animals and secondary characters
   */
  detectAllCharacters(text, context = {}) {
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

      console.log(`🔍 [EnhancedAnimalDetector] Detected ${results.animals.length} animals, ${results.secondaryCharacters.length} secondary characters`);
      
      return results;

    } catch (error) {
      console.warn('⚠️ [EnhancedAnimalDetector] Detection error (non-blocking):', error.message);
      return { animals: [], secondaryCharacters: [], relationships: [], success: false, error: error.message };
    }
  }

  /**
   * 1. ENHANCED ANIMAL DETECTION
   */
  detectAnimals(text, context) {
    const detectedAnimals = [];
    const { userInfo = {} } = context;

    // Get all animal categories from vocabulary
    const allAnimals = [
      ...VOCABULARY.animals.domestic,
      ...VOCABULARY.animals.farm,
      ...VOCABULARY.animals.wild
    ];

    // Enhanced animal detection patterns
    const animalPatterns = [
      // Basic animal mentions
      new RegExp(`\\b(${allAnimals.join('|')})s?\\b`, 'gi'),
      
      // Pet relationships
      /\b(my|his|her|their)\s+(pet|dog|cat|rabbit|hamster|bird|fish)\b/gi,
      
      // Animal with descriptors
      new RegExp(`\\b(big|small|little|tiny|fluffy|friendly|cute)\\s+(${allAnimals.join('|')})s?\\b`, 'gi'),
      
      // Colored animals
      new RegExp(`\\b(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\\s+(${allAnimals.join('|')})s?\\b`, 'gi'),
      
      // Animal actions
      new RegExp(`\\b(${allAnimals.join('|')})s?\\s+(runs?|jumps?|plays?|sleeps?|eats?|walks?)\\b`, 'gi')
    ];

    // Process each pattern
    animalPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const animalMention = this.normalizeAnimalMention(match[0]);
        const animalType = this.identifyAnimalType(animalMention);
        
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

  /**
   * 2. SECONDARY CHARACTER DETECTION
   */
  detectSecondaryCharacters(text, context) {
    const secondaryCharacters = [];

    // Family member patterns
    const familyPatterns = [
      /\b(mom|mother|mommy|mama)\b/gi,
      /\b(dad|father|daddy|papa)\b/gi,
      /\b(sister|sis)\b/gi,
      /\b(brother|bro)\b/gi,
      /\b(grandma|grandmother|nana)\b/gi,
      /\b(grandpa|grandfather|papa)\b/gi,
      /\b(aunt|auntie)\b/gi,
      /\b(uncle)\b/gi,
      /\b(cousin)\b/gi
    ];

    // Friend patterns
    const friendPatterns = [
      /\b(friend|buddy|pal)\b/gi,
      /\b(classmate|teammate)\b/gi,
      /\b(neighbor)\b/gi,
      /\b(teacher|instructor)\b/gi
    ];

    // Named character patterns (proper nouns)
    const namedCharacterPattern = /\b[A-Z][a-z]+\s+(said|says|went|goes|has|had|is|was|are|were)\b/g;

    // Process family patterns
    familyPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const characterType = match[1].toLowerCase();
        if (!secondaryCharacters.find(c => c.type === characterType)) {
          secondaryCharacters.push({
            type: characterType,
            category: 'family',
            mention: match[0],
            attributes: this.extractCharacterAttributes(text, characterType),
            position: match.index,
            confidence: 0.8
          });
        }
      }
    });

    // Process friend patterns
    friendPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const characterType = match[1].toLowerCase();
        if (!secondaryCharacters.find(c => c.type === characterType)) {
          secondaryCharacters.push({
            type: characterType,
            category: 'social',
            mention: match[0],
            attributes: this.extractCharacterAttributes(text, characterType),
            position: match.index,
            confidence: 0.7
          });
        }
      }
    });

    // Process named characters
    let match;
    while ((match = namedCharacterPattern.exec(text)) !== null) {
      const name = match[0].split(' ')[0];
      if (!secondaryCharacters.find(c => c.name === name)) {
        secondaryCharacters.push({
          name,
          type: 'person',
          category: 'named',
          mention: match[0],
          attributes: { hasName: true },
          position: match.index,
          confidence: 0.9
        });
      }
    }

    return secondaryCharacters.slice(0, 10); // Limit to prevent bloat
  }

  /**
   * 3. RELATIONSHIP DETECTION
   */
  detectRelationships(text, context) {
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

  /**
   * UTILITY FUNCTIONS
   */
  normalizeAnimalMention(mention) {
    return mention.toLowerCase().replace(/s$/, '').trim();
  }

  identifyAnimalType(mention) {
    const normalized = this.normalizeAnimalMention(mention);
    
    // Check all animal categories
    const allAnimals = [
      ...VOCABULARY.animals.domestic,
      ...VOCABULARY.animals.farm,
      ...VOCABULARY.animals.wild
    ];

    return allAnimals.find(animal => 
      normalized.includes(animal) || animal.includes(normalized)
    );
  }

  categorizeAnimal(animalName) {
    if (VOCABULARY.animals.domestic.includes(animalName)) return 'domestic';
    if (VOCABULARY.animals.farm.includes(animalName)) return 'farm';
    if (VOCABULARY.animals.wild.includes(animalName)) return 'wild';
    return 'unknown';
  }

  extractAnimalAttributes(text) {
    const attributes = {};
    
    // Color attributes
    const colors = VOCABULARY.colors || ['red', 'blue', 'green', 'yellow', 'orange', 'purple'];
    const colorMatch = text.match(new RegExp(`\\b(${colors.join('|')})\\b`, 'i'));
    if (colorMatch) attributes.color = colorMatch[1];
    
    // Size attributes
    const sizes = ['big', 'small', 'little', 'tiny', 'huge', 'large'];
    const sizeMatch = text.match(new RegExp(`\\b(${sizes.join('|')})\\b`, 'i'));
    if (sizeMatch) attributes.size = sizeMatch[1];
    
    // Personality attributes
    const personalities = ['friendly', 'cute', 'fluffy', 'playful', 'gentle'];
    const personalityMatch = text.match(new RegExp(`\\b(${personalities.join('|')})\\b`, 'i'));
    if (personalityMatch) attributes.personality = personalityMatch[1];
    
    return attributes;
  }

  extractCharacterAttributes(text, characterType) {
    const attributes = {};
    
    // Look for descriptive words near the character mention
    const descriptors = ['kind', 'funny', 'smart', 'helpful', 'tall', 'short', 'young', 'old'];
    const descriptorMatch = text.match(new RegExp(`\\b(${descriptors.join('|')})\\s+${characterType}|${characterType}\\s+is\\s+(${descriptors.join('|')})\\b`, 'i'));
    if (descriptorMatch) {
      attributes.descriptor = descriptorMatch[1] || descriptorMatch[2];
    }
    
    return attributes;
  }

  classifyRelationship(target) {
    const familyTerms = ['mom', 'dad', 'sister', 'brother', 'family', 'grandma', 'grandpa'];
    const petTerms = ['pet', 'dog', 'cat', 'rabbit', 'hamster', 'bird', 'fish'];
    const friendTerms = ['friend', 'buddy', 'pal'];
    
    if (familyTerms.includes(target)) return 'family';
    if (petTerms.includes(target)) return 'pet';
    if (friendTerms.includes(target)) return 'friend';
    return 'unknown';
  }

  calculateConfidence(match, fullText) {
    let confidence = 0.5;
    
    // Higher confidence for longer matches
    if (match.length > 10) confidence += 0.2;
    
    // Higher confidence for matches with descriptors
    if (/\b(big|small|friendly|cute)\b/i.test(match)) confidence += 0.2;
    
    // Higher confidence for possessive relationships
    if (/\b(my|his|her|their)\b/i.test(match)) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * STORAGE AND RETRIEVAL
   */
  storeDetections(sessionId, pageNumber, detections) {
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

  getStoredDetections(sessionId, pageNumber = null) {
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

  clearDetections(sessionId = null) {
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

  /**
   * CONSISTENCY HELPERS - For use with other phases
   */
  getConsistentAnimalDescription(animalName, sessionId) {
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

  generateAnimalPromptAddition(detections) {
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
}

// Export singleton instance
export const enhancedAnimalDetector = new EnhancedAnimalDetector();