// Shared story visual state management for edge functions
// Simplified version for server-side character consistency

class StoryVisualStateManager {
  static storyStates = new Map();

  static getOrCreateStoryState(sessionId, totalPages = 10) {
    if (!this.storyStates.has(sessionId)) {
      this.storyStates.set(sessionId, {
        sessionId,
        totalPages,
        characters: {},
        setting: {
          timeOfDay: null,
          weather: null,
          location: null,
          locked: false
        },
        relationships: {},
        runwareContext: {
          lastSuccessfulParameters: null,
          locked: false
        },
        pageProgress: 0,
        locationHistory: []
      });
    }
    return this.storyStates.get(sessionId);
  }

  static updateCharacterWithSeed(sessionId, characterName, description, seed, pageNumber = 1) {
    if (!sessionId || !characterName) return;
    
    const state = this.getOrCreateStoryState(sessionId);
    
    if (!state.characters[characterName]) {
      state.characters[characterName] = {
        name: characterName,
        description,
        seed: seed,
        firstAppearance: pageNumber,
        lastAppearance: pageNumber,
        consistencyLocked: false
      };
    } else {
      // Update existing character
      if (description) state.characters[characterName].description = description;
      if (seed !== undefined) state.characters[characterName].seed = seed;
      state.characters[characterName].lastAppearance = Math.max(
        state.characters[characterName].lastAppearance || 0,
        pageNumber
      );
    }

    console.log(`✅ Updated character ${characterName} with seed ${seed} in session ${sessionId}`);
  }

  static getCharacterSeed(sessionId, characterName) {
    if (!sessionId || !characterName) return undefined;
    
    const state = this.storyStates.get(sessionId);
    if (!state || !state.characters[characterName]) return undefined;
    
    return state.characters[characterName].seed;
  }

  static clearStoryState(sessionId) {
    if (sessionId) {
      this.storyStates.delete(sessionId);
      console.log(`🧹 Cleared story state for session ${sessionId}`);
    }
  }

  static getAllCharactersForPrompt(sessionId) {
    if (!sessionId) return '';
    
    const state = this.storyStates.get(sessionId);
    if (!state || !Object.keys(state.characters).length) return '';
    
    const characterDescriptions = Object.values(state.characters)
      .map(char => `${char.name}: ${char.description}`)
      .join('; ');
    
    return `Character consistency: ${characterDescriptions}`;
  }
}

export { StoryVisualStateManager };