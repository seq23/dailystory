import { UserInfo, Story, DifficultyLevel } from "@/types";
import { SupportedLanguage } from "@/types/multilingual";
import { SmartInputParser } from "./smartInputParser";
import { ConsolidatedStoryGenerator } from "./consolidatedStoryGenerator";
import { PremiumStoryService } from "./premiumStoryService";
import { FreeUserStoryService } from "./freeUserStoryService";
import { AntiRepetitionSystem } from "@/utils/antiRepetitionSystem";
import { LanguagePreferenceService } from "./languagePreferenceService";

export interface ContentManagerConfig {
  isPremium: boolean;
  userId?: string;
  maxSessions?: number;
}

export interface ProcessedUserData {
  originalUserInfo: UserInfo;
  processedUserInfo: UserInfo;
  translationReport: {
    fieldsTranslated: string[];
    totalTranslations: number;
    averageConfidence: number;
  };
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
  
  // Main orchestration method: Translation → Processing → Story Generation
  static async generateStory(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    config: ContentManagerConfig
  ): Promise<StoryGenerationResult> {
    console.log('🚀 Universal Content Manager: Starting ENHANCED story generation pipeline');
    
    // Validate language configuration before proceeding
    const languageValidation = LanguagePreferenceService.validateLanguageConfiguration(userInfo);
    if (!languageValidation.isValid) {
      console.warn('Language configuration issues:', languageValidation.issues);
    }

    const languageConfig = LanguagePreferenceService.getLanguageConfig(userInfo);
    console.log('🌐 Language Configuration:', languageConfig);
    
    try {
      // Step 1: Process all user inputs through intelligent processing (Translation + Spelling + Grammar)
      const processedData = await this.processAllUserInputs(userInfo);
      
      console.log('✨ Translation Report:', processedData.translationReport);
      
      // Step 2: Route to appropriate service based on premium status
      if (config.isPremium) {
        return await this.handlePremiumUser(processedData, difficulty, config);
      } else {
        return await this.handleFreeUser(processedData, difficulty, config);
      }
      
    } catch (error) {
      console.error('Universal Content Manager error:', error);
      
      // Graceful fallback - generate basic story with original inputs
      const fallbackStory = await this.generateFallbackStory(userInfo, difficulty);
      
      return {
        story: fallbackStory,
        isNewStory: true,
        isContinuation: false,
        sessionInfo: {
          sessionNumber: 1,
          remainingSessions: config.isPremium ? -1 : 99,
          isUnlimited: config.isPremium
        }
      };
    }
  }
  
  // Handle premium user story generation
  private static async handlePremiumUser(
    processedData: ProcessedUserData,
    difficulty: DifficultyLevel,
    config: ContentManagerConfig
  ): Promise<StoryGenerationResult> {
    
    console.log('👑 Processing premium user with enhanced features...');
    
    // Generate story using processed inputs
    const story = await this.generateNewStory(processedData.processedUserInfo, difficulty, config);
    
    return {
      story,
      isNewStory: true,
      isContinuation: false,
      sessionInfo: {
        sessionNumber: 1,
        remainingSessions: -1, // Unlimited
        isUnlimited: true
      }
    };
  }
  
