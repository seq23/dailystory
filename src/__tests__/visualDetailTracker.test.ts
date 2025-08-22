import { describe, it, expect, beforeEach } from 'vitest';
import { VisualStateAPI } from '../services/visualStateAPI';

describe('VisualStateAPI - Visual Detail Tracking Integration', () => {
  const testSessionId = 'test-session-123';

  beforeEach(async () => {
    await VisualStateAPI.clearVisualState(testSessionId);
  });

  it('should detect and track colored animals via API', async () => {
    const text = 'Emma saw a blue bird sitting on the fence.';
    const result = await VisualStateAPI.analyzeTextForDetails(testSessionId, text, 1);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.pageNumber).toBe(1);
    expect(result.data.detailCount).toBeGreaterThan(0);
  });

  it('should detect and track colored vehicles via API', async () => {
    const text = 'The red car zoomed down the hill.';
    const result = await VisualStateAPI.analyzeTextForDetails(testSessionId, text, 1);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.pageNumber).toBe(1);
  });

  it('should detect size and color attributes for objects via API', async () => {
    const text = 'She played with a big red ball in the yard.';
    const result = await VisualStateAPI.analyzeTextForDetails(testSessionId, text, 1);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.pageNumber).toBe(1);
  });

  it('should inject consistent details on subsequent mentions via API', async () => {
    // First mention - track the blue bird
    await VisualStateAPI.analyzeTextForDetails(testSessionId, 'A blue bird was singing.', 1);
    
    // Second mention - should enhance "the bird" with "blue"
    const result = await VisualStateAPI.injectConsistentDetails(
      testSessionId, 
      'The bird flew away.', 
      2
    );
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.pageNumber).toBe(2);
  });

  it('should maintain consistent color across multiple pages via API', async () => {
    // Page 1: Introduce red car
    await VisualStateAPI.analyzeTextForDetails(testSessionId, 'Emma played with her red car.', 1);
    
    // Page 2: Vague reference should be enhanced
    const result = await VisualStateAPI.injectConsistentDetails(
      testSessionId,
      'The car rolled down the hill.',
      2
    );
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should track multiple different objects via API', async () => {
    const text = 'The blue bird and the red car were in the green garden.';
    const result = await VisualStateAPI.analyzeTextForDetails(testSessionId, text, 1);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.detailCount).toBeGreaterThan(0);
  });

  it('should get visual details for prompt enhancement via API', async () => {
    // First add some details
    await VisualStateAPI.analyzeTextForDetails(testSessionId, 'A small blue ball rolled.', 1);
    
    // Then get details for prompt
    const result = await VisualStateAPI.getVisualDetailsForPrompt(testSessionId);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.sessionId).toBe(testSessionId);
  });

  it('should handle pronoun resolution via API', async () => {
    const text = 'Emma and Sarah went to the park. They played together.';
    const result = await VisualStateAPI.resolvePronouns(testSessionId, text, 1);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.originalText).toBe(text);
    expect(result.data.resolvedText).toBeDefined();
  });

  it('should handle character seed management via API', async () => {
    const characterName = 'Emma';
    const description = 'A young girl with brown hair';
    const seed = 12345;
    
    // Update character with seed
    const updateResult = await VisualStateAPI.updateCharacterWithSeed(
      testSessionId, 
      characterName, 
      description, 
      seed, 
      1
    );
    
    expect(updateResult.success).toBe(true);
    expect(updateResult.data.characterName).toBe(characterName);
    expect(updateResult.data.seed).toBe(seed);
    
    // Get character seed
    const getResult = await VisualStateAPI.getCharacterSeed(testSessionId, characterName);
    
    expect(getResult.success).toBe(true);
    expect(getResult.data.characterName).toBe(characterName);
  });

  it('should clear visual state properly via API', async () => {
    // Add some details first
    await VisualStateAPI.analyzeTextForDetails(testSessionId, 'A red car and blue bird.', 1);
    
    // Clear the state
    const result = await VisualStateAPI.clearVisualState(testSessionId);
    
    expect(result.success).toBe(true);
    expect(result.data.cleared).toBe(true);
    expect(result.data.sessionId).toBe(testSessionId);
  });
});