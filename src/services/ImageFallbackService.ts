import { supabase } from '@/integrations/supabase/client';
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

  // Base64 encoded fallback images - embedded character illustrations
  private static readonly FALLBACK_IMAGES_BASE64 = [
    // Main group shot with all four children
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", // Placeholder - will be replaced with actual generated image
    // Blonde child individual portrait  
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", // Placeholder - will be replaced with actual generated image
    // Red-haired child portrait
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", // Placeholder - will be replaced with actual generated image
    // Medium-skinned child portrait
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", // Placeholder - will be replaced with actual generated image
    // African American child portrait
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", // Placeholder - will be replaced with actual generated image
    // Two children teamwork shot
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", // Placeholder - will be replaced with actual generated image
  ];

  private static debugLog(message: string, data?: any) {
    console.log(`🖼️ ImageFallback: ${message}`, data || '');
  }

  // Dynamic generation state for AI-based fallbacks
  private static generated = false;
  private static generating = false;
  private static generationError: string | null = null;

  /**
   * Triggers the Supabase Edge Function to generate base64 fallback images
   * and embeds them into this service for future use.
   */
  static async ensureGenerated(): Promise<void> {
    if (this.generated || this.generating) return;
    this.generating = true;
    try {
      this.debugLog('Requesting generated fallback images from edge function...');
      const { data, error } = await supabase.functions.invoke('generate-fallback-images');
      if (error) throw error;

      const images: { base64: string }[] = (data as any)?.images || [];
      if (!images.length) throw new Error('No images returned from generator');

      // Replace placeholders with real base64 images
      const formatted = images.map((img) => `data:image/png;base64,${img.base64}`);
      this.FALLBACK_IMAGES_BASE64.splice(0, this.FALLBACK_IMAGES_BASE64.length, ...formatted);
      this.generated = true;
      this.debugLog('Fallback images generated and embedded', { count: images.length });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('fallback-images-ready'));
      }
    } catch (err: any) {
      this.generationError = err?.message || String(err);
      this.debugLog('Failed to generate fallback images', this.generationError);
    } finally {
      this.generating = false;
    }
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
   * Generates an SVG placeholder with an embedded base64 image
   */
  static generatePlaceholderSVG(config: Partial<FallbackImageConfig> & { pageNumber?: number } = {}): string {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const { width, height, backgroundColor, textColor, text, pageNumber = 1 } = finalConfig;

    // Select base64 image based on page number (cycling through available images)
    const imageIndex = (pageNumber - 1) % this.FALLBACK_IMAGES_BASE64.length;
    const base64Image = this.FALLBACK_IMAGES_BASE64[imageIndex];

    const svgContent = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="bg-pattern-${pageNumber}" patternUnits="userSpaceOnUse" width="20" height="20">
            <rect width="20" height="20" fill="${backgroundColor}" opacity="0.1"/>
            <circle cx="10" cy="10" r="1" fill="${textColor}" opacity="0.1"/>
          </pattern>
        </defs>
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="${backgroundColor}"/>
        <rect width="100%" height="100%" fill="url(#bg-pattern-${pageNumber})"/>
        
        <!-- Main embedded image -->
        <image 
          href="${base64Image}" 
          x="10" 
          y="40" 
          width="${width - 20}" 
          height="${height - 80}" 
          preserveAspectRatio="xMidYMid meet"
          opacity="0.9"
        />
        
        <!-- Overlay text -->
        <rect x="10" y="10" width="${width - 20}" height="25" fill="${backgroundColor}" opacity="0.8" rx="5"/>
        <text 
          x="${width / 2}" 
          y="28" 
          text-anchor="middle" 
          font-family="Arial, sans-serif" 
          font-size="14" 
          font-weight="600"
          fill="${textColor}"
        >
          ${text}
        </text>
        
        <!-- Page indicator -->
        <circle cx="${width - 25}" cy="${height - 25}" r="12" fill="${textColor}" opacity="0.2"/>
        <text 
          x="${width - 25}" 
          y="${height - 21}" 
          text-anchor="middle" 
          font-family="Arial, sans-serif" 
          font-size="10" 
          font-weight="bold"
          fill="${textColor}"
        >
          ${pageNumber}
        </text>
      </svg>
    `.replace(/\s+/g, ' ').trim();

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
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
   * Returns the best fallback - always use embedded SVG for reliability
   */
  static getBestFallback(config: Partial<FallbackImageConfig> = {}): string {
    // Kick off async generation of richer fallbacks (non-blocking)
    try { void this.ensureGenerated(); } catch {}
    // Always use the embedded base64 SVG fallback for maximum reliability
    return this.generatePlaceholderSVG(config);
  }

  /**
   * Generate a story-specific placeholder with page context
   */
  static generateStoryPlaceholder(storyText: string, pageNumber: number): string {
    return this.generatePlaceholderSVG({
      text: '📖 Story Illustration',
      pageNumber
    });
  }

  /**
   * Checks if a URL is one of our known fallback images
   */
  static isFallbackImage(url: string): boolean {
    if (!url) return false;
    
    return (
      this.FALLBACK_IMAGES_BASE64.includes(url) ||
      url.startsWith('data:image/svg+xml') ||
      url.includes('base64')
    );
  }

  /**
   * Get a character-themed placeholder
   */
  static generateCharacterPlaceholder(characterName: string, pageNumber: number): string {
    // Use character name hash + page number for consistent but varied selection
    const nameHash = characterName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imageIndex = Math.abs(nameHash + pageNumber) % this.FALLBACK_IMAGES_BASE64.length;
    
    return this.generatePlaceholderSVG({
      text: `${characterName} - Story Illustration`,
      pageNumber: imageIndex + 1
    });
  }
}