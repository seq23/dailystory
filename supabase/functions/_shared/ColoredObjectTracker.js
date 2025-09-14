/**
 * COLORED OBJECT PERSISTENCE SYSTEM - PHASE 4 
 * Tracks and maintains consistency of colored objects across story pages
 * Integrates with tier25Vocabulary for comprehensive object tracking
 */

import { VOCABULARY, pick, PLACEHOLDER_POOLS } from './tier25Vocabulary.js';

export class ColoredObjectTracker {
  constructor() {
    this.objectCache = new Map();
    this.sessionObjects = new Map();
    this.maxObjectsPerSession = 100;
  }

  /**
   * MASTER OBJECT TRACKING - Detect and track all colored objects
   */
  trackColoredObjects(text, context = {}) {
    const { sessionId, pageNumber = 1, userInfo = {} } = context;
    
    if (!text || typeof text !== 'string') {
      return { objects: [], consistency: [] };
    }

    try {
      const results = {
        objects: this.detectColoredObjects(text, context),
        consistency: this.checkObjectConsistency(text, sessionId),
        recommendations: [],
        success: true
      };

      // Store objects for consistency tracking
      if (sessionId) {
        this.storeSessionObjects(sessionId, pageNumber, results.objects);
      }

      // Generate consistency recommendations
      results.recommendations = this.generateConsistencyRecommendations(results);

      console.log(`🎨 [ColoredObjectTracker] Tracked ${results.objects.length} colored objects for session ${sessionId}`);
      
      return results;

    } catch (error) {
      console.warn('⚠️ [ColoredObjectTracker] Tracking error (non-blocking):', error.message);
      return { objects: [], consistency: [], recommendations: [], success: false, error: error.message };
    }
  }

