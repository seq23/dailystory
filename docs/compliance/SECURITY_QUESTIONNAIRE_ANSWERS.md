# Security Questionnaire Answer Bank

**Company:** Spry VSL LLC (dba Time-2-Read)  
**Last Updated:** 2026-03-24  
**Contact:** privacy@time-2-read.com

Use this document to quickly respond to enterprise security questionnaires, procurement forms, and vendor risk assessments.

---

## SECTION 1 — COMPANY INFORMATION (Q1–Q10)

**Q1: What is the legal entity name?**  
A: Spry VSL LLC

**Q2: What is the product name?**  
A: Time-2-Read (time-2-read.lovable.app)

**Q3: What does the product do?**  
A: Time-2-Read is an AI-powered children's reading platform that generates personalized, never-ending stories with illustrations and text-to-speech narration.

**Q4: Who is the Data Protection Officer / Privacy contact?**  
A: privacy@time-2-read.com

**Q5: What jurisdiction is the company incorporated in?**  
A: United States (Delaware)

**Q6: How many employees have access to production systems?**  
A: Access is limited to essential personnel on a need-to-know basis with least privilege controls.

**Q7: Do you have a dedicated security team?**  
A: Security is managed by the engineering team with defined policies documented in `docs/compliance/INFORMATION_SECURITY_POLICY.md`.

**Q8: What is your company website?**  
A: https://time-2-read.lovable.app

**Q9: Do you carry cyber liability insurance?**  
A: Planned for Phase 3 enterprise readiness. Not yet in place.

**Q10: What is your fiscal year?**  
A: Calendar year (January–December).

---

## SECTION 2 — DATA COLLECTION & HANDLING (Q11–Q30)

**Q11: What personal data do you collect?**  
A: Email address, display name, reading preferences, grade level, and reading session data. For child profiles: first name, grade level, and parent email (for consent).

**Q12: Do you collect sensitive personal data (health, biometric, financial)?**  
A: No. We do not collect SSNs, government IDs, biometric data, health data, or precise geolocation.

**Q13: Do you collect data from children under 13?**  
A: Yes — first name, grade level, and reading preferences only. Parental consent is obtained via verified email with token-based confirmation (COPPA compliant).

**Q14: Do you sell personal data?**  
A: No. We do not sell, rent, or share personal data with third parties for advertising or marketing purposes.

**Q15: Do you use personal data to train AI models?**  
A: No. All AI providers (OpenAI, Anthropic) are configured with zero-data-retention API settings. User data is never used for model training.

**Q16: What is your data retention policy?**  
A: Debug logs: 30 days. Security audit logs: 90 days. Inactive accounts: anonymized after 3 years. Active accounts: retained for duration of the account.

**Q17: Can users export their data?**  
A: Yes. Users can export all their data in JSON format via the `export-user-data` edge function (GDPR Article 20 — data portability).

**Q18: Can users delete their data?**  
A: Yes. Full account deletion with cascading removal across all tables is supported via the `delete-user-account` edge function.

**Q19: Do you process data for purposes beyond the stated service?**  
A: No. Data is processed solely to provide the reading platform service.

**Q20: Do you share data with third parties for marketing?**  
A: No.

**Q21: Do you use cookies?**  
A: Yes — functional cookies only (authentication, preferences). We display a cookie consent banner. No third-party advertising cookies.

**Q22: Do you use analytics or tracking tools?**  
A: Internal analytics only (reading sessions, story generation metrics). No third-party analytics platforms (no Google Analytics, no Meta Pixel).

**Q23: Do you profile users for advertising purposes?**  
A: No. No behavioral advertising or cross-site tracking.

**Q24: How do you handle data subject access requests (DSARs)?**  
A: Via the `export-user-data` edge function which exports all user data in JSON format. Requests can be submitted to privacy@time-2-read.com.

**Q25: How do you handle deletion requests?**  
A: Via the `delete-user-account` edge function which performs cascading deletion across all database tables. Requests processed within 30 days.

