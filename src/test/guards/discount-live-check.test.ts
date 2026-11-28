// The live discount-code check after every deploy (engineering-check FAIL on #195, 28 Nov 2026).
// #195's Outcome reads the `discount-live-check` job's result on main, so this pins that the job
// exists under that exact name, runs after the deploy whatever the deploy did, and runs the script.
// It also pins the safety of the script: only TEST rows it made itself, both removed, no real code.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

const workflow = parse(readFileSync(".github/workflows/deploy-functions.yml", "utf8")) as {
  jobs: Record<string, { name?: string; needs?: string; if?: string; steps?: Array<{ run?: string }> }>;
};
const script = readFileSync("scripts/live-discount-check.sh", "utf8");
/** The script without its comments: what it runs. */
const code = script.split("\n").filter((l) => !/^\s*#/.test(l)).join("\n");

describe("discount-live-check (the live TEST redemption after each deploy)", () => {
  it("is a job named discount-live-check that runs after the deploy, pass or fail, and runs the script", () => {
    const job = workflow.jobs["discount-live-check"];
    expect(job, "the job #195's Outcome reads is missing").toBeDefined();
    expect(job.name).toBe("discount-live-check");
    expect(job.needs).toBe("deploy");
    expect(job.if).toBe("${{ !cancelled() }}");
    const run = (job.steps ?? []).map((s) => s.run ?? "").join("\n");
    expect(run).toMatch(/bash scripts\/live-discount-check\.sh/);
    expect(run).toMatch(/::add-mask::\$SERVICE_KEY/);
  });

  it("calls the two rewritten functions and reads back the migration's table and the use count", () => {
    expect(script).toMatch(/APPLY_FN:-apply-discount-code/);
    expect(script).toMatch(/ACTIVATE_FN:-activate-discount-code/);
    expect(script).toMatch(/rest\/v1\/discount_code_redemptions\?user_id=eq\./);
    expect(script).toMatch(/current_uses == 1/);
    expect(script).toMatch(/INVALID_DISCOUNT_CODE/);
    expect(script).toMatch(/NO_CODE/);
  });

  it("touches only TEST rows it made, removes both on every exit, and never names a real code", () => {
    expect(script).toMatch(/@example\.test/);
    expect(script).toMatch(/"test_account\\":true/);
    expect(script).toMatch(/TEST: automated live check/);
    expect(script).toMatch(/\\"max_uses\\":1/);
    expect(script).toMatch(/trap cleanup EXIT/);
    expect(script).toMatch(/admin\/users\/\$uid/);
    expect(script).toMatch(/discount_codes\?id=eq\.\$code_id/);
    expect(code).not.toMatch(/SEQUOIA90|BEACON90/);
    expect(code).not.toMatch(/stripe/i);
    // Deletes only by the ids this run created, never by a pattern.
    for (const line of script.split("\n").filter((l) => /-X DELETE/.test(l))) {
      expect(line).toMatch(/\$uid|id=eq\.\$code_id/);
    }
  });
});
