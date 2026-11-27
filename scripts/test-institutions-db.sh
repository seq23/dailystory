#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# A network-isolated, disposable local database; no production keys or URLs used.
# The suite needs PostgreSQL 17, not Supabase's full service image. Pin the
# multi-platform official image so CI avoids the public ECR quota dependency.
image=postgres:17-alpine@sha256:266d3c257594e195b309ae9d1805e54c788f1d7b375f56bf6c367aac6c917e7b
container="t2r-institutions-test-$$"
test_db_user="${INSTITUTIONS_TEST_DB_USER:-supabase_admin}"
test_dir=$(mktemp -d)
trap 'docker rm -f "$container" >/dev/null 2>&1 || true; rm -rf "$test_dir"' EXIT
docker run -d --rm --network none --name "$container" -e POSTGRES_USER=supabase_admin -e POSTGRES_PASSWORD=fixture-local-only "$image" >/dev/null
ready=false
for attempt in {1..30}; do
  # initdb starts a temporary socket-only server, then shuts it down. Wait for
  # the final TCP listener, so that temporary readiness cannot race createdb.
  if docker exec "$container" pg_isready -h 127.0.0.1 -U supabase_admin -d postgres >/dev/null 2>&1; then ready=true; break; fi
  sleep 1
done
if [ "$ready" != true ]; then
  docker logs "$container" >&2
  echo 'Disposable PostgreSQL did not become ready.' >&2
  exit 1
fi
docker exec "$container" createdb -U supabase_admin institutions_test
docker exec -i "$container" psql -d institutions_test -U supabase_admin -v ON_ERROR_STOP=1 -q < supabase/tests/institutions/bootstrap.sql
# The image administrator must be able to assume the real application role.
# INSTITUTIONS_TEST_DB_USER=postgres reproduces the Linux bootstrap regression.
docker exec "$container" psql -d institutions_test -U "$test_db_user" -v ON_ERROR_STOP=1 -q -c 'set role authenticated; reset role;'
migration="${INSTITUTIONS_MIGRATION:-supabase/migrations/20261031050519_institutions.sql}"
docker exec -i "$container" psql -d institutions_test -U "$test_db_user" -v ON_ERROR_STOP=1 -q < "$migration"
docker exec -i "$container" psql -d institutions_test -U "$test_db_user" -v ON_ERROR_STOP=1 -q < supabase/tests/institutions/access.sql
# Part two: in-app reading as source 'app', app-profile links and the AI privacy lane.
app_migration="${INSTITUTIONS_APP_MIGRATION:-supabase/migrations/20261031210000_institution_app_reading.sql}"
docker exec -i "$container" psql -d institutions_test -U "$test_db_user" -v ON_ERROR_STOP=1 -q < "$app_migration"
docker exec -i "$container" psql -d institutions_test -U "$test_db_user" -v ON_ERROR_STOP=1 -q < supabase/tests/institutions/app_reading.sql
# The deployment lane permits reapplication: prove it preserves populated tables.
docker exec "$container" pg_dump -U "$test_db_user" -d institutions_test --data-only --inserts --table='public.institution_*' > "$test_dir/before.sql"
docker exec -i "$container" psql -d institutions_test -U "$test_db_user" -v ON_ERROR_STOP=1 -q < "$migration"
docker exec -i "$container" psql -d institutions_test -U "$test_db_user" -v ON_ERROR_STOP=1 -q < "$app_migration"
docker exec "$container" pg_dump -U "$test_db_user" -d institutions_test --data-only --inserts --table='public.institution_*' > "$test_dir/after.sql"
# Compare actual INSERT data only, excluding pg_dump's random restriction tokens.
# grep, not rg: CI runners have no ripgrep, and an empty comparison would pass unseen.
before_rows=$(grep -c '^INSERT INTO' "$test_dir/before.sql" || true)
if [ "${before_rows:-0}" -lt 10 ]; then echo "Reapply comparison has only ${before_rows:-0} rows" >&2; exit 1; fi
diff <(grep '^INSERT INTO' "$test_dir/before.sql") <(grep '^INSERT INTO' "$test_dir/after.sql")
grep -q "'app'" "$test_dir/before.sql" || { echo 'Reapply comparison holds no app rows' >&2; exit 1; }
echo 'Migration reapplication preserved institutional data, app rows included.'

