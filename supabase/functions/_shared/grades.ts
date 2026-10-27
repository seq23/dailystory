// The ONE list of grades and ages Time2Read supports, and every per-grade mapping.
// Pure (no imports), so Deno edge functions AND vitest can load it. The client
// re-exports it from src/lib/grades.ts. Every picker, validator and mapping reads
// from here; src/test/guards/grades-single-source.test.ts fails if one does not.
//
// Stored values: "PreK", "K", "1" … "10". "PreK" is kept because existing rows use
// it; normalizeGrade() also accepts "Pre-K", "kindergarten", "1st", "Grade 10", etc.

export const GRADES = ["PreK", "K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] as const;
export type Grade = typeof GRADES[number];

export const MIN_AGE = 3;
export const MAX_AGE = 15;
export const AGES: readonly number[] = Object.freeze(
  Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i),
);

// ── Reading-level vocabularies ────────────────────────────────────────────────
// Two five-word vocabularies name the same five bands, and they share one word:
//   frontend ReadingLevel:   pre-reader  beginner  developing  independent  advanced
//   backend  difficulty:     beginner    easy      medium      hard         expert
// "beginner" is Pre-K/K on the backend but 1st–2nd on the frontend. Never guess which
// one a value is: convert with frontendLevelToDifficulty() (a ReadingLevel from the UI
// or a profile) or backendDifficultyOf() (a value a client already converted). The
// full map, and where each value is stored: docs/reading-levels.md.
// Guard: src/test/guards/reading-level-map.test.ts.

/** Frontend reading levels (the in-app difficulty names), easiest first. */
export const READING_LEVELS = ["pre-reader", "beginner", "developing", "independent", "advanced"] as const;
export type ReadingLevel = typeof READING_LEVELS[number];
/** Backend difficulty names used by the story prompts, easiest first. */
export const BACKEND_DIFFICULTIES = ["beginner", "easy", "medium", "hard", "expert"] as const;
export type BackendDifficulty = typeof BACKEND_DIFFICULTIES[number];
/** Expert sub-levels (middle school / early high school texts). */
export const EXPERT_GRADES = ["6th", "7th", "8th", "9th", "10th"] as const;
export type ExpertGrade = typeof EXPERT_GRADES[number];
/** Narrative-voice age groups used by the voice catalog. */
export type VoiceTier = "preschool" | "early_elementary" | "elementary" | "middle" | "teen";
/** Vocabulary tier: the 0–4 educational vocabulary sets. */
export type VocabularyTier = 0 | 1 | 2 | 3 | 4;

export interface GradeProfile {
  grade: Grade;
  /** Short label for chips and headers: "Pre-K", "K", "1st" … "10th". */
  shortLabel: string;
  /** Long label for pickers: "Pre-K", "Kindergarten", "1st Grade" … "10th Grade". */
  longLabel: string;
  /** Typical age of a child in this grade. */
  typicalAge: number;
  readingLevel: ReadingLevel;
  difficulty: BackendDifficulty;
  /** Expert prompt sub-level, for grades 6–10; null below. */
  expertGrade: ExpertGrade | null;
  vocabularyTier: VocabularyTier;
  /** Story length per page, as told to the writer. */
  wordsPerPage: string;
  /**
   * The fewest words a story page may have (27 Oct 2026): 80% of the low end of
   * wordsPerPage. A shorter answer is rejected and the next model is asked, on every
   * tier; Backup Mode joins template pages until a page reaches it. docs/reading-levels.md.
   */
  minWordsPerPage: number;
  /** Longest sentence the writer should normally use. */
  maxSentenceWords: number;
  sentenceComplexity: string;
  voiceTier: VoiceTier;
  /** Reading-level wording for prompts. */
  promptReadingLevel: string;
}

const P = (p: GradeProfile): GradeProfile => Object.freeze(p);

