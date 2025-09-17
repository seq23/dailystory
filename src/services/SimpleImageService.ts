import { supabase } from '@/integrations/supabase/client';
import { ImageFallbackService } from './ImageFallbackService';
import { DebugLogger } from '@/services/DebugLogger';
import { errorRecoveryManager } from '@/services/ErrorRecoveryManager';

// ============= TYPES =============

export interface ImageResult {
  success: boolean;
  url?: string;
  imageURL?: string;
  error?: string;
  generatedAt?: string;
  tier?: string;
  usedTier?: string;
  tierErrors?: any[];
  requestId?: string;
  timestamp?: string;
  provider?: string;
  model?: string;
  cost?: number;
  seed?: number | string;
  metadata?: any;
}

export interface UserInfo {
  name?: string;
  age?: number;
  ethnicity?: string;
  hair?: string;
  features?: string;
  avatar?: {
    type?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

// ============= SIMPLE IMAGE SERVICE =============

export class SimpleImageService {
  // Service constants
  private static readonly ESTIMATED_COST_PER_IMAGE_USD = 0.002;
  private static readonly isIndexedDBAvailable = typeof window !== 'undefined' && 'indexedDB' in window;

  // Database management for caching
  private static async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ImageCacheDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('images')) {
          const store = db.createObjectStore('images', { keyPath: 'id' });
          store.createIndex('sessionId', 'sessionId', { unique: false });
          store.createIndex('pageNumber', 'pageNumber', { unique: false });
        }
      };
    });
  }

  // Store image in IndexedDB cache
  private static async storeImageInDB(sessionId: string, pageNumber: number, imageURL: string | null, metadata: any = {}): Promise<void> {
    if (!this.isIndexedDBAvailable) return;
    
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      
      const imageData = {
        id: `${sessionId}-${pageNumber}`,
        sessionId,
        pageNumber,
        imageURL,
        metadata,
        timestamp: new Date().toISOString()
      };
      
      await store.put(imageData);
      DebugLogger.log('image', `Stored image data for session ${sessionId}, page ${pageNumber}`);
    } catch (error) {
      DebugLogger.warn('image', 'Failed to store image in IndexedDB', error);
    }
  }

  // Get cached image from IndexedDB
  private static async getImageFromDB(sessionId: string, pageNumber: number): Promise<any | null> {
    if (!this.isIndexedDBAvailable) return null;
    
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');
      
      return new Promise((resolve, reject) => {
        const request = store.get(`${sessionId}-${pageNumber}`);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      DebugLogger.warn('image', 'Failed to get image from IndexedDB', error);
      return null;
    }
  }

  // Clear session cache
  static async clearSessionCache(sessionId: string): Promise<void> {
    if (!this.isIndexedDBAvailable) return;
    
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      const index = store.index('sessionId');
      
      const request = index.openCursor(IDBKeyRange.only(sessionId));
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      
      DebugLogger.log('image', `Cleared cache for session ${sessionId}`);
    } catch (error) {
      DebugLogger.warn('image', 'Failed to clear session cache', error);
    }
  }

  // Main image generation method with enhanced error recovery
  static async generateStoryImage(
    storyText: string,
    userInfo?: UserInfo,
    sessionId?: string,
    pageNumber: number = 1,
    isPremium: boolean = false
  ): Promise<ImageResult> {
    DebugLogger.log('image', 'SimpleImageService: Starting image generation');
    DebugLogger.log('image', 'Parameters', { 
      storyLength: storyText?.length || 0, 
      hasUserInfo: !!userInfo, 
      sessionId, 
      pageNumber, 
      isPremium 
    });

    // Enhanced error recovery - check memory pressure before attempting generation
    const memoryStatus = errorRecoveryManager.detectMemoryPressure();
    if (memoryStatus.isHigh) {
      DebugLogger.warn('image', 'High memory pressure detected, using recovery mode', {
        usage: memoryStatus.usage,
        recommendations: memoryStatus.recommendations
      });
      
      // Use memory-efficient generation path
      return await errorRecoveryManager.withRetry(
        () => this.generateImageWithFallback(storyText, userInfo, sessionId, pageNumber, isPremium),
        `image-gen-recovery-${pageNumber}`,
        {
          maxRetries: 2,
          retryDelay: 2000,
          fallbackValue: {
            success: true,
            url: ImageFallbackService.generateStoryPlaceholder(storyText, pageNumber),
            tier: 'Memory Recovery',
            metadata: { recoveryMode: true }
          }
        }
      );
    }

    // Standard generation path with enhanced error recovery
    return await errorRecoveryManager.withRetry(
      () => this.generateImageWithFallback(storyText, userInfo, sessionId, pageNumber, isPremium),
      `image-gen-${pageNumber}`,
      {
        maxRetries: 3,
        retryDelay: 1000,
        fallbackValue: {
          success: true,
          url: ImageFallbackService.generateStoryPlaceholder(storyText, pageNumber),
          tier: 'Error Recovery',
          metadata: { recoveryMode: true }
        }
      }
    );
  }

  // Separate method for actual image generation logic
  private static async generateImageWithFallback(
    storyText: string,
    userInfo?: UserInfo,
    sessionId?: string,
    pageNumber: number = 1,
    isPremium: boolean = false
  ): Promise<ImageResult> {

    // Check cache first
    if (this.isIndexedDBAvailable && sessionId) {
      const cached = await this.getImageFromDB(sessionId, pageNumber);
      if (cached?.imageURL) {
        DebugLogger.log('image', `Using cached image for session ${sessionId}, page ${pageNumber}`);
        return {
          success: true,
          url: cached.imageURL,
          generatedAt: cached.timestamp,
          tier: 'Cache',
          metadata: { ...cached.metadata, fromCache: true }
        };
      }
    }

    // Validate input
    if (!storyText || storyText.trim().length === 0) {
      DebugLogger.error('image', 'No story text provided');
      return {
        success: false,
        error: 'Story text is required for image generation',
        timestamp: new Date().toISOString()
      };
    }

    const cleanScene = storyText.trim().substring(0, 3000);
    DebugLogger.log('image', `Clean scene (${cleanScene.length} chars)`, cleanScene.substring(0, 200) + '...');

    // Map difficulty level
    const backendDifficulty = this.mapDifficultyLevel(userInfo);
    DebugLogger.log('image', 'Mapped difficulty level', backendDifficulty);

    // Setup timeout handling
    let timeoutId: NodeJS.Timeout | null = null;
    let requestAborted = false;

    try {
      // Create timeout promise that rejects after 150 seconds
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          requestAborted = true;
          DebugLogger.warn('image', 'Frontend timeout: Request exceeded 150 seconds');
          reject(new Error('Request timeout: Image generation took longer than 150 seconds'));
        }, 150000);
      });

      // Call the main orchestrator (runware-generate-image) which handles all tiers
      DebugLogger.log('image', 'Calling main orchestrator: runware-generate-image');
      
      const requestPromise = supabase.functions.invoke('runware-generate-image', {
        body: {
          pageText: cleanScene,
          userInfo,
          sessionId,
          storyId: sessionId, // Use sessionId as storyId for consistency
          pageNumber,
          isGuestUser: !isPremium,
          difficultyLevel: backendDifficulty
        }
      });
      
      const { data: orchResult, error: orchError } = await Promise.race([
        requestPromise,
        timeoutPromise
      ]);

      // Clear timeout since request completed
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (requestAborted) {
        DebugLogger.warn('image', 'Request was aborted due to timeout');
        return {
          success: false,
          error: 'Request timeout: Image generation exceeded time limit',
          timestamp: new Date().toISOString()
        };
      }

      if (orchError) {
        throw new Error(`Orchestrator error: ${orchError.message}`);
      }

      if (orchResult?.success && orchResult?.imageURL) {
        DebugLogger.log('image', `Image generation successful via ${orchResult.usedTier || 'orchestrator'}`);
        
        // Store result in IndexedDB
        if (this.isIndexedDBAvailable && sessionId) {
          await this.storeImageInDB(sessionId, pageNumber, orchResult.imageURL, orchResult);
        }

        return {
          success: true,
          url: orchResult.imageURL,
          imageURL: orchResult.imageURL,
          generatedAt: new Date().toISOString(),
          tier: orchResult.usedTier,
          usedTier: orchResult.usedTier,
          tierErrors: orchResult.tierErrors,
          requestId: orchResult.requestId,
          metadata: orchResult
        };
      } else {
        throw new Error(`Orchestrator returned no image: ${JSON.stringify(orchResult)}`);
      }
        
    } catch (error) {
      DebugLogger.error('image', 'Image generation orchestrator failed', error);
      
      // Clear timeout if still active
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      // Store failure in IndexedDB for debugging
      if (this.isIndexedDBAvailable && sessionId) {
        await this.storeImageInDB(sessionId, pageNumber, null, { 
          error: error.message, 
          timestamp: new Date().toISOString(),
          orchestratorFailure: true
        });
      }

      // TIER 4: Final fallback - use one of your 6 uploaded images
      DebugLogger.warn('image', 'All backend tiers failed, using ImageFallbackService with your 6 character images');
      const fallbackUrl = ImageFallbackService.generateStoryPlaceholder(cleanScene, pageNumber);
      
      return {
        success: true,
        url: fallbackUrl,
        imageURL: fallbackUrl,
        generatedAt: new Date().toISOString(),
        tier: 'SVG Fallback',
        metadata: {
          isFallback: true,
          originalError: error.message,
          tier: 'fallback'
        }
      };
    }
  }

  // Map user info to backend difficulty level
  private static mapDifficultyLevel(userInfo?: UserInfo): string {
    if (!userInfo?.age) return 'medium';
    
    const age = userInfo.age;
    if (age <= 5) return 'beginner';
    if (age <= 8) return 'easy';
    if (age <= 12) return 'medium';
    if (age <= 16) return 'hard';
    return 'expert';
  }

  // Generate SVG placeholder as final fallback
  private static generateSVGPlaceholder(cleanScene: string, userInfo?: UserInfo): { url: string } {
    DebugLogger.warn('image', 'Using local SVG fallback due to backend unavailability');
    
    // Extract key elements from the scene for the placeholder
    const hasCharacter = /\b(child|person|character|they|he|she|avatar)\b/i.test(cleanScene);
    const hasOutdoor = /\b(outside|outdoor|garden|playground|park|forest|beach)\b/i.test(cleanScene);
    const hasActivity = /\b(playing|running|walking|reading|building|creating)\b/i.test(cleanScene);
    
    const backgroundColor = hasOutdoor ? '#87CEEB' : '#f8f9fa';
    const groundColor = hasOutdoor ? '#90EE90' : '#e5e7eb';
    
    // Create a simple but contextual SVG
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
        <!-- Background -->
        <rect width="100%" height="100%" fill="${backgroundColor}"/>
        
        <!-- Ground/Floor -->
        <rect x="0" y="200" width="400" height="100" fill="${groundColor}"/>
        
        ${hasCharacter ? `
        <!-- Simple character representation -->
        <circle cx="200" cy="150" r="20" fill="#ffdbac" stroke="#333" stroke-width="2"/>
        <rect x="185" y="170" width="30" height="40" fill="#4a90e2" rx="5"/>
        <line x1="185" y1="185" x2="170" y2="220" stroke="#333" stroke-width="3" stroke-linecap="round"/>
        <line x1="215" y1="185" x2="230" y2="220" stroke="#333" stroke-width="3" stroke-linecap="round"/>
        <line x1="185" y1="175" x2="160" y2="195" stroke="#333" stroke-width="3" stroke-linecap="round"/>
        <line x1="215" y1="175" x2="240" y2="195" stroke="#333" stroke-width="3" stroke-linecap="round"/>
        <!-- Simple face -->
        <circle cx="190" cy="145" r="2" fill="#333"/>
        <circle cx="210" cy="145" r="2" fill="#333"/>
        <path d="M 190 155 Q 200 165 210 155" stroke="#333" stroke-width="2" fill="none"/>
        ` : ''}
        
        ${hasActivity && hasCharacter ? `
        <!-- Activity indicator -->
        <circle cx="250" cy="180" r="8" fill="#ff6b6b" opacity="0.7"/>
        <circle cx="270" cy="170" r="6" fill="#4ecdc4" opacity="0.7"/>
        <circle cx="290" cy="185" r="7" fill="#45b7d1" opacity="0.7"/>
        ` : ''}
        
        ${hasOutdoor ? `
        <!-- Sun -->
        <circle cx="350" cy="50" r="15" fill="#ffd93d"/>
        <line x1="350" y1="20" x2="350" y2="35" stroke="#ffd93d" stroke-width="2"/>
        <line x1="320" y1="50" x2="335" y2="50" stroke="#ffd93d" stroke-width="2"/>
        <line x1="365" y1="50" x2="380" y2="50" stroke="#ffd93d" stroke-width="2"/>
        <line x1="350" y1="65" x2="350" y2="80" stroke="#ffd93d" stroke-width="2"/>
        
        <!-- Clouds -->
        <ellipse cx="100" cy="60" rx="25" ry="15" fill="white" opacity="0.8"/>
        <ellipse cx="120" cy="55" rx="20" ry="12" fill="white" opacity="0.8"/>
        <ellipse cx="85" cy="55" rx="18" ry="10" fill="white" opacity="0.8"/>
        ` : `
        <!-- Indoor lighting -->
        <rect x="50" y="20" width="300" height="30" fill="#fff3cd" opacity="0.6" rx="15"/>
        `}
        
        <!-- Scene title -->
        <text x="200" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#666">
          Story Scene Placeholder
        </text>
      </svg>
    `;
    
    return {
      url: 'data:image/svg+xml;base64,' + btoa(svgContent)
    };
  }

  // Legacy method support
  static async generateImage(params: any): Promise<ImageResult> {
    return this.generateStoryImage(
      params.storyText || params.pageText || '',
      params.userInfo,
      params.sessionId,
      params.pageNumber || 1,
      params.isPremium || false
    );
  }
}

// Export default for backwards compatibility
export default SimpleImageService;