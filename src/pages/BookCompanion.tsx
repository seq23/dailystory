import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SiteFooterNav } from "@/components/SiteFooterNav";
import { FREE_STORY_LIMIT, PLAN_PRICES, TRIAL_DAYS } from "@/lib/freeStoryAllowance";
import { SITE_URL } from "@/config/site";
import { pageGraph } from "@/seo/schema";

/**
 * Kindle book companion pages. Each path is printed inside its book (with
 * ?utm_source=kindle&utm_medium=book&utm_campaign=<slug>), so a path here never changes.
 * Prices and the free allowance come from freeStoryAllowance.ts, never typed here.
 * The page never says the app makes decodable texts: its beginner stories use sight words
 * and simple words with phonics help, and the page says so.
 */
export interface CompanionBook {
  slug: string;
  book: string;
  title: string;
  description: string;
  definition: string;
}

export const COMPANION_BOOKS: CompanionBook[] = [
  {
    slug: "decodable-stories-1",
    book: "Decodable Stories for Early Readers, Book 1",
    title: "Decodable Stories Book 1 companion: a free story | Time-2-Read",
    description:
      "You are reading Decodable Stories for Early Readers, Book 1. Here is the free next step: make a story starring your child, read aloud, free for the first 3 stories.",
    definition:
      "Decodable stories are short texts written so that almost every word follows phonics patterns a beginning reader has already been taught, so the child can sound words out instead of guessing. They build the habit of decoding. After a decodable book, reading something new at the same level keeps practice going.",
  },
];

export const COMPANION_INDEX_PATH = "/amazon";
export const companionPath = (slug: string) => `/amazon/${slug}`;

function useHead(title: string, description: string, path: string, faq: { q: string; a: string }[] = []) {
  useEffect(() => {
    const url = `${SITE_URL}${path}`;
    const prevTitle = document.title;
    document.title = title;
    const restore: (() => void)[] = [];
    const setMeta = (attr: "name" | "property", key: string, value: string) => {
      let el = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      const prev = el.getAttribute("content");
      el.setAttribute("content", value);
      restore.push(() => { if (prev) el?.setAttribute("content", prev); });
    };
    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    const prevCanonical = link.getAttribute("href");
    link.setAttribute("href", url);
    const ldId = "ld-book-companion";
    document.getElementById(ldId)?.remove();
    const graph = pageGraph(path, title, description);
    if (faq.length) {
      graph["@graph"].push({
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      });
    }
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = ldId;
    script.text = JSON.stringify(graph);
    document.head.appendChild(script);
    return () => {
      document.getElementById(ldId)?.remove();
      document.title = prevTitle;
      restore.forEach((r) => r());
      if (prevCanonical) link?.setAttribute("href", prevCanonical);
    };
  }, [title, description, path, faq]);
}

const FAQ = (count: number) => [
  {
    q: "Are Time-2-Read stories decodable?",
    a: "Not in the strict sense. Time-2-Read's beginner stories use sight words and simple words, with phonics help on any word your child taps. They do not follow a fixed phonics sequence. If your child's school uses one, keep using those books for that practice and use Time-2-Read for extra reading.",
  },
  {
    q: "What does the free version include?",
    a: `Your first ${count} stories are free, with no credit card. Each one is illustrated, uses your child's name and interests, and can be read aloud. Premium adds unlimited stories and saving to your library.`,
  },
  {
    q: "Can I cancel Premium?",
    a: `Yes. Premium starts with a ${TRIAL_DAYS}-day free trial and renews at ${PLAN_PRICES.monthly.label} a month or ${PLAN_PRICES.annual.label} a year until you cancel in My Account.`,
  },
];

/** The page's one primary button: Premium, at its real price, to the pricing page. */
const PremiumCta = ({ pos }: { pos: "top" | "end" }) => (
  <p className="mb-2" data-book-cta={pos}>
    <Link to="/pricing">
      <Button size="lg">Start Premium — {PLAN_PRICES.monthly.label}/month ›</Button>
    </Link>
  </p>
);

