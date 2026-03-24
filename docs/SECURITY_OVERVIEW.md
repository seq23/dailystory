# Time-2-Read Security Overview

**Owner:** Spry VSL LLC  
**Last Updated:** January 1, 2026  
**Contact:** privacy@time-2-read.com

---

## 1. Overview

Time-2-Read is an AI-powered children's reading platform designed with a **minimal data footprint** and a security-first architecture.

We prioritize:

- Data minimization — we only collect what is necessary
- Secure infrastructure — enterprise-grade hosting and encryption
- Controlled access — least privilege across all systems

---

## 2. Data Philosophy

We intentionally limit data collection to:

- Basic user identifiers (email address, display name)
- Reading preferences and progress data
- Child profile information (first name, grade level — no last names, no addresses)

We do **not**:

- Sell or share personal data with third parties for advertising
- Store sensitive personal information (SSNs, government IDs, biometrics)
- Store payment card data (handled entirely by Stripe, PCI DSS Level 1)
- Use personal data to train AI models
- Track users across other websites

---

## 3. Infrastructure

| Layer | Provider | Capability |
|---|---|---|
| **Hosting & CDN** | Cloudflare Pages | Global CDN, DDoS protection, WAF, TLS termination |
| **Backend & Database** | Supabase (AWS) | PostgreSQL, Row Level Security, Auth, Edge Functions |
| **Payments** | Stripe | PCI DSS Level 1 certified |
| **Email** | Resend | SOC 2 Type II certified |

All infrastructure enforces TLS (HTTPS) with no plaintext fallback.

---

## 4. Application Security

- **Row Level Security (RLS)**: Enabled on all 29 database tables — users can only access their own data
- **Secret management**: All API keys stored as environment variables; never committed to source code
- **Input sanitization**: DOMPurify used for all user-generated content rendering
- **Rate limiting**: API endpoints protected against abuse via `api_rate_limits` and `rate_limits` tables
- **HTTPS enforcement**: Automatic redirect from HTTP to HTTPS in production
- **No client-side secrets**: No private API keys exposed in browser code

---

## 5. Access Control

- **Least privilege model**: Personnel access limited to minimum required scope
- **No shared credentials**: Each team member uses individual accounts
- **Database RLS**: Enforces per-user data isolation at the database layer
- **Session management**: Secure sessions with automatic expiration (`user_sessions` table)
- **Account restriction**: Ability to freeze/restrict accounts (GDPR Article 18 compliance)

---

## 6. Data Protection

- **Encryption in transit**: TLS 1.2+ across all connections
- **Encryption at rest**: Supabase/AWS database encryption
- **Data retention limits**:
  - Debug logs: 30 days
  - Security audit logs: 90 days
  - Inactive accounts: anonymized after 3 years
- **Data deletion**: Full account deletion via `delete-user-account` edge function with cascading removal
- **Data export**: JSON export of all user data via `export-user-data` edge function (GDPR Article 20)

---

## 7. Third-Party Services (Subprocessors)

All vendors are vetted for security practices and bound by Data Processing Agreements:

| Vendor | Purpose | Data Access | Key Certifications |
|---|---|---|---|
| Supabase | Database & Auth | Full user data | SOC 2 Type II |
| OpenAI | Story generation | Prompts only (no PII) | Enterprise API security |
| Anthropic | AI fallback | Prompts only (no PII) | Enterprise API security |
| Runware | Image generation | Image prompts (no PII) | — |
| ElevenLabs | Text-to-speech | Story text (no PII) | — |
| Stripe | Payments | Email, payment info | PCI DSS Level 1, SOC 2 |
| Resend | Email delivery | Email addresses | SOC 2 Type II |
| Cloudflare | Hosting/CDN | IP, request metadata | SOC 2, ISO 27001 |
| GitHub | Source code CI/CD | Source code only | SOC 2 Type II |

Full subprocessor list: [/subprocessors](/subprocessors)

---

## 8. Incident Response

We maintain an Incident Response Plan that includes:

1. **Detection**: Security monitoring via `security_monitoring` table with risk-level classification
2. **Containment**: Account restriction capabilities, rate limiting
3. **Assessment**: Breach logging via `data_breach_log` table tracking severity, affected data types, and user count
4. **Notification**: GDPR-compliant notification within 72 hours of discovery
5. **Remediation**: Root cause analysis and preventive measures documented

---

## 9. Children's Data Protection

As a children's reading platform, we implement additional safeguards:

- **COPPA compliance**: Parental consent system with verification tokens (`parental_consents` table)
- **Age gating**: EU age 16 threshold enforcement (GDPR Article 8)
- **Personal information detection**: Automated scanning for PII in child inputs (`personal_info_incidents` table)
- **Minimal child data**: Only first name, grade level, and reading preferences collected
- **No behavioral advertising**: Zero ad-tech or behavioral tracking of minors

---

## 10. Compliance Alignment

| Framework | Status |
|---|---|
| GDPR (EU) | ✅ Implemented — full rights workflow, DPO contact, lawful basis documented |
| CCPA/CPRA (California) | ✅ Implemented — consumer rights, non-discrimination, no-sale statement |
| COPPA (Children) | ✅ Implemented — parental consent system, age gating, data minimization |
| FERPA (Education) | ✅ Implemented — school data handling documented, access controls |
| SOC 2 | 🟡 Alignment in progress — controls implemented, formal audit pending |

---

## 11. Audit & Logging

- **Security audit log**: All security-relevant events tracked (`security_audit_log` table)
- **Security monitoring**: Real-time risk classification (`security_monitoring` table)
- **Consent records**: Granular consent tracking with withdrawal support (`consent_records` table)
- **Data breach log**: Full incident tracking with notification status (`data_breach_log` table)

---

## 12. Contact

**Data Protection Officer / Privacy Contact:**  
Email: [privacy@time-2-read.com](mailto:privacy@time-2-read.com)  
Company: Spry VSL LLC

---

*This document is provided to enterprise buyers, school districts, and procurement teams during security review. For additional information or to request a security assessment, contact privacy@time-2-read.com.*
