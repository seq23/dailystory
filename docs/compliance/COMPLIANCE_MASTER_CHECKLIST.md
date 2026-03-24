# ✅ FULL COMPLIANCE CHECKLIST — TIME-2-READ

**Owner:** Spry VSL LLC  
**Canonical Privacy Email:** privacy@time-2-read.com  
**Last Verified:** March 2026

---

## 🔐 1. Privacy.tsx (Core Policy — Source of Truth)

- [x] Email listed as **privacy@time-2-read.com**
- [x] Date set to **January 1, 2026**
- [x] Clearly defines:
  - [x] Data collected (user + automatic)
  - [x] Purpose of data use
  - [x] Legal basis (GDPR)
- [x] Includes:
  - [x] Cookies + tracking disclosure
  - [x] Third-party services disclosure
  - [x] Data retention statement
  - [x] International transfers (U.S.)
- [x] User rights section (GDPR complete)
- [x] States **no selling of personal data**
- [x] Matches actual site behavior (no fake claims)

---

## 🌍 2. GDPR.tsx (EU-Specific Rights Layer)

- [x] Explicitly lists GDPR rights:
  - [x] Access
  - [x] Rectification
  - [x] Erasure
  - [x] Restriction
  - [x] Portability
  - [x] Objection
- [x] Provides contact: **privacy@time-2-read.com**
- [x] States lawful bases:
  - [x] Legitimate interest
  - [x] Consent
  - [x] Legal obligation
- [x] Explains how to exercise rights
- [x] Mentions response timeframe (30 days)
- [x] Aligns exactly with Privacy.tsx (no contradictions)

---

## 🇺🇸 3. CCPA.tsx (California Rights)

- [x] States rights:
  - [x] Right to know
  - [x] Right to delete
  - [x] Right to correct
  - [x] Right to opt-out of sale
- [x] Explicitly states: **We do not sell personal information**
- [x] Includes contact: **privacy@time-2-read.com**
- [x] Describes categories of data collected
- [x] Includes non-discrimination statement
- [x] Matches Privacy.tsx data definitions
- [x] No false claims (voice recordings removed, geolocation removed)

---

## ⚖️ 4. Terms.tsx (Terms of Service)

- [x] Defines:
  - [x] Use of site
  - [x] No guarantees / no liability
- [x] Includes:
  - [x] Limitation of liability
  - [x] Disclaimer of warranties
- [x] Governing law: United States (Delaware)
- [x] References Privacy Policy
- [x] No claims that contradict privacy/data handling
- [x] Company name: Spry VSL LLC (consistent)

---

## 🎓 5. FERPA.tsx (Education Compliance)

- [x] States platform's education data handling
- [x] Defines student data collected
- [x] Access + correction rights for schools
- [x] Contact: **privacy@time-2-read.com**
- [x] No fake emails (schools@time2read.app removed)
- [x] Does not conflict with Privacy.tsx

---

## ♿ 6. Accessibility.tsx (ADA / WCAG Statement)

- [x] States commitment to accessibility (WCAG 2.1 AA)
- [x] Mentions:
  - [x] Ongoing improvements
  - [x] Compatibility with assistive tech
- [x] Provides contact: **privacy@time-2-read.com**
- [x] Known limitations disclosed honestly

---

## 🧩 7. Vendors.tsx (Third-Party Transparency)

- [x] Lists ALL third-party tools:
  - [x] Supabase (Database & Auth)
  - [x] OpenAI (AI Story Generation)
  - [x] Runware (AI Image Generation)
  - [x] ElevenLabs (Text-to-Speech)
  - [x] Stripe (Payments)
  - [x] Resend (Email)
  - [x] Cloudflare (Hosting & CDN)
  - [x] GitHub (Source Code & CI/CD)
- [x] For each vendor:
  - [x] What data they process
  - [x] Why they are used
- [x] States vendors are contractually obligated to protect data
- [x] Matches Privacy.tsx third-party section

---

## 🌐 8. DataTransfers.tsx (Cross-Border Handling)

- [x] States data may be transferred to the United States
- [x] Includes:
  - [x] Use of Standard Contractual Clauses (SCCs)
- [x] Explains safeguards in plain language
- [x] Lists all vendors (including Cloudflare and GitHub)
- [x] Consistent with Privacy.tsx

---

## 🔁 CROSS-FILE CONSISTENCY CHECK

- [x] Same email everywhere: **privacy@time-2-read.com**
- [x] Same definition of "data collected" across all files
- [x] Same third-party vendors listed everywhere
- [x] Same "we do not sell data" language (Privacy + CCPA)
- [x] No contradictions between Privacy, Vendors, DataTransfers, CCPA
- [x] No fake/unused emails (schools@, accessibility@, hello@, legal@, support@ all removed)

---

## 🚨 REALITY CHECK

- [x] No analytics running without disclosure
- [x] Cookie consent banner present (CookieConsent.tsx)
- [x] No email capture without clear opt-in
- [x] Data access request supported (export-user-data edge function)
- [x] Deletion request supported (delete-user-account edge function)
- [x] No voice recording claims (server-side TTS only via ElevenLabs)
- [x] No geolocation collection claims (not collected)

---

## 📋 IMPLEMENTATION REFERENCES

| Feature | Implementation |
|---------|---------------|
| Data Export | `supabase/functions/export-user-data/` |
| Account Deletion | `supabase/functions/delete-user-account/` |
| Cookie Consent | `src/components/CookieConsent.tsx` |
| Parental Consent | `supabase/functions/verify-parental-consent/` |
| COPPA Age Gate | Signup flow with `parent_email` collection |
| Security Audit Log | `security_audit_log` table |
| Breach Log | `data_breach_log` table |
| Consent Records | `consent_records` table |

---

**Review Schedule:**
- Before each release
- Quarterly full audit
- Whenever a new vendor is added
