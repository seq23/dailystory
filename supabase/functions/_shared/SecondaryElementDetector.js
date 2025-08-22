/**
 * Secondary Element Detector - Phase 1 Implementation
 * Detects secondary characters and animals from primaryScene and story text for visual consistency
 */

export class SecondaryElementDetector {
  
  /**
   * Parse elements from primaryScene and story text to detect secondary elements
   */
  static async parseElements(sessionId, primaryScene, storyText, pageNumber) {
    console.log(`🔍 SecondaryElementDetector - Parsing elements for session ${sessionId}, page ${pageNumber}`);
    
    const detectedElements = [];
    
    try {
      // Combine primaryScene and storyText for comprehensive analysis
      const combinedText = `${primaryScene || ''} ${storyText || ''}`.toLowerCase();
      
      // Detect secondary characters (family, friends, teachers)
      const secondaryCharacters = this.detectSecondaryCharacters(combinedText);
      detectedElements.push(...secondaryCharacters);
      
      // Detect character animals (pets with dialogue/names)
      const characterAnimals = this.detectCharacterAnimals(combinedText);
      detectedElements.push(...characterAnimals);
      
      // Detect background animals (atmospheric only - no consistency tracking needed)
      const backgroundAnimals = this.detectBackgroundAnimals(combinedText);
      detectedElements.push(...backgroundAnimals);
      
      console.log(`✅ Detected ${detectedElements.length} secondary elements:`, detectedElements.map(e => `${e.name} (${e.type})`));
      
      return detectedElements;
      
    } catch (error) {
      console.error('❌ SecondaryElementDetector parsing error:', error);
      return [];
    }
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
      { pattern: /(?:my|your|his|her|their)\s+(grandma|grandmother|granny)/gi, type: 'family_grandmother' },
      { pattern: /(?:my|your|his|her|their)\s+(grandpa|grandfather)/gi, type: 'family_grandfather' },
      { pattern: /(?:my|your|his|her|their)\s+(aunt|auntie)/gi, type: 'family_aunt' },
      { pattern: /(?:my|your|his|her|their)\s+(uncle)/gi, type: 'family_uncle' }
    ];
    
    // Community relationship patterns
    const communityPatterns = [
      { pattern: /(?:my|your|his|her|their|the)\s+(teacher|instructor)/gi, type: 'community_teacher' },
      { pattern: /(?:my|your|his|her|their)\s+(friend|buddy|pal)/gi, type: 'community_friend' },
      { pattern: /(?:my|your|his|her|their|the)\s+(neighbor)/gi, type: 'community_neighbor' },
      { pattern: /(?:my|your|his|her|their|the)\s+(doctor|dr)/gi, type: 'community_doctor' },
      { pattern: /(?:my|your|his|her|their|the)\s+(coach)/gi, type: 'community_coach' }
    ];
    
