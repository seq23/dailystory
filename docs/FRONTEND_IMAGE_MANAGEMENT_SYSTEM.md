# Frontend Image Management System

## 🎨 **Image Loading Architecture**

<lov-mermaid>
graph TD
    A[Component Requests Image] --> B[useImageWithFallback Hook]
    B --> C[useSessionAwareImageLoader]
    C --> D[ImageLoadingManager Singleton]
    D --> E{Request Deduplication}
    E -->|New Request| F[Load Image]
    E -->|Duplicate| G[Return Existing Promise]
    
    F --> H{Circuit Breaker Check}
    H -->|Domain OK| I[Attempt Load]
    H -->|Domain Failed| J[Skip to Fallback]
    
    I --> K{Load Success?}
    K -->|Yes| L[Cache & Return]
    K -->|No| M[Retry Logic]
    
    M --> N{Retries Left?}
    N -->|Yes| I
    N -->|No| O[ImageFallbackService]
    
    J --> O
    O --> P[Return Static Fallback]
    L --> Q[Component Renders Image]
    P --> Q
</lov-mermaid>

## **useImageWithFallback Hook**

### **Hook Interface**
```typescript
// From src/hooks/useImageWithFallback.ts
interface UseImageWithFallbackOptions {
  fallbackText?: string;
  retryAttempts?: number;
  retryDelay?: number;
}

export const useImageWithFallback = (
  src: string, 
  options: UseImageWithFallbackOptions = {}
) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);
  const [isManualRetry, setIsManualRetry] = useState<boolean>(false);
  
  // ... implementation
  
  return {
    imageSrc,
    isLoading,
    error,
    isUsingFallback,
    isManualRetry,
    setImageWithValidation,
    manualRetry
  };
};
```

### **Retry Logic Implementation**
```typescript
// Actual retry logic from useImageWithFallback
const loadImageWithRetry = useCallback(async (
  imageUrl: string, 
  attempt: number = 1
): Promise<void> => {
  try {
    setIsLoading(true);
    setError(null);
    
    const success = await ImageLoadingManager.loadImage(imageUrl, {
      timeout: 10000,
      isDebugMode: window.location.search.includes('debug=1'),
      onProgress: (stage) => {
        debugLog(`Load progress for ${imageUrl.substring(0, 50)}: ${stage}`);
      }
    });
    
    if (success) {
      setImageSrc(imageUrl);
      setIsUsingFallback(false);
      setIsLoading(false);
    } else {
      throw new Error('Image load failed');
    }
  } catch (error) {
    debugLog(`Attempt ${attempt} failed for ${imageUrl}: ${error.message}`);
    
    if (attempt < retryAttempts) {
      setTimeout(() => {
        loadImageWithRetry(imageUrl, attempt + 1);
      }, retryDelay);
    } else {
      handleFallback(error.message);
    }
  }
}, [retryAttempts, retryDelay]);
```

## **ImageLoadingManager Singleton**

### **Core Features**
```typescript
// From src/services/ImageLoadingManager.ts
class ImageLoadingManagerClass {
  private activeLoads = new Map<string, LoadingRequest>();
  private recentFailures = new Map<string, number>();
  private globalFailureCount = 0;
  private readonly circuitBreakerThreshold = 5;
  private readonly failureWindowMs = 300000; // 5 minutes

  async loadImage(url: string, options?: {
    timeout?: number;
    isDebugMode?: boolean;
    onProgress?: (stage: string) => void;
    sessionId?: string;
  }): Promise<boolean> {
    const { timeout = 10000, isDebugMode = false, onProgress, sessionId } = options || {};
    
    // Create session-aware cache key
    const cacheKey = sessionId ? `${sessionId}:${url}` : url;
    
    // Check for existing request
    if (this.activeLoads.has(cacheKey)) {
      onProgress?.('⏳ Waiting for existing request...');
      return this.activeLoads.get(cacheKey)!.promise;
    }
    
    // Circuit breaker check
    if (this.shouldCircuitBreak(url)) {
      onProgress?.('🔒 Circuit breaker active');
      return false;
    }
    
    // Create new load request
    const loadRequest = this.performLoad(url, timeout, onProgress);
    
    this.activeLoads.set(cacheKey, {
      promise: loadRequest,
      callbacks: [],
      startTime: Date.now()
    });
    
    try {
      const result = await loadRequest;
      this.activeLoads.delete(cacheKey);
      return result;
    } catch (error) {
      this.activeLoads.delete(cacheKey);
      this.recordFailure(url);
      throw error;
    }
  }
}
```

### **Circuit Breaker Logic**
```typescript
// Actual circuit breaker implementation
shouldCircuitBreak(url: string): boolean {
  const domain = this.extractDomain(url);
  const failures = this.recentFailures.get(domain) || 0;
  
  if (failures >= this.circuitBreakerThreshold) {
    console.warn(`🔒 Circuit breaker active for domain: ${domain} (${failures} failures)`);
    return true;
  }
  
  return false;
}

recordFailure(url: string): void {
  const domain = this.extractDomain(url);
  const currentFailures = this.recentFailures.get(domain) || 0;
  this.recentFailures.set(domain, currentFailures + 1);
  this.globalFailureCount++;
  
  // Clean up old failures after window expires
  setTimeout(() => {
    const failures = this.recentFailures.get(domain) || 0;
    if (failures > 0) {
      this.recentFailures.set(domain, failures - 1);
    }
  }, this.failureWindowMs);
}
```

