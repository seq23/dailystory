> **OUTDATED (superseded July 2026).** The tiered image pipeline described below no longer exists. See [IMAGE_GENERATION.md](./IMAGE_GENERATION.md) for the current system.

# Service Layer Image Orchestration

## 🎼 **Frontend Service Architecture**

<lov-mermaid>
graph TD
    A[React Components] --> B[SimpleImageService]
    B --> C[LiveGenerationService]
    C --> D[Supabase Functions]
    
    B --> E[Error Handling Layer]
    E --> F[Fallback Management]
    F --> G[ImageFallbackService]
    
    D --> H[runware-generate-image Orchestrator]
    H --> I[ai-visual-scene-creator]
    H --> J[runware-template-ab/cd]
    
    style B fill:#e3f2fd
    style C fill:#e8f5e9
    style E fill:#fff3e0
    style H fill:#fce4ec
</lov-mermaid>

## **SimpleImageService - Main Orchestrator**

### **Core Service Implementation**
```typescript
// Frontend image orchestration service
export class SimpleImageService {
  private static retryAttempts = 3;
  private static retryDelay = 2000;
  
  /**
   * Generate image through Supabase function chain
   */
  static async generateImage(
    storyText: string,
    pageNumber: number,
    sessionId: string,
    characterDetails: any,
    options: {
      timeout?: number;
      priority?: 'normal' | 'high';
      fallbackMode?: boolean;
    } = {}
  ): Promise<ImageGenerationResult> {
    
    const { timeout = 30000, priority = 'normal', fallbackMode = false } = options;
    const requestId = `IMG-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
    
    console.log(`🎨 [SIMPLE-IMAGE] Starting generation: ${requestId}`);
    console.log(`🎨 [SIMPLE-IMAGE] Page ${pageNumber}, Session: ${sessionId.substring(0, 8)}...`);
    
    const startTime = Date.now();
    
    try {
      // Call the orchestrator function
      const response = await supabase.functions.invoke('runware-generate-image', {
        body: {
          storyText,
          pageNumber,
          sessionId,
          characterDetails,
          requestId,
          priority,
          fallbackMode,
          timeout
        }
      });
      
      const processingTime = Date.now() - startTime;
      
      if (response.error) {
        throw new Error(`Backend generation failed: ${response.error.message}`);
      }
      
      const result = response.data;
      
      console.log(`🎨 [SIMPLE-IMAGE] SUCCESS: ${requestId} (${processingTime}ms)`);
      console.log(`🎨 [SIMPLE-IMAGE] Tier used: ${result.tierUsed}, Template: ${result.templateType}`);
      
      return {
        success: true,
        imageUrl: result.imageUrl,
        tierUsed: result.tierUsed,
        templateType: result.templateType,
        processingTime,
        requestId,
        metadata: result.metadata
      };
      
    } catch (error) {
      console.error(`🎨 [SIMPLE-IMAGE] FAILED: ${requestId}`, error);
      
      // Return fallback image
      const fallbackUrl = ImageFallbackService.generateStoryPlaceholder(storyText, pageNumber);
      
      return {
        success: false,
        imageUrl: fallbackUrl,
        tierUsed: 'FALLBACK',
        templateType: 'static-fallback',
        processingTime: Date.now() - startTime,
        requestId,
        error: error.message,
        metadata: {
          fallbackUsed: true,
          originalError: error.message
        }
      };
    }
  }
  
  /**
   * Generate with retry logic
   */
  static async generateWithRetry(
    storyText: string,
    pageNumber: number,
    sessionId: string,
    characterDetails: any,
    attempt: number = 1
  ): Promise<ImageGenerationResult> {
    
    try {
      return await this.generateImage(storyText, pageNumber, sessionId, characterDetails, {
        timeout: attempt === 1 ? 15000 : 30000, // Longer timeout on retries
        priority: attempt > 1 ? 'high' : 'normal'
      });
    } catch (error) {
      if (attempt < this.retryAttempts) {
        console.log(`🔄 [SIMPLE-IMAGE] Retry ${attempt + 1}/${this.retryAttempts} in ${this.retryDelay}ms`);
        
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        return this.generateWithRetry(storyText, pageNumber, sessionId, characterDetails, attempt + 1);
      }
      
      throw error;
    }
  }
  
  /**
   * Batch generation for multiple pages (Netflix mode)
   */
  static async generateBatch(
    pages: Array<{
      storyText: string;
      pageNumber: number;
    }>,
    sessionId: string,
    characterDetails: any
  ): Promise<Map<number, ImageGenerationResult>> {
    
    console.log(`🎬 [SIMPLE-IMAGE] Batch generation: ${pages.length} pages`);
    
    const results = new Map<number, ImageGenerationResult>();
    const concurrentLimit = 3; // Limit concurrent requests
    
    // Process in batches to avoid overwhelming the backend
    for (let i = 0; i < pages.length; i += concurrentLimit) {
      const batch = pages.slice(i, i + concurrentLimit);
      
      const batchPromises = batch.map(async (page) => {
        const result = await this.generateWithRetry(
          page.storyText,
          page.pageNumber,
          sessionId,
          characterDetails
        );
        results.set(page.pageNumber, result);
        return result;
      });
      
      await Promise.all(batchPromises);
      
      // Brief pause between batches
      if (i + concurrentLimit < pages.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`🎬 [SIMPLE-IMAGE] Batch complete: ${results.size} images generated`);
    return results;
  }
}
```

## **LiveGenerationService Integration**

### **Service Integration Pattern**
```typescript
// From LiveGenerationService integration
export class LiveGenerationService {
  private imageService: typeof SimpleImageService;
  