export const GRADE_PROFILES: Readonly<Record<Grade, GradeProfile>> = Object.freeze({
  PreK: P({ grade: "PreK", shortLabel: "Pre-K", longLabel: "Pre-K", typicalAge: 4,
    readingLevel: "pre-reader", difficulty: "beginner", expertGrade: null, vocabularyTier: 0,
    wordsPerPage: "5-15 words per page", minWordsPerPage: 4, maxSentenceWords: 6,
    sentenceComplexity: "one very short sentence per page, read aloud by a grown-up",
    voiceTier: "preschool", promptReadingLevel: "Pre-K (about age 4): a read-aloud picture-book level" }),
  K: P({ grade: "K", shortLabel: "K", longLabel: "Kindergarten", typicalAge: 5,
    readingLevel: "pre-reader", difficulty: "beginner", expertGrade: null, vocabularyTier: 0,
    wordsPerPage: "10-20 words per page", minWordsPerPage: 8, maxSentenceWords: 8,
    sentenceComplexity: "one or two short sentences per page with sight words",
    voiceTier: "early_elementary", promptReadingLevel: "Kindergarten (about age 5): an emergent-reader level" }),
  "1": P({ grade: "1", shortLabel: "1st", longLabel: "1st Grade", typicalAge: 6,
    readingLevel: "beginner", difficulty: "easy", expertGrade: null, vocabularyTier: 1,
    wordsPerPage: "20-40 words per page", minWordsPerPage: 16, maxSentenceWords: 10,
    sentenceComplexity: "two or three simple sentences per page",
    voiceTier: "early_elementary", promptReadingLevel: "1st grade (about age 6): an early-reader level" }),
  "2": P({ grade: "2", shortLabel: "2nd", longLabel: "2nd Grade", typicalAge: 7,
    readingLevel: "beginner", difficulty: "easy", expertGrade: null, vocabularyTier: 1,
    wordsPerPage: "30-50 words per page", minWordsPerPage: 24, maxSentenceWords: 12,
    sentenceComplexity: "simple and compound sentences joined with and, but, so",
    voiceTier: "early_elementary", promptReadingLevel: "2nd grade (about age 7): an early-reader level" }),
  "3": P({ grade: "3", shortLabel: "3rd", longLabel: "3rd Grade", typicalAge: 8,
    readingLevel: "developing", difficulty: "medium", expertGrade: null, vocabularyTier: 2,
    wordsPerPage: "40-70 words per page", minWordsPerPage: 32, maxSentenceWords: 15,
    sentenceComplexity: "four or five sentences per page, simple and compound",
    voiceTier: "elementary", promptReadingLevel: "3rd grade (about age 8): a developing-reader level" }),
  "4": P({ grade: "4", shortLabel: "4th", longLabel: "4th Grade", typicalAge: 9,
    readingLevel: "developing", difficulty: "medium", expertGrade: null, vocabularyTier: 2,
    wordsPerPage: "50-90 words per page", minWordsPerPage: 40, maxSentenceWords: 15,
    sentenceComplexity: "varied sentences with some descriptive clauses",
    voiceTier: "elementary", promptReadingLevel: "4th grade (about age 9): a developing-reader level" }),
  "5": P({ grade: "5", shortLabel: "5th", longLabel: "5th Grade", typicalAge: 10,
    readingLevel: "independent", difficulty: "hard", expertGrade: null, vocabularyTier: 3,
    wordsPerPage: "80-150 words per page", minWordsPerPage: 64, maxSentenceWords: 20,
    sentenceComplexity: "complex sentences with dependent clauses",
    voiceTier: "elementary", promptReadingLevel: "5th grade (about age 10): an independent-reader level" }),
  "6": P({ grade: "6", shortLabel: "6th", longLabel: "6th Grade", typicalAge: 11,
    readingLevel: "advanced", difficulty: "expert", expertGrade: "6th", vocabularyTier: 4,
    wordsPerPage: "200-400 words per page", minWordsPerPage: 160, maxSentenceWords: 25,
    sentenceComplexity: "foundational complex sentences and literary vocabulary",
    voiceTier: "middle", promptReadingLevel: "6th grade (about age 11): a middle-school reading level" }),
  "7": P({ grade: "7", shortLabel: "7th", longLabel: "7th Grade", typicalAge: 12,
    readingLevel: "advanced", difficulty: "expert", expertGrade: "7th", vocabularyTier: 4,
    wordsPerPage: "200-400 words per page", minWordsPerPage: 160, maxSentenceWords: 28,
    sentenceComplexity: "increasingly sophisticated sentences and varied literary techniques",
    voiceTier: "middle", promptReadingLevel: "7th grade (about age 12): a middle-school reading level" }),
  "8": P({ grade: "8", shortLabel: "8th", longLabel: "8th Grade", typicalAge: 13,
    readingLevel: "advanced", difficulty: "expert", expertGrade: "8th", vocabularyTier: 4,
    wordsPerPage: "200-400 words per page", minWordsPerPage: 160, maxSentenceWords: 30,
    sentenceComplexity: "layered sentences, subtext and figurative language",
    voiceTier: "teen", promptReadingLevel: "8th grade (about age 13): an upper middle-school reading level" }),
  "9": P({ grade: "9", shortLabel: "9th", longLabel: "9th Grade", typicalAge: 14,
    readingLevel: "advanced", difficulty: "expert", expertGrade: "9th", vocabularyTier: 4,
    wordsPerPage: "200-400 words per page", minWordsPerPage: 160, maxSentenceWords: 32,
    sentenceComplexity: "mature literary prose with multiple perspectives and themes",
    voiceTier: "teen", promptReadingLevel: "9th grade (about age 14): an early high-school reading level" }),
  "10": P({ grade: "10", shortLabel: "10th", longLabel: "10th Grade", typicalAge: 15,
    readingLevel: "advanced", difficulty: "expert", expertGrade: "10th", vocabularyTier: 4,
    wordsPerPage: "200-400 words per page", minWordsPerPage: 160, maxSentenceWords: 35,
    sentenceComplexity: "intricate sentence construction and elevated literary language",
    voiceTier: "teen", promptReadingLevel: "10th grade (about age 15): a high-school reading level" }),
});

