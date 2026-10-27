# Reading levels: the one map

**What families see** (owner decision, 26 Oct 2026): each child carries exactly two
things, both grades. **School grade** (`child_profiles.grade_level`) keeps topics and
themes right for them. **Reads at** (`child_profiles.reading_grade`, Pre-K–10th) sets
how hard the words are; it starts at the school grade and changes with the story
page's Make it easier / Make it harder buttons or the Reads at picker on the child
form. Everything below is internal, derived from Reads at.

Time2Read names a child's level in four vocabularies. They are all read off **one
module**, `supabase/functions/_shared/grades.ts` (re-exported to the app by
`src/lib/grades.ts`; combinations for testing in `src/lib/readingLevelMap.ts`).
No other file may keep its own list of levels; the guard
`src/test/guards/reading-level-map.test.ts` reads this table AND the module and fails
if they differ, and fails on any hand-written level list elsewhere.

| Vocabulary | Values | Who uses it |
|---|---|---|
| Grade | `PreK`, `K`, `1` … `10` | pickers, child profiles, the story prompt, the Make easier/harder ladder |
| Frontend reading level (`ReadingLevel`) | `pre-reader`, `beginner`, `developing`, `independent`, `advanced` | app state (`userInfo.difficultyLevel`), `profiles.reading_level` / `difficulty_level` |
| Backend difficulty (`BackendDifficulty`, `DifficultyLevel`) | `beginner`, `easy`, `medium`, `hard`, `expert` | story prompts, edge-function `config.difficulty`, guardrail `minDifficulty` |
| Expert sub-level (`ExpertGrade`) | `6th` … `10th` | prompts for grades 6–10 (`config.expertGradeLevel`) |

**The trap:** `beginner` is in both lists and means different things. Frontend
`beginner` = 1st–2nd grade = backend `easy`. Backend `beginner` = Pre-K/K = frontend
`pre-reader`. Never guess: convert a UI/profile value with `frontendLevelToDifficulty()`
and a value a client already converted with `backendDifficultyOf()`.

## The table

<!-- level-map:start -->
| Grade | Label | Frontend reading level | Backend difficulty | Expert sub-level | What the story prompt says |
|---|---|---|---|---|---|
| PreK | Pre-K | pre-reader | beginner | — | Pre-K (about age 4): a read-aloud picture-book level |
| K | Kindergarten | pre-reader | beginner | — | Kindergarten (about age 5): an emergent-reader level |
| 1 | 1st Grade | beginner | easy | — | 1st grade (about age 6): an early-reader level |
| 2 | 2nd Grade | beginner | easy | — | 2nd grade (about age 7): an early-reader level |
| 3 | 3rd Grade | developing | medium | — | 3rd grade (about age 8): a developing-reader level |
| 4 | 4th Grade | developing | medium | — | 4th grade (about age 9): a developing-reader level |
| 5 | 5th Grade | independent | hard | — | 5th grade (about age 10): an independent-reader level |
| 6 | 6th Grade | advanced | expert | 6th | 6th grade (about age 11): a middle-school reading level |
| 7 | 7th Grade | advanced | expert | 7th | 7th grade (about age 12): a middle-school reading level |
| 8 | 8th Grade | advanced | expert | 8th | 8th grade (about age 13): an upper middle-school reading level |
| 9 | 9th Grade | advanced | expert | 9th | 9th grade (about age 14): an early high-school reading level |
| 10 | 10th Grade | advanced | expert | 10th | 10th grade (about age 15): a high-school reading level |
<!-- level-map:end -->

Words per page, sentence length and vocabulary tier per grade are in
`GRADE_PROFILES` in the same module.

## Every combination story generation can receive

The reading page, the Make easier/harder ladder and the parent "Minimum level" all
resolve to a **grade**, and the grade fixes every other field, so there are exactly
**12 combinations**, exported as `ALL_LEVEL_COMBOS` from `src/lib/readingLevelMap.ts`.
Each carries the `userInfo` fields the page writes the story from
(`withReadingGrade`), the `config` that `generate-adaptive-story` receives
(`{ difficulty }`, plus `expertGradeLevel` for 6th–10th), the bundle grade (what tells
Pre-K from K and 1st from 2nd), and the guardrail minimums that land on it.

## Quiz bands (owner-approved quiz plan, 26 Oct 2026)

