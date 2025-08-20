// Animal Character Consistency Manager
// Ensures single animal per story and consistent appearance across pages

class AnimalCharacterManager {
  static animalRegistry = new Map(); // sessionId -> animal data
  
  static analyzeAndRegisterAnimals(sessionId, storyText, pageNumber) {
    const sessionAnimals = this.getOrCreateSessionAnimals(sessionId);
    
    // Animal detection patterns
    const animalPatterns = [
      { pattern: /(red|blue|green|yellow|orange|brown|black|white|gray|golden)\s+(dog|puppy|cat|kitten|bird|hamster|rabbit|bunny|horse|pony)/gi, type: 'colored-animal' },
      { pattern: /(big|small|tiny|little|large)\s+(red|blue|green|yellow|orange|brown|black|white|gray|golden)\s+(dog|puppy|cat|kitten|bird|hamster|rabbit|bunny|horse|pony)/gi, type: 'sized-colored-animal' },
      { pattern: /(dog|puppy|cat|kitten|bird|hamster|rabbit|bunny|horse|pony)\s+named\s+(\w+)/gi, type: 'named-animal' },
      { pattern: /(\w+)\s+the\s+(dog|puppy|cat|kitten|bird|hamster|rabbit|bunny|horse|pony)/gi, type: 'named-animal-alt' },
      { pattern: /(friendly|playful|happy|energetic|calm|gentle|loyal)\s+(dog|puppy|cat|kitten|bird|hamster|rabbit|bunny|horse|pony)/gi, type: 'personality-animal' }
    ];
    
    const detectedAnimals = [];
    
    for (const rule of animalPatterns) {
      let match;
      while ((match = rule.pattern.exec(storyText)) !== null) {
        let animalData = this.extractAnimalData(match, rule.type);
        if (animalData) {
          detectedAnimals.push(animalData);
        }
      }
    }
    
    // Process detected animals and enforce single animal rule
    this.processDetectedAnimals(sessionId, detectedAnimals, pageNumber);
    
    return sessionAnimals;
  }
  
  static extractAnimalData(match, type) {
    let animal = {};
    
    switch (type) {
      case 'colored-animal':
        animal = {
          species: match[2].toLowerCase(),
          color: match[1].toLowerCase(),
          name: null,
          personality: null,
          size: null
        };
        break;
        
      case 'sized-colored-animal':
        animal = {
          species: match[3].toLowerCase(),
          color: match[2].toLowerCase(),
          size: match[1].toLowerCase(),
          name: null,
          personality: null
        };
        break;
        
      case 'named-animal':
        animal = {
          species: match[1].toLowerCase(),
          name: match[2],
          color: null,
          personality: null,
          size: null
        };
        break;
        
      case 'named-animal-alt':
        animal = {
          species: match[2].toLowerCase(),
          name: match[1],
          color: null,
          personality: null,
          size: null
        };
        break;
        
      case 'personality-animal':
        animal = {
          species: match[2].toLowerCase(),
          personality: match[1].toLowerCase(),
          color: null,
          name: null,
          size: null
        };
        break;
    }
    
    animal.fullMatch = match[0];
    animal.detectedType = type;
    return animal;
  }
  
  static processDetectedAnimals(sessionId, detectedAnimals, pageNumber) {
    const sessionAnimals = this.getOrCreateSessionAnimals(sessionId);
    
    for (const detectedAnimal of detectedAnimals) {
      const existingAnimal = this.findMatchingAnimal(sessionAnimals, detectedAnimal);
      
      if (existingAnimal) {
        // Update existing animal with new attributes
        this.mergeAnimalAttributes(existingAnimal, detectedAnimal);
        existingAnimal.lastMentionedPage = pageNumber;
        existingAnimal.mentionCount++;
        console.log(`🐾 Updated existing animal: ${this.describeAnimal(existingAnimal)}`);
      } else {
        // Check if we already have an animal of this species (enforce single animal rule)
        const sameSpeciesAnimal = sessionAnimals.find(a => a.species === detectedAnimal.species);
        
        if (sameSpeciesAnimal) {
          // Merge with existing animal instead of creating new one
          console.log(`⚠️ Single animal enforcement: Merging new ${detectedAnimal.species} with existing ${this.describeAnimal(sameSpeciesAnimal)}`);
          this.mergeAnimalAttributes(sameSpeciesAnimal, detectedAnimal);
          sameSpeciesAnimal.lastMentionedPage = pageNumber;
          sameSpeciesAnimal.mentionCount++;
        } else {
          // Create new animal
          const newAnimal = {
            species: detectedAnimal.species,
            name: detectedAnimal.name,
            color: detectedAnimal.color,
            size: detectedAnimal.size,
            personality: detectedAnimal.personality,
            seed: this.generateAnimalSeed(sessionId, detectedAnimal),
            firstMentionedPage: pageNumber,
            lastMentionedPage: pageNumber,
            mentionCount: 1,
            createdAt: Date.now()
          };
          
          sessionAnimals.push(newAnimal);
          console.log(`🆕 Registered new animal: ${this.describeAnimal(newAnimal)} with seed ${newAnimal.seed}`);
        }
      }
    }
    
    this.animalRegistry.set(sessionId, sessionAnimals);
  }
  
