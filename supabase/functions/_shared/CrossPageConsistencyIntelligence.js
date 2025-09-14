/**
 * CROSS-PAGE CONSISTENCY INTELLIGENCE - PHASE 6
 * Advanced intelligence system for maintaining narrative and visual consistency across story pages
 * Integrates all previous phases for comprehensive consistency management
 */

import { unifiedPlaceholderResolver } from './UnifiedPlaceholderResolver.js';
import { enhancedAnimalDetector } from './EnhancedAnimalDetector.js';
import { coloredObjectTracker } from './ColoredObjectTracker.js';
import { templateConsistencyEnforcer } from './TemplateConsistencyEnforcer.js';
import { visualDetailTracker } from './VisualDetailTracker.js';

export class CrossPageConsistencyIntelligence {
  constructor() {
    this.consistencyProfiles = new Map();
    this.narrativeArcs = new Map();
    this.visualContinuity = new Map();
    this.intelligenceRules = new Map();
    this.maxProfileSize = 1000;
  }

  /**
   * MASTER CONSISTENCY INTELLIGENCE - Comprehensive cross-page analysis
   */
  analyzeAndEnforceConsistency(content, context = {}) {
    const { sessionId, pageNumber = 1, userInfo = {}, previousContent = [] } = context;
    
    if (!content || typeof content !== 'string') {
      return { content, consistency: 'skipped', intelligence: {} };
    }

    try {
      const results = {
        content,
        consistency: 'unknown',
        intelligence: {},
        recommendations: [],
        modifications: [],
        success: true
      };

      // 1. BUILD CONSISTENCY PROFILE
      results.intelligence.profile = this.buildConsistencyProfile(content, context);
      
      // 2. ANALYZE NARRATIVE COHERENCE
      results.intelligence.narrative = this.analyzeNarrativeCoherence(content, context);
      
      // 3. ENFORCE VISUAL CONSISTENCY
      results.intelligence.visual = this.enforceVisualConsistency(content, context);
      
      // 4. APPLY INTELLIGENT CORRECTIONS
      const corrections = this.generateIntelligentCorrections(content, results.intelligence, context);
      results.content = this.applyCorrections(content, corrections);
      results.modifications = corrections;
      
      // 5. GENERATE CONSISTENCY RECOMMENDATIONS
      results.recommendations = this.generateIntelligentRecommendations(results.intelligence, context);
      
      // 6. UPDATE CONSISTENCY PROFILE
      if (sessionId) {
        this.updateConsistencyProfile(sessionId, pageNumber, results.intelligence);
      }

      results.consistency = this.calculateOverallConsistency(results.intelligence);

      console.log(`🧠 [CrossPageConsistencyIntelligence] Analyzed page ${pageNumber}, consistency: ${results.consistency}`);
      
      return results;

    } catch (error) {
      console.warn('⚠️ [CrossPageConsistencyIntelligence] Intelligence error (non-blocking):', error.message);
      return { 
        content, 
        consistency: 'error', 
        intelligence: { error: error.message },
        success: false 
      };
    }
  }

  /**
   * 1. BUILD CONSISTENCY PROFILE
   */
  buildConsistencyProfile(content, context) {
    const profile = {
      characters: {},
      objects: {},
      settings: {},
      themes: {},
      narrative: {},
      visual: {},
      temporal: {}
    };

    // Character analysis using enhanced detector
    const characterDetection = enhancedAnimalDetector.detectAllCharacters(content, context);
    profile.characters = {
      animals: characterDetection.animals,
      secondary: characterDetection.secondaryCharacters,
      relationships: characterDetection.relationships,
      consistency: this.analyzeCharacterConsistency(characterDetection, context)
    };

    // Object analysis using colored object tracker
    const objectDetection = coloredObjectTracker.trackColoredObjects(content, context);
    profile.objects = {
      colored: objectDetection.objects,
      consistency: objectDetection.consistency,
      recommendations: objectDetection.recommendations
    };

    // Visual analysis using visual detail tracker
    if (context.sessionId) {
      const visualHistory = visualDetailTracker.getVisualHistory(
        context.userInfo?.user_id || context.sessionId, 
        context.userInfo?.name || 'child'
      );
      profile.visual = {
        history: visualHistory,
        consistency: this.analyzeVisualConsistency(visualHistory, context)
      };
    }

    // Narrative analysis
    profile.narrative = this.analyzeNarrativeElements(content, context);

    // Temporal analysis
    profile.temporal = this.analyzeTemporalConsistency(content, context);

    return profile;
  }

