-- Anonymous diagnostics stay write-only. Enforce limits even on direct REST inserts.
-- No raw IP is retained; each minute has a different fingerprint.
begin;
create schema if not exists diagnostic_private;
revoke all on schema diagnostic_private from public, anon, authenticated;
create table if not exists diagnostic_private.insert_buckets (
  fingerprint text primary key,
  minute timestamptz not null,
  count integer not null check (count between 1 and 30)
);
alter table diagnostic_private.insert_buckets enable row level security;
revoke all on diagnostic_private.insert_buckets from public, anon, authenticated;
create index if not exists diagnostic_insert_buckets_minute_idx
  on diagnostic_private.insert_buckets (minute);

create or replace function diagnostic_private.guard_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  headers jsonb;
  client_ip inet;
  bucket_minute timestamptz := date_trunc('minute', clock_timestamp());
  bucket_fingerprint text;
  accepted integer;
begin
  if pg_column_size(new) > 8192 then
    raise check_violation using message = 'Diagnostic row exceeds 8192 bytes';
  end if;
  -- Server-side failures use a secret service-role key and have no browser IP.
  if current_setting('role', true) = 'service_role' then
    return new;
  end if;
  headers := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
  -- The API gateway supplies X-Forwarded-For; never accept an IP from the row.
  begin
    client_ip := nullif(trim(split_part(headers->>'x-forwarded-for', ',', 1)), '')::inet;
  exception when invalid_text_representation then
    raise check_violation using message = 'Diagnostic client IP is invalid';
  end;
  if client_ip is null then
    raise check_violation using message = 'Diagnostic client IP is required';
  end if;
  bucket_fingerprint := md5(host(client_ip) || '/' || bucket_minute::text);
  delete from diagnostic_private.insert_buckets where minute < bucket_minute - interval '2 minutes';
  -- Atomic increment serializes concurrent inserts; both tables share the quota.
  insert into diagnostic_private.insert_buckets as buckets (fingerprint, minute, count)
    values (bucket_fingerprint, bucket_minute, 1)
    on conflict (fingerprint) do update set count = buckets.count + 1
      where buckets.count < 30
    returning count into accepted;
  if accepted is null then
    raise sqlstate 'P0001' using message = 'Diagnostic limit is 30 rows per IP per minute';
  end if;
  new.created_at := clock_timestamp();
  return new;
end;
$$;
revoke all on function diagnostic_private.guard_insert() from public, anon, authenticated;

drop trigger if exists guard_diagnostic_insert on public.client_boot_errors;
create trigger guard_diagnostic_insert before insert on public.client_boot_errors
  for each row execute function diagnostic_private.guard_insert();
drop trigger if exists guard_diagnostic_insert on public.story_generation_failures;
create trigger guard_diagnostic_insert before insert on public.story_generation_failures
  for each row execute function diagnostic_private.guard_insert();

-- NOT VALID leaves historical rows untouched while checking every new row.
alter table public.story_generation_failures drop constraint if exists diagnostic_provider_attempts_size;
alter table public.story_generation_failures add constraint diagnostic_provider_attempts_size
  check (octet_length(provider_attempts::text) <= 4096) not valid;

drop policy if exists "anyone can report a boot error" on public.client_boot_errors;
create policy "anyone can report a boot error" on public.client_boot_errors for insert to anon, authenticated
  with check (octet_length(coalesce(message, '')) <= 2000);
drop policy if exists "anyone can report a story failure" on public.story_generation_failures;
create policy "anyone can report a story failure" on public.story_generation_failures for insert to anon, authenticated
  with check (octet_length(coalesce(provider_attempts::text, '')) <= 4096);

-- Narrow legacy default privileges as well as RLS. No client may read or mutate logs.
revoke all on public.client_boot_errors, public.story_generation_failures from public, anon, authenticated;
grant insert (kind, message, source, path, user_agent, build) on public.client_boot_errors to anon, authenticated;
grant insert (stage, error_type, message, provider_attempts, session_id, page_number, path, build)
  on public.story_generation_failures to anon, authenticated;
revoke all on sequence public.client_boot_errors_id_seq, public.story_generation_failures_id_seq from public, anon, authenticated;
grant usage on sequence public.client_boot_errors_id_seq, public.story_generation_failures_id_seq to anon, authenticated;
commit;
