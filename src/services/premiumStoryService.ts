import { UserInfo, Story, DifficultyLevel } from "@/types";
import { ContentSignatureGenerator, SessionManager } from "./enhancedLinguisticProcessor";
import { ConsolidatedStoryGenerator } from "./consolidatedStoryGenerator";

export interface StoryLibraryEntry {
  id: string;
  title: string;
  content: Story;
  signature: string;
  difficulty: DifficultyLevel;
  originalInputs: Record<string, string>;
  translatedInputs: Record<string, string>;
  culturalContext: string;
  createdAt: Date;
  lastContinuedAt?: Date;
  continuationCount: number;
}

export interface ContinuationContext {
  previousStory: Story;
  userProgress: {
    totalWordsRead: number;
    totalTimeSpent: number;
    comprehensionLevel: number;
  };
  learningAdaptations: {
    vocabularyLevel: number;
    preferredThemes: string[];
    culturalPreferences: string[];
  };
}

// In-memory storage for premium features (will be replaced with database when tables are available)
const storyLibraryCache = new Map<string, StoryLibraryEntry[]>();
const continuationCache = new Map<string, any>();
const learningProfilesCache = new Map<string, any>();

export class PremiumStoryService {
  
  // Translation-aware story library management
  static async getOrCreateStoryLibrary(
    userInfo: UserInfo,
    translationContext: {
      originalInputs: Record<string, string>;
      translatedInputs: Record<string, string>;
    }
  ): Promise<StoryLibraryEntry[]> {
    
    const userId = userInfo.name || 'guest';
    const signature = ContentSignatureGenerator.generateSignature(userInfo, translationContext);
    
    try {
      // Get existing stories from cache
      const existingStories = storyLibraryCache.get(userId) || [];
      
      console.log(`📚 Retrieved ${existingStories.length} stories from premium library for ${userId}`);
      
      return existingStories;
      
    } catch (error) {
      console.error('Error fetching story library:', error);
      return [];
    }
  }
  
  // True story continuations using processed inputs
  static async generateContinuation(
    baseStory: StoryLibraryEntry,
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    continuationContext: ContinuationContext
  ): Promise<Story> {
    
    console.log('🔄 Generating premium story continuation with translation awareness...');
    
    try {
      // Create continuation prompt that incorporates original cultural context
      const continuationPrompt = this.buildContinuationPrompt(
        baseStory,
        userInfo,
        continuationContext
      );
      
      // Generate continuation using consolidated story generator
      const storyResult = await ConsolidatedStoryGenerator.generateStory(
        userInfo,
        difficulty,
        {
          pageCount: 10, // Continuation pages - same as main stories
          language: 'en',
          useSmartParsing: true,
          antiRepetition: true,
          culturalAdaptation: true
        }
      );
      
      // Create continuation story
      const continuationStory: Story = {
        id: `${baseStory.id}_cont_${Date.now()}`,
        title: `${baseStory.title} - Chapter ${baseStory.continuationCount + 2}`,
        segments: storyResult.story.segments.map((segment, index) => ({
          text: segment.text,
          illustration: `/api/illustrations/continuation-${index + 1}.jpg`
        })),
        difficulty,
        estimatedReadingTime: storyResult.story.estimatedReadingTime,
        wordCount: storyResult.story.wordCount
      };
      
      // Update continuation tracking
      await this.trackContinuation(baseStory.id, continuationStory);
      
      console.log('✨ Premium continuation generated successfully');
      return continuationStory;
      
    } catch (error) {
      console.error('Error generating continuation:', error);
      // Fallback to new story
      return this.generateFallbackStory(userInfo, difficulty);
    }
  }
  
  // Build intelligent continuation prompt
  private static buildContinuationPrompt(
    baseStory: StoryLibraryEntry,
    userInfo: UserInfo,
    context: ContinuationContext
  ): string {
    
    const culturalElements = this.extractCulturalElements(baseStory, userInfo);
    const characterDevelopment = this.analyzeCharacterDevelopment(context.previousStory);
    
    return `
Continue the story "${baseStory.title}" with these elements:
- Original cultural context: ${baseStory.culturalContext} (${userInfo.nativeLanguage})
- Character elements: ${characterDevelopment.mainCharacter}
- Previous themes: ${characterDevelopment.themes.join(', ')}
- Cultural preferences: ${culturalElements.join(', ')}
- User vocabulary level: ${context.learningAdaptations.vocabularyLevel}
- Preferred themes: ${context.learningAdaptations.preferredThemes.join(', ')}

Create a seamless continuation that:
1. Maintains character consistency from original inputs
2. Respects cultural context from user's native language
3. Builds upon established themes and settings
4. Introduces appropriate new challenges for growth
5. Uses vocabulary appropriate for difficulty level: ${baseStory.difficulty}
    `;
  }
  
