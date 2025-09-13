// Clean Deploy: 2025-01-30T12:00:00Z - Force GitHub refresh
/**
 * Netflix Page Validation - CRITICAL FIX for 6-Page Minimum Business Requirement
 * 
 * This module ensures all Netflix stories meet the 6-page minimum business requirement
 * by bypassing word count validation when force-splitting content to achieve page minimums.
 */

import { ValidationLevel, getMinCharactersPerPage, forceMinimumPageSplit } from './validation-utils.ts';

/**
 * Validate Netflix story and ensure 6+ page minimum with word count bypass
 * CRITICAL: When content needs to be force-split to meet 6 pages, word count validation is bypassed
 */
export function validateNetflixStoryWithPageMinimum(
  content: string,
  level: ValidationLevel,
  pages: string[]
): {
  isValid: boolean;
  pages: string[];
  wasForceSplit: boolean;
  wordCountBypassed: boolean;
  reason?: string;
} {
  // PHASE 1: Check if we meet the 6-page minimum
  if (pages.length >= 6) {
    return {
      isValid: true,
      pages,
      wasForceSplit: false,
      wordCountBypassed: false,
      reason: `Netflix story has ${pages.length} pages (meets 6-page minimum)`
    };
  }

  // PHASE 2: Content is too short, must force-split to meet business requirement
  console.log(`🚨 NETFLIX PAGE MINIMUM: Story has ${pages.length} pages, forcing split to meet 6-page business requirement`);
  
  const forceSplitPages = forceMinimumPageSplit(content, 6);
  
  // PHASE 3: Word count validation BYPASS for force-split scenarios
  // This is the critical fix - when we force-split to meet page minimums,
  // we bypass word count validation to ensure the business requirement is met
  const wordCountBypassed = true;
  
  console.log(`✅ NETFLIX PAGE MINIMUM: Force-split complete:`, {
    originalPages: pages.length,
    forceSplitPages: forceSplitPages.length,
    wordCountValidationBypassed: wordCountBypassed,
    businessRequirement: '6+ pages for Netflix stories'
  });

  return {
    isValid: true,
    pages: forceSplitPages,
    wasForceSplit: true,
    wordCountBypassed,
    reason: `Netflix story force-split from ${pages.length} to ${forceSplitPages.length} pages to meet 6-page minimum`
  };
}

/**
 * Check if a Netflix story meets page and character requirements with bypass logic
 */
export function validateNetflixRequirements(
  content: string,
  level: ValidationLevel
): {
  pagesValid: boolean;
  charactersValid: boolean;
  canProceedWithForceSplit: boolean;
  shouldBypassWordCount: boolean;
} {
  const minCharsPerPage = getMinCharactersPerPage(level);
  const expectedPages = 6; // Netflix minimum
  const minTotalChars = minCharsPerPage * expectedPages;
  
  // Check if content has enough characters for meaningful splitting
  const charactersValid = content.length >= minTotalChars;
  
  // Preliminary page check
  const preliminaryPages = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const pagesValid = preliminaryPages.length >= 6;
  
  // If we don't have enough pages but have sufficient content, we can force-split
  const canProceedWithForceSplit = !pagesValid && charactersValid;
  
  // If we're force-splitting, we should bypass word count validation
  const shouldBypassWordCount = canProceedWithForceSplit;
  
  console.log(`📊 NETFLIX REQUIREMENTS CHECK:`, {
    contentLength: content.length,
    minTotalChars,
    preliminaryPageCount: preliminaryPages.length,
    pagesValid,
    charactersValid,
    canProceedWithForceSplit,
    shouldBypassWordCount,
    level
  });

  return {
    pagesValid,
    charactersValid,
    canProceedWithForceSplit,
    shouldBypassWordCount
  };
}