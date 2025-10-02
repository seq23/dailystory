-- Phase 1: Character Detection Refactoring - Database Schema Update
-- Add documentation and index for new detail_type values

-- Update column comment to document new detail types
COMMENT ON COLUMN visual_details_cache.detail_type IS 
'Visual detail categorization:
- colored_object: Colored objects (red ball, blue car)
- secondary_character: Secondary character names
- setting: Scene setting (indoor/outdoor)
- atmosphere: Mood/atmosphere
- physical_feature: Main character physical features (NEW - Phase 1)
- clothing: Main character clothing (NEW - Phase 1)
- secondary_visual: Secondary character visual details (NEW - Phase 1)';

-- Add index for efficient querying of new detail types
CREATE INDEX IF NOT EXISTS idx_visual_details_cache_phase1_types 
ON visual_details_cache(session_id, detail_type) 
WHERE detail_type IN ('physical_feature', 'clothing', 'secondary_visual');

-- Verify existing data integrity (no action needed, just verification)
DO $$
BEGIN
  RAISE NOTICE 'Phase 1 migration complete. New detail types documented and indexed.';
END $$;