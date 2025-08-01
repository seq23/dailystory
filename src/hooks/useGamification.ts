import { useState, useEffect, useCallback } from "react";
import { GamificationService, type UserStats, type Achievement, type ReadingStreak } from "@/services/gamificationService";
import { useToast } from "@/hooks/use-toast";

interface UseGamificationOptions {
  userId?: string;
  onAchievementUnlocked?: (achievement: Achievement) => void;
  onLevelUp?: (newLevel: number) => void;
}

export const useGamification = (options: UseGamificationOptions = {}) => {
  const { userId, onAchievementUnlocked, onLevelUp } = options;
  const { toast } = useToast();

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

  // Load user stats from localStorage on mount
  useEffect(() => {
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
        console.error('Failed to parse stored gamification data:', error);
      }
    }
  }, [userId]);

  // Save user stats to localStorage whenever they change
  useEffect(() => {
    const storageKey = userId ? `gamification_${userId}` : 'gamification_guest';
    localStorage.setItem(storageKey, JSON.stringify(userStats));
  }, [userStats, userId]);

  const updateActivity = useCallback((activity: {
    wordsRead?: number;
    storiesCompleted?: number;
    timeSpent?: number; // in seconds
    vocabularyLearned?: number;
    readingSpeed?: number;
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
        }
      );

      // Handle level up
      if (updatedStats.currentLevel > prevStats.currentLevel) {
        onLevelUp?.(updatedStats.currentLevel);
        toast({
          title: `🎉 Level Up!`,
          description: `Congratulations! You've reached level ${updatedStats.currentLevel}!`,
          duration: 5000,
        });
      }

      // Handle new achievements
      if (unlockedAchievements.length > 0) {
        setNewAchievements(prev => [...prev, ...unlockedAchievements]);
        unlockedAchievements.forEach(achievement => {
          onAchievementUnlocked?.(achievement);
          toast({
            title: `🏆 Achievement Unlocked!`,
            description: `${achievement.title} - ${achievement.description}`,
            duration: 4000,
          });
        });
      }

      // Handle streak milestones
      if (updatedStreak.currentStreak > prevStats.streak.currentStreak) {
        const streak = updatedStreak.currentStreak;
        if (streak % 7 === 0 && streak > 0) {
          toast({
            title: `🔥 ${streak} Day Streak!`,
            description: `Amazing! You've been reading for ${streak} days in a row!`,
            duration: 4000,
          });
        }
      }

      return updatedStats;
    });
  }, [onAchievementUnlocked, onLevelUp, toast]);

  const recordReadingSession = useCallback((sessionData: {
    wordsRead: number;
    timeSpent: number; // in seconds
    pagesRead: number;
    storyCompleted: boolean;
    readingSpeed?: number;
  }) => {
    updateActivity({
      wordsRead: sessionData.wordsRead,
      timeSpent: sessionData.timeSpent,
      storiesCompleted: sessionData.storyCompleted ? 1 : 0,
      readingSpeed: sessionData.readingSpeed
    });
  }, [updateActivity]);

  const addVocabularyWord = useCallback(() => {
    updateActivity({ vocabularyLearned: 1 });
  }, [updateActivity]);

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
  }, []);

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