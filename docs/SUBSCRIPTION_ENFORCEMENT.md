# Subscription Enforcement & Dual-Gating System
**Last Updated:** 2025-10-08  
**Version:** 2.0  
**Status:** ✅ Production Ready

---

## 📋 Table of Contents

- [1. Overview](#1-overview)
- [2. Dual-Gating Architecture](#2-dual-gating-architecture)
- [3. Implementation Details](#3-implementation-details)
- [4. User Experience by State](#4-user-experience-by-state)
- [5. Code Examples](#5-code-examples)
- [6. Testing & Verification](#6-testing--verification)

---

## 1. Overview

### 🎯 System Purpose

The subscription enforcement system implements a **hard paywall** for authenticated users with inactive subscriptions while maintaining the principle that all authenticated users have `isPremium=true` status.

### 🔑 Key Principles

1. **Dual-Gating Mechanism:**
   - `isPremium` - Always `true` for authenticated users (general app context)
   - `isSubscriptionActive` - Authoritative billing status (feature access control)

2. **Hard Paywall Enforcement:**
   - Users with inactive subscriptions are blocked from premium features
   - Non-blocking banner displays subscription status
   - Only "My Account" section remains accessible for payment

3. **Never Downgrade Rule:**
   - `isPremium` status never changes to `false` for authenticated users
   - Billing enforcement happens through separate `isSubscriptionActive` flag

---

## 2. Dual-Gating Architecture

### 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  User Authentication                    │
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
    │ (Always)        │       │ Guest Experience │
    └─────────────────┘       └──────────────────┘
              │
              ▼
    ┌─────────────────────────┐
    │ Check Subscription DB   │
    │ (isSubscriptionActive)  │
    └─────────────────────────┘
              │
              ▼
    ┌─────────┴─────────┐
    │                   │
┌───▼────┐      ┌───────▼────┐
│ACTIVE  │      │  INACTIVE  │
│        │      │            │
└────────┘      └────────────┘
    │                  │
    ▼                  ▼
┌────────────┐   ┌──────────────┐
│Full Access │   │Hard Paywall  │
│All Features│   │Account Only  │
└────────────┘   └──────────────┘
```

### 🎭 Two-Layer Access Control

| Layer | Flag | Source | Purpose | Never Changes For Auth Users |
|-------|------|--------|---------|------------------------------|
| **Layer 1** | `isPremium` | `!!user` | General app context, dev workflow | ✅ Always `true` |
| **Layer 2** | `isSubscriptionActive` | `public.subscribers` table | Feature access gating | ❌ Changes based on billing |

---

## 3. Implementation Details

### 📦 Core Components

#### AuthenticatedApp.tsx

**Purpose:** Main authenticated app wrapper with subscription enforcement

```typescript
// Location: src/components/AuthenticatedApp.tsx

import { useCachedSubscriptionStatus } from '@/hooks/useCachedSubscriptionStatus';

export const AuthenticatedApp = ({ user }: { user: User }) => {
  // Layer 1: General premium status (always true for authenticated)
  const isPremium = !!user; // Always true
  
  // Layer 2: Authoritative billing status (from database)
  const { isPremium: isSubscriptionActive, loading: subLoading } = 
    useCachedSubscriptionStatus(user.id);
  
  // Navigation guard - block premium sections for inactive subscriptions
  const handleViewChange = (view: string) => {
    const premiumViews = ['stories', 'library', 'reading', 'premium', 'progress', 'parent', 'profile'];
    
    if (!isSubscriptionActive && premiumViews.includes(view)) {
      // Block navigation to premium sections
      setCurrentView('stories');
      return;
    }
    
    // Allow 'account' view for billing management
    setCurrentView(view as AppView);
  };
  
  // Render guards for premium sections
  if (currentView === 'library' && !isSubscriptionActive) {
    return <SubscriptionRequiredCard />;
  }
  
  if (currentView === 'reading' && !isSubscriptionActive) {
    return <SubscriptionRequiredCard />;
  }
  
  return (
    <>
      <NonBlockingSubscriptionBanner 
        userId={user.id} 
        isPremium={isPremium} 
      />
      
      <PremiumMyStoriesView
        userInfo={userInfo}
        isPremium={isPremium}
        isSubscriptionActive={isSubscriptionActive}
        onSessionEnded={handleSessionEnded}
      />
    </>
  );
};
```

#### PremiumMyStoriesView.tsx

**Purpose:** Premium stories interface with subscription enforcement

```typescript
// Location: src/components/PremiumMyStoriesView.tsx

interface PremiumMyStoriesViewProps {
  userInfo: UserInfo;
  isPremium: boolean;              // Layer 1: Always true
  isSubscriptionActive: boolean;   // Layer 2: Billing gate
  onSessionEnded: (stats: SessionStats) => void;
}

export const PremiumMyStoriesView = ({ 
  userInfo, 
  isPremium, 
  isSubscriptionActive,
  onSessionEnded 
}: PremiumMyStoriesViewProps) => {
  
  // Hard-block entire premium display if subscription inactive
  if (!isSubscriptionActive) {
    return (
      <div className="space-y-6">
        <div className="border-red-200 bg-red-50 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Subscription Required
          </h2>
          <p className="text-gray-600 mb-6">
            Your subscription is inactive. Please update your billing to continue.
          </p>
          <button 
            className="btn" 
            onClick={() => window.location.href = '/account'}
          >
            Manage Billing
          </button>
        </div>
      </div>
    );
  }
  
  // Prevent auto-resume for inactive subscriptions
  useEffect(() => {
    if (!isSubscriptionActive) return;
    
    const hasActiveSession = Boolean(
      localStorage.getItem('story-session-data') || 
      sessionStorage.getItem('last_story_text')
    );
    
    if (hasActiveSession && !requestDialogOpen) {
      setShowResumePrompt(true);
    }
  }, [isSubscriptionActive, requestDialogOpen]);
  
  // Disable "New Story" button based on billing status
  return (
    <>
      <NewStoryCTA
        isPremium={isSubscriptionActive}  // Use billing status for button state
        onNewStory={() => setRequestDialogOpen(true)}
        onUpgrade={() => {}}
        isSessionActive={isSessionActive}
      />
      
      {/* Rest of premium content */}
    </>
  );
};
```

#### useCachedSubscriptionStatus Hook

**Purpose:** Cached subscription status from database (5-minute TTL)

```typescript
// Location: src/hooks/useCachedSubscriptionStatus.ts

export const useCachedSubscriptionStatus = (userId: string) => {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data } = await supabase
          .from('subscribers')
          .select('subscribed, subscription_end')
          .eq('user_id', userId)
          .maybeSingle();
        
        const isActive = data?.subscribed === true && 
          (!data.subscription_end || new Date(data.subscription_end) > new Date());
        
        setIsPremium(isActive);
      } catch (error) {
        console.error('Subscription check failed:', error);
        setIsPremium(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkStatus();
  }, [userId]);
  
  return { isPremium, loading };
};
```

---

## 4. User Experience by State

### 💎 Active Subscription (Paid User)

**Authentication:** Signed In  
**isPremium:** `true`  
**isSubscriptionActive:** `true`

#### ✅ Available Features
- Full access to all premium sections
- "New Story" button enabled
- Can navigate to: Stories, Library, Reading, Premium, Progress, Parent Dashboard, Profile
- Can access My Account
- Banner hidden
- Auto-resume enabled
- Story library accessible
- Unlimited story creation

#### Navigation Flow
```
Stories ──> Library ──> Reading ──> Premium ──> Progress ──> Account
   ✅         ✅          ✅          ✅          ✅          ✅
```

---

### 🔒 Inactive Subscription (Unpaid User)

**Authentication:** Signed In  
**isPremium:** `true` (never changes)  
**isSubscriptionActive:** `false` (from DB)

#### ❌ Blocked Features
- Premium sections (Stories, Library, Reading, Premium, Progress, Parent Dashboard, Profile)
- "New Story" button disabled
- Story library access blocked
- Reading view blocked
- Auto-resume disabled

#### ✅ Available Features
- My Account section (for billing management)
- Red subscription banner (persistent)
- "Manage Billing" button

#### Navigation Flow
```
Stories ──X─> Library ──X─> Reading ──X─> Premium ──X─> Progress
   🚫           🚫            🚫            🚫            🚫
                                                          │
                                                          └──> Account
                                                                  ✅
```

#### Visual Experience
1. **Non-blocking Banner:** Red alert banner at top of screen
2. **Locked Content Card:** Displayed instead of premium content
3. **Disabled Button:** "New Story" button appears dimmed/disabled
4. **Blocked Navigation:** Sidebar clicks redirect to Stories view

---

### 🆓 Guest User (Not Signed In)

**Authentication:** Signed Out  
**isPremium:** `false`  
**isSubscriptionActive:** N/A

#### Features
- 20-minute timer
- 6-page story limit
- Netflix-style batch generation
- "Next Story" button
- No library access
- No subscription enforcement (different flow)

---

## 5. Code Examples

### ✅ Correct Implementation Patterns

#### Pattern 1: Navigation Gating
```typescript
const handleViewChange = (view: string) => {
  const premiumViews = ['stories', 'library', 'reading', 'premium', 'progress', 'parent', 'profile'];
  
  // Block premium navigation if subscription inactive
  if (!isSubscriptionActive && premiumViews.includes(view)) {
    setCurrentView('stories'); // Redirect to stories
    return;
  }
  
  // Allow account view regardless
  setCurrentView(view as AppView);
};
```

#### Pattern 2: Content Gating
```typescript
// AuthenticatedApp.tsx - Library view guard
if (currentView === 'library') {
  if (!isSubscriptionActive) {
    return (
      <div className="border-red-200 bg-red-50 rounded-lg p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Subscription Required
        </h2>
        <p className="text-gray-600 mb-6">
          Your subscription is inactive. Please update your billing to access your story library.
        </p>
        <button className="btn" onClick={() => setCurrentView('account')}>
          Manage Billing
        </button>
      </div>
    );
  }
  
  return <PremiumStoryLibrary userInfo={userInfo} isPremium={isPremium} />;
}
```

#### Pattern 3: Feature Gating in Components
```typescript
// PremiumMyStoriesView.tsx - Top-level guard
if (!isSubscriptionActive) {
  return (
    <div className="space-y-6">
      <div className="border-red-200 bg-red-50 rounded-lg p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Subscription Required
        </h2>
        <p className="text-gray-600 mb-6">
          Your subscription is inactive. Please update your billing to continue.
        </p>
        <button className="btn" onClick={() => window.location.href = '/account'}>
          Manage Billing
        </button>
      </div>
    </div>
  );
}
```

#### Pattern 4: Auto-Resume Guard
```typescript
useEffect(() => {
  // Prevent auto-resume for inactive subscriptions
  if (!isSubscriptionActive) return;
  
  const hasActiveSession = Boolean(
    localStorage.getItem('story-session-data') || 
    sessionStorage.getItem('last_story_text')
  );
  
  if (hasActiveSession && !requestDialogOpen) {
    setShowResumePrompt(true);
  }
}, [isSubscriptionActive, requestDialogOpen]);
```

### ❌ Incorrect Patterns (What NOT to Do)

```typescript
// ❌ WRONG: Changing isPremium for authenticated users
if (!isSubscriptionActive && user) {
  setIsPremium(false); // NEVER DO THIS
}

// ❌ WRONG: Using isPremium alone for feature gating
<NewStoryCTA 
  isPremium={isPremium}  // Wrong - use isSubscriptionActive
  onNewStory={handleNewStory}
/>

// ❌ WRONG: No subscription check before premium features
return (
  <PremiumMyStoriesView 
    isPremium={isPremium}
    // Missing: isSubscriptionActive prop
  />
);

// ❌ WRONG: Not blocking navigation to premium sections
const handleViewChange = (view: string) => {
  setCurrentView(view); // No guard - allows access to locked sections
};
```

---

## 6. Testing & Verification

### 🧪 Test Checklist

#### Inactive Subscription User Tests
- [ ] Banner displays at top of screen (red, persistent)
- [ ] "New Story" button is disabled (dim, not clickable)
- [ ] Clicking "Stories" in sidebar stays on Stories view
- [ ] Clicking "Library" in sidebar redirects to Stories view
- [ ] Clicking "Reading" in sidebar redirects to Stories view
- [ ] Clicking "Premium" in sidebar redirects to Stories view
- [ ] Clicking "Progress" in sidebar redirects to Stories view
- [ ] Clicking "Account" in sidebar works normally
- [ ] Stories view shows "Subscription Required" card
- [ ] Library view shows "Subscription Required" card
- [ ] "Manage Billing" button navigates to Account
- [ ] Auto-resume does NOT trigger

#### Active Subscription User Tests
- [ ] Banner hidden
- [ ] "New Story" button enabled
- [ ] All sidebar navigation works
- [ ] Stories view shows normal content
- [ ] Library view shows story grid
- [ ] Reading view works normally
- [ ] Auto-resume works correctly
- [ ] Story creation works
- [ ] Story library accessible

#### Payment Transition Tests
- [ ] After payment: Banner disappears immediately
- [ ] After payment: "New Story" becomes enabled
- [ ] After payment: Navigation to premium areas works
- [ ] After expiry: Banner appears
- [ ] After expiry: Premium sections become locked
- [ ] No flicker during page load/refresh

### 🔍 Debugging Commands

```typescript
// Check subscription status in console
const userId = 'user-id-here';
const { data } = await supabase
  .from('subscribers')
  .select('*')
  .eq('user_id', userId)
  .single();
console.log('Subscription status:', data);

// Check global flags
console.log('isPremium:', window.__IS_PREMIUM);
console.log('isSubscriptionActive:', /* inspect component state */);

// Manually set subscription active (testing only)
await supabase
  .from('subscribers')
  .update({ subscribed: true })
  .eq('user_id', userId);

// Manually set subscription inactive (testing only)
await supabase
  .from('subscribers')
  .update({ subscribed: false })
  .eq('user_id', userId);
```

---

## 📚 Related Documentation

- [Authentication Model](./AUTHENTICATION_MODEL.md) - Core authentication principles
- [Development Guide](./DEVELOPMENT_GUIDE.md) - Technical implementation
- [Non-Blocking Banner Fix](./FIX_HISTORY_2025_OCT6.md) - Banner implementation details
- [Master System Guide](./MASTER_SYSTEM_GUIDE.md) - Complete system architecture

---

**Document Status:** ✅ Complete and Current  
**Next Review:** 2025-11-08  
**Maintained By:** Engineering Team  
**Version:** 2.0 (Dual-Gating Implementation)

[↑ Back to Top](#subscription-enforcement--dual-gating-system)
