/**
 * Session State Manager - Clean Architecture
 * Handles session state, visual tracking, and story context
 * No globalThis dependencies, simple and reliable
 */

export class SessionStateManager {
  constructor() {
    this.sessionStates = new Map();
    console.log('📋 SessionStateManager initialized with clean architecture');
  }

  /**
   * Get or create session state
   */
  getOrCreateSessionState(sessionId, isNeverEnding = false, totalPages = null) {
    if (!this.sessionStates.has(sessionId)) {
      const state = {
        sessionId,
        isNeverEnding,
        totalPages,
        pageNumber: 1,
        
        // Visual tracking
        characters: new Map(),
        secondaryCharacters: new Map(),
        characterAnimals: new Map(),
        objects: new Map(),
        relationships: new Map(),
        
        // Setting tracking
        settings: [],
        currentSetting: null,
        locationHistory: [],
        
        // Prompt tracking
        promptHistory: [],
        lastSuccessfulPrompt: null,
        
        // Avatar tracking
        avatarType: null,
        skinTone: null,
        coreCharacterTraits: new Map(),
        
        createdAt: Date.now(),
        lastUpdated: Date.now()
      };
      
      this.sessionStates.set(sessionId, state);
      console.log(`📋 Created new session state: ${sessionId}`);
    }
    
    return this.sessionStates.get(sessionId);
  }

  /**
   * Update character with seed and appearance
   */
  updateCharacterWithSeed(sessionId, characterName, seed, appearance) {
    const state = this.getOrCreateSessionState(sessionId);
    
    const existing = state.characters.get(characterName);
    const updatedCharacter = {
      ...existing,
      characterName,
      seed,
      appearance,
      lastMention: state.pageNumber,
      firstMention: existing?.firstMention || state.pageNumber,
      updatedAt: Date.now()
    };
    
    state.characters.set(characterName, updatedCharacter);
    state.lastUpdated = Date.now();
    
    // Track core avatar traits for main character
    if (characterName === 'child' || characterName === state.mainCharacterName) {
      state.coreCharacterTraits.set('avatarType', appearance.avatarType || state.avatarType);
      state.coreCharacterTraits.set('skinTone', appearance.skinTone || state.skinTone);
    }
    
    console.log(`📋 Updated character ${characterName} with seed ${seed} for session ${sessionId}`);
    return updatedCharacter;
  }

  /**
   * Get character seed for consistency
   */
  getCharacterSeed(sessionId, characterName) {
    const state = this.getOrCreateSessionState(sessionId);
    const character = state.characters.get(characterName);
    return character ? character.seed : null;
  }

  /**
   * Update secondary character
   */
  updateSecondaryCharacter(sessionId, characterName, type, relationship, hasDialogue, pageNumber) {
    const state = this.getOrCreateSessionState(sessionId);
    
    const secondaryChar = {
      characterName,
      type, // 'family' | 'community'
      relationship,
      hasDialogue,
      pageNumber,
      firstMention: state.secondaryCharacters.get(characterName)?.firstMention || pageNumber,
      lastMention: pageNumber,
      updatedAt: Date.now()
    };
    
    state.secondaryCharacters.set(characterName, secondaryChar);
    state.lastUpdated = Date.now();
    
    console.log(`📋 Updated secondary character ${characterName} (${type}) for session ${sessionId}`);
  }

  /**
   * Update character animal
   */
  updateCharacterAnimal(sessionId, animalName, species, hasDialogue, pageNumber) {
    const state = this.getOrCreateSessionState(sessionId);
    
    const animal = {
      animalName,
      species,
      hasDialogue,
      pageNumber,
      firstMention: state.characterAnimals.get(animalName)?.firstMention || pageNumber,
      lastMention: pageNumber,
      updatedAt: Date.now()
    };
    
    state.characterAnimals.set(animalName, animal);
    state.lastUpdated = Date.now();
    
    console.log(`📋 Updated character animal ${animalName} (${species}) for session ${sessionId}`);
  }

  /**
   * Get secondary characters
   */
  getSecondaryCharacters(sessionId, pageNumber = null) {
    const state = this.getOrCreateSessionState(sessionId);
    const characters = Array.from(state.secondaryCharacters.values());
    
    if (pageNumber) {
      return characters.filter(char => char.lastMention >= pageNumber - 2);
    }
    
    return characters;
  }

