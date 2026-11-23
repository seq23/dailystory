-- d10 security audit (23 Nov 2026): performance_metrics had an INSERT policy WITH CHECK (true), so
-- anyone holding the public anon key could write any row, for any user_id, as often as they liked
-- (fake metrics, table bloat, a row under another family's user id). Nothing in the app or the
-- functions writes to this table; the service role bypasses RLS and keeps working without a policy.
-- Additive only: the table, its rows and the "view their own metrics" policy are untouched.
-- Guard: supabase/tests/performance_metrics/insert.sql (run by scripts/test-institutions-db.sh).
DROP POLICY IF EXISTS "System can insert metrics" ON public.performance_metrics;
