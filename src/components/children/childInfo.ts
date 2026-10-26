// Small helpers for showing a child the same way everywhere (header, lists, story form).
import type { ChildProfile } from "@/hooks/useChildProfiles";
import { avatarImageFor } from "@/components/ui/avatar-picker";
import { GRADES, MAX_AGE, MIN_AGE, gradeLabel, normalizeGrade } from "@/lib/grades";

export const CHILD_GRADES: { value: string; label: string }[] = GRADES.map((g) => ({ value: g, label: gradeLabel(g, "short") }));
export const CHILD_MIN_AGE = MIN_AGE;
export const CHILD_MAX_AGE = MAX_AGE;

/** "Pre-K", "Kindergarten", "5th grade": the same words in the header, lists and story form. */
export function gradeText(grade: string | null | undefined): string | null {
  const g = normalizeGrade(grade);
  if (!g) return grade ? String(grade) : null;
  if (g === "PreK") return "Pre-K";
  if (g === "K") return "Kindergarten";
  return `${gradeLabel(g, "short")} grade`;
}

export function childAge(child: Pick<ChildProfile, "birth_year" | "birth_month">, now = new Date()): number | null {
  if (!child.birth_year) return null;
  let age = now.getFullYear() - child.birth_year;
  if (child.birth_month && now.getMonth() + 1 < child.birth_month) age -= 1;
  return age;
}

/** The grade a child's stories are written at: Reads at, else the school grade. */
export function readsAtGrade(child: Pick<ChildProfile, "grade_level"> & { reading_grade?: string | null }): string | null {
  return normalizeGrade(child.reading_grade) ?? normalizeGrade(child.grade_level);
}

/** "School: 5th grade · Reads at 7th grade · 10 years old", nothing shown for what we don't know. */
export function childSummary(child: ChildProfile): string {
  const school = gradeText(child.grade_level);
  const reads = gradeText(readsAtGrade(child as ChildProfile & { reading_grade?: string | null }));
  const parts = [
    school ? `School: ${school}` : null,
    reads ? `Reads at ${reads}` : null,
    childAge(child) != null ? `${childAge(child)} years old` : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

export function childAvatarUrl(child: Pick<ChildProfile, "avatar"> | null | undefined): string {
  const a = (child?.avatar ?? null) as { type?: string; skinTone?: string } | null;
  return avatarImageFor(a?.type, a?.skinTone);
}
