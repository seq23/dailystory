# Time-2-Read — Customer Trust Package

**Prepared by:** Spry VSL LLC  
**Date:** March 2026  
**Contact:** privacy@time-2-read.com  
**Website:** https://time-2-read.lovable.app

---

## 1. Company Overview

Time-2-Read is an AI-powered children's reading platform that generates personalized, never-ending stories with illustrations and text-to-speech narration. Built by Spry VSL LLC (Delaware, USA).

**Our data philosophy:** Collect the minimum, protect it completely, never sell it.

---

## 2. Security Overview

### Infrastructure

| Layer | Provider | Certification |
|-------|----------|---------------|
| Hosting & CDN | Cloudflare Pages | SOC 2, ISO 27001 |
| Database & Auth | Supabase (AWS) | SOC 2 Type II |
| Payments | Stripe | PCI DSS Level 1 |
| Email | Resend | SOC 2 Type II |

### Security Controls

| Control | Status |
|---------|--------|
| Encryption in transit (TLS 1.2+) | ✅ Enforced |
| Encryption at rest (AES-256) | ✅ Via Supabase/AWS |
| Row Level Security (all 29 tables) | ✅ Enforced |
| API rate limiting | ✅ Enforced |
| Secret management (no secrets in code) | ✅ Enforced |
| WAF & DDoS protection | ✅ Via Cloudflare |
| Least privilege access | ✅ Enforced |
| MFA on infrastructure | ✅ Enforced |
| Security audit logging | ✅ Active |
| Automated data cleanup | ✅ Active |

### Data We Collect

| Category | Data | Notes |
|----------|------|-------|
| Account | Email, display name | Required for service |
| Preferences | Reading level, grade, interests | Personalizes stories |
| Child profiles | First name, grade level | No last names, no addresses |
| Usage | Reading sessions, progress | Internal analytics only |
| Payment | Email only | Card data handled entirely by Stripe |

### Data We Do NOT Collect

- Social Security numbers or government IDs
- Precise geolocation or GPS data
- Biometric data or voice recordings
- Health or medical information
- Browsing history outside our platform

---

## 3. Compliance Summary

| Framework | Status | Details |
|-----------|--------|---------|
| **GDPR** (EU) | ✅ Compliant | Full rights workflow (access, rectification, erasure, portability, restriction, objection). DPO contact: privacy@time-2-read.com. Lawful basis documented per data type. Breach notification within 72 hours. |
| **CCPA/CPRA** (California) | ✅ Compliant | Right to know, delete, correct, opt-out. We do not sell personal data. Non-discrimination policy. |
| **COPPA** (Children) | ✅ Compliant | Parental consent via verified email with token confirmation. Minimal child data collection. No behavioral advertising of minors. Automated PII detection in child inputs. |
| **FERPA** (Education) | ✅ Compliant | Student data ownership by school/district. Access controls documented. DPA available for school contracts. |
| **VCDPA / CPA / CTDPA** (U.S. States) | ✅ Covered | Substantively covered by GDPR + CCPA framework. |
| **SOC 2** | 🟡 83% Ready | Controls implemented. Formal audit planned when scale warrants. |

### Data Subject Rights Implementation

| Right | How It Works |
|-------|-------------|
| Access / Export | One-click JSON export of all user data |
| Deletion | Full cascading deletion across all tables |
| Rectification | Self-service via account settings |
| Restriction | Account freeze capability |
| Consent withdrawal | Granular consent management with audit trail |
| Breach notification | Automated logging, 72-hour notification target |

---

## 4. Subprocessor List

