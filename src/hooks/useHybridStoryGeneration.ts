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
  difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert',
  templateStory: string[],
  isPremium: boolean = false
): HybridStoryResult => {
  const [aiStory, setAiStory] = useState<string[] | null>(null);
  const [isAiReady, setIsAiReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    console.log('🔍 Hybrid hook called:', { isPremium, templateStoryLength: templateStory.length, firstPage: templateStory[0]?.substring(0, 50) });
    
    // Only generate AI story for premium users with a valid template
    if (!isPremium || !templateStory.length || templateStory[0]?.includes('Creating')) {
      console.log('🚫 Skipping AI generation:', { isPremium, hasTemplate: !!templateStory.length, isLoading: templateStory[0]?.includes('Creating') });
      return;
    }

    const generateAiStory = async () => {
      try {
        setIsGenerating(true);
        console.log('🤖 Starting background AI story generation...');

        const { data, error } = await supabase.functions.invoke('generate-adaptive-story', {
          body: {
            readingLevel: difficulty,
            authorStyle: 'adaptive',
            theme: (userInfo as any).favoriteTheme || 'adventure',
            interests: [userInfo.favoriteAnimal, userInfo.favoriteColor].filter(Boolean),
            config: {
              userName: userInfo.name,
              age: userInfo.age,
              gradeLevel: userInfo.gradeLevel,
              favoriteColor: userInfo.favoriteColor,
              favoriteAnimal: userInfo.favoriteAnimal,
              favoriteFood: (userInfo as any).favoriteFood,
              hobbies: (userInfo as any).hobbies,
              avatar: userInfo.avatar
            }
          }
        });

        if (error) throw error;

        if (data?.content) {
          const aiPages = data.content.split('\n\n').filter((page: string) => page.trim());
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
  }, [userInfo, difficulty, templateStory, isPremium]);

  return {
    templateStory,
    aiStory,
    isAiReady,
    isGenerating
  };
};
