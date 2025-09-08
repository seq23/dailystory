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
   * Generate a simple SVG placeholder image with multiple fallback formats
   */
  static generatePlaceholderSVG(config: Partial<FallbackImageConfig> = {}): string {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    const svg = `
      <svg width="${finalConfig.width}" height="${finalConfig.height}" viewBox="0 0 ${finalConfig.width} ${finalConfig.height}" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="100%" height="100%" fill="#f8f9fa" stroke="#e5e7eb" stroke-width="1"/>
        
        <!-- Broken Wand SVG - Embedded -->
        <g transform="translate(${finalConfig.width/2 - 30}, ${finalConfig.height/2 - 125})">
          <!-- Broken wand shaft - two pieces -->
          <path d="M10 50 L25 35" stroke="#9ca3af" stroke-width="3" stroke-linecap="round"/>
          <path d="M30 30 L45 15" stroke="#9ca3af" stroke-width="3" stroke-linecap="round"/>
          
          <!-- Crack/break indication -->
          <path d="M24 36 L26 34 L28 32" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
          
          <!-- Dimmed refresh ring (broken) -->
          <circle cx="45" cy="15" r="8" fill="none" stroke="#d1d5db" stroke-width="1.5" opacity="0.4"/>
          
          <!-- Cross mark on the ring -->
          <path d="M40 10 L50 20 M50 10 L40 20" stroke="#ef4444" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
          
          <!-- Fading sparkles/stars -->
          <circle cx="15" cy="45" r="1.5" fill="#d1d5db" opacity="0.3"/>
          <circle cx="35" cy="25" r="1" fill="#d1d5db" opacity="0.2"/>
          <circle cx="20" cy="40" r="1" fill="#d1d5db" opacity="0.25"/>
        </g>
        
        <!-- Arrow marker definition -->
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="#9ca3af"/>
          </marker>
        </defs>
        
        <!-- Main message -->
        <text x="50%" y="${finalConfig.height/2 + 60}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#374151">
          Images not working right now
        </text>
        <text x="50%" y="${finalConfig.height/2 + 80}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#6b7280">
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
    const env = this.getEnvironmentInfo();
    
    // Always prefer data URLs for better compatibility
    // Blob URLs can be problematic with CSP and cleanup
    try {
      return this.generatePlaceholderSVG(config);
    } catch (error) {
      this.debugLog('Data URL generation failed, trying blob URL', error);
      
      // Only try blob URL as last resort
      if (!env.hasCSPBlocking) {
        try {
          return this.generateBlobSVG(config);
        } catch {
          // Return a simple text-based fallback
          return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCI+PHRleHQ+SW1hZ2UgTm90IEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
        }
      }
      
      // Final fallback - simple encoded SVG
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCI+PHRleHQ+SW1hZ2UgTm90IEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
    }
  }

  /**
   * Generate a story-specific placeholder with page context
   */
  static generateStoryPlaceholder(storyText: string, pageNumber: number): string {
    // Extract key elements from story text for placeholder
    const words = storyText.split(' ').slice(0, 10);
    const truncatedText = words.length === 10 ? words.join(' ') + '...' : words.join(' ');
    
    return this.generatePlaceholderSVG({
      text: `📖 Page ${pageNumber}`,
      backgroundColor: '#fef3c7', // Warm yellow
      textColor: '#92400e' // Amber text
    });
  }

  /**
   * Check if a URL is a fallback image
   */
  static isFallbackImage(url: string): boolean {
    return url.startsWith('data:image/svg+xml;base64,');
  }

  /**
   * Get a character-themed placeholder
   */
  static generateCharacterPlaceholder(characterName: string, pageNumber: number): string {
    const emojis = ['🧒', '👧', '👦', '🧑', '👨', '👩'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    return this.generatePlaceholderSVG({
      text: `${randomEmoji} ${characterName}`,
      backgroundColor: '#ecfdf5', // Light green
      textColor: '#047857' // Green text
    });
  }
}