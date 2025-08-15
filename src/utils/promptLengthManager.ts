// Smart Prompt Length Management System
// Phase 2: Tiered suffix system and intelligent truncation

export interface PromptTier {
  minimal: string;
  standard: string;
  detailed: string;
}

// Tiered suffix system for quality enhancements
export const QUALITY_SUFFIXES: PromptTier = {
  minimal: "high quality children's book illustration, safe content",
  standard: "high quality children's book illustration, vibrant colors, professional artwork, inclusive and diverse, text-free",
  detailed: "award-winning children's book illustration, ultra-realistic details, vibrant colors, perfect lighting, professional artwork, inclusive and diverse, completely text-free"
};

// Tiered character consistency descriptions  
export const CHARACTER_SUFFIXES: PromptTier = {
  minimal: "consistent character design",
  standard: "consistent character design, same appearance throughout",
  detailed: "consistent character design, same appearance throughout the story, accurate representation"
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
   * Validates and optimizes prompt length using intelligent truncation
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
      
      // Strategy 4: Truncate style framework if still too long
      if (prompt.length > this.MAX_LENGTH) {
        const styleSegment = segments.find(s => s.priority === PromptPriority.STYLE_FRAMEWORK);
        if (styleSegment && styleSegment.canTruncate) {
          const maxStyleLength = 200; // Reasonable limit for style framework
          if (styleSegment.content.length > maxStyleLength) {
            styleSegment.content = styleSegment.content.substring(0, maxStyleLength) + '...';
            optimizations.push('Truncated style framework');
            
            prompt = segments.map(s => s.content).join(' ');
            console.log(`📉 After style truncation: ${prompt.length} chars`);
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
}