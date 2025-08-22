# Audio and Voice Integration Guide

## Integration Overview

This guide explains how different audio and voice services integrate within the system and provides implementation patterns for maintaining reliable operation.

## Core Integration Patterns

### Event-Driven Coordination

The system uses custom events for loose coupling between audio services:

```javascript
// Audio state changes
window.dispatchEvent(new CustomEvent('audio:statechange', { 
  detail: { isPlaying: true, system: 'story' } 
}));

// Voice command status
window.dispatchEvent(new CustomEvent('voice:status:update', { 
  detail: { status: 'listening', isConnected: true } 
}));

// Audio conflicts and coordination
window.dispatchEvent(new CustomEvent('audio:request', { 
  detail: { system: 'voice', priority: 'high' } 
}));
```

### Service Registry Pattern

Services register themselves with the coordinator:

```javascript
// In SimpleAudioCoordinator
const audioSystems = new Map();

registerSystem(name, priority, callbacks) {
  audioSystems.set(name, { priority, callbacks });
}

// Usage in components
useEffect(() => {
  coordinator.registerSystem('story-audio', 1, {
    onStop: () => stopStoryAudio(),
    onPause: () => pauseStoryAudio()
  });
}, []);
```

## Service Integration Details

### SimplifiedAudioEngine Integration

#### With Word Highlighting
```javascript
// In useWordHighlighting hook
const onWordHighlight = useCallback((wordIndex) => {
  if (wordIndex === -1) {
    clearHighlighting();
  } else {
    highlightWord(wordIndex);
  }
}, [highlightWord, clearHighlighting]);

// Engine integration
await audioEngine.playTextWithSynchronization({
  text: content,
  voiceId: selectedVoice,
  onWordHighlight: onWordHighlight
});
```

#### With Mobile Audio Manager
```javascript
// Automatic mobile optimization
const ensureAudio = async () => {
  const mobileManager = MobileAudioManager.getInstance();
  if (!mobileManager.isAudioReady()) {
    await mobileManager.initializeMobileAudio();
  }
  // Continue with audio setup
};
```

### Voice Command Integration

#### ElevenLabs Agent Setup
```javascript
// In useVoiceIntegration
const { status, isSpeaking, startSession, endSession } = useConversation({
  clientTools: {
    play: (params) => audioEngine.playTextWithSynchronization(params),
    stop: () => audioEngine.stop(),
    next: () => dispatchEvent(new CustomEvent('navigation:next')),
    // ... other tools
  },
  onConnect: () => console.log('Agent connected'),
  onDisconnect: () => console.log('Agent disconnected')
});
```

#### OpenAI Realtime Fallback
```javascript
// Automatic fallback activation
useEffect(() => {
  const handleElevenLabsError = () => {
    console.log('ElevenLabs failed, activating OpenAI fallback');
    openAIRealtimeChat.connect();
  };

  window.addEventListener('elevenlabs:error', handleElevenLabsError);
  return () => window.removeEventListener('elevenlabs:error', handleElevenLabsError);
}, []);
```

### Edge Function Integration

#### TTS Generation
```javascript
// Client-side integration
const generateTTS = async (text, context = 'learning') => {
  const { data, error } = await supabase.functions.invoke('elevenlabs-tts-smart', {
    body: { 
      text, 
      context,
      voice: selectedVoice,
      pronunciation_dictionary: dictionaryId 
    }
  });
  
  if (error) throw new Error(error.message);
  return data;
};
```

#### Signed URL Generation
```javascript
// Voice agent authentication
const getSignedUrl = async (agentId) => {
  const { data } = await supabase.functions.invoke('elevenlabs-agent-signed-url', {
    body: { agentId }
  });
  return data.signed_url;
};
```

## Component Integration Patterns

### Audio Control Components

#### Synchronized Controls
```javascript
// SynchronizedAudioControls integration
<SynchronizedAudioControls
  text={pageContent}
  contentHash={generateHash(pageContent)}
  onPlayingChange={(playing) => setIsPlaying(playing)}
  onWordHighlight={(wordIndex) => highlightWord(wordIndex)}
/>
```

#### Status Indicators
```javascript
// Automatic status updates
<AudioStatusIndicator className="fixed bottom-4 right-4" />
<AudioFallbackNotification />
```

### Hook Integration

