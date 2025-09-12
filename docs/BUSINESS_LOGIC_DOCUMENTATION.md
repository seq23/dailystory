# Business Logic Documentation

## 🚨 CRITICAL: Edge Function Management

### Emergency Throttling Status
**ACTIVE** - Due to quota exceeded (2.98M invocations), emergency throttling implemented:
- All monitoring auto-refresh **DISABLED** by default
- Manual refresh controls added to all monitoring components  
- Polling intervals increased 5-10x when live updates enabled
- Expected 95% reduction in edge function usage

### Current Edge Function Usage Guidelines
1. **Default to manual refresh** for all monitoring features
2. **Enable live updates sparingly** - only when actively debugging
3. **Use conservative intervals** (5+ minutes) for auto-refresh when needed
4. **Monitor usage regularly** via Supabase dashboard to prevent future overages

## Core Business Model

### User Types and Capabilities

#### Guest Users (Free, Non-Paid)
- **Timer**: 20 minutes from page load
- **Story Access**: 6 pages per story (artificial cutoff)
- **Story Generation**: Netflix-style batch generation (10-12+ pages generated, only 6 visible)
- **Story Limitation**: Never see story endings (business decision to encourage upgrades)
- **Image Generation**: Fresh image per page (1-6), cached for backward navigation
- **Story Progression**: "Next Story" button appears on page 6
- **Cache Behavior**: Clears when starting new story or session ends
- **Timer Controls**: Can pause, reduce time, end session

#### Premium Users (Paid)
- **Timer**: Can dismiss timer, unlimited session time
- **Story Access**: Unlimited pages per story
- **Story Generation**: Live generation (1 page at a time)
- **Story Limitation**: No artificial limits, can continue indefinitely
- **Image Generation**: Fresh image per page, cached for backward navigation
- **Story Progression**: Can push "Finish Story" for AI ending, then continue with Part II/III
- **Cache Behavior**: Clears only on session end
- **Additional Features**: 
  - Save stories to library with all original images
  - Re-write stories using magic wand (clears cache, generates new content)

## Never-Ending Story System

### Core Principle
- **All stories are designed to be never-ending**
- **AI never naturally concludes stories** - always prepared to continue
- **Business differentiation**: Guests get artificial cutoff, Premium gets unlimited continuation

### Guest Story Flow
1. AI generates 10-12+ pages (Netflix-style)
2. User sees only pages 1-6
3. Page 6 shows "Next Story" button (not because story ended, but due to limit)
4. Cache clears → new story cycle begins
5. Process repeats until 20-minute timer expires

### Premium Story Flow
1. AI generates 1 page at a time (live generation)
2. User can continue indefinitely
3. "Finish Story" button available when USER chooses to end
4. Can continue with Part II/III after ending
5. Session continues until user dismisses timer

## Technical Architecture

### Story Generation Services

#### Netflix-Style Service (Guest Users)
- **File**: `src/services/NetflixStyleStoryService.ts`
- **Purpose**: Batch generation for guests
- **Expected Pages**: 12 (configured in validation-config.ts)
- **AI Generation**: Produces 10-12+ pages
- **Fallback**: Template service if AI fails
- **Validation**: UnifiedValidator with 'guest' mode

#### Live Generation Service (Premium Users) 
- **File**: `src/services/storyGenerationService.ts`
- **Purpose**: Page-by-page generation for premium
- **Expected Pages**: 999 (never-ending configuration)
- **AI Generation**: 1 page at a time
- **Fallback**: Emergency content if generation fails
- **Validation**: UnifiedValidator with 'live' mode

#### Template Service (Universal Fallback)
- **File**: `supabase/functions/template-service/`
- **Purpose**: Bulletproof fallback for both user types
- **Expected Pages**: Hardcoded 12-16 (difficulty dependent)
- **Independence**: No external dependencies on AI or validation configs
- **Content**: Pre-written, curated stories by difficulty level

### Image Generation Strategy

#### Consistency Rules
- **Forward Navigation**: Always generate fresh images
- **Backward Navigation**: Serve cached images (same visual experience)
- **Cache Clearing**: 
  - Guests: Clear on "Next Story" or session end
  - Premium: Clear on session end or story re-write

#### Generation Services
- **OpenAI DALL-E 3**: Primary for high-quality images
- **Runware Flux**: Secondary/fallback option
- **Caching**: Browser-based with story progression tracking

## Validation System

### Token Limits by Difficulty
```json
"Level0": { "perPage": 15, "guestStory": 150 },
"Level1": { "perPage": 60, "guestStory": 600 },
"Level2": { "perPage": 250, "guestStory": 2500 },
"Level3": { "perPage": 350, "guestStory": 3500 },
"Level4": { "perPage": 500, "guestStory": 5000 },
"Grade6-10": { "perPage": 500, "guestStory": 4000 }
```

