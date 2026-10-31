-- October 2026 institutions workspace. Additive: no family tables or rows change.
create schema if not exists institution_private;
revoke all on schema institution_private from public;
grant usage on schema institution_private to authenticated;

create table if not exists public.institution_schools (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 160),
  created_at timestamptz not null default now()
);
create table if not exists public.institution_members (
  school_id uuid not null references public.institution_schools on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role text not null check (role in ('teacher', 'school_admin')),
  primary key (school_id, user_id)
);
create table if not exists public.institution_classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.institution_schools on delete cascade,
  teacher_user_id uuid,
  name text not null check (length(trim(name)) between 1 and 100),
  unique (id, school_id),
  foreign key (school_id, teacher_user_id) references public.institution_members (school_id, user_id) on delete set null (teacher_user_id)
);
create table if not exists public.institution_students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.institution_schools on delete cascade,
  external_id text not null check (length(external_id) between 1 and 120),
  display_name text not null check (length(trim(display_name)) between 1 and 100),
  school_grade text check (school_grade in ('PreK','K','1','2','3','4','5','6','7','8','9','10')),
  reading_grade text check (reading_grade in ('PreK','K','1','2','3','4','5','6','7','8','9','10')),
  created_at timestamptz not null default now(),
  unique (id, school_id), unique (school_id, external_id)
);
create table if not exists public.institution_enrollments (
  class_id uuid not null,
  student_id uuid not null,
  school_id uuid not null,
  primary key (class_id, student_id),
  unique (class_id, student_id, school_id),
  foreign key (class_id, school_id) references public.institution_classes (id, school_id) on delete cascade,
  foreign key (student_id, school_id) references public.institution_students (id, school_id) on delete cascade
);
create table if not exists public.institution_readings (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  class_id uuid not null,
  student_id uuid not null,
  story_title text not null check (length(trim(story_title)) between 1 and 200),
  minutes numeric(6,2) not null check (minutes >= 0 and minutes <= 180),
  completed boolean not null default true,
  read_at date not null check (read_at <= current_date),
  recorded_at timestamptz not null default now(),
  recorded_by uuid default auth.uid() references auth.users on delete set null,
  source text not null default 'teacher_recorded' check (source = 'teacher_recorded'),
  foreign key (class_id, student_id, school_id) references public.institution_enrollments (class_id, student_id, school_id) on delete cascade
);
create table if not exists public.institution_assessments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  class_id uuid not null,
  student_id uuid not null,
  assessed_on date not null check (assessed_on <= current_date),
  school_grade text check (school_grade in ('PreK','K','1','2','3','4','5','6','7','8','9','10')),
  reading_grade text check (reading_grade in ('PreK','K','1','2','3','4','5','6','7','8','9','10')),
  recorded_at timestamptz not null default now(),
  recorded_by uuid default auth.uid() references auth.users on delete set null,
  source text not null default 'teacher_recorded' check (source = 'teacher_recorded'),
  foreign key (class_id, student_id, school_id) references public.institution_enrollments (class_id, student_id, school_id) on delete cascade
);
create table if not exists public.institution_quiz_results (
  assessment_id uuid not null references public.institution_assessments on delete cascade,
  skill text not null check (skill in ('vocabulary','spelling','definitions','context','inference')),
  correct integer not null check (correct >= 0),
  total integer not null check (total between 1 and 1000 and correct <= total),
  primary key (assessment_id, skill)
);
create index if not exists institution_members_user_idx on public.institution_members (user_id, school_id);
create index if not exists institution_classes_teacher_idx on public.institution_classes (teacher_user_id, school_id);
create index if not exists institution_enrollments_student_idx on public.institution_enrollments (student_id, class_id);
create index if not exists institution_readings_student_date_idx on public.institution_readings (student_id, read_at);
create index if not exists institution_assessments_student_date_idx on public.institution_assessments (student_id, assessed_on);

-- Non-exposed helpers avoid recursive membership/enrollment policies. They accept no
-- caller identity; auth.uid() is the sole principal. No user_metadata authorization.
create or replace function institution_private.is_admin(s uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.institution_members m where m.school_id = s and m.user_id = auth.uid() and m.role = 'school_admin'
  );
