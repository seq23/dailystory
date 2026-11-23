# Vendor Data Processing Agreement (DPA) Tracker

**Document Version:** 2.0  
**Last Updated:** 2026-11-22  
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
| **OpenAI** | AI Story Generation, speech-to-text | Story prompts as written, including the child’s first name; short voice clips after a tap on the microphone | ✅ Signed | [OpenAI DPA](https://openai.com/policies/data-processing-agreement) |
| **Resend** | Email Delivery | Email addresses, transactional email content | ✅ Signed | [Resend DPA](https://resend.com/legal/dpa) |
| **Cloudflare** | Hosting, CDN, DDoS Protection | IP addresses, request metadata | ✅ Signed | [Cloudflare DPA](https://www.cloudflare.com/cloudflare-customer-dpa/) |
| **GitHub** | Source Code, CI/CD | Source code only (no user data) | ✅ Signed | [GitHub DPA](https://github.com/customer-terms/github-data-protection-agreement) |
| **ElevenLabs** | Text-to-Speech | Story text, including the child’s first name when the story uses it; words a reader taps to hear; what the reader says in voice mode | ⏳ In progress | [ElevenLabs DPA](https://elevenlabs.io/dpa) |
| **Runware** | AI Image Generation | The picture scene and the reader’s avatar look, age and favorite color; never a name | ⏳ In progress | [Runware Terms](https://runware.ai) |
| **Anthropic** | AI Fallback (Claude), no longer called | Nothing: the code has not called Anthropic since it was removed from /subprocessors on 22 Nov 2026 | ⏳ In progress | [Anthropic DPA](https://www.anthropic.com/legal/dpa) |

---

The public list, with exactly what each vendor receives, is [/subprocessors](https://time-2-read.com/subprocessors); its DPA badges come from `src/data/subprocessors.ts`, which a test (`src/test/guards/subprocessors-page.test.tsx`) holds equal to the status column above. A status change goes in both places in the same PR. Vendors on /subprocessors with no row here (ClassLink, OpenRouter, Cloudflare Workers AI, Lovable AI Gateway, Free Dictionary API, Google Fonts, Microsoft Clarity) have no DPA status recorded, and the page shows none for them.

---

## DPA Status Legend

| Status | Description |
|--------|-------------|
| ✅ Signed | DPA executed or accepted (standard terms) |
| ⏳ In progress | Not yet signed or accepted |
| ⚠️ Review Needed | DPA exists but requires update or renewal |
| ❌ Not Available | Vendor does not offer DPA |

---

## Vendor Risk Tiering

| Tier | Vendors | Criteria |
|------|---------|----------|
| **High Risk** (stores personal data) | Supabase, Stripe, Resend | Direct access to PII |
| **Medium Risk** (processes data transiently) | OpenAI, Anthropic, ElevenLabs, Runware | Receives prompts and text, which can include the child’s first name (OpenAI, ElevenLabs) |
| **Low Risk** (infrastructure only) | Cloudflare, GitHub | No direct user data processing |

---

## Action Items

### Completed

6 of 9 vendor DPAs are signed or accepted (standard API terms): Supabase, Stripe, OpenAI, Resend, Cloudflare, GitHub.

### In progress

- [ ] ElevenLabs
- [ ] Runware
- [ ] Anthropic (no longer called by the code)

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
