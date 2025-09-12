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

  // Static image URLs - 6 variations of "Children with 'Images Not Working' signs"
  private static readonly FALLBACK_IMAGES_BASE64 = [
    // Variation 1 - Original "Images Not Working" child illustration
    "/assets/images-not-working-1.webp",
    
    // Variation 2 - Different child holding sign
    "/assets/images-not-working-2.webp",
    
    // Variation 3 - Another child illustration
    "/assets/images-not-working-3.webp",
    
    // Variation 4 - Fourth child variation 
    "/assets/images-not-working-5.webp",
    
    // Variation 5 - Fifth child illustration
    "/assets/images-not-working-6.webp",
    
    // Variation 6 - Final child variation
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
      url.includes('images-not-working-')
    );
  }
}