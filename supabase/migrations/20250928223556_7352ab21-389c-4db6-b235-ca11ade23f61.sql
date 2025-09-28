-- EMERGENCY DATABASE CONSOLIDATION PLAN: Migrate legacy tables to new consolidated structure

-- Step 1: Create migration function to consolidate character_traits into character_consistency_cache
CREATE OR REPLACE FUNCTION migrate_character_traits_to_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  trait_record RECORD;
BEGIN
  -- Migrate all character_traits to character_consistency_cache
  FOR trait_record IN 
    SELECT user_id, character_name, visual_traits, created_at, updated_at
    FROM public.character_traits
  LOOP
    INSERT INTO public.character_consistency_cache (
      session_id,
      character_key,
      character_data,
      created_at,
      updated_at
    ) VALUES (
      'migrated_' || trait_record.user_id::text,  -- Use user_id as session_id for migrated data
      trait_record.user_id::text || '_' || trait_record.character_name,
      jsonb_build_object(
        'characterName', trait_record.character_name,
        'visualTraits', trait_record.visual_traits,
        'migratedFrom', 'character_traits',
        'originalUserId', trait_record.user_id
      ),
      trait_record.created_at,
      trait_record.updated_at
    )
    ON CONFLICT (session_id, character_key) DO UPDATE SET
      character_data = EXCLUDED.character_data,
      updated_at = EXCLUDED.updated_at;
  END LOOP;
  
  -- Log migration completion
  PERFORM public.log_security_event(
    'character_traits_migration_completed',
    NULL,
    jsonb_build_object(
      'migration_timestamp', now(),
      'records_migrated', (SELECT count(*) FROM public.character_traits),
      'target_table', 'character_consistency_cache'
    )
  );
END;
$function$;

-- Step 2: Create migration function to consolidate visual_details into visual_details_cache  
CREATE OR REPLACE FUNCTION migrate_visual_details_to_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  detail_record RECORD;
BEGIN
  -- Migrate all visual_details to visual_details_cache
  FOR detail_record IN 
    SELECT user_id, session_id, character_name, page_number, visual_elements, image_url, generated_at
    FROM public.visual_details
  LOOP
    -- Extract detail elements from visual_elements jsonb
    INSERT INTO public.visual_details_cache (
      session_id,
      character_name,
      detail_type,
      detail_key, 
      detail_value,
      page_first_seen,
      page_last_seen,
      visual_elements,
      created_at
    ) VALUES (
      detail_record.session_id,
      detail_record.character_name,
      'visual_element',
      'consolidated_element',
      detail_record.visual_elements::text,
      detail_record.page_number,
      detail_record.page_number,
      jsonb_build_object(
        'imageUrl', detail_record.image_url,
        'visualElements', detail_record.visual_elements,
        'migratedFrom', 'visual_details',
        'originalUserId', detail_record.user_id
      ),
      detail_record.generated_at
    )
    ON CONFLICT (session_id, character_name, detail_type, detail_key) DO UPDATE SET
      detail_value = EXCLUDED.detail_value,
      visual_elements = EXCLUDED.visual_elements,
      updated_at = now();
  END LOOP;
  
  -- Log migration completion
  PERFORM public.log_security_event(
    'visual_details_migration_completed', 
    NULL,
    jsonb_build_object(
      'migration_timestamp', now(),
      'records_migrated', (SELECT count(*) FROM public.visual_details),
      'target_table', 'visual_details_cache'
    )
  );
END;
$function$;

-- Step 3: Execute migrations (user will approve this)
-- SELECT migrate_character_traits_to_cache();
-- SELECT migrate_visual_details_to_cache();

-- Step 4: Create backup and archival policies for legacy tables
CREATE OR REPLACE FUNCTION archive_legacy_character_tables()
RETURNS void  
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create backup timestamp
  PERFORM public.log_security_event(
    'legacy_table_archival_prepared',
    NULL,
    jsonb_build_object(
      'character_traits_count', (SELECT count(*) FROM public.character_traits),
      'visual_details_count', (SELECT count(*) FROM public.visual_details),
      'archival_timestamp', now(),
      'consolidation_status', 'ready_for_archival'
    )
  );
  
  -- Note: Actual DROP TABLE statements will be executed in Phase 2 after validation
END;
$function$;