**Q26: Do you anonymize or pseudonymize data?**  
A: Yes. Inactive accounts are automatically anonymized after 3 years via the `anonymize_old_user_data` database function.

**Q27: What data do AI providers receive?**  
A: Story generation prompts only — these contain reading preferences and story context but no personally identifiable information (no names, emails, or addresses).

**Q28: Do you store voice recordings?**  
A: No. Text-to-speech is server-side via ElevenLabs. Audio is generated on-demand and streamed; no recordings are stored.

**Q29: Do you collect geolocation data?**  
A: No. We do not collect GPS, IP-based geolocation, or location data.

**Q30: How do you classify data sensitivity?**  
A: Four tiers: Personal data (email, name), Child data (first name, grade — enhanced protection), Sensitive data (payment — handled exclusively by Stripe), Operational data (logs — time-limited retention).

---

## SECTION 3 — SECURITY ARCHITECTURE (Q31–Q55)

**Q31: Where is data stored?**  
A: United States. Primary database hosted on Supabase (AWS infrastructure). Application hosted on Cloudflare Pages (global CDN).

**Q32: Is data encrypted in transit?**  
A: Yes. TLS 1.2+ (HTTPS) enforced on all connections. HTTP-to-HTTPS redirect is automatic in production.

**Q33: Is data encrypted at rest?**  
A: Yes. Database encryption provided by Supabase/AWS (AES-256).

**Q34: Do you store payment card data?**  
A: No. All payment processing is handled by Stripe (PCI DSS Level 1 certified). We never receive, store, or process card numbers.

**Q35: Are secrets stored in source code?**  
A: No. All API keys and credentials are stored as environment variables. Repository scanning confirms no secrets in code.

**Q36: Do you have a Web Application Firewall (WAF)?**  
A: Yes. Cloudflare provides WAF and DDoS protection on all traffic.

**Q37: Do you implement rate limiting?**  
A: Yes. API rate limiting is enforced via `api_rate_limits` and `rate_limits` database tables to prevent abuse.

**Q38: Do you use Row Level Security?**  
A: Yes. RLS is enabled on all 29 database tables, ensuring users can only access their own data.

**Q39: What database do you use?**  
A: PostgreSQL via Supabase, hosted on AWS infrastructure in the United States.

**Q40: Do you have a CDN?**  
A: Yes. Cloudflare Pages provides a global CDN with edge caching.

**Q41: Do you use containerization?**  
A: Backend logic runs as Supabase Edge Functions (Deno runtime). Frontend is a static SPA deployed to Cloudflare Pages.

**Q42: Do you have separate production and development environments?**  
A: Yes. Development, preview, and production environments are separated.

**Q43: How do you handle input validation?**  
A: DOMPurify for all rendered user content. Server-side validation on edge functions. Zod schema validation for form inputs.

**Q44: Do you use a Content Security Policy (CSP)?**  
A: Yes. Security headers including CSP are configured.

**Q45: Do you have protection against SQL injection?**  
A: Yes. All database queries use parameterized queries via the Supabase client SDK. No raw SQL from user input.

**Q46: Do you have protection against XSS?**  
A: Yes. DOMPurify sanitizes all user-generated content. React's built-in JSX escaping provides additional protection.

**Q47: Do you have protection against CSRF?**  
A: Yes. Supabase Auth uses secure, httpOnly tokens. All state-changing operations require authentication.

**Q48: How do you handle file uploads?**  
A: Limited to avatar/profile images via Supabase Storage with size limits and type validation.

**Q49: Do you expose any admin panels publicly?**  
A: No. Administrative functions are gated behind authentication and not publicly accessible.

**Q50: Do you log application errors?**  
A: Yes. Errors are logged to internal debug tables with automatic cleanup (30-day retention).

**Q51: How do you handle API authentication?**  
A: JWT-based authentication via Supabase Auth. Edge functions validate JWT tokens on every request.