The end-of-story quiz is banded by the child's **Reads-at grade**; its topics and
tone follow the child's real age. Source: `QUIZ_BANDS` in
`supabase/functions/_shared/grades.ts` (re-exported by `src/lib/readingLevelMap.ts`);
rules in `supabase/functions/_shared/quiz.ts`. A "sometimes" skill rotates in for
about half of quizzes (chosen by the story, so a story always gets the same quiz) and
takes one slot from the skill with the most slots. Every answer is saved with its
skill; Parent dashboard → Reports shows strengths by skill.

<!-- quiz-bands:start -->
| Band | Grades | Questions | Choices | Pictures | Read aloud | Fixed skills | Sometimes |
|---|---|---|---|---|---|---|---|
| prek-k | PreK, K | 3 | 2 | yes | always | phonics 1, sight-words 1, what-happened 1 | between-the-lines |
| 1st | 1 | 4 | 3 | no | always | phonics 1, sight-words 1, word-meaning 1, what-happened 1 | spelling, between-the-lines |
| 2nd-3rd | 2, 3 | 5 | 3–4 | no | tap | spelling 1, word-meaning 1, what-happened 1, between-the-lines 1, big-picture 1 | phonics, sight-words, sentence-sense |
| 4th-5th | 4, 5 | 6 | 4 | no | tap | spelling 1, word-meaning 2, what-happened 1, between-the-lines 1, big-picture 1 | sentence-sense |
| 6th-8th | 6, 7, 8 | 7 | 4 | no | tap | spelling 1, word-meaning 2, what-happened 1, between-the-lines 1, big-picture 1, sentence-sense 1 | — |
| 9th-10th | 9, 10 | 8 | 4 | no | tap | spelling 1, word-meaning 2, between-the-lines 2, big-picture 2, sentence-sense 1 | — |
<!-- quiz-bands:end -->

## Grade-level words (27 Oct 2026)

Every Reads-at grade has a word list, built from three standard lists. The words live
in ONE file, `supabase/functions/_shared/wordLists.ts`; which grade gets which list is
`GRADE_LIST_MAP` in `supabase/functions/_shared/gradeWords.ts`. The edge functions and
the app (`src/lib/readingLevelMap.ts`, `src/constants/educationalWords.ts`) import that
module; no other copy exists (the guard `src/test/guards/word-lists.test.ts` reads this
table against the module and fails on a second copy of a list).

The mapping, the usual pacing for each list:

- **Dolch** (220 service words + 95 nouns): pre-primer → Pre-K; primer and nouns → K;
  then the 1st, 2nd and 3rd grade lists at their grades.
- **Fry 1,000 Instant Words**: one hundred a year to 2nd grade (1st hundred → K, 2nd →
  1st, 3rd → 2nd), then 4th–5th hundreds → 3rd, 6th–7th → 4th, 8th–10th → 5th, so all
  1,000 are covered by the end of 5th grade.
- **Academic Word List** (Coxhead, 570 headwords): two sublists a year, most frequent
  first: 1–2 → 6th, 3–4 → 7th, 5–6 → 8th, 7–8 → 9th, 9–10 → 10th.

"New words" are the grade's own lists; "Words known" is every list up to and including
the grade (what a reader at that grade is expected to know). "Share floor" is the soft
rule below.

<!-- grade-lists:start -->
| Grade | Dolch | Fry hundreds | AWL sublists | New words | Words known | Share floor |
|---|---|---|---|---|---|---|
| PreK | pre-primer | — | — | 40 | 40 | 0.45 |
| K | primer, nouns | 1 | — | 216 | 231 | 0.55 |
| 1 | 1st grade | 2 | — | 128 | 311 | 0.6 |
| 2 | 2nd grade | 3 | — | 142 | 402 | 0.6 |
| 3 | 3rd grade | 4, 5 | — | 229 | 577 | 0.6 |
| 4 | — | 6, 7 | — | 200 | 759 | 0.55 |
| 5 | — | 8, 9, 10 | — | 300 | 1042 | 0.55 |
| 6 | — | — | 1, 2 | 120 | 1151 | 0.5 |
| 7 | — | — | 3, 4 | 120 | 1269 | 0.5 |
| 8 | — | — | 5, 6 | 120 | 1387 | 0.5 |
| 9 | — | — | 7, 8 | 120 | 1505 | 0.5 |
| 10 | — | — | 9, 10 | 90 | 1593 | 0.5 |
<!-- grade-lists:end -->

