/**
 * Secondary Element Detector - Simplified Implementation
 * Detects secondary characters and animals from primaryScene and story text for visual consistency
 */

export class SecondaryElementDetector {
  
  /**
   * Parse elements from primaryScene and story text to detect secondary elements
   */
  static async parseElements(sessionId, primaryScene, storyText, pageNumber) {
    console.log(`🔍 SecondaryElementDetector - Parsing for session ${sessionId}, page ${pageNumber}`);
    
    const detectedElements = [];
    
    // Input validation
    if (!sessionId) throw new Error('SecondaryElementDetector.parseElements: sessionId is required');
    if (typeof pageNumber !== 'number') {
      throw new Error('SecondaryElementDetector.parseElements: pageNumber must be a number');
    }
    
    // Combine primaryScene and storyText for comprehensive analysis
    const combinedText = `${primaryScene || ''} ${storyText}`.toLowerCase();
    
    // Detect secondary characters (family, friends, teachers)
    const secondaryCharacters = this.detectSecondaryCharacters(combinedText);
    detectedElements.push(...secondaryCharacters);
    
    // Detect character animals (pets with dialogue/names)
    const characterAnimals = this.detectCharacterAnimals(combinedText);
    detectedElements.push(...characterAnimals);
    
    console.log(`✅ Detection complete: ${detectedElements.length} secondary elements:`, detectedElements.map(e => `${e.name} (${e.type})`));
    
    return detectedElements;
  }
  
  /**
   * Detect secondary characters (family, friends, teachers, etc.)
   */
  static detectSecondaryCharacters(text) {
    const secondaryCharacters = [];
    
    // Family relationship patterns
    const familyPatterns = [
      { pattern: /(?:my|your|his|her|their)\s+(mom|mother|mommy|mama)/gi, type: 'family_mother' },
      { pattern: /(?:my|your|his|her|their)\s+(dad|father|daddy|papa)/gi, type: 'family_father' },
      { pattern: /(?:my|your|his|her|their)\s+(sister|sis)/gi, type: 'family_sister' },
      { pattern: /(?:my|your|his|her|their)\s+(brother|bro)/gi, type: 'family_brother' },
      { pattern: /(?:my|your|his|her|their)\s+(friend|buddy|pal)/gi, type: 'community_friend' }
    ];
    
    // Process family patterns
    familyPatterns.forEach(({ pattern, type }) => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        const name = match[1].toLowerCase();
        if (!secondaryCharacters.find(c => c.name === name)) {
          secondaryCharacters.push({
            name: name,
            type: type,
            category: 'secondary_character',
            needsConsistency: true,
            relationshipType: type.includes('family') ? 'family' : 'community'
          });
        }
      });
    });
    
    return secondaryCharacters;
  }
  
  /**
   * Detect character animals (pets with dialogue, names, or significant actions)
   */
  static detectCharacterAnimals(text) {
    const characterAnimals = [];
    
    // Named animal patterns
    const namedAnimalPatterns = [
      { pattern: /\b([A-Z][a-z]+)\s+(?:the\s+)?(dog|cat|puppy|kitten|bunny|rabbit)/gi, species: 'match' },
      { pattern: /(?:my|your|his|her|their)\s+(dog|cat|puppy|kitten|bunny|rabbit)\s+([A-Z][a-z]+)/gi, species: 'first' }
    ];
    
    // Process named animal patterns
    namedAnimalPatterns.forEach(({ pattern, species }) => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        let animalName, animalSpecies;
        
        if (species === 'match') {
          animalName = match[1].toLowerCase();
          animalSpecies = match[2].toLowerCase();
        } else if (species === 'first') {
          animalSpecies = match[1].toLowerCase();
          animalName = match[2].toLowerCase();
        }
        
        if (animalName && animalSpecies) {
          const key = `${animalName}_${animalSpecies}`;
          if (!characterAnimals.find(a => a.key === key)) {
            characterAnimals.push({
              name: animalName,
              species: animalSpecies,
              key: key,
              type: 'character_animal',
              category: 'character_animal',
              needsConsistency: true,
              hasDialogue: false
            });
          }
        }
      });
    });
    
    return characterAnimals;
  }
}