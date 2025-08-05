// Hierarchical Session-based Template Management
// Enforces strict hierarchy: Base Templates → Extension Templates → Fallback Content
import type { DifficultyLevel } from "@/types";
import { getTemplateCountByGradeLevel, getTemplateByGradeLevel } from "@/constants/gradeBased/unifiedTemplateSystem";
import { difficultyToGradeLevel } from "@/constants/gradeBased";
import { getLevel0Extension, getLevel0ExtensionCount } from "@/constants/gradeBased/level0ExtensionTemplates";

interface HierarchicalTemplateState {
  baseTemplatesUsed: Set<string>;
  extensionTemplatesUsed: Set<string>;
  fallbacksUsed: Set<string>;
  currentBaseShuffle: string[];
  currentExtensionShuffle: string[];
  baseShuffleIndex: number;
  extensionShuffleIndex: number;
  currentPhase: 'base' | 'extension' | 'fallback';
  sessionStartTime: number;
}

interface TemplateSelection {
  template: string | string[];
  templateIndex: number;
  phase: 'base' | 'extension' | 'fallback';
  isRepeating: boolean;
}

// Session storage key
const HIERARCHICAL_SESSION_KEY = 'time2read_hierarchical_template_session';

export class HierarchicalSessionTemplateManager {
  private static getSessionState(): HierarchicalTemplateState | null {
    try {
      const stored = sessionStorage.getItem(HIERARCHICAL_SESSION_KEY);
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      return {
        baseTemplatesUsed: new Set(parsed.baseTemplatesUsed || []),
        extensionTemplatesUsed: new Set(parsed.extensionTemplatesUsed || []),
        fallbacksUsed: new Set(parsed.fallbacksUsed || []),
        currentBaseShuffle: parsed.currentBaseShuffle || [],
        currentExtensionShuffle: parsed.currentExtensionShuffle || [],
        baseShuffleIndex: parsed.baseShuffleIndex || 0,
        extensionShuffleIndex: parsed.extensionShuffleIndex || 0,
        currentPhase: parsed.currentPhase || 'base',
        sessionStartTime: parsed.sessionStartTime || Date.now()
      };
    } catch {
      return null;
    }
  }

