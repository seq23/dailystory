// Pure Deno Backend Token Manager - Simplified & Restructured
// Focused on intelligent prompt construction without truncation

export class BackendTokenManager {
  
  /**
   * Extract main action from page text for intelligent scene context
   */
  static extractMainAction(pageText) {
    if (!pageText || typeof pageText !== 'string') return '';
    
    // Split into sentences and filter meaningful ones
    const sentences = pageText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length === 0) return '';
    
    // Take first 2-3 sentences and extract key actions
    const keyContent = sentences.slice(0, 3).join('. ').trim();
    
    // Extract action-oriented context (remove "children's book scene:" prefix)
    // Focus on main verbs and activities
    const actionMatch = keyContent.match(/(?:was|is|were|are)?\s*([a-z]*ing|[a-z]*ed|[a-z]+s)\s+([^,.!?]+)/i);
    if (actionMatch) {
      return `character ${actionMatch[1]} ${actionMatch[2]}`.toLowerCase();
    }
    
    // Fallback: return first sentence without prefix
    return sentences[0].trim().toLowerCase();
  }
  
  /**
   * Create simplified prompt segments without truncation logic
   * New signature: (aiSchemaData, characterDescription, qualitySuffixes, styleFramework, sceneContext, secondaryCharacters, visualDetails)
   */
  static createPromptSegments(aiSchemaData = null, characterDescription = '', qualitySuffixes = '', styleFramework = '', sceneContext = '', secondaryCharacters = '', visualDetails = '') {
    let segments = [];

    // Tier 1: AI Schema Data (Enhanced Processing)
    if (aiSchemaData?.primaryScene) {
      segments.push({
        content: aiSchemaData.primaryScene,
        type: 'primary-scene'
      });
    }

    if (aiSchemaData?.characters) {
      segments.push({
        content: aiSchemaData.characters,
        type: 'characters'
      });
    }

    // Process AI visual components with ACTION FIELD FIX
    if (aiSchemaData?.visualComponents) {
      const vc = aiSchemaData.visualComponents;
      if (vc.action) segments.push({ content: vc.action, type: 'action' });
      if (vc.sceneType) segments.push({ content: vc.sceneType, type: 'scene-type' });
      if (vc.lighting) segments.push({ content: vc.lighting, type: 'lighting' });
      if (vc.keyObjects) segments.push({ content: vc.keyObjects, type: 'key-objects' });
      if (vc.setting) segments.push({ content: vc.setting, type: 'cultural-setting' });
      if (vc.mood) segments.push({ content: vc.mood, type: 'mood' });
    }

    // Tier 2: Legacy Processing with Intelligent SceneContext

    // Character description (both tiers, priority position for Tier 2)
    if (characterDescription && characterDescription.trim().length > 0) {
      segments.push({
        content: characterDescription,
        type: 'character-description'
      });
    }

    // Secondary characters (high priority after primary characters)
    if (secondaryCharacters && secondaryCharacters.trim().length > 0) {
      segments.push({
        content: secondaryCharacters,
        type: 'secondary-characters'
      });
    }

    // Scene context (intelligent for Tier 2, legacy fallback for Tier 1)
    if (!aiSchemaData?.primaryScene && sceneContext) {
      // For Tier 2: Extract intelligent scene context if it contains "Children's book scene:"
      let processedSceneContext = sceneContext;
      if (sceneContext.startsWith("Children's book scene:")) {
        const pageText = sceneContext.replace("Children's book scene:", "").trim();
        processedSceneContext = this.extractMainAction(pageText);
      }
      
      if (processedSceneContext && processedSceneContext.trim().length > 0) {
        segments.push({
          content: processedSceneContext,
          type: 'scene-context'
        });
      }
    }

    // Visual details (object persistence from VisualDetailTracker)
    if (visualDetails && visualDetails.trim().length > 0) {
      segments.push({
        content: visualDetails,
        type: 'visual-details'
      });
    }

    // Quality suffixes (brand suffix)
    if (qualitySuffixes && qualitySuffixes.trim().length > 0) {
      segments.push({
        content: qualitySuffixes,
        type: 'brand-suffix'
      });
    }

    // Style framework
    if (styleFramework && styleFramework.trim().length > 0) {
      segments.push({
        content: styleFramework,
        type: 'style-framework'
      });
    }

    // Filter out empty segments
    segments = segments.filter(segment => segment.content && segment.content.trim().length > 0);
    
    console.log(`🔧 Created ${segments.length} prompt segments (${segments.map(s => s.type).join(', ')})`);
    
    return segments;
  }
  
  /**
   * Build final prompt from segments
   */
  static buildPrompt(segments) {
    return segments.map(segment => segment.content).join(', ');
  }
}