#!/usr/bin/env node
// Assembles the Time-2-Read guides site (guides.time-2-read.com) into
// dist-guides/ for Cloudflare Pages: the engine's pages under /questions/,
// a listing page, sitemap.xml, robots.txt, the IndexNow key file, _redirects
// and the stylesheet. This section deploys on its own (guides-deploy.yml) and
// never waits for a Lovable Publish of the app shell.
// Exit 1 with a named reason if the output would be empty or broken.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function collectPages(root, cfg) {
  const dir = path.join(root, cfg.output.dir);
  if (!fs.existsSync(dir)) return [];
  const book = (() => { try { return JSON.parse(fs.readFileSync(path.join(root, cfg.ledger_dir || 'data/search-loop', 'pages.json'), 'utf8')); } catch { return { pages: [] }; } })();
  const published = new Map((book.pages || []).map((p) => [p.slug, p]));
  const out = [];
  for (const slug of fs.readdirSync(dir).sort()) {
    const file = path.join(dir, slug, 'index.html');
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, 'utf8');
    const h1 = ((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || slug).replace(/<[^>]+>/g, '').trim();
    const row = published.get(slug);
    out.push({ slug, h1, url: `${cfg.base_url}${cfg.output.url_prefix}${slug}/`, lastmod: row?.strengthen?.at || row?.published_at || null });
  }
  return out;
}

export function listingHtml(cfg, pages) {
  const t = cfg.template || {};
  const title = `Reading questions parents ask | ${cfg.site_name}`;
  const desc = `Plain answers to the reading questions parents and teachers of children aged 3 to 15 ask most, from ${cfg.site_name}.`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${cfg.base_url}${cfg.output.url_prefix}">
${(t.stylesheets || []).map((s) => `<link rel="stylesheet" href="${esc(s)}">`).join('')}
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website"><meta property="og:url" content="${cfg.base_url}${cfg.output.url_prefix}">
<meta property="og:image" content="${esc(t.og_image?.url || '')}"><meta name="twitter:card" content="summary_large_image"></head>
<body>${t.header_html || ''}<main><h1>Reading questions parents ask</h1>
<p>Short, plain answers for parents, homeschool families and teachers of children aged 3 to 15 (Pre-K through 10th grade).</p>
<ul class="guide-list">${pages.map((p) => `<li><a href="${cfg.output.url_prefix}${p.slug}/">${esc(p.h1)}</a></li>`).join('')}</ul>
<p><a class="cta" href="${esc(cfg.action.url)}">${esc(cfg.action.label)}</a></p></main>${t.footer_html || ''}</body></html>
`;
}

export function sitemapXml(cfg, pages) {
  const rows = [{ url: `${cfg.base_url}${cfg.output.url_prefix}`, lastmod: null }, ...pages];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.map((r) => `  <url><loc>${esc(r.url)}</loc>${r.lastmod ? `<lastmod>${r.lastmod}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`;
}

export function assemble(root = ROOT, outDir = path.join(ROOT, 'dist-guides')) {
  const cfg = JSON.parse(fs.readFileSync(path.join(root, 'search-loop.config.json'), 'utf8'));
  const keyFiles = fs.readdirSync(path.join(root, 'public')).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f));
  if (keyFiles.length !== 1 || keyFiles[0] !== `${cfg.indexnow.key}.txt`) throw new Error(`NAMED STOP [INDEXNOW_KEY_MISMATCH] public/<key>.txt must be the one key in search-loop.config.json indexnow.key`);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(outDir, 'assets'), { recursive: true });
  const pages = collectPages(root, cfg);
  const src = path.join(root, cfg.output.dir);
  if (fs.existsSync(src)) fs.cpSync(src, path.join(outDir, cfg.output.dir), { recursive: true });
  fs.mkdirSync(path.join(outDir, cfg.output.dir), { recursive: true });
  fs.writeFileSync(path.join(outDir, cfg.output.dir, 'index.html'), listingHtml(cfg, pages));
  fs.cpSync(path.join(root, 'guides-site', 'static', 'guides.css'), path.join(outDir, 'assets', 'guides.css'));
  fs.copyFileSync(path.join(root, 'public', keyFiles[0]), path.join(outDir, keyFiles[0]));
  fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemapXml(cfg, pages));
  fs.writeFileSync(path.join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${cfg.base_url}/sitemap.xml\n`);
  const merges = fs.existsSync(path.join(root, 'guides-site', '_redirects')) ? fs.readFileSync(path.join(root, 'guides-site', '_redirects'), 'utf8').trim() : '';
  fs.writeFileSync(path.join(outDir, '_redirects'), `/ ${cfg.output.url_prefix} 301\n${merges ? merges + '\n' : ''}`);
  // Only pages and crawler-readable files run the counter (guides-site/functions/_middleware.js);
  // the stylesheet and assets are served without a Function invocation.
  fs.writeFileSync(path.join(outDir, '_routes.json'), JSON.stringify({ version: 1, include: ['/*'], exclude: ['/assets/*'] }, null, 2) + '\n');
  return { pages: pages.length, out: outDir };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = assemble();
  console.log(`guides site: ${r.pages} page(s) assembled into ${path.relative(ROOT, r.out)}/`);
}
