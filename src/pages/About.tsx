import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooterNav } from "@/components/SiteFooterNav";
import { FREE_STORY_LIMIT, PLAN_PRICES, TRIAL_DAYS } from "@/lib/freeStoryAllowance";
import { SITE_URL } from "@/config/site";

export const ABOUT_TITLE = "About Time-2-Read: Personalized Reading Stories for Kids";
export const ABOUT_DESCRIPTION =
  "Who makes Time-2-Read, what it does and how it works: personalized illustrated stories with your child as the hero, read-aloud help and a reading timer.";

/** Who is behind Time-2-Read and what it does. Linked from the homepage and the site footer. */
const About = () => {
  useEffect(() => {
    document.title = ABOUT_TITLE;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", ABOUT_DESCRIPTION);
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", `${SITE_URL}/about`);
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-6">About Time-2-Read</h1>
        <section className="space-y-4 text-foreground/80 leading-relaxed">
          <p>
            Time-2-Read makes a new illustrated story for your child every time they read. The story is built around
            them: their name, the things they love and the reading level they are at today. It is made for children
            from about 3 to 15, from pre-readers who listen along to confident readers who want a challenge.
          </p>
          <h2 className="text-xl font-semibold text-foreground pt-2">How it works</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Tell us your child's name, age and interests, and pick a reading level.</li>
            <li>Time-2-Read writes a story with your child as the main character, with a picture on every page.</li>
            <li>Tap any word to hear it, with phonics help for sounding out tricky words.</li>
            <li>Narration reads the story aloud and highlights each word as it is spoken.</li>
            <li>A 20-minute reading timer is built into every story.</li>
          </ul>
          <p>Stories are written in English.</p>
          <h2 className="text-xl font-semibold text-foreground pt-2">What it costs</h2>
          <p>
            Your first {FREE_STORY_LIMIT} stories are free, with no card. Premium is {PLAN_PRICES.monthly.label}
            {PLAN_PRICES.monthly.period} or {PLAN_PRICES.annual.label}
            {PLAN_PRICES.annual.period}, with a {TRIAL_DAYS}-day free trial.{" "}
            <Link to="/pricing" className="underline hover:text-primary">See pricing</Link>.
          </p>
          <h2 className="text-xl font-semibold text-foreground pt-2">Who makes it</h2>
          <p>
            Time-2-Read is built and run by Spry VSL LLC. We take children's privacy seriously: read our{" "}
            <Link to="/privacy" className="underline hover:text-primary">privacy policy</Link>, our{" "}
            <Link to="/ferpa" className="underline hover:text-primary">FERPA notes for schools</Link> and our{" "}
            <Link to="/accessibility" className="underline hover:text-primary">accessibility statement</Link>.
          </p>
          <p>
            Questions, ideas or a problem to report: write to{" "}
            <a href="mailto:privacy@time-2-read.com" className="underline hover:text-primary">privacy@time-2-read.com</a>.
          </p>
        </section>
      </div>
      <SiteFooterNav />
    </main>
  );
};

export default About;
