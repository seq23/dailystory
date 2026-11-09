// Risk guard for the buyer-facing school/district packet (docs/sales): no false
// compliance or medical claims, no emails or keys in this public repo, the merged
// school workspace called live, unbuilt features labelled planned, partner terms
// without numbers, and commercial bands marked as a proposal.
// Moves to the Risk brain later; wording, packet layout and links are not pinned.
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../../..");
const read = (file: string) => readFileSync(join(root, file), "utf8");
const packet = readdirSync(join(root, "docs/sales")).filter((n) => n.endsWith(".md"));

describe("institutional sales claims stay honest", () => {
  it("makes no compliance, certification or clinical claims and carries no emails or keys", () => {
    expect(packet.length).toBeGreaterThanOrEqual(5); // zero documents scanned is a failure
    for (const name of packet) {
      const body = read(`docs/sales/${name}`);
      expect(body, name).not.toMatch(/\b(?:we are|is|are|fully)\s+(?:(?:COPPA|FERPA|GDPR)[ -]compliant|SOC\s*2(?:\s+Type\s+II)?[ -]certified)/i);
      expect(body, name).not.toMatch(/\b(?:clinically proven|treats dyslexia|cures dyslexia|guaranteed (?:grade|reading|literacy) gains)\b/i);
      expect(body, name).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
      expect(body, name).not.toMatch(/\b(?:sk|pk)_(?:live|test)_[a-z0-9]+|\bsk-[a-z0-9]{20,}/i);
    }
  });

  it("calls the merged school workspace live, keeps unbuilt features planned and the bands a proposal", () => {
    // PR #130 (school workspace) merged 31 Oct 2026: no document may still call it planned
    // or unmerged, and every buyer document still labels what is not built as planned.
    for (const name of packet.filter((n) => n !== "README.md")) {
      const body = read(`docs/sales/${name}`);
      expect(body, name).not.toMatch(/planned\s*\/\s*PR #130|open PR #130|open (?:institution )?branch|\bunmerged\b|\bnot (?:yet )?merged\b/i);
      expect(body, name).toMatch(/\bplanned\b/i);
      expect(body, name).not.toMatch(/\b(?:supports|offers|includes|provides|has)\s+(?:student\s+)?(?:SSO|single sign-on|live roster)/i);
    }

    // The campaign builder copies "## Live today" bullets straight into pitches.
    const caps = read("docs/sales/capabilities.md");
    const live = caps.split(/^## Live today\s*$/m)[1]?.split(/^## /m)[0] ?? "";
    const bullets = live.split("\n").filter((l) => l.startsWith("- "));
    expect(bullets.length).toBeGreaterThanOrEqual(10); // an empty section is a failure
    const unbuilt = /planned|proposal|not built|\bSSO\b|single sign-on|student sign-in|log ?in|live roster|Clever|ClassLink|institutional billing|district-wide|sponsor portal|reading gains?|grade jump|dyslexi/i;
    const premiumOnly = /what happens next|3 choices|quizzes after reading|practice words|step up|keep going|guardrails/i;
    for (const b of bullets) {
      expect(b).not.toMatch(unbuilt);
      if (premiumOnly.test(b)) expect(b, "Premium-only feature without its limit").toMatch(/Premium/);
    }
    const dontImply = caps.split(/^## Do not imply\s*$/m)[1] ?? "";
    for (const term of [/SSO/, /student sign-in/i, /live roster connection/i, /institutional billing/i, /district-wide/i, /sponsor/i, /English/]) {
      expect(dontImply).toMatch(term);
    }

    // Partner pricing and revenue share may be offered, never with numbers before a buyer talks.
    const partnership = read("docs/sales/partnership.md");
    const shareSentences = partnership.split(/(?<=[.!?])\s+/).filter((s) => /revenue share|partner pricing/i.test(s));
    expect(shareSentences.length).toBeGreaterThanOrEqual(1);
    for (const s of shareSentences) expect(s).not.toMatch(/\d|%|percent/i);
    expect(partnership).toMatch(/no exclusivity/i);
    for (const name of packet) {
      expect(read(`docs/sales/${name}`), name).not.toMatch(/\b(?:exclusive (?:rights|territory|partner)|exclusivity is (?:offered|available))\b/i);
    }

    const pricing = read("docs/sales/pricing-proposal.md");
    expect(pricing).toMatch(/Proposal only/);
    expect(pricing).toMatch(/not implemented/);
    expect(read("docs/sales/privacy-security.md")).toMatch(/not a certification or legal conclusion/);
  });
});
