import { UserInfo, Story, DifficultyLevel } from "@/types";
import { validateLevel1Sentence } from "@/constants/gradeBased/level1Vocabulary";
import { Level1Simplifier } from "./level1Simplifier";
import { Level0Simplifier } from "./level0Simplifier";
import { Level3Simplifier } from "./level3Simplifier";
import { StoryQualityChecker } from "@/utils/storyQualityChecker";
import { Level0StoryProcessor } from "@/services/level0StoryProcessor";
import { NameFormatter } from "@/utils/nameFormatter";
import { getTemplateByGradeLevel } from "@/constants/gradeBased/unifiedTemplateSystem";
import { SessionPageTracker } from "./sessionPageTracker";

// Define custom error classes
class StoryGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StoryGenerationError';
    Object.setPrototypeOf(this, StoryGenerationError.prototype);
  }
}

class TemplateNotFoundError extends StoryGenerationError {
  constructor(message: string) {
    super(message);
    this.name = 'TemplateNotFoundError';
    Object.setPrototypeOf(this, TemplateNotFoundError.prototype);
  }
}

class ContentValidationError extends StoryGenerationError {
  constructor(message: string) {
    super(message);
    this.name = 'ContentValidationError';
    Object.setPrototypeOf(this, ContentValidationError.prototype);
  }
}

export class FreeTrialPageLimitError extends StoryGenerationError {
  public totalPages: number;
  public maxFreePages: number;
  public upgradeMessage: string;

  constructor(message: string, totalPages: number, maxFreePages: number, upgradeMessage: string) {
    super(message);
    this.name = 'FreeTrialPageLimitError';
    this.totalPages = totalPages;
    this.maxFreePages = maxFreePages;
    this.upgradeMessage = upgradeMessage;
    Object.setPrototypeOf(this, FreeTrialPageLimitError.prototype);
  }
}

export class PremiumPageLimitError extends StoryGenerationError {
  public totalPages: number;
  public maxPages: number;

  constructor(message: string, totalPages: number, maxPages: number) {
    super(message);
    this.name = 'PremiumPageLimitError';
    this.totalPages = totalPages;
    this.maxPages = maxPages;
    Object.setPrototypeOf(this, PremiumPageLimitError.prototype);
  }
}

interface GeneratedContent {
  pageNumber: number;
  content: string;
  illustration?: string;
}

interface ContentManagerConfig {
  isPremium: boolean;
  userId: string;
}

interface StoryGenerationResult {
  story: Story;
  sessionInfo?: any;
}

export class UniversalContentManager {
  static async generateStory(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    config: ContentManagerConfig
  ): Promise<StoryGenerationResult> {
    console.log(`🎯 UniversalContentManager: Starting story generation for ${difficulty} level`);
    
    // Check session page limit for free users
    if (!config.isPremium) {
      const pageInfo = SessionPageTracker.getPageInfo();
      if (pageInfo.hasReachedLimit) {
        throw new FreeTrialPageLimitError(
          `Free trial limit of ${pageInfo.maxPages} pages reached`,
          pageInfo.pagesViewed,
          pageInfo.maxPages,
          `You've explored ${pageInfo.maxPages} pages in this session! Upgrade to premium for unlimited reading.`
        );
      }
    }
    
    const pageCount = this.getPageCountForDifficulty(difficulty, config.isPremium);
    
    try {
      let story: Story;
      
      // Route to appropriate grade-based system
      if (difficulty === 'beginner') {
        console.log('🎯 Level 0 Story Generation: Using grade-based Level 0 system');
        story = await this.generateLevel0Story(userInfo, pageCount);
      } else if (difficulty === 'easy') {
        console.log('🎯 Level 1 Story Generation: Using grade-based Level 1 system');
        story = await this.generateLevel1Story(userInfo, pageCount, config);
      } else if (difficulty === 'medium') {
        console.log('🎯 Level 2 Story Generation: Using grade-based Level 2 system');
        story = await this.generateLevel2Story(userInfo, pageCount, config);
      } else if (difficulty === 'hard') {
        console.log('🎯 Level 3 Story Generation: Using grade-based Level 3 system');
        story = await this.generateLevel3Story(userInfo, pageCount, config);
      } else if (difficulty === 'expert') {
        console.log('🎯 Level 4 Story Generation: Using grade-based Level 4 system');
        story = await this.generateLevel4Story(userInfo, pageCount, config);
      } else {
        throw new Error(`Unsupported difficulty level: ${difficulty}`);
      }
      
      return { story };
      
    } catch (error) {
      console.error('Story generation failed:', error);
      throw error;
    }
  }

  static async generateNewStoryWithAntiRepetition(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    config: ContentManagerConfig
  ): Promise<Story> {
    const result = await this.generateStory(userInfo, difficulty, config);
    return result.story;
  }

