
import { UserInfo, DifficultyLevel } from '@/types';

export const generateStory = async (
  userInfo: UserInfo, 
  difficultyLevel: DifficultyLevel
): Promise<string[]> => {
  try {
    // Simple story generation - this would be replaced with actual API calls
    const storyPages = [
      `Once upon a time, there was a ${userInfo.age}-year-old named ${userInfo.name} who loved ${userInfo.favoriteColor} and ${userInfo.favoriteAnimal}s.`,
      `${userInfo.name} went on an amazing adventure in a magical land filled with ${userInfo.favoriteColor} flowers.`,
      `Along the way, ${userInfo.name} met a friendly ${userInfo.favoriteAnimal} who became their best friend.`,
      `Together, they discovered a secret garden where all the ${userInfo.favoriteFood} grew on special trees.`,
      `${userInfo.name} and their new friend had the most wonderful day exploring and playing together.`,
      `When it was time to go home, ${userInfo.name} promised to visit the magical land again soon.`,
      `And they all lived happily ever after. The End.`
    ];
    
    return storyPages;
  } catch (error) {
    console.error('Story generation failed:', error);
    throw error;
  }
};
