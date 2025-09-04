// Author Voice Service for Supabase Edge Functions
// Provides voice patterns for dynamic AI prompt enhancement

export interface VoicePatterns {
  openingPatterns: string[];
  transitionPatterns: string[];
  closingPatterns: string[];
  styleSummary: string;
  characteristics: string[];
}

const VOICE_PATTERNS: Record<string, VoicePatterns> = {
  gentleGuide: {
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
    styleSummary: "Warm, nature-focused storytelling with gentle wisdom and emotional depth",
    characteristics: [
      "Uses nature metaphors and imagery",
      "Emphasizes growth, learning, and patience", 
      "Gentle, nurturing tone throughout",
      "Focuses on emotional intelligence and empathy"
    ]
  },
  cosmicDreamer: {
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
    styleSummary: "Mystical and wonder-filled with cosmic imagery and transformative journeys",
    characteristics: [
      "Rich in cosmic and mystical imagery",
      "Embraces wonder and transformation",
      "Lyrical, flowing narrative style", 
      "Balances adventure with introspection"
    ]
  },
  spiritedExplorer: {
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
    styleSummary: "Dynamic and energetic with emphasis on action, discovery, and joyful adventures",
    characteristics: [
      "High-energy, enthusiastic tone",
      "Emphasizes action and discovery",
      "Celebrates courage and curiosity", 
      "Uses vivid, dynamic imagery"
    ]
  },
  heartWhisperer: {
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
    styleSummary: "Tender and emotionally resonant with focus on human connections and healing",
    characteristics: [
      "Emotionally rich and nurturing",
      "Focuses on relationships and connections",
      "Uses romantic and tender imagery",
      "Celebrates empathy and understanding"
    ]
  }
};

/**
 * Maps difficulty to appropriate voice patterns for AI inspiration
 */
function mapDifficultyToVoiceType(difficulty: string): string {
  const lowerDiff = difficulty.toLowerCase();
  
  if (lowerDiff.includes('beginner') || lowerDiff.includes('easy')) {
    return Math.random() < 0.6 ? 'gentleGuide' : 'spiritedExplorer';
  } else if (lowerDiff.includes('medium')) {
    const options = ['gentleGuide', 'spiritedExplorer', 'heartWhisperer'];
    return options[Math.floor(Math.random() * options.length)];
  } else if (lowerDiff.includes('hard') || lowerDiff.includes('expert') || lowerDiff.includes('grade')) {
    const options = ['cosmicDreamer', 'heartWhisperer', 'spiritedExplorer'];
    return options[Math.floor(Math.random() * options.length)];
  }
  
  return 'gentleGuide'; // Default fallback
}

/**
 * Fetches voice patterns for dynamic AI prompt enhancement
 */
export function fetchVoicePatterns(difficulty: string): VoicePatterns | null {
  if (!difficulty) return null;
  
  const voiceType = mapDifficultyToVoiceType(difficulty);
  return VOICE_PATTERNS[voiceType] || null;
}