// Phase 8 part two (31 Oct 2026): a linked app profile's reading flows into the class view
// as source "app", kept apart from teacher-recorded evidence. The database half is proven
// by supabase/tests/institutions/app_reading.sql (scripts/test-institutions-db.sh).
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  APP_SKILL_MAP,
  SKILLS,
  classGrowth,
  skillSummary,
  sourceLabel,
  studentReport,
  type Assessment,
  type Student,
} from "@/lib/institutions/report";

const ROOT = join(__dirname, "../../..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const MIGRATION = "supabase/migrations/20261031210000_institution_app_reading.sql";

const student: Student = { id: "reader-a", school_id: "s", external_id: "fixture-a", display_name: "Reader A", school_grade: "2", reading_grade: "1", created_at: "2026-10-01" };
const assessment = (id: string, on: string, grade: Assessment["reading_grade"], source: string): Assessment => ({
  id, assessed_on: on, reading_grade: grade, student_id: "reader-a", school_id: "s", class_id: "c", school_grade: null, recorded_at: on, source,
});

describe("app skills map onto the class view's five, in one agreed place", () => {
  it("every app quiz skill is mapped, to a real class-view skill, exactly as the migration maps it", () => {
    const grades = read("supabase/functions/_shared/grades.ts");
    const appSkills = [...grades.match(/QUIZ_SKILLS = \[([\s\S]*?)\] as const/)![1].matchAll(/"([a-z-]+)"/g)].map((m) => m[1]);
    expect(appSkills.length).toBe(8);
    expect(Object.keys(APP_SKILL_MAP).sort()).toEqual([...appSkills].sort());
    for (const v of Object.values(APP_SKILL_MAP)) expect(SKILLS).toContain(v);
    const sql = read(MIGRATION);
    const sqlMap = Object.fromEntries([...sql.matchAll(/when '([a-z-]+)' then '([a-z]+)'/g)].map((m) => [m[1], m[2]]));
    expect(sqlMap).toEqual(APP_SKILL_MAP);
  });
});

describe("reports never mix the two sources", () => {
  const rows = [
    assessment("t1", "2026-10-01", "1", "teacher_recorded"),
    assessment("a1", "2026-10-02", "4", "app"),
    assessment("a2", "2026-10-05", "5", "app"),
    assessment("t2", "2026-10-09", "2", "teacher_recorded"),
  ];
  it("teacher growth uses teacher records only; app growth uses app records only", () => {
    const teacher = studentReport(student, [], rows, []);
    expect([teacher.start?.id, teacher.now?.id, teacher.levelDelta]).toEqual(["t1", "t2", 1]);
    const app = studentReport(student, [], rows, [], "app");
    expect([app.start?.id, app.now?.id, app.levelDelta]).toEqual(["a1", "a2", 1]);
    expect(classGrowth([student], [], rows, [], "app").meanGradeSteps).toBe(1);
  });
  it("the app shows no level it did not see: no roster grade stands in", () => {
    const app = studentReport(student, [], [], [], "app");
    expect(app.readingGrade).toBeNull();
    expect(studentReport(student, [], [], []).readingGrade).toBe("1");
  });
  it("skill totals are per source", () => {
    const scores = [
      { assessment_id: "t1", skill: "context" as const, correct: 1, total: 2 },
      { assessment_id: "a1", skill: "context" as const, correct: 3, total: 3 },
    ];
    expect(skillSummary(rows, scores).find((s) => s.skill === "context")).toMatchObject({ correct: 1, total: 2 });
    expect(skillSummary(rows, scores, "app").find((s) => s.skill === "context")).toMatchObject({ correct: 3, total: 3 });
  });
  it("labels: teacher, app, and an unknown source is never passed off as teacher data", () => {
    expect(sourceLabel("teacher_recorded")).toBe("Teacher recorded");
    expect(sourceLabel("app")).toBe("From the app");
    expect(sourceLabel("import")).toBe("Unknown source (import)");
  });
});

describe("the migration is additive and the database suite runs it", () => {
  const sql = read(MIGRATION).toLowerCase();
  it("drops and rewrites nothing in family tables", () => {
    expect(sql).not.toMatch(/drop table|drop column|truncate|delete from public\.(child_profiles|reading_sessions|quiz_attempts)|update public\.(child_profiles|reading_sessions|quiz_attempts)/);
    expect(sql).not.toMatch(/alter table public\.(child_profiles|reading_sessions|quiz_attempts|stories)/);
    expect(sql).not.toMatch(/policy[^;]*on public\.(child_profiles|reading_sessions|quiz_attempts)/);
    // The only constraints dropped are the two source checks it re-adds wider.
    expect([...sql.matchAll(/drop constraint if exists (\w+)/g)].map((m) => m[1])).toEqual([
      "institution_readings_source_check",
      "institution_assessments_source_check",
    ]);
  });
  it("app rows are inserted by triggers only; browsers cannot write source or app_ref", () => {
    expect(sql).not.toMatch(/grant (insert|update)[^;]*(source|app_ref)/);
    expect(sql).not.toMatch(/grant (insert|update|delete)[^;]*institution_app_links/);
  });
  it("the institutions DB suite applies, exercises and reapplies this migration", () => {
    const script = read("scripts/test-institutions-db.sh");
    expect(script).toContain(MIGRATION);
    expect(script).toContain("supabase/tests/institutions/app_reading.sql");
    expect(script.match(/\$app_migration"/g)?.length).toBe(2);
    expect(read(".github/workflows/checks.yml")).toContain("bash scripts/test-institutions-db.sh");
  });
});
