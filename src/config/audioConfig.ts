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
    enabledForLevels: ('beginner' | 'easy' | 'medium' | 'hard' | 'expert')[];
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
  
  // Celebration sound settings
  celebration?: {
    enabled: boolean;
    volume: number;
    duckTTS: boolean;
  };
}

export const defaultAudioConfig: AudioSettings = {
  speedByDifficulty: {
    easy: 0.7,    // Slow for Level 1
    medium: 0.9,  // Moderate for Level 2
    hard: 1.0,    // Normal for Level 3
    expert: 1.2,  // Faster for Level 4
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
  
  celebration: {
    enabled: true,
    volume: 0.5,
    duckTTS: true,
  },
};

// Voice command configurations for premium users
export const voiceCommands = {
  navigation: {
    'next page': () => navigate('next'),
    'previous page': () => navigate('prev'),
    'go back': () => navigate('prev'),
  },
  
  reading: {
    'read slower': () => console.log('Decrease speed'),
    'read faster': () => console.log('Increase speed'),
    'repeat that': () => console.log('Repeat current section'),
    'stop reading': () => console.log('Stop audio'),
  },
  
  vocabulary: {
    'what does * mean': (word: string) => window.dispatchEvent(new CustomEvent('voice:vocab', { detail: { type: 'define', word: word?.trim() } })),
    'how do you say *': (word: string) => window.dispatchEvent(new CustomEvent('voice:vocab', { detail: { type: 'pronounce', word: word?.trim() } })),
    'save word *': (word: string) => window.dispatchEvent(new CustomEvent('voice:vocab', { detail: { type: 'save', word: word?.trim() } })),
  },
};

// Helper used by voice commands to navigate the reader
function navigate(dir: 'next' | 'prev') {
  const id = dir === 'next' ? 'reader-next' : 'reader-prev';
  const btn = document.getElementById(id) as HTMLButtonElement | null;
  if (btn) {
    btn.click();
  } else {
    window.dispatchEvent(new CustomEvent('reader:navigate', { detail: { direction: dir } }));
  }
}


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