### Critical Settings
- **Expected Pages**: 12 for all levels (ensures 8-12+ page generation)
- **Min Content Ratio**: 0.3 (prevents 1-page generation bug)
- **Validation Modes**: 'guest' (full story) vs 'live' (per page)

## User Experience Rules

### Page Display Logic
- **Guest Page 6**: Shows "Next Story" button (artificial business limit)
- **Premium Pages**: Show "Finish Story" when user wants to end
- **Navigation**: Backward always available, forward when content exists

### Timer Integration
- **Guest Timer**: 20 minutes, mandatory, cannot be dismissed
- **Premium Timer**: 20 minutes default, but can be dismissed for unlimited time
- **Timer Controls**: Pause/resume for both user types

### Cache Management
- **Story Cache**: Maintains page content and images
- **Clearing Triggers**:
  - Guest: New story request, session timeout
  - Premium: Session end, manual story re-write
  - Both: Browser refresh/reload

## Error Handling & Fallbacks

### AI Generation Failures
1. **Primary**: Attempt main AI service (GPT-4)
2. **Secondary**: Fallback to backup AI model
3. **Tertiary**: Template service (pre-written content)
4. **Emergency**: Minimal error content with user notification

### Image Generation Failures
1. **Primary**: OpenAI DALL-E 3
2. **Secondary**: Runware Flux models
3. **Fallback**: Default placeholder image
4. **Cache**: Serve previous successful image if available

### Service Degradation
- **Graceful Degradation**: System remains functional even with service failures
- **User Notification**: Clear messaging about temporary limitations
- **Automatic Recovery**: Retry mechanisms for transient failures

## Business Intelligence

### Key Metrics
- **Guest Conversion**: Track "Next Story" clicks vs upgrade actions
- **Premium Engagement**: Story length, continuation rate, save actions
- **Content Quality**: Validation success rates, user feedback
- **Technical Performance**: Generation times, failure rates, cache hit ratios

### A/B Testing Opportunities
- **Guest Page Limit**: Test 4, 6, or 8 page limits
- **Timer Duration**: Test 15, 20, or 25 minute limits
- **Upgrade Prompts**: Different messaging and timing
- **Content Difficulty**: Optimal challenge levels by age group

## Compliance & Safety

### Child Safety (COPPA)
- **Data Minimization**: Collect only essential user information
- **Parental Consent**: Required for users under 13
- **Content Filtering**: Age-appropriate story generation
- **Privacy Controls**: Limited data retention, secure processing

### Content Moderation
- **AI Safeguards**: Built-in content filtering in generation prompts
- **Template Curation**: Pre-reviewed content for fallback scenarios
- **User Reporting**: Mechanism for inappropriate content flagging
- **Automated Scanning**: Detect and prevent harmful content generation

## Configuration Management

### Environment-Specific Settings
- **Development**: Relaxed limits, verbose logging, debug monitoring enabled
- **Staging**: Production-like limits, moderate logging, limited monitoring
- **Production**: Strict limits, essential logging only, manual monitoring only

### Feature Flags
- **Premium Features**: Toggle advanced capabilities
- **Experimental Content**: A/B testing new story types  
- **Emergency Modes**: Fallback-only operation during incidents
- **Monitoring Controls**: Auto-refresh permissions, polling interval limits

### Current App Configuration
**Monitoring System**: Emergency throttling active
- `useAdvancedMonitoring`: Manual refresh, 5min intervals if enabled
- `AdvancedSystemStatus`: Manual refresh, 2min intervals if enabled
- `SecurityDashboard`: Manual refresh, 1min intervals if enabled
- `CacheInspectorPanel`: Manual refresh, 30sec intervals if enabled
- `UnifiedDebugMonitor`: Manual refresh only, no auto-polling
- `BackendTierChecker`: Manual refresh only, single mount check

**Session Management**: Enhanced cache control
- `resumeOnRefresh`: Disabled for both premium and guest users
- Cache clearing triggers optimized for reliability
- Session state persistence improved for stability

**Image Generation**: Dual-provider system
- Primary: Runware Flux (configurable models, optimized settings)
- Fallback: OpenAI DALL-E 3 (reliable backup)
- Provider priority: Runware → OpenAI → Placeholder

## Emergency Procedures

### Edge Function Quota Management
If approaching quota limits:
1. **Immediately disable** all auto-refresh features
2. **Switch to manual-only** monitoring
3. **Increase polling intervals** to maximum (5+ minutes)
4. **Monitor usage** via Supabase analytics dashboard
5. **Document changes** in emergency throttling documentation

### Service Degradation Protocol
1. **AI Generation Failure**: Fall back to template service
2. **Image Generation Failure**: Use cached images or placeholders
3. **Monitoring Failure**: Switch to manual debugging tools
4. **Database Issues**: Enable read-only mode, preserve user sessions

Last Updated: January 2025
Version: 3.0 (Emergency Throttling Edition)