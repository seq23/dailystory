# Charlotte Audio Integration Guide

## Overview

This guide demonstrates how to integrate the consolidated Phase 4 audio system into your components using **CharlotteVoiceService** and **useAudioControls**. All integration patterns are based on the current, active codebase.

## Primary Integration: useAudioControls Hook

### Basic Story Page Integration

The most common integration pattern for story pages with audio playback and word highlighting:

```typescript
import { useAudioControls } from '@/hooks/useAudioControls';

interface StoryPageProps {
  content: string;
  userInfo: SafeUserInfo;
  currentPage: number;
  difficulty?: "beginner" | "easy" | "medium" | "hard" | "expert";
}

function StoryPage({ content, userInfo, currentPage, difficulty = "medium" }: StoryPageProps) {
  // Single hook consolidates all audio functionality
  const audioControls = useAudioControls({
    text: content,
    userInfo,
    currentPage,
    difficulty,
    isPremium: userInfo?.isPremium,
    contentHash: generateContentHash(content) // Optional: for caching
  });

  return (
    <div className="story-page">
      {/* Story content with word highlighting */}
      <div className="story-content">
        {content.split(' ').map((word, index) => (
          <span
            key={index}
            className={
              audioControls.currentHighlightedWord === word 
                ? 'highlighted-word' 
                : ''
            }
          >
            {word}{' '}
          </span>
        ))}
      </div>

      {/* Audio controls */}
      <div className="audio-controls">
        <button 
          onClick={audioControls.playAudio}
          disabled={!audioControls.canUseAudio || audioControls.isPlaying}
        >
          {audioControls.isPlaying ? 'Playing...' : 'Play Audio'}
        </button>
        
        <button 
          onClick={audioControls.stopAudio}
          disabled={!audioControls.isPlaying}
        >
          Stop Audio
        </button>
        
        <button onClick={audioControls.clearHighlighting}>
          Clear Highlighting
        </button>
      </div>

      {/* Session info for free users */}
      {!userInfo?.isPremium && (
        <div className="session-info">
          Time remaining: {Math.floor(audioControls.remainingTime / 60)}:{
            String(audioControls.remainingTime % 60).padStart(2, '0')
          }
        </div>
      )}

      {/* Vocabulary tracking display */}
      <div className="vocabulary-info">
        Words learned: {audioControls.vocabularyState.learnedWords.length}
        Difficult words: {audioControls.vocabularyState.difficultWords.length}
      </div>
    </div>
  );
}
```

### Advanced Integration with Custom Highlighting

For components that need custom word highlighting behavior:

```typescript
import { useAudioControls } from '@/hooks/useAudioControls';

function AdvancedStoryDisplay({ content, userInfo, currentPage }) {
  const audioControls = useAudioControls({
    text: content,
    userInfo,
    currentPage,
    difficulty: "hard", // More advanced highlighting
    isPremium: userInfo?.isPremium
  });

  // Custom highlighting with word difficulty indication
  const renderHighlightedContent = () => {
    return content.split(' ').map((word, index) => {
      const isHighlighted = audioControls.currentHighlightedWord === word;
      const isDifficult = audioControls.vocabularyState.difficultWords.includes(word);
      const isLearned = audioControls.vocabularyState.learnedWords.includes(word);

      return (
        <span
          key={index}
          className={`
            word
            ${isHighlighted ? 'word-highlighted' : ''}
            ${isDifficult ? 'word-difficult' : ''}
            ${isLearned ? 'word-learned' : ''}
          `}
          onClick={() => {
            // Manual vocabulary tracking
            audioControls.updateVocabulary(word);
          }}
        >
          {word}
        </span>
      );
    });
  };

  return (
    <div className="advanced-story-display">
      <div className="content-area">
        {renderHighlightedContent()}
      </div>
      
      {/* Audio controls with enhanced features */}
      <AudioEnhancedControls audioControls={audioControls} />
    </div>
  );
}
```

