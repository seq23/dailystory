// Unified Story Generation Hook - Simplified (removed author voice processing)
// Uses the new lean 3-layer processing pipeline

import { useState, useCallback } from 'react';
import { StoryGenerationService, type StoryGenerationResult } from '@/services/storyGenerationService';
import { VocabularyService } from '@/services/vocabularyService';
import { generateSessionIdWithPrefix } from '@/utils/sessionId';
import type { UserInfo } from '@/types';

export interface UseUnifiedStoryGenerationResult {
  generateStory: (userInfo: UserInfo, config?: {
    sessionType?: 'free' | 'premium';
    pageNumber?: number;
    existingStory?: string;
    sessionId?: string;
  }) => Promise<StoryGenerationResult>;
  isGenerating: boolean;
  error: string | null;
  vocabularyIntegration: any;
}

export const useUnifiedStoryGeneration = (): UseUnifiedStoryGenerationResult => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vocabularyIntegration, setVocabularyIntegration] = useState(null);

  const generateStory = useCallback(async (userInfo: UserInfo, config: {
    sessionType?: 'free' | 'premium';
    pageNumber?: number;
    existingStory?: string;
    sessionId?: string;
  } = {}) => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log('🚀 Using token-optimized 3-layer story generation pipeline with bundled character logic');

      // Process vocabulary (for debugging/display purposes)
      try {
        const vocabIntegration = await VocabularyService.fetchAllVocabulary(userInfo);
        setVocabularyIntegration(vocabIntegration);
      } catch (error) {
        console.warn('⚠️ Vocabulary processing failed in hook:', error);
      }

      // Generate story using unified service (handles all failures internally)
      const result = await StoryGenerationService.generateStory(userInfo, {
        ...config,
        sessionId: config.sessionId || generateSessionIdWithPrefix(`unified-${userInfo.name}`)
      });
      
      console.log('✅ Token-optimized generation complete:', {
        success: result.success,
        pagesGenerated: result.pages?.length || 0,
        processingTime: result.metadata?.processingTime,
        characterConsistency: (result.metadata as any)?.characterConsistency,
        secondaryCharacters: (result.metadata as any)?.secondaryCharacters
      });

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ Unified story generation failed:', err);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateStory,
    isGenerating,
    error,
    vocabularyIntegration
  };
};