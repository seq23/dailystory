// Unified Story Generation Hook
// Uses the new frontend processing pipeline

import { useState, useCallback } from 'react';
import { StoryGenerationService, type StoryGenerationResult } from '@/services/storyGenerationService';
import { VocabularyService } from '@/services/vocabularyService';
import { AuthorVoiceService } from '@/services/authorVoiceService';
import { generateCreativeSeeds } from '@/services/inputEnhancementEngine';
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
  authorVoice: any;
  creativeSeeds: any;
}

export const useUnifiedStoryGeneration = (): UseUnifiedStoryGenerationResult => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vocabularyIntegration, setVocabularyIntegration] = useState(null);
  const [authorVoice, setAuthorVoice] = useState(null);
  const [creativeSeeds, setCreativeSeeds] = useState(null);

  const generateStory = useCallback(async (userInfo: UserInfo, config = {}) => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log('🚀 Using 5-layer story generation pipeline');

      // Process vocabulary (for debugging/display purposes)
      try {
        const vocabIntegration = await VocabularyService.fetchAllVocabulary(userInfo);
        setVocabularyIntegration(vocabIntegration);
      } catch (error) {
        console.warn('⚠️ Vocabulary processing failed in hook:', error);
      }
      
      // Process author voice (for debugging/display purposes)
      try {
        const themeHints = [
          ...(userInfo.interests || []),
          ...(userInfo.favoriteActivities || [])
        ];
        const voiceBundle = AuthorVoiceService.createInspirationalBundle(
          userInfo.difficultyLevel || 'easy',
          themeHints
        );
        setAuthorVoice(voiceBundle);
      } catch (error) {
        console.warn('⚠️ Author voice processing failed in hook:', error);
      }
      
      // Process creative seeds (for debugging/display purposes)
      try {
        const seeds = generateCreativeSeeds(userInfo);
        setCreativeSeeds(seeds);
      } catch (error) {
        console.warn('⚠️ Creative seeds processing failed in hook:', error);
      }

      // Generate story using unified service (handles all failures internally)
      const result = await StoryGenerationService.generateStory(userInfo, config);
      
      console.log('✅ 5-layer generation complete:', {
        success: result.success,
        pagesGenerated: result.pages?.length || 0,
        authorVoice: result.metadata?.authorVoice,
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
    vocabularyIntegration,
    authorVoice,
    creativeSeeds
  };
};