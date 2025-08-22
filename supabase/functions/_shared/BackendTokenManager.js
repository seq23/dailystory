// Pure Deno Backend Token Manager - Essentials Only
// Stripped down to character count monitoring only

export const MAX_LENGTH = 2900; // Runware 3000 limit minus 100-char buffer
export const WARN_LENGTH = 2800;

// Priority System for Prompt Segments
export const PromptPriority = {
  LOW: 1,       // Style framework, cultural elements
  MEDIUM: 2,    // Characters, visual components  
  HIGH: 3,      // Brand suffix, visual sub-fields
  CRITICAL: 4   // Primary scene
};

export class BackendTokenManager {
  
  /**
   * Create prompt segments with priority classification
   * Essential for character count monitoring
   */
  static createPromptSegments(sceneContext, characterDescription, styleFramework, qualitySuffixes, visualDetails = '', culturalElements = '', aiSchemaData = null, secondaryCharacters = '') {
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

    // LOW PRIORITY - Style Framework
    if (styleFramework) {
      segments.push({
        content: styleFramework,
        priority: PromptPriority.LOW,
        canTruncate: true,
        type: 'style-framework'
      });
    }

    // HIGH PRIORITY - Brand Suffix
    if (qualitySuffixes) {
      segments.push({
        content: qualitySuffixes,
        priority: PromptPriority.HIGH,
        canTruncate: false,
        type: 'brand-suffix'
      });
    }

    // LOW PRIORITY - Cultural Elements
    if (culturalElements && culturalElements.length > 0) {
      segments.push({
        content: culturalElements,
        priority: PromptPriority.LOW,
        canTruncate: true,
        type: 'cultural-elements'
      });
    }

    // MEDIUM PRIORITY - Secondary Characters
    if (secondaryCharacters && secondaryCharacters.trim().length > 0) {
      segments.push({
        content: secondaryCharacters,
        priority: PromptPriority.MEDIUM,
        canTruncate: true,
        type: 'secondary-characters'
      });
    }

    // Filter out empty segments
    segments = segments.filter(segment => segment.content && segment.content.trim().length > 0);
    
    console.log(`🔧 Created ${segments.length} prompt segments for monitoring`);
    
    return segments;
  }
  
  /**
   * Calculate total character length of segments
   * Essential for monitoring prompt length
   */
  static calculateLength(segments) {
    return segments.reduce((sum, segment) => sum + segment.content.length, 0);
  }
}