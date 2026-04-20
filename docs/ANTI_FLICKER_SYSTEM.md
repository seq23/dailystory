# Anti-Flicker System Documentation

## Overview
The Anti-Flicker System prevents visual jumpiness, layout shifts, and race conditions during story loading and transitions, ensuring a smooth user experience.

## Core Components

### 1. Story Stability State Management
```typescript
const [isStoryStable, setIsStoryStable] = useState(false);
```

**Key Features:**
- **Debounced Updates**: 50ms delay prevents rapid toggling
- **Story Stabilization Events**: Bulletproof event dispatch only when `isStoryStable === true` AND `story.length > 0`
- **Navigation State Management**: Story marked unstable during page navigation

**Implementation:**
- Story marked as unstable during content changes
- Debounced re-stabilization on successful updates
- Prevents image generation during unstable states

### 2. Minimum Loader Duration System
```typescript
const LOADER_MIN_MS = 1600; // Consistent loading experience
```

**Purpose:**
- Prevents premature loader completion that causes jarring transitions
- Ensures minimum 1.6-second loading experience for visual consistency
- Debounced stability restoration to prevent flickering

**Flow:**
1. Loader starts → minimum timer begins
2. Content loads → waits for minimum duration
3. Both conditions satisfied → smooth transition

### 3. Buffered Story Updates
**Mechanism:**
- Single-batch story content updates prevent intermediate render states
- Story content changes logged with rapid change detection
- Warns when >2 changes occur in <1 second

**StoryContentLogger Integration:**
```typescript
StoryContentLogger.logStoryChange('story_update', 'before', oldStory, context);
// Update story content
StoryContentLogger.logStoryChange('story_update', 'after', newStory, context);
```

### 4. Navigation State Management
**During Navigation:**
- Story automatically marked as unstable
- Image generation blocked to prevent conflicts
- Debounced re-stabilization on successful navigation
- Error handling with graceful recovery

## Event System

### Story Stabilization Events
```typescript
// Bulletproof event dispatch
if (isStoryStable === true && story.length > 0) {
  window.dispatchEvent(new CustomEvent('story:stabilized', { 
    detail: { pageCount: story.length, currentPage } 
  }));
}
```

**Event Listeners:**
- Image generation services listen for `story:stabilized`
- UI components react to stabilization state
- Performance monitoring tracks stability metrics

## Race Condition Prevention

### 1. Image Generation Blocking
- No image generation during `isStoryStable === false`
- Prevents conflicts between content updates and image requests
- Ensures images match final story content

### 2. Debounced State Changes
- 50ms debounce on stability changes
- Prevents rapid state oscillation
- Smooth transitions between loading states

### 3. Minimum Duration Enforcement
- Loader visible for minimum 1600ms regardless of load speed
- Prevents jarring fast loads that cause layout shifts
- Consistent user experience across different performance conditions

### 4. Image Persistence During Page Navigation (Gate B1.2 — Apr 2026)
**Root cause of historical flicker:** When navigating to a page whose image
hadn't been generated yet (especially on premium page-by-page generation),
the `<ImageWithFallback>` element was unmounted and replaced by the
`ImageMixingLoading` spinner, then re-mounted when the new image arrived.
This swap caused the visible white-flash / spinner flicker.

**Fix:** introduced `displayImage` in `CleanStoryDisplay.tsx`:
```typescript
const displayImage = currentImage || (imagesEnabled
  ? (pageImages[currentPage - 1] || pageImages[currentPage + 1])
  : undefined);
```
The image element keeps the previous (or next) page's image visible while
the current page's image is still being prepared, with a subtle
backdrop-blur loading overlay on top. The container is never unmounted,
eliminating the flash. Benefits premium most because guest images are
pre-batched up front.

### 5. Premium Refresh-Resume Cache Protection (Apr 2026)
`SessionCacheManager.clearCharacterState` previously filtered localStorage
with `key.includes(userId)`. On premium (where `userId` is the auth UUID),
this wiped `gamification_<uuid>` entries on every Next-Story / cache clear,
deleting Progress Tower data and corrupting timer-resume state. Protected
key prefixes are now excluded from character-state wipes:
`guest.*`, `gamification_*`, `progressTowers*`, `readingTimer*`,
`premium.timer.*`.

## Story Content Monitoring

### Rapid Change Detection
```typescript
// Warns on excessive content changes
if (changeCount > 2 && timeWindow < 1000) {
  console.warn('🚨 Rapid story changes detected', { changeCount, timeWindow });
}
```

**Monitoring Features:**
- Tracks content change frequency
- Identifies potential infinite update loops
- Performance impact assessment

### Content Validation
- Ensures story content meets minimum requirements
- Validates content length and structure
- Prevents empty or malformed content display

## Integration Points

### 1. Story Generation Services
- NetflixStyleStoryService respects stability state
- LiveGenerationService coordinates with stability system
- Template service integrates with anti-flicker mechanisms

### 2. Image Loading System
- Progressive preloading respects stability state
- Fallback generation waits for stable content
- Image-text synchronization through stability events

### 3. User Interface Components
- Loading indicators tied to stability state
- Navigation controls disabled during unstable periods
- Progress indicators smooth across stability transitions

## Debug Parameters

### Query Parameters
- `?storydebug=true`: Enhanced story stability logging
- Shows stability state changes, timing, and event dispatch

### Console Logging
```typescript
console.log('📖 Story Stability Changed:', {
  isStable: isStoryStable,
  storyLength: story.length,
  currentPage,
  timestamp: Date.now()
});
```

## Benefits

### 1. Visual Consistency
- Eliminates layout shifts during content loading
- Smooth transitions between story states
- Consistent loading experience across devices

### 2. Performance Optimization
- Prevents unnecessary re-renders during content changes
- Reduces API calls through stability gating
- Optimized image loading coordination

### 3. User Experience
- No jarring content jumps or flickers
- Predictable loading behavior
- Professional, polished presentation

### 4. System Reliability
- Race condition elimination
- Graceful error handling during content changes
- Robust event coordination between components

## Architecture Integration

The Anti-Flicker System integrates seamlessly with:
- **Content-Aware Text Sizing**: Coordinates text sizing with stability state
- **Image Loading System**: Synchronizes image loading with content stability
- **Universal Difficulty System**: Ensures smooth difficulty transitions
- **Template System**: Maintains stability during fallback content loading

This comprehensive anti-flicker approach ensures a professional, smooth user experience across all story generation and display scenarios.