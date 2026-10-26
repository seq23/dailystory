// Guard (26 Oct 2026, seen live on time-2-read.com after a Premium timer ran out):
// the session-ended page said "Missing story data" (quiz and games dead), "Words Read
// 0" after a page was read, and "Reading Level / Level" instead of the child's level;
// and a timer running out while a new story was being written ended the session and
// dropped that story.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { loadLastReadStory, readingProgress, saveLastReadStory, LAST_READ_STORY_KEY } from "@/lib/lastReadStory";

const ROOT = join(__dirname, "../../..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const page = read("src/components/CleanStoryDisplay.tsx");
const ended = read("src/pages/SessionEnded.tsx");

describe("the story read is kept for the session-ended page", () => {
  beforeEach(() => sessionStorage.clear());

  it("an empty story never replaces the one the child read", () => {
    saveLastReadStory({ text: "The fox ran home before the rain came down.", title: "Fox", pagesRead: 1, wordsRead: 9 });
    saveLastReadStory({ text: "", title: "", pagesRead: 0, wordsRead: 0 });
    expect(loadLastReadStory()?.text).toMatch(/fox ran home/);
    expect(sessionStorage.getItem(LAST_READ_STORY_KEY)).toBeTruthy();
  });

  it("pages reached and the words on them", () => {
    expect(readingProgress(["one two three", "four five"], 0)).toEqual({ pagesRead: 1, wordsRead: 3 });
    expect(readingProgress(["one two three", "four five"], 5)).toEqual({ pagesRead: 2, wordsRead: 5 });
    expect(readingProgress([], 0)).toEqual({ pagesRead: 0, wordsRead: 0 });
  });

  it("the reading page records the story as it is read and on End Session", () => {
    expect(page).toMatch(/useEffect\(\(\) => \{\s*if \(!displayedStory\.length\) return;\s*const progress = readingProgress\(displayedStory, currentPage\);\s*saveLastReadStory\(/);
    const end = page.indexOf("const handleEndSession = async () => {");
    expect(page.indexOf("saveLastReadStory(", end)).toBeGreaterThan(end);
  });

  it("session-ended falls back to it for the quiz and games", () => {
    expect(ended).toMatch(/const lastRead = loadLastReadStory\(\);\s*if \(!storyText && lastRead\) storyText = lastRead\.text;/);
  });
});

describe("words read and the level card", () => {
  it("End Session counts the words on the pages reached (the old counters were never incremented)", () => {
    const end = page.slice(page.indexOf("const handleEndSession = async () => {"));
    expect(end).toMatch(/const progress = readingProgress\(displayedStory, currentPage\);/);
    expect(end).toMatch(/const totalWordsRead = Math\.max\(sessionWordsRead, progress\.wordsRead\);/);
  });
  it("the stats carry the level and grade the child ended on", () => {
    expect(page).toMatch(/currentDifficulty: levelRef\.current\.readingLevel,\s*readingGrade: levelRef\.current\.grade,/);
  });
  it("the card shows the level from @/lib/grades, never the placeholder when a level is known", () => {
    expect(ended).toMatch(/\{endLevel \? getDifficultyLabel\(endLevel\) : t\("sessionEnded\.readingLevel"/);
    // the old hand-written switch mapped "easy" to Pre-Reader
    expect(ended).not.toMatch(/case "easy": return/);
  });
  it("the quiz is offered at every reading level (no frontend/backend 'beginner' block)", () => {
    expect(ended).not.toMatch(/currentDifficulty !== 'beginner'/);
  });
});

describe("a timer running out while a new story is written does not drop it", () => {
  it("End Session with no pages yet and a story loading starts a fresh session instead", () => {
    const end = page.slice(page.indexOf("const handleEndSession = async () => {"), page.indexOf("const handleEndSession = async () => {") + 600);
    expect(end).toMatch(/if \(displayedStory\.length === 0 && isLoading\) \{[\s\S]*setTimeRemaining\(20 \* 60\);\s*return;/);
  });
});
