// Enhanced Security Utilities for Children's Story App
import { APP_CONFIG } from "@/constants/app";

export type SecurityLevel = 'Level0' | 'Level1' | 'Level2' | 'Level3' | 'Level4' | 'Grade6' | 'Grade7' | 'Grade8' | 'Grade9' | 'Grade10';

// Content filtering and sanitization
export class ContentSecurity {
  // Nuclear Blacklist - Most extreme words always blocked regardless of level
  private static readonly NUCLEAR_BLACKLIST = [
    // Extreme racial slurs and hate speech
    'nigger', 'spic', 'chink', 'kike', 'wetback', 'towelhead', 'raghead',
    // Extreme sexual content
    'fuck', 'fucking', 'motherfucker', 'gangbang', 'gangbanging', 'rape', 'molest',
    // Extreme violence/weapons
    'ar-15', 'ak-47', 'machine gun', 'bomb', 'explosive', 'terrorism', 'terrorist',
    // Extreme drugs
    'heroin', 'cocaine', 'meth', 'fentanyl',
    // Self-harm extreme
    'suicide', 'kill yourself', 'self-harm', 'cutting'
  ];
  // Multilingual inappropriate words database
  private static multilingualInappropriateWords = {
    // English
    en: [
      'damn', 'hell', 'crap', 'piss', 'ass', 'bitch', 'bastard', 'shit', 'fuck', 'fucking',
      'motherfucker', 'asshole', 'dickhead', 'prick', 'cock', 'pussy', 'whore', 'slut', 'hoe', 'hoes',
      'retard', 'gay', 'homo', 'fag', 'nigger', 'spic', 'chink', 'kike', 'dick',
      'sex', 'sexual', 'porn', 'naked', 'nude', 'boobs', 'penis', 'vagina', 'orgasm',
      'masturbate', 'horny', 'sexy', 'erotic', 'prostitute', 'rape', 'molest',
      'drunk', 'weed', 'marijuana', 'cocaine', 'heroin', 'meth', 'drugs', 'smoking',
      'cigarette', 'alcohol', 'beer', 'vodka', 'whiskey',
      'suicide', 'depression', 'cutting', 'self-harm', 'anorexia', 'bulimia',
      'shoot', 'shooting', 'shot', 'kill', 'killing', 'killed', 'killer', 'gun', 'guns', 'gunshot',
      'stab', 'stabbing', 'stabbed', 'stabs',
      // Additional anatomical and sexual terms
      'asscrack', 'butt', 'butthole', 'booty', 'bootyhole', 'tits', 'titties', 'cum', 'nutsack', 
      'dickcheese', 'clit', 'clitoris', 'hymen', 'menstruation', 'gangbang', 'gangbanging'
    ],

    // Spanish
    es: [
      'puta', 'hijo de puta', 'mierda', 'joder', 'coño', 'cabrón', 'pendejo', 'maricón',
      'puto', 'culo', 'verga', 'chingar', 'pinche', 'mamón', 'culero', 'ojete',
      'sexo', 'sexual', 'porno', 'desnudo', 'senos', 'pene', 'vagina', 'orgasmo',
      'masturbarse', 'caliente', 'erótico', 'prostituta', 'violar', 'drogas',
      'marihuana', 'cocaína', 'heroína', 'alcohol', 'cerveza', 'vodka',
      'suicidio', 'depresión', 'cortarse', 'anorexia', 'bulimia',
      'matar', 'matando', 'asesino', 'pistola', 'arma', 'disparar', 'apuñalar'
    ],

    // Arabic (transliterated common inappropriate words)
    ar: [
      'شرموطة', 'عاهرة', 'زانية', 'كلب', 'حقير', 'لعين', 'ملعون', 'نذل',
      'جنس', 'جنسي', 'إباحي', 'عاري', 'قضيب', 'مهبل', 'ثدي',
      'مخدرات', 'حشيش', 'كوكايين', 'هيروين', 'كحول', 'خمر',
      'انتحار', 'اكتئاب', 'إيذاء الذات', 'فقدان الشهية',
      'قتل', 'قاتل', 'مسدس', 'سلاح', 'يطلق النار', 'يطعن'
    ],

    // Chinese (Simplified)
    zh: [
      '妓女', '婊子', '操', '他妈的', '狗屎', '混蛋', '王八蛋', '傻逼',
      '性', '性行为', '色情', '裸体', '胸部', '阴茎', '阴道', '性高潮',
      '手淫', '性感', '色情的', '强奸', '猥亵',
      '毒品', '大麻', '可卡因', '海洛因', '甲基苯丙胺', '酒精', '啤酒',
      '自杀', '抑郁症', '自残', '厌食症', '贪食症',
      '杀', '杀死', '杀手', '枪', '射击', '刺'
    ],

    // Hindi (Devanagari script)
    hi: [
      'रंडी', 'वेश्या', 'कुत्ता', 'साला', 'हरामी', 'मादरचोद', 'भोसड़ी के',
      'सेक्स', 'यौन', 'अश्लील', 'नग्न', 'स्तन', 'लिंग', 'योनि',
      'हस्तमैथुन', 'कामुक', 'बलात्कार',
      'ड्रग्स', 'गांजा', 'कोकीन', 'हेरोइन', 'शराब', 'बीयर',
      'आत्महत्या', 'अवसाद', 'आत्म-नुकसान', 'एनोरेक्सिया',
      'मारना', 'हत्या', 'हत्यारा', 'बंदूक', 'गोली', 'छुरा'
    ],

    // Portuguese
    pt: [
      'puta', 'filho da puta', 'merda', 'foder', 'caralho', 'cu', 'buceta', 'porra',
      'viado', 'bicha', 'gay', 'veado', 'piranha', 'cadela',
      'sexo', 'sexual', 'pornô', 'nu', 'seios', 'pênis', 'vagina', 'orgasmo',
      'masturbar', 'tesão', 'erótico', 'prostituta', 'estuprar',
      'drogas', 'maconha', 'cocaína', 'heroína', 'álcool', 'cerveja',
      'suicídio', 'depressão', 'auto-mutilação', 'anorexia', 'bulimia',
      'matar', 'matando', 'assassino', 'pistola', 'arma', 'atirar', 'esfaquear'
    ],

    // French
    fr: [
      'putain', 'salope', 'connard', 'connasse', 'merde', 'bordel', 'con', 'bite',
      'couille', 'chatte', 'foutre', 'enculé', 'bâtard', 'fils de pute',
      'sexe', 'sexuel', 'porno', 'nu', 'seins', 'pénis', 'vagin', 'orgasme',
      'masturber', 'excité', 'érotique', 'prostituée', 'violer',
      'drogues', 'marijuana', 'cocaïne', 'héroïne', 'alcool', 'bière',
      'suicide', 'dépression', 'automutilation', 'anorexie', 'boulimie',
      'tuer', 'tuant', 'assassin', 'pistolet', 'arme', 'tirer', 'poignarder'
    ]
  };

