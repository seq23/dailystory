// ProductionLogger adapter -> forwards to DebugLogger (lean, non-breaking)
// Restores all legacy ProductionLogging.* calls without touching other files

import { DebugLogger } from '@/services/DebugLogger';

type DebugLevel = 'log' | 'warn' | 'error';

type DebugCategory =
  | 'auth'
  | 'story'
  | 'audio'
  | 'image'
  | 'ui'
  | 'performance'
  | 'network'
  | 'error';

function normalizeCategory(input: any): DebugCategory {
  const str = String(input || 'ui').toLowerCase();
  const map: Record<string, DebugCategory> = {
    // common variants
    audio: 'audio',
    sound: 'audio',
    tts: 'audio',

    story: 'story',
    narrative: 'story',

    image: 'image',
    images: 'image',
    img: 'image',

    auth: 'auth',
    login: 'auth',

    ui: 'ui',
    ux: 'ui',

    perf: 'performance',
    performance: 'performance',

    net: 'network',
    network: 'network',

    err: 'error',
    error: 'error',
  };

  // handle known uppercase categories used previously
  if (map[str]) return map[str];
  
  // Improved mapping for legacy categories
  switch (str) {
    case 'audio':
      return 'audio';
    case 'story_cache':
    case 'character':
    case 'lexicon':
      return 'story';
    case 'phonetic':
      return 'audio';
    case 'cache':
      return 'performance';
    case 'service':
    case 'avatar':
      return 'ui';
    default:
      return 'ui' as DebugCategory;
  }
}

function forward(level: DebugLevel, args: any[]) {
  // Legacy signature examples observed:
  // ProductionLogging.debug(category, message, tag?, data?)
  // Some calls pass template strings and extra details
  const [category, message, ...rest] = args;
  const cat = normalizeCategory(category);

  // Build a structured data object preserving all extra args
  let data: any = undefined;
  if (rest.length === 1) {
    data = rest[0];
  } else if (rest.length > 1) {
    data = { args: rest };
  }

  const msg = typeof message === 'string' ? message : String(message ?? '');

  try {
    if (level === 'error') {
      DebugLogger.error(cat, msg, data);
    } else if (level === 'warn') {
      DebugLogger.warn(cat, msg, data);
    } else {
      DebugLogger.log(cat, msg, data);
    }
  } catch {
    // Never throw from logger
  }
}

export const ProductionLogging = {
  error: (...args: any[]) => forward('error', args),
  warn: (...args: any[]) => forward('warn', args),
  info: (...args: any[]) => forward('log', args),
  debug: (...args: any[]) => forward('log', args),
  log: (...args: any[]) => forward('log', args),
};

// Legacy export for compatibility
export const ProductionLogger = ProductionLogging;