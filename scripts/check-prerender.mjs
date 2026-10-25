// CI guard for the build-time prerender: every sitemap page (except the sign-in
// app route) must ship real HTML in dist with its own title, description,
// canonical and text; landing pages must carry FAQPage JSON-LD; guide pages must
// collect nothing (no <form>/<input>, COPPA). Run after `npm run build`.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SITE = "https://time-2-read.com";
const APP_ROUTES = new Set(["/auth"]);
const dist = process.argv[2] ?? "dist";
const locs = [...readFileSync("public/sitemap.xml", "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (locs.length === 0) { console.error("PRERENDER_CHECK_NO_SITEMAP_URLS"); process.exit(1); }
const fails = [];
let checked = 0;
for (const loc of locs) {
  const path = new URL(loc).pathname.replace(/\/+$/, "") || "/";
  if (APP_ROUTES.has(path)) continue;
  const file = path === "/" ? join(dist, "index.html") : join(dist, path.slice(1), "index.html");
  if (!existsSync(file)) { fails.push(`${path}: no ${file}`); continue; }
  const html = readFileSync(file, "utf8");
  const root = html.match(/<div id="root" data-prerendered="([^"]+)">([\s\S]*?)<\/div>\s*<script>\(function\(\)\{var r=document/);
  const want = path === "/" ? `${SITE}/` : `${SITE}${path}`;
  if (!root || root[1] !== path) fails.push(`${path}: #root not prerendered for this path`);
  const text = (root?.[2] ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length < 300) fails.push(`${path}: only ${text.length} chars of text`);
  if (!/<title>[^<]{10,}<\/title>/.test(html)) fails.push(`${path}: no title`);
  if (!/<meta name="description" content="[^"]{40,}"/.test(html)) fails.push(`${path}: no description`);
  if (!html.includes(`<link rel="canonical" href="${want}"`)) fails.push(`${path}: canonical is not ${want}`);
  const lds = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const types = lds.flatMap((b) => (b["@graph"] ?? [b]).map((n) => n["@type"]));
  if (!types.includes("Organization")) fails.push(`${path}: shell JSON-LD lost`);
  const isLanding = /^\/(?!pricing$|privacy$|terms$|ccpa$|accessibility$|vendors$|gdpr$|ferpa$|data-transfers$|subprocessors$)[a-z0-9-]+$/.test(path);
  if (isLanding && !types.includes("FAQPage")) fails.push(`${path}: no FAQPage JSON-LD`);
  if (types.includes("Article") && /<(form|input|textarea)\b/i.test(root?.[2] ?? "")) fails.push(`${path}: guide page collects data`);
  checked++;
}
if (fails.length) { console.error(`PRERENDER_CHECK_FAILED\n  ${fails.join("\n  ")}`); process.exit(1); }
console.log(`prerender check: ${checked} pages carry real HTML, title, description, canonical and schema`);
