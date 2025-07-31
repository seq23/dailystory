// Enhanced story generator with word limits for early readers
import type { UserInfo, DifficultyLevel } from "@/types";
import CulturalAdaptationService from "./culturalAdaptationService";

interface ReadingConfig {
  maxWordsPerPage: number;
  fontSize: string;
  lineHeight: string;
  spacing: string;
}

export class EarlyReaderStoryGenerator {
  
  // Configure reading experience by difficulty level (2 minutes reading per page)
  // Average reading speeds: PreK-1st: 20-50 WPM, 2nd-3rd: 80-120 WPM, 4th-5th: 140-160 WPM, 6th-12th: 200-300 WPM
  private static getReadingConfig(difficulty: DifficultyLevel): ReadingConfig {
    switch (difficulty) {
      case 'easy': // PreK-1st grade (Julia Donaldson, Mo Willems, Dr. Seuss, Kevin Henkes style)
        return {
          maxWordsPerPage: 6, // Very simple for early readers
          fontSize: 'text-5xl md:text-6xl lg:text-7xl', // Bigger text for early readers
          lineHeight: 'leading-relaxed',
          spacing: 'space-y-6'
        };
      case 'medium': // 2nd-3rd grade (Jeff Kinney, Roald Dahl, Dav Pilkey, Andrea Beaty style)
        return {
          maxWordsPerPage: 200, // ~2 min at 100 WPM average
          fontSize: 'text-2xl md:text-3xl lg:text-4xl',
          lineHeight: 'leading-normal',
          spacing: 'space-y-4'
        };
      case 'hard': // 4th-5th grade (Katherine Applegate, C.S. Lewis, J.K. Rowling style)
        return {
          maxWordsPerPage: 300, // ~2 min at 150 WPM average
          fontSize: 'text-xl md:text-2xl lg:text-3xl',
          lineHeight: 'leading-normal',
          spacing: 'space-y-3'
        };
      case 'expert': // 6th-12th grade (Sharon Creech, Louis Sachar, Suzanne Collins, John Green style)
        return {
          maxWordsPerPage: 500, // ~2 min at 250 WPM average
          fontSize: 'text-lg md:text-xl lg:text-2xl',
          lineHeight: 'leading-snug',
          spacing: 'space-y-2'
        };
    }
  }

  static generateStory(userInfo: UserInfo, difficulty: DifficultyLevel, pageCount: number = 10): {
    pages: string[];
    config: ReadingConfig;
  } {
    const config = this.getReadingConfig(difficulty);
    const characterName = userInfo.name?.trim() || 'Alex';
    const favoriteAnimal = userInfo.favoriteAnimal?.toLowerCase()?.trim() || 'cat';
    
    // Generate story content based on difficulty
    const storyContent = this.createStoryContent(characterName, favoriteAnimal, difficulty, userInfo);
    
    // Split into pages respecting word limits
    const pages = this.splitIntoPages(storyContent, config.maxWordsPerPage, pageCount);
    
    return { pages, config };
  }

  private static createStoryContent(
    characterName: string,
    favoriteAnimal: string,
    difficulty: DifficultyLevel,
    userInfo: UserInfo
  ): string {
    const culturalContext = CulturalAdaptationService.getCulturalContext(userInfo.nativeLanguage || 'en');
    
    switch (difficulty) {
      case 'easy':
        return this.createEasyStory(characterName, favoriteAnimal);
      case 'medium':
        return this.createMediumStory(characterName, favoriteAnimal, culturalContext);
      case 'hard':
        return this.createHardStory(characterName, favoriteAnimal, culturalContext);
      case 'expert':
        return this.createExpertStory(characterName, favoriteAnimal, culturalContext);
    }
  }

  private static createEasyStory(characterName: string, favoriteAnimal: string): string {
    // Create story with very short sentences for 6 words max per page
    return `${characterName} sees a ${favoriteAnimal}. The ${favoriteAnimal} is happy. ${characterName} smiles at ${favoriteAnimal}. They play together nicely. The ${favoriteAnimal} runs very fast. ${characterName} runs too quickly. They are best friends. The sun shines very bright. ${characterName} feels so happy. The ${favoriteAnimal} feels happy too.`;
  }

