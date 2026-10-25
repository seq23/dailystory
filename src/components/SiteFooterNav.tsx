import { Link } from "react-router-dom";

/**
 * The site's own pages, one click from wherever this is rendered (the homepage,
 * About and every landing page). Every sitemap URL must be reachable within three
 * clicks of the homepage; scripts/check-prerender.mjs crawls the prerendered HTML
 * and fails CI if one is not.
 */
export const SITE_LINKS: { to: string; label: string }[] = [
  { to: "/about", label: "About Time2Read" },
  { to: "/pricing", label: "Pricing" },
  { to: "/privacy", label: "Privacy policy" },
  { to: "/terms", label: "Terms of service" },
  { to: "/accessibility", label: "Accessibility" },
  { to: "/ccpa", label: "California privacy (CCPA)" },
  { to: "/gdpr", label: "GDPR rights" },
  { to: "/ferpa", label: "FERPA for schools" },
  { to: "/vendors", label: "Vendors" },
  { to: "/subprocessors", label: "Subprocessors" },
  { to: "/data-transfers", label: "International data transfers" },
];

export const SiteFooterNav = () => (
  <footer className="border-t border-border bg-background py-6">
    <nav className="mx-auto max-w-6xl px-4" aria-label="Site">
      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
        {SITE_LINKS.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="hover:text-primary transition-colors">{l.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  </footer>
);