  static async continueExistingStory(
    currentStory: string[],
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    config: ContentManagerConfig
  ): Promise<Story> {
    // For now, just generate a new story - continuation logic can be added later
    const result = await this.generateStory(userInfo, difficulty, config);
    return result.story;
  }

  private static async generateLevel0Story(
    userInfo: UserInfo,
    pageCount: number,
  ): Promise<Story> {
    console.log(`🎯 Level 0 Story Generation: Commencing ultra-simple story for ${userInfo.name}`);

    try {
      const result = await Level0StoryProcessor.generateStory(userInfo);
      
      // Convert Level0StoryResult to Story format
      const story: Story = {
        id: crypto.randomUUID(),
        title: `${userInfo.name}'s Simple Story`,
        segments: result.content.slice(0, pageCount).map(text => ({
          text,
          illustration: undefined,
          audioUrl: undefined
        })),
        difficulty: 'beginner',
        estimatedReadingTime: Math.max(1, Math.ceil(pageCount / 4)),
        wordCount: result.content.slice(0, pageCount).join(' ').split(' ').filter(word => word.trim()).length
      };
      
      console.log(`✅ Generated Level 0 story with ${story.segments.length} pages`);
      return story;
    } catch (error) {
      console.error('Level 0 story generation failed:', error);
      return this.generateLevel0Fallback(userInfo, pageCount);
    }
  }

  private static async generateLevel1Story(
    userInfo: UserInfo,
    pageCount: number,
    config: ContentManagerConfig
  ): Promise<Story> {
    console.log(`🎯 Level 1 Story Generation: Starting easy story for ${userInfo.name}`);

    try {
      const gradeLevel = 1;
      const template = getTemplateByGradeLevel(gradeLevel, undefined, config.isPremium);

      if (!template || template.length === 0) {
        throw new Error('No Level 1 templates available');
      }

      const processedPages = template.slice(0, pageCount).map(page => {
        let processed = page.replace(/{userName}/g, NameFormatter.capitalize(userInfo.name));

        const validation = validateLevel1Sentence(processed, userInfo.name);
        if (!validation.isValid) {
          const simplificationResult = Level1Simplifier.simplifyForLevel1(processed, userInfo.name);
          processed = simplificationResult.text;
        }

        return processed;
      });

      while (processedPages.length < pageCount && template.length > 0) {
        const extraPage = template[processedPages.length % template.length];
        let processed = extraPage.replace(/{userName}/g, NameFormatter.capitalize(userInfo.name));

        const validation = validateLevel1Sentence(processed, userInfo.name);
        if (!validation.isValid) {
          const simplificationResult = Level1Simplifier.simplifyForLevel1(processed, userInfo.name);
          processed = simplificationResult.text;
        }

        processedPages.push(processed);
      }

      const story: Story = {
        id: crypto.randomUUID(),
        title: `${userInfo.name}'s First Adventure`,
        segments: processedPages.map(text => ({
          text,
          illustration: undefined,
          audioUrl: undefined
        })),
        difficulty: 'easy',
        estimatedReadingTime: Math.max(1, Math.ceil(processedPages.length / 3)),
        wordCount: processedPages.join(' ').split(' ').filter(word => word.trim()).length
      };

      console.log(`✅ Generated Level 1 story with ${story.segments.length} pages`);
      return story;

    } catch (error) {
      console.error('Error generating Level 1 story:', error);
      return this.generateLevel1Fallback(userInfo, pageCount);
    }
  }

  private static async generateLevel2Story(
    userInfo: UserInfo,
    pageCount: number,
    config: ContentManagerConfig
  ): Promise<Story> {
    console.log(`🎯 Level 2 Story Generation: Starting medium story for ${userInfo.name}`);

    try {
      const gradeLevel = 2;
      const template = getTemplateByGradeLevel(gradeLevel, undefined, config.isPremium);

      if (!template || template.length === 0) {
        throw new Error('No Level 2 templates available');
      }

      const processedPages = template.slice(0, pageCount).map(page => {
        return page.replace(/{userName}/g, NameFormatter.capitalize(userInfo.name));
      });

      while (processedPages.length < pageCount && template.length > 0) {
        const extraPage = template[processedPages.length % template.length];
        processedPages.push(extraPage.replace(/{userName}/g, NameFormatter.capitalize(userInfo.name)));
      }

      const story: Story = {
        id: crypto.randomUUID(),
        title: `${userInfo.name}'s Exciting Day`,
        segments: processedPages.map(text => ({
          text,
          illustration: undefined,
          audioUrl: undefined
        })),
        difficulty: 'medium',
        estimatedReadingTime: Math.max(2, Math.ceil(processedPages.length / 2)),
        wordCount: processedPages.join(' ').split(' ').filter(word => word.trim()).length
      };

      console.log(`✅ Generated Level 2 story with ${story.segments.length} pages`);
      return story;

    } catch (error) {
      console.error('Error generating Level 2 story:', error);
      return this.generateLevel2Fallback(userInfo, pageCount);
    }
  }

