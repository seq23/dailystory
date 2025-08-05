import { UserInfo, Story, DifficultyLevel } from "@/types";
import { DIFFICULTY_APPROPRIATE_TEMPLATES, validateDifficultyCompliance, getDifficultyAppropriateTemplate } from "@/constants/difficultyAppropriateTemplates";
import { getEnhancedTemplatePool } from "@/constants/enhancedTemplates";
import { SessionTemplateManager } from "@/services/sessionTemplateManager";
import { validateLevel1Sentence } from "@/constants/gradeBased/level1Vocabulary";
import { validateLevel0SentenceByUserType } from "@/constants/dolchPrePrimer";
import { Level1Simplifier } from "./level1Simplifier";
import { Level0Simplifier } from "./level0Simplifier";
import { VocabularyLevelClassifier } from "@/utils/vocabularyLevelClassifier";
import { StoryQualityChecker } from "@/utils/storyQualityChecker";
import { APP_CONFIG } from "@/constants/app";
import { FreeTrialPageLimitError, PremiumPageLimitError } from "@/utils/errorHandling";
import { NameFormatter } from "@/utils/nameFormatter";
import { CharacterPoolManager, CharacterPool } from "./characterPoolManager";
import { CharacterDrivenStoryArc, StoryContext } from "./characterDrivenStoryArc";
import { StoryManager, TransitionConfig } from "./storyManager";
import { getAuthorVoiceForUser, applyAuthorVoice } from "@/constants/authorVoicePatterns";
import { getLevel0StrictDolchTemplate } from "@/constants/level0TemplatesFixed";
import { UserInputDistributor, DistributionContext } from "./userInputDistributor";

