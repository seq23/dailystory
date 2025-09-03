# Toast Notification System Specification

**Last Updated**: January 2025  
**Status**: ✅ Fully Implemented and Operational

## Overview

The toast notification system provides users with real-time awareness of story generation source changes. It implements a 3-tier notification system with specific durations, styling, and frequency controls to maintain optimal user experience.

## System Architecture

### Core Components
- **useStorySourceNotifications Hook**: Monitors source changes and triggers notifications
- **Toast Provider**: Shadcn toast system integration with custom styling
- **Session Storage**: Persistent flag management for notification control
- **Event System**: Custom events for source change detection

### Integration Points
- **Story Generation Services**: All services set global source flags
- **Status Indicator**: Coordinates with persistent status display
- **Session Management**: Notification state tied to user session lifecycle
- **Error Recovery**: Recovery notifications with session-based frequency control

## 3-Tier Toast System

### Tier 1: Yellow Warning Toast (Backup Mode)
**Purpose**: Inform users when AI falls back to template system

#### Trigger Conditions
- Source changes from `'ai'` to `'fallback'`
- Template service generates content instead of AI
- First occurrence during story generation

#### Notification Specifications
```typescript
// Configuration
duration: 7000, // 7 seconds
variant: 'warning', // Yellow background
frequency: 'once_per_transition', // Per backup mode entry
dismissible: true,
position: 'bottom-right'

// Message Content
title: "Backup Content Active"
description: "Using backup story content while AI recovers"
```

#### Visual Styling
- **Background**: Yellow warning color from design system
- **Icon**: AlertTriangle from Lucide React
- **Text Color**: High contrast for readability
- **Border**: Subtle warning border styling

#### Session Storage Integration
- **Flag Set**: `story_backup_mode = 'true'`
- **Flag Cleared**: On AI recovery or session end
- **Prevents**: Duplicate backup notifications during same backup period

### Tier 2: Red Emergency Toast (Emergency Mode)
**Purpose**: Alert users when both AI and templates fail

#### Trigger Conditions
- Source changes from `'ai'` or `'fallback'` to `'emergency'`
- Emergency rhyming content activated
- Critical system failure state

#### Notification Specifications
```typescript
// Configuration  
duration: 10000, // 10 seconds (longer for critical info)
variant: 'destructive', // Red background
frequency: 'once_per_transition', // Per emergency mode entry
dismissible: true,
position: 'bottom-right'

// Message Content
title: "Emergency Content Active"
description: "Temporary content while systems recover. Please try again shortly."
```

#### Visual Styling
- **Background**: Red destructive color from design system
- **Icon**: Zap from Lucide React  
- **Text Color**: White for high contrast on red
- **Border**: Emergency red border styling
- **Animation**: Subtle attention-drawing animation

#### Session Storage Integration
- **Flag Set**: `story_emergency_mode = 'true'`
- **Flag Cleared**: On AI recovery or session end
- **Coordination**: Clears backup mode flag when emergency activated

### Tier 3: Green Recovery Toast (AI Recovery)
**Purpose**: Celebrate AI service restoration after fallback/emergency

#### Trigger Conditions
- Source changes to `'ai'` after being in `'fallback'` or `'emergency'`
- AI service successfully generates content after failure
- System recovery detected

#### Notification Specifications
```typescript
// Configuration
duration: 4000, // 4 seconds (brief positive reinforcement)  
variant: 'default', // Green styling applied via CSS
frequency: 'once_per_session', // Maximum once per user session
dismissible: true,
position: 'bottom-right'

// Message Content
title: "AI Back Online"
description: "AI storytelling is back online!"
```

#### Visual Styling
- **Background**: Default with green accent from design system
- **Icon**: CheckCircle from Lucide React
- **Text Color**: Success green from design system
- **Border**: Success green border
- **Animation**: Positive success animation

#### Session Storage Integration
- **Flag Set**: `ai_recovery_shown = 'true'`
- **Flag Cleared**: Only on session end or page refresh
- **Prevents**: Duplicate recovery notifications in same session

## Implementation Details

### useStorySourceNotifications Hook
```typescript
export const useStorySourceNotifications = () => {
  const { toast } = useToast();
  const lastSourceRef = useRef<string>('ai');
  const hasShownRecoveryRef = useRef(false);

  const checkSourceChange = useCallback(() => {
    const currentSource = window.__LAST_STORY_SOURCE__ || 'ai';
    const lastSource = lastSourceRef.current;

    if (currentSource !== lastSource) {
      handleSourceTransition(lastSource, currentSource);
      lastSourceRef.current = currentSource;
    }
  }, []);

  // Event listeners and source monitoring logic
  useEffect(() => {
    // Story generation completion events
    const handleStoryComplete = () => checkSourceChange();
    window.addEventListener('story:generation:complete', handleStoryComplete);

    // Navigation events
    const handleNavigation = () => checkSourceChange();
    window.addEventListener('popstate', handleNavigation);

    // Page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSourceChange();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic source monitoring
    const interval = setInterval(checkSourceChange, 2000);

    return () => {
      window.removeEventListener('story:generation:complete', handleStoryComplete);
      window.removeEventListener('popstate', handleNavigation);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [checkSourceChange]);
};
```

