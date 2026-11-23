// R-KID-01 in the browser (22 Nov 2026): the Child's Name field is never spell-checked (that
// sent the name to an AI model), and every AI function call from the real Supabase client
// carries the reader's names, so the server can mask a guest's name too
// (src/lib/readerNames.ts, supabase/functions/_shared/privacyLane.ts).
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { forgetReaderNames, readerNames, withReaderNames } from "@/lib/readerNames";

const invoke = vi.hoisted(() => vi.fn(async () => ({ data: null, error: null })));

beforeEach(() => {
  forgetReaderNames();
  try { localStorage.clear(); } catch { /* none */ }
  delete (window as unknown as { __currentUserName?: string }).__currentUserName;
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.doUnmock("@/integrations/supabase/client");
  vi.resetModules();
});

describe("the Child's Name field", () => {
  it("is never sent for spell-checking, and the typed name is kept for masking", async () => {
    vi.doMock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke }, auth: { getUser: async () => ({ data: { user: null } }) } } }));
    const fetchSpy = vi.fn(async (_i: RequestInfo | URL) => new Response("{}"));
    vi.stubGlobal("fetch", fetchSpy);
    const { FormStep1Essential } = await import("@/components/forms/steps/FormStep1Essential");
    const names = await import("@/lib/readerNames");
    const formData = { name: "", age: 7, grade: "2", nativeLanguage: "en" } as never;
    render(
      <FormStep1Essential formData={formData} onUpdate={() => {}} onComplete={() => {}} validationErrors={[]} showValidationErrors={false}
        onQuickSubmit={() => {}} onAdvanceToStep={() => {}} canSubmit={false} canAdvance={false} />,
    );
    fireEvent.change(screen.getByLabelText(/name/i, { selector: "input" }), { target: { value: "Zephyrine" } });
    await new Promise((r) => setTimeout(r, 50));
    expect(invoke).not.toHaveBeenCalled();
    expect(fetchSpy.mock.calls.map((c) => String(c[0]))).toEqual([]);
    expect(names.readerNames()).toContain("Zephyrine");
  });
});

describe("withReaderNames", () => {
  const base = () => vi.fn(async (_i: RequestInfo | URL, _init?: RequestInit) => new Response("{}"));

  it("adds the reader's names to an AI function's JSON body, and to nothing else", async () => {
    localStorage.setItem("user_display_name", "Zephyrine");
    const f = base();
    const wrapped = withReaderNames(f as unknown as typeof fetch);
    await wrapped("https://p.supabase.co/functions/v1/translate-universal", { method: "POST", body: JSON.stringify({ text: "hola", readerNames: ["Quillon"] }) });
    await wrapped("https://p.supabase.co/functions/v1/create-checkout", { method: "POST", body: JSON.stringify({ plan: "x" }) });
    await wrapped("https://p.supabase.co/rest/v1/child_profiles", { method: "POST", body: JSON.stringify({ a: 1 }) });
    expect(JSON.parse(String(f.mock.calls[0][1]?.body)).readerNames).toEqual(["Quillon", "Zephyrine"]);
    expect(JSON.parse(String(f.mock.calls[1][1]?.body))).toEqual({ plan: "x" });
    expect(JSON.parse(String(f.mock.calls[2][1]?.body))).toEqual({ a: 1 });
  });

  it("leaves a body it cannot read as it was", async () => {
    localStorage.setItem("user_display_name", "Zephyrine");
    const f = base();
    await withReaderNames(f as unknown as typeof fetch)("https://p.supabase.co/functions/v1/correct-spelling", { method: "POST", body: "not json" });
    expect(f.mock.calls[0][1]?.body).toBe("not json");
  });

  it("ignores the 'guest' placeholder and blank names", () => {
    (window as unknown as { __currentUserName?: string }).__currentUserName = "guest";
    localStorage.setItem("user_display_name", " ");
    expect(readerNames()).toEqual([]);
  });

  it("is what the real Supabase client sends with an AI call", async () => {
    localStorage.setItem("user_display_name", "Zephyrine");
    const seen: Array<{ url: string; body: string }> = [];
    vi.stubGlobal("fetch", vi.fn(async (i: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof i === "string" ? i : i instanceof URL ? i.href : i.url;
      seen.push({ url, body: typeof init?.body === "string" ? init.body : "" });
      return new Response(JSON.stringify({ pass: "p", expiresAt: Math.floor(Date.now() / 1000) + 3600 }), { status: 200, headers: { "Content-Type": "application/json" } });
    }));
    vi.resetModules();
    const { supabase } = await vi.importActual<typeof import("@/integrations/supabase/client")>("@/integrations/supabase/client");
    await supabase.functions.invoke("translate-universal", { body: { text: "hola", targetLanguage: "en" } });
    const call = seen.find((s) => /\/functions\/v1\/translate-universal/.test(s.url));
    expect(call, JSON.stringify(seen.map((s) => s.url))).toBeTruthy();
    expect(JSON.parse(call!.body).readerNames).toEqual(["Zephyrine"]);
  });
});
