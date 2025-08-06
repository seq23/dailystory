// Enhanced Template Exhaustion Manager
// Ensures all templates are used before moving to extensions and fallbacks

import type { DifficultyLevel, UserInfo } from "@/types";

type GradeLevel = 0 | 1 | 2 | 3 | 4;
import { getTemplateCountByGradeLevel, selectTemplate } from "@/constants/gradeBased/unifiedTemplateSystem";
import { DIFFICULTY_APPROPRIATE_TEMPLATES } from "@/constants/difficultyAppropriateTemplates";

export interface TemplateExhaustionState {
  gradeLevel?: GradeLevel;
  difficulty?: DifficultyLevel;
  usedBaseTemplates: Set<number>;
  usedExtensionTemplates: Set<number>;
  usedDifficultyTemplates: Set<number>;
  currentPhase: 'base' | 'extension' | 'fallback' | 'cycling';
  sessionId: string;
  lastUpdated: number;
}

export interface ExhaustionResult {
  templateIndex: number;
  template: string[];
  phase: 'base' | 'extension' | 'fallback' | 'cycling';
  exhaustionStatus: {
    baseComplete: boolean;
    extensionComplete: boolean;
    totalUsed: number;
    totalAvailable: number;
    completionPercentage: number;
  };
}

export class EnhancedTemplateExhaustionManager {
  private static readonly STORAGE_KEY = 'template_exhaustion_state';
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Select template with exhaustion logic for Grade-Based System (Levels 1-4)
   */
  static selectGradeBasedTemplate(
    gradeLevel: GradeLevel,
    userInfo?: UserInfo,
    isPremium?: boolean
  ): ExhaustionResult {
    const state = this.getGradeBasedState(gradeLevel);
    const totalBaseTemplates = getTemplateCountByGradeLevel(gradeLevel, false);
    const totalExtensionTemplates = getTemplateCountByGradeLevel(gradeLevel, true) - totalBaseTemplates;

    // Phase 1: Exhaust all base templates (40 per level)
    if (state.usedBaseTemplates.size < totalBaseTemplates) {
      const availableIndices = Array.from({ length: totalBaseTemplates }, (_, i) => i)
        .filter(i => !state.usedBaseTemplates.has(i));
      
      const templateIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      const { template } = selectTemplate(gradeLevel, Array.from(state.usedBaseTemplates), templateIndex);
      
      state.usedBaseTemplates.add(templateIndex);
      state.currentPhase = 'base';
      this.saveGradeBasedState(gradeLevel, state);

      return {
        templateIndex,
        template,
        phase: 'base',
        exhaustionStatus: {
          baseComplete: false,
          extensionComplete: false,
          totalUsed: state.usedBaseTemplates.size,
          totalAvailable: totalBaseTemplates,
          completionPercentage: Math.round((state.usedBaseTemplates.size / totalBaseTemplates) * 100)
        }
      };
    }

    // Phase 2: Exhaust all extension templates (5 per level)
    if (isPremium && state.usedExtensionTemplates.size < totalExtensionTemplates) {
      const availableExtensionIndices = Array.from({ length: totalExtensionTemplates }, (_, i) => i + totalBaseTemplates)
        .filter(i => !state.usedExtensionTemplates.has(i - totalBaseTemplates));
      
      const extensionIndex = availableExtensionIndices[Math.floor(Math.random() * availableExtensionIndices.length)];
      const { template } = selectTemplate(gradeLevel, [], extensionIndex);
      
      state.usedExtensionTemplates.add(extensionIndex - totalBaseTemplates);
      state.currentPhase = 'extension';
      this.saveGradeBasedState(gradeLevel, state);

      return {
        templateIndex: extensionIndex,
        template,
        phase: 'extension',
        exhaustionStatus: {
          baseComplete: true,
          extensionComplete: false,
          totalUsed: totalBaseTemplates + state.usedExtensionTemplates.size,
          totalAvailable: totalBaseTemplates + totalExtensionTemplates,
          completionPercentage: Math.round(((totalBaseTemplates + state.usedExtensionTemplates.size) / (totalBaseTemplates + totalExtensionTemplates)) * 100)
        }
      };
    }

    // Phase 3: All templates exhausted - start cycling from beginning
    state.currentPhase = 'cycling';
    state.usedBaseTemplates.clear();
    state.usedExtensionTemplates.clear();
    this.saveGradeBasedState(gradeLevel, state);

    // Restart with first template
    const { template } = selectTemplate(gradeLevel, [], 0);
    state.usedBaseTemplates.add(0);
    this.saveGradeBasedState(gradeLevel, state);

    return {
      templateIndex: 0,
      template,
      phase: 'cycling',
      exhaustionStatus: {
        baseComplete: true,
        extensionComplete: true,
        totalUsed: 1,
        totalAvailable: totalBaseTemplates + (isPremium ? totalExtensionTemplates : 0),
        completionPercentage: 100
      }
    };
  }

