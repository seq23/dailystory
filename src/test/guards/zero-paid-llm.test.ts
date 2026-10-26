// Guard: nothing paid in this repo's own automation (owner policy, 11 Oct 2026:
// "nothing should be paid"). The rule lives in docs/cost/zero-paid-llm.md and
// config/llm_routing.json; this guard is the code that reads it, so the rule is
// not a wish. It also keeps the two lanes honest: a provider endpoint in
// scripts/ or .github/workflows/ must go through the router, and one in
// supabase/functions/ must be listed in the product-inference paid lane.
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
// The router's own policy check, so the guard and the router cannot disagree.
import { policyErrors, readConfig } from "../../../scripts/llm/free_router.mjs";

const ROOT = join(__dirname, "../../..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const DOC = "docs/cost/zero-paid-llm.md";
const CONFIG = "config/llm_routing.json";
const ROUTER = "scripts/llm/free_router.mjs";

/** Provider endpoints that cost money, from the config's own marker list. */
const markers: string[] = readConfig().provider_endpoint_markers;

/** Tracked files under a prefix, so an untracked scratch file never fails the gate. */
function tracked(prefix: string): string[] {
  return execSync(`git ls-files -- ${prefix}`, { cwd: ROOT, encoding: "utf8" })
    .split("\n").filter(Boolean);
}

/** Lines of `rel` that name a paid provider endpoint, ignoring comments. */
function endpointHits(rel: string): string[] {
  const text = readFileSync(join(ROOT, rel), "utf8");
  const hits: string[] = [];
  for (const [i, line] of text.split("\n").entries()) {
    const code = line.replace(/^\s*(\/\/|#|\*).*$/, "");
    for (const m of markers) {
      if (new RegExp(m).test(code)) { hits.push(`${rel}:${i + 1} ${code.trim().slice(0, 100)}`); break; }
    }
  }
  return hits;
}

describe("the zero-paid rule is written down where it is read", () => {
  it("has the cost doc, and it names both lanes", () => {
    expect(existsSync(join(ROOT, DOC)), `${DOC} is missing`).toBe(true);
    const doc = read(DOC);
    expect(doc).toMatch(/nothing should be paid/i);
    expect(doc, "the doc must name the $0 automation lane").toMatch(/automation lane/i);
    expect(doc, "the doc must name the paid product lane").toMatch(/product lane/i);
    expect(doc, "the doc must point at the router").toContain(ROUTER);
    expect(doc, "the doc must point at the routing config").toContain(CONFIG);
  });

  it('CLAUDE.md carries the "nothing paid" line and points at the doc', () => {
    const claude = read("CLAUDE.md");
    expect(claude, 'CLAUDE.md must say "nothing paid"').toMatch(/nothing paid/i);
    expect(claude).toContain(DOC);
  });
});

describe("the routing config is a $0-only policy", () => {
  it("passes the router's own policy check", () => {
    expect(policyErrors(readConfig())).toEqual([]);
  });

  it("is max_cost_usd 0, no paid fallback, and every model id ends in :free", () => {
    const cfg = readConfig();
    expect(cfg.policy.max_cost_usd).toBe(0);
    expect(cfg.policy.paid_fallback).toBe(false);
    expect(cfg.policy.read_by).toBe(ROUTER);
    expect(cfg.models.length).toBeGreaterThanOrEqual(3);
    for (const m of cfg.models) {
      expect(m.id, `${m.id} must end in :free`).toMatch(/:free$/);
      expect(String(m.pricing.prompt), `${m.id} prompt price`).toBe("0");
      expect(String(m.pricing.completion), `${m.id} completion price`).toBe("0");
    }
    // The snapshot must be a real date, so a stale free list is visible.
    expect(cfg.pricing_snapshot.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("refuses a config that names a paid model, a non-zero cap or a priced model", () => {
    const base = readConfig();
    const withPaidModel = structuredClone(base);
    withPaidModel.models[1].id = "openai/gpt-4o";
    expect(policyErrors(withPaidModel).join("; ")).toMatch(/must end in :free/);

    const withCap = structuredClone(base);
    withCap.policy.max_cost_usd = 5;
    expect(policyErrors(withCap).join("; ")).toMatch(/max_cost_usd must be exactly 0/);

    const withPrice = structuredClone(base);
    withPrice.models[0].pricing.prompt = "0.5";
    expect(policyErrors(withPrice).join("; ")).toMatch(/pricing\.prompt is/);

    const withFallback = structuredClone(base);
    withFallback.policy.paid_fallback = true;
    expect(policyErrors(withFallback).join("; ")).toMatch(/paid_fallback must be false/);
  });
});

describe("the two lanes stay separate", () => {
  it("no script or workflow calls a provider except through the router", () => {
    const files = [...tracked("scripts"), ...tracked(".github/workflows")]
      .filter((f) => f !== ROUTER && /\.(m?js|ts|mjs|cjs|ya?ml|sh)$/.test(f));
    const hits = files.flatMap(endpointHits);
    expect(hits, `automation must go through ${ROUTER}:\n${hits.join("\n")}`).toEqual([]);
  });

  it("every paid provider endpoint in the product is recorded in the paid lane", () => {
    const lane = readConfig().paid_lanes.find((l: { id: string }) => l.id === "product-inference");
    expect(lane, "config must record the product-inference paid lane").toBeTruthy();
    const declared: string[] = lane.provider_endpoints;
    const used = new Set<string>();
    for (const f of tracked("supabase/functions").filter((f) => /\.(ts|js)$/.test(f))) {
      const text = readFileSync(join(ROOT, f), "utf8");
      for (const host of ["api.openai.com", "api.runware.ai", "api.anthropic.com", "api.perplexity.ai", "generativelanguage.googleapis.com", "openrouter.ai/api"]) {
        if (text.includes(host)) used.add(host);
      }
    }
    const unrecorded = [...used].filter((h) => !declared.includes(h));
    expect(unrecorded, `paid endpoints in supabase/functions not listed in paid_lanes: ${unrecorded.join(", ")}`).toEqual([]);
  });
});