The complete current list, with exactly what each vendor receives, is [time-2-read.com/subprocessors](https://time-2-read.com/subprocessors). The tables below cover the vendors with a DPA on record.

### High Risk — Processes Personal Data

| Vendor | Purpose | Data Processed | Location | DPA |
|--------|---------|----------------|----------|-----|
| Supabase | Database, auth, backend | User accounts, profiles, reading data | US (AWS) | ✅ Signed |
| Stripe | Payment processing | Email, payment info | US | ✅ Signed |
| Resend | Email delivery | Email addresses, transactional content | US | ✅ Signed |

### Medium Risk — Transient Processing

| Vendor | Purpose | Data Processed | Location | DPA |
|--------|---------|----------------|----------|-----|
| OpenAI | Story text generation, speech-to-text | Story prompts as written, including the child’s first name; voice clips after a tap on the microphone | US | ✅ Signed |
| Anthropic | AI fallback, no longer called | Nothing since 22 Nov 2026 | US | ⏳ In progress |
| ElevenLabs | Text-to-speech | Story text, including the child’s first name when the story uses it; words a reader taps; what the reader says in voice mode | US | ⏳ In progress |
| Runware | Image generation | Picture scene and the reader’s avatar look, age and favorite color; never a name | EU/US | ⏳ In progress |

### Low Risk — Infrastructure Only

| Vendor | Purpose | Data Processed | Location | DPA |
|--------|---------|----------------|----------|-----|
| Cloudflare | Hosting, CDN, WAF | IP addresses, request metadata | Global | ✅ Signed |
| GitHub | Source code, CI/CD | Source code only (no user data) | US | ✅ Signed |

**Key:** OpenAI and ElevenLabs receive the child’s first name when a story uses it; Runware never receives a name. OpenAI does not train on API data. The AI services that rewrite or explain text (OpenRouter, Cloudflare Workers AI, Lovable AI Gateway) receive it with every name replaced by a stand-in.

---

## 5. Data Processing Agreement

We provide a standard DPA for enterprise and education customers covering:

- Scope of processing and data categories
- Processor obligations (confidentiality, security measures, breach notification)
- Full subprocessor transparency with change notification
- Data subject rights assistance
- Data retention and deletion terms
- Audit rights
- International transfer safeguards (Standard Contractual Clauses)

**To execute a DPA:** Contact privacy@time-2-read.com or see attached DPA template.

---

## 6. Data Retention

| Data Type | Retention | Method |
|-----------|-----------|--------|
| Active user data | Duration of account | Manual deletion available |
| Debug/diagnostic logs | 30 days | Automatic cleanup |
| Security audit logs | 90 days | Automatic cleanup |
| Inactive accounts | 3 years | Automatic anonymization |
| Post-termination | 30 days | Deletion or return on request |

---

## 7. Incident Response

We maintain a documented Incident Response Plan:

1. **Detect** — Security monitoring with risk classification
2. **Contain** — Account restriction, rate limiting, access revocation
3. **Assess** — Scope, affected data, severity
4. **Notify** — Within 72 hours per GDPR Article 33
5. **Remediate** — Root cause analysis, preventive measures
6. **Document** — Full incident record for audit trail

No data breaches have occurred to date.

---

## 8. For Educational Institutions

- DPA template available for school/district contracts
- FERPA compliance documented
- Student data ownership retained by school/district
- No advertising or profiling of student data
- Parental consent system with verified email confirmation
- Student data deletion within 30 days on request
- Security assessment documentation available

---

## 9. Frequently Asked Questions

**Q: Do you sell data?**  
A: No. We never sell, rent, or share personal data for advertising or marketing.

**Q: Where is data stored?**  
A: United States (Supabase on AWS). Application hosted on Cloudflare (global CDN).

**Q: Do AI providers retain user data?**  
A: Time-2-Read does not store voice clips. OpenAI does not train on API data and states how long it keeps each kind of call on its API data controls page (https://developers.openai.com/api/docs/guides/your-data). OpenRouter’s paid model is set to zero retention; its free models may log or train on prompts, which reach them with every name replaced by a stand-in. See /subprocessors.

**Q: Can you sign our DPA?**  
A: Yes. Contact privacy@time-2-read.com.

**Q: Do you have SOC 2?**  
A: 83% of controls are implemented. Formal audit planned when scale warrants.

**Q: How do you handle deletion requests?**  
A: Full cascading deletion across all database tables, processed within 30 days.

**Q: What happens in a breach?**  
A: Detection → containment → notification within 72 hours → remediation → documentation.

---

## 10. Contact

**Privacy / Security / Compliance:**  
Email: privacy@time-2-read.com  
Company: Spry VSL LLC  

**Public legal pages:**  
- Privacy Policy: /privacy  
- GDPR Rights: /gdpr  
- CCPA Rights: /ccpa  
- Subprocessors: /subprocessors  
- Data Transfers: /data-transfers  

---

*This document is provided for enterprise and education procurement. For additional information, security questionnaire responses (125+ pre-answered), or to schedule a security review, contact privacy@time-2-read.com.*
