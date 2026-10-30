import { uiText } from "@/i18n/uiText";
import { Link } from "react-router-dom";
import { landingPages } from "@/data/landingPages";
import { FREE_STORY_LIMIT, PLAN_PRICES, TRIAL_DAYS } from "@/lib/freeStoryAllowance";
import { MADE_BY_LINE } from "@/seo/schema";

/**
 * What Time-2-Read is, in plain text. Rendered on the homepage below the app and
 * prerendered into dist/index.html at build time, so search and AI crawlers that
 * do not run JavaScript see the same words a visitor sees.
 */
export const HomeIntro = () => (
  <section className="border-t border-border bg-background py-10" aria-labelledby="home-intro-heading">
    <div className="mx-auto max-w-4xl px-4">
      <h1 id="home-intro-heading" className="font-fun text-2xl md:text-3xl text-foreground mb-4">
         {uiText("Time-2-Read: personalized reading adventures where your child is the main character")} </h1>
      <p className="text-foreground/80 mb-4 leading-relaxed">
         {uiText("Time-2-Read writes a brand-new illustrated story around your child: their name, the things they love, and the reading level they are at. It is built for kids ages 3 to 15, from pre-readers who listen along with read-aloud narration to confident readers who want a challenge.")} </p>
      <p className="text-foreground/80 mb-4 font-medium" data-testid="home-made-by">{MADE_BY_LINE}</p>
      <ul className="list-disc pl-6 space-y-1 text-foreground/80 mb-4">
        <li> {uiText("Your child is the hero of every story, with an illustration on every page.")} </li>
        <li> {uiText("Tap any word to hear it, with phonics help to sound out tricky words.")} </li>
        <li> {uiText("Text-to-speech narration and word-by-word highlighting.")} </li>
        <li> {uiText("A 20-minute reading timer built into every story: the 20 minutes of screen time that's actually reading.")} </li>
      </ul>
      <p className="text-foreground/80 mb-6">
        {uiText("Your first {{count}} stories are free. Premium starts with a {{days}}-day free trial, then {{monthly}} per month or {{annual}} per year.", { count: FREE_STORY_LIMIT, days: TRIAL_DAYS, monthly: PLAN_PRICES.monthly.label, annual: PLAN_PRICES.annual.label })} <Link to="/pricing" className="underline hover:text-primary"> {uiText("See pricing")} </Link> {uiText(", or read")} {" "}
        <Link to="/about" className="underline hover:text-primary"> {uiText("about Time-2-Read")} </Link>  {uiText("and who makes it.")} </p>
      <h2 className="font-fun text-lg text-foreground mb-2"> {uiText("Guides for parents and teachers")} </h2>
      <ul className="list-disc pl-6 space-y-1 text-foreground/80">
        {landingPages
          .filter((p) => p.kind === "guide")
          .map((p) => (
            <li key={p.slug}>
              <Link to={`/${p.slug}`} className="underline hover:text-primary">{p.navLabel}</Link>
            </li>
          ))}
      </ul>
    </div>
  </section>
);
