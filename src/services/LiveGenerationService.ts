// Live Generation Service for Premium Users
// Generates stories page-by-page with backend validation

import { supabase } from '@/integrations/supabase/client';
import type { UserInfo, DifficultyLevel, ExpertGradeLevel, Grade, LanguageCode, LearningGoal, AvatarType, SkinTone } from '@/types';
import { getTokenLimitForDifficulty, STORY_PROMPTS, EXPERT_STORY_PROMPTS, getStoryPrompt, getExpertStoryPrompt, formatUserPrompt } from '../../supabase/functions/_shared/storyPrompts';
import { DifficultyLevelMapper } from '../../supabase/functions/_shared/DifficultyLevelMapper';
import { ErrorHandler } from '@/utils/errorHandling';
import { ExpertDifficultyManager } from '@/services/expertDifficultyManager';
import { ErrorHandlingManager } from '@/services/errorHandlingManager';
import { generateSessionIdWithPrefix } from '@/utils/sessionId';
import { APP_CONFIG } from '@/config/appConfig';
import { toast } from '@/hooks/use-toast';
import { RepairService } from './repairService';
import { DebugLogger } from '@/services/DebugLogger';

export interface LiveGenerationContext {
  userInfo: UserInfo;
  difficulty: string; // Frontend difficulty level - will be converted to backend in service methods
  expertGradeLevel?: ExpertGradeLevel;
  storyContext: string[];
  currentPage: number;
  totalExpectedPages: number;
  characters: string[];
}

export interface LivePageResult {
  content: string | string[];
  isComplete: boolean;
  nextContext?: LiveGenerationContext;
  error?: string;
  endingPageCount?: number;
}

