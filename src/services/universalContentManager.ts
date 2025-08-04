import { UserInfo, Story, DifficultyLevel } from "@/types";
import { DIFFICULTY_APPROPRIATE_TEMPLATES, validateDifficultyCompliance } from "@/constants/difficultyAppropriateTemplates";
import { getEnhancedTemplatePool } from "@/constants/enhancedTemplates";
import { SessionTemplateManager } from "@/services/sessionTemplateManager";
import { validateLevel1Sentence } from "@/constants/level1Vocabulary";
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
    console.log('🚀 Simple Story Generation Starting...');
    
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
    const pages: string[] = [];
    
    // Use enhanced template pool for better variety
    const enhancedTemplatePool = getEnhancedTemplatePool(difficulty, userInfo);
    console.log(`🎨 Enhanced template pool: ${enhancedTemplatePool.length} unique templates for ${difficulty}`);
    
    // Get session stats for tracking
    const sessionStats = SessionTemplateManager.getSessionStats();
    console.log(`📊 Session stats: ${sessionStats.templatesUsed} templates used, repeating: ${sessionStats.isRepeating}`);
    
    // Generate pages with intelligent anti-repetition
    for (let i = 0; i < pageCount; i++) {
      // Get next template using intelligent rotation
      const { template: rawTemplate, isRepeating } = SessionTemplateManager.getNextTemplate(
        enhancedTemplatePool,
        difficulty
      );
      
      if (isRepeating && i < 50) {
        console.log(`🔄 Repetition detected at page ${i + 1}, but within acceptable range`);
      } else if (isRepeating) {
        console.log(`⚠️ Template repetition starting at page ${i + 1} - consider upgrade prompt`);
      }
      
      console.log(`📝 Page ${i + 1}: Using ${isRepeating ? 'repeated' : 'fresh'} template`);
      
      // Replace placeholders with user data
      const processedPage = this.processTemplate(rawTemplate, userInfo);
      
      // Validate word count for difficulty
      const validation = validateDifficultyCompliance(processedPage, difficulty);
      if (!validation.isValid) {
        console.log(`⚠️ Page ${i + 1} word count (${validation.wordCount}) outside range, using fallback`);
        const fallback = this.generateFallbackPage(userInfo, difficulty, i);
        pages.push(fallback);
      } else {
        // For easy difficulty, validate Level 1 vocabulary
        if (difficulty === 'easy') {
          const level1Check = validateLevel1Sentence(processedPage);
          if (!level1Check.isValid) {
            console.log(`⚠️ Page ${i + 1} has non-Level 1 words, using Level 1 fallback`);
            const fallback = this.generateLevel1Fallback(userInfo, i);
            pages.push(fallback);
          } else {
            pages.push(processedPage);
          }
        } else {
          pages.push(processedPage);
        }
      }
      
      console.log(`✅ Page ${i + 1}: "${pages[pages.length - 1]}" (${pages[pages.length - 1].split(' ').length} words)`);
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

    console.log(`✅ Generated ${difficulty} story with ${story.segments.length} pages (${story.wordCount} total words)`);
    return story;
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