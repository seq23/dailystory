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
# The deployment lane permits reapplication: prove it preserves populated tables.
docker exec "$container" pg_dump -U "$test_db_user" -d institutions_test --data-only --inserts --table='public.institution_*' > "$test_dir/before.sql"
docker exec -i "$container" psql -d institutions_test -U "$test_db_user" -v ON_ERROR_STOP=1 -q < "$migration"
docker exec "$container" pg_dump -U "$test_db_user" -d institutions_test --data-only --inserts --table='public.institution_*' > "$test_dir/after.sql"
# Compare actual INSERT data only, excluding pg_dump's random restriction tokens.
diff <(rg '^INSERT INTO' "$test_dir/before.sql") <(rg '^INSERT INTO' "$test_dir/after.sql")
echo 'Migration reapplication preserved institutional data.'

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
