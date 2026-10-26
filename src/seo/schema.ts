// One source for the structured data every public page carries. The static shell
// (index.html) repeats ORGANIZATION and WEBSITE so crawlers that do not run
// JavaScript see them; src/test/guards/seo-surfaces.test.ts fails if the two drift.
// scripts/prerender-run.mjs adds pageGraph() to every prerendered page and
// scripts/check-prerender.mjs fails CI if a page loses any of it.
import { SITE_URL } from "@/config/site";
import { PLAN_PRICES, FREE_STORY_LIMIT } from "@/lib/freeStoryAllowance";

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const APP_ID = `${SITE_URL}/#app`;
/** Served from the site's own host (public/), never a third-party bucket. */
export const LOGO_URL = `${SITE_URL}/logo-512.png`;
export const OG_IMAGE_URL = `${SITE_URL}/og-image.png`;
/**
 * Public profiles that are the same entity. Only real, live URLs go here; the
 * product's public source repository is the one that exists today. Add a social
 * profile here (and in index.html) the day one is opened.
 */
export const ALTERNATE_NAMES = ["Time 2 Read", "time-2-read.com"] as const;
/** The line on the homepage and in the footer. */
export const MADE_BY_LINE = "Time-2-Read is made by Spry Labs in the USA.";

export const SAME_AS = ["https://github.com/seq23/dailystory"] as const;

export const ORGANIZATION = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: "Time-2-Read",
  // Other ways people type the name, so search engines join them to this site
  // (another site uses a similar name without the dashes).
  alternateName: [...ALTERNATE_NAMES],
  legalName: "Spry VSL LLC",
  url: `${SITE_URL}/`,
  logo: LOGO_URL,
  brand: { "@type": "Brand", name: "Spry Labs" },
  address: { "@type": "PostalAddress", addressCountry: "US" },
  email: "privacy@time-2-read.com",
  sameAs: [...SAME_AS],
} as const;

export const WEBSITE = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: "Time-2-Read",
  alternateName: [...ALTERNATE_NAMES],
  url: `${SITE_URL}/`,
  inLanguage: "en-US",
  publisher: { "@id": ORG_ID },
} as const;

const price = (cents: number) => (cents / 100).toFixed(2);

/** The product with its real prices (docs/PRICING.md, via PLAN_PRICES). */
export const SOFTWARE_APPLICATION = {
  "@type": "SoftwareApplication",
  "@id": APP_ID,
  name: "Time-2-Read",
  url: `${SITE_URL}/`,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web browser",
  description:
    "Personalized, illustrated reading stories with your child as the main character, read-aloud narration and tap-to-hear words.",
  image: OG_IMAGE_URL,
  publisher: { "@id": ORG_ID },
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      description: `Your first ${FREE_STORY_LIMIT} stories, no card`,
      price: "0.00",
      priceCurrency: "USD",
      url: `${SITE_URL}/pricing`,
    },
    {
      "@type": "Offer",
      name: "Premium monthly",
      price: price(PLAN_PRICES.monthly.amountCents),
      priceCurrency: "USD",
      url: `${SITE_URL}/pricing`,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: price(PLAN_PRICES.monthly.amountCents),
        priceCurrency: "USD",
        billingDuration: "P1M",
        unitCode: "MON",
      },
    },
    {
      "@type": "Offer",
      name: "Premium yearly",
      price: price(PLAN_PRICES.annual.amountCents),
      priceCurrency: "USD",
      url: `${SITE_URL}/pricing`,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: price(PLAN_PRICES.annual.amountCents),
        priceCurrency: "USD",
        billingDuration: "P1Y",
        unitCode: "ANN",
      },
    },
  ],
} as const;

/** Paths whose page carries the priced SoftwareApplication node. */
export const APP_PAGES = new Set(["/", "/pricing", "/about"]);

/** WebPage on every page, BreadcrumbList on inner pages, the product where it is sold. */
export function pageGraph(path: string, title: string, description: string) {
  const url = path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
  const nodes: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: title,
      description,
      inLanguage: "en-US",
      isPartOf: { "@id": WEBSITE_ID },
      publisher: { "@id": ORG_ID },
      primaryImageOfPage: { "@type": "ImageObject", url: OG_IMAGE_URL },
    },
  ];
  if (path !== "/") {
    nodes.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: title.split(/ [|—-] /)[0], item: url },
      ],
    });
  }
  if (APP_PAGES.has(path)) nodes.push(SOFTWARE_APPLICATION);
  return { "@context": "https://schema.org", "@graph": nodes };
}
