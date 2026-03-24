CREATE POLICY "users_view_own_sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own_sessions" ON public.user_sessions
  FOR DELETE USING (auth.uid() = user_id);