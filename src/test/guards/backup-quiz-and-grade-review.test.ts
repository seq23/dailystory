// Guard (27 Oct 2026, reviewer items, each confirmed in code before the fix):
//   1. "Which sentence best shows how a character feels?" offered a second sentence
//      that also showed a feeling ("Maya felt worried…"): two right answers.
//   2. Fill-in-the-blank wrong choices were any bank word of similar length, so
//      "Leo sat by the ____" offered pillow next to window: two right answers.
//   3. A 3-sentence story at 9th–10th got the same sentence quoted twice (one question
//      giving away another's answer) and "mostly about" + "best title" with one answer.
//   4. With no child profile, Make easier / harder saved only the broad level.
//   5. streamlined-handler.ts used `bundle` and `getVocabularyCache`, neither in scope:
//      ReferenceErrors, swallowed by try/catch, so hair colour, pronouns and grade words
//      never reached a prompt. Every edge function is now scanned for undeclared names.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { buildFallbackQuiz, finalizeQuiz, questionKeys, quizShapeForGrade, storyQuestionLimit, storySentences } from "../../../supabase/functions/_shared/quiz";
import { saveReadingGradeWithoutChild, savedReadingGrade } from "@/lib/readingGradeStore";
import { startingReadingGrade } from "@/lib/readingLadder";

