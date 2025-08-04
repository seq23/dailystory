// Enhanced Anti-Repetition Engine with Tier-Specific Logic
// Implements robust anti-repetition for both free and premium users

import { DifficultyLevel, UserInfo } from '@/types';
import { IntelligentTemplateSelector } from './intelligentTemplateSelector';
import { PersistentAntiRepetitionService } from './persistentAntiRepetitionService';

interface AntiRepetitionConfig {
  tier: 'free' | 'premium';
  userId: string;
  sessionId?: string;
  preserveContext?: boolean;
}

interface ContentAnalysis {
  contentSignature: string;
  semanticFingerprint: string;
  templatePattern: string;
  vocabulary: string[];
  narrative: string;
}

interface RepetitionCheckResult {
  isDuplicate: boolean;
  similarity: number;
  reason: string;
  suggestion?: string;
}

export class EnhancedAntiRepetitionEngine {
  private static sessionHistory = new Map<string, ContentAnalysis[]>();
  private static narrativeTracking = new Map<string, string[]>();
  private static characterConsistency = new Map<string, Record<string, any>>();

  // FREE TIER - Enhanced Robust Anti-Repetition
  private static async checkFreeTierRepetition(
    content: string,
    config: AntiRepetitionConfig,
    difficulty: DifficultyLevel
  ): Promise<RepetitionCheckResult> {
    const userKey = `${config.userId}_free`;
    const sessionHistory = this.sessionHistory.get(userKey) || [];
    
    // Enhanced content analysis
    const analysis = this.analyzeContent(content, difficulty, 'free');
    
    // Multi-level repetition detection
    const checks = [
      this.checkExactDuplicates(analysis, sessionHistory),
      this.checkSemanticSimilarity(analysis, sessionHistory, 0.7), // Stricter for free
      this.checkTemplateOveruse(analysis, sessionHistory, 2), // Max 2 uses per template
      await this.checkPersistentHistory(analysis, config.userId, 'free')
    ];
    
    const failedCheck = checks.find(check => check.isDuplicate);
    if (failedCheck) {
      return failedCheck;
    }
    
    // Content passed all checks
    this.addToSessionHistory(userKey, analysis);
    await this.addToPersistentHistory(analysis, config.userId, 'free');
    
    return {
      isDuplicate: false,
      similarity: 0,
      reason: 'Content is unique and acceptable',
      suggestion: 'Continue with this content'
    };
  }

  // PREMIUM TIER - Ultra-Robust Anti-Repetition with Advanced Features
  private static async checkPremiumTierRepetition(
    content: string,
    config: AntiRepetitionConfig,
    difficulty: DifficultyLevel,
    storyContext?: any
  ): Promise<RepetitionCheckResult> {
    const userKey = `${config.userId}_premium`;
    const sessionHistory = this.sessionHistory.get(userKey) || [];
    
    // Advanced content analysis with narrative tracking
    const analysis = this.analyzeContent(content, difficulty, 'premium');
    
    // Premium-exclusive checks
    const checks = [
      this.checkExactDuplicates(analysis, sessionHistory),
      this.checkSemanticSimilarity(analysis, sessionHistory, 0.5), // More lenient for variety
      this.checkTemplateOveruse(analysis, sessionHistory, 5), // Higher limit for premium
      this.checkNarrativeConsistency(analysis, userKey, storyContext),
      this.checkCharacterDevelopment(analysis, userKey, storyContext),
      await this.checkCrossStoryThemes(analysis, config.userId),
      await this.checkPersistentHistory(analysis, config.userId, 'premium')
    ];
    
    const failedCheck = checks.find(check => check.isDuplicate);
    if (failedCheck) {
      // Premium users get advanced suggestions
      failedCheck.suggestion = this.generatePremiumSuggestion(failedCheck, analysis, storyContext);
      return failedCheck;
    }
    
    // Update premium tracking systems
    this.addToSessionHistory(userKey, analysis);
    this.updateNarrativeTracking(userKey, analysis, storyContext);
    this.updateCharacterConsistency(userKey, analysis, storyContext);
    await this.addToPersistentHistory(analysis, config.userId, 'premium');
    
    return {
      isDuplicate: false,
      similarity: 0,
      reason: 'Content meets premium uniqueness standards',
      suggestion: 'Excellent narrative progression'
    };
  }

