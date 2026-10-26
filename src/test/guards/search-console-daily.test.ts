// Guard: the daily Search Console collection stays wired end to end.
//
// Search Readiness e4, e5 and i6. The defect class this pins is "runs but
// inert": a workflow that exists but is on no schedule, a collector nothing
// invokes, a committed truth file that quietly stops being written, or a
// collector that writes a silent zero instead of naming its stop.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../../..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const WORKFLOW_PATH = ".github/workflows/search-console-daily.yml";
const WORKFLOW = read(WORKFLOW_PATH);
const PKG = JSON.parse(read("package.json"));
const DATA = "data/search_intelligence";

const COLLECTORS = [
  { script: "gsc:truth", file: "scripts/search_intelligence/collect_gsc_truth.mjs", writes: ["gsc_truth.json", "gsc_query_history.json"] },
  { script: "gsc:coverage", file: "scripts/search_intelligence/collect_index_coverage.mjs", writes: ["index_coverage.json"] },
  { script: "gsc:sitemaps", file: "scripts/search_intelligence/collect_gsc_sitemaps.mjs", writes: ["gsc_sitemaps.json"] },
];

describe("the daily Search Console workflow", () => {
  it("is on a daily cron, not dispatch-only", () => {
    expect(WORKFLOW).toMatch(/schedule:/);
    const crons = [...WORKFLOW.matchAll(/cron:\s*'([^']+)'/g)].map((m) => m[1]);
    expect(crons.length, "the workflow must carry at least one cron").toBeGreaterThan(0);
    for (const c of crons) {
      const f = c.trim().split(/\s+/);
      expect(f.length, `cron "${c}" must have five fields`).toBe(5);
      // Daily: day-of-month and day-of-week both unrestricted.
      expect(f[2], `cron "${c}" must run every day of the month`).toBe("*");
      expect(f[4], `cron "${c}" must run every day of the week`).toBe("*");
    }
  });

  it("is given the service-account secret and may write to the repo", () => {
    expect(WORKFLOW).toContain("secrets.GSC_SERVICE_ACCOUNT_JSON");
    expect(WORKFLOW).toMatch(/permissions:\s*\n\s*contents:\s*write/);
    expect(WORKFLOW, "a commit step must push the day's truth").toMatch(/git commit/);
    expect(WORKFLOW).toContain(DATA);
  });

  it("has a timeout that is a fault detector, not absent", () => {
    const t = WORKFLOW.match(/timeout-minutes:\s*(\d+)/);
    expect(t, "the job must carry timeout-minutes").toBeTruthy();
    expect(Number(t![1])).toBeGreaterThan(0);
    expect(Number(t![1]), "a daily collector should not be allowed to run for an hour").toBeLessThanOrEqual(30);
  });

  it("invokes every collector through an npm script that exists", () => {
    for (const c of COLLECTORS) {
      expect(PKG.scripts[c.script], `package.json must define ${c.script}`).toBeTruthy();
      expect(PKG.scripts[c.script]).toContain(c.file.split("/").pop());
      expect(existsSync(join(ROOT, c.file)), `${c.file} is missing`).toBe(true);
      expect(WORKFLOW, `${WORKFLOW_PATH} must run ${c.script}`).toContain(`npm run ${c.script}`);
    }
  });
});

describe("each collector names its stop instead of writing a silent zero", () => {
  it("refuses to run without the credential, and says so", () => {
    for (const c of COLLECTORS) {
      const src = read(c.file);
      expect(src, `${c.file} must read GSC_SERVICE_ACCOUNT_JSON via the shared client`).toMatch(/serviceAccount\(\)/);
      expect(src, `${c.file} must print a NAMED STOP when the credential is absent`).toMatch(/NAMED STOP/);
    }
  });

  it("the truth collector fails rather than writing an empty truth for a property with impressions", () => {
    const src = read(COLLECTORS[0].file);
    expect(src).toMatch(/Refusing to write an empty truth/);
    expect(src, "0 rows is only acceptable when the property reports 0 impressions").toMatch(/!rows\.length && Number\(totals\.impressions\) > 0/);
  });
});

describe("the committed truth is real", () => {
  it("every collector's file is present, parses, and names its property and source", () => {
    for (const c of COLLECTORS) {
      for (const name of c.writes) {
        const rel = `${DATA}/${name}`;
        expect(existsSync(join(ROOT, rel)), `${rel} is missing; the daily workflow must commit it`).toBe(true);
        const doc = JSON.parse(read(rel));
        expect(doc.property, `${rel} must name the Search Console property`).toContain("time-2-read.com");
      }
    }
  });

  it("gsc_truth.json carries a real window and a real timestamp, not 1970", () => {
    const d = JSON.parse(read(`${DATA}/gsc_truth.json`));
    expect(d.truth_source).toBe("google_search_console_search_analytics");
    expect(d.window.days).toBe(28);
    expect(d.window.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(d.collected_at).getUTCFullYear()).toBeGreaterThan(2020);
    expect(d.totals.impressions, "totals.impressions must be a number").toEqual(expect.any(Number));
    // The 28-day window must end before today: Search Console lags about 3 days.
    expect(Date.parse(d.window.end_date)).toBeLessThan(Date.now());
  });

  it("the query history keeps a window per day, so a query leaving the 28 days is not lost", () => {
    const h = JSON.parse(read(`${DATA}/gsc_query_history.json`));
    expect(h.windows.length).toBeGreaterThan(0);
    expect(h.keep).toBeGreaterThanOrEqual(30);
    const ends = h.windows.map((w: { end_date: string }) => w.end_date);
    expect(new Set(ends).size, "one entry per window end date").toBe(ends.length);
    expect([...ends].sort().join(), "windows stay in date order").toBe(ends.join());
  });

  it("index_coverage.json covers every sitemap URL", () => {
    const d = JSON.parse(read(`${DATA}/index_coverage.json`));
    const locs = [...read("public/sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    expect(d.sitemap_url_count).toBe(new Set(locs).size);
    expect(d.urls.length).toBe(d.sitemap_url_count);
    const summed = Object.values(d.summary.by_coverage_state as Record<string, number>).reduce((a, b) => a + b, 0);
    expect(summed, "the coverage counts must sum to the sitemap").toBe(d.sitemap_url_count);
  });
});
