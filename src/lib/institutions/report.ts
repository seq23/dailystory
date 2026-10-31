import { GRADES, type Grade } from "@/lib/grades";

export const SKILLS = [
  "vocabulary",
  "spelling",
  "definitions",
  "context",
  "inference",
] as const;
export type Skill = (typeof SKILLS)[number];
export interface School {
  id: string;
  name: string;
}
export interface Member {
  school_id: string;
  user_id: string;
  role: "teacher" | "school_admin";
}
export interface SchoolClass {
  id: string;
  school_id: string;
  teacher_user_id: string | null;
  name: string;
}
export interface Student {
  id: string;
  school_id: string;
  external_id: string;
  display_name: string;
  school_grade: Grade | null;
  reading_grade: Grade | null;
  created_at: string;
}
export interface Enrollment {
  class_id: string;
  student_id: string;
  school_id: string;
}
export interface Reading {
  id: string;
  school_id: string;
  class_id: string;
  student_id: string;
  story_title: string;
  minutes: number;
  completed: boolean;
  read_at: string;
  source: string;
}
export interface Score {
  assessment_id: string;
  skill: Skill;
  correct: number;
  total: number;
}
export interface Assessment {
  id: string;
  school_id: string;
  class_id: string;
  student_id: string;
  assessed_on: string;
  school_grade: Grade | null;
  reading_grade: Grade | null;
  recorded_at: string;
  source: string;
}
export interface Workspace {
  schools: School[];
  members: Member[];
  classes: SchoolClass[];
  students: Student[];
  enrollments: Enrollment[];
  readings: Reading[];
  assessments: Assessment[];
  scores: Score[];
}
export const EMPTY_WORKSPACE: Workspace = {
  schools: [],
  members: [],
  classes: [],
  students: [],
  enrollments: [],
  readings: [],
  assessments: [],
  scores: [],
};

export function skillSummary(assessments: Assessment[], scores: Score[]) {
  const ids = new Set(assessments.map((a) => a.id));
  return SKILLS.map((skill) => {
    const recorded = scores.filter(
      (s) => s.skill === skill && ids.has(s.assessment_id),
    );
    const correct = recorded.reduce((n, s) => n + s.correct, 0);
    const total = recorded.reduce((n, s) => n + s.total, 0);
    return {
      skill,
      correct,
      total,
      percent: total ? Math.round((correct / total) * 100) : null,
    };
  });
}

/** Dates are observation dates; ties resolve by recording time, then immutable id. */
export function studentReport(
  student: Student,
  readings: Reading[],
  assessments: Assessment[],
  scores: Score[],
) {
  const history = assessments
    .filter((a) => a.student_id === student.id)
    .sort(
      (a, b) =>
        a.assessed_on.localeCompare(b.assessed_on) ||
        a.recorded_at.localeCompare(b.recorded_at) ||
        a.id.localeCompare(b.id),
    );
  const levelHistory = history.filter((a) => a.reading_grade !== null);
  const start = levelHistory[0] ?? null;
  const now = levelHistory.slice(-1)[0] ?? null;
  const read = readings.filter((r) => r.student_id === student.id);
  const latestSchoolGrade =
    [...history].reverse().find((a) => a.school_grade !== null)?.school_grade ??
    student.school_grade;
  const skills = SKILLS.map((skill) => {
    const observations = history.flatMap((a) =>
      scores
        .filter((s) => s.assessment_id === a.id && s.skill === skill)
        .map((s) => ({ ...s, date: a.assessed_on })),
    );
    const first = observations[0] ?? null;
    const last = observations.slice(-1)[0] ?? null;
    return {
      skill,
      first,
      last,
      delta:
        first && last && first.assessment_id !== last.assessment_id
          ? Math.round(
              (last.correct / last.total - first.correct / first.total) * 100,
            )
          : null,
    };
  });
  return {
    stories: read.filter((r) => r.completed).length,
    minutes:
      Math.round(read.reduce((n, r) => n + Number(r.minutes), 0) * 100) / 100,
    schoolGrade: latestSchoolGrade,
    readingGrade: now?.reading_grade ?? student.reading_grade,
    start,
    now,
    levelDelta:
      start && now && start.id !== now.id
        ? GRADES.indexOf(now.reading_grade!) -
          GRADES.indexOf(start.reading_grade!)
        : null,
    skills,
    history,
  };
}

/** Compare the same children with >=2 recorded levels, never two changing cohorts. */
export function classGrowth(
  students: Student[],
  readings: Reading[],
  assessments: Assessment[],
  scores: Score[],
) {
  const reports = students.map((s) =>
    studentReport(s, readings, assessments, scores),
  );
  const paired = reports.filter((r) => r.levelDelta !== null);
  const skills = SKILLS.map((skill) => {
    const pairs = reports.flatMap((r) =>
      r.skills.filter((s) => s.skill === skill && s.delta !== null),
    );
    const firstCorrect = pairs.reduce((n, s) => n + s.first!.correct, 0),
      firstTotal = pairs.reduce((n, s) => n + s.first!.total, 0);
    const lastCorrect = pairs.reduce((n, s) => n + s.last!.correct, 0),
      lastTotal = pairs.reduce((n, s) => n + s.last!.total, 0);
    return {
      skill,
      paired: pairs.length,
      firstCorrect,
      firstTotal,
      lastCorrect,
      lastTotal,
      firstDates: pairs.map((s) => s.first!.date).sort(),
      lastDates: pairs.map((s) => s.last!.date).sort(),
      delta: pairs.length
        ? Math.round(
            (lastCorrect / lastTotal - firstCorrect / firstTotal) * 100,
          )
        : null,
    };
  });
  return {
    paired: paired.length,
    total: students.length,
    skills,
    meanGradeSteps: paired.length
      ? Math.round(
          (paired.reduce((n, r) => n + r.levelDelta!, 0) / paired.length) * 100,
        ) / 100
      : null,
  };
}
