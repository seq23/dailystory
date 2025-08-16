-- Add image cache metadata to saved stories table
ALTER TABLE saved_stories ADD COLUMN image_cache_metadata JSONB DEFAULT '{}' NOT NULL;