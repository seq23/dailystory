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

-- Enable RLS
alter table public.child_profiles enable row level security;

-- Policies
create policy if not exists "Parents can view their child profiles"
  on public.child_profiles for select
  using (auth.uid() = parent_user_id);

create policy if not exists "Parents can insert their child profiles"
  on public.child_profiles for insert
  with check (auth.uid() = parent_user_id);

create policy if not exists "Parents can update their child profiles"
  on public.child_profiles for update
  using (auth.uid() = parent_user_id);

create policy if not exists "Parents can delete their child profiles"
  on public.child_profiles for delete
  using (auth.uid() = parent_user_id);

-- updated_at trigger
create trigger if not exists update_child_profiles_updated_at
before update on public.child_profiles
for each row execute function public.update_updated_at_column();

-- Index for quick lookups
create index if not exists idx_child_profiles_parent_user_id
  on public.child_profiles(parent_user_id);

-- 2) Active child pointer on user_preferences
alter table public.user_preferences
  add column if not exists active_child_id uuid;

alter table public.user_preferences
  add constraint if not exists fk_active_child
  foreign key (active_child_id)
  references public.child_profiles(id)
  on delete set null;

-- Validation trigger to ensure ownership
create or replace function public.validate_active_child_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
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

drop trigger if exists trg_validate_active_child_owner on public.user_preferences;
create trigger trg_validate_active_child_owner
before insert or update of active_child_id on public.user_preferences
for each row execute function public.validate_active_child_owner();

-- 3) Optional: tag future sessions with child_profile_id
alter table public.reading_sessions
  add column if not exists child_profile_id uuid;

alter table public.reading_sessions
  add constraint if not exists fk_reading_sessions_child
  foreign key (child_profile_id)
  references public.child_profiles(id)
  on delete set null;

create index if not exists idx_reading_sessions_child_profile_id
  on public.reading_sessions(child_profile_id);
