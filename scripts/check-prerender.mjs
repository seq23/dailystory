// CI guard for the build-time prerender: every sitemap page (except the sign-in
// app route) must ship real HTML in dist with its own title, description,
// canonical and text; landing pages must carry FAQPage JSON-LD; guide pages must
// collect nothing (no <form>/<input>, COPPA). Run after `npm run build`.
//
// Also the Boss OS search-readiness rules time-2-read.com failed on 25 Oct 2026,
// read from the same HTML a crawler gets: title 30-65 chars and unique; one meta
// description of 120-160 chars; og:image on our own host and present in public/;
// an Organization with name, url, logo and sameAs; WebPage on every page and
// BreadcrumbList on inner pages; a priced SoftwareApplication on the homepage;
// the homepage links /about; every sitemap URL within three clicks of the homepage;
// no app route (sign-in) in the sitemap; apple-touch-icon.png and site.webmanifest.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SITE = "https://time-2-read.com";
const APP_ROUTES = new Set(["/auth"]);
const dist = process.argv[2] ?? "dist";
const locs = [...readFileSync("public/sitemap.xml", "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (locs.length === 0) { console.error("PRERENDER_CHECK_NO_SITEMAP_URLS"); process.exit(1); }
const fails = [];
let checked = 0;
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const titles = new Map();
const linksOf = new Map();
for (const f of ["apple-touch-icon.png", "site.webmanifest", "favicon.ico", "og-image.png", "logo-512.png"]) {
  if (!existsSync(join("public", f))) fails.push(`public/${f} is missing`);
}
for (const loc of locs) {
  const path = new URL(loc).pathname.replace(/\/+$/, "") || "/";
  if (APP_ROUTES.has(path)) { fails.push(`${path}: an app route is in the sitemap; it serves the homepage's HTML and duplicates its title`); continue; }
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
  const isLanding = /^\/(?!about$|pricing$|privacy$|terms$|ccpa$|accessibility$|vendors$|gdpr$|ferpa$|data-transfers$|subprocessors$)[a-z0-9-]+$/.test(path);
  if (isLanding && !types.includes("FAQPage")) fails.push(`${path}: no FAQPage JSON-LD`);
  if (types.includes("Article") && /<(form|input|textarea)\b/i.test(root?.[2] ?? "")) fails.push(`${path}: guide page collects data`);
  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");
  if (title.length < 30 || title.length > 65) fails.push(`${path}: title is ${title.length} chars (30-65): "${title}"`);
  if (titles.has(title)) fails.push(`${path}: title "${title}" is also on ${titles.get(title)}`);
  titles.set(title, path);
  const descs = [...html.matchAll(/<meta name="description" content="([^"]*)"/g)].map((m) => decode(m[1]));
  if (descs.length !== 1) fails.push(`${path}: ${descs.length} meta descriptions (want exactly 1)`);
  else if (descs[0].length < 120 || descs[0].length > 160) fails.push(`${path}: description is ${descs[0].length} chars (120-160)`);
  const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ?? "";
  if (!ogImage.startsWith(`${SITE}/`)) fails.push(`${path}: og:image is not on ${SITE}: ${ogImage || "missing"}`);
  else if (!existsSync(join("public", new URL(ogImage).pathname.slice(1)))) fails.push(`${path}: og:image ${ogImage} is not in public/`);
  const nodes = lds.flatMap((b) => b["@graph"] ?? [b]);
  const org = nodes.find((n) => /Organization/.test(n["@type"]));
  for (const k of ["name", "url", "logo", "sameAs"]) {
    if (!org?.[k] || (Array.isArray(org[k]) && !org[k].length)) fails.push(`${path}: Organization lacks ${k}`);
  }
  if (org?.logo && !String(org.logo).startsWith(`${SITE}/`)) fails.push(`${path}: Organization logo is not on ${SITE}`);
  if (!types.includes("WebPage")) fails.push(`${path}: no WebPage JSON-LD`);
  if (path !== "/" && !types.includes("BreadcrumbList")) fails.push(`${path}: no BreadcrumbList JSON-LD`);
  if (path === "/") {
    if (!types.includes("WebSite")) fails.push("/: no WebSite JSON-LD");
    const app = nodes.find((n) => n["@type"] === "SoftwareApplication");
    const priced = (app?.offers ?? []).filter((o) => Number(o.price) > 0 && o.priceCurrency);
    if (priced.length < 2) fails.push("/: no SoftwareApplication with priced Offers (monthly and yearly)");
    if (!/<a [^>]*href="\/about"/.test(root?.[2] ?? "")) fails.push("/: the homepage does not link /about");
  }
  linksOf.set(path, [...(root?.[2] ?? "").matchAll(/<a [^>]*href="(\/[^"#?]*)"/g)].map((m) => m[1].replace(/\/+$/, "") || "/"));
  checked++;
}
// Every sitemap URL within three clicks of the homepage, following prerendered links only.
const depth = new Map([["/", 0]]);
for (let frontier = ["/"], d = 0; d < 3 && frontier.length; d++) {
  const next = [];
  for (const p of frontier) for (const l of linksOf.get(p) ?? []) if (!depth.has(l)) { depth.set(l, d + 1); next.push(l); }
  frontier = next;
}
for (const loc of locs) {
  const path = new URL(loc).pathname.replace(/\/+$/, "") || "/";
  if (!depth.has(path)) fails.push(`${path}: not reachable within three clicks of the homepage`);
}
// Bing Webmaster site-ownership tag (public code, not a secret) must survive the build.
const home = existsSync(join(dist, "index.html")) ? readFileSync(join(dist, "index.html"), "utf8") : "";
if (!/<meta name="msvalidate\.01" content="306F2E6DD99A91CBBA16C94091284F00"/.test(home)) fails.push("/: dist/index.html lost the msvalidate.01 Bing verification tag");
if (fails.length) { console.error(`PRERENDER_CHECK_FAILED\n  ${fails.join("\n  ")}`); process.exit(1); }
console.log(`prerender check: ${checked} pages carry real HTML, title, description, canonical and schema`);
