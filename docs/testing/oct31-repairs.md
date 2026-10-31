# October repair verification

Run `npm run test:fast` with Node 20 or 22 and Docker. It batches both TypeScript
projects, every source unit test (including guards), entity validation, disposable
PostgreSQL tests, production prerender validation, and the development build.
Playwright files stay under their separate runner.

## Preview install discrepancy

A clean checkout of the baseline with `bun install --frozen-lockfile` followed by
`tsc --noEmit -p tsconfig.app.json` produced 18 TS2305 errors: the React testing
library could not re-export `fireEvent`, `screen`, `waitFor`, or `within`.
`@testing-library/dom` existed only as an implicit peer in npm's installed tree;
it was absent from the Bun lockfile. The Vite development build alone passed.
Declaring the DOM package explicitly and updating both locks made the same clean
Bun install, typecheck, and development build pass. The preview CI job now tests
that sequence. This is a locally reproduced cause; the hosted preview status
requires access to the editor and is not inferred from CI.

## Unit regression proof

The baseline's deterministic failures covered color normalization, a missing spy
assignment, obsolete placeholder/fantasy assertions, validation omissions, and
DOM assertions aimed at an inner span. The full suite also exposed a transient
school-access empty state while authentication was pending. Tests now assert
actual placeholder resolution, rejection details, fantasy allowance with violent
content rejected, and the styled interactive wrapper. Validation was repaired at
its source, including checks before sanitization truncates the submitted input.

Restoring each old implementation independently failed the corresponding tests:
color (2), profile completeness (1), input validation (20), theme validation (3),
auth loading (1), check-gate configuration (2), and spy setup (5). Restoring the
old test storage setup also reproduced the guest timer failure on Node 26.
After restoring the fixes, all 752 source tests passed.

## Anonymous diagnostic limits

The additive migration preserves the existing REST insert paths. Clients can
insert diagnostic columns only; they cannot select, update, delete, truncate,
set timestamps, or access the private counter table/function. Both tables share
an atomic quota of 30 rows per gateway-provided IP per calendar minute. Only a
minute-specific IP fingerprint is stored, and inserts remove buckets older than
two minutes. Missing or invalid IPs are rejected; server service-role logging
needs no browser IP. Provider details are capped at 4096 bytes and each inserted
row at 8192 bytes, alongside existing character limits. Historical rows are left
untouched, including when the migration is reapplied.

The disposable database tests exercise anonymous and authenticated logging,
service-role logging, text/JSON/row caps, a shared quota, bulk inserts, different
IPs, expiry, unavailable IPs, denied reads/mutations, and migration reapplication.
Removing the quota block caused the bulk-spam assertion to fail; the fixed
migration passed. Removing the row-size guard also failed its assertion. The migration ships through the existing main-branch pipeline;
no production SQL was executed manually.
