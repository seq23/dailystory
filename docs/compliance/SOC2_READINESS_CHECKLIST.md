# SOC 2 Readiness Checklist — Time-2-Read

**Company:** Spry VSL LLC  
**Last Updated:** 2026-03-24  
**Contact:** privacy@time-2-read.com  
**Status:** 🟡 Alignment in progress — formal audit deferred until deal size warrants

---

## Overview

SOC 2 evaluates controls across five Trust Service Criteria. This checklist maps our current implementation to each criteria.

---

## CC1 — Control Environment (Organization & Management)

| Control | Status | Implementation |
|---------|--------|----------------|
| Defined security policies | ✅ Done | `docs/INFORMATION_SECURITY_POLICY.md` |
| Privacy policy published | ✅ Done | `/privacy` page + `Privacy.tsx` |
| Roles and responsibilities defined | ✅ Done | Least privilege model documented |
| Code of conduct / ethics | 🟡 Pending | Not yet formalized |
| Board/management oversight | 🟡 N/A | Small team — owner-operated |

---

## CC2 — Communication & Information

| Control | Status | Implementation |
|---------|--------|----------------|
| Security policies communicated | ✅ Done | Docs in repository, public legal pages |
| Privacy notices to users | ✅ Done | `/privacy`, `/gdpr`, `/ccpa`, `/ferpa` |
| Vendor transparency | ✅ Done | `/vendors`, `/subprocessors`, `/data-transfers` |
| Incident communication plan | ✅ Done | 72-hour breach notification documented |

---

## CC3 — Risk Assessment

| Control | Status | Implementation |
|---------|--------|----------------|
| Risk identification process | ✅ Done | `security_monitoring` table with risk levels |
| Vendor risk tiering | ✅ Done | `docs/VENDOR_DPA_TRACKER.md` — High/Medium/Low tiers |
| Data classification | ✅ Done | `docs/INFORMATION_SECURITY_POLICY.md` Section 5 |
| Fraud/abuse detection | ✅ Done | `detect_suspicious_patterns` DB function, rate limiting |
| Formal risk register | 🟡 Pending | Not yet maintained as standalone document |

---

## CC4 — Monitoring Activities

| Control | Status | Implementation |
|---------|--------|----------------|
| Security event logging | ✅ Done | `security_audit_log` table |
| Monitoring with risk classification | ✅ Done | `security_monitoring` table (risk_level field) |
| Anomaly detection | ✅ Done | `detect_subscription_access_anomalies` DB function |
| Log retention and cleanup | ✅ Done | Automated cleanup functions (30d debug, 90d audit) |
| External monitoring/alerting | 🔴 Not yet | No SIEM or external monitoring tool |

---

## CC5 — Control Activities

| Control | Status | Implementation |
|---------|--------|----------------|
| Access controls (least privilege) | ✅ Done | RLS on all 29 tables, env var secrets |
| Change management | ✅ Done | Git version control, PR-based deployments |
| Deployment controls | ✅ Done | CI/CD via GitHub, no manual prod access |
| Secrets management | ✅ Done | Environment variables, not in source code |
| Rate limiting | ✅ Done | `api_rate_limits`, `rate_limits` tables |

---

## CC6 — Logical & Physical Access

| Control | Status | Implementation |
|---------|--------|----------------|
| User authentication | ✅ Done | Supabase Auth (email/password, OAuth) |
| Session management | ✅ Done | `user_sessions` table with expiration |
| Row Level Security | ✅ Done | Enabled on all database tables |
| MFA for infra access | ✅ Done | Required on Supabase, Cloudflare, Stripe, GitHub |
| Physical security | ✅ Done | Cloud-hosted (AWS/Cloudflare data centers) |
| Access revocation | ✅ Done | Immediate revocation when access no longer needed |

---

## CC7 — System Operations

| Control | Status | Implementation |
|---------|--------|----------------|
| Incident detection | ✅ Done | `security_monitoring`, `security_audit_log` |
| Incident response plan | ✅ Done | `docs/INFORMATION_SECURITY_POLICY.md` Section 10 |
| Breach notification | ✅ Done | `data_breach_log` table, 72-hour notification |
| Backup procedures | ✅ Done | Supabase automated daily backups |
| Recovery procedures | 🟡 Partial | Backups exist, formal DR plan not documented |

---

## CC8 — Change Management

| Control | Status | Implementation |
|---------|--------|----------------|
| Version control | ✅ Done | Git/GitHub |
| Code review process | ✅ Done | PR-based workflow |
| Deployment pipeline | ✅ Done | CI/CD via GitHub → Cloudflare/Supabase |
| Database migrations tracked | ✅ Done | `supabase/migrations/` directory |
| Rollback capability | ✅ Done | Git history, migration rollback |

---

## CC9 — Risk Mitigation

| Control | Status | Implementation |
|---------|--------|----------------|
| Vendor DPAs | 🟡 Partial | 6/9 signed, 3 pending (see `VENDOR_DPA_TRACKER.md`) |
| Insurance | 🔴 Not yet | Cyber liability insurance not yet obtained |
| Business continuity plan | 🔴 Not yet | Not formalized |

---

## Privacy (Additional Criteria)

| Control | Status | Implementation |
|---------|--------|----------------|
| Privacy notice | ✅ Done | `/privacy` — comprehensive policy |
| Consent management | ✅ Done | `consent_records` table, cookie consent banner |
| Data subject rights | ✅ Done | Export, delete, restrict, rectify — all implemented |
| Data minimization | ✅ Done | Only necessary data collected |
| Children's privacy | ✅ Done | COPPA parental consent, age gating, PII detection |

---

## Summary

| Criteria | Done | Partial | Not Started |
|----------|------|---------|-------------|
| CC1 — Control Environment | 3 | 2 | 0 |
| CC2 — Communication | 4 | 0 | 0 |
| CC3 — Risk Assessment | 4 | 1 | 0 |
| CC4 — Monitoring | 4 | 0 | 1 |
| CC5 — Control Activities | 5 | 0 | 0 |
| CC6 — Logical/Physical Access | 6 | 0 | 0 |
| CC7 — System Operations | 4 | 1 | 0 |
| CC8 — Change Management | 5 | 0 | 0 |
| CC9 — Risk Mitigation | 0 | 1 | 2 |
| Privacy | 5 | 0 | 0 |
| **TOTAL** | **40** | **5** | **3** |

**Readiness: ~83%** — Formal audit can proceed once remaining items are addressed and deal size warrants the investment.

---

*When ready for formal SOC 2, evaluate: Vanta, Drata, or Secureframe for continuous monitoring and audit preparation.*
