import React, { createContext, useContext, ReactNode } from 'react';
import { useGamification } from '@/hooks/useGamification';
import type { UserInfo } from '@/types';

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