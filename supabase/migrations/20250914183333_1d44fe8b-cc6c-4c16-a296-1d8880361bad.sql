-- Add missing details column to ai_prompt_debug_log table
ALTER TABLE public.ai_prompt_debug_log ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'::jsonb;