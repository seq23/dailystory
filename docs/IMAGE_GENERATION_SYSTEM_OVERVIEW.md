# Image Generation System Overview

## System Architecture

The image generation system uses a simple 3-tier fallback architecture to guarantee 100% image generation success for all users, regardless of subscription status.

### Core Principle: Universal Tier 1 Access

**All users start with Tier 1 images** - subscription status does not affect image quality, only additional features like story library and unlimited sessions.

## Architecture Flow

```
Frontend (SimpleImageService) 
    ↓
Main Orchestrator (runware-generate-image)
    ↓
Tier 1: AI Visual Scene Creator (ai-visual-scene-creator)
    ↓ (on failure)
Tier 2.5: Template Fallback (runware-simple-fallback)
    ↓ (on failure)
Tier 4: SVG Placeholder (embedded in frontend)
```

### Emergency Fallback

If the main orchestrator fails completely, the frontend attempts Tier 2.5 directly.

## Tier Details

### Tier 1: AI-Enhanced Premium
- **Function**: `ai-visual-scene-creator`
- **Success Rate**: ~85-90%
- **Technology**: OpenAI + Runware API with character consistency
- **Quality**: Highest - AI-generated images with scene analysis
- **Available To**: All users (guest and premium)

### Tier 2.5: Nuclear Template Fallback  
- **Success Rate**: ~95-99%
- **Technology**: Template-based generation with split architecture
- **Quality**: High - Reliable template-based images

#### Tier 2.5A: Template with Shared Services  
- **Function**: `runware-template-simple`
- **Dependencies**: CharacterService, SessionManager (shared services)
- **Complexity**: A, B (basic to moderate templates)
- **Features**: Character consistency + session management

#### Tier 2.5B-D: Nuclear Independence Templates
- **Function**: `runware-template-advanced`  
- **Dependencies**: ZERO (nuclear independence)
- **Complexity**: C, D (advanced to emergency templates)
- **Features**: Self-contained template system

### Tier 4: SVG Placeholder
- **Function**: Embedded in `SimpleImageService.ts`
- **Success Rate**: 100%
- **Technology**: Local SVG generation
- **Quality**: Basic - Story-themed placeholder
- **Guarantee**: Never fails

## Key Features

### Character Consistency
- **Database-backed**: Characters persist across pages using consistent seed values
- **Cultural Intelligence**: Appropriate representation based on user avatar
- **Session Management**: Character data maintained throughout story sessions

### Session Management
- **Unique Session IDs**: Track story progression and character consistency
- **Cache Management**: Images cached per session for backward navigation
- **State Persistence**: Visual details and character data stored in database

### Quality Assurance
- **Tier Progression**: Automatic fallback on failure
- **Request Correlation**: Unique request IDs track processing across all tiers
- **Performance Monitoring**: Success rates and latency tracked per tier

## Business Logic

### All Users Policy
- Everyone starts with Tier 1 generation
- No artificial quality restrictions
- Premium features are additive (library, unlimited time, etc.)

### Story Types
- **Guest Users**: Netflix-style batch generation (6 pages), then "Next Story"
- **Premium Users**: Live page-by-page generation with unlimited continuation

### Cache Behavior
- **Navigation**: Backward navigation shows cached images
- **Session End**: Cache cleared when session ends
- **Story Reset**: Cache cleared when starting new story

## Success Guarantees

- **Tier 1**: 85-90% success with highest quality
- **Tier 2.5**: 95-99% success with reliable quality  
- **Tier 4**: 100% success with basic quality
- **Overall System**: 100% success guaranteed

The system prioritizes reliability and consistent user experience while maximizing image quality for all users.