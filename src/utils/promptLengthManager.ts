// Smart Prompt Length Management System
// Phase 2: Tiered suffix system and intelligent truncation
// Phase 3: Advanced prioritization and user preference optimization

import { AdvancedContentPrioritizer, type UserOptimizationPreference } from './advancedContentPrioritizer';
import type { UserInfo, DifficultyLevel } from '@/types';

export interface PromptTier {
  minimal: string;
  standard: string;
  detailed: string;
}

// Enhanced tiered suffix system for optimal children's book quality
export const QUALITY_SUFFIXES: PromptTier = {
  minimal: "children's book illustration, warm colors, safe wholesome content",
  standard: "children's book illustration, warm earth tones, diverse inclusive characters, professional artwork",
  detailed: "professional children's book illustration, warm earth tones and soft natural lighting, diverse inclusive characters with expressive faces, contemporary storybook art style, safe wholesome content, high quality digital artwork, soft painterly texture, appealing composition"
};

// Ultra-compressed character consistency descriptions (reduced by ~40 chars each)  
export const CHARACTER_SUFFIXES: PromptTier = {
  minimal: "consistent",
  standard: "consistent design",
  detailed: "consistent design, accurate representation"
};

// Prompt priority levels for intelligent truncation
export enum PromptPriority {
  CORE_CONTENT = 1,     // Story scene, character, action (keep always)
  STYLE_FRAMEWORK = 2,  // Difficulty-based style (keep if possible)
  CHARACTER_DETAILS = 3, // Character consistency (reduce if needed)
  QUALITY_SUFFIX = 4,   // Quality enhancers (minimal tier if needed)
  BRAND_SUFFIX = 5      // Brand/style suffix (remove if needed)
}

export interface PromptSegment {
  content: string;
  priority: PromptPriority;
  canTruncate: boolean;
  tier?: 'minimal' | 'standard' | 'detailed';
}

export class PromptLengthManager {
  private static readonly MAX_LENGTH = 2800; // Safe buffer below Runware's 3000 limit
  private static readonly WARN_LENGTH = 2500; // Warning threshold
  
  /**
   * Advanced optimization using content prioritization and user preferences
   */
  static optimizeWithAdvancedPrioritization(
    segments: PromptSegment[],
    userInfo: UserInfo,
    difficultyLevel: DifficultyLevel,
    userPreferences?: Partial<UserOptimizationPreference>
  ): {
    optimizedPrompt: string;
    wasOptimized: boolean;
    originalLength: number;
    finalLength: number;
    optimizations: string[];
    strategy: string;
  } {
    // Build initial prompt for analysis
    const prompt = segments.map(s => s.content).join(' ');
    const originalLength = prompt.length;
    
    // If prompt is short enough, use standard optimization
    if (originalLength <= this.WARN_LENGTH) {
      const standardResult = this.optimizePrompt(segments);
      return {
        ...standardResult,
        strategy: 'standard'
      };
    }
    
    console.log(`🧠 Using advanced prioritization for ${originalLength}-char prompt`);
    
    // Analyze content priority
    const contentAnalysis = AdvancedContentPrioritizer.analyzeContentPriority(
      prompt, 
      userInfo, 
      difficultyLevel
    );
    
    // Calculate content complexity (higher = more complex)
    const contentComplexity = this.calculateContentComplexity(contentAnalysis);
    
    // Create optimization strategy based on user preferences
    const strategy = AdvancedContentPrioritizer.createOptimizationStrategy(
      userPreferences || {},
      difficultyLevel,
      contentComplexity
    );
    
    // Apply advanced optimization
    const { optimizedContent, reductionApplied } = AdvancedContentPrioritizer.optimizeContentWithStrategy(
      contentAnalysis,
      strategy,
      originalLength
    );
    
    // Rebuild prompt from optimized content
    const optimizedPrompt = this.rebuildPromptFromAnalysis(optimizedContent);
    const finalLength = optimizedPrompt.length;
    
    const wasOptimized = finalLength < originalLength;
    
    console.log(`🎯 Advanced optimization complete: ${originalLength} → ${finalLength} chars`);
    if (reductionApplied.length > 0) {
      console.log(`🔧 Advanced reductions applied: ${reductionApplied.join(', ')}`);
    }
    
    return {
      optimizedPrompt,
      wasOptimized,
      originalLength,
      finalLength,
      optimizations: reductionApplied,
      strategy: 'advanced'
    };
  }
  
