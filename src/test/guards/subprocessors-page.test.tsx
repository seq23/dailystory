// /subprocessors is a privacy disclosure (risk brain R-KID-01). Reviewer, 22 Nov 2026 (#163):
// tier headings implied a complete list, no answer sat under each question and Runware's link
// went to its home page. Coordinator, same day: the page must be TRUE: every vendor our code
// sends data to is listed (Anthropic, which no code calls, is not), and the owner's notice wording
// is the same on the page, in Q103 and in the DPA template. Owner, same day: 6 of the 9 tracked
// vendors have a signed DPA and 3 are in progress; the badges show exactly what the tracker records,
// and no doc says AI vendors get no personal information (OpenAI and ElevenLabs get the child's
// first name).
import React from "react";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import Subprocessors, { tierAnswer } from "@/pages/Subprocessors";
import Privacy from "@/pages/Privacy";
import DataTransfers from "@/pages/DataTransfers";
import { subprocessors, type Subprocessor } from "@/data/subprocessors";

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


// VENDOR_DPA_TRACKER.md's status matrix: "| **Vendor** | … | ✅ Signed | … |" per row.
const TRACKER = "docs/compliance/VENDOR_DPA_TRACKER.md";
type DpaRow = { name: string; dpa: NonNullable<Subprocessor["dpa"]> | "other" };
const trackerRows = (md: string): DpaRow[] =>
  [...md.split("## Vendor DPA Status Matrix")[1]?.split("\n---")[0].matchAll(/^\| \*\*([^*]+)\*\* \|.*\| (✅ Signed|⏳ In progress|[^|]+) \| [^|]+ \|$/gm) ?? []]
    .map((m) => ({ name: m[1], dpa: m[2] === "✅ Signed" ? "signed" : m[2] === "⏳ In progress" ? "in-progress" : "other" }));
