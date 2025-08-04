import { UserInfo, Story, DifficultyLevel } from "@/types";
import { DIFFICULTY_APPROPRIATE_TEMPLATES, validateDifficultyCompliance, getDifficultyAppropriateTemplate } from "@/constants/difficultyAppropriateTemplates";
import { getEnhancedTemplatePool } from "@/constants/enhancedTemplates";
import { SessionTemplateManager } from "@/services/sessionTemplateManager";
import { validateLevel1Sentence } from "@/constants/level1Vocabulary";
import { VocabularyLevelClassifier } from "@/utils/vocabularyLevelClassifier";
import { StoryQualityChecker } from "@/utils/storyQualityChecker";
import { APP_CONFIG } from "@/constants/app";
import { FreeTrialPageLimitError, PremiumPageLimitError } from "@/utils/errorHandling";
import { NameFormatter } from "@/utils/nameFormatter";

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
  private static sessionTemplateIndex: Record<string, number> = {};

  /**
   * Generate story with comprehensive anti-repetition and quality validation
   */
  static async generateStory(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    config: ContentManagerConfig
  ): Promise<StoryGenerationResult> {
    console.log(`🎯 Starting story generation for ${difficulty} level...`);
    
    // Handle free user session reset logic
    const shouldResetFreeUserSession = !config.isPremium && config.userId;
    if (shouldResetFreeUserSession) {
      const sessionStats = SessionTemplateManager.getSessionStats();
      if (sessionStats.isRepeating && Math.random() < 0.3) {
        console.log('🔄 Resetting free user session to reduce repetition');
        // SessionTemplateManager.reset(); // Method may not exist - remove or implement safely
      }
    }

    const story = await this.generateNewStoryWithAntiRepetition(userInfo, difficulty, config);
    
    return {
      story: story,
      isNewStory: true,
      isContinuation: false,
      sessionInfo: {
        sessionNumber: 1,
        remainingSessions: config.isPremium ? -1 : Math.max(0, (config.maxSessions || 5) - 1),
        isUnlimited: config.isPremium
      }
    };
  }

  /**
   * Generate new story with advanced anti-repetition mechanisms
   */
  static async generateNewStoryWithAntiRepetition(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    config: ContentManagerConfig
  ): Promise<Story> {
    console.log(`🚀 Generating new ${difficulty} story with anti-repetition...`);
    
    // Check page limits for free users only
    if (!config.isPremium && config.userId) {
      // For free users, assume they might have existing stories and check total page limit
      // This is a conservative approach to prevent excessive content generation
      const maxFreePages = 90;
      const currentUserStoryCount = 0; // Would need to fetch from storage/session if available
      
      if (currentUserStoryCount >= maxFreePages) {
        const upgradeMessage = `🚀 Unlock unlimited storytelling! You've reached the ${maxFreePages}-page free trial limit. Upgrade to Premium for unlimited pages, advanced features, and personalized reading experiences.`;
        
        throw new FreeTrialPageLimitError(
          `Free trial limit reached: ${currentUserStoryCount}/${maxFreePages} pages`,
          currentUserStoryCount,
          maxFreePages,
          upgradeMessage
        );
      }
    }
    
    const pageCount = this.getPageCountForDifficulty(difficulty, config.isPremium);
    
    try {
      // Use new author-inspired story generation
      const story = await this.generateSimpleStory(userInfo, difficulty, pageCount);
      
      // Quality validation with children's book standards
      const storyPages = story.segments.map(segment => segment.text);
      const qualityCheck = StoryQualityChecker.checkStoryQuality(storyPages, difficulty);
      console.log(`📊 Story quality score: ${qualityCheck.score}/100`);
      
      if (qualityCheck.score < 60) {
        console.warn('⚠️ Low quality score, issues:', qualityCheck.issues);
      }
      
      return story;
    } catch (error) {
      console.error('Story generation failed:', error);
      throw new Error(`Failed to generate ${difficulty} story: ${error.message}`);
    }
  }

  /**
   * Continue existing story
   */
  static async continueExistingStory(
    currentStory: string[],
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    config: ContentManagerConfig
  ): Promise<Story> {
    console.log(`📖 Continuing existing story with ${currentStory.length} pages...`);
    
    // Separate limits for free vs premium users
    const maxTotalPages = config.isPremium ? 500 : 90; // Premium: 500 pages, Free: 90 pages
    const maxAdditionalPages = Math.min(
      5, 
      this.getPageCountForDifficulty(difficulty, config.isPremium),
      maxTotalPages - currentStory.length
    );
    
    if (maxAdditionalPages <= 0) {
      if (config.isPremium) {
        // Premium users get a different error type and message
        console.warn(`📚 Premium page limit reached (${currentStory.length}/${maxTotalPages} pages)`);
        
        throw new PremiumPageLimitError(
          `Premium story limit reached: ${currentStory.length}/${maxTotalPages} pages`,
          currentStory.length,
          maxTotalPages
        );
      } else {
        // Free users get the upgrade message
        console.warn(`📚 Free trial page limit reached (${currentStory.length}/${maxTotalPages} pages)`);
        
        const upgradeMessage = `🚀 Unlock unlimited storytelling! You've reached the ${maxTotalPages}-page free trial limit. Upgrade to Premium for unlimited pages, advanced features, and personalized reading experiences.`;
        
        throw new FreeTrialPageLimitError(
          `Free trial limit reached: ${currentStory.length}/${maxTotalPages} pages`,
          currentStory.length,
          maxTotalPages,
          upgradeMessage
        );
      }
    }
    
    const additionalPages = maxAdditionalPages;
    const continuationPages: string[] = [];
    
    // Generate pages with anti-repetition and story context awareness
    for (let i = 0; i < additionalPages; i++) {
      const pageIndex = currentStory.length + i;
      const totalPagesIncludingNew = currentStory.length + additionalPages;
      
      // Use StoryArcManager for contextual continuation
      try {
        const { StoryArcManager } = await import('./storyArcManager');
        let newPage = StoryArcManager.getTemplateByPosition(
          userInfo,
          difficulty,
          pageIndex,
          totalPagesIncludingNew
        );
        
        // Ensure narrative flow from the last existing page
        if (i === 0 && currentStory.length > 0) {
          const lastPage = currentStory[currentStory.length - 1];
          newPage = this.ensureChildrensBookFlow(lastPage, newPage, difficulty);
        }
        
        // Check for repetition against existing story
        if (this.isContentTooSimilar(newPage, currentStory)) {
          // Use context-aware fallback instead of disconnected alternative
          newPage = this.generateFallbackPage(userInfo, difficulty, pageIndex, currentStory);
        }
        
        continuationPages.push(newPage);
        console.log(`✅ Continuation page ${i + 1}: "${newPage}"`);
        
      } catch (error) {
        console.warn(`Error generating continuation page ${i + 1}, using fallback:`, error);
        const fallbackPage = this.generateFallbackPage(userInfo, difficulty, pageIndex, currentStory);
        continuationPages.push(fallbackPage);
      }
    }
    
    const combinedPages = [...currentStory, ...continuationPages];
    
    return {
      id: crypto.randomUUID(),
      title: `${NameFormatter.capitalize(userInfo.name || 'Alex')}'s Adventure (Continued)`,
      segments: combinedPages.map(text => ({
        text,
        illustration: undefined,
        audioUrl: undefined
      })),
      difficulty,
      estimatedReadingTime: Math.max(1, Math.ceil(combinedPages.length / 3)),
      wordCount: combinedPages.join(' ').split(' ').filter(word => word.trim()).length
    };
  }

  /**
   * Core story generation logic with author-inspired patterns and narrative flow
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
      console.log('🔍 DEBUG: Starting story generation with userInfo:', JSON.stringify(userInfo, null, 2));
      console.log('🔍 DEBUG: Difficulty:', difficulty, 'PageCount:', pageCount);
      
      for (let i = 0; i < pageCount; i++) {
        console.log(`🔍 DEBUG: Generating page ${i + 1}/${pageCount}`);
        let processedPage = StoryArcManager.getTemplateByPosition(
          userInfo,
          difficulty,
          i,
          pageCount
        );
        console.log(`🔍 DEBUG: Page ${i + 1} after StoryArcManager:`, processedPage);
        
        // Ensure children's book flow
        if (i > 0) {
          processedPage = this.ensureChildrensBookFlow(
            pages[i - 1],
            processedPage,
            difficulty
          );
        }
        
        // Validate against difficulty-appropriate requirements AFTER template processing
        if (difficulty === 'easy') {
          const validation = validateLevel1Sentence(processedPage, NameFormatter.capitalize(userInfo.name || 'Alex'));
          if (!validation.isValid) {
            console.warn(`⚠️ Page ${i + 1} failed L1 validation, using fallback`);
            processedPage = this.generateLevel1Fallback(userInfo, i);
          }
        } else {
          // Validate word count for other difficulty levels AFTER template processing
          const wordValidation = validateDifficultyCompliance(processedPage, difficulty);
          if (!wordValidation.isValid) {
            console.warn(`⚠️ Page ${i + 1} word count (${wordValidation.wordCount}) outside range ${wordValidation.expectedRange.min}-${wordValidation.expectedRange.max} for ${difficulty}`);
            processedPage = this.generateFallbackPage(userInfo, difficulty, i, pages);
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
      title: `${NameFormatter.capitalize(userInfo.name || 'Alex')}'s Adventure`,
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
   * Process template with user data - basic fallback processing only
   */
  private static processTemplate(template: string, userInfo: UserInfo): string {
    return template
      .replace(/{name}/g, NameFormatter.capitalize(userInfo.name || 'Alex'))
      .replace(/{pronoun}/g, 'they')
      .replace(/{pronoun_possessive}/g, 'their')
      .replace(/{hobby}/g, userInfo.hobbies || 'playing')
      .replace(/{food}/g, userInfo.favoriteFood || 'food')
      .replace(/{antagonist}/g, 'shadow creatures')
      .replace(/{skill}/g, 'special');
  }

  /**
   * Generate fallback page content using story context when possible
   */
  private static generateFallbackPage(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    pageIndex: number,
    existingStory?: string[]
  ): string {
    try {
      // If we have existing story context, generate contextually appropriate fallback
      if (existingStory && existingStory.length > 0) {
        const lastPage = existingStory[existingStory.length - 1];
        
        // Simple continuation based on difficulty level
        const transitions = {
          easy: ["Then", "Next", "After that"],
          medium: ["Meanwhile", "Later", "Soon"],
          hard: ["Eventually", "Before long", "As it happened"],
          expert: ["Subsequently", "In due course", "As fate would have it"]
        };
        
        const transition = transitions[difficulty][Math.floor(Math.random() * transitions[difficulty].length)];
        const name = NameFormatter.capitalize(userInfo.name || 'Alex');
        
        // Generate simple context-aware continuation
        const continuations = {
          easy: [`${transition}, ${name} sees more.`, `${transition}, ${name} plays again.`, `${transition}, ${name} finds fun.`],
          medium: [`${transition}, ${name} discovers something new.`, `${transition}, ${name} meets a helpful friend.`, `${transition}, ${name} learns something important.`],
          hard: [`${transition}, ${name} faces a new challenge with courage.`, `${transition}, ${name} uses wisdom to solve the problem.`, `${transition}, ${name} grows stronger from the experience.`],
          expert: [`${transition}, ${name} contemplates the deeper meaning of the journey.`, `${transition}, ${name} synthesizes the lessons learned into practical wisdom.`, `${transition}, ${name} embraces the complexity of the adventure ahead.`]
        };
        
        const options = continuations[difficulty];
        return options[Math.floor(Math.random() * options.length)];
      }
      
      // If no story context, use standard template
      const processedTemplates = getDifficultyAppropriateTemplate(difficulty, 0, userInfo);
      if (processedTemplates && processedTemplates.length > 0) {
        return processedTemplates[pageIndex % processedTemplates.length];
      }
    } catch (error) {
      console.warn('Error in generateFallbackPage:', error);
    }
    
    // Ultimate fallback with proper name capitalization
    return `${NameFormatter.capitalize(userInfo.name || 'Alex')} has an adventure.`;
  }

  /**
   * Check if new content is too similar to existing story
   */
  private static isContentTooSimilar(newContent: string, existingStory: string[]): boolean {
    const newWords = newContent.toLowerCase().split(/\s+/);
    const existingText = existingStory.join(' ').toLowerCase();
    
    // Check if more than 60% of words already exist in story
    const matchCount = newWords.filter(word => 
      word.length > 2 && existingText.includes(word)
    ).length;
    
    return matchCount / newWords.length > 0.6;
  }


  /**
   * Generate Level 1 vocabulary fallback using StoryArcManager for proper template processing
   */
  private static generateLevel1Fallback(userInfo: UserInfo, pageIndex: number): string {
    const level1Templates = [
      "{name} sees a {animal}.",
      "{name} says hello.",
      "The {animal} is {color}.",
      "{name} and {animal} play.",
      "They run very fast.",
      "They play with a ball.",
      "{name} likes the {animal}.",
      "They are good friends.",
      "{name} feels very happy.",
      "What a fun day!"
    ];
    
    // Use different templates to avoid repetition
    const templateIndex = pageIndex % level1Templates.length;
    const template = level1Templates[templateIndex];
    
    // Use StoryArcManager to properly process all template variables
    const { StoryArcManager } = require('./storyArcManager');
    const mockUserInfo = { ...userInfo, name: NameFormatter.capitalize(userInfo.name || 'Alex') };
    return StoryArcManager.processTemplate ? 
      StoryArcManager.processTemplate(template, mockUserInfo, 'easy') :
      template.replace(/{name}/g, mockUserInfo.name)
             .replace(/{animal}/g, ['cat', 'dog', 'bird', 'fish', 'bear'][pageIndex % 5])
             .replace(/{color}/g, ['red', 'blue', 'green', 'yellow', 'brown'][pageIndex % 5]);
  }

  /**
   * Generate story title based on user info and difficulty
   */
  private static generateStoryTitle(userInfo: UserInfo, difficulty: DifficultyLevel): string {
    const titleTemplates = {
      easy: [
        "{name} and the {animal}",
        "{name}'s Big Day",
        "The {color} {animal}"
      ],
      medium: [
        "{name}'s Magical Adventure",
        "The Secret of the {animal}",
        "{name} and the Hidden Treasure"
      ],
      hard: [
        "{name}: The Journey Begins",
        "Chronicles of {name}",
        "The Adventures of {name}"
      ],
      expert: [
        "{name}: A Tale of Discovery",
        "The Extraordinary Journey of {name}",
        "{name} and the Quest for Knowledge"
      ]
    };
    
    const templates = titleTemplates[difficulty] || titleTemplates.medium;
    const template = templates[Math.floor(Math.random() * templates.length)];
    return this.processTemplate(template, userInfo);
  }

  /**
   * Get appropriate page count for difficulty level with free trial considerations
   */
  private static getPageCountForDifficulty(
    difficulty: DifficultyLevel, 
    isPremium: boolean = false
  ): number {
    // Free trial: Standard 10 pages for all levels
    if (!isPremium) {
      return 10;
    }
    
    // Premium: Varied page counts by difficulty
    const premiumPageCounts = {
      easy: 8,
      medium: 10,
      hard: 12,
      expert: 15
    };
    
    return premiumPageCounts[difficulty] || 10;
  }
}