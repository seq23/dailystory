// Guard: Stripe must reach an edge function through a literal, statically
// bundled import. Supabase only bundles modules reachable through literal
// specifiers, so `memoizedImport('stripe')` (a runtime `import(url)`) failed on
// every call with "Critical dependencies could not be loaded" and took checkout
// down (Oct 2026). This pins the fix and fails if the pattern comes back.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const FUNCTIONS_DIR = join(__dirname, "../../../supabase/functions");
const SHARED_STRIPE = join(FUNCTIONS_DIR, "_shared/stripe.ts");
const STRIPE_FUNCTIONS = ["create-checkout", "customer-portal", "create-premium-subscription"];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return name === "_vendor" ? [] : sourceFiles(full);
    return /\.(ts|js|mjs)$/.test(name) ? [full] : [];
  });
}

describe("edge functions load Stripe statically", () => {
  const files = sourceFiles(FUNCTIONS_DIR);

  it("scans a real tree", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it("no file loads Stripe through a runtime-built import or the placeholder vendor stub", () => {
    const offenders = files.flatMap((f) => {
      const src = readFileSync(f, "utf8");
      const hits: string[] = [];
      if (/memoizedImport\(\s*['"`]stripe/.test(src)) hits.push("memoizedImport('stripe')");
      if (/_vendor\/stripe@/.test(src)) hits.push("_vendor/stripe@ placeholder");
      if (/createResilientStripeClient/.test(src)) hits.push("createResilientStripeClient");
      return hits.map((h) => `${relative(FUNCTIONS_DIR, f)}: ${h}`);
    });
    expect(offenders).toEqual([]);
  });

  it("_shared/stripe.ts statically imports a pinned Stripe build", () => {
    const src = readFileSync(SHARED_STRIPE, "utf8");
    expect(src).toMatch(/^import Stripe from "https:\/\/esm\.sh\/stripe@\d+\.\d+\.\d+\?target=deno";$/m);
    expect(src).not.toMatch(/\bimport\(/);
  });

  it.each(STRIPE_FUNCTIONS)("%s imports Stripe from _shared/stripe.ts at the top level", (fn) => {
    const src = readFileSync(join(FUNCTIONS_DIR, fn, "index.ts"), "utf8");
    expect(src).toMatch(/^import Stripe from "\.\.\/_shared\/stripe\.ts";$/m);
    expect(src).toMatch(/new Stripe\(/);
  });

  it("the deploy workflow fails when a deployed payment function reports IMPORT_FAILURE", () => {
    const wf = readFileSync(join(FUNCTIONS_DIR, "../../.github/workflows/deploy-functions.yml"), "utf8");
    const step = wf.slice(wf.indexOf("Payment functions load Stripe (post-deploy smoke)"));
    expect(step.length).toBeGreaterThan(100);
    for (const fn of ["create-checkout", "customer-portal"]) expect(step).toContain(fn);
    expect(step).toMatch(/IMPORT_FAILURE[^\n]*failed=1/);
    expect(step).toContain("exit $failed");
  });
});
