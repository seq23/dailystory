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
| **OpenAI** | AI Story Generation (last resort), speech-to-text | Story prompts (age, grade, favorites, hobbies, typed request), including the child’s first name (replaced for a school account), and text a reader asks to spell, translate or define; kept up to 30 days for abuse monitoring; short voice clips after a tap on the microphone | ✅ Signed | [OpenAI DPA](https://openai.com/policies/data-processing-agreement) |
| **Resend** | Email Delivery | Email addresses, transactional email content | ✅ Signed | [Resend DPA](https://resend.com/legal/dpa) |
| **Cloudflare** | Hosting, CDN, DDoS Protection | IP addresses, request metadata | ✅ Signed | [Cloudflare DPA](https://www.cloudflare.com/cloudflare-customer-dpa/) |
| **GitHub** | Source Code, CI/CD | Source code only (no user data) | ✅ Signed | [GitHub DPA](https://github.com/customer-terms/github-data-protection-agreement) |
| **ElevenLabs** | Text-to-Speech | Story text, including the child’s first name when the story uses it; words a reader taps to hear; what the reader says in voice mode | ⏳ In progress | [ElevenLabs DPA](https://elevenlabs.io/dpa) |
| **Runware** | AI Image Generation | The picture scene and the reader’s avatar look, age and favorite color; never a name | ⏳ In progress | [Runware Terms](https://runware.ai) |
| **Anthropic** | AI Fallback (Claude), no longer called | Nothing: the code has not called Anthropic since it was removed from /subprocessors on 22 Nov 2026 | ⏳ In progress | [Anthropic DPA](https://www.anthropic.com/legal/dpa) |

---

The public list, with exactly what each vendor receives, is [/subprocessors](https://time-2-read.com/subprocessors); its badges come from `src/data/subprocessors.ts`, which a test (`src/test/guards/subprocessors-page.test.tsx`) holds equal to the status column above and to the table below. A status change goes in both places in the same PR.

---

## Other vendors on /subprocessors

Vendors outside the nine above, each checked against the vendor's live legal page on 22 Nov 2026. A "DPA signed" status here links the page that makes it so. These are not counted in the 9 above.

| Vendor | What we send | Status | Source |
|--------|--------------|--------|--------|
| **Cloudflare Workers AI** | Story prompts and quizzes with the reader’s name replaced; text a reader asks to spell, translate or define, as written | DPA signed (Cloudflare) | [Cloudflare Customer DPA](https://www.cloudflare.com/cloudflare-customer-dpa/) (v6.4, April 2026): covers all Cloudflare cloud services under the same account and Self-Serve Subscription Agreement as the hosting row above |
| **OpenRouter** | Story prompts and quizzes with the reader’s name replaced (free models may train on these); text a reader asks to spell, translate or define, as written, to the paid zero-retention model only | DPA signed (part of terms) | [OpenRouter Terms s.10.2](https://openrouter.ai/terms) (updated 31 Aug 2026): "The DPA is incorporated by reference into, and made a part of, these Terms"; [OpenRouter DPA](https://openrouter.ai/data-processing-agreement) |
| **Lovable AI Gateway (Google Gemini)** | A story page’s text, with the reader’s name replaced | DPA in progress | [Lovable DPA](https://lovable.dev/data-processing-agreement) (updated 6 Nov 2025) covers Business and Enterprise plans only; our plan is not confirmed as one of them |
| **ClassLink** | Nothing: we read a school’s rosters from ClassLink (GET requests only) | School’s provider (district DPA) | [ClassLink privacy](https://www.classlink.com/company/privacy); the district contracts with ClassLink, and our only call is `supabase/functions/_shared/institutionRoster.ts` |
| **Free Dictionary API** | One word, with no account details; a reader’s or account’s name is never sent | No personal data sent | [`supabase/functions/_shared/wordFallback.ts`](../../supabase/functions/_shared/wordFallback.ts) and `word-dictionary/index.ts` (names answered without any outside call) |

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
| **Medium Risk** (processes content we send) | OpenAI, Anthropic, ElevenLabs, Runware | Receives prompts, text or picture scenes. ElevenLabs gets story text with the child’s name, to read it aloud; OpenAI keeps chat prompts up to 30 days and Runware keeps images up to 7 days |
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
