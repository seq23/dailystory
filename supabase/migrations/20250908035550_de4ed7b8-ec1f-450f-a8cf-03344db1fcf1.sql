-- Add composite primary key to character_consistency_cache table
ALTER TABLE character_consistency_cache 
ADD CONSTRAINT character_consistency_cache_pkey 
PRIMARY KEY (session_id, character_key);