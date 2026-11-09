// Automatic step-up for Premium readers at Reads at 6th-10th (product choice, her ruling
// 8 Nov 2026: Premium only, 6th-10th only).
//
// Before 8 Nov 2026 the step-up only changed in-memory state and a browser-storage record
// keyed by the child's name, at the end of the session. The next session starts from the
// child's saved Reads at (startingReadingGrade), so every step-up was lost: a toast and
// nothing else. Now a step-up is saved the same way as the Make harder button
// (child_profiles.reading_grade, the field the parent sees), so it survives the next
// session and other devices. A parent's lock stops it. The minimum level only limits going
// down, so a step-up never crosses it.
// Guard: src/test/guards/premium-step-up.test.ts.
import { expertGradeForGrade, normalizeGrade, type Grade } from "@/lib/grades";
import { stepReadingGrade, readingStep, type ReadingStep } from "@/lib/readingLadder";

/** One strong completed session: at least 6 pages at 120+ WPM, or 10 pages at 80+ WPM. */
export function meetsStepUpCriteria(session: { pagesCompleted?: number; readingSpeed?: number }): boolean {
  const pages = session.pagesCompleted ?? 0;
  const wpm = session.readingSpeed ?? 0;
  return (pages >= 6 && wpm >= 120) || (pages >= 10 && wpm >= 80);
}

export async function applyPremiumStepUp(opts: {
  /** The Reads at grade the session was read at. */
  grade: Grade;
  isPremium: boolean;
  lockDifficulty: boolean;
  session: { pagesCompleted?: number; readingSpeed?: number };
  /** Saves the new Reads at where the next session reads it (the child's profile). */
  save: (grade: Grade) => Promise<void>;
}): Promise<ReadingStep | null> {
  const grade = normalizeGrade(opts.grade);
  if (!opts.isPremium || opts.lockDifficulty || !grade) return null;
  if (!expertGradeForGrade(grade)) return null; // 6th-10th only
  if (!meetsStepUpCriteria(opts.session)) return null;
  const { step, atEdge } = stepReadingGrade(grade, "up");
  if (atEdge) return null; // already 10th
  await opts.save(step.grade);
  return readingStep(step.grade);
}
