\set ON_ERROR_STOP on
-- A failed assertion raises an error; this exercises real PostgreSQL RLS.
create function public.test_assert(ok boolean, message text) returns void language plpgsql as $$ begin if ok is distinct from true then raise exception 'FAIL: %', message; end if; end $$;
insert into auth.users values ('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002'),('00000000-0000-0000-0000-000000000003'),('00000000-0000-0000-0000-000000000004');
insert into public.institution_schools (id, name) values ('10000000-0000-0000-0000-000000000001','Fixture School A'),('10000000-0000-0000-0000-000000000002','Fixture School B');
insert into public.institution_members values ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','teacher'),('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','teacher'),('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003','school_admin'),('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000004','school_admin');
insert into public.institution_classes values ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Fixture Class A'),('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','Fixture Class B'),('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000004','Fixture Class C');
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
select public.test_assert((select count(*) = 1 from public.institution_classes), 'teacher sees only assigned class');
select public.test_assert(public.institution_import_roster('20000000-0000-0000-0000-000000000001','[{"external_id":"fixture-a","display_name":"Reader A","school_grade":"2","reading_grade":"1"}]') = 1,'teacher imports own class');
select public.test_assert(public.institution_import_roster('20000000-0000-0000-0000-000000000001','[{"external_id":"fixture-a","display_name":"Ignored","school_grade":"9"}]') = 0,'reimport idempotent');
select public.test_assert((select display_name = 'Reader A' and school_grade = '2' from public.institution_students), 'reimport cannot overwrite existing profile');
insert into public.institution_readings(school_id,class_id,student_id,story_title,minutes,read_at) select school_id,'20000000-0000-0000-0000-000000000001',id,'Fixture story',12,current_date from public.institution_students;
select public.institution_record_assessment('20000000-0000-0000-0000-000000000001',id,current_date,'2','1','[{"skill":"inference","correct":0,"total":2}]') from public.institution_students;
select public.test_assert((select count(*) = 1 from public.institution_quiz_results), 'teacher sees own quiz');
do $$ begin
  begin perform public.institution_import_roster('20000000-0000-0000-0000-000000000002','[{"external_id":"x","display_name":"Reader X"}]'); raise exception 'FAIL cross-class import'; exception when insufficient_privilege then null; end;
  begin perform public.institution_assign_teacher('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004'); raise exception 'FAIL teacher assigns roles'; exception when insufficient_privilege then null; end;
  begin insert into public.institution_members values ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','school_admin'); raise exception 'FAIL self escalation'; exception when insufficient_privilege then null; end;
  begin update public.institution_classes set teacher_user_id = '00000000-0000-0000-0000-000000000002'; raise exception 'FAIL class reassignment'; exception when insufficient_privilege then null; end;
  begin delete from public.institution_readings; raise exception 'FAIL teacher deletes evidence'; exception when insufficient_privilege then null; end;
  begin insert into public.institution_readings(school_id,class_id,student_id,story_title,minutes,read_at,recorded_by) select school_id,'20000000-0000-0000-0000-000000000001',id,'Fixture',1,current_date,'00000000-0000-0000-0000-000000000002' from public.institution_students; raise exception 'FAIL spoofed author'; exception when insufficient_privilege then null; end;
  begin perform public.institution_import_roster('20000000-0000-0000-0000-000000000001','[{"external_id":"rolled-back","display_name":"Reader R"},{"external_id":"invalid","display_name":""}]'); raise exception 'FAIL invalid import'; exception when check_violation then null; end;
  perform public.test_assert(not exists(select 1 from public.institution_students where external_id='rolled-back'), 'import all-or-nothing');
  begin perform public.institution_import_roster('20000000-0000-0000-0000-000000000001','[{"external_id":"duplicate-fixture","display_name":"Reader D"},{"external_id":"duplicate-fixture","display_name":"Different child"}]'); raise exception 'FAIL duplicate identifiers silently merge children'; exception when check_violation then null; end;
  perform public.test_assert(not exists(select 1 from public.institution_students where external_id='duplicate-fixture'), 'duplicate identifiers roll back the whole import');
  begin perform public.institution_import_roster('20000000-0000-0000-0000-000000000001','[{"external_id":"   ","display_name":"Reader W"}]'); raise exception 'FAIL blank roster identifier accepted'; exception when check_violation then null; end;
  begin perform public.institution_import_roster('20000000-0000-0000-0000-000000000001','[{"external_id":"extra-fixture","display_name":"Reader E","unrequested_field":"fixture"}]'); raise exception 'FAIL nonminimal direct roster accepted'; exception when check_violation then null; end;
  begin perform public.institution_record_assessment('20000000-0000-0000-0000-000000000001',(select id from public.institution_students limit 1),current_date,'2','1','[{"skill":"context","correct":3,"total":2}]'); raise exception 'FAIL invalid quiz score'; exception when check_violation then null; end;
  perform public.test_assert((select count(*) = 1 from public.institution_assessments), 'invalid assessment rolls back');
