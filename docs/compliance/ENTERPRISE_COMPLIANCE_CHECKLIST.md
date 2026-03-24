# 🧠 ENTERPRISE PRIVACY & COMPLIANCE CHECKLIST — TIME-2-READ

**Owner:** Spry VSL LLC  
**Canonical Privacy Email:** privacy@time-2-read.com  
**Current Phase:** Phase 2 (Mid-Tier 🟡)  
**Last Audited:** March 2026

---

## 1. 🔐 DATA PRIVACY & REGULATORY COVERAGE

### GDPR (EU) 🟢

| Requirement | Status | Evidence |
|---|---|---|
| Data mapping (full data inventory) | ✅ Done | `docs/GDPR_RECORDS_OF_PROCESSING.md` — RoPA with 6 processing activities |
| Lawful basis defined per data type | ✅ Done | `Privacy.tsx` Article 6 table + RoPA |
| Data subject rights workflow (access/delete/export) | ✅ Done | `export-user-data` + `delete-user-account` edge functions |
| DPAs with vendors | 🟡 Partial | Stripe & Supabase DPAs accepted; ElevenLabs, Runware, Anthropic pending |
| Cookie consent | ✅ Done | `CookieConsent.tsx` — granular Essential/Analytics/Marketing |
| Records of Processing Activities (RoPA) | ✅ Done | `docs/GDPR_RECORDS_OF_PROCESSING.md` |
| GDPR legal page | ✅ Done | `/gdpr` route |

### CCPA / CPRA (California) 🟢

| Requirement | Status | Evidence |
|---|---|---|
| "Do not sell/share" statement | ✅ Done | `Privacy.tsx` + `CCPA.tsx` |
| Data categories disclosed | ✅ Done | `CCPA.tsx` — 4 categories listed |
| Consumer request workflow | ✅ Done | Export + Deletion edge functions |
| Non-discrimination clause | ✅ Done | `CCPA.tsx` |
| Right to Correct (CPRA) | ✅ Done | `CCPA.tsx` |
| CCPA legal page | ✅ Done | `/ccpa` route |

### COPPA (Children <13) 🟢

| Requirement | Status | Evidence |
|---|---|---|
| Age gating on signup | ✅ Done | `child_profiles.birth_year` + `validate_child_data()` trigger (ages 3-17) |
| Parental consent system | ✅ Done | `parental_consents` table + `verify-parental-consent` edge function |
| No behavioral tracking of minors | ✅ Done | Cookie consent defaults to essential-only |
| Personal info detection | ✅ Done | `personal_info_incidents` table + `log-personal-info-incident` edge function |
| Data minimization for children | ✅ Done | `minimize_incident_data()` + `validate_child_data()` triggers |

### FERPA (Education) 🟢

| Requirement | Status | Evidence |
|---|---|---|
| FERPA compliance page | ✅ Done | `/ferpa` route |
| Student data handling defined | ✅ Done | `FERPA.tsx` — school data ownership stated |
| Access controls for student data | ✅ Done | RLS on `child_profiles` (parent_user_id only) |

### Other U.S. State Laws (VCDPA / CPA / CTDPA) 🟢

| Requirement | Status | Evidence |
|---|---|---|
| Access/delete/opt-out rights | ✅ Covered | GDPR + CCPA workflows cover these |
| Unified rights request system | ✅ Done | Single email + edge function pipeline |

### LGPD (Brazil) 🟡

| Requirement | Status | Evidence |
|---|---|---|
| LGPD-specific page | ❌ Not done | Not needed unless significant Brazilian traffic |
| GDPR-equivalent protections | ✅ Covered | GDPR framework applies |

### PIPEDA (Canada) 🟢

| Requirement | Status | Evidence |
|---|---|---|
| Consent-based data usage | ✅ Covered | GDPR consent model covers this |
| Transparency requirements | ✅ Covered | Privacy policy + Vendors page |

---

## 2. 🛡️ SECURITY & TRUST

### Security Fundamentals (NON-NEGOTIABLE) 🟢

| Requirement | Status | Evidence |
|---|---|---|
| HTTPS everywhere | ✅ Done | Cloudflare enforces TLS |
| No plaintext sensitive data storage | ✅ Done | Supabase handles encryption at rest; Stripe handles card data |
| Environment variables secured | ✅ Done | Supabase secrets store (8 secrets configured) |
| Secrets not in repo | ✅ Done | `.gitignore` excludes `.env`; keys in Supabase vault |
| Rate limiting / abuse protection | ✅ Done | `api_rate_limits` table + `rateLimit.ts` shared module (30-60 req/min) |
| Input validation | ✅ Done | Zod schemas in `inputValidation.ts` |
| Error sanitization | ✅ Done | `sanitizeError.ts` — generic client messages, full server logs |

