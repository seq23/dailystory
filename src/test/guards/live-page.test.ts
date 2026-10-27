// Guard: every story page is long enough for the reader's grade, new, and not repeating
// itself (27 Oct 2026). Live, a 2nd-grade premium story showed
//   page 1: "Aiden has a blue shirt. He is going to space. He will see an orbit." (14 words)
//   page 2: the same text again (the model echoed page 1, and page [0] of its answer was shown)
//   ending: "Aiden puts on his blue shirt. He sees a big rocket. … Aiden puts on his blue shirt."
// Code: supabase/functions/_shared/livePage.ts; floors: GRADE_PROFILES.minWordsPerPage.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GRADES, GRADE_PROFILES } from "@/lib/grades";
import {
  backupPageFrom, livePageFromAnswer, livePageProblem, livePageTokenBudget, minWordsForGrade,
  overlapWithPrevious, repeatedSentence, wholeStoryProblem, wordCount, livePageInstruction, capWords, maxKeptWordsForGrade,
} from "../../../supabase/functions/_shared/livePage";
import { midSentenceStart, storyTextProblem } from "../../../supabase/functions/_shared/storyOutputCheck";
import { weaveMissingWords } from "../../../supabase/functions/_shared/practiceWords";

const ROOT = join(__dirname, "..", "..", "..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

const LIVE_PAGE_1 = "Aiden has a blue shirt. He is going to space. He will see an orbit.";
const LIVE_THREE_PAGES = `${LIVE_PAGE_1}\n***\nThe rocket is big and red. Aiden gets in.\n***\nThe rocket goes up fast. Aiden sees the stars.`;
const LIVE_ENDING = "Aiden puts on his blue shirt. He sees a big rocket. The rocket is red and white. Aiden puts on his blue shirt. He waves to Mom and the rocket flies home at last.";
const GOOD_2ND = "The rocket shook as it rose above the clouds. Aiden held on tight and looked out the round window. Far below, the city lights grew tiny. Soon the sky turned black, and the stars came out like sparkles. The ship began to orbit the Earth, slow and steady. Aiden smiled and waved at the blue planet.";

describe("the per-grade floor lives in the one grade map", () => {
  it("every grade has a minimum below its target, and the doc table matches", () => {
    const doc = read("docs/reading-levels.md");
    const block = doc.slice(doc.indexOf("<!-- page-length:start -->"), doc.indexOf("<!-- page-length:end -->"));
    expect(block.length).toBeGreaterThan(50);
    for (const g of GRADES) {
      const p = GRADE_PROFILES[g];
      const low = Number(p.wordsPerPage.match(/^(\d+)/)![1]);
      expect(p.minWordsPerPage, g).toBeGreaterThan(0);
      expect(p.minWordsPerPage, g).toBeLessThanOrEqual(low);
      expect(p.minWordsPerPage, g).toBeGreaterThanOrEqual(Math.floor(low * 0.75));
      expect(block, g).toContain(`| ${g} | ${p.wordsPerPage.replace(" words per page", "")} | ${p.minWordsPerPage} |`);
    }
    expect(minWordsForGrade("2")).toBe(24);
    expect(minWordsForGrade("6")).toBe(160);
  });

  it("the 1st–2nd grade prompt no longer caps pages at 30 words or 60 tokens", () => {
    const prompts = read("supabase/functions/_shared/storyPrompts.ts");
    expect(prompts).not.toMatch(/NO PAGE OVER 30 WORDS/);
    expect(prompts).not.toMatch(/60 tokens per page/);
    expect(prompts).toMatch(/20-50 words per page total: 1st grade about 20-40, 2nd grade about 30-50/);
  });
});

describe("a too-short, repeating or copied live page is rejected (the chain then asks the next model)", () => {
  it("the live 2nd-grade page (3 tiny *** pages, 15 words shown) is too short", () => {
    expect(livePageProblem(LIVE_PAGE_1, "stop", { minWords: minWordsForGrade("2") })).toMatch(/too short \(15 < 24 words\)/);
    // The three tiny pages become ONE page of 30+ words, which passes.
    const one = livePageFromAnswer(LIVE_THREE_PAGES);
    expect(one).not.toMatch(/\*/);
    expect(wordCount(one)).toBeGreaterThanOrEqual(24);
    expect(livePageProblem(LIVE_THREE_PAGES, "stop", { minWords: 24 })).toBeNull();
    expect(livePageProblem(GOOD_2ND, "stop", { minWords: 24 })).toBeNull();
  });

  it("page 2 that echoes page 1 shows only the new text; an answer that is only the echo is rejected", () => {
    const echoThenNew = `${LIVE_PAGE_1}\n***\n${GOOD_2ND}`;
    expect(livePageFromAnswer(echoThenNew, LIVE_PAGE_1)).toBe(GOOD_2ND);
    expect(livePageProblem(echoThenNew, "stop", { minWords: 24, previous: LIVE_PAGE_1 })).toBeNull();
    expect(livePageProblem(LIVE_PAGE_1, "stop", { minWords: 4, previous: LIVE_PAGE_1 })).toBe("repeats the previous page");
    // The model masks the name; a near-copy is still a copy.
    const masked = LIVE_PAGE_1.replace("Aiden", "Sam") + " Sam looks up.";
    expect(overlapWithPrevious(masked, LIVE_PAGE_1)).toBeGreaterThanOrEqual(0.5);
  });

  it("the live ending that says a sentence twice is rejected", () => {
    expect(repeatedSentence(LIVE_ENDING)).toBe("aiden puts on his blue shirt");
    expect(livePageProblem(LIVE_ENDING, "stop", { minWords: 24 })).toMatch(/repeats a sentence/);
  });

  it("a whole guest story must average the floor over the pages it shows", () => {
    const tiny = Array.from({ length: 8 }, () => "Maya can play.").join("\n***\n");
    expect(wholeStoryProblem(tiny, "stop", minWordsForGrade("PreK"))).toMatch(/too short/);
    const ok = Array.from({ length: 8 }, (_, i) => `Maya sees a red ball number ${i}.`).join("\n***\n");
    expect(wholeStoryProblem(ok, "stop", minWordsForGrade("PreK"))).toBeNull();
  });

  it("a live page gets the token room its grade needs (not 60 tokens)", () => {
    expect(livePageTokenBudget("2")).toBeGreaterThanOrEqual(250);
    expect(livePageTokenBudget("6")).toBeGreaterThanOrEqual(800);
    expect(livePageInstruction("2", { ending: true })).toMatch(/never fewer than 24 and never more than 50 words[\s\S]*LAST page/);
  });
});

describe("the story handler applies all of it, on every tier", () => {
  const h = read("supabase/functions/generate-adaptive-story/streamlined-handler.ts");

  it("live pages: instruction, budget, check and one-page answer", () => {
    expect(h).toMatch(/finalSystemPrompt \+= livePageInstruction\(pageGrade, \{ ending: !!config\.isEndingPage \}\);/);
    expect(h).toMatch(/if \(isLivePage\) maxTokens = Math\.max\(maxTokens, livePageTokenBudget\(pageGrade\)\);/);
    expect(h).toMatch(/: livePageProblem\(text, finishReason, \{ minWords, previous: previousPages \}\),/);
    expect(h).toMatch(/if \(isLivePage && storyText\) storyText = capWords\(livePageFromAnswer\(storyText, previousPages\), maxKeptWordsForGrade\(pageGrade\)\);/);
    expect(h).toMatch(/wholeStoryProblem\(finishReason === 'length'/);
    // The grade-word rewrite may not drop a page below the floor.
    expect(h).toMatch(/rewritePageWithProvider\(userInfo, requestDeadline, minWordsForGrade\(readsAt\)\)/);
  });

  it("no cached page is ever served again (the cache key ignored the session and the story)", () => {
    expect(h).not.toMatch(/UniversalLKGCache\.(getLKG|warmFromSuccess|createRequestHash)\(/);
  });

  it("a request with no bundle is a 400, not a crash on bundle.systemSettings.gradeLevel", () => {
    expect(h).toMatch(/errorType: 'bad_request'/);
    expect(h).toMatch(/\(bundle as any\)\.systemSettings = \{ gradeLevel: 2 \};/);
  });

  it("the practice-word weave only adds to an accepted page", () => {
    const woven = weaveMissingWords(GOOD_2ND, ["comet"]);
    expect(wordCount(woven)).toBeGreaterThan(wordCount(GOOD_2ND));
  });
});

describe("Backup Mode meets the floor and never shows the same page twice", () => {
  const TEMPLATE = [
    "Maya finds a map under her bed.", "The map shows a hill with a tree.", "She packs a snack and her red hat.",
    "Her dog Max runs along the path.", "They climb up past a noisy brook.", "A blue bird sings from a branch.",
    "At the top sits an old wooden box.", "Inside the box is a shiny key.", "The key opens a door in the tree.",
    "Behind the door is a tiny library.", "Maya reads a book about the stars.", "Max naps while the sun goes down.",
  ];

  it("joins template pages to the floor, starting at the page number, skipping pages read", () => {
    const p1 = backupPageFrom(TEMPLATE, 1, 24);
    const p2 = backupPageFrom(TEMPLATE, 2, 24, [p1]);
    expect(wordCount(p1)).toBeGreaterThanOrEqual(24);
    expect(wordCount(p2)).toBeGreaterThanOrEqual(24);
    expect(p2).not.toBe(p1);
    expect(overlapWithPrevious(p2, p1)).toBeLessThan(0.5);
  });

  it("every backup path in the live service goes through it, and the ending gets the reader's level", () => {
    const s = read("src/services/LiveGenerationService.ts");
    expect(s).not.toMatch(/pageCount: 1,\s*templateIndex: 0/);
    expect((s.match(/LiveGenerationService\.backupTemplatePage\(/g) || []).length).toBe(4);
    expect(s).toMatch(/backupPageFrom\(data\.pages, pageNumber, minWords, alreadyRead\)/);
    expect(s).toMatch(/isEndingPage: true,\s*\/\/[^\n]*\n\s*difficulty: DifficultyLevelMapper\.toBackend\(context\.difficulty\)/);
  });
});

describe("layout: the New story dialog fits; the timer never covers the sidebar", () => {
  it("the dialog's grid column can shrink, the select truncates, chips wrap, buttons wrap", () => {
    const d = read("src/components/SpecialRequestDialog.tsx");
    // A grid item defaults to min-width:auto, so the long child <select> widened the
    // 512px dialog to 638px; grid-cols-1 is minmax(0,1fr).
    expect(d).toMatch(/<DialogContent className="[^"]*\bgrid-cols-1\b[^"]*\boverflow-x-hidden\b/);
    expect(d).toMatch(/<DialogContent className="[^"]*w-\[calc\(100vw-2rem\)\]/);
    expect(d).toMatch(/id="story-for-child"\s*className="[^"]*\bw-full\b[^"]*\bmin-w-0\b[^"]*\btruncate\b/);
    expect(d).toMatch(/className="flex min-w-0 flex-wrap gap-2" aria-label="Ideas: tap to add"/);
    expect(d).toMatch(/<DialogFooter className="flex-wrap gap-2">/);
    expect(d).toMatch(/className="[^"]*whitespace-normal[^"]*" data-testid="write-story"/);
  });

  it("on desktop the timer sits right of the 16rem sidebar; below 900px the sidebar is a drawer", () => {
    const t = read("src/components/CollapsibleFloatingTimer.tsx");
    const sidebarRem = Number(read("src/components/ui/sidebar.tsx").match(/const SIDEBAR_WIDTH = "(\d+)rem"/)![1]);
    const left = t.match(/"bottom-16 left-\[calc\((\d+)rem\+[\d.]+rem\)\]"/);
    expect(left, "desktop timer position").not.toBeNull();
    expect(Number(left![1])).toBeGreaterThanOrEqual(sidebarRem);
    expect(read("src/components/ui/sidebar.tsx")).toMatch(/return isMobileOrTablet/);
  });
});

describe("a live page is not far over its grade either (live: 281 words for a 2nd grader)", () => {
  it("keeps whole sentences up to 30% over the grade's top", () => {
    const long = Array.from({ length: 30 }, (_, i) => `Sam sees star number ${i} in the sky.`).join(" ");
    const kept = capWords(long, maxKeptWordsForGrade("2"));
    expect(maxKeptWordsForGrade("2")).toBe(65);
    expect(wordCount(kept)).toBeLessThanOrEqual(65);
    expect(wordCount(kept)).toBeGreaterThanOrEqual(minWordsForGrade("2"));
    expect(kept).toMatch(/\.$/);
    const h = read("supabase/functions/generate-adaptive-story/streamlined-handler.ts");
    expect(h).toMatch(/storyText = capWords\(livePageFromAnswer\(storyText, previousPages\), maxKeptWordsForGrade\(pageGrade\)\);/);
    // The guest story is told the grade's page length too.
    expect(h).toMatch(/Each page: \$\{gradeProfile\(storyGrade\)\?\.wordsPerPage/);
  });
});

describe("words read count when the timer ends the session (live: wordsRead 0 with pagesRead 3)", () => {
  it("the timer-end stats read the one counter, not a hard-coded 0", () => {
    const hook = read("src/hooks/useStoryLogic.tsx");
    expect(hook).not.toMatch(/wordsRead: 0, \/\/ This would be calculated elsewhere/);
    expect(hook).toMatch(/wordsRead: read\?\.wordsRead \?\? 0,/);
    const d = read("src/components/CleanStoryDisplay.tsx");
    expect(d).toMatch(/readProgress: \(\) => readProgressRef\.current\(\),/);
    expect(d).toMatch(/readProgressRef\.current = \(\) => pagesReadCount\(displayedStory, shownPages\(\)\);/);
  });
});

// 26 Oct 2026: a 6th-grade page began "and waited…" (the model continued the previous
// page's last sentence). Such a page is rejected so the chain falls through to the next tier.
describe("a page that starts mid-sentence is rejected", () => {
  const SIXTH = "and waited by the old lighthouse while the storm rolled in from the bay. Mara counted the seconds between each flash of lightning and each crash of thunder, the way her grandfather had taught her. The gap grew shorter. She pulled her coat tight and stepped toward the door, knowing that whatever was out there would not wait much longer for her.";
  it("rejects a lowercase start, a continuation mark and a subjectless connector, on every check", () => {
    expect(livePageProblem(SIXTH, "stop", { minWords: 10 })).toMatch(/starts mid-sentence/);
    expect(storyTextProblem(SIXTH, "stop")).toMatch(/starts mid-sentence/);
    expect(midSentenceStart("…and then the door opened.")).toMatch(/mid-sentence/);
    expect(midSentenceStart(", said the fox.")).toMatch(/mid-sentence/);
    expect(midSentenceStart("And waited by the door until dawn.")).toMatch(/connector fragment/);
    expect(midSentenceStart("Then running, she reached the gate.")).toMatch(/connector fragment/);
  });
  it("keeps real starts: capitals, dialogue quotes, a connector with a subject, a number", () => {
    for (const ok of [
      "Mara waited by the old lighthouse.",
      "\u201cWait for me!\u201d Mara called.",
      "\"and then?\" asked Leo.",
      "'Look,' said Kiki.",
      "But Kiki was brave.",
      "And then the sun came up.",
      "So the fox ran home.",
      "3 ducks swam by.",
      "***\nMara waited.",
    ]) expect(midSentenceStart(ok), ok).toBeNull();
    expect(livePageProblem(GOOD_2ND, "stop", { minWords: 24 })).toBeNull();
    expect(livePageProblem("\u201cLook up!\u201d " + GOOD_2ND, "stop", { minWords: 24 })).toBeNull();
  });
});
