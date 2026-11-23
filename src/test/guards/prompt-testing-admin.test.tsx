// Guard: /prompt-testing (cost analytics, template and voice test panels) is for the
// owner's admin account only. A logged-out visit, an auth outage and a refused or
// failed server check are all refused; only a server-confirmed admin sees the page.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const mocks = vi.hoisted(() => ({ getSession: vi.fn(), invoke: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  auth: { getSession: () => mocks.getSession() },
  functions: { invoke: (...a: unknown[]) => mocks.invoke(...a) },
} }));

import { AdminOnly } from "@/components/AdminOnly";

const session = { data: { session: { user: { id: "u1" }, access_token: "tok" } }, error: null };
const show = () => render(<MemoryRouter><AdminOnly><p>TEAM-ONLY-CONTENT</p></AdminOnly></MemoryRouter>);
const settled = async (access: string) => {
  await waitFor(() => expect(screen.getByTestId("admin-only").dataset.access).toBe(access));
  expect(screen.queryByText("TEAM-ONLY-CONTENT")).toBeNull();
};

describe("/prompt-testing is behind the admin gate", () => {
  afterEach(() => { cleanup(); mocks.getSession.mockReset(); mocks.invoke.mockReset(); });

  it("each team-only route renders its page only inside AdminOnly", () => {
    const app = readFileSync(join(__dirname, "../../App.tsx"), "utf8");
    // /template-testing and /admin/voices were open to anyone until 23 Nov 2026 (d10 audit).
    for (const [path, page] of [["/prompt-testing", "PromptTesting"], ["/prompt-studio", "PromptStudio"],
      ["/template-testing", "TemplateTestingPage"], ["/admin/voices", "VoiceAdmin"]]) {
      const routes = app.match(new RegExp(`<Route path="${path}"[^\\n]*`, "g")) ?? [];
      expect(routes, path).toEqual([`<Route path="${path}" element={<AdminOnly><${page} /></AdminOnly>} />`]);
    }
  });

  it("a logged-out visit is refused and never asks the server", async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    show();
    await settled("signed_out");
    expect(screen.getByRole("link", { name: "Sign in" })).toBeTruthy();
    expect(mocks.invoke).not.toHaveBeenCalled();
  });

  it("a session read that fails (outage) is refused", async () => {
    mocks.getSession.mockRejectedValue(new Error("auth down"));
    show();
    await settled("refused");
  });

  it("a session read that returns an error is refused, even with a stale session in it", async () => {
    mocks.getSession.mockResolvedValue({ data: session.data, error: new Error("503") });
    mocks.invoke.mockResolvedValue({ data: { overrides: [] }, error: null });
    show();
    await settled("signed_out");
  });

  it("a signed-in account the server refuses (403) is refused", async () => {
    mocks.getSession.mockResolvedValue(session);
    mocks.invoke.mockResolvedValue({ data: null, error: { context: { status: 403 } } });
    show();
    await settled("refused");
    expect(mocks.invoke).toHaveBeenCalledWith("voice-overrides-admin", { body: { action: "list" } });
  });

  it("a server check that throws (network) is refused", async () => {
    mocks.getSession.mockResolvedValue(session);
    mocks.invoke.mockRejectedValue(new Error("network"));
    show();
    await settled("refused");
  });

  it("the admin account the server confirms sees the page", async () => {
    mocks.getSession.mockResolvedValue(session);
    mocks.invoke.mockResolvedValue({ data: { overrides: [] }, error: null });
    show();
    expect(await screen.findByText("TEAM-ONLY-CONTENT")).toBeTruthy();
    expect(screen.queryByTestId("admin-only")).toBeNull();
  });
});