**In the story prompt.** `generate-adaptive-story` adds 15 of the child's Reads-at grade
words (its own lists, rotating by session) to the prompt's "Priority vocabulary" line,
after any words the parent typed (`gradePromptWords`).

**The soft rule** (`supabase/functions/_shared/gradeWordRule.ts`). Each page of a story
answer is scored: the share of its distinct words (names, placeholders and numbers left
out; jumps/jumped/jumping count as jump) that are on the reader's "Words known" list. A
page below its grade's floor is rewritten **once** by the same provider chain, and the
better-scoring version is kept. A rewrite that fails, comes back empty or scores no
better leaves the page as it was; the rule never fails a story and never sends anyone
to Backup Mode. Pages under 6 distinct words are not judged. Every answer's shares are
logged to `story_grade_word_shares` (migration `20261027090000_grade_word_shares.sql`;
no name, no story text) and returned as `metadata.gradeWordShare`. The floors were set
from sample pages: pages written at the reader's level scored 0.70–0.93 (a literary
9th-grade page 0.58), pages written far above the reader 0.11–0.29.

### Where the word lists come from

Transcribed 26 Oct 2026 from downloaded copies, checked against each other; nothing was
filled from memory. Apostrophes are plain ASCII; capitals as the sources print them.

- **Fry 1,000** (10 × 100, 1,000 unique, frequency order). Primary pair: Unique Teaching
  Resources' numbered 1–1000 lists and K12Reader's lists; they agree on 970 of 1,000
  positions (all of the 1st hundred). The 30 others were settled by majority with
  SightWords.com's frequency list, Bismarck Public Schools' copy of Fry, Kress &
  Fountoukidis, *The Reading Teacher's Book of Lists* (hundreds 1–6) and the Utah
  Education Network list (hundreds 2–6). Hundreds 2–3 keep base forms (animal, letter,
  start) except following, beginning and later.
- **Known edition differences.** More than one Fry list circulates: some copies have
  *oil, sit* at #88–89 where both primary sources have *am, its* (kept). **#482 = bread
  rests on one source** (the others put *am* there, which would make *am* appear twice);
  #545 sit (not site); #579 glass and #719 grass. Hundreds 7–10 had three complete
  sources, two of them identical.
- **Academic Word List** (570 headwords; sublists 1–9 have 60, sublist 10 has 30).
  Victoria University of Wellington's sublist pages and its headword PDF, cross-checked
  with the EAP Foundation list; every headword has the same sublist in all three. Six
  markup or spelling differences were settled by majority: *reliability* dropped (a
  nested family member), *confirm* restored to sublist 7, *administrate / ignorant /
  intelligent* kept over the -ion/-ce forms, *so-called* hyphenated.
- **Dolch**: E. W. Dolch (1936/1948), 220 service words in five lists and 95 nouns.

## Where each value is stored

