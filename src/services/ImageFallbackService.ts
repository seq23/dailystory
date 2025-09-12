/**
 * Image Fallback Service - Provides placeholder images when generation fails
 */

export interface FallbackImageConfig {
  width: number;
  height: number;
  backgroundColor: string;
  textColor: string;
  text: string;
}

export class ImageFallbackService {
  private static readonly DEFAULT_CONFIG: FallbackImageConfig = {
    width: 1024,
    height: 1024,
    backgroundColor: '#f0f9ff', // Light blue background
    textColor: '#1e40af', // Blue text
    text: '📖 Story Illustration'
  };

  private static readonly FALLBACK_IMAGES = [
    '/lovable-uploads/ec8d98b8-07d2-4fa4-8d5f-0c9499570384.png',
    '/lovable-uploads/886ba3b2-9e9a-4966-a25e-967c18e384c1.png',
    '/lovable-uploads/35591052-8575-4dd7-a727-6f317dd362ed.png',
    '/lovable-uploads/2a0750f5-9ff1-4555-bbf8-242e1906515a.png',
    '/lovable-uploads/d396c614-ad40-4d9a-ae7f-6cd4695e651c.png',
    '/lovable-uploads/88b1bb2a-0527-43ef-b357-ff4eb3b28259.png'
  ];

  private static debugLog(message: string, data?: any) {
    console.log(`🖼️ ImageFallback: ${message}`, data || '');
  }

  /**
   * Detect if CSP blocks data URLs or blob URLs
   */
  static detectCSPIssues(): boolean {
    // Check if we're in a restricted environment
    if (typeof window === 'undefined') return false;
    
    try {
      // Try to create a simple data URL image
      const testDataUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIj48L3N2Zz4=';
      const testImg = document.createElement('img');
      
      // Set up a quick test - if CSP blocks it, it won't load
      let cspBlocked = false;
      testImg.onerror = () => { cspBlocked = true; };
      testImg.src = testDataUrl;
      
      // Also check for blob URL support
      try {
        const blob = new Blob(['<svg></svg>'], { type: 'image/svg+xml' });
        const blobUrl = URL.createObjectURL(blob);
        URL.revokeObjectURL(blobUrl);
      } catch {
        this.debugLog('Blob URLs not supported');
        return true;
      }
      
      return cspBlocked;
    } catch (error) {
      this.debugLog('CSP detection failed, assuming blocked', error);
      return true;
    }
  }

  /**
   * Get environment info for debugging
   */
  static getEnvironmentInfo() {
    const info = {
      isPreview: window.location.href.includes('preview'),
      userAgent: navigator.userAgent,
      hasCSPBlocking: this.detectCSPIssues(),
      currentURL: window.location.href
    };
    this.debugLog('Environment detection', info);
    return info;
  }

  /**
   * Generate a simple SVG placeholder image with your 6 character images embedded
   */
  static generatePlaceholderSVG(config: Partial<FallbackImageConfig> & { pageNumber?: number } = {}): string {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    // Use pageNumber to rotate through your 6 uploaded images
    const pageNumber = config.pageNumber || 0;
    const imageIndex = Math.abs(pageNumber) % this.FALLBACK_IMAGES.length;
    const selectedImage = this.FALLBACK_IMAGES[imageIndex];
    
    const svg = `
      <svg 
        width="${finalConfig.width}" 
        height="${finalConfig.height}" 
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Background -->
        <rect width="100%" height="100%" fill="#f8f9fa" stroke="#e5e7eb" stroke-width="1"/>
        
        <!-- One of Your 6 Character Images -->
        <image 
          x="100" 
          y="50" 
          width="200" 
          height="150" 
          href="${selectedImage}"
          preserveAspectRatio="xMidYMid meet"
        />
        
        <!-- Arrow marker definition -->
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="#9ca3af"/>
          </marker>
        </defs>
        
        <!-- Main message - Positioned higher to stay visible in small containers -->
        <text x="200" y="170" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#374151">
          Images not working right now
        </text>
        <text x="200" y="190" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#6b7280">
          Please try again later
        </text>
      </svg>
    `;
    
    const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
    this.debugLog('Generated SVG fallback', { config: finalConfig, dataUrlLength: dataUrl.length });
    return dataUrl;
  }

  /**
   * Generate a blob URL as CSP-safe alternative
   */
  static generateBlobSVG(config: Partial<FallbackImageConfig> = {}): string {
    try {
      const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
      
      const svgContent = `
        <svg width="${finalConfig.width}" height="${finalConfig.height}" viewBox="0 0 ${finalConfig.width} ${finalConfig.height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="${finalConfig.backgroundColor}"/>
          <circle cx="${finalConfig.width/2}" cy="${finalConfig.height/2 - 100}" r="80" fill="${finalConfig.textColor}" opacity="0.1"/>
          <text x="${finalConfig.width/2}" y="${finalConfig.height/2}" 
                text-anchor="middle" 
                dominant-baseline="middle" 
                fill="${finalConfig.textColor}" 
                font-family="Arial, sans-serif" 
                font-size="48" 
                font-weight="500">
            ${finalConfig.text}
          </text>
          <text x="${finalConfig.width/2}" y="${finalConfig.height/2 + 80}" 
                text-anchor="middle" 
                dominant-baseline="middle" 
                fill="${finalConfig.textColor}" 
                font-family="Arial, sans-serif" 
                font-size="24" 
                opacity="0.7">
            Illustration will appear here
          </text>
        </svg>
      `;
      
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const blobUrl = URL.createObjectURL(blob);
      this.debugLog('Generated blob SVG fallback', { blobUrl });
      return blobUrl;
    } catch (error) {
      this.debugLog('Failed to generate blob SVG', error);
      return this.generatePlaceholderSVG(config);
    }
  }

  /**
   * Get the best fallback image format for current environment
   */
  static getBestFallback(config: Partial<FallbackImageConfig> = {}): string {
    // Use uploaded character images with rotation based on page number
    const pageNumber = (config as any).pageNumber || 0;
    const imageIndex = Math.abs(pageNumber) % this.FALLBACK_IMAGES.length;
    const selectedImage = this.FALLBACK_IMAGES[imageIndex];
    
    this.debugLog('Using uploaded character image as fallback', { pageNumber, imageIndex, selectedImage });
    return selectedImage;
  }

  /**
   * Generate a story-specific placeholder with page context
   */
  static generateStoryPlaceholder(storyText: string, pageNumber: number): string {
    // Use uploaded character images with page-based rotation
    const imageIndex = Math.abs(pageNumber) % this.FALLBACK_IMAGES.length;
    const selectedImage = this.FALLBACK_IMAGES[imageIndex];
    
    this.debugLog('Story placeholder using character image', { pageNumber, imageIndex, selectedImage });
    return selectedImage;
  }

  /**
   * Check if a URL is a fallback image
   */
  static isFallbackImage(url: string): boolean {
    return url.startsWith('data:image/svg+xml;base64,') || this.FALLBACK_IMAGES.includes(url);
  }

  /**
   * Get a character-themed placeholder
   */
  static generateCharacterPlaceholder(characterName: string, pageNumber: number): string {
    // Use character name hash + page number for consistent but varied selection
    const nameHash = characterName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imageIndex = Math.abs(nameHash + pageNumber) % this.FALLBACK_IMAGES.length;
    const selectedImage = this.FALLBACK_IMAGES[imageIndex];
    
    this.debugLog('Character placeholder using uploaded image', { characterName, pageNumber, imageIndex, selectedImage });
    return selectedImage;
  }
}