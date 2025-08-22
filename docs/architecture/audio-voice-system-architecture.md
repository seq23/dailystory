# Audio and Voice System Architecture

## Overview

The audio and voice system is a sophisticated multi-layered architecture designed for reliable text-to-speech, voice commands, and synchronized audio playback across web and mobile platforms.

## Core Architecture Components

### Audio Engines

#### SimplifiedAudioEngine (Primary)
- **Location**: `src/services/SimplifiedAudioEngine.ts`
- **Purpose**: Main audio engine with ElevenLabs synchronized TTS
- **Features**:
  - Word-level timing synchronization
  - Mobile audio unlocking
  - Fallback to Web Speech API
  - Audio focus management
  - Content hash validation

#### SimpleAudioEngine (Legacy)
- **Location**: `src/services/SimpleAudioEngine.ts`
- **Purpose**: Basic audio playback engine
- **Status**: Maintained for compatibility

#### MobileAudioManager
- **Location**: `src/services/mobileAudioManager.ts`
- **Purpose**: Mobile-specific audio optimizations
- **Features**:
  - iOS/Android audio context handling
  - Interruption management
  - Low power mode detection
  - Network quality adaptation

### Audio Coordination Layer

#### SimpleAudioCoordinator
- **Location**: `src/services/simpleAudioCoordinator.ts`
- **Purpose**: Prevents audio conflicts between systems
- **Features**:
  - Audio focus arbitration
  - System priority management
  - Event-driven coordination
  - Graceful fallbacks

### TTS Services

#### SynchronizedElevenLabsTTS
- **Location**: `src/services/SynchronizedElevenLabsTTS.ts`
- **Purpose**: ElevenLabs TTS with word-level timing
- **Features**:
  - Character-to-word timing conversion
  - Fallback timing generation
  - Context-aware generation (conversation vs learning)

#### SmartElevenLabsTTS
- **Location**: `src/services/smartElevenLabsTTS.ts`
- **Purpose**: Context-aware TTS with pronunciation dictionary
- **Features**:
  - Learning context optimization
  - Pronunciation dictionary integration
  - Adaptive quality settings

### Voice Command Systems

#### ElevenLabs Conversational AI (Primary)
- **Integration**: `@11labs/react` package
- **Purpose**: Main voice assistant ("Charlotte")
- **Features**:
  - Real-time conversation
  - Tool calling capabilities
  - Client-side function execution
  - Signed URL authentication

#### OpenAI Realtime API (Fallback)
- **Location**: `src/hooks/useOpenAIRealtimeChat.ts`
- **Purpose**: Backup voice command system
- **Features**:
  - WebSocket-based communication
  - Audio recording and playback
  - Function calling support
  - Automatic fallback activation

### Audio Components

#### Audio Controls
- **SynchronizedAudioControls**: `src/components/SynchronizedAudioControls.tsx`
- **AudioControls**: `src/components/AudioControls.tsx`
- **Features**:
  - Play/stop/retry functionality
  - Loading states and error handling
  - Word highlighting coordination
  - Mobile optimization

#### Status and Feedback
- **AudioStatusIndicator**: `src/components/AudioStatusIndicator.tsx`
- **AudioFallbackNotification**: `src/components/AudioFallbackNotification.tsx`
- **VoiceCommandIntegration**: `src/components/VoiceCommandIntegration.tsx`

## System Flow Diagrams

### Primary Audio Flow
```
User Request → SimplifiedAudioEngine → SynchronizedElevenLabsTTS → Edge Function → ElevenLabs API
                       ↓
Audio Response ← Audio Processing ← Base64 Audio ← TTS Response
                       ↓
Word Highlighting ← Timing Sync ← Audio Playback
```

### Voice Command Flow
```
User Speech → ElevenLabs Agent → Tool Execution → Audio Response
                    ↓ (fallback)
            OpenAI Realtime API → Function Calls → Audio Response
```

### Audio Coordination Flow
```
System A Request → SimpleAudioCoordinator → Priority Check → Grant/Deny
System B Request → Audio Focus Manager → Queue/Interrupt → Status Update
```

## Mobile Architecture

### Audio Context Management
- Automatic audio context resumption
- User gesture requirement handling
- Platform-specific optimizations

### Interruption Handling
- Phone calls and notifications
- Background/foreground transitions
- Memory pressure responses

### Network Adaptation
- Quality adjustment based on connection
- Offline fallback capabilities
- Bandwidth monitoring

## Security Architecture

### API Key Management
- Supabase Edge Function proxy
- Environment variable isolation
- Signed URL generation for agents

### Content Validation
- Input sanitization
- Content hash verification
- Rate limiting and abuse prevention

## Performance Optimizations

### Caching Strategy
- Audio content caching
- Timing data persistence
- Dictionary preloading

### Resource Management
- Memory cleanup on navigation
- Audio buffer optimization
- Connection pooling

## Error Handling and Fallbacks

### TTS Fallbacks
1. ElevenLabs API (Primary)
2. Web Speech API (Fallback)
3. Text display (Ultimate fallback)

### Voice Command Fallbacks
1. ElevenLabs Agent (Primary)
2. OpenAI Realtime API (Secondary)
3. Text input (Ultimate fallback)

### Network Failure Handling
- Automatic retry with exponential backoff
- Offline mode detection
- Graceful degradation

## Integration Points

### External Services
- ElevenLabs TTS API
- ElevenLabs Conversational AI
- OpenAI Realtime API
- Supabase Edge Functions

### Internal Systems
- React Router navigation
- UI state management
- Word highlighting system
- Mobile platform features

## Monitoring and Observability

### Metrics Collection
- Audio generation latency
- Success/failure rates
- Network performance
- User engagement metrics

### Logging Strategy
- Structured logging for debugging
- Performance tracking
- Error aggregation
- User journey tracking

## Future Architecture Considerations

### Scalability
- Multi-region deployment
- CDN integration for audio assets
- Database scaling for user preferences

### Extensibility
- Plugin architecture for new TTS providers
- Modular voice command systems
- Theme-aware audio configurations

### Compliance
- Accessibility standards (WCAG)
- Privacy regulations (GDPR, CCPA)
- Platform store requirements