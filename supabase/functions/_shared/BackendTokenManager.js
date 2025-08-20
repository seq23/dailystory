// Pure Deno Backend Token Manager - No Frontend Imports
// Optimizes prompts for AI generation with intelligent prioritization and compression

export const MAX_LENGTH = 2800;
export const WARN_LENGTH = 2500;

export const PromptPriority = {
  HIGH: 1,
  MEDIUM: 2, 
  LOW: 3
};

export class BackendTokenManager {
  
  static optimizePrompt(promptSegments) {
    console.log('🔧 BackendTokenManager: Starting prompt optimization');
    
    // Calculate total length
    const totalLength = promptSegments.reduce((sum, segment) => sum + segment.content.length, 0);
    
    if (totalLength <= MAX_LENGTH) {
      console.log(`✅ Prompt within limits: ${totalLength}/${MAX_LENGTH} characters`);
      return {
        optimizedPrompt: promptSegments.map(s => s.content).join(' '),
        originalLength: totalLength,
        finalLength: totalLength,
        applied: [],
        truncated: false
      };
    }
    
    console.log(`⚠️ Prompt over limit: ${totalLength}/${MAX_LENGTH} characters - optimizing`);
    
    // Sort segments by priority (HIGH = 1, MEDIUM = 2, LOW = 3)
    const sortedSegments = [...promptSegments].sort((a, b) => a.priority - b.priority);
    
    let optimizedSegments = sortedSegments.map(segment => ({ ...segment }));
    let appliedOptimizations = [];
    
    // Strategy 1: Remove LOW priority segments
    if (this.calculateLength(optimizedSegments) > MAX_LENGTH) {
      const beforeRemoval = optimizedSegments.length;
      optimizedSegments = optimizedSegments.filter(s => s.priority !== PromptPriority.LOW);
      if (optimizedSegments.length < beforeRemoval) {
        appliedOptimizations.push('removed-low-priority');
        console.log('🗑️ Removed LOW priority segments');
      }
    }
    
    // Strategy 2: Compress MEDIUM priority segments
    if (this.calculateLength(optimizedSegments) > MAX_LENGTH) {
      optimizedSegments = optimizedSegments.map(segment => {
        if (segment.priority === PromptPriority.MEDIUM && segment.canTruncate) {
          const compressed = this.smartCompress(segment.content);
          if (compressed !== segment.content) {
            appliedOptimizations.push('compressed-medium-priority');
          }
          return { ...segment, content: compressed };
        }
        return segment;
      });
      console.log('🗜️ Compressed MEDIUM priority segments');
    }
    
    // Strategy 3: Progressive truncation of truncatable segments
    if (this.calculateLength(optimizedSegments) > MAX_LENGTH) {
      const overageAmount = this.calculateLength(optimizedSegments) - MAX_LENGTH;
      const truncatableSegments = optimizedSegments.filter(s => s.canTruncate);
      
      if (truncatableSegments.length > 0) {
        const truncationPerSegment = Math.ceil(overageAmount / truncatableSegments.length);
        
        optimizedSegments = optimizedSegments.map(segment => {
          if (segment.canTruncate && segment.content.length > truncationPerSegment) {
            const newLength = Math.max(segment.content.length - truncationPerSegment, 50);
            const truncated = segment.content.substring(0, newLength) + '...';
            if (truncated !== segment.content) {
              appliedOptimizations.push('progressive-truncation');
            }
            return { ...segment, content: truncated };
          }
          return segment;
        });
        console.log('✂️ Applied progressive truncation');
      }
    }
    
    // Strategy 4: Emergency truncation of HIGH priority if still over limit
    if (this.calculateLength(optimizedSegments) > MAX_LENGTH) {
      const overageAmount = this.calculateLength(optimizedSegments) - MAX_LENGTH;
      
      for (let i = optimizedSegments.length - 1; i >= 0; i--) {
        if (optimizedSegments[i].canTruncate) {
          const currentLength = optimizedSegments[i].content.length;
          const newLength = Math.max(currentLength - overageAmount, 30);
          optimizedSegments[i].content = optimizedSegments[i].content.substring(0, newLength) + '...';
          appliedOptimizations.push('emergency-truncation');
          console.log('🚨 Applied emergency truncation');
          break;
        }
      }
    }
    
    const finalLength = this.calculateLength(optimizedSegments);
    const finalPrompt = optimizedSegments.map(s => s.content).join(' ');
    
    console.log(`✅ Optimization complete: ${totalLength} → ${finalLength} characters`);
    console.log(`🔧 Applied: ${appliedOptimizations.join(', ')}`);
    
    return {
      optimizedPrompt: finalPrompt,
      originalLength: totalLength,
      finalLength: finalLength,
      applied: appliedOptimizations,
      truncated: finalLength < totalLength
    };
  }
  
