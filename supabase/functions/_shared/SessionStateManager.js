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
        
        // AI Debug tracking - stores full AI prompts (last 3 only)
        aiPrompts: [],
        
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
   * Initialize session with avatar data from userInfo
   */
  initializeSessionWithAvatarData(sessionId, userInfo, isNeverEnding = false, totalPages = null) {
    console.log('🎭 Initializing session with avatar data:', {
      sessionId,
      avatarType: userInfo?.avatar?.type,
      skinTone: userInfo?.avatar?.skinTone
    });

    const state = this.getOrCreateSessionState(sessionId, isNeverEnding, totalPages);
    
    // Set avatar data from userInfo
    if (userInfo?.avatar) {
      state.avatarType = userInfo.avatar.type;
      state.skinTone = userInfo.avatar.skinTone;
      
      // Initialize core character traits
      state.coreCharacterTraits.set('avatarType', userInfo.avatar.type);
      state.coreCharacterTraits.set('skinTone', userInfo.avatar.skinTone);
      
      state.lastUpdated = Date.now();
      
      console.log(`📋 Session ${sessionId} initialized with avatar data: ${userInfo.avatar.type}/${userInfo.avatar.skinTone}`);
    } else {
      console.log(`⚠️ Session ${sessionId} initialized without avatar data`);
    }
    
    return state;
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
      characterDescription: appearance?.characterDescription || existing?.characterDescription,
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
   * Store AI prompt for debugging - stores EVERYTHING sent to AI including the original bundle
   * Now persists to database for permanent storage
   */
  async storeAIPromptForDebugging(sessionId, aiPromptData) {
    const state = this.getOrCreateSessionState(sessionId);
    
    // Initialize aiPrompts array if it doesn't exist
    if (!state.aiPrompts) {
      state.aiPrompts = [];
    }
    
    console.log(`🔍 [AI-DEBUG] Storing AI prompt data for session ${sessionId}:`, {
      systemTokens: aiPromptData.systemPrompt?.length || 0,
      userTokens: aiPromptData.userPrompt?.length || 0,
      model: aiPromptData.model,
      pageNumber: aiPromptData.pageNumber,
      attempt: aiPromptData.attempt,
      success: aiPromptData.success
    });

    // Enhanced cultural data extraction
    const culturalInfo = this.extractCulturalDebugInfo(aiPromptData);
    
    const debugEntry = {
      model: aiPromptData.model,
      tokenLimit: aiPromptData.tokenLimit,
      systemPrompt: aiPromptData.systemPrompt,
      userPrompt: aiPromptData.userPrompt,
      pageNumber: aiPromptData.pageNumber || state.pageNumber,
      attempt: aiPromptData.attempt,
      timestamp: Date.now(),
      apiResponse: aiPromptData.apiResponse,
      success: aiPromptData.success,
      sessionId: sessionId,
      culturalGuidance: culturalInfo.guidance || 'None detected',
      detectedRegion: culturalInfo.region || 'Not specified',
      functionsAvailable: culturalInfo.functionsAvailable || false,
      // Store the original bundle data
      bundle: aiPromptData.bundle || null
    };
    
    // Add to in-memory array and keep only last 3
    state.aiPrompts.push(debugEntry);
    if (state.aiPrompts.length > 3) {
      state.aiPrompts.shift();
    }
    
    state.lastUpdated = Date.now();
    
    // NEW: Persist to database
    try {
      // First check environment variables
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error(`Missing environment variables: SUPABASE_URL=${!!supabaseUrl}, SUPABASE_SERVICE_ROLE_KEY=${!!supabaseServiceKey}`);
      }
      
      console.log(`🔧 [AI-DEBUG] Database insertion starting for session ${sessionId}:`, {
        hasBundle: !!aiPromptData.bundle,
        bundleKeys: aiPromptData.bundle ? Object.keys(aiPromptData.bundle) : [],
        systemPromptLength: aiPromptData.systemPrompt?.length || 0,
        userPromptLength: aiPromptData.userPrompt?.length || 0
      });

      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.55.0');
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Extract user_id from bundle if available
      let userId = null;
      if (aiPromptData.bundle?.userInfo?.id) {
        userId = aiPromptData.bundle.userInfo.id;
      }

      const insertData = {
        session_id: sessionId,
        user_id: userId,
        system_prompt: aiPromptData.systemPrompt || '',
        user_prompt: aiPromptData.userPrompt || '',
        bundle_data: aiPromptData.bundle || {},
        api_response: aiPromptData.apiResponse || {},
        model: aiPromptData.model || 'gpt-4o-mini',
        token_limit: aiPromptData.tokenLimit || 4000,
        page_number: aiPromptData.pageNumber || 1,
        attempt: aiPromptData.attempt || 1,
        success: aiPromptData.success || false
      };

      console.log(`🔧 [AI-DEBUG] Inserting data:`, {
        session_id: insertData.session_id,
        user_id: insertData.user_id,
        model: insertData.model,
        page_number: insertData.page_number,
        success: insertData.success
      });

      const { data: insertResult, error: insertError } = await supabase
        .from('ai_prompt_debug_log')
        .insert(insertData)
        .select('id');

      if (insertError) {
        // Use throw instead of console.error to make it visible in edge function logs
        throw new Error(`Database insertion failed: ${JSON.stringify(insertError, null, 2)}`);
      } else {
        console.log(`✅ [AI-DEBUG] Successfully persisted to database for session ${sessionId}, record ID: ${insertResult?.[0]?.id}`);
      }

      // Clean up old entries (keep only last 10 per session)
      const { error: cleanupError } = await supabase
        .from('ai_prompt_debug_log')
        .delete()
        .not('id', 'in', 
          `(SELECT id FROM ai_prompt_debug_log WHERE session_id = '${sessionId}' ORDER BY created_at DESC LIMIT 10)`
        )
        .eq('session_id', sessionId);

      if (cleanupError) {
        console.warn('⚠️ Failed to cleanup old AI debug entries:', cleanupError);
      }

    } catch (dbError) {
      // Use throw to make database errors visible in edge function logs
      console.error('❌ [AI-DEBUG] Database operation failed:', dbError.message || dbError);
      throw new Error(`AI Debug database storage failed: ${dbError.message || dbError}`);
    }
    
    console.log(`🔍 [AI-DEBUG] Stored complete AI prompt for session ${sessionId}, attempt ${aiPromptData.attempt}:`, {
      systemPromptLength: aiPromptData.systemPrompt?.length || 0,
      userPromptLength: aiPromptData.userPrompt?.length || 0,
      totalInMemoryEntries: state.aiPrompts.length
    });
  }

  /**
   * Get AI prompts for debugging
   */
  getAIPrompts(sessionId, limit = null) {
    const state = this.getOrCreateSessionState(sessionId);
    const prompts = state.aiPrompts || [];
    
    if (limit && limit > 0) {
      return prompts.slice(-limit);
    }
    
    return prompts;
  }

  extractCulturalDebugInfo(aiPromptData) {
    const systemPrompt = aiPromptData.systemPrompt || '';
    const userPrompt = aiPromptData.userPrompt || '';
    const messages = aiPromptData.messages || [];
    
    // Extract cultural guidance from system prompt
    const hasCulturalGuidance = systemPrompt.includes('CULTURAL INTEGRATION:');
    
    // Extract detected region from messages
    let detectedRegion = 'Not detected';
    for (const message of messages) {
      const content = message.content || '';
      if (content.includes('DETECTED REGION:')) {
        const match = content.match(/DETECTED REGION:\s*([^\n]+)/);
        if (match) detectedRegion = match[1].trim();
      }
    }
    
    // Check for function availability
    const functionsAvailable = systemPrompt.includes('getCulturalContext');
    
    return {
      guidance: hasCulturalGuidance ? 'Cultural integration guidelines active' : 'No cultural guidance',
      region: detectedRegion,
      functionsAvailable
    };
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
        description: char.appearance?.description || char.characterDescription || 'character',
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
