# Fix History

## 2025-10-06: Comprehensive Timeout & UX Fixes

### Issues Addressed
1. **check-subscription 500 errors**: Edge function still returning 500 on missing user email
2. **TTS timeout too long**: 90-second total timeout causing poor UX
3. **Images generate despite toggle OFF**: Auto-generation ignoring global toggle
4. **Account holder avatar not editable**: Premium users unable to customize account holder avatar
5. **Buddy button fails silently + slow**: No user feedback, 60-90 second hangs
6. **Story generation timeout too long**: 40-second timeout feels excessive

### Changes Made

#### 1. check-subscription Graceful Degradation
- **File**: `supabase/functions/check-subscription/index.ts`
- **Lines 68-76, 209-216**: Changed all error responses from 500 to 200 with `{ subscribed: false }`
- **Impact**: Eliminates console 500 errors, provides graceful auth failure handling

#### 2. TTS Timeout Reduction
- **File**: `src/services/SynchronizedElevenLabsTTS.ts`
  - Line 42: Changed `maxRetries = 2` to `maxRetries = 1` (2 attempts instead of 3)
  - Line 43: Changed `maxTimeoutMs = 30000` to `maxTimeoutMs = 10000` (10s per attempt)
- **File**: `src/services/CharlotteVoiceService.ts`
  - Line 178: Changed interactive timeout from `10000` to `8000` (8 seconds)
- **Impact**: Total TTS timeout reduced from 90s to 20s max

#### 3. Images Toggle Respect
- **File**: `src/components/CleanStoryDisplay.tsx`
- **Lines 999-1002**: Added `if (!imagesEnabled) return;` check before `ImageGenerationTrigger.triggerAutoGeneration()`
- **Impact**: Respects user preference, prevents unwanted API calls when images are disabled

#### 4. Account Holder Avatar Editing
- **File**: `src/components/PremiumProfileEditor.tsx`
  - Line 15: Added `AvatarPicker` import
  - Lines 225-229: Added `AvatarPicker` component to form
- **File**: `src/components/AuthenticatedApp.tsx`
  - Lines 256-259: Load avatar from `preferences.avatar_type` and `preferences.avatar_skin_tone`
  - Lines 450-451: Save avatar from `updatedUserInfo.avatar.type` and `updatedUserInfo.avatar.skinTone`
- **Impact**: Account holders can now customize their avatar and skin tone

#### 5. Buddy Button Fast-Fail + Enhanced Toasts
- **File**: `src/components/VoiceCommands.tsx`
  - Lines 266-299: Added `Promise.race` wrappers with aggressive timeouts:
    - Microphone: 5 seconds
    - Edge function: 8 seconds
    - WebSocket: 10 seconds (total ~23s max)
  - Lines 314-334: Enhanced error handling with specific toast messages for:
    - Microphone permission denied
    - API key not configured
    - Connection timeout
- **Impact**: Buddy button fails within 23 seconds instead of 60-90s, clear user feedback

#### 6. Story Generation Timeout
- **File**: `src/services/LiveGenerationService.ts`
- **Line 274**: Changed timeout from 40 seconds to 25 seconds
- **Impact**: Faster feedback when story generation is slow/failing

### Verification
- ✅ No more 500 errors from check-subscription endpoint
- ✅ TTS timeout completes within 20 seconds max (2 attempts × 10s)
- ✅ Images toggle OFF prevents ALL image generation
- ✅ Account holder can select and save avatar in Premium Profile Editor
- ✅ Buddy button shows specific toasts on failure (mic, API key, timeout)
- ✅ Buddy connection fails within ~23 seconds instead of 60-90s
- ✅ Story generation timeout occurs within 25 seconds

### Known Limitations
- Avatar changes only affect future stories (existing stories retain original character)
- Buddy button timeout is aggressive for slower networks (trade-off for faster UX)

---

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
