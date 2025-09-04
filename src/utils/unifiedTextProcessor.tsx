import React from "react";
import { MobileOptimizedInteractiveWord } from "@/components/MobileOptimizedInteractiveWord";
import type { UserInfo } from "@/types";
import { tokenizeForHighlighting } from "@/utils/tokenize";
import { DifficultyLevelMapper } from "@/services/DifficultyLevelMapper";

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
  
  // Strip page markers as safety net before processing
  const cleanText = text.replace(/^Page\s*\d+\s*:\s*/i, '').replace(/^Page\s*\d+\s*/i, '').trim();
  
  // Tokenize once for consistent mapping across audio and UI
  const { tokens, isWhitespace, wordOnlyIndexByTokenIndex } = tokenizeForHighlighting(cleanText);
  
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
        console.log(`🎯 Highlighting word at index ${wordOnlyIndex}: "${token}"`);
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
      />
    );
  }).filter(Boolean);
};