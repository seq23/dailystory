// Guard (26–27 Oct 2026): the grade word lists are complete and clean, live in ONE file
// (supabase/functions/_shared/wordLists.ts) that the app and the edge functions both
// import, map to grades as docs/reading-levels.md says, and every grade has a target list
// for scoring a story. The soft grade-word rule rewrites a weak page once and never fails.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import * as W from "../../../supabase/functions/_shared/wordLists";
import * as GW from "../../../supabase/functions/_shared/gradeWords";
import { applyGradeWordRule } from "../../../supabase/functions/_shared/gradeWordRule";
import { gradeWordShareRow } from "../../../supabase/functions/_shared/gradeWordShareLog";
import { GRADE_WORD_LISTS, gradeWordShare } from "@/lib/readingLevelMap";
import { GRADES, type Grade } from "@/lib/grades";
import * as E from "@/constants/educationalWords";

const ROOT = join(__dirname, "../../..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const noDupes = (l: readonly string[]) => expect(new Set(l.map((w) => w.toLowerCase())).size).toBe(l.length);

describe("Dolch and Fry", () => {
  it("Dolch: 40 + 52 + 41 + 46 + 41 = 220 service words, 95 nouns, no duplicates", () => {
    expect([W.DOLCH_PRE_PRIMER.length, W.DOLCH_PRIMER.length, W.DOLCH_FIRST_GRADE.length, W.DOLCH_SECOND_GRADE.length, W.DOLCH_THIRD_GRADE.length]).toEqual([40, 52, 41, 46, 41]);
    expect(W.DOLCH_SERVICE_WORDS).toHaveLength(220);
    noDupes(W.DOLCH_SERVICE_WORDS);
    expect(W.DOLCH_NOUNS).toHaveLength(95);
    noDupes(W.DOLCH_NOUNS);
    expect(W.DOLCH_FIRST_GRADE).toContain("then"); // the old copies lacked it
  });
  it("Fry 1st and 2nd hundred: 100 each, in order, no overlap", () => {
    expect(W.FRY_1ST_100).toHaveLength(100);
    expect(W.FRY_2ND_100).toHaveLength(100);
    noDupes([...W.FRY_1ST_100, ...W.FRY_2ND_100]);
    expect(W.FRY_1ST_100.slice(0, 5)).toEqual(["the", "of", "and", "a", "to"]);
  });
  it("Fry 1,000: ten hundreds of 100, 1,000 unique, the verified positions", () => {
    expect(W.FRY_HUNDREDS).toHaveLength(10);
    for (const h of W.FRY_HUNDREDS) expect(h).toHaveLength(100);
    noDupes(W.FRY_HUNDREDS.flat());
    expect(W.FRY_1ST_100).toBe(W.FRY_HUNDREDS[0]);
    expect(W.FRY_2ND_100).toBe(W.FRY_HUNDREDS[1]);
    const at = (n: number) => W.FRY_HUNDREDS[Math.floor((n - 1) / 100)]![(n - 1) % 100];
    // Positions settled in the provenance notes (docs/reading-levels.md).
    expect([at(88), at(89), at(118), at(142), at(148), at(240), at(482), at(545), at(579), at(719), at(980)])
      .toEqual(["am", "its", "things", "following", "form", "beginning", "bread", "sit", "glass", "grass", "hoe"]);
    expect(at(1000)).toBeTruthy();
  });
  it("Academic Word List: 9 × 60 + 30 = 570 headwords, unique, the settled headwords", () => {
    expect(W.AWL_SUBLISTS.map((s) => s.length)).toEqual([60, 60, 60, 60, 60, 60, 60, 60, 60, 30]);
    noDupes(W.AWL_SUBLISTS.flat());
    expect(W.AWL_SUBLISTS[0]!.slice(0, 4)).toEqual(["analyse", "approach", "area", "assess"]);
    expect(W.AWL_SUBLISTS[6]).toContain("confirm");
    expect(W.AWL_SUBLISTS.flat()).not.toContain("reliability");
    expect(W.AWL_SUBLISTS[1]).toContain("administrate");
    expect(W.AWL_SUBLISTS.flat()).toContain("so-called");
  });
  it("the app's copies are the shared ones", () => {
    expect(E.DOLCH_FIRST_GRADE).toBe(W.DOLCH_FIRST_GRADE);
    expect(E.FRY_1ST_100).toBe(W.FRY_1ST_100);
    expect(GRADE_WORD_LISTS).toBe(GW.GRADE_WORD_LISTS);
    expect(gradeWordShare).toBe(GW.gradeWordShare);
  });
});

describe("one copy of each list", () => {
  function files(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) return ["node_modules", "_vendor", "test", "__tests__"].includes(name) ? [] : files(full);
      return /\.(ts|tsx|js|mjs|json)$/.test(name) ? [full] : [];
    });
  }
  const all = [...files(join(ROOT, "src")), ...files(join(ROOT, "supabase/functions")), ...files(join(ROOT, "scripts")), ...files(join(ROOT, "config"))];
  // A run of five list words in order, in any quoting: a second copy of the list.
  const run = (ws: readonly string[]) => new RegExp(ws.map((w) => `["'\` ]${w}["'\` ,]`).join("[\\s\\S]{0,12}"));
  const RUNS: Array<[string, RegExp]> = [
    ["Fry 3rd hundred", run(W.FRY_HUNDREDS[2]!.slice(0, 5))],
    ["Fry 6th hundred", run(W.FRY_HUNDREDS[5]!.slice(1, 6))],
    ["Fry 10th hundred", run(W.FRY_HUNDREDS[9]!.slice(0, 5))],
    ["AWL sublist 1", run(W.AWL_SUBLISTS[0]!.slice(0, 5))],
    ["AWL sublist 10", run(W.AWL_SUBLISTS[9]!.slice(0, 5))],
  ];
  it("scans a real tree", () => expect(all.length).toBeGreaterThan(300));
  it("no file but wordLists.ts holds Fry 300–1000 or the AWL", () => {
    const offenders = all.filter((f) => !f.endsWith("_shared/wordLists.ts")).flatMap((f) => {
      const src = readFileSync(f, "utf8");
      return RUNS.filter(([, re]) => re.test(src)).map(([what]) => `${relative(ROOT, f)}: ${what}`);
    });
    expect(offenders).toEqual([]);
    // The pattern does find the real copy (so the scan is not inert).
    const real = read("supabase/functions/_shared/wordLists.ts");
    for (const [what, re] of RUNS) expect(re.test(real), what).toBe(true);
  });
  it("the old hand-written level sets in StaticDataCache are gone", () => {
    for (const f of ["src/services/StaticDataCache.ts", "supabase/functions/generate-adaptive-story/StaticDataCache.ts"]) {
      expect(read(f)).not.toMatch(/getVocabularyByLevel|getVocabularyCache/);
    }
  });
});

