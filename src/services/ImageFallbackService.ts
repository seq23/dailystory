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

  /**
   * Generate a simple SVG placeholder image
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
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
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