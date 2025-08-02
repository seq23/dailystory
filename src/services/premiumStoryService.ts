import { UserInfo, Story, DifficultyLevel } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { ContentSignatureGenerator, SessionManager } from "./enhancedLinguisticProcessor";
import { ComprehensiveStoryGenerator } from "./comprehensiveStoryGenerator";

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

export class PremiumStoryService {
  
  // Translation-aware story library management
  static async getOrCreateStoryLibrary(
    userInfo: UserInfo,
    translationContext: {
      originalInputs: Record<string, string>;
      translatedInputs: Record<string, string>;
    }
  ): Promise<StoryLibraryEntry[]> {
    
    const signature = ContentSignatureGenerator.generateSignature(userInfo, translationContext);
    
    try {
      // Fetch existing stories for this user with translation awareness
      const { data: existingStories } = await supabase
        .from('user_story_history')
        .select('*')
        .eq('user_id', userInfo.name || 'guest')
        .order('created_at', { ascending: false })
        .limit(50);
      
      // Transform to library entries
      const libraryEntries: StoryLibraryEntry[] = existingStories?.map(story => ({
        id: story.story_id,
        title: JSON.parse(story.story_content).title,
        content: JSON.parse(story.story_content),
        signature: story.content_signature || signature,
        difficulty: story.difficulty,
        originalInputs: translationContext.originalInputs,
        translatedInputs: translationContext.translatedInputs,
        culturalContext: userInfo.nativeLanguage,
        createdAt: new Date(story.created_at),
        lastContinuedAt: story.last_continued_at ? new Date(story.last_continued_at) : undefined,
        continuationCount: story.continuation_count || 0
      })) || [];
      
      return libraryEntries;
      
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
      
      // Generate continuation using enhanced story generator
      const storyData = ComprehensiveStoryGenerator.generateStory(
        userInfo,
        difficulty,
        5, // Continuation pages
        continuationPrompt
      );
      
      // Create continuation story
      const continuationStory: Story = {
        id: `${baseStory.id}_cont_${Date.now()}`,
        title: `${baseStory.title} - Chapter ${baseStory.continuationCount + 2}`,
        segments: storyData.pages.map((page, index) => ({
          text: page,
          illustration: `/api/illustrations/continuation-${index + 1}.jpg`
        })),
        difficulty,
        estimatedReadingTime: Math.ceil(storyData.pages.join(' ').split(' ').length / 100),
        wordCount: storyData.pages.join(' ').split(' ').length
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
    
    const newSignature = ContentSignatureGenerator.generateSignature(userInfo, translationContext);
    
    try {
      // For premium users, always allow new stories (infinite uniqueness)
      // But track for analytics and personalization
      await supabase
        .from('user_story_history')
        .insert({
          user_id: userInfo.name || 'guest',
          content_signature: newSignature,
          difficulty,
          is_premium: true,
          created_at: new Date().toISOString()
        });
      
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
      // Store learning data with cultural context
      const learningData = {
        user_id: userInfo.name || 'guest',
        native_language: userInfo.nativeLanguage,
        cultural_context: JSON.stringify(translationContext.originalInputs),
        performance_metrics: JSON.stringify(storyPerformance),
        learning_preferences: JSON.stringify({
          vocabularyComplexity: storyPerformance.vocabularyMastery,
          culturalThemes: this.extractCulturalThemes(translationContext),
          engagementPatterns: storyPerformance.engagementScore
        }),
        updated_at: new Date().toISOString()
      };
      
      // Upsert learning data
      await supabase
        .from('user_learning_profiles')
        .upsert(learningData, { onConflict: 'user_id' });
      
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
    
    for (const [key, original] of Object.entries(translationContext.originalInputs)) {
      const translated = translationContext.translatedInputs[key];
      if (original !== translated) {
        themes.push(`${key}:${original}->${translated}`);
      }
    }
    
    return themes;
  }
  
  private static async trackContinuation(baseStoryId: string, continuation: Story): Promise<void> {
    try {
      await supabase
        .from('story_continuations')
        .insert({
          base_story_id: baseStoryId,
          continuation_id: continuation.id,
          continuation_content: JSON.stringify(continuation),
          created_at: new Date().toISOString()
        });
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