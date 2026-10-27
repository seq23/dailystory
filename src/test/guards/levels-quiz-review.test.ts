// Guard (hostile review of #102/#104/#107/#108/#109, 26 Oct 2026). Five holes found in
// the reading-level, quiz and practice-word work, each pinned here:
//   1. A 5-year-old reading at 10th grade: the 6th–10th SYSTEM prompts ask for "mature
//      themes"; the age-right THEMES line sat only in the user prompt, which a system
//      prompt outranks. The handler now lifts it into the system prompt.
//   2. Practice-word retry: when the retry attempt itself failed on the last attempt, the
//      loop threw and the good first answer (kept for exactly this) was lost.
//   3. Session end rewrote the last-read story WITHOUT its practice words, so the
//      session-ended quiz never knew them.
//   4. "Practice words are quizzed" counted a practice word that was only a WRONG choice
//      (Pre-K–K phonics), and Pre-K–K never got a practice-word question at all.
//   5. The quiz cache keyed on the first 500 characters only: a never-ending story (same
//      opening, new pages) or a level change served the old quiz at the old band.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { GRADES, audienceThemesForSystemPrompt, storyAudienceLine } from "@/lib/grades";
import { finalizeQuiz, normalizeQuizQuestions, stripMarkdown, quizShapeForGrade, quizzesPracticeWord, storySeed, type QuizQuestion } from "../../../supabase/functions/_shared/quiz";
import { quizCacheKey, readCachedQuiz } from "@/lib/quiz";

