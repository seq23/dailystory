# Audio and Voice Testing Guide

## Overview

Comprehensive testing strategy for all audio and voice components, including unit tests, integration tests, performance benchmarks, and regression prevention procedures.

## Testing Architecture

### Test Categories
1. **Unit Tests** - Individual component testing
2. **Integration Tests** - Service interaction testing  
3. **E2E Tests** - Complete user flow testing
4. **Performance Tests** - Latency and resource usage
5. **Regression Tests** - Prevent functionality breakdown
6. **Mobile Tests** - Platform-specific testing

### Testing Tools and Setup
```javascript
// Test configuration in vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test-setup.ts']
    }
  }
});
```

## Unit Testing

### Audio Engine Testing

#### SimplifiedAudioEngine Tests
```javascript
describe('SimplifiedAudioEngine', () => {
  let audioEngine: SimplifiedAudioEngine;
  
  beforeEach(() => {
    audioEngine = SimplifiedAudioEngine.getInstance();
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    audioEngine.stop();
  });
  
  it('should play text with synchronization', async () => {
    const mockOnWordHighlight = vi.fn();
    const mockAudioElement = {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      currentTime: 0,
      duration: 10
    };
    
    vi.spyOn(audioEngine, 'ensureAudio').mockResolvedValue(mockAudioElement as any);
    vi.spyOn(SynchronizedElevenLabsTTS, 'generateSynchronizedSpeech').mockResolvedValue({
      audioBuffer: new ArrayBuffer(1024),
      wordTimings: [
        { word: 'hello', startTime: 0, endTime: 0.5 },
        { word: 'world', startTime: 0.5, endTime: 1.0 }
      ]
    });
    
    await audioEngine.playTextWithSynchronization({
      text: 'hello world',
      voiceId: 'test-voice',
      onWordHighlight: mockOnWordHighlight
    });
    
    expect(mockAudioElement.play).toHaveBeenCalled();
    expect(SynchronizedElevenLabsTTS.generateSynchronizedSpeech).toHaveBeenCalledWith(
      'hello world',
      'learning',
      'test-voice'
    );
  });
  
  it('should handle audio generation errors gracefully', async () => {
    vi.spyOn(SynchronizedElevenLabsTTS, 'generateSynchronizedSpeech')
      .mockRejectedValue(new Error('TTS generation failed'));
    
    const mockFallback = vi.spyOn(audioEngine, 'fallbackToWebSpeech')
      .mockResolvedValue(undefined);
    
    await audioEngine.playTextWithSynchronization({
      text: 'test text',
      voiceId: 'test-voice',
      onWordHighlight: vi.fn()
    });
    
    expect(mockFallback).toHaveBeenCalledWith('test text');
  });
  
  it('should stop audio and clean up resources', () => {
    const mockAudioElement = {
      pause: vi.fn(),
      currentTime: 0,
      src: 'blob:test'
    };
    
    audioEngine['audioElement'] = mockAudioElement as any;
    audioEngine['currentObjectUrl'] = 'blob:test';
    audioEngine['abortController'] = new AbortController();
    
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');
    
    audioEngine.stop();
    
    expect(mockAudioElement.pause).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test');
    expect(audioEngine['abortController']?.signal.aborted).toBe(true);
  });
});
```

#### MobileAudioManager Tests
```javascript
describe('MobileAudioManager', () => {
  let mobileAudio: MobileAudioManager;
  
  beforeEach(() => {
    mobileAudio = MobileAudioManager.getInstance();
    
    // Mock mobile environment
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      configurable: true
    });
  });
  
  it('should initialize mobile audio context', async () => {
    const mockAudioContext = {
      state: 'suspended',
      resume: vi.fn().mockResolvedValue(undefined),
      createGain: vi.fn(),
      destination: {}
    };
    
    global.AudioContext = vi.fn(() => mockAudioContext) as any;
    
    await mobileAudio.initializeMobileAudio();
    
    // Simulate user interaction
    const touchEvent = new TouchEvent('touchstart', { bubbles: true });
    document.dispatchEvent(touchEvent);
    
    expect(mockAudioContext.resume).toHaveBeenCalled();
  });
  
  it('should handle audio interruptions', async () => {
    const mockAudio = document.createElement('audio');
    const playSpy = vi.spyOn(mockAudio, 'play').mockResolvedValue(undefined);
    const pauseSpy = vi.spyOn(mockAudio, 'pause');
    
    mobileAudio['audioElement'] = mockAudio;
    
    // Simulate app going to background
    Object.defineProperty(document, 'hidden', { value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    
    expect(pauseSpy).toHaveBeenCalled();
    
    // Simulate app returning to foreground
    Object.defineProperty(document, 'hidden', { value: false });
    document.dispatchEvent(new Event('visibilitychange'));
    
    // Should attempt to resume
    setTimeout(() => {
      expect(playSpy).toHaveBeenCalled();
    }, 150);
  });
});
```