  static calculateLength(segments) {
    return segments.reduce((sum, segment) => sum + segment.content.length, 0);
  }
  
  static smartCompress(text) {
    if (!text || text.length < 100) return text;
    
    // Protect technical terms and important descriptors
    const protectedTerms = [
      'children\'s book illustration', 'soft lighting', 'warm colors', 'character consistency',
      'runware:100@1', 'FlowMatchEulerDiscreteScheduler', 'African American', 'cultural elements',
      'visual state', 'style framework', 'scene context',
      'natural lighting for dark skin', 'culturally accurate', 'professional children\'s book digital illustration',
      // African American hair style terms to protect
      'detailed', 'textured', 'curly top fade'
    ];
    
    let compressed = text;
    
    // Remove redundant adjectives but preserve protected terms
    const adjectives = ['very', 'quite', 'rather', 'extremely', 'highly', 'beautifully', 'perfectly'];
    for (const adj of adjectives) {
      // Only remove if not part of protected terms
      const regex = new RegExp(`\\b${adj}\\s+`, 'gi');
      if (!protectedTerms.some(term => term.toLowerCase().includes(adj.toLowerCase()))) {
        compressed = compressed.replace(regex, '');
      }
    }
    
    // Remove duplicate phrases
    const words = compressed.split(' ');
    const seen = new Set();
    const filtered = words.filter(word => {
      const clean = word.toLowerCase().replace(/[^\w]/g, '');
      if (clean.length < 3) return true; // Keep short words
      if (seen.has(clean)) return false;
      seen.add(clean);
      return true;
    });
    
    compressed = filtered.join(' ');
    
    // Remove extra whitespace
    compressed = compressed.replace(/\s+/g, ' ').trim();
    
    return compressed;
  }
  
  static createPromptSegments(sceneContext, characterDescription, styleFramework, qualitySuffixes, visualDetails = '') {
    return [
      {
        content: sceneContext,
        priority: PromptPriority.HIGH,
        canTruncate: true,
        type: 'ai-scene-context'
      },
      {
        content: characterDescription, 
        priority: PromptPriority.HIGH,
        canTruncate: false,
        type: 'character-description'
      },
      {
        content: styleFramework,
        priority: PromptPriority.MEDIUM,
        canTruncate: true,
        type: 'framework-concise-prompt'
      },
      {
        content: visualDetails,
        priority: PromptPriority.MEDIUM,
        canTruncate: true,
        type: 'visual-details'
      },
      {
        content: qualitySuffixes,
        priority: PromptPriority.LOW,
        canTruncate: true,
        type: 'brand-suffix'
      }
    ].filter(segment => segment.content && segment.content.length > 0);
  }
  
  static validateLength(prompt) {
    const length = prompt.length;
    
    if (length > MAX_LENGTH) {
      return {
        valid: false,
        severity: 'error',
        message: `Prompt exceeds maximum length: ${length}/${MAX_LENGTH}`,
        recommendation: 'Apply optimization strategies'
      };
    }
    
    if (length > WARN_LENGTH) {
      return {
        valid: true,
        severity: 'warning', 
        message: `Prompt approaching limit: ${length}/${MAX_LENGTH}`,
        recommendation: 'Consider optimization for better performance'
      };
    }
    
    return {
      valid: true,
      severity: 'info',
      message: `Prompt within optimal range: ${length}/${MAX_LENGTH}`,
      recommendation: 'No optimization needed'
    };
  }
}