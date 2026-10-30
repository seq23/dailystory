// Guard (26 Oct 2026): a story opened from the library was retitled "<parent>'s Live Adventure"
// and had new pictures drawn for it on every open.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const src = readFileSync(join(__dirname, "../../..", "src/components/CleanStoryDisplay.tsx"), "utf8");

describe("a library story opens as it was saved", () => {
  it("My Stories marks saved content before opening the reader", () => {
    const myStories = readFileSync(join(__dirname, "../../..", "src/components/PremiumMyStoriesView.tsx"), "utf8");
    expect(myStories).toContain('setCurrentStory({ ...story, isFromSavedStory: true })');
  });
  it("every live-title assignment keeps a saved story's own title", () => {
    expect(src).not.toMatch(/setStoryTitle\(`\$\{safeUserInfo\.name\}'s Live Adventure`\)/);
    expect(src).toMatch(/currentStory\?\.isFromSavedStory && currentStory\?\.title \? currentStory\.title : `\$\{safeUserInfo\.name\}'s Live Adventure`/);
  });
  it("the automatic picture step skips a page that already has a saved picture", () => {
    expect(src).toMatch(/!pageImages\[currentPage\] && !savedPicture && displayedStory/);
  });
});
