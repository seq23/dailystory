#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# A network-isolated, disposable local database; no production keys or URLs used.
image=public.ecr.aws/supabase/postgres:17.11.0.006
container="t2r-institutions-test-$$"
test_db_user="${INSTITUTIONS_TEST_DB_USER:-supabase_admin}"
trap 'docker rm -f "$container" >/dev/null 2>&1 || true' EXIT
docker run -d --rm --network none --name "$container" -e POSTGRES_PASSWORD=fixture-local-only "$image" >/dev/null
for attempt in {1..30}; do
  if docker exec "$container" pg_isready -U postgres >/dev/null 2>&1; then break; fi
  sleep 1
done
docker exec "$container" createdb -U supabase_admin institutions_test
docker exec -i "$container" psql -d institutions_test -U supabase_admin -v ON_ERROR_STOP=1 -q < supabase/tests/institutions/bootstrap.sql
# The image administrator must be able to assume the real application role.
# INSTITUTIONS_TEST_DB_USER=postgres reproduces the Linux bootstrap regression.
docker exec "$container" psql -d institutions_test -U "$test_db_user" -v ON_ERROR_STOP=1 -q -c 'set role authenticated; reset role;'
migration="${INSTITUTIONS_MIGRATION:-supabase/migrations/20261031050519_institutions.sql}"
docker exec -i "$container" psql -d institutions_test -U "$test_db_user" -v ON_ERROR_STOP=1 -q < "$migration"
docker exec -i "$container" psql -d institutions_test -U "$test_db_user" -v ON_ERROR_STOP=1 -q < supabase/tests/institutions/access.sql
# The deployment lane permits reapplication: prove it preserves populated tables.
docker exec "$container" pg_dump -U "$test_db_user" -d institutions_test --data-only --inserts --table='public.institution_*' > "/tmp/$container-before.sql"
docker exec -i "$container" psql -d institutions_test -U "$test_db_user" -v ON_ERROR_STOP=1 -q < "$migration"
docker exec "$container" pg_dump -U "$test_db_user" -d institutions_test --data-only --inserts --table='public.institution_*' > "/tmp/$container-after.sql"
# Compare actual INSERT data only, excluding pg_dump's random restriction tokens.
diff <(rg '^INSERT INTO' "/tmp/$container-before.sql") <(rg '^INSERT INTO' "/tmp/$container-after.sql")
rm "/tmp/$container-before.sql" "/tmp/$container-after.sql"
echo 'Migration reapplication preserved institutional data.'
