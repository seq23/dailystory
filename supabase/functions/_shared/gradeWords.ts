// Grade-level words (27 Oct 2026): which standard list belongs to which Reads-at grade,
// the words a story prompt asks for, and the share of a page's words that are on the
// reader's lists. Pure (imports only ./grades.ts and ./wordLists.ts), so the edge
// functions AND the app (src/lib/readingLevelMap.ts re-exports it) use the same rules.
//
// The mapping (docs/reading-levels.md, "Grade-level words"; the guard
// src/test/guards/word-lists.test.ts reads that table against GRADE_LIST_MAP):
//   Dolch: pre-primer → Pre-K, primer + nouns → K, then one list a grade, 1st–3rd.
//   Fry 1,000: 1st hundred → K, 2nd → 1st, 3rd → 2nd, 4th–5th → 3rd, 6th–7th → 4th,
//     8th–10th → 5th (one hundred a year to 2nd grade, all 1,000 by the end of 5th).
//   Academic Word List: two sublists a year, most frequent first: 1–2 → 6th,
//     3–4 → 7th, 5–6 → 8th, 7–8 → 9th, 9–10 → 10th.
import { GRADES, GRADE_PROFILES, normalizeGrade, type Grade } from "./grades.ts";
import {
  AWL_SUBLISTS,
  DOLCH_FIRST_GRADE,
  DOLCH_NOUNS,
  DOLCH_PRE_PRIMER,
  DOLCH_PRIMER,
  DOLCH_SECOND_GRADE,
  DOLCH_THIRD_GRADE,
  FRY_HUNDREDS,
} from "./wordLists.ts";

export interface GradeLists {
  /** Dolch lists introduced at this grade. */
  dolch: Array<"pre-primer" | "primer" | "nouns" | "1st grade" | "2nd grade" | "3rd grade">;
  /** Fry hundreds introduced at this grade (1 = 1st hundred). */
  fryHundreds: number[];
  /** Academic Word List sublists introduced at this grade (1 = sublist 1). */
  awlSublists: number[];
}

export const GRADE_LIST_MAP: Readonly<Record<Grade, GradeLists>> = Object.freeze({
  PreK: { dolch: ["pre-primer"], fryHundreds: [], awlSublists: [] },
  K: { dolch: ["primer", "nouns"], fryHundreds: [1], awlSublists: [] },
  "1": { dolch: ["1st grade"], fryHundreds: [2], awlSublists: [] },
  "2": { dolch: ["2nd grade"], fryHundreds: [3], awlSublists: [] },
  "3": { dolch: ["3rd grade"], fryHundreds: [4, 5], awlSublists: [] },
  "4": { dolch: [], fryHundreds: [6, 7], awlSublists: [] },
  "5": { dolch: [], fryHundreds: [8, 9, 10], awlSublists: [] },
  "6": { dolch: [], fryHundreds: [], awlSublists: [1, 2] },
  "7": { dolch: [], fryHundreds: [], awlSublists: [3, 4] },
  "8": { dolch: [], fryHundreds: [], awlSublists: [5, 6] },
  "9": { dolch: [], fryHundreds: [], awlSublists: [7, 8] },
  "10": { dolch: [], fryHundreds: [], awlSublists: [9, 10] },
});

const DOLCH: Record<GradeLists["dolch"][number], readonly string[]> = {
  "pre-primer": DOLCH_PRE_PRIMER,
  primer: DOLCH_PRIMER,
  nouns: DOLCH_NOUNS,
  "1st grade": DOLCH_FIRST_GRADE,
  "2nd grade": DOLCH_SECOND_GRADE,
  "3rd grade": DOLCH_THIRD_GRADE,
};

/** One entry may be two words ("Santa Claus"): each word counts on its own. */
const clean = (list: readonly string[]): string[] =>
  [...new Set(list.flatMap((w) => w.toLowerCase().split(/\s+/)).filter(Boolean))];

/** The words a grade introduces (its own lists only), in list order. */
export const GRADE_NEW_WORDS: Readonly<Record<Grade, readonly string[]>> = Object.freeze(
  Object.fromEntries(GRADES.map((g) => {
    const m = GRADE_LIST_MAP[g];
    return [g, clean([
      ...m.dolch.flatMap((d) => DOLCH[d]),
      ...m.fryHundreds.flatMap((h) => FRY_HUNDREDS[h - 1] ?? []),
      ...m.awlSublists.flatMap((s) => AWL_SUBLISTS[s - 1] ?? []),
    ])];
  })) as unknown as Record<Grade, readonly string[]>,
);

/** The words a reader at this grade is expected to know: every list up to and including it. */
export const GRADE_WORD_LISTS: Readonly<Record<Grade, readonly string[]>> = Object.freeze(
  Object.fromEntries(GRADES.map((g, i) => [g, clean(GRADES.slice(0, i + 1).flatMap((x) => GRADE_NEW_WORDS[x]))])) as unknown as Record<Grade, readonly string[]>,
);