  // Combined list for backwards compatibility
  private static strictlyInappropriateWords = [
    ...ContentSecurity.multilingualInappropriateWords.en
  ];

  // Words inappropriate only for youngest children (PreK-2nd grade) but OK for 3rd grade and up
  private static youngerChildrenRestrictedWords = [
    'scary', 'frightening', 'violent', 'dark', 'death', 'weapon', 'sword', 'fight',
    'monster', 'ghost', 'zombie', 'vampire', 'witch', 'evil', 'mean', 'bad', 'hurt', 'pain',
    'blood', 'angry', 'mad', 'hate', 'stupid', 'dumb', 'ugly', 'fat', 'skinny'
  ];

  // Violence words allowed for Hard/Expert/Grade6+ levels
  private static violenceWordsForOlderKids = [
    'kill', 'killing', 'killed', 'killer', 'murder', 'die', 'dead', 'death',
    'blood', 'knife', 'stab', 'stabbing', 'stabbed', 'gun', 'guns', 'shoot', 
    'shooting', 'shot', 'fight', 'fighting', 'war', 'battle', 'sword'
  ];

  // Character substitution patterns (e.g., "v1ol3nt" → "violent")
  private static substitutionPatterns = [
    { pattern: /[0o]/gi, replacement: 'o' },
    { pattern: /[1l!]/gi, replacement: 'l' },
    { pattern: /[3e]/gi, replacement: 'e' },
    { pattern: /[4a@]/gi, replacement: 'a' },
    { pattern: /[5s\$]/gi, replacement: 's' },
    { pattern: /[7t]/gi, replacement: 't' },
    { pattern: /[8b]/gi, replacement: 'b' },
    { pattern: /[9g]/gi, replacement: 'g' },
    // Enhanced leetspeak patterns
    { pattern: /[*]/gi, replacement: '' },
    { pattern: /[+]/gi, replacement: 't' },
    { pattern: /[6]/gi, replacement: 'g' },
    { pattern: /[2]/gi, replacement: 'z' }
  ];

