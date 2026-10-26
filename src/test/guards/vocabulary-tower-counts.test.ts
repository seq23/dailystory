// Guard (26 Oct 2026): the reading page and GameContextProvider each ran their own useGamification.
// A saved word bumped the provider's copy; the towers read the page's copy, so Vocabulary stayed 0
// ("two components each keeping their own list").
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (rel: string) => readFileSync(join(__dirname, "../../..", rel), "utf8");

describe("a saved word counts in the Vocabulary tower", () => {
  it("the reading page hands its own counter to the provider", () => {
    const page = read("src/components/CleanStoryDisplay.tsx");
    expect(page).toMatch(/<GameContextProvider[\s\S]{0,300}onVocabularyWord=\{addVocabularyWord\}/);
    expect(page).toMatch(/vocabularyLearned=\{userStats\.vocabularyWordsLearned/);
  });
  it("the provider wires the global save-word hook to that counter", () => {
    expect(read("src/components/GameContextProvider.tsx")).toMatch(
      /setupGamificationGlobals\(onVocabularyWord \?\? gamificationHook\.addVocabularyWord/,
    );
  });
});
