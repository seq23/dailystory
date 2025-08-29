# Technical Implementation Guide

## Overview
Detailed technical documentation covering the implementation of anti-flicker systems, content-aware text sizing, universal difficulty management, and enhanced image loading.

## useContentAwareTextSize Hook Implementation

### Core Algorithm
```typescript
export const useContentAwareTextSize = (text: string, isMobile: boolean = false): ContentAwareTextConfig => {
  const wordCount = useMemo(() => {
    if (!text || typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, [text]);

  return useMemo(() => {
    let fontSize: string;
    let lineHeight: string;
    let letterSpacing: string;
    let paragraphSpacing: string;
    let maxWordsPerLine: number;

    // Dynamic sizing based on word count and viewport
    if (wordCount <= 6) {
      // Very short content - large, prominent text
      fontSize = isMobile ? "1.75rem" : "2rem";
      lineHeight = "1.3";
      letterSpacing = "0.01em";
      paragraphSpacing = "1.5rem";
      maxWordsPerLine = 8;
    } else if (wordCount <= 15) {
      // Short content - medium-large text
      fontSize = isMobile ? "1.5rem" : "1.75rem";
      lineHeight = "1.4";
      letterSpacing = "0.005em";
      paragraphSpacing = "1.25rem";
      maxWordsPerLine = 10;
    } else if (wordCount <= 30) {
      // Medium content - balanced sizing
      fontSize = isMobile ? "1.25rem" : "1.5rem";
      lineHeight = "1.5";
      letterSpacing = "0em";
      paragraphSpacing = "1rem";
      maxWordsPerLine = 12;
    } else if (wordCount <= 60) {
      // Longer content - comfortable reading size
      fontSize = isMobile ? "1.125rem" : "1.25rem";
      lineHeight = "1.6";
      letterSpacing = "-0.005em";
      paragraphSpacing = "0.875rem";
      maxWordsPerLine = 14;
    } else {
      // Very long content - compact but readable
      fontSize = isMobile ? "1rem" : "1.125rem";
      lineHeight = "1.7";
      letterSpacing = "-0.01em";
      paragraphSpacing = "0.75rem";
      maxWordsPerLine = 16;
    }

    return {
      fontSize,
      lineHeight,
      letterSpacing,
      paragraphSpacing,
      maxWordsPerLine
    };
  }, [wordCount, isMobile]);
};
```

### Container Adaptation Hook
```typescript
export const useContentAwareContainer = (wordCount: number): string => {
  return useMemo(() => {
    const baseClasses = "transition-all duration-300 ease-in-out";
    
    if (wordCount <= 10) {
      // Short content - wider container for impact
      return cn(baseClasses, "max-w-3xl px-8 py-6");
    } else if (wordCount <= 30) {
      // Medium content - balanced container
      return cn(baseClasses, "max-w-2xl px-6 py-5");
    } else if (wordCount <= 60) {
      // Longer content - comfortable reading width
      return cn(baseClasses, "max-w-xl px-5 py-4");
    } else {
      // Very long content - narrow for optimal line length
      return cn(baseClasses, "max-w-lg px-4 py-3");
    }
  }, [wordCount]);
};
```

## Story Stability State Management

### isStoryStable Implementation
```typescript
// CleanStoryDisplay.tsx - Story stability management
const [isStoryStable, setIsStoryStable] = useState(false);

// Debounced stability state management
const setStoryStability = useCallback(
  debounce((stable: boolean) => {
    setIsStoryStable(stable);
    
    // Bulletproof event dispatch
    if (stable && story.length > 0) {
      window.dispatchEvent(new CustomEvent('story:stabilized', { 
        detail: { 
          pageCount: story.length, 
          currentPage,
          timestamp: Date.now()
        } 
      }));
      console.log('📖 Story stabilized:', { stable, pageCount: story.length, currentPage });
    }
  }, 50), // 50ms debounce prevents rapid toggling
  [story.length, currentPage]
);

// Story loading effect with minimum duration
useEffect(() => {
  const LOADER_MIN_MS = 1600; // Minimum loader duration for consistent UX
  const loadStartTime = Date.now();
  
  if (story.length > 0 && !isLoading) {
    const elapsedTime = Date.now() - loadStartTime;
    const remainingTime = Math.max(0, LOADER_MIN_MS - elapsedTime);
    
    setTimeout(() => {
      setStoryStability(true);
    }, remainingTime);
  } else {
    setStoryStability(false);
  }
}, [story.length, isLoading, setStoryStability]);
```

