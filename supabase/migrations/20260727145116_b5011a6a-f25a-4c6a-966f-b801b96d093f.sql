REVOKE ALL ON public.character_consistency_cache FROM anon, authenticated;
REVOKE ALL ON public.visual_details_cache FROM anon, authenticated;
GRANT ALL ON public.character_consistency_cache TO service_role;
GRANT ALL ON public.visual_details_cache TO service_role;