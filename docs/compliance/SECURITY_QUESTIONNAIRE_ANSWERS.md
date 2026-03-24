# Security Questionnaire Answer Bank

**Company:** Spry VSL LLC (dba Time-2-Read)  
**Last Updated:** 2026-03-24  
**Contact:** privacy@time-2-read.com

Use this document to quickly respond to enterprise security questionnaires, procurement forms, and vendor risk assessments.

---

## GENERAL COMPANY INFORMATION

**Q: What is the legal entity name?**  
A: Spry VSL LLC

**Q: What is the product name?**  
A: Time-2-Read (time-2-read.lovable.app)

**Q: What does the product do?**  
A: Time-2-Read is an AI-powered children's reading platform that generates personalized, never-ending stories with illustrations and text-to-speech narration.

**Q: Who is the Data Protection Officer / Privacy contact?**  
A: privacy@time-2-read.com

**Q: What jurisdiction is the company incorporated in?**  
A: United States (Delaware)

---

## DATA COLLECTION & HANDLING

**Q: What personal data do you collect?**  
A: Email address, display name, reading preferences, grade level, and reading session data. For child profiles: first name, grade level, and parent email (for consent).

**Q: Do you collect sensitive personal data?**  
A: No. We do not collect SSNs, government IDs, biometric data, health data, or precise geolocation.

**Q: Do you collect data from children?**  
A: Yes — first name, grade level, and reading preferences only. Parental consent is obtained via verified email with token-based confirmation (COPPA compliant).

**Q: Do you sell personal data?**  
A: No. We do not sell, rent, or share personal data with third parties for advertising or marketing purposes.

**Q: Do you use personal data to train AI models?**  
A: No. All AI providers (OpenAI, Anthropic) are configured with zero-data-retention API settings. User data is never used for model training.

**Q: What is your data retention policy?**  
A: Debug logs: 30 days. Security audit logs: 90 days. Inactive accounts: anonymized after 3 years. Active accounts: retained for duration of the account.

**Q: Can users export their data?**  
A: Yes. Users can export all their data in JSON format via the `export-user-data` edge function (GDPR Article 20 — data portability).

**Q: Can users delete their data?**  
A: Yes. Full account deletion with cascading removal across all tables is supported via the `delete-user-account` edge function.

---

## SECURITY ARCHITECTURE

**Q: Where is data stored?**  
A: United States. Primary database hosted on Supabase (AWS infrastructure). Application hosted on Cloudflare Pages (global CDN).

**Q: Is data encrypted in transit?**  
A: Yes. TLS 1.2+ (HTTPS) enforced on all connections. HTTP-to-HTTPS redirect is automatic in production.

**Q: Is data encrypted at rest?**  
A: Yes. Database encryption provided by Supabase/AWS (AES-256).

**Q: Do you store payment card data?**  
A: No. All payment processing is handled by Stripe (PCI DSS Level 1 certified). We never receive, store, or process card numbers.

**Q: Are secrets stored in source code?**  
A: No. All API keys and credentials are stored as environment variables. Repository scanning confirms no secrets in code.

**Q: Do you have a Web Application Firewall (WAF)?**  
A: Yes. Cloudflare provides WAF and DDoS protection on all traffic.

**Q: Do you implement rate limiting?**  
A: Yes. API rate limiting is enforced via `api_rate_limits` and `rate_limits` database tables to prevent abuse.

**Q: Do you use Row Level Security?**  
A: Yes. RLS is enabled on all 29 database tables, ensuring users can only access their own data.

---

## ACCESS CONTROL

**Q: How do you manage access control?**  
A: Least privilege model. Individual accounts required (no shared credentials). Database-level isolation via Row Level Security.

**Q: Do you require MFA?**  
A: MFA is required for critical infrastructure access (Supabase, Cloudflare, Stripe, GitHub dashboards).

**Q: Do you support SSO?**  
A: Not currently. SSO is on the enterprise roadmap.

