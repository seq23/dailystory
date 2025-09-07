# Current Template System and Fallback Chain Architecture

**Last Updated**: January 2025  
**Status**: ✅ Fully Implemented and Operational

## Overview

This document details the comprehensive 3-tier fallback system with proper source tracking, toast notifications, and status indicators. The system ensures users always receive content through AI generation → Template system → Emergency content progression, with complete user experience management.

## System Architecture

### Primary Story Generation Services

#### 1. **NetflixStyleStoryService** (Free Users)
- **Location**: `src/services/NetflixStyleStoryService.ts`
- **Purpose**: Generates complete 6-page stories for free users
- **Primary Method**: `generateCompleteStory(userInfo: UserInfo)`
- **Fallback Strategy**: Enhanced templates → Emergency rhyming content

#### 2. **LiveGenerationService** (Premium Users)  
- **Location**: `src/services/LiveGenerationService.ts`
- **Purpose**: Generates individual pages for premium never-ending stories
- **Primary Methods**: 
  - `generateFirstPage(userInfo: UserInfo)`
  - `generateNextPage(context: LiveGenerationContext)`
- **Fallback Strategy**: Enhanced templates → Emergency content

#### 3. **Template Service** (Backend) ✅ FIXED
- **Location**: `supabase/functions/template-service/index.ts`
- **Status**: ✅ Syntax error resolved - Fixed import path in `templateConverter.ts`
- **Purpose**: Supabase Edge Function for template-based story generation  
- **Integration**: Called by `useTemplateService` hook
- **Source Tracking**: Returns `source: 'fallback'` metadata with generated content
- **Fallback Strategy**: Template library → Grammar validation → Error handling

## Current Fallback Chain Hierarchy

### Level 1: AI Story Generation
**Services**: `NetflixStyleStoryService`, `LiveGenerationService`
- Attempts OpenAI GPT-4 story generation via `supabase.functions.invoke('generate-adaptive-story')`
- Includes cultural context, difficulty adaptation, and character consistency
- **Source Tracking**: Sets `window.__LAST_STORY_SOURCE__ = 'ai'` on success
- **User Experience**: No toast notifications, no status indicators (normal operation)
- **Timeout**: Configured per service
- **Success Rate**: ~85-90% under normal conditions

**On Failure → Level 2**

### Level 2: Backend Template System ✅ FIXED
**Service**: `template-service` Edge Function  
- **Location**: `supabase/functions/template-service/index.ts`
- **Status**: ✅ Deployment working - Fixed syntax error in `templateConverter.ts`
- **Fix Applied**: Corrected import from `'./placeholderResolver.js'` to `'./placeholderResolver.ts'`
- **Content**: 136 individual template files accessed via dynamic loading
- **Total Pages**: 400+ story pages
- **Architecture**: Backend-only with no frontend template storage
- **Source Tracking**: Sets `window.__LAST_STORY_SOURCE__ = 'fallback'` on success
- **User Experience**: 
  - Yellow warning toast: "Using backup story content while AI recovers" (7 seconds)
  - Backup status indicator appears (top-right, clickable)
  - Session flag: `story_backup_mode = 'true'`
- **Features**:
  - Individual template file loading from `supabase/functions/_shared/templates/`
  - User personalization via `placeholderResolver.ts`
  - Grammar validation via `grammarValidator.ts`
  - Cultural context integration
  - 4 ending types per template (Cozy, Silly, Triumphant, Reflective)

**On Failure → Level 3**

### Level 3: Creative Rhyming Emergency Content ✅ FIXED
**Manager**: `ErrorHandlingManager.getEmergencyContent()`
- **Location**: `src/services/errorHandlingManager.ts` (lines 113-177)
- **Status**: ✅ Source tracking corrected - Now properly sets emergency source
- **Fix Applied**: Added `window.__LAST_STORY_SOURCE__ = 'emergency'` in emergency content generation
- **Purpose**: Delightful rhyming poems that explain system issues
- **Source Tracking**: Sets `window.__LAST_STORY_SOURCE__ = 'emergency'` on activation
- **User Experience**:
  - Red emergency toast: "Temporary content while systems recover" (10 seconds)  
  - Emergency status indicator appears (red Zap icon, top-right)
  - Session flag: `story_emergency_mode = 'true'`
