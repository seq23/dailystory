-- Fix security warning: Set search_path on sanitize_uuid_inputs function
CREATE OR REPLACE FUNCTION public.sanitize_uuid_inputs()
RETURNS trigger AS $$
BEGIN
  -- Clean user_id if it exists on this table and is not a valid UUID
  -- Skip child_profiles table since it uses parent_user_id instead
  IF TG_TABLE_NAME != 'child_profiles' AND NEW.user_id IS NOT NULL 
     AND NOT (NEW.user_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') THEN
    NEW.user_id = NULL;
  END IF;
  
  -- Clean parent_user_id if exists and invalid
  IF TG_TABLE_NAME = 'child_profiles' AND NEW.parent_user_id IS NOT NULL 
     AND NOT (NEW.parent_user_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') THEN
    NEW.parent_user_id = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';