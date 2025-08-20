// StoryVisualStateManager - Backend JavaScript version
// Maintains visual consistency across story pages with pronoun resolution

class StoryVisualStateManager {
  static storyStates = new Map();

  static getOrCreateStoryState(sessionId) {
    if (!this.storyStates.has(sessionId)) {
      this.storyStates.set(sessionId, {
        sessionId,
        characters: new Map(),
        objects: new Map(),
        relationships: [],
        runwareContext: {
          promptHistory: [], // Store last 5 prompts with metadata
          consistentSeed: null,
          qualityScore: 0
        },
        setting: {
          location: null,
          timeOfDay: null,
          weather: null,
          environment: null
        },
        locationHistory: [],
        lastPageGenerated: 0,
        createdAt: new Date(),
        lastUpdated: new Date()
      });
    }
    return this.storyStates.get(sessionId);
  }

  static updateCharacterWithSeed(sessionId, characterName, seed, appearance) {
    const state = this.getOrCreateStoryState(sessionId);
    
    if (!state.characters.has(characterName)) {
      state.characters.set(characterName, {
        name: characterName,
        seed,
        appearance,
        firstMentionedPage: 1,
        lastMentionedPage: 1,
        consistentAttributes: new Map()
      });
    } else {
      const character = state.characters.get(characterName);
      character.seed = seed;
      character.appearance = appearance;
      character.lastMentionedPage = state.lastPageGenerated + 1;
    }
    
    state.lastUpdated = new Date();
  }

  static getCharacterSeed(sessionId, characterName) {
    const state = this.getOrCreateStoryState(sessionId);
    const character = state.characters.get(characterName);
    return character ? character.seed : null;
  }

  static updateSetting(sessionId, newSetting) {
    const state = this.getOrCreateStoryState(sessionId);
    
    // Store previous location in history
    if (state.setting.location && state.setting.location !== newSetting.location) {
      state.locationHistory.push({
        location: state.setting.location,
        timeOfDay: state.setting.timeOfDay,
        weather: state.setting.weather,
        pageNumber: state.lastPageGenerated
      });
    }
    
    // Update current setting
    Object.assign(state.setting, newSetting);
    state.lastUpdated = new Date();
  }

  static getSettingForPrompt(sessionId) {
    const state = this.getOrCreateStoryState(sessionId);
    const setting = state.setting;
    
    if (!setting.location && !setting.timeOfDay && !setting.weather) {
      return null;
    }
    
    let settingPrompt = '';
    if (setting.location) settingPrompt += setting.location;
    if (setting.timeOfDay) settingPrompt += `, ${setting.timeOfDay}`;
    if (setting.weather) settingPrompt += `, ${setting.weather}`;
    if (setting.environment) settingPrompt += `, ${setting.environment}`;
    
    return settingPrompt;
  }

