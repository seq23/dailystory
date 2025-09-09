-- Add cultural feature persistence fields to character_consistency_cache table
ALTER TABLE public.character_consistency_cache 
ADD COLUMN selected_cultural_hair TEXT,
ADD COLUMN selected_cultural_features TEXT;