/**
 * Session State Manager - Clean Architecture
 * Handles session state, visual tracking, and story context
 * No globalThis dependencies, simple and reliable
 */

import type { UserInfo, SessionId } from './types/index.ts';
import { getAvatar } from './types/index.ts';

export interface SessionState {
  sessionId: string;
  isNeverEnding: boolean;
  totalPages: number | null;
  pageNumber: number;
  
  // Visual tracking
  characters: Map<string, any>;
  secondaryCharacters: Map<string, any>;
  characterAnimals: Map<string, any>;
  objects: Map<string, any>;
  relationships: Map<string, any>;
  
  // Setting tracking
  settings: any[];
  currentSetting: any;
  locationHistory: any[];
  
  // Prompt tracking
  promptHistory: any[];
  lastSuccessfulPrompt: any;
  
  // AI Debug tracking - stores full AI prompts (last 3 only)
  aiPrompts: any[];
  
  // Previous AI Scene tracking for visual consistency
  previousAIScenes: any[];
  
  // Avatar tracking
  avatarType: string | null;
  skinTone: string | null;
  coreCharacterTraits: Map<string, any>;
  
  createdAt: number;
  lastUpdated: number;
}

export class SessionStateManager {
  private sessionStates: Map<string, SessionState>;

  constructor() {
    this.sessionStates = new Map();
    console.log('📋 SessionStateManager initialized with clean architecture');
  }

