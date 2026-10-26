// Guard (owner decision, 26 Oct 2026): each child carries exactly two visible things,
// both grades: "School grade" (grade_level: topics and themes) and "Reads at"
// (reading_grade: how hard the words are). The old level words (Pre-Reader … Advanced,
// Easy … Expert) stay internal; no product screen shows them. docs/reading-levels.md.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { storyAudienceLine } from "@/lib/grades";
import { readsAtLabel, storyGrades } from "@/lib/readingLevelMap";
import { withReadingGrade } from "@/lib/readingLadder";

const ROOT = join(__dirname, "../../..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

function tsx(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return ["template-testing", "testing", "__tests__", "test"].includes(name) ? [] : tsx(full);
    return /\.tsx$/.test(name) ? [full] : [];
  });
}
// Internal tools (prompt studio, testers, style preview, template testing) are not family screens.
const INTERNAL = /(Tester|PromptStudio|AudioE2ETestingPanel|StylePreview|TemplateTestingPage|PromptTesting|SystemDocumentation|Diagnostic|Debug|VoiceAdmin|VoiceCatalog)/;
const WORD = "(?:Pre-?Reader|Pre‑Reader|Beginner|Developing|Independent|Advanced|Easy|Medium|Hard|Expert)";
const RENDERED: Array<[string, RegExp]> = [
  ["level word as element text", new RegExp(`>\\s*${WORD}\\s*<`)],
  ["level word as a t() fallback label", new RegExp(`t\\(\\s*["'][\\w.]+["']\\s*,\\s*["']${WORD}["']`)],
  ["level word in a label/title string", new RegExp(`(?:label|title|name|displayName):\\s*["']${WORD}["']`)],
  ["\"Advanced — 6th\" style option", /Advanced — /],
  ["level name lookup rendered", /DifficultyLevelMapper\.getDisplayName\(/],
  ["raw story level rendered", /\{story\.difficulty\}/],
];

export function renderedLevelWords(src: string): string[] {
  return RENDERED.filter(([, re]) => re.test(src)).map(([w]) => w);
}

describe("no old level words on any family screen", () => {
  const files = [...tsx(join(ROOT, "src/components")), ...tsx(join(ROOT, "src/pages"))].filter((f) => !INTERNAL.test(f));
  it("scans the real screens", () => expect(files.length).toBeGreaterThan(100));
  it("the detector catches each form", () => {
    expect(renderedLevelWords(`<SelectItem value="easy">Easy</SelectItem>`)).toHaveLength(1);
    expect(renderedLevelWords(`label: t("readingLevels.beginner.title", "Beginner")`)).toHaveLength(1);
    expect(renderedLevelWords(`<Badge>{story.difficulty}</Badge>`)).toHaveLength(1);
    expect(renderedLevelWords(`<span>Hard work pays off</span>`)).toHaveLength(0);
  });
  it("none found", () => {
    const offenders = files.flatMap((f) => renderedLevelWords(readFileSync(f, "utf8")).map((w) => `${relative(ROOT, f)}: ${w}`));
    expect(offenders).toEqual([]);
  });
});

describe("Reads at: a picker on the child form, saved per child", () => {
  const form = read("src/components/children/ChildForm.tsx");
  const hook = read("src/hooks/useChildProfiles.ts");
  it("the form has School grade AND Reads at, Reads at following the school grade until picked", () => {
    expect(form).toMatch(/legend="School grade"/);
    expect(form).toMatch(/legend="Reads at"/);
    expect(form).toMatch(/testIdPrefix="child-reads-at"/);
    expect(form).toMatch(/if \(!readsAtChosen\) setReadsAt\(g\);/);
    expect(form).toMatch(/reading_grade: readsAt \|\| grade,/);
  });
  it("adding and editing a child write reading_grade", () => {
    expect(hook).toMatch(/reading_grade: normalizeGrade\(input\.reading_grade\) \?\? normalizeGrade\(input\.grade_level\) \?\? null,/);
    expect(hook).toMatch(/\.\.\.\(input\.reading_grade !== undefined \? \{ reading_grade: normalizeGrade\(input\.reading_grade\) \} : \{\}\)/);
  });
  it("the children list shows both", () => {
    expect(read("src/components/children/childInfo.ts")).toMatch(/`Reads at \$\{reads\}`/);
  });
  it("the first-run form asks Reads at as a grade", () => {
    const step = read("src/components/forms/steps/FormStep2ReadingPrefs.tsx");
    expect(step).toMatch(/data-testid="form-reads-at"/);
    expect(step).toMatch(/GRADES\.map\(\(g\) =>/);
    expect(read("src/components/forms/hooks/useMultiStepForm.tsx")).toMatch(/readingGrade: readsAt,\s*schoolGrade: formData\.grade,/);
  });
  it("Never easier than is a grade", () => {
    expect(read("src/components/ParentDashboard.tsx")).toMatch(/>Never easier than</);
  });
});

describe("words from Reads at, themes from the child's real age", () => {
  it("a 5-year-old reading at 10th grade: 10th-grade words, themes for a 5-year-old", () => {
    const line = storyAudienceLine({ age: 5, readsAt: "10", schoolGrade: "K" });
    expect(line).toMatch(/WORDS: .*10th grade/);
    expect(line).toMatch(/THEMES: the reader is 5 years old \(Kindergarten at school\); .*right for a 5-year-old/);
  });
  it("the story prompt carries that line, built from the child's age and school grade", () => {
    const gen = read("src/services/storyGenerationService.ts");
    expect(gen).toMatch(/const audienceLine = storyAudienceLine\(\{\s*age: userInfo\.age,\s*readsAt: userInfo\.readingGrade \?\? essentialUserInfo\.gradeLevel,\s*schoolGrade: userInfo\.schoolGrade,/);
    expect(gen).toMatch(/\$\{mainCharacterPrompt\}\n\n\$\{audienceLine\}/);
    const view = read("src/components/PremiumMyStoriesView.tsx");
    expect(view).toMatch(/const age = childAge\(activeChild\) \?\? userInfo\.age;/);
    expect(view).toMatch(/schoolGrade: normalizeGrade\(activeChild\.grade_level\)/);
  });
  it("the ladder keeps the school grade when grade becomes the Reads-at grade", () => {
    const out = withReadingGrade({ grade: "K" as const, age: 5 }, "10");
    expect(out).toMatchObject({ grade: "10", readingGrade: "10", schoolGrade: "K" });
  });
});

describe("saved stories show the grade they were written at", () => {
  it("new saves store reading_grade; cards say Reads at …; old saves show their band", () => {
    expect(read("src/components/CleanStoryDisplay.tsx")).toMatch(/readingGrade: levelRef\.current\.grade,/);
    expect(read("src/services/premiumStoryManager.ts")).toMatch(/reading_grade: \(story as \{ readingGrade\?: string \}\)\.readingGrade \?\? null,/);
    expect(readsAtLabel("3")).toBe("Reads at 3rd grade");
    expect(readsAtLabel(null, "developing")).toBe("Reads at 3rd–4th grade");
    expect(readsAtLabel(null, "pre-reader")).toBe("Reads at Pre-K–K");
    expect(storyGrades(null, "advanced")).toEqual(["6", "7", "8", "9", "10"]);
    const lib = read("src/components/PremiumStoryLibrary.tsx");
    expect(lib).toMatch(/readsAtLabel\(story\.readingGrade, story\.difficulty\)/);
    expect(lib).toMatch(/Reads at: any grade/);
  });
  it("the migration is additive and normalizes stored values", () => {
    const m = read("supabase/migrations/20261026233000_reads_at.sql");
    expect(m).toMatch(/add column if not exists reading_grade text/);
    expect(m).toMatch(/set grade_level = 'PreK'/);
    expect(m).toMatch(/'minReadingGrade'/);
    expect(m).not.toMatch(/\bdrop\b|\bdelete\b|alter column/i);
  });
});