### Voice Command Testing

#### ElevenLabs Agent Tests
```javascript
describe('Voice Integration', () => {
  let voiceIntegration: ReturnType<typeof useVoiceIntegration>;
  
  beforeEach(() => {
    const mockConversation = {
      startSession: vi.fn().mockResolvedValue('session-id'),
      endSession: vi.fn().mockResolvedValue(undefined),
      status: 'disconnected',
      isSpeaking: false
    };
    
    vi.mocked(useConversation).mockReturnValue(mockConversation as any);
    
    const { result } = renderHook(() => useVoiceIntegration());
    voiceIntegration = result.current;
  });
  
  it('should start voice session with signed URL', async () => {
    const mockSignedUrl = 'https://api.elevenlabs.io/signed-url';
    
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { signed_url: mockSignedUrl },
      error: null
    });
    
    await voiceIntegration.handleVoiceToggle();
    
    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      'elevenlabs-agent-signed-url',
      { body: { agentId: undefined } }
    );
  });
  
  it('should execute client tools correctly', async () => {
    const mockAudioEngine = {
      playTextWithSynchronization: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn()
    };
    
    vi.spyOn(SimplifiedAudioEngine, 'getInstance').mockReturnValue(mockAudioEngine as any);
    
    const clientTools = voiceIntegration.clientTools;
    
    // Test play command
    const result = await clientTools.play({
      text: 'test content',
      voice: 'test-voice'
    });
    
    expect(mockAudioEngine.playTextWithSynchronization).toHaveBeenCalledWith({
      text: 'test content',
      voiceId: 'test-voice',
      onWordHighlight: expect.any(Function)
    });
    expect(result).toBe('Started reading the page content');
  });
});
```

#### OpenAI Realtime Tests
```javascript
describe('OpenAI Realtime Chat', () => {
  let realtimeChat: ReturnType<typeof useOpenAIRealtimeChat>;
  
  beforeEach(() => {
    const { result } = renderHook(() => useOpenAIRealtimeChat());
    realtimeChat = result.current;
  });
  
  it('should establish WebSocket connection', async () => {
    const mockWebSocket = {
      readyState: WebSocket.OPEN,
      send: vi.fn(),
      close: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
    
    global.WebSocket = vi.fn(() => mockWebSocket) as any;
    
    await realtimeChat.connect();
    
    expect(WebSocket).toHaveBeenCalledWith(
      expect.stringContaining('openai-realtime')
    );
  });
  
  it('should handle audio data encoding', () => {
    const float32Array = new Float32Array([0.5, -0.5, 1.0, -1.0]);
    const encoded = realtimeChat.encodeAudioData(float32Array);
    
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(0);
  });
});
```

## Integration Testing

### Service Coordination Tests
```javascript
describe('Audio Service Coordination', () => {
  it('should prevent audio conflicts between systems', async () => {
    const coordinator = SimpleAudioCoordinator.getInstance();
    const mockAudioEngine = SimplifiedAudioEngine.getInstance();
    
    const stopSpy = vi.spyOn(mockAudioEngine, 'stop');
    
    // Start story audio
    coordinator.requestAudioFocus('story', 'medium');
    
    // Try to start voice commands (higher priority)
    coordinator.requestAudioFocus('voice', 'high');
    
    expect(stopSpy).toHaveBeenCalled();
  });
  
  it('should coordinate word highlighting across systems', async () => {
    const { result: wordHighlighting } = renderHook(() => 
      useWordHighlighting('test text', true)
    );
    
    const { result: audioHighlighting } = renderHook(() => 
      useSimpleAudioHighlighting()
    );
    
    // Test word highlighting coordination
    act(() => {
      wordHighlighting.current.onWordHighlight(1);
    });
    
    expect(audioHighlighting.current.currentHighlightedWord).toBe(1);
  });
});
```

