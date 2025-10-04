/**
 * ExactWordExtractor - Extracts exact words from text to create formulaic templates
 * Preserves original grammatical form and specific details of a story
 * 
 * Converted from TypeScript to JavaScript for Supabase Edge Functions
 */

import { TIER_25_UNIFIED_VOCABULARY_EXTENDED } from './tier25Vocabulary.js';

export class ExactWordExtractor {
  /**
   * Main extraction method that identifies exact action, objects, and setting from text
   */
  static extractExactWords(pageText) {
    const text = pageText.toLowerCase().trim();
    
    // First check for compound phrases (highest priority)
    const compoundResult = this.detectCompoundPhrases(text);
    if (compoundResult) {
      return {
        action: compoundResult.action,
        objects: compoundResult.objects,
        setting: compoundResult.setting,
        originalForm: true
      };
    }

    // Extract individual components
    const action = this.extractExactAction(text);
    const objects = this.extractExactObjects(text);
    const setting = this.extractExactSetting(text);

    return {
      action,
      objects,
      setting,
      originalForm: true
    };
  }

  /**
   * Detects and extracts compound phrases that should be kept together
   */
  static detectCompoundPhrases(text) {
    const compoundPatterns = [
      {
        pattern: /rolls?\s+down\s+the\s+hill/,
        extractPhrase: (match) => ({
          phrase: match[0],
          action: 'rolling down',
          objects: ['hill'],
          setting: 'hillside'
        })
      },
      {
        pattern: /climbs?\s+up\s+the\s+tree/,
        extractPhrase: (match) => ({
          phrase: match[0],
          action: 'climbing up',
          objects: ['tree'],
          setting: 'forest'
        })
      },
      {
        pattern: /swims?\s+in\s+the\s+(?:pond|lake|river|ocean|sea)/,
        extractPhrase: (match) => ({
          phrase: match[0],
          action: 'swimming in',
          objects: [match[0].split(' ').pop()],
          setting: 'waterside'
        })
      },
      {
        pattern: /flies?\s+through\s+the\s+(?:sky|clouds|air)/,
        extractPhrase: (match) => ({
          phrase: match[0],
          action: 'flying through',
          objects: ['sky'],
          setting: 'sky'
        })
      },
      {
        pattern: /runs?\s+through\s+the\s+(?:forest|woods|field|meadow)/,
        extractPhrase: (match) => ({
          phrase: match[0],
          action: 'running through',
          objects: [match[0].split(' ').pop()],
          setting: match[0].split(' ').pop()
        })
      }
    ];

    for (const pattern of compoundPatterns) {
      const match = text.match(pattern.pattern);
      if (match) {
        return pattern.extractPhrase(match);
      }
    }

    return null;
  }

  /**
   * Extracts the primary action verb from predefined list
   */
  static extractExactAction(text) {
    const actionWords = TIER_25_UNIFIED_VOCABULARY_EXTENDED.actions.basic
      .concat(TIER_25_UNIFIED_VOCABULARY_EXTENDED.actions.learning)
      .concat(TIER_25_UNIFIED_VOCABULARY_EXTENDED.actions.advanced);

    // Look for exact action word matches
    for (const action of actionWords) {
      const regex = new RegExp(`\\b${action}\\b`, 'i');
      if (regex.test(text)) {
        return action;
      }
    }

    return 'moving';
  }

  /**
   * Extracts objects including color-object combinations from predefined list
   */
  static extractExactObjects(text) {
    const objectWords = TIER_25_UNIFIED_VOCABULARY_EXTENDED.objects.toys
      .concat(TIER_25_UNIFIED_VOCABULARY_EXTENDED.objects.nature)
      .concat(TIER_25_UNIFIED_VOCABULARY_EXTENDED.objects.household)
      .concat(TIER_25_UNIFIED_VOCABULARY_EXTENDED.objects.animals);
      
    const colors = TIER_25_UNIFIED_VOCABULARY_EXTENDED.colors.basic;

    const foundObjects = [];

    // Look for color-object combinations first
    for (const color of colors) {
      for (const object of objectWords) {
        const colorObjectRegex = new RegExp(`\\b${color}\\s+${object}\\b`, 'i');
        if (colorObjectRegex.test(text)) {
          foundObjects.push(`${color} ${object}`);
        }
      }
    }

    // Then look for standalone objects
    for (const object of objectWords) {
      const regex = new RegExp(`\\b${object}\\b`, 'i');
      if (regex.test(text) && !foundObjects.some(found => found.includes(object))) {
        foundObjects.push(object);
      }
    }

    return foundObjects.length > 0 ? foundObjects : ['something special'];
  }

  /**
   * Extracts location-based setting words with honest contextual inference
   */
  static extractExactSetting(text) {
    // CRITICAL FIX: Use correct vocabulary paths from tier25Vocabulary.js
    const settingWords = TIER_25_UNIFIED_VOCABULARY_EXTENDED.contextDetection.outdoor
      .concat(TIER_25_UNIFIED_VOCABULARY_EXTENDED.contextDetection.indoor);

    // Look for exact setting word matches first
    for (const setting of settingWords) {
      const regex = new RegExp(`\\b${setting}\\b`, 'i');
      if (regex.test(text)) {
        return setting;
      }
    }

    // Contextual inference based on activity
    const activityBasedSettings = [
      { regex: /\b(sleep|sleeping|bed|bedroom)\b/i, setting: 'bedroom' },
      { regex: /\b(cook|cooking|kitchen|eat|eating)\b/i, setting: 'kitchen' },
      { regex: /\b(play|playing|playground|swing|slide)\b/i, setting: 'playground' },
      { regex: /\b(read|reading|library|book)\b/i, setting: 'library' },
      { regex: /\b(swim|swimming|pool|water)\b/i, setting: 'pool' },
      { regex: /\b(run|running|jog|jogging|exercise)\b/i, setting: 'park' },
      { regex: /\b(school|class|classroom|teacher)\b/i, setting: 'school' },
      { regex: /\b(home|house)\b/i, setting: 'home' },
      { regex: /\b(outside|outdoors|nature|tree|grass)\b/i, setting: 'outdoors' },
      { regex: /\b(inside|indoors|room)\b/i, setting: 'indoors' }
    ];

    for (const { regex, setting } of activityBasedSettings) {
      if (regex.test(text)) {
        return setting;
      }
    }

    // Honest fallback: empty string (no more lies)
    return '';
  }

  /**
   * Builds a formulaic template using exact extracted words
   */
  static buildFormulaikTemplate(exact) {
    const action = exact.action || 'moving';
    const objects = exact.objects && exact.objects.length > 0 ? exact.objects.join(' and ') : 'something special';
    const setting = exact.setting || '';

    // Build template with honest setting logic
    if (setting) {
      return `A character ${action} with ${objects} in a ${setting}`;
    } else {
      return `A character ${action} with ${objects}`;
    }
  }

  /**
   * Creates a hybrid prompt combining formulaic template with visual enhancements
   */
  static buildHybridPrompt(pageText, visualEnhancements = '') {
    const extractedWords = this.extractExactWords(pageText);
    const formulaicTemplate = this.buildFormulaikTemplate(extractedWords);
    
    let hybridPrompt = formulaicTemplate;
    
    if (visualEnhancements.trim()) {
      hybridPrompt += `, ${visualEnhancements.trim()}`;
    }
    
    return hybridPrompt;
  }
}