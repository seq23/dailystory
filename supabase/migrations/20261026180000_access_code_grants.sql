-- Access code at sign-up gives Premium at once (Oct 2026). Before this, a code typed
-- on the sign-up form only lengthened the Stripe card-up-front trial, so an account
-- made with HOMESCHOOL15 stayed on "3 of 3 free stories" until checkout finished.
-- redeem-access-code now records a 'granted' row here (no Stripe session) and sets
-- subscribers.override_premium until expires_at. Idempotent: safe to apply twice.
-- Rules: supabase/functions/_shared/accessCodeRules.ts (decideGrant).
-- Pinned by src/test/guards/access-code-grant.test.ts.

alter table public.access_code_redemptions alter column stripe_session_id drop not null;
alter table public.access_code_redemptions add column if not exists expires_at timestamptz;

alter table public.access_code_redemptions drop constraint if exists access_code_redemptions_status_check;
alter table public.access_code_redemptions add constraint access_code_redemptions_status_check
  check (status in ('checkout_started', 'completed', 'granted'));

-- One code grant per account.
create unique index if not exists access_code_redemptions_one_grant_per_user
  on public.access_code_redemptions (user_id) where status = 'granted';

-- Signups per code now count grants too.
create or replace view public.access_code_signups with (security_invoker = true) as
select c.code,
       c.label,
       c.trial_days,
       c.active,
       count(r.id) as checkouts_started,
       count(r.id) filter (where r.status in ('completed', 'granted')) as signups
from public.access_codes c
left join public.access_code_redemptions r on r.access_code_id = c.id
group by c.id, c.code, c.label, c.trial_days, c.active;
revoke all on public.access_code_signups from anon, authenticated;
