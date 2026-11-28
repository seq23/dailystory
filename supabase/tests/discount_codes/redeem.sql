\set ON_ERROR_STOP on
\set ECHO errors
-- Discount codes (migration 20261127140000_discount_code_redemptions.sql), one at a time.
-- The parallel cases run from scripts/test-institutions-db.sh. Fixture ids only. test_assert
-- comes from supabase/tests/institutions/access.sql (run earlier in the same database).
insert into auth.users (id, email) values
  ('d0000000-0000-4000-8000-000000000001', 'one@example.test'),
  ('d0000000-0000-4000-8000-000000000002', 'two@example.test'),
  ('d0000000-0000-4000-8000-000000000003', 'three@example.test'),
  ('d0000000-0000-4000-8000-000000000004', 'four@example.test'),
  ('d0000000-0000-4000-8000-000000000005', 'five@example.test'),
  ('d0000000-0000-4000-8000-000000000006', 'payer@example.test'),
  ('d0000000-0000-4000-8000-000000000007', 'legacy@example.test');
insert into public.discount_codes (code, description, duration_days, max_uses, active) values
  ('TESTOPEN90', 'unlimited test code', 90, null, true),
  ('TESTONCE', 'one-use test code', 30, 1, true),
  ('TESTOFF', 'inactive test code', 30, null, false);

create or replace function pg_temp.redeem(u text, c text) returns text language sql as $$
  select status from public.redeem_discount_code(u::uuid, c) $$;
create or replace function pg_temp.uses(c text) returns int language sql as $$
  select current_uses from public.discount_codes where code = c $$;

-- A first redemption: Premium on a new subscriber row, one use taken, one redemption row.
do $$ declare r record; begin
  select * into r from public.redeem_discount_code('d0000000-0000-4000-8000-000000000001', ' testopen 90 ');
  perform public.test_assert(r.status = 'granted' and r.code = 'TESTOPEN90' and r.duration_days = 90, 'a typed code (any case, spaces) is granted');
  perform public.test_assert(r.premium_until between now() + interval '89 days 23 hours' and now() + interval '90 days 1 hour', 'Premium runs for the code''s days');
  perform public.test_assert(pg_temp.uses('TESTOPEN90') = 1, 'one use is counted');
  perform public.test_assert((select override_premium and discount_activated and subscribed and email = 'one@example.test' from public.subscribers where user_id = 'd0000000-0000-4000-8000-000000000001'), 'the account''s own row gets Premium, with its auth email');
  perform public.test_assert((select count(*) = 1 from public.discount_code_redemptions where user_id = 'd0000000-0000-4000-8000-000000000001'), 'one redemption row');
end $$;

-- Once per account: the same code again, or another code, changes nothing.
do $$ begin
  perform public.test_assert(pg_temp.redeem('d0000000-0000-4000-8000-000000000001', 'TESTOPEN90') = 'already', 'the same code twice is refused');
  perform public.test_assert(pg_temp.redeem('d0000000-0000-4000-8000-000000000001', 'TESTONCE') = 'already', 'a second code on the same account is refused');
  perform public.test_assert(pg_temp.uses('TESTOPEN90') = 1 and pg_temp.uses('TESTONCE') = 0, 'a refusal takes no use');
end $$;

-- An account that used a code before this table existed keeps its one use.
insert into public.subscribers (user_id, email, discount_activated) values ('d0000000-0000-4000-8000-000000000007', 'legacy@example.test', true);
do $$ begin
  perform public.test_assert(pg_temp.redeem('d0000000-0000-4000-8000-000000000007', 'TESTOPEN90') = 'already', 'a legacy redemption counts');
  perform public.test_assert(not exists (select 1 from public.discount_code_redemptions where user_id = 'd0000000-0000-4000-8000-000000000007'), 'no new row for it');
end $$;

