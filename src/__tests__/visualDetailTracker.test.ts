import { describe, it, expect, beforeEach } from 'vitest';
import { StoryVisualStateManager } from '../services/storyVisualState';

describe('StoryVisualStateManager - Visual Detail Tracking', () => {
  const testSessionId = 'test-session-123';

  beforeEach(() => {
    StoryVisualStateManager.clearStoryState(testSessionId);
  });

  it('should detect and track colored animals', () => {
    const text = 'Emma saw a blue bird sitting on the fence.';
    const details = StoryVisualStateManager.analyzeTextForDetails(testSessionId, text, 1);
    
    expect(details).toHaveLength(1);
    expect(details[0].name).toBe('bird');
    expect(details[0].type).toBe('animal');
    expect(details[0].attributes.get('color')).toBe('blue');
    expect(details[0].firstMentionedPage).toBe(1);
  });

  it('should detect and track colored vehicles', () => {
    const text = 'The red car zoomed down the hill.';
    const details = StoryVisualStateManager.analyzeTextForDetails(testSessionId, text, 1);
    
    expect(details).toHaveLength(1);
    expect(details[0].name).toBe('car');
    expect(details[0].type).toBe('vehicle');
    expect(details[0].attributes.get('color')).toBe('red');
  });

  it('should detect size and color attributes for objects', () => {
    const text = 'She played with a big red ball in the yard.';
    const details = StoryVisualStateManager.analyzeTextForDetails(testSessionId, text, 1);
    
    expect(details).toHaveLength(1);
    expect(details[0].name).toBe('ball');
    expect(details[0].type).toBe('object');
    expect(details[0].attributes.get('color')).toBe('red');
    expect(details[0].attributes.get('size')).toBe('big');
  });

  it('should inject consistent details on subsequent mentions', () => {
    // First mention - track the blue bird
    StoryVisualStateManager.analyzeTextForDetails(testSessionId, 'A blue bird was singing.', 1);
    
    // Second mention - should enhance "the bird" with "blue"
    const enhanced = StoryVisualStateManager.injectConsistentDetails(
      testSessionId, 
      'The bird flew away.', 
      2
    );
    
    expect(enhanced).toBe('The blue bird flew away.');
  });

  it('should maintain consistent color across multiple pages', () => {
    // Page 1: Introduce red car
    VisualDetailTracker.analyzeTextForDetails(testSessionId, 'Emma played with her red car.', 1);
    
    // Page 2: Vague reference should be enhanced
    const enhanced = VisualDetailTracker.injectConsistentDetails(
      testSessionId,
      'The car rolled down the hill.',
      2
    );
    
    expect(enhanced).toBe('The red car rolled down the hill.');
  });

  it('should track multiple different objects', () => {
    const text = 'The blue bird and the red car were in the green garden.';
    const details = StoryVisualStateManager.analyzeTextForDetails(testSessionId, text, 1);
    
    expect(details).toHaveLength(2); // bird and car
    
    const bird = details.find(d => d.name === 'bird');
    const car = details.find(d => d.name === 'car');
    
    expect(bird?.attributes.get('color')).toBe('blue');
    expect(car?.attributes.get('color')).toBe('red');
  });

  it('should detect complex objects with ownership', () => {
    const complexObjects = StoryVisualStateManager.detectComplexObjects(
      "Emma's red and blue striped backpack was heavy."
    );
    
    expect(complexObjects).toHaveLength(1);
    expect(complexObjects[0].description).toBe("Emma's red and blue striped backpack");
    expect(complexObjects[0].attributes.get('owner')).toBe('Emma');
    expect(complexObjects[0].attributes.get('colors')).toBe('red and blue');
    expect(complexObjects[0].attributes.get('pattern')).toBe('striped');
  });

  it('should get consistent detail descriptions', () => {
    // Track a small blue ball
    StoryVisualStateManager.analyzeTextForDetails(testSessionId, 'A small blue ball rolled.', 1);
    
    const description = StoryVisualStateManager.getConsistentDetailDescription(
      testSessionId, 
      'ball', 
      'object'
    );
    
    expect(description).toBe('small blue ball');
  });

  it('should handle clothing items', () => {
    const text = 'She wore a red dress to the party.';
    const details = StoryVisualStateManager.analyzeTextForDetails(testSessionId, text, 1);
    
    expect(details).toHaveLength(1);
    expect(details[0].name).toBe('dress');
    expect(details[0].type).toBe('clothing');
    expect(details[0].attributes.get('color')).toBe('red');
  });

  it('should update last mentioned page when detail appears again', () => {
    // First mention on page 1
    StoryVisualStateManager.analyzeTextForDetails(testSessionId, 'A blue bird sang.', 1);
    
    // Second mention on page 3
    StoryVisualStateManager.analyzeTextForDetails(testSessionId, 'The blue bird returned.', 3);
    
    const sessionDetails = StoryVisualStateManager.getSessionDetails(testSessionId);
    const bird = sessionDetails.find(d => d.name === 'bird');
    
    expect(bird?.firstMentionedPage).toBe(1);
    expect(bird?.lastMentionedPage).toBe(3);
  });

  it('should clear session details properly', () => {
    StoryVisualStateManager.analyzeTextForDetails(testSessionId, 'A red car and blue bird.', 1);
    
    let details = StoryVisualStateManager.getSessionDetails(testSessionId);
    expect(details).toHaveLength(2);
    
    StoryVisualStateManager.clearStoryState(testSessionId);
    
    details = StoryVisualStateManager.getSessionDetails(testSessionId);
    expect(details).toHaveLength(0);
  });
});