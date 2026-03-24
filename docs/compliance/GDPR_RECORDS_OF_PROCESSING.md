# GDPR Article 30 - Records of Processing Activities

**Document Version:** 1.0  
**Last Updated:** 2026-01-22  
**Data Controller:** Time2Read LLC  
**Contact Email:** privacy@time2read.app  
**Data Protection Officer:** [To be appointed if required]

---

## 1. Controller Information

| Field | Value |
|-------|-------|
| **Organization Name** | Time2Read LLC |
| **Address** | [Company Address] |
| **Country** | United States |
| **Contact Email** | privacy@time2read.app |
| **Website** | https://time2read.app |
| **Representative in EU** | [To be designated if required] |

---

## 2. Categories of Data Subjects

| Category | Description | Approximate Count |
|----------|-------------|-------------------|
| **Parent Users** | Adults who create accounts and manage child profiles | Active users |
| **Child Users (Under 13)** | Children whose profiles are created by parents (COPPA) | Subset of profiles |
| **Premium Subscribers** | Users with paid subscriptions | Paying customers |
| **Guest Users** | Anonymous trial users (minimal data) | Session-based only |

---

## 3. Processing Activities Register

### 3.1 User Authentication & Account Management

| Field | Description |
|-------|-------------|
| **Purpose** | User registration, login, password management |
| **Categories of Personal Data** | Email address, password (hashed), display name, avatar |
| **Legal Basis** | Contract (Art. 6(1)(b)) - necessary for service provision |
| **Source of Data** | Directly from data subject during registration |
| **Recipients** | Supabase (processor) |
| **Transfers to Third Countries** | USA (Supabase infrastructure) |
| **Transfer Safeguards** | Standard Contractual Clauses |
| **Retention Period** | Until account deletion + 30 days backup |
| **Technical Measures** | Password hashing, TLS encryption, RLS policies |

### 3.2 Child Profile Management (COPPA)

| Field | Description |
|-------|-------------|
| **Purpose** | Create personalized reading experiences for children |
| **Categories of Personal Data** | Display name, birth year/month, grade level, avatar, interests, parent email |
| **Categories of Data Subjects** | Children under 13 |
| **Legal Basis** | Consent (Art. 6(1)(a)) - Verifiable Parental Consent |
| **Source of Data** | Parent user creating profile |
| **Recipients** | Supabase (processor), Resend (COPPA notifications) |
| **Transfers to Third Countries** | USA |
| **Transfer Safeguards** | Standard Contractual Clauses |
| **Retention Period** | Until deleted by parent or account closure |
| **Technical Measures** | RLS (parent can only access own children), encryption |

### 3.3 Story Generation & Reading

| Field | Description |
|-------|-------------|
| **Purpose** | Generate personalized AI stories for reading practice |
| **Categories of Personal Data** | Reading preferences, grade level, interests (no direct identifiers sent to AI) |
| **Legal Basis** | Contract (Art. 6(1)(b)) - service delivery |
| **Source of Data** | User preferences and profile |
| **Recipients** | OpenAI (processor), Anthropic (fallback processor) |
| **Transfers to Third Countries** | USA |
| **Transfer Safeguards** | DPAs with zero-retention clauses |
| **Retention Period** | Prompts: transient only; Generated stories: until session ends or saved |
| **Technical Measures** | PII stripping before AI calls, session isolation |

### 3.4 Image Generation

| Field | Description |
|-------|-------------|
| **Purpose** | Generate illustrations for stories |
| **Categories of Personal Data** | Character descriptions (based on avatar, not PII) |
| **Legal Basis** | Contract (Art. 6(1)(b)) |
| **Source of Data** | Derived from avatar settings |
| **Recipients** | Runware (processor) |
| **Transfers to Third Countries** | [TBD based on Runware location] |
| **Transfer Safeguards** | [Pending DPA] |
| **Retention Period** | Images cached for session duration |
| **Technical Measures** | No PII in prompts |

### 3.5 Voice/Text-to-Speech

| Field | Description |
|-------|-------------|
| **Purpose** | Read stories aloud to users |
| **Categories of Personal Data** | Story text only (no PII) |
| **Legal Basis** | Contract (Art. 6(1)(b)) |
| **Source of Data** | Generated story content |
| **Recipients** | ElevenLabs (processor) |
| **Transfers to Third Countries** | USA/EU |
| **Transfer Safeguards** | [Pending DPA] |
| **Retention Period** | Audio: transient only |
| **Technical Measures** | No user identifiers transmitted |

### 3.6 Payment Processing

| Field | Description |
|-------|-------------|
| **Purpose** | Process subscription payments |
| **Categories of Personal Data** | Email, payment card details, billing address |
| **Legal Basis** | Contract (Art. 6(1)(b)) |
| **Source of Data** | Directly from data subject via Stripe checkout |
| **Recipients** | Stripe (independent controller for card data) |
| **Transfers to Third Countries** | USA/EU (Stripe regional processing) |
| **Transfer Safeguards** | Stripe DPA, PCI DSS compliance |
| **Retention Period** | Transaction records: 7 years (legal requirement) |
| **Technical Measures** | PCI DSS, we never see full card numbers |

