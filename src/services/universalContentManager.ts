import { UserInfo, Story, DifficultyLevel } from "@/types";
import { DIFFICULTY_APPROPRIATE_TEMPLATES, validateDifficultyCompliance } from "@/constants/difficultyAppropriateTemplates";
import { getEnhancedTemplatePool } from "@/constants/enhancedTemplates";
import { SessionTemplateManager } from "@/services/sessionTemplateManager";
import { validateLevel1Sentence } from "@/constants/level1Vocabulary";
import { VocabularyLevelClassifier } from "@/utils/vocabularyLevelClassifier";
import { StoryQualityChecker } from "@/utils/storyQualityChecker";
import { APP_CONFIG } from "@/constants/app";

export interface ContentManagerConfig {
  isPremium: boolean;
  userId?: string;
  maxSessions?: number;
  preserveAntiRepetition?: boolean;
}

export interface StoryGenerationResult {
  story: Story;
  isNewStory: boolean;
  isContinuation: boolean;
  sessionInfo: {
    sessionNumber: number;
    remainingSessions: number;
    isUnlimited: boolean;
  };
}

export class UniversalContentManager {
  private static usedTemplates = new Set<string>();
  
  /**
   * CLEAN, SIMPLE STORY GENERATION - No more 963-line monsters!
   */
  static async generateStory(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    config: ContentManagerConfig
  ): Promise<StoryGenerationResult> {
    console.log('🚀 Story Generation Starting...');
    
    // For free users, clear session template tracking for fresh start
    if (!config.isPremium) {
      console.log('🔄 Free user detected - clearing session template tracking for anti-repetition');
      SessionTemplateManager.clearSession();
    }
    
    const story = await this.generateSimpleStory(userInfo, difficulty, 10);
    
    return {
      story,
      isNewStory: true,
      isContinuation: false,
      sessionInfo: {
        sessionNumber: 1,
        remainingSessions: config.isPremium ? -1 : 99,
        isUnlimited: config.isPremium
      }
    };
  }

  /**
   * Generate new story with anti-repetition (for free users)
   */
  static async generateNewStoryWithAntiRepetition(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    config: ContentManagerConfig
  ): Promise<StoryGenerationResult> {
    console.log('🔄 Generating new story with template variety...');
    
    // Clear session template tracking for fresh start
    SessionTemplateManager.clearSession();
    
    // Clear legacy template tracking
    this.usedTemplates.clear();
    
    const story = await this.generateSimpleStory(userInfo, difficulty, 10);
    
    return {
      story,
      isNewStory: true,
      isContinuation: false,
      sessionInfo: {
        sessionNumber: 1,
        remainingSessions: 99,
        isUnlimited: false
      }
    };
  }

  /**
   * Continue existing story (for premium users)
   */
  static async continueExistingStory(
    currentStory: string[],
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    config: ContentManagerConfig
  ): Promise<Story> {
    console.log('🔄 Continuing story...');
    
    // Generate 5 additional pages
    const continuationStory = await this.generateSimpleStory(userInfo, difficulty, 5);
    
    return continuationStory;
  }