  private static saveSessionState(state: HierarchicalTemplateState): void {
    try {
      sessionStorage.setItem(HIERARCHICAL_SESSION_KEY, JSON.stringify({
        baseTemplatesUsed: Array.from(state.baseTemplatesUsed),
        extensionTemplatesUsed: Array.from(state.extensionTemplatesUsed),
        fallbacksUsed: Array.from(state.fallbacksUsed),
        currentBaseShuffle: state.currentBaseShuffle,
        currentExtensionShuffle: state.currentExtensionShuffle,
        baseShuffleIndex: state.baseShuffleIndex,
        extensionShuffleIndex: state.extensionShuffleIndex,
        currentPhase: state.currentPhase,
        sessionStartTime: state.sessionStartTime
      }));
    } catch {
      // Session storage failed, continue without persistence
    }
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get next template following strict hierarchy:
   * 1. Base templates (highest priority)
   * 2. Extension templates (medium priority)
   * 3. Fallback content (lowest priority)
   */
  static getNextTemplate(
    difficulty: DifficultyLevel,
    isPremium: boolean = false
  ): TemplateSelection {
    const gradeLevel = difficultyToGradeLevel(difficulty);
    let state = this.getSessionState();
    
    // Initialize state if needed
    if (!state) {
      const baseTemplateCount = getTemplateCountByGradeLevel(gradeLevel, false); // Base templates are always free
      const baseTemplateKeys = Array.from({ length: baseTemplateCount }, (_, i) => `base_${i}`);
      
      state = {
        baseTemplatesUsed: new Set(),
        extensionTemplatesUsed: new Set(),
        fallbacksUsed: new Set(),
        currentBaseShuffle: this.shuffleArray(baseTemplateKeys),
        currentExtensionShuffle: [],
        baseShuffleIndex: 0,
        extensionShuffleIndex: 0,
        currentPhase: 'base',
        sessionStartTime: Date.now()
      };
      
      console.log(`🎯 HierarchicalSessionTemplateManager: Initialized with ${baseTemplateCount} base templates for ${gradeLevel}`);
    }

    // Phase 1: Try base templates first
    if (state.currentPhase === 'base' && state.baseShuffleIndex < state.currentBaseShuffle.length) {
      const templateKey = state.currentBaseShuffle[state.baseShuffleIndex];
      const templateIndex = parseInt(templateKey.split('_')[1]);
      const template = getTemplateByGradeLevel(gradeLevel, templateIndex, false);
      
      const isRepeating = state.baseTemplatesUsed.has(templateKey);
      state.baseTemplatesUsed.add(templateKey);
      state.baseShuffleIndex++;
      
      // Check if we've exhausted base templates
      if (state.baseShuffleIndex >= state.currentBaseShuffle.length) {
        console.log(`✅ HierarchicalSessionTemplateManager: Exhausted base templates, moving to extension phase`);
        state.currentPhase = 'extension';
        
        // Initialize extension templates
        try {
          if (gradeLevel === 0) {
            // Level 0 uses dedicated extension templates
            const extensionCount = getLevel0ExtensionCount(isPremium);
            const extensionKeys = Array.from({ length: extensionCount }, (_, i) => `extension_${i}`);
            state.currentExtensionShuffle = this.shuffleArray(extensionKeys);
            console.log(`🎯 HierarchicalSessionTemplateManager: Initialized ${extensionCount} Level 0 extension templates (premium: ${isPremium})`);
          } else {
            // For levels 1-4, extension templates are handled by enhanced template manager
            state.currentExtensionShuffle = [];
          }
        } catch (error) {
          console.warn(`⚠️ HierarchicalSessionTemplateManager: No extension templates available for ${gradeLevel}`);
          state.currentPhase = 'fallback';
        }
      }
      
      this.saveSessionState(state);
      
      console.log(`📖 HierarchicalSessionTemplateManager: Selected base template ${templateIndex + 1} (phase: base)`);
      
      return {
        template,
        templateIndex,
        phase: 'base',
        isRepeating
      };
    }

    // Phase 2: Use extension templates
    if (state.currentPhase === 'extension' && state.extensionShuffleIndex < state.currentExtensionShuffle.length) {
      if (gradeLevel === 0) {
        // Level 0: Use dedicated extension templates directly
        const templateKey = state.currentExtensionShuffle[state.extensionShuffleIndex];
        const templateIndex = parseInt(templateKey.split('_')[1]);
        const template = getLevel0Extension(isPremium);
        
        const isRepeating = state.extensionTemplatesUsed.has(templateKey);
        state.extensionTemplatesUsed.add(templateKey);
        state.extensionShuffleIndex++;
        
        // Check if we've exhausted extension templates
        if (state.extensionShuffleIndex >= state.currentExtensionShuffle.length) {
          console.log(`✅ HierarchicalSessionTemplateManager: Exhausted extension templates, moving to fallback phase`);
          state.currentPhase = 'fallback';
        }
        
        this.saveSessionState(state);
        
        console.log(`📖 HierarchicalSessionTemplateManager: Selected Level 0 extension template ${templateIndex + 1} (phase: extension, premium: ${isPremium})`);
        
        return {
          template,
          templateIndex,
          phase: 'extension',
          isRepeating
        };
      } else {
        // For levels 1-4, signal that extension should be handled by enhanced template manager
        console.log(`🔄 HierarchicalSessionTemplateManager: Extension phase for level ${gradeLevel} - delegating to enhanced template manager`);
        state.currentPhase = 'fallback';
        this.saveSessionState(state);
        
        return {
          template: [], // Empty template signals extension should be generated by enhanced template manager
          templateIndex: -1,
          phase: 'extension',
          isRepeating: false
        };
      }
    }
    
    // If extension phase is complete but we haven't exhausted extensions yet, move to fallback
    if (state.currentPhase === 'extension') {
      console.log(`✅ HierarchicalSessionTemplateManager: Extension phase complete, moving to fallback`);
      state.currentPhase = 'fallback';
      this.saveSessionState(state);
    }

    // Phase 3: Use fallback content
    console.log(`🔄 HierarchicalSessionTemplateManager: Moving to fallback content generation`);
    
    return {
      template: [], // Empty template signals fallback content should be generated
      templateIndex: -1,
      phase: 'fallback',
      isRepeating: true
    };
  }

  /**
   * Get current session statistics
   */
  static getSessionStats(): {
    baseTemplatesUsed: number;
    extensionTemplatesUsed: number;
    fallbacksUsed: number;
    currentPhase: 'base' | 'extension' | 'fallback';
    sessionAge: number;
  } {
    const state = this.getSessionState();
    
    if (!state) {
      return {
        baseTemplatesUsed: 0,
        extensionTemplatesUsed: 0,
        fallbacksUsed: 0,
        currentPhase: 'base',
        sessionAge: 0
      };
    }

    return {
      baseTemplatesUsed: state.baseTemplatesUsed.size,
      extensionTemplatesUsed: state.extensionTemplatesUsed.size,
      fallbacksUsed: state.fallbacksUsed.size,
      currentPhase: state.currentPhase,
      sessionAge: Date.now() - state.sessionStartTime
    };
  }

  /**
   * Record that an extension template was used
   * (Called by EnhancedTemplateManager when extension templates are used)
   */
  static recordExtensionTemplateUsed(templateIndex: number): void {
    let state = this.getSessionState();
    if (!state) return;

    const templateKey = `extension_${templateIndex}`;
    state.extensionTemplatesUsed.add(templateKey);
    this.saveSessionState(state);
    
    console.log(`📝 HierarchicalSessionTemplateManager: Recorded extension template ${templateIndex} as used`);
  }

  /**
   * Record that fallback content was used
   */
  static recordFallbackUsed(fallbackId: string): void {
    let state = this.getSessionState();
    if (!state) return;

    state.fallbacksUsed.add(fallbackId);
    this.saveSessionState(state);
    
    console.log(`📝 HierarchicalSessionTemplateManager: Recorded fallback ${fallbackId} as used`);
  }

  /**
   * Clear session state
   */
  static clearSession(): void {
    try {
      sessionStorage.removeItem(HIERARCHICAL_SESSION_KEY);
      console.log(`🔄 HierarchicalSessionTemplateManager: Session cleared`);
    } catch {
      // Session storage not available
    }
  }

  /**
   * Force move to next phase (for testing/debugging)
   */
  static forcePhaseTransition(targetPhase: 'base' | 'extension' | 'fallback'): void {
    let state = this.getSessionState();
    if (!state) return;

    state.currentPhase = targetPhase;
    this.saveSessionState(state);
    
    console.log(`🔧 HierarchicalSessionTemplateManager: Forced transition to ${targetPhase} phase`);
  }
}