### Edge Function Integration Tests
```javascript
describe('Edge Function Integration', () => {
  it('should generate TTS with proper error handling', async () => {
    // Mock successful response
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: {
        audioData: 'base64-audio-data',
        wordTimings: [
          { word: 'hello', startTime: 0, endTime: 0.5 }
        ]
      },
      error: null
    });
    
    const result = await SynchronizedElevenLabsTTS.generateSynchronizedSpeech(
      'hello world',
      'learning',
      'test-voice'
    );
    
    expect(result.audioBuffer).toBeDefined();
    expect(result.wordTimings).toHaveLength(1);
  });
  
  it('should handle edge function errors gracefully', async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: { message: 'API rate limit exceeded' }
    });
    
    await expect(
      SynchronizedElevenLabsTTS.generateSynchronizedSpeech('test')
    ).rejects.toThrow('API rate limit exceeded');
  });
});
```

## End-to-End Testing

### Complete User Flow Tests
```javascript
describe('Audio E2E Flows', () => {
  it('should complete full TTS playback flow', async () => {
    render(<SynchronizedAudioControls 
      text="Hello world" 
      onWordHighlight={vi.fn()}
    />);
    
    const playButton = screen.getByRole('button', { name: /read to me/i });
    
    // Mock TTS response
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: {
        audioData: 'mock-audio-data',
        wordTimings: [
          { word: 'Hello', startTime: 0, endTime: 0.5 },
          { word: 'world', startTime: 0.5, endTime: 1.0 }
        ]
      },
      error: null
    });
    
    // Start playback
    fireEvent.click(playButton);
    
    // Should show loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for playback to start
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
    });
  });
  
  it('should handle voice command complete flow', async () => {
    const { result } = renderHook(() => useVoiceIntegration());
    
    // Mock signed URL generation
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { signed_url: 'https://test-url.com' },
      error: null
    });
    
    // Start voice session
    await act(async () => {
      await result.current.handleVoiceToggle();
    });
    
    expect(result.current.status).toBe('connected');
  });
});
```

## Performance Testing

### Latency Benchmarks
```javascript
describe('Audio Performance', () => {
  it('should meet TTS generation latency requirements', async () => {
    const startTime = Date.now();
    
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { audioData: 'test-data', wordTimings: [] },
      error: null
    });
    
    await SynchronizedElevenLabsTTS.generateSynchronizedSpeech('test text');
    
    const latency = Date.now() - startTime;
    expect(latency).toBeLessThan(2000); // Should complete within 2 seconds
  });
  
  it('should handle concurrent audio requests efficiently', async () => {
    const audioEngine = SimplifiedAudioEngine.getInstance();
    const promises = [];
    
    // Generate multiple concurrent requests
    for (let i = 0; i < 5; i++) {
      promises.push(
        audioEngine.playTextWithSynchronization({
          text: `Test text ${i}`,
          voiceId: 'test-voice',
          onWordHighlight: vi.fn()
        })
      );
    }
    
    const startTime = Date.now();
    await Promise.allSettled(promises);
    const totalTime = Date.now() - startTime;
    
    // Should handle concurrent requests reasonably
    expect(totalTime).toBeLessThan(10000);
  });
});
```

### Memory Usage Tests
```javascript
describe('Memory Management', () => {
  it('should clean up audio resources properly', () => {
    const audioEngine = SimplifiedAudioEngine.getInstance();
    
    // Create mock resources
    audioEngine['audioElement'] = document.createElement('audio');
    audioEngine['currentObjectUrl'] = 'blob:test-url';
    audioEngine['abortController'] = new AbortController();
    
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Stop and cleanup
    audioEngine.stop();
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Memory should not increase significantly
    expect(finalMemory - initialMemory).toBeLessThan(1024 * 1024); // Less than 1MB
  });
});
```

## Regression Testing

### Automated Regression Suite
```javascript
describe('Audio Regression Tests', () => {
  const regressionTestCases = [
    {
      name: 'TTS Generation with Word Timing',
      test: async () => {
        const result = await SynchronizedElevenLabsTTS.generateSynchronizedSpeech(
          'The quick brown fox jumps over the lazy dog.'
        );
        
        expect(result.audioBuffer).toBeDefined();
        expect(result.wordTimings.length).toBeGreaterThan(0);
        expect(result.wordTimings[0]).toHaveProperty('word');
        expect(result.wordTimings[0]).toHaveProperty('startTime');
        expect(result.wordTimings[0]).toHaveProperty('endTime');
      }
    },
    {
      name: 'Mobile Audio Unlocking',
      test: async () => {
        const mobileAudio = MobileAudioManager.getInstance();
        
        // Mock mobile environment
        Object.defineProperty(navigator, 'userAgent', {
          value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
          configurable: true
        });
        
        await mobileAudio.initializeMobileAudio();
        expect(mobileAudio.isAudioReady()).toBe(true);
      }
    },
    {
      name: 'Voice Command Client Tools',
      test: async () => {
        const { result } = renderHook(() => useVoiceIntegration());
        const clientTools = result.current.clientTools;
        
        // Test all client tools exist and are callable
        expect(typeof clientTools.play).toBe('function');
        expect(typeof clientTools.stop).toBe('function');
        expect(typeof clientTools.next).toBe('function');
        expect(typeof clientTools.previous).toBe('function');
        expect(typeof clientTools.wordHelp).toBe('function');
      }
    }
  ];
  
  regressionTestCases.forEach(({ name, test }) => {
    it(`should not regress: ${name}`, test);
  });
});
```

