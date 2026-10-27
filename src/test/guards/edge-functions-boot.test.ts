// Guard: every edge function's source compiles (27 Oct 2026).
// send-coppa-notification declared `const sb` twice in one scope; Deno refuses to start
// such a module, so the function answered every request, the browser's CORS preflight
// included, with 503 BOOT_ERROR. The deploy's post-deploy preflight probe
// (.github/workflows/deploy-functions.yml) caught it on main; this catches it before merge.
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const FN = join(__dirname, "..", "..", "..", "supabase", "functions");

function sources(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) { if (e !== "node_modules") out.push(...sources(p)); }
    else if (/\.(ts|js|mjs)$/.test(e) && !/\.d\.ts$/.test(e) && !/\.test\./.test(e)) out.push(p);
  }
  return out;
}

describe("every edge function module compiles (a module that does not compile does not boot)", () => {
  const fns = readdirSync(FN).filter((d) => !d.startsWith("_") && existsSync(join(FN, d, "index.ts")));
  const files = [...fns.flatMap((d) => sources(join(FN, d))), ...sources(join(FN, "_shared"))];

  it("finds the functions", () => {
    expect(fns.length).toBeGreaterThan(40);
    expect(fns).toContain("send-coppa-notification");
  });

  it("no syntax error and no duplicate declaration in any function or shared module", () => {
    // esbuild runs in its own node process (it refuses the jsdom test environment).
    const script = `const { transformSync } = require("esbuild"); const fs = require("fs"); const out = [];
      for (const f of JSON.parse(process.argv[1])) { try { transformSync(fs.readFileSync(f, "utf8"), { loader: f.endsWith(".ts") ? "ts" : "js", format: "esm", logLevel: "silent" }); }
      catch (e) { out.push(f + ": " + String(e.message).split("\\n").slice(0, 2).join(" ")); } }
      process.stdout.write(JSON.stringify(out));`;
    const broken: string[] = JSON.parse(execFileSync(process.execPath, ["-e", script, JSON.stringify(files)], { encoding: "utf8", maxBuffer: 1 << 24 }))
      .map((l: string) => l.slice(FN.length + 1));
    expect(broken).toEqual([]);
  });
});
