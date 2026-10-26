-- A child's reading level on the story page (26 Oct 2026). "Make easier" / "Make
-- harder" step one grade, Pre-K to 10th (src/lib/readingLadder.ts), and the choice
-- is kept on the child, not the grown-up's profile. Null = read at the child's
-- school grade (grade_level). Values match GRADES in supabase/functions/_shared/grades.ts.
alter table public.child_profiles
  add column if not exists reading_grade text;

alter table public.child_profiles
  drop constraint if exists child_profiles_reading_grade_check;
alter table public.child_profiles
  add constraint child_profiles_reading_grade_check
  check (reading_grade is null or reading_grade in ('PreK','K','1','2','3','4','5','6','7','8','9','10'));