## **Session-Aware Image Loader**

### **Hook Implementation**
```typescript
// From src/hooks/useSessionAwareImageLoader.ts
export function useSessionAwareImageLoader(options: UseSessionAwareImageLoaderOptions = {}) {
  const { sessionId, timeout = 10000, isDebugMode = false } = options;

  const loadImage = useCallback(async (
    url: string,
    onProgress?: (stage: string) => void
  ): Promise<boolean> => {
    DebugLogger.log('image', 'Loading image with session context:', {
      url: url.substring(0, 50) + '...',
      sessionId,
      timeout,
      isDebugMode
    });
    
    return ImageLoadingManager.loadImage(url, {
      timeout,
      isDebugMode,
      sessionId, // Pass session context for proper isolation
      onProgress
    });
  }, [sessionId, timeout, isDebugMode]);

  return { loadImage };
}
```

### **Session Context Usage**
```typescript
// How components use session-aware loading
const CleanStoryDisplay = ({ sessionId, stableSessionId }) => {
  const { loadImage } = useSessionAwareImageLoader({
    sessionId: stableSessionId, // Use stableSessionId for consistency
    timeout: 15000,
    isDebugMode: debugMode
  });
  
  // ... component logic
};
```

## **ImageFallbackService**

### **Static Fallback System**
```typescript
// From src/services/ImageFallbackService.ts
export class ImageFallbackService {
  // 6 static fallback images - "Children with 'Images Not Working' signs"
  private static readonly FALLBACK_IMAGES_BASE64 = [
    "/assets/images-not-working-1.webp",
    "/assets/images-not-working-2.webp", 
    "/assets/images-not-working-3.webp",
    "/assets/images-not-working-5.webp",
    "/assets/images-not-working-6.webp",
    "/assets/images-not-working-7.webp"
  ];

  /**
   * Get a fallback image by index (0-5)
   */
  static getFallbackImage(index: number = 0): string {
    const safeIndex = Math.abs(index) % this.FALLBACK_IMAGES_BASE64.length;
    return this.FALLBACK_IMAGES_BASE64[safeIndex];
  }

  /**
   * Generate a story-specific placeholder with page context
   */
  static generateStoryPlaceholder(storyText: string, pageNumber: number): string {
    // Use page number to cycle through the 6 fallback images
    const imageIndex = (pageNumber - 1) % this.FALLBACK_IMAGES_BASE64.length;
    return this.FALLBACK_IMAGES_BASE64[imageIndex];
  }

  /**
   * Get a character-themed placeholder
   */
  static generateCharacterPlaceholder(characterName: string, pageNumber: number): string {
    // Use character name hash + page number for consistent but varied selection
    const nameHash = characterName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imageIndex = Math.abs(nameHash + pageNumber) % this.FALLBACK_IMAGES_BASE64.length;
    return this.FALLBACK_IMAGES_BASE64[imageIndex];
  }
}
```

### **Fallback Selection Logic**
```typescript
// How fallbacks are selected
const selectFallback = (storyText: string, pageNumber: number, characterName?: string) => {
  if (characterName) {
    return ImageFallbackService.generateCharacterPlaceholder(characterName, pageNumber);
  } else {
    return ImageFallbackService.generateStoryPlaceholder(storyText, pageNumber);
  }
};
```

## **ImageWithFallback Component**