### Story Content Logger Integration
```typescript
// StoryContentLogger.ts - Content change monitoring
export class StoryContentLogger {
  private static changeHistory: Array<{
    timestamp: number;
    type: string;
    phase: 'before' | 'after';
    contentLength: number;
    context: any;
  }> = [];

  static logStoryChange(type: string, phase: 'before' | 'after', content: string[], context: any = {}) {
    const timestamp = Date.now();
    const entry = {
      timestamp,
      type,
      phase,
      contentLength: content.length,
      context: {
        ...context,
        wordCount: this.countWords(content),
        currentPage: context.currentPage || 0
      }
    };

    this.changeHistory.push(entry);
    
    // Rapid change detection
    const recentChanges = this.changeHistory.filter(
      change => timestamp - change.timestamp < 1000
    );
    
    if (recentChanges.length > 2) {
      console.warn('🚨 Rapid story changes detected:', {
        changeCount: recentChanges.length,
        timeWindow: '1s',
        changes: recentChanges
      });
    }

    console.log(`📝 Story ${type} (${phase}):`, {
      contentLength: content.length,
      wordCount: entry.context.wordCount,
      context: entry.context
    });
  }

  private static countWords(content: string[]): number {
    return content.reduce((total, page) => {
      return total + (page?.trim().split(/\s+/).filter(word => word.length > 0).length || 0);
    }, 0);
  }
}
```

## Universal Difficulty System Implementation

### Difficulty Change Logic
```typescript
// CleanStoryDisplay.tsx - Universal difficulty updates
const handleDifficultyChange = async (direction: 'up' | 'down') => {
  // Block difficulty changes on template content (AI service unavailable)
  if (storySource === 'fallback') {
    toast({ 
      title: "Sorry, difficulty adjustments aren't available right now", 
      description: "Our AI story service is temporarily unavailable. Please start a new story to access different difficulty template content.",
      duration: 5000 
    });
    return;
  }

  setIsChangingDifficulty(true);
  setChangeDirection(direction === 'up' ? 'increase' : 'decrease');
  
  // ... difficulty calculation logic ...
  
  if (newIndex !== currentIndex) {
    const newDifficulty = difficultyLevels[newIndex];
    setCurrentDifficulty(newDifficulty);
    
    // Store difficulty preference locally
    DifficultyManager.storeDifficulty(userInfo.name || 'guest', newDifficulty, userInfo);
    
    // Universal live context updates for all users (premium restrictions removed)
    if (liveContext) {
      setLiveContext(prev => prev ? {
        ...prev, 
        difficulty: newDifficulty,
        expertGradeLevel: newDifficulty === 'expert' ? newGradeLevel : undefined
      } : null);
    }
    
    // Persist to Supabase profile when authenticated
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ 
          difficulty_level: newDifficulty 
        }).eq('user_id', user.id);
        
        // Save expert grade preferences
        if (newDifficulty === 'expert') {
          const reading_preferences = { ...basePrefs, lastExpertGrade: newGradeLevel };
          // ... save to user_preferences table
        }
      }
    } catch (e) {
      console.warn('Could not persist difficulty preference', e);
    }
  }
  
  // Animation completion
  setTimeout(() => {
    setIsChangingDifficulty(false);
    setChangeDirection(undefined);
  }, 800);
};
```

### Story Source Detection
```typescript
// Global source tracking system
try {
  (globalThis as any).__LAST_STORY_SOURCE__ = 'ai'; // or 'fallback' or 'emergency'
  (globalThis as any).__LAST_PAGE_SOURCE__ = (data as any)?.source || 'ai';
} catch (error) {
  console.warn('Could not set global source tracking:', error);
}

// Source-aware behavior
const [storySource, setStorySource] = useState<'ai' | 'fallback' | 'unknown'>('unknown');

useEffect(() => {
  try {
    const globalSource = (globalThis as any).__LAST_STORY_SOURCE__;
    if (globalSource) {
      setStorySource(globalSource);
      console.log('🧭 Story source detected:', globalSource);
    }
  } catch (error) {
    console.warn('Could not read global source:', error);
  }
}, [story.length]);
```

## Image Loading System Implementation

