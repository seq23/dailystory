import { useState, useEffect, useCallback } from "react";
import { GamificationService, type UserStats, type Achievement, type ReadingStreak } from "@/services/gamificationService";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { DebugLogger } from "@/services/DebugLogger";

interface UseGamificationOptions {
  userId?: string;
  onAchievementUnlocked?: (achievement: Achievement) => void;
  onLevelUp?: (newLevel: number) => void;
  enablePersistence?: boolean;
  userType?: 'free' | 'premium';
}

export const useGamification = (options: UseGamificationOptions = {}) => {
  const { userId, onAchievementUnlocked, onLevelUp, enablePersistence = true, userType = 'premium' } = options;
  const { toast } = useToast();
  const { t } = useTranslation();

  const [userStats, setUserStats] = useState<UserStats>({
    totalWordsRead: 0,
    totalStoriesCompleted: 0,
    totalTimeReading: 0,
    vocabularyWordsLearned: 0,
    averageReadingSpeed: 0,
    currentLevel: 1,
    totalPoints: 0,
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      lastReadDate: new Date(),
      streakStartDate: new Date()
    },
    achievements: [],
    badges: []
  });

  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  // Load user stats from localStorage on mount (only for premium users)
  useEffect(() => {
    if (!enablePersistence) return;
    
    const storageKey = userId ? `gamification_${userId}` : 'gamification_guest';
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const parsedStats = JSON.parse(stored);
        // Convert date strings back to Date objects
        parsedStats.streak.lastReadDate = new Date(parsedStats.streak.lastReadDate);
        parsedStats.streak.streakStartDate = new Date(parsedStats.streak.streakStartDate);
        parsedStats.achievements = parsedStats.achievements.map((a: any) => ({
          ...a,
          unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined
        }));
        setUserStats(parsedStats);
      } catch (error) {
        DebugLogger.error('performance', 'Failed to parse stored gamification data:', error);
      }
    }
  }, [userId, enablePersistence]);

  // Save user stats to localStorage whenever they change (only for premium users)
  useEffect(() => {
    if (!enablePersistence) return;
    
    const storageKey = userId ? `gamification_${userId}` : 'gamification_guest';
    localStorage.setItem(storageKey, JSON.stringify(userStats));
  }, [userStats, userId, enablePersistence]);

  const updateActivity = useCallback((activity: {
    wordsRead?: number;
    storiesCompleted?: number;
    timeSpent?: number; // in seconds
    vocabularyLearned?: number;
    readingSpeed?: number;
    sessionTimeMinutes?: number;
    sessionPagesRead?: number;
  }) => {
    setUserStats(prevStats => {
      // Update streak
      const updatedStreak = GamificationService.updateStreak(prevStats.streak);
      
      // Calculate new stats
      const newStats: UserStats = {
        ...prevStats,
        totalWordsRead: prevStats.totalWordsRead + (activity.wordsRead || 0),
        totalStoriesCompleted: prevStats.totalStoriesCompleted + (activity.storiesCompleted || 0),
        totalTimeReading: prevStats.totalTimeReading + Math.floor((activity.timeSpent || 0) / 60),
        vocabularyWordsLearned: prevStats.vocabularyWordsLearned + (activity.vocabularyLearned || 0),
        averageReadingSpeed: activity.readingSpeed || prevStats.averageReadingSpeed,
        streak: updatedStreak
      };

      // Check for achievements
      const { newAchievements: unlockedAchievements, updatedStats } = GamificationService.checkAchievements(
        newStats, 
        {
          ...activity,
          currentTime: new Date()
        },
        userType
      );

      // Handle level up - use modal system only
      if (updatedStats.currentLevel > prevStats.currentLevel) {
        onLevelUp?.(updatedStats.currentLevel);
        // Removed level up toast - use modal system instead
      }

      // Handle new achievements - use modal system only
      if (unlockedAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...unlockedAchievements]);
        
        // Generate badges for newly unlocked achievements
        const newBadges = unlockedAchievements.map(achievement => 
          GamificationService.generateBadge(achievement)
        );
        
        // Add badges to updated stats
        updatedStats.badges = [...updatedStats.badges, ...newBadges];
        
        unlockedAchievements.forEach(achievement => {
          onAchievementUnlocked?.(achievement);
          // Removed achievement toast - use modal system only
        });
        
        // Store session achievements for session end page
        try {
          const existing = sessionStorage.getItem('session_achievements') || '[]';
          const sessionAchievements = JSON.parse(existing);
          sessionAchievements.push(...unlockedAchievements);
          sessionStorage.setItem('session_achievements', JSON.stringify(sessionAchievements));
        } catch (error) {
          DebugLogger.warn('performance', 'Failed to store session achievements:', error);
        }
      }

      // Handle streak milestones - use modal system only
      if (updatedStreak.currentStreak > prevStats.streak.currentStreak) {
        // Removed streak toast - use modal system only
      }

      return updatedStats;
    });
  }, [onAchievementUnlocked, onLevelUp, userType]);

  const recordReadingSession = useCallback((sessionData: {
    wordsRead: number;
    timeSpent: number; // in seconds
    pagesRead: number;
    storyCompleted: boolean;
    readingSpeed?: number;
  }) => {
    // Convert timeSpent from seconds to minutes for session achievements
    const sessionTimeMinutes = Math.floor(sessionData.timeSpent / 60);
    
    updateActivity({
      wordsRead: sessionData.wordsRead,
      timeSpent: sessionData.timeSpent,
      storiesCompleted: sessionData.storyCompleted ? 1 : 0,
      readingSpeed: sessionData.readingSpeed,
      sessionTimeMinutes: sessionTimeMinutes,
      sessionPagesRead: sessionData.pagesRead
    });
  }, [updateActivity]);

  const addVocabularyWord = useCallback(() => {
    DebugLogger.log('ui', 'useGamification: addVocabularyWord called', {
      currentVocabCount: userStats.vocabularyWordsLearned,
      environment: typeof window !== 'undefined' && window.location.href.includes('preview') ? 'preview' : 'console'
    });
    setUserStats(prev => {
      const newStats = {
        ...prev,
        vocabularyWordsLearned: prev.vocabularyWordsLearned + 1
      };
      DebugLogger.log('ui', 'useGamification: Vocabulary updated', {
        before: prev.vocabularyWordsLearned,
        after: newStats.vocabularyWordsLearned,
        environment: typeof window !== 'undefined' && window.location.href.includes('preview') ? 'preview' : 'console'
      });
      return newStats;
    });
  }, []); // Remove dependency that was causing infinite re-renders

  const getNextAchievement = useCallback(() => {
    if (newAchievements.length > 0) {
      const achievement = newAchievements[0];
      setNewAchievements(prev => prev.slice(1));
      return achievement;
    }
    return null;
  }, [newAchievements]);

  const clearNewAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  const resetStats = useCallback(() => {
    const initialStats: UserStats = {
      totalWordsRead: 0,
      totalStoriesCompleted: 0,
      totalTimeReading: 0,
      vocabularyWordsLearned: 0,
      averageReadingSpeed: 0,
      currentLevel: 1,
      totalPoints: 0,
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        lastReadDate: new Date(),
        streakStartDate: new Date()
      },
      achievements: [],
      badges: []
    };
    setUserStats(initialStats);
    setNewAchievements([]);
    
    // Clear localStorage and sessionStorage data
    if (enablePersistence) {
      const storageKey = userId ? `gamification_${userId}` : 'gamification_guest';
      const keys = [
        storageKey,
        'gamificationStats',
        'vocabularyCollection'
      ];
      
      keys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          DebugLogger.warn('performance', `Failed to clear localStorage key: ${key}`, error);
        }
      });
      
      // Clear sessionStorage keys
      try {
        sessionStorage.removeItem('recentAchievements');
        sessionStorage.removeItem('session_achievements');
      } catch (error) {
        DebugLogger.warn('performance', 'Failed to clear sessionStorage:', error);
      }
    }
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('gamificationStatsReset'));
  }, [userId, enablePersistence]);

  return {
    userStats,
    newAchievements,
    updateActivity,
    recordReadingSession,
    addVocabularyWord,
    getNextAchievement,
    clearNewAchievements,
    resetStats,
    hasNewAchievements: newAchievements.length > 0
  };
};