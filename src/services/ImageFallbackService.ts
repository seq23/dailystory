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
   * Detect if CSP blocks data URLs
   */
  static detectCSPIssues(): boolean {
    try {
      const testImg = new Image();
      testImg.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIj48L3N2Zz4=';
      return false; // No immediate error
    } catch (error) {
      this.debugLog('CSP blocks data URLs', error);
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
    
    // Try blob URL first for CSP-safe environments
    if (!env.hasCSPBlocking) {
      try {
        return this.generateBlobSVG(config);
      } catch {
        // Fall back to data URL
      }
    }
    
    // Fall back to data URL
    return this.generatePlaceholderSVG(config);
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