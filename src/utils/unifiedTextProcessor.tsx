import React from "react";
import { MobileOptimizedInteractiveWord } from "@/components/MobileOptimizedInteractiveWord";
import type { UserInfo } from "@/types";
import { UnifiedTokenizationService } from "@/services/UnifiedTokenizationService";
import { tokenizeForHighlighting } from "@/utils/tokenize";
import { DifficultyLevelMapper } from "@/services/DifficultyLevelMapper";
import { VocabularyLevelClassifier } from "@/utils/vocabularyLevelClassifier";
import { DebugLogger } from "@/services/DebugLogger";

// Performance Cache for word frequency lookups
const wordDifficultyCache = new Map<string, any>();
const cacheExpiry = 300000; // 5 minutes

interface TextProcessorOptions {
  text: string;
  className?: string;
  difficulty?: string; // Frontend difficulty format ("beginner", "developing", etc.)
  userInfo?: UserInfo;
  isPremium?: boolean;
  userId?: string;
  highlightedWordIndex?: number;
  isMobile?: boolean;
}


/**
 * Unified text processor that handles both mobile and desktop rendering
 * with consistent highlighting and word flow
 */
// Performance Optimization: Cache vocabulary lookups per session
const getCachedWordDifficulty = (word: string, difficulty: string) => {
  const cacheKey = `${word}-${difficulty}`;
  const cached = wordDifficultyCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < cacheExpiry) {
    return cached.data;
  }
  
  const wordData = VocabularyLevelClassifier.getWordDifficulty(word, difficulty as any);
  wordDifficultyCache.set(cacheKey, { data: wordData, timestamp: Date.now() });
  return wordData;
};

export const processTextWithConsistentFlow = ({
  text,
  className = "",
  difficulty = "beginner", // Frontend difficulty default
  userInfo,
  isPremium,
  userId,
  highlightedWordIndex,
  isMobile = false
}: TextProcessorOptions): React.ReactNode[] => {
  // Handle undefined/null/empty text
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    console.warn('processTextWithConsistentFlow: text is undefined, not a string, or empty', { text });
    return [];
  }
  
  // Convert frontend difficulty to backend format for processing
  const backendDifficulty = DifficultyLevelMapper.toBackend(difficulty);
  
  // Performance: Pre-cache word difficulties for this text to avoid repeated lookups
  const { wordsOnly } = tokenizeForHighlighting(text.replace(/^Page\s*\d+\s*:\s*/i, '').replace(/^Page\s*\d+\s*/i, '').trim());
  wordsOnly.forEach(word => getCachedWordDifficulty(word, backendDifficulty));
  
  // Use unified text cleaning and tokenization for consistency with audio system
  const cleanText = UnifiedTokenizationService.cleanText(text);
  
  // Tokenize once for consistent mapping across audio and UI
  const { tokens, isWhitespace, wordOnlyIndexByTokenIndex } = UnifiedTokenizationService.getTokensWithLayout(cleanText);
  
  return tokens.map((token, index) => {
    // If it's just whitespace, return as plain text to maintain natural flow
    if (isWhitespace[index]) {
      return token;
    }
    
    // If it's empty, skip
    if (!token.trim()) {
      return null;
    }

    // Word-only index for this token
    const wordOnlyIndex = wordOnlyIndexByTokenIndex[index];
    const isHighlighted = highlightedWordIndex !== undefined && 
                         highlightedWordIndex !== -1 && 
                         highlightedWordIndex === wordOnlyIndex;
    
    // Consistent highlighting classes for both mobile and desktop
    const highlightClasses = isHighlighted 
      ? 'highlighted' 
      : 'transition-all duration-300';
    
    // Debug highlighting with throttling to prevent spam
    if (isHighlighted) {
      // Throttle console logs to prevent infinite loop spam
      const now = Date.now();
      const lastLogKey = `highlight-${wordOnlyIndex}`;
      const globalObj = globalThis as any;
      if (!globalObj.__lastHighlightLog || !globalObj.__lastHighlightLog[lastLogKey] || 
          now - globalObj.__lastHighlightLog[lastLogKey] > 500) {
        DebugLogger.log('ui', `Highlighting word at index ${wordOnlyIndex}: "${token}"`);
        globalObj.__lastHighlightLog = globalObj.__lastHighlightLog || {};
        globalObj.__lastHighlightLog[lastLogKey] = now;
      }
    }
    
    const finalClassName = `inline ${className} ${highlightClasses}`;
    
    // Use mobile-optimized modal on mobile/tablet; desktop uses hover tooltips
    if (isMobile) {
      return (
        <MobileOptimizedInteractiveWord
          key={`${index}-${token}`}
          word={token}
          className={finalClassName}
          difficulty={backendDifficulty}
          userInfo={userInfo}
          isPremium={isPremium}
          sentenceContext={cleanText}
          userId={userId}
          forceModal={true}
          wordIndex={wordOnlyIndex} // CRITICAL FIX: Pass wordIndex for highlighting
        />
      );
    }

    return (
      <MobileOptimizedInteractiveWord
        key={`${index}-${token}`}
        word={token}
        className={finalClassName}
        difficulty={backendDifficulty}
        userInfo={userInfo}
        isPremium={isPremium}
        sentenceContext={cleanText}
        userId={userId}
        forceModal={true}
        wordIndex={wordOnlyIndex} // CRITICAL FIX: Pass wordIndex for highlighting
      />
    );
  }).filter(Boolean);
};