// Guard (26 Oct 2026, owner: "reading levels in the backend are diff than front end —
// there should have been a map in the docs"). Reads docs/reading-levels.md AND the one
// module (supabase/functions/_shared/grades.ts via src/lib/readingLevelMap.ts):
//   - the doc table must equal the module, row for row;
//   - every converter the doc cites must still sit on the cited line;
//   - no file may hand-write a level list (array, union type, Set or mapping table);
//   - the two "beginner"s convert the right way, and the server reads an
//     already-converted config.difficulty backend-first (Pre-K/K stories were being
//     written at 1st–2nd grade).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ALL_LEVEL_COMBOS,
  LEVEL_MAP,
  normalizeStoredLevel,
  READING_LEVELS,
  BACKEND_DIFFICULTIES,
  QUIZ_BANDS,
  QUIZ_SKILLS,
  quizSkillPlan,
} from "@/lib/readingLevelMap";
import {
  backendDifficultyOf,
  frontendLevelToDifficulty,
  minimumGradeForGuardrail,
  GRADES,
} from "@/lib/grades";
import { DifficultyLevelMapper as ClientMapper } from "@/services/DifficultyLevelMapper";
import { DifficultyLevelMapper as EdgeMapper } from "../../../supabase/functions/_shared/DifficultyLevelMapper";

