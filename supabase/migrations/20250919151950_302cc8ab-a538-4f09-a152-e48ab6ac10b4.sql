-- Fix sanitize_uuid_inputs trigger to avoid referencing non-existent fields
CREATE OR REPLACE FUNCTION public.sanitize_uuid_inputs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Safe field access using jsonb existence check to avoid "field does not exist" errors
  -- This prevents PostgreSQL from trying to access non-existent fields
  
  -- Handle user_id field (exists on most tables except child_profiles)
  IF to_jsonb(NEW) ? 'user_id' THEN
    IF NEW.user_id IS NOT NULL AND NOT (NEW.user_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') THEN
      NEW.user_id = NULL;
    END IF;
  END IF;
  
  -- Handle parent_user_id field (exists only on child_profiles table)
  IF to_jsonb(NEW) ? 'parent_user_id' THEN
    IF NEW.parent_user_id IS NOT NULL AND NOT (NEW.parent_user_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') THEN
      NEW.parent_user_id = NULL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;