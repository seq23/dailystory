// Hierarchical Session-based Template Management
// Enforces strict hierarchy: Base Templates → Extension Templates → Fallback Content
import type { DifficultyLevel } from "@/types";
import { getTemplateCountByGradeLevel, getTemplateByGradeLevel } from "@/constants/gradeBased/unifiedTemplateSystem";
import { difficultyToGradeLevel } from "@/constants/gradeBased";
import { getLevel0Extension, getLevel0ExtensionCount, LEVEL_0_FREE_EXTENSIONS, LEVEL_0_PREMIUM_EXTENSIONS } from "@/constants/gradeBased/level0ExtensionTemplates";

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

// Import mobile session manager for reliable storage
import { MobileSessionManager } from './mobileSessionManager';

export class HierarchicalSessionTemplateManager {
  // Memory fallback for when sessionStorage fails
  private static memoryState: HierarchicalTemplateState | null = null;
  private static subscriptionCache: { isPremium: boolean; timestamp: number } | null = null;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private static getLevel0ExtensionTemplates(isPremium: boolean): string[][] {
    return isPremium ? LEVEL_0_PREMIUM_EXTENSIONS : LEVEL_0_FREE_EXTENSIONS;
  }

  private static getSessionState(): HierarchicalTemplateState | null {
    try {
      const stored = MobileSessionManager.getItem(HIERARCHICAL_SESSION_KEY);
      if (!stored) return this.memoryState;
      
      const parsed = JSON.parse(stored);
      const state: HierarchicalTemplateState = {
        baseTemplatesUsed: new Set<string>(parsed.baseTemplatesUsed || []),
        extensionTemplatesUsed: new Set<string>(parsed.extensionTemplatesUsed || []),
        fallbacksUsed: new Set<string>(parsed.fallbacksUsed || []),
        currentBaseShuffle: Array.isArray(parsed.currentBaseShuffle) ? parsed.currentBaseShuffle : [],
        currentExtensionShuffle: Array.isArray(parsed.currentExtensionShuffle) ? parsed.currentExtensionShuffle : [],
        baseShuffleIndex: typeof parsed.baseShuffleIndex === 'number' ? parsed.baseShuffleIndex : 0,
        extensionShuffleIndex: typeof parsed.extensionShuffleIndex === 'number' ? parsed.extensionShuffleIndex : 0,
        currentPhase: ['base', 'extension', 'fallback'].includes(parsed.currentPhase) ? parsed.currentPhase : 'base',
        sessionStartTime: typeof parsed.sessionStartTime === 'number' ? parsed.sessionStartTime : Date.now()
      };
      
      // Validate state integrity
      if (this.validateSessionState(state)) {
        this.memoryState = state; // Update memory backup
        return state;
      } else {
        console.warn('⚠️ Session state corrupted, resetting...');
        this.clearSession();
        return null;
      }
    } catch (error) {
      console.warn('⚠️ SessionStorage failed, using memory fallback:', error);
      return this.memoryState;
    }
  }

  private static validateSessionState(state: HierarchicalTemplateState): boolean {
    return (
      state.currentPhase &&
      ['base', 'extension', 'fallback'].includes(state.currentPhase) &&
      Array.isArray(state.currentBaseShuffle) &&
      Array.isArray(state.currentExtensionShuffle) &&
      typeof state.baseShuffleIndex === 'number' &&
      typeof state.extensionShuffleIndex === 'number' &&
      typeof state.sessionStartTime === 'number'
    );
  }

  private static saveSessionState(state: HierarchicalTemplateState): void {
    try {
      const serialized = JSON.stringify({
        baseTemplatesUsed: Array.from(state.baseTemplatesUsed),
        extensionTemplatesUsed: Array.from(state.extensionTemplatesUsed),
        fallbacksUsed: Array.from(state.fallbacksUsed),
        currentBaseShuffle: state.currentBaseShuffle,
        currentExtensionShuffle: state.currentExtensionShuffle,
        baseShuffleIndex: state.baseShuffleIndex,
        extensionShuffleIndex: state.extensionShuffleIndex,
        currentPhase: state.currentPhase,
        sessionStartTime: state.sessionStartTime
      });
      
      MobileSessionManager.setItem(HIERARCHICAL_SESSION_KEY, serialized);
      this.memoryState = state; // Always update memory backup
    } catch (error) {
      console.warn('⚠️ SessionStorage failed, using memory only:', error);
      this.memoryState = state; // Keep in memory as fallback
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
      console.log(`📈 Session analytics: Base ${state.baseTemplatesUsed.size}/${state.currentBaseShuffle.length}, Session age: ${Date.now() - state.sessionStartTime}ms`);
      
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
        // Level 0: Use dedicated extension templates with proper indexing
        const templateKey = state.currentExtensionShuffle[state.extensionShuffleIndex];
        const templateIndex = parseInt(templateKey.split('_')[1]);
        
        // Get all extension templates and select the specific one by index
        const extensions = this.getLevel0ExtensionTemplates(isPremium);
        const template = extensions[templateIndex] || getLevel0Extension(isPremium); // Fallback to random if index fails
        
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
        console.log(`📈 Session analytics: Extensions ${state.extensionTemplatesUsed.size}/${state.currentExtensionShuffle.length}, Session age: ${Date.now() - state.sessionStartTime}ms`);
        
        return {
          template,
          templateIndex,
          phase: 'extension',
          isRepeating
        };
      } else {
        // For levels 1-4, signal that extension should be handled by enhanced template manager
        console.log(`🔄 HierarchicalSessionTemplateManager: Extension phase for level ${gradeLevel} - delegating to enhanced template manager`);
        console.log(`📈 Final analytics: Total templates used ${state.baseTemplatesUsed.size + state.extensionTemplatesUsed.size}, Session duration: ${Date.now() - state.sessionStartTime}ms`);
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
      MobileSessionManager.removeItem(HIERARCHICAL_SESSION_KEY);
      this.memoryState = null;
      this.subscriptionCache = null;
      console.log(`🔄 HierarchicalSessionTemplateManager: Session cleared`);
    } catch {
      // Session storage not available, clear memory only
      this.memoryState = null;
      this.subscriptionCache = null;
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