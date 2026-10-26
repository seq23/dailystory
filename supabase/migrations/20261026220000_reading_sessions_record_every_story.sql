-- Reading sessions were never written by the app, so Progress (stories read, reading time,
-- streaks) stayed at zero for every family (26 Oct 2026). The reading page now records one row
-- per ended session. Most stories live in saved_stories, not stories, so story_id can no longer
-- be required; the foreign key stays for rows that do carry one. Additive only.
alter table public.reading_sessions alter column story_id drop not null;
comment on column public.reading_sessions.time_spent is
  'Minutes read in the session (every reader of this column sums it as minutes).';