## Direct Service Integration: CharlotteVoiceService

### When to Use Direct Service Integration

Use **CharlotteVoiceService** directly when you need:
- Custom audio flows outside of standard story pages
- Integration with voice commands
- Advanced TTS customization
- Background audio processing

```typescript
import { charlotteVoiceService } from '@/services/CharlotteVoiceService';

// Custom TTS generation without playback
async function generateCustomTTS(text: string, voiceId?: string) {
  try {
    const audioBuffer = await charlotteVoiceService.generateTTS(text, voiceId);
    // Process audio buffer as needed
    return audioBuffer;
  } catch (error) {
    console.error('TTS generation failed:', error);
    throw error;
  }
}

// Custom audio playback with specific synchronization
async function playWithCustomSync(text: string, onWordCallback: (word: string) => void) {
  await charlotteVoiceService.playTextWithSynchronization({
    text,
    onWordHighlight: (word, index) => {
      onWordCallback(word);
      // Custom highlighting logic
      highlightWordElement(word, index);
    },
    onComplete: () => {
      console.log('Audio playback completed');
      // Custom completion handling
    },
    voiceId: 'custom-voice-id'
  });
}

// Check audio permissions and capabilities
function validateAudioCapabilities(isPremium: boolean, sessionTime: number) {
  const canUse = charlotteVoiceService.canUseAudio(isPremium, sessionTime);
  
  if (!canUse) {
    console.log('Audio usage not available:', {
      isPremium,
      sessionTime,
      maxFreeTime: 20 * 60 // 20 minutes for free users
    });
  }
  
  return canUse;
}
```

### Legacy SimplifiedAudioEngine Interface

For components that still use the old **SimplifiedAudioEngine** interface, **CharlotteVoiceService** provides backward compatibility:

```typescript
// This still works - CharlotteVoiceService provides the interface
import { SimplifiedAudioEngine } from '@/services/CharlotteVoiceService';

async function legacyAudioIntegration() {
  const engine = await SimplifiedAudioEngine();
  
  // Old interface still works
  await engine.playText('Story content', {
    onWordHighlight: (word) => console.log('Highlighting:', word),
    voiceId: 'Charlotte'
  });
}
```

## Voice Command Integration

### Charlotte Voice Assistant Integration

Integration with the Charlotte voice assistant using the consolidated system:

```typescript
import { useConversation } from '@11labs/react';
import { charlotteVoiceService } from '@/services/CharlotteVoiceService';

function VoiceControlledStoryPage({ content, userInfo, currentPage }) {
  const audioControls = useAudioControls({
    text: content,
    userInfo,
    currentPage,
    isPremium: userInfo?.isPremium
  });

  // Charlotte voice conversation
  const conversation = useConversation({
    onMessage: async (message) => {
      // Voice command processing
      if (message.message.includes('play story')) {
        await audioControls.playAudio();
      } else if (message.message.includes('stop')) {
        audioControls.stopAudio();
      } else if (message.message.includes('highlight word')) {
        const word = extractWordFromMessage(message.message);
        audioControls.highlightWord(word, 0);
      }
    },
    onError: (error) => {
      console.error('Charlotte conversation error:', error);
    }
  });

  return (
    <div className="voice-controlled-story">
      {/* Standard story display */}
      <StoryContent 
        content={content}
        highlightedWord={audioControls.currentHighlightedWord}
      />
      
      {/* Voice controls */}
      <VoiceControls 
        conversation={conversation}
        audioControls={audioControls}
      />
    </div>
  );
}
```

### Custom Voice Commands

Creating custom voice command handlers that integrate with the audio system:

