// End-of-story quiz rules (owner-approved quiz plan, 26 Oct 2026: "the quizzes should
// test literacy, like reading between the lines").
//
// Pure (imports only ./grades.ts and ./wordLists.ts), so the generate-quiz edge
// function AND the app (src/lib/quiz.ts re-exports it) run the same rules:
//   - 8 skills; the band (by the child's Reads-at grade) sets how many questions, which
//     skills, how many answer choices, pictures and read-aloud (QUIZ_BANDS in grades.ts);
//   - every question is about THIS story: a quoted proof must be in the story, or the
//     tested word must be in it;
//   - exactly one right answer, distinct believable choices, no "all of the above";
//   - choices are shuffled, so the right answer is not always in the same spot;
//   - kind, short feedback that shows the story sentence holding the answer;
//   - when the AI is down or answers badly, every skill has a builder that writes its
//     question from the story text itself (word meaning and reading between the lines
//     included), so a child never gets an empty or broken quiz.
// Map of levels and bands: docs/reading-levels.md. Guard: src/test/guards/story-quiz.test.ts.
import {
  GRADE_PROFILES,
  QUIZ_SKILLS,
  QUIZ_SKILL_LABELS,
  normalizeGrade,
  typicalGradeForAge,
  quizBandForGrade,
  quizChoicesForGrade,
  quizSkillPlan,
  type Grade,
  type QuizBand,
  type QuizSkill,
} from "./grades.ts";
import { DOLCH_SERVICE_WORDS } from "./wordLists.ts";

export { QUIZ_SKILLS, QUIZ_SKILL_LABELS, type QuizSkill };

export type QuizQuestionType = "multiple-choice" | "true-false" | "character-emotion";

export interface QuizQuestion {
  id: string;
  /** What the child sees. */
  question: string;
  /** What is read aloud, when it differs from `question` (sight words: the word is heard, not shown). */
  say?: string;
  options: string[];
  /** A picture (emoji) per option, for Pre-K–K; null where none fits. */
  pictures?: Array<string | null>;
  /** Index into options of the one right answer. */
  correctAnswer: number;
  /** Shown to the child after they answer. */
  explanation: string;
  type: QuizQuestionType;
  skill: QuizSkill;
  /** The story sentence that holds the answer. */
  evidence?: string;
}

export type QuizSource = "ai" | "fallback" | "mixed";

export interface QuizShape {
  grade: Grade;
  band: QuizBand;
  /** The skill of each question, in order. */
  plan: QuizSkill[];
  count: number;
  optionCount: number;
  maxQuestionWords: number;
  /** The child's real age: sets the topics and tone, never the difficulty. */
  age: number | null;
  /** The parent's practice words: a word-meaning or spelling question uses one when it is in the story. */
  practiceWords: string[];
}

