/**
 * Context-aware pronunciation helper for TTS
 * Handles homographs and context-dependent pronunciation
 */

interface PronunciationRule {
  word: string;
  contexts: {
    pattern: RegExp;
    pronunciation: string;
    ssml?: string;
  }[];
  defaultPronunciation: string;
}

// Common homographs that need context-aware pronunciation
const pronunciationRules: PronunciationRule[] = [
  {
    word: "skies",
    contexts: [
      {
        pattern: /\b(sky|cloud|blue|gray|grey|green|clear|stormy|weather|above|overhead)\b.*skies|\bskies.*\b(sky|cloud|blue|gray|grey|green|clear|stormy|weather|above|overhead)\b/i,
        pronunciation: "skahyz", // plural of sky
        ssml: `<phoneme alphabet="ipa" ph="skaɪz">skies</phoneme>`
      }
    ],
    defaultPronunciation: "skahyz"
  },
  {
    word: "read",
    contexts: [
      {
        pattern: /\b(will|going to|want to|can|should|must|need to|plan to)\b.*read|\bread.*\b(tomorrow|later|soon|next|future)\b/i,
        pronunciation: "reed", // future tense
        ssml: `<phoneme alphabet="ipa" ph="riːd">read</phoneme>`
      },
      {
        pattern: /\b(yesterday|last|already|have|had|was|were|did)\b.*read|\bread.*\b(yesterday|ago|before|earlier)\b/i,
        pronunciation: "red", // past tense
        ssml: `<phoneme alphabet="ipa" ph="rɛd">read</phoneme>`
      }
    ],
    defaultPronunciation: "reed"
  },
  {
    word: "lead",
    contexts: [
      {
        pattern: /\b(metal|pipe|pencil|heavy|toxic|paint)\b.*lead|\blead.*\b(metal|pipe|pencil|heavy|toxic|paint)\b/i,
        pronunciation: "led", // metal
        ssml: `<phoneme alphabet="ipa" ph="lɛd">lead</phoneme>`
      },
      {
        pattern: /\b(will|can|should|must|going to)\b.*lead|\blead.*\b(team|group|way|charge|forward)\b/i,
        pronunciation: "leed", // to guide
        ssml: `<phoneme alphabet="ipa" ph="liːd">lead</phoneme>`
      }
    ],
    defaultPronunciation: "leed"
  },
  {
    word: "bow",
    contexts: [
      {
        pattern: /\b(arrow|shoot|archery|weapon)\b.*bow|\bbow.*\b(arrow|shoot|archery|weapon)\b/i,
        pronunciation: "boh", // weapon
        ssml: `<phoneme alphabet="ipa" ph="boʊ">bow</phoneme>`
      },
      {
        pattern: /\b(polite|greeting|respect|head)\b.*bow|\bbow.*\b(polite|greeting|respect|head|down)\b/i,
        pronunciation: "baow", // bend
        ssml: `<phoneme alphabet="ipa" ph="baʊ">bow</phoneme>`
      }
    ],
    defaultPronunciation: "boh"
  },
  {
    word: "close",
    contexts: [
      {
        pattern: /\b(shut|door|window|eyes|mouth)\b.*close|\bclose.*\b(shut|door|window|eyes|mouth|it|them)\b/i,
        pronunciation: "klohz", // verb - to shut
        ssml: `<phoneme alphabet="ipa" ph="kloʊz">close</phoneme>`
      },
      {
        pattern: /\b(very|so|too|quite|really)\b.*close|\bclose.*\b(together|by|near|friend|call)\b/i,
        pronunciation: "klohs", // adjective - near
        ssml: `<phoneme alphabet="ipa" ph="kloʊs">close</phoneme>`
      }
    ],
    defaultPronunciation: "klohz"
  },
  {
    word: "tear",
    contexts: [
      {
        pattern: /\b(cry|sad|eye|drop|wipe)\b.*tear|\btear.*\b(drop|cry|sad|eye|wipe|away)\b/i,
        pronunciation: "teer", // from crying
        ssml: `<phoneme alphabet="ipa" ph="tɪr">tear</phoneme>`
      },
      {
        pattern: /\b(rip|paper|cloth|apart)\b.*tear|\btear.*\b(rip|paper|cloth|apart|up|down)\b/i,
        pronunciation: "tair", // to rip
        ssml: `<phoneme alphabet="ipa" ph="tɛr">tear</phoneme>`
      }
    ],
    defaultPronunciation: "teer"
  },
  {
    word: "live",
    contexts: [
      {
        pattern: /\b(will|going to|want to|hope to|plan to)\b.*live|\blive.*\b(here|there|in|at|with|forever|long|happy)\b/i,
        pronunciation: "liv", // verb - to exist
        ssml: `<phoneme alphabet="ipa" ph="lɪv">live</phoneme>`
      },
      {
        pattern: /\b(broadcast|show|concert|performance|real time)\b.*live|\blive.*\b(broadcast|show|concert|performance|streaming)\b/i,
        pronunciation: "lahyv", // adjective - happening now
        ssml: `<phoneme alphabet="ipa" ph="laɪv">live</phoneme>`
      }
    ],
    defaultPronunciation: "liv"
  }
];

