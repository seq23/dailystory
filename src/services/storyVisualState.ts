// Story Visual State Manager - Frontend Session Management Only
// Simplified to handle only session tracking and cleanup
// Complex visual processing is now handled in backend

import type { UserInfo } from '@/types';

export interface StoryVisualState {
  sessionId: string;
  sessionType: 'new' | 'continuation' | 'rewrite';
  isPersistent: boolean;
  isNeverEnding?: boolean;
  currentPage: number;
  totalPages: number | null;
}

/**
 * Simplified StoryVisualStateManager for frontend session management only
 * All complex visual processing, pronoun resolution, and consistency tracking
 * has been moved to backend services for single source of truth
 */
export class StoryVisualStateManager {
  private static storyStates: Map<string, StoryVisualState> = new Map();

  /**
   * Create or retrieve story state - now only handles basic session tracking
   */
  static getOrCreateStoryState(
    sessionId: string, 
    totalPages: number | null = 10,
    sessionType: 'new' | 'continuation' | 'rewrite' = 'new',
    isPersistent: boolean = false,
    isNeverEnding: boolean = false
  ): StoryVisualState {
    if (!this.storyStates.has(sessionId)) {
      const newState: StoryVisualState = {
        sessionId,
        sessionType,
        isPersistent,
        currentPage: 1,
        totalPages: isNeverEnding ? null : totalPages,
        isNeverEnding
      };
      
      this.storyStates.set(sessionId, newState);
      console.log(`📚 Created new frontend session state: ${sessionId} (type: ${sessionType}, persistent: ${isPersistent})`);
    }
    
    return this.storyStates.get(sessionId)!;
  }

  /**
   * Update page progress for session tracking
   */
  static updatePageProgress(sessionId: string, pageNumber: number): void {
    const state = this.storyStates.get(sessionId);
    if (state) {
      state.currentPage = pageNumber;
    }
  }

  /**
   * Get current visual state for session
   */
  static getVisualState(sessionId: string): StoryVisualState | undefined {
    return this.storyStates.get(sessionId);
  }

  /**
   * Clear story state for session cleanup
   */
  static clearStoryState(sessionId: string): void {
    this.storyStates.delete(sessionId);
    console.log(`🗑️ Cleared frontend session state: ${sessionId}`);
  }

  /**
   * Clear session state based on user type and context
   * Essential for premium/free user session management
   */
  static clearBasedOnContext(
    sessionId: string, 
    isPremium: boolean, 
    context: 'next-story' | 'rewrite' | 'end-session' | 'new-session'
  ): void {
    const state = this.storyStates.get(sessionId);
    
    switch (context) {
      case 'next-story':
        // Free users: Always clear session state
        // Premium users: Keep session state for character consistency
        if (!isPremium) {
          this.clearStoryState(sessionId);
          console.log(`🆓 Free user "Next Story": Cleared session state for fresh start`);
        } else {
          console.log(`💎 Premium user "Next Story": Keeping session state for continuity`);
        }
        break;
        
      case 'rewrite':
        // Both free and premium: Always clear for rewrites
        this.clearStoryState(sessionId);
        console.log(`🔄 Story rewrite: Cleared session state for fresh start`);
        break;
        
      case 'end-session':
      case 'new-session':
        // Both free and premium: Always clear when ending/starting sessions
        this.clearStoryState(sessionId);
        console.log(`🏁 Session ended: Cleared session state`);
        break;
        
      default:
        console.warn(`Unknown context for session clearing: ${context}`);
    }
  }

  /**
   * Create a continuation session that preserves basic session info
   */
  static createContinuationSession(
    originalSessionId: string, 
    newSessionId: string
  ): boolean {
    const originalState = this.storyStates.get(originalSessionId);
    if (!originalState) {
      console.warn(`Cannot create continuation: Original session ${originalSessionId} not found`);
      return false;
    }

    // Create minimal continuation state for frontend session tracking
    const continuationState: StoryVisualState = {
      sessionId: newSessionId,
      sessionType: 'continuation',
      isPersistent: true,
      currentPage: 1,
      totalPages: 10,
      isNeverEnding: originalState.isNeverEnding
    };

    this.storyStates.set(newSessionId, continuationState);
    console.log(`🔗 Created continuation session ${newSessionId} from ${originalSessionId}`);
    return true;
  }

  /**
   * Legacy compatibility methods - now no-ops with backend delegation
   * These are kept to prevent breaking existing code during transition
   */
  
  static updateCharacterWithSeed(
    sessionId: string, 
    characterName: string, 
    description: string, 
    seed?: number,
    pageNumber: number = 1
  ): void {
    console.log(`📝 Character update delegated to backend: ${characterName} (seed: ${seed})`);
    // Backend handles character consistency via API calls
  }

  static getCharacterSeed(sessionId: string, characterName: string): number | undefined {
    console.log(`📝 Character seed request delegated to backend: ${characterName}`);
    return undefined; // Backend handles via API
  }

  static addSuccessfulPrompt(sessionId: string, characterName: string, prompt: string): void {
    console.log(`📝 Prompt tracking delegated to backend: ${characterName}`);
    // Backend handles prompt history
  }

  static updateSetting(
    sessionId: string, 
    pageNumber: number,
    newSetting: any
  ): boolean {
    console.log(`🎨 Setting update delegated to backend for page ${pageNumber}`);
    return true; // Backend handles settings
  }

  static updateLocation(sessionId: string, newLocation: string): boolean {
    console.log(`📍 Location update delegated to backend: ${newLocation}`);
    return true; // Backend handles location consistency
  }

  static resolvePronouns(sessionId: string, text: string): string {
    console.log(`🔄 Pronoun resolution delegated to backend`);
    return text; // Backend handles pronoun resolution
  }

  static analyzeTextForDetails(sessionId: string, text: string, pageNumber: number): any[] {
    console.log(`🔍 Visual detail analysis delegated to backend for page ${pageNumber}`);
    return []; // Backend handles visual details
  }

  static injectConsistentDetails(sessionId: string, text: string, pageNumber: number): string {
    console.log(`🎯 Detail injection delegated to backend for page ${pageNumber}`);
    return text; // Backend handles detail consistency
  }

  static getVisualDetailsForPrompt(sessionId: string, pageNumber?: number): string {
    console.log(`📋 Visual details for prompt delegated to backend`);
    return ''; // Backend handles prompt enhancement
  }

  static getSettingForPrompt(sessionId: string): string {
    console.log(`🎨 Setting for prompt delegated to backend`);
    return ''; // Backend handles setting consistency
  }
}