export class LiveGenerationService {
  /**
   * Generate the first page of a story for premium users
   */
  static async generateFirstPage(userInfo: UserInfo, sessionType?: 'new' | 'continuation' | 'rewrite', vocabularyData?: any, sessionId?: string): Promise<LivePageResult> {
    try {
      DebugLogger.log('story', 'Starting first page generation', { user: userInfo.name });
      DebugLogger.log('story', 'LiveGen: First page generation started', { 
        user: userInfo.name, 
        sessionType, 
        hasVocabulary: !!vocabularyData,
        providedSessionId: sessionId 
      });
      
      // userInfo.difficultyLevel is already in backend format after form submission
      const difficulty: DifficultyLevel = (userInfo.difficultyLevel || 'beginner') as DifficultyLevel;
      DebugLogger.log('story', `Live: Using backend difficulty: "${difficulty}"`, { user: userInfo.name });
      
      // Premium Expert: adaptive grade selection
      let expertGradeLevel: ExpertGradeLevel | undefined;
      
      if (difficulty === 'expert') {
        // Premium expert progression: adaptive grade selection
        expertGradeLevel = await ExpertDifficultyManager.getExpertGradeLevel(userInfo);
        DebugLogger.log('story', `Using adaptive expert grade ${expertGradeLevel}`, { user: userInfo.name });
      }
      
      DebugLogger.log('story', 'Using unified 4-tier system');
      
      const { StoryGenerationService } = await import('./storyGenerationService');
      
      // CRITICAL FIX: Use consistent session ID format with comprehensive debugging
      const actualSessionId = sessionId || generateSessionIdWithPrefix(`live-first-${userInfo.name}`);
      DebugLogger.log('story', 'LiveGen: First Page Session ID created with enhanced debugging', { 
        actualSessionId,
        providedSessionId: sessionId,
        sessionType: 'first-page',
        userInfo: { 
          name: userInfo.name,
          difficultyLevel: userInfo.difficultyLevel,
          hasSpecialRequest: !!userInfo.specialRequest
        },
        generationContext: {
          isFirstPage: true,
          expertGradeLevel,
          backendDifficulty: difficulty
        },
        timestamp: new Date().toISOString()
      });
      
      const result = await StoryGenerationService.generateStory(userInfo, {
        sessionType: 'premium',
        pageNumber: 1,
        expertGradeLevel,
        difficulty,
        sessionId: actualSessionId
      });

      if (!result.success || !result.pages || result.pages.length === 0) {
        DebugLogger.error('story', '4-tier system failed', result.error);
        return this.generateFallbackFirstPage(userInfo, difficulty, 'unified_system_error');
      }

      // Extract first page from unified system - backend handles all validation
      const content = result.pages[0] || '';
      DebugLogger.log('story', 'Content received from backend');
      
      // Create context with deep cloning to prevent data loss
      const storyContext: LiveGenerationContext = {
        userInfo: userInfo ? JSON.parse(JSON.stringify(userInfo)) : { 
          name: 'Hero',
          age: 8,
          grade: 'K' as Grade,
          difficultyLevel: 'beginner',
          expertGradeLevel: "6th" as ExpertGradeLevel,
          nativeLanguage: 'en' as LanguageCode,
          learningGoal: 'improve-english-reading' as LearningGoal,
          avatar: { type: 'prefer-not-to-answer' as AvatarType, skinTone: 'medium' as SkinTone },
          specialRequest: ''
          // favoriteColor, favoriteAnimal etc. omitted = truly optional
        }, // Deep clone with honest fallback
        difficulty: userInfo.difficultyLevel,
        expertGradeLevel: expertGradeLevel || undefined,
        storyContext: [content],
        currentPage: 1,
        totalExpectedPages: 999,
        characters: [userInfo?.name || 'Hero', userInfo?.favoriteAnimal ? userInfo.favoriteAnimal : 'friendly companion']
      };
      
      // Validate context integrity
      if (!storyContext.userInfo?.name) {
        DebugLogger.warn('story', 'LiveGen: Missing user name in context, using fallback');
        storyContext.userInfo = { ...storyContext.userInfo, name: 'Hero' };
      }

      // PHASE 4: Use dynamic character validation based on level
      const { mapDifficultyToLevel, getMinCharactersPerPage } = await import('../../supabase/functions/_shared/validation-utils');
      const validationLevel = mapDifficultyToLevel(expertGradeLevel || difficulty);
      const minCharsPerPage = getMinCharactersPerPage(validationLevel);
      const hasValidContent = result.pages && result.pages.length > 0 && result.pages[0] && result.pages[0].length >= minCharsPerPage;
      DebugLogger.log('story', 'Dynamic content validation completed', { 
        contentLength: result.pages?.[0]?.length, 
        minRequired: minCharsPerPage, 
        validationLevel, 
        difficulty, 
        expertGradeLevel 
      });
      
      if (hasValidContent) {
        try {
          (globalThis as any).__LAST_PAGE_SOURCE__ = 'ai';
          (globalThis as any).__LAST_STORY_SOURCE__ = 'ai';
          DebugLogger.log('story', 'Confirmed AI-generated content, setting source tracking');
        } catch {}
      } else {
        DebugLogger.warn('story', 'AI call succeeded but content insufficient, setting source to unknown');
        try {
          (globalThis as any).__LAST_PAGE_SOURCE__ = 'unknown';
          (globalThis as any).__LAST_STORY_SOURCE__ = 'unknown';
          DebugLogger.warn('story', 'Set Live source to unknown due to insufficient content');
        } catch {}
      }

      // Create initial context for continuation
      const initialContext: LiveGenerationContext = {
        userInfo,
        difficulty: userInfo.difficultyLevel,
        expertGradeLevel,
        storyContext: [content],
        currentPage: 1,
        totalExpectedPages: 10,
        characters: [userInfo.name]
      };
      
      // FIXED: Always ensure nextContext is provided for continuation
      DebugLogger.log('story', '✅ Live Generation: First page context created', {
        contextPage: initialContext.currentPage,
        storyContextLength: initialContext.storyContext.length,
        difficulty: initialContext.difficulty,
        expertGradeLevel: initialContext.expertGradeLevel
      });

      return {
        content,
        isComplete: false,
        nextContext: initialContext
      };
      
    } catch (error) {
      DebugLogger.error('story', 'Live Generation: Error generating first page', error);
      const wrappedError = ErrorHandler.handleError(error as Error, 'LiveGenerationService.generateFirstPage');
      const fallbackDifficulty: DifficultyLevel = DifficultyLevelMapper.toBackend(userInfo.difficultyLevel || 'beginner');
      DebugLogger.log('story', `Live Generation Error Fallback: Using difficulty ${fallbackDifficulty} for ${userInfo.name}`, { fallbackDifficulty, userName: userInfo.name });
      return this.generateFallbackFirstPage(userInfo, fallbackDifficulty, 'generation_error');
    }
  }

