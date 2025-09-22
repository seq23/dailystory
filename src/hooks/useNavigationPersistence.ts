interface NavigationState {
  currentPage: number;
  totalPages: number;
  storyId: string;
  timestamp: number;
  scrollPosition: number;
  viewHistory: number[];
}

import { DebugLogger } from '../services/DebugLogger';

export const useNavigationPersistence = () => {
  const saveNavigationState = (state: Partial<NavigationState>) => {
    const existing = getNavigationState();
    const newState = { ...existing, ...state, timestamp: Date.now() };
    
    sessionStorage.setItem('navigationState', JSON.stringify(newState));
    localStorage.setItem('lastNavigationBackup', JSON.stringify(newState));
  };
  
  const getNavigationState = (): NavigationState | null => {
    try {
      const sessionData = sessionStorage.getItem('navigationState');
      if (sessionData) {
        return JSON.parse(sessionData);
      }
      
      // Fallback to localStorage if session is lost
      const backupData = localStorage.getItem('lastNavigationBackup');
      if (backupData) {
        const parsed = JSON.parse(backupData);
        // Only restore if less than 1 hour old
        if (Date.now() - parsed.timestamp < 3600000) {
          return parsed;
        }
      }
      
      return null;
    } catch (error) {
      DebugLogger.error('ui', 'Failed to parse navigation state', error);
      return null;
    }
  };
  
  const clearNavigationState = () => {
    sessionStorage.removeItem('navigationState');
    localStorage.removeItem('lastNavigationBackup');
  };
  
  const restoreScrollPosition = () => {
    const state = getNavigationState();
    if (state && state.scrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, state.scrollPosition);
      }, 100);
    }
  };
  
  const saveScrollPosition = () => {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    saveNavigationState({ scrollPosition });
  };
  
  return {
    saveNavigationState,
    getNavigationState,
    clearNavigationState,
    restoreScrollPosition,
    saveScrollPosition
  };
};