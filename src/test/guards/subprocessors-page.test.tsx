// /subprocessors is a privacy disclosure (risk brain R-KID-01). Reviewer, 22 Nov 2026 (#163):
// tier headings implied a complete list, no answer sat under each question and Runware's link
// went to its home page. Coordinator, same day: the page must be TRUE: every vendor our code
// sends data to is listed (Anthropic, which no code calls, is not), no DPA badge without proof,
// and the owner's notice wording is the same on the page, in Q103 and in the DPA template.
import React from "react";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import Subprocessors, { subprocessors, tierAnswer } from "@/pages/Subprocessors";

const root = join(__dirname, "../../..");
afterEach(cleanup);
const page = () => render(<MemoryRouter><Subprocessors /></MemoryRouter>);
const squash = (t: string) => t.replace(/\s+/g, " ").trim();

// The owner's wording (her ruling, 22 Nov 2026): no promise to notify anyone in advance.
const NOTICE = "We update this list before a new subprocessor starts processing customer data. Schools and districts can ask us to email them when it changes.";

// Hosts in our code that receive no user data, each with the reason. Anything else found in
// code must be claimed by a card's `hosts`, or this guard fails.
const NO_USER_DATA: Record<string, string> = {
  "deno.land": "code modules the server functions import",
  "esm.sh": "code modules the server functions import",
  "cdn.jsdelivr.net": "code modules the server functions import",
  "ga.jspm.io": "code modules the server functions import",
  "unpkg.com": "code modules the server functions import",
  "schema.org": "structured-data vocabulary name, never fetched",
  "time-2-read.com": "our own site",
  "time2read.lovable.app": "our own preview site",
  "www.ftc.gov": "a link a parent can click in an email",
  "heygetonmylevel.com": "a link a person can click",
  "github.com": "a link in the page head",
  "billionairehighperformancecoach.com": "a link in the page head",
  "your-domain.com": "placeholder product image URL, never fetched by a reader",
  "httpbin.org": "NetworkRetryManager's connectivity ping; nothing imports that module",
};

function codeFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    const rel = relative(root, full);
    if (statSync(full).isDirectory()) return /^(src\/(test|pages|data)|node_modules)/.test(rel) ? [] : codeFiles(full);
    return /\.(ts|tsx|js)$/.test(name) && !/\.test\./.test(name) ? [full] : [];
  });
}
const hostsInCode = () => {
  const files = [...codeFiles(join(root, "supabase/functions")), ...codeFiles(join(root, "src")), join(root, "index.html")];
  const found = new Map<string, string>();
  const refs = new Set<string>();
  for (const f of files) {
    for (const m of readFileSync(f, "utf8").matchAll(/https:\/\/([a-z0-9-]+(?:\.[a-z0-9-]+)+)(\/@?[a-z0-9-]+)?/gi)) {
      const host = m[1].toLowerCase();
      if (!found.has(host)) found.set(host, relative(root, f));
      // A vendor reached through its SDK shows as a module path ("esm.sh/stripe").
      if (m[2] && host in NO_USER_DATA) refs.add(`${host}${m[2].toLowerCase()}`);
    }
  }
  return { found, refs: new Set([...refs, ...found.keys()]) };
};
const claims = (host: string, h: string) => host === h || host.endsWith(`.${h}`);

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
      // One clause per vendor shown, in order, each starting with that vendor's name.
      const clauses = answer.replace(/\.$/, "").split("; ");
      expect(clauses.map((c, i) => c.startsWith(`${vendors[i]} `))).toEqual(vendors.map(() => true));
      expect(clauses).toHaveLength(vendors.length);
    }
  });

  it("the answer follows the list: a vendor added or removed changes the sentence", () => {
    expect(tierAnswer([{ name: "A", role: "does x" }])).toBe("A does x.");
    expect(tierAnswer([{ name: "A", role: "does x" }, { name: "B", role: "does y" }])).toBe("A does x; B does y.");
    expect(tierAnswer([{ name: "A", role: "does x" }, { name: "B", role: "does y" }, { name: "C", role: "does z" }])).toBe("A does x; B does y; C does z.");
  });

  it("every vendor our code calls has a card, and every card's vendor is called by our code", () => {
    const { found, refs } = hostsInCode();
    // The scan reads real call sites (hard-fail on an empty or broken scan).
    expect(found.size).toBeGreaterThanOrEqual(15);
    expect(found.get("api.openai.com")).toMatch(/^supabase\/functions\//);
    const unclaimed = [...found].filter(([host]) =>
      !(host in NO_USER_DATA) && !subprocessors.some((sp) => sp.hosts.some((h) => claims(host, h))));
    expect(unclaimed.map(([h, f]) => `${h} (${f})`), "a host in code that no subprocessor card claims").toEqual([]);
    for (const sp of subprocessors.filter((s) => s.hosts.length)) {
      expect([...refs].some((ref) => sp.hosts.some((h) => claims(ref, h))), `${sp.name}: no code calls it`).toBe(true);
    }
    // Hosting and builds have no call site in code; nothing else may skip the check.
    expect(subprocessors.filter((s) => !s.hosts.length).map((s) => s.name).sort()).toEqual(["Cloudflare", "GitHub"]);
  });

  it("no DPA claim the repo cannot prove", () => {
    page();
    expect(document.body.textContent).not.toMatch(/DPA Signed|DPA Pending|Data Processing Agreements/i);
  });

  it("the owner's notice wording is the same on the page, in Q103 and in the DPA template", () => {
    page();
    const body = squash(document.body.textContent ?? "");
    const q103 = squash(readFileSync(join(root, "docs/compliance/SECURITY_QUESTIONNAIRE_ANSWERS.md"), "utf8").split("**Q103")[1].split("**Q104")[0]);
    const dpa = squash(readFileSync(join(root, "docs/compliance/DPA_TEMPLATE.md"), "utf8").split("## 5. Subprocessors")[1].split("## 6.")[0]);
    for (const [where, text] of [["page", body], ["Q103", q103], ["DPA template", dpa]]) {
      expect(text, where).toContain(NOTICE);
      expect(text, where).not.toMatch(/notify (affected|controller|customers)/i);
    }
  });

  it("every privacy link goes to a policy page, not a home page", () => {
    page();
    const links = screen.getAllByRole("link", { name: /Privacy Policy →/ }).map((a) => new URL(a.getAttribute("href")!));
    expect(links.length).toBe(subprocessors.filter((s) => s.privacyUrl).length);
    expect(links.length).toBeGreaterThanOrEqual(14);
    for (const u of links) expect(u.pathname, u.href).not.toMatch(/^\/?$/);
    expect(links.map((u) => u.href)).toContain("https://runware.ai/privacy");
    expect(screen.getAllByText("Publishes no privacy policy")).toHaveLength(subprocessors.filter((s) => !s.privacyUrl).length);
    // The OpenAI retention claim links its source rather than printing a bare URL that breaks the phone layout.
    expect(screen.getByRole("link", { name: "OpenAI API data controls →" }).getAttribute("href")).toBe("https://developers.openai.com/api/docs/guides/your-data");
  });
});