# Exercise the real anonymous insert path and reapply the additive logging migration.
for diagnostic_table in client_boot_errors story_generation_failures; do
  case "$diagnostic_table" in
    client_boot_errors) diagnostic_base=supabase/migrations/20261026180000_client_boot_errors.sql ;;
    story_generation_failures) diagnostic_base=supabase/migrations/20261026220000_story_generation_failures.sql ;;
  esac
  docker exec -i "$container" psql -d institutions_test -U supabase_admin -v ON_ERROR_STOP=1 -q < "$diagnostic_base"
done
diagnostic_migration="${DIAGNOSTICS_MIGRATION:-supabase/migrations/20261031132701_guard_anonymous_error_logging.sql}"
docker exec -i "$container" psql -d institutions_test -U supabase_admin -v ON_ERROR_STOP=1 -q < "$diagnostic_migration"
docker exec -i "$container" psql -d institutions_test -U supabase_admin -v ON_ERROR_STOP=1 -q < supabase/migrations/20261031134327_pin_diagnostic_quota_timezone.sql
docker exec -i "$container" psql -d institutions_test -U supabase_admin -v ON_ERROR_STOP=1 -q < supabase/tests/diagnostics/access.sql
docker exec -i "$container" psql -d institutions_test -U supabase_admin -v ON_ERROR_STOP=1 -q < "$diagnostic_migration"
docker exec -i "$container" psql -d institutions_test -U supabase_admin -v ON_ERROR_STOP=1 -q < supabase/migrations/20261031134327_pin_diagnostic_quota_timezone.sql
docker exec "$container" psql -d institutions_test -U supabase_admin -v ON_ERROR_STOP=1 -q -c "do \$\$ begin if (select count(*) from public.client_boot_errors) <> 31 then raise exception 'Diagnostic reapplication lost data'; end if; end \$\$;"
echo 'Anonymous diagnostic size, rate, access, and reapplication checks passed.'

# Free read-aloud practice per local day: limits, local date, zone change cap, access, reapply.
read_aloud_migration="${READ_ALOUD_MIGRATION:-supabase/migrations/20261122120000_read_aloud_practice.sql}"
read_aloud_reason_migration="${READ_ALOUD_REASON_MIGRATION:-supabase/migrations/20261122180000_read_aloud_refusal_reason.sql}"
docker exec -i "$container" psql -d institutions_test -U supabase_admin -v ON_ERROR_STOP=1 -q < "$read_aloud_migration"
docker exec -i "$container" psql -d institutions_test -U supabase_admin -v ON_ERROR_STOP=1 -q < "$read_aloud_reason_migration"
docker exec -i "$container" psql -d institutions_test -U supabase_admin -v ON_ERROR_STOP=1 -q < supabase/tests/read_aloud/practice.sql
docker exec -i "$container" psql -d institutions_test -U supabase_admin -v ON_ERROR_STOP=1 -q < "$read_aloud_migration"
docker exec -i "$container" psql -d institutions_test -U supabase_admin -v ON_ERROR_STOP=1 -q < "$read_aloud_reason_migration"
docker exec "$container" psql -d institutions_test -U supabase_admin -v ON_ERROR_STOP=1 -q -c "do \$\$ begin if (select count(*) from public.read_aloud_practice) < 20 then raise exception 'Read-aloud reapplication lost data'; end if; end \$\$;"
echo 'Read-aloud practice limits, refusal reasons, local day, zone cap, access and reapplication checks passed.'

