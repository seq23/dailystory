# Smart Bypass User Tier Update Documentation (SUPERSEDED)

## ⚠️ CRITICAL UPDATE - JANUARY 25, 2025
**This documentation is OUTDATED. A critical bug was discovered and fixed.**  
**See**: `SMART_BYPASS_CRITICAL_FIX_2025_01_25.md` for the actual implementation.

## Overview
Enhanced the Smart Orchestration Bypass system to be user-tier aware, allowing different template routing based on premium vs guest user status.

## Changes Made

### 1. SmartOrchestrationBypass.ts Updates
- **Function Signature**: Added `userTier: 'premium' | 'guest' = 'guest'` parameter to `shouldBypassOrchestrator()`
- **Template Routing Logic**: 
  - Premium users → `runware-template-ab` (character consistency, full features)
  - Guest users → `runware-template-cd` (nuclear templates, faster)
- **Enhanced Logging**: All bypass reasons now include user tier information

### 2. Template CD (runware-template-cd) Enhancements
- **Scene Text Limit**: Reduced from 1500 to 1000 characters for faster processing
- **Cultural Features Enhancement**: Replaced generic "culturally appropriate African American features" with detailed description:
  ```
  "with beautiful natural African American features including fuller lips, broader nose, defined cheekbones, rich melanin-rich skin tone, and authentic cultural representation"
  ```

### 3. ImageTierTester UI Updates  
- **User Tier Control**: Added dropdown to select between Guest/Premium for testing
- **Form Integration**: User tier selection is included in `buildUserInfo()` and passed to backend
- **Testing Differentiation**: Tests now show which template will be used based on tier selection

### 4. SimpleImageService Integration
- **Bypass Decision**: Updated to pass `userInfo?.userTier || 'guest'` to Smart Bypass
- **Backward Compatibility**: Defaults to 'guest' tier when not specified

## Business Logic Impact

### Guest Users (Free/Non-paid)
- **Templates**: Always routed to Template CD (runware-template-cd)  
- **Performance**: Faster generation with 1000-char scene limit
- **Features**: Nuclear hardcoded templates, no character consistency
- **Quality**: Enhanced cultural representation for diversity

### Premium Users (Paid)
- **Templates**: Can use Template AB (runware-template-ab) when bypassing orchestrator
- **Performance**: Full feature set with character consistency when available
- **Features**: Multi-stage enhancement pipeline, visual consistency
- **Quality**: Premium rendering with detailed enhancements

## Testing Capabilities
The ImageTierTester now supports:
- User tier selection (Guest/Premium)
- Template routing verification
- Performance comparison between tiers
- Cultural representation testing

## Compatibility
- **Backward Compatible**: Existing code without userTier parameter defaults to 'guest'
- **Forward Compatible**: Ready for additional tier types if needed
- **Fallback Safe**: All functions handle missing userTier gracefully

## Performance Benefits
- **Guest Users**: Faster image generation with optimized templates
- **Premium Users**: Quality-focused routing with full feature access
- **Smart Routing**: Automatic template selection based on user subscription status
- **Reduced Load**: Better resource allocation between user tiers