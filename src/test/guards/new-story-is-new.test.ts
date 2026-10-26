// Guard (26 Oct 2026): "New Story" from My Stories restored the last live story from the
// resume-on-refresh cache, so a child asking for a new story got the old one again.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const src = readFileSync(join(__dirname, "../../..", "src/components/PremiumMyStoriesView.tsx"), "utf8");

describe("a new story request starts a new story", () => {
  it("clears the cached live story before opening the reading page", () => {
    const submit = src.indexOf("onSubmit={async (composed) => {");
    const clear = src.indexOf("StorySessionCache.clearOnNextStory(id)", submit);
    const open = src.indexOf("setCurrentView('reading')", submit);
    expect(submit).toBeGreaterThan(0);
    expect(clear).toBeGreaterThan(submit);
    expect(open).toBeGreaterThan(clear);
  });
});
