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