const SETS = new Map<Grade, Set<string>>(GRADES.map((g) => [g, new Set(GRADE_WORD_LISTS[g])]));

/** On the list as written, or as an inflected form of a listed word (jumps, jumped, running, babies, analysed). */
export function onGradeList(word: string, grade: Grade): boolean {
  const set = SETS.get(grade)!;
  const w = word.toLowerCase().replace(/[’]/g, "'");
  if (set.has(w)) return true;
  const base = w.replace(/'s$/, "");
  const stems = [base];
  const add = (re: RegExp, ...to: string[]) => { if (re.test(base)) for (const t of to) stems.push(base.replace(re, t)); };
  add(/ies$/, "y");
  add(/es$/, "", "e");
  add(/s$/, "");
  add(/ied$/, "y");
  add(/ed$/, "", "e");
  add(/([bdfglmnprt])\1ed$/, "$1");
  add(/ing$/, "", "e");
  add(/([bdfglmnprt])\1ing$/, "$1");
  add(/ly$/, "");
  add(/ier$/, "y");
  add(/iest$/, "y");
  add(/er$/, "", "e");
  add(/est$/, "", "e");
  return stems.some((s) => s.length >= 1 && set.has(s));
}

/**
 * The words of a page that are judged: lower-cased, without names (a capitalised word
 * that does not start a sentence), story placeholders ({childName}) or numbers.
 */
export function judgedWords(page: string): string[] {
  const out: string[] = [];
  const text = (page ?? "").replace(/\{[^}]*\}/g, " ");
  for (const sentence of text.split(/(?<=[.!?]["”’)]?)\s+/)) {
    const toks = sentence.match(/[\p{L}][\p{L}'’]*/gu) ?? [];
    toks.forEach((t, i) => {
      if (i > 0 && /^\p{Lu}/u.test(t) && t !== "I") return; // a name
      out.push(t.toLowerCase().replace(/[’]/g, "'").replace(/'+$/, ""));
    });
  }
  return out;
}

/** Share of a page's distinct judged words that are on the reader's lists (0–1). */
export function gradeWordShare(page: string, grade: Grade): number {
  const ws = [...new Set(judgedWords(page))];
  return ws.length ? ws.filter((w) => onGradeList(w, grade)).length / ws.length : 0;
}

/**
 * The soft floor per grade: a page below it is rewritten once (./gradeWordRule.ts).
 * Set from sample pages written at each level (src/test/guards/word-lists.test.ts
 * pins that well-levelled pages pass and pages written far above the reader fail).
 */
export const GRADE_WORD_SHARE_FLOOR: Readonly<Record<Grade, number>> = Object.freeze({
  // Sample well-levelled pages scored 0.70–0.93 (a literary 9th-grade page 0.58);
  // pages written far above the reader 0.11–0.29. Upper grades get the most room.
  PreK: 0.45, K: 0.55, "1": 0.6, "2": 0.6, "3": 0.6, "4": 0.55, "5": 0.55,
  "6": 0.5, "7": 0.5, "8": 0.5, "9": 0.5, "10": 0.5,
});

/** Pages shorter than this (distinct judged words) are too short to judge. */
export const MIN_JUDGED_WORDS = 6;

/** The story pages in a model answer (pages are split by ***; a live answer is one page). */
export function storyPages(text: string): string[] {
  return (text ?? "").split(/\n?\s*\*\*\*\s*\n?/).map((p) => p.trim()).filter(Boolean);
}

/** The Reads-at grade a story is written for, from the request (null if nothing names one). */
export function readsAtGradeOf(userInfo: unknown, expertGrade?: unknown, difficulty?: unknown): Grade | null {
  const u = (userInfo ?? {}) as Record<string, unknown>;
  const g = normalizeGrade(u.readingGrade) ?? normalizeGrade(u.gradeLevel) ?? normalizeGrade(u.grade) ?? normalizeGrade(expertGrade);
  if (g) return g;
  const d = String(difficulty ?? "");
  return GRADES.find((x) => GRADE_PROFILES[x].difficulty === d) ?? null;
}

/**
 * A rotating handful of the grade's own words for the story prompt (same seed → same
 * words), so stories practise the whole list over time and not only its first line.
 */
export function gradePromptWords(grade: Grade, seed = 0, n = 12): string[] {
  const own = GRADE_NEW_WORDS[grade].filter((w) => w.length >= 2 || w === "a" || w === "i");
  if (own.length <= n) return [...own];
  const start = ((Math.floor(seed) % own.length) + own.length) % own.length;
  return Array.from({ length: n }, (_, i) => own[(start + i * Math.max(1, Math.floor(own.length / n))) % own.length]!);
}

/** The prompt line that asks for the reader's grade-level words. */
export function gradeWordsPromptLine(grade: Grade, seed = 0): string {
  return `Grade-level words for a reader at ${GRADE_PROFILES[grade].longLabel} (use several of them naturally, and keep most other words just as easy): ${gradePromptWords(grade, seed).join(", ")}`;
}
