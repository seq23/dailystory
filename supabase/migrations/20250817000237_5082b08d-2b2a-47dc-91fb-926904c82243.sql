-- Fix Evans' avatar to use correct gender pronouns
UPDATE child_profiles 
SET avatar = '{"type": "girl", "skinTone": "light"}'::jsonb 
WHERE display_name = 'Evans' AND avatar IS NULL;