  static async generateNextPage(context: LiveGenerationContext, vocabularyData?: any, userRequestedEnding?: boolean, sessionId?: string): Promise<LivePageResult> {
    try {
      const nextPageNumber = context.currentPage + 1;
      // Never auto-conclude stories - only conclude if user explicitly requests ending
      const shouldConclude = !!userRequestedEnding;
      
      DebugLogger.log('story', `Live Generation: Generating page ${nextPageNumber}`, { 
        nextPageNumber, 
        neverEndingStory: true, 
        userRequestedEnding: !!userRequestedEnding 
      });
      DebugLogger.log('story', 'LiveGen: Next page generation started', {
        nextPageNumber,
        shouldConclude,
        contextPage: context.currentPage,
        storyContextLength: context.storyContext?.length,
        providedSessionId: sessionId,
        difficulty: context.difficulty,
        expertGradeLevel: context.expertGradeLevel
      });
      
      let promptConfig: any;
      const backendDifficulty = DifficultyLevelMapper.toBackend(context.difficulty) as DifficultyLevel;
      if (backendDifficulty === 'expert' && context.expertGradeLevel) {
        promptConfig = getExpertStoryPrompt(context.expertGradeLevel);
      } else {
        promptConfig = getStoryPrompt(backendDifficulty);
      }
      
      const { StoryGenerationService } = await import('./storyGenerationService');
      
      // Create enhanced userInfo with null safety and context preservation
      const contextualUserInfo = {
        ...JSON.parse(JSON.stringify(context?.userInfo || {})), // Deep clone
      };
      
      // Only include specialRequest if user explicitly provided one
      if (context?.userInfo?.specialRequest) {
        contextualUserInfo.specialRequest = context.userInfo.specialRequest;
      }
      
      // Validate contextual integrity
      if (!contextualUserInfo.name) {
        DebugLogger.warn('story', 'LiveGen: Context userInfo missing name, preserving from original');
        contextualUserInfo.name = context?.characters?.[0] || 'Hero';
      }
      
      // CRITICAL FIX: Use consistent session ID format with comprehensive continuation debugging
      const actualSessionId = sessionId || generateSessionIdWithPrefix(`live-next-${context.userInfo.name}`);
      DebugLogger.log('story', 'LiveGen: Next Page Session ID created with enhanced continuation debugging', {
        actualSessionId,
        providedSessionId: sessionId,
        sessionType: 'next-page',
        nextPageNumber,
        continuationDetails: {
          shouldConclude,
          userRequestedEnding: !!userRequestedEnding,
          currentContextPage: context.currentPage,
          totalExpectedPages: context.totalExpectedPages
        },
        contextualUserInfo: { 
          name: contextualUserInfo.name, 
          specialRequest: contextualUserInfo.specialRequest?.substring(0, 50) + '...',
          difficulty: context.difficulty,
          expertGradeLevel: context.expertGradeLevel
        },
        storyContextSummary: {
          existingPages: context.storyContext?.length,
          lastPagePreview: context.storyContext?.slice(-1)[0]?.substring(0, 50) + '...',
          totalCharacters: context.storyContext?.join('').length,
          fullContext: context.storyContext?.join('\n\n').substring(0, 200) + '...'
        },
        generationSettings: {
          backendDifficulty,
          promptConfig: !!promptConfig,
          hasVocabularyData: !!vocabularyData
        },
        timestamp: new Date().toISOString()
      });
      
      // Wrap with 25s Promise.race timeout for faster UX feedback
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Next page generation timeout (25s)')), 25000);
      });
      