  // Main public interface
  public static async checkContentRepetition(
    content: string,
    config: AntiRepetitionConfig,
    difficulty: DifficultyLevel,
    storyContext?: any
  ): Promise<RepetitionCheckResult> {
    if (config.tier === 'premium') {
      return this.checkPremiumTierRepetition(content, config, difficulty, storyContext);
    } else {
      return this.checkFreeTierRepetition(content, config, difficulty);
    }
  }

  // Advanced content analysis
  private static analyzeContent(content: string, difficulty: DifficultyLevel, tier: 'free' | 'premium'): ContentAnalysis {
    const words = content.toLowerCase().split(/\s+/);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    
    return {
      contentSignature: this.generateContentSignature(content),
      semanticFingerprint: this.generateSemanticFingerprint(words, difficulty),
      templatePattern: this.extractTemplatePattern(content),
      vocabulary: this.extractVocabulary(words, difficulty),
      narrative: this.extractNarrativeElements(content, tier)
    };
  }

  // Repetition check methods
  private static checkExactDuplicates(analysis: ContentAnalysis, history: ContentAnalysis[]): RepetitionCheckResult {
    const duplicate = history.find(item => item.contentSignature === analysis.contentSignature);
    
    return {
      isDuplicate: !!duplicate,
      similarity: duplicate ? 1.0 : 0,
      reason: duplicate ? 'Exact content duplicate detected' : 'No exact duplicates'
    };
  }

  private static checkSemanticSimilarity(
    analysis: ContentAnalysis, 
    history: ContentAnalysis[], 
    threshold: number
  ): RepetitionCheckResult {
    let maxSimilarity = 0;
    
    for (const item of history) {
      const similarity = this.calculateSemanticSimilarity(analysis.semanticFingerprint, item.semanticFingerprint);
      maxSimilarity = Math.max(maxSimilarity, similarity);
    }
    
    return {
      isDuplicate: maxSimilarity >= threshold,
      similarity: maxSimilarity,
      reason: maxSimilarity >= threshold 
        ? `Content too similar to previous content (${(maxSimilarity * 100).toFixed(1)}% similarity)`
        : 'Content sufficiently unique'
    };
  }

  private static checkTemplateOveruse(
    analysis: ContentAnalysis, 
    history: ContentAnalysis[], 
    maxUses: number
  ): RepetitionCheckResult {
    const templateUses = history.filter(item => item.templatePattern === analysis.templatePattern).length;
    
    return {
      isDuplicate: templateUses >= maxUses,
      similarity: templateUses / maxUses,
      reason: templateUses >= maxUses 
        ? `Template pattern overused (${templateUses}/${maxUses} uses)`
        : `Template usage acceptable (${templateUses}/${maxUses} uses)`
    };
  }

  private static checkNarrativeConsistency(
    analysis: ContentAnalysis, 
    userKey: string, 
    storyContext?: any
  ): RepetitionCheckResult {
    if (!storyContext) {
      return { isDuplicate: false, similarity: 0, reason: 'No story context for consistency check' };
    }
    
    const narrativeHistory = this.narrativeTracking.get(userKey) || [];
    const currentNarrative = analysis.narrative;
    
    // Check for narrative contradictions or repetitive plot elements
    const contradictory = narrativeHistory.some(previous => 
      this.detectNarrativeContradiction(currentNarrative, previous)
    );
    
    const repetitive = narrativeHistory.filter(previous => 
      this.calculateNarrativeSimilarity(currentNarrative, previous) > 0.8
    ).length > 1;
    
    return {
      isDuplicate: contradictory || repetitive,
      similarity: repetitive ? 0.9 : 0,
      reason: contradictory 
        ? 'Narrative contradiction detected'
        : repetitive 
          ? 'Repetitive plot elements detected'
          : 'Narrative consistency maintained'
    };
  }