  private static createMediumStory(characterName: string, favoriteAnimal: string, culturalContext: any): string {
    const setting = culturalContext.settings[0] || 'park';
    return `${characterName} walked to the ${setting} on a sunny morning. A friendly ${favoriteAnimal} appeared from behind a tree. The ${favoriteAnimal} seemed lost and lonely. ${characterName} offered some food from their backpack. Together they explored the beautiful ${setting}. They discovered a hidden path filled with flowers. The ${favoriteAnimal} showed ${characterName} its favorite hiding spot. They became best friends and promised to meet again tomorrow.`;
  }

  private static createHardStory(characterName: string, favoriteAnimal: string, culturalContext: any): string {
    const setting = culturalContext.settings[0] || 'magical forest';
    const food = culturalContext.foods[0] || 'berries';
    return `${characterName} had always been curious about the mysterious ${setting} near their home. One afternoon, while exploring the winding paths, they encountered an extraordinary ${favoriteAnimal}. This wasn't an ordinary creature - it seemed to understand human emotions and possessed an unusual intelligence. The ${favoriteAnimal} led ${characterName} to a secret grove where magical ${food} grew. Through acts of kindness and courage, ${characterName} helped the ${favoriteAnimal} solve an ancient problem that had troubled the forest for generations. Their friendship became legendary among all the woodland creatures.`;
  }

  private static createExpertStory(characterName: string, favoriteAnimal: string, culturalContext: any): string {
    const setting = culturalContext.settings[0] || 'enchanted realm';
    const celebration = culturalContext.celebrations[0] || 'Festival of Lights';
    return `${characterName} possessed an extraordinary gift that few understood - the ability to communicate with animals through empathy and intuition. When a magnificent ${favoriteAnimal} appeared during the ${celebration}, speaking in urgent whispers that only ${characterName} could comprehend, everything changed. The ${favoriteAnimal} revealed that ${characterName}'s unique talent was needed to prevent an ancient curse from befalling the ${setting}. Together, they embarked on a perilous journey through mystical landscapes, facing challenges that tested not only their courage but also their faith in each other. Through wisdom, determination, and the unbreakable bond of true friendship, they ultimately restored harmony to their world and discovered that the greatest magic lies in understanding and compassion.`;
  }

  private static splitIntoPages(text: string, maxWordsPerPage: number, targetPageCount: number): string[] {
    // Split by sentence boundaries while preserving punctuation
    const sentences = text.match(/[^.!?]*[.!?]+/g) || [text];
    const pages: string[] = [];
    let currentPage = '';
    let currentWordCount = 0;

    for (const sentence of sentences) {
      const words = sentence.trim().split(/\s+/);
      
      // If adding this sentence would exceed word limit, start new page
      if (currentWordCount > 0 && currentWordCount + words.length > maxWordsPerPage) {
        if (currentPage.trim()) {
          pages.push(currentPage.trim());
        }
        currentPage = sentence.trim();
        currentWordCount = words.length;
      } else {
        // Add sentence to current page
        if (currentPage) {
          currentPage += ' ' + sentence.trim();
        } else {
          currentPage = sentence.trim();
        }
        currentWordCount += words.length;
      }
    }

    // Add final page if there's content
    if (currentPage.trim()) {
      pages.push(currentPage.trim());
    }

    // Ensure we have enough pages by extending if needed
    while (pages.length < targetPageCount && pages.length > 0) {
      const lastPage = pages[pages.length - 1];
      if (lastPage.includes('.')) {
        const parts = lastPage.split('.');
        if (parts.length > 2) {
          // Split the last page into two
          const mid = Math.ceil(parts.length / 2);
          const firstHalf = parts.slice(0, mid).join('.') + '.';
          const secondHalf = parts.slice(mid).join('.') + '.';
          pages[pages.length - 1] = firstHalf;
          pages.push(secondHalf);
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return pages.slice(0, targetPageCount);
  }

  static getReadingConfigForDifficulty(difficulty: DifficultyLevel): ReadingConfig {
    return this.getReadingConfig(difficulty);
  }
}