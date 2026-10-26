// Guard (owner, 26 Oct 2026): every word the parent types in "Any words to practice?"
// appears in the story (exact or a simple inflection), each one, every time; a miss is
// retried, and as a last resort woven in (Backup Mode too); the words are highlighted in
// the story and used by that story's quiz.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  practiceWordsFromRequest, practiceWordsPromptLine, practiceWordsFromPrompt,
  hasPracticeWord, missingPracticeWords, weaveMissingWords, practiceWordsRequired,
} from "../../../supabase/functions/_shared/practiceWords";
import { finalizeQuiz, quizShapeForGrade } from "../../../supabase/functions/_shared/quiz";

const ROOT = join(__dirname, "../../..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

describe("the words travel from the dialog to the prompt and back", () => {
  it("the dialog's composed text → words → the prompt line → the server reads the same words", () => {
    expect(read("src/components/SpecialRequestDialog.tsx")).toMatch(/Target vocabulary: \$\{vocab\}/);
    const words = practiceWordsFromRequest("A dragon story\nTarget vocabulary: brave, Whisper, carry");
    expect(words).toEqual(["brave", "whisper", "carry"]);
    expect(practiceWordsFromPrompt(`Make a story.\n${practiceWordsPromptLine(words)}\nCharacter Info: {}`)).toEqual(words);
  });
  it("the client prompt carries the line; the story function reads it", () => {
    const gen = read("src/services/storyGenerationService.ts");
    expect(gen).toMatch(/const practiceLine = practiceWordsPromptLine\(\[\s*\.\.\.vocabularyIntegration\.userSpecified\.formWords,\s*\.\.\.vocabularyIntegration\.userSpecified\.specialRequestWords,/);
    expect(gen).toMatch(/\$\{practiceLine \?/);
    const h = read("supabase/functions/generate-adaptive-story/streamlined-handler.ts");
    expect(h).toMatch(/const practice = practiceWordsFromPrompt\(enhancedUserPrompt\);/);
  });
});

describe("checking, retrying, weaving", () => {
  it("exact words and simple inflections count; others do not", () => {
    for (const [w, t] of [["carry", "she carried it"], ["run", "running fast"], ["brave", "the bravest"], ["jump", "jumps"], ["bake", "baking"], ["happy", "happily"]]) {
      expect(hasPracticeWord(t, w)).toBe(true);
    }
    expect(hasPracticeWord("the cart", "car")).toBe(false);
    expect(missingPracticeWords("A brave fox.", ["brave", "whisper"])).toEqual(["whisper"]);
  });
  it("the last resort never drops a word, and keeps the page break", () => {
    const out = weaveMissingWords("Page one.\n***\nPage two.\n***", ["whisper", "lantern"]);
    expect(missingPracticeWords(out, ["whisper", "lantern"])).toEqual([]);
    expect(out.trim().endsWith("***")).toBe(true);
  });
  it("a whole story or the ending page needs all; a live page carries its share", () => {
    expect(practiceWordsRequired(4, { wholeStory: true })).toBe(4);
    expect(practiceWordsRequired(4, { wholeStory: false, endingPage: true })).toBe(4);
    expect(practiceWordsRequired(4, { wholeStory: false, difficulty: "beginner" })).toBe(1);
    expect(practiceWordsRequired(4, { wholeStory: false, difficulty: "medium" })).toBe(3);
  });
  it("the story function retries once naming the missing words, then weaves them in", () => {
    const h = read("supabase/functions/generate-adaptive-story/streamlined-handler.ts");
    expect(h).toMatch(/if \(!practiceRetried && attempt < maxAttempts\) \{[\s\S]{0,400}Use EACH of these words in the story, spelled exactly[\s\S]{0,200}continue;/);
    expect(h).toMatch(/storyText = weaveMissingWords\(storyText, missing\.slice\(0, required - used\)\);/);
    expect(h).toMatch(/if \(!storyText\?\.trim\(\) && practiceFallbackText\) \{/);
  });
  it("Backup Mode stories carry them too", () => {
    const t = read("supabase/functions/template-service/index.ts");
    expect(t).toMatch(/actualPages = withPracticeWords\(actualPages, userInfo\);/);
    expect((t.match(/pages: withPracticeWords\(result\.pages, userInfo\)/g) ?? []).length).toBe(2);
  });
});

describe("shown and quizzed", () => {
  it("highlighted in the story (still tappable like every word)", () => {
    expect(read("src/utils/unifiedTextProcessor.tsx")).toMatch(/practice-word/);
    expect((read("src/components/CleanStoryDisplay.tsx").match(/practiceWords,\n/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });
  it("the story's quiz asks about a practice word that is in the story", () => {
    const story = "Mia was brave. She held the lantern high and walked into the dark cave. The bats flew out and Mia laughed. Then she went home for dinner with her dad.";
    for (const g of ["2", "5", "9"]) {
      const shape = quizShapeForGrade(g, undefined, 1, ["lantern"]);
      const { questions } = finalizeQuiz(null, story, shape);
      expect(questions.some((q) => (q.skill === "word-meaning" || q.skill === "spelling") && (q.question.includes("lantern") || q.options.includes("lantern")))).toBe(true);
    }
    expect(read("src/pages/SessionEnded.tsx")).toMatch(/practiceWords=\{lastRead\?\.practiceWords \?\? \[\]\}/);
  });
});