  /**
   * Get character animals
   */
  getCharacterAnimals(sessionId, pageNumber = null) {
    const state = this.getOrCreateSessionState(sessionId);
    const animals = Array.from(state.characterAnimals.values());
    
    if (pageNumber) {
      return animals.filter(animal => animal.lastMention >= pageNumber - 2);
    }
    
    return animals;
  }

  /**
   * Update story setting
   */
  updateSetting(sessionId, newSetting) {
    const state = this.getOrCreateSessionState(sessionId);
    
    // Add to location history if location changed
    if (state.currentSetting && state.currentSetting.location !== newSetting.location) {
      state.locationHistory.push(state.currentSetting.location);
    }
    
    state.currentSetting = {
      ...newSetting,
      pageNumber: state.pageNumber,
      timestamp: Date.now()
    };
    
    state.settings.push(state.currentSetting);
    state.lastUpdated = Date.now();
    
    console.log(`📋 Updated setting for session ${sessionId}: ${newSetting.location}`);
  }

  /**
   * Get setting for prompt generation
   */
  getSettingForPrompt(sessionId) {
    const state = this.getOrCreateSessionState(sessionId);
    if (!state.currentSetting) return '';
    
    const setting = state.currentSetting;
    return `${setting.location || 'outdoor setting'}${setting.timeOfDay ? `, ${setting.timeOfDay}` : ''}${setting.weather ? `, ${setting.weather}` : ''}`;
  }

  /**
   * Add successful prompt for consistency (legacy)
   */
  addSuccessfulPrompt(sessionId, prompt, params, seed, imageURL, pageNumber) {
    const state = this.getOrCreateSessionState(sessionId);
    
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
    state.lastUpdated = Date.now();
    
    // Keep only last 10 prompts for memory efficiency
    if (state.promptHistory.length > 10) {
      state.promptHistory = state.promptHistory.slice(-10);
    }
    
    console.log(`📋 Stored successful prompt for page ${pageNumber} of session ${sessionId}`);
  }

  /**
   * Store image generation prompt with tier information - ENHANCED CROSS-TIER SYSTEM
   */
  storeImagePrompt(sessionId, promptData) {
    const state = this.getOrCreateSessionState(sessionId);
    
    // Initialize imagePrompts array if it doesn't exist
    if (!state.imagePrompts) {
      state.imagePrompts = [];
    }
    
    const imagePromptEntry = {
      tier: promptData.tier,
      promptText: promptData.promptText,
      negativePrompt: promptData.negativePrompt || '',
      originalPageText: promptData.originalPageText || '',
      enhancedPrompt: promptData.enhancedPrompt || '',
      pageNumber: promptData.pageNumber,
      sessionId: sessionId,
      timestamp: Date.now(),
      success: promptData.success || false,
      imageURL: promptData.imageURL || null,
      seed: promptData.seed || null,
      provider: promptData.provider || 'unknown',
      model: promptData.model || '',
      cost: promptData.cost || 0,
      generationTime: promptData.generationTime || 0,
      fallbackReason: promptData.fallbackReason || null,
      metadata: {
        culturalProfile: promptData.culturalProfile || {},
        styleFramework: promptData.styleFramework || {},
        objects: promptData.objects || [],
        secondaryCharacters: promptData.secondaryCharacters || [],
        bedroom: promptData.bedroom || false,
        ...promptData.metadata
      }
    };
    
    state.imagePrompts.push(imagePromptEntry);
    state.lastUpdated = Date.now();
    
    // Keep only last 6 prompts for memory efficiency and debug access
    if (state.imagePrompts.length > 6) {
      state.imagePrompts = state.imagePrompts.slice(-6);
    }
    
    console.log(`📸 [TIER-${promptData.tier}] Stored image prompt for page ${promptData.pageNumber} of session ${sessionId}`);
    return imagePromptEntry;
  }

