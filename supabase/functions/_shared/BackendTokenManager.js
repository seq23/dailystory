// Pure Deno Backend Token Manager - No Frontend Imports
// Optimizes prompts for AI generation with intelligent prioritization and compression

export const MAX_LENGTH = 2900; // Runware 3000 limit minus 100-char buffer
export const WARN_LENGTH = 2800;

// Phase 1: Priority System Alignment with AI Story Enhancer Schema
export const PromptPriority = {
  LOW: 1,       // Style framework, brand suffixes (can be removed)
  MEDIUM: 2,    // Character descriptions, visual details (can be compressed)  
  HIGH: 3,      // Objects, secondaryCharacters, sceneTransition (protected)
  CRITICAL: 4   // Setting, emotions, actions from AI schema (never truncate)
};

export class BackendTokenManager {
  
  static optimizePrompt(promptSegments) {
    console.log(`🚀 Starting optimization for ${promptSegments.length} segments`);
    
    const originalLength = this.calculateLength(promptSegments);
    console.log(`📏 Original total length: ${originalLength} characters`);
    
    if (originalLength <= MAX_LENGTH) {
      console.log(`✅ Prompt within limits, no optimization needed`);
      return {
        optimizedPrompt: promptSegments.map(segment => segment.content).join(' '),
        originalLength,
        finalLength: originalLength,
        applied: [],
        truncated: false
      };
    }

    console.log(`⚠️ Prompt exceeds ${MAX_LENGTH} limit, applying optimization...`);
    
    let segments = [...promptSegments];
    let applied = [];

    // Phase 1: Smart compression for MEDIUM and LOW priority segments
    console.log(`🔧 Phase 1: Smart compression...`);
    segments = segments.map(segment => {
      if ((segment.priority === PromptPriority.MEDIUM || segment.priority === PromptPriority.LOW) && segment.canTruncate) {
        const originalContent = segment.content;
        const compressedContent = this.smartCompress(segment.content);
        if (compressedContent !== originalContent) {
          console.log(`📝 Compressed ${segment.type}: ${originalContent.length} → ${compressedContent.length} chars`);
          applied.push(`compressed_${segment.type}`);
        }
        return { ...segment, content: compressedContent };
      }
      return segment;
    });

    let currentLength = this.calculateLength(segments);
    console.log(`📊 After compression: ${currentLength} characters`);

    // Phase 2: Remove LOW priority segments if still over limit
    if (currentLength > MAX_LENGTH) {
      console.log(`🔧 Phase 2: Removing LOW priority segments...`);
      const lowPrioritySegments = segments.filter(s => s.priority === PromptPriority.LOW && s.canTruncate);
      for (const segment of lowPrioritySegments) {
        segments = segments.filter(s => s !== segment);
        applied.push(`removed_${segment.type}`);
        console.log(`🗑️ Removed ${segment.type} (${segment.content.length} chars)`);
        currentLength = this.calculateLength(segments);
        if (currentLength <= MAX_LENGTH) break;
      }
    }

    // Phase 3: Truncate MEDIUM priority segments if still over limit
    if (currentLength > MAX_LENGTH) {
      console.log(`🔧 Phase 3: Truncating MEDIUM priority segments...`);
      segments = segments.map(segment => {
        if (segment.priority === PromptPriority.MEDIUM && segment.canTruncate && currentLength > MAX_LENGTH) {
          const targetReduction = Math.min(segment.content.length * 0.3, currentLength - MAX_LENGTH);
          const newLength = Math.max(segment.content.length - targetReduction, segment.content.length * 0.5);
          const truncatedContent = segment.content.substring(0, newLength);
          console.log(`✂️ Truncated ${segment.type}: ${segment.content.length} → ${newLength} chars`);
          applied.push(`truncated_${segment.type}`);
          return { ...segment, content: truncatedContent };
        }
        return segment;
      });
    }

    const finalLength = this.calculateLength(segments);
    const finalPrompt = segments.map(segment => segment.content).filter(content => content.length > 0).join(' ');
    
    console.log(`📈 Optimization complete: ${originalLength} → ${finalLength} characters`);
    console.log(`🔧 Applied optimizations: ${applied.join(', ')}`);

    return {
      optimizedPrompt: finalPrompt,
      originalLength,
      finalLength,
      applied,
      truncated: applied.some(opt => opt.includes('truncated'))
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
  
  static extractEmotionContent(sceneContext, characterDescription) {
    // Enhanced emotion detection and processing
    const emotionKeywords = {
      happy: ['smiling', 'happy', 'joyful', 'cheerful', 'delighted', 'elated', 'gleeful', 'content', 'beaming'],
      sad: ['crying', 'sad', 'upset', 'disappointed', 'melancholy', 'sorrowful', 'dejected', 'downcast'],
      excited: ['excited', 'thrilled', 'enthusiastic', 'eager', 'animated', 'energetic', 'vibrant'],
      scared: ['scared', 'afraid', 'frightened', 'nervous', 'worried', 'anxious', 'fearful', 'timid'],
      angry: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'livid'],
      surprised: ['surprised', 'shocked', 'amazed', 'astonished', 'startled', 'bewildered'],
      curious: ['curious', 'wondering', 'questioning', 'inquisitive', 'intrigued'],
      determined: ['determined', 'focused', 'resolved', 'committed', 'steadfast', 'persistent']
    };
    
    const textToAnalyze = `${sceneContext} ${characterDescription}`.toLowerCase();
    const detectedEmotions = [];
    
    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      if (keywords.some(keyword => textToAnalyze.includes(keyword))) {
        detectedEmotions.push(emotion);
      }
    });
    
