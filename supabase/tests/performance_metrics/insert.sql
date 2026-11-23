\set ON_ERROR_STOP on
\set ECHO errors
-- performance_metrics after 20261123190000_performance_metrics_no_public_insert.sql. Runs as the
-- image administrator; the table and its original policies come from the production migration
-- (20250805053503), extracted by scripts/test-institutions-db.sh. test_assert comes from
-- supabase/tests/institutions/access.sql. Fixture ids only.
insert into auth.users (id) values ('80000000-0000-0000-0000-000000000001'), ('80000000-0000-0000-0000-000000000002') on conflict do nothing;

-- A stranger with the anon key cannot write a row.
set role anon;
do $$ begin
  begin insert into public.performance_metrics (metric_name, metric_value) values ('forged', 1); raise exception 'FAIL anon inserts a metrics row'; exception when insufficient_privilege then null; end;
end $$;
reset role;

-- A signed-in account cannot write a row, neither under its own id nor under another family's.
set role authenticated;
set request.jwt.claim.sub = '80000000-0000-0000-0000-000000000001';
do $$ begin
  begin insert into public.performance_metrics (metric_name, metric_value, user_id) values ('own', 1, '80000000-0000-0000-0000-000000000001'); raise exception 'FAIL a signed-in account inserts its own metrics row'; exception when insufficient_privilege then null; end;
  begin insert into public.performance_metrics (metric_name, metric_value, user_id) values ('other', 1, '80000000-0000-0000-0000-000000000002'); raise exception 'FAIL a signed-in account inserts a row under another user id'; exception when insufficient_privilege then null; end;
end $$;
reset role;

-- The service role (edge functions) still writes, and a family still reads only its own rows.
set role service_role;
insert into public.performance_metrics (metric_name, metric_value, user_id) values
  ('server', 2, '80000000-0000-0000-0000-000000000001'), ('server', 3, '80000000-0000-0000-0000-000000000002');
reset role;
set role authenticated;
set request.jwt.claim.sub = '80000000-0000-0000-0000-000000000001';
select public.test_assert((select count(*) = 1 from public.performance_metrics), 'a signed-in account reads only its own metrics row');
reset role;
reset request.jwt.claim.sub;

-- Additive: the rows written before the change are still there.
select public.test_assert((select count(*) >= 3 from public.performance_metrics), 'existing performance_metrics rows are kept');
