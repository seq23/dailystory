-- Parent incident notices: one send per incident, version and parent; a refused send is
-- retried under a fresh mailer key; an unconfirmed one under the same key only inside the
-- key's 23 hours, then held for the owner; an edit keeps who got the earlier version;
-- nothing readable or callable by app roles. Disposable database only.
do $$
declare
  p1 uuid := '11111111-1111-4111-8111-111111111111';
  p2 uuid := '22222222-2222-4222-8222-222222222222';
  inc text := '2026-11-test-incident';
  v1 text := 'aaaaaaaaaaaaaaaa';
  v2 text := 'bbbbbbbbbbbbbbbb';
  c jsonb;
begin
  -- A new row is claimed under key 1; a second run while it is mid-send gets 'sending'.
  c := public.incident_notice_claim(inc, v1, p1);
  if c <> '{"status": "claimed", "key": 1}'::jsonb then raise exception 'first claim: %', c; end if;
  c := public.incident_notice_claim(inc, v1, p1);
  if c->>'status' <> 'sending' then raise exception 'a claim in flight was claimed twice: %', c; end if;

  -- Refused by the mailer (nothing went out): retried under a fresh key.
  update public.incident_notices set status = 'failed', last_error = 'Resend 422' where parent_user_id = p1;
  c := public.incident_notice_claim(inc, v1, p1);
  if c <> '{"status": "claimed", "key": 2}'::jsonb then raise exception 'a refused send must be retried under key 2: %', c; end if;
  if (select attempts from public.incident_notices where parent_user_id = p1) <> 2 then raise exception 'attempts must count the retry'; end if;

  -- Unconfirmed (timeout) 22h59 after the key's first use: retried under the SAME key.
  update public.incident_notices set status = 'unsure', send_key_at = now() - interval '22 hours 59 minutes' where parent_user_id = p1;
  c := public.incident_notice_claim(inc, v1, p1);
  if c <> '{"status": "claimed", "key": 2}'::jsonb then raise exception 'an unconfirmed send inside 23 h must reuse key 2: %', c; end if;
  -- A run that died mid-send (still 'sending', 11 minutes old), same: same key.
  update public.incident_notices set updated_at = now() - interval '11 minutes' where parent_user_id = p1;
  c := public.incident_notice_claim(inc, v1, p1);
  if c <> '{"status": "claimed", "key": 2}'::jsonb then raise exception 'a stale send inside 23 h must reuse key 2: %', c; end if;
  -- Only 9 minutes old: another run may still be sending it.
  update public.incident_notices set updated_at = now() - interval '9 minutes' where parent_user_id = p1;
  if public.incident_notice_claim(inc, v1, p1)->>'status' <> 'sending' then raise exception 'a 9-minute-old send was taken over'; end if;

  -- 23h01 and 25h after the key's first use: held as 'unsure', never sent by itself.
  update public.incident_notices set status = 'unsure', send_key_at = now() - interval '23 hours 1 minute' where parent_user_id = p1;
  c := public.incident_notice_claim(inc, v1, p1);
  if c <> '{"status": "unsure", "key": 2}'::jsonb then raise exception 'an unconfirmed send at 23h01 must be held: %', c; end if;
  update public.incident_notices set status = 'sending', updated_at = now() - interval '25 hours', send_key_at = now() - interval '25 hours' where parent_user_id = p1;
  c := public.incident_notice_claim(inc, v1, p1);
  if c <> '{"status": "unsure", "key": 2}'::jsonb then raise exception 'a send stuck 25 h must be held: %', c; end if;
  if (select status from public.incident_notices where parent_user_id = p1) <> 'unsure' then raise exception 'the held row must read unsure, not sending forever'; end if;
  c := public.incident_notice_claim(inc, v1, p1);
  if c->>'status' <> 'unsure' then raise exception 'asked again it must stay held: %', c; end if;
  -- The owner checked the mailer's log and asked: a fresh key, its clock restarted.
  c := public.incident_notice_claim(inc, v1, p1, true);
  if c <> '{"status": "claimed", "key": 3}'::jsonb then raise exception 'resend_unsure must claim under key 3: %', c; end if;
  if (select send_key_at from public.incident_notices where parent_user_id = p1) < now() - interval '1 minute' then raise exception 'a new key must restart its clock'; end if;
  -- resend_unsure never re-sends what was sent.
  update public.incident_notices set status = 'sent' where parent_user_id = p1;
  if public.incident_notice_claim(inc, v1, p1, true)->>'status' <> 'sent' then raise exception 'a sent notice was claimed again'; end if;
  if public.incident_notice_claim(inc, v1, p1)->>'status' <> 'sent' then raise exception 'a sent notice was claimed again'; end if;

  -- Versions are numbered once each, in order.
  if public.incident_notice_version(inc, v1, '{"whatHappened": "first"}') <> 1 then raise exception 'v1 must be number 1'; end if;
  if public.incident_notice_version(inc, v1, '{"whatHappened": "first"}') <> 1 then raise exception 'v1 again must stay 1'; end if;
  if public.incident_notice_version(inc, v2, '{"whatHappened": "edited"}') <> 2 then raise exception 'v2 must be number 2'; end if;
  if public.incident_notice_version('2026-11-other-incident', v2, '{}') <> 1 then raise exception 'another incident numbers from 1'; end if;
  if (select content->>'whatHappened' from public.incident_notice_versions where incident_id = inc and notice_version = v1) <> 'first' then raise exception 'what v1 said must be kept'; end if;

  -- An edit is its own row: the record of who got v1 is untouched.
  c := public.incident_notice_claim(inc, v2, p1);
  if c <> '{"status": "claimed", "key": 1}'::jsonb then raise exception 'v2 is a separate send: %', c; end if;
  if (select status from public.incident_notices where incident_id = inc and notice_version = v1 and parent_user_id = p1) <> 'sent' then raise exception 'an edit lost who got v1'; end if;
  -- Another parent or incident is its own row.
  if public.incident_notice_claim(inc, v1, p2)->>'status' <> 'claimed' then raise exception 'another parent is separate'; end if;
  if public.incident_notice_claim('2026-11-other-incident', v1, p1)->>'status' <> 'claimed' then raise exception 'another incident is separate'; end if;

  -- One way to claim: the two-argument claim is gone.
  if exists (select 1 from pg_proc where proname = 'incident_notice_claim' and pronargs = 2) then raise exception 'the old claim is still there'; end if;
  -- Only the four statuses.
  begin
    update public.incident_notices set status = 'done' where parent_user_id = p2;
    raise exception 'status done was accepted';
  exception when check_violation then null; end;

  -- The incident record is unique per key.
  insert into public.data_breach_log (breach_description, incident_key) values ('x', inc) on conflict (incident_key) do nothing;
  insert into public.data_breach_log (breach_description, incident_key) values ('x', inc) on conflict (incident_key) do nothing;
  if (select count(*) from public.data_breach_log where incident_key = inc) <> 1 then raise exception 'one incident record per key'; end if;
end $$;

-- App roles can neither read the send log or versions nor take a claim or number a version.
set role authenticated;
do $$ begin
  begin perform 1 from public.incident_notices; raise exception 'authenticated read incident_notices';
  exception when insufficient_privilege then null; end;
  begin perform 1 from public.incident_notice_versions; raise exception 'authenticated read incident_notice_versions';
  exception when insufficient_privilege then null; end;
  begin perform public.incident_notice_claim('2026-11-test-incident', 'aaaaaaaaaaaaaaaa', gen_random_uuid(), true); raise exception 'authenticated claimed a notice';
  exception when insufficient_privilege then null; end;
  begin perform public.incident_notice_version('2026-11-test-incident', 'cccccccccccccccc', '{}'); raise exception 'authenticated numbered a version';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set role anon;
do $$ begin
  begin perform public.incident_notice_claim('2026-11-test-incident', 'aaaaaaaaaaaaaaaa', gen_random_uuid()); raise exception 'anon claimed a notice';
  exception when insufficient_privilege then null; end;
  begin perform public.incident_notice_version('2026-11-test-incident', 'cccccccccccccccc', '{}'); raise exception 'anon numbered a version';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
