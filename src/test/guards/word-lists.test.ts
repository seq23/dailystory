// Guard (26 Oct 2026): the grade word lists are complete and clean, and every grade has
// a target list for scoring a story (GRADE_WORD_LISTS in src/lib/readingLevelMap.ts).
import { describe, expect, it } from "vitest";
import * as W from "../../../supabase/functions/_shared/wordLists";
import { GRADE_WORD_LISTS, gradeWordShare } from "@/lib/readingLevelMap";
import { GRADES } from "@/lib/grades";
import * as E from "@/constants/educationalWords";

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
  it("the app's copies are the shared ones", () => {
    expect(E.DOLCH_FIRST_GRADE).toBe(W.DOLCH_FIRST_GRADE);
  });
});

describe("every grade has a target word list", () => {
  it("12 grades, each non-empty, no duplicates", () => {
    for (const g of GRADES) {
      expect(GRADE_WORD_LISTS[g].length).toBeGreaterThan(30);
      noDupes(GRADE_WORD_LISTS[g]);
    }
  });
  it("a story can be scored against its grade", () => {
    expect(gradeWordShare("I see the big red ball. Look, it can jump!", "PreK")).toBeGreaterThan(0.5);
  });
});
