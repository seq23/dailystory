// The parent's practice words (26 Oct 2026, owner: every word typed in "Any words to
// practice?" must appear in the story, each one, every time).
//
// Path: SpecialRequestDialog / first-run form → "Target vocabulary: a, b" in the request
// → VocabularyService → the story prompt line built by practiceWordsPromptLine() →
// generate-adaptive-story reads it back with practiceWordsFromPrompt(), checks the
// answer with missingPracticeWords(), retries once with the missing words named, and
// as a last resort weaves them in (weaveMissingWords). The same words are highlighted
// in the story and used by that story's quiz. Pure: no imports.
// Guard: src/test/guards/practice-words.test.ts.

const MAX_PRACTICE_WORDS = 10;

/** "Target vocabulary: dragon, brave" (the request text the dialog composes) → words. */
export function practiceWordsFromRequest(text: unknown): string[] {
  if (typeof text !== "string") return [];
  const m = text.match(/target vocabulary\s*:\s*([^\n;]+)/i);
  return m ? cleanWords(m[1].split(/[,/]/)) : [];
}

export function cleanWords(list: unknown[]): string[] {
  const out: string[] = [];
  for (const raw of list) {
    const w = typeof raw === "string" ? raw.trim().toLowerCase().replace(/^[^\p{L}]+|[^\p{L}'-]+$/gu, "") : "";
    if (w && w.length <= 40 && !out.includes(w)) out.push(w);
  }
  return out.slice(0, MAX_PRACTICE_WORDS);
}

const PROMPT_LEAD = "PRACTICE WORDS (use EVERY one, spelled exactly, at least once):";

/** The one prompt line naming the practice words (client writes it, server reads it back). */
export function practiceWordsPromptLine(words: string[]): string {
  const w = cleanWords(words);
  return w.length ? `${PROMPT_LEAD} ${w.join(", ")}.` : "";
}

export function practiceWordsFromPrompt(prompt: unknown): string[] {
  if (typeof prompt !== "string") return [];
  const i = prompt.indexOf(PROMPT_LEAD);
  if (i < 0) return [];
  const rest = prompt.slice(i + PROMPT_LEAD.length).split("\n")[0].replace(/\.\s*$/, "");
  return cleanWords(rest.split(","));
}

const esc = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The word itself or a simple inflection: -s/-es/-ed/-ing/-er/-est/-ly, y→ies/ied, e dropped, consonant doubled. */
export function inflections(word: string): string[] {
  const w = word.toLowerCase();
  const forms = new Set([w, `${w}s`, `${w}es`, `${w}ed`, `${w}d`, `${w}ing`, `${w}er`, `${w}est`, `${w}ly`, `${w}'s`]);
  if (/[^aeiou]y$/.test(w)) for (const s of ["ies", "ied", "ier", "iest", "ily"]) forms.add(w.slice(0, -1) + s);
  if (/e$/.test(w)) for (const s of ["ing", "ed", "er", "est"]) forms.add(w.slice(0, -1) + s);
  if (/[^aeiou][aeiou][bdgmnprt]$/.test(w)) for (const s of ["ing", "ed", "er", "est"]) forms.add(w + w.slice(-1) + s);
  return [...forms];
}

export function hasPracticeWord(text: string, word: string): boolean {
  const re = new RegExp(`(?<![\\p{L}])(?:${inflections(word).map(esc).join("|")})(?![\\p{L}])`, "iu");
  return re.test(text || "");
}

export function missingPracticeWords(text: string, words: string[]): string[] {
  return cleanWords(words).filter((w) => !hasPracticeWord(text, w));
}

/** How many practice words one live page must carry (a whole story or the ending page: all). */
export function practiceWordsRequired(remaining: number, opts: { wholeStory: boolean; endingPage?: boolean; difficulty?: string }): number {
  if (remaining <= 0) return 0;
  if (opts.wholeStory || opts.endingPage) return remaining;
  const perPage = opts.difficulty === "beginner" ? 1 : opts.difficulty === "easy" ? 2 : 3;
  return Math.min(remaining, perPage);
}

/**
 * Last resort: put each missing word into the text with a short sentence, before the
 * final page break when there is one. Never drops a word.
 */
export function weaveMissingWords(text: string, missing: string[]): string {
  const words = cleanWords(missing).filter((w) => !hasPracticeWord(text, w));
  if (!words.length) return text;
  const sentence = words.length === 1
    ? `Everyone smiled at the special word of the day: “${words[0]}.”`
    : `Everyone smiled at the special words of the day: ${words.map((w) => `“${w}”`).join(", ")}.`;
  const t = (text || "").trimEnd();
  const lastBreak = t.lastIndexOf("***");
  if (lastBreak > 0 && t.slice(lastBreak + 3).trim() === "") {
    return `${t.slice(0, lastBreak).trimEnd()} ${sentence}\n***`;
  }
  return `${t} ${sentence}`;
}
