\set ON_ERROR_STOP on
-- Disposable PostgreSQL only: the production shapes redeem_discount_code touches. Fixture ids only.
-- auth.users carries an email in Supabase; the shared bootstrap models only the id.
alter table auth.users add column if not exists email text;
create or replace function public.update_updated_at_column() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
-- subscribers: its CREATE (20250731184048) plus the columns later migrations added.
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text not null unique,
  stripe_customer_id text,
  subscribed boolean not null default false,
  subscription_tier text,
  subscription_end timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.subscribers
  add column if not exists discount_code_pending text,
  add column if not exists discount_activated_at timestamptz,
  add column if not exists discount_activated boolean default false,
  add column if not exists override_premium boolean default false,
  add column if not exists override_tier text,
  add column if not exists override_end timestamptz,
  add column if not exists override_reason text,
  add column if not exists override_set_by text;
alter table public.subscribers enable row level security;
