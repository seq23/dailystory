// AI-bot reads and AI-referral visits on guides.time-2-read.com (search readiness f11).
//
// time-2-read.com is not a Cloudflare zone (its DNS is Google Cloud DNS), so the shared engine's
// zone-analytics reader has nothing to read. The guides section is a Cloudflare Pages project,
// so this middleware counts each page request into Workers Analytics Engine (dataset
// time2read_guides_ai, free) and scripts/search-loop/ai-measure.mjs reads it every day into the
// engine's ledger (data/search-loop/ai-daily.json) before the engine writes its weekly report.
//
// Privacy (the engine's rule, config/ai_referrers.json): no IP, no cookie, no query string.
// A referrer is kept as its HOSTNAME only, never the URL (some answer engines put the person's
// question in it). A user agent is kept only when it is a crawler's, never a person's browser.
// Counting never touches the response: any error here is swallowed and the page is served.

export const DATASET = 'time2read_guides_ai';
// Broad on purpose: the reader classifies exactly with the engine's own bot list.
export const CRAWLER_UA = /bot\b|bot\/|crawl|spider|slurp|gpt|openai|claude|anthropic|perplexity|google-extended|googleother|bytespider|ccbot|amazonbot|applebot|meta-external|facebookexternal|cohere|diffbot|youbot|duckassist|mistral|timpi|omgili|ai2bot|petalbot|bingpreview/i;
const OWN_HOST = /(^|\.)time-2-read\.com$/i;

/** One row per request, or null for a request not worth counting (an asset, a non-GET). */
export function rowFor(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return null;
  const url = new URL(request.url);
  const type = response?.headers?.get('content-type') || '';
  const page = /text\/html/i.test(type);
  const ua = String(request.headers.get('user-agent') || '');
  const crawler = CRAWLER_UA.test(ua) ? ua.slice(0, 256) : '';
  let ref = '';
  try { const h = new URL(request.headers.get('referer') || '').hostname.toLowerCase(); if (h && !OWN_HOST.test(h)) ref = h; } catch { ref = ''; }
  if (!page && !crawler) return null;
  return { blobs: [page ? 'page' : 'other', crawler, ref, url.pathname.slice(0, 200)], doubles: [1], indexes: [page ? 'page' : 'other'] };
}

export async function onRequest(context) {
  const response = await context.next();
  try {
    const row = rowFor(context.request, response);
    if (row && context.env.AI_LOG) context.env.AI_LOG.writeDataPoint(row);
  } catch { /* counting must never break a page */ }
  return response;
}