- **Features**:
  - 5 rotating rhyming templates to avoid repetition
  - User name personalization
  - Clear instructions for retry process
  - Max retry guidance and feedback suggestions

**Sample Content**:
```
Oh dear Sarah, our story machine took a little rest,
Sometimes computers need breaks to work their very best!
Click the magic "Try Again" button that you can see,
And soon a wonderful new story there will be!

If three little tries don't make it quite right,
Don't worry, don't fret - everything's still bright!
Come back in a few minutes to try once more,
Or tell us what happened - we'd love to explore!
```

**Final Fallback**: Simple 4-line rhyming message if content generation fails

## Source Tracking and User Experience System ✅ IMPLEMENTED

### Global Source Variables
```javascript
// Set by all services to track content source
window.__LAST_STORY_SOURCE__ = 'ai' | 'fallback' | 'emergency'
window.__LAST_PAGE_SOURCE__ = 'ai' | 'fallback' | 'emergency' // Premium users
```

### Toast Notification System
**Hook**: `useStorySourceNotifications` monitors source changes

#### 3-Tier Toast Implementation
1. **Yellow Warning Toast** (7 seconds)
   - Trigger: Source changes to `'fallback'`
   - Message: "Using backup story content while AI recovers"  
   - Variant: `warning`

2. **Red Emergency Toast** (10 seconds)
   - Trigger: Source changes to `'emergency'`
   - Message: "Temporary content while systems recover"
   - Variant: `destructive`

3. **Green Recovery Toast** (4 seconds)
   - Trigger: Source returns to `'ai'` after fallback/emergency
   - Message: "AI storytelling is back online!"
   - Variant: `default` with green styling
   - Frequency: Once per session via `ai_recovery_shown` flag

### Status Indicator System
**Component**: `StoryStatusIndicator` provides persistent status awareness

#### Status Display
- **Normal Mode**: Hidden indicator
- **Backup Mode**: Yellow AlertTriangle icon, "Backup Mode" text
- **Emergency Mode**: Red Zap icon, "Emergency" text
- **Position**: Fixed top-right corner, clickable for more info

#### Session Storage Integration
- `story_backup_mode`: Controls backup mode indicator visibility
- `story_emergency_mode`: Controls emergency mode indicator visibility
- `ai_recovery_shown`: Prevents duplicate recovery notifications

## Error Handling and Retry System

### ErrorHandlingManager
**Location**: `src/services/errorHandlingManager.ts`

#### Core Configuration
- **Max Retries**: 3 attempts per operation
- **Reset Time**: 60 seconds (error count reset)
- **Tracking**: Per-component error counting (`component_action` keys)

#### executeWithRecovery Method
```typescript
static async executeWithRecovery<T>(
  fn: () => Promise<T>,
  context: ErrorContext,
  fallbackFn?: () => Promise<T> | T
): Promise<ErrorResponse<T>>
```

**Behavior**:
1. Checks if max retries exceeded for operation
2. If exceeded → uses fallback function immediately
3. If not exceeded → attempts primary function
4. On success → resets error count
5. On failure → increments error count, schedules reset, attempts fallback

### useTemplateService Hook Integration
**Location**: `src/hooks/useTemplateService.ts`

#### State Management
- `isLoading`: Request in progress
- `result`: Generated content from backend template service
- `error`: Error message from Edge Function failures
- `retryCount`: Current attempt number (0-3)
- `isMaxRetriesReached`: Boolean flag for UI changes

#### Backend API Integration
- **Primary Call**: `supabase.functions.invoke('template-service')` to Edge Function
- **Request Format**: `{ difficulty, userInfo, pageCount, templateIndex, explore, mode }`
- **Response Processing**: Converts Edge Function response to frontend-compatible format
- **Error Handling**: Captures 503 Service Unavailable and 404 Not Found responses

