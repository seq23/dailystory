// Client side of the end-of-story quiz. The rules live in
// supabase/functions/_shared/quiz.ts so generate-quiz runs the same checks.
// Guard: src/test/guards/story-quiz.test.ts.
import { supabase } from "@/integrations/supabase/client";
import { normalizeGrade, typicalGradeForAge, quizBandForGrade } from "@/lib/grades";
import type { UserInfo } from "@/types";
import { cleanWords, practiceWordsFromRequest } from "../../supabase/functions/_shared/practiceWords";
import {
  finalizeQuiz,
  quizShapeForGrade,
  storySeed,
  type QuizQuestion,
  type QuizSource,
} from "../../supabase/functions/_shared/quiz";

export * from "../../supabase/functions/_shared/quiz";

/** The grade the quiz is written for: the reading grade the story was read at. */
export function quizGradeFor(userInfo: Partial<UserInfo> & Record<string, unknown>, storyGrade?: unknown) {
  return normalizeGrade(storyGrade) ?? normalizeGrade(userInfo?.readingGrade) ?? normalizeGrade(userInfo?.grade)
    ?? normalizeGrade(userInfo?.gradeLevel) ?? typicalGradeForAge(userInfo?.age ?? 7);
}

type Invoke = (name: string, opts: { body: unknown }) => Promise<{ data: any; error: any }>;

/**
 * The quiz for a story: generate-quiz first; whatever comes back is checked again
 * here; if the function is unreachable or returns nothing usable, a quiz is written
 * from the story text on the device. Never an empty quiz for a real story.
 */
export async function loadStoryQuiz(
  args: { storyText: string; userInfo: Partial<UserInfo> & Record<string, unknown>; storyGrade?: unknown; practiceWords?: string[] },
  invoke: Invoke = (n, o) => supabase.functions.invoke(n, o) as any,
): Promise<{ questions: QuizQuestion[]; source: QuizSource }> {
  const grade = quizGradeFor(args.userInfo, args.storyGrade);
  const story = (args.storyText || "").replace(/\s+/g, " ").trim();
  // Band by Reads-at grade, topics by real age; the same seed as the server, so both pick the same skills.
  // The parent's practice words: a word-meaning or spelling question uses one.
  const practiceWords = cleanWords([...(args.practiceWords ?? []), ...practiceWordsFromRequest(args.userInfo?.specialRequest)]);
  const shape = quizShapeForGrade(grade, args.userInfo?.age, storySeed(story.slice(0, 6000)), practiceWords);
  let raw: unknown = null;
  try {
    const { data, error } = await invoke("generate-quiz", {
      body: {
        storyText: story,
        grade,
        age: args.userInfo?.age,
        // Sent to our own function only, so it can mask the name before any model sees it.
        childName: args.userInfo?.name,
        displayName: (args.userInfo as any)?.displayName,
        practiceWords,
      },
    });
    if (!error && Array.isArray(data?.questions)) raw = data.questions;
  } catch {
    raw = null;
  }
  const out = finalizeQuiz(raw, story, shape);
  return out;
}

/** The quiz band for a child and story (Reads-at grade), for the quiz screens. */
export function quizBandFor(userInfo: Partial<UserInfo> & Record<string, unknown>, storyGrade?: unknown) {
  return quizBandForGrade(quizGradeFor(userInfo, storyGrade));
}

/**
 * The session cache key for a story's quiz. It covers the WHOLE story text (a never-ending
 * story keeps its first pages, so a key from the opening alone served an older session's
 * quiz), the Reads-at grade (a level change must change the quiz band) and the practice
 * words. Guard: src/test/guards/story-quiz.test.ts.
 */
export function quizCacheKey(args: { storyText: string; userInfo: Partial<UserInfo> & Record<string, unknown>; storyGrade?: unknown; practiceWords?: string[] }): string {
  const story = (args.storyText || "").replace(/\s+/g, " ").trim();
  let h = 2166136261;
  for (let i = 0; i < story.length; i++) h = Math.imul(h ^ story.charCodeAt(i), 16777619);
  const words = cleanWords([...(args.practiceWords ?? []), ...practiceWordsFromRequest(args.userInfo?.specialRequest)]);
  return `quiz2_${quizGradeFor(args.userInfo, args.storyGrade)}_${story.length}_${(h >>> 0).toString(36)}_${words.join(",")}`;
}

/** A cached quiz, only when it is one this version wrote (questions with skills, and its source). */
export function readCachedQuiz(raw: string | null): { questions: QuizQuestion[]; source: QuizSource } | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as { questions?: QuizQuestion[]; source?: QuizSource };
    const ok = Array.isArray(v?.questions) && v.questions.length > 0 && v.questions.every((q) =>
      typeof q?.skill === "string" && Array.isArray(q?.options) && Number.isInteger(q?.correctAnswer) && q.correctAnswer >= 0 && q.correctAnswer < q.options.length);
    return ok ? { questions: v.questions!, source: v.source === "ai" || v.source === "mixed" ? v.source : "fallback" } : null;
  } catch {
    return null;
  }
}
