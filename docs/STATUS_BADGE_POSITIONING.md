# Story Status Badge Positioning Documentation

## CRITICAL: Status Badge Positioning Requirements

This document defines the exact positioning of **ALL STORY STATUS BADGES** to prevent regression.

### Current Correct Badge Positioning

#### Mobile/Tablet Devices
- **Position**: `absolute top-[258px] left-9 z-80`
- **Coordinates**: 258px from top, 36px from left (left-9 = 36px)
- **Positioning Context**: Absolute within image card container
- **Z-Index**: 80 (above all other elements)
- **Condition**: `isMobileOrTablet` (from `useIsMobile` hook)

#### Desktop Devices  
- **Position**: `fixed top-16 right-4 z-50`
- **Coordinates**: 64px from top, 16px from right edge
- **Positioning Context**: Fixed to viewport
- **Z-Index**: 50
- **Condition**: `!isMobileOrTablet`

### Badge Types Using This Positioning

✅ **BACKUP MODE BADGE** (Yellow)
- Icon: AlertTriangle 
- Text: "Backup Mode"
- Trigger: `currentMode === 'backup'`
- Colors: `border-yellow-500 bg-yellow-50 text-yellow-800`

✅ **EMERGENCY MODE BADGE** (Red)  
- Icon: Zap
- Text: "Emergency"
- Trigger: `currentMode === 'emergency'`
- Colors: `border-red-500 bg-red-50 text-red-800`

### Implementation Details

#### File Location
`src/components/StoryStatusIndicator.tsx` (lines 81-85)

#### Positioning Logic
```tsx
className={cn(
  "animate-in slide-in-from-top-2 duration-300",
  isMobileOrTablet 
    ? "absolute top-[258px] left-9 z-80"  // Mobile/tablet: within image card
    : "fixed top-16 right-4 z-50"         // Desktop: viewport fixed
)}
```

#### Device Detection
```tsx
const { isMobileOrTablet } = useIsMobile();
```

### Visual Position Reference

#### Mobile/Tablet Layout
```
Image Card Container (relative positioning)
├─ Image content
└─ Status Badge: 258px down, 36px right from top-left corner
```

#### Desktop Layout  
```
Viewport (fixed positioning)
└─ Status Badge: 64px down, 16px left from top-right corner
```

### REGRESSION PREVENTION CHECKLIST

✅ **BOTH badge types (yellow backup + red emergency) use IDENTICAL positioning**
✅ **Mobile/Tablet: absolute top-[258px] left-9 z-80**
✅ **Desktop: fixed top-16 right-4 z-50**  
✅ **Device detection via useIsMobile().isMobileOrTablet**
✅ **Z-index hierarchy maintained (80 > 50)**

### Badge State Management

The badge visibility and type is controlled by:
- `currentMode` state: 'normal' | 'backup' | 'emergency'
- `isVisible` state: boolean
- Badge only renders when `isVisible && currentMode !== 'normal'`

### DO NOT MODIFY WITHOUT UPDATING THIS DOCUMENTATION

Any changes to status badge positioning MUST:
1. Update this documentation
2. Test both yellow (backup) and red (emergency) badges
3. Verify positioning on mobile, tablet, and desktop
4. Ensure both badge types appear in the EXACT same location
5. Maintain z-index hierarchy

---
**Last Updated**: 2025-09-18  
**Badge Types**: Backup Mode (Yellow) + Emergency Mode (Red)  
**Testing Required**: Both badge types on all device sizes