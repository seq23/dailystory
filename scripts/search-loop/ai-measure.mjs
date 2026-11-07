// AI-referral visits and AI-bot reads for guides.time-2-read.com, into the engine's ledger
// (search readiness f11: "the newest search-loop-week report carries a number for each").
//
// Why this exists: the shared engine (seq23/search-loop) reads these from a Cloudflare ZONE's
// analytics, and time-2-read.com is not a Cloudflare zone (Google Cloud DNS). The guides section
// is a Cloudflare Pages project whose middleware (guides-site/functions/_middleware.js) counts
// every page request into Workers Analytics Engine. This step runs as the engine's setup command,
// reads the last 24 hours, classifies with the ENGINE's own lists (.search-loop-engine/src/
// analytics.mjs: botFor, aiEngineFor — never a second hand-kept list) and writes today's row of
// data/search-loop/ai-daily.json in the engine's shape. The engine re-reads only a day that is
// not fully read, so a row written here stands and the weekly report sums it.
//
// RULE 0: no false zero. A day with no page request logged at all means the counter is not
// running, which is "not read" with the reason, never 0. A failed read never fails the run:
// it prints a NAMED NOTE and the engine's own "not read" stands for the day.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DATASET = 'time2read_guides_ai';
export const SQL = `SELECT blob1 AS kind, blob2 AS ua, blob3 AS ref, blob4 AS path, SUM(_sample_interval) AS n FROM ${DATASET} WHERE timestamp > NOW() - INTERVAL '1' DAY GROUP BY kind, ua, ref, path FORMAT JSON`;

/** Rows [{kind, ua, ref, path, n}] -> the engine's day shape, or { not_read }. */
export function dayFrom(rows, { botFor, aiEngineFor }) {
  const n = (r) => Number(r.n) || 0;
  const pages = rows.filter((r) => r.kind === 'page').reduce((a, r) => a + n(r), 0);
  if (pages === 0) return { not_read: `the guides site logged no page request in 24 hours, so its counter (Analytics Engine dataset ${DATASET}) is not running` };
  const bots = { total: 0, by_bot: {} };
  const vis = { total: 0, by_engine: {}, by_path: {}, source: 'pages-analytics-engine' };
  for (const r of rows) {
    const b = r.ua ? botFor(r.ua) : null;
    if (b) { bots.total += n(r); bots.by_bot[b] = (bots.by_bot[b] || 0) + n(r); continue; }
    const e = r.ref && r.kind === 'page' ? aiEngineFor(`https://${r.ref}`) : null;
    if (e) { vis.total += n(r); vis.by_engine[e] = (vis.by_engine[e] || 0) + n(r); vis.by_path[r.path] = (vis.by_path[r.path] || 0) + n(r); }
  }
  return { ai_visitors: vis, ai_bot_hits: bots, pages_logged: pages };
}

const partial = (d) => !d || d.not_read || d.ai_visitors_not_read || d.ai_bot_hits_not_read;

export async function measure({ root = ROOT, engineDir = path.join(root, '.search-loop-engine'), env = process.env, fetchImpl = fetch, now = new Date(), lib = null } = {}) {
  const cfg = JSON.parse(fs.readFileSync(path.join(root, 'search-loop.config.json'), 'utf8'));
  const file = path.join(root, cfg.ledger_dir || 'data/search-loop', 'ai-daily.json');
  const L = lib || {
    ...(await import(/* @vite-ignore */ pathToFileURL(path.join(engineDir, 'src', 'analytics.mjs')).href)),
    ...(await import(/* @vite-ignore */ pathToFileURL(path.join(engineDir, 'src', 'util.mjs')).href)),
  };
  const today = L.centralDate(now);
  const daily = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { schema: 'search-loop-ai-daily-v1', days: {} };
  daily.days ||= {};
  if (!partial(daily.days[today])) return { skipped: `${today} is already read` };
  const account = String(env.CLOUDFLARE_ACCOUNT_ID || '').trim(), token = String(env.CLOUDFLARE_API_TOKEN || '').trim();
  if (!account || !token) return { note: 'NAMED NOTE [AI_MEASURE_NOT_READ] CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN (Account Analytics: Read) not passed to the search loop' };
  let rows;
  try {
    const r = await fetchImpl(`https://api.cloudflare.com/client/v4/accounts/${account}/analytics_engine/sql`, { method: 'POST', headers: { authorization: `Bearer ${token}` }, body: SQL, signal: AbortSignal.timeout(30000) });
    const text = await r.text();
    if (!r.ok) return { note: `NAMED NOTE [AI_MEASURE_NOT_READ] Analytics Engine answered HTTP ${r.status}: ${text.replace(/\s+/g, ' ').slice(0, 160)}` };
    rows = JSON.parse(text).data || [];
  } catch (e) { return { note: `NAMED NOTE [AI_MEASURE_NOT_READ] Analytics Engine read failed: ${String(e.message).slice(0, 120)}` }; }
  const day = dayFrom(rows, L);
  if (day.not_read) return { note: `NAMED NOTE [AI_MEASURE_NOT_READ] ${day.not_read}` };
  daily.schema ||= 'search-loop-ai-daily-v1';
  daily.days[today] = { ...day, window: { since: new Date(now - 86400000).toISOString(), until: now.toISOString() } };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(daily, null, 2) + '\n');
  return { wrote: today, ai_visitors: day.ai_visitors.total, ai_bot_hits: day.ai_bot_hits.total, pages_logged: day.pages_logged };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = await measure().catch((e) => ({ note: `NAMED NOTE [AI_MEASURE_NOT_READ] ${String(e.message).slice(0, 160)}` }));
  const line = r.wrote ? `AI measure ${r.wrote}: ${r.ai_visitors} AI-referral visits, ${r.ai_bot_hits} AI-bot reads (${r.pages_logged} page requests logged)` : (r.note || r.skipped);
  console.log(line);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, line + '\n');
}
