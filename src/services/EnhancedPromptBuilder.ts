// Enhanced Prompt Builder with Smart Deduplication & Token Management
// Implements Phase 1: Smart Prompt Deduplication & Token Management

import { StructuredPromptEngine, type PromptTemplate } from './StructuredPromptEngine';
import { characterConsistency } from './UnifiedCharacterConsistency';
import { validateTokenLimit, type TokenValidationResult } from '@/utils/tokenLimitValidator';
import { PromptCacheService } from './PromptCacheService';
import type { UserInfo, DifficultyLevel, ExpertGradeLevel } from '@/types';
import type { CharacterDescriptor } from './AdvancedCharacterEngine';

export interface EnhancedPromptConfig {
  maxTokens?: number;
  enableDeduplication?: boolean;
  enableCharacterConsistency?: boolean;
  prioritizeCharacterDetails?: boolean;
}

export interface EnhancedPromptResult {
  prompt: string;
  tokenValidation: TokenValidationResult;
  characterSeed: number;
  culturalContext: string;
  usedComponents: string[];
  deduplicated: string[];
}

export class EnhancedPromptBuilder {
  private static usedPromptElements = new Map<string, Set<string>>();
  private static promptCache = new Map<string, { prompt: string; timestamp: number }>();
  private static readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Main prompt building method with deduplication and token management
   */
  static async buildCompletePrompt(
    storyText: string,
    userInfo: UserInfo,
    pageNumber: number,
    sessionId: string,
    config: EnhancedPromptConfig = {}
  ): Promise<EnhancedPromptResult> {
    const {
      maxTokens = 300,
      enableDeduplication = true,
      enableCharacterConsistency = true,
      prioritizeCharacterDetails = true
    } = config;

    // 1. Check cache first using PromptCacheService
    const userHashCode = (userInfo.name || 'guest').split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const cacheResult = PromptCacheService.getCachedPrompt(
      sessionId, 
      pageNumber, 
      userHashCode, 
      storyText
    );
    
    if (cacheResult.cached && cacheResult.prompt) {
      console.log('📋 Using cached prompt with enhancements');
      const estimatedTokens = Math.ceil(cacheResult.prompt.length / 4);
      const tokenValidation: TokenValidationResult = {
        isValid: estimatedTokens <= maxTokens,
        actualTokens: estimatedTokens,
        maxAllowed: maxTokens,
        exceededBy: estimatedTokens > maxTokens ? estimatedTokens - maxTokens : undefined,
        warnings: estimatedTokens > maxTokens ? ['Cached prompt exceeds token limit'] : []
      };
      
      return {
        prompt: cacheResult.prompt,
        tokenValidation,
        characterSeed: userHashCode,
        culturalContext: 'cached',
        usedComponents: cacheResult.enhancements || [],
        deduplicated: []
      };
    }

    // 2. Generate character seed for consistency
    const { seed: characterSeed, characterDescription, culturalContext } = 
      enableCharacterConsistency
        ? characterConsistency.getCharacterSeed(userInfo.name || 'guest', sessionId, userInfo)
        : { seed: 0, characterDescription: '', culturalContext: '' };

    // 2. Detect characters in story text
    const characterDescriptors = this.detectCharactersInText(storyText, sessionId, userInfo, characterSeed);

    // 3. Generate base structured prompt
    const template = StructuredPromptEngine.composeStructuredPrompt(
      storyText,
      userInfo,
      pageNumber,
      characterDescriptors
    );

    // 4. Apply deduplication if enabled
    let processedTemplate = template;
    let deduplicated: string[] = [];
    
    if (enableDeduplication) {
      const { deduplicatedTemplate, removedElements } = this.applySmartDeduplication(
        template,
        sessionId,
        pageNumber
      );
      processedTemplate = deduplicatedTemplate;
      deduplicated = removedElements;
    }

    // 5. Convert to string and apply token management
    let initialPrompt = this.templateToPrompt(processedTemplate, characterDescription);
    
    // 6. Apply token limits with smart truncation
    const difficulty = (userInfo.readingLevel || userInfo.difficultyLevel || 'easy') as DifficultyLevel;
    const { finalPrompt, usedComponents } = this.applyTokenManagement(
      initialPrompt,
      difficulty,
      maxTokens,
      prioritizeCharacterDetails
    );

    // 7. Validate final result
    const tokenValidation = validateTokenLimit(finalPrompt, 'medium');

    // Cache the result for future use
    PromptCacheService.cachePrompt(
      sessionId,
      pageNumber,
      userHashCode,
      storyText,
      finalPrompt,
      userInfo,
      tokenValidation.isValid
    );

    console.log(`🔧 Enhanced prompt built:`, {
      sessionId,
      pageNumber,
      characterSeed,
      originalTokens: initialPrompt.split(' ').length,
      finalTokens: finalPrompt.split(' ').length,
      deduplicationCount: deduplicated.length,
      isValid: tokenValidation.isValid
    });

    return {
      prompt: finalPrompt,
      tokenValidation,
      characterSeed,
      culturalContext,
      usedComponents,
      deduplicated
    };
  }

