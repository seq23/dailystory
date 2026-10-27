// One live story page: long enough for the reader's grade, new, and not repeating
// itself (27 Oct 2026).
//
// Live, a 2nd-grade premium story showed three pages of 14, 12 and 11 words. The
// "easy" prompt (storyPrompts.ts) asks for many short pages split by ***, a live page
// call took page [0] of that answer, and nothing checked its length. Pressing Next
// then showed page 1 again: the model echoed the previous page (sent to it as its own
// earlier turn) before writing on, and page [0] of THAT answer was the echo. The
// ending page repeated a sentence inside itself.
//
// So every live answer goes through livePageFromAnswer() (page markers removed, echoed
// pages dropped, one page left) and livePageProblem() (too short for the grade, a
// repeated sentence, or a near-copy of the story so far → rejected; the provider chain
// in storyTextProvider.ts then asks the next model, the same way cut-off text is).
// The per-grade floor is GRADE_PROFILES[grade].minWordsPerPage (./grades.ts).
// Backup Mode builds its page with backupPageFrom() so it meets the same floor.
// Guard: src/test/guards/live-page.test.ts.
import { minWordsPerPageForGrade, gradeProfile } from "./grades.ts";
import { midSentenceStart, storyTextProblem, stripReasoning } from "./storyOutputCheck.ts";

