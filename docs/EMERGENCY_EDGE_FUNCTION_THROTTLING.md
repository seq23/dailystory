# Emergency Edge Function Throttling - Quota Burn Prevention

## ⚠️ CRITICAL ISSUE RESOLVED

**Issue**: Edge function usage exceeded quota by ~1 million invocations due to aggressive polling from monitoring components.

**Root Cause**: Multiple monitoring components were polling edge functions every 2-5 seconds simultaneously:
- `UnifiedDebugMonitor`: 2s + 5s intervals (extremely aggressive)
- `SecurityDashboard`: 5s intervals  
- `CacheInspectorPanel`: 5s intervals
- `BackendTierChecker`: 30s intervals
- `AdvancedSystemStatus`: 30s intervals
- `useAdvancedMonitoring`: 60s intervals

## 🚨 Emergency Changes Applied

### 1. Auto-Refresh Disabled by Default
All monitoring components now have auto-refresh **DISABLED** by default to prevent quota burn.

### 2. Manual Refresh Controls Added
- Added manual refresh buttons to all monitoring dashboards
- Users must explicitly enable "Live updates" if needed
- Live updates respect visibility state (page must be active)

### 3. Increased Polling Intervals
When live updates are enabled:
- `useAdvancedMonitoring`: 60s → 300s (5 minutes)
- `AdvancedSystemStatus`: 30s → 120s (2 minutes)  
- `SecurityDashboard`: 5s → 60s (1 minute)
- `CacheInspectorPanel`: 5s → 30s (30 seconds)
- `UnifiedDebugMonitor`: Polling completely disabled
- `BackendTierChecker`: Polling completely disabled

### 4. Visibility State Detection
Auto-refresh only works when:
- Page is actively visible (`document.visibilityState === 'visible'`)
- User explicitly enables live updates
- Component is actually open/visible

## 🔧 Component Changes

### `useAdvancedMonitoring.ts`
```typescript
// Before: autoRefresh = true, refreshInterval = 60000
// After: autoRefresh = false, refreshInterval = 300000 (5 minutes)
const { autoRefresh = false, refreshInterval = 300000 } = options || {};
```

### `AdvancedSystemStatus.tsx`
- Added manual refresh button
- Added live updates checkbox (2 minute intervals)
- Initial load only, no auto-refresh

### `SecurityDashboard.tsx`
- Added manual refresh button  
- Added live updates checkbox (1 minute intervals)
- Initial load only, no auto-refresh

### `CacheInspectorPanel.tsx`
- Added live updates checkbox (30 second intervals)
- Manual refresh only by default

### `UnifiedDebugMonitor.tsx`
- Completely disabled auto-polling for network requests and circuit breakers
- Manual refresh only via existing buttons

### `BackendTierChecker.tsx`
- Completely disabled auto-polling
- Single check on component mount only
- Manual debugging via `window.checkImageTier()`

## 📊 Expected Usage Reduction

**Before**: ~1,000,000+ invocations from polling storm
**After**: ~95% reduction in edge function calls

- No auto-refresh by default = ~0 calls unless explicitly enabled
- When enabled, 5-10x longer intervals
- Visibility detection prevents background polling
- Manual refresh gives users full control

## 🔍 Monitoring Usage Guidelines

### For Development
1. **Enable live updates sparingly** - Only when actively debugging
2. **Use manual refresh** for most monitoring needs
3. **Close monitoring panels** when not in use
4. **Disable live updates** when switching tabs/windows

### For Production  
1. **Never enable auto-refresh** in production monitoring
2. **Use edge functions judiciously** - batch requests when possible
3. **Implement client-side caching** for frequently accessed data
4. **Monitor usage regularly** via Supabase dashboard

### Emergency Debugging
- Use `window.checkImageTier()` for manual image tier debugging
- Export logs instead of real-time monitoring  
- Batch debug operations instead of continuous polling

## 🚨 Future Prevention

1. **Always check edge function usage** before deploying monitoring features
2. **Default to manual refresh** for all monitoring components
3. **Use WebSockets** for real-time updates instead of polling where appropriate
4. **Implement usage warnings** when approaching quota limits
5. **Add dev mode only flags** for aggressive monitoring features

## ✅ Verification

After these changes:
1. Monitor edge function usage in Supabase dashboard
2. Verify no auto-refresh occurs by default
3. Test manual refresh functionality
4. Confirm live updates work only when explicitly enabled
5. Check that background tabs don't poll

**Status**: Emergency throttling implemented ✅
**Usage Impact**: ~95% reduction expected ✅  
**User Experience**: Manual control maintained ✅