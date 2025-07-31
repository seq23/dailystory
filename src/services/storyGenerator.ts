// Centralized story generation service that coordinates all story generators
import { EarlyReaderStoryGenerator } from "./earlyReaderStoryGenerator";
import { ImprovedStoryGenerator } from "./improvedStoryGenerator";
import InclusiveStoryGenerator from "./inclusiveStoryGenerator";
import type { UserInfo, DifficultyLevel } from "@/types";

export class StoryGeneratorService {
  /**
   * Main story generation method with word limits for early readers
   */
  static async generateStory(
    userInfo: UserInfo, 
    difficulty: DifficultyLevel, 
    pageCount: number = 10
  ): Promise<{ pages: string[]; config: any }> {
    try {
      console.log(`Generating word-limited story for difficulty: ${difficulty}`);
      
      // Primary: Use early reader generator for optimal word limits
      const result = EarlyReaderStoryGenerator.generateStory(userInfo, difficulty, pageCount);
      
      if (result.pages && result.pages.length > 0) {
        console.log(`Successfully generated ${result.pages.length} pages with word limits`);
        return result;
      }
      
      throw new Error('Early reader generator returned empty story');
      
    } catch (error) {
      console.warn('Early reader generator failed, using fallback:', error);
      
      try {
        // Fallback: Use improved story generator and split into word-limited pages
        const fallbackStory = ImprovedStoryGenerator.generateStory(userInfo, difficulty, pageCount);
        const config = EarlyReaderStoryGenerator.getReadingConfigForDifficulty(difficulty);
        
        if (fallbackStory && fallbackStory.length > 0) {
          console.log(`Successfully generated ${fallbackStory.length} pages with fallback generator`);
          return { pages: fallbackStory, config };
        }
        
        throw new Error('Fallback generator returned empty story');
        
      } catch (fallbackError) {
        console.error('Both story generators failed:', fallbackError);
        
        // Last resort: Return a simple default story with config
        const defaultStory = this.getDefaultStory(userInfo, difficulty);
        const config = EarlyReaderStoryGenerator.getReadingConfigForDifficulty(difficulty);
        return { pages: defaultStory, config };
      }
    }
  }
  
  /**
   * Default story as last resort
   */
  private static getDefaultStory(userInfo: UserInfo, difficulty: DifficultyLevel): string[] {
    const name = userInfo.name || 'Alex';
    const animal = userInfo.favoriteAnimal || 'cat';
    
    const stories = {
      easy: [
        `${name} woke up on a sunny morning.`,
        `${name} saw a friendly ${animal} in the garden.`,
        `They played together happily.`,
        `${name} gave the ${animal} some food.`,
        `They became best friends forever.`
      ],
      medium: [
        `${name} discovered something magical in the backyard.`,
        `A beautiful ${animal} was waiting by the old oak tree.`,
        `The ${animal} seemed to be trying to tell ${name} something important.`,
        `Together, they explored the hidden path behind the garden.`,
        `${name} and the ${animal} found a wonderful secret that made them both very happy.`
      ],
      hard: [
        `${name} had always been curious about the mysterious sounds coming from the forest.`,
        `One afternoon, while exploring, ${name} encountered an extraordinary ${animal}.`,
        `This wasn't an ordinary ${animal} - it had an important message to share.`,
        `The ${animal} led ${name} on an adventure through places they had never seen before.`,
        `Through courage and kindness, ${name} helped solve an ancient mystery and made a lifelong friend.`
      ],
      expert: [
        `${name} had always possessed an unusual ability to understand animals, though no one believed it.`,
        `When a remarkable ${animal} appeared at their doorstep speaking in urgent whispers, everything changed.`,
        `The ${animal} revealed that ${name}'s unique gift was needed to prevent a great catastrophe.`,
        `Together, they embarked on a perilous journey through enchanted realms and faced numerous challenges.`,
        `Through wisdom, bravery, and the power of friendship, ${name} and the ${animal} saved their world and discovered the true meaning of heroism.`
      ]
    };
    
    return stories[difficulty] || stories.easy;
  }
}