    // Named character patterns (specific names)
    const namedPatterns = [
      { pattern: /\b([A-Z][a-z]+)\s+(?:said|says|asked|smiled|laughed|nodded|walked|ran|came|went)/gi, type: 'named_character' },
      { pattern: /(?:said|says)\s+([A-Z][a-z]+)/gi, type: 'named_character' }
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
            relationshipType: 'family'
          });
        }
      });
    });
    
    // Process community patterns
    communityPatterns.forEach(({ pattern, type }) => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        const name = match[1].toLowerCase();
        if (!secondaryCharacters.find(c => c.name === name)) {
          secondaryCharacters.push({
            name: name,
            type: type,
            category: 'secondary_character',
            needsConsistency: true,
            relationshipType: 'community'
          });
        }
      });
    });
    
    // Process named character patterns
    namedPatterns.forEach(({ pattern, type }) => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        const name = match[1].toLowerCase();
        // Filter out common words that might be capitalized
        const commonWords = ['the', 'and', 'but', 'or', 'so', 'then', 'when', 'where', 'how', 'what', 'who'];
        if (!commonWords.includes(name) && name.length > 2) {
          if (!secondaryCharacters.find(c => c.name === name)) {
            secondaryCharacters.push({
              name: name,
              type: type,
              category: 'secondary_character',
              needsConsistency: true,
              relationshipType: 'named'
            });
          }
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
      { pattern: /\b([A-Z][a-z]+)\s+(?:the\s+)?(dog|cat|puppy|kitten|bunny|rabbit|horse|pony|bird|parrot|hamster|guinea pig)/gi, species: 'match' },
      { pattern: /(?:my|your|his|her|their)\s+(dog|cat|puppy|kitten|bunny|rabbit|horse|pony|bird|parrot|hamster|guinea pig)\s+([A-Z][a-z]+)/gi, species: 'first' }
    ];
    
    // Animal with dialogue patterns
    const dialogueAnimalPatterns = [
      { pattern: /(dog|cat|puppy|kitten|bunny|rabbit|horse|pony|bird|parrot|hamster|guinea pig)\s+(?:said|says|barked|meowed|chirped|squeaked)/gi },
      { pattern: /(?:said|says)\s+the\s+(dog|cat|puppy|kitten|bunny|rabbit|horse|pony|bird|parrot|hamster|guinea pig)/gi }
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
    
    // Process dialogue animal patterns
    dialogueAnimalPatterns.forEach(({ pattern }) => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        const species = match[1].toLowerCase();
        const genericName = `the_${species}`;
        
        if (!characterAnimals.find(a => a.key === genericName)) {
          characterAnimals.push({
            name: `the ${species}`,
            species: species,
            key: genericName,
            type: 'character_animal',
            category: 'character_animal',
            needsConsistency: true,
            hasDialogue: true
          });
        } else {
          // Mark existing animal as having dialogue
          const existingAnimal = characterAnimals.find(a => a.key === genericName);
          if (existingAnimal) {
            existingAnimal.hasDialogue = true;
          }
        }
      });
    });
    
    return characterAnimals;
  }
  
  /**
   * Detect background animals (atmospheric only - no consistency tracking)
   */
  static detectBackgroundAnimals(text) {
    const backgroundAnimals = [];
    
    // Background animal patterns (atmospheric mentions)
    const backgroundPatterns = [
      { pattern: /\b(birds|butterflies|fish|squirrels|deer|rabbits|mice|frogs|bees|ants)\s+(?:flying|swimming|running|hopping|chirping|buzzing)/gi },
      { pattern: /(?:saw|heard|watched)\s+(?:some\s+)?(birds|butterflies|fish|squirrels|deer|rabbits|mice|frogs|bees|ants)/gi },
      { pattern: /(?:in the|at the)\s+(?:zoo|farm|park|forest|pond|lake|ocean|garden).*?(lions|tigers|bears|elephants|monkeys|zebras|giraffes|seals|dolphins|whales)/gi }
    ];
    
    backgroundPatterns.forEach(({ pattern }) => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        const species = match[1].toLowerCase();
        const key = `background_${species}`;
        
        if (!backgroundAnimals.find(a => a.key === key)) {
          backgroundAnimals.push({
            name: species,
            species: species,
            key: key,
            type: 'background_animal',
            category: 'background_animal',
            needsConsistency: false,
            isAtmospheric: true
          });
        }
      });
    });
    
    return backgroundAnimals;
  }
  
  /**
   * Classify animal mention as 'character' vs 'background'
   */
  static classifyAnimal(animalMention, context) {
    // Character animals have names, dialogue, or significant interactions
    const characterIndicators = [
      /\b[A-Z][a-z]+\s+the\s+/i, // Named animal
      /said|says|barked|meowed|chirped/i, // Has dialogue
      /pet|my|your|his|her|their/i, // Owned/personal
      /played with|hugged|petted|fed/i // Direct interaction
    ];
    
    const hasCharacterIndicators = characterIndicators.some(pattern => 
      pattern.test(animalMention) || pattern.test(context)
    );
    
    return hasCharacterIndicators ? 'character' : 'background';
  }
}