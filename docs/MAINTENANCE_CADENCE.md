# System Maintenance Cadence
**Created:** October 13, 2025  
**Last Updated:** October 13, 2025  
**Status:** ✅ Active Reference Document

---

## 🎯 Purpose

This document serves as your **first-stop reference** after returning from a hiatus. It consolidates all maintenance requirements across:
- 🖼️ Image Generation System
- 📖 Story Generation System  
- 🔊 Audio/Voice/TTS Systems
- 🗄️ Database Systems
- 🔐 API & Secret Management
- 📊 Monitoring & Health Checks

---

## 📋 Quick Reference: Task Frequencies

| Frequency | Duration | Systems Covered |
|-----------|----------|-----------------|
| **Daily** | < 5 min | Critical health checks, API quota monitoring |
| **Weekly** | < 30 min | Regular maintenance, cleanup functions |
| **Monthly** | 1-2 hrs | System audits, comprehensive cleanup |
| **Quarterly** | Half day | Strategic reviews, security audits |
| **As-Needed** | Varies | Event-triggered maintenance |

---

## 🚨 Hiatus Recovery Checklist

### When Returning After Extended Break

#### ⏱️ Immediate (First Hour)
- [ ] Read this MAINTENANCE_CADENCE.md document completely
- [ ] Check Production Health Dashboard (Section 1)
- [ ] Review any alerts or incidents in monitoring
- [ ] Verify all API keys are still valid (Section 6)
- [ ] Check edge function quota status

#### 📅 First Day
- [ ] Run `comprehensive_security_cleanup()` database function
- [ ] Test all 6 image generation tiers using ImageTierTester
- [ ] Test story generation (both guest Netflix + premium live modes)
- [ ] Verify payment systems are operational (Stripe webhook test)
- [ ] Review edge function logs for any critical errors

#### 📆 First Week
- [ ] Review all documentation updates in `docs/FIX_HISTORY_2025.md`
- [ ] Run comprehensive security scan (`security--run_security_scan` tool)
- [ ] Test emergency fallback systems (story + image Tier 4)
- [ ] Review performance metrics and identify any trends
- [ ] Update any outdated dependencies (check package.json)

#### 🗓️ First Month
- [ ] Full system audit across all tiers
- [ ] Review and optimize API costs (OpenAI, Runware, ElevenLabs)
- [ ] Update roadmap and priorities based on usage data
- [ ] Train on any new features or architectural changes
- [ ] Review and update this maintenance document

---

## 1. Daily Maintenance (< 5 minutes)

### 🖼️ Image Generation System
- [ ] Monitor image generation success rates (target: >99%)
- [ ] Check Runware API quota usage
- [ ] Verify 6-tier cascade is functioning:
  - Tier 1: AI Visual Scene Creator
  - Direct Mode: Nuclear fallback
  - Tier 2.5A: Premium Template
  - Tier 2.5B: Basic Template
  - Tier 2.5C: Nuclear Template
  - Tier 2.5D: Emergency Fallback

**Expected Health:**
```
✅ Tier 1 Success Rate: >85%
✅ Overall Success Rate: >99.2%
✅ Avg Response Time: <2s
```

### 📖 Story Generation System
- [ ] Monitor story generation success rates (target: >99.8%)
- [ ] Check OpenAI API quota and costs
- [ ] Verify 4-tier fallback system:
  - Tier 1: Network CDN (esm.sh with fallbacks)
  - Tier 2: Vendor fallback (local bundle)
  - Tier 3: Template service
  - Tier 4: Emergency content (always succeeds)

**Expected Health:**
```
✅ Tier 1 Success Rate: >85%
✅ Overall Success Rate: >99.8%
✅ Tier 4 Emergency: 100% success
```

### 🔊 Audio/Voice/TTS System
- [ ] Monitor ElevenLabs API quota
- [ ] Check TTS generation success rates
- [ ] Verify word synchronization accuracy

**Expected Health:**
```
✅ TTS Success Rate: >95%
✅ Word Sync Accuracy: >90%
✅ Avg Generation Time: <2s
```

### 🔐 API Key Monitoring
- [ ] Check rate limit warnings (429 errors)
- [ ] Monitor quota usage for all providers:
  - OpenAI (story generation)
  - Runware (image generation)
  - ElevenLabs (TTS/voice)
  - Stripe (payments)

