// Build-time prerender entry (see vite-plugins/prerenderPlugin.ts). Bundled as an
// SSR module and run under jsdom by scripts/prerender-run.mjs: each public page is
// mounted with the real component, its own SEO effects run (title, description,
// JSON-LD), and the resulting HTML is written to dist/<path>/index.html.
// Logged-in and app routes are deliberately absent.
import "@/i18n/config";
import type { ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HomeIntro } from "@/components/HomeIntro";
import { ReadingCollectionsLinks } from "@/components/ReadingCollectionsLinks";
import { landingPages } from "@/data/landingPages";
import LandingPage from "@/pages/LandingPage";
import Pricing from "@/pages/Pricing";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import CCPA from "@/pages/CCPA";
import Accessibility from "@/pages/Accessibility";
import Vendors from "@/pages/Vendors";
import GDPR from "@/pages/GDPR";
import FERPA from "@/pages/FERPA";
import DataTransfers from "@/pages/DataTransfers";
import Subprocessors from "@/pages/Subprocessors";
import About from "@/pages/About";
import { SiteFooterNav } from "@/components/SiteFooterNav";
export { pageGraph, ORGANIZATION, WEBSITE, OG_IMAGE_URL } from "@/seo/schema";

const HOME_TITLE = "Time-2-Read - Interactive Reading Adventures for Kids";

export const prerenderRoutes: { path: string; element: ReactElement }[] = [
  // The homepage app (AuthWrapper) needs a live session; its static twin is the
  // same HomeIntro + collection links that Index renders beneath the app.
  { path: "/", element: <div className="homepage"><HomeIntro /><ReadingCollectionsLinks /><SiteFooterNav /></div> },
  { path: "/pricing", element: <Pricing /> },
  { path: "/privacy", element: <Privacy /> },
  { path: "/terms", element: <Terms /> },
  { path: "/ccpa", element: <CCPA /> },
  { path: "/accessibility", element: <Accessibility /> },
  { path: "/vendors", element: <Vendors /> },
  { path: "/gdpr", element: <GDPR /> },
  { path: "/ferpa", element: <FERPA /> },
  { path: "/data-transfers", element: <DataTransfers /> },
  { path: "/subprocessors", element: <Subprocessors /> },
  { path: "/about", element: <About /> },
  ...landingPages.map((p) => ({ path: `/${p.slug}`, element: <LandingPage slug={p.slug} /> })),
];

/** Mount one route into document #root (jsdom), let effects run, return the markup. */
export interface RenderedRoute {
  html: string;
  title: string;
  description: string;
  /** JSON-LD the page's own effects added to <head> (shell JSON-LD excluded). */
  jsonLd: string[];
}

export async function renderRoute(path: string): Promise<RenderedRoute> {
  const route = prerenderRoutes.find((r) => r.path === path);
  if (!route) throw new Error(`PRERENDER_UNKNOWN_ROUTE ${path}`);
  if (path === "/") document.title = HOME_TITLE;
  const container = document.getElementById("root");
  if (!container) throw new Error("PRERENDER_NO_ROOT");
  const root = createRoot(container);
  flushSync(() => {
    root.render(
      <TooltipProvider>
        <MemoryRouter initialEntries={[path]}>{route.element}</MemoryRouter>
      </TooltipProvider>,
    );
  });
  await new Promise((r) => setTimeout(r, 30));
  const html = container.innerHTML;
  const title = document.title;
  const description = document.head.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
  const jsonLd = [...document.head.querySelectorAll('script[type="application/ld+json"][id]')].map((s) => s.textContent ?? "");
  root.unmount(); // effect cleanups restore the shell head for the next route
  return { html, title, description, jsonLd };
}
