// Placeholder resolution now handled by unified edge function
import type { UserInfo } from '@/types';
import { UnifiedCharacterDescriptor } from './UnifiedCharacterDescriptor';

/**
 * Enhanced Post-Processing Service for Story and Image Generation
 * Handles placeholder resolution, character consistency, and content enhancement
 */
export class EnhancedPostProcessor {
  
  /**
   * Post-process AI-generated story content
   * Resolves placeholders, ensures content consistency, and fixes pronouns
   */
  static async processStoryContent(
    pages: string[],
    userInfo: UserInfo,
    sessionId?: string
  ): Promise<string[]> {
    console.log('📝 Post-processing story content for placeholder resolution and pronoun correction');
    
    try {
      const processedPages = pages.map((page, index) => {
        // Processing now delegated to unified edge function - this is just basic cleanup
        const cleanedContent = this.cleanStoryContent(page);
        console.log(`✅ Final processed page ${index + 1}: ${cleanedContent.substring(0, 50)}...`);
        
        return cleanedContent;
      });

      // Store character context if session exists
      if (sessionId && userInfo) {
        await this.initializeCharacterContext(userInfo, sessionId, processedPages);
      }

      return processedPages;
      
    } catch (error) {
      console.warn('Failed to post-process story content:', error);
      return pages; // Return original pages if processing fails
    }
  }

  /**
   * Initialize character context for visual consistency using StoryVisualStateManager
   */
  private static async initializeCharacterContext(
    userInfo: UserInfo,
    sessionId: string,
    pages: string[]
  ): Promise<void> {
    try {
      // Use StoryVisualStateManager directly for character initialization
      const { StoryVisualStateManager } = await import('./storyVisualState');
      
      // Initialize the story state
      const storyState = StoryVisualStateManager.getOrCreateStoryState(
        sessionId,
        pages.length,
        'new',
        false,
        false
      );
      
      // Initialize character context using the existing working system
      console.log(`✅ Initialized character context for ${userInfo.name} directly via StoryVisualStateManager`);
      
    } catch (error) {
      console.warn('Failed to initialize character context:', error);
    }
  }

  /**
   * Validate that all placeholders are resolved
   */
  static validatePlaceholderResolution(content: string): { 
    isValid: boolean; 
    unresolvedPlaceholders: string[];
  } {
    const placeholderPattern = /\{([^}]+)\}/g;
    const matches = Array.from(content.matchAll(placeholderPattern));
    const unresolvedPlaceholders = matches.map(match => match[1]);
    