  static findMatchingAnimal(sessionAnimals, detectedAnimal) {
    return sessionAnimals.find(existing => {
      // Match by name if both have names
      if (existing.name && detectedAnimal.name) {
        return existing.name.toLowerCase() === detectedAnimal.name.toLowerCase();
      }
      
      // Match by species and attributes
      if (existing.species === detectedAnimal.species) {
        // If detected animal has specific attributes, check if they match or complement
        if (detectedAnimal.color && existing.color && existing.color !== detectedAnimal.color) {
          return false; // Different colors = different animals
        }
        
        // Same species with compatible attributes
        return true;
      }
      
      return false;
    });
  }
  
  static mergeAnimalAttributes(existing, detected) {
    // Merge attributes, preferring more specific information
    if (detected.name && !existing.name) existing.name = detected.name;
    if (detected.color && !existing.color) existing.color = detected.color;
    if (detected.size && !existing.size) existing.size = detected.size;
    if (detected.personality && !existing.personality) existing.personality = detected.personality;
  }
  
  static generateAnimalSeed(sessionId, animalData) {
    let hash = 0;
    const input = `${sessionId}-${animalData.species}-${animalData.color || 'default'}-${animalData.name || 'unnamed'}`;
    
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash);
  }
  
  static getConsistentAnimalDescription(sessionId, animalReference) {
    const sessionAnimals = this.animalRegistry.get(sessionId) || [];
    
    // Try to match the reference to a known animal
    const matchedAnimal = this.findAnimalByReference(sessionAnimals, animalReference);
    
    if (matchedAnimal) {
      return this.buildFullAnimalDescription(matchedAnimal);
    }
    
    return animalReference; // Return original if no match found
  }
  
  static findAnimalByReference(sessionAnimals, reference) {
    const lowerRef = reference.toLowerCase();
    
    // Check for exact species match
    let match = sessionAnimals.find(animal => lowerRef.includes(animal.species));
    
    // Check for name match
    if (!match) {
      match = sessionAnimals.find(animal => 
        animal.name && lowerRef.includes(animal.name.toLowerCase())
      );
    }
    
    // Check for "the dog", "the cat" patterns
    if (!match && lowerRef.includes('the ')) {
      const speciesPattern = /the\s+(\w+)/;
      const speciesMatch = reference.match(speciesPattern);
      if (speciesMatch) {
        match = sessionAnimals.find(animal => animal.species === speciesMatch[1].toLowerCase());
      }
    }
    
    return match;
  }
  
  static buildFullAnimalDescription(animal) {
    let description = '';
    
    if (animal.size) description += `${animal.size} `;
    if (animal.color) description += `${animal.color} `;
    if (animal.personality) description += `${animal.personality} `;
    
    description += animal.species;
    
    if (animal.name) {
      description += ` named ${animal.name}`;
    }
    
    return description;
  }
  
  static describeAnimal(animal) {
    return this.buildFullAnimalDescription(animal);
  }
  
  static injectConsistentAnimals(sessionId, storyText, pageNumber) {
    const sessionAnimals = this.animalRegistry.get(sessionId) || [];
    let enhancedText = storyText;
    
    // Replace vague animal references with consistent descriptions
    const replacementPatterns = [
      { pattern: /\bthe\s+(dog|puppy|cat|kitten|bird|hamster|rabbit|bunny|horse|pony)\b/gi, type: 'definite-article' },
      { pattern: /\ba\s+(dog|puppy|cat|kitten|bird|hamster|rabbit|bunny|horse|pony)\b/gi, type: 'indefinite-article' }
    ];
    
    for (const rule of replacementPatterns) {
      enhancedText = enhancedText.replace(rule.pattern, (match, species) => {
        const consistentAnimal = sessionAnimals.find(a => a.species === species.toLowerCase());
        
        if (consistentAnimal && pageNumber > consistentAnimal.firstMentionedPage) {
          const fullDescription = this.buildFullAnimalDescription(consistentAnimal);
          console.log(`🔄 Replaced "${match}" with "${fullDescription}"`);
          return fullDescription;
        }
        
        return match; // Keep original if no consistent animal found
      });
    }
    
    return enhancedText;
  }
  
  static getAnimalSeedsForPrompt(sessionId) {
    const sessionAnimals = this.animalRegistry.get(sessionId) || [];
    
    if (sessionAnimals.length === 0) return null;
    
    const animalDescriptions = sessionAnimals.map(animal => {
      return `consistent ${this.buildFullAnimalDescription(animal)} (seed: ${animal.seed})`;
    });
    
    return animalDescriptions.join(', ');
  }
  
  static getSessionAnimals(sessionId) {
    return this.animalRegistry.get(sessionId) || [];
  }
  
  static clearSessionAnimals(sessionId) {
    this.animalRegistry.delete(sessionId);
  }
  
  static getOrCreateSessionAnimals(sessionId) {
    if (!this.animalRegistry.has(sessionId)) {
      this.animalRegistry.set(sessionId, []);
    }
    return this.animalRegistry.get(sessionId);
  }
  
  static validateSingleAnimalRule(sessionId) {
    const sessionAnimals = this.animalRegistry.get(sessionId) || [];
    const speciesCount = {};
    
    sessionAnimals.forEach(animal => {
      speciesCount[animal.species] = (speciesCount[animal.species] || 0) + 1;
    });
    
    const violations = Object.entries(speciesCount).filter(([_, count]) => count > 1);
    
    if (violations.length > 0) {
      console.warn(`⚠️ Single animal rule violations in session ${sessionId}:`, violations);
      return false;
    }
    
    return true;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AnimalCharacterManager };
}

// Also make it available as a global for direct import
globalThis.AnimalCharacterManager = AnimalCharacterManager;