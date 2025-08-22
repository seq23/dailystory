/**
 * Story Visual State Manager - Backend Component
 * Maintains visual consistency across story pages by tracking characters, objects, settings, and prompts
 */

class StoryVisualStateManager {
  constructor() {
    // Each sessionId gets its own isolated state
    this.storyStates = new Map();
  }

  // Initialize or retrieve story state for a session
  static getOrCreateStoryState(sessionId, isNeverEnding = false, totalPages = null) {
    if (!globalThis.storyVisualStateManager) {
      globalThis.storyVisualStateManager = new StoryVisualStateManager();
    }
    
    if (!globalThis.storyVisualStateManager.storyStates.has(sessionId)) {
      const state = {
        sessionId,
        isNeverEnding,
        totalPages,
        characters: new Map(), // character name -> { seed, appearance, firstMention, lastMention }
        objects: new Map(),    // object key -> { descriptions, attributes, firstMention, lastMention }
        settings: [],          // array of { location, timeOfDay, weather, pageNumber }
        currentSetting: null,
        locationHistory: [],
        promptHistory: [],     // successful prompts for consistency
        pageNumber: 1,
        lastSuccessfulPrompt: null,
        // Core avatar identity tracking
        avatarType: null,
        skinTone: null,
        coreCharacterTraits: new Map(),
        // NEW: Secondary element tracking
        secondaryCharacters: new Map(), // family, friends with seeds
        characterAnimals: new Map(),    // pets with dialogue/names
        relationships: new Map()        // family connections
      };
      globalThis.storyVisualStateManager.storyStates.set(sessionId, state);
    }
    
    return globalThis.storyVisualStateManager.storyStates.get(sessionId);
  }

  // Update character with seed and appearance info
  static updateCharacterWithSeed(sessionId, characterName, seed, appearance) {
    const state = this.getOrCreateStoryState(sessionId);
    
    const existing = state.characters.get(characterName);
    const updatedCharacter = {
      ...existing,
      characterName,
      seed,
      appearance,
      lastMention: state.pageNumber,
      firstMention: existing?.firstMention || state.pageNumber
    };
    
    state.characters.set(characterName, updatedCharacter);
    
    // Track core avatar traits
    if (characterName === 'child' || characterName === state.mainCharacterName) {
      state.coreCharacterTraits.set('avatarType', appearance.avatarType || state.avatarType);
      state.coreCharacterTraits.set('skinTone', appearance.skinTone || state.skinTone);
    }
    
    console.log(`🎭 Updated character ${characterName} with seed ${seed} for session ${sessionId}`);
  }

  // Get character seed for consistency
  static getCharacterSeed(sessionId, characterName) {
    const state = this.getOrCreateStoryState(sessionId);
    const character = state.characters.get(characterName);
    return character ? character.seed : null;
  }

  // Update story setting (location, time, weather)
  static updateSetting(sessionId, newSetting) {
    const state = this.getOrCreateStoryState(sessionId);
    
    // Add to location history if location changed
    if (state.currentSetting && 
        state.currentSetting.location !== newSetting.location) {
      state.locationHistory.push(state.currentSetting.location);
    }
    
    state.currentSetting = {
      ...newSetting,
      pageNumber: state.pageNumber
    };
    
    state.settings.push(state.currentSetting);
  }

  // Get current setting info for prompts
  static getSettingForPrompt(sessionId) {
    const state = this.getOrCreateStoryState(sessionId);
    if (!state.currentSetting) return '';
    
    const { location, timeOfDay, weather } = state.currentSetting;
    const parts = [];
    
    if (location) parts.push(`Location: ${location}`);
    if (timeOfDay) parts.push(`Time: ${timeOfDay}`);
    if (weather) parts.push(`Weather: ${weather}`);
    
    return parts.join(', ');
  }

