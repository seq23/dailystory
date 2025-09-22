import { supabase } from "@/integrations/supabase/client";
import { ProductionLogging } from '@/services/ProductionLogger';

export class CharlotteLexiconIntegration {
  private static dictionaryId: string | null = null;
  private static lastCheck = 0;
  private static checkInterval = 3600000; // 1 hour

  /**
   * Initialize Charlotte's learning lexicon with ElevenLabs
   */
  static async initialize(): Promise<void> {
    try {
      ProductionLogging.debug('LEXICON', 'Initializing Charlotte lexicon', 'charlotteLexiconIntegration');
      
      // Check if dictionary already exists
      const existingDict = await this.checkExistingDictionary();
      if (existingDict) {
        this.dictionaryId = existingDict;
        ProductionLogging.debug('LEXICON', 'Charlotte lexicon already exists', 'charlotteLexiconIntegration', { existingDict });
        return;
      }

      // Upload the dictionary
      const result = await this.uploadDictionary();
      if (result.success) {
        this.dictionaryId = result.dictionaryId;
        ProductionLogging.debug('LEXICON', 'Charlotte lexicon uploaded successfully', 'charlotteLexiconIntegration', { dictionaryId: result.dictionaryId });
      } else {
        ProductionLogging.error('LEXICON', 'Failed to upload Charlotte lexicon', 'charlotteLexiconIntegration', { error: result.error });
      }
    } catch (error) {
      ProductionLogging.error('LEXICON', 'Charlotte lexicon initialization failed', 'charlotteLexiconIntegration', { error });
    }
  }

  /**
   * Check if Charlotte's dictionary already exists
   */
  private static async checkExistingDictionary(): Promise<string | null> {
    try {
      const now = Date.now();
      if (this.dictionaryId && (now - this.lastCheck) < this.checkInterval) {
        return this.dictionaryId;
      }

      const { data, error } = await supabase.functions.invoke('elevenlabs-dictionary-manager', {
        body: { action: 'list' }
      });

      if (error) {
        ProductionLogging.error('LEXICON', 'Dictionary check failed', 'charlotteLexiconIntegration', { error });
        return null;
      }

      this.lastCheck = now;
      return data?.charlotteDictionaryId || null;
    } catch (error) {
      ProductionLogging.error('LEXICON', 'Dictionary check error', 'charlotteLexiconIntegration', { error });
      return null;
    }
  }

  /**
   * Upload Charlotte's lexicon to ElevenLabs
   */
  private static async uploadDictionary(): Promise<{ success: boolean; dictionaryId?: string; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-dictionary-manager', {
        body: { action: 'upload' }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.success) {
        return { success: true, dictionaryId: data.dictionaryId };
      } else {
        return { success: false, error: data?.error || 'Upload failed' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get the current dictionary ID
   */
  static async getDictionaryId(): Promise<string | null> {
    if (!this.dictionaryId) {
      await this.initialize();
    }
    return this.dictionaryId;
  }

  /**
   * Refresh dictionary status
   */
  static async refresh(): Promise<void> {
    this.dictionaryId = null;
    this.lastCheck = 0;
    await this.initialize();
  }

  /**
   * Check if lexicon is available for learning context
   */
  static isAvailable(): boolean {
    return !!this.dictionaryId;
  }
}