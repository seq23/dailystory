# Student data inventory

Reviewed against source: 2026-10-31. This records implemented storage and known gaps, not a retention promise. Production configuration, vendor contracts, backup deletion and access logs have not been independently verified. No real student information belongs in this public repository.

## Institutional workspace

| Data collected | Purpose and storage | Access / transmission | Retention and deletion implemented |
| --- | --- | --- | --- |
| School name, internal UUID, creation timestamp | Tenant identity; `institution_schools` in Supabase Postgres | Assigned members; no public access | No automatic expiry. Owner-managed school deletion cascades institutional records. |
| Adult account UUID, school membership and teacher/admin role | Authorization; `institution_members` | Self or own school admin; existing Supabase Auth account | Owner-controlled revocation. Auth-account deletion removes membership, unassigns classes and clears recorded author UUIDs while preserving school evidence. No self-service escalation. School membership is not proof of legal authority. |
| Class name, school UUID, assigned teacher UUID | Class ownership; `institution_classes` | Assigned teacher and own school admin | No automatic expiry. Class deletion cascades enrollments and class evidence. Owner operation currently required. |
| Child display name or alias, school-scoped external roster ID, internal UUID, optional School grade and Reads at, creation timestamp | Roster profiles; `institution_students` | Teachers of enrolled classes and own school admin | No automatic expiry. `institution_delete_student` checks school-admin authority and deletes the child plus enrollments/readings/assessments/quiz counts. UI requires typed roster ID. |
| Class/student/school UUIDs | Enrollment; `institution_enrollments` | Assigned teacher and own school admin | Cascades when child/class/school is deleted. |
| Story title, reading date, reported minutes (0–180), completion, adult author UUID, timestamp and teacher-recorded source | Educational observations; `institution_readings` | Assigned teacher and own school admin | Immutable to teachers; no automatic expiry. Child deletion cascades. No full story text is collected here. |
| Assessment date, optional grades, adult author UUID, timestamp/source; per-skill correct/question counts | Dated learning evidence; `institution_assessments`, `institution_quiz_results` | Assigned teacher and own school admin | Immutable history; no automatic expiry. Child deletion cascades both tables. No raw answers, voice, disability/IEP or demographic fields. |
| CSV text and preview rows | Roster import | Parsed in browser memory, minimal normalized rows sent to transactional RPC | No CSV storage/upload. Preview clears on cancel, class change, successful import or unmount. Original local file remains on the adult's device. |
| Provider student identifiers, names and school grades | Remote roster preview through `institution-roster` | Existing provider → edge server → authenticated school admin → import RPC | Only selected minimal fields persist after import. Response uses `Cache-Control: no-store`; no provider payload logging. No background sync or deletion reconciliation. |
| Provider OAuth roster tokens and application identifier | Existing authorized provider connection | Server environment `INSTITUTION_ROSTER_CONNECTIONS`, keyed by school UUID | Not student table fields or client env. Owner must rotate/revoke/remove secrets. No expiry/rotation automation. |
| Growth calculations | Report display | Computed from RLS-visible records in browser memory | No separate growth dataset or fabricated historic baseline. |

The institution lane has no child email, birthday, home address, phone number, parent contact, student auth account, advertising identifier, media upload or paid inference call. A free-text alias/title could nevertheless contain personal information; adults must minimize what they enter. This statement does not describe the separate family product below.

## Existing family product and infrastructure

| Data / evidence | Location and purpose | Retention / deletion reality |
| --- | --- | --- |
| Adult sign-in identity, email and sessions | Supabase Auth; family account access | `delete-user-account` attempts Auth deletion after table cleanup. Errors can leave partial cleanup; no universal deletion certificate. |
| Family child display name, birth month/year or legacy birth date, school/reading grades, avatar, favorites/preferences | `child_profiles`, `profiles`, `user_preferences`; personalization | Parent-owned profiles are separate from institutional profiles. Existing child deletion and account-deletion paths exist; they do not administer institution records. |
| Reading sessions, quiz details/answers/skills, games, vocabulary progress, saved stories and collections | Existing Postgres activity tables; family reports | `export-user-data` and `delete-user-account` enumerate family tables. They do not automatically export or erase school-owned records. |
| Guest/offline quiz/game results and preferences | Browser localStorage (`quiz_attempts_local`, `game_sessions_local`), sessionStorage/cache; offline/guest use | No scheduled purge proven; device storage can outlive the cloud account. Clearing cloud data does not clear other devices. |
| Generated story text, requests and images/audio; voice/transcription requests when those features are used | Existing edge functions, configured inference services and storage/cache paths | `config/product_inference.json` lists the inference lane; de-identification is not a guarantee that all free text is anonymous. Vendor retention and object cleanup are owner verification items. This release sends no institutional records to inference. |
| Consent records/token status, IP/user agent, security/audit events, feedback, analytics and cost metadata | Existing consent, audit, analytics, feedback and cost tables and hosting logs | Consent code records verification; it does not prove every legal consent requirement. Account deletion logs personal request details and attempts some anonymization. No comprehensive TTL or log/backup purge proved. |
| Subscription and payment identifiers | Existing subscribers/payment integration | Institutional workspace adds no payment collection. Financial-record retention must be reviewed separately; no retention period invented here. |

## Owner decisions still required

Define and implement purpose-limited retention periods; document the deletion request channel, response owner and verified completion process; inventory actual production regions, object storage buckets, logs and backups; validate vendor/subprocessor terms and retention; establish school authorization and parent-access procedures. Do not use this inventory to promise automatic expiry, backup erasure, comprehensive account deletion or regulatory certification. Removing a membership stops future database authorization, but copies already viewed/downloaded require operational handling. A school admin can use the authenticated Data API for an authorized export; there is no school export workflow in this release.

Code evidence: `supabase/migrations/20261031050519_institutions.sql`, `src/lib/institutions/`, `src/components/InstitutionRosterImport.tsx`, `supabase/functions/institution-roster/`, `supabase/functions/{export-user-data,delete-user-account,confirm-parental-consent}/index.ts`, `src/hooks/useActivityPersistence.ts`, `config/product_inference.json`.
