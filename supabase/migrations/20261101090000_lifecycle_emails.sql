-- Parent lifecycle emails (approved by Sequoia 1 Nov 2026): welcome, trial ending,
-- 3 free stories used, come back. Additive only; safe to reapply.
-- Code: supabase/functions/_shared/lifecycleEmail/ and supabase/functions/lifecycle-emails/.
-- Guard: src/test/guards/lifecycle-emails.test.ts.

-- 1. What the emails need to know about a subscription, recorded by stripe-webhook.
alter table public.subscribers add column if not exists trial_start timestamptz;
alter table public.subscribers add column if not exists trial_end timestamptz;
alter table public.subscribers add column if not exists cancel_at_period_end boolean not null default false;
alter table public.subscribers add column if not exists cancelled_at timestamptz;
alter table public.subscribers add column if not exists stripe_livemode boolean;

-- 2. Pages read per session (the trial-ending email reports it per child).
alter table public.reading_sessions add column if not exists pages_read integer;
alter table public.reading_sessions drop constraint if exists reading_sessions_pages_read_check;
alter table public.reading_sessions add constraint reading_sessions_pages_read_check
  check (pages_read is null or (pages_read >= 0 and pages_read <= 1000));

-- 3. Per-account opt-out (the unsubscribe link) and the test-account flag.
create table if not exists public.lifecycle_email_prefs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  unsubscribe_token uuid not null default gen_random_uuid() unique,
  opted_out_at timestamptz,
  is_test boolean not null default false,
  created_at timestamptz not null default now()
);

-- 4. The sent log: one row per (account, email kind), so nothing is ever sent twice.
create table if not exists public.lifecycle_email_log (
  user_id uuid not null references auth.users (id) on delete cascade,
  email_kind text not null check (email_kind in ('welcome', 'trial_ending', 'free_stories_used', 'come_back')),
  sent_at timestamptz not null default now(),
  provider_id text,
  primary key (user_id, email_kind)
);

-- 5. The kill switch for all four emails (row id 1). Paused = nothing is sent.
create table if not exists public.lifecycle_email_settings (
  id integer primary key check (id = 1),
  paused boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into public.lifecycle_email_settings (id, paused) values (1, false) on conflict (id) do nothing;

-- Service role only: no browser reads or writes any of these.
alter table public.lifecycle_email_prefs enable row level security;
alter table public.lifecycle_email_log enable row level security;
alter table public.lifecycle_email_settings enable row level security;
revoke all on public.lifecycle_email_prefs, public.lifecycle_email_log, public.lifecycle_email_settings from anon, authenticated;
grant all on public.lifecycle_email_prefs, public.lifecycle_email_log, public.lifecycle_email_settings to service_role;
