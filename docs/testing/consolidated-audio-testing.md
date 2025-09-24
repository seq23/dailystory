# Consolidated Audio Testing Guide

## Overview

This guide provides comprehensive testing strategies for the Phase 4 consolidated audio system, including **CharlotteVoiceService**, **useAudioControls** hook, and **UnifiedDebugMonitor**. All testing patterns are based on the current active implementation.

## Testing Architecture Overview

### Test Structure
```
tests/
├── unit/
│   ├── services/
│   │   └── CharlotteVoiceService.test.ts
│   ├── hooks/
│   │   └── useAudioControls.test.ts
│   └── components/
│       └── UnifiedDebugMonitor.test.ts
├── integration/
│   ├── audio-story-integration.test.ts
│   └── voice-command-integration.test.ts
├── e2e/
│   ├── complete-audio-flow.spec.ts
│   └── mobile-audio-experience.spec.ts
└── performance/
    ├── audio-performance.test.ts
    └── memory-usage.test.ts
```

## Unit Testing

### CharlotteVoiceService Testing

Comprehensive unit tests for the unified audio service:

```typescript
// tests/unit/services/CharlotteVoiceService.test.ts
import { CharlotteVoiceService } from '@/services/CharlotteVoiceService';

describe('CharlotteVoiceService', () => {
  let service: CharlotteVoiceService;
  
  beforeEach(() => {
    service = new CharlotteVoiceService();
    // Mock Supabase functions
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('TTS Generation', () => {
    test('should generate TTS audio successfully', async () => {
      const mockAudioBuffer = new ArrayBuffer(1024);
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockAudioBuffer)
      });

      const result = await service.generateTTS('Hello world');
      
      expect(result).toEqual(mockAudioBuffer);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('elevenlabs-tts'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"text":"Hello world"')
        })
      );
    });

    test('should fallback to OpenAI when ElevenLabs fails', async () => {
      // Mock ElevenLabs failure
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500
        })
        // Mock OpenAI success
        .mockResolvedValueOnce({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(512))
        });

      const result = await service.generateTTS('Test text');
      
      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    test('should handle timeout errors gracefully', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 20000)) // Simulate timeout
      );

      await expect(service.generateTTS('Test')).rejects.toThrow('TTS request timed out');
    });
  });

  describe('Audio Playback', () => {
    test('should play text with word synchronization', async () => {
      const mockHighlightCallback = jest.fn();
      const mockCompleteCallback = jest.fn();
      
      // Mock successful TTS generation
      jest.spyOn(service, 'generateTTS').mockResolvedValue(new ArrayBuffer(1024));
      
      // Mock audio context and elements
      global.AudioContext = jest.fn().mockImplementation(() => ({
        createBufferSource: () => ({
          connect: jest.fn(),
          start: jest.fn(),
          addEventListener: jest.fn()
        }),
        decodeAudioData: jest.fn().mockResolvedValue({}),
        resume: jest.fn()
      }));

      await service.playTextWithSynchronization({
        text: 'Hello world test',
        onWordHighlight: mockHighlightCallback,
        onComplete: mockCompleteCallback
      });

      // Verify callbacks are set up
      expect(mockHighlightCallback).toBeDefined();
      expect(mockCompleteCallback).toBeDefined();
    });
  });

  describe('Session Management', () => {
    test('should enforce free user audio limits', () => {
      const result = service.canUseAudio(false, 1300); // Over 20 minute limit
      expect(result).toBe(false);
    });

    test('should allow unlimited audio for premium users', () => {
      const result = service.canUseAudio(true, 5000); // Way over limit
      expect(result).toBe(true);
    });

    test('should allow audio for free users within limits', () => {
      const result = service.canUseAudio(false, 600); // 10 minutes
      expect(result).toBe(true);
    });
  });

  describe('Legacy Interface Compatibility', () => {
    test('should provide SimplifiedAudioEngine interface', async () => {
      const engine = await service.SimplifiedAudioEngine();
      
      expect(engine).toHaveProperty('playText');
      expect(engine).toHaveProperty('stopPlayback');
      expect(engine).toHaveProperty('generateSpeech');
    });

    test('should maintain backward compatibility with old playText method', async () => {
      const engine = await service.SimplifiedAudioEngine();
      const mockCallback = jest.fn();
      
      jest.spyOn(service, 'playTextWithSynchronization').mockResolvedValue();
      
      await engine.playText('Test content', {
        onWordHighlight: mockCallback,
        voiceId: 'Charlotte'
      });
      
      expect(service.playTextWithSynchronization).toHaveBeenCalledWith({
        text: 'Test content',
        onWordHighlight: mockCallback,
        voiceId: 'Charlotte'
      });
    });
  });
});
```

