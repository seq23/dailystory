# Data Processing Agreement (DPA)

**Effective Date:** [Insert Date]

This Data Processing Agreement ("DPA") forms part of the agreement between:

**Controller:** [Customer Name / School / Organization]  
**Processor:** Spry VSL LLC (dba Time-2-Read)

---

## 1. Definitions

- **Personal Data**: Any information relating to an identified or identifiable individual
- **Processing**: Any operation performed on personal data
- **Controller**: Entity determining purposes of processing
- **Processor**: Entity processing data on behalf of Controller

---

## 2. Scope of Processing

Time-2-Read processes Personal Data solely to provide its services.

### Categories of Data:

- User identifiers (e.g., email address)
- User preferences (reading level, display name, grade level)
- Usage data (reading sessions, story progress, quiz scores)
- Child profile data (display name, grade level, parent email — if applicable)

### Categories of Data Subjects:

- End users (parents/guardians)
- Students / children (if applicable under school agreements)

---

## 3. Obligations of Processor

Time-2-Read shall:

- Process data only on documented instructions from the Controller
- Ensure personnel handling data are bound by confidentiality obligations
- Implement appropriate technical and organizational security measures
- Assist Controller with:
  - Data subject access, rectification, erasure, and portability requests
  - GDPR compliance obligations (Articles 32–36)
- Notify Controller of any data breach without undue delay (within 72 hours per GDPR Article 33)
- Delete or return all Personal Data upon termination, at Controller's choice

---

## 4. Security Measures

Time-2-Read implements:

- **Encryption in transit**: TLS/HTTPS enforced across all endpoints
- **Encryption at rest**: Database encryption via Supabase (AWS-backed)
- **Access controls**: Least privilege model; Row Level Security (RLS) on all database tables
- **Secure infrastructure**: Cloudflare hosting with DDoS protection and WAF
- **Secret management**: All API keys and credentials stored as environment variables, never in source code
- **Rate limiting**: API rate limiting to prevent abuse (`api_rate_limits`, `rate_limits` tables)
- **Audit logging**: Security events logged in `security_audit_log` and `security_monitoring` tables
- **Session management**: Secure session tracking with expiration (`user_sessions` table)

---

## 5. Subprocessors

Time-2-Read uses the following subprocessors:

| Subprocessor | Purpose | Data Processed | Location |
|---|---|---|---|
| **Supabase** | Database, authentication, edge functions | User accounts, profiles, reading data | United States |
| **OpenAI** | AI story text generation | Story prompts (no PII) | United States |
| **Anthropic** | AI fallback story generation | Story prompts (no PII) | United States |
| **Runware** | AI image generation | Image prompts (no PII) | Europe / United States |
| **ElevenLabs** | Text-to-speech narration | Story text (no PII) | United States |
| **Stripe** | Payment processing | Email, payment info (PCI DSS) | United States |
| **Resend** | Transactional email delivery | Email addresses, email content | United States |
| **Cloudflare** | Hosting, CDN, DDoS protection | IP addresses, request metadata | Global |
| **GitHub** | Source code hosting, CI/CD | Source code only (no user data) | United States |

Processor shall:

- Ensure all subprocessors are contractually bound to equivalent data protection obligations
- Maintain a current subprocessor list at [time-2-read.lovable.app/subprocessors](/subprocessors)
- Notify Controller of any intended subprocessor changes

---

## 6. International Transfers

Data is processed in the United States.

Time-2-Read relies on:

- Standard Contractual Clauses (SCCs) where required
- Vendor-specific safeguards and certifications (SOC 2, PCI DSS, ISO 27001 as applicable)
- See [Data Transfers page](/data-transfers) for full details

---

## 7. Data Subject Rights

Processor shall assist Controller in responding to:

- **Access requests** (GDPR Article 15) — via `export-user-data` edge function
- **Deletion requests** (GDPR Article 17) — via `delete-user-account` edge function with cascading deletion
- **Data portability requests** (GDPR Article 20) — JSON export of all user data
- **Rectification requests** (GDPR Article 16) — via account settings
- **Restriction requests** (GDPR Article 18) — via account freeze functionality

---

## 8. Data Retention & Deletion

- Debug logs: retained 30 days, then auto-deleted
- Security audit logs: retained 90 days, then auto-deleted
- Inactive accounts: data anonymized after 3 years of inactivity
- Upon contract termination: all Controller data deleted or returned within 30 days upon written request

---

## 9. Audit Rights

Controller may:

- Request reasonable information regarding Processor's security practices
- Request evidence of compliance with this DPA
- Conduct or commission audits with reasonable notice (no more than once per year)

---

## 10. Breach Notification

In the event of a Personal Data breach, Processor shall:

1. Notify Controller without undue delay (within 72 hours of discovery)
2. Provide details: nature of breach, data affected, estimated number of subjects, remediation steps
3. Cooperate with Controller's response obligations
4. Log all breaches in the internal `data_breach_log` system

---

## 11. Liability

Each party is responsible for its own compliance obligations under applicable data protection law. Liability is governed by the underlying service agreement.

---

## 12. Contact

**Data Protection Officer / Privacy Contact:**  
Email: [privacy@time-2-read.com](mailto:privacy@time-2-read.com)  
Company: Spry VSL LLC

---

*This template is provided for execution with enterprise and educational institution partners. For questions, contact privacy@time-2-read.com.*
