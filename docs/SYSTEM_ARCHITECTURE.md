# System Architecture Overview

**Last Updated**: January 2025  
**Status**: ✅ Comprehensive Fallback System Implemented

## Overview

This document outlines the complete system architecture for the story generation platform, including the 3-tier fallback system, user experience management, and backend service integration. The architecture prioritizes user experience continuity and system reliability.

## High-Level Architecture

### Frontend Application Layer
- **React + TypeScript**: Main application framework
- **Vite**: Build system and development server
- **Tailwind CSS**: Design system and styling
- **Shadcn/ui**: Component library with custom extensions
- **React Router**: Client-side routing and navigation

### Backend Services Layer
- **Supabase**: Primary backend platform
- **Edge Functions**: Serverless function execution
- **OpenAI Integration**: Primary AI story generation
- **Template System**: Fallback content generation
- **Image Generation**: AI-powered image creation per page

### State Management Layer
- **React Context**: User session and preferences
- **Local Storage**: Persistent user settings
- **Session Storage**: Temporary state and flags
- **Global Variables**: Real-time source tracking

## Core System Components

### Story Generation Pipeline

#### Tier 1: AI Generation Service
```typescript
// Primary story generation via OpenAI
interface AIGenerationService {
  generateStory(userInfo: UserInfo): Promise<StoryResult>;
  generatePage(context: StoryContext): Promise<PageResult>;
  
  // Integration points
  setGlobalSource: (source: 'ai') => void;
  dispatchEvent: (event: 'story:generation:complete') => void;
}
```

**Implementation**: 
- OpenAI GPT-4 integration via Supabase Edge Functions
- Character consistency via database-backed context
- Dynamic prompt building with user personalization
- Image generation coordination per story page

**Success Path**:
- Sets `window.__LAST_STORY_SOURCE__ = 'ai'`
- Dispatches completion event for UI notifications
- Returns high-quality personalized content

**Failure Path**:
- Timeout after 30 seconds
- Error handling via standardized error utilities
- Automatic fallback to Tier 2.5 (Nuclear Hardcoded Fallback)

#### Tier 2.5: Nuclear Hardcoded Fallback
```typescript
// Template-based fallback content generation
interface TemplateService {
  generateFromTemplate(userInfo: UserInfo, difficulty: DifficultyLevel): Promise<TemplateResult>;
  
  // Backend integration
  invokeEdgeFunction: (templateRequest: TemplateRequest) => Promise<TemplateResponse>;
  validateGrammar: (content: string) => Promise<string>;
  personalizeContent: (template: string, userInfo: UserInfo) => string;
}
```

**Implementation**:
- Supabase Edge Function: `template-service`
- 136 individual template files with dynamic loading
- Grammar validation and content personalization
- Metadata management via template registry

**Recent Fixes**:
- ✅ **Syntax Error Resolved**: Fixed import path in `templateConverter.ts` (`.js` → `.ts`)
- ✅ **Deployment Working**: Edge function now properly deployed and functional
- ✅ **Source Tracking**: Returns proper source metadata with generated content

**Success Path**:
- Sets `window.__LAST_STORY_SOURCE__ = 'fallback'`
- Triggers yellow warning toast notification
- Returns template-based personalized content

**Failure Path**:
- Edge function errors or timeouts
- Automatic fallback to Tier 3 (Emergency Content)

#### Tier 3: Emergency Content System
```typescript  
// Emergency rhyming content generation
interface EmergencyContentService {
  getEmergencyContent(userInfo: UserInfo): string;
  
  // Content generation
  generateRhymingContent: (character: string) => string;
  personalizeEmergencyContent: (template: string, userInfo: UserInfo) => string;
  includeRetryGuidance: (content: string) => string;
}
```

**Implementation**:
- Local content generation via `ErrorHandlingManager`
- Rotating rhyming poems with character personalization
- User-friendly retry guidance and reassurance
- No external dependencies for maximum reliability

**Success Path**:
- Sets `window.__LAST_STORY_SOURCE__ = 'emergency'`
- Triggers red emergency toast notification
- Returns rhyming content with retry guidance

