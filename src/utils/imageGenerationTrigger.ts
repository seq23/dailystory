/**
 * Enhanced image generation trigger with improved network detection and auto-generation
 */

interface ImageGenerationOptions {
  currentPage: number;
  totalPages: number;
  hasCurrentImage: boolean;
  allImages: any[];
  isNetworkAvailable: boolean;
  userInfo: any;
  storyTitle: string;
  pageText: string;
  sessionId?: string; // Added for consistency tracking
}

export class ImageGenerationTrigger {
  private static isGenerating = false;
  private static networkCheckInterval: NodeJS.Timeout | null = null;
  private static lastNetworkCheck = 0;
  
  /**
   * Enhanced network availability check
   */
  static isNetworkAvailable(): boolean {
    // Check if we're offline
    if (!navigator.onLine) {
      return false;
    }
    
    // Check for recent successful network activity
    const now = Date.now();
    if (now - this.lastNetworkCheck < 5000) { // Cache for 5 seconds
      return true;
    }
    
    // Update last check time
    this.lastNetworkCheck = now;
    
    // Additional checks for mobile networks
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection && connection.effectiveType === 'slow-2g') {
        return false; // Don't generate on very slow connections
      }
    }
    
    return true;
  }
  
  /**
   * Check if auto-generation should trigger
   */
  static shouldAutoGenerate(options: ImageGenerationOptions): boolean {
    const { currentPage, hasCurrentImage, isNetworkAvailable } = options;
    
    // Don't generate if already generating
    if (this.isGenerating) {
      return false;
    }
    
    // Don't generate if no network
    if (!isNetworkAvailable) {
      return false;
    }
    
    // Don't generate if image already exists
    if (hasCurrentImage) {
      return false;
    }
    
    // Generate for first few pages automatically
    if (currentPage < 3) {
      return true;
    }
    
    // Generate for every 2nd page after that
    return currentPage % 2 === 0;
  }
  
  /**
   * Trigger automatic image generation with content validation
   */
  static async triggerAutoGeneration(options: ImageGenerationOptions): Promise<void> {
    if (!this.shouldAutoGenerate(options)) {
      return;
    }
    
    console.log('🖼️ Auto-triggering image generation for page', options.currentPage, {
      textLength: options.pageText.length,
      hasPlaceholders: options.pageText.includes('{'),
      sessionId: options.sessionId || `session_${Date.now()}`
    });
    
    this.isGenerating = true;
    
    try {
      // 🔧 FIX: Validate that pageText doesn't contain unresolved placeholders
      if (options.pageText.includes('{') && options.pageText.includes('}')) {
        console.warn(`⚠️ Image generation delayed - page text contains unresolved placeholders: ${options.pageText.substring(0, 100)}`);
        
        // Wait briefly and check again - this handles race conditions
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (options.pageText.includes('{') && options.pageText.includes('}')) {
          console.error(`❌ Aborting image generation - persistent placeholders in text`);
          return;
        }
      }
      
      // Import and use the image service
      const { SimpleImageService } = await import('@/services/SimpleImageService');
      
      const sessionId = options.sessionId || `session_${Date.now()}`;
      
      const result = await SimpleImageService.generateStoryImage(
        options.pageText,
        options.userInfo,
        'medium' as any, // Default difficulty level
        sessionId, // Use proper session ID
        options.currentPage + 1,
        options.totalPages
      );
      
      if (result.success && result.url) {
        console.log('🖼️ Auto-generated image successfully:', result.url, {
          contentHash: this.generateContentHash(options.pageText)
        });
        
        // Store the image in the page images map
        const event = new CustomEvent('image:generated', {
          detail: {
            pageIndex: options.currentPage,
            imageUrl: result.url,
            provider: result.provider,
            sessionId,
            contentHash: this.generateContentHash(options.pageText)
          }
        });
        window.dispatchEvent(event);
      }
      
    } catch (error) {
      console.error('🖼️ Auto-generation failed:', error);
      
      // Dispatch error event
      const errorEvent = new CustomEvent('image-generation-error', {
        detail: {
          pageNumber: options.currentPage,
          error: error.message,
          sessionId: options.sessionId || 'unknown'
        }
      });
      window.dispatchEvent(errorEvent);
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Generate content hash for validation
   */
  private static generateContentHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
  
  /**
   * Extract characters from page text
   */
  private static extractCharacters(text: string): string[] {
    const characters: string[] = [];
    
    // Look for proper nouns (capitalized words that aren't sentence starters)
    const words = text.split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      const word = words[i].replace(/[.,!?;:]/g, '');
      if (word.length > 2 && /^[A-Z][a-z]+$/.test(word)) {
        // Skip if it's the first word of a sentence
        const prevWord = i > 0 ? words[i - 1] : '';
        if (!prevWord.match(/[.!?]$/)) {
          characters.push(word);
        }
      }
    }
    
    return [...new Set(characters)].slice(0, 3); // Return unique characters, max 3
  }
  
  /**
   * Extract setting/location from page text
   */
  private static extractSetting(text: string): string {
    const locations = [
      'forest', 'woods', 'tree', 'garden', 'park', 'house', 'home', 'kitchen',
      'bedroom', 'school', 'classroom', 'playground', 'beach', 'ocean', 'lake',
      'mountain', 'hill', 'field', 'farm', 'city', 'town', 'village', 'castle',
      'library', 'store', 'shop', 'restaurant', 'cafe', 'zoo', 'museum'
    ];
    
    const lowerText = text.toLowerCase();
    for (const location of locations) {
      if (lowerText.includes(location)) {
        return location;
      }
    }
    
    return 'outdoor scene';
  }
  
  /**
   * Start monitoring for auto-generation opportunities
   */
  static startMonitoring(): void {
    if (this.networkCheckInterval) {
      return; // Already monitoring
    }
    
    // Check network status periodically
    this.networkCheckInterval = setInterval(() => {
      this.isNetworkAvailable();
    }, 10000); // Check every 10 seconds
    
    console.log('🖼️ Image generation monitoring started');
  }
  
  /**
   * Stop monitoring
   */
  static stopMonitoring(): void {
    if (this.networkCheckInterval) {
      clearInterval(this.networkCheckInterval);
      this.networkCheckInterval = null;
    }
    
    this.isGenerating = false;
    console.log('🖼️ Image generation monitoring stopped');
  }
}