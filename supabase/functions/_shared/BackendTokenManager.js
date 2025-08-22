// Pure Deno Backend Token Manager - No Frontend Imports
// Optimizes prompts for AI generation with intelligent prioritization and compression

export const MAX_LENGTH = 2900; // Runware 3000 limit minus 100-char buffer
export const WARN_LENGTH = 2800;

export const PromptPriority = {
  HIGH: 1,
  MEDIUM: 2, 
  LOW: 3
};

export class BackendTokenManager {
  
  static optimizePrompt(promptSegments) {
    console.log('🔧 BackendTokenManager: Starting surgical prompt optimization');
    
    // Calculate total length
    const totalLength = promptSegments.reduce((sum, segment) => sum + segment.content.length, 0);
    
    if (totalLength <= MAX_LENGTH) {
      console.log(`✅ Prompt within limits: ${totalLength}/${MAX_LENGTH} characters - bypassing optimization`);
      return {
        optimizedPrompt: promptSegments.map(s => s.content).join(' '),
        originalLength: totalLength,
        finalLength: totalLength,
        applied: ['bypass-optimization'],
        truncated: false
      };
    }
    
    console.log(`⚠️ Prompt over limit: ${totalLength}/${MAX_LENGTH} characters - applying surgical optimization`);
    
    // Sort segments by priority (HIGH = 1, MEDIUM = 2, LOW = 3)
    const sortedSegments = [...promptSegments].sort((a, b) => a.priority - b.priority);
    
    let optimizedSegments = sortedSegments.map(segment => ({ ...segment }));
    let appliedOptimizations = [];
    
    // PHASE 1: Remove redundant spaces and punctuation
    if (this.calculateLength(optimizedSegments) > MAX_LENGTH) {
      optimizedSegments = optimizedSegments.map(segment => ({
        ...segment,
        content: segment.content.replace(/\s+/g, ' ').replace(/,\s*,/g, ',').trim()
      }));
      if (this.calculateLength(optimizedSegments) < totalLength) {
        appliedOptimizations.push('removed-redundant-spaces');
        console.log('🧹 Removed redundant spaces and punctuation');
      }
    }
    
    // PHASE 2: Target verbose adjectives in non-critical segments only
    if (this.calculateLength(optimizedSegments) > MAX_LENGTH) {
      optimizedSegments = optimizedSegments.map(segment => {
        if (segment.priority !== PromptPriority.HIGH && segment.canTruncate) {
          const compressed = this.smartCompress(segment.content);
          if (compressed !== segment.content) {
            appliedOptimizations.push('compressed-verbose-adjectives');
          }
          return { ...segment, content: compressed };
        }
        return segment;
      });
      console.log('🎯 Targeted verbose adjectives in non-critical segments');
    }
    
    // PHASE 3: Character-by-character trimming from longest segments while preserving meaning
    if (this.calculateLength(optimizedSegments) > MAX_LENGTH) {
      const overageAmount = this.calculateLength(optimizedSegments) - MAX_LENGTH;
      
      // Find the longest truncatable segments and trim them character by character
      const truncatableSegments = optimizedSegments
        .filter(s => s.canTruncate)
        .sort((a, b) => b.content.length - a.content.length);
      
      let remainingToTrim = overageAmount;
      
      for (const segment of truncatableSegments) {
        if (remainingToTrim <= 0) break;
        
        const segmentIndex = optimizedSegments.findIndex(s => s === segment);
        const originalLength = segment.content.length;
        
        // Determine minimum safe length based on content type
        let minLength = 30;
        if (segment.type === 'character-description') {
          minLength = 100; // Never truncate African American character descriptions below 100 chars
        } else if (segment.type === 'brand-suffix') {
          minLength = 20; // Brand suffixes need minimal truncation
        }
        
        const trimAmount = Math.min(remainingToTrim, Math.max(0, originalLength - minLength));
        
        if (trimAmount > 0) {
          const newLength = originalLength - trimAmount;
          optimizedSegments[segmentIndex].content = segment.content.substring(0, newLength).trim();
          remainingToTrim -= trimAmount;
          
          if (!appliedOptimizations.includes('surgical-character-trimming')) {
            appliedOptimizations.push('surgical-character-trimming');
          }
          
          console.log(`✂️ Surgically trimmed ${segment.type}: ${originalLength} → ${newLength} chars`);
        }
      }
    }
    
    // PHASE 4: Remove LOW priority segments only as last resort
    if (this.calculateLength(optimizedSegments) > MAX_LENGTH) {
      const beforeRemoval = optimizedSegments.length;
      optimizedSegments = optimizedSegments.filter(s => s.priority !== PromptPriority.LOW);
      if (optimizedSegments.length < beforeRemoval) {
        appliedOptimizations.push('removed-low-priority-last-resort');
        console.log('🗑️ Removed LOW priority segments as last resort');
      }
    }
    
    const finalLength = this.calculateLength(optimizedSegments);
    const finalPrompt = optimizedSegments.map(s => s.content).join(' ');
    
    console.log(`✅ Surgical optimization complete: ${totalLength} → ${finalLength} characters`);
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
    
      // ENHANCED PROTECTION: Strengthen cultural term protection with explicit "African-American" AND EMOTIONS
      const protectedTerms = [
        'children\'s book illustration', 'soft lighting', 'warm colors', 'character consistency',
        'runware:100@1', 'FlowMatchEulerDiscreteScheduler', 'African American', 'African-American', 'cultural elements',
        'visual state', 'style framework', 'scene context',
        'natural lighting for dark skin', 'culturally accurate', 'professional children\'s book digital illustration',
        // African American hair style terms to protect
        'detailed', 'textured', 'curly top fade', 'authentic facial features',
        // EMOTIONS - HIGH PRIORITY PROTECTION
        'emotions', 'emotional', 'feeling', 'joyful', 'excited', 'curious', 'proud', 'confident', 'surprised', 'worried', 'frustrated', 'sad', 'angry', 'scared', 'confused',
        'determined', 'hopeful', 'anxious', 'content', 'overwhelmed', 'peaceful', 'nervous', 'grateful', 'disappointed', 'amazed',
        'emotional state', 'emotional transition', 'emotional arc', 'emotional depth', 'emotional atmosphere',
        // Compound eye colors to protect from compression
        'hazel-green', 'hazel-brown', 'almond-shaped', 'deep-set', 'wide-set',
      // African American skin tone terms to protect (full list)
      'fair brown skin', 'light caramel skin', 'warm beige skin', 'peachy brown skin',
      'light bronze skin', 'warm honey skin', 'golden caramel skin', 'honey bronze skin',
      'caramel skin', 'deep amber skin', 'golden bronze skin', 'warm mahogany skin',
      'cool espresso skin', 'dark chocolate skin', 'deep umber skin', 'cool walnut skin',
      'rich coffee skin', 'deep chestnut skin', 'rich cocoa skin', 'deep ebony skin',
      // African American hair styles to protect from compression
      'twist out', 'bantu knots', 'braid out', 'cornrows', 'box braids', 'senegalese twists',
      'marley twists', 'havana twists', 'passion twists', 'sisterlocs', 'traditional locs',
      'fuller well-defined lips', 'naturally full lips', 'wider nasal bridge', 'fuller rounded nostrils',
      // Cultural pride elements
      'cultural pride symbols', 'community strength', 'rich heritage', 'strong family bonds',
      // African American facial features to protect
      'almond-shaped dark brown eyes', 'round rich brown eyes', 'deep-set hazel eyes',
      'prominent amber eyes', 'almond-shaped hazel-green eyes', 'expressive dark brown eyes',
      'broader noble nose', 'narrow refined nose', 'slightly upturned nose', 'well-proportioned nose'
    ];
    
    let compressed = text;
    
    // Check if this text contains protected African American descriptors
    const containsAfricanAmericanContent = protectedTerms.some(term => 
      compressed.toLowerCase().includes(term.toLowerCase())
    );
    
    if (containsAfricanAmericanContent) {
      console.log('🔒 Protecting African American cultural content from aggressive compression');
      // Apply minimal compression only to preserve cultural integrity
      compressed = compressed.replace(/\s+/g, ' ').trim();
      return compressed;
    }
    
    // Apply standard compression for non-cultural content
    const adjectives = ['very', 'quite', 'rather', 'extremely', 'highly', 'beautifully', 'perfectly'];
    for (const adj of adjectives) {
      const regex = new RegExp(`\\b${adj}\\s+`, 'gi');
      if (!protectedTerms.some(term => term.toLowerCase().includes(adj.toLowerCase()))) {
        compressed = compressed.replace(regex, '');
      }
    }
    
    // Remove duplicate phrases (with protection)
    const words = compressed.split(' ');
    const seen = new Set();
    const filtered = words.filter(word => {
      const clean = word.toLowerCase().replace(/[^\w]/g, '');
      if (clean.length < 3) return true; // Keep short words
      
      // Protect important cultural terms from deduplication
      if (protectedTerms.some(term => term.toLowerCase().includes(clean))) {
        return true;
      }
      
      if (seen.has(clean)) return false;
      seen.add(clean);
      return true;
    });
    
    compressed = filtered.join(' ');
    
    // Remove extra whitespace
    compressed = compressed.replace(/\s+/g, ' ').trim();
    
    return compressed;
  }
  
