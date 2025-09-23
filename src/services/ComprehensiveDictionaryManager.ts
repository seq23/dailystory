// Comprehensive Dictionary Manager - Orchestrates dictionary generation and deployment
// Coordinates vocabulary collection, phonetic mapping, PLS generation, and ElevenLabs upload

import { ComprehensiveVocabularyCollector } from './ComprehensiveVocabularyCollector';
import { SmartPhoneticMapper } from './SmartPhoneticMapper';
import { PLSLexiconGenerator, type PLSGenerationOptions } from './PLSLexiconGenerator';
import { supabase } from '@/integrations/supabase/client';
import { DebugLogger } from '@/services/DebugLogger';
import { ProductionLogging } from '@/services/ProductionLogger';

export interface DictionaryDeploymentResult {
  success: boolean;
  dictionaryId?: string;
  wordCount: number;
  deploymentTime: number;
  statistics: {
    vocabularyStats: any;
    phoneticStats: any;
    plsStats: any;
  };
  error?: string;
}

export interface DictionaryStatus {
  isAvailable: boolean;
  dictionaryId?: string;
  wordCount?: number;
  lastUpdated?: string;
  cacheExpiry?: number;
}

export class ComprehensiveDictionaryManager {
  private static dictionaryCache: {
    learning?: DictionaryStatus;
    conversation?: DictionaryStatus;
  } = {};

  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Deploys a comprehensive learning dictionary to ElevenLabs
   */
  static async deployLearningDictionary(): Promise<DictionaryDeploymentResult> {
    const startTime = Date.now();
    DebugLogger.log('performance', 'Starting learning dictionary deployment...');

    try {
      // Generate vocabulary statistics
      const vocabularyStats = ComprehensiveVocabularyCollector.getStatistics();
      DebugLogger.log('performance', 'Vocabulary statistics generated', vocabularyStats);

      // Generate learning-optimized PLS lexicon
      const plsResult = await PLSLexiconGenerator.generateLearningLexicon();
      DebugLogger.log('performance', `Generated PLS lexicon with ${plsResult.wordCount} words`, plsResult);

      // Upload to ElevenLabs
      const uploadResult = await this.uploadDictionaryToElevenLabs(
        'charlotte-comprehensive-learning-lexicon',
        plsResult.plsXml
      );

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Dictionary upload failed');
      }

      // Update cache
      this.dictionaryCache.learning = {
        isAvailable: true,
        dictionaryId: uploadResult.dictionaryId,
        wordCount: plsResult.wordCount,
        lastUpdated: new Date().toISOString(),
        cacheExpiry: Date.now() + this.CACHE_DURATION
      };

      const deploymentTime = Date.now() - startTime;
      DebugLogger.log('performance', `Learning dictionary deployed successfully in ${deploymentTime}ms`, { deploymentTime });

      return {
        success: true,
        dictionaryId: uploadResult.dictionaryId,
        wordCount: plsResult.wordCount,
        deploymentTime,
        statistics: {
          vocabularyStats,
          phoneticStats: SmartPhoneticMapper.getPhoneticStatistics(),
          plsStats: plsResult.statistics
        }
      };

    } catch (error) {
      DebugLogger.error('story', 'Learning dictionary deployment failed', { error });
      return {
        success: false,
        wordCount: 0,
        deploymentTime: Date.now() - startTime,
        statistics: {
          vocabularyStats: {},
          phoneticStats: {},
          plsStats: {}
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Deploys a comprehensive conversation dictionary to ElevenLabs
   */
  static async deployConversationDictionary(): Promise<DictionaryDeploymentResult> {
    const startTime = Date.now();
    DebugLogger.log('performance', 'Starting conversation dictionary deployment...');

    try {
      // Generate vocabulary statistics
      const vocabularyStats = ComprehensiveVocabularyCollector.getStatistics();

      // Generate conversation-optimized PLS lexicon
      const plsResult = await PLSLexiconGenerator.generateConversationLexicon();
      DebugLogger.log('performance', `Generated conversation PLS lexicon with ${plsResult.wordCount} words`, plsResult);

      // Upload to ElevenLabs
      const uploadResult = await this.uploadDictionaryToElevenLabs(
        'charlotte-comprehensive-conversation-lexicon',
        plsResult.plsXml
      );

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Dictionary upload failed');
      }

      // Update cache
      this.dictionaryCache.conversation = {
        isAvailable: true,
        dictionaryId: uploadResult.dictionaryId,
        wordCount: plsResult.wordCount,
        lastUpdated: new Date().toISOString(),
        cacheExpiry: Date.now() + this.CACHE_DURATION
      };

      const deploymentTime = Date.now() - startTime;
      DebugLogger.log('performance', `Conversation dictionary deployed successfully in ${deploymentTime}ms`, { deploymentTime });

      return {
        success: true,
        dictionaryId: uploadResult.dictionaryId,
        wordCount: plsResult.wordCount,
        deploymentTime,
        statistics: {
          vocabularyStats,
          phoneticStats: SmartPhoneticMapper.getPhoneticStatistics(),
          plsStats: plsResult.statistics
        }
      };

    } catch (error) {
      DebugLogger.error('story', 'Conversation dictionary deployment failed', { error });
      return {
        success: false,
        wordCount: 0,
        deploymentTime: Date.now() - startTime,
        statistics: {
          vocabularyStats: {},
          phoneticStats: {},
          plsStats: {}
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Gets the current dictionary status for a context
   */
  static async getDictionaryStatus(context: 'learning' | 'conversation'): Promise<DictionaryStatus> {
    const cached = this.dictionaryCache[context];
    
    // Check if cache is still valid
    if (cached && cached.cacheExpiry && Date.now() < cached.cacheExpiry) {
      return cached;
    }

    // Check if dictionary exists on ElevenLabs
    try {
      const dictionaryName = context === 'learning' 
        ? 'charlotte-comprehensive-learning-lexicon'
        : 'charlotte-comprehensive-conversation-lexicon';

      const { data, error } = await supabase.functions.invoke('elevenlabs-dictionary-manager', {
        body: {
          action: 'list',
          dictionaryName
        }
      });

      if (error) {
        ProductionLogging.error('DICTIONARY', 'Error checking dictionary status', 'ComprehensiveDictionaryManager', { error });
        return { isAvailable: false };
      }

      const status: DictionaryStatus = {
        isAvailable: !!data?.dictionaryId,
        dictionaryId: data?.dictionaryId,
        lastUpdated: new Date().toISOString(),
        cacheExpiry: Date.now() + this.CACHE_DURATION
      };

      this.dictionaryCache[context] = status;
      return status;

    } catch (error) {
      ProductionLogging.error('DICTIONARY', 'Failed to check dictionary status', 'ComprehensiveDictionaryManager', { error });
      return { isAvailable: false };
    }
  }

  /**
   * Ensures dictionary is available, deploying if necessary
   */
  static async ensureDictionaryAvailable(context: 'learning' | 'conversation'): Promise<string | null> {
    const status = await this.getDictionaryStatus(context);
    
    if (status.isAvailable && status.dictionaryId) {
      DebugLogger.log('performance', `${context} dictionary already available`, { dictionaryId: status.dictionaryId });
      return status.dictionaryId;
    }

    DebugLogger.log('performance', `${context} dictionary not available, deploying...`);
    
    const deployment = context === 'learning' 
      ? await this.deployLearningDictionary()
      : await this.deployConversationDictionary();

    if (deployment.success && deployment.dictionaryId) {
      DebugLogger.log('performance', `${context} dictionary deployed successfully`, { dictionaryId: deployment.dictionaryId });
      return deployment.dictionaryId;
    }

    ProductionLogging.error('DICTIONARY', `Failed to deploy ${context} dictionary`, 'ComprehensiveDictionaryManager', { deployment });
    return null;
  }

  /**
   * Uploads dictionary to ElevenLabs via edge function
   */
  private static async uploadDictionaryToElevenLabs(
    dictionaryName: string,
    plsContent: string
  ): Promise<{ success: boolean; dictionaryId?: string; error?: string }> {
    try {
      DebugLogger.log('network', `Uploading dictionary "${dictionaryName}" to ElevenLabs...`);
      
      const { data, error } = await supabase.functions.invoke('elevenlabs-dictionary-manager', {
        body: {
          action: 'upload',
          dictionaryName,
          plsContent
        }
      });

      if (error) {
        ProductionLogging.error('DICTIONARY', 'Upload error', 'ComprehensiveDictionaryManager', { error });
        return { success: false, error: error.message };
      }

      if (data?.success && data?.dictionaryId) {
        DebugLogger.log('network', 'Upload successful', { dictionaryId: data.dictionaryId });
        return { success: true, dictionaryId: data.dictionaryId };
      }

      return { success: false, error: 'Upload failed without specific error' };

    } catch (error) {
      ProductionLogging.error('DICTIONARY', 'Dictionary upload exception', 'ComprehensiveDictionaryManager', { error });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown upload error' 
      };
    }
  }

  /**
   * Gets comprehensive system statistics
   */
  static async getSystemStatistics() {
    const vocabularyStats = ComprehensiveVocabularyCollector.getStatistics();
    const phoneticStats = SmartPhoneticMapper.getPhoneticStatistics();
    const learningStatus = await this.getDictionaryStatus('learning');
    const conversationStatus = await this.getDictionaryStatus('conversation');

    return {
      vocabulary: vocabularyStats,
      phonetics: phoneticStats,
      dictionaries: {
        learning: learningStatus,
        conversation: conversationStatus
      },
      coverage: {
        totalWords: vocabularyStats.totalWords,
        readyForPLS: vocabularyStats.readyForPLS,
        coveragePercentage: Math.round((vocabularyStats.readyForPLS / vocabularyStats.totalWords) * 100)
      }
    };
  }

  /**
   * Forces a refresh of all caches and regeneration
   */
  static async forceRefresh(): Promise<void> {
    DebugLogger.log('performance', 'Force refreshing dictionary system...');
    
    // Clear all caches
    this.dictionaryCache = {};
    ComprehensiveVocabularyCollector.clearCache();
    SmartPhoneticMapper.clearCache();
    
    DebugLogger.log('performance', 'All caches cleared, ready for fresh generation');
  }

  /**
   * Generates a custom dictionary with specific options
   */
  static async generateCustomDictionary(
    name: string,
    options: PLSGenerationOptions
  ): Promise<DictionaryDeploymentResult> {
    const startTime = Date.now();
    DebugLogger.log('performance', `Generating custom dictionary "${name}"...`);

    try {
      const plsResult = await PLSLexiconGenerator.generateComprehensiveLexicon(options);
      const uploadResult = await this.uploadDictionaryToElevenLabs(name, plsResult.plsXml);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Custom dictionary upload failed');
      }

      return {
        success: true,
        dictionaryId: uploadResult.dictionaryId,
        wordCount: plsResult.wordCount,
        deploymentTime: Date.now() - startTime,
        statistics: {
          vocabularyStats: ComprehensiveVocabularyCollector.getStatistics(),
          phoneticStats: SmartPhoneticMapper.getPhoneticStatistics(),
          plsStats: plsResult.statistics
        }
      };

    } catch (error) {
      return {
        success: false,
        wordCount: 0,
        deploymentTime: Date.now() - startTime,
        statistics: {
          vocabularyStats: {},
          phoneticStats: {},
          plsStats: {}
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}