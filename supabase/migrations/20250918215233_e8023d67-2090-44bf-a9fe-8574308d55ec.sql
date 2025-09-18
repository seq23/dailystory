-- Fix function search path mutable warning
-- Find and update the function that's missing SET search_path

-- Update sanitize_uuid_inputs function to include proper search path
CREATE OR REPLACE FUNCTION public.sanitize_uuid_inputs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Clean user_id if it's not a valid UUID
  IF NEW.user_id IS NOT NULL AND NOT (NEW.user_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') THEN
    NEW.user_id = NULL;
  END IF;
  
  -- Clean parent_user_id if exists and invalid
  IF TG_TABLE_NAME = 'child_profiles' AND NEW.parent_user_id IS NOT NULL 
     AND NOT (NEW.parent_user_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') THEN
    NEW.parent_user_id = NULL;
  END IF;
  
  RETURN NEW;
END;
$function$;