### SOC 2 Readiness 🟡

| Requirement | Status | Evidence |
|---|---|---|
| Access control (least privilege) | ✅ Done | RLS on all 29 tables; service_role for admin ops only |
| Unique logins (no shared credentials) | ✅ Done | Supabase Auth per-user |
| Basic logging of access/activity | ✅ Done | `security_audit_log` + `security_monitoring` tables |
| Incident response plan | ✅ Done | `docs/INCIDENT_RESPONSE_PLAN.md` |
| Vendor risk assessments | 🟡 Partial | Vendor list complete; formal risk tiering not documented |
| Formal security policies (written docs) | 🟡 Partial | IRP exists; formal InfoSec policy not written |
| Backup + recovery procedures | ✅ Done | Supabase automated backups (PITR on Pro plan) |
| SOC 2 audit (Vanta/Drata/Secureframe) | ❌ Not started | Estimated $30k-$100k; deferred until enterprise contracts require it |
| Continuous monitoring tooling | ❌ Not started | Would come with SOC 2 platform |

### ISO 27001 🔴

| Requirement | Status | Evidence |
|---|---|---|
| ISMS | ❌ Not started | Only needed at larger scale |
| Risk register | ❌ Not started | Formal risk register not maintained |
| Formal security governance | ❌ Not started | Single-team operation currently |

---

## 3. 📊 DATA GOVERNANCE

### Data Inventory & Classification 🟢

| Requirement | Status | Evidence |
|---|---|---|
| Inventory all data collected | ✅ Done | RoPA + 29 tables documented in types.ts |
| Classify: Personal data | ✅ Done | `profiles`, `child_profiles`, `subscribers` identified as sensitive |
| Classify: Sensitive data | ✅ Done | CRITICAL risk level on `subscribers`, `child_profiles` in `enhanced_security_audit()` |
| Define where each data type is stored | ✅ Done | RoPA documents storage per processing activity |

### Data Minimization 🟢

| Requirement | Status | Evidence |
|---|---|---|
| Only collect what is necessary | ✅ Done | Triggers truncate fields: `special_request` 500 chars, `hobbies` 300 chars, `detected_content` 300 chars |
| No "just in case" data collection | ✅ Done | No analytics without consent; PII stripped from AI prompts via `secure_debug_logging()` |

### Data Retention Policy 🟢

| Requirement | Status | Evidence |
|---|---|---|
| Define retention periods | ✅ Done | Debug logs: 30 days, Audit logs: 90 days, Incidents: 2 years, Sessions: 30 days, Rate limits: 7 days |
| Auto-delete where possible | ✅ Done | `comprehensive_security_cleanup()` DB function handles all retention |
| User data anonymization | ✅ Done | `anonymize_old_user_data()` — 3-year inactive threshold |

### Data Deletion Workflow 🟢

| Requirement | Status | Evidence |
|---|---|---|
| Ability to delete user data on request | ✅ Done | `delete-user-account` edge function — cascading deletion |
| Confirm deletion across databases | ✅ Done | Edge function deletes from 10+ tables |
| Account restriction (GDPR Art. 18) | ✅ Done | `AccountRestriction.tsx` + `profiles.account_status` field |
| Consent withdrawal (GDPR Art. 7(3)) | ✅ Done | `ConsentWithdrawal.tsx` + `consent_records` table |

---

## 4. 🧩 THIRD-PARTY & VENDOR MANAGEMENT

### Vendor Inventory 🟢

| Vendor | Category | Data Processed | DPA Status |
|---|---|---|---|
| Supabase | Database & Auth | All user data | ✅ DPA accepted |
| OpenAI | AI Story Generation | Anonymized prompts | ✅ Enterprise DPA |
| Stripe | Payments | Email, payment tokens | ✅ DPA (PCI DSS) |
| Resend | Email | Email addresses | ✅ DPA accepted |
| Cloudflare | Hosting & CDN | IP addresses, traffic | ✅ DPA (standard) |
| GitHub | Source Code & CI/CD | No user data | ✅ N/A |
| Runware | AI Image Generation | No PII in prompts | 🟡 Pending DPA |
| ElevenLabs | Text-to-Speech | No user identifiers | 🟡 Pending DPA |
| Anthropic | AI fallback | Anonymized prompts | 🟡 Pending DPA |

### Vendor Risk Tiering 🟡

| Tier | Vendors | Rationale |
|---|---|---|
| **High-risk** (stores personal data) | Supabase, Stripe | Direct PII/payment storage |
| **Medium-risk** (processes data) | OpenAI, Resend, ElevenLabs | Transient processing |
| **Low-risk** (infra only) | Cloudflare, GitHub, Runware | No PII exposure |