### Source Transition Logic
```typescript
const handleSourceTransition = (from: string, to: string) => {
  // AI → Fallback: Show yellow warning
  if (from === 'ai' && to === 'fallback') {
    showBackupModeToast();
    sessionStorage.setItem('story_backup_mode', 'true');
  }
  
  // Any → Emergency: Show red alert
  if (to === 'emergency') {
    showEmergencyModeToast();
    sessionStorage.setItem('story_emergency_mode', 'true'); 
    sessionStorage.removeItem('story_backup_mode');
  }
  
  // Fallback/Emergency → AI: Show green recovery (once per session)
  if ((from === 'fallback' || from === 'emergency') && to === 'ai') {
    const hasShownRecovery = sessionStorage.getItem('ai_recovery_shown');
    if (!hasShownRecovery) {
      showRecoveryToast();
      sessionStorage.setItem('ai_recovery_shown', 'true');
    }
    clearFallbackFlags();
  }
};
```

## Event System Integration

### Custom Event Dispatching
```typescript
// Triggered by all story generation services
const notifySourceChange = (source: 'ai' | 'fallback' | 'emergency') => {
  window.__LAST_STORY_SOURCE__ = source;
  
  window.dispatchEvent(new CustomEvent('story:generation:complete', {
    detail: { source, timestamp: Date.now() }
  }));
};
```

### Service Integration Points
- **NetflixStyleStoryService**: Dispatches events on AI success, template fallback, emergency content
- **LiveGenerationService**: Per-page source change events for premium users
- **Template Service**: Template generation completion events
- **ErrorHandlingManager**: Emergency content activation events

## Session Storage Management

### Flag Lifecycle
```typescript
// Session storage flags and their purposes
interface NotificationFlags {
  story_backup_mode: 'true' | null;    // Controls backup mode indicator
  story_emergency_mode: 'true' | null; // Controls emergency mode indicator  
  ai_recovery_shown: 'true' | null;    // Prevents duplicate recovery toasts
}
```

### Flag Management Logic
```typescript
// Clear fallback flags on recovery
const clearFallbackFlags = () => {
  sessionStorage.removeItem('story_backup_mode');
  sessionStorage.removeItem('story_emergency_mode');
};

// Clear all notification flags on session end
const clearAllNotificationFlags = () => {
  sessionStorage.removeItem('story_backup_mode');
  sessionStorage.removeItem('story_emergency_mode');
  sessionStorage.removeItem('ai_recovery_shown');
};
```

### Cross-Component Coordination
- **Status Indicator**: Reads same session storage flags for persistent display
- **Story Services**: Set global source flags that trigger toast system
- **Session Management**: Clears flags on user session termination

## Toast Styling and Design System Integration

### Design System Colors
```css
/* Toast variants using design system tokens */
.toast-warning {
  background: hsl(var(--warning));
  border-color: hsl(var(--warning-foreground));
  color: hsl(var(--warning-foreground));
}

.toast-destructive {
  background: hsl(var(--destructive));
  border-color: hsl(var(--destructive-foreground));  
  color: hsl(var(--destructive-foreground));
}

.toast-success {
  background: hsl(var(--background));
  border-color: hsl(var(--success));
  color: hsl(var(--success));
}
```

### Responsive Behavior
- **Mobile**: Adjusted positioning and sizing for smaller screens
- **Desktop**: Standard bottom-right positioning
- **Animation**: Smooth slide-in animations using Tailwind transitions
- **Accessibility**: Proper ARIA labels and screen reader support

## Performance Considerations

### Event Throttling
```typescript
// Prevent excessive source change checking
const throttledSourceCheck = useMemo(
  () => throttle(checkSourceChange, 1000),
  [checkSourceChange]
);
```

### Memory Management
- **Event Cleanup**: All event listeners properly removed on unmount
- **Interval Cleanup**: Source monitoring intervals cleared on component destruction
- **Reference Management**: Refs used to prevent unnecessary re-renders

### Resource Optimization
- **Toast Queue**: Built-in toast system handles queuing and dismissal
- **Flag Persistence**: Minimal session storage usage with cleanup
- **Event Efficiency**: Custom events used sparingly for critical state changes

## Monitoring and Analytics

### Notification Metrics
```typescript
// Track notification frequency and user response
interface NotificationMetrics {
  backupToastsShown: number;
  emergencyToastsShown: number;
  recoveryToastsShown: number;
  userDismissalRate: number;
  averageViewDuration: number;
}
```

### System Health Indicators
- **Toast Frequency**: High emergency toast frequency indicates system issues
- **Recovery Rate**: Measure time between fallback and recovery toasts
- **User Engagement**: Track user interaction with toast notifications
- **Session Patterns**: Monitor notification patterns across user sessions

## Testing and Quality Assurance

### Unit Testing Scenarios
- Source change detection accuracy
- Toast display timing and duration
- Session storage flag management
- Event listener lifecycle management
- Cross-component coordination

### Integration Testing
- End-to-end source change flows
- Toast system interaction with status indicators
- Session persistence across page navigation
- User journey notification sequences

### User Experience Testing
- Toast readability and comprehension
- Notification timing appropriateness
- Frequency control effectiveness
- Overall system status awareness

---

**User Experience Goal**: The toast notification system ensures users are always informed about story generation status without being intrusive. It builds confidence during system issues and celebrates recovery, maintaining engagement throughout all system states.