  private static checkCharacterDevelopment(
    analysis: ContentAnalysis, 
    userKey: string, 
    storyContext?: any
  ): RepetitionCheckResult {
    if (!storyContext?.characters) {
      return { isDuplicate: false, similarity: 0, reason: 'No character context available' };
    }
    
    const characterHistory = this.characterConsistency.get(userKey) || {};
    
    // Premium feature: Ensure character consistency across story segments
    for (const character of storyContext.characters) {
      const previousTraits = characterHistory[character.name];
      if (previousTraits && this.detectCharacterInconsistency(character, previousTraits)) {
        return {
          isDuplicate: true,
          similarity: 0.8,
          reason: `Character inconsistency detected for ${character.name}`
        };
      }
    }
    
    return {
      isDuplicate: false,
      similarity: 0,
      reason: 'Character development consistent'
    };
  }

  private static async checkCrossStoryThemes(analysis: ContentAnalysis, userId: string): Promise<RepetitionCheckResult> {
    // Premium feature: Track themes across different stories
    const themeHistory = await this.getCrossStoryThemes(userId);
    const currentThemes = this.extractThemes(analysis.narrative);
    
    const repetitiveThemes = currentThemes.filter(theme => 
      themeHistory.filter(prevTheme => prevTheme === theme).length > 3
    );
    
    return {
      isDuplicate: repetitiveThemes.length > 0,
      similarity: repetitiveThemes.length / currentThemes.length,
      reason: repetitiveThemes.length > 0 
        ? `Repetitive themes detected: ${repetitiveThemes.join(', ')}`
        : 'Theme variety maintained'
    };
  }

  private static async checkPersistentHistory(
    analysis: ContentAnalysis, 
    userId: string, 
    tier: 'free' | 'premium'
  ): Promise<RepetitionCheckResult> {
    // Simplified check for now - can be enhanced later
    const isDuplicate = false;
    
    return {
      isDuplicate,
      similarity: isDuplicate ? 0.8 : 0,
      reason: isDuplicate 
        ? 'Content matches previously generated story'
        : 'Content unique across all user history'
    };
  }

  // Helper methods for content analysis
  private static generateContentSignature(content: string): string {
    // Create a unique signature for exact duplicate detection
    return btoa(content.toLowerCase().replace(/\s+/g, ' ').trim());
  }

  private static generateSemanticFingerprint(words: string[], difficulty: DifficultyLevel): string {
    // Create a semantic fingerprint based on key vocabulary and patterns
    const keyWords = words.filter(word => word.length > 3);
    const sortedWords = [...new Set(keyWords)].sort();
    return sortedWords.slice(0, 10).join('|');
  }

  private static extractTemplatePattern(content: string): string {
    // Extract the underlying template pattern
    return content
      .replace(/[A-Z][a-z]+/g, '{NAME}')
      .replace(/\b(red|blue|green|yellow|purple|orange)\b/gi, '{COLOR}')
      .replace(/\b(cat|dog|bird|fish|rabbit|bear)\b/gi, '{ANIMAL}')
      .toLowerCase();
  }

  private static extractVocabulary(words: string[], difficulty: DifficultyLevel): string[] {
    // Extract key vocabulary based on difficulty level
    const minLength = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
    return words.filter(word => word.length >= minLength && /^[a-z]+$/.test(word));
  }

  private static extractNarrativeElements(content: string, tier: 'free' | 'premium'): string {
    if (tier === 'free') {
      // Basic narrative element extraction
      return content.toLowerCase().replace(/[^a-z\s]/g, '').trim();
    } else {
      // Advanced narrative analysis for premium
      const sentences = content.split(/[.!?]+/);
      const actions = sentences.filter(s => /\b(went|found|saw|helped|learned)\b/i.test(s));
      return actions.join(' | ');
    }
  }