#### Toast Notifications
- Automatic toast when `isMaxRetriesReached` becomes true
- Message: "Our story system is taking a rest! Please try again in a few minutes, or let us know if you need help!"
- Duration: 5 seconds

#### Fallback Flow
1. Frontend calls `useTemplateService.generateTemplate()`
2. Hook invokes `supabase.functions.invoke('template-service')`
3. Edge Function loads template via `dynamicTemplateLoader.js`
4. On backend failure → Hook calls `ErrorHandlingManager.executeWithRecovery()`
5. Fallback function → calls `ErrorHandlingManager.getEmergencyContent()`
6. Returns rhyming emergency content as story pages
7. UI displays creative poems instead of generic error messages

## UI Integration

### QuickTemplateTest Component
**Location**: `src/components/template-testing/QuickTemplateTest.tsx`

#### Max Retries Display (lines 200-237)
When `isMaxRetriesReached` is true:
- Shows magical theater mask emoji (🎭)
- Displays "Story Magic Taking a Break" header
- Renders rhyming emergency content in styled container
- Provides retry button and issue reporting link
- Uses gradient background for visual appeal

### CleanStoryDisplay Component  
**Location**: `src/components/CleanStoryDisplay.tsx`

#### Enhanced Error Display (lines 2594-2625)
- Large theater mask emoji (🎭) 
- "Story Magic Taking a Break" title
- User-friendly explanation
- Maintains diagnostic panel integration
- Styled try again button

## Template System Details

### Backend Template Architecture
**Location**: `supabase/functions/_shared/templates/`

#### Individual File System
- **136 Total Templates**: Each template stored in separate JavaScript file
- **Dynamic Loading**: Templates imported on-demand via `dynamicTemplateLoader.js`
- **Registry Mapping**: Metadata stored in `registry.js` without template content
- **No Frontend Storage**: All template data removed from `src/constants/`

#### Difficulty Mapping (Edge Function)
```typescript
const levelMap: Record<string, string> = {
  'beginner': 'Level0',
  'easy': 'level1',      // 5 templates
  'medium': 'level2',    // 5 templates
  'hard': 'level3',      // 5 templates
  'expert': 'level4',    // 5 templates
  '6th': '6th',          // 3 templates
  '7th': '7th',          // 3 templates
  '8th': '8th',          // 3 templates
  '9th': '9th',          // 3 templates
  '10th': '10th'         // 3 templates
};
```

#### Backend Processing Methods
- `loadTemplate(level, templateIndex)`: Dynamically loads individual template files
- `getTemplate(level, index, userInfo, pageCount)`: Processes templates into string arrays
- `resolveAllPlaceholders(template, microContext)`: Personalizes content via backend processing
- `validateAndEnhanceGrammar(text, pronoun)`: Grammar validation and enhancement
- Placeholder support: `{userName}`, `{favoriteColor}`, `{favoriteAnimal}`, etc.

### Backend Template Service
**Location**: `supabase/functions/template-service/index.ts`

#### Token Limits by Difficulty
```typescript
const TOKEN_LIMITS = {
  beginner: { maxTokens: 200, expectedPages: 5, tokensPerPage: 40 },
  easy: { maxTokens: 300, expectedPages: 6, tokensPerPage: 50 },
  medium: { maxTokens: 400, expectedPages: 8, tokensPerPage: 50 },
  hard: { maxTokens: 600, expectedPages: 10, tokensPerPage: 60 },
  expert: { maxTokens: 800, expectedPages: 12, tokensPerPage: 65 }
};
```

#### Processing Pipeline
1. Template selection based on difficulty
2. Placeholder resolution with user data
3. Grammar validation and enhancement
4. Token limit validation
5. Page formatting and cleanup

## Current Implementation Status

