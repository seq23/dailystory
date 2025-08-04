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
   * Enhanced for 40+ template pools
   */
  static getNextTemplate(
    templatePool: string[],
    difficulty: DifficultyLevel
  ): { template: string; isRepeating: boolean; templateIndex: number } {
    let state = this.getSessionState();
    
    // Initialize or reset if needed
    if (!state || state.currentShuffle.length === 0 || state.currentShuffle.length !== templatePool.length) {
      console.log(`🔄 SessionTemplateManager: Initializing with ${templatePool.length} templates`);
      state = {
        usedTemplates: new Set(),
        currentShuffle: this.shuffleArray(templatePool),
        shuffleIndex: 0,
        sessionStartTime: Date.now()
      };
    }

    // Check if we've exhausted current shuffle
    if (state.shuffleIndex >= state.currentShuffle.length) {
      console.log(`🔄 SessionTemplateManager: Completed cycle of ${state.currentShuffle.length} templates, reshuffling...`);
      
      // Create category-aware reshuffle to prevent similar themes back-to-back
      const lastTemplate = state.currentShuffle[state.currentShuffle.length - 1];
      let newShuffle = this.shuffleArray(templatePool);
      
      // If the last template from previous cycle is similar to first in new cycle, reshuffle
      let attempts = 0;
      while (attempts < 5 && this.areTemplatesSimilar(lastTemplate, newShuffle[0])) {
        newShuffle = this.shuffleArray(templatePool);
        attempts++;
      }
      
      state.currentShuffle = newShuffle;
      state.shuffleIndex = 0;
      
      // Mark that we're now repeating
      const isRepeating = state.usedTemplates.size > 0;
      
      // Clear used templates for fresh tracking in new cycle
      state.usedTemplates.clear();
      
      this.saveSessionState(state);
      
      const templateIndex = templatePool.indexOf(state.currentShuffle[0]);
      
      console.log(`✅ SessionTemplateManager: Starting new cycle with template ${templateIndex + 1}/${templatePool.length}`);
      
      return {
        template: state.currentShuffle[0],
        isRepeating,
        templateIndex
      };
    }

    // Get next template from current shuffle
    const template = state.currentShuffle[state.shuffleIndex];
    const isRepeating = state.usedTemplates.has(template);
    const templateIndex = templatePool.indexOf(template);
    
    // Update state
    state.usedTemplates.add(template);
    state.shuffleIndex++;
    
    this.saveSessionState(state);
    
    console.log(`📖 SessionTemplateManager: Selected template ${templateIndex + 1}/${templatePool.length} (${state.shuffleIndex}/${state.currentShuffle.length} in cycle)`);
    
    return { template, isRepeating, templateIndex };
  }

  /**
   * Check if two templates have similar themes to avoid repetitive content
   */
  private static areTemplatesSimilar(template1: string, template2: string): boolean {
    if (!template1 || !template2) return false;
    
    // Extract first few words to identify theme
    const getTheme = (template: string) => {
      const sentences = template.split('.');
      if (sentences.length === 0) return '';
      const firstSentence = sentences[0].toLowerCase();
      const words = firstSentence.split(' ');
      return words.slice(0, 3).join(' '); // First 3 words indicate theme
    };
    
    const theme1 = getTheme(template1);
    const theme2 = getTheme(template2);
    
    // Check for similar starting patterns
    const similarPatterns = [
      ['i see', 'i look'],
      ['i play', 'i have'],
      ['we go', 'we see'],
      ['mom and', 'dad and'],
      ['the cat', 'the dog', 'the bird']
    ];
    
    for (const patterns of similarPatterns) {
      if (patterns.some(p => theme1.includes(p)) && patterns.some(p => theme2.includes(p))) {
        return true;
      }
    }
    
    return false;
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