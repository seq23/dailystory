// Old addresses that moved, and the page each one ships in their place. The live host (Lovable
// behind Cloudflare) ignores _redirects and _headers (checked 22 Nov 2026: /_redirects answers 404
// and no _headers rule reaches a response), so a server 301 cannot come from this repo. Each old
// address ships a page that sends the browser on at once (a 0-second meta refresh, which search
// engines treat as a permanent move, plus location.replace) and names the new address as canonical.
// prerender-run.mjs writes these pages; check-prerender.mjs checks them in dist.
export const SITE = "https://time-2-read.com";
export const MOVED = { "/vendors": "/subprocessors" };

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const movedPage = (to) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Moved | Time-2-Read</title>
    <link rel="canonical" href="${esc(SITE + to)}" />
    <meta http-equiv="refresh" content="0; url=${esc(to)}" />
    <script>location.replace(${JSON.stringify(to)});</script>
  </head>
  <body>
    <p>This page moved to <a href="${esc(to)}">${esc(SITE + to)}</a>.</p>
  </body>
</html>
`;

/** Problems with one moved address, by name; empty = it moves visitors and crawlers to `to`. */
export function movedPageProblems(from, to, html, sitemapPaths) {
  const problems = [];
  if (!html) return [`${from}: no page ships at the old address, so it answers with the homepage`];
  if (!new RegExp(`<meta http-equiv="refresh" content="0; url=${to.replace(/[/]/g, "\\/")}"`).test(html)) problems.push(`${from}: does not refresh to ${to} at once`);
  if (!html.includes(`<link rel="canonical" href="${SITE}${to}"`)) problems.push(`${from}: canonical is not ${SITE}${to}`);
  if (sitemapPaths.includes(from)) problems.push(`${from}: a moved address is still in the sitemap`);
  if (!sitemapPaths.includes(to)) problems.push(`${from}: moves to ${to}, which is not in the sitemap`);
  return problems;
}