    if (detectedEmotions.length > 0) {
      return `expressing ${detectedEmotions.join(' and ')} emotions`;
    }
    
    return 'with natural emotional expression';
  }
  
  static createPromptSegments(sceneContext, characterDescription, styleFramework, qualitySuffixes, visualDetails = '', isAfricanAmericanCharacter = false, culturalElements = '', aiSchemaData = null) {
    // Phase 1 & 5: Enhanced Priority System + African American Character Protection
    const brandSuffixPriority = isAfricanAmericanCharacter ? PromptPriority.HIGH : PromptPriority.LOW;
    const brandSuffixTruncatable = !isAfricanAmericanCharacter;
    
    // Phase 3: AI Schema Integration - Create schema-aware segments
    let segments = [];

    // Phase 1: CRITICAL PRIORITY - AI Story Enhancer Schema Elements
    if (aiSchemaData?.setting) {
      segments.push({
        content: `${aiSchemaData.setting.primaryLocation || ''} ${aiSchemaData.setting.secondaryLocation || ''} ${aiSchemaData.setting.timeOfDay || ''} ${aiSchemaData.setting.weather || ''} ${aiSchemaData.setting.lighting || ''}`.trim(),
        priority: PromptPriority.CRITICAL,
        canTruncate: false,
        type: 'ai-setting'
      });
    }

    if (aiSchemaData?.emotions) {
      segments.push({
        content: aiSchemaData.emotions,
        priority: PromptPriority.CRITICAL,
        canTruncate: false,
        type: 'ai-emotions'
      });
    } else {
      // Fallback emotion extraction
      segments.push({
        content: this.extractEmotionContent(sceneContext, characterDescription),
        priority: PromptPriority.CRITICAL,
        canTruncate: false,
        type: 'emotions-extracted'
      });
    }

    if (aiSchemaData?.actions?.length > 0) {
      segments.push({
        content: aiSchemaData.actions.join(', '),
        priority: PromptPriority.CRITICAL,
        canTruncate: false,
        type: 'ai-actions'
      });
    }

    // HIGH PRIORITY - Secondary Schema Elements
    if (aiSchemaData?.objects?.length > 0) {
      segments.push({
        content: aiSchemaData.objects.join(', '),
        priority: PromptPriority.HIGH,
        canTruncate: true,
        type: 'ai-objects'
      });
    }

    if (aiSchemaData?.secondaryCharacters?.length > 0) {
      const secondaryChars = aiSchemaData.secondaryCharacters.map(char => `${char.name} (${char.role})`).join(', ');
      segments.push({
        content: secondaryChars,
        priority: PromptPriority.HIGH,
        canTruncate: true,
        type: 'ai-secondary-characters'
      });
    }

    if (aiSchemaData?.sceneTransition) {
      segments.push({
        content: aiSchemaData.sceneTransition,
        priority: PromptPriority.HIGH,
        canTruncate: true,
        type: 'ai-scene-transition'
      });
    }

    // MEDIUM PRIORITY - Character and Visual Details
    segments.push(
      {
        content: sceneContext || '',
        priority: PromptPriority.MEDIUM,
        canTruncate: true,
        type: 'scene-context'
      },
      {
        content: characterDescription || '',
        priority: isAfricanAmericanCharacter ? PromptPriority.CRITICAL : PromptPriority.MEDIUM,
        canTruncate: !isAfricanAmericanCharacter,
        type: 'character-description'
      },
      {
        content: visualDetails || '',
        priority: PromptPriority.MEDIUM,
        canTruncate: true,
        type: 'visual-details'
      }
    );

    // LOW PRIORITY - Style and Brand Elements (except African American protection)
    segments.push(
      {
        content: styleFramework || '',
        priority: isAfricanAmericanCharacter ? PromptPriority.MEDIUM : PromptPriority.LOW,
        canTruncate: !isAfricanAmericanCharacter,
        type: 'framework-concise-prompt'
      },
      {
        content: qualitySuffixes || '',
        priority: brandSuffixPriority,
        canTruncate: brandSuffixTruncatable,
        type: 'brand-suffix'
      }
    );

    // Add cultural elements if provided  
    if (culturalElements && culturalElements.length > 0) {
      segments.push({
        content: culturalElements,
        priority: isAfricanAmericanCharacter ? PromptPriority.CRITICAL : PromptPriority.LOW,
        canTruncate: !isAfricanAmericanCharacter,
        type: 'cultural-elements'
      });
    }

    // Filter out empty segments and return
    segments = segments.filter(segment => segment.content && segment.content.trim().length > 0);
    
    // Phase 4: Enhanced Logging and Monitoring
    console.log(`🔧 Created ${segments.length} prompt segments with priorities:`, segments.map(s => `${s.type}(${s.priority})`));
    if (isAfricanAmericanCharacter) {
      console.log('🔒 African American Character Protection: Enhanced priorities applied');
    }
    
    return segments;
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