const ROOT = join(__dirname, "../../..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const doc = read("docs/reading-levels.md");

const section = (name: string) => {
  const m = doc.match(new RegExp(`<!-- ${name}:start -->([\\s\\S]*?)<!-- ${name}:end -->`));
  if (!m) throw new Error(`docs/reading-levels.md has no ${name} section`);
  return m[1].split("\n").filter((l) => /^\|/.test(l) && !/^\|\s*-/.test(l)).slice(1)
    .map((l) => l.split("|").slice(1, -1).map((c) => c.trim()));
};

describe("the doc table is the module", () => {
  const rows = section("level-map");
  it("one row per grade, in order", () => {
    expect(rows.map((r) => r[0])).toEqual([...GRADES]);
  });
  it("every cell equals the module", () => {
    expect(rows).toEqual(LEVEL_MAP.map((r) => [r.grade, r.gradeLabel, r.readingLevel, r.difficulty, r.expertGrade ?? "—", r.promptReadingLevel]));
  });
  it("the doc states the combination count the module exports", () => {
    expect(ALL_LEVEL_COMBOS).toHaveLength(GRADES.length);
    expect(doc).toContain(`**${ALL_LEVEL_COMBOS.length} combinations**`);
  });
});

describe("the quiz band table in the doc is the module", () => {
  it("one row per band, every cell equal, every grade in exactly one band, slots add up", () => {
    const rows = section("quiz-bands");
    expect(rows).toEqual(QUIZ_BANDS.map((b) => [
      b.id, b.grades.join(", "), String(b.questions),
      b.choices.min === b.choices.max ? String(b.choices.min) : `${b.choices.min}–${b.choices.max}`,
      b.pictures ? "yes" : "no", b.readAloud,
      QUIZ_SKILLS.filter((s) => b.slots[s]).map((s) => `${s} ${b.slots[s]}`).join(", "),
      b.sometimes.join(", ") || "—",
    ]));
    expect(QUIZ_BANDS.flatMap((b) => b.grades)).toEqual([...GRADES]);
    for (const b of QUIZ_BANDS) {
      expect(Object.values(b.slots).reduce((x, y) => x + (y ?? 0), 0)).toBe(b.questions);
      for (const g of b.grades) for (let seed = 0; seed < 12; seed++) expect(quizSkillPlan(g, seed)).toHaveLength(b.questions);
    }
  });
  it("the owner's plan: 3 · 4 · 5 · 6 · 7 · 8 questions; Pre-K–K 2 picture choices read aloud", () => {
    expect(QUIZ_BANDS.map((b) => b.questions)).toEqual([3, 4, 5, 6, 7, 8]);
    expect(QUIZ_BANDS[0]).toMatchObject({ choices: { min: 2, max: 2 }, pictures: true, readAloud: "always" });
    expect(QUIZ_BANDS[1].readAloud).toBe("always");
    // sometimes-skills really rotate in for some stories
    const seen = new Set(Array.from({ length: 12 }, (_, seed) => quizSkillPlan("2", seed).join()));
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe("every converter the doc cites is on its line", () => {
  const cites = section("converters");
  it("cites at least the core converters", () => {
    expect(cites.length).toBeGreaterThanOrEqual(15);
  });
  for (const [where, symbol] of section("converters")) {
    it(`${where} holds ${symbol}`, () => {
      const [file, line] = where.split(":");
      const text = read(file).split("\n")[Number(line) - 1] ?? "";
      expect(text).toContain(symbol);
    });
  }
});

describe("the combinations a story can be written at", () => {
  it("each grade has its own combination; config + bundle tell every grade apart", () => {
    const keys = ALL_LEVEL_COMBOS.map((c) => JSON.stringify([c.edgeConfig, c.bundleGradeLevel]));
    expect(new Set(keys).size).toBe(GRADES.length);
  });
  it("every guardrail minimum lands on exactly one combination", () => {
    const all = ALL_LEVEL_COMBOS.flatMap((c) => c.guardrailMinimums);
    expect(all).toHaveLength(BACKEND_DIFFICULTIES.length - 1 + 5);
  });
  it("6th–10th send their expert sub-level; below 6th none", () => {
    for (const c of ALL_LEVEL_COMBOS) expect(Boolean(c.edgeConfig.expertGradeLevel)).toBe(c.difficulty === "expert");
  });
});

describe("the two 'beginner's", () => {
  it("frontend beginner (1st–2nd) → easy; backend beginner (Pre-K/K) stays beginner", () => {
    expect(frontendLevelToDifficulty("beginner")).toBe("easy");
    expect(backendDifficultyOf("beginner")).toBe("beginner");
    expect(frontendLevelToDifficulty("pre-reader")).toBe("beginner");
    expect(backendDifficultyOf("advanced")).toBe("expert");
  });
  it("both mappers agree with the module", () => {
    for (const M of [ClientMapper, EdgeMapper]) {
      for (const l of READING_LEVELS) expect(M.toBackend(l)).toBe(frontendLevelToDifficulty(l));
      for (const d of BACKEND_DIFFICULTIES) expect(M.fromBackendValue(d)).toBe(d);
    }
  });
  it("the story function and the template service read config.difficulty backend-first", () => {
    expect(read("supabase/functions/generate-adaptive-story/streamlined-handler.ts"))
      .toMatch(/effectiveDifficulty = DifficultyLevelMapper\.fromBackendValue\(originalDifficulty\)/);
    expect(read("supabase/functions/template-service/index.ts")).toMatch(/DifficultyLevelMapper\.fromBackendValue\(difficulty\)/);
  });
  it("guardrails compare as grades, and the picker converts both ways", () => {
    expect(minimumGradeForGuardrail("beginner")).toBe("PreK");
    expect(minimumGradeForGuardrail("medium")).toBe("3");
    expect(minimumGradeForGuardrail("expert", "8th")).toBe("8");
    const page = read("src/components/CleanStoryDisplay.tsx");
    expect(page).not.toMatch(/difficultyLevels\.indexOf/);
    expect(page).toMatch(/gradeIndex\(step\.grade\) < gradeIndex\(minimumGradeForGuardrail\(minDifficulty, minExpertGrade\)\)/);
    const dash = read("src/components/ParentDashboard.tsx");
    expect(dash).not.toMatch(/DifficultyLevelMapper\.normalizeLevel\(guardrails\.minDifficulty\)/);
  });
  it("stored legacy values resolve to a grade", () => {
    expect(normalizeStoredLevel("profiles.difficulty_level", "easy")).toBe("1");
    expect(normalizeStoredLevel("profiles.reading_level", "beginner")).toBe("1");
    expect(normalizeStoredLevel("profiles.reading_level", "pre-reader")).toBe("PreK");
    expect(normalizeStoredLevel("child_profiles.grade_level", "Grade 10")).toBe("10");
    expect(normalizeStoredLevel("user_preferences.reading_preferences.minDifficulty", "beginner")).toBe("PreK");
    expect(normalizeStoredLevel("user_preferences.reading_preferences.minDifficulty", undefined)).toBe("PreK");
    expect(normalizeStoredLevel("profiles.reading_level", "elementary")).toBeNull();
  });
});

// ── no hand-written level list anywhere else ──────────────────────────────────

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      return ["node_modules", "_vendor", "template-testing", "__tests__", "test"].includes(name) ? [] : sourceFiles(full);
    }
    return /\.(ts|tsx|js|mjs)$/.test(name) ? [full] : [];
  });
}
// Dev-only testers are not product code (same rule as grades-single-source); the module is the one home.
const EXEMPT = /(Tester|\.test\.|_shared\/grades\.ts$|voiceCatalog\/test\.ts$)/;
const FE = new Set<string>(READING_LEVELS);
const BE = new Set<string>(BACKEND_DIFFICULTIES);

/** Level lists in a source: arrays / Sets and string unions naming ≥4 of one vocabulary. */
export function levelLists(src: string): string[] {
  const hits: string[] = [];
  const check = (lits: string[], what: string) => {
    const fe = new Set(lits.filter((x) => FE.has(x))).size;
    const be = new Set(lits.filter((x) => BE.has(x))).size;
    if (fe >= 4 || be >= 4) hits.push(`${what}: ${[...new Set(lits)].join(",")}`);
  };
  for (const m of src.matchAll(/\[[^[\]]{0,600}\]/g)) check([...m[0].matchAll(/['"`]([a-z-]+)['"`]/g)].map((x) => x[1]), "list");
  for (const m of src.matchAll(/(?:['"][a-z-]+['"]\s*\|\s*){3,}['"][a-z-]+['"]/g)) check([...m[0].matchAll(/['"]([a-z-]+)['"]/g)].map((x) => x[1]), "union");
  // a frontend↔backend mapping table ({ backend: "easy", frontend: "beginner" })
  if (/frontend:\s*['"](?:pre-reader|developing|independent)['"]/.test(src)) hits.push("mapping table");
  return hits;
}

describe("no file keeps its own level list", () => {
  const files = [...sourceFiles(join(ROOT, "src")), ...sourceFiles(join(ROOT, "supabase/functions"))];
  it("scans a real tree", () => expect(files.length).toBeGreaterThan(300));
  it("the detector catches a hand-written list, union and mapping table", () => {
    expect(levelLists(`const x = ['beginner', 'easy', 'medium', 'hard', 'expert'];`)).toHaveLength(1);
    expect(levelLists(`type D = "pre-reader" | "beginner" | "developing" | "independent";`)).toHaveLength(1);
    expect(levelLists(`{ backend: "medium", frontend: "developing" }`)).toHaveLength(1);
    expect(levelLists(`type W = 'easy' | 'medium' | 'hard';`)).toHaveLength(0); // word difficulty, a different scale
  });
  it("only the module lists the levels", () => {
    const offenders = files
      .filter((f) => !EXEMPT.test(relative(ROOT, f)))
      .flatMap((f) => levelLists(readFileSync(f, "utf8")).map((h) => `${relative(ROOT, f)}: ${h}`));
    expect(offenders).toEqual([]);
  });
  it("the duplicate .js mapper is gone", () => {
    expect(() => read("supabase/functions/_shared/DifficultyLevelMapper.js")).toThrow();
  });
});
