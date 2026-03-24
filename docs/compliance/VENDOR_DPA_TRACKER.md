# Vendor Data Processing Agreement (DPA) Tracker

**Document Version:** 2.0  
**Last Updated:** 2026-03-24  
**Owner:** Spry VSL LLC — Legal/Compliance  
**Contact:** privacy@time-2-read.com  
**Review Cycle:** Annual or upon vendor changes

---

## Purpose

This document tracks the status of Data Processing Agreements (DPAs) with all third-party vendors who process data on behalf of Time-2-Read. DPAs are required under GDPR Article 28.

---

## Vendor DPA Status Matrix

| Vendor | Purpose | Data Processed | DPA Status | DPA URL |
|--------|---------|----------------|------------|---------|
| **Supabase** | Database, Auth, Edge Functions | User accounts, profiles, reading data, child profiles | ✅ Signed | [Supabase DPA](https://supabase.com/legal/dpa) |
| **Stripe** | Payment Processing | Email, payment info, subscription data | ✅ Signed | [Stripe DPA](https://stripe.com/dpa) |
| **OpenAI** | AI Story Generation | Story prompts (no PII) | ✅ Signed | [OpenAI DPA](https://openai.com/policies/data-processing-agreement) |
| **Resend** | Email Delivery | Email addresses, transactional email content | ✅ Signed | [Resend DPA](https://resend.com/legal/dpa) |
| **Cloudflare** | Hosting, CDN, DDoS Protection | IP addresses, request metadata | ✅ Signed | [Cloudflare DPA](https://www.cloudflare.com/cloudflare-customer-dpa/) |
| **GitHub** | Source Code, CI/CD | Source code only (no user data) | ✅ Signed | [GitHub DPA](https://github.com/customer-terms/github-data-protection-agreement) |
| **ElevenLabs** | Text-to-Speech | Story text (no PII) | ✅ Signed | [ElevenLabs DPA](https://elevenlabs.io/dpa) |
| **Runware** | AI Image Generation | Image prompts (no PII) | ✅ Signed | [Runware Terms](https://runware.ai) |
| **Anthropic** | AI Fallback (Claude) | Story prompts (no PII) | ✅ Signed | [Anthropic DPA](https://www.anthropic.com/legal/dpa) |

---

## DPA Status Legend

| Status | Description |
|--------|-------------|
| ✅ Signed | DPA executed or accepted (standard terms) |
| ⏳ Pending | DPA requested, awaiting signature |
| ⚠️ Review Needed | DPA exists but requires update or renewal |
| ❌ Not Available | Vendor does not offer DPA |

---

## Vendor Risk Tiering

| Tier | Vendors | Criteria |
|------|---------|----------|
| **High Risk** (stores personal data) | Supabase, Stripe, Resend | Direct access to PII |
| **Medium Risk** (processes data transiently) | OpenAI, Anthropic, ElevenLabs, Runware | Receives prompts/text, no PII, no long-term storage |
| **Low Risk** (infrastructure only) | Cloudflare, GitHub | No direct user data processing |

---

## Action Items

### Completed

All 9 vendor DPAs are signed or accepted (standard API terms). No pending items.

### Annual Review

- [ ] Verify all DPAs are current
- [ ] Check for subprocessor changes
- [ ] Review data transfer mechanisms (SCCs if applicable)
- [ ] Update security certifications

---

## DPA Request Template

```
Subject: Data Processing Agreement Request - Time-2-Read

Dear [Vendor] Legal Team,

Time-2-Read (time-2-read.lovable.app) uses [Vendor Product] to [describe purpose].

Under GDPR Article 28, we require a Data Processing Agreement to document
our data protection responsibilities.

Please provide:
1. Your standard DPA for signing
2. List of subprocessors
3. Data location and transfer mechanisms
4. Security certifications

Company: Spry VSL LLC
Contact: privacy@time-2-read.com

Thank you,
Compliance Team
Time-2-Read
```

---

*This document is maintained by the Compliance Team and reviewed whenever vendors are added, removed, or change their data processing practices.*
