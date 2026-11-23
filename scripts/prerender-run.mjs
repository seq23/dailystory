// Runs the SSR-built prerender entry under jsdom and writes real HTML for every
// public marketing page into dist. Invoked by vite-plugins/prerenderPlugin.ts after
// the client build; a child process so stray timers never hold the build open.
// Fails (non-zero, PRERENDER_* named error) rather than ship an empty page.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import { MOVED, movedPage } from "./moved-pages.mjs";

const [distDir, entryFile] = process.argv.slice(2);
if (!distDir || !entryFile) { console.error("usage: prerender-run.mjs <dist> <entry.mjs>"); process.exit(2); }
const SITE = "https://time-2-read.com";
const template = readFileSync(join(distDir, "index.html"), "utf8");
if (!template.includes('<div id="root"></div>')) { console.error("PRERENDER_NO_EMPTY_ROOT dist/index.html has no empty #root (already prerendered?)"); process.exit(1); }

const dom = new JSDOM(template, { url: `${SITE}/`, pretendToBeVisual: true });
const w = dom.window;
w.matchMedia ??= () => ({ matches: false, media: "", addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, onchange: null, dispatchEvent: () => false });
for (const C of ["ResizeObserver", "IntersectionObserver"]) w[C] ??= class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
w.scrollTo = () => {};
for (const key of Object.getOwnPropertyNames(w)) {
  if (key in globalThis && key !== "navigator" && key !== "location") continue;
  try { Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: w[key] }); } catch { /* read-only global */ }
}
globalThis.window = w; globalThis.self = w;
globalThis.IS_REACT_ACT_ENVIRONMENT = false;
const shellHead = w.document.head.innerHTML;

const { prerenderRoutes, renderRoute, pageGraph } = await import(pathToFileURL(entryFile).href);
if (typeof pageGraph !== "function") { console.error("PRERENDER_NO_PAGE_GRAPH entry does not export pageGraph"); process.exit(1); }
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const setAttr = (html, re, value) => {
  if (!re.test(html)) throw new Error(`PRERENDER_TEMPLATE_MISSING ${re}`);
  return html.replace(re, (_m, a, _old, b) => `${a}${esc(value)}${b}`);
};
const textLen = (html) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length;

const written = [];
for (const { path } of prerenderRoutes) {
  w.document.head.innerHTML = shellHead;
  w.document.getElementById("root").innerHTML = "";
  dom.reconfigure({ url: `${SITE}${path}` });
  const r = await renderRoute(path);
  const url = path === "/" ? `${SITE}/` : `${SITE}${path}`;
  const chars = textLen(r.html);
  if (chars < 300) throw new Error(`PRERENDER_THIN_PAGE ${path} rendered ${chars} chars of text`);
  if (!r.title) throw new Error(`PRERENDER_NO_TITLE ${path}`);
  let out = template;
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${esc(r.title)}</title>`);
  out = setAttr(out, /(<meta name="description" content=")([^"]*)(")/, r.description);
  out = setAttr(out, /(<meta property="og:title" content=")([^"]*)(")/, r.title);
  out = setAttr(out, /(<meta property="og:description" content=")([^"]*)(")/, r.description);
  out = setAttr(out, /(<meta property="og:url" content=")([^"]*)(")/, url);
  out = setAttr(out, /(<meta name="twitter:title" content=")([^"]*)(")/, r.title);
  out = setAttr(out, /(<meta name="twitter:description" content=")([^"]*)(")/, r.description);
  out = setAttr(out, /(<meta name="twitter:url" content=")([^"]*)(")/, url);
  out = setAttr(out, /(<link rel="canonical" href=")([^"]*)(")/, url);
  // WebPage on every page, BreadcrumbList on inner pages, the priced product where it is sold (src/seo/schema.ts).
  const graph = JSON.stringify(pageGraph(path, r.title, r.description));
  const ld = [...r.jsonLd.filter(Boolean), graph].map((j) => `<script type="application/ld+json">${j.replace(/</g, "\\u003c")}</script>`).join("\n    ");
  if (ld) out = out.replace("</head>", `    ${ld}\n  </head>`);
  // Served as the SPA fallback too (dist/index.html), so the static markup is
  // dropped before first paint on any path it was not rendered for.
  const guard = `<script>(function(){var r=document.getElementById("root"),p=location.pathname.replace(/\\/+$/,"")||"/";if(r&&r.getAttribute("data-prerendered")!==p)r.innerHTML="";})();</script>`;
  out = out.replace('<div id="root"></div>', `<div id="root" data-prerendered="${path}">${r.html}</div>\n    ${guard}`);
  const file = path === "/" ? join(distDir, "index.html") : join(distDir, path.slice(1), "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, out);
  written.push(`${path} (${chars} chars, ${r.jsonLd.length} ld)`);
}
// App routes (sign-in) stay client-rendered, but ship as a real file holding the app shell, so the
// address exists on any static host, not only behind Lovable's fallback (which serves this same
// shell). 404.html is the shell titled and noindexed as a missing page; the app's NotFound route
// draws it. Lovable ignores 404.html (heygetonmylevel ships one); a static host answers 404 with it.
for (const appRoute of ["/auth"]) {
  const file = join(distDir, appRoute.slice(1), "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, template);
}
// Old addresses that moved ship a page that sends the browser on (scripts/moved-pages.mjs).
for (const [from, to] of Object.entries(MOVED)) {
  const file = join(distDir, from.slice(1), "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, movedPage(to));
}
const notFound = template
  .replace(/<title>[^<]*<\/title>/, "<title>Page not found | Time-2-Read</title>")
  .replace("</head>", `    <meta name="robots" content="noindex" />\n  </head>`);
if (notFound === template) { console.error("PRERENDER_404_TEMPLATE the shell has no <title> to rename"); process.exit(1); }
writeFileSync(join(distDir, "404.html"), notFound);
console.log(`prerendered ${written.length} pages:\n  ${written.join("\n  ")}\n  /auth (app shell)\n  ${Object.entries(MOVED).map(([f, t]) => `${f} -> ${t} (moved)`).join("\n  ")}\n  404.html`);
process.exit(0);
