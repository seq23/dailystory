
-- Add explicit INSERT policy: only service_role can create consent records
CREATE POLICY "parental_consents_insert_service_only"
ON public.parental_consents
FOR INSERT
TO public
WITH CHECK (auth.role() = 'service_role'::text);

-- Add explicit UPDATE policy: only service_role can update consent records
CREATE POLICY "parental_consents_update_service_only"
ON public.parental_consents
FOR UPDATE
TO public
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

-- Add explicit DELETE policy: only service_role can delete consent records
CREATE POLICY "parental_consents_delete_service_only"
ON public.parental_consents
FOR DELETE
TO public
USING (auth.role() = 'service_role'::text);
