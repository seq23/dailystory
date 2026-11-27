-- Discount codes are redeemed once per account, atomically (security audit B, 27 Nov 2026).
--
-- Before: activate-discount-code and apply-discount-code read the code, read the account's
-- subscriber row, wrote Premium, then wrote current_uses + 1 from the value they had read.
-- Two requests at once both passed every check, max_uses was never enforced in one of them,
-- and the count could be lost. Now both call public.redeem_discount_code, which in ONE
-- transaction claims the account's single redemption (a unique row per account), takes a
-- use only while uses remain (UPDATE ... WHERE current_uses < max_uses), and writes Premium.
-- Any step that fails rolls the others back.
--
-- Additive only: a new table, a new unique index and a new function. No existing code row
-- is edited, capped or switched off (SEQUOIA90 and the partner code stay as they are: her
-- ruling 27 Nov 2026, "Keep, once per person"). Safe to re-run.
-- Tests: supabase/tests/discount_codes/redeem.sql and the parallel runs in
-- scripts/test-institutions-db.sh; the edge path in src/test/edge/discount-and-billing.test.ts.

create table if not exists public.discount_code_redemptions (
  id uuid primary key default gen_random_uuid(),
  discount_code_id uuid not null references public.discount_codes(id),
  code text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  premium_until timestamptz not null,
  redeemed_at timestamptz not null default now()
);

-- One discount-code redemption per account, the rule discount_activated already stated.
create unique index if not exists discount_code_redemptions_one_per_account
  on public.discount_code_redemptions (user_id);

alter table public.discount_code_redemptions enable row level security;
revoke all on table public.discount_code_redemptions from public, anon, authenticated;
grant select, insert, delete on table public.discount_code_redemptions to service_role;

-- status: granted | already (this account has used a discount code) | invalid (no such
-- active code) | exhausted (no uses left) | account_mismatch (the subscriber row for this
-- email belongs to another account: nothing is written).
create or replace function public.redeem_discount_code(p_user_id uuid, p_code text)
returns table (status text, code text, duration_days integer, description text, premium_until timestamptz)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_norm text := upper(regexp_replace(coalesce(p_code, ''), '\s+', '', 'g'));
  v_row public.discount_codes%rowtype;
  v_email text;
  v_now timestamptz := now();
  v_until timestamptz;
  v_n integer;
begin
  if p_user_id is null or v_norm = '' then
    return query select 'invalid'::text, null::text, null::integer, null::text, null::timestamptz;
    return;
  end if;

  select u.email into v_email from auth.users u where u.id = p_user_id;
  if v_email is null then
    return query select 'invalid'::text, null::text, null::integer, null::text, null::timestamptz;
    return;
  end if;

  select * into v_row from public.discount_codes d where d.code = v_norm and d.active = true;
  if not found or v_row.duration_days is null or v_row.duration_days < 1 then
    return query select 'invalid'::text, null::text, null::integer, null::text, null::timestamptz;
    return;
  end if;

  -- An account that used a code before this table existed keeps its one use.
  if exists (select 1 from public.subscribers s where s.user_id = p_user_id and s.discount_activated is true) then
    return query select 'already'::text, v_row.code, v_row.duration_days, v_row.description, null::timestamptz;
    return;
  end if;

  v_until := v_now + make_interval(days => v_row.duration_days);

  begin
    -- 1. The account's single redemption. A second request for the same account waits on
    --    this row's unique key and then inserts nothing.
    insert into public.discount_code_redemptions (discount_code_id, code, user_id, premium_until)
    values (v_row.id, v_row.code, p_user_id, v_until)
    on conflict (user_id) do nothing;
    get diagnostics v_n = row_count;
    if v_n = 0 then
      return query select 'already'::text, v_row.code, v_row.duration_days, v_row.description, null::timestamptz;
      return;
    end if;

    -- 2. One use, only while uses remain. Parallel requests queue on the code's row lock and
    --    re-check the condition against the committed count.
    update public.discount_codes d
       set current_uses = d.current_uses + 1, updated_at = v_now
     where d.id = v_row.id and (d.max_uses is null or d.current_uses < d.max_uses);
    get diagnostics v_n = row_count;
    if v_n = 0 then
      raise exception 'T2R_CODE_EXHAUSTED' using errcode = 'P0001';
    end if;

    -- 3. Premium on this account's own subscriber row; never on a row of another account.
    update public.subscribers s
       set subscribed = true,
           subscription_tier = 'premium',
           subscription_end = v_until,
           override_premium = true,
           override_tier = 'premium',
           override_end = v_until,
           override_reason = 'Discount code: ' || v_row.code,
           override_set_by = 'system',
           discount_activated = true,
           discount_activated_at = v_now,
           discount_code_pending = null,
           updated_at = v_now
     where s.user_id = p_user_id;
    get diagnostics v_n = row_count;
    if v_n = 0 then
      insert into public.subscribers (user_id, email, subscribed, subscription_tier, subscription_end,
        override_premium, override_tier, override_end, override_reason, override_set_by,
        discount_activated, discount_activated_at, discount_code_pending, updated_at)
      values (p_user_id, v_email, true, 'premium', v_until,
        true, 'premium', v_until, 'Discount code: ' || v_row.code, 'system',
        true, v_now, null, v_now)
      on conflict (email) do nothing;
      get diagnostics v_n = row_count;
      if v_n = 0 then
        raise exception 'T2R_ACCOUNT_MISMATCH' using errcode = 'P0001';
      end if;
    end if;
  exception when sqlstate 'P0001' then
    -- The block's writes are undone: no redemption row, no use taken, no Premium.
    if sqlerrm = 'T2R_CODE_EXHAUSTED' then
      return query select 'exhausted'::text, v_row.code, null::integer, null::text, null::timestamptz;
      return;
    elsif sqlerrm = 'T2R_ACCOUNT_MISMATCH' then
      return query select 'account_mismatch'::text, v_row.code, null::integer, null::text, null::timestamptz;
      return;
    end if;
    raise;
  end;

  return query select 'granted'::text, v_row.code, v_row.duration_days, v_row.description, v_until;
end;
$$;

revoke all on function public.redeem_discount_code(uuid, text) from public, anon, authenticated;
grant execute on function public.redeem_discount_code(uuid, text) to service_role;
