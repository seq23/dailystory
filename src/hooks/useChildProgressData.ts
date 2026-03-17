/**
 * Per-child progress data hook for Parent Dashboard.
 * Fetches real data from Supabase filtered by child_profile_id when available.
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChildProgressData {
  storiesRead: number;
  totalReadingTimeMinutes: number;
  wordsLearned: number;
  savedStories: number;
  averageComprehensionScore: number;
  quizzesTaken: number;
  gamesPlayed: number;
  averageGameScore: number;
  currentStreak: number;
  longestStreak: number;
  // Weekly reading minutes (last 7 days, Mon-Sun)
  weeklyMinutes: number[];
  // Recent quiz results
  recentQuizzes: { date: string; score: number; total: number; title: string; mode: string }[];
  // Recent game results
  recentGames: { date: string; score: number; maxScore: number; type: string }[];
  loading: boolean;
  error?: string;
}

const EMPTY: ChildProgressData = {
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
  weeklyMinutes: [0, 0, 0, 0, 0, 0, 0],
  recentQuizzes: [],
  recentGames: [],
  loading: true,
};

export function useChildProgressData(childProfileId: string | null): ChildProgressData {
  const [data, setData] = useState<ChildProgressData>({ ...EMPTY });

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      setData(prev => ({ ...prev, loading: true, error: undefined }));

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (!cancelled) setData({ ...EMPTY, loading: false });
          return;
        }
        const userId = user.id;

        // Build queries with optional child filter
        const readingQuery = supabase
          .from('reading_sessions')
          .select('started_at, completed_at, time_spent, words_read, comprehension_score')
          .eq('user_id', userId)
          .order('started_at', { ascending: false });
        if (childProfileId) readingQuery.eq('child_profile_id', childProfileId);

        const quizQuery = supabase
          .from('quiz_attempts')
          .select('created_at, score, total_questions, story_title, mode')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (childProfileId) quizQuery.eq('child_profile_id', childProfileId);

        const gameQuery = supabase
          .from('game_sessions')
          .select('created_at, game_type, score, max_score, duration_seconds')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (childProfileId) gameQuery.eq('child_profile_id', childProfileId);

        // Vocab & saved stories are user-level (no child_profile_id column)
        const vocabQuery = supabase
          .from('vocabulary_progress')
          .select('id')
          .eq('user_id', userId);

        const savedQuery = supabase
          .from('saved_stories')
          .select('id')
          .eq('user_id', userId);

        const [readingRes, quizRes, gameRes, vocabRes, savedRes] = await Promise.all([
          readingQuery, quizQuery, gameQuery, vocabQuery, savedQuery
        ]);

        if (cancelled) return;

        const readings = readingRes.data || [];
        const quizzes = quizRes.data || [];
        const games = gameRes.data || [];

        // Stories read (completed)
        const storiesRead = readings.filter(r => r.completed_at).length;
        const totalReadingTimeMinutes = readings.reduce((s, r) => s + (r.time_spent || 0), 0);
        const wordsLearned = vocabRes.data?.length || 0;
        const savedStories = savedRes.data?.length || 0;

        // Quizzes
        const quizzesTaken = quizzes.length;
        const averageComprehensionScore = quizzesTaken > 0
          ? Math.round(quizzes.reduce((s, q) => s + (q.total_questions > 0 ? (q.score / q.total_questions) * 100 : 0), 0) / quizzesTaken)
          : 0;

        // Games
        const gamesPlayed = games.length;
        const averageGameScore = gamesPlayed > 0
          ? Math.round(games.reduce((s, g) => s + (g.max_score > 0 ? (g.score / g.max_score) * 100 : 0), 0) / gamesPlayed)
          : 0;

        // Streak
        const { currentStreak, longestStreak } = calcStreak(readings.map(r => r.started_at));

        // Weekly minutes (last 7 days mapped to Mon-Sun)
        const weeklyMinutes = calcWeeklyMinutes(readings);

        // Recent quizzes (last 20)
        const recentQuizzes = quizzes.slice(0, 20).map(q => ({
          date: q.created_at,
          score: q.score,
          total: q.total_questions,
          title: q.story_title || 'Quiz',
          mode: q.mode || 'offline',
        }));

        // Recent games (last 10)
        const recentGames = games.slice(0, 10).map(g => ({
          date: g.created_at,
          score: g.score,
          maxScore: g.max_score,
          type: g.game_type,
        }));

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
          weeklyMinutes,
          recentQuizzes,
          recentGames,
          loading: false,
        });
      } catch (err: any) {
        if (!cancelled) setData({ ...EMPTY, loading: false, error: err.message });
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [childProfileId]);

  return data;
}

function calcStreak(dates: string[]): { currentStreak: number; longestStreak: number } {
  if (!dates.length) return { currentStreak: 0, longestStreak: 0 };
  const uniqueDays = [...new Set(dates.map(d => new Date(d).toISOString().split('T')[0]))].sort().reverse();
  if (!uniqueDays.length) return { currentStreak: 0, longestStreak: 0 };

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let currentStreak = 0;
  if (uniqueDays[0] === today || uniqueDays[0] === yesterday) {
    currentStreak = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      const diff = (new Date(uniqueDays[i - 1]).getTime() - new Date(uniqueDays[i]).getTime()) / 86400000;
      if (Math.round(diff) === 1) currentStreak++;
      else break;
    }
  }

  let longestStreak = 1, streak = 1;
  const sorted = [...uniqueDays].sort();
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000;
    if (Math.round(diff) === 1) { streak++; longestStreak = Math.max(longestStreak, streak); }
    else streak = 1;
  }

  return { currentStreak, longestStreak };
}

function calcWeeklyMinutes(readings: { started_at: string; time_spent: number | null }[]): number[] {
  // Get the Monday of the current week
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() + mondayOffset);

  const result = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun
  for (const r of readings) {
    const d = new Date(r.started_at);
    const diffDays = Math.floor((d.getTime() - monday.getTime()) / 86400000);
    if (diffDays >= 0 && diffDays < 7) {
      result[diffDays] += r.time_spent || 0;
    }
  }
  return result;
}
