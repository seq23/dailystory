import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

function analyzeContentForModel(pageText: string): string {
  if (!pageText) return "runware:100@1"; // Default fallback
  
  const text = pageText.toLowerCase();
  
  // Action/adventure scenes - use default high-quality model
  if (text.includes('adventure') || text.includes('running') || text.includes('jumping') || 
      text.includes('flying') || text.includes('chase') || text.includes('exploring')) {
    return "runware:100@1";
  }
  
  // Fantasy/magical scenes - might benefit from specialized models if available
  if (text.includes('magic') || text.includes('fairy') || text.includes('dragon') || 
      text.includes('castle') || text.includes('wizard') || text.includes('enchanted')) {
    return "runware:100@1"; // Keep default for now, can be enhanced with fantasy models
  }
  
  // Nature/outdoor scenes - default works well
  if (text.includes('forest') || text.includes('garden') || text.includes('mountain') || 
      text.includes('ocean') || text.includes('park') || text.includes('tree')) {
    return "runware:100@1";
  }
  
  // Indoor/home scenes - default is optimal
  if (text.includes('home') || text.includes('bedroom') || text.includes('kitchen') || 
      text.includes('living room') || text.includes('house') || text.includes('room')) {
    return "runware:100@1";
  }
  
  // Default to the proven high-quality model
  return "runware:100@1";
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
    return new Response('ok', { headers: corsHeaders })
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
      model = "runware:100@1",
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
      
      // Extract content from pageText server-side
      const processedText = resolvePronouns(sessionId, pageText);
      
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
      
      // Dynamic model selection based on content
      const selectedModel = analyzeContentForModel(processedText);
      if (selectedModel !== model) {
        console.log(`🎯 Model selection: "${processedText}" → ${selectedModel}`);
      }
      
      // Build complete enhanced prompt server-side
      enhancedPrompt = `Children's book art: ${characterConsistency} ${processedText}${environmentalContext}. CRITICAL: ${userInfo.name} same ${consistentSkinTone}, consistent design, safe, NO TEXT`;
      
      // Use existing seed if available
      if (characterSeed) {
        seed = characterSeed;
      }
      
      // Apply selected model
      model = selectedModel;
      
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
        
        const characterConsistency = `${genderDesc} ${characterName}, ${consistentSkinTone}${skinTone === 'dark' ? ', African/African American' : ''}`;
        enhancedPrompt = `Children's book art: ${characterConsistency} in ${enhancedPrompt}. CRITICAL: ${characterName} same ${consistentSkinTone}, consistent design, safe, NO TEXT`;
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
        resolve(new Response(
          JSON.stringify({ 
            success: false,
            error: "Request timeout",
            characterName: characterName || undefined,
            pageIndex
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        ));
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
          
          resolve(new Response(
            JSON.stringify({ 
              success: false,
              error: response.errorMessage || response.errors?.[0]?.message || "Generation failed",
              characterName: characterName || undefined,
              pageIndex
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          ));
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
              
              resolve(new Response(
                JSON.stringify({
                  success: true,
                  imageURL: item.imageURL,
                  seed: item.seed,
                  cost: item.cost,
                  NSFWContent: item.NSFWContent,
                  characterName: userInfo?.name || characterName || undefined,
                  pageIndex: pageNumber - 1,
                  prompt: enhancedPrompt
                }),
                { 
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
              ));
            }
          });
        }
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        ws.close();
        console.error("WebSocket error:", error);
        resolve(new Response(
          JSON.stringify({ 
            success: false,
            error: "WebSocket connection failed",
            characterName: characterName || undefined,
            pageIndex
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        ));
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
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        characterName: characterName || undefined,
        pageIndex: pageIndex || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})