describe("grades map to lists as the doc says", () => {
  const doc = read("docs/reading-levels.md");
  const rows = (doc.match(/<!-- grade-lists:start -->([\s\S]*?)<!-- grade-lists:end -->/)?.[1] ?? "")
    .split("\n").filter((l) => /^\|/.test(l) && !/^\|\s*-/.test(l)).slice(1).map((l) => l.split("|").slice(1, -1).map((c) => c.trim()));
  const j = (a: readonly unknown[]) => (a.length ? a.join(", ") : "—");

  it("the doc table equals the module, cell for cell", () => {
    expect(rows).toEqual(GRADES.map((g) => {
      const m = GW.GRADE_LIST_MAP[g];
      return [g, j(m.dolch), j(m.fryHundreds), j(m.awlSublists), String(GW.GRADE_NEW_WORDS[g].length), String(GW.GRADE_WORD_LISTS[g].length), String(GW.GRADE_WORD_SHARE_FLOOR[g])];
    }));
  });
  it("every Fry hundred goes to exactly one of K–5, every AWL sublist to exactly one of 6th–10th", () => {
    const fry = GRADES.flatMap((g) => GW.GRADE_LIST_MAP[g].fryHundreds.map((h) => [g, h] as const));
    expect(fry.map(([, h]) => h)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect([...new Set(fry.map(([g]) => g))]).toEqual(["K", "1", "2", "3", "4", "5"]);
    const awl = GRADES.flatMap((g) => GW.GRADE_LIST_MAP[g].awlSublists.map((s) => [g, s] as const));
    expect(awl.map(([, s]) => s)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect([...new Set(awl.map(([g]) => g))]).toEqual(["6", "7", "8", "9", "10"]);
  });
  it("the doc carries the provenance note and the mapping", () => {
    expect(doc).toMatch(/### Where the word lists come from/);
    expect(doc).toMatch(/#482 = bread\s+rests on one source/);
    expect(doc).toMatch(/1–2 → 6th, 3–4 → 7th, 5–6 → 8th, 7–8 → 9th, 9–10 → 10th/);
    expect(doc).toMatch(/1st hundred → K, 2nd →\s+1st, 3rd → 2nd\), then 4th–5th hundreds → 3rd, 6th–7th → 4th, 8th–10th → 5th/);
  });
});

describe("every grade has a target word list", () => {
  it("12 grades, each non-empty, no duplicates, each grade knows every word of the grade before", () => {
    for (const [i, g] of GRADES.entries()) {
      expect(GRADE_WORD_LISTS[g].length).toBeGreaterThan(30);
      noDupes(GRADE_WORD_LISTS[g]);
      if (i > 0) {
        const now = new Set(GRADE_WORD_LISTS[g]);
        expect(GRADE_WORD_LISTS[GRADES[i - 1]!].every((w) => now.has(w)), g).toBe(true);
        expect(GRADE_WORD_LISTS[g].length).toBeGreaterThan(GRADE_WORD_LISTS[GRADES[i - 1]!].length);
      }
    }
    // The verified lists reach their grades: Fry's 10th hundred at 5th, AWL sublist 10 at 10th.
    expect(GW.GRADE_NEW_WORDS["5"]).toContain(W.FRY_HUNDREDS[9]![0]!.toLowerCase());
    expect(GW.GRADE_NEW_WORDS["10"]).toContain(W.AWL_SUBLISTS[9]![0]);
    expect(GW.GRADE_WORD_LISTS["9"]).not.toContain(W.AWL_SUBLISTS[9]![0]);
  });
  it("a story can be scored against its grade; inflections and names are handled", () => {
    expect(gradeWordShare("I see the big red ball. Look, it can jump!", "PreK")).toBeGreaterThan(0.5);
    expect(GW.onGradeList("jumped", "PreK")).toBe(true);
    expect(GW.onGradeList("analysed", "6")).toBe(true);
    expect(GW.onGradeList("analysed", "5")).toBe(false);
    expect(GW.judgedWords("Then Mia saw {childName} and Zed.")).toEqual(["then", "saw", "and"]);
  });
  it("well-levelled pages pass their floor; pages written far above the reader fail it", () => {
    const pass: Array<[Grade, string]> = [
      ["PreK", "Mia can see a big red ball. The ball can jump. Mia and the dog run and play."],
      ["K", "Sam had a new hat. He went out to play with his friend. They ran to the big tree and sat down."],
      ["2", "Leo found an old map in the attic. It showed a path to a hidden garden behind the school. He wanted to go right away, so he asked his sister to come along."],
      ["4", "The storm rolled in faster than anyone expected. Nia grabbed her jacket and ran toward the barn, where the horses were stamping and calling. She opened the heavy door and led them inside one by one."],
      ["9", "The fog curled around the lighthouse like a living thing. Theo climbed the spiral stairs, his flashlight trembling, each step groaning beneath his sneakers. At the top, the old lamp was cold, its glass cracked, and someone had scratched a single word into the brass: Remember."],
      ["10", "The debate over the new policy divided the town almost evenly. Supporters argued that the regulations would protect the environment and create a framework for sustainable growth, while critics insisted the costs would fall hardest on small businesses that could least afford them."],
    ];
    const fail: Array<[Grade, string]> = [
      ["PreK", "The magnificent dragon soared gracefully above the shimmering emerald valley."],
      ["2", "Leo discovered an ancient parchment depicting an elaborate labyrinth concealed beneath the abandoned observatory, illuminated by flickering lanterns."],
      ["10", "Ineffable melancholy suffused the crepuscular promenade; Maya's peregrinations, desultory and quixotic, belied an inchoate yearning for transcendence amid the ossified rituals of provincial gentility."],
    ];
    for (const [g, t] of pass) expect(gradeWordShare(t, g), `${g} pass`).toBeGreaterThanOrEqual(GW.GRADE_WORD_SHARE_FLOOR[g]);
    for (const [g, t] of fail) expect(gradeWordShare(t, g), `${g} fail`).toBeLessThan(GW.GRADE_WORD_SHARE_FLOOR[g]);
  });
  it("the prompt words are the grade's own words, and rotate with the seed", () => {
    for (const g of GRADES) {
      const ws = GW.gradePromptWords(g, 7, 15);
      expect(ws.length).toBe(Math.min(15, GW.GRADE_NEW_WORDS[g].length));
      for (const w of ws) expect(GW.GRADE_NEW_WORDS[g]).toContain(w);
    }
    expect(GW.gradePromptWords("7", 1)).not.toEqual(GW.gradePromptWords("7", 2));
    expect(GW.readsAtGradeOf({ gradeLevel: "4" })).toBe("4");
    expect(GW.readsAtGradeOf({ readingGrade: "K", gradeLevel: "3" })).toBe("K");
    expect(GW.readsAtGradeOf({}, "8th")).toBe("8");
    expect(GW.readsAtGradeOf({}, undefined, "medium")).toBe("3");
  });
});

describe("the soft grade-word rule", () => {
  const HARD = "Leo discovered an ancient parchment depicting an elaborate labyrinth concealed beneath the abandoned observatory.";
  const EASY = "Leo found an old map. It showed a path to a hidden garden. He wanted to go right away.";
  const OK = "Mia found a big red ball in the park. She ran to show her mom and they played all day.";

  it("a page below the floor is rewritten exactly once, and the better version is kept", async () => {
    const calls: string[] = [];
    const out = await applyGradeWordRule(`${OK}\n\n***\n\n${HARD}`, "2", async (page) => { calls.push(page); return EASY; });
    expect(calls).toEqual([HARD]);
    expect(out.text).toBe(`${OK}\n\n***\n\n${EASY}`);
    expect(out.report.pages.map((p) => [p.below, p.rewritten, p.kept])).toEqual([[false, false, "original"], [true, true, "rewrite"]]);
    expect(out.report.minShare).toBeGreaterThanOrEqual(out.report.floor);
  });
  it("a rewrite that scores no better, is empty, or throws keeps the page; the rule never throws", async () => {
    for (const rewrite of [async () => HARD, async () => "", async () => null, async () => { throw new Error("provider down"); }]) {
      const out = await applyGradeWordRule(HARD, "2", rewrite);
      expect(out.text).toBe(HARD);
      expect(out.report.pages[0]).toMatchObject({ below: true, rewritten: true, kept: "original" });
    }
  });
  it("a page at its level is left alone, byte for byte, with no rewrite call", async () => {
    let called = 0;
    const text = `${OK}\n***\n${EASY}`;
    const out = await applyGradeWordRule(text, "2", async () => { called++; return ""; });
    expect(called).toBe(0);
    expect(out.text).toBe(text);
  });
  it("the logged row carries the numbers and no story text", async () => {
    const out = await applyGradeWordRule(HARD, "2", async () => EASY);
    const row = gradeWordShareRow(out.report, "s1", 3);
    expect(row).toMatchObject({ reads_at: "2", rewritten: true, session_id: "s1", page_number: 3 });
    expect(JSON.stringify(row)).not.toMatch(/Leo|parchment/);
  });
  it("the story handler runs the rule after generation, logs it, and feeds grade words into the prompt", () => {
    const h = read("supabase/functions/generate-adaptive-story/streamlined-handler.ts");
    const gen = h.indexOf("let storyText = await generateWithOpenAI(aiPrompt");
    const rule = h.indexOf("await applyGradeWordRule(storyText, readsAt");
    const validate = h.indexOf("UnifiedValidator.validateContent(storyText");
    expect(gen).toBeGreaterThan(0);
    expect(rule).toBeGreaterThan(gen);
    expect(validate).toBeGreaterThan(rule);
    expect(h).toMatch(/void logGradeWordShare\(ruled\.report/);
    expect(h).toMatch(/gradeWordShare: gradeWordReport/);
    // The rule sits in a try: a failure there never reaches the Backup Mode error path.
    expect(h.slice(rule - 400, rule)).toMatch(/try \{/);
    expect(h).toMatch(/const systemVocabulary = readsAt \? gradePromptWords\(readsAt, seed, 15\) : \[\];/);
    expect(h).toMatch(/preprocessVocabularyFromCache\(enhancedUserPrompt, readsAtGradeOf\(userInfo/);
    const sql = read("supabase/migrations/20261027090000_grade_word_shares.sql");
    expect(sql).toMatch(/create table if not exists public\.story_grade_word_shares/);
    expect(sql).toMatch(/enable row level security/);
  });
});
