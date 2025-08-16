import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";

// Visual State Management (Server-side)
interface CharacterState {
  name: string;
  description: string;
  seed?: number;
  lastSeenPage?: number;
}

interface VisualState {
  characters: Map<string, CharacterState>;
  setting: {
    weather?: string;
    timeOfDay?: string;
    season?: string;
    location?: string;
    isLocked: boolean;
    lockedAtPage?: number;
  };
  currentLocation?: string;
  locationHistory: string[];
  recentCharacters: string[];
  pageCount: number;
}

const sessionStates = new Map<string, VisualState>();

function getOrCreateVisualState(sessionId: string): VisualState {
  if (!sessionStates.has(sessionId)) {
    sessionStates.set(sessionId, {
      characters: new Map(),
      setting: { isLocked: false },
      locationHistory: [],
      recentCharacters: [],
      pageCount: 0
    });
  }
  return sessionStates.get(sessionId)!;
}

function updateCharacterSeed(sessionId: string, name: string, description: string, seed: number, pageNumber: number) {
  const state = getOrCreateVisualState(sessionId);
  state.characters.set(name, { name, description, seed, lastSeenPage: pageNumber });
  
  // Track recent characters for pronoun resolution
  if (!state.recentCharacters.includes(name)) {
    state.recentCharacters.unshift(name);
    if (state.recentCharacters.length > 3) state.recentCharacters.pop();
  }
}

function resolvePronouns(sessionId: string, text: string): string {
  const state = sessionStates.get(sessionId);
  if (!state || state.recentCharacters.length === 0) return text;
  
  // Simple pronoun resolution for "they" to most recent character
  return text.replace(/\bthey\b/gi, state.recentCharacters[0]);
}

function updateSetting(sessionId: string, pageNumber: number, weather?: string, timeOfDay?: string, season?: string) {
  const state = getOrCreateVisualState(sessionId);
  
  // Lock setting after page 2 for consistency
  if (pageNumber > 2 && !state.setting.isLocked) {
    state.setting.isLocked = true;
    state.setting.lockedAtPage = pageNumber;
  }
  
  if (!state.setting.isLocked) {
    if (weather) state.setting.weather = weather;
    if (timeOfDay) state.setting.timeOfDay = timeOfDay;
    if (season) state.setting.season = season;
  }
}


