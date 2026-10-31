#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# A network-isolated, disposable local database; no production keys or URLs used.
image=public.ecr.aws/supabase/postgres:17.11.0.006
container="t2r-institutions-test-$$"
trap 'docker rm -f "$container" >/dev/null 2>&1 || true' EXIT
docker run -d --rm --network none --name "$container" -e POSTGRES_PASSWORD=fixture-local-only "$image" >/dev/null
for attempt in {1..30}; do
  if docker exec "$container" pg_isready -U postgres >/dev/null 2>&1; then break; fi
  sleep 1
done
docker exec "$container" createdb -U postgres institutions_test
docker exec -i "$container" psql -d institutions_test -U postgres -v ON_ERROR_STOP=1 -q < supabase/tests/institutions/bootstrap.sql
migration="${INSTITUTIONS_MIGRATION:-supabase/migrations/20261031050519_institutions.sql}"
docker exec -i "$container" psql -d institutions_test -U postgres -v ON_ERROR_STOP=1 -q < "$migration"
docker exec -i "$container" psql -d institutions_test -U postgres -v ON_ERROR_STOP=1 -q < supabase/tests/institutions/access.sql
# The deployment lane permits reapplication: prove it preserves populated tables.
docker exec "$container" pg_dump -U postgres -d institutions_test --data-only --inserts --table='public.institution_*' > "/tmp/$container-before.sql"
docker exec -i "$container" psql -d institutions_test -U postgres -v ON_ERROR_STOP=1 -q < "$migration"
docker exec "$container" pg_dump -U postgres -d institutions_test --data-only --inserts --table='public.institution_*' > "/tmp/$container-after.sql"
# Compare actual INSERT data only, excluding pg_dump's random restriction tokens.
diff <(rg '^INSERT INTO' "/tmp/$container-before.sql") <(rg '^INSERT INTO' "/tmp/$container-after.sql")
rm "/tmp/$container-before.sql" "/tmp/$container-after.sql"
echo 'Migration reapplication preserved institutional data.'
