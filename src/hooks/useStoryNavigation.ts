import { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DebugLogger } from '@/services/DebugLogger';

interface StoryNavigationProps {
  isInStorySession: boolean;
  currentPage: number;
  totalPages: number;
  storyTitle?: string;
}

/**
 * Hook to manage proper URL navigation during story sessions
 * Updates browser URL to reflect story progress without page reloads
 */
export const useStoryNavigation = ({ 
  isInStorySession, 
  currentPage, 
  totalPages, 
  storyTitle 
}: StoryNavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInStorySession && totalPages > 0) {
      // Create story session URL that reflects current state
      const params = new URLSearchParams();
      params.set('session', 'story');
      params.set('page', currentPage.toString());
      params.set('total', totalPages.toString());
      
      if (storyTitle) {
        params.set('title', encodeURIComponent(storyTitle));
      }

      const newUrl = `/?${params.toString()}`;
      
      // Only update if URL has actually changed to prevent loops
      if (location.pathname + location.search !== newUrl) {
        DebugLogger.log('ui', 'Updating story navigation', { currentPage, totalPages, newUrl });
        navigate(newUrl, { replace: true });
      }
    } else if (!isInStorySession && location.search.includes('session=story')) {
      // Clear story session parameters when exiting story
      DebugLogger.log('ui', 'Clearing story navigation');
      window.history.replaceState(null, '', '/');
      navigate('/', { replace: true });
    }
  }, [isInStorySession, currentPage, totalPages, storyTitle, navigate, location]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      DebugLogger.log('ui', 'Browser navigation detected', event.state);
      // Let the parent component handle the navigation based on URL params
      window.dispatchEvent(new CustomEvent('story:navigation:change', {
        detail: getStoryStateFromUrl()
      }));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Enhanced navigation state recovery
  const getStoryStateFromUrl = useCallback(() => {
    const params = new URLSearchParams(location.search);
    return {
      isStorySession: params.get('session') === 'story',
      page: parseInt(params.get('page') || '1'),
      total: parseInt(params.get('total') || '0'),
      title: params.get('title') ? decodeURIComponent(params.get('title')!) : undefined
    };
  }, [location.search]);

  // Enhanced browser navigation handling
  const handleUrlChange = useCallback(() => {
    const urlState = getStoryStateFromUrl();
    DebugLogger.log('ui', 'URL state changed', urlState);
    
    // Validate state and trigger recovery if needed
    if (urlState.isStorySession && (!urlState.page || !urlState.total)) {
      DebugLogger.warn('story', '📍 Invalid story state detected, triggering recovery');
      // Could trigger a state recovery mechanism here
    }
    
    return urlState;
  }, [getStoryStateFromUrl]);

  // Enhanced state persistence
  const persistNavigationState = useCallback((state: {
    page: number;
    total: number;
    title?: string;
  }) => {
    try {
      sessionStorage.setItem('story_navigation_state', JSON.stringify({
        ...state,
        timestamp: Date.now()
      }));
    } catch (error) {
      DebugLogger.warn('story', '📍 Failed to persist navigation state:', error);
    }
  }, []);

  return { 
    getStoryStateFromUrl,
    handleUrlChange,
    persistNavigationState
  };
};