  constructor() {
    this.imageService = SimpleImageService;
  }
  
  /**
   * Generate image for current page (Premium live mode)
   */
  async generatePageImage(
    pageContent: string,
    pageNumber: number,
    sessionId: string,
    avatarConfig: AvatarConfig
  ): Promise<string> {
    
    console.log(`📖 [LIVE-GEN] Generating page ${pageNumber} image`);
    
    try {
      const result = await this.imageService.generateWithRetry(
        pageContent,
        pageNumber,
        sessionId,
        {
          skinTone: avatarConfig.skinTone,
          hairColor: avatarConfig.hairColor,
          hairStyle: avatarConfig.hairStyle,
          eyeColor: avatarConfig.eyeColor,
          clothingStyle: avatarConfig.clothingStyle
        }
      );
      
      if (result.success) {
        console.log(`📖 [LIVE-GEN] Page ${pageNumber} image ready: ${result.tierUsed}`);
        return result.imageUrl;
      } else {
        console.warn(`📖 [LIVE-GEN] Page ${pageNumber} using fallback: ${result.error}`);
        return result.imageUrl; // Fallback URL
      }
      
    } catch (error) {
      console.error(`📖 [LIVE-GEN] Page ${pageNumber} generation failed:`, error);
      
      // Return static fallback
      return ImageFallbackService.generateStoryPlaceholder(pageContent, pageNumber);
    }
  }
  
  /**
   * Pre-generate Netflix-style story images
   */
  async generateNetflixStory(
    storyPages: string[],
    sessionId: string,
    avatarConfig: AvatarConfig
  ): Promise<Map<number, string>> {
    
    console.log(`🎬 [LIVE-GEN] Netflix generation: ${storyPages.length} pages`);
    
    const pages = storyPages.map((content, index) => ({
      storyText: content,
      pageNumber: index + 1
    }));
    
    const characterDetails = {
      skinTone: avatarConfig.skinTone,
      hairColor: avatarConfig.hairColor,
      hairStyle: avatarConfig.hairStyle,
      eyeColor: avatarConfig.eyeColor,
      clothingStyle: avatarConfig.clothingStyle
    };
    
    const results = await this.imageService.generateBatch(pages, sessionId, characterDetails);
    
    // Convert to URL map
    const imageMap = new Map<number, string>();
    results.forEach((result, pageNumber) => {
      imageMap.set(pageNumber, result.imageUrl);
    });
    
    console.log(`🎬 [LIVE-GEN] Netflix story complete: ${imageMap.size} images`);
    return imageMap;
  }
}
```

## **Error Handling Flows**

### **Tier Escalation Logic**
```typescript
// Error handling with tier escalation
export class ImageErrorHandler {
  
  static async handleGenerationFailure(
    error: Error,
    context: {
      storyText: string;
      pageNumber: number;
      sessionId: string;
      characterDetails: any;
      attemptedTier?: string;
    }
  ): Promise<ImageGenerationResult> {
    
    console.log(`🚨 [ERROR-HANDLER] Handling failure: ${error.message}`);
    console.log(`🚨 [ERROR-HANDLER] Attempted tier: ${context.attemptedTier || 'ORCHESTRATOR'}`);
    
    // Analyze error type
    const errorType = this.categorizeError(error.message);
    
    switch (errorType) {
      case 'TIMEOUT':
        return this.handleTimeout(context);
        
      case 'RATE_LIMIT':
        return this.handleRateLimit(context);
        
      case 'API_ERROR':
        return this.handleAPIError(context);
        
      case 'NETWORK_ERROR':
        return this.handleNetworkError(context);
        
      default:
        return this.handleUnknownError(context, error);
    }
  }
  
