import { uiText } from "@/i18n/uiText";
import { Link } from "react-router-dom";
import { MADE_BY_LINE } from "@/seo/schema";

/**
 * The site's own pages, one click from wherever this is rendered (the homepage,
 * About and every landing page). Every sitemap URL must be reachable within three
 * clicks of the homepage; scripts/check-prerender.mjs crawls the prerendered HTML
 * and fails CI if one is not.
 */
export const SITE_LINKS: { to: string; label: string }[] = [
  { to: "/about", label: "About Time-2-Read" },
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
    <nav className="mx-auto max-w-6xl px-4" aria-label={uiText("Site")}>
      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
        {SITE_LINKS.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="hover:text-primary transition-colors">{uiText(l.label)}</Link>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground" data-testid="made-by">
        <img src="/icon-192.png" alt={uiText("Time-2-Read logo")} width={24} height={24} className="h-6 w-6" />
        {MADE_BY_LINE}
      </p>
    </nav>
  </footer>
);
