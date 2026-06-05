import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  landingPagesBySlug,
  kindergartenSightWords,
  landingPages,
  type LandingPageConfig,
} from "@/data/landingPages";

const BASE_URL = "https://time-2-read.lovable.app";

function useLandingSeo(config: LandingPageConfig | undefined) {
  useEffect(() => {
    if (!config) return;
    const url = `${BASE_URL}/${config.slug}`;
    document.title = config.title;

    const setMeta = (selector: string, attr: "name" | "property", key: string, value: string) => {
      let el = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    setMeta('meta[name="description"]', "name", "description", config.metaDescription);
    setMeta('meta[property="og:title"]', "property", "og:title", config.title);
    setMeta('meta[property="og:description"]', "property", "og:description", config.metaDescription);
    setMeta('meta[property="og:url"]', "property", "og:url", url);

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    const prevCanonical = canonical.getAttribute("href");
    canonical.setAttribute("href", url);

    const ldId = "ld-landing-faq";
    document.getElementById(ldId)?.remove();
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = ldId;
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: config.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
    document.head.appendChild(script);

    return () => {
      document.getElementById(ldId)?.remove();
      if (prevCanonical) canonical?.setAttribute("href", prevCanonical);
    };
  }, [config]);
}

const SightWordsSection = () => (
  <section className="mx-auto max-w-4xl px-4 py-12" aria-labelledby="sight-words-heading">
    <h2 id="sight-words-heading" className="font-fun text-2xl md:text-3xl text-foreground mb-4">
      Free Kindergarten Sight Words List
    </h2>
    <p className="text-muted-foreground mb-6">
      Practice these high-frequency words at home, then add them to a Time2Read story so your child sees them in context.
    </p>
    <div className="flex flex-wrap gap-2 mb-10">
      {kindergartenSightWords.map((word) => (
        <span
          key={word}
          className="rounded-full bg-secondary px-4 py-1.5 text-secondary-foreground text-sm font-medium"
        >
          {word}
        </span>
      ))}
    </div>
    <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 p-6 md:p-8 text-center">
      <h3 className="font-fun text-xl md:text-2xl text-foreground mb-3">
        Turn sight words into stories ✨
      </h3>
      <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
        Inside Time2Read, type in the exact sight words your child is learning. Our AI weaves them into a
        personalized, illustrated story — so practice feels like play and the words actually stick.
      </p>
      <Button asChild size="lg">
        <Link to="/?action=new-story">Start a free story with your words</Link>
      </Button>
    </Card>
  </section>
);

const LandingPage = ({ slug }: { slug: string }) => {
  const config = landingPagesBySlug[slug];
  if (!config) return null;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useLandingSeo(config);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-20 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="font-fun text-3xl md:text-5xl text-foreground leading-tight mb-4">
              {config.h1}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">{config.heroSubtitle}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/?action=new-story">Start a free story</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/pricing">See pricing</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img
              src={config.heroImage}
              alt={config.heroImageAlt}
              loading="eager"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-3xl px-4 py-8">
        {config.intro.map((p, i) => (
          <p key={i} className="text-base md:text-lg text-foreground/80 mb-4 leading-relaxed">
            {p}
          </p>
        ))}
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {config.benefits.map((b) => (
            <Card key={b.title} className="p-6">
              <h2 className="font-fun text-xl text-foreground mb-2">{b.title}</h2>
              <p className="text-muted-foreground">{b.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {config.variant === "sightWords" && <SightWordsSection />}

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="font-fun text-2xl md:text-3xl text-foreground mb-6 text-center">
          Frequently asked questions
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {config.faqs.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="bg-primary/5 py-14">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-fun text-2xl md:text-3xl text-foreground mb-4">
            Ready to start reading?
          </h2>
          <p className="text-muted-foreground mb-6">
            Create a personalized, illustrated story in seconds — free to try, no signup required.
          </p>
          <Button asChild size="lg">
            <Link to="/?action=new-story">Start a free story</Link>
          </Button>
        </div>
      </section>

      {/* Footer cross-links */}
      <footer className="border-t border-border py-10">
        <nav className="mx-auto max-w-6xl px-4" aria-label="More reading collections">
          <h2 className="font-fun text-lg text-foreground mb-4">Explore more reading collections</h2>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
            {landingPages
              .filter((p) => p.slug !== slug)
              .map((p) => (
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
          <div className="mt-6">
            <Link to="/" className="text-sm font-medium text-primary hover:underline">
              ← Back to Time2Read home
            </Link>
          </div>
        </nav>
      </footer>
    </main>
  );
};

export default LandingPage;