export const BookCompanion = ({ slug }: { slug: string }) => {
  const { t } = useTranslation();
  const b = COMPANION_BOOKS.find((x) => x.slug === slug) ?? COMPANION_BOOKS[0];
  const faq = useMemo(() => FAQ(FREE_STORY_LIMIT), []);
  useHead(b.title, b.description, companionPath(b.slug), faq);
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-2">Kindle book companion</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">You&rsquo;re reading {b.book}</h1>
        <p className="text-lg text-foreground/80 leading-relaxed mb-4">{b.definition}</p>
        <p className="text-foreground/80 mb-4">
          Thank you for reading with your child. Time-2-Read Premium makes a new illustrated story starring your child
          every day, read aloud, at the level you choose.
        </p>
        <PremiumCta pos="top" />
        <p className="text-sm text-foreground/70 mb-8">
          {TRIAL_DAYS}-day free trial, then {PLAN_PRICES.monthly.label}/month or {PLAN_PRICES.annual.label}/year. Not ready? The
          free next step is just below.
        </p>

        <section className="space-y-4 text-foreground/80 leading-relaxed">
          <h2 className="text-2xl font-semibold text-foreground">What is the free next step?</h2>
          <p>
            Make the next story about your child. Time-2-Read writes a new illustrated story with your child as the hero,
            at the reading level you choose, and reads it aloud. Your first {FREE_STORY_LIMIT} stories are free, with no
            credit card.
          </p>
          <ol className="list-decimal ps-6 space-y-1">
            <li>Open Time-2-Read and start as a guest.</li>
            <li>Enter your child&rsquo;s first name, age and a favourite thing.</li>
            <li>Pick the easiest reading level and read the story together; tap any word for help sounding it out.</li>
          </ol>
          <p>
            <Link to="/">
              <Button size="lg" variant="outline">Make a free story about your child</Button>
            </Link>
          </p>

          <h2 className="text-2xl font-semibold text-foreground pt-4">How do the book and Time-2-Read fit together?</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">What you use</th>
                  <th className="text-left p-2">{t("about.cost")}</th>
                  <th className="text-left p-2">Best for</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">{b.book}</td>
                  <td className="p-2">Already yours</td>
                  <td className="p-2">Practising the phonics patterns the book teaches</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Time-2-Read, free</td>
                  <td className="p-2">{FREE_STORY_LIMIT} stories, no card</td>
                  <td className="p-2">Trying a story starring your child, read aloud</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Time-2-Read Premium</td>
                  <td className="p-2">
                    {PLAN_PRICES.monthly.label}/month or {PLAN_PRICES.annual.label}/year, {TRIAL_DAYS}{t("ui.day_free_trial")}
                  </td>
                  <td className="p-2">A new story every day, saved to your library</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            See every plan on the <Link to="/pricing" className="underline hover:text-primary">pricing page</Link>.
          </p>

          <h2 className="text-2xl font-semibold text-foreground pt-4">Questions parents ask</h2>
          {faq.map((f) => (
            <div key={f.q}>
              <h3 className="font-semibold text-foreground">{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
          <div className="pt-4">
            <PremiumCta pos="end" />
          </div>
          <p className="text-sm pt-4">
            Time-2-Read is a reading app, not a reading program or a treatment for any reading difficulty. Made by Spry
            Labs. <Link to="/about" className="underline hover:text-primary">{t("about.title")}</Link> ·{" "}
            <Link to={COMPANION_INDEX_PATH} className="underline hover:text-primary">All book companions</Link>
          </p>
        </section>
      </div>
      <SiteFooterNav />
    </main>
  );
};

export const BookCompanionIndex = () => {
  useHead(
    "Time-2-Read Kindle book companions",
    "Companion pages for the Time-2-Read Kindle books: the free next step for each book, a story starring your child.",
    COMPANION_INDEX_PATH,
  );
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-2">Kindle book companions</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Time-2-Read book companions</h1>
        <p className="text-foreground/80 leading-relaxed mb-6">
          Each Time-2-Read Kindle book links to one page here, with the free next step that goes with it. Pick your book.
        </p>
        <ul className="list-disc ps-6 space-y-2">
          {COMPANION_BOOKS.map((b) => (
            <li key={b.slug}>
              <Link to={`${companionPath(b.slug)}/`} className="underline hover:text-primary">{b.book}</Link>
            </li>
          ))}
        </ul>
      </div>
      <SiteFooterNav />
    </main>
  );
};