### Visual Regression Tests
```javascript
describe('Audio UI Regression', () => {
  it('should render audio controls consistently', () => {
    const { container } = render(
      <SynchronizedAudioControls 
        text="Test content"
        onWordHighlight={vi.fn()}
      />
    );
    
    // Take snapshot
    expect(container).toMatchSnapshot();
  });
  
  it('should render voice status indicators consistently', () => {
    const { container } = render(<AudioStatusIndicator />);
    expect(container).toMatchSnapshot();
  });
});
```

## Mobile Testing

### Device-Specific Tests
```javascript
describe('Mobile Platform Tests', () => {
  const platforms = [
    { name: 'iOS Safari', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)' },
    { name: 'Android Chrome', userAgent: 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36' },
    { name: 'iOS Chrome', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) CriOS/91.0' }
  ];
  
  platforms.forEach(({ name, userAgent }) => {
    describe(name, () => {
      beforeEach(() => {
        Object.defineProperty(navigator, 'userAgent', {
          value: userAgent,
          configurable: true
        });
      });
      
      it('should initialize audio correctly', async () => {
        const mobileAudio = MobileAudioManager.getInstance();
        await mobileAudio.initializeMobileAudio();
        
        expect(mobileAudio.isAudioReady()).toBe(true);
      });
      
      it('should handle platform-specific audio formats', () => {
        const formats = mobileAudio.getSupportedFormats();
        expect(formats).toContain('mp3'); // Universal support
        
        if (name.includes('iOS')) {
          expect(formats).toContain('aac');
        }
        
        if (name.includes('Android')) {
          expect(formats).toContain('opus');
        }
      });
    });
  });
});
```

## Test Data and Mocks

### Mock Audio Data
```javascript
export const mockAudioData = {
  shortText: 'Hello world',
  longText: 'This is a longer piece of text that will be used to test the text-to-speech functionality with multiple words and proper timing synchronization.',
  
  mockWordTimings: [
    { word: 'Hello', startTime: 0, endTime: 0.5 },
    { word: 'world', startTime: 0.5, endTime: 1.0 }
  ],
  
  mockAudioBuffer: new ArrayBuffer(1024),
  mockBase64Audio: 'UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAAAAA='
};

export const mockElevenLabsResponse = {
  audioData: mockAudioData.mockBase64Audio,
  wordTimings: mockAudioData.mockWordTimings
};
```

### Test Utilities
```javascript
export const TestUtils = {
  createMockAudioElement() {
    return {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      load: vi.fn(),
      currentTime: 0,
      duration: 10,
      paused: true,
      ended: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
  },
  
  createMockAudioContext() {
    return {
      state: 'running',
      sampleRate: 44100,
      resume: vi.fn().mockResolvedValue(undefined),
      suspend: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
      createGain: vi.fn(),
      createOscillator: vi.fn(),
      destination: {}
    };
  },
  
  simulateUserInteraction() {
    const event = new MouseEvent('click', { bubbles: true });
    document.dispatchEvent(event);
  },
  
  async waitForAudioLoad(audioElement: HTMLAudioElement) {
    return new Promise(resolve => {
      if (audioElement.readyState >= 2) {
        resolve(undefined);
      } else {
        audioElement.addEventListener('canplay', resolve, { once: true });
      }
    });
  }
};
```

## Continuous Integration

### CI Test Configuration
```yaml
# .github/workflows/audio-tests.yml
name: Audio System Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm run test:unit
        
      - name: Run integration tests
        run: npm run test:integration
        
      - name: Run regression tests
        run: npm run test:regression
        
      - name: Generate coverage report
        run: npm run test:coverage
        
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
```

### Test Scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --reporter=verbose --coverage",
    "test:integration": "vitest run src/**/*.integration.test.ts",
    "test:regression": "vitest run src/**/*.regression.test.ts",
    "test:e2e": "playwright test",
    "test:mobile": "vitest run src/**/*.mobile.test.ts",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch"
  }
}
```

This comprehensive testing guide ensures robust audio and voice functionality across all platforms and use cases.