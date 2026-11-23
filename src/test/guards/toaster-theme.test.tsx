// The site has one light theme (no dark class is ever set), so a toast must stay light on a phone
// set to dark mode. Before 22 Nov 2026 the toaster followed the OS ("system") and turned dark there.
import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Toaster, toast } from "@/components/ui/sonner";

const darkPhone = (query: string) => ({
  matches: query.includes("prefers-color-scheme: dark"),
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

describe("toaster theme", () => {
  const original = window.matchMedia;
  afterEach(() => { window.matchMedia = original; });

  it("stays light when the phone is set to dark", async () => {
    window.matchMedia = vi.fn(darkPhone) as unknown as typeof window.matchMedia;
    const { container } = render(<Toaster />);
    await act(async () => { toast("Saved"); await new Promise((r) => setTimeout(r, 50)); });
    const toaster = container.ownerDocument.querySelector("[data-sonner-toaster]");
    expect(toaster, "a toast was drawn").not.toBeNull();
    expect(toaster!.getAttribute("data-theme")).toBe("light");
  });
});