const ORDINAL_WORDS: Record<string, number> = {
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5,
  sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10,
};

/**
 * Any grade spelling → the stored value, or null when it is not a supported grade.
 * Accepts "PreK", "Pre-K", "pre k", "preschool", "K", "kindergarten", "1", "1st",
 * "first", "Grade 10", "10th grade", "grade10".
 */
export function normalizeGrade(input: unknown): Grade | null {
  if (input === null || input === undefined) return null;
  if (typeof input === "number") {
    return Number.isInteger(input) && input >= 1 && input <= 10 ? (String(input) as Grade) : null;
  }
  if (typeof input !== "string") return null;
  const s = input.toLowerCase().replace(/[\s_\-.]+/g, "").trim();
  if (!s) return null;
  if (s === "prek" || s === "pk" || s === "preschool" || s === "prekindergarten") return "PreK";
  if (s === "k" || s === "kg" || s === "kinder" || s === "kindergarten") return "K";
  const words = s.replace(/^grade/, "").replace(/grade$/, "");
  if (ORDINAL_WORDS[words]) return String(ORDINAL_WORDS[words]) as Grade;
  const m = words.match(/^(\d{1,2})(st|nd|rd|th)?$/);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 1 && n <= 10 ? (String(n) as Grade) : null;
}

export function isValidGrade(input: unknown): boolean {
  return normalizeGrade(input) !== null;
}

export function isValidAge(input: unknown): boolean {
  const n = typeof input === "string" && input.trim() !== "" ? Number(input) : input;
  return typeof n === "number" && Number.isInteger(n) && n >= MIN_AGE && n <= MAX_AGE;
}

/** Bring any age into the supported range (for display and generation, never for storage). */
export function clampAge(age: unknown, fallback = 7): number {
  const n = typeof age === "string" ? Number(age) : age;
  if (typeof n !== "number" || !Number.isFinite(n)) return fallback;
  return Math.min(MAX_AGE, Math.max(MIN_AGE, Math.round(n)));
}

export function gradeProfile(grade: unknown): GradeProfile | null {
  const g = normalizeGrade(grade);
  return g ? GRADE_PROFILES[g] : null;
}