### useAudioControls Hook Testing

Test the consolidated audio controls hook:

```typescript
// tests/unit/hooks/useAudioControls.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAudioControls } from '@/hooks/useAudioControls';
import { CharlotteVoiceService } from '@/services/CharlotteVoiceService';

// Mock the service
jest.mock('@/services/CharlotteVoiceService');

describe('useAudioControls', () => {
  const mockUserInfo = {
    id: 'test-user',
    isPremium: false
  };

  const defaultOptions = {
    text: 'Test story content',
    userInfo: mockUserInfo,
    currentPage: 1,
    difficulty: 'medium' as const,
    isPremium: false
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock CharlotteVoiceService methods
    CharlotteVoiceService.prototype.canUseAudio = jest.fn().mockReturnValue(true);
    CharlotteVoiceService.prototype.playTextWithSynchronization = jest.fn().mockResolvedValue();
    CharlotteVoiceService.prototype.stopPlayback = jest.fn();
  });

  test('should initialize with correct default values', () => {
    const { result } = renderHook(() => useAudioControls(defaultOptions));

    expect(result.current).toEqual({
      playAudio: expect.any(Function),
      stopAudio: expect.any(Function),
      isPlaying: false,
      canUseAudio: true,
      highlightWord: expect.any(Function),
      clearHighlighting: expect.any(Function),
      currentHighlightedWord: null,
      sessionTimeUsed: 0,
      remainingTime: 1200, // 20 minutes for free users
      vocabularyState: {
        learnedWords: [],
        difficultWords: []
      },
      updateVocabulary: expect.any(Function),
      contentHash: expect.any(String),
      isContentValid: true
    });
  });

  test('should handle audio playback correctly', async () => {
    const { result } = renderHook(() => useAudioControls(defaultOptions));

    await act(async () => {
      await result.current.playAudio();
    });

    expect(CharlotteVoiceService.prototype.playTextWithSynchronization).toHaveBeenCalledWith({
      text: defaultOptions.text,
      onWordHighlight: expect.any(Function),
      onComplete: expect.any(Function),
      voiceId: undefined
    });
  });

  test('should update playing state during playback', async () => {
    const { result } = renderHook(() => useAudioControls(defaultOptions));

    expect(result.current.isPlaying).toBe(false);

    act(() => {
      result.current.playAudio();
    });

    expect(result.current.isPlaying).toBe(true);
  });

  test('should handle word highlighting', () => {
    const { result } = renderHook(() => useAudioControls(defaultOptions));

    act(() => {
      result.current.highlightWord('test', 0);
    });

    expect(result.current.currentHighlightedWord).toBe('test');

    act(() => {
      result.current.clearHighlighting();
    });

    expect(result.current.currentHighlightedWord).toBeNull();
  });

  test('should track vocabulary correctly', () => {
    const { result } = renderHook(() => useAudioControls(defaultOptions));

    act(() => {
      result.current.updateVocabulary('difficult');
    });

    expect(result.current.vocabularyState.difficultWords).toContain('difficult');
  });

  test('should calculate session time for free users', () => {
    const { result } = renderHook(() => useAudioControls({
      ...defaultOptions,
      isPremium: false
    }));

    expect(result.current.remainingTime).toBe(1200); // 20 minutes
    expect(result.current.sessionTimeUsed).toBe(0);
  });

  test('should provide unlimited time for premium users', () => {
    const { result } = renderHook(() => useAudioControls({
      ...defaultOptions,
      isPremium: true
    }));

    expect(result.current.remainingTime).toBe(-1); // Unlimited
  });

  test('should generate content hash for caching', () => {
    const { result } = renderHook(() => useAudioControls(defaultOptions));

    expect(result.current.contentHash).toBeDefined();
    expect(typeof result.current.contentHash).toBe('string');
  });

  test('should handle errors gracefully', async () => {
    CharlotteVoiceService.prototype.playTextWithSynchronization = jest.fn().mockRejectedValue(
      new Error('TTS failed')
    );

    const { result } = renderHook(() => useAudioControls(defaultOptions));

    await act(async () => {
      try {
        await result.current.playAudio();
      } catch (error) {
        expect(error.message).toBe('TTS failed');
      }
    });

    expect(result.current.isPlaying).toBe(false);
  });
});
```

### UnifiedDebugMonitor Testing

Test the consolidated debug interface:

```typescript
// tests/unit/components/UnifiedDebugMonitor.test.ts
import { render, screen, fireEvent } from '@testing-library/react';
import { UnifiedDebugMonitor } from '@/components/UnifiedDebugMonitor';
import { CharlotteVoiceService } from '@/services/CharlotteVoiceService';

jest.mock('@/services/CharlotteVoiceService');

describe('UnifiedDebugMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render all debug sections', () => {
    render(<UnifiedDebugMonitor />);

    expect(screen.getByText('TTS Status')).toBeInTheDocument();
    expect(screen.getByText('Audio Testing')).toBeInTheDocument();
    expect(screen.getByText('Word Testing')).toBeInTheDocument();
    expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
  });

  test('should handle audio testing', async () => {
    CharlotteVoiceService.prototype.generateTTS = jest.fn().mockResolvedValue(new ArrayBuffer(512));

    render(<UnifiedDebugMonitor />);

    const testButton = screen.getByText('Test Charlotte Voice');
    fireEvent.click(testButton);

    expect(CharlotteVoiceService.prototype.generateTTS).toHaveBeenCalledWith(
      expect.stringContaining('testing'),
      'Charlotte'
    );
  });

  test('should display TTS status updates', () => {
    render(<UnifiedDebugMonitor />);

    // Simulate TTS status event
    const statusEvent = new CustomEvent('ttsStatusUpdate', {
      detail: { status: 'generating', text: 'Test content' }
    });
    
    window.dispatchEvent(statusEvent);

    expect(screen.getByText('generating')).toBeInTheDocument();
  });

  test('should handle word pronunciation testing', () => {
    render(<UnifiedDebugMonitor />);

    const wordInput = screen.getByPlaceholder('Enter word to test');
    const testButton = screen.getByText('Test Word');

    fireEvent.change(wordInput, { target: { value: 'pronunciation' } });
    fireEvent.click(testButton);

    expect(CharlotteVoiceService.prototype.generateTTS).toHaveBeenCalledWith('pronunciation');
  });

  test('should show performance metrics', () => {
    render(<UnifiedDebugMonitor />);

    // Should display various performance metrics
    expect(screen.getByText(/Generation Time/)).toBeInTheDocument();
    expect(screen.getByText(/Success Rate/)).toBeInTheDocument();
    expect(screen.getByText(/Cache Hit Rate/)).toBeInTheDocument();
  });
});
```

## Integration Testing

### Audio-Story Integration Testing

Test complete audio integration with story components:

```typescript
// tests/integration/audio-story-integration.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StoryPage } from '@/components/StoryPage';
import { CharlotteVoiceService } from '@/services/CharlotteVoiceService';

describe('Audio-Story Integration', () => {
  const mockStoryContent = 'Once upon a time in a magical forest, there lived a wise old owl.';
  const mockUserInfo = { id: 'test-user', isPremium: false };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful audio generation
    CharlotteVoiceService.prototype.generateTTS = jest.fn().mockResolvedValue(new ArrayBuffer(1024));
    CharlotteVoiceService.prototype.playTextWithSynchronization = jest.fn().mockImplementation(
      ({ onWordHighlight, onComplete }) => {
        // Simulate word highlighting
        setTimeout(() => onWordHighlight('Once', 0), 100);
        setTimeout(() => onWordHighlight('upon', 1), 200);
        setTimeout(() => onComplete(), 1000);
        return Promise.resolve();
      }
    );
  });

  test('should integrate audio controls with story display', async () => {
    render(
      <StoryPage 
        content={mockStoryContent}
        userInfo={mockUserInfo}
        currentPage={1}
      />
    );

    // Should display story content
    expect(screen.getByText(/Once upon a time/)).toBeInTheDocument();

    // Should have audio controls
    const playButton = screen.getByText('Play Audio');
    expect(playButton).toBeInTheDocument();

    // Should show session timer for free users
    expect(screen.getByText(/Time remaining/)).toBeInTheDocument();
  });

  test('should highlight words during audio playback', async () => {
    render(
      <StoryPage 
        content={mockStoryContent}
        userInfo={mockUserInfo}
        currentPage={1}
      />
    );

    const playButton = screen.getByText('Play Audio');
    fireEvent.click(playButton);

    // Wait for word highlighting
    await waitFor(() => {
      expect(screen.getByText('Once')).toHaveClass('highlighted-word');
    });

    // Check that highlighting moves to next word
    await waitFor(() => {
      expect(screen.getByText('upon')).toHaveClass('highlighted-word');
    });
  });

  test('should update vocabulary during story reading', async () => {
    render(
      <StoryPage 
        content={mockStoryContent}
        userInfo={mockUserInfo}
        currentPage={1}
      />
    );

    // Click on a word to add to vocabulary
    const wordElement = screen.getByText('magical');
    fireEvent.click(wordElement);

    await waitFor(() => {
      expect(screen.getByText(/Words learned: 1/)).toBeInTheDocument();
    });
  });

  test('should handle session limits for free users', async () => {
    // Mock user with depleted session
    CharlotteVoiceService.prototype.canUseAudio = jest.fn().mockReturnValue(false);

    render(
      <StoryPage 
        content={mockStoryContent}
        userInfo={mockUserInfo}
        currentPage={1}
      />
    );

    const playButton = screen.getByText('Play Audio');
    expect(playButton).toBeDisabled();
    
    expect(screen.getByText(/Time remaining: 0:00/)).toBeInTheDocument();
  });

  test('should work correctly for premium users', () => {
    const premiumUserInfo = { ...mockUserInfo, isPremium: true };

    render(
      <StoryPage 
        content={mockStoryContent}
        userInfo={premiumUserInfo}
        currentPage={1}
      />
    );

    // Premium users shouldn't see session timer
    expect(screen.queryByText(/Time remaining/)).not.toBeInTheDocument();
    
    // Should have unlimited audio access
    const playButton = screen.getByText('Play Audio');
    expect(playButton).not.toBeDisabled();
  });
});
```

### Voice Command Integration Testing

Test Charlotte voice command integration:

```typescript
// tests/integration/voice-command-integration.test.ts
import { render, screen, fireEvent } from '@testing-library/react';
import { VoiceControlledStoryPage } from '@/components/VoiceControlledStoryPage';
import { useConversation } from '@11labs/react';

jest.mock('@11labs/react');

describe('Voice Command Integration', () => {
  const mockConversation = {
    startConversation: jest.fn(),
    endConversation: jest.fn(),
    status: 'idle'
  };

  beforeEach(() => {
    (useConversation as jest.Mock).mockReturnValue(mockConversation);
  });

  test('should respond to voice commands', async () => {
    const mockOnMessage = jest.fn();
    (useConversation as jest.Mock).mockImplementation(({ onMessage }) => {
      mockOnMessage.mockImplementation(onMessage);
      return mockConversation;
    });

    render(<VoiceControlledStoryPage content="Test story" userInfo={mockUser} />);

    // Simulate voice command
    mockOnMessage({ message: 'play story' });

    // Verify audio controls respond
    expect(CharlotteVoiceService.prototype.playTextWithSynchronization).toHaveBeenCalled();
  });

  test('should handle voice command errors', () => {
    const mockOnError = jest.fn();
    (useConversation as jest.Mock).mockImplementation(({ onError }) => {
      mockOnError.mockImplementation(onError);
      return mockConversation;
    });

    render(<VoiceControlledStoryPage content="Test story" userInfo={mockUser} />);

    // Simulate error
    mockOnError(new Error('Voice recognition failed'));

    // Should handle error gracefully
    expect(screen.getByText(/Voice Error/)).toBeInTheDocument();
  });
});
```

## End-to-End Testing

### Complete Audio Flow Testing

Test the entire audio experience from user interaction to playback:

```typescript
// tests/e2e/complete-audio-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complete Audio Flow', () => {
  test('should complete full audio story experience', async ({ page }) => {
    // Navigate to story page
    await page.goto('/story/1?debug=1');
    
    // Wait for page to load
    await expect(page.locator('.story-content')).toBeVisible();
    
    // Verify debug monitor is visible
    await expect(page.locator('.unified-debug-monitor')).toBeVisible();
    
    // Click play audio button
    await page.click('button:has-text("Play Audio")');
    
    // Verify audio is playing
    await expect(page.locator('button:has-text("Playing...")')).toBeVisible();
    
    // Wait for word highlighting
    await expect(page.locator('.highlighted-word')).toBeVisible();
    
    // Verify TTS status in debug monitor
    await expect(page.locator('.tts-status:has-text("playing")')).toBeVisible();
    
    // Check vocabulary tracking
    await page.click('.word:first-child');
    await expect(page.locator('.vocabulary-info:has-text("Words learned: 1")')).toBeVisible();
    
    // Stop audio
    await page.click('button:has-text("Stop")');
    await expect(page.locator('button:has-text("Play Audio")')).toBeVisible();
  });

  test('should handle free user session limits', async ({ page }) => {
    // Mock free user with limited session time
    await page.addInitScript(() => {
      window.localStorage.setItem('mockUserType', 'free');
      window.localStorage.setItem('sessionTimeUsed', '1190'); // 19:50 used
    });

    await page.goto('/story/1');
    
    // Should show remaining time
    await expect(page.locator('.session-info:has-text("Time remaining: 0:10")')).toBeVisible();
    
    // Play audio briefly
    await page.click('button:has-text("Play Audio")');
    
    // Wait for session to expire
    await page.waitForTimeout(11000);
    
    // Should disable audio controls
    await expect(page.locator('button:has-text("Play Audio"):disabled')).toBeVisible();
    
    // Should show session expired message
    await expect(page.locator('.session-expired')).toBeVisible();
  });

  test('should work with voice commands', async ({ page }) => {
    await page.goto('/story/1');
    
    // Enable voice commands (simulate user gesture)
    await page.click('.voice-enable-button');
    
    // Simulate voice command (would need WebRTC mocking in real test)
    await page.evaluate(() => {
      // Simulate Charlotte voice command result
      window.dispatchEvent(new CustomEvent('voiceCommand', {
        detail: { command: 'play story' }
      }));
    });
    
    // Should start audio playback
    await expect(page.locator('button:has-text("Playing...")')).toBeVisible();
  });
});
```

### Mobile Audio Experience Testing

Test mobile-specific audio functionality:

```typescript
// tests/e2e/mobile-audio-experience.spec.ts
import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['iPhone 12'] });

test.describe('Mobile Audio Experience', () => {
  test('should handle mobile audio context unlocking', async ({ page }) => {
    await page.goto('/story/1');
    
    // Should show gesture prompt on mobile
    await expect(page.locator('.gesture-prompt:has-text("Tap to enable audio")')).toBeVisible();
    
    // Tap to unlock audio
    await page.tap('.gesture-prompt');
    
    // Gesture prompt should disappear
    await expect(page.locator('.gesture-prompt')).not.toBeVisible();
    
    // Audio controls should be enabled
    await expect(page.locator('button:has-text("Play Audio"):not(:disabled)')).toBeVisible();
  });

  test('should handle mobile interruptions', async ({ page }) => {
    await page.goto('/story/1');
    
    // Start audio playback
    await page.tap('button:has-text("Play Audio")');
    await expect(page.locator('button:has-text("Playing...")')).toBeVisible();
    
    // Simulate phone call interruption
    await page.evaluate(() => {
      document.dispatchEvent(new Event('visibilitychange'));
      Object.defineProperty(document, 'hidden', { value: true, writable: true });
    });
    
    // Audio should pause
    await expect(page.locator('button:has-text("Play Audio")')).toBeVisible();
    
    // Resume from interruption
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: false, writable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    
    // Should show resume option
    await expect(page.locator('.resume-audio-button')).toBeVisible();
  });

  test('should optimize for mobile performance', async ({ page }) => {
    await page.goto('/story/1');
    
    // Check that mobile optimizations are applied
    await expect(page.locator('.mobile-optimized')).toBeVisible();
    
    // Verify touch targets are appropriate size
    const playButton = page.locator('button:has-text("Play Audio")');
    const boundingBox = await playButton.boundingBox();
    
    expect(boundingBox?.height).toBeGreaterThanOrEqual(44); // iOS touch target minimum
    expect(boundingBox?.width).toBeGreaterThanOrEqual(44);
  });
});
```

## Performance Testing

### Audio Performance Testing

Test audio generation and playback performance:

```typescript
// tests/performance/audio-performance.test.ts
import { CharlotteVoiceService } from '@/services/CharlotteVoiceService';

describe('Audio Performance', () => {
  let service: CharlotteVoiceService;

  beforeEach(() => {
    service = new CharlotteVoiceService();
  });

  test('should generate TTS within acceptable time limits', async () => {
    const startTime = performance.now();
    
    await service.generateTTS('Test text for performance measurement');
    
    const endTime = performance.now();
    const generationTime = endTime - startTime;
    
    // Should complete within 5 seconds for short text
    expect(generationTime).toBeLessThan(5000);
  });

  test('should handle concurrent TTS requests efficiently', async () => {
    const requests = Array.from({ length: 5 }, (_, i) => 
      service.generateTTS(`Test text ${i}`)
    );
    
    const startTime = performance.now();
    
    const results = await Promise.all(requests);
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    // All requests should complete
    expect(results).toHaveLength(5);
    results.forEach(result => {
      expect(result).toBeInstanceOf(ArrayBuffer);
    });
    
    // Should not take significantly longer than single request
    expect(totalTime).toBeLessThan(8000);
  });

  test('should efficiently manage memory during audio playback', async () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Generate multiple audio buffers
    for (let i = 0; i < 10; i++) {
      await service.generateTTS(`Test audio content ${i}`);
    }
    
    // Force garbage collection if available
    if ('gc' in global) {
      (global as any).gc();
    }
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Should not leak significant memory (allow 10MB increase)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
});
```

## Test Utilities and Helpers

### Mock Setup Utilities

Helper functions for consistent test setup:

```typescript
// tests/utils/audio-test-helpers.ts
export const createMockUserInfo = (overrides = {}) => ({
  id: 'test-user',
  isPremium: false,
  ...overrides
});

export const createMockAudioControls = (overrides = {}) => ({
  playAudio: jest.fn(),
  stopAudio: jest.fn(),
  isPlaying: false,
  canUseAudio: true,
  highlightWord: jest.fn(),
  clearHighlighting: jest.fn(),
  currentHighlightedWord: null,
  sessionTimeUsed: 0,
  remainingTime: 1200,
  vocabularyState: { learnedWords: [], difficultWords: [] },
  updateVocabulary: jest.fn(),
  contentHash: 'test-hash',
  isContentValid: true,
  ...overrides
});

export const mockCharlotteVoiceService = () => {
  const mockService = {
    generateTTS: jest.fn().mockResolvedValue(new ArrayBuffer(1024)),
    playTextWithSynchronization: jest.fn().mockResolvedValue(),
    stopPlayback: jest.fn(),
    canUseAudio: jest.fn().mockReturnValue(true),
    SimplifiedAudioEngine: jest.fn().mockResolvedValue({
      playText: jest.fn(),
      stopPlayback: jest.fn(),
      generateSpeech: jest.fn()
    })
  };

  return mockService;
};

export const waitForAudioReady = async (page) => {
  await page.waitForFunction(() => {
    return window.AudioContext && document.querySelector('button:has-text("Play Audio")');
  });
};
```

### Test Configuration

Configure testing environment for audio functionality:

```typescript
// tests/setup.ts
import { configure } from '@testing-library/react';
import '@testing-library/jest-dom';

// Configure React Testing Library
configure({ 
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000 // Longer timeout for audio operations
});

// Mock Web Audio API
global.AudioContext = jest.fn().mockImplementation(() => ({
  createBufferSource: jest.fn().mockReturnValue({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    addEventListener: jest.fn()
  }),
  createGain: jest.fn().mockReturnValue({
    connect: jest.fn(),
    gain: { value: 1 }
  }),
  decodeAudioData: jest.fn().mockResolvedValue({}),
  resume: jest.fn().mockResolvedValue(),
  close: jest.fn().mockResolvedValue()
}));

// Mock Speech Synthesis API
global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn().mockReturnValue([])
};

// Mock fetch for TTS requests
global.fetch = jest.fn();

// Mock environment variables
process.env.ELEVENLABS_API_KEY = 'test-key';
process.env.OPENAI_API_KEY = 'test-key';
```

This comprehensive testing guide ensures reliability and performance of the consolidated Phase 4 audio system across all usage scenarios and platforms.