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
}

function extractPrimaryScene(text: string): string {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  
  if (sentences.length <= 1) return text;
  
  const futureActivityPatterns = [
    /\b(later|will|going to|plans to|wants to|hopes to)\b.*\b(game|play|sport|soccer|football|basketball)\b/i,
    /\b(after|when|then)\b.*\b(game|play|sport|activity)\b/i,
    /\b(excited|ready|preparing)\s+(for|about)\b.*\b(game|play|sport)\b/i
  ];
  
  const presentScenePatterns = [
    /\b(now|currently|right now)\b.*\b(outside|playground|field|park)\b/i,
    /\b(ran|runs|running|walked|walks|walking)\b.*\b(to|towards|into)\b.*\b(outside|playground|field|park)\b/i,
    /\b(arrived|enters|entered)\b.*\b(outside|playground|field|park)\b/i
  ];
  
  let primarySceneEnd = 0;
  for (let i = 1; i < sentences.length; i++) {
    const sentence = sentences[i];
    
    const isFutureActivity = futureActivityPatterns.some(pattern => pattern.test(sentence));
    if (isFutureActivity) {
      console.log(`[Scene Extract] Skipping future activity: "${sentence}"`);
      continue;
    }
    
    const hasSceneTransition = presentScenePatterns.some(pattern => pattern.test(sentence));
    
    if (hasSceneTransition) {
      console.log(`[Scene Extract] Found scene transition at sentence ${i}: "${sentence}"`);
      primarySceneEnd = i;
      break;
    }
  }
  
  if (primarySceneEnd === 0) {
    primarySceneEnd = Math.min(2, Math.ceil(sentences.length / 2));
  }
  
  const primaryScene = sentences.slice(0, primarySceneEnd).join('. ').trim();
  console.log(`🎯 Scene extraction: "${text}" → primary scene: "${primaryScene}"`);
  
  return primaryScene || sentences[0] || text;
}

function detectSecondaryCharacters(text: string): string[] {
  const secondaryCharacters: string[] = [];
  
  const characterPatterns = [
    /\b(cat|kitten|kitty)\b/gi,
    /\b(dog|puppy|doggy)\b/gi,
    /\b(bird|robin|sparrow)\b/gi,
    /\b(rabbit|bunny)\b/gi,
    /\b(bear|teddy)\b/gi,
    /\b(tiger)\b/gi,
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
    
    if (pageText && sessionId && userInfo) {
      // Validate userInfo
      const validation = validateUserInfo(userInfo);
      if (!validation.valid) {
        return createCorsErrorResponse(`Invalid userInfo: ${validation.error}`, 400);
      }
      
      const state = StoryVisualStateManager.getOrCreateStoryState(sessionId);
      
      // Apply skin tone to state
      if (userInfo.avatar.skinTone) {
        StoryVisualStateManager.updateSetting(sessionId, pageNumber, {
          skinTone: userInfo.avatar.skinTone
        });
      }
      
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
      
      const processedText = extractPrimaryScene(
        StoryVisualStateManager.resolvePronouns(sessionId, pageText)
      );
      
      let characterSeed = StoryVisualStateManager.getCharacterSeed(sessionId, userInfo.name);
      
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
      
      const characterDesc = `${userInfo.name}: ${userInfo.avatar.type} ${hairColor} ${skinToneForPrompt}`;
      
      const secondaryChars = secondaryCharacters.length > 0 ? ` ${secondaryCharacters.join(' ')}` : '';
      
      const environmentalContext = StoryVisualStateManager.getSettingForPrompt(sessionId);
      
      enhancedPrompt = `${characterDesc}${secondaryChars} ${processedText}${environmentalContext} consistent-face children-book bright-colors`;
      
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
    
    const defaultNegativePrompt = "bad anatomy, blurry, text, ugly";
    const finalNegativePrompt = negativePrompt 
      ? `${defaultNegativePrompt}, ${negativePrompt}`
      : defaultNegativePrompt;

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
                      steps: 3,
                      CFGScale: Math.max(1.5, CFGScale),
                      scheduler,
                      strength,
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