### Subprocessor Transparency 🟢

| Requirement | Status | Evidence |
|---|---|---|
| Vendor list published | ✅ Done | `/vendors` route |
| Data transfers documented | ✅ Done | `/data-transfers` route with SCCs |
| Subprocessor changes communicated | 🟡 Not formalized | No notification mechanism yet |

---

## 5. 📜 LEGAL DOCUMENT STACK

### Required Documents 🟢

| Document | Status | Route/Location |
|---|---|---|
| Privacy Policy | ✅ Done | `/privacy` |
| Terms of Service | ✅ Done | `/terms` |
| GDPR Rights | ✅ Done | `/gdpr` |
| CCPA Rights | ✅ Done | `/ccpa` |
| FERPA Statement | ✅ Done | `/ferpa` |
| Accessibility (WCAG 2.1 AA) | ✅ Done | `/accessibility` |
| Vendor Disclosure | ✅ Done | `/vendors` |
| Data Transfer Policy | ✅ Done | `/data-transfers` |
| Cookie Policy | ✅ Done | Embedded in `CookieConsent.tsx` |

### Enterprise Add-Ons 🟡

| Document | Status | Notes |
|---|---|---|
| Data Processing Agreement (DPA template) | ❌ Not created | Draft when B2B sales begin |
| Security Overview / Whitepaper | ❌ Not created | Draft when enterprise inquiries come |
| Acceptable Use Policy (AUP) | ❌ Not created | Low priority — add to Terms if needed |
| Incident Response Policy | ✅ Done | `docs/INCIDENT_RESPONSE_PLAN.md` |
| Subprocessor List (standalone) | ✅ Done | `/vendors` page serves this purpose |

---

## 6. 🔍 AUDITABILITY & LOGGING

| Requirement | Status | Evidence |
|---|---|---|
| Login tracking | ✅ Done | `user_sessions` table with IP + user agent |
| Admin actions logged | ✅ Done | `security_audit_log` — all service_role ops logged |
| Data access events | ✅ Done | `security_monitoring` table with risk levels |
| Sensitive data modification audit | ✅ Done | `enhanced_security_audit()` trigger on subscribers, child_profiles |
| Subscription tampering detection | ✅ Done | `detect_subscription_access_anomalies()` function |
| Suspicious pattern detection | ✅ Done | `detect_suspicious_patterns()` function |
| Reconstruct who accessed what when | ✅ Done | `security_monitoring` logs user_id, table, operation, timestamp, risk_level |
| Audit log retention | ✅ Done | 90-day retention via `cleanup_security_audit_log()` |

---

## 7. 🚨 INCIDENT RESPONSE & BREACH HANDLING

| Requirement | Status | Evidence |
|---|---|---|
| Breach response plan | ✅ Done | `docs/INCIDENT_RESPONSE_PLAN.md` — 6 phases |
| GDPR 72-hour notification | ✅ Documented | IRP Phase 5 + `data_breach_log` table |
| Breach log table | ✅ Done | `data_breach_log` — severity, affected users, remediation, authority notification timestamps |
| COPPA parent notification | ✅ Documented | IRP Section 5 — specific parent notification template |
| Internal escalation template | ✅ Done | IRP Section 6 |
| Public statement template | ✅ Done | IRP Section 6 |

---

## 8. 👥 ACCESS CONTROL & INTERNAL SECURITY

| Requirement | Status | Evidence |
|---|---|---|
| Least privilege access | ✅ Done | RLS on all 29 tables; users access own data only |
| Remove access when no longer needed | ✅ Done | `cleanup_expired_sessions()` auto-expires |
| MFA for critical systems | 🟡 Available | Supabase dashboard supports MFA; not enforced on app users |
| RBAC | 🟡 Partial | service_role vs authenticated vs anon; no admin UI roles |
| SSO (Okta / Google Workspace) | ❌ Not implemented | Only needed for enterprise admin panel |
| UUID validation on inputs | ✅ Done | `sanitize_uuid_inputs()` trigger |
| Identity change prevention | ✅ Done | `prevent_subscriber_identity_change_trigger()` blocks user_id/email changes |

---

## 9. 🌐 INFRASTRUCTURE & DEPLOYMENT

| Requirement | Status | Evidence |
|---|---|---|
| Secure hosting | ✅ Done | Cloudflare (CDN, DDoS, WAF) |
| No public exposed secrets | ✅ Done | Only anon key (publishable) in client code |
| Proper DNS + TLS | ✅ Done | Cloudflare manages |
| DDoS protection | ✅ Done | Cloudflare included |
| WAF | ✅ Done | Cloudflare included |
| Infrastructure monitoring | 🟡 Basic | Supabase dashboard metrics; no dedicated APM |

