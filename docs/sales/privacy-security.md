# Privacy and security for institutional review

Source review dated 2026-10-31 for programs serving ages 3-15,
Pre-K-10th grade. Stories are English only; the UI has 8 languages.
This is an implementation summary, not a certification or legal conclusion.

## Start with the data scope

Use [docs/privacy/sales-review.md](../privacy/sales-review.md) for the source
inventory and pinned links to the institution data inventory, readiness summary
and agreement worksheet. Those three documents belong to **planned / PR #130**,
which is not merged at this packet's baseline.

The current family product stores adult account information, child profiles and
reading activity. Its AI story, illustration, narration and optional voice
features can transmit content to configured services. Free-text requests may
contain personal information. Do not describe the family product as collecting
only anonymous data or keeping all processing on the device.

The proposed institution workspace stores aliases/display names, school-scoped
roster identifiers, optional grades, enrollments and teacher-entered observations.
It creates no student sign-in account. Its roster and reporting lane does not
call story-generation services or ingest family activity. Using the family reader
alongside that workspace requires a separate data-flow and authority review.

## Controls supported by source

The institution branch enforces school/class access in database policies and
authorized operations. Teachers see assigned classes; administrators see their
school. Remote roster credentials remain on the server. Imports send normalized
rows rather than storing the source CSV. A school administrator can delete a
child and dependent school records. These are source/test findings, not evidence
that a real institution or provider connection has been accepted in production.

## Requirements still open

Before real data, resolve school or guardian authority, notices, the permitted
educational purpose, vendor terms, incident handling, retention periods, backup
treatment, data return/deletion verification, parent access and record correction.
The school branch lacks automated retention and a school export workflow;
family export/deletion does not cover institutional records. Library and
after-school authority must be assessed for their own operating models.

No regulatory compliance guarantee, signed data agreement or independent security
audit is evidenced by this packet. Older files under `docs/compliance/` and public
policy routes include broad compliance statements; treat them as review inputs,
not procurement attestations. Infrastructure-provider controls do not establish
product certification. Confirm deployed settings and current contractual evidence
privately before answering a questionnaire.

The next step is a buyer-specific review of the data inventory and unresolved
requirements, followed by the [implementation gates](implementation.md).
[Capability evidence](capabilities.md).
