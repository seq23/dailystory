-- Add missing visual_elements column to visual_details_cache table
ALTER TABLE public.visual_details_cache 
ADD COLUMN visual_elements jsonb DEFAULT '{}';

-- Update any existing records to have empty visual_elements object
UPDATE public.visual_details_cache 
SET visual_elements = '{}' 
WHERE visual_elements IS NULL;