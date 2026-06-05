# Authentication & Premium Access Model
**Last Updated:** 2025-10-08  
**Version:** 2.0  
**Status:** ✅ Production Ready

---

## 📋 Table of Contents

- [1. Core Authentication Model](#1-core-authentication-model)
- [2. Dual-Gating System](#2-dual-gating-system)
- [3. User Tiers Explained](#3-user-tiers-explained)
- [4. Implementation Details](#4-implementation-details)
- [5. Payment System Role](#5-payment-system-role)
- [6. Migration from Old Model](#6-migration-from-old-model)
- [📚 Related Documentation](#related-documentation)

---

## 1. Core Authentication Model

### 🎯 Fundamental Principle

**ALL authenticated users have `isPremium=true` status. Feature access is controlled by subscription billing status.**

```
┌─────────────────────────────────────────────────────────┐
│                    User Authentication                  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌────────────┴────────────┐
              │                         │
        ┌─────▼─────┐           ┌──────▼──────┐
        │ SIGNED IN │           │ SIGNED OUT  │
        │           │           │   (Guest)   │
        └───────────┘           └─────────────┘
              │                         │
              ▼                         ▼
    ┌─────────────────┐       ┌──────────────────┐
    │ isPremium=true  │       │ isPremium=false  │
    │ (Layer 1)       │       │ 20-min, 6-page   │
    └─────────────────┘       │ Limited features │
              │               └──────────────────┘
              ▼
    ┌───────────────────┐
    │ Subscription DB   │
    │ (Layer 2)         │
    └───────────────────┘
              │
              ▼
    ┌─────────┴─────────┐
    │                   │
┌───▼────────┐  ┌───────▼────────┐
│  ACTIVE    │  │   INACTIVE     │
│Full Access │  │ Hard Paywall   │
└────────────┘  └────────────────┘
```

### ✅ What This Means

1. **Two-Layer Access Control**
   - **Layer 1 (`isPremium`):** Always `true` for authenticated users (general app context)
   - **Layer 2 (`isSubscriptionActive`):** Billing status from database (feature gating)
   - Window flag: `window.__IS_PREMIUM = !!user` (Layer 1 only)

2. **Hard Paywall Enforcement**
   - Users with inactive subscriptions are blocked from premium features
   - Non-blocking banner displays subscription status
   - Only "My Account" section remains accessible for payment

3. **Never Downgrade Rule**
   - `isPremium` status NEVER changes to `false` for authenticated users
   - Billing enforcement happens through separate `isSubscriptionActive` flag
   - Clear separation between app context and billing logic

---

## 2. Dual-Gating System

### 🏗️ Architecture Overview

The system uses **two separate flags** for access control:

| Layer | Flag | Source | Purpose | Changes For Auth Users? |
|-------|------|--------|---------|------------------------|
| **Layer 1** | `isPremium` | `!!user` | General app context, dev workflow | ❌ Never (always `true`) |
| **Layer 2** | `isSubscriptionActive` | `public.subscribers` table | Feature access gating | ✅ Yes (based on billing) |

### 🔑 Why Two Layers?

1. **Layer 1 (`isPremium`):**
   - Maintains "never downgrade authenticated users" rule
   - Used for general app context and settings
   - Simplifies dev workflow and debugging
   - Prevents breaking existing systems

2. **Layer 2 (`isSubscriptionActive`):**
   - Authoritative billing status from database
   - Controls actual feature access
   - Enables hard paywall enforcement
   - Separate from authentication state

### 📊 Access Control Flow

```typescript
// Layer 1: General premium status (always true for authenticated)
const isPremium = !!user; // Never changes

// Layer 2: Authoritative billing status (from database)
const { isPremium: isSubscriptionActive } = useCachedSubscriptionStatus(user.id);

// Feature gating uses Layer 2
if (!isSubscriptionActive) {
  return <SubscriptionRequiredCard />;
}
```

### 🎯 Use Cases by Layer

**Use Layer 1 (`isPremium`) for:**
- General UI context (guest vs authenticated flow)
- Development flags and debugging
- Analytics and logging
- Non-billing UI decisions

**Use Layer 2 (`isSubscriptionActive`) for:**
- Feature access gating (New Story button, Library, Reading)
- Navigation guards (blocking premium sections)
- Auto-resume prevention
- Any billing-related restrictions

---

## 3. User Tiers Explained

### 🆓 Guest Users (Unauthenticated)

**Access Level:** Free Trial Experience  
**Authentication Status:** `user === null`  
**Premium Status:** `isPremium === false`

#### Features
- ✅ 20-minute session timer (pausable, countdown)
- ✅ Netflix-style batch generation (10-12 pages generated at once)
- ✅ 6-page viewing limit per story (artificial business cutoff)
- ✅ "Next Story" button to start fresh story
- ✅ Fresh image per page with caching
- ✅ Never-ending stories (cut off at page 6)
- ❌ No story endings (by design)
- ❌ No story library
- ❌ No "Finish Story" option
- ❌ No story re-writing

#### Business Purpose
- Showcase platform capabilities
- Drive conversions to authenticated accounts
- Provide value while limiting full access

#### Technical Implementation
```typescript
// src/components/AuthWrapper.tsx
if (!user) {
  return <GuestExperience />;
}
```

---

### 💎 Premium Users (Authenticated - Active Subscription)

**Access Level:** Full Platform Access  
**Authentication Status:** `user !== null`  
**Premium Status:** `isPremium === true` (always)  
**Subscription Status:** `isSubscriptionActive === true`

#### Features
- ✅ Unlimited session time (dismissible timer)
- ✅ Live page-by-page generation (real-time)
- ✅ Unlimited story length (no artificial limits)
- ✅ "Finish Story" button for user-controlled endings
- ✅ Part II/III/IV continuation indefinitely
- ✅ Story library with full image caching
- ✅ Magic wand story re-writing
- ✅ All future premium features automatically
- ✅ Full navigation access (all sections)
- ✅ Auto-resume enabled

#### Business Purpose
- Provide full value proposition
- Encourage account creation
- Build user engagement and loyalty

---

### 🔒 Authenticated Users (Inactive Subscription)

**Access Level:** Hard Paywall  
**Authentication Status:** `user !== null`  
**Premium Status:** `isPremium === true` (never changes)  
**Subscription Status:** `isSubscriptionActive === false`

#### Blocked Features
- ❌ "New Story" button (disabled)
- ❌ Story library access (shows lock card)
- ❌ Reading view (shows lock card)
- ❌ Premium sections navigation (redirects to Stories)
- ❌ Progress tracking
- ❌ Parent dashboard
- ❌ Profile settings
- ❌ Auto-resume (disabled)

#### Available Features
- ✅ My Account section (for billing management)
- ✅ Non-blocking subscription banner (persistent red alert)
- ✅ "Manage Billing" button

#### Business Purpose
- Enforce subscription payment
- Provide clear path to billing management
- Prevent feature access without breaking app

#### Technical Implementation
```typescript
// src/components/AuthWrapper.tsx
if (user) {
  return <AuthenticatedApp user={user} />;
}

// src/components/AuthenticatedApp.tsx
const isPremium = !!user; // Layer 1: ALWAYS true

// Layer 2: Authoritative billing status
const { isPremium: isSubscriptionActive } = useCachedSubscriptionStatus(user.id);

// Navigation guard
const handleViewChange = (view: string) => {
  const premiumViews = ['stories', 'library', 'reading', 'premium', 'progress', 'parent', 'profile'];
  
  if (!isSubscriptionActive && premiumViews.includes(view)) {
    setCurrentView('stories'); // Block navigation
    return;
  }
  
  setCurrentView(view as AppView); // Allow account view
};

// Pass both flags to children
<PremiumMyStoriesView
  isPremium={isPremium}                    // Layer 1
  isSubscriptionActive={isSubscriptionActive} // Layer 2
  onSessionEnded={handleSessionEnded}
/>
```

---

## 4. Implementation Details

### 🔧 Component Architecture

#### AuthWrapper.tsx (Entry Point)
```typescript
export const AuthWrapper = () => {
  const [user, setUser] = useState<User | null>(null);
  
  // Expose premium status globally
  useEffect(() => {
    window.__IS_PREMIUM = !!user;
  }, [user]);
  
  // Authentication listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        
        // Clear caches on logout
        if (!session?.user) {
          localStorage.removeItem('story-session-data');
          sessionStorage.clear();
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  // Render based on authentication
  if (!user) return <GuestExperience />;
  return <AuthenticatedApp user={user} />;
};
```

#### AuthenticatedApp.tsx (Premium Interface)
```typescript
export const AuthenticatedApp = ({ user }: { user: User }) => {
  // CRITICAL: Initialize as premium, never downgrade
  const [isPremium, setIsPremium] = useState(true);
  
  useEffect(() => {
    // Optional: Check subscription for business analytics
    // But NEVER affect isPremium state for authenticated users
    checkSubscription(); 
  }, [user]);
  
  const checkSubscription = async () => {
    // Subscription checking for business purposes only
    // Payment processing, analytics, reporting
    // DOES NOT affect feature access
  };
  
  return (
    <div>
      {/* All premium features available */}
      <CleanStoryDisplay isPremium={isPremium} />
    </div>
  );
};
```

#### CleanStoryDisplay.tsx (Story Interface)
```typescript
interface CleanStoryDisplayProps {
  isPremium: boolean; // Always true for AuthenticatedApp
}

export const CleanStoryDisplay = ({ isPremium }: CleanStoryDisplayProps) => {
  // isPremium controls which features render
  // For authenticated users, this is ALWAYS true
  
  return (
    <>
      {isPremium ? (
        <PremiumFeatures /> // Live generation, library, etc.
      ) : (
        <GuestFeatures />   // Timer, 6-page limit, etc.
      )}
    </>
  );
};
```

### 🔐 Global Premium Flag

```typescript
// Declared globally (window object)
declare global {
  interface Window {
    __IS_PREMIUM?: boolean;
  }
}

// Set in AuthWrapper.tsx
useEffect(() => {
  window.__IS_PREMIUM = !!user;
}, [user]);

// Access anywhere
if (window.__IS_PREMIUM) {
  // Premium-only code path
}
```

### 🚫 What NOT to Do

```typescript
// ❌ WRONG: Checking subscription status for feature access
const canAccessFeature = async () => {
  const subscription = await checkSubscription();
  return subscription.isPremium; // DON'T DO THIS
};

// ✅ CORRECT: Use authentication status
const canAccessFeature = () => {
  return !!user; // Simple auth check
};

// ❌ WRONG: Setting isPremium to false for authenticated users
if (subscriptionExpired && user) {
  setIsPremium(false); // NEVER DO THIS
}

// ✅ CORRECT: Keep isPremium true for all authenticated users
if (user) {
  setIsPremium(true); // ALWAYS true
}
```

---

## 5. Payment System Role

### 💳 What Payment Functions DO

Payment functions exist for **business operations**, NOT feature access control:

1. **Revenue Processing**
   - Process Stripe payments
   - Create customer records
   - Generate invoices
   - Handle refunds

2. **Business Analytics**
   - Track payment history
   - Calculate lifetime value
   - Monitor churn rates
   - Generate financial reports

3. **Marketing Operations**
   - Apply discount codes
   - Track promotional campaigns
   - A/B test pricing
   - Customer segmentation

4. **Account Management**
   - Customer portal access
   - Billing history
   - Payment method updates
   - Subscription preferences

### 🚫 What Payment Functions DON'T DO

Payment functions **DO NOT**:
- ❌ Control feature access
- ❌ Gate premium functionality
- ❌ Determine user capabilities
- ❌ Restrict authenticated user actions

### 📊 Payment Function List

All payment functions are for business operations only:

| Function | Purpose | Affects Features? |
|----------|---------|-------------------|
| `create-checkout` | Stripe checkout session | ❌ No |
| `create-premium-subscription` | Create Stripe subscription | ❌ No |
| `customer-portal` | Billing portal access | ❌ No |
| `validate-discount-code` | Check promo codes | ❌ No |
| `activate-discount-code` | Apply discounts | ❌ No |
| `apply-discount-code` | Process discount application | ❌ No |
| `check-subscription` | **Analytics ONLY** | ❌ No |

### 🧒 Default Premium Profile — Protagonist Name Fallback

When a premium user has no child profile yet, `createDefaultPremiumProfile()` in
`src/components/AuthenticatedApp.tsx` seeds a default `UserInfo`. The protagonist
name resolution order is:

1. First word of the **display name** captured at signup
   (`user.user_metadata.display_name`, e.g. `"E2E Premium Tester"` → `"E2E"`).
2. Email local-part (`user.email.split('@')[0]`) — legacy fallback.
3. Literal `"Reader"`.

> Previously the email local-part was used first, so stories named the hero after
> the email (e.g. `"e2e.uitest.0605-n7"`). The signup form already collects a
> Display Name, so no new input was added — the fix simply prefers that value.

### 🔑 Test-Script Note — Breached-Password Rejection (HTTP 422)

Signup rejects breached/pwned passwords (Supabase HaveIBeenPwned check) with a
`422`. This is **correct security behavior**, not a bug. Automated E2E/test
scripts must use a strong, non-breached password (e.g. a random 16+ char mix);
common samples like `TestPass123!` will be rejected.

### 🔍 Check-Subscription Function

The `check-subscription` edge function exists for **business intelligence**:

```typescript
// src/components/AuthenticatedApp.tsx
const checkSubscription = async () => {
  try {
    const { data } = await supabase.functions.invoke("check-subscription");
    
    // ✅ Use for analytics
    logUserSubscriptionStatus(data.subscribed);
    trackPaymentHealth(data.subscribed);
    
    // ❌ NEVER use to set isPremium
    // setIsPremium(!!data.subscribed); // WRONG!
    
    // ✅ ALWAYS keep isPremium true for authenticated users
    // No action needed - isPremium already true
    
  } catch (error) {
    // Error handling for analytics failure
    // Does NOT affect user experience
  }
};
```

**Key Points:**
- Returns subscription status from Stripe/database
- Used for business reporting and analytics
- Results **DO NOT** affect feature access
- Authenticated users remain premium regardless of response

---

## 6. Migration from Old Model

### 🔄 What Changed

#### Old Model (Deprecated)
```
User Authentication
      ↓
Check Subscription Status
      ↓
Set isPremium based on subscription
      ↓
Gate features based on isPremium
```

**Problems:**
- Complex subscription checking logic
- Multiple sources of truth
- Subscription table dependencies
- Edge function calls for feature access
- Potential for authenticated users to lose access

#### New Model (Current)
```
User Authentication
      ↓
isPremium = true (if authenticated)
      ↓
All features available
```

**Benefits:**
- Simple, reliable access control
- Single source of truth (authentication)
- No subscription table dependencies for features
- Instant feature access on login
- Predictable user experience

### 🗑️ Removed Components

**Deleted Files:**
- `src/components/SubscriptionGate.tsx` - No longer needed (feature gating removed)

**Removed Logic:**
- Subscription checking before feature rendering
- Premium status downgrade for authenticated users
- Feature access based on `subscribers` table
- Subscription expiry enforcement for features

**Kept (For Business Operations):**
- `src/services/enhancedSubscriptionManager.ts` - Analytics only
- `supabase/functions/check-subscription/` - Business intelligence
- All payment processing functions

### 📝 Code Changes Summary

```typescript
// BEFORE (Old Model)
const [isPremium, setIsPremium] = useState<boolean | null>(null);

useEffect(() => {
  if (user) {
    checkSubscription(); // Async check, sets isPremium
  }
}, [user]);

const checkSubscription = async () => {
  const { data } = await supabase.functions.invoke("check-subscription");
  setIsPremium(!!data.subscribed); // Could be false!
};

// AFTER (New Model)
const [isPremium, setIsPremium] = useState(true); // Always true

// No subscription check needed for feature access
// Optional analytics call (doesn't affect isPremium)
useEffect(() => {
  if (user) {
    logSubscriptionAnalytics(); // Analytics only
  }
}, [user]);
```

---

## 📚 Related Documentation

### Core Documentation
- 📘 [Master System Guide](./MASTER_SYSTEM_GUIDE.md) - Complete system architecture
- 💻 [Development Guide](./DEVELOPMENT_GUIDE.md) - Technical implementation patterns
- 📊 [Operations Guide](./OPERATIONS_GUIDE.md) - System status and monitoring
- 🔒 [Subscription Enforcement](./SUBSCRIPTION_ENFORCEMENT.md) - **NEW:** Dual-gating and paywall implementation
- 🏠 [Documentation Hub](./README.md) - Central navigation

### Implementation References
- 📡 [API Reference](../supabase/functions/_shared/API_REFERENCE.md) - Payment functions (business operations)
- 🔧 [appConfig.ts](../src/config/appConfig.ts) - Feature flags and settings
- 👥 [User Flow Diagram](./MASTER_SYSTEM_GUIDE.md#user-flows) - Visual representation
- 🔌 [useCachedSubscriptionStatus Hook](../src/hooks/useCachedSubscriptionStatus.ts) - Billing status source

### Testing & Verification
- 🧪 [Development Guide - Testing](./DEVELOPMENT_GUIDE.md#testing--debugging)
- 🔍 [Master Errors Document](./MASTER_ERRORS_TO_FIX.md) - Troubleshooting

---

## 🎯 Quick Reference

### For Developers
- **Question:** "Should I check subscription status?"
- **Answer:** Use `isSubscriptionActive` for feature gating, `isPremium` for general context

### For Product
- **Question:** "Can authenticated users lose premium access?"
- **Answer:** `isPremium` stays true, but `isSubscriptionActive` enforces billing

### For Operations
- **Question:** "Why do payment functions exist?"
- **Answer:** Business operations (revenue, analytics), not access control

### For Support
- **Question:** "User says they're logged in but can't access features"
- **Answer:** Check `isSubscriptionActive` billing status, not auth state

---

**Document Status:** ✅ Complete and Current  
**Next Review:** 2025-11-08  
**Maintained By:** Engineering Team  
**Version:** 2.0 (Dual-Gating System)

[↑ Back to Top](#authentication--premium-access-model)
