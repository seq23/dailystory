// 26 Oct 2026, owner: "make sure the levels up and down work and the reading level
// changes on the next page". Before this: "Advanced" was a silent dead end, the next
// page was written from a stale context at the OLD level (and the page request did
// not carry a level at all), Backup Mode refused to change level, and the choice was
// saved on the grown-up's profile, not the child's.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { GRADES, type Grade } from "@/lib/grades";
import { readingStep, stepReadingGrade, startingReadingGrade, withReadingGrade } from "@/lib/readingLadder";

const ROOT = join(__dirname, "../../..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

describe("the ladder: one grade per tap, Pre-K to 10th", () => {
  it("walks every grade up from Pre-K and down from 10th, and stops (atEdge) at both ends", () => {
    let g: Grade = GRADES[0];
    const up: Grade[] = [g];
    for (;;) { const r = stepReadingGrade(g, "up"); if (r.atEdge) break; g = r.step.grade; up.push(g); }
    expect(up).toEqual([...GRADES]);
    expect(stepReadingGrade("10", "up")).toMatchObject({ atEdge: true, step: { grade: "10" } });
    expect(stepReadingGrade("PreK", "down")).toMatchObject({ atEdge: true, step: { grade: "PreK" } });
  });

  it("each step changes the badge text", () => {
    const labels = GRADES.map((g) => readingStep(g).label);
    expect(new Set(labels).size).toBe(GRADES.length);
    expect(readingStep("2").label).toBe("2nd grade");
  });

  it("a step sets the grade, reading level and expert level the story is written from", () => {
    expect(withReadingGrade({ name: "Aiden" }, "1")).toMatchObject({ grade: "1", gradeLevel: "1", difficultyLevel: "beginner", expertGradeLevel: undefined });
    expect(withReadingGrade({ name: "Aiden" }, "8")).toMatchObject({ grade: "8", difficultyLevel: "advanced", expertGradeLevel: "8th" });
  });

  it("starts at the child's saved reading grade, else their grade, else the nearest grade for the chosen level", () => {
    expect(startingReadingGrade({ readingGrade: "4", grade: "2" })).toBe("4");
    expect(startingReadingGrade({ grade: "2" })).toBe("2");
    const g = startingReadingGrade({ grade: "2", difficultyLevel: "independent" });
    expect(readingStep(g).readingLevel).toBe("independent");
  });
});

// The next page's request carries the new level (owner's check b).
const generateStory = vi.fn();
vi.mock("@/services/storyGenerationService", () => ({ StoryGenerationService: { generateStory: (...a: unknown[]) => generateStory(...a) } }));

describe("the next page is requested at the new level", () => {
  beforeEach(() => {
    generateStory.mockReset();
    generateStory.mockResolvedValue({ success: true, pages: ["Max looked at the moon. ".repeat(10)] });
  });

  it("easier and harder send different levels to the edge function", async () => {
    const { LiveGenerationService } = await import("@/services/LiveGenerationService");
    const base = { storyContext: ["Page one."], currentPage: 1, totalExpectedPages: 10, characters: ["Aiden"] };
    const easier = withReadingGrade({ name: "Aiden", age: 7 } as any, "1");
    const harder = withReadingGrade({ name: "Aiden", age: 7 } as any, "8");
    await LiveGenerationService.generateNextPage({ ...base, userInfo: easier, difficulty: easier.difficultyLevel } as any, undefined, false, "s1");
    await LiveGenerationService.generateNextPage({ ...base, userInfo: harder, difficulty: harder.difficultyLevel, expertGradeLevel: "8th" } as any, undefined, false, "s2");
    const [[uEasy, cEasy], [uHard, cHard]] = generateStory.mock.calls as any[];
    expect(cEasy.difficulty).toBe("easy");
    expect(uEasy).toMatchObject({ grade: "1", difficultyLevel: "beginner" });
    expect(cHard.difficulty).toBe("expert");
    expect(cHard.expertGradeLevel).toBe("8th");
    expect(uHard).toMatchObject({ grade: "8", difficultyLevel: "advanced" });
  });
});

describe("the story page wiring", () => {
  const page = read("src/components/CleanStoryDisplay.tsx");
  const handler = page.slice(page.indexOf("const handleDifficultyChange = async"), page.indexOf("// Get difficulty-based text configuration"));

  it("the buttons step the ladder and the level lives in a ref every generation reads", () => {
    expect(handler).toMatch(/stepReadingGrade\(from\.grade, direction\)/);
    expect(handler).toMatch(/levelRef\.current = step;/);
    expect(handler).not.toMatch(/currentDifficulty === 'expert'/); // the old dead branch
    expect(page).toMatch(/const baseContext = liveContextRef\.current \?\? liveContext;/);
    expect(page).toMatch(/userInfo: atCurrentLevel\(baseContext\.userInfo\)/);
    expect((page.match(/atCurrentLevel\(\{/g) || []).length).toBeGreaterThanOrEqual(3); // first page, new story, refresh
    expect(page).not.toMatch(/difficultyLevel: currentDifficulty,\n\s*expertGradeLevel: currentDifficulty === 'expert'/);
  });

  it("at either end the tap says so; the buttons are never silently disabled there", () => {
    expect(handler).toMatch(/Already at the hardest level/);
    expect(handler).toMatch(/Already at the easiest level/);
    expect(page).toMatch(/canIncrease=\{!lockDifficulty\}/);
    expect(page).toMatch(/canDecrease=\{!lockDifficulty\}/);
    expect(page).toMatch(/levelLabel=\{readingStep\(readingGrade\)\.label\}/);
    // fallback is a grade too, never an old level name
    expect(read("src/components/ResponsiveStoryHeader.tsx")).toMatch(/levelLabel \?\? readsAtLabel\(null, currentDifficulty\)/);
    expect(read("src/components/ResponsiveStoryHeader.tsx")).not.toMatch(/getDisplayName\(currentDifficulty\)/);
  });

  it("Backup Mode changes level too: a new story at the new level", () => {
    expect(handler).not.toMatch(/difficulty adjustments aren't available/);
    expect(handler).toMatch(/if \(inBackupMode \|\| !isPremium\) \{[\s\S]*?handleGenerateNewStory\(\);/);
  });

  it("the choice is kept on the child", () => {
    expect(handler).toMatch(/await onReadingGradeChange\(step\.grade\)/);
    expect(read("src/components/PremiumMyStoriesView.tsx")).toMatch(/onReadingGradeChange=\{activeChild \? \(grade\) => setChildReadingGrade\(activeChild\.id, grade\)/);
    expect(read("src/hooks/useChildProfiles.ts")).toMatch(/update\(\{ reading_grade: readingGrade \}/);
    const mig = readdirSync(join(ROOT, "supabase/migrations")).find((f) => f.endsWith("_child_reading_grade.sql"));
    expect(mig).toBeTruthy();
    for (const g of GRADES) expect(read(`supabase/migrations/${mig}`)).toContain(`'${g}'`);
  });
});
