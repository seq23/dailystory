// Pure Deno Backend Token Manager - No Frontend Imports
// Optimizes prompts for AI generation with intelligent prioritization and compression

export const MAX_LENGTH = 2900; // Runware 3000 limit minus 100-char buffer
export const WARN_LENGTH = 2800;

// NEW MASTER PLAN: Priority System for Streamlined 3-Field Schema
export const PromptPriority = {
  LOW: 1,       // Style framework, cultural elements (can be removed)
  MEDIUM: 2,    // Characters, cultural setting, visual components (can be compressed)  
  HIGH: 3,      // Brand suffix for ALL characters, visual components sub-fields (protected)
  CRITICAL: 4   // Primary scene (never truncate)
};

export class BackendTokenManager {
  
  /**
   * PHASE 1 FIX: Emergency truncation with proper parameters
   * @param {string} prompt - The prompt to truncate
   * @param {string} sessionId - Session identifier
   * @param {number} pageNumber - Page number
   * @returns {string} - Truncated prompt
   */
  static emergencyTruncate(prompt, sessionId = 'unknown', pageNumber = 0) {
    console.log(`🚨 EMERGENCY TRUNCATION - Session: ${sessionId}, Page: ${pageNumber}, Original Length: ${prompt.length}`);
    const truncated = prompt.substring(0, MAX_LENGTH - 100);
    console.log(`✂️ Truncated to ${truncated.length} characters`);
    return truncated;
  }
  
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
    
      // ENHANCED PROTECTION: NEW AVATAR DESCRIPTIONS + EMOTIONS (African American terms removed)
      const protectedTerms = [
        'children\'s book illustration', 'soft lighting', 'warm colors', 'character consistency',
        'runware:100@1', 'FlowMatchEulerDiscreteScheduler', 'cultural elements',
        // NEW: Protected avatar descriptions with skin tones
        'fair skin white boy with red hair', 'fair skin white girl with red hair',
        'white boy with blonde hair', 'white girl with blonde hair',
        'medium skin white boy with brown hair', 'medium skin white girl with brown hair',
        'olive skin white boy with black hair', 'olive skin white girl with black hair',
        'black boy', 'black girl',
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
        // NEW MASTER PLAN: Direct Avatar Descriptions to Protect
        'fair skin white boy with red hair', 'fair skin white girl with red hair',
        'white boy with blonde hair', 'white girl with blonde hair',
        'medium skin white boy with brown hair', 'medium skin white girl with brown hair',
        'olive skin white boy with black hair', 'olive skin white girl with black hair',
        'black boy', 'black girl',
        // Cultural pride elements
        'cultural pride symbols', 'community strength', 'rich heritage', 'strong family bonds'
    ];
    
    let compressed = text;
    
    // Check if this text contains protected avatar descriptors
    const containsAvatarContent = protectedTerms.some(term => 
      compressed.toLowerCase().includes(term.toLowerCase())
    );
    
