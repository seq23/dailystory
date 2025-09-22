// Story Visual State Manager - Frontend Session Management Only
// Simplified to handle only session tracking and cleanup
// Complex visual processing is now handled in backend

import type { UserInfo } from '@/types';
import { DebugLogger } from './DebugLogger';

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
      DebugLogger.log('story', `Created new frontend session state: ${sessionId}`, { sessionType, isPersistent });
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
    DebugLogger.log('story', 'Cleared frontend session state', { sessionId });
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
          DebugLogger.log('story', 'Free user "Next Story": Cleared session state for fresh start');
        } else {
          DebugLogger.log('story', 'Premium user "Next Story": Keeping session state for continuity');
        }
        break;
        
      case 'rewrite':
        // Both free and premium: Always clear for rewrites
        this.clearStoryState(sessionId);
        DebugLogger.log('story', 'Story rewrite: Cleared session state for fresh start');
        break;
        
      case 'end-session':
      case 'new-session':
        // Both free and premium: Always clear when ending/starting sessions
        this.clearStoryState(sessionId);
        DebugLogger.log('story', 'Session ended: Cleared session state');
        break;
        
      default:
        DebugLogger.warn('story', `Unknown context for session clearing: ${context}`);
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
      DebugLogger.warn('story', 'Cannot create continuation: Original session not found', { originalSessionId });
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
    DebugLogger.log('story', 'Created continuation session', { newSessionId, originalSessionId });
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
    DebugLogger.log('story', 'Character update delegated to backend', { characterName, seed });
    // Backend handles character consistency via API calls
  }

  static getCharacterSeed(sessionId: string, characterName: string): number | undefined {
    DebugLogger.log('story', 'Character seed request delegated to backend', { characterName });
    return undefined; // Backend handles via API
  }

  static addSuccessfulPrompt(sessionId: string, characterName: string, prompt: string): void {
    DebugLogger.log('story', 'Prompt tracking delegated to backend', { characterName });
    // Backend handles prompt history
  }

  static updateSetting(
    sessionId: string, 
    pageNumber: number,
    newSetting: any
  ): boolean {
    DebugLogger.log('story', 'Setting update delegated to backend', { pageNumber });
    return true; // Backend handles settings
  }

  static updateLocation(sessionId: string, newLocation: string): boolean {
    DebugLogger.log('story', 'Location update delegated to backend', { newLocation });
    return true; // Backend handles location consistency
  }

  static resolvePronouns(sessionId: string, text: string): string {
    DebugLogger.log('story', 'Pronoun resolution delegated to backend');
    return text; // Backend handles pronoun resolution
  }

  static analyzeTextForDetails(sessionId: string, text: string, pageNumber: number): any[] {
    DebugLogger.log('story', 'Visual detail analysis delegated to backend', { pageNumber });
    return []; // Backend handles visual details
  }

  static injectConsistentDetails(sessionId: string, text: string, pageNumber: number): string {
    DebugLogger.log('story', 'Detail injection delegated to backend', { pageNumber });
    return text; // Backend handles detail consistency
  }

  static getVisualDetailsForPrompt(sessionId: string, pageNumber?: number): string {
    DebugLogger.log('story', 'Visual details for prompt delegated to backend');
    return ''; // Backend handles prompt enhancement
  }

  static getSettingForPrompt(sessionId: string): string {
    DebugLogger.log('story', 'Setting for prompt delegated to backend');
    return ''; // Backend handles setting consistency
  }
}
