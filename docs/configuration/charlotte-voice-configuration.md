# Charlotte Voice Configuration Guide

## Overview

This guide covers configuration options for the consolidated Phase 4 audio system, including **CharlotteVoiceService**, **useAudioControls** hook, and **UnifiedDebugMonitor**. All configurations are based on the current active implementation.

## CharlotteVoiceService Configuration

### Service Initialization

**CharlotteVoiceService** is initialized as a singleton and configured through environment variables and runtime options:

```typescript
// Service configuration (internal)
class CharlotteVoiceService {
  private config = {
    // TTS Provider Configuration
    tts: {
      primaryProvider: 'elevenlabs',
      fallbackProvider: 'openai',
      defaultVoice: 'Charlotte', // ElevenLabs voice ID: XB0fDUnXU5powFXDhCwa
      timeout: 15000, // 15 second timeout
      retryAttempts: 2
    },
    
    // Audio Configuration
    audio: {
      wordHighlighting: true,
      mobileOptimization: true,
      autoResume: true,
      bufferSize: 4096
    },
    
    // Session Management
    session: {
      freeUserLimit: 1200, // 20 minutes in seconds
      premiumUnlimited: true,
      trackUsage: true,
      persistSession: false // Clear on page refresh
    },
    
    // Content Validation
    content: {
      hashValidation: true,
      cacheAudio: true,
      sanitizeInput: true
    }
  };
}
```

### Environment Variables

Configure the service through environment variables in your **Supabase Edge Functions**:

```bash
# Required - ElevenLabs API Key
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Required - OpenAI API Key (fallback TTS)  
OPENAI_API_KEY=your_openai_api_key_here

# Optional - Custom voice configuration
CHARLOTTE_VOICE_ID=XB0fDUnXU5powFXDhCwa

# Optional - Performance tuning
TTS_TIMEOUT_MS=15000
TTS_RETRY_ATTEMPTS=2
AUDIO_BUFFER_SIZE=4096
```

### Runtime Configuration

Configure CharlotteVoiceService behavior at runtime:

```typescript
import { charlotteVoiceService } from '@/services/CharlotteVoiceService';

// Configure TTS settings
charlotteVoiceService.configure({
  defaultVoice: 'custom-voice-id',
  timeout: 20000, // 20 seconds
  enableFallback: true,
  mobileOptimization: true
});

// Configure session limits
charlotteVoiceService.setSessionLimits({
  freeUserLimit: 1800, // 30 minutes
  premiumUnlimited: true,
  trackUsage: true
});

// Configure content validation
charlotteVoiceService.setContentOptions({
  hashValidation: true,
  cacheAudio: true,
  sanitizeInput: true
});
```

## useAudioControls Hook Configuration

### Basic Configuration

Configure the **useAudioControls** hook with these options:

```typescript
interface UseAudioControlsOptions {
  // Required: Content to process
  text: string;
  
  // Required: User information for session management
  userInfo: SafeUserInfo;
  
  // Required: Page tracking for navigation
  currentPage: number;
  
  // Optional: Content validation hash
  contentHash?: string;
  
  // Optional: Difficulty level for word highlighting
  difficulty?: "beginner" | "easy" | "medium" | "hard" | "expert";
  
  // Optional: Premium status override
  isPremium?: boolean;
  
  // Optional: Custom voice selection
  voiceId?: string;
  
  // Optional: Session configuration
  sessionConfig?: {
    trackTime: boolean;
    persistProgress: boolean;
    enableVocabulary: boolean;
  };
  
  // Optional: Audio configuration  
  audioConfig?: {
    autoPlay: boolean;
    enableHighlighting: boolean;
    mobileOptimization: boolean;
  };
}
```

### Standard Story Page Configuration

Most common configuration for story pages:

```typescript
function StoryPage({ content, userInfo, currentPage }) {
  const audioControls = useAudioControls({
    text: content,
    userInfo,
    currentPage,
    
    // Standard configuration
    difficulty: "medium",
    isPremium: userInfo?.isPremium,
    contentHash: generateContentHash(content),
    
    // Optional session settings
    sessionConfig: {
      trackTime: true,
      persistProgress: false, // Clear on page refresh
      enableVocabulary: true
    },
    
    // Optional audio settings
    audioConfig: {
      autoPlay: false, // Require user interaction
      enableHighlighting: true,
      mobileOptimization: true
    }
  });
  
  return <StoryDisplay audioControls={audioControls} />;
}
```

### Advanced Learning Configuration

Configuration for educational content with enhanced vocabulary tracking:

```typescript
function LearningPage({ content, userInfo, currentPage, lessonData }) {
  const audioControls = useAudioControls({
    text: content,
    userInfo,
    currentPage,
    
    // Learning-focused configuration
    difficulty: lessonData.difficulty || "medium",
    isPremium: userInfo?.isPremium,
    voiceId: lessonData.voicePreference || 'Charlotte',
    
    // Enhanced session tracking
    sessionConfig: {
      trackTime: true,
      persistProgress: true, // Keep progress across sessions
      enableVocabulary: true
    },
    
    // Learning-optimized audio
    audioConfig: {
      autoPlay: false,
      enableHighlighting: true,
      mobileOptimization: true
    }
  });

  return <LearningContent audioControls={audioControls} />;
}
```

### Free User Configuration

Specific configuration for free users with session limits:

```typescript
function FreeUserStoryPage({ content, userInfo, currentPage }) {
  const audioControls = useAudioControls({
    text: content,
    userInfo,
    currentPage,
    
    // Free user settings
    difficulty: "easy", // Simpler highlighting for free tier
    isPremium: false,
    
    // Session management for free users
    sessionConfig: {
      trackTime: true, // Essential for free user limits
      persistProgress: false, // Don't persist to encourage upgrade
      enableVocabulary: false // Premium feature
    },
    
    // Basic audio functionality
    audioConfig: {
      autoPlay: false,
      enableHighlighting: true,
      mobileOptimization: true
    }
  });

  return (
    <div>
      <StoryDisplay audioControls={audioControls} />
      
      {/* Show remaining time for free users */}
      <FreeUserSessionTimer 
        remainingTime={audioControls.remainingTime}
        sessionUsed={audioControls.sessionTimeUsed}
      />
    </div>
  );
}
```

## Word Highlighting Configuration

### Difficulty-Based Highlighting

Configure word highlighting based on reading difficulty:

```typescript
const highlightingConfig = {
  beginner: {
    highlightAllWords: true,
    showPhonetics: true,
    slowPlayback: true,
    repeatWords: true
  },
  
  easy: {
    highlightAllWords: true,
    showPhonetics: false,
    slowPlayback: false,
    repeatWords: false
  },
  
  medium: {
    highlightAllWords: true,
    showPhonetics: false,
    slowPlayback: false,
    repeatWords: false
  },
  
  hard: {
    highlightAllWords: false, // Only difficult words
    showPhonetics: false,
    slowPlayback: false,
    repeatWords: false
  },
  
  expert: {
    highlightAllWords: false,
    showPhonetics: false,
    slowPlayback: false,
    repeatWords: false
  }
};

// Apply configuration through useAudioControls
const audioControls = useAudioControls({
  text: content,
  userInfo,
  currentPage,
  difficulty: userPreferences.readingLevel,
  // Highlighting config applied automatically based on difficulty
});
```

### Custom Highlighting Styles

Configure visual highlighting styles through CSS variables:

```css
/* In your CSS or Tailwind config */
:root {
  /* Highlighting colors */
  --highlight-color: hsl(var(--primary));
  --highlight-background: hsl(var(--primary) / 0.1);
  --highlight-border: hsl(var(--primary) / 0.3);
  
  /* Difficulty-based colors */
  --beginner-highlight: hsl(120, 100%, 50%); /* Green for beginners */
  --easy-highlight: hsl(180, 100%, 50%);     /* Cyan for easy */
  --medium-highlight: hsl(240, 100%, 50%);   /* Blue for medium */
  --hard-highlight: hsl(300, 100%, 50%);     /* Purple for hard */
  --expert-highlight: hsl(0, 100%, 50%);     /* Red for expert */
  
  /* Animation settings */
  --highlight-duration: 0.3s;
  --highlight-easing: ease-in-out;
}

.highlighted-word {
  background-color: var(--highlight-background);
  border: 1px solid var(--highlight-border);
  color: var(--highlight-color);
  border-radius: 4px;
  padding: 2px 4px;
  transition: all var(--highlight-duration) var(--highlight-easing);
}

/* Difficulty-specific highlighting */
.difficulty-beginner .highlighted-word {
  background-color: var(--beginner-highlight);
}

.difficulty-expert .highlighted-word {
  background-color: var(--expert-highlight);
}
```

## Mobile Audio Configuration

### iOS Configuration

Specific configuration for iOS audio context handling:

```typescript
const iOSAudioConfig = {
  // Audio Context Settings
  audioContext: {
    sampleRate: 44100,
    latencyHint: 'interactive',
    autoResume: true
  },
  
  // Interruption Handling
  interruptions: {
    handlePhoneCalls: true,
    resumeAfterInterruption: true,
    fadeOnInterruption: true
  },
  
  // Memory Management
  memory: {
    maxBufferSize: 2048, // Reduced for iOS
    clearOnBackground: true,
    preloadAudio: false // Load on demand
  },
  
  // User Gesture Requirements
  gestures: {
    requireUserGesture: true,
    showGesturePrompt: true,
    gestureMessage: "Tap to enable audio"
  }
};

// Apply iOS configuration
if (detectIOSDevice()) {
  charlotteVoiceService.configureMobile(iOSAudioConfig);
}
```

### Android Configuration

Android-specific audio optimizations:

```typescript
const androidAudioConfig = {
  // Audio Focus Management
  audioFocus: {
    requestFocus: true,
    focusType: 'AUDIOFOCUS_GAIN_TRANSIENT',
    abandonOnPause: true
  },
  
  // Performance Settings
  performance: {
    maxBufferSize: 4096, // Android can handle larger buffers
    preloadAudio: true,
    useWebAudioAPI: true
  },
  
  // Network Adaptation
  network: {
    adaptQuality: true,
    lowDataMode: false,
    preloadOnWifi: true
  }
};

// Apply Android configuration
if (detectAndroidDevice()) {
  charlotteVoiceService.configureMobile(androidAudioConfig);
}
```

## Debug Configuration

### UnifiedDebugMonitor Configuration

Configure the comprehensive debug interface:

```typescript
interface DebugConfig {
  // Display Options
  display: {
    showTTSStatus: boolean;
    showAudioTesting: boolean;  
    showWordTesting: boolean;
    showPerformanceMetrics: boolean;
    showEventLog: boolean;
  };
  
  // Testing Configuration
  testing: {
    defaultTestText: string;
    enableVoiceSelection: boolean;
    showAdvancedControls: boolean;
  };
  
  // Logging Configuration
  logging: {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enableNetworkLogs: boolean;
    enablePerformanceLogs: boolean;
  };
}

const debugConfig: DebugConfig = {
  display: {
    showTTSStatus: true,
    showAudioTesting: true,
    showWordTesting: true,
    showPerformanceMetrics: process.env.NODE_ENV === 'development',
    showEventLog: process.env.NODE_ENV === 'development'
  },
  
  testing: {
    defaultTestText: "The quick brown fox jumps over the lazy dog.",
    enableVoiceSelection: true,
    showAdvancedControls: process.env.NODE_ENV === 'development'
  },
  
  logging: {
    logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
    enableNetworkLogs: true,
    enablePerformanceLogs: true
  }
};

// Enable debug with configuration
function App() {
  const showDebug = new URLSearchParams(window.location.search).get('debug') === '1';
  
  return (
    <div>
      {/* Your app */}
      {showDebug && <UnifiedDebugMonitor config={debugConfig} />}
    </div>
  );
}
```

### Development vs Production Configuration

Configure different settings for development and production:

```typescript
const audioConfig = {
  development: {
    tts: {
      timeout: 30000, // Longer timeout for debugging
      retryAttempts: 5,
      enableFallback: true,
      logRequests: true
    },
    
    audio: {
      enableDebugging: true,
      showPerformanceMetrics: true,
      verboseLogging: true
    },
    
    session: {
      ignoreLimits: true, // Bypass limits in development
      trackUsage: false
    }
  },
  
  production: {
    tts: {
      timeout: 15000, // Standard timeout
      retryAttempts: 2,
      enableFallback: true,
      logRequests: false
    },
    
    audio: {
      enableDebugging: false,
      showPerformanceMetrics: false,
      verboseLogging: false
    },
    
    session: {
      ignoreLimits: false, // Enforce limits in production
      trackUsage: true
    }
  }
};

// Apply environment-specific configuration
const currentConfig = process.env.NODE_ENV === 'development' 
  ? audioConfig.development 
  : audioConfig.production;

charlotteVoiceService.configure(currentConfig);
```

## Voice Selection Configuration

### Available Voices

Configure voice options for different contexts:

```typescript
const voiceConfiguration = {
  // Primary voices
  primary: {
    charlotte: 'XB0fDUnXU5powFXDhCwa', // Default Charlotte voice
    narrator: 'pNInz6obpgDQGcFmaJgB',   // Alternative narrator
    friendly: 'EXAVITQu4vr4xnSDxMaL'    // Warm, friendly voice
  },
  
  // Context-specific voices
  contexts: {
    story: 'charlotte',      // Stories use Charlotte
    learning: 'friendly',    // Learning uses friendly voice
    conversation: 'charlotte' // Conversations use Charlotte
  },
  
  // User preference mapping
  userPreferences: {
    child: 'friendly',
    teen: 'charlotte', 
    adult: 'narrator'
  },
  
  // Fallback chain
  fallbacks: ['charlotte', 'friendly', 'narrator']
};

// Apply voice selection
function selectVoiceForContext(context: string, userAge?: number) {
  let selectedVoice = voiceConfiguration.contexts[context];
  
  // Override based on user preferences
  if (userAge) {
    if (userAge < 13) selectedVoice = voiceConfiguration.userPreferences.child;
    else if (userAge < 18) selectedVoice = voiceConfiguration.userPreferences.teen;
    else selectedVoice = voiceConfiguration.userPreferences.adult;
  }
  
  return voiceConfiguration.primary[selectedVoice] || voiceConfiguration.primary.charlotte;
}
```

## Performance Configuration

### Caching Configuration

Configure audio caching for improved performance:

```typescript
const cachingConfig = {
  // Audio Cache Settings
  audio: {
    maxSize: 50 * 1024 * 1024, // 50MB cache
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    compression: true,
    storage: 'indexedDB' // or 'localStorage'
  },
  
  // Content Hash Cache
  contentHash: {
    maxEntries: 1000,
    storage: 'sessionStorage',
    expiry: 60 * 60 * 1000 // 1 hour
  },
  
  // Vocabulary Cache
  vocabulary: {
    maxEntries: 5000,
    storage: 'localStorage',
    persistent: true
  }
};

// Configure caching
charlotteVoiceService.configureCaching(cachingConfig);
```

### Network Configuration

Configure network behavior and fallbacks:

```typescript
const networkConfig = {
  // Request Configuration
  requests: {
    timeout: 15000,
    retryAttempts: 2,
    retryDelay: 1000, // Start with 1 second
    maxRetryDelay: 8000, // Max 8 seconds
    backoffMultiplier: 2 // Exponential backoff
  },
  
  // Quality Adaptation
  qualityAdaptation: {
    enabled: true,
    slowConnectionThreshold: 500, // 500ms
    lowQualityFallback: true,
    compressionLevel: 'auto'
  },
  
  // Offline Handling
  offline: {
    detectOffline: true,
    fallbackToCache: true,
    showOfflineMessage: true,
    queueRequestsWhenOffline: true
  }
};

// Apply network configuration
charlotteVoiceService.configureNetwork(networkConfig);
```

This comprehensive configuration guide ensures optimal performance and user experience across all devices and usage scenarios.