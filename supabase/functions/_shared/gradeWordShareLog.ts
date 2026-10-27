// Writes the grade-word share of each story answer to public.story_grade_word_shares
// (migration 20261027090000), so the soft rule in ./gradeWordRule.ts can be checked
// later. Never throws: a broken log must not break a story. No personal data: no name,
// no story text, only the grade and the numbers.
import type { GradeWordReport } from "./gradeWordRule.ts";

export function gradeWordShareRow(r: GradeWordReport, sessionId: string | null, pageNumber: number | null) {
  return {
    reads_at: r.grade,
    floor: r.floor,
    min_share: r.minShare,
    pages: r.pages.map((p) => ({ page: p.page, share: p.share, words: p.words, below: p.below, rewritten: p.rewritten, rewrite_share: p.rewriteShare, kept: p.kept })),
    rewritten: r.pages.some((p) => p.rewritten),
    session_id: sessionId ? String(sessionId).slice(0, 120) : null,
    page_number: typeof pageNumber === "number" ? pageNumber : null,
  };
}

export async function logGradeWordShare(r: GradeWordReport, sessionId: string | null, pageNumber: number | null): Promise<void> {
  try {
    const row = gradeWordShareRow(r, sessionId, pageNumber);
    console.log("📏 grade_word_share", JSON.stringify(row));
    // deno-lint-ignore no-explicit-any
    const env = (globalThis as any).Deno?.env;
    const url = env?.get("SUPABASE_URL");
    const key = env?.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return;
    const res = await fetch(`${url}/rest/v1/story_grade_word_shares`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(row),
    });
    if (!res.ok) console.warn("story_grade_word_shares insert refused", res.status);
  } catch (err) {
    console.warn("story_grade_word_shares insert failed", String(err));
  }
}
