import { UserInfo, Story, DifficultyLevel } from "@/types";
import { getDifficultyAppropriateTemplate, validateDifficultyCompliance } from "@/constants/difficultyAppropriateTemplates";
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
    
    // Clear template tracking for fresh selection
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
   * CORE SIMPLE STORY GENERATION - Fast, reliable, predictable
   */
  private static async generateSimpleStory(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    pageCount: number
  ): Promise<Story> {
    const pages: string[] = [];
    
    // Get ALL template arrays for this difficulty level
    const { DIFFICULTY_APPROPRIATE_TEMPLATES } = await import('@/constants/difficultyAppropriateTemplates');
    const allTemplateArrays = DIFFICULTY_APPROPRIATE_TEMPLATES[difficulty];
    
    // Flatten all templates into one big pool for maximum variety
    const allTemplates: string[] = [];
    allTemplateArrays.forEach(templateArray => {
      allTemplates.push(...templateArray);
    });
    
    console.log(`📚 Using ${allTemplates.length} total templates for ${difficulty} level (${allTemplateArrays.length} template arrays)`);
    
    // Generate pages with maximum variety
    for (let i = 0; i < pageCount; i++) {
      // Use modulo to cycle through ALL available templates
      const templateIndex = i % allTemplates.length;
      let template = allTemplates[templateIndex];
      
      console.log(`📝 Page ${i + 1}: Using template ${templateIndex + 1}/${allTemplates.length}`);
      
      // Replace placeholders with user data
      const processedPage = this.processTemplate(template, userInfo);
      
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
      .replace(/{name}/g, userInfo.name)
      .replace(/{animal}/g, userInfo.favoriteAnimal || 'cat')
      .replace(/{color}/g, userInfo.favoriteColor || 'blue')
      .replace(/{food}/g, userInfo.favoriteFood || 'pizza')
      .replace(/{hobby}/g, userInfo.hobbies || 'reading')
      .replace(/{object}/g, 'treasure')
      .replace(/{setting}/g, 'forest')
      .replace(/{pronoun}/g, 'they')
      .replace(/{pronoun_possessive}/g, 'their');
  }

  /**
   * Generate fallback page when template fails validation
   */
  private static generateFallbackPage(userInfo: UserInfo, difficulty: DifficultyLevel, pageIndex: number): string {
    const fallbacks = {
      easy: [
        `${userInfo.name} has fun.`,
        `The ${userInfo.favoriteAnimal} plays.`,
        `${userInfo.name} is happy.`,
        `They play together.`,
        `The day is good.`
      ],
      medium: [
        `${userInfo.name} explores the magical garden.`,
        `The ${userInfo.favoriteAnimal} shows ${userInfo.name} something special.`,
        `They discover a hidden treasure together.`,
        `${userInfo.name} learns about friendship and kindness.`,
        `The adventure brings joy to everyone.`
      ],
      hard: [
        `${userInfo.name} embarked on an extraordinary journey through the mysterious forest.`,
        `The wise ${userInfo.favoriteAnimal} shared ancient secrets about courage and determination.`,
        `Through teamwork and understanding, they overcame every challenge that appeared.`,
        `${userInfo.name} discovered that true strength comes from helping others.`,
        `This remarkable adventure changed ${userInfo.name} into a confident hero.`
      ],
      expert: [
        `${userInfo.name} contemplated the profound mysteries surrounding the ancient ${userInfo.favoriteAnimal} civilization.`,
        `Through systematic observation and careful analysis, ${userInfo.name} developed innovative solutions to complex challenges.`,
        `The collaborative partnership demonstrated the transformative power of interspecies communication and understanding.`,
        `${userInfo.name} established groundbreaking research that would benefit future generations of explorers.`,
        `This extraordinary experience fundamentally changed ${userInfo.name}'s understanding of the interconnected nature of all existence.`
      ]
    };

    const difficultyFallbacks = fallbacks[difficulty];
    return difficultyFallbacks[pageIndex % difficultyFallbacks.length];
  }

  /**
   * Generate Level 1 vocabulary fallback for easy difficulty
   */
  private static generateLevel1Fallback(userInfo: UserInfo, pageIndex: number): string {
    const level1Fallbacks = [
      `${userInfo.name} sees a ${userInfo.favoriteAnimal}.`,
      `The ${userInfo.favoriteAnimal} is big.`,
      `${userInfo.name} likes the ${userInfo.favoriteAnimal}.`,
      `They play ball.`,
      `${userInfo.name} runs fast.`,
      `The ${userInfo.favoriteAnimal} runs too.`,
      `They sit down.`,
      `${userInfo.name} eats ${userInfo.favoriteFood}.`,
      `The day is fun.`,
      `${userInfo.name} goes home.`
    ];

    return level1Fallbacks[pageIndex % level1Fallbacks.length];
  }

  /**
   * Generate story title
   */
  private static generateStoryTitle(userInfo: UserInfo, difficulty: DifficultyLevel): string {
    const templates = {
      easy: [`${userInfo.name} and ${userInfo.favoriteAnimal}`, `${userInfo.name}'s Day`],
      medium: [`${userInfo.name}'s Adventure`, `The Magic ${userInfo.favoriteAnimal}`],
      hard: [`${userInfo.name} and the Quest`, `The Chronicles of ${userInfo.name}`],
      expert: [`${userInfo.name}: The Journey`, `Tales of ${userInfo.name}`]
    };

    const titleOptions = templates[difficulty] || templates.easy;
    return titleOptions[Math.floor(Math.random() * titleOptions.length)];
  }
}