  /**
   * Get or create session state
   */
  getOrCreateSessionState(sessionId: string, isNeverEnding: boolean = false, totalPages: number | null = null): SessionState {
    if (!this.sessionStates.has(sessionId)) {
      const state: SessionState = {
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
        
        // Previous AI Scene tracking for visual consistency
        previousAIScenes: [],
        
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
    
    return this.sessionStates.get(sessionId)!;
  }

  /**
   * Initialize session with avatar data from userInfo
   */
  initializeSessionWithAvatarData(sessionId: string, userInfo: UserInfo, isNeverEnding: boolean = false, totalPages: number | null = null): SessionState {
    const avatar = getAvatar(userInfo);
    console.log('🎭 Initializing session with avatar data:', {
      sessionId,
      avatarType: avatar?.type,
      skinTone: avatar?.skinTone
    });

    const state = this.getOrCreateSessionState(sessionId, isNeverEnding, totalPages);
    
    // Set avatar data from userInfo
    if (avatar) {
      state.avatarType = avatar.type || null;
      state.skinTone = avatar.skinTone || null;
      
      // Initialize core character traits
      state.coreCharacterTraits.set('avatarType', avatar.type || '');
      state.coreCharacterTraits.set('skinTone', avatar.skinTone || '');
      
      state.lastUpdated = Date.now();
      
      console.log(`📋 Session ${sessionId} initialized with avatar data: ${avatar.type}/${avatar.skinTone}`);
    } else {
      console.log(`⚠️ Session ${sessionId} initialized without avatar data`);
    }
    
    return state;
  }

  /**
   * Update character with seed and appearance
   */
  updateCharacterWithSeed(sessionId: string, characterName: string, seed: string, appearance: any): any {
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
    if (characterName === 'child' || characterName === (state as any).mainCharacterName) {
      state.coreCharacterTraits.set('avatarType', appearance.avatarType || state.avatarType);
      state.coreCharacterTraits.set('skinTone', appearance.skinTone || state.skinTone);
    }
    
    console.log(`📋 Updated character ${characterName} with seed ${seed} for session ${sessionId}`);
    return updatedCharacter;
  }

  /**
   * Get character seed for consistency
   */
  getCharacterSeed(sessionId: string, characterName: string): string | null {
    const state = this.getOrCreateSessionState(sessionId);
    const character = state.characters.get(characterName);
    return character ? character.seed : null;
  }

  /**
   * Update secondary character
   */
  updateSecondaryCharacter(sessionId: string, characterName: string, type: string, relationship: string, hasDialogue: boolean, pageNumber: number): void {
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
  updateCharacterAnimal(sessionId: string, animalName: string, species: string, hasDialogue: boolean, pageNumber: number): void {
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
  getSecondaryCharacters(sessionId: string, pageNumber: number | null = null): any[] {
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
  getCharacterAnimals(sessionId: string, pageNumber: number | null = null): any[] {
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
  updateSetting(sessionId: string, newSetting: any): void {
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
  getSettingForPrompt(sessionId: string): string {
    const state = this.getOrCreateSessionState(sessionId);
    if (!state.currentSetting) return '';
    
    const setting = state.currentSetting;
    return `${setting.location || 'outdoor setting'}${setting.timeOfDay ? `, ${setting.timeOfDay}` : ''}${setting.weather ? `, ${setting.weather}` : ''}`;
  }

  /**
   * Add successful prompt for consistency (legacy)
   */
  addSuccessfulPrompt(sessionId: string, prompt: string, params: any, seed: string, imageURL: string, pageNumber: number): void {
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
  async storeAIPromptForDebugging(sessionId: string, aiPromptData: any): Promise<void> {
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
      try {
        // First, get the IDs of the 10 most recent entries for this session
        const { data: keepEntries, error: fetchError } = await supabase
          .from('ai_prompt_debug_log')
          .select('id')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!fetchError && keepEntries && keepEntries.length > 0) {
          // Delete entries not in the keep list
          const keepIds = keepEntries.map(entry => entry.id);
          const { error: cleanupError } = await supabase
            .from('ai_prompt_debug_log')
            .delete()
            .eq('session_id', sessionId)
            .not('id', 'in', keepIds);

          if (cleanupError) {
            console.warn('⚠️ Failed to cleanup old AI debug entries:', cleanupError);
          } else {
            console.log(`🧹 Cleaned up old AI debug entries for session ${sessionId}, keeping ${keepIds.length} recent entries`);
          }
        }
      } catch (cleanupError) {
        console.warn('⚠️ Failed to cleanup old AI debug entries:', cleanupError);
      }

    } catch (dbError: any) {
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
  getAIPrompts(sessionId: string, limit: number | null = null): any[] {
    const state = this.getOrCreateSessionState(sessionId);
    const prompts = state.aiPrompts || [];
    
    if (limit && limit > 0) {
      return prompts.slice(-limit);
    }
    
    return prompts;
  }

  extractCulturalDebugInfo(aiPromptData: any): any {
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
        const match = content.match(/DETECTED REGION:\\s*([^\n]+)/);
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
  storeImagePrompt(sessionId: string, promptData: any): void {
    const state = this.getOrCreateSessionState(sessionId);
    
    // Initialize imagePrompts array if it doesn't exist
    if (!(state as any).imagePrompts) {
      (state as any).imagePrompts = [];
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
    
    (state as any).imagePrompts.push(imagePromptEntry);
    state.lastUpdated = Date.now();
    
    // Keep only last 20 image prompts
    if ((state as any).imagePrompts.length > 20) {
      (state as any).imagePrompts = (state as any).imagePrompts.slice(-20);
    }
    
    console.log(`📋 Stored image prompt for page ${promptData.pageNumber} of session ${sessionId}: ${promptData.tier}`);
  }

  /**
   * Get monitoring data
   */
  getMonitoringData(): any {
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
  clearAllState(): any {
    this.sessionStates.clear();
    console.log('📋 Session state manager cleared');
    return { cleared: true, message: 'All session state cleared' };
  }

  /**
   * Get all recent image prompts across sessions (for monitoring/debugging)
   */
  getAllRecentImagePrompts(limit: number = 50, tierFilter?: string): any[] {
    const allPrompts: any[] = [];
    
    for (const state of this.sessionStates.values()) {
      if ((state as any).imagePrompts) {
        allPrompts.push(...(state as any).imagePrompts);
      }
    }
    
    // Sort by timestamp (most recent first)
    allPrompts.sort((a, b) => b.timestamp - a.timestamp);
    
    // Apply tier filter if specified
    let filteredPrompts = allPrompts;
    if (tierFilter) {
      filteredPrompts = allPrompts.filter(prompt => prompt.tier === tierFilter);
    }
    
    return filteredPrompts.slice(0, limit);
  }

  /**
   * Get recent image prompts for a specific session
   */
  getRecentImagePrompts(sessionId: string, limit: number = 10, tierFilter?: string): any[] {
    const state = this.getOrCreateSessionState(sessionId);
    const prompts = (state as any).imagePrompts || [];
    
    // Apply tier filter if specified
    let filteredPrompts = prompts;
    if (tierFilter) {
      filteredPrompts = prompts.filter((prompt: any) => prompt.tier === tierFilter);
    }
    
    // Sort by timestamp (most recent first) and apply limit
    return filteredPrompts
      .sort((a: any, b: any) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get previous page text for visual consistency
   */
  getPreviousPageText(sessionId: string, pageNumber: number): string | null {
    const state = this.getOrCreateSessionState(sessionId);
    
    if ((state as any).imagePrompts && (state as any).imagePrompts.length > 0) {
      // Find the most recent image prompt before the current page
      const imagePrompt = (state as any).imagePrompts
        .filter((prompt: any) => prompt.pageNumber < pageNumber)
        .sort((a: any, b: any) => b.timestamp - a.timestamp)[0];
      
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
  createContinuationSession(originalSessionId: string, newSessionId: string): boolean {
    const originalState = this.sessionStates.get(originalSessionId);
    if (!originalState) {
      console.log(`📋 Original session ${originalSessionId} not found for continuation`);
      return false;
    }
    
    // Create new session with preserved character data
    const newState: SessionState = {
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
}

// Create global instance for cross-function access
export const globalSessionManager = new SessionStateManager();
