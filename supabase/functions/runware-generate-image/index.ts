import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";

// Comprehensive Visual State Management - Import from StoryVisualStateManager
interface CharacterState {
  name: string;
  description: string;
  seed?: number;
  lastUsedPage: number;
  successfulPrompts: string[];
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
  runwareContext: RunwareContext;
  setting: {
    primaryLocation: string;
    timeOfDay: string;
    weather: string;
    season: string;
    mood: string;
    isLocked: boolean;
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
      // If no recent mentions, use all characters
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

  static getAllCharactersForPrompt(sessionId: string): string {
    const state = this.storyStates.get(sessionId);
    if (!state || state.characters.size === 0) return '';
    
    const characterDescriptions: string[] = [];
    for (const [name, char] of state.characters) {
      // Skip the main user character to avoid duplication
      if (name !== state.sessionId) {
        characterDescriptions.push(`${name}`);
      }
    }
    
    return characterDescriptions.length > 0 ? characterDescriptions.join(' and ') : '';
  }

  static trackCharacterMention(sessionId: string, characterName: string): void {
    const state = this.getOrCreateStoryState(sessionId);
    
    // Add to recent mentions for pronoun resolution
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
}


function extractPrimaryScene(text: string): string {
  // Intelligent scene boundary detection - extract only the primary scene
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  
  if (sentences.length <= 1) return text;
  
  // Look for future tense activities that should NOT trigger scene changes
  const futureActivityPatterns = [
    /\b(later|will|going to|plans to|wants to|hopes to)\b.*\b(game|play|sport|soccer|football|basketball)\b/i,
    /\b(after|when|then)\b.*\b(game|play|sport|activity)\b/i,
    /\b(excited|ready|preparing)\s+(for|about)\b.*\b(game|play|sport)\b/i
  ];
  
  // Look for present-tense scene transitions only
  const presentScenePatterns = [
    /\b(now|currently|right now)\b.*\b(outside|playground|field|park)\b/i,
    /\b(ran|runs|running|walked|walks|walking)\b.*\b(to|towards|into)\b.*\b(outside|playground|field|park)\b/i,
    /\b(arrived|enters|entered)\b.*\b(outside|playground|field|park)\b/i
  ];
  
  // Find the first sentence with a PRESENT scene transition, excluding future activities
  let primarySceneEnd = 0;
  for (let i = 1; i < sentences.length; i++) { // Start from index 1, keep first sentence
    const sentence = sentences[i];
    
    // Skip if this mentions future activities
    const isFutureActivity = futureActivityPatterns.some(pattern => pattern.test(sentence));
    if (isFutureActivity) {
      console.log(`[Scene Extract] Skipping future activity: "${sentence}"`);
      continue;
    }
    
    // Check for present scene transitions
    const hasSceneTransition = presentScenePatterns.some(pattern => pattern.test(sentence));
    
    if (hasSceneTransition) {
      // Found a present scene transition - stop here
      console.log(`[Scene Extract] Found scene transition at sentence ${i}: "${sentence}"`);
      primarySceneEnd = i;
      break;
    }
  }
  
  // If no clear transition found, take first sentence or first half
  if (primarySceneEnd === 0) {
    primarySceneEnd = Math.min(2, Math.ceil(sentences.length / 2));
  }
  
  const primaryScene = sentences.slice(0, primarySceneEnd).join('. ').trim();
  console.log(`🎯 Scene extraction: "${text}" → primary scene: "${primaryScene}"`);
  
  return primaryScene || sentences[0] || text;
}

function detectSecondaryCharacters(text: string): string[] {
  const secondaryCharacters: string[] = [];
  
  // Common secondary characters in children's stories with size descriptors
  const characterPatterns = [
    /\b(cat|kitten|kitty)\b/gi,
    /\b(dog|puppy|doggy)\b/gi,
    /\b(bird|robin|sparrow)\b/gi,
    /\b(rabbit|bunny)\b/gi,
    /\b(bear|teddy)\b/gi,
    /\b(tiger)\b/gi, // Add tiger detection
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
        
        // Add size descriptors for consistency
        if (character === 'tiger') {
          character = 'medium-tiger'; // Keep tiger at consistent medium size
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  try {
    const { 
      // New simplified parameters
      pageText,
      sessionId,
      userInfo,
      pageNumber = 1,
      // Legacy parameters (for compatibility)
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
      // Character consistency parameters (legacy)
      characterName,
      characterDescription,
      skinTone,
      avatarType,
      storyTheme,
      pageIndex = 0
    } = await req.json()
    
    // Use static model - reliable and proven
    const model = "runware:100@1"
    
    const runwareApiKey = Deno.env.get('RUNWARE_API_KEY')
    if (!runwareApiKey) {
      throw new Error('Runware API key not configured')
    }

    // Server-side prompt construction with visual state
    let enhancedPrompt: string;
    let currentUserInfo = userInfo;
    let currentCharacterName = characterName;
    let currentSkinTone = skinTone;
    let currentAvatarType = avatarType;
    
    if (pageText && sessionId && userInfo) {
      // NEW: Server-side visual state processing using comprehensive manager
      const state = StoryVisualStateManager.getOrCreateStoryState(sessionId);
      
      // Detect and track secondary characters (like "cat")
      const secondaryCharacters = detectSecondaryCharacters(pageText);
      for (const charName of secondaryCharacters) {
        StoryVisualStateManager.updateCharacterWithSeed(
          sessionId, 
          charName, 
          `friendly ${charName}`, 
          undefined, 
          pageNumber
        );
        // Track for pronoun resolution
        StoryVisualStateManager.trackCharacterMention(sessionId, charName);
      }
      
      // Also track main character mention
      StoryVisualStateManager.trackCharacterMention(sessionId, userInfo.name);
      
      // Smart scene extraction with comprehensive pronoun resolution
      const processedText = extractPrimaryScene(
        StoryVisualStateManager.resolvePronouns(sessionId, pageText)
      );
      
      // Get existing character seed for consistency
      let characterSeed = StoryVisualStateManager.getCharacterSeed(sessionId, userInfo.name);
      
      // Token-conscious avatar mapping with hair colors
      const skinToneMap = {
        'pale': 'pale skin',
        'light': 'light skin', 
        'medium': 'medium skin',
        'olive': 'olive skin',
        'dark': 'dark skin'
      };
      
      // Concise hair color mapping based on avatar selection
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
      
      const skinTone = skinToneMap[userInfo.avatar.skinTone] || 'medium skin';
      
      // Ultra-concise character description for token efficiency
      const characterDesc = `${userInfo.name}: ${userInfo.avatar.type} ${hairColor} ${skinTone}`;
      
      // Secondary characters for context (minimal tokens)
      const secondaryChars = secondaryCharacters.length > 0 ? ` ${secondaryCharacters.join(' ')}` : '';
      
      // Environmental context (minimal)
      const environmentalContext = StoryVisualStateManager.getSettingForPrompt(sessionId);
      
      // Ultra-concise prompt construction (token-optimized)
      enhancedPrompt = `${characterDesc}${secondaryChars} ${processedText}${environmentalContext} consistent-face children-book bright-colors`;
      
      // CRITICAL: Ensure seed persistence for main character consistency
      if (characterSeed) {
        seed = characterSeed;
        console.log(`🎯 Using persistent seed ${characterSeed} for ${userInfo.name} consistency`);
      } else {
        // Generate and lock new seed for main character on first use
        const newSeed = Math.floor(Math.random() * 2147483647);
        StoryVisualStateManager.updateCharacterWithSeed(sessionId, userInfo.name, characterDesc, newSeed, pageNumber);
        seed = newSeed;
        console.log(`🔒 Locked new seed ${newSeed} for ${userInfo.name} on page ${pageNumber}`);
      }
      
      // Update setting with comprehensive environmental detection
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
      // LEGACY: Token-optimized fallback system
      enhancedPrompt = positivePrompt || "children-book character bright-colors";
      
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
        
        // Token-conscious character description
        const safeName = characterName || 'character';
        const characterDesc = `${safeName}: ${avatarType} ${hairColor} ${skin}`;
        enhancedPrompt = `${characterDesc} ${enhancedPrompt} consistent-face children-book`;
      }
    }

    // Validate and truncate prompt length if needed (Runware max: 3000 chars)
    if (enhancedPrompt.length > 2800) {
      console.log(`Prompt too long (${enhancedPrompt.length} chars), truncating...`);
      
      // Intelligent truncation: keep core content, minimal suffix
      const coreContent = enhancedPrompt.substring(0, 2000);
      const qualitySuffix = ", quality art, vibrant, text-free";
      enhancedPrompt = coreContent + qualitySuffix;
      
      console.log(`Truncated prompt to ${enhancedPrompt.length} characters`);
    } else {
      // Minimal quality suffix (saves ~20 chars)
      enhancedPrompt += `, quality children's book art, vibrant, text-free`;
    }

    // Safety: Prevent negative prompt inversions
    if (enhancedPrompt.includes('NOT') || enhancedPrompt.includes('bad') || enhancedPrompt.includes('ugly')) {
      console.log('🚨 Detected negative terms in positive prompt, cleaning...');
      enhancedPrompt = enhancedPrompt.replace(/\b(NOT|bad|ugly|terrible|awful)\b/gi, '');
    }
    
    // Compressed negative prompt (saves ~50 chars)
    const defaultNegativePrompt = "bad anatomy, blurry, text, ugly";
    
    // Combine default negative prompt with any additional negative prompt
    const finalNegativePrompt = negativePrompt 
      ? `${defaultNegativePrompt}, ${negativePrompt}`
      : defaultNegativePrompt;

    // Create WebSocket connection to Runware
    const ws = new WebSocket("wss://ws-api.runware.ai/v1");
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        console.log("Request timeout after 15 seconds");
        resolve(createCorsErrorResponse("Request timeout", 408));
      }, 15000); // 15 second timeout for faster fallbacks

      ws.onopen = () => {
        console.log("WebSocket connected to Runware");
        
        // Send authentication
        const authMessage = [{
          taskType: "authentication",
          apiKey: runwareApiKey
        }];
        
        ws.send(JSON.stringify(authMessage));
      };

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        console.log("Runware response:", response);
        
        if (response.error || response.errors) {
          clearTimeout(timeout);
          ws.close();
          console.error("Runware API error:", response.errorMessage || response.errors?.[0]?.message);
          
          resolve(createCorsErrorResponse(response.errorMessage || response.errors?.[0]?.message || "Generation failed"));
          return;
        }

        if (response.data) {
          response.data.forEach((item: any) => {
            if (item.taskType === "authentication") {
              console.log("Authenticated with Runware");
              
              // Send image generation request with enhanced parameters for accurate representation
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
                steps: 3, // Optimized steps for faster generation
                CFGScale: Math.max(1.5, CFGScale), // Optimized guidance for speed
                scheduler,
                strength,
                ...(seed && { seed })
              }];
              
              console.log("Sending enhanced image generation request");
              ws.send(JSON.stringify(imageMessage));
              
            } else if (item.taskType === "imageInference") {
              clearTimeout(timeout);
              ws.close();
              
              // CRITICAL: Update character seed for future consistency
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
              
              // Log successful generation with character details
              if (userInfo) {
                console.log(`✅ Generated consistent image for ${userInfo.name} (page ${pageNumber})`);
              }
              
              resolve(createCorsResponse({
                success: true,
                imageURL: item.imageURL,
                seed: item.seed,
                cost: item.cost,
                NSFWContent: item.NSFWContent,
                characterName: userInfo?.name || characterName || undefined,
                pageIndex: pageNumber - 1,
                prompt: enhancedPrompt
              }));
            }
          });
        }
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        ws.close();
        console.error("WebSocket error:", error);
        resolve(createCorsErrorResponse("WebSocket connection failed"));
      };

      ws.onclose = (event) => {
        clearTimeout(timeout);
        if (event.code !== 1000) {
          console.log("WebSocket closed unexpectedly:", event.code, event.reason);
        }
      };
    });

  } catch (error) {
    console.error('Image generation error:', error)
    return createCorsErrorResponse(`Runware error: ${error.message}`);
  }
})