  /**
   * Smart deduplication to prevent repetitive prompt elements
   */
  private static applySmartDeduplication(
    template: PromptTemplate,
    sessionId: string,
    pageNumber: number
  ): { deduplicatedTemplate: PromptTemplate; removedElements: string[] } {
    const sessionKey = `${sessionId}`;
    const usedElements = this.usedPromptElements.get(sessionKey) || new Set();
    const removedElements: string[] = [];

    // Extract and deduplicate key phrases from each section
    const deduplicateSection = (section: string, sectionName: string): string => {
      const phrases = section.split(',').map(p => p.trim());
      const filteredPhrases = phrases.filter(phrase => {
        const key = `${sectionName}:${phrase.toLowerCase()}`;
        
        // Allow repeated character descriptions but limit style/setting repetition
        if (sectionName === 'visualAppearance' || sectionName === 'secondaryCharacters') {
          return true; // Always keep character details for consistency
        }
        
        if (usedElements.has(key)) {
          removedElements.push(phrase);
          return false;
        }
        
        usedElements.add(key);
        return true;
      });
      
      return filteredPhrases.join(', ');
    };

    const deduplicatedTemplate: PromptTemplate = {
      visualAppearance: template.visualAppearance, // Keep character consistency
      secondaryCharacters: template.secondaryCharacters, // Keep character consistency
      sceneDescription: deduplicateSection(template.sceneDescription, 'scene'),
      culturalSetting: deduplicateSection(template.culturalSetting, 'setting'),
      styleFramework: deduplicateSection(template.styleFramework, 'style'),
      qualityEnhancement: deduplicateSection(template.qualityEnhancement, 'quality')
    };

    // Update session tracking
    this.usedPromptElements.set(sessionKey, usedElements);

    // Clean up old sessions (keep last 10 sessions)
    if (this.usedPromptElements.size > 10) {
      const oldestKey = Array.from(this.usedPromptElements.keys())[0];
      this.usedPromptElements.delete(oldestKey);
    }

    return { deduplicatedTemplate, removedElements };
  }

  /**
   * Apply token management with smart truncation
   */
  private static applyTokenManagement(
    prompt: string,
    difficulty: DifficultyLevel | ExpertGradeLevel,
    maxTokens: number,
    prioritizeCharacterDetails: boolean
  ): { finalPrompt: string; usedComponents: string[] } {
    const validation = validateTokenLimit(prompt, 'medium');
    
    if (validation.isValid) {
      return { 
        finalPrompt: prompt, 
        usedComponents: ['character', 'scene', 'setting', 'style', 'quality'] 
      };
    }

    // Smart truncation based on priority
    const sections = prompt.split(',').map(s => s.trim());
    const usedComponents: string[] = [];
    let currentPrompt = '';
    let currentTokens = 0;

    // Priority order: character details > scene > setting > style > quality
    const priorities = prioritizeCharacterDetails 
      ? ['character', 'scene', 'setting', 'style', 'quality']
      : ['scene', 'character', 'setting', 'style', 'quality'];

    for (const priority of priorities) {
      const prioritySections = this.getSectionsByPriority(sections, priority);
      
      for (const section of prioritySections) {
        const sectionTokens = Math.ceil(section.split(' ').length * 1.3);
        
        if (currentTokens + sectionTokens <= maxTokens) {
          currentPrompt += (currentPrompt ? ', ' : '') + section;
          currentTokens += sectionTokens;
          usedComponents.push(priority);
        } else {
          // Try to fit truncated version
          const availableTokens = maxTokens - currentTokens;
          const maxWords = Math.floor(availableTokens / 1.3);
          
          if (maxWords > 3) {
            const words = section.split(' ');
            const truncatedSection = words.slice(0, maxWords).join(' ');
            currentPrompt += (currentPrompt ? ', ' : '') + truncatedSection;
            usedComponents.push(`${priority}-truncated`);
          }
          break;
        }
      }
    }

    return { finalPrompt: currentPrompt, usedComponents };
  }

