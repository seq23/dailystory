# Capability evidence and claim boundaries

Reviewed 2026-10-31. Intended audience: ages 3-15, Pre-K-10th grade.
Stories are English only; the UI has 8 languages.

## Source revisions

Current main baseline: `dba5f5a80b2ce63b58afa7dba175335dea595bcd`.
The links below to local source describe that implementation, not independently
verified production behavior.

Institution work: [open PR #130](https://github.com/seq23/dailystory/pull/130),
reviewed at `d061c637dc568c7f73b7d6f4e96d5bebcb1bedea`.
Read its [docs/phase-8-institutions.md](https://github.com/seq23/dailystory/blob/d061c637dc568c7f73b7d6f4e96d5bebcb1bedea/docs/phase-8-institutions.md).
That file is absent from this packet's main baseline. The older
`docs/PHASE_8_IMPLEMENTATION_STATUS.md` concerns avatars, not institutions.

## Claim matrix

| Capability | Evidence | Permitted description |
| --- | --- | --- |
| Grades and reader level | [Shared grade definitions](../../supabase/functions/_shared/grades.ts), [child form](../../src/components/children/ChildForm.tsx) | Ages 3-15, Pre-K-10th grade; School grade and Reads at are separate |
| UI languages | [UI resources](../../src/i18n/config.ts) | UI has 8 languages; English, Arabic, Spanish, Chinese, Hindi, Portuguese, French, Urdu |
| Story languages | [Story configuration](../../src/constants/storyLanguages.ts) | Stories are English only; other configured story languages are disabled |
| Family reader | [Story display](../../src/components/CleanStoryDisplay.tsx), [quiz](../../src/components/ComprehensionQuiz.tsx), [word help](../../src/components/UnifiedInteractiveWord.tsx) | Personalized stories, word help and quizzes; use does not establish proficiency |
| Narration | [Narration routing](../../src/services/narrationRouter.ts), [voice configuration](../../src/config/ttsConfig.ts) | Plan-dependent voice with device-speech fallback; no guaranteed premium capacity |
| Family progress | [Per-child progress](../../src/hooks/useChildProgressData.ts), [parent dashboard](../../src/components/ParentDashboard.tsx) | Reading/quiz views; vocabulary and saved-story totals are account-level |
| Family commercial offer | [Family pricing](../PRICING.md), [allowances](../../src/lib/freeStoryAllowance.ts) | Implemented consumer plans; no institutional seat checkout |
| School workspace | [Institution plan at reviewed revision](https://github.com/seq23/dailystory/blob/d061c637dc568c7f73b7d6f4e96d5bebcb1bedea/docs/phase-8-institutions.md) | Planned / PR #130; assigned-class teachers and school-scoped admins, adult accounts, teacher-entered records |
| School reporting math | [Report implementation at reviewed revision](https://github.com/seq23/dailystory/blob/d061c637dc568c7f73b7d6f4e96d5bebcb1bedea/src/lib/institutions/report.ts) | Planned / PR #130; dated levels/skills, paired coverage and question-weighted class percentages; observational only |
| School roster and data controls | [Institution privacy inventory](https://github.com/seq23/dailystory/blob/d061c637dc568c7f73b7d6f4e96d5bebcb1bedea/docs/privacy/data-inventory.md) | Planned / PR #130; CSV and configured provider adapters; live connections unverified |

## Do not imply availability

PR #130 does not supply automatic family-to-school activity ingestion, child
authentication, district-wide consolidated reporting, library authentication,
institutional billing, a sponsor portal or an automatic school export/retention
workflow. Any additional scope remains planned and requires its own delivery
evidence. Do not turn a provider adapter into a promise of SSO or a live connection.

Commercial bands and rollout timing in this packet are proposals. There are no
invented customers, testimonials, adoption statistics, validated learning gains,
medical claims or certification claims. Review [privacy evidence](../privacy/sales-review.md)
before sharing security answers. Recheck main, the institution PR status and
production acceptance before changing a planned capability to available.