/** "long" for pickers ("Kindergarten", "10th Grade"); "short" for chips ("K", "10th"). */
/** The fewest words one story page may have for this grade (null for an unknown grade). */
export function minWordsPerPageForGrade(grade: unknown): number | null {
  return gradeProfile(grade)?.minWordsPerPage ?? null;
}

export function gradeLabel(grade: unknown, style: "long" | "short" = "long"): string {
  const p = gradeProfile(grade);
  if (!p) return typeof grade === "string" ? grade : "";
  return style === "short" ? p.shortLabel : p.longLabel;
}

export function typicalAgeForGrade(grade: unknown): number | null {
  return gradeProfile(grade)?.typicalAge ?? null;
}

/** Age → the grade a child of that age is usually in (3 and 4 → Pre-K, 15 → 10th). */
export function typicalGradeForAge(age: unknown): Grade {
  const a = clampAge(age);
  if (a <= 4) return "PreK";
  if (a === 5) return "K";
  return String(a - 5) as Grade;
}

export function readingLevelForGrade(grade: unknown): ReadingLevel | null {
  return gradeProfile(grade)?.readingLevel ?? null;
}

export function readingLevelForAge(age: unknown): ReadingLevel {
  return GRADE_PROFILES[typicalGradeForAge(age)].readingLevel;
}

export function difficultyForGrade(grade: unknown): BackendDifficulty | null {
  return gradeProfile(grade)?.difficulty ?? null;
}

export function difficultyForAge(age: unknown): BackendDifficulty {
  return GRADE_PROFILES[typicalGradeForAge(age)].difficulty;
}

/** Grades 6–10 → their expert sub-level ("6th" … "10th"); null below 6th. */
export function expertGradeForGrade(grade: unknown): ExpertGrade | null {
  return gradeProfile(grade)?.expertGrade ?? null;
}

/** "7th", "grade7", 7 → "7th"; anything outside 6th–10th → null. */
export function normalizeExpertGrade(input: unknown): ExpertGrade | null {
  if (typeof input === "string" && (EXPERT_GRADES as readonly string[]).includes(input)) {
    return input as ExpertGrade;
  }
  return expertGradeForGrade(input);
}

export function isExpertGrade(input: unknown): input is ExpertGrade {
  return typeof input === "string" && (EXPERT_GRADES as readonly string[]).includes(input);
}

export function vocabularyTierForGrade(grade: unknown): VocabularyTier | null {
  return gradeProfile(grade)?.vocabularyTier ?? null;
}

/** Voice-catalog age group for an age (13–15 are "teen", not clamped to middle). */
export function voiceTierForAge(age: unknown): VoiceTier {
  return GRADE_PROFILES[typicalGradeForAge(age)].voiceTier;
}

export function promptReadingLevelForGrade(grade: unknown): string | null {
  return gradeProfile(grade)?.promptReadingLevel ?? null;
}

/** Plain-language range for copy: "Pre-K to 10th grade, ages 3 to 15". */
export const GRADE_RANGE_TEXT = `${GRADE_PROFILES.PreK.shortLabel} to ${GRADE_PROFILES["10"].shortLabel} grade`;
export const AGE_RANGE_TEXT = `ages ${MIN_AGE} to ${MAX_AGE}`;

/**
 * Server-side check of a child's age and grade fields, as every edge-function
 * schema runs it. Missing or empty fields are allowed (older clients omit them);
 * a present value must be a supported grade / an age from MIN_AGE to MAX_AGE.
 */
export function childFieldErrors(info: { age?: unknown; grade?: unknown; gradeLevel?: unknown } | null | undefined): string[] {
  const errors: string[] = [];
  if (!info || typeof info !== "object") return errors;
  const present = (v: unknown) => v !== undefined && v !== null && v !== "";
  if (present(info.age) && !isValidAge(info.age)) {
    errors.push(`age must be a whole number from ${MIN_AGE} to ${MAX_AGE}`);
  }
  for (const key of ["grade", "gradeLevel"] as const) {
    if (present(info[key]) && !isValidGrade(info[key])) {
      errors.push(`${key} must be one of ${GRADES.join(", ")}`);
    }
  }
  return errors;
}

