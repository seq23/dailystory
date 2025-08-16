/**
 * Navigation cache validation utility
 * Ensures navigation state persistence and prevents cache corruption
 */

interface NavigationState {
  currentPage: number;
  totalPages: number;
  storyId: string;
  lastAccessed: number;
  difficulty: string;
  sessionId?: string;
}

interface CacheValidationResult {
  isValid: boolean;
  issues: string[];
  correctedState?: NavigationState;
}

export class NavigationCacheValidator {
  private static readonly CACHE_KEY = 'navigation_state';
  private static readonly MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly MAX_PAGES = 1000; // Reasonable limit

  /**
   * Validate cached navigation state
   */
  static validateCache(): CacheValidationResult {
    const issues: string[] = [];
    let isValid = true;

    try {
      const cached = sessionStorage.getItem(this.CACHE_KEY);
      if (!cached) {
        return { isValid: true, issues: [] }; // No cache is valid
      }

      const state: NavigationState = JSON.parse(cached);
      
      // Validate structure
      if (typeof state !== 'object' || !state) {
        issues.push('Invalid cache structure');
        isValid = false;
      }

      // Validate required fields
      const requiredFields = ['currentPage', 'totalPages', 'storyId', 'lastAccessed'];
      for (const field of requiredFields) {
        if (!(field in state)) {
          issues.push(`Missing required field: ${field}`);
          isValid = false;
        }
      }

      // Validate data types and ranges
      if (typeof state.currentPage !== 'number' || state.currentPage < 1) {
        issues.push('Invalid currentPage value');
        isValid = false;
      }

      if (typeof state.totalPages !== 'number' || state.totalPages < 1) {
        issues.push('Invalid totalPages value');
        isValid = false;
      }

      if (state.currentPage > state.totalPages) {
        issues.push('currentPage exceeds totalPages');
        isValid = false;
      }

      if (state.totalPages > this.MAX_PAGES) {
        issues.push(`totalPages exceeds maximum (${this.MAX_PAGES})`);
        isValid = false;
      }

      // Validate cache age
      const age = Date.now() - state.lastAccessed;
      if (age > this.MAX_CACHE_AGE) {
        issues.push('Cache expired');
        isValid = false;
      }

      // Validate storyId format
      if (typeof state.storyId !== 'string' || state.storyId.length === 0) {
        issues.push('Invalid storyId');
        isValid = false;
      }

      // If correctable issues found, provide corrected state
      let correctedState: NavigationState | undefined;
      if (!isValid && state.storyId && state.totalPages > 0) {
        correctedState = {
          currentPage: Math.max(1, Math.min(state.currentPage || 1, state.totalPages)),
          totalPages: Math.min(state.totalPages, this.MAX_PAGES),
          storyId: state.storyId,
          lastAccessed: Date.now(),
          difficulty: state.difficulty || 'medium',
          sessionId: state.sessionId
        };
      }

      return { isValid, issues, correctedState };

    } catch (error) {
      console.error('Cache validation error:', error);
      return {
        isValid: false,
        issues: ['Cache parsing failed'],
      };
    }
  }

  /**
   * Set navigation state with validation
   */
  static setNavigationState(state: Partial<NavigationState>): boolean {
    try {
      const currentState = this.getCurrentState();
      const newState: NavigationState = {
        ...currentState,
        ...state,
        lastAccessed: Date.now()
      };

      // Validate before saving
      const validation = this.validateState(newState);
      if (!validation.isValid) {
        console.warn('Navigation state validation failed:', validation.issues);
        return false;
      }

      sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(newState));
      return true;
    } catch (error) {
      console.error('Failed to set navigation state:', error);
      return false;
    }
  }

  /**
   * Get current navigation state with validation
   */
  static getCurrentState(): NavigationState | null {
    const validation = this.validateCache();
    
    if (validation.isValid) {
      try {
        const cached = sessionStorage.getItem(this.CACHE_KEY);
        return cached ? JSON.parse(cached) : null;
      } catch {
        return null;
      }
    }

    // If cache is invalid but correctable, use corrected state
    if (validation.correctedState) {
      console.log('Using corrected navigation state');
      this.setNavigationState(validation.correctedState);
      return validation.correctedState;
    }

    // Clear invalid cache
    this.clearCache();
    return null;
  }

  /**
   * Clear navigation cache
   */
  static clearCache(): void {
    try {
      sessionStorage.removeItem(this.CACHE_KEY);
      console.log('Navigation cache cleared');
    } catch (error) {
      console.error('Failed to clear navigation cache:', error);
    }
  }

  /**
   * Validate state object
   */
  private static validateState(state: NavigationState): CacheValidationResult {
    const issues: string[] = [];
    
    if (state.currentPage < 1 || state.currentPage > state.totalPages) {
      issues.push('currentPage out of range');
    }
    
    if (state.totalPages < 1 || state.totalPages > this.MAX_PAGES) {
      issues.push('totalPages out of range');
    }
    
    if (!state.storyId || typeof state.storyId !== 'string') {
      issues.push('Invalid storyId');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Get cache statistics for monitoring
   */
  static getCacheStats() {
    const validation = this.validateCache();
    const state = this.getCurrentState();
    
    return {
      isValid: validation.isValid,
      issueCount: validation.issues.length,
      issues: validation.issues,
      hasCache: !!state,
      cacheAge: state ? Date.now() - state.lastAccessed : 0
    };
  }
}