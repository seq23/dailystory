// Enhanced Audio Configuration
// Central configuration for all audio features and settings

export interface AudioSettings {
  // Speed settings based on difficulty level
  speedByDifficulty: {
    easy: number;      // Level 1
    medium: number;    // Level 2  
    hard: number;      // Level 3
    expert: number;    // Level 4
  };
  
  // Word highlighting settings
  highlighting: {
    enabledForLevels: ('easy' | 'medium' | 'hard' | 'expert')[];
    highlightDuration: number; // milliseconds per word
    highlightClass: string;
  };
  
  // Premium features configuration
  premium: {
    voiceCommands: boolean;
    pronunciationAssessment: boolean;
    emotionalVoices: boolean;
    characterVoiceConsistency: boolean;
    offlineCapabilities: boolean;
    phoneticBreakdown: boolean;
    multilingualAudio: boolean;
  };
  
  // Voice selection
  voices: {
    useElevenLabsForNative: boolean;
    useBrowserForNonNative: boolean;
    fallbackToBrowser: boolean;
  };
  
  // Quality and performance
  quality: {
    maxTextLength: {
      free: number;
      premium: number;
    };
    audioFormat: 'mp3' | 'wav';
    cacheAudio: boolean;
  };
}

export const defaultAudioConfig: AudioSettings = {
  speedByDifficulty: {
    easy: 0.6,    // Slowest for Level 1
    medium: 0.8,  // Slower for Level 2
    hard: 1.0,    // Normal for Level 3
    expert: 1.0,  // Normal for Level 4
  },
  
  highlighting: {
    enabledForLevels: ['easy', 'medium'], // Only Levels 1-2 get word highlighting
    highlightDuration: 500, // 500ms per word
    highlightClass: 'bg-yellow-200 animate-pulse',
  },
  
  premium: {
    voiceCommands: true,
    pronunciationAssessment: true,
    emotionalVoices: true,
    characterVoiceConsistency: true,
    offlineCapabilities: true,
    phoneticBreakdown: true,
    multilingualAudio: true,
  },
  
  voices: {
    useElevenLabsForNative: true,
    useBrowserForNonNative: true,
    fallbackToBrowser: true,
  },
  
  quality: {
    maxTextLength: {
      free: 500,
      premium: 1000,
    },
    audioFormat: 'mp3',
    cacheAudio: true,
  },
};

// Voice command configurations for premium users
export const voiceCommands = {
  navigation: {
    'next page': () => console.log('Navigate to next page'),
    'previous page': () => console.log('Navigate to previous page'),
    'go back': () => console.log('Go back'),
  },
  
  reading: {
    'read slower': () => console.log('Decrease speed'),
    'read faster': () => console.log('Increase speed'),
    'repeat that': () => console.log('Repeat current section'),
    'stop reading': () => console.log('Stop audio'),
  },
  
  vocabulary: {
    'what does * mean': (word: string) => console.log(`Explain word: ${word}`),
    'how do you say *': (word: string) => console.log(`Pronounce word: ${word}`),
    'save word *': (word: string) => console.log(`Save word: ${word}`),
  },
};

// Character voice mapping for emotional consistency
export const characterVoices = {
  narrator: "cgSgspJ2msm6clMCkdW9", // Jessica - warm, clear
  child: "EXAVITQu4vr4xnSDxMaL",   // Sarah - young, friendly
  adult: "onwK4e9ZLuTAKqWW03F9",   // Daniel - mature, authoritative
  elderly: "CwhRBWXzGAHq8TQ4Fs17", // Roger - wise, gentle
  animal: "TX3LPaxmHKxFdv7VOQHJ",  // Liam - playful, expressive
};

// Phonetic breakdown settings
export const phoneticSettings = {
  enableSyllableBreakdown: true,
  showIPA: false, // International Phonetic Alphabet - premium feature
  playbackSpeed: 0.7, // Slower for phonetic learning
  pauseBetweenSyllables: 300, // milliseconds
};