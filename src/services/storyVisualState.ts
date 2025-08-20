// Story Visual State Manager - Runware-Optimized Implementation
// Maintains visual consistency, character seeds, and setting continuity

import type { UserInfo } from '@/types';
// VisualDetailTracker functionality merged into this class
// Note: AdvancedPronounResolver is now handled in backend only

export interface CharacterRelationship {
  characterA: string;
  characterB: string;
  relationshipType: 'friend' | 'sibling' | 'parent' | 'classmate' | 'neighbor' | 'pet' | 'companion';
  context: string;
  firstMentionedPage: number;
  lastMentionedPage: number;
  interactionHistory: string[];
}

export interface VisualDetail {
  id: string;
  type: 'color' | 'clothing' | 'object' | 'animal' | 'vehicle' | 'accessory';
  name: string;
  description: string;
  firstMentionedPage: number;
  lastMentionedPage: number;
  context: string;
  attributes: Map<string, string>;
}

export interface CharacterState {
  name: string;
  description: string;
  seed?: number;
  lastUsedPage: number;
  successfulPrompts: string[];
}

export interface ObjectState {
  name: string;
  type: 'animal' | 'object' | 'vehicle' | 'clothing' | 'accessory';
  description: string;
  attributes: Map<string, string>;
  firstSeenPage: number;
  lastSeenPage: number;
  consistencyPrompts: string[];
}

export interface RunwareContext {
  seed?: number;
  cfgScale: number;
  model: string;
  steps: number;
  scheduler: string;
}

export interface StoryVisualState {
  sessionId: string;
  
  // Session continuity tracking
  sessionType: 'new' | 'continuation' | 'rewrite';
  isPersistent: boolean; // Controls whether state persists across stories
  
  // Character consistency with seeds
  characters: Map<string, CharacterState>;
  
  // Object and detail consistency
  objects: Map<string, ObjectState>;
  visualDetails: VisualDetail[];
  
  // Character relationships and pronoun resolution
  characterRelationships: CharacterRelationship[];
  recentCharacterMentions: string[];
  
  // Runware parameter locking
  runwareContext: RunwareContext;
  
  // Setting continuity
  setting: {
    primaryLocation: string;
    timeOfDay: string;
    weather: string;
    season: string;
    mood: string;
    isLocked: boolean;
  };
  
  // Location logic
  locationHistory: string[];
  allowedTransitions: Map<string, string[]>;
  
  // Page tracking
  currentPage: number;
  totalPages: number;
  
  // Pronoun resolution
  lastMentionedCharacters: string[];
  characterPairs: Map<string, string[]>;
}

export class StoryVisualStateManager {
  private static storyStates: Map<string, StoryVisualState> = new Map();
  
  private static readonly DEFAULT_RUNWARE_CONTEXT: RunwareContext = {
    cfgScale: 1.5,
    model: "runware:100@1",
    steps: 3,
    scheduler: "FlowMatchEulerDiscreteScheduler"
  };
  
  private static readonly LOCATION_TRANSITIONS: Map<string, string[]> = new Map([
    ['home', ['school', 'park', 'garden', 'yard', 'forest']],
    ['school', ['home', 'playground', 'park']],
    ['park', ['home', 'school', 'forest', 'beach']],
    ['forest', ['park', 'home', 'mountain', 'river']],
    ['beach', ['park', 'home']],
    ['garden', ['home', 'park', 'yard']],
    ['yard', ['home', 'garden', 'park']],
    ['playground', ['school', 'park']]
  ]);