$$;
create or replace function institution_private.can_read_class(c uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.institution_classes cl join public.institution_members m on m.school_id = cl.school_id and m.user_id = auth.uid()
    where cl.id = c and (m.role = 'school_admin' or cl.teacher_user_id = auth.uid())
  );
$$;
create or replace function institution_private.can_read_student(s uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.institution_students st where st.id = s and (
      institution_private.is_admin(st.school_id) or exists (
        select 1 from public.institution_enrollments e where e.student_id = s and institution_private.can_read_class(e.class_id)
      )
    )
  );
$$;
revoke all on all functions in schema institution_private from public, anon;
grant execute on all functions in schema institution_private to authenticated;

alter table public.institution_schools enable row level security;
alter table public.institution_members enable row level security;
alter table public.institution_classes enable row level security;
alter table public.institution_students enable row level security;
alter table public.institution_enrollments enable row level security;
alter table public.institution_readings enable row level security;
alter table public.institution_assessments enable row level security;
alter table public.institution_quiz_results enable row level security;
revoke all on public.institution_schools, public.institution_members, public.institution_classes,
  public.institution_students, public.institution_enrollments, public.institution_readings,
  public.institution_assessments, public.institution_quiz_results from anon, authenticated;
grant select on public.institution_schools, public.institution_members, public.institution_classes,
  public.institution_students, public.institution_enrollments, public.institution_readings,
  public.institution_assessments, public.institution_quiz_results to authenticated;
grant insert on public.institution_classes to authenticated;
grant insert (school_id, class_id, student_id, story_title, minutes, completed, read_at) on public.institution_readings to authenticated;

do $policy$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'institution_schools' and policyname = 'school_members_read') then
    create policy school_members_read on public.institution_schools for select to authenticated using (
  exists (select 1 from public.institution_members m where m.school_id = id and m.user_id = auth.uid())
);
  end if;
end $policy$;
do $policy$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'institution_members' and policyname = 'members_read') then
    create policy members_read on public.institution_members for select to authenticated using (
  user_id = auth.uid() or institution_private.is_admin(school_id)
);
  end if;
end $policy$;
do $policy$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'institution_classes' and policyname = 'classes_read') then
    create policy classes_read on public.institution_classes for select to authenticated using (institution_private.can_read_class(id));
  end if;
end $policy$;
do $policy$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'institution_classes' and policyname = 'classes_create') then
    create policy classes_create on public.institution_classes for insert to authenticated with check (
  institution_private.is_admin(school_id) or (teacher_user_id = auth.uid() and exists (
    select 1 from public.institution_members m where m.school_id = institution_classes.school_id and m.user_id = auth.uid() and m.role = 'teacher'
  ))
);
  end if;
end $policy$;
do $policy$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'institution_students' and policyname = 'students_read') then
    create policy students_read on public.institution_students for select to authenticated using (institution_private.can_read_student(id));
  end if;
end $policy$;
do $policy$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'institution_enrollments' and policyname = 'enrollments_read') then
    create policy enrollments_read on public.institution_enrollments for select to authenticated using (institution_private.can_read_class(class_id));
  end if;
end $policy$;
do $policy$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'institution_readings' and policyname = 'readings_read') then
    create policy readings_read on public.institution_readings for select to authenticated using (institution_private.can_read_class(class_id));
  end if;
end $policy$;
do $policy$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'institution_readings' and policyname = 'readings_create') then
    create policy readings_create on public.institution_readings for insert to authenticated with check (
  recorded_by = auth.uid() and institution_private.can_read_class(class_id)
);
  end if;
end $policy$;
do $policy$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'institution_assessments' and policyname = 'assessments_read') then
    create policy assessments_read on public.institution_assessments for select to authenticated using (institution_private.can_read_class(class_id));
  end if;
end $policy$;
do $policy$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'institution_quiz_results' and policyname = 'quiz_read') then
    create policy quiz_read on public.institution_quiz_results for select to authenticated using (
  exists (select 1 from public.institution_assessments a where a.id = assessment_id)
);
  end if;
end $policy$;

