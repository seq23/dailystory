-- Phase 1: Update child_profiles table schema
-- Remove story_language_preference column (redundant - use parent's language)
ALTER TABLE public.child_profiles DROP COLUMN IF EXISTS story_language_preference;

-- Replace date_of_birth with birth_month and birth_year for privacy
ALTER TABLE public.child_profiles DROP COLUMN IF EXISTS date_of_birth;
ALTER TABLE public.child_profiles ADD COLUMN birth_month integer;
ALTER TABLE public.child_profiles ADD COLUMN birth_year integer;

-- Add personal preference columns
ALTER TABLE public.child_profiles ADD COLUMN favorite_color text;
ALTER TABLE public.child_profiles ADD COLUMN favorite_animal text;
ALTER TABLE public.child_profiles ADD COLUMN favorite_food text;
ALTER TABLE public.child_profiles ADD COLUMN hobbies text;

-- Add constraints for birth_month (1-12) and reasonable birth_year range
ALTER TABLE public.child_profiles ADD CONSTRAINT check_birth_month CHECK (birth_month >= 1 AND birth_month <= 12);
ALTER TABLE public.child_profiles ADD CONSTRAINT check_birth_year CHECK (birth_year >= 1900 AND birth_year <= EXTRACT(YEAR FROM CURRENT_DATE));