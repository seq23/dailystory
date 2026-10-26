// The reading level ladder behind the story page's "Make easier" / "Make harder"
// buttons (26 Oct 2026). One step = one grade, Pre-K to 10th, from the one list in
// ./grades. A step sets everything a story is written from: the grade the prompt
// names, the reading level, and the expert sub-level for 6th–10th.
//
// Before: the buttons walked five reading levels; "advanced" was a silent dead end
// (the expert-grade code checked for 'expert', a value the page never holds), the
// next page was written from a stale context at the OLD level, and the choice was
// saved on the grown-up's profile instead of the child's.
// Guard: src/test/guards/reading-level-ladder.test.ts.
import {
  GRADES,
  type Grade,
  type ReadingLevel,
  type ExpertGrade,
  normalizeGrade,
  gradeProfile,
  readingLevelForGrade,
  expertGradeForGrade,
  typicalGradeForAge,
} from "@/lib/grades";

export interface ReadingStep {
  grade: Grade;
  readingLevel: ReadingLevel;
  expertGrade: ExpertGrade | null;
  /** Badge text, e.g. "2nd grade" or "Pre-K". */
  label: string;
}

export function readingStep(grade: Grade): ReadingStep {
  const p = gradeProfile(grade)!;
  return {
    grade,
    readingLevel: p.readingLevel,
    expertGrade: p.expertGrade,
    label: grade === "PreK" || grade === "K" ? p.longLabel : `${p.shortLabel} grade`,
  };
}

export const EASIEST_GRADE: Grade = GRADES[0];
export const HARDEST_GRADE: Grade = GRADES[GRADES.length - 1];

/** One step up or down. At either end the grade stays and atEdge is true. */
export function stepReadingGrade(grade: Grade, direction: "up" | "down"): { step: ReadingStep; atEdge: boolean } {
  const i = GRADES.indexOf(grade);
  const j = direction === "up" ? i + 1 : i - 1;
  if (i < 0 || j < 0 || j >= GRADES.length) return { step: readingStep(i < 0 ? EASIEST_GRADE : grade), atEdge: true };
  return { step: readingStep(GRADES[j]), atEdge: false };
}

const FRONTEND_LEVELS: readonly ReadingLevel[] = ["pre-reader", "beginner", "developing", "independent", "advanced"];

/**
 * Where the ladder starts: a saved reading grade for this child, else the child's
 * grade. When the reading level the family chose (difficultyLevel) does not match
 * that grade, start at the nearest grade that has that reading level.
 */
export function startingReadingGrade(info: {
  readingGrade?: unknown;
  grade?: unknown;
  gradeLevel?: unknown;
  age?: unknown;
  difficultyLevel?: unknown;
} | null | undefined): Grade {
  const saved = normalizeGrade(info?.readingGrade);
  if (saved) return saved;
  const grade = normalizeGrade(info?.grade) ?? normalizeGrade(info?.gradeLevel) ?? typicalGradeForAge(info?.age ?? 7);
  const level = info?.difficultyLevel as ReadingLevel | undefined;
  if (!level || !FRONTEND_LEVELS.includes(level) || readingLevelForGrade(grade) === level) return grade;
  const here = GRADES.indexOf(grade);
  let best: Grade = grade;
  let bestDistance = Infinity;
  GRADES.forEach((g, idx) => {
    if (readingLevelForGrade(g) === level && Math.abs(idx - here) < bestDistance) {
      best = g;
      bestDistance = Math.abs(idx - here);
    }
  });
  return best;
}

/** The user info a story is written from, at this reading grade. */
export function withReadingGrade<T extends object>(info: T, grade: Grade): T & {
  grade: Grade;
  gradeLevel: Grade;
  difficultyLevel: ReadingLevel;
  expertGradeLevel: ExpertGrade | undefined;
} {
  const step = readingStep(grade);
  return {
    ...info,
    grade: step.grade,
    gradeLevel: step.grade,
    difficultyLevel: step.readingLevel,
    expertGradeLevel: step.expertGrade ?? undefined,
  };
}

