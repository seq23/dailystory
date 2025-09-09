/**
 * Session State Manager - Clean Architecture (TypeScript)
 * Handles session state, visual tracking, and story context
 * No globalThis dependencies, simple and reliable
 */

// TypeScript interfaces
interface SessionState {
  sessionId: string;
  isNeverEnding: boolean;
  totalPages: number | null;
  pageNumber: number;
  characters: Map<string, any>;
  secondaryCharacters: Map<string, any>;
  characterAnimals: Map<string, any>;
  objects: Map<string, any>;
  relationships: Map<string, any>;
  settings: string[];
  currentSetting: string | null;
  locationHistory: string[];
  promptHistory: any[];
  lastSuccessfulPrompt: string | null;
  aiPrompts: any[];
  previousAIScenes: any[];
  avatarType: string | null;
  skinTone: string | null;
  coreCharacterTraits: Map<string, any>;
  createdAt: number;
  lastActivity: number;
}

interface ImagePromptData {
  tier: string;
  promptText: string;
  negativePrompt?: string;
  seed?: number;
  timestamp: number;
  success: boolean;
  model?: string;
  imageURL?: string;
  metadata?: any;
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
        
        // Timestamps
        createdAt: Date.now(),
        lastActivity: Date.now()
      };
      
      this.sessionStates.set(sessionId, state);
      console.log(`📋 Created new session state: ${sessionId} (never-ending: ${isNeverEnding})`);
    }
    
    const state = this.sessionStates.get(sessionId)!;
    state.lastActivity = Date.now();
    return state;
  }

  /**
   * Add character to session state for consistency
   */
  addCharacter(sessionId: string, name: string, details: any): void {
    const state = this.getOrCreateSessionState(sessionId);
    state.characters.set(name.toLowerCase(), {
      name,
      ...details,
      firstSeen: state.pageNumber,
      lastSeen: state.pageNumber
    });
    console.log(`👤 Added character: ${name} to session ${sessionId}`);
  }

  /**
   * Add secondary character to session state
   */
  addSecondaryCharacter(sessionId: string, name: string, type: string, details: any = {}): void {
    const state = this.getOrCreateSessionState(sessionId);
    const key = `${name.toLowerCase()}_${type}`;
    state.secondaryCharacters.set(key, {
      name,
      type,
      ...details,
      firstSeen: state.pageNumber,
      lastSeen: state.pageNumber
    });
    console.log(`👥 Added secondary character: ${name} (${type}) to session ${sessionId}`);
  }

  /**
   * Add character animal to session state
   */
  addCharacterAnimal(sessionId: string, name: string, species: string, details: any = {}): void {
    const state = this.getOrCreateSessionState(sessionId);
    const key = `${name.toLowerCase()}_${species}`;
    state.characterAnimals.set(key, {
      name,
      species,
      ...details,
      firstSeen: state.pageNumber,
      lastSeen: state.pageNumber
    });
    console.log(`🐾 Added character animal: ${name} (${species}) to session ${sessionId}`);
  }

  /**
   * Add object to session state for consistency tracking
   */
  addObject(sessionId: string, objectName: string, details: any): void {
    const state = this.getOrCreateSessionState(sessionId);
    state.objects.set(objectName.toLowerCase(), {
      objectName,
      ...details,
      firstSeen: state.pageNumber,
      lastSeen: state.pageNumber
    });
    console.log(`🎯 Added object: ${objectName} to session ${sessionId}`);
  }

  /**
   * Store image prompt for debugging
   */
  storeImagePrompt(sessionId: string, promptData: ImagePromptData): void {
    const state = this.getOrCreateSessionState(sessionId);
    
    const imagePrompt = {
      ...promptData,
      pageNumber: state.pageNumber,
      timestamp: Date.now()
    };
    
    state.promptHistory.push(imagePrompt);
    
    // Keep only last 20 prompts per session
    if (state.promptHistory.length > 20) {
      state.promptHistory = state.promptHistory.slice(-20);
    }
    
    console.log(`🖼️ Stored image prompt for session ${sessionId} (tier: ${promptData.tier})`);
  }

  /**
   * Store AI prompt for debugging (comprehensive)
   */
  storeAIPromptForDebugging(sessionId: string, promptData: any): void {
    const state = this.getOrCreateSessionState(sessionId);
    
    const aiPrompt = {
      ...promptData,
      pageNumber: state.pageNumber,
      timestamp: Date.now(),
      sessionId: sessionId
    };
    
    state.aiPrompts.push(aiPrompt);
    
    // Keep only last 3 AI prompts per session
    if (state.aiPrompts.length > 3) {
      state.aiPrompts = state.aiPrompts.slice(-3);
    }
    
    console.log(`🤖 Stored AI prompt for session ${sessionId} (page: ${state.pageNumber})`);
  }

  /**
   * Get recent image prompts for debugging
   */
  getRecentImagePrompts(sessionId: string, count: number = 5, tierFilter?: string[]): any[] {
    const state = this.sessionStates.get(sessionId);
    if (!state) return [];
    
    let prompts = state.promptHistory.slice(-count);
    
    // Apply tier filtering if specified
    if (tierFilter && tierFilter.length > 0) {
      prompts = prompts.filter(prompt => tierFilter.includes(prompt.tier));
    }
    
    return prompts;
  }

  /**
   * Get recent image prompts from all sessions for global debugging
   */
  getAllRecentImagePrompts(limit: number = 20, tierFilter?: string[]): any[] {
    const allPrompts: any[] = [];
    
    // Collect prompts from all active sessions
    for (const [sessionId, state] of this.sessionStates.entries()) {
      const sessionPrompts = state.promptHistory.map(prompt => ({
        ...prompt,
        sessionId: sessionId // Ensure sessionId is included
      }));
      allPrompts.push(...sessionPrompts);
    }
    
    // Sort by timestamp (newest first)
    allPrompts.sort((a, b) => b.timestamp - a.timestamp);
    
    // Apply tier filtering if specified
    let filteredPrompts = allPrompts;
    if (tierFilter && tierFilter.length > 0) {
      filteredPrompts = allPrompts.filter(prompt => 
        tierFilter.includes(prompt.tier)
      );
    }
    
    // Apply limit
    return filteredPrompts.slice(0, limit);
  }

  /**
   * Get recent AI prompts for debugging
   */
  getRecentAIPrompts(sessionId: string): any[] {
    const state = this.sessionStates.get(sessionId);
    if (!state) return [];
    
    return state.aiPrompts;
  }

  /**
   * Get session statistics
   */
  getSessionStats(sessionId: string): any {
    const state = this.sessionStates.get(sessionId);
    if (!state) return null;
    
    return {
      sessionId: state.sessionId,
      isNeverEnding: state.isNeverEnding,
      currentPage: state.pageNumber,
      totalPages: state.totalPages,
      charactersCount: state.characters.size,
      secondaryCharactersCount: state.secondaryCharacters.size,
      animalsCount: state.characterAnimals.size,
      objectsCount: state.objects.size,
      promptHistoryCount: state.promptHistory.length,
      aiPromptsCount: state.aiPrompts.length,
      createdAt: state.createdAt,
      lastActivity: state.lastActivity,
      sessionDuration: Date.now() - state.createdAt
    };
  }

  /**
   * Clear session state
   */
  clearSession(sessionId: string): boolean {
    const deleted = this.sessionStates.delete(sessionId);
    if (deleted) {
      console.log(`🗑️ Cleared session state: ${sessionId}`);
    }
    return deleted;
  }

  /**
   * Get all active sessions (for monitoring)
   */
  getActiveSessions(): string[] {
    return Array.from(this.sessionStates.keys());
  }

  /**
   * Clean up old sessions (older than 24 hours)
   */
  cleanupOldSessions(): number {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    let cleaned = 0;
    
    for (const [sessionId, state] of this.sessionStates.entries()) {
      if (now - state.lastActivity > maxAge) {
        this.sessionStates.delete(sessionId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} old sessions`);
    }
    
    return cleaned;
  }
}

// Global instance
export const globalSessionManager = new SessionStateManager();