/** A stable number from the story text, so the same story gives the same quiz. */
export function storySeed(story: string): number {
  let h = 2166136261;
  for (let i = 0; i < Math.min(story.length, 600); i++) h = Math.imul(h ^ story.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** The quiz for a Reads-at grade (band, skills, choices); `age` keeps topics right for the child. */
export function quizShapeForGrade(grade: unknown, age?: unknown, seed = 0, practiceWords: string[] = []): QuizShape {
  const g = normalizeGrade(grade) ?? typicalGradeForAge(age ?? 7);
  const band = quizBandForGrade(g);
  const plan = quizSkillPlan(g, seed);
  const a = typeof age === "number" ? age : typeof age === "string" && age.trim() ? Number(age) : NaN;
  return {
    grade: g,
    band,
    plan,
    count: plan.length,
    optionCount: quizChoicesForGrade(g),
    maxQuestionWords: Math.max(10, GRADE_PROFILES[g].maxSentenceWords + 4),
    age: Number.isFinite(a) ? Math.round(a) : null,
    practiceWords: (Array.isArray(practiceWords) ? practiceWords : []).filter((w) => typeof w === "string" && /^[\p{L}'-]{2,40}$/u.test(w.trim())).map((w) => w.trim().toLowerCase()).slice(0, 10),
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

export const words = (s: string): string[] =>
  ((s.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? []) as string[]).map((w) => w.replace(/^'+|'+$/g, ""));
const contentWords = (s: string) => words(s).filter((w) => w.length >= 3 && !STOP.has(w));
const tokens = (s: string): string[] => (s.match(/[\p{L}']+/gu) ?? []) as string[];
const esc = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wordRe = (w: string, flags = "iu") => new RegExp(`(?<![\\p{L}])${esc(w)}(?![\\p{L}])`, flags);
const hasWord = (text: string, w: string) => wordRe(w).test(text);

export function storySentences(story: string): string[] {
  return (story || "")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?]["”’)]?)\s+(?=["“‘(]?[A-Z0-9])/)
    .map((s) => s.trim())
    .filter((s) => words(s).length >= 3);
}

function rng(seedText: string): () => number {
  let h = storySeed(seedText) || 1;
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** Shuffle the options (and pictures) and move the answer index with them. */
export function shuffleQuestion(q: QuizQuestion, seed = q.question): QuizQuestion {
  const r = rng(seed);
  const order = q.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    ...q,
    options: order.map((i) => q.options[i]),
    ...(q.pictures ? { pictures: order.map((i) => q.pictures![i] ?? null) } : {}),
    correctAnswer: order.indexOf(q.correctAnswer),
  };
}

/** Never every answer in the same slot: rotate questions until the slots differ. */
function spreadAnswers(qs: QuizQuestion[]): QuizQuestion[] {
  if (qs.length < 2 || new Set(qs.map((q) => q.correctAnswer)).size > 1) return qs;
  return qs.map((q, i) => {
    const shift = i % q.options.length;
    if (!shift) return q;
    const idx = q.options.map((_, k) => (k + shift) % q.options.length);
    return {
      ...q,
      options: idx.map((k) => q.options[k]),
      ...(q.pictures ? { pictures: idx.map((k) => q.pictures![k] ?? null) } : {}),
      correctAnswer: idx.indexOf(q.correctAnswer),
    };
  });
}

// ── pictures for Pre-K–K answers ─────────────────────────────────────────────

const EMOJI: Record<string, string> = {
  dog: "🐶", puppy: "🐶", cat: "🐱", kitten: "🐱", kitty: "🐱", bird: "🐦", robin: "🐦", fish: "🐟", frog: "🐸",
  bear: "🐻", rabbit: "🐰", bunny: "🐰", duck: "🦆", cow: "🐮", pig: "🐷", horse: "🐴", sheep: "🐑", mouse: "🐭",
  lion: "🦁", tiger: "🐯", elephant: "🐘", monkey: "🐵", owl: "🦉", bee: "🐝", butterfly: "🦋", turtle: "🐢",
  dragon: "🐉", dinosaur: "🦕", egg: "🥚", apple: "🍎", cake: "🍰", cookie: "🍪", milk: "🥛", bread: "🍞",
  carrot: "🥕", banana: "🍌", ball: "⚽", kite: "🪁", boat: "⛵", car: "🚗", bus: "🚌", train: "🚂", rocket: "🚀",
  tree: "🌳", flower: "🌸", sun: "☀️", moon: "🌙", star: "⭐", rain: "🌧️", snow: "❄️", cloud: "☁️", house: "🏠",
  home: "🏠", school: "🏫", book: "📖", hat: "🎩", shoe: "👟", footprint: "👣", mud: "🟤", box: "📦", key: "🔑",
  happy: "😊", glad: "😊", sad: "😢", scared: "😨", afraid: "😨", surprised: "😮", angry: "😠", sleepy: "😴",
  tired: "😴", excited: "🤩", proud: "😌", ball2: "🏀", baby: "👶", girl: "👧", boy: "👦", mom: "👩", dad: "👨",
};
function pictureFor(option: string): string | null {
  for (const w of words(option).reverse()) {
    if (EMOJI[w]) return EMOJI[w];
    const sing = w.replace(/s$/, "");
    if (EMOJI[sing]) return EMOJI[sing];
  }
  return null;
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

const WORD_SKILLS: ReadonlySet<QuizSkill> = new Set(["phonics", "sight-words", "spelling"]);

/** Is the question about this story? Word skills: the tested word is in it; others: a proof quote or shared words. */
function grounded(skill: QuizSkill, question: string, options: string[], correct: number, evidence: string, story: string): boolean {
  if (evidence) return evidenceInStory(evidence, story);
  if (WORD_SKILLS.has(skill)) {
    const answer = options[correct];
    return hasWord(story, answer) || tokens(question).some((t) => t.length >= 3 && !STOP.has(t.toLowerCase()) && hasWord(story, t));
  }
  const storyWords = new Set(contentWords(story));
  return contentWords(question + " " + options[correct]).filter((w) => storyWords.has(w)).length >= 2;
}

/**
 * A model's questions → the ones that are safe to show: about this story, one right
 * answer, distinct choices (as many as the band asks for), skill tagged, shuffled.
 */
export function normalizeQuizQuestions(raw: unknown, story: string, shape: QuizShape): QuizQuestion[] {
  // deno-lint-ignore no-explicit-any
  const list: any[] = Array.isArray(raw) ? raw : Array.isArray((raw as any)?.questions) ? (raw as any).questions : [];
  const out: QuizQuestion[] = [];
  const seen = new Set<string>();
  for (const q of list) {
    const question = clean(q?.question);
    if (!question || words(question).length > shape.maxQuestionWords + 8 || seen.has(question.toLowerCase())) continue;
    let options: string[] = (Array.isArray(q?.options) ? q.options : []).map((o: unknown) => clean(o).replace(/^[A-D][).:]\s+/, ""));
    if (options.length < 2 || options.some((o) => !o || o.length > 160 || BANNED_OPTION.test(o))) continue;
    if (new Set(options.map((o) => o.toLowerCase())).size !== options.length) continue;
    let correct = resolveAnswer(q?.correctAnswer ?? q?.answer, options);
    if (correct < 0) continue;
    // As many choices as the band asks for: too many → keep the answer and the first wrong ones; too few → drop.
    if (options.length > shape.optionCount) {
      const answer = options[correct];
      options = [answer, ...options.filter((_, i) => i !== correct).slice(0, shape.optionCount - 1)];
      correct = 0;
    } else if (options.length < shape.optionCount) continue;
    const skill: QuizSkill = (QUIZ_SKILLS as readonly string[]).includes(q?.skill) ? q.skill : "what-happened";
    const evidence = clean(q?.evidence);
    if (!grounded(skill, question, options, correct, evidence, story)) continue;
    const type: QuizQuestionType = ["multiple-choice", "true-false", "character-emotion"].includes(q?.type) ? q.type : "multiple-choice";
    const explanation = clean(q?.explanation) || (evidence ? `The story says: "${evidence}"` : `The answer is "${options[correct]}".`);
    seen.add(question.toLowerCase());
    out.push(shuffleQuestion({
      id: `q${out.length + 1}`, question, options, correctAnswer: correct, explanation, type, skill,
      ...(clean(q?.say) ? { say: clean(q.say) } : {}),
      ...(evidence ? { evidence } : {}),
    }));
  }
  return out;
}

// ── questions from the story text alone, one builder per skill ────────────────

const NAME_BANK = ["Maya", "Leo", "Zara", "Omar", "Ivy", "Theo", "Nia", "Sam", "Ruby", "Kai", "Lena", "Max"];
const WORD_BANK = ["apple", "rocket", "pillow", "turtle", "garden", "button", "candle", "ladder", "pencil", "bridge",
  "jacket", "basket", "violin", "carrot", "planet", "window", "bucket", "feather", "kitten", "puddle", "castle",
  "orange", "blanket", "dragon", "river", "cloud", "forest", "ocean", "school", "bicycle", "mitten", "lantern",
  "giggled", "jumped", "whispered", "painted", "climbed", "sneezed", "danced", "shiny", "sleepy", "purple", "tiny",
  "brave", "gentle", "noisy", "secret", "golden", "silver", "muddy", "storm", "moon", "seed", "boat", "map",
  "tiger", "lemon", "wagon", "rabbit", "pocket", "music", "table", "zebra", "honey", "kettle", "violet", "helmet"];

/** Near-synonyms a child knows (word → same meaning, and words that clearly do not mean it). */
const SYNONYMS: Record<string, { same: string; not: string[] }> = {
  big: { same: "large", not: ["tiny", "quiet", "wet"] }, huge: { same: "very big", not: ["very small", "very fast", "very old"] },
  large: { same: "big", not: ["tiny", "soft", "late"] }, tiny: { same: "very small", not: ["very loud", "very big", "very fast"] },
  small: { same: "little", not: ["huge", "loud", "heavy"] }, little: { same: "small", not: ["huge", "angry", "wet"] },
  happy: { same: "glad", not: ["sad", "sleepy", "angry"] }, glad: { same: "happy", not: ["upset", "tired", "cold"] },
  sad: { same: "unhappy", not: ["cheerful", "hungry", "brave"] }, scared: { same: "afraid", not: ["brave", "bored", "proud"] },
  afraid: { same: "scared", not: ["calm", "proud", "silly"] }, fast: { same: "quick", not: ["slow", "quiet", "heavy"] },
  quick: { same: "fast", not: ["slow", "soft", "late"] }, quickly: { same: "fast", not: ["slowly", "quietly", "sadly"] },
  quiet: { same: "silent", not: ["noisy", "bright", "fast"] }, quietly: { same: "softly", not: ["loudly", "quickly", "angrily"] },
  loud: { same: "noisy", not: ["quiet", "tiny", "slow"] }, whispered: { same: "said very softly", not: ["shouted", "sang loudly", "laughed"] },
  shouted: { same: "yelled", not: ["whispered", "smiled", "slept"] }, yelled: { same: "shouted", not: ["whispered", "nodded", "sat"] },
  grabbed: { same: "took quickly", not: ["dropped", "painted", "hid"] }, carefully: { same: "with great care", not: ["in a rush", "angrily", "loudly"] },
  gently: { same: "softly", not: ["roughly", "loudly", "quickly"] }, cold: { same: "chilly", not: ["hot", "loud", "sweet"] },
  hot: { same: "very warm", not: ["freezing", "quiet", "soft"] }, smart: { same: "clever", not: ["silly", "sleepy", "slow"] },
  brave: { same: "not afraid", not: ["scared", "sleepy", "hungry"] }, angry: { same: "mad", not: ["calm", "glad", "sleepy"] },
  tired: { same: "sleepy", not: ["wide awake", "hungry", "loud"] }, begin: { same: "start", not: ["end", "stop", "hide"] },
  started: { same: "began", not: ["finished", "forgot", "lost"] }, ended: { same: "finished", not: ["began", "grew", "flew"] },
  shiny: { same: "bright", not: ["dull", "soft", "loud"] }, special: { same: "unusual and important", not: ["ordinary", "broken", "noisy"] },
  enormous: { same: "very big", not: ["very small", "very quiet", "very slow"] }, giggled: { same: "laughed a little", not: ["cried", "shouted", "slept"] },
  ancient: { same: "very old", not: ["brand new", "very fast", "very loud"] }, curious: { same: "wanting to know", not: ["bored", "sleepy", "angry"] },
  nervous: { same: "worried", not: ["calm", "sleepy", "proud"] }, delighted: { same: "very happy", not: ["upset", "bored", "scared"] },
  exhausted: { same: "very tired", not: ["full of energy", "hungry", "angry"] }, observed: { same: "watched closely", not: ["ignored", "broke", "forgot"] },
  discovered: { same: "found", not: ["lost", "hid", "broke"] }, found: { same: "discovered", not: ["lost", "threw away", "forgot"] },
};

/** Feeling cues in the text → the feeling a reader can infer, and feelings that do not fit. */
const FEELING_CUES: Array<{ re: RegExp; feeling: string; not: string[] }> = [
  { re: /\b(laughed|giggled|grinned|smiled|cheered|clapped|danced|hugged)\b/i, feeling: "happy", not: ["sad", "angry", "scared"] },
  { re: /\b(cried|sobbed|tears|frowned|sighed)\b/i, feeling: "sad", not: ["happy", "excited", "proud"] },
  { re: /\b(trembled|shivered|shook with fear|hid|gasped|whispered)\b/i, feeling: "nervous or scared", not: ["bored", "sleepy", "angry"] },
  { re: /\b(stomped|shouted angrily|scowled|slammed|glared)\b/i, feeling: "angry", not: ["happy", "sleepy", "proud"] },
  { re: /\b(yawned|stretched sleepily|dozed|nodded off)\b/i, feeling: "sleepy", not: ["excited", "angry", "scared"] },
  { re: /\b(couldn't wait|jumped up and down|raced|squealed|excited)\b/i, feeling: "excited", not: ["bored", "sad", "sleepy"] },
  { re: /\b(wow|amazed|stared|blinked|surprised)\b/i, feeling: "surprised", not: ["bored", "angry", "sleepy"] },
  { re: /\b(proud|beamed|stood tall)\b/i, feeling: "proud", not: ["ashamed", "sleepy", "scared"] },
];

const TOPIC_BANK = ["a trip to the moon", "a lost shoe at school", "a cooking contest", "a soccer game in the rain",
  "a pirate ship", "a birthday party on a bus", "a missing library book", "a race between two cars"];

const SPELL_SKIP = new Set(["the", "and"]);

function namesIn(story: string): string[] {
  const counts = new Map<string, number>();
  for (const s of storySentences(story)) {
    tokens(s).forEach((t, i) => {
      if (!/^\p{Lu}\p{Ll}+$/u.test(t) || STOP.has(t.toLowerCase())) return;
      // a capital at the start of a sentence is a name only if the word never appears in lower case
      if (i === 0 && wordRe(t.toLowerCase(), "u").test(story.replace(wordRe(t, "gu"), ""))) return;
      counts.set(t, (counts.get(t) ?? 0) + 1);
    });
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([n]) => n);
}

/** The thing the story keeps coming back to: the noun after a/the/her… that repeats most. */
function mostCommonNoun(story: string, names: string[]): string | null {
  const counts = new Map<string, number>();
  const order: string[] = [];
  for (const m of story.matchAll(/\b(?:the|a|an|her|his|my|their|our|its|this)\s+([a-z]+(?:\s+[a-z]+){0,2})/gi)) {
    const ws = m[1].toLowerCase().split(/\s+/);
    const stop = ws.findIndex((w) => STOP.has(w));
    const head = (stop === -1 ? ws : ws.slice(0, stop)).filter((w) => w.length >= 3).pop();
    if (!head || names.some((n) => n.toLowerCase() === head) || /ly$/.test(head)) continue;
    if (!counts.has(head)) order.push(head);
    counts.set(head, (counts.get(head) ?? 0) + 1);
  }
  if (!order.length) return null;
  return order.reduce((best, w) => ((counts.get(w)! > counts.get(best)!) ? w : best), order[0]);
}

const quote = (s: string) => `“${s}”`;

const shorten = (s: string, max: number) => {
  const w = s.split(/\s+/);
  return w.length <= max ? s : w.slice(0, max).join(" ") + "…";
};

function misspellings(word: string): string[] {
  const w = word.toLowerCase();
  const out = new Set<string>();
  const dbl = w.match(/([bcdfglmnprst])\1/);
  if (dbl) out.add(w.replace(dbl[0], dbl[1]));
  else {
    const m = w.match(/[aeiou]([bdglmnprt])[aeiouy]/);
    if (m && m.index !== undefined) out.add(w.slice(0, m.index + 1) + m[1] + w.slice(m.index + 1));
  }
  if (/ie/.test(w)) out.add(w.replace("ie", "ei"));
  if (/ei/.test(w)) out.add(w.replace("ei", "ie"));
  if (/e$/.test(w) && w.length > 4) out.add(w.slice(0, -1));
  if (/fully$/.test(w)) out.add(w.replace(/fully$/, "fuly"));
  if (/tion$/.test(w)) out.add(w.replace(/tion$/, "shun"));
  if (/ph/.test(w)) out.add(w.replace("ph", "f"));
  if (/ck/.test(w)) out.add(w.replace("ck", "k"));
  const vowels = w.match(/[aeiou]/g) ?? [];
  if (vowels.length >= 2) {
    const i = w.search(/[aeiou](?=[^aeiou]*[aeiou])/);
    if (i > 0) out.add(w.slice(0, i) + w.slice(i + 1));
    const swap: Record<string, string> = { a: "e", e: "i", i: "e", o: "u", u: "o" };
    const j = w.lastIndexOf(vowels[vowels.length - 1]);
    if (j > 0 && j < w.length - 1) out.add(w.slice(0, j) + swap[w[j]] + w.slice(j + 1));
  }
  out.delete(w);
  return [...out].filter((x) => x.length >= 3 && /^[a-z]+$/.test(x));
}

type Builder = (ctx: BuildCtx, variant: number) => Omit<QuizQuestion, "id"> | null;
interface BuildCtx {
  story: string;
  sentences: string[];
  names: string[];
  n: number;
  shape: QuizShape;
  pick: () => number;
  used: Set<string>;
}

const BUILDERS: Record<QuizSkill, Builder> = {
  phonics: ({ story, names, n, used, pick }) => {
    const ws = [...new Set(tokens(story).map((t) => t.toLowerCase()))].filter((w) => w.length >= 3 && /^[bdfghjlmnprstvwz]/.test(w) && !/^(sh|ch|th|wh|ph)/.test(w));
    for (const target of ws.sort(() => pick() - 0.5)) {
      if (used.has(`ph:${target}`)) continue;
      const same = ws.find((w) => w !== target && w[0] === target[0] && !STOP.has(w));
      const others = ws.filter((w) => w[0] !== target[0] && !STOP.has(w)).slice(0, n - 1);
      if (!same || others.length < n - 1) continue;
      used.add(`ph:${target}`);
      const t = names.find((x) => x.toLowerCase() === target) ?? target;
      return { question: `Which word starts with the same sound as "${t}"?`, options: [same, ...others], correctAnswer: 0,
        explanation: `"${t}" and "${same}" both start with the "${target[0]}" sound.`, type: "multiple-choice", skill: "phonics" };
    }
    return null;
  },
  "sight-words": ({ story, sentences, n, used, pick }) => {
    const sight = DOLCH_SERVICE_WORDS.filter((w) => w.length >= 2 && w !== "I" && !/'/.test(w));
    const inStory = sight.filter((w) => hasWord(story, w) && !used.has(`sw:${w}`)).sort(() => pick() - 0.5);
    for (const target of inStory) {
      const wrong = sight.filter((w) => w !== target && Math.abs(w.length - target.length) <= 1 && w[0] !== target[0]).sort(() => pick() - 0.5).slice(0, n - 1);
      if (wrong.length < n - 1) continue;
      used.add(`sw:${target}`);
      const sentence = sentences.find((s) => hasWord(s, target)) ?? "";
      return { question: "Find the word you hear. 🔊", say: `Find the word: ${target}.`, options: [target, ...wrong], correctAnswer: 0,
        explanation: `That's "${target}". It's in the story: "${shorten(sentence, 14)}"`, type: "multiple-choice", skill: "sight-words", evidence: sentence };
    }
    return null;
  },
  spelling: ({ story, sentences, names, n, shape, used, pick }) => {
    const minLen = GRADE_PROFILES[shape.grade].difficulty === "easy" ? 4 : GRADE_PROFILES[shape.grade].difficulty === "medium" ? 5 : 7;
    const cands = [...new Set(tokens(story))].filter((w) => (w.length >= minLen || shape.practiceWords.includes(w)) && /^[a-z]+$/.test(w) && !SPELL_SKIP.has(w) && !names.includes(w) && !used.has(`sp:${w}`));
    const practice = new Set(shape.practiceWords);
    cands.sort((a, b) => Number(practice.has(b)) - Number(practice.has(a)) || b.length - a.length || pick() - 0.5);
    for (const w of cands.slice(0, 12)) {
      const wrong = misspellings(w).filter((x) => !hasWord(story, x)).slice(0, n - 1);
      if (wrong.length < n - 1) continue;
      used.add(`sp:${w}`);
      const sentence = sentences.find((s) => hasWord(s, w)) ?? "";
      return { question: "Which word is spelled right?", options: [w, ...wrong], correctAnswer: 0,
        explanation: `The story spells it "${w}": "${shorten(sentence, 14)}"`, type: "multiple-choice", skill: "spelling", evidence: sentence };
    }
    return null;
  },
  "word-meaning": ({ story, sentences, names, n, shape, used, pick }) => {
    // 0. a practice word the parent typed, in its sentence (meaning if known, else context clue)
    for (const pw of shape.practiceWords) {
      if (used.has(`wm:${pw}`)) continue;
      const s = sentences.find((x) => hasWord(x, pw));
      if (!s) continue;
      if (SYNONYMS[pw]) {
        used.add(`wm:${pw}`);
        const { same, not } = SYNONYMS[pw];
        return { question: `Your practice word! The story says: ${quote(shorten(s, 18))} What does “${pw}” mean here?`, options: [same, ...not.slice(0, n - 1)], correctAnswer: 0,
          explanation: `“${pw}” means “${same}”.`, type: "multiple-choice", skill: "word-meaning", evidence: s };
      }
      const wrong = WORD_BANK.filter((x) => !hasWord(story, x) && x !== pw)
        .sort((a, b) => Math.abs(a.length - pw.length) - Math.abs(b.length - pw.length) || pick() - 0.5).slice(0, n - 1);
      if (wrong.length < n - 1) continue;
      used.add(`wm:${pw}`);
      return { question: `Your practice word! Which word fits? ${quote(s.replace(wordRe(pw, "u"), "____"))}`, options: [pw, ...wrong], correctAnswer: 0,
        explanation: `The story says: ${quote(s)}`, type: "multiple-choice", skill: "word-meaning", evidence: s };
    }
    // 1. a word with a known meaning, asked in its sentence
    for (const s of sentences) {
      const hit = tokens(s).map((t) => t.toLowerCase()).find((t) => SYNONYMS[t] && !used.has(`wm:${t}`));
      if (!hit) continue;
      const { same, not } = SYNONYMS[hit];
      used.add(`wm:${hit}`);
      return { question: `The story says: ${quote(shorten(s, 18))} What does “${hit}” mean here?`, options: [same, ...not.slice(0, n - 1)], correctAnswer: 0,
        explanation: `"${hit}" means "${same}".`, type: "multiple-choice", skill: "word-meaning", evidence: s };
    }
    // 2. context clues: the word that fits the sentence
    const usable = sentences.filter((s) => words(s).length >= 5 && words(s).length <= 30);
    for (const s of usable.sort(() => pick() - 0.5)) {
      const cands = tokens(s).filter((w) => w.length >= 4 && !STOP.has(w.toLowerCase()) && !names.includes(w) && !used.has(`wm:${w.toLowerCase()}`) &&
        (s.match(wordRe(w, "gu")) ?? []).length === 1);
      if (!cands.length) continue;
      const answer = cands.sort((a, b) => b.length - a.length)[0];
      const wrong = WORD_BANK.filter((x) => !hasWord(story, x) && x !== answer.toLowerCase())
        .sort((a, b) => Math.abs(a.length - answer.length) - Math.abs(b.length - answer.length) || pick() - 0.5).slice(0, n - 1);
      if (wrong.length < n - 1) continue;
      used.add(`wm:${answer.toLowerCase()}`);
      return { question: `Use the sentence to pick the missing word: ${quote(s.replace(wordRe(answer, "u"), "____"))}`, options: [answer.toLowerCase(), ...wrong],
        correctAnswer: 0, explanation: `The story says: "${s}"`, type: "multiple-choice", skill: "word-meaning", evidence: s };
    }
    return null;
  },
  "what-happened": ({ story, sentences, names, n, shape, used }, variant) => {
    // Pre-K–K: a picture question, "Which one was in the story?"
    if (shape.band.pictures && !used.has("wh:pic")) {
      const inStory = Object.keys(EMOJI).filter((w) => !/\d/.test(w) && w.length >= 3 && hasWord(story, w) && !["happy", "sad", "glad"].includes(w));
      const counts = inStory.map((w) => [w, (story.match(wordRe(w, "giu")) ?? []).length] as const).sort((a, b) => b[1] - a[1]);
      const target = counts[0]?.[0];
      const wrong = Object.keys(EMOJI).filter((w) => !/\d/.test(w) && !hasWord(story, w) && EMOJI[w] !== EMOJI[target ?? ""] &&
        !["happy", "glad", "sad", "scared", "afraid", "surprised", "angry", "sleepy", "tired", "excited", "proud", "mud"].includes(w));
      if (target && wrong.length >= n - 1) {
        used.add("wh:pic");
        const evidence = sentences.find((x) => hasWord(x, target)) ?? "";
        return { question: "Which one was in the story?", options: [target, ...wrong.slice(0, n - 1)], correctAnswer: 0,
          explanation: `Yes! The story has a ${target}: ${quote(shorten(evidence, 14))}`, type: "multiple-choice", skill: "what-happened", evidence };
      }
    }
    if (variant % 2 === 0 && names.length && !used.has("wh:who")) {
      const wrong = NAME_BANK.filter((x) => !hasWord(story, x)).slice(0, n - 1);
      if (wrong.length === n - 1) {
        used.add("wh:who");
        const evidence = sentences.find((s) => hasWord(s, names[0])) ?? "";
        return { question: "Who is in this story?", options: [names[0], ...wrong], correctAnswer: 0,
          explanation: `Yes! ${names[0]} is in the story.`, type: "multiple-choice", skill: "what-happened", evidence };
      }
    }
    if (sentences.length >= n + 1 && !used.has("wh:order")) {
      used.add("wh:order");
      const picks = Array.from({ length: n }, (_, i) => sentences[Math.floor(((i + 0.5) / n) * sentences.length)]);
      if (new Set(picks).size === n) {
        const opts = picks.map((p) => shorten(p, 12));
        return { question: "Which of these happened first in the story?", options: opts, correctAnswer: 0,
          explanation: `It came first: "${picks[0]}"`, type: "multiple-choice", skill: "what-happened", evidence: picks[0] };
      }
    }
    return null;
  },
  "between-the-lines": ({ sentences, names, n, used }) => {
    for (const s of sentences) {
      const cue = FEELING_CUES.find((c) => c.re.test(s));
      if (!cue || used.has(`bl:${s}`)) continue;
      used.add(`bl:${s}`);
      const cueWord = (s.match(cue.re) ?? [""])[0];
      // Name the character only when the sentence is plainly about them; otherwise "the person who…".
      const named = names.filter((x) => hasWord(s, x));
      const whoText = named.length === 1 && s.indexOf(named[0]) < s.indexOf(cueWord) ? named[0] : `the person who ${cueWord}`;
      return { question: `The story says: ${quote(shorten(s, 18))} How do you think ${whoText} felt?`, options: [cue.feeling, ...cue.not.slice(0, n - 1)], correctAnswer: 0,
        explanation: `“${cueWord}” is a clue: ${whoText} felt ${cue.feeling}.`, type: "character-emotion", skill: "between-the-lines", evidence: s };
    }
    for (const s of sentences) {
      const m = s.match(/^(.{8,}?)\s+because\s+(.{6,}?)[.!?]?$/i);
      if (!m || used.has(`bl:${s}`)) continue;
      used.add(`bl:${s}`);
      const reason = shorten(m[2], 10);
      const wrong = sentences.filter((x) => x !== s && !/because/i.test(x)).slice(0, n - 1).map((x) => shorten(x.replace(/[.!?]$/, ""), 10));
      if (wrong.length < n - 1) continue;
      return { question: `Why? "${shorten(m[1], 14)}…"`, options: [reason, ...wrong], correctAnswer: 0,
        explanation: `The story tells us why: "${s}"`, type: "multiple-choice", skill: "between-the-lines", evidence: s };
    }
    return null;
  },
  "big-picture": ({ story, sentences, names, n, shape, used }, variant) => {
    const noun = mostCommonNoun(story, names);
    const main = names[0];
    if (!main && !noun) return null;
    const topics = TOPIC_BANK.filter((t) => !contentWords(t).some((w) => hasWord(story, w))).slice(0, n - 1);
    if (topics.length < n - 1) return null;
    if (variant % 2 === 0 && !used.has("bp:about")) {
      used.add("bp:about");
      const answer = main && noun ? `${main} and the ${noun}` : main ? `What happens to ${main}` : `The ${noun}`;
      return { question: "What is this story mostly about?", options: [answer, ...topics], correctAnswer: 0,
        explanation: `The story keeps coming back to ${answer.toLowerCase().startsWith("what") ? main : answer}.`, type: "multiple-choice", skill: "big-picture", evidence: sentences[0] };
    }
    // Older readers: finding evidence ("Which sentence shows…").
    if (GRADE_PROFILES[shape.grade].difficulty === "expert" && !used.has("bp:evidence")) {
      const proof = sentences.find((x) => FEELING_CUES.some((c) => c.re.test(x)));
      const plain = sentences.filter((x) => x !== proof && !FEELING_CUES.some((c) => c.re.test(x)) && !/[!?]["”]?$/.test(x)).slice(0, n - 1);
      if (proof && plain.length === n - 1) {
        used.add("bp:evidence");
        return { question: "Which sentence best shows how a character feels?", options: [shorten(proof, 16), ...plain.map((x) => shorten(x, 16))], correctAnswer: 0,
          explanation: `The clue is in the words: ${quote(proof)}`, type: "multiple-choice", skill: "big-picture", evidence: proof };
      }
    }
    if (!used.has("bp:title")) {
      used.add("bp:title");
      const title = main && noun ? `${main}'s ${noun[0].toUpperCase()}${noun.slice(1)}` : `The ${noun ?? "Story"}`;
      const wrong = topics.map((t) => t.replace(/^a /, "The ").replace(/^\w/, (c) => c.toUpperCase()));
      return { question: "Which would be the best title for this story?", options: [title, ...wrong], correctAnswer: 0,
        explanation: `The story is about ${main ?? "the " + noun}${noun && main ? " and the " + noun : ""}.`, type: "multiple-choice", skill: "big-picture", evidence: sentences[0] };
    }
    return null;
  },
  "sentence-sense": ({ sentences, n, used }) => {
    const ex = sentences.find((s) => /!["”]?$/.test(s) && !used.has(`ss:${s}`));
    if (ex) {
      used.add(`ss:${ex}`);
      const opts = ["Someone feels strongly, like excited or surprised", "Someone is asking a question", "The story is over", "Nothing special"].slice(0, n);
      return { question: `What does the "!" at the end of this sentence tell you? "${shorten(ex, 16)}"`, options: opts, correctAnswer: 0,
        explanation: `An exclamation mark shows strong feeling: "${ex}"`, type: "multiple-choice", skill: "sentence-sense", evidence: ex };
    }
    const q = sentences.find((s) => /["“][^"”]+["”]/.test(s) && !used.has(`ss:${s}`));
    if (q) {
      used.add(`ss:${q}`);
      const opts = ["They show the exact words someone said", "They show the title of a book", "They show a word is spelled wrong", "They show a question"].slice(0, n);
      return { question: `Why are there quotation marks in this sentence? "${shorten(q, 16)}"`, options: opts, correctAnswer: 0,
        explanation: `Quotation marks hold the words a character says: "${q}"`, type: "multiple-choice", skill: "sentence-sense", evidence: q };
    }
    const past = sentences.find((s) => /\b(was|were|had|\w{3,}ed)\b/.test(s) && !used.has(`ss:${s}`));
    if (past) {
      used.add(`ss:${past}`);
      const opts = ["In the past", "Right now", "In the future", "It never happened"].slice(0, n);
      return { question: `When does this happen? "${shorten(past, 16)}"`, options: opts, correctAnswer: 0,
        explanation: `Words like "${(past.match(/\b(was|were|had|\w{3,}ed)\b/) ?? [""])[0]}" tell us it already happened.`, type: "multiple-choice", skill: "sentence-sense", evidence: past };
    }
    return null;
  },
};

/** Fallback order when a skill's builder finds nothing in this story. */
const STAND_INS: QuizSkill[] = ["what-happened", "word-meaning", "between-the-lines", "big-picture", "spelling", "sentence-sense", "sight-words", "phonics"];

function finishQuestion(q: Omit<QuizQuestion, "id">, shape: QuizShape, i: number): QuizQuestion {
  const withPictures = shape.band.pictures ? { ...q, pictures: q.options.map(pictureFor) } : q;
  return shuffleQuestion({ ...withPictures, id: `q${i + 1}` }, `${q.question}|${i}`);
}

/**
 * A quiz written from the story itself, following the band's skill plan, for when
 * the AI is down or its answer was unusable. Every builder takes its right answer from
 * the story and its wrong ones from outside it (or from a closed set), so there is
 * exactly one right answer.
 */
export function buildFallbackQuiz(story: string, shape: QuizShape): QuizQuestion[] {
  const ctx: BuildCtx = { story, sentences: storySentences(story), names: namesIn(story), n: shape.optionCount, shape, pick: rng(story.slice(0, 400)), used: new Set() };
  const out: QuizQuestion[] = [];
  const variants = new Map<QuizSkill, number>();
  for (const skill of shape.plan) {
    let built: Omit<QuizQuestion, "id"> | null = null;
    for (const s of [skill, ...STAND_INS]) {
      const v = variants.get(s) ?? 0;
      built = BUILDERS[s](ctx, v) ?? BUILDERS[s](ctx, v + 1);
      variants.set(s, v + 1);
      if (built) break;
    }
    if (built) out.push(finishQuestion(built, shape, out.length));
  }
  return spreadAnswers(out);
}

/**
 * The model's questions placed on the band's skill plan; any slot the model left
 * empty is filled from the story text. Always the band's number of questions when the
 * story allows it.
 */
export function finalizeQuiz(raw: unknown, story: string, shape: QuizShape): { questions: QuizQuestion[]; source: QuizSource } {
  const ai = raw ? normalizeQuizQuestions(raw, story, shape) : [];
  const fallback = buildFallbackQuiz(story, shape);
  const pool = [...ai];
  const fb = [...fallback];
  const out: QuizQuestion[] = [];
  let fromAi = 0;
  for (const skill of shape.plan) {
    let i = pool.findIndex((q) => q.skill === skill);
    if (i >= 0) { out.push(pool.splice(i, 1)[0]); fromAi++; continue; }
    i = fb.findIndex((q) => q.skill === skill);
    if (i >= 0) { out.push(fb.splice(i, 1)[0]); continue; }
    if (pool.length) { out.push(pool.shift()!); fromAi++; continue; }
    if (fb.length) out.push(fb.shift()!);
  }
  // A practice word that is in the story gets a word-meaning or spelling question.
  const inStoryPractice = shape.practiceWords.filter((w) => hasWord(story, w));
  const touches = (q: QuizQuestion) => inStoryPractice.some((w) => hasWord(q.question, w) || q.options.some((o) => o.toLowerCase() === w));
  if (inStoryPractice.length && !out.some(touches)) {
    const pq = fallback.find((q) => (q.skill === "word-meaning" || q.skill === "spelling") && touches(q));
    const slot = out.findIndex((q) => q.skill === "word-meaning" || q.skill === "spelling");
    if (pq) {
      if (slot >= 0) out[slot] = pq;
      else if (out.length) out[out.length - 1] = pq;
    }
  }
  const questions = spreadAnswers(out.map((q, i) => ({ ...q, id: `q${i + 1}`, ...(shape.band.pictures && !q.pictures ? { pictures: q.options.map(pictureFor) } : {}) })));
  return { questions, source: fromAi === 0 ? "fallback" : fromAi === questions.length ? "ai" : "mixed" };
}

// ── the prompt ───────────────────────────────────────────────────────────────

const SKILL_ASK: Record<QuizSkill, string> = {
  phonics: "sounds & phonics: which word starts with the same sound as a story word, or which words rhyme (read aloud)",
  "sight-words": "sight words: \"say\" names a common sight word FROM the story; the options are written words, only one is that word",
  spelling: "spelling: which spelling of a word FROM the story is right; the wrong ones are believable misspellings",
  "word-meaning": "word meaning: what a story word means, using the sentence around it (context clues); same/opposite meaning, word parts or figurative language for older readers",
  "what-happened": "what happened: who, what, where, or what happened first / next / last",
  "between-the-lines": "reading between the lines: how a character felt and why, what will happen next, or cause and effect; the answer is NOT said word for word",
  "big-picture": "big picture: the main idea, the lesson or theme, why the writer chose a word, point of view, or \"Which sentence shows…\" (finding evidence)",
  "sentence-sense": "sentence sense: which word describes, what the punctuation tells you, or past / present",
};

export function buildQuizMessages(story: string, shape: QuizShape): Array<{ role: "system" | "user"; content: string }> {
  const p = GRADE_PROFILES[shape.grade];
  const slots = shape.plan.map((s, i) => `${i + 1}. skill "${s}": ${SKILL_ASK[s]}`).join("\n");
  const ageLine = shape.age !== null && Math.abs(shape.age - p.typicalAge) >= 2
    ? `The child is ${shape.age} years old but reads at ${p.longLabel} level: use ${p.longLabel} words and question depth, but keep every topic and example right for a ${shape.age}-year-old.`
    : `The child is about ${shape.age ?? p.typicalAge} years old.`;
  const system = `You write reading quizzes for children, in English, that test literacy, not only memory.
The reader reads at ${p.promptReadingLevel}. ${ageLine}
Every question: at most ${shape.maxQuestionWords} words, about THIS story only.

Write exactly ${shape.count} questions, one for each line below, in this order:
${slots}

Rules for every question:
- exactly ${shape.optionCount} answer options, short and all different;
- exactly ONE option is right according to the story; the wrong options are believable, never silly;
- never "all of the above", "none of the above" or "both";
- "skill": the skill name from its line above;
- "evidence": copy, word for word, the story sentence that holds the answer (for a phonics or sight-word question, the sentence the word is in);
- "explanation": one short, kind sentence to the child about why that answer is right;
- "say" (only when it differs from "question"): the words to read aloud.

${shape.practiceWords.length ? `The parent's practice words: ${shape.practiceWords.join(", ")}. Make the word-meaning or spelling question about one of them that is in the story.\n\n` : ""}Answer with JSON only, no other text:
{"questions":[{"skill":"what-happened","question":"...","options":["...","..."],"correctAnswer":0,"evidence":"...","explanation":"..."}]}
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

/**
 * The chain's output check for a quiz answer (storyTextProvider `accept`): a rejected
 * answer moves to the next model. Planning text, a cut-off answer (finish_reason
 * length, or JSON that does not parse) and JSON that is not a quiz are rejected;
 * reasoning blocks are stripped first, and text around valid quiz JSON is never shown.
 */
export function quizAnswerProblem(content: string, finishReason?: string | null): string | null {
  if (finishReason === "length") return "truncated (finish_reason length)";
  const text = stripReasoning(content ?? "");
  if (!text) return "empty";
  const parsed = parseQuizJson(text);
  if (!parsed) return /^\s*(let me|let's|okay|ok,|alright|first,|i need|i will|i'll|here is|here's|sure|the user)/i.test(text) ? "planning text, no quiz JSON" : "no quiz JSON (cut off or not JSON)";
  // deno-lint-ignore no-explicit-any
  const list: any[] = Array.isArray(parsed) ? parsed : Array.isArray((parsed as any)?.questions) ? (parsed as any).questions : [];
  if (!list.length) return "JSON has no questions";
  const shaped = list.filter((q) => typeof q?.question === "string" && q.question.trim() && Array.isArray(q?.options) && q.options.length >= 2 &&
    q.options.every((o: unknown) => typeof o === "string" && o.trim()) && (typeof q?.correctAnswer === "number" || typeof q?.correctAnswer === "string"));
  if (shaped.length < Math.ceil(list.length / 2)) return `quiz JSON malformed (${shaped.length}/${list.length} questions usable)`;
  return null;
}

/** Remove reasoning a model put in its answer (<think>…</think>). */
function stripReasoning(text: string): string {
  return text.replace(/<think(?:ing)?>[\s\S]*?<\/think(?:ing)?>/gi, "").replace(/<think(?:ing)?>[\s\S]*$/i, "").trim();
}

/** Longest story text sent to the model. */
export const QUIZ_STORY_MAX_CHARS = 6000;

// ── results by skill (parent dashboard → Reports) ─────────────────────────────

export interface SkillAnswer { skill: QuizSkill; correct: boolean }
export type SkillStats = Partial<Record<QuizSkill, { right: number; total: number }>>;

export function skillStats(answers: Iterable<SkillAnswer>): SkillStats {
  const out: SkillStats = {};
  for (const a of answers) {
    if (!(QUIZ_SKILLS as readonly string[]).includes(a?.skill)) continue;
    const s = (out[a.skill] ??= { right: 0, total: 0 });
    s.total++;
    if (a.correct) s.right++;
  }
  return out;
}

/** "Strong at word meaning · practising reading between the lines" (needs 3+ answers per skill). */
export function skillSummary(stats: SkillStats): { strong: QuizSkill[]; practising: QuizSkill[]; text: string } {
  const rated = QUIZ_SKILLS.filter((s) => (stats[s]?.total ?? 0) >= 3).map((s) => ({ s, p: stats[s]!.right / stats[s]!.total }));
  const strong = rated.filter((r) => r.p >= 0.75).sort((a, b) => b.p - a.p).map((r) => r.s);
  const practising = rated.filter((r) => r.p < 0.6).sort((a, b) => a.p - b.p).map((r) => r.s);
  const lower = (s: QuizSkill) => QUIZ_SKILL_LABELS[s].toLowerCase();
  const parts = [
    strong.length ? `Strong at ${strong.slice(0, 2).map(lower).join(" and ")}` : "",
    practising.length ? `practising ${practising.slice(0, 2).map(lower).join(" and ")}` : "",
  ].filter(Boolean);
  return { strong, practising, text: parts.length ? parts.join(" · ").replace(/^p/, "P") : "" };
}
