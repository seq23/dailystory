/**
 * Visual Detail Tracker - Simplified Implementation
 * Tracks and manages visual details for consistency across story pages
 */

export class VisualDetailTracker {
  // Static registry to store details for each session
  static detailRegistry = new Map();

  /**
   * Analyze text for visual details and store them for consistency
   */
  static analyzeTextForDetails(sessionId, text, pageNumber) {
    console.log(`🎨 VisualDetailTracker - Analyzing text for session ${sessionId}, page ${pageNumber}`);
    
    if (!sessionId || !text) return;
    
    // Initialize session registry if needed
    if (!this.detailRegistry.has(sessionId)) {
      this.detailRegistry.set(sessionId, new Map());
    }
    
    const sessionDetails = this.detailRegistry.get(sessionId);
    
    // Extract visual details using patterns
    const colorPattern = /(red|blue|green|yellow|purple|orange|pink|brown|black|white|gray|grey)\s+(car|house|dress|shirt|hat|ball|toy|flower)/gi;
    const sizePattern = /(big|small|large|tiny|huge|little)\s+(car|house|tree|dog|cat|ball|toy)/gi;
    
    // Process color details
    let match;
    while ((match = colorPattern.exec(text)) !== null) {
      const color = match[1].toLowerCase();
      const object = match[2].toLowerCase();
      const detailKey = `${object}_color`;
      
      if (!sessionDetails.has(detailKey)) {
        sessionDetails.set(detailKey, {
          type: 'color',
          object: object,
          value: color,
          firstSeen: pageNumber,
          lastSeen: pageNumber
        });
        console.log(`🎨 New color detail: ${object} is ${color}`);
      } else {
        // Update last seen
        const existing = sessionDetails.get(detailKey);
        existing.lastSeen = pageNumber;
      }
    }
    
    // Process size details
    while ((match = sizePattern.exec(text)) !== null) {
      const size = match[1].toLowerCase();
      const object = match[2].toLowerCase();
      const detailKey = `${object}_size`;
      
      if (!sessionDetails.has(detailKey)) {
        sessionDetails.set(detailKey, {
          type: 'size',
          object: object,
          value: size,
          firstSeen: pageNumber,
          lastSeen: pageNumber
        });
        console.log(`📏 New size detail: ${object} is ${size}`);
      } else {
        // Update last seen
        const existing = sessionDetails.get(detailKey);
        existing.lastSeen = pageNumber;
      }
    }
  }

  /**
   * Get consistent detail description for a tracked object
   */
  static getConsistentDetailDescription(sessionId, detailName, type) {
    if (!this.detailRegistry.has(sessionId)) return null;
    
    const sessionDetails = this.detailRegistry.get(sessionId);
    const detailKey = `${detailName}_${type}`;
    
    if (sessionDetails.has(detailKey)) {
      const detail = sessionDetails.get(detailKey);
      return `${detail.value} ${detail.object}`;
    }
    
    return null;
  }

  /**
   * Inject consistent details into text
   */
  static injectConsistentDetails(sessionId, text, pageNumber) {
    if (!this.detailRegistry.has(sessionId)) return text;
    
    let updatedText = text;
    const sessionDetails = this.detailRegistry.get(sessionId);
    
    // Replace vague references with consistent descriptions
    sessionDetails.forEach((detail, key) => {
      if (detail.type === 'color') {
        const vaguePattern = new RegExp(`\\bthe\\s+${detail.object}\\b`, 'gi');
        updatedText = updatedText.replace(vaguePattern, `the ${detail.value} ${detail.object}`);
      }
    });
    
    return updatedText;
  }

  /**
   * Get all visual details for a session as prompt addition
   */
  static getVisualDetailsForPrompt(sessionId) {
    if (!this.detailRegistry.has(sessionId)) return '';
    
    const sessionDetails = this.detailRegistry.get(sessionId);
    const details = [];
    
    sessionDetails.forEach((detail) => {
      details.push(`${detail.value} ${detail.object}`);
    });
    
    return details.join(', ');
  }

  /**
   * Clear all details for a session
   */
  static clearSessionDetails(sessionId) {
    if (this.detailRegistry.has(sessionId)) {
      this.detailRegistry.delete(sessionId);
      console.log(`🧹 Cleared visual details for session ${sessionId}`);
    }
  }
}