  private static async generateLevel3Story(
    userInfo: UserInfo,
    pageCount: number,
    config: ContentManagerConfig
  ): Promise<Story> {
    console.log(`🎯 Level 3 Story Generation: Advanced content for ${userInfo.name}`);
    
    try {
      const gradeLevel = 3;
      const template = getTemplateByGradeLevel(gradeLevel, undefined, config.isPremium);
      
      if (!template || template.length === 0) {
        throw new Error('No Level 3 templates available');
      }

      // Process template with proper variable substitution
      const processedPages = template.slice(0, pageCount).map(page => {
        let processed = page.replace(/{userName}/g, NameFormatter.capitalize(userInfo.name));
        
        // Apply Level 3 vocabulary compliance and simplification
        const simplificationResult = Level3Simplifier.simplifyForLevel3(processed, userInfo.name);
        return simplificationResult.text;
      });

      // Ensure we have enough pages
      while (processedPages.length < pageCount && template.length > 0) {
        const extraPage = template[processedPages.length % template.length];
        let processed = extraPage.replace(/{userName}/g, NameFormatter.capitalize(userInfo.name));
        const simplificationResult = Level3Simplifier.simplifyForLevel3(processed, userInfo.name);
        processedPages.push(simplificationResult.text);
      }

      const story: Story = {
        id: crypto.randomUUID(),
        title: this.generateAdvancedTitle(userInfo),
        segments: processedPages.map(text => ({
          text,
          illustration: undefined,
          audioUrl: undefined
        })),
        difficulty: 'hard',
        estimatedReadingTime: Math.max(2, Math.ceil(processedPages.length / 2)),
        wordCount: processedPages.join(' ').split(' ').filter(word => word.trim()).length
      };

      console.log(`✅ Generated Level 3 story with ${story.segments.length} pages`);
      return story;
      
    } catch (error) {
      console.error('Error generating Level 3 story:', error);
      return this.generateLevel3Fallback(userInfo, pageCount);
    }
  }

  private static async generateLevel4Story(
    userInfo: UserInfo,
    pageCount: number,
    config: ContentManagerConfig
  ): Promise<Story> {
    console.log(`🎯 Level 4 Story Generation: Expert content for ${userInfo.name}`);
    
    try {
      const gradeLevel = 4;
      const template = getTemplateByGradeLevel(gradeLevel, undefined, config.isPremium);
      
      if (!template || template.length === 0) {
        throw new Error('No Level 4 templates available');
      }

      const processedPages = template.slice(0, pageCount).map(page => {
        return page.replace(/{userName}/g, NameFormatter.capitalize(userInfo.name));
      });

      while (processedPages.length < pageCount && template.length > 0) {
        const extraPage = template[processedPages.length % template.length];
        processedPages.push(extraPage.replace(/{userName}/g, NameFormatter.capitalize(userInfo.name)));
      }

      const story: Story = {
        id: crypto.randomUUID(),
        title: this.generateExpertTitle(userInfo),
        segments: processedPages.map(text => ({
          text,
          illustration: undefined,
          audioUrl: undefined
        })),
        difficulty: 'expert',
        estimatedReadingTime: Math.max(3, Math.ceil(processedPages.length / 2)),
        wordCount: processedPages.join(' ').split(' ').filter(word => word.trim()).length
      };

      console.log(`✅ Generated Level 4 story with ${story.segments.length} pages`);
      return story;
      
    } catch (error) {
      console.error('Error generating Level 4 story:', error);
      return this.generateLevel4Fallback(userInfo, pageCount);
    }
  }

  private static generateLevel0Fallback(userInfo: UserInfo, pageCount: number): Story {
    const fallbackPages = [
      `${userInfo.name} sees a cat.`,
      `The cat is big.`,
      `${userInfo.name} pets the cat.`,
      `The cat is happy.`,
      `${userInfo.name} is happy too.`
    ];

    return {
      id: crypto.randomUUID(),
      title: `${userInfo.name} and the Cat`,
      segments: fallbackPages.slice(0, pageCount).map(text => ({
        text,
        illustration: undefined,
        audioUrl: undefined
      })),
      difficulty: 'beginner',
      estimatedReadingTime: Math.max(1, Math.ceil(pageCount / 4)),
      wordCount: fallbackPages.slice(0, pageCount).join(' ').split(' ').filter(word => word.trim()).length
    };
  }

