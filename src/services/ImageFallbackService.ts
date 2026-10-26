/**
 * Simple Static Image Fallback Service - No dynamic generation, just embedded base64 images
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
    backgroundColor: '#f0f9ff',
    textColor: '#1e40af',
    text: '📖 Story Illustration'
  };

  // A calm "Picture coming soon" page (public/story-picture-placeholder.svg). The old
  // "Images Not Working" signs were a developer notice that children saw.
  private static readonly FALLBACK_IMAGES_BASE64 = [
    "/story-picture-placeholder.svg",
  ];


  /**
   * Get a fallback image by index (0-5)
   */
  static getFallbackImage(index: number = 0): string {
    const safeIndex = Math.abs(index) % this.FALLBACK_IMAGES_BASE64.length;
    return this.FALLBACK_IMAGES_BASE64[safeIndex];
  }

  /**
   * Get the best fallback - now simply returns a static embedded image
   */
  static getBestFallback(config: Partial<FallbackImageConfig> = {}): string {
    // Always return the first fallback image for consistency
    return this.FALLBACK_IMAGES_BASE64[0];
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

  /**
   * Checks if a URL is one of our known fallback images
   */
  static isFallbackImage(url: string): boolean {
    if (!url) return false;
    
    return (
      this.FALLBACK_IMAGES_BASE64.includes(url) ||
      url.includes('story-picture-placeholder') ||
      url.includes('images-not-working-')
    );
  }
}