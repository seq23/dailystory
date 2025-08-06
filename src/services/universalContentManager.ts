import { UserInfo, Story, DifficultyLevel } from "@/types";
import { SessionPageTracker } from "./sessionPageTracker";
import { SimplifiedTemplateManager } from "./simplifiedTemplateManager";
import { SimplifiedLevel0Processor } from "@/services/simplifiedLevel0Processor";
import { DifficultyManager } from "./difficultyManager";
import { TemplateDebugger } from "./templateDebugger";

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
    console.log('🎯 UniversalContentManager: === STORY GENERATION START ===');
    console.log(`📋 UniversalContentManager: Requested difficulty: ${difficulty}`);
    
    // Debug difficulty assignment
    DifficultyManager.debugDifficultyState(userInfo);
    
    // Check if this difficulty supports author voice
    const hasAuthorVoice = DifficultyManager.hasAuthorVoice(difficulty);
    console.log(`🌟 Author voice available for ${difficulty}: ${hasAuthorVoice}`);
    
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
    
    try {
      let story: Story;
      
      // Use simplified processors for reliable story generation
      if (difficulty === 'beginner') {
        console.log('🎯 Level 0 Story Generation: Using SimplifiedLevel0Processor (NO AUTHOR VOICE)');
        TemplateDebugger.logTemplateUsage({
          manager: 'UniversalContentManager->Level0',
          difficulty: 'beginner',
          templateIndex: -1,
          templatePreview: 'Level 0 routing',
          userName: userInfo?.name,
          phase: 'routing_to_level0'
        });
        story = await this.generateLevel0Story(userInfo, config.isPremium);
      } else {
        console.log(`🎯 ${difficulty} Story Generation: Using SimplifiedTemplateManager (WITH AUTHOR VOICE)`);
        TemplateDebugger.logTemplateUsage({
          manager: 'UniversalContentManager->Simplified',
          difficulty,
          templateIndex: -1,
          templatePreview: 'Higher level routing',
          userName: userInfo?.name,
          phase: `routing_to_${difficulty}`
        });
        const result = await SimplifiedTemplateManager.generateStory({
          userInfo,
          difficulty,
          isPremium: config.isPremium
        });
        
        story = {
          id: crypto.randomUUID(),
          title: this.generateTitle(difficulty, userInfo),
          segments: result.pages.map(text => ({
            text,
            illustration: undefined,
            audioUrl: undefined
          })),
          difficulty,
          estimatedReadingTime: Math.max(1, Math.ceil(result.pages.length / 3)),
          wordCount: result.pages.join(' ').split(' ').filter(word => word.trim()).length
        };
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
    // Reset page tracker for new story session
    SessionPageTracker.resetSession();
    const result = await this.generateStory(userInfo, difficulty, config);
    return result.story;
  }

  static async continueExistingStory(
    currentStory: string[],
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    config: ContentManagerConfig
  ): Promise<Story> {
    console.log(`🔄 Continuing existing story for ${userInfo.name} at ${difficulty} level`);
    
    try {
      let continuationPages: string[];
      
      // Check session page limit using SessionPageTracker
      const pageInfo = SessionPageTracker.getPageInfo();
      if (pageInfo.hasReachedLimit) {
        throw new FreeTrialPageLimitError(
          `Free trial limit of ${pageInfo.maxPages} pages reached`,
          pageInfo.pagesViewed,
          pageInfo.maxPages,
          'Upgrade to premium for unlimited reading!'
        );
      }
      
      // Use consistent 5-page continuation for all levels
      if (difficulty === 'beginner') {
        console.log('🔄 Level 0 Continuation: Using SimplifiedLevel0Processor.continueStory()');
        const level0Result = await SimplifiedLevel0Processor.continueStory(userInfo, config.isPremium, 5);
        continuationPages = level0Result.content;
      } else {
        console.log(`🔄 ${difficulty} Continuation: Using SimplifiedTemplateManager.continueStory()`);
        const result = await SimplifiedTemplateManager.continueStory({
          userInfo,
          difficulty,
          isPremium: config.isPremium,
          targetPages: 5
        });
        
        continuationPages = result.pages;
      }

      // Combine existing story with continuation (exactly 5 new pages)
      const combinedSegments = [
        ...currentStory.map(text => ({ text, illustration: undefined, audioUrl: undefined })),
        ...continuationPages.map(text => ({ text, illustration: undefined, audioUrl: undefined }))
      ];

      return {
        id: `story-${Date.now()}`,
        title: `${userInfo.name}'s Adventure Continues`,
        segments: combinedSegments,
        difficulty: difficulty,
        estimatedReadingTime: Math.ceil(combinedSegments.length / 4),
        wordCount: combinedSegments.reduce((count, segment) => 
          count + segment.text.split(' ').filter(word => word.trim()).length, 0
        )
      };
    } catch (error) {
      console.error('Story continuation failed, falling back to new story:', error);
      // Fallback to generating a new story
      const result = await this.generateStory(userInfo, difficulty, config);
      return result.story;
    }
  }

  private static async generateLevel0Story(
    userInfo: UserInfo,
    isPremium: boolean
  ): Promise<Story> {
    console.log(`🎯 Level 0 Story Generation: Using specialized Level0StoryProcessor for ${userInfo.name}`);

    try {
      const result = await SimplifiedLevel0Processor.generateStory(userInfo, isPremium);
      
      // Determine page count based on premium status
      const pageCount = isPremium ? 25 : 5;
      
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
      return this.generateLevel0Fallback(userInfo, isPremium ? 25 : 5);
    }
  }

  // Fallback methods for error scenarios
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

  private static generateTitle(difficulty: DifficultyLevel, userInfo: UserInfo): string {
    const name = userInfo.name;
    switch (difficulty) {
      case 'easy': return `${name}'s First Adventure`;
      case 'medium': return `${name}'s Exciting Day`;
      case 'hard': return this.generateAdvancedTitle(userInfo);
      case 'expert': return this.generateExpertTitle(userInfo);
      default: return `${name}'s Story`;
    }
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
}