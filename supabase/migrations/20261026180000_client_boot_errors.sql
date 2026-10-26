-- Client boot errors (26 Oct 2026). A family on a Windows PC saw every button on
-- time-2-read.com do nothing and left; we could not see why. The page now reports a
-- failed start or an uncaught error here, so the next one is visible without asking
-- the family. No personal data: browser, OS, page path, error text, timestamp.
create table if not exists public.client_boot_errors (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('error', 'rejection', 'boot_timeout', 'storage_fallback')),
  message text check (char_length(message) <= 500),
  source text check (char_length(source) <= 300),
  path text check (char_length(path) <= 200),
  user_agent text check (char_length(user_agent) <= 300),
  build text check (char_length(build) <= 60)
);

alter table public.client_boot_errors enable row level security;

-- Anyone may report; nobody but the service role may read.
drop policy if exists "anyone can report a boot error" on public.client_boot_errors;
create policy "anyone can report a boot error"
  on public.client_boot_errors for insert
  to anon, authenticated
  with check (true);
