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
//   BANNED_HOST_LIVE       - a live page, or a script or style it loads, names Microsoft
//                            Clarity or Google Fonts (both removed 22 Nov 2026; scripts/banned-hosts.mjs)
//   k4  PARENT_NOT_LIVE    - a page's Organization does not name Spry Labs as its
//                            parent (added 31 Oct 2026 with the entity work: the
//                            same stale-publish gap hides it exactly the same way)
// They all clear themselves the moment the current main is published. A failure is
// therefore one action: publish, or fix the regression at source.
import { readFileSync } from "node:fs";
import { BANNED_HOSTS, bannedHostsIn, bannedRuleBroken } from "./banned-hosts.mjs";

// Overridable so the same assertions can be proved green against a local build
// of dist before the guard is trusted against production.
const SITE = process.env.LIVE_CHECK_ORIGIN ?? "https://time-2-read.com";
const BRAND = "Time-2-Read";
// k4: every page's Organization names Spry Labs as its parent (src/seo/entity.json).
const SPRY_LABS_ID = "https://billionairehighperformancecoach.com/spry-labs#organization";
const UA = "Mozilla/5.0 (compatible; Time2ReadLiveCheck/1.0; +https://time-2-read.com)";

const locs = [...readFileSync("public/sitemap.xml", "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (locs.length === 0) { console.error("LIVE_CHECK_NO_SITEMAP_URLS"); process.exit(1); }

// The sign-in app route serves the homepage's HTML; check-prerender.mjs refuses it in the sitemap.
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
if (bannedRuleBroken()) fails.push(`BANNED HOST RULE: bannedHostsIn must catch ${BANNED_HOSTS.join(", ")} (and subdomains) and nothing else`);
const assetsRead = new Set();
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
  const named = bannedHostsIn(html);
  if (named.length) fails.push(`BANNED_HOST_LIVE ${path}: live page names ${named.join(", ")}`);
  // The scripts and styles the page loads from our own host, each read once.
  for (const m of html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+\.(?:js|css))"/g)) {
    if (assetsRead.has(m[1])) continue;
    assetsRead.add(m[1]);
    let body;
    try { body = await get(`${SITE}${m[1]}`); } catch (err) { fails.push(`ASSET_UNREACHABLE ${m[1]}: ${err.message}`); continue; }
    const inAsset = bannedHostsIn(body);
    if (inAsset.length) fails.push(`BANNED_HOST_LIVE ${m[1]} (loaded by ${path}): names ${inAsset.join(", ")}`);
  }
  if (!html.includes(SPRY_LABS_ID)) fails.push(`PARENT_NOT_LIVE ${path}: live Organization does not name Spry Labs as its parent (${SPRY_LABS_ID})`);
}

// Rule 0: a run that looked at nothing is a failure, not a pass.
if (checked === 0 || assetsRead.size === 0) { console.error(`LIVE_CHECK_NOTHING_CHECKED (${checked} pages, ${assetsRead.size} scripts and styles)`); process.exit(1); }

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
console.log(`live: ${checked} pages name ${BRAND} in their title, none (nor the ${assetsRead.size} scripts and styles they load) names Clarity or Google Fonts, and each names Spry Labs as its parent`);
