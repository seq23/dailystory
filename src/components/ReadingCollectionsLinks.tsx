import { Link } from "react-router-dom";
import { landingPages } from "@/data/landingPages";

/**
 * Compact internal-link block surfacing the SEO landing pages.
 * Rendered at the bottom of the homepage for discoverability + SEO.
 */
export const ReadingCollectionsLinks = () => (
  <footer className="border-t border-border bg-background/80 py-8">
    <nav className="mx-auto max-w-6xl px-4" aria-label="Reading collections">
      <h2 className="font-fun text-base text-foreground mb-3">Reading collections</h2>
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
        {landingPages.map((p) => (
          <li key={p.slug}>
            <Link
              to={`/${p.slug}`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {p.navLabel}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  </footer>
);
