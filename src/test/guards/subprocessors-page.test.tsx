// /subprocessors is a privacy disclosure (risk brain R-KID-01). Reviewer, 22 Nov 2026 (#163):
// a tier heading implied it was the complete list of who gets personal data, "only" overclaimed,
// no answer sat under each question, the two notice promises disagreed and Runware's link
// went to its home page.
import React from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import Subprocessors, { tierAnswer } from "@/pages/Subprocessors";

const root = join(__dirname, "../../..");
afterEach(cleanup);
const page = () => render(<MemoryRouter><Subprocessors /></MemoryRouter>);

describe("/subprocessors", () => {
  it("each tier question is answered by a sentence built from the vendors shown under it", () => {
    page();
    const tiers = screen.getAllByRole("region");
    expect(tiers).toHaveLength(3);
    for (const tier of tiers) {
      const question = within(tier).getByRole("heading", { level: 2 }).textContent ?? "";
      expect(question).toMatch(/\?/);
      // No tier heading claims to be the whole set, or that a tier does nothing else.
      expect(question).not.toMatch(/\bonly\b|personal data\?/i);
      const vendors = within(tier).getAllByRole("heading", { level: 3 }).map((h) => h.textContent ?? "");
      expect(vendors.length).toBeGreaterThan(0);
      const answer = within(tier).getByTestId(/^tier-answer-/).textContent ?? "";
      for (const v of vendors) expect(answer, `${v} is named in its tier's answer`).toContain(v);
      const elsewhere = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent ?? "").filter((n) => !vendors.includes(n));
      for (const n of elsewhere) expect(answer, `${n} belongs to another tier`).not.toContain(n);
    }
  });

  it("the answer follows the list: a vendor added or removed changes the sentence", () => {
    expect(tierAnswer([{ name: "A", role: "does x" }])).toBe("A does x.");
    expect(tierAnswer([{ name: "A", role: "does x" }, { name: "B", role: "does y" }])).toBe("A does x; B does y.");
    expect(tierAnswer([{ name: "A", role: "does x" }, { name: "B", role: "does y" }, { name: "C", role: "does z" }])).toBe("A does x; B does y; C does z.");
  });

  it("one notice promise, the stricter one, on the page and in the security questionnaire", () => {
    page();
    const promises = screen.getAllByText(/notif/i).map((p) => p.textContent ?? "");
    expect(promises.length).toBeGreaterThanOrEqual(2);
    for (const p of promises) {
      expect(p).toMatch(/notify affected customers before adding/i);
      expect(p).not.toMatch(/material|enterprise customers/i);
    }
    const q103 = readFileSync(join(root, "docs/compliance/SECURITY_QUESTIONNAIRE_ANSWERS.md"), "utf8").split("**Q103")[1].split("**Q104")[0];
    expect(q103).toMatch(/notify affected customers before adding a new subprocessor/);
    expect(q103).not.toMatch(/material/);
  });

  it("every privacy link goes to a policy page, not a home page", () => {
    page();
    const links = screen.getAllByRole("link", { name: /Privacy Policy →/ }).map((a) => new URL(a.getAttribute("href")!));
    expect(links.length).toBe(9);
    for (const u of links) expect(u.pathname, u.href).not.toMatch(/^\/?$/);
    expect(links.map((u) => u.href)).toContain("https://runware.ai/privacy");
    // The OpenAI retention claim links its source rather than printing a bare URL that breaks the phone layout.
    expect(screen.getByRole("link", { name: "OpenAI API data controls →" }).getAttribute("href")).toBe("https://developers.openai.com/api/docs/guides/your-data");
  });
});