**Ultimate Fallback**:
- Simple hardcoded rhyming message
- Guaranteed content delivery regardless of system state

### User Experience Management

#### Toast Notification System
```typescript
interface NotificationSystem {
  // 3-tier toast implementation
  showBackupToast: (duration: 7000) => void;    // Yellow warning
  showEmergencyToast: (duration: 10000) => void; // Red alert
  showRecoveryToast: (duration: 4000) => void;   // Green success
  
  // Session management
  manageSessionFlags: () => void;
  preventDuplicateNotifications: () => void;
}
```

**Components**:
- `useStorySourceNotifications`: Source change monitoring hook
- `useToast`: Shadcn toast system with custom styling
- Session storage integration for persistent flags
- Event-driven notification triggers

#### Status Indicator System
```typescript
interface StatusIndicatorSystem {
  // Persistent status display
  renderBackupIndicator: () => React.Component;
  renderEmergencyIndicator: () => React.Component;
  
  // User interaction
  handleStatusClick: () => void;
  displayContextualInfo: () => void;
}
```

**Components**:
- `StoryStatusIndicator`: Fixed top-right status display
- Clickable indicators with contextual information
- Session persistence across navigation
- Coordination with toast notification system

### User Type Management

#### Guest User System (Free Tier)
```typescript
interface GuestUserSystem {
  // Session management
  sessionTimer: FloatingTimer; // 20-minute countdown
  sessionLimits: StoryLimits;  // 6 pages per story
  
  // Content flow
  generateNetflixStyle: () => Promise<NetflixStoryResult>; // 6-page stories
  enforcePageLimits: () => void; // "Next Story" after page 6
  clearCacheOnNewStory: () => void;
}
```

**Business Logic**:
- 20-minute session timer (pausable, resumable)
- 6-page story limit with "Next Story" progression
- Cache clearing between stories
- Full fallback system access for all content

#### Premium User System (Paid Tier)
```typescript
interface PremiumUserSystem {
  // Session management  
  dismissibleTimer: FloatingTimer; // User-controlled duration
  unlimitedContent: boolean;       // No artificial limits
  
  // Content flow
  generateLivePages: () => Promise<PageResult>; // Page-by-page generation
  saveToLibrary: () => void;       // Story preservation
  rewriteStory: () => void;        // Magic wand regeneration
}
```

**Business Logic**:
- Dismissible timer with unlimited session capability
- Page-by-page generation with unlimited continuation
- Story library with image preservation
- Magic wand story rewriting with cache clearing
- Full fallback system access per individual page

## Backend Architecture

### Supabase Edge Functions

#### generate-adaptive-story Function
- **Purpose**: Primary AI story generation endpoint
- **Integration**: OpenAI GPT-4 API calls
- **Response**: Complete story content with metadata
- **Error Handling**: Timeout and error propagation to frontend

#### template-service Function ✅ FIXED
- **Purpose**: Template-based story generation fallback
- **Location**: `supabase/functions/template-service/`  
- **Dependencies**: Fixed import paths (`.ts` extensions)
- **Processing**: Dynamic template loading, personalization, grammar validation
- **Response**: Template-generated content with source metadata

#### Shared Utilities
- **Location**: `supabase/functions/_shared/`
- **Components**: 
  - `templateConverter.ts`: Template processing logic ✅ FIXED
  - `placeholderResolver.ts`: Content personalization
  - `dynamicTemplateLoader.js`: Template file management
  - `registry.js`: Template metadata and categorization

### Database Architecture

#### Tables and Storage
- **Character Consistency Cache**: Maintains avatar and character traits
- **User Profiles**: Premium/guest user management
- **Story Library**: Premium user story preservation
- **Session Management**: Active session tracking

#### Storage Buckets
- **Generated Images**: Per-page image storage with caching
- **User Avatars**: Profile image management
- **Template Assets**: Static template resources

## Source Tracking System

