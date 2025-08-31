// Unified Story Generation Hook
// Uses the new frontend processing pipeline

import { useState, useCallback } from 'react';
import { StoryGenerationService, type StoryGenerationResult } from '@/services/storyGenerationService';
import { VocabularyService } from '@/services/vocabularyService';
import { AuthorVoiceService } from '@/services/authorVoiceService';
import { CreativeElementsProcessor } from '@/services/creativeElementsProcessor';
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
  creativeBundle: any;
}

export const useUnifiedStoryGeneration = (): UseUnifiedStoryGenerationResult => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vocabularyIntegration, setVocabularyIntegration] = useState(null);
  const [authorVoice, setAuthorVoice] = useState(null);
  const [creativeBundle, setCreativeBundle] = useState(null);

  const generateStory = useCallback(async (userInfo: UserInfo, config = {}) => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log('🚀 Using unified story generation pipeline');

      // Process vocabulary (for debugging/display purposes)
      const vocabIntegration = await VocabularyService.fetchAllVocabulary(userInfo);
      setVocabularyIntegration(vocabIntegration);
      
      // Process author voice (for debugging/display purposes)
      const voiceBundle = AuthorVoiceService.createVoiceBundle(
        userInfo.favoriteColor, 
        userInfo.difficultyLevel || 'easy'
      );
      setAuthorVoice(voiceBundle);
      
      // Process creative elements (for debugging/display purposes)
      const creative = CreativeElementsProcessor.processUserInputs(userInfo);
      setCreativeBundle(creative);

      // Generate story using unified service
      const result = await StoryGenerationService.generateStory(userInfo, config);
      
      console.log('✅ Unified generation complete:', {
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
    creativeBundle
  };
};