    if (containsAvatarContent) {
      console.log('🔒 Protecting avatar cultural content from aggressive compression');
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
  
  static createPromptSegments(sceneContext, characterDescription, styleFramework, qualitySuffixes, visualDetails = '', culturalElements = '', aiSchemaData = null, secondaryCharacters = '') {
    // NEW MASTER PLAN: Brand suffix HIGH priority for ALL English speakers
    const brandSuffixPriority = PromptPriority.HIGH; // All English speakers get HIGH priority
    const brandSuffixTruncatable = false; // Never truncate brand suffix
    
    // NEW MASTER PLAN: Streamlined 3-Field Schema Integration
    let segments = [];

    // CRITICAL PRIORITY - Primary Scene (never truncate)
    if (aiSchemaData?.primaryScene) {
      segments.push({
        content: aiSchemaData.primaryScene,
        priority: PromptPriority.CRITICAL,
        canTruncate: false,
        type: 'primary-scene'
      });
    }

    // MEDIUM PRIORITY - Characters and Visual Components
    if (aiSchemaData?.characters) {
      segments.push({
        content: aiSchemaData.characters,
        priority: PromptPriority.MEDIUM,
        canTruncate: true,
        type: 'characters'
      });
    }

    // HIGH PRIORITY - Visual Components Sub-fields
    if (aiSchemaData?.visualComponents) {
      const vc = aiSchemaData.visualComponents;
      if (vc.sceneType) segments.push({ content: vc.sceneType, priority: PromptPriority.HIGH, canTruncate: false, type: 'scene-type' });
      if (vc.lighting) segments.push({ content: vc.lighting, priority: PromptPriority.HIGH, canTruncate: false, type: 'lighting' });
      if (vc.keyObjects) segments.push({ content: vc.keyObjects, priority: PromptPriority.HIGH, canTruncate: false, type: 'key-objects' });
      if (vc.setting) segments.push({ content: vc.setting, priority: PromptPriority.MEDIUM, canTruncate: true, type: 'cultural-setting' });
      if (vc.mood) segments.push({ content: vc.mood, priority: PromptPriority.HIGH, canTruncate: false, type: 'mood' });
    }

    // Fallback to legacy parameters if new schema not available
    if (!aiSchemaData?.primaryScene && sceneContext) {
      segments.push({
        content: sceneContext,
        priority: PromptPriority.MEDIUM,
        canTruncate: true,
        type: 'scene-context-legacy'
      });
    }

    if (!aiSchemaData?.characters && characterDescription) {
      segments.push({
        content: characterDescription,
        priority: PromptPriority.MEDIUM,
        canTruncate: true,
        type: 'character-description-legacy'
      });
    }

    // LOW PRIORITY - Style Framework and Cultural Elements
    if (styleFramework) {
      segments.push({
        content: styleFramework,
        priority: PromptPriority.LOW,
        canTruncate: true,
        type: 'style-framework'
      });
    }

    // HIGH PRIORITY - Brand Suffix for ALL characters (NEW MASTER PLAN)
    if (qualitySuffixes) {
      segments.push({
        content: qualitySuffixes,
        priority: brandSuffixPriority,
        canTruncate: brandSuffixTruncatable,
        type: 'brand-suffix'
      });
    }

    // LOW PRIORITY - Cultural Elements (NEW MASTER PLAN)
    if (culturalElements && culturalElements.length > 0) {
      segments.push({
        content: culturalElements,
        priority: PromptPriority.LOW,
        canTruncate: true,
        type: 'cultural-elements'
      });
    }

    // PHASE 4: Enhanced Secondary Characters Processing
    if (secondaryCharacters && secondaryCharacters.trim().length > 0) {
      const processedSecondaryCharacters = this.optimizeSecondaryCharacters(secondaryCharacters);
      segments.push({
        content: processedSecondaryCharacters,
        priority: PromptPriority.MEDIUM,
        canTruncate: true,
        type: 'SECONDARY_CHARACTERS'
      });
    }

    // Filter out empty segments and return
    segments = segments.filter(segment => segment.content && segment.content.trim().length > 0);
    
    // Phase 4: Enhanced Logging and Monitoring
    console.log(`🔧 Created ${segments.length} prompt segments with priorities:`, segments.map(s => `${s.type}(${s.priority})`));
    
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
  
  /**
   * PHASE 4: Optimize secondary characters with intelligent prioritization
   */
  static optimizeSecondaryCharacters(secondaryCharacters) {
    if (!secondaryCharacters || secondaryCharacters.length < 100) {
      return secondaryCharacters;
    }
    
    console.log(`🎭 Optimizing secondary characters: ${secondaryCharacters.length} chars`);
    
    // Parse character mentions and prioritize by importance
    const characterPriorities = {
      'family_': 3,      // Family members (highest priority)
      'cultural_': 3,    // Cultural characters
      'community_': 2,   // Community figures
      'named_': 2,       // Named characters
      'character_animal': 1 // Character animals (lower priority)
    };
    
    // Extract and prioritize character mentions
    const characterMentions = [];
    const lines = secondaryCharacters.split(/[,;]/).map(line => line.trim()).filter(line => line.length > 0);
    
    lines.forEach(line => {
      let priority = 1; // Default priority
      
      // Determine priority based on character type
      Object.entries(characterPriorities).forEach(([type, typePriority]) => {
        if (line.toLowerCase().includes(type)) {
          priority = Math.max(priority, typePriority);
        }
      });
      
      // Cultural name protection
      const culturalNames = ['ahmed', 'fatima', 'mohammed', 'aisha', 'omar', 'amara', 'kofi', 'akua', 'priya', 'raj', 'chen', 'li', 'juan', 'maria', 'rosa', 'diego'];
      if (culturalNames.some(name => line.toLowerCase().includes(name))) {
        priority = 3;
      }
      
      characterMentions.push({ content: line, priority });
    });
    
    // Sort by priority (highest first)
    characterMentions.sort((a, b) => b.priority - a.priority);
    
    // Smart truncation - keep high priority characters, intelligently reduce low priority ones
    let optimized = '';
    let currentLength = 0;
    const maxLength = Math.min(500, secondaryCharacters.length * 0.8); // Max 500 chars or 80% of original
    
    for (const mention of characterMentions) {
      const proposedLength = currentLength + mention.content.length + 2; // +2 for separator
      
      if (proposedLength <= maxLength) {
        if (optimized.length > 0) optimized += ', ';
        optimized += mention.content;
        currentLength = proposedLength;
      } else if (mention.priority >= 3) {
        // Force include high priority characters, but compress them
        const compressed = this.compressCharacterMention(mention.content);
        if (optimized.length > 0) optimized += ', ';
        optimized += compressed;
        currentLength += compressed.length + 2;
      } else {
        break; // Skip lower priority characters if space is limited
      }
    }
    
    if (optimized.length < secondaryCharacters.length) {
      console.log(`📉 Secondary characters optimized: ${secondaryCharacters.length} → ${optimized.length} chars`);
    }
    
    return optimized || secondaryCharacters.substring(0, maxLength);
  }
  
  /**
   * PHASE 4: Compress individual character mentions while preserving meaning
   */
  static compressCharacterMention(mention) {
    let compressed = mention;
    
    // Remove redundant descriptors but preserve cultural elements
    const redundantPhrases = [
      'also present', 'also in scene', 'appears in', 'is also',
      'can be seen', 'is visible', 'is shown'
    ];
    
    redundantPhrases.forEach(phrase => {
      const regex = new RegExp(phrase, 'gi');
      compressed = compressed.replace(regex, '');
    });
    
    // Compress common relationship terms
    const compressionMap = {
      'grandmother': 'grandma',
      'grandfather': 'grandpa',
      'little sister': 'sister',
      'little brother': 'brother',
      'school teacher': 'teacher',
      'class teacher': 'teacher',
      'family friend': 'friend',
      'close friend': 'friend'
    };
    
    Object.entries(compressionMap).forEach(([original, compressed_term]) => {
      const regex = new RegExp(original, 'gi');
      compressed = compressed.replace(regex, compressed_term);
    });
    
    // Clean up extra whitespace
    compressed = compressed.replace(/\s+/g, ' ').trim();
    
    return compressed;
  }
}