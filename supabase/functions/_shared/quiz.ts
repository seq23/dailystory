// End-of-story quiz rules (26 Oct 2026, owner: "the quizzes that are available at the
// end of the stories, those need to be good").
//
// Pure (imports only ./grades.ts), so the generate-quiz edge function AND the client
// (src/lib/quiz.ts re-exports it) run the same rules:
//   - every question is about THIS story: an AI question must quote the sentence that
//     proves its answer, and the quote must be in the story, or it is dropped;
//   - exactly one right answer: 2–4 distinct options, no "all/none of the above";
//   - options are shuffled, so the right answer is not always first;
//   - wording and length follow the child's grade (GRADE_PROFILES);
//   - when the AI is down or answers badly, buildFallbackQuiz() writes a quiz from the
//     story text itself, so a child never gets an empty or broken quiz.
// Map of levels: docs/reading-levels.md. Guard: src/test/guards/story-quiz.test.ts.
import { GRADE_PROFILES, normalizeGrade, typicalGradeForAge, type Grade } from "./grades.ts";

export type QuizQuestionType = "multiple-choice" | "true-false" | "character-emotion";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  /** Index into options of the one right answer. */
  correctAnswer: number;
  /** Shown to the child after they answer. */
  explanation: string;
  type: QuizQuestionType;
  /** The story sentence that proves the answer. */
  evidence?: string;
}

export type QuizSource = "ai" | "fallback" | "mixed";

export interface QuizShape {
  grade: Grade;
  count: number;
  optionCount: number;
  maxQuestionWords: number;
}

/** How many questions, how many options, how long a question may be, per grade. */
export function quizShapeForGrade(grade: unknown, age?: unknown): QuizShape {
  const g = normalizeGrade(grade) ?? typicalGradeForAge(age ?? 7);
  const p = GRADE_PROFILES[g];
  const young = p.difficulty === "beginner";
  const early = p.difficulty === "easy";
  return {
    grade: g,
    count: young || early ? 3 : p.difficulty === "medium" ? 4 : 5,
    optionCount: young ? 3 : 4,
    maxQuestionWords: Math.max(10, p.maxSentenceWords + 4),
  };
}

// ── text helpers ─────────────────────────────────────────────────────────────

const STOP = new Set(("a an and are as at be been but by can could did do does for from had has have he her " +
  "here hers him his how i if in into is it its just like me my no not now of off on once one or our out over " +
  "she so some than that the their them then there these they this those to too up us very was we were what " +
  "when where which while who why will with would you your yes all any each every many much more most other " +
  "said says say went go goes going got get came come saw see looked look made make took take gave give " +
  "knew know thought think felt feel let lets about after again also always back because before being down " +
  "even ever first just last little long never next only own really right still such sure through under until " +
  "upon way well whole yet").split(" "));

export const words = (s: string): string[] => ((s.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? []) as string[]).map((w) => w.replace(/^'+|'+$/g, ""));
const contentWords = (s: string) => words(s).filter((w) => w.length >= 3 && !STOP.has(w));

export function storySentences(story: string): string[] {
  return (story || "")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?]["”’)]?)\s+(?=["“‘(]?[A-Z0-9])/)
    .map((s) => s.trim())
    .filter((s) => words(s).length >= 3);
}

