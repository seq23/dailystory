// Author Voice Service - AI Inspiration System
// 
// ⚠️ IMPORTANT: This service is now used ONLY as an AI inspiration reference.
// The AI dynamically references these patterns when needed for story generation.
// No algorithmic selection happens - AI chooses appropriate voice elements based on story context.
//
// Usage: AI references available patterns in storyPrompts.ts via:
// "Draw inspiration from available author voice patterns in authorVoiceService.ts"

import type { DifficultyLevel } from "@/types";

export interface ColorVoice {
  name: string;
  description: string;
  ageRange: { min: number; max: number };
  openingPatterns: string[];
  transitionPatterns: string[];
  closingPatterns: string[];
  characteristics: string[];
  preferredThemes: string[];
  styleSummary: string;
  sampleMicroLines: string[];
}

export const INSPIRATIONAL_VOICES: Record<string, ColorVoice> = {
  gentleGuide: {
    name: "The Gentle Guide",
    description: "A nurturing storyteller who weaves nature and kindness into every tale",
    ageRange: { min: 4, max: 12 },
    openingPatterns: [
      "In a world where kindness blooms like flowers...",
      "Once upon a time, in a place where friendship grows...", 
      "There was a gentle soul who believed...",
      "In the heart of a peaceful garden..."
    ],
    transitionPatterns: [
      "With a warm smile, {pronoun} discovered...",
      "As gentle as a morning breeze...",
      "Like seeds of wisdom taking root...",
      "With patience that flows like a quiet stream..."
    ],
    closingPatterns: [
      "And so, with hearts full of understanding...",
      "Like leaves that dance in harmony...", 
      "With wisdom that grows stronger each day...",
      "And peace settled over the land like a gentle mist..."
    ],
    characteristics: [
      "Uses nature metaphors and imagery",
      "Emphasizes growth, learning, and patience",
      "Gentle, nurturing tone throughout",
      "Focuses on emotional intelligence and empathy",
      "Celebrates quiet moments and inner strength"
    ],
    preferredThemes: ["friendship", "nature", "growth", "kindness", "animals", "family"],
    styleSummary: "Warm, nature-focused storytelling with gentle wisdom and emotional depth",
    sampleMicroLines: [
      "The butterfly whispered secrets of transformation...",
      "In the garden of possibilities...",
      "With roots deep and branches reaching..."
    ]
  },
  cosmicDreamer: {
    name: "The Cosmic Dreamer",
    description: "A mystical narrator who paints adventures across starlit realms and magical dimensions", 
    ageRange: { min: 6, max: 16 },
    openingPatterns: [
      "Among the constellations where dreams take flight...",
      "In the shimmer between worlds...",
      "When starlight dances with possibility...",
      "Beyond the veil of ordinary sight..."
    ],
    transitionPatterns: [
      "Like stardust scattered across time...",
      "Through portals of wonder...",
      "As magic hummed in the air...",
      "Where reality bends to imagination..."
    ],
    closingPatterns: [
      "And the cosmos smiled upon their journey...",
      "Like shooting stars, their story continues...",
      "In the endless tapestry of wonder...",
      "Where every ending becomes a new beginning..."
    ],
    characteristics: [
      "Rich in cosmic and mystical imagery",
      "Embraces wonder and transformation",
      "Lyrical, flowing narrative style", 
      "Balances adventure with introspection",
      "Celebrates imagination and possibility"
    ],
    preferredThemes: ["magic", "adventure", "transformation", "mystery", "dreams", "fantasy"],
    styleSummary: "Mystical and wonder-filled with cosmic imagery and transformative journeys",
    sampleMicroLines: [
      "Starlight whispered ancient secrets...",
      "In the dance of celestial bodies...",
      "Where imagination touches infinity..."
    ]
  },
  spiritedExplorer: {
    name: "The Spirited Explorer",
    description: "An energetic adventurer who turns every moment into a thrilling discovery",
    ageRange: { min: 5, max: 14 },
    openingPatterns: [
      "Adventure calls from every corner...",
      "With curiosity burning bright...",
      "In a world full of hidden treasures...",
      "Where every step leads to discovery..."
    ],
    transitionPatterns: [
      "With excitement bubbling over...",
      "Like a burst of golden sunshine...",
      "Racing toward the next adventure...",
      "With energy that could light up the sky..."
    ],
    closingPatterns: [
      "And their adventure was just beginning...",
      "With hearts full of joy and wonder...",
      "Ready for whatever comes next...",
      "And the world became a playground of possibilities..."
    ],
    characteristics: [
      "High-energy, enthusiastic tone",
      "Emphasizes action and discovery",
      "Celebrates courage and curiosity", 
      "Uses vivid, dynamic imagery",
      "Encourages boldness and exploration"
    ],
    preferredThemes: ["adventure", "friendship", "courage", "discovery", "fun", "sports"],
    styleSummary: "Dynamic and energetic with emphasis on action, discovery, and joyful adventures",
    sampleMicroLines: [
      "Lightning-fast reflexes kicked in...",
      "The thrill of discovery sparkled...",
      "Adventure awaited around every bend..."
    ]
  },
  heartWhisperer: {
    name: "The Heart Whisperer", 
    description: "A compassionate storyteller who finds beauty in emotions and human connections",
    ageRange: { min: 7, max: 15 },
    openingPatterns: [
      "In the language of the heart...",
      "Where love blooms like morning roses...",
      "When hearts recognize their kindred spirits...",
      "In the gentle spaces between souls..."
    ],
    transitionPatterns: [
      "With tenderness that heals...",
      "Like a warm embrace on a cold day...",
      "Through the poetry of understanding...",
      "With compassion flowing like a river..."
    ],
    closingPatterns: [
      "And love found its way home...",
      "In the garden of cherished memories...",
      "Where hearts remain forever connected...",
      "And warmth settled deep within their souls..."
    ],
    characteristics: [
      "Emotionally rich and nurturing",
      "Focuses on relationships and connections",
      "Uses romantic and tender imagery",
      "Celebrates empathy and understanding",
      "Gentle, flowing narrative rhythm"
    ],
    preferredThemes: ["love", "friendship", "family", "emotions", "relationships", "healing"],
    styleSummary: "Tender and emotionally resonant with focus on human connections and healing",
    sampleMicroLines: [
      "Hearts spoke without words...",
      "In the symphony of souls...",
      "Love's gentle touch awakened..."
    ]
  },
  wiseSage: {
    name: "The Wise Sage",
    description: "An ancient storyteller who weaves timeless wisdom into captivating tales",
    ageRange: { min: 8, max: 18 },
    openingPatterns: [
      "In the chambers of ancient wisdom...",
      "Where knowledge flows like golden rivers...",
      "From the depths of understanding...",
      "In the sacred halls of learning..."
    ],
    transitionPatterns: [
      "With the weight of ages behind them...",
      "Through corridors of deep thought...",
      "Like echoes of eternal truth...",
      "With wisdom earned through experience..."
    ],
    closingPatterns: [
      "And wisdom became their guiding light...",
      "In the tapestry of eternal knowledge...",
      "Where understanding illuminates the path...",
      "And truth revealed its timeless beauty..."
    ],
    characteristics: [
      "Philosophical and contemplative tone",
      "Rich in metaphor and symbolism",
      "Emphasizes learning and growth",
      "Uses classical and timeless imagery",
      "Balances wisdom with accessibility"
    ],
    preferredThemes: ["wisdom", "learning", "growth", "mystery", "philosophy", "history"],
    styleSummary: "Contemplative and wise with classical imagery and philosophical depth",
    sampleMicroLines: [
      "Ancient wisdom stirred to life...",
      "In the labyrinth of knowledge...",
      "Truth emerged from shadows of doubt..."
    ]
  },
  playfulSpirit: {
    name: "The Playful Spirit",
    description: "A joyful narrator who finds magic in laughter and celebrates the lighter side of life",
    ageRange: { min: 4, max: 12 },
    openingPatterns: [
      "Where giggles dance with sunbeams...",
      "In a world painted with laughter...",
      "When joy bubbles up like magic...",
      "Where every day is a celebration..."
    ],
    transitionPatterns: [
      "With a skip and a hop...",
      "Like bubbles floating on the breeze...",
      "Through puddles of pure joy...",
      "With laughter ringing like silver bells..."
    ],
    closingPatterns: [
      "And happiness filled every corner...",
      "With smiles that could light up the world...",
      "Where laughter echoes forever...",
      "And joy became their constant companion..."
    ],
    characteristics: [
      "Light-hearted and whimsical",
      "Emphasizes fun and celebration",
      "Uses playful imagery and sounds",
      "Celebrates innocence and wonder",
      "Upbeat, bouncy narrative rhythm"
    ],
    preferredThemes: ["fun", "friendship", "celebration", "animals", "games", "family"],
    styleSummary: "Whimsical and joyful with emphasis on fun, laughter, and celebratory moments",
    sampleMicroLines: [
      "Giggles sparkled in the air...",
      "Joy painted rainbow colors...",
      "Laughter became their superpower..."
    ]
  },
  questSeeker: {
    name: "The Quest Seeker",
    description: "A determined narrator who transforms challenges into heroic journeys of growth",
    ageRange: { min: 6, max: 16 },
    openingPatterns: [
      "When destiny calls from distant shores...",
      "In the crucible of great challenges...",
      "Where heroes are forged in fire...",
      "At the crossroads of courage and fear..."
    ],
    transitionPatterns: [
      "With steel in their spine...",
      "Through trials that test the soul...",
      "Like a phoenix rising...",
      "With determination burning bright..."
    ],
    closingPatterns: [
      "And victory tasted sweeter than honey...",
      "Where legends are born from struggle...",
      "With honor earned through perseverance...",
      "And their legacy echoed through time..."
    ],
    characteristics: [
      "Epic and inspiring tone",
      "Emphasizes heroism and perseverance",
      "Uses powerful, dramatic imagery",
      "Celebrates courage and determination",
      "Strong, rhythmic narrative flow"
    ],
    preferredThemes: ["adventure", "courage", "growth", "challenges", "heroes", "quests"],
    styleSummary: "Epic and inspiring with heroic themes and emphasis on overcoming challenges",
    sampleMicroLines: [
      "Destiny forged in starfire...",
      "Through the gauntlet of trials...",
      "Where courage meets its calling..."
    ]
  }
};

