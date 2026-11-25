// Search Readiness q1, 24 Nov 2026 (brief so-time-2-read.com-quality): the weekly page-quality
// sample found /books-for-toddlers and /books-for-4-year-olds "more than half identical" (Jaccard
// 0.506 of 5-word shingles over <main>) and /gdpr with eight H2 headings and not one a question.
// The collection pages were built from one template whose only page-specific slots were a hero
// line, two intro sentences and three short benefits, so the shared FAQ, CTA and cross-link lists
// outweighed what each page said. Every collection page now carries its own question-headed
// sections; this guard renders each one the way the prerender does and fails if any two are as
// alike as the sample's threshold, or if a page loses its question headings.
import React from "react";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import LandingPage from "@/pages/LandingPage";
import GDPR from "@/pages/GDPR";
import { landingPages } from "@/data/landingPages";

afterEach(cleanup);

// The same measure as Boss OS page-quality-sample.mjs: lower-cased words, 5-word shingles, Jaccard.
const words = (t: string) => t.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{M}\p{N}_'’-]*/gu) ?? [];
const shingles = (t: string) => {
  const w = words(t), s = new Set<string>();
  for (let i = 0; i + 5 <= w.length; i++) s.add(w.slice(i, i + 5).join(" "));
  return s;
};
const jaccard = (a: Set<string>, b: Set<string>) => {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
};
// The sample fails a pair above 0.5; the guard holds a margin so a small template edit cannot tip it.
const MAX_SIMILARITY = 0.4;
const QUESTION = /[?？]\s*$|^(what|how|why|when|where|who|which|is|are|can|does|do|should|will|was|were)\b/i;

const renderMain = (el: React.ReactElement) => {
  const { container } = render(<MemoryRouter>{el}</MemoryRouter>);
  const main = container.querySelector("main");
  const text = main?.textContent ?? "";
  const h2s = [...(main?.querySelectorAll("h2") ?? [])].map((h) => (h.textContent ?? "").trim());
  cleanup();
  return { text, h2s };
};

const collections = landingPages.filter((p) => p.kind !== "guide");

describe("collection pages are not template filler", () => {
  it("every collection page has its own question-headed sections", () => {
    for (const p of collections) {
      expect(p.sections?.length ?? 0, `${p.slug} has no sections of its own`).toBeGreaterThan(0);
      expect(p.sections!.some((s) => QUESTION.test(s.heading)), `${p.slug} has no question heading`).toBe(true);
    }
  });

  it(`no two rendered collection pages are more than ${MAX_SIMILARITY} alike`, () => {
    const pages = collections.map((p) => ({ slug: p.slug, sh: shingles(renderMain(<LandingPage slug={p.slug} />).text) }));
    const twins: string[] = [];
    for (let i = 0; i < pages.length; i++)
      for (let j = i + 1; j < pages.length; j++) {
        const s = jaccard(pages[i].sh, pages[j].sh);
        if (s > MAX_SIMILARITY) twins.push(`${pages[i].slug} ~ ${pages[j].slug}: ${s.toFixed(3)}`);
      }
    expect(twins).toEqual([]);
  });
});

describe("/gdpr headings", () => {
  it("phrases its H2 headings as questions", () => {
    const { h2s } = renderMain(<GDPR />);
    expect(h2s.length).toBeGreaterThan(1);
    expect(h2s.filter((h) => !QUESTION.test(h))).toEqual([]);
  });
});
