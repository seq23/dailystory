// Risk guard for the buyer-facing school/district packet (docs/sales): no false
// compliance or medical claims, no emails or keys in this public repo, unmerged
// school features labelled planned, and commercial bands marked as a proposal.
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

  it("labels unmerged school features as planned and the commercial bands as a proposal", () => {
    for (const name of packet.filter((n) => n !== "README.md")) {
      expect(read(`docs/sales/${name}`), name).toMatch(/planned\s*\/\s*PR #130/i);
    }
    const pricing = read("docs/sales/pricing-proposal.md");
    expect(pricing).toMatch(/Proposal only/);
    expect(pricing).toMatch(/not implemented/);
    expect(read("docs/sales/privacy-security.md")).toMatch(/not a certification or legal conclusion/);
  });
});