```typescript
const voiceCommandHandlers = {
  'read this page': async (audioControls) => {
    if (audioControls.canUseAudio) {
      await audioControls.playAudio();
    } else {
      console.log('Audio not available');
    }
  },
  
  'highlight word {word}': async (audioControls, { word }) => {
    audioControls.highlightWord(word, 0);
    
    // Optional: Play just that word
    await charlotteVoiceService.playTextWithSynchronization({
      text: word,
      onWordHighlight: audioControls.highlightWord
    });
  },
  
  'show vocabulary': (audioControls) => {
    console.log('Vocabulary state:', audioControls.vocabularyState);
    // Display vocabulary UI
  },
  
  'clear highlights': (audioControls) => {
    audioControls.clearHighlighting();
  }
};
```

## Debug Integration

### UnifiedDebugMonitor Integration

Enable comprehensive debugging for audio functionality:

```typescript
import { UnifiedDebugMonitor } from '@/components/UnifiedDebugMonitor';

function AppWithDebug() {
  // Check for debug parameter
  const showDebug = new URLSearchParams(window.location.search).get('debug') === '1';
  
  return (
    <div className="app">
      {/* Your main application */}
      <Router>
        <Routes>
          <Route path="/story" element={<StoryPage />} />
          <Route path="/testing" element={<PromptTesting />} />
        </Routes>
      </Router>
      
      {/* Unified debug monitor */}
      {showDebug && <UnifiedDebugMonitor />}
    </div>
  );
}
```

### Custom Debug Integration

For components that need specific debug information:

```typescript
function StoryPageWithDebug({ content, userInfo, currentPage }) {
  const audioControls = useAudioControls({
    text: content,
    userInfo,
    currentPage,
    isPremium: userInfo?.isPremium
  });

  // Debug information display
  const debugInfo = {
    canUseAudio: audioControls.canUseAudio,
    isPlaying: audioControls.isPlaying,
    sessionTimeUsed: audioControls.sessionTimeUsed,
    remainingTime: audioControls.remainingTime,
    contentHash: audioControls.contentHash,
    isContentValid: audioControls.isContentValid,
    vocabularyWords: audioControls.vocabularyState.learnedWords.length,
    highlightedWord: audioControls.currentHighlightedWord
  };

  return (
    <div className="story-page-debug">
      <StoryContent content={content} audioControls={audioControls} />
      
      {/* Debug panel */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-panel">
          <h3>Audio Debug Info</h3>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          
          {/* Manual testing controls */}
          <button onClick={() => audioControls.highlightWord('test', 0)}>
            Test Highlight
          </button>
          <button onClick={() => audioControls.updateVocabulary('example')}>
            Add to Vocabulary
          </button>
        </div>
      )}
    </div>
  );
}
```

## Event-Driven Integration

### Audio Coordination Events

The consolidated system uses custom events for loose coupling between components:

```typescript
// Listen for audio events
useEffect(() => {
  const handleAudioRequest = (event) => {
    console.log('Audio request:', event.detail);
  };
  
  const handleAudioStop = (event) => {
    console.log('Audio stopped:', event.detail);
  };
  
  const handleWordHighlight = (event) => {
    console.log('Word highlighted:', event.detail);
  };

  window.addEventListener('audioCoordinatorRequest', handleAudioRequest);
  window.addEventListener('audioCoordinatorStop', handleAudioStop);
  window.addEventListener('wordHighlighted', handleWordHighlight);

  return () => {
    window.removeEventListener('audioCoordinatorRequest', handleAudioRequest);
    window.removeEventListener('audioCoordinatorStop', handleAudioStop);
    window.removeEventListener('wordHighlighted', handleWordHighlight);
  };
}, []);

// Dispatch custom audio events
function customAudioFlow() {
  // Request audio focus
  window.dispatchEvent(new CustomEvent('audioCoordinatorRequest', {
    detail: { system: 'custom-component', priority: 'medium' }
  }));
  
  // Notify word highlighting
  window.dispatchEvent(new CustomEvent('wordHighlighted', {
    detail: { word: 'example', index: 0 }
  }));
}
```

## Error Handling Integration

### Comprehensive Error Handling