### 3.7 Email Communications

| Field | Description |
|-------|-------------|
| **Purpose** | Transactional emails, COPPA notifications, parental consent |
| **Categories of Personal Data** | Email addresses, parent email addresses |
| **Legal Basis** | Contract (transactional), Legal Obligation (COPPA) |
| **Source of Data** | User registration, parent email field |
| **Recipients** | Resend (processor) |
| **Transfers to Third Countries** | USA |
| **Transfer Safeguards** | Resend DPA |
| **Retention Period** | Email logs: 30 days |
| **Technical Measures** | TLS encryption |

### 3.8 Analytics & Security Monitoring

| Field | Description |
|-------|-------------|
| **Purpose** | Service security, fraud prevention, incident response |
| **Categories of Personal Data** | IP addresses, user agents, event logs |
| **Legal Basis** | Legitimate Interest (Art. 6(1)(f)) - security |
| **Source of Data** | Automatically collected during service use |
| **Recipients** | Internal only (Supabase database) |
| **Transfers to Third Countries** | USA (Supabase) |
| **Transfer Safeguards** | Standard Contractual Clauses |
| **Retention Period** | Security logs: 90 days |
| **Technical Measures** | RLS, service role access only |

### 3.9 Reading Progress & Comprehension

| Field | Description |
|-------|-------------|
| **Purpose** | Track reading progress, vocabulary learning, quiz scores |
| **Categories of Personal Data** | Reading sessions, scores, time spent, vocabulary words |
| **Legal Basis** | Contract (Art. 6(1)(b)) - service feature |
| **Source of Data** | User activity during reading sessions |
| **Recipients** | None (internal processing only) |
| **Transfers to Third Countries** | USA (Supabase) |
| **Retention Period** | Until account deletion |
| **Technical Measures** | RLS - users access only own data |

---

## 4. Transfers to Third Countries

| Recipient | Country | Transfer Mechanism | Safeguards |
|-----------|---------|-------------------|------------|
| Supabase | USA | Standard Contractual Clauses | SOC 2 Type II |
| Stripe | USA/EU | Standard Contractual Clauses | PCI DSS, SOC 2 |
| OpenAI | USA | Standard Contractual Clauses | Enterprise DPA |
| Resend | USA | Standard Contractual Clauses | DPA |
| ElevenLabs | USA/EU | [Pending] | [Pending DPA] |
| Runware | [TBD] | [Pending] | [Pending DPA] |
| Anthropic | USA | [Pending] | [Pending DPA] |

---

## 5. Retention Schedule Summary

| Data Category | Retention Period | Deletion Method |
|---------------|-----------------|-----------------|
| User accounts | Until deletion request | Cascading delete |
| Child profiles | Until deleted by parent | Cascading delete |
| Reading sessions | Account lifetime | Deleted with account |
| Saved stories | Account lifetime | Deleted with account |
| Payment records | 7 years (legal) | Automated archival |
| Security logs | 90 days | Automated purge |
| Session data | 24 hours | Automated expiry |
| COPPA incidents | 3 years | Automated archival |

---

## 6. Technical and Organizational Measures

### Technical Measures
- [x] Encryption at rest (AES-256)
- [x] Encryption in transit (TLS 1.3)
- [x] Row Level Security (RLS) on all tables
- [x] Password hashing (bcrypt)
- [x] Session token management
- [x] Rate limiting on APIs
- [x] Input validation and sanitization
- [x] SQL injection prevention (parameterized queries)

### Organizational Measures
- [x] Privacy Policy published
- [x] Terms of Service published
- [x] COPPA compliance procedures
- [x] Incident Response Plan documented
- [x] Vendor DPA tracking
- [x] Employee access controls (service role only)
- [ ] Regular security audits (scheduled)
- [ ] Data Protection Impact Assessment (if required)

---

## 7. Data Subject Rights Procedures

| Right | Implementation | Response Time |
|-------|----------------|---------------|
| **Access (Art. 15)** | Export user data feature | 30 days |
| **Rectification (Art. 16)** | Self-service profile editing | Immediate |
| **Erasure (Art. 17)** | Account deletion feature | 30 days |
| **Restriction (Art. 18)** | Contact privacy@time2read.app | 30 days |
| **Portability (Art. 20)** | JSON export feature | 30 days |
| **Object (Art. 21)** | Contact privacy@time2read.app | 30 days |
| **Automated Decisions (Art. 22)** | N/A - no automated decision-making with legal effects | N/A |

---

## 8. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-22 | Compliance | Initial creation |

---

## 9. Review Schedule

This document must be reviewed:
- Annually (minimum)
- When new processing activities are added
- When new vendors/processors are engaged
- When there are significant changes to data flows
- Following any data protection incident

**Next Review Due:** 2027-01-22

---

*This document is prepared in accordance with GDPR Article 30 requirements and should be made available to supervisory authorities upon request.*
