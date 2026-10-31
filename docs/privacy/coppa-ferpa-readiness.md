# COPPA / FERPA implementation readiness

Source review: 2026-10-31. This is an engineering summary for owner/counsel review, not a certification, signed agreement or legal conclusion. No school authorization was granted or accepted by this development work.

## COPPA

The [FTC's COPPA guidance, school section](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions) describes limited school consent for an educational purpose and the operator's own responsibilities. A teacher login alone cannot establish that basis. The FTC's [2025 rule update](https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-finalizes-changes-childrens-privacy-rule-limiting-companies-ability-monetize-kids-data) also requires review of current retention and security obligations; this repository is not evidence of compliance with all amendments.

The new workspace minimizes roster fields, permits aliases, has adult-only institutional membership, creates no child auth account and transmits no school records to advertising or inference services. Teacher/admin authorization is enforced in Postgres RLS, not by a client flag. Remote roster access is school-scoped and school-admin-only. No marketing, contact-list collection, email or payment flow was added.

The existing family lane contains parental-consent request/confirmation handlers, token expiry and consent audit records. These implementation mechanisms do not prove verifiable parental consent, complete coverage or appropriate school consent. The institution lane currently has no school notice/consent collection, school-identity verification, consent withdrawal workflow or automatic retention policy. The owner must establish those processes and the lawful scope before provisioning real student data. Do not rely on the family email-link implementation as blanket institutional authorization.

## FERPA

The education department's [online educational services guidance](https://studentprivacy.ed.gov/sites/default/files/resource_document/file/Student%20Privacy%20and%20Online%20Educational%20Services%20%28February%202014%29_0.pdf) explains the conditions for disclosures to service providers and the school-official exception. Restricting a teacher to a class helps implement legitimate educational access; it does not establish the required institutional control, contract, notice or permissible use by itself.

The new lane separates school and household records, scopes teachers to assigned classes, gives school admins cross-teacher access only inside their school, and prevents client self-promotion. Grade and quiz evidence remains dated and attributable. A school admin can delete a school child and all associated institutional records through the authorized RPC/UI. Assessment/readings are immutable to teachers; a mistaken observation currently requires admin deletion of the child or an owner-managed correction, so a practical correction procedure remains to be built. Parent access to institutional records requires the school's process; the family export handler does not include institutional records.

Owner/counsel must determine the applicable disclosure basis, direct control and permitted uses, parent/eligible-student inspection and amendment procedures, redisclosure limits, vendor terms, breach handling, state requirements, deletion/return at termination and backup treatment. This summary does not claim that the product qualifies for the school-official exception or that an NDPA is in force.

## Evidence and acceptance boundaries

The local SQL suite exercises own-class access, cross-class/cross-school denial, membership escalation denial, atomic imports/assessments and child deletion. Unit/component tests cover recorded-only reporting and disconnected adapters. These are implementation checks, not external security or legal approvals. Production deployment, provisioned membership, current provider contracts, browser visual verification, and configured retention remain unverified. Review alongside [the inventory](data-inventory.md) and [the NDPA worksheet](ndpa-exhibits-draft.md).