#### Audio Coordination Hook
```javascript
// useCharlotteAudioCoordination
const coordination = useCharlotteAudioCoordination();

// Automatically prevents conflicts with story audio
useEffect(() => {
  const handleStoryStart = () => coordination.pauseCharlotte();
  window.addEventListener('story:audio:start', handleStoryStart);
  return () => window.removeEventListener('story:audio:start', handleStoryStart);
}, []);
```

#### Word Highlighting Integration
```javascript
// useWordHighlighting with useSimpleAudioHighlighting
const wordHighlighting = useWordHighlighting(text, isAudioPlaying);
const audioHighlighting = useSimpleAudioHighlighting();

// Coordinated highlighting
useEffect(() => {
  wordHighlighting.setCleanupFunction(() => {
    audioHighlighting.clearHighlighting();
  });
}, []);
```

## Integration Testing Patterns

### Event Integration Tests
```javascript
// Test event-driven coordination
it('should coordinate between audio systems', async () => {
  const mockEventListener = vi.fn();
  window.addEventListener('audio:request', mockEventListener);
  
  // Trigger audio request
  audioEngine.playText('test');
  
  expect(mockEventListener).toHaveBeenCalledWith(
    expect.objectContaining({
      detail: { system: 'story', priority: 'medium' }
    })
  );
});
```

### Service Integration Tests
```javascript
// Test service coordination
it('should stop other audio when voice starts', async () => {
  const stopAudioSpy = vi.spyOn(audioEngine, 'stop');
  
  // Start voice session
  await voiceIntegration.handleVoiceToggle();
  
  expect(stopAudioSpy).toHaveBeenCalled();
});
```

## Error Integration Patterns

### Cascading Fallbacks
```javascript
// TTS with multiple fallbacks
const playAudioWithFallbacks = async (text) => {
  try {
    await elevenlabsTTS.generate(text);
  } catch (error) {
    console.warn('ElevenLabs failed, trying Web Speech');
    try {
      await webSpeechAPI.speak(text);
    } catch (fallbackError) {
      console.error('All TTS methods failed');
      showTextFallback(text);
    }
  }
};
```

### Error Coordination
```javascript
// Notify other systems of failures
const handleAudioError = (error) => {
  window.dispatchEvent(new CustomEvent('audio:error', {
    detail: { error: error.message, system: 'elevenlabs' }
  }));
  
  // Trigger fallback systems
  activateFallbackTTS();
};
```

## Performance Integration

### Resource Sharing
```javascript
// Shared audio context across services
const getSharedAudioContext = () => {
  if (!window.sharedAudioContext) {
    window.sharedAudioContext = new AudioContext();
  }
  return window.sharedAudioContext;
};
```

### Memory Management
```javascript
// Coordinated cleanup on navigation
useEffect(() => {
  const handleNavigation = () => {
    audioEngine.stop();
    voiceCommands.disconnect();
    mobileAudio.cleanup();
  };

  window.addEventListener('beforeunload', handleNavigation);
  return () => window.removeEventListener('beforeunload', handleNavigation);
}, []);
```

## Integration Best Practices

### 1. Loose Coupling
- Use events for cross-service communication
- Avoid direct service dependencies
- Implement service registry patterns

### 2. Error Isolation
- Handle errors within service boundaries
- Provide graceful degradation
- Notify other services of failures

### 3. Resource Management
- Share resources where appropriate
- Clean up on component unmount
- Coordinate memory-intensive operations

### 4. Testing Integration
- Test service interactions
- Mock external dependencies
- Verify event-driven flows

### 5. Performance Monitoring
- Track integration points
- Monitor resource usage
- Measure coordination overhead

## Common Integration Issues

### Issue: Audio Conflicts
**Symptom**: Multiple audio streams playing simultaneously
**Solution**: Implement proper audio coordination through events

### Issue: Memory Leaks
**Symptom**: Increasing memory usage over time
**Solution**: Ensure proper cleanup in useEffect cleanup functions

### Issue: Mobile Audio Failures
**Symptom**: Audio not playing on mobile devices
**Solution**: Implement mobile audio unlocking and context management

### Issue: Voice Command Delays
**Symptom**: Slow response to voice commands
**Solution**: Preload connections and implement connection pooling

### Issue: Fallback Failures
**Symptom**: System fails when primary service is unavailable
**Solution**: Test all fallback paths and implement proper error handling
