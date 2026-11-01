-- Phase 8, part two (31 Oct 2026). Additive: one new table, new nullable columns, a widened
-- source check, three AFTER triggers on family tables that only ever INSERT into
-- institution tables, and new functions. No family row, column or policy changes.
-- docs/phase-8-institutions.md "App reading in the class view" and "School AI privacy lane".
--
-- 1. institution_app_links: a teacher or school admin links an app child profile they own
--    (a classroom profile) to a roster child they can already see. Household profiles owned
--    by someone outside the school cannot be linked: a link never crosses tenancy.
-- 2. While linked, that profile's in-app reading flows into the class view as source 'app':
--    every completed or ended reading session, every quiz with per-skill answers, and every
--    Reads-at change, dated when it happened. Nothing before the link is copied (no invented
--    baseline). Teacher-recorded evidence is untouched and stays separately labelled.
-- 3. public.institution_ai_lane(user, child) tells the edge functions which accounts are
--    school accounts (supabase/functions/_shared/privacyLane.ts). Service role only.

create table if not exists public.institution_app_links (
  child_profile_id uuid primary key references public.child_profiles (id) on delete cascade,
  school_id uuid not null,
  student_id uuid not null unique,
  linked_by uuid default auth.uid() references auth.users on delete set null,
  linked_at timestamptz not null default now(),
  foreign key (student_id, school_id) references public.institution_students (id, school_id) on delete cascade
);
create index if not exists institution_app_links_school_idx on public.institution_app_links (school_id, student_id);

-- App rows: their own source value, an idempotency reference to the family row they came
-- from, and the app's own measures (words read; the app skill behind a mapped score).
alter table public.institution_readings add column if not exists app_ref text;
alter table public.institution_readings add column if not exists words_read integer check (words_read is null or words_read >= 0);
alter table public.institution_assessments add column if not exists app_ref text;
alter table public.institution_readings drop constraint if exists institution_readings_source_check;
alter table public.institution_readings add constraint institution_readings_source_check
  check (source in ('teacher_recorded', 'app') and ((source = 'app') = (app_ref is not null)));
alter table public.institution_assessments drop constraint if exists institution_assessments_source_check;
alter table public.institution_assessments add constraint institution_assessments_source_check
  check (source in ('teacher_recorded', 'app') and ((source = 'app') = (app_ref is not null)));
create unique index if not exists institution_readings_app_ref_idx on public.institution_readings (class_id, app_ref) where app_ref is not null;
create unique index if not exists institution_assessments_app_ref_idx on public.institution_assessments (class_id, app_ref) where app_ref is not null;

alter table public.institution_app_links enable row level security;
revoke all on public.institution_app_links from anon, authenticated;
grant select on public.institution_app_links to authenticated;
do $policy$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'institution_app_links' and policyname = 'app_links_read') then
    create policy app_links_read on public.institution_app_links for select to authenticated using (
      institution_private.can_read_student(student_id)
    );
  end if;
end $policy$;

