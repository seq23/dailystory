import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useGamification } from '@/hooks/useGamification';
import type { UserInfo } from '@/types';
import { setupGamificationGlobals, cleanupGamificationGlobals } from '@/utils/gamificationGlobals';
import { SessionStatsTracker } from '@/utils/sessionStatsTracker';

interface GameContextValue {
  userStats: any;
  addVocabularyWord: () => void;
  recordReadingSession: (sessionData: any) => void;
  updateActivity: (activityData: any) => void;
  newAchievements: any[];
  hasNewAchievements: boolean;
  getNextAchievement: () => any;
  clearNewAchievements: () => void;
  resetStats: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

interface GameContextProviderProps {
  children: ReactNode;
  userId?: string;
  userType?: 'free' | 'premium';
  userInfo?: UserInfo;
}

export const GameContextProvider: React.FC<GameContextProviderProps> = ({
  children,
  userId,
  userType = 'premium',
  userInfo
}) => {
  const gamificationHook = useGamification({
    userId,
    userType,
    enablePersistence: userType === 'premium'
  });

  useEffect(() => {
    setupGamificationGlobals(gamificationHook.addVocabularyWord, userType === 'premium');
    return () => cleanupGamificationGlobals();
  }, [gamificationHook.addVocabularyWord, userType]);

  // Store session start stats when component mounts
  useEffect(() => {
    if (!SessionStatsTracker.hasSessionStartStats()) {
      SessionStatsTracker.storeSessionStartStats(gamificationHook.userStats);
    }
  }, [gamificationHook.userStats]);

  // Expose user name globally for consistent per-user storage keys
  useEffect(() => {
    if (userInfo?.name) {
      (window as any).__currentUserName = userInfo.name;
      try { localStorage.setItem('user_display_name', userInfo.name); } catch {}
    }
  }, [userInfo?.name]);

  return (
    <GameContext.Provider value={gamificationHook}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = (): GameContextValue => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameContextProvider');
  }
  return context;
};