/**
 * Smart Template Selector - Crash-Proof Template Matching
 * Matches user special requests against template metadata with robust error handling
 */

import { safeErrorMessage, safePropertyAccess, logSafeError } from './errorPatterns.ts';
import { getRegistryConfig } from './templates/registry.ts';

interface KeywordPatterns {
  [key: string]: string[];
}

/**
 * Validates special request input with comprehensive safety checks
 */
function validateSpecialRequest(specialRequest: string | null | undefined): string | null {
  try {
    // Handle all possible corrupted states
    if (!specialRequest) return null;
    if (typeof specialRequest !== 'string') return null;
    if (specialRequest.length === 0) return null;
    if (specialRequest.length > 1000) return null; // Prevent memory issues
    
    const cleaned = specialRequest.trim();
    if (cleaned.length === 0) return null;
    
    return cleaned;
  } catch (error) {
    logSafeError('Special request validation failed', error);
    return null;
  }
}

/**
 * Extract keywords from special request with bounds checking
 */
function extractKeywords(request: string): string[] {
  try {
    if (!request || typeof request !== 'string') return [];
    
    const cleaned = request
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove special characters safely
      .split(/\s+/)
      .filter(word => word.length > 2 && word.length < 20) // Reasonable word lengths
      .slice(0, 20); // Limit keywords to prevent processing issues
      
    return cleaned;
  } catch (error) {
    logSafeError('Keyword extraction failed', error);
    return []; // Safe fallback
  }
}

/**
 * Score template against keywords with timeout protection
 */
function scoreTemplate(template: any, keywords: string[]): number {
  try {
    if (!template || !keywords || keywords.length === 0) return 0;
    
    let score = 0;
    const title = safePropertyAccess(template, 'title', '').toLowerCase();
    const theme = safePropertyAccess(template, 'theme', '').toLowerCase();
    
    // Check for matches with different weights
    for (const keyword of keywords) {
      if (!keyword || typeof keyword !== 'string') continue;
      
      // Exact title match (highest priority)
      if (title.includes(keyword)) {
        score += 100;
      }
      // Theme match (medium priority) 
      else if (theme.includes(keyword)) {
        score += 50;
      }
      // Keyword patterns for common requests
      else if (isKeywordMatch(keyword, title, theme)) {
        score += 25;
      }
    }
    
    return score;
  } catch (error) {
    logSafeError('Template scoring failed', error);
    return 0; // Safe fallback
  }
}

/**
 * Check for keyword patterns in template content
 */
function isKeywordMatch(keyword: string, title: string, theme: string): boolean {
  try {
    const patterns: KeywordPatterns = {
      'adventure': ['adventure', 'explore', 'journey', 'quest', 'discover'],
      'friendship': ['friend', 'buddy', 'pal', 'companion', 'together'],
      'animals': ['animal', 'pet', 'cat', 'dog', 'bird', 'creature'],
      'magic': ['magic', 'wizard', 'fairy', 'enchant', 'spell'],
      'school': ['school', 'class', 'teacher', 'learn', 'study'],
      'family': ['family', 'parent', 'mom', 'dad', 'sister', 'brother'],
      'nature': ['tree', 'forest', 'garden', 'flower', 'nature'],
      'space': ['space', 'planet', 'star', 'moon', 'rocket', 'alien']
    };
    
    const matchPatterns = patterns[keyword];
    if (!matchPatterns) return false;
    
    return matchPatterns.some(pattern => 
      title.includes(pattern) || theme.includes(pattern)
    );
  } catch (error) {
    return false;
  }
}

/**
 * Select best matching template with multi-level fallback
 */
export async function selectBestMatch(
  specialRequest: string | null | undefined, 
  templateLevel: string, 
  templateCount: number
): Promise<number | null> {
  try {
    // Input validation with safety checks
    const processedRequest = validateSpecialRequest(specialRequest);
    if (!processedRequest) {
      return null; // Fall back to random selection
    }
    
    if (!templateLevel || templateCount <= 0) {
      return null; // Fall back to random selection
    }
    
    // Extract keywords with error handling
    const keywords = extractKeywords(processedRequest);
    if (keywords.length === 0) {
      return null; // No usable keywords, fall back to random
    }
    
    console.log(`🔍 Smart template selection for "${processedRequest}" (Level: ${templateLevel})`);
    console.log(`📝 Keywords extracted: [${keywords.join(', ')}]`);
    
    // Get template metadata from registry
    const config = getRegistryConfig(templateLevel);
    if (!config || !config.templates) {
      console.log(`⚠️ No template metadata found for ${templateLevel}, using fallback`);
      return null; // Registry not available, fall back to random
    }
    
    // Score all available templates
    let bestScore = 0;
    let bestIndex: number | null = null;
    const minThreshold = 25; // Minimum score required for smart selection
    
    const templatesToCheck = Math.min(templateCount, config.templates.length);
    
    for (let i = 0; i < templatesToCheck; i++) {
      try {
        const template = config.templates[i];
        if (!template) continue;
        
        const score = scoreTemplate(template, keywords);
        
        if (score > bestScore) {
          bestScore = score;
          bestIndex = i;
        }
        
        console.log(`📊 Template ${i}: "${safePropertyAccess(template, 'title', 'Unknown')}" scored ${score}`);
      } catch (error) {
        // Skip this template and continue
        console.log(`⚠️ Skipping template ${i} due to error:`, safeErrorMessage(error));
        continue;
      }
    }
    
    // Return best match if above threshold
    if (bestScore >= minThreshold && bestIndex !== null) {
      console.log(`🎯 Smart selection: Template ${bestIndex} with score ${bestScore}`);
      return bestIndex;
    }
    
    console.log(`📍 No strong matches found (best score: ${bestScore}), using fallback`);
    return null; // Fall back to random selection
    
  } catch (error) {
    logSafeError('Smart template selection failed', error);
    return null; // Always fall back gracefully
  }
}

/**
 * Smart selection with timeout protection
 */
export async function selectWithTimeout(
  specialRequest: string | null | undefined, 
  templateLevel: string, 
  templateCount: number, 
  timeoutMs: number = 100
): Promise<number | null> {
  try {
    return await Promise.race([
      selectBestMatch(specialRequest, templateLevel, templateCount),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Selection timeout')), timeoutMs)
      )
    ]);
  } catch (error) {
    logSafeError('Smart selection timeout or error', error);
    return null; // Graceful fallback
  }
}