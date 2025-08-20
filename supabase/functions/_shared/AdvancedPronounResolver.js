// Advanced Pronoun & Relationship Resolution System - Backend JavaScript Version
// Handles complex character relationships and pronoun resolution

class AdvancedPronounResolver {
  static relationshipRegistry = new Map();
  static interactionHistory = new Map();
  
  // Relationship detection patterns
  static RELATIONSHIP_PATTERNS = [
    { pattern: /(\w+)'s\s+(friend|best friend|buddy|pal)\s+(\w+)/gi, type: 'friend' },
    { pattern: /(\w+)\s+and\s+(\w+)\s+are\s+(friends|buddies|pals)/gi, type: 'friend' },
    { pattern: /(\w+)'s\s+(sister|brother|sibling)\s+(\w+)/gi, type: 'sibling' },
    { pattern: /(\w+)\s+and\s+(\w+)\s+are\s+(siblings|brother and sister)/gi, type: 'sibling' },
    { pattern: /(\w+)'s\s+(mom|dad|mother|father|parent)\s+(\w+)/gi, type: 'parent' },
    { pattern: /(\w+)'s\s+(classmate|teammate)\s+(\w+)/gi, type: 'classmate' },
    { pattern: /(\w+)\s+and\s+(\w+)\s+go\s+to\s+school\s+together/gi, type: 'classmate' },
    { pattern: /(\w+)'s\s+(pet|dog|cat|hamster|bird)\s+(\w+)/gi, type: 'pet' },
    { pattern: /(\w+)\s+and\s+(\w+)\s+played?\s+together/gi, type: 'companion' }
  ];

  // Pronoun patterns with context clues
  static PRONOUN_PATTERNS = [
    { pattern: /\b(they|them|their|theirs)\b/gi, type: 'plural' },
    { pattern: /\b(he|him|his)\b/gi, type: 'singular_male' },
    { pattern: /\b(she|her|hers)\b/gi, type: 'singular_female' },
    { pattern: /\b(it|its)\b/gi, type: 'singular_neutral' }
  ];

  static analyzeRelationships(sessionId, text, pageNumber) {
    const relationships = [];
    const sessionRelationships = this.getOrCreateSessionRelationships(sessionId);

    for (const rule of this.RELATIONSHIP_PATTERNS) {
      const matches = text.matchAll(rule.pattern);
      
      for (const match of matches) {
        let characterA, characterB;
        
        // Extract characters based on pattern structure
        if (match[0].includes("'s")) {
          // Pattern like "Emma's friend Sarah"
          characterA = match[1];
          characterB = match[3] || match[2]; // Handle different capture groups
        } else {
          // Pattern like "Emma and Sarah are friends"
          characterA = match[1];
          characterB = match[2];
        }

        if (characterA && characterB && characterA !== characterB) {
          const relationshipId = this.generateRelationshipId(characterA, characterB);
          
          const existingRelationship = sessionRelationships.find(r => 
            this.generateRelationshipId(r.characterA, r.characterB) === relationshipId
          );

          if (existingRelationship) {
            existingRelationship.lastMentionedPage = pageNumber;
            existingRelationship.context += ` | Page ${pageNumber}: ${match[0]}`;
          } else {
            const newRelationship = {
              characterA,
              characterB,
              relationshipType: rule.type,
              context: `Page ${pageNumber}: ${match[0]}`,
              firstMentionedPage: pageNumber,
              lastMentionedPage: pageNumber,
              interactionHistory: []
            };
            
            sessionRelationships.push(newRelationship);
            relationships.push(newRelationship);
            
            console.log(`🤝 Detected relationship: ${characterA} → ${characterB} (${rule.type})`);
          }
        }
      }
    }

    this.relationshipRegistry.set(sessionId, sessionRelationships);
    return relationships;
  }

  static trackCharacterInteraction(sessionId, characters, context, pageNumber) {
    if (characters.length < 2) return;

    const sessionHistory = this.getOrCreateInteractionHistory(sessionId);
    
    // Add new interaction
    sessionHistory.push({
      characters: [...characters].sort(), // Sort for consistent ordering
      context,
      page: pageNumber
    });

    // Keep only last 10 interactions to prevent memory bloat
    if (sessionHistory.length > 10) {
      sessionHistory.shift();
    }

    // Update relationship interaction history
    const sessionRelationships = this.relationshipRegistry.get(sessionId) || [];
    
    for (let i = 0; i < characters.length; i++) {
      for (let j = i + 1; j < characters.length; j++) {
        const charA = characters[i];
        const charB = characters[j];
        
        const relationship = sessionRelationships.find(r =>
          (r.characterA === charA && r.characterB === charB) ||
          (r.characterA === charB && r.characterB === charA)
        );
        
        if (relationship) {
          relationship.interactionHistory.push(context);
          if (relationship.interactionHistory.length > 5) {
            relationship.interactionHistory.shift();
          }
        }
      }
    }

    this.interactionHistory.set(sessionId, sessionHistory);
    console.log(`👥 Tracked interaction: ${characters.join(', ')} - ${context.slice(0, 50)}...`);
  }

  static resolveComplexPronouns(sessionId, text, pageNumber) {
    let resolvedText = text;
    const sessionRelationships = this.relationshipRegistry.get(sessionId) || [];
    const sessionHistory = this.interactionHistory.get(sessionId) || [];

    // Find pronoun contexts
    const pronounContexts = this.extractPronounContexts(resolvedText);
    
    for (const context of pronounContexts) {
      const resolution = this.resolvePronounInContext(
        context, 
        sessionRelationships, 
        sessionHistory, 
        pageNumber
      );
      
      if (resolution && resolution.confidence > 0.7) {
        // Replace the pronoun with the resolved characters
        const before = resolvedText.slice(0, context.position);
        const after = resolvedText.slice(context.position + context.pronoun.length);
        resolvedText = before + resolution.replacement + after;
        
        console.log(`🔄 Resolved \"${context.pronoun}\" → \"${resolution.replacement}\" (confidence: ${resolution.confidence})`);
      }
    }

    return resolvedText;
  }

  static getPronounResolutionSuggestions(sessionId, text) {
    const sessionRelationships = this.relationshipRegistry.get(sessionId) || [];
    const sessionHistory = this.interactionHistory.get(sessionId) || [];
    
    const pronounContexts = this.extractPronounContexts(text);
    const suggestions = [];

    for (const context of pronounContexts) {
      const resolution = this.resolvePronounInContext(context, sessionRelationships, sessionHistory, 1);
      
      if (resolution) {
        suggestions.push({
          pronoun: context.pronoun,
          suggestions: [resolution.replacement],
          confidence: resolution.confidence
        });
      }
    }

    return suggestions;
  }

  static getCharacterRelationships(sessionId) {
    return this.relationshipRegistry.get(sessionId) || [];
  }

  static getRecentInteractions(sessionId, limit = 5) {
    const history = this.interactionHistory.get(sessionId) || [];
    return history.slice(-limit);
  }

  static clearSession(sessionId) {
    this.relationshipRegistry.delete(sessionId);
    this.interactionHistory.delete(sessionId);
    console.log(`🗑️ Cleared pronoun resolution data for session: ${sessionId}`);
  }

  // Private helper methods
  static extractPronounContexts(text) {
    const contexts = [];
    const sentences = text.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      for (const pattern of this.PRONOUN_PATTERNS) {
        const matches = sentence.matchAll(pattern.pattern);
        
        for (const match of matches) {
          if (match.index !== undefined) {
            const nearbyCharacters = this.extractNearbyCharacters(sentence, match.index);
            
            contexts.push({
              pronoun: match[0],
              position: match.index,
              sentence: sentence.trim(),
              nearbyCharacters,
              potentialReferents: [],
              confidence: 0
            });
          }
        }
      }
    }

    return contexts;
  }

  static extractNearbyCharacters(sentence, pronounPosition) {
    // Simple name detection - capitalized words that aren't pronouns
    const words = sentence.split(/\s+/);
    const names = words.filter(word => 
      /^[A-Z][a-z]+$/.test(word) && 
      !['The', 'This', 'That', 'They', 'She', 'He', 'It'].includes(word)
    );
    
    return [...new Set(names)]; // Remove duplicates
  }

  static resolvePronounInContext(context, relationships, history, pageNumber) {
    // For plural pronouns (they, them), look for recent character pairs
    if (context.pronoun.toLowerCase().match(/^(they|them|their|theirs)$/)) {
      // Find most recent interaction with multiple characters
      const recentInteraction = history
        .filter(h => h.characters.length >= 2 && h.page < pageNumber)
        .pop();
      
      if (recentInteraction && recentInteraction.characters.length === 2) {
        return {
          replacement: recentInteraction.characters.join(' and '),
          confidence: 0.8
        };
      }

      // Fall back to relationship-based resolution
      if (relationships.length > 0) {
        const recentRelationship = relationships
          .filter(r => r.lastMentionedPage < pageNumber)
          .sort((a, b) => b.lastMentionedPage - a.lastMentionedPage)[0];
        
        if (recentRelationship) {
          return {
            replacement: `${recentRelationship.characterA} and ${recentRelationship.characterB}`,
            confidence: 0.7
          };
        }
      }
    }

    // For singular pronouns, use nearby characters or recent mentions
    if (context.nearbyCharacters.length === 1) {
      return {
        replacement: context.nearbyCharacters[0],
        confidence: 0.6
      };
    }

    return null;
  }

  static generateRelationshipId(characterA, characterB) {
    // Sort names for consistent ID regardless of order
    const sorted = [characterA, characterB].sort();
    return `${sorted[0]}_${sorted[1]}`;
  }

  static getOrCreateSessionRelationships(sessionId) {
    if (!this.relationshipRegistry.has(sessionId)) {
      this.relationshipRegistry.set(sessionId, []);
    }
    return this.relationshipRegistry.get(sessionId);
  }

  static getOrCreateInteractionHistory(sessionId) {
    if (!this.interactionHistory.has(sessionId)) {
      this.interactionHistory.set(sessionId, []);
    }
    return this.interactionHistory.get(sessionId);
  }

  // Advanced relationship inference
  static inferImplicitRelationships(sessionId, text) {
    const implicitRelationships = [];
    
    // Pattern: Characters doing activities together implies companionship
    const activityPatterns = [
      /(\w+)\s+and\s+(\w+)\s+(played|walked|ran|laughed|talked|shared|built|created)/gi,
      /(\w+)\s+helped\s+(\w+)/gi,
      /(\w+)\s+showed\s+(\w+)/gi
    ];

    for (const pattern of activityPatterns) {
      const matches = text.matchAll(pattern);
      
      for (const match of matches) {
        if (match[1] && match[2] && match[1] !== match[2]) {
          implicitRelationships.push({
            characterA: match[1],
            characterB: match[2],
            relationshipType: 'companion',
            context: `Inferred from activity: ${match[0]}`,
            firstMentionedPage: 1,
            lastMentionedPage: 1,
            interactionHistory: [match[0]]
          });
        }
      }
    }

    return implicitRelationships;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AdvancedPronounResolver };
}

// Also make it available as a global for direct import
globalThis.AdvancedPronounResolver = AdvancedPronounResolver;