// ── Reading level ↔ backend difficulty ────────────────────────────────────────

export function isReadingLevel(v: unknown): v is ReadingLevel {
  return typeof v === "string" && (READING_LEVELS as readonly string[]).includes(v);
}

export function isBackendDifficulty(v: unknown): v is BackendDifficulty {
  return typeof v === "string" && (BACKEND_DIFFICULTIES as readonly string[]).includes(v);
}

/** Reading level → backend difficulty, read off GRADE_PROFILES (same band, same index). */
export const DIFFICULTY_FOR_READING_LEVEL: Readonly<Record<ReadingLevel, BackendDifficulty>> = Object.freeze(
  Object.fromEntries(READING_LEVELS.map((l) => [l, GRADES.map((g) => GRADE_PROFILES[g]).find((p) => p.readingLevel === l)!.difficulty])) as Record<ReadingLevel, BackendDifficulty>,
);
export const READING_LEVEL_FOR_DIFFICULTY: Readonly<Record<BackendDifficulty, ReadingLevel>> = Object.freeze(
  Object.fromEntries(READING_LEVELS.map((l) => [DIFFICULTY_FOR_READING_LEVEL[l], l])) as Record<BackendDifficulty, ReadingLevel>,
);

/**
 * A value from the UI or a profile row (a frontend ReadingLevel) → backend difficulty.
 * "beginner" here is the frontend Beginner (1st–2nd) → "easy". A value that is only a
 * backend name ("easy", "expert") passes through. Anything else → null.
 */
export function frontendLevelToDifficulty(v: unknown): BackendDifficulty | null {
  const s = typeof v === "string" ? v.trim().toLowerCase() : v;
  if (isReadingLevel(s)) return DIFFICULTY_FOR_READING_LEVEL[s];
  if (isBackendDifficulty(s)) return s;
  return null;
}

/**
 * A value a client already converted (an edge-function config.difficulty, a stored
 * guardrail) → backend difficulty. "beginner" here stays "beginner" (Pre-K/K). A value
 * that is only a frontend name ("pre-reader", "advanced") is converted. Else null.
 */
export function backendDifficultyOf(v: unknown): BackendDifficulty | null {
  const s = typeof v === "string" ? v.trim().toLowerCase() : v;
  if (isBackendDifficulty(s)) return s;
  if (isReadingLevel(s)) return DIFFICULTY_FOR_READING_LEVEL[s];
  return null;
}

export function readingLevelForDifficulty(v: unknown): ReadingLevel | null {
  const d = backendDifficultyOf(v);
  return d ? READING_LEVEL_FOR_DIFFICULTY[d] : null;
}

/** The easiest grade written at this backend difficulty ("medium" → "3"). */
export function lowestGradeForDifficulty(d: BackendDifficulty): Grade {
  return GRADES.find((g) => GRADE_PROFILES[g].difficulty === d)!;
}

/**
 * A parent's "Minimum level" guardrail (stored as a backend difficulty plus an
 * expert sub-level) → the lowest grade a story may be written at.
 */
export function minimumGradeForGuardrail(minDifficulty: unknown, minExpertGrade?: unknown, minReadingGrade?: unknown): Grade {
  // "Never easier than: ___ grade" (26 Oct 2026) stores the grade itself; older rows only the difficulty.
  const g = normalizeGrade(minReadingGrade);
  if (g) return g;
  const d = backendDifficultyOf(minDifficulty) ?? "beginner";
  if (d === "expert") {
    const eg = normalizeExpertGrade(minExpertGrade) ?? "6th";
    return GRADES.find((g) => GRADE_PROFILES[g].expertGrade === eg)!;
  }
  return lowestGradeForDifficulty(d);
}

// ── End-of-story quiz bands (owner-approved quiz plan, 26 Oct 2026) ─────────────
// Band by the child's Reads-at grade; topics by real age. Shown in
// docs/reading-levels.md ("Quiz bands"); src/test/guards/reading-level-map.test.ts
// fails if the doc and this table differ.

