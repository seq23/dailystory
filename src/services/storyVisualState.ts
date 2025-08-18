// Story Visual State Manager - Runware-Optimized Implementation
// Maintains visual consistency, character seeds, and setting continuity

import type { UserInfo } from '@/types';
import { VisualDetailTracker, type VisualDetail } from './VisualDetailTracker';

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
  
  // Character consistency with seeds
  characters: Map<string, CharacterState>;
  
  // Object and detail consistency
  objects: Map<string, ObjectState>;
  visualDetails: VisualDetail[];
  
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

  static getOrCreateStoryState(sessionId: string, totalPages: number = 10): StoryVisualState {
    if (!this.storyStates.has(sessionId)) {
      const newState: StoryVisualState = {
        sessionId,
        characters: new Map(),
        objects: new Map(),
        visualDetails: [],
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
      console.log(`📚 Created new story state for session: ${sessionId}`);
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
    
    let resolvedText = text;
    
    // Resolve "they" to last mentioned character pair
    if (resolvedText.includes('they') && state.lastMentionedCharacters.length >= 2) {
      const characterPair = state.lastMentionedCharacters.slice(-2).join(' and ');
      resolvedText = resolvedText.replace(/\bthey\b/gi, characterPair);
      console.log(`🔄 Resolved "they" to: ${characterPair}`);
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
    VisualDetailTracker.clearSessionDetails(sessionId);
    console.log(`🗑️ Cleared story state for session: ${sessionId}`);
  }

  // Enhanced Object & Detail Memory System Methods
  static analyzeAndTrackVisualDetails(sessionId: string, text: string, pageNumber: number): VisualDetail[] {
    const state = this.getOrCreateStoryState(sessionId);
    
    // Use VisualDetailTracker to detect and track details
    const newDetails = VisualDetailTracker.analyzeTextForDetails(sessionId, text, pageNumber);
    
    // Add new details to state
    state.visualDetails.push(...newDetails);
    
    // Also detect complex objects and add them to objects registry
    const complexObjects = VisualDetailTracker.detectComplexObjects(text);
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
    return VisualDetailTracker.injectConsistentDetails(sessionId, text, pageNumber);
  }

  static getVisualDetailsForPrompt(sessionId: string, pageNumber: number): string {
    const state = this.storyStates.get(sessionId);
    if (!state) return '';

    const relevantDetails: string[] = [];
    
    // Get details from VisualDetailTracker
    const sessionDetails = VisualDetailTracker.getSessionDetails(sessionId);
    
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
