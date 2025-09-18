# Mobile Header Positioning Documentation

## CRITICAL: Mobile Header Positioning Requirements

This document defines the exact positioning of headers on **MOBILE ONLY** to prevent regression.

### Current Correct Mobile Positioning (Premium Users)

#### 1. PremiumHeader (Blue Gradient Bar)
- **Position**: `sticky top-0 z-[70]`
- **Vertical Location**: 0px from top of viewport
- **File**: `src/components/PremiumHeader.tsx`
- **Z-Index**: 70

#### 2. ResponsiveStoryHeader (Navigation Buttons)
- **Mobile Position**: `sticky top-[calc(var(--app-header-height,56px)-72px)]` 
- **Mobile Calculated Position**: Approximately -16px from top (56px - 72px = -16px)
- **Tablet Position**: `sticky top-[-24px]` (moved up 24px from top to sit under premium header)
- **File**: `src/components/ResponsiveStoryHeader.tsx` (line 368)
- **Z-Index**: 40
- **Condition**: `isMobileOrTablet && isPremium`

### Visual Stack (Top to Bottom - Mobile)
```
ResponsiveStoryHeader (z-40) at -16px (overlaying blue gradient)
PremiumHeader (z-70) at 0px (blue gradient bar)
```

### Key Implementation Details

#### In ResponsiveStoryHeader.tsx (line 368):
```tsx
isMobileOrTablet && "sticky top-[calc(var(--app-header-height,56px)-72px)]"
```

#### CSS Variable Reference:
- `--app-header-height` = 56px (set by PremiumHeader)
- Final calculation: 56px - 72px = -16px

### REGRESSION PREVENTION CHECKLIST

✅ **ResponsiveStoryHeader MUST overlay the blue gradient on mobile**
✅ **ResponsiveStoryHeader position: top-[calc(var(--app-header-height,56px)-72px)]**
✅ **PremiumHeader position: top-0**
✅ **Mobile condition: isMobileOrTablet && isPremium**

### DO NOT MODIFY WITHOUT UPDATING THIS DOCUMENTATION

Any changes to mobile header positioning MUST:
1. Update this documentation
2. Test on actual mobile devices
3. Verify ResponsiveStoryHeader overlays the blue gradient exactly
4. Maintain the 72px offset calculation

---
**Last Updated**: 2025-09-18
**Mobile Testing Required**: Yes - Physical device testing mandatory