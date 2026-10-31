// Public institutional collateral must keep proposals and unmerged features
// distinct from available product, and preserve the retired guide verbatim.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../../..");
const read = (file: string) => readFileSync(join(root, file), "utf8");
const packet = [
  "README.md", "overview.md", "district.md", "school.md", "library.md",
  "pricing-proposal.md", "privacy-security.md", "outcomes-measurement.md",
  "implementation.md", "faq.md", "partnership.md", "capabilities.md",
];
const sha = "d061c637dc568c7f73b7d6f4e96d5bebcb1bedea";
const reviewed = `https://github.com/seq23/dailystory/blob/${sha}/`;

describe("institutional sales claims stay reviewable and honest", () => {
  it("provides the full packet, with English stories, UI language scope and age/grade limits", () => {
    expect(readdirSync(join(root, "docs/sales")).sort()).toEqual([...packet].sort());
    for (const name of packet) {
      const body = read(`docs/sales/${name}`);
      expect(body, name).toMatch(/ages 3-15/);
      expect(body, name).toMatch(/Pre-K-10th grade/);
      expect(body, name).toMatch(/Stories are English\s+only/i);
      expect(body, name).toMatch(/UI\s+has 8 languages/i);
      expect(body, name).not.toMatch(/\bno screens\b|\bscreen[ -]free\b|\banti[ -]AI\b/i);
      expect(body, name).not.toMatch(/\b(?:we are|is|are|fully)\s+(?:(?:COPPA|FERPA|GDPR)[ -]compliant|SOC\s*2(?:\s+Type\s+II)?[ -]certified)/i);
      expect(body, name).not.toMatch(/\b(?:clinically proven|treats dyslexia|cures dyslexia|guaranteed (?:grade|reading|literacy) gains)\b/i);
      expect(body, name).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
      expect(body, name).not.toMatch(/\b(?:sk|pk)_(?:live|test)_[a-z0-9]+|\bsk-[a-z0-9]{20,}/i);
    }
  });

  it("labels school features as planned in every buyer-facing document", () => {
    for (const name of packet.filter((name) => name !== "README.md")) {
      expect(read(`docs/sales/${name}`), name).toMatch(/planned\s*\/\s*PR #130/i);
    }
    const evidence = read("docs/sales/capabilities.md");
    expect(evidence).toContain(`${reviewed}docs/phase-8-institutions.md`);
    expect(evidence).toContain("dba5f5a80b2ce63b58afa7dba175335dea595bcd");
    for (const name of ["overview.md", "district.md", "school.md", "library.md", "faq.md", "partnership.md"]) {
      const body = read(`docs/sales/${name}`);
      expect(body, name).toMatch(/(?:not|no|does not|do not)[^.]*automatic(?:ally)?[^.]*(?:family|reading|activity)|family[^.]*do\s+not automatically/i);
      expect(body, name).toMatch(/\b(?:not merged|unmerged|open branch|not yet merged|not live)\b/i);
    }
  });

  it("marks commercial bands as proposals and keeps annual arithmetic and size escalation correct", () => {
    const doc = read("docs/sales/pricing-proposal.md");
    expect(doc).toMatch(/Proposal only/);
    expect(doc).toMatch(/not implemented/);
    expect(doc).toMatch(/both\*\* enrollment and sites/);
    const rows = [...doc.matchAll(/^\| (Institutional program|Institutional network|Large network|Enterprise) \| (.+?) \| (.+?) \| (From )?\$([\d,]+) \| (From )?\$([\d,]+) \|$/gm)];
    expect(rows).toHaveLength(4);
    const expected = [
      ["Up to 1,000", "Up to 5", 10000],
      ["Up to 3,000", "Up to 15", 20000],
      ["Up to 8,000", "Up to 40", 40000],
      ["Above 8,000 or 40 sites", "Custom", 60000],
    ];
    rows.forEach((row, index) => {
      const monthly = Number(row[5].replace(/,/g, ""));
      const annual = Number(row[7].replace(/,/g, ""));
      expect([row[2], row[3], monthly]).toEqual(expected[index]);
      expect(annual).toBe(monthly * 12);
    });
  });

  it("links privacy evidence and discloses measurement and implementation limitations", () => {
    const privacy = read("docs/privacy/sales-review.md");
    for (const name of ["data-inventory.md", "coppa-ferpa-readiness.md", "ndpa-exhibits-draft.md"]) {
      expect(privacy).toContain(`${reviewed}docs/privacy/${name}`);
    }
    const security = read("docs/sales/privacy-security.md");
    expect(security).toContain("../privacy/sales-review.md");
    expect(security).toMatch(/not a certification or legal conclusion/);
    expect(security).toMatch(/lacks automated retention and a school export workflow/);
    const measurement = read("docs/sales/outcomes-measurement.md");
    expect(measurement).toMatch(/not a report of measured customer outcomes/);
    expect(measurement).toMatch(/account-level/);
    expect(measurement).toMatch(/paired\/total coverage/);
    expect(measurement).toMatch(/summed correct answers\s+divided by summed question counts/);
    expect(measurement).toMatch(/missing data is not zero/);
    expect(read("docs/sales/implementation.md")).toMatch(/planning sequence, not a promised delivery date/);
  });

  it("has no broken local links in the packet, privacy index or archive notice", () => {
    const files = packet.map((name) => `docs/sales/${name}`).concat([
      "docs/privacy/sales-review.md", "docs/archive/sales/README.md",
    ]);
    for (const file of files) {
      for (const match of read(file).matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
        const target = match[1];
        if (/^https?:\/\/|^#/.test(target)) continue;
        expect(existsSync(resolve(root, dirname(file), target.split("#")[0])), `${file}: ${target}`).toBe(true);
      }
    }
  });

  it("archives the old PDF without deleting or altering its content", () => {
    const archived = "docs/archive/sales/Time2Read_Enterprise_Sales_Guide_v4.pdf";
    expect(createHash("sha256").update(readFileSync(join(root, archived))).digest("hex"))
      .toBe("3a7578f16bcd017d1284bb54264ac1caefb7b5d01770c6102bd67268ccd83d58");
    expect(existsSync(join(root, "docs/sales/Time2Read_Enterprise_Sales_Guide_v4.pdf"))).toBe(false);
    expect(read("docs/archive/sales/README.md")).toMatch(/historical only/);
    expect(read("docs/sales/README.md")).toContain("../archive/sales/README.md");
  });
});
