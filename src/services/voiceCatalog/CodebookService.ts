/**
 * STORY GENERATION SYSTEM - Codebook Service
 * Purpose: Manages global AVC codebook for story narrative elements
 * NOT RELATED TO: User voice commands, audio playback, or microphone input
 */

import { GlobalCodebook } from './types';

// Import codebook data from backend file
import codebookData from '../../../supabase/functions/_shared/voice-catalog/codebook.v1.1.json';

/**
 * Codebook Service for managing the global AVC codebook v1.1
 * Provides access to predefined lists of terms and their metadata
 */
export class CodebookService {
  private static codebook: GlobalCodebook | null = null;
  private static isLoaded = false;

  // Load codebook data from JSON file
  private static readonly CODEBOOK_DATA: GlobalCodebook = codebookData as GlobalCodebook;

  /**
   * Get the global codebook data
   */
  static getCodebook(): GlobalCodebook {
    if (!this.codebook) {
      this.codebook = { ...this.CODEBOOK_DATA };
      this.isLoaded = true;
    }
    return this.codebook;
  }

  /**
   * Resolve array indexes to their string values with ±1 fallback
   * Supports both direct strings and numeric indexes
   * Enhanced with smart fallback logic to prevent invalid placeholders
   */
  static resolveIndexes<T extends string | number>(
    arrayName: keyof GlobalCodebook, 
    indexes: (number | string)[]
  ): string[] {
    const codebook = this.getCodebook();
    const array = codebook[arrayName] as string[];
    
    if (!Array.isArray(array)) {
      console.warn(`Codebook array '${String(arrayName)}' not found`);
      return [];
    }
    
    return indexes.map(index => {
      if (typeof index === 'string') {
        return index; // Direct string value
      }
      
      if (typeof index === 'number') {
        // Try exact index first
        if (index >= 0 && index < array.length) {
          return array[index];
        }
        
        // ±1 Fallback: Try index - 1 (common off-by-one error)
        if (index > 0 && (index - 1) < array.length) {
          console.log(`📝 Codebook: Using ±1 fallback ${index}→${index-1} for '${String(arrayName)}'`);
          return array[index - 1];
        }
        
        // ±1 Fallback: Try index + 1 (reverse off-by-one error)
        if (index >= 0 && (index + 1) < array.length) {
          console.log(`📝 Codebook: Using ±1 fallback ${index}→${index+1} for '${String(arrayName)}'`);
          return array[index + 1];
        }
        
        // Creative fallback: Use modulo wrapping to stay within bounds
        if (array.length > 0) {
          const wrappedIndex = Math.abs(index) % array.length;
          console.log(`📝 Codebook: Using creative fallback ${index}→${wrappedIndex} for '${String(arrayName)}'`);
          return array[wrappedIndex];
        }
      }
      
      // Last resort: return a contextually appropriate fallback
      console.warn(`Invalid index ${index} for codebook array '${String(arrayName)}', using creative fallback`);
      return this.getCreativeFallback(arrayName, index);
    });
  }

  /**
   * Get creative, contextually appropriate fallback for invalid indexes
   */
  private static getCreativeFallback(arrayName: keyof GlobalCodebook, originalIndex: number | string): string {
    // Return contextually appropriate alternatives instead of error strings
    const fallbacks: Record<string, string[]> = {
      'tones': ['mysterious', 'enchanting', 'delightful'],
      'twists': ['unexpected_discovery', 'surprise_helper', 'hidden_door'],
      'helpers': ['wise_friend', 'magical_guide', 'kind_stranger'],
      'settings': ['magical_place', 'cozy_corner', 'secret_spot'],
      'themes': ['adventure', 'friendship', 'discovery']
    };
    
    const arrayFallbacks = fallbacks[arrayName as string];
    if (arrayFallbacks) {
      const randomFallback = arrayFallbacks[Math.abs(Number(originalIndex) || 0) % arrayFallbacks.length];
      return randomFallback;
    }
    
    // Generic creative fallback
    return 'story_magic';
  }

  /**
   * Get a specific array from the codebook
   */
  static getArray(arrayName: keyof GlobalCodebook): string[] {
    const codebook = this.getCodebook();
    const array = codebook[arrayName];
    return Array.isArray(array) ? array : [];
  }

  /**
   * Find the index of a value in a codebook array
   */
  static findIndex(arrayName: keyof GlobalCodebook, value: string): number {
    const array = this.getArray(arrayName);
    return array.indexOf(value);
  }

  /**
   * Get codebook metadata
   */
  static getMetadata() {
    const codebook = this.getCodebook();
    return {
      schema: codebook.schema,
      version: codebook.v,
      arrays: Object.keys(codebook).filter(key => key !== 'schema' && key !== 'v')
    };
  }
}