---

## 2. Weekly Maintenance (< 30 minutes)

### 🗄️ Database Cleanup Functions

Run these database functions weekly:

```sql
-- 1. Cleanup expired sessions (30-day retention)
SELECT cleanup_expired_sessions();

-- 2. Cleanup old debug logs (30-day retention)
SELECT cleanup_old_debug_logs();

-- 3. Review image generation logs (auto-cleanup keeps last 6/session + 7 days)
-- Note: cleanup_image_generation_debug_logs() runs automatically
```

### 🖼️ Image Generation Testing
- [ ] Run Force Tier 1 test in ImageTierTester
- [ ] Verify character consistency cache performance
- [ ] Review image generation error logs

**Testing Checklist:**
```
✅ Force Tier 1: 200 status, imageURL, prompts displayed
✅ All 6 tiers: Individual tier tests passing
✅ Character cache: Hit rate >80%
```

### 📖 Story Generation Testing
- [ ] Test Netflix-style generation (guest mode)
- [ ] Test live generation (premium mode)
- [ ] Verify emergency content fallback

**Testing Checklist:**
```
✅ Guest mode: 10-12 pages batch generated
✅ Premium mode: Page-by-page live generation
✅ Emergency fallback: Rhyming template works
```

### 🔊 Audio System Maintenance
- [ ] Review audio coordinator logs for conflicts
- [ ] Test pronunciation for newly added vocabulary
- [ ] Verify voice catalog functionality

### 📊 Monitoring Review
- [ ] Review MonitoringService detailed stats
- [ ] Check error trends and patterns
- [ ] Verify alert thresholds are appropriate

---

## 3. Monthly Maintenance (1-2 hours)

### 🗄️ Comprehensive Database Cleanup

Run the comprehensive cleanup function monthly:

```sql
-- This runs all cleanup operations in one call
SELECT comprehensive_security_cleanup();

-- This function cleans:
-- - Debug logs (30-day retention)
-- - Security audit logs (90-day retention)
-- - Personal info incidents (2-year retention)
-- - Expired sessions (30-day retention)
-- - Rate limits (7-day retention)
```

**Cleanup Summary:**
```
✅ Debug logs: >30 days deleted
✅ Audit logs: >90 days deleted
✅ Sessions: >30 days deleted
✅ Rate limits: >7 days deleted
```

### 🖼️ Image System Audits
- [ ] Review and update template system prompts (if needed)
- [ ] Audit image generation error patterns
- [ ] Test all 6 tiers individually
- [ ] Review character consistency cache efficiency

### 📖 Story System Audits
- [ ] Review and update story templates (136 templates across grade levels)
- [ ] Audit placeholder resolution accuracy
- [ ] Test cultural intelligence and ethnicity systems

### 🔊 Audio System Audits
- [ ] Review morphological pattern coverage
- [ ] Add new stems for pronunciation system
- [ ] Audit translation accuracy for supported languages
- [ ] Test audio timing optimizations

### 🔐 API Key Management
- [ ] Audit API key permissions and scopes
- [ ] Review API cost optimization opportunities
- [ ] Check for deprecated API versions

### 🔒 Security Review
- [ ] Run `security--run_security_scan` tool
- [ ] Review security audit logs for suspicious activity
- [ ] Check personal info incident reports
- [ ] Verify RLS policies are active on all tables

---

## 4. Quarterly Maintenance (Half Day)

### 🏗️ Strategic Reviews
- [ ] Full system health audit
- [ ] Evaluate API costs vs alternatives:
  - OpenAI (GPT-4o, GPT-4o-mini) vs competitors
  - Runware vs alternative image generation APIs
  - ElevenLabs vs alternative TTS services

### 📝 Template Updates
- [ ] Review image generation template structures
- [ ] Update story templates based on user feedback
- [ ] Optimize prompt engineering for all tiers

### 🔒 Security & Compliance
- [ ] Full security audit (like CURRENT_SECURITY_STATE.md)
- [ ] Review COPPA compliance measures
- [ ] Update security documentation
- [ ] Test incident response procedures

### 📊 Performance Optimization
- [ ] Full performance audit across all systems
- [ ] Evaluate architectural improvements
- [ ] Update performance benchmarks
- [ ] Analyze cache hit rates

### 🗑️ Old Data Purging

Run quarterly data purging function:

```sql
-- This deletes incident records older than 2 years (COPPA compliance)
SELECT purge_old_incidents();
```

### 🎓 Knowledge Transfer
- [ ] Document any new features or changes
- [ ] Update team on architectural improvements
- [ ] Train on new debugging procedures

---

## 5. Database Maintenance Reference

### Automated Cleanup Functions

| Function | Frequency | Retention Policy | Purpose |
|----------|-----------|------------------|---------|
| `comprehensive_security_cleanup()` | Monthly | Multi-tier | Runs all cleanup operations |
| `cleanup_expired_sessions()` | Weekly | 30 days | Removes old sessions |
| `cleanup_old_debug_logs()` | Weekly | 30 days | Removes AI prompt logs |
| `cleanup_security_audit_log()` | Monthly | 90 days | Removes old audit logs |
| `cleanup_image_generation_debug_logs()` | Automatic | 7 days + last 6/session | Removes image debug logs |
| `purge_old_incidents()` | Quarterly | 2 years | COPPA compliance cleanup |

### Retention Policy Summary

| Data Type | Retention Period | Cleanup Function |
|-----------|------------------|------------------|
| AI Debug Logs | 30 days | `cleanup_old_debug_logs()` |
| Security Audit Logs | 90 days | `cleanup_security_audit_log()` |
| Personal Info Incidents | 2 years | `purge_old_incidents()` |
| User Sessions | 30 days | `cleanup_expired_sessions()` |
| Rate Limits | 7 days | `comprehensive_security_cleanup()` |
| Image Debug Logs | Last 6/session + 7 days | `cleanup_image_generation_debug_logs()` (auto) |

### Manual Database Operations

**Security Functions (Run Manually as Needed):**

```sql
-- Detect suspicious user activity patterns
SELECT detect_suspicious_patterns();

-- Detect subscription access anomalies
SELECT detect_subscription_access_anomalies();

-- Verify subscription view security
SELECT verify_subscription_view_security();

-- Get security dashboard (service role only)
SELECT get_security_dashboard();
```

---

## 6. API Key & Secret Management

### Active API Keys to Monitor

| API Key | Service | Usage | Rotation Schedule |
|---------|---------|-------|-------------------|
| `OPENAI_API_KEY` | Story generation | High | Quarterly (non-critical) |
| `RUNWARE_API_KEY` | Image generation | High | Quarterly |
| `ELEVENLABS_API_KEY` | TTS/voice | Medium | Quarterly |
| `STRIPE_SECRET_KEY` | Payments | Critical | ❌ DO NOT ROTATE |
| `LOVABLE_API_KEY` | Auto-generated | N/A | ❌ DO NOT ROTATE |
| `RESEND_API_KEY` | Email notifications | Low | Quarterly |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend ops | Critical | Contact Supabase |

### API Key Rotation Procedures

**Quarterly Rotation (Non-Critical Keys):**
1. Generate new API key from provider dashboard
2. Update key in Supabase Edge Function Secrets
3. Deploy and test with new key
4. Monitor for 24 hours
5. Revoke old key from provider

**⚠️ CRITICAL WARNINGS:**
- **NEVER** rotate `STRIPE_SECRET_KEY` without coordination
- **NEVER** rotate `LOVABLE_API_KEY` (auto-managed)
- **NEVER** rotate `SUPABASE_SERVICE_ROLE_KEY` without Supabase team

### Rate Limit & Quota Monitoring

**Daily Checks:**
- OpenAI: Track token usage, watch for rate limit warnings
- Runware: Monitor image generation quota
- ElevenLabs: Track TTS character count
- Supabase: Monitor edge function invocations

**Alert Thresholds:**
| Provider | Warning Level | Critical Level |
|----------|---------------|----------------|
| OpenAI | 80% quota | 95% quota |
| Runware | 80% quota | 90% quota |
| ElevenLabs | 80% quota | 90% quota |
| Supabase | 2M invocations | 2.5M invocations |

---

## 7. Monitoring & Health Checks

### Daily Health Dashboard

**Expected Production Status:**