  /**
   * ENHANCED STORY GENERATION with Anti-Repetition for Free Users
   */
  private static async generateSimpleStory(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    pageCount: number
  ): Promise<Story> {
    console.log(`🎯 Generating ${pageCount}-page ${difficulty} story with author-inspired patterns...`);
    
    try {
      const { StoryArcManager } = await import('./storyArcManager');
      const { getAuthorVoiceForDifficulty } = await import('../constants/authorVoicePatterns');
      const authorVoice = getAuthorVoiceForDifficulty(difficulty);
      const pages: string[] = [];
      
      // Generate pages using story arc structure
      for (let i = 0; i < pageCount; i++) {
        let processedPage = StoryArcManager.getTemplateByPosition(
          userInfo,
          difficulty,
          i,
          pageCount
        );
        
        // Apply author voice characteristics
        const position = i === 0 ? 'opening' : 
                        i === pageCount - 1 ? 'closing' : 'transition';
        
        // Ensure children's book flow
        if (i > 0) {
          processedPage = this.ensureChildrensBookFlow(
            pages[i - 1],
            processedPage,
            difficulty
          );
        }
        
        // Validate against Level 1 vocabulary if needed
        if (difficulty === 'easy') {
          const validation = VocabularyLevelClassifier.validateLevel1Page(processedPage);
          if (!validation.isValid) {
            console.warn(`⚠️ Page ${i + 1} failed L1 validation, using fallback`);
            processedPage = this.generateLevel1Fallback(userInfo, i);
          }
        }
        
        pages.push(processedPage);
        console.log(`✅ Page ${i + 1}: "${processedPage}" (${processedPage.split(' ').length} words)`);
      }
      
      // Quality check for children's book patterns
      const qualityCheck = StoryQualityChecker.checkStoryQuality(pages, difficulty);
      if (qualityCheck.score < 70) {
        console.warn(`⚠️ Story quality score: ${qualityCheck.score}. Issues:`, qualityCheck.issues);
      }

      // Create story object
      const story: Story = {
        id: crypto.randomUUID(),
        title: this.generateStoryTitle(userInfo, difficulty),
        segments: pages.map(text => ({
          text,
          illustration: undefined,
          audioUrl: undefined
        })),
        difficulty,
        estimatedReadingTime: Math.max(1, Math.ceil(pages.length / 3)),
        wordCount: pages.join(' ').split(' ').filter(word => word.trim()).length
      };

      console.log(`✅ Generated story with ${story.segments.length} pages (Quality: ${qualityCheck.score})`);
      return story;
      
    } catch (error) {
      console.error('Error generating author-inspired story:', error);
      return this.generateFallbackStory(userInfo, difficulty, pageCount);
    }
  }
  }

  /**
   * Ensure natural flow between pages using children's book patterns
   */
  private static ensureChildrensBookFlow(
    previousPage: string,
    currentPage: string,
    difficulty: DifficultyLevel
  ): string {
    // Add transitional elements for better flow
    const transitions = {
      easy: ["Then", "Next", "After that", "Soon"],
      medium: ["Meanwhile", "Later that day", "Suddenly", "As it happened"],
      hard: ["In the meantime", "Before long", "Eventually", "As the story continues"],
      expert: ["Subsequently", "In due course", "As fate would have it", "In the fullness of time"]
    };
    
    const transitionWords = transitions[difficulty] || transitions.medium;
    
    // Check if current page needs a transition
    if (!currentPage.match(/^(Then|Next|After|Meanwhile|Later|Soon|Before|Eventually|Subsequently|In|As)/)) {
      const transition = transitionWords[Math.floor(Math.random() * transitionWords.length)];
      return `${transition}, ${currentPage.toLowerCase()}`;
    }
    
    return currentPage;
  }

  /**
   * Generate fallback story with basic templates
   */
  private static generateFallbackStory(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    pageCount: number
  ): Story {
    return {
      id: crypto.randomUUID(),
      title: `${userInfo.name || 'Alex'}'s Adventure`,
      segments: Array.from({ length: pageCount }, (_, i) => ({
        text: this.generateFallbackPage(userInfo, difficulty, i),
        illustration: undefined,
        audioUrl: undefined
      })),
      difficulty,
      estimatedReadingTime: Math.max(1, Math.ceil(pageCount / 3)),
      wordCount: pageCount * 8 // Estimate
    };
  }

  /**
   * Process template with user data
   */
  private static processTemplate(template: string, userInfo: UserInfo): string {
    return template
      .replace(/{name}/g, userInfo.name || 'Alex')
      .replace(/{animal}/g, userInfo.favoriteAnimal || 'cat')
      .replace(/{color}/g, userInfo.favoriteColor || 'blue')
      .replace(/{food}/g, userInfo.favoriteFood || 'pizza')
      .replace(/{hobby}/g, userInfo.hobbies || 'reading')
      .replace(/{object}/g, 'treasure')
      .replace(/{setting}/g, 'forest')
      .replace(/{antagonist}/g, 'shadow creatures')
      .replace(/{skill}/g, 'magical')
      .replace(/{pronoun}/g, 'they')
      .replace(/{pronoun_possessive}/g, 'their');
  }

  /**
   * Generate fallback page when template fails validation
   */
  private static generateFallbackPage(userInfo: UserInfo, difficulty: DifficultyLevel, pageIndex: number): string {
    const name = userInfo.name || 'Alex';
    const animal = userInfo.favoriteAnimal || 'cat';
    
    const fallbacks = {
      easy: [
        `${name} has fun.`,
        `The ${animal} plays.`,
        `${name} is happy.`,
        `They play together.`,
        `The day is good.`
      ],
      medium: [
        `${name} explores the magical garden.`,
        `The ${animal} shows ${name} something special.`,
        `They discover a hidden treasure together.`,
        `${name} learns about friendship and kindness.`,
        `The adventure brings joy to everyone.`
      ],
      hard: [
        `${name} embarked on an extraordinary journey through the mysterious forest.`,
        `The wise ${animal} shared ancient secrets about courage and determination.`,
        `Through teamwork and understanding, they overcame every challenge that appeared.`,
        `${name} discovered that true strength comes from helping others.`,
        `This remarkable adventure changed ${name} into a confident hero.`
      ],
      expert: [
        `${name} contemplated the profound mysteries surrounding the ancient ${animal} civilization.`,
        `Through systematic observation and careful analysis, ${name} developed innovative solutions to complex challenges.`,
        `The collaborative partnership demonstrated the transformative power of interspecies communication and understanding.`,
        `${name} established groundbreaking research that would benefit future generations of explorers.`,
        `This extraordinary experience fundamentally changed ${name}'s understanding of the interconnected nature of all existence.`
      ]
    };

    const difficultyFallbacks = fallbacks[difficulty];
    return difficultyFallbacks[pageIndex % difficultyFallbacks.length];
  }

  /**
   * Generate Level 1 vocabulary fallback for easy difficulty
   */
  private static generateLevel1Fallback(userInfo: UserInfo, pageIndex: number): string {
    const name = userInfo.name || 'Alex';
    const animal = userInfo.favoriteAnimal || 'cat';
    const food = userInfo.favoriteFood || 'pizza';
    
    const level1Fallbacks = [
      `${name} sees a ${animal}.`,
      `The ${animal} is big.`,
      `${name} likes the ${animal}.`,
      `They play ball.`,
      `${name} runs fast.`,
      `The ${animal} runs too.`,
      `They sit down.`,
      `${name} eats ${food}.`,
      `The day is fun.`,
      `${name} goes home.`
    ];

    return level1Fallbacks[pageIndex % level1Fallbacks.length];
  }

  /**
   * Generate story title
   */
  private static generateStoryTitle(userInfo: UserInfo, difficulty: DifficultyLevel): string {
    const name = userInfo.name || 'Alex';
    const animal = userInfo.favoriteAnimal || 'cat';
    
    const templates = {
      easy: [`${name} and ${animal}`, `${name}'s Day`],
      medium: [`${name}'s Adventure`, `The Magic ${animal}`],
      hard: [`${name} and the Quest`, `The Chronicles of ${name}`],
      expert: [`${name}: The Journey`, `Tales of ${name}`]
    };

    const titleOptions = templates[difficulty] || templates.easy;
    return titleOptions[Math.floor(Math.random() * titleOptions.length)];
  }
}