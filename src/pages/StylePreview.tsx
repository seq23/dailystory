import React, { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image-diverse-clear.jpg";

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
        {/* Classic Storybook Page */}
        <article>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Classic Storybook Page</CardTitle>
              <CardDescription>Framed page with soft border and comfy reading size.</CardDescription>
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
              <CardTitle>Modern Story Card</CardTitle>
              <CardDescription>Polished image card with stronger shadow.</CardDescription>
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
              <CardDescription>Outer border, subtle center spine, inset page.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="hardcover-spread">
                <div className="page-inset">
                  <div className="story-content" data-difficulty="easy">
                    {sampleText}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </article>
      </main>

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
