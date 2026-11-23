-- Read-aloud refusals say WHICH cap was hit (22 Nov 2026). Additive only; safe to reapply.
-- A reviewer found a child who used up one sentence's clips (p_clips) being told that
-- today's sentences were used up. read_aloud_practice_hit now adds 'reason' to a refusal:
-- 'clips' (this sentence's tries for today) or 'sentences' (today's free sentences), and
-- voice-to-text shows each its own message (supabase/functions/_shared/readAloudAllowance.ts).
-- Same signature, same counting; only the refusal answers gain the reason.
-- Guard: supabase/tests/read_aloud/practice.sql (run by scripts/test-institutions-db.sh in CI).

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
  d := (now() at time zone coalesce(tz, 'UTC'))::date;

  select count(*) into used from public.read_aloud_practice where user_id = p_user and day = d;
  select clips into n from public.read_aloud_practice where user_id = p_user and day = d and sentence_key = p_sentence;
  if n is not null then
    -- Another try of a sentence already counted today, within its clip cap.
    if n >= p_clips then
      return jsonb_build_object('allowed', false, 'reason', 'clips', 'used', used, 'limit', p_sentences, 'day', d);
    end if;
    update public.read_aloud_practice set clips = clips + 1 where user_id = p_user and day = d and sentence_key = p_sentence;
    return jsonb_build_object('allowed', true, 'used', used, 'limit', p_sentences, 'day', d);
  end if;
  if used >= p_sentences then
    return jsonb_build_object('allowed', false, 'reason', 'sentences', 'used', used, 'limit', p_sentences, 'day', d);
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
