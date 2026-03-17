/**
 * REAL PROGRESS DATA HOOK
 * Fetches actual user activity from Supabase tables:
 * - reading_sessions → stories read, reading time
 * - quiz_attempts → comprehension scores
 * - vocabulary_progress → words learned
 * - saved_stories → saved story count
 * - game_sessions → games played
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RealProgressData {
  // Core stats
  storiesRead: number;
  totalReadingTimeMinutes: number;
  wordsLearned: number;
  savedStories: number;
  
  // Comprehension
  averageComprehensionScore: number;
  quizzesTaken: number;
  
  // Games
  gamesPlayed: number;
  averageGameScore: number;
  
  // Streak (based on reading_sessions dates)
  currentStreak: number;
  longestStreak: number;
  
  // Recent activity
  recentActivity: {
    date: string;
    type: 'story' | 'quiz' | 'vocabulary' | 'game';
    title: string;
    description: string;
  }[];
  
  // Loading state
  loading: boolean;
  error?: string;
}

export function useRealProgressData(userId?: string): RealProgressData {
  const [data, setData] = useState<RealProgressData>({
    storiesRead: 0,
    totalReadingTimeMinutes: 0,
    wordsLearned: 0,
    savedStories: 0,
    averageComprehensionScore: 0,
    quizzesTaken: 0,
    gamesPlayed: 0,
    averageGameScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    recentActivity: [],
    loading: true
  });

  useEffect(() => {
    if (!userId) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchAll = async () => {
      try {
        // Fetch all data in parallel
        const [
          readingRes,
          quizRes,
          vocabRes,
          savedRes,
          gameRes
        ] = await Promise.all([
          supabase
            .from('reading_sessions')
            .select('started_at, completed_at, time_spent, words_read, comprehension_score')
            .eq('user_id', userId)
            .order('started_at', { ascending: false }),
          supabase
            .from('quiz_attempts')
            .select('created_at, score, total_questions, story_title, mode')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),
          supabase
            .from('vocabulary_progress')
            .select('word, mastery_level, first_encountered_at')
            .eq('user_id', userId),
          supabase
            .from('saved_stories')
            .select('id, title, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),
          supabase
            .from('game_sessions')
            .select('created_at, game_type, score, max_score, duration_seconds')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
        ]);

        const readings = readingRes.data || [];
        const quizzes = quizRes.data || [];
        const vocab = vocabRes.data || [];
        const saved = savedRes.data || [];
        const games = gameRes.data || [];

        // Stories read (completed reading sessions)
        const completedStories = readings.filter(r => r.completed_at);
        const storiesRead = completedStories.length;

        // Total reading time
        const totalReadingTimeMinutes = readings.reduce((sum, r) => sum + (r.time_spent || 0), 0);

        // Words learned
        const wordsLearned = vocab.length;

        // Saved stories
        const savedStories = saved.length;

        // Comprehension
        const quizzesTaken = quizzes.length;
        const averageComprehensionScore = quizzesTaken > 0
          ? Math.round(quizzes.reduce((sum, q) => sum + (q.total_questions > 0 ? (q.score / q.total_questions) * 100 : 0), 0) / quizzesTaken)
          : 0;

        // Games
        const gamesPlayed = games.length;
        const averageGameScore = gamesPlayed > 0
          ? Math.round(games.reduce((sum, g) => sum + (g.max_score > 0 ? (g.score / g.max_score) * 100 : 0), 0) / gamesPlayed)
          : 0;

        // Streak calculation based on reading session dates
        const { currentStreak, longestStreak } = calculateStreak(readings.map(r => r.started_at));

        // Build recent activity (last 10 items)
        const recentActivity: RealProgressData['recentActivity'] = [];

        readings.slice(0, 5).forEach(r => {
          recentActivity.push({
            date: r.started_at,
            type: 'story',
            title: 'Reading Session',
            description: r.completed_at 
              ? `Completed in ${r.time_spent || 0} min, ${r.words_read || 0} words read`
              : `Read for ${r.time_spent || 0} minutes`
          });
        });

        quizzes.slice(0, 3).forEach(q => {
          recentActivity.push({
            date: q.created_at,
            type: 'quiz',
            title: q.story_title || 'Quiz',
            description: `Scored ${q.score}/${q.total_questions}`
          });
        });

        games.slice(0, 2).forEach(g => {
          recentActivity.push({
            date: g.created_at,
            type: 'game',
            title: g.game_type,
            description: `Scored ${g.score}/${g.max_score}`
          });
        });

        // Sort by date descending
        recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setData({
          storiesRead,
          totalReadingTimeMinutes,
          wordsLearned,
          savedStories,
          averageComprehensionScore,
          quizzesTaken,
          gamesPlayed,
          averageGameScore,
          currentStreak,
          longestStreak,
          recentActivity: recentActivity.slice(0, 10),
          loading: false
        });
      } catch (error: any) {
        console.error('Failed to fetch progress data:', error);
        setData(prev => ({ ...prev, loading: false, error: error.message }));
      }
    };

    fetchAll();
  }, [userId]);

  return data;
}

function calculateStreak(dates: string[]): { currentStreak: number; longestStreak: number } {
  if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  // Get unique dates (day only)
  const uniqueDays = [...new Set(
    dates.map(d => new Date(d).toISOString().split('T')[0])
  )].sort().reverse(); // Most recent first

  if (uniqueDays.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Current streak: must include today or yesterday
  let currentStreak = 0;
  if (uniqueDays[0] === today || uniqueDays[0] === yesterday) {
    currentStreak = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      const prev = new Date(uniqueDays[i - 1]);
      const curr = new Date(uniqueDays[i]);
      const diffDays = (prev.getTime() - curr.getTime()) / 86400000;
      if (Math.round(diffDays) === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Longest streak
  let longestStreak = 1;
  let streak = 1;
  const sorted = [...uniqueDays].sort(); // Ascending
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / 86400000;
    if (Math.round(diffDays) === 1) {
      streak++;
      longestStreak = Math.max(longestStreak, streak);
    } else {
      streak = 1;
    }
  }

  return { currentStreak, longestStreak };
}