  // Merged detection patterns from VisualDetailTracker
  private static readonly DETECTION_PATTERNS = [
    {
      pattern: /\b(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\s+(bird|cat|dog|horse|rabbit|mouse|bear|elephant|lion|tiger|fox|owl|eagle|duck|frog|fish)\b/gi,
      type: 'animal' as const,
      attributeExtractors: new Map([
        ['color', /\b(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\b/i]
      ])
    },
    {
      pattern: /\b(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\s+(car|truck|bike|bicycle|boat|plane|train|bus)\b/gi,
      type: 'vehicle' as const,
      attributeExtractors: new Map([
        ['color', /\b(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\b/i]
      ])
    },
    {
      pattern: /\b(big|small|tiny|huge|large|little)\s+(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\s+(ball|balloon|flower|tree|house|castle|tower|book|toy)\b/gi,
      type: 'object' as const,
      attributeExtractors: new Map([
        ['size', /\b(big|small|tiny|huge|large|little)\b/i],
        ['color', /\b(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\b/i]
      ])
    },
    {
      pattern: /\b(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\s+(dress|shirt|hat|shoes|coat|jacket|pants|skirt)\b/gi,
      type: 'clothing' as const,
      attributeExtractors: new Map([
        ['color', /\b(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\b/i]
      ])
    }
  ];

  static getOrCreateStoryState(
    sessionId: string, 
    totalPages: number = 10,
    sessionType: 'new' | 'continuation' | 'rewrite' = 'new',
    isPersistent: boolean = false
  ): StoryVisualState {
    if (!this.storyStates.has(sessionId)) {
      const newState: StoryVisualState = {
        sessionId,
        sessionType,
        isPersistent,
        characters: new Map(),
        objects: new Map(),
        visualDetails: [],
        characterRelationships: [],
        recentCharacterMentions: [],
        runwareContext: { ...this.DEFAULT_RUNWARE_CONTEXT },
        setting: {
          primaryLocation: '',
          timeOfDay: '',
          weather: '',
          season: '',
          mood: '',
          isLocked: false
        },
        locationHistory: [],
        allowedTransitions: new Map(this.LOCATION_TRANSITIONS),
        currentPage: 1,
        totalPages,
        lastMentionedCharacters: [],
        characterPairs: new Map()
      };
      
      this.storyStates.set(sessionId, newState);
      console.log(`📚 Created new story state for session: ${sessionId} (type: ${sessionType}, persistent: ${isPersistent})`);
    }
    
    return this.storyStates.get(sessionId)!;
  }

  static updateCharacterWithSeed(
    sessionId: string, 
    characterName: string, 
    description: string, 
    seed?: number,
    pageNumber: number = 1
  ): void {
    const state = this.getOrCreateStoryState(sessionId);
    
    const existingChar = state.characters.get(characterName);
    const characterState: CharacterState = {
      name: characterName,
      description,
      seed: seed || existingChar?.seed,
      lastUsedPage: pageNumber,
      successfulPrompts: existingChar?.successfulPrompts || []
    };
    
    state.characters.set(characterName, characterState);
    
    if (seed) {
      console.log(`🎭 Character "${characterName}" assigned seed: ${seed} for consistency`);
    }
  }

  static getCharacterSeed(sessionId: string, characterName: string): number | undefined {
    const state = this.storyStates.get(sessionId);
    return state?.characters.get(characterName)?.seed;
  }

  static addSuccessfulPrompt(sessionId: string, characterName: string, prompt: string): void {
    const state = this.storyStates.get(sessionId);
    if (state && state.characters.has(characterName)) {
      const char = state.characters.get(characterName)!;
      char.successfulPrompts.push(prompt);
      // Keep only last 3 successful prompts for reference
      if (char.successfulPrompts.length > 3) {
        char.successfulPrompts.shift();
      }
    }
  }

  static lockRunwareParameters(sessionId: string, context: Partial<RunwareContext>): void {
    const state = this.getOrCreateStoryState(sessionId);
    state.runwareContext = { ...state.runwareContext, ...context };
    console.log(`🔒 Locked Runware parameters for session: ${sessionId}`, context);
  }

  static getRunwareContext(sessionId: string): RunwareContext {
    const state = this.storyStates.get(sessionId);
    return state?.runwareContext || this.DEFAULT_RUNWARE_CONTEXT;
  }

  static updateSetting(
    sessionId: string, 
    pageNumber: number,
    newSetting: Partial<StoryVisualState['setting']>
  ): boolean {
    const state = this.getOrCreateStoryState(sessionId);
    
    // Lock setting after page 2
    if (pageNumber <= 2 && !state.setting.isLocked) {
      state.setting = { ...state.setting, ...newSetting };
      
      if (pageNumber === 2) {
        state.setting.isLocked = true;
        console.log(`🔒 Setting locked after page 2:`, state.setting);
      }
      
      return true;
    }
    
    // Allow logical progressions even after locking
    if (state.setting.isLocked && newSetting.timeOfDay) {
      const isValidTimeProgression = this.isValidTimeProgression(
        state.setting.timeOfDay, 
        newSetting.timeOfDay
      );
      
      if (isValidTimeProgression) {
        state.setting.timeOfDay = newSetting.timeOfDay;
        console.log(`⏰ Time progressed to: ${newSetting.timeOfDay}`);
        return true;
      }
    }
    
    // Allow mood evolution
    if (newSetting.mood && newSetting.mood !== state.setting.mood) {
      state.setting.mood = newSetting.mood;
      return true;
    }
    
    return false;
  }

  private static isValidTimeProgression(currentTime: string, newTime: string): boolean {
    const timeOrder = ['morning', 'afternoon', 'evening', 'night'];
    const currentIndex = timeOrder.indexOf(currentTime);
    const newIndex = timeOrder.indexOf(newTime);
    
    // Allow progression forward, but not backwards
    return newIndex > currentIndex;
  }

  static updateLocation(sessionId: string, newLocation: string): boolean {
    const state = this.getOrCreateStoryState(sessionId);
    
    // First location is always allowed
    if (state.locationHistory.length === 0) {
      state.locationHistory.push(newLocation);
      state.setting.primaryLocation = newLocation;
      return true;
    }
    
    const currentLocation = state.locationHistory[state.locationHistory.length - 1];
    const allowedTransitions = state.allowedTransitions.get(currentLocation) || [];
    
    // Check if transition is allowed
    if (allowedTransitions.includes(newLocation) || newLocation === currentLocation) {
      state.locationHistory.push(newLocation);
      return true;
    }
    
    console.log(`❌ Invalid location transition: ${currentLocation} → ${newLocation}`);
    return false;
  }

  static resolvePronouns(sessionId: string, text: string): string {
    const state = this.storyStates.get(sessionId);
    if (!state) return text;
    
    // Note: Advanced pronoun resolution is now handled in backend only
    // This frontend method now only does simple fallback resolution
    
    let resolvedText = text;
    
    // Simple fallback: Resolve "they" to last mentioned character pair
    if (resolvedText.includes('they') && state.lastMentionedCharacters.length >= 2) {
      const characterPair = state.lastMentionedCharacters.slice(-2).join(' and ');
      resolvedText = resolvedText.replace(/\bthey\b/gi, characterPair);
      console.log(`🔄 Frontend simple fallback resolved "they" to: ${characterPair}`);
    }
    
    // Track character mentions for future pronoun resolution
    const mentionedChars: string[] = [];
    for (const [charName] of state.characters) {
      if (text.toLowerCase().includes(charName.toLowerCase())) {
        mentionedChars.push(charName);
      }
    }
    
    if (mentionedChars.length > 0) {
      state.lastMentionedCharacters = mentionedChars;
      state.recentCharacterMentions = mentionedChars;
    }
    
    return resolvedText;
  }

  static updatePageProgress(sessionId: string, pageNumber: number): void {
    const state = this.getOrCreateStoryState(sessionId);
    state.currentPage = pageNumber;
  }

  static getVisualState(sessionId: string): StoryVisualState | undefined {
    return this.storyStates.get(sessionId);
  }

  static clearStoryState(sessionId: string): void {
    this.storyStates.delete(sessionId);
    // Note: AdvancedPronounResolver clearing is now handled in backend only
    console.log(`🗑️ Cleared frontend story state for session: ${sessionId}`);
  }

  /**
   * Clear character state based on user type and context
   */
  static clearBasedOnContext(
    sessionId: string, 
    isPremium: boolean, 
    context: 'next-story' | 'rewrite' | 'end-session' | 'new-session'
  ): void {
    const state = this.storyStates.get(sessionId);
    
    switch (context) {
      case 'next-story':
        // Free users: Always clear character state
        // Premium users: Keep character state (no clearing)
        if (!isPremium) {
          this.clearStoryState(sessionId);
          console.log(`🆓 Free user "Next Story": Cleared character state for fresh characters`);
        } else {
          console.log(`💎 Premium user "Next Story": Keeping character state for consistency`);
        }
        break;
        
      case 'rewrite':
        // Both free and premium: Always clear for rewrites
        this.clearStoryState(sessionId);
        console.log(`🔄 Story rewrite: Cleared character state for fresh start`);
        break;
        
      case 'end-session':
      case 'new-session':
        // Both free and premium: Always clear when ending/starting sessions
        this.clearStoryState(sessionId);
        console.log(`🏁 Session ended: Cleared character state`);
        break;
        
      default:
        console.warn(`Unknown context for cache clearing: ${context}`);
    }
  }

  /**
   * Create a continuation session that preserves character state
   */
  static createContinuationSession(
    originalSessionId: string, 
    newSessionId: string
  ): boolean {
    const originalState = this.storyStates.get(originalSessionId);
    if (!originalState) {
      console.warn(`Cannot create continuation: Original session ${originalSessionId} not found`);
      return false;
    }

    // Clone the original state for continuation
    const continuationState: StoryVisualState = {
      ...originalState,
      sessionId: newSessionId,
      sessionType: 'continuation',
      isPersistent: true,
      currentPage: 1, // Reset to page 1 for new story
      totalPages: 10, // Default for new story
      visualDetails: [], // Reset visual details for new story
      characterRelationships: [], // Reset relationships for new story
      recentCharacterMentions: [], // Reset mentions for new story
      // Keep characters, objects, and settings for consistency
    };

    this.storyStates.set(newSessionId, continuationState);
    console.log(`🔗 Created continuation session ${newSessionId} from ${originalSessionId}`);
    return true;
  }

  // Merged from VisualDetailTracker
  static analyzeTextForDetails(sessionId: string, text: string, pageNumber: number): VisualDetail[] {
    const details: VisualDetail[] = [];
    const state = this.getOrCreateStoryState(sessionId);

    for (const rule of this.DETECTION_PATTERNS) {
      const matches = text.matchAll(rule.pattern);
      
      for (const match of matches) {
        const fullMatch = match[0];
        const detailName = this.extractDetailName(fullMatch);
        const detailId = this.generateDetailId(detailName, rule.type);
        
        const existingDetail = state.visualDetails.find(d => d.id === detailId);
        
        if (existingDetail) {
          existingDetail.lastMentionedPage = pageNumber;
        } else {
          const attributes = new Map<string, string>();
          
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
            context: `Page ${pageNumber}`,
            attributes
          };
          
          state.visualDetails.push(newDetail);
          details.push(newDetail);
        }
      }
    }

    return details;
  }

  static injectConsistentDetails(sessionId: string, text: string, pageNumber: number): string {
    const state = this.storyStates.get(sessionId);
    if (!state) return text;

    let enhancedText = text;

    for (const detail of state.visualDetails) {
      if (detail.lastMentionedPage < pageNumber) {
        const vaguePattern = new RegExp(`\\bthe\\s+${detail.name}\\b`, 'gi');
        let replacement = detail.name;
        
        if (detail.attributes.has('color')) {
          replacement = `${detail.attributes.get('color')} ${replacement}`;
        }
        
        enhancedText = enhancedText.replace(vaguePattern, `the ${replacement}`);
      }
    }

    return enhancedText;
  }

  static getSessionDetails(sessionId: string): VisualDetail[] {
    const state = this.storyStates.get(sessionId);
    return state ? state.visualDetails : [];
  }

  static getConsistentDetailDescription(sessionId: string, detailName: string, type: VisualDetail['type']): string | null {
    const state = this.storyStates.get(sessionId);
    if (!state) return null;

    const detailId = this.generateDetailId(detailName, type);
    const detail = state.visualDetails.find(d => d.id === detailId);
    
    if (!detail) return null;

    let description = detail.name;
    
    if (detail.attributes.has('size')) {
      description = `${detail.attributes.get('size')} ${description}`;
    }
    
    if (detail.attributes.has('color')) {
      description = `${detail.attributes.get('color')} ${description}`;
    }

    return description;
  }

  static detectComplexObjects(text: string): { type: string; description: string; attributes: Map<string, string> }[] {
    const complexObjects = [];
    const compoundPattern = /(\w+)'s\s+((?:\w+\s+(?:and|or)\s+\w+\s+)*\w+)\s+(\w+)/gi;
    const matches = text.matchAll(compoundPattern);
    
    for (const match of matches) {
      const owner = match[1];
      const descriptors = match[2];
      const object = match[3];
      
      const attributes = new Map<string, string>();
      attributes.set('owner', owner);
      
      // Extract colors from descriptors
      const colorMatch = descriptors.match(/\b(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\b/gi);
      if (colorMatch) {
        attributes.set('colors', colorMatch.join(' and '));
      }
      
      // Extract patterns
      const patternMatch = descriptors.match(/\b(striped|spotted|checkered|polka-dotted)\b/gi);
      if (patternMatch) {
        attributes.set('pattern', patternMatch[0]);
      }
      
      complexObjects.push({
        type: 'object',
        description: `${owner}'s ${descriptors} ${object}`,
        attributes
      });
    }
    
    return complexObjects;
  }

  private static extractDetailName(fullMatch: string): string {
    const words = fullMatch.trim().split(/\s+/);
    return words[words.length - 1].toLowerCase();
  }

  private static generateDetailId(name: string, type: VisualDetail['type']): string {
    return `${type}_${name.toLowerCase().replace(/\s+/g, '_')}`;
  }

  static analyzeAndTrackVisualDetails(sessionId: string, text: string, pageNumber: number): VisualDetail[] {
    const state = this.getOrCreateStoryState(sessionId);
    
    // Note: Character relationship analysis is now handled in backend only
    // This frontend method focuses on visual details only
    
    // Analyze text for visual details using merged functionality
    const newDetails = this.analyzeTextForDetails(sessionId, text, pageNumber);
    
    // Also detect complex objects and add them to objects registry
    const complexObjects = this.detectComplexObjects(text);
    for (const obj of complexObjects) {
      const objectId = `${obj.type}_${obj.description.toLowerCase().replace(/\s+/g, '_')}`;
      const objectState: ObjectState = {
        name: obj.description,
        type: obj.type as ObjectState['type'],
        description: obj.description,
        attributes: obj.attributes,
        firstSeenPage: pageNumber,
        lastSeenPage: pageNumber,
        consistencyPrompts: []
      };
      
      state.objects.set(objectId, objectState);
      console.log(`🎯 Tracked complex object: ${obj.description}`);
    }
    
    return newDetails;
  }

  static enhanceTextWithConsistentDetails(sessionId: string, text: string, pageNumber: number): string {
    // First analyze current text for new details
    this.analyzeAndTrackVisualDetails(sessionId, text, pageNumber);
    
    // Then inject consistent descriptions for previously seen details
    return this.injectConsistentDetails(sessionId, text, pageNumber);
  }

  static getVisualDetailsForPrompt(sessionId: string, pageNumber: number = 1): string {
    const state = this.storyStates.get(sessionId);
    if (!state) return '';

    const relevantDetails: string[] = [];
    
    // Get details from visual details registry
    const sessionDetails = this.getSessionDetails(sessionId);
    
    for (const detail of sessionDetails) {
      if (detail.lastMentionedPage < pageNumber) {
        // Build consistent description
        let description = detail.name;
        
        if (detail.attributes.has('color')) {
          description = `${detail.attributes.get('color')} ${description}`;
        }
        
        if (detail.attributes.has('size')) {
          description = `${detail.attributes.get('size')} ${description}`;
        }
        
        relevantDetails.push(description);
      }
    }
    
    // Get objects from state
    for (const [_, obj] of state.objects) {
      if (obj.lastSeenPage < pageNumber) {
        relevantDetails.push(obj.description);
      }
    }
    
    return relevantDetails.length > 0 ? `, maintain consistency with: ${relevantDetails.join(', ')}` : '';
  }

  static updateObjectConsistency(sessionId: string, objectName: string, successfulPrompt: string): void {
    const state = this.storyStates.get(sessionId);
    if (!state) return;

    for (const [_, obj] of state.objects) {
      if (obj.name.includes(objectName) || objectName.includes(obj.name)) {
        obj.consistencyPrompts.push(successfulPrompt);
        // Keep only last 2 successful prompts
        if (obj.consistencyPrompts.length > 2) {
          obj.consistencyPrompts.shift();
        }
        console.log(`✅ Added consistency prompt for object: ${obj.name}`);
        break;
      }
    }
  }

  // Helper method to get setting for prompt generation
  static getSettingForPrompt(sessionId: string): string {
    const state = this.storyStates.get(sessionId);
    if (!state || !state.setting.isLocked) return '';
    
    const settingParts: string[] = [];
    
    if (state.setting.weather && state.setting.weather !== 'pleasant') {
      settingParts.push(state.setting.weather);
    }
    
    if (state.setting.timeOfDay && state.setting.timeOfDay !== 'daytime') {
      settingParts.push(state.setting.timeOfDay);
    }
    
    if (state.setting.season && state.setting.season !== 'any season') {
      settingParts.push(state.setting.season);
    }
    
    return settingParts.length > 0 ? `, ${settingParts.join(', ')}` : '';
  }
}
