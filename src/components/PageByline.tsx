import { Link } from "react-router-dom";
import { ORGANIZATION } from "@/seo/schema";

/**
 * The visible byline every public page carries (Search Readiness c6, 3 Nov 2026:
 * the sampled pages named no author or reviewer anywhere a reader or an answer
 * engine could see). It names the team that writes and reviews these pages and
 * links /about with rel="author", so the visible text and the JSON-LD author
 * (src/data/landingJsonLd.ts, src/seo/schema.ts) name the same entity.
 *
 * Rendered from SiteFooterNav, which every public page mounts, so no page can be
 * built without it; scripts/check-prerender.mjs fails the merge gate if a
 * prerendered sitemap page ships without a rel="author" byline.
 */
export const BYLINE_AUTHOR = ORGANIZATION.name;

export const PageByline = () => (
  <p className="mt-3 text-sm text-muted-foreground" data-testid="page-byline">
    Written and reviewed by{" "}
    <Link to="/about" rel="author" className="hover:text-primary transition-colors underline">
      {BYLINE_AUTHOR}
    </Link>
    , the team that builds this reading app at Spry Labs.
  </p>
);