---

## 10. 🧠 WHAT ENTERPRISE BUYERS WILL ASK — OUR ANSWERS

### "Do you have SOC 2?"

> **Not yet.** We have SOC 2-equivalent controls in place: RLS on all 29 tables, comprehensive audit logging (`security_audit_log` + `security_monitoring`), automated data retention cleanup, incident response plan, and rate limiting. Formal SOC 2 Type II certification via Vanta/Drata is planned when enterprise contract volume justifies the $30k-$100k investment. Our primary infrastructure providers (Supabase, Stripe, Cloudflare) are SOC 2 certified.

### "Where is data stored?"

> **United States.** All user data is stored in Supabase (AWS us-east-1). Payment data is processed by Stripe (US/EU regional processing — we never see full card numbers). Static assets are served via Cloudflare's global CDN. AI processing is transient through OpenAI (US), Runware, and ElevenLabs — no user data is retained by these processors. All cross-border transfers are governed by Standard Contractual Clauses (SCCs). Full details at `/data-transfers`.

### "Do you sell data?"

> **No. We do not sell, rent, or share personal information with third parties for their marketing purposes.** This is explicitly stated in our Privacy Policy and CCPA disclosure. We have zero advertising or data broker relationships.

### "Who are your subprocessors?"

> **8 subprocessors**, all documented at `/vendors`:
> - **Supabase** — Database & Authentication
> - **OpenAI** — AI Story Generation
> - **Runware** — AI Image Generation
> - **ElevenLabs** — Text-to-Speech
> - **Stripe** — Payment Processing (PCI DSS compliant)
> - **Resend** — Transactional Email
> - **Cloudflare** — Hosting, CDN, DDoS Protection
> - **GitHub** — Source Code & CI/CD (no user data)

### "How do you handle deletion requests?"

> **Automated cascading deletion.** Users can request deletion through their account dashboard or by emailing privacy@time-2-read.com. Our `delete-user-account` edge function removes data from 10+ tables including profiles, stories, reading sessions, quiz attempts, vocabulary progress, child profiles, consent records, and subscription data. Deletion is confirmed and irreversible.

### "What happens in a breach?"

> We follow our documented Incident Response Plan (`docs/INCIDENT_RESPONSE_PLAN.md`) with 6 phases: Detection → Containment → Investigation → Eradication → Recovery → Post-Incident. GDPR-affected users are notified within 72 hours. COPPA-affected parents receive immediate direct notification. All breaches are logged in our `data_breach_log` table with severity, affected data types, remediation steps, and authority notification timestamps.

### "Do you support DPAs?"

> **Yes for key vendors** (Supabase, OpenAI, Stripe, Resend). DPAs with ElevenLabs, Runware, and Anthropic are pending. We can provide a DPA template for B2B/school contracts when needed — this is on our Phase 2 roadmap.

---

## 🔥 PHASE STRATEGY — TIME-2-READ

### Phase 1 ✅ COMPLETE (Current State)

- [x] Full privacy + legal page stack (8 pages)
- [x] Minimal data collection with DB-level enforcement
- [x] Vendor transparency with public subprocessor list
- [x] Security fundamentals (HTTPS, secrets management, rate limiting, input validation)
- [x] COPPA compliance (age gate, parental consent, PII detection)
- [x] Data subject rights (export, delete, restrict, withdraw consent)
- [x] Audit logging and breach log infrastructure
- [x] Incident Response Plan
- [x] Cookie consent banner

### Phase 2 🟡 IN PROGRESS (When B2B Sales Begin)

- [ ] DPA template for school/enterprise contracts
- [ ] Security overview document / whitepaper
- [ ] Complete pending vendor DPAs (ElevenLabs, Runware, Anthropic)
- [ ] Formal vendor risk tiering documentation
- [ ] MFA enforcement option for premium users
- [ ] Subprocessor change notification mechanism
- [ ] Formal InfoSec policy document
- [ ] Infrastructure monitoring (APM)

### Phase 3 🔴 WHEN DEAL SIZE WARRANTS IT

- [ ] SOC 2 Type II via Vanta/Drata/Secureframe ($30k-$100k)
- [ ] ISO 27001 ISMS
- [ ] Formal risk register
- [ ] Enterprise SSO (Okta / Google Workspace)
- [ ] Dedicated security governance role
- [ ] LGPD-specific compliance page (if Brazilian market)
- [ ] Continuous monitoring tooling

---

## 📋 REVIEW SCHEDULE

- Before each release
- Quarterly full audit
- Whenever a new vendor is added
- When entering new geographic markets
- Before signing enterprise/school contracts

---

**Classification:** Internal Use Only  
**Document Owner:** Spry VSL LLC  
**Review Frequency:** Quarterly
