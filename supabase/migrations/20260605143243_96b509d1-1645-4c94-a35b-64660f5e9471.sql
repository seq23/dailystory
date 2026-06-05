-- Restore EXECUTE on the one SECURITY DEFINER function that is referenced inside
-- an RLS policy. RLS policy expressions are evaluated as the querying role, so
-- `authenticated` must be able to execute validate_subscriber_access for the
-- subscribers SELECT policy (subscribers_select_validated) to work. The earlier
-- broad EXECUTE revoke removed this and silently broke subscriber reads (403 /
-- "permission denied for function validate_subscriber_access"), which made the
-- app report every account as "Subscription inactive".
GRANT EXECUTE ON FUNCTION public.validate_subscriber_access(uuid) TO authenticated;