**Q: How is access revoked?**  
A: Access is revoked immediately when no longer needed. Session management includes automatic expiration.

---

## INCIDENT RESPONSE

**Q: Do you have an incident response plan?**  
A: Yes. Our IRP includes: Detection → Containment → Assessment → Notification → Remediation → Documentation.

**Q: How quickly do you notify of breaches?**  
A: Within 72 hours of discovery, per GDPR Article 33. All breaches are logged in our `data_breach_log` system.

**Q: What happens in a breach?**  
A: We identify the scope, contain the incident, assess affected data and users, notify the Controller/affected parties within 72 hours, remediate, and document the full incident.

**Q: Do you have a breach log?**  
A: Yes. The `data_breach_log` table tracks: description, severity, data types affected, users affected, detection time, notification status, and remediation steps.

---

## COMPLIANCE & REGULATORY

**Q: Are you GDPR compliant?**  
A: Yes. We implement full GDPR compliance including: lawful basis documentation, data subject rights workflows (access, rectification, erasure, portability, restriction, objection), DPO contact, breach notification, and consent management.

**Q: Are you CCPA/CPRA compliant?**  
A: Yes. We provide: right to know, right to delete, right to correct, right to opt-out of sale (we do not sell data), and non-discrimination.

**Q: Are you COPPA compliant?**  
A: Yes. We implement: parental consent verification with token-based email confirmation, age gating, minimal data collection for children, no behavioral advertising of minors, and PII detection in child inputs.

**Q: Are you FERPA compliant?**  
A: Yes. We document student data handling, provide school access controls, and support data ownership by educational institutions under written agreements.

**Q: Do you have SOC 2?**  
A: SOC 2 alignment is in progress. Key controls (access control, logging, encryption, incident response) are implemented. Formal audit is planned when deal size warrants it.

**Q: Do you have ISO 27001?**  
A: Not currently. This is on the enterprise roadmap for when scale requires it.

---

## THIRD-PARTY / SUBPROCESSORS

**Q: Who are your subprocessors?**  
A: Supabase (database/auth), OpenAI (AI story generation), Anthropic (AI fallback), Runware (image generation), ElevenLabs (text-to-speech), Stripe (payments), Resend (email), Cloudflare (hosting/CDN), GitHub (source code/CI/CD).

**Q: Do you have DPAs with your vendors?**  
A: Yes. DPAs are signed or accepted with all high-risk vendors (Supabase, Stripe, Resend, Cloudflare, GitHub, OpenAI). Remaining vendors (ElevenLabs, Runware, Anthropic) are in progress. See `docs/VENDOR_DPA_TRACKER.md`.

**Q: Where can I see your subprocessor list?**  
A: Public subprocessor list is available at [/subprocessors](/subprocessors) and [/vendors](/vendors).

**Q: Do vendors have access to personal data?**  
A: Only Supabase (database), Stripe (payment info), and Resend (email addresses) process PII. AI vendors (OpenAI, Anthropic, Runware, ElevenLabs) receive only prompts/text with no personal information.

---

## SUPPORT FOR DPAS

**Q: Do you support DPAs?**  
A: Yes. We provide a standard DPA template for enterprise and education customers. See `docs/DPA_TEMPLATE.md` or contact privacy@time-2-read.com.

**Q: Can you sign our DPA?**  
A: Yes. We will review and sign customer-provided DPAs. Contact privacy@time-2-read.com.

---

## EDUCATION / SCHOOLS

**Q: Can you support school deployments?**  
A: Yes. We provide DPA templates, FERPA documentation, and security overview materials for school procurement.

**Q: Who owns student data?**  
A: The school/district retains ownership of student education records. Time-2-Read processes data solely to provide the service.

**Q: Can schools request data deletion?**  
A: Yes. Schools can request deletion of all student data. We process deletion requests within 30 days.

---

*This document is maintained by the Compliance Team. For questions or to request a completed security questionnaire, contact privacy@time-2-read.com.*
