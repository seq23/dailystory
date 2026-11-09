# Capability evidence and claim boundaries

Reviewed 2026-11-08 against `main` at `41cb361ee63b52ae3b7c8eeb68b2cad3064d4af5`.
Audience: ages 3-15, Pre-K-10th grade. Stories are English only; the UI has 8 languages.
The code wins over older docs: every line below was checked in the source on main.
"Premium" means a paid subscription, a trial, or a Premium access code.

## Live today

- Every child reads at their own level: each profile has a School grade (for topics) and a Reads at level (for how hard the words are), from Pre-K to 10th grade.
- Make it easier or Make it harder with one tap, one grade at a time, on any story page.
- Stories step up on their own for Premium readers at 6th-10th grade: after a strong session (enough pages at a steady reading pace) the next level opens automatically.
- Parents set guardrails: lock the reading level or set a lowest level a child can drop to (Premium).
- Stories are personalized: the child's name, look, favorite things, hobbies and a special request shape every story.
- The reader picks what happens next from 3 choices at the end of a page (Premium).
- Stories keep going page after page, with an ending the reader shapes (Premium); free accounts get 3 complete stories.
- Every story is illustrated, for free and Premium readers alike.
- Stories can be read aloud: a natural premium voice on Premium, the device's own voice on the free plan (once per page).
- Tap any word to hear it, see what it means, break it into syllables or translate it.
- A read-aloud coach listens as the child reads a sentence and gives feedback (5 sentences a day free, unlimited on Premium).
- Parents and teachers add their own practice words, and the stories weave them in (Premium).
- Grade-level quizzes after reading check 8 skills, from sight words and phonics to the big picture, plus vocabulary mini-games (Premium).
- A parent dashboard shows reading habit, comprehension by skill, vocabulary and game results for each child.
- Readers earn points, badges and progress towers as they read (kept for the session on the free plan).
- One adult account can hold up to 40 child profiles.
- Schools get their own reading workspace: teachers run their classes, school administrators see every class in their school, and records stay inside that school.
- Teachers import a class roster from a spreadsheet (CSV), record reading sessions and dated level and quiz checks, and see class and student growth reports.
- A classroom reading profile can be linked to a roster child, so its in-app reading and quiz results show in the class view, kept apart from teacher records.
- School accounts run on a stricter privacy lane: children's names are masked before any AI request, only providers that do not keep or train on the text are used, and pictures are switched off.
- Partner access codes: a code can lengthen the free trial (HOMESCHOOL15 gives 15 days) or switch on Premium with no card.
- Simple family plans: 3 free stories with no card, then Premium at $12.99/month or $99/year with a 7-day free trial.
- The app screens come in 8 languages: English, Arabic, Spanish, Chinese, Hindi, Portuguese, French and Urdu. Stories are in English.
- Parents give consent by email for under-13 accounts, and can download or delete their data from the account page.

## Claim matrix