export interface AuthorVoiceBundle {
  voice: ColorVoice;
  selectedPatterns: {
    opening: string;
    transition: string;
    closing: string;
  };
  themeAlignment: string[];
}

export class AuthorVoiceService {
  /**
   * Selects an appropriate inspirational voice based on difficulty level and story context
   */
  static selectInspirationalVoice(difficulty: DifficultyLevel = 'easy', themeHints?: string[]): ColorVoice {
    const ageGroup = this.mapDifficultyToAgeGroup(difficulty);
    
    // Filter voices that are age-appropriate
    const appropriateVoices = Object.values(INSPIRATIONAL_VOICES).filter(voice =>
      voice.ageRange.min <= ageGroup.max && voice.ageRange.max >= ageGroup.min
    );
    
    // If theme hints are provided, try to find voices that match
    if (themeHints && themeHints.length > 0 && appropriateVoices.length > 1) {
      const themeMatchedVoices = appropriateVoices.filter(voice =>
        voice.preferredThemes.some(theme => 
          themeHints.some(hint => hint.toLowerCase().includes(theme.toLowerCase()))
        )
      );
      
      if (themeMatchedVoices.length > 0) {
        return themeMatchedVoices[Math.floor(Math.random() * themeMatchedVoices.length)];
      }
    }
    
    // Random selection from appropriate voices for creative inspiration
    if (appropriateVoices.length > 0) {
      return appropriateVoices[Math.floor(Math.random() * appropriateVoices.length)];
    }
    
    // Final fallback to gentle guide
    return INSPIRATIONAL_VOICES.gentleGuide;
  }