# Parent incident notices: one send per incident, version and parent; retries never send twice;
# app roles shut out; a row from before versions stops the follow-up migration; reapply keeps rows.
incident_migration="${INCIDENT_MIGRATION:-supabase/migrations/20261123180000_incident_notices.sql}"
versions_migration="${VERSIONS_MIGRATION:-supabase/migrations/20261123200000_incident_notice_versions.sql}"
psql_in() { docker exec -i "$container" psql -d institutions_test -U supabase_admin -v ON_ERROR_STOP=1 -q "$@"; }
docker exec "$container" psql -d institutions_test -U supabase_admin -v ON_ERROR_STOP=1 -q -c "create table if not exists public.data_breach_log (id uuid primary key default gen_random_uuid(), breach_description text not null, data_types_affected text[] not null default '{}', users_affected_count integer default 0, severity text not null default 'low', remediation_steps text, status text not null default 'detected', logged_by text, users_notified_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now());"
psql_in < "$incident_migration"
# A row sent before versions existed cannot be matched to one: the follow-up stops, changing nothing.
psql_in -c "insert into public.incident_notices (incident_id, parent_user_id, status) values ('2026-11-old', gen_random_uuid(), 'sent');"
if out=$(psql_in --single-transaction < "$versions_migration" 2>&1); then
  echo "The versions migration ran over a row with no version"; exit 1
fi
grep -q 'NAMED STOP INCIDENT_ROWS_WITHOUT_VERSION' <<<"$out" || { echo "Expected the named stop, got: $out"; exit 1; }
psql_in -c "do \$\$ begin if exists (select 1 from information_schema.columns where table_name = 'incident_notices' and column_name = 'notice_version') then raise exception 'the stopped migration left a column behind'; end if; end \$\$;"
psql_in -c "delete from public.incident_notices where incident_id = '2026-11-old';"
psql_in --single-transaction < "$versions_migration"
psql_in < supabase/tests/incident_notices/claim.sql
psql_in < "$incident_migration"
psql_in --single-transaction < "$versions_migration"
docker exec "$container" psql -d institutions_test -U supabase_admin -v ON_ERROR_STOP=1 -q -c "do \$\$ begin if (select count(*) from public.incident_notices) <> 4 or (select count(*) from public.incident_notice_versions) <> 3 then raise exception 'Incident reapplication lost data'; end if; if exists (select 1 from pg_proc where proname = 'incident_notice_claim' and pronargs = 2) then raise exception 'reapply brought back the old claim'; end if; end \$\$;"
echo 'Incident notice claims, retries, access and reapplication checks passed.'

# performance_metrics: no public INSERT (d10 audit). The table and its original policies come from
# the production migration itself, so the "before" state is the real one, not a hand copy.
metrics_base=supabase/migrations/20250805053503_4e55a0e6-bee1-4150-99ee-46da857a037f.sql
metrics_migration="${METRICS_MIGRATION:-supabase/migrations/20261123190000_performance_metrics_no_public_insert.sql}"
# Production has no performance_metrics table: the migration must apply there as a no-op.
docker exec -i "$container" psql -d institutions_test -U supabase_admin -v ON_ERROR_STOP=1 -q < "$metrics_migration"
sed -n '/^CREATE TABLE IF NOT EXISTS public.performance_metrics/,/^WITH CHECK (true);/p' "$metrics_base" \
  | docker exec -i "$container" psql -d institutions_test -U supabase_admin -v ON_ERROR_STOP=1 -q
# Before the change a stranger CAN insert: proves the test below would see the hole.
docker exec "$container" psql -d institutions_test -U supabase_admin -v ON_ERROR_STOP=1 -q \
  -c "set role anon; insert into public.performance_metrics (metric_name, metric_value) values ('before', 1); reset role;"
docker exec -i "$container" psql -d institutions_test -U supabase_admin -v ON_ERROR_STOP=1 -q < "$metrics_migration"
docker exec -i "$container" psql -d institutions_test -U supabase_admin -v ON_ERROR_STOP=1 -q < supabase/tests/performance_metrics/insert.sql
docker exec -i "$container" psql -d institutions_test -U supabase_admin -v ON_ERROR_STOP=1 -q < "$metrics_migration"
docker exec "$container" psql -d institutions_test -U supabase_admin -v ON_ERROR_STOP=1 -q -c "do \$\$ begin if (select count(*) from public.performance_metrics) <> 3 then raise exception 'performance_metrics reapplication lost data'; end if; end \$\$;"
echo 'performance_metrics refuses anon and signed-in inserts, keeps service writes, own-row reads and existing rows.'

