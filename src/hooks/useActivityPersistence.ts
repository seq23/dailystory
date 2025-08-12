
import { supabase } from "@/integrations/supabase/client";
import type { UserInfo } from "@/types";

/**
 * Very small, focused helpers to persist quiz/game results.
 * - If the user is logged in: insert into Supabase
 * - If not: persist to localStorage as a queue
 * 
 * Returns a result indicating whether it was persisted to supabase or local.
 */

type QuizAttemptParams = {
  score: number;
  totalQuestions: number;
  storyText: string;
  language?: string;
  userInfo?: UserInfo;
  mode?: "offline" | "ai";
  details?: Record<string, any>;
};

type GameSessionParams = {
  score: number;
  maxScore: number;
  storyText: string;
  language?: string;
  gameType?: string; // 'mixed' for multi-round or a specific type
  durationSeconds?: number;
  userInfo?: UserInfo;
  details?: Record<string, any>;
};

type PersistResult = { persisted: boolean; method: "supabase" | "local"; error?: string };

const LOCAL_QUIZ_KEY = "quiz_attempts_local";
const LOCAL_GAME_KEY = "game_sessions_local";

function getLocalArray<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function setLocalArray<T>(key: string, value: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function hashStorySignature(input: string): string {
  // Lightweight djb2 string hash, stable across sessions
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    // eslint-disable-next-line no-bitwise
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  // Convert to unsigned and hex string
  return (hash >>> 0).toString(16);
}

export async function saveQuizAttempt({
  score,
  totalQuestions,
  storyText,
  language = "en",
  userInfo,
  mode = "offline",
  details = {},
}: QuizAttemptParams): Promise<PersistResult> {
  console.log("[quiz] save attempt start", { score, totalQuestions, language, mode });

  const signature = hashStorySignature(storyText || "");
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id ?? null;

  const payload = {
    user_id: userId ?? undefined,
    story_signature: signature,
    story_title: null as string | null,
    language,
    mode,
    score,
    total_questions: totalQuestions,
    details: {
      ...details,
      story_signature: signature,
      child_age: userInfo?.age,
      difficulty: (userInfo as any)?.difficultyLevel || (userInfo as any)?.readingAbility,
    },
  };

  if (!userId) {
    // Guest: save locally
    const arr = getLocalArray<typeof payload>(LOCAL_QUIZ_KEY);
    arr.push(payload);
    setLocalArray(LOCAL_QUIZ_KEY, arr);
    console.log("[quiz] saved locally (guest)");
    return { persisted: true, method: "local" };
  }

  const { error } = await supabase.from("quiz_attempts").insert({
    user_id: userId,
    story_signature: payload.story_signature,
    story_title: payload.story_title,
    language: payload.language,
    mode: payload.mode,
    score: payload.score,
    total_questions: payload.total_questions,
    details: payload.details,
  });

  if (error) {
    console.warn("[quiz] supabase insert failed, falling back to local", error);
    const arr = getLocalArray<typeof payload>(LOCAL_QUIZ_KEY);
    arr.push(payload);
    setLocalArray(LOCAL_QUIZ_KEY, arr);
    return { persisted: false, method: "local", error: error.message };
  }

  console.log("[quiz] saved to supabase");
  return { persisted: true, method: "supabase" };
}

export async function saveGameSession({
  score,
  maxScore,
  storyText,
  language = "en",
  gameType = "mixed",
  durationSeconds,
  userInfo,
  details = {},
}: GameSessionParams): Promise<PersistResult> {
  console.log("[games] save session start", { score, maxScore, language, gameType, durationSeconds });

  const signature = hashStorySignature(storyText || "");
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id ?? null;

  const payload = {
    user_id: userId ?? undefined,
    story_title: null as string | null,
    language,
    game_type: gameType,
    score,
    max_score: maxScore,
    duration_seconds: durationSeconds ?? null,
    details: {
      ...details,
      story_signature: signature,
      child_age: userInfo?.age,
      difficulty: (userInfo as any)?.difficultyLevel || (userInfo as any)?.readingAbility,
    },
  };

  if (!userId) {
    const arr = getLocalArray<typeof payload>(LOCAL_GAME_KEY);
    arr.push(payload);
    setLocalArray(LOCAL_GAME_KEY, arr);
    console.log("[games] saved locally (guest)");
    return { persisted: true, method: "local" };
  }

  const { error } = await supabase.from("game_sessions").insert({
    user_id: userId,
    story_title: payload.story_title,
    language: payload.language,
    game_type: payload.game_type,
    score: payload.score,
    max_score: payload.max_score,
    duration_seconds: payload.duration_seconds,
    details: payload.details,
  });

  if (error) {
    console.warn("[games] supabase insert failed, falling back to local", error);
    const arr = getLocalArray<typeof payload>(LOCAL_GAME_KEY);
    arr.push(payload);
    setLocalArray(LOCAL_GAME_KEY, arr);
    return { persisted: false, method: "local", error: error.message };
  }

  console.log("[games] saved to supabase");
  return { persisted: true, method: "supabase" };
}

export async function syncLocalActivityToSupabase(): Promise<{ quizzesSynced: number; gamesSynced: number; error?: string }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) {
      return { quizzesSynced: 0, gamesSynced: 0 };
    }

    // Sync quizzes
    const localQuizzes = getLocalArray<any>(LOCAL_QUIZ_KEY);
    let quizzesSynced = 0;
    if (localQuizzes.length > 0) {
      const rows = localQuizzes.map((p: any) => ({
        user_id: userId,
        story_signature: p.story_signature ?? p.details?.story_signature ?? null,
        story_title: p.story_title ?? null,
        language: p.language ?? 'en',
        mode: p.mode ?? 'offline',
        score: p.score ?? 0,
        total_questions: p.total_questions ?? 0,
        details: p.details ?? {},
      }));
      const { error } = await supabase.from('quiz_attempts').insert(rows);
      if (!error) {
        quizzesSynced = rows.length;
        setLocalArray(LOCAL_QUIZ_KEY, []);
      } else {
        return { quizzesSynced, gamesSynced: 0, error: error.message };
      }
    }

    // Sync games
    const localGames = getLocalArray<any>(LOCAL_GAME_KEY);
    let gamesSynced = 0;
    if (localGames.length > 0) {
      const rows = localGames.map((p: any) => ({
        user_id: userId,
        story_title: p.story_title ?? null,
        language: p.language ?? 'en',
        game_type: p.game_type ?? 'mixed',
        score: p.score ?? 0,
        max_score: p.max_score ?? 0,
        duration_seconds: p.duration_seconds ?? null,
        details: p.details ?? {},
      }));
      const { error } = await supabase.from('game_sessions').insert(rows);
      if (!error) {
        gamesSynced = rows.length;
        setLocalArray(LOCAL_GAME_KEY, []);
      } else {
        return { quizzesSynced, gamesSynced, error: error.message };
      }
    }

    return { quizzesSynced, gamesSynced };
  } catch (e: any) {
    return { quizzesSynced: 0, gamesSynced: 0, error: e?.message || 'Unknown error' };
  }
}