### useImageWithFallback Hook
```typescript
export const useImageWithFallback = (
  src: string | undefined, 
  options: UseImageWithFallbackOptions = {}
) => {
  const { fallbackText, retryAttempts = 2, retryDelay = 1000 } = options;
  
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [isManualRetry, setIsManualRetry] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const generateFallback = useCallback(() => {
    const fallbackSrc = ImageFallbackService.getBestFallback({
      text: fallbackText || '📖 Story Illustration'
    });
    setImageSrc(fallbackSrc);
    setIsUsingFallback(true);
    setIsLoading(false);
    console.log('🖼️ Using fallback image:', { fallbackText, isDataUrl: fallbackSrc.startsWith('data:') });
  }, [fallbackText]);

  const validateAndSetImage = useCallback(async (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Handle data URLs and blob URLs immediately
      if (url.startsWith('data:') || url.startsWith('blob:')) {
        setImageSrc(url);
        setIsLoading(false);
        setError(null);
        setIsUsingFallback(false);
        resolve(true);
        return;
      }

      // External URL validation with timeout
      const img = new Image();
      const timeoutId = setTimeout(() => {
        console.warn('🖼️ Image load timeout:', url);
        resolve(false);
      }, 10000); // 10 second timeout

      img.onload = () => {
        clearTimeout(timeoutId);
        setImageSrc(url);
        setIsLoading(false);
        setError(null);
        setIsUsingFallback(false);
        resolve(true);
      };

      img.onerror = (e) => {
        clearTimeout(timeoutId);
        console.error('🖼️ Image load error:', { url, error: e });
        resolve(false);
      };

      img.src = url;
    });
  }, []);

  const loadImageWithRetry = useCallback(async (url: string) => {
    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      console.log(`🖼️ Loading image attempt ${attempt}/${retryAttempts}:`, url);
      
      const success = await validateAndSetImage(url);
      if (success) {
        setRetryCount(0);
        return;
      }

      if (attempt < retryAttempts) {
        console.log(`🖼️ Retry ${attempt} failed, waiting ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    // All retries failed, use fallback
    console.warn('🖼️ All image load attempts failed, using fallback');
    setError(`Failed to load image after ${retryAttempts} attempts`);
    generateFallback();
    setRetryCount(0);
  }, [retryAttempts, retryDelay, validateAndSetImage, generateFallback]);

  // Main loading effect
  useEffect(() => {
    if (!src) {
      generateFallback();
      return;
    }

    // Don't reload if the src is already a fallback
    if (ImageFallbackService.isFallbackImage(src)) {
      setImageSrc(src);
      setIsUsingFallback(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    loadImageWithRetry(src);
  }, [src, loadImageWithRetry, generateFallback]);

  const manualRetry = useCallback(() => {
    if (!src || isManualRetry) return;
    
    setIsManualRetry(true);
    setIsLoading(true);
    setError(null);
    setRetryCount(prev => prev + 1);
    
    loadImageWithRetry(src).finally(() => {
      setIsManualRetry(false);
    });
  }, [src, isManualRetry, loadImageWithRetry]);

  return {
    imageSrc,
    isLoading,
    error,
    isUsingFallback,
    manualRetry,
    isManualRetry
  };
};
```

### Progressive Image Preloading
```typescript
// CleanStoryDisplay.tsx - Progressive preloading implementation
const preloadedUrlsRef = useRef<Set<string>>(new Set());

useEffect(() => {
  const urls: string[] = [];
  
  // Prefer forward direction (3 pages ahead), then backward (1 page)
  for (let i = currentPage + 1; i <= Math.min(currentPage + 3, story.length - 1); i++) {
    const url = pageImages[i];
    if (url && !preloadedUrlsRef.current.has(url)) {
      urls.push(url);
    }
  }
  
  // Add one backward page for context
  if (currentPage > 0) {
    const backUrl = pageImages[currentPage - 1];
    if (backUrl && !preloadedUrlsRef.current.has(backUrl)) {
      urls.push(backUrl);
    }
  }

  // Preload images without blocking UI
  urls.forEach(url => {
    const img = new Image();
    img.onload = () => {
      preloadedUrlsRef.current.add(url);
      console.log('🖼️ Preloaded image:', url);
    };
    img.onerror = (e) => {
      console.warn('🖼️ Preload failed:', url, e);
    };
    img.src = url;
  });

  // Cleanup old preloaded URLs to prevent memory leaks
  if (preloadedUrlsRef.current.size > 10) {
    const urlsArray = Array.from(preloadedUrlsRef.current);
    const toRemove = urlsArray.slice(0, urlsArray.length - 10);
    toRemove.forEach(url => preloadedUrlsRef.current.delete(url));
  }
}, [currentPage, pageImages, story.length]);
```

## CSS Integration and Styling

### Content-Aware Text Sizing CSS
```css
/* High specificity for content-aware sizing override */
.story-content--content-aware {
  font-size: var(--content-aware-font-size) !important;
  line-height: var(--content-aware-line-height) !important;
  letter-spacing: var(--content-aware-letter-spacing) !important;
  transition: font-size 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              line-height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              letter-spacing 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.story-content--content-aware p {
  margin-bottom: var(--content-aware-paragraph-spacing) !important;
  transition: margin-bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Smooth transitions for size changes */
.story-content--content-aware * {
  transition-property: font-size, line-height, letter-spacing, margin-bottom;
  transition-duration: 0.3s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Anti-Flicker Animation CSS
```css
/* Loading state transitions */
.story-loading-transition {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.4s ease-out, transform 0.4s ease-out;
}

.story-loading-transition.loaded {
  opacity: 1;
  transform: translateY(0);
}

/* Prevent layout shifts during loading */
.story-container {
  min-height: 400px;
  transition: min-height 0.3s ease;
}

/* Smooth difficulty change animations */
.difficulty-badge-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.difficulty-badge-transition.changing {
  transform: scale(1.1);
  opacity: 0.8;
}
```

## Integration Points and Event System

### Story Stabilization Events
```typescript
// Event listeners for story stabilization
useEffect(() => {
  const handleStoryStabilized = (event: CustomEvent) => {
    const { pageCount, currentPage, timestamp } = event.detail;
    console.log('📖 Story stabilized event received:', { pageCount, currentPage, timestamp });
    
    // Trigger image generation
    ImageGenerationTrigger.triggerGeneration({
      story,
      currentPage,
      userInfo,
      isStoryStable: true
    });
  };

  window.addEventListener('story:stabilized', handleStoryStabilized as EventListener);
  
  return () => {
    window.removeEventListener('story:stabilized', handleStoryStabilized as EventListener);
  };
}, [story, currentPage, userInfo]);
```

### Cross-Component Communication
```typescript
// Global state management for cross-component communication
export const StoryStateManager = {
  // Story stability state
  setStoryStable: (stable: boolean) => {
    window.dispatchEvent(new CustomEvent('story:stability:changed', {
      detail: { stable, timestamp: Date.now() }
    }));
  },
  
  // Content updates
  notifyContentChange: (content: string[], context: any) => {
    window.dispatchEvent(new CustomEvent('story:content:changed', {
      detail: { content, context, timestamp: Date.now() }
    }));
  },
  
  // Image loading events
  notifyImageLoaded: (pageIndex: number, imageUrl: string) => {
    window.dispatchEvent(new CustomEvent('story:image:loaded', {
      detail: { pageIndex, imageUrl, timestamp: Date.now() }
    }));
  }
};
```

## Error Handling and Recovery

### Comprehensive Error Boundaries
```typescript
// Error handling wrapper for story components
export const StoryErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={({ error, resetErrorBoundary }) => (
        <div className="error-boundary-fallback">
          <h2>Story Loading Error</h2>
          <p>Something went wrong while loading your story.</p>
          <button onClick={resetErrorBoundary}>Try Again</button>
          <details>
            <summary>Error Details</summary>
            <pre>{error?.message}</pre>
          </details>
        </div>
      )}
      onError={(error, errorInfo) => {
        console.error('🚨 Story Error Boundary:', { error, errorInfo });
        
        // Log error for debugging
        StoryContentLogger.logStoryChange('error', 'after', [], {
          error: error.message,
          errorInfo,
          timestamp: Date.now()
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
```

## Performance Monitoring and Debugging

### Performance Metrics Collection
```typescript
// Performance monitoring for story operations
export const StoryPerformanceMonitor = {
  startTiming: (operation: string) => {
    const key = `story_${operation}_start`;
    performance.mark(key);
    return key;
  },
  
  endTiming: (startKey: string, operation: string) => {
    const endKey = `story_${operation}_end`;
    performance.mark(endKey);
    
    try {
      performance.measure(`story_${operation}`, startKey, endKey);
      const measure = performance.getEntriesByName(`story_${operation}`)[0];
      
      console.log(`⏱️ Story ${operation} took ${measure.duration.toFixed(2)}ms`);
      
      // Log slow operations
      if (measure.duration > 1000) {
        console.warn(`🐌 Slow story operation detected: ${operation} took ${measure.duration.toFixed(2)}ms`);
      }
      
      return measure.duration;
    } catch (error) {
      console.warn('Performance measurement failed:', error);
      return null;
    }
  }
};
```

This comprehensive technical implementation ensures robust, performant, and maintainable story generation functionality with professional-grade anti-flicker mechanisms, intelligent content adaptation, and seamless user experience across all scenarios.