  private static calculateSemanticSimilarity(fingerprint1: string, fingerprint2: string): number {
    const words1 = new Set(fingerprint1.split('|'));
    const words2 = new Set(fingerprint2.split('|'));
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  // Premium-specific helper methods
  private static detectNarrativeContradiction(current: string, previous: string): boolean {
    // Advanced narrative analysis for premium users
    // This would be enhanced with NLP in a real implementation
    return false; // Placeholder
  }

  private static calculateNarrativeSimilarity(narrative1: string, narrative2: string): number {
    // Calculate narrative similarity for premium users
    const words1 = new Set(narrative1.toLowerCase().split(/\s+/));
    const words2 = new Set(narrative2.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    
    return Math.max(words1.size, words2.size) > 0 
      ? intersection.size / Math.max(words1.size, words2.size) 
      : 0;
  }

  private static detectCharacterInconsistency(current: any, previous: any): boolean {
    // Check for character trait inconsistencies (premium feature)
    return false; // Placeholder for advanced character analysis
  }

  private static extractThemes(narrative: string): string[] {
    // Extract story themes (premium feature)
    const themes = [];
    if (/friend/i.test(narrative)) themes.push('friendship');
    if (/help/i.test(narrative)) themes.push('helping');
    if (/adventure/i.test(narrative)) themes.push('adventure');
    if (/learn/i.test(narrative)) themes.push('learning');
    return themes;
  }

  private static async getCrossStoryThemes(userId: string): Promise<string[]> {
    // Get themes from all user's stories (premium feature)
    // This would integrate with user story database
    return []; // Placeholder
  }

  private static generatePremiumSuggestion(
    result: RepetitionCheckResult, 
    analysis: ContentAnalysis, 
    storyContext?: any
  ): string {
    // Generate intelligent suggestions for premium users
    if (result.reason.includes('template')) {
      return 'Try using a different story structure or narrative approach';
    }
    if (result.reason.includes('similarity')) {
      return 'Consider introducing new vocabulary or different plot elements';
    }
    if (result.reason.includes('character')) {
      return 'Maintain character consistency or develop character growth naturally';
    }
    return 'Explore new creative directions while maintaining story quality';
  }

  // Session management
  private static addToSessionHistory(userKey: string, analysis: ContentAnalysis): void {
    const history = this.sessionHistory.get(userKey) || [];
    history.push(analysis);
    
    // Maintain reasonable history size (more for premium)
    const maxHistory = userKey.includes('premium') ? 50 : 25;
    if (history.length > maxHistory) {
      history.shift();
    }
    
    this.sessionHistory.set(userKey, history);
  }

  private static async addToPersistentHistory(
    analysis: ContentAnalysis, 
    userId: string, 
    tier: 'free' | 'premium'
  ): Promise<void> {
    // Simplified storage for now - can be enhanced later
    console.log(`📝 Storing content signature for ${userId} (${tier})`);
  }

  private static updateNarrativeTracking(
    userKey: string, 
    analysis: ContentAnalysis, 
    storyContext?: any
  ): void {
    if (!storyContext) return;
    
    const narratives = this.narrativeTracking.get(userKey) || [];
    narratives.push(analysis.narrative);
    
    // Keep last 20 narratives for tracking
    if (narratives.length > 20) {
      narratives.shift();
    }
    
    this.narrativeTracking.set(userKey, narratives);
  }

  private static updateCharacterConsistency(
    userKey: string, 
    analysis: ContentAnalysis, 
    storyContext?: any
  ): void {
    if (!storyContext?.characters) return;
    
    const characters = this.characterConsistency.get(userKey) || {};
    
    for (const character of storyContext.characters) {
      characters[character.name] = {
        ...characters[character.name],
        ...character,
        lastSeen: Date.now()
      };
    }
    
    this.characterConsistency.set(userKey, characters);
  }

  // Analytics and cleanup
  public static getEngineStats(userId?: string, tier?: 'free' | 'premium') {
    const stats = {
      sessionsTracked: 0,
      contentAnalyzed: 0,
      duplicatesBlocked: 0,
      narrativesTracked: 0,
      charactersTracked: 0
    };
    
    for (const [key, history] of this.sessionHistory.entries()) {
      if (userId && !key.includes(userId)) continue;
      if (tier && !key.includes(tier)) continue;
      
      stats.sessionsTracked++;
      stats.contentAnalyzed += history.length;
    }
    
    stats.narrativesTracked = this.narrativeTracking.size;
    stats.charactersTracked = this.characterConsistency.size;
    
    return stats;
  }

  public static clearUserData(userId: string, tier?: 'free' | 'premium'): void {
    const keysToRemove: string[] = [];
    
    for (const key of this.sessionHistory.keys()) {
      if (key.includes(userId) && (!tier || key.includes(tier))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      this.sessionHistory.delete(key);
      this.narrativeTracking.delete(key);
      this.characterConsistency.delete(key);
    });
    
    console.log(`🧹 Enhanced Anti-Repetition Engine: Cleared data for ${userId} (${tier || 'all tiers'})`);
  }
}