/**
 * Improves text for better TTS pronunciation by analyzing context
 */
export function preprocessTextForTTS(text: string): string {
  let processedText = text;

  // Process each pronunciation rule
  for (const rule of pronunciationRules) {
    const wordRegex = new RegExp(`\\b${rule.word}\\b`, 'gi');
    
    // Find all instances of the word
    const matches = [...processedText.matchAll(wordRegex)];
    
    for (const match of matches.reverse()) { // Process in reverse to maintain indices
      const matchIndex = match.index!;
      const matchedWord = match[0];
      
      // Get surrounding context (50 chars before and after)
      const contextStart = Math.max(0, matchIndex - 50);
      const contextEnd = Math.min(processedText.length, matchIndex + matchedWord.length + 50);
      const context = processedText.slice(contextStart, contextEnd);
      
      // Find the best pronunciation based on context
      let replacement = matchedWord;
      for (const contextRule of rule.contexts) {
        if (contextRule.pattern.test(context)) {
          // For ElevenLabs, we'll use phonetic respelling instead of SSML
          replacement = contextRule.pronunciation;
          break;
        }
      }
      
      // If no context match, use default
      if (replacement === matchedWord) {
        replacement = rule.defaultPronunciation;
      }
      
      // Replace the word with phonetic spelling
      processedText = 
        processedText.slice(0, matchIndex) + 
        replacement + 
        processedText.slice(matchIndex + matchedWord.length);
    }
  }

  return processedText;
}

/**
 * Enhanced text cleaning for TTS with context awareness
 */
export function cleanTextForSpeech(text: string): string {
  // First apply contextual pronunciation improvements
  let cleanedText = preprocessTextForTTS(text);
  
  // Remove/replace problematic characters and abbreviations
  cleanedText = cleanedText
    // Replace common abbreviations with full words
    .replace(/\bDr\./g, 'Doctor')
    .replace(/\bMr\./g, 'Mister')
    .replace(/\bMrs\./g, 'Missus')
    .replace(/\bMs\./g, 'Miss')
    .replace(/\bSt\./g, 'Saint')
    .replace(/\bAve\./g, 'Avenue')
    .replace(/\bRd\./g, 'Road')
    .replace(/\bBlvd\./g, 'Boulevard')
    .replace(/\b&\b/g, 'and')
    .replace(/\b@\b/g, 'at')
    .replace(/\b#\b/g, 'number')
    .replace(/\b%\b/g, 'percent')
    .replace(/\b\$(\d+)/g, '$1 dollars')
    
    // Handle numbers better
    .replace(/\b(\d+)st\b/g, '$1-th') // 1st -> 1-th (let TTS handle ordinals)
    .replace(/\b(\d+)nd\b/g, '$1-th') // 2nd -> 2-th
    .replace(/\b(\d+)rd\b/g, '$1-th') // 3rd -> 3-th
    .replace(/\b(\d+)th\b/g, '$1-th') // 4th -> 4-th
    
    // Add pauses for better pacing
    .replace(/([.!?])\s+/g, '$1 ') // Ensure single space after sentence endings
    .replace(/([,;:])\s*/g, '$1 ') // Ensure space after commas and semicolons
    
    // Remove excessive punctuation that might confuse TTS
    .replace(/["""'']/g, '') // Remove smart quotes
    .replace(/\.\.\./g, '. ') // Replace ellipsis with period and space
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  return cleanedText;
}

/**
 * Specialized cleaning for children's content
 */
export function cleanChildrensTextForSpeech(text: string): string {
  let cleanedText = cleanTextForSpeech(text);
  
  // Additional child-friendly text processing
  cleanedText = cleanedText
    // Replace complex punctuation with simpler alternatives
    .replace(/[—–]/g, ' - ') // Replace em/en dashes with simple dash
    .replace(/\([^)]*\)/g, '') // Remove parenthetical content
    .replace(/\[[^\]]*\]/g, '') // Remove bracketed content
    
    // Ensure character names are clear
    .replace(/([A-Z][a-z]+)(?='s|'s)/g, '$1') // Clean possessives
    
    // Break up very long sentences for better pacing
    .replace(/([^.!?]{60,}?[,;])\s+/g, '$1. ')
    
    // Final cleanup
    .replace(/\s+/g, ' ')
    .trim();

  return cleanedText;
}