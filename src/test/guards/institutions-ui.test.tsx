import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
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
});