  private static categorizeError(errorMessage: string): string {
    if (errorMessage.includes('timeout')) return 'TIMEOUT';
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) return 'RATE_LIMIT';
    if (errorMessage.includes('API') || errorMessage.includes('key')) return 'API_ERROR';
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) return 'NETWORK_ERROR';
    return 'UNKNOWN';
  }
  
  private static async handleTimeout(context: any): Promise<ImageGenerationResult> {
    console.log(`⏱️ [ERROR-HANDLER] Timeout - trying nuclear template`);
    
    try {
      // Direct call to nuclear template service
      const response = await supabase.functions.invoke('runware-template-cd', {
        body: {
          storyText: context.storyText,
          pageNumber: context.pageNumber,
          sessionId: context.sessionId,
          characterDetails: context.characterDetails,
          templateTier: '2.5C', // Nuclear template
          timeout: 15000 // Shorter timeout for fallback
        }
      });
      
      if (response.data) {
        return {
          success: true,
          imageUrl: response.data.imageUrl,
          tierUsed: '2.5C-FALLBACK',
          templateType: 'nuclear-template',
          processingTime: response.data.processingTime,
          requestId: context.sessionId,
          metadata: {
            recoveryUsed: true,
            originalError: 'timeout'
          }
        };
      }
    } catch (error) {
      console.log(`🚨 [ERROR-HANDLER] Nuclear template also failed`);
    }
    
    // Final fallback to static image
    return this.getFinalFallback(context);
  }
  
  private static getFinalFallback(context: any): ImageGenerationResult {
    const fallbackUrl = ImageFallbackService.generateStoryPlaceholder(
      context.storyText, 
      context.pageNumber
    );
    
    return {
      success: false,
      imageUrl: fallbackUrl,
      tierUsed: 'STATIC-FALLBACK',
      templateType: 'static-image',
      processingTime: 0,
      requestId: context.sessionId,
      error: 'All generation methods failed',
      metadata: {
        fallbackUsed: true,
        finalFallback: true
      }
    };
  }
}
```

## **Frontend-Backend Integration**

### **Component Integration Pattern**
```typescript
// How React components use the service layer
const CleanStoryDisplay = ({ storyData, sessionId, avatarConfig }) => {
  const [currentImage, setCurrentImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [imageMetadata, setImageMetadata] = useState<any>(null);
  
  const generateCurrentPageImage = useCallback(async () => {
    if (!storyData?.pages?.[currentPage - 1]) return;
    
    setIsGenerating(true);
    
    try {
      console.log(`🎨 [COMPONENT] Requesting image for page ${currentPage}`);
      
      const result = await SimpleImageService.generateWithRetry(
        storyData.pages[currentPage - 1],
        currentPage,
        sessionId,
        {
          skinTone: avatarConfig.skinTone,
          hairColor: avatarConfig.hairColor,
          hairStyle: avatarConfig.hairStyle,
          eyeColor: avatarConfig.eyeColor
        }
      );
      
      setCurrentImage(result.imageUrl);
      setImageMetadata({
        tier: result.tierUsed,
        templateType: result.templateType,
        processingTime: result.processingTime,
        fallbackUsed: !result.success
      });
      
      console.log(`🎨 [COMPONENT] Image set for page ${currentPage}: ${result.tierUsed}`);
      
    } catch (error) {
      console.error(`🎨 [COMPONENT] Image generation failed:`, error);
      
      // Set fallback image
      const fallbackUrl = ImageFallbackService.generateStoryPlaceholder(
        storyData.pages[currentPage - 1],
        currentPage
      );
      setCurrentImage(fallbackUrl);
      setImageMetadata({
        tier: 'FALLBACK',
        templateType: 'static',
        fallbackUsed: true,
        error: error.message
      });
    } finally {
      setIsGenerating(false);
    }
  }, [storyData, currentPage, sessionId, avatarConfig]);
  
  // Auto-generate when page changes
  useEffect(() => {
    generateCurrentPageImage();
  }, [generateCurrentPageImage]);
  
  return (
    <div className="story-display">
      <ImageWithFallback
        src={currentImage}
        alt={`Story illustration for page ${currentPage}`}
        onLoad={(url) => console.log(`🖼️ [COMPONENT] Image loaded: ${url.substring(0, 50)}...`)}
        onFallback={(url) => console.log(`🔄 [COMPONENT] Fallback used: ${url.substring(0, 50)}...`)}
      />
      
      {/* Debug panel when in debug mode */}
      <ImageDebugPanel
        currentPage={currentPage}
        storyText={storyData?.pages?.[currentPage - 1]}
        currentImageUrl={currentImage}
        isGenerating={isGenerating}
        imageMetadata={imageMetadata}
        onRegenerateImage={generateCurrentPageImage}
      />
    </div>
  );
};
```

## **Session Management Integration**

### **Session-Aware Service Calls**
```typescript
// Integration with session managers
export class SessionAwareImageService {
  
  /**
   * Generate image with proper session context
   */
  static async generateWithSessionContext(
    storyText: string,
    pageNumber: number,
    userType: 'guest' | 'premium',
    avatarConfig: AvatarConfig
  ): Promise<ImageGenerationResult> {
    
    let sessionId: string;
    
    if (userType === 'guest') {
      // Netflix-style session management
      sessionId = NetflixSessionManager.getOrCreateSession('guest-user');
      console.log(`🎬 [SESSION-IMAGE] Guest session: ${sessionId}`);
    } else {
      // Premium live generation session
      sessionId = `premium-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log(`👑 [SESSION-IMAGE] Premium session: ${sessionId}`);
    }
    
    return SimpleImageService.generateWithRetry(
      storyText,
      pageNumber,
      sessionId,
      {
        skinTone: avatarConfig.skinTone,
        hairColor: avatarConfig.hairColor,
        hairStyle: avatarConfig.hairStyle,
        eyeColor: avatarConfig.eyeColor,
        clothingStyle: avatarConfig.clothingStyle
      }
    );
  }
  
  /**
   * Clear session-specific image cache
   */
  static clearSessionImages(sessionId: string): void {
    console.log(`🧹 [SESSION-IMAGE] Clearing images for session: ${sessionId}`);
    
    // Clear from enhanced image cache
    EnhancedImageCache.clearSession(sessionId);
    
    // Clear from loading manager
    ImageLoadingManager.clearAll();
    
    console.log(`🧹 [SESSION-IMAGE] Session images cleared`);
  }
}
```

## **Performance Optimization**

### **Concurrent Request Management**
```typescript
// Request throttling and batching
export class ImageRequestOptimizer {
  private static activeRequests = new Map<string, Promise<ImageGenerationResult>>();
  private static requestQueue: Array<() => Promise<void>> = [];
  private static maxConcurrent = 3;
  private static currentConcurrent = 0;
  
  /**
   * Optimized image generation with request deduplication
   */
  static async optimizedGenerate(
    storyText: string,
    pageNumber: number,
    sessionId: string,
    characterDetails: any
  ): Promise<ImageGenerationResult> {
    
    // Create request key for deduplication
    const requestKey = `${sessionId}-${pageNumber}-${this.hashString(storyText)}`;
    
    // Check for existing request
    if (this.activeRequests.has(requestKey)) {
      console.log(`♻️ [OPTIMIZER] Reusing existing request: ${requestKey}`);
      return this.activeRequests.get(requestKey)!;
    }
    
    // Create new request
    const requestPromise = this.executeOptimizedRequest(
      storyText,
      pageNumber,
      sessionId,
      characterDetails
    );
    
    // Store active request
    this.activeRequests.set(requestKey, requestPromise);
    
    // Clean up when complete
    requestPromise.finally(() => {
      this.activeRequests.delete(requestKey);
    });
    
    return requestPromise;
  }
  
  private static async executeOptimizedRequest(
    storyText: string,
    pageNumber: number,
    sessionId: string,
    characterDetails: any
  ): Promise<ImageGenerationResult> {
    
    // Wait for available slot
    await this.waitForSlot();
    
    this.currentConcurrent++;
    
    try {
      return await SimpleImageService.generateWithRetry(
        storyText,
        pageNumber,
        sessionId,
        characterDetails
      );
    } finally {
      this.currentConcurrent--;
      this.processQueue();
    }
  }
  
  private static async waitForSlot(): Promise<void> {
    if (this.currentConcurrent < this.maxConcurrent) {
      return;
    }
    
    return new Promise<void>((resolve) => {
      this.requestQueue.push(async () => resolve());
    });
  }
  
  private static processQueue(): void {
    if (this.requestQueue.length > 0 && this.currentConcurrent < this.maxConcurrent) {
      const nextRequest = this.requestQueue.shift();
      if (nextRequest) {
        nextRequest();
      }
    }
  }
  
  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
}
```

---
*Last Updated: September 21, 2025*  
*Service Layer Status: All orchestration services operational*
