import React, { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image-diverse-clear.jpg";
import leftPageImage from "@/assets/story-illustration-14.jpg";
import { Check, RefreshCcw, Wand2, Sparkles } from "lucide-react";
import ReadAloudCoach from "@/components/ReadAloudCoach";
import { UnifiedVoiceCommands } from "@/components/UnifiedVoiceCommands";
import { freeFeatures, premiumFeatures, additionalOfferings } from "@/constants/featureLists";
import MagicRefreshIcon from "@/components/icons/MagicRefreshIcon";
const sampleText = `Luna and Max found a hidden door in the library. When they pushed it open, a tiny breeze carried the scent of pine trees and warm cookies. “Ready?” Max whispered. Luna nodded, and together they stepped into a world of stories.`;

const sampleSavedStory = {
  id: "demo-1",
  title: "Luna’s Adventure Story #3",
  difficulty: "medium",
  estimatedReadingTime: 6,
  wordCount: 430,
  content: {
    id: "demo-1",
    title: "Luna’s Adventure Story #3",
    difficulty: "medium",
    estimatedReadingTime: 6,
    wordCount: 430,
    segments: [
      {
        text:
          "Luna and Max found a hidden door in the library. When they pushed it open, a tiny breeze carried the scent of pine trees and warm cookies. “Ready?” Max whispered. Luna nodded, and together they stepped into a world of stories.",
      },
    ],
  },
  createdAt: new Date(),
};

const getFriendlyDifficultyLabel = (d: string) => {
  switch (d) {
    case "beginner":
      return "Pre‑Reader";
    case "easy":
      return "Beginner";
    case "medium":
      return "Developing";
    case "hard":
      return "Independent";
    case "expert":
      return "Advanced";
    default:
      return d;
  }
};
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

      {/* Magic Wand Button Options */}
      <section className="max-w-5xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Magic Wand Button Options</CardTitle>
            <CardDescription>Pick your favorite style for the New Story action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col items-center gap-3 p-4 border rounded-lg">
                <div className="text-sm font-medium">Option A: Magic Refresh (refined)</div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button variant="default" size="sm" aria-label="A1 Sparkle-safe – start a fresh story" title="A1 Sparkle-safe">
                    <MagicRefreshIcon
                      className="mr-2"
                      size={20}
                      ringScale={0.9}
                      wandScale={0.56}
                      wandRotate={-12}
                      ringRotate={30}
                      sparkleGap
                      sparkleGapPx={3}
                      wandOffset={{ x: 0, y: 0 }}
                    />
                    New Story
                  </Button>
                  <Button variant="secondary" size="sm" aria-label="A2 Compact Wand – start a fresh story" title="A2 Compact Wand">
                    <MagicRefreshIcon className="mr-2" size={20} ringScale={0.94} wandScale={0.5} wandRotate={-15} />
                    New Story
                  </Button>
                  <Button variant="fun" size="sm" aria-label="A3 Duotone – start a fresh story" title="A3 Duotone">
                    <MagicRefreshIcon
                      className="mr-2"
                      size={20}
                      ringScale={0.9}
                      wandScale={0.56}
                      wandRotate={-10}
                      ringClassName="text-[hsl(var(--primary))]"
                      wandClassName="text-[hsl(var(--foreground))]"
                    />
                    New Story
                  </Button>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
                <div className="text-sm font-medium">Option B: Classic Wand</div>
                <Button variant="secondary" size="sm" aria-label="Start a fresh story" title="Start a fresh story">
                  <Wand2 className="w-4 h-4 mr-2" /> New Story
                </Button>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
                <div className="text-sm font-medium">Option C: Refresh + Sparkle</div>
                <Button variant="fun" size="sm" aria-label="Start a fresh story" title="Start a fresh story">
                  <RefreshCcw className="w-4 h-4 mr-2" /> <Sparkles className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Mobile Premium Reading Preview */}
      <section className="max-w-5xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Mobile Premium Reading Preview</CardTitle>
            <CardDescription>Wand icon in header, arrows under content, and 4-button bottom dock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border bg-card overflow-hidden">
              {/* Header with Home + Wand */}
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" aria-label="Home">
                    Home
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" aria-label="Start a fresh story" title="Start a fresh story">
                    {/* Wand icon placeholder */}
                    ✨
                  </Button>
                </div>
              </div>

              {/* Story area */}
              <div className="p-4">
                <div className="h-40 rounded-lg bg-muted flex items-center justify-center text-sm text-muted-foreground">
                  Story content…
                </div>

                {/* Arrows under display */}
                <div className="mt-4 flex items-center justify-center gap-6">
                  <Button variant="outline" size="sm" aria-label="Back">◀</Button>
                  <div className="text-sm text-muted-foreground">1 / 10</div>
                  <Button variant="default" size="sm" aria-label="Next">▶</Button>
                </div>

                {/* Finish Story under arrows (Premium) */}
                <div className="mt-3 flex justify-center">
                  <Button variant="secondary" size="sm">Finish Story</Button>
                </div>

                {/* Simulated bottom dock */}
                <div className="mt-6 rounded-xl border p-3">
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-lg border flex items-center justify-center">🔊</div>
                      <span>Audio</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-lg border flex items-center justify-center">🎤</div>
                      <span>Voice</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-lg border flex items-center justify-center">💾</div>
                      <span>Save</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-lg border flex items-center justify-center">■</div>
                      <span>End</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

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
{freeFeatures.map((f) => (
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
{premiumFeatures.map((f) => (
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
{additionalOfferings.map((f) => (
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

      {/* Saved Story Preview */}
      <section className="max-w-5xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Saved Story Preview</CardTitle>
            <CardDescription>How a saved story looks in two common layouts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Modern Card */}
              <article>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base">Modern Card</CardTitle>
                    <CardDescription>Image-forward with quick metadata</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <figure className="modern-photo-card overflow-hidden">
                      <img
                        src={heroImage}
                        alt="Saved story illustration — modern card layout preview"
                        loading="lazy"
                        width={600}
                        height={400}
                        className="w-full h-40 object-cover"
                      />
                    </figure>
                    <div className="mt-3">
                      <h3 className="font-semibold">{sampleSavedStory.title}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary">
                          {getFriendlyDifficultyLabel(sampleSavedStory.difficulty)}
                        </Badge>
                        <span>• {sampleSavedStory.estimatedReadingTime} min</span>
                        <span>• {sampleSavedStory.wordCount} words</span>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                        {sampleSavedStory.content.segments[0].text}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </article>

              {/* Classic Storybook */}
              <article>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base">Classic Storybook</CardTitle>
                    <CardDescription>Text-first with a simple frame</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="storybook-frame">
                      <div className="mb-2">
                        <h3 className="font-semibold">{sampleSavedStory.title}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary">
                            {getFriendlyDifficultyLabel(sampleSavedStory.difficulty)}
                          </Badge>
                          <span>• {sampleSavedStory.estimatedReadingTime} min</span>
                          <span>• {sampleSavedStory.wordCount} words</span>
                        </div>
                      </div>
                      <div className="story-content" data-difficulty={sampleSavedStory.difficulty}>
                        {sampleSavedStory.content.segments[0].text}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </article>
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