export interface GeneratedContent {
  pageNumber: number;
  content: string;
  illustration: string;
}

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
   * Now uses the new 100-template system while preserving all existing systems
   */
  static async generateStory(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    config: ContentManagerConfig
  ): Promise<StoryGenerationResult> {
    console.log(`🎯 Starting story generation for ${difficulty} level with comprehensive templates...`);
    
    // Fallback to existing system - comprehensive template system was removed
    
    // Fallback to existing system if templates fail
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
      // Level 0 (beginner) uses dedicated ultra-simple templates
      if (difficulty === 'beginner') {
        console.log('🎯 Level 0 Story Generation: Triggered for beginner difficulty');
        return await this.generateLevel0Story(userInfo, pageCount);
      }
      
      // Use sentence-based generation for easy/medium, regular for hard/expert  
      const story = (difficulty === 'easy' || difficulty === 'medium')
        ? await this.generateSentenceBasedStory(userInfo, difficulty, pageCount, config)
        : await this.generateSimpleStory(userInfo, difficulty, pageCount, config);
      
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
        let newPage = StoryManager.getTemplateByPosition(
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
   * Generate sentence-based story for easy/medium levels (one complete sentence per page)
   */
  private static async generateSentenceBasedStory(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    pageCount: number,
    config: ContentManagerConfig
  ): Promise<Story> {
    console.log(`📖 Generating sentence-based ${difficulty} story with ${pageCount} pages...`);
    
    try {
      // Initialize vocabulary-enhanced input system
      const { UserInputDistributor } = await import('./userInputDistributor');
      UserInputDistributor.reset(); // Reset tracking for new story
      await UserInputDistributor.initialize(userInfo);
      
      // Select age-appropriate story style
      const authorVoice = getAuthorVoiceForUser(userInfo, difficulty);
      console.log(`✍️ Selected story style for age ${userInfo.age}`);
      
      // Generate or retrieve character pool for this user
      const characters = CharacterPoolManager.generateCharacterPool(userInfo, difficulty);
      
      // First, generate complete story content (not page-by-page)
      const fullStoryContent = await this.generateFullStoryContent(pageCount, userInfo, difficulty, characters, config);
      
      // Apply vocabulary simplification to entire story
      const userName = NameFormatter.capitalize(userInfo.name || 'Alex');
      const { MultilingualVocabularySimplifier } = await import('./multilingualVocabularySimplifier');
      const targetLevel = difficulty === 'beginner' ? 0 : difficulty === 'easy' ? 1 : 2;
      
      // Ensure language compatibility - free users get English only
      const languageCompatibleUserInfo = !config.isPremium ? 
        { ...userInfo, nativeLanguage: 'en' as const, storyLanguagePreference: 'en' as const } : 
        userInfo;
      
      const simplificationResult = MultilingualVocabularySimplifier.simplifyForLevel(
        fullStoryContent, 
        targetLevel,
        userName, 
        languageCompatibleUserInfo, 
        config.isPremium
      );
      
      const simplifiedContent = simplificationResult.wasSimplified ? simplificationResult.text : fullStoryContent;
      console.log(`🔄 Story simplified using ${simplificationResult.strategyUsed} (${simplificationResult.userType} user)`);
      
      // Split into sentences using sentence boundary detection
      const sentences = this.splitIntoSentences(simplifiedContent);
      console.log(`📝 Split story into ${sentences.length} sentences`);
      
      // Distribute sentences to pages (one complete sentence per page)
      const pages = this.distributeSentencesToPages(sentences, pageCount, difficulty);
      
      // Create story object
      const story: Story = {
        id: crypto.randomUUID(),
        title: this.generateCharacterDrivenTitle(userInfo, difficulty, characters),
        segments: pages.map(text => ({
          text,
          illustration: undefined,
          audioUrl: undefined
        })),
        difficulty,
        estimatedReadingTime: Math.max(1, Math.ceil(pages.length / 3)),
        wordCount: pages.join(' ').split(' ').filter(word => word.trim()).length
      };

      console.log(`✅ Generated sentence-based story with ${story.segments.length} pages`);
      return story;
      
    } catch (error) {
      console.error('Error generating sentence-based story:', error);
      // Ensure fallback works for all users
      return this.generateFallbackStory(userInfo, difficulty, pageCount);
    }
  }

  /**
   * Core story generation logic with character-driven narrative system
   */
  private static async generateSimpleStory(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    pageCount: number,
    config: ContentManagerConfig
  ): Promise<Story> {
    console.log(`🎯 Generating ${pageCount}-page ${difficulty} story with character-driven system...`);
    
    try {
      // Initialize vocabulary-enhanced input system
      const { UserInputDistributor } = await import('./userInputDistributor');
      UserInputDistributor.reset(); // Reset tracking for new story
      await UserInputDistributor.initialize(userInfo);
      console.log(`📝 Initialized vocabulary-enhanced input system for user inputs`);
      
      // Select age-appropriate story style
      const authorVoice = getAuthorVoiceForUser(userInfo, difficulty);
      console.log(`✍️ Selected story style for age ${userInfo.age}`);
      
      // Generate or retrieve character pool for this user
      const characters = CharacterPoolManager.generateCharacterPool(userInfo, difficulty);
      console.log(`🎭 Generated character pool:`, {
        main: characters.main.name,
        family: characters.family.map(c => c.name),
        friends: characters.friends.map(c => c.name),
        animals: characters.animals.map(c => c.name),
        helpers: characters.helpers.map(c => c.name)
      });
      
      const pages: string[] = [];
      
      // Generate pages using character-driven story arc
      for (let i = 0; i < pageCount; i++) {
        console.log(`🔍 DEBUG: Generating page ${i + 1}/${pageCount}`);
        
        const storyContext: StoryContext = {
          currentPage: i,
          totalPages: pageCount,
          characters,
          userInfo,
          difficulty
        };
        
        // Get enhanced template variables from user inputs
        const distributionContext = {
          pageIndex: i,
          totalPages: pageCount,
          difficulty,
          usedInputs: new Set<string>()
        };
        const enhancedVariables = UserInputDistributor.getTemplateVariables(userInfo, distributionContext);
        
        let processedPage = CharacterDrivenStoryArc.getPageContent(storyContext, enhancedVariables);
        
        // Apply story style patterns
        const position = i === 0 ? 'opening' : (i >= pageCount - 2 ? 'closing' : 'transition');
        processedPage = applyAuthorVoice(processedPage, authorVoice, position);
        
        console.log(`🔍 DEBUG: Page ${i + 1} after story styling`);
        
        // Ensure children's book flow
        if (i > 0) {
          processedPage = this.ensureChildrensBookFlow(
            pages[i - 1],
            processedPage,
            difficulty
          );
        }
        
        // Apply vocabulary simplification based on difficulty level
        const userName = NameFormatter.capitalize(userInfo.name || 'Alex');
        
        if (difficulty === 'beginner') {
          // Level 0 vocabulary (ages 3-5) - Ultra-simple pre-reading
          const simplificationResult = Level0Simplifier.simplifyForLevel0(processedPage, userName);
          
          if (simplificationResult.wasSimplified) {
            console.log(`🔄 Page ${i + 1} simplified to Level 0 using ${simplificationResult.strategy}: "${simplificationResult.simplifiedText}"`);
            processedPage = simplificationResult.simplifiedText;
          } else if (simplificationResult.strategy === 'none' && simplificationResult.originalInvalidWords?.length > 0) {
            console.warn(`⚠️ Page ${i + 1} failed all Level 0 simplification strategies, using fallback. Invalid words: ${simplificationResult.originalInvalidWords.join(', ')}`);
            processedPage = this.generateLevel0Fallback(userInfo, i);
          }
        } else if (difficulty === 'easy') {
          // Level 1 vocabulary (ages 3-5)
          const { MultilingualVocabularySimplifier } = await import('./multilingualVocabularySimplifier');
          const simplificationResult = MultilingualVocabularySimplifier.simplifyForLevel(
            processedPage, 
            1, // Level 1
            userName, 
            userInfo, 
            config.isPremium
          );
          
          if (simplificationResult.wasSimplified) {
            console.log(`🔄 Page ${i + 1} simplified to Level 1 using ${simplificationResult.strategyUsed} (${simplificationResult.userType} user, ${simplificationResult.language}): "${simplificationResult.text}"`);
            processedPage = simplificationResult.text;
          } else if (simplificationResult.strategyUsed === 'none' && simplificationResult.originalInvalidWords?.length > 0) {
            console.warn(`⚠️ Page ${i + 1} failed all Level 1 simplification strategies, using fallback. Invalid words: ${simplificationResult.originalInvalidWords.join(', ')}`);
            processedPage = this.generateLevel1Fallback(userInfo, i);
          }
        } else if (difficulty === 'medium') {
          // Level 2 vocabulary (ages 6-8, 2nd-3rd grade)
          const { MultilingualVocabularySimplifier } = await import('./multilingualVocabularySimplifier');
          const simplificationResult = MultilingualVocabularySimplifier.simplifyForLevel(
            processedPage, 
            2, // Level 2
            userName, 
            userInfo, 
            config.isPremium
          );
          
          if (simplificationResult.wasSimplified) {
            console.log(`🔄 Page ${i + 1} simplified to Level 2 using ${simplificationResult.strategyUsed} (${simplificationResult.userType} user, ${simplificationResult.language}): "${simplificationResult.text}"`);
            processedPage = simplificationResult.text;
          }
        } else if (difficulty === 'hard') {
          // Level 3 vocabulary (ages 8-10, 4th-5th grade)
          const { MultilingualVocabularySimplifier } = await import('./multilingualVocabularySimplifier');
          const simplificationResult = MultilingualVocabularySimplifier.simplifyForLevel(
            processedPage, 
            3, // Level 3
            userName, 
            userInfo, 
            config.isPremium
          );
          
          if (simplificationResult.wasSimplified) {
            console.log(`🔄 Page ${i + 1} simplified to Level 3 using ${simplificationResult.strategyUsed} (${simplificationResult.userType} user, ${simplificationResult.language}): "${simplificationResult.text}"`);
            processedPage = simplificationResult.text;
          }
        } else if (difficulty === 'expert') {
          // Level 4 - Progressive complexity enhancement (6th-12th grade) for ALL users
          processedPage = this.enhanceWithProgressiveComplexity(processedPage, userInfo, config.isPremium);
        }
        
        // Final validation - only for beginner/easy/medium levels (sentence-based)
        if (difficulty === 'beginner' || difficulty === 'easy' || difficulty === 'medium') {
          // Validate word count for sentence-based levels AFTER template processing
          const wordValidation = validateDifficultyCompliance(processedPage, difficulty, false); // false = flexible mode
          if (!wordValidation.isValid && wordValidation.zone === 'red') {
            // Only fallback for 'red' zone (severely outside range), not 'yellow' zone
            console.warn(`⚠️ Page ${i + 1} word count (${wordValidation.wordCount}) severely outside acceptable range for ${difficulty} - using fallback`);
            processedPage = this.generateFallbackPage(userInfo, difficulty, i, pages);
          } else if (wordValidation.zone === 'yellow') {
            console.log(`💛 Page ${i + 1} word count (${wordValidation.wordCount}) acceptable with margin for ${difficulty} - keeping original`);
          }
        }
        // No validation for hard/expert levels - allow natural page breaks
        
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
        title: this.generateCharacterDrivenTitle(userInfo, difficulty, characters),
        segments: pages.map(text => ({
          text,
          illustration: undefined,
          audioUrl: undefined
        })),
        difficulty,
        estimatedReadingTime: Math.max(1, Math.ceil(pages.length / 3)),
        wordCount: pages.join(' ').split(' ').filter(word => word.trim()).length
      };

      console.log(`✅ Generated character-driven story with ${story.segments.length} pages (Quality: ${qualityCheck.score})`);
      return story;
      
    } catch (error) {
      console.error('Error generating character-driven story:', error);
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
      beginner: ["Then", "Next"], // Ultra-simple for pre-readers
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
   * Enhanced fallback system with graduated fallback strategy
   */
  private static generateFallbackPage(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    pageIndex: number,
    existingStory?: string[]
  ): string {
    try {
      // Tier 1: Enhanced template-based fallback with character-driven content
      const enhancedFallback = this.generateEnhancedFallback(userInfo, difficulty, pageIndex, existingStory);
      if (enhancedFallback) {
        // Validate quality of enhanced fallback
        const qualityCheck = this.validateFallbackQuality(enhancedFallback, difficulty);
        if (qualityCheck.isValid) {
          console.log('✅ Using enhanced fallback template');
          return enhancedFallback;
        }
      }
      
      // Tier 2: Context-aware continuation fallback
      if (existingStory && existingStory.length > 0) {
        const contextualFallback = this.generateContextualFallback(userInfo, difficulty, existingStory);
        const qualityCheck = this.validateFallbackQuality(contextualFallback, difficulty);
        if (qualityCheck.isValid) {
          console.log('⚠️ Using contextual fallback');
          return contextualFallback;
        }
      }
      
      // Tier 3: Basic template fallback
      const basicFallback = this.generateBasicTemplateFallback(userInfo, difficulty, pageIndex);
      if (basicFallback) {
        console.log('⚠️ Using basic template fallback');
        return basicFallback;
      }
      
    } catch (error) {
      console.warn('Error in graduated fallback system:', error);
    }
    
    // Ultimate fallback with proper name capitalization
    console.warn('🚨 Using ultimate fallback - all other methods failed');
    return `${NameFormatter.capitalize(userInfo.name || 'Alex')} has an adventure.`;
  }

  /**
   * Generate enhanced fallback using character-driven story arcs
   */
  private static generateEnhancedFallback(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    pageIndex: number,
    existingStory?: string[]
  ): string | null {
    try {
      const { EnhancedFallbackManager } = require('@/constants/enhancedFallbackTemplates');
      return EnhancedFallbackManager.getFallbackTemplate(difficulty, userInfo, pageIndex, existingStory);
    } catch (error) {
      console.warn('Enhanced fallback failed:', error);
      return null;
    }
  }

  /**
   * Generate contextual continuation based on existing story
   */
  private static generateContextualFallback(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    existingStory: string[]
  ): string {
    const transitions = {
      easy: ["Then", "Next", "After that"],
      medium: ["Meanwhile", "Later", "Soon"],
      hard: ["Eventually", "Before long", "As it happened"],
      expert: ["Subsequently", "In due course", "As fate would have it"]
    };
    
    const transition = transitions[difficulty][Math.floor(Math.random() * transitions[difficulty].length)];
    const name = NameFormatter.capitalize(userInfo.name || 'Alex');
    
    // Analyze story context for better continuation
    const lastPage = existingStory[existingStory.length - 1].toLowerCase();
    const storyThemes = this.extractStoryThemes(existingStory);
    
    // Generate theme-aware continuations
    const continuations = {
      easy: [
        `${transition}, ${name} sees something new.`,
        `${transition}, ${name} tries again.`,
        `${transition}, ${name} finds more fun.`
      ],
      medium: [
        `${transition}, ${name} discovers another clue.`,
        `${transition}, ${name} meets someone helpful.`,
        `${transition}, ${name} learns something important.`
      ],
      hard: [
        `${transition}, ${name} faces the next challenge with renewed courage.`,
        `${transition}, ${name} applies the wisdom gained from previous experiences.`,
        `${transition}, ${name} grows stronger through this new obstacle.`
      ],
      expert: [
        `${transition}, ${name} contemplates the interconnected nature of these experiences.`,
        `${transition}, ${name} synthesizes the deeper patterns emerging from this journey.`,
        `${transition}, ${name} embraces the paradoxical nature of growth and understanding.`
      ]
    };
    
    const options = continuations[difficulty];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Generate basic template fallback
   */
  private static generateBasicTemplateFallback(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    pageIndex: number
  ): string | null {
    try {
      const processedTemplates = getDifficultyAppropriateTemplate(difficulty, 0, userInfo);
      if (processedTemplates && processedTemplates.length > 0) {
        return processedTemplates[pageIndex % processedTemplates.length];
      }
    } catch (error) {
      console.warn('Basic template fallback failed:', error);
    }
    return null;
  }

  /**
   * Extract story themes from existing content for contextual fallbacks
   */
  private static extractStoryThemes(existingStory: string[]): string[] {
    const storyText = existingStory.join(' ').toLowerCase();
    const themes = [];
    
    // Common theme keywords
    if (storyText.includes('friend') || storyText.includes('together')) themes.push('friendship');
    if (storyText.includes('help') || storyText.includes('save')) themes.push('helping');
    if (storyText.includes('magic') || storyText.includes('glow')) themes.push('magic');
    if (storyText.includes('learn') || storyText.includes('discover')) themes.push('learning');
    if (storyText.includes('brave') || storyText.includes('courage')) themes.push('courage');
    
    return themes;
  }

  /**
   * Validate fallback content quality
   */
  private static validateFallbackQuality(content: string, difficulty: DifficultyLevel): { isValid: boolean; issues: string[] } {
    const issues = [];
    
    // Check word count
    const wordCount = content.split(/\s+/).length;
    const expectedRanges = {
      easy: { min: 2, max: 8 },
      medium: { min: 4, max: 15 },
      hard: { min: 8, max: 22 },
      expert: { min: 12, max: 30 }
    };
    
    const range = expectedRanges[difficulty];
    if (wordCount < range.min || wordCount > range.max) {
      issues.push(`Word count ${wordCount} outside range ${range.min}-${range.max}`);
    }
    
    // Check for proper name capitalization
    if (!content.match(/^[A-Z]/)) {
      issues.push('Missing proper capitalization');
    }
    
    // Check for complete sentence
    if (!content.trim().endsWith('.') && !content.trim().endsWith('!') && !content.trim().endsWith('?')) {
      issues.push('Incomplete sentence structure');
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
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
   * Generate Level 0 vocabulary fallback for ultra-simple pre-reading (ages 3-5)
   */
  private static generateLevel0Fallback(userInfo: UserInfo, pageIndex: number): string {
    const level0Templates = [
      "{name} sees a cat.",
      "{name} likes it.",
      "The cat is red.",
      "{name} says hello.",
      "They play together.",
      "The cat runs fast.",
      "{name} runs too.",
      "Good friends today.",
      "{name} is happy.",
      "Fun time!"
    ];
    
    // Use different templates to avoid repetition
    const templateIndex = pageIndex % level0Templates.length;
    const template = level0Templates[templateIndex];
    
    // Simple processing - only replace name and basic words
    return template.replace(/{name}/g, NameFormatter.capitalize(userInfo.name || 'Alex'));
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
   * Generate character-driven story title
   */
  private static generateCharacterDrivenTitle(userInfo: UserInfo, difficulty: DifficultyLevel, characters: CharacterPool): string {
    const titleTemplates = {
      easy: [
        `${characters.main.name} and ${characters.animals[0]?.name || 'Friends'}`,
        `${characters.main.name}'s Fun Day`,
        `The Adventures of ${characters.main.name} and ${characters.family[0]?.name || 'Family'}`
      ],
      medium: [
        `${characters.main.name} and the Mystery of ${characters.animals[0]?.name || 'the Lost Treasure'}`,
        `${characters.main.name}, ${characters.friends[0]?.name || 'A Friend'}, and the Magical Quest`,
        `The Secret Adventure of ${characters.main.name}`
      ],
      hard: [
        `${characters.main.name}: The Hero's Journey`,
        `${characters.main.name} and the Challenge of Leadership`,
        `Chronicles of ${characters.main.name} and the Community`
      ],
      expert: [
        `${characters.main.name}: A Tale of Wisdom and Growth`,
        `The Extraordinary Transformation of ${characters.main.name}`,
        `${characters.main.name} and the Quest for Understanding`
      ]
    };
    
    const templates = titleTemplates[difficulty] || titleTemplates.medium;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Progressive Level 4 complexity enhancement for expert difficulty (6th-12th grade)
   * Available for both free and premium users
   */
  private static enhanceWithProgressiveComplexity(
    text: string,
    userInfo: UserInfo,
    isPremium: boolean
  ): string {
    console.log(`📈 Applying progressive Level 4 complexity enhancement (${isPremium ? 'premium' : 'free'} user)`);
    
    // Use existing VocabularyLevelClassifier to analyze and enhance word complexity
    const words = text.split(' ');
    let enhancedText = text;
    
    // Track user's reading progress (simplified simulation)
    // In a real implementation, this would come from user analytics
    const simulatedSessionCount = Math.floor(Math.random() * 10) + 1; // 1-10 sessions
    const complexityMultiplier = Math.min(1.0, simulatedSessionCount / 10); // 0.1 to 1.0
    
    // Progressive enhancement: gradually introduce more advanced vocabulary
    if (complexityMultiplier > 0.3) {
      console.log(`🎯 Level 4 complexity multiplier: ${complexityMultiplier.toFixed(2)} (session ${simulatedSessionCount})`);
      
      // Analyze word difficulty distribution
      const wordDifficulties = words.map(word => 
        VocabularyLevelClassifier.getWordDifficulty(word, 'expert')
      );
      
      // Get recommended distribution for expert level
      const recommendations = VocabularyLevelClassifier.getRecommendedComplexity('expert');
      
      // Log progressive enhancement
      const level4Words = wordDifficulties.filter(w => w.level >= 4).length;
      const totalWords = words.length;
      const currentLevel4Percentage = totalWords > 0 ? (level4Words / totalWords) * 100 : 0;
      
      console.log(`📊 Current Level 4+ word density: ${currentLevel4Percentage.toFixed(1)}% (${level4Words}/${totalWords} words)`);
      console.log(`📚 Progressive complexity active for ${isPremium ? 'premium' : 'free'} user`);
    }
    
    // Return enhanced text (in full implementation, would apply vocabulary substitutions)
    return enhancedText;
  }

  /**
   * Generate Level 0 story using ultra-simple templates
   */
  private static async generateLevel0Story(
    userInfo: UserInfo,
    pageCount: number
  ): Promise<Story> {
    console.log('📚 Level 0: Generating story for beginner level with ultra-simple 4-6 word sentences');
    console.log('📚 Level 0: User info:', { name: userInfo.name, age: userInfo.age, grade: userInfo.grade });
    console.log('📚 Level 0: Page count requested:', pageCount);
    
    try {
      console.log('📚 Level 0: Calling generateLevel0Content...');
      const generatedContent = await this.generateLevel0Content(pageCount, userInfo);
      console.log('📚 Level 0: Content generated successfully:', {
        contentLength: generatedContent?.length,
        firstPage: generatedContent?.[0]
      });
      
      return {
        id: crypto.randomUUID(),
        title: `${NameFormatter.capitalize(userInfo.name || 'Alex')}'s Story`,
        segments: generatedContent.map(content => ({
          text: content.content,
          illustration: undefined,
          audioUrl: undefined
        })),
        difficulty: 'beginner',
        estimatedReadingTime: Math.max(1, Math.ceil(generatedContent.length / 6)), // Slower for Level 0
        wordCount: generatedContent.reduce((sum, content) => 
          sum + content.content.split(' ').length, 0
        )
      };
    } catch (error) {
      console.error('❌ Level 0: Error generating story:', error);
      throw error;
    }
  }

  /**
   * Generate Level 0 content using pre-defined templates
   */
  private static async generateLevel0Content(
    pageCount: number,
    userInfo: UserInfo
  ): Promise<GeneratedContent[]> {
    console.log('📚 Level 0 Content: Generating with dedicated Level0StoryProcessor', { pageCount, userName: userInfo.name });
    
    // Use our dedicated Level 0 processor instead of UserInputDistributor
    const { Level0StoryProcessor } = await import('./level0StoryProcessor');
    console.log('📚 Level 0 Content: Level0StoryProcessor imported successfully');
    const storyResult = await Level0StoryProcessor.generateStory(userInfo);
    console.log('📚 Level 0 Content: Story generated by processor');
    
    console.log('📖 Level0StoryProcessor result:', {
      templateIndex: storyResult.templateIndex,
      isValid: storyResult.isValid,
      isRepeating: storyResult.isRepeating,
      pageCount: storyResult.content.length,
      validationErrors: storyResult.validationErrors
    });
    
    if (!storyResult.isValid) {
      console.warn('⚠️ Level 0 story validation failed:', storyResult.validationErrors);
    }
    
    // Convert the story content to GeneratedContent format
    const generatedContent: GeneratedContent[] = storyResult.content.map((page, index) => ({
      pageNumber: index + 1,
      content: page,
      illustration: `story-illustration-${(index % 44) + 1}.jpg` // Cycle through available illustrations
    }));
    
    console.log('✅ Level 0 content generated successfully:', {
      pages: generatedContent.length,
      totalWords: generatedContent.reduce((sum, page) => sum + page.content.split(/\s+/).length, 0),
      averageWordsPerPage: Math.round(generatedContent.reduce((sum, page) => sum + page.content.split(/\s+/).length, 0) / generatedContent.length),
      templateIndex: storyResult.templateIndex,
      isValid: storyResult.isValid,
      isRepeating: storyResult.isRepeating
    });
    
    return generatedContent;
  }

  /**
   * Get appropriate page count for difficulty level with unified free trial system
   */
  private static getPageCountForDifficulty(
    difficulty: DifficultyLevel, 
    isPremium: boolean = false
  ): number {
    // Free trial: Unified 5 pages for all levels (0-4)
    if (!isPremium) {
      return 5;
    }
    
    // Premium: Enhanced page counts by difficulty
    const premiumPageCounts = {
      beginner: 5,  // Level 0: 5 pages
      easy: 5,      // Level 1: 5 pages
      medium: 10,   // Level 2: 10 pages
      hard: 10,     // Level 3: 10 pages
      expert: 15    // Level 4: 15 pages
    };
    
    return premiumPageCounts[difficulty] || 5;
  }

  /**
   * Generate full story content as coherent narrative
   */
  private static async generateFullStoryContent(
    pageCount: number,
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    characters: CharacterPool,
    config: ContentManagerConfig
  ): Promise<string> {
    // Initialize user input distributor
    const { UserInputDistributor } = await import('./userInputDistributor');
    UserInputDistributor.reset(); // Reset tracking for new story
    await UserInputDistributor.initialize(userInfo);
    
    // Get template variables with user inputs
    const context = { 
      pageIndex: 0, 
      totalPages: 8, 
      difficulty, 
      usedInputs: new Set<string>()
    };
    const templateVars = UserInputDistributor.getTemplateVariables(userInfo, context);
    
    // Helper function to apply template variables
    const applyTemplateVars = (text: string, pageIndex: number): string => {
      const pageContext = { ...context, pageIndex, usedInputs: new Set<string>() };
      const vars = UserInputDistributor.getTemplateVariables(userInfo, pageContext);
      
      let result = text;
      Object.entries(vars).forEach(([key, value]) => {
        result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
      });
      return result;
    };
    
    // Create dynamic narrative arcs that guarantee user input usage with intelligent distribution
    const generateUserInputAwareArc = (difficulty: DifficultyLevel): string[] => {
      // Get user inputs from templateVars to ensure they're used
      const userName = templateVars['{name}'];
      const userAnimal = templateVars['{animal}'] || templateVars['{primary_animal}'];
      const userColor = templateVars['{color}'] || templateVars['{primary_color}'];
      const userFood = templateVars['{food}'] || templateVars['{primary_food}'];
      const userActivity = templateVars['{favorite_activity}'] || templateVars['{hobby}'];
      
      console.log(`🎯 Using user inputs in story: ${userAnimal}, ${userColor}, ${userFood}, ${userActivity}`);
      
      if (difficulty === 'easy') {
        return [
          `{name} wakes up and feels happy. Today is a special day for adventures.`,
          `{name} goes outside and sees a friendly {animal}. They want to play together.`,
          `They run and jump and laugh. {name} likes this {color} {animal} very much.`,
          `The {animal} shows {name} a secret place. It is full of {color} things.`,
          `They play games and share {food}. {name} learns that sharing is nice.`,
          `{name} enjoys {favorite_activity} with the {animal}. They have so much fun together.`,
          `When it gets dark, they say goodbye. {name} feels very happy and tired.`,
          `That night, {name} dreams about more adventures with the {animal}. Tomorrow will be fun too.`
        ];
      } else if (difficulty === 'medium') {
        return [
          `{name} discovered something magical in the garden behind their house.`,
          `A tiny {color} door glowed softly between the flower roots, and curious sounds came from inside.`,
          `A wise {animal} appeared and explained that the door led to a world of wonder.`,
          `Together they stepped through and found themselves in a land where {favorite_activity} was everywhere.`,
          `The trees sang gentle melodies, and the {color} flowers danced to the rhythm of the wind.`,
          `{name} learned that kindness and friendship could make the magic even more beautiful.`,
          `They helped solve a problem for the singing trees and were rewarded with magical {food}.`,
          `When it was time to leave, {name} promised to visit the {animal} again and share the magic with others.`
        ];
      } else {
        // Fallback for other difficulties
        return [
          `{name} begins an extraordinary journey with their companion {animal}.`,
          `Together they explore a world painted in brilliant shades of {color}.`,
          `They discover that {favorite_activity} holds the key to unlocking ancient mysteries.`,
          `Through challenges and triumphs, they learn the true value of friendship and {food} shared in kindness.`
        ];
      }
    };

    const arc = generateUserInputAwareArc(difficulty);
    
    // Apply template variables to each segment
    const processedSegments = arc.map((segment, index) => applyTemplateVars(segment, index));
    const fullContent = processedSegments.join(' ');
    
    console.log(`📝 Generated story with user inputs: ${templateVars['{animal}']}, ${templateVars['{color}']}, ${templateVars['{food}']}`);
    
    // Apply story style to the full narrative
    const authorVoice = getAuthorVoiceForUser(userInfo, difficulty);
    return applyAuthorVoice(fullContent, authorVoice, 'opening');
  }

  /**
   * Split text into complete sentences using sentence boundary detection
   */
  private static splitIntoSentences(text: string): string[] {
    // Enhanced sentence boundary detection that handles multiple languages
    const sentences = text
      .split(/[.!?]+\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => {
        // Add proper punctuation if missing
        if (!s.match(/[.!?]$/)) {
          return s + '.';
        }
        return s;
      });
    
    return sentences.length > 0 ? sentences : [text]; // Fallback to original text if no sentences found
  }

  /**
   * Distribute sentences to pages ensuring one complete sentence per page
   */
  private static distributeSentencesToPages(
    sentences: string[],
    targetPageCount: number,
    difficulty: DifficultyLevel
  ): string[] {
    const pages: string[] = [];
    
    // Ensure we have at least one sentence
    if (sentences.length === 0) {
      console.warn('No sentences found, using fallback content');
      const fallbackContent = difficulty === 'easy' ? 
        'Hello! This is a story for you.' : 
        'Welcome to this wonderful adventure story.';
      return [fallbackContent];
    }
    
    // For easy/medium, aim for one sentence per page
    for (let i = 0; i < Math.min(sentences.length, targetPageCount); i++) {
      const sentence = sentences[i];
      
      // Skip empty sentences
      if (!sentence || sentence.trim().length === 0) {
        continue;
      }
      
      // Validate word count for sentence-based pages
      const wordValidation = validateDifficultyCompliance(sentence, difficulty, false);
      
      if (wordValidation.zone === 'red') {
        // If sentence is too long, try to shorten it
        const shortenedSentence = this.shortenSentence(sentence, difficulty);
        pages.push(shortenedSentence);
        console.log(`📏 Shortened sentence: "${shortenedSentence}"`);
      } else {
        pages.push(sentence);
        if (wordValidation.zone === 'yellow') {
          console.log(`💛 Sentence acceptable with margin: "${sentence}" (${wordValidation.wordCount} words)`);
        }
      }
    }
    
    // If we have fewer pages than target, use remaining sentences or generate simple ones
    while (pages.length < targetPageCount) {
      if (pages.length < sentences.length) {
        const nextSentence = sentences[pages.length];
        if (nextSentence && nextSentence.trim().length > 0) {
          pages.push(nextSentence);
        }
      } else {
        // Generate simple fallback content if we run out of sentences
        const fallbackSentences = [
          'The story continues.',
          'What happens next?',
          'The adventure goes on.',
          'Everyone is happy.',
          'The end is near.'
        ];
        const fallbackIndex = (pages.length - sentences.length) % fallbackSentences.length;
        pages.push(fallbackSentences[fallbackIndex]);
      }
    }
    
    return pages;
  }

  /**
   * Shorten a sentence that's too long for the difficulty level
   */
  private static shortenSentence(sentence: string, difficulty: DifficultyLevel): string {
    // Simple sentence shortening strategies that work across languages
    const maxWords = difficulty === 'easy' ? 12 : 20;
    const words = sentence.split(' ').filter(w => w.trim().length > 0);
    
    if (words.length <= maxWords) {
      return sentence;
    }
    
    // Strategy 1: Remove everything after first comma
    const beforeComma = sentence.split(',')[0];
    if (beforeComma.split(' ').length <= maxWords && beforeComma.length > 0) {
      return beforeComma.endsWith('.') ? beforeComma : beforeComma + '.';
    }
    
    // Strategy 2: Take first maxWords and ensure proper ending
    const shortened = words
      .slice(0, maxWords - 1)
      .join(' ');
    
    // Ensure it ends properly
    return shortened.endsWith('.') ? shortened : shortened + '.';
  }
}