  /**
   * Select template with exhaustion logic for Difficulty-Based System
   */
  static selectDifficultyBasedTemplate(
    difficulty: DifficultyLevel,
    userInfo?: UserInfo
  ): ExhaustionResult {
    const state = this.getDifficultyBasedState(difficulty);
    const templates = DIFFICULTY_APPROPRIATE_TEMPLATES[difficulty];
    const totalTemplates = templates.length;

    // Exhaust all templates before cycling
    if (state.usedDifficultyTemplates.size < totalTemplates) {
      const availableIndices = Array.from({ length: totalTemplates }, (_, i) => i)
        .filter(i => !state.usedDifficultyTemplates.has(i));
      
      const templateIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      const template = templates[templateIndex];
      
      state.usedDifficultyTemplates.add(templateIndex);
      state.currentPhase = 'base';
      this.saveDifficultyBasedState(difficulty, state);

      return {
        templateIndex,
        template,
        phase: 'base',
        exhaustionStatus: {
          baseComplete: false,
          extensionComplete: false,
          totalUsed: state.usedDifficultyTemplates.size,
          totalAvailable: totalTemplates,
          completionPercentage: Math.round((state.usedDifficultyTemplates.size / totalTemplates) * 100)
        }
      };
    }

    // All templates exhausted - start cycling
    state.currentPhase = 'cycling';
    state.usedDifficultyTemplates.clear();
    this.saveDifficultyBasedState(difficulty, state);

    // Restart with first template
    const template = templates[0];
    state.usedDifficultyTemplates.add(0);
    this.saveDifficultyBasedState(difficulty, state);

    return {
      templateIndex: 0,
      template,
      phase: 'cycling',
      exhaustionStatus: {
        baseComplete: true,
        extensionComplete: true,
        totalUsed: 1,
        totalAvailable: totalTemplates,
        completionPercentage: 100
      }
    };
  }

  /**
   * Get exhaustion analytics for a grade level
   */
  static getGradeBasedAnalytics(gradeLevel: GradeLevel): {
    baseUsed: number;
    baseTotal: number;
    extensionUsed: number;
    extensionTotal: number;
    currentPhase: string;
    completionPercentage: number;
  } {
    const state = this.getGradeBasedState(gradeLevel);
    const totalBaseTemplates = getTemplateCountByGradeLevel(gradeLevel, false);
    const totalExtensionTemplates = getTemplateCountByGradeLevel(gradeLevel, true) - totalBaseTemplates;

    return {
      baseUsed: state.usedBaseTemplates.size,
      baseTotal: totalBaseTemplates,
      extensionUsed: state.usedExtensionTemplates.size,
      extensionTotal: totalExtensionTemplates,
      currentPhase: state.currentPhase,
      completionPercentage: Math.round(
        ((state.usedBaseTemplates.size + state.usedExtensionTemplates.size) / 
         (totalBaseTemplates + totalExtensionTemplates)) * 100
      )
    };
  }