**Q52: Do you support multi-factor authentication for end users?**  
A: Supabase Auth supports MFA. Implementation is available for users.

**Q53: How are database backups handled?**  
A: Automated daily backups managed by Supabase (AWS). Point-in-time recovery available.

**Q54: Do you have a disaster recovery plan?**  
A: Backups exist via Supabase. Source code is version-controlled in GitHub. Formal DR documentation is in progress.

**Q55: What is your uptime target?**  
A: We rely on Cloudflare (99.99% uptime SLA) and Supabase infrastructure. No formal SLA published for the application layer.

---

## SECTION 4 — ACCESS CONTROL (Q56–Q70)

**Q56: How do you manage access control?**  
A: Least privilege model. Individual accounts required (no shared credentials). Database-level isolation via Row Level Security.

**Q57: Do you require MFA for infrastructure access?**  
A: Yes. MFA is required for critical infrastructure (Supabase, Cloudflare, Stripe, GitHub dashboards).

**Q58: Do you support SSO for customers?**  
A: Not currently. SSO is on the enterprise roadmap.

**Q59: How is access revoked?**  
A: Access is revoked immediately when no longer needed. Session management includes automatic expiration.

**Q60: Do you use role-based access control (RBAC)?**  
A: Yes. Database-level RLS enforces per-user data isolation. Application-level roles distinguish guest vs. premium users.

**Q61: Can customers manage their own user access?**  
A: Yes. Users can manage their account, update preferences, and delete their account.

**Q62: Do you have password policies?**  
A: Yes. Password strength validation via `validate_password_strength` database function.

**Q63: How are sessions managed?**  
A: Secure sessions via `user_sessions` table with automatic expiration. Expired sessions cleaned up by `cleanup_expired_sessions`.

**Q64: Do you support OAuth/social login?**  
A: Yes. Supabase Auth supports OAuth providers (Google, GitHub, etc.).

**Q65: Can accounts be frozen/restricted?**  
A: Yes. Account restriction via `account_status` field in profiles table (GDPR Article 18 — right to restriction).

**Q66: How do you handle terminated employee access?**  
A: Access credentials are revoked immediately upon termination. All platform access is individually credentialed.

**Q67: Do you have a user activity log?**  
A: Yes. `security_audit_log` and `security_monitoring` tables track security-relevant user activity.

**Q68: Can you provide access logs on request?**  
A: Yes. Security audit logs can be provided to enterprise customers upon reasonable request.

**Q69: Do you segregate customer data?**  
A: Yes. Row Level Security ensures complete data isolation between users at the database level.

**Q70: Do you allow shared accounts?**  
A: No. Each user has an individual account. Child profiles are managed under parent accounts.

---

## SECTION 5 — INCIDENT RESPONSE (Q71–Q82)

**Q71: Do you have an incident response plan?**  
A: Yes. Documented in `docs/compliance/INCIDENT_RESPONSE_PLAN.md`. Covers: Detection → Containment → Assessment → Notification → Remediation → Documentation.

**Q72: How quickly do you notify of breaches?**  
A: Within 72 hours of discovery, per GDPR Article 33.

**Q73: What happens in a breach?**  
A: Identify scope → contain incident → assess affected data/users → notify Controller/affected parties within 72 hours → remediate → document.

**Q74: Do you have a breach log?**  
A: Yes. `data_breach_log` table tracks: description, severity, data types affected, users affected, detection time, notification status, and remediation steps.

**Q75: Have you experienced any data breaches?**  
A: No data breaches have occurred to date.

**Q76: Do you conduct tabletop exercises for incident response?**  
A: Planned for Phase 3. Not yet conducted.

**Q77: Who is responsible for breach notifications?**  
A: The privacy contact (privacy@time-2-read.com) manages all breach notifications.

**Q78: Do you have escalation procedures?**  
A: Yes. Security events are classified by risk level (low/medium/high/critical) in the `security_monitoring` table.

