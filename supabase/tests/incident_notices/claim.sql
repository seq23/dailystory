-- Parent incident notices: one send per incident and parent, failed ones retryable, nothing
-- readable or callable by app roles. Disposable database only.
do $$
declare p1 uuid := '11111111-1111-4111-8111-111111111111'; p2 uuid := '22222222-2222-4222-8222-222222222222';
begin
  if public.incident_notice_claim('2026-11-test-incident', p1) <> 'claimed' then raise exception 'first claim must be claimed'; end if;
  -- A second run while the first is mid-send never sends again.
  if public.incident_notice_claim('2026-11-test-incident', p1) <> 'sending' then raise exception 'a claim in flight must not be claimed twice'; end if;
  -- A failure is retryable, once per run.
  update public.incident_notices set status = 'failed', last_error = 'Resend 403' where parent_user_id = p1;
  if public.incident_notice_claim('2026-11-test-incident', p1) <> 'claimed' then raise exception 'a failed notice must be retryable'; end if;
  if (select attempts from public.incident_notices where parent_user_id = p1) <> 2 then raise exception 'attempts must count the retry'; end if;
  if public.incident_notice_claim('2026-11-test-incident', p1) <> 'sending' then raise exception 'a retry in flight must not be claimed twice'; end if;
  -- A run that died mid-send is picked up again after 10 minutes, inside the mailer's 24-hour
  -- idempotency window; a send stuck longer than 23 hours is left for the owner to look at.
  update public.incident_notices set updated_at = now() - interval '11 minutes' where parent_user_id = p1;
  if public.incident_notice_claim('2026-11-test-incident', p1) <> 'claimed' then raise exception 'a stale send must be retryable'; end if;
  update public.incident_notices set updated_at = now() - interval '2 days' where parent_user_id = p1;
  if public.incident_notice_claim('2026-11-test-incident', p1) <> 'sending' then raise exception 'a send stuck past the idempotency window must not be resent'; end if;
  -- Sent stays sent.
  update public.incident_notices set status = 'sent' where parent_user_id = p1;
  if public.incident_notice_claim('2026-11-test-incident', p1) <> 'sent' then raise exception 'a sent notice must never be claimed again'; end if;
  -- Another incident or parent is its own row.
  if public.incident_notice_claim('2026-11-other-incident', p1) <> 'claimed' then raise exception 'another incident is separate'; end if;
  if public.incident_notice_claim('2026-11-test-incident', p2) <> 'claimed' then raise exception 'another parent is separate'; end if;
  -- The incident record is unique per key.
  insert into public.data_breach_log (breach_description, incident_key) values ('x', '2026-11-test-incident')
    on conflict (incident_key) do nothing;
  insert into public.data_breach_log (breach_description, incident_key) values ('x', '2026-11-test-incident')
    on conflict (incident_key) do nothing;
  if (select count(*) from public.data_breach_log where incident_key = '2026-11-test-incident') <> 1 then raise exception 'one incident record per key'; end if;
end $$;

-- App roles can neither read the send log nor take a claim.
set role authenticated;
do $$ begin
  begin perform 1 from public.incident_notices; raise exception 'authenticated read incident_notices';
  exception when insufficient_privilege then null; end;
  begin perform public.incident_notice_claim('2026-11-test-incident', gen_random_uuid()); raise exception 'authenticated claimed a notice';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set role anon;
do $$ begin
  begin perform public.incident_notice_claim('2026-11-test-incident', gen_random_uuid()); raise exception 'anon claimed a notice';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
