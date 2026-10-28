import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useParentFormClarity } from "@/hooks/useParentFormClarity";

const read = (rel: string) => readFileSync(join(__dirname, "../../..", rel), "utf8");
const tags = () => document.querySelectorAll('script[src*="clarity.ms/tag/"]');

beforeEach(() => {
  // Node 26's optional global storage can shadow jsdom's; give the hook browser storage.
  const values = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    get length() { return values.size; },
    key: (index: number) => [...values.keys()][index] ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  });
  window.history.replaceState({}, "", "/");
});
afterEach(() => {
  tags().forEach((s) => s.remove());
  delete window.clarity;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Clarity stays with the signed-out parent's form", () => {
  it("is absent from the shell, guides and guest story flow; only the parent form opts in", () => {
    expect(read("index.html")).not.toMatch(/clarity\.ms|microsoft clarity/i);
    for (const path of ["src/App.tsx", "src/pages/Index.tsx", "src/components/GuestExperience.tsx", "src/pages/LandingPage.tsx"]) {
      expect(read(path), path).not.toContain("useParentFormClarity");
    }
    expect(read("src/components/LoginScreen.tsx")).toContain("useParentFormClarity(!showPasswordReset);");
  });

  it("loads the site's tag on entering the form and queues stop even if the tag is still downloading", () => {
    const { unmount } = renderHook(useParentFormClarity);
    expect(tags()).toHaveLength(1);
    expect(tags()[0].getAttribute("src")).toBe("https://www.clarity.ms/tag/z3erswoh8e");
    unmount();
    expect(window.clarity?.q?.map((args) => args[0])).toEqual(["stop"]);
  });

  it("stops the loaded recorder on leaving, restarts only on reentry, and never inserts a second tag", () => {
    const first = renderHook(useParentFormClarity);
    const recorder = vi.fn();
    window.clarity = recorder;
    first.unmount();
    expect(recorder.mock.calls).toEqual([["stop"]]);
    const second = renderHook(useParentFormClarity);
    expect(recorder.mock.calls).toEqual([["stop"], ["start"]]);
    expect(tags()).toHaveLength(1);
    second.unmount();
    expect(recorder.mock.calls).toEqual([["stop"], ["start"], ["stop"]]);
  });

  it("does not load outside the account form and stops when the form is replaced by the reset flow", () => {
    const { rerender, unmount } = renderHook(({ enabled }) => useParentFormClarity(enabled), { initialProps: { enabled: false } });
    expect(tags()).toHaveLength(0);
    rerender({ enabled: true });
    expect(tags()).toHaveLength(1);
    const recorder = vi.fn();
    window.clarity = recorder;
    rerender({ enabled: false });
    expect(recorder.mock.calls).toEqual([["stop"]]);
    unmount();
  });

  it.each(["#access_token=example", "?type=magiclink", "?type=signup", "?type=recovery", "?type=invite"])("never loads on a session link (%s)", (suffix) => {
    window.history.replaceState({}, "", `/auth${suffix}`);
    const { unmount } = renderHook(useParentFormClarity);
    expect(tags()).toHaveLength(0);
    expect(window.clarity).toBeUndefined();
    unmount();
  });

  it("never restarts a signed-in family's stopped recorder", () => {
    localStorage.setItem("sb-example-auth-token", "stored-session");
    const recorder = vi.fn();
    window.clarity = recorder;
    const { unmount } = renderHook(useParentFormClarity);
    expect(tags()).toHaveLength(0);
    expect(recorder).not.toHaveBeenCalled();
    unmount();
  });

  it("does not record when storage is blocked", () => {
    vi.spyOn(localStorage, "length", "get").mockImplementation(() => { throw new Error("blocked"); });
    const { unmount } = renderHook(useParentFormClarity);
    expect(tags()).toHaveLength(0);
    expect(window.clarity).toBeUndefined();
    unmount();
  });
});
