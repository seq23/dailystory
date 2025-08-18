import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";

// Comprehensive Visual State Management
interface CharacterState {
  name: string;
  description: string;
  seed?: number;
  lastUsedPage: number;
  successfulPrompts: string[];
}

interface VisualDetail {
  id: string;
  type: 'color' | 'clothing' | 'object' | 'animal' | 'vehicle' | 'accessory';
  name: string;
  description: string;
  firstMentionedPage: number;
  lastMentionedPage: number;
  context: string;
  attributes: Map<string, string>;
}

interface ObjectState {
  name: string;
  type: 'animal' | 'object' | 'vehicle' | 'clothing' | 'accessory';
  description: string;
  attributes: Map<string, string>;
  firstSeenPage: number;
  lastSeenPage: number;
  consistencyPrompts: string[];
}

interface RunwareContext {
  seed?: number;
  cfgScale: number;
  model: string;
  steps: number;
  scheduler: string;
}

interface StoryVisualState {
  sessionId: string;
  characters: Map<string, CharacterState>;
  objects: Map<string, ObjectState>;
  visualDetails: VisualDetail[];
  runwareContext: RunwareContext;
  setting: {
    primaryLocation: string;
    timeOfDay: string;
    weather: string;
    season: string;
    mood: string;
    isLocked: boolean;
    skinTone?: string;
  };
  locationHistory: string[];
  allowedTransitions: Map<string, string[]>;
  currentPage: number;
  totalPages: number;
  lastMentionedCharacters: string[];
  characterPairs: Map<string, string[]>;
}

class StoryVisualStateManager {
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

  static updateSetting(
    sessionId: string, 
    pageNumber: number,
    newSetting: Partial<StoryVisualState['setting']>
  ): boolean {
    const state = this.getOrCreateStoryState(sessionId);
    
    // Allow skin tone to be set at any time
    if (newSetting.skinTone) {
      state.setting.skinTone = newSetting.skinTone;
    }
    
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
    
    return false;
  }

  private static isValidTimeProgression(currentTime: string, newTime: string): boolean {
    const timeOrder = ['morning', 'afternoon', 'evening', 'night'];
    const currentIndex = timeOrder.indexOf(currentTime);
    const newIndex = timeOrder.indexOf(newTime);
    
    return newIndex > currentIndex;
  }

  static resolvePronouns(sessionId: string, text: string): string {
    const state = this.storyStates.get(sessionId);
    if (!state) return text;
    
    let resolvedText = text;
    
    // Resolve "they" to last mentioned character pair or all characters
    if (resolvedText.includes('they') && state.lastMentionedCharacters.length >= 2) {
      const characterPair = state.lastMentionedCharacters.slice(-2).join(' and ');
      resolvedText = resolvedText.replace(/\bthey\b/gi, characterPair);
      console.log(`🔄 Resolved "they" to: ${characterPair}`);
    } else if (resolvedText.includes('they') && state.characters.size >= 2) {
      const allCharacters = Array.from(state.characters.keys()).join(' and ');
      resolvedText = resolvedText.replace(/\bthey\b/gi, allCharacters);
      console.log(`🔄 Resolved "they" to all characters: ${allCharacters}`);
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

  static trackCharacterMention(sessionId: string, characterName: string): void {
    const state = this.getOrCreateStoryState(sessionId);
    
    if (!state.lastMentionedCharacters.includes(characterName)) {
      state.lastMentionedCharacters.unshift(characterName);
      if (state.lastMentionedCharacters.length > 3) {
        state.lastMentionedCharacters.pop();
      }
    }
  }

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

  // Helper methods for setting extraction
  static extractLocation(text: string): string {
    const locationPatterns = [
      /\b(park|playground|hill|field|garden|yard|beach|forest|home|school|mountain|river)\b/i
    ];
    
    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match) return match[1].toLowerCase();
    }
    return '';
  }

  static extractTimeOfDay(text: string): string {
    if (/\b(morning|dawn|sunrise)\b/i.test(text)) return 'morning';
    if (/\b(afternoon|noon|midday)\b/i.test(text)) return 'afternoon';
    if (/\b(evening|sunset|dusk)\b/i.test(text)) return 'evening';
    if (/\b(night|dark|midnight)\b/i.test(text)) return 'night';
    return '';
  }

