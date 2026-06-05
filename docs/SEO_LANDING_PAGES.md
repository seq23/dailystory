# SEO Landing Pages

Dedicated, indexable landing pages targeting "easy"-difficulty keywords
(from Semrush research) to capture organic Google traffic.

## Architecture (data-driven)
- `src/data/landingPages.ts` — single source of truth: one config object
  per page (slug, title, meta description, H1, hero copy/image, benefits,
  FAQs). Also exports `kindergartenSightWords` (generic public-domain
  Dolch/Fry list) for the sight-words page.
- `src/pages/LandingPage.tsx` — one reusable template. Reads config by
  `slug` prop, sets per-page `<title>`, meta description, canonical, og:*,
  and FAQPage JSON-LD via `useEffect`. Renders hero, intro, benefits,
  optional sight-words section (`variant: "sightWords"`), FAQ accordion,
  CTA, and a footer that cross-links all other landing pages.
- `src/App.tsx` — maps `landingPages` to one `<Route>` each.
- `public/sitemap.xml` — every landing slug is listed for indexing.

## Add a new landing page
1. Append a `LandingPageConfig` to `landingPages` in
   `src/data/landingPages.ts`.
2. Add its URL to `public/sitemap.xml`.
Routes and footer cross-links update automatically.

## Current pages (14)
free-books-for-kindergarteners, kindergarten-sight-words, toddler-books,
books-for-kindergarten, first-grade-books, books-for-5-year-olds,
books-for-4-year-olds, books-for-6-year-olds,
read-aloud-books-for-kindergarten, books-for-toddlers,
books-for-preschoolers, leveled-readers, short-bedtime-stories-for-kids.

## Notes
- CTAs link to `/?action=new-story` (guest "Start a free story") and
  `/pricing`. No login wall on the primary CTA to maximize conversion.
- Sight-words page ties the keyword to the in-app custom word-list
  feature ("add your words and the AI weaves them into stories").
- Images reuse existing brand assets in `src/assets` (lean).