  /**
   * Creates a complete voice bundle for AI storytelling inspiration
   */
  static createInspirationalBundle(difficulty: DifficultyLevel, themeHints?: string[]): AuthorVoiceBundle {
    const voice = this.selectInspirationalVoice(difficulty, themeHints);
    
    return {
      voice,
      selectedPatterns: {
        opening: this.selectRandomPattern(voice.openingPatterns),
        transition: this.selectRandomPattern(voice.transitionPatterns), 
        closing: this.selectRandomPattern(voice.closingPatterns)
      },
      themeAlignment: voice.preferredThemes
    };
  }

  /**
   * Extracts theme hints from user info for better voice matching
   */
  private static extractThemeHints(userInfo?: any): string[] {
    const hints: string[] = [];
    
    if (!userInfo) return hints;
    
    // Extract from interests
    if (userInfo.interests) {
      hints.push(...userInfo.interests);
    }
    
    // Extract from favorite activities
    if (userInfo.favoriteActivities) {
      hints.push(...userInfo.favoriteActivities);
    }
    
    // Extract from story preferences
    if (userInfo.storyLanguagePreferences) {
      hints.push(...userInfo.storyLanguagePreferences);
    }
    
    return hints.map(hint => hint.toLowerCase());
  }

  /**
   * Maps difficulty to age groups for voice selection
   */
  private static mapDifficultyToAgeGroup(difficulty: DifficultyLevel): { min: number; max: number } {
    switch (difficulty) {
      case 'beginner': return { min: 3, max: 6 };
      case 'easy': return { min: 5, max: 8 };
      case 'medium': return { min: 7, max: 12 };
      case 'hard': return { min: 10, max: 16 };
      case 'expert': return { min: 14, max: 18 };
      default: return { min: 5, max: 8 };
    }
  }

  /**
   * Selects a random pattern from an array
   */
  private static selectRandomPattern(patterns: string[]): string {
    if (!patterns || patterns.length === 0) return '';
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  /**
   * Resolves placeholders in text with user information
   */
  static resolvePlaceholders(text: string, userInfo: any = {}): string {
    let resolved = text;
    
    // Basic user info placeholders
    resolved = resolved.replace(/{userName}/g, userInfo.name || 'the child');
    resolved = resolved.replace(/{pronoun}/g, this.derivePronoun(userInfo));
    
    return resolved;
  }

  /**
   * Derives appropriate pronoun from user info
   */
  private static derivePronoun(userInfo: any = {}): string {
    const avatarType = userInfo.avatar?.type;
    
    switch (avatarType) {
      case 'boy': return 'he';
      case 'girl': return 'she';
      default: return 'they';
    }
  }
}