  /**
   * 1. DETECT COLORED OBJECTS using tier25Vocabulary
   */
  detectColoredObjects(text, context) {
    const detectedObjects = [];
    
    // Get vocabularies
    const colors = VOCABULARY.colors || ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white'];
    const objects = VOCABULARY.objects || PLACEHOLDER_POOLS.objects || ['ball', 'car', 'house', 'tree', 'flower', 'book'];
    const sizes = ['big', 'small', 'tiny', 'huge', 'large', 'little'];

    // Enhanced detection patterns
    const colorObjectPatterns = [
      // Basic: color + object
      new RegExp(`\\b(${colors.join('|')})\\s+(${objects.join('|')})s?\\b`, 'gi'),
      
      // Size + color + object
      new RegExp(`\\b(${sizes.join('|')})\\s+(${colors.join('|')})\\s+(${objects.join('|')})s?\\b`, 'gi'),
      
      // Article + color + object
      new RegExp(`\\b(a|an|the)\\s+(${colors.join('|')})\\s+(${objects.join('|')})s?\\b`, 'gi'),
      
      // Possessive + color + object
      new RegExp(`\\b(my|his|her|their)\\s+(${colors.join('|')})\\s+(${objects.join('|')})s?\\b`, 'gi'),
      
      // Object with color description
      new RegExp(`\\b(${objects.join('|')})s?\\s+(?:that|which)\\s+(?:is|was|are|were)\\s+(${colors.join('|')})\\b`, 'gi')
    ];

    // Process each pattern
    colorObjectPatterns.forEach((pattern, patternIndex) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const objectData = this.parseObjectMatch(match, patternIndex);
        
        if (objectData && !this.isDuplicateObject(detectedObjects, objectData)) {
          detectedObjects.push({
            ...objectData,
            position: match.index,
            confidence: this.calculateObjectConfidence(match[0], text),
            pageNumber: context.pageNumber || 1,
            sessionId: context.sessionId
          });
        }
      }
    });

    return detectedObjects.slice(0, 20); // Limit to prevent bloat
  }

  /**
   * 2. CHECK OBJECT CONSISTENCY across pages
   */
  checkObjectConsistency(text, sessionId) {
    if (!sessionId) return [];

    const consistencyIssues = [];
    const currentObjects = this.detectColoredObjects(text, { sessionId });
    const previousObjects = this.getSessionObjects(sessionId);

    // Check for color conflicts
    currentObjects.forEach(currentObj => {
      const previousVersions = previousObjects.filter(prevObj => 
        prevObj.object === currentObj.object && prevObj.color !== currentObj.color
      );

      if (previousVersions.length > 0) {
        consistencyIssues.push({
          type: 'color_conflict',
          object: currentObj.object,
          currentColor: currentObj.color,
          previousColors: previousVersions.map(p => p.color),
          severity: 'medium',
          recommendation: `Consider using ${previousVersions[0].color} ${currentObj.object} for consistency`
        });
      }
    });

    // Check for size conflicts
    currentObjects.forEach(currentObj => {
      if (currentObj.size) {
        const previousVersions = previousObjects.filter(prevObj => 
          prevObj.object === currentObj.object && prevObj.size && prevObj.size !== currentObj.size
        );

        if (previousVersions.length > 0) {
          consistencyIssues.push({
            type: 'size_conflict',
            object: currentObj.object,
            currentSize: currentObj.size,
            previousSizes: previousVersions.map(p => p.size),
            severity: 'low',
            recommendation: `Consider maintaining ${previousVersions[0].size} size for ${currentObj.object}`
          });
        }
      }
    });

    return consistencyIssues;
  }

  /**
   * 3. GENERATE CONSISTENCY RECOMMENDATIONS
   */
  generateConsistencyRecommendations(results) {
    const recommendations = [];
    
    // Consistency recommendations
    results.consistency.forEach(issue => {
      if (issue.severity === 'medium' || issue.severity === 'high') {
        recommendations.push(issue.recommendation);
      }
    });

    // Object enrichment recommendations
    const objectCounts = {};
    results.objects.forEach(obj => {
      objectCounts[obj.object] = (objectCounts[obj.object] || 0) + 1;
    });

    Object.entries(objectCounts).forEach(([object, count]) => {
      if (count > 2) {
        recommendations.push(`Consider varying descriptions of ${object} to avoid repetition`);
      }
    });

    return recommendations.slice(0, 5); // Limit recommendations
  }

  /**
   * PARSING AND UTILITY FUNCTIONS
   */
  parseObjectMatch(match, patternIndex) {
    const fullMatch = match[0];
    
    try {
      switch (patternIndex) {
        case 0: // color + object
          return {
            color: match[1],
            object: match[2],
            fullDescription: fullMatch,
            type: 'colored_object'
          };
          
        case 1: // size + color + object
          return {
            size: match[1],
            color: match[2],
            object: match[3],
            fullDescription: fullMatch,
            type: 'sized_colored_object'
          };
          
        case 2: // article + color + object
          return {
            article: match[1],
            color: match[2],
            object: match[3],
            fullDescription: fullMatch,
            type: 'article_colored_object'
          };
          
        case 3: // possessive + color + object
          return {
            possessive: match[1],
            color: match[2],
            object: match[3],
            fullDescription: fullMatch,
            type: 'possessive_colored_object'
          };
          
        case 4: // object + color description
          return {
            object: match[1],
            color: match[2],
            fullDescription: fullMatch,
            type: 'described_colored_object'
          };
          
        default:
          return null;
      }
    } catch (error) {
      console.warn('⚠️ [ColoredObjectTracker] Parse error:', error.message);
      return null;
    }
  }

  isDuplicateObject(existing, newObject) {
    return existing.some(obj => 
      obj.object === newObject.object && 
      obj.color === newObject.color &&
      obj.size === newObject.size
    );
  }

  calculateObjectConfidence(match, fullText) {
    let confidence = 0.6;
    
    // Higher confidence for longer descriptions
    if (match.length > 15) confidence += 0.2;
    
    // Higher confidence for possessive or article usage
    if (/\b(my|his|her|their|the|a|an)\b/i.test(match)) confidence += 0.1;
    
    // Higher confidence for size descriptors
    if (/\b(big|small|tiny|huge|large|little)\b/i.test(match)) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * STORAGE AND RETRIEVAL
   */
  storeSessionObjects(sessionId, pageNumber, objects) {
    if (!this.sessionObjects.has(sessionId)) {
      this.sessionObjects.set(sessionId, []);
    }
    
    const sessionData = this.sessionObjects.get(sessionId);
    
    // Add new objects
    objects.forEach(obj => {
      sessionData.push({
        ...obj,
        pageNumber,
        timestamp: Date.now()
      });
    });
    
    // Prevent memory bloat
    if (sessionData.length > this.maxObjectsPerSession) {
      sessionData.splice(0, sessionData.length - this.maxObjectsPerSession);
    }
    
    this.sessionObjects.set(sessionId, sessionData);
  }

  getSessionObjects(sessionId) {
    return this.sessionObjects.get(sessionId) || [];
  }

  getObjectHistory(sessionId, objectName) {
    const sessionObjects = this.getSessionObjects(sessionId);
    return sessionObjects.filter(obj => obj.object === objectName);
  }

  /**
   * CONSISTENCY HELPERS
   */
  getConsistentObjectDescription(objectName, sessionId) {
    const history = this.getObjectHistory(sessionId, objectName);
    
    if (history.length === 0) return objectName;
    
    // Use most recent consistent description
    const recent = history[history.length - 1];
    const parts = [];
    
    if (recent.size) parts.push(recent.size);
    if (recent.color) parts.push(recent.color);
    parts.push(recent.object);
    
    return parts.join(' ');
  }

  generateObjectPromptAddition(trackedObjects) {
    const promptParts = [];
    
    trackedObjects.objects.forEach(obj => {
      const description = [];
      if (obj.size) description.push(obj.size);
      if (obj.color) description.push(obj.color);
      description.push(obj.object);
      
      promptParts.push(description.join(' '));
    });
    
    return promptParts.length > 0 ? `Objects: ${promptParts.join(', ')}` : '';
  }

  clearSessionObjects(sessionId) {
    if (sessionId) {
      this.sessionObjects.delete(sessionId);
    } else {
      this.sessionObjects.clear();
    }
  }

  /**
   * INTEGRATION WITH OTHER PHASES
   */
  getObjectsForVisualConsistency(sessionId) {
    const objects = this.getSessionObjects(sessionId);
    const consistentObjects = {};
    
    // Group by object type and get most consistent version
    objects.forEach(obj => {
      if (!consistentObjects[obj.object] || 
          consistentObjects[obj.object].timestamp < obj.timestamp) {
        consistentObjects[obj.object] = obj;
      }
    });
    
    return Object.values(consistentObjects);
  }
}

// Export singleton instance
export const coloredObjectTracker = new ColoredObjectTracker();