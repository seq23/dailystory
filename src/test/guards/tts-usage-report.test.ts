// Guard: the TTS usage report is an alert, not a weekly printout nobody reads (owner, 1 Nov 2026).
// Pins: no schedule; it runs after each Edge Functions deploy and on dispatch; it fails with a
// NAMED reason under 20% credits or after a browser-voice fallback in the last 7 days; quiet otherwise.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LOW_CREDIT_SHARE, ttsAlerts } from "../../../scripts/tts-usage-alert.mjs";

const ROOT = join(__dirname, "../../..");
const WF = readFileSync(join(ROOT, ".github/workflows/tts-usage-report.yml"), "utf8");
const codes = (u: unknown, r: number) => ttsAlerts(u, r).map((a: { code: string }) => a.code);
const healthy = { key_present: true, character_count: 10_000, character_limit: 100_000, next_reset: "2026-12-01T00:00:00.000Z" };

describe("tts-usage-report workflow", () => {
  it("has no schedule; runs after the Edge Functions deploy and on dispatch", () => {
    expect(WF).not.toMatch(/^\s*schedule:/m);
    expect(WF).not.toMatch(/-\s*cron:/);
    expect(WF).toMatch(/workflow_run:\s*\n\s*workflows:\s*\["Deploy Edge Functions"\]/);
    expect(WF).toMatch(/^\s*workflow_dispatch:/m);
  });
  it("ends in the alert step, fed the 7-day refusals and the credits", () => {
    expect(WF).toContain("node scripts/tts-usage-alert.mjs");
    // Actions runs bash with -e: the exit code is captured, so a PR can downgrade the reasons to warnings.
    expect(WF).toContain("|| rc=$?");
    expect(WF).toContain("el_refusals_last_7d");
    expect(WF).toContain("interval '7 days'");
    expect(WF).toContain("steps.credits.outputs.usage");
  });
});

describe("ttsAlerts", () => {
  it("is quiet when credits are above 20% and nothing fell back", () => {
    expect(LOW_CREDIT_SHARE).toBe(0.2);
    expect(ttsAlerts(healthy, 0)).toEqual([]);
    expect(ttsAlerts({ ...healthy, character_count: 80_000 }, 0)).toEqual([]); // exactly 20% left
  });
  it("names low credits under 20% of the plan", () => {
    expect(codes({ ...healthy, character_count: 80_001 }, 0)).toEqual(["ELEVENLABS_CREDITS_LOW"]);
    expect(codes({ ...healthy, character_count: 120_000 }, 0)).toEqual(["ELEVENLABS_CREDITS_LOW"]);
  });
  it("names a browser-voice fallback in the last 7 days", () => {
    expect(codes(healthy, 1)).toEqual(["NARRATION_FELL_BACK"]);
    expect(codes({ ...healthy, character_count: 99_000 }, 3)).toEqual(["ELEVENLABS_CREDITS_LOW", "NARRATION_FELL_BACK"]);
  });
  it("never a silent pass when the credits cannot be read", () => {
    for (const u of [null, { key_present: false }, { key_present: true, http_status: 401 }, { ...healthy, character_limit: 0 }]) {
      expect(codes(u, 0)).toEqual(["ELEVENLABS_CREDITS_UNREADABLE"]);
    }
  });
});
