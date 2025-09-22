import { useState, useCallback } from 'react';
import { StoryRefreshService } from '@/utils/storyRefresh';
import { DebugLogger } from '@/services/DebugLogger';

/**
 * Hook for managing story refresh operations
 */
export const useStoryRefresh = (userId?: string) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const forceRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await StoryRefreshService.forceRefreshWithUserData(userId);
      DebugLogger.log('story', 'Story refresh completed successfully');
    } catch (error) {
      console.error('❌ Story refresh failed:', error);
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  }, [userId, isRefreshing]);
  
  const clearPronounCaches = useCallback(() => {
    StoryRefreshService.clearPronounCaches(userId);
  }, [userId]);
  
  return {
    forceRefresh,
    clearPronounCaches,
    isRefreshing
  };
};