import { UserInfo, Story, DifficultyLevel } from "@/types";
import { IntelligentInputProcessor } from "./intelligentInputProcessor";
import { ComprehensiveStoryGenerator } from "./comprehensiveStoryGenerator";
import { PremiumStoryService } from "./premiumStoryService";
import { FreeUserStoryService } from "./freeUserStoryService";

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
  
  // Handle free user story generation
  private static async handleFreeUser(
    processedData: ProcessedUserData,
    difficulty: DifficultyLevel,
    config: ContentManagerConfig
  ): Promise<StoryGenerationResult> {
    
    console.log('🆓 Processing free user with translation support...');
    
    // Generate story using processed inputs
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
  
  // Process all user input fields through the intelligent processor
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
    
    for (const field of fieldsToProcess) {
      const originalValue = userInfo[field as keyof UserInfo] as string;
      if (!originalValue || typeof originalValue !== 'string') continue;
      
      try {
        const processed = await IntelligentInputProcessor.processUserInput(
          originalValue,
          field,
          userInfo
        );
        
        // Update the processed user info with clean English
        (processedUserInfo as any)[field] = processed.processedInput;
        
        // Track translation metrics
        if (processed.needsTranslation) {
          translationReport.fieldsTranslated.push(field);
          translationReport.totalTranslations++;
          totalConfidence += processed.confidence;
          translationCount++;
        }
        
        console.log(`Processed ${field}: \"${originalValue}\" → \"${processed.processedInput}\"`);
        
      } catch (error) {
        console.error(`Failed to process field ${field}:`, error);
        // Keep original value on error
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
    
    // Generate the story using comprehensive generator with clean English inputs
    const storyData = ComprehensiveStoryGenerator.generateStory(userInfo, difficulty, 10);
    
    const story: Story = {
      id: crypto.randomUUID(),
      title: this.generateStoryTitle(userInfo, difficulty),
      segments: storyData.pages.map((page, index) => ({
        text: page,
        illustration: `/api/illustrations/story-${index + 1}.jpg`
      })),
      difficulty,
      estimatedReadingTime: Math.ceil(storyData.pages.join(' ').split(' ').length / 100),
      wordCount: storyData.pages.join(' ').split(' ').length
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
  
  // Fallback story generation
  private static async generateFallbackStory(userInfo: UserInfo, difficulty: DifficultyLevel): Promise<Story> {
    const simpleStory = `Once upon a time, there was a child named ${userInfo.name}. 
    ${userInfo.name} loved ${userInfo.favoriteAnimal}s and ${userInfo.favoriteFood}. 
    One day, ${userInfo.name} went on a wonderful adventure. 
    The end.`;
    
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
}
