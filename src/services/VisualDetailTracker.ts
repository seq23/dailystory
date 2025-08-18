// Visual Detail Tracker - Enhanced Object & Detail Memory System
// Tracks colors, clothing, objects, props across story pages for visual consistency

export interface VisualDetail {
  id: string;
  type: 'color' | 'clothing' | 'object' | 'animal' | 'vehicle' | 'accessory';
  name: string;
  description: string;
  firstMentionedPage: number;
  lastMentionedPage: number;
  context: string; // Context where it was mentioned
  attributes: Map<string, string>; // color, size, material, etc.
}

export interface ObjectConsistencyRule {
  pattern: RegExp;
  type: VisualDetail['type'];
  attributeExtractors: Map<string, RegExp>;
}

export class VisualDetailTracker {
  private static detailRegistry: Map<string, Map<string, VisualDetail>> = new Map();
  
  // Pattern matching for automatic detail detection
  private static readonly DETECTION_PATTERNS: ObjectConsistencyRule[] = [
    {
      pattern: /\b(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\s+(bird|cat|dog|horse|rabbit|mouse|bear|elephant|lion|tiger|fox|owl|eagle|duck|frog|fish)\b/gi,
      type: 'animal',
      attributeExtractors: new Map([
        ['color', /\b(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\b/i]
      ])
    },
    {
      pattern: /\b(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\s+(car|truck|bike|bicycle|boat|plane|train|bus)\b/gi,
      type: 'vehicle',
      attributeExtractors: new Map([
        ['color', /\b(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\b/i]
      ])
    },
    {
      pattern: /\b(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\s+(shirt|dress|hat|shoes|coat|jacket|pants|skirt|sweater|backpack|bag)\b/gi,
      type: 'clothing',
      attributeExtractors: new Map([
        ['color', /\b(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\b/i]
      ])
    },
    {
      pattern: /\b(big|small|tiny|huge|large|little)\s+(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\s+(ball|balloon|flower|tree|house|castle|tower|book|toy)\b/gi,
      type: 'object',
      attributeExtractors: new Map([
        ['size', /\b(big|small|tiny|huge|large|little)\b/i],
        ['color', /\b(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\b/i]
      ])
    },
    {
      pattern: /\b(sparkly|shiny|glittery|golden|silver|magical)\s+(crown|wand|necklace|ring|bracelet|tiara)\b/gi,
      type: 'accessory',
      attributeExtractors: new Map([
        ['material', /\b(sparkly|shiny|glittery|golden|silver|magical)\b/i]
      ])
    }
  ];

  static analyzeTextForDetails(sessionId: string, text: string, pageNumber: number): VisualDetail[] {
    const details: VisualDetail[] = [];
    const sessionRegistry = this.getOrCreateSessionRegistry(sessionId);

    for (const rule of this.DETECTION_PATTERNS) {
      const matches = text.matchAll(rule.pattern);
      
      for (const match of matches) {
        const fullMatch = match[0];
        const detailName = this.extractDetailName(fullMatch);
        const detailId = this.generateDetailId(detailName, rule.type);
        
        // Check if this detail already exists
        const existingDetail = sessionRegistry.get(detailId);
        
        if (existingDetail) {
          // Update existing detail
          existingDetail.lastMentionedPage = pageNumber;
          existingDetail.context += ` | Page ${pageNumber}: ${match.input?.slice(match.index! - 20, match.index! + match[0].length + 20)}`;
        } else {
          // Create new detail
          const attributes = new Map<string, string>();
          
          // Extract attributes using rule extractors
          for (const [attrName, extractor] of rule.attributeExtractors) {
            const attrMatch = fullMatch.match(extractor);
            if (attrMatch) {
              attributes.set(attrName, attrMatch[1]);
            }
          }
          
          const newDetail: VisualDetail = {
            id: detailId,
            type: rule.type,
            name: detailName,
            description: fullMatch,
            firstMentionedPage: pageNumber,
            lastMentionedPage: pageNumber,
            context: `Page ${pageNumber}: ${match.input?.slice(match.index! - 20, match.index! + match[0].length + 20)}`,
            attributes
          };
          
          sessionRegistry.set(detailId, newDetail);
          details.push(newDetail);
          
          console.log(`🎨 Detected new visual detail: ${detailName} (${rule.type}) on page ${pageNumber}`);
        }
      }
    }

    return details;
  }

  static getConsistentDetailDescription(sessionId: string, detailName: string, type: VisualDetail['type']): string | null {
    const sessionRegistry = this.detailRegistry.get(sessionId);
    if (!sessionRegistry) return null;

    const detailId = this.generateDetailId(detailName, type);
    const detail = sessionRegistry.get(detailId);
    
    if (!detail) return null;

    // Build consistent description from stored attributes
    let description = detail.name;
    
    if (detail.attributes.has('color')) {
      description = `${detail.attributes.get('color')} ${description}`;
    }
    
    if (detail.attributes.has('size')) {
      description = `${detail.attributes.get('size')} ${description}`;
    }
    
    if (detail.attributes.has('material')) {
      description = `${detail.attributes.get('material')} ${description}`;
    }

    console.log(`🔗 Retrieved consistent detail: ${description}`);
    return description;
  }

  static injectConsistentDetails(sessionId: string, text: string, pageNumber: number): string {
    const sessionRegistry = this.detailRegistry.get(sessionId);
    if (!sessionRegistry) return text;

    let enhancedText = text;

    // Find vague references and replace with consistent descriptions
    for (const [detailId, detail] of sessionRegistry) {
      if (detail.lastMentionedPage < pageNumber) {
        // Look for vague references like "the bird", "the car", etc.
        const vaguePatterns = [
          new RegExp(`\\bthe\\s+${detail.name}\\b`, 'gi'),
          new RegExp(`\\ba\\s+${detail.name}\\b`, 'gi'),
          new RegExp(`\\b${detail.name}\\b(?!\\s+(was|is|had))`, 'gi') // Avoid replacing in descriptive sentences
        ];

        for (const pattern of vaguePatterns) {
          const matches = enhancedText.matchAll(pattern);
          for (const match of matches) {
            // Build consistent replacement
            let replacement = detail.name;
            
            if (detail.attributes.has('color')) {
              replacement = `${detail.attributes.get('color')} ${replacement}`;
            }
            
            // Preserve article structure
            if (match[0].toLowerCase().startsWith('the ')) {
              replacement = `the ${replacement}`;
            } else if (match[0].toLowerCase().startsWith('a ')) {
              replacement = `a ${replacement}`;
            }

            enhancedText = enhancedText.replace(match[0], replacement);
            console.log(`🔄 Enhanced "${match[0]}" → "${replacement}" for consistency`);
          }
        }
      }
    }

    return enhancedText;
  }

  static getSessionDetails(sessionId: string): VisualDetail[] {
    const sessionRegistry = this.detailRegistry.get(sessionId);
    return sessionRegistry ? Array.from(sessionRegistry.values()) : [];
  }

  static clearSessionDetails(sessionId: string): void {
    this.detailRegistry.delete(sessionId);
    console.log(`🗑️ Cleared visual details for session: ${sessionId}`);
  }

  static getDetailsByType(sessionId: string, type: VisualDetail['type']): VisualDetail[] {
    const sessionRegistry = this.detailRegistry.get(sessionId);
    if (!sessionRegistry) return [];

    return Array.from(sessionRegistry.values()).filter(detail => detail.type === type);
  }

  static updateDetailAttributes(sessionId: string, detailId: string, attributes: Map<string, string>): void {
    const sessionRegistry = this.detailRegistry.get(sessionId);
    if (!sessionRegistry) return;

    const detail = sessionRegistry.get(detailId);
    if (detail) {
      for (const [key, value] of attributes) {
        detail.attributes.set(key, value);
      }
      console.log(`✏️ Updated detail attributes for: ${detail.name}`);
    }
  }

  // Helper methods
  private static getOrCreateSessionRegistry(sessionId: string): Map<string, VisualDetail> {
    if (!this.detailRegistry.has(sessionId)) {
      this.detailRegistry.set(sessionId, new Map());
    }
    return this.detailRegistry.get(sessionId)!;
  }

  private static extractDetailName(fullMatch: string): string {
    // Extract the main noun (last word typically)
    const words = fullMatch.trim().split(/\s+/);
    return words[words.length - 1].toLowerCase();
  }

  private static generateDetailId(name: string, type: VisualDetail['type']): string {
    return `${type}_${name.toLowerCase().replace(/\s+/g, '_')}`;
  }

  // Advanced analysis for complex objects
  static detectComplexObjects(text: string): { type: string; description: string; attributes: Map<string, string> }[] {
    const complexObjects = [];
    
    // Pattern for compound objects: "Emma's red and blue striped backpack"
    const compoundPattern = /(\w+)'s\s+((?:\w+\s+(?:and|or)\s+\w+\s+)*\w+)\s+(\w+)/gi;
    const matches = text.matchAll(compoundPattern);
    
    for (const match of matches) {
      const owner = match[1];
      const descriptors = match[2];
      const object = match[3];
      
      const attributes = new Map<string, string>();
      attributes.set('owner', owner);
      
      // Extract color patterns from descriptors
      const colorPattern = /\b(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\b/gi;
      const colors = descriptors.match(colorPattern);
      if (colors) {
        attributes.set('colors', colors.join(' and '));
      }
      
      // Extract pattern descriptors
      const patternMatch = descriptors.match(/\b(striped|spotted|checkered|polka dot|solid)\b/i);
      if (patternMatch) {
        attributes.set('pattern', patternMatch[1]);
      }
      
      complexObjects.push({
        type: 'object',
        description: `${owner}'s ${descriptors} ${object}`,
        attributes
      });
    }
    
    return complexObjects;
  }
}