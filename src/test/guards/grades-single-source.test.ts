// Guard: Pre-K, K, 1st–10th and ages 3–15 come from ONE list,
// supabase/functions/_shared/grades.ts (re-exported by src/lib/grades.ts).
// Pickers, validators and mappings read it; a hand-written grade list, age list
// or age bound anywhere else (the old 3–11 / "6th Grade & Up" / "8" cut-offs)
// fails here, as does a grade missing from any mapping table.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import * as G from "../../../supabase/functions/_shared/grades";
import * as clientGrades from "@/lib/grades";
import { EXPERT_STORY_PROMPTS } from "../../../supabase/functions/_shared/storyPrompts";

const ROOT = join(__dirname, "../../..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      return ["node_modules", "_vendor", "template-testing", "__tests__", "test"].includes(name) ? [] : sourceFiles(full);
    }
    return /\.(ts|tsx|js|mjs)$/.test(name) ? [full] : [];
  });
}

// Dev-only testers are not product pickers; the shared module is the one allowed home.
const EXEMPT = /(Tester|\.test\.|_shared\/grades\.ts$|src\/lib\/grades\.ts$)/;

// Each pattern is a hand-written copy of the grade/age list or an old cut-off.
const FORBIDDEN: Array<[string, RegExp]> = [
  ["hand-written grade list", /\[\s*["'](?:PreK|Pre-K)["']\s*,\s*["']K["']/],
  ["hand-written expert grade list", /\[\s*["']6th["']\s*,\s*["']7th["']/],
  ["hand-written grade SelectItem", /<SelectItem\s+value=["'](?:PreK|K|[0-9]{1,2})["']/],
  ["hand-written age list", /\[\s*3\s*,\s*4\s*,\s*5\s*,\s*6\b/],
  ["hard-coded minimum age", /\bage\s*<\s*3\b/],
  ["old maximum age (11/12)", /\bage\s*>\s*1[12]\b/],
  ["old '11+' age option", /['"`]11\+['"` ]/],
  ["old '6th Grade & Up' option", /6th Grade & Up|6thPlus/],
  ["hard-coded expert range check", /\b(?:grade|gradeLevel|gradeNum|num)\s*>=\s*6\s*&&\s*\w+\s*<=\s*10\b/],
];

describe("grades and ages have one source of truth", () => {
  const files = [...sourceFiles(join(ROOT, "src")), ...sourceFiles(join(ROOT, "supabase/functions"))];

  it("scans a real tree", () => {
    expect(files.length).toBeGreaterThan(300);
  });

  it("no picker, validator or mapping keeps its own grade/age list", () => {
    const offenders = files
      .filter((f) => !EXEMPT.test(relative(ROOT, f)))
      .flatMap((f) => {
        const src = readFileSync(f, "utf8");
        return FORBIDDEN.filter(([, re]) => re.test(src)).map(([what]) => `${relative(ROOT, f)}: ${what}`);
      });
    expect(offenders).toEqual([]);
  });

  it("every picker reads the shared list", () => {
    const pickers: Array<[string, RegExp[]]> = [
      ["src/components/forms/steps/FormStep1Essential.tsx", [/GRADES\.map\(/, /AGES\.map\(/]],
      // Child add/edit form, header, lists and story form all show grades through childInfo.
      ["src/components/children/childInfo.ts", [/CHILD_GRADES[^=]*= GRADES\.map\(/, /CHILD_MIN_AGE = MIN_AGE/, /CHILD_MAX_AGE = MAX_AGE/, /normalizeGrade\(grade\)/]],
      ["src/components/children/ChildForm.tsx", [/CHILD_GRADES\.map\(/, /AGES\.map\(/, /normalizeGrade\(child\?\.grade_level\)/]],
      ["src/components/forms/hooks/useMultiStepForm.tsx", [/isValidAge\(formData\.age\)/]],
      ["src/constants/app.ts", [/GRADES as GRADE_LEVELS/]],
      ["src/types/index.ts", [/export type Grade = SharedGrade/]],
    ];
    for (const [file, patterns] of pickers) {
      const src = read(file);
      expect(src, `${file} imports src/lib/grades`).toMatch(/from ["']@\/lib\/grades["']/);
      for (const re of patterns) expect(src, `${file} ${re}`).toMatch(re);
    }
  });

  it("a child's grade and age are set only on the child (never on the grown-up's reading settings)", () => {
    const editor = read("src/components/PremiumProfileEditor.tsx");
    expect(editor).not.toMatch(/GRADES\.map\(|AGES\.map\(|htmlFor="grade"|htmlFor="age"/);
    expect(editor).toMatch(/Manage your children →/);
    // The reading level is per child (reading_grade on the story page), never one account-wide picker.
    expect(editor).not.toMatch(/htmlFor="difficulty"|Reading Ability/);
    expect(editor).toMatch(/Reading level: set for each child/);
  });

  it("the list is Pre-K, K, 1st–10th and ages 3–15", () => {
    expect([...G.GRADES]).toEqual(["PreK", "K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
    expect([G.MIN_AGE, G.MAX_AGE]).toEqual([3, 15]);
    expect([...G.AGES]).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(clientGrades.GRADES).toBe(G.GRADES);
  });

  it("normalizes every spelling to the stored value", () => {
    const cases: Array<[unknown, string | null]> = [
      ["PreK", "PreK"], ["Pre-K", "PreK"], ["pre-k", "PreK"], ["K", "K"], ["kindergarten", "K"],
      ["1", "1"], ["1st", "1"], ["first", "1"], ["Grade 7", "7"], ["10th", "10"], ["10th grade", "10"], [10, "10"],
      ["11", null], ["0", null], ["12th", null], ["", null], [undefined, null], ["6+", null],
    ];
    for (const [input, out] of cases) expect(G.normalizeGrade(input), String(input)).toBe(out);
    expect(G.gradeLabel("PreK")).toBe("Pre-K");
    expect(G.gradeLabel("K")).toBe("Kindergarten");
    expect(G.gradeLabel("K", "short")).toBe("K");
    expect(G.gradeLabel("10")).toBe("10th Grade");
    expect(G.gradeLabel("10", "short")).toBe("10th");
    expect(G.typicalGradeForAge(3)).toBe("PreK");
    expect(G.typicalGradeForAge(15)).toBe("10");
    for (const g of G.GRADES) expect(G.typicalGradeForAge(G.typicalAgeForGrade(g))).toBe(g);
  });

  it("every grade has an entry in every mapping table", () => {
    expect(Object.keys(G.GRADE_PROFILES).sort()).toEqual([...G.GRADES].sort());
    const fields: Array<keyof G.GradeProfile> = [
      "shortLabel", "longLabel", "typicalAge", "readingLevel", "difficulty", "vocabularyTier",
      "wordsPerPage", "maxSentenceWords", "sentenceComplexity", "voiceTier", "promptReadingLevel",
    ];
    for (const g of G.GRADES) {
      const p = G.GRADE_PROFILES[g];
      expect(p.grade).toBe(g);
      for (const f of fields) expect(p[f], `${g}.${f}`).not.toBeUndefined();
      expect(G.isValidAge(p.typicalAge), `${g} typical age`).toBe(true);
    }
    // 7th–10th are their own middle/high-school levels, never clamped to 6th.
    for (const g of ["7", "8", "9", "10"] as const) {
      expect(G.expertGradeForGrade(g)).toBe(`${g}th`);
      expect(G.GRADE_PROFILES[g].promptReadingLevel).toMatch(/school/);
    }
    expect(G.voiceTierForAge(15)).toBe("teen");
    // Every expert grade has its own prompt, and each prompt names its reader's age.
    for (const e of G.EXPERT_GRADES) {
      expect(EXPERT_STORY_PROMPTS[e], e).toBeDefined();
      expect(EXPERT_STORY_PROMPTS[e].systemPrompt).not.toMatch(/11\+ year old/);
    }
    // Every voice tier has a constraint entry in the voice catalog.
    const clamp = read("src/services/voiceCatalog/LevelClampingService.ts");
    for (const tier of new Set(Object.values(G.GRADE_PROFILES).map((p) => p.voiceTier))) {
      expect(clamp, `voice tier ${tier}`).toMatch(new RegExp(`\\b${tier}: \\{`));
    }
    // Every locale names every grade in the step-1 picker.
    for (const lang of readdirSync(join(ROOT, "src/i18n/locales")).filter((f) => /^[a-z]{2}\.json$/.test(f))) {
      const keys = JSON.parse(read(`src/i18n/locales/${lang}`)).formStep1?.grade ?? {};
      for (const g of G.GRADES) {
        const key = g === "PreK" ? "preK" : g === "K" ? "k" : G.gradeLabel(g, "short");
        expect(keys[key], `${lang} formStep1.grade.${key}`).toBeTruthy();
      }
    }
  });

  it("the server validators accept 10th grade and age 15, and reject 16 and 2", () => {
    expect(G.childFieldErrors({ age: 15, grade: "10", gradeLevel: "10" })).toEqual([]);
    expect(G.childFieldErrors({ age: 3, grade: "PreK" })).toEqual([]);
    expect(G.childFieldErrors({ grade: "Pre-K" })).toEqual([]);
    expect(G.childFieldErrors({})).toEqual([]);
    expect(G.childFieldErrors({ age: 16 })).toHaveLength(1);
    expect(G.childFieldErrors({ age: 2 })).toHaveLength(1);
    expect(G.childFieldErrors({ grade: "11" })).toHaveLength(1);
    expect(G.childFieldErrors({ gradeLevel: "6+" })).toHaveLength(1);
    // Both edge-function request schemas run that check on userInfo.
    const iv = read("supabase/functions/_shared/inputValidation.ts");
    expect(iv).toMatch(/import \{ childFieldErrors \} from "\.\/grades\.ts"/);
    expect(iv.match(/\.passthrough\(\)\.superRefine\(childFields\)/g)).toHaveLength(2);
    expect(read("supabase/functions/_shared/dto/user.ts")).toMatch(/isValidGrade\(g\)/);
  });
});
