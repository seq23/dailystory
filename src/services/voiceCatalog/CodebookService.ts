import { GlobalCodebook } from './types';

// Import codebook data from JSON file
import codebookData from './data/codebook.v1.1.json';

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
   * Resolve array indexes to their string values
   * Supports both direct strings and numeric indexes
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
      
      if (typeof index === 'number' && index >= 0 && index < array.length) {
        return array[index]; // Resolve index
      }
      
      console.warn(`Invalid index ${index} for codebook array '${String(arrayName)}'`);
      return `[invalid:${index}]`;
    });
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