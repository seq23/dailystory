// Session-based template management for anti-repetition
import type { DifficultyLevel } from "@/types";

interface SessionTemplateState {
  usedTemplates: Set<string>;
  currentShuffle: string[];
  shuffleIndex: number;
  sessionStartTime: number;
}

// Session storage key
const SESSION_KEY = 'time2read_template_session';

export class SessionTemplateManager {
  private static getSessionState(): SessionTemplateState | null {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      return {
        usedTemplates: new Set(parsed.usedTemplates || []),
        currentShuffle: parsed.currentShuffle || [],
        shuffleIndex: parsed.shuffleIndex || 0,
        sessionStartTime: parsed.sessionStartTime || Date.now()
      };
    } catch {
      return null;
    }
  }

  private static saveSessionState(state: SessionTemplateState): void {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        usedTemplates: Array.from(state.usedTemplates),
        currentShuffle: state.currentShuffle,
        shuffleIndex: state.shuffleIndex,
        sessionStartTime: state.sessionStartTime
      }));
    } catch {
      // Session storage failed, continue without persistence
    }
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get next template from the intelligent rotation system
   */
  static getNextTemplate(
    templatePool: string[],
    difficulty: DifficultyLevel
  ): { template: string; isRepeating: boolean } {
    let state = this.getSessionState();
    
    // Initialize or reset if needed
    if (!state || state.currentShuffle.length === 0) {
      state = {
        usedTemplates: new Set(),
        currentShuffle: this.shuffleArray(templatePool),
        shuffleIndex: 0,
        sessionStartTime: Date.now()
      };
    }

    // Check if we've exhausted current shuffle
    if (state.shuffleIndex >= state.currentShuffle.length) {
      // Reshuffle for next cycle
      state.currentShuffle = this.shuffleArray(templatePool);
      state.shuffleIndex = 0;
      
      // Mark that we're now repeating
      const isRepeating = state.usedTemplates.size > 0;
      
      // Clear used templates for fresh tracking in new cycle
      state.usedTemplates.clear();
      
      this.saveSessionState(state);
      
      return {
        template: state.currentShuffle[0],
        isRepeating
      };
    }

    // Get next template from current shuffle
    const template = state.currentShuffle[state.shuffleIndex];
    const isRepeating = state.usedTemplates.has(template);
    
    // Update state
    state.usedTemplates.add(template);
    state.shuffleIndex++;
    
    this.saveSessionState(state);
    
    return { template, isRepeating };
  }

  /**
   * Clear session state (called when session ends)
   */
  static clearSession(): void {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Session storage not available
    }
  }

  /**
   * Get session statistics
   */
  static getSessionStats(): {
    templatesUsed: number;
    isRepeating: boolean;
    sessionAge: number;
  } {
    const state = this.getSessionState();
    
    if (!state) {
      return {
        templatesUsed: 0,
        isRepeating: false,
        sessionAge: 0
      };
    }

    return {
      templatesUsed: state.usedTemplates.size,
      isRepeating: state.usedTemplates.size > 0 && state.shuffleIndex >= state.currentShuffle.length,
      sessionAge: Date.now() - state.sessionStartTime
    };
  }
}