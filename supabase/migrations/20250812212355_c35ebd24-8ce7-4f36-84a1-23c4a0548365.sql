
-- Quiz attempts table
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  child_profile_id uuid,
  story_id uuid,
  story_title text,
  story_signature text,
  language text not null default 'en',
  mode text not null default 'offline', -- offline | ai (optional)
  score integer not null default 0,
  total_questions integer not null default 0,
  details jsonb not null default '{}'::jsonb, -- per-question results, timings, etc.
  created_at timestamptz not null default now()
);

alter table public.quiz_attempts enable row level security;

create policy "Users can manage their own quiz attempts"
  on public.quiz_attempts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists quiz_attempts_user_created_at_idx on public.quiz_attempts (user_id, created_at);
create index if not exists quiz_attempts_story_id_idx on public.quiz_attempts (story_id);
create index if not exists quiz_attempts_story_signature_idx on public.quiz_attempts (story_signature);

-- Game sessions table
create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  child_profile_id uuid,
  story_id uuid,
  story_title text,
  language text not null default 'en',
  game_type text not null, -- 'word-match' | 'character-emotion' | 'sequence' | future types
  score integer not null default 0,
  max_score integer not null default 0,
  duration_seconds integer,
  details jsonb not null default '{}'::jsonb, -- selections, correctness, timings, etc.
  created_at timestamptz not null default now()
);

alter table public.game_sessions enable row level security;

create policy "Users can manage their own game sessions"
  on public.game_sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists game_sessions_user_created_at_idx on public.game_sessions (user_id, created_at);
create index if not exists game_sessions_game_type_idx on public.game_sessions (game_type);