**Q79: How do you detect security incidents?**  
A: Via `security_monitoring` table with risk-level classification, `detect_suspicious_patterns` function, and `detect_subscription_access_anomalies` function.

**Q80: Do you have a bug bounty program?**  
A: Not currently. Security issues can be reported to privacy@time-2-read.com.

**Q81: How do you handle vulnerability disclosures?**  
A: Via responsible disclosure to privacy@time-2-read.com. We aim to acknowledge within 48 hours.

**Q82: Do you conduct penetration testing?**  
A: Planned for Phase 3 when deal size warrants. Not yet conducted.

---

## SECTION 6 — COMPLIANCE & REGULATORY (Q83–Q95)

**Q83: Are you GDPR compliant?**  
A: Yes. Full implementation including: lawful basis documentation, data subject rights workflows (access, rectification, erasure, portability, restriction, objection), DPO contact, breach notification, and consent management.

**Q84: Are you CCPA/CPRA compliant?**  
A: Yes. Right to know, right to delete, right to correct, right to opt-out of sale (we do not sell data), and non-discrimination.

**Q85: Are you COPPA compliant?**  
A: Yes. Parental consent verification with token-based email confirmation, age gating, minimal data collection for children, no behavioral advertising of minors, PII detection in child inputs.

**Q86: Are you FERPA compliant?**  
A: Yes. Student data handling documented, school access controls supported, data ownership by educational institutions under written agreements.

**Q87: Do you have SOC 2?**  
A: SOC 2 alignment is in progress (83% of controls implemented). Formal audit planned when deal size warrants. See `docs/compliance/SOC2_READINESS_CHECKLIST.md`.

**Q88: Do you have ISO 27001?**  
A: Not currently. On the enterprise roadmap.

**Q89: Are you PCI DSS compliant?**  
A: We do not handle payment card data directly. Stripe (PCI DSS Level 1) handles all payment processing.

**Q90: Are you HIPAA compliant?**  
A: Not applicable. We do not process protected health information (PHI).

**Q91: Do you comply with Virginia VCDPA / Colorado CPA / Connecticut CTDPA?**  
A: Yes. These are substantively covered by our GDPR + CCPA compliance framework (same rights: access, delete, opt-out).

**Q92: Do you comply with Brazil's LGPD?**  
A: Our GDPR-aligned framework provides equivalent coverage. Formal LGPD compliance documentation available on request.

**Q93: Do you comply with Canada's PIPEDA?**  
A: Our consent-based, transparent data practices align with PIPEDA requirements.

**Q94: Do you maintain Records of Processing Activities (RoPA)?**  
A: Yes. Documented in `docs/compliance/GDPR_RECORDS_OF_PROCESSING.md`.

**Q95: Do you conduct Data Protection Impact Assessments (DPIAs)?**  
A: DPIAs are conducted when introducing new processing activities that may impact user privacy. Documented internally.

---

## SECTION 7 — THIRD-PARTY / SUBPROCESSORS (Q96–Q107)

**Q96: Who are your subprocessors?**  
A: Supabase (database/auth), OpenAI (AI story generation), Anthropic (AI fallback), Runware (image generation), ElevenLabs (text-to-speech), Stripe (payments), Resend (email), Cloudflare (hosting/CDN), GitHub (source code/CI/CD).

**Q97: Do you have DPAs with your vendors?**  
A: Yes. DPAs signed with 6 of 9 vendors (Supabase, Stripe, Resend, Cloudflare, GitHub, OpenAI). Remaining 3 (ElevenLabs, Runware, Anthropic) are in progress. See `docs/compliance/VENDOR_DPA_TRACKER.md`.

**Q98: Where can I see your subprocessor list?**  
A: Public list at [/subprocessors](/subprocessors) and [/vendors](/vendors).

**Q99: Do vendors have access to personal data?**  
A: Only Supabase (database), Stripe (payment info), and Resend (email addresses) process PII. AI vendors receive prompts/text with no personal information.

