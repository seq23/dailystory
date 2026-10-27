// A grown-up with no child profile: where the story page's Make easier / Make harder
// choice is kept (27 Oct 2026). It saved only profiles.difficulty_level, a broad level
// that spans two grades, so the exact Reads-at grade was lost on reload. Now the grade itself is kept in
// profiles.reading_grade (migration 20261027090000) and read back as userInfo.readingGrade,
// which startingReadingGrade() (src/lib/readingLadder.ts) puts first.
// Guard: src/test/guards/reads-at.test.ts.
import { normalizeGrade, type Grade, type ReadingLevel } from "@/lib/grades";

interface ProfilesTable {
  update: (patch: Record<string, unknown>) => { eq: (col: string, v: string) => PromiseLike<{ error: unknown }> };
}
interface Db { from: (table: "profiles") => unknown }

/**
 * Saves the reading level AND the exact grade. Two writes, so a database that does not
 * have the reading_grade column yet still keeps the level.
 */
export async function saveReadingGradeWithoutChild(db: Db, userId: string, step: { grade: Grade; readingLevel: ReadingLevel }): Promise<void> {
  const profiles = () => db.from("profiles") as ProfilesTable;
  await profiles().update({ difficulty_level: step.readingLevel }).eq("user_id", userId);
  const { error } = await profiles().update({ reading_grade: step.grade }).eq("user_id", userId);
  if (error) console.warn("profiles.reading_grade not saved", error);
}

/** The saved exact grade on a profile row (null when none or not a grade). */
export function savedReadingGrade(profile: unknown): Grade | null {
  return normalizeGrade((profile as { reading_grade?: unknown } | null | undefined)?.reading_grade);
}
