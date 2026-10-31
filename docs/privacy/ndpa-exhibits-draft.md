# NDPA exhibit preparation worksheet — draft

Prepared from code on 2026-10-31. Original implementation notes for transfer into the owner's authorized NDPA form; no contract language, signature, acceptance or legal promises are supplied here. The [SDPC national DPA page](https://privacy.a4l.org/national-dpa/) currently identifies v2.2 and directs members to request a fillable form. **OWNER ONLY:** confirm membership/use rights, applicable state version and the school's required form. This worksheet is not an executed NDPA or a reproduction/modification of the licensed form.

## Exhibit A preparation: services and parties

| Field | Draft answer / owner action |
| --- | --- |
| Service | Institutional reading workspace at `/schools` on the existing reading application. |
| Educational activity | Teachers maintain class child profiles and enter actual reading sessions, grade observations and quiz counts; administrators review across their school. CSV/provider rosters create profiles without student login accounts. |
| Reports | Stories completed, reported minutes, school/reading grade and five literacy skills; dated start/latest observations, question-weighted percentages and same-child class comparisons. No causal improvement claim. |
| Delivery | Existing web frontend plus Supabase Auth/Postgres/RLS and a school-admin roster-preview edge function. Family reading/product inference is a separate lane; not automatically linked. |
| Users | Existing adult teacher/admin accounts. Institutional children are records, not login accounts. |
| Provider legal entity, address, representative, notice/security contact | **OWNER ONLY — supply privately in the authorized agreement.** |
| LEA/district/library legal entity, address, authorized signatory and designated representative | **OWNER ONLY — supply privately; no real institution or personal contact details in this repository.** |
| Term, scope/population, effective date, fees, state addenda, signatures | **OWNER ONLY — not determined or accepted by code.** |

## Exhibit B preparation: schedule of student data

| Category / specific elements | New institution lane | Other application scope to disclose if included in the agreement |
| --- | --- | --- |
| Student identification | Display name or alias; internal child UUID; school-scoped external roster ID, provider namespace where used | Family display name and parent linkage. |
| Enrollment | School, class and assigned teacher UUIDs; optional School grade | Family school grade; no new physical school address. |
| Educational performance | Teacher-recorded Reads at grade; dated skill correct/total counts for vocabulary, spelling, definitions, context, inference | Family quiz answers/details and other skills, games and vocabulary progress. |
| Educational activity | Teacher-recorded story title, minutes, completion, reading date; assessment date, author UUID and recording timestamp/source | Family reading sessions, generated/saved story content and personalization requests. |
| Age / date of birth | Not requested by the institution lane | Family profiles can store birth month/year or legacy dates. |
| Parent/guardian details | Not requested by the institution lane | Family adult identity/contact and consent records. |
| Authentication / credentials | No student credentials; existing adult UUIDs and institution roles | Adult Auth records; provider roster secrets are server configuration. |
| Contact details / home address / phone | No institutional child fields | **OWNER ONLY — confirm actual account, support and logging collection outside this lane.** |
| Demographics, disability, IEP/504, attendance, discipline, health, biometric data, student photos or voice | No fields/collection paths added in this institution lane | Family voice/image features and personalization need separate inventory and scope decision; do not mark the entire product “none” without review. |
| Device/online identifiers and operational metadata | Existing authenticated web/hosting traffic; institution frontend adds no student analytics or local persistent store | Existing session, audit, IP/user-agent, analytics, browser storage and inference-service metadata; verify production configuration. |
| Derived data | Recorded-only growth values computed in browser, not a separate stored model | No claim that scores establish effectiveness. |

## Retention, deletion and security exhibit preparation

**Implemented:** per-school/class RLS; least-privilege browser grants; server-only provider credentials; authenticated school-admin provider previews; atomic imports; immutable teacher evidence; cascading school-child deletion; no source CSV persistence or provider-body logging. See the inventory for exact tables and the local SQL tests for allow/deny evidence.

**OWNER ONLY — unresolved:** contractual retention periods, automatic purge implementation, termination return/deletion schedule, backup/log purge, deletion certificate/verification, parent access/amendment and school export process, production regions, vendor subprocessors, incident contacts/notification periods, security framework attestations and audits. No completed checkbox may imply these controls exist. Public privacy routes and vendor lists are source material, not proof of contractual terms or current infrastructure settings.

**OWNER ONLY — remaining forms:** applicable state exhibits, authorized subcontractor schedule, security controls exhibit, any general offer, transfers, signatures and acceptance. Do not publish real contacts, student examples, credentials or signed agreements to this public repository. No agreement has been approved or signed as part of this job.
