/**
 * Enhanced Secondary Character Detection System with Name/Object Disambiguation
 * Detects 25+ relationship types with context-aware name validation for Tier 2.5 integration
 */

export class SecondaryElementDetector {
  
  // Comprehensive relationship types (25+ categories)
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
    
    // Extended Family (6 types)
    family_cousin: ['cousin'],
    family_nephew: ['nephew'],
    family_niece: ['niece'],
    family_stepmother: ['stepmother', 'stepmom'],
    family_stepfather: ['stepfather', 'stepdad'],
    family_stepsister: ['stepsister'],
    family_stepbrother: ['stepbrother'],
    
    // Friends & Peers (8 types)
    community_friend: ['friend', 'buddy', 'pal', 'companion'],
    community_best_friend: ['best friend', 'bestie'],
    community_classmate: ['classmate'],
    community_teammate: ['teammate'],
    community_neighbor: ['neighbor', 'neighbour'],
    community_playmate: ['playmate'],
    
    // Authority Figures (10 types)
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

  /**
   * Parse elements with enhanced detection patterns and disambiguation
   */
  static async parseElements(sessionId: string, primaryScene: string, storyText: string, pageNumber: number): Promise<any> {
    console.log(`🔍 Enhanced SecondaryElementDetector - Parsing for session ${sessionId}, page ${pageNumber}`);
    
    const detectedElements = [];
    
    // Input validation
    if (!sessionId) throw new Error('SecondaryElementDetector.parseElements: sessionId is required');
    if (typeof pageNumber !== 'number') {
      throw new Error('SecondaryElementDetector.parseElements: pageNumber must be a number');
    }
    
    // Preserve original case for name detection, lowercase for pattern matching
    const originalText = `${primaryScene || ''} ${storyText}`;
    const combinedText = originalText.toLowerCase();
    
    // Enhanced detection with 5 pattern types
    const secondaryCharacters = this.detectSecondaryCharacters(originalText, combinedText);
    detectedElements.push(...secondaryCharacters);
    
    // Enhanced animal detection with species disambiguation
    const characterAnimals = this.detectCharacterAnimals(originalText, combinedText);
    detectedElements.push(...characterAnimals);
    
    console.log(`✅ Enhanced detection complete: ${detectedElements.length} secondary elements:`, 
      detectedElements.map(e => `${e.displayName || e.name} (${e.type}) ${e.disambiguation ? `[${e.disambiguation}]` : ''}`));
    
    return detectedElements;
  }
  
  /**
   * Enhanced detection of secondary characters with 5 pattern types and disambiguation
   */
  static detectSecondaryCharacters(originalText: string, lowercaseText: string): any[] {
    const secondaryCharacters: any[] = [];
    
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
        let names: string[] = [];
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
  
  /**
   * Enhanced animal detection with species disambiguation using Tier 2.5 vocabulary
   */
  static detectCharacterAnimals(originalText: string, lowercaseText: string): any[] {
    const characterAnimals: any[] = [];
    
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
        
        // Validate if the potential species is actually an animal from our vocabulary
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
  
  /**
   * Validate if a potential species matches the Tier 2.5 unified vocabulary
   */
  static validateAnimalSpecies(species: string): boolean {
    // Common animal species that would be in the Tier 2.5 vocabulary
    const commonAnimals = [
      'dog', 'cat', 'puppy', 'kitten', 'rabbit', 'bunny', 'hamster', 'guinea pig',
      'bird', 'parrot', 'canary', 'fish', 'goldfish', 'turtle', 'lizard', 'snake',
      'horse', 'pony', 'cow', 'pig', 'sheep', 'goat', 'chicken', 'duck', 'goose',
      'elephant', 'lion', 'tiger', 'bear', 'wolf', 'fox', 'deer', 'rabbit',
      'squirrel', 'mouse', 'rat', 'frog', 'butterfly', 'bee', 'spider',
      'dolphin', 'whale', 'shark', 'octopus', 'penguin', 'eagle', 'owl'
    ];
    
    return commonAnimals.includes(species);
  }
  
  /**
   * Smart name validation with context awareness
   */
  static isValidName(name: string, context: string): boolean {
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
  
  /**
   * Generate disambiguation context for names that could be objects
   */
  static generateDisambiguation(name: string, relationship: string, type: string): string {
    const nameLower = name.toLowerCase();
    
    // Check if this name could be confused with a common object
    if (this.COMMON_WORD_NAMES.includes(nameLower)) {
      const relationshipCategory = this.getRelationshipCategory(type);
      return `${name} (a ${relationshipCategory} named ${name}, not the ${nameLower})`;
    }
    
    return name; // Return name as is if no disambiguation needed
  }
  
  /**
   * Get relationship category for disambiguation
   */
  static getRelationshipCategory(type: string): string {
    if (type.startsWith('family_')) return 'family member';
    if (type.startsWith('community_')) return 'friend';
    if (type.startsWith('authority_')) return 'authority figure';
    return 'person';
  }
}