**Q100: How do you assess vendor risk?**  
A: Vendors are tiered: High Risk (stores PII), Medium Risk (transient processing, no PII), Low Risk (infrastructure only). See `docs/compliance/VENDOR_DPA_TRACKER.md`.

**Q101: How are you notified of vendor security incidents?**  
A: Via vendor status pages, email notifications, and DPA breach notification clauses.

**Q102: Do you monitor vendor compliance?**  
A: Yes. Annual review of vendor DPAs, certifications, and subprocessor changes.

**Q103: Can you notify us before adding new subprocessors?**  
A: Yes. Enterprise customers with DPAs will be notified of material subprocessor changes in advance.

**Q104: Do your AI vendors retain user data?**  
A: No. OpenAI and Anthropic are configured with zero-data-retention API policies. Data is not used for model training.

**Q105: Do you use any Chinese or Russian-based vendors?**  
A: No. All vendors are US-based or EU-based companies.

**Q106: Do you use open-source software?**  
A: Yes. The frontend uses open-source libraries (React, Tailwind CSS, etc.) which are regularly updated for security patches.

**Q107: How do you handle vendor end-of-life?**  
A: We maintain fallback systems (4-tier story generation) to ensure service continuity if any vendor becomes unavailable.

---

## SECTION 8 — DPA & CONTRACTUAL (Q108–Q115)

**Q108: Do you support DPAs?**  
A: Yes. Standard DPA template available at `docs/compliance/DPA_TEMPLATE.md`. Contact privacy@time-2-read.com.

**Q109: Can you sign our DPA?**  
A: Yes. We review and sign customer-provided DPAs.

**Q110: Do you support Standard Contractual Clauses (SCCs)?**  
A: Yes. SCCs are used for international data transfers where required.

**Q111: What is your data processing jurisdiction?**  
A: United States. See [/data-transfers](/data-transfers) for full international transfer documentation.

**Q112: Do you act as a data controller or processor?**  
A: For B2B/school customers: Processor. For direct consumer users: Controller.

**Q113: Can you provide proof of compliance?**  
A: Yes. We provide DPA templates, security overview, vendor documentation, and compliance checklists upon request.

**Q114: What governing law applies to your terms?**  
A: United States (Delaware).

**Q115: Can you accommodate custom data handling requirements?**  
A: Yes. Contact privacy@time-2-read.com to discuss custom arrangements for enterprise or education deployments.

---

## SECTION 9 — EDUCATION / SCHOOLS (Q116–Q125)

**Q116: Can you support school deployments?**  
A: Yes. DPA templates, FERPA documentation, and security overview materials available for school procurement.

**Q117: Who owns student data?**  
A: The school/district retains ownership of student education records. Time-2-Read processes data solely to provide the service.

**Q118: Can schools request data deletion?**  
A: Yes. Deletion requests processed within 30 days.

**Q119: Do you use student data for advertising?**  
A: No. Absolutely no advertising, marketing, or profiling of student data.

**Q120: Can you provide a student data privacy agreement?**  
A: Yes. Our DPA template covers student data use cases. See `docs/compliance/DPA_TEMPLATE.md`.

**Q121: Do you support the Student Privacy Pledge?**  
A: Our practices align with the Student Privacy Pledge principles: no selling student data, no behavioral advertising, transparency about data use.

**Q122: Can parents access their child's data?**  
A: Yes. Parents manage child profiles and can export or delete all child data.

**Q123: How do you verify parental consent?**  
A: Token-based email verification via the `parental_consents` table. Tokens expire after 48 hours.

**Q124: Can schools audit your data practices?**  
A: Yes. Schools may request reasonable information about our security and data handling practices per our DPA.

**Q125: Do you support CIPA compliance for schools?**  
A: Time-2-Read content is educationally focused children's stories. No inappropriate content is generated or displayed.

---

*Total: 125 questions pre-answered. For questions not covered here, contact privacy@time-2-read.com.*
