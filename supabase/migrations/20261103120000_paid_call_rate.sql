-- Paid-call rate limits (3 Nov 2026). Additive only; safe to reapply.
-- Every edge function that spends money per call (ElevenLabs / OpenAI narration,
-- speech-to-text, translation, spelling, quiz) checks the caller and then charges
-- one hit here before it calls the paid API. Cached audio is never charged.
-- Code: supabase/functions/_shared/paidCallGuard.ts (limits) and
-- supabase/functions/_shared/paidCallGuardDeno.ts (calls paid_call_hit).
-- Guard: src/test/guards/paid-call-guard.test.ts.

create table if not exists public.paid_call_rate (
  bucket text not null,              -- e.g. 'user:<uuid>|600', 'guestip:<hash>|86400', 'all:elevenlabs-tts|86400'
  window_start timestamptz not null, -- start of the fixed window the hits belong to
  hits integer not null default 0,
  primary key (bucket, window_start)
);

alter table public.paid_call_rate enable row level security;
-- No policies: only the service role (edge functions) reads or writes it.
revoke all on public.paid_call_rate from anon, authenticated;

-- Charge one hit to every bucket, all or nothing. p_buckets, p_windows (seconds) and
-- p_limits line up by position. Returns null when the call is allowed (and counted),
-- or the first bucket that is full (and nothing is counted: a refused call costs
-- nothing, so it does not use up the allowance).
create or replace function public.paid_call_hit(p_buckets text[], p_windows integer[], p_limits integer[])
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  i integer;
  ws timestamptz;
  n integer;
  over text := null;
begin
  if p_buckets is null or array_length(p_buckets, 1) is null
     or array_length(p_buckets, 1) <> array_length(p_windows, 1)
     or array_length(p_buckets, 1) <> array_length(p_limits, 1) then
    raise exception 'paid_call_hit: buckets, windows and limits must be non-empty and the same length';
  end if;

  begin
    for i in 1 .. array_length(p_buckets, 1) loop
      ws := to_timestamp(floor(extract(epoch from now()) / p_windows[i]) * p_windows[i]);
      insert into public.paid_call_rate as r (bucket, window_start, hits)
      values (p_buckets[i], ws, 1)
      on conflict (bucket, window_start) do update set hits = r.hits + 1
      returning r.hits into n;
      if n > p_limits[i] then
        over := p_buckets[i];
        raise exception using errcode = 'P0001', message = 'paid_call_over';
      end if;
    end loop;
  exception when sqlstate 'P0001' then
    -- The sub-block rolls back every increment made above: the refused call is not counted.
    if over is null then raise; end if;
    return over;
  end;

  -- Housekeeping, about one call in two hundred: windows older than two days are spent.
  if random() < 0.005 then
    delete from public.paid_call_rate where window_start < now() - interval '2 days';
  end if;
  return null;
end;
$$;

revoke all on function public.paid_call_hit(text[], integer[], integer[]) from public, anon, authenticated;
grant execute on function public.paid_call_hit(text[], integer[], integer[]) to service_role;
