# Information Security Policy

**Company:** Spry VSL LLC (dba Time-2-Read)  
**Last Updated:** January 1, 2026  
**Owner:** Engineering / Compliance  
**Review Cycle:** Annual

---

## 1. Purpose

This policy defines how Time-2-Read protects its systems, data, and users. It establishes baseline security requirements for all personnel and systems.

---

## 2. Scope

Applies to:

- All production systems and infrastructure
- All stored and processed data (user data, source code, credentials)
- All personnel with access to systems or data

---

## 3. Security Principles

- **Least privilege**: Access granted only to the minimum scope required
- **Data minimization**: Collect and retain only what is necessary
- **Secure-by-default**: Systems configured securely out of the box
- **Defense in depth**: Multiple layers of security controls

---

## 4. Access Control

- Access granted on a need-to-know basis
- No shared credentials — individual accounts required
- Access revoked immediately when no longer required
- Database-level isolation via Row Level Security (RLS) on all 29 tables
- MFA required for critical infrastructure (Supabase, Cloudflare, Stripe, GitHub)

---

## 5. Data Protection

- **Encryption in transit**: TLS/HTTPS enforced on all connections
- **Encryption at rest**: Database encryption via Supabase/AWS
- **No plaintext secrets**: All API keys and credentials stored as environment variables
- **No secrets in source code**: Verified via repository scanning
- **Data classification**:
  - **Personal data**: Email, display name, reading preferences
  - **Child data**: First name, grade level, parent email (enhanced protection)
  - **Sensitive data**: Payment information (handled exclusively by Stripe, never stored)
  - **Operational data**: Logs, analytics sessions, debug data (time-limited retention)

---

## 6. Data Retention

| Data Type | Retention Period | Deletion Method |
|---|---|---|
| Debug/prompt logs | 30 days | Automatic cleanup (`cleanup_old_debug_logs`) |
| Security audit logs | 90 days | Automatic cleanup (`cleanup_security_audit_log`) |
| Image generation logs | 30 days | Automatic cleanup (`cleanup_image_generation_debug_logs`) |
| Inactive user data | 3 years | Anonymization (`anonymize_old_user_data`) |
| Active user data | Duration of account | Manual deletion via `delete-user-account` |

---

## 7. Infrastructure Security

- **Hosting**: Cloudflare Pages with global CDN, DDoS protection, and Web Application Firewall
- **Backend**: Supabase (PostgreSQL on AWS) with RLS and edge functions
- **DNS**: Managed via Cloudflare with DNSSEC
- **Secrets**: Stored in platform environment variables (Supabase Vault, Cloudflare env)
- **No public-facing admin panels**: Administrative functions gated behind authentication

---

## 8. Application Security

- Input sanitization via DOMPurify for all rendered content
- Rate limiting on all public API endpoints
- HTTPS redirect enforced in production (`useSecurityHeaders` hook)
- Content Security Policy headers configured
- No eval() or dynamic code execution from user input

---

## 9. Vendor Security

- Only vetted vendors with established security practices are used
- Vendors processing personal data must have Data Processing Agreements (DPAs)
- Vendor list maintained and publicly disclosed at [/vendors](/vendors) and [/subprocessors](/subprocessors)
- Vendor security posture reviewed annually
- See `docs/VENDOR_DPA_TRACKER.md` for DPA status

---

## 10. Incident Response

1. **Identify**: Security events detected via `security_monitoring` table and logging
2. **Contain**: Account restriction, rate limiting, access revocation
3. **Assess**: Determine scope, affected data, and severity
4. **Notify**: GDPR requires notification within 72 hours; logged in `data_breach_log`
5. **Remediate**: Root cause analysis, preventive measures, policy updates
6. **Document**: Full incident record maintained for audit trail

---

## 11. Employee Responsibilities

All personnel with system access must:

- Maintain confidentiality of all user data and credentials
- Follow access control policies — never share credentials
- Use strong, unique passwords with a password manager
- Report security incidents or suspicious activity immediately
- Not store user data on personal devices
- Not access user data without a legitimate business need

---

## 12. Backup & Recovery

- Database backups managed by Supabase (automated daily backups)
- Source code version-controlled in GitHub with full history
- Edge functions and configurations stored in repository
- Recovery procedures tested periodically

---

## 13. Policy Review

This policy is:

- Reviewed annually
- Updated when significant infrastructure or vendor changes occur
- Updated when new regulatory requirements are identified
- Version-controlled in the repository at `docs/INFORMATION_SECURITY_POLICY.md`

---

## 14. Contact

**Privacy / Security Contact:**  
Email: [privacy@time-2-read.com](mailto:privacy@time-2-read.com)  
Company: Spry VSL LLC

---

*This policy is maintained by the Engineering and Compliance teams. All personnel are expected to read and follow this policy.*
