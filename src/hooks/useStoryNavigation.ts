import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
        console.log('📍 Updating story navigation:', { currentPage, totalPages, newUrl });
        navigate(newUrl, { replace: true });
      }
    } else if (!isInStorySession && location.search.includes('session=story')) {
      // Clear story session parameters when exiting story
      console.log('📍 Clearing story navigation');
      navigate('/', { replace: true });
    }
  }, [isInStorySession, currentPage, totalPages, storyTitle, navigate, location]);

  // Return current story state from URL for persistence
  const getStoryStateFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return {
      isStorySession: params.get('session') === 'story',
      page: parseInt(params.get('page') || '1'),
      total: parseInt(params.get('total') || '0'),
      title: params.get('title') ? decodeURIComponent(params.get('title')!) : undefined
    };
  };

  return { getStoryStateFromUrl };
};