import { SITE_URL } from "@/config/site";
import type { LandingPageConfig } from "./landingPages";

/** One JSON-LD graph per landing page: FAQPage always, Article for guide pages. */
export function landingJsonLd(config: LandingPageConfig) {
  const url = `${SITE_URL}/${config.slug}`;
  const graph: Record<string, unknown>[] = [
    {
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      url,
      mainEntity: config.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];
  if (config.kind === "guide") {
    graph.push({
      "@type": "Article",
      "@id": `${url}#article`,
      headline: config.h1,
      description: config.metaDescription,
      url,
      mainEntityOfPage: url,
      inLanguage: "en-US",
      author: { "@id": `${SITE_URL}/#organization` },
      publisher: { "@id": `${SITE_URL}/#organization` },
      citation: (config.sources ?? []).map((s) => s.url),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
