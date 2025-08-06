// Netflix-Style Story Service for Free Users
// Generates complete stories upfront with loading screen

import { supabase } from '@/integrations/supabase/client';
import type { UserInfo, DifficultyLevel } from '@/types';
import { getStoryPrompt, formatUserPrompt, calculateDifficultyFromUser } from '@/config/storyPrompts';

export interface NetflixStoryResult {
  pages: string[];
  difficulty: DifficultyLevel;
  title: string;
  isComplete: boolean;
  error?: string;
}

export class NetflixStyleStoryService {
  static async generateCompleteStory(userInfo: UserInfo): Promise<NetflixStoryResult> {
    try {
      console.log('🎬 Netflix-Style: Generating complete story for', userInfo.name);
      
      // Determine difficulty level
      const difficulty = userInfo.difficultyLevel || calculateDifficultyFromUser(userInfo);
      const promptConfig = getStoryPrompt(difficulty);
      
      // Format prompts
      const systemPrompt = promptConfig.systemPrompt;
      const userPrompt = formatUserPrompt(promptConfig.userPromptTemplate, userInfo);
      
      console.log('🎬 Calling OpenAI for story generation...');
      
      // Call OpenAI via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-adaptive-story', {
        body: {
          readingLevel: difficulty,
          authorStyle: 'simple',
          theme: 'adventure',
          interests: [userInfo.favoriteAnimal, userInfo.favoriteColor].filter(Boolean),
          config: {
            userName: userInfo.name,
            age: userInfo.age,
            gradeLevel: userInfo.grade,
            favoriteColor: userInfo.favoriteColor,
            favoriteAnimal: userInfo.favoriteAnimal,
            favoriteFood: userInfo.favoriteFood,
            hobbies: userInfo.hobbies,
            systemPrompt,
            userPrompt,
            maxLength: promptConfig.maxLength,
            expectedPages: promptConfig.expectedPages
          }
        }
      });

      if (error) {
        console.error('🎬 Netflix-Style: OpenAI call failed:', error);
        return this.generateFallbackStory(userInfo, difficulty);
      }

      if (data?.content) {
        // Split content into pages
        const pages = data.content
          .split('\n\n')
          .filter((page: string) => page.trim())
          .map((page: string) => page.trim());
        
        console.log(`🎬 Netflix-Style: Generated ${pages.length} pages for ${difficulty} level`);
        
        return {
          pages,
          difficulty,
          title: `${userInfo.name}'s Adventure`,
          isComplete: true
        };
      }

