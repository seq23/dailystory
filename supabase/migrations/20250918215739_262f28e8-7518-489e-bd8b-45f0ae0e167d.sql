-- Fix the UUID sanitization trigger to prevent field access errors
-- The trigger was trying to access parent_user_id on all tables, but only child_profiles has this field

CREATE OR REPLACE FUNCTION public.sanitize_uuid_inputs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Clean user_id if it's not a valid UUID (all tables have this field)
  IF NEW.user_id IS NOT NULL AND NOT (NEW.user_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') THEN
    NEW.user_id = NULL;
  END IF;
  
  -- Clean parent_user_id ONLY on child_profiles table (prevent field access errors)
  IF TG_TABLE_NAME = 'child_profiles' THEN
    -- Use dynamic field access to prevent compilation errors
    EXECUTE format('
      BEGIN
        IF ($1).parent_user_id IS NOT NULL 
           AND NOT (($1).parent_user_id::text ~ ''^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'') THEN
          ($1).parent_user_id = NULL;
        END IF;
      END;
    ') USING NEW;
  END IF;
  
  RETURN NEW;
END;
$function$;