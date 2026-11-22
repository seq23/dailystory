import type { DifficultyLevel } from "@/types";
import { BACKEND_DIFFICULTIES } from "@/lib/grades";
// Enhanced Audio Configuration
// Central configuration for all audio features and settings

export interface AudioSettings {
  // Speed settings based on difficulty level
  speedByDifficulty: {
    beginner: number;  // Level 0
    easy: number;      // Level 1
    medium: number;    // Level 2  
    hard: number;      // Level 3
    expert: number;    // Level 4
  };
  
  // Word highlighting settings
  highlighting: {
    enabledForLevels: (DifficultyLevel)[];
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
    beginner: 0.65, // Slow & clear for Level 0 - Pre-Reader (ESL-friendly)
    easy: 0.7,      // Slow for Level 1 - Beginning Reader (ESL-friendly)
    medium: 0.75,   // Gentle for Level 2 - Developing Reader
    hard: 0.9,      // Near-normal for Level 3 - Independent Reader
    expert: 1.0,    // Fixed speed for Level 4 - Advanced Reader
  },
  
  highlighting: {
    enabledForLevels: [...BACKEND_DIFFICULTIES], // All levels get highlighting
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
      free: 2000,
      premium: 2000,
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