  static extractWeather(text: string): string {
    if (/\b(sunny|bright|sunshine)\b/i.test(text)) return 'sunny';
    if (/\b(rain|rainy|storm|cloudy)\b/i.test(text)) return 'rainy';
    if (/\b(snow|snowy|winter)\b/i.test(text)) return 'snowy';
    return '';
  }

  // Enhanced Object & Detail Memory System - Mirror from TypeScript service
  static enhanceTextWithConsistentDetails(sessionId: string, text: string, pageNumber: number): string {
    const state = this.getOrCreateStoryState(sessionId);
    
    // Simplified pattern detection for edge function
    const detectionPatterns = [
      { pattern: /\b(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\s+(bird|cat|dog|horse|rabbit|mouse|bear|elephant|lion|tiger|fox|owl|eagle|duck|frog|fish)\b/gi, type: 'animal' },
      { pattern: /\b(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\s+(car|truck|bike|bicycle|boat|plane|train|bus)\b/gi, type: 'vehicle' },
      { pattern: /\b(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\s+(shirt|dress|hat|shoes|coat|jacket|pants|skirt|sweater|backpack|bag)\b/gi, type: 'clothing' },
      { pattern: /\b(big|small|tiny|huge|large|little)\s+(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\s+(ball|balloon|flower|tree|house|castle|tower|book|toy)\b/gi, type: 'object' }
    ];

    // Track new visual details
    for (const rule of detectionPatterns) {
      const matches = [...text.matchAll(rule.pattern)];
      for (const match of matches) {
        const fullMatch = match[0];
        const words = fullMatch.trim().split(/\s+/);
        const detailName = words[words.length - 1].toLowerCase(); // last word is typically the noun
        
        const detailId = `${rule.type}_${detailName}`;
        
        // Store in objects registry if not exists
        if (!state.objects.has(detailId)) {
          const newObject: ObjectState = {
            name: detailName,
            type: rule.type as ObjectState['type'],
            description: fullMatch,
            attributes: new Map(),
            firstSeenPage: pageNumber,
            lastSeenPage: pageNumber,
            consistencyPrompts: []
          };
          
          // Extract color attribute
          const colorMatch = fullMatch.match(/\b(red|blue|green|yellow|orange|purple|pink|brown|black|white|gray|grey)\b/i);
          if (colorMatch) {
            newObject.attributes.set('color', colorMatch[1]);
          }
          
          // Extract size attribute
          const sizeMatch = fullMatch.match(/\b(big|small|tiny|huge|large|little)\b/i);
          if (sizeMatch) {
            newObject.attributes.set('size', sizeMatch[1]);
          }
          
          state.objects.set(detailId, newObject);
          console.log(`🎨 Tracked new visual detail: ${fullMatch} (${rule.type}) on page ${pageNumber}`);
        } else {
          // Update last seen page
          const existing = state.objects.get(detailId);
          if (existing) {
            existing.lastSeenPage = pageNumber;
          }
        }
      }
    }

    // Enhance text with consistent descriptions
    let enhancedText = text;
    
    for (const [detailId, obj] of state.objects) {
      if (obj.lastSeenPage < pageNumber) {
        // Look for vague references and replace with consistent descriptions
        const vaguePatterns = [
          new RegExp(`\\bthe\\s+${obj.name}\\b`, 'gi'),
          new RegExp(`\\ba\\s+${obj.name}\\b`, 'gi')
        ];

        for (const pattern of vaguePatterns) {
          const matches = [...enhancedText.matchAll(pattern)];
          for (const match of matches) {
            // Build consistent replacement
            let replacement = obj.name;
            
            if (obj.attributes.has('color')) {
              replacement = `${obj.attributes.get('color')} ${replacement}`;
            }
            
            if (obj.attributes.has('size')) {
              replacement = `${obj.attributes.get('size')} ${replacement}`;
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

  // Get visual details for prompt enhancement
  static getVisualDetailsForPrompt(sessionId: string, pageNumber: number): string {
    const state = this.storyStates.get(sessionId);
    if (!state) return '';

    const relevantDetails: string[] = [];
    
    for (const [_, obj] of state.objects) {
      if (obj.lastSeenPage < pageNumber && obj.lastSeenPage > 0) {
        let description = obj.name;
        
        if (obj.attributes.has('color')) {
          description = `${obj.attributes.get('color')} ${description}`;
        }
        
        if (obj.attributes.has('size')) {
          description = `${obj.attributes.get('size')} ${description}`;
        }
        
        relevantDetails.push(description);
      }
    }
    
    return relevantDetails.length > 0 ? `, maintain consistency with: ${relevantDetails.join(', ')}` : '';
  }
}

function extractPrimaryScene(text: string): string {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  
  if (sentences.length <= 1) return text;
  
  // Enhanced scoring system for action-oriented, visually compelling scenes
  function scoreScene(sentence: string): number {
    let score = 0;
    
    // High-value action verbs (primary activities)
    const primaryActionPatterns = [
      /\b(race|racing|zoom|zooming|run|running|jump|jumping|climb|climbing|swing|swinging|chase|chasing|play|playing)\b/i,
      /\b(slide|sliding|roll|rolling|bounce|bouncing|spin|spinning|dance|dancing|laugh|laughing)\b/i
    ];
    
    // Location-action combinations (very visual)
    const locationActionPatterns = [
      /\b(park|playground|hill|field|garden|yard|beach|forest)\b.*\b(race|play|run|jump|climb|swing|slide)\b/i,
      /\b(race|play|run|jump|climb|swing|slide)\b.*\b(park|playground|hill|field|garden|yard|beach|forest)\b/i
    ];
    
    // Emotional engagement with action
    const emotionalActionPatterns = [
      /\b(loved|enjoyed|excited|favorite|happy|delighted)\b.*\b(to|ing)\b.*\b(race|play|run|jump|climb|swing|slide)\b/i,
      /\b(loved|enjoyed|excited|favorite|happy|delighted)\b.*\b(race|play|run|jump|climb|swing|slide)\b/i
    ];
    
    // Visual elements
    const visualElementPatterns = [
      /\b(toy cars|cars|toys|ball|bike|bicycle|kite|bubbles|flowers|colorful|bright)\b/i,
      /\b(steep|tall|big|small|red|blue|green|yellow|purple|orange)\b/i
    ];
    
    // Character-focused actions
    const characterActionPatterns = [
      /\b[A-Z][a-z]+\b.*\b(loved|liked|enjoyed|wanted|decided|began|started)\b.*\b(to|ing)\b/i,
      /\b[A-Z][a-z]+\b.*\b(race|play|run|jump|climb|swing|slide|laugh|smile|clap)\b/i
    ];
    
    // Score based on patterns
    if (primaryActionPatterns.some(p => p.test(sentence))) score += 20;
    if (locationActionPatterns.some(p => p.test(sentence))) score += 25; // Highest priority
    if (emotionalActionPatterns.some(p => p.test(sentence))) score += 22;
    if (visualElementPatterns.some(p => p.test(sentence))) score += 15;
    if (characterActionPatterns.some(p => p.test(sentence))) score += 18;
    
    // Bonus for specific high-visual combinations
    if (/\b(toy cars|cars)\b.*\b(hill|steep|down|race|racing)\b/i.test(sentence)) score += 30;
    if (/\b(magic|magical|imagining|world|adventure)\b/i.test(sentence)) score += 12;
    
    // Penalty for purely descriptive introductions
    if (/\b(in the|there was|there were|once upon|it was|the town|the city|the village)\b/i.test(sentence)) score -= 10;
    if (/\b(lived|was|were)\b.*\b(a|an|the)\b.*\b(town|city|village|place|time)\b/i.test(sentence)) score -= 15;
    
    return Math.max(0, score);
  }
  
  // Score all sentences and find the most action-oriented one
  let bestScore = 0;
  let bestSentenceIndex = 0;
  
  for (let i = 0; i < sentences.length; i++) {
    const score = scoreScene(sentences[i]);
    console.log(`[Scene Score] Sentence ${i}: "${sentences[i]}" → Score: ${score}`);
    
    if (score > bestScore) {
      bestScore = score;
      bestSentenceIndex = i;
    }
  }
  
  // If we found a high-scoring action scene, use it
  if (bestScore >= 15) {
    const primaryScene = sentences[bestSentenceIndex];
    console.log(`🎯 Scene extraction: "${text}" → action scene (score ${bestScore}): "${primaryScene}"`);
    return primaryScene;
  }
  
  // Fallback: look for character descriptions over setting descriptions
  for (const sentence of sentences) {
    if (/\b[A-Z][a-z]+\b.*\b(loved|liked|enjoyed|was|had|could)\b/i.test(sentence) && 
        !/\b(town|city|village|place|lived|there)\b/i.test(sentence)) {
      console.log(`🎯 Scene extraction: "${text}" → character fallback: "${sentence}"`);
      return sentence;
    }
  }
  
  // Last resort: use first sentence
  const fallback = sentences[0];
  console.log(`🎯 Scene extraction: "${text}" → default fallback: "${fallback}"`);
  return fallback || text;
}

function detectSecondaryCharacters(text: string, userInfo?: any): string[] {
  const secondaryCharacters: string[] = [];
  
  // Enhanced character patterns including family members
  const characterPatterns = [
    /\b(cat|kitten|kitty)\b/gi,
    /\b(dog|puppy|doggy)\b/gi,
    /\b(bird|robin|sparrow)\b/gi,
    /\b(rabbit|bunny)\b/gi,
    /\b(bear|teddy)\b/gi,
    /\b(tiger)\b/gi,
    /\b(mom|mother|mama)\b/gi,
    /\b(dad|father|papa)\b/gi,
    /\b(grandma|grandmother)\b/gi,
    /\b(grandpa|grandfather)\b/gi,
    /\b(sister|brother|sibling)\b/gi,
    /\b(friend|friends)\b/gi,
    /\b(teacher|neighbor)\b/gi,
    /\b(frog|toad)\b/gi,
    /\b(fish|goldfish)\b/gi,
    /\b(friend|buddy|pal)\b/gi,
    /\b(mom|mother|mommy|mama)\b/gi,
    /\b(dad|father|daddy|papa)\b/gi,
    /\b(sister|brother|sibling)\b/gi,
    /\b(teacher|coach)\b/gi
  ];
  
  for (const pattern of characterPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        let character = match.toLowerCase();
        
        if (character === 'tiger') {
          character = 'medium-tiger';
        }
        
        if (!secondaryCharacters.includes(character)) {
          secondaryCharacters.push(character);
        }
      }
    }
  }
  
  console.log(`🎭 Detected secondary characters: ${secondaryCharacters.join(', ')}`);
  return secondaryCharacters;
}

function validateUserInfo(userInfo: any): { valid: boolean; error?: string } {
  if (!userInfo) {
    return { valid: false, error: 'userInfo is required' };
  }
  
  if (!userInfo.name || typeof userInfo.name !== 'string') {
    return { valid: false, error: 'userInfo.name is required and must be a string' };
  }
  
  if (!userInfo.avatar || typeof userInfo.avatar !== 'object') {
    return { valid: false, error: 'userInfo.avatar is required and must be an object' };
  }
  
  if (!userInfo.avatar.skinTone || !userInfo.avatar.type) {
    return { valid: false, error: 'userInfo.avatar.skinTone and userInfo.avatar.type are required' };
  }
  
  return { valid: true };
}

// Runware's professionally optimized negative prompt - single source of truth
function generateComprehensiveNegativePrompt(text: string, secondaryCharacters: string[], userInfo?: any): string {
  // Use Runware's recommended negative prompt as the foundation
  const runwareNegativePrompt = "text, watermark, signature, logos, blurry, low quality, bad anatomy, deformed, malformed, extra limbs, missing limbs, extra fingers, missing fingers, distorted faces, asymmetrical faces, ugly, scary, dark themes, violence, inappropriate content, adult themes, pixelated, jpeg artifacts, oversaturated, bad proportions, cropped, cut off";
  
  console.log(`🚫 Using Runware's optimized negative prompt strategy`);
  return runwareNegativePrompt;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  try {
    const runwareApiKey = Deno.env.get('RUNWARE_API_KEY');
    if (!runwareApiKey) {
      console.error('❌ RUNWARE_API_KEY not configured');
      return createCorsErrorResponse('RUNWARE_API_KEY not configured', 500);
    }
    
    console.log('🔑 RUNWARE_API_KEY configured');

    const requestData = await req.json();
    const { 
      pageText,
      sessionId,
      userInfo,
      pageNumber = 1,
      difficultyLevel = 'medium',
      positivePrompt,
      negativePrompt,
      width = 1024,
      height = 1024,
      numberResults = 1,
      outputFormat = "WEBP",
      CFGScale = 1,
      scheduler = "FlowMatchEulerDiscreteScheduler",
      strength = 0.8,
      seed,
      characterName,
      characterDescription,
      skinTone,
      avatarType,
      storyTheme,
      pageIndex = 0
    } = requestData;
    
    const model = "runware:100@1";
    
    let enhancedPrompt: string;
    let finalSeed = seed;
    let finalNegativePrompt: string;
    
    if (pageText && sessionId && userInfo) {
      // Validate userInfo
      const validation = validateUserInfo(userInfo);
      if (!validation.valid) {
        return createCorsErrorResponse(`Invalid userInfo: ${validation.error}`, 400);
      }
      
      const state = StoryVisualStateManager.getOrCreateStoryState(sessionId, 10);
      state.currentPage = pageNumber;
      
      // Apply comprehensive character info to state with gender consistency
      if (userInfo.avatar.skinTone) {
        StoryVisualStateManager.updateSetting(sessionId, pageNumber, {
          skinTone: userInfo.avatar.skinTone
        });
      }
      
      // Ensure character consistency across pages
      const mainCharacterDesc = `${userInfo.avatar.type} ${userInfo.avatar.skinTone} skin character`;
      StoryVisualStateManager.updateCharacterWithSeed(
        sessionId, 
        userInfo.name, 
        mainCharacterDesc, 
        undefined, 
        pageNumber
      );
      
      const secondaryCharacters = detectSecondaryCharacters(pageText);
      for (const charName of secondaryCharacters) {
        StoryVisualStateManager.updateCharacterWithSeed(
          sessionId, 
          charName, 
          `friendly ${charName}`, 
          undefined, 
          pageNumber
        );
        StoryVisualStateManager.trackCharacterMention(sessionId, charName);
      }
      
      StoryVisualStateManager.trackCharacterMention(sessionId, userInfo.name);
      
      // Enhanced text processing with visual detail tracking
      let pronoun_resolved_text = StoryVisualStateManager.resolvePronouns(sessionId, pageText);
      
      // Track and enhance visual details for consistency
      const enhancedText = StoryVisualStateManager.enhanceTextWithConsistentDetails(sessionId, pronoun_resolved_text, pageNumber);
      
      const processedText = extractPrimaryScene(enhancedText);
      
      let characterSeed = StoryVisualStateManager.getCharacterSeed(sessionId, userInfo.name);
      
      // Generate seed if none exists for character consistency
      if (!characterSeed) {
        characterSeed = Math.floor(Math.random() * 2147483647);
        StoryVisualStateManager.updateCharacterWithSeed(
          sessionId, 
          userInfo.name, 
          mainCharacterDesc,
          characterSeed,
          pageNumber
        );
        console.log(`🔒 Saved seed ${characterSeed} for ${userInfo.name} consistency`);
      }
      
      const skinToneMap = {
        'pale': 'pale skin',
        'light': 'light skin', 
        'medium': 'medium skin',
        'olive': 'olive skin',
        'dark': 'dark skin'
      };
      
      const hairColorMap = {
        'light-girl': 'blonde hair',
        'light-boy': 'light brown hair',
        'pale-girl': 'blonde hair',
        'pale-boy': 'blonde hair',
        'medium-girl': 'brown hair',
        'medium-boy': 'brown hair',
        'olive-girl': 'dark brown hair',
        'olive-boy': 'dark brown hair',
        'dark-girl': 'black hair',
        'dark-boy': 'black hair'
      };
      
      const avatarKey = `${userInfo.avatar.skinTone}-${userInfo.avatar.type}`;
      const hairColor = hairColorMap[avatarKey] || 'brown hair';
      
      const skinToneForPrompt = skinToneMap[userInfo.avatar.skinTone] || 'medium skin';
      
      // Enhanced character description with gender specificity
      const characterDesc = `${userInfo.name}: ${userInfo.avatar.type} ${hairColor} ${skinToneForPrompt}`;
      
      const secondaryChars = secondaryCharacters.length > 0 ? ` ${secondaryCharacters.join(' ')}` : '';
      
      const environmentalContext = StoryVisualStateManager.getSettingForPrompt(sessionId);
      const visualDetailsContext = StoryVisualStateManager.getVisualDetailsForPrompt(sessionId, pageNumber);
      
      // Enhanced negative prompt system for high-quality, accurate images
      const comprehensiveNegativePrompt = generateComprehensiveNegativePrompt(processedText, secondaryCharacters, userInfo);
      
      // Combine provided negative prompt with comprehensive quality controls
      finalNegativePrompt = negativePrompt 
        ? `${negativePrompt}, ${comprehensiveNegativePrompt}`
        : comprehensiveNegativePrompt;
      
      // Use centralized style mapping from appConfig
      const difficultyStyleMapping: Record<string, string> = {
        'beginner': '3D children\'s book art, bright colors, smooth rendering, cheerful',
        'easy': '3D children\'s book art, bright colors, smooth rendering, cheerful',
        'medium': 'children\'s book illustration, soft pastels, warm lighting, digital art',
        'hard': '2D digital illustration (sophisticated artistic style), nuanced color gradients, artistic palette, highly detailed',
        'expert': '2D digital illustration (masterful artistic technique), complex color theory, professional artist palette, intricate and complex details'
      };
      
      const artStyle = difficultyStyleMapping[difficultyLevel] || difficultyStyleMapping['medium'];
      // Restructure prompt to prevent character name text overlays
      // Import cultural visual service for enhanced character representation
      const { MulticulturalVisualService } = await import('./cultural-visual-service.js');
      
      // Generate culturally appropriate character description
      const culturalCharacterDesc = MulticulturalVisualService.generateCulturalCharacterDescription(userInfo);
      const culturalSetting = MulticulturalVisualService.generateCulturalSetting(userInfo);
      const culturalNegativePrompt = MulticulturalVisualService.generateCulturalNegativePrompt(userInfo);
      const qualityEnhancement = MulticulturalVisualService.getQualityEnhancementTerms(userInfo);
      
      enhancedPrompt = `Visual appearance: ${culturalCharacterDesc}${secondaryChars}. Scene: ${processedText} in ${culturalSetting}${environmentalContext}${visualDetailsContext}. Style: consistent-face ${artStyle}, ${qualityEnhancement}`;
      
      // Update negative prompt with cultural sensitivity
      finalNegativePrompt = culturalNegativePrompt;
      
      if (characterSeed) {
        finalSeed = characterSeed;
        console.log(`🎯 Using persistent seed ${characterSeed} for ${userInfo.name} consistency`);
      } else {
        const newSeed = Math.floor(Math.random() * 2147483647);
        StoryVisualStateManager.updateCharacterWithSeed(sessionId, userInfo.name, characterDesc, newSeed, pageNumber);
        finalSeed = newSeed;
        console.log(`🔒 Locked new seed ${newSeed} for ${userInfo.name} on page ${pageNumber}`);
      }
      
      const settingUpdates: any = {};
      if (processedText.includes('sunny') || processedText.includes('bright')) {
        settingUpdates.weather = 'sunny';
      }
      if (processedText.includes('rain') || processedText.includes('stormy')) {
        settingUpdates.weather = 'rainy';
      }
      if (processedText.includes('night') || processedText.includes('dark')) {
        settingUpdates.timeOfDay = 'nighttime';
      }
      if (Object.keys(settingUpdates).length > 0) {
        StoryVisualStateManager.updateSetting(sessionId, pageNumber, settingUpdates);
      }
      
      console.log(`🎨 Server-side enhanced prompt for ${userInfo.name} (page ${pageNumber}): "${processedText}" → enhanced`);
      
    } else {
      enhancedPrompt = positivePrompt || "children-book character bright-colors";
      
      // Generate comprehensive negative prompt for non-story images too
      const comprehensiveNegativePrompt = generateComprehensiveNegativePrompt("", [], null);
      finalNegativePrompt = negativePrompt 
        ? `${negativePrompt}, ${comprehensiveNegativePrompt}`
        : comprehensiveNegativePrompt;
      
      if (characterName && characterDescription) {
        const skinToneMap = {
          'pale': 'pale skin',
          'light': 'light skin', 
          'medium': 'medium skin',
          'olive': 'olive skin',
          'dark': 'dark skin'
        };
        
        const hairColorMap = {
          'light-girl': 'blonde hair',
          'light-boy': 'light brown hair',
          'pale-girl': 'blonde hair',
          'pale-boy': 'blonde hair',
          'medium-girl': 'brown hair',
          'medium-boy': 'brown hair',
          'olive-girl': 'dark brown hair',
          'olive-boy': 'dark brown hair',
          'dark-girl': 'black hair',
          'dark-boy': 'black hair'
        };
        
        const avatarKey = `${skinTone}-${avatarType}`;
        const hairColor = hairColorMap[avatarKey] || 'brown hair';
        const skin = skinToneMap[skinTone] || 'medium skin';
        
        const safeName = characterName || 'character';
        const characterDesc = `${safeName}: ${avatarType} ${hairColor} ${skin}`;
        enhancedPrompt = `${characterDesc} ${enhancedPrompt} consistent-face children-book`;
      }
    }

    // Validate and truncate prompt length
    if (enhancedPrompt.length > 2800) {
      console.log(`Prompt too long (${enhancedPrompt.length} chars), truncating...`);
      
      const coreContent = enhancedPrompt.substring(0, 2000);
      const qualitySuffix = ", quality art, vibrant, text-free";
      enhancedPrompt = coreContent + qualitySuffix;
      
      console.log(`Truncated prompt to ${enhancedPrompt.length} characters`);
    } else {
      enhancedPrompt += `, quality children's book art, vibrant, text-free`;
    }

    // Safety: Prevent negative prompt inversions
    if (enhancedPrompt.includes('NOT') || enhancedPrompt.includes('bad') || enhancedPrompt.includes('ugly')) {
      console.log('🚨 Detected negative terms in positive prompt, cleaning...');
      enhancedPrompt = enhancedPrompt.replace(/\b(NOT|bad|ugly|terrible|awful)\b/gi, '');
    }

    // Create WebSocket connection with proper error handling
    console.log('🌐 Attempting WebSocket connection to Runware...');
    
    return new Promise((resolve) => {
      let resolved = false;
      let retryCount = 0;
      const maxRetries = 2;
      
      const attemptConnection = () => {
        const ws = new WebSocket("wss://ws-api.runware.ai/v1");
        let authenticated = false;
        
        const timeout = setTimeout(() => {
          if (!resolved) {
            ws.close();
            console.log(`⏰ Request timeout after 15 seconds (attempt ${retryCount + 1})`);
            
            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`🔄 Retrying connection (${retryCount}/${maxRetries})...`);
              setTimeout(attemptConnection, 1000 * retryCount); // Exponential backoff
            } else {
              resolved = true;
              resolve(createCorsErrorResponse("Connection timeout after retries", 408));
            }
          }
        }, 15000);

        ws.onopen = () => {
          console.log("🌐 WebSocket connected to Runware, authenticating...");
          
          const authMessage = [{
            taskType: "authentication",
            apiKey: runwareApiKey
          }];
          
          ws.send(JSON.stringify(authMessage));
          console.log('🔐 Authentication message sent to Runware');
        };

        ws.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data);
            console.log("📨 Runware response received");
            
            if (response.error || response.errors) {
              clearTimeout(timeout);
              ws.close();
              const errorMsg = response.errorMessage || response.errors?.[0]?.message || "Generation failed";
              console.error("❌ Runware API error:", errorMsg);
              
              if (!resolved) {
                resolved = true;
                resolve(createCorsErrorResponse(errorMsg, 500));
              }
              return;
            }

            if (response.data) {
              response.data.forEach((item: any) => {
                if (item.taskType === "authentication") {
                  if (item.connectionSessionUUID || item.success !== false) {
                    authenticated = true;
                    console.log("✅ Authenticated with Runware successfully");
                    
                    const taskUUID = crypto.randomUUID();
                    const imageMessage = [{
                      taskType: "imageInference",
                      taskUUID,
                      positivePrompt: enhancedPrompt,
                      negativePrompt: finalNegativePrompt,
                      model,
                      width,
                      height,
                      numberResults,
                      outputFormat,
                      steps: userInfo ? (await import('./cultural-visual-service.js')).MulticulturalVisualService.getOptimizedGenerationParams(userInfo).steps : 3,
                      CFGScale: userInfo ? (await import('./cultural-visual-service.js')).MulticulturalVisualService.getOptimizedGenerationParams(userInfo).cfgScale : Math.max(1.5, CFGScale),
                      scheduler: userInfo ? (await import('./cultural-visual-service.js')).MulticulturalVisualService.getOptimizedGenerationParams(userInfo).scheduler : scheduler,
                      strength: userInfo ? (await import('./cultural-visual-service.js')).MulticulturalVisualService.getOptimizedGenerationParams(userInfo).strength : strength,
                      ...(finalSeed && { seed: finalSeed })
                    }];
                    
                    console.log("🎨 Sending enhanced image generation request:", {
                      prompt: enhancedPrompt.substring(0, 100) + '...',
                      model,
                      seed: finalSeed,
                      taskUUID
                    });
                    ws.send(JSON.stringify(imageMessage));
                  } else {
                    clearTimeout(timeout);
                    ws.close();
                    console.error("❌ Runware authentication failed");
                    
                    if (!resolved) {
                      resolved = true;
                      resolve(createCorsErrorResponse("Authentication failed", 401));
                    }
                  }
                  
                } else if (item.taskType === "imageInference") {
                  clearTimeout(timeout);
                  ws.close();
                  
                  if (sessionId && userInfo && item.seed) {
                    const characterDesc = `${userInfo.name}: ${userInfo.avatar.type}`;
                    StoryVisualStateManager.updateCharacterWithSeed(
                      sessionId,
                      userInfo.name,
                      characterDesc,
                      item.seed,
                      pageNumber
                    );
                    console.log(`🔒 Saved seed ${item.seed} for ${userInfo.name} consistency`);
                  }
                  
                  if (userInfo) {
                    console.log(`✅ Generated consistent image for ${userInfo.name} (page ${pageNumber})`);
                  }
                  
                  if (!resolved) {
                    resolved = true;
                    resolve(createCorsResponse({
                      success: true,
                      imageURL: item.imageURL,
                      seed: item.seed,
                      cost: item.cost || 0.002,
                      NSFWContent: item.NSFWContent,
                      characterName: userInfo?.name || characterName || undefined,
                      pageIndex: pageNumber - 1,
                      prompt: enhancedPrompt,
                      provider: 'runware',
                      model: 'runware:100@1'
                    }));
                  }
                }
              });
            }
          } catch (parseError) {
            console.error("❌ Failed to parse WebSocket response:", parseError);
            clearTimeout(timeout);
            ws.close();
            
            if (!resolved) {
              resolved = true;
              resolve(createCorsErrorResponse("Invalid response format", 500));
            }
          }
        };

        ws.onerror = (error) => {
          clearTimeout(timeout);
          console.error("❌ WebSocket error details:", {
            type: error.type || 'unknown',
            message: error.message || 'unknown error'
          });
          
          if (!authenticated && retryCount < maxRetries) {
            retryCount++;
            console.log(`🔄 Retrying after WebSocket error (${retryCount}/${maxRetries})...`);
            setTimeout(attemptConnection, 1000 * retryCount);
          } else if (!resolved) {
            resolved = true;
            resolve(createCorsErrorResponse(`WebSocket connection failed: ${error.message || 'unknown error'}`, 500));
          }
        };

        ws.onclose = (event) => {
          clearTimeout(timeout);
          if (event.code !== 1000 && !resolved) {
            console.log("🔌 WebSocket closed unexpectedly:", {
              code: event.code,
              reason: event.reason || 'no reason provided',
              wasClean: event.wasClean
            });
            
            if (!authenticated && retryCount < maxRetries) {
              retryCount++;
              console.log(`🔄 Retrying after unexpected close (${retryCount}/${maxRetries})...`);
              setTimeout(attemptConnection, 1000 * retryCount);
            } else if (!resolved) {
              resolved = true;
              resolve(createCorsErrorResponse(`WebSocket closed unexpectedly: ${event.reason || 'no reason'} (code: ${event.code})`, 500));
            }
          }
        };
      };
      
      attemptConnection();
    });

  } catch (error) {
    console.error('❌ Image generation error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return createCorsErrorResponse(`Runware error: ${error.message}`, 500);
  }
});