// Guard: the edge-function monitors check health the way the functions answer it.
// 13 Nov 2026: runware-generate-image answered HEAD with 401 after the paid-call guard
// (#150) while GET /health said healthy, so the monitor was red for a healthy
// function; and every monitor skipped most days because its "deploy in progress"
// query counted any running workflow. See scripts/monitor/function-health.sh.
import { execFile } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../../..");
const SCRIPT = join(ROOT, "scripts/monitor/function-health.sh");

let server: Server;
let base = "";
let deploying = 0;
const healthHits: string[] = [];

beforeAll(async () => {
  server = createServer((req, res) => {
    const url = req.url ?? "";
    if (url.includes("/actions/workflows/deploy-functions.yml/runs")) {
      res.end(JSON.stringify({ total_count: deploying, workflow_runs: [] }));
      return;
    }
    healthHits.push(url);
    // Mirrors the paid-call guard: only GET is a health check, anything else is 401.
    if (req.method !== "GET") { res.statusCode = 401; res.end("{}"); return; }
    if (url === "/fn-ok/health") { res.end(JSON.stringify({ status: "healthy" })); return; }
    if (url === "/fn-degraded/health") { res.end(JSON.stringify({ status: "degraded" })); return; }
    res.statusCode = 500;
    res.end("{}");
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const addr = server.address();
  base = `http://127.0.0.1:${typeof addr === "object" && addr ? addr.port : 0}`;
});
afterAll(() => server.close());

function run(args: string[], extra: Record<string, string> = {}) {
  const out = join(mkdtempSync(join(tmpdir(), "fh-")), "out");
  return new Promise<{ code: number; stdout: string; stderr: string; output: string }>((resolve) => {
    execFile("bash", [SCRIPT, ...args], {
      env: { PATH: process.env.PATH ?? "", BASE_URL: base, GITHUB_API: base, GITHUB_REPOSITORY: "o/r",
        MAX_ATTEMPTS: "2", RETRY_SLEEP: "0", GITHUB_OUTPUT: out, ...extra },
    }, (err, stdout, stderr) => {
      let output = "";
      try { output = readFileSync(out, "utf8"); } catch { /* not written */ }
      resolve({ code: err ? (typeof err.code === "number" ? err.code : 1) : 0, stdout, stderr, output });
    });
  });
}

describe("function-health.sh", () => {
  it("passes a function whose GET /health says healthy (HEAD would be 401)", async () => {
    deploying = 0;
    const r = await run(["fn-ok"]);
    expect(r.code).toBe(0);
    expect(r.stdout).toContain("checked 1, healthy 1");
  });

  it("fails and names the functions that are down or not healthy", async () => {
    deploying = 0;
    const r = await run(["fn-ok", "fn-down", "fn-degraded"]);
    expect(r.code).toBe(1);
    expect(r.output).toContain("failed=fn-down,fn-degraded");
  });

  it("refuses to pass with no functions to check", async () => {
    const r = await run([]);
    expect(r.code).toBe(2);
    expect(r.stderr).toContain("MONITOR_NO_FUNCTIONS");
  });

  it("skips with a named stop only when deploy-functions itself is running", async () => {
    deploying = 1;
    healthHits.length = 0;
    const r = await run(["fn-ok"]);
    deploying = 0;
    expect(r.code).toBe(0);
    expect(r.stdout).toContain("MONITOR_STOP");
    expect(healthHits).toEqual([]);
  });
});

describe("monitor workflows", () => {
  const files = readdirSync(join(ROOT, ".github/workflows")).filter((f) => f.startsWith("monitor-"));

  it("every monitor checks at least one function through the shared script", () => {
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) {
      const text = readFileSync(join(ROOT, ".github/workflows", f), "utf8");
      expect(text, f).toMatch(/scripts\/monitor\/function-health\.sh [a-z]/);
    }
  });
});