### Global State Management
```typescript
// Real-time source tracking
interface GlobalSourceTracking {
  __LAST_STORY_SOURCE__: 'ai' | 'fallback' | 'emergency';
  __LAST_PAGE_SOURCE__: 'ai' | 'fallback' | 'emergency'; // Premium users
  
  // Event system
  dispatchSourceChange: (source: SourceType) => void;
  monitorSourceChanges: () => void;
}
```

### Session Storage Integration
```typescript
// Persistent UI state flags
interface SessionFlags {
  story_backup_mode: 'true' | null;    // Backup mode indicator
  story_emergency_mode: 'true' | null; // Emergency mode indicator
  ai_recovery_shown: 'true' | null;    // Recovery notification control
}
```

### Cross-Component Coordination
- **Services**: All generation services set global source flags
- **UI Components**: Read source flags for display logic
- **Notifications**: Source changes trigger toast notifications
- **Status Indicators**: Persistent indicators based on source state

## Error Handling and Recovery

### Standardized Error Management
```typescript
interface ErrorHandlingSystem {
  // Safe error processing
  safeErrorMessage: (error: unknown) => string;
  logSafeError: (error: unknown, context: string) => void;
  
  // Recovery mechanisms
  executeWithRecovery: <T>(
    primary: () => Promise<T>,
    fallback: () => Promise<T>, 
    emergency: () => T
  ) => Promise<T>;
}
```

### Retry Logic
- **Max Retries**: 3 attempts per service tier
- **Backoff Strategy**: Exponential backoff (1s, 2s, 4s)
- **Service Reset**: 60-second cooldown before retry counter reset
- **Cross-Tier**: Independent retry logic per fallback tier

## Performance and Optimization

### Frontend Optimization
- **Component Lazy Loading**: Dynamic imports for large components
- **Image Optimization**: Progressive loading and caching
- **State Management**: Minimal re-renders via proper dependency arrays
- **Bundle Optimization**: Code splitting and tree shaking

### Backend Optimization
- **Edge Function Performance**: Optimized cold start times
- **Template Caching**: Dynamic template loading with caching
- **Database Queries**: Indexed queries for character consistency
- **Image Generation**: Efficient AI image generation coordination

### Caching Strategy
- **Story Content**: Session-based caching with cleanup
- **Generated Images**: Persistent caching for navigation
- **Template Assets**: Static asset caching
- **User Data**: Optimized user preference storage

## Monitoring and Health Checks

### System Health Indicators
```typescript
interface SystemHealthMonitoring {
  // Service availability
  aiServiceHealth: () => Promise<HealthStatus>;
  templateServiceHealth: () => Promise<HealthStatus>;
  
  // Performance metrics
  responseTimeTracking: () => MetricsData;
  errorRateMonitoring: () => ErrorMetrics;
  
  // User experience
  fallbackUsageRates: () => FallbackMetrics;
  userSessionMetrics: () => SessionData;
}
```

### Key Performance Indicators
- **AI Service Uptime**: Target >99% availability
- **Template Service Response**: <2 second response time after fix
- **Emergency Content Usage**: <1% of total content generation
- **User Session Completion**: High retention through fallback periods

## Security and Data Protection

### Data Privacy
- **User Information**: Minimal data collection and storage
- **Story Content**: Temporary storage with automatic cleanup
- **Session Management**: Secure session token handling
- **GDPR Compliance**: User data deletion and privacy controls

### API Security
- **Supabase Integration**: Row Level Security (RLS) policies
- **Edge Function Security**: Authenticated API calls only
- **Rate Limiting**: Prevent abuse and ensure fair usage
- **Content Filtering**: AI-generated content safety measures

## Deployment and Infrastructure

### Development Environment
- **Local Development**: Vite dev server with hot reload
- **Supabase Local**: Local backend development environment
- **Testing**: Comprehensive unit and integration testing

### Production Environment
- **Frontend Deployment**: Static site deployment via Lovable platform
- **Backend Services**: Supabase managed infrastructure
- **CDN Integration**: Global content delivery for optimal performance
- **Monitoring**: Real-time system health and performance monitoring

---

**Architecture Philosophy**: This architecture prioritizes user experience continuity above all else. Users always receive engaging content regardless of backend service availability, with clear communication about system status and seamless transitions between content sources.