  /**
   * Legacy optimization method (Phase 2) - ENHANCED with style framework protection
   */
  static optimizePrompt(segments: PromptSegment[]): {
    optimizedPrompt: string;
    wasOptimized: boolean;
    originalLength: number;
    finalLength: number;
    optimizations: string[];
  } {
    const optimizations: string[] = [];
    let wasOptimized = false;
    
    // Build initial prompt
    let prompt = segments.map(s => s.content).join(' ');
    const originalLength = prompt.length;
    
    // Log prompt length
    console.log(`📏 Initial prompt length: ${originalLength} characters`);
    
    if (originalLength <= this.WARN_LENGTH) {
      return {
        optimizedPrompt: prompt,
        wasOptimized: false,
        originalLength,
        finalLength: originalLength,
        optimizations: []
      };
    }
    
    if (originalLength > this.WARN_LENGTH && originalLength <= this.MAX_LENGTH) {
      console.log(`⚠️ Prompt length warning: ${originalLength} chars (approaching limit)`);
    }
    
    if (originalLength > this.MAX_LENGTH) {
      console.log(`🚫 Prompt too long: ${originalLength} chars, optimizing...`);
      wasOptimized = true;
      
      // Strategy 1: Reduce quality suffix tier
      const qualitySegment = segments.find(s => s.priority === PromptPriority.QUALITY_SUFFIX);
      if (qualitySegment && qualitySegment.tier !== 'minimal') {
        const originalTier = qualitySegment.tier || 'detailed';
        qualitySegment.content = QUALITY_SUFFIXES.minimal;
        qualitySegment.tier = 'minimal';
        optimizations.push(`Reduced quality suffix from ${originalTier} to minimal`);
        
        prompt = segments.map(s => s.content).join(' ');
        console.log(`📉 After quality reduction: ${prompt.length} chars`);
      }
      
      // Strategy 2: Reduce character consistency tier
      if (prompt.length > this.MAX_LENGTH) {
        const characterSegment = segments.find(s => s.priority === PromptPriority.CHARACTER_DETAILS);
        if (characterSegment && characterSegment.tier !== 'minimal') {
          const originalTier = characterSegment.tier || 'detailed';
          characterSegment.content = CHARACTER_SUFFIXES.minimal;
          characterSegment.tier = 'minimal';
          optimizations.push(`Reduced character details from ${originalTier} to minimal`);
          
          prompt = segments.map(s => s.content).join(' ');
          console.log(`📉 After character reduction: ${prompt.length} chars`);
        }
      }
      
      // Strategy 3: Remove brand suffix
      if (prompt.length > this.MAX_LENGTH) {
        const brandIndex = segments.findIndex(s => s.priority === PromptPriority.BRAND_SUFFIX);
        if (brandIndex !== -1) {
          segments.splice(brandIndex, 1);
          optimizations.push('Removed brand suffix');
          
          prompt = segments.map(s => s.content).join(' ');
          console.log(`📉 After brand suffix removal: ${prompt.length} chars`);
        }
      }
      
      // Strategy 4: SMART style framework compression (protect technical terms)
      if (prompt.length > this.MAX_LENGTH) {
        const styleSegment = segments.find(s => s.priority === PromptPriority.STYLE_FRAMEWORK);
        if (styleSegment && styleSegment.canTruncate) {
          // Apply smart compression to style framework
          const compressedStyle = this.smartCompressStyleFramework(styleSegment.content);
          if (compressedStyle !== styleSegment.content) {
            styleSegment.content = compressedStyle;
            optimizations.push('Smart compressed style framework (preserved technical terms)');
            
            prompt = segments.map(s => s.content).join(' ');
            console.log(`📉 After smart style compression: ${prompt.length} chars`);
          }
        }
      }
      
      // Strategy 5: Hard truncation as last resort (preserve core content)
      if (prompt.length > this.MAX_LENGTH) {
        const coreContent = segments.find(s => s.priority === PromptPriority.CORE_CONTENT)?.content || '';
        const minimalQuality = QUALITY_SUFFIXES.minimal;
        
        const maxCoreLength = this.MAX_LENGTH - minimalQuality.length - 10; // Buffer
        const truncatedCore = coreContent.length > maxCoreLength 
          ? coreContent.substring(0, maxCoreLength) + '...'
          : coreContent;
          
        prompt = `${truncatedCore} ${minimalQuality}`;
        optimizations.push('Applied hard truncation preserving core content');
        
        console.log(`📉 After hard truncation: ${prompt.length} chars`);
      }
    }
    
    const finalLength = prompt.length;
    
    // Log optimization results
    if (wasOptimized) {
      console.log(`✅ Prompt optimized: ${originalLength} → ${finalLength} chars`);
      console.log(`🔧 Optimizations applied: ${optimizations.join(', ')}`);
    }
    
    return {
      optimizedPrompt: prompt,
      wasOptimized,
      originalLength,
      finalLength,
      optimizations
    };
  }
  