-- Link: the caller must own the app profile AND be able to read the roster child (its
-- teacher or the school admin). One app profile per roster child and vice versa.
create or replace function public.institution_link_app_profile(p_student uuid, p_child_profile uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare s uuid;
begin
  if not institution_private.can_read_student(p_student) then raise exception 'Class access required' using errcode = '42501'; end if;
  if not exists (select 1 from public.child_profiles c where c.id = p_child_profile and c.parent_user_id = auth.uid()) then
    raise exception 'Link a child profile on your own account' using errcode = '42501';
  end if;
  select school_id into strict s from public.institution_students where id = p_student;
  insert into public.institution_app_links (child_profile_id, school_id, student_id, linked_by)
    values (p_child_profile, s, p_student, auth.uid());
exception when unique_violation then
  raise exception 'That profile or child is already linked' using errcode = '23505';
end;
$$;

-- Unlink stops future app records; recorded app evidence stays (it is dated history).
create or replace function public.institution_unlink_app_profile(p_child_profile uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (
    select 1 from public.institution_app_links l
    where l.child_profile_id = p_child_profile and (
      institution_private.is_admin(l.school_id)
      or exists (select 1 from public.child_profiles c where c.id = l.child_profile_id and c.parent_user_id = auth.uid())
    )
  ) then raise exception 'School admin or the profile owner required' using errcode = '42501'; end if;
  delete from public.institution_app_links where child_profile_id = p_child_profile;
end;
$$;

-- The one mapping from the app's eight quiz skills (supabase/functions/_shared/grades.ts
-- QUIZ_SKILLS) to the class view's five. Guard: src/test/guards/school-app-reading.test.ts.
create or replace function institution_private.app_skill(p text) returns text
language sql immutable set search_path = '' as $$
  select case p
    when 'sight-words' then 'vocabulary'
    when 'phonics' then 'spelling'
    when 'spelling' then 'spelling'
    when 'word-meaning' then 'definitions'
    when 'what-happened' then 'context'
    when 'sentence-sense' then 'context'
    when 'between-the-lines' then 'inference'
    when 'big-picture' then 'inference'
    else null end;
$$;

-- A reading session ended in the app → one 'app' reading per enrolled class.
create or replace function institution_private.app_reading_from_session() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.child_profile_id is null then return new; end if;
  insert into public.institution_readings (school_id, class_id, student_id, story_title, minutes, completed, read_at, recorded_by, source, app_ref, words_read)
  select e.school_id, e.class_id, e.student_id,
    coalesce(nullif(left(trim(st.title), 200), ''), 'Story read in the app'),
    least(greatest(coalesce(new.time_spent, 0), 0), 180),
    new.completed_at is not null,
    least((coalesce(new.completed_at, new.started_at, now()) at time zone 'UTC')::date, current_date),
    null, 'app', 'reading_session:' || new.id::text, greatest(coalesce(new.words_read, 0), 0)
  from public.institution_app_links l
  join public.child_profiles c on c.id = l.child_profile_id and c.parent_user_id = new.user_id
  join public.institution_enrollments e on e.student_id = l.student_id and e.school_id = l.school_id
  left join public.stories st on st.id = new.story_id
  where l.child_profile_id = new.child_profile_id
  on conflict do nothing;
  return new;
exception when others then
  -- The family's own record is never lost because of the school copy.
  raise warning 'institution app reading not recorded: %', sqlerrm;
  return new;
end;
$$;

-- A quiz finished in the app → one 'app' assessment per enrolled class with per-skill
-- correct/total. A quiz with no per-skill answers is "not assessed", never zero.
create or replace function institution_private.app_assessment_from_quiz() returns trigger
language plpgsql security definer set search_path = '' as $$
declare e record; a uuid; scores jsonb;
begin
  if new.child_profile_id is null or jsonb_typeof(new.details->'skillAnswers') is distinct from 'array' then return new; end if;
  select jsonb_agg(jsonb_build_object('skill', skill, 'correct', correct, 'total', total)) into scores from (
    select institution_private.app_skill(x->>'skill') as skill,
      count(*) filter (where (x->>'correct')::boolean) as correct, count(*) as total
    from jsonb_array_elements(new.details->'skillAnswers') x
    where jsonb_typeof(x) = 'object' and jsonb_typeof(x->'correct') = 'boolean' and institution_private.app_skill(x->>'skill') is not null
    group by 1
  ) t;
  if scores is null then return new; end if;
  for e in
    select en.school_id, en.class_id, en.student_id from public.institution_app_links l
    join public.child_profiles c on c.id = l.child_profile_id and c.parent_user_id = new.user_id
    join public.institution_enrollments en on en.student_id = l.student_id and en.school_id = l.school_id
    where l.child_profile_id = new.child_profile_id
  loop
    a := null;
    insert into public.institution_assessments (school_id, class_id, student_id, assessed_on, recorded_by, source, app_ref)
      values (e.school_id, e.class_id, e.student_id, least((coalesce(new.created_at, now()) at time zone 'UTC')::date, current_date), null, 'app', 'quiz_attempt:' || new.id::text)
      on conflict do nothing returning id into a;
    if a is not null then
      insert into public.institution_quiz_results (assessment_id, skill, correct, total)
        select a, s->>'skill', (s->>'correct')::integer, (s->>'total')::integer from jsonb_array_elements(scores) s;
    end if;
  end loop;
  return new;
exception when others then
  raise warning 'institution app quiz not recorded: %', sqlerrm;
  return new;
end;
$$;

-- Reads at changed on the linked profile → one dated 'app' level observation.
create or replace function institution_private.app_assessment_from_reads_at() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.reading_grade is null or new.reading_grade is not distinct from old.reading_grade then return new; end if;
  insert into public.institution_assessments (school_id, class_id, student_id, assessed_on, reading_grade, recorded_by, source, app_ref)
  select en.school_id, en.class_id, en.student_id, (now() at time zone 'UTC')::date, new.reading_grade, null, 'app',
    'reads_at:' || new.id::text || ':' || clock_timestamp()::text
  from public.institution_app_links l
  join public.institution_enrollments en on en.student_id = l.student_id and en.school_id = l.school_id
  where l.child_profile_id = new.id
  on conflict do nothing;
  return new;
exception when others then
  raise warning 'institution app Reads-at not recorded: %', sqlerrm;
  return new;
end;
$$;

drop trigger if exists institution_app_reading on public.reading_sessions;
create trigger institution_app_reading after insert on public.reading_sessions
  for each row execute function institution_private.app_reading_from_session();
drop trigger if exists institution_app_quiz on public.quiz_attempts;
create trigger institution_app_quiz after insert on public.quiz_attempts
  for each row execute function institution_private.app_assessment_from_quiz();
drop trigger if exists institution_app_reads_at on public.child_profiles;
create trigger institution_app_reads_at after update of reading_grade on public.child_profiles
  for each row execute function institution_private.app_assessment_from_reads_at();

-- The privacy lane for AI calls. 'school' when the account is an institution member, owns a
-- linked app profile, or the named child profile is linked; else 'family'.
create or replace function public.institution_ai_lane(p_user uuid, p_child uuid) returns text
language sql stable security definer set search_path = '' as $$
  select case when
    exists (select 1 from public.institution_members m where m.user_id = p_user)
    or exists (select 1 from public.institution_app_links l join public.child_profiles c on c.id = l.child_profile_id where c.parent_user_id = p_user)
    or (p_child is not null and exists (select 1 from public.institution_app_links l where l.child_profile_id = p_child))
  then 'school' else 'family' end;
$$;

revoke all on function institution_private.app_skill(text), institution_private.app_reading_from_session(),
  institution_private.app_assessment_from_quiz(), institution_private.app_assessment_from_reads_at() from public, anon, authenticated;
revoke all on function public.institution_ai_lane(uuid, uuid) from public, anon, authenticated;
grant execute on function public.institution_ai_lane(uuid, uuid) to service_role;
revoke all on function public.institution_link_app_profile(uuid, uuid), public.institution_unlink_app_profile(uuid) from public, anon;
grant execute on function public.institution_link_app_profile(uuid, uuid), public.institution_unlink_app_profile(uuid) to authenticated;
