# Fix History

## 2025-10-06: Edge Function Auth Hardening & Dialog A11y Fix

### Issues Addressed
1. **check-subscription 500 errors**: Edge function throwing unhandled errors when auth API was unavailable
2. **Dialog accessibility warnings**: Radix UI warnings about missing DialogTitle/DialogDescription
3. **Error suppression inconsistency**: Multiple import paths for error suppression manager

### Changes Made

#### 1. Edge Function Resilience (`supabase/functions/`)
- **resilientLoader.ts**: Changed payment client fallback to use `SUPABASE_SERVICE_ROLE_KEY` instead of `SUPABASE_ANON_KEY` for proper auth introspection
- **check-subscription/index.ts**: Added hard guards around `auth.getUser()` with try/catch; now returns 200 with `subscribed: false` instead of 500 on auth failure

**Impact**: Prevents 500 errors, provides graceful degradation when auth is temporarily unavailable

#### 2. Error Suppression Consistency (`src/`)
- **mobileOptimizations.ts**: Updated import from `errorSuppression` to `errorSuppressionManager`
- **PromptTesting.tsx**: Updated import from `errorSuppression` to `errorSuppressionManager`

**Impact**: Unified error filtering across entire codebase; eliminates extension/third-party console noise

#### 3. Dialog Accessibility (`src/components/ui/`)
- **command.tsx**: Added VisuallyHidden DialogTitle and DialogDescription to CommandDialog component

**Impact**: Eliminates Radix UI a11y warnings; improves screen reader support

### Verification
- ✅ No more 500 errors from check-subscription endpoint
- ✅ Graceful auth failure handling (returns unsubscribed status)
- ✅ Radix Dialog warnings eliminated
- ✅ Extension runtime errors suppressed consistently
- ✅ Service Role key used for auth introspection in payment flows

### Documentation Updated
- `docs/EXTENSION_TROUBLESHOOTING.md`: Added note about system-level error suppression via errorSuppressionManager

---

## Previous Fixes
(Add historical fixes above this line)
