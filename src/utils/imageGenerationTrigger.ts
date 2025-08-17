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
   * Trigger automatic image generation
   */
  static async triggerAutoGeneration(options: ImageGenerationOptions): Promise<void> {
    if (!this.shouldAutoGenerate(options)) {
      return;
    }
    
    console.log('🖼️ Auto-triggering image generation for page', options.currentPage);
    
    this.isGenerating = true;
    
    try {
      // Import and use the image service
      const { SimpleImageService } = await import('@/services/SimpleImageService');
      
      const result = await SimpleImageService.generateStoryImage(
        options.pageText,
        options.userInfo,
        'medium' as any, // Default difficulty level
        `session_${Date.now()}`, // Generate session ID
        options.currentPage + 1,
        options.totalPages
      );
      
      if (result.success && result.url) {
        console.log('🖼️ Auto-generated image successfully:', result.url);
        
        // Store the image in the page images map
        const event = new CustomEvent('image:generated', {
          detail: {
            pageIndex: options.currentPage,
            imageUrl: result.url,
            provider: result.provider
          }
        });
        window.dispatchEvent(event);
      }
      
    } catch (error) {
      console.error('🖼️ Auto-generation failed:', error);
    } finally {
      this.isGenerating = false;
    }
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