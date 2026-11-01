\set ON_ERROR_STOP on
\set ECHO errors
-- In-app reading flows into the class view as source 'app' (migration 20261031210000).
-- Runs after access.sql: user 02 teaches Fixture Class B (school A); 04 is school B's admin.
-- 05 is a household parent with no school role. Fixture identities only.
insert into auth.users values ('00000000-0000-0000-0000-000000000005') on conflict do nothing;
insert into public.child_profiles (id, parent_user_id, display_name, reading_grade) values
  ('40000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','Classroom reader','2'),
  ('40000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000005','Household reader','3');
insert into public.stories (id, title) values ('50000000-0000-0000-0000-000000000001','Fixture app story');
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
select public.institution_import_roster('20000000-0000-0000-0000-000000000002','[{"external_id":"app-fixture","display_name":"Reader App"}]');
reset role;
-- Before any link: nothing is copied, so no baseline is invented from earlier reading.
insert into public.reading_sessions (user_id, child_profile_id, started_at, completed_at, time_spent, words_read)
  values ('00000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000001', now() - interval '20 minutes', now(), 20, 300);
select public.test_assert((select count(*) = 0 from public.institution_readings where source = 'app'), 'reading before the link is not copied');
set role authenticated;
do $$ declare st uuid := (select id from public.institution_students where external_id = 'app-fixture'); begin
  -- A household parent cannot link a school child, nor can a teacher link someone else's profile.
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000005', true);
  begin perform public.institution_link_app_profile(st, '40000000-0000-0000-0000-000000000005'); raise exception 'FAIL household links school child'; exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
  begin perform public.institution_link_app_profile(st, '40000000-0000-0000-0000-000000000005'); raise exception 'FAIL teacher links household profile'; exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000004', true);
  begin perform public.institution_link_app_profile(st, '40000000-0000-0000-0000-000000000001'); raise exception 'FAIL foreign admin links'; exception when insufficient_privilege then null; end;
  begin insert into public.institution_app_links (child_profile_id, school_id, student_id) values ('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001', st); raise exception 'FAIL direct link insert'; exception when insufficient_privilege then null; end;
end $$;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
select public.institution_link_app_profile((select id from public.institution_students where external_id = 'app-fixture'), '40000000-0000-0000-0000-000000000001');
do $$ begin
  begin perform public.institution_link_app_profile((select id from public.institution_students where external_id = 'app-fixture'), '40000000-0000-0000-0000-000000000001'); raise exception 'FAIL double link'; exception when unique_violation then null; end;
  -- Teachers cannot write app-sourced evidence themselves.
  begin insert into public.institution_readings (school_id, class_id, student_id, story_title, minutes, read_at, source) select school_id, '20000000-0000-0000-0000-000000000002', id, 'Forged', 1, current_date, 'app' from public.institution_students where external_id = 'app-fixture'; raise exception 'FAIL teacher forges app source'; exception when insufficient_privilege then null; end;
end $$;
select public.test_assert((select count(*) = 1 from public.institution_app_links), 'teacher sees own link');
reset role;
-- The linked profile reads, takes a quiz and changes Reads at, as the family app does.
insert into public.reading_sessions (id, user_id, child_profile_id, story_id, started_at, completed_at, time_spent, words_read)
  values ('60000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001', now() - interval '15 minutes', now(), 15, 420);
insert into public.reading_sessions (id, user_id, child_profile_id, started_at, completed_at, time_spent, words_read)
  values ('61000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000001', now() - interval '500 minutes', null, 500, 10);
