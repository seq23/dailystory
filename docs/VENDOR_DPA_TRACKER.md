# Vendor Data Processing Agreement (DPA) Tracker

**Document Version:** 1.0  
**Last Updated:** 2026-01-22  
**Owner:** Legal/Compliance Team  
**Review Cycle:** Annual or upon vendor changes

---

## Purpose

This document tracks the status of Data Processing Agreements (DPAs) with all third-party vendors who process personal data on behalf of Time2Read. DPAs are required under GDPR Article 28 and demonstrate compliance with data protection requirements.

---

## Vendor DPA Status Matrix

| Vendor | Purpose | Data Processed | DPA Status | DPA Date | Next Review | DPA URL |
|--------|---------|----------------|------------|----------|-------------|---------|
| **Supabase** | Database, Authentication, Edge Functions | User accounts, profiles, reading data, child profiles | ✅ Signed | 2024-XX-XX | 2025-XX-XX | [Supabase DPA](https://supabase.com/legal/dpa) |
| **Stripe** | Payment Processing | Payment info, billing addresses, subscription data | ✅ Signed | 2024-XX-XX | 2025-XX-XX | [Stripe DPA](https://stripe.com/dpa) |
| **OpenAI** | AI Story Generation | Story prompts (no PII), user preferences | ✅ Signed | 2024-XX-XX | 2025-XX-XX | [OpenAI DPA](https://openai.com/policies/data-processing-agreement) |
| **ElevenLabs** | Voice/Text-to-Speech | Story text (no PII) | ⏳ Pending | - | - | [ElevenLabs DPA](https://elevenlabs.io/dpa) |
| **Runware** | AI Image Generation | Image prompts (no PII), character descriptions | ⏳ Pending | - | - | Contact vendor |
| **Resend** | Email Delivery | Email addresses, parent emails (COPPA) | ✅ Signed | 2024-XX-XX | 2025-XX-XX | [Resend DPA](https://resend.com/legal/dpa) |
| **Anthropic** | AI Fallback (Claude) | Story prompts (no PII) | ⏳ Pending | - | - | [Anthropic DPA](https://www.anthropic.com/legal/dpa) |

---

## DPA Status Legend

| Status | Description |
|--------|-------------|
| ✅ Signed | DPA executed and on file |
| ⏳ Pending | DPA requested, awaiting signature |
| ⚠️ Review Needed | DPA exists but requires update or renewal |
| ❌ Not Available | Vendor does not offer DPA (evaluate risk) |

---

## Vendor-Specific Details

### 1. Supabase (Primary Backend)

**Contact for DPA:** legal@supabase.io  
**Data Location:** US (AWS)  
**Sub-processors:** Listed at [supabase.com/legal/subprocessors](https://supabase.com/legal/subprocessors)

**Data Categories:**
- User authentication credentials
- User profiles and preferences
- Child profiles (including parent_email)
- Reading sessions and progress
- Saved stories and collections
- Security audit logs

**Security Measures:**
- SOC 2 Type II certified
- Data encrypted at rest and in transit
- Row Level Security (RLS) enabled

---

### 2. Stripe (Payments)

**Contact for DPA:** privacy@stripe.com  
**Data Location:** US/EU (based on customer location)  
**Sub-processors:** Listed at [stripe.com/service-providers](https://stripe.com/service-providers)

**Data Categories:**
- Customer billing information
- Payment card details (PCI DSS compliant)
- Subscription status
- Transaction history

**Security Measures:**
- PCI DSS Level 1 certified
- SOC 1 and SOC 2 Type II certified

---

### 3. OpenAI (Story Generation)

**Contact for DPA:** privacy@openai.com  
**Data Location:** US  
**API Data Policy:** Zero data retention enabled for API

**Data Categories:**
- Story generation prompts (sanitized, no PII)
- User preferences (age group, reading level)
- Character descriptions

**Security Measures:**
- API data not used for training
- Enterprise security controls

---

### 4. ElevenLabs (Voice)

**Contact for DPA:** legal@elevenlabs.io  
**Data Location:** US/EU  

**Data Categories:**
- Story text for voice synthesis
- Voice preference settings

**Security Measures:**
- Text not stored after synthesis
- No PII transmitted

---

### 5. Runware (Image Generation)

**Contact for DPA:** [Contact support]  
**Data Location:** [TBD]  

**Data Categories:**
- Image generation prompts
- Character visual descriptions

**Security Measures:**
- Prompts not stored after generation
- No PII in prompts

---

### 6. Resend (Email)

**Contact for DPA:** legal@resend.com  
**Data Location:** US  

**Data Categories:**
- Recipient email addresses
- Parent email addresses (COPPA compliance)
- Email content (transactional)

**Security Measures:**
- TLS encryption in transit
- GDPR compliant

---

### 7. Anthropic (AI Fallback)

**Contact for DPA:** legal@anthropic.com  
**Data Location:** US  

**Data Categories:**
- Story prompts (fallback only)
- No PII transmitted

**Security Measures:**
- Enterprise API security
- No training on API data

---

## Action Items

### Immediate (Q1 2026)

| Priority | Vendor | Action | Owner | Due Date |
|----------|--------|--------|-------|----------|
| HIGH | ElevenLabs | Request and sign DPA | Legal | 2026-02-01 |
| HIGH | Runware | Request DPA availability | Legal | 2026-02-01 |
| HIGH | Anthropic | Request and sign DPA | Legal | 2026-02-01 |
| MEDIUM | All | Update DPA dates after signing | Compliance | Ongoing |

### Annual Review

- [ ] Verify all DPAs are current
- [ ] Check for sub-processor changes
- [ ] Review data transfer mechanisms (SCCs if applicable)
- [ ] Update security certifications

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-22 | Compliance | Initial document creation |

---

## Appendix: DPA Request Template

```
Subject: Data Processing Agreement Request - Time2Read

Dear [Vendor] Legal Team,

Time2Read (time2read.app) uses [Vendor Product] to [describe purpose].

Under GDPR Article 28, we require a Data Processing Agreement to document 
our data protection responsibilities as controller and your role as processor.

Please provide:
1. Your standard DPA for signing
2. List of sub-processors
3. Data location and transfer mechanisms
4. Security certifications

Our company details:
- Company Name: Time2Read LLC
- Contact: [legal email]
- Address: [company address]

Thank you,
[Name]
Legal/Compliance Team
Time2Read
```

---

*This document is maintained by the Compliance Team and should be reviewed whenever vendors are added, removed, or change their data processing practices.*