  // Semantic pattern detection for inappropriate phrase combinations
  private static semanticPatterns = [
    // Sexual activity + objectification patterns
    { pattern: /\b(banging|fucking|screwing|doing|getting|having)\s+(girls?|chicks?|women|ladies|boys?|guys?|men)\b/gi, 
      reason: 'Inappropriate sexual content detected' },
    { pattern: /\b(hot|sexy|fine|thick)\s+(chicks?|girls?|women|ladies|boys?|guys?|men)\b/gi, 
      reason: 'Objectifying language detected' },
    { pattern: /\b(gang\s*bang|group\s*sex|orgy|threesome|foursome)\b/gi, 
      reason: 'Explicit sexual content detected' },
    { pattern: /\b(hookup|hook\s*up|one\s*night\s*stand|booty\s*call|friends\s*with\s*benefits)\b/gi, 
      reason: 'Inappropriate sexual content detected' },
    { pattern: /\b(strip|stripping|naked|nude)\s+(girls?|boys?|women|men|people)\b/gi, 
      reason: 'Inappropriate sexual content detected' },
    // Anatomical references in inappropriate contexts
    { pattern: /\b(big|huge|small|tiny)\s+(tits|boobs|ass|butt|dick|cock|penis)\b/gi, 
      reason: 'Inappropriate anatomical references' },
    { pattern: /\b(touch|grab|squeeze|feel|lick|suck)\s+(tits|boobs|ass|butt|dick|cock|penis|vagina|pussy)\b/gi, 
      reason: 'Inappropriate sexual content detected' }
  ];

  // Rate limiting storage
  private static submissionCounts = new Map<string, { count: number; timestamp: number }>();

  /**
   * Get level-based word list for filtering
   */
  static getLevelBasedWordList(level: SecurityLevel): string[] {
    // Always include nuclear blacklist
    let filteredWords = [...this.NUCLEAR_BLACKLIST];

    // For Level0-2 (PreK-2nd): Use full inappropriate words + younger children restricted
    if (['Level0', 'Level1', 'Level2'].includes(level)) {
      filteredWords.push(...this.multilingualInappropriateWords.en);
      filteredWords.push(...this.youngerChildrenRestrictedWords);
    }
    // For Level3-4 (3rd-5th): Use inappropriate words but exclude mild violence words
    else if (['Level3', 'Level4'].includes(level)) {
      const inappropriateWords = this.multilingualInappropriateWords.en.filter(word => 
        !this.violenceWordsForOlderKids.includes(word)
      );
      filteredWords.push(...inappropriateWords);
    }
    // For Grade6-10: Only nuclear blacklist (violence words allowed)
    // Grade6+ levels already have minimal filtering

    return [...new Set(filteredWords)]; // Remove duplicates
  }