/** A seeded pseudo-random generator, so the same story gives the same quiz. */
function rng(seedText: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seedText.length; i++) h = Math.imul(h ^ seedText.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** Shuffle the options and move the answer index with them. */
export function shuffleQuestion(q: QuizQuestion, seed = q.question): QuizQuestion {
  const r = rng(seed);
  const order = q.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { ...q, options: order.map((i) => q.options[i]), correctAnswer: order.indexOf(q.correctAnswer) };
}

/** Never every answer in the same slot: rotate questions until the slots differ. */
function spreadAnswers(qs: QuizQuestion[]): QuizQuestion[] {
  if (qs.length < 2 || new Set(qs.map((q) => q.correctAnswer)).size > 1) return qs;
  return qs.map((q, i) => {
    const shift = i % q.options.length;
    if (!shift) return q;
    const options = q.options.map((_, k) => q.options[(k + shift) % q.options.length]);
    return { ...q, options, correctAnswer: options.indexOf(q.options[q.correctAnswer]) };
  });
}

// ── checking a model's quiz ──────────────────────────────────────────────────

const BANNED_OPTION = /\b(all|none|both|neither) of (the )?(above|these|them)\b|^both\b|^all of\b/i;
const clean = (s: unknown) => (typeof s === "string" ? s.replace(/\s+/g, " ").trim() : "");

/** True when the quote really is in the story (≥80% of its words, in one sentence or two). */
export function evidenceInStory(evidence: string, story: string): boolean {
  const ev = contentWords(evidence);
  if (ev.length < 2) return false;
  const sentences = storySentences(story);
  const windows = sentences.map((s, i) => new Set(contentWords(s + " " + (sentences[i + 1] ?? ""))));
  return windows.some((set) => ev.filter((w) => set.has(w)).length / ev.length >= 0.8);
}

function resolveAnswer(raw: unknown, options: string[]): number {
  if (typeof raw === "number" && Number.isInteger(raw) && raw >= 0 && raw < options.length) return raw;
  if (typeof raw === "string") {
    const t = raw.trim();
    if (/^[A-D]$/i.test(t)) {
      const i = t.toUpperCase().charCodeAt(0) - 65;
      return i < options.length ? i : -1;
    }
    if (/^\d+$/.test(t)) return resolveAnswer(Number(t), options);
    return options.findIndex((o) => o.toLowerCase() === t.replace(/^[A-D][).:]\s*/i, "").toLowerCase());
  }
  return -1;
}

/**
 * A model's questions → the ones that are safe to show: about this story, one right
 * answer, distinct options, wording within the grade's length, options shuffled.
 */
export function normalizeQuizQuestions(raw: unknown, story: string, shape: QuizShape): QuizQuestion[] {
  // deno-lint-ignore no-explicit-any
  const list: any[] = Array.isArray(raw) ? raw : Array.isArray((raw as any)?.questions) ? (raw as any).questions : [];
  const out: QuizQuestion[] = [];
  const seen = new Set<string>();
  for (const q of list) {
    const question = clean(q?.question);
    if (!question || words(question).length > shape.maxQuestionWords + 6 || seen.has(question.toLowerCase())) continue;
    const options: string[] = (Array.isArray(q?.options) ? q.options : []).map((o: unknown) => clean(o).replace(/^[A-D][).:]\s+/, ""));
    if (options.length < 2 || options.length > 4 || options.some((o) => !o || o.length > 160 || BANNED_OPTION.test(o))) continue;
    if (new Set(options.map((o) => o.toLowerCase())).size !== options.length) continue;
    const correct = resolveAnswer(q?.correctAnswer ?? q?.answer, options);
    if (correct < 0) continue;
    const evidence = clean(q?.evidence);
    // About THIS story: the proving quote is in the text; with no quote, the question
    // and its answer must share words with the story.
    if (evidence) {
      if (!evidenceInStory(evidence, story)) continue;
    } else {
      const storyWords = new Set(contentWords(story));
      if (contentWords(question + " " + options[correct]).filter((w) => storyWords.has(w)).length < 2) continue;
    }
    const type: QuizQuestionType = ["multiple-choice", "true-false", "character-emotion"].includes(q?.type) ? q.type : "multiple-choice";
    const explanation = clean(q?.explanation) || (evidence ? `The story says: "${evidence}"` : `The answer is "${options[correct]}".`);
    seen.add(question.toLowerCase());
    out.push(shuffleQuestion({ id: `q${out.length + 1}`, question, options, correctAnswer: correct, explanation, type, ...(evidence ? { evidence } : {}) }));
  }
  return spreadAnswers(out.slice(0, shape.count));
}

