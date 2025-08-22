# Audio and Voice Configuration Guide

## Overview

This guide covers all configuration options for the audio and voice system, including environment variables, service settings, voice selections, quality parameters, and security configurations.

## Environment Variables and Secrets

### Required API Keys (Supabase Secrets)

#### ElevenLabs Configuration
```bash
# ElevenLabs API Key (Required)
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here

# ElevenLabs Agent ID (Optional - falls back to default)
ELEVENLABS_AGENT_ID=your-agent-id-here

# ElevenLabs Voice ID (Optional - defaults to Charlotte)
ELEVENLABS_DEFAULT_VOICE_ID=XB0fDUnXU5powFXDhCwa
```

#### OpenAI Configuration
```bash
# OpenAI API Key (Required for fallback)
OPENAI_API_KEY=your-openai-api-key-here

# OpenAI Model (Optional - defaults to gpt-4o-realtime-preview-2024-12-17)
OPENAI_REALTIME_MODEL=gpt-4o-realtime-preview-2024-12-17
```

#### Supabase Configuration
```bash
# Supabase URL (Auto-configured in Lovable)
SUPABASE_URL=your-project-url

# Supabase Anon Key (Auto-configured in Lovable)
SUPABASE_ANON_KEY=your-anon-key

# Supabase Service Role Key (For edge functions)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### How to Set Secrets in Supabase

1. **Via Supabase Dashboard:**
   ```
   Settings → Edge Functions → Environment Variables
   Add each key-value pair
   ```

2. **Via Supabase CLI:**
   ```bash
   supabase secrets set ELEVENLABS_API_KEY=your-key-here
   supabase secrets set OPENAI_API_KEY=your-key-here
   ```

3. **Via Lovable Interface:**
   Use the secrets management tool to securely add API keys.

## Audio Engine Configuration

### SimplifiedAudioEngine Settings

#### Default Configuration
```typescript
// src/config/audioConfig.ts
export const audioEngineConfig = {
  // Playback settings
  defaultVoice: 'XB0fDUnXU5powFXDhCwa', // Charlotte
  defaultModel: 'eleven_turbo_v2',
  defaultContext: 'learning' as const,
  
  // Performance settings
  maxConcurrentStreams: 1,
  bufferSize: 4096,
  sampleRate: 24000,
  
  // Timeout settings
  generationTimeout: 30000, // 30 seconds
  networkTimeout: 10000,    // 10 seconds
  
  // Retry settings
  maxRetries: 3,
  retryDelay: 1000,         // 1 second
  exponentialBackoff: true,
  
  // Mobile optimizations
  mobile: {
    bufferSize: 2048,
    maxConcurrentStreams: 1,
    enableCompression: true,
    adaptiveQuality: true
  },
  
  // Fallback settings
  enableWebSpeechFallback: true,
  webSpeechSettings: {
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    lang: 'en-US'
  }
};
```

#### Runtime Configuration
```typescript
// Configuring the audio engine at runtime
const audioEngine = SimplifiedAudioEngine.getInstance();

