# Voice Command Architecture

## Overview

The voice command system provides natural language interaction through multiple AI providers with intelligent fallback mechanisms and comprehensive tool calling capabilities.

## System Architecture

### Primary Voice Assistant: ElevenLabs Conversational AI

#### Agent Configuration
- **Agent Name**: Charlotte (Learning Companion)
- **Voice**: Charlotte (XB0fDUnXU5powFXDhCwa)
- **Capabilities**: 
  - Real-time conversation
  - Client-side tool execution
  - Context-aware responses
  - Audio playback control

#### Integration Components
```javascript
// Main integration hook
useConversation({
  clientTools: {
    // Audio controls
    play: async (params) => SimplifiedAudioEngine.playTextWithSynchronization(params),
    stop: () => SimplifiedAudioEngine.stop(),
    
    // Navigation
    next: () => dispatchEvent(new CustomEvent('navigation:next')),
    previous: () => dispatchEvent(new CustomEvent('navigation:previous')),
    
    // Word assistance
    wordHelp: (params) => InteractiveWordAudioService.explainWord(params.word),
    hearWord: (params) => InteractiveWordAudioService.hearWord(params.word),
    syllableWord: (params) => InteractiveWordAudioService.syllableWord(params.word)
  },
  
  // Event handlers
  onConnect: () => dispatchVoiceStatusUpdate('connected'),
  onDisconnect: () => dispatchVoiceStatusUpdate('disconnected'),
  onMessage: (message) => handleVoiceMessage(message)
});
```

### Fallback Voice Assistant: OpenAI Realtime API

#### WebSocket Integration
```javascript
// Connection setup
const ws = new WebSocket(`wss://project-id.functions.supabase.co/functions/v1/openai-realtime`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'response.audio.delta':
      handleAudioDelta(data.delta);
      break;
    case 'response.function_call_arguments.done':
      executeFunction(data.call_id, JSON.parse(data.arguments));
      break;
  }
};
```

#### Audio Processing
```javascript
// PCM audio encoding for real-time transmission
const encodeAudioForAPI = (float32Array) => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  const uint8Array = new Uint8Array(int16Array.buffer);
  return btoa(String.fromCharCode(...uint8Array));
};
```

## Voice Command Categories

### Audio Control Commands
```javascript
const audioCommands = {
  // Playback control
  play: async ({ text, voice, contentHash }) => {
    await SimplifiedAudioEngine.getInstance().playTextWithSynchronization({
      text,
      voiceId: voice || 'XB0fDUnXU5powFXDhCwa',
      onWordHighlight: (wordIndex) => highlightWord(wordIndex)
    });
    return "Started playing the content";
  },
  
  stop: () => {
    SimplifiedAudioEngine.getInstance().stop();
    return "Stopped audio playback";
  },
  
  pause: () => {
    SimplifiedAudioEngine.getInstance().stop();
    return "Paused audio playback";
  }
};
```

### Navigation Commands
```javascript
const navigationCommands = {
  next: () => {
    window.dispatchEvent(new CustomEvent('navigation:next'));
    return "Navigated to next page";
  },
  
  previous: () => {
    window.dispatchEvent(new CustomEvent('navigation:previous'));
    return "Navigated to previous page";
  }
};
```

### Word Assistance Commands
```javascript
const wordCommands = {
  wordHelp: async ({ word }) => {
    const contextualWord = getContextualWord(word);
    await InteractiveWordAudioService.explainWord(contextualWord);
    return `Explained the word: ${contextualWord}`;
  },
  
  hearWord: async ({ word }) => {
    const contextualWord = getContextualWord(word);
    await InteractiveWordAudioService.hearWord(contextualWord);
    return `Pronounced the word: ${contextualWord}`;
  },
  
  syllableWord: async ({ word }) => {
    const contextualWord = getContextualWord(word);
    await InteractiveWordAudioService.syllableWord(contextualWord);
    return `Broke down syllables for: ${contextualWord}`;
  }
};
```

## Authentication and Security

### ElevenLabs Agent Authentication
```javascript
// Signed URL generation
const getAgentSignedUrl = async (agentId) => {
  const { data, error } = await supabase.functions.invoke('elevenlabs-agent-signed-url', {
    body: { agentId }
  });
  
  if (error) throw new Error(`Authentication failed: ${error.message}`);
  return data.signed_url;
};