      // Use reduced context window: last 2 pages for non-expert, last 3 for expert
      const backendDiff = DifficultyLevelMapper.toBackend(context.difficulty) as DifficultyLevel;
      const contextWindow = (backendDiff === 'expert' || context.expertGradeLevel) ? 3 : 2;
      const recentContext = (context.storyContext || []).slice(-contextWindow).join('\n\n');
      
      const generationPromise = StoryGenerationService.generateStory(contextualUserInfo, {
        sessionType: 'premium',
        pageNumber: nextPageNumber,
        existingStory: recentContext,
        sessionId: actualSessionId
      });
      
      const result = await Promise.race([generationPromise, timeoutPromise]);

      if (!result.success || !result.pages || result.pages.length === 0) {
        DebugLogger.error('story', 'Live Generation: 4-tier continuation failed', result.error);
        // On timeout or failure, immediately call template-service fallback
        try {
          const { data, error } = await supabase.functions.invoke('template-service', {
            body: {
              difficulty: DifficultyLevelMapper.toBackend(context.difficulty),
              userInfo: context.userInfo,
              pageCount: 1,
              templateIndex: 0
            }
          });

          if (!error && data?.pages?.length) {
            const fallbackContent = data.pages[0];
            const updatedContext: LiveGenerationContext = {
              ...context,
              storyContext: [...(context.storyContext || []), fallbackContent],
              currentPage: nextPageNumber,
              totalExpectedPages: context.totalExpectedPages
            };

            return {
              content: fallbackContent,
              isComplete: shouldConclude,
              nextContext: shouldConclude ? undefined : updatedContext
            };
          }
        } catch (fallbackError) {
          DebugLogger.error('story', 'Template fallback also failed', fallbackError);
        }
        
        return this.generateFallbackNextPage(context, nextPageNumber, 'unified_system_error', userRequestedEnding);
      }

      // Extract first page from unified system - backend handles all validation
      const content = result.pages[0] || '';
      DebugLogger.log('story', 'Live Generation: Next page content received from backend');
      
      // Update context for next page (never-ending stories grow dynamically)
      const updatedContext: LiveGenerationContext = {
        ...context,
        storyContext: [...(context.storyContext || []), content],
        currentPage: nextPageNumber,
        totalExpectedPages: context.totalExpectedPages // Keep original expectation
      };

      DebugLogger.log('story', `Live Generation: Page ${nextPageNumber} generated successfully`, { nextPageNumber });
      // PHASE 4: Use dynamic character validation for next page
      const { mapDifficultyToLevel, getMinCharactersPerPage } = await import('../../supabase/functions/_shared/validation-utils');
      const backendDifficultyForValidation = DifficultyLevelMapper.toBackend(context.difficulty) as DifficultyLevel;
      const validationLevel = mapDifficultyToLevel(context.expertGradeLevel || backendDifficultyForValidation);
      const minCharsPerPage = getMinCharactersPerPage(validationLevel);
      if (result.pages && result.pages.length > 0 && result.pages[0] && result.pages[0].length >= minCharsPerPage) {
        try {
          (globalThis as any).__LAST_PAGE_SOURCE__ = 'ai';
          (globalThis as any).__LAST_STORY_SOURCE__ = 'ai';
          DebugLogger.log('story', 'Confirmed AI-generated next page content, setting source tracking');
        } catch {}
      } else {
        DebugLogger.warn('story', 'AI call succeeded but next page content insufficient, setting source to unknown');
        try {
          (globalThis as any).__LAST_PAGE_SOURCE__ = 'unknown';
          (globalThis as any).__LAST_STORY_SOURCE__ = 'unknown';
          DebugLogger.warn('story', 'Set Live next page source to unknown due to insufficient content');
        } catch {}
      }
      DebugLogger.log('story', 'PAGE_SOURCE', { page: nextPageNumber, source: 'ai', service: 'Live' });
      
      // Emit story generation complete event
      window.dispatchEvent(new CustomEvent('story:generation:complete'));
      
