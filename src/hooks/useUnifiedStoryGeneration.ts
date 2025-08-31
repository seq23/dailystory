// Unified Story Generation Hook - Simplified (removed author voice processing)
// Uses the new lean 3-layer processing pipeline

import { useState, useCallback } from 'react';
import { StoryGenerationService, type StoryGenerationResult } from '@/services/storyGenerationService';
import { VocabularyService } from '@/services/vocabularyService';
import type { UserInfo } from '@/types';

export interface UseUnifiedStoryGenerationResult {
  generateStory: (userInfo: UserInfo, config?: {
    sessionType?: 'free' | 'premium';
    pageNumber?: number;
    existingStory?: string;
  }) => Promise<StoryGenerationResult>;
  isGenerating: boolean;
  error: string | null;
  vocabularyIntegration: any;
}

export const useUnifiedStoryGeneration = (): UseUnifiedStoryGenerationResult => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vocabularyIntegration, setVocabularyIntegration] = useState(null);

  const generateStory = useCallback(async (userInfo: UserInfo, config = {}) => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log('🚀 Using simplified 3-layer story generation pipeline');

      // Process vocabulary (for debugging/display purposes)
      try {
        const vocabIntegration = await VocabularyService.fetchAllVocabulary(userInfo);
        setVocabularyIntegration(vocabIntegration);
      } catch (error) {
        console.warn('⚠️ Vocabulary processing failed in hook:', error);
      }

      // Generate story using unified service (handles all failures internally)
      const result = await StoryGenerationService.generateStory(userInfo, config);
      
      console.log('✅ Simplified generation complete:', {
        success: result.success,
        pagesGenerated: result.pages?.length || 0,
        processingTime: result.metadata?.processingTime
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