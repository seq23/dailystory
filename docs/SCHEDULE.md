# Schedule

Every scheduled GitHub Actions job in this repo. Times are Central (America/Chicago): each
`schedule:` entry carries `timezone: America/Chicago`, which GitHub Actions honours, so the clock
change in March and November no longer moves a job. Rebalanced 1 Nov 2026 (owner-approved weekly
schedule); see the notes below for what moved.

| Job | Workflow | When | Cron |
|---|---|---|---|
| entity backlink watch | `entity-backlink-watch.yml` | Thu 07:40 CT | `40 7 * * 4` |
| Lifecycle emails | `lifecycle-emails.yml` | `23 * * * *` (UTC; repeating, no fixed hour) | `23 * * * *` |
| Monitor AI Visual Scene Creator - ERROR-001 FIX | `monitor-ai-visual.yml` | every day 01:15 CT | `15 1 * * *` |
| Monitor Runware Generate Image | `monitor-runware-generate.yml` | every day 01:00 CT | `0 1 * * *` |
| Monitor Template AB | `monitor-template-ab.yml` | every day 01:30 CT | `30 1 * * *` |
| Monitor Template CD | `monitor-template-cd.yml` | every day 01:45 CT | `45 1 * * *` |
| Prerender live check | `prerender-live-check.yml` | `17 */4 * * *` (UTC; repeating, no fixed hour) | `17 */4 * * *` |
| Search Console Daily | `search-console-daily.yml` | every day 01:40 CT | `40 1 * * *` |
| Supabase keep-alive | `supabase-keep-alive.yml` | every day 00:41 CT | `41 0 * * *` |

## Weekly windows

- **Saturday 04:00–08:00 CT is the weekly-upkeep window for every Spry Labs side business**
  (owner ruling, 1 Nov 2026): weekly maintenance, refresh and metrics jobs run there, staggered
  at least 15 minutes apart, never two in the same slot. Publishing, link checks and
  self-healing are not upkeep and keep their own days.

## Moved on 1 Nov 2026
- Entity backlink watch: Monday → Thursday 07:40 CT.
- TTS usage report: no longer scheduled (owner, 1 Nov 2026: nobody read the weekly numbers). It runs
  after each Edge Functions deploy and on dispatch, and fails with a named reason when ElevenLabs
  credits fall under 20% of the plan or a child fell back to the browser voice in the last 7 days
  (docs/PRICING.md, scripts/tts-usage-alert.mjs).