```
🟢 ALL SYSTEMS OPERATIONAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Story Generation: >99.8% success
✅ Image Generation: >99.2% success
✅ Payment Systems: 100% operational
✅ Edge Functions: 40/40 operational
✅ Emergency Fallback: 100% success rate
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Monitoring Service (Auto-Cleanup)

**Configuration:**
- Rolling 5-minute window for metrics
- Auto-cleanup runs every 1 minute
- Tracks: error rate, API calls, response times, costs

**Metrics Tracked:**
```typescript
{
  errorRate: percentage,
  averageResponseTime: milliseconds,
  apiCallRate: calls per minute,
  costPerCall: USD,
  tierDistribution: { tier1: %, tier2: %, tier3: %, tier4: % }
}
```

### Alert Thresholds

| Metric | Warning | Critical | Action Required |
|--------|---------|----------|-----------------|
| Error Rate | >15% | >30% | Investigate immediately |
| Avg Response Time | >5s | >8s | Check network/API status |
| API Call Spike | >50/min | >100/min | Review edge function quota |
| Cost Per Call | >$0.03 | >$0.05 | Optimize tier usage |

---

## 8. Edge Function Quota Management

### Critical After 2.98M Invocation Incident

**Daily Monitoring:**
- [ ] Check edge function invocation count
- [ ] Ensure auto-refresh is DISABLED on monitoring components
- [ ] Review quota burn patterns

**Weekly Audits:**
- [ ] Review edge function usage by function name
- [ ] Identify and optimize high-frequency functions
- [ ] Verify manual-only triggers are enforced

**Best Practices:**
- ❌ NEVER use auto-polling on monitoring functions
- ✅ Always use manual refresh for diagnostics
- ✅ Implement function-level rate limiting where appropriate
- ✅ Monitor invocations daily to prevent quota burn

**Monthly Review:**
- [ ] Comprehensive quota usage audit
- [ ] Review and optimize function efficiency
- [ ] Consider quota upgrade if justified by usage

---

## 9. Security & Compliance

### Weekly Security Checks
- [ ] Review security audit logs for suspicious activity
- [ ] Check for personal info incident reports
- [ ] Verify RLS policies are active on all tables

### Monthly Security Audits
- [ ] Run `security--run_security_scan` tool
- [ ] Review and update RLS policies if needed
- [ ] Audit user access patterns
- [ ] Check for failed authentication attempts

### Quarterly Security Reviews
- [ ] Full security audit (reference: CURRENT_SECURITY_STATE.md)
- [ ] Review COPPA compliance measures
- [ ] Update security documentation
- [ ] Test incident response procedures

**Security Functions to Monitor:**

```sql
-- Run manually monthly:
SELECT detect_suspicious_patterns();
SELECT detect_subscription_access_anomalies();

