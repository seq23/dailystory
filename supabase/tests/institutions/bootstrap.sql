-- Disposable PostgreSQL only. No production configuration or real identities.
-- Model Supabase's application roles, permissive legacy table defaults, and a
-- restricted postgres login on stock PostgreSQL. Assertions run by SET ROLE,
-- never as the image administrator or with BYPASSRLS.
create role anon nologin;
create role authenticated nologin;
create role postgres login noinherit;
alter default privileges in schema public grant all on tables to anon, authenticated;
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to authenticated;
grant execute on function auth.uid() to authenticated;
-- Minimal family tables and the service role, so the app-reading migration
-- (20261031210000) attaches its triggers to the same shapes as production.
create role service_role nologin bypassrls;
create table public.child_profiles (id uuid primary key default gen_random_uuid(), parent_user_id uuid not null references auth.users on delete cascade, display_name text not null, reading_grade text);
create table public.stories (id uuid primary key default gen_random_uuid(), title text not null);
create table public.reading_sessions (id uuid primary key default gen_random_uuid(), user_id uuid not null, child_profile_id uuid references public.child_profiles on delete set null, story_id uuid references public.stories, started_at timestamptz not null default now(), completed_at timestamptz, time_spent integer, words_read integer);
create table public.quiz_attempts (id uuid primary key default gen_random_uuid(), user_id uuid not null, child_profile_id uuid, details jsonb not null default '{}', score integer not null default 0, total_questions integer not null default 0, created_at timestamptz not null default now());
