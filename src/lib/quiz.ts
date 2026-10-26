// Client side of the end-of-story quiz. The rules live in
// supabase/functions/_shared/quiz.ts so generate-quiz runs the same checks.
// Guard: src/test/guards/story-quiz.test.ts.
import { supabase } from "@/integrations/supabase/client";
import { normalizeGrade, typicalGradeForAge, quizBandForGrade } from "@/lib/grades";
import type { UserInfo } from "@/types";
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
  args: { storyText: string; userInfo: Partial<UserInfo> & Record<string, unknown>; storyGrade?: unknown },
  invoke: Invoke = (n, o) => supabase.functions.invoke(n, o) as any,
): Promise<{ questions: QuizQuestion[]; source: QuizSource }> {
  const grade = quizGradeFor(args.userInfo, args.storyGrade);
  const story = (args.storyText || "").replace(/\s+/g, " ").trim();
  // Band by Reads-at grade, topics by real age; the same seed as the server, so both pick the same skills.
  const shape = quizShapeForGrade(grade, args.userInfo?.age, storySeed(story.slice(0, 6000)));
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
