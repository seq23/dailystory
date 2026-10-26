-- "Reads at" (owner, 26 Oct 2026): each child carries School grade (grade_level) and
-- Reads at (reading_grade). Additive only. docs/reading-levels.md.

-- 1. A saved story keeps the grade it was written at.
alter table public.saved_stories add column if not exists reading_grade text;

-- 2. Normalize stored school grades to the one spelling (prod held "Pre-K" on 4 rows).
update public.child_profiles set grade_level = 'PreK'
  where grade_level in ('Pre-K', 'Pre K', 'pre-k', 'prek', 'PK', 'pk', 'Preschool', 'preschool');
update public.child_profiles set grade_level = 'K'
  where grade_level in ('k', 'Kindergarten', 'kindergarten', 'KG');

-- 3. "Never easier than: ___ grade": give each saved minimum its grade
--    (beginner → Pre-K, easy → 1st, medium → 3rd, hard → 5th, expert → its sub-level).
update public.user_preferences
set reading_preferences = reading_preferences || jsonb_build_object('minReadingGrade',
  case reading_preferences->>'minDifficulty'
    when 'beginner' then 'PreK'
    when 'easy' then '1'
    when 'medium' then '3'
    when 'hard' then '5'
    when 'expert' then coalesce(nullif(regexp_replace(coalesce(reading_preferences->>'minExpertGrade', '6th'), '[^0-9]', '', 'g'), ''), '6')
  end)
where reading_preferences ? 'minDifficulty'
  and not reading_preferences ? 'minReadingGrade'
  and reading_preferences->>'minDifficulty' in ('beginner', 'easy', 'medium', 'hard', 'expert');
