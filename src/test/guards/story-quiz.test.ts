// Guard (26 Oct 2026): the end-of-story quizzes must be good.
// Before: generate-quiz called a Gemini model through the Lovable gateway with the
// child's name in the text; nothing checked the questions; the right answer sat
// wherever the model put it; when the AI was down the child got "Quiz unavailable";
// results never carried the child, so a parent's per-child Quizzes tab stayed empty;
// the voice quiz never saved at all.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildFallbackQuiz,
  evidenceInStory,
  finalizeQuiz,
  normalizeQuizQuestions,
  quizShapeForGrade,
  buildQuizMessages,
  parseQuizJson,
} from "../../../supabase/functions/_shared/quiz";
import { loadStoryQuiz } from "@/lib/quiz";

const ROOT = join(__dirname, "../../..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

const STORY = `Mia found a tiny blue egg under the old oak tree. She carried it home in her red mitten.
Her brother Theo said it might be a robin egg. They made a soft nest from a shoebox and some straw.
That night a storm shook the windows. Mia kept the shoebox next to the warm stove.
In the morning the egg cracked open. A small wet bird blinked at them and chirped.
Mia laughed and named the bird Pip. When Pip could fly, they let him go in the garden.`;

const words = (s: string) => s.toLowerCase().match(/[a-z']+/g) ?? [];

describe("the quiz written from the story text (AI down)", () => {
  for (const grade of ["PreK", "2", "5", "9"]) {
    it(`grade ${grade}: right answers are in the story, wrong ones are not, options shuffled`, () => {
      const shape = quizShapeForGrade(grade);
      const qs = buildFallbackQuiz(STORY, shape);
      expect(qs.length).toBeGreaterThanOrEqual(Math.min(3, shape.count));
      expect(qs.length).toBeLessThanOrEqual(shape.count);
      const storyWords = new Set(words(STORY));
      for (const q of qs) {
        expect(new Set(q.options.map((o) => o.toLowerCase())).size).toBe(q.options.length);
        expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
        expect(q.correctAnswer).toBeLessThan(q.options.length);
        expect(q.explanation.length).toBeGreaterThan(5);
        if (q.question.startsWith("Which word is missing") || q.question.startsWith("Who is in")) {
          // exactly one option appears in the story
          const inStory = q.options.filter((o) => storyWords.has(o.toLowerCase()));
          expect(inStory).toEqual([q.options[q.correctAnswer]]);
        }
      }
      // the right answer is not always in the same slot
      expect(new Set(qs.map((q) => q.correctAnswer)).size).toBeGreaterThan(1);
    });
  }

  it("question count and option count follow the grade", () => {
    expect(quizShapeForGrade("PreK")).toMatchObject({ count: 3, optionCount: 3 });
    expect(quizShapeForGrade("1")).toMatchObject({ count: 3, optionCount: 4 });
    expect(quizShapeForGrade("3")).toMatchObject({ count: 4 });
    expect(quizShapeForGrade("10")).toMatchObject({ count: 5 });
  });
});

describe("a model's quiz is checked before a child sees it", () => {
  const shape = quizShapeForGrade("3");
  const good = (over: Record<string, unknown> = {}) => ({
    question: "What did Mia find under the tree?", options: ["A blue egg", "A red ball", "A green frog", "A kitten"],
    correctAnswer: 0, evidence: "Mia found a tiny blue egg under the old oak tree.", explanation: "She found a blue egg!", ...over,
  });

  it("keeps a grounded question and shuffles it", () => {
    const many = Array.from({ length: 4 }, (_, i) => good({ question: `Q${i}: what did Mia find under the tree?` }));
    const out = normalizeQuizQuestions(many, STORY, shape);
    expect(out).toHaveLength(4);
    for (const q of out) expect(q.options[q.correctAnswer]).toBe("A blue egg");
    expect(new Set(out.map((q) => q.correctAnswer)).size).toBeGreaterThan(1);
  });

  it("drops: a quote not in the story, duplicate options, 'all of the above', a bad answer index", () => {
    expect(normalizeQuizQuestions([good({ evidence: "The pirate ship sailed to the golden island at dawn." })], STORY, shape)).toEqual([]);
    expect(normalizeQuizQuestions([good({ options: ["A blue egg", "a blue egg", "A cat", "A dog"] })], STORY, shape)).toEqual([]);
    expect(normalizeQuizQuestions([good({ options: ["A blue egg", "A cat", "All of the above", "A dog"] })], STORY, shape)).toEqual([]);
    expect(normalizeQuizQuestions([good({ correctAnswer: 7 })], STORY, shape)).toEqual([]);
    expect(normalizeQuizQuestions([good({ evidence: "", question: "What is the capital of France?", options: ["Paris", "Rome"] })], STORY, shape)).toEqual([]);
  });

  it("accepts a letter answer and fenced JSON", () => {
    const parsed = parseQuizJson("```json\n" + JSON.stringify({ questions: [good({ correctAnswer: "A" })] }) + "\n```");
    expect(normalizeQuizQuestions(parsed, STORY, shape)).toHaveLength(1);
    expect(evidenceInStory("Mia kept the shoebox next to the warm stove.", STORY)).toBe(true);
  });

  it("too few good questions are topped up from the story; none → a full fallback quiz", () => {
    expect(finalizeQuiz(null, STORY, shape).source).toBe("fallback");
    expect(finalizeQuiz(null, STORY, shape).questions.length).toBeGreaterThanOrEqual(3);
    const mixed = finalizeQuiz([good()], STORY, shape);
    expect(mixed.source).toBe("mixed");
    expect(mixed.questions.length).toBeGreaterThanOrEqual(3);
  });

  it("the prompt names the grade, the count, one right answer and the evidence quote", () => {
    const [sys] = buildQuizMessages(STORY, quizShapeForGrade("2"));
    expect(sys.content).toMatch(/2nd grade/);
    expect(sys.content).toMatch(/exactly 3 questions/i);
    expect(sys.content).toMatch(/Exactly ONE option is right/);
    expect(sys.content).toMatch(/"evidence"/);
  });
});

describe("the client never shows an empty or broken quiz", () => {
  it("function down → a quiz from the story text", async () => {
    const out = await loadStoryQuiz({ storyText: STORY, userInfo: { age: 7, grade: "2" } as any }, async () => { throw new Error("offline"); });
    expect(out.source).toBe("fallback");
    expect(out.questions.length).toBeGreaterThanOrEqual(3);
  });
  it("function returns junk → still a quiz", async () => {
    const out = await loadStoryQuiz({ storyText: STORY, userInfo: { age: 7 } as any }, async () => ({ data: { questions: [{ question: "?" }] }, error: null }));
    expect(out.questions.length).toBeGreaterThanOrEqual(3);
  });
  it("sends the grade and the child's name (for masking) to our function", async () => {
    let sent: any;
    await loadStoryQuiz({ storyText: STORY, userInfo: { age: 9, readingGrade: "4", name: "Mia" } as any }, async (_n, o) => { sent = o.body; return { data: null, error: "x" }; });
    expect(sent).toMatchObject({ grade: "4", childName: "Mia" });
  });
});

describe("generate-quiz runs the story text chain, never Gemini", () => {
  const fn = read("supabase/functions/generate-quiz/index.ts");
  it("calls chatCompletionWithFallback with the child's names to mask, and finalizeQuiz", () => {
    expect(fn).toMatch(/from "\.\.\/_shared\/storyTextProvider\.ts"/);
    expect(fn).toMatch(/chatCompletionWithFallback\([\s\S]*privateNames/);
    expect(fn).toMatch(/finalizeQuiz\(/);
  });
  it("no Lovable gateway, no Gemini, no direct provider fetch (code, comments aside)", () => {
    const code = fn.replace(/^\s*\/\/.*$/gm, "");
    expect(code).not.toMatch(/ai\.gateway\.lovable|gemini|LOVABLE_API_KEY|fetch\(/i);
    expect(code.length).toBeGreaterThan(500);
  });
  it("is recorded in the text chain policy", () => {
    const chain = JSON.parse(read("config/llm_routing.json")).paid_lanes[0].text_chain;
    expect(chain.applies_to).toMatch(/generate-quiz/);
  });
});

describe("quiz results reach Progress and the parent dashboard", () => {
  const persist = read("src/hooks/useActivityPersistence.ts");
  it("quiz and game rows carry the active child and the story title", () => {
    expect(persist).toMatch(/from\("quiz_attempts"\)\.insert\(\{\s*user_id: userId,\s*child_profile_id: childProfileId/);
    expect(persist).toMatch(/from\("game_sessions"\)\.insert\(\{\s*user_id: userId,\s*child_profile_id: childProfileId/);
    expect(persist).toMatch(/story_title: \(storyTitle && storyTitle\.trim\(\)\) \|\| null/);
  });
  it("the dashboard filters quizzes by that child", () => {
    expect(read("src/hooks/useChildProgressData.ts")).toMatch(/quizQuery\.eq\('child_profile_id', childProfileId\)/);
  });
  it("both quizzes save their result; neither builds its own request", () => {
    for (const f of ["src/components/ComprehensionQuiz.tsx", "src/components/VoiceQuiz.tsx"]) {
      const src = read(f);
      expect(src).toMatch(/saveQuizAttempt\(/);
      expect(src).toMatch(/loadStoryQuiz\(/);
      expect(src).not.toMatch(/functions\.invoke\('generate-quiz'/);
    }
  });
  it("the written quiz waits for the child: no auto-advance timer after an answer", () => {
    const src = read("src/components/ComprehensionQuiz.tsx");
    expect(src).not.toMatch(/setTimeout\(/);
    expect(src).toMatch(/handleNext/);
  });
});
