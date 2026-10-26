// Guard (26 Oct 2026): re-opening a library story and saving it again added a second entry,
// retitled with the parent's name. saveStory now updates the entry whose content.id matches.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const src = readFileSync(join(__dirname, "../../..", "src/services/premiumStoryManager.ts"), "utf8");

describe("saving a story that is already in the library", () => {
  it("looks the story up by content id before inserting", () => {
    const lookup = src.indexOf(".eq('content->>id', storyKey)");
    const insert = src.indexOf(".insert(savedStoryData)");
    expect(lookup).toBeGreaterThan(0);
    expect(insert).toBeGreaterThan(lookup);
  });
  it("updates that entry and keeps its title", () => {
    expect(src).toMatch(/existing\s*\?\s*await supabase\s*\.from\('saved_stories'\)\s*\.update\(\{ \.\.\.savedStoryData, title: existing\.title/);
  });
});