-- Verify RLS policies are active:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
```

---

## 10. Performance Optimization

### Weekly Performance Checks
- [ ] Review average response times for all systems
- [ ] Identify performance bottlenecks
- [ ] Check for memory pressure issues

**Target Metrics:**
- Story Generation: <2s average
- Image Generation: <2s average
- Payment Operations: <1.5s average
- Database Queries: <100ms average

### Monthly Cache Analysis
- [ ] Analyze cache hit rates
- [ ] Optimize slow database queries
- [ ] Review and update lazy loading strategies

**Cache Performance Targets:**
- Character Consistency Cache: >80% hit rate
- Session Cache: >90% hit rate
- Image Cache: >85% hit rate

### Quarterly Performance Audits
- [ ] Full performance audit across all systems
- [ ] Evaluate architectural improvements
- [ ] Update performance benchmarks

**Memory Management (Auto-Cleanup):**
- Nuclear template cleanup: Every 5 minutes
- Nuclear session cleanup: Every 5 minutes
- Idempotency memory cleanup: Every 1 minute

---

## 11. Testing & Validation

### Weekly Testing
- [ ] Run ImageTierTester for all 6 tiers
- [ ] Test guest vs premium user flows
- [ ] Verify emergency fallback systems

**Test Matrix:**

| Test | Expected Result | Status |
|------|-----------------|--------|
| Force Tier 1 | 200 status, imageURL, prompts | ✅ |
| Guest Story Gen | 10-12 pages batch | ✅ |
| Premium Story Gen | Page-by-page live | ✅ |
| Emergency Fallback | Rhyming template | ✅ |
| Payment Flow | Successful checkout | ✅ |

### Monthly Integration Testing
- [ ] Full integration testing across all systems
- [ ] Test all payment flows (checkout, portal, subscriptions)
- [ ] Verify subscription management works correctly

### Quarterly Load Testing
- [ ] Load testing for scalability
- [ ] Security penetration testing
- [ ] User acceptance testing for new features

---

## 12. Documentation Maintenance

### After Every Major Change
- [ ] Update relevant system documentation
- [ ] Update MAINTENANCE_CADENCE.md if procedures change
- [ ] Document changes in FIX_HISTORY_2025.md or appropriate log

### Monthly Documentation Review
- [ ] Review and update outdated documentation
- [ ] Ensure all new features are documented
- [ ] Update architecture diagrams if needed

### Quarterly Documentation Audit
- [ ] Full documentation audit for accuracy
- [ ] Archive outdated documents
- [ ] Update DOCS_MASTER_INDEX.md

**Key Documentation to Keep Current:**
- MASTER_SYSTEM_GUIDE.md
- OPERATIONS_GUIDE.md
- IMAGE_GENERATION_SYSTEM_SNAPSHOT.md (protected)
- FIX_HISTORY_2025.md
- This MAINTENANCE_CADENCE.md

---

## 13. As-Needed Maintenance

### Triggered by Events

**API Provider Changes:**
- [ ] Review API documentation for breaking changes
- [ ] Update client libraries if needed
- [ ] Test affected functionality
- [ ] Update edge function implementations

**Security Incidents:**
- [ ] Follow incident response procedures
- [ ] Document incident in security logs
- [ ] Apply patches/fixes immediately
- [ ] Review and update security measures

**Performance Degradation:**
- [ ] Identify bottleneck using monitoring tools
- [ ] Implement optimization or fallback
- [ ] Test improvements in staging
- [ ] Deploy and monitor results

**User-Reported Issues:**
- [ ] Investigate and reproduce issue
- [ ] Document in FIX_HISTORY_2025.md
- [ ] Implement fix with proper testing
- [ ] Monitor for recurrence

---

## 📚 Related Documentation

### Core System References
- [MASTER_SYSTEM_GUIDE.md](./MASTER_SYSTEM_GUIDE.md) - Complete system architecture
- [OPERATIONS_GUIDE.md](./OPERATIONS_GUIDE.md) - Operational procedures
- [IMAGE_GENERATION_SYSTEM_SNAPSHOT_2025_10_04.md](./IMAGE_GENERATION_SYSTEM_SNAPSHOT_2025_10_04.md) - Protected system snapshot
- [FIX_HISTORY_2025.md](./FIX_HISTORY_2025.md) - Complete fix history

### Image Generation References
- [IMAGE_TIER_TESTING.md](./IMAGE_TIER_TESTING.md) - Tier testing procedures
- [IMAGE_GENERATION_DEBUGGING_GUIDE.md](./IMAGE_GENERATION_DEBUGGING_GUIDE.md) - Debug procedures
- [FORCE_TIER_1_TEST_IMPLEMENTATION.md](./FORCE_TIER_1_TEST_IMPLEMENTATION.md) - Force Tier 1 details

### Story Generation References
- [STORY_GENERATION_FIX_STATUS.md](./STORY_GENERATION_FIX_STATUS.md) - Story system status
- [NETFLIX_VS_LIVE_GENERATION.md](./NETFLIX_VS_LIVE_GENERATION.md) - Generation mode comparison

### Audio System References
- [AUDIO_SYSTEM_ARCHITECTURE.md](./AUDIO_SYSTEM_ARCHITECTURE.md) - Audio architecture
- [CHARLOTTE_VOICE_SERVICE.md](./CHARLOTTE_VOICE_SERVICE.md) - Voice service details

### Security References
- [CURRENT_SECURITY_STATE.md](./CURRENT_SECURITY_STATE.md) - Security status
- [AUTHENTICATION_MODEL.md](./AUTHENTICATION_MODEL.md) - Auth architecture

---

## 🔄 Document Maintenance

**This Document Should Be Updated:**
- When new maintenance procedures are added
- When existing procedures change
- When retention policies are modified
- When new systems are deployed
- Quarterly during documentation audit

**Last Review:** October 13, 2025  
**Next Review Due:** January 13, 2026

---

**🎯 Quick Start After Hiatus:**
1. Read Section 0 (Hiatus Recovery Checklist)
2. Check Section 7 (Health Dashboard)
3. Run Section 3 cleanup functions
4. Review Section 13 (As-Needed) for any alerts
