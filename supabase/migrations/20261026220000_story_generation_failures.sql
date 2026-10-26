-- Story generation failures (26 Oct 2026). Every live story fell into Backup Mode
-- because OpenAI had no credit left, and nothing on the server said so. Each failed
-- story is now written here: by the edge function when no provider answers
-- (stage 'edge'), and by the app when it shows a family a Backup Mode story
-- (stage 'client_backup'). No personal data: no child name, no prompt text.
create table if not exists public.story_generation_failures (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  stage text not null check (stage in ('edge', 'client_backup')),
  error_type text check (char_length(error_type) <= 60),
  message text check (char_length(message) <= 500),
  provider_attempts jsonb,
  session_id text check (char_length(session_id) <= 120),
  page_number int,
  path text check (char_length(path) <= 200),
  build text check (char_length(build) <= 60)
);

create index if not exists story_generation_failures_created_at_idx
  on public.story_generation_failures (created_at desc);

alter table public.story_generation_failures enable row level security;

-- Anyone may report a failure; nobody but the service role may read.
drop policy if exists "anyone can report a story failure" on public.story_generation_failures;
create policy "anyone can report a story failure"
  on public.story_generation_failures for insert
  to anon, authenticated
  with check (true);