# Discount codes (security audit B, 27 Nov 2026): once per account, max_uses kept under parallel
# load, no default code, service role only, reapply keeps rows. discount_codes comes from its real
# production CREATE; subscribers from the fixture (its CREATE plus the columns added later).
discount_base=supabase/migrations/20250816050626_6485f12b-dc94-4f83-8087-cf801157203b.sql
discount_migration="${DISCOUNT_MIGRATION:-supabase/migrations/20261127140000_discount_code_redemptions.sql}"
psql_in < supabase/tests/discount_codes/fixture.sql
sed -n '/^CREATE TABLE public.discount_codes/,/^);/p' "$discount_base" | psql_in
psql_in -c "do \$\$ begin if not exists (select 1 from information_schema.columns where table_name = 'discount_codes' and column_name = 'max_uses') then raise exception 'discount_codes base table not created'; end if; end \$\$;"
psql_in < "$discount_migration"
psql_in < supabase/tests/discount_codes/redeem.sql
psql_in -c "insert into public.discount_codes (code, description, duration_days, max_uses, active) values ('RACEONE', 'race', 30, 1, true), ('RACEOPEN', 'race', 30, null, true); insert into auth.users (id, email) select ('e0000000-0000-4000-8000-0000000000' || lpad(g::text, 2, '0'))::uuid, 'race' || g || '@example.test' from generate_series(1, 21) g;"
# Parallel calls start inside the container from one shell, so all 20 overlap (a docker exec each
# staggers them enough to run one at a time and hide a race). race CODE ID... prints one status a line.
docker exec -i "$container" sh -c 'cat > /tmp/race.sh' <<'RACE'
code=$1; shift
for id in "$@"; do
  printf "select status from public.redeem_discount_code(:'id', :'code');\n" |
    psql -d institutions_test -U supabase_admin -At -v ON_ERROR_STOP=1 -v id="$id" -v code="$code" 2>&1 &
done
wait
RACE
race() { docker exec "$container" sh /tmp/race.sh "$@"; }
# The race: 20 different accounts at once on a code with one use left -> exactly one gets it.
out=$(race RACEONE $(for g in $(seq 1 20); do printf "e0000000-0000-4000-8000-0000000000%02d " "$g"; done))
granted=$(grep -c '^granted$' <<<"$out" || true)
exhausted=$(grep -c '^exhausted$' <<<"$out" || true)
if [ "$granted" != 1 ] || [ "$exhausted" != 19 ]; then echo "20 parallel redemptions of a one-use code: granted=$granted exhausted=$exhausted (want 1 and 19)"; echo "$out"; exit 1; fi
psql_in -c "do \$\$ begin if (select current_uses from public.discount_codes where code = 'RACEONE') <> 1 or (select count(*) from public.discount_code_redemptions where code = 'RACEONE') <> 1 then raise exception 'the one-use race counted more than one'; end if; end \$\$;"
# One account, 20 requests at once on an unlimited code -> one redemption, one use.
out=$(race RACEOPEN $(for g in $(seq 1 20); do printf "e0000000-0000-4000-8000-000000000021 "; done))
granted=$(grep -c '^granted$' <<<"$out" || true)
already=$(grep -c '^already$' <<<"$out" || true)
if [ "$granted" != 1 ] || [ "$already" != 19 ]; then echo "20 parallel redemptions by one account: granted=$granted already=$already (want 1 and 19)"; echo "$out"; exit 1; fi
psql_in -c "do \$\$ begin if (select current_uses from public.discount_codes where code = 'RACEOPEN') <> 1 then raise exception 'one account took more than one use'; end if; end \$\$;"
before=$(docker exec "$container" psql -d institutions_test -U supabase_admin -At -c "select count(*) from public.discount_code_redemptions")
psql_in < "$discount_migration"
after=$(docker exec "$container" psql -d institutions_test -U supabase_admin -At -c "select count(*) from public.discount_code_redemptions")
if [ "$before" -lt 6 ] || [ "$before" != "$after" ]; then echo "discount redemptions before=$before after=$after on reapply"; exit 1; fi
echo 'Discount codes: once per account, max_uses held under 20 parallel redemptions, service role only, reapplication kept rows.'
