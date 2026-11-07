// Guard: the shared search engine (seq23/search-loop) on Time-2-Read.
// Reads the real config, caller workflow, commit script and the two helper
// scripts, and pins what the company brain and the 1 Nov 2026 rollout ruled:
// one action ("Start a free week"), pace starts at 10, the brand's banned claims
// are enforced by code (the engine's health gate is off for this site), the
// sibling heygetonmylevel never targets the same search, the model list comes
// only from config/llm_routing.json, and the guides section deploys without
// a Lovable Publish.
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadRules, violations, gateSite, selfTest } from "../../../scripts/search-loop/claims-gate.mjs";
import { engineRouting } from "../../../scripts/search-loop/engine-routing.mjs";
import { assemble } from "../../../scripts/search-loop/build-guides-site.mjs";
import { dayFrom, measure, DATASET as READ_DATASET } from "../../../scripts/search-loop/ai-measure.mjs";
import { rowFor, DATASET as WRITE_DATASET } from "../../../guides-site/functions/_middleware.js";

const ROOT = join(__dirname, "../../..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const cfg = JSON.parse(read("search-loop.config.json"));

describe("search-loop.config.json follows the brain and the rollout ruling", () => {
  it("has the one action, the brand, the pace and no menu approval", () => {
    expect(cfg.action).toEqual({ label: "Start a free week", url: "https://time-2-read.com/pricing" });
    expect(cfg.site_name).toBe("Time-2-Read");
    expect(cfg.pace.start_per_day).toBe(10);
    expect(cfg.pace.cap).toBeLessThanOrEqual(30);
    expect(cfg.menu_pages_need_approval).toBe(false);
    expect(cfg.health_gate).toBe("none");
    expect(cfg.voice).toMatch(/no screens/i);
    expect(cfg.voice).toMatch(/English only/i);
    expect(cfg.voice).toMatch(/3 to 15/);
  });

  it("bans every claim the brain forbids, and the gate catches each one", () => {
    const ids = cfg.banned_claims.map((r: { id: string }) => r.id).sort();
    expect(ids).toEqual(["age-range", "anti-ai", "brand-spelling", "dyslexia", "grade-jump", "medical", "no-screens", "non-english-stories"]);
    expect(selfTest()).toEqual([]);
    const rules = loadRules(cfg);
    expect(violations("<p>No screens needed, and it cures dyslexia.</p>", rules).map((v: { id: string }) => v.id))
      .toEqual(expect.arrayContaining(["no-screens", "medical", "dyslexia"]));
    expect(violations("<p>Stories at your child's reading level with Time-2-Read.</p>", rules)).toEqual([]);
    expect(() => loadRules({ banned_claims: [] })).toThrow(/NO_BANNED_CLAIMS/);
  });

  it("removes a page that makes a banned claim, marks it removed and drops links to it", () => {
    const dir = mkdtempSync(join(tmpdir(), "t2r-gate-"));
    writeFileSync(join(dir, "search-loop.config.json"), JSON.stringify(cfg));
    const page = (slug: string, body: string) => {
      mkdirSync(join(dir, "questions", slug), { recursive: true });
      writeFileSync(join(dir, "questions", slug, "index.html"), `<html><head><title>${slug} | Time-2-Read</title></head><body><main><p>${body}</p></main></body></html>`);
    };
    page("good", 'Read together. <ul><li><a href="/questions/bad/">Bad</a></li></ul>');
    page("bad", "Reading with no screens at all.");
    mkdirSync(join(dir, "data/search-loop"), { recursive: true });
    writeFileSync(join(dir, "data/search-loop/pages.json"), JSON.stringify({ pages: [{ slug: "good", status: "live" }, { slug: "bad", status: "live" }] }));
    const r = gateSite(dir);
    expect(r.scanned).toBe(2);
    expect(r.removed.map((x: { slug: string }) => x.slug)).toEqual(["bad"]);
    expect(existsSync(join(dir, "questions/bad"))).toBe(false);
    expect(readFileSync(join(dir, "questions/good/index.html"), "utf8")).not.toContain("/questions/bad/");
    const book = JSON.parse(readFileSync(join(dir, "data/search-loop/pages.json"), "utf8"));
    expect(book.pages.find((p: { slug: string }) => p.slug === "bad").status).toBe("removed");
  });

  it("never targets the same search as heygetonmylevel", () => {
    expect(cfg.shares_audience_with).toEqual([
      { site: "heygetonmylevel.com", ledger_url: "https://raw.githubusercontent.com/seq23/heygetonmylevel/main/data/search-loop" },
    ]);
  });

  it("publishes on its own host, with IndexNow on the key this repo serves", () => {
    expect(cfg.base_url).toBe("https://guides.time-2-read.com");
    expect(existsSync(join(ROOT, "public", `${cfg.indexnow.key}.txt`))).toBe(true);
    expect(cfg.indexnow.key_location).toBe(`${cfg.base_url}/${cfg.indexnow.key}.txt`);
    expect(cfg.output).toMatchObject({ dir: "questions", format: "dir-index", url_prefix: "/questions/" });
    for (const p of ["src", "public", "supabase", "index.html"]) expect(cfg.protected_paths).toContain(p);
  });
});

describe("the engine's model list is this repo's $0 list, never a second one", () => {
  it("derives from config/llm_routing.json and is $0-only", () => {
    const routing = JSON.parse(read("config/llm_routing.json"));
    const out = engineRouting();
    expect(out.policy).toEqual({ max_cost_usd: 0, fallback_to_paid: false });
    expect(out.free_models.map((m: { id: string }) => m.id)).toEqual(routing.models.map((m: { id: string }) => m.id));
    expect(cfg.llm.routing_file).toBe(".search-loop-routing.json");
    expect(routing.automation_lane.engine_adapter).toBe("scripts/search-loop/engine-routing.mjs");
    const paid = structuredClone(routing);
    paid.policy.max_cost_usd = 5;
    expect(() => engineRouting(paid)).toThrow(/ROUTING_POLICY/);
  });
});

describe("the caller workflow, commit step and guides deploy", () => {
  const caller = read(".github/workflows/search-loop.yml");
  const commit = read(".github/scripts/search_loop_commit.sh");
  const deploy = read(".github/workflows/guides-deploy.yml");

  it("pins the engine at v1 and wires the repo's own steps", () => {
    expect(caller).toContain("uses: seq23/search-loop/.github/workflows/search-loop.yml@v1");
    expect(caller).toMatch(/engine_ref: v1/);
    expect(caller).toContain("setup_command: node scripts/search-loop/engine-routing.mjs");
    expect(caller).toContain("node scripts/search-loop/claims-gate.mjs");
    expect(caller).toContain("commit_command: bash .github/scripts/search_loop_commit.sh");
    expect(caller).toContain("OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}");
  });

  it("publishes only when the guides host answers the key, otherwise names its stop", () => {
    expect(commit.indexOf("claims-gate.mjs")).toBeGreaterThan(-1);
    expect(commit.indexOf("claims-gate.mjs")).toBeLessThan(commit.indexOf("git add -A"));
    expect(commit).toMatch(/if \[ "\$served" = "\$key" \]/);
    expect(commit).toContain("NAMED STOP [GUIDES_HOST_NOT_LIVE]");
    expect(commit).toContain("refs/heads/search-loop/proof");
    expect(commit).toContain("gh workflow run guides-deploy.yml");
  });

  it("deploys the guides section to Cloudflare Pages, never through Lovable", () => {
    // From guides-site/ so functions/ (the AI counter) and wrangler.toml (its binding) ship too.
    expect(deploy).toContain("(cd guides-site && npx --yes wrangler@4 pages deploy ../dist-guides");
    expect(deploy).toContain("NAMED STOP [SECRET_MISSING_CLOUDFLARE_API_TOKEN]");
    expect(deploy).toMatch(/timeout-minutes: \d+/);
    expect(deploy.split("\n").filter((l) => !/^\s*#/.test(l)).join("\n")).not.toMatch(/lovable/i);
  });

  it("assembles a site with sitemap, robots, key file and the one action", () => {
    const dir = mkdtempSync(join(tmpdir(), "t2r-guides-"));
    for (const f of ["search-loop.config.json", "guides-site"]) cpSync(join(ROOT, f), join(dir, f), { recursive: true });
    mkdirSync(join(dir, "public"));
    cpSync(join(ROOT, "public", `${cfg.indexnow.key}.txt`), join(dir, "public", `${cfg.indexnow.key}.txt`));
    mkdirSync(join(dir, "questions/how-long-to-read"), { recursive: true });
    writeFileSync(join(dir, "questions/how-long-to-read/index.html"), "<html><body><h1>How long should a child read?</h1></body></html>");
    const r = assemble(dir, join(dir, "out"));
    expect(r.pages).toBe(1);
    const sitemap = readFileSync(join(dir, "out/sitemap.xml"), "utf8");
    expect(sitemap).toContain("https://guides.time-2-read.com/questions/how-long-to-read/");
    expect(readFileSync(join(dir, "out/robots.txt"), "utf8")).toContain("Sitemap: https://guides.time-2-read.com/sitemap.xml");
    expect(readFileSync(join(dir, "out", `${cfg.indexnow.key}.txt`), "utf8").trim()).toBe(cfg.indexnow.key);
    const listing = readFileSync(join(dir, "out/questions/index.html"), "utf8");
    expect(listing).toContain('href="https://time-2-read.com/pricing">Start a free week</a>');
    expect(violations(listing, loadRules(cfg))).toEqual([]);
    // Assets never invoke the AI counter (Function invocations stay on pages).
    expect(JSON.parse(readFileSync(join(dir, "out/_routes.json"), "utf8"))).toEqual({ version: 1, include: ["/*"], exclude: ["/assets/*"] });
  });

  it("ignores the engine's scratch files", () => {
    const gi = read(".gitignore");
    for (const l of [".search-loop-engine/", ".search-loop-run.log", ".search-loop-routing.json", "dist-guides/"]) expect(gi).toContain(l);
  });

  it("the commit script is valid bash", () => {
    expect(() => execFileSync("bash", ["-n", join(ROOT, ".github/scripts/search_loop_commit.sh")])).not.toThrow();
  });
});

// f11: AI-referral visits and AI-bot reads on guides.time-2-read.com. time-2-read.com is not a
// Cloudflare zone, so the engine's zone reader cannot see it; a Pages middleware counts into
// Analytics Engine and ai-measure.mjs writes the engine's daily row before the weekly report.
describe("AI-bot reads and AI-referral visits are counted and read (search readiness f11)", () => {
  const loopCaller = read(".github/workflows/search-loop.yml");
  const html = { headers: new Headers({ "content-type": "text/html; charset=utf-8" }) };
  const css = { headers: new Headers({ "content-type": "text/css" }) };
  const req = (path: string, h: Record<string, string> = {}, method = "GET") => new Request(`https://guides.time-2-read.com${path}`, { method, headers: h });
  const browser = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Safari/605.1.15";

  it("the middleware keeps a referrer's hostname only and a user agent only when it is a crawler's", () => {
    const visit = rowFor(req("/questions/x/?utm=1", { "user-agent": browser, referer: "https://chatgpt.com/c/abc?q=my+child+reads" }), html);
    expect(visit.blobs).toEqual(["page", "", "chatgpt.com", "/questions/x/"]);
    const bot = rowFor(req("/robots.txt", { "user-agent": "Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)" }), { headers: new Headers({ "content-type": "text/plain" }) });
    expect(bot.blobs[0]).toBe("other");
    expect(bot.blobs[1]).toContain("GPTBot");
    expect(rowFor(req("/questions/", { "user-agent": browser, referer: "https://guides.time-2-read.com/questions/" }), html).blobs[2]).toBe("");
    expect(rowFor(req("/assets/guides.css", { "user-agent": browser }), css)).toBeNull();
    expect(rowFor(req("/questions/", { "user-agent": "x" }, "POST"), html)).toBeNull();
  });

  it("writer, reader and Pages binding name the same dataset; the search loop runs the reader with an analytics token", () => {
    const toml = read("guides-site/wrangler.toml");
    expect(WRITE_DATASET).toBe(READ_DATASET);
    expect(toml).toContain(`dataset = "${READ_DATASET}"`);
    expect(toml).toContain('binding = "AI_LOG"');
    expect(toml).toContain('pages_build_output_dir = "../dist-guides"');
    expect(loopCaller).toMatch(/setup_command: .*node scripts\/search-loop\/ai-measure\.mjs/);
    expect(loopCaller).toContain("CLOUDFLARE_API_TOKEN: ${{ secrets.SEARCH_LOOP_CF_ANALYTICS_TOKEN }}");
    expect(loopCaller).toContain("CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}");
  });

  const lib = {
    botFor: (ua: string) => (ua.includes("GPTBot") ? "GPTBot (OpenAI training)" : ua.includes("ClaudeBot") ? "ClaudeBot" : null),
    aiEngineFor: (u: string) => (/chatgpt\.com/.test(u) ? "chatgpt" : /perplexity\.ai/.test(u) ? "perplexity" : null),
    centralDate: () => "2026-11-07",
  };

  it("classifies with the engine's lists; a day with no page logged is not read, never 0", () => {
    const rows = [
      { kind: "page", ua: "", ref: "", path: "/questions/", n: "40" },
      { kind: "page", ua: "", ref: "chatgpt.com", path: "/questions/a/", n: "3" },
      { kind: "page", ua: "", ref: "perplexity.ai", path: "/questions/b/", n: "1" },
      { kind: "other", ua: "", ref: "chatgpt.com", path: "/robots.txt", n: "5" },
      { kind: "page", ua: "x GPTBot/1.2", ref: "", path: "/questions/a/", n: "7" },
      { kind: "other", ua: "ClaudeBot/1.0", ref: "", path: "/sitemap.xml", n: "2" },
      { kind: "page", ua: "SomeSEOBot/1.0", ref: "", path: "/questions/", n: "9" },
    ];
    const d = dayFrom(rows, lib);
    expect(d.ai_visitors).toMatchObject({ total: 4, by_engine: { chatgpt: 3, perplexity: 1 }, by_path: { "/questions/a/": 3, "/questions/b/": 1 } });
    expect(d.ai_bot_hits).toEqual({ total: 9, by_bot: { "GPTBot (OpenAI training)": 7, ClaudeBot: 2 } });
    expect(dayFrom([{ kind: "other", ua: "x GPTBot", ref: "", path: "/robots.txt", n: "3" }], lib).not_read).toMatch(/no page request in 24 hours/);
    expect(dayFrom([], lib).not_read).toBeTruthy();
  });

  const setup = (days: Record<string, unknown>) => {
    const dir = mkdtempSync(join(tmpdir(), "t2r-ai-"));
    writeFileSync(join(dir, "search-loop.config.json"), JSON.stringify(cfg));
    mkdirSync(join(dir, "data/search-loop"), { recursive: true });
    writeFileSync(join(dir, "data/search-loop/ai-daily.json"), JSON.stringify({ schema: "search-loop-ai-daily-v1", days }));
    return { dir, daily: () => JSON.parse(readFileSync(join(dir, "data/search-loop/ai-daily.json"), "utf8")) };
  };
  const env = { CLOUDFLARE_ACCOUNT_ID: "acct", CLOUDFLARE_API_TOKEN: "tok" };
  const answer = (status: number, body: unknown) => async () => new Response(JSON.stringify(body), { status });

  it("writes today's row in the engine's shape over a not-read day, and leaves a fully read day alone", async () => {
    const t = setup({ "2026-11-07": { not_read: "no free analytics source configured for this site (analytics.ai_referrals)" } });
    const r = await measure({ root: t.dir, env, lib, fetchImpl: answer(200, { data: [{ kind: "page", ua: "", ref: "chatgpt.com", path: "/questions/a/", n: "2" }, { kind: "page", ua: "GPTBot", ref: "", path: "/", n: "5" }] }) });
    expect(r).toMatchObject({ wrote: "2026-11-07", ai_visitors: 2, ai_bot_hits: 5 });
    const day = t.daily().days["2026-11-07"];
    expect(day.ai_visitors.total).toBe(2);
    expect(day.ai_bot_hits.total).toBe(5);
    expect(day.not_read).toBeUndefined();
    const again = await measure({ root: t.dir, env, lib, fetchImpl: answer(200, { data: [] }) });
    expect(again.skipped).toMatch(/already read/);
    expect(t.daily().days["2026-11-07"].ai_bot_hits.total).toBe(5);
  });

  it("a missing token, a refused read or a silent counter names a note and writes nothing", async () => {
    const before = { "2026-11-07": { not_read: "x" } };
    for (const [e, f] of [[{}, answer(200, { data: [] })], [env, answer(403, { errors: [{ message: "Authentication error" }] })], [env, answer(200, { data: [] })]] as const) {
      const t = setup(before);
      const r = await measure({ root: t.dir, env: e, lib, fetchImpl: f });
      expect(r.note).toMatch(/^NAMED NOTE \[AI_MEASURE_NOT_READ\]/);
      expect(t.daily().days).toEqual(before);
    }
  });
});
