import { useEffect, useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { uiText, useUiLanguage } from "@/i18n/uiText";
import { supabase } from "@/integrations/supabase/client";
import {
  institutionDb,
  institutionRpc,
  loadWorkspace,
} from "@/lib/institutions/api";
import {
  EMPTY_WORKSPACE,
  SKILLS,
  classGrowth,
  skillSummary,
  studentReport,
  type Workspace,
  type Student,
} from "@/lib/institutions/report";
import { GRADES, GRADE_PROFILES } from "@/lib/grades";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import "./Institutions.css";
import { assessmentScores } from "@/lib/institutions/assessmentForm";
import { InstitutionRosterImport } from "@/components/InstitutionRosterImport";

const gradeLabel = (value: string | null) =>
  value
    ? (GRADE_PROFILES[value as keyof typeof GRADE_PROFILES]?.shortLabel ??
      value)
    : "Not recorded";
const date = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString();
function changeObservationStudent(event: ChangeEvent<HTMLSelectElement>) {
  const select = event.currentTarget;
  const student = select.value;
  // Draft observations belong to one child. Keep the new selection, clear the
  // previous child's unsaved scores, grades, story and date.
  select.form?.reset();
  select.value = student;
}
function GradeSelect({
  name,
  label,
  value,
}: {
  name: string;
  label: string;
  value?: string | null;
}) {
  return (
    <label>
      {label}
      <select name={name} defaultValue={value ?? ""}>
        <option value="">Not recorded</option>
        {GRADES.map((g) => (
          <option key={g} value={g}>
            {GRADE_PROFILES[g].longLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
function StudentDetail({
  student,
  workspace,
}: {
  student: Student;
  workspace: Workspace;
}) {
  const report = studentReport(
    student,
    workspace.readings,
    workspace.assessments,
    workspace.scores,
  );
  return (
    <section aria-label="Student report" className="school-panel">
      <h2>{student.display_name}</h2>
      <p>
        School grade: {gradeLabel(report.schoolGrade)} · Reads at:{" "}
        {gradeLabel(report.readingGrade)}
      </p>
      <p>
        {report.stories} recorded stories completed · {report.minutes} recorded
        {uiText("minutes")}
      </p>
      <h3>Growth from recorded assessments</h3>
      {report.start && report.now ? (
        <p>
          {date(report.start.assessed_on)}:{" "}
          {gradeLabel(report.start.reading_grade)} →{" "}
          {date(report.now.assessed_on)}: {gradeLabel(report.now.reading_grade)}
          .{" "}
          {report.levelDelta === null
            ? "Two observations are needed for a comparison."
            : `${report.levelDelta > 0 ? "+" : ""}${report.levelDelta} grade steps.`}
        </p>
      ) : (
        <p>No reading-level assessments recorded.</p>
      )}
      <div className="school-table">
        <table>
          <caption>Quiz growth by skill (percentage points)</caption>
          <thead>
            <tr>
              <th>Skill</th>
              <th>{uiText("Start")}</th>
              <th>Latest</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {report.skills.map((s) => (
              <tr key={s.skill}>
                <th>{s.skill}</th>
                <td>
                  {s.first
                    ? `${s.first.correct}/${s.first.total} · ${date(s.first.date)}`
                    : "Not assessed"}
                </td>
                <td>
                  {s.last
                    ? `${s.last.correct}/${s.last.total} · ${date(s.last.date)}`
                    : "Not assessed"}
                </td>
                <td>
                  {s.delta === null
                    ? "Needs two results"
                    : `${s.delta > 0 ? "+" : ""}${s.delta} pp`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <details>
        <summary>Assessment history ({report.history.length})</summary>
        <ul>
          {report.history.map((a) => (
            <li key={a.id}>
              {date(a.assessed_on)} — School grade {gradeLabel(a.school_grade)},
              Reads at {gradeLabel(a.reading_grade)} · Teacher recorded
            </li>
          ))}
        </ul>
      </details>
      <details>
        <summary>Reading history</summary>
        <ul>
          {workspace.readings
            .filter((r) => r.student_id === student.id)
            .sort((a, b) => b.read_at.localeCompare(a.read_at))
            .map((r) => (
              <li key={r.id}>
                {date(r.read_at)} — {r.story_title}: {r.minutes} min ·{" "}
                {r.completed ? "Completed" : "In progress"} · Teacher recorded
              </li>
            ))}
        </ul>
      </details>
    </section>
  );
}

export default function Institutions() {
  useUiLanguage();
  const principal = useRef<string | null>(null);
  const [workspace, setWorkspace] = useState<Workspace>(EMPTY_WORKSPACE);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  async function reload() {
    const expected = userId;
    const next = await loadWorkspace();
    if (principal.current !== expected) return;
    setWorkspace(next);
    setSchoolId((previous) =>
      next.schools.some((s) => s.id === previous)
        ? previous
        : (next.schools[0]?.id ?? ""),
    );
  }
  useEffect(() => {
    let active = true;
    let authEventSeen = false;
    // Clear records on every auth transition; a retained tab must not show the last user's class.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      authEventSeen = true;
      setUserId((previous) => {
        const next = session?.user.id ?? null;
        principal.current = next;
        if (previous !== next) {
          setWorkspace(EMPTY_WORKSPACE);
          setSchoolId("");
          setClassId("");
          setStudentId("");
          setTeacherId("");
        }
        return next;
      });
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (active && !authEventSeen) {
        principal.current = data.session?.user.id ?? null;
        setUserId(principal.current);
      }
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    let active = true;
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    void loadWorkspace()
      .then((data) => {
        if (active) {
          setWorkspace(data);
          setSchoolId(data.schools[0]?.id ?? "");
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);
  const member = workspace.members.find(
    (m) => m.school_id === schoolId && m.user_id === userId,
  );
  const admin = member?.role === "school_admin";
  const classes = workspace.classes.filter(
    (c) =>
      c.school_id === schoolId &&
      (!teacherId || c.teacher_user_id === teacherId),
  );
  const selectedClass = classes.find((c) => c.id === classId);
  const enrollments = workspace.enrollments.filter(
    (e) =>
      e.school_id === schoolId &&
      (!selectedClass || e.class_id === selectedClass.id) &&
      classes.some((c) => c.id === e.class_id),
  );
  const ids = new Set(enrollments.map((e) => e.student_id));
  const students = workspace.students.filter((s) => ids.has(s.id));
  const classIds = new Set(
    classes
      .filter((c) => !selectedClass || c.id === selectedClass.id)
      .map((c) => c.id),
  );
  const reportWorkspace = {
    ...workspace,
    readings: workspace.readings.filter((r) => classIds.has(r.class_id)),
    assessments: workspace.assessments.filter((a) => classIds.has(a.class_id)),
  };
  const selectedStudent = students.find((s) => s.id === studentId);
  const summary = skillSummary(reportWorkspace.assessments, workspace.scores);
  const growth = classGrowth(
    students,
    reportWorkspace.readings,
    reportWorkspace.assessments,
    workspace.scores,
  );
  async function mutate(task: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await task();
      await reload();
      setMessage(success);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not save. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  function formData(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    return new FormData(e.currentTarget);
  }
  const schoolChange = (id: string) => {
    setSchoolId(id);
    setClassId("");
    setStudentId("");
    setTeacherId("");
    setMessage("");
    setError("");
  };
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return (
    <main className="school-workspace">
      <header>
        <Link to="/">← Back to reading</Link>
        <p className="school-eyebrow">For educators</p>
        <h1>School reading workspace</h1>
        <p>Classroom records, one reader at a time.</p>
      </header>
      {loading ? (
        <p role="status">Loading school records…</p>
      ) : !userId ? (
        <p>
          <Link to="/auth">{uiText("Sign in")}</Link> with your school-assigned adult
          account.
        </p>
      ) : (
        <>
          {error && (
            <div role="alert">
              <p>{error}</p>
              <Button
                disabled={busy}
                onClick={() => mutate(reload, "Records refreshed.")}
              >
                {uiText("Try again")}
              </Button>
            </div>
          )}
          {busy && <p role="status">Saving school records…</p>}
      {message && <p role="status">{message}</p>}
          {!workspace.schools.length ? (
            <p>
              No school access assigned. A school administrator must provision
              your membership. No student account is needed.
            </p>
          ) : (
            <>
              <nav aria-label="Report filters" className="school-filters">
                <label>
                  School
                  <select
                    value={schoolId}
                    onChange={(e) => schoolChange(e.target.value)}
                  >
                    {workspace.schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
                {admin && (
                  <label>
                    Teacher
                    <select
                      value={teacherId}
                      onChange={(e) => {
                        setTeacherId(e.target.value);
                        setClassId("");
                        setStudentId("");
                      }}
                    >
                      <option value="">All teachers</option>
                      {workspace.members
                        .filter((m) => m.school_id === schoolId)
                        .map((m) => (
                          <option key={m.user_id} value={m.user_id}>
                            {m.user_id === userId ? "You" : m.user_id}
                          </option>
                        ))}
                    </select>
                  </label>
                )}
                <label>
                  Class
                  <select
                    value={selectedClass?.id ?? ""}
                    onChange={(e) => {
                      setClassId(e.target.value);
                      setStudentId("");
                    }}
                  >
                    <option value="">All classes</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              </nav>
              <p>
                {admin
                  ? "School administrator · Across assigned teachers"
                  : "Teacher · Your assigned classes"}{" "}
                · {students.length} child profiles
              </p>
              <section className="school-panel">
                <h2>{selectedClass?.name ?? "Across classes"}</h2>
                <p>
                  Teacher-recorded observations. Family reading records are
                  separate. A completed reading record counts as one story
                  session; minutes are reported by the teacher.
                </p>
                <p>
                  <strong>
                    {reportWorkspace.readings.filter((r) => r.completed).length}
                  </strong>{" "}
                  stories completed ·{" "}
                  <strong>
                    {Math.round(
                      reportWorkspace.readings.reduce(
                        (n, r) => n + Number(r.minutes),
                        0,
                      ) * 100,
                    ) / 100}
                  </strong>{" "}
                  {uiText("minutes")}
                </p>
                <div className="school-table">
                  <table>
                    <caption>
                      Quiz results by skill · all recorded questions
                    </caption>
                    <thead>
                      <tr>
                        <th>Skill</th>
                        <th>Correct / questions</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.map((s) => (
                        <tr key={s.skill}>
                          <th>{s.skill}</th>
                          <td>
                            {s.total
                              ? `${s.correct} / ${s.total}`
                              : "Not assessed"}
                          </td>
                          <td>{s.percent === null ? "—" : `${s.percent}%`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p>
                  Growth: {growth.paired} {uiText("of")} {growth.total} students have two
                  recorded reading levels.{" "}
                  {growth.meanGradeSteps === null
                    ? "No comparison yet."
                    : `Mean change for those same students: ${growth.meanGradeSteps} grade steps.`}{" "}
                  Observational results do not establish that the app caused
                  improvement.
                </p>
                <details>
                  <summary>Dated class growth comparisons</summary>
                  <div className="school-table">
                    <table>
                      <caption>
                        First and latest recorded level per child
                      </caption>
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>{uiText("Start")}</th>
                          <th>Latest</th>
                          <th>Grade steps</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s) => {
                          const r = studentReport(
                            s,
                            reportWorkspace.readings,
                            reportWorkspace.assessments,
                            workspace.scores,
                          );
                          return (
                            <tr key={s.id}>
                              <th>{s.display_name}</th>
                              <td>
                                {r.start
                                  ? `${gradeLabel(r.start.reading_grade)} · ${date(r.start.assessed_on)}`
                                  : "Not assessed"}
                              </td>
                              <td>
                                {r.now
                                  ? `${gradeLabel(r.now.reading_grade)} · ${date(r.now.assessed_on)}`
                                  : "Not assessed"}
                              </td>
                              <td>{r.levelDelta ?? "Needs two levels"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="school-table">
                    <table>
                      <caption>
                        Skill growth · same children at both endpoints for each
                        skill
                      </caption>
                      <thead>
                        <tr>
                          <th>Skill</th>
                          <th>Paired students</th>
                          <th>Start questions / dates</th>
                          <th>Latest questions / dates</th>
                          <th>Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {growth.skills.map((s) => (
                          <tr key={s.skill}>
                            <th>{s.skill}</th>
                            <td>
                              {s.paired}/{students.length}
                            </td>
                            <td>
                              {s.paired
                                ? `${s.firstCorrect}/${s.firstTotal} · ${date(s.firstDates[0])}–${date(s.firstDates[s.firstDates.length - 1])}`
                                : "Not assessed"}
                            </td>
                            <td>
                              {s.paired
                                ? `${s.lastCorrect}/${s.lastTotal} · ${date(s.lastDates[0])}–${date(s.lastDates[s.lastDates.length - 1])}`
                                : "Not assessed"}
                            </td>
                            <td>
                              {s.delta === null
                                ? "Needs two results"
                                : `${s.delta} pp`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </section>
              <section className="school-panel">
                <h2>Students</h2>
                {!students.length ? (
                  <p>
                    No students in this view. Create a class, then add a child
                    profile.
                  </p>
                ) : (
                  <div className="school-table">
                    <table>
                      <caption>
                        Select a student for dated reading and skill history
                      </caption>
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>{uiText("School grade")}</th>
                          <th>{uiText("Reads at")}</th>
                          <th>{uiText("Stories")}</th>
                          <th>{uiText("Minutes")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s) => {
                          const r = studentReport(
                            s,
                            reportWorkspace.readings,
                            reportWorkspace.assessments,
                            workspace.scores,
                          );
                          return (
                            <tr key={s.id}>
                              <td>
                                <button
                                  className="school-student"
                                  onClick={() => setStudentId(s.id)}
                                >
                                  {s.display_name}
                                </button>
                              </td>
                              <td>{gradeLabel(r.schoolGrade)}</td>
                              <td>{gradeLabel(r.readingGrade)}</td>
                              <td>{r.stories}</td>
                              <td>{r.minutes}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
              {selectedStudent && (
                <StudentDetail
                  student={selectedStudent}
                  workspace={reportWorkspace}
                />
              )}
              <section className="school-panel" key={`entry:${schoolId}:${selectedClass?.id ?? "all"}`}>
                <h2>Manage classroom records</h2>
                <details>
                  <summary>Create a class</summary>
                  <form
                    onSubmit={(e) => {
                      const f = formData(e);
                      void mutate(async () => {
                        const { error } = await institutionDb
                          .from("institution_classes")
                          .insert({
                            school_id: schoolId,
                            teacher_user_id: String(f.get("teacher")),
                            name: String(f.get("name")).trim(),
                          });
                        if (error) throw new Error(error.message);
                      }, "Class created. Choose it in the class filter.");
                    }}
                  >
                    <label>
                      Class name
                      <Input name="name" required maxLength={100} />
                    </label>
                    <label>
                      Teacher
                      <select name="teacher" defaultValue={userId}>
                        {workspace.members
                          .filter(
                            (m) =>
                              m.school_id === schoolId &&
                              (admin || m.user_id === userId),
                          )
                          .map((m) => (
                            <option key={m.user_id} value={m.user_id}>
                              {m.user_id === userId ? "You" : m.user_id}
                            </option>
                          ))}
                      </select>
                    </label>
                    <Button disabled={busy}>Create class</Button>
                  </form>
                </details>
                {admin && (
                  <details>
                    <summary>Assign an existing teacher account</summary>
                    <form
                      onSubmit={(e) => {
                        const f = formData(e);
                        void mutate(
                          () =>
                            institutionRpc("institution_assign_teacher", {
                              p_school: schoolId,
                              p_user: String(f.get("user")),
                            }),
                          "Teacher assigned.",
                        );
                      }}
                    >
                      <label>
                        Existing account UUID
                        <Input
                          name="user"
                          required
                          pattern="[0-9a-fA-F-]{36}"
                        />
                      </label>
                      <p>
                        This assigns school access to an existing adult account.
                        It does not send an invitation.
                      </p>
                      <Button disabled={busy}>Assign teacher</Button>
                    </form>
                  </details>
                )}
                {!selectedClass ? (
                  <p>
                    Choose a specific class above to add students or record
                    work.
                  </p>
                ) : (
                  <>
                    <InstitutionRosterImport
                      key={`${schoolId}:${classId}`}
                      schoolId={schoolId}
                      classId={classId}
                      admin={admin}
                      onSaved={reload}
                    />
                    <details>
                      <summary>Add a child profile</summary>
                      <form
                        onSubmit={(e) => {
                          const f = formData(e);
                          void mutate(
                            () =>
                              institutionRpc("institution_import_roster", {
                                p_class: classId,
                                p_rows: [
                                  {
                                    external_id: String(
                                      f.get("external_id"),
                                    ).trim(),
                                    display_name: String(f.get("name")).trim(),
                                    school_grade: f.get("school_grade") || null,
                                    reading_grade:
                                      f.get("reading_grade") || null,
                                  },
                                ],
                              }),
                            "Student added.",
                          );
                        }}
                      >
                        <label>
                          School roster ID
                          <Input name="external_id" required maxLength={120} />
                        </label>
                        <label>
                          Display name or alias
                          <Input name="name" required maxLength={100} />
                        </label>
                        <GradeSelect name="school_grade" label="School grade" />
                        <GradeSelect name="reading_grade" label="Reads at" />
                        <Button disabled={busy}>Add student</Button>
                      </form>
                    </details>
                    {!!students.length && (
                      <>
                        <details>
                          <summary>Record a reading session</summary>
                          <form
                            onSubmit={(e) => {
                              const f = formData(e);
                              void mutate(async () => {
                                const { error } = await institutionDb
                                  .from("institution_readings")
                                  .insert({
                                    school_id: schoolId,
                                    class_id: classId,
                                    student_id: String(f.get("student")),
                                    story_title: String(f.get("story")).trim(),
                                    minutes: Number(f.get("minutes")),
                                    completed: f.get("completed") === "on",
                                    read_at: String(f.get("date")),
                                  });
                                if (error) throw new Error(error.message);
                              }, "Reading recorded.");
                            }}
                          >
                            <label>
                              Student
                              <select name="student" onChange={changeObservationStudent}>
                                {students.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.display_name}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label>
                              Story title
                              <Input name="story" required maxLength={200} />
                            </label>
                            <label>
                              Minutes read
                              <Input
                                name="minutes"
                                type="number"
                                min="0"
                                max="180"
                                step="0.01"
                                required
                              />
                            </label>
                            <label>
                              Reading date
                              <Input
                                name="date"
                                type="date"
                                max={today}
                                defaultValue={today}
                                required
                              />
                            </label>
                            <label className="school-check">
                              <input
                                name="completed"
                                type="checkbox"
                                defaultChecked
                              />{" "}
                              Story completed
                            </label>
                            <Button disabled={busy}>Save reading</Button>
                          </form>
                        </details>
                        <details>
                          <summary>Record a level and quiz assessment</summary>
                          <form
                            onSubmit={(e) => {
                              const f = formData(e);
                              void mutate(
                                () =>
                                  institutionRpc(
                                    "institution_record_assessment",
                                    {
                                      p_class: classId,
                                      p_student: String(f.get("student")),
                                      p_date: String(f.get("date")),
                                      p_school_grade:
                                        f.get("school_grade") || null,
                                      p_reading_grade:
                                        f.get("reading_grade") || null,
                                      p_scores: assessmentScores(f),
                                    },
                                  ),
                                "Assessment recorded.",
                              );
                            }}
                          >
                            <label>
                              Student
                              <select name="student" onChange={changeObservationStudent}>
                                {students.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.display_name}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label>
                              Assessment date
                              <Input
                                name="date"
                                type="date"
                                max={today}
                                defaultValue={today}
                                required
                              />
                            </label>
                            <GradeSelect
                              name="school_grade"
                              label="School grade observed"
                            />
                            <GradeSelect
                              name="reading_grade"
                              label="Reads at observed"
                            />
                            <p>
                              Leave an unassessed skill empty. Correct answers
                              and question counts must both come from the actual
                              quiz.
                            </p>
                            {SKILLS.map((skill) => (
                              <fieldset key={skill}>
                                <legend>{skill}</legend>
                                <label>
                                  Correct
                                  <Input
                                    name={`${skill}_correct`}
                                    type="number"
                                    min="0"
                                    max="1000"
                                  />
                                </label>
                                <label>
                                  Questions
                                  <Input
                                    name={`${skill}_total`}
                                    type="number"
                                    min="1"
                                    max="1000"
                                  />
                                </label>
                              </fieldset>
                            ))}
                            <Button disabled={busy}>Save assessment</Button>
                          </form>
                        </details>
                      </>
                    )}
                  </>
                )}
                {admin && selectedStudent && (
                  <details>
                    <summary>Delete this institutional child profile</summary>
                    <p>
                      Removes {selectedStudent.display_name}, all school
                      enrollments, readings and assessments permanently. Type
                      the roster ID to confirm.
                    </p>
                    <form
                      onSubmit={(e) => {
                        const f = formData(e);
                        if (f.get("confirm") !== selectedStudent.external_id) {
                          setError("The roster ID did not match.");
                          return;
                        }
                        void mutate(
                          () =>
                            institutionRpc("institution_delete_student", {
                              p_student: selectedStudent.id,
                            }),
                          "Student and institutional records deleted.",
                        );
                      }}
                    >
                      <label>
                        Roster ID
                        <Input name="confirm" required />
                      </label>
                      <Button variant="destructive" disabled={busy}>
                        Delete student records
                      </Button>
                    </form>
                  </details>
                )}
              </section>
            </>
          )}
        </>
      )}
    </main>
  );
}