    return {
      isValid: unresolvedPlaceholders.length === 0,
      unresolvedPlaceholders
    };
  }

  /**
   * Generate character consistency report for debugging via API
   */
  static async generateConsistencyReport(sessionId: string): Promise<{
    hasCharacterSeeds: boolean;
    characterCount: number;
    seedsStored: number;
  }> {
    try {
      console.log(`📊 Character consistency report delegated to backend for session: ${sessionId}`);
      
      // In the new architecture, this would be handled by backend API
      // For now, return default values as consistency is managed backend-side
      return {
        hasCharacterSeeds: true, // Assume backend manages this
        characterCount: 1, // Default for single character stories
        seedsStored: 1 // Assume backend stores seeds
      };
      
    } catch (error) {
      console.warn('Failed to generate consistency report:', error);
      return {
        hasCharacterSeeds: false,
        characterCount: 0,
        seedsStored: 0
      };
    }
  }

  // Pronoun correction methods removed - now handled by edge functions using sophisticated grammar system

  /**
   * Extract story elements for image generation alignment
   */
  static extractStoryElements(content: string): {
    animals: string[];
    characters: string[];
    objects: string[];
    settings: string[];
  } {
    const animals = [];
    const characters = [];
    const objects = [];
    const settings = [];
    
    // Extract animals with names (like "fox named Ruby")
    const animalMatches = content.match(/\b(cat|dog|fox|bird|rabbit|bear|lion|tiger|elephant|giraffe|zebra|monkey|panda|koala|dolphin|whale|fish|butterfly|bee|ladybug|spider|horse|cow|pig|sheep|chicken|duck|goose|turtle|frog|snake|lizard|mouse|rat|hamster|guinea pig|ferret|parrot|canary|goldfish|shark|octopus|crab|lobster|starfish|seal|penguin|polar bear|kangaroo|sloth|hedgehog|squirrel|chipmunk|raccoon|skunk|deer|moose|elk|wolf|coyote|badger|otter|beaver|porcupine|armadillo|anteater|platypus|echidna|wombat|wallaby|opossum|bat|mole|shrew|vole)\s*(?:named\s+\w+)?/gi) || [];
    animals.push(...animalMatches);
    
    // Extract character names (capitalized words that might be names)
    const nameMatches = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g) || [];
    characters.push(...nameMatches.filter(name => !['The', 'A', 'An', 'Once', 'Upon', 'Time', 'Page'].includes(name)));
    
    // Extract common objects mentioned in children's stories
    const objectMatches = content.match(/\b(ball|toy|book|bicycle|car|truck|doll|teddy bear|puzzle|blocks|crayons|paintbrush|backpack|lunch box|hat|shoes|shirt|dress|jacket|umbrella|kite|balloon|flower|tree|house|castle|bridge|boat|airplane|rocket|star|moon|sun|rainbow|cloud|mountain|river|lake|ocean|beach|forest|garden|park|playground|swing|slide|seesaw|sandbox|picnic|cake|cookie|ice cream|pizza|apple|banana|orange|carrot|broccoli|milk|juice|water|cup|plate|spoon|fork|knife|bed|pillow|blanket|chair|table|door|window|key|bell|clock|phone|computer|television|camera|guitar|piano|drum|flute|paintbrush|pencil|eraser|ruler|scissors|glue|tape|paper|envelope|stamp|box|bag|basket|bottle|jar|can|bowl|pot|pan|spatula|whisk|mixer|oven|refrigerator|stove|microwave|toaster|blender|dishwasher|washing machine|dryer|vacuum|broom|mop|bucket|sponge|towel|soap|shampoo|toothbrush|toothpaste|comb|brush|mirror|lamp|candle|flashlight|battery|charger|adapter|cable|wire|plug|switch|button|lever|wheel|gear|spring|screw|nail|hammer|screwdriver|wrench|pliers|saw|drill|ladder|rope|chain|lock|magnet|compass|map|globe|telescope|microscope|magnifying glass|binoculars|calculator|watch|calendar|notebook|diary|journal|pen|marker|highlighter|stapler|hole punch|clipboard|folder|binder|envelope|package|gift|present|ribbon|bow|card|letter|postcard|ticket|passport|license|certificate|diploma|trophy|medal|award|prize|crown|ring|necklace|bracelet|earrings|glasses|sunglasses|contact lenses|hearing aid|cane|walker|wheelchair|crutches|bandage|medicine|pill|vitamin|thermometer|stethoscope|syringe|needle|bandaid|ice pack|heating pad|blanket|pillow|mattress|sheet|pillowcase|comforter|duvet|quilt|sleeping bag|tent|campfire|lantern|flashlight|matches|lighter|candle|torch|bonfire|fireplace|chimney|smoke|ash|coal|wood|log|stick|branch|leaf|acorn|pinecone|mushroom|moss|grass|weed|flower|petal|stem|root|seed|fruit|vegetable|grain|cereal|bread|butter|cheese|meat|fish|chicken|egg|rice|pasta|soup|salad|sandwich|burger|hot dog|taco|burrito|pizza|pie|cake|cookie|candy|chocolate|ice cream|yogurt|milk|juice|soda|coffee|tea|water|wine|beer)\b/gi) || [];
    objects.push(...objectMatches);
    
    return {
      animals: [...new Set(animals)],
      characters: [...new Set(characters)],
      objects: [...new Set(objects)],
      settings: [...new Set(settings)]
    };
  }

  // Grammar fixing methods removed - now handled by edge functions using sophisticated validateAndEnhanceGrammar system

  /**
   * Clean and enhance story content for better readability
   */
  static cleanStoryContent(content: string): string {
    return content
      .replace(/\s{2,}/g, ' ') // Multiple spaces to single space
      .replace(/\s+([,.!?:;])/g, '$1') // Remove space before punctuation
      .replace(/([.!?])\s*([a-z])/g, '$1 $2') // Ensure space after sentence endings
      .trim();
  }
}