// Premium Story Management Service
import { supabase } from '@/integrations/supabase/client';
import { Story, UserInfo, DifficultyLevel } from '@/types/index';

export interface SavedStory {
  id: string;
  title: string;
  content: Story;
  difficulty: DifficultyLevel;
  wordCount: number;
  estimatedReadingTime: number;
  userPreferences: Record<string, any>;
  tags: string[];
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  id?: string;
  userId: string;
  displayName?: string;
  age?: number;
  gradeLevel?: string;
  nativeLanguage?: string;
  learningGoal?: string;
  avatarType?: string;
  avatarSkinTone?: string;
  readingPreferences?: Record<string, any>;
  storyPreferences?: Record<string, any>;
  isPremium?: boolean;
}

export interface StoryCollection {
  id: string;
  name: string;
  description?: string;
  storyIds: string[];
  isDefault: boolean;
  createdAt: Date;
}

export class PremiumStoryManager {
  
  /**
   * Save a story for premium users
   */
  static async saveStory(
    story: Story,
    userInfo: UserInfo,
    tags: string[] = [],
    isFavorite: boolean = false,
    imageCacheMetadata?: any
  ): Promise<SavedStory> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User must be authenticated to save stories');
    }

    const savedStoryData = {
      user_id: user.id,
      title: story.title,
      content: story as any, // JSON serializable
      difficulty: story.difficulty,
      word_count: story.wordCount,
      estimated_reading_time: story.estimatedReadingTime,
      user_preferences: {
        name: userInfo.name,
        age: userInfo.age
        // Personalization data (avatar, colors, etc.) will come from child profiles when active child is selected
      } as any, // JSON serializable
      tags,
      is_favorite: isFavorite,
      image_cache_metadata: imageCacheMetadata || {}
    };

    const { data, error } = await supabase
      .from('saved_stories')
      .insert(savedStoryData)
      .select()
      .single();

    if (error) {
      console.error('Error saving story:', error);
      throw new Error('Failed to save story');
    }

    return this.mapToSavedStory(data);
  }

  /**
   * Get all saved stories for the current user
   */
  static async getSavedStories(sortBy: 'created_at' | 'title' | 'difficulty' = 'created_at'): Promise<SavedStory[]> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User must be authenticated to view saved stories');
    }

    const { data, error } = await supabase
      .from('saved_stories')
      .select('*')
      .eq('user_id', user.id)
      .order(sortBy, { ascending: sortBy === 'title' });

    if (error) {
      console.error('Error fetching saved stories:', error);
      throw new Error('Failed to fetch saved stories');
    }

    return (data || []).map(this.mapToSavedStory);
  }

  /**
   * Get a specific saved story by ID
   */
  static async getSavedStory(storyId: string): Promise<SavedStory | null> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User must be authenticated');
    }

    const { data, error } = await supabase
      .from('saved_stories')
      .select('*')
      .eq('id', storyId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Story not found
      }
      console.error('Error fetching saved story:', error);
      throw new Error('Failed to fetch saved story');
    }

    return this.mapToSavedStory(data);
  }

  /**
   * Delete a saved story
   */
  static async deleteSavedStory(storyId: string): Promise<void> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User must be authenticated');
    }

    const { error } = await supabase
      .from('saved_stories')
      .delete()
      .eq('id', storyId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting story:', error);
      throw new Error('Failed to delete story');
    }
  }

  /**
   * Toggle favorite status of a story
   */
  static async toggleFavorite(storyId: string): Promise<void> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User must be authenticated');
    }

    // First get current status
    const { data: currentStory, error: fetchError } = await supabase
      .from('saved_stories')
      .select('is_favorite')
      .eq('id', storyId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      throw new Error('Story not found');
    }

    const { error } = await supabase
      .from('saved_stories')
      .update({ is_favorite: !currentStory.is_favorite })
      .eq('id', storyId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating favorite status:', error);
      throw new Error('Failed to update favorite status');
    }
  }

  /**
   * Save or update user preferences (simplified for account holder only)
   */
  static async saveUserPreferences(userInfo: UserInfo): Promise<UserPreferences> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User must be authenticated');
    }

    const preferences = {
      user_id: user.id,
      display_name: userInfo.name,
      age: userInfo.age,
      grade_level: userInfo.grade,
      native_language: userInfo.nativeLanguage,
      learning_goal: userInfo.learningGoal,
      avatar_type: 'prefer-not-to-answer', // Account holder has neutral avatar
      avatar_skin_tone: 'medium',
      is_premium: true
    };

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(preferences, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Error saving user preferences:', error);
      throw new Error('Failed to save user preferences');
    }

    return this.mapToUserPreferences(data);
  }

  /**
   * Get user preferences
   */
  static async getUserPreferences(): Promise<UserPreferences | null> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return null;
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No preferences found
      }
      console.error('Error fetching user preferences:', error);
      throw new Error('Failed to fetch user preferences');
    }

    return this.mapToUserPreferences(data);
  }

  /**
   * Search saved stories
   */
  static async searchStories(query: string, filters?: {
    difficulty?: DifficultyLevel;
    tags?: string[];
    isFavorite?: boolean;
  }): Promise<SavedStory[]> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User must be authenticated');
    }

    let queryBuilder = supabase
      .from('saved_stories')
      .select('*')
      .eq('user_id', user.id);

    // Text search in title
    if (query) {
      queryBuilder = queryBuilder.ilike('title', `%${query}%`);
    }

    // Apply filters
    if (filters?.difficulty) {
      queryBuilder = queryBuilder.eq('difficulty', filters.difficulty);
    }

    if (filters?.isFavorite !== undefined) {
      queryBuilder = queryBuilder.eq('is_favorite', filters.isFavorite);
    }

    if (filters?.tags && filters.tags.length > 0) {
      queryBuilder = queryBuilder.overlaps('tags', filters.tags);
    }

    const { data, error } = await queryBuilder.order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching stories:', error);
      throw new Error('Failed to search stories');
    }

    return (data || []).map(this.mapToSavedStory);
  }

  /**
   * Convert UserInfo to UserPreferences format (account holder only)
   */
  static userInfoToPreferences(userInfo: UserInfo): UserPreferences {
    return {
      userId: '', // Will be set when saving
      displayName: userInfo.name,
      age: userInfo.age,
      gradeLevel: userInfo.grade,
      nativeLanguage: userInfo.nativeLanguage,
      learningGoal: userInfo.learningGoal,
      avatarType: 'prefer-not-to-answer',
      avatarSkinTone: 'medium',
      isPremium: true
    };
  }

  /**
   * Convert UserPreferences to UserInfo format (account holder only)
   */
  static preferencesToUserInfo(preferences: UserPreferences): UserInfo {
    return {
      name: preferences.displayName || '',
      age: preferences.age || 6,
      grade: (preferences.gradeLevel as any) || 'K',
      nativeLanguage: (preferences.nativeLanguage as any) || 'en',
      learningGoal: (preferences.learningGoal as any) || 'improve-english-reading',
      avatar: {
        type: 'prefer-not-to-answer',
        skinTone: 'medium'
      },
      // All preferences left optional - no dishonest assumptions
      specialRequest: ''
    };
  }

  // Helper methods
  private static mapToSavedStory(data: any): SavedStory {
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      difficulty: data.difficulty,
      wordCount: data.word_count,
      estimatedReadingTime: data.estimated_reading_time,
      userPreferences: data.user_preferences,
      tags: data.tags || [],
      isFavorite: data.is_favorite,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private static mapToUserPreferences(data: any): UserPreferences {
    return {
      id: data.id,
      userId: data.user_id,
      displayName: data.display_name,
      age: data.age,
      gradeLevel: data.grade_level,
      nativeLanguage: data.native_language,
      learningGoal: data.learning_goal,
      avatarType: data.avatar_type,
      avatarSkinTone: data.avatar_skin_tone,
      readingPreferences: data.reading_preferences,
      storyPreferences: data.story_preferences,
      isPremium: data.is_premium
    };
  }
}

export default PremiumStoryManager;