  static createPromptSegments(sceneContext, characterDescription, styleFramework, qualitySuffixes, visualDetails = '', isAfricanAmericanCharacter = false, culturalElements = '') {
    // Enhanced Cultural Intelligence for African American Characters
    const brandSuffixPriority = isAfricanAmericanCharacter ? PromptPriority.HIGH : PromptPriority.MEDIUM; // Changed from LOW to MEDIUM for general users
    const brandSuffixTruncatable = !isAfricanAmericanCharacter;
    
    // CRITICAL: Always protect character description with HIGH priority
    const characterPriority = PromptPriority.HIGH;
    const characterTruncatable = !isAfricanAmericanCharacter; // Never truncate African American character descriptions
    
    // NEW: Cultural elements handling - LOW priority for African American users, MEDIUM for others
    const culturalElementsPriority = isAfricanAmericanCharacter ? PromptPriority.LOW : PromptPriority.MEDIUM;
    const culturalElementsTruncatable = true; // Can always be compressed/removed
    
    if (isAfricanAmericanCharacter) {
      console.log('🔒 Enhanced Cultural Intelligence: Brand Suffix HIGH, Character Description HIGH, Settings HIGH, Cultural Elements LOW priority');
      console.log('👤 Character Description to Protect:', characterDescription);
    }
    
    const segments = [
      {
        content: sceneContext,
        priority: PromptPriority.HIGH, // Settings remain HIGH for African American users
        canTruncate: true,
        type: 'ai-scene-context'
      },
      {
        content: characterDescription, 
        priority: characterPriority,
        canTruncate: characterTruncatable,
        type: 'character-description'
      },
      // NEW: EMOTIONS GET HIGH PRIORITY
      {
        content: '', // Emotions will be added by the calling code
        priority: PromptPriority.HIGH,
        canTruncate: false, // Never truncate emotions
        type: 'emotions'
      },
      {
        content: styleFramework,
        priority: PromptPriority.LOW, // Changed from MEDIUM to LOW - allow aggressive compression
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
        priority: brandSuffixPriority,
        canTruncate: brandSuffixTruncatable,
        type: 'brand-suffix'
      }
    ];
    
    // Add cultural elements if provided
    if (culturalElements && culturalElements.length > 0) {
      segments.push({
        content: culturalElements,
        priority: culturalElementsPriority,
        canTruncate: culturalElementsTruncatable,
        type: 'cultural-elements'
      });
    }
    
    return segments.filter(segment => segment.content && segment.content.length > 0);
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