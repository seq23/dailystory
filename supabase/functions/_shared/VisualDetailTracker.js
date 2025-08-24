// VisualDetailTracker - Backend JavaScript version
// Tracks visual details and object consistency across story pages

class VisualDetailTracker {
  static detailRegistry = new Map();

  static analyzeTextForDetails(sessionId, text, pageNumber) {
    if (!this.detailRegistry.has(sessionId)) {
      this.detailRegistry.set(sessionId, []);
    }
    
    const sessionDetails = this.detailRegistry.get(sessionId);
    const newDetails = [];
    
    // Detection patterns for objects with attributes
    const patterns = [
      {
        regex: /(a|an|the)?\s*(big|small|tiny|huge|large|little)?\s*(red|blue|green|yellow|purple|orange|pink|black|white|brown|gray)\s+(car|ball|book|toy|bike|house|tree|flower|bird|cat|dog|dress|shirt|hat|shoes)/gi,
        type: 'object',
        extractAttributes: (match) => {
          const attributes = new Map();
          const words = match.toLowerCase().split(/\s+/);
          
          // Extract color
          const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'black', 'white', 'brown', 'gray'];
          const color = words.find(word => colors.includes(word));
          if (color) attributes.set('color', color);
          
          // Extract size
          const sizes = ['big', 'small', 'tiny', 'huge', 'large', 'little'];
          const size = words.find(word => sizes.includes(word));
          if (size) attributes.set('size', size);
          
          return attributes;
        },
        extractName: (match) => {
          const objects = ['car', 'ball', 'book', 'toy', 'bike', 'house', 'tree', 'flower', 'bird', 'cat', 'dog', 'dress', 'shirt', 'hat', 'shoes'];
          const words = match.toLowerCase().split(/\s+/);
          return words.find(word => objects.includes(word)) || 'object';
        }
      },
      {
        regex: /(sunny|rainy|cloudy|snowy|foggy|stormy)\s+(day|morning|afternoon|evening|night)/gi,
        type: 'weather',
        extractAttributes: (match) => {
          const attributes = new Map();
          const words = match.toLowerCase().split(/\s+/);
          const weather = ['sunny', 'rainy', 'cloudy', 'snowy', 'foggy', 'stormy'];
          const time = ['day', 'morning', 'afternoon', 'evening', 'night'];
          
          const weatherType = words.find(word => weather.includes(word));
          const timeOfDay = words.find(word => time.includes(word));
          
          if (weatherType) attributes.set('weather', weatherType);
          if (timeOfDay) attributes.set('time', timeOfDay);
          
          return attributes;
        },
        extractName: (match) => 'weather'
      }
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.regex.exec(text)) !== null) {
        const fullMatch = match[0];
        const name = pattern.extractName(fullMatch);
        const attributes = pattern.extractAttributes(fullMatch);
        const detailId = `${sessionId}-${name}-${pageNumber}`;
        
        // Check if this detail already exists
        const existingDetail = sessionDetails.find(d => d.name === name && d.type === pattern.type);
        
        if (existingDetail) {
          // Update existing detail
          existingDetail.lastMentionedPage = pageNumber;
          // Merge attributes
          attributes.forEach((value, key) => {
            existingDetail.attributes.set(key, value);
          });
        } else {
          // Create new detail
          const newDetail = {
            id: detailId,
            type: pattern.type,
            name: name,
            description: fullMatch,
            firstMentionedPage: pageNumber,
            lastMentionedPage: pageNumber,
            context: text.substring(Math.max(0, match.index - 50), match.index + fullMatch.length + 50),
            attributes: attributes
          };
          
          sessionDetails.push(newDetail);
          newDetails.push(newDetail);
        }
      }
    });
    
    return newDetails;
  }

  static getConsistentDetailDescription(sessionId, detailName, type) {
    if (!this.detailRegistry.has(sessionId)) {
      return null;
    }
    
    const sessionDetails = this.detailRegistry.get(sessionId);
    const detail = sessionDetails.find(d => d.name === detailName && d.type === type);
    
    if (!detail) return null;
    
    // Build description from attributes
    let description = '';
    
    if (detail.attributes.has('size')) {
      description += detail.attributes.get('size') + ' ';
    }
    
    if (detail.attributes.has('color')) {
      description += detail.attributes.get('color') + ' ';
    }
    
    description += detailName;
    
    return description.trim();
  }

  static injectConsistentDetails(sessionId, text, pageNumber) {
    if (!this.detailRegistry.has(sessionId)) {
      return text;
    }
    
    const sessionDetails = this.detailRegistry.get(sessionId);
    let enhancedText = text;
    
    // Replace vague references with consistent descriptions
    sessionDetails.forEach(detail => {
      if (detail.type === 'object') {
        // Look for patterns like "the car" or "a ball"
        const vaguePattern = new RegExp(`\\b(the|a|an)\\s+${detail.name}\\b`, 'gi');
        const consistentDescription = this.getConsistentDetailDescription(sessionId, detail.name, detail.type);
        
        if (consistentDescription && consistentDescription !== detail.name) {
          enhancedText = enhancedText.replace(vaguePattern, `the ${consistentDescription}`);
        }
      }
    });
    
    return enhancedText;
  }

  static getSessionDetails(sessionId) {
    return this.detailRegistry.get(sessionId) || [];
  }

  static clearSessionDetails(sessionId) {
    this.detailRegistry.delete(sessionId);
  }

  static getVisualDetailsForPrompt(sessionId) {
    const details = this.getSessionDetails(sessionId);
    
    if (details.length === 0) return null;
    
    const consistencyPrompts = [];
    
    details.forEach(detail => {
      const description = this.getConsistentDetailDescription(sessionId, detail.name, detail.type);
      if (description && description !== detail.name) {
        consistencyPrompts.push(`consistent ${description}`);
      }
    });
    
    return consistencyPrompts.length > 0 ? consistencyPrompts.join(', ') : null;
  }
}

// ES6 Export for modern modules (CommonJS removed for compatibility)
export { VisualDetailTracker };

// Also make it available as a global for direct import
globalThis.VisualDetailTracker = VisualDetailTracker;