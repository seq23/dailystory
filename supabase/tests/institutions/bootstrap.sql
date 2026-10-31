-- Disposable PostgreSQL only. No production configuration or real identities.
-- Supabase PostgreSQL image supplies anon/authenticated roles. The postgres
-- login is not a superuser on Linux; normalize that fact across image platforms.
revoke authenticated from postgres;
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to authenticated;
grant execute on function auth.uid() to authenticated;
