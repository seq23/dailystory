-- Tighten RLS on user_content_signatures: remove public/guest read access and enforce per-user access only
DROP POLICY IF EXISTS "Users can create their own content signatures" ON public.user_content_signatures;
DROP POLICY IF EXISTS "Users can delete their own content signatures" ON public.user_content_signatures;
DROP POLICY IF EXISTS "Users can update their own content signatures" ON public.user_content_signatures;
DROP POLICY IF EXISTS "Users can view their own content signatures" ON public.user_content_signatures;

-- Strict policies: only the authenticated user (auth.uid) can access rows where user_identifier equals their UID
CREATE POLICY "ucs_select_own" ON public.user_content_signatures
FOR SELECT
USING ((auth.uid())::text = user_identifier);

CREATE POLICY "ucs_insert_own" ON public.user_content_signatures
FOR INSERT
WITH CHECK ((auth.uid())::text = user_identifier);

CREATE POLICY "ucs_update_own" ON public.user_content_signatures
FOR UPDATE
USING ((auth.uid())::text = user_identifier)
WITH CHECK ((auth.uid())::text = user_identifier);

CREATE POLICY "ucs_delete_own" ON public.user_content_signatures
FOR DELETE
USING ((auth.uid())::text = user_identifier);