// Secure session initiation
const startVoiceSession = async () => {
  try {
    const signedUrl = await getAgentSignedUrl(AGENT_ID);
    await conversation.startSession({ url: signedUrl });
  } catch (error) {
    console.error('Voice session failed:', error);
    activateFallbackVoiceSystem();
  }
};
```

### OpenAI Authentication
```javascript
// Edge function proxy for secure API access
// No client-side API keys - all requests proxied through Supabase
const openaiEndpoint = `wss://project-id.functions.supabase.co/functions/v1/openai-realtime`;
```

## Context and State Management

### Global Context Resolution
```javascript
const getContextualWord = (providedWord) => {
  // Priority order for word resolution
  if (providedWord) return providedWord;
  
  // Check global context
  const globalContext = window.voiceCommandContext;
  if (globalContext?.hoveredWord) return globalContext.hoveredWord;
  if (globalContext?.lastSelectedWord) return globalContext.lastSelectedWord;
  
  // Fallback to current page context
  return getCurrentPageWord();
};
```

### Voice Session State
```javascript
const VoiceSessionState = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected', 
  LISTENING: 'listening',
  SPEAKING: 'speaking',
  PROCESSING: 'processing',
  ERROR: 'error'
};

// State management in components
const [voiceState, setVoiceState] = useState(VoiceSessionState.DISCONNECTED);
```

## Error Handling and Fallbacks

### Intelligent Fallback System
```javascript
const VoiceFallbackManager = {
  async handleElevenLabsFailure(error) {
    console.warn('ElevenLabs voice failed:', error);
    
    // Dispatch fallback event
    window.dispatchEvent(new CustomEvent('voice:fallback:activate', {
      detail: { reason: error.message, provider: 'openai' }
    }));
    
    // Activate OpenAI fallback
    return await this.activateOpenAIFallback();
  },
  
  async activateOpenAIFallback() {
    try {
      const openaiChat = new OpenAIRealtimeChat();
      await openaiChat.connect();
      return openaiChat;
    } catch (fallbackError) {
      console.error('All voice systems failed:', fallbackError);
      this.activateTextFallback();
    }
  }
};
```

### Error Recovery
```javascript
const handleVoiceError = (error) => {
  // Log error for monitoring
  console.error('Voice command error:', error);
  
  // Notify user
  window.dispatchEvent(new CustomEvent('voice:error', {
    detail: { 
      message: 'Voice command temporarily unavailable',
      canRetry: true,
      fallbackAvailable: true
    }
  }));
  
  // Attempt recovery
  setTimeout(() => attemptVoiceRecovery(), 5000);
};
```

## Performance Optimization

### Connection Pooling
```javascript
class VoiceConnectionPool {
  private connections = new Map();
  
  async getConnection(provider) {
    if (this.connections.has(provider)) {
      return this.connections.get(provider);
    }
    
    const connection = await this.createConnection(provider);
    this.connections.set(provider, connection);
    return connection;
  }
  
  async preloadConnections() {
    // Preload primary and fallback connections
    await Promise.all([
      this.getConnection('elevenlabs'),
      this.getConnection('openai')
    ]);
  }
}
```

### Audio Buffer Management
```javascript
class AudioBufferManager {
  private buffers = new Map();
  
  async cacheCommonResponses() {
    const commonPhrases = ['Okay', 'Got it', 'Let me help you with that'];
    
    for (const phrase of commonPhrases) {
      const audioBuffer = await generateTTS(phrase);
      this.buffers.set(phrase, audioBuffer);
    }
  }
  