  /**
   * Level-based content appropriateness check
   */
  static isContentAppropriateForLevel(text: string, level: SecurityLevel, userLanguage?: string): { appropriate: boolean; reason?: string } {
    if (!text || typeof text !== 'string') {
      return { appropriate: false, reason: 'Invalid input' };
    }

    // Performance optimization: cache results for repeated content
    const contentHash = `${text.substring(0, 100)}_${level}_${userLanguage}`;
    if (this._validationCache?.has(contentHash)) {
      return this._validationCache.get(contentHash);
    }

    // Get level-appropriate filtering list
    const filteredWords = this.getLevelBasedWordList(level);
    
    // Normalize text
    let normalizedText = text.toLowerCase().trim();
    const isLatinScript = /^[a-zA-Z\s\u00C0-\u017F\u1E00-\u1EFF0-9.,!?;:'"()\-]*$/.test(text);
    
    if (isLatinScript) {
      this.substitutionPatterns.forEach(({ pattern, replacement }) => {
        normalizedText = normalizedText.replace(pattern, replacement);
      });
      normalizedText = normalizedText.replace(/[^a-z\s]/g, '');
    }

    // Check semantic patterns for inappropriate phrase combinations (Latin script only)
    if (isLatinScript) {
      for (const semanticPattern of this.semanticPatterns) {
        try {
          if (semanticPattern.pattern.test(text) || semanticPattern.pattern.test(normalizedText)) {
            return { appropriate: false, reason: semanticPattern.reason };
          }
        } catch (regexError) {
          console.warn(`Regex error checking semantic pattern:`, regexError);
        }
      }
    }

    // Check filtered words
    for (const word of filteredWords) {
      try {
        const isWordInLatinScript = /^[a-zA-Z\s\u00C0-\u017F\u1E00-\u1EFF]*$/.test(word);
        
        let isFound = false;
        if (isWordInLatinScript) {
          const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const wordPattern = new RegExp(`\\b${escapedWord}\\b`, 'i');
          isFound = wordPattern.test(normalizedText);
        } else {
          const lowerWord = word.toLowerCase();
          const lowerText = text.toLowerCase();
          isFound = lowerText.includes(lowerWord) || normalizedText.includes(lowerWord);
        }
        
        if (isFound) {
          return { appropriate: false, reason: `Content not appropriate for ${level}` };
        }
      } catch (regexError) {
        console.warn(`Regex error checking word "${word}":`, regexError);
        if (text.toLowerCase().includes(word.toLowerCase())) {
          return { appropriate: false, reason: `Content not appropriate for ${level}` };
        }
      }
    }

    // Skip multilingual check if content is English-only (major performance optimization)
    const isEnglishContent = isLatinScript && userLanguage === 'en';
    
    if (!isEnglishContent && userLanguage && userLanguage !== 'en' && this.multilingualInappropriateWords[userLanguage as keyof typeof this.multilingualInappropriateWords]) {
      const languageWords = this.multilingualInappropriateWords[userLanguage as keyof typeof this.multilingualInappropriateWords] || [];
      
      for (const word of languageWords) {
        const lowerWord = word.toLowerCase();
        const lowerText = text.toLowerCase();
        if (lowerText.includes(lowerWord) || normalizedText.includes(lowerWord)) {
          return { appropriate: false, reason: `Inappropriate content detected in ${userLanguage.toUpperCase()}` };
        }
      }
    }

    // Check for repeated characters (potential obfuscation) - only for Latin scripts
    if (isLatinScript && /(.)\1{4,}/.test(normalizedText)) {
      return { appropriate: false, reason: 'Suspicious character repetition detected' };
    }

    const result = { appropriate: true };
    
    // Cache the result for performance
    if (!this._validationCache) {
      this._validationCache = new Map();
    }
    this._validationCache.set(contentHash, result);
    
    // Limit cache size to prevent memory leaks
    if (this._validationCache.size > 1000) {
      const firstKey = this._validationCache.keys().next().value;
      this._validationCache.delete(firstKey);
    }
    
    return result;
  }

  // Validation result cache for performance
  private static _validationCache: Map<string, { appropriate: boolean; reason?: string }> | null = null;

  /**
   * Enhanced content filtering with age-appropriate validation and multilingual support
   * @deprecated Use isContentAppropriateForLevel instead
   */
  static isContentAppropriate(text: string, grade?: string, userLanguage?: string): { appropriate: boolean; reason?: string } {
    if (!text || typeof text !== 'string') {
      return { appropriate: false, reason: 'Invalid input' };
    }

    // Normalize the text by removing special characters and applying substitution patterns
    let normalizedText = text.toLowerCase().trim();
    
    // Determine if the text is primarily Latin script before normalization
    const isLatinScript = /^[a-zA-Z\s\u00C0-\u017F\u1E00-\u1EFF0-9.,!?;:'"()\-]*$/.test(text);
    
    // Apply character substitution patterns (only for Latin characters)
    if (isLatinScript) {
      this.substitutionPatterns.forEach(({ pattern, replacement }) => {
        normalizedText = normalizedText.replace(pattern, replacement);
      });
      // Remove non-alphabetic characters except spaces for Latin scripts
      normalizedText = normalizedText.replace(/[^a-z\s]/g, '');
    }

    // Determine if user is in youngest grades (PreK-2nd grade only)
    const isYoungestChild = !grade || ['PreK', 'K', '1st', '2nd'].includes(grade);

    // Get appropriate word lists based on user's language
    const languagesToCheck = ['en']; // Always check English
    if (userLanguage && userLanguage !== 'en' && this.multilingualInappropriateWords[userLanguage as keyof typeof this.multilingualInappropriateWords]) {
      languagesToCheck.push(userLanguage);
    }

    // Check semantic patterns for inappropriate phrase combinations (Latin script only)
    if (isLatinScript) {
      for (const semanticPattern of this.semanticPatterns) {
        try {
          if (semanticPattern.pattern.test(text)) {
            return { appropriate: false, reason: semanticPattern.reason };
          }
          // Also check normalized text for obfuscated versions
          if (semanticPattern.pattern.test(normalizedText)) {
            return { appropriate: false, reason: semanticPattern.reason };
          }
        } catch (regexError) {
          console.warn(`Regex error checking semantic pattern:`, regexError);
          // Continue with other checks
        }
      }
    }

    // Check inappropriate words in all relevant languages
    for (const lang of languagesToCheck) {
      const inappropriateWords = this.multilingualInappropriateWords[lang as keyof typeof this.multilingualInappropriateWords] || [];
      
      for (const word of inappropriateWords) {
        try {
          // For non-Latin scripts, check for exact matches or substrings
          // For Latin scripts, use word boundaries
          const isWordInLatinScript = /^[a-zA-Z\s\u00C0-\u017F\u1E00-\u1EFF]*$/.test(word);
          
          let isFound = false;
          if (isWordInLatinScript) {
            // Use word boundaries for Latin script words
            const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const wordPattern = new RegExp(`\\b${escapedWord}\\b`, 'i');
            isFound = wordPattern.test(normalizedText);
          } else {
            // For non-Latin scripts, check both original and normalized text
            const lowerWord = word.toLowerCase();
            const lowerText = text.toLowerCase();
            isFound = lowerText.includes(lowerWord) || normalizedText.includes(lowerWord);
          }
          
          if (isFound) {
            return { appropriate: false, reason: `Inappropriate content detected in ${lang.toUpperCase()}` };
          }
        } catch (regexError) {
          // Handle regex errors gracefully - treat as potential threat
          console.warn(`Regex error checking word "${word}":`, regexError);
          if (text.toLowerCase().includes(word.toLowerCase())) {
            return { appropriate: false, reason: `Inappropriate content detected in ${lang.toUpperCase()}` };
          }
        }
      }
    }

    // Check age-restricted words only for youngest children (PreK-2nd grade) - English only for now
    if (isYoungestChild && isLatinScript) {
      for (const word of this.youngerChildrenRestrictedWords) {
        try {
          const wordPattern = new RegExp(`\\b${word}\\b`, 'i');
          if (wordPattern.test(normalizedText)) {
            return { appropriate: false, reason: `Content not appropriate for youngest children: ${word}` };
          }
        } catch (regexError) {
          console.warn(`Regex error checking age-restricted word "${word}":`, regexError);
          if (normalizedText.includes(word.toLowerCase())) {
            return { appropriate: false, reason: `Content not appropriate for youngest children: ${word}` };
          }
        }
      }
    }

    // Check for repeated characters (potential obfuscation) - only for Latin scripts
    if (isLatinScript && /(.)\1{4,}/.test(normalizedText)) {
      return { appropriate: false, reason: 'Suspicious character repetition detected' };
    }

    return { appropriate: true };
  }

  /**
   * HTML sanitization for user inputs
   */
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim()
      .slice(0, 500); // Limit input length
  }

  /**
   * Rate limiting for form submissions
   */
  static checkRateLimit(
    identifier: string, 
    maxSubmissions: number = APP_CONFIG.MAX_SUBMISSIONS_PER_MINUTE, 
    windowMs: number = APP_CONFIG.RATE_LIMIT_WINDOW
  ): boolean {
    const now = Date.now();
    const userSubmissions = this.submissionCounts.get(identifier);

    if (!userSubmissions) {
      this.submissionCounts.set(identifier, { count: 1, timestamp: now });
      return true;
    }

    // Reset counter if window has passed
    if (now - userSubmissions.timestamp > windowMs) {
      this.submissionCounts.set(identifier, { count: 1, timestamp: now });
      return true;
    }

    // Check if under limit
    if (userSubmissions.count < maxSubmissions) {
      userSubmissions.count++;
      return true;
    }

    return false;
  }

  /**
   * Prompt injection protection for story generation
   */
  static sanitizePrompt(prompt: string): string {
    if (!prompt || typeof prompt !== 'string') return '';

    // Remove potential prompt injection patterns
    const dangerousPatterns = [
      /ignore\s+previous\s+instructions/gi,
      /forget\s+everything/gi,
      /you\s+are\s+now/gi,
      /system\s*:/gi,
      /human\s*:/gi,
      /assistant\s*:/gi,
      /<\|.*\|>/gi, // Special tokens
      /\[INST\].*?\[\/INST\]/gi, // Instruction tokens
    ];

    let sanitized = prompt;
    dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    return this.sanitizeInput(sanitized);
  }

  /**
   * Validate story content for appropriateness
   */
  static validateStoryContent(story: string[], grade?: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    for (let i = 0; i < story.length; i++) {
      const paragraph = story[i];
      const validation = this.isContentAppropriate(paragraph, grade, undefined);
      
      if (!validation.appropriate) {
        issues.push(`Paragraph ${i + 1}: ${validation.reason}`);
      }
    }

    return { valid: issues.length === 0, issues };
  }
}

// Security logging utility
export class SecurityLogger {
  private static logs: Array<{ timestamp: number; event: string; details: any }> = [];

  static log(event: string, details: any = {}) {
    this.logs.push({
      timestamp: Date.now(),
      event,
      details: {
        ...details,
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Security] ${event}:`, details);
    }

    // Keep only last 100 logs to prevent memory issues
    if (this.logs.length > 100) {
      this.logs.shift();
    }
  }

  static getLogs() {
    return [...this.logs];
  }

  static exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Error boundary utility for security-related errors
export const handleSecurityError = (error: Error, context: string) => {
  SecurityLogger.log('security_error', {
    error: error.message,
    stack: error.stack,
    context
  });

  // Return user-friendly error message
  return 'We detected an issue with your input. Please try again with different content.';
};