| Column | Holds | Read by |
|---|---|---|
| `child_profiles.grade_level` | grade | `normalizeGrade()` |
| `child_profiles.reading_grade` | grade (the ladder's last step; CHECK constraint lists the 12) | `startingReadingGrade()` |
| `profiles.grade_level` | grade | `normalizeGrade()` |
| `profiles.reading_grade` | grade: the story page's last step for a grown-up with no child profile (CHECK lists the 12; migration `20261027090000`) | `savedReadingGrade()` → `userInfo.readingGrade` → `startingReadingGrade()` |
| `profiles.reading_level`, `profiles.difficulty_level` | frontend reading level | `frontendLevelToDifficulty()` (a backend name left by the old guardrail clamp reads as that band) |
| `user_preferences.reading_preferences.minDifficulty` + `.minExpertGrade` | backend difficulty + expert sub-level | `minimumGradeForGuardrail()` |
| `stories.reading_level` | legacy library tag (`beginner`, `elementary`), used only by the free-tier RLS policy | not a reading level of any child |

How every stored value, legacy ones included, is read: `normalizeStoredLevel(column,
value)` in `src/lib/readingLevelMap.ts`. The distinct values actually stored in
production (counts only) are printed by the read-only workflow
`.github/workflows/level-values-report.yml`.

## Every converter

The guard checks that each line below still holds the named symbol.

<!-- converters:start -->
| Where | Symbol | Does |
|---|---|---|
| supabase/functions/_shared/grades.ts:140 | normalizeGrade | any grade spelling → grade |
| supabase/functions/_shared/grades.ts:198 | readingLevelForGrade | grade → frontend level |
| supabase/functions/_shared/grades.ts:206 | difficultyForGrade | grade → backend difficulty |
| supabase/functions/_shared/grades.ts:215 | expertGradeForGrade | grade → expert sub-level |
| supabase/functions/_shared/grades.ts:240 | promptReadingLevelForGrade | grade → prompt wording |
| supabase/functions/_shared/grades.ts:291 | frontendLevelToDifficulty | UI/profile value → backend (frontend-first) |
| supabase/functions/_shared/grades.ts:303 | backendDifficultyOf | already-converted value → backend (backend-first) |
| supabase/functions/_shared/grades.ts:310 | readingLevelForDifficulty | backend → frontend level |
| supabase/functions/_shared/grades.ts:324 | minimumGradeForGuardrail | guardrail → lowest grade allowed |
| src/lib/readingLadder.ts:60 | startingReadingGrade | child → grade the ladder starts at |
| src/lib/readingLadder.ts:85 | withReadingGrade | grade → userInfo fields a story is written from |
| src/services/DifficultyLevelMapper.ts:45 | toBackend | delegates to frontendLevelToDifficulty |
| src/services/DifficultyLevelMapper.ts:50 | fromBackendValue | delegates to backendDifficultyOf |
| supabase/functions/_shared/DifficultyLevelMapper.ts:46 | toBackend | delegates to frontendLevelToDifficulty |
| supabase/functions/_shared/DifficultyLevelMapper.ts:51 | fromBackendValue | delegates to backendDifficultyOf |
| src/services/NetflixStyleStoryService.ts:82 | DifficultyLevelMapper.toBackend(frontendDifficulty) | userInfo level → config.difficulty |
| src/services/LiveGenerationService.ts:53 | DifficultyLevelMapper.toBackend(frontendDifficulty) | userInfo level → config.difficulty |
| supabase/functions/generate-adaptive-story/streamlined-handler.ts:163 | DifficultyLevelMapper.fromBackendValue(originalDifficulty) | config.difficulty read backend-first |
| supabase/functions/template-service/index.ts:178 | DifficultyLevelMapper.fromBackendValue(difficulty) | `difficulty` read backend-first |
| src/components/ParentDashboard.tsx:910 | minimumGradeForGuardrail(guardrails.minDifficulty, guardrails.minExpertGrade, guardrails.minReadingGrade) | stored minimum → "Never easier than" grade |
| src/components/CleanStoryDisplay.tsx:1323 | const minGrade = minimumGradeForGuardrail | lock clamp compares grades |
| src/lib/readingLevelMap.ts:101 | normalizeStoredLevel | any stored column value → grade |
<!-- converters:end -->

## Mismatches fixed 26 Oct 2026

- **Pre-K/K stories were written at 1st–2nd grade.** The clients convert the level to
  a backend value before sending (`NetflixStyleStoryService.ts:82`,
  `LiveGenerationService.ts:53`), and `streamlined-handler.ts` converted it AGAIN as if
  it were a frontend value, so backend `beginner` became `easy`. Same in
  `template-service` for the ending page. Both now read `config.difficulty`
  backend-first.
- **The parent "Minimum level" never held.** Guardrails are stored as backend values,
  and the reading page compared them by index in the frontend list (`easy` etc. → -1).
  A saved Pre-Reader minimum reloaded as "Beginner" and re-saved as `easy`. Now the
  picker converts both ways and the reading page compares grades.
- **The session-ended page** blocked the quiz for frontend `beginner` (1st–2nd) while
  letting Pre-K through, and its level card mapped `easy` to "Pre-Reader".
- ~40 hand-written copies of the level lists (types, arrays, a duplicate `.js` mapper)
  now import `READING_LEVELS` / `BACKEND_DIFFICULTIES` / `BackendDifficulty`.

## Stored values in production (26 Oct 2026, counts only)

From `.github/workflows/level-values-report.yml` (read-only):

| Column | Values (rows) | Read as |
|---|---|---|
| `child_profiles.grade_level` | 3 (5), 5 (5), 2 (4), K (4), **Pre-K (4)**, 6 (3), 1 (3), 4 (2), 7 (1), null (1) | `normalizeGrade`; "Pre-K" rewritten to `PreK` by `20261026233000_reads_at.sql` |
| `child_profiles.reading_grade` | null (32) | null → Reads at = school grade |
| `profiles.grade_level` | K (14) | `normalizeGrade` |
| `profiles.reading_level` | beginner (14) | frontend `beginner` = 1st–2nd (the column default) |
| `profiles.difficulty_level` | null (13), independent (1) | frontend level |
| `user_preferences…minDifficulty` / `minExpertGrade` | null (14), beginner (1) / null (14), 6th (1) | `minimumGradeForGuardrail`; the migration adds `minReadingGrade` |
| `stories.reading_level` | no rows | — |

## What changed 26 Oct 2026

PRs #102 (the map, the Pre-K/K level fix, quizzes v1, session-ended), #104 (quiz plan:
skills, bands, reports, one reading counter) and the Reads-at PR. Every file touched:

- `.github/workflows/level-values-report.yml`
- `config/llm_routing.json`
- `deno.lock`
- `docs/reading-levels.md`
- `src/components/AudioE2ETestingPanel.tsx`
- `src/components/children/ChildForm.tsx`
- `src/components/children/childInfo.ts`
- `src/components/CleanStoryDisplay.tsx`
- `src/components/ComprehensionQuiz.tsx`
- `src/components/ElevenLabsAudio.tsx`
- `src/components/forms/hooks/useMultiStepForm.tsx`
- `src/components/forms/steps/FormStep2ReadingPrefs.tsx`
- `src/components/InteractiveWord.tsx`
- `src/components/MobileOptimizedInteractiveWord.tsx`
- `src/components/ParentDashboard.tsx`
- `src/components/PremiumMyStoriesView.tsx`
- `src/components/PremiumStoryLibrary.tsx`
- `src/components/ResponsiveStoryHeader.tsx`
- `src/components/UnifiedInteractiveWord.tsx`
- `src/components/VoiceQuiz.tsx`
- `src/config/audioConfig.ts`
- `src/constants/app.ts`
- `src/hooks/useActivityPersistence.ts`
- `src/hooks/useAudioControls.ts`
- `src/hooks/useChildProfiles.ts`
- `src/hooks/useChildProgressData.ts`
- `src/hooks/useTemplateCounts.ts`
- `src/lib/lastReadStory.ts`
- `src/lib/quiz.ts`
- `src/lib/readingLadder.ts`
- `src/lib/readingLevelMap.ts`
- `src/pages/SessionEnded.tsx`
- `src/services/DifficultyLevelMapper.ts`
- `src/services/difficultyManager.ts`
- `src/services/parentGuardrailsService.ts`
- `src/services/personalizedLearningService.ts`
- `src/services/premiumStoryManager.ts`
- `src/services/premiumVocabularyService.ts`
- `src/services/progressTrackingService.ts`
- `src/services/storyGenerationService.ts`
- `src/services/voiceCatalog/VoiceCatalogIntegration.ts`
- `src/services/voiceCatalog/VoiceCatalogService.ts`
- `src/services/voiceCatalog/VoiceSelector.ts`
- `src/test/guards/parent-dashboard-reports.test.ts`
- `src/test/guards/reading-level-ladder.test.ts`
- `src/test/guards/reading-level-map.test.ts`
- `src/test/guards/reads-at.test.ts`
- `src/test/guards/session-ended-story.test.ts`
- `src/test/guards/story-quiz.test.ts`
- `src/test/guards/story-text-provider.test.ts`
- `src/types/index.ts`
- `src/utils/desktopTextProcessor.tsx`
- `src/utils/storyQualityChecker.ts`
- `src/utils/textProcessor.tsx`
- `src/utils/vocabularyLevelClassifier.ts`
- `supabase/functions/_shared/authorVoicePatterns.ts`
- `supabase/functions/_shared/DifficultyLevelMapper.js`
- `supabase/functions/_shared/DifficultyLevelMapper.ts`
- `supabase/functions/_shared/grades.ts`
- `supabase/functions/_shared/quiz.ts`
- `supabase/functions/_shared/storyOutputCheck.ts`
- `supabase/functions/_shared/storyPrompts.ts`
- `supabase/functions/_shared/storyTextProvider.ts`
- `supabase/functions/_shared/validation-utils.ts`
- `supabase/functions/_shared/wordLists.ts`
- `supabase/functions/correct-spelling/index.ts`
- `supabase/functions/generate-adaptive-story/streamlined-handler.ts`
- `supabase/functions/generate-quiz/index.ts`
- `supabase/functions/template-service/index.ts`
- `supabase/functions/translate-universal/index.ts`
- `supabase/functions/word-dictionary/index.ts`
- `supabase/migrations/20261026233000_reads_at.sql`
