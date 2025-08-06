-- Add missing columns to profiles table for enhanced profile data
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS difficulty_level text,
ADD COLUMN IF NOT EXISTS story_language_preference text DEFAULT 'en',
ADD COLUMN IF NOT EXISTS special_request text,
ADD COLUMN IF NOT EXISTS avatar jsonb DEFAULT '{"type": "boy", "skinTone": "medium"}'::jsonb,
ADD COLUMN IF NOT EXISTS favorite_color text,
ADD COLUMN IF NOT EXISTS favorite_animal text,
ADD COLUMN IF NOT EXISTS favorite_food text,
ADD COLUMN IF NOT EXISTS hobbies text;