-- Fix character_consistency_cache table - add missing id column as primary key
ALTER TABLE character_consistency_cache 
ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY;

-- Create a composite unique constraint to prevent duplicate session/character combinations
ALTER TABLE character_consistency_cache 
ADD CONSTRAINT character_consistency_cache_unique_key 
UNIQUE (session_id, character_key);