export const QUIZ_SKILLS = [
  "phonics", "sight-words", "spelling", "word-meaning",
  "what-happened", "between-the-lines", "big-picture", "sentence-sense",
] as const;
export type QuizSkill = typeof QUIZ_SKILLS[number];

export const QUIZ_SKILL_LABELS: Readonly<Record<QuizSkill, string>> = Object.freeze({
  phonics: "Sounds & phonics",
  "sight-words": "Sight words",
  spelling: "Spelling",
  "word-meaning": "Word meaning",
  "what-happened": "What happened",
  "between-the-lines": "Reading between the lines",
  "big-picture": "Big picture",
  "sentence-sense": "Sentence sense",
});

export interface QuizBand {
  id: string;
  label: string;
  grades: readonly Grade[];
  /** Questions per quiz. */
  questions: number;
  /** Answer choices: the band's first grade gets min, the rest max. */
  choices: { min: number; max: number };
  /** Pre-K–K answers carry a picture. */
  pictures: boolean;
  /** "always": every question is read aloud; "tap": a Tap to hear button. */
  readAloud: "always" | "tap";
  /** Fixed questions per skill (they add up to `questions`). */
  slots: Readonly<Partial<Record<QuizSkill, number>>>;
  /** Skills that rotate in, one at a time, taking a slot. */
  sometimes: readonly QuizSkill[];
}

const B = (b: QuizBand): QuizBand => Object.freeze(b);

export const QUIZ_BANDS: readonly QuizBand[] = Object.freeze([
  B({ id: "prek-k", label: "Pre-K–K", grades: ["PreK", "K"], questions: 3, choices: { min: 2, max: 2 }, pictures: true, readAloud: "always",
    slots: { phonics: 1, "sight-words": 1, "what-happened": 1 }, sometimes: ["between-the-lines"] }),
  B({ id: "1st", label: "1st", grades: ["1"], questions: 4, choices: { min: 3, max: 3 }, pictures: false, readAloud: "always",
    slots: { phonics: 1, "sight-words": 1, "word-meaning": 1, "what-happened": 1 }, sometimes: ["spelling", "between-the-lines"] }),
  B({ id: "2nd-3rd", label: "2nd–3rd", grades: ["2", "3"], questions: 5, choices: { min: 3, max: 4 }, pictures: false, readAloud: "tap",
    slots: { spelling: 1, "word-meaning": 1, "what-happened": 1, "between-the-lines": 1, "big-picture": 1 }, sometimes: ["phonics", "sight-words", "sentence-sense"] }),
  B({ id: "4th-5th", label: "4th–5th", grades: ["4", "5"], questions: 6, choices: { min: 4, max: 4 }, pictures: false, readAloud: "tap",
    slots: { spelling: 1, "word-meaning": 2, "what-happened": 1, "between-the-lines": 1, "big-picture": 1 }, sometimes: ["sentence-sense"] }),
  B({ id: "6th-8th", label: "6th–8th", grades: ["6", "7", "8"], questions: 7, choices: { min: 4, max: 4 }, pictures: false, readAloud: "tap",
    slots: { spelling: 1, "word-meaning": 2, "what-happened": 1, "between-the-lines": 1, "big-picture": 1, "sentence-sense": 1 }, sometimes: [] }),
  B({ id: "9th-10th", label: "9th–10th", grades: ["9", "10"], questions: 8, choices: { min: 4, max: 4 }, pictures: false, readAloud: "tap",
    slots: { spelling: 1, "word-meaning": 2, "between-the-lines": 2, "big-picture": 2, "sentence-sense": 1 }, sometimes: [] }),
]);

export function quizBandForGrade(grade: unknown): QuizBand {
  const g = normalizeGrade(grade) ?? "2";
  return QUIZ_BANDS.find((b) => b.grades.includes(g))!;
}

export function quizChoicesForGrade(grade: unknown): number {
  const g = normalizeGrade(grade) ?? "2";
  const band = quizBandForGrade(g);
  return band.grades[0] === g ? band.choices.min : band.choices.max;
}