  /**
   * 2. ANALYZE NARRATIVE COHERENCE
   */
  analyzeNarrativeCoherence(content, context) {
    const narrative = {
      flow: 'unknown',
      transitions: [],
      conflicts: [],
      themes: [],
      voice: 'consistent'
    };

    // Analyze narrative flow
    narrative.flow = this.assessNarrativeFlow(content, context);
    
    // Detect transitions
    narrative.transitions = this.detectNarrativeTransitions(content);
    
    // Find narrative conflicts
    narrative.conflicts = this.findNarrativeConflicts(content, context);
    
    // Extract themes
    narrative.themes = this.extractNarrativeThemes(content);
    
    // Assess voice consistency
    narrative.voice = this.assessVoiceConsistency(content, context);

    return narrative;
  }

  /**
   * 3. ENFORCE VISUAL CONSISTENCY
   */
  enforceVisualConsistency(content, context) {
    const visual = {
      consistency: 'unknown',
      conflicts: [],
      enhancements: [],
      recommendations: []
    };

    if (!context.sessionId) {
      visual.consistency = 'no_session';
      return visual;
    }

    // Get previous visual data
    const previousVisuals = this.getPreviousVisualData(context.sessionId);
    
    // Detect visual conflicts
    visual.conflicts = this.detectVisualConflicts(content, previousVisuals, context);
    
    // Generate visual enhancements
    visual.enhancements = this.generateVisualEnhancements(content, previousVisuals, context);
    
    // Create recommendations
    visual.recommendations = this.createVisualRecommendations(visual.conflicts, visual.enhancements);
    
    // Calculate consistency score
    visual.consistency = this.calculateVisualConsistency(visual.conflicts);

    return visual;
  }