end $$;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
select public.test_assert((select count(*) = 0 from public.institution_students), 'other teacher cannot read child');
select public.test_assert((select count(*) = 0 from public.institution_readings), 'other teacher cannot read readings');
select public.test_assert((select count(*) = 0 from public.institution_assessments), 'other teacher cannot read assessments');
select public.test_assert((select count(*) = 0 from public.institution_quiz_results), 'other teacher cannot read quiz');
do $$ begin
  begin perform public.institution_import_roster('20000000-0000-0000-0000-000000000002','[{"external_id":"fixture-a","display_name":"Claimed"}]'); raise exception 'FAIL guessed identifier claims child'; exception when insufficient_privilege then null; end;
  begin insert into public.institution_readings(school_id,class_id,student_id,story_title,minutes,read_at) values ('10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',(select id from public.institution_students where external_id='fixture-a'),'Guessed fixture',1,current_date); raise exception 'FAIL cross-class reading'; exception when insufficient_privilege then null; end;
  begin perform public.institution_record_assessment('20000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',current_date,'2','1','[]'); raise exception 'FAIL cross-class assessment'; exception when insufficient_privilege then null; end;
end $$;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000003';
select public.test_assert((select count(*) = 2 from public.institution_classes), 'school admin sees all school classes only');
select public.test_assert((select count(*) = 1 from public.institution_students), 'school admin sees child');
select public.test_assert((select count(*) = 1 from public.institution_quiz_results), 'school admin sees scores across teachers');
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000004';
select public.test_assert((select count(*) = 0 from public.institution_students), 'other school admin cannot read child');
select public.test_assert((select count(*) = 0 from public.institution_quiz_results), 'other school admin cannot read quiz');
do $$ begin
  begin perform public.institution_assign_teacher('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004'); raise exception 'FAIL foreign school assignment'; exception when insufficient_privilege then null; end;
  begin perform public.institution_import_roster('20000000-0000-0000-0000-000000000001','[{"external_id":"foreign-fixture","display_name":"Reader F"}]'); raise exception 'FAIL foreign school import'; exception when insufficient_privilege then null; end;
end $$;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000099';
select public.test_assert((select count(*) = 0 from public.institution_classes), 'nonmember cannot read classes');
set request.jwt.claim.sub = '';
select public.test_assert((select count(*) = 0 from public.institution_students), 'no principal cannot read children');
reset role;
do $$ declare t text; begin
  foreach t in array array['institution_schools','institution_members','institution_classes','institution_students','institution_enrollments','institution_readings','institution_assessments','institution_quiz_results'] loop
    perform public.test_assert(not has_table_privilege('anon','public.' || t,'select'), 'anon has no access: ' || t);
    perform public.test_assert((select relrowsecurity from pg_class where oid = ('public.' || t)::regclass), 'RLS enabled: ' || t);
  end loop;
end $$;
delete from auth.users where id = '00000000-0000-0000-0000-000000000001';
select public.test_assert((select count(*) = 1 from public.institution_readings where recorded_by is null), 'adult deletion preserves deidentified evidence');
select public.test_assert((select count(*) = 1 from public.institution_classes where teacher_user_id is null), 'adult deletion unassigns class');
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000003';
select public.institution_delete_student(id) from public.institution_students;
select public.test_assert((select count(*) = 0 from public.institution_readings), 'child deletion removes readings');
select public.test_assert((select count(*) = 0 from public.institution_quiz_results), 'child deletion removes quizzes');
select 'Institution RLS, atomicity and deletion checks passed' as result;

-- Leave all data categories populated for the host's migration reapply comparison.
select public.institution_import_roster('20000000-0000-0000-0000-000000000002','[{"external_id":"reapply-fixture","display_name":"Reader B","school_grade":"2","reading_grade":"1"}]');
insert into public.institution_readings(school_id,class_id,student_id,story_title,minutes,read_at) select school_id,'20000000-0000-0000-0000-000000000002',id,'Reapply fixture story',4.5,current_date from public.institution_students;
select public.institution_record_assessment('20000000-0000-0000-0000-000000000002',id,current_date,'2','1','[{"skill":"context","correct":0,"total":3}]') from public.institution_students;