function extractPrimaryScene(text: string): string {
  // Intelligent scene boundary detection - extract only the primary scene
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  
  if (sentences.length <= 1) return text;
  
  // Look for transition words that indicate scene changes
  const transitionPatterns = [
    /\b(later|then|after|next|meanwhile|suddenly|soon|eventually)\b/i,
    /\b(and then|after that|next thing|later on)\b/i,
    /\b(in the|at the|when|while)\b.*\b(bed|bedroom|sleep|night)\b/i, // bedroom scenes
    /\b(outside|playground|field|park|game|play|sport)\b/i // outdoor/activity scenes
  ];
  
  // Find the first sentence with a transition or scene indicator
  let primarySceneEnd = 0;
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const hasTransition = transitionPatterns.some(pattern => pattern.test(sentence));
    
    if (hasTransition && i > 0) {
      // Found a transition - stop at previous sentence to avoid mixing scenes
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

function getSettingForPrompt(sessionId: string): string {
  const state = sessionStates.get(sessionId);
  if (!state || !state.setting.isLocked) return '';
  
  const parts: string[] = [];
  if (state.setting.weather && state.setting.weather !== 'pleasant') parts.push(state.setting.weather);
  if (state.setting.timeOfDay && state.setting.timeOfDay !== 'daytime') parts.push(state.setting.timeOfDay);
  if (state.setting.season && state.setting.season !== 'any season') parts.push(state.setting.season);
  
  return parts.length > 0 ? `, ${parts.join(', ')}` : '';
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
      // NEW: Server-side visual state processing
      const state = getOrCreateVisualState(sessionId);
      state.pageCount = Math.max(state.pageCount, pageNumber);
      
      // Smart scene extraction - get primary scene only
      const processedText = extractPrimaryScene(resolvePronouns(sessionId, pageText));
      
      // Get existing character seed for consistency
      let characterSeed = state.characters.get(userInfo.name)?.seed;
      
      // Enhanced skin tone mapping
      const skinToneMap = {
        'pale': 'very light skin tone, pale complexion',
        'light': 'light skin tone, fair complexion', 
        'medium': 'medium skin tone, warm brown complexion',
        'olive': 'olive skin tone, Mediterranean complexion',
        'dark': 'dark skin tone, beautiful deep brown African/African American complexion'
      };
      
      const consistentSkinTone = skinToneMap[userInfo.avatar.skinTone] || 'medium skin tone';
      
      // Gender description based on skin tone
      let genderDesc;
      if (userInfo.avatar.skinTone === 'dark') {
        genderDesc = userInfo.avatar.type === 'boy' ? 'young Black boy' : userInfo.avatar.type === 'girl' ? 'young Black girl' : 'young Black child';
      } else {
        genderDesc = userInfo.avatar.type === 'boy' ? 'young boy' : userInfo.avatar.type === 'girl' ? 'young girl' : 'young child';
      }
      
      // Character consistency
      const characterConsistency = `${genderDesc} ${userInfo.name}, ${consistentSkinTone}${userInfo.avatar.skinTone === 'dark' ? ', African/African American' : ''}`;
      
      // Environmental context from visual state
      const environmentalContext = getSettingForPrompt(sessionId);
      
      // Build focused single-scene prompt server-side
      enhancedPrompt = `Children's book illustration: ${characterConsistency} ${processedText}${environmentalContext}. Single scene focus, ${userInfo.name} same ${consistentSkinTone}, consistent character design, vibrant colors, safe content, NO TEXT OR WORDS`;
      
      // Use existing seed if available
      if (characterSeed) {
        seed = characterSeed;
      }
      
      // Update setting if page has environmental cues
      if (processedText.includes('sunny') || processedText.includes('bright')) {
        updateSetting(sessionId, pageNumber, 'sunny');
      }
      if (processedText.includes('rain') || processedText.includes('stormy')) {
        updateSetting(sessionId, pageNumber, 'rainy');
      }
      if (processedText.includes('night') || processedText.includes('dark')) {
        updateSetting(sessionId, pageNumber, undefined, 'nighttime');
      }
      
      console.log(`🎨 Server-side enhanced prompt for ${userInfo.name} (page ${pageNumber}): "${processedText}" → enhanced`);
      
    } else {
      // LEGACY: Fallback to old prompt system
      enhancedPrompt = positivePrompt || "A beautiful children's book illustration showing a friendly character in a colorful, cheerful scene";
      
      if (characterName && characterDescription) {
        const skinToneMap = {
          'pale': 'very light skin tone, pale complexion',
          'light': 'light skin tone, fair complexion', 
          'medium': 'medium skin tone, warm brown complexion',
          'olive': 'olive skin tone, Mediterranean complexion',
          'dark': 'dark skin tone, beautiful deep brown African/African American complexion'
        };
        
        const consistentSkinTone = skinToneMap[skinTone] || 'medium skin tone';
        let genderDesc;
        if (skinTone === 'dark') {
          genderDesc = avatarType === 'boy' ? 'young Black boy' : avatarType === 'girl' ? 'young Black girl' : 'young child';
        } else {
          genderDesc = avatarType === 'boy' ? 'young boy' : avatarType === 'girl' ? 'young girl' : 'young child';
        }
        
        // Null safety for characterName
        const safeName = characterName || 'the character';
        const characterConsistency = `${genderDesc} ${safeName}, ${consistentSkinTone}${skinTone === 'dark' ? ', African/African American' : ''}`;
        enhancedPrompt = `Children's book art: ${characterConsistency} in ${enhancedPrompt}. CRITICAL: ${safeName} same ${consistentSkinTone}, consistent design, safe, NO TEXT`;
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
              
              // Store seed for character consistency (server-side)
              if (sessionId && userInfo && item.seed) {
                updateCharacterSeed(
                  sessionId,
                  userInfo.name,
                  `${userInfo.age} year old ${userInfo.avatar.type}`,
                  item.seed,
                  pageNumber
                );
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