      return {
        content,
        isComplete: shouldConclude,
        nextContext: shouldConclude ? undefined : updatedContext
      };
      
    } catch (error) {
      DebugLogger.error('story', 'Live Generation: Error generating next page', error);
      const nextPageNumber = context.currentPage + 1;
      const wrappedError = ErrorHandler.handleError(error as Error, 'LiveGenerationService.generateNextPage');
      return this.generateFallbackNextPage(context, nextPageNumber, 'generation_error', false);
    }
  }

  // Generate an explicit concluding page without ending the reading session
  static async generateEndingPage(context: LiveGenerationContext, sessionId?: string): Promise<LivePageResult> {
    try {
      const nextPageNumber = context.currentPage + 1;
      
      const { StoryGenerationService } = await import('./storyGenerationService');
      
      // CRITICAL FIX: Preserve user's original themes, characters, and settings for conclusion
      // Don't overwrite specialRequest - let user's preferences guide the ending
      const endingUserInfo = {
        ...context.userInfo,
        specialRequest: `${context.userInfo.specialRequest || 'adventure'} - please provide a satisfying conclusion to this story: ${context.storyContext.slice(-1)[0]?.substring(0, 100)}...`
      };
      
      // CRITICAL FIX: Use consistent session ID format
      const actualSessionId = sessionId || generateSessionIdWithPrefix(`live-ending-${context.userInfo.name}`);
      DebugLogger.log('story', 'LiveGen: Ending Page Session ID created', {
        actualSessionId,
        providedSessionId: sessionId,
        nextPageNumber,
        endingUserInfo: { name: endingUserInfo.name, specialRequest: endingUserInfo.specialRequest?.substring(0, 50) + '...' }
      });
      
      // Wrap with 35-45s Promise.race timeout for robust timeout handling
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Ending page generation timeout (40s)')), 40000);
      });
      
      const generationPromise = StoryGenerationService.generateStory(endingUserInfo, {
        sessionType: 'premium', 
        pageNumber: nextPageNumber,
        existingStory: (context.storyContext || []).join('\n\n'),
        sessionId: actualSessionId,
        isEndingPage: true
      });
      
      const result = await Promise.race([generationPromise, timeoutPromise]);

      if (!result.success || !result.pages || result.pages.length === 0) {
        DebugLogger.error('story', 'Live Generation: 4-tier ending failed', result.error);
        // On timeout or failure, immediately call template-service fallback
        try {
          const { data, error } = await supabase.functions.invoke('template-service', {
            body: {
              difficulty: DifficultyLevelMapper.toBackend(context.difficulty),
              userInfo: endingUserInfo,
              pageCount: 1,
              templateIndex: 0
            }
          });

          if (!error && data?.pages?.length) {
            const fallbackContent = data.pages[0];
            DebugLogger.log('story', 'Template-service fallback succeeded for ending page');
            return {
              content: fallbackContent,
              isComplete: true,
              nextContext: undefined
            };
          }
        } catch (fallbackError) {
          DebugLogger.error('story', 'Template fallback also failed for ending', fallbackError);
        }
        
        return this.generateFallbackNextPage(context, nextPageNumber, 'unified_system_error', true);
      }

      // Extract ALL ending pages from unified system - backend handles validation
      const allPages = result.pages || [];
      if (allPages.length === 0 || !allPages[0] || allPages[0].length < 10) {
        return this.generateFallbackNextPage(context, nextPageNumber, 'content_too_short_conclusion', true);
      }

      DebugLogger.log('story', `Live Generation: Ending generated with ${allPages.length} page(s)`, { pageCount: allPages.length });
      // PHASE 4: Use dynamic character validation for ending pages
      const { mapDifficultyToLevel, getMinCharactersPerPage } = await import('../../supabase/functions/_shared/validation-utils');
      const backendDifficultyForValidation = DifficultyLevelMapper.toBackend(context.difficulty) as DifficultyLevel;
      const validationLevel = mapDifficultyToLevel(context.expertGradeLevel || backendDifficultyForValidation);
      const minCharsPerPage = getMinCharactersPerPage(validationLevel);
      if (result.pages && result.pages.length > 0 && result.pages[0] && result.pages[0].length >= minCharsPerPage) {
        try {
          (globalThis as any).__LAST_PAGE_SOURCE__ = 'ai';
          (globalThis as any).__LAST_STORY_SOURCE__ = 'ai';
          DebugLogger.log('story', 'Confirmed AI-generated story ending content, setting source tracking');
        } catch {}
      } else {
        DebugLogger.warn('story', 'AI call succeeded but story ending content insufficient, setting source to unknown');
        try {
          (globalThis as any).__LAST_PAGE_SOURCE__ = 'unknown';
          (globalThis as any).__LAST_STORY_SOURCE__ = 'unknown';
          DebugLogger.warn('story', 'Set Live ending source to unknown due to insufficient content');
        } catch {}
      }

      // Emit story generation complete event
      window.dispatchEvent(new CustomEvent('story:generation:complete'));

      return {
        content: allPages.length === 1 ? allPages[0] : allPages,
        isComplete: true,
        nextContext: undefined,
        endingPageCount: allPages.length
      };
    } catch (error) {
      DebugLogger.error('story', 'Live Generation: Error generating ending page', error);
      const wrappedError = ErrorHandler.handleError(error as Error, 'LiveGenerationService.generateEndingPage');
      return {
        content: '',
        isComplete: true,
        error: 'Failed to generate story ending. Please try again.'
      };
    }
  }

  private static async generateFallbackFirstPage(userInfo: UserInfo, difficulty: DifficultyLevel, reason: string): Promise<LivePageResult> {
    DebugLogger.log('story', `Live Generation: Using fallback first page (reason: ${reason})`, { reason });
    
    // Show toast notification for template usage
    toast({
      title: "⚠️ Using Pre-Written Content",
      description: "AI is taking a break. You're reading quality backup stories! Parents: This is normal during high demand.",
      variant: "warning",
      duration: 7000
    });
    
    try {
      // Use template service for fallback
      const { data, error } = await supabase.functions.invoke('template-service', {
        body: {
          difficulty: difficulty,
          userInfo: userInfo,
          pageCount: 1,
          templateIndex: 0
        }
      });

      if (error || !data?.pages?.length) {
        throw new Error('Template service failed');
      }

      const content = data.pages[0];
      
      // Get proper prompt config to preserve page expectations with safe defaults
      let promptConfig: any;
      if (difficulty === 'expert') {
        promptConfig = { expectedPages: 14 }; // Middle-ground for expert stories (12-16 pages)
      } else {
        try {
          promptConfig = getStoryPrompt(difficulty) || { expectedPages: 12 };
        } catch (promptError) {
          DebugLogger.warn('story', 'getStoryPrompt failed, using safe default', { difficulty, promptError });
          promptConfig = { expectedPages: 12 };
        }
      }

      const context: LiveGenerationContext = {
        userInfo,
        difficulty: DifficultyLevelMapper.toFrontend(difficulty), // Store frontend difficulty in context
        storyContext: [content],
        currentPage: 1,
        totalExpectedPages: promptConfig.expectedPages || 999, // Preserve unlimited behavior
        characters: [userInfo.name, userInfo.favoriteAnimal ? userInfo.favoriteAnimal : 'friendly companion']
      };

      try {
        (globalThis as any).__LAST_PAGE_SOURCE__ = 'fallback';
        (globalThis as any).__LAST_STORY_SOURCE__ = 'fallback';
      } catch {}
      DebugLogger.log('story', 'PAGE_SOURCE', { page: 1, source: (globalThis as any).__LAST_PAGE_SOURCE__, service: 'Live' });

      // Emit story generation complete event
      window.dispatchEvent(new CustomEvent('story:generation:complete'));

      return {
        content,
        isComplete: false,
        nextContext: context
      };
    } catch (templateError) {
      DebugLogger.error('story', 'Template service failed, using emergency content', templateError);
      
      // Emergency fallback with rhyming educational content - ALWAYS returns content
      const emergencyContent = await ErrorHandlingManager.getEmergencyContent(userInfo);
      const content = emergencyContent[0] || `${userInfo.name} began a wonderful adventure in a magical place where anything was possible. The sun shone brightly overhead as ${userInfo.name} took the first step into this exciting new world.`;
      
      // Set global emergency source tracking
      (globalThis as any).__LAST_STORY_SOURCE__ = 'emergency';
      (globalThis as any).__LAST_PAGE_SOURCE__ = 'emergency';
      
      // Safe prompt config with guaranteed fallback
      let promptConfig: any = { expectedPages: 12 };
      try {
        if (difficulty === 'expert') {
          promptConfig = { expectedPages: 14 };
        } else {
          promptConfig = getStoryPrompt(difficulty) || { expectedPages: 12 };
        }
      } catch {
        // Keep default promptConfig
      }
      
      const context: LiveGenerationContext = {
        userInfo,
        difficulty: DifficultyLevelMapper.toFrontend(difficulty), // Store frontend difficulty in context
        storyContext: [content],
        currentPage: 1,
        totalExpectedPages: promptConfig.expectedPages || 999,
        characters: [userInfo.name, userInfo.favoriteAnimal ? userInfo.favoriteAnimal : 'friendly companion']
      };

      // Emit story generation complete event even for emergency content
      window.dispatchEvent(new CustomEvent('story:generation:complete'));

      return {
        content,
        isComplete: false,
        nextContext: context
      };
    }
  }

  private static async generateFallbackNextPage(
    context: LiveGenerationContext, 
    pageNumber: number, 
    reason: string,
    userRequestedEnding?: boolean
  ): Promise<LivePageResult> {
    DebugLogger.log('story', `Live Generation: Using fallback page ${pageNumber} (reason: ${reason})`, { pageNumber, reason });
    
    const isLastPage = !!userRequestedEnding;
    
    // Show toast notification for template usage
    toast({
      title: "⚠️ Using Pre-Written Content",
      description: "AI is taking a break. You're reading quality backup stories! Parents: This is normal during high demand.",
      variant: "warning",
      duration: 7000
    });
    
    try {
      // Use template service for fallback continuation
      const { data, error } = await supabase.functions.invoke('template-service', {
        body: {
          difficulty: context.difficulty,
          userInfo: context.userInfo,
          pageCount: 1,
          templateIndex: 0
        }
      });

      if (error || !data?.pages?.length) {
        throw new Error('Template service failed');
      }

      // Get first page from fallback (always single page for continuity)
      const content = data.pages[0] ||
        (isLastPage ? `${context.userInfo.name} felt happy about the wonderful adventure. The end!` : 
         `${context.userInfo.name} continued the exciting journey.`);
      
      const updatedContext: LiveGenerationContext = {
        ...context,
        storyContext: [...context.storyContext, content],
        currentPage: pageNumber
      };

      try {
        (globalThis as any).__LAST_PAGE_SOURCE__ = 'fallback';
        (globalThis as any).__LAST_STORY_SOURCE__ = 'fallback';
      } catch {}
      DebugLogger.log('story', 'PAGE_SOURCE', { page: pageNumber, source: (globalThis as any).__LAST_PAGE_SOURCE__, service: 'Live' });

      // Emit story generation complete event
      window.dispatchEvent(new CustomEvent('story:generation:complete'));

      return {
        content,
        isComplete: isLastPage,
        nextContext: isLastPage ? undefined : updatedContext
      };
    } catch (error) {
      DebugLogger.error('story', 'Fallback failed', error);
      // Emergency fallback with rhyming educational content
      const emergencyContent = await ErrorHandlingManager.getEmergencyContent(context.userInfo);
      const content = isLastPage ? 
        (emergencyContent[0] || `${context.userInfo.name} had a great day. The end.`) : 
        (emergencyContent[0] || `${context.userInfo.name} continued the adventure.`);
      
      // Set global emergency source tracking
      (globalThis as any).__LAST_STORY_SOURCE__ = 'emergency';
      (globalThis as any).__LAST_PAGE_SOURCE__ = 'emergency';
      
      const updatedContext: LiveGenerationContext = {
        ...context,
        storyContext: [...context.storyContext, content],
        currentPage: pageNumber
      };

      return {
        content,
        isComplete: isLastPage,
        nextContext: isLastPage ? undefined : updatedContext
      };
    }
  }
}