const ROOT = join(__dirname, "../../..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const HANDLER = "supabase/functions/generate-adaptive-story/streamlined-handler.ts";

describe("1. themes follow the real age in the SYSTEM prompt", () => {
  it("lifts the THEMES line out of the user prompt, with the override", () => {
    const content = `Create a never-ending story for Ava, age 5.\n\n${storyAudienceLine({ age: 5, readsAt: "10", schoolGrade: "K" })}\n`;
    const add = audienceThemesForSystemPrompt(content);
    expect(add).toContain("THEMES: the reader is 5 years old (Kindergarten at school)");
    expect(add).toMatch(/overrides any theme guidance above/);
    expect(add).toMatch(/never use mature/);
    expect(audienceThemesForSystemPrompt("no audience line here")).toBe("");
    expect(audienceThemesForSystemPrompt(undefined)).toBe("");
  });

  it("the story handler appends it to the system prompt it sends", () => {
    const src = read(HANDLER);
    const start = src.indexOf("let finalSystemPrompt = promptConfig.systemPrompt;");
    const add = src.indexOf("finalSystemPrompt += audienceThemesForSystemPrompt(bundle.storyContent);");
    const sent = src.indexOf("systemPrompt: finalSystemPrompt,");
    expect(start).toBeGreaterThan(0);
    expect(add).toBeGreaterThan(start);
    expect(sent).toBeGreaterThan(add);
  });
});

describe("2. a failed practice-word retry keeps the first story", () => {
  it("every give-up inside the generation loop breaks to the rescue when a first answer is held", () => {
    const src = read(HANDLER);
    const loop = src.indexOf("while (attempt <= maxAttempts && !storyText)");
    const rescue = src.indexOf("if (!storyText?.trim() && practiceFallbackText)");
    expect(loop).toBeGreaterThan(0);
    expect(rescue).toBeGreaterThan(loop);
    const body = src.slice(loop, rescue);
    const throws = [...body.matchAll(/throw new Error\('All AI generation attempts failed'\)/g)];
    expect(throws.length).toBeGreaterThanOrEqual(2);
    for (const t of throws) {
      expect(body.slice(Math.max(0, t.index! - 250), t.index)).toContain("if (practiceFallbackText) break;");
    }
  });
});

describe("3. session end keeps the practice words for the quiz", () => {
  it("every saveLastReadStory call on the story page carries practiceWords", () => {
    const src = read("src/components/CleanStoryDisplay.tsx");
    const calls = [...src.matchAll(/saveLastReadStory\(\{[\s\S]*?\}\);/g)].map((m) => m[0]);
    expect(calls.length).toBeGreaterThanOrEqual(2);
    for (const c of calls) expect(c).toContain("practiceWords");
  });
});

describe("4. a practice word is really quizzed, in every band", () => {
  const story = `Maya found a huge footprint in the mud by the creek. "That's not a dog," she whispered. She ran home, grabbed her notebook and drew it carefully, toe by toe. The next morning a museum scientist looked at her drawing and smiled. "You've found something special," she said.`;

  it("a practice word only as a wrong choice does not count", () => {
    const q: QuizQuestion = { id: "q1", question: "Which word starts like Maya?", options: ["mud", "notebook"], correctAnswer: 0, explanation: "", type: "multiple-choice", skill: "phonics" };
    expect(quizzesPracticeWord(q, ["notebook"])).toBe(false);
    expect(quizzesPracticeWord({ ...q, correctAnswer: 1 }, ["notebook"])).toBe(true);
    expect(quizzesPracticeWord({ ...q, question: "What is a notebook?" }, ["notebook"])).toBe(true);
  });

  for (const g of GRADES) {
    it(`Reads at ${g}: the backup quiz asks about the practice word, at the band's size`, () => {
      const shape = quizShapeForGrade(g, 5, storySeed(story), ["notebook"]);
      const { questions } = finalizeQuiz(null, story, shape);
      expect(questions.length).toBe(shape.count);
      expect(questions.some((q) => quizzesPracticeWord(q, ["notebook"]))).toBe(true);
      for (const q of questions) {
        expect(q.options.length).toBe(shape.optionCount);
        expect(new Set(q.options.map((o) => o.toLowerCase())).size).toBe(q.options.length);
      }
      expect(questions.some((q) => q.skill === "what-happened") || shape.plan.every((s) => s !== "what-happened")).toBe(true);
    });
  }
});

describe("5. the quiz cache key covers the whole story, the grade and the practice words", () => {
  const opening = "Leo walked to school on a cold morning and found a small red kite stuck in a tree. ".repeat(8);
  const info = { age: 7, grade: "2" } as Record<string, unknown>;
  beforeEach(() => sessionStorage.clear());

  it("changes when later pages, the grade or the practice words change", () => {
    const a = quizCacheKey({ storyText: opening + "Page two.", userInfo: info });
    expect(opening.length).toBeGreaterThan(600);
    expect(quizCacheKey({ storyText: opening + "Page two.", userInfo: info })).toBe(a);
    expect(quizCacheKey({ storyText: opening + "Page two. Page three.", userInfo: info })).not.toBe(a);
    expect(quizCacheKey({ storyText: opening + "Page two.", userInfo: info, storyGrade: "6" })).not.toBe(a);
    expect(quizCacheKey({ storyText: opening + "Page two.", userInfo: info, practiceWords: ["kite"] })).not.toBe(a);
  });

  it("an old-format cache entry is ignored, a current one keeps its source", () => {
    expect(readCachedQuiz(JSON.stringify([{ question: "x", options: ["a", "b"], correctAnswer: 0 }]))).toBeNull();
    expect(readCachedQuiz(JSON.stringify({ questions: [{ question: "x", options: ["a", "b"], correctAnswer: 0 }] }))).toBeNull();
    expect(readCachedQuiz("not json")).toBeNull();
    const ok = readCachedQuiz(JSON.stringify({ questions: [{ question: "x", options: ["a", "b"], correctAnswer: 1, skill: "what-happened" }], source: "mixed" }));
    expect(ok?.source).toBe("mixed");
  });

  it("both quiz screens use it (no local first-500-characters hash)", () => {
    for (const f of ["src/components/ComprehensionQuiz.tsx", "src/components/VoiceQuiz.tsx"]) {
      const src = read(f);
      expect(src).toContain("quizCacheKey({");
      expect(src).toContain("readCachedQuiz(sessionStorage.getItem(cacheKey))");
      expect(src).not.toMatch(/hashStory/);
    }
  });
});

// 27 Oct 2026, live: a model's sight-word question "Find the word **by**." reached the
// quiz, which shows and reads aloud plain text, so the child saw the asterisks.
describe("quiz text never shows markdown", () => {
  const story = "Maya found a huge footprint in the mud by the creek. She ran home and drew it, toe by toe. The next morning a scientist smiled at her drawing.";
  it("strips bold, italics and code marks from what the model wrote", () => {
    expect(stripMarkdown("Find the word **by**.")).toBe("Find the word by.");
    expect(stripMarkdown("What did *Maya* find?")).toBe("What did Maya find?");
    expect(stripMarkdown("Tap __she__ or `mud`.")).toBe("Tap she or mud.");
    expect(stripMarkdown("2 * 3 = 6")).toBe("2 * 3 = 6");
    const shape = quizShapeForGrade("K", 5, storySeed(story));
    const qs = normalizeQuizQuestions({ questions: [
      { question: "What did **Maya** find in the mud?", options: ["A **footprint**", "A ball"], correctAnswer: 0, skill: "what-happened", evidence: "Maya found a huge footprint in the mud by the creek." },
    ] }, story, shape);
    expect(qs.length).toBe(1);
    for (const q of qs) for (const t of [q.question, ...q.options, q.explanation]) expect(t, t).not.toMatch(/[*_`]{1,2}\w/);
  });
});