| Capability | Evidence on main | Permitted description | Limit |
| --- | --- | --- | --- |
| Reading level | [grades.ts](../../supabase/functions/_shared/grades.ts), [child form](../../src/components/children/ChildForm.tsx), [reading-levels.md](../reading-levels.md) | School grade and Reads at, Pre-K-10th | All plans |
| Easier / harder | [readingLadder.ts](../../src/lib/readingLadder.ts), [story page](../../src/components/CleanStoryDisplay.tsx) | One grade per tap, Pre-K-10th | All plans; a parent lock stops it on Premium |
| Automatic step-up | [expertDifficultyManager.ts](../../src/services/expertDifficultyManager.ts) | After a completed session of at least 6 pages at 120+ words a minute, or 10 pages at 80+, the reader moves up one grade | Premium only, and only at Reads at 6th-10th. Pre-K-5th levels change only by the buttons, the parent, or the profile |
| Parent guardrails | [parent dashboard](../../src/components/ParentDashboard.tsx) | Lock difficulty; lowest allowed level | Enforced for Premium readers |
| Personalization | [personalization step](../../src/components/forms/steps/FormStep3Personalization.tsx) | Name, appearance, favorites, hobbies, special request, practice words | All plans |
| Pick 1 of 3 | [StoryChoices.tsx](../../src/components/story/StoryChoices.tsx), [storyChoices.ts](../../supabase/functions/_shared/storyChoices.ts) | "What happens next? Pick one!" with 3 choices | Premium only |
| Continuing stories | [story page](../../src/components/CleanStoryDisplay.tsx), [allowances](../../src/lib/freeStoryAllowance.ts) | New pages on demand; reader-shaped ending | Premium only; free is 3 stories and a 20-minute session |
| Illustrations | [image function](../../supabase/functions/runware-generate-image/index.ts), [feature lists](../../src/constants/featureLists.ts) | Illustrated pages, same picture quality on every plan | Off for school accounts (privacy lane) |
| Narration | [narration routing](../../src/services/narrationRouter.ts), [voice configuration](../../src/config/ttsConfig.ts), [PRICING.md](../PRICING.md) | Premium voice on Premium; device voice on free | Free: once per page. No guaranteed premium-voice capacity; device voice is the fallback |
| Word help | [word help](../../src/components/UnifiedInteractiveWord.tsx), [dictionary function](../../supabase/functions/word-dictionary) | Hear, meaning, syllables, translate | All plans |
| Read-aloud coach | [ReadAloudCoach.tsx](../../src/components/ReadAloudCoach.tsx), [voice-to-text](../../supabase/functions/voice-to-text) | Speech-to-text feedback on a read sentence | Free: 5 sentences a day |
| Practice words | [parent dashboard](../../src/components/ParentDashboard.tsx) ("Teacher Word List") | Adult-chosen words woven into stories, per child or default | Premium only |
| Quizzes and games | [quiz](../../src/components/ComprehensionQuiz.tsx), [quiz function](../../supabase/functions/generate-quiz), [session end](../../src/pages/SessionEnded.tsx), [MiniGames.tsx](../../src/components/MiniGames.tsx) | Grade-level quiz on 8 skills; mini-games | Premium only |
| Family progress | [per-child progress](../../src/hooks/useChildProgressData.ts), [parent dashboard](../../src/components/ParentDashboard.tsx) | Reading habit, comprehension, vocabulary, game results | Vocabulary and saved-story totals are account-level, not per child. Use does not establish proficiency |
| Rewards | [story page](../../src/components/CleanStoryDisplay.tsx), [progress towers](../../src/components/ModernProgressTowers.tsx) | Points, badges, progress towers, level-up message | Free: this session only |
| Child profiles | [useChildProfiles.ts](../../src/hooks/useChildProfiles.ts) | Up to 40 per adult account | Children are profiles, not logins |
| School workspace | [/schools page](../../src/pages/Institutions.tsx), [institutions.sql](../../supabase/migrations/20261031050519_institutions.sql), [phase-8-institutions.md](../phase-8-institutions.md) | Assigned-class teachers, school-scoped admins, classes, records | Live on main since PR #130 (merged 31 Oct 2026). Each school and its first admin are set up by us, not self-service |
| School roster | [CSV and adapters](../../src/lib/institutions/api.ts), [roster function](../../supabase/functions/institution-roster) | CSV import up to 1000 rows; no student logins created | Clever and ClassLink adapters exist in code but no live connection has been made |
| School reports | [report.ts](../../src/lib/institutions/report.ts) | Minutes, sessions, dated levels and skills, paired coverage, question-weighted class percentages | Observational only; no causal or efficacy claim |
| App reading in class view | [app reading migration](../../supabase/migrations/20261031210000_institution_app_reading.sql) | A profile on the teacher's own account linked to a roster child | Home family accounts are never linked; nothing before the link is copied |
| School privacy lane | [privacyLane.ts](../../supabase/functions/_shared/privacyLane.ts), [guard](../../src/test/guards/school-privacy-lane.test.ts) | Names masked; no-retention routes only; pictures off | School accounts only |
| Access codes | [code rules](../../supabase/functions/_shared/accessCodeRules.ts), [redeem function](../../supabase/functions/redeem-access-code/index.ts) | Longer trial or Premium with no card | One code trial per account |
| Family plans | [PRICING.md](../PRICING.md), [checkout](../../supabase/functions/create-checkout/index.ts) | 3 free stories; $12.99/month or $99/year; 7-day trial | No institutional seat checkout |
| Languages | [UI resources](../../src/i18n/config.ts), [story languages](../../src/constants/storyLanguages.ts) | UI in 8 languages | Stories English only |
| Consent and data rights | [consent function](../../supabase/functions/verify-parental-consent/index.ts), [export](../../src/components/DataExportButton.tsx), [deletion](../../src/components/AccountDeletion.tsx) | Parent email consent; data download; account deletion | Not a legal conclusion; see [privacy summary](privacy-security.md) |

## Do not imply

These are not built. Describe them only as planned, never as available:

- Single sign-on (SSO) or student sign-in of any kind; children never log in.
- A live roster connection or live data exchange with Clever, ClassLink or any other system.
- Automatic copying of home family accounts into school reports.
- Library-card sign-in, library portals or branch licensing.
- District-wide dashboards, consolidated cross-school reporting or district provisioning.
- Institutional billing, seat checkout or purchase-order invoicing.
- A sponsor or partner reporting portal.
- Automatic school export or retention workflows; self-service school sign-up.
- Stories in any language other than English.
- Automatic step-up for Free readers or for Reads at Pre-K-5th.

Never claim reading gains, grade jumps or test-score changes. Never make medical,
clinical or dyslexia claims. Never use "no screens" or anti-AI framing: this is a
device-based product that uses AI. There are no customers, testimonials, adoption
statistics, certifications or validated learning gains to cite. Commercial bands
and rollout timing in this packet are proposals. Review the
[privacy evidence](../privacy/sales-review.md) before sharing security answers.
Recheck this page against main before calling anything new available.