  // Handle free user story generation with session management
  private static async handleFreeUser(
    processedData: ProcessedUserData,
    difficulty: DifficultyLevel,
    config: ContentManagerConfig
  ): Promise<StoryGenerationResult> {
    
    console.log('🆓 Processing free user with enhanced session management...');
    
    try {
      // Use FreeUserStoryService for proper session management and caching
      const result = await FreeUserStoryService.generateStoryWithCaching(
        processedData.processedUserInfo,
        difficulty,
        { translationContext: processedData.translationReport, userId: config.userId }
      );
      
      return {
        story: result.story,
        isNewStory: !result.isCachedResult,
        isContinuation: false,
        sessionInfo: {
          sessionNumber: result.sessionInfo?.currentSession || 1,
          remainingSessions: Math.max(0, 100 - (result.sessionInfo?.currentSession || 1)),
          isUnlimited: false
        }
      };
      
    } catch (error) {
      console.error('FreeUserStoryService failed, falling back to basic generation:', error);
      
      // Fallback to basic story generation
      const story = await this.generateNewStory(processedData.processedUserInfo, difficulty, config);
      
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
  }
  
  // Process all user input fields through the smart input parser
  private static async processAllUserInputs(userInfo: UserInfo): Promise<ProcessedUserData> {
    const fieldsToProcess = [
      'name',
      'favoriteAnimal', 
      'favoriteFood',
      'hobbies',
      'specialRequest'
    ];
    
    const processedUserInfo = { ...userInfo };
    const translationReport = {
      fieldsTranslated: [] as string[],
      totalTranslations: 0,
      averageConfidence: 0
    };
    
    let totalConfidence = 0;
    let translationCount = 0;
    
    // Collect all input tags for batch processing
    const allTags: string[] = [];
    fieldsToProcess.forEach(field => {
      const value = userInfo[field as keyof UserInfo] as string;
      if (value && typeof value === 'string') {
        allTags.push(...value.split(',').map(s => s.trim()).filter(Boolean));
      }
    });
    
    if (allTags.length > 0) {
      try {
        // Use SmartInputParser for processing
        const parsed = await SmartInputParser.parseTaggedInput(allTags, userInfo, true);
        
        // Apply corrections back to user info fields
        for (const field of fieldsToProcess) {
          const originalValue = userInfo[field as keyof UserInfo] as string;
          if (!originalValue || typeof originalValue !== 'string') continue;
          
          // Process each tag in the field
          const fieldTags = originalValue.split(',').map(s => s.trim()).filter(Boolean);
          const processedTags = fieldTags.map(tag => {
            const parsedTag = parsed.parsedTags.find(pt => pt.original.toLowerCase() === tag.toLowerCase());
            return parsedTag ? parsedTag.corrected : tag;
          });
          
          (processedUserInfo as any)[field] = processedTags.join(', ');
          
          // Track processing metrics
          const hasCorrections = fieldTags.some(tag => 
            parsed.parsedTags.some(pt => pt.original.toLowerCase() === tag.toLowerCase() && pt.original !== pt.corrected)
          );
          
          if (hasCorrections) {
            translationReport.fieldsTranslated.push(field);
            translationReport.totalTranslations++;
            totalConfidence += 0.9; // High confidence for spelling corrections
            translationCount++;
          }
          
          console.log(`Processed ${field}: "${originalValue}" → "${(processedUserInfo as any)[field]}"`);
        }
        
      } catch (error) {
        console.error('SmartInputParser failed:', error);
        // Keep original values on error
      }
    }
    
    // Calculate average confidence
    if (translationCount > 0) {
      translationReport.averageConfidence = totalConfidence / translationCount;
    }
    
    return {
      originalUserInfo: userInfo,
      processedUserInfo,
      translationReport
    };
  }
  
  // Generate a new story with processed inputs
  private static async generateNewStory(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    config: ContentManagerConfig
  ): Promise<Story> {
    
    // Get language configuration for story generation
    const languageConfig = LanguagePreferenceService.getLanguageConfig(userInfo);
    
    // Generate the story using consolidated generator with clean English inputs
    const storyResult = await ConsolidatedStoryGenerator.generateStory(userInfo, difficulty, {
      pageCount: 10, // Premium users get 10 pages
      language: languageConfig.storyLanguage,
      useSmartParsing: true,
      antiRepetition: true,
      culturalAdaptation: true
    });
    
    const story: Story = {
      id: crypto.randomUUID(),
      title: this.generateStoryTitle(userInfo, difficulty),
      segments: storyResult.story.segments.map((segment, index) => ({
        text: segment.text,
        illustration: `/api/illustrations/story-${index + 1}.jpg`
      })),
      difficulty,
      estimatedReadingTime: storyResult.story.estimatedReadingTime,
      wordCount: storyResult.story.wordCount
    };
    
    return story;
  }
  
  // Generate appropriate story title
  private static generateStoryTitle(userInfo: UserInfo, difficulty: DifficultyLevel): string {
    const templates = {
      easy: [`${userInfo.name} and the ${userInfo.favoriteAnimal}`, `${userInfo.name}'s Day`],
      medium: [`${userInfo.name}'s Adventure`, `The Mystery of ${userInfo.favoriteAnimal}`],
      hard: [`${userInfo.name} and the Quest for ${userInfo.favoriteFood}`, `The Chronicles of ${userInfo.name}`],
      expert: [`${userInfo.name}: The Journey Begins`, `Tales from ${userInfo.name}'s World`]
    };
    
    const titleOptions = templates[difficulty] || templates.easy;
    return titleOptions[Math.floor(Math.random() * titleOptions.length)];
  }
  
  // Fallback story generation with anti-repetition tracking
  private static async generateFallbackStory(userInfo: UserInfo, difficulty: DifficultyLevel): Promise<Story> {
    const simpleStory = `Once upon a time, there was a child named ${userInfo.name}. 
    ${userInfo.name} loved ${userInfo.favoriteAnimal}s and ${userInfo.favoriteFood}. 
    One day, ${userInfo.name} went on a wonderful adventure. 
    The end.`;
    
    // Add to anti-repetition system even for fallback
    try {
      await AntiRepetitionSystem.addContent(simpleStory);
    } catch (error) {
      console.error('Error adding fallback story to anti-repetition:', error);
    }
    
    return {
      id: crypto.randomUUID(),
      title: `${userInfo.name}'s Simple Story`,
      segments: [{
        text: simpleStory,
        illustration: '/api/illustrations/fallback.jpg'
      }],
      difficulty,
      estimatedReadingTime: 1,
      wordCount: simpleStory.split(' ').length
    };
  }

  /**
   * Generates a new story for free users while preserving anti-repetition cache
   */
  static async generateNewStoryWithAntiRepetition(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    config: ContentManagerConfig
  ): Promise<StoryGenerationResult> {
    console.log('🔄 Generating new story for free user with anti-repetition preservation');
    
    try {
      // Process user inputs for translation/correction
      const processedData = await this.processAllUserInputs(userInfo);
      
      // Generate a NEW story (not continuation) but preserve anti-repetition state
      const storyResult = await ConsolidatedStoryGenerator.generateStory(
        processedData.processedUserInfo,
        difficulty,
        {
          pageCount: 10, // FIXED: Request 10 pages instead of 5
          language: LanguagePreferenceService.getStoryLanguage(processedData.processedUserInfo),
          useSmartParsing: true,
          antiRepetition: true,
          culturalAdaptation: true,
          preserveAntiRepetition: true // IMPORTANT: This preserves the anti-repetition cache
        }
      );

      // Enhanced validation: ensure we have exactly 10 pages with quality content
      const story = this.validateAndEnsureCompleteness(storyResult.story, userInfo, difficulty);

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
    } catch (error) {
      console.error('Error generating new story with anti-repetition:', error);
      const fallbackStory = await this.generateFallbackStory(userInfo, difficulty);
      return {
        story: fallbackStory,
        isNewStory: true,
        isContinuation: false,
        sessionInfo: {
          sessionNumber: 1,
          remainingSessions: 99,
          isUnlimited: false
        }
      };
    }
  }

  /**
   * Validates story completeness and fills gaps with contextual content
   */
  private static validateAndEnsureCompleteness(
    story: Story,
    userInfo: UserInfo,
    difficulty: DifficultyLevel
  ): Story {
    const targetPages = 10;
    let segments = [...story.segments];
    
    console.log(`Story validation: received ${segments.length} pages, target: ${targetPages}`);
    
    // If we have fewer than target pages, generate contextual continuation content
    if (segments.length < targetPages) {
      const missingPages = targetPages - segments.length;
      console.log(`Generating ${missingPages} contextual continuation pages...`);
      
      // Create contextual continuation templates based on difficulty
      const continuationTemplates = this.getContinuationTemplates(difficulty);
      
      for (let i = 0; i < missingPages; i++) {
        const templateIndex = i % continuationTemplates.length;
        let continuationText = continuationTemplates[templateIndex];
        
        // Replace placeholders with user-specific content
        continuationText = continuationText
          .replace(/{name}/g, userInfo.name)
          .replace(/{animal}/g, userInfo.favoriteAnimal || 'animal')
          .replace(/{hobby}/g, userInfo.hobbies || 'adventure')
          .replace(/{food}/g, userInfo.favoriteFood || 'treats')
          .replace(/{color}/g, userInfo.favoriteColor || 'bright');
        
        segments.push({
          text: continuationText,
          illustration: undefined,
          audioUrl: undefined
        });
      }
    }
    
    // If we have too many pages, trim to target
    if (segments.length > targetPages) {
      segments = segments.slice(0, targetPages);
    }
    
    return {
      ...story,
      segments,
      wordCount: segments.reduce((count, segment) => 
        count + segment.text.split(' ').filter(word => word.trim()).length, 0
      )
    };
  }

  /**
   * Get contextual continuation templates based on difficulty
   */
  private static getContinuationTemplates(difficulty: DifficultyLevel): string[] {
    const templates = {
      easy: [
        "{name} finds a new {color} {animal} friend.",
        "The {animal} shows {name} a secret place.",
        "{name} learns something new about {hobby}.",
        "They discover a magical {food} tree.",
        "The adventure becomes even more exciting!",
        "{name} helps the {animal} solve a puzzle.",
        "Together they explore the wonderful world.",
        "The {color} sky makes everything beautiful."
      ],
      medium: [
        "{name} discovers an ancient mystery about the {animal}.",
        "The {hobby} skills help {name} overcome a new challenge.",
        "A wise elder teaches {name} about {color} magic.",
        "The journey leads to a hidden {food} sanctuary.",
        "{name} must choose between two important paths.",
        "The {animal} reveals a special talent.",
        "New friends join {name} on the adventure.",
        "The story reaches an exciting turning point."
      ],
      hard: [
        "{name} uncovers the deeper meaning behind the {animal}'s behavior.",
        "The mastery of {hobby} becomes crucial for the quest.",
        "An unexpected alliance changes everything for {name}.",
        "The {color} crystal holds the key to the mystery.",
        "{name} faces a moral dilemma about {food} distribution.",
        "The {animal} community depends on {name}'s decision.",
        "Ancient wisdom guides {name} through uncertainty.",
        "The adventure reveals {name}'s true potential."
      ],
      expert: [
        "{name} contemplates the philosophical implications of the {animal}'s existence.",
        "The pursuit of {hobby} leads to profound self-discovery.",
        "Existential questions about {color} perception arise.",
        "The {food} becomes a metaphor for life's abundance.",
        "{name} grapples with complex ethical considerations.",
        "The {animal}'s wisdom transcends ordinary understanding.",
        "Universal truths emerge through {name}'s journey.",
        "The narrative reaches transcendent dimensions."
      ]
    };
    
    return templates[difficulty] || templates.easy;
  }

  // Continue existing story for premium users
  static async continueExistingStory(
    currentStory: string[],
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    config: ContentManagerConfig
  ): Promise<Story> {
    console.log('🔄 Continuing existing story for premium user...');
    
    try {
      // Get the last few pages for context
      const lastPages = currentStory.slice(-3).join(' ');
      const contextualUserInfo = {
        ...userInfo,
        specialRequest: `Continue this story: ${lastPages}. Add 5 new pages that follow naturally from where the story left off.`
      };
      
      // Generate continuation using consolidated generator
      // Create a special configuration that preserves anti-repetition state
      const continuationConfig = {
        pageCount: 5,
        language: LanguagePreferenceService.getStoryLanguage(userInfo),
        useSmartParsing: true,
        antiRepetition: true,
        culturalAdaptation: true,
        preserveAntiRepetition: true // Special flag for continuation
      };
      
      const storyResult = await ConsolidatedStoryGenerator.generateStory(contextualUserInfo, difficulty, continuationConfig);
      
      const story: Story = {
        id: crypto.randomUUID(),
        title: this.generateStoryTitle(userInfo, difficulty),
        segments: storyResult.story.segments.map((segment, index) => ({
          text: segment.text,
          illustration: `/api/illustrations/story-${index + 1}.jpg`
        })),
        difficulty,
        estimatedReadingTime: storyResult.story.estimatedReadingTime,
        wordCount: storyResult.story.wordCount
      };
      
      return story;
      
    } catch (error) {
      console.error('Story continuation failed:', error);
      // Fallback to basic continuation
      return await this.generateFallbackStory(userInfo, difficulty);
    }
  }
}
