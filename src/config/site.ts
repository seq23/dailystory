// The site's public origin. Every absolute URL the app emits (canonical, og:url,
// JSON-LD, sitemap, robots) uses this host — never the *.lovable.app preview host.
// public/sitemap.xml, public/robots.txt and index.html are static files and are
// pinned to the same value by src/test/guards/site-url.test.ts.
export const SITE_URL = "https://time-2-read.com";
