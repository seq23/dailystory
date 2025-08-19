import { resolveAllPlaceholders } from '@/utils/placeholderResolver';
import type { UserInfo } from '@/types';

/**
 * Enhanced Post-Processing Service for Story and Image Generation
 * Handles placeholder resolution, character consistency, and content enhancement
 */
export class EnhancedPostProcessor {
  
  /**
   * Post-process AI-generated story content
   * Resolves placeholders and ensures content consistency
   */
  static async processStoryContent(
    pages: string[],
    userInfo: UserInfo,
    sessionId?: string
  ): Promise<string[]> {
    console.log('📝 Post-processing story content for placeholder resolution');
    
    try {
      const processedPages = pages.map((page, index) => {
        // Resolve all placeholders in the page content
        const resolvedPage = resolveAllPlaceholders(page, {
          userInfo,
          pageText: page
        });
        
        console.log(`✅ Processed page ${index + 1}: ${resolvedPage.substring(0, 50)}...`);
        return resolvedPage;
      });

      // Store character context if session exists
      if (sessionId && userInfo) {
        await this.initializeCharacterContext(userInfo, sessionId, processedPages);
      }

      return processedPages;
      
    } catch (error) {
      console.warn('Failed to post-process story content:', error);
      return pages; // Return original pages if processing fails
    }
  }

  /**
   * Initialize character context for visual consistency
   */
  private static async initializeCharacterContext(
    userInfo: UserInfo,
    sessionId: string,
    pages: string[]
  ): Promise<void> {
    try {
      const { StoryVisualStateManager } = await import('./storyVisualState');
      
      // Initialize story state with total pages
      StoryVisualStateManager.getOrCreateStoryState(sessionId, pages.length);
      
      // Generate character description for consistency
      if (userInfo.name) {
        const { MulticulturalVisualService } = await import('../../supabase/functions/_shared/cultural-visual-service.js');
        const characterDesc = MulticulturalVisualService.generateCulturalCharacterDescription(userInfo);
        
        // Store character without seed initially - will be added when first image is generated
        StoryVisualStateManager.updateCharacterWithSeed(sessionId, userInfo.name, characterDesc, undefined, 1);
        
        console.log(`✅ Initialized character context for ${userInfo.name} in session ${sessionId}`);
      }
      
    } catch (error) {
      console.warn('Failed to initialize character context:', error);
    }
  }

  /**
   * Validate that all placeholders are resolved
   */
  static validatePlaceholderResolution(content: string): { 
    isValid: boolean; 
    unresolvedPlaceholders: string[];
  } {
    const placeholderPattern = /\{([^}]+)\}/g;
    const matches = Array.from(content.matchAll(placeholderPattern));
    const unresolvedPlaceholders = matches.map(match => match[1]);
    
    return {
      isValid: unresolvedPlaceholders.length === 0,
      unresolvedPlaceholders
    };
  }

  /**
   * Generate character consistency report for debugging
   */
  static async generateConsistencyReport(sessionId: string): Promise<{
    hasCharacterSeeds: boolean;
    characterCount: number;
    seedsStored: number;
  }> {
    try {
      const { StoryVisualStateManager } = await import('./storyVisualState');
      const state = StoryVisualStateManager.getOrCreateStoryState(sessionId);
      
      const characterCount = Object.keys(state.characters).length;
      const seedsStored = Object.values(state.characters).filter(char => char.seed !== undefined).length;
      
      return {
        hasCharacterSeeds: seedsStored > 0,
        characterCount,
        seedsStored
      };
      
    } catch (error) {
      console.warn('Failed to generate consistency report:', error);
      return {
        hasCharacterSeeds: false,
        characterCount: 0,
        seedsStored: 0
      };
    }
  }

  /**
   * Clean and enhance story content for better readability
   */
  static cleanStoryContent(content: string): string {
    return content
      .replace(/\s{2,}/g, ' ') // Multiple spaces to single space
      .replace(/\s+([,.!?:;])/g, '$1') // Remove space before punctuation
      .replace(/([.!?])\s*([a-z])/g, '$1 $2') // Ensure space after sentence endings
      .trim();
  }
}