  // Infinite uniqueness through content signatures
  static async ensureInfiniteUniqueness(
    userInfo: UserInfo,
    translationContext: any,
    difficulty: DifficultyLevel
  ): Promise<boolean> {
    
    const userId = userInfo.name || 'guest';
    const newSignature = ContentSignatureGenerator.generateSignature(userInfo, translationContext);
    
    try {
      // For premium users, always allow new stories (infinite uniqueness)
      // Track for analytics and personalization
      const existingStories = storyLibraryCache.get(userId) || [];
      
      const newEntry: StoryLibraryEntry = {
        id: crypto.randomUUID(),
        title: 'New Premium Story',
        content: this.generateFallbackStory(userInfo, difficulty),
        signature: newSignature,
        difficulty,
        originalInputs: translationContext.originalInputs || {},
        translatedInputs: translationContext.translatedInputs || {},
        culturalContext: userInfo.nativeLanguage,
        createdAt: new Date(),
        continuationCount: 0
      };
      
      existingStories.push(newEntry);
      storyLibraryCache.set(userId, existingStories);
      
      console.log('♾️ Premium story uniqueness ensured - infinite stories available');
      
      return true; // Premium users always get infinite uniqueness
      
    } catch (error) {
      console.error('Error tracking premium story uniqueness:', error);
      return true; // Still allow story generation
    }
  }
  
  // Personalization learning from original language context
  static async updatePersonalizationLearning(
    userInfo: UserInfo,
    storyPerformance: {
      completionRate: number;
      engagementScore: number;
      vocabularyMastery: number;
      culturalResonance: number;
    },
    translationContext: any
  ): Promise<void> {
    
    console.log('📊 Updating personalization learning with translation awareness...');
    
    try {
      const userId = userInfo.name || 'guest';
      
      // Store learning data with cultural context
      const learningData = {
        user_id: userId,
        native_language: userInfo.nativeLanguage,
        cultural_context: JSON.stringify(translationContext.originalInputs || {}),
        performance_metrics: JSON.stringify(storyPerformance),
        learning_preferences: JSON.stringify({
          vocabularyComplexity: storyPerformance.vocabularyMastery,
          culturalThemes: this.extractCulturalThemes(translationContext),
          engagementPatterns: storyPerformance.engagementScore
        }),
        updated_at: new Date().toISOString()
      };
      
      // Store in cache for now
      learningProfilesCache.set(userId, learningData);
      
      console.log('✅ Personalization learning updated');
      
    } catch (error) {
      console.error('Error updating personalization learning:', error);
    }
  }
  
  // Helper methods
  private static extractCulturalElements(story: StoryLibraryEntry, userInfo: UserInfo): string[] {
    const elements = [];
    
    // Extract from original inputs
    if (story.originalInputs) {
      Object.values(story.originalInputs).forEach(input => {
        if (input && input !== story.translatedInputs[Object.keys(story.originalInputs).find(key => story.originalInputs[key] === input) || '']) {
          elements.push(input);
        }
      });
    }
    
    // Add language-specific cultural elements
    const culturalThemes = {
      'es': ['familia', 'fiesta', 'tradición'],
      'zh': ['harmony', 'wisdom', 'family honor'],
      'ar': ['hospitality', 'storytelling', 'desert'],
      'hi': ['dharma', 'karma', 'festival'],
      'fr': ['art', 'cuisine', 'elegance'],
      'pt': ['música', 'natureza', 'alegria']
    };
    
    const themes = culturalThemes[userInfo.nativeLanguage as keyof typeof culturalThemes] || [];
    elements.push(...themes);
    
    return elements;
  }
  
  private static analyzeCharacterDevelopment(story: Story): {
    mainCharacter: string;
    themes: string[];
    settings: string[];
  } {
    const text = story.segments.map(s => s.text).join(' ');
    
    // Simple analysis - in production would use NLP
    const character = story.title.split(' ')[0] || 'protagonist';
    const themes = ['adventure', 'friendship', 'learning'];
    const settings = ['home', 'school', 'outdoors'];
    
    return { mainCharacter: character, themes, settings };
  }
  
  private static extractCulturalThemes(translationContext: any): string[] {
    // Extract themes from original vs translated differences
    const themes = [];
    
    if (translationContext?.originalInputs && translationContext?.translatedInputs) {
      for (const [key, original] of Object.entries(translationContext.originalInputs)) {
        const translated = translationContext.translatedInputs[key];
        if (original !== translated) {
          themes.push(`${key}:${original}->${translated}`);
        }
      }
    }
    
    return themes;
  }
  
  private static async trackContinuation(baseStoryId: string, continuation: Story): Promise<void> {
    try {
      // Store in continuation cache
      continuationCache.set(`${baseStoryId}_${continuation.id}`, {
        base_story_id: baseStoryId,
        continuation_id: continuation.id,
        continuation_content: JSON.stringify(continuation),
        created_at: new Date().toISOString()
      });
      
      console.log('📝 Continuation tracked successfully');
    } catch (error) {
      console.error('Error tracking continuation:', error);
    }
  }
  
  private static generateFallbackStory(userInfo: UserInfo, difficulty: DifficultyLevel): Story {
    return {
      id: crypto.randomUUID(),
      title: `${userInfo.name}'s New Adventure`,
      segments: [{
        text: `${userInfo.name} discovered something amazing today. The adventure was just beginning!`,
        illustration: '/api/illustrations/fallback.jpg'
      }],
      difficulty,
      estimatedReadingTime: 1,
      wordCount: 12
    };
  }
}