// ── a quiz from the story text alone ─────────────────────────────────────────

const NAME_BANK = ["Maya", "Leo", "Zara", "Omar", "Ivy", "Theo", "Nia", "Sam", "Ruby", "Kai", "Lena", "Max"];
const WORD_BANK = ["apple", "rocket", "pillow", "turtle", "garden", "button", "candle", "ladder", "pencil", "bridge",
  "jacket", "basket", "violin", "carrot", "planet", "window", "bucket", "feather", "kitten", "puddle", "castle",
  "orange", "blanket", "dragon", "river", "cloud", "forest", "ocean", "school", "bicycle", "mitten", "lantern",
  "giggled", "jumped", "whispered", "painted", "climbed", "sneezed", "danced", "shiny", "sleepy", "purple", "tiny",
  "brave", "gentle", "noisy", "secret", "golden", "silver", "muddy", "storm", "moon", "seed", "boat", "map"];

function namesIn(story: string): string[] {
  const counts = new Map<string, number>();
  for (const s of storySentences(story)) {
    const toks: string[] = s.match(/[\p{L}']+/gu) ?? [];
    toks.forEach((t, i) => {
      if (i === 0 || !/^\p{Lu}\p{Ll}+$/u.test(t) || STOP.has(t.toLowerCase())) return;
      counts.set(t, (counts.get(t) ?? 0) + 1);
    });
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([n]) => n);
}

const hasWord = (story: string, w: string) => new RegExp(`(?<![\\p{L}])${w}(?![\\p{L}])`, "iu").test(story);
const shorten = (s: string, max: number) => {
  const w = s.split(/\s+/);
  return w.length <= max ? s : w.slice(0, max).join(" ") + "…";
};

/**
 * A quiz written from the story itself, for when the AI is down or its answer was
 * unusable. Every right answer is in the story and every wrong one is not, so there is
 * exactly one right answer.
 */
export function buildFallbackQuiz(story: string, shape: QuizShape): QuizQuestion[] {
  const sentences = storySentences(story);
  const pick = rng(story.slice(0, 400));
  const qs: QuizQuestion[] = [];
  const maxQuote = shape.maxQuestionWords + 6;
  const n = shape.optionCount;

  // 1. Who is in the story (wrong names do not appear anywhere in it).
  const names = namesIn(story);
  if (names.length) {
    const wrong = NAME_BANK.filter((x) => !hasWord(story, x)).slice(0, n - 1);
    if (wrong.length === n - 1) {
      const evidence = sentences.find((s) => hasWord(s, names[0])) ?? "";
      qs.push({ id: "", question: "Who is in this story?", options: [names[0], ...wrong], correctAnswer: 0,
        explanation: `Yes! ${names[0]} is in the story.`, type: "multiple-choice", evidence });
    }
  }

  // 2. Missing-word questions from real sentences.
  const usable = sentences.filter((s) => words(s).length >= 4 && words(s).length <= maxQuote);
  const order = usable.map((_, i) => i).sort(() => pick() - 0.5);
  const usedWords = new Set<string>();
  for (const i of order) {
    if (qs.length >= shape.count - (sentences.length >= 4 ? 1 : 0)) break;
    const s = usable[i];
    const candidates = ((s.match(/[\p{L}]+/gu) ?? []) as string[]).filter((w) =>
      w.length >= 4 && !STOP.has(w.toLowerCase()) && !names.includes(w) && !usedWords.has(w.toLowerCase()) &&
      (s.match(new RegExp(`(?<![\\p{L}])${w}(?![\\p{L}])`, "gu")) ?? []).length === 1);
    if (!candidates.length) continue;
    const answer = candidates.sort((a, b) => b.length - a.length)[Math.floor(pick() * Math.min(2, candidates.length))];
    const wrong = WORD_BANK.filter((x) => !hasWord(story, x) && x !== answer.toLowerCase())
      .sort((a, b) => Math.abs(a.length - answer.length) - Math.abs(b.length - answer.length) || (pick() - 0.5))
      .slice(0, n - 1);
    if (wrong.length < n - 1) continue;
    usedWords.add(answer.toLowerCase());
    const blanked = s.replace(new RegExp(`(?<![\\p{L}])${answer}(?![\\p{L}])`, "u"), "____");
    const lower = answer === answer.toLowerCase();
    qs.push({ id: "", question: `Which word is missing? "${blanked}"`, options: [lower ? answer : answer.toLowerCase(), ...wrong],
      correctAnswer: 0, explanation: `The story says: "${s}"`, type: "multiple-choice", evidence: s });
  }

  // 3. What happened first (two real sentences, far apart).
  if (sentences.length >= 4 && qs.length < shape.count) {
    const early = sentences[Math.floor(sentences.length * 0.15)];
    const late = sentences[Math.floor(sentences.length * 0.8)];
    if (early !== late) {
      const a = shorten(early, 14), b = shorten(late, 14);
      qs.push({ id: "", question: "Which happened first in the story?", options: [a, b], correctAnswer: 0,
        explanation: `First: "${a}" Later: "${b}"`, type: "true-false", evidence: early });
    }
  }

  return spreadAnswers(qs.slice(0, shape.count).map((q, i) => shuffleQuestion({ ...q, id: `q${i + 1}` }, `${q.question}|${i}`)));
}

/** The model's questions, topped up from the story text when there are too few. */
export function finalizeQuiz(raw: unknown, story: string, shape: QuizShape): { questions: QuizQuestion[]; source: QuizSource } {
  const ai = raw ? normalizeQuizQuestions(raw, story, shape) : [];
  const minimum = Math.min(3, shape.count);
  if (ai.length >= minimum) return { questions: ai, source: "ai" };
  const fallback = buildFallbackQuiz(story, shape);
  const merged = [...ai, ...fallback.filter((f) => !ai.some((q) => q.question === f.question))]
    .slice(0, shape.count)
    .map((q, i) => ({ ...q, id: `q${i + 1}` }));
  return { questions: spreadAnswers(merged), source: ai.length ? "mixed" : "fallback" };
}

// ── the prompt ───────────────────────────────────────────────────────────────

export function buildQuizMessages(story: string, shape: QuizShape): Array<{ role: "system" | "user"; content: string }> {
  const p = GRADE_PROFILES[shape.grade];
  const system = `You write reading-comprehension quizzes for children, in English.
The reader is in ${p.promptReadingLevel}. Write every question and answer at that level: at most ${shape.maxQuestionWords} words per question, words a child in ${p.longLabel} knows.

Write exactly ${shape.count} questions about THIS story only: its characters, what happened, where, why, and how someone felt. Never ask about anything the story does not say.
Rules for every question:
- ${shape.optionCount} answer options, short, all different.
- Exactly ONE option is right according to the story. The wrong options must be believable but clearly wrong if you read the story.
- Never use "all of the above", "none of the above" or "both".
- "evidence": copy, word for word, the sentence from the story that proves the right answer.
- "explanation": one short, warm sentence to the child about why that answer is right.
Mix the kinds: who, what happened, where, why, feelings, what came first.

Answer with JSON only, no other text:
{"questions":[{"question":"...","options":["...","..."],"correctAnswer":0,"evidence":"...","explanation":"...","type":"multiple-choice"}]}
correctAnswer is the index (0-based) of the right option.`;
  return [
    { role: "system", content: system },
    { role: "user", content: `The story:\n\n${story}` },
  ];
}

/** The quiz JSON out of a chat answer (tolerates code fences and text around it). */
export function parseQuizJson(content: string): unknown {
  if (!content) return null;
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const text = fenced ? fenced[1] : content;
  const start = text.search(/[[{]/);
  if (start < 0) return null;
  const end = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

/** Longest story text sent to the model. */
export const QUIZ_STORY_MAX_CHARS = 6000;
