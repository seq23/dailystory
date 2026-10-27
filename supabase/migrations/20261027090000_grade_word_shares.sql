-- Grade-word shares (27 Oct 2026). Every story answer is scored for the share of each
-- page's words on the reader's grade lists, and a page below the floor is rewritten
-- once (supabase/functions/_shared/gradeWordRule.ts). One row per answer, so the
-- rule can be checked later. No personal data: no name, no story text.
create table if not exists public.story_grade_word_shares (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  reads_at text check (reads_at is null or reads_at in ('PreK','K','1','2','3','4','5','6','7','8','9','10')),
  floor numeric,
  min_share numeric,
  pages jsonb,
  rewritten boolean not null default false,
  session_id text check (char_length(session_id) <= 120),
  page_number int
);

create index if not exists story_grade_word_shares_created_at_idx
  on public.story_grade_word_shares (created_at desc);

-- Only the edge function (service role) writes or reads; RLS on, no policies.
alter table public.story_grade_word_shares enable row level security;

-- A grown-up with no child profile: the exact Reads-at grade from the story page's
-- Make easier / Make harder. It saved only the broad reading level, which spans two
-- grades, so the exact grade was lost on reload. Same values as child_profiles.reading_grade.
alter table public.profiles
  add column if not exists reading_grade text;

alter table public.profiles
  drop constraint if exists profiles_reading_grade_check;
alter table public.profiles
  add constraint profiles_reading_grade_check
  check (reading_grade is null or reading_grade in ('PreK','K','1','2','3','4','5','6','7','8','9','10'));
