/**
 * TEMPLATE SYSTEM CONSISTENCY ENFORCEMENT - PHASE 5
 * Ensures template independence while maintaining story coherence across pages
 * Prevents template conflicts and enforces consistent narrative flow
 */

import { unifiedPlaceholderResolver } from './UnifiedPlaceholderResolver.js';
import { enhancedAnimalDetector } from './EnhancedAnimalDetector.js';
import { coloredObjectTracker } from './ColoredObjectTracker.js';

export class TemplateConsistencyEnforcer {
  constructor() {
    this.templateHistory = new Map();
    this.consistencyRules = new Map();
    this.conflictResolutions = new Map();
    this.maxHistorySize = 200;
  }

  /**
   * MASTER TEMPLATE CONSISTENCY - Enforce consistency across template usage
   */
  enforceTemplateConsistency(templateContent, context = {}) {
    const { sessionId, pageNumber = 1, templateId, userInfo = {} } = context;
    
    if (!templateContent || typeof templateContent !== 'string') {
      return { content: templateContent, consistency: 'skipped', issues: [] };
    }

    try {
      const results = {
        content: templateContent,
        consistency: 'unknown',
        issues: [],
        resolutions: [],
        templateData: {},
        success: true
      };

      // 1. ANALYZE TEMPLATE STRUCTURE
      results.templateData = this.analyzeTemplateStructure(templateContent, context);
      
      // 2. CHECK CROSS-TEMPLATE CONSISTENCY
      results.issues = this.checkCrossTemplateConsistency(templateContent, context);
      
      // 3. ENFORCE CONSISTENCY RULES
      results.resolutions = this.applyConsistencyRules(templateContent, results.issues, context);
      results.content = this.applyResolutions(templateContent, results.resolutions);
      
      // 4. RESOLVE PLACEHOLDER CONFLICTS
      results.content = this.resolvePlaceholderConflicts(results.content, context);
      
      // 5. MAINTAIN NARRATIVE COHERENCE
      results.content = this.maintainNarrativeCoherence(results.content, context);
      
      // 6. STORE TEMPLATE DATA FOR FUTURE CONSISTENCY
      if (sessionId && templateId) {
        this.storeTemplateData(sessionId, pageNumber, templateId, results.templateData);
      }

      results.consistency = this.calculateConsistencyScore(results.issues);

      console.log(`📋 [TemplateConsistencyEnforcer] Enforced consistency for template ${templateId}, score: ${results.consistency}`);
      
      return results;

    } catch (error) {
      console.warn('⚠️ [TemplateConsistencyEnforcer] Consistency error (non-blocking):', error.message);
      return { 
        content: templateContent, 
        consistency: 'error', 
        issues: [{ type: 'system_error', message: error.message }],
        success: false 
      };
    }
  }

  /**
   * 1. ANALYZE TEMPLATE STRUCTURE
   */
  analyzeTemplateStructure(content, context) {
    const templateData = {
      placeholders: [],
      characters: [],
      settings: [],
      objects: [],
      themes: [],
      complexity: 'medium'
    };

    // Extract placeholders
    const placeholderMatches = content.match(/\{[^}]+\}/g) || [];
    templateData.placeholders = placeholderMatches.map(p => ({
      placeholder: p,
      type: this.classifyPlaceholder(p),
      required: !p.includes('?') // Assume required unless marked optional
    }));

    // Detect characters using enhanced detector
    const characterDetection = enhancedAnimalDetector.detectAllCharacters(content, context);
    templateData.characters = [
      ...characterDetection.animals.map(a => ({ name: a.name, type: 'animal', category: a.category })),
      ...characterDetection.secondaryCharacters.map(c => ({ name: c.name || c.type, type: 'person', category: c.category }))
    ];

    // Detect objects using colored object tracker
    const objectDetection = coloredObjectTracker.trackColoredObjects(content, context);
    templateData.objects = objectDetection.objects.map(o => ({
      name: o.object,
      color: o.color,
      size: o.size,
      description: o.fullDescription
    }));

    // Detect settings
    const settingPatterns = [
      /\b(park|forest|beach|mountain|garden|playground|school|library|zoo|farm|castle|home|house|room)\b/gi
    ];
    
    settingPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const setting = match[1].toLowerCase();
        if (!templateData.settings.find(s => s.name === setting)) {
          templateData.settings.push({ name: setting, type: 'location' });
        }
      }
    });

    // Analyze complexity
    templateData.complexity = this.assessTemplateComplexity(content, templateData);

    return templateData;
  }

  /**
   * 2. CHECK CROSS-TEMPLATE CONSISTENCY
   */
  checkCrossTemplateConsistency(content, context) {
    const { sessionId } = context;
    const issues = [];

    if (!sessionId) return issues;

    const previousTemplates = this.getSessionTemplateHistory(sessionId);
    const currentData = this.analyzeTemplateStructure(content, context);

    // Check character consistency
    previousTemplates.forEach(prevTemplate => {
      prevTemplate.characters.forEach(prevChar => {
        const currentChar = currentData.characters.find(c => c.name === prevChar.name);
        if (currentChar && currentChar.type !== prevChar.type) {
          issues.push({
            type: 'character_type_conflict',
            character: prevChar.name,
            previousType: prevChar.type,
            currentType: currentChar.type,
            severity: 'high',
            pageNumbers: [prevTemplate.pageNumber, context.pageNumber]
          });
        }
      });
    });

    // Check object consistency
    previousTemplates.forEach(prevTemplate => {
      prevTemplate.objects.forEach(prevObj => {
        const currentObj = currentData.objects.find(o => o.name === prevObj.name);
        if (currentObj && prevObj.color && currentObj.color && prevObj.color !== currentObj.color) {
          issues.push({
            type: 'object_color_conflict',
            object: prevObj.name,
            previousColor: prevObj.color,
            currentColor: currentObj.color,
            severity: 'medium',
            pageNumbers: [prevTemplate.pageNumber, context.pageNumber]
          });
        }
      });
    });

    // Check setting consistency
    const settingConflicts = this.detectSettingConflicts(currentData.settings, previousTemplates);
    issues.push(...settingConflicts);

    return issues;
  }

  /**
   * 3. APPLY CONSISTENCY RULES
   */
  applyConsistencyRules(content, issues, context) {
    const resolutions = [];

    issues.forEach(issue => {
      switch (issue.type) {
        case 'character_type_conflict':
          resolutions.push({
            type: 'maintain_character_type',
            action: 'replace',
            target: issue.character,
            replacement: this.getConsistentCharacterReference(issue.character, context.sessionId),
            reason: `Maintaining ${issue.character} as ${issue.previousType} for consistency`
          });
          break;

        case 'object_color_conflict':
          resolutions.push({
            type: 'maintain_object_color',
            action: 'replace',
            target: `${issue.currentColor} ${issue.object}`,
            replacement: `${issue.previousColor} ${issue.object}`,
            reason: `Maintaining ${issue.object} as ${issue.previousColor} for consistency`
          });
          break;

        case 'setting_conflict':
          resolutions.push({
            type: 'resolve_setting_conflict',
            action: 'contextual_replace',
            target: issue.conflictingSetting,
            replacement: issue.suggestedSetting,
            reason: issue.reason
          });
          break;

        default:
          // Generic resolution
          resolutions.push({
            type: 'generic_consistency',
            action: 'flag',
            target: issue.type,
            reason: 'Consistency issue flagged for review'
          });
      }
    });

    return resolutions;
  }

  /**
   * 4. RESOLVE PLACEHOLDER CONFLICTS
   */
  resolvePlaceholderConflicts(content, context) {
    let resolvedContent = content;

    // Use unified placeholder resolver with session context
    const placeholderContext = {
      ...context,
      sessionConsistency: true,
      previousResolutions: this.getPreviousPlaceholderResolutions(context.sessionId)
    };

    const resolution = unifiedPlaceholderResolver.resolveAllPlaceholders(resolvedContent, placeholderContext);
    
    if (resolution.success) {
      resolvedContent = resolution.resolvedText;
      
      // Store resolutions for future consistency
      if (context.sessionId) {
        this.storePlaceholderResolutions(context.sessionId, resolution.resolutions);
      }
    }

    return resolvedContent;
  }

  /**
   * 5. MAINTAIN NARRATIVE COHERENCE
   */
  maintainNarrativeCoherence(content, context) {
    let coherentContent = content;

    // Apply narrative flow rules
    coherentContent = this.ensureProperTransitions(coherentContent, context);
    coherentContent = this.maintainCharacterVoice(coherentContent, context);
    coherentContent = this.preserveStoryTone(coherentContent, context);

    return coherentContent;
  }

  /**
   * UTILITY FUNCTIONS
   */
  classifyPlaceholder(placeholder) {
    const types = {
      user: /\{user\.|{child\.|{character\./,
      animal: /\{animal|{pet\}/,
      color: /\{color\}/,
      object: /\{object\}/,
      setting: /\{setting\}/,
      activity: /\{activity\}/,
      emotion: /\{emotion\}/,
      family: /\{mom|{dad|{sister|{brother\}/,
      cultural: /\{cultural\./
    };

    for (const [type, pattern] of Object.entries(types)) {
      if (pattern.test(placeholder)) return type;
    }

    return 'unknown';
  }

  assessTemplateComplexity(content, templateData) {
    let complexity = 0;
    
    // Character count
    complexity += templateData.characters.length * 10;
    
    // Object count
    complexity += templateData.objects.length * 5;
    
    // Placeholder count
    complexity += templateData.placeholders.length * 3;
    
    // Word count
    const wordCount = content.split(/\s+/).length;
    complexity += wordCount * 0.1;

    if (complexity < 50) return 'simple';
    if (complexity < 150) return 'medium';
    return 'complex';
  }

  detectSettingConflicts(currentSettings, previousTemplates) {
    const conflicts = [];
    
    // Look for contradictory settings (indoor vs outdoor)
    const indoorSettings = ['room', 'house', 'school', 'library', 'kitchen', 'bedroom'];
    const outdoorSettings = ['park', 'forest', 'beach', 'playground', 'garden', 'field'];
    
    const hasIndoor = currentSettings.some(s => indoorSettings.includes(s.name));
    const hasOutdoor = currentSettings.some(s => outdoorSettings.includes(s.name));
    
    if (hasIndoor && hasOutdoor) {
      conflicts.push({
        type: 'setting_conflict',
        conflictingSetting: 'mixed_indoor_outdoor',
        suggestedSetting: currentSettings[0].name, // Use first setting
        severity: 'low',
        reason: 'Mixed indoor/outdoor settings may confuse narrative flow'
      });
    }

    return conflicts;
  }

  applyResolutions(content, resolutions) {
    let resolvedContent = content;

    resolutions.forEach(resolution => {
      switch (resolution.action) {
        case 'replace':
          const regex = new RegExp(this.escapeRegExp(resolution.target), 'gi');
          resolvedContent = resolvedContent.replace(regex, resolution.replacement);
          break;

        case 'contextual_replace':
          // More sophisticated replacement based on context
          resolvedContent = this.contextualReplace(resolvedContent, resolution);
          break;

        case 'flag':
          // Add invisible comment for debugging
          resolvedContent += `<!-- Consistency issue: ${resolution.reason} -->`;
          break;
      }
    });

    return resolvedContent;
  }

  contextualReplace(content, resolution) {
    // Implement context-aware replacement logic
    return content.replace(resolution.target, resolution.replacement);
  }

  ensureProperTransitions(content, context) {
    // Add transition phrases if needed
    if (context.pageNumber > 1) {
      const transitionPhrases = [
        'Then, ', 'Next, ', 'After that, ', 'Soon, ', 'Meanwhile, '
      ];
      
      // If content doesn't start with a transition, add one
      if (!/^(Then|Next|After|Soon|Meanwhile)/i.test(content.trim())) {
        const randomTransition = transitionPhrases[Math.floor(Math.random() * transitionPhrases.length)];
        content = randomTransition + content.charAt(0).toLowerCase() + content.slice(1);
      }
    }
    
    return content;
  }

  maintainCharacterVoice(content, context) {
    // Maintain consistent character voice based on previous pages
    return content; // Placeholder for character voice consistency
  }

  preserveStoryTone(content, context) {
    // Maintain story tone consistency
    return content; // Placeholder for tone preservation
  }

  calculateConsistencyScore(issues) {
    if (issues.length === 0) return 'excellent';
    
    const severity = issues.reduce((total, issue) => {
      switch (issue.severity) {
        case 'high': return total + 3;
        case 'medium': return total + 2;
        case 'low': return total + 1;
        default: return total + 1;
      }
    }, 0);

    if (severity === 0) return 'excellent';
    if (severity <= 3) return 'good';
    if (severity <= 6) return 'fair';
    return 'poor';
  }

  /**
   * STORAGE AND RETRIEVAL
   */
  storeTemplateData(sessionId, pageNumber, templateId, templateData) {
    if (!this.templateHistory.has(sessionId)) {
      this.templateHistory.set(sessionId, []);
    }

    const sessionHistory = this.templateHistory.get(sessionId);
    sessionHistory.push({
      pageNumber,
      templateId,
      templateData,
      timestamp: Date.now()
    });

    // Limit history size
    if (sessionHistory.length > this.maxHistorySize) {
      sessionHistory.splice(0, sessionHistory.length - this.maxHistorySize);
    }

    this.templateHistory.set(sessionId, sessionHistory);
  }

  getSessionTemplateHistory(sessionId) {
    return this.templateHistory.get(sessionId) || [];
  }

  getPreviousPlaceholderResolutions(sessionId) {
    // Return cached placeholder resolutions for consistency
    return {};
  }

  storePlaceholderResolutions(sessionId, resolutions) {
    // Store placeholder resolutions for future consistency
  }

  getConsistentCharacterReference(characterName, sessionId) {
    const history = this.getSessionTemplateHistory(sessionId);
    
    for (const entry of history.reverse()) {
      const character = entry.templateData.characters.find(c => c.name === characterName);
      if (character) {
        return character.type === 'animal' ? `the ${characterName}` : characterName;
      }
    }
    
    return characterName;
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * CLEANUP
   */
  clearSessionHistory(sessionId) {
    if (sessionId) {
      this.templateHistory.delete(sessionId);
    } else {
      this.templateHistory.clear();
    }
  }
}

// Export singleton instance
export const templateConsistencyEnforcer = new TemplateConsistencyEnforcer();