/**
 * The skill of each question, in order. A "sometimes" skill rotates in (about half of
 * quizzes, chosen by `seed` so the same story gives the same quiz) and takes the slot
 * of the skill with the most slots (never the only What happened).
 */
export function quizSkillPlan(grade: unknown, seed = 0): QuizSkill[] {
  const band = quizBandForGrade(grade);
  const counts = new Map<QuizSkill, number>(QUIZ_SKILLS.filter((s) => band.slots[s]).map((s) => [s, band.slots[s]!]));
  const r = Math.abs(Math.floor(seed)) % (band.sometimes.length * 2 || 1);
  if (band.sometimes.length && r < band.sometimes.length) {
    const incoming = band.sometimes[r];
    const donors = [...counts.entries()]
      .filter(([s, n]) => s !== incoming && n > 0)
      .sort((a, b) => b[1] - a[1] || QUIZ_SKILLS.indexOf(b[0]) - QUIZ_SKILLS.indexOf(a[0]));
    const donor = donors.find(([s]) => s !== "what-happened") ?? donors[0];
    if (donor) {
      counts.set(donor[0], donor[1] - 1);
      counts.set(incoming, (counts.get(incoming) ?? 0) + 1);
    }
  }
  return QUIZ_SKILLS.flatMap((s) => Array.from({ length: counts.get(s) ?? 0 }, () => s));
}

/**
 * The prompt line that splits WORDS from THEMES (owner, 26 Oct 2026): word difficulty
 * comes from Reads at; topics, themes and situations come from the child's real age and
 * school grade. A 5-year-old reading at 10th grade gets 10th-grade words, kid-safe themes.
 */
export function storyAudienceLine(info: { age?: unknown; readsAt?: unknown; schoolGrade?: unknown }): string {
  const readsAt = normalizeGrade(info.readsAt) ?? normalizeGrade(info.schoolGrade) ?? typicalGradeForAge(info.age ?? 7);
  const school = normalizeGrade(info.schoolGrade);
  const ageNum = typeof info.age === "number" ? info.age : Number(info.age);
  const age = Number.isFinite(ageNum) && ageNum > 0 ? clampAge(ageNum) : GRADE_PROFILES[school ?? readsAt].typicalAge;
  const words = `WORDS: write the sentences and vocabulary at ${GRADE_PROFILES[readsAt].promptReadingLevel}.`;
  const themes = `THEMES: the reader is ${age} years old${school ? ` (${GRADE_PROFILES[school].longLabel} at school)` : ""}; every topic, theme, situation and feeling must be right for a ${age}-year-old, even when the words are harder.`;
  return `${words} ${themes}`;
}

/** A "Never easier than" grade → the stored guardrail fields (the grade, plus the older fields kept in step). */
export function guardrailForGrade(grade: unknown): { minReadingGrade: Grade; minDifficulty: BackendDifficulty; minExpertGrade: ExpertGrade } {
  const g = normalizeGrade(grade) ?? "PreK";
  return { minReadingGrade: g, minDifficulty: GRADE_PROFILES[g].difficulty, minExpertGrade: GRADE_PROFILES[g].expertGrade ?? "6th" };
}

/**
 * The THEMES half of storyAudienceLine, lifted from the user prompt into the SYSTEM
 * prompt. The 6th–10th system prompts ask for "mature themes"; a younger child who reads
 * at that level (a 5-year-old at 10th grade) must still get themes for their real age,
 * and a system prompt outranks the user prompt. Empty when the prompt has no THEMES line.
 * Called by generate-adaptive-story/streamlined-handler.ts. Guard: src/test/guards/reads-at.test.ts.
 */
export function audienceThemesForSystemPrompt(storyContent: unknown): string {
  if (typeof storyContent !== "string") return "";
  const m = storyContent.match(/THEMES: the reader is [^\n]*/);
  if (!m) return "";
  return `\n\nAUDIENCE (this overrides any theme guidance above): the reading level sets only the words and sentences. ${m[0]} When the reader is younger than the reading level, never use mature, frightening, romantic or violent themes, whatever the level above says.`;
}
