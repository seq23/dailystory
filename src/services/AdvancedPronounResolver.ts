// Advanced Pronoun & Relationship Resolution System
// Handles complex character relationships and pronoun resolution

export interface CharacterRelationship {
  characterA: string;
  characterB: string;
  relationshipType: 'friend' | 'sibling' | 'parent' | 'classmate' | 'neighbor' | 'pet' | 'companion';
  context: string;
  firstMentionedPage: number;
  lastMentionedPage: number;
  interactionHistory: string[];
}

export interface PronounContext {
  pronoun: string;
  position: number;
  sentence: string;
  nearbyCharacters: string[];
  potentialReferents: string[];
  confidence: number;
}

export class AdvancedPronounResolver {
  private static relationshipRegistry: Map<string, CharacterRelationship[]> = new Map();
  private static interactionHistory: Map<string, Array<{ characters: string[], context: string, page: number }>> = new Map();
  
  // Relationship detection patterns
  private static readonly RELATIONSHIP_PATTERNS = [
    { pattern: /(\w+)'s\s+(friend|best friend|buddy|pal)\s+(\w+)/gi, type: 'friend' as const },
    { pattern: /(\w+)\s+and\s+(\w+)\s+are\s+(friends|buddies|pals)/gi, type: 'friend' as const },
    { pattern: /(\w+)'s\s+(sister|brother|sibling)\s+(\w+)/gi, type: 'sibling' as const },
    { pattern: /(\w+)\s+and\s+(\w+)\s+are\s+(siblings|brother and sister)/gi, type: 'sibling' as const },
    { pattern: /(\w+)'s\s+(mom|dad|mother|father|parent)\s+(\w+)/gi, type: 'parent' as const },
    { pattern: /(\w+)'s\s+(classmate|teammate)\s+(\w+)/gi, type: 'classmate' as const },
    { pattern: /(\w+)\s+and\s+(\w+)\s+go\s+to\s+school\s+together/gi, type: 'classmate' as const },
    { pattern: /(\w+)'s\s+(pet|dog|cat|hamster|bird)\s+(\w+)/gi, type: 'pet' as const },
    { pattern: /(\w+)\s+and\s+(\w+)\s+played?\s+together/gi, type: 'companion' as const }
  ];

  // Pronoun patterns with context clues
  private static readonly PRONOUN_PATTERNS = [
    { pattern: /\b(they|them|their|theirs)\b/gi, type: 'plural' },
    { pattern: /\b(he|him|his)\b/gi, type: 'singular_male' },
    { pattern: /\b(she|her|hers)\b/gi, type: 'singular_female' },
    { pattern: /\b(it|its)\b/gi, type: 'singular_neutral' }
  ];

  static analyzeRelationships(sessionId: string, text: string, pageNumber: number): CharacterRelationship[] {
    const relationships: CharacterRelationship[] = [];
    const sessionRelationships = this.getOrCreateSessionRelationships(sessionId);

    for (const rule of this.RELATIONSHIP_PATTERNS) {
      const matches = text.matchAll(rule.pattern);
      
      for (const match of matches) {
        let characterA: string, characterB: string;
        
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
            const newRelationship: CharacterRelationship = {
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

  static trackCharacterInteraction(sessionId: string, characters: string[], context: string, pageNumber: number): void {
    if (characters.length < 2) return;

    const sessionHistory = this.getOrCreateInteractionHistory(sessionId);
    
    // Add new interaction
    sessionHistory.push({
      characters: characters.sort(), // Sort for consistent ordering
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

  static resolveComplexPronouns(sessionId: string, text: string, pageNumber: number): string {
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

  static getPronounResolutionSuggestions(sessionId: string, text: string): Array<{ pronoun: string; suggestions: string[]; confidence: number }> {
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

  static getCharacterRelationships(sessionId: string): CharacterRelationship[] {
    return this.relationshipRegistry.get(sessionId) || [];
  }

  static getRecentInteractions(sessionId: string, limit: number = 5): Array<{ characters: string[], context: string, page: number }> {
    const history = this.interactionHistory.get(sessionId) || [];
    return history.slice(-limit);
  }

  static clearSession(sessionId: string): void {
    this.relationshipRegistry.delete(sessionId);
    this.interactionHistory.delete(sessionId);
    console.log(`🗑️ Cleared pronoun resolution data for session: ${sessionId}`);
  }

  // Private helper methods
  private static extractPronounContexts(text: string): PronounContext[] {
    const contexts: PronounContext[] = [];
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

  private static extractNearbyCharacters(sentence: string, pronounPosition: number): string[] {
    // Simple name detection - capitalized words that aren't pronouns
    const words = sentence.split(/\s+/);
    const names = words.filter(word => 
      /^[A-Z][a-z]+$/.test(word) && 
      !['The', 'This', 'That', 'They', 'She', 'He', 'It'].includes(word)
    );
    
    return [...new Set(names)]; // Remove duplicates
  }

  private static resolvePronounInContext(
    context: PronounContext,
    relationships: CharacterRelationship[],
    history: Array<{ characters: string[], context: string, page: number }>,
    pageNumber: number
  ): { replacement: string; confidence: number } | null {
    
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

  private static generateRelationshipId(characterA: string, characterB: string): string {
    // Sort names for consistent ID regardless of order
    const sorted = [characterA, characterB].sort();
    return `${sorted[0]}_${sorted[1]}`;
  }

  private static getOrCreateSessionRelationships(sessionId: string): CharacterRelationship[] {
    if (!this.relationshipRegistry.has(sessionId)) {
      this.relationshipRegistry.set(sessionId, []);
    }
    return this.relationshipRegistry.get(sessionId)!;
  }

  private static getOrCreateInteractionHistory(sessionId: string): Array<{ characters: string[], context: string, page: number }> {
    if (!this.interactionHistory.has(sessionId)) {
      this.interactionHistory.set(sessionId, []);
    }
    return this.interactionHistory.get(sessionId)!;
  }

  // Advanced relationship inference
  static inferImplicitRelationships(sessionId: string, text: string): CharacterRelationship[] {
    const implicitRelationships: CharacterRelationship[] = [];
    
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