-- Admins can assign an existing account as teacher; creating accounts, schools,
-- or additional admins is deliberately unavailable to browser callers.
create or replace function public.institution_assign_teacher(p_school uuid, p_user uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not institution_private.is_admin(p_school) then raise exception 'School admin required' using errcode = '42501'; end if;
  insert into public.institution_members (school_id, user_id, role) values (p_school, p_user, 'teacher') on conflict do nothing;
end;
$$;

-- Atomic import: one invalid row rolls back the whole batch. Reimport adds only
-- missing enrollments and never overwrites a profile or its grade history.
create or replace function public.institution_import_roster(p_class uuid, p_rows jsonb) returns integer
language plpgsql security definer set search_path = '' as $$
declare s uuid; r jsonb; student uuid; n integer := 0;
begin
  if not institution_private.can_read_class(p_class) then raise exception 'Class access required' using errcode = '42501'; end if;
  if jsonb_typeof(p_rows) is distinct from 'array' or jsonb_array_length(p_rows) not between 1 and 1000 then raise exception 'Expected 1–1000 roster rows'; end if;
  select school_id into strict s from public.institution_classes where id = p_class;
  -- Serialize concurrent imports within a school (including external-id claims).
  perform 1 from public.institution_schools where id = s for update;
  for r in select value from jsonb_array_elements(p_rows) loop
    select id into student from public.institution_students where school_id = s and external_id = r->>'external_id';
    if student is not null and not institution_private.can_read_student(student) then
      raise exception 'Roster identifier unavailable; ask your school admin' using errcode = '42501';
    end if;
    if student is null then
      insert into public.institution_students (school_id, external_id, display_name, school_grade, reading_grade)
      values (s, r->>'external_id', r->>'display_name', nullif(r->>'school_grade',''), nullif(r->>'reading_grade','')) returning id into student;
    end if;
    insert into public.institution_enrollments (class_id, student_id, school_id) values (p_class, student, s) on conflict do nothing;
    if found then n := n + 1; end if;
  end loop;
  return n;
end;
$$;

-- A single transaction records the grade snapshot and all skill counts. An empty
-- quiz means "not assessed", never zero ability. Historical snapshots are immutable.
create or replace function public.institution_record_assessment(p_class uuid, p_student uuid, p_date date, p_school_grade text, p_reading_grade text, p_scores jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare s uuid; a uuid; r jsonb;
begin
  if not institution_private.can_read_class(p_class) then raise exception 'Class access required' using errcode = '42501'; end if;
  if jsonb_typeof(p_scores) is distinct from 'array' or jsonb_array_length(p_scores) > 5 then raise exception 'Expected up to five skills'; end if;
  if jsonb_array_length(p_scores) = 0 and p_school_grade is null and p_reading_grade is null then raise exception 'Record a grade or at least one assessed skill'; end if;
  select school_id into strict s from public.institution_classes where id = p_class;
  insert into public.institution_assessments (school_id, class_id, student_id, assessed_on, school_grade, reading_grade)
    values (s, p_class, p_student, p_date, p_school_grade, p_reading_grade) returning id into a;
  for r in select value from jsonb_array_elements(p_scores) loop
    insert into public.institution_quiz_results (assessment_id, skill, correct, total)
      values (a, r->>'skill', (r->>'correct')::integer, (r->>'total')::integer);
  end loop;
  return a;
end;
$$;
-- Deletion is scoped to a school admin and cascades only this institutional child.
create or replace function public.institution_delete_student(p_student uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.institution_students where id = p_student and institution_private.is_admin(school_id)) then
    raise exception 'School admin required' using errcode = '42501';
  end if;
  delete from public.institution_students where id = p_student;
end;
$$;
revoke all on function public.institution_assign_teacher(uuid, uuid), public.institution_import_roster(uuid, jsonb),
  public.institution_record_assessment(uuid, uuid, date, text, text, jsonb), public.institution_delete_student(uuid) from public, anon;
grant execute on function public.institution_assign_teacher(uuid, uuid), public.institution_import_roster(uuid, jsonb),
  public.institution_record_assessment(uuid, uuid, date, text, text, jsonb), public.institution_delete_student(uuid) to authenticated;
