/**
 * ExactWordExtractor - Extracts exact words from text to create formulaic templates
 * Preserves original grammatical form and specific details of a story
 * 
 * Converted from TypeScript to JavaScript for Supabase Edge Functions
 */

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
  static async extractExactAction(text) {
    try {
      const { PLACEHOLDER_POOLS } = await import("./tier25Vocabulary.js");
      const actionWords = PLACEHOLDER_POOLS.activities || [
        'running', 'jumping', 'flying', 'swimming', 'dancing', 'singing', 'laughing',
        'crying', 'walking', 'skipping', 'hopping', 'crawling', 'climbing', 'sliding',
        'rolling', 'spinning', 'twirling', 'bouncing', 'wiggling', 'giggling',
        'playing', 'hiding', 'seeking', 'chasing', 'catching', 'throwing', 'kicking',
        'pushing', 'pulling', 'lifting', 'carrying', 'holding', 'hugging', 'kissing',
        'waving', 'pointing', 'clapping', 'stomping', 'marching', 'tiptoeing',
        'sneaking', 'peeking', 'watching', 'looking', 'staring', 'blinking',
        'sleeping', 'dreaming', 'yawning', 'stretching', 'eating', 'drinking',
        'cooking', 'baking', 'reading', 'writing', 'drawing', 'painting',
        'building', 'digging', 'planting', 'watering', 'picking', 'collecting'
      ];

      // Look for exact action word matches
      for (const action of actionWords) {
        const regex = new RegExp(`\\b${action}\\b`, 'i');
        if (regex.test(text)) {
          return action;
        }
      }
    } catch (error) {
      console.warn('Failed to load tier25Vocabulary for actions:', error);
    }

    return 'moving';
  }

  /**
   * Extracts objects including color-object combinations from predefined list
   */
  static async extractExactObjects(text) {
    try {
      const { PLACEHOLDER_POOLS } = await import("./tier25Vocabulary.js");
      const objectWords = PLACEHOLDER_POOLS.animals?.concat(PLACEHOLDER_POOLS.foods || []) || [
        'ball', 'toy', 'book', 'flower', 'tree', 'rock', 'stone', 'stick', 'leaf',
        'butterfly', 'bird', 'cat', 'dog', 'rabbit', 'squirrel', 'fish', 'frog',
        'bear', 'elephant', 'lion', 'tiger', 'monkey', 'giraffe', 'zebra',
        'house', 'castle', 'bridge', 'tower', 'gate', 'door', 'window',
        'car', 'truck', 'boat', 'plane', 'train', 'bicycle', 'wagon',
        'apple', 'banana', 'orange', 'strawberry', 'cherry', 'grape',
        'sun', 'moon', 'star', 'cloud', 'rainbow', 'mountain', 'hill',
        'pond', 'lake', 'river', 'ocean', 'beach', 'forest', 'garden',
        'hat', 'dress', 'shirt', 'shoes', 'crown', 'necklace', 'ring'
      ];

      const colors = PLACEHOLDER_POOLS.colors || [
        'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown',
        'black', 'white', 'gray', 'silver', 'gold', 'rainbow', 'colorful'
      ];

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
      
    } catch (error) {
      console.warn('Failed to load tier25Vocabulary for objects:', error);
      return ['something special'];
    }
  }

  /**
   * Extracts location-based setting words from predefined list
   */
  static async extractExactSetting(text) {
    try {
      const { PLACEHOLDER_POOLS } = await import("./tier25Vocabulary.js");
      const settingWords = PLACEHOLDER_POOLS.settings || [
        'forest', 'woods', 'jungle', 'garden', 'park', 'playground', 'backyard',
        'field', 'meadow', 'farm', 'barn', 'stable', 'cottage', 'house', 'castle',
        'village', 'town', 'city', 'street', 'road', 'path', 'trail',
        'beach', 'shore', 'ocean', 'sea', 'lake', 'pond', 'river', 'stream',
        'mountain', 'hill', 'valley', 'cave', 'cliff', 'desert', 'island',
        'sky', 'clouds', 'space', 'moon', 'stars', 'rainbow',
        'classroom', 'library', 'kitchen', 'bedroom', 'attic', 'basement',
        'bridge', 'tower', 'treehouse', 'nest', 'burrow', 'den'
      ];

      // Look for exact setting word matches
      for (const setting of settingWords) {
        const regex = new RegExp(`\\b${setting}\\b`, 'i');
        if (regex.test(text)) {
          return setting;
        }
      }

      return 'magical place';
      
    } catch (error) {
      console.warn('Failed to load tier25Vocabulary for settings:', error);
      return 'magical place';
    }
  }

  /**
   * Builds a formulaic template using exact extracted words
   */
  static buildFormulaikTemplate(exact) {
    const action = exact.action || 'moving';
    const objects = exact.objects && exact.objects.length > 0 ? exact.objects.join(' and ') : 'something special';
    const setting = exact.setting || 'magical place';

    return `A character ${action} with ${objects} in a ${setting}`;
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