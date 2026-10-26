import { useEffect } from "react";
import { SiteFooterNav } from "@/components/SiteFooterNav";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  landingPagesBySlug,
  kindergartenSightWords,
  landingPages,
  type LandingPageConfig,
} from "@/data/landingPages";
import { SITE_URL } from "@/config/site";
import { FREE_STORY_LIMIT } from "@/lib/freeStoryAllowance";
import { landingJsonLd } from "@/data/landingJsonLd";

const BASE_URL = SITE_URL;

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
    script.text = JSON.stringify(landingJsonLd(config));
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
      Practice these high-frequency words at home, then add them to a Time-2-Read story so your child sees them in context.
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
        Time-2-Read's beginner reading levels are written mostly with Dolch sight words, so your child meets
        them again and again inside a personalized, illustrated story where they are the main character.
      </p>
      <Button asChild size="lg">
        <Link to="/?action=new-story">Start a free sight word story</Link>
      </Button>
    </Card>
  </section>
);

const LOG_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** Printable weekly log. Nothing to type in and nothing sent anywhere: it prints. */
const ReadingLogSection = () => (
  <section className="mx-auto max-w-4xl px-4 py-12" aria-labelledby="reading-log-heading">
    <div className="printable-log rounded-2xl border-2 border-primary/30 bg-card p-6 md:p-8">
      <h2 id="reading-log-heading" className="font-fun text-2xl md:text-3xl text-foreground mb-1">
        My 20-Minute Reading Log
      </h2>
      <p className="text-muted-foreground mb-6">
        Name: ____________________ &nbsp; Week of: ______________ &nbsp; Goal: 20 minutes a day
      </p>
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr>
            <th scope="col" className="border border-border p-2 w-28">Day</th>
            <th scope="col" className="border border-border p-2">What I read</th>
            <th scope="col" className="border border-border p-2 w-24">Minutes</th>
            <th scope="col" className="border border-border p-2 w-32">Grown-up initials</th>
          </tr>
        </thead>
        <tbody>
          {LOG_DAYS.map((d) => (
            <tr key={d}>
              <th scope="row" className="border border-border p-2 font-medium">{d}</th>
              <td className="border border-border p-2 h-12"></td>
              <td className="border border-border p-2"></td>
              <td className="border border-border p-2"></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-sm text-muted-foreground">
        Total minutes this week: ________ &nbsp; Days I hit 20 minutes: ____ / 7
      </p>
      <p className="mt-2 text-xs text-muted-foreground">Free printable from time-2-read.com</p>
    </div>
    <div className="mt-6 flex flex-wrap gap-3 justify-center">
      <Button size="lg" variant="outline" onClick={() => window.print()}>
        Print the reading log
      </Button>
      <Button asChild size="lg">
        <Link to="/?action=new-story">Start a story with the 20-minute timer</Link>
      </Button>
    </div>
  </section>
);

const GuideSections = ({ config }: { config: LandingPageConfig }) => (
  <>
    {config.sections?.map((sec) => (
      <section key={sec.heading} className="mx-auto max-w-3xl px-4 py-6">
        <h2 className="font-fun text-2xl md:text-3xl text-foreground mb-4">{sec.heading}</h2>
        {sec.paragraphs?.map((p, i) => (
          <p key={i} className="text-base md:text-lg text-foreground/80 mb-4 leading-relaxed">{p}</p>
        ))}
        {sec.bullets && (
          <ul className="list-disc pl-6 space-y-2 text-base md:text-lg text-foreground/80">
            {sec.bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        )}
      </section>
    ))}
  </>
);

const Sources = ({ config }: { config: LandingPageConfig }) =>
  config.sources?.length ? (
    <section className="mx-auto max-w-3xl px-4 py-6" aria-labelledby="sources-heading">
      <h2 id="sources-heading" className="font-fun text-xl text-foreground mb-3">Sources</h2>
      <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
        {config.sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  ) : null;

const LandingPage = ({ slug }: { slug: string }) => {
  const config = landingPagesBySlug[slug];
  useLandingSeo(config);
  if (!config) return null;

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

      {config.variant === "readingLog" && <ReadingLogSection />}

      <GuideSections config={config} />

      {config.variant === "sightWords" && <SightWordsSection />}

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="font-fun text-2xl md:text-3xl text-foreground mb-6 text-center">
          Frequently asked questions
        </h2>
        {/* Native details/summary: answers stay in the HTML for crawlers (prerendered). */}
        <div className="w-full divide-y divide-border border-y border-border">
          {config.faqs.map((f, i) => (
            <details key={i} className="group py-4">
              <summary className="cursor-pointer list-none font-medium text-left text-foreground flex justify-between gap-4">
                {f.q}
                <span aria-hidden="true" className="transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <Sources config={config} />

      {/* CTA */}
      <section className="bg-primary/5 py-14">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-fun text-2xl md:text-3xl text-foreground mb-4">
            Ready to start reading?
          </h2>
          <p className="text-muted-foreground mb-6">
            Create a personalized, illustrated story in seconds. Your first {FREE_STORY_LIMIT} stories are free.
          </p>
          <Button asChild size="lg">
            <Link to="/?action=new-story">Start your {FREE_STORY_LIMIT} free stories</Link>
          </Button>
        </div>
      </section>

      {/* Footer cross-links */}
      <footer className="border-t border-border py-10">
        <nav className="mx-auto max-w-6xl px-4" aria-label="More reading collections">
          <h2 className="font-fun text-lg text-foreground mb-4">Guides for parents and teachers</h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 mb-8">
            {landingPages
              .filter((p) => p.kind === "guide" && p.slug !== slug)
              .map((p) => (
                <li key={p.slug}>
                  <Link to={`/${p.slug}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {p.navLabel}
                  </Link>
                </li>
              ))}
          </ul>
          <h2 className="font-fun text-lg text-foreground mb-4">Explore more reading collections</h2>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
            {landingPages
              .filter((p) => p.kind !== "guide" && p.slug !== slug)
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
              ← Back to Time-2-Read home
            </Link>
          </div>
        </nav>
      </footer>
      <SiteFooterNav />
    </main>
  );
};

export default LandingPage;