  static analyzeAndTrackVisualDetails(sessionId, text, pageNumber) {
    const state = this.getOrCreateStoryState(sessionId);
    
    // Track simple objects and their attributes
    const objectPatterns = [
      { pattern: /(red|blue|green|yellow|purple|orange|pink|black|white|brown|gray) (car|ball|book|toy|bike|house|tree|flower)/gi, type: 'object' },
      { pattern: /(big|small|tiny|huge|large|little) (red|blue|green|yellow|purple|orange|pink|black|white|brown|gray) (car|ball|book|toy|bike|house|tree|flower)/gi, type: 'object' },
      { pattern: /(sunny|rainy|cloudy|snowy|foggy|stormy) (day|morning|afternoon|evening|night)/gi, type: 'weather' },
      { pattern: /(park|school|home|library|store|playground|garden|kitchen|bedroom)/gi, type: 'location' }
    ];
    
    objectPatterns.forEach(({ pattern, type }) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const objectDescription = match[0];
        const objectKey = this.extractObjectKey(objectDescription);
        
        if (!state.objects.has(objectKey)) {
          state.objects.set(objectKey, {
            name: objectKey,
            description: objectDescription,
            type,
            firstMentionedPage: pageNumber,
            lastMentionedPage: pageNumber,
            attributes: this.extractAttributes(objectDescription)
          });
        } else {
          const obj = state.objects.get(objectKey);
          obj.lastMentionedPage = pageNumber;
        }
      }
    });
    
    state.lastPageGenerated = pageNumber;
    state.lastUpdated = new Date();
  }

  static extractObjectKey(description) {
    // Extract the main object noun (car, ball, etc.)
    const words = description.toLowerCase().split(' ');
    const nouns = ['car', 'ball', 'book', 'toy', 'bike', 'house', 'tree', 'flower', 'bird', 'cat', 'dog'];
    return words.find(word => nouns.includes(word)) || words[words.length - 1];
  }

  static extractAttributes(description) {
    const attributes = new Map();
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'black', 'white', 'brown', 'gray'];
    const sizes = ['big', 'small', 'tiny', 'huge', 'large', 'little'];
    
    const words = description.toLowerCase().split(' ');
    
    colors.forEach(color => {
      if (words.includes(color)) {
        attributes.set('color', color);
      }
    });
    
    sizes.forEach(size => {
      if (words.includes(size)) {
        attributes.set('size', size);
      }
    });
    
    return attributes;
  }

  static getVisualDetailsForPrompt(sessionId) {
    const state = this.getOrCreateStoryState(sessionId);
    
    let consistencyPrompts = [];
    
    // Add character consistency
    state.characters.forEach((character, name) => {
      if (character.appearance) {
        consistencyPrompts.push(`${name} with consistent appearance: ${character.appearance}`);
      }
    });
    
    // Add object consistency
    state.objects.forEach((object, key) => {
      if (object.description) {
        consistencyPrompts.push(`consistent ${object.description}`);
      }
    });
    
    return consistencyPrompts.length > 0 ? consistencyPrompts.join(', ') : null;
  }

  static addSuccessfulPrompt(sessionId, prompt, params, seed, imageURL, pageNumber) {
    const state = this.getOrCreateStoryState(sessionId);
    
    // Add new prompt to history
    const promptEntry = {
      fullPrompt: prompt,
      params: params,
      seed: seed,
      imageURL: imageURL,
      pageNumber: pageNumber || state.lastPageGenerated,
      timestamp: new Date().toISOString(),
      promptLength: prompt ? prompt.length : 0
    };
    
    // Add to beginning of array and keep only last 5
    state.runwareContext.promptHistory.unshift(promptEntry);
    if (state.runwareContext.promptHistory.length > 5) {
      state.runwareContext.promptHistory = state.runwareContext.promptHistory.slice(0, 5);
    }
    
    state.runwareContext.consistentSeed = seed;
    state.runwareContext.qualityScore += 10;
    state.lastUpdated = new Date();
    
    console.log(`📝 Stored prompt history entry ${promptEntry.promptLength} chars for session ${sessionId}, total entries: ${state.runwareContext.promptHistory.length}`);
  }

  static getPromptHistory(sessionId, limit = 5) {
    const state = this.getStoryState(sessionId);
    if (!state || !state.runwareContext.promptHistory) {
      return [];
    }
    return state.runwareContext.promptHistory.slice(0, limit);
  }

  static getLastSuccessfulPrompt(sessionId) {
    const history = this.getPromptHistory(sessionId, 1);
    return history.length > 0 ? history[0].fullPrompt : null;
  }

  static clearStoryState(sessionId) {
    this.storyStates.delete(sessionId);
    // Also clear pronoun resolution data
    if (globalThis.AdvancedPronounResolver) {        
      globalThis.AdvancedPronounResolver.clearSession(sessionId);
    }
    // Clear AI enhancement cache for this session
    if (globalThis.MultiStageEnhancementPipeline) {
      globalThis.MultiStageEnhancementPipeline.clearSessionCache(sessionId);
    }
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
    return this.storyStates.get(sessionId);
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StoryVisualStateManager };
}

// Also make it available as a global for direct import
globalThis.StoryVisualStateManager = StoryVisualStateManager;