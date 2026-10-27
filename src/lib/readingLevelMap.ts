// The reading-level map, as code (26 Oct 2026). Everything here is DERIVED from the
// one source, supabase/functions/_shared/grades.ts (GRADE_PROFILES): no level list is
// written by hand. docs/reading-levels.md shows the same table; the guard
// src/test/guards/reading-level-map.test.ts fails if the two differ.
import {
  GRADES,
  GRADE_PROFILES,
  EXPERT_GRADES,
  READING_LEVELS,
  BACKEND_DIFFICULTIES,
  normalizeGrade,
  normalizeExpertGrade,
  frontendLevelToDifficulty,
  backendDifficultyOf,
  minimumGradeForGuardrail,
  readingLevelForDifficulty,
  type Grade,
  type ReadingLevel,
  type BackendDifficulty,
  type ExpertGrade,
} from "@/lib/grades";
import { withReadingGrade } from "@/lib/readingLadder";

export { GRADES, READING_LEVELS, BACKEND_DIFFICULTIES, EXPERT_GRADES };
export { QUIZ_BANDS, QUIZ_SKILLS, QUIZ_SKILL_LABELS, quizBandForGrade, quizSkillPlan, type QuizBand, type QuizSkill } from "@/lib/grades";

export interface LevelMapRow {
  grade: Grade;
  gradeLabel: string;
  readingLevel: ReadingLevel;
  difficulty: BackendDifficulty;
  expertGrade: ExpertGrade | null;
  promptReadingLevel: string;
}

/** One row per grade: grade → frontend level → backend difficulty → expert sub-level → prompt text. */
export const LEVEL_MAP: readonly LevelMapRow[] = GRADES.map((g) => {
  const p = GRADE_PROFILES[g];
  return {
    grade: g,
    gradeLabel: p.longLabel,
    readingLevel: p.readingLevel,
    difficulty: p.difficulty,
    expertGrade: p.expertGrade,
    promptReadingLevel: p.promptReadingLevel,
  };
});

export interface LevelCombo extends LevelMapRow {
  /** Stable id for a test run, e.g. "grade-7". */
  id: string;
  /** The userInfo fields the reading page writes the story from (withReadingGrade). */
  userInfo: { grade: Grade; gradeLevel: Grade; difficultyLevel: ReadingLevel; expertGradeLevel: ExpertGrade | undefined };
  /** What generate-adaptive-story receives in body.config. */
  edgeConfig: { difficulty: BackendDifficulty; expertGradeLevel?: ExpertGrade };
  /** The grade carried in the request bundle (userInfo.gradeLevel); it is what tells Pre-K from K, and 1st from 2nd. */
  bundleGradeLevel: Grade;
  /** Parent "Minimum level" guardrails that land on exactly this grade. */
  guardrailMinimums: Array<{ minDifficulty: BackendDifficulty; minExpertGrade: ExpertGrade }>;
}

/**
 * Every distinct level the app can send to story generation. The reading page, the
 * Make easier/harder ladder and the parent guardrail all resolve to a grade, and the
 * grade fixes every other field, so there is one combination per grade (12).
 */
export const ALL_LEVEL_COMBOS: readonly LevelCombo[] = LEVEL_MAP.map((row) => {
  const info = withReadingGrade({}, row.grade);
  const guardrailMinimums = [
    ...BACKEND_DIFFICULTIES.filter((d) => d !== "expert").map((d) => ({ minDifficulty: d, minExpertGrade: "6th" as ExpertGrade })),
    ...EXPERT_GRADES.map((eg) => ({ minDifficulty: "expert" as BackendDifficulty, minExpertGrade: eg })),
  ].filter((m) => minimumGradeForGuardrail(m.minDifficulty, m.minExpertGrade) === row.grade);
  return {
    ...row,
    id: `grade-${row.grade}`,
    userInfo: {
      grade: info.grade,
      gradeLevel: info.gradeLevel,
      difficultyLevel: info.difficultyLevel,
      expertGradeLevel: info.expertGradeLevel,
    },
    edgeConfig: row.expertGrade ? { difficulty: row.difficulty, expertGradeLevel: row.expertGrade } : { difficulty: row.difficulty },
    bundleGradeLevel: row.grade,
    guardrailMinimums,
  };
});