      // Fallback if no content
      return this.generateFallbackStory(userInfo, difficulty);
      
    } catch (error) {
      console.error('🎬 Netflix-Style: Story generation failed:', error);
      return this.generateFallbackStory(userInfo, userInfo.difficultyLevel || 'easy');
    }
  }

  private static generateFallbackStory(userInfo: UserInfo, difficulty: DifficultyLevel): NetflixStoryResult {
    console.log('🎬 Netflix-Style: Using fallback story');
    
    const fallbackStories = {
      beginner: [
        `Hello ${userInfo.name}!`,
        `You see a ${userInfo.favoriteColor} ${userInfo.favoriteAnimal}.`,
        `The ${userInfo.favoriteAnimal} is happy.`,
        `You play together.`,
        `What a fun day!`
      ],
      easy: [
        `${userInfo.name} loves to ${userInfo.hobbies} every day.`,
        `Today, ${userInfo.name} found a special ${userInfo.favoriteColor} ${userInfo.favoriteAnimal}.`,
        `The ${userInfo.favoriteAnimal} wanted to be friends.`,
        `They played together in the sunny garden.`,
        `${userInfo.name} shared some ${userInfo.favoriteFood}.`,
        `It was the best day ever!`,
        `${userInfo.name} can't wait for tomorrow's adventure.`
      ],
      medium: [
        `${userInfo.name} was excited about today's adventure. At ${userInfo.age} years old, they loved exploring new places.`,
        `While practicing ${userInfo.hobbies}, ${userInfo.name} noticed something unusual. A beautiful ${userInfo.favoriteColor} light was glowing nearby.`,
        `Following the light, they discovered a friendly ${userInfo.favoriteAnimal} who seemed to be waiting for them.`,
        `The ${userInfo.favoriteAnimal} led ${userInfo.name} to a magical garden where everything was ${userInfo.favoriteColor}.`,
        `They spent the afternoon learning about friendship and sharing ${userInfo.favoriteFood} together.`,
        `As the sun began to set, ${userInfo.name} realized this was just the beginning of many wonderful adventures.`,
        `Walking home, ${userInfo.name} felt grateful for new friends and exciting discoveries.`,
        `That night, ${userInfo.name} dreamed of tomorrow's possibilities.`,
        `The adventure had taught them that magic exists when you're open to friendship.`
      ],
      hard: [
        `${userInfo.name}, now ${userInfo.age} years old, had always been passionate about ${userInfo.hobbies}. Today felt different somehow.`,
        `While perfecting their ${userInfo.hobbies} technique, an unexpected challenge presented itself. A mysterious ${userInfo.favoriteColor} portal appeared.`,
        `Through the portal stepped a wise ${userInfo.favoriteAnimal} who spoke of ancient knowledge and hidden talents.`,
        `The ${userInfo.favoriteAnimal} explained that ${userInfo.name}'s dedication to ${userInfo.hobbies} had awakened something special within them.`,
        `Together, they embarked on a quest that would test not just ${userInfo.name}'s skills, but their character and determination.`,
        `The journey led through challenges that required creativity, courage, and the wisdom to know when to ask for help.`,
        `Along the way, they discovered that sharing ${userInfo.favoriteFood} and stories creates bonds stronger than any magic.`,
        `As they overcame each obstacle, ${userInfo.name} understood that growth comes from embracing both success and failure.`,
        `The ${userInfo.favoriteAnimal} revealed that the greatest adventure is the journey of becoming who you're meant to be.`,
        `Returning home, ${userInfo.name} carried new confidence and the knowledge that every ending is also a beginning.`,
        `The experience had transformed their understanding of ${userInfo.hobbies} from hobby to life philosophy.`
      ],
      expert: [
        `In the sophisticated landscape of ${userInfo.name}'s world, where ${userInfo.hobbies} served as both passion and metaphor, transformation awaited.`,
        `At ${userInfo.age}, ${userInfo.name} had transcended mere skill in ${userInfo.hobbies}, discovering it as a lens through which all of life's complexities could be examined.`,
        `The arrival of the enigmatic ${userInfo.favoriteColor} ${userInfo.favoriteAnimal} introduced philosophical dimensions that challenged everything ${userInfo.name} thought they understood.`,
        `Through a series of interconnected events, the ${userInfo.favoriteAnimal} guided ${userInfo.name} toward understanding the delicate balance between mastery and perpetual learning.`,
        `Each encounter revealed layers of meaning, where the simple act of sharing ${userInfo.favoriteFood} became a meditation on connection and vulnerability.`,
        `The narrative deepened as ${userInfo.name} grappled with abstract concepts made tangible through their practiced discipline of ${userInfo.hobbies}.`,
        `Wisdom emerged not from answers, but from learning to embrace the questions that ${userInfo.hobbies} and life itself presented.`,
        `The ${userInfo.favoriteAnimal} served as both mirror and guide, reflecting ${userInfo.name}'s growth while illuminating the path forward.`,
        `As understanding dawned, ${userInfo.name} recognized that every ending contains within it the seeds of infinite new beginnings.`,
        `The journey's conclusion revealed that mastery is not a destination but a continuous dance between knowledge and wonder.`,
        `In the quiet aftermath, ${userInfo.name} understood that ${userInfo.hobbies} had become a sacred practice, a way of being in the world.`,
        `The ${userInfo.favoriteAnimal} remained a cherished companion in the ongoing story of ${userInfo.name}'s evolution.`,
        `And so the cycle continued, each moment offering new opportunities for growth, discovery, and the profound joy of simply being alive.`
      ]
    };

    return {
      pages: fallbackStories[difficulty] || fallbackStories.easy,
      difficulty,
      title: `${userInfo.name}'s ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Adventure`,
      isComplete: true
    };
  }
}