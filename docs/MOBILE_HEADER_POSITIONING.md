# Mobile Header Positioning Documentation

## CRITICAL: Header Positioning Requirements (All Devices)

This document defines the exact positioning of headers across **MOBILE, TABLET, AND DESKTOP** to prevent regression.

### CURRENT SNAPSHOT - 9-18-2025 POSITIONING STATE

#### 1. PremiumHeader (Blue Gradient Bar) - ALL DEVICES
- **Position**: `sticky top-0 z-[70]`
- **Vertical Location**: 0px from top of viewport
- **File**: `src/components/PremiumHeader.tsx`
- **Z-Index**: 70
- **Applies To**: All screen sizes

#### 2. ResponsiveStoryHeader (Navigation Buttons) - RESPONSIVE POSITIONING
- **Mobile Position** (< 480px): `sticky top-[calc(var(--app-header-height,56px)-72px)]` 
- **Mobile Calculated Position**: -16px from top (56px - 72px = -16px)
- **Tablet Position** (480px - 900px): `sticky top-[-36px]` *(AS OF 9-18-2025)*
- **Desktop Position** (> 900px): Not sticky, normal flow
- **File**: `src/components/ResponsiveStoryHeader.tsx` (line 370)
- **Z-Index**: 40
- **Condition**: `isMobileOrTablet && isPremium`

### Visual Stack by Device Type

#### Mobile (< 480px)
```
ResponsiveStoryHeader (z-40) at -16px (overlaying blue gradient)
PremiumHeader (z-70) at 0px (blue gradient bar)
```

#### Tablet (480px - 900px) 
```
ResponsiveStoryHeader (z-40) at -36px (positioned above blue gradient)
PremiumHeader (z-70) at 0px (blue gradient bar)
```

#### Desktop (> 900px)
```
PremiumHeader (z-70) at 0px (blue gradient bar)
ResponsiveStoryHeader (z-40) - Normal document flow, not sticky
```

### Key Implementation Details

#### In ResponsiveStoryHeader.tsx (line 370):
```tsx
isMobileOrTablet && (
  isTablet 
    ? "sticky top-[-36px]"  // tablet: moved up 36px from top (AS OF 9-18-2025)
    : "sticky top-[calc(var(--app-header-height,56px)-72px)]"   // mobile: -16px
)
```

#### CSS Variable Reference:
- `--app-header-height` = 56px (set by PremiumHeader)
- Mobile calculation: 56px - 72px = -16px
- Tablet position: Fixed -36px offset (AS OF 9-18-2025)

#### Breakpoints Used:
- Mobile: `< 480px` (isMobile)
- Tablet: `480px - 900px` (isTablet) 
- Desktop: `> 900px` (isDesktop)

### REGRESSION PREVENTION CHECKLIST - 9-18-2025

✅ **ResponsiveStoryHeader MUST overlay the blue gradient on mobile (-16px)**
✅ **ResponsiveStoryHeader on tablet positioned at -36px (AS OF 9-18-2025)**
✅ **PremiumHeader position: top-0 across all devices**
✅ **Mobile condition: isMobileOrTablet && isPremium**
✅ **Tablet condition: isTablet within isMobileOrTablet**

### CURRENT STATE VERIFICATION CHECKLIST

Before making ANY changes to header positioning, verify:
1. **Mobile** (< 480px): ResponsiveStoryHeader at -16px overlays blue gradient
2. **Tablet** (480px-900px): ResponsiveStoryHeader at -36px above blue gradient  
3. **Desktop** (> 900px): Only PremiumHeader sticky, ResponsiveStoryHeader in normal flow
4. **All devices**: PremiumHeader remains at top-0 with z-index 70

### DO NOT MODIFY WITHOUT UPDATING THIS DOCUMENTATION

Any changes to header positioning MUST:
1. Update this documentation with new snapshot date
2. Test on actual mobile AND tablet devices  
3. Verify positioning across all three breakpoints
4. Document exact pixel positions and reasoning
5. Update regression prevention checklist

---
**Last Updated**: 2025-09-18
**Mobile Testing Required**: Yes - Physical device testing mandatory