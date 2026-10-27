// The soft grade-word rule (27 Oct 2026). Every page of a story answer is scored for
// the share of its words on the reader's grade lists (./gradeWords.ts). A page below
// its grade's floor is rewritten ONCE, and whichever version scores better is kept.
// The rule never throws and never fails a story: a rewrite that errors, comes back
// empty or scores no better leaves the page as it was, so it can never send a family
// to Backup Mode. The report is logged (story_grade_word_shares) so it can be checked.
// Guard: src/test/guards/word-lists.test.ts.
import { GRADE_PROFILES, type Grade } from "./grades.ts";
import {
  GRADE_WORD_SHARE_FLOOR,
  MIN_JUDGED_WORDS,
  gradePromptWords,
  gradeWordShare,
  judgedWords,
  storyPages,
} from "./gradeWords.ts";

export interface PageShare {
  page: number;
  share: number;
  words: number;
  /** Below the floor on the first answer. */
  below: boolean;
  /** A rewrite was asked for (at most one per page). */
  rewritten: boolean;
  /** Share of the rewrite, when there was one that came back. */
  rewriteShare: number | null;
  kept: "original" | "rewrite";
}

export interface GradeWordReport {
  grade: Grade;
  floor: number;
  pages: PageShare[];
  /** Lowest kept share across the judged pages (null when no page was long enough). */
  minShare: number | null;
}

/** Rewrites one page; returns the new text, or null. May throw: the rule catches it. */
export type PageRewriter = (page: string, request: { system: string; user: string }) => Promise<string | null>;

export function rewriteRequest(page: string, grade: Grade, seed = 0): { system: string; user: string } {
  const label = GRADE_PROFILES[grade].longLabel;
  return {
    system:
      `You edit one page of a children's story for a reader who reads at ${label}. ` +
      "Keep every event, every name and every line of dialogue, and about the same length. " +
      `Swap words that are hard for a ${label} reader for plainer ones they know. ` +
      `Where it fits, use some of these grade-level words: ${gradePromptWords(grade, seed).join(", ")}. ` +
      "Reply with the page text only: no title, no notes, no page markers.",
    user: page,
  };
}

const judged = (page: string) => new Set(judgedWords(page)).size >= MIN_JUDGED_WORDS;

/** Score each page; rewrite each page below the floor once; keep the better version. */
export async function applyGradeWordRule(text: string, grade: Grade, rewrite: PageRewriter, seed = 0): Promise<{ text: string; report: GradeWordReport }> {
  const floor = GRADE_WORD_SHARE_FLOOR[grade];
  const report: GradeWordReport = { grade, floor, pages: [], minShare: null };
  const pages = storyPages(text);
  if (!pages.length) return { text, report };
  const kept: string[] = [];
  let changed = false;
  for (const [i, page] of pages.entries()) {
    const share = gradeWordShare(page, grade);
    const words = new Set(judgedWords(page)).size;
    const row: PageShare = { page: i + 1, share: round(share), words, below: false, rewritten: false, rewriteShare: null, kept: "original" };
    let out = page;
    if (judged(page) && share < floor) {
      row.below = true;
      row.rewritten = true;
      try {
        const again = (await rewrite(page, rewriteRequest(page, grade, seed + i)))?.trim();
        if (again && judged(again) && !/\*\*\*/.test(again)) {
          const s2 = gradeWordShare(again, grade);
          row.rewriteShare = round(s2);
          if (s2 > share) { out = again; row.kept = "rewrite"; changed = true; }
        }
      } catch {
        // A failed rewrite keeps the page as it was.
      }
    }
    report.pages.push(row);
    kept.push(out);
  }
  const judgedShares = report.pages.filter((p) => p.words >= MIN_JUDGED_WORDS).map((p) => (p.kept === "rewrite" ? p.rewriteShare! : p.share));
  report.minShare = judgedShares.length ? Math.min(...judgedShares) : null;
  // Untouched answers go back byte for byte; a rewritten one keeps its *** page markers.
  return { text: changed ? kept.join("\n\n***\n\n") : text, report };
}

const round = (x: number) => Math.round(x * 1000) / 1000;
