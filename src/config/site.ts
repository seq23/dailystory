// The site's public origin. Every absolute URL the app emits (canonical, og:url,
// JSON-LD, sitemap, robots) uses this host — never the *.lovable.app preview host.
// public/sitemap.xml, public/robots.txt and index.html are static files and must
// repeat it (the central search audit checks the live canonical host).
export const SITE_URL = "https://time-2-read.com";
