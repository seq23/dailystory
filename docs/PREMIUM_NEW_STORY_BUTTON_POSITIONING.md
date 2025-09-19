# Premium New Story Button Positioning Documentation

## Overview
This document outlines the critical positioning requirements for the New Story button in the Premium My Stories view to prevent regressions.

**Date Created:** 2025-09-19  
**Location:** `src/components/PremiumMyStoriesView.tsx` - Line 176  
**Component:** `PremiumMyStoriesView`

## Current Positioning Requirements

### Mobile Positioning (< 640px)
- **Margin Left:** `-ml-11` (-44px)
- **Container:** `<div className="flex items-center gap-2 -ml-11 sm:-ml-2">`
- **Purpose:** Moves button 44px to the left on mobile devices for optimal layout

### Desktop/Tablet Positioning (≥ 640px) 
- **Margin Left:** `sm:-ml-2` (-8px)
- **Purpose:** Moves button 8px to the left on larger screens for balanced layout

## Implementation Details

**File:** `src/components/PremiumMyStoriesView.tsx`  
**Line:** 176  
**Current Code:**
```tsx
<div className="flex items-center gap-2 -ml-11 sm:-ml-2">
  <NewStoryCTA
    isPremium={isPremium}
    iconOnly={false}
    onNewStory={() => setRequestDialogOpen(true)}
    onUpgrade={() => {}}
    className="rounded-full pl-2 pr-3 sm:pl-3 sm:pr-4 md:px-6 hover-scale justify-start text-left shrink-0"
    size="md"
    wandPulse
    labelOverride="New Story"
  />
</div>
```

## Context & Layout
- **Parent Container:** Header section with `justify-between` flex layout
- **Left Side:** Page title and description
- **Right Side:** New Story button (this component)
- **Responsive Behavior:** Button positioning adjusts based on screen size

## Regression Prevention Checklist

When modifying this component, ensure:
- [ ] Mobile positioning remains `-ml-11` (44px left)
- [ ] Desktop positioning remains `sm:-ml-2` (8px left)  
- [ ] Container maintains `flex items-center gap-2` classes
- [ ] Button remains in header's right-side flex container
- [ ] Test on actual mobile devices, not just browser dev tools
- [ ] Verify button doesn't overlap with title on smallest screens
- [ ] Confirm button remains accessible and clickable

## Modification Guidelines

⚠️ **CRITICAL:** Any changes to this button's positioning must:
1. Update this documentation with new specifications
2. Test thoroughly on physical mobile devices
3. Document the reason for the change
4. Maintain accessibility standards

## Visual Layout by Device

### Mobile (< 640px)
```
[Page Title & Description]                    [New Story Button]
                                              ↑ 44px left margin
```

### Desktop (≥ 640px)
```
[Page Title & Description]                             [New Story Button]
                                                       ↑ 8px left margin
```

---
**Last Updated:** 2025-09-19  
**Snapshot Status:** ✅ Documented for regression prevention