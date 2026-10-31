-- All identities and addresses are synthetic. Runs only in disposable PostgreSQL.
create role service_role nologin bypassrls;
grant all on public.client_boot_errors, public.story_generation_failures to service_role;
grant usage on sequence public.client_boot_errors_id_seq, public.story_generation_failures_id_seq to service_role;

create function pg_temp.assert_rejected(statement text, expected_state text) returns void language plpgsql as $$
begin
  begin
    execute statement;
  exception when others then
    if sqlstate = expected_state then return; end if;
    raise exception 'Expected SQLSTATE %, received %: %', expected_state, sqlstate, sqlerrm;
  end;
  raise exception 'Unexpectedly accepted: %', statement;
end;
$$;

set role anon;
select set_config('request.headers', '{"x-forwarded-for":"192.0.2.10, 10.0.0.1"}', false);
insert into public.client_boot_errors(kind, message) values ('error', 'Fixture boot error');
insert into public.story_generation_failures(stage, message, provider_attempts)
  values ('client_backup', 'Fixture fallback', '[{"provider":"fixture","error":"timeout"}]');
select pg_temp.assert_rejected('select * from public.client_boot_errors', '42501');
select pg_temp.assert_rejected('select * from public.story_generation_failures', '42501');
select pg_temp.assert_rejected('update public.client_boot_errors set message = ''changed''', '42501');
select pg_temp.assert_rejected('delete from public.story_generation_failures', '42501');
select pg_temp.assert_rejected('truncate public.client_boot_errors', '42501');
select pg_temp.assert_rejected('select * from diagnostic_private.insert_buckets', '42501');
select pg_temp.assert_rejected('select diagnostic_private.guard_insert()', '42501');
select pg_temp.assert_rejected($q$insert into public.client_boot_errors(kind, created_at) values ('error', '2099-01-01')$q$, '42501');
select pg_temp.assert_rejected($q$insert into public.client_boot_errors(kind, message) values ('error', repeat('a', 501))$q$, '23514');
select pg_temp.assert_rejected($q$insert into public.story_generation_failures(stage, provider_attempts) values ('client_backup', to_jsonb(repeat('a', 4097)))$q$, '42501');
-- Text caps apply in characters; also test total bytes with multibyte content.
select pg_temp.assert_rejected($q$insert into public.story_generation_failures(stage, message, session_id, path, build, error_type, provider_attempts)
 values ('client_backup', repeat('😀',500), repeat('😀',120), repeat('😀',200), repeat('😀',60), repeat('😀',60), to_jsonb(repeat('😀',3000)))$q$, '23514');
-- A single bulk insert must not bypass the per-row quota.
select pg_temp.assert_rejected($q$insert into public.client_boot_errors(kind) select 'error' from generate_series(1, 31)$q$, 'P0001');
insert into public.client_boot_errors(kind) select 'rejection' from generate_series(1, 28);
select pg_temp.assert_rejected($q$insert into public.story_generation_failures(stage) values ('client_backup')$q$, 'P0001');
-- PostgREST permits per-request timezone preferences; these must not reset quotas.
set timezone = 'America/Los_Angeles';
select pg_temp.assert_rejected($q$insert into public.client_boot_errors(kind) values ('error')$q$, 'P0001');
set timezone = 'UTC';
-- The same IP with a different proxy suffix still shares its quota.
select set_config('request.headers', '{"x-forwarded-for":"192.0.2.10, 10.0.0.2"}', false);
select pg_temp.assert_rejected($q$insert into public.client_boot_errors(kind) values ('error')$q$, 'P0001');
select set_config('request.headers', '{"x-forwarded-for":"192.0.2.11"}', false);
insert into public.client_boot_errors(kind) values ('storage_fallback');
set role authenticated;
insert into public.story_generation_failures(stage) values ('client_backup');
select pg_temp.assert_rejected('select * from public.story_generation_failures', '42501');
select set_config('request.headers', '{}', false);
select pg_temp.assert_rejected($q$insert into public.client_boot_errors(kind) values ('error')$q$, '23514');
select set_config('request.headers', '{"x-forwarded-for":"invalid"}', false);
select pg_temp.assert_rejected($q$insert into public.client_boot_errors(kind) values ('error')$q$, '23514');
set role service_role;
select pg_temp.assert_rejected($q$insert into public.story_generation_failures(stage, provider_attempts) values ('edge', to_jsonb(repeat('a', 4097)))$q$, '23514');
insert into public.story_generation_failures(stage) values ('edge');
reset role;
-- Expired buckets are removed. Current traffic still logs after the window passes.
update diagnostic_private.insert_buckets set minute = minute - interval '3 minutes',
  fingerprint = md5(fingerprint || 'expired');
set role anon;
select set_config('request.headers', '{"x-forwarded-for":"192.0.2.10"}', false);
insert into public.client_boot_errors(kind) values ('boot_timeout');
reset role;
do $$ begin
  if (select count(*) from diagnostic_private.insert_buckets) <> 1 then
    raise exception 'Expired rate buckets were not cleaned up';
  end if;
  if (select count(*) from public.client_boot_errors) <> 31 or
     (select count(*) from public.story_generation_failures) <> 3 then
    raise exception 'Expected diagnostic rows were lost or spam was accepted';
  end if;
end $$;
