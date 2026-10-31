import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Institutions from "@/pages/Institutions";
import { EMPTY_WORKSPACE } from "@/lib/institutions/report";
const mocks = vi.hoisted(() => ({
  load: vi.fn(),
  rpc: vi.fn(),
  insert: vi.fn(),
  listener: null as any,
  user: "fixture-adult",
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: async () => ({
        data: { session: mocks.user ? { user: { id: mocks.user } } : null },
      }),
      onAuthStateChange: (listener: any) => {
        mocks.listener = listener;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      },
    },
    functions: {
      invoke: async () => ({
        data: { clever: "not_connected", classlink: "not_connected" },
        error: null,
      }),
    },
  },
}));
vi.mock("@/lib/institutions/api", () => ({
  loadWorkspace: () => mocks.load(),
  institutionRpc: (...args: any[]) => mocks.rpc(...args),
  institutionDb: {
    from: () => ({ insert: (...args: any[]) => mocks.insert(...args) }),
  },
}));
const fixture = {
  ...EMPTY_WORKSPACE,
  schools: [{ id: "school-a", name: "Fixture School" }],
  members: [
    { school_id: "school-a", user_id: "fixture-adult", role: "teacher" },
  ],
  classes: [
    {
      id: "class-a",
      school_id: "school-a",
      teacher_user_id: "fixture-adult",
      name: "Fixture Class",
    },
  ],
  students: [
    {
      id: "reader-a",
      school_id: "school-a",
      external_id: "fixture-a",
      display_name: "Reader A",
      school_grade: "2",
      reading_grade: "1",
      created_at: "2026-10-01",
    },
  ],
  enrollments: [
    { class_id: "class-a", school_id: "school-a", student_id: "reader-a" },
  ],
};
beforeEach(() => {
  mocks.user = "fixture-adult";
  mocks.load.mockResolvedValue(fixture);
  mocks.rpc.mockResolvedValue(1);
  mocks.insert.mockResolvedValue({ error: null });
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
const show = () =>
  render(
    <MemoryRouter>
      <Institutions />
    </MemoryRouter>,
  );
describe("school workspace user journeys", () => {
  it("offers sign-in without loading student data for a signed-out visitor", async () => {
    mocks.user = "";
    show();
    expect(
      await screen.findByRole("link", { name: "Sign in" }),
    ).toHaveAttribute("href", "/auth");
    expect(mocks.load).not.toHaveBeenCalled();
  });
  it("shows a membership empty state without sample students", async () => {
    mocks.load.mockResolvedValue(EMPTY_WORKSPACE);
    show();
    expect(
      await screen.findByText(/No school access assigned/),
    ).toBeInTheDocument();
    expect(screen.queryByText("Reader A")).not.toBeInTheDocument();
  });
  it("renders recorded-only class and student reports, and requires a selected class for entry", async () => {
    show();
    await screen.findByRole("button", { name: "Reader A" });
    expect(screen.getByText(/Choose a specific class/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reader A" }));
    expect(
      screen.getByText("No reading-level assessments recorded."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Assign an existing teacher account"),
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Class"), {
      target: { value: "class-a" },
    });
    expect(screen.getByText("Record a reading session")).toBeInTheDocument();
  });
  it("saves actual reading values into the chosen class", async () => {
    show();
    await screen.findByRole("button", { name: "Reader A" });
    fireEvent.change(screen.getByLabelText("Class"), {
      target: { value: "class-a" },
    });
    fireEvent.change(screen.getByLabelText("Story title"), {
      target: { value: "Fixture story" },
    });
    fireEvent.change(screen.getByLabelText("Minutes read"), {
      target: { value: "4.5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save reading" }));
    await waitFor(() =>
      expect(mocks.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          school_id: "school-a",
          class_id: "class-a",
          student_id: "reader-a",
          story_title: "Fixture story",
          minutes: 4.5,
          completed: true,
        }),
      ),
    );
  });
  it("clears the previous class when the adult signs out", async () => {
    show();
    await screen.findByRole("button", { name: "Reader A" });
    mocks.listener("SIGNED_OUT", null);
    await screen.findByRole("link", { name: "Sign in" });
    expect(screen.queryByText("Reader A")).not.toBeInTheDocument();
  });
  it("clears unsaved observations when switching classes", async () => {
    mocks.load.mockResolvedValue({ ...fixture, classes: [
      ...fixture.classes, { ...fixture.classes[0], id: "class-b", name: "Fixture Class B" },
    ], enrollments: [...fixture.enrollments, { ...fixture.enrollments[0], class_id: "class-b" }] });
    show();
    await screen.findByRole("button", { name: "Reader A" });
    fireEvent.change(screen.getByLabelText("Class"), { target: { value: "class-a" } });
    fireEvent.change(screen.getByLabelText("Story title"), { target: { value: "Unsaved fixture story" } });
    const inference = within(screen.getByRole("group", { name: "inference" }));
    fireEvent.change(inference.getByLabelText("Correct"), { target: { value: "2" } });
    fireEvent.change(inference.getByLabelText("Questions"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("Class"), { target: { value: "class-b" } });
    expect(screen.getByLabelText("Story title")).toHaveValue("");
    expect(within(screen.getByRole("group", { name: "inference" })).getByLabelText("Correct")).toHaveValue(null);
    expect(within(screen.getByRole("group", { name: "inference" })).getByLabelText("Questions")).toHaveValue(null);
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("clears unsaved reading and quiz values when choosing another child", async () => {
    mocks.load.mockResolvedValue({ ...fixture, students: [...fixture.students, {
      ...fixture.students[0], id: "reader-b", external_id: "fixture-b", display_name: "Reader B",
    }], enrollments: [...fixture.enrollments, { ...fixture.enrollments[0], student_id: "reader-b" }] });
    show();
    await screen.findByRole("button", { name: "Reader A" });
    fireEvent.change(screen.getByLabelText("Class"), { target: { value: "class-a" } });
    const story = screen.getByLabelText("Story title");
    fireEvent.change(story, { target: { value: "Unsaved fixture story" } });
    fireEvent.change(screen.getByLabelText("Minutes read"), { target: { value: "12" } });
    fireEvent.change(within(story.closest("form")!).getByLabelText("Student"), { target: { value: "reader-b" } });
    expect(story).toHaveValue("");
    expect(screen.getByLabelText("Minutes read")).toHaveValue(null);
    expect(within(story.closest("form")!).getByLabelText("Student")).toHaveValue("reader-b");
    const inference = within(screen.getByRole("group", { name: "inference" }));
    fireEvent.change(inference.getByLabelText("Correct"), { target: { value: "0" } });
    fireEvent.change(inference.getByLabelText("Questions"), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText("Reads at observed"), { target: { value: "2" } });
    const assessmentForm = inference.getByLabelText("Correct").closest("form")!;
    fireEvent.change(within(assessmentForm).getByLabelText("Student"), { target: { value: "reader-b" } });
    expect(inference.getByLabelText("Correct")).toHaveValue(null);
    expect(inference.getByLabelText("Questions")).toHaveValue(null);
    expect(screen.getByLabelText("Reads at observed")).toHaveValue("");
    expect(within(assessmentForm).getByLabelText("Student")).toHaveValue("reader-b");
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("keeps records visible on token refresh for the same adult", async () => {
    show();
    await screen.findByRole("button", { name: "Reader A" });
    mocks.listener("TOKEN_REFRESHED", { user: { id: "fixture-adult" } });
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Reader A" }),
      ).toBeInTheDocument(),
    );
  });
  it("lets a school admin filter real reading and skill totals across teachers", async () => {
    mocks.load.mockResolvedValue({ ...fixture,
      members: [
        { school_id: "school-a", user_id: "fixture-adult", role: "school_admin" },
        { school_id: "school-a", user_id: "fixture-teacher-b", role: "teacher" },
      ],
      classes: [...fixture.classes, { ...fixture.classes[0], id: "class-b", teacher_user_id: "fixture-teacher-b", name: "Fixture Class B" }],
      students: [...fixture.students, { ...fixture.students[0], id: "reader-b", display_name: "Reader B" }],
      enrollments: [...fixture.enrollments, { class_id: "class-b", school_id: "school-a", student_id: "reader-b" }],
      readings: [
        { id: "reading-a", class_id: "class-a", student_id: "reader-a", completed: true, minutes: 5 },
        { id: "reading-b", class_id: "class-b", student_id: "reader-b", completed: true, minutes: 10 },
      ],
      assessments: [
        { id: "assessment-a", class_id: "class-a", student_id: "reader-a", assessed_on: "2026-10-01", recorded_at: "2026-10-01", reading_grade: null, school_grade: null },
        { id: "assessment-b", class_id: "class-b", student_id: "reader-b", assessed_on: "2026-10-01", recorded_at: "2026-10-01", reading_grade: null, school_grade: null },
      ],
      scores: [
        { assessment_id: "assessment-a", skill: "context", correct: 1, total: 1 },
        { assessment_id: "assessment-b", skill: "context", correct: 0, total: 9 },
      ],
    });
    show();
    await screen.findByRole("button", { name: "Reader A" });
    const totals = () => within(screen.getByRole("heading", { name: "Across classes" }).closest("section")!);
    expect(totals().getByText("2", { selector: "strong" })).toBeInTheDocument();
    expect(totals().getByText("15", { selector: "strong" })).toBeInTheDocument();
    expect(totals().getByRole("row", { name: "context 1 / 10 10%" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Teacher", { selector: "nav select" }), { target: { value: "fixture-teacher-b" } });
    expect(screen.queryByRole("button", { name: "Reader A" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reader B" })).toBeInTheDocument();
    expect(totals().getByText("1", { selector: "strong" })).toBeInTheDocument();
    expect(totals().getByText("10", { selector: "strong" })).toBeInTheDocument();
    expect(totals().getByRole("row", { name: "context 0 / 9 0%" })).toBeInTheDocument();
    expect(screen.getByText("Assign an existing teacher account")).toBeInTheDocument();
  });
});
