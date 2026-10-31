import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import {
  classGrowth,
  skillSummary,
  studentReport,
  type Assessment,
  type Student,
  type Reading,
} from "@/lib/institutions/report";
import { loadWorkspace } from "@/lib/institutions/api";

vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
const student: Student = {
  id: "reader-a",
  school_id: "school-a",
  external_id: "fixture-a",
  display_name: "Reader A",
  school_grade: "2",
  reading_grade: "1",
  created_at: "2026-01-01",
};
const assessment = (
  id: string,
  assessed_on: string,
  reading_grade: Assessment["reading_grade"],
  student_id = "reader-a",
): Assessment => ({
  id,
  assessed_on,
  reading_grade,
  student_id,
  school_id: "school-a",
  class_id: "class-a",
  school_grade: "2",
  recorded_at: assessed_on,
  source: "teacher_recorded",
});

describe("institutional reading and skill reports", () => {
  it("keeps no observations distinct from a recorded zero and never invents growth from roster grades", () => {
    const r = studentReport(student, [], [], []);
    expect(r).toMatchObject({
      stories: 0,
      minutes: 0,
      readingGrade: "1",
      levelDelta: null,
      start: null,
      now: null,
    });
    expect(r.skills.every((s) => s.delta === null && s.first === null)).toBe(
      true,
    );
    expect(skillSummary([], [])[0].percent).toBeNull();
  });
  it("uses dated immutable observations in order, preserves a decline and excludes another child", () => {
    const rows = [
      assessment("late", "2026-10-20", "1"),
      assessment("other", "2026-10-30", "10", "reader-b"),
      assessment("early", "2026-10-01", "2"),
    ];
    const r = studentReport(student, [], rows, [
      { assessment_id: "early", skill: "inference", correct: 2, total: 2 },
      { assessment_id: "late", skill: "inference", correct: 0, total: 3 },
    ]);
    expect(r.start?.assessed_on).toBe("2026-10-01");
    expect(r.now?.assessed_on).toBe("2026-10-20");
    expect(r.levelDelta).toBe(-1);
    expect(r.skills.find((s) => s.skill === "inference")?.delta).toBe(-100);
    expect(r.skills.find((s) => s.skill === "vocabulary")?.delta).toBeNull();
  });
  it("counts completed sessions and actual fractional minutes only for the student", () => {
    const readings = [
      { student_id: "reader-a", completed: true, minutes: 2.5 },
      { student_id: "reader-a", completed: false, minutes: 1.25 },
      { student_id: "reader-b", completed: true, minutes: 30 },
    ] as Reading[];
    expect(studentReport(student, readings, [], [])).toMatchObject({
      stories: 1,
      minutes: 3.75,
    });
  });
  it("weights skill scores by real question count and filters inaccessible assessment ids", () => {
    const rows = [
      assessment("a", "2026-10-01", "1"),
      assessment("b", "2026-10-20", "2"),
    ];
    const results = skillSummary(rows, [
      { assessment_id: "a", skill: "context", correct: 1, total: 1 },
      { assessment_id: "b", skill: "context", correct: 0, total: 9 },
      { assessment_id: "hidden", skill: "context", correct: 100, total: 100 },
    ]);
    expect(results.find((s) => s.skill === "context")).toMatchObject({
      correct: 1,
      total: 10,
      percent: 10,
    });
  });
  it("compares the same children with two levels; blank observations do not erase recorded levels", () => {
    const rows = [
      assessment("a", "2026-10-01", "K"),
      assessment("b", "2026-10-20", "2"),
      assessment("blank", "2026-10-21", null),
    ];
    expect(
      classGrowth([student, { ...student, id: "reader-b" }], [], rows, []),
    ).toMatchObject({ paired: 1, total: 2, meanGradeSteps: 2 });
    expect(studentReport(student, [], rows, []).now?.id).toBe("b");
  });
  it("reads beyond the Data API row cap without double counting", async () => {
    const range = vi.fn(async (start: number) => ({
      data:
        start === 0
          ? Array.from({ length: 500 }, (_, i) => ({ id: i }))
          : [{ id: 500 }],
      error: null,
    }));
    const builder = { select: () => builder, order: () => builder, range };
    const result = await loadWorkspace({ from: () => builder } as any);
    expect(result.readings).toHaveLength(501);
    expect(range).toHaveBeenCalledWith(500, 999);
  });
  it("fails closed on query failure instead of returning partial school reports", async () => {
    const builder = {
      select: () => builder,
      order: () => builder,
      range: async () => ({ data: null, error: { message: "denied" } }),
    };
    await expect(loadWorkspace({ from: () => builder } as any)).rejects.toThrow(
      "School records could not be loaded",
    );
  });
  it("wires the adult workspace into the real router and sidebar", () => {
    expect(readFileSync("src/App.tsx", "utf8")).toContain(
      '<Route path="/schools" element={<Institutions />} />',
    );
    expect(readFileSync("src/components/PremiumSidebar.tsx", "utf8")).toContain(
      'to="/schools"',
    );
  });
});

import { assessmentScores } from "@/lib/institutions/assessmentForm";
describe("assessment entry preserves actual observations", () => {
  it("never fabricates a zero when the correct-answer field is blank", () => {
    const f = new FormData();
    f.set("inference_total", "4");
    expect(() => assessmentScores(f)).toThrow("both");
  });
  it("keeps an explicitly recorded zero and unassessed skills distinct", () => {
    const f = new FormData();
    f.set("inference_correct", "0");
    f.set("inference_total", "4");
    expect(assessmentScores(f)).toEqual([
      { skill: "inference", correct: 0, total: 4 },
    ]);
  });
  it("rejects impossible and partial counts", () => {
    const f = new FormData();
    f.set("context_correct", "4");
    expect(() => assessmentScores(f)).toThrow("both");
    f.set("context_total", "3");
    expect(() => assessmentScores(f)).toThrow("Invalid");
  });
});

describe('class growth uses dated pairs for each skill', () => {
  it('excludes children with one result from both endpoints', () => {
    const rows = [assessment('a','2026-10-01','1'),assessment('b','2026-10-20','2'),assessment('c','2026-10-21','1','reader-b')];
    const result = classGrowth([student,{...student,id:'reader-b'}],[],rows,[{assessment_id:'a',skill:'context',correct:0,total:2},{assessment_id:'b',skill:'context',correct:1,total:2},{assessment_id:'c',skill:'context',correct:100,total:100}]);
    expect(result.skills.find(s=>s.skill==='context')).toMatchObject({paired:1,firstCorrect:0,firstTotal:2,lastCorrect:1,lastTotal:2,delta:50,firstDates:['2026-10-01'],lastDates:['2026-10-20']});
  });
});
