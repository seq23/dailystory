-- Ensure character_consistency_cache table has proper constraints
-- First check if there are any existing entries that would conflict
DELETE FROM character_consistency_cache WHERE session_id IS NULL OR character_key IS NULL;

-- Add primary key constraint
ALTER TABLE character_consistency_cache 
ADD PRIMARY KEY (session_id, character_key);