-- A spoofed row (someone else's account naming the linked profile) and an unlinked household profile.
insert into public.reading_sessions (user_id, child_profile_id, time_spent) values ('00000000-0000-0000-0000-000000000005','40000000-0000-0000-0000-000000000001', 9);
insert into public.reading_sessions (user_id, child_profile_id, time_spent) values ('00000000-0000-0000-0000-000000000005','40000000-0000-0000-0000-000000000005', 9);
insert into public.quiz_attempts (id, user_id, child_profile_id, details) values ('70000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000001',
  '{"skillAnswers":[{"skill":"between-the-lines","correct":true},{"skill":"big-picture","correct":false},{"skill":"word-meaning","correct":true},{"skill":"not-a-skill","correct":true},{"skill":"phonics","correct":"yes"}]}');
insert into public.quiz_attempts (user_id, child_profile_id, details) values ('00000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000001','{"answers":[1,2]}');
update public.child_profiles set reading_grade = '3' where id = '40000000-0000-0000-0000-000000000001';
update public.child_profiles set display_name = 'Classroom reader renamed' where id = '40000000-0000-0000-0000-000000000001';
select public.test_assert((select count(*) = 2 from public.institution_readings where source = 'app'), 'two app readings: spoofed and unlinked rows ignored');
select public.test_assert((select story_title = 'Fixture app story' and minutes = 15 and completed and words_read = 420 and recorded_by is null and app_ref = 'reading_session:60000000-0000-0000-0000-000000000001' and read_at = current_date
  from public.institution_readings where app_ref = 'reading_session:60000000-0000-0000-0000-000000000001'), 'app reading carries title, minutes, completion, words and its reference');
select public.test_assert((select minutes = 180 and not completed and story_title = 'Story read in the app' from public.institution_readings where app_ref = 'reading_session:61000000-0000-0000-0000-000000000002'), 'open-tab minutes capped at 180, ended session not completed');
select public.test_assert((select count(*) = 1 from public.institution_assessments where source = 'app' and app_ref = 'quiz_attempt:70000000-0000-0000-0000-000000000001'), 'one app assessment per quiz; quiz with no skills is not assessed');
select public.test_assert((select string_agg(skill || ' ' || correct || '/' || total, ', ' order by skill) = 'definitions 1/1, inference 1/2'
  from public.institution_quiz_results q join public.institution_assessments a on a.id = q.assessment_id where a.source = 'app'), 'app skills mapped and counted; unknown skills and non-boolean answers dropped');
select public.test_assert((select count(*) = 1 from public.institution_assessments where source = 'app' and reading_grade = '3' and school_grade is null), 'Reads-at change is one dated app observation; unrelated edits add none');
select public.test_assert((select count(*) = 0 from public.institution_assessments where source = 'teacher_recorded' and app_ref is not null), 'teacher rows never carry an app reference');
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
select public.test_assert((select count(*) = 2 from public.institution_readings where source = 'app'), 'teacher sees app readings in own class');
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000004';
select public.test_assert((select count(*) = 0 from public.institution_readings where source = 'app') and (select count(*) = 0 from public.institution_app_links), 'other school sees no app records or links');
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000005';
select public.test_assert((select count(*) = 0 from public.institution_app_links), 'household parent sees no links');
do $$ begin
  begin perform public.institution_unlink_app_profile('40000000-0000-0000-0000-000000000001'); raise exception 'FAIL stranger unlinks'; exception when insufficient_privilege then null; end;
  begin perform public.institution_ai_lane('00000000-0000-0000-0000-000000000005', null); raise exception 'FAIL browser reads lane'; exception when insufficient_privilege then null; end;
end $$;
reset role;
-- AI privacy lane: members and linked profiles are school; a household with no link is family.
select public.test_assert(public.institution_ai_lane('00000000-0000-0000-0000-000000000002', null) = 'school', 'teacher account is school lane');
select public.test_assert(public.institution_ai_lane('00000000-0000-0000-0000-000000000005', null) = 'family', 'household account is family lane');
select public.test_assert(public.institution_ai_lane('00000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000001') = 'school', 'a linked child profile is school lane whoever asks');
select public.test_assert(has_function_privilege('service_role', 'public.institution_ai_lane(uuid, uuid)', 'execute') and not has_function_privilege('authenticated', 'public.institution_ai_lane(uuid, uuid)', 'execute') and not has_function_privilege('anon', 'public.institution_ai_lane(uuid, uuid)', 'execute'), 'lane is service-role only');
select public.test_assert(not has_table_privilege('anon', 'public.institution_app_links', 'select') and (select relrowsecurity from pg_class where oid = 'public.institution_app_links'::regclass), 'links: no anon access, RLS on');
-- Unlink by the profile owner stops future copies; recorded app history stays.
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
select public.institution_unlink_app_profile('40000000-0000-0000-0000-000000000001');
reset role;
insert into public.reading_sessions (user_id, child_profile_id, time_spent) values ('00000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000001', 5);
select public.test_assert((select count(*) = 2 from public.institution_readings where source = 'app'), 'after unlink nothing new is copied and history stays');
select public.test_assert(public.institution_ai_lane('00000000-0000-0000-0000-000000000002', null) = 'school', 'a teacher stays school lane after unlinking');
-- Relink, so the reapply comparison covers links and app rows.
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
select public.institution_link_app_profile((select id from public.institution_students where external_id = 'app-fixture'), '40000000-0000-0000-0000-000000000001');
reset role;
select 'Institution app-reading and AI lane checks passed' as result;
