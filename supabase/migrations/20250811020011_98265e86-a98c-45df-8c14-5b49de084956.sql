-- Child profiles + active child pointer + session tagging (idempotent)

-- 1) Child profiles table
create table if not exists public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null,
  display_name text not null,
  grade_level text,
  date_of_birth date,
  avatar jsonb default '{"type":"boy","skinTone":"medium"}'::jsonb,
  story_language_preference text default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS (safe to run multiple times)
alter table public.child_profiles enable row level security;

-- Policies: create only if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'child_profiles' AND policyname = 'Parents can view their child profiles'
  ) THEN
    EXECUTE $$create policy "Parents can view their child profiles"
      on public.child_profiles for select
      using (auth.uid() = parent_user_id)$$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'child_profiles' AND policyname = 'Parents can insert their child profiles'
  ) THEN
    EXECUTE $$create policy "Parents can insert their child profiles"
      on public.child_profiles for insert
      with check (auth.uid() = parent_user_id)$$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'child_profiles' AND policyname = 'Parents can update their child profiles'
  ) THEN
    EXECUTE $$create policy "Parents can update their child profiles"
      on public.child_profiles for update
      using (auth.uid() = parent_user_id)$$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'child_profiles' AND policyname = 'Parents can delete their child profiles'
  ) THEN
    EXECUTE $$create policy "Parents can delete their child profiles"
      on public.child_profiles for delete
      using (auth.uid() = parent_user_id)$$;
  END IF;
END$$;

-- updated_at trigger: recreate to ensure correctness
DROP TRIGGER IF EXISTS update_child_profiles_updated_at ON public.child_profiles;
CREATE TRIGGER update_child_profiles_updated_at
BEFORE UPDATE ON public.child_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for quick lookups
create index if not exists idx_child_profiles_parent_user_id
  on public.child_profiles(parent_user_id);

-- 2) Active child pointer on user_preferences
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS active_child_id uuid;

-- Add FK if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.conname = 'fk_active_child'
      AND n.nspname = 'public'
      AND t.relname = 'user_preferences'
  ) THEN
    ALTER TABLE public.user_preferences
      ADD CONSTRAINT fk_active_child
      FOREIGN KEY (active_child_id)
      REFERENCES public.child_profiles(id)
      ON DELETE SET NULL;
  END IF;
END$$;

-- Validation trigger to ensure ownership
CREATE OR REPLACE FUNCTION public.validate_active_child_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
begin
  if new.active_child_id is null then
    return new;
  end if;

  if not exists (
    select 1 from public.child_profiles cp
    where cp.id = new.active_child_id
      and cp.parent_user_id = new.user_id
  ) then
    raise exception 'Active child does not belong to this user';
  end if;

  return new;
end;
$$;

DROP TRIGGER IF EXISTS trg_validate_active_child_owner ON public.user_preferences;
CREATE TRIGGER trg_validate_active_child_owner
BEFORE INSERT OR UPDATE OF active_child_id ON public.user_preferences
FOR EACH ROW EXECUTE FUNCTION public.validate_active_child_owner();

-- 3) Tag future sessions with child_profile_id
ALTER TABLE public.reading_sessions
  ADD COLUMN IF NOT EXISTS child_profile_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.conname = 'fk_reading_sessions_child'
      AND n.nspname = 'public'
      AND t.relname = 'reading_sessions'
  ) THEN
    ALTER TABLE public.reading_sessions
      ADD CONSTRAINT fk_reading_sessions_child
      FOREIGN KEY (child_profile_id)
      REFERENCES public.child_profiles(id)
      ON DELETE SET NULL;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_reading_sessions_child_profile_id
  ON public.reading_sessions(child_profile_id);
