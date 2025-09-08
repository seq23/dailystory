-- Delete data for the last 4 users to clean up the database
-- User IDs to delete:
-- 153b164d-9e7d-46c9-96a9-630343bc234a (staylor@spry.vc)
-- c877a634-8b41-40cb-a0bd-4f3fa215cff4 (staylor@spryvc.com)
-- dec74d35-6ff2-427e-9450-8f16e4063a00 (sequoialtaylor@gmail.com) 
-- decbbcfb-e810-42df-ba59-56a013cb6b7c (nicole_georgern@yahoo.com)

-- Step 1: Delete from all child tables first to avoid foreign key constraint violations

-- Delete child profiles
DELETE FROM public.child_profiles 
WHERE parent_user_id IN (
  '153b164d-9e7d-46c9-96a9-630343bc234a',
  'c877a634-8b41-40cb-a0bd-4f3fa215cff4', 
  'dec74d35-6ff2-427e-9450-8f16e4063a00',
  'decbbcfb-e810-42df-ba59-56a013cb6b7c'
);

-- Delete saved stories
DELETE FROM public.saved_stories
WHERE user_id IN (
  '153b164d-9e7d-46c9-96a9-630343bc234a',
  'c877a634-8b41-40cb-a0bd-4f3fa215cff4',
  'dec74d35-6ff2-427e-9450-8f16e4063a00', 
  'decbbcfb-e810-42df-ba59-56a013cb6b7c'
);

-- Delete quiz attempts
DELETE FROM public.quiz_attempts
WHERE user_id IN (
  '153b164d-9e7d-46c9-96a9-630343bc234a',
  'c877a634-8b41-40cb-a0bd-4f3fa215cff4',
  'dec74d35-6ff2-427e-9450-8f16e4063a00',
  'decbbcfb-e810-42df-ba59-56a013cb6b7c'
);

-- Delete game sessions  
DELETE FROM public.game_sessions
WHERE user_id IN (
  '153b164d-9e7d-46c9-96a9-630343bc234a',
  'c877a634-8b41-40cb-a0bd-4f3fa215cff4',
  'dec74d35-6ff2-427e-9450-8f16e4063a00',
  'decbbcfb-e810-42df-ba59-56a013cb6b7c'
);

-- Delete reading sessions
DELETE FROM public.reading_sessions  
WHERE user_id IN (
  '153b164d-9e7d-46c9-96a9-630343bc234a',
  'c877a634-8b41-40cb-a0bd-4f3fa215cff4',
  'dec74d35-6ff2-427e-9450-8f16e4063a00',
  'decbbcfb-e810-42df-ba59-56a013cb6b7c'
);

-- Delete vocabulary progress
DELETE FROM public.vocabulary_progress
WHERE user_id IN (
  '153b164d-9e7d-46c9-96a9-630343bc234a',
  'c877a634-8b41-40cb-a0bd-4f3fa215cff4',
  'dec74d35-6ff2-427e-9450-8f16e4063a00',
  'decbbcfb-e810-42df-ba59-56a013cb6b7c'
);

-- Delete user preferences  
DELETE FROM public.user_preferences
WHERE user_id IN (
  '153b164d-9e7d-46c9-96a9-630343bc234a',
  'c877a634-8b41-40cb-a0bd-4f3fa215cff4',
  'dec74d35-6ff2-427e-9450-8f16e4063a00',
  'decbbcfb-e810-42df-ba59-56a013cb6b7c'
);

-- Delete story collections
DELETE FROM public.story_collections
WHERE user_id IN (
  '153b164d-9e7d-46c9-96a9-630343bc234a',
  'c877a634-8b41-40cb-a0bd-4f3fa215cff4',
  'dec74d35-6ff2-427e-9450-8f16e4063a00',
  'decbbcfb-e810-42df-ba59-56a013cb6b7c'
);

-- Delete user content signatures
DELETE FROM public.user_content_signatures
WHERE user_identifier IN (
  '153b164d-9e7d-46c9-96a9-630343bc234a',
  'c877a634-8b41-40cb-a0bd-4f3fa215cff4', 
  'dec74d35-6ff2-427e-9450-8f16e4063a00',
  'decbbcfb-e810-42df-ba59-56a013cb6b7c'
);

-- Delete personal info incidents
DELETE FROM public.personal_info_incidents
WHERE user_id IN (
  '153b164d-9e7d-46c9-96a9-630343bc234a',
  'c877a634-8b41-40cb-a0bd-4f3fa215cff4',
  'dec74d35-6ff2-427e-9450-8f16e4063a00',
  'decbbcfb-e810-42df-ba59-56a013cb6b7c'
);

-- Delete feedback
DELETE FROM public.feedback
WHERE user_id IN (
  '153b164d-9e7d-46c9-96a9-630343bc234a',
  'c877a634-8b41-40cb-a0bd-4f3fa215cff4',
  'dec74d35-6ff2-427e-9450-8f16e4063a00',
  'decbbcfb-e810-42df-ba59-56a013cb6b7c'
);

-- Step 2: Delete from main user tables

-- Delete subscribers
DELETE FROM public.subscribers  
WHERE user_id IN (
  '153b164d-9e7d-46c9-96a9-630343bc234a',
  'c877a634-8b41-40cb-a0bd-4f3fa215cff4',
  'dec74d35-6ff2-427e-9450-8f16e4063a00',
  'decbbcfb-e810-42df-ba59-56a013cb6b7c'
);

-- Delete profiles (this should cascade to auth.users due to foreign key)
DELETE FROM public.profiles
WHERE user_id IN (
  '153b164d-9e7d-46c9-96a9-630343bc234a',
  'c877a634-8b41-40cb-a0bd-4f3fa215cff4',
  'dec74d35-6ff2-427e-9450-8f16e4063a00', 
  'decbbcfb-e810-42df-ba59-56a013cb6b7c'
);