### ✅ Fully Implemented and Operational
- **3-tier fallback system**: AI → Templates → Emergency content
- **Template service deployment**: ✅ Fixed syntax error, now functional
- **Emergency source tracking**: ✅ Corrected to properly label emergency content as `'emergency'`
- **Toast notification system**: Complete 3-tier system with proper durations
- **Status indicator system**: Persistent, clickable status awareness
- **Session storage integration**: Proper flag management and cleanup
- **Recovery notification system**: One-time per session recovery celebrations
- **Creative rhyming emergency fallback**: Delightful user experience during failures
- **Enhanced UI error displays**: QuickTemplateTest and CleanStoryDisplay integration
- **Comprehensive error tracking and retry logic**: Standardized error handling
- **Placeholder resolution and grammar validation**: Complete personalization

### ✅ Recent Critical Updates (January 2025)
- **Runware Simple Fallback Enhancement**: ✅ Updated emergency template generation
  - **Line 2054**: Now uses pageText + NUCLEAR_STYLE_SETTINGS frameworkPrompt
  - **Line 2847**: Enhanced emergency template with child-safe, diverse representation
  - **Nuclear Independence**: Zero-dependency fallback system with hardcoded cultural arrays
  - **Template Processing**: Raw pageText integration for better content continuity
  - **Regression Prevention**: Comprehensive code comments and dependency documentation

### ✅ Integration Points Working
- **Source tracking pipeline**: All services → Global source flags → UI notifications
- **Toast system integration**: Source changes → useStorySourceNotifications → Toast display
- **Status indicator coordination**: Session storage flags → StoryStatusIndicator → User awareness
- **Template service pipeline**: `useTemplateService` → `template-service` Edge Function → `dynamicTemplateLoader.js` → Individual template files
- **Frontend services integration**: Story services → Template hooks → Backend API calls
- **Template processing**: Template loading → `placeholderResolver.ts` → `grammarValidator.ts` → Processed content
- **Emergency content flow**: Edge Function errors → `ErrorHandlingManager` → Emergency rhyming content
- **Complete user experience**: Backend template system → Frontend display → User notifications

### 🔄 Current Behavior Flow
1. **User requests story** → Timer starts, session begins
2. **AI generation attempt** → Sets `'ai'` source on success, no notifications
3. **AI failure** → Template system activates
4. **Template success** → Sets `'fallback'` source → Yellow toast → Backup indicator
5. **Template failure** → Emergency content activates  
6. **Emergency activation** → Sets `'emergency'` source → Red toast → Emergency indicator
7. **AI recovery** → Sets `'ai'` source → Green recovery toast (once per session) → Indicators disappear
8. **UI displays** → Appropriate content with clear source awareness and retry guidance
9. **User interaction** → Clickable status indicators provide contextual information
10. **Session management** → Proper cleanup and flag management on session end

## Testing Scenarios

### Error Simulation
- Disconnect network → Emergency rhyming content appears
- Force template service failure → Fallback chain activates
- Exceed retry limit → Toast notification + rhyming display

### User Experience Validation
- Verify rhyming content is age-appropriate and encouraging
- Check toast notifications appear at correct timing
- Ensure retry buttons function properly
- Validate user name personalization in rhyming content

## Maintenance Notes

### When Modifying Fallback Chain
1. Update this documentation first
2. Test all three fallback levels
3. Verify UI integration points
4. Check toast notification timing
5. Validate rhyming content quality

### Key Files to Monitor
- `src/services/errorHandlingManager.ts` - Core error handling logic
- `src/hooks/useTemplateService.ts` - Frontend integration and API calls
- `supabase/functions/template-service/index.ts` - Backend Edge Function processing
- `supabase/functions/_shared/dynamicTemplateLoader.js` - Template loading system
- `supabase/functions/_shared/templates/registry.js` - Template metadata mapping
- `supabase/functions/_shared/templateImporter.ts` - Template processing pipeline
- `supabase/functions/_shared/placeholderResolver.ts` - Content personalization
- `supabase/functions/_shared/grammarValidator.ts` - Grammar enhancement

---

**Last Updated**: January 2025 - Post-Emergency Source Tracking Fixes and Toast System Implementation  
**Status**: All systems operational with comprehensive fallback chain, proper source tracking, and complete user experience management ✅