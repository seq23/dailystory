-- Update the handle_new_user function to handle additional signup data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    display_name, 
    grade_level,
    interests,
    reading_level,
    native_language
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', 'Reader'),
    COALESCE(NEW.raw_user_meta_data ->> 'grade_level', 'K'),
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'interests' IS NOT NULL 
      THEN string_to_array(NEW.raw_user_meta_data ->> 'interests', ',')
      ELSE ARRAY[]::text[]
    END,
    COALESCE(NEW.raw_user_meta_data ->> 'reading_level', 'beginner'),
    COALESCE(NEW.raw_user_meta_data ->> 'native_language', 'en')
  );
  RETURN NEW;
END;
$$;