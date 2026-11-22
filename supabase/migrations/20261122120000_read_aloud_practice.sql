-- Free read-aloud practice counted per FAMILY'S LOCAL DAY (22 Nov 2026). Additive only; safe to reapply.
-- voice-to-text calls read_aloud_practice_hit for every practice clip from a free account
-- (supabase/functions/_shared/readAloudAllowance.ts). A UTC day reset at 6 pm Central, so
-- "come back tomorrow" was false; the day here is the account's own calendar day.
-- Guard: supabase/tests/read_aloud/practice.sql (run by scripts/test-institutions-db.sh in CI).
--
-- The time zone (one per account, the parent's sign-in) is set once from the browser's IANA
-- zone and may change at most once every p_zone_days days (voice-to-text passes 30). A client
-- that lies about its zone therefore gains at most ONE shifted day boundary per 30 days: at
-- most one extra day's sentences a month, never a reset on demand. A family that moves or
-- travels gets its new zone after the 30 days; until then its day stays the old zone's day.
-- Only real zone names (pg_timezone_names) are accepted; an unknown name changes nothing,
-- and an account with no zone on record counts UTC days until the coach sends one.

create table if not exists public.read_aloud_time_zone (
  user_id uuid primary key,
  time_zone text not null,
  changed_at timestamptz not null default now()
);

create table if not exists public.read_aloud_practice (
  user_id uuid not null,
  day date not null,                 -- the account's local calendar day
  sentence_key text not null,        -- a short hash of the practice sentence
  clips integer not null default 1,  -- clips of that sentence that day
  primary key (user_id, day, sentence_key)
);

alter table public.read_aloud_time_zone enable row level security;
alter table public.read_aloud_practice enable row level security;
-- No policies: only the service role (edge functions) reads or writes them.
revoke all on public.read_aloud_time_zone from anon, authenticated;
revoke all on public.read_aloud_practice from anon, authenticated;

-- One practice clip. Returns {allowed, used, limit, day}: used = distinct sentences today
-- after this clip (or at refusal). A refused clip is not counted. Serialised per account,
-- so two clips at once cannot both take the last sentence.
create or replace function public.read_aloud_practice_hit(
  p_user uuid, p_sentence text, p_time_zone text, p_sentences integer, p_clips integer, p_zone_days integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  tz text;
  changed timestamptz;
  d date;
  used integer;
  n integer;
begin
  if p_user is null or coalesce(p_sentence, '') = '' or p_sentences is null or p_clips is null or p_zone_days is null then
    raise exception 'read_aloud_practice_hit: user, sentence and limits are required';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('read_aloud:' || p_user::text, 0));

  select z.time_zone, z.changed_at into tz, changed from public.read_aloud_time_zone z where z.user_id = p_user;
  if p_time_zone is not null and p_time_zone is distinct from tz
     and exists (select 1 from pg_timezone_names where name = p_time_zone) then
    if tz is null then
      insert into public.read_aloud_time_zone (user_id, time_zone) values (p_user, p_time_zone)
      on conflict (user_id) do nothing;
      tz := p_time_zone;
    elsif changed < now() - make_interval(days => p_zone_days) then
      update public.read_aloud_time_zone set time_zone = p_time_zone, changed_at = now() where user_id = p_user;
      tz := p_time_zone;
    end if;
  end if;
  d := (now() at time zone 'UTC')::date;

  select count(*) into used from public.read_aloud_practice where user_id = p_user and day = d;
  select clips into n from public.read_aloud_practice where user_id = p_user and day = d and sentence_key = p_sentence;
  if n is not null then
    -- Another try of a sentence already counted today, within its clip cap.
    if n >= p_clips then
      return jsonb_build_object('allowed', false, 'used', used, 'limit', p_sentences, 'day', d);
    end if;
    update public.read_aloud_practice set clips = clips + 1 where user_id = p_user and day = d and sentence_key = p_sentence;
    return jsonb_build_object('allowed', true, 'used', used, 'limit', p_sentences, 'day', d);
  end if;
  if used >= p_sentences then
    return jsonb_build_object('allowed', false, 'used', used, 'limit', p_sentences, 'day', d);
  end if;
  insert into public.read_aloud_practice (user_id, day, sentence_key) values (p_user, d, p_sentence);

  -- Housekeeping, about one call in two hundred: days more than three days old are spent.
  if random() < 0.005 then
    delete from public.read_aloud_practice where day < current_date - 3;
  end if;
  return jsonb_build_object('allowed', true, 'used', used + 1, 'limit', p_sentences, 'day', d);
end;
$$;

revoke all on function public.read_aloud_practice_hit(uuid, text, text, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.read_aloud_practice_hit(uuid, text, text, integer, integer, integer) to service_role;
