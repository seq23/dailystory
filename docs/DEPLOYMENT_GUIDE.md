# Deployment Guide
**Last Updated:** 2025-09-29  
**Version:** 1.0  
**Status:** ✅ Production Ready

---

## 📋 Table of Contents

- [Overview](#overview)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Deployment Process](#deployment-process)
  - [Database Migrations](#database-migrations)
  - [Edge Function Deployment](#edge-function-deployment)
  - [Frontend Deployment](#frontend-deployment)
- [Post-Deployment Verification](#post-deployment-verification)
- [Rollback Procedures](#rollback-procedures)
- [Production Monitoring](#production-monitoring)
- [Emergency Procedures](#emergency-procedures)
- [📚 Related Documentation](#related-documentation)

---

## Overview

### Deployment Strategy
Time2Read uses a **continuous deployment** strategy with automated checks and manual verification gates.

### Deployment Environments
- **Development:** Local development with Supabase CLI
- **Staging:** Preview deployments for testing (not currently configured)
- **Production:** Live user-facing environment

### Key Principles
- ✅ Zero-downtime deployments
- ✅ Automated database migrations
- ✅ Edge function versioning
- ✅ Rollback capability at every step
- ✅ Comprehensive monitoring

[↑ Back to Top](#deployment-guide) | [📋 TOC](#table-of-contents)

---

## Pre-Deployment Checklist

### Code Review Requirements
- [ ] All code reviewed and approved by at least one team member
- [ ] PR passes all automated checks (linting, type checking, tests)
- [ ] No merge conflicts with main branch
- [ ] All TODO/FIXME comments addressed or documented

### Testing Requirements
- [ ] **Unit Tests:** All passing (`bun test`)
- [ ] **Integration Tests:** All passing
- [ ] **Manual Testing:** Core user flows tested locally
- [ ] **Edge Functions:** Tested with `supabase functions serve`
- [ ] **Database Migrations:** Tested locally with test data

### Documentation Requirements
- [ ] CHANGELOG.md updated with changes
- [ ] API_REFERENCE.md updated if endpoints changed
- [ ] README.md updated if setup process changed
- [ ] MASTER_ERRORS_TO_FIX.md updated if bugs fixed

### Security Requirements
- [ ] No hardcoded secrets or API keys
- [ ] Environment variables properly configured
- [ ] Database RLS policies reviewed
- [ ] Security scan completed (`supabase db lint`)
- [ ] No critical or high-severity findings

### Performance Requirements
- [ ] Bundle size checked and optimized
- [ ] No memory leaks detected
- [ ] Edge function cold start times acceptable (<100ms)
- [ ] Database query performance acceptable

### Communication Requirements
- [ ] Team notified of deployment timing
- [ ] Deployment window scheduled (low-traffic period preferred)
- [ ] Support team briefed on changes
- [ ] Rollback plan communicated

[↑ Back to Top](#deployment-guide) | [📋 TOC](#table-of-contents)

---

## Deployment Process

### Deployment Order
**CRITICAL:** Always follow this order to prevent dependency issues

1. **Database Migrations** (if any)
2. **Edge Functions Deployment**
3. **Frontend Deployment**
4. **Post-Deployment Verification**

### Database Migrations

#### Step 1: Create Migration
```bash
# Create new migration file
supabase migration new <descriptive-name>

# Example: Add new column to profiles table
supabase migration new add_preferences_to_profiles
```

#### Step 2: Write Migration SQL
```sql
-- File: supabase/migrations/<timestamp>_add_preferences_to_profiles.sql

-- Add column
ALTER TABLE public.profiles 
ADD COLUMN preferences JSONB DEFAULT '{}';

-- Add index for performance
CREATE INDEX idx_profiles_preferences ON public.profiles USING GIN(preferences);

-- Update RLS policies if needed
CREATE POLICY "Users can update their own preferences"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

#### Step 3: Test Migration Locally
```bash
# Reset local database (CAUTION: Destroys local data)
supabase db reset

# Or apply migrations incrementally
supabase db push

# Verify migration applied
supabase db diff
```

#### Step 4: Deploy to Production
```bash
# Push migrations to production
supabase db push --linked

# Verify in Supabase dashboard:
# Project → Database → Migrations
```

#### Step 5: Update TypeScript Types
```bash
# Regenerate TypeScript types after migration
supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

**Migration Rollback:**
```bash
# If migration fails, manually revert in SQL Editor:
# ALTER TABLE public.profiles DROP COLUMN preferences;
# DROP INDEX idx_profiles_preferences;
# DELETE FROM supabase_migrations.schema_migrations 
# WHERE version = '<timestamp>';
```

---

### Edge Function Deployment

#### Step 1: Verify Functions Locally
```bash
# Serve all functions
supabase functions serve

# Serve specific function
supabase functions serve generate-adaptive-story

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/generate-adaptive-story' \
  --header 'Authorization: Bearer <anon-key>' \
  --header 'Content-Type: application/json' \
  --data '{"userInfo": {...}}'
```

#### Step 2: Deploy All Functions
```bash
# Deploy all functions
supabase functions deploy

# Deploy will automatically:
# - Bundle TypeScript/JavaScript
# - Upload to Supabase
# - Activate new versions
```

#### Step 3: Deploy Specific Functions
```bash
# Deploy single function
supabase functions deploy generate-adaptive-story

# Deploy multiple specific functions
supabase functions deploy generate-adaptive-story runware-generate-image template-service
```

#### Step 4: Priority Deployment
```bash
# For critical functions, use priority deployment workflow
# GitHub Actions → Deploy Edge Functions → Run workflow
# Set "priority_functions": generate-adaptive-story,runware-generate-image

# Priority functions get:
# - 5 retry attempts
# - Exponential backoff (30s, 60s, 120s, 240s)
# - Stronger error recovery
```

#### Step 5: Verify Deployment
```bash
# Check function logs
supabase functions logs generate-adaptive-story

# Test deployed function
curl -i --location --request POST 'https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/generate-adaptive-story' \
  --header 'Authorization: Bearer <anon-key>' \
  --header 'apikey: <anon-key>' \
  --header 'Content-Type: application/json' \
  --data '{"userInfo": {...}}'
```

#### Function Deployment Troubleshooting

**Issue: "Module not found: index.js"**
```bash
# This is often a false positive during deployment sync
# Verify files exist in GitHub
ls -la supabase/functions/<function-name>/

# Force fresh deployment
# Update DEPLOY_MARKER comment in index.ts or index.js:
# DEPLOY_MARKER: 2025-09-29T14:30:00Z

# Redeploy
supabase functions deploy <function-name>
```

**Issue: Function boot failures**
```bash
# Check analytics for actual boot failures vs sync issues
# Supabase Dashboard → Functions → <function> → Analytics

# If real boot failure:
# 1. Check function logs for errors
# 2. Verify environment variables set
# 3. Test locally first
# 4. Deploy with increased timeout
```

---

### Frontend Deployment

#### Step 1: Build Production Bundle
```bash
# Install dependencies (if needed)
bun install

# Run tests
bun test

# Build production bundle
bun run build

# Output: dist/ directory
```

#### Step 2: Verify Build
```bash
# Check bundle size
du -sh dist/

# Recommended: < 2MB for main bundle
# If larger, investigate with:
bun run build --report
```

#### Step 3: Deploy to Hosting
```bash
# Deployment depends on hosting provider
# Example for Vercel/Netlify:
# Git push to main branch triggers automatic deployment

git add .
git commit -m "feat: your feature description"
git push origin main

# Monitor deployment in hosting dashboard
```

#### Step 4: Environment Variables
```bash
# Ensure production environment variables are set:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY

# Verify in hosting dashboard:
# Settings → Environment Variables
```

#### Step 5: Cache Invalidation
```bash
# After deployment, invalidate CDN cache if applicable
# This ensures users get latest version

# Cloudflare example:
# Dashboard → Caching → Purge Everything

# Or use API:
curl -X POST "https://api.cloudflare.com/client/v4/zones/<zone-id>/purge_cache" \
  -H "Authorization: Bearer <api-token>" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

[↑ Back to Top](#deployment-guide) | [📋 TOC](#table-of-contents)

---

## Post-Deployment Verification

### Immediate Checks (Within 5 minutes)

#### 1. Health Checks
```bash
# Story generation system
curl 'https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/generate-adaptive-story' \
  -H 'apikey: <anon-key>'

# Image generation system
curl 'https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/runware-generate-image' \
  -H 'apikey: <anon-key>'

# Expected: 200 OK with system status
```

#### 2. Critical User Flows
Test these flows manually:
- [ ] User registration/login
- [ ] Story generation (guest user)
- [ ] Image generation (guest user)
- [ ] Story generation (premium user)
- [ ] Image generation (premium user)
- [ ] Payment checkout flow
- [ ] Audio playback

#### 3. Error Monitoring
```bash
# Check for error spikes in Supabase dashboard
# Project → Logs → Edge Functions

# Look for:
# - Increased error rate
# - New error types
# - Performance degradation
```

#### 4. Performance Metrics
Check in Supabase Dashboard:
- [ ] Story generation: < 2s average response time
- [ ] Image generation: < 3s average response time
- [ ] Database queries: < 100ms average
- [ ] Edge function cold starts: < 100ms

### Extended Monitoring (First 24 hours)

#### Monitor These Metrics
- User session success rate (target: > 99%)
- Story generation success rate (target: > 99.8%)
- Image generation success rate (target: > 99.2%)
- Payment processing success rate (target: 100%)
- Error rate by function (target: < 1%)

#### Key Dashboards
1. **Supabase Dashboard:** Functions, Database, Auth
2. **Error Tracking:** Check logs for patterns
3. **User Analytics:** Monitor active sessions
4. **Performance:** Response times, tier usage

[↑ Back to Top](#deployment-guide) | [📋 TOC](#table-of-contents)

---

## Rollback Procedures

### When to Rollback
Initiate rollback if:
- ✅ Critical errors affecting > 5% of users
- ✅ Payment system failures
- ✅ Data corruption detected
- ✅ Security vulnerability introduced
- ✅ Performance degradation > 50%

### Database Rollback

**CRITICAL:** Database rollbacks are DESTRUCTIVE. Backup first!

```bash
# Step 1: Backup current state
# Supabase Dashboard → Database → Backups → Create Backup

# Step 2: Identify migration to rollback
supabase db diff

# Step 3: Write down migration (manual)
# Create file: supabase/migrations/<timestamp>_rollback_<feature>.sql

-- Example rollback migration
ALTER TABLE public.profiles DROP COLUMN preferences;
DROP INDEX idx_profiles_preferences;

# Step 4: Apply rollback
supabase db push --linked

# Step 5: Verify rollback
# Check database schema in dashboard
```

### Edge Function Rollback

```bash
# Option 1: Redeploy previous version from Git
git checkout <previous-commit-hash>
supabase functions deploy <function-name>
git checkout main  # Return to current state

# Option 2: Manual version revert in Supabase
# Not currently supported - use Option 1

# Step 3: Verify rollback
supabase functions logs <function-name> --tail

# Test rolled back function
curl <endpoint-url>
```

### Frontend Rollback

```bash
# Option 1: Revert Git commit
git revert <commit-hash>
git push origin main

# Option 2: Deploy specific previous commit
git checkout <previous-commit-hash>
# Trigger deployment (depends on hosting)
git checkout main

# Option 3: Hosting dashboard
# Vercel/Netlify: Deployments → Previous Deployment → Promote

# Verify rollback
curl https://yourapp.com
# Check version number or test critical flows
```

### Communication During Rollback

**Notify immediately:**
1. Team via communication channel
2. Support team to handle user inquiries
3. Status page update (if applicable)
4. Post-mortem scheduled for after resolution

**Template Message:**
```
🚨 ROLLBACK IN PROGRESS

Issue: [Brief description]
Affected: [User impact]
Action: Rolling back to [version/timestamp]
ETA: [Expected completion time]
Status: [Link to status page]

Updates will be provided every 15 minutes.
```

[↑ Back to Top](#deployment-guide) | [📋 TOC](#table-of-contents)

---

## Production Monitoring

### Real-Time Monitoring

#### Supabase Dashboard
**URL:** https://supabase.com/dashboard/project/cpzeuogomaixamrtnnmj

Monitor these sections:
1. **Functions → Analytics**
   - Invocation counts
   - Error rates
   - Response times
   - Boot failures

2. **Database → Performance**
   - Query performance
   - Connection pool usage
   - Slow queries

3. **Auth → Users**
   - Active sessions
   - Failed login attempts
   - New registrations

4. **Logs → Edge Functions**
   - Real-time error logs
   - Warning messages
   - Performance metrics

### Key Metrics to Watch

#### Story Generation
```
Target: 99.8% success rate
Alert if: < 95% success rate for > 5 minutes

Tier Distribution (healthy):
- Tier 1: 85%
- Tier 2: 10%
- Tier 3: 4%
- Tier 4: 1%
```

#### Image Generation
```
Target: 99.2% success rate
Alert if: < 95% success rate for > 5 minutes

Tier Distribution (healthy):
- Tier 1: 85%
- Tier 2.5A: 8%
- Tier 2.5B: 5%
- Tier 2.5C-D: 2%
```

#### Payment Systems
```
Target: 100% success rate
Alert if: ANY payment failures

Monitor:
- Checkout session creation
- Subscription updates
- Portal access
- Discount code validation
```

### Alert Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Error Rate | > 5% | > 10% | Investigate immediately |
| Response Time | > 5s | > 10s | Check system load |
| Story Generation | < 95% | < 90% | Check tier cascade |
| Image Generation | < 95% | < 90% | Check Runware API |
| Payment Failures | Any | Any | Immediate investigation |
| Database Queries | > 200ms | > 500ms | Optimize queries |
| Edge Function Usage | > 2.5M/day | > 2.8M/day | Throttle if needed |

### Log Analysis

**Daily Log Review:**
```bash
# Check for patterns in last 24 hours
supabase functions logs generate-adaptive-story --since 24h | grep ERROR

# Common patterns to watch:
# - Repeated failures from same tier
# - Unusual error codes
# - Performance degradation trends
# - Rate limit warnings
```

**Weekly Summary:**
- Total requests processed
- Success rate by function
- Average response times
- Tier usage distribution
- Error categories and counts
- User session statistics

[↑ Back to Top](#deployment-guide) | [📋 TOC](#table-of-contents)

---

## Emergency Procedures

### Critical System Outage

**Immediate Actions (First 5 minutes):**
1. Confirm outage scope (all users or subset?)
2. Check Supabase status: https://status.supabase.com
3. Review recent deployments (last 24 hours)
4. Check edge function logs for errors
5. Notify team via emergency channel

**Investigation (Next 15 minutes):**
1. Identify failing component (story, image, payment, etc.)
2. Check tier cascade functioning correctly
3. Verify emergency fallbacks working
4. Review database connection health
5. Check API key validity (OpenAI, Runware, etc.)

**Resolution (Next 30 minutes):**
1. If recent deployment: Initiate rollback
2. If API failure: Switch to fallback tier
3. If database issue: Check connection pool, restart if needed
4. If network issue: Monitor CDN status
5. Document incident for post-mortem

### Edge Function Quota Exceeded

**Current Status:** Emergency throttling active (2.98M invocations)

**Immediate Actions:**
```bash
# 1. Disable all auto-refresh monitoring
# Already done - verify in code:
# - useAdvancedMonitoring: Manual only
# - AdvancedSystemStatus: Manual only
# - SecurityDashboard: Manual only

# 2. Increase polling intervals
# Already done - verify 5+ minute intervals

# 3. Monitor usage in real-time
# Supabase Dashboard → Settings → Usage

# 4. If still exceeding:
# - Disable non-critical monitoring functions
# - Implement stricter rate limiting
# - Consider quota upgrade
```

### Payment System Failure

**CRITICAL:** Payment failures require immediate action

**Step 1: Verify Stripe Status**
```bash
# Check Stripe dashboard: https://dashboard.stripe.com
# Look for:
# - API key validity
# - Webhook delivery failures
# - Service disruptions
```

**Step 2: Test Payment Flow**
```bash
# Use Stripe test mode to verify
curl -X POST 'https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/create-checkout' \
  -H 'Authorization: Bearer <test-jwt>' \
  -H 'apikey: <anon-key>' \
  --data '{"priceId": "price_test_..."}'
```

**Step 3: Emergency Communication**
```
Subject: Payment System Issue

We're experiencing temporary payment processing issues.
Your data is safe and sessions are preserved.
We're working to resolve this immediately.

ETA: [time]
Status: [link]
```

### Database Emergency

**Issue: Connection pool exhausted**
```sql
-- Check current connections
SELECT count(*) FROM pg_stat_activity;

-- Kill idle connections (if needed)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
AND state_change < now() - interval '30 minutes';
```

**Issue: Slow queries**
```sql
-- Find slow queries
SELECT query, state, wait_event, query_start
FROM pg_stat_activity
WHERE state = 'active'
AND now() - query_start > interval '5 seconds'
ORDER BY query_start;

-- Add missing indexes if identified
```

[↑ Back to Top](#deployment-guide) | [📋 TOC](#table-of-contents)

---

## Related Documentation

### Core Documentation
- 📘 [Master System Guide](./MASTER_SYSTEM_GUIDE.md) - Complete architecture
- 📊 [Operations Guide](./OPERATIONS_GUIDE.md) - Implementation roadmap
- 💻 [Development Guide](./DEVELOPMENT_GUIDE.md) - Technical standards
- 🏠 [Documentation Hub](./README.md) - Central navigation

### Deployment-Specific
- 📡 [API Reference](./API_REFERENCE.md) - Edge function endpoints
- 🚨 [Master Errors Document](./MASTER_ERRORS_TO_FIX.md) - Troubleshooting
- 🔧 [Edge Functions README](../supabase/functions/README.md) - Deployment manifest

---

**Document Status:** ✅ Complete and Current  
**Next Review:** 2025-10-06  
**Maintained By:** Engineering & Operations Teams  
**Version:** 1.0

[↑ Back to Top](#deployment-guide) | [📋 TOC](#table-of-contents)