export type StoredLevelColumn =
  | "profiles.reading_level"
  | "profiles.difficulty_level"
  | "profiles.grade_level"
  | "child_profiles.grade_level"
  | "child_profiles.reading_grade"
  | "user_preferences.reading_preferences.minDifficulty"
  | "user_preferences.reading_preferences.minExpertGrade";

/**
 * How a value stored in a column is read today, legacy values included. Returns the
 * grade it resolves to (or null: the column is ignored and the next source is used).
 */
export function normalizeStoredLevel(column: StoredLevelColumn, value: unknown): Grade | null {
  switch (column) {
    case "profiles.reading_level":
    case "profiles.difficulty_level": {
      // Frontend reading levels. "beginner" = 1st–2nd. A backend name ("easy") left by
      // the old guardrail clamp is read as that band. → lowest grade of that band.
      const d = frontendLevelToDifficulty(value);
      return d ? GRADES.find((g) => GRADE_PROFILES[g].difficulty === d)! : null;
    }
    case "profiles.grade_level":
    case "child_profiles.grade_level":
    case "child_profiles.reading_grade":
      return normalizeGrade(value);
    case "user_preferences.reading_preferences.minDifficulty":
      // Backend value ("beginner" = Pre-K/K). Missing → no minimum (Pre-K).
      return minimumGradeForGuardrail(backendDifficultyOf(value) ?? "beginner", "6th");
    case "user_preferences.reading_preferences.minExpertGrade":
      return normalizeExpertGrade(value) ? GRADES.find((g) => GRADE_PROFILES[g].expertGrade === normalizeExpertGrade(value))! : null;
  }
}

export { readingLevelForDifficulty, frontendLevelToDifficulty, backendDifficultyOf, minimumGradeForGuardrail };

/** Pre-K / Kindergarten / "3rd" grade words for a grade. */
function gradeWords(g: Grade): string {
  return g === "PreK" ? "Pre-K" : g === "K" ? "Kindergarten" : `${GRADE_PROFILES[g].shortLabel} grade`;
}

/**
 * What a story card says about its level, as a grade: "Reads at 3rd grade". Older saves
 * stored only a level name, so they show that level's grade band ("Reads at 3rd–4th grade").
 */
export function readsAtLabel(readingGrade: unknown, legacyLevel?: unknown): string {
  const g = normalizeGrade(readingGrade);
  if (g) return `Reads at ${gradeWords(g)}`;
  const d = frontendLevelToDifficulty(legacyLevel);
  if (!d) return "";
  const band = GRADES.filter((x) => GRADE_PROFILES[x].difficulty === d);
  const lo = band[0], hi = band[band.length - 1];
  if (lo === hi) return `Reads at ${gradeWords(lo)}`;
  const short = (x: Grade) => (x === "PreK" ? "Pre-K" : x === "K" ? "K" : GRADE_PROFILES[x].shortLabel);
  return `Reads at ${short(lo)}–${short(hi)}${hi === "K" ? "" : " grade"}`;
}

/** The grades a saved story counts as, for the library's "Reads at" filter. */
export function storyGrades(readingGrade: unknown, legacyLevel?: unknown): Grade[] {
  const g = normalizeGrade(readingGrade);
  if (g) return [g];
  const d = frontendLevelToDifficulty(legacyLevel);
  return d ? GRADES.filter((x) => GRADE_PROFILES[x].difficulty === d) : [];
}

// Grade-level words: the one copy of Dolch, Fry 1,000 and the Academic Word List
// (supabase/functions/_shared/wordLists.ts) and which grade gets which list
// (supabase/functions/_shared/gradeWords.ts). The edge functions read the same module.
export {
  GRADE_LIST_MAP,
  GRADE_NEW_WORDS,
  GRADE_WORD_LISTS,
  GRADE_WORD_SHARE_FLOOR,
  gradeWordShare,
  gradePromptWords,
  onGradeList,
} from "../../supabase/functions/_shared/gradeWords";