/** Words in a text (page markers are not words). */
export function wordCount(text: string): number {
  return (text || "").replace(/\*+/g, " ").split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

/** The pages of an answer, split on *** (or ** / a lone *) markers. */
export function splitPages(text: string): string[] {
  const t = stripReasoning(text || "");
  return t.split(/\s*\*{1,3}\s*/).map((p) => p.trim()).filter((p) => /[\p{L}\p{N}]/u.test(p));
}

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();

/** Sentences of a page, normalised (lower case, no punctuation). */
export function sentencesOf(text: string): string[] {
  return (text || "").split(/(?<=[.!?…])["'”’)]*\s+/).map(norm).filter(Boolean);
}

/** The first sentence (3+ words) a page says twice, or null. */
export function repeatedSentence(text: string): string | null {
  const seen = new Set<string>();
  for (const s of sentencesOf(text)) {
    if (s.split(" ").length < 3) continue;
    if (seen.has(s)) return s;
    seen.add(s);
  }
  return null;
}

const trigrams = (text: string): string[] => {
  const w = norm(text).split(" ").filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i + 2 < w.length; i++) out.push(`${w[i]} ${w[i + 1]} ${w[i + 2]}`);
  return out;
};

/** Share (0–1) of this page's three-word runs that already appear in the story so far. */
export function overlapWithPrevious(page: string, previous: string): number {
  const p = trigrams(page);
  if (!p.length || !previous?.trim()) return 0;
  const prev = new Set(trigrams(previous));
  return p.filter((t) => prev.has(t)).length / p.length;
}

/** At or above this share a page is a copy of what the child already read. */
export const NEAR_DUPLICATE_SHARE = 0.5;

/**
 * The single page a live call shows: page markers removed, and any leading pages that
 * only repeat the story so far dropped. "" when the answer is nothing but an echo.
 */
export function livePageFromAnswer(answer: string, previous = ""): string {
  const pages = splitPages(answer);
  const fresh = previous?.trim() ? pages.filter((p) => overlapWithPrevious(p, previous) < NEAR_DUPLICATE_SHARE) : pages;
  return fresh.join(" ").replace(/\s+/g, " ").trim();
}

/** The live page floor for a grade (fallback: the 2nd-grade floor, never 0). */
export function minWordsForGrade(grade: unknown): number {
  return minWordsPerPageForGrade(grade) ?? minWordsPerPageForGrade("2")!;
}

/** Upper end of the grade's target ("30-50 words per page" → 50). */
export function maxWordsForGrade(grade: unknown): number {
  const m = gradeProfile(grade)?.wordsPerPage.match(/(\d+)\s*[-–]\s*(\d+)/);
  return m ? Number(m[2]) : 50;
}

/**
 * Token budget for one live page: room for the grade's longest page (about 1.6 tokens a
 * word) plus margin, so a good model is never cut off by a budget sized for 15 words.
 */
export function livePageTokenBudget(grade: unknown): number {
  // Sized for the longest page we KEEP (maxKeptWordsForGrade, 30% over the target), not
  // the target's top: a 6th-grade page of 500+ words ran out of a 840-token budget.
  return Math.ceil(maxKeptWordsForGrade(grade) * 1.6) + 200;
}

/**
 * A live answer cut by the token budget, kept up to its last complete sentence; null when
 * nothing complete is left. 26 Oct 2026: a 6th-grade page (target 200-400 words) was
 * rejected as "truncated" after 500+ good words, the 40 s request budget ran out looking
 * for another model, and the reader got an error. The page is capped to whole sentences
 * anyway (capWords), so the complete part of a long cut answer is a full page.
 */
export function completeSentencesOf(text: string): string | null {
  const t = stripReasoning(text || "").trim();
  const m = t.match(/^[\s\S]*[.!?…]["'”’)\]*_]*(?=\s|$)/);
  return m && m[0].trim() ? m[0].trim() : null;
}

/**
 * Whole sentences up to `max` words (always at least the first sentence). Live, the free
 * tier's first model wrote 281 words for a 2nd-grade page (target 30-50).
 */
export function capWords(text: string, max: number): string {
  const t = (text || "").trim();
  if (!max || wordCount(t) <= max) return t;
  const parts = t.split(/(?<=[.!?…]["'”’)]*)\s+/);
  let out = "";
  for (const p of parts) {
    const next = out ? `${out} ${p}` : p;
    if (out && wordCount(next) > max) break;
    out = next;
  }
  return out;
}

/** Longest live page kept for a grade: 30% over the top of its target, whole sentences. */
export function maxKeptWordsForGrade(grade: unknown): number {
  return Math.round(maxWordsForGrade(grade) * 1.3);
}

/** The instruction appended to a live page's system prompt; it overrides the multi-page format. */
export function livePageInstruction(grade: unknown, opts: { ending?: boolean } = {}): string {
  const p = gradeProfile(grade);
  const target = p?.wordsPerPage ?? "30-50 words per page";
  const min = minWordsForGrade(grade);
  return `\n\nLIVE PAGE (this overrides any page format above): write exactly ONE page of ${target}, never fewer than ${min} and never more than ${maxWordsForGrade(grade)} words. ` +
    `Keep every sentence to about ${maxSentenceWordsForGrade(grade)} words or fewer. ` +
    `Do not write *** or any page marker, and do not write a second page. Never repeat a sentence. ` +
    (opts.ending
      ? `This is the LAST page: continue from the last line of the story so far and bring it to a satisfying ending. Do not retell earlier pages.`
      : `Continue from the last line of the story so far with new events; never retell or copy earlier pages.`);
}

/** The grade's longest sentence (GRADE_PROFILES.maxSentenceWords); 15 when unknown. */
export function maxSentenceWordsForGrade(grade: unknown): number {
  return gradeProfile(grade)?.maxSentenceWords ?? 15;
}

/**
 * A page whose sentences average more than this many times the grade's longest sentence
 * reads above the grade (26 Oct 2026, live: a 5th-grade page averaged 29.6 words a
 * sentence against 20, Flesch-Kincaid 11.3). Loose on purpose: one long sentence is fine.
 */
export const SENTENCE_LENGTH_SLACK = 1.5;
export function averageSentenceWords(text: string): number {
  const s = sentencesOf(text);
  return s.length ? wordCount(text) / s.length : wordCount(text);
}

/**
 * Why this answer must not be the next live page, or null when it may.
 * Checks the page the reader would see (after livePageFromAnswer).
 */
export function livePageProblem(answer: string, finishReason: string | null | undefined, opts: { minWords: number; previous?: string; maxSentenceWords?: number }): string | null {
  if (finishReason === "length") {
    // Cut by the budget: judge (and later show) only its complete sentences.
    const kept = completeSentencesOf(answer);
    if (!kept) return "truncated (finish_reason length)";
    const problem = livePageProblem(kept, "stop", opts);
    return problem ? `truncated, and its complete part ${problem}` : null;
  }
  const base = storyTextProblem(answer, finishReason);
  if (base && !/^too short/.test(base)) return base;
  const page = livePageFromAnswer(answer, opts.previous ?? "");
  if (!page) return "repeats the previous page";
  const mid = midSentenceStart(page);
  if (mid) return mid;
  const n = wordCount(page);
  if (n < opts.minWords) return `too short (${n} < ${opts.minWords} words)`;
  const again = repeatedSentence(page);
  if (again) return `repeats a sentence ("${again.slice(0, 50)}")`;
  if (opts.previous && overlapWithPrevious(page, opts.previous) >= NEAR_DUPLICATE_SHARE) return "near-copy of the previous page";
  if (opts.maxSentenceWords) {
    const avg = averageSentenceWords(page);
    if (avg > opts.maxSentenceWords * SENTENCE_LENGTH_SLACK) return `sentences too long for the grade (average ${avg.toFixed(1)} words; grade max ${opts.maxSentenceWords})`;
  }
  return null;
}

/**
 * A whole (Netflix) story: the pages it will show must average the grade floor.
 * At least 6 pages are shown, so a short answer is force-split thinner than it looks.
 */
export function wholeStoryProblem(answer: string, finishReason: string | null | undefined, minWords: number): string | null {
  const base = storyTextProblem(answer, finishReason);
  if (base) return base;
  const pages = splitPages(answer);
  const total = pages.reduce((n, p) => n + wordCount(p), 0);
  const need = minWords * Math.max(pages.length, 6);
  return total < need ? `too short (${total} words for ${Math.max(pages.length, 6)} pages; ${need} needed)` : null;
}

/**
 * Backup Mode's page: template pages from this page number on, joined until the grade
 * floor is met, skipping any page the child has already read. Never the same page twice.
 */
export function backupPageFrom(pages: string[], pageNumber: number, minWords: number, alreadyRead: string[] = []): string {
  const list = (pages || []).map((p) => (p || "").trim()).filter(Boolean);
  if (!list.length) return "";
  const read = alreadyRead.join(" \n ");
  const start = (Math.max(1, Math.floor(pageNumber)) - 1) % list.length;
  const parts: string[] = [];
  for (let i = 0; i < list.length && wordCount(parts.join(" ")) < minWords; i++) {
    const p = list[(start + i) % list.length]!;
    if (read && overlapWithPrevious(p, read) >= NEAR_DUPLICATE_SHARE) continue;
    parts.push(p);
  }
  // Every template page already read: still reach the floor rather than show a stub.
  for (let i = 0; i < list.length && wordCount(parts.join(" ")) < minWords; i++) parts.push(list[(start + i) % list.length]!);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}