-- No default and nothing for a bad request.
do $$ begin
  perform public.test_assert(pg_temp.redeem('d0000000-0000-4000-8000-000000000002', '') = 'invalid', 'an empty code is invalid');
  perform public.test_assert(pg_temp.redeem('d0000000-0000-4000-8000-000000000002', null) = 'invalid', 'a null code is invalid');
  perform public.test_assert(pg_temp.redeem('d0000000-0000-4000-8000-000000000002', 'TESTOFF') = 'invalid', 'an inactive code is invalid');
  perform public.test_assert(pg_temp.redeem('d0000000-0000-4000-8000-000000000002', 'NOSUCH') = 'invalid', 'an unknown code is invalid');
  perform public.test_assert(pg_temp.redeem('d0000000-0000-4000-8000-0000000000ff', 'TESTOPEN90') = 'invalid', 'an account that does not exist gets nothing');
  perform public.test_assert(pg_temp.uses('TESTOPEN90') = 1, 'no use taken by any of them');
end $$;

-- max_uses: the last use goes to one account; the next is refused and leaves nothing behind.
do $$ begin
  perform public.test_assert(pg_temp.redeem('d0000000-0000-4000-8000-000000000002', 'TESTONCE') = 'granted', 'the one use is granted');
  perform public.test_assert(pg_temp.redeem('d0000000-0000-4000-8000-000000000003', 'TESTONCE') = 'exhausted', 'a used-up code is refused');
  perform public.test_assert(pg_temp.uses('TESTONCE') = 1, 'uses never pass max_uses');
  perform public.test_assert(not exists (select 1 from public.discount_code_redemptions where user_id = 'd0000000-0000-4000-8000-000000000003'), 'the refused account has no redemption row');
  perform public.test_assert(not exists (select 1 from public.subscribers where user_id = 'd0000000-0000-4000-8000-000000000003'), 'and no Premium');
  perform public.test_assert(pg_temp.redeem('d0000000-0000-4000-8000-000000000003', 'TESTOPEN90') = 'granted', 'a refused account can still use another code');
end $$;

-- Another account's row holds this email: nothing is written to it, nothing is counted.
insert into public.subscribers (user_id, email, subscribed) values ('d0000000-0000-4000-8000-000000000005', 'four@example.test', false);
do $$ declare before int := pg_temp.uses('TESTOPEN90'); begin
  perform public.test_assert(pg_temp.redeem('d0000000-0000-4000-8000-000000000004', 'TESTOPEN90') = 'account_mismatch', 'a row of another account is never taken over');
  perform public.test_assert(pg_temp.uses('TESTOPEN90') = before, 'no use taken');
  perform public.test_assert(not exists (select 1 from public.discount_code_redemptions where user_id = 'd0000000-0000-4000-8000-000000000004'), 'no redemption row');
  perform public.test_assert((select not coalesce(override_premium, false) from public.subscribers where email = 'four@example.test'), 'the other account''s row is untouched');
end $$;

-- A paying parent who also redeems keeps her subscription and her billing link.
insert into public.subscribers (user_id, email, stripe_customer_id, subscribed, subscription_tier, subscription_end)
values ('d0000000-0000-4000-8000-000000000006', 'payer@example.test', 'cus_fixture_payer', true, 'Monthly Premium', now() + interval '20 days');
do $$ begin
  perform public.test_assert(pg_temp.redeem('d0000000-0000-4000-8000-000000000006', 'TESTOPEN90') = 'granted', 'a payer may redeem');
  perform public.test_assert((select subscribed and stripe_customer_id = 'cus_fixture_payer' from public.subscribers where user_id = 'd0000000-0000-4000-8000-000000000006'), 'her subscription and billing link stay');
end $$;

-- Only the service role may call it or read the table.
do $$ declare refused boolean; begin
  begin
    set local role authenticated;
    perform public.redeem_discount_code('d0000000-0000-4000-8000-000000000002', 'TESTOPEN90');
    refused := false;
  exception when insufficient_privilege then refused := true; end;
  reset role;
  perform public.test_assert(refused, 'a signed-in caller cannot run the function');
  begin
    set local role anon;
    perform 1 from public.discount_code_redemptions;
    refused := false;
  exception when insufficient_privilege then refused := true; end;
  reset role;
  perform public.test_assert(refused, 'anon cannot read redemptions');
end $$;