  /**
   * Get recent image prompts across all tiers
   */
  getRecentImagePrompts(sessionId, limit = 6, tierFilter = null) {
    const state = this.getOrCreateSessionState(sessionId);
    let prompts = state.imagePrompts || [];
    
    // Filter by tier if specified
    if (tierFilter) {
      const tiers = Array.isArray(tierFilter) ? tierFilter : [tierFilter];
      prompts = prompts.filter(prompt => tiers.includes(prompt.tier));
    }
    
    // Sort by timestamp (newest first) and apply limit
    return prompts
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get all image prompts across all sessions (for global debugging)
   */
  getAllRecentImagePrompts(limit = 20, tierFilter = null) {
    const allPrompts = [];
    
    // Collect prompts from all sessions
    for (const [sessionId, state] of this.sessionStates.entries()) {
      if (state.imagePrompts) {
        state.imagePrompts.forEach(prompt => {
          allPrompts.push({
            ...prompt,
            sessionId
          });
        });
      }
    }
    
    // Filter by tier if specified
    let filteredPrompts = allPrompts;
    if (tierFilter) {
      const tiers = Array.isArray(tierFilter) ? tierFilter : [tierFilter];
      filteredPrompts = allPrompts.filter(prompt => tiers.includes(prompt.tier));
    }
    
    // Sort by timestamp (newest first) and apply limit
    return filteredPrompts
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get prompt history
   */
  getPromptHistory(sessionId, limit = null) {
    const state = this.getOrCreateSessionState(sessionId);
    const history = state.promptHistory || [];
    
    return limit ? history.slice(-limit) : history;
  }

  /**
   * Analyze and track visual details from text
   */
  analyzeAndTrackVisualDetails(sessionId, text, pageNumber) {
    const state = this.getOrCreateSessionState(sessionId);
    state.pageNumber = pageNumber;
    state.lastUpdated = Date.now();
    
    // Simple object detection and tracking
    const objectPatterns = [
      /\b(toy|ball|book|chair|table|bed|door|window|tree|flower)\b/gi,
      /\b(car|bike|truck|boat|plane|train)\b/gi,
      /\b(house|building|school|park|store|restaurant)\b/gi
    ];
    
    objectPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const objectKey = match.toLowerCase();
          const existing = state.objects.get(objectKey);
          
          if (existing) {
            existing.lastMention = pageNumber;
            existing.mentions.push(pageNumber);
          } else {
            state.objects.set(objectKey, {
              name: objectKey,
              firstMention: pageNumber,
              lastMention: pageNumber,
              mentions: [pageNumber],
              descriptions: []
            });
          }
        });
      }
    });
    
    console.log(`📋 Analyzed visual details for session ${sessionId}, page ${pageNumber}`);
  }

  /**
   * Get visual details for prompt generation
   */
  getVisualDetailsForPrompt(sessionId) {
    const state = this.getOrCreateSessionState(sessionId);
    
    const recentCharacters = Array.from(state.characters.values())
      .filter(char => char.lastMention >= state.pageNumber - 2)
      .map(char => ({
        name: char.characterName,
        description: char.appearance?.description || 'character',
        seed: char.seed
      }));
    
    const recentObjects = Array.from(state.objects.values())
      .filter(obj => obj.lastMention >= state.pageNumber - 2)
      .map(obj => obj.name);
    
    return {
      characters: recentCharacters,
      objects: recentObjects,
      setting: state.currentSetting
    };
  }

  /**
   * Clear session state with cache cleanup
   */
  clearSessionState(sessionId) {
    if (this.sessionStates.has(sessionId)) {
      this.sessionStates.delete(sessionId);
      console.log(`📋 Cleared session state: ${sessionId}`);
      
      // Clean up related caches
      SessionStateManager.clearSessionCache(sessionId);
      return true;
    }
    return false;
  }
  
  /**
   * Clear associated caches for session
   */
  static clearSessionCache(sessionId) {
    // Clean up AI enhancement cache
    if (globalThis.MultiStageEnhancementPipeline) {
      globalThis.MultiStageEnhancementPipeline.clearSessionCache(sessionId);
    }
    
    // Note: AdvancedPronounResolver removed - functionality replaced by RealContextCollector
    
    console.log(`🧹 Cleared caches for session ${sessionId}`);
  }

  /**
   * Context-aware clearing for different story transitions
   */
  clearBasedOnContext(sessionId, isPremium, context = 'session-end') {
    console.log(`📋 Clearing session state based on context: ${context}, isPremium: ${isPremium}`);
    
    switch (context) {
      case 'rewrite':
        if (isPremium) {
          // Premium rewrite: Clear story content but preserve avatar identity
          this.clearStoryContentOnly(sessionId);
          console.log('📋 Premium rewrite: Cleared story content, preserved avatar identity');
        } else {
          // Free rewrite: Clear everything
          this.clearSessionState(sessionId);
          console.log('📋 Free rewrite: Cleared all state');
        }
        break;
      
      case 'next-story':
        this.clearSessionState(sessionId);
        console.log('📋 Next story: Cleared all state for fresh start');
        break;
      
      case 'continue-story':
        console.log('📋 Continue story: Keeping all state for Part II');
        break;
      
      default:
        this.clearSessionState(sessionId);
        console.log('📋 Default clearing: Cleared all state');
    }
  }

  /**
   * Clear only story content while preserving avatar identity
   */
  clearStoryContentOnly(sessionId) {
    const state = this.getOrCreateSessionState(sessionId);
    
    // Preserve core avatar traits
    const preservedAvatarType = state.coreCharacterTraits.get('avatarType');
    const preservedSkinTone = state.coreCharacterTraits.get('skinTone');
    
    // Clear story-specific data
    state.characters.clear();
    state.secondaryCharacters.clear();
    state.characterAnimals.clear();
    state.objects.clear();
    state.relationships.clear();
    state.settings = [];
    state.currentSetting = null;
    state.locationHistory = [];
    state.promptHistory = [];
    state.lastSuccessfulPrompt = null;
    state.pageNumber = 1;
    
    // Restore avatar traits
    state.coreCharacterTraits.clear();
    if (preservedAvatarType) state.coreCharacterTraits.set('avatarType', preservedAvatarType);
    if (preservedSkinTone) state.coreCharacterTraits.set('skinTone', preservedSkinTone);
    
    state.lastUpdated = Date.now();
    
    console.log(`📋 Cleared story content only for session: ${sessionId}`);
  }

  /**
   * Get previous page text for context continuity
   */
  getPreviousPageText(sessionId, pageNumber) {
    const state = this.getOrCreateSessionState(sessionId);
    
    // Look for stored page text in prompt history
    const targetPage = pageNumber;
    const relevantPrompts = state.promptHistory
      .filter(p => p.pageNumber === targetPage)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    if (relevantPrompts.length > 0) {
      // If we have stored original page text in metadata
      const prompt = relevantPrompts[0];
      if (prompt.metadata && prompt.metadata.originalPageText) {
        return prompt.metadata.originalPageText;
      }
      // Fallback to prompt text if available
      if (prompt.prompt) {
        return prompt.prompt.substring(0, 200); // Return first 200 chars as context
      }
    }
    
    // Look in image prompts as alternative source
    if (state.imagePrompts) {
      const imagePrompt = state.imagePrompts
        .filter(p => p.pageNumber === targetPage)
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      
      if (imagePrompt && imagePrompt.originalPageText) {
        return imagePrompt.originalPageText;
      }
    }
    
    console.log(`📋 No previous page text found for session ${sessionId}, page ${pageNumber}`);
    return null;
  }

  /**
   * Create continuation session
   */
  createContinuationSession(originalSessionId, newSessionId) {
    const originalState = this.sessionStates.get(originalSessionId);
    if (!originalState) {
      console.log(`📋 Original session ${originalSessionId} not found for continuation`);
      return false;
    }
    
    // Create new session with preserved character data
    const newState = {
      ...originalState,
      sessionId: newSessionId,
      pageNumber: 1,
      promptHistory: [],
      lastSuccessfulPrompt: null,
      createdAt: Date.now(),
      lastUpdated: Date.now()
    };
    
    // Deep copy character data
    newState.characters = new Map(originalState.characters);
    newState.secondaryCharacters = new Map(originalState.secondaryCharacters);
    newState.characterAnimals = new Map(originalState.characterAnimals);
    newState.coreCharacterTraits = new Map(originalState.coreCharacterTraits);
    
    this.sessionStates.set(newSessionId, newState);
    
    console.log(`📋 Created continuation session: ${newSessionId} from ${originalSessionId}`);
    return true;
  }

  /**
   * Get monitoring data
   */
  getMonitoringData() {
    return {
      totalSessions: this.sessionStates.size,
      activeSessions: Array.from(this.sessionStates.keys()),
      oldestSession: this.sessionStates.size > 0 ? 
        Math.min(...Array.from(this.sessionStates.values()).map(s => s.createdAt)) : null,
      note: 'Clean session state management'
    };
  }

  /**
   * Clear all state
   */
  clearAllState() {
    this.sessionStates.clear();
    console.log('📋 Session state manager cleared');
    return { cleared: true, message: 'All session state cleared' };
  }
}

// Create global instance for cross-function access
export const globalSessionManager = new SessionStateManager();
