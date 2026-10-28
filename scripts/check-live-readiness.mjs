// Live guard for the two search-readiness rules time-2-read.com kept failing on
// (Boss OS briefs b10 and e9, 28 Oct 2026). The build-time guard
// (check-prerender.mjs) already holds both in dist, and CI is green on them --
// but Lovable publishes outside GitHub Actions (someone clicks Share -> Publish),
// so a merged fix can sit unpublished for days while the audit keeps re-reporting
// it. Nothing in the repo noticed that gap: the old live check only asked whether
// #root was prerendered, which a stale publish passes.
//
// So this reads the LIVE host, the same HTML a crawler gets, and fails by name:
//   b10 TITLE_NOT_LIVE     - a page's <title> does not name Time-2-Read
//   e9  CLARITY_STILL_LIVE - a public page still loads Microsoft Clarity
// Both clear themselves the moment the current main is published. A failure is
// therefore one action: publish, or fix the regression at source.
import { readFileSync } from "node:fs";

// Overridable so the same assertions can be proved green against a local build
// of dist before the guard is trusted against production.
const SITE = process.env.LIVE_CHECK_ORIGIN ?? "https://time-2-read.com";
const BRAND = "Time-2-Read";
// Clarity now mounts only inside LoginScreen (useParentFormClarity), the
// grown-up's account/checkout form. No sitemap page may ship the tag.
const CLARITY = /clarity\.ms|clarity\.js|\/clarity[-.]|microsoft clarity/i;
const UA = "Mozilla/5.0 (compatible; Time2ReadLiveCheck/1.0; +https://time-2-read.com)";

const locs = [...readFileSync("public/sitemap.xml", "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (locs.length === 0) { console.error("LIVE_CHECK_NO_SITEMAP_URLS"); process.exit(1); }

// The sign-in app route is the one page that may carry Clarity, and it serves the
// homepage's HTML anyway. check-prerender.mjs already refuses it in the sitemap.
const APP_ROUTES = new Set(["/auth"]);

async function get(url) {
  let last;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // Cache-busted: a stale edge copy would read as a stale publish.
      const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}livecheck=${Date.now()}`, {
        headers: { "user-agent": UA, "cache-control": "no-cache" },
        redirect: "follow",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      last = err;
      if (attempt < 3) await new Promise((r) => setTimeout(r, attempt * 1000));
    }
  }
  throw last;
}

const fails = [];
let checked = 0;
for (const loc of locs) {
  const path = new URL(loc).pathname.replace(/\/+$/, "") || "/";
  if (APP_ROUTES.has(path)) continue;
  let html;
  try {
    html = await get(`${SITE}${path === "/" ? "/" : path}`);
  } catch (err) {
    fails.push(`PAGE_UNREACHABLE ${path}: ${err.message}`);
    continue;
  }
  checked++;
  const title = (html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");
  if (!title.includes(BRAND)) fails.push(`TITLE_NOT_LIVE ${path}: live title does not name ${BRAND}: "${title}"`);
  if (CLARITY.test(html)) fails.push(`CLARITY_STILL_LIVE ${path}: live page outside the parent form still loads Clarity`);
}

// Rule 0: a run that looked at nothing is a failure, not a pass.
if (checked === 0) { console.error("LIVE_CHECK_NOTHING_CHECKED"); process.exit(1); }

if (fails.length) {
  for (const f of fails) console.error(`::error::${f}`);
  console.error(
    `\n${fails.length} live failure(s) over ${checked} pages. main already carries these fixes and CI is green on them,\n` +
    `so the usual cause is that the newest main has not been published: open\n` +
    `https://lovable.dev/projects/592147a7-1050-4b6c-af2b-895053e775df and click Share -> Publish.\n` +
    `If the newest main IS published, this is a real regression: fix it at source, not in dist.`,
  );
  process.exit(1);
}
console.log(`live: ${checked} pages name ${BRAND} in their title and none loads Clarity`);
