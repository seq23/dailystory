// Application-wide constants
export const APP_CONFIG = {
  // Session timing
  FREE_SESSION_DURATION: 20 * 60, // 20 minutes in seconds
  COUNTDOWN_DURATION: 5, // 5 seconds
  
  // Story configuration
  DEFAULT_PAGE_COUNT: 10,
  MIN_PAGES: 5,
  MAX_PAGES: 20,
  
  // UI timing
  ALERT_DURATION: 3000, // 3 seconds
  TUTORIAL_STEP_DURATION: 3000, // 3 seconds
  CAROUSEL_AUTO_ADVANCE: 4000, // 4 seconds
  
  // Audio settings
  DEFAULT_AUDIO_SPEED: 0.75,
  MIN_AUDIO_SPEED: 0.5,
  MAX_AUDIO_SPEED: 2.0,
  
  // Progress tracking
  WORDS_PER_MINUTE_TARGET: 100,
  STREAK_ACHIEVEMENT_DAYS: 7,
  VOCABULARY_ACHIEVEMENT_WORDS: 50,
  
  // Rate limiting
  MAX_SUBMISSIONS_PER_MINUTE: 5,
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  
  // Storage keys
  PROGRESS_STORAGE_KEY: 'time2read_progress',
  SETTINGS_STORAGE_KEY: 'time2read_settings',
  
  // API endpoints
  RUNWARE_API_KEY: 'LRRGqlrg67zH8uss6lMjVvc54pVOrznM',
} as const;

export const SUPPORTED_LANGUAGES = [
  'en', 'ar', 'es', 'zh', 'hi', 'pt', 'fr'
] as const;

export const GRADE_LEVELS = [
  'PreK', 'K', '1st', '2nd', '3rd', '4th', '5th', '6th+'
] as const;

export const DIFFICULTY_LEVELS = [
  'easy', 'medium', 'hard', 'expert'
] as const;