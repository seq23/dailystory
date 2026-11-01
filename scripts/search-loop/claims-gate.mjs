#!/usr/bin/env node
// Time-2-Read's own claims gate, run on every page the shared search engine
// wrote, before anything is committed (proof or live). The engine's health gate
// is off for this site; the claims this brand never makes are listed as
// `banned_claims` in search-loop.config.json and read HERE (company brain, voice:
// never "no screens" or anti-AI framing, no medical/dyslexia claims, no grade
// jumps, stories English only, brand "Time-2-Read", ages 3-15).
// A page that trips one is removed and its ledger row marked "removed" with the
// reason, so it is never published thin or wrong.
//   node scripts/search-loop/claims-gate.mjs            gate the pages on disk
//   node scripts/search-loop/claims-gate.mjs --self-test
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export function loadRules(cfg) {
  const rules = (cfg.banned_claims || []).map((r) => ({ ...r, re: new RegExp(r.pattern, r.flags ?? 'i') }));
  if (!rules.length) throw new Error('NAMED STOP [NO_BANNED_CLAIMS] search-loop.config.json has no banned_claims; the gate would pass everything');
  return rules;
}

export function pageText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<(header|footer)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ');
}

/** Every banned claim a page makes: [{ id, match }]. Reads title, meta and body text. */
export function violations(html, rules) {
  const meta = [...html.matchAll(/<meta[^>]+content=["']([^"']*)["']/gi)].map((m) => m[1]).join(' ');
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
  const text = `${title} ${meta} ${pageText(html)}`;
  const out = [];
  for (const r of rules) { const m = text.match(r.re); if (m) out.push({ id: r.id, match: m[0] }); }
  return out;
}

export function gateSite(root = ROOT, configFile = 'search-loop.config.json') {
  const cfg = JSON.parse(fs.readFileSync(path.join(root, configFile), 'utf8'));
  const rules = loadRules(cfg);
  const dir = path.join(root, cfg.output.dir);
  const ledgerFile = path.join(root, cfg.ledger_dir || 'data/search-loop', 'pages.json');
  const book = fs.existsSync(ledgerFile) ? JSON.parse(fs.readFileSync(ledgerFile, 'utf8')) : { pages: [] };
  const result = { scanned: 0, removed: [] };
  if (!fs.existsSync(dir)) return result;
  for (const slug of fs.readdirSync(dir)) {
    const file = path.join(dir, slug, 'index.html');
    if (!fs.existsSync(file)) continue;
    result.scanned++;
    const v = violations(fs.readFileSync(file, 'utf8'), rules);
    if (!v.length) continue;
    fs.rmSync(path.join(dir, slug), { recursive: true, force: true });
    const reason = `claims gate: ${v.map((x) => `${x.id} "${x.match}"`).join(', ')}`;
    for (const p of book.pages || []) if (p.slug === slug || String(p.route || '').endsWith(`/${slug}/`)) { p.status = 'removed'; p.removed = { reason }; }
    result.removed.push({ slug, reason });
  }
  // A removed page leaves no dead "Related questions" link behind on its siblings.
  if (result.removed.length) {
    for (const slug of fs.readdirSync(dir)) {
      const file = path.join(dir, slug, 'index.html');
      if (!fs.existsSync(file)) continue;
      const before = fs.readFileSync(file, 'utf8');
      let after = before;
      for (const x of result.removed) {
        const href = `${cfg.output.url_prefix}${x.slug}/`;
        after = after.replace(new RegExp(`<li[^>]*>\\s*<a[^>]+href=["'](?:${cfg.base_url.replace(/[.]/g, '\\.')})?${href.replace(/[.]/g, '\\.')}["'][\\s\\S]*?<\\/li>`, 'g'), '');
      }
      if (after !== before) fs.writeFileSync(file, after);
    }
  }
  if (result.removed.length && fs.existsSync(ledgerFile)) fs.writeFileSync(ledgerFile, JSON.stringify(book, null, 2) + '\n');
  return result;
}

export function selfTest() {
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'search-loop.config.json'), 'utf8'));
  const rules = loadRules(cfg);
  const page = (s) => `<html><head><title>Q | Time-2-Read</title></head><body><main><p>${s}</p></main></body></html>`;
  const bad = {
    'no-screens': 'Reading with no screens is best.',
    'anti-ai': 'Unlike AI apps, we use real books.',
    medical: 'Stories that treat reading problems.',
    dyslexia: 'Great for dyslexic readers.',
    'grade-jump': 'Your child will jump two grade levels.',
    'non-english-stories': 'Stories in Spanish for every child.',
    'brand-spelling': 'Try Time2Read today.',
    'age-range': 'Made for 17-year-olds too.',
  };
  const problems = [];
  for (const r of rules) if (!bad[r.id]) problems.push(`rule ${r.id} has no self-test sample`);
  for (const [id, s] of Object.entries(bad)) {
    const v = violations(page(s), rules);
    if (!v.some((x) => x.id === id)) problems.push(`${id} not caught: "${s}"`);
  }
  const clean = 'Stories at your child\'s reading level, for ages 3 to 15. Time-2-Read stories are in English. It is time to read together.';
  const v = violations(page(clean), rules);
  if (v.length) problems.push(`clean page flagged: ${JSON.stringify(v)}`);
  return problems;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--self-test')) {
    const p = selfTest();
    if (p.length) { console.error(`claims-gate self-test FAILED:\n${p.join('\n')}`); process.exit(1); }
    console.log('claims-gate self-test ok');
  } else {
    const r = gateSite();
    console.log(`claims-gate: scanned=${r.scanned} removed=${r.removed.length}`);
    for (const x of r.removed) console.log(`  removed ${x.slug}: ${x.reason}`);
  }
}
