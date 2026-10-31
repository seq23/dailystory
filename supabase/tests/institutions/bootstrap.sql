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
