-- Ops reports leave pg_cron (23 Nov 2026). Safe to reapply.
-- monthly-traffic-alert called the traffic-alert function with the public anon key, so anyone
-- holding that key could make it email the privacy inbox; quarterly-cost-report carried a
-- service key in its command. Both functions now answer only the OPS_CRON_SECRET header, sent
-- by .github/workflows/ops-reports.yml. Removing a schedule changes no business record.
do $$
declare
  j record;
begin
  if to_regclass('cron.job') is null then
    raise notice 'pg_cron is not installed; nothing to unschedule';
    return;
  end if;
  for j in select jobid, jobname from cron.job where jobname in ('monthly-traffic-alert', 'quarterly-cost-report') loop
    perform cron.unschedule(j.jobid);
    raise notice 'unscheduled %', j.jobname;
  end loop;
end
$$;