  // Parse text and track visual details
  static analyzeAndTrackVisualDetails(sessionId, text, pageNumber) {
    const state = this.getOrCreateStoryState(sessionId);
    state.pageNumber = pageNumber;
    
    // Extract objects/items mentioned with basic attribute parsing
    const objectPatterns = [
      /(?:a|an|the)\s+([a-zA-Z\s]+?)(?:\s+(?:is|was|were|are)|\.|,)/gi,
      /(?:wearing|holding|carrying|has)\s+([a-zA-Z\s]+?)(?:\s|\.|,)/gi,
      /(?:red|blue|green|yellow|black|white|brown|pink|purple|orange)\s+([a-zA-Z]+)/gi
    ];
    
    objectPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const description = match[1].trim().toLowerCase();
        if (description.length > 2 && description.length < 30) {
          const objectKey = this.extractObjectKey(description);
          const attributes = this.extractAttributes(description);
          
          const existing = state.objects.get(objectKey);
          state.objects.set(objectKey, {
            ...existing,
            descriptions: existing?.descriptions ? 
              [...existing.descriptions, description].slice(-3) : [description],
            attributes: { ...existing?.attributes, ...attributes },
            firstMention: existing?.firstMention || pageNumber,
            lastMention: pageNumber
          });
        }
      }
    });
    
    console.log(`🔍 Analyzed visual details for page ${pageNumber} of session ${sessionId}`);
  }

  // Extract base object from description
  static extractObjectKey(description) {
    // Remove color adjectives and articles
    return description
      .replace(/^(a|an|the)\s+/, '')
      .replace(/\s+(red|blue|green|yellow|black|white|brown|pink|purple|orange)\s*/, ' ')
      .trim();
  }

  // Extract visual attributes from description
  static extractAttributes(description) {
    const attributes = {};
    
    const colorMatch = description.match(/(red|blue|green|yellow|black|white|brown|pink|purple|orange)/i);
    if (colorMatch) attributes.color = colorMatch[1].toLowerCase();
    
    const sizeMatch = description.match(/(big|small|large|tiny|huge|little)/i);
    if (sizeMatch) attributes.size = sizeMatch[1].toLowerCase();
    
    return attributes;
  }

  // Get visual consistency details for prompts
  static getVisualDetailsForPrompt(sessionId) {
    const state = this.getOrCreateStoryState(sessionId);
    
    const details = [];
    
    // Character appearance consistency
    if (state.characters.size > 0) {
      const characterDetails = Array.from(state.characters.values())
        .filter(char => state.pageNumber - char.lastMention <= 2)
        .map(char => `${char.characterName}: ${char.appearance || 'established appearance'}`)
        .join(', ');
      
      if (characterDetails) details.push(`Characters: ${characterDetails}`);
    }
    
    // Recent object descriptions  
    const recentObjects = Array.from(state.objects.entries())
      .filter(([_, obj]) => state.pageNumber - obj.lastMention <= 1)
      .slice(-5)
      .map(([key, obj]) => {
        const attrs = Object.values(obj.attributes).join(' ');
        return attrs ? `${attrs} ${key}` : key;
      })
      .join(', ');
    
    if (recentObjects) details.push(`Objects: ${recentObjects}`);
    
    return details.join(' | ');
  }

  // Store successful prompt for consistency
  static addSuccessfulPrompt(sessionId, prompt, params, seed, imageURL, pageNumber) {
    const state = this.getOrCreateStoryState(sessionId);
    
    const promptEntry = {
      prompt,
      params,
      seed,
      imageURL,
      pageNumber,
      timestamp: Date.now()
    };
    
    state.promptHistory.push(promptEntry);
    state.lastSuccessfulPrompt = promptEntry;
    
    // Keep only last 10 prompts for memory efficiency
    if (state.promptHistory.length > 10) {
      state.promptHistory = state.promptHistory.slice(-10);
    }
    
    console.log(`✅ Stored successful prompt for page ${pageNumber} of session ${sessionId}`);
  }

  // Get prompt history for consistency
  static getPromptHistory(sessionId, limit = null) {
    const state = this.getOrCreateStoryState(sessionId);
    const history = state.promptHistory || [];
    
    return limit ? history.slice(-limit) : history;
  }

  // Get recent story context from prompts
  static getRecentStoryContext(sessionId, pages = 3) {
    const history = this.getPromptHistory(sessionId, pages);
    return history.map(entry => ({
      page: entry.pageNumber,
      prompt: entry.prompt.slice(0, 100),
      seed: entry.seed
    }));
  }

  // Get character evolution data
  static getCharacterEvolution(sessionId, characterName) {
    const state = this.getOrCreateStoryState(sessionId);
    const character = state.characters.get(characterName);
    
    if (!character) return null;
    
    return {
      name: characterName,
      seed: character.seed,
      appearance: character.appearance,
      firstMention: character.firstMention,
      lastMention: character.lastMention,
      pageSpan: character.lastMention - character.firstMention
    };
  }

  // Get setting history
  static getSettingHistory(sessionId) {
    const state = this.getOrCreateStoryState(sessionId);
    
    return {
      currentSetting: state.currentSetting,
      locationHistory: state.locationHistory,
      settingsTimeline: state.settings
    };
  }

  // Get object usage trajectory
  static getObjectTrajectory(sessionId, objectName) {
    const state = this.getOrCreateStoryState(sessionId);
    const object = state.objects.get(objectName);
    
    if (!object) return null;
    
    return {
      objectName,
      descriptions: object.descriptions,
      attributes: object.attributes,
      firstMention: object.firstMention,
      lastMention: object.lastMention,
      consistencyScore: object.descriptions.length > 1 ? 
        (object.descriptions.length - new Set(object.descriptions).size) / object.descriptions.length : 1
    };
  }

  // Get last successful prompt details
  static getLastSuccessfulPrompt(sessionId) {
    const state = this.getOrCreateStoryState(sessionId);
    return state.lastSuccessfulPrompt;
  }

  // Clear story state for a session
  static clearStoryState(sessionId) {
    if (!globalThis.storyVisualStateManager) return;
    
    globalThis.storyVisualStateManager.storyStates.delete(sessionId);
    // Also clear pronoun resolution data
    if (globalThis.AdvancedPronounResolver) {        
      globalThis.AdvancedPronounResolver.clearSession(sessionId);
    }
    // Clear AI enhancement cache for this session
    if (globalThis.MultiStageEnhancementPipeline) {
      globalThis.MultiStageEnhancementPipeline.clearSessionCache(sessionId);
    }
  }

  // Context-aware clearing for different story transitions
  static clearBasedOnContext(sessionId, isPremium, context = 'session-end') {
    if (!globalThis.storyVisualStateManager) return;
    
    console.log(`🎭 Clearing story state based on context: ${context}, isPremium: ${isPremium}`);
    
    switch (context) {
      case 'rewrite':
        if (isPremium) {
          // Premium rewrite: Clear story content but preserve avatar identity
          this.clearStoryContentOnly(sessionId);
          console.log('🎭 Premium rewrite: Cleared story content, preserved avatar identity');
        } else {
          // Free rewrite: Clear everything
          this.clearStoryState(sessionId);
          console.log('🎭 Free rewrite: Cleared all state');
        }
        break;
      
      case 'next-story':
        // Both free and premium: Clear story but may preserve character seeds for consistency
        this.clearStoryState(sessionId);
        console.log('🎭 Next story: Cleared all state for fresh start');
        break;
      
      case 'continue-story':
        // Premium Part II: Keep all character state for consistency
        console.log('🎭 Continue story: Keeping all character state for Part II');
        break;
      
      default:
        // Session end or manual: Clear everything
        this.clearStoryState(sessionId);
        console.log('🎭 Default clearing: Cleared all state');
    }
  }

  // Clear only story content while preserving avatar identity for premium rewrites
  static clearStoryContentOnly(sessionId) {
    if (!globalThis.storyVisualStateManager) return;
    
    const state = globalThis.storyVisualStateManager.storyStates.get(sessionId);
    if (!state) return;

    // Preserve core avatar identity data
    const preservedAvatarData = {
      avatarType: state.avatarType,
      skinTone: state.skinTone,
      coreCharacterTraits: state.coreCharacterTraits
    };

    // Clear story-specific data but keep avatar identity
    const newState = {
      ...this.getOrCreateStoryState(sessionId),
      ...preservedAvatarData,
      characters: new Map(), // Clear character appearances but preserve avatar seeds
      objects: new Map(),
      settings: [],
      promptHistory: [],
      lastSuccessfulPrompt: null,
      pageNumber: 1
    };

    globalThis.storyVisualStateManager.storyStates.set(sessionId, newState);
    
    // Clear story-specific caches but preserve avatar data
    if (globalThis.AdvancedPronounResolver) {
      globalThis.AdvancedPronounResolver.clearStoryContentOnly && 
      globalThis.AdvancedPronounResolver.clearStoryContentOnly(sessionId);
    }
    if (globalThis.MultiStageEnhancementPipeline) {
      globalThis.MultiStageEnhancementPipeline.clearStoryContentOnly && 
      globalThis.MultiStageEnhancementPipeline.clearStoryContentOnly(sessionId);
    }

    console.log(`🎭 Cleared story content only, preserved avatar: ${preservedAvatarData.avatarType}/${preservedAvatarData.skinTone}`);
  }

  // Create continuation session for premium users (Part II)
  static createContinuationSession(originalSessionId, newSessionId) {
    if (!globalThis.storyVisualStateManager) return false;
    
    const originalState = globalThis.storyVisualStateManager.storyStates.get(originalSessionId);
    if (!originalState) return false;

    // Create new session with preserved character consistency
    const continuationState = {
      sessionId: newSessionId,
      isNeverEnding: true,
      totalPages: null,
      characters: new Map(originalState.characters), // Preserve all character data
      objects: new Map(), // Fresh objects for new story
      settings: [],
      currentSetting: null,
      locationHistory: [],
      promptHistory: [], // Fresh prompt history
      pageNumber: 1,
      lastSuccessfulPrompt: null,
      // Preserve avatar identity
      avatarType: originalState.avatarType,
      skinTone: originalState.skinTone,
      coreCharacterTraits: new Map(originalState.coreCharacterTraits)
    };

    globalThis.storyVisualStateManager.storyStates.set(newSessionId, continuationState);
    
    console.log(`🔗 Created continuation session ${newSessionId} from ${originalSessionId} with preserved character state`);
    return true;
  }

  // New method: Resolve pronouns in text using AdvancedPronounResolver
  static resolvePronouns(sessionId, text, pageNumber = 1) {
    if (!globalThis.AdvancedPronounResolver) {
      console.warn('AdvancedPronounResolver not available, returning original text');
      return text;
    }
    
    // Use advanced pronoun resolution
    const resolvedText = globalThis.AdvancedPronounResolver.resolveComplexPronouns(sessionId, text, pageNumber);
    
    if (resolvedText !== text) {
      console.log(`🔄 Backend pronoun resolution applied: "${text.slice(0, 50)}..." → "${resolvedText.slice(0, 50)}..."`);
    }
    
    return resolvedText;
  }

  static getStoryState(sessionId) {
    if (!globalThis.storyVisualStateManager) return null;
    return globalThis.storyVisualStateManager.storyStates.get(sessionId);
  }

  // NEW: Secondary character management methods
  static updateSecondaryCharacter(sessionId, characterName, characterType, relationshipType, pageNumber) {
    const state = this.getOrCreateStoryState(sessionId);
    
    const key = `${characterName}_${characterType}`;
    const existing = state.secondaryCharacters.get(key);
    
    const updatedCharacter = {
      ...existing,
      name: characterName,
      type: characterType,
      relationshipType,
      seed: existing?.seed || this.generateSeededRandom(key),
      firstMention: existing?.firstMention || pageNumber,
      lastMention: pageNumber,
      description: existing?.description || ''
    };
    
    state.secondaryCharacters.set(key, updatedCharacter);
    
    // Track family relationships
    if (relationshipType === 'family') {
      const relationshipKey = `main_to_${characterName}`;
      state.relationships.set(relationshipKey, {
        from: 'main_character',
        to: characterName,
        relationship: characterType,
        pageEstablished: pageNumber
      });
    }
    
    console.log(`🎭 Updated secondary character: ${characterName} (${characterType}) with seed ${updatedCharacter.seed}`);
    return updatedCharacter;
  }

  static updateCharacterAnimal(sessionId, animalName, species, hasDialogue, pageNumber) {
    const state = this.getOrCreateStoryState(sessionId);
    
    const key = `${animalName}_${species}`.replace(/\s+/g, '_');
    const existing = state.characterAnimals.get(key);
    
    const updatedAnimal = {
      ...existing,
      name: animalName,
      species,
      hasDialogue,
      seed: existing?.seed || this.generateSeededRandom(key),
      firstMention: existing?.firstMention || pageNumber,
      lastMention: pageNumber,
      description: existing?.description || ''
    };
    
    state.characterAnimals.set(key, updatedAnimal);
    
    console.log(`🐾 Updated character animal: ${animalName} the ${species} with seed ${updatedAnimal.seed}`);
    return updatedAnimal;
  }

  static getSecondaryCharacters(sessionId, pageNumber) {
    const state = this.getOrCreateStoryState(sessionId);
    
    // Return characters mentioned within last 3 pages for relevance
    const recentCharacters = Array.from(state.secondaryCharacters.values())
      .filter(char => !pageNumber || Math.abs(pageNumber - char.lastMention) <= 3)
      .map(char => ({
        name: char.name,
        type: char.type,
        relationshipType: char.relationshipType,
        seed: char.seed,
        description: char.description,
        pageSpan: char.lastMention - char.firstMention + 1
      }));
    
    return recentCharacters;
  }

  static getCharacterAnimals(sessionId, pageNumber) {
    const state = this.getOrCreateStoryState(sessionId);
    
    // Return animals mentioned within last 3 pages for relevance
    const recentAnimals = Array.from(state.characterAnimals.values())
      .filter(animal => !pageNumber || Math.abs(pageNumber - animal.lastMention) <= 3)
      .map(animal => ({
        name: animal.name,
        species: animal.species,
        hasDialogue: animal.hasDialogue,
        seed: animal.seed,
        description: animal.description,
        pageSpan: animal.lastMention - animal.firstMention + 1
      }));
    
    return recentAnimals;
  }

  static generateSecondaryCharacterSeed(sessionId, characterName, characterType, description) {
    const state = this.getOrCreateStoryState(sessionId);
    const key = `${characterName}_${characterType}`;
    
    // Generate consistent seed based on character key
    const seed = this.generateSeededRandom(key);
    
    // Update the stored character with description
    const existing = state.secondaryCharacters.get(key);
    if (existing) {
      existing.description = description;
      existing.seed = seed;
      state.secondaryCharacters.set(key, existing);
    }
    
    return seed;
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

// Export for use in other backend modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StoryVisualStateManager };
} else {
  globalThis.StoryVisualStateManager = StoryVisualStateManager;
}
