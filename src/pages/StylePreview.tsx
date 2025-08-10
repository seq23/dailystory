import React, { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image-diverse-clear.jpg";
import leftPageImage from "@/assets/story-illustration-14.jpg";
import { Check } from "lucide-react";
import ReadAloudCoach from "@/components/ReadAloudCoach";
import VoiceCommandController from "@/components/VoiceCommandController";

const sampleText = `Luna and Max found a hidden door in the library. When they pushed it open, a tiny breeze carried the scent of pine trees and warm cookies. “Ready?” Max whispered. Luna nodded, and together they stepped into a world of stories.`;

const StylePreview: React.FC = () => {
  useEffect(() => {
    document.title = "Reader Style Preview | Time2Read";
    const desc = "Preview Classic Storybook, Modern Card, and Hardcover Spread styles for the reader.";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/style-preview`);
  }, []);

  return (
    <div className="min-h-screen px-4 py-10 sm:py-12 md:py-16">
      <header className="max-w-5xl mx-auto mb-8 text-center animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Reader style preview</h1>
        <p className="text-muted-foreground">Three quick options to try. This is a visual demo only.</p>
      </header>

      <main className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Free Trial Desktop (Exact) */}
        <article className="md:col-span-2 xl:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Free Trial Desktop (Exact)</CardTitle>
              <CardDescription>Image left (full-cover), story right (compact). Centered navigation below.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="relative rounded-2xl shadow-sm overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    <aside
                      aria-label="Story image"
                      className="min-h-[280px] lg:min-h-[420px] max-h-[420px] overflow-hidden"
                    >
                      <img
                        src={heroImage}
                        alt="Full-cover story image — free trial desktop exact reference"
                        loading="lazy"
                        width={800}
                        height={600}
                        className="w-full h-full object-cover"
                      />
                    </aside>
                    <section
                      aria-label="Story text window"
                      className="min-h-[280px] lg:min-h-[420px] max-h-[420px] bg-card"
                    >
                      <div className="h-full overflow-y-auto p-3 md:p-4">
                        <div className="story-content story-content--compact" data-difficulty="easy">
                          {sampleText}
                        </div>
                      </div>
                    </section>
                  </div>
                </div>

                <nav aria-label="Story navigation" className="flex items-center justify-center gap-3">
                  <Button variant="secondary" size="sm" aria-label="Previous page" disabled>
                    Prev
                  </Button>
                  <div className="text-sm text-muted-foreground" aria-live="polite">1 / 10</div>
                  <Button variant="default" size="sm" aria-label="Next page">
                    Next
                  </Button>
                </nav>
              </div>
            </CardContent>
          </Card>
        </article>
        {/* Classic Storybook Page */}
        <article>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Classic Storybook Page (Fallback)</CardTitle>
              <CardDescription>Text-first layout; used on slower devices.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="storybook-frame">
                <div className="story-content" data-difficulty="easy">
                  {sampleText}
                </div>
              </div>
            </CardContent>
          </Card>
        </article>

        {/* Modern Story Card (image-forward) */}
        <article>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Modern Story Card (Recommended)</CardTitle>
              <CardDescription>Kid-friendly, mobile-first layout.</CardDescription>
            </CardHeader>
            <CardContent>
              <figure className="modern-photo-card overflow-hidden">
                <img
                  src={heroImage}
                  alt="Kids enjoying a book together – modern story card preview"
                  loading="lazy"
                  width={600}
                  height={400}
                  className="w-full h-48 object-cover"
                />
                <figcaption className="p-4 text-sm text-muted-foreground">
                  Use for image-forward layouts; pair with text to the side in the reader.
                </figcaption>
              </figure>
            </CardContent>
          </Card>
        </article>

        {/* Hardcover Spread (inset page + spine) */}
        <article className="md:col-span-2 xl:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Hardcover Spread</CardTitle>
              <CardDescription>Experimental two-page spread; desktop only.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="hardcover-spread hardcover--vintage-pages">
                <div className="spread-pages">
                  <div className="left-page">
                    <figure className="page-figure">
                      <img
                        src={leftPageImage}
                        alt="Vintage story illustration on the left page of the hardcover spread"
                        loading="lazy"
                        width={600}
                        height={400}
                        className="page-image"
                      />
                    </figure>
                  </div>
                  <div className="right-page">
                    <div className="story-content" data-difficulty="easy">
                      {sampleText}
                    </div>
                  </div>
                </div>
                <div className="page-stack page-stack--left" aria-hidden="true" />
                <div className="page-stack page-stack--right" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>
        </article>
      </main>

      {/* Free vs Premium (Preview) */}
      <section className="max-w-5xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Free vs Premium (Preview)</CardTitle>
            <CardDescription>Exact wording and ordering as requested</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <article>
                
                <ul className="space-y-2 text-sm">
{[
  "Limited customization of your story via User Info Form",
  "Free 20-minute reading sessions with images",
  "Text-to-speech suite: Hear it, Explain it, phonetic breakdown, and precise word-by-word highlighting",
  "Limited audio narration",
  "In-session achievements, points, badges, and reading streaks",
  "End-of-session report with milestones",
].map((f) => (
  <li key={f} className="flex items-start gap-2">
    <Check className="w-4 h-4 text-[hsl(var(--green))] mt-1" />
    <span>{f}</span>
  </li>
))}
                </ul>
              </article>

              <article className="space-y-4">
                <div>
                  
                  <ul className="space-y-2 text-sm">
{[
  "Customize your story",
  "Unlimited reading time",
  "Text-to-speech suite: Hear it, Explain it, phonetic breakdown, and precise word-by-word highlighting",
  "Advanced audio narration",
  "Achievements, points, badges, and reading streaks",
  "End-of-session report with milestones",
].map((f) => (
  <li key={f} className="flex items-start gap-2">
    <Check className="w-4 h-4 text-[hsl(var(--green))] mt-1" />
    <span>{f}</span>
  </li>
))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Additional offerings</h4>
                  <ul className="mt-2 space-y-2 text-sm">
{[
  "Personalized live story generation (Your story doesn't end until you decide!)",
  "Saved stories, favorites, and collections",
  "Multiple child profiles",
  "Parent dashboard with insights and analytics",
  "Learning goals with weekly targets",
  "Vocabulary tracking and practice quizzes",
  "Comprehension questions after reading",
  "Mini-games to reinforce vocabulary and phonics",
  "Reading timer and progress tracking",
  "Personalized difficulty adjustments as your child improves",
  "Vocabulary word bank and review activities",
  "Curated story library and recommendations",
  "Mobile-optimized audio controls and kid-friendly UI",
  "Voice commands for navigation and controls",
  "Read-aloud feedback (speech-to-text coaching)",
  "Priority support",
].map((f) => (
  <li key={f} className="flex items-start gap-2">
    <Check className="w-4 h-4 text-[hsl(var(--green))] mt-1" />
    <span>{f}</span>
  </li>
))}
                  </ul>
                </div>
              </article>
            </div>

            {/* Premium-only interactive preview */}
            <div className="grid gap-4 md:grid-cols-2 mt-6">
              <div>
                <Card className="border-muted/50">
                  <CardHeader>
                    <CardTitle className="text-base">Read‑aloud coach (Premium)</CardTitle>
                    <CardDescription>Speech‑to‑text feedback preview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* @ts-ignore demo import below */}
                    <ReadAloudCoach />
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="border-muted/50">
                  <CardHeader>
                    <CardTitle className="text-base">Voice commands (Premium)</CardTitle>
                    <CardDescription>Try a command like “Next page”</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* @ts-ignore demo import below */}
                    <VoiceCommandController />
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="max-w-5xl mx-auto mt-8 flex items-center justify-between">
        <a href="/" className="story-link text-sm">Back to home</a>
        <Button asChild variant="secondary" size="sm">
          <a href="/">Looks good</a>
        </Button>
      </footer>
    </div>
  );
};

export default StylePreview;
