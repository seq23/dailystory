# Privacy evidence for sales review

Reviewed 2026-10-31. This index supports the institutional sales packet; it is
not a privacy policy, legal opinion, signed agreement or compliance attestation.

## Institution evidence: planned / PR #130

The following requested privacy documents are absent from this packet's main
baseline. They were read on the open institution branch at
`d061c637dc568c7f73b7d6f4e96d5bebcb1bedea`; pinned links preserve the reviewed
scope without importing an unmerged release:

- [Student data inventory](https://github.com/seq23/dailystory/blob/d061c637dc568c7f73b7d6f4e96d5bebcb1bedea/docs/privacy/data-inventory.md): school data, access, transmissions, deletion behavior and family-lane differences.
- [Implementation readiness summary](https://github.com/seq23/dailystory/blob/d061c637dc568c7f73b7d6f4e96d5bebcb1bedea/docs/privacy/coppa-ferpa-readiness.md): control evidence and unresolved authority, consent, access, correction and contractual requirements.
- [Draft agreement exhibit worksheet](https://github.com/seq23/dailystory/blob/d061c637dc568c7f73b7d6f4e96d5bebcb1bedea/docs/privacy/ndpa-exhibits-draft.md): preparation notes only; no agreement executed or accepted.

These sources describe teacher-entered school records, school/class access
boundaries and authorized child deletion. They also disclose no automatic
retention, no school export workflow, incomplete correction procedures, and
unverified production configuration, vendor terms and backup deletion. They
do not authorize a school, prove legal compliance or certify the entire product.

## Current family product evidence

Review [profile handling](../../src/hooks/useChildProfiles.ts),
[activity tracking](../../src/hooks/useChildProgressData.ts),
[inference configuration](../../config/product_inference.json), and the
[privacy policy source](../../src/pages/Privacy.tsx) to establish the buyer's
actual use scope. The family product processes account/profile/activity data;
AI and optional voice features add service transmissions and content handling.
School-lane minimization claims must not be applied to the whole family product.

Existing materials under `docs/compliance/` contain broad claims that require
reconciliation with implementation and deployed evidence. A policy statement,
template or vendor certification is not product certification. This packet
does not repeat those statements as verified guarantees or prescribe legal terms.

Before real data, the responsible parties must establish authority/notices,
permitted purpose, contracts, support and incident ownership, retention,
correction, parent access, return/export and verified deletion including backups.
Keep identities, contacts, real student records, signed agreements and credentials
outside this public repository. [Buyer summary](../sales/privacy-security.md).
