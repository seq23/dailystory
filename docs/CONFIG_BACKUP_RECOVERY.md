# Supabase Config Backup & Recovery Guide

## Overview

This document outlines the backup and recovery procedures for `supabase/config.toml`, which contains critical edge function configurations for 40+ functions.

## Why This Matters

**Critical Issue:** Disconnecting and reconnecting your Supabase project can truncate `supabase/config.toml` to only contain the `project_id` line, losing:
- All 40+ edge function configurations
- JWT authentication settings (`verify_jwt` flags)
- Function deployment instructions

**Security Impact:**
- Functions requiring authentication become public
- Sensitive endpoints like `security-dashboard`, `create-checkout`, `customer-portal` become exposed
- Deployment failures for all edge functions

## Backup Strategy

### 1. Manual Backup (Run Before Risky Operations)

```bash
# Run backup script before disconnecting/reconnecting Supabase
node scripts/backup-config.js
```

**When to run:**
- Before disconnecting Supabase project
- Before major configuration changes
- Weekly as part of maintenance routine
- After adding new edge functions

### 2. Automated Backup (Recommended)

Add to your Git workflow:

```bash
# Add pre-commit hook
echo "node scripts/backup-config.js" >> .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### 3. Git-Based Protection

```bash
# Always commit config.toml changes
git add supabase/config.toml
git commit -m "chore: update supabase config"
git push
```

## Recovery Procedures

### Quick Recovery (From Template)

If `config.toml` is truncated:

```bash
# Copy from master template
cp supabase-config-template.toml supabase/config.toml
```

### Recovery from Backup

```bash
# List available backups
ls -la backups/config/

# Restore from latest backup
cp backups/config/config-latest.toml supabase/config.toml

# Or restore from specific timestamp
cp backups/config/config-backup-YYYY-MM-DDTHH-MM-SS.toml supabase/config.toml
```

### Recovery from Git

```bash
# View config history
git log -- supabase/config.toml

# Restore from specific commit
git checkout <commit-hash> -- supabase/config.toml
```

## Complete Function List (40 Functions)

### JWT Required (verify_jwt = true) - 14 Functions

**Authentication & Subscription:**
- activate-discount-code
- apply-discount-code
- check-subscription
- create-checkout
- create-premium-subscription
- customer-portal
- send-custom-auth-email

**Security & Monitoring:**
- log-personal-info-incident
- log-security-event
- notification-service
- security-alert
- security-dashboard
- send-coppa-notification
- send-parental-notification

### JWT Not Required (verify_jwt = false) - 26 Functions

**AI & Content Generation:**
- ai-visual-scene-creator
- background-image-pregeneration
- clear-character-cache
- correct-spelling
- generate-adaptive-story
- generate-fallback-images
- process-story-content
- template-service
- translate-universal
- validate-discount-code

**Audio & Voice:**
- elevenlabs-agent-signed-url
- elevenlabs-dictionary-manager
- elevenlabs-tts-smart
- elevenlabs-tts
- openai-realtime
- openai-tts
- voice-to-text
- word-dictionary

**Image Generation:**
- image-proxy
- runware-generate-image
- runware-template-ab
- runware-template-cd

**System & Debug:**
- get-cost-analytics
- get-monitoring-data
- model-performance-monitor
- system-diagnostics
- unified-debug-service

## Verification After Recovery

1. **Check function count:**
   ```bash
   grep -c "\[functions\." supabase/config.toml
   # Should return: 40
   ```

2. **Check JWT settings:**
   ```bash
   grep "verify_jwt = true" supabase/config.toml | wc -l
   # Should return: 14
   
   grep "verify_jwt = false" supabase/config.toml | wc -l
   # Should return: 26
   ```

3. **Validate config structure:**
   ```bash
   # Should see project_id on line 1
   head -n 1 supabase/config.toml
   
   # Should have multiple function blocks
   tail -n 20 supabase/config.toml
   ```

4. **Test deployment:**
   - Push changes to trigger deployment
   - Check Supabase dashboard for function deployment status
   - Verify critical functions are protected with JWT

## Prevention Best Practices

### Before Disconnecting Supabase

1. ✅ Run `node scripts/backup-config.js`
2. ✅ Commit current config to Git
3. ✅ Document current function count (40)
4. ✅ Keep backup of `config-latest.toml` in safe location

### After Reconnecting Supabase

1. ✅ Immediately check `supabase/config.toml`
2. ✅ Verify function count: `grep -c "\[functions\." supabase/config.toml`
3. ✅ If truncated (< 10 functions), restore immediately
4. ✅ Test critical authenticated endpoints
5. ✅ Verify JWT protection is in place

### Regular Maintenance

- **Daily:** Git commits of config changes
- **Weekly:** Run manual backup script
- **Monthly:** Verify all 40 functions are still configured
- **After any major operation:** Backup immediately

## Emergency Response Plan

### If You Discover Truncated Config

**Immediate Actions (Within 5 minutes):**

1. **STOP ALL DEPLOYMENTS** - Prevent deploying bad config
2. **Restore from backup:**
   ```bash
   cp supabase-config-template.toml supabase/config.toml
   ```
3. **Verify restoration:**
   ```bash
   grep -c "\[functions\." supabase/config.toml
   # Must show: 40
   ```
4. **Commit immediately:**
   ```bash
   git add supabase/config.toml
   git commit -m "emergency: restore truncated config.toml"
   git push
   ```

**Security Audit (Within 30 minutes):**

1. Check if any sensitive functions were exposed
2. Review access logs for unauthorized access
3. Rotate secrets if exposure is suspected
4. Document incident and time exposure window

**Post-Incident (Within 24 hours):**

1. Update incident response documentation
2. Add additional backup mechanisms
3. Create monitoring alerts for config changes
4. Train team on prevention procedures

## File Locations

- **Active Config:** `supabase/config.toml`
- **Master Template:** `supabase-config-template.toml`
- **Backup Script:** `scripts/backup-config.js`
- **Backup Storage:** `backups/config/`
- **Latest Backup:** `backups/config/config-latest.toml`
- **Timestamped Backups:** `backups/config/config-backup-*.toml`

## Support & Escalation

If recovery fails:
1. Check Git history for last known good config
2. Review Supabase dashboard function list
3. Use `supabase-config-template.toml` as canonical source
4. Contact team lead for manual function verification

## Version History

- **2025-09-30:** Initial backup & recovery system implementation
- **Incident:** Config truncation discovered after Supabase reconnection
- **Resolution:** Complete backup strategy with 40 function restoration

---

**Remember:** Always backup before disconnecting Supabase! This config is critical infrastructure.