  /**
   * 4. GENERATE INTELLIGENT CORRECTIONS
   */
  generateIntelligentCorrections(content, intelligence, context) {
    const corrections = [];

    // Character consistency corrections
    intelligence.profile.characters.consistency.forEach(issue => {
      if (issue.severity === 'high') {
        corrections.push({
          type: 'character_correction',
          target: issue.character,
          correction: this.generateCharacterCorrection(issue, context),
          reason: issue.reason,
          priority: 'high'
        });
      }
    });

    // Object consistency corrections
    intelligence.profile.objects.consistency.forEach(issue => {
      if (issue.severity === 'medium' || issue.severity === 'high') {
        corrections.push({
          type: 'object_correction',
          target: `${issue.currentColor} ${issue.object}`,
          correction: `${issue.previousColors[0]} ${issue.object}`,
          reason: issue.recommendation,
          priority: 'medium'
        });
      }
    });

    // Narrative flow corrections
    intelligence.narrative.conflicts.forEach(conflict => {
      corrections.push({
        type: 'narrative_correction',
        target: conflict.location,
        correction: this.generateNarrativeCorrection(conflict, context),
        reason: conflict.description,
        priority: conflict.severity
      });
    });

    // Visual consistency corrections
    intelligence.visual.conflicts.forEach(conflict => {
      corrections.push({
        type: 'visual_correction',
        target: conflict.element,
        correction: conflict.suggestedFix,
        reason: conflict.reason,
        priority: 'medium'
      });
    });

    return corrections.sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });
  }

  /**
   * 5. GENERATE INTELLIGENT RECOMMENDATIONS
   */
  generateIntelligentRecommendations(intelligence, context) {
    const recommendations = [];

    // Character development recommendations
    if (intelligence.profile.characters.animals.length > 0) {
      recommendations.push({
        type: 'character_development',
        suggestion: `Continue developing ${intelligence.profile.characters.animals[0].name} as a consistent character`,
        priority: 'medium',
        rationale: 'Character consistency enhances story engagement'
      });
    }

    // Object consistency recommendations
    if (intelligence.profile.objects.consistency.length > 0) {
      recommendations.push({
        type: 'object_consistency',
        suggestion: 'Maintain consistent object descriptions across pages',
        priority: 'high',
        rationale: 'Visual consistency helps children follow the story'
      });
    }

    // Narrative flow recommendations
    if (intelligence.narrative.flow === 'choppy') {
      recommendations.push({
        type: 'narrative_flow',
        suggestion: 'Add transition phrases to improve story flow',
        priority: 'medium',
        rationale: 'Smooth transitions help maintain story engagement'
      });
    }

    // Visual continuity recommendations
    if (intelligence.visual.consistency === 'poor') {
      recommendations.push({
        type: 'visual_continuity',
        suggestion: 'Maintain consistent visual elements across scenes',
        priority: 'high',
        rationale: 'Visual consistency prevents confusion and maintains immersion'
      });
    }

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  /**
   * ANALYSIS HELPER FUNCTIONS
   */
  analyzeCharacterConsistency(characterDetection, context) {
    const consistency = [];
    
    if (!context.sessionId) return consistency;
    
    const previousData = this.getConsistencyProfile(context.sessionId);
    if (!previousData) return consistency;

    // Check for character type changes
    characterDetection.animals.forEach(animal => {
      const previousAnimal = previousData.characters?.animals?.find(a => a.name === animal.name);
      if (previousAnimal && previousAnimal.category !== animal.category) {
        consistency.push({
          type: 'character_type_change',
          character: animal.name,
          previousType: previousAnimal.category,
          currentType: animal.category,
          severity: 'high',
          reason: `${animal.name} changed from ${previousAnimal.category} to ${animal.category}`
        });
      }
    });

    return consistency;
  }

  analyzeVisualConsistency(visualHistory, context) {
    const consistency = {
      score: 1.0,
      issues: [],
      strengths: []
    };

    if (visualHistory.length < 2) {
      consistency.score = 0.5;
      consistency.issues.push('Insufficient visual history for analysis');
      return consistency;
    }

    // Analyze consistency patterns in visual history
    const colorConsistency = this.analyzeColorConsistency(visualHistory);
    const settingConsistency = this.analyzeSettingConsistency(visualHistory);
    
    consistency.score = (colorConsistency.score + settingConsistency.score) / 2;
    consistency.issues = [...colorConsistency.issues, ...settingConsistency.issues];
    consistency.strengths = [...colorConsistency.strengths, ...settingConsistency.strengths];

    return consistency;
  }

  analyzeNarrativeElements(content, context) {
    return {
      wordCount: content.split(/\s+/).length,
      sentences: content.split(/[.!?]+/).length,
      complexity: this.assessContentComplexity(content),
      tone: this.detectTone(content),
      readabilityLevel: this.estimateReadabilityLevel(content)
    };
  }

  analyzeTemporalConsistency(content, context) {
    const temporal = {
      timeMarkers: [],
      sequence: 'unknown',
      consistency: 'good'
    };

    // Detect time markers
    const timePatterns = [
      /\b(then|next|after|before|later|soon|now|suddenly|meanwhile)\b/gi,
      /\b(first|second|third|finally)\b/gi,
      /\b(morning|afternoon|evening|night|today|yesterday|tomorrow)\b/gi
    ];

    timePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        temporal.timeMarkers.push({
          marker: match[1],
          position: match.index,
          type: this.classifyTimeMarker(match[1])
        });
      }
    });

    // Assess sequence logic
    temporal.sequence = this.assessTemporalSequence(temporal.timeMarkers, context);

    return temporal;
  }

  /**
   * CORRECTION GENERATORS
   */
  generateCharacterCorrection(issue, context) {
    switch (issue.type) {
      case 'character_type_change':
        return `the ${issue.previousType} ${issue.character}`;
      default:
        return issue.character;
    }
  }

  generateNarrativeCorrection(conflict, context) {
    // Generate appropriate narrative correction based on conflict type
    return conflict.suggestedFix || conflict.location;
  }

  applyCorrections(content, corrections) {
    let correctedContent = content;

    corrections.forEach(correction => {
      try {
        switch (correction.type) {
          case 'character_correction':
          case 'object_correction':
            const regex = new RegExp(this.escapeRegExp(correction.target), 'gi');
            correctedContent = correctedContent.replace(regex, correction.correction);
            break;

          case 'narrative_correction':
            correctedContent = this.applyNarrativeCorrection(correctedContent, correction);
            break;

          case 'visual_correction':
            correctedContent = this.applyVisualCorrection(correctedContent, correction);
            break;
        }
      } catch (error) {
        console.warn('⚠️ [CrossPageConsistencyIntelligence] Correction error:', error.message);
      }
    });

    return correctedContent;
  }

  /**
   * UTILITY FUNCTIONS
   */
  assessNarrativeFlow(content, context) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length < 2) return 'simple';

    // Check for transition words
    const transitionCount = (content.match(/\b(then|next|after|meanwhile|suddenly|later|soon)\b/gi) || []).length;
    const transitionRatio = transitionCount / sentences.length;

    if (transitionRatio > 0.3) return 'smooth';
    if (transitionRatio > 0.1) return 'adequate';
    return 'choppy';
  }

  detectNarrativeTransitions(content) {
    const transitions = [];
    const transitionPattern = /\b(then|next|after|meanwhile|suddenly|later|soon|first|finally)\b/gi;
    
    let match;
    while ((match = transitionPattern.exec(content)) !== null) {
      transitions.push({
        word: match[1],
        position: match.index,
        type: this.classifyTransition(match[1])
      });
    }

    return transitions;
  }

  findNarrativeConflicts(content, context) {
    const conflicts = [];
    
    // Look for contradictory statements
    const contradictionPatterns = [
      { pattern: /\b(inside|indoors)\b.*\b(outside|outdoors)\b/gi, type: 'location_contradiction' },
      { pattern: /\b(morning|day)\b.*\b(night|evening)\b/gi, type: 'time_contradiction' },
      { pattern: /\b(happy|excited)\b.*\b(sad|upset)\b/gi, type: 'emotion_contradiction' }
    ];

    contradictionPatterns.forEach(({ pattern, type }) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        conflicts.push({
          type,
          location: match.index,
          text: match[0],
          severity: 'medium',
          description: `Potential ${type.replace('_', ' ')} detected`
        });
      }
    });

    return conflicts;
  }

  extractNarrativeThemes(content) {
    const themes = [];
    const themePatterns = {
      friendship: /\b(friend|buddy|together|share|help)\b/gi,
      adventure: /\b(explore|discover|journey|adventure|quest)\b/gi,
      learning: /\b(learn|discover|understand|realize|know)\b/gi,
      family: /\b(mom|dad|family|sister|brother|love)\b/gi,
      nature: /\b(tree|flower|animal|forest|garden|outside)\b/gi
    };

    Object.entries(themePatterns).forEach(([theme, pattern]) => {
      const matches = content.match(pattern) || [];
      if (matches.length > 0) {
        themes.push({
          theme,
          frequency: matches.length,
          relevance: matches.length / content.split(/\s+/).length
        });
      }
    });

    return themes.sort((a, b) => b.frequency - a.frequency);
  }

  calculateOverallConsistency(intelligence) {
    const scores = [];
    
    if (intelligence.profile?.characters?.consistency) {
      const characterIssues = intelligence.profile.characters.consistency.length;
      scores.push(Math.max(0, 1 - (characterIssues * 0.2)));
    }
    
    if (intelligence.profile?.objects?.consistency) {
      const objectIssues = intelligence.profile.objects.consistency.length;
      scores.push(Math.max(0, 1 - (objectIssues * 0.15)));
    }
    
    if (intelligence.visual?.consistency) {
      const visualScore = typeof intelligence.visual.consistency === 'string' ? 0.5 : intelligence.visual.consistency;
      scores.push(visualScore);
    }

    if (scores.length === 0) return 'unknown';
    
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    if (avgScore >= 0.9) return 'excellent';
    if (avgScore >= 0.7) return 'good';
    if (avgScore >= 0.5) return 'fair';
    return 'poor';
  }

  /**
   * STORAGE AND RETRIEVAL
   */
  updateConsistencyProfile(sessionId, pageNumber, intelligence) {
    if (!this.consistencyProfiles.has(sessionId)) {
      this.consistencyProfiles.set(sessionId, {
        pages: [],
        narrative: {},
        visual: {},
        characters: {},
        objects: {}
      });
    }

    const profile = this.consistencyProfiles.get(sessionId);
    profile.pages.push({
      pageNumber,
      intelligence,
      timestamp: Date.now()
    });

    // Limit profile size
    if (profile.pages.length > this.maxProfileSize) {
      profile.pages.splice(0, profile.pages.length - this.maxProfileSize);
    }

    this.consistencyProfiles.set(sessionId, profile);
  }

  getConsistencyProfile(sessionId) {
    return this.consistencyProfiles.get(sessionId);
  }

  getPreviousVisualData(sessionId) {
    const profile = this.getConsistencyProfile(sessionId);
    return profile?.visual || {};
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * CLEANUP
   */
  clearConsistencyProfile(sessionId) {
    if (sessionId) {
      this.consistencyProfiles.delete(sessionId);
    } else {
      this.consistencyProfiles.clear();
    }
  }
}

// Export singleton instance
export const crossPageConsistencyIntelligence = new CrossPageConsistencyIntelligence();