  /**
   * Get sections by priority type
   */
  private static getSectionsByPriority(sections: string[], priority: string): string[] {
    const keywords = {
      character: ['child with', 'features', 'hair', 'skin', 'eyes'],
      scene: ['standing', 'sitting', 'playing', 'looking', 'smiling'],
      setting: ['in a', 'at the', 'near', 'background', 'environment'],
      style: ['illustration', 'artwork', 'style', 'painting'],
      quality: ['high quality', 'detailed', 'professional', 'vibrant']
    };

    return sections.filter(section => {
      const sectionLower = section.toLowerCase();
      return keywords[priority as keyof typeof keywords]?.some(keyword => 
        sectionLower.includes(keyword)
      ) || false;
    });
  }

  /**
   * Enhanced template to prompt conversion with character integration
   */
  private static templateToPrompt(template: PromptTemplate, characterDescription: string): string {
    const sections = [
      characterDescription, // Prioritize character consistency
      template.visualAppearance,
      template.secondaryCharacters,
      template.sceneDescription,
      template.culturalSetting,
      template.styleFramework,
      template.qualityEnhancement
    ].filter(section => section && section.trim().length > 0);
    
    return sections.join(', ');
  }

  /**
   * Detect characters with enhanced seed integration
   */
  private static detectCharactersInText(
    storyText: string,
    sessionId: string,
    userInfo: UserInfo,
    characterSeed: number
  ): CharacterDescriptor[] {
    // Use existing AdvancedCharacterEngine but ensure seed consistency
    try {
      const AdvancedCharacterEngine = require('./AdvancedCharacterEngine').AdvancedCharacterEngine;
      
      // Set seed for reproducible character generation
      const originalRandom = Math.random;
      Math.random = () => {
        // Simple seeded random implementation
        const x = Math.sin(characterSeed++) * 10000;
        return x - Math.floor(x);
      };
      
      const characters = AdvancedCharacterEngine.detectCharactersInText(
        storyText,
        sessionId,
        userInfo,
        1 // pageNumber
      );
      
      // Restore original random
      Math.random = originalRandom;
      
      return characters;
    } catch (error) {
      console.warn('AdvancedCharacterEngine not available, using fallback:', error);
      return [{
        name: userInfo.name || 'child',
        type: 'primary',
        relationshipToMain: 'main character',
        culturalRole: 'protagonist',
        physicalTraits: `${userInfo.avatar?.skinTone || 'medium'} skin`,
        clothingStyle: 'casual clothing',
        lastUsedPage: 1,
        seed: characterSeed,
        ageCategory: 'child'
      }];
    }
  }

  /**
   * Clear session cache and deduplication data
   */
  static clearSession(sessionId: string): void {
    this.usedPromptElements.delete(sessionId);
    
    // Clear related cache entries
    for (const [key] of this.promptCache) {
      if (key.includes(sessionId)) {
        this.promptCache.delete(key);
      }
    }
  }

  /**
   * Get prompt generation statistics
   */
  static getGenerationStats(): {
    activeSessions: number;
    cacheSize: number;
    averageDeduplication: number;
  } {
    const activeSessions = this.usedPromptElements.size;
    const cacheSize = this.promptCache.size;
    
    let totalDeduplication = 0;
    for (const elements of this.usedPromptElements.values()) {
      totalDeduplication += elements.size;
    }
    
    return {
      activeSessions,
      cacheSize,
      averageDeduplication: activeSessions > 0 ? totalDeduplication / activeSessions : 0
    };
  }
}