  getInstantResponse(phrase) {
    return this.buffers.get(phrase);
  }
}
```

## Mobile Optimization

### Mobile Voice Setup
```javascript
const setupMobileVoice = async () => {
  // Request microphone permissions
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (error) {
    throw new Error('Microphone access required for voice commands');
  }
  
  // Initialize mobile audio context
  const mobileAudio = MobileAudioManager.getInstance();
  await mobileAudio.initializeMobileAudio();
  
  // Configure for mobile constraints  
  const audioConfig = {
    sampleRate: 24000,
    channelCount: 1,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  };
  
  return audioConfig;
};
```

### Platform-Specific Handling
```javascript
const isMobileDevice = () => /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const getMobileVoiceConfig = () => {
  if (isMobileDevice()) {
    return {
      bufferSize: 2048, // Smaller buffer for mobile
      maxRecordingTime: 30000, // 30 second limit
      enableVAD: true, // Voice activity detection
      compressionEnabled: true
    };
  }
  
  return {
    bufferSize: 4096,
    maxRecordingTime: 60000,
    enableVAD: false,
    compressionEnabled: false
  };
};
```

## Testing and Quality Assurance

### Voice Command Testing
```javascript
describe('Voice Commands', () => {
  it('should execute audio playback commands', async () => {
    const mockAudioEngine = vi.spyOn(SimplifiedAudioEngine.prototype, 'playTextWithSynchronization');
    
    await clientTools.play({ text: 'test content' });
    
    expect(mockAudioEngine).toHaveBeenCalledWith({
      text: 'test content',
      voiceId: expect.any(String),
      onWordHighlight: expect.any(Function)
    });
  });
  
  it('should handle fallback activation', async () => {
    const mockFallback = vi.fn();
    VoiceFallbackManager.activateOpenAIFallback = mockFallback;
    
    await VoiceFallbackManager.handleElevenLabsFailure(new Error('Connection failed'));
    
    expect(mockFallback).toHaveBeenCalled();
  });
});
```

### Integration Testing
```javascript
describe('Voice Integration', () => {
  it('should coordinate with audio systems', async () => {
    const coordination = useCharlotteAudioCoordination();
    const voiceIntegration = useVoiceIntegration();
    
    // Start voice session
    await voiceIntegration.handleVoiceToggle();
    
    // Verify audio coordination
    expect(coordination.canCharlotteSpeak()).toBe(true);
  });
});
```

## Monitoring and Analytics

### Voice Command Metrics
```javascript
const trackVoiceCommand = (command, success, latency) => {
  window.dispatchEvent(new CustomEvent('analytics:voice:command', {
    detail: {
      command,
      success,
      latency,
      timestamp: Date.now(),
      provider: getCurrentVoiceProvider()
    }
  }));
};
```

### Performance Monitoring
```javascript
const VoicePerformanceMonitor = {
  trackLatency: (operation, startTime) => {
    const latency = Date.now() - startTime;
    console.log(`Voice ${operation} latency: ${latency}ms`);
    
    if (latency > 2000) {
      console.warn(`High latency detected for ${operation}: ${latency}ms`);
    }
  },
  
  trackSuccess: (operation, success) => {
    const metric = success ? 'success' : 'failure';
    console.log(`Voice ${operation}: ${metric}`);
  }
};
```

## Future Enhancements

### Planned Features
1. **Multi-language Support**: Voice commands in multiple languages
2. **Custom Wake Words**: User-defined activation phrases
3. **Voice Training**: Personal voice model adaptation
4. **Advanced Context**: Cross-session context persistence
5. **Emotion Detection**: Mood-aware response generation

### Integration Roadmap
1. **Q1**: Enhanced mobile voice recognition
2. **Q2**: Custom vocabulary training
3. **Q3**: Multi-modal interaction (voice + gesture)
4. **Q4**: Advanced AI reasoning capabilities