  /**
   * Get exhaustion analytics for a difficulty level
   */
  static getDifficultyBasedAnalytics(difficulty: DifficultyLevel): {
    used: number;
    total: number;
    currentPhase: string;
    completionPercentage: number;
  } {
    const state = this.getDifficultyBasedState(difficulty);
    const totalTemplates = DIFFICULTY_APPROPRIATE_TEMPLATES[difficulty].length;

    return {
      used: state.usedDifficultyTemplates.size,
      total: totalTemplates,
      currentPhase: state.currentPhase,
      completionPercentage: Math.round((state.usedDifficultyTemplates.size / totalTemplates) * 100)
    };
  }

  /**
   * Reset exhaustion state for grade level
   */
  static resetGradeBasedState(gradeLevel: GradeLevel): void {
    const states = this.getAllStates();
    delete states[`grade_${gradeLevel}`];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(states));
  }

  /**
   * Reset exhaustion state for difficulty level
   */
  static resetDifficultyBasedState(difficulty: DifficultyLevel): void {
    const states = this.getAllStates();
    delete states[`difficulty_${difficulty}`];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(states));
  }

  /**
   * Clear all exhaustion states
   */
  static clearAllStates(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Private helper methods
  private static getGradeBasedState(gradeLevel: GradeLevel): TemplateExhaustionState {
    const states = this.getAllStates();
    const key = `grade_${gradeLevel}`;
    
    if (states[key] && this.isStateValid(states[key])) {
      return {
        ...states[key],
        usedBaseTemplates: new Set(states[key].usedBaseTemplates),
        usedExtensionTemplates: new Set(states[key].usedExtensionTemplates),
        usedDifficultyTemplates: new Set(states[key].usedDifficultyTemplates)
      };
    }

    return this.createNewState(gradeLevel);
  }

  private static getDifficultyBasedState(difficulty: DifficultyLevel): TemplateExhaustionState {
    const states = this.getAllStates();
    const key = `difficulty_${difficulty}`;
    
    if (states[key] && this.isStateValid(states[key])) {
      return {
        ...states[key],
        usedBaseTemplates: new Set(states[key].usedBaseTemplates),
        usedExtensionTemplates: new Set(states[key].usedExtensionTemplates),
        usedDifficultyTemplates: new Set(states[key].usedDifficultyTemplates)
      };
    }

    return this.createNewState(undefined, difficulty);
  }

  private static createNewState(gradeLevel?: GradeLevel, difficulty?: DifficultyLevel): TemplateExhaustionState {
    return {
      gradeLevel,
      difficulty,
      usedBaseTemplates: new Set(),
      usedExtensionTemplates: new Set(),
      usedDifficultyTemplates: new Set(),
      currentPhase: 'base',
      sessionId: Date.now().toString(),
      lastUpdated: Date.now()
    };
  }

  private static saveGradeBasedState(gradeLevel: GradeLevel, state: TemplateExhaustionState): void {
    const states = this.getAllStates();
    const key = `grade_${gradeLevel}`;
    
    states[key] = {
      ...state,
      usedBaseTemplates: Array.from(state.usedBaseTemplates),
      usedExtensionTemplates: Array.from(state.usedExtensionTemplates),
      usedDifficultyTemplates: Array.from(state.usedDifficultyTemplates),
      lastUpdated: Date.now()
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(states));
  }

  private static saveDifficultyBasedState(difficulty: DifficultyLevel, state: TemplateExhaustionState): void {
    const states = this.getAllStates();
    const key = `difficulty_${difficulty}`;
    
    states[key] = {
      ...state,
      usedBaseTemplates: Array.from(state.usedBaseTemplates),
      usedExtensionTemplates: Array.from(state.usedExtensionTemplates),
      usedDifficultyTemplates: Array.from(state.usedDifficultyTemplates),
      lastUpdated: Date.now()
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(states));
  }

  private static getAllStates(): Record<string, any> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private static isStateValid(state: any): boolean {
    if (!state || typeof state !== 'object') return false;
    if (!state.lastUpdated || Date.now() - state.lastUpdated > this.SESSION_DURATION) return false;
    return true;
  }
}