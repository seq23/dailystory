\set ON_ERROR_STOP on
\set ECHO errors
-- Free read-aloud practice per local day (migration 20261122120000_read_aloud_practice.sql).
-- Runs as the image administrator after the migration; fixture ids only. test_assert comes
-- from supabase/tests/institutions/access.sql (run earlier in the same database).
create or replace function pg_temp.hit(u text, s text, tz text) returns jsonb language sql as $$
  select public.read_aloud_practice_hit(u::uuid, s, tz, 5, 3, 30) $$;

-- Five sentences a day, a sixth is refused and not counted; a sentence already counted is a retry.
do $$ declare r jsonb; begin
  for i in 1..5 loop
    r := pg_temp.hit('70000000-0000-0000-0000-000000000001', 's' || i, 'America/Chicago');
    perform public.test_assert((r->>'allowed')::boolean and (r->>'used')::int = i, 'sentence ' || i || ' allowed, used ' || i);
  end loop;
  r := pg_temp.hit('70000000-0000-0000-0000-000000000001', 's6', 'America/Chicago');
  perform public.test_assert(not (r->>'allowed')::boolean and (r->>'used')::int = 5 and (r->>'limit')::int = 5, 'the sixth sentence is refused with used 5 of 5');
  perform public.test_assert((select count(*) = 5 from public.read_aloud_practice where user_id = '70000000-0000-0000-0000-000000000001'), 'a refused sentence is not counted');
  r := pg_temp.hit('70000000-0000-0000-0000-000000000001', 's1', 'America/Chicago');
  perform public.test_assert((r->>'allowed')::boolean, 'a retry of a counted sentence is allowed at the limit');
  -- Clip cap per sentence (3 here): a client that labels every clip the same is still capped.
  perform pg_temp.hit('70000000-0000-0000-0000-000000000001', 's1', 'America/Chicago');
  r := pg_temp.hit('70000000-0000-0000-0000-000000000001', 's1', 'America/Chicago');
  perform public.test_assert(not (r->>'allowed')::boolean, 'the fourth clip of one sentence is refused');
end $$;

-- The day is the family's local day, not UTC. Kiritimati (UTC+14) and Pago Pago (UTC-11) are
-- 25 hours apart, so at any instant at least one of them is on a different date from UTC: a
-- UTC day would refuse one of these two families, the local day refuses both.
do $$ declare r jsonb; z text; u text; begin
  foreach z in array array['Pacific/Kiritimati', 'Pacific/Pago_Pago'] loop
    u := case z when 'Pacific/Kiritimati' then '70000000-0000-0000-0000-000000000002' else '70000000-0000-0000-0000-000000000003' end;
    insert into public.read_aloud_time_zone (user_id, time_zone) values (u::uuid, z);
    insert into public.read_aloud_practice (user_id, day, sentence_key)
      select u::uuid, (now() at time zone z)::date, 'k' || g from generate_series(1, 5) g;
    r := pg_temp.hit(u, 'new', z);
    perform public.test_assert(not (r->>'allowed')::boolean, z || ': five sentences on the family''s own date are today''s five');
    perform public.test_assert(r->>'day' = ((now() at time zone z)::date)::text, z || ': the day is the local date');
  end loop;
end $$;

-- Yesterday's sentences (local) do not count today.
do $$ declare r jsonb; begin
  insert into public.read_aloud_time_zone (user_id, time_zone) values ('70000000-0000-0000-0000-000000000004', 'Asia/Kolkata');
  insert into public.read_aloud_practice (user_id, day, sentence_key)
    select '70000000-0000-0000-0000-000000000004', (now() at time zone 'Asia/Kolkata')::date - 1, 'y' || g from generate_series(1, 5) g;
  r := pg_temp.hit('70000000-0000-0000-0000-000000000004', 'today', 'Asia/Kolkata');
  perform public.test_assert((r->>'allowed')::boolean and (r->>'used')::int = 1, 'yesterday''s five do not count today');
end $$;

-- The zone is set once; a different zone inside 30 days is ignored (a liar gains at most one
-- shifted boundary), after 30 days it is taken; an unknown name changes nothing.
do $$ begin
  perform pg_temp.hit('70000000-0000-0000-0000-000000000005', 'a', 'Europe/London');
  perform public.test_assert((select time_zone = 'Europe/London' from public.read_aloud_time_zone where user_id = '70000000-0000-0000-0000-000000000005'), 'first zone is stored');
  perform pg_temp.hit('70000000-0000-0000-0000-000000000005', 'b', 'Pacific/Kiritimati');
  perform public.test_assert((select time_zone = 'Europe/London' from public.read_aloud_time_zone where user_id = '70000000-0000-0000-0000-000000000005'), 'a second zone inside 30 days is ignored');
  update public.read_aloud_time_zone set changed_at = now() - interval '31 days' where user_id = '70000000-0000-0000-0000-000000000005';
  perform pg_temp.hit('70000000-0000-0000-0000-000000000005', 'c', 'Mars/Olympus_Mons');
  perform public.test_assert((select time_zone = 'Europe/London' from public.read_aloud_time_zone where user_id = '70000000-0000-0000-0000-000000000005'), 'an unknown zone name changes nothing');
  perform pg_temp.hit('70000000-0000-0000-0000-000000000005', 'd', 'Asia/Tokyo');
  perform public.test_assert((select time_zone = 'Asia/Tokyo' from public.read_aloud_time_zone where user_id = '70000000-0000-0000-0000-000000000005'), 'after 30 days the new zone is taken');
end $$;

-- Only the service role may call it or read the tables.
set role authenticated;
do $$ begin
  begin perform public.read_aloud_practice_hit('70000000-0000-0000-0000-000000000006', 'x', 'UTC', 5, 3, 30); raise exception 'FAIL authenticated calls read_aloud_practice_hit'; exception when insufficient_privilege then null; end;
  begin perform 1 from public.read_aloud_practice; raise exception 'FAIL authenticated reads read_aloud_practice'; exception when insufficient_privilege then null; end;
end $$;
reset role;