  private static generateLevel1Fallback(userInfo: UserInfo, pageCount: number): Story {
    const fallbackPages = [
      `${userInfo.name} went to the park.`,
      `It was a sunny day.`,
      `${userInfo.name} played with friends.`,
      `They had lots of fun.`,
      `${userInfo.name} went home happy.`
    ];

    return {
      id: crypto.randomUUID(),
      title: `${userInfo.name}'s Day at the Park`,
      segments: fallbackPages.slice(0, pageCount).map(text => ({
        text,
        illustration: undefined,
        audioUrl: undefined
      })),
      difficulty: 'easy',
      estimatedReadingTime: Math.max(1, Math.ceil(pageCount / 3)),
      wordCount: fallbackPages.slice(0, pageCount).join(' ').split(' ').filter(word => word.trim()).length
    };
  }

  private static generateLevel2Fallback(userInfo: UserInfo, pageCount: number): Story {
    const fallbackPages = [
      `${userInfo.name} visited a museum.`,
      `There were many interesting exhibits.`,
      `${userInfo.name} learned about history.`,
      `A friendly guide shared fascinating stories.`,
      `${userInfo.name} left with new knowledge.`
    ];

    return {
      id: crypto.randomUUID(),
      title: `${userInfo.name}'s Museum Visit`,
      segments: fallbackPages.slice(0, pageCount).map(text => ({
        text,
        illustration: undefined,
        audioUrl: undefined
      })),
      difficulty: 'medium',
      estimatedReadingTime: Math.max(2, Math.ceil(pageCount / 2)),
      wordCount: fallbackPages.slice(0, pageCount).join(' ').split(' ').filter(word => word.trim()).length
    };
  }

  private static generateLevel3Fallback(userInfo: UserInfo, pageCount: number): Story {
    const fallbackPages = [
      `${userInfo.name} discovered an ancient archaeological site containing mysterious artifacts.`,
      `The research team uncovered evidence of advanced civilizations that challenged historical understanding.`,
      `Complex scientific instruments revealed fascinating data about environmental conservation efforts.`,
      `${userInfo.name} analyzed the sophisticated technology that previous cultures had developed.`,
      `The expedition concluded with groundbreaking discoveries that would advance scientific knowledge.`
    ];

    return {
      id: crypto.randomUUID(),
      title: `${userInfo.name}'s Archaeological Discovery`,
      segments: fallbackPages.slice(0, pageCount).map(text => ({
        text,
        illustration: undefined,
        audioUrl: undefined
      })),
      difficulty: 'hard',
      estimatedReadingTime: Math.max(2, Math.ceil(pageCount / 2)),
      wordCount: fallbackPages.slice(0, pageCount).join(' ').split(' ').filter(word => word.trim()).length
    };
  }

  private static generateLevel4Fallback(userInfo: UserInfo, pageCount: number): Story {
    const fallbackPages = [
      `${userInfo.name} embarked on an extraordinary intellectual journey exploring philosophical complexities.`,
      `Sophisticated theoretical frameworks challenged conventional perspectives about consciousness and existence.`,
      `Advanced interdisciplinary research methodologies revealed profound insights about human nature.`,
      `${userInfo.name} synthesized complex knowledge from multiple academic disciplines and cultural traditions.`,
      `The comprehensive analysis culminated in transformative understanding of universal principles.`
    ];

    return {
      id: crypto.randomUUID(),
      title: `${userInfo.name}'s Philosophical Journey`,
      segments: fallbackPages.slice(0, pageCount).map(text => ({
        text,
        illustration: undefined,
        audioUrl: undefined
      })),
      difficulty: 'expert',
      estimatedReadingTime: Math.max(3, Math.ceil(pageCount / 2)),
      wordCount: fallbackPages.slice(0, pageCount).join(' ').split(' ').filter(word => word.trim()).length
    };
  }

  private static generateAdvancedTitle(userInfo: UserInfo): string {
    const titles = [
      `${userInfo.name}'s Scientific Discovery`,
      `${userInfo.name} and the Archaeological Mystery`,
      `${userInfo.name}'s Environmental Research`,
      `${userInfo.name}'s Laboratory Adventure`
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  private static generateExpertTitle(userInfo: UserInfo): string {
    const titles = [
      `${userInfo.name}'s Philosophical Journey`,
      `${userInfo.name} and the Universal Principles`,
      `${userInfo.name}'s Intellectual Expedition`,
      `${userInfo.name}'s Theoretical Discovery`
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  private static getPageCountForDifficulty(difficulty: DifficultyLevel, isPremium: boolean): number {
    // Updated page counts - 5 pages initial, but session allows up to 90 total pages for free
    if (!isPremium) {
      return 5; // Start with 5 pages, session tracker manages the 90-page limit
    }
    
    // Premium page counts by level
    switch (difficulty) {
      case 'beginner': return 5;  // Level 0
      case 'easy': return 5;      // Level 1  
      case 'medium': return 10;   // Level 2
      case 'hard': return 10;     // Level 3
      case 'expert': return 15;   // Level 4
      default: return 5;
    }
  }
}