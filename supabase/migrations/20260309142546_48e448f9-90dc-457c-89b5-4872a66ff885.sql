-- Drop the policy that lets users update their own subscriber records (privilege escalation risk)
DROP POLICY IF EXISTS "subscribers_update_own" ON public.subscribers;

-- Replace with service-role-only update policy
CREATE POLICY "subscribers_update_service_only"
ON public.subscribers
FOR UPDATE
TO public
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);