  /**
   * Creates prompt segments with proper priorities
   */
  static createSegments(
    coreContent: string,
    styleFramework: string,
    characterDetails: string,
    brandSuffix: string,
    qualityTier: 'minimal' | 'standard' | 'detailed' = 'standard'
  ): PromptSegment[] {
    return [
      {
        content: coreContent,
        priority: PromptPriority.CORE_CONTENT,
        canTruncate: false
      },
      {
        content: styleFramework,
        priority: PromptPriority.STYLE_FRAMEWORK,
        canTruncate: true
      },
      {
        content: characterDetails,
        priority: PromptPriority.CHARACTER_DETAILS,
        canTruncate: true,
        tier: 'standard'
      },
      {
        content: QUALITY_SUFFIXES[qualityTier],
        priority: PromptPriority.QUALITY_SUFFIX,
        canTruncate: true,
        tier: qualityTier
      },
      {
        content: brandSuffix,
        priority: PromptPriority.BRAND_SUFFIX,
        canTruncate: true
      }
    ];
  }
  
  /**
   * Quick length check for early validation
   */
  static validateLength(prompt: string): {
    isValid: boolean;
    length: number;
    status: 'safe' | 'warning' | 'exceeded';
  } {
    const length = prompt.length;
    
    if (length <= this.WARN_LENGTH) {
      return { isValid: true, length, status: 'safe' };
    } else if (length <= this.MAX_LENGTH) {
      return { isValid: true, length, status: 'warning' };
    } else {
      return { isValid: false, length, status: 'exceeded' };
    }
  }
  
  // Private helper methods for advanced optimization
  
  private static calculateContentComplexity(analysis: any): number {
    const totalElements = 
      analysis.coreElements.length +
      analysis.contextElements.length + 
      analysis.styleElements.length +
      analysis.characterElements.length +
      analysis.qualityElements.length;
    
    // Normalize complexity between 0-1
    return Math.min(totalElements / 50, 1.0);
  }
  
  private static rebuildPromptFromAnalysis(analysis: any): string {
    const segments = [
      ...analysis.coreElements,
      ...analysis.characterElements,
      ...analysis.contextElements,
      ...analysis.styleElements,
      ...analysis.qualityElements
    ];
    
    return segments.filter(Boolean).join(' ');
  }
  
  // NEW: Smart compression method that protects technical style terms
  private static smartCompressStyleFramework(styleContent: string): string {
    // Protected technical terms that should NEVER be removed
    const protectedTerms = [
      'painterly', '3D-rendered', 'volumetric lighting', 'cinematic framing',
      'photorealistic', 'masterful artistic technique', 'museum-quality artwork',
      'soft_painting', 'detailed_realism', 'award-winning illustration',
      'professional children\'s book illustration', 'exceptional detail',
      'rule_of_thirds', 'dynamic_angle', 'artistic_mastery'
    ];
    
    // Generic adjectives that can be removed for compression
    const removableAdjectives = [
      'beautiful', 'gorgeous', 'stunning', 'amazing', 'fantastic', 'wonderful',
      'excellent', 'perfect', 'incredible', 'breathtaking', 'magnificent'
    ];
    
    let compressed = styleContent;
    
    // Remove generic adjectives but preserve technical terms
    for (const adjective of removableAdjectives) {
      // Only remove if not part of a protected term
      const regex = new RegExp(`\\b${adjective}\\b(?!\\s+(?:${protectedTerms.join('|')}))`, 'gi');
      compressed = compressed.replace(regex, '');
    }
    
    // Clean up extra spaces
    compressed = compressed.replace(/\s+/g, ' ').trim();
    
    // If still too long, apply careful truncation while preserving protected terms
    if (compressed.length > 250) {
      const words = compressed.split(' ');
      const essential = words.filter(word => 
        protectedTerms.some(term => term.toLowerCase().includes(word.toLowerCase())) ||
        ['children', 'book', 'illustration', 'art', 'style'].some(key => word.toLowerCase().includes(key))
      );
      
      if (essential.length > 0 && essential.join(' ').length < compressed.length) {
        compressed = essential.join(' ');
      }
    }
    
    return compressed;
  }
}