const ROOT = join(__dirname, "../../..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const right = (q: { options: string[]; correctAnswer: number }) => q.options[q.correctAnswer]!;

const FEELING_STORY = "Maya walked to the old library after school. She found a strange map hidden inside a dusty book. " +
  "Maya smiled because the map showed a secret garden. Maya felt worried about the dark path. The path led to a wooden gate.";
const SHORT = [
  "Leo sat by the window. The rain kept falling on the street. He read his book until dinner.",
  "Nia planted seeds in the garden. Weeks later the sprouts appeared. Her grandmother admired the neat rows.",
  "The committee reviewed the proposal carefully. Several members questioned the budget. Eventually the chairperson approved the revised version.",
];

describe("backup quiz: exactly one right answer", () => {
  it("'best shows how a character feels' never offers a wrong sentence that shows a feeling", () => {
    for (const g of ["6", "8", "9", "10"]) for (const seed of [0, 1, 2, 3]) {
      const qs = buildFallbackQuiz(FEELING_STORY, quizShapeForGrade(g, 14, seed));
      for (const q of qs.filter((x) => /best shows how a character feels/.test(x.question))) {
        for (const [i, o] of q.options.entries()) if (i !== q.correctAnswer) {
          expect(o, `${g}: "${o}"`).not.toMatch(/felt|worried|smiled|happy|scared|!|\?/i);
        }
      }
    }
    // With only two plain sentences there is no fair 4-choice evidence question at all.
    const two = "Maya felt worried. Maya smiled at the map. Maya walked home. Maya laughed at the cat.";
    expect(buildFallbackQuiz(two, quizShapeForGrade("10", 15, 0)).some((q) => /best shows/.test(q.question))).toBe(false);
  });

  it("fill-in-the-blank wrong choices are a kind of word that cannot fill the blank", () => {
    const NOUNS = /^(apple|rocket|pillow|turtle|pencil|ladder|jacket|basket|violin|carrot|planet|kitten|castle|blanket|dragon|bicycle|mitten|lantern|tiger|lemon|wagon|rabbit|zebra|kettle|helmet|feather|bucket)$/;
    const NOT_NOUNS = /(ed|ly)$/;
    let blanks = 0;
    for (const s of [...SHORT, FEELING_STORY]) for (const g of ["3", "5", "7", "10"]) {
      for (const q of buildFallbackQuiz(s, quizShapeForGrade(g, 12, 1))) {
        if (!/____/.test(q.question)) continue;
        blanks++;
        const before = q.question.match(/(\S+)\s+____/)?.[1]?.toLowerCase().replace(/[“"]/g, "") ?? "";
        for (const [i, o] of q.options.entries()) {
          if (i === q.correctAnswer) continue;
          // After "the / a / his …" only a verb or adverb is offered; otherwise only a noun.
          if (/^(the|a|an|his|her|my|their|our|its|your|this|that|these|those|some|every)$/.test(before)) expect(o, q.question).toMatch(NOT_NOUNS);
          else expect(o, q.question).toMatch(NOUNS);
        }
      }
    }
    expect(blanks).toBeGreaterThan(5);
    const leo = buildFallbackQuiz(SHORT[0]!, quizShapeForGrade("10", 15, 1)).find((q) => /sat by the ____/.test(q.question));
    if (leo) expect(leo.options.filter((o) => o !== "window").every((o) => /(ed|ly)$/.test(o))).toBe(true);
  });
});

describe("backup quiz: no repeats on a short story, fewer questions instead", () => {
  it("no two questions test the same word or quote the same sentence; mostly-about and title never both", () => {
    for (const s of [...SHORT, FEELING_STORY]) for (const g of ["9", "10", "6", "4", "2"]) for (const seed of [0, 1]) {
      const shape = quizShapeForGrade(g, 14, seed, ["garden", "proposal"]);
      for (const qs of [buildFallbackQuiz(s, shape), finalizeQuiz(null, s, shape).questions]) {
        const keys = qs.flatMap((q) => questionKeys(q));
        expect(keys.length - new Set(keys).size, `${g}: ${qs.map((q) => q.question).join(" | ")}`).toBe(0);
        expect(qs.some((q) => /mostly about/.test(q.question)) && qs.some((q) => /best title/.test(q.question))).toBe(false);
        expect(new Set(qs.map((q) => q.question + right(q))).size).toBe(qs.length);
      }
    }
  });
  it("a 3-sentence 9th–10th story gets fewer questions than the band's 8, never fewer than 3", () => {
    expect(storyQuestionLimit(3, 8)).toBe(6);
    expect(storyQuestionLimit(1, 8)).toBe(3);
    expect(storyQuestionLimit(10, 8)).toBe(20);
    for (const s of SHORT) {
      expect(storySentences(s)).toHaveLength(3);
      for (const g of ["9", "10"]) {
        const qs = buildFallbackQuiz(s, quizShapeForGrade(g, 15, 1));
        expect(qs.length).toBeLessThanOrEqual(6);
        expect(qs.length).toBeGreaterThanOrEqual(3);
      }
    }
  });
  it("the same sentence is never quoted twice (it would give the other answer away)", () => {
    const qs = buildFallbackQuiz(SHORT[0]!, quizShapeForGrade("10", 15, 1));
    const quoted = qs.map((q) => q.question.match(/[“"]([^”"]+)[”"]/)?.[1]?.replace(/____/, "").split(" ").slice(0, 3).join(" ")).filter(Boolean);
    expect(new Set(quoted).size).toBe(quoted.length);
  });
});

describe("no child profile: the exact grade is kept", () => {
  it("both saves on the story page write the grade, not only the broad level", () => {
    const page = read("src/components/CleanStoryDisplay.tsx");
    expect(page.match(/saveReadingGradeWithoutChild\(supabase, user\.id, step\)/g)).toHaveLength(2);
    expect(page).not.toMatch(/update\(\{ difficulty_level: step\.readingLevel \}\)/);
  });
  it("the save writes level and grade separately, so a missing column never loses the level", async () => {
    const writes: Array<Record<string, unknown>> = [];
    const db = { from: () => ({ update: (patch: Record<string, unknown>) => ({ eq: async () => { writes.push(patch); return { error: "reading_grade" in patch ? "no column" : null }; } }) }) };
    await saveReadingGradeWithoutChild(db, "u1", { grade: "3", readingLevel: "developing" });
    expect(writes).toEqual([{ difficulty_level: "developing" }, { reading_grade: "3" }]);
  });
  it("both load paths read it back, and the ladder starts there", () => {
    const app = read("src/components/AuthenticatedApp.tsx");
    expect(app.match(/savedReadingGrade\(/g)!.length).toBeGreaterThanOrEqual(2);
    expect(app).toMatch(/readingGrade: savedGrade/);
    expect(savedReadingGrade({ reading_grade: "4" })).toBe("4");
    expect(savedReadingGrade({ reading_grade: "11" })).toBeNull();
    // 3rd and 4th share the "developing" level; the saved grade decides.
    expect(startingReadingGrade({ readingGrade: savedReadingGrade({ reading_grade: "4" }), grade: "3", difficultyLevel: "developing" })).toBe("4");
    const sql = read("supabase/migrations/20261027090000_grade_word_shares.sql");
    expect(sql).toMatch(/alter table public\.profiles\s+add column if not exists reading_grade text/);
    expect(sql).toMatch(/profiles_reading_grade_check[\s\S]*'PreK','K','1','2','3','4','5','6','7','8','9','10'/);
  });
});

describe("edge functions: no undeclared names", () => {
  function tsFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) return ["_vendor", "node_modules"].includes(name) ? [] : tsFiles(full);
      return /\.ts$/.test(name) && !/\.(test|d)\.ts$/.test(name) ? [full] : [];
    });
  }
  it("every name used in supabase/functions resolves (Deno globals aside)", () => {
    const files = tsFiles(join(ROOT, "supabase/functions"));
    expect(files.length).toBeGreaterThan(100);
    const program = ts.createProgram(files, {
      noEmit: true, allowImportingTsExtensions: true, moduleResolution: ts.ModuleResolutionKind.Bundler,
      module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, skipLibCheck: true, types: [], lib: ["lib.es2022.d.ts", "lib.dom.d.ts"],
    });
    const undeclared = files.flatMap((f) => {
      const sf = program.getSourceFile(f)!;
      return program.getSemanticDiagnostics(sf)
        .filter((d) => d.code === 2304 || d.code === 2552) // Cannot find name
        .map((d) => `${relative(ROOT, f)}:${sf.getLineAndCharacterOfPosition(d.start!).line + 1} ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`)
        .filter((m) => !/'(Deno|EdgeRuntime)'/.test(m));
    });
    expect(undeclared).toEqual([]);
  }, 60_000);
});
