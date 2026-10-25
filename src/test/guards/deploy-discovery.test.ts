// Guard: the deploy workflow discovers edge functions as top-level folders with an
// index.ts and skips helper folders starting with "_". On 9 Oct 2026 discovery picked
// up _shared/types/index.ts, tried to deploy it as a function and failed the run.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../../..");
const WORKFLOW = readFileSync(join(ROOT, ".github/workflows/deploy-functions.yml"), "utf8");

describe("deploy-functions discovery", () => {
  const line = WORKFLOW.split("\n").find((l) => l.trim().startsWith("FUNCTIONS=$(find supabase/functions"));

  it("has one discovery command", () => {
    expect(line).toBeDefined();
  });

  it("never discovers a helper folder", () => {
    const cmd = line!.trim().replace(/^FUNCTIONS=\$\(/, "").replace(/\)$/, "");
    const found = execSync(cmd, { cwd: ROOT, encoding: "utf8", shell: "/bin/bash" }).trim().split("\n").filter(Boolean);
    expect(found.length).toBeGreaterThan(0);
    expect(found.filter((f) => f.startsWith("_") || f.includes("/"))).toEqual([]);
    expect(found).toContain("create-checkout");
  });
});

describe("post-deploy payment smoke", () => {
  // 25 Oct 2026: create-checkout came out of the deploy with BOOT_ERROR though its
  // source boots; redeploying it alone fixed it. The smoke now does that itself.
  const step = WORKFLOW.slice(WORKFLOW.indexOf("Payment functions load Stripe (post-deploy smoke)"));
  it("redeploys a payment function that does not boot, once, then probes again", () => {
    expect(step).toMatch(/for attempt in 1 2 3 4 5 6; do/);
    expect(step).toMatch(/if \[ "\$attempt" = 4 \]; then[\s\S]{0,200}supabase functions deploy "\$func" --project-ref "\$SUPABASE_PROJECT_ID"/);
    expect(step).toMatch(/\*"Authentication error"\*\) break/);
    expect(step).toMatch(/did not reach its auth check/);
  });
});
