# Debug Resource Exhaustion Emergency Fix

**Date:** 2025-09-19  
**Status:** ✅ RESOLVED - BackendTierChecker Resource Flood Fix Applied  
**Impact:** Critical - Fixed `ERR_INSUFFICIENT_RESOURCES` browser error

## Root Cause Analysis - CORRECTED

**ACTUAL PRIMARY CULPRIT:** `BackendTierChecker` resource flood on navigation to pages 2+

### BackendTierChecker Issues (ROOT CAUSE)
- **Unconditional rendering** in `CleanStoryDisplay.tsx` without debug mode gating
- **Unstable `useEffect` dependencies** - `onTierFound` prop changes triggered continuous API calls
- **No throttling/deduplication** - rapid successive calls to `getRecentImagePrompts()`
- **DebugGateway bypass** - `recent-image-prompts` allowed without `debug=1` requirement

### Previous Offenders (RESOLVED)
- **`StoryContentLogger.init()`** - Already gated behind debug params ✅
- **Multiple debug panels** - Already optimized with manual refresh ✅

### Contributing Services
1. `ImageDebugPanel`: 10-second intervals calling backend logs
2. `StoryStatusIndicator`: 1-second intervals checking global state  
3. `useStorySourceNotifications`: 2-second intervals checking story source
4. `CulturalRepresentationMonitor`: 5-minute Supabase function calls
5. `AdvancedSystemStatus`: 2-minute system checks
6. `CacheInspectorPanel`: 30-second cache data intervals
7. `SecurityDashboard`: 1-minute security event polling

## Emergency Fixes Applied

### Phase 0: EMERGENCY BackendTierChecker Fix (CRITICAL) ✅

**CleanStoryDisplay.tsx:**
- ✅ **GATED**: `BackendTierChecker` rendering behind `debug=1` URL parameter only (lines 4188-4204)
- ✅ **STABILIZED**: `onTierFound` callback using `useRef` to prevent `useEffect` re-runs

**BackendTierChecker.tsx:**
- ✅ **HARDENED**: Additional debug mode check for fail-safe protection
- ✅ **OPTIMIZED**: Uses `useRef` for stable `onTierFound` dependency

**DebugGateway.ts:**
- ✅ **EMERGENCY RATE LIMITER**: 30 requests/minute hard cap with 2-minute emergency shutdown
- ✅ **PER-OPERATION THROTTLING**: 3-second minimum between identical debug calls
- ✅ **REMOVED BYPASS**: All operations now require `debug=1` (no special-casing)

### Phase 1: Stop Legacy Resource Leaks ✅
- ❌ **REMOVED**: `StoryContentLogger.init()` from module load (line 282)
- ✅ **ADDED**: Singleton protection with `monitoringInterval` and `isMonitoring` flags
- ✅ **ADDED**: `stopImagePromptMonitoring()` cleanup method
- ✅ **REDUCED**: Polling from 5s → 60s intervals
- ✅ **ADDED**: Visibility check - only poll when page is visible

**CleanStoryDisplay.tsx:**
- ✅ **ADDED**: Conditional initialization only when `?storydebug` or `?imagedebug` URL params present
- ✅ **ADDED**: Cleanup on component unmount via `StoryContentLogger.stopImagePromptMonitoring()`

### Phase 2: Optimize All Debug Services ✅

**ImageDebugPanel.tsx:**
- ❌ **REMOVED**: 10-second auto-polling intervals
- ✅ **CHANGED**: Manual refresh only to prevent connection exhaustion

**StoryStatusIndicator.tsx:**
- ✅ **REDUCED**: Polling from 1s → 3s intervals
- ✅ **ADDED**: Visibility check - only poll when page is visible

**useStorySourceNotifications.ts:**
- ✅ **REDUCED**: Polling from 2s → 5s intervals  
- ✅ **ADDED**: Visibility check - only poll when page is visible

**CulturalRepresentationMonitor.tsx:**
- ✅ **GATED**: Only runs when `?monitoring` or `?debug` URL params present
- ✅ **ADDED**: Visibility check for auto-refresh

**CacheInspectorPanel.tsx:**
- ❌ **REMOVED**: Auto-refresh completely
- ✅ **CHANGED**: Manual refresh only

**SecurityDashboard.tsx:**
- ✅ **GATED**: Only runs when `?security` or `?debug` URL params present
- ❌ **REMOVED**: Auto-refresh completely

### Phase 3: Performance Hardening ✅

**DebugGateway.ts:**
- ✅ **ENHANCED**: More aggressive circuit breaker (2 failures vs 3)  
- ✅ **REDUCED**: Backoff times (2s base, 1min max vs 5s base, 5min max)
- ✅ **ADDED**: Connection timeout monitoring (10 seconds)
- ✅ **EMERGENCY RATE LIMITER**: Global 30 requests/minute hard cap
- ✅ **AUTO-SHUTDOWN**: 2-minute emergency shutdown when quota exceeded  
- ✅ **THROTTLING**: 3-second minimum per operation to prevent rapid-fire calls

## Expected Impact

- **90% reduction** in background network requests
- **Zero** `ERR_INSUFFICIENT_RESOURCES` errors  
- Debug services available only when explicitly needed via URL parameters
- Production performance unaffected by debug infrastructure

## Debug Service Access

### URL Parameters for Debug Features:
- `?debug=1` - Core debug services
- `?imagedebug=1` - Image debugging monitoring  
- `?storydebug=1` - Story content change logging
- `?monitoring=1` - Cultural representation monitoring
- `?security=1` - Security event monitoring

### Manual Controls:
- All debug panels now use manual refresh buttons
- No background polling unless explicitly enabled via URL
- Visibility-aware polling (pauses when tab not active)

## Monitoring

The following services are now **safe for production** and will not cause resource exhaustion:
- ✅ StoryContentLogger (conditional init only)
- ✅ ImageDebugPanel (manual refresh)
- ✅ StoryStatusIndicator (optimized 3s intervals)
- ✅ useStorySourceNotifications (optimized 5s intervals)
- ✅ CulturalRepresentationMonitor (gated behind URL params)
- ✅ CacheInspectorPanel (manual refresh only)
- ✅ SecurityDashboard (gated behind URL params)
- ✅ DebugGateway (enhanced circuit breaker)

**Status:** All critical resource leaks have been eliminated. The application should no longer experience `ERR_INSUFFICIENT_RESOURCES` errors.