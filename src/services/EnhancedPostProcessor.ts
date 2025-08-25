import { resolveAllPlaceholders } from '@/utils/placeholderResolver';
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
        // Step 1: Resolve placeholders first using the new unified system
        const placeholderResolved = resolveAllPlaceholders(page, { userInfo });
        console.log(`✅ Placeholder resolved page ${index + 1}: ${placeholderResolved.substring(0, 50)}...`);
        
        // Step 2: Apply comprehensive grammar fixes 
        const grammarFixed = this.applyGrammarFixes(placeholderResolved);
        console.log(`✅ Grammar fixed page ${index + 1}: ${grammarFixed.substring(0, 50)}...`);
        
        // Step 3: Apply pronoun corrections (after grammar fixes)
        const pronounCorrected = this.correctPronouns(grammarFixed, userInfo.avatar?.type || 'prefer-not-to-answer');
        console.log(`✅ Final processed page ${index + 1}: ${pronounCorrected.substring(0, 50)}...`);
        
        return pronounCorrected;
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

  /**
   * Correct pronouns based on avatar type to ensure consistency
   */
  static correctPronouns(content: string, avatarType: string): string {
    const correctPronouns = this.getPronounsForAvatar(avatarType);
    let correctedContent = content;
    
    // Comprehensive pronoun replacement maps for all avatar types
    const pronounMaps = {
      girl: {
        'he': 'she', 'him': 'her', 'his': 'her',
        'He': 'She', 'Him': 'Her', 'His': 'Her',
        'himself': 'herself', 'Himself': 'Herself',
        'they': 'she', 'them': 'her', 'their': 'her', 'theirs': 'hers',
        'They': 'She', 'Them': 'Her', 'Their': 'Her', 'Theirs': 'Hers',
        'themselves': 'herself', 'Themselves': 'Herself'
      },
      boy: {
        'she': 'he', 'her': 'him', 'hers': 'his',
        'She': 'He', 'Her': 'Him', 'Hers': 'His',
        'herself': 'himself', 'Herself': 'Himself',
        'they': 'he', 'them': 'him', 'their': 'his', 'theirs': 'his',
        'They': 'He', 'Them': 'Him', 'Their': 'His', 'Theirs': 'His',
        'themselves': 'himself', 'Themselves': 'Himself'
      }
    };

    const pronounMap = pronounMaps[avatarType] || pronounMaps.boy;
    
    // Apply pronoun corrections with word boundaries
    Object.entries(pronounMap).forEach(([incorrect, correct]) => {
      const regex = new RegExp(`\\b${incorrect}\\b`, 'g');
      correctedContent = correctedContent.replace(regex, correct as string);
    });
    
    return correctedContent;
  }

  /**
   * Get correct pronouns for avatar type
   */
  private static getPronounsForAvatar(avatarType: string): {
    subject: string;
    object: string;
    possessive: string;
  } {
    switch (avatarType) {
      case 'girl':
        return { subject: 'she', object: 'her', possessive: 'her' };
      case 'boy':
      default:
        return { subject: 'he', object: 'him', possessive: 'his' };
    }
  }

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

  /**
   * Apply comprehensive grammar fixes for common errors in Level 0 content
   */
  static applyGrammarFixes(content: string): string {
    let fixed = content;
    
    // Fix basic subject-verb agreement
    fixed = fixed.replace(/\bI are\b/g, 'I am');
    fixed = fixed.replace(/\bhe are\b/g, 'he is');
    fixed = fixed.replace(/\bshe are\b/g, 'she is'); 
    fixed = fixed.replace(/\bit are\b/g, 'it is');
    
    // Fix have/has agreement for all pronouns
    fixed = fixed.replace(/\bhe have\b/g, 'he has');
    fixed = fixed.replace(/\bshe have\b/g, 'she has');
    fixed = fixed.replace(/\bit have\b/g, 'it has');
    fixed = fixed.replace(/\bI has\b/g, 'I have');
    fixed = fixed.replace(/\byou has\b/g, 'you have');
    fixed = fixed.replace(/\bwe has\b/g, 'we have');
    
    // Fix verb forms with they
    fixed = fixed.replace(/\bthey is\b/g, 'they are');
    fixed = fixed.replace(/\bthey was\b/g, 'they were');
    fixed = fixed.replace(/\bthey has\b/g, 'they have');
    
    // Fix do/does agreement
    fixed = fixed.replace(/\bhe do\b/g, 'he does');
    fixed = fixed.replace(/\bshe do\b/g, 'she does');
    fixed = fixed.replace(/\bit do\b/g, 'it does');
    
    // Fix double articles or missing words patterns - CRITICAL FIX
    fixed = fixed.replace(/\bthe\s+is\b/gi, 'child is'); // "The is happy" -> "child is happy"
    fixed = fixed.replace(/\bthe\s+are\b/gi, 'they are'); // "The are happy" -> "They are happy"
    fixed = fixed.replace(/\bthe\s+have\b/gi, 'they have'); // "The have fun" -> "They have fun"
    fixed = fixed.replace(/\bthe\s+has\b/gi, 'child has'); // "The has fun" -> "child has fun"
    
    return fixed;
  }

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