### **Component Implementation**
```typescript
// From src/components/ImageWithFallback.tsx
export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = "",
  containerClassName = "",
  fallbackText,
  onLoad,
  onFallback
}) => {
  const {
    imageSrc,
    isLoading,
    error,
    isUsingFallback,
    manualRetry
  } = useImageWithFallback(src, { fallbackText });

  useEffect(() => {
    if (!isLoading && !error && imageSrc) {
      onLoad?.(imageSrc);
    }
  }, [isLoading, error, imageSrc, onLoad]);

  useEffect(() => {
    if (isUsingFallback) {
      onFallback?.(imageSrc);
    }
  }, [isUsingFallback, imageSrc, onFallback]);

  if (isLoading) {
    return (
      <div className={`relative ${containerClassName}`}>
        <div className="animate-pulse bg-muted rounded-lg aspect-square flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${containerClassName}`}>
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        onError={(e) => {
          console.warn('Image render error:', e.currentTarget.src);
        }}
      />
      
      {isUsingFallback && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
          Fallback
        </div>
      )}
      
      {error && !window.location.search.includes('debug=1') && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
          <div className="text-muted-foreground text-sm text-center">
            Image unavailable
          </div>
        </div>
      )}
    </div>
  );
};
```

## **Performance Optimizations**

### **Request Deduplication**
```typescript
// Prevent duplicate requests for same image
if (this.activeLoads.has(cacheKey)) {
  onProgress?.('⏳ Waiting for existing request...');
  return this.activeLoads.get(cacheKey)!.promise;
}
```

### **Circuit Breaker Protection**
```typescript
// Prevent overwhelming failed domains
if (this.shouldCircuitBreak(url)) {
  onProgress?.('🔒 Circuit breaker active');
  return false;
}
```

### **Session Isolation**
```typescript
// Session-aware cache keys prevent cross-contamination
const cacheKey = sessionId ? `${sessionId}:${url}` : url;
```

## **Debug Capabilities**

### **Debug Logging**
```typescript
// From useImageWithFallback
const debugLog = useCallback((message: string, data?: any) => {
  if (window.location.search.includes('debug=1')) {
    DebugLogger.log('image-fallback', message, data);
    
    // Update session cache debug console
    SessionCacheDebugConsoleClass.updateImageDebugInfo({
      currentImage: src,
      fallbackActive: isUsingFallback,
      loadingState: isLoading,
      lastError: error
    });
  }
}, [src, isUsingFallback, isLoading, error]);
```

### **Performance Monitoring**
```typescript
// ImageLoadingManager statistics
getStats(): { activeLoads: number; recentFailures: [string, number][]; globalFailures: number; } {
  return {
    activeLoads: this.activeLoads.size,
    recentFailures: Array.from(this.recentFailures.entries()),
    globalFailures: this.globalFailureCount
  };
}
```

## **Integration Flow**

<lov-mermaid>
sequenceDiagram
    participant Component
    participant Hook as useImageWithFallback
    participant Loader as useSessionAwareImageLoader  
    participant Manager as ImageLoadingManager
    participant Fallback as ImageFallbackService
    
    Component->>Hook: Request image with src
    Hook->>Loader: Load with session context
    Loader->>Manager: loadImage(url, sessionId)
    
    alt Circuit breaker allows
        Manager->>Manager: Attempt image load
        alt Load successful
            Manager-->>Hook: Image loaded
            Hook-->>Component: Render image
        else Load failed
            Manager->>Fallback: getFallbackImage()
            Fallback-->>Hook: Static fallback
            Hook-->>Component: Render fallback
        end
    else Circuit breaker blocks
        Manager->>Fallback: getFallbackImage()
        Fallback-->>Hook: Static fallback
        Hook-->>Component: Render fallback
    end
</lov-mermaid>

## **Routing Policy v2: Orchestrator-First**

### **Policy Overview**
The client **always** calls `runware-generate-image` (orchestrator) first. Only when the orchestrator is unreachable or clearly fails do we attempt `ai-visual-scene-creator` (Direct Mode), then Tier 2.5C templates, then Tier 2.5D, then Tier 4 SVG fallback.

### **Complete Tier Cascade**
1. **Tier 1**: Orchestrator (`runware-generate-image`) attempts internal cascade (Tier 1 → Tier 2.5A)
2. **Direct Mode**: If orchestrator fails, attempt `ai-visual-scene-creator` directly
3. **Tier 2.5C**: Template-based generation via `runware-template-cd`
4. **Tier 2.5D**: Enhanced template fallback
5. **Tier 4**: SVG placeholder generation

### **Never-Ending Story Guarantee**
- Tier selection **never** concludes stories artificially
- Tier 2.5C and higher are visual fallbacks only
- Premium users can continue stories indefinitely regardless of tier
- Guest users are limited by business rules (6 pages), not tier limitations

### **Spinner Completion**
- `image:generation:complete` event is emitted on all code paths
- Success, all fallbacks, and error states trigger completion
- Prevents perpetual loading states

### **Orchestrator-First Flow**

<lov-mermaid>
sequenceDiagram
  participant UI as UI
  participant ORCH as runware-generate-image
  participant DIRECT as ai-visual-scene-creator
  participant T25C as runware-template-cd
  participant T25D as Enhanced Templates
  participant T4 as SVG Fallback

  UI->>ORCH: POST /runware-generate-image (Tier 1, 2.5A cascade inside)
  alt Orchestrator returns success
    ORCH-->>UI: { success: true, imageURL, usedTier }
    UI->>UI: stop spinner, cache image
  else Orchestrator fails/unreachable
    UI->>DIRECT: POST /ai-visual-scene-creator (Direct Mode)
    alt Direct Mode returns success
      DIRECT-->>UI: { success: true, imageURL }
      UI->>UI: stop spinner, cache image
    else Direct Mode fails
      UI->>T25C: POST /runware-template-cd (Tier 2.5C)
      alt Template success
        T25C-->>UI: { success: true, imageURL }
        UI->>UI: stop spinner, cache image
      else Template fails
        UI->>T25D: Enhanced template fallback
        alt T25D success
          T25D-->>UI: { success: true, imageURL }
          UI->>UI: stop spinner, cache image
        else T25D fails
          UI->>T4: SVG generation
          T4-->>UI: { success: true, imageURL: SVG }
          UI->>UI: stop spinner, cache image
        end
      end
    end
  end
</lov-mermaid>

---
*Last Updated: September 21, 2025*  
*System Status: All image loading components operational*