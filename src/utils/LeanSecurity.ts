/**
 * LEAN SECURITY CLASS - Replaces 500+ line security.ts with 50 lines
 * Nuclear blacklist only - let AI prompts handle age-appropriateness
 */

// 50 essential blocked words - nuclear blacklist only
const NUCLEAR_BLACKLIST = [
  // Extreme profanity
  'fuck', 'fucking', 'motherfucker', 'shit', 'bitch', 'asshole', 'bastard',
  // Extreme racial/hate speech
  'nigger', 'spic', 'chink', 'kike', 'wetback', 'towelhead', 'raghead',
  // Extreme sexual content
  'gangbang', 'rape', 'molest', 'prostitute', 'whore', 'slut',
  // Extreme violence/weapons
  'ar-15', 'ak-47', 'machine gun', 'bomb', 'explosive', 'terrorism', 'terrorist',
  // Extreme drugs
  'heroin', 'cocaine', 'meth', 'fentanyl', 'overdose',
  // Self-harm
  'suicide', 'kill yourself', 'self-harm', 'cutting',
  // Anatomy (inappropriate context)
  'penis', 'vagina', 'cock', 'pussy', 'dick', 'tits', 'boobs', 'ass',
  // Additional extreme
  'porn', 'pornography', 'masturbate', 'orgasm', 'naked', 'nude', 'sex'
];

export class LeanSecurity {
  // Simple blocked word check
  static isContentClean(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    
    const normalized = text.toLowerCase().trim();
    return !NUCLEAR_BLACKLIST.some(word => normalized.includes(word));
  }

  // Basic input sanitization
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim()
      .slice(0, 500);
  }

  // Simple rate limiting (localStorage-based)
  static checkRateLimit(key: string, maxAttempts = 10, windowMs = 60000): boolean {
    try {
      const now = Date.now();
      const stored = localStorage.getItem(`rate_${key}`);
      const data = stored ? JSON.parse(stored) : { count: 0, resetTime: now + windowMs };
      
      if (now > data.resetTime) {
        data.count = 1;
        data.resetTime = now + windowMs;
      } else {
        data.count++;
      }
      
      localStorage.setItem(`rate_${key}`, JSON.stringify(data));
      return data.count <= maxAttempts;
    } catch {
      return true; // Allow on error
    }
  }
}