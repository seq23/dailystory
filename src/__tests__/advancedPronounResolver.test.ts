import { describe, it, expect, beforeEach } from 'vitest';
import { AdvancedPronounResolver } from '../services/AdvancedPronounResolver';

describe('AdvancedPronounResolver', () => {
  const testSessionId = 'test-pronoun-session';

  beforeEach(() => {
    AdvancedPronounResolver.clearSession(testSessionId);
  });

  it('should detect friend relationships', () => {
    const relationships = AdvancedPronounResolver.analyzeRelationships(
      testSessionId,
      "Emma's friend Sarah came to visit.",
      1
    );
    
    expect(relationships).toHaveLength(1);
    expect(relationships[0].characterA).toBe('Emma');
    expect(relationships[0].characterB).toBe('Sarah');
    expect(relationships[0].relationshipType).toBe('friend');
  });

  it('should resolve "they" to character pairs', () => {
    // First establish relationship
    AdvancedPronounResolver.analyzeRelationships(testSessionId, "Emma and Sarah are friends.", 1);
    AdvancedPronounResolver.trackCharacterInteraction(testSessionId, ['Emma', 'Sarah'], 'playing together', 1);
    
    // Then resolve pronoun
    const resolved = AdvancedPronounResolver.resolveComplexPronouns(
      testSessionId,
      "They went to the park.",
      2
    );
    
    expect(resolved).toBe('Emma and Sarah went to the park.');
  });

  it('should track character interactions', () => {
    AdvancedPronounResolver.trackCharacterInteraction(
      testSessionId,
      ['Emma', 'Alex'],
      'building sandcastles',
      1
    );
    
    const interactions = AdvancedPronounResolver.getRecentInteractions(testSessionId);
    expect(interactions).toHaveLength(1);
    expect(interactions[0].characters).toEqual(['Alex', 'Emma']); // sorted
  });
});