/** Problems by name; empty = every badge on the page is what the tracker records. */
function dpaProblems(vendors: Pick<Subprocessor, "name" | "dpa">[], rows: DpaRow[]): string[] {
  if (rows.length === 0) return ["the tracker's status table parsed to zero rows (the table moved)"];
  const problems: string[] = [];
  for (const v of vendors) {
    const row = rows.find((r) => r.name === v.name);
    if (!row && v.dpa) problems.push(`${v.name}: shows "${v.dpa}" but the tracker has no row`);
    if (row && row.dpa !== (v.dpa ?? "none")) problems.push(`${v.name}: page "${v.dpa ?? "none"}", tracker "${row.dpa}"`);
  }
  return problems;
}
// Counts like "6 of 9 vendor DPAs" or "9/9 signed" anywhere in the compliance docs must match the
// tracker. SECURITY_QUESTIONNAIRE_ANSWERS.md is read as written (owner, 22 Nov 2026).
const COUNT_CLAIM = /\b(?:all\s+)?(\d+)\s*(?:of|\/)\s*(\d+)\b(?=[^|\n]{0,30}(?:vendor|DPA|signed))|\ball\s+(\d+)\s+vendor DPAs/gi;
function countProblems(docs: { path: string; text: string }[], signed: number, total: number): string[] {
  return docs.flatMap(({ path, text }) => [...text.matchAll(COUNT_CLAIM)]
    .filter((m) => (m[3] ? [m[3], m[3]] : [m[1], m[2]]).join("/") !== `${signed}/${total}`)
    .map((m) => `${path}: "${m[0]}" but the tracker records ${signed} of ${total}`));
}
// "AI vendors get no personal information" in any of its forms: false since OpenAI and ElevenLabs
// receive the child's first name (owner rulings, 22 Nov 2026).
const NO_PII_CLAIM = /\bno PII\b|no personal(?:ly identifiable)? information|zero personal information|no direct identifiers|\bnot PII\b|PII stripping|anonymi[sz]ed prompts|no user identifiers/i;
const complianceDocs = () => readdirSync(join(root, "docs/compliance")).filter((f) => f.endsWith(".md"))
  .map((f) => ({ path: `docs/compliance/${f}`, text: readFileSync(join(root, "docs/compliance", f), "utf8") }));

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

  it("each DPA badge is what the tracker records: 6 of 9 signed, 3 in progress", () => {
    const rows = trackerRows(readFileSync(join(root, TRACKER), "utf8"));
    // Her ruling, 22 Nov 2026: these six signed (accepting the vendor's terms counts), these three in progress.
    expect(rows.filter((r) => r.dpa === "signed").map((r) => r.name).sort()).toEqual(["Cloudflare", "GitHub", "OpenAI", "Resend", "Stripe", "Supabase"]);
    expect(rows.filter((r) => r.dpa === "in-progress").map((r) => r.name).sort()).toEqual(["Anthropic", "ElevenLabs", "Runware"]);
    expect(rows).toHaveLength(9);
    expect(dpaProblems(subprocessors, rows)).toEqual([]);
    page();
    const shown = (id: string) => screen.queryAllByTestId(id).map((b) => b.closest(".min-w-0")!.querySelector("h3")!.textContent).sort();
    expect(shown("dpa-signed")).toEqual(["Cloudflare", "GitHub", "OpenAI", "Resend", "Stripe", "Supabase"]);
    expect(shown("dpa-in-progress")).toEqual(["ElevenLabs", "Runware"]);
    expect(screen.getAllByText("DPA signed")).toHaveLength(6);
    expect(screen.getAllByText("DPA in progress")).toHaveLength(2);
  });

  it("the DPA check catches a badge the tracker does not back", () => {
    const rows = trackerRows(readFileSync(join(root, TRACKER), "utf8"));
    const flip = (name: string, dpa: Subprocessor["dpa"]) => subprocessors.map((v) => (v.name === name ? { ...v, dpa } : v));
    expect(dpaProblems(flip("ElevenLabs", "signed"), rows)).toEqual(['ElevenLabs: page "signed", tracker "in-progress"']);
    expect(dpaProblems(flip("Google Fonts", "signed"), rows)).toEqual(['Google Fonts: shows "signed" but the tracker has no row']);
    expect(dpaProblems(flip("Stripe", undefined), rows)).toEqual(['Stripe: page "none", tracker "signed"']);
    expect(dpaProblems(subprocessors, [])).toHaveLength(1);
    expect(trackerRows("| **Runware** | x | y | ✅ Signed | z |")).toEqual([]);
  });

  it("every DPA count in the compliance docs matches the tracker", () => {
    const rows = trackerRows(readFileSync(join(root, TRACKER), "utf8"));
    const docs = complianceDocs().filter((d) => !d.path.endsWith("SECURITY_QUESTIONNAIRE_ANSWERS.md"));
    expect(docs.length).toBeGreaterThanOrEqual(10);
    const signed = rows.filter((r) => r.dpa === "signed").length;
    expect(countProblems(docs, signed, rows.length)).toEqual([]);
    // It sees the counts it checks, and catches the ones that were there before 22 Nov 2026.
    expect(docs.flatMap((d) => [...d.text.matchAll(COUNT_CLAIM)]).length).toBeGreaterThanOrEqual(4);
    for (const bad of ["All 9 vendor DPAs signed or accepted", "| Vendor DPAs | ✅ Done | 9/9 signed or accepted |"]) {
      expect(countProblems([{ path: "x.md", text: bad }], signed, rows.length), bad).toHaveLength(1);
    }
  });

  it("no compliance doc or public page says AI vendors get no personal information", () => {
    const docs = complianceDocs();
    expect(docs.length).toBeGreaterThanOrEqual(10);
    for (const { path, text } of docs) expect(text.match(NO_PII_CLAIM)?.[0], path).toBeUndefined();
    for (const [name, el] of [["/subprocessors", <Subprocessors />], ["/privacy", <Privacy />], ["/data-transfers", <DataTransfers />]] as const) {
      const { container, unmount } = render(<MemoryRouter>{el}</MemoryRouter>);
      expect(container.textContent!.match(NO_PII_CLAIM)?.[0], name).toBeUndefined();
      unmount();
    }
    for (const bad of ["Story prompts (no PII)", "AI vendors receive prompts/text with no personal information.", "receive **zero personal information**", "| No PII in prompts |"]) {
      expect(bad, bad).toMatch(NO_PII_CLAIM);
    }
  });

  it("the privacy policy, the transfers page and Q96 name every subprocessor from the one list", () => {
    const q96 = readFileSync(join(root, "docs/compliance/SECURITY_QUESTIONNAIRE_ANSWERS.md"), "utf8").split("**Q96")[1].split("**Q97")[0];
    for (const [name, el] of [["/privacy", <Privacy />], ["/data-transfers", <DataTransfers />]] as const) {
      const { container, unmount } = render(<MemoryRouter>{el}</MemoryRouter>);
      for (const v of subprocessors) expect(container.textContent, `${name} names ${v.name}`).toContain(v.name);
      expect(container.textContent, `${name} names no vendor we do not use`).not.toMatch(/Anthropic/);
      for (const v of subprocessors.filter((x) => x.dpa)) {
        expect(container.textContent, `${name}: ${v.name}`).toMatch(new RegExp(`${v.name}[^]*?${v.dpa === "signed" ? "DPA signed" : "DPA in progress"}`));
      }
      unmount();
    }
    for (const v of subprocessors) expect(q96, `Q96 names ${v.name}`).toContain(v.name);
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
