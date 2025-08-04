import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { UserInfo } from '@/types';

interface HybridStoryResult {
  templateStory: string[];
  aiStory: string[] | null;
  isAiReady: boolean;
  isGenerating: boolean;
}

export const useHybridStoryGeneration = (
  userInfo: UserInfo,
  difficulty: 'easy' | 'medium' | 'hard' | 'expert',
  templateStory: string[]
): HybridStoryResult => {
  const [aiStory, setAiStory] = useState<string[] | null>(null);
  const [isAiReady, setIsAiReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Only generate AI story for premium users with a valid template
    if (!templateStory.length || templateStory[0]?.includes('Creating')) {
      return;
    }

    const generateAiStory = async () => {
      try {
        setIsGenerating(true);
        console.log('🤖 Starting background AI story generation...');

        const { data, error } = await supabase.functions.invoke('generate-adaptive-story', {
          body: {
            userInfo,
            difficulty,
            readingLevel: difficulty,
            theme: (userInfo as any).favoriteTheme || 'adventure',
            authorStyle: 'adaptive',
            pageCount: templateStory.length
          }
        });

        if (error) throw error;

        if (data?.story) {
          const aiPages = data.story.split('\\n\\n').filter((page: string) => page.trim());
          console.log('✨ AI story ready, transitioning from template...');
          setAiStory(aiPages);
          setIsAiReady(true);
        }
      } catch (error) {
        console.log('AI generation failed, staying with template:', error);
        // Graceful fallback - just keep using template story
      } finally {
        setIsGenerating(false);
      }
    };

    // Start AI generation in background after a brief delay
    const timer = setTimeout(generateAiStory, 100);
    return () => clearTimeout(timer);
  }, [userInfo, difficulty, templateStory]);

  return {
    templateStory,
    aiStory,
    isAiReady,
    isGenerating
  };
};