// Override default settings
audioEngine.configure({
  voice: 'pNInz6obpgDQGcFmaJgB', // Adam
  model: 'eleven_multilingual_v2',
  context: 'conversation',
  quality: 'high'
});
```

### MobileAudioManager Configuration

#### Mobile-Specific Settings
```typescript
// src/config/mobileAudioConfig.ts
export const mobileAudioConfig = {
  // iOS Configuration
  ios: {
    audioFormat: 'aac',
    bufferSize: 2048,
    sampleRate: 22050,
    enableBackgroundAudio: false,
    interruptionHandling: true,
    audioSessionCategory: 'playback'
  },
  
  // Android Configuration
  android: {
    audioFormat: 'opus',
    bufferSize: 1024,
    sampleRate: 22050,
    enableLowLatency: true,
    memoryOptimization: true,
    powerOptimization: true
  },
  
  // Network Adaptation
  networkAdaptation: {
    enabled: true,
    qualityLevels: {
      high: { bitrate: 128, format: 'mp3' },
      medium: { bitrate: 96, format: 'aac' },
      low: { bitrate: 64, format: 'opus' }
    },
    adaptationThresholds: {
      highQuality: 1000,    // < 1s response time
      mediumQuality: 3000,  // 1-3s response time
      lowQuality: Infinity  // > 3s response time
    }
  },
  
  // Battery Optimization
  batteryOptimization: {
    enabled: true,
    lowBatteryThreshold: 0.2,
    criticalBatteryThreshold: 0.1,
    lowBatteryActions: {
      reduceBitrate: true,
      disableEffects: true,
      limitConcurrency: true
    }
  }
};
```

#### Device Detection and Optimization
```typescript
export const deviceOptimizationConfig = {
  // Low-end device detection
  lowEndDevice: {
    maxConcurrency: 2,
    maxMemoryGB: 2,
    enabledOptimizations: [
      'aggressiveCaching',
      'compressionEnabled',
      'reducedBufferSize'
    ]
  },
  
  // High-end device settings
  highEndDevice: {
    maxConcurrency: 4,
    minMemoryGB: 4,
    enabledFeatures: [
      'highQualityAudio',
      'advancedEffects',
      'preloadingEnabled'
    ]
  }
};
```

## Voice Service Configuration

### ElevenLabs Voice Settings

#### Available Voices and Characteristics
```typescript
export const elevenLabsVoices = {
  // Primary voices
  charlotte: {
    id: 'XB0fDUnXU5powFXDhCwa',
    name: 'Charlotte',
    gender: 'female',
    accent: 'american',
    age: 'young_adult',
    description: 'Warm, educational, perfect for learning content',
    recommended_for: ['learning', 'children', 'educational']
  },
  
  adam: {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    gender: 'male',
    accent: 'american',
    age: 'middle_aged',
    description: 'Deep, narrative voice, great for storytelling',
    recommended_for: ['storytelling', 'narration', 'conversation']
  },
  
  aria: {
    id: '9BWtsMINqrJLrRacOk9x',
    name: 'Aria',
    gender: 'female',
    accent: 'american',
    age: 'young_adult',
    description: 'Clear, professional voice for formal content',
    recommended_for: ['professional', 'news', 'formal']
  },
  
  // Additional voices...
  callum: { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum' },
  charlie: { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie' },
  george: { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George' },
  liam: { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam' },
  matilda: { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda' }
};
```

#### Model Configuration
```typescript
export const elevenLabsModels = {
  // High quality, slower generation
  multilingual_v2: {
    id: 'eleven_multilingual_v2',
    name: 'Multilingual v2',
    languages: 29,
    quality: 'highest',
    latency: 'high',
    use_case: 'content_creation'
  },
  
  // Balanced quality and speed
  turbo_v2: {
    id: 'eleven_turbo_v2',
    name: 'Turbo v2',
    languages: 1, // English only
    quality: 'high',
    latency: 'low',
    use_case: 'real_time'
  },
  
  // Fastest, multilingual
  turbo_v2_5: {
    id: 'eleven_turbo_v2_5',
    name: 'Turbo v2.5',
    languages: 32,
    quality: 'high',
    latency: 'lowest',
    use_case: 'real_time_multilingual'
  }
};
```

#### Context-Aware Settings
```typescript
export const contextualSettings = {
  learning: {
    model: 'eleven_turbo_v2',
    voice: 'XB0fDUnXU5powFXDhCwa', // Charlotte
    stability: 0.7,
    similarity_boost: 0.8,
    style: 0.0,
    use_speaker_boost: true,
    pronunciation_dictionary: 'charlotte-learning-lexicon'
  },
  
  conversation: {
    model: 'eleven_turbo_v2_5',
    voice: 'XB0fDUnXU5powFXDhCwa', // Charlotte
    stability: 0.5,
    similarity_boost: 0.7,
    style: 0.2,
    use_speaker_boost: false
  },
  
  storytelling: {
    model: 'eleven_multilingual_v2',
    voice: 'pNInz6obpgDQGcFmaJgB', // Adam
    stability: 0.8,
    similarity_boost: 0.9,
    style: 0.3,
    use_speaker_boost: true
  }
};
```

### OpenAI Realtime Configuration

#### Model and Voice Settings
```typescript
export const openAIRealtimeConfig = {
  model: 'gpt-4o-realtime-preview-2024-12-17',
  
  // Voice options
  voices: {
    alloy: { gender: 'neutral', tone: 'balanced' },
    echo: { gender: 'male', tone: 'clear' },
    fable: { gender: 'male', tone: 'warm' },
    onyx: { gender: 'male', tone: 'deep' },
    nova: { gender: 'female', tone: 'energetic' },
    shimmer: { gender: 'female', tone: 'soft' }
  },
  
  defaultVoice: 'alloy',
  
  // Audio settings
  inputAudioFormat: 'pcm16',
  outputAudioFormat: 'pcm16',
  inputAudioTranscription: {
    model: 'whisper-1'
  },
  
  // Turn detection
  turnDetection: {
    type: 'server_vad',
    threshold: 0.5,
    prefix_padding_ms: 300,
    silence_duration_ms: 1000
  },
  
  // Response settings
  temperature: 0.8,
  max_response_output_tokens: 'inf',
  tool_choice: 'auto'
};
```

#### Session Configuration
```typescript
export const sessionConfig = {
  modalities: ['text', 'audio'],
  instructions: `You are Charlotte, a helpful learning companion. You assist with reading content, answering questions, and providing educational support. You can:

1. Play and control audio content
2. Navigate between pages  
3. Help with word pronunciations and definitions
4. Answer questions about the content
5. Provide vocabulary assistance

Always be encouraging, patient, and educational in your responses.`,
  
  // Function definitions for tool calling
  tools: [
    {
      type: 'function',
      name: 'play_content',
      description: 'Play the current page content as audio',
      parameters: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Text to read aloud' },
          voice: { type: 'string', description: 'Voice ID to use' }
        },
        required: ['text']
      }
    },
    // Additional tool definitions...
  ]
};
```

## Quality and Performance Settings

### Audio Quality Configuration
```typescript
export const audioQualityConfig = {
  // Quality presets
  presets: {
    maximum: {
      bitrate: 320,
      sampleRate: 48000,
      format: 'mp3',
      compression: 'none'
    },
    high: {
      bitrate: 192,
      sampleRate: 44100,
      format: 'mp3',
      compression: 'light'
    },
    medium: {
      bitrate: 128,
      sampleRate: 22050,
      format: 'aac',
      compression: 'medium'
    },
    low: {
      bitrate: 64,
      sampleRate: 22050,
      format: 'opus',
      compression: 'high'
    },
    minimum: {
      bitrate: 32,
      sampleRate: 16000,
      format: 'opus',
      compression: 'maximum'
    }
  },
  
  // Automatic quality selection
  autoQualitySelection: {
    enabled: true,
    factors: {
      networkSpeed: 0.4,
      deviceCapability: 0.3,
      batteryLevel: 0.2,
      userPreference: 0.1
    }
  },
  
  // Adaptive streaming
  adaptiveStreaming: {
    enabled: true,
    chunkSize: 4096,
    bufferSize: 8192,
    preloadChunks: 2
  }
};
```

### Performance Tuning
```typescript
export const performanceConfig = {
  // Memory management
  memory: {
    maxCacheSize: 100 * 1024 * 1024, // 100MB
    cacheTTL: 30 * 60 * 1000,        // 30 minutes
    enableLRUEviction: true,
    gcThreshold: 0.8                 // Trigger cleanup at 80% usage
  },
  
  // Connection pooling
  connectionPooling: {
    enabled: true,
    maxConnections: 5,
    connectionTimeout: 10000,
    keepAliveTimeout: 30000
  },
  
  // Request batching
  requestBatching: {
    enabled: true,
    batchSize: 3,
    batchTimeout: 100 // ms
  },
  
  // Preloading strategy
  preloading: {
    enabled: true,
    preloadNext: 2,     // Preload next 2 pages
    preloadPrevious: 1, // Preload previous 1 page
    maxPreloadSize: 50 * 1024 * 1024 // 50MB limit
  }
};
```

## Security Configuration

### API Security Settings
```typescript
export const securityConfig = {
  // API key management
  apiKeys: {
    rotationInterval: 90 * 24 * 60 * 60 * 1000, // 90 days
    encryptionEnabled: true,
    serverSideOnly: true
  },
  
  // Request validation
  requestValidation: {
    enableInputSanitization: true,
    maxTextLength: 5000,
    allowedCharacters: /^[\w\s.,!?;:'"-]+$/,
    rateLimit: {
      requests: 100,
      windowMs: 15 * 60 * 1000 // 15 minutes
    }
  },
  
  // Content filtering
  contentFiltering: {
    enabled: true,
    filterProfanity: true,
    filterPersonalInfo: true,
    customFilters: [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
      /\b\d{16}\b/             // Credit card pattern  
    ]
  },
  
  // CORS settings
  cors: {
    allowedOrigins: [
      'https://your-domain.com',
      'https://your-staging.com'
    ],
    allowedMethods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: [
      'authorization',
      'x-client-info', 
      'apikey',
      'content-type'
    ]
  }
};
```

### Authentication Configuration
```typescript
export const authConfig = {
  // JWT settings
  jwt: {
    enabled: true,
    algorithm: 'HS256',
    expiresIn: '1h',
    issuer: 'your-app-name'
  },
  
  // Session management
  sessions: {
    maxDuration: 24 * 60 * 60 * 1000, // 24 hours
    refreshThreshold: 5 * 60 * 1000,  // 5 minutes
    enableRefresh: true
  },
  
  // User permissions
  permissions: {
    roles: {
      user: ['read', 'voice_commands'],
      premium: ['read', 'voice_commands', 'advanced_features'],
      admin: ['read', 'voice_commands', 'advanced_features', 'manage']
    },
    
    features: {
      tts_generation: ['user', 'premium', 'admin'],
      voice_commands: ['premium', 'admin'],
      pronunciation_dictionary: ['premium', 'admin'],
      advanced_voices: ['premium', 'admin']
    }
  }
};
```

## Development and Testing Configuration

### Development Settings
```typescript
export const developmentConfig = {
  // Debug settings
  debug: {
    enabled: process.env.NODE_ENV === 'development',
    verboseLogging: true,
    showPerformanceMetrics: true,
    enableDevTools: true
  },
  
  // Mock services
  mockServices: {
    enabled: false, // Set to true for offline development
    mockResponses: {
      tts: 'mock-audio-data-base64',
      voice: 'mock-voice-response'
    }
  },
  
  // Hot reloading
  hotReload: {
    enabled: true,
    watchPaths: [
      'src/services/',
      'src/components/',
      'src/hooks/'
    ]
  }
};
```

### Testing Configuration
```typescript
export const testingConfig = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Mock configurations
  mocks: {
    audioContext: true,
    webSpeech: true,
    mediaDevices: true,
    supabaseFunctions: true
  },
  
  // Test data
  testData: {
    sampleTexts: [
      'Short test text',
      'Medium length test text for audio generation testing',
      'Very long test text that spans multiple sentences and includes various punctuation marks, numbers like 123, and different word types to thoroughly test the text-to-speech functionality.'
    ],
    sampleVoices: ['XB0fDUnXU5powFXDhCwa', 'pNInz6obpgDQGcFmaJgB'],
    mockAudioData: 'UklGRnoGAABXQVZF...' // Base64 encoded audio
  },
  
  // Performance thresholds
  performanceThresholds: {
    ttsGeneration: 3000,  // 3 seconds max
    audioLoad: 1000,      // 1 second max
    voiceResponse: 2000   // 2 seconds max
  }
};
```

## Configuration Management

### Dynamic Configuration Updates
```typescript
class ConfigurationManager {
  private config: any;
  private subscribers: Array<(config: any) => void> = [];
  
  constructor(initialConfig: any) {
    this.config = initialConfig;
  }
  
  updateConfig(updates: Partial<any>) {
    this.config = { ...this.config, ...updates };
    this.notifySubscribers();
  }
  
  getConfig(key?: string) {
    return key ? this.config[key] : this.config;
  }
  
  subscribe(callback: (config: any) => void) {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }
  
  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.config));
  }
}

// Global configuration instance
export const configManager = new ConfigurationManager({
  ...audioEngineConfig,
  ...mobileAudioConfig,
  ...elevenLabsVoices,
  ...performanceConfig,
  ...securityConfig
});
```

### Environment-Specific Configurations
```typescript
// src/config/index.ts
export const getConfig = () => {
  const env = process.env.NODE_ENV;
  
  const baseConfig = {
    ...audioEngineConfig,
    ...mobileAudioConfig,
    ...performanceConfig
  };
  
  switch (env) {
    case 'development':
      return { ...baseConfig, ...developmentConfig };
      
    case 'test':
      return { ...baseConfig, ...testingConfig };
      
    case 'production':
      return { 
        ...baseConfig,
        debug: { enabled: false },
        mockServices: { enabled: false }
      };
      
    default:
      return baseConfig;
  }
};
```

This comprehensive configuration guide ensures proper setup and customization of all audio and voice system components across different environments and use cases.