Handle errors gracefully in audio integrations:

```typescript
function RobustStoryPage({ content, userInfo, currentPage }) {
  const [audioError, setAudioError] = useState(null);
  
  const audioControls = useAudioControls({
    text: content,
    userInfo,
    currentPage,
    isPremium: userInfo?.isPremium
  });

  const handleAudioPlay = async () => {
    try {
      setAudioError(null);
      await audioControls.playAudio();
    } catch (error) {
      console.error('Audio playback failed:', error);
      setAudioError(error.message);
      
      // Fallback to text display
      showTextFallback(content);
    }
  };

  return (
    <div className="robust-story-page">
      <StoryContent content={content} audioControls={audioControls} />
      
      {/* Audio controls with error handling */}
      <div className="audio-controls">
        <button onClick={handleAudioPlay}>Play Audio</button>
        
        {audioError && (
          <div className="audio-error">
            <p>Audio Error: {audioError}</p>
            <button onClick={() => setAudioError(null)}>Dismiss</button>
          </div>
        )}
      </div>
      
      {/* Fallback text display */}
      {audioError && (
        <div className="text-fallback">
          <p>Audio unavailable. Reading text content:</p>
          <div className="text-content">{content}</div>
        </div>
      )}
    </div>
  );
}
```

## Performance Optimization

### Lazy Loading and Resource Management

Optimize audio integration performance:

```typescript
import { lazy, Suspense } from 'react';

// Lazy load heavy audio components
const UnifiedDebugMonitor = lazy(() => import('@/components/UnifiedDebugMonitor'));
const VoiceControlPanel = lazy(() => import('@/components/VoiceControlPanel'));

function OptimizedStoryPage({ content, userInfo, currentPage }) {
  const audioControls = useAudioControls({
    text: content,
    userInfo,
    currentPage,
    isPremium: userInfo?.isPremium
  });

  return (
    <div className="optimized-story-page">
      <StoryContent content={content} audioControls={audioControls} />
      
      {/* Lazy load debug components */}
      {process.env.NODE_ENV === 'development' && (
        <Suspense fallback={<div>Loading debug tools...</div>}>
          <UnifiedDebugMonitor />
        </Suspense>
      )}
      
      {/* Lazy load voice controls */}
      {audioControls.canUseAudio && (
        <Suspense fallback={<div>Loading voice controls...</div>}>
          <VoiceControlPanel audioControls={audioControls} />
        </Suspense>
      )}
    </div>
  );
}

// Cleanup on component unmount
useEffect(() => {
  return () => {
    // Audio controls handle their own cleanup
    audioControls.stopAudio();
    audioControls.clearHighlighting();
  };
}, [audioControls]);
```

## Testing Integration

### Component Testing with Audio Controls

Test components that use the consolidated audio system:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { useAudioControls } from '@/hooks/useAudioControls';

// Mock the hook for testing
jest.mock('@/hooks/useAudioControls');

describe('StoryPage Audio Integration', () => {
  const mockAudioControls = {
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
    isContentValid: true
  };

  beforeEach(() => {
    useAudioControls.mockReturnValue(mockAudioControls);
  });

  test('plays audio when play button clicked', async () => {
    render(<StoryPage content="Test content" userInfo={mockUser} currentPage={1} />);
    
    const playButton = screen.getByText('Play Audio');
    fireEvent.click(playButton);
    
    expect(mockAudioControls.playAudio).toHaveBeenCalled();
  });

  test('displays highlighted word', () => {
    mockAudioControls.currentHighlightedWord = 'highlighted';
    
    render(<StoryPage content="Test highlighted content" userInfo={mockUser} currentPage={1} />);
    
    expect(screen.getByText('highlighted')).toHaveClass('highlighted-word');
  });
});
```

This integration guide provides comprehensive examples for integrating the Phase 4 consolidated audio system. All patterns are based on the current, active implementation and will work immediately in your application.