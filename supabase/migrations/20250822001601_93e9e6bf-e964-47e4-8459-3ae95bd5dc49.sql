-- Fix feedback table RLS - remove ability to see other users' feedback
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.feedback;
CREATE POLICY "Users can view their own feedback" ON public.feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Fix discount codes table RLS - remove public access
DROP POLICY IF EXISTS "Anyone can view active discount codes" ON public.discount_codes;
CREATE POLICY "Service role can access discount codes" ON public.discount_codes
  FOR ALL USING (auth.role() = 'service_role');