# Things to Fix Later - Sept-Oct 2025

## Document Purpose
This document tracks technical debt, bugs, and improvements that need to be addressed during the Sept-Oct 2025 timeframe. Items are prioritized and tracked with status updates.

## How to Use This Document
- Add new items using the template at the bottom
- Update status as work progresses
- Move completed items to the "Completed Items" section
- Review and update this document periodically

---

## Current Items to Fix

### 1. Fix useChildProfiles Race Conditions 🔴 HIGH PRIORITY
**Date Added:** September 19, 2025  
**Status:** ✅ COMPLETED (2025-09-22)
**Reporter:** User feedback - constant hard refresh needed

**Problem:**
Avatar pulldown shows hourglass timer and manage children profiles show "parent.manager.loading" message with no child profiles. Users constantly need to hard refresh to get it working.

**Root Cause:**
Race conditions in `useChildProfiles` hook where multiple component instances share global state (`activeLoadRequest`) but maintain separate `loading` states. Loading state gets stuck when shared request completes but individual components don't get notified properly.

**Detailed Fix Plan:**
1. **Simplify request deduplication** - Replace complex global `activeLoadRequest` with simple `lastRequestPromise`
2. **Fix loading state sync** - Ensure each hook instance properly manages its own loading state  
3. **Remove TOKEN_REFRESHED triggers** - This event causes too many concurrent reloads
4. **Streamline cache logic** - Keep cache but remove complex error tracking and retry mechanisms
5. **Add proper cleanup** - Clear promises and cache consistently on mutations

**Files to Modify:**
- `src/hooks/useChildProfiles.ts` (main fixes)
- Potentially `src/components/ChildManager.tsx` and `src/components/PremiumHeader.tsx` for state sync

**Impact:** Critical - affects core user experience with child profile management

---

## Completed Items

### 1. Fix useChildProfiles Race Conditions ✅
**Date Completed:** September 22, 2025  
**Solution:** Replaced global shared state with per-instance caching, eliminated `activeLoadRequest` global variable, implemented `lastRequestRef` per instance  
**Result:** Child profile management now works reliably without refresh requirement

---

## Template for New Items

### [Item Number]. [Title] [Priority Emoji]
**Date Added:** [Date]  
**Status:** [Not Started | In Progress | Testing | Completed]  
**Reporter:** [Who reported/requested this]  

**Problem:**
[Brief description of the issue]

**Proposed Solution:**
[How to fix it]

**Files to Modify:**
- [List of files that need changes]

**Impact:** [Low | Medium | High | Critical] - [Why this matters]

---

## Priority Legend
- 🔴 HIGH PRIORITY - Critical bugs affecting user experience
- 🟡 MEDIUM PRIORITY - Important improvements or moderate bugs  
- 🟢 LOW PRIORITY - Nice-to-have improvements or minor issues

## Status Options
- **Not Started** - Item identified but no work begun
- **In Progress** - Currently being worked on
- **Testing** - Implementation complete